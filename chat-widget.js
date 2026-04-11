/**
 * BioQuiz Chat Widget v4
 * Drop-in: <script src="chat-widget.js"></script>
 * Replace FIREBASE_CONFIG with your project config.
 *
 * DB paths:
 *   bq_messages/                 — global chat
 *   bq_dms/{dmId}/messages/      — DM messages
 *   bq_dms/{dmId}/meta           — conversation metadata
 *   bq_presence/{uid}            — online presence + status + activity + bio
 *   bq_typing/{uid}              — global typing
 *   bq_dm_typing/{dmId}/{uid}    — DM typing
 *   bq_usernames/{name}          — unique username registry
 */
(function () {
'use strict';

/* ─────────────────────────────────────────
   FIREBASE CONFIG
───────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain:        "bioquiz-chat.firebaseapp.com",
  databaseURL:       "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "bioquiz-chat",
  storageBucket:     "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId:             "1:616382882153:web:9c8a32401be847468d1df8"
};

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const MAX_MSG      = 120;
const CHAR_LIMIT   = 320;
const TYPING_TTL   = 3000;
const PRESENCE_TTL = 9000;
const LS_UID   = 'bq_chat_uid';
const LS_NAME  = 'bq_chat_uname';
const LS_SOUND = 'bq_chat_sound';
const LS_PROF  = 'bq_chat_profile'; // bio, status, activity, color

const STATUS_LIST = [
  { id:'online',   label:'Online',    color:'#34d399', dot:'🟢' },
  { id:'studying', label:'Studying',  color:'#60a5fa', dot:'📚' },
  { id:'away',     label:'Away',      color:'#fbbf24', dot:'🟡' },
  { id:'busy',     label:'Busy',      color:'#f87171', dot:'🔴' },
];

const PALETTE = [
  '#60a5fa','#34d399','#f472b6','#fbbf24','#a78bfa','#fb923c',
  '#2dd4bf','#e879f9','#4ade80','#f87171','#38bdf8','#facc15',
];

const EMOJI_LIST = ['😊','😂','❤️','🔥','👍','🎉','😮','🧬','💯','🌍','👀','😢'];
const REACTIONS  = ['👍','❤️','😂','😮','🔥','🎉'];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function uColor(n){ let h=0; for(let i=0;i<n.length;i++) h=(Math.imul(h,31)+n.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length]; }
function uInit(n){ return (n||'?').slice(0,2).toUpperCase(); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function linkify(s){ return s.replace(/(https?:\/\/[^\s<>"']{4,})/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); }
function tsStr(ts){ return new Date(ts).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true}); }
function dateLabel(ts){
  const d=new Date(ts),t=new Date();
  if(d.toDateString()===t.toDateString()) return 'TODAY';
  if(d.toDateString()===new Date(Date.now()-86400000).toDateString()) return 'YESTERDAY';
  return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase();
}
function dmKey(a,b){ return [a,b].sort().join('__'); }
function genUID(){ const id='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36); localStorage.setItem(LS_UID,id); return id; }
function sanitUN(v){ return (v||'').toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20); }
function autoH(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,96)+'px'; }
function statusInfo(id){ return STATUS_LIST.find(s=>s.id===id)||STATUS_LIST[0]; }

/* ─────────────────────────────────────────
   CSS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;900&display=swap');

/* ── BUBBLE ── */
#bqb{
  position:fixed;bottom:28px;right:28px;z-index:9900;
  width:54px;height:54px;border-radius:50%;
  background:#fff;border:none;cursor:pointer;padding:0;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 28px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.14);
  transition:transform .28s cubic-bezier(.34,1.4,.64,1),box-shadow .25s;
  will-change:transform;
}
#bqb:hover{transform:scale(1.1);}
#bqb:active{transform:scale(.93);}
#bqb.open{background:#161616;}
.bqi{position:absolute;transition:opacity .22s,transform .22s;}
.bqi-c{fill:#111;}
#bqb.open .bqi-c{opacity:0;transform:scale(.6);}
.bqi-x{opacity:0;fill:none;stroke:rgba(255,255,255,.7);stroke-width:2.5;stroke-linecap:round;transform:scale(.6);}
#bqb.open .bqi-x{opacity:1;transform:scale(1);}
#bqbadge{
  position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;
  background:#f87171;border:2px solid #080808;
  font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 3px;
  animation:bqPop .3s cubic-bezier(.34,1.4,.64,1) both;
}
#bqbadge.show{display:flex;}
@keyframes bqPop{from{transform:scale(0)}to{transform:scale(1)}}

/* ── PANEL ── */
#bqp{
  position:fixed;bottom:94px;right:28px;z-index:9899;
  width:382px;height:580px;max-height:calc(100dvh - 108px);
  background:#0a0a0a;border:1px solid rgba(255,255,255,.1);
  border-radius:16px;display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 28px 90px rgba(0,0,0,.92),0 0 0 1px rgba(255,255,255,.04) inset;
  transform-origin:bottom right;
  transform:scale(.84) translateY(22px);opacity:0;pointer-events:none;
  transition:transform .36s cubic-bezier(.16,1,.3,1),opacity .28s ease;
  will-change:transform,opacity;
}
#bqp.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}
#bqp::after{
  content:'';position:absolute;top:0;left:10%;width:80%;height:1px;pointer-events:none;
  background:linear-gradient(to right,transparent,rgba(255,255,255,.15),transparent);
}
/* Fullscreen mode — FIXED */
#bqp.bq-fs{
  position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;
  width:100vw!important;height:100dvh!important;max-height:100dvh!important;
  border-radius:0!important;border:none!important;
  transform:none!important;opacity:1!important;pointer-events:all!important;
  z-index:99900!important;
  font-size:16px!important;
}
#bqp.bq-fs .bqhtitle{font-size:1rem!important;}
#bqp.bq-fs .bqmsgs{padding:16px 20px 8px!important;}
#bqp.bq-fs .bqbbl{padding:12px 16px!important;font-size:1rem!important;}
#bqp.bq-fs .bqav{width:36px!important;height:36px!important;font-size:.52rem!important;}
#bqp.bq-fs .bqun{font-size:.56rem!important;}
#bqp.bq-fs .bqts{font-size:.42rem!important;}
#bqp.bq-fs .bqri{gap:10px!important;}
#bqp.bq-fs .bqr{padding:0 4px!important;}
#bqp.bq-fs .bqmeta{margin-bottom:3px!important;}
#bqp.bq-fs .bqds{font-size:.42rem!important;margin:14px 0 12px!important;}
#bqp.bq-fs .bqiw{padding:12px 16px 16px!important;}
#bqp.bq-fs .bqinp{padding:12px 14px!important;font-size:1rem!important;min-height:44px!important;}
#bqp.bq-fs .bqsnd{width:44px!important;height:44px!important;}
#bqp.bq-fs .bqsnd svg{width:18px!important;height:18px!important;}
#bqp.bq-fs .bqieo{width:40px!important;height:40px!important;font-size:18px!important;}
#bqp.bq-fs .bqtyp{padding:0 20px 8px!important;font-size:.46rem!important;}
#bqp.bq-fs .bqhdr{padding:14px 18px 12px!important;}
#bqp.bq-fs .bqnb{padding:12px 6px 11px!important;font-size:.48rem!important;}
#bqp.bq-fs .bqnb svg{width:20px!important;height:20px!important;}
#bqp.bq-fs .bqdmr{padding:14px 18px!important;}
#bqp.bq-fs .bqdmav{width:46px!important;height:46px!important;font-size:.58rem!important;}
#bqp.bq-fs .bqdmn{font-size:.72rem!important;}
#bqp.bq-fs .bqdmp{font-size:.56rem!important;}
#bqp.bq-fs .bqdmt{font-size:.42rem!important;}
#bqp.bq-fs .bqurow{padding:12px 18px!important;}
#bqp.bq-fs .bquav{width:44px!important;height:44px!important;font-size:.56rem!important;}
#bqp.bq-fs .bquu{font-size:.72rem!important;}
#bqp.bq-fs .bqust{font-size:.44rem!important;}
#bqp.bq-fs .bquact{font-size:.44rem!important;}
#bqp.bq-fs .bqrp{padding:6px 12px!important;margin-bottom:8px!important;}
#bqp.bq-fs .bqrp-n{font-size:.46rem!important;}
#bqp.bq-fs .bqrp-t{font-size:.64rem!important;}
#bqp.bq-fs .bqacts{top:-40px!important;}
#bqp.bq-fs .bqact{width:34px!important;height:34px!important;font-size:16px!important;}
#bqp.bq-fs .bqact svg{width:14px!important;height:14px!important;}
#bqp.bq-fs .bqrbar{padding:10px 16px!important;}
#bqp.bq-fs .bqrbn{font-size:.46rem!important;}
#bqp.bq-fs .bqrbt{font-size:.58rem!important;}
#bqp.bq-fs .bqempty-ic{width:56px!important;height:56px!important;}
#bqp.bq-fs .bqempty-ic svg{width:26px!important;height:26px!important;}
#bqp.bq-fs .bqempty-tx{font-size:.6rem!important;}
#bqp.bq-fs .bqempty-sub{font-size:.48rem!important;}
#bqp.bq-fs .bqhbtn{width:34px!important;height:34px!important;}
#bqp.bq-fs .bqhbtn svg{width:16px!important;height:16px!important;}
#bqp.bq-fs .bq-me-av{width:32px!important;height:32px!important;font-size:.46rem!important;}
#bqp.bq-fs .bqback{font-size:.54rem!important;}
#bqp.bq-fs .bqback svg{width:18px!important;height:18px!important;}
#bqp.bq-fs .bqdmhav{width:36px!important;height:36px!important;font-size:.5rem!important;}
#bqp.bq-fs .bqdmhn{font-size:.74rem!important;}
#bqp.bq-fs .bqdmhs{font-size:.44rem!important;}
body.bq-fs-mode #bqb{opacity:0!important;pointer-events:none!important;}

/* ── SCREEN + VIEW SYSTEM ── */
#bqs{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;min-height:0;}
.bqv{
  position:absolute;inset:0;display:flex;flex-direction:column;
  background:#0a0a0a;
  transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .26s ease;
  will-change:transform,opacity;
}
.bqv.bq-hidden{transform:translateX(100%);opacity:0;pointer-events:none;}
.bqv.bq-sleft{transform:translateX(-32px);opacity:0;pointer-events:none;}

/* ── BOTTOM NAV ── */
#bqnav{
  display:flex;border-top:1px solid rgba(255,255,255,.07);
  flex-shrink:0;background:#080808;
}
.bqnb{
  flex:1;padding:10px 4px 9px;background:none;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:700;letter-spacing:.16em;
  color:rgba(255,255,255,.26);transition:color .2s;
  display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;
}
.bqnb svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
.bqnb.active{color:#fff;}
.bqnb.active::before{
  content:'';position:absolute;top:0;left:22%;width:56%;height:2px;
  background:#fff;border-radius:0 0 3px 3px;
}
.bqnnb{
  position:absolute;top:5px;right:calc(50% - 18px);
  min-width:16px;height:16px;border-radius:8px;background:#f87171;
  font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 3px;
  border:2px solid #080808;
}
.bqnnb.show{display:flex;}

/* ── HEADER ── */
.bqhdr{
  display:flex;align-items:center;gap:8px;
  padding:11px 13px 10px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;
}
.bqlive{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 7px #34d399;flex-shrink:0;animation:bqLive 2.4s ease infinite;}
@keyframes bqLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.82)}}
.bqhtitle{font-family:'Rajdhani',sans-serif;font-size:.66rem;font-weight:900;letter-spacing:.16em;color:#fff;flex:1;}
.bqhbtn{
  width:28px;height:28px;background:none;border:1px solid rgba(255,255,255,.09);border-radius:7px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;
}
.bqhbtn:hover{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.06);}
.bqhbtn.on{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.08);}
.bqhbtn svg{width:13px;height:13px;stroke:rgba(255,255,255,.42);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;}
.bqhbtn.on svg{stroke:#fff;}
.bqback{
  display:flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.46rem;font-weight:700;letter-spacing:.12em;
  color:rgba(255,255,255,.45);padding:0;transition:color .2s;
}
.bqback:hover{color:#fff;}
.bqback svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}

/* ── MESSAGES ── */
.bqmsgs{flex:1;overflow-y:auto;padding:10px 10px 4px;display:flex;flex-direction:column;gap:1px;}
.bqmsgs::-webkit-scrollbar{width:3px;}
.bqmsgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:2px;}
.bqds{
  display:flex;align-items:center;gap:8px;margin:10px 0 8px;
  font-family:'Rajdhani',sans-serif;font-size:.32rem;letter-spacing:.24em;color:rgba(255,255,255,.16);
}
.bqds::before,.bqds::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06);}
.bqsys{
  text-align:center;padding:5px 0;margin:2px 0;
  font-family:'Rajdhani',sans-serif;font-size:.37rem;letter-spacing:.12em;color:rgba(255,255,255,.18);
  animation:bqUp .28s ease both;
}

/* Message row */
.bqr{display:flex;flex-direction:column;gap:1px;animation:bqUp .25s cubic-bezier(.16,1,.3,1) both;padding:0 1px;}
@keyframes bqUp{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
.bqr.mine{align-items:flex-end;}
.bqr.theirs{align-items:flex-start;}
.bqri{display:flex;align-items:flex-end;gap:7px;max-width:90%;}
.bqr.mine .bqri{flex-direction:row-reverse;}
.bqr.consec .bqri .bqav{visibility:hidden;}
.bqr.consec{margin-top:-3px;}

/* Avatar — clickable */
.bqav{
  width:26px;height:26px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:900;
  cursor:pointer;transition:transform .2s cubic-bezier(.34,1.4,.64,1),box-shadow .2s;
  user-select:none;position:relative;
}
.bqav:hover{transform:scale(1.14);box-shadow:0 0 0 2px rgba(255,255,255,.22);}
.bqav:active{transform:scale(.95);}
/* Status ring on avatar */
.bqav[data-status="online"]::after{content:'';position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#34d399;border:2px solid #0a0a0a;}
.bqav[data-status="studying"]::after{content:'';position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#60a5fa;border:2px solid #0a0a0a;}
.bqav[data-status="away"]::after{content:'';position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#fbbf24;border:2px solid #0a0a0a;}
.bqav[data-status="busy"]::after{content:'';position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#f87171;border:2px solid #0a0a0a;}

/* Column + meta */
.bqcol{display:flex;flex-direction:column;gap:2px;min-width:0;}
.bqmeta{display:flex;align-items:baseline;gap:5px;padding:0 2px;margin-bottom:1px;}
.bqr.consec .bqmeta{display:none;}
.bqun{font-family:'Rajdhani',sans-serif;font-size:.43rem;font-weight:700;letter-spacing:.06em;cursor:pointer;}
.bqun:hover{text-decoration:underline;}
.bqts{font-family:'Rajdhani',sans-serif;font-size:.32rem;color:rgba(255,255,255,.2);letter-spacing:.04em;}

/* Reply preview */
.bqrp{border-left:3px solid rgba(255,255,255,.35);padding:4px 9px;margin-bottom:6px;border-radius:0 5px 5px 0;background:rgba(255,255,255,.08);}
.bqrp-n{font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.6);}
.bqrp-t{font-family:'Rajdhani',sans-serif;font-size:.54rem;color:rgba(255,255,255,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;}
.bqr.mine .bqrp{background:rgba(0,0,0,.14);border-left-color:rgba(0,0,0,.35);}
.bqr.mine .bqrp-n{color:rgba(0,0,0,.55);}
.bqr.mine .bqrp-t{color:rgba(0,0,0,.45);}

/* Bubble */
.bqbbl{padding:8px 12px;font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:500;line-height:1.5;letter-spacing:.02em;word-break:break-word;}
.bqr.theirs .bqbbl{background:#1c1c1c;border:1px solid rgba(255,255,255,.09);border-radius:2px 12px 12px 12px;color:rgba(255,255,255,.86);}
.bqr.mine .bqbbl{background:#fff;color:#0a0a0a;border-radius:12px 2px 12px 12px;}
.bqbbl a{color:#60a5fa;text-decoration:underline;text-decoration-color:rgba(96,165,250,.35);}
.bqr.mine .bqbbl a{color:#1d4ed8;}

/* Bubble hover actions */
.bqbw{position:relative;}
.bqacts{
  position:absolute;top:-34px;display:none;align-items:center;gap:2px;
  background:#1e1e1e;border:1px solid rgba(255,255,255,.12);
  border-radius:9px;padding:3px 4px;box-shadow:0 6px 20px rgba(0,0,0,.55);z-index:10;white-space:nowrap;
}
.bqr.mine .bqacts{right:0;}.bqr.theirs .bqacts{left:0;}
.bqbw:hover .bqacts{display:flex;}
.bqact{
  width:28px;height:28px;background:none;border:none;cursor:pointer;
  border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-size:14px;transition:background .15s;color:rgba(255,255,255,.45);
}
.bqact:hover{background:rgba(255,255,255,.09);color:#fff;}
.bqact svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqact.del:hover{background:rgba(248,113,113,.12);color:#f87171;}
.bqepick{
  position:absolute;top:-52px;display:none;gap:2px;flex-wrap:wrap;width:168px;
  background:#1e1e1e;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:5px 6px;
  box-shadow:0 8px 30px rgba(0,0,0,.6);z-index:15;
}
.bqr.mine .bqepick{right:0;}.bqr.theirs .bqepick{left:0;}
.bqepick.open{display:flex;}
.bqepbtn{width:28px;height:28px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:15px;display:flex;align-items:center;justify-content:center;transition:background .14s,transform .14s;line-height:1;}
.bqepbtn:hover{background:rgba(255,255,255,.1);transform:scale(1.22);}
.bqrxns{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px;padding:0 2px;}
.bqrxn{display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);border-radius:20px;padding:2px 7px;cursor:pointer;font-size:12px;transition:all .18s;}
.bqrxn:hover{background:rgba(255,255,255,.13);transform:scale(1.06);}
.bqrxn.mr{background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.3);}
.bqrxn-n{font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:700;color:rgba(255,255,255,.65);}

/* ── REPLY BAR ── */
.bqrbar{display:none;align-items:center;gap:8px;padding:7px 11px;background:rgba(255,255,255,.04);border-top:1px solid rgba(255,255,255,.06);flex-shrink:0;}
.bqrbar.show{display:flex;}
.bqrbic{width:14px;height:14px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bqrbb{flex:1;min-width:0;}
.bqrbn{font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.45);}
.bqrbt{font-family:'Rajdhani',sans-serif;font-size:.5rem;color:rgba(255,255,255,.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bqrbx{width:22px;height:22px;background:none;border:1px solid rgba(255,255,255,.1);border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s;}
.bqrbx:hover{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);}
.bqrbx svg{width:10px;height:10px;stroke:rgba(255,255,255,.4);fill:none;stroke-width:2.5;stroke-linecap:round;}

/* ── TYPING ── */
.bqtyp{min-height:20px;padding:0 14px 6px;flex-shrink:0;font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.1em;color:rgba(255,255,255,.24);display:flex;align-items:center;gap:6px;}
.bqtd{display:flex;gap:3px;align-items:center;}
.bqtd span{width:3.5px;height:3.5px;background:rgba(255,255,255,.28);border-radius:50%;animation:bqTd 1.1s ease infinite;}
.bqtd span:nth-child(2){animation-delay:.18s;}.bqtd span:nth-child(3){animation-delay:.36s;}
@keyframes bqTd{0%,60%,100%{transform:translateY(0);opacity:.28}30%{transform:translateY(-4px);opacity:1}}

/* ── INPUT ── */
.bqiw{border-top:1px solid rgba(255,255,255,.07);padding:8px 10px 10px;flex-shrink:0;}
.bqiet{display:none;flex-wrap:wrap;gap:1px;padding:5px 3px;margin-bottom:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;}
.bqiet.open{display:flex;}
.bqietb{width:30px;height:30px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background .14s,transform .14s;line-height:1;}
.bqietb:hover{background:rgba(255,255,255,.09);transform:scale(1.15);}
.bqirow{display:flex;gap:7px;align-items:flex-end;}
.bqieo{width:34px;height:34px;background:none;border:1px solid rgba(255,255,255,.09);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;transition:all .2s;line-height:1;}
.bqieo:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.05);}
.bqinp{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:9px 11px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.03em;resize:none;outline:none;min-height:38px;max-height:96px;line-height:1.45;transition:border-color .2s,background .2s;scrollbar-width:none;}
.bqinp::-webkit-scrollbar{display:none;}
.bqinp::placeholder{color:rgba(255,255,255,.17);}
.bqinp:focus{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
.bqsnd{width:38px;height:38px;background:#fff;border:none;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .22s cubic-bezier(.34,1.4,.64,1);}
.bqsnd:hover{transform:scale(1.08);box-shadow:0 4px 18px rgba(255,255,255,.2);}
.bqsnd:active{transform:scale(.92);}
.bqsnd:disabled{opacity:.22;cursor:not-allowed;transform:none;box-shadow:none;}
.bqsnd svg{width:15px;height:15px;stroke:#000;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
.bqifooter{display:flex;align-items:center;justify-content:space-between;margin-top:5px;}
.bqcc{font-family:'Rajdhani',sans-serif;font-size:.34rem;letter-spacing:.1em;color:rgba(255,255,255,.14);transition:color .2s;}
.bqcc.warn{color:#fbbf24;}.bqcc.over{color:#f87171;}
.bqih{font-family:'Rajdhani',sans-serif;font-size:.32rem;letter-spacing:.06em;color:rgba(255,255,255,.12);}

/* ── SCROLL BTN ── */
.bqscr{position:absolute;bottom:106px;right:14px;z-index:6;width:30px;height:30px;background:rgba(16,16,16,.96);border:1px solid rgba(255,255,255,.13);border-radius:50%;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.5);transition:border-color .2s;}
.bqscr.show{display:flex;animation:bqUp .2s ease both;}
.bqscr:hover{border-color:rgba(255,255,255,.26);}
.bqscr svg{width:14px;height:14px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}

/* ── EMPTY ── */
.bqempty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding-bottom:24px;animation:bqUp .4s ease both;}
.bqempty-ic{width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;}
.bqempty-ic svg{width:20px;height:20px;stroke:rgba(255,255,255,.18);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
.bqempty-tx{font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.2em;color:rgba(255,255,255,.15);}
.bqempty-sub{font-family:'Rajdhani',sans-serif;font-size:.4rem;letter-spacing:.1em;color:rgba(255,255,255,.1);}

/* ── PROFILE CARD OVERLAY ── */
#bqpc{
  position:absolute;inset:0;z-index:40;
  background:rgba(0,0,0,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;padding:20px;
  border-radius:16px;
  opacity:0;pointer-events:none;
  transition:opacity .22s ease;
}
#bqpc.open{opacity:1;pointer-events:all;}
.bqpc-card{
  width:100%;max-width:290px;
  background:#141414;border:1px solid rgba(255,255,255,.12);border-radius:14px;overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,.7);
  transform:scale(.9) translateY(12px);
  transition:transform .3s cubic-bezier(.16,1,.3,1);
}
#bqpc.open .bqpc-card{transform:scale(1) translateY(0);}
.bqpc-banner{height:56px;position:relative;flex-shrink:0;}
.bqpc-av{
  position:absolute;bottom:-22px;left:16px;
  width:52px;height:52px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.68rem;font-weight:900;
  border:3px solid #141414;box-shadow:0 4px 16px rgba(0,0,0,.4);
}
.bqpc-close{
  position:absolute;top:8px;right:10px;
  width:26px;height:26px;background:rgba(0,0,0,.5);border:none;border-radius:50%;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;
}
.bqpc-close:hover{background:rgba(0,0,0,.8);}
.bqpc-close svg{width:12px;height:12px;stroke:rgba(255,255,255,.7);fill:none;stroke-width:2.5;stroke-linecap:round;}
.bqpc-body{padding:30px 16px 16px;}
.bqpc-name{font-family:'Rajdhani',sans-serif;font-size:.78rem;font-weight:900;letter-spacing:.08em;color:#fff;margin-bottom:4px;}
.bqpc-status{display:flex;align-items:center;gap:5px;margin-bottom:8px;}
.bqpc-sdot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.bqpc-slabel{font-family:'Rajdhani',sans-serif;font-size:.44rem;letter-spacing:.1em;font-weight:600;}
.bqpc-activity{
  font-family:'Rajdhani',sans-serif;font-size:.56rem;letter-spacing:.04em;
  color:rgba(255,255,255,.4);margin-bottom:10px;
  display:flex;align-items:center;gap:5px;
}
.bqpc-activity::before{content:'';width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.3);flex-shrink:0;}
.bqpc-bio{
  font-family:'Rajdhani',sans-serif;font-size:.62rem;line-height:1.5;
  color:rgba(255,255,255,.5);padding:8px 10px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;
  margin-bottom:12px;word-break:break-word;
}
.bqpc-actions{display:flex;gap:7px;}
.bqpc-btn{
  flex:1;padding:9px 8px;border-radius:8px;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.52rem;font-weight:700;letter-spacing:.12em;
  display:flex;align-items:center;justify-content:center;gap:5px;
  transition:all .2s cubic-bezier(.34,1.2,.64,1);
}
.bqpc-btn:hover{transform:translateY(-2px);}
.bqpc-btn:active{transform:scale(.96);}
.bqpc-btn svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
.bqpc-btn.dm{background:#fff;color:#000;}
.bqpc-btn.dm:hover{background:#f0f0f0;box-shadow:0 4px 14px rgba(255,255,255,.2);}
.bqpc-btn.edit{background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.12);}
.bqpc-btn.edit:hover{background:rgba(255,255,255,.12);color:#fff;}

/* ── DM LIST ── */
#bqdml{flex:1;overflow-y:auto;padding:4px 0;}
#bqdml::-webkit-scrollbar{width:3px;}
#bqdml::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqdmr{display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;transition:background .18s;position:relative;}
.bqdmr:hover{background:rgba(255,255,255,.04);}
.bqdmav{width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:.5rem;font-weight:900;position:relative;}
.bqdmav::after{content:'';position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:#333;border:2px solid #0a0a0a;transition:background .3s;}
.bqdmav.online::after{background:#34d399;}
.bqdmav.studying::after{background:#60a5fa;}
.bqdmav.away::after{background:#fbbf24;}
.bqdmav.busy::after{background:#f87171;}
.bqdmin{flex:1;min-width:0;}
.bqdmn{font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.06em;color:#fff;}
.bqdmp{font-family:'Rajdhani',sans-serif;font-size:.48rem;color:rgba(255,255,255,.3);letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;}
.bqdmp.unr{color:rgba(255,255,255,.65);font-weight:600;}
.bqdmm{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.bqdmt{font-family:'Rajdhani',sans-serif;font-size:.34rem;letter-spacing:.06em;color:rgba(255,255,255,.22);}
.bqdmub{min-width:18px;height:18px;border-radius:9px;background:#f87171;font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 4px;animation:bqPop .25s cubic-bezier(.34,1.4,.64,1) both;}
.bqdmdiv{height:1px;background:rgba(255,255,255,.05);margin:0 13px;}

/* DM header */
.bqdmhav{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:900;position:relative;cursor:pointer;transition:transform .2s;}
.bqdmhav:hover{transform:scale(1.1);}
.bqdmhav::after{content:'';position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#555;border:2px solid #0a0a0a;transition:background .3s;}
.bqdmhav.online::after,.bqdmhav[data-status="online"]::after{background:#34d399;}
.bqdmhav[data-status="studying"]::after{background:#60a5fa;}
.bqdmhav[data-status="away"]::after{background:#fbbf24;}
.bqdmhav[data-status="busy"]::after{background:#f87171;}
.bqdmhi{flex:1;}
.bqdmhn{font-family:'Rajdhani',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.06em;color:#fff;}
.bqdmhs{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.06em;color:rgba(255,255,255,.28);margin-top:1px;}

/* ── ONLINE LIST ── */
#bqol{flex:1;overflow-y:auto;padding:4px 0;}
#bqol::-webkit-scrollbar{width:3px;}
#bqol::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqurow{display:flex;align-items:center;gap:10px;padding:9px 13px;cursor:pointer;transition:background .18s;}
.bqurow:hover{background:rgba(255,255,255,.04);}
.bqurow.isme{cursor:default;}
.bqurow:hover:not(.isme) .bqudmh{opacity:1;}
.bquav{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:.48rem;font-weight:900;position:relative;}
.bquav::after{content:'';position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;border:2px solid #0a0a0a;}
.bquav[data-status="online"]::after{background:#34d399;}
.bquav[data-status="studying"]::after{background:#60a5fa;}
.bquav[data-status="away"]::after{background:#fbbf24;}
.bquav[data-status="busy"]::after{background:#f87171;}
.bquinfo{flex:1;min-width:0;}
.bquu{font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.06em;color:#fff;display:flex;align-items:center;gap:5px;}
.bquyou{font-size:.32rem;letter-spacing:.12em;color:rgba(255,255,255,.28);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;}
.bqust{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.06em;color:rgba(255,255,255,.2);margin-top:1px;}
.bquact{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.04em;color:rgba(255,255,255,.18);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bqudmh{opacity:0;transition:opacity .2s;font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.1em;color:rgba(255,255,255,.3);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:3px 8px;border-radius:4px;flex-shrink:0;white-space:nowrap;}

/* ── NAME MODAL ── */
#bqnm{
  position:absolute;inset:0;z-index:30;
  background:rgba(0,0,0,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;padding:20px;border-radius:16px;
  animation:bqFade .24s ease both;
}
@keyframes bqFade{from{opacity:0}to{opacity:1}}
.bqnmb{width:100%;max-width:272px;text-align:center;}
.bqnmav{width:56px;height:56px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:900;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.1);transition:all .3s;}
.bqnmtit{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;color:#fff;margin-bottom:4px;}
.bqnmsub{font-family:'Rajdhani',sans-serif;font-size:.46rem;letter-spacing:.16em;color:rgba(255,255,255,.28);margin-bottom:16px;}
.bqnmf{position:relative;margin-bottom:8px;}
.bqnmat{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:700;color:rgba(255,255,255,.32);pointer-events:none;user-select:none;}
.bqnmi{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:11px 12px 11px 24px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:600;letter-spacing:.06em;outline:none;transition:border-color .2s,background .2s;}
.bqnmi::placeholder{color:rgba(255,255,255,.18);}.bqnmi:focus{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.09);}
.bqnmi.chk{border-color:rgba(251,191,36,.4);}.bqnmi.tkn{border-color:rgba(248,113,113,.5);}.bqnmi.ok{border-color:rgba(52,211,153,.5);}
.bqnmst{font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.1em;min-height:17px;margin-bottom:11px;transition:color .2s;}
.bqnmst.chk{color:rgba(251,191,36,.7);}.bqnmst.tkn{color:#f87171;}.bqnmst.ok{color:#34d399;}
.bqnmbtn{width:100%;padding:12px;background:#fff;color:#000;border:none;border-radius:9px;font-family:'Rajdhani',sans-serif;font-size:.64rem;font-weight:900;letter-spacing:.18em;cursor:pointer;transition:opacity .2s,transform .15s;}
.bqnmbtn:hover:not(:disabled){opacity:.88;}.bqnmbtn:active:not(:disabled){transform:scale(.97);}
.bqnmbtn:disabled{opacity:.25;cursor:not-allowed;}

/* ── PROFILE SETTINGS VIEW ── */
.bqpf-section{padding:14px 14px 0;border-bottom:1px solid rgba(255,255,255,.06);}
.bqpf-label{font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.22em;color:rgba(255,255,255,.26);margin-bottom:10px;}
.bqpf-avrow{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.bqpf-av{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:.8rem;font-weight:900;flex-shrink:0;cursor:pointer;transition:transform .2s;border:3px solid rgba(255,255,255,.1);}
.bqpf-av:hover{transform:scale(1.06);}
.bqpf-av-info{flex:1;}
.bqpf-uname{font-family:'Rajdhani',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#fff;}
.bqpf-change{font-family:'Rajdhani',sans-serif;font-size:.4rem;letter-spacing:.12em;color:rgba(255,255,255,.3);margin-top:3px;cursor:pointer;}
.bqpf-change:hover{color:rgba(255,255,255,.6);}
.bqpf-colors{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
.bqpf-col{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .18s;flex-shrink:0;}
.bqpf-col:hover{transform:scale(1.15);}
.bqpf-col.sel{border-color:#fff;transform:scale(1.1);}
.bqpf-inp{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 11px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.03em;outline:none;transition:border-color .2s,background .2s;margin-bottom:14px;}
.bqpf-inp::placeholder{color:rgba(255,255,255,.18);}.bqpf-inp:focus{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
.bqpf-textarea{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 11px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.03em;outline:none;resize:none;min-height:60px;line-height:1.5;transition:border-color .2s,background .2s;margin-bottom:14px;scrollbar-width:none;}
.bqpf-textarea::placeholder{color:rgba(255,255,255,.18);}.bqpf-textarea:focus{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
.bqpf-statuses{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px;}
.bqpf-st{
  display:flex;align-items:center;gap:7px;padding:8px 10px;
  border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.04);transition:all .18s;
}
.bqpf-st:hover{border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.08);}
.bqpf-st.sel{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.1);}
.bqpf-st-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.bqpf-st-lbl{font-family:'Rajdhani',sans-serif;font-size:.52rem;font-weight:600;letter-spacing:.08em;color:rgba(255,255,255,.75);}
.bqpf-savebtn{
  margin:0 14px 14px;width:calc(100% - 28px);padding:11px;background:#fff;color:#000;border:none;border-radius:8px;
  font-family:'Rajdhani',sans-serif;font-size:.62rem;font-weight:900;letter-spacing:.16em;cursor:pointer;transition:all .2s;
}
.bqpf-savebtn:hover{opacity:.88;}
.bqpf-savemsg{text-align:center;font-family:'Rajdhani',sans-serif;font-size:.44rem;letter-spacing:.1em;color:#34d399;height:18px;transition:opacity .3s;}
.bqpf-scroll{flex:1;overflow-y:auto;padding-top:4px;}
.bqpf-scroll::-webkit-scrollbar{width:3px;}
.bqpf-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}

/* ── ABOUT VIEW ── */
.bqab-scroll{flex:1;overflow-y:auto;padding:0;}
.bqab-scroll::-webkit-scrollbar{width:3px;}
.bqab-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqab-hero{padding:28px 20px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,.06);}
.bqab-logo{width:54px;height:54px;border-radius:14px;background:linear-gradient(135deg,#1a2e4a,#0d1a30);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.bqab-logo svg{width:24px;height:24px;stroke:rgba(255,255,255,.7);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
.bqab-name{font-family:'Rajdhani',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.14em;color:#fff;margin-bottom:3px;}
.bqab-version{font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.2em;color:rgba(255,255,255,.25);}
.bqab-desc{font-family:'Rajdhani',sans-serif;font-size:.58rem;color:rgba(255,255,255,.4);line-height:1.6;margin-top:10px;}
.bqab-section{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06);}
.bqab-shead{font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.24em;color:rgba(255,255,255,.24);margin-bottom:10px;}
.bqab-row{display:flex;align-items:center;gap:10px;padding:7px 0;}
.bqab-ic{width:28px;height:28px;border-radius:7px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.bqab-ic svg{width:13px;height:13px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
.bqab-rowinfo{flex:1;}
.bqab-rowlbl{font-family:'Rajdhani',sans-serif;font-size:.56rem;font-weight:600;letter-spacing:.06em;color:#fff;}
.bqab-rowsub{font-family:'Rajdhani',sans-serif;font-size:.4rem;letter-spacing:.04em;color:rgba(255,255,255,.28);margin-top:2px;}
.bqab-link{font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.1em;color:rgba(96,165,250,.7);text-decoration:none;}
.bqab-link:hover{color:#60a5fa;}
.bqab-footer{padding:14px 16px 20px;text-align:center;font-family:'Rajdhani',sans-serif;font-size:.4rem;letter-spacing:.14em;color:rgba(255,255,255,.14);}

/* ── TOAST ── */
#bqtoast{
  position:fixed;bottom:98px;left:50%;transform:translateX(-50%) translateY(8px);
  background:rgba(18,18,18,.98);border:1px solid rgba(255,255,255,.13);
  border-radius:8px;padding:7px 14px;z-index:9999;opacity:0;
  font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.1em;color:rgba(255,255,255,.78);
  white-space:nowrap;pointer-events:none;transition:all .25s cubic-bezier(.34,1.2,.64,1);
}
#bqtoast.show{opacity:1;transform:translateX(-50%) translateY(0);}


/* ── MY AVATAR BUTTON (top-right of every header) ── */
.bq-me-av{
  width:26px;height:26px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:900;
  cursor:pointer;border:2px solid rgba(255,255,255,.2);
  transition:transform .24s cubic-bezier(.34,1.4,.64,1),box-shadow .2s;
  user-select:none;
}
.bq-me-av:hover{transform:scale(1.16);box-shadow:0 0 0 3px rgba(255,255,255,.1);}
.bq-me-av:active{transform:scale(.92);}

/* ── CSS VARIABLES ── */
:root{--bq-accent:#ffffff;}
.bqsnd{background:var(--bq-accent,#fff)!important;}
.bqnb.active::before{background:var(--bq-accent,#fff)!important;}

/* ── COMPACT MODE ── */
body.bq-compact .bqbbl{padding:5px 9px;font-size:.65rem;}
body.bq-compact .bqmsgs{gap:0;}
body.bq-compact .bqav{width:22px;height:22px;}
body.bq-compact .bqri{gap:5px;}

/* ── BUBBLE SHAPES ── */
body.bq-bubble-rect .bqr.theirs .bqbbl{border-radius:4px 10px 10px 10px;}
body.bq-bubble-rect .bqr.mine .bqbbl{border-radius:10px 4px 10px 10px;}
body.bq-bubble-pill .bqr.theirs .bqbbl{border-radius:18px 18px 18px 4px;}
body.bq-bubble-pill .bqr.mine .bqbbl{border-radius:18px 18px 4px 18px;}

/* ── ALIAS BADGES ── */
.bq-alias{font-size:.35rem;font-weight:500;opacity:.55;letter-spacing:.03em;margin-left:2px;}

/* ── PROFILE PANEL (slides in over everything) ── */
#bqprofpanel{
  position:absolute;inset:0;z-index:38;
  background:#0a0a0a;
  transform:translateX(100%);opacity:0;pointer-events:none;
  transition:transform .32s cubic-bezier(.16,1,.3,1),opacity .26s ease;
  display:flex;flex-direction:column;overflow:hidden;
}
#bqprofpanel.open{transform:translateX(0);opacity:1;pointer-events:all;}
.bqpfh{display:flex;align-items:center;gap:8px;padding:11px 13px 10px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
.bqpfh-title{font-family:'Rajdhani',sans-serif;font-size:.66rem;font-weight:900;letter-spacing:.16em;color:#fff;flex:1;}
.bqpf-scroll{flex:1;overflow-y:auto;padding:4px 0 16px;}
.bqpf-scroll::-webkit-scrollbar{width:3px;}
.bqpf-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}

/* Toggle rows */
.bqpf-trow{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.bqpf-trow:last-child{border-bottom:none;}
.bqpf-tlbl{font-family:'Rajdhani',sans-serif;font-size:.54rem;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.72);}
.bqpf-tsub{font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.04em;color:rgba(255,255,255,.28);margin-top:2px;}
.bqpf-tog{width:38px;height:20px;border-radius:10px;border:1px solid rgba(255,255,255,.12);cursor:pointer;background:rgba(255,255,255,.08);position:relative;flex-shrink:0;transition:background .22s,border-color .22s;}
.bqpf-tog.on{background:rgba(52,211,153,.22);border-color:rgba(52,211,153,.45);}
.bqpf-tog::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.45);transition:transform .24s cubic-bezier(.34,1.4,.64,1),background .22s;}
.bqpf-tog.on::after{transform:translateX(18px);background:#34d399;}

/* Accent colours */
.bqpf-accrow{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;}
.bqpf-acc{width:24px;height:24px;border-radius:7px;cursor:pointer;border:2px solid transparent;transition:all .2s cubic-bezier(.34,1.4,.64,1);flex-shrink:0;}
.bqpf-acc:hover{transform:scale(1.2);}
.bqpf-acc.sel{border-color:#fff;transform:scale(1.12);box-shadow:0 0 0 2px rgba(255,255,255,.18);}

/* Bubble shape picker */
.bqpf-shapes{display:flex;gap:6px;margin-bottom:4px;}
.bqpf-shape{flex:1;padding:7px 4px;border-radius:7px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);cursor:pointer;text-align:center;font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.06em;color:rgba(255,255,255,.4);transition:all .18s;}
.bqpf-shape:hover{border-color:rgba(255,255,255,.18);color:#fff;}
.bqpf-shape.sel{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.09);color:#fff;}

/* Font scale */
.bqpf-scrow{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.bqpf-sc-inp{flex:1;accent-color:var(--bq-accent,#fff);}
.bqpf-sc-val{font-family:'Rajdhani',sans-serif;font-size:.44rem;font-weight:700;color:rgba(255,255,255,.4);width:32px;text-align:right;flex-shrink:0;}

/* ── DM LIST: pin + delete actions ── */
.bqdmr{overflow:hidden;position:relative;}
.bqdmr-acts{
  position:absolute;right:10px;top:50%;transform:translateY(-50%);
  display:flex;gap:3px;opacity:0;transition:opacity .18s;pointer-events:none;
}
.bqdmr:hover .bqdmr-acts{opacity:1;pointer-events:all;}
.bqdmr-act{
  width:26px;height:26px;border-radius:6px;border:1px solid rgba(255,255,255,.1);cursor:pointer;
  display:flex;align-items:center;justify-content:center;background:rgba(12,12,12,.97);
  transition:all .18s;
}
.bqdmr-act svg{width:11px;height:11px;fill:none;stroke:rgba(255,255,255,.4);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqdmr-act.bq-pin:hover,.bqdmr-act.bq-pin.pinned svg{stroke:#60a5fa;}
.bqdmr-act.bq-pin:hover{background:rgba(96,165,250,.12);border-color:rgba(96,165,250,.25);}
.bqdmr-act.bq-del:hover{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.25);}
.bqdmr-act.bq-del:hover svg{stroke:#f87171;}
.bqdmr-confirm{
  position:absolute;inset:0;background:rgba(8,8,8,.96);
  display:none;align-items:center;gap:8px;padding:0 13px;
}
.bqdmr-confirm.show{display:flex;}
.bqdmr-confirm-msg{font-family:'Rajdhani',sans-serif;font-size:.46rem;letter-spacing:.07em;color:rgba(255,255,255,.55);flex:1;}
.bqdmr-cyes{padding:5px 10px;background:#f87171;border:none;border-radius:6px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:700;color:#fff;transition:all .18s;}
.bqdmr-cyes:hover{background:#ef4444;}
.bqdmr-cno{padding:5px 10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:6px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:700;color:rgba(255,255,255,.5);transition:all .18s;}
.bqdm-pin{font-size:10px;opacity:.5;margin-right:3px;}

/* ── PROFILE CARD: alias input ── */
.bqpc-aliasw{margin-bottom:12px;}
.bqpc-aliaslbl{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.18em;color:rgba(255,255,255,.25);margin-bottom:5px;}
.bqpc-aliasinp{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:7px 10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.62rem;font-weight:500;outline:none;transition:border-color .2s;}
.bqpc-aliasinp::placeholder{color:rgba(255,255,255,.2);}
.bqpc-aliasinp:focus{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.08);}

/* ── MESSAGE SEARCH BAR ── */
.bqsbar{display:none;align-items:center;gap:7px;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);flex-shrink:0;}
.bqsbar.open{display:flex;animation:bqUp .2s ease both;}
.bqsinp{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:6px 10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.65rem;outline:none;transition:border-color .2s,background .2s;}
.bqsinp::placeholder{color:rgba(255,255,255,.2);}
.bqsinp:focus{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
.bqsx{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.3);font-size:13px;padding:2px;transition:color .18s;}
.bqsx:hover{color:#fff;}

/* ── SMOOTH SPRING IMPROVEMENTS ── */
.bqr{animation:bqUp .28s cubic-bezier(.16,1,.3,1) both;}
.bqav{transition:transform .24s cubic-bezier(.34,1.4,.64,1),box-shadow .2s;}
.bqav:hover{transform:scale(1.18);box-shadow:0 0 0 2.5px rgba(255,255,255,.22);}
.bqhbtn{transition:all .22s cubic-bezier(.34,1.2,.64,1);}
.bqhbtn:hover{transform:scale(1.06);}
.bqhbtn:active{transform:scale(.92);}
.bqnb{transition:color .2s;}
.bqdmr{transition:background .18s;}
.bqdmr:active{background:rgba(255,255,255,.07);}
/* ── MOBILE ── */
@media(max-width:480px){
  #bqp{right:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:none;transform-origin:bottom center;}
  #bqb{bottom:18px;right:18px;}
}
`;

/* ─────────────────────────────────────────
   HTML
───────────────────────────────────────── */
const HTML = `
<button id="bqb" aria-label="Chat">
  <svg viewBox="0 0 24 24" class="bqi bqi-c" width="22" height="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  <svg viewBox="0 0 24 24" class="bqi bqi-x" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  <div id="bqbadge"></div>
</button>

<div id="bqp" role="dialog" aria-label="BioQuiz Chat">

  <!-- Profile card overlay -->
  <div id="bqpc">
    <div class="bqpc-card">
      <div class="bqpc-banner" id="bqpc-banner">
        <div class="bqpc-av" id="bqpc-av"></div>
        <button class="bqpc-close" id="bqpc-close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="bqpc-body">
        <div class="bqpc-name" id="bqpc-name"></div>
        <div class="bqpc-status" id="bqpc-status"></div>
        <div class="bqpc-activity" id="bqpc-activity" style="display:none"></div>
        <div class="bqpc-bio" id="bqpc-bio" style="display:none"></div>
        <div class="bqpc-aliasw" id="bqpc-aliasw" style="display:none">
          <div class="bqpc-aliaslbl">ALIAS (only you see this)</div>
          <input id="bqpc-aliasinp" class="bqpc-aliasinp" type="text" placeholder="Set a nickname…" maxlength="24" autocomplete="off" autocapitalize="off" autocorrect="off">
        </div>
        <div class="bqpc-actions" id="bqpc-actions"></div>
      </div>
    </div>
  </div>

  <!-- Name modal -->
  <div id="bqnm" style="display:none">
    <div class="bqnmb">
      <div class="bqnmav" id="bqnmav">?</div>
      <div class="bqnmtit">PICK A USERNAME</div>
      <div class="bqnmsub">UNIQUE · SHOWN AS @USERNAME</div>
      <div class="bqnmf">
        <span class="bqnmat">@</span>
        <input id="bqnminp" class="bqnmi" type="text" placeholder="username" maxlength="20"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>
      <div class="bqnmst" id="bqnmst"></div>
      <button class="bqnmbtn" id="bqnmbtn" disabled>JOIN CHAT</button>
    </div>
  </div>

  <!-- Screen -->
  <div id="bqs">

    <!-- VIEW: Global Chat -->
    <div class="bqv" id="bqv-chat">
      <div class="bqhdr">
        <div class="bqlive"></div>
        <div class="bqhtitle">GLOBAL CHAT</div>
        <button class="bqhbtn" id="bq-sound-btn" title="Sound">
          <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        
        <button class="bqhbtn" id="bq-fs-btn" title="Fullscreen">
          <svg id="bq-fs-ico" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
        <button class="bqhbtn" id="bq-ren-btn" title="Change username">
          <svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <div class="bq-me-av" id="bq-me-av" title="My profile"></div>
      </div>
      
      <div class="bqmsgs" id="bqgmsgs">
        <div class="bqempty" id="bqgempty">
          <div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="bqempty-tx">NO MESSAGES YET</div>
          <div class="bqempty-sub">SAY HELLO 👋</div>
        </div>
      </div>
      <div class="bqtyp" id="bqgtyp"></div>
      <button class="bqscr" id="bqgscr"><svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg></button>
      <div class="bqrbar" id="bqgrbar">
        <svg class="bqrbic" viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        <div class="bqrbb"><div class="bqrbn" id="bqgrbn"></div><div class="bqrbt" id="bqgrbt"></div></div>
        <button class="bqrbx" id="bqgrbx"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="bqiw">
        <div class="bqiet" id="bqget"></div>
        <div class="bqirow">
          <button class="bqieo" id="bqgeo">😊</button>
          <textarea id="bqginp" class="bqinp" placeholder="Message everyone…" rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bqsnd" id="bqgsnd" disabled><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
        <div class="bqifooter"><div class="bqcc" id="bqgcc"></div><div class="bqih">ENTER send · SHIFT+ENTER newline</div></div>
      </div>
    </div>

    <!-- VIEW: DM List -->
    <div class="bqv bq-hidden" id="bqv-dms">
      <div class="bqhdr">
        <div class="bqlive"></div>
        <div class="bqhtitle">DIRECT MESSAGES</div>
        <button class="bqhbtn" id="bqdmnewbtn" title="New DM — go to Online">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div class="bq-me-av" id="bq-me-av-dms" title="My profile"></div>
      </div>
      <div id="bqdml"></div>
    </div>

    <!-- VIEW: DM Conversation -->
    <div class="bqv bq-hidden" id="bqv-dmconv">
      <div class="bqhdr">
        <button class="bqback" id="bqdmback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>BACK</button>
        <div class="bqdmhav" id="bqdmhav"></div>
        <div class="bqdmhi"><div class="bqdmhn" id="bqdmhn"></div><div class="bqdmhs" id="bqdmhs">Offline</div></div>
        <button class="bqhbtn" id="bqdmprof" title="View profile"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
        <div class="bq-me-av" id="bq-me-av-dm" title="My profile"></div>
      </div>
      <div class="bqmsgs" id="bqdmmsgs">
        <div class="bqempty" id="bqdmempty">
          <div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="bqempty-tx">START A CONVERSATION</div>
          <div class="bqempty-sub" id="bqdmesub"></div>
        </div>
      </div>
      <div class="bqtyp" id="bqdmtyp"></div>
      <button class="bqscr" id="bqdmscr"><svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg></button>
      <div class="bqrbar" id="bqdmrbar">
        <svg class="bqrbic" viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        <div class="bqrbb"><div class="bqrbn" id="bqdmrbn"></div><div class="bqrbt" id="bqdmrbt"></div></div>
        <button class="bqrbx" id="bqdmrbx"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="bqiw">
        <div class="bqiet" id="bqdmet"></div>
        <div class="bqirow">
          <button class="bqieo" id="bqdmeo">😊</button>
          <textarea id="bqdminp" class="bqinp" placeholder="Message…" rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bqsnd" id="bqdmsnd" disabled><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
        <div class="bqifooter"><div class="bqcc" id="bqdmcc"></div><div class="bqih">ENTER send · SHIFT+ENTER newline</div></div>
      </div>
    </div>

    <!-- VIEW: Online Users -->
    <div class="bqv bq-hidden" id="bqv-online">
      <div class="bqhdr">
        <div class="bqlive"></div>
        <div class="bqhtitle">ONLINE NOW</div>
        <span id="bqocnt" style="font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.1em;color:rgba(255,255,255,.3);"></span>
        <div class="bq-me-av" id="bq-me-av-online" title="My profile"></div>
      </div>
      <div id="bqol"></div>
    </div>

    <!-- VIEW: Profile Settings -->
    <div class="bqv bq-hidden" id="bqv-profile">
      <div class="bqhdr">
        <button class="bqback" id="bqprofback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>BACK</button>
        <div class="bqhtitle">MY PROFILE</div>
      </div>
      <div class="bqpf-scroll">
        <div class="bqpf-section">
          <div class="bqpf-label">AVATAR</div>
          <div class="bqpf-avrow">
            <div class="bqpf-av" id="bqpfav"></div>
            <div class="bqpf-av-info">
              <div class="bqpf-uname" id="bqpfuname">@username</div>
              <div class="bqpf-change" onclick="document.getElementById('bq-ren-btn').click()">Change username →</div>
            </div>
          </div>
          <div class="bqpf-label">AVATAR COLOUR</div>
          <div class="bqpf-colors" id="bqpfcols"></div>
        </div>
        <div class="bqpf-section">
          <div class="bqpf-label">STATUS</div>
          <div class="bqpf-statuses" id="bqpfsts"></div>
          <div class="bqpf-label">ACTIVITY (rich presence)</div>
          <input id="bqpfact" class="bqpf-inp" type="text" placeholder="e.g. Studying Biology · Taking Quiz…" maxlength="60" autocomplete="off">
        </div>
        <div class="bqpf-section" style="border-bottom:none">
          <div class="bqpf-label">BIO</div>
          <textarea id="bqpfbio" class="bqpf-textarea" placeholder="Write something about yourself…" maxlength="120"></textarea>
        </div>
        <button class="bqpf-savebtn" id="bqpfsave">SAVE PROFILE</button>
        <div class="bqpf-savemsg" id="bqpfmsg" style="opacity:0"></div>
      </div>
    </div>

    <!-- VIEW: About -->
    <div class="bqv bq-hidden" id="bqv-about">
      <div class="bqhdr">
        <button class="bqback" id="bqabback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>BACK</button>
        <div class="bqhtitle">ABOUT</div>
      </div>
      <div class="bqab-scroll">
        <div class="bqab-hero">
          <div class="bqab-logo"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="bqab-name">BIOQUIZ CHAT</div>
          <div class="bqab-version">VERSION 4.0 · REAL-TIME</div>
          <div class="bqab-desc">Real-time chat built into BioQuiz.<br>Message classmates, share ideas, ask biology questions.</div>
        </div>
        <div class="bqab-section">
          <div class="bqab-shead">FEATURES</div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Global Chat</div><div class="bqab-rowsub">Talk with everyone online at once</div></div></div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Direct Messages</div><div class="bqab-rowsub">Private conversations with any user</div></div></div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Rich Presence</div><div class="bqab-rowsub">Set status and activity visible to all</div></div></div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Message Reactions</div><div class="bqab-rowsub">Emoji reactions on any message</div></div></div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Reply Threads</div><div class="bqab-rowsub">Quote and reply to any message</div></div></div>
        </div>
        <div class="bqab-section">
          <div class="bqab-shead">TECHNOLOGY</div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Firebase Realtime Database</div><div class="bqab-rowsub">Sub-100ms delivery via WebSocket</div></div></div>
          <div class="bqab-row"><div class="bqab-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg></div><div class="bqab-rowinfo"><div class="bqab-rowlbl">Zero Dependencies</div><div class="bqab-rowsub">Pure JS, no frameworks — drop-in script</div></div></div>
        </div>
        <div class="bqab-footer">© BIOQUIZ · BUILT FOR LEARNERS</div>
      </div>
    </div>


  <!-- Profile settings panel -->
  <div id="bqprofpanel">
    <div class="bqpfh">
      <button class="bqback" id="bqprofback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>BACK</button>
      <div class="bqpfh-title">MY PROFILE</div>
    </div>
    <div class="bqpf-scroll">
      <div class="bqpf-section">
        <div class="bqpf-label">AVATAR &amp; USERNAME</div>
        <div class="bqpf-avrow">
          <div class="bqpf-av" id="bqpfav"></div>
          <div class="bqpf-av-info">
            <div class="bqpf-uname" id="bqpfuname">@username</div>
            <div class="bqpf-change" id="bqpf-changename">Change username →</div>
          </div>
        </div>
        <div class="bqpf-label">AVATAR COLOUR</div>
        <div class="bqpf-colors" id="bqpfcols"></div>
      </div>
      <div class="bqpf-section">
        <div class="bqpf-label">ACCENT COLOUR</div>
        <div class="bqpf-accrow" id="bqpfaccs"></div>
      </div>
      <div class="bqpf-section">
        <div class="bqpf-label">STATUS</div>
        <div class="bqpf-statuses" id="bqpfsts"></div>
        <div class="bqpf-label">ACTIVITY (rich presence)</div>
        <input id="bqpfact" class="bqpf-inp" type="text" placeholder="e.g. Studying Biology…" maxlength="60" autocomplete="off" autocorrect="off" autocapitalize="off">
      </div>
      <div class="bqpf-section">
        <div class="bqpf-label">BIO</div>
        <textarea id="bqpfbio" class="bqpf-textarea" placeholder="Write something about yourself…" maxlength="120" autocorrect="off"></textarea>
      </div>
      <div class="bqpf-section">
        <div class="bqpf-label">BUBBLE SHAPE</div>
        <div class="bqpf-shapes" id="bqpf-shapes">
          <div class="bqpf-shape sel" data-shape="default">DEFAULT</div>
          <div class="bqpf-shape" data-shape="rect">SHARP</div>
          <div class="bqpf-shape" data-shape="pill">PILL</div>
        </div>
        <div class="bqpf-label" style="margin-top:10px">FONT SCALE</div>
        <div class="bqpf-scrow">
          <input type="range" id="bqpf-fontscale" class="bqpf-sc-inp" min="80" max="130" step="5" value="100">
          <div class="bqpf-sc-val" id="bqpf-fsval">100%</div>
        </div>
      </div>
      <div class="bqpf-section" style="border-bottom:none">
        <div class="bqpf-label">SETTINGS</div>
        <div class="bqpf-trow">
          <div><div class="bqpf-tlbl">Compact Messages</div><div class="bqpf-tsub">Smaller bubbles, more content</div></div>
          <button class="bqpf-tog" id="bqpf-compact"></button>
        </div>
        <div class="bqpf-trow">
          <div><div class="bqpf-tlbl">Sound Notifications</div><div class="bqpf-tsub">Tone on new messages</div></div>
          <button class="bqpf-tog" id="bqpf-sound"></button>
        </div>
      </div>
      <button class="bqpf-savebtn" id="bqpfsave">SAVE PROFILE</button>
      <div class="bqpf-savemsg" id="bqpfmsg" style="opacity:0"></div>
    </div>
  </div>
  </div><!-- /bqs -->

  <!-- Bottom Nav -->
  <div id="bqnav">
    <button class="bqnb active" data-v="chat" onclick="bqNav('chat')">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>CHAT
    </button>
    <button class="bqnb" data-v="dms" onclick="bqNav('dms')">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>DMs
      <div class="bqnnb" id="bqdmnb"></div>
    </button>
    <button class="bqnb" data-v="online" onclick="bqNav('online')">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>ONLINE
      <div class="bqnnb" id="bqonb"></div>
    </button>


  </div>

</div>
<div id="bqtoast"></div>
`;

/* ─────────────────────────────────────────
   INJECT
───────────────────────────────────────── */
const _s = document.createElement('style'); _s.textContent = CSS; document.head.appendChild(_s);
const _w = document.createElement('div'); _w.innerHTML = HTML; document.body.appendChild(_w);

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let db        = null;
let uid       = localStorage.getItem(LS_UID) || genUID();
let uname     = localStorage.getItem(LS_NAME) || '';
let soundOn   = localStorage.getItem(LS_SOUND) !== 'off';
let isOpen    = false;
let gUnread   = 0;
let dmUnread  = {};
let onlineU   = {};        // uid → presence data
let activeDmId= null;
let activeDmPuid= null;
let activeDmPname= null;
let dmMeta    = {};
let dmListeners={};
let dmTypRef  = null;
let presInt   = null;
let gReply    = null;
let dmReply   = null;
let gTypT     = null;
let dmTypT    = null;
let isGTyp    = false;
let isDmTyp   = false;
let gAtBot    = true;
let dAtBot    = true;
let gLastU=null, gLastT=0;
let dLastU=null, dLastT=0;
let nmCkT     = null;
let toastT    = null;
let activeView= 'chat';
let prevNonDmView = 'chat';
let isFull    = false;

// Profile local state (synced to Firebase presence)
let myProfile = JSON.parse(localStorage.getItem(LS_PROF)||'{"status":"online","activity":"","bio":"","color":""}');
if(!myProfile.status) myProfile.status='online';


/* ─────────────────────────────────────────
   ALIAS / PIN / PREFS HELPERS
───────────────────────────────────────── */
const LS_ALIAS='bq_aliases';
const LS_PINS='bq_pinned';
const LS_PREFS='bq_prefs';
const ACCENT_LIST=['#ffffff','#60a5fa','#34d399','#f472b6','#a78bfa','#fb923c','#fbbf24','#f87171'];

function getAliases(){try{return JSON.parse(localStorage.getItem(LS_ALIAS)||'{}');}catch{return {};}}
function getAlias(puid){return getAliases()[puid]||'';}
function setAlias(puid,v){const a=getAliases();if(v&&v.trim())a[puid]=v.trim().slice(0,24);else delete a[puid];localStorage.setItem(LS_ALIAS,JSON.stringify(a));}
function getPins(){try{return JSON.parse(localStorage.getItem(LS_PINS)||'[]');}catch{return [];}}
function togglePin(did){const p=getPins(),i=p.indexOf(did);if(i>-1)p.splice(i,1);else p.unshift(did);localStorage.setItem(LS_PINS,JSON.stringify(p));renderDmList();}

let myPrefs={};try{myPrefs=JSON.parse(localStorage.getItem(LS_PREFS)||'{}');}catch{}
if(!myPrefs.accentColor)myPrefs.accentColor='#ffffff';
if(!myPrefs.bubbleShape)myPrefs.bubbleShape='default';
if(!myPrefs.fontScale)myPrefs.fontScale=100;

function applyPrefs(){
  document.documentElement.style.setProperty('--bq-accent',myPrefs.accentColor||'#ffffff');
  const p=document.getElementById('bqp');
  if(p)p.style.fontSize=(myPrefs.fontScale||100)+'%';
  document.body.classList.toggle('bq-compact',!!myPrefs.compact);
  document.body.classList.remove('bq-bubble-rect','bq-bubble-pill');
  if(myPrefs.bubbleShape==='rect')document.body.classList.add('bq-bubble-rect');
  else if(myPrefs.bubbleShape==='pill')document.body.classList.add('bq-bubble-pill');
  if(typeof myPrefs.sound!=='undefined'){soundOn=myPrefs.sound;localStorage.setItem(LS_SOUND,soundOn?'on':'off');}
}

let profPanelOpen=false;
let searchBarOpen=false;
let searchQ='';
let aliasT=null;

function refreshMeAvatar(){
  const col=myProfile.color||uColor(uname||'u');
  ['bq-me-av','bq-me-av-dms','bq-me-av-dm','bq-me-av-online'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    el.style.background=col;el.style.color='#000';el.textContent=uInit(uname||'?');
  });
}
function openProfPanel(){refreshProfileView();document.getElementById('bqprofpanel').classList.add('open');profPanelOpen=true;}
function closeProfPanel(){document.getElementById('bqprofpanel').classList.remove('open');profPanelOpen=false;}

// Apply saved prefs on load
applyPrefs();

/* ─────────────────────────────────────────
   AUDIO
───────────────────────────────────────── */
let aCtx=null;
function ping(f=880){
  if(!soundOn) return;
  try{
    if(!aCtx) aCtx=new(window.AudioContext||window.webkitAudioContext)();
    const o=aCtx.createOscillator(),g=aCtx.createGain();
    o.connect(g);g.connect(aCtx.destination);o.type='sine';
    o.frequency.setValueAtTime(f,aCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f*.75,aCtx.currentTime+.12);
    g.gain.setValueAtTime(.09,aCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,aCtx.currentTime+.28);
    o.start();o.stop(aCtx.currentTime+.3);
  }catch(_){}
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function toast(m,dur=2200){
  const el=document.getElementById('bqtoast');if(!el)return;
  el.textContent=m;el.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),dur);
}

/* ─────────────────────────────────────────
   FULLSCREEN
───────────────────────────────────────── */
function toggleFS(){
  const p=document.getElementById('bqp');
  isFull=!isFull;
  p.classList.toggle('bq-fs',isFull);
  document.body.classList.toggle('bq-fs-mode',isFull);
  const ico=document.getElementById('bq-fs-ico');
  if(ico) ico.innerHTML=isFull
    ?'<polyline points="4,14 4,20 10,20"/><polyline points="20,10 20,4 14,4"/><line x1="4" y1="20" x2="11" y2="13"/><line x1="20" y1="4" x2="13" y2="11"/>'
    :'<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';
  document.getElementById('bq-fs-btn').classList.toggle('on',isFull);
}

/* ─────────────────────────────────────────
   NAVIGATION  (global — used from inline onclick) - FIXED
───────────────────────────────────────── */
window.bqNav = function(v){
  if(v===activeView) return;
  const oldView=activeView;
  const fromEl=document.getElementById('bqv-'+oldView);
  const toEl  =document.getElementById('bqv-'+v);
  if(!toEl) return;
  
  // Store previous non-DM view before updating activeView
  if(v!=='dmconv') prevNonDmView=oldView;
  activeView=v;
  
  // Immediately show target view and hide old view
  if(fromEl){
    fromEl.classList.add('bq-hidden');
    fromEl.classList.remove('bq-sleft');
  }
  toEl.classList.remove('bq-hidden','bq-sleft');
  
  // Update nav buttons immediately
  document.querySelectorAll('.bqnb').forEach(b=>{
    const isActive = b.dataset.v===v || (v==='dmconv'&&b.dataset.v==='dms');
    b.classList.toggle('active', isActive);
  });
  
  // Focus input if chat view
  if(v==='chat'&&!('ontouchstart' in window)){
    const i=document.getElementById('bqginp');
    if(i) setTimeout(()=>i.focus(),50);
  }
  if(v==='dmconv'&&!('ontouchstart' in window)){
    const i=document.getElementById('bqdminp');
    if(i) setTimeout(()=>i.focus(),50);
  }
  if(v==='profile') refreshProfileView();
};

function showDmConvo(pUid,pName){
  const newDmId=dmKey(uid,pUid);
  const isSameDm=activeDmId===newDmId;
  
  activeDmId=newDmId;
  activeDmPuid=pUid; activeDmPname=pName;
  dLastU=null;dLastT=0;dAtBot=true;

  // Update header
  const color=getColor(pUid,pName);
  const hav=document.getElementById('bqdmhav');
  hav.style.background=color;hav.style.color='#000';hav.textContent=uInit(pName);
  hav.dataset.puid=pUid;hav.dataset.pname=pName;
  const pdata=onlineU[pUid]||{};
  hav.className='bqdmhav'+(pdata.status?' '+pdata.status:'');
  document.getElementById('bqdmhn').textContent='@'+pName;
  const st=statusInfo(pdata.status||'');
  document.getElementById('bqdmhs').textContent=onlineU[pUid]?st.label:'Offline';
  document.getElementById('bqdmesub').textContent='@'+pName;

  // Clear msgs
  const msgs=document.getElementById('bqdmmsgs');
  msgs.innerHTML='';
  const e=document.createElement('div');e.className='bqempty';e.id='bqdmempty';
  e.innerHTML=`<div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bqempty-tx">START A CONVERSATION</div><div class="bqempty-sub">@${esc(pName)}</div>`;
  msgs.appendChild(e);

  // Detach ALL old listeners (including for same DM since we cleared msgs)
  Object.entries(dmListeners).forEach(([id,ref])=>{ref.off();delete dmListeners[id];});
  
  // Subscribe fresh
  if(db){
    const ref=db.ref('bq_dms/'+activeDmId+'/messages').limitToLast(MAX_MSG);
    ref.on('child_added',s=>renderMsg('dm',s.val(),s.key));
    ref.on('child_changed',s=>onMsgChanged('dm',s));
    ref.on('child_removed',s=>document.getElementById('bqmsg-dm-'+s.key)?.remove());
    dmListeners[activeDmId]=ref;
  }
  // DM typing
  if(dmTypRef){dmTypRef.off();dmTypRef=null;}
  if(db){
    dmTypRef=db.ref('bq_dm_typing/'+activeDmId);
    dmTypRef.on('value',snap=>{
      const now=Date.now(),ty=[];
      snap.forEach(c=>{const d=c.val();if(c.key!==uid&&d&&now-d.ts<3800)ty.push('@'+(d.uname||'?'));});
      const el=document.getElementById('bqdmtyp');if(!el)return;
      if(!ty.length){el.innerHTML='';return;}
      el.innerHTML=`<div class="bqtd"><span></span><span></span><span></span></div><span>${ty.join(' & ')} typing</span>`;
    });
  }
  // Mark read
  if(db&&dmUnread[activeDmId]){
    db.ref('bq_dms/'+activeDmId+'/meta/unread/'+uid).set(0);
    dmUnread[activeDmId]=0;updateBadges();
  }

  // Force navigate - ensure dmconv view is visible even if we think we're already there
  const dmconvEl=document.getElementById('bqv-dmconv');
  if(dmconvEl.classList.contains('bq-hidden')||activeView!=='dmconv'){
    bqNav('dmconv');
  } else {
    // Already on dmconv but need to scroll to bottom
    requestAnimationFrame(()=>{if(msgs)msgs.scrollTop=msgs.scrollHeight;});
  }
}

/* ─────────────────────────────────────────
   FIREBASE
───────────────────────────────────────── */
function loadSDK(){
  return new Promise((res,rej)=>{
    let done=0;
    ['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
     'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js'].forEach(u=>{
      const s=document.createElement('script');s.src=u;
      s.onload=()=>{if(++done===2)res();};s.onerror=rej;
      document.head.appendChild(s);
    });
  });
}
async function startDB(){
  if(db)return;
  try{
    await loadSDK();
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db=firebase.database();
    subscribeGlobal();subscribeGlobalTyping();startPresence();subscribeDmList();
  }catch(e){console.warn('[BioQuiz Chat]',e);}
}

/* ─────────────────────────────────────────
   USERNAME REGISTRY
───────────────────────────────────────── */
function ckUN(raw){
  const name=sanitUN(raw);
  const inp=document.getElementById('bqnminp');
  const st=document.getElementById('bqnmst');
  const btn=document.getElementById('bqnmbtn');
  const av=document.getElementById('bqnmav');
  if(inp.value!==name) inp.value=name;
  if(name){const c=uColor(name);av.style.background=c;av.style.color='#000';av.textContent=uInit(name);}
  else{av.style.background='rgba(255,255,255,.1)';av.textContent='?';}
  if(!name||name.length<2){st.textContent=name.length===1?'Min 2 chars':'';st.className='bqnmst';inp.className='bqnmi';btn.disabled=true;return;}
  if(name===uname){st.textContent='✓ Your current username';st.className='bqnmst ok';inp.className='bqnmi ok';btn.disabled=false;return;}
  clearTimeout(nmCkT);st.textContent='Checking…';st.className='bqnmst chk';inp.className='bqnmi chk';btn.disabled=true;
  nmCkT=setTimeout(async()=>{
    if(!db){st.textContent='✓ Available!';st.className='bqnmst ok';inp.className='bqnmi ok';btn.disabled=false;return;}
    try{
      const s=await db.ref('bq_usernames/'+name).once('value');const o=s.val();
      if(o&&o!==uid){st.textContent='@'+name+' is taken';st.className='bqnmst tkn';inp.className='bqnmi tkn';btn.disabled=true;}
      else{st.textContent='✓ @'+name+' is free!';st.className='bqnmst ok';inp.className='bqnmi ok';btn.disabled=false;}
    }catch(_){st.textContent='✓ Looks good';st.className='bqnmst ok';btn.disabled=false;}
  },480);
}
async function claimUN(name){
  if(!db)return;
  if(uname&&uname!==name) await db.ref('bq_usernames/'+uname).remove().catch(()=>{});
  await db.ref('bq_usernames/'+name).set(uid).catch(()=>{});
}

/* ─────────────────────────────────────────
   NAME MODAL
───────────────────────────────────────── */
function showModal(rename){
  const m=document.getElementById('bqnm');
  const inp=document.getElementById('bqnminp');
  const btn=document.getElementById('bqnmbtn');
  const st=document.getElementById('bqnmst');
  m.style.display='flex';
  inp.value=rename?(uname||''):'';
  btn.textContent=rename?'UPDATE USERNAME':'JOIN CHAT';
  btn.disabled=true;st.textContent='';st.className='bqnmst';inp.className='bqnmi';
  const av=document.getElementById('bqnmav');
  if(rename&&uname){av.style.background=uColor(uname);av.textContent=uInit(uname);ckUN(uname);}
  else{av.style.background='rgba(255,255,255,.1)';av.textContent='?';}
  // Only auto-focus modals on non-touch devices
  if(!('ontouchstart' in window)) setTimeout(()=>inp.focus(),60);
}
function hideModal(){ document.getElementById('bqnm').style.display='none'; }

async function submitName(){
  const name=sanitUN(document.getElementById('bqnminp').value);
  if(!name||name.length<2)return;
  const btn=document.getElementById('bqnmbtn');
  btn.disabled=true;btn.textContent='JOINING…';
  const isFirst=!uname,oldName=uname;
  await startDB();
  if(db&&name!==uname){
    try{
      const s=await db.ref('bq_usernames/'+name).once('value');const o=s.val();
      if(o&&o!==uid){
        document.getElementById('bqnmst').textContent='@'+name+' was just taken!';
        document.getElementById('bqnmst').className='bqnmst tkn';
        btn.disabled=false;btn.textContent='JOIN CHAT';return;
      }
    }catch(_){}
  }
  await claimUN(name);
  uname=name;localStorage.setItem(LS_NAME,uname);
  hideModal();startPresence();
  if(isFirst) sendSys('bq_messages','@'+uname+' joined the chat 👋');
  else if(oldName&&oldName!==uname) sendSys('bq_messages','@'+oldName+' → @'+uname);
  btn.textContent='JOIN CHAT';btn.disabled=false;
  refreshMeAvatar();
  if(profPanelOpen) refreshProfileView();
}

/* ─────────────────────────────────────────
   COLOUR HELPER  (uses custom colour or palette)
───────────────────────────────────────── */
function getColor(userId, userName){
  if(userId===uid&&myProfile.color) return myProfile.color;
  if(onlineU[userId]&&onlineU[userId].color) return onlineU[userId].color;
  return uColor(userName||'');
}

/* ─────────────────────────────────────────
   PRESENCE
───────────────────────────────────────── */
function startPresence(){
  if(!db||!uname)return;
  const ref=db.ref('bq_presence/'+uid);
  const beat=()=>ref.set({
    uname,ts:Date.now(),
    status:myProfile.status||'online',
    activity:myProfile.activity||'',
    bio:myProfile.bio||'',
    color:myProfile.color||'',
  });
  beat();clearInterval(presInt);
  presInt=setInterval(beat,PRESENCE_TTL*.7);
  ref.onDisconnect().remove();
  db.ref('bq_presence').on('value',snap=>{
    const now=Date.now();onlineU={};
    snap.forEach(c=>{
      const d=c.val();
      if(d&&now-d.ts<PRESENCE_TTL*1.6) onlineU[c.key]=d;
      else c.ref.remove();
    });
    renderOnlineList();updateDmHdrStatus();
    const n=Object.keys(onlineU).length;
    const el=document.getElementById('bqocnt');if(el) el.textContent=n+' online';
    const nb=document.getElementById('bqonb');
    if(nb&&n>0){nb.textContent=n;nb.classList.add('show');}else if(nb) nb.classList.remove('show');
  });
}
function updateDmHdrStatus(){
  if(activeView!=='dmconv'||!activeDmPuid)return;
  const pdata=onlineU[activeDmPuid]||{};
  const isOn=!!onlineU[activeDmPuid];
  const hav=document.getElementById('bqdmhav');
  if(hav){hav.className='bqdmhav'+(pdata.status?' '+pdata.status:'');hav.dataset.status=pdata.status||'';}
  const hs=document.getElementById('bqdmhs');
  if(hs) hs.textContent=isOn?statusInfo(pdata.status||'online').label:'Offline';
}

function renderOnlineList(){
  const list=document.getElementById('bqol');if(!list)return;
  list.innerHTML='';
  const entries=Object.entries(onlineU);
  if(!entries.length){
    list.innerHTML='<div style="padding:32px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.46rem;letter-spacing:.18em;color:rgba(255,255,255,.13)">NO ONE ONLINE</div>';return;
  }
  entries.sort((a,b)=>a[0]===uid?-1:b[0]===uid?1:(a[1].uname||'').localeCompare(b[1].uname||''));
  entries.forEach(([id,d])=>{
    const me=id===uid,n=d.uname||'?';
    const c=getColor(id,n);
    const si=statusInfo(d.status||'online');
    const row=document.createElement('div');
    row.className='bqurow'+(me?' isme':'');
    row.innerHTML=`
      <div class="bquav" style="background:${c};color:#000" data-status="${esc(d.status||'online')}">${uInit(n)}</div>
      <div class="bquinfo">
        <div class="bquu">@${esc(n)}${me?'<span class="bquyou">YOU</span>':''}</div>
        <div class="bqust" style="color:${si.color}">${si.label}</div>
        ${d.activity?`<div class="bquact">${esc(d.activity)}</div>`:''}
      </div>
      ${!me?'<div class="bqudmh">DM →</div>':''}`;
    if(!me) row.addEventListener('click',e=>{
      // stopPropagation so outside-click handler can't interfere
      e.stopPropagation();
      if(!uname){showModal(false);return;}
      openProfileCard(id,n,d);
    });
    list.appendChild(row);
  });
}

/* ─────────────────────────────────────────
   PROFILE CARD  (fixed — singleton, stopPropagation)
───────────────────────────────────────── */
let pcTargetUid=null,pcTargetName=null;

function openProfileCard(targetUid,targetName,presData){
  pcTargetUid=targetUid;pcTargetName=targetName;
  const isMe=targetUid===uid;
  const color=getColor(targetUid,targetName);
  const pd=presData||onlineU[targetUid]||{};
  const si=statusInfo(pd.status||'online');

  // Banner gradient
  document.getElementById('bqpc-banner').style.background=`linear-gradient(135deg,${color}55,${color}22)`;
  // Avatar
  const av=document.getElementById('bqpc-av');
  av.style.background=color;av.style.color='#000';av.textContent=uInit(targetName);
  // Name
  document.getElementById('bqpc-name').textContent='@'+targetName;
  // Status
  const stEl=document.getElementById('bqpc-status');
  stEl.innerHTML=`<div class="bqpc-sdot" style="background:${si.color}"></div><span class="bqpc-slabel" style="color:${si.color}">${si.label}</span>`;
  // Activity
  const actEl=document.getElementById('bqpc-activity');
  if(pd.activity){actEl.textContent=pd.activity;actEl.style.display='flex';}
  else actEl.style.display='none';
  // Bio
  const bioEl=document.getElementById('bqpc-bio');
  if(pd.bio){bioEl.textContent=pd.bio;bioEl.style.display='block';}
  else bioEl.style.display='none';
  // Alias input (non-self)
  const aliasWrap=document.getElementById('bqpc-aliasw');
  const aliasInp=document.getElementById('bqpc-aliasinp');
  if(!isMe&&aliasWrap&&aliasInp){
    aliasWrap.style.display='block';
    aliasInp.value=getAlias(targetUid)||'';
    aliasInp.oninput=()=>{
      clearTimeout(aliasT);
      aliasT=setTimeout(()=>{setAlias(targetUid,aliasInp.value);renderDmList();renderOnlineList();toast(aliasInp.value.trim()?'Alias set ✓':'Alias removed');},600);
    };
  } else if(aliasWrap){aliasWrap.style.display='none';}

  // Actions
  const actsEl=document.getElementById('bqpc-actions');
  actsEl.innerHTML='';
  if(!isMe){
    const dmBtn=document.createElement('button');
    dmBtn.className='bqpc-btn dm';
    dmBtn.innerHTML='<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>DM';
    // Bind click directly — no event delegation
    dmBtn.onclick=function(e){
      e.stopPropagation();
      closeProfileCard();
      showDmConvo(targetUid,targetName);
    };
    actsEl.appendChild(dmBtn);
  } else {
    const editBtn=document.createElement('button');
    editBtn.className='bqpc-btn edit';
    editBtn.innerHTML='<svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>EDIT PROFILE';
    editBtn.onclick=function(e){
      e.stopPropagation();
      closeProfileCard();
      bqNav('profile');
    };
    actsEl.appendChild(editBtn);
  }
  // Show
  const card=document.getElementById('bqpc');
  card.classList.add('open');
}

function closeProfileCard(){
  document.getElementById('bqpc').classList.remove('open');
  pcTargetUid=null;pcTargetName=null;
}

/* ─────────────────────────────────────────
   GLOBAL CHAT
───────────────────────────────────────── */
function subscribeGlobal(){
  const ref=db.ref('bq_messages').limitToLast(MAX_MSG);
  ref.on('child_added',s=>renderMsg('global',s.val(),s.key));
  ref.on('child_changed',s=>onMsgChanged('global',s));
  ref.on('child_removed',s=>document.getElementById('bqmsg-global-'+s.key)?.remove());
}
function subscribeGlobalTyping(){
  db.ref('bq_typing').on('value',snap=>{
    const now=Date.now(),ty=[];
    snap.forEach(c=>{const d=c.val();if(c.key!==uid&&d&&now-d.ts<3800)ty.push('@'+(d.uname||'?'));});
    const el=document.getElementById('bqgtyp');if(!el)return;
    if(!ty.length){el.innerHTML='';return;}
    const lb=ty.length>2?ty.slice(0,2).join(', ')+' +'+(ty.length-2):ty.join(' & ');
    el.innerHTML=`<div class="bqtd"><span></span><span></span><span></span></div><span>${lb} typing</span>`;
  });
}
function sendGlobal(text){
  if(!db||!text.trim()||!uname)return;
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(gReply) p.replyTo={key:gReply.key,uname:gReply.uname,text:gReply.text.slice(0,80)};
  db.ref('bq_messages').push(p);
  db.ref('bq_messages').once('value',snap=>{
    const keys=[];snap.forEach(c=>keys.push(c.key));
    if(keys.length>MAX_MSG+25) keys.slice(0,keys.length-MAX_MSG).forEach(k=>db.ref('bq_messages/'+k).remove());
  });
  clearReply('g');
}

/* ─────────────────────────────────────────
   DM LIST — debounced to prevent mid-click DOM destruction
───────────────────────────────────────── */
let dmRenderT=null;
function subscribeDmList(){
  if(!db||!uid)return;
  db.ref('bq_dms').on('value',snap=>{
    dmMeta={};
    snap.forEach(child=>{
      const m=child.val();
      if(m&&m.meta&&(m.meta.p1===uid||m.meta.p2===uid)) dmMeta[child.key]=m.meta;
    });
    // Debounce render so rapid Firebase updates don't destroy rows mid-click
    clearTimeout(dmRenderT);
    dmRenderT=setTimeout(renderDmList,120);
    updateBadges();
  });
}

function renderDmList(){
  const list=document.getElementById('bqdml');if(!list)return;
  const items=Object.entries(dmMeta);
  if(!items.length){
    // Only wipe if it's actually empty (not just a fast refetch)
    if(!list.querySelector('.bqdmr')){
      list.innerHTML='';
      const e=document.createElement('div');e.className='bqempty';e.style.marginTop='40px';
      e.innerHTML='<div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bqempty-tx">NO DMs YET</div><div class="bqempty-sub">GO TO ONLINE TAB TO START</div>';
      list.appendChild(e);
    }
    return;
  }
  items.sort((a,b)=>(b[1].lastTs||0)-(a[1].lastTs||0));

  // Keyed update — only add/update rows that changed, don't destroy existing ones
  const existingKeys=new Set([...list.querySelectorAll('.bqdmr')].map(r=>r.dataset.did));
  const newKeys=new Set(items.map(([k])=>k));

  // Remove stale rows
  existingKeys.forEach(k=>{ if(!newKeys.has(k)) list.querySelector(`[data-did="${k}"]`)?.remove(); });

  // Remove empty state if present
  list.querySelector('.bqempty')?.remove();

  // Sort: pinned first, then by lastTs
  const pins=getPins();
  items.sort((a,b)=>{const ap=pins.includes(a[0])?1:0,bp=pins.includes(b[0])?1:0;if(ap!==bp)return bp-ap;return(b[1].lastTs||0)-(a[1].lastTs||0);});

  items.forEach(([did,meta])=>{
    const puid =meta.p1===uid?meta.p2:meta.p1;
    const pname=meta.p1===uid?(meta.n2||'?'):(meta.n1||'?');
    const alias=getAlias(puid);
    const shown=alias||('@'+pname);
    const unrd =meta.unread&&meta.unread[uid]?meta.unread[uid]:0;
    const pdata=onlineU[puid]||{};
    const c    =getColor(puid,pname);
    const preview=meta.lastMsg?esc(meta.lastMsg.slice(0,50)):'';
    const ts   =meta.lastTs?tsStr(meta.lastTs):'';
    const stCls=pdata.status||'';
    const pinned=pins.includes(did);

    let row=list.querySelector(`[data-did="${did}"]`);
    const isNew=!row;
    if(isNew){row=document.createElement('div');row.className='bqdmr';row.dataset.did=did;}
    row.dataset.puid=puid;row.dataset.pname=pname;
    row.innerHTML=`
      <div class="bqdmav ${stCls}" style="background:${c};color:#000">${uInit(pname)}</div>
      <div class="bqdmin">
        <div class="bqdmn">${pinned?'<span class="bqdm-pin">📌</span>':''}${esc(shown)}${alias?`<span class="bq-alias"> (@${esc(pname)})</span>`:''}  </div>
        <div class="bqdmp${unrd?' unr':''}">${preview||'<span style="opacity:.35">No messages yet</span>'}</div>
      </div>
      <div class="bqdmm">
        <div class="bqdmt">${ts}</div>
        ${unrd?`<div class="bqdmub">${unrd>9?'9+':unrd}</div>`:''}
      </div>
      <div class="bqdmr-acts">
        <button class="bqdmr-act bq-pin${pinned?' pinned':''}" data-did="${did}" title="${pinned?'Unpin':'Pin'}">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </button>
        <button class="bqdmr-act bq-del" data-did="${did}" title="Delete conversation">
          <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div class="bqdmr-confirm">
        <div class="bqdmr-confirm-msg">Delete conversation?</div>
        <button class="bqdmr-cyes" data-did="${did}">YES</button>
        <button class="bqdmr-cno">CANCEL</button>
      </div>`;
    if(isNew) list.appendChild(row);
  });
  items.forEach(([did])=>{const r=list.querySelector(`[data-did="${did}"]`);if(r)list.appendChild(r);});
}

/* ── EVENT DELEGATION for DM list (single listener, no row leaks) ── */
function initDmDelegate(){
  const list=document.getElementById('bqdml');if(!list||list.dataset.delegated)return;
  list.dataset.delegated='1';
  list.addEventListener('click',function(e){
    const row=e.target.closest('.bqdmr');if(!row)return;
    if(e.target.closest('.bq-pin')){e.stopPropagation();togglePin(e.target.closest('.bq-pin').dataset.did);return;}
    if(e.target.closest('.bq-del')){e.stopPropagation();const cf=row.querySelector('.bqdmr-confirm');if(cf)cf.classList.toggle('show');return;}
    if(e.target.closest('.bqdmr-cyes')){e.stopPropagation();deleteDmConvo(e.target.closest('.bqdmr-cyes').dataset.did);return;}
    if(e.target.closest('.bqdmr-cno')){e.stopPropagation();row.querySelector('.bqdmr-confirm')?.classList.remove('show');return;}
    if(e.target.closest('.bqdmr-acts')||e.target.closest('.bqdmr-confirm'))return;
    e.stopPropagation();
    const pid=row.dataset.puid,pn=row.dataset.pname;
    if(!pid||!pn)return;
    if(!uname){showModal(false);return;}
    showDmConvo(pid,pn);
  });
}

function deleteDmConvo(did){
  if(!db||!did)return;
  db.ref('bq_dms/'+did).remove();
  delete dmMeta[did];delete dmUnread[did];
  if(dmListeners[did]){dmListeners[did].off();delete dmListeners[did];}
  if(activeDmId===did&&activeView==='dmconv'){
    activeDmId=null;activeDmPuid=null;activeDmPname=null;
    document.getElementById('bqv-dmconv').classList.add('bq-hidden');
    document.getElementById('bqv-dms').classList.remove('bq-hidden','bq-sleft');
    activeView='dms';
    document.querySelectorAll('.bqnb').forEach(b=>b.classList.toggle('active',b.dataset.v==='dms'));
  }
  renderDmList();updateBadges();toast('Conversation deleted');
}

/* ─────────────────────────────────────────
   DM SEND
───────────────────────────────────────── */
function sendDm(text){
  if(!db||!text.trim()||!uname||!activeDmId||!activeDmPuid)return;
  const pname=activeDmPname||'?';
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(dmReply) p.replyTo={key:dmReply.key,uname:dmReply.uname,text:dmReply.text.slice(0,80)};
  db.ref('bq_dms/'+activeDmId+'/messages').push(p);
  const sorted=[uid,activeDmPuid].sort();
  db.ref('bq_dms/'+activeDmId+'/meta').update({
    p1:sorted[0],p2:sorted[1],
    n1:sorted[0]===uid?uname:pname,
    n2:sorted[0]===uid?pname:uname,
    lastMsg:text.trim().slice(0,60),lastTs:Date.now(),
  });
  db.ref('bq_dms/'+activeDmId+'/meta/unread/'+activeDmPuid).transaction(n=>(n||0)+1);
  clearReply('dm');
}

/* ─────────────────────────────────────────
   TYPING
───────────────────────────────────────── */
function setGTyp(on){
  if(!db||!uname)return;
  on?db.ref('bq_typing/'+uid).set({uname,ts:Date.now()}):db.ref('bq_typing/'+uid).remove();
  isGTyp=on;
}
function setDmTyp(on){
  if(!db||!uname||!activeDmId)return;
  on?db.ref('bq_dm_typing/'+activeDmId+'/'+uid).set({uname,ts:Date.now()}):db.ref('bq_dm_typing/'+activeDmId+'/'+uid).remove();
  isDmTyp=on;
}

/* ─────────────────────────────────────────
   SYSTEM MSG
───────────────────────────────────────── */
function sendSys(path,text){
  if(!db)return;
  db.ref(path).push({type:'system',text,ts:Date.now()});
}

/* ─────────────────────────────────────────
   REACTIONS
───────────────────────────────────────── */
function toggleRxn(ctx,key,emoji){
  if(!db)return;
  const p=(ctx==='global'?'bq_messages':'bq_dms/'+activeDmId+'/messages')+'/'+key+'/reactions/'+emoji+'/'+uid;
  db.ref(p).once('value',s=>s.val()?db.ref(p).remove():db.ref(p).set(true));
}
function onMsgChanged(ctx,snap){
  const el=document.getElementById('bqmsg-'+ctx+'-'+snap.key);if(!el)return;
  const msg=snap.val();el.querySelector('.bqrxns')?.remove();
  if(msg.reactions) renderRxns(ctx,el,msg.reactions,snap.key);
}
function renderRxns(ctx,rowEl,rxns,key){
  if(!rxns||typeof rxns!=='object')return;
  const bw=rowEl.querySelector('.bqbw');if(!bw)return;
  const div=document.createElement('div');div.className='bqrxns';
  Object.entries(rxns).forEach(([e,users])=>{
    if(!users||typeof users!=='object')return;
    const uids=Object.keys(users);if(!uids.length)return;
    const mine=uids.includes(uid);
    const btn=document.createElement('button');
    btn.className='bqrxn'+(mine?' mr':'');
    btn.innerHTML=`${e}<span class="bqrxn-n">${uids.length}</span>`;
    btn.addEventListener('click',ev=>{ev.stopPropagation();toggleRxn(ctx,key,e);});
    div.appendChild(btn);
  });
  if(div.children.length) bw.appendChild(div);
}

/* ─────────────────────────────────────────
   REPLY
───────────────────────────────────────── */
function setReply(ctx,data){
  if(ctx==='g'){
    gReply=data;
    const bar=document.getElementById('bqgrbar');bar.classList.add('show');
    document.getElementById('bqgrbn').textContent='@'+data.uname;
    document.getElementById('bqgrbt').textContent=data.text;
  } else {
    dmReply=data;
    const bar=document.getElementById('bqdmrbar');bar.classList.add('show');
    document.getElementById('bqdmrbn').textContent='@'+data.uname;
    document.getElementById('bqdmrbt').textContent=data.text;
  }
}
function clearReply(ctx){
  if(ctx==='g'){gReply=null;document.getElementById('bqgrbar').classList.remove('show');}
  else{dmReply=null;document.getElementById('bqdmrbar').classList.remove('show');}
}

/* ─────────────────────────────────────────
   RENDER MESSAGE
───────────────────────────────────────── */
function renderMsg(ctx,msg,key){
  const isG=ctx==='global';
  const msgsEl=document.getElementById(isG?'bqgmsgs':'bqdmmsgs');
  if(!msgsEl)return;
  document.getElementById(isG?'bqgempty':'bqdmempty')?.remove();
  const pfx='bqmsg-'+ctx+'-';

  if(msg.type==='system'){
    const d=document.createElement('div');d.id=pfx+key;d.className='bqsys';d.textContent=msg.text;
    msgsEl.appendChild(d);scrollD(ctx);return;
  }

  const isMine=msg.uid===uid;
  const ts=msg.ts||Date.now();
  const msgDate=new Date(ts);

  // Date sep
  const lastEl=msgsEl.lastElementChild;
  if(!lastEl||lastEl.dataset.date!==msgDate.toDateString()){
    const sep=document.createElement('div');sep.className='bqds';sep.textContent=dateLabel(ts);sep.dataset.date=msgDate.toDateString();
    msgsEl.appendChild(sep);
    if(isG) gLastU=null; else dLastU=null;
  }

  const lU=isG?gLastU:dLastU,lT=isG?gLastT:dLastT;
  const consec=lU===msg.uid&&(ts-lT)<120000;
  if(isG){gLastU=msg.uid;gLastT=ts;}else{dLastU=msg.uid;dLastT=ts;}

  const presD=onlineU[msg.uid]||{};
  const col=getColor(msg.uid,msg.uname||'');
  const ini=uInit(msg.uname||'?');
  const tStr=tsStr(ts);
  const rpHTML=msg.replyTo?`<div class="bqrp"><div class="bqrp-n">@${esc(msg.replyTo.uname||'')}</div><div class="bqrp-t">${esc(msg.replyTo.text||'')}</div></div>`:'';
  const pickBtns=REACTIONS.map(e=>`<button class="bqepbtn" data-e="${e}">${e}</button>`).join('');

  const row=document.createElement('div');
  row.id=pfx+key;
  row.className='bqr '+(isMine?'mine':'theirs')+(consec?' consec':'');
  row.dataset.date=msgDate.toDateString();

  row.innerHTML=`
    <div class="bqri">
      <div class="bqav" style="background:${col};color:#000" data-status="${esc(presD.status||'')}" data-uid="${esc(msg.uid)}" data-uname="${esc(msg.uname||'')}">${ini}</div>
      <div class="bqcol">
        <div class="bqmeta">
          <span class="bqun" style="color:${col}" data-uid="${esc(msg.uid)}" data-uname="${esc(msg.uname||'')}">${isMine?'You':'@'+esc(msg.uname||'?')}</span>
          <span class="bqts">${tStr}</span>
        </div>
        <div class="bqbw">
          <div class="bqacts">
            <div class="bqepick" id="${pfx}ep-${key}">${pickBtns}</div>
            <button class="bqact" data-a="react" title="React">😊</button>
            <button class="bqact" data-a="reply" title="Reply"><svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></button>
            <button class="bqact" data-a="copy" title="Copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
            ${isMine?`<button class="bqact del" data-a="del" title="Delete"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>`:''}
          </div>
          <div class="bqbbl">${rpHTML}${linkify(esc(msg.text||''))}</div>
        </div>
      </div>
    </div>`;

  if(msg.reactions) renderRxns(ctx,row,msg.reactions,key);
  msgsEl.appendChild(row);

  // Action buttons
  row.querySelectorAll('.bqact').forEach(b=>{
    b.addEventListener('click',e=>{e.stopPropagation();doAction(ctx,b.dataset.a,key,msg,pfx);});
  });
  // Emoji pick
  row.querySelectorAll('.bqepbtn').forEach(b=>{
    b.addEventListener('click',e=>{e.stopPropagation();toggleRxn(ctx,key,b.dataset.e);document.getElementById(pfx+'ep-'+key)?.classList.remove('open');});
  });
  // Avatar / username → profile card
  row.querySelectorAll('.bqav,.bqun').forEach(el=>{
    el.addEventListener('click',e=>{
      e.stopPropagation();
      const tuid=el.dataset.uid||msg.uid;
      const tname=el.dataset.uname||msg.uname||'?';
      openProfileCard(tuid,tname,onlineU[tuid]);
    });
  });

  if(!isOpen&&!isMine){if(isG)gUnread++;else{dmUnread[activeDmId]=(dmUnread[activeDmId]||0)+1;}ping();updateBadges();}
  scrollD(ctx);
}

function doAction(ctx,a,key,msg,pfx){
  if(a==='react'){const p=document.getElementById(pfx+'ep-'+key);if(p)p.classList.toggle('open');}
  else if(a==='reply'){setReply(ctx==='global'?'g':'dm',{key,uname:msg.uname,text:msg.text});document.getElementById(ctx==='global'?'bqginp':'bqdminp')?.focus();}
  else if(a==='copy'){navigator.clipboard?.writeText(msg.text).then(()=>toast('Copied'));}
  else if(a==='del'){if(msg.uid!==uid)return;const p=ctx==='global'?'bq_messages/'+key:'bq_dms/'+activeDmId+'/messages/'+key;db.ref(p).remove();}
}

/* ─────────────────────────────────────────
   BADGES
───────────────────────────────────────── */
function updateBadges(){
  const dmTotal=Object.values(dmUnread).reduce((s,n)=>s+n,0);
  const nb=document.getElementById('bqdmnb');
  if(nb){if(dmTotal>0){nb.textContent=dmTotal>9?'9+':dmTotal;nb.classList.add('show');}else nb.classList.remove('show');}
  const total=gUnread+dmTotal;
  const badge=document.getElementById('bqbadge');
  if(!badge)return;
  if(total>0){badge.textContent=total>9?'9+':total;badge.classList.add('show');}else badge.classList.remove('show');
}

/* ─────────────────────────────────────────
   SCROLL
───────────────────────────────────────── */
function scrollD(ctx){
  const isG=ctx==='global';
  const atB=isG?gAtBot:dAtBot;
  const el=document.getElementById(isG?'bqgmsgs':'bqdmmsgs');
  if(atB&&el) requestAnimationFrame(()=>el.scrollTop=el.scrollHeight);
}

/* ─────────────────────────────────────────
   PANEL OPEN/CLOSE
───────────────────────────────────────── */
function openPanel(){
  document.getElementById('bqp').classList.add('open');
  document.getElementById('bqb').classList.add('open');
  isOpen=true;gUnread=0;updateBadges();gAtBot=true;
  refreshMeAvatar();
  const m=document.getElementById('bqgmsgs');
  if(m) requestAnimationFrame(()=>m.scrollTop=m.scrollHeight);
  if(activeView==='chat'&&!('ontouchstart' in window)) document.getElementById('bqginp')?.focus();
}
function closePanel(){
  document.getElementById('bqp').classList.remove('open');
  document.getElementById('bqb').classList.remove('open');
  isOpen=false;setGTyp(false);clearTimeout(gTypT);
  if(activeDmId){setDmTyp(false);clearTimeout(dmTypT);}
  closeProfileCard();
}
function togglePanel(){
  if(isOpen){closePanel();return;}
  openPanel();
  if(!uname) showModal(false);
  else if(!db) startDB();
}

/* ─────────────────────────────────────────
   PROFILE SETTINGS VIEW
───────────────────────────────────────── */
function refreshProfileView(){
  // Avatar preview
  const col=myProfile.color||uColor(uname||'');
  const av=document.getElementById('bqpfav');
  if(av){av.style.background=col;av.style.color='#000';av.textContent=uInit(uname||'?');}
  const un=document.getElementById('bqpfuname');
  if(un) un.textContent='@'+(uname||'...');
  // Colour chips
  const cols=document.getElementById('bqpfcols');
  if(cols){
    cols.innerHTML='';
    PALETTE.forEach(c=>{
      const chip=document.createElement('div');
      chip.className='bqpf-col'+(c===col?' sel':'');
      chip.style.background=c;
      chip.addEventListener('click',()=>{
        myProfile.color=c;
        cols.querySelectorAll('.bqpf-col').forEach(x=>x.classList.toggle('sel',x.style.background===c||x.style.backgroundColor===c));
        if(av){av.style.background=c;}
      });
      cols.appendChild(chip);
    });
  }
  // Status chips
  const sts=document.getElementById('bqpfsts');
  if(sts){
    sts.innerHTML='';
    STATUS_LIST.forEach(s=>{
      const chip=document.createElement('div');
      chip.className='bqpf-st'+(s.id===myProfile.status?' sel':'');
      chip.innerHTML=`<div class="bqpf-st-dot" style="background:${s.color}"></div><span class="bqpf-st-lbl">${s.label}</span>`;
      chip.addEventListener('click',()=>{
        myProfile.status=s.id;
        sts.querySelectorAll('.bqpf-st').forEach(x=>x.classList.toggle('sel',x===chip));
      });
      sts.appendChild(chip);
    });
  }
  // Activity + bio
  const act=document.getElementById('bqpfact');
  const bio=document.getElementById('bqpfbio');
  if(act) act.value=myProfile.activity||'';
  if(bio) bio.value=myProfile.bio||'';
  // Preferences UI
  refreshProfilePrefs();
}

function refreshProfilePrefs(){
  // Accent colours
  const accs=document.getElementById('bqpfaccs');
  if(accs){
    accs.innerHTML='';
    ACCENT_LIST.forEach(c=>{
      const ch=document.createElement('div');ch.className='bqpf-acc'+(c===(myPrefs.accentColor||'#ffffff')?' sel':'');
      ch.style.background=c;
      ch.addEventListener('click',()=>{myPrefs.accentColor=c;accs.querySelectorAll('.bqpf-acc').forEach(x=>x.classList.toggle('sel',x.style.background===c));document.documentElement.style.setProperty('--bq-accent',c);});
      accs.appendChild(ch);
    });
  }
  // Bubble shapes
  const shps=document.getElementById('bqpf-shapes');
  if(shps){
    shps.querySelectorAll('.bqpf-shape').forEach(s=>{
      s.classList.toggle('sel',s.dataset.shape===(myPrefs.bubbleShape||'default'));
      s.onclick=()=>{myPrefs.bubbleShape=s.dataset.shape;shps.querySelectorAll('.bqpf-shape').forEach(x=>x.classList.toggle('sel',x===s));applyPrefs();};
    });
  }
  // Font scale
  const sc=document.getElementById('bqpf-fontscale'),scv=document.getElementById('bqpf-fsval');
  if(sc){sc.value=myPrefs.fontScale||100;if(scv)scv.textContent=(myPrefs.fontScale||100)+'%';sc.oninput=()=>{myPrefs.fontScale=+sc.value;if(scv)scv.textContent=myPrefs.fontScale+'%';applyPrefs();};}
  // Compact
  const cmp=document.getElementById('bqpf-compact');if(cmp){cmp.classList.toggle('on',!!myPrefs.compact);cmp.onclick=()=>{myPrefs.compact=!myPrefs.compact;cmp.classList.toggle('on',myPrefs.compact);applyPrefs();};}
  // Sound
  const snd=document.getElementById('bqpf-sound');if(snd){snd.classList.toggle('on',soundOn);snd.onclick=()=>{soundOn=!soundOn;myPrefs.sound=soundOn;snd.classList.toggle('on',soundOn);document.getElementById('bq-sound-btn')?.classList.toggle('on',soundOn);};}
}

function saveProfile(){
  const act=document.getElementById('bqpfact')?.value.trim()||'';
  const bio=document.getElementById('bqpfbio')?.value.trim()||'';
  myProfile.activity=act;
  myProfile.bio=bio;
  localStorage.setItem(LS_PROF,JSON.stringify(myProfile));
  // Save prefs
  localStorage.setItem(LS_PREFS,JSON.stringify(myPrefs));
  applyPrefs();
  // Push to Firebase presence immediately
  if(db&&uname) startPresence();
  refreshMeAvatar();
  // Show confirmation
  const msg=document.getElementById('bqpfmsg');
  if(msg){msg.textContent='✓ Saved';msg.style.opacity='1';setTimeout(()=>msg.style.opacity='0',2500);}
  toast('Profile saved');
}

/* ─────────────────────────────────────────
   MESSAGE SEARCH
───────────────────────────────────────── */
function filterMsgs(){
  const msgs=document.getElementById('bqgmsgs');if(!msgs)return;
  msgs.querySelectorAll('.bqr,.bqsys,.bqds').forEach(el=>{
    if(!searchQ){el.style.display='';return;}
    const txt=(el.querySelector('.bqbbl')?.textContent||el.textContent||'').toLowerCase();
    el.style.display=txt.includes(searchQ)?'':'none';
  });
}

/* ─────────────────────────────────────────
   INPUT SETUP (shared factory)
───────────────────────────────────────── */
function setupInput(ctx){
  const isG=ctx==='global';
  const inp =document.getElementById(isG?'bqginp':'bqdminp');
  const snd =document.getElementById(isG?'bqgsnd':'bqdmsnd');
  const cc  =document.getElementById(isG?'bqgcc':'bqdmcc');
  const tray=document.getElementById(isG?'bqget':'bqdmet');
  const eoB =document.getElementById(isG?'bqgeo':'bqdmeo');
  const scrB=document.getElementById(isG?'bqgscr':'bqdmscr');
  const msgs=document.getElementById(isG?'bqgmsgs':'bqdmmsgs');
  if(!inp||!snd)return;

  // Emoji tray
  EMOJI_LIST.forEach(e=>{
    const b=document.createElement('button');b.className='bqietb';b.textContent=e;
    b.addEventListener('click',()=>{inp.value+=e;inp.dispatchEvent(new Event('input'));inp.focus();});
    tray.appendChild(b);
  });
  if(eoB) eoB.addEventListener('click',()=>tray.classList.toggle('open'));

  inp.addEventListener('input',()=>{
    autoH(inp);
    const len=inp.value.length,rem=CHAR_LIMIT-len;
    snd.disabled=len===0;
    cc.textContent=rem<=60?rem+' LEFT':'';
    cc.className='bqcc'+(rem<=20?' over':rem<=60?' warn':'');
    if(len){
      if(isG){if(!isGTyp)setGTyp(true);clearTimeout(gTypT);gTypT=setTimeout(()=>setGTyp(false),TYPING_TTL);}
      else{if(!isDmTyp)setDmTyp(true);clearTimeout(dmTypT);dmTypT=setTimeout(()=>setDmTyp(false),TYPING_TTL);}
    } else {if(isG)setGTyp(false);else setDmTyp(false);}
  });
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();}});
  snd.addEventListener('click',doSend);

  function doSend(){
    const txt=inp.value.trim();if(!txt)return;
    if(!uname){showModal(false);return;}
    if(isG) sendGlobal(txt); else sendDm(txt);
    inp.value='';inp.style.height='auto';snd.disabled=true;cc.textContent='';
    if(isG)setGTyp(false);else setDmTyp(false);
    if(isG)gAtBot=true;else dAtBot=true;
    if(msgs) requestAnimationFrame(()=>msgs.scrollTop=msgs.scrollHeight);
  }

  // Scroll tracking
  if(msgs&&scrB){
    msgs.addEventListener('scroll',()=>{
      const d=msgs.scrollHeight-msgs.scrollTop-msgs.clientHeight;
      const atB=d<60;if(isG)gAtBot=atB;else dAtBot=atB;
      scrB.classList.toggle('show',!atB&&d>100);
    },{passive:true});
    scrB.addEventListener('click',()=>{
      msgs.scrollTop=msgs.scrollHeight;
      if(isG)gAtBot=true;else dAtBot=true;scrB.classList.remove('show');
    });
  }
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
function init(){
  document.getElementById('bqb').addEventListener('click',togglePanel);

  // Name modal
  document.getElementById('bqnminp').addEventListener('input',e=>ckUN(e.target.value));
  document.getElementById('bqnminp').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submitName();}});
  document.getElementById('bqnmbtn').addEventListener('click',submitName);

  // Rename
  document.getElementById('bq-ren-btn').addEventListener('click',()=>showModal(true));

  // Sound
  const sndBtn=document.getElementById('bq-sound-btn');
  sndBtn.classList.toggle('on',soundOn);
  sndBtn.addEventListener('click',()=>{
    soundOn=!soundOn;localStorage.setItem(LS_SOUND,soundOn?'on':'off');
    sndBtn.classList.toggle('on',soundOn);toast(soundOn?'🔔 Sound on':'🔕 Sound off');
  });

  // Fullscreen
  document.getElementById('bq-fs-btn').addEventListener('click',toggleFS);

  // DM back - FIXED
  document.getElementById('bqdmback').addEventListener('click',()=>{
    setDmTyp(false);
    if(dmTypRef){dmTypRef.off();dmTypRef=null;}
    const prev=prevNonDmView||'dms';
    // Use bqNav for consistent navigation
    activeView='dmconv'; // Reset so bqNav doesn't return early
    bqNav(prev);
  });

  // DM header profile view
  document.getElementById('bqdmprof')?.addEventListener('click',e=>{
    e.stopPropagation();
    if(activeDmPuid&&activeDmPname) openProfileCard(activeDmPuid,activeDmPname,onlineU[activeDmPuid]);
  });

  // DM header avatar click
  document.getElementById('bqdmhav')?.addEventListener('click',e=>{
    e.stopPropagation();
    if(activeDmPuid&&activeDmPname) openProfileCard(activeDmPuid,activeDmPname,onlineU[activeDmPuid]);
  });

  // New DM → go to online
  document.getElementById('bqdmnewbtn').addEventListener('click',()=>bqNav('online'));

  // Profile card close — use stopPropagation so it doesn't bubble to the overlay
  document.getElementById('bqpc-close').addEventListener('click',e=>{e.stopPropagation();closeProfileCard();});
  // Click overlay backdrop to close (not the card itself)
  document.getElementById('bqpc').addEventListener('click',e=>{
    if(e.target===document.getElementById('bqpc')) closeProfileCard();
  });

  // Reply cancels
  document.getElementById('bqgrbx').addEventListener('click',()=>clearReply('g'));
  document.getElementById('bqdmrbx').addEventListener('click',()=>clearReply('dm'));

  // Profile panel
  document.getElementById('bqprofback').addEventListener('click',closeProfPanel);
  document.getElementById('bqpfsave').addEventListener('click',saveProfile);
  document.getElementById('bqpf-changename')?.addEventListener('click',()=>{closeProfPanel();showModal(true);});

  // Me avatar buttons → open profile panel
  ['bq-me-av','bq-me-av-dms','bq-me-av-dm','bq-me-av-online'].forEach(id=>{
    document.getElementById(id)?.addEventListener('click',e=>{
      e.stopPropagation();
      if(!uname){showModal(false);return;}
      if(profPanelOpen)closeProfPanel(); else openProfPanel();
    });
  });

  

  // DM delegation
  initDmDelegate();

  // Set up inputs
  setupInput('global');
  setupInput('dm');

  // Outside click — use mousedown to avoid race with inner clicks
  // Only fires if the click is genuinely outside the panel
  document.addEventListener('mousedown',e=>{
    if(!isOpen)return;
    if(isFull)return;
    const p=document.getElementById('bqp');
    const b=document.getElementById('bqb');
    if(!p.contains(e.target)&&!b.contains(e.target)) closePanel();
  });

  // Close emoji pickers + trays on any panel click
  document.getElementById('bqp').addEventListener('click',e=>{
    // Close emoji pickers
    document.querySelectorAll('.bqepick.open').forEach(el=>{if(!el.contains(e.target))el.classList.remove('open');});
    // Close emoji trays (not when clicking the tray button itself)
    document.querySelectorAll('.bqiet.open').forEach(t=>{
      const eo=t.closest('.bqiw')?.querySelector('.bqieo');
      if(!t.contains(e.target)&&!(eo&&eo.contains(e.target))) t.classList.remove('open');
    });
  });

  // Escape key to close overlays
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(profPanelOpen){closeProfPanel();return;}
      if(document.getElementById('bqpc').classList.contains('open')){closeProfileCard();return;}
      if(searchBarOpen){document.getElementById('bqsx')?.click();return;}
    }
  });

  // Cleanup
  window.addEventListener('beforeunload',()=>{
    if(db){
      db.ref('bq_presence/'+uid).remove();
      db.ref('bq_typing/'+uid).remove();
      if(activeDmId) db.ref('bq_dm_typing/'+activeDmId+'/'+uid).remove();
    }
  });

  // Boot Firebase if we already have a username
  if(uname) startDB();
  refreshMeAvatar();

  // Make sure initial view is visible
  document.getElementById('bqv-chat').classList.remove('bq-hidden');
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();

})();
