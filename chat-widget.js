/**
 * BioQuiz Chat Widget
 * Real-time chat using Firebase Realtime Database
 * Drop-in: <script src="chat-widget.js"></script>
 *
 * SETUP:
 * 1. Go to https://console.firebase.google.com
 * 2. Create project → Realtime Database → Start in test mode
 * 3. Replace FIREBASE_CONFIG below with your config
 * 4. In Firebase console: Realtime Database → Rules → paste:
 *    { "rules": { ".read": true, ".write": true } }  ← for open chat
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════
     FIREBASE CONFIG — replace with yours
  ══════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain: "bioquiz-chat.firebaseapp.com",
  databaseURL: "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bioquiz-chat",
  storageBucket: "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId: "1:616382882153:web:9c8a32401be847468d1df8"
};

  /* ══════════════════════════════════════
     CONSTANTS
  ══════════════════════════════════════ */
  const MAX_MESSAGES   = 80;    // messages to keep in view
  const MSG_CHAR_LIMIT = 300;
  const TYPING_TIMEOUT = 2500;
  const PRESENCE_TTL   = 8000;  // ms — heartbeat interval
  const LS_NAME        = 'bq_chat_name';
  const LS_UID         = 'bq_chat_uid';

  /* ══════════════════════════════════════
     CSS — injected into <head>
  ══════════════════════════════════════ */
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;900&display=swap');

/* ── BUBBLE ── */
#bq-chat-bubble {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9800;
  width: 52px;
  height: 52px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.12);
  transition: transform .25s cubic-bezier(.34,1.4,.64,1), box-shadow .25s;
  will-change: transform;
}
#bq-chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 36px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.18);
}
#bq-chat-bubble:active { transform: scale(.95); }
#bq-chat-bubble svg { width: 22px; height: 22px; fill: #000; flex-shrink: 0; }
#bq-chat-bubble.open { background: #1a1a1a; box-shadow: 0 4px 24px rgba(0,0,0,.7); }
#bq-chat-bubble.open svg { fill: rgba(255,255,255,.7); }

/* ── UNREAD BADGE ── */
#bq-chat-badge {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 18px; height: 18px;
  background: #f87171;
  border-radius: 9px;
  border: 2px solid #080808;
  font-family: 'Rajdhani', sans-serif;
  font-size: 10px; font-weight: 700;
  color: #fff;
  display: none;
  align-items: center; justify-content: center;
  padding: 0 4px;
  animation: bqBadgePop .3s cubic-bezier(.34,1.4,.64,1) both;
}
#bq-chat-badge.show { display: flex; }
@keyframes bqBadgePop { from{transform:scale(0)} to{transform:scale(1)} }

/* ── PANEL ── */
#bq-chat-panel {
  position: fixed;
  bottom: 92px;
  right: 28px;
  z-index: 9799;
  width: 360px;
  height: 520px;
  max-height: calc(100dvh - 120px);
  background: #0d0d0d;
  border: 1px solid rgba(255,255,255,.11);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.04) inset;
  transform-origin: bottom right;
  transform: scale(.88) translateY(16px);
  opacity: 0;
  pointer-events: none;
  transition: transform .32s cubic-bezier(.16,1,.3,1), opacity .28s ease;
  will-change: transform, opacity;
}
#bq-chat-panel.open {
  transform: scale(1) translateY(0);
  opacity: 1;
  pointer-events: all;
}
#bq-chat-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 8%; width: 84%; height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,.18), transparent);
}

/* ── HEADER ── */
.bq-ch-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 13px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  flex-shrink: 0;
}
.bq-ch-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
  flex-shrink: 0;
  animation: bqPulse 2.5s ease infinite;
}
@keyframes bqPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
.bq-ch-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .18em;
  color: #fff;
  flex: 1;
}
.bq-ch-online {
  font-family: 'Rajdhani', sans-serif;
  font-size: .42rem;
  letter-spacing: .12em;
  color: rgba(52,211,153,.7);
  background: rgba(52,211,153,.08);
  border: 1px solid rgba(52,211,153,.18);
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
.bq-ch-rename {
  width: 26px; height: 26px;
  background: none;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
  flex-shrink: 0;
}
.bq-ch-rename:hover { border-color: rgba(255,255,255,.25); background: rgba(255,255,255,.06); }
.bq-ch-rename svg { width: 12px; height: 12px; stroke: rgba(255,255,255,.5); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* ── MESSAGES ── */
.bq-ch-msgs {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scroll-behavior: smooth;
}
.bq-ch-msgs::-webkit-scrollbar { width: 3px; }
.bq-ch-msgs::-webkit-scrollbar-track { background: transparent; }
.bq-ch-msgs::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

/* Date separator */
.bq-sep {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0 6px;
  font-family: 'Rajdhani', sans-serif;
  font-size: .36rem;
  letter-spacing: .22em;
  color: rgba(255,255,255,.2);
}
.bq-sep::before, .bq-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,.07);
}

/* System message */
.bq-sys {
  text-align: center;
  font-family: 'Rajdhani', sans-serif;
  font-size: .42rem;
  letter-spacing: .14em;
  color: rgba(255,255,255,.22);
  padding: 6px 0;
  animation: bqMsgIn .3s ease both;
}

/* Message row */
.bq-msg-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: bqMsgIn .28s cubic-bezier(.16,1,.3,1) both;
}
@keyframes bqMsgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.bq-msg-row.mine { align-items: flex-end; }
.bq-msg-row.theirs { align-items: flex-start; }

/* Name + time header */
.bq-msg-meta {
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 0 4px;
}
.bq-msg-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: .46rem;
  font-weight: 700;
  letter-spacing: .1em;
  color: rgba(255,255,255,.45);
}
.bq-msg-row.mine .bq-msg-name { color: rgba(255,255,255,.4); }
.bq-msg-time {
  font-family: 'Rajdhani', sans-serif;
  font-size: .36rem;
  color: rgba(255,255,255,.2);
  letter-spacing: .06em;
}

/* Bubble */
.bq-bubble {
  max-width: 82%;
  padding: 9px 13px;
  font-family: 'Rajdhani', sans-serif;
  font-size: .74rem;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: .02em;
  word-break: break-word;
  position: relative;
}
.bq-msg-row.theirs .bq-bubble {
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 2px 12px 12px 12px;
  color: rgba(255,255,255,.82);
}
.bq-msg-row.mine .bq-bubble {
  background: #fff;
  color: #0d0d0d;
  border-radius: 12px 2px 12px 12px;
  border: none;
}

/* Consecutive messages — hide repeated meta */
.bq-msg-row.consecutive .bq-msg-meta { display: none; }
.bq-msg-row.consecutive { margin-top: -4px; }

/* ── TYPING INDICATOR ── */
#bq-typing {
  padding: 0 18px 8px;
  font-family: 'Rajdhani', sans-serif;
  font-size: .42rem;
  letter-spacing: .1em;
  color: rgba(255,255,255,.28);
  min-height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.bq-typing-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}
.bq-typing-dots span {
  width: 4px; height: 4px;
  background: rgba(255,255,255,.3);
  border-radius: 50%;
  animation: bqTypDot 1.2s ease infinite;
}
.bq-typing-dots span:nth-child(2) { animation-delay: .2s; }
.bq-typing-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes bqTypDot {
  0%,60%,100% { transform: translateY(0); opacity:.3; }
  30%         { transform: translateY(-4px); opacity:1; }
}

/* ── INPUT AREA ── */
.bq-ch-input-wrap {
  border-top: 1px solid rgba(255,255,255,.07);
  padding: 10px 12px 12px;
  flex-shrink: 0;
}
.bq-ch-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.bq-ch-input {
  flex: 1;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  padding: 9px 12px;
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  font-size: .76rem;
  font-weight: 500;
  letter-spacing: .04em;
  resize: none;
  outline: none;
  min-height: 38px;
  max-height: 100px;
  line-height: 1.4;
  transition: border-color .2s, background .2s;
  scrollbar-width: none;
}
.bq-ch-input::-webkit-scrollbar { display: none; }
.bq-ch-input::placeholder { color: rgba(255,255,255,.2); }
.bq-ch-input:focus {
  border-color: rgba(255,255,255,.22);
  background: rgba(255,255,255,.08);
}
.bq-ch-send {
  width: 38px; height: 38px;
  background: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all .2s cubic-bezier(.34,1.4,.64,1);
}
.bq-ch-send:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(255,255,255,.15); }
.bq-ch-send:active { transform: scale(.94); }
.bq-ch-send:disabled { opacity: .3; cursor: not-allowed; transform: none; }
.bq-ch-send svg { width: 15px; height: 15px; stroke: #000; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.bq-ch-charcount {
  font-family: 'Rajdhani', sans-serif;
  font-size: .38rem;
  letter-spacing: .1em;
  color: rgba(255,255,255,.18);
  text-align: right;
  margin-top: 5px;
  transition: color .2s;
}
.bq-ch-charcount.warn { color: #fbbf24; }
.bq-ch-charcount.over { color: #f87171; }

/* ── NAME MODAL ── */
#bq-name-modal {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-radius: 14px;
  animation: bqModalIn .3s ease both;
}
@keyframes bqModalIn { from{opacity:0} to{opacity:1} }
.bq-name-box {
  width: 100%;
  max-width: 280px;
  text-align: center;
}
.bq-name-icon {
  width: 48px; height: 48px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.bq-name-icon svg { width: 22px; height: 22px; stroke: rgba(255,255,255,.6); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.bq-name-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: .1em;
  color: #fff;
  margin-bottom: 5px;
}
.bq-name-sub {
  font-family: 'Rajdhani', sans-serif;
  font-size: .54rem;
  letter-spacing: .12em;
  color: rgba(255,255,255,.35);
  margin-bottom: 20px;
}
.bq-name-input {
  width: 100%;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 8px;
  padding: 11px 14px;
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  font-size: .84rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-align: center;
  outline: none;
  transition: border-color .2s;
  margin-bottom: 12px;
}
.bq-name-input::placeholder { color: rgba(255,255,255,.2); }
.bq-name-input:focus { border-color: rgba(255,255,255,.35); }
.bq-name-btn {
  width: 100%;
  padding: 11px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  font-family: 'Rajdhani', sans-serif;
  font-size: .66rem;
  font-weight: 900;
  letter-spacing: .16em;
  cursor: pointer;
  transition: opacity .2s;
}
.bq-name-btn:hover { opacity: .88; }
.bq-name-err {
  font-family: 'Rajdhani', sans-serif;
  font-size: .44rem;
  letter-spacing: .1em;
  color: #f87171;
  margin-top: 8px;
  min-height: 16px;
}

/* ── SCROLL TO BOTTOM BUTTON ── */
#bq-scroll-btn {
  position: absolute;
  bottom: 110px;
  right: 18px;
  width: 30px; height: 30px;
  background: rgba(20,20,20,.95);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,.5);
  transition: all .2s;
  z-index: 5;
}
#bq-scroll-btn.show { display: flex; animation: bqFadeIn .2s ease both; }
@keyframes bqFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
#bq-scroll-btn:hover { border-color: rgba(255,255,255,.3); }
#bq-scroll-btn svg { width: 14px; height: 14px; stroke: rgba(255,255,255,.6); fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

/* ── EMPTY STATE ── */
.bq-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-bottom: 20px;
}
.bq-empty-icon {
  width: 44px; height: 44px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.bq-empty-icon svg { width: 20px; height: 20px; stroke: rgba(255,255,255,.25); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.bq-empty-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: .56rem;
  letter-spacing: .18em;
  color: rgba(255,255,255,.2);
}

/* ── MOBILE ── */
@media (max-width: 480px) {
  #bq-chat-panel {
    right: 0; bottom: 0;
    width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    transform-origin: bottom center;
  }
  #bq-chat-bubble { bottom: 20px; right: 20px; }
}
`;

  /* ══════════════════════════════════════
     HTML TEMPLATE
  ══════════════════════════════════════ */
  const HTML = `
<div id="bq-chat-bubble" title="Chat" aria-label="Open chat">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <div id="bq-chat-badge"></div>
</div>

<div id="bq-chat-panel" role="dialog" aria-label="BioQuiz chat">

  <!-- Name modal -->
  <div id="bq-name-modal">
    <div class="bq-name-box">
      <div class="bq-name-icon">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="bq-name-title">WHAT'S YOUR NAME?</div>
      <div class="bq-name-sub">SHOWN TO OTHERS IN CHAT</div>
      <input type="text" id="bq-name-input" class="bq-name-input" placeholder="Your name…" maxlength="24" autocomplete="off" autocorrect="off" spellcheck="false">
      <button class="bq-name-btn" id="bq-name-btn">JOIN CHAT</button>
      <div class="bq-name-err" id="bq-name-err"></div>
    </div>
  </div>

  <!-- Header -->
  <div class="bq-ch-header">
    <div class="bq-ch-dot"></div>
    <div class="bq-ch-title">BIOQUIZ CHAT</div>
    <div class="bq-ch-online" id="bq-online">0 ONLINE</div>
    <button class="bq-ch-rename" id="bq-rename-btn" title="Change name">
      <svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
    </button>
  </div>

  <!-- Messages -->
  <div class="bq-ch-msgs" id="bq-msgs">
    <div class="bq-empty" id="bq-empty">
      <div class="bq-empty-icon">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="bq-empty-text">NO MESSAGES YET — BE FIRST</div>
    </div>
  </div>

  <!-- Typing -->
  <div id="bq-typing"></div>

  <!-- Scroll to bottom -->
  <button id="bq-scroll-btn" title="Scroll to latest">
    <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
  </button>

  <!-- Input -->
  <div class="bq-ch-input-wrap">
    <div class="bq-ch-input-row">
      <textarea
        id="bq-input"
        class="bq-ch-input"
        placeholder="Message…"
        rows="1"
        maxlength="${MSG_CHAR_LIMIT}"
      ></textarea>
      <button class="bq-ch-send" id="bq-send" disabled title="Send (Enter)">
        <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
    <div class="bq-ch-charcount" id="bq-charcount"></div>
  </div>
</div>
`;

  /* ══════════════════════════════════════
     INJECT CSS + HTML
  ══════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = HTML;
  document.body.appendChild(wrapper);

  /* ══════════════════════════════════════
     STATE
  ══════════════════════════════════════ */
  let db          = null;
  let uid         = localStorage.getItem(LS_UID) || genUID();
  let userName    = localStorage.getItem(LS_NAME) || '';
  let isOpen      = false;
  let unreadCount = 0;
  let typingTimer = null;
  let isTyping    = false;
  let presenceInt = null;
  let lastSender  = null;
  let lastTime    = 0;
  let atBottom    = true;
  let namesCache  = {};   // uid -> name for online users

  localStorage.setItem(LS_UID, uid);

  /* ══════════════════════════════════════
     FIREBASE INIT
  ══════════════════════════════════════ */
  function initFirebase() {
    return new Promise((resolve, reject) => {
      // Load Firebase SDK dynamically
      const sdks = [
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js',
      ];
      let loaded = 0;
      sdks.forEach(src => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => { if (++loaded === sdks.length) resolve(); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    });
  }

  async function startFirebase() {
    try {
      await initFirebase();
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database();
      subscribeMessages();
      subscribeTyping();
      subscribePresence();
    } catch (e) {
      console.warn('[BioQuiz Chat] Firebase failed to load:', e);
      showOfflineState();
    }
  }

  function showOfflineState() {
    document.getElementById('bq-online').textContent = 'OFFLINE';
    document.getElementById('bq-online').style.color = 'rgba(248,113,113,.7)';
    document.getElementById('bq-online').style.borderColor = 'rgba(248,113,113,.2)';
  }

  /* ══════════════════════════════════════
     PRESENCE (online users)
  ══════════════════════════════════════ */
  function startPresence() {
    if (!db || !userName) return;
    const ref = db.ref('bq_presence/' + uid);
    const beat = () => ref.set({ name: userName, ts: Date.now() });
    beat();
    clearInterval(presenceInt);
    presenceInt = setInterval(beat, PRESENCE_TTL * 0.75);

    // Remove on disconnect
    ref.onDisconnect().remove();

    // Count online
    db.ref('bq_presence').on('value', snap => {
      const now = Date.now();
      let count = 0;
      namesCache = {};
      snap.forEach(child => {
        const d = child.val();
        if (d && now - d.ts < PRESENCE_TTL * 1.5) {
          count++;
          if (child.key !== uid) namesCache[child.key] = d.name;
        } else {
          child.ref.remove(); // clean stale
        }
      });
      const el = document.getElementById('bq-online');
      if (el) el.textContent = count + (count === 1 ? ' ONLINE' : ' ONLINE');
    });
  }

  /* ══════════════════════════════════════
     MESSAGES
  ══════════════════════════════════════ */
  function subscribeMessages() {
    const msgsRef = db.ref('bq_messages').limitToLast(MAX_MESSAGES);
    msgsRef.on('child_added', snap => {
      const msg = snap.val();
      if (msg) renderMessage(msg, snap.key);
    });
    msgsRef.on('child_removed', snap => {
      const el = document.getElementById('bqmsg-' + snap.key);
      if (el) el.remove();
    });
  }

  function sendMessage(text) {
    if (!db || !text.trim() || !userName) return;
    text = text.trim().slice(0, MSG_CHAR_LIMIT);
    db.ref('bq_messages').push({
      uid:  uid,
      name: userName,
      text: text,
      ts:   Date.now(),
    });
    // Clean up old messages (keep last MAX_MESSAGES * 1.5)
    db.ref('bq_messages').once('value', snap => {
      const keys = [];
      snap.forEach(c => keys.push(c.key));
      if (keys.length > MAX_MESSAGES + 20) {
        keys.slice(0, keys.length - MAX_MESSAGES).forEach(k => {
          db.ref('bq_messages/' + k).remove();
        });
      }
    });
  }

  /* ══════════════════════════════════════
     TYPING INDICATORS
  ══════════════════════════════════════ */
  function subscribeTyping() {
    db.ref('bq_typing').on('value', snap => {
      const now = Date.now();
      const typers = [];
      snap.forEach(child => {
        const d = child.val();
        if (child.key !== uid && d && now - d.ts < 3500) {
          typers.push(d.name || 'Someone');
        }
      });
      const el = document.getElementById('bq-typing');
      if (!el) return;
      if (typers.length === 0) {
        el.innerHTML = '';
        return;
      }
      const names = typers.length > 2
        ? typers.slice(0,2).join(', ') + ' +' + (typers.length - 2)
        : typers.join(' &amp; ');
      el.innerHTML = `
        <div class="bq-typing-dots"><span></span><span></span><span></span></div>
        <span>${names} typing</span>`;
    });
  }

  function setTyping(active) {
    if (!db || !userName) return;
    if (active) {
      db.ref('bq_typing/' + uid).set({ name: userName, ts: Date.now() });
    } else {
      db.ref('bq_typing/' + uid).remove();
    }
    isTyping = active;
  }

  function handleTyping() {
    if (!isTyping) setTyping(true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => setTyping(false), TYPING_TIMEOUT);
  }

  /* ══════════════════════════════════════
     RENDER MESSAGE
  ══════════════════════════════════════ */
  function renderMessage(msg, key) {
    const msgs = document.getElementById('bq-msgs');
    const empty = document.getElementById('bq-empty');
    if (empty) empty.remove();

    const isMine = msg.uid === uid;
    const now = Date.now();
    const msgTime = msg.ts || now;
    const timeDiff = msgTime - lastTime;
    const sameUser = lastSender === msg.uid && timeDiff < 120000; // 2min

    lastSender = msg.uid;
    lastTime   = msgTime;

    // System message
    if (msg.type === 'system') {
      const sys = document.createElement('div');
      sys.className = 'bq-sys';
      sys.id = 'bqmsg-' + key;
      sys.textContent = msg.text;
      msgs.appendChild(sys);
      maybeScrollBottom();
      return;
    }

    // Date separator
    const msgDate = new Date(msgTime);
    const todayDate = new Date();
    const isToday = msgDate.toDateString() === todayDate.toDateString();
    const dateStr = isToday ? 'TODAY' : msgDate.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'}).toUpperCase();

    // Only show separator for first message or new day
    const lastEl = msgs.lastElementChild;
    if (!lastEl || !lastEl.dataset.date || lastEl.dataset.date !== msgDate.toDateString()) {
      const sep = document.createElement('div');
      sep.className = 'bq-sep';
      sep.textContent = dateStr;
      sep.dataset.date = msgDate.toDateString();
      msgs.appendChild(sep);
      lastSender = null; // reset grouping after separator
    }

    const row = document.createElement('div');
    row.id = 'bqmsg-' + key;
    row.className = 'bq-msg-row ' + (isMine ? 'mine' : 'theirs') + (sameUser ? ' consecutive' : '');
    row.dataset.date = msgDate.toDateString();

    const timeStr = msgDate.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true});

    row.innerHTML = `
      <div class="bq-msg-meta">
        <span class="bq-msg-name">${escapeHTML(msg.name)}</span>
        <span class="bq-msg-time">${timeStr}</span>
      </div>
      <div class="bq-bubble">${escapeHTML(msg.text)}</div>`;

    msgs.appendChild(row);

    // Unread badge if panel closed and not mine
    if (!isOpen && !isMine) {
      unreadCount++;
      updateBadge();
    }

    maybeScrollBottom();
  }

  function maybeScrollBottom() {
    const msgs = document.getElementById('bq-msgs');
    if (!msgs) return;
    if (atBottom) {
      requestAnimationFrame(() => msgs.scrollTop = msgs.scrollHeight);
    }
  }

  /* ══════════════════════════════════════
     SCROLL TRACKING
  ══════════════════════════════════════ */
  function initScrollTracking() {
    const msgs = document.getElementById('bq-msgs');
    const btn  = document.getElementById('bq-scroll-btn');
    msgs.addEventListener('scroll', () => {
      const distFromBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
      atBottom = distFromBottom < 60;
      if (btn) btn.classList.toggle('show', !atBottom && distFromBottom > 120);
    }, {passive: true});
    btn.addEventListener('click', () => {
      msgs.scrollTop = msgs.scrollHeight;
      atBottom = true;
      btn.classList.remove('show');
    });
  }

  /* ══════════════════════════════════════
     BADGE
  ══════════════════════════════════════ */
  function updateBadge() {
    const badge = document.getElementById('bq-chat-badge');
    if (!badge) return;
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  }

  /* ══════════════════════════════════════
     PANEL OPEN / CLOSE
  ══════════════════════════════════════ */
  function openPanel() {
    const panel  = document.getElementById('bq-chat-panel');
    const bubble = document.getElementById('bq-chat-bubble');
    panel.classList.add('open');
    bubble.classList.add('open');
    isOpen = true;
    unreadCount = 0;
    updateBadge();
    atBottom = true;
    const msgs = document.getElementById('bq-msgs');
    requestAnimationFrame(() => msgs.scrollTop = msgs.scrollHeight);
    document.getElementById('bq-input')?.focus();
  }

  function closePanel() {
    const panel  = document.getElementById('bq-chat-panel');
    const bubble = document.getElementById('bq-chat-bubble');
    panel.classList.remove('open');
    bubble.classList.remove('open');
    isOpen = false;
    setTyping(false);
  }

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      if (!userName) {
        openPanel();
        showNameModal();
      } else {
        openPanel();
        if (!db) startFirebase();
      }
    }
  }

  /* ══════════════════════════════════════
     NAME MODAL
  ══════════════════════════════════════ */
  function showNameModal() {
    const modal = document.getElementById('bq-name-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.getElementById('bq-name-input')?.focus();
    }
  }

  function hideNameModal() {
    const modal = document.getElementById('bq-name-modal');
    if (modal) modal.style.display = 'none';
  }

  function submitName() {
    const input = document.getElementById('bq-name-input');
    const err   = document.getElementById('bq-name-err');
    const name  = input.value.trim().replace(/\s+/g, ' ');
    if (!name) { err.textContent = 'Please enter a name.'; return; }
    if (name.length < 2) { err.textContent = 'At least 2 characters.'; return; }
    if (name.length > 24) { err.textContent = 'Max 24 characters.'; return; }

    const oldName = userName;
    userName = name;
    localStorage.setItem(LS_NAME, name);
    hideNameModal();
    startFirebase().then(() => {
      startPresence();
      if (!oldName) {
        // First join — send system message
        db.ref('bq_messages').push({ type: 'system', text: name + ' joined the chat', ts: Date.now() });
      }
    });
    err.textContent = '';
  }

  /* ══════════════════════════════════════
     SUBSCRIBEONCE-PRESENCE helper
  ══════════════════════════════════════ */
  function subscribePresence() {
    startPresence();
  }

  /* ══════════════════════════════════════
     HELPERS
  ══════════════════════════════════════ */
  function genUID() {
    return 'u' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ══════════════════════════════════════
     AUTO-RESIZE TEXTAREA
  ══════════════════════════════════════ */
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  /* ══════════════════════════════════════
     WIRE UP EVENTS (after DOM ready)
  ══════════════════════════════════════ */
  function init() {
    // Bubble toggle
    document.getElementById('bq-chat-bubble')
      .addEventListener('click', togglePanel);

    // Name modal submit
    document.getElementById('bq-name-btn')
      .addEventListener('click', submitName);
    document.getElementById('bq-name-input')
      .addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitName(); } });

    // Rename button
    document.getElementById('bq-rename-btn')
      .addEventListener('click', () => {
        const modal = document.getElementById('bq-name-modal');
        const inp   = document.getElementById('bq-name-input');
        inp.value = userName || '';
        modal.style.display = 'flex';
        document.getElementById('bq-name-btn').textContent = 'UPDATE NAME';
        inp.focus(); inp.select();
      });

    // Input textarea
    const input  = document.getElementById('bq-input');
    const sendBtn = document.getElementById('bq-send');
    const charEl = document.getElementById('bq-charcount');

    input.addEventListener('input', () => {
      autoResize(input);
      const len = input.value.length;
      const remaining = MSG_CHAR_LIMIT - len;
      sendBtn.disabled = len === 0;
      if (remaining <= 50) {
        charEl.textContent = remaining + ' LEFT';
        charEl.className = 'bq-ch-charcount' + (remaining <= 20 ? ' over' : ' warn');
      } else {
        charEl.textContent = '';
        charEl.className = 'bq-ch-charcount';
      }
      if (len > 0) handleTyping();
      else setTyping(false);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.value.trim()) doSend();
      }
    });

    sendBtn.addEventListener('click', doSend);

    function doSend() {
      const text = input.value.trim();
      if (!text || !userName) return;
      sendMessage(text);
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;
      charEl.textContent = '';
      setTyping(false);
      clearTimeout(typingTimer);
      // Scroll down
      const msgs = document.getElementById('bq-msgs');
      requestAnimationFrame(() => msgs.scrollTop = msgs.scrollHeight);
      atBottom = true;
    }

    // Close on outside click (desktop)
    document.addEventListener('click', e => {
      if (!isOpen) return;
      const panel  = document.getElementById('bq-chat-panel');
      const bubble = document.getElementById('bq-chat-bubble');
      if (!panel.contains(e.target) && !bubble.contains(e.target)) {
        closePanel();
      }
    }, {capture: false});

    // Scroll tracking
    initScrollTracking();

    // If already has a name, init Firebase right away
    if (userName) startFirebase().then(startPresence);

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      if (db) {
        db.ref('bq_presence/' + uid).remove();
        db.ref('bq_typing/' + uid).remove();
      }
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
