/**
 * BioQuiz Chat Widget v5
 * Drop-in: <script src="chat-widget.js"></script>
 * 
 * Features:
 * - Fixed navigation bugs (profile/customisation works properly)
 * - Push notifications for DMs and messages
 * - PWA installable
 * - Modern design with animations
 * - Removed sound (replaced with push notifications)
 *
 * DB paths:
 *   bq_messages/                 — global chat
 *   bq_dms/{dmId}/messages/      — DM messages
 *   bq_dms/{dmId}/meta           — conversation metadata
 *   bq_presence/{uid}            — online presence + status + activity + bio
 *   bq_typing/{uid}              — global typing
 *   bq_dm_typing/{dmId}/{uid}    — DM typing
 *   bq_usernames/{name}          — unique username registry
 *   bq_push_subs/{uid}           — push notification subscriptions
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
   FCM / PUSH CONFIG
   Replace the two values below with your own from Firebase Console:
   Firebase Console → Project Settings → Cloud Messaging
   → Web Push certificates → Key pair (Public key)
───────────────────────────────────────── */
const FCM_VAPID_KEY = 'BOApoUHNNHDA4Ooyu54alSD_jo2WIcexgXmX_nT2LQYjnweKZNqdmsTb2SqNTh-61atjHUMLjxTNt6nrTsI7-9I';

// Allow the host page to override by setting window.CHAT_VAPID_KEY before
// loading this script.  If no override is set, the constant above is used.
const _resolvedVapidKey = window.CHAT_VAPID_KEY || FCM_VAPID_KEY;

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const MAX_MSG      = 120;
const CHAR_LIMIT   = 320;
const TYPING_TTL   = 3000;
const PRESENCE_TTL = 9000;
const LS_UID   = 'bq_chat_uid';
const LS_NAME  = 'bq_chat_uname';
const LS_PROF  = 'bq_chat_profile';
const LS_PUSH  = 'bq_push_enabled';

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

const EMOJI_LIST = ['😊','😂','❤️','🔥','👍','🎉','😮','🧬','💯','🌍','👀','😢','✨','💪','🙌','😎'];
const REACTIONS  = ['👍','❤️','😂','😮','🔥','🎉'];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function uColor(n){ let h=0; for(let i=0;i<n.length;i++) h=(Math.imul(h,31)+n.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length]; }
function uInit(n){ return (n||'?').slice(0,2).toUpperCase(); }
function myInit(){ return myProfile.initials || uInit(uname||'?'); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function linkify(s){ return s.replace(/(https?:\/\/[^\s<>"']{4,})/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); }
function tsStr(ts){ return new Date(ts).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true}); }
function lastSeenStr(ts){
  if(!ts) return 'Never';
  const now=Date.now(),diff=now-ts;
  if(diff<60000) return 'Just now';
  if(diff<3600000) return Math.floor(diff/60000)+' min ago';
  if(diff<86400000) return Math.floor(diff/3600000)+' hr ago';
  if(diff<604800000) return Math.floor(diff/86400000)+' days ago';
  return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric'});
}
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── VARIABLES ── */
:root {
  --bq-bg: #0a0a0a;
  --bq-bg-elevated: #141414;
  --bq-bg-hover: rgba(255,255,255,.04);
  --bq-border: rgba(255,255,255,.08);
  --bq-border-hover: rgba(255,255,255,.15);
  --bq-text: #fff;
  --bq-text-muted: rgba(255,255,255,.5);
  --bq-text-subtle: rgba(255,255,255,.25);
  --bq-accent: #60a5fa;
  --bq-accent-glow: rgba(96,165,250,.25);
  --bq-success: #34d399;
  --bq-warning: #fbbf24;
  --bq-danger: #f87171;
  --bq-radius: 14px;
  --bq-radius-sm: 8px;
  --bq-transition: cubic-bezier(.16,1,.3,1);
}

/* ── BUBBLE ── */
#bqb{
  position:fixed;bottom:24px;right:24px;z-index:9900;
  width:56px;height:56px;border-radius:50%;
  background:#000;
  border:none;cursor:pointer;padding:0;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.1) inset;
  transition:transform .28s var(--bq-transition),box-shadow .25s;
  will-change:transform;
}
#bqb:hover{transform:scale(1.08);box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.15) inset;}
#bqb:active{transform:scale(.95);}
#bqb.open{background:var(--bq-bg-elevated);box-shadow:0 8px 32px rgba(0,0,0,.5);}
.bqi{position:absolute;transition:opacity .22s,transform .22s;}
.bqi-c{fill:#fff;}
#bqb.open .bqi-c{opacity:0;transform:scale(.6) rotate(-90deg);}
.bqi-x{opacity:0;fill:none;stroke:rgba(255,255,255,.8);stroke-width:2.5;stroke-linecap:round;transform:scale(.6) rotate(90deg);}
#bqb.open .bqi-x{opacity:1;transform:scale(1) rotate(0deg);}
#bqbadge{
  position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;
  background:var(--bq-danger);border:2px solid var(--bq-bg);
  font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 5px;
  animation:bqPop .3s var(--bq-transition) both;
}
#bqbadge.show{display:flex;}
@keyframes bqPop{from{transform:scale(0)}to{transform:scale(1)}}

/* ── PULSE ANIMATION (REMOVED) ── */

/* ── PANEL ── */
#bqp{
  position:fixed;bottom:94px;right:24px;z-index:9899;
  width:400px;height:600px;max-height:calc(100dvh - 108px);
  background:var(--bq-bg);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius);display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 32px 100px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.03) inset;
  transform-origin:bottom right;
  transform:scale(.9) translateY(16px);opacity:0;pointer-events:none;
  transition:transform .32s var(--bq-transition),opacity .26s ease,visibility 0s .32s;
  will-change:transform,opacity;
  visibility:hidden;
}
#bqp.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;visibility:visible;transition:transform .32s var(--bq-transition),opacity .26s ease,visibility 0s 0s;}

/* Glow effect */
#bqp::before{
  content:'';position:absolute;top:0;left:10%;width:80%;height:1px;pointer-events:none;
  background:linear-gradient(to right,transparent,rgba(96,165,250,.5),transparent);
}

/* Fullscreen mode */
#bqp.bq-fs{
  position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;
  width:100vw!important;height:100dvh!important;max-height:100dvh!important;
  border-radius:0!important;border:none!important;
  transform:none!important;opacity:1!important;pointer-events:all!important;
  z-index:99900!important;
}
body.bq-fs-mode #bqb{opacity:0!important;pointer-events:none!important;}

/* ── SCREEN + VIEW SYSTEM (APP-LIKE) ── */
#bqs{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;min-height:0;}
.bqv{
  position:absolute;inset:0;display:flex;flex-direction:column;
  background:var(--bq-bg);
  opacity:0;pointer-events:none;
  transition:opacity .2s ease,transform .28s var(--bq-transition);
  will-change:opacity,transform;
  transform:translateX(24px) scale(.98);
}
.bqv.bq-active{opacity:1;pointer-events:all;transform:translateX(0) scale(1);}
.bqv.bq-exit-left{transform:translateX(-24px) scale(.98);opacity:0;pointer-events:none;}

/* App-like haptic feedback */
@keyframes bqTap{0%{transform:scale(1)}50%{transform:scale(.97)}100%{transform:scale(1)}}
.bq-tap{animation:bqTap .15s ease;}

/* Smooth scroll */
.bqmsgs{scroll-behavior:smooth;}

/* Mobile touch feedback */
@media (hover:none){
  .bqnb:active{transform:scale(.95);background:var(--bq-bg-hover);}
  .bqact:active{transform:scale(.9);}
  .bqsnd:active{transform:scale(.9);}
  .bqdmr:active{background:var(--bq-bg-hover);}
  .bqurow:active{background:var(--bq-bg-hover);}
}

/* Pull to refresh indicator */
.bq-ptr{
  display:flex;align-items:center;justify-content:center;
  padding:12px;color:var(--bq-text-muted);
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;
  opacity:0;transition:opacity .2s;
}
.bq-ptr.show{opacity:1;}
.bq-ptr svg{width:16px;height:16px;margin-right:6px;animation:bqSpin 1s linear infinite;}

/* ── BOTTOM NAV ── */
#bqnav{
  display:flex;border-top:1px solid var(--bq-border);
  flex-shrink:0;background:var(--bq-bg-elevated);
  padding:4px;gap:4px;
}
.bqnb{
  flex:1;padding:10px 4px;background:none;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
  color:var(--bq-text-subtle);transition:all .2s;
  display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;
  border-radius:var(--bq-radius-sm);
}
.bqnb svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s;}
.bqnb:hover{color:var(--bq-text-muted);background:var(--bq-bg-hover);}
.bqnb:hover svg{transform:scale(1.1);}
.bqnb.active{color:var(--bq-accent);background:rgba(96,165,250,.08);}
.bqnb.active svg{stroke:var(--bq-accent);}
.bqnnb{
  position:absolute;top:4px;right:calc(50% - 20px);
  min-width:16px;height:16px;border-radius:8px;background:var(--bq-danger);
  font-family:'Inter',sans-serif;font-size:9px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 4px;
  border:2px solid var(--bq-bg-elevated);
}
.bqnnb.show{display:flex;}

/* ── HEADER ── */
.bqhdr{
  display:flex;align-items:center;gap:10px;
  padding:14px 16px;border-bottom:1px solid var(--bq-border);flex-shrink:0;
  background:var(--bq-bg-elevated);
}
.bqlive{
  width:8px;height:8px;border-radius:50%;
  background:var(--bq-success);
  box-shadow:0 0 12px var(--bq-success);
  flex-shrink:0;
  animation:bqLive 2s ease infinite;
}
@keyframes bqLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
.bqhtitle{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:.02em;color:var(--bq-text);flex:1;}
.bqhbtn{
  width:32px;height:32px;background:none;border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;
}
.bqhbtn:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);transform:scale(1.05);}
.bqhbtn:active{transform:scale(.95);}
.bqhbtn.on{border-color:var(--bq-accent);background:rgba(96,165,250,.1);}
.bqhbtn svg{width:14px;height:14px;stroke:var(--bq-text-muted);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
.bqhbtn.on svg{stroke:var(--bq-accent);}
.bqback{
  display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--bq-text-muted);padding:0;transition:color .2s;
}
.bqback:hover{color:var(--bq-text);}
.bqback svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}

/* ── MESSAGES ── */
.bqmsgs{flex:1;overflow-y:auto;padding:12px 14px 6px;display:flex;flex-direction:column;gap:2px;}
.bqmsgs::-webkit-scrollbar{width:4px;}
.bqmsgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqmsgs::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.15);}
.bqds{
  display:flex;align-items:center;gap:10px;margin:14px 0 10px;
  font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.1em;font-weight:600;color:var(--bq-text-subtle);text-transform:uppercase;
}
.bqds::before,.bqds::after{content:'';flex:1;height:1px;background:var(--bq-border);}
.bqsys{
  text-align:center;padding:6px 0;margin:4px 0;
  font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.04em;color:var(--bq-text-subtle);
  animation:bqUp .28s ease both;
}

/* Message row */
.bqr{display:flex;flex-direction:column;gap:2px;animation:bqUp .3s var(--bq-transition) both;padding:0 2px;}
@keyframes bqUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.bqr.mine{align-items:flex-end;}
.bqr.theirs{align-items:flex-start;}
.bqri{display:flex;align-items:flex-end;gap:8px;max-width:85%;}
.bqr.mine .bqri{flex-direction:row-reverse;}
.bqr.consec .bqri .bqav{visibility:hidden;}
.bqr.consec{margin-top:-2px;}

/* Avatar */
.bqav{
  width:28px;height:28px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:10px;font-weight:800;
  cursor:pointer;transition:transform .2s var(--bq-transition),box-shadow .2s;
  user-select:none;position:relative;
}
.bqav:hover{transform:scale(1.15);box-shadow:0 0 0 3px rgba(255,255,255,.15);}
.bqav:active{transform:scale(.95);}
/* Status ring */
.bqav::after{content:'';position:absolute;bottom:-1px;right:-1px;width:9px;height:9px;border-radius:50%;border:2px solid var(--bq-bg);display:none;}
.bqav[data-status="online"]::after{display:block;background:var(--bq-success);}
.bqav[data-status="studying"]::after{display:block;background:var(--bq-accent);}
.bqav[data-status="away"]::after{display:block;background:var(--bq-warning);}
.bqav[data-status="busy"]::after{display:block;background:var(--bq-danger);}

/* Column + meta */
.bqcol{display:flex;flex-direction:column;gap:3px;min-width:0;}
.bqmeta{display:flex;align-items:baseline;gap:6px;padding:0 3px;margin-bottom:2px;}
.bqr.consec .bqmeta{display:none;}
.bqun{font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:.01em;cursor:pointer;}
.bqun:hover{text-decoration:underline;}
.bqts{font-family:'Inter',sans-serif;font-size:10px;color:var(--bq-text-subtle);letter-spacing:.02em;}

/* Reply preview */
.bqrp{border-left:3px solid var(--bq-accent);padding:6px 10px;margin-bottom:6px;border-radius:0 var(--bq-radius-sm) var(--bq-radius-sm) 0;background:rgba(96,165,250,.1);}
.bqrp-n{font-family:'Inter',sans-serif;font-size:10px;font-weight:700;letter-spacing:.02em;color:var(--bq-accent);}
.bqrp-t{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;margin-top:2px;}
.bqr.mine .bqrp{background:rgba(0,0,0,.15);border-left-color:rgba(255,255,255,.3);}
.bqr.mine .bqrp-n{color:rgba(0,0,0,.6);}
.bqr.mine .bqrp-t{color:rgba(0,0,0,.5);}

/* Bubble */
.bqbbl{
  padding:10px 14px;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:500;line-height:1.5;letter-spacing:.01em;
  word-break:break-word;
}
.bqr.theirs .bqbbl{
  background:var(--bq-bg-elevated);
  border:1px solid var(--bq-border);
  border-radius:4px 16px 16px 16px;
  color:var(--bq-text);
}
.bqr.mine .bqbbl{
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  color:#fff;
  border-radius:16px 4px 16px 16px;
  box-shadow:0 4px 16px rgba(96,165,250,.3);
}
.bqbbl a{color:var(--bq-accent);text-decoration:underline;text-decoration-color:rgba(96,165,250,.4);}
.bqr.mine .bqbbl a{color:#fff;text-decoration-color:rgba(255,255,255,.4);}

/* Bubble hover actions */
.bqbw{position:relative;}
.bqacts{
  position:absolute;top:-38px;display:none;align-items:center;gap:3px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius-sm);padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:10;white-space:nowrap;
}
.bqr.mine .bqacts{right:0;}.bqr.theirs .bqacts{left:0;}
.bqbw:hover .bqacts{display:flex;}
.bqact{
  width:30px;height:30px;background:none;border:none;cursor:pointer;
  border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-size:14px;transition:all .15s;color:var(--bq-text-muted);
}
.bqact:hover{background:var(--bq-bg-hover);color:var(--bq-text);transform:scale(1.1);}
.bqact svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqact.del:hover{background:rgba(248,113,113,.12);color:var(--bq-danger);}
.bqepick{
  position:absolute;top:-48px;display:none;gap:2px;flex-wrap:wrap;width:180px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);padding:6px;
  box-shadow:0 12px 32px rgba(0,0,0,.6);z-index:15;
}
.bqr.mine .bqepick{right:0;}.bqr.theirs .bqepick{left:0;}
.bqepick.open{display:flex;}
.bqepbtn{width:30px;height:30px;background:none;border:none;cursor:pointer;border-radius:6px;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1;}
.bqepbtn:hover{background:var(--bq-bg-hover);transform:scale(1.2);}
.bqrxns{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;padding:0 3px;}
.bqrxn{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(255,255,255,.06);border:1px solid var(--bq-border);
  border-radius:20px;padding:3px 8px;cursor:pointer;font-size:13px;
  transition:all .18s;
}
.bqrxn:hover{background:rgba(255,255,255,.12);transform:scale(1.05);}
.bqrxn.mr{background:rgba(96,165,250,.15);border-color:rgba(96,165,250,.3);}
.bqrxn-n{font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:var(--bq-text-muted);}

/* ── IMAGE UPLOAD ── */
.bqimg-btn{width:32px;height:32px;background:none;border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
.bqimg-btn:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);}
.bqimg-btn svg{width:16px;height:16px;stroke:var(--bq-text-muted);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
.bqimg-btn.uploading{pointer-events:none;opacity:.6;}
.bqimg-btn.uploading svg{animation:bqSpin 1s linear infinite;}
@keyframes bqSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.bqimg-preview-bar{display:none;align-items:center;gap:10px;padding:10px 14px;background:rgba(96,165,250,.06);border-top:1px solid var(--bq-border);flex-shrink:0;}
.bqimg-preview-bar.show{display:flex;}
.bqimg-preview-thumb{width:48px;height:48px;border-radius:6px;object-fit:cover;border:1px solid var(--bq-border);}
.bqimg-preview-info{flex:1;font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);}
.bqimg-preview-remove{width:26px;height:26px;background:none;border:1px solid var(--bq-border);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;}
.bqimg-preview-remove:hover{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);}
.bqimg-preview-remove svg{width:12px;height:12px;stroke:var(--bq-text-muted);fill:none;stroke-width:2.5;stroke-linecap:round;}
/* Message image */
.bqmsg-img{display:block;max-width:220px;max-height:220px;border-radius:12px;margin-top:8px;cursor:pointer;transition:transform .2s,box-shadow .2s;border:1px solid var(--bq-border);box-shadow:0 2px 8px rgba(0,0,0,.2);}
.bqmsg-img:hover{transform:scale(1.03);box-shadow:0 4px 16px rgba(0,0,0,.3);}
.bqmsg-imgwrap{margin-top:6px;position:relative;display:inline-block;}

/* ── READ RECEIPTS ── */
.bqread{display:inline-flex;align-items:center;margin-left:8px;vertical-align:middle;}
.bqread svg{width:16px;height:12px;stroke:var(--bq-text-subtle);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
.bqread.read svg{stroke:var(--bq-accent);}
.bqread-time{font-family:'Inter',sans-serif;font-size:9px;color:var(--bq-text-subtle);margin-left:4px;}

/* ── LAST SEEN ── */
.bqls{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);margin-top:4px;}
.bqls.bqls-online{color:var(--bq-success);}

/* ── REPLY BAR ── */
.bqrbar{display:none;align-items:center;gap:10px;padding:10px 14px;background:rgba(96,165,250,.06);border-top:1px solid var(--bq-border);flex-shrink:0;}
.bqrbar.show{display:flex;}
.bqrbic{width:16px;height:16px;stroke:var(--bq-accent);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bqrbb{flex:1;min-width:0;}
.bqrbn{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:.02em;color:var(--bq-accent);}
.bqrbt{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;}
.bqrbx{width:26px;height:26px;background:none;border:1px solid var(--bq-border);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s;}
.bqrbx:hover{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);}
.bqrbx svg{width:11px;height:11px;stroke:var(--bq-text-muted);fill:none;stroke-width:2.5;stroke-linecap:round;}

/* ── TYPING ── */
.bqtyp{min-height:22px;padding:0 16px 8px;flex-shrink:0;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.02em;color:var(--bq-text-subtle);display:flex;align-items:center;gap:8px;}
.bqtd{display:flex;gap:3px;align-items:center;}
.bqtd span{width:4px;height:4px;background:var(--bq-accent);border-radius:50%;animation:bqTd 1.2s ease infinite;}
.bqtd span:nth-child(2){animation-delay:.2s;}.bqtd span:nth-child(3){animation-delay:.4s;}
@keyframes bqTd{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-5px);opacity:1}}

/* ── INPUT ── */
.bqiw{border-top:1px solid var(--bq-border);padding:12px 14px;flex-shrink:0;background:var(--bq-bg-elevated);}
.bqiet{display:none;flex-wrap:wrap;gap:2px;padding:8px;margin-bottom:10px;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);}
.bqiet.open{display:flex;}
.bqietb{width:32px;height:32px;background:none;border:none;cursor:pointer;border-radius:6px;font-size:17px;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1;}
.bqietb:hover{background:var(--bq-bg-hover);transform:scale(1.15);}
.bqirow{display:flex;gap:8px;align-items:flex-end;}
.bqieo{width:38px;height:38px;background:none;border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;transition:all .2s;line-height:1;}
.bqieo:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);transform:scale(1.05);}
.bqinp{
  flex:1;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);
  padding:10px 14px;color:var(--bq-text);font-family:'Inter',sans-serif;font-size:14px;font-weight:500;
  letter-spacing:.01em;resize:none;outline:none;min-height:40px;max-height:96px;line-height:1.5;
  transition:border-color .2s,background .2s,box-shadow .2s;scrollbar-width:none;
}
.bqinp::-webkit-scrollbar{display:none;}
.bqinp::placeholder{color:var(--bq-text-subtle);}
.bqinp:focus{border-color:var(--bq-accent);background:var(--bq-bg);box-shadow:0 0 0 3px var(--bq-accent-glow);}
.bqsnd{
  width:40px;height:40px;
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  border:none;border-radius:var(--bq-radius-sm);cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:all .22s var(--bq-transition);
  box-shadow:0 4px 12px rgba(96,165,250,.3);
}
.bqsnd:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(96,165,250,.45);}
.bqsnd:active{transform:scale(.95);}
.bqsnd:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none;}
.bqsnd svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
.bqifooter{display:flex;align-items:center;justify-content:space-between;margin-top:8px;}
.bqcc{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.04em;color:var(--bq-text-subtle);transition:color .2s;}
.bqcc.warn{color:var(--bq-warning);}.bqcc.over{color:var(--bq-danger);}
.bqih{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.02em;color:var(--bq-text-subtle);opacity:.6;}

/* ── SCROLL BTN ── */
.bqscr{position:absolute;bottom:110px;right:16px;z-index:6;width:34px;height:34px;background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:50%;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.5);transition:all .2s;}
.bqscr.show{display:flex;animation:bqUp .2s ease both;}
.bqscr:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);}
.bqscr svg{width:16px;height:16px;stroke:var(--bq-text-muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}

/* ── EMPTY ── */
.bqempty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding-bottom:24px;animation:bqUp .4s ease both;}
.bqempty-ic{
  width:56px;height:56px;border-radius:16px;
  background:linear-gradient(135deg,rgba(96,165,250,.15),rgba(129,140,248,.15));
  border:1px solid rgba(96,165,250,.2);
  display:flex;align-items:center;justify-content:center;
}
.bqempty-ic svg{width:24px;height:24px;stroke:var(--bq-accent);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
.bqempty-tx{font-family:'Inter',sans-serif;font-size:13px;font-weight:600;letter-spacing:.1em;color:var(--bq-text-subtle);text-transform:uppercase;}
.bqempty-sub{font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.04em;color:var(--bq-text-subtle);opacity:.7;}

/* ── PROFILE CARD OVERLAY ── */
#bqpc{
  position:absolute;inset:0;z-index:40;
  background:rgba(0,0,0,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;padding:24px;
  border-radius:var(--bq-radius);
  opacity:0;pointer-events:none;
  transition:opacity .25s ease;
}
#bqpc.open{opacity:1;pointer-events:all;}
.bqpc-card{
  width:100%;max-width:300px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:var(--bq-radius);overflow:hidden;
  box-shadow:0 24px 72px rgba(0,0,0,.7);
  transform:scale(.92) translateY(16px);
  transition:transform .3s var(--bq-transition);
}
#bqpc.open .bqpc-card{transform:scale(1) translateY(0);}
.bqpc-banner{height:64px;position:relative;flex-shrink:0;}
.bqpc-av{
  position:absolute;bottom:-24px;left:18px;
  width:56px;height:56px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:18px;font-weight:800;
  border:4px solid var(--bq-bg-elevated);box-shadow:0 6px 20px rgba(0,0,0,.4);
}
.bqpc-close{
  position:absolute;top:10px;right:12px;
  width:28px;height:28px;background:rgba(0,0,0,.5);border:none;border-radius:50%;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.bqpc-close:hover{background:rgba(0,0,0,.7);transform:scale(1.1);}
.bqpc-close svg{width:13px;height:13px;stroke:rgba(255,255,255,.8);fill:none;stroke-width:2.5;stroke-linecap:round;}
.bqpc-body{padding:32px 18px 18px;}
.bqpc-name{font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:.02em;color:var(--bq-text);margin-bottom:6px;}
.bqpc-status{display:flex;align-items:center;gap:6px;margin-bottom:10px;}
.bqpc-sdot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.bqpc-slabel{font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.04em;font-weight:600;}
.bqpc-activity{
  font-family:'Inter',sans-serif;font-size:13px;letter-spacing:.02em;
  color:var(--bq-text-muted);margin-bottom:12px;
  display:flex;align-items:center;gap:6px;
}
.bqpc-activity::before{content:'';width:4px;height:4px;border-radius:50%;background:var(--bq-text-subtle);flex-shrink:0;}
.bqpc-bio{
  font-family:'Inter',sans-serif;font-size:13px;line-height:1.6;
  color:var(--bq-text-muted);padding:10px 12px;
  background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);
  margin-bottom:14px;word-break:break-word;
}
.bqpc-actions{display:flex;gap:8px;}
.bqpc-btn{
  flex:1;padding:10px;border-radius:var(--bq-radius-sm);border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;
  display:flex;align-items:center;justify-content:center;gap:6px;
  transition:all .2s var(--bq-transition);
}
.bqpc-btn:hover{transform:translateY(-2px);}
.bqpc-btn:active{transform:scale(.96);}
.bqpc-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqpc-btn.dm{background:linear-gradient(135deg,var(--bq-accent),#818cf8);color:#fff;box-shadow:0 4px 12px rgba(96,165,250,.3);}
.bqpc-btn.dm:hover{box-shadow:0 6px 20px rgba(96,165,250,.45);}
.bqpc-btn.edit{background:var(--bq-bg);color:var(--bq-text-muted);border:1px solid var(--bq-border);}
.bqpc-btn.edit:hover{background:var(--bq-bg-hover);color:var(--bq-text);}

/* ── DM LIST ── */
#bqdml{flex:1;overflow-y:auto;padding:6px 0;}
#bqdml::-webkit-scrollbar{width:4px;}
#bqdml::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqdmr{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:all .18s;position:relative;}
.bqdmr:hover{background:var(--bq-bg-hover);}
.bqdmav{width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:13px;font-weight:800;position:relative;}
.bqdmav::after{content:'';position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#444;border:2px solid var(--bq-bg);transition:background .3s;}
.bqdmav.online::after{background:var(--bq-success);}
.bqdmav.studying::after{background:var(--bq-accent);}
.bqdmav.away::after{background:var(--bq-warning);}
.bqdmav.busy::after{background:var(--bq-danger);}
.bqdmin{flex:1;min-width:0;}
.bqdmn{font-family:'Inter',sans-serif;font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--bq-text);}
.bqdmp{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-subtle);letter-spacing:.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px;}
.bqdmp.unr{color:var(--bq-text-muted);font-weight:600;}
.bqdmm{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0;}
.bqdmt{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.02em;color:var(--bq-text-subtle);}
.bqdmub{min-width:20px;height:20px;border-radius:10px;background:var(--bq-danger);font-family:'Inter',sans-serif;font-size:10px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 6px;animation:bqPop .25s var(--bq-transition) both;}
.bqdmdiv{height:1px;background:var(--bq-border);margin:0 16px;}

/* DM header */
.bqdmhav{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:11px;font-weight:800;position:relative;cursor:pointer;transition:transform .2s;}
.bqdmhav:hover{transform:scale(1.1);}
.bqdmhav::after{content:'';position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:#555;border:2px solid var(--bq-bg-elevated);transition:background .3s;}
.bqdmhav.online::after,.bqdmhav[data-status="online"]::after{background:var(--bq-success);}
.bqdmhav[data-status="studying"]::after{background:var(--bq-accent);}
.bqdmhav[data-status="away"]::after{background:var(--bq-warning);}
.bqdmhav[data-status="busy"]::after{background:var(--bq-danger);}
.bqdmhi{flex:1;}
.bqdmhn{font-family:'Inter',sans-serif;font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--bq-text);}
.bqdmhs{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.02em;color:var(--bq-text-subtle);margin-top:2px;}

/* ── ONLINE LIST ── */
#bqol{flex:1;overflow-y:auto;padding:6px 0;}
#bqol::-webkit-scrollbar{width:4px;}
#bqol::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqurow{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background .18s;}
.bqurow:hover{background:var(--bq-bg-hover);}
.bqurow.isme{cursor:default;}
.bqurow:hover:not(.isme) .bqudmh{opacity:1;}
.bquav{width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:12px;font-weight:800;position:relative;}
.bquav::after{content:'';position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;border:2px solid var(--bq-bg);}
.bquav[data-status="online"]::after{background:var(--bq-success);}
.bquav[data-status="studying"]::after{background:var(--bq-accent);}
.bquav[data-status="away"]::after{background:var(--bq-warning);}
.bquav[data-status="busy"]::after{background:var(--bq-danger);}
.bquinfo{flex:1;min-width:0;}
.bquu{font-family:'Inter',sans-serif;font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--bq-text);display:flex;align-items:center;gap:6px;}
.bquyou{font-size:9px;letter-spacing:.06em;color:var(--bq-accent);background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.2);padding:2px 6px;border-radius:4px;font-weight:700;}
.bqust{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.02em;color:var(--bq-text-subtle);margin-top:2px;}
.bquact{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.01em;color:var(--bq-text-subtle);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bqudmh{opacity:0;transition:opacity .2s;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.04em;color:var(--bq-accent);background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.2);padding:4px 10px;border-radius:4px;flex-shrink:0;white-space:nowrap;font-weight:600;}

/* ── NAME MODAL (APP-LIKE) ── */
#bqnm{
  position:absolute;inset:0;z-index:30;
  background:rgba(0,0,0,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;padding:24px;border-radius:var(--bq-radius);
  animation:bqFade .2s ease both;
  }
  @keyframes bqFade{from{opacity:0}to{opacity:1}}
  .bqnmb{
    width:100%;max-width:300px;text-align:center;
    background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
    border-radius:var(--bq-radius);padding:28px 24px;
    animation:bqSlideUp .3s var(--bq-transition) both;
    box-shadow:0 24px 80px rgba(0,0,0,.6);
  }
  @keyframes bqSlideUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.bqnmav{
  width:64px;height:64px;border-radius:50%;margin:0 auto 20px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:20px;font-weight:800;
  background:linear-gradient(135deg,rgba(96,165,250,.2),rgba(129,140,248,.2));
  border:2px solid rgba(96,165,250,.3);
  transition:all .3s;
}
.bqnmtit{font-family:'Inter',sans-serif;font-size:20px;font-weight:800;letter-spacing:.02em;color:var(--bq-text);margin-bottom:6px;}
.bqnmsub{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.1em;color:var(--bq-text-subtle);margin-bottom:20px;text-transform:uppercase;}
.bqnmf{position:relative;margin-bottom:10px;}
.bqnmat{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:var(--bq-text-subtle);pointer-events:none;user-select:none;}
.bqnmi{width:100%;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);padding:14px 16px 14px 30px;color:var(--bq-text);font-family:'Inter',sans-serif;font-size:15px;font-weight:600;letter-spacing:.02em;outline:none;transition:all .2s;}
.bqnmi::placeholder{color:var(--bq-text-subtle);}.bqnmi:focus{border-color:var(--bq-accent);box-shadow:0 0 0 3px var(--bq-accent-glow);}
.bqnmi.chk{border-color:rgba(251,191,36,.4);}.bqnmi.tkn{border-color:rgba(248,113,113,.5);}.bqnmi.ok{border-color:rgba(52,211,153,.5);}
.bqnmst{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.04em;min-height:20px;margin-bottom:14px;transition:color .2s;}
.bqnmst.chk{color:rgba(251,191,36,.8);}.bqnmst.tkn{color:var(--bq-danger);}.bqnmst.ok{color:var(--bq-success);}
.bqnmbtn{
  width:100%;padding:14px;
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  color:#fff;border:none;border-radius:var(--bq-radius-sm);
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:.08em;
  cursor:pointer;transition:all .2s;
  box-shadow:0 4px 16px rgba(96,165,250,.3);
}
.bqnmbtn:hover:not(:disabled){opacity:.9;transform:translateY(-1px);box-shadow:0 6px 20px rgba(96,165,250,.4);}
.bqnmbtn:active:not(:disabled){transform:scale(.98);}
.bqnmbtn:disabled{opacity:.3;cursor:not-allowed;}

/* ── PROFILE SETTINGS VIEW ── */
.bqpf-section{padding:16px;border-bottom:1px solid var(--bq-border);}
.bqpf-label{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.12em;color:var(--bq-text-subtle);margin-bottom:12px;text-transform:uppercase;font-weight:600;}
.bqpf-avrow{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
.bqpf-av{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:18px;font-weight:800;flex-shrink:0;cursor:pointer;transition:transform .2s;border:3px solid rgba(255,255,255,.1);}
.bqpf-av:hover{transform:scale(1.05);}
.bqpf-av-info{flex:1;}
.bqpf-uname{font-family:'Inter',sans-serif;font-size:16px;font-weight:700;letter-spacing:.02em;color:var(--bq-text);}
.bqpf-change{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.04em;color:var(--bq-accent);margin-top:4px;cursor:pointer;font-weight:600;}
.bqpf-change:hover{text-decoration:underline;}
.bqpf-colors{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
.bqpf-col{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .2s;flex-shrink:0;}
.bqpf-col:hover{transform:scale(1.15);}
.bqpf-col.sel{border-color:#fff;transform:scale(1.1);box-shadow:0 0 0 2px rgba(255,255,255,.2);}
.bqpf-inp{width:100%;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);padding:12px 14px;color:var(--bq-text);font-family:'Inter',sans-serif;font-size:14px;font-weight:500;outline:none;transition:all .2s;margin-bottom:16px;}
.bqpf-inp::placeholder{color:var(--bq-text-subtle);}.bqpf-inp:focus{border-color:var(--bq-accent);box-shadow:0 0 0 3px var(--bq-accent-glow);}
.bqpf-textarea{width:100%;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);padding:12px 14px;color:var(--bq-text);font-family:'Inter',sans-serif;font-size:14px;font-weight:500;outline:none;resize:none;min-height:70px;line-height:1.5;transition:all .2s;margin-bottom:16px;scrollbar-width:none;}
.bqpf-textarea::placeholder{color:var(--bq-text-subtle);}.bqpf-textarea:focus{border-color:var(--bq-accent);box-shadow:0 0 0 3px var(--bq-accent-glow);}
.bqpf-statuses{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
.bqpf-st{
  display:flex;align-items:center;gap:8px;padding:10px 12px;
  border-radius:var(--bq-radius-sm);cursor:pointer;border:1px solid var(--bq-border);
  background:var(--bq-bg);transition:all .18s;
}
.bqpf-st:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);}
.bqpf-st.sel{border-color:var(--bq-accent);background:rgba(96,165,250,.08);}
.bqpf-st-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.bqpf-st-lbl{font-family:'Inter',sans-serif;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--bq-text-muted);}
.bqpf-savebtn{
  margin:0 16px 16px;width:calc(100% - 32px);padding:14px;
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  color:#fff;border:none;border-radius:var(--bq-radius-sm);
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:.06em;
  cursor:pointer;transition:all .2s;
  box-shadow:0 4px 16px rgba(96,165,250,.3);
}
.bqpf-savebtn:hover{opacity:.9;transform:translateY(-1px);}
.bqpf-savemsg{text-align:center;font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.04em;color:var(--bq-success);height:20px;transition:opacity .3s;}
.bqpf-scroll{flex:1;overflow-y:auto;padding-top:6px;}
.bqpf-scroll::-webkit-scrollbar{width:4px;}
.bqpf-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}

/* ── PUSH NOTIFICATION SECTION ── */
.bqpf-push{
  display:flex;flex-direction:column;gap:12px;
  padding:14px;background:linear-gradient(135deg,rgba(96,165,250,.08),rgba(129,140,248,.08));
  border:1px solid rgba(96,165,250,.15);border-radius:var(--bq-radius-sm);
  margin-bottom:16px;
}
.bqpf-push-title{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:var(--bq-text);display:flex;align-items:center;gap:8px;}
.bqpf-push-title svg{width:18px;height:18px;stroke:var(--bq-accent);fill:none;stroke-width:2;}
.bqpf-push-desc{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);line-height:1.5;}
.bqpf-push-btn{
  padding:10px 16px;
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  color:#fff;border:none;border-radius:var(--bq-radius-sm);
  font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;
  cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:8px;
}
.bqpf-push-btn:hover{opacity:.9;transform:translateY(-1px);}
.bqpf-push-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.bqpf-push-btn.subscribed{background:var(--bq-success);cursor:default;}
.bqpf-push-status{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);text-align:center;}

/* ── PROFILE CUSTOMIZATION ── */
.bqpf-initials-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.bqpf-initials-inp{
  width:60px;height:60px;border-radius:50%;text-align:center;
  background:var(--bq-bg);border:2px solid var(--bq-border);
  font-family:'Inter',sans-serif;font-size:20px;font-weight:800;
  color:var(--bq-text);outline:none;text-transform:uppercase;
  transition:all .2s;
}
.bqpf-initials-inp:focus{border-color:var(--bq-accent);box-shadow:0 0 0 3px var(--bq-accent-glow);}
.bqpf-initials-hint{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);line-height:1.4;}
.bqpf-banner-row{display:flex;gap:8px;margin-bottom:16px;}
.bqpf-banner-preview{
  flex:1;height:48px;border-radius:var(--bq-radius-sm);
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(0,0,0,.6);
  transition:all .2s;
}
.bqpf-theme-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.bqpf-theme{
  padding:12px 10px;border-radius:var(--bq-radius-sm);border:1px solid var(--bq-border);
  background:var(--bq-bg);cursor:pointer;text-align:center;transition:all .2s;
}
.bqpf-theme:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);}
.bqpf-theme.sel{border-color:var(--bq-accent);background:rgba(96,165,250,.08);}
.bqpf-theme-icon{font-size:20px;margin-bottom:4px;}
.bqpf-theme-lbl{font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:.04em;color:var(--bq-text-muted);text-transform:uppercase;}
.bqpf-fontsize-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.bqpf-fontsize{
  padding:10px 8px;border-radius:var(--bq-radius-sm);border:1px solid var(--bq-border);
  background:var(--bq-bg);cursor:pointer;text-align:center;transition:all .2s;
}
.bqpf-fontsize:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);}
.bqpf-fontsize.sel{border-color:var(--bq-accent);background:rgba(96,165,250,.08);}
.bqpf-fontsize-sample{font-family:'Inter',sans-serif;font-weight:600;color:var(--bq-text);margin-bottom:2px;}
.bqpf-fontsize-lbl{font-family:'Inter',sans-serif;font-size:9px;font-weight:600;letter-spacing:.04em;color:var(--bq-text-muted);text-transform:uppercase;}
.bqpf-divider{height:1px;background:var(--bq-border);margin:8px 0 16px;}

/* Font size modifiers */
#bqp.bq-font-sm .bqbbl{font-size:12px!important;}
#bqp.bq-font-sm .bqun{font-size:10px!important;}
#bqp.bq-font-lg .bqbbl{font-size:16px!important;}
#bqp.bq-font-lg .bqun{font-size:13px!important;}
#bqp.bq-font-lg .bqinp{font-size:16px!important;}

/* ── DISAPPEARING MESSAGES ── */
.bqbbl.disappearing{position:relative;}
.bqbbl.disappearing::after{
  content:'';position:absolute;bottom:4px;right:4px;
  width:12px;height:12px;border-radius:50%;
  background:conic-gradient(var(--bq-accent) var(--progress,0%),transparent var(--progress,0%));
  opacity:.6;
}
.bq-timer-badge{
  display:inline-flex;align-items:center;gap:4px;
  font-family:'Inter',sans-serif;font-size:9px;font-weight:600;
  color:var(--bq-text-subtle);margin-left:6px;
}
.bq-timer-badge svg{width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:2;}

/* ── CONFIRMATION MODAL ── */
.bq-confirm{
  position:absolute;inset:0;z-index:250;
  background:rgba(0,0,0,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;padding:24px;
  opacity:0;pointer-events:none;transition:opacity .2s;
}
.bq-confirm.open{opacity:1;pointer-events:all;}
.bq-confirm-box{
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius);padding:24px;width:100%;max-width:300px;text-align:center;
  animation:bqSlideUp .3s var(--bq-transition) both;
}
.bq-confirm-icon{
  width:48px;height:48px;margin:0 auto 16px;border-radius:50%;
  background:rgba(239,68,68,.15);display:flex;align-items:center;justify-content:center;
}
.bq-confirm-icon svg{width:24px;height:24px;stroke:#ef4444;fill:none;stroke-width:2;}
.bq-confirm-title{font-family:'Inter',sans-serif;font-size:16px;font-weight:700;color:var(--bq-text);margin-bottom:8px;}
.bq-confirm-desc{font-family:'Inter',sans-serif;font-size:13px;color:var(--bq-text-muted);margin-bottom:20px;line-height:1.5;}
.bq-confirm-btns{display:flex;gap:10px;}
.bq-confirm-btn{
  flex:1;padding:12px 16px;border-radius:var(--bq-radius-sm);border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:600;transition:all .15s;
}
.bq-confirm-btn.cancel{background:var(--bq-bg-hover);color:var(--bq-text-muted);border:1px solid var(--bq-border);}
.bq-confirm-btn.cancel:hover{background:var(--bq-bg-elevated);}
.bq-confirm-btn.danger{background:#ef4444;color:#fff;}
.bq-confirm-btn.danger:hover{background:#dc2626;}

/* ── NEW CHAT BUBBLE THEME (GRADIENT) ── */
.bqbbl{
  background:linear-gradient(135deg,rgba(30,30,35,1) 0%,rgba(40,40,50,1) 100%)!important;
  border:1px solid rgba(255,255,255,.06)!important;
  box-shadow:0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.03)!important;
}
.bqr.me .bqbbl{
  background:linear-gradient(135deg,var(--bq-accent) 0%,#3b82f6 100%)!important;
  border:1px solid rgba(255,255,255,.1)!important;
  box-shadow:0 2px 12px rgba(96,165,250,.25),inset 0 1px 0 rgba(255,255,255,.15)!important;
}

/* ── SETTINGS MENU IN HEADER ── */
.bqhdr-menu{position:relative;}
.bqhdr-menu-btn{
  width:32px;height:32px;border-radius:50%;border:none;
  background:var(--bq-bg-hover);cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .15s;
}
.bqhdr-menu-btn:hover{background:var(--bq-bg-elevated);}
.bqhdr-menu-btn svg{width:16px;height:16px;stroke:var(--bq-text-muted);fill:none;stroke-width:2;}
.bqhdr-dropdown{
  position:absolute;top:100%;right:0;margin-top:8px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius-sm);padding:6px 0;min-width:180px;
  opacity:0;pointer-events:none;transform:translateY(-8px) scale(.95);
  transition:all .15s;z-index:100;box-shadow:0 12px 40px rgba(0,0,0,.5);
}
.bqhdr-dropdown.open{opacity:1;pointer-events:all;transform:translateY(0) scale(1);}
.bqhdr-dropdown-item{
  display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:500;color:var(--bq-text);
  transition:background .1s;
}
.bqhdr-dropdown-item:hover{background:var(--bq-bg-hover);}
.bqhdr-dropdown-item.danger{color:#ef4444;}
.bqhdr-dropdown-item svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
.bqhdr-dropdown-divider{height:1px;background:var(--bq-border);margin:6px 0;}

/* ── TOAST ── */
#bqtoast{
  position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(10px);
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius-sm);padding:10px 18px;z-index:9999;opacity:0;
  font-family:'Inter',sans-serif;font-size:13px;letter-spacing:.02em;color:var(--bq-text);font-weight:500;
  white-space:nowrap;pointer-events:none;transition:all .25s var(--bq-transition);
  box-shadow:0 8px 32px rgba(0,0,0,.5);
}
#bqtoast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* ── LAST SEEN ── */
.bqls{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.02em;color:var(--bq-text-subtle);margin-top:2px;}
.bqls-online{color:var(--bq-success);}

/* ── MESSAGE EDITING ── */
.bqbbl.editing{background:rgba(96,165,250,.15)!important;border:1px dashed var(--bq-accent)!important;}
.bqedit-inp{
  width:100%;background:transparent;border:none;color:var(--bq-text);
  font-family:'Inter',sans-serif;font-size:14px;font-weight:500;line-height:1.5;
  outline:none;resize:none;min-height:20px;max-height:80px;
}
.bqedit-btns{display:flex;gap:6px;margin-top:8px;justify-content:flex-end;}
.bqedit-btn{
  padding:4px 10px;border-radius:4px;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:.02em;
  transition:all .15s;
}
.bqedit-btn.save{background:var(--bq-accent);color:#fff;}
.bqedit-btn.save:hover{opacity:.9;}
.bqedit-btn.cancel{background:var(--bq-bg-hover);color:var(--bq-text-muted);border:1px solid var(--bq-border);}
.bqedit-btn.cancel:hover{background:var(--bq-bg-elevated);}
.bqedited{font-family:'Inter',sans-serif;font-size:10px;color:var(--bq-text-subtle);margin-left:6px;font-style:italic;}

/* ── IMAGE MESSAGES ── */
.bqimg{max-width:200px;max-height:200px;border-radius:var(--bq-radius-sm);cursor:pointer;transition:transform .2s;}
.bqimg:hover{transform:scale(1.02);}
.bqimg-preview{
  position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.95);
  display:flex;align-items:center;justify-content:center;padding:24px;
  opacity:0;pointer-events:none;transition:opacity .25s;
}
.bqimg-preview.open{opacity:1;pointer-events:all;}
.bqimg-preview img{max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--bq-radius);}
.bqimg-close{
  position:absolute;top:16px;right:16px;width:40px;height:40px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:50%;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.bqimg-close:hover{background:var(--bq-bg-hover);transform:scale(1.1);}
.bqimg-close svg{width:18px;height:18px;stroke:var(--bq-text);fill:none;stroke-width:2;}

/* ── MESSAGE READ RECEIPTS (see above) ── */

/* ── SPINNER ── */
@keyframes bqSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.bqspinner{animation:bqSpin 1s linear infinite;}

/* ── MY AVATAR BUTTON ── */
.bq-me-av{
  width:30px;height:30px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:10px;font-weight:800;
  cursor:pointer;border:2px solid rgba(255,255,255,.15);
  transition:all .24s var(--bq-transition);
  user-select:none;
}
.bq-me-av:hover{transform:scale(1.12);border-color:var(--bq-accent);box-shadow:0 0 0 3px var(--bq-accent-glow);}
.bq-me-av:active{transform:scale(.92);}

/* ── DM LIST ACTIONS ── */
.bqdmr{overflow:hidden;position:relative;}
.bqdmr-acts{
  position:absolute;right:12px;top:50%;transform:translateY(-50%);
  display:flex;gap:4px;opacity:0;transition:opacity .18s;pointer-events:none;
}
.bqdmr:hover .bqdmr-acts{opacity:1;pointer-events:all;}
.bqdmr-act{
  width:28px;height:28px;border-radius:6px;border:1px solid var(--bq-border);cursor:pointer;
  display:flex;align-items:center;justify-content:center;background:var(--bq-bg-elevated);
  transition:all .18s;
}
.bqdmr-act svg{width:12px;height:12px;fill:none;stroke:var(--bq-text-muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqdmr-act.bq-pin:hover,.bqdmr-act.bq-pin.pinned svg{stroke:var(--bq-accent);}
.bqdmr-act.bq-pin:hover{background:rgba(96,165,250,.12);border-color:rgba(96,165,250,.25);}
.bqdmr-act.bq-del:hover{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.25);}
.bqdmr-act.bq-del:hover svg{stroke:var(--bq-danger);}
.bqdmr-confirm{
  position:absolute;inset:0;background:rgba(8,8,8,.97);
  display:none;align-items:center;gap:10px;padding:0 16px;
}
.bqdmr-confirm.show{display:flex;}
.bqdmr-confirm-msg{font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.02em;color:var(--bq-text-muted);flex:1;}
.bqdmr-cyes{padding:6px 12px;background:var(--bq-danger);border:none;border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:#fff;transition:all .18s;}
.bqdmr-cyes:hover{background:#ef4444;}
.bqdmr-cno{padding:6px 12px;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:var(--bq-text-muted);transition:all .18s;}
.bqdm-pin{font-size:11px;opacity:.6;margin-right:4px;}

/* ── ALIAS INPUT ── */
.bqpc-aliasw{margin-bottom:14px;}
.bqpc-aliaslbl{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.1em;color:var(--bq-text-subtle);margin-bottom:6px;text-transform:uppercase;}
.bqpc-aliasinp{width:100%;box-sizing:border-box;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:var(--bq-radius-sm);padding:10px 12px;color:var(--bq-text);font-family:'Inter',sans-serif;font-size:14px;font-weight:500;outline:none;transition:all .2s;}
.bqpc-aliasinp::placeholder{color:var(--bq-text-subtle);}
.bqpc-aliasinp:focus{border-color:var(--bq-accent);box-shadow:0 0 0 3px var(--bq-accent-glow);}

/* ── MOBILE ── */
@media(max-width:480px){
  #bqp{right:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:none;transform-origin:bottom center;}
  #bqb{bottom:16px;right:16px;}
}
`;

/* ─────────────────────────────────────────
   HTML
───────────────────────────────────────── */
const HTML = `
<button id="bqb" aria-label="Chat">
  <svg viewBox="0 0 24 24" class="bqi bqi-c" width="24" height="24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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
        <div class="bqls" id="bqpc-lastseen"></div>
        <div class="bqpc-activity" id="bqpc-activity" style="display:none"></div>
        <div class="bqpc-bio" id="bqpc-bio" style="display:none"></div>
        <div class="bqpc-aliasw" id="bqpc-aliasw" style="display:none">
          <div class="bqpc-aliaslbl">ALIAS (only you see this)</div>
          <input id="bqpc-aliasinp" class="bqpc-aliasinp" type="text" placeholder="Set a nickname..." maxlength="24" autocomplete="off" autocapitalize="off" autocorrect="off">
        </div>
        <div class="bqpc-actions" id="bqpc-actions"></div>
      </div>
    </div>
  </div>

  <!-- Name modal -->
  <div id="bqnm" style="display:none">
    <div class="bqnmb">
      <div class="bqnmav" id="bqnmav">?</div>
      <div class="bqnmtit">Pick a Username</div>
      <div class="bqnmsub">Unique · Shown as @username</div>
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
<div class="bqv bq-active" id="bqv-chat">
  <div class="bqhdr">
  <div class="bqlive"></div>
  <div class="bqhtitle">Global Chat</div>
  <div class="bqhdr-menu">
    <button class="bqhdr-menu-btn" id="bq-chat-menu-btn" title="Options">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
    </button>
    <div class="bqhdr-dropdown" id="bq-chat-menu">
      <div class="bqhdr-dropdown-item" id="bq-toggle-disappear">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Disappearing: OFF</span>
      </div>
      <div class="bqhdr-dropdown-divider"></div>
      <div class="bqhdr-dropdown-item danger" id="bq-clear-chat">
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        <span>Clear Chat</span>
      </div>
    </div>
  </div>
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
          <div class="bqempty-tx">No Messages Yet</div>
          <div class="bqempty-sub">Say hello!</div>
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
        <div class="bqimg-preview-bar" id="bqgimg-preview">
          <img class="bqimg-preview-thumb" id="bqgimg-thumb" src="" alt="Preview"/>
          <div class="bqimg-preview-info" id="bqgimg-info">Image ready to send</div>
          <button class="bqimg-preview-remove" id="bqgimg-remove"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="bqirow">
          <button class="bqieo" id="bqgeo">😊</button>
          <button class="bqimg-btn" id="bqgimg-btn" title="Send image"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
          <input type="file" id="bqgimg-input" accept="image/*" style="display:none"/>
          <textarea id="bqginp" class="bqinp" placeholder="Message everyone..." rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bqsnd" id="bqgsnd" disabled><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
        <div class="bqifooter"><div class="bqcc" id="bqgcc"></div><div class="bqih">Enter send · Shift+Enter newline</div></div>
      </div>
    </div>

    <!-- VIEW: DM List -->
    <div class="bqv" id="bqv-dms">
      <div class="bqhdr">
        <div class="bqlive"></div>
        <div class="bqhtitle">Direct Messages</div>
        <button class="bqhbtn" id="bqdmnewbtn" title="New DM - go to Online">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div class="bq-me-av" id="bq-me-av-dms" title="My profile"></div>
      </div>
      <div id="bqdml"></div>
    </div>

    <!-- VIEW: DM Conversation -->
    <div class="bqv" id="bqv-dmconv">
      <div class="bqhdr">
        <button class="bqback" id="bqdmback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>Back</button>
        <div class="bqdmhav" id="bqdmhav"></div>
        <div class="bqdmhi"><div class="bqdmhn" id="bqdmhn"></div><div class="bqdmhs" id="bqdmhs">Offline</div></div>
        <button class="bqhbtn" id="bqdmprof" title="View profile"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
        <div class="bq-me-av" id="bq-me-av-dm" title="My profile"></div>
      </div>
      <div class="bqmsgs" id="bqdmmsgs">
        <div class="bqempty" id="bqdmempty">
          <div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="bqempty-tx">Start a Conversation</div>
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
        <div class="bqimg-preview-bar" id="bqdmimg-preview">
          <img class="bqimg-preview-thumb" id="bqdmimg-thumb" src="" alt="Preview"/>
          <div class="bqimg-preview-info" id="bqdmimg-info">Image ready to send</div>
          <button class="bqimg-preview-remove" id="bqdmimg-remove"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="bqirow">
          <button class="bqieo" id="bqdmeo">😊</button>
          <button class="bqimg-btn" id="bqdmimg-btn" title="Send image"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
          <input type="file" id="bqdmimg-input" accept="image/*" style="display:none"/>
          <textarea id="bqdminp" class="bqinp" placeholder="Message..." rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bqsnd" id="bqdmsnd" disabled><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
        <div class="bqifooter"><div class="bqcc" id="bqdmcc"></div><div class="bqih">Enter send · Shift+Enter newline</div></div>
      </div>
    </div>

    <!-- VIEW: Online Users -->
    <div class="bqv" id="bqv-online">
      <div class="bqhdr">
        <div class="bqlive"></div>
        <div class="bqhtitle">Online Now</div>
        <span id="bqocnt" style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.04em;color:var(--bq-text-subtle);"></span>
        <div class="bq-me-av" id="bq-me-av-online" title="My profile"></div>
      </div>
      <div id="bqol"></div>
    </div>

    <!-- VIEW: Profile Settings (ENHANCED) -->
    <div class="bqv" id="bqv-profile">
      <div class="bqhdr">
        <button class="bqback" id="bqprofback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>Back</button>
        <div class="bqhtitle">My Profile</div>
      </div>
      <div class="bqpf-scroll">
        <div class="bqpf-section">
          <div class="bqpf-label">Avatar & Initials</div>
          <div class="bqpf-initials-row">
            <input type="text" class="bqpf-initials-inp" id="bqpf-initials" maxlength="2" placeholder="AB">
            <div class="bqpf-initials-hint">Custom initials (1-2 letters)<br>Leave empty to use auto-generated</div>
          </div>
          <div class="bqpf-avrow">
            <div class="bqpf-av" id="bqpfav"></div>
            <div class="bqpf-av-info">
              <div class="bqpf-uname" id="bqpfuname">@username</div>
              <div class="bqpf-change" id="bqpf-changename">Change username</div>
            </div>
          </div>
          <div class="bqpf-label">Avatar Colour</div>
          <div class="bqpf-colors" id="bqpfcols"></div>
          <div class="bqpf-label">Banner Colour</div>
          <div class="bqpf-banner-row">
            <div class="bqpf-banner-preview" id="bqpf-banner-preview">Preview</div>
          </div>
          <div class="bqpf-colors" id="bqpf-banner-cols"></div>
        </div>
        <div class="bqpf-section">
          <div class="bqpf-label">Status</div>
          <div class="bqpf-statuses" id="bqpfsts"></div>
          <div class="bqpf-label">Activity (Rich Presence)</div>
          <input id="bqpfact" class="bqpf-inp" type="text" placeholder="e.g. Studying Biology..." maxlength="60" autocomplete="off" autocorrect="off" autocapitalize="off">
        </div>
        <div class="bqpf-section">
          <div class="bqpf-label">Bio</div>
          <textarea id="bqpfbio" class="bqpf-textarea" placeholder="Write something about yourself..." maxlength="120" autocorrect="off"></textarea>
        </div>
        <div class="bqpf-section">
          <div class="bqpf-label">Appearance</div>
          <div class="bqpf-label" style="margin-top:8px;font-size:9px;color:var(--bq-text-muted);">Font Size</div>
          <div class="bqpf-fontsize-row" id="bqpf-fontsize">
            <div class="bqpf-fontsize" data-size="sm">
              <div class="bqpf-fontsize-sample" style="font-size:12px;">Aa</div>
              <div class="bqpf-fontsize-lbl">Small</div>
            </div>
            <div class="bqpf-fontsize sel" data-size="md">
              <div class="bqpf-fontsize-sample" style="font-size:14px;">Aa</div>
              <div class="bqpf-fontsize-lbl">Medium</div>
            </div>
            <div class="bqpf-fontsize" data-size="lg">
              <div class="bqpf-fontsize-sample" style="font-size:16px;">Aa</div>
              <div class="bqpf-fontsize-lbl">Large</div>
            </div>
          </div>
        </div>
        <div class="bqpf-section">
          <div class="bqpf-label">Push Notifications</div>
          <div class="bqpf-push">
            <div class="bqpf-push-title">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Notification Alerts
            </div>
            <div class="bqpf-push-desc">Get notified when you receive new DMs or messages in global chat, even when the browser is closed.</div>
            <button class="bqpf-push-btn" id="bqpf-push-btn">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Enable Notifications
            </button>
            <div class="bqpf-push-status" id="bqpf-push-status"></div>
          </div>
        </div>
        <button class="bqpf-savebtn" id="bqpfsave">Save Profile</button>
        <div class="bqpf-savemsg" id="bqpfmsg" style="opacity:0"></div>
      </div>
    </div>

  </div><!-- /bqs -->

  <!-- Bottom Nav -->
  <div id="bqnav">
    <button class="bqnb active" data-v="chat">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Chat
    </button>
    <button class="bqnb" data-v="dms">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>DMs
      <div class="bqnnb" id="bqdmnb"></div>
    </button>
    <button class="bqnb" data-v="online">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Online
      <div class="bqnnb" id="bqonb"></div>
    </button>
  </div>

</div>
<div id="bqtoast"></div>
<div class="bqimg-preview" id="bqimg-preview">
  <button class="bqimg-close" id="bqimg-close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  <img id="bqimg-full" src="" alt="Full size image">
  </div>
  <div class="bq-confirm" id="bq-confirm">
    <div class="bq-confirm-box">
      <div class="bq-confirm-icon">
        <svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <div class="bq-confirm-title" id="bq-confirm-title">Clear Chat?</div>
      <div class="bq-confirm-desc" id="bq-confirm-desc">This will clear all messages from your view. This action cannot be undone.</div>
      <div class="bq-confirm-btns">
        <button class="bq-confirm-btn cancel" id="bq-confirm-cancel">Cancel</button>
        <button class="bq-confirm-btn danger" id="bq-confirm-ok">Clear</button>
      </div>
    </div>
  </div>
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
let isOpen    = false;
let gUnread   = 0;
let dmUnread  = {};
let onlineU   = {};
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
let prevView  = 'chat';
let isFull    = false;
let pushEnabled = localStorage.getItem(LS_PUSH) === 'true';

// Profile local state
let myProfile = JSON.parse(localStorage.getItem(LS_PROF)||'{"status":"online","activity":"","bio":"","color":"","bannerColor":"","initials":"","fontSize":"md"}');
if(!myProfile.status) myProfile.status='online';
if(!myProfile.fontSize) myProfile.fontSize='md';

/* ─────────────────────────────────────────
   ALIAS / PIN HELPERS
───────────────────────────────────────── */
const LS_ALIAS='bq_aliases';
const LS_PINS='bq_pinned';

function getAliases(){try{return JSON.parse(localStorage.getItem(LS_ALIAS)||'{}');}catch{return {};}}
function getAlias(puid){return getAliases()[puid]||'';}
function setAlias(puid,v){const a=getAliases();if(v&&v.trim())a[puid]=v.trim().slice(0,24);else delete a[puid];localStorage.setItem(LS_ALIAS,JSON.stringify(a));}
function getPins(){try{return JSON.parse(localStorage.getItem(LS_PINS)||'[]');}catch{return [];}}
function togglePin(did){const p=getPins(),i=p.indexOf(did);if(i>-1)p.splice(i,1);else p.unshift(did);localStorage.setItem(LS_PINS,JSON.stringify(p));renderDmList();}

let aliasT=null;

function refreshMeAvatar(){
  const col=myProfile.color||uColor(uname||'u');
  const initials=myInit();
  ['bq-me-av','bq-me-av-dms','bq-me-av-dm','bq-me-av-online'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    el.style.background=col;el.style.color='#000';el.textContent=initials;
  });
  // Apply font size preference
  const panel=document.getElementById('bqp');
  if(panel){
    panel.classList.remove('bq-font-sm','bq-font-lg');
    if(myProfile.fontSize==='sm') panel.classList.add('bq-font-sm');
    else if(myProfile.fontSize==='lg') panel.classList.add('bq-font-lg');
  }
}

/* ─────────────────────────────────────────
   PUSH NOTIFICATIONS
─────────────────────────���─────────────── */
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    toast('Notifications not supported');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

async function subscribeToPush() {
  const btn = document.getElementById('bqpf-push-btn');
  const status = document.getElementById('bqpf-push-status');
  
  if (!btn || !uname) {
    if (status) status.textContent = 'Please log in first';
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-dashoffset="20"/></svg>Enabling...';
  
  try {
    // 1. Request browser notification permission
    const granted = await requestNotificationPermission();
    
    if (!granted) {
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Enable Notifications';
      if (status) status.textContent = 'Permission denied. Please enable in browser settings.';
      toast('Permission denied');
      return;
    }
    
    // 2. Register service worker if not already registered
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[FCM] Service Worker registered:', reg);
      } catch (e) {
        console.error('[FCM] Service Worker registration failed:', e);
      }
    }
    
    // 3. Get FCM token from Firebase
    if (!window.firebase) {
      throw new Error('Firebase not loaded');
    }
    
    const messaging = firebase.messaging();
    const token = await messaging.getToken({
      vapidKey: _resolvedVapidKey
    });
    
    if (!token) {
      throw new Error('Failed to get FCM token');
    }
    
    console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
    
    // 4. Save token to Firebase Realtime DB under user's data
    if (db && uid) {
      const tokenKey = 'token_' + Date.now().toString(36);
      db.ref('fcm_tokens/' + uid + '/' + tokenKey).set(token);
      
      // Cleanup old tokens after 30 days
      db.ref('fcm_tokens/' + uid).once('value', snap => {
        const tokens = snap.val() || {};
        const now = Date.now();
        Object.entries(tokens).forEach(([key, val]) => {
          const ts = parseInt(key.split('_')[1], 36);
          if (now - ts > 30 * 24 * 60 * 60 * 1000) {
            db.ref('fcm_tokens/' + uid + '/' + key).remove();
          }
        });
      });
    }
    
    // 5. Setup message listener for foreground messages
    const messaging2 = firebase.messaging();
    messaging2.onMessage(payload => {
      console.log('[FCM] Foreground message:', payload);
      if (!document.hasFocus() || !isOpen) {
        showNotification(payload.notification?.title || 'Message', payload.notification?.body || '');
      }
    });
    
    pushEnabled = true;
    localStorage.setItem(LS_PUSH, 'true');
    
    btn.classList.add('subscribed');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>Notifications Enabled';
    btn.disabled = true;
    
    if (status) status.textContent = 'You will receive notifications even when the browser is closed';
    
    toast('Push notifications enabled!');
    
  } catch (err) {
    console.error('[FCM] Setup error:', err);
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Enable Notifications';
    if (status) status.textContent = 'Error: ' + (err.message || 'Failed to enable');
    toast('Error: ' + (err.message || 'Failed to enable notifications'));
  }
}

function showNotification(title, body, tag) {
  if (!pushEnabled || Notification.permission !== 'granted') return;
  if (document.hasFocus() && isOpen) return; // Don't notify if widget is open and focused
  
  try {
    new Notification(title, {
      body: body.slice(0, 100),
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: tag || 'bq-msg',
      requireInteraction: false,
      silent: false
    });
  } catch (err) {
    console.warn('Notification error:', err);
  }
}

function updatePushUI() {
  const btn = document.getElementById('bqpf-push-btn');
  const status = document.getElementById('bqpf-push-status');
  
  if (!btn) return;
  
  if (pushEnabled && Notification.permission === 'granted') {
    btn.classList.add('subscribed');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>Notifications Enabled';
    btn.disabled = true;
    if (status) status.textContent = 'You will receive notifications for new messages';
  } else if (Notification.permission === 'denied') {
    btn.disabled = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Blocked';
    if (status) status.textContent = 'Notifications blocked. Please enable in browser settings.';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Enable Notifications';
    if (status) status.textContent = '';
  }
}

/* ────���────────────────────────────────────
   TOAST
────────────���──────────────────────────── */
function toast(m,dur=2500){
  const el=document.getElementById('bqtoast');if(!el)return;
  el.textContent=m;el.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),dur);
}

/* ─────────────────────────────────────────
   IMAGE UPLOAD
───────────────────────────────────────── */
let pendingImage = { global: null, dm: null };

async function uploadImage(file, ctx) {
  if (!file) {
    toast('No file selected');
    return null;
  }
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    toast('Please select an image file');
    return null;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    toast('Image must be under 5MB');
    return null;
  }
  
  const isG = ctx === 'global';
  const btn = document.getElementById(isG ? 'bqgimg-btn' : 'bqdmimg-btn');
  
  try {
    btn?.classList.add('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', uid);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    const data = await response.json();
    btn?.classList.remove('uploading');
    return data.url;
  } catch (err) {
    console.error('[Upload] Error:', err);
    btn?.classList.remove('uploading');
    toast('Upload failed: ' + (err.message || 'Unknown error'));
    return null;
  }
}

function setupImageUpload(ctx) {
  const isG = ctx === 'global';
  const btn = document.getElementById(isG ? 'bqgimg-btn' : 'bqdmimg-btn');
  const input = document.getElementById(isG ? 'bqgimg-input' : 'bqdmimg-input');
  const preview = document.getElementById(isG ? 'bqgimg-preview' : 'bqdmimg-preview');
  const thumb = document.getElementById(isG ? 'bqgimg-thumb' : 'bqdmimg-thumb');
  const info = document.getElementById(isG ? 'bqgimg-info' : 'bqdmimg-info');
  const remove = document.getElementById(isG ? 'bqgimg-remove' : 'bqdmimg-remove');
  const sndBtn = document.getElementById(isG ? 'bqgsnd' : 'bqdmsnd');
  
  if (!btn || !input) return;
  
  btn.addEventListener('click', () => input.click());
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      thumb.src = ev.target.result;
      info.textContent = `${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      preview.classList.add('show');
      pendingImage[isG ? 'global' : 'dm'] = file;
      sndBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    input.value = '';
  });
  
  remove?.addEventListener('click', () => {
    preview.classList.remove('show');
    thumb.src = '';
    pendingImage[isG ? 'global' : 'dm'] = null;
    const inp = document.getElementById(isG ? 'bqginp' : 'bqdminp');
    sndBtn.disabled = !inp?.value.trim();
  });
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
   NAVIGATION (FIXED - completely rewritten)
───────────────────────────────────────── */
function bqNav(targetView) {
  if (targetView === activeView) return;
  
  const views = ['chat', 'dms', 'dmconv', 'online', 'profile'];
  
  // Store previous view for back navigation (but not if going to dmconv)
  if (targetView !== 'dmconv' && targetView !== 'profile') {
    prevView = activeView !== 'dmconv' && activeView !== 'profile' ? activeView : prevView;
  }
  
  // Update all views
  views.forEach(v => {
    const el = document.getElementById('bqv-' + v);
    if (!el) return;
    
    if (v === targetView) {
      el.classList.add('bq-active');
      el.classList.remove('bq-exit-left');
    } else {
      el.classList.remove('bq-active');
      if (v === activeView) {
        el.classList.add('bq-exit-left');
      }
    }
  });
  
  activeView = targetView;
  
  // Update nav buttons
  document.querySelectorAll('.bqnb').forEach(b => {
    const btnView = b.dataset.v;
    const isActive = btnView === targetView || (targetView === 'dmconv' && btnView === 'dms');
    b.classList.toggle('active', isActive);
  });
  
  // Focus input for chat views
  if (targetView === 'chat' && !('ontouchstart' in window)) {
    setTimeout(() => document.getElementById('bqginp')?.focus(), 100);
  }
  if (targetView === 'dmconv' && !('ontouchstart' in window)) {
    setTimeout(() => document.getElementById('bqdminp')?.focus(), 100);
  }
  if (targetView === 'profile') {
    refreshProfileView();
    updatePushUI();
  }
}

// Expose globally for nav buttons
window.bqNav = bqNav;

function showDmConvo(pUid, pName) {
  const newDmId = dmKey(uid, pUid);
  
  activeDmId = newDmId;
  activeDmPuid = pUid;
  activeDmPname = pName;
  dLastU = null;
  dLastT = 0;
  dAtBot = true;

  // Update header
  const color = getColor(pUid, pName);
  const hav = document.getElementById('bqdmhav');
  hav.style.background = color;
  hav.style.color = '#000';
  hav.textContent = uInit(pName);
  hav.dataset.puid = pUid;
  hav.dataset.pname = pName;
  const pdata = onlineU[pUid] || {};
  hav.className = 'bqdmhav' + (pdata.status ? ' ' + pdata.status : '');
  document.getElementById('bqdmhn').textContent = '@' + pName;
  const st = statusInfo(pdata.status || '');
  const isOn=!!onlineU[pUid];
  const hsEl=document.getElementById('bqdmhs');
  if(hsEl){
    if(isOn){
      hsEl.textContent=st.label;
      hsEl.style.color='var(--bq-success)';
    } else {
      // Fetch accurate last seen from database
      hsEl.style.color='var(--bq-text-subtle)';
      if(db && pUid) {
        db.ref('bq_last_seen/'+pUid).once('value', snap => {
          const lastSeen = snap.val();
          if(lastSeen) {
            hsEl.textContent='Last seen '+lastSeenStr(lastSeen);
          } else if(pdata.ts) {
            hsEl.textContent='Last seen '+lastSeenStr(pdata.ts);
          } else {
            hsEl.textContent='Offline';
          }
        });
      } else {
        hsEl.textContent=pdata.ts?'Last seen '+lastSeenStr(pdata.ts):'Offline';
      }
    }
  }

  // Clear msgs and create empty state
  const msgs = document.getElementById('bqdmmsgs');
  msgs.innerHTML = '';
  const e = document.createElement('div');
  e.className = 'bqempty';
  e.id = 'bqdmempty';
  e.innerHTML = `<div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bqempty-tx">Start a Conversation</div><div class="bqempty-sub" id="bqdmesub">@${esc(pName)}</div>`;
  msgs.appendChild(e);

  // Detach old listeners
  Object.entries(dmListeners).forEach(([id, ref]) => { ref.off(); delete dmListeners[id]; });
  
  // Subscribe fresh - load initial messages immediately
  if (db) {
    const ref = db.ref('bq_dms/' + activeDmId + '/messages');
    
    // Load last messages synchronously so they show immediately
    ref.limitToLast(MAX_MSG).once('value', snap => {
      snap.forEach(s => {
        if(!document.getElementById('bqmsg-dm-' + s.key)) {
          renderMsg('dm', s.val(), s.key);
        }
      });
      // Scroll to bottom after initial load
      setTimeout(() => {
        const msgs = document.getElementById('bqdmmsgs');
        if(msgs) msgs.scrollTop = msgs.scrollHeight;
      }, 50);
    });
    
    // Then listen for real-time updates
    ref.on('child_added', s => {
      if(!document.getElementById('bqmsg-dm-' + s.key)) renderMsg('dm', s.val(), s.key);
    });
    ref.on('child_changed', s => onMsgChanged('dm', s));
    ref.on('child_removed', s => document.getElementById('bqmsg-dm-' + s.key)?.remove());
    dmListeners[activeDmId] = ref;
  }
  
  // DM typing
  if (dmTypRef) { dmTypRef.off(); dmTypRef = null; }
  if (db) {
    dmTypRef = db.ref('bq_dm_typing/' + activeDmId);
    dmTypRef.on('value', snap => {
      const now = Date.now(), ty = [];
      snap.forEach(c => { const d = c.val(); if (c.key !== uid && d && now - d.ts < 3800) ty.push('@' + (d.uname || '?')); });
      const el = document.getElementById('bqdmtyp'); if (!el) return;
      if (!ty.length) { el.innerHTML = ''; return; }
      el.innerHTML = `<div class="bqtd"><span></span><span></span><span></span></div><span>${ty.join(' & ')} typing</span>`;
    });
  }
  
  // Mark read and update read receipts
  if (db) {
    if(dmUnread[activeDmId]) {
      db.ref('bq_dms/' + activeDmId + '/meta/unread/' + uid).set(0);
      dmUnread[activeDmId] = 0;
      updateBadges();
    }
    // Mark all messages from the other user as read
    db.ref('bq_dms/' + activeDmId + '/messages').once('value', snap => {
      snap.forEach(child => {
        const msg = child.val();
        if(msg && msg.uid !== uid && !msg.readAt) {
          db.ref('bq_dms/' + activeDmId + '/messages/' + child.key + '/readAt').set(Date.now());
        }
      });
    });
  }

  bqNav('dmconv');
  requestAnimationFrame(() => { if (msgs) msgs.scrollTop = msgs.scrollHeight; });
}

/* ─────────────────────────────────────────
   FIREBASE
───────────────────────────────────────── */
function loadSDK(){
  return new Promise((res,rej)=>{
    let done=0;
    const sdks = [
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js'
    ];
    sdks.forEach(u=>{
      const s=document.createElement('script');s.src=u;
      s.onload=()=>{if(++done===sdks.length-1)res();};s.onerror=rej;
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
  else{av.style.background='rgba(96,165,250,.2)';av.textContent='?';}
  if(!name||name.length<2){st.textContent=name.length===1?'Min 2 characters':'';st.className='bqnmst';inp.className='bqnmi';btn.disabled=true;return;}
  if(name===uname){st.textContent='Your current username';st.className='bqnmst ok';inp.className='bqnmi ok';btn.disabled=false;return;}
  clearTimeout(nmCkT);st.textContent='Checking...';st.className='bqnmst chk';inp.className='bqnmi chk';btn.disabled=true;
  nmCkT=setTimeout(async()=>{
    if(!db){st.textContent='Available!';st.className='bqnmst ok';inp.className='bqnmi ok';btn.disabled=false;return;}
    try{
      const s=await db.ref('bq_usernames/'+name).once('value');const o=s.val();
      if(o&&o!==uid){st.textContent='@'+name+' is taken';st.className='bqnmst tkn';inp.className='bqnmi tkn';btn.disabled=true;}
      else{st.textContent='@'+name+' is available!';st.className='bqnmst ok';inp.className='bqnmi ok';btn.disabled=false;}
    }catch(_){st.textContent='Looks good';st.className='bqnmst ok';btn.disabled=false;}
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
  btn.textContent=rename?'UPDATE':'JOIN CHAT';
  btn.disabled=true;st.textContent='';st.className='bqnmst';inp.className='bqnmi';
  const av=document.getElementById('bqnmav');
  if(rename&&uname){av.style.background=uColor(uname);av.textContent=uInit(uname);ckUN(uname);}
  else{av.style.background='rgba(96,165,250,.2)';av.textContent='?';}
  if(!('ontouchstart' in window)) setTimeout(()=>inp.focus(),60);
}

function hideModal(){ document.getElementById('bqnm').style.display='none'; }

async function submitName(){
  const name=sanitUN(document.getElementById('bqnminp').value);
  if(!name||name.length<2)return;
  const btn=document.getElementById('bqnmbtn');
  btn.disabled=true;btn.textContent='JOINING...';
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
  if(isFirst) sendSys('bq_messages','@'+uname+' joined the chat');
  else if(oldName&&oldName!==uname) sendSys('bq_messages','@'+oldName+' is now @'+uname);
  btn.textContent='JOIN CHAT';btn.disabled=false;
  refreshMeAvatar();
  if(activeView==='profile') refreshProfileView();
}

/* ─────────────────────────────────────────
   COLOUR HELPER
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
  const lastSeenRef=db.ref('bq_last_seen/'+uid);
  const connRef=db.ref('.info/connected');
  
  const beat=()=>ref.set({
  uname,ts:Date.now(),
  status:myProfile.status||'online',
  activity:myProfile.activity||'',
  bio:myProfile.bio||'',
  color:myProfile.color||'',
  });
  
  // Listen for connection state
  connRef.on('value', snap => {
    if(snap.val() === true) {
      // Connected - set up onDisconnect handlers
      ref.onDisconnect().remove();
      lastSeenRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      beat();
    }
  });
  
  clearInterval(presInt);
  presInt=setInterval(beat,PRESENCE_TTL*.7);
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
  if(hs){
    if(isOn){
      hs.textContent=statusInfo(pdata.status||'online').label;
      hs.style.color='var(--bq-success)';
    } else {
      // Fetch accurate last seen from database
      hs.style.color='var(--bq-text-subtle)';
      if(db && activeDmPuid) {
        db.ref('bq_last_seen/'+activeDmPuid).once('value', snap => {
          const lastSeen = snap.val();
          if(lastSeen) {
            hs.textContent='Last seen '+lastSeenStr(lastSeen);
          } else if(pdata.ts) {
            hs.textContent='Last seen '+lastSeenStr(pdata.ts);
          } else {
            hs.textContent='Offline';
          }
        });
      } else {
        hs.textContent=pdata.ts?'Last seen '+lastSeenStr(pdata.ts):'Offline';
      }
    }
  }
  }

function renderOnlineList(){
  const list=document.getElementById('bqol');if(!list)return;
  list.innerHTML='';
  const entries=Object.entries(onlineU);
  if(!entries.length){
    list.innerHTML='<div class="bqempty" style="margin-top:40px"><div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="bqempty-tx">No One Online</div><div class="bqempty-sub">Check back later</div></div>';
    return;
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
      ${!me?'<div class="bqudmh">Message</div>':''}`;
    if(!me) row.addEventListener('click',e=>{
      e.stopPropagation();
      if(!uname){showModal(false);return;}
      openProfileCard(id,n,d);
    });
    list.appendChild(row);
  });
}

/* ─────────────────────────────────────────
   PROFILE CARD
───────────────────────────────────────── */
let pcTargetUid=null,pcTargetName=null;

function openProfileCard(targetUid,targetName,presData){
  pcTargetUid=targetUid;pcTargetName=targetName;
  const isMe=targetUid===uid;
  const color=getColor(targetUid,targetName);
  const pd=presData||onlineU[targetUid]||{};
  const si=statusInfo(pd.status||'online');

  document.getElementById('bqpc-banner').style.background=`linear-gradient(135deg,${color}66,${color}33)`;
  const av=document.getElementById('bqpc-av');
  av.style.background=color;av.style.color='#000';av.textContent=uInit(targetName);
  document.getElementById('bqpc-name').textContent='@'+targetName;
  const stEl=document.getElementById('bqpc-status');
  stEl.innerHTML=`<div class="bqpc-sdot" style="background:${si.color}"></div><span class="bqpc-slabel" style="color:${si.color}">${si.label}</span>`;
  
  // Last seen - fetch from database for accurate offline time
  const lsEl=document.getElementById('bqpc-lastseen');
  if(lsEl){
    const isOnline=!!onlineU[targetUid];
    if(isOnline){
      lsEl.textContent='Currently online';
      lsEl.className='bqls bqls-online';
    } else {
      // Fetch last seen from database
      lsEl.textContent='Checking...';
      lsEl.className='bqls';
      if(db) {
        db.ref('bq_last_seen/'+targetUid).once('value', snap => {
          const lastSeen = snap.val();
          if(lastSeen) {
            lsEl.textContent='Last seen '+lastSeenStr(lastSeen);
          } else if(pd.ts) {
            lsEl.textContent='Last seen '+lastSeenStr(pd.ts);
          } else {
            lsEl.textContent='Never seen online';
          }
        });
      } else if(pd.ts) {
        lsEl.textContent='Last seen '+lastSeenStr(pd.ts);
      } else {
        lsEl.textContent='Never seen online';
      }
    }
  }
  
  const actEl=document.getElementById('bqpc-activity');
  if(pd.activity){actEl.textContent=pd.activity;actEl.style.display='flex';}
  else actEl.style.display='none';
  const bioEl=document.getElementById('bqpc-bio');
  if(pd.bio){bioEl.textContent=pd.bio;bioEl.style.display='block';}
  else bioEl.style.display='none';
  
  const aliasWrap=document.getElementById('bqpc-aliasw');
  const aliasInp=document.getElementById('bqpc-aliasinp');
  if(!isMe&&aliasWrap&&aliasInp){
    aliasWrap.style.display='block';
    aliasInp.value=getAlias(targetUid)||'';
    aliasInp.oninput=()=>{
      clearTimeout(aliasT);
      aliasT=setTimeout(()=>{setAlias(targetUid,aliasInp.value);renderDmList();renderOnlineList();toast(aliasInp.value.trim()?'Alias saved':'Alias removed');},600);
    };
  } else if(aliasWrap){aliasWrap.style.display='none';}

  const actsEl=document.getElementById('bqpc-actions');
  actsEl.innerHTML='';
  if(!isMe){
    const dmBtn=document.createElement('button');
    dmBtn.className='bqpc-btn dm';
    dmBtn.innerHTML='<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message';
    dmBtn.onclick=function(e){
      e.stopPropagation();
      closeProfileCard();
      showDmConvo(targetUid,targetName);
    };
    actsEl.appendChild(dmBtn);
  } else {
    const editBtn=document.createElement('button');
    editBtn.className='bqpc-btn edit';
    editBtn.innerHTML='<svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>Edit Profile';
    editBtn.onclick=function(e){
      e.stopPropagation();
      closeProfileCard();
      bqNav('profile');
    };
    actsEl.appendChild(editBtn);
  }
  document.getElementById('bqpc').classList.add('open');
}

function closeProfileCard(){
  document.getElementById('bqpc').classList.remove('open');
  pcTargetUid=null;pcTargetName=null;
}

/* ─────────────────────────────────────────
   GLOBAL CHAT
───────────────────────────────────────── */
function subscribeGlobal(){
  const ref=db.ref('bq_messages');
  // First load last messages
  ref.limitToLast(MAX_MSG).once('value',snap=>{
    snap.forEach(s=>renderMsg('global',s.val(),s.key));
  });
  // Then listen for new ones in real-time
  ref.on('child_added',s=>{
    // Skip if already rendered
    if(!document.getElementById('bqmsg-global-'+s.key)) renderMsg('global',s.val(),s.key);
  });
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

async function sendGlobal(text, imageUrl = null){
  if(!db||(!text.trim() && !imageUrl)||!uname)return;
  const disappearingEnabled = localStorage.getItem('bq_disappearing') === 'true';
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(imageUrl) p.imageUrl = imageUrl;
  if(disappearingEnabled) p.expiresAt = Date.now() + 3600000; // 1 hour
  if(gReply) p.replyTo={key:gReply.key,uname:gReply.uname,text:gReply.text.slice(0,80)};
  db.ref('bq_messages').push(p);
  db.ref('bq_messages').once('value',snap=>{
    const keys=[];snap.forEach(c=>keys.push(c.key));
    if(keys.length>MAX_MSG+25) keys.slice(0,keys.length-MAX_MSG).forEach(k=>db.ref('bq_messages/'+k).remove());
  });
  
  // Send FCM notification
  fetch('/api/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: uid,
      senderName: uname,
      messageText: text.trim().slice(0, 100),
      type: 'global'
    })
  }).catch(e => console.error('[FCM] Send error:', e));
  
  clearReply('g');
}

/* ─────────────────────────────────────────
   DM LIST
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
    clearTimeout(dmRenderT);
    dmRenderT=setTimeout(renderDmList,120);
    updateBadges();
  });
}

function renderDmList(){
  const list=document.getElementById('bqdml');if(!list)return;
  const items=Object.entries(dmMeta);
  if(!items.length){
    if(!list.querySelector('.bqdmr')){
      list.innerHTML='';
      const e=document.createElement('div');e.className='bqempty';e.style.marginTop='40px';
      e.innerHTML='<div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bqempty-tx">No DMs Yet</div><div class="bqempty-sub">Go to Online to start</div>';
      list.appendChild(e);
    }
    return;
  }
  
  const existingKeys=new Set([...list.querySelectorAll('.bqdmr')].map(r=>r.dataset.did));
  const newKeys=new Set(items.map(([k])=>k));
  existingKeys.forEach(k=>{ if(!newKeys.has(k)) list.querySelector(`[data-did="${k}"]`)?.remove(); });
  list.querySelector('.bqempty')?.remove();

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
        <div class="bqdmn">${pinned?'<span class="bqdm-pin">📌</span>':''}${esc(shown)}${alias?`<span style="opacity:.5;font-size:11px"> (@${esc(pname)})</span>`:''}</div>
        <div class="bqdmp${unrd?' unr':''}">${preview||'<span style="opacity:.4">No messages yet</span>'}</div>
      </div>
      <div class="bqdmm">
        <div class="bqdmt">${ts}</div>
        ${unrd?`<div class="bqdmub">${unrd>9?'9+':unrd}</div>`:''}
      </div>
      <div class="bqdmr-acts">
        <button class="bqdmr-act bq-pin${pinned?' pinned':''}" data-did="${did}" title="${pinned?'Unpin':'Pin'}">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </button>
        <button class="bqdmr-act bq-del" data-did="${did}" title="Delete">
          <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div class="bqdmr-confirm">
        <div class="bqdmr-confirm-msg">Delete conversation?</div>
        <button class="bqdmr-cyes" data-did="${did}">Delete</button>
        <button class="bqdmr-cno">Cancel</button>
      </div>`;
    if(isNew) list.appendChild(row);
  });
  items.forEach(([did])=>{const r=list.querySelector(`[data-did="${did}"]`);if(r)list.appendChild(r);});
}

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
    bqNav('dms');
  }
  renderDmList();updateBadges();toast('Conversation deleted');
}

/* ─────────────────────────────────────────
   DM SEND
──────────────────────────────────────��── */
async function sendDm(text, imageUrl = null){
  if(!db||(!text.trim() && !imageUrl)||!uname||!activeDmId||!activeDmPuid)return;
  const pname=activeDmPname||'?';
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(imageUrl) p.imageUrl = imageUrl;
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
  
  // Send FCM notification to DM recipient
  fetch('/api/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: uid,
      senderName: uname,
      messageText: text.trim().slice(0, 100),
      type: 'dm',
      recipientId: activeDmPuid
    })
  }).catch(e => console.error('[FCM] Send DM error:', e));
  
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

/* ───���─────────────────────────────────────
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

/* ───────────────────────────────────��─────
   RENDER MESSAGE
───────────────────────────────────────── */
function renderMsg(ctx,msg,key){
  const isG=ctx==='global';
  const msgsEl=document.getElementById(isG?'bqgmsgs':'bqdmmsgs');
  if(!msgsEl)return;
  
  // Check if message has expired (disappearing messages)
  if(msg.expiresAt && Date.now() > msg.expiresAt){
    // Delete expired message from DB
    if(db && isG) db.ref('bq_messages/'+key).remove();
    else if(db && activeDmId) db.ref('bq_dms/'+activeDmId+'/messages/'+key).remove();
    return;
  }
  
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
  const timerHTML=msg.expiresAt?`<span class="bq-timer-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>`:'';
  const imageHTML=msg.imageUrl?`<div class="bqmsg-imgwrap"><img class="bqmsg-img" src="${esc(msg.imageUrl)}" alt="Shared image" loading="lazy" onclick="window.bqOpenImage&&window.bqOpenImage('${esc(msg.imageUrl)}')"></div>`:'';
  // Read receipts for DMs (only show for sender's own messages)
  const readHTML=(!isG && isMine && msg.readAt)?`<span class="bqread read" title="Read at ${tsStr(msg.readAt)}"><svg viewBox="0 0 24 12"><polyline points="1 6 5 10 12 2"/><polyline points="8 6 12 10 19 2"/></svg></span>`:(!isG && isMine)?`<span class="bqread" title="Delivered"><svg viewBox="0 0 24 12"><polyline points="6 6 10 10 17 2"/></svg></span>`:'';
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
  ${isMine?`<button class="bqact" data-a="edit" title="Edit"><svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>`:''}
  ${isMine?`<button class="bqact del" data-a="del" title="Delete"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>`:''}
  </div>
  <div class="bqbbl${msg.expiresAt?' disappearing':''}">${rpHTML}${msg.text?linkify(esc(msg.text)):''}${imageHTML}${msg.edited?'<span class="bqedited">(edited)</span>':''}${timerHTML}${readHTML}</div>
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
  // Avatar / username click
  row.querySelectorAll('.bqav,.bqun').forEach(el=>{
    el.addEventListener('click',e=>{
      e.stopPropagation();
      const tuid=el.dataset.uid||msg.uid;
      const tname=el.dataset.uname||msg.uname||'?';
      openProfileCard(tuid,tname,onlineU[tuid]);
    });
  });

  // Notification + badge
  if(!isOpen&&!isMine){
    if(isG) gUnread++; else {dmUnread[activeDmId]=(dmUnread[activeDmId]||0)+1;}
    updateBadges();
    // Push notification
    if(isG) {
      showNotification('Global Chat', `@${msg.uname}: ${msg.text}`, 'bq-global');
    } else {
      showNotification(`@${msg.uname}`, msg.text, 'bq-dm-'+activeDmId);
    }
  }
  scrollD(ctx);
}

function doAction(ctx,a,key,msg,pfx){
  if(a==='react'){const p=document.getElementById(pfx+'ep-'+key);if(p)p.classList.toggle('open');}
  else if(a==='reply'){setReply(ctx==='global'?'g':'dm',{key,uname:msg.uname,text:msg.text});document.getElementById(ctx==='global'?'bqginp':'bqdminp')?.focus();}
  else if(a==='copy'){navigator.clipboard?.writeText(msg.text).then(()=>toast('Copied!'));}
  else if(a==='del'){if(msg.uid!==uid)return;const p=ctx==='global'?'bq_messages/'+key:'bq_dms/'+activeDmId+'/messages/'+key;db.ref(p).remove();}
  else if(a==='edit'){if(msg.uid!==uid)return;startEditMsg(ctx,key,msg,pfx);}
  }
  
function startEditMsg(ctx,key,msg,pfx){
  const row=document.getElementById(pfx+key);
  if(!row)return;
  const bbl=row.querySelector('.bqbbl');
  if(!bbl||bbl.classList.contains('editing'))return;
  
  const originalText=msg.text||'';
  bbl.classList.add('editing');
  bbl.innerHTML=`
    <textarea class="bqedit-inp">${esc(originalText)}</textarea>
    <div class="bqedit-btns">
      <button class="bqedit-btn cancel">Cancel</button>
      <button class="bqedit-btn save">Save</button>
    </div>
  `;
  
  const inp=bbl.querySelector('.bqedit-inp');
  const saveBtn=bbl.querySelector('.bqedit-btn.save');
  const cancelBtn=bbl.querySelector('.bqedit-btn.cancel');
  
  inp.focus();
  inp.setSelectionRange(inp.value.length,inp.value.length);
  autoH(inp);
  inp.addEventListener('input',()=>autoH(inp));
  
  cancelBtn.addEventListener('click',e=>{
    e.stopPropagation();
    bbl.classList.remove('editing');
    bbl.innerHTML=linkify(esc(originalText));
  });
  
  saveBtn.addEventListener('click',e=>{
    e.stopPropagation();
    const newText=inp.value.trim();
    if(!newText){toast('Message cannot be empty');return;}
    if(newText===originalText){
      bbl.classList.remove('editing');
      bbl.innerHTML=linkify(esc(originalText));
      return;
    }
    const p=ctx==='global'?'bq_messages/'+key:'bq_dms/'+activeDmId+'/messages/'+key;
    db.ref(p).update({text:newText,edited:true,editedAt:Date.now()});
    bbl.classList.remove('editing');
    bbl.innerHTML=linkify(esc(newText))+'<span class="bqedited">(edited)</span>';
    toast('Message edited');
  });
  
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();saveBtn.click();}
    if(e.key==='Escape'){cancelBtn.click();}
  });
  }

/* ─────────────────────────────────────────
   BADGES
──────────────────────────���────────────── */
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
  IMAGE PREVIEW
───────────────────────────────────────── */
function openImagePreview(src){
  const preview=document.getElementById('bqimg-preview');
  const img=document.getElementById('bqimg-full');
  if(preview&&img){
    img.src=src;
    preview.classList.add('open');
  }
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
   PROFILE SETTINGS VIEW (FIXED)
───────────────────────────────────────── */
function refreshProfileView(){
  const col=myProfile.color||uColor(uname||'');
  const bannerCol=myProfile.bannerColor||col;
  const initials=myInit();
  const av=document.getElementById('bqpfav');
  if(av){av.style.background=col;av.style.color='#000';av.textContent=initials;}
  const un=document.getElementById('bqpfuname');
  if(un) un.textContent='@'+(uname||'...');
  
  // Custom initials input
  const initInp=document.getElementById('bqpf-initials');
  if(initInp){
    initInp.value=myProfile.initials||'';
    initInp.style.background=col;
    initInp.style.color='#000';
    initInp.style.borderColor=col;
    initInp.addEventListener('input',()=>{
      const val=initInp.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2);
      initInp.value=val;
      myProfile.initials=val;
      if(av) av.textContent=val||uInit(uname||'?');
    });
  }
  
  // Banner preview
  const bannerPreview=document.getElementById('bqpf-banner-preview');
  if(bannerPreview){
    bannerPreview.style.background=`linear-gradient(135deg,${bannerCol}88,${bannerCol}44)`;
  }
  
  // Banner colour chips
  const bannerCols=document.getElementById('bqpf-banner-cols');
  if(bannerCols){
    bannerCols.innerHTML='';
    PALETTE.forEach(c=>{
      const chip=document.createElement('div');
      chip.className='bqpf-col'+(c===bannerCol?' sel':'');
      chip.style.background=c;
      chip.addEventListener('click',()=>{
        myProfile.bannerColor=c;
        bannerCols.querySelectorAll('.bqpf-col').forEach(x=>x.classList.toggle('sel',x.style.background===c||x.style.backgroundColor===c));
        if(bannerPreview) bannerPreview.style.background=`linear-gradient(135deg,${c}88,${c}44)`;
      });
      bannerCols.appendChild(chip);
    });
  }
  
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
        if(initInp){initInp.style.background=c;initInp.style.borderColor=c;}
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
  
  // Font size chips
  const fontRow=document.getElementById('bqpf-fontsize');
  if(fontRow){
    fontRow.querySelectorAll('.bqpf-fontsize').forEach(chip=>{
      const size=chip.dataset.size;
      chip.classList.toggle('sel',size===myProfile.fontSize);
      chip.onclick=()=>{
        myProfile.fontSize=size;
        fontRow.querySelectorAll('.bqpf-fontsize').forEach(x=>x.classList.toggle('sel',x.dataset.size===size));
        // Apply immediately for preview
        const panel=document.getElementById('bqp');
        if(panel){
          panel.classList.remove('bq-font-sm','bq-font-lg');
          if(size==='sm') panel.classList.add('bq-font-sm');
          else if(size==='lg') panel.classList.add('bq-font-lg');
        }
      };
    });
  }
  
  // Activity + bio
  const act=document.getElementById('bqpfact');
  const bio=document.getElementById('bqpfbio');
  if(act) act.value=myProfile.activity||'';
  if(bio) bio.value=myProfile.bio||'';
  
  // Update push UI
  updatePushUI();
}

function saveProfile(){
  const act=document.getElementById('bqpfact')?.value.trim()||'';
  const bio=document.getElementById('bqpfbio')?.value.trim()||'';
  const initials=document.getElementById('bqpf-initials')?.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2)||'';
  myProfile.activity=act;
  myProfile.bio=bio;
  myProfile.initials=initials;
  localStorage.setItem(LS_PROF,JSON.stringify(myProfile));
  if(db&&uname) startPresence();
  refreshMeAvatar();
  const msg=document.getElementById('bqpfmsg');
  if(msg){msg.textContent='Profile saved!';msg.style.opacity='1';setTimeout(()=>msg.style.opacity='0',2500);}
  toast('Profile saved');
}

/* ──────��──────────────────────────────────
   INPUT SETUP
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
    cc.textContent=rem<=60?rem+' left':'';
    cc.className='bqcc'+(rem<=20?' over':rem<=60?' warn':'');
    if(len){
      if(isG){if(!isGTyp)setGTyp(true);clearTimeout(gTypT);gTypT=setTimeout(()=>setGTyp(false),TYPING_TTL);}
      else{if(!isDmTyp)setDmTyp(true);clearTimeout(dmTypT);dmTypT=setTimeout(()=>setDmTyp(false),TYPING_TTL);}
    } else {if(isG)setGTyp(false);else setDmTyp(false);}
  });
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();}});
  snd.addEventListener('click',doSend);

  async function doSend(){
    const txt=inp.value.trim();
    const imgFile = pendingImage[isG ? 'global' : 'dm'];
    if(!txt && !imgFile)return;
    if(!uname){showModal(false);return;}
    
    // Upload image if present
    let imageUrl = null;
    if(imgFile) {
      snd.disabled = true;
      imageUrl = await uploadImage(imgFile, isG ? 'global' : 'dm');
      if(!imageUrl && !txt) {
        snd.disabled = false;
        return; // Upload failed and no text
      }
      // Clear preview
      const preview = document.getElementById(isG ? 'bqgimg-preview' : 'bqdmimg-preview');
      const thumb = document.getElementById(isG ? 'bqgimg-thumb' : 'bqdmimg-thumb');
      if(preview) preview.classList.remove('show');
      if(thumb) thumb.src = '';
      pendingImage[isG ? 'global' : 'dm'] = null;
    }
    
    if(isG) sendGlobal(txt, imageUrl); else sendDm(txt, imageUrl);
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

/* ────────────────────────��────────────────
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

  // Fullscreen
  document.getElementById('bq-fs-btn').addEventListener('click',toggleFS);

  // DM back (FIXED)
  document.getElementById('bqdmback').addEventListener('click',()=>{
    setDmTyp(false);
    if(dmTypRef){dmTypRef.off();dmTypRef=null;}
    bqNav(prevView || 'dms');
  });

  // Profile back (FIXED)
  document.getElementById('bqprofback').addEventListener('click',()=>{
    bqNav(prevView || 'chat');
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

  // New DM
  document.getElementById('bqdmnewbtn').addEventListener('click',()=>bqNav('online'));

  // Profile card close
  document.getElementById('bqpc-close').addEventListener('click',e=>{e.stopPropagation();closeProfileCard();});
  document.getElementById('bqpc').addEventListener('click',e=>{
    if(e.target===document.getElementById('bqpc')) closeProfileCard();
  });

  // Reply cancels
  document.getElementById('bqgrbx').addEventListener('click',()=>clearReply('g'));
  document.getElementById('bqdmrbx').addEventListener('click',()=>clearReply('dm'));

  // Profile save
  document.getElementById('bqpfsave').addEventListener('click',saveProfile);
  document.getElementById('bqpf-changename')?.addEventListener('click',()=>{showModal(true);});

  // Push notifications button
  document.getElementById('bqpf-push-btn')?.addEventListener('click',subscribeToPush);

  // Me avatar buttons → profile view (FIXED)
  ['bq-me-av','bq-me-av-dms','bq-me-av-dm','bq-me-av-online'].forEach(id=>{
    document.getElementById(id)?.addEventListener('click',e=>{
      e.stopPropagation();
      if(!uname){showModal(false);return;}
      bqNav('profile');
    });
  });

  // Nav buttons (FIXED - proper event delegation)
  document.querySelectorAll('.bqnb').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const v = btn.dataset.v;
      if(v) bqNav(v);
    });
  });

  // DM delegation
  initDmDelegate();

  // Set up inputs
  setupInput('global');
  setupInput('dm');
  
  // Set up image uploads
  setupImageUpload('global');
  setupImageUpload('dm');
  
  // Global image preview opener
  window.bqOpenImage = function(src) {
    openImagePreview(src);
  };

  // Outside click
  document.addEventListener('mousedown',e=>{
    if(!isOpen)return;
    if(isFull)return;
    const p=document.getElementById('bqp');
    const b=document.getElementById('bqb');
    if(!p.contains(e.target)&&!b.contains(e.target)) closePanel();
  });

  // Close emoji pickers
  document.getElementById('bqp').addEventListener('click',e=>{
    document.querySelectorAll('.bqepick.open').forEach(el=>{if(!el.contains(e.target))el.classList.remove('open');});
    document.querySelectorAll('.bqiet.open').forEach(t=>{
      const eo=t.closest('.bqiw')?.querySelector('.bqieo');
      if(!t.contains(e.target)&&!(eo&&eo.contains(e.target))) t.classList.remove('open');
    });
  });

  // Escape key
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(document.getElementById('bqpc').classList.contains('open')){closeProfileCard();return;}
      if(activeView==='profile'){bqNav(prevView||'chat');return;}
      if(activeView==='dmconv'){bqNav(prevView||'dms');return;}
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

// Boot Firebase if we have username
  if(uname) startDB();
  refreshMeAvatar();
  
  // Image preview handlers
  document.getElementById('bqimg-close')?.addEventListener('click',()=>{
    document.getElementById('bqimg-preview')?.classList.remove('open');
  });
  document.getElementById('bqimg-preview')?.addEventListener('click',e=>{
    if(e.target===document.getElementById('bqimg-preview')){
      document.getElementById('bqimg-preview')?.classList.remove('open');
    }
  });
  
  // Chat menu (options dropdown)
  const chatMenuBtn = document.getElementById('bq-chat-menu-btn');
  const chatMenu = document.getElementById('bq-chat-menu');
  if (chatMenuBtn && chatMenu) {
    chatMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      chatMenu.classList.toggle('open');
    });
    document.addEventListener('click', () => chatMenu.classList.remove('open'));
  }
  
  // Disappearing messages toggle
  let disappearingEnabled = localStorage.getItem('bq_disappearing') === 'true';
  const disappearBtn = document.getElementById('bq-toggle-disappear');
  function updateDisappearBtn() {
    if (disappearBtn) {
      disappearBtn.querySelector('span').textContent = disappearingEnabled ? 'Disappearing: ON (1hr)' : 'Disappearing: OFF';
    }
  }
  updateDisappearBtn();
  if (disappearBtn) {
    disappearBtn.addEventListener('click', () => {
      disappearingEnabled = !disappearingEnabled;
      localStorage.setItem('bq_disappearing', disappearingEnabled);
      updateDisappearBtn();
      chatMenu.classList.remove('open');
      toast(disappearingEnabled ? 'Disappearing messages enabled (1 hour)' : 'Disappearing messages disabled');
    });
  }
  
  // Clear chat confirmation
  const clearChatBtn = document.getElementById('bq-clear-chat');
  const confirmModal = document.getElementById('bq-confirm');
  const confirmCancel = document.getElementById('bq-confirm-cancel');
  const confirmOk = document.getElementById('bq-confirm-ok');
  
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      chatMenu.classList.remove('open');
      if (confirmModal) confirmModal.classList.add('open');
    });
  }
  if (confirmCancel) {
    confirmCancel.addEventListener('click', () => {
      confirmModal.classList.remove('open');
    });
  }
  if (confirmOk) {
    confirmOk.addEventListener('click', () => {
      confirmModal.classList.remove('open');
      // Clear local view of messages
      const msgsEl = document.getElementById('bqgmsgs');
      if (msgsEl) {
        msgsEl.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'bqempty';
        empty.id = 'bqgempty';
        empty.innerHTML = '<div class="bqempty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bqempty-tx">No Messages Yet</div><div class="bqempty-sub">Be the first to say hello!</div>';
        msgsEl.appendChild(empty);
        gLastU = null;
        gLastT = 0;
      }
      toast('Chat cleared from your view');
    });
  }
  
  // Ensure initial view is active
  document.getElementById('bqv-chat').classList.add('bq-active');
  }

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();

})();
