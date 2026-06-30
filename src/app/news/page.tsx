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
          <div className="stealth-glass-wrap">

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

          {/* ─── Quick-hide toggle button ─── */}
          <button
            type="button"
            className="stealth-quick-hide"
            onClick={() => setHideConversation((v) => !v)}
            title={hideConversation ? "Show conversation" : "Hide conversation"}
            aria-label={hideConversation ? "Show conversation" : "Hide conversation"}
          >
            {hideConversation ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>

          {/* ─── Contributor selector (compact inline) ─── */}
          {partners.length > 0 && !hideConversation && (
            <div className="stealth-contributor-row">
              <span className="stealth-contributor-label">With</span>
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

          {/* ── Pull quote ── */}
          <div className="stealth-pullquote">
            <p>"The model is a tool you run, not a service you query. That distinction changes everything."</p>
            <div className="stealth-pullquote-cite">— A common refrain in open-source inference circles, 2024</div>
          </div>

          <div className="stealth-paragraph-block">
            <p className="stealth-paragraph">
              The change isn't driven by a single breakthrough. It's the compounding effect of
              smaller architectures, better quantization, and GPUs that quietly crossed a threshold
              sometime in the last eighteen months. What used to require a data center now runs —
              not perfectly, but usably — on hardware that fits in a backpack.
            </p>
          </div>

          {/* ── Decorative inline vector: neural network layers ── */}
          <div style={{ textAlign:'center', margin:'20px 0', opacity: 0.5 }}>
            <svg width="200" height="32" viewBox="0 0 200 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="5" fill="none" stroke="rgba(184,57,14,0.25)" strokeWidth="0.8"/>
              <circle cx="16" cy="16" r="2" fill="rgba(184,57,14,0.2)"/>
              <circle cx="52" cy="10" r="4" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8"/>
              <circle cx="52" cy="22" r="4" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8"/>
              <circle cx="52" cy="10" r="1.5" fill="rgba(0,0,0,0.08)"/>
              <circle cx="52" cy="22" r="1.5" fill="rgba(0,0,0,0.08)"/>
              <circle cx="88" cy="6" r="3.5" fill="none" stroke="rgba(40,120,80,0.2)" strokeWidth="0.8"/>
              <circle cx="88" cy="16" r="3.5" fill="none" stroke="rgba(40,120,80,0.2)" strokeWidth="0.8"/>
              <circle cx="88" cy="26" r="3.5" fill="none" stroke="rgba(40,120,80,0.2)" strokeWidth="0.8"/>
              <circle cx="124" cy="10" r="3" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8"/>
              <circle cx="124" cy="22" r="3" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8"/>
              <circle cx="160" cy="6" r="4" fill="none" stroke="rgba(40,120,80,0.25)" strokeWidth="0.8"/>
              <circle cx="160" cy="16" r="4" fill="none" stroke="rgba(40,120,80,0.25)" strokeWidth="0.8"/>
              <circle cx="160" cy="26" r="4" fill="none" stroke="rgba(40,120,80,0.25)" strokeWidth="0.8"/>
              <circle cx="160" cy="16" r="1.8" fill="rgba(40,120,80,0.15)"/>
              <circle cx="184" cy="16" r="5" fill="none" stroke="rgba(184,57,14,0.25)" strokeWidth="0.8"/>
              <circle cx="184" cy="16" r="2" fill="rgba(184,57,14,0.2)"/>
              {/* Connections layer 1→2 */}
              <line x1="21" y1="14" x2="48" y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="21" y1="16" x2="48" y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="21" y1="18" x2="48" y2="22" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="21" y1="16" x2="48" y2="22" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              {/* Connections layer 2→3 */}
              <line x1="56" y1="10" x2="84" y2="6" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="56" y1="10" x2="84" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="56" y1="22" x2="84" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="56" y1="22" x2="84" y2="26" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="56" y1="10" x2="84" y2="26" stroke="rgba(0,0,0,0.04)" strokeWidth="0.4"/>
              <line x1="56" y1="22" x2="84" y2="6" stroke="rgba(0,0,0,0.04)" strokeWidth="0.4"/>
              {/* Connections layer 3→4 */}
              <line x1="92" y1="6" x2="121" y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="92" y1="16" x2="121" y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="92" y1="16" x2="121" y2="22" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="92" y1="26" x2="121" y2="22" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              {/* Connections layer 4→5 */}
              <line x1="127" y1="10" x2="156" y2="6" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="127" y1="10" x2="156" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="127" y1="22" x2="156" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="127" y1="22" x2="156" y2="26" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              {/* Connections layer 5→6 */}
              <line x1="164" y1="6" x2="179" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="164" y1="16" x2="179" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              <line x1="164" y1="26" x2="179" y2="16" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
            </svg>
          </div>

          {/* ─── Diagram: Cloud vs Local inference ─── */}
          <div className="stealth-diagram">
            <svg viewBox="0 0 520 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:'480px',margin:'0 auto',display:'block'}}>
              {/* Cloud side */}
              <rect x="10" y="60" width="160" height="80" rx="14" fill="rgba(184,57,14,0.06)" stroke="rgba(184,57,14,0.2)" strokeWidth="1.2"/>
              <text x="90" y="42" textAnchor="middle" fill="#7a7a72" fontSize="11" fontFamily="-apple-system,sans-serif" fontWeight="600" letterSpacing="0.08em">CLOUD</text>
              {/* Server icon */}
              <rect x="55" y="78" width="30" height="8" rx="2" fill="#b8390e" opacity="0.5"/>
              <rect x="55" y="90" width="30" height="8" rx="2" fill="#b8390e" opacity="0.35"/>
              <rect x="55" y="102" width="30" height="8" rx="2" fill="#b8390e" opacity="0.2"/>
              <circle cx="78" cy="82" r="2" fill="#b8390e"/>
              <circle cx="78" cy="94" r="2" fill="#b8390e" opacity="0.7"/>
              <circle cx="78" cy="106" r="2" fill="#b8390e" opacity="0.4"/>
              {/* Latency label */}
              <text x="90" y="134" textAnchor="middle" fill="#b8390e" fontSize="9" fontFamily="-apple-system,sans-serif" opacity="0.7">~200ms round-trip</text>
              {/* User dots */}
              <circle cx="35" cy="78" r="4" fill="#3d3d3d" opacity="0.3"/><circle cx="50" cy="78" r="4" fill="#3d3d3d" opacity="0.25"/>
              <circle cx="35" cy="92" r="4" fill="#3d3d3d" opacity="0.2"/><circle cx="50" cy="92" r="4" fill="#3d3d3d" opacity="0.15"/>
              <text x="42" y="118" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">users</text>

              {/* Arrow */}
              <line x1="185" y1="100" x2="215" y2="100" stroke="#d8d4c8" strokeWidth="1.5" strokeDasharray="4 3"/>
              <polygon points="213,96 221,100 213,104" fill="#d8d4c8"/>
              <text x="200" y="88" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif" fontStyle="italic">shift</text>

              {/* Local side */}
              <rect x="230" y="60" width="160" height="80" rx="14" fill="rgba(40,120,80,0.06)" stroke="rgba(40,120,80,0.2)" strokeWidth="1.2"/>
              <text x="310" y="42" textAnchor="middle" fill="#7a7a72" fontSize="11" fontFamily="-apple-system,sans-serif" fontWeight="600" letterSpacing="0.08em">LOCAL</text>
              {/* Laptop icon */}
              <rect x="278" y="80" width="40" height="26" rx="3" fill="none" stroke="#3d3d3d" strokeWidth="1.2" opacity="0.4"/>
              <rect x="282" y="84" width="32" height="18" rx="1" fill="rgba(40,120,80,0.1)"/>
              <rect x="273" y="106" width="50" height="3" rx="1.5" fill="#3d3d3d" opacity="0.3"/>
              {/* Neural net dots inside laptop */}
              <circle cx="292" cy="90" r="2" fill="rgba(40,120,80,0.5)"/><circle cx="298" cy="90" r="2" fill="rgba(40,120,80,0.5)"/>
              <circle cx="304" cy="90" r="2" fill="rgba(40,120,80,0.5)"/>
              <circle cx="295" cy="97" r="2" fill="rgba(40,120,80,0.4)"/><circle cx="301" cy="97" r="2" fill="rgba(40,120,80,0.4)"/>
              <line x1="292" y1="92" x2="295" y2="95" stroke="rgba(40,120,80,0.3)" strokeWidth="0.7"/>
              <line x1="298" y1="92" x2="295" y2="95" stroke="rgba(40,120,80,0.3)" strokeWidth="0.7"/>
              <line x1="298" y1="92" x2="301" y2="95" stroke="rgba(40,120,80,0.3)" strokeWidth="0.7"/>
              <line x1="304" y1="92" x2="301" y2="95" stroke="rgba(40,120,80,0.3)" strokeWidth="0.7"/>
              {/* Latency label */}
              <text x="310" y="134" textAnchor="middle" fill="rgba(40,120,80,0.7)" fontSize="9" fontFamily="-apple-system,sans-serif">&lt;10ms on-device</text>
              {/* Lock icon */}
              <rect x="375" y="82" width="12" height="10" rx="2" fill="none" stroke="rgba(40,120,80,0.4)" strokeWidth="1"/>
              <path d="M377 82 V78 a4 4 0 0 1 8 0 V82" fill="none" stroke="rgba(40,120,80,0.4)" strokeWidth="1"/>
              <text x="381" y="108" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">privacy</text>

              {/* Timeline arrow */}
              <line x1="90" y1="165" x2="310" y2="165" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
              <polygon points="308,162 314,165 308,168" fill="rgba(0,0,0,0.12)"/>
              <text x="200" y="180" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontStyle="italic">2023 → 2025</text>
              {/* Milestone dots */}
              <circle cx="130" cy="165" r="3" fill="rgba(184,57,14,0.3)"/>
              <text x="130" y="158" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">LLaMA</text>
              <circle cx="200" cy="165" r="3" fill="rgba(0,0,0,0.15)"/>
              <text x="200" y="158" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">4-bit</text>
              <circle cx="270" cy="165" r="3" fill="rgba(40,120,80,0.4)"/>
              <text x="270" y="158" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">8GB</text>
            </svg>
            <div className="stealth-diagram-caption">Fig. 1 — The inference axis is tilting toward the edge. Latency drops from hundreds of milliseconds to single digits; data stays on-device.</div>
          </div>

          {/* ─── Compact controls bar (only when not hidden) ─── */}
          {!hideConversation && (
            <div className="stealth-controls">
              <div className="stealth-controls-group">
                <div className="stealth-controls-segments">
                  {(["space", "period", "emdash", "pipe"] as Separator[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`stealth-seg ${separator === s ? "stealth-seg-active" : ""}`}
                      onClick={() => setSeparator(s)}
                      title={`Separate with ${s}`}
                    >
                      {s === "space" ? "␣" : s === "period" ? "." : s === "emdash" ? "—" : "|"}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className={`stealth-toggle ${hideEmojis ? "stealth-toggle-off" : "stealth-toggle-on"}`}
                onClick={() => setHideEmojis((v) => !v)}
              >
                {hideEmojis ? "No emoji" : "Emoji"}
              </button>
              <div className="stealth-search-group">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="stealth-search-input"
                  placeholder="Search…"
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
              >
                Hide
              </button>
            </div>
          )}

          {/* ─── Subheadline introducing the conversation section ─── */}
          {!hideConversation && (
            <h2 className="stealth-subheadline">
              The 8-gigabyte threshold
            </h2>
          )}

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

              {/* ── Diagram: Quantization pipeline ── */}
              <div className="stealth-diagram">
                <svg viewBox="0 0 460 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:'420px',margin:'0 auto',display:'block'}}>
                  {/* Pipeline stages */}
                  <rect x="10" y="40" width="80" height="55" rx="10" fill="rgba(184,57,14,0.06)" stroke="rgba(184,57,14,0.2)" strokeWidth="1"/>
                  <text x="50" y="62" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="600">FP16</text>
                  <text x="50" y="76" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">16-bit float</text>

                  <line x1="95" y1="67" x2="115" y2="67" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2"/>
                  <polygon points="113,64 119,67 113,70" fill="rgba(0,0,0,0.15)"/>

                  <rect x="120" y="40" width="80" height="55" rx="10" fill="rgba(184,57,14,0.04)" stroke="rgba(184,57,14,0.15)" strokeWidth="1"/>
                  <text x="160" y="62" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="600">INT8</text>
                  <text x="160" y="76" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">8-bit integer</text>

                  <line x1="205" y1="67" x2="225" y2="67" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2"/>
                  <polygon points="223,64 229,67 223,70" fill="rgba(0,0,0,0.15)"/>

                  <rect x="230" y="40" width="80" height="55" rx="10" fill="rgba(40,120,80,0.06)" stroke="rgba(40,120,80,0.2)" strokeWidth="1"/>
                  <text x="270" y="62" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="600">INT4</text>
                  <text x="270" y="76" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">4-bit quantized</text>

                  <line x1="315" y1="67" x2="335" y2="67" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2"/>
                  <polygon points="333,64 339,67 333,70" fill="rgba(0,0,0,0.15)"/>

                  <rect x="340" y="40" width="80" height="55" rx="10" fill="rgba(40,120,80,0.08)" stroke="rgba(40,120,80,0.25)" strokeWidth="1.2"/>
                  <text x="380" y="58" textAnchor="middle" fill="rgba(40,120,80,0.7)" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="600">GGUF</text>
                  <text x="380" y="72" textAnchor="middle" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">on-device</text>
                  <text x="380" y="84" textAnchor="middle" fill="rgba(40,120,80,0.5)" fontSize="7" fontFamily="-apple-system,sans-serif">ready</text>

                  {/* Size labels below */}
                  <text x="50" y="114" textAnchor="middle" fill="rgba(184,57,14,0.5)" fontSize="8" fontFamily="-apple-system,sans-serif">~14 GB</text>
                  <text x="160" y="114" textAnchor="middle" fill="rgba(184,57,14,0.4)" fontSize="8" fontFamily="-apple-system,sans-serif">~7 GB</text>
                  <text x="270" y="114" textAnchor="middle" fill="rgba(40,120,80,0.5)" fontSize="8" fontFamily="-apple-system,sans-serif">~3.5 GB</text>
                  <text x="380" y="114" textAnchor="middle" fill="rgba(40,120,80,0.6)" fontSize="8" fontFamily="-apple-system,sans-serif">~2 GB</text>

                  {/* Quality bar */}
                  <rect x="10" y="130" width="410" height="4" rx="2" fill="rgba(0,0,0,0.04)"/>
                  <rect x="10" y="130" width="410" height="4" rx="2" fill="url(#qualGrad)"/>
                  <defs>
                    <linearGradient id="qualGrad" x1="10" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(184,57,14,0.35)"/>
                      <stop offset="100%" stopColor="rgba(40,120,80,0.3)"/>
                    </linearGradient>
                  </defs>
                  <text x="20" y="148" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">Full quality</text>
                  <text x="390" y="148" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif">Compact</text>
                </svg>
                <div className="stealth-diagram-caption">Fig. 3 — The quantization pipeline: from full-precision weights to on-device deployment. Each stage compresses the model with diminishing quality loss.</div>
              </div>

              <div className="stealth-paragraph-block">
                <p className="stealth-paragraph">
                  What's clearer is the philosophical shift. When inference happens on a device you
                  own, the data never leaves. There's no server log, no training-pipeline rerun,
                  no quiet retention policy. The model is a tool you run, not a service you query.
                </p>
              </div>

              {/* ── Pull quote ── */}
              <div className="stealth-pullquote">
                <p>"When the data never leaves, the trust model fundamentally changes. You're not asking permission — you're exercising ownership."</p>
                <div className="stealth-pullquote-cite">— Privacy researchers, EFF, 2024</div>
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

          {/* ─── Diagram: Model size convergence ─── */}
          <div className="stealth-diagram">
            <svg viewBox="0 0 480 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:'440px',margin:'0 auto',display:'block'}}>
              {/* Axes */}
              <line x1="50" y1="20" x2="50" y2="140" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
              <line x1="50" y1="140" x2="440" y2="140" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
              <text x="20" y="82" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif" transform="rotate(-90,20,82)">Parameters (billions)</text>
              <text x="245" y="160" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">Year</text>
              {/* Grid lines */}
              <line x1="50" y1="50" x2="440" y2="50" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5"/>
              <line x1="50" y1="80" x2="440" y2="80" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5"/>
              <line x1="50" y1="110" x2="440" y2="110" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5"/>
              {/* Cloud models - declining trend */}
              <polyline points="80,30 150,35 220,38 290,42 360,45 430,48" fill="none" stroke="rgba(184,57,14,0.5)" strokeWidth="1.5" strokeDasharray="6 3"/>
              <circle cx="80" cy="30" r="3" fill="rgba(184,57,14,0.4)"/>
              <circle cx="150" cy="35" r="3" fill="rgba(184,57,14,0.35)"/>
              <circle cx="220" cy="38" r="3" fill="rgba(184,57,14,0.3)"/>
              <circle cx="290" cy="42" r="3" fill="rgba(184,57,14,0.25)"/>
              <circle cx="360" cy="45" r="3" fill="rgba(184,57,14,0.2)"/>
              <circle cx="430" cy="48" r="3" fill="rgba(184,57,14,0.15)"/>
              {/* Local models - rising trend */}
              <polyline points="80,130 150,120 220,105 290,88 360,72 430,58" fill="none" stroke="rgba(40,120,80,0.6)" strokeWidth="2"/>
              <circle cx="80" cy="130" r="3" fill="rgba(40,120,80,0.3)"/>
              <circle cx="150" cy="120" r="3" fill="rgba(40,120,80,0.4)"/>
              <circle cx="220" cy="105" r="3" fill="rgba(40,120,80,0.5)"/>
              <circle cx="290" cy="88" r="3.5" fill="rgba(40,120,80,0.6)"/>
              <circle cx="360" cy="72" r="3.5" fill="rgba(40,120,80,0.7)"/>
              <circle cx="430" cy="58" r="4" fill="rgba(40,120,80,0.8)"/>
              {/* Convergence zone */}
              <rect x="390" y="44" width="50" height="20" rx="4" fill="rgba(184,57,14,0.04)" stroke="rgba(184,57,14,0.12)" strokeWidth="0.7" strokeDasharray="3 2"/>
              <text x="415" y="57" textAnchor="middle" fill="#b8390e" fontSize="7" fontFamily="-apple-system,sans-serif" opacity="0.6">converge</text>
              {/* Year labels */}
              <text x="80" y="153" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">'20</text>
              <text x="150" y="153" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">'21</text>
              <text x="220" y="153" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">'22</text>
              <text x="290" y="153" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">'23</text>
              <text x="360" y="153" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">'24</text>
              <text x="430" y="153" textAnchor="middle" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">'25</text>
              {/* Legend */}
              <line x1="60" y1="18" x2="78" y2="18" stroke="rgba(184,57,14,0.5)" strokeWidth="1.5" strokeDasharray="6 3"/>
              <text x="82" y="21" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">Cloud-deployed</text>
              <line x1="170" y1="18" x2="188" y2="18" stroke="rgba(40,120,80,0.6)" strokeWidth="2"/>
              <text x="192" y="21" fill="#7a7a72" fontSize="8" fontFamily="-apple-system,sans-serif">Local-capable</text>
            </svg>
            <div className="stealth-diagram-caption">Fig. 2 — Model capability curves are converging. By 2025, local-capable models approach the quality ceiling once reserved for cloud-only deployments.</div>
          </div>

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

          {/* ── Decorative vector: layered architecture ── */}
          <div className="stealth-diagram">
            <svg viewBox="0 0 420 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:'380px',margin:'0 auto',display:'block'}}>
              {/* Stack layers */}
              <rect x="40" y="10" width="340" height="24" rx="6" fill="rgba(184,57,14,0.06)" stroke="rgba(184,57,14,0.18)" strokeWidth="0.8"/>
              <text x="210" y="26" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="500">Application Layer  —  Chat UI · Editors · Agents</text>

              <rect x="60" y="40" width="300" height="24" rx="6" fill="rgba(184,57,14,0.04)" stroke="rgba(184,57,14,0.12)" strokeWidth="0.8"/>
              <text x="210" y="56" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="500">Runtime  —  llama.cpp · ONNX · vLLM</text>

              <rect x="80" y="70" width="260" height="24" rx="6" fill="rgba(40,120,80,0.06)" stroke="rgba(40,120,80,0.18)" strokeWidth="0.8"/>
              <text x="210" y="86" textAnchor="middle" fill="#7a7a72" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="500">Model  —  Quantized weights · GGUF · Safetensors</text>

              <rect x="100" y="100" width="220" height="24" rx="6" fill="rgba(40,120,80,0.08)" stroke="rgba(40,120,80,0.22)" strokeWidth="0.8"/>
              <text x="210" y="116" textAnchor="middle" fill="rgba(40,120,80,0.6)" fontSize="9" fontFamily="-apple-system,sans-serif" fontWeight="600">Hardware  —  GPU · NPU · RAM</text>

              {/* Side annotation */}
              <line x1="385" y1="22" x2="395" y2="60" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" strokeDasharray="2 2"/>
              <line x1="385" y1="82" x2="395" y2="108" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" strokeDasharray="2 2"/>
              <text x="400" y="65" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif" fontStyle="italic">open</text>
              <text x="400" y="112" fill="#7a7a72" fontSize="7" fontFamily="-apple-system,sans-serif" fontStyle="italic">proprietary</text>
            </svg>
            <div className="stealth-diagram-caption">Fig. 4 — The inference stack. Open-source now dominates every layer above hardware — and even there, alternatives are emerging.</div>
          </div>

          <div className="stealth-pullquote">
            <p>"The most interesting work is happening in the margins — in conversations between researchers, in pull requests on quiet repositories."</p>
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

          </div>{/* end .stealth-glass-wrap */}

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
        /* /news is a long article — ensure scroll works (no transforms from globals) */
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

          background: linear-gradient(180deg, #f0ece4 0%, #e8e4d8 30%, #f2efe8 60%, #eae6dc 100%);
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

        /* ── Frosted glass content wrapper ── */
        .stealth-glass-wrap {
          padding: 24px 28px;
          margin: 0 -4px;
          background: rgba(255,255,255,0.50);
          backdrop-filter: blur(50px) saturate(220%);
          -webkit-backdrop-filter: blur(50px) saturate(220%);
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 16px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8);
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

        /* ── Quick-hide toggle button (eye icon) ── */
        .stealth-quick-hide {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          padding: 0;
          margin-bottom: 8px;
          background: rgba(184,57,14,0.06);
          border: 1px solid var(--stealth-rule-soft);
          border-radius: 6px;
          cursor: pointer;
          color: var(--stealth-text-mute);
          transition: all 0.2s ease;
        }
        .stealth-quick-hide:hover {
          background: rgba(184,57,14,0.12);
          color: var(--stealth-accent);
          border-color: var(--stealth-accent);
        }
        .stealth-quick-hide:active {
          transform: scale(0.92);
        }

        /* ── Contributor selector (partner switcher) — compact ── */
        .stealth-contributor-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px;
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
          gap: 6px;
          padding: 5px 12px;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--stealth-serif);
          font-size: 15px;
          color: var(--stealth-text);
          transition: color 0.15s;
          max-width: 100%;
        }
        .stealth-contributor-trigger:hover {
          color: var(--stealth-accent);
        }
        .stealth-contributor-select-open .stealth-contributor-trigger {
          color: var(--stealth-accent);
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
          min-width: 200px;
          max-width: 100%;
          max-height: 240px;
          overflow-y: auto;
          list-style: none;
          margin: 0;
          padding: 4px;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(50px) saturate(220%);
          -webkit-backdrop-filter: blur(50px) saturate(220%);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03);
          z-index: 51;
          font-family: var(--stealth-sans);
          animation: stealthFadeIn 0.15s ease both;
        }
        .stealth-contributor-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--stealth-serif);
          font-size: 14px;
          color: var(--stealth-text);
          text-align: left;
          transition: background 0.1s;
        }
        .stealth-contributor-option:hover {
          background: rgba(184,57,14,0.06);
        }
        .stealth-contributor-option-active {
          background: rgba(184,57,14,0.1);
          color: var(--stealth-accent);
          font-weight: 600;
        }
        .stealth-contributor-option-active:hover {
          background: rgba(184,57,14,0.14);
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
          .stealth-contributor-row { gap: 8px; padding: 7px 12px; }
          .stealth-contributor-label { font-size: 10px; }
          .stealth-contributor-trigger { font-size: 14px; padding: 4px 10px; }
          .stealth-contributor-menu { min-width: 100%; }
        }

        /* ── Paragraphs (article typography) ── */
        .stealth-paragraph-block {
          position: relative;
          padding: 14px 20px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.32) 100%);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.65);
          border-radius: 14px;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.03),
            0 4px 12px rgba(0,0,0,0.02),
            inset 0 1px 0 rgba(255,255,255,0.85),
            inset 0 -1px 0 rgba(0,0,0,0.02);
          transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
          overflow: hidden;
        }
        /* Top highlight shimmer — liquid glass inner light */
        .stealth-paragraph-block::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
          border-radius: 14px 14px 0 0;
          pointer-events: none;
        }
        /* Subtle edge glow */
        .stealth-paragraph-block::after {
          content: '';
          position: absolute;
          top: -1px;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
          pointer-events: none;
        }
        .stealth-paragraph-block:hover {
          border-color: rgba(255,255,255,0.85);
          box-shadow:
            0 2px 6px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,0,0.02);
          transform: translateY(-0.5px);
        }

        .stealth-paragraph {
          font-family: var(--stealth-serif);
          font-size: 19px;
          line-height: 1.85;
          margin: 0;
          color: var(--stealth-text);
          cursor: text;
          transition: background 0.2s ease, letter-spacing 0.2s ease;
          padding: 0;
          border-radius: 0;
          outline: none;
          position: relative;
          z-index: 1;
          /* Classic article typography: first-line indent on all paragraphs
             EXCEPT the lead (which has a drop cap instead). */
          text-indent: 1.8em;
          letter-spacing: 0.003em;
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
          box-shadow: none;
        }
        .stealth-paragraph-active {
          background: var(--stealth-highlight);
          box-shadow: none;
        }
        /* Active/hover glow moves to the parent glass block */
        .stealth-paragraph-block:has(.stealth-paragraph-active),
        .stealth-paragraph-block:has(.stealth-paragraph:focus-visible) {
          border-color: var(--stealth-highlight-border);
          box-shadow: 0 0 0 1px var(--stealth-highlight-border), 0 2px 20px rgba(232,200,70,0.12), inset 0 1px 0 rgba(255,255,255,0.8);
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
          font-size: 64px;
          font-weight: 700;
          float: left;
          line-height: 0.85;
          margin: 4px 12px 0 -3px;
          color: var(--stealth-accent);
          text-shadow: 0 1px 2px rgba(184,57,14,0.08);
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

        /* ── Diagram / illustration wrapper ── */
        .stealth-diagram {
          margin: 32px 0;
          padding: 24px;
          background: linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.30) 100%);
          backdrop-filter: blur(45px) saturate(210%);
          -webkit-backdrop-filter: blur(45px) saturate(210%);
          border: 1px solid rgba(255,255,255,0.70);
          border-radius: 16px;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.03),
            0 8px 24px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,0,0.02);
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }
        .stealth-diagram::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
          pointer-events: none;
        }
        .stealth-diagram::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%);
          border-radius: 16px 16px 0 0;
          pointer-events: none;
        }
        .stealth-diagram:hover {
          box-shadow:
            0 4px 12px rgba(0,0,0,0.04),
            0 12px 32px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(0,0,0,0.02);
        }
        .stealth-diagram svg {
          max-width: 100%;
          height: auto;
          position: relative;
          z-index: 1;
        }
        .stealth-diagram-caption {
          margin-top: 14px;
          font-family: var(--stealth-sans);
          font-size: 11px;
          color: var(--stealth-text-mute);
          letter-spacing: 0.04em;
          position: relative;
          z-index: 1;
        }

        /* ── Pull-quote style block ── */
        .stealth-pullquote {
          margin: 28px 12px;
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.25) 100%);
          backdrop-filter: blur(38px) saturate(195%);
          -webkit-backdrop-filter: blur(38px) saturate(195%);
          border: 1px solid rgba(255,255,255,0.60);
          border-left: 3px solid var(--stealth-accent);
          border-radius: 0 14px 14px 0;
          box-shadow:
            0 1px 4px rgba(0,0,0,0.02),
            0 4px 16px rgba(0,0,0,0.02),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          overflow: hidden;
        }
        .stealth-pullquote::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 45%;
          background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%);
          pointer-events: none;
        }
        .stealth-pullquote p {
          font-family: var(--stealth-serif);
          font-size: 20px;
          line-height: 1.65;
          font-style: italic;
          color: var(--stealth-text);
          margin: 0;
          position: relative;
          z-index: 1;
        }
        .stealth-pullquote-cite {
          margin-top: 10px;
          font-family: var(--stealth-sans);
          font-size: 11px;
          color: var(--stealth-text-mute);
          letter-spacing: 0.04em;
          position: relative;
          z-index: 1;
        }

        /* ── Subheadline ── */
        .stealth-subheadline {
          font-family: var(--stealth-serif);
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.012em;
          margin: 36px 0 18px;
          padding: 14px 20px;
          color: var(--stealth-text);
          background: linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.20) 100%);
          backdrop-filter: blur(36px) saturate(190%);
          -webkit-backdrop-filter: blur(36px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 14px;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.02),
            0 4px 12px rgba(0,0,0,0.02),
            inset 0 1px 0 rgba(255,255,255,0.85);
          position: relative;
          overflow: hidden;
        }
        .stealth-subheadline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
          pointer-events: none;
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

        /* ── Reading preferences / controls bar — compact ── */
        .stealth-controls {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin: 16px 0 20px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px;
          font-family: var(--stealth-sans);
          font-size: 11px;
        }
        .stealth-controls-minimal {
          justify-content: center;
          margin: 16px 0 20px;
        }
        .stealth-controls-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--stealth-text-mute);
          flex-shrink: 0;
        }
        .stealth-controls-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .stealth-controls-key {
          font-size: 9px;
          color: var(--stealth-text-mute);
          font-weight: 500;
        }
        .stealth-controls-segments {
          display: inline-flex;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.5);
        }
        .stealth-seg {
          padding: 2px 7px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: var(--stealth-serif);
          font-size: 11px;
          color: var(--stealth-text-soft);
          transition: background 0.1s, color 0.1s;
          min-width: 22px;
          text-align: center;
        }
        .stealth-seg:hover {
          background: rgba(0,0,0,0.04);
        }
        .stealth-seg-active {
          background: var(--stealth-accent);
          color: #fff;
        }
        .stealth-seg-active:hover {
          background: var(--stealth-accent);
        }
        .stealth-toggle {
          padding: 2px 7px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          cursor: pointer;
          font-family: var(--stealth-sans);
          font-size: 9px;
          font-weight: 600;
          transition: all 0.1s;
          background: transparent;
        }
        .stealth-toggle-on {
          color: var(--stealth-text);
          border-color: rgba(0,0,0,0.08);
        }
        .stealth-toggle-off {
          color: var(--stealth-text-mute);
          background: rgba(0,0,0,0.03);
        }
        .stealth-hide-btn {
          margin-left: auto;
          padding: 2px 8px;
          border: 1px solid rgba(184,57,14,0.25);
          border-radius: 12px;
          background: transparent;
          color: var(--stealth-accent);
          cursor: pointer;
          font-family: var(--stealth-sans);
          font-size: 9px;
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

        /* ── Search input — compact ── */
        .stealth-search-group {
          flex: 1;
          min-width: 100px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .stealth-search-input {
          flex: 1;
          min-width: 0;
          padding: 2px 6px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          background: rgba(255,255,255,0.4);
          font-family: var(--stealth-sans);
          font-size: 10px;
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
          font-size: 8px;
          color: var(--stealth-text-mute);
          font-family: var(--stealth-sans);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        /* ── Typing / developing story indicator — compact ── */
        .stealth-developing {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 16px;
          padding: 5px 10px;
          background: rgba(184,57,14,0.04);
          border-left: 2px solid var(--stealth-accent);
          border-radius: 2px;
          font-family: var(--stealth-sans);
          font-size: 10px;
          color: var(--stealth-text-soft);
          font-style: italic;
        }
        .stealth-developing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--stealth-accent);
          flex-shrink: 0;
          animation: stealthBlink 1.2s ease-in-out infinite;
        }
        @keyframes stealthBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* ── Keyboard shortcut hint — compact ── */
        .stealth-shortcuts {
          margin: 16px 0;
          padding: 6px 10px;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 12px;
          font-family: var(--stealth-sans);
          font-size: 8px;
          color: var(--stealth-text-mute);
          text-align: center;
          letter-spacing: 0.03em;
        }
        .stealth-shortcuts kbd {
          display: inline-block;
          padding: 1px 4px;
          margin: 0 1px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 4px;
          font-family: var(--stealth-sans);
          font-size: 8px;
          font-weight: 600;
          color: var(--stealth-text);
        }

        @media (max-width: 640px) {
          .stealth-search-group { width: 100%; }
          .stealth-search-input { font-size: 11px; padding: 3px 6px; }
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
          .stealth-controls { gap: 6px; padding: 5px 8px; }
          .stealth-controls-label { font-size: 8px; }
          .stealth-controls-key { font-size: 8px; }
          .stealth-seg { padding: 2px 6px; font-size: 10px; min-width: 20px; }
          .stealth-hide-btn { margin-left: 0; padding: 2px 6px; }
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
          .stealth-paragraph { font-size: 17px; line-height: 1.72; text-indent: 1.4em; }
          .stealth-paragraph-block { padding: 10px 14px; border-radius: 10px; margin-bottom: 6px; }
          .stealth-diagram { padding: 16px; margin: 24px 0; }
          .stealth-paragraph-lead::first-letter { font-size: 52px; }
          .stealth-subheadline { font-size: 22px; padding: 12px 16px; }
          .stealth-pullquote { margin: 20px 8px; padding: 16px 18px; }
          .stealth-pullquote p { font-size: 17px; }
          .stealth-article-inner { padding: 0 18px; }
          .stealth-masthead-inner { padding: 12px 18px 20px; }
          .stealth-byline { font-size: 11px; }
          .stealth-annotation { margin-left: 0; padding: 14px 16px 12px; }
          .stealth-annotation-input { font-size: 16px; }
          .stealth-footer-inner { padding: 0 18px; }
          .stealth-footer-meta { font-size: 10px; gap: 4px; }
          .stealth-article-body { padding: 32px 0 48px; }
          .stealth-glass-wrap { padding: 18px 16px; margin: 0 -2px; border-radius: 12px; }
          .stealth-quick-hide { width: 24px; height: 24px; }
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
