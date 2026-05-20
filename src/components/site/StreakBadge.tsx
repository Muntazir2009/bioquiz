"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

const STORAGE_KEY = "bq.streak.v1";

type StreakState = {
  count: number;
  lastVisit: string;
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
  if (!prev) return { count: 1, lastVisit: today };
  const diff = daysBetween(prev.lastVisit, today);
  if (diff === 0) return prev;
  if (diff === 1) return { count: prev.count + 1, lastVisit: today };
  return { count: 1, lastVisit: today };
}

function readStreak(): StreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StreakState) : null;
  } catch {
    return null;
  }
}

export function StreakBadge() {
  const [state, setState] = useState<StreakState | null>(null);
  const [pulse, setPulse] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const prev = readStreak();
    const next = computeStreak(prev);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Use startTransition to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setState(next);
      if (!prev || prev.lastVisit !== next.lastVisit) {
        setPulse(true);
        setTimeout(() => setPulse(false), 1200);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!state) {
    return <div className="h-8 w-[88px] rounded-full border border-border bg-card/60" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative inline-flex h-8 items-center gap-2 overflow-hidden rounded-full border border-border bg-card pl-2.5 pr-3 text-[12px] font-medium text-foreground"
      title={`You've visited ${state.count} day${state.count === 1 ? "" : "s"} in a row`}
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
        <span className="text-muted-foreground">day{state.count === 1 ? "" : "s"}</span>
      </span>
    </motion.div>
  );
}
