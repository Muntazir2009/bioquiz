/**
 * BioQuiz Chat Widget v4
 * Drop-in: <script src="chat-widget.js"></script>
 *
 * v4 fixes & additions:
 *  ✓ No more keyboard pop on mobile (removed all auto-focus on touch)
 *  ✓ Fixed DM view-switching (robust state reset, no stuck views)
 *  ✓ DM any user anytime — new DM search modal, not limited to online
 *  ✓ Profile cards on avatar/username click (with rich presence display)
 *  ✓ Rich presence — status picker (Online/Studying/Playing/Away/Custom)
 *  ✓ Performance — bq_user_dms index instead of full bq_dms scan
 *  ✓ Mentions — @mention button in profile card inserts into input
 *
 * Firebase DB structure:
 *   bq_messages/                     — global chat
 *   bq_dms/{dmId}/messages/          — DM messages
 *   bq_dms/{dmId}/meta               — {p1,p2,n1,n2,lastMsg,lastTs,unread:{uid:n}}
 *   bq_presence/{uid}                — {uname,ts,status,customStatus}
 *   bq_typing/{uid}                  — global typing
 *   bq_dm_typing/{dmId}/{uid}        — dm typing
 *   bq_usernames/{name}              — username registry (name→uid)
 *   bq_user_dms/{uid}/{dmId}         — DM index per user (new v4)
 */
(function () {
'use strict';

/* ═══════════════════════════════════════════
   FIREBASE CONFIG  ← replace with yours
═══════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain: "bioquiz-chat.firebaseapp.com",
  databaseURL: "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bioquiz-chat",
  storageBucket: "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId: "1:616382882153:web:9c8a32401be847468d1df8"
};

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const MAX_MSG      = 120;
const CHAR_LIMIT   = 320;
const TYPING_TTL   = 3000;
const PRESENCE_TTL = 9000;
const LS_UID    = 'bq_chat_uid';
const LS_NAME   = 'bq_chat_uname';
const LS_SOUND  = 'bq_chat_sound';
const LS_STATUS = 'bq_chat_status';
const EMOJI_LIST = ['😊','😂','❤️','🔥','👍','🎉','😮','🧬','💯','🌍','👀','😢'];
const REACTIONS  = ['👍','❤️','😂','😮','🔥','🎉'];
const PALETTE = [
  '#60a5fa','#34d399','#f472b6','#fbbf24','#a78bfa','#fb923c',
  '#2dd4bf','#e879f9','#4ade80','#f87171','#38bdf8','#facc15',
];
const STATUS_OPTS = [
  {id:'online',    emoji:'🟢', label:'Online',           color:'#34d399'},
  {id:'studying',  emoji:'📚', label:'Studying',         color:'#60a5fa'},
  {id:'playing',   emoji:'🎮', label:'Playing BioQuiz',  color:'#a78bfa'},
  {id:'listening', emoji:'🎵', label:'Listening',        color:'#f472b6'},
  {id:'away',      emoji:'💤', label:'Away',             color:'#fbbf24'},
  {id:'custom',    emoji:'✏️', label:'Custom status…',   color:'#fb923c'},
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function uColor(n){ let h=0; for(let i=0;i<n.length;i++) h=(Math.imul(h,31)+n.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length]; }
function uInit(n){ return (n||'?').slice(0,2).toUpperCase(); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function linkify(s){ return s.replace(/(https?:\/\/[^\s<>"']{4,})/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); }
function timeStr(ts){ return new Date(ts).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true}); }
function dateStr(ts){
  const d=new Date(ts), td=new Date().toDateString(), yd=new Date(Date.now()-86400000).toDateString();
  if(d.toDateString()===td) return 'TODAY';
  if(d.toDateString()===yd) return 'YESTERDAY';
  return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase();
}
function dmId(a,b){ return [a,b].sort().join('__'); }
function genUID(){ const id='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36); localStorage.setItem(LS_UID,id); return id; }
function sanitizeUN(v){ return (v||'').toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20); }
function resize(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,96)+'px'; }
// Mobile detection — prevents keyboard popping on touch devices
function isMobile(){ return ('ontouchstart' in window) || navigator.maxTouchPoints>0 || window.innerWidth<768; }
function focusInput(el){ if(el && !isMobile()) el.focus(); }
function getStatusOpt(id){ return STATUS_OPTS.find(s=>s.id===id) || STATUS_OPTS[0]; }
function getMyStatusLabel(){
  const s = myStatusId==='custom' ? (myStatusCustom||'Custom') : getStatusOpt(myStatusId).label;
  return s;
}
function getMyStatusEmoji(){ return getStatusOpt(myStatusId).emoji; }
function getMyStatusColor(){ return getStatusOpt(myStatusId).color; }
function presenceStatusLabel(pres){
  if(!pres) return '';
  if(pres.statusId==='custom') return pres.customStatus||'Online';
  const o=getStatusOpt(pres.statusId||'online');
  return o.emoji+' '+o.label;
}

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;900&display=swap');

/* ── BUBBLE ── */
#bq-bub{
  position:fixed;bottom:28px;right:28px;z-index:9900;
  width:54px;height:54px;border-radius:50%;
  background:#fff;border:none;cursor:pointer;padding:0;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 28px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.14);
  transition:transform .28s cubic-bezier(.34,1.4,.64,1),box-shadow .25s;
  will-change:transform;
}
#bq-bub:hover{transform:scale(1.1);box-shadow:0 10px 40px rgba(0,0,0,.72);}
#bq-bub:active{transform:scale(.93);}
#bq-bub.open{background:#161616;}
.bq-ico{position:absolute;transition:opacity .22s,transform .22s;}
.bq-ico-chat{fill:#111;}
#bq-bub.open .bq-ico-chat{opacity:0;transform:scale(.6);}
.bq-ico-x{opacity:0;fill:none;stroke:rgba(255,255,255,.7);stroke-width:2.5;stroke-linecap:round;transform:scale(.6);}
#bq-bub.open .bq-ico-x{opacity:1;transform:scale(1);}
#bq-badge{
  position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;
  background:#f87171;border:2px solid #080808;
  font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 3px;
  animation:bqPop .3s cubic-bezier(.34,1.4,.64,1) both;
}
#bq-badge.show{display:flex;}
@keyframes bqPop{from{transform:scale(0)}to{transform:scale(1)}}

/* ── PANEL ── */
#bq-panel{
  position:fixed;bottom:94px;right:28px;z-index:9899;
  width:380px;height:580px;max-height:calc(100dvh - 108px);
  background:#0a0a0a;border:1px solid rgba(255,255,255,.1);
  border-radius:16px;display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 28px 90px rgba(0,0,0,.92),0 0 0 1px rgba(255,255,255,.04) inset;
  transform-origin:bottom right;
  transform:scale(.84) translateY(22px);opacity:0;pointer-events:none;
  transition:transform .34s cubic-bezier(.16,1,.3,1),opacity .28s ease;
  will-change:transform,opacity;
}
#bq-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}
#bq-panel::after{
  content:'';position:absolute;top:0;left:10%;width:80%;height:1px;pointer-events:none;
  background:linear-gradient(to right,transparent,rgba(255,255,255,.15),transparent);
}

/* ── SCREEN WRAPPER ── */
#bq-screen{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;}

/* ── VIEWS ── */
.bq-view{
  position:absolute;inset:0;display:flex;flex-direction:column;
  background:#0a0a0a;transition:transform .28s cubic-bezier(.16,1,.3,1),opacity .24s ease;
}
.bq-view.hidden{transform:translateX(100%);opacity:0;pointer-events:none;}
.bq-view.slide-left{transform:translateX(-28px);opacity:0;pointer-events:none;}

/* ── BOTTOM NAV ── */
#bq-nav{
  display:flex;border-top:1px solid rgba(255,255,255,.07);
  flex-shrink:0;background:#080808;
}
.bq-nav-btn{
  flex:1;padding:10px 4px 9px;background:none;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.44rem;font-weight:700;letter-spacing:.16em;
  color:rgba(255,255,255,.26);transition:color .2s;
  display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;
}
.bq-nav-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:stroke .2s;}
.bq-nav-btn.active{color:#fff;}
.bq-nav-btn.active::before{
  content:'';position:absolute;top:0;left:20%;width:60%;height:2px;
  background:#fff;border-radius:0 0 3px 3px;
}
.bq-nav-nbadge{
  position:absolute;top:6px;right:calc(50% - 16px);
  min-width:16px;height:16px;border-radius:8px;
  background:#f87171;font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 3px;
  border:2px solid #080808;
}
.bq-nav-nbadge.show{display:flex;}

/* ── HEADER ── */
.bq-hdr{
  display:flex;align-items:center;gap:8px;
  padding:11px 13px 10px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;
}
.bq-hdr-live{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 7px #34d399;flex-shrink:0;animation:bqLive 2.4s ease infinite;}
@keyframes bqLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.82)}}
.bq-hdr-title{font-family:'Rajdhani',sans-serif;font-size:.66rem;font-weight:900;letter-spacing:.16em;color:#fff;flex:1;}
.bq-hdr-sub{font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.08em;color:rgba(255,255,255,.24);margin-top:1px;}
.bq-hbtn{
  width:28px;height:28px;background:none;border:1px solid rgba(255,255,255,.09);border-radius:7px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;
}
.bq-hbtn:hover{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.06);}
.bq-hbtn.active{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.08);}
.bq-hbtn svg{width:13px;height:13px;stroke:rgba(255,255,255,.4);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;}
.bq-hbtn.active svg{stroke:#fff;}
.bq-back-btn{
  display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.48rem;font-weight:700;letter-spacing:.12em;
  color:rgba(255,255,255,.5);padding:0;transition:color .2s;
}
.bq-back-btn:hover{color:#fff;}
.bq-back-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}

/* ── DM HEADER USER INFO ── */
.bq-dm-hdr-av{
  width:30px;height:30px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:900;position:relative;
  cursor:pointer;transition:transform .2s;
}
.bq-dm-hdr-av:hover{transform:scale(1.08);}
.bq-dm-hdr-av::after{
  content:'';position:absolute;bottom:0;right:0;
  width:8px;height:8px;border-radius:50%;background:#555;border:2px solid #0a0a0a;
  transition:background .3s;
}
.bq-dm-hdr-av.online::after{background:#34d399;}
.bq-dm-hdr-info{flex:1;}
.bq-dm-hdr-name{font-family:'Rajdhani',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.06em;color:#fff;}
.bq-dm-hdr-status{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.06em;color:rgba(255,255,255,.28);margin-top:1px;}

/* ── MESSAGES ── */
.bq-msgs{
  flex:1;overflow-y:auto;padding:10px 10px 4px;
  display:flex;flex-direction:column;gap:1px;
  -webkit-overflow-scrolling:touch;
}
.bq-msgs::-webkit-scrollbar{width:3px;}
.bq-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:2px;}

.bq-datesep{
  display:flex;align-items:center;gap:8px;margin:10px 0 8px;
  font-family:'Rajdhani',sans-serif;font-size:.32rem;letter-spacing:.24em;color:rgba(255,255,255,.16);
}
.bq-datesep::before,.bq-datesep::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06);}
.bq-sys{
  text-align:center;padding:5px 0;margin:2px 0;
  font-family:'Rajdhani',sans-serif;font-size:.37rem;letter-spacing:.12em;color:rgba(255,255,255,.18);
  animation:bqUp .28s ease both;
}

/* Message row */
.bq-row{display:flex;flex-direction:column;gap:1px;animation:bqUp .25s cubic-bezier(.16,1,.3,1) both;padding:0 1px;}
@keyframes bqUp{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
.bq-row.mine{align-items:flex-end;}
.bq-row.theirs{align-items:flex-start;}
.bq-row-inner{display:flex;align-items:flex-end;gap:7px;max-width:90%;}
.bq-row.mine .bq-row-inner{flex-direction:row-reverse;}
.bq-row.consec .bq-row-inner .bq-av{visibility:hidden;}
.bq-row.consec{margin-top:-3px;}

/* Avatar */
.bq-av{
  width:26px;height:26px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:900;
  cursor:pointer;transition:transform .2s,box-shadow .2s;user-select:none;
}
.bq-av:hover{transform:scale(1.12);box-shadow:0 0 0 2px rgba(255,255,255,.2);}

/* Column */
.bq-col{display:flex;flex-direction:column;gap:2px;min-width:0;}

/* Meta */
.bq-meta{display:flex;align-items:baseline;gap:5px;padding:0 2px;margin-bottom:1px;}
.bq-row.consec .bq-meta{display:none;}
.bq-un{font-family:'Rajdhani',sans-serif;font-size:.43rem;font-weight:700;letter-spacing:.06em;cursor:pointer;}
.bq-un:hover{text-decoration:underline;}
.bq-ts{font-family:'Rajdhani',sans-serif;font-size:.32rem;color:rgba(255,255,255,.2);letter-spacing:.04em;}

/* Reply preview */
.bq-rp{
  border-left:3px solid rgba(255,255,255,.35);
  padding:4px 9px;margin-bottom:6px;
  border-radius:0 5px 5px 0;background:rgba(255,255,255,.08);
}
.bq-rp-nm{font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.6);}
.bq-rp-tx{font-family:'Rajdhani',sans-serif;font-size:.54rem;color:rgba(255,255,255,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;}
.bq-row.mine .bq-rp{background:rgba(0,0,0,.12);border-left-color:rgba(0,0,0,.35);}
.bq-row.mine .bq-rp-nm{color:rgba(0,0,0,.55);}
.bq-row.mine .bq-rp-tx{color:rgba(0,0,0,.45);}

/* Bubble */
.bq-bbl{
  padding:8px 12px;font-family:'Rajdhani',sans-serif;
  font-size:.72rem;font-weight:500;line-height:1.5;
  letter-spacing:.02em;word-break:break-word;
}
.bq-row.theirs .bq-bbl{
  background:#1c1c1c;border:1px solid rgba(255,255,255,.09);
  border-radius:2px 12px 12px 12px;color:rgba(255,255,255,.86);
}
.bq-row.mine .bq-bbl{background:#fff;color:#0a0a0a;border-radius:12px 2px 12px 12px;}
.bq-bbl a{color:#60a5fa;text-decoration:underline;text-decoration-color:rgba(96,165,250,.35);}
.bq-row.mine .bq-bbl a{color:#1d4ed8;}

/* Bubble wrap + hover actions */
.bq-bbl-wrap{position:relative;}
.bq-acts{
  position:absolute;top:-34px;display:none;align-items:center;gap:2px;
  background:#1e1e1e;border:1px solid rgba(255,255,255,.12);
  border-radius:9px;padding:3px 4px;box-shadow:0 6px 20px rgba(0,0,0,.55);
  z-index:10;white-space:nowrap;
}
.bq-row.mine .bq-acts{right:0;}
.bq-row.theirs .bq-acts{left:0;}
.bq-bbl-wrap:hover .bq-acts{display:flex;}
.bq-act{
  width:28px;height:28px;background:none;border:none;cursor:pointer;
  border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-size:14px;transition:background .15s;color:rgba(255,255,255,.45);
}
.bq-act:hover{background:rgba(255,255,255,.09);color:#fff;}
.bq-act svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bq-act.del:hover{background:rgba(248,113,113,.12);color:#f87171;}

/* Emoji reaction picker */
.bq-epick{
  position:absolute;top:-52px;display:none;gap:2px;flex-wrap:wrap;width:168px;
  background:#1e1e1e;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:5px 6px;
  box-shadow:0 8px 30px rgba(0,0,0,.6);z-index:15;
}
.bq-row.mine .bq-epick{right:0;}
.bq-row.theirs .bq-epick{left:0;}
.bq-epick.open{display:flex;}
.bq-epick-btn{
  width:28px;height:28px;background:none;border:none;cursor:pointer;
  border-radius:5px;font-size:15px;display:flex;align-items:center;justify-content:center;
  transition:background .14s,transform .14s;line-height:1;
}
.bq-epick-btn:hover{background:rgba(255,255,255,.1);transform:scale(1.22);}

/* Reactions */
.bq-rxns{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px;padding:0 2px;}
.bq-rxn{
  display:inline-flex;align-items:center;gap:3px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);
  border-radius:20px;padding:2px 7px;cursor:pointer;font-size:12px;transition:all .18s;
}
.bq-rxn:hover{background:rgba(255,255,255,.13);transform:scale(1.06);}
.bq-rxn.mine-r{background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.3);}
.bq-rxn-n{font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:700;color:rgba(255,255,255,.65);}

/* ── TYPING ── */
.bq-typing{
  min-height:20px;padding:0 14px 6px;flex-shrink:0;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.1em;
  color:rgba(255,255,255,.24);display:flex;align-items:center;gap:6px;
}
.bq-tdots{display:flex;gap:3px;align-items:center;}
.bq-tdots span{
  width:3.5px;height:3.5px;background:rgba(255,255,255,.28);border-radius:50%;
  animation:bqTd 1.1s ease infinite;
}
.bq-tdots span:nth-child(2){animation-delay:.18s;}
.bq-tdots span:nth-child(3){animation-delay:.36s;}
@keyframes bqTd{0%,60%,100%{transform:translateY(0);opacity:.28}30%{transform:translateY(-4px);opacity:1}}

/* ── REPLY BAR ── */
.bq-rbar{
  display:none;align-items:center;gap:8px;
  padding:7px 11px;background:rgba(255,255,255,.04);
  border-top:1px solid rgba(255,255,255,.06);flex-shrink:0;
}
.bq-rbar.show{display:flex;}
.bq-rb-ic{width:14px;height:14px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bq-rb-body{flex:1;min-width:0;}
.bq-rb-nm{font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.45);}
.bq-rb-tx{font-family:'Rajdhani',sans-serif;font-size:.5rem;color:rgba(255,255,255,.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bq-rb-x{
  width:22px;height:22px;background:none;border:1px solid rgba(255,255,255,.1);
  border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s;
}
.bq-rb-x:hover{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);}
.bq-rb-x svg{width:10px;height:10px;stroke:rgba(255,255,255,.4);fill:none;stroke-width:2.5;stroke-linecap:round;}

/* ── INPUT AREA ── */
.bq-inp-wrap{border-top:1px solid rgba(255,255,255,.07);padding:8px 10px 10px;flex-shrink:0;}
.bq-inp-row{display:flex;gap:7px;align-items:flex-end;}
.bq-etray{
  display:none;flex-wrap:wrap;gap:1px;padding:5px 3px;margin-bottom:7px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;
}
.bq-etray.open{display:flex;}
.bq-etbtn{
  width:30px;height:30px;background:none;border:none;cursor:pointer;border-radius:5px;
  font-size:16px;display:flex;align-items:center;justify-content:center;
  transition:background .14s,transform .14s;line-height:1;
}
.bq-etbtn:hover{background:rgba(255,255,255,.09);transform:scale(1.15);}
.bq-eopenbtn{
  width:34px;height:34px;background:none;border:1px solid rgba(255,255,255,.09);
  border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;font-size:16px;transition:all .2s;line-height:1;
}
.bq-eopenbtn:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.05);}
.bq-inp{
  flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  border-radius:9px;padding:9px 11px;color:#fff;
  font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.03em;
  resize:none;outline:none;min-height:38px;max-height:96px;line-height:1.45;
  transition:border-color .2s,background .2s;scrollbar-width:none;
}
.bq-inp::-webkit-scrollbar{display:none;}
.bq-inp::placeholder{color:rgba(255,255,255,.17);}
.bq-inp:focus{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
.bq-sendbtn{
  width:38px;height:38px;background:#fff;border:none;border-radius:9px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:all .22s cubic-bezier(.34,1.4,.64,1);
}
.bq-sendbtn:hover{transform:scale(1.08);box-shadow:0 4px 18px rgba(255,255,255,.2);}
.bq-sendbtn:active{transform:scale(.92);}
.bq-sendbtn:disabled{opacity:.22;cursor:not-allowed;transform:none;box-shadow:none;}
.bq-sendbtn svg{width:15px;height:15px;stroke:#000;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
.bq-inp-footer{display:flex;align-items:center;justify-content:space-between;margin-top:5px;}
.bq-cc{font-family:'Rajdhani',sans-serif;font-size:.34rem;letter-spacing:.1em;color:rgba(255,255,255,.14);transition:color .2s;}
.bq-cc.warn{color:#fbbf24;} .bq-cc.over{color:#f87171;}
.bq-inp-hint{font-family:'Rajdhani',sans-serif;font-size:.32rem;letter-spacing:.06em;color:rgba(255,255,255,.12);}

/* ── SCROLL BTN ── */
.bq-scrbtn{
  position:absolute;bottom:106px;right:14px;z-index:6;
  width:30px;height:30px;background:rgba(16,16,16,.96);
  border:1px solid rgba(255,255,255,.13);border-radius:50%;
  cursor:pointer;display:none;align-items:center;justify-content:center;
  box-shadow:0 4px 16px rgba(0,0,0,.5);transition:border-color .2s;
}
.bq-scrbtn.show{display:flex;animation:bqUp .2s ease both;}
.bq-scrbtn:hover{border-color:rgba(255,255,255,.26);}
.bq-scrbtn svg{width:14px;height:14px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}

/* ── EMPTY STATE ── */
.bq-empty{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:10px;padding-bottom:20px;animation:bqUp .4s ease both;
}
.bq-empty-ic{
  width:46px;height:46px;border-radius:12px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
  display:flex;align-items:center;justify-content:center;
}
.bq-empty-ic svg{width:20px;height:20px;stroke:rgba(255,255,255,.18);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
.bq-empty-tx{font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.2em;color:rgba(255,255,255,.15);}
.bq-empty-sub{font-family:'Rajdhani',sans-serif;font-size:.4rem;letter-spacing:.1em;color:rgba(255,255,255,.1);}

/* ── DM LIST ── */
#bq-view-dms .bq-hdr{border-bottom:1px solid rgba(255,255,255,.07);}
#bq-dmlist{flex:1;overflow-y:auto;padding:4px 0;}
#bq-dmlist::-webkit-scrollbar{width:3px;}
#bq-dmlist::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bq-dm-row{
  display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;
  transition:background .18s;position:relative;
}
.bq-dm-row:hover{background:rgba(255,255,255,.04);}
.bq-dm-row:active{background:rgba(255,255,255,.07);}
.bq-dm-av{
  width:38px;height:38px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.5rem;font-weight:900;position:relative;
}
.bq-dm-av::after{
  content:'';position:absolute;bottom:1px;right:1px;
  width:9px;height:9px;border-radius:50%;background:#333;border:2px solid #0a0a0a;transition:background .3s;
}
.bq-dm-av.online::after{background:#34d399;}
.bq-dm-info{flex:1;min-width:0;}
.bq-dm-name{font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.06em;color:#fff;}
.bq-dm-preview{
  font-family:'Rajdhani',sans-serif;font-size:.48rem;color:rgba(255,255,255,.3);
  letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;
}
.bq-dm-preview.unread{color:rgba(255,255,255,.65);font-weight:600;}
.bq-dm-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.bq-dm-time{font-family:'Rajdhani',sans-serif;font-size:.34rem;letter-spacing:.06em;color:rgba(255,255,255,.22);}
.bq-dm-ubadge{
  min-width:18px;height:18px;border-radius:9px;background:#f87171;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;color:#fff;
  display:flex;align-items:center;justify-content:center;padding:0 4px;
  animation:bqPop .25s cubic-bezier(.34,1.4,.64,1) both;
}
.bq-dm-divider{height:1px;background:rgba(255,255,255,.05);margin:0 13px;}

/* ── ONLINE USERS ── */
#bq-view-online .bq-hdr{border-bottom:1px solid rgba(255,255,255,.07);}
#bq-online-list{flex:1;overflow-y:auto;padding:4px 0;}
#bq-online-list::-webkit-scrollbar{width:3px;}
#bq-online-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bq-urow{
  display:flex;align-items:center;gap:10px;padding:9px 13px;cursor:pointer;transition:background .18s;
}
.bq-urow:hover{background:rgba(255,255,255,.04);}
.bq-urow.isme{cursor:default;}
.bq-urow.isme:hover{background:rgba(255,255,255,.03);}
.bq-urow:hover:not(.isme) .bq-udm-hint{opacity:1;}
.bq-uav{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.48rem;font-weight:900;position:relative;
}
.bq-uav::after{
  content:'';position:absolute;bottom:0;right:0;
  width:9px;height:9px;border-radius:50%;background:#34d399;border:2px solid #0a0a0a;
}
.bq-uinfo{flex:1;min-width:0;}
.bq-uu{font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.06em;color:#fff;display:flex;align-items:center;gap:5px;}
.bq-uyou{font-size:.32rem;letter-spacing:.12em;color:rgba(255,255,255,.28);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;}
.bq-ust{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.06em;color:rgba(255,255,255,.28);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bq-udm-hint{
  opacity:0;transition:opacity .2s;
  font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.1em;
  color:rgba(255,255,255,.3);background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);padding:3px 8px;border-radius:4px;
  flex-shrink:0;white-space:nowrap;
}

/* ── STATUS BAR (my own status, in online view) ── */
.bq-my-status-bar{
  display:flex;align-items:center;gap:8px;
  padding:8px 13px 9px;border-bottom:1px solid rgba(255,255,255,.06);
  flex-shrink:0;position:relative;
}
.bq-my-status-btn{
  display:flex;align-items:center;gap:7px;flex:1;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  border-radius:8px;padding:6px 10px;cursor:pointer;transition:all .2s;
}
.bq-my-status-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15);}
.bq-my-sdot{
  width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:background .3s;
}
.bq-my-slabel{
  font-family:'Rajdhani',sans-serif;font-size:.46rem;font-weight:600;letter-spacing:.08em;
  color:rgba(255,255,255,.55);flex:1;text-align:left;
}
.bq-my-sarrow{
  width:12px;height:12px;stroke:rgba(255,255,255,.25);fill:none;
  stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;
}

/* ── STATUS PICKER DROPDOWN ── */
.bq-status-picker{
  position:absolute;top:calc(100% + 4px);left:8px;right:8px;z-index:60;
  background:#1a1a1a;border:1px solid rgba(255,255,255,.13);
  border-radius:10px;padding:6px;
  box-shadow:0 14px 45px rgba(0,0,0,.85);
  display:none;animation:bqUp .18s ease both;
}
.bq-status-picker.open{display:block;}
.bq-sp-opt{
  display:flex;align-items:center;gap:9px;
  padding:8px 10px;border-radius:6px;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.06em;
  color:rgba(255,255,255,.55);transition:all .15s;
}
.bq-sp-opt:hover{background:rgba(255,255,255,.07);color:#fff;}
.bq-sp-opt.active{background:rgba(255,255,255,.06);color:#fff;}
.bq-sp-emoji{font-size:14px;width:20px;text-align:center;flex-shrink:0;}
.bq-sp-divider{height:1px;background:rgba(255,255,255,.07);margin:5px 0;}
.bq-sp-custom-wrap{padding:4px 6px 2px;}
.bq-sp-custom-inp{
  width:100%;box-sizing:border-box;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
  border-radius:6px;padding:7px 10px;color:#fff;
  font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.04em;
  outline:none;transition:border-color .2s;
}
.bq-sp-custom-inp:focus{border-color:rgba(255,255,255,.28);}
.bq-sp-custom-inp::placeholder{color:rgba(255,255,255,.2);}

/* ── PROFILE CARD ── */
#bq-profile-card{
  position:absolute;inset:0;z-index:50;
  background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  padding:20px;border-radius:16px;animation:bqFade .18s ease both;
}
@keyframes bqFade{from{opacity:0}to{opacity:1}}
.bq-pc-box{
  background:#141414;border:1px solid rgba(255,255,255,.11);
  border-radius:14px;padding:26px 20px 20px;width:100%;max-width:240px;
  text-align:center;position:relative;
  box-shadow:0 24px 70px rgba(0,0,0,.9);
  animation:bqUp .2s cubic-bezier(.16,1,.3,1) both;
}
.bq-pc-close{
  position:absolute;top:10px;right:10px;
  width:24px;height:24px;background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);border-radius:6px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:11px;color:rgba(255,255,255,.35);transition:all .18s;
}
.bq-pc-close:hover{background:rgba(255,255,255,.11);color:#fff;}
.bq-pc-av{
  width:64px;height:64px;border-radius:50%;margin:0 auto 14px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:900;
  position:relative;
}
.bq-pc-av::after{
  content:'';position:absolute;bottom:2px;right:2px;
  width:13px;height:13px;border-radius:50%;
  background:#444;border:2.5px solid #141414;transition:background .3s;
}
.bq-pc-av.online::after{background:#34d399;box-shadow:0 0 6px #34d399;}
.bq-pc-name{
  font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:700;
  letter-spacing:.06em;color:#fff;margin-bottom:5px;
}
.bq-pc-presence{
  font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.08em;
  color:rgba(255,255,255,.32);margin-bottom:18px;min-height:14px;
}
.bq-pc-actions{display:flex;gap:7px;}
.bq-pc-btn{
  flex:1;padding:9px 0;border-radius:7px;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.46rem;font-weight:700;letter-spacing:.1em;
  transition:all .2s;border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);
}
.bq-pc-btn:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2);}
.bq-pc-btn.primary{background:#fff;color:#0a0a0a;border-color:#fff;}
.bq-pc-btn.primary:hover{background:#e5e5e5;}

/* ── NEW DM MODAL (user search) ── */
#bq-ndm-modal{
  position:absolute;inset:0;z-index:45;
  background:rgba(0,0,0,.8);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  display:flex;flex-direction:column;
  border-radius:16px;animation:bqFade .18s ease both;
}
.bq-ndm-hdr{
  display:flex;align-items:center;gap:10px;
  padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;
}
.bq-ndm-title{
  font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.14em;color:#fff;flex:1;
}
.bq-ndm-close{
  width:26px;height:26px;background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.1);border-radius:6px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:12px;color:rgba(255,255,255,.4);transition:all .18s;
}
.bq-ndm-close:hover{background:rgba(255,255,255,.12);color:#fff;}
.bq-ndm-search{padding:10px 12px 8px;flex-shrink:0;}
.bq-ndm-inp{
  width:100%;box-sizing:border-box;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  border-radius:9px;padding:10px 13px;color:#fff;
  font-family:'Rajdhani',sans-serif;font-size:.65rem;font-weight:500;letter-spacing:.04em;
  outline:none;transition:border-color .2s,background .2s;
}
.bq-ndm-inp:focus{border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.09);}
.bq-ndm-inp::placeholder{color:rgba(255,255,255,.2);}
#bq-ndm-results{flex:1;overflow-y:auto;padding:4px 0;}
#bq-ndm-results::-webkit-scrollbar{width:3px;}
#bq-ndm-results::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bq-ndm-row{
  display:flex;align-items:center;gap:10px;padding:10px 14px;
  cursor:pointer;transition:background .18s;
}
.bq-ndm-row:hover{background:rgba(255,255,255,.05);}
.bq-ndm-av{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.48rem;font-weight:900;
}
.bq-ndm-info{flex:1;min-width:0;}
.bq-ndm-name{font-family:'Rajdhani',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.06em;color:#fff;}
.bq-ndm-status{font-family:'Rajdhani',sans-serif;font-size:.36rem;letter-spacing:.06em;color:rgba(255,255,255,.3);margin-top:2px;}
.bq-ndm-hint{
  padding:28px 20px;text-align:center;
  font-family:'Rajdhani',sans-serif;font-size:.44rem;letter-spacing:.16em;color:rgba(255,255,255,.15);
}
.bq-ndm-arrow{
  width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.bq-ndm-arrow svg{width:14px;height:14px;stroke:rgba(255,255,255,.22);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}

/* ── NAME MODAL ── */
#bq-nm-modal{
  position:absolute;inset:0;z-index:30;
  background:rgba(0,0,0,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;padding:20px;border-radius:16px;
  animation:bqFade .24s ease both;
}
.bq-nm-box{width:100%;max-width:272px;text-align:center;}
.bq-nm-av{
  width:56px;height:56px;border-radius:50%;margin:0 auto 16px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:900;
  background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.1);transition:all .3s;
}
.bq-nm-title{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;color:#fff;margin-bottom:4px;}
.bq-nm-sub{font-family:'Rajdhani',sans-serif;font-size:.46rem;letter-spacing:.16em;color:rgba(255,255,255,.28);margin-bottom:16px;}
.bq-nm-field{position:relative;margin-bottom:8px;}
.bq-nm-at{
  position:absolute;left:12px;top:50%;transform:translateY(-50%);
  font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:700;
  color:rgba(255,255,255,.32);pointer-events:none;user-select:none;
}
.bq-nm-inp{
  width:100%;box-sizing:border-box;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
  border-radius:9px;padding:11px 12px 11px 24px;
  color:#fff;font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:600;
  letter-spacing:.06em;outline:none;transition:border-color .2s,background .2s;
}
.bq-nm-inp:focus{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.09);}
.bq-nm-inp::placeholder{color:rgba(255,255,255,.2);}
.bq-nm-inp.ok{border-color:rgba(52,211,153,.4);}
.bq-nm-inp.tkn{border-color:rgba(248,113,113,.4);}
.bq-nm-inp.chk{border-color:rgba(251,191,36,.3);}
.bq-nm-st{font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.1em;color:rgba(255,255,255,.28);min-height:18px;margin-bottom:10px;}
.bq-nm-st.ok{color:#34d399;} .bq-nm-st.tkn{color:#f87171;} .bq-nm-st.chk{color:#fbbf24;}
.bq-nm-btn{
  width:100%;padding:12px;background:#fff;border:none;border-radius:9px;
  font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.18em;
  color:#0a0a0a;cursor:pointer;transition:all .2s;
}
.bq-nm-btn:hover{background:#e5e5e5;}
.bq-nm-btn:disabled{opacity:.3;cursor:not-allowed;}

/* ── TOAST ── */
#bq-toast{
  position:fixed;bottom:104px;left:50%;transform:translateX(-50%) translateY(12px);
  background:rgba(22,22,22,.97);border:1px solid rgba(255,255,255,.13);
  border-radius:20px;padding:7px 16px;z-index:9999;
  font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.12em;color:rgba(255,255,255,.8);
  opacity:0;transition:opacity .22s,transform .22s;pointer-events:none;white-space:nowrap;
}
#bq-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* ── MOBILE ── */
@media(max-width:480px){
  #bq-panel{right:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:none;transform-origin:bottom center;}
  #bq-bub{bottom:18px;right:18px;}
}
`;

/* ═══════════════════════════════════════════
   HTML TEMPLATE
═══════════════════════════════════════════ */
const HTML = `
<!-- Bubble -->
<button id="bq-bub" aria-label="Open chat">
  <svg viewBox="0 0 24 24" class="bq-ico bq-ico-chat" width="22" height="22">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <svg viewBox="0 0 24 24" class="bq-ico bq-ico-x" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
  <div id="bq-badge"></div>
</button>

<!-- Panel -->
<div id="bq-panel" role="dialog" aria-label="BioQuiz Chat">

  <!-- Name modal -->
  <div id="bq-nm-modal" style="display:none">
    <div class="bq-nm-box">
      <div class="bq-nm-av" id="bq-nm-av">?</div>
      <div class="bq-nm-title">PICK A USERNAME</div>
      <div class="bq-nm-sub">UNIQUE · SHOWN AS @USERNAME</div>
      <div class="bq-nm-field">
        <span class="bq-nm-at">@</span>
        <input id="bq-nm-inp" class="bq-nm-inp" type="text"
          placeholder="username" maxlength="20"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>
      <div class="bq-nm-st" id="bq-nm-st"></div>
      <button class="bq-nm-btn" id="bq-nm-btn" disabled>JOIN CHAT</button>
    </div>
  </div>

  <!-- Profile card overlay -->
  <div id="bq-profile-card" style="display:none">
    <div class="bq-pc-box">
      <button class="bq-pc-close" id="bq-pc-close">✕</button>
      <div class="bq-pc-av" id="bq-pc-av"></div>
      <div class="bq-pc-name" id="bq-pc-name"></div>
      <div class="bq-pc-presence" id="bq-pc-presence"></div>
      <div class="bq-pc-actions" id="bq-pc-actions"></div>
    </div>
  </div>

  <!-- New DM search modal -->
  <div id="bq-ndm-modal" style="display:none">
    <div class="bq-ndm-hdr">
      <div class="bq-ndm-title">NEW MESSAGE</div>
      <button class="bq-ndm-close" id="bq-ndm-close">✕</button>
    </div>
    <div class="bq-ndm-search">
      <input id="bq-ndm-inp" class="bq-ndm-inp"
        placeholder="Search by username…" maxlength="20"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
    </div>
    <div id="bq-ndm-results">
      <div class="bq-ndm-hint">TYPE A USERNAME TO SEARCH</div>
    </div>
  </div>

  <!-- Screen wrapper (all views live here) -->
  <div id="bq-screen">

    <!-- VIEW: Global Chat -->
    <div class="bq-view" id="bq-view-chat">
      <div class="bq-hdr">
        <div class="bq-hdr-live"></div>
        <div><div class="bq-hdr-title">GLOBAL CHAT</div></div>
        <button class="bq-hbtn" id="bq-sound-btn" title="Sound">
          <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <button class="bq-hbtn" id="bq-ren-btn" title="Change username">
          <svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
      </div>
      <div class="bq-msgs" id="bq-global-msgs">
        <div class="bq-empty" id="bq-global-empty">
          <div class="bq-empty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="bq-empty-tx">NO MESSAGES YET</div>
          <div class="bq-empty-sub">SAY HELLO 👋</div>
        </div>
      </div>
      <div class="bq-typing" id="bq-global-typing"></div>
      <button class="bq-scrbtn" id="bq-global-scr">
        <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
      </button>
      <div class="bq-rbar" id="bq-global-rbar">
        <svg class="bq-rb-ic" viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        <div class="bq-rb-body">
          <div class="bq-rb-nm" id="bq-global-rb-nm"></div>
          <div class="bq-rb-tx" id="bq-global-rb-tx"></div>
        </div>
        <button class="bq-rb-x" id="bq-global-rb-x">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="bq-inp-wrap">
        <div class="bq-etray" id="bq-global-etray"></div>
        <div class="bq-inp-row">
          <button class="bq-eopenbtn" id="bq-global-eo" title="Emoji">😊</button>
          <textarea id="bq-global-inp" class="bq-inp" placeholder="Message everyone…" rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bq-sendbtn" id="bq-global-send" disabled>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div class="bq-inp-footer">
          <div class="bq-cc" id="bq-global-cc"></div>
          <div class="bq-inp-hint">ENTER send · SHIFT+ENTER newline</div>
        </div>
      </div>
    </div>

    <!-- VIEW: DM List -->
    <div class="bq-view hidden" id="bq-view-dms">
      <div class="bq-hdr">
        <div class="bq-hdr-live"></div>
        <div class="bq-hdr-title">DIRECT MESSAGES</div>
        <button class="bq-hbtn" id="bq-dm-new-btn" title="New DM — search any user">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div id="bq-dmlist">
        <div class="bq-empty" id="bq-dm-empty" style="margin-top:40px">
          <div class="bq-empty-ic">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="bq-empty-tx">NO DMs YET</div>
          <div class="bq-empty-sub">TAP + TO MESSAGE ANYONE</div>
        </div>
      </div>
    </div>

    <!-- VIEW: DM Conversation -->
    <div class="bq-view hidden" id="bq-view-dm-convo">
      <div class="bq-hdr">
        <button class="bq-back-btn" id="bq-dm-back">
          <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>
          BACK
        </button>
        <div class="bq-dm-hdr-av" id="bq-dm-hdr-av"></div>
        <div class="bq-dm-hdr-info">
          <div class="bq-dm-hdr-name" id="bq-dm-hdr-name"></div>
          <div class="bq-dm-hdr-status" id="bq-dm-hdr-status">Offline</div>
        </div>
      </div>
      <div class="bq-msgs" id="bq-dm-msgs">
        <div class="bq-empty" id="bq-dm-msgs-empty">
          <div class="bq-empty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="bq-empty-tx">START A CONVERSATION</div>
          <div class="bq-empty-sub" id="bq-dm-msgs-sub"></div>
        </div>
      </div>
      <div class="bq-typing" id="bq-dm-typing"></div>
      <button class="bq-scrbtn" id="bq-dm-scr">
        <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
      </button>
      <div class="bq-rbar" id="bq-dm-rbar">
        <svg class="bq-rb-ic" viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        <div class="bq-rb-body">
          <div class="bq-rb-nm" id="bq-dm-rb-nm"></div>
          <div class="bq-rb-tx" id="bq-dm-rb-tx"></div>
        </div>
        <button class="bq-rb-x" id="bq-dm-rb-x">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="bq-inp-wrap">
        <div class="bq-etray" id="bq-dm-etray"></div>
        <div class="bq-inp-row">
          <button class="bq-eopenbtn" id="bq-dm-eo" title="Emoji">😊</button>
          <textarea id="bq-dm-inp" class="bq-inp" placeholder="Message…" rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bq-sendbtn" id="bq-dm-send" disabled>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div class="bq-inp-footer">
          <div class="bq-cc" id="bq-dm-cc"></div>
          <div class="bq-inp-hint">ENTER send · SHIFT+ENTER newline</div>
        </div>
      </div>
    </div>

    <!-- VIEW: Online Users -->
    <div class="bq-view hidden" id="bq-view-online">
      <div class="bq-hdr">
        <div class="bq-hdr-live"></div>
        <div class="bq-hdr-title">ONLINE NOW</div>
        <span id="bq-online-count" style="font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.1em;color:rgba(255,255,255,.3);"></span>
      </div>
      <!-- My status bar -->
      <div class="bq-my-status-bar" id="bq-status-bar" style="display:none">
        <button class="bq-my-status-btn" id="bq-my-status-btn">
          <div class="bq-my-sdot" id="bq-my-sdot" style="background:#34d399"></div>
          <span class="bq-my-slabel" id="bq-my-slabel">Online</span>
          <svg class="bq-my-sarrow" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
        </button>
        <div class="bq-status-picker" id="bq-status-picker"></div>
      </div>
      <div id="bq-online-list"></div>
    </div>

  </div><!-- /bq-screen -->

  <!-- Bottom nav -->
  <div id="bq-nav">
    <button class="bq-nav-btn active" data-view="chat" onclick="bqNav('chat')">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      CHAT
    </button>
    <button class="bq-nav-btn" data-view="dms" onclick="bqNav('dms')">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/></svg>
      DMs
      <div class="bq-nav-nbadge" id="bq-dm-nbadge"></div>
    </button>
    <button class="bq-nav-btn" data-view="online" onclick="bqNav('online')">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ONLINE
      <div class="bq-nav-nbadge" id="bq-online-nbadge"></div>
    </button>
  </div>

</div><!-- /bq-panel -->
<div id="bq-toast"></div>
`;

/* ═══════════════════════════════════════════
   INJECT
═══════════════════════════════════════════ */
const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);
const _wrap = document.createElement('div');
_wrap.innerHTML = HTML;
document.body.appendChild(_wrap);

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let db             = null;
let uid            = localStorage.getItem(LS_UID) || genUID();
let uname          = localStorage.getItem(LS_NAME) || '';
let soundOn        = localStorage.getItem(LS_SOUND) !== 'off';
let myStatusId     = localStorage.getItem(LS_STATUS) || 'online';
let myStatusCustom = localStorage.getItem(LS_STATUS+'_custom') || '';
let isOpen         = false;
let globalUnread   = 0;
let dmUnread       = {};   // dmId -> count
let onlineUsers    = {};   // uid -> {uname,ts,statusId,customStatus}
let activeView     = 'chat';
let toastT         = null;
let nmCkT          = null;
let presInt        = null;
// DM state
let activeDmId     = null;
let activeDmPuid   = null;
let activeDmPname  = null;
let dmMeta         = {};   // dmId -> meta obj
let dmListeners    = {};   // dmId -> firebase ref
let dmMetaRefs     = {};   // dmId -> meta ref
let dmTypingRef    = null;
let globalReply    = null;
let dmReply        = null;
let globalTypT     = null;
let dmTypT         = null;
let isGlobalTyping = false;
let isDmTyping     = false;
let gAtBottom      = true;
let dAtBottom      = true;
let gLastUID=null, gLastTS=0;
let dLastUID=null, dLastTS=0;
// Profile card state
let pcTargetUid    = null;
let pcTargetUname  = null;
// Status picker
let statusPickerOpen = false;
// Search debounce
let searchT        = null;

/* ═══════════════════════════════════════════
   AUDIO
═══════════════════════════════════════════ */
let aCtx = null;
function ping(freq=880) {
  if (!soundOn) return;
  try {
    if (!aCtx) aCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o=aCtx.createOscillator(), g=aCtx.createGain();
    o.connect(g); g.connect(aCtx.destination);
    o.type='sine';
    o.frequency.setValueAtTime(freq, aCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq*0.75, aCtx.currentTime+.12);
    g.gain.setValueAtTime(.09, aCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, aCtx.currentTime+.28);
    o.start(); o.stop(aCtx.currentTime+.3);
  } catch(_){}
}

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
window.bqNav = function(view) {
  if (view === activeView && view !== 'dms') return;
  // If currently in dm-convo, go back to dms list properly
  if (activeView === 'dm-convo') {
    const convo = document.getElementById('bq-view-dm-convo');
    convo.classList.add('hidden'); convo.classList.remove('slide-left');
  }
  const prev = (activeView && activeView !== 'dm-convo')
    ? document.getElementById('bq-view-' + activeView) : null;
  const next = document.getElementById('bq-view-' + view);
  if (!next) return;
  if (prev && prev !== next) { prev.classList.add('slide-left'); }
  next.classList.remove('hidden','slide-left');
  if (prev && prev !== next) {
    setTimeout(()=>{ prev.classList.add('hidden'); prev.classList.remove('slide-left'); }, 280);
  }
  activeView = view;
  document.querySelectorAll('.bq-nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  // No auto-focus on mobile — prevents keyboard popup
  if (view==='chat' && !isMobile()) {
    const inp=document.getElementById('bq-global-inp'); if(inp) inp.focus();
  }
};

/* ═══════════════════════════════════════════
   SHOW DM CONVERSATION  (fixed: no stuck state)
═══════════════════════════════════════════ */
function showDmConvo(partnerUid, partnerUname) {
  const newDmId = dmId(uid, partnerUid);

  // If this exact DM is already open, just ensure the convo view is visible
  const alreadyOpen = (activeDmId === newDmId && activeView === 'dm-convo');

  activeDmId    = newDmId;
  activeDmPuid  = partnerUid;
  activeDmPname = partnerUname;
  if (!alreadyOpen) { dLastUID=null; dLastTS=0; dAtBottom=true; }

  // Update DM header
  const av = document.getElementById('bq-dm-hdr-av');
  const c  = uColor(partnerUname);
  av.style.background = c; av.style.color='#000';
  av.textContent = uInit(partnerUname);
  av.className = 'bq-dm-hdr-av' + (onlineUsers[partnerUid] ? ' online' : '');
  document.getElementById('bq-dm-hdr-name').textContent = '@' + partnerUname;
  document.getElementById('bq-dm-hdr-status').textContent = onlineUsers[partnerUid]
    ? presenceStatusLabel(onlineUsers[partnerUid]) || 'Online now'
    : 'Offline';
  document.getElementById('bq-dm-msgs-sub').textContent = '@' + partnerUname;

  if (!alreadyOpen) {
    // Clear messages
    const msgs = document.getElementById('bq-dm-msgs');
    msgs.innerHTML = '';
    const empty = document.createElement('div');
    empty.className='bq-empty'; empty.id='bq-dm-msgs-empty';
    empty.innerHTML=`<div class="bq-empty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bq-empty-tx">START A CONVERSATION</div><div class="bq-empty-sub">@${esc(partnerUname)}</div>`;
    msgs.appendChild(empty);

    // Detach previous DM listeners
    Object.entries(dmListeners).forEach(([id, ref]) => { if(id!==activeDmId){ ref.off(); delete dmListeners[id]; } });

    // Subscribe to this DM's messages
    if (db && !dmListeners[activeDmId]) {
      const ref = db.ref('bq_dms/'+activeDmId+'/messages').limitToLast(MAX_MSG);
      ref.on('child_added', s=>renderMsg('dm', s.val(), s.key));
      ref.on('child_changed', s=>onMsgChanged('dm', s));
      ref.on('child_removed', s=>{ document.getElementById('bqm-dm-'+s.key)?.remove(); });
      dmListeners[activeDmId] = ref;
    }
  }

  // Subscribe DM typing
  if (dmTypingRef) dmTypingRef.off();
  if (db) {
    dmTypingRef = db.ref('bq_dm_typing/'+activeDmId);
    dmTypingRef.on('value', snap=>{
      const now=Date.now(), typers=[];
      snap.forEach(c=>{ const d=c.val(); if(c.key!==uid&&d&&now-d.ts<3800) typers.push('@'+(d.uname||'?')); });
      const el=document.getElementById('bq-dm-typing'); if(!el) return;
      if(!typers.length){el.innerHTML='';return;}
      el.innerHTML=`<div class="bq-tdots"><span></span><span></span><span></span></div><span>${typers.join(' & ')} typing</span>`;
    });
  }

  // Mark DM as read
  if (db && dmUnread[activeDmId]) {
    db.ref('bq_dms/'+activeDmId+'/meta/unread/'+uid).set(0);
    dmUnread[activeDmId] = 0;
    updateDmBadges();
  }

  // === ROBUST view switching — hide everything, show dm-convo ===
  ['chat','dms','online'].forEach(v=>{
    const el=document.getElementById('bq-view-'+v);
    if(el){ el.classList.add('hidden'); el.classList.remove('slide-left'); }
  });
  const convo = document.getElementById('bq-view-dm-convo');
  convo.classList.remove('hidden','slide-left');
  activeView = 'dm-convo';
  document.querySelectorAll('.bq-nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view==='dms'));

  // Click DM header avatar → profile card
  const hdrAv = document.getElementById('bq-dm-hdr-av');
  hdrAv.onclick = () => showProfileCard(partnerUid, partnerUname);

  // Focus only on desktop
  setTimeout(()=>{ focusInput(document.getElementById('bq-dm-inp')); }, 80);
}

/* ═══════════════════════════════════════════
   PROFILE CARD
═══════════════════════════════════════════ */
function showProfileCard(targetUid, targetUname) {
  pcTargetUid   = targetUid;
  pcTargetUname = targetUname;

  const card = document.getElementById('bq-profile-card');
  const av   = document.getElementById('bq-pc-av');
  const nm   = document.getElementById('bq-pc-name');
  const pr   = document.getElementById('bq-pc-presence');
  const acts = document.getElementById('bq-pc-actions');

  const c = uColor(targetUname);
  av.style.background = c; av.style.color = '#000';
  av.textContent = uInit(targetUname);
  const isOnline = !!onlineUsers[targetUid];
  av.className = 'bq-pc-av' + (isOnline ? ' online' : '');
  nm.textContent = '@' + targetUname;

  // Rich presence
  const pres = onlineUsers[targetUid];
  if (isOnline && pres) {
    const lbl = presenceStatusLabel(pres);
    pr.textContent = lbl || '🟢 Online';
  } else {
    pr.textContent = 'Offline';
  }

  // Actions
  acts.innerHTML = '';
  const isSelf = (targetUid === uid);

  if (!isSelf) {
    const dmBtn = document.createElement('button');
    dmBtn.className = 'bq-pc-btn primary';
    dmBtn.textContent = 'DM';
    dmBtn.addEventListener('click', ()=>{
      hideProfileCard();
      showDmConvo(targetUid, targetUname);
    });

    const mentionBtn = document.createElement('button');
    mentionBtn.className = 'bq-pc-btn';
    mentionBtn.textContent = '@MENTION';
    mentionBtn.addEventListener('click', ()=>{
      hideProfileCard();
      // Insert @mention into whichever input is active
      const inpId = (activeView==='dm-convo') ? 'bq-dm-inp' : 'bq-global-inp';
      const inp = document.getElementById(inpId);
      if (inp) {
        const mention = '@'+targetUname+' ';
        inp.value = (inp.value + mention).trimStart();
        inp.dispatchEvent(new Event('input'));
        inp.focus();
      }
    });
    acts.appendChild(dmBtn);
    acts.appendChild(mentionBtn);
  } else {
    // Self — show rename button
    const renBtn = document.createElement('button');
    renBtn.className = 'bq-pc-btn';
    renBtn.textContent = 'RENAME';
    renBtn.addEventListener('click', ()=>{ hideProfileCard(); showModal(true); });
    acts.appendChild(renBtn);
  }

  card.style.display = 'flex';
}

function hideProfileCard() {
  document.getElementById('bq-profile-card').style.display = 'none';
  pcTargetUid = null; pcTargetUname = null;
}

/* ═══════════════════════════════════════════
   NEW DM SEARCH MODAL
═══════════════════════════════════════════ */
function openNewDmModal() {
  const modal = document.getElementById('bq-ndm-modal');
  const inp   = document.getElementById('bq-ndm-inp');
  modal.style.display = 'flex';
  inp.value = '';
  document.getElementById('bq-ndm-results').innerHTML = '<div class="bq-ndm-hint">TYPE A USERNAME TO SEARCH</div>';
  // Slight delay to avoid triggering mobile keyboard on the wrong element
  setTimeout(()=>{ if(!isMobile()) inp.focus(); }, 80);
}

function closeNewDmModal() {
  document.getElementById('bq-ndm-modal').style.display = 'none';
}

async function searchUsers(query) {
  const q = sanitizeUN(query);
  const resultsEl = document.getElementById('bq-ndm-results');
  if (!q || q.length < 1) {
    resultsEl.innerHTML = '<div class="bq-ndm-hint">TYPE A USERNAME TO SEARCH</div>';
    return;
  }
  resultsEl.innerHTML = '<div class="bq-ndm-hint">SEARCHING…</div>';
  if (!db) { resultsEl.innerHTML = '<div class="bq-ndm-hint">NOT CONNECTED YET</div>'; return; }
  try {
    const snap = await db.ref('bq_usernames')
      .orderByKey()
      .startAt(q)
      .endAt(q+'\uf8ff')
      .limitToFirst(10)
      .once('value');
    const results = [];
    snap.forEach(c=>{ if(c.val()!==uid) results.push({name:c.key, puid:c.val()}); });
    if (!results.length) {
      resultsEl.innerHTML = '<div class="bq-ndm-hint">NO USERS FOUND</div>'; return;
    }
    resultsEl.innerHTML = '';
    results.forEach(({name, puid})=>{
      const isOnline = !!onlineUsers[puid];
      const c = uColor(name);
      const row = document.createElement('div');
      row.className = 'bq-ndm-row';
      row.innerHTML = `
        <div class="bq-ndm-av" style="background:${c};color:#000">${uInit(name)}</div>
        <div class="bq-ndm-info">
          <div class="bq-ndm-name">@${esc(name)}</div>
          <div class="bq-ndm-status">${isOnline ? '🟢 Online' : '⚫ Offline'}</div>
        </div>
        <div class="bq-ndm-arrow"><svg viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg></div>`;
      row.addEventListener('click', ()=>{
        closeNewDmModal();
        if(!uname){showModal(false);return;}
        showDmConvo(puid, name);
      });
      resultsEl.appendChild(row);
    });
  } catch(e) {
    console.warn('[BioQuiz Chat] search error', e);
    resultsEl.innerHTML = '<div class="bq-ndm-hint">SEARCH FAILED</div>';
  }
}

/* ═══════════════════════════════════════════
   STATUS PICKER
═══════════════════════════════════════════ */
function buildStatusPicker() {
  const picker = document.getElementById('bq-status-picker');
  picker.innerHTML = '';
  STATUS_OPTS.forEach(opt=>{
    const el = document.createElement('div');
    el.className = 'bq-sp-opt' + (myStatusId===opt.id ? ' active' : '');
    el.innerHTML = `<span class="bq-sp-emoji">${opt.emoji}</span>${opt.label}`;
    if (opt.id === 'custom') {
      el.addEventListener('click', ()=>{
        // show text input
        const wrap = document.createElement('div');
        wrap.className = 'bq-sp-custom-wrap';
        const cinp = document.createElement('input');
        cinp.className = 'bq-sp-custom-inp';
        cinp.type = 'text';
        cinp.maxLength = 40;
        cinp.placeholder = 'What are you up to?';
        cinp.value = myStatusCustom;
        cinp.addEventListener('keydown', e=>{
          if(e.key==='Enter'){
            const v=cinp.value.trim();
            setMyStatus('custom', v||'Custom');
            closeStatusPicker();
          }
          if(e.key==='Escape') closeStatusPicker();
        });
        // Replace options with input
        picker.innerHTML = '<div class="bq-sp-opt" id="bq-sp-back">← BACK</div><div class="bq-sp-divider"></div>';
        picker.querySelector('#bq-sp-back').addEventListener('click',()=>buildStatusPicker());
        wrap.appendChild(cinp);
        picker.appendChild(wrap);
        setTimeout(()=>cinp.focus(),60);
      });
    } else {
      el.addEventListener('click', ()=>{
        setMyStatus(opt.id);
        closeStatusPicker();
      });
    }
    picker.appendChild(el);
  });
}

function openStatusPicker() {
  buildStatusPicker();
  document.getElementById('bq-status-picker').classList.add('open');
  statusPickerOpen = true;
}
function closeStatusPicker() {
  document.getElementById('bq-status-picker').classList.remove('open');
  statusPickerOpen = false;
}
function toggleStatusPicker() {
  if(statusPickerOpen) closeStatusPicker(); else openStatusPicker();
}

function setMyStatus(statusId, customText) {
  myStatusId = statusId;
  myStatusCustom = customText||'';
  localStorage.setItem(LS_STATUS, myStatusId);
  localStorage.setItem(LS_STATUS+'_custom', myStatusCustom);
  updateStatusBar();
  // Push updated presence
  if(db && uname) {
    const opt = getStatusOpt(myStatusId);
    db.ref('bq_presence/'+uid).update({
      statusId: myStatusId,
      customStatus: myStatusCustom,
      ts: Date.now(),
    });
  }
}

function updateStatusBar() {
  const opt = getStatusOpt(myStatusId);
  const sdot  = document.getElementById('bq-my-sdot');
  const slabel= document.getElementById('bq-my-slabel');
  if(sdot) sdot.style.background = opt.color;
  if(slabel) slabel.textContent = (myStatusId==='custom'&&myStatusCustom) ? myStatusCustom : opt.label;
}

/* ═══════════════════════════════════════════
   FIREBASE
═══════════════════════════════════════════ */
function loadSDK(){
  return new Promise((res,rej)=>{
    let done=0;
    ['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
     'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js'].forEach(u=>{
      const s=document.createElement('script'); s.src=u;
      s.onload=()=>{if(++done===2)res();}; s.onerror=rej;
      document.head.appendChild(s);
    });
  });
}

async function startDB(){
  if(db) return;
  try {
    await loadSDK();
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    subscribeGlobal();
    subscribeGlobalTyping();
    startPresence();
    subscribeDmList();
  } catch(e){ console.warn('[BioQuiz Chat]',e); }
}

/* ═══════════════════════════════════════════
   USERNAME REGISTRY
═══════════════════════════════════════════ */
function ckUN(raw){
  const name=sanitizeUN(raw);
  const inp=document.getElementById('bq-nm-inp');
  const st=document.getElementById('bq-nm-st');
  const btn=document.getElementById('bq-nm-btn');
  const av=document.getElementById('bq-nm-av');
  if(inp.value!==name) inp.value=name;
  if(name){const c=uColor(name);av.style.background=c;av.style.color='#000';av.textContent=uInit(name);}
  else{av.style.background='rgba(255,255,255,.1)';av.textContent='?';}
  if(!name||name.length<2){st.textContent=name.length===1?'Min 2 characters':'';st.className='bq-nm-st';inp.className='bq-nm-inp';btn.disabled=true;return;}
  if(name===uname){st.textContent='✓ Your current username';st.className='bq-nm-st ok';inp.className='bq-nm-inp ok';btn.disabled=false;return;}
  clearTimeout(nmCkT);
  st.textContent='Checking…';st.className='bq-nm-st chk';inp.className='bq-nm-inp chk';btn.disabled=true;
  nmCkT=setTimeout(async()=>{
    if(!db){st.textContent='✓ Available!';st.className='bq-nm-st ok';inp.className='bq-nm-inp ok';btn.disabled=false;return;}
    try{
      const s=await db.ref('bq_usernames/'+name).once('value');
      const o=s.val();
      if(o&&o!==uid){st.textContent='@'+name+' is taken';st.className='bq-nm-st tkn';inp.className='bq-nm-inp tkn';btn.disabled=true;}
      else{st.textContent='✓ @'+name+' is free!';st.className='bq-nm-st ok';inp.className='bq-nm-inp ok';btn.disabled=false;}
    }catch(_){st.textContent='✓ Looks good';st.className='bq-nm-st ok';btn.disabled=false;}
  },480);
}

async function claimUN(name){
  if(!db) return;
  if(uname&&uname!==name) await db.ref('bq_usernames/'+uname).remove().catch(()=>{});
  await db.ref('bq_usernames/'+name).set(uid).catch(()=>{});
}

/* ═══════════════════════════════════════════
   NAME MODAL
═══════════════════════════════════════════ */
function showModal(rename){
  const m=document.getElementById('bq-nm-modal');
  const inp=document.getElementById('bq-nm-inp');
  const btn=document.getElementById('bq-nm-btn');
  const st=document.getElementById('bq-nm-st');
  m.style.display='flex';
  inp.value=rename?(uname||''):'';
  btn.textContent=rename?'UPDATE USERNAME':'JOIN CHAT';
  btn.disabled=true; st.textContent=''; st.className='bq-nm-st';
  inp.className='bq-nm-inp';
  const av=document.getElementById('bq-nm-av');
  if(rename&&uname){av.style.background=uColor(uname);av.textContent=uInit(uname);ckUN(uname);}
  else{av.style.background='rgba(255,255,255,.1)';av.textContent='?';}
  setTimeout(()=>inp.focus(),60); // Modal input always gets focus — user explicitly opened it
}
function hideModal(){ document.getElementById('bq-nm-modal').style.display='none'; }

async function submitName(){
  const name=sanitizeUN(document.getElementById('bq-nm-inp').value);
  if(!name||name.length<2) return;
  const btn=document.getElementById('bq-nm-btn');
  btn.disabled=true; btn.textContent='JOINING…';
  const isFirst=!uname, oldName=uname;
  await startDB();
  if(db&&name!==uname){
    try{
      const s=await db.ref('bq_usernames/'+name).once('value');
      const o=s.val();
      if(o&&o!==uid){
        document.getElementById('bq-nm-st').textContent='@'+name+' was just taken!';
        document.getElementById('bq-nm-st').className='bq-nm-st tkn';
        btn.disabled=false; btn.textContent='JOIN CHAT'; return;
      }
    }catch(_){}
  }
  await claimUN(name);
  uname=name; localStorage.setItem(LS_NAME,uname);
  hideModal(); startPresence();
  if(isFirst) sendSys('bq_messages','@'+uname+' joined the chat 👋');
  else if(oldName&&oldName!==uname) sendSys('bq_messages','@'+oldName+' is now @'+uname);
  btn.textContent='JOIN CHAT'; btn.disabled=false;
}

/* ═══════════════════════════════════════════
   PRESENCE  (includes rich presence status)
═══════════════════════════════════════════ */
function startPresence(){
  if(!db||!uname) return;
  const ref=db.ref('bq_presence/'+uid);
  const beat=()=>ref.set({
    uname,
    ts: Date.now(),
    statusId: myStatusId,
    customStatus: myStatusCustom,
  });
  beat(); clearInterval(presInt);
  presInt=setInterval(beat, PRESENCE_TTL*.7);
  ref.onDisconnect().remove();

  // Show status bar when we have a username
  const bar = document.getElementById('bq-status-bar');
  if(bar) bar.style.display='flex';
  updateStatusBar();

  db.ref('bq_presence').on('value',snap=>{
    const now=Date.now(); onlineUsers={};
    snap.forEach(c=>{
      const d=c.val();
      if(d&&now-d.ts<PRESENCE_TTL*1.6) onlineUsers[c.key]=d;
      else c.ref.remove();
    });
    renderOnlineList();
    updateDmHdrStatus();
    const n=Object.keys(onlineUsers).length;
    const el=document.getElementById('bq-online-count');
    if(el) el.textContent=n+' online';
    const nb=document.getElementById('bq-online-nbadge');
    if(nb&&n>0){nb.textContent=n;nb.classList.add('show');}
    else if(nb) nb.classList.remove('show');
  });
}

function updateDmHdrStatus(){
  if(activeView!=='dm-convo'||!activeDmPuid) return;
  const isOnline=!!onlineUsers[activeDmPuid];
  const pres = onlineUsers[activeDmPuid];
  const av=document.getElementById('bq-dm-hdr-av');
  const st=document.getElementById('bq-dm-hdr-status');
  if(av) av.className='bq-dm-hdr-av'+(isOnline?' online':'');
  if(st) st.textContent = isOnline
    ? (presenceStatusLabel(pres)||'Online now')
    : 'Offline';
}

function renderOnlineList(){
  const list=document.getElementById('bq-online-list'); if(!list) return;
  list.innerHTML='';
  const entries=Object.entries(onlineUsers);
  if(!entries.length){
    list.innerHTML='<div style="padding:32px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.46rem;letter-spacing:.18em;color:rgba(255,255,255,.13)">NO ONE ONLINE</div>';
    return;
  }
  entries.sort((a,b)=>a[0]===uid?-1:b[0]===uid?1:(a[1].uname||'').localeCompare(b[1].uname||''));
  entries.forEach(([id,d])=>{
    const me=id===uid, n=d.uname||'?', c=uColor(n);
    const statusLbl = me
      ? (myStatusId==='custom'&&myStatusCustom ? myStatusCustom : getStatusOpt(myStatusId).emoji+' '+getStatusOpt(myStatusId).label)
      : presenceStatusLabel(d)||'🟢 Online';
    const row=document.createElement('div');
    row.className='bq-urow'+(me?' isme':'');
    row.innerHTML=`
      <div class="bq-uav" style="background:${c};color:#000">${uInit(n)}</div>
      <div class="bq-uinfo">
        <div class="bq-uu">@${esc(n)}${me?'<span class="bq-uyou">YOU</span>':''}</div>
        <div class="bq-ust">${esc(statusLbl)}</div>
      </div>
      ${!me?'<div class="bq-udm-hint">DM →</div>':''}`;
    if(me){
      // Click self → show profile card
      row.addEventListener('click',()=>showProfileCard(uid, uname));
    } else {
      row.addEventListener('click',()=>{
        if(!uname){showModal(false);return;}
        showDmConvo(id,n);
      });
    }
    list.appendChild(row);
  });
}

/* ═══════════════════════════════════════════
   GLOBAL CHAT
═══════════════════════════════════════════ */
function subscribeGlobal(){
  const ref=db.ref('bq_messages').limitToLast(MAX_MSG);
  ref.on('child_added',s=>renderMsg('global',s.val(),s.key));
  ref.on('child_changed',s=>onMsgChanged('global',s));
  ref.on('child_removed',s=>document.getElementById('bqm-global-'+s.key)?.remove());
}

function subscribeGlobalTyping(){
  db.ref('bq_typing').on('value',snap=>{
    const now=Date.now(),typers=[];
    snap.forEach(c=>{const d=c.val();if(c.key!==uid&&d&&now-d.ts<3800)typers.push('@'+(d.uname||'?'));});
    const el=document.getElementById('bq-global-typing');if(!el)return;
    if(!typers.length){el.innerHTML='';return;}
    const label=typers.length>2?typers.slice(0,2).join(', ')+' +'+(typers.length-2):typers.join(' & ');
    el.innerHTML=`<div class="bq-tdots"><span></span><span></span><span></span></div><span>${label} typing</span>`;
  });
}

function sendGlobal(text){
  if(!db||!text.trim()||!uname) return;
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(globalReply) p.replyTo={key:globalReply.key,uname:globalReply.uname,text:globalReply.text.slice(0,80)};
  db.ref('bq_messages').push(p);
  db.ref('bq_messages').once('value',snap=>{
    const keys=[]; snap.forEach(c=>keys.push(c.key));
    if(keys.length>MAX_MSG+25) keys.slice(0,keys.length-MAX_MSG).forEach(k=>db.ref('bq_messages/'+k).remove());
  });
  clearReply('global');
}

/* ═══════════════════════════════════════════
   DM LIST SUBSCRIPTION  (v4: uses per-user index)
═══════════════════════════════════════════ */
function subscribeDmList(){
  if(!db||!uid) return;

  // Listen to this user's DM index (bq_user_dms/{uid})
  // Fall back: also check old-style bq_dms if index is empty
  db.ref('bq_user_dms/'+uid).on('value', async snap=>{
    const ids=[];
    snap.forEach(c=>ids.push(c.key));

    // Detach old meta refs
    Object.values(dmMetaRefs).forEach(r=>r.off());
    dmMetaRefs={};
    dmMeta={};

    if(!ids.length){
      // Legacy fallback — scan bq_dms once for this user
      const all=await db.ref('bq_dms').once('value').catch(()=>null);
      if(all) all.forEach(child=>{
        const m=child.val();
        if(!m||!m.meta) return;
        const meta=m.meta;
        if(meta.p1===uid||meta.p2===uid){
          ids.push(child.key);
          // Write to user index for future use
          db.ref('bq_user_dms/'+uid+'/'+child.key).set(true);
        }
      });
    }

    // Subscribe to each DM's meta
    ids.forEach(did=>{
      const mref=db.ref('bq_dms/'+did+'/meta');
      mref.on('value',s=>{
        const meta=s.val();
        if(meta) dmMeta[did]=meta;
        else delete dmMeta[did];
        renderDmList();
        updateDmBadges();
      });
      dmMetaRefs[did]=mref;
    });

    renderDmList();
    updateDmBadges();
  });
}

function renderDmList(){
  const list=document.getElementById('bq-dmlist');if(!list) return;
  const items=Object.entries(dmMeta).filter(([,m])=>m&&(m.p1===uid||m.p2===uid));
  if(!items.length){
    list.innerHTML='';
    const empty=document.createElement('div');
    empty.className='bq-empty';empty.id='bq-dm-empty';empty.style.marginTop='40px';
    empty.innerHTML='<div class="bq-empty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="bq-empty-tx">NO DMs YET</div><div class="bq-empty-sub">TAP + TO MESSAGE ANYONE</div>';
    list.appendChild(empty);
    return;
  }
  items.sort((a,b)=>(b[1].lastTs||0)-(a[1].lastTs||0));
  list.innerHTML='';
  items.forEach(([did,meta],i)=>{
    const partnerUid  = meta.p1===uid ? meta.p2 : meta.p1;
    const partnerName = meta.p1===uid ? (meta.n2||'?') : (meta.n1||'?');
    const unread=meta.unread&&meta.unread[uid]?meta.unread[uid]:0;
    const isOnline=!!onlineUsers[partnerUid];
    const c=uColor(partnerName);
    const row=document.createElement('div');
    row.className='bq-dm-row';
    const preview=meta.lastMsg?esc(meta.lastMsg.slice(0,50)):'';
    const ts=meta.lastTs?timeStr(meta.lastTs):'';
    row.innerHTML=`
      <div class="bq-dm-av${isOnline?' online':''}" style="background:${c};color:#000">${uInit(partnerName)}</div>
      <div class="bq-dm-info">
        <div class="bq-dm-name">@${esc(partnerName)}</div>
        <div class="bq-dm-preview${unread?' unread':''}">${preview||'<span style="opacity:.4">No messages yet</span>'}</div>
      </div>
      <div class="bq-dm-meta">
        <div class="bq-dm-time">${ts}</div>
        ${unread?`<div class="bq-dm-ubadge">${unread>9?'9+':unread}</div>`:''}
      </div>`;
    row.addEventListener('click', e=>{
      e.stopPropagation();
      showDmConvo(partnerUid, partnerName);
    });
    list.appendChild(row);
    if(i<items.length-1){ const div=document.createElement('div'); div.className='bq-dm-divider'; list.appendChild(div); }
  });
}

function updateDmBadges(){
  // Recalculate from dmMeta
  Object.entries(dmMeta).forEach(([did,meta])=>{
    const n = meta&&meta.unread&&meta.unread[uid] ? meta.unread[uid] : 0;
    dmUnread[did] = n;
  });
  const total=Object.values(dmUnread).reduce((s,n)=>s+n,0);
  const nb=document.getElementById('bq-dm-nbadge');
  if(!nb) return;
  if(total>0){nb.textContent=total>9?'9+':total;nb.classList.add('show');}
  else nb.classList.remove('show');
  const mainUnread=globalUnread+total;
  const badge=document.getElementById('bq-badge');
  if(!badge) return;
  if(mainUnread>0){badge.textContent=mainUnread>9?'9+':mainUnread;badge.classList.add('show');}
  else badge.classList.remove('show');
}

/* ═══════════════════════════════════════════
   DM SEND  (writes to bq_user_dms index — no more full scan)
═══════════════════════════════════════════ */
function sendDm(text){
  if(!db||!text.trim()||!uname||!activeDmId||!activeDmPuid) return;
  const partnerName=activeDmPname||'?';
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(dmReply) p.replyTo={key:dmReply.key,uname:dmReply.uname,text:dmReply.text.slice(0,80)};
  db.ref('bq_dms/'+activeDmId+'/messages').push(p);
  const sorted=[uid,activeDmPuid].sort();
  db.ref('bq_dms/'+activeDmId+'/meta').update({
    p1: sorted[0], p2: sorted[1],
    n1: sorted[0]===uid ? uname : partnerName,
    n2: sorted[0]===uid ? partnerName : uname,
    lastMsg: text.trim().slice(0,60),
    lastTs:  Date.now(),
  });
  db.ref('bq_dms/'+activeDmId+'/meta/unread/'+activeDmPuid).transaction(n=>(n||0)+1);
  // Update per-user DM index so both parties see this DM
  db.ref('bq_user_dms/'+uid+'/'+activeDmId).set(true);
  db.ref('bq_user_dms/'+activeDmPuid+'/'+activeDmId).set(true);
  clearReply('dm');
}

/* ═══════════════════════════════════════════
   TYPING
═══════════════════════════════════════════ */
function setGlobalTyping(on){
  if(!db||!uname) return;
  on?db.ref('bq_typing/'+uid).set({uname,ts:Date.now()}):db.ref('bq_typing/'+uid).remove();
  isGlobalTyping=on;
}
function setDmTyping(on){
  if(!db||!uname||!activeDmId) return;
  on?db.ref('bq_dm_typing/'+activeDmId+'/'+uid).set({uname,ts:Date.now()}):db.ref('bq_dm_typing/'+activeDmId+'/'+uid).remove();
  isDmTyping=on;
}

/* ═══════════════════════════════════════════
   SYSTEM MSG
═══════════════════════════════════════════ */
function sendSys(path,text){
  if(!db) return;
  db.ref(path).push({type:'system',text,ts:Date.now()});
}

/* ═══════════════════════════════════════════
   REACTIONS
═══════════════════════════════════════════ */
function toggleRxn(ctx,key,emoji){
  if(!db) return;
  const path=(ctx==='global'?'bq_messages':'bq_dms/'+activeDmId+'/messages')+'/'+key+'/reactions/'+emoji+'/'+uid;
  db.ref(path).once('value',s=>s.val()?db.ref(path).remove():db.ref(path).set(true));
}

function onMsgChanged(ctx,snap){
  const prefix=ctx==='global'?'bqm-global-':'bqm-dm-';
  const el=document.getElementById(prefix+snap.key);
  if(!el) return;
  const msg=snap.val();
  el.querySelector('.bq-rxns')?.remove();
  if(msg.reactions) renderRxns(ctx,el,msg.reactions,snap.key);
}

function renderRxns(ctx,rowEl,reactions,key){
  if(!reactions||typeof reactions!=='object') return;
  const bw=rowEl.querySelector('.bq-bbl-wrap');if(!bw) return;
  const div=document.createElement('div'); div.className='bq-rxns';
  Object.entries(reactions).forEach(([emoji,users])=>{
    if(!users||typeof users!=='object') return;
    const uids=Object.keys(users); if(!uids.length) return;
    const mine=uids.includes(uid);
    const btn=document.createElement('button');
    btn.className='bq-rxn'+(mine?' mine-r':'');
    btn.innerHTML=`${emoji}<span class="bq-rxn-n">${uids.length}</span>`;
    btn.addEventListener('click',()=>toggleRxn(ctx,key,emoji));
    div.appendChild(btn);
  });
  if(div.children.length) bw.appendChild(div);
}

/* ═══════════════════════════════════════════
   REPLY
═══════════════════════════════════════════ */
function setReply(ctx,data){
  if(ctx==='global'){
    globalReply=data;
    document.getElementById('bq-global-rbar').classList.add('show');
    document.getElementById('bq-global-rb-nm').textContent='@'+data.uname;
    document.getElementById('bq-global-rb-tx').textContent=data.text;
  } else {
    dmReply=data;
    document.getElementById('bq-dm-rbar').classList.add('show');
    document.getElementById('bq-dm-rb-nm').textContent='@'+data.uname;
    document.getElementById('bq-dm-rb-tx').textContent=data.text;
  }
}
function clearReply(ctx){
  if(ctx==='global'){
    globalReply=null;
    document.getElementById('bq-global-rbar').classList.remove('show');
  } else {
    dmReply=null;
    document.getElementById('bq-dm-rbar').classList.remove('show');
  }
}

/* ═══════════════════════════════════════════
   RENDER MESSAGE
═══════════════════════════════════════════ */
function renderMsg(ctx,msg,key){
  const isGlobal=ctx==='global';
  const msgsEl=document.getElementById(isGlobal?'bq-global-msgs':'bq-dm-msgs');
  const emptyEl=document.getElementById(isGlobal?'bq-global-empty':'bq-dm-msgs-empty');
  if(!msgsEl) return;
  if(emptyEl) emptyEl.remove();
  const prefix=isGlobal?'bqm-global-':'bqm-dm-';

  if(msg.type==='system'){
    const d=document.createElement('div');
    d.id=prefix+key; d.className='bq-sys'; d.textContent=msg.text;
    msgsEl.appendChild(d); scrollDown(ctx); return;
  }

  const isMine=msg.uid===uid;
  const ts=msg.ts||Date.now();
  const msgDate=new Date(ts);

  const lastEl=msgsEl.lastElementChild;
  if(!lastEl||lastEl.dataset.date!==msgDate.toDateString()){
    const sep=document.createElement('div');
    sep.className='bq-datesep'; sep.textContent=dateStr(ts);
    sep.dataset.date=msgDate.toDateString();
    msgsEl.appendChild(sep);
    if(isGlobal){gLastUID=null;} else {dLastUID=null;}
  }

  const lastUID=isGlobal?gLastUID:dLastUID;
  const lastTS=isGlobal?gLastTS:dLastTS;
  const consec=lastUID===msg.uid&&(ts-lastTS)<120000;
  if(isGlobal){gLastUID=msg.uid;gLastTS=ts;} else {dLastUID=msg.uid;dLastTS=ts;}

  const col=uColor(msg.uname||'');
  const ini=uInit(msg.uname||'?');
  const tStr=timeStr(ts);

  const replyHTML=msg.replyTo?`
    <div class="bq-rp">
      <div class="bq-rp-nm">@${esc(msg.replyTo.uname||'')}</div>
      <div class="bq-rp-tx">${esc(msg.replyTo.text||'')}</div>
    </div>`:'';

  const pickBtns=REACTIONS.map(e=>`<button class="bq-epick-btn" data-e="${e}">${e}</button>`).join('');

  const row=document.createElement('div');
  row.id=prefix+key;
  row.className='bq-row '+(isMine?'mine':'theirs')+(consec?' consec':'');
  row.dataset.date=msgDate.toDateString();
  row.dataset.key=key;

  row.innerHTML=`
    <div class="bq-row-inner">
      <div class="bq-av" style="background:${col};color:#000" data-uid="${esc(msg.uid)}" data-uname="${esc(msg.uname||'')}" title="@${esc(msg.uname||'')}">${ini}</div>
      <div class="bq-col">
        <div class="bq-meta">
          <span class="bq-un" style="color:${col}" data-uid="${esc(msg.uid)}" data-uname="${esc(msg.uname||'')}">@${esc(msg.uname||'?')}</span>
          <span class="bq-ts">${tStr}</span>
        </div>
        <div class="bq-bbl-wrap">
          <div class="bq-acts">
            <div class="bq-epick" id="${prefix}ep-${key}">${pickBtns}</div>
            <button class="bq-act" data-a="react" title="React">😊</button>
            <button class="bq-act" data-a="reply" title="Reply">
              <svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
            </button>
            <button class="bq-act" data-a="copy" title="Copy text">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            ${isMine?`<button class="bq-act del" data-a="del" title="Delete">
              <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </button>`:''}
          </div>
          <div class="bq-bbl">${replyHTML}${linkify(esc(msg.text||''))}</div>
        </div>
      </div>
    </div>`;

  if(msg.reactions) renderRxns(ctx,row,msg.reactions,key);
  msgsEl.appendChild(row);

  // Wire action buttons
  row.querySelectorAll('.bq-act').forEach(b=>{
    b.addEventListener('click',e=>{e.stopPropagation();doAction(ctx,b.dataset.a,key,msg);});
  });
  row.querySelectorAll('.bq-epick-btn').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation(); toggleRxn(ctx,key,b.dataset.e);
      document.getElementById(prefix+'ep-'+key)?.classList.remove('open');
    });
  });

  // Avatar + username → profile card (for any user, including self)
  ['.bq-av','.bq-un'].forEach(sel=>{
    const el=row.querySelector(sel);
    if(el) el.addEventListener('click', e=>{
      e.stopPropagation();
      showProfileCard(msg.uid, msg.uname||'?');
    });
  });

  // Unread / sound
  if(!isMine){
    const msgInView = isOpen && ((isGlobal&&activeView==='chat')||(!isGlobal&&activeView==='dm-convo'&&activeDmId===dmId(uid,msg.uid)));
    if(!msgInView){
      if(isGlobal){ globalUnread++; }
      else { dmUnread[activeDmId]=(dmUnread[activeDmId]||0)+1; }
      ping();
      updateDmBadges();
    }
  }

  scrollDown(ctx);
}

/* ═══════════════════════════════════════════
   ACTIONS
═══════════════════════════════════════════ */
function doAction(ctx,a,key,msg){
  const prefix=ctx==='global'?'bqm-global-':'bqm-dm-';
  if(a==='react'){
    const p=document.getElementById(prefix+'ep-'+key);
    if(p) p.classList.toggle('open');
  } else if(a==='reply'){
    setReply(ctx,{key,uname:msg.uname,text:msg.text});
    const inp=document.getElementById(ctx==='global'?'bq-global-inp':'bq-dm-inp');
    if(inp) inp.focus(); // User explicitly clicked reply — focus is expected
  } else if(a==='copy'){
    navigator.clipboard?.writeText(msg.text).then(()=>toast('Copied'));
  } else if(a==='del'){
    if(msg.uid!==uid) return;
    const path=ctx==='global'?'bq_messages/'+key:'bq_dms/'+activeDmId+'/messages/'+key;
    db.ref(path).remove();
  }
}

/* ═══════════════════════════════════════════
   SCROLL
═══════════════════════════════════════════ */
function scrollDown(ctx){
  const isGlobal=ctx==='global';
  const atBtm=isGlobal?gAtBottom:dAtBottom;
  const msgsEl=document.getElementById(isGlobal?'bq-global-msgs':'bq-dm-msgs');
  if(atBtm&&msgsEl) requestAnimationFrame(()=>msgsEl.scrollTop=msgsEl.scrollHeight);
}

/* ═══════════════════════════════════════════
   PANEL
═══════════════════════════════════════════ */
function openPanel(){
  document.getElementById('bq-panel').classList.add('open');
  document.getElementById('bq-bub').classList.add('open');
  isOpen=true;
  globalUnread=0; updateDmBadges();
  const msgs=document.getElementById('bq-global-msgs');
  if(msgs) requestAnimationFrame(()=>msgs.scrollTop=msgs.scrollHeight);
  // No auto-focus on mobile — prevents unwanted keyboard
  if(activeView==='chat' && !isMobile()){
    const inp=document.getElementById('bq-global-inp'); if(inp) inp.focus();
  }
}
function closePanel(){
  document.getElementById('bq-panel').classList.remove('open');
  document.getElementById('bq-bub').classList.remove('open');
  isOpen=false;
  setGlobalTyping(false); clearTimeout(globalTypT);
  if(activeDmId){setDmTyping(false);clearTimeout(dmTypT);}
  closeStatusPicker();
}
function togglePanel(){
  if(isOpen){closePanel();return;}
  openPanel();
  if(!uname) showModal(false);
  else if(!db) startDB();
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function toast(msg,dur=2200){
  const el=document.getElementById('bq-toast');if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),dur);
}

/* ═══════════════════════════════════════════
   INPUT SETUP
═══════════════════════════════════════════ */
function setupInput(ctx){
  const isGlobal=ctx==='global';
  const inpId   =isGlobal?'bq-global-inp':'bq-dm-inp';
  const sendId  =isGlobal?'bq-global-send':'bq-dm-send';
  const ccId    =isGlobal?'bq-global-cc':'bq-dm-cc';
  const trayId  =isGlobal?'bq-global-etray':'bq-dm-etray';
  const eoBtnId =isGlobal?'bq-global-eo':'bq-dm-eo';
  const scrId   =isGlobal?'bq-global-scr':'bq-dm-scr';
  const msgsId  =isGlobal?'bq-global-msgs':'bq-dm-msgs';

  const inp  =document.getElementById(inpId);
  const send =document.getElementById(sendId);
  const cc   =document.getElementById(ccId);
  const tray =document.getElementById(trayId);
  const eoBtn=document.getElementById(eoBtnId);
  const scrBtn=document.getElementById(scrId);
  const msgs =document.getElementById(msgsId);

  if(!inp||!send) return;

  // Emoji tray
  EMOJI_LIST.forEach(e=>{
    const b=document.createElement('button');
    b.className='bq-etbtn'; b.textContent=e;
    b.addEventListener('click',()=>{
      inp.value+=e; inp.dispatchEvent(new Event('input'));
      inp.focus(); // User tapped emoji — focus is expected
    });
    tray.appendChild(b);
  });
  if(eoBtn) eoBtn.addEventListener('click',e=>{
    e.stopPropagation();
    tray.classList.toggle('open');
  });

  inp.addEventListener('input',()=>{
    resize(inp);
    const len=inp.value.length, rem=CHAR_LIMIT-len;
    send.disabled=len===0;
    cc.textContent=rem<=60?rem+' LEFT':'';
    cc.className='bq-cc'+(rem<=20?' over':rem<=60?' warn':'');
    if(len){
      if(isGlobal){if(!isGlobalTyping)setGlobalTyping(true);clearTimeout(globalTypT);globalTypT=setTimeout(()=>setGlobalTyping(false),TYPING_TTL);}
      else{if(!isDmTyping)setDmTyping(true);clearTimeout(dmTypT);dmTypT=setTimeout(()=>setDmTyping(false),TYPING_TTL);}
    } else {
      if(isGlobal) setGlobalTyping(false);
      else setDmTyping(false);
    }
  });

  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();} });
  send.addEventListener('click',doSend);

  function doSend(){
    const txt=inp.value.trim();
    if(!txt) return;
    if(!uname){showModal(false);return;}
    if(isGlobal) sendGlobal(txt);
    else sendDm(txt);
    inp.value=''; inp.style.height='auto';
    send.disabled=true; cc.textContent='';
    if(isGlobal) setGlobalTyping(false); else setDmTyping(false);
    if(isGlobal) gAtBottom=true; else dAtBottom=true;
    if(msgs) requestAnimationFrame(()=>msgs.scrollTop=msgs.scrollHeight);
  }

  // Scroll tracking
  if(msgs&&scrBtn){
    msgs.addEventListener('scroll',()=>{
      const d=msgs.scrollHeight-msgs.scrollTop-msgs.clientHeight;
      const atBtm=d<60;
      if(isGlobal) gAtBottom=atBtm; else dAtBottom=atBtm;
      scrBtn.classList.toggle('show',!atBtm&&d>100);
    },{passive:true});
    scrBtn.addEventListener('click',()=>{
      msgs.scrollTop=msgs.scrollHeight;
      if(isGlobal) gAtBottom=true; else dAtBottom=true;
      scrBtn.classList.remove('show');
    });
  }
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
function init(){
  // Bubble
  document.getElementById('bq-bub').addEventListener('click',togglePanel);

  // Name modal
  document.getElementById('bq-nm-inp').addEventListener('input',e=>ckUN(e.target.value));
  document.getElementById('bq-nm-inp').addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();submitName();} });
  document.getElementById('bq-nm-btn').addEventListener('click',submitName);

  // Rename + sound
  document.getElementById('bq-ren-btn').addEventListener('click',()=>showModal(true));
  document.getElementById('bq-sound-btn').addEventListener('click',()=>{
    soundOn=!soundOn;
    localStorage.setItem(LS_SOUND,soundOn?'on':'off');
    document.getElementById('bq-sound-btn').classList.toggle('active',soundOn);
    toast(soundOn?'🔔 Sound on':'🔕 Sound off');
  });
  document.getElementById('bq-sound-btn').classList.toggle('active',soundOn);

  // DM back button
  document.getElementById('bq-dm-back').addEventListener('click',()=>{
    setDmTyping(false);
    if(dmTypingRef){dmTypingRef.off();dmTypingRef=null;}
    // Hide dm-convo, show DMs list
    const convo=document.getElementById('bq-view-dm-convo');
    convo.classList.add('hidden');
    const dmsView=document.getElementById('bq-view-dms');
    dmsView.classList.remove('hidden','slide-left');
    activeView='dms';
    document.querySelectorAll('.bq-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='dms'));
  });

  // DM new → open search modal (allows DM to ANY user, not just online)
  document.getElementById('bq-dm-new-btn').addEventListener('click',e=>{
    e.stopPropagation();
    openNewDmModal();
  });

  // New DM modal close
  document.getElementById('bq-ndm-close').addEventListener('click',closeNewDmModal);
  document.getElementById('bq-ndm-inp').addEventListener('input',e=>{
    clearTimeout(searchT);
    const q=e.target.value.trim();
    if(q.length>=1) searchT=setTimeout(()=>searchUsers(q),320);
    else document.getElementById('bq-ndm-results').innerHTML='<div class="bq-ndm-hint">TYPE A USERNAME TO SEARCH</div>';
  });
  document.getElementById('bq-ndm-inp').addEventListener('keydown',e=>{ if(e.key==='Escape') closeNewDmModal(); });

  // Profile card close
  document.getElementById('bq-pc-close').addEventListener('click',hideProfileCard);
  document.getElementById('bq-profile-card').addEventListener('click',e=>{
    if(e.target===document.getElementById('bq-profile-card')) hideProfileCard();
  });

  // Status picker
  document.getElementById('bq-my-status-btn').addEventListener('click',e=>{
    e.stopPropagation();
    toggleStatusPicker();
  });
  updateStatusBar();

  // Reply cancels
  document.getElementById('bq-global-rb-x').addEventListener('click',()=>clearReply('global'));
  document.getElementById('bq-dm-rb-x').addEventListener('click',()=>clearReply('dm'));

  // Set up both inputs
  setupInput('global');
  setupInput('dm');

  // Global click — close panel if outside, close dropdowns
  document.addEventListener('click',e=>{
    // Close status picker
    if(statusPickerOpen){
      const picker=document.getElementById('bq-status-picker');
      const btn=document.getElementById('bq-my-status-btn');
      if(!picker.contains(e.target)&&!btn.contains(e.target)) closeStatusPicker();
    }
    // Close panel if clicking outside
    if(!isOpen) return;
    const panel=document.getElementById('bq-panel'), bub=document.getElementById('bq-bub');
    if(!panel.contains(e.target)&&!bub.contains(e.target)) closePanel();
    // Close emoji pickers
    document.querySelectorAll('.bq-epick.open').forEach(el=>{
      if(!el.contains(e.target)) el.classList.remove('open');
    });
    // Close emoji trays
    document.querySelectorAll('.bq-etray.open').forEach(t=>{
      const eoBtn=t.closest('.bq-inp-wrap')?.querySelector('.bq-eopenbtn');
      if(!t.contains(e.target)&&!(eoBtn&&eoBtn.contains(e.target))) t.classList.remove('open');
    });
  });

  // Cleanup on unload
  window.addEventListener('beforeunload',()=>{
    if(db){
      db.ref('bq_presence/'+uid).remove();
      db.ref('bq_typing/'+uid).remove();
      if(activeDmId) db.ref('bq_dm_typing/'+activeDmId+'/'+uid).remove();
    }
  });

  // Start DB if already have a username
  if(uname) startDB();

  // Ensure initial view is visible
  document.getElementById('bq-view-chat').classList.remove('hidden');
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();

})();
