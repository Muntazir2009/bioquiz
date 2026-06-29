"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { getStreak, setStreak, type StreakData } from "@/lib/firebase";

const STORAGE_KEY = "bq.streak.v2";
// Cap how long we'll wait for Firebase RTDB before falling back to local-only.
// Without this, a slow / blocked network leaves the badge spinning forever.
const REMOTE_TIMEOUT_MS = 4000;

type StreakState = {
  count: number;
  lastVisit: string;
  bestStreak: number;
};

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

function computeStreak(prev: StreakState | null): StreakState {
  const today = todayKey();
  if (!prev) return { count: 1, lastVisit: today, bestStreak: 1 };
  const diff = daysBetween(prev.lastVisit, today);
  if (diff === 0) return prev;
  if (diff === 1) {
    const newCount = prev.count + 1;
    return {
      count: newCount,
      lastVisit: today,
      bestStreak: Math.max(prev.bestStreak, newCount),
    };
  }
  return { count: 1, lastVisit: today, bestStreak: prev.bestStreak };
}

/** Merge local and remote streak data, taking the better one */
function mergeStreaks(
  local: StreakState | null,
  remote: StreakData | null,
): StreakState | null {
  if (!local && !remote) return null;
  if (!local) return { ...remote!, bestStreak: remote!.bestStreak || remote!.count };
  if (!remote) return local;

  // If remote has a better streak or more recent activity, prefer it
  const localDate = local.lastVisit;
  const remoteDate = remote.lastVisit;
  const localBest = Math.max(local.bestStreak, local.count);
  const remoteBest = Math.max(remote.bestStreak || 0, remote.count);

  // If remote is more recent AND has a higher count, use remote
  if (remoteDate > localDate && remote.count >= local.count) {
    return { ...remote, bestStreak: remoteBest };
  }

  // If local is more recent, use local but keep best from remote
  if (localDate >= remoteDate) {
    return {
      ...local,
      bestStreak: Math.max(localBest, remoteBest),
    };
  }

  // Otherwise, take the one with the higher count
  if (remote.count > local.count) {
    return { ...remote, bestStreak: remoteBest };
  }
  return { ...local, bestStreak: Math.max(localBest, remoteBest) };
}

function readStreak(): StreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StreakState;
    // Migrate from v1 format
    const v1raw = localStorage.getItem("bq.streak.v1");
    if (v1raw) {
      const v1 = JSON.parse(v1raw) as { count: number; lastVisit: string };
      return { count: v1.count, lastVisit: v1.lastVisit, bestStreak: v1.count };
    }
    return null;
  } catch {
    return null;
  }
}

/** Get the chat user's UID from localStorage (set by chat-widget.js) */
function getChatUid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem("bq_chat_uid") ||
      localStorage.getItem("bq_uid") ||
      null
    );
  } catch {
    return null;
  }
}

export function StreakBadge() {
  const [state, setState] = useState<StreakState | null>(null);
  const [pulse, setPulse] = useState(false);
  const initialized = useRef(false);
  const syncDone = useRef(false);

  const syncToFirebase = useCallback(
    async (data: StreakState) => {
      const uid = getChatUid();
      if (!uid) return;
      try {
        await setStreak(uid, {
          count: data.count,
          lastVisit: data.lastVisit,
          bestStreak: data.bestStreak,
        });
      } catch {
        // Silently fail
      }
    },
    [],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      // 1. Read local streak
      const localStreak = readStreak();

      // 2. Try to sync with Firebase — but race against a timeout so a slow
      //    network never leaves the badge in a "loading" state forever.
      const uid = getChatUid();
      if (uid && !syncDone.current) {
        syncDone.current = true;
        try {
          const remoteStreak = await Promise.race([
            getStreak(uid),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), REMOTE_TIMEOUT_MS)),
          ]);
          const merged = mergeStreaks(localStreak, remoteStreak);
          const next = computeStreak(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setState(next);

          if (
            !merged ||
            merged.lastVisit !== next.lastVisit ||
            merged.count !== next.count
          ) {
            setPulse(true);
            setTimeout(() => setPulse(false), 1200);
          }

          // Sync back to Firebase (best-effort, no await)
          syncToFirebase(next);
        } catch {
          // Fall back to local-only
          const next = computeStreak(localStreak);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setState(next);
          if (!localStreak || localStreak.lastVisit !== next.lastVisit) {
            setPulse(true);
            setTimeout(() => setPulse(false), 1200);
          }
        }
      } else {
        // No UID — local-only mode
        const next = computeStreak(localStreak);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setState(next);
        if (!localStreak || localStreak.lastVisit !== next.lastVisit) {
          setPulse(true);
          setTimeout(() => setPulse(false), 1200);
        }
      }
    };

    // Use setTimeout to avoid blocking hydration
    const timer = setTimeout(init, 0);
    return () => clearTimeout(timer);
  }, [syncToFirebase]);

  // Placeholder matches the final badge dimensions closely (h-8, ~80–96px wide)
  // so there's no visible layout shift when the real badge mounts.
  if (!state) {
    return <div className="h-8 w-[84px] rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(0,0,0,0.06)' }} aria-hidden />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative inline-flex h-8 items-center gap-2 overflow-hidden rounded-full pl-2.5 pr-3 text-[12px] font-medium"
      style={{
        background: 'rgba(255,255,255,0.50)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,0,0,0.06)',
        color: '#1C1C1C',
      }}
      title={`You've visited ${state.count} day${state.count === 1 ? "" : "s"} in a row (best: ${state.bestStreak})`}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120px circle at 20% 50%, oklch(0.72 0.18 50 / 0.18), transparent 60%)",
        }}
      />
      <span className="relative grid h-5 w-5 place-items-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.78 0.18 55 / 0.55), transparent 70%)",
          }}
          animate={pulse ? { scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] } : { opacity: 0.5 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        <Flame
          className="relative h-3.5 w-3.5"
          style={{ color: "oklch(0.82 0.16 70)" }}
          strokeWidth={2.5}
        />
      </span>
      <span className="relative tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state.count}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {state.count}
          </motion.span>
        </AnimatePresence>{" "}
        <span style={{ color: '#6B6560' }}>day{state.count === 1 ? "" : "s"}</span>
      </span>
    </motion.div>
  );
}
