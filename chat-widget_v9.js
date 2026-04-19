/**
 * BioQuiz Chat Widget v10.0.0 (chat-widget_v10.js)
 * Lightweight rewrite — drop-in replacement for v9.6
 *
 * Drop-in: <script src="chat-widget.js"></script>
 *
 * What's new in v10:
 *  - Compact, working message-action popover (Reply / React / Copy / Delete)
 *  - Pre-paint scroll positioning (no jumping to old messages on chat open)
 *  - Lazy-render last 40 messages, "Load earlier" on scroll up
 *  - Trimmed to 4 themes: Dark, Light, WhatsApp, Pure Black (OLED)
 *  - Removed: Giphy, voice notes, banner/avatar uploads, image uploads
 *  - System-font stack (no Google Fonts request)
 *  - Single delegated event listener for message bubbles
 *  - ~70% smaller than v9.6
 *
 * Preserved DB paths (compatible with existing data):
 *   bq_messages/                 — global chat
 *   bq_dms/{dmId}/messages/      — DM messages
 *   bq_dms/{dmId}/meta           — conversation metadata
 *   bq_presence/{uid}            — online presence + status
 *   bq_typing/{uid}              — global typing
 *   bq_dm_typing/{dmId}/{uid}    — DM typing
 *   bq_usernames/{name}          — unique username registry
 */
(function () {
'use strict';

/* ════════════════════════════════════════════════════════════════════
   1. CONFIG
═════════════════════════════════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain:        "bioquiz-chat.firebaseapp.com",
  databaseURL:       "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "bioquiz-chat",
  storageBucket:     "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId:             "1:616382882153:web:9c8a32401be847468d1df8"
};

const WIDGET_VERSION = '10.0.0';
const INITIAL_LOAD   = 40;     // messages painted on first open
const PAGE_SIZE      = 30;     // messages added per "Load earlier"
const HARD_CAP       = 200;    // max messages kept in DOM per chat
const CHAR_LIMIT     = 320;
const TYPING_TTL     = 3000;
const PRESENCE_TTL   = 9000;

const LS_UID    = 'bq_chat_uid';
const LS_NAME   = 'bq_chat_uname';
const LS_PROF   = 'bq_chat_profile';
const LS_THEME  = 'bq_theme_v2';
const LS_PINS   = 'bq_pinned';
const LS_ALIAS  = 'bq_aliases';

window.BQ_WIDGET_VERSION = WIDGET_VERSION;

const STATUS_LIST = [
  {id:'online',  label:'Online',        color:'#22c55e'},
  {id:'busy',    label:'Busy',          color:'#ef4444'},
  {id:'away',    label:'Away',          color:'#f59e0b'},
  {id:'invisible',label:'Invisible',    color:'#6b7280'},
];
const PALETTE = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316'];
const EMOJI_LIST = ['😊','😂','❤️','🔥','👍','🎉','😮','💯','👀','😢','✨','💪','🙌','😎','🥰','🙏'];
const QUICK_REACTS = ['❤️','😂','😮','😢','🔥','👍'];

/* ════════════════════════════════════════════════════════════════════
   2. STATE
═════════════════════════════════════════════════════════════════════ */
let db = null;
let uid       = localStorage.getItem(LS_UID) || (function(){
  const id='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);
  localStorage.setItem(LS_UID,id); return id;
})();
let uname     = localStorage.getItem(LS_NAME) || '';
let myProfile = (function(){
  try { return JSON.parse(localStorage.getItem(LS_PROF)||'{}'); }
  catch(_) { return {}; }
})();
if (!myProfile.status) myProfile.status = 'online';
if (!myProfile.color)  myProfile.color  = '';

let isOpen        = false;
let activeView    = 'chat';      // chat | dms | dmconv | online | settings
let activeDmId    = null;
let activeDmPuid  = null;
let activeDmPname = null;
let onlineU       = {};
let dmMeta        = {};

// Per-chat cache: { 'global' or dmId : { msgs:[{key,val}], oldestKey, scrollTop, atBottom, listenersAttached } }
const chatCache = Object.create(null);

let gReply = null, dmReply = null;
let gTypT  = null, dmTypT  = null;
let isGTyp = false, isDmTyp = false;
let presInt = null;
let presenceListenerAttached = false;
let dmListListenerAttached = false;
let dmTypingRef = null;
let gUnread = 0;
const dmUnread = {};

/* ════════════════════════════════════════════════════════════════════
   3. HELPERS
═════════════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const linkify = s => s.replace(/(https?:\/\/[^\s<>"']{4,})/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
const mentionify = s => s.replace(/(^|\s)@([a-z0-9_]{2,20})/g,'$1<span class="bqmen">@$2</span>');
const tsStr = ts => new Date(ts).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
const dmKey = (a,b) => [a,b].sort().join('__');
const sanitUN = v => (v||'').toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20);
const uColor = n => { let h=0; for(let i=0;i<n.length;i++) h=(Math.imul(h,31)+n.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length]; };
const uInit  = n => (n||'?').slice(0,2).toUpperCase();
const myInit = () => myProfile.initials || uInit(uname||'?');
const statusInfo = id => STATUS_LIST.find(s=>s.id===id) || STATUS_LIST[0];
const debounce = (fn,ms) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
const throttle = (fn,ms) => { let last=0,t; return (...a)=>{ const now=Date.now(); if(now-last>=ms){ last=now; fn(...a); } else { clearTimeout(t); t=setTimeout(()=>{last=Date.now(); fn(...a);},ms-(now-last)); } }; };

function getAliases(){ try{return JSON.parse(localStorage.getItem(LS_ALIAS)||'{}');}catch{return {};} }
function getAlias(u){ return getAliases()[u]||''; }
function setAlias(u,v){
  const a=getAliases();
  if(v&&v.trim()) a[u]=v.trim().slice(0,24); else delete a[u];
  localStorage.setItem(LS_ALIAS,JSON.stringify(a));
}
function getPins(){ try{return JSON.parse(localStorage.getItem(LS_PINS)||'[]');}catch{return [];} }
function togglePin(did){
  const p=getPins(),i=p.indexOf(did);
  if(i>-1) p.splice(i,1); else p.unshift(did);
  localStorage.setItem(LS_PINS,JSON.stringify(p));
  renderDmList();
}

function getTheme(){ try{return localStorage.getItem(LS_THEME)||'dark';}catch{return 'dark';} }
function setTheme(t){
  try{localStorage.setItem(LS_THEME,t||'dark');}catch{}
  applyTheme(t||'dark');
}
function applyTheme(t){
  const p=document.getElementById('bqp');
  if(p) p.dataset.theme = t || 'dark';
}

function toast(msg){
  let t=document.getElementById('bqtoast');
  if(!t){ t=document.createElement('div'); t.id='bqtoast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ════════════════════════════════════════════════════════════════════
   4. CSS  (4 themes via [data-theme] attribute on #bqp)
═════════════════════════════════════════════════════════════════════ */
const CSS = `
#bqfab,#bqp,#bqp *,#bqtoast,#bqmenu,#bqsheet,#bqemoji{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-tap-highlight-color:transparent}

/* THEME TOKENS — DARK (default) */
#bqp{
  --bg:#0f1115; --bg2:#171a21; --bg3:#1f242d;
  --tx:#e6e8ec; --tx2:#9aa0a8; --tx3:#6b7079;
  --br:#262b35; --br2:#2f3540;
  --acc:#3b82f6; --acc2:#60a5fa;
  --me:#3b82f6; --me-tx:#fff;
  --them:#1f242d; --them-tx:#e6e8ec;
  --hd:#171a21; --hd-tx:#e6e8ec;
  --rep:#262b35;
  --suc:#22c55e; --err:#ef4444; --warn:#f59e0b;
  --rad:14px;
  --shd:0 6px 24px rgba(0,0,0,.4);
}
#bqp[data-theme=light]{
  --bg:#ffffff; --bg2:#f4f5f7; --bg3:#e9ecf1;
  --tx:#0f1115; --tx2:#5a6168; --tx3:#8a9099;
  --br:#e1e4ea; --br2:#cdd2da;
  --acc:#2563eb; --acc2:#3b82f6;
  --me:#2563eb; --me-tx:#fff;
  --them:#eef0f4; --them-tx:#0f1115;
  --hd:#ffffff; --hd-tx:#0f1115;
  --rep:#e9ecf1;
  --shd:0 6px 24px rgba(15,17,21,.12);
}
#bqp[data-theme=whatsapp]{
  --bg:#ECE5DD; --bg2:#F0EAE2; --bg3:#D9D2C7;
  --tx:#111b21; --tx2:#54656f; --tx3:#8696a0;
  --br:#d1d7db; --br2:#b9c0c5;
  --acc:#075E54; --acc2:#128C7E;
  --me:#DCF8C6; --me-tx:#111b21;
  --them:#FFFFFF; --them-tx:#111b21;
  --hd:#075E54; --hd-tx:#ffffff;
  --rep:#e6dfd6;
  --shd:0 4px 16px rgba(0,0,0,.18);
}
#bqp[data-theme=oled]{
  --bg:#000000; --bg2:#000000; --bg3:#0a0a0a;
  --tx:#ffffff; --tx2:#a3a3a3; --tx3:#737373;
  --br:#1a1a1a; --br2:#262626;
  --acc:#ffffff; --acc2:#e5e5e5;
  --me:#1a1a1a; --me-tx:#ffffff;
  --them:#0a0a0a; --them-tx:#ffffff;
  --hd:#000000; --hd-tx:#ffffff;
  --rep:#1a1a1a;
  --shd:none;
}

/* FAB */
#bqfab{position:fixed;bottom:18px;right:18px;width:58px;height:58px;border-radius:50%;
  background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;
  border:none;cursor:pointer;box-shadow:0 8px 24px rgba(59,130,246,.4);z-index:2147483646;
  transition:transform .15s}
#bqfab:hover{transform:scale(1.06)}
#bqfab svg{width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:2}
#bqfab .badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;
  font-size:11px;min-width:20px;height:20px;border-radius:10px;padding:0 6px;
  display:none;align-items:center;justify-content:center;font-weight:600}
#bqfab .badge.show{display:flex}

/* PANEL */
#bqp{position:fixed;bottom:18px;right:18px;width:380px;height:600px;max-height:88vh;
  background:var(--bg);color:var(--tx);border:1px solid var(--br);border-radius:18px;
  box-shadow:var(--shd);z-index:2147483646;display:none;flex-direction:column;overflow:hidden}
#bqp.open{display:flex;animation:bqIn .2s ease}
@keyframes bqIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
@media (max-width:520px){
  #bqp{right:0;bottom:0;width:100vw;height:100vh;max-height:100vh;border-radius:0;border:none}
}

/* HEADER */
.bqhd{background:var(--hd);color:var(--hd-tx);padding:12px 14px;display:flex;align-items:center;gap:10px;
  border-bottom:1px solid var(--br);min-height:54px}
.bqhd .ttl{font-weight:600;font-size:15px;flex:1;display:flex;align-items:center;gap:8px}
.bqhd .sub{font-size:11px;opacity:.75;font-weight:400;margin-top:1px}
.bqhd-x{background:none;border:none;color:inherit;cursor:pointer;padding:6px;border-radius:8px;display:flex}
.bqhd-x:hover{background:rgba(255,255,255,.1)}
#bqp[data-theme=light] .bqhd-x:hover{background:rgba(0,0,0,.06)}
.bqhd-x svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2}
.bqhdav{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:13px;color:#000;flex-shrink:0;cursor:pointer}

/* BODY */
.bqbody{flex:1;overflow:hidden;position:relative}
.bqview{position:absolute;inset:0;display:none;flex-direction:column}
.bqview.active{display:flex}

/* MESSAGES */
.bqmsgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px;background:var(--bg)}
.bqmsgs::-webkit-scrollbar{width:6px}
.bqmsgs::-webkit-scrollbar-thumb{background:var(--br2);border-radius:3px}
.bqload-more{align-self:center;background:var(--bg2);color:var(--tx2);border:1px solid var(--br);
  padding:6px 14px;border-radius:14px;font-size:12px;cursor:pointer;margin:4px 0}
.bqload-more:hover{background:var(--bg3)}
.bqdate{align-self:center;background:var(--bg2);color:var(--tx2);font-size:11px;padding:3px 10px;
  border-radius:10px;margin:8px 0 4px}

.bqmsg{display:flex;gap:8px;max-width:85%;align-items:flex-end}
.bqmsg.me{align-self:flex-end;flex-direction:row-reverse}
.bqmsg.sys{align-self:center;font-size:11px;color:var(--tx3);font-style:italic;padding:4px 0}
.bqav{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:11px;color:#000;flex-shrink:0;cursor:pointer}
.bqmsg.me .bqav{display:none}
.bqmsg.consec .bqav{visibility:hidden}
.bqcol{display:flex;flex-direction:column;gap:2px;min-width:0}
.bqmsg.me .bqcol{align-items:flex-end}
.bqu{font-size:11px;color:var(--tx2);padding:0 4px;font-weight:600}
.bqmsg.me .bqu{display:none}
.bqmsg.consec .bqu{display:none}
.bqb{background:var(--them);color:var(--them-tx);padding:7px 11px;border-radius:var(--rad);
  font-size:14px;line-height:1.4;word-wrap:break-word;overflow-wrap:break-word;cursor:pointer;
  position:relative;user-select:text}
.bqmsg.me .bqb{background:var(--me);color:var(--me-tx)}
.bqb a{color:inherit;text-decoration:underline}
.bqmen{color:var(--acc);font-weight:600}
.bqts{font-size:10px;color:var(--tx3);padding:0 4px;display:flex;align-items:center;gap:4px}
.bqrep{background:var(--rep);border-left:3px solid var(--acc);padding:4px 8px;margin-bottom:4px;
  border-radius:8px;font-size:12px;color:var(--tx2);max-width:100%}
.bqrep b{color:var(--tx);display:block;font-size:11px;margin-bottom:1px}
.bqrxns{display:flex;flex-wrap:wrap;gap:3px;padding:0 4px;margin-top:2px}
.bqrx{background:var(--bg2);border:1px solid var(--br);padding:1px 7px;border-radius:10px;
  font-size:11px;cursor:pointer;display:flex;gap:3px;align-items:center}
.bqrx.mine{background:var(--acc);color:var(--me-tx);border-color:var(--acc)}
#bqp[data-theme=whatsapp] .bqrx.mine{color:#fff}

/* TYPING */
.bqtyp{padding:4px 14px;font-size:12px;color:var(--tx2);min-height:22px;display:flex;align-items:center;gap:6px}
.bqtd{display:inline-flex;gap:2px}
.bqtd span{width:5px;height:5px;border-radius:50%;background:var(--tx2);animation:bqbl 1.2s infinite}
.bqtd span:nth-child(2){animation-delay:.15s}
.bqtd span:nth-child(3){animation-delay:.3s}
@keyframes bqbl{0%,60%,100%{opacity:.3}30%{opacity:1}}

/* INPUT */
.bqin{background:var(--bg);border-top:1px solid var(--br);padding:10px}
.bqin-rep{background:var(--rep);border-left:3px solid var(--acc);padding:6px 10px;border-radius:8px;
  margin-bottom:6px;font-size:12px;color:var(--tx2);display:flex;justify-content:space-between;gap:8px}
.bqin-rep b{color:var(--tx)}
.bqin-rep button{background:none;border:none;color:var(--tx2);cursor:pointer;font-size:16px;line-height:1}
.bqin-row{display:flex;gap:6px;align-items:flex-end}
.bqin textarea{flex:1;background:var(--bg2);border:1px solid var(--br);border-radius:18px;color:var(--tx);
  padding:8px 14px;font-size:14px;resize:none;min-height:36px;max-height:96px;outline:none;font-family:inherit}
.bqin textarea:focus{border-color:var(--acc)}
.bqib{background:none;border:none;color:var(--tx2);cursor:pointer;padding:6px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0}
.bqib:hover{background:var(--bg2);color:var(--tx)}
.bqib svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2}
.bqib.send{background:var(--acc);color:#fff}
.bqib.send:hover{background:var(--acc2);color:#fff}
.bqib.send svg{fill:currentColor;stroke:none}
#bqp[data-theme=oled] .bqib.send{background:#fff;color:#000}

/* FOOTER NAV */
.bqfn{display:flex;border-top:1px solid var(--br);background:var(--bg2)}
.bqfn button{flex:1;background:none;border:none;color:var(--tx2);padding:8px 4px;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;position:relative;font-family:inherit}
.bqfn button.on{color:var(--acc)}
#bqp[data-theme=oled] .bqfn button.on{color:#fff}
.bqfn svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2}
.bqfn .nb{position:absolute;top:4px;right:30%;background:var(--err);color:#fff;font-size:9px;
  min-width:14px;height:14px;border-radius:7px;padding:0 4px;display:none;align-items:center;justify-content:center}
.bqfn .nb.show{display:flex}

/* DM LIST */
.bqdml{flex:1;overflow-y:auto;padding:6px}
.bqdmr{display:flex;gap:10px;padding:10px;border-radius:10px;cursor:pointer;align-items:center}
.bqdmr:hover{background:var(--bg2)}
.bqdmr .info{flex:1;min-width:0}
.bqdmr .top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.bqdmr .nm{font-weight:600;font-size:14px;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bqdmr .tm{font-size:10px;color:var(--tx3);flex-shrink:0}
.bqdmr .lm{font-size:12px;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bqdmr .ub{background:var(--acc);color:var(--me-tx);font-size:10px;min-width:18px;height:18px;
  border-radius:9px;padding:0 5px;display:flex;align-items:center;justify-content:center;font-weight:600}
.bqdmr .pin{color:var(--acc);font-size:11px}

/* ONLINE */
.bqonl{flex:1;overflow-y:auto;padding:6px}
.bqonr{display:flex;gap:10px;padding:10px;border-radius:10px;cursor:pointer;align-items:center}
.bqonr:hover{background:var(--bg2)}
.bqonr .info{flex:1;min-width:0}
.bqonr .nm{font-weight:600;font-size:14px;color:var(--tx)}
.bqonr .st{font-size:11px;color:var(--tx2);display:flex;align-items:center;gap:4px}
.bqonr .sd{width:7px;height:7px;border-radius:50%;background:var(--suc)}

.bqempty{text-align:center;padding:40px 20px;color:var(--tx3)}
.bqempty .ic{font-size:38px;margin-bottom:8px;opacity:.5}
.bqempty .tx{font-size:14px;margin-bottom:4px;color:var(--tx2)}
.bqempty .sub{font-size:12px}

/* SETTINGS */
.bqset{flex:1;overflow-y:auto;padding:14px}
.bqset h3{font-size:11px;text-transform:uppercase;color:var(--tx3);margin:14px 0 6px;letter-spacing:.5px;font-weight:600}
.bqset h3:first-child{margin-top:0}
.bqset .row{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;
  background:var(--bg2);border-radius:10px;margin-bottom:6px;gap:10px}
.bqset .row label{font-size:13px;color:var(--tx);flex:1}
.bqset input[type=text]{background:var(--bg3);border:1px solid var(--br);color:var(--tx);
  padding:6px 10px;border-radius:8px;font-size:13px;outline:none;font-family:inherit;width:100%}
.bqset input[type=text]:focus{border-color:var(--acc)}
.bqthemes{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.bqthemes button{background:var(--bg2);border:2px solid var(--br);color:var(--tx);padding:12px 8px;
  border-radius:10px;cursor:pointer;font-size:12px;text-align:center;font-family:inherit;font-weight:500}
.bqthemes button.on{border-color:var(--acc)}
.bqthemes .swatch{height:24px;border-radius:6px;margin-bottom:6px;border:1px solid rgba(0,0,0,.15)}

/* AUTH */
.bqauth{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:14px;text-align:center}
.bqauth h2{margin:0;font-size:20px;color:var(--tx)}
.bqauth p{margin:0;font-size:13px;color:var(--tx2)}
.bqauth input{background:var(--bg2);border:1px solid var(--br);color:var(--tx);padding:10px 14px;
  border-radius:10px;font-size:14px;width:100%;outline:none;font-family:inherit;text-align:center}
.bqauth input:focus{border-color:var(--acc)}
.bqauth button{background:var(--acc);color:var(--me-tx);border:none;padding:10px 24px;border-radius:10px;
  cursor:pointer;font-size:14px;font-weight:600;width:100%;font-family:inherit}
.bqauth .err{color:var(--err);font-size:12px;min-height:16px}

/* MESSAGE ACTION POPOVER (the fix) */
#bqmenu{position:fixed;background:var(--bg2,#171a21);border:1px solid var(--br,#262b35);
  border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:2147483647;
  display:none;flex-direction:column;min-width:160px;color:var(--tx,#e6e8ec);overflow:hidden}
#bqmenu.show{display:flex;animation:bqIn .12s ease}
#bqmenu .quick{display:flex;gap:2px;padding:6px;border-bottom:1px solid var(--br,#262b35);justify-content:space-between}
#bqmenu .quick button{background:none;border:none;font-size:18px;cursor:pointer;padding:4px 6px;border-radius:6px;line-height:1}
#bqmenu .quick button:hover{background:var(--bg3,#1f242d)}
#bqmenu .item{background:none;border:none;color:inherit;padding:9px 14px;text-align:left;cursor:pointer;
  font-size:13px;display:flex;align-items:center;gap:10px;font-family:inherit}
#bqmenu .item:hover{background:var(--bg3,#1f242d)}
#bqmenu .item.danger{color:var(--err,#ef4444)}
#bqmenu .item svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2}

/* EMOJI PICKER */
#bqemoji{position:fixed;background:var(--bg2,#171a21);border:1px solid var(--br,#262b35);
  border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:2147483647;
  padding:8px;display:none;grid-template-columns:repeat(8,1fr);gap:2px;max-width:280px}
#bqemoji.show{display:grid}
#bqemoji button{background:none;border:none;font-size:20px;cursor:pointer;padding:4px;border-radius:6px}
#bqemoji button:hover{background:var(--bg3,#1f242d)}

/* TOAST */
#bqtoast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);
  background:rgba(0,0,0,.85);color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;
  z-index:2147483647;opacity:0;transition:all .2s;pointer-events:none;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
#bqtoast.show{opacity:1;transform:translateX(-50%) translateY(0)}
`;

/* ════════════════════════════════════════════════════════════════════
   5. UI MARKUP
═════════════════════════════════════════════════════════════════════ */
const HTML = `
<button id="bqfab" aria-label="Open chat">
  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  <span class="badge" id="bqfab-badge">0</span>
</button>

<div id="bqp" data-theme="dark" role="dialog">
  <div class="bqhd" id="bqhd">
    <div id="bqhd-content" style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
      <div class="bqhdav" id="bq-me-av">?</div>
      <div style="flex:1;min-width:0">
        <div class="ttl" id="bqhd-title">Chat</div>
        <div class="sub" id="bqhd-sub"></div>
      </div>
    </div>
    <button class="bqhd-x" id="bqhd-back" style="display:none" aria-label="Back">
      <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button class="bqhd-x" id="bqhd-close" aria-label="Close">
      <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>

  <div class="bqbody">
    <!-- Auth view -->
    <div class="bqview" id="bqv-auth">
      <div class="bqauth">
        <h2>Pick a username</h2>
        <p>Letters, numbers, and underscore only.</p>
        <input id="bqauth-input" placeholder="username" maxlength="20" autocomplete="off"/>
        <div class="err" id="bqauth-err"></div>
        <button id="bqauth-go">Continue</button>
      </div>
    </div>

    <!-- Global chat -->
    <div class="bqview" id="bqv-chat">
      <div class="bqmsgs" id="bqmsgs-global" data-ctx="global"></div>
      <div class="bqtyp" id="bqgtyp"></div>
      <div class="bqin" id="bqin-global"></div>
    </div>

    <!-- DM list -->
    <div class="bqview" id="bqv-dms">
      <div class="bqdml" id="bqdml"></div>
    </div>

    <!-- DM conversation -->
    <div class="bqview" id="bqv-dmconv">
      <div class="bqmsgs" id="bqmsgs-dm" data-ctx="dm"></div>
      <div class="bqtyp" id="bqdmtyp"></div>
      <div class="bqin" id="bqin-dm"></div>
    </div>

    <!-- Online list -->
    <div class="bqview" id="bqv-online">
      <div class="bqonl" id="bqonl"></div>
    </div>

    <!-- Settings -->
    <div class="bqview" id="bqv-settings">
      <div class="bqset" id="bqset"></div>
    </div>
  </div>

  <div class="bqfn" id="bqfn">
    <button data-view="chat" class="on">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Chat</span>
    </button>
    <button data-view="dms">
      <svg viewBox="0 0 24 24"><path d="M3 7l9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
      <span>DMs</span><span class="nb" id="bqnb-dms">0</span>
    </button>
    <button data-view="online">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
      <span>Online</span><span class="nb" id="bqnb-online">0</span>
    </button>
    <button data-view="settings">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      <span>Settings</span>
    </button>
  </div>
</div>

<div id="bqmenu"></div>
<div id="bqemoji"></div>
`;

/* ════════════════════════════════════════════════════════════════════
   6. INPUT BAR (rendered into #bqin-global / #bqin-dm)
═════════════════════════════════════════════════════════════════════ */
function inputHTML(ctx){
  const repId = ctx==='global' ? 'bqrep-g' : 'bqrep-dm';
  const taId  = ctx==='global' ? 'bqta-g'  : 'bqta-dm';
  return `
    <div id="${repId}" style="display:none"></div>
    <div class="bqin-row">
      <button class="bqib" data-act="emoji" aria-label="Emoji">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
      </button>
      <textarea id="${taId}" placeholder="Type a message…" rows="1" maxlength="${CHAR_LIMIT}"></textarea>
      <button class="bqib send" data-act="send" aria-label="Send">
        <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
      </button>
    </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   7. MESSAGE RENDERING
═════════════════════════════════════════════════════════════════════ */
function chatKey(ctx){ return ctx==='global' ? 'global' : activeDmId; }
function getCache(ctx){
  const k = chatKey(ctx); if (!k) return null;
  if (!chatCache[k]) chatCache[k] = { msgs:[], oldestKey:null, scrollTop:null, atBottom:true, listenersAttached:false, paintedKeys:new Set(), firstOpen:true };
  return chatCache[k];
}
function msgsContainer(ctx){
  return document.getElementById(ctx==='global' ? 'bqmsgs-global' : 'bqmsgs-dm');
}

function buildMsgEl(ctx, msg, key){
  const el = document.createElement('div');
  el.id = 'bqmsg-' + ctx + '-' + key;
  el.dataset.key = key;
  el.dataset.ctx = ctx;
  el.dataset.uid = msg.uid || '';

  if (msg.type === 'system'){
    el.className = 'bqmsg sys';
    el.textContent = msg.text || '';
    return el;
  }
  const mine = msg.uid === uid;
  el.className = 'bqmsg' + (mine ? ' me' : '');
  const dispName = (!mine && msg.uid && getAlias(msg.uid)) || msg.uname || '?';
  const col = uColor(msg.uname || msg.uid || '?');
  const initials = (onlineU[msg.uid]?.initials) || uInit(dispName);

  let inner = '';
  if (!mine) inner += `<div class="bqav" data-uid="${esc(msg.uid||'')}" style="background:${col}">${esc(initials)}</div>`;
  inner += `<div class="bqcol">`;
  if (!mine) inner += `<div class="bqu">${esc(dispName)}</div>`;
  inner += `<div class="bqb" data-key="${esc(key)}">`;
  if (msg.replyTo){
    inner += `<div class="bqrep"><b>${esc(msg.replyTo.uname||'?')}</b>${esc(msg.replyTo.text||'')}</div>`;
  }
  const text = mentionify(linkify(esc(msg.text||'')));
  inner += text || '&nbsp;';
  inner += `</div>`;
  inner += `<div class="bqts">${tsStr(msg.ts||Date.now())}</div>`;
  if (msg.reactions) inner += rxnsHTML(msg.reactions);
  inner += `</div>`;
  el.innerHTML = inner;

  // store msg payload for menu actions
  el._bqmsg = msg;
  return el;
}

function rxnsHTML(rxns){
  let out = '<div class="bqrxns">';
  Object.keys(rxns).forEach(em => {
    const users = rxns[em] || {};
    const count = Object.keys(users).length;
    if (!count) return;
    const mine = users[uid] ? ' mine' : '';
    out += `<button class="bqrx${mine}" data-em="${esc(em)}">${em}<span>${count}</span></button>`;
  });
  out += '</div>';
  return out;
}

function appendOrReplace(ctx, msg, key){
  const cache = getCache(ctx); if (!cache) return;
  const cont = msgsContainer(ctx); if (!cont) return;

  const existing = document.getElementById('bqmsg-'+ctx+'-'+key);
  const el = buildMsgEl(ctx, msg, key);

  if (existing){
    existing.replaceWith(el);
    return;
  }

  cache.paintedKeys.add(key);
  cache.msgs.push({key, val:msg});

  // sort-insert by ts
  let inserted = false;
  const kids = cont.children;
  for (let i = kids.length - 1; i >= 0; i--){
    const k = kids[i];
    if (!k.dataset.key) continue;
    const km = k._bqmsg;
    if (km && (km.ts||0) <= (msg.ts||0)){
      k.after(el); inserted = true; break;
    }
  }
  if (!inserted){
    // place after the "load more" button if present, else at top
    const lm = cont.querySelector('.bqload-more');
    if (lm) lm.after(el); else cont.prepend(el);
  }

  applyConsec(cont);
  trimDom(ctx);

  if (cache.atBottom) scrollToBottom(ctx);
}

function applyConsec(cont){
  let prev = null;
  [...cont.children].forEach(el => {
    if (!el.classList.contains('bqmsg') || el.classList.contains('sys')){ prev=null; return; }
    const same = prev && prev.dataset.uid === el.dataset.uid &&
                 (el._bqmsg?.ts - prev._bqmsg?.ts) < 60000;
    el.classList.toggle('consec', !!same);
    prev = el;
  });
}

function trimDom(ctx){
  const cont = msgsContainer(ctx);
  const cache = getCache(ctx); if (!cont || !cache) return;
  while (cache.msgs.length > HARD_CAP){
    const removed = cache.msgs.shift();
    const elr = document.getElementById('bqmsg-'+ctx+'-'+removed.key);
    if (elr) elr.remove();
    cache.paintedKeys.delete(removed.key);
  }
}

function scrollToBottom(ctx){
  const cont = msgsContainer(ctx); if (!cont) return;
  cont.scrollTop = cont.scrollHeight;
}

function removeMsg(ctx, key){
  const el = document.getElementById('bqmsg-'+ctx+'-'+key); if (el) el.remove();
  const cache = getCache(ctx); if (cache){
    cache.msgs = cache.msgs.filter(m => m.key !== key);
    cache.paintedKeys.delete(key);
  }
}

/* ════════════════════════════════════════════════════════════════════
   8. FIREBASE LISTENERS (lazy-attach, detach when leaving)
═════════════════════════════════════════════════════════════════════ */
function attachGlobalListeners(){
  const cache = getCache('global'); if (cache.listenersAttached) return;
  cache.listenersAttached = true;
  const ref = db.ref('bq_messages').limitToLast(INITIAL_LOAD);
  cache._refs = [ref];

  ref.on('child_added', s => appendOrReplace('global', s.val(), s.key));
  ref.on('child_changed', s => appendOrReplace('global', s.val(), s.key));
  ref.on('child_removed', s => removeMsg('global', s.key));

  const tref = db.ref('bq_typing');
  cache._typingRef = tref;
  tref.on('value', snap => {
    const now=Date.now(), ty=[];
    snap.forEach(c=>{ const d=c.val(); if(c.key!==uid && d && now-d.ts<3800) ty.push('@'+(d.uname||'?')); });
    const el = document.getElementById('bqgtyp');
    if (!el) return;
    if (!ty.length){ el.innerHTML=''; return; }
    const lb = ty.length>2 ? ty.slice(0,2).join(', ')+' +'+(ty.length-2) : ty.join(' & ');
    el.innerHTML = `<div class="bqtd"><span></span><span></span><span></span></div><span>${esc(lb)} typing</span>`;
  });
}

function attachDmListeners(did){
  const cache = getCache('dm'); if (cache.listenersAttached) return;
  cache.listenersAttached = true;
  const ref = db.ref('bq_dms/'+did+'/messages').limitToLast(INITIAL_LOAD);
  cache._refs = [ref];

  ref.on('child_added', s => appendOrReplace('dm', s.val(), s.key));
  ref.on('child_changed', s => appendOrReplace('dm', s.val(), s.key));
  ref.on('child_removed', s => removeMsg('dm', s.key));

  // mark read
  db.ref('bq_dms/'+did+'/meta/unread/'+uid).set(0);

  // typing
  const tref = db.ref('bq_dm_typing/'+did);
  cache._typingRef = tref;
  dmTypingRef = tref;
  tref.on('value', snap => {
    const now=Date.now(), ty=[];
    snap.forEach(c=>{ const d=c.val(); if(c.key!==uid && d && now-d.ts<3800) ty.push('@'+(d.uname||'?')); });
    const el = document.getElementById('bqdmtyp');
    if (!el) return;
    if (!ty.length){ el.innerHTML=''; return; }
    const lb = ty.join(' & ');
    el.innerHTML = `<div class="bqtd"><span></span><span></span><span></span></div><span>${esc(lb)} typing</span>`;
  });
}

function detachListeners(ctx){
  const cache = getCache(ctx); if (!cache || !cache.listenersAttached) return;
  if (cache._refs) cache._refs.forEach(r => r.off());
  if (cache._typingRef) cache._typingRef.off();
  cache.listenersAttached = false;
  cache._refs = null; cache._typingRef = null;
}

function loadEarlier(ctx){
  const cache = getCache(ctx); if (!cache || !cache.msgs.length) return;
  const oldest = cache.msgs[0];
  const path = ctx==='global' ? 'bq_messages' : ('bq_dms/'+activeDmId+'/messages');
  const cont = msgsContainer(ctx);
  const prevH = cont.scrollHeight;
  db.ref(path).orderByKey().endBefore(oldest.key).limitToLast(PAGE_SIZE).once('value', snap => {
    const items = [];
    snap.forEach(c => items.push({key:c.key, val:c.val()}));
    if (!items.length){
      const lm = cont.querySelector('.bqload-more'); if (lm) lm.remove();
      return;
    }
    items.reverse().forEach(({key,val}) => {
      if (cache.paintedKeys.has(key)) return;
      const el = buildMsgEl(ctx, val, key);
      const lm = cont.querySelector('.bqload-more');
      (lm ? lm.after.bind(lm) : cont.prepend.bind(cont))(el);
      cache.paintedKeys.add(key);
      cache.msgs.unshift({key, val});
    });
    applyConsec(cont);
    // preserve scroll position
    cont.scrollTop = cont.scrollHeight - prevH;
    if (items.length < PAGE_SIZE){
      const lm = cont.querySelector('.bqload-more'); if (lm) lm.remove();
    }
  });
}

function ensureLoadMore(ctx){
  const cont = msgsContainer(ctx); if (!cont) return;
  if (cont.querySelector('.bqload-more')) return;
  const btn = document.createElement('button');
  btn.className = 'bqload-more';
  btn.textContent = 'Load earlier messages';
  btn.addEventListener('click', e => { e.stopPropagation(); loadEarlier(ctx); });
  cont.prepend(btn);
}

/* ════════════════════════════════════════════════════════════════════
   9. SEND
═════════════════════════════════════════════════════════════════════ */
function sendGlobal(text){
  if (!db || !text.trim() || !uname) return;
  const p = { uid, uname, text:text.trim().slice(0,CHAR_LIMIT), ts:Date.now() };
  if (gReply) p.replyTo = { key:gReply.key, uname:gReply.uname, text:(gReply.text||'').slice(0,80) };
  db.ref('bq_messages').push(p);
  clearReply('global');
}

function sendDm(text){
  if (!db || !uname || !activeDmId || !activeDmPuid || !text.trim()) return;
  const trimmed = text.trim().slice(0,CHAR_LIMIT);
  const pname = activeDmPname || '?';
  const p = { uid, uname, text:trimmed, ts:Date.now() };
  if (dmReply) p.replyTo = { key:dmReply.key, uname:dmReply.uname, text:(dmReply.text||'').slice(0,80) };
  db.ref('bq_dms/'+activeDmId+'/messages').push(p);
  const sorted = [uid, activeDmPuid].sort();
  db.ref('bq_dms/'+activeDmId+'/meta').update({
    p1:sorted[0], p2:sorted[1],
    n1:sorted[0]===uid?uname:pname,
    n2:sorted[0]===uid?pname:uname,
    lastMsg:trimmed.slice(0,60), lastTs:Date.now(),
  });
  db.ref('bq_dms/'+activeDmId+'/meta/unread/'+activeDmPuid).transaction(n => (n||0)+1);
  clearReply('dm');
}

function setReply(ctx, key, msg){
  if (ctx==='global'){ gReply = { key, uname:msg.uname, text:msg.text||'' }; }
  else { dmReply = { key, uname:msg.uname, text:msg.text||'' }; }
  paintReply(ctx);
}
function clearReply(ctx){
  if (ctx==='global') gReply = null; else dmReply = null;
  paintReply(ctx);
}
function paintReply(ctx){
  const id = ctx==='global' ? 'bqrep-g' : 'bqrep-dm';
  const el = document.getElementById(id); if (!el) return;
  const r = ctx==='global' ? gReply : dmReply;
  if (!r){ el.style.display='none'; el.innerHTML=''; return; }
  el.style.display='block';
  el.innerHTML = `<div class="bqin-rep"><div><b>Replying to ${esc(r.uname||'?')}</b><br/>${esc((r.text||'').slice(0,60))}</div><button data-clear="1">×</button></div>`;
}

function toggleReact(ctx, key, emoji){
  if (!db) return;
  const path = (ctx==='global' ? 'bq_messages' : 'bq_dms/'+activeDmId+'/messages') + '/' + key + '/reactions/' + emoji + '/' + uid;
  db.ref(path).once('value', s => s.val() ? db.ref(path).remove() : db.ref(path).set(true));
}

function deleteMsg(ctx, key){
  if (!db) return;
  const path = ctx==='global' ? 'bq_messages/'+key : 'bq_dms/'+activeDmId+'/messages/'+key;
  db.ref(path).remove();
}

/* ════════════════════════════════════════════════════════════════════
  10. PRESENCE + DM LIST
═════════════════════════════════════════════════════════════════════ */
function startPresence(){
  if (!db || !uname) return;
  const ref = db.ref('bq_presence/'+uid);
  const beat = () => ref.set({
    uname, ts:Date.now(),
    status: myProfile.status||'online',
    color: myProfile.color||'',
    initials: myProfile.initials||'',
  });
  beat();
  clearInterval(presInt);
  presInt = setInterval(beat, PRESENCE_TTL*0.7);
  ref.onDisconnect().remove();

  if (presenceListenerAttached) return;
  presenceListenerAttached = true;

  const debouncedRender = debounce(() => {
    renderOnlineList();
    updateBadges();
  }, 150);

  db.ref('bq_presence').on('value', snap => {
    const now = Date.now();
    onlineU = {};
    snap.forEach(c => {
      const d = c.val();
      if (d && now - (d.ts||0) < PRESENCE_TTL*1.6) onlineU[c.key] = d;
    });
    debouncedRender();
  });
}

function attachDmListListener(){
  if (dmListListenerAttached || !db || !uid) return;
  dmListListenerAttached = true;
  const debouncedRender = debounce(renderDmList, 150);
  db.ref('bq_dms').on('value', snap => {
    dmMeta = {};
    snap.forEach(c => {
      const m = c.val();
      if (m && m.meta && (m.meta.p1===uid || m.meta.p2===uid)) dmMeta[c.key] = m.meta;
    });
    debouncedRender();
    updateBadges();
  });
}

function renderOnlineList(){
  const list = document.getElementById('bqonl'); if (!list) return;
  const users = Object.entries(onlineU).filter(([k]) => k !== uid);
  if (!users.length){
    list.innerHTML = '<div class="bqempty"><div class="ic">👥</div><div class="tx">No one online</div><div class="sub">Check back soon</div></div>';
    return;
  }
  list.innerHTML = users.map(([puid, d]) => {
    const nm = getAlias(puid) || d.uname || '?';
    const col = d.color || uColor(d.uname || '?');
    const init = d.initials || uInit(nm);
    const si = statusInfo(d.status||'online');
    return `<div class="bqonr" data-puid="${esc(puid)}" data-pname="${esc(d.uname||'?')}">
      <div class="bqav" style="background:${col}">${esc(init)}</div>
      <div class="info">
        <div class="nm">${esc(nm)}</div>
        <div class="st"><span class="sd" style="background:${si.color}"></span>${esc(si.label)}</div>
      </div>
    </div>`;
  }).join('');
}

function renderDmList(){
  const list = document.getElementById('bqdml'); if (!list) return;
  const items = Object.entries(dmMeta);
  if (!items.length){
    list.innerHTML = '<div class="bqempty"><div class="ic">💬</div><div class="tx">No DMs yet</div><div class="sub">Tap Online to start a conversation</div></div>';
    return;
  }
  const pins = getPins();
  items.sort((a,b) => {
    const ap = pins.includes(a[0])?1:0, bp = pins.includes(b[0])?1:0;
    if (ap !== bp) return bp - ap;
    return (b[1].lastTs||0) - (a[1].lastTs||0);
  });
  list.innerHTML = items.map(([did, meta]) => {
    const puid  = meta.p1===uid ? meta.p2 : meta.p1;
    const pname = meta.p1===uid ? (meta.n2||'?') : (meta.n1||'?');
    const dispName = getAlias(puid) || pname;
    const col = (onlineU[puid]?.color) || uColor(pname);
    const init = (onlineU[puid]?.initials) || uInit(dispName);
    const isOn = !!onlineU[puid];
    const unread = (meta.unread && meta.unread[uid]) || 0;
    const tm = meta.lastTs ? tsStr(meta.lastTs) : '';
    const isPin = pins.includes(did);
    return `<div class="bqdmr" data-did="${esc(did)}" data-puid="${esc(puid)}" data-pname="${esc(pname)}">
      <div class="bqav" style="background:${col};position:relative">
        ${esc(init)}
        ${isOn?'<span style="position:absolute;bottom:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:var(--suc);border:2px solid var(--bg)"></span>':''}
      </div>
      <div class="info">
        <div class="top">
          <div class="nm">${esc(dispName)} ${isPin?'<span class="pin">📌</span>':''}</div>
          <div class="tm">${tm}</div>
        </div>
        <div class="top">
          <div class="lm">${esc((meta.lastMsg||'').slice(0,40))}</div>
          ${unread?`<div class="ub">${unread}</div>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateBadges(){
  let dmTotal = 0;
  Object.values(dmMeta).forEach(m => { dmTotal += (m.unread && m.unread[uid]) || 0; });
  const ndb = document.getElementById('bqnb-dms');
  if (ndb){ ndb.textContent = dmTotal; ndb.classList.toggle('show', dmTotal>0); }
  const non = document.getElementById('bqnb-online');
  const onCount = Object.keys(onlineU).filter(k => k !== uid).length;
  if (non){ non.textContent = onCount; non.classList.toggle('show', onCount>0); }
  const fbb = document.getElementById('bqfab-badge');
  const total = dmTotal + gUnread;
  if (fbb){ fbb.textContent = total; fbb.classList.toggle('show', total>0 && !isOpen); }
}

/* ════════════════════════════════════════════════════════════════════
  11. NAVIGATION
═════════════════════════════════════════════════════════════════════ */
function showView(v){
  ['auth','chat','dms','dmconv','online','settings'].forEach(name => {
    const el = document.getElementById('bqv-'+name);
    if (el) el.classList.toggle('active', name === v);
  });
  document.querySelectorAll('#bqfn button').forEach(b => {
    b.classList.toggle('on', b.dataset.view === v);
  });
  // header
  const back = document.getElementById('bqhd-back');
  const title = document.getElementById('bqhd-title');
  const sub = document.getElementById('bqhd-sub');
  back.style.display = (v==='dmconv') ? 'flex' : 'none';
  if (v==='chat'){ title.textContent = 'Global Chat'; sub.textContent = ''; }
  else if (v==='dms'){ title.textContent = 'Direct Messages'; sub.textContent = ''; }
  else if (v==='online'){ title.textContent = 'Online'; sub.textContent = ''; }
  else if (v==='settings'){ title.textContent = 'Settings'; sub.textContent = ''; }
  else if (v==='dmconv'){
    title.textContent = (activeDmPuid && getAlias(activeDmPuid)) || activeDmPname || '?';
    const isOn = !!onlineU[activeDmPuid];
    sub.textContent = isOn ? statusInfo(onlineU[activeDmPuid].status||'online').label : 'Offline';
  }
  else if (v==='auth'){ title.textContent = 'Welcome'; sub.textContent = ''; }
  activeView = v;
  closeMenu(); closeEmoji();
}

function bqNav(v){
  if (v === activeView) return;

  // Save scroll position from current chat view
  if (activeView === 'chat'){
    const c = getCache('global'), cont = msgsContainer('global');
    if (c && cont){ c.scrollTop = cont.scrollTop; c.atBottom = (cont.scrollHeight - cont.scrollTop - cont.clientHeight) < 30; }
  }
  if (activeView === 'dmconv'){
    const c = getCache('dm'), cont = msgsContainer('dm');
    if (c && cont){ c.scrollTop = cont.scrollTop; c.atBottom = (cont.scrollHeight - cont.scrollTop - cont.clientHeight) < 30; }
  }

  // Detach listeners for chats we're leaving
  if (activeView === 'dmconv' && v !== 'dmconv'){
    detachListeners('dm');
  }

  // Show new view
  showView(v);

  // Activate new view's listeners + restore scroll BEFORE paint
  if (v === 'chat'){
    const cont = msgsContainer('global');
    cont.style.visibility = 'hidden';
    attachGlobalListeners();
    if (!document.getElementById('bqin-global').innerHTML) {
      document.getElementById('bqin-global').innerHTML = inputHTML('global');
    }
    requestAnimationFrame(() => {
      const cache = getCache('global');
      if (cache.firstOpen || cache.atBottom){
        cont.scrollTop = cont.scrollHeight;
        cache.firstOpen = false;
      } else if (cache.scrollTop != null){
        cont.scrollTop = cache.scrollTop;
      }
      ensureLoadMore('global');
      cont.style.visibility = 'visible';
    });
  } else if (v === 'dms'){
    attachDmListListener();
    renderDmList();
  } else if (v === 'online'){
    renderOnlineList();
  } else if (v === 'settings'){
    renderSettings();
  }
}

function openDm(puid, pname){
  if (!puid || puid === uid) return;
  activeDmId = dmKey(uid, puid);
  activeDmPuid = puid;
  activeDmPname = pname;
  // reset cache for fresh DM
  if (chatCache[activeDmId]) chatCache[activeDmId].firstOpen = true;
  showView('dmconv');
  const cont = msgsContainer('dm');
  cont.innerHTML = '';
  cont.style.visibility = 'hidden';
  if (!document.getElementById('bqin-dm').innerHTML){
    document.getElementById('bqin-dm').innerHTML = inputHTML('dm');
  } else {
    // ensure input is reset for new chat
    document.getElementById('bqin-dm').innerHTML = inputHTML('dm');
  }
  attachDmListeners(activeDmId);
  requestAnimationFrame(() => {
    const cache = getCache('dm');
    cont.scrollTop = cont.scrollHeight;
    cache.firstOpen = false;
    cache.atBottom = true;
    ensureLoadMore('dm');
    cont.style.visibility = 'visible';
  });
}

function backFromDm(){
  detachListeners('dm');
  // clear DM cache so next open is fresh
  if (activeDmId) delete chatCache[activeDmId];
  activeDmId = null; activeDmPuid = null; activeDmPname = null;
  bqNav('dms');
}

/* ════════════════════════════════════════════════════════════════════
  12. MESSAGE ACTION POPOVER (the fix for issues #1 + #2)
═════════════════════════════════════════════════════════════════════ */
let menuTarget = null; // { ctx, key, msg, mine }

function openMenu(ev, ctx, key, msgEl){
  ev.preventDefault();
  ev.stopPropagation();
  const msg = msgEl._bqmsg; if (!msg) return;
  const mine = msg.uid === uid;
  menuTarget = { ctx, key, msg, mine };

  const m = document.getElementById('bqmenu');
  const quick = QUICK_REACTS.map(em => `<button data-rx="${em}">${em}</button>`).join('');
  m.innerHTML = `
    <div class="quick">${quick}</div>
    <button class="item" data-act="reply">
      <svg viewBox="0 0 24 24"><path d="M9 17l-5-5 5-5M4 12h12a4 4 0 0 1 4 4v3"/></svg>Reply
    </button>
    <button class="item" data-act="copy">
      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy
    </button>
    ${mine ? `<button class="item danger" data-act="delete"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Delete</button>` : ''}
  `;

  // position
  m.classList.add('show');
  m.style.visibility = 'hidden';
  requestAnimationFrame(() => {
    const rect = msgEl.getBoundingClientRect();
    const mw = m.offsetWidth, mh = m.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    let top = rect.top - mh - 6;
    let left = rect.left;
    if (msg.uid === uid) left = rect.right - mw;
    if (top < 8) top = rect.bottom + 6;
    if (top + mh > vh - 8) top = vh - mh - 8;
    if (left < 8) left = 8;
    if (left + mw > vw - 8) left = vw - mw - 8;
    m.style.top = top + 'px';
    m.style.left = left + 'px';
    m.style.visibility = 'visible';
  });
}

function closeMenu(){
  const m = document.getElementById('bqmenu');
  if (m) m.classList.remove('show');
  menuTarget = null;
}

/* ════════════════════════════════════════════════════════════════════
  13. EMOJI PICKER
═════════════════════════════════════════════════════════════════════ */
let emojiTargetTa = null;

function openEmoji(triggerEl, taEl){
  emojiTargetTa = taEl;
  const e = document.getElementById('bqemoji');
  e.innerHTML = EMOJI_LIST.map(em => `<button data-em="${em}">${em}</button>`).join('');
  e.classList.add('show');
  e.style.visibility = 'hidden';
  requestAnimationFrame(() => {
    const rect = triggerEl.getBoundingClientRect();
    const ew = e.offsetWidth, eh = e.offsetHeight;
    let top = rect.top - eh - 6;
    let left = rect.left;
    if (top < 8) top = rect.bottom + 6;
    if (left + ew > window.innerWidth - 8) left = window.innerWidth - ew - 8;
    e.style.top = top + 'px';
    e.style.left = left + 'px';
    e.style.visibility = 'visible';
  });
}
function closeEmoji(){
  const e = document.getElementById('bqemoji');
  if (e) e.classList.remove('show');
  emojiTargetTa = null;
}

/* ════════════════════════════════════════════════════════════════════
  14. SETTINGS
═════════════════════════════════════════════════════════════════════ */
function renderSettings(){
  const s = document.getElementById('bqset'); if (!s) return;
  const t = getTheme();
  const themes = [
    {id:'dark',     label:'Dark',      sw:'linear-gradient(135deg,#171a21,#0f1115)'},
    {id:'light',    label:'Light',     sw:'linear-gradient(135deg,#fff,#e9ecf1)'},
    {id:'whatsapp', label:'WhatsApp',  sw:'linear-gradient(135deg,#075E54,#DCF8C6)'},
    {id:'oled',     label:'Pure Black',sw:'#000'},
  ];
  const statusOpts = STATUS_LIST.map(st => `<option value="${st.id}" ${myProfile.status===st.id?'selected':''}>${st.label}</option>`).join('');
  s.innerHTML = `
    <h3>Profile</h3>
    <div class="row"><label>Username</label><div style="color:var(--tx2);font-size:13px">@${esc(uname||'')}</div></div>
    <div class="row"><label>Initials</label><input type="text" id="bqs-init" value="${esc(myProfile.initials||uInit(uname))}" maxlength="2" style="max-width:60px;text-align:center"/></div>
    <div class="row"><label>Status</label><select id="bqs-status" style="background:var(--bg3);border:1px solid var(--br);color:var(--tx);padding:6px 10px;border-radius:8px;font-size:13px;font-family:inherit">${statusOpts}</select></div>

    <h3>Theme</h3>
    <div class="bqthemes">
      ${themes.map(th => `<button data-theme="${th.id}" class="${t===th.id?'on':''}">
        <div class="swatch" style="background:${th.sw}"></div>${th.label}
      </button>`).join('')}
    </div>

    <h3>About</h3>
    <div class="row"><label>Version</label><div style="color:var(--tx2);font-size:13px">${WIDGET_VERSION}</div></div>
    <div class="row"><label>Sign out</label><button id="bqs-signout" style="background:var(--err);color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-family:inherit">Reset</button></div>
  `;
}

function saveProfile(){
  try{ localStorage.setItem(LS_PROF, JSON.stringify(myProfile)); }catch{}
  refreshHeaderAvatar();
  if (db && uid){
    db.ref('bq_presence/'+uid).update({
      status: myProfile.status||'online',
      initials: myProfile.initials||'',
      color: myProfile.color||'',
    });
  }
}

function refreshHeaderAvatar(){
  const av = document.getElementById('bq-me-av');
  if (!av) return;
  const col = myProfile.color || uColor(uname||'u');
  av.style.background = col;
  av.style.color = '#000';
  av.textContent = myInit();
}

/* ════════════════════════════════════════════════════════════════════
  15. AUTH
═════════════════════════════════════════════════════════════════════ */
async function tryRegister(name){
  const errEl = document.getElementById('bqauth-err');
  errEl.textContent = '';
  name = sanitUN(name);
  if (name.length < 2){ errEl.textContent = 'At least 2 characters.'; return; }
  try {
    const snap = await db.ref('bq_usernames/'+name).once('value');
    const existing = snap.val();
    if (existing && existing !== uid){ errEl.textContent = 'Username taken.'; return; }
    await db.ref('bq_usernames/'+name).set(uid);
    uname = name;
    localStorage.setItem(LS_NAME, uname);
    refreshHeaderAvatar();
    startPresence();
    attachDmListListener();
    bqNav('chat');
  } catch (e){
    errEl.textContent = 'Network error. Try again.';
  }
}

/* ════════════════════════════════════════════════════════════════════
  16. EVENTS
═════════════════════════════════════════════════════════════════════ */
function bindEvents(){
  const fab = document.getElementById('bqfab');
  const panel = document.getElementById('bqp');

  fab.addEventListener('click', () => {
    isOpen = true;
    panel.classList.add('open');
    fab.style.display = 'none';
    if (!uname) showView('auth');
    else if (activeView === 'auth') bqNav('chat');
    else { showView(activeView); if (activeView==='chat') bqNav('chat'); }
    updateBadges();
  });

  document.getElementById('bqhd-close').addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
    fab.style.display = 'flex';
    closeMenu(); closeEmoji();
    updateBadges();
  });

  document.getElementById('bqhd-back').addEventListener('click', backFromDm);

  // Footer nav
  document.getElementById('bqfn').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (b) bqNav(b.dataset.view);
  });

  // Auth
  document.getElementById('bqauth-go').addEventListener('click', () => {
    tryRegister(document.getElementById('bqauth-input').value);
  });
  document.getElementById('bqauth-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') tryRegister(e.target.value);
  });

  // Single delegated listener for both message containers
  panel.addEventListener('click', e => {
    // reaction chip
    const rx = e.target.closest('.bqrx');
    if (rx){
      e.stopPropagation();
      const msgEl = rx.closest('.bqmsg');
      if (msgEl) toggleReact(msgEl.dataset.ctx, msgEl.dataset.key, rx.dataset.em);
      return;
    }
    // avatar in DM list / online list
    const onr = e.target.closest('.bqonr');
    if (onr){
      e.stopPropagation();
      openDm(onr.dataset.puid, onr.dataset.pname);
      return;
    }
    const dmr = e.target.closest('.bqdmr');
    if (dmr){
      e.stopPropagation();
      openDm(dmr.dataset.puid, dmr.dataset.pname);
      return;
    }
    // avatar tap on a message → open DM
    const av = e.target.closest('.bqav[data-uid]');
    if (av && av.dataset.uid && av.dataset.uid !== uid){
      e.stopPropagation();
      const d = onlineU[av.dataset.uid];
      openDm(av.dataset.uid, d?.uname || '?');
      return;
    }
    // input emoji button
    const ib = e.target.closest('.bqib');
    if (ib){
      e.stopPropagation();
      const ctx = ib.closest('#bqin-global') ? 'global' : 'dm';
      const ta = document.getElementById(ctx==='global'?'bqta-g':'bqta-dm');
      if (ib.dataset.act === 'emoji'){ openEmoji(ib, ta); return; }
      if (ib.dataset.act === 'send'){
        const v = ta.value;
        if (ctx==='global') sendGlobal(v); else sendDm(v);
        ta.value = ''; autoSize(ta);
        return;
      }
    }
    // clear-reply button
    if (e.target.dataset?.clear === '1'){
      e.stopPropagation();
      const ctx = e.target.closest('#bqrep-g') ? 'global' : 'dm';
      clearReply(ctx);
      return;
    }
    // settings actions
    const themeBtn = e.target.closest('.bqthemes button');
    if (themeBtn){ e.stopPropagation(); setTheme(themeBtn.dataset.theme); renderSettings(); return; }
    if (e.target.id === 'bqs-signout'){
      if (confirm('Reset username and clear local data?')){
        if (db && uid && uname) db.ref('bq_usernames/'+uname).remove().catch(()=>{});
        if (db && uid) db.ref('bq_presence/'+uid).remove().catch(()=>{});
        localStorage.removeItem(LS_NAME);
        localStorage.removeItem(LS_UID);
        localStorage.removeItem(LS_PROF);
        location.reload();
      }
      return;
    }
  });

  // Settings change events
  panel.addEventListener('change', e => {
    if (e.target.id === 'bqs-init'){ myProfile.initials = (e.target.value||'').toUpperCase().slice(0,2); saveProfile(); }
    if (e.target.id === 'bqs-status'){ myProfile.status = e.target.value; saveProfile(); }
  });

  // Long-press / right-click / pointerdown on message bubble → menu
  // Use pointerdown-capture + stopPropagation so the menu open doesn't trigger
  // the panel-close path.
  let pressTimer = null, pressTarget = null;
  panel.addEventListener('pointerdown', e => {
    const bubble = e.target.closest('.bqb');
    if (!bubble) return;
    const msgEl = bubble.closest('.bqmsg');
    if (!msgEl || msgEl.classList.contains('sys')) return;
    pressTarget = msgEl;
    if (e.pointerType === 'mouse' && e.button === 2) return; // handled by contextmenu
    pressTimer = setTimeout(() => {
      pressTimer = null;
      openMenu(e, msgEl.dataset.ctx, msgEl.dataset.key, msgEl);
    }, 380);
  }, true);
  const cancelPress = () => { if (pressTimer){ clearTimeout(pressTimer); pressTimer=null; } };
  panel.addEventListener('pointerup', cancelPress, true);
  panel.addEventListener('pointercancel', cancelPress, true);
  panel.addEventListener('pointermove', e => {
    if (pressTimer && pressTarget){
      const r = pressTarget.getBoundingClientRect();
      if (e.clientX < r.left-10 || e.clientX > r.right+10 || e.clientY < r.top-10 || e.clientY > r.bottom+10){
        cancelPress();
      }
    }
  }, true);
  panel.addEventListener('contextmenu', e => {
    const bubble = e.target.closest('.bqb');
    if (!bubble) return;
    const msgEl = bubble.closest('.bqmsg');
    if (!msgEl || msgEl.classList.contains('sys')) return;
    cancelPress();
    openMenu(e, msgEl.dataset.ctx, msgEl.dataset.key, msgEl);
  });

  // Menu interactions — stop propagation so they don't bubble out
  const menu = document.getElementById('bqmenu');
  menu.addEventListener('pointerdown', e => e.stopPropagation(), true);
  menu.addEventListener('click', e => {
    e.stopPropagation();
    if (!menuTarget) return;
    const rxBtn = e.target.closest('button[data-rx]');
    if (rxBtn){
      toggleReact(menuTarget.ctx, menuTarget.key, rxBtn.dataset.rx);
      closeMenu(); return;
    }
    const item = e.target.closest('button.item');
    if (!item) return;
    const act = item.dataset.act;
    if (act === 'reply'){
      setReply(menuTarget.ctx, menuTarget.key, menuTarget.msg);
      const ta = document.getElementById(menuTarget.ctx==='global'?'bqta-g':'bqta-dm');
      if (ta) ta.focus();
    } else if (act === 'copy'){
      const txt = menuTarget.msg.text || '';
      try { navigator.clipboard.writeText(txt); toast('Copied'); }
      catch { toast('Copy failed'); }
    } else if (act === 'delete'){
      deleteMsg(menuTarget.ctx, menuTarget.key);
    }
    closeMenu();
  });

  // Emoji picker
  const emoji = document.getElementById('bqemoji');
  emoji.addEventListener('pointerdown', e => e.stopPropagation(), true);
  emoji.addEventListener('click', e => {
    e.stopPropagation();
    const b = e.target.closest('button[data-em]');
    if (!b || !emojiTargetTa) return;
    const ta = emojiTargetTa;
    const start = ta.selectionStart, end = ta.selectionEnd;
    ta.value = ta.value.slice(0,start) + b.dataset.em + ta.value.slice(end);
    ta.selectionStart = ta.selectionEnd = start + b.dataset.em.length;
    autoSize(ta); ta.focus();
    closeEmoji();
  });

  // Outside clicks close menu/emoji
  document.addEventListener('pointerdown', e => {
    if (!menu.contains(e.target) && !e.target.closest('.bqb')) closeMenu();
    if (!emoji.contains(e.target) && !e.target.closest('[data-act="emoji"]')) closeEmoji();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape'){ closeMenu(); closeEmoji(); } });

  // Textarea handling — typing indicator, autosize, enter to send
  panel.addEventListener('input', e => {
    if (e.target.tagName === 'TEXTAREA'){
      autoSize(e.target);
      const ctx = e.target.id === 'bqta-g' ? 'global' : 'dm';
      sendTyping(ctx);
    }
  });
  panel.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA' && e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      const ctx = e.target.id === 'bqta-g' ? 'global' : 'dm';
      const v = e.target.value;
      if (ctx === 'global') sendGlobal(v); else sendDm(v);
      e.target.value = ''; autoSize(e.target);
    }
  });

  // Scroll handlers — auto-load earlier when reaching top, track atBottom
  const wireScroll = (id, ctx) => {
    const cont = document.getElementById(id);
    cont.addEventListener('scroll', throttle(() => {
      const cache = getCache(ctx); if (!cache) return;
      const nearBottom = (cont.scrollHeight - cont.scrollTop - cont.clientHeight) < 30;
      cache.atBottom = nearBottom;
      cache.scrollTop = cont.scrollTop;
      if (cont.scrollTop < 60 && cont.querySelector('.bqload-more')){
        loadEarlier(ctx);
      }
    }, 120), {passive:true});
  };
  wireScroll('bqmsgs-global', 'global');
  wireScroll('bqmsgs-dm', 'dm');

  // Long-press dm row → pin
  let dmlPress = null;
  document.getElementById('bqdml').addEventListener('pointerdown', e => {
    const r = e.target.closest('.bqdmr'); if (!r) return;
    dmlPress = setTimeout(() => {
      togglePin(r.dataset.did);
      toast(getPins().includes(r.dataset.did) ? 'Pinned' : 'Unpinned');
      dmlPress = 'done';
    }, 600);
  });
  const cancelDmlPress = () => { if (dmlPress && dmlPress !== 'done') clearTimeout(dmlPress); dmlPress = null; };
  document.getElementById('bqdml').addEventListener('pointerup', cancelDmlPress);
  document.getElementById('bqdml').addEventListener('pointercancel', cancelDmlPress);
}

function autoSize(el){
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 96) + 'px';
}

const _writeTyping = throttle((path, isOn) => {
  if (isOn) db.ref(path).set({ uname, ts:Date.now() });
  else db.ref(path).remove();
}, 500);

function sendTyping(ctx){
  if (!db || !uname) return;
  if (ctx === 'global'){
    if (!isGTyp){ isGTyp = true; _writeTyping('bq_typing/'+uid, true); }
    clearTimeout(gTypT);
    gTypT = setTimeout(() => { isGTyp = false; _writeTyping('bq_typing/'+uid, false); }, TYPING_TTL);
  } else {
    if (!activeDmId) return;
    if (!isDmTyp){ isDmTyp = true; _writeTyping('bq_dm_typing/'+activeDmId+'/'+uid, true); }
    clearTimeout(dmTypT);
    dmTypT = setTimeout(() => {
      isDmTyp = false;
      if (activeDmId) _writeTyping('bq_dm_typing/'+activeDmId+'/'+uid, false);
    }, TYPING_TTL);
  }
}

/* ════════════════════════════════════════════════════════════════════
  17. INIT
═════════════════════════════════════════════════════════════════════ */
function loadFirebaseScripts(cb){
  if (window.firebase && window.firebase.database) return cb();
  let loaded = 0;
  const need = 2;
  const done = () => { if (++loaded === need) cb(); };
  const a = document.createElement('script');
  a.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
  a.onload = () => {
    const b = document.createElement('script');
    b.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
    b.onload = cb;
    document.head.appendChild(b);
  };
  document.head.appendChild(a);
}

function init(){
  // inject CSS + UI
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const wrap = document.createElement('div');
  wrap.innerHTML = HTML;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  applyTheme(getTheme());
  refreshHeaderAvatar();

  loadFirebaseScripts(() => {
    try {
      if (!window.firebase.apps?.length) window.firebase.initializeApp(FIREBASE_CONFIG);
      db = window.firebase.database();
    } catch (e){ console.error('[bq-widget] firebase init failed', e); return; }
    if (uname){
      startPresence();
      attachDmListListener();
    } else {
      showView('auth');
    }
  });

  bindEvents();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
