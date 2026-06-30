"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
 *  STEALTH CHAT MODE — DM disguised as a tech news article
 *  ───────────────────────────────────────────────────────────────
 *  Reuses from chat-widget.js (single source of truth):
 *    - FIREBASE_CONFIG
 *    - localStorage UID key ('bq_chat_uid') — identity shared with widget
 *    - localStorage username key ('bq_chat_uname')
 *    - DM path:  bq_dms/{dmId}/messages/
 *    - Message schema: { uid, uname, text, ts }
 *    - dmKey(a,b) = [a,b].sort().join('__')
 *    - Same push() structure for replies
 *
 *  ─── DMID RESOLUTION (in priority order) ───
 *    1. ?dm=<dmId>           query param  (e.g. /news?dm=u123__u456)
 *    2. ?with=<partnerUid>   query param  (e.g. /news?with=u456def)
 *    3. STEALTH_DM_ID        constant below (if non-null)
 *    4. PARTNER_UID          constant below (combined with your localStorage UID)
 *
 *  Your own UID is ALWAYS auto-read from localStorage (bq_chat_uid),
 *  so you never need to hardcode it. Just share a URL like:
 *    /news?with=u9z8y7x6w
 *  and the page computes dmKey(you, partner) automatically.
 * ═══════════════════════════════════════════════════════════════ */

// ─── MANUAL CONFIG (optional fallbacks) ─────────────────────────
const STEALTH_DM_ID: string | null = null;   // e.g. "u123__u456"
const PARTNER_UID = "";                       // e.g. "u9z8y7x6w"
// ─── /MANUAL CONFIG ────────────────────────────────────────────

// Same Firebase config as chat-widget.js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain: "bioquiz-chat.firebaseapp.com",
  databaseURL: "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bioquiz-chat",
  storageBucket: "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId: "1:616382882153:web:9c8a32401be847468d1df8",
};

const LS_UID = "bq_chat_uid";
const LS_NAME = "bq_chat_uname";
const MAX_MSG = 10;

function dmKey(a: string, b: string) {
  return [a, b].sort().join("__");
}

function genUID() {
  const id = "u" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  try { localStorage.setItem(LS_UID, id); } catch {}
  return id;
}

function loadFirebaseSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).firebase?.database) return resolve();
    const s1 = document.createElement("script");
    s1.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js";
      s2.onload = () => resolve();
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    s1.onerror = reject;
    document.head.appendChild(s1);
  });
}

function escHtml(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function linkify(s: string) {
  return s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

type ArticleMsg = { key: string; text: string; uid: string; uname?: string; ts: number };
type MergedPara = { key: string; text: string; uid: string; ts: number; msgCount: number };
type DmPartner = { uid: string; name: string; dmId: string; lastTs: number };

type Separator = "space" | "period" | "emdash" | "pipe";

const SEPARATOR_MAP: Record<Separator, string> = {
  space: " ",
  period: ". ",
  emdash: " — ",
  pipe: " | ",
};

// Strip emoji characters from text
function stripEmojis(s: string): string {
  return s
    // Emoji ranges (pictographs, symbols, dingbats, etc.)
    .replace(/[\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F300}-\u{1FAD6}\u{1FB00}-\u{1FBFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}]/gu, "")
    // Variation selectors
    .replace(/\uFE0F/g, "")
    // Zero-width joiner (often used in compound emoji)
    .replace(/\u200D/g, "")
    // Collapse multiple spaces left behind
    .replace(/  +/g, " ")
    .trim();
}

// Merge consecutive messages from the SAME sender into one paragraph,
// using the specified separator between merged messages.
function mergeMessages(msgs: ArticleMsg[], sep: Separator = "space", stripEmoji: boolean = false): MergedPara[] {
  const sepStr = SEPARATOR_MAP[sep] || " ";
  const out: MergedPara[] = [];
  for (const m of msgs) {
    let text = (m.text || "").trim();
    if (!text) continue;
    if (stripEmoji) text = stripEmojis(text);
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.uid === m.uid) {
      last.text += sepStr + text;
      last.ts = m.ts;
      last.msgCount++;
    } else {
      out.push({ key: m.key, text, uid: m.uid, ts: m.ts, msgCount: 1 });
    }
  }
  return out;
}

export default function NewsPage() {
  const [ready, setReady] = useState(false);
  const [msgs, setMsgs] = useState<ArticleMsg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openParaKey, setOpenParaKey] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [partners, setPartners] = useState<DmPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<DmPartner | null>(null);
  const [partnerPickerOpen, setPartnerPickerOpen] = useState(false);
  const [partnersLoaded, setPartnersLoaded] = useState(false);
  const [hideConversation, setHideConversation] = useState(false);
  const [hideEmojis, setHideEmojis] = useState(false);
  const [separator, setSeparator] = useState<Separator>("period");
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const typingListenerRef = useRef<any>(null);

  const dbRef = useRef<any>(null);
  const msgListenerRef = useRef<any>(null);
  const dmIndexRef = useRef<any>(null);
  const dmMetaRefsRef = useRef<Record<string, any>>({});
  const uidRef = useRef<string>("");
  const unameRef = useRef<string>("");
  const dmIdRef = useRef<string>("");
  const partnersRef = useRef<Record<string, DmPartner>>({}); // dmId → partner
  const paraContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);
  const cancelledRef = useRef(false);

  // Merge consecutive same-sender messages into single paragraphs,
  // using the user-selected separator. Strip emojis if enabled.
  const mergedParas = useMemo(
    () => mergeMessages(msgs, separator, hideEmojis),
    [msgs, separator, hideEmojis]
  );

  // Filter paragraphs by search query (case-insensitive)
  const filteredParas = useMemo(() => {
    if (!searchQuery.trim()) return mergedParas;
    const q = searchQuery.toLowerCase();
    return mergedParas.filter((p) => p.text.toLowerCase().includes(q));
  }, [mergedParas, searchQuery]);

  // Dynamic reading time based on actual word count (~200 wpm)
  const readingTimeMin = useMemo(() => {
    const words = mergedParas.reduce((n, p) => n + p.text.split(/\s+/).length, 0);
    return Math.max(1, Math.ceil(words / 200));
  }, [mergedParas]);

  // Load display preferences from localStorage on mount
  useEffect(() => {
    try {
      const hc = localStorage.getItem("stealth_hide_conversation");
      if (hc === "1") setHideConversation(true);
      const he = localStorage.getItem("stealth_hide_emojis");
      if (he === "1") setHideEmojis(true);
      const sp = localStorage.getItem("stealth_separator") as Separator | null;
      if (sp && ["space", "period", "emdash", "pipe"].includes(sp)) setSeparator(sp);
    } catch {}
  }, []);

  // Persist preferences
  useEffect(() => {
    try { localStorage.setItem("stealth_hide_conversation", hideConversation ? "1" : "0"); } catch {}
  }, [hideConversation]);
  useEffect(() => {
    try { localStorage.setItem("stealth_hide_emojis", hideEmojis ? "1" : "0"); } catch {}
  }, [hideEmojis]);
  useEffect(() => {
    try { localStorage.setItem("stealth_separator", separator); } catch {}
  }, [separator]);

  // ─── Keyboard shortcuts ───
  // h = toggle hide conversation, e = toggle emojis, / = focus search, Esc = clear search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape" && searchInputRef.current?.value) {
          setSearchQuery("");
          if (searchInputRef.current) searchInputRef.current.value = "";
          searchInputRef.current?.blur();
        }
        return;
      }
      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        setHideConversation((v) => !v);
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setHideEmojis((v) => !v);
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
          if (searchInputRef.current) searchInputRef.current.value = "";
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchQuery]);

  // ─── Attach to a specific DM thread (used for initial load + switching) ───
  const attachDm = useCallback((dmId: string) => {
    if (!dbRef.current) return;

    // Detach old listener
    try { msgListenerRef.current?.off(); } catch {}
    msgListenerRef.current = null;

    // Clear state
    setMsgs([]);
    setReady(false);
    setError(null);
    prevMsgCountRef.current = 0;
    dmIdRef.current = dmId;

    const ref = dbRef.current.ref(`bq_dms/${dmId}/messages`).limitToLast(MAX_MSG);

    ref.once("value", (snap: any) => {
      if (cancelledRef.current) return;
      const val = snap.val() || {};
      const arr: ArticleMsg[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        key: k, text: v.text || "", uid: v.uid || "", uname: v.uname || "", ts: v.ts || 0,
      }));
      arr.sort((a, b) => a.ts - b.ts);
      setMsgs(arr);
      prevMsgCountRef.current = arr.length;
      setReady(true);
    });

    ref.on("child_added", (snap: any) => {
      if (cancelledRef.current) return;
      const v = snap.val();
      if (!v) return;
      setMsgs((prev) => {
        if (prev.some((m) => m.key === snap.key)) return prev;
        const next = [...prev, {
          key: snap.key, text: v.text || "", uid: v.uid || "",
          uname: v.uname || "", ts: v.ts || 0,
        }].sort((a, b) => a.ts - b.ts);
        if (next.length > prevMsgCountRef.current && v.uid !== uidRef.current) {
          // New message from partner — no visual pulse, just append silently.
          // Articles don't flash when they update.
        }
        prevMsgCountRef.current = next.length;
        return next;
      });
    });

    ref.on("child_removed", (snap: any) => {
      if (cancelledRef.current) return;
      setMsgs((prev) => prev.filter((m) => m.key !== snap.key));
    });

    ref.on("child_changed", (snap: any) => {
      if (cancelledRef.current) return;
      const v = snap.val();
      if (!v) return;
      setMsgs((prev) => prev.map((m) =>
        m.key === snap.key ? { ...m, text: v.text || m.text, ts: v.ts || m.ts } : m
      ));
    });

    msgListenerRef.current = ref;

    // ─── Typing indicator (reuses bq_dm_typing/{dmId}/{uid} from the widget) ───
    // Show a subtle "developing story" indicator when partner is typing.
    try { typingListenerRef.current?.off(); } catch {}
    const partnerUid = selectedPartner?.uid;
    if (partnerUid) {
      const typingRef = dbRef.current.ref(`bq_dm_typing/${dmId}/${partnerUid}`);
      typingListenerRef.current = typingRef;
      typingRef.on("value", (snap: any) => {
        if (cancelledRef.current) return;
        const val = snap.val();
        // Widget sets typing to a timestamp; if within last 3s, partner is typing
        setPartnerTyping(!!val && typeof val === "number" && Date.now() - val < 3000);
      });
    }
  }, [selectedPartner]);

  // ─── Bootstrap: load SDK, resolve UID, build partner list, attach to default DM ───
  useEffect(() => {
    cancelledRef.current = false;

    (async () => {
      try {
        // ─── Resolve UID from localStorage (auto) ───
        let uid = "";
        try { uid = localStorage.getItem(LS_UID) || ""; } catch {}
        if (!uid) uid = genUID();
        uidRef.current = uid;

        try { unameRef.current = localStorage.getItem(LS_NAME) || "Reader"; } catch {}
        if (!unameRef.current) unameRef.current = "Reader";

        await loadFirebaseSDK();
        if (cancelledRef.current) return;

        if (!(window as any).firebase?.apps?.length) {
          (window as any).firebase.initializeApp(FIREBASE_CONFIG);
        }
        dbRef.current = (window as any).firebase.database();

        // ─── Resolve @muntazir's UID (default partner) ───
        let muntazirUid: string | null = null;
        try {
          const snap = await dbRef.current.ref("bq_usernames/muntazir").once("value");
          muntazirUid = snap.val() || null;
        } catch {}

        // ─── Build partner list from bq_user_dms/{uid} index ───
        const idxRef = dbRef.current.ref(`bq_user_dms/${uid}`);
        dmIndexRef.current = idxRef;

        const attachMeta = (dmId: string) => {
          if (dmMetaRefsRef.current[dmId]) return;
          const mref = dbRef.current.ref(`bq_dms/${dmId}/meta`);
          dmMetaRefsRef.current[dmId] = mref;
          mref.on("value", (ms: any) => {
            if (cancelledRef.current) return;
            const meta = ms.val();
            if (!meta) return;
            // Verify this DM actually involves the current user
            if (meta.p1 !== uid && meta.p2 !== uid) {
              delete partnersRef.current[dmId];
              setPartners(Object.values(partnersRef.current).sort((a, b) => b.lastTs - a.lastTs));
              return;
            }
            // Identify the partner (the other UID)
            const partnerUid = meta.p1 === uid ? meta.p2 : meta.p1;
            const partnerName = meta.p1 === uid ? meta.n2 : meta.n1;
            if (!partnerUid) return;
            partnersRef.current[dmId] = {
              uid: partnerUid,
              name: partnerName || partnerUid.slice(0, 8),
              dmId,
              lastTs: meta.lastTs || 0,
            };
            setPartners(Object.values(partnersRef.current).sort((a, b) => b.lastTs - a.lastTs));
            setPartnersLoaded(true);

            // If no partner selected yet, pick the default now
            setSelectedPartner((prev) => {
              if (prev) return prev;
              const list = Object.values(partnersRef.current).sort((a, b) => b.lastTs - a.lastTs);

              // Priority 1: ?with= query param
              const params = new URLSearchParams(window.location.search);
              if (params.get("with")) {
                const wu = params.get("with")!;
                const match = list.find((p) => p.uid === wu);
                if (match) { attachDm(match.dmId); return match; }
              }
              // Priority 2: ?dm= query param
              if (params.get("dm")) {
                const dm = params.get("dm")!;
                const match = list.find((p) => p.dmId === dm);
                if (match) { attachDm(match.dmId); return match; }
              }
              // Priority 3: @muntazir (if in list)
              if (muntazirUid) {
                const match = list.find((p) => p.uid === muntazirUid);
                if (match) { attachDm(match.dmId); return match; }
              }
              // Priority 4: STEALTH_DM_ID constant
              if (STEALTH_DM_ID) {
                const match = list.find((p) => p.dmId === STEALTH_DM_ID);
                if (match) { attachDm(match.dmId); return match; }
              }
              // Priority 5: PARTNER_UID constant
              if (PARTNER_UID) {
                const match = list.find((p) => p.uid === PARTNER_UID);
                if (match) { attachDm(match.dmId); return match; }
              }
              // Priority 6: most recent partner
              if (list.length > 0) { attachDm(list[0].dmId); return list[0]; }
              return prev;
            });
          });
        };

        idxRef.on("child_added", (s: any) => { if (!cancelledRef.current) attachMeta(s.key); });
        idxRef.on("child_removed", (s: any) => {
          if (cancelledRef.current) return;
          const dmId = s.key;
          if (dmMetaRefsRef.current[dmId]) {
            try { dmMetaRefsRef.current[dmId].off(); } catch {}
            delete dmMetaRefsRef.current[dmId];
          }
          delete partnersRef.current[dmId];
          setPartners(Object.values(partnersRef.current).sort((a, b) => b.lastTs - a.lastTs));
        });

        // Fallback: if no partners load within 4s, show empty state but no error
        // (user might just have no DMs yet)
        setTimeout(() => {
          if (cancelledRef.current) return;
          setPartnersLoaded(true);
        }, 4000);
      } catch (e: any) {
        console.error("[stealth] init error:", e);
        setError(e?.message || "Failed to load article.");
        setPartnersLoaded(true);
      }
    })();

    return () => {
      cancelledRef.current = true;
      try { msgListenerRef.current?.off(); } catch {}
      try { typingListenerRef.current?.off(); } catch {}
      try { dmIndexRef.current?.off(); } catch {}
      Object.values(dmMetaRefsRef.current).forEach((r: any) => { try { r.off(); } catch {} });
      dmMetaRefsRef.current = {};
    };
  }, [attachDm]);

  // Auto-scroll when new paragraphs arrive (only if user near bottom)
  useEffect(() => {
    if (!paraContainerRef.current) return;
    const nearBottom = window.innerHeight - paraContainerRef.current.getBoundingClientRect().bottom > -200;
    if (nearBottom) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [msgs]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.body.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sendReply = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !dbRef.current || !dmIdRef.current) return;
    setSending(true);
    try {
      const p = {
        uid: uidRef.current,
        uname: unameRef.current || "Reader",
        text: trimmed.slice(0, 2000),
        ts: Date.now(),
      };
      dbRef.current.ref(`bq_dms/${dmIdRef.current}/messages`).push(p);
      const metaRef = dbRef.current.ref(`bq_dms/${dmIdRef.current}/meta`);
      metaRef.transaction((m: any) => {
        m = m || {};
        m.lastMsg = trimmed.slice(0, 80);
        m.lastTs = Date.now();
        return m;
      });
    } catch (e) {
      console.error("[stealth] send error:", e);
    } finally {
      setSending(false);
    }
  }, []);

  const onParaClick = useCallback((key: string) => {
    setOpenParaKey((prev) => (prev === key ? null : key));
  }, []);

  const onReplyKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const val = (e.target as HTMLTextAreaElement).value;
      if (val.trim()) {
        sendReply(val);
        (e.target as HTMLTextAreaElement).value = "";
        setOpenParaKey(null);
      }
    } else if (e.key === "Escape") {
      setOpenParaKey(null);
    }
  }, [sendReply]);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="stealth-article">
      {/* Reading progress bar */}
      <div className="stealth-progress" style={{ width: `${scrollPct}%` }} />

      {/* ─── Publication header ─── */}
      <header className="stealth-masthead">
        <div className="stealth-masthead-inner">
          <div className="stealth-masthead-top">
            <span className="stealth-masthead-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="stealth-masthead-edition">Digital Edition</span>
          </div>
          <div className="stealth-masthead-rule" />
          <div className="stealth-pub-name">The Tech Dispatch</div>
          <div className="stealth-masthead-sub">Reporting on systems, software, and the people who build them</div>
          <div className="stealth-masthead-rule stealth-masthead-rule-double" />
        </div>
      </header>

      {/* ─── Article body ─── */}
      <main className="stealth-article-body" ref={paraContainerRef}>
        <div className="stealth-article-inner">

          <div className="stealth-category-row">
            <span className="stealth-category">Artificial Intelligence</span>
            <span className="stealth-category-divider">·</span>
            <span className="stealth-category-sub">Field Notes</span>
          </div>

          <h1 className="stealth-headline">
            The Quiet Shift Toward Local Inference
          </h1>

          <p className="stealth-deck">
            As models shrink and hardware catches up, the conversation around AI is moving
            from the cloud to the device. What we're really talking about, though, is who
            controls the stack — and what disappears when no one is watching the server.
          </p>

          <div className="stealth-byline">
            <div className="stealth-byline-left">
              <span className="stealth-byline-author">By <strong>Editorial Staff</strong></span>
              <span className="stealth-byline-meta">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·
                {" "}{readingTimeMin} min read
              </span>
            </div>
            <div className="stealth-byline-right">
              <span className="stealth-byline-updated">
                Updated {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* ─── Contributor selector (disguised as editorial element) ─── */}
          {partners.length > 0 && (
            <div className="stealth-contributor-row">
              <span className="stealth-contributor-label">In conversation with</span>
              <div className={`stealth-contributor-select ${partnerPickerOpen ? "stealth-contributor-select-open" : ""}`}>
                <button
                  type="button"
                  className="stealth-contributor-trigger"
                  onClick={() => setPartnerPickerOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={partnerPickerOpen}
                >
                  <span className="stealth-contributor-name">
                    @{selectedPartner?.name || "—"}
                  </span>
                  <span className="stealth-contributor-caret">▾</span>
                </button>
                {partnerPickerOpen && (
                  <>
                    <div className="stealth-contributor-backdrop" onClick={() => setPartnerPickerOpen(false)} />
                    <ul className="stealth-contributor-menu" role="listbox">
                      {partners.map((p) => (
                        <li key={p.dmId}>
                          <button
                            type="button"
                            className={`stealth-contributor-option ${selectedPartner?.dmId === p.dmId ? "stealth-contributor-option-active" : ""}`}
                            onClick={() => {
                              setSelectedPartner(p);
                              setPartnerPickerOpen(false);
                              attachDm(p.dmId);
                            }}
                            role="option"
                            aria-selected={selectedPartner?.dmId === p.dmId}
                          >
                            <span className="stealth-contributor-option-name">@{p.name}</span>
                            {p.lastTs > 0 && (
                              <span className="stealth-contributor-option-meta">
                                {new Date(p.lastTs).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          <hr className="stealth-rule" />

          {/* ─── Intro paragraphs (always visible, sets the scene) ─── */}
          <div className="stealth-paragraph-block">
            <p className="stealth-paragraph stealth-paragraph-lead">
              For the better part of a decade, the assumption has been straightforward: if you want
              serious inference, you route it through a server. The models were too large, the
              memory footprint too demanding, and the hardware in a consumer laptop simply wasn't
              built for the workload. That calculus is shifting — not all at once, but faster than
              the infrastructure around it can adapt.
            </p>
          </div>
          <div className="stealth-paragraph-block">
            <p className="stealth-paragraph">
              The change isn't driven by a single breakthrough. It's the compounding effect of
              smaller architectures, better quantization, and GPUs that quietly crossed a threshold
              sometime in the last eighteen months. What used to require a data center now runs —
              not perfectly, but usably — on hardware that fits in a backpack.
            </p>
          </div>

          {/* ─── Reading preferences bar (disguised controls) ─── */}
          {!hideConversation && (
            <div className="stealth-controls">
              <span className="stealth-controls-label">Reading preferences</span>
              <div className="stealth-controls-group">
                <span className="stealth-controls-key">Text flow</span>
                <div className="stealth-controls-segments">
                  {(["space", "period", "emdash", "pipe"] as Separator[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`stealth-seg ${separator === s ? "stealth-seg-active" : ""}`}
                      onClick={() => setSeparator(s)}
                      title={`Separate messages with ${s === "space" ? "a space" : s === "period" ? "a period" : s === "emdash" ? "an em-dash" : "a pipe"}`}
                    >
                      {s === "space" ? "␣" : s === "period" ? "." : s === "emdash" ? "—" : "|"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="stealth-controls-group">
                <span className="stealth-controls-key">Emojis</span>
                <button
                  type="button"
                  className={`stealth-toggle ${hideEmojis ? "stealth-toggle-off" : "stealth-toggle-on"}`}
                  onClick={() => setHideEmojis((v) => !v)}
                >
                  {hideEmojis ? "Hidden" : "Shown"}
                </button>
              </div>
              <div className="stealth-controls-group stealth-search-group">
                <span className="stealth-controls-key">Find</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="stealth-search-input"
                  placeholder="Search article…"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); (e.target as HTMLInputElement).value = ""; (e.target as HTMLInputElement).blur(); } }}
                />
                {searchQuery && (
                  <span className="stealth-search-count">
                    {filteredParas.length}/{mergedParas.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="stealth-hide-btn"
                onClick={() => setHideConversation(true)}
                title="Hide the conversation — show article filler instead (shortcut: H)"
              >
                Hide contributions
              </button>
            </div>
          )}

          {/* ─── Show-conversation button (only when hidden) ─── */}
          {hideConversation && (
            <div className="stealth-controls stealth-controls-minimal">
              <button
                type="button"
                className="stealth-hide-btn stealth-hide-btn-show"
                onClick={() => setHideConversation(false)}
              >
                Show contributions
              </button>
            </div>
          )}

          {/* ─── Subheadline introducing the conversation section ─── */}
          <h2 className="stealth-subheadline">
            The 8-gigabyte threshold
          </h2>

          {/* ─── Typing indicator (disguised as "developing story" note) ─── */}
          {partnerTyping && !hideConversation && (
            <p className="stealth-developing">
              <span className="stealth-developing-dot" />
              <span className="stealth-developing-text">This story is developing — further contributions are in progress.</span>
            </p>
          )}

          {/* ─── Search results count ─── */}
          {searchQuery && !hideConversation && filteredParas.length === 0 && (
            <p className="stealth-paragraph stealth-editorial-note">
              No paragraphs match "{searchQuery}". Try a different term.
            </p>
          )}

          {error && (
            <p className="stealth-paragraph stealth-paragraph-error">{error}</p>
          )}

          {/* Loading state */}
          {!ready && !error && !hideConversation && (
            <>
              <p className="stealth-paragraph stealth-loading">
                <span className="stealth-loading-line" style={{ width: "96%" }} />
              </p>
              <p className="stealth-paragraph stealth-loading">
                <span className="stealth-loading-line" style={{ width: "88%" }} />
                <span className="stealth-loading-line" style={{ width: "92%" }} />
              </p>
              <p className="stealth-paragraph stealth-loading">
                <span className="stealth-loading-line" style={{ width: "100%" }} />
                <span className="stealth-loading-line" style={{ width: "74%" }} />
              </p>
            </>
          )}

          {/* Empty state */}
          {ready && msgs.length === 0 && !error && !hideConversation && (
            <p className="stealth-paragraph stealth-editorial-note">
              {partners.length === 0 && partnersLoaded
                ? "No conversations yet. Start a DM from the main chat widget, then return here — it will appear as a contributed paragraph."
                : "This piece is still developing. Notes from contributors will appear here as the conversation unfolds — read on, or tap any paragraph to add your own annotation."}
            </p>
          )}

          {/* ─── HIDDEN STATE: filler paragraphs (no DM content, no interactivity) ─── */}
          {hideConversation && (
            <>
              <div className="stealth-paragraph-block">
                <p className="stealth-paragraph">
                  The practical implications are still being worked out. On one hand, local inference
                  eliminates the round-trip latency that has defined every cloud-based assistant
                  since the category emerged. On the other, it redistributes the cost — from a
                  predictable API bill to a one-time hardware purchase that not everyone can afford.
                </p>
              </div>
              <div className="stealth-paragraph-block">
                <p className="stealth-paragraph">
                  What's clearer is the philosophical shift. When inference happens on a device you
                  own, the data never leaves. There's no server log, no training-pipeline rerun,
                  no quiet retention policy. The model is a tool you run, not a service you query.
                </p>
              </div>
              <div className="stealth-paragraph-block">
                <p className="stealth-paragraph">
                  Whether that matters to most users is an open question. But it matters to the
                  people building the next layer of the stack — and they're the ones writing the
                  paragraphs that follow.
                </p>
              </div>
            </>
          )}

          {/* ─── DM messages as merged article paragraphs (only when not hidden) ─── */}
          {!hideConversation && filteredParas.map((p, i) => (
            <div key={p.key} className="stealth-paragraph-block">
              <p
                className={`stealth-paragraph ${openParaKey === p.key ? "stealth-paragraph-active" : ""} ${i === 0 && !searchQuery ? "stealth-paragraph-lead-dm" : ""}`}
                onClick={() => onParaClick(p.key)}
                tabIndex={0}
                role="button"
                aria-label="Paragraph — click to annotate"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onParaClick(p.key);
                  }
                }}
                dangerouslySetInnerHTML={{ __html: linkify(escHtml(p.text)) }}
              />

              {openParaKey === p.key && (
                <div className="stealth-annotation">
                  <div className="stealth-annotation-label">
                    <span className="stealth-annotation-marker">†</span>
                    <span className="stealth-annotation-title">Add a note</span>
                  </div>
                  <textarea
                    className="stealth-annotation-input"
                    placeholder="Type your note and press Enter — Shift+Enter for a new line."
                    autoFocus
                    rows={2}
                    onKeyDown={onReplyKeyDown}
                    disabled={sending}
                  />
                  <div className="stealth-annotation-hint">
                    {sending ? "Saving…" : "Press Enter to submit · Esc to close"}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ─── Section break ornament ─── */}
          {((!hideConversation && ready && msgs.length > 0) || hideConversation) && (
            <div className="stealth-section-break">❦</div>
          )}

          {/* ─── Closing analysis (always visible, makes article feel complete) ─── */}
          <h2 className="stealth-subheadline">What comes next</h2>
          <div className="stealth-paragraph-block">
            <p className="stealth-paragraph">
              The trajectory is clear enough: models will keep shrinking, hardware will keep
              improving, and the gap between what's possible in the cloud and what's possible on a
              laptop will keep narrowing. What's less clear is how the ecosystem around it evolves —
              who builds the tooling, who sets the standards, and whether the open-source community
              can keep pace with the resources of a handful of large labs.
            </p>
          </div>
          <div className="stealth-paragraph-block">
            <p className="stealth-paragraph">
              For now, the most interesting work is happening in the margins — in conversations
              between researchers, in pull requests on quiet repositories, in the kind of
              back-and-forth that doesn't make it into press releases. The piece above is a record
              of one such conversation. It will continue to develop as new contributions arrive.
            </p>
          </div>

          {ready && msgs.length > 0 && !hideConversation && (
            <p className="stealth-signoff">
              <em>The piece remains open. Further contributions will appear above as they arrive.</em>
            </p>
          )}

          {/* ─── Keyboard shortcuts hint ─── */}
          {!hideConversation && (
            <div className="stealth-shortcuts">
              Shortcuts: <kbd>H</kbd> hide contributions · <kbd>E</kbd> toggle emojis · <kbd>/</kbd> search · <kbd>Esc</kbd> clear
            </div>
          )}

          {/* ─── Related coverage ─── */}
          <div className="stealth-related">
            <div className="stealth-related-label">Related coverage</div>
            <ul className="stealth-related-list">
              <li><a href="#" onClick={(e) => e.preventDefault()}>The cost of inference, revisited</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Why quantization isn't just compression</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Edge devices and the privacy dividend</a></li>
            </ul>
          </div>

        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="stealth-footer">
        <div className="stealth-footer-inner">
          <div className="stealth-footer-pub">The Tech Dispatch</div>
          <div className="stealth-footer-meta">
            <span>© {new Date().getFullYear()}</span>
            <span className="stealth-dot">·</span>
            <span>All rights reserved</span>
            <span className="stealth-dot">·</span>
            <a href="/" className="stealth-footer-link">Return to front page</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        /* Override the home page's scroll lock — /news must be scrollable */
        html, body { overflow: auto !important; }

        .stealth-article {
          --stealth-bg: #fbfaf6;
          --stealth-bg-warm: #f5f3ec;
          --stealth-text: #1a1a1a;
          --stealth-text-soft: #3d3d3d;
          --stealth-text-mute: #7a7a72;
          --stealth-accent: #b8390e;
          --stealth-accent-soft: #e8d5c4;
          --stealth-rule: #d8d4c8;
          --stealth-rule-soft: #e8e4d8;
          --stealth-masthead-bg: #141414;
          --stealth-masthead-text: #fbfaf6;
          --stealth-highlight: #fff3c4;
          --stealth-highlight-border: #e8c846;
          --stealth-annotation-bg: #f8f5ed;
          --stealth-annotation-border: #d8d4c8;
          --stealth-serif: Georgia, "Times New Roman", "Songti SC", "Noto Serif SC", serif;
          --stealth-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;

          background: var(--stealth-bg);
          color: var(--stealth-text);
          font-family: var(--stealth-serif);
          font-size: 19px;
          line-height: 1.78;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          min-height: 100vh;
        }

        /* ── Reading progress bar ── */
        .stealth-progress {
          position: fixed;
          top: 0; left: 0;
          height: 2px;
          background: var(--stealth-accent);
          z-index: 100;
          transition: width 0.1s ease-out;
        }

        /* ── Masthead ── */
        .stealth-masthead {
          background: var(--stealth-masthead-bg);
          color: var(--stealth-masthead-text);
        }
        .stealth-masthead-inner {
          max-width: 760px;
          margin: 0 auto;
          padding: 14px 24px 24px;
          text-align: center;
        }
        .stealth-masthead-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--stealth-sans);
          font-size: 10.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.7;
          gap: 12px;
        }
        .stealth-masthead-edition {}
        .stealth-masthead-rule {
          border: none;
          border-top: 1px solid rgba(251,250,246,0.2);
          margin: 10px 0 0;
        }
        .stealth-masthead-rule-double {
          border-top: 3px double rgba(251,250,246,0.3);
          margin-top: 4px;
        }
        .stealth-pub-name {
          font-family: var(--stealth-serif);
          font-size: 38px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin-top: 14px;
        }
        .stealth-masthead-sub {
          font-family: var(--stealth-serif);
          font-style: italic;
          font-size: 13px;
          opacity: 0.55;
          margin-top: 6px;
        }
        .stealth-dot { margin: 0 2px; opacity: 0.4; }

        /* ── Article body ── */
        .stealth-article-body {
          padding: 44px 0 60px;
          /* Single fade-in for the whole article body when content arrives.
             No per-paragraph animation — articles don't do that. */
          animation: stealthArticleFadeIn 0.4s ease both;
        }
        @keyframes stealthArticleFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes stealthFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stealth-article-inner {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .stealth-category-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          font-family: var(--stealth-sans);
        }
        .stealth-category {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stealth-accent);
        }
        .stealth-category-divider { color: var(--stealth-text-mute); }
        .stealth-category-sub {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--stealth-text-mute);
        }

        .stealth-headline {
          font-family: var(--stealth-serif);
          font-size: 44px;
          font-weight: 700;
          line-height: 1.12;
          letter-spacing: -0.018em;
          margin: 0 0 18px;
          color: var(--stealth-text);
        }

        .stealth-deck {
          font-family: var(--stealth-serif);
          font-size: 22px;
          line-height: 1.48;
          font-style: italic;
          color: var(--stealth-text-soft);
          margin: 0 0 28px;
          font-weight: 400;
        }

        .stealth-byline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--stealth-rule-soft);
          font-family: var(--stealth-sans);
        }
        .stealth-byline-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .stealth-byline-author { font-size: 13px; color: var(--stealth-text-soft); }
        .stealth-byline-author strong { color: var(--stealth-text); font-weight: 600; }
        .stealth-byline-meta { font-size: 11px; color: var(--stealth-text-mute); letter-spacing: 0.04em; }
        .stealth-byline-right { }
        .stealth-byline-updated {
          font-size: 11px;
          color: var(--stealth-text-mute);
          letter-spacing: 0.06em;
        }

        .stealth-rule {
          border: none;
          border-top: 1px solid var(--stealth-rule);
          margin: 0 0 32px;
        }
        .stealth-rule-end { margin: 40px 0 22px; }

        /* ── Contributor selector (partner switcher) ── */
        .stealth-contributor-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding: 12px 16px;
          background: var(--stealth-bg-warm);
          border: 1px solid var(--stealth-rule-soft);
          border-radius: 4px;
          font-family: var(--stealth-sans);
        }
        .stealth-contributor-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--stealth-text-mute);
          flex-shrink: 0;
        }
        .stealth-contributor-select {
          position: relative;
          flex: 1;
          min-width: 0;
        }
        .stealth-contributor-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--stealth-bg);
          border: 1px solid var(--stealth-rule);
          border-radius: 3px;
          cursor: pointer;
          font-family: var(--stealth-serif);
          font-size: 15px;
          color: var(--stealth-text);
          transition: border-color 0.15s, box-shadow 0.15s;
          max-width: 100%;
        }
        .stealth-contributor-trigger:hover {
          border-color: var(--stealth-accent);
        }
        .stealth-contributor-select-open .stealth-contributor-trigger {
          border-color: var(--stealth-accent);
          box-shadow: 0 0 0 2px rgba(184,57,14,0.15);
        }
        .stealth-contributor-name {
          font-weight: 600;
          color: var(--stealth-accent);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stealth-contributor-caret {
          font-size: 11px;
          color: var(--stealth-text-mute);
          transition: transform 0.15s;
        }
        .stealth-contributor-select-open .stealth-contributor-caret {
          transform: rotate(180deg);
        }
        .stealth-contributor-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
        }
        .stealth-contributor-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 220px;
          max-width: 100%;
          max-height: 280px;
          overflow-y: auto;
          list-style: none;
          margin: 0;
          padding: 4px;
          background: var(--stealth-bg);
          border: 1px solid var(--stealth-rule);
          border-radius: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 51;
          font-family: var(--stealth-sans);
          animation: stealthFadeIn 0.15s ease both;
        }
        .stealth-contributor-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-family: var(--stealth-serif);
          font-size: 14px;
          color: var(--stealth-text);
          text-align: left;
          transition: background 0.1s;
        }
        .stealth-contributor-option:hover {
          background: var(--stealth-bg-warm);
        }
        .stealth-contributor-option-active {
          background: rgba(184,57,14,0.06);
          color: var(--stealth-accent);
          font-weight: 600;
        }
        .stealth-contributor-option-active:hover {
          background: rgba(184,57,14,0.1);
        }
        .stealth-contributor-option-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stealth-contributor-option-meta {
          font-size: 11px;
          color: var(--stealth-text-mute);
          font-family: var(--stealth-sans);
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .stealth-contributor-row { flex-wrap: wrap; gap: 8px; padding: 10px 12px; }
          .stealth-contributor-label { font-size: 10px; }
          .stealth-contributor-trigger { font-size: 14px; padding: 5px 10px; }
          .stealth-contributor-menu { min-width: 100%; }
        }

        /* ── Paragraphs (article typography) ── */
        /* No per-paragraph animation — articles don't fade in paragraph by paragraph.
           The whole article body fades in once on load (see .stealth-article-body). */
        .stealth-paragraph-block {
          position: relative;
        }

        .stealth-paragraph {
          font-family: var(--stealth-serif);
          font-size: 19px;
          line-height: 1.82;
          margin: 0 0 0.55em;
          color: var(--stealth-text);
          cursor: text;
          transition: background 0.15s ease;
          padding: 1px 6px;
          margin-left: -6px;
          margin-right: -6px;
          border-radius: 2px;
          outline: none;
          /* Classic article typography: first-line indent on all paragraphs
             EXCEPT the lead (which has a drop cap instead). */
          text-indent: 1.6em;
        }
        .stealth-paragraph-lead {
          text-indent: 0;
        }
        /* No hover background — articles don't highlight paragraphs on hover.
           Interactivity is discoverable by clicking, not by hovering. */
        .stealth-paragraph:hover {
          background: transparent;
        }
        .stealth-paragraph:focus-visible {
          background: rgba(184,57,14,0.04);
          box-shadow: 0 0 0 2px rgba(184,57,14,0.2);
        }
        .stealth-paragraph-active {
          background: var(--stealth-highlight);
          box-shadow: 0 0 0 1px var(--stealth-highlight-border);
        }
        .stealth-paragraph a {
          color: var(--stealth-accent);
          text-decoration: underline;
          text-decoration-color: rgba(184,57,14,0.35);
          text-underline-offset: 2px;
        }

        /* Drop cap on lead paragraph only (first paragraph of the article) */
        .stealth-paragraph-lead::first-letter {
          font-family: var(--stealth-serif);
          font-size: 60px;
          font-weight: 700;
          float: left;
          line-height: 0.88;
          margin: 5px 10px 0 -2px;
          color: var(--stealth-accent);
        }

        .stealth-paragraph-error {
          color: var(--stealth-accent);
          font-style: italic;
          cursor: default;
        }
        .stealth-paragraph-error:hover { background: transparent; }

        .stealth-editorial-note {
          font-style: italic;
          color: var(--stealth-text-soft);
          border-left: 3px solid var(--stealth-accent-soft);
          padding-left: 20px;
          margin-left: 8px;
        }

        /* ── Subheadline ── */
        .stealth-subheadline {
          font-family: var(--stealth-serif);
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.012em;
          margin: 36px 0 18px;
          color: var(--stealth-text);
        }

        /* First DM paragraph — no indent (starts a new section), no drop cap */
        .stealth-paragraph-lead-dm {
          text-indent: 0;
        }

        /* ── Section break ornament ── */
        .stealth-section-break {
          text-align: center;
          font-size: 24px;
          color: var(--stealth-text-mute);
          margin: 40px 0 32px;
          letter-spacing: 0.3em;
        }

        /* ── Reading preferences / controls bar ── */
        .stealth-controls {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin: 24px 0 28px;
          padding: 10px 14px;
          background: var(--stealth-bg-warm);
          border: 1px solid var(--stealth-rule-soft);
          border-radius: 4px;
          font-family: var(--stealth-sans);
          font-size: 12px;
        }
        .stealth-controls-minimal {
          justify-content: center;
          margin: 20px 0 28px;
        }
        .stealth-controls-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--stealth-text-mute);
          flex-shrink: 0;
        }
        .stealth-controls-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stealth-controls-key {
          font-size: 11px;
          color: var(--stealth-text-mute);
          font-weight: 500;
        }
        .stealth-controls-segments {
          display: inline-flex;
          border: 1px solid var(--stealth-rule);
          border-radius: 3px;
          overflow: hidden;
          background: var(--stealth-bg);
        }
        .stealth-seg {
          padding: 4px 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: var(--stealth-serif);
          font-size: 14px;
          color: var(--stealth-text-soft);
          transition: background 0.1s, color 0.1s;
          min-width: 28px;
          text-align: center;
        }
        .stealth-seg:hover {
          background: var(--stealth-bg-warm);
        }
        .stealth-seg-active {
          background: var(--stealth-accent);
          color: #fff;
        }
        .stealth-seg-active:hover {
          background: var(--stealth-accent);
        }
        .stealth-toggle {
          padding: 4px 10px;
          border: 1px solid var(--stealth-rule);
          border-radius: 3px;
          cursor: pointer;
          font-family: var(--stealth-sans);
          font-size: 11px;
          font-weight: 600;
          transition: all 0.1s;
          background: var(--stealth-bg);
        }
        .stealth-toggle-on {
          color: var(--stealth-text);
          border-color: var(--stealth-rule);
        }
        .stealth-toggle-off {
          color: var(--stealth-text-mute);
          background: var(--stealth-bg-warm);
        }
        .stealth-hide-btn {
          margin-left: auto;
          padding: 5px 12px;
          border: 1px solid var(--stealth-accent);
          border-radius: 3px;
          background: transparent;
          color: var(--stealth-accent);
          cursor: pointer;
          font-family: var(--stealth-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: all 0.15s;
        }
        .stealth-hide-btn:hover {
          background: var(--stealth-accent);
          color: #fff;
        }
        .stealth-hide-btn-show {
          margin: 0 auto;
        }

        /* ── Search input ── */
        .stealth-search-group {
          flex: 1;
          min-width: 140px;
        }
        .stealth-search-input {
          flex: 1;
          min-width: 0;
          padding: 4px 8px;
          border: 1px solid var(--stealth-rule);
          border-radius: 3px;
          background: var(--stealth-bg);
          font-family: var(--stealth-sans);
          font-size: 12px;
          color: var(--stealth-text);
          outline: none;
          transition: border-color 0.15s;
        }
        .stealth-search-input:focus {
          border-color: var(--stealth-accent);
        }
        .stealth-search-input::placeholder {
          color: var(--stealth-text-mute);
          font-style: italic;
        }
        .stealth-search-count {
          font-size: 10px;
          color: var(--stealth-text-mute);
          font-family: var(--stealth-sans);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        /* ── Typing / developing story indicator ── */
        .stealth-developing {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 20px;
          padding: 8px 14px;
          background: rgba(184,57,14,0.04);
          border-left: 2px solid var(--stealth-accent);
          border-radius: 2px;
          font-family: var(--stealth-sans);
          font-size: 12px;
          color: var(--stealth-text-soft);
          font-style: italic;
        }
        .stealth-developing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--stealth-accent);
          flex-shrink: 0;
          animation: stealthBlink 1.2s ease-in-out infinite;
        }
        @keyframes stealthBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* ── Keyboard shortcut hint (subtle, bottom of page) ── */
        .stealth-shortcuts {
          margin: 24px 0;
          padding: 12px 16px;
          background: var(--stealth-bg-warm);
          border: 1px solid var(--stealth-rule-soft);
          border-radius: 4px;
          font-family: var(--stealth-sans);
          font-size: 10px;
          color: var(--stealth-text-mute);
          text-align: center;
          letter-spacing: 0.04em;
        }
        .stealth-shortcuts kbd {
          display: inline-block;
          padding: 1px 5px;
          margin: 0 2px;
          background: var(--stealth-bg);
          border: 1px solid var(--stealth-rule);
          border-radius: 2px;
          font-family: var(--stealth-sans);
          font-size: 10px;
          font-weight: 600;
          color: var(--stealth-text);
        }

        @media (max-width: 640px) {
          .stealth-search-group { width: 100%; }
          .stealth-search-input { font-size: 13px; padding: 5px 8px; }
        }

        /* ── Related coverage ── */
        .stealth-related {
          margin: 44px 0 32px;
          padding: 24px 0 0;
          border-top: 2px solid var(--stealth-text);
        }
        .stealth-related-label {
          font-family: var(--stealth-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--stealth-text);
          margin-bottom: 14px;
        }
        .stealth-related-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .stealth-related-list li {
          padding: 10px 0;
          border-bottom: 1px solid var(--stealth-rule-soft);
        }
        .stealth-related-list li:last-child {
          border-bottom: none;
        }
        .stealth-related-list a {
          font-family: var(--stealth-serif);
          font-size: 17px;
          color: var(--stealth-text);
          text-decoration: none;
          transition: color 0.1s;
        }
        .stealth-related-list a:hover {
          color: var(--stealth-accent);
        }

        @media (max-width: 640px) {
          .stealth-controls { gap: 8px; padding: 8px 10px; }
          .stealth-controls-label { font-size: 9px; }
          .stealth-controls-key { font-size: 10px; }
          .stealth-seg { padding: 3px 8px; font-size: 13px; min-width: 24px; }
          .stealth-hide-btn { margin-left: 0; width: 100%; text-align: center; padding: 6px; }
          .stealth-subheadline { font-size: 22px; }
          .stealth-related-list a { font-size: 15px; }
        }

        /* ── Annotation / reply input ── */
        .stealth-annotation {
          background: var(--stealth-annotation-bg);
          border: 1px solid var(--stealth-annotation-border);
          border-left: 3px solid var(--stealth-accent);
          border-radius: 4px;
          padding: 16px 20px 14px;
          margin: -6px 0 26px 8px;
          font-family: var(--stealth-sans);
          animation: stealthFadeIn 0.2s ease both;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .stealth-annotation-label {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
        }
        .stealth-annotation-marker {
          font-family: var(--stealth-serif);
          font-size: 20px;
          color: var(--stealth-accent);
          font-weight: 700;
          line-height: 1;
        }
        .stealth-annotation-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--stealth-text-soft);
        }
        .stealth-annotation-input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          resize: none;
          font-family: var(--stealth-serif);
          font-size: 17px;
          line-height: 1.55;
          color: var(--stealth-text);
          padding: 0;
        }
        .stealth-annotation-input::placeholder {
          color: var(--stealth-text-mute);
          font-style: italic;
        }
        .stealth-annotation-hint {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid var(--stealth-rule-soft);
          font-size: 10px;
          color: var(--stealth-text-mute);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Loading state ── */
        .stealth-loading { cursor: default; }
        .stealth-loading:hover { background: transparent; }
        .stealth-loading-line {
          display: block;
          height: 14px;
          background: linear-gradient(90deg, #e8e4d8 0%, #f0ece0 50%, #e8e4d8 100%);
          background-size: 200% 100%;
          border-radius: 2px;
          margin-bottom: 10px;
          animation: stealthShimmer 1.6s ease-in-out infinite;
        }
        @keyframes stealthShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Signoff ── */
        .stealth-signoff {
          font-family: var(--stealth-serif);
          font-size: 17px;
          color: var(--stealth-text-mute);
          text-align: center;
          margin: 0 0 44px;
          font-style: italic;
        }

        /* ── Footer ── */
        .stealth-footer {
          border-top: 1px solid var(--stealth-rule);
          padding: 32px 0 48px;
          background: var(--stealth-bg-warm);
        }
        .stealth-footer-inner {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
        }
        .stealth-footer-pub {
          font-family: var(--stealth-serif);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
          color: var(--stealth-text);
        }
        .stealth-footer-meta {
          font-family: var(--stealth-sans);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--stealth-text-mute);
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        .stealth-footer-link {
          color: var(--stealth-accent);
          text-decoration: none;
        }
        .stealth-footer-link:hover { text-decoration: underline; }

        /* ── Mobile responsive ── */
        @media (max-width: 640px) {
          .stealth-article { font-size: 17px; }
          .stealth-pub-name { font-size: 28px; }
          .stealth-masthead-sub { font-size: 12px; }
          .stealth-masthead-top { font-size: 9.5px; gap: 8px; }
          .stealth-headline { font-size: 30px; }
          .stealth-deck { font-size: 18px; }
          .stealth-paragraph { font-size: 17px; line-height: 1.72; }
          .stealth-paragraph-lead::first-letter { font-size: 52px; }
          .stealth-article-inner { padding: 0 18px; }
          .stealth-masthead-inner { padding: 12px 18px 20px; }
          .stealth-byline { font-size: 11px; }
          .stealth-annotation { margin-left: 0; padding: 14px 16px 12px; }
          .stealth-annotation-input { font-size: 16px; }
          .stealth-footer-inner { padding: 0 18px; }
          .stealth-footer-meta { font-size: 10px; gap: 4px; }
          .stealth-article-body { padding: 32px 0 48px; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .stealth-article-body,
          .stealth-annotation,
          .stealth-contributor-menu,
          .stealth-loading-line {
            animation: none !important;
          }
          .stealth-paragraph { transition: none; }
          .stealth-progress { transition: none; }
        }
      `}</style>
    </div>
  );
}
