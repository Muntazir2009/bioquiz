/**
 * BioQuiz Chat Widget v2
 * Drop-in: <script src="chat-widget.js"></script>
 * Replace FIREBASE_CONFIG below with your project config.
 */
(function () {
'use strict';

/* ══════════════════════════════════════════════
   FIREBASE CONFIG
══════════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain: "bioquiz-chat.firebaseapp.com",
  databaseURL: "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bioquiz-chat",
  storageBucket: "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId: "1:616382882153:web:9c8a32401be847468d1df8"
};

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const MAX_MSG      = 100;
const CHAR_LIMIT   = 320;
const TYPING_TTL   = 3000;
const PRESENCE_TTL = 9000;
const LS_UID       = 'bq_chat_uid';
const LS_UNAME     = 'bq_chat_uname';
const LS_SOUND     = 'bq_chat_sound';
const EMOJIS_INPUT = ['😊','😂','❤️','🔥','👍','🎉','😮','🧬','💯','🌍','👀','😢'];
const REACTIONS    = ['👍','❤️','😂','😮','🔥','🎉'];

/* ══════════════════════════════════════════════
   USER COLOURS — deterministic from username
══════════════════════════════════════════════ */
const PALETTE = [
  '#60a5fa','#34d399','#f472b6','#fbbf24',
  '#a78bfa','#fb923c','#2dd4bf','#e879f9',
  '#4ade80','#f87171','#38bdf8','#facc15',
];
function userColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name) { return (name || '?').slice(0,2).toUpperCase(); }

/* ══════════════════════════════════════════════
   CSS
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;900&display=swap');

/* ── BUBBLE ── */
#bqw-bubble{
  position:fixed;bottom:28px;right:28px;z-index:9900;
  width:54px;height:54px;border-radius:50%;
  background:#fff;border:none;cursor:pointer;padding:0;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 28px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.14);
  transition:transform .28s cubic-bezier(.34,1.4,.64,1),box-shadow .25s;
  will-change:transform;
}
#bqw-bubble:hover{transform:scale(1.1);box-shadow:0 10px 40px rgba(0,0,0,.72);}
#bqw-bubble:active{transform:scale(.93);}
#bqw-bubble.open{background:#161616;}
.bqw-ico{position:absolute;transition:opacity .22s,transform .22s;}
.bqw-ico-chat{fill:#111;}
#bqw-bubble.open .bqw-ico-chat{opacity:0;transform:scale(.7);}
.bqw-ico-x{opacity:0;fill:none;stroke:rgba(255,255,255,.7);stroke-width:2.5;stroke-linecap:round;transform:scale(.7);}
#bqw-bubble.open .bqw-ico-x{opacity:1;transform:scale(1);}
#bqw-badge{
  position:absolute;top:-3px;right:-3px;
  min-width:18px;height:18px;border-radius:9px;
  background:#f87171;border:2px solid #080808;
  font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;color:#fff;
  display:none;align-items:center;justify-content:center;padding:0 3px;
  animation:bqwPop .3s cubic-bezier(.34,1.4,.64,1) both;
}
#bqw-badge.show{display:flex;}
@keyframes bqwPop{from{transform:scale(0)}to{transform:scale(1)}}

/* ── PANEL ── */
#bqw-panel{
  position:fixed;bottom:94px;right:28px;z-index:9899;
  width:372px;height:568px;max-height:calc(100dvh - 108px);
  background:#0a0a0a;border:1px solid rgba(255,255,255,.1);
  border-radius:16px;display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 28px 90px rgba(0,0,0,.92),0 0 0 1px rgba(255,255,255,.04) inset;
  transform-origin:bottom right;
  transform:scale(.85) translateY(20px);opacity:0;pointer-events:none;
  transition:transform .34s cubic-bezier(.16,1,.3,1),opacity .28s ease;
  will-change:transform,opacity;
}
#bqw-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}
#bqw-panel::after{
  content:'';position:absolute;top:0;left:10%;width:80%;height:1px;
  background:linear-gradient(to right,transparent,rgba(255,255,255,.15),transparent);pointer-events:none;
}

/* ── TABS ── */
.bqw-tabs{
  display:flex;border-bottom:1px solid rgba(255,255,255,.07);
  flex-shrink:0;background:#0a0a0a;padding:0 6px;
}
.bqw-tab{
  flex:1;padding:11px 4px;background:none;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:.48rem;font-weight:700;letter-spacing:.18em;
  color:rgba(255,255,255,.28);position:relative;transition:color .2s;
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.bqw-tab svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqw-tab.active{color:#fff;}
.bqw-tab.active::after{
  content:'';position:absolute;bottom:-1px;left:18%;width:64%;height:2px;
  background:#fff;border-radius:2px 2px 0 0;
}
.bqw-tbadge{
  background:rgba(248,113,113,.18);border:1px solid rgba(248,113,113,.25);
  color:#f87171;border-radius:4px;font-size:.35rem;padding:1px 5px;
  font-family:'Rajdhani',sans-serif;font-weight:700;letter-spacing:.06em;
  min-width:15px;text-align:center;
}

/* ── HEADER ── */
.bqw-header{
  display:flex;align-items:center;gap:8px;
  padding:10px 13px 9px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;
}
.bqw-live-dot{
  width:7px;height:7px;border-radius:50%;background:#34d399;
  box-shadow:0 0 7px #34d399;animation:bqwPulse 2.4s ease infinite;flex-shrink:0;
}
@keyframes bqwPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.82)}}
.bqw-htitle{
  font-family:'Rajdhani',sans-serif;font-size:.66rem;font-weight:900;
  letter-spacing:.16em;color:#fff;flex:1;
}
.bqw-hbtn{
  width:28px;height:28px;background:none;
  border:1px solid rgba(255,255,255,.08);border-radius:7px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .2s;flex-shrink:0;
}
.bqw-hbtn:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.06);}
.bqw-hbtn svg{width:13px;height:13px;stroke:rgba(255,255,255,.42);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;}
.bqw-hbtn.active{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.08);}
.bqw-hbtn.active svg{stroke:#fff;}

/* ── VIEWS ── */
.bqw-view{display:none;flex:1;flex-direction:column;overflow:hidden;min-height:0;}
.bqw-view.active{display:flex;}

/* ── MESSAGES ── */
#bqw-msgs{
  flex:1;overflow-y:auto;padding:12px 11px 4px;
  display:flex;flex-direction:column;gap:1px;
}
#bqw-msgs::-webkit-scrollbar{width:3px;}
#bqw-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:2px;}

.bqw-datesep{
  display:flex;align-items:center;gap:8px;margin:10px 0 8px;
  font-family:'Rajdhani',sans-serif;font-size:.33rem;letter-spacing:.24em;color:rgba(255,255,255,.16);
}
.bqw-datesep::before,.bqw-datesep::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06);}
.bqw-sys{
  text-align:center;padding:5px 0;margin:2px 0;
  font-family:'Rajdhani',sans-serif;font-size:.37rem;letter-spacing:.13em;color:rgba(255,255,255,.18);
  animation:bqwUp .28s ease both;
}

/* Message row */
.bqw-row{
  display:flex;flex-direction:column;gap:1px;
  animation:bqwUp .26s cubic-bezier(.16,1,.3,1) both;padding:0 1px;
}
@keyframes bqwUp{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
.bqw-row.mine{align-items:flex-end;}
.bqw-row.theirs{align-items:flex-start;}

.bqw-row-inner{display:flex;align-items:flex-end;gap:7px;max-width:90%;}
.bqw-row.mine .bqw-row-inner{flex-direction:row-reverse;}
.bqw-row.consecutive .bqw-row-inner .bqw-av{visibility:hidden;}
.bqw-row.consecutive{margin-top:-3px;}

/* Avatar */
.bqw-av{
  width:26px;height:26px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:900;
  user-select:none;cursor:default;
}

/* Column */
.bqw-col{display:flex;flex-direction:column;gap:2px;min-width:0;}

/* Meta */
.bqw-meta{display:flex;align-items:baseline;gap:5px;padding:0 2px;margin-bottom:1px;}
.bqw-row.consecutive .bqw-meta{display:none;}
.bqw-uname{font-family:'Rajdhani',sans-serif;font-size:.43rem;font-weight:700;letter-spacing:.06em;}
.bqw-ts{font-family:'Rajdhani',sans-serif;font-size:.33rem;color:rgba(255,255,255,.2);letter-spacing:.04em;}

/* Reply preview */
.bqw-rp{
  border-left:2px solid rgba(255,255,255,.28);padding:3px 8px;
  margin-bottom:5px;border-radius:0 4px 4px 0;background:rgba(255,255,255,.05);
}
.bqw-rp-name{font-family:'Rajdhani',sans-serif;font-size:.37rem;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.06em;}
.bqw-rp-text{font-family:'Rajdhani',sans-serif;font-size:.52rem;color:rgba(255,255,255,.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px;}
.bqw-row.mine .bqw-rp{background:rgba(0,0,0,.12);border-left-color:rgba(0,0,0,.28);}

/* Bubble */
.bqw-bbl{
  padding:8px 12px;
  font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:500;
  line-height:1.5;letter-spacing:.02em;word-break:break-word;
}
.bqw-row.theirs .bqw-bbl{
  background:#1c1c1c;border:1px solid rgba(255,255,255,.08);
  border-radius:2px 12px 12px 12px;color:rgba(255,255,255,.84);
}
.bqw-row.mine .bqw-bbl{
  background:#fff;color:#0a0a0a;
  border-radius:12px 2px 12px 12px;
}
.bqw-bbl a{color:#60a5fa;text-decoration:underline;text-decoration-color:rgba(96,165,250,.35);}
.bqw-row.mine .bqw-bbl a{color:#1d4ed8;}

/* Bubble wrap + actions */
.bqw-bbl-wrap{position:relative;}
.bqw-actions{
  position:absolute;top:-34px;
  display:none;align-items:center;gap:2px;
  background:#1e1e1e;border:1px solid rgba(255,255,255,.12);
  border-radius:9px;padding:3px 4px;
  box-shadow:0 6px 20px rgba(0,0,0,.55);z-index:10;white-space:nowrap;
}
.bqw-row.mine .bqw-actions{right:0;}
.bqw-row.theirs .bqw-actions{left:0;}
.bqw-bbl-wrap:hover .bqw-actions{display:flex;}
.bqw-abtn{
  width:28px;height:28px;background:none;border:none;cursor:pointer;
  border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-size:14px;transition:background .15s;
  color:rgba(255,255,255,.45);font-family:'Rajdhani',sans-serif;
}
.bqw-abtn:hover{background:rgba(255,255,255,.09);color:#fff;}
.bqw-abtn svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqw-abtn.del:hover{background:rgba(248,113,113,.12);color:#f87171;}

/* Emoji pick */
.bqw-epick{
  position:absolute;top:-54px;
  background:#1e1e1e;border:1px solid rgba(255,255,255,.12);
  border-radius:10px;padding:5px 6px;
  display:none;gap:2px;flex-wrap:wrap;width:166px;
  box-shadow:0 8px 30px rgba(0,0,0,.6);z-index:15;
}
.bqw-row.mine .bqw-epick{right:0;}
.bqw-row.theirs .bqw-epick{left:0;}
.bqw-epick.open{display:flex;}
.bqw-epick-btn{
  width:28px;height:28px;background:none;border:none;cursor:pointer;
  border-radius:5px;font-size:15px;display:flex;align-items:center;justify-content:center;
  transition:background .15s,transform .15s;line-height:1;
}
.bqw-epick-btn:hover{background:rgba(255,255,255,.1);transform:scale(1.22);}

/* Reactions */
.bqw-rxns{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px;padding:0 2px;}
.bqw-rxn{
  display:inline-flex;align-items:center;gap:3px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
  border-radius:20px;padding:2px 7px;cursor:pointer;font-size:12px;
  transition:all .18s;
}
.bqw-rxn:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.2);transform:scale(1.05);}
.bqw-rxn.mine-r{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.28);}
.bqw-rxn-n{font-family:'Rajdhani',sans-serif;font-size:.42rem;font-weight:700;color:rgba(255,255,255,.65);}

/* ── REPLY BAR ── */
#bqw-rbar{
  display:none;align-items:center;gap:8px;
  padding:7px 11px;background:rgba(255,255,255,.04);
  border-top:1px solid rgba(255,255,255,.06);flex-shrink:0;
}
#bqw-rbar.show{display:flex;}
.bqw-rb-ic{width:14px;height:14px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bqw-rb-body{flex:1;min-width:0;}
.bqw-rb-nm{font-family:'Rajdhani',sans-serif;font-size:.38rem;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.42);}
.bqw-rb-tx{font-family:'Rajdhani',sans-serif;font-size:.5rem;color:rgba(255,255,255,.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bqw-rb-x{
  width:22px;height:22px;background:none;border:1px solid rgba(255,255,255,.09);
  border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .18s;
}
.bqw-rb-x:hover{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);}
.bqw-rb-x svg{width:10px;height:10px;stroke:rgba(255,255,255,.35);fill:none;stroke-width:2.5;stroke-linecap:round;}

/* ── TYPING ── */
#bqw-typing{
  min-height:20px;padding:0 15px 6px;flex-shrink:0;
  font-family:'Rajdhani',sans-serif;font-size:.38rem;letter-spacing:.1em;
  color:rgba(255,255,255,.24);display:flex;align-items:center;gap:6px;
}
.bqw-tdots{display:flex;gap:3px;align-items:center;}
.bqw-tdots span{
  width:3.5px;height:3.5px;background:rgba(255,255,255,.28);border-radius:50%;
  animation:bqwTd 1.1s ease infinite;
}
.bqw-tdots span:nth-child(2){animation-delay:.18s;}
.bqw-tdots span:nth-child(3){animation-delay:.36s;}
@keyframes bqwTd{0%,60%,100%{transform:translateY(0);opacity:.28}30%{transform:translateY(-4px);opacity:1}}

/* ── INPUT ── */
.bqw-input-wrap{border-top:1px solid rgba(255,255,255,.07);padding:8px 10px 10px;flex-shrink:0;}
.bqw-input-row{display:flex;gap:7px;align-items:flex-end;}
#bqw-emoji-tray{
  display:none;flex-wrap:wrap;gap:1px;padding:5px 3px;margin-bottom:7px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;
}
#bqw-emoji-tray.open{display:flex;}
.bqw-etray-btn{
  width:30px;height:30px;background:none;border:none;cursor:pointer;border-radius:5px;
  font-size:16px;display:flex;align-items:center;justify-content:center;
  transition:background .15s,transform .15s;line-height:1;
}
.bqw-etray-btn:hover{background:rgba(255,255,255,.09);transform:scale(1.15);}
.bqw-emoji-open{
  width:34px;height:34px;background:none;border:1px solid rgba(255,255,255,.09);
  border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;font-size:16px;transition:all .2s;line-height:1;
}
.bqw-emoji-open:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.05);}
#bqw-input{
  flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  border-radius:9px;padding:9px 11px;color:#fff;
  font-family:'Rajdhani',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.03em;
  resize:none;outline:none;min-height:38px;max-height:96px;line-height:1.45;
  transition:border-color .2s,background .2s;scrollbar-width:none;
}
#bqw-input::-webkit-scrollbar{display:none;}
#bqw-input::placeholder{color:rgba(255,255,255,.17);}
#bqw-input:focus{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
#bqw-send{
  width:38px;height:38px;background:#fff;border:none;border-radius:9px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:all .22s cubic-bezier(.34,1.4,.64,1);
}
#bqw-send:hover{transform:scale(1.08);box-shadow:0 4px 18px rgba(255,255,255,.2);}
#bqw-send:active{transform:scale(.92);}
#bqw-send:disabled{opacity:.22;cursor:not-allowed;transform:none;box-shadow:none;}
#bqw-send svg{width:15px;height:15px;stroke:#000;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
.bqw-input-footer{display:flex;align-items:center;justify-content:space-between;margin-top:5px;}
.bqw-charcount{font-family:'Rajdhani',sans-serif;font-size:.35rem;letter-spacing:.1em;color:rgba(255,255,255,.15);transition:color .2s;}
.bqw-charcount.warn{color:#fbbf24;}
.bqw-charcount.over{color:#f87171;}
.bqw-hint{font-family:'Rajdhani',sans-serif;font-size:.33rem;letter-spacing:.06em;color:rgba(255,255,255,.12);}

/* ── SCROLL BTN ── */
#bqw-scrbtn{
  position:absolute;bottom:106px;right:15px;z-index:6;
  width:30px;height:30px;background:rgba(16,16,16,.96);
  border:1px solid rgba(255,255,255,.13);border-radius:50%;
  cursor:pointer;display:none;align-items:center;justify-content:center;
  box-shadow:0 4px 16px rgba(0,0,0,.5);transition:border-color .2s;
}
#bqw-scrbtn.show{display:flex;animation:bqwUp .2s ease both;}
#bqw-scrbtn:hover{border-color:rgba(255,255,255,.26);}
#bqw-scrbtn svg{width:14px;height:14px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}

/* ── ONLINE VIEW ── */
#bqw-view-online{overflow:hidden;}
.bqw-oh{
  padding:11px 13px 9px;border-bottom:1px solid rgba(255,255,255,.06);
  font-family:'Rajdhani',sans-serif;font-size:.4rem;letter-spacing:.24em;
  color:rgba(255,255,255,.26);flex-shrink:0;
}
#bqw-userlist{flex:1;overflow-y:auto;padding:7px 9px;display:flex;flex-direction:column;gap:2px;}
#bqw-userlist::-webkit-scrollbar{width:3px;}
#bqw-userlist::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bqw-urow{
  display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;
  transition:background .18s;cursor:default;
}
.bqw-urow:hover{background:rgba(255,255,255,.04);}
.bqw-urow.isme{background:rgba(255,255,255,.05);}
.bqw-uav{
  width:34px;height:34px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.46rem;font-weight:900;
  position:relative;
}
.bqw-uav::after{
  content:'';position:absolute;bottom:0;right:0;
  width:9px;height:9px;border-radius:50%;
  background:#34d399;border:2px solid #0a0a0a;
}
.bqw-uinfo{flex:1;min-width:0;}
.bqw-uu{
  font-family:'Rajdhani',sans-serif;font-size:.62rem;font-weight:700;
  letter-spacing:.06em;color:#fff;display:flex;align-items:center;gap:5px;
}
.bqw-you{
  font-size:.33rem;letter-spacing:.12em;color:rgba(255,255,255,.28);
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
  padding:1px 5px;border-radius:3px;
}
.bqw-ust{font-family:'Rajdhani',sans-serif;font-size:.37rem;letter-spacing:.06em;color:rgba(255,255,255,.2);margin-top:1px;}

/* ── EMPTY STATE ── */
.bqw-empty{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:10px;padding-bottom:24px;animation:bqwUp .4s ease both;
}
.bqw-empty-ic{
  width:46px;height:46px;border-radius:12px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
  display:flex;align-items:center;justify-content:center;
}
.bqw-empty-ic svg{width:20px;height:20px;stroke:rgba(255,255,255,.18);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
.bqw-empty-tx{font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.2em;color:rgba(255,255,255,.16);}

/* ── NAME MODAL ── */
#bqw-nm{
  position:absolute;inset:0;z-index:30;
  background:rgba(0,0,0,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;padding:20px;border-radius:16px;
  animation:bqwFade .24s ease both;
}
@keyframes bqwFade{from{opacity:0}to{opacity:1}}
.bqw-nm-box{width:100%;max-width:270px;text-align:center;}
.bqw-nm-av{
  width:54px;height:54px;border-radius:50%;margin:0 auto 15px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:.7rem;font-weight:900;
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);
  transition:background .3s;
}
.bqw-nm-title{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;color:#fff;margin-bottom:4px;}
.bqw-nm-sub{font-family:'Rajdhani',sans-serif;font-size:.47rem;letter-spacing:.16em;color:rgba(255,255,255,.28);margin-bottom:16px;}
.bqw-nm-field{position:relative;margin-bottom:8px;}
.bqw-nm-at{
  position:absolute;left:12px;top:50%;transform:translateY(-50%);
  font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:700;
  color:rgba(255,255,255,.32);pointer-events:none;user-select:none;
}
.bqw-nm-in{
  width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
  border-radius:9px;padding:11px 12px 11px 24px;
  color:#fff;font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:600;
  letter-spacing:.06em;outline:none;transition:border-color .2s,background .2s;
}
.bqw-nm-in::placeholder{color:rgba(255,255,255,.18);}
.bqw-nm-in:focus{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.09);}
.bqw-nm-in.chk{border-color:rgba(251,191,36,.4);}
.bqw-nm-in.tkn{border-color:rgba(248,113,113,.5);}
.bqw-nm-in.ok{border-color:rgba(52,211,153,.5);}
.bqw-nm-st{
  font-family:'Rajdhani',sans-serif;font-size:.42rem;letter-spacing:.1em;
  min-height:17px;margin-bottom:11px;transition:color .2s;
}
.bqw-nm-st.chk{color:rgba(251,191,36,.7);}
.bqw-nm-st.tkn{color:#f87171;}
.bqw-nm-st.ok{color:#34d399;}
.bqw-nm-btn{
  width:100%;padding:12px;background:#fff;color:#000;border:none;border-radius:9px;
  font-family:'Rajdhani',sans-serif;font-size:.64rem;font-weight:900;letter-spacing:.18em;
  cursor:pointer;transition:opacity .2s,transform .15s;
}
.bqw-nm-btn:hover:not(:disabled){opacity:.88;}
.bqw-nm-btn:active:not(:disabled){transform:scale(.97);}
.bqw-nm-btn:disabled{opacity:.25;cursor:not-allowed;}

/* ── TOAST ── */
#bqw-toast{
  position:absolute;bottom:14px;left:50%;transform:translateX(-50%) translateY(8px);
  background:rgba(18,18,18,.98);border:1px solid rgba(255,255,255,.13);
  border-radius:8px;padding:7px 14px;z-index:50;opacity:0;
  font-family:'Rajdhani',sans-serif;font-size:.5rem;letter-spacing:.1em;color:rgba(255,255,255,.78);
  white-space:nowrap;pointer-events:none;transition:all .25s cubic-bezier(.34,1.2,.64,1);
}
#bqw-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* ── MOBILE ── */
@media(max-width:480px){
  #bqw-panel{right:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:none;transform-origin:bottom center;}
  #bqw-bubble{bottom:18px;right:18px;}
}
`;

/* ══════════════════════════════════════════════
   HTML
══════════════════════════════════════════════ */
const HTML = `
<button id="bqw-bubble" aria-label="Chat">
  <svg viewBox="0 0 24 24" class="bqw-ico bqw-ico-chat" width="22" height="22">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <svg viewBox="0 0 24 24" class="bqw-ico bqw-ico-x" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
  <div id="bqw-badge"></div>
</button>

<div id="bqw-panel" role="dialog" aria-label="BioQuiz Chat">
  <!-- Name modal -->
  <div id="bqw-nm" style="display:none">
    <div class="bqw-nm-box">
      <div class="bqw-nm-av" id="bqw-nm-av">?</div>
      <div class="bqw-nm-title">PICK A USERNAME</div>
      <div class="bqw-nm-sub">UNIQUE · SHOWN AS @USERNAME</div>
      <div class="bqw-nm-field">
        <span class="bqw-nm-at">@</span>
        <input id="bqw-nm-in" class="bqw-nm-in" type="text"
          placeholder="username" maxlength="20"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>
      <div class="bqw-nm-st" id="bqw-nm-st"></div>
      <button class="bqw-nm-btn" id="bqw-nm-btn" disabled>JOIN CHAT</button>
    </div>
  </div>

  <!-- Tabs -->
  <div class="bqw-tabs">
    <button class="bqw-tab active" id="bqw-tab-chat" onclick="bqwTab('chat')">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      MESSAGES
    </button>
    <button class="bqw-tab" id="bqw-tab-online" onclick="bqwTab('online')">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ONLINE
      <span class="bqw-tbadge" id="bqw-ocnt">0</span>
    </button>
  </div>

  <!-- Chat view -->
  <div class="bqw-view active" id="bqw-view-chat">
    <div class="bqw-header">
      <div class="bqw-live-dot"></div>
      <div class="bqw-htitle">BIOQUIZ CHAT</div>
      <button class="bqw-hbtn" id="bqw-sound-btn" title="Sound">
        <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      </button>
      <button class="bqw-hbtn" id="bqw-ren-btn" title="Change username">
        <svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
      </button>
    </div>

    <div id="bqw-msgs">
      <div class="bqw-empty" id="bqw-empty">
        <div class="bqw-empty-ic"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
        <div class="bqw-empty-tx">NO MESSAGES · BE FIRST</div>
      </div>
    </div>

    <div id="bqw-typing"></div>

    <button id="bqw-scrbtn" title="Jump to latest">
      <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
    </button>

    <!-- Reply bar -->
    <div id="bqw-rbar">
      <svg class="bqw-rb-ic" viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
      <div class="bqw-rb-body">
        <div class="bqw-rb-nm" id="bqw-rb-nm"></div>
        <div class="bqw-rb-tx" id="bqw-rb-tx"></div>
      </div>
      <button class="bqw-rb-x" id="bqw-rb-x">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Input -->
    <div class="bqw-input-wrap">
      <div id="bqw-emoji-tray"></div>
      <div class="bqw-input-row">
        <button class="bqw-emoji-open" id="bqw-emo-btn" title="Emoji">😊</button>
        <textarea id="bqw-input" placeholder="Message…" rows="1" maxlength="${CHAR_LIMIT}"></textarea>
        <button id="bqw-send" disabled>
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div class="bqw-input-footer">
        <div class="bqw-charcount" id="bqw-cc"></div>
        <div class="bqw-hint">ENTER send · SHIFT+ENTER newline</div>
      </div>
    </div>
  </div>

  <!-- Online view -->
  <div class="bqw-view" id="bqw-view-online">
    <div class="bqw-oh">ONLINE NOW</div>
    <div id="bqw-userlist"></div>
  </div>

  <div id="bqw-toast"></div>
</div>
`;

/* ══════════════════════════════════════════════
   INJECT
══════════════════════════════════════════════ */
const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);
const wrap = document.createElement('div');
wrap.innerHTML = HTML;
document.body.appendChild(wrap);

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let db          = null;
let uid         = localStorage.getItem(LS_UID) || genUID();
let uname       = localStorage.getItem(LS_UNAME) || '';
let soundOn     = localStorage.getItem(LS_SOUND) !== 'off';
let isOpen      = false;
let unread      = 0;
let typTimer    = null;
let isTyping    = false;
let presInt     = null;
let atBottom    = true;
let replyTo     = null;
let onlineUsers = {};
let lastUID     = null;
let lastTS      = 0;
let nmCkTimer   = null;
let activeTab   = 'chat';
let toastTimer  = null;

/* ══════════════════════════════════════════════
   AUDIO
══════════════════════════════════════════════ */
let aCtx = null;
function ping() {
  if (!soundOn) return;
  try {
    if (!aCtx) aCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = aCtx.createOscillator(), g = aCtx.createGain();
    o.connect(g); g.connect(aCtx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(900, aCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(660, aCtx.currentTime + .12);
    g.gain.setValueAtTime(.1, aCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, aCtx.currentTime + .28);
    o.start(); o.stop(aCtx.currentTime + .3);
  } catch(_) {}
}

/* ══════════════════════════════════════════════
   TAB SWITCH (global — called from inline onclick)
══════════════════════════════════════════════ */
window.bqwTab = function(tab) {
  activeTab = tab;
  ['chat','online'].forEach(t => {
    document.getElementById('bqw-tab-' + t).classList.toggle('active', t === tab);
    document.getElementById('bqw-view-' + t).classList.toggle('active', t === tab);
  });
  if (tab === 'chat') {
    document.getElementById('bqw-input')?.focus();
    if (atBottom) { const m = document.getElementById('bqw-msgs'); m.scrollTop = m.scrollHeight; }
  }
};

/* ══════════════════════════════════════════════
   FIREBASE
══════════════════════════════════════════════ */
function loadSDK() {
  return new Promise((res, rej) => {
    let done = 0;
    [
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js',
    ].forEach(u => {
      const s = document.createElement('script');
      s.src = u;
      s.onload = () => { if (++done === 2) res(); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
  });
}

async function startDB() {
  if (db) return;
  try {
    await loadSDK();
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    subscribeMsgs();
    subscribeTyping();
    startPresence();
  } catch(e) {
    console.warn('[BioQuiz Chat]', e);
    const el = document.getElementById('bqw-ocnt');
    if (el) { el.textContent = '!'; el.style.color = '#f87171'; }
  }
}

/* ══════════════════════════════════════════════
   USERNAME REGISTRY
   bq_usernames/@name = uid
══════════════════════════════════════════════ */
function sanitize(v) {
  return (v || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
}

function ckUsername(raw) {
  const name = sanitize(raw);
  const inp = document.getElementById('bqw-nm-in');
  const st  = document.getElementById('bqw-nm-st');
  const btn = document.getElementById('bqw-nm-btn');
  const av  = document.getElementById('bqw-nm-av');

  if (inp.value !== name) inp.value = name;

  if (name) {
    const c = userColor(name);
    av.style.background = c; av.style.color = '#000';
    av.textContent = initials(name);
  } else {
    av.style.background = 'rgba(255,255,255,.1)';
    av.textContent = '?';
  }

  if (!name || name.length < 2) {
    st.textContent = name.length === 1 ? 'Min 2 characters' : '';
    st.className = 'bqw-nm-st';
    inp.className = 'bqw-nm-in';
    btn.disabled = true;
    return;
  }

  if (name === uname) {
    st.textContent = '✓ Your current username';
    st.className = 'bqw-nm-st ok';
    inp.className = 'bqw-nm-in ok';
    btn.disabled = false;
    return;
  }

  clearTimeout(nmCkTimer);
  st.textContent = 'Checking…';
  st.className = 'bqw-nm-st chk';
  inp.className = 'bqw-nm-in chk';
  btn.disabled = true;

  nmCkTimer = setTimeout(async () => {
    if (!db) {
      st.textContent = '✓ Available!';
      st.className = 'bqw-nm-st ok';
      inp.className = 'bqw-nm-in ok';
      btn.disabled = false;
      return;
    }
    try {
      const snap = await db.ref('bq_usernames/' + name).once('value');
      const owner = snap.val();
      if (owner && owner !== uid) {
        st.textContent = '@' + name + ' is taken';
        st.className = 'bqw-nm-st tkn';
        inp.className = 'bqw-nm-in tkn';
        btn.disabled = true;
      } else {
        st.textContent = '✓ @' + name + ' is free!';
        st.className = 'bqw-nm-st ok';
        inp.className = 'bqw-nm-in ok';
        btn.disabled = false;
      }
    } catch(_) {
      st.textContent = '✓ Looks good';
      st.className = 'bqw-nm-st ok';
      btn.disabled = false;
    }
  }, 480);
}

async function claimName(name) {
  if (!db) return;
  if (uname && uname !== name) await db.ref('bq_usernames/' + uname).remove().catch(() => {});
  await db.ref('bq_usernames/' + name).set(uid).catch(() => {});
}

/* ══════════════════════════════════════════════
   NAME MODAL
══════════════════════════════════════════════ */
function showModal(rename) {
  const modal = document.getElementById('bqw-nm');
  const inp   = document.getElementById('bqw-nm-in');
  const btn   = document.getElementById('bqw-nm-btn');
  const st    = document.getElementById('bqw-nm-st');
  modal.style.display = 'flex';
  inp.value = rename ? (uname || '') : '';
  btn.textContent = rename ? 'UPDATE USERNAME' : 'JOIN CHAT';
  btn.disabled = true;
  st.textContent = ''; st.className = 'bqw-nm-st';
  inp.className = 'bqw-nm-in';
  const av = document.getElementById('bqw-nm-av');
  if (rename && uname) { av.style.background = userColor(uname); av.textContent = initials(uname); ckUsername(uname); }
  else { av.style.background = 'rgba(255,255,255,.1)'; av.textContent = '?'; }
  setTimeout(() => inp.focus(), 60);
}

function hideModal() { document.getElementById('bqw-nm').style.display = 'none'; }

async function submitName() {
  const name = sanitize(document.getElementById('bqw-nm-in').value);
  if (!name || name.length < 2) return;
  const btn = document.getElementById('bqw-nm-btn');
  btn.disabled = true; btn.textContent = 'JOINING…';

  const isFirst = !uname;
  const oldName = uname;

  await startDB();

  if (db && name !== uname) {
    try {
      const snap = await db.ref('bq_usernames/' + name).once('value');
      const owner = snap.val();
      if (owner && owner !== uid) {
        document.getElementById('bqw-nm-st').textContent = '@' + name + ' was just taken!';
        document.getElementById('bqw-nm-st').className = 'bqw-nm-st tkn';
        btn.disabled = false; btn.textContent = 'JOIN CHAT';
        return;
      }
    } catch(_) {}
  }

  await claimName(name);
  uname = name;
  localStorage.setItem(LS_UNAME, uname);
  hideModal();
  startPresence();

  if (isFirst) sendSys('@' + uname + ' joined the chat 👋');
  else if (oldName && oldName !== uname) sendSys('@' + oldName + ' changed to @' + uname);

  btn.textContent = 'JOIN CHAT'; btn.disabled = false;
}

/* ══════════════════════════════════════════════
   PRESENCE
══════════════════════════════════════════════ */
function startPresence() {
  if (!db || !uname) return;
  const ref = db.ref('bq_presence/' + uid);
  const beat = () => ref.set({ uname, ts: Date.now() });
  beat();
  clearInterval(presInt);
  presInt = setInterval(beat, PRESENCE_TTL * 0.7);
  ref.onDisconnect().remove();
  db.ref('bq_presence').on('value', snap => {
    const now = Date.now();
    onlineUsers = {};
    snap.forEach(c => {
      const d = c.val();
      if (d && now - d.ts < PRESENCE_TTL * 1.6) onlineUsers[c.key] = d;
      else c.ref.remove();
    });
    renderOnlineList();
    const n = Object.keys(onlineUsers).length;
    const el = document.getElementById('bqw-ocnt');
    if (el) el.textContent = n;
  });
}

function renderOnlineList() {
  const list = document.getElementById('bqw-userlist');
  if (!list) return;
  list.innerHTML = '';
  const entries = Object.entries(onlineUsers);
  if (!entries.length) {
    list.innerHTML = '<div style="padding:24px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.46rem;letter-spacing:.18em;color:rgba(255,255,255,.13)">NO ONE ONLINE</div>';
    return;
  }
  entries.sort((a, b) => a[0] === uid ? -1 : b[0] === uid ? 1 : (a[1].uname||'').localeCompare(b[1].uname||''));
  entries.forEach(([id, d]) => {
    const me = id === uid;
    const n  = d.uname || '?';
    const c  = userColor(n);
    const row = document.createElement('div');
    row.className = 'bqw-urow' + (me ? ' isme' : '');
    row.innerHTML = `
      <div class="bqw-uav" style="background:${c};color:#000">${initials(n)}</div>
      <div class="bqw-uinfo">
        <div class="bqw-uu">@${esc(n)}${me ? '<span class="bqw-you">YOU</span>' : ''}</div>
        <div class="bqw-ust">Online now</div>
      </div>`;
    list.appendChild(row);
  });
}

/* ══════════════════════════════════════════════
   MESSAGES
══════════════════════════════════════════════ */
function subscribeMsgs() {
  const ref = db.ref('bq_messages').limitToLast(MAX_MSG);
  ref.on('child_added', s => renderMsg(s.val(), s.key));
  ref.on('child_changed', s => {
    const el = document.getElementById('bqm-' + s.key);
    if (!el) return;
    const msg = s.val();
    el.querySelector('.bqw-rxns')?.remove();
    if (msg.reactions) renderRxns(el, msg.reactions, s.key);
  });
  ref.on('child_removed', s => document.getElementById('bqm-' + s.key)?.remove());
}

function sendMsg(text) {
  if (!db || !text.trim() || !uname) return;
  const p = { uid, uname, text: text.trim().slice(0, CHAR_LIMIT), ts: Date.now() };
  if (replyTo) p.replyTo = { key: replyTo.key, uname: replyTo.uname, text: replyTo.text.slice(0, 80) };
  db.ref('bq_messages').push(p);
  // Prune old
  db.ref('bq_messages').once('value', snap => {
    const keys = [];
    snap.forEach(c => keys.push(c.key));
    if (keys.length > MAX_MSG + 25)
      keys.slice(0, keys.length - MAX_MSG).forEach(k => db.ref('bq_messages/' + k).remove());
  });
  clearReply();
}

function sendSys(text) {
  if (!db) return;
  db.ref('bq_messages').push({ type: 'system', text, ts: Date.now() });
}

/* ══════════════════════════════════════════════
   REACTIONS
══════════════════════════════════════════════ */
function toggleRxn(key, emoji) {
  if (!db) return;
  const path = 'bq_messages/' + key + '/reactions/' + emoji + '/' + uid;
  db.ref(path).once('value', s => s.val() ? db.ref(path).remove() : db.ref(path).set(true));
}

function renderRxns(rowEl, reactions, key) {
  if (!reactions || typeof reactions !== 'object') return;
  const bw = rowEl.querySelector('.bqw-bbl-wrap');
  if (!bw) return;
  const div = document.createElement('div');
  div.className = 'bqw-rxns';
  Object.entries(reactions).forEach(([emoji, users]) => {
    if (!users || typeof users !== 'object') return;
    const uids = Object.keys(users);
    if (!uids.length) return;
    const mine = uids.includes(uid);
    const btn = document.createElement('button');
    btn.className = 'bqw-rxn' + (mine ? ' mine-r' : '');
    btn.innerHTML = `${emoji}<span class="bqw-rxn-n">${uids.length}</span>`;
    btn.addEventListener('click', () => toggleRxn(key, emoji));
    div.appendChild(btn);
  });
  if (div.children.length) bw.appendChild(div);
}

/* ══════════════════════════════════════════════
   RENDER MESSAGE
══════════════════════════════════════════════ */
function renderMsg(msg, key) {
  const msgs = document.getElementById('bqw-msgs');
  document.getElementById('bqw-empty')?.remove();

  if (msg.type === 'system') {
    const d = document.createElement('div');
    d.id = 'bqm-' + key; d.className = 'bqw-sys';
    d.textContent = msg.text;
    msgs.appendChild(d); scrollDown(); return;
  }

  const isMine = msg.uid === uid;
  const ts = msg.ts || Date.now();

  // Date sep
  const msgDate = new Date(ts);
  const lastEl  = msgs.lastElementChild;
  if (!lastEl || lastEl.dataset.date !== msgDate.toDateString()) {
    const sep = document.createElement('div');
    sep.className = 'bqw-datesep';
    const td = msgDate.toDateString();
    const tod = new Date().toDateString();
    const yd  = new Date(Date.now() - 86400000).toDateString();
    sep.textContent = td === tod ? 'TODAY' : td === yd ? 'YESTERDAY' :
      msgDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase();
    sep.dataset.date = td;
    msgs.appendChild(sep);
    lastUID = null;
  }

  const consec = lastUID === msg.uid && (ts - lastTS) < 120000;
  lastUID = msg.uid; lastTS = ts;

  const col  = userColor(msg.uname || '');
  const ini  = initials(msg.uname || '?');
  const tStr = msgDate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  const replyHTML = msg.replyTo ? `
    <div class="bqw-rp">
      <div class="bqw-rp-name">@${esc(msg.replyTo.uname||'')}</div>
      <div class="bqw-rp-text">${esc(msg.replyTo.text||'')}</div>
    </div>` : '';

  const pickBtns = REACTIONS.map(e =>
    `<button class="bqw-epick-btn" data-e="${e}">${e}</button>`).join('');

  const row = document.createElement('div');
  row.id = 'bqm-' + key;
  row.className = 'bqw-row ' + (isMine ? 'mine' : 'theirs') + (consec ? ' consecutive' : '');
  row.dataset.date = msgDate.toDateString();
  row.dataset.key  = key;

  row.innerHTML = `
    <div class="bqw-row-inner">
      <div class="bqw-av" style="background:${col};color:#000">${ini}</div>
      <div class="bqw-col">
        <div class="bqw-meta">
          <span class="bqw-uname" style="color:${col}">@${esc(msg.uname||'?')}</span>
          <span class="bqw-ts">${tStr}</span>
        </div>
        <div class="bqw-bbl-wrap">
          <div class="bqw-actions">
            <div class="bqw-epick" id="bqep-${key}">${pickBtns}</div>
            <button class="bqw-abtn" data-a="react" title="React">😊</button>
            <button class="bqw-abtn" data-a="reply" title="Reply">
              <svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
            </button>
            <button class="bqw-abtn" data-a="copy" title="Copy">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            ${isMine ? `<button class="bqw-abtn del" data-a="del" title="Delete">
              <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </button>` : ''}
          </div>
          <div class="bqw-bbl">${replyHTML}${linkify(esc(msg.text||''))}</div>
        </div>
      </div>
    </div>`;

  if (msg.reactions) renderRxns(row, msg.reactions, key);
  msgs.appendChild(row);

  // Wire actions
  row.querySelectorAll('.bqw-abtn').forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); doAction(b.dataset.a, key, msg); });
  });
  row.querySelectorAll('.bqw-epick-btn').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      toggleRxn(key, b.dataset.e);
      document.getElementById('bqep-' + key)?.classList.remove('open');
    });
  });

  if (!isOpen && !isMine) { unread++; updateBadge(); ping(); }
  scrollDown();
}

function doAction(a, key, msg) {
  if (a === 'react') {
    const p = document.getElementById('bqep-' + key);
    if (p) p.classList.toggle('open');
  } else if (a === 'reply') {
    setReply({ key, uname: msg.uname, text: msg.text });
    document.getElementById('bqw-input')?.focus();
  } else if (a === 'copy') {
    navigator.clipboard?.writeText(msg.text).then(() => toast('Copied'));
  } else if (a === 'del') {
    if (msg.uid !== uid) return;
    db.ref('bq_messages/' + key).remove();
  }
}

/* ══════════════════════════════════════════════
   REPLY
══════════════════════════════════════════════ */
function setReply(d) {
  replyTo = d;
  document.getElementById('bqw-rbar').classList.add('show');
  document.getElementById('bqw-rb-nm').textContent = '@' + d.uname;
  document.getElementById('bqw-rb-tx').textContent = d.text;
}
function clearReply() {
  replyTo = null;
  document.getElementById('bqw-rbar').classList.remove('show');
}

/* ══════════════════════════════════════════════
   TYPING
══════════════════════════════════════════════ */
function subscribeTyping() {
  db.ref('bq_typing').on('value', snap => {
    const now = Date.now(), typers = [];
    snap.forEach(c => {
      const d = c.val();
      if (c.key !== uid && d && now - d.ts < 3800) typers.push('@' + (d.uname || '?'));
    });
    const el = document.getElementById('bqw-typing');
    if (!el) return;
    if (!typers.length) { el.innerHTML = ''; return; }
    const label = typers.length > 2
      ? typers.slice(0,2).join(', ') + ' +' + (typers.length - 2)
      : typers.join(' & ');
    el.innerHTML = `<div class="bqw-tdots"><span></span><span></span><span></span></div><span>${label} typing</span>`;
  });
}

function setTyping(on) {
  if (!db || !uname) return;
  on ? db.ref('bq_typing/' + uid).set({ uname, ts: Date.now() })
     : db.ref('bq_typing/' + uid).remove();
  isTyping = on;
}

/* ══════════════════════════════════════════════
   SCROLL
══════════════════════════════════════════════ */
function scrollDown() {
  const m = document.getElementById('bqw-msgs');
  if (atBottom && m) requestAnimationFrame(() => m.scrollTop = m.scrollHeight);
}

/* ══════════════════════════════════════════════
   BADGE + PANEL + TOAST
══════════════════════════════════════════════ */
function updateBadge() {
  const b = document.getElementById('bqw-badge');
  if (!b) return;
  if (unread > 0) { b.textContent = unread > 9 ? '9+' : unread; b.classList.add('show'); }
  else b.classList.remove('show');
}

function openPanel() {
  document.getElementById('bqw-panel').classList.add('open');
  document.getElementById('bqw-bubble').classList.add('open');
  isOpen = true; unread = 0; updateBadge(); atBottom = true;
  const m = document.getElementById('bqw-msgs');
  requestAnimationFrame(() => m.scrollTop = m.scrollHeight);
  if (activeTab === 'chat') document.getElementById('bqw-input')?.focus();
}

function closePanel() {
  document.getElementById('bqw-panel').classList.remove('open');
  document.getElementById('bqw-bubble').classList.remove('open');
  isOpen = false; setTyping(false); clearTimeout(typTimer);
}

function togglePanel() {
  if (isOpen) { closePanel(); return; }
  openPanel();
  if (!uname) showModal(false);
  else if (!db) startDB();
}

function toast(msg, dur = 2000) {
  const el = document.getElementById('bqw-toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function genUID() {
  return 'u' + Math.random().toString(36).slice(2,10) + Date.now().toString(36);
}
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function linkify(s) {
  return s.replace(/(https?:\/\/[^\s<>"']{4,})/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}
function resize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 96) + 'px';
}

/* ══════════════════════════════════════════════
   SOUND BTN
══════════════════════════════════════════════ */
function updSoundBtn() {
  const b = document.getElementById('bqw-sound-btn');
  if (!b) return;
  b.classList.toggle('active', soundOn);
  b.title = soundOn ? 'Sound on' : 'Sound off';
}
updSoundBtn();

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
function init() {
  document.getElementById('bqw-bubble').addEventListener('click', togglePanel);

  // Name modal
  document.getElementById('bqw-nm-in').addEventListener('input', e => ckUsername(e.target.value));
  document.getElementById('bqw-nm-in').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submitName(); }
  });
  document.getElementById('bqw-nm-btn').addEventListener('click', submitName);

  // Rename + sound
  document.getElementById('bqw-ren-btn').addEventListener('click', () => showModal(true));
  document.getElementById('bqw-sound-btn').addEventListener('click', () => {
    soundOn = !soundOn;
    localStorage.setItem(LS_SOUND, soundOn ? 'on' : 'off');
    updSoundBtn();
    toast(soundOn ? '🔔 Sound on' : '🔕 Sound off');
  });

  // Reply cancel
  document.getElementById('bqw-rb-x').addEventListener('click', clearReply);

  // Input
  const inp  = document.getElementById('bqw-input');
  const send = document.getElementById('bqw-send');
  const cc   = document.getElementById('bqw-cc');

  inp.addEventListener('input', () => {
    resize(inp);
    const len = inp.value.length, rem = CHAR_LIMIT - len;
    send.disabled = len === 0;
    cc.textContent = rem <= 60 ? rem + ' LEFT' : '';
    cc.className = 'bqw-charcount' + (rem <= 20 ? ' over' : rem <= 60 ? ' warn' : '');
    if (len) { if (!isTyping) setTyping(true); clearTimeout(typTimer); typTimer = setTimeout(() => setTyping(false), TYPING_TTL); }
    else setTyping(false);
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  });
  send.addEventListener('click', doSend);

  function doSend() {
    const txt = inp.value.trim();
    if (!txt) return;
    if (!uname) { showModal(false); return; }
    sendMsg(txt);
    inp.value = ''; inp.style.height = 'auto';
    send.disabled = true; cc.textContent = '';
    setTyping(false); clearTimeout(typTimer);
    atBottom = true;
    const m = document.getElementById('bqw-msgs');
    requestAnimationFrame(() => m.scrollTop = m.scrollHeight);
  }

  // Emoji tray
  const tray = document.getElementById('bqw-emoji-tray');
  const eBtn = document.getElementById('bqw-emo-btn');
  EMOJIS_INPUT.forEach(e => {
    const b = document.createElement('button');
    b.className = 'bqw-etray-btn'; b.textContent = e;
    b.addEventListener('click', () => {
      inp.value += e;
      inp.dispatchEvent(new Event('input'));
      inp.focus();
    });
    tray.appendChild(b);
  });
  eBtn.addEventListener('click', () => tray.classList.toggle('open'));

  // Scroll tracking
  const msgs = document.getElementById('bqw-msgs');
  const scrb = document.getElementById('bqw-scrbtn');
  msgs.addEventListener('scroll', () => {
    const d = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
    atBottom = d < 60;
    scrb.classList.toggle('show', !atBottom && d > 100);
  }, { passive: true });
  scrb.addEventListener('click', () => {
    msgs.scrollTop = msgs.scrollHeight; atBottom = true; scrb.classList.remove('show');
  });

  // Outside click
  document.addEventListener('click', e => {
    if (!isOpen) return;
    const panel = document.getElementById('bqw-panel');
    const bub   = document.getElementById('bqw-bubble');
    if (!panel.contains(e.target) && !bub.contains(e.target)) closePanel();
    document.querySelectorAll('.bqw-epick.open').forEach(el => {
      if (!el.contains(e.target)) el.classList.remove('open');
    });
    if (!eBtn.contains(e.target) && !tray.contains(e.target)) tray.classList.remove('open');
  });

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (db) {
      db.ref('bq_presence/' + uid).remove();
      db.ref('bq_typing/' + uid).remove();
    }
  });

  if (uname) startDB();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
