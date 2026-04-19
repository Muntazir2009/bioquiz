/**
 * BioQuiz Chat Widget v9 (chat-widget_v9.js)
 * Bug fixes: profile avatar/banner, voice hold-to-record, theme persistence, perf, auto-update
 * Drop-in: <script src="chat-widget.js"></script>
 * 
 * Features:
 * - Fixed navigation bugs (profile/customisation works properly)
 * - PWA installable
 * - Modern design with animations
 * - Profiles V2 (avatar/banner upload), voice notes, GIF lightbox
 * - 5 new themes incl. Monochrome, redesigned bubbles, floating info card
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
   GIPHY CONFIG
   Get a free API key at https://developers.giphy.com/
   Either set window.GIPHY_API_KEY before loading this script,
   or paste your key into the GIPHY_API_KEY constant below.
───────────────────────────────────────── */
const GIPHY_API_KEY = 'hylHrfS6vc3Hnbc6R6QRgpbHfWbwSCWY';
const _resolvedGiphyKey = window.GIPHY_API_KEY || GIPHY_API_KEY;
const GIPHY_CATEGORIES = [
  { id:'trending', label:'Trending', q:null },
  { id:'reactions', label:'Reactions', q:'reaction' },
  { id:'love', label:'Love', q:'love' },
  { id:'happy', label:'Happy', q:'happy' },
  { id:'sad', label:'Sad', q:'sad' },
  { id:'cute', label:'Cute', q:'cute animals' },
  { id:'anime', label:'Anime', q:'anime' },
  { id:'study', label:'Study', q:'studying' },
  { id:'memes', label:'Memes', q:'meme' },
  { id:'sports', label:'Sports', q:'sports' },
  { id:'food', label:'Food', q:'food' },
  { id:'fail', label:'Fail', q:'fail' },
];

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const MAX_MSG      = 50;
const CHAR_LIMIT   = 320;
const TYPING_TTL   = 3000;
const PRESENCE_TTL = 9000;
const LS_UID   = 'bq_chat_uid';
const LS_NAME  = 'bq_chat_uname';
const LS_PROF  = 'bq_chat_profile';
const LS_THEME = 'bq_theme_v2';                 // v9: persisted global theme id
const WIDGET_VERSION = '9.6.1';                 // v9.6.1: compact working message menu + 4 fixed themes
// v9.3: Image hosting endpoint — catbox.moe is free, anonymous, returns permanent URLs.
// You can override with window.BQ_IMAGE_HOST = 'https://your-uploader' before loading the widget.
const IMAGE_HOST_URL = (typeof window!=='undefined' && window.BQ_IMAGE_HOST) || 'https://catbox.moe/user/api.php';
window.BQ_WIDGET_VERSION = WIDGET_VERSION;
const VERSION_CHECK_URL = '/chat-widget-version.json'; // optional; ignored if 404
const AVATAR_CACHE = Object.create(null);       // v9: uid -> {avatar, banner, initials, displayName}

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
// v9.2: Full emoji reaction picker — categorized like WhatsApp's keyboard
const REACTION_CATEGORIES = {
  '⭐': ['👍','❤️','😂','😮','😢','🔥','🎉','🥰','😭','👏','🤔','💯','🙏','💀','🫶','🤯'],
  '😀': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  '👋': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦿','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','💋','🩸'],
  '🐶': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔'],
  '🍔': ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊'],
  '⚽': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
  '🚗': ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍️','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🕍','🛕','🕋','⛩️','🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁'],
  '💡': ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐'],
  '❤️': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
};
const REACTIONS  = REACTION_CATEGORIES['⭐'];     // legacy quick row (kept for compatibility)
// Quick reaction stickers — one-tap big-emoji message ("burst" bubble)
const QUICK_STICKERS = ['❤️','🔥','😂','🎉','👏','🥰','😮','💯','🫶','🙏','😭','🤯','💀','✨','👀','🤝'];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function uColor(n){ let h=0; for(let i=0;i<n.length;i++) h=(Math.imul(h,31)+n.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length]; }
function uInit(n){ return (n||'?').slice(0,2).toUpperCase(); }

/* v9: avatar cache helpers — keep bubble avatars fresh as Firebase tokens expire */
function _cacheAvatarFromPresence(uid, d){
  if(!uid || !d) return;
  AVATAR_CACHE[uid] = {
    avatar: d.avatar||'',
    banner: d.banner||'',
    initials: d.initials||'',
    displayName: d.displayName||'',
    color: d.color||''
  };
}
function applyAvatarsFromCache(){
  // Update every rendered .bqav and .bquav for users whose presence avatar changed
  document.querySelectorAll('.bqav[data-uid]').forEach(el=>{
    const u = el.dataset.uid; if(!u) return;
    const c = AVATAR_CACHE[u]; if(!c) return;
    if(c.avatar){
      // Use a real <img> behind the scenes so we can detect onerror -> initials fallback
      if(el.dataset.avatarUrl !== c.avatar){
        el.dataset.avatarUrl = c.avatar;
        el.style.background = "url('"+c.avatar.replace(/'/g,"%27")+"') center/cover";
        el.style.color = 'transparent';
        el.textContent = '';
        // Probe the URL, revert to initials if it fails (expired token)
        const probe = new Image();
        probe.onerror = ()=>{
          if(el.dataset.avatarUrl === c.avatar){
            el.style.background = ''; el.style.color = '#000';
            el.textContent = c.initials || el.dataset.uname?.slice(0,2).toUpperCase() || '??';
            delete el.dataset.avatarUrl;
          }
        };
        probe.src = c.avatar;
      }
    } else if(el.dataset.avatarUrl){
      // Avatar was cleared — revert to initials
      el.style.background = ''; el.style.color = '#000';
      el.textContent = c.initials || el.dataset.uname?.slice(0,2).toUpperCase() || '??';
      delete el.dataset.avatarUrl;
    }
  });
}
const _debouncedApplyAvatars = (function(){
  let t=null;
  return function(){
    if(t) return;
    t = setTimeout(()=>{ t=null; try{ applyAvatarsFromCache(); }catch(_){ } }, 120);
  };
})();
function myInit(){ return myProfile.initials || uInit(uname||'?'); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function mentionify(s){
  // highlight @username mentions; own username gets .me class
  return s.replace(/@([a-z0-9_]{2,20})/gi,(m,n)=>{
    const cls='bq-mention'+(n.toLowerCase()===uname?' me':'');
    return '<span class="'+cls+'" data-mention="'+n.toLowerCase()+'">@'+n+'</span>';
  });
}
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

/* v8: fullscreen layout — ensure inner views fill the full panel */
#bqp.bq-fs{display:flex!important;flex-direction:column!important;}
#bqp.bq-fs #bqs{flex:1 1 auto!important;width:100%!important;min-width:0!important;min-height:0!important;}
#bqp.bq-fs .bqv{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;}
#bqp.bq-fs .bqv.bq-active{transform:none!important;}
#bqp.bq-fs .bqmsgs{flex:1 1 auto!important;min-height:0!important;width:100%!important;}
#bqp.bq-fs .bqdmh,#bqp.bq-fs .bqgh,#bqp.bq-fs .bqiw{width:100%!important;}
#bqp.bq-fs #bqv-dmconv{display:flex!important;flex-direction:column!important;}


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
  box-shadow:0 0 10px var(--bq-success);
  flex-shrink:0;
}
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

/* Message row — messenger style */
.bqr{display:flex;flex-direction:column;gap:2px;animation:bqUp .26s var(--bq-transition) both;padding:0 4px;margin-top:8px;}
@keyframes bqUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.bqr.mine{align-items:flex-end;}
.bqr.theirs{align-items:flex-start;}
.bqri{display:flex;align-items:flex-end;gap:8px;max-width:78%;}
.bqr.mine .bqri{flex-direction:row-reverse;max-width:80%;}
.bqr.mine .bqav{display:none;} /* no avatar on my side, true messenger */
.bqr.consec{margin-top:2px;}
.bqr.consec .bqri .bqav{visibility:hidden;}

/* Avatar */
.bqav{
  width:28px;height:28px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:10px;font-weight:800;
  cursor:pointer;transition:transform .2s var(--bq-transition),box-shadow .2s;
  user-select:none;position:relative;
}
.bqav:hover{transform:scale(1.12);box-shadow:0 0 0 3px rgba(255,255,255,.12);}
.bqav:active{transform:scale(.95);}
.bqav::after{content:'';position:absolute;bottom:-1px;right:-1px;width:9px;height:9px;border-radius:50%;border:2px solid var(--bq-bg);display:none;}
.bqav[data-status="online"]::after{display:block;background:var(--bq-success);}
.bqav[data-status="studying"]::after{display:block;background:var(--bq-accent);}
.bqav[data-status="away"]::after{display:block;background:var(--bq-warning);}
.bqav[data-status="busy"]::after{display:block;background:var(--bq-danger);}

/* Column + meta (sender name only) */
.bqcol{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:100%;}
.bqmeta{display:flex;align-items:baseline;gap:6px;padding:0 10px 1px;}
.bqr.mine .bqmeta,.bqr.consec .bqmeta{display:none;}
.bqun{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:.01em;cursor:pointer;}
.bqun:hover{text-decoration:underline;}
.bqts{display:none;} /* legacy slot — timestamp now lives inside bubble */

/* Reply preview */
.bqrp{border-left:3px solid var(--bq-accent);padding:5px 9px;margin-bottom:6px;border-radius:0 8px 8px 0;background:rgba(96,165,250,.12);}
.bqrp-n{font-family:'Inter',sans-serif;font-size:10px;font-weight:700;letter-spacing:.02em;color:var(--bq-accent);}
.bqrp-t{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;margin-top:2px;}
.bqr.mine .bqrp{background:rgba(0,0,0,.18);border-left-color:rgba(255,255,255,.35);}
.bqr.mine .bqrp-n{color:rgba(255,255,255,.85);}
.bqr.mine .bqrp-t{color:rgba(255,255,255,.7);}

/* Bubble */
.bqbbl{
  position:relative;
  padding:8px 12px 6px;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:500;line-height:1.45;letter-spacing:.005em;
  word-break:break-word;max-width:100%;
}
.bqr.theirs .bqbbl{
  background:var(--bq-bg-elevated);
  border:1px solid var(--bq-border);
  border-radius:18px 18px 18px 4px;
  color:var(--bq-text);
}
.bqr.theirs.consec .bqbbl{border-radius:18px;}
.bqr.mine .bqbbl{
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  color:#fff;
  border-radius:18px 18px 4px 18px;
  box-shadow:0 4px 14px rgba(96,165,250,.28);
}
.bqr.mine.consec .bqbbl{border-radius:18px;}
.bqbbl a{color:var(--bq-accent);text-decoration:underline;text-decoration-color:rgba(96,165,250,.4);}
.bqr.mine .bqbbl a{color:#fff;text-decoration-color:rgba(255,255,255,.55);}

/* Inline meta INSIDE bubble (timestamp + ticks) */
.bqbbl-meta{
  display:inline-flex;align-items:center;gap:4px;
  float:right;margin:6px 0 -2px 10px;
  font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:.02em;
  color:rgba(255,255,255,.55);line-height:1;user-select:none;
  transition:color .25s ease,opacity .25s ease;
}
.bqr.theirs .bqbbl-meta{color:var(--bq-text-subtle);}
.bqr.mine .bqbbl-meta{color:rgba(255,255,255,.7);}
.bqbbl-meta svg{width:14px;height:9px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:stroke .25s ease,filter .25s ease;}
/* Read receipt states — clearly distinct colors */
.bqbbl-meta .bqbbl-tick{display:inline-flex;align-items:center;color:rgba(255,255,255,.55);}
.bqr.mine .bqbbl-meta .bqbbl-tick{color:rgba(255,255,255,.55);} /* sent: pale */
.bqbbl-meta.delivered .bqbbl-tick{color:rgba(255,255,255,.95);} /* delivered: solid white */
.bqbbl-meta.seen .bqbbl-tick{color:#22d3ee;filter:drop-shadow(0 0 4px rgba(34,211,238,.65));animation:bqSeenPulse .5s ease;}
.bqr.mine .bqbbl-meta.seen{color:#a5f3fc;}
@keyframes bqSeenPulse{0%{transform:scale(.7)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
/* Pill overlay variant for image / gif bubbles */
.bqbbl.media .bqbbl-meta{
  position:absolute;right:8px;bottom:8px;float:none;margin:0;
  background:rgba(0,0,0,.55);color:#fff;padding:3px 8px;border-radius:10px;
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
}
.bqbbl.media{padding:4px;}
.bqbbl.media:not(.has-text) .bqbbl-meta{box-shadow:0 1px 3px rgba(0,0,0,.4);}
.bqbbl-meta-clear{clear:both;display:block;height:0;}

/* Bubble hover actions */
.bqbw{position:relative;display:flex;flex-direction:column;align-items:flex-end;}
.bqr.theirs .bqbw{align-items:flex-start;}
.bqacts{
  position:absolute;top:-44px;display:none;align-items:center;gap:4px;
  background:var(--bq-bg-elevated,#1f2937);border:1px solid var(--bq-border,rgba(255,255,255,.12));
  border-radius:var(--bq-radius-sm,10px);padding:5px;box-shadow:0 8px 24px rgba(0,0,0,.5);
  z-index:50;white-space:nowrap;max-width:calc(100vw - 24px);overflow-x:auto;scrollbar-width:none;
}
.bqacts::-webkit-scrollbar{display:none;}
.bqr.mine .bqacts{right:0;}.bqr.theirs .bqacts{left:0;}
/* If message is near the top of the chat, flip actions BELOW the bubble so they don't get clipped */
.bqr:first-child .bqacts,.bqr.bq-flip-acts .bqacts{top:auto;bottom:-44px;}
.bqbw:hover .bqacts{display:flex;}
/* v9.3: mobile/tap support — message gains .bq-tapped class on tap to show actions */
.bqr.bq-tapped .bqacts{display:flex;}
.bqact{
  width:32px;height:32px;background:rgba(255,255,255,.04);border:none;cursor:pointer;
  border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:16px;line-height:1;transition:all .15s;color:var(--bq-text,#e5e7eb);
}
.bqact:hover{background:var(--bq-bg-hover,rgba(255,255,255,.1));color:var(--bq-text,#fff);transform:scale(1.1);}
.bqact svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:block;}
.bqact.del:hover{background:rgba(248,113,113,.18);color:var(--bq-danger,#f87171);}
#bq-msg-sheet{position:fixed;inset:0;display:none;z-index:999999;pointer-events:none;}
#bq-msg-sheet.open{display:block;pointer-events:auto;}
.bq-ms-backdrop{position:absolute;inset:0;background:transparent;}
.bq-ms-panel{position:absolute;min-width:148px;max-width:min(220px,calc(100vw - 20px));background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:14px;padding:6px;box-shadow:0 18px 40px rgba(0,0,0,.38);transform:translateY(4px) scale(.98);opacity:0;transition:transform .14s ease,opacity .14s ease;pointer-events:auto;}
#bq-msg-sheet.open .bq-ms-panel{transform:translateY(0) scale(1);opacity:1;}
.bq-ms-preview{padding:6px 8px 8px;border-bottom:1px solid var(--bq-border);margin-bottom:6px;}
.bq-ms-author{font:700 11px Inter,sans-serif;color:var(--bq-text);margin-bottom:2px;}
.bq-ms-text{font:500 12px Inter,sans-serif;color:var(--bq-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bq-ms-actions{display:flex;flex-direction:column;gap:2px;}
.bq-ms-btn{width:100%;border:none;border-radius:10px;background:transparent;min-height:0;padding:8px 10px;display:flex;align-items:center;justify-content:flex-start;gap:8px;color:var(--bq-text);font:700 12px Inter,sans-serif;cursor:pointer;text-align:left;}
.bq-ms-btn:hover{background:var(--bq-bg-hover);}
.bq-ms-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bq-ms-btn.danger{color:var(--bq-danger,#f87171);background:transparent;}
.bq-ms-btn.danger:hover{background:rgba(248,113,113,.08);}
.bq-ms-btn:active{transform:scale(.98);}
.bq-voice-msg{--bq-voice-progress:0;}
.bq-voice-bars{position:relative;overflow:hidden;}
.bq-voice-bar{background:color-mix(in srgb,var(--bq-text-muted) 52%, transparent);transition:background-color .16s ease,opacity .16s ease;opacity:.42;}
.bq-voice-bar.played{background:var(--bq-accent);opacity:1;box-shadow:0 0 0 1px color-mix(in srgb,var(--bq-accent) 28%, transparent),0 0 12px color-mix(in srgb,var(--bq-accent) 22%, transparent);}
@media (max-width: 640px){.bq-ms-panel{max-width:min(200px,calc(100vw - 20px));}}
.bqepick{
  position:absolute;top:-260px;display:none;flex-direction:column;width:280px;max-width:90vw;height:240px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:12px;padding:0;overflow:hidden;
  box-shadow:0 12px 32px rgba(0,0,0,.6);z-index:15;
}
.bqr.mine .bqepick{right:0;}.bqr.theirs .bqepick{left:0;}
.bqepick.open{display:flex;}
.bqep-tabs{display:flex;gap:0;padding:4px 6px;border-bottom:1px solid var(--bq-border);background:rgba(0,0,0,.15);flex-shrink:0;overflow-x:auto;scrollbar-width:none;}
.bqep-tabs::-webkit-scrollbar{display:none;}
.bqep-tab{flex:0 0 auto;background:none;border:none;cursor:pointer;font-size:18px;line-height:1;padding:6px 8px;border-radius:6px;opacity:.55;transition:all .15s;}
.bqep-tab:hover{opacity:.85;background:var(--bq-bg-hover);}
.bqep-tab.active{opacity:1;background:var(--bq-bg-hover);box-shadow:inset 0 -2px 0 var(--bq-accent);}
.bqep-panes{flex:1;min-height:0;overflow:hidden;position:relative;}
.bqep-pane{display:none;padding:8px;height:100%;overflow-y:auto;flex-wrap:wrap;gap:2px;align-content:flex-start;scrollbar-width:thin;}
.bqep-pane.active{display:flex;}
.bqep-pane::-webkit-scrollbar{width:5px;}
.bqep-pane::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px;}
.bqepbtn{width:32px;height:32px;background:none;border:none;cursor:pointer;border-radius:6px;font-size:20px;display:flex;align-items:center;justify-content:center;transition:transform .12s,background .12s;line-height:1;flex:0 0 auto;}
.bqepbtn:hover{background:var(--bq-bg-hover);transform:scale(1.2);}
.bqrxns{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;padding:0 6px;}
.bqr.theirs .bqrxns{justify-content:flex-start;}
.bqr.mine .bqrxns{justify-content:flex-end;}
.bqrxn{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(255,255,255,.06);border:1px solid var(--bq-border);
  border-radius:20px;padding:3px 8px;cursor:pointer;font-size:13px;
  transition:all .18s;
}
.bqrxn:hover{background:rgba(255,255,255,.12);transform:scale(1.05);}
.bqrxn.mr{background:rgba(96,165,250,.15);border-color:rgba(96,165,250,.3);}
.bqrxn-n{font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:var(--bq-text-muted);}

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
.bqtyp{min-height:24px;padding:2px 16px 8px;flex-shrink:0;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.02em;color:var(--bq-text-subtle);display:flex;align-items:center;gap:8px;}
.bqtd{display:flex;gap:4px;align-items:center;padding:6px 10px;background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:12px 12px 12px 4px;width:fit-content;}
.bqtd span{width:5px;height:5px;background:var(--bq-accent);border-radius:50%;animation:bqTd 1.4s ease infinite;opacity:.4;}
.bqtd span:nth-child(2){animation-delay:.2s;}.bqtd span:nth-child(3){animation-delay:.4s;}
@keyframes bqTd{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}

/* ── INPUT ── */
.bqiw{border-top:1px solid var(--bq-border);padding:12px 14px;flex-shrink:0;background:var(--bq-bg-elevated);}
/* Quick Stickers panel (replaces plain emoji tray) */
.bqiet{
  display:none;flex-wrap:wrap;gap:4px;padding:10px;margin-bottom:10px;
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));
  border:1px solid var(--bq-border);border-radius:14px;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.bqiet.open{display:flex;animation:bqGifIn .18s var(--bq-transition) both;}
.bqiet::before{
  content:'Tap to send a sticker';display:block;width:100%;
  font-family:'Inter',sans-serif;font-size:10px;font-weight:700;letter-spacing:.08em;
  color:var(--bq-text-subtle);text-transform:uppercase;margin-bottom:4px;padding:0 2px;
}
.bqietb{
  width:38px;height:38px;background:rgba(255,255,255,.04);border:1px solid transparent;
  cursor:pointer;border-radius:10px;font-size:22px;display:flex;align-items:center;justify-content:center;
  transition:transform .18s var(--bq-transition),background .15s,border-color .15s;line-height:1;
}
.bqietb:hover{background:rgba(255,255,255,.09);border-color:var(--bq-accent);transform:scale(1.18) rotate(-6deg);}
.bqietb:active{transform:scale(.92);}
/* Sticker bubble (large emoji) */
.bqbbl.sticker{
  background:transparent!important;border:none!important;box-shadow:none!important;padding:2px 0 0!important;
}
.bqbbl.sticker .bqsticker{
  font-size:56px;line-height:1.1;display:block;
  filter:drop-shadow(0 4px 14px rgba(0,0,0,.35));
  animation:bqStickerPop .55s cubic-bezier(.34,1.56,.64,1) both;
  cursor:default;user-select:none;
}
.bqbbl.sticker .bqbbl-meta{color:var(--bq-text-subtle)!important;background:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;position:static!important;float:right;margin-top:4px!important;}
@keyframes bqStickerPop{
  0%{transform:scale(.2) rotate(-12deg);opacity:0;}
  60%{transform:scale(1.15) rotate(4deg);opacity:1;}
  100%{transform:scale(1) rotate(0);opacity:1;}
}
/* Bubble hover lift */
.bqbbl{transition:transform .18s var(--bq-transition),box-shadow .2s ease;}
.bqr:hover .bqbbl:not(.sticker){transform:translateY(-1px);}
.bqr.mine:hover .bqbbl:not(.sticker){box-shadow:0 6px 20px rgba(96,165,250,.38);}
/* Reaction pop animation */
.bqrxn{animation:bqRxnPop .35s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes bqRxnPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}}
/* Make the reaction picker scrollable since we have more reactions */
/* v9.2: legacy width override removed — full picker uses .bqepick rules above */
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
#bqdml{flex:1;overflow-y:auto;padding:0;}
#bqdml::-webkit-scrollbar{width:3px;}
#bqdml::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
#bqdml::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.14);}

/* DM search */
.bqdm-search-wrap{padding:10px 12px 6px;flex-shrink:0;}
.bqdm-search{
  display:flex;align-items:center;gap:8px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:10px;
  padding:8px 12px;transition:all .2s;
}
.bqdm-search:focus-within{border-color:rgba(96,165,250,.35);box-shadow:0 0 0 3px rgba(96,165,250,.08);}
.bqdm-search svg{width:13px;height:13px;stroke:var(--bq-text-subtle);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bqdm-search-inp{
  flex:1;background:none;border:none;outline:none;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:var(--bq-text);
  letter-spacing:.01em;
}
.bqdm-search-inp::placeholder{color:var(--bq-text-subtle);}

/* DM section header */
.bqdm-section-lbl{
  padding:6px 16px 4px;
  font-family:'Inter',sans-serif;font-size:9px;font-weight:700;letter-spacing:.14em;
  color:var(--bq-text-subtle);text-transform:uppercase;
}

/* DM row */
.bqdmr{
  display:flex;align-items:center;gap:12px;
  padding:10px 14px;cursor:pointer;position:relative;
  transition:background .16s;
  border-left:2px solid transparent;
}
.bqdmr:hover{background:rgba(255,255,255,.03);border-left-color:rgba(96,165,250,.25);}
.bqdmr.unread-row{border-left-color:var(--bq-accent);}
.bqdmr.active-row{background:rgba(96,165,250,.06);border-left-color:var(--bq-accent);}

/* DM Avatar */
.bqdmav{
  width:44px;height:44px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:800;
  position:relative;transition:transform .2s var(--bq-transition);
  box-shadow:0 2px 8px rgba(0,0,0,.3);
}
.bqdmr:hover .bqdmav{transform:scale(1.04);}
.bqdmav::after{
  content:'';position:absolute;bottom:1px;right:1px;
  width:11px;height:11px;border-radius:50%;background:#2a2a2a;
  border:2.5px solid var(--bq-bg);transition:background .3s;
}
.bqdmav[data-status="online"]::after{background:var(--bq-success);}
.bqdmav[data-status="studying"]::after{background:var(--bq-accent);}
.bqdmav[data-status="away"]::after{background:var(--bq-warning);}
.bqdmav[data-status="busy"]::after{background:var(--bq-danger);}

/* DM info */
.bqdmin{flex:1;min-width:0;}
.bqdmn{
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  letter-spacing:.01em;color:var(--bq-text);
  display:flex;align-items:center;gap:5px;
}
.bqdmn-pin{font-size:10px;opacity:.7;flex-shrink:0;}
.bqdmn-alias{font-size:11px;color:var(--bq-text-subtle);font-weight:500;}
.bqdmp{
  font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-subtle);
  letter-spacing:.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  margin-top:2px;line-height:1.3;transition:color .2s;
}
.bqdmp.unr{color:var(--bq-text-muted);font-weight:600;}

/* DM meta (time + badge) */
.bqdmm{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0;min-width:36px;}
.bqdmt{
  font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.02em;
  color:var(--bq-text-subtle);white-space:nowrap;
}
.bqdmub{
  min-width:18px;height:18px;border-radius:9px;
  background:linear-gradient(135deg,var(--bq-accent),#818cf8);
  font-family:'Inter',sans-serif;font-size:9px;font-weight:800;color:#fff;
  display:flex;align-items:center;justify-content:center;padding:0 5px;
  animation:bqPop .25s var(--bq-transition) both;
  box-shadow:0 2px 8px rgba(96,165,250,.4);
}

/* DM row divider */
.bqdmdiv{height:1px;background:var(--bq-border);margin:0 14px;opacity:.5;}

/* DM row hover actions (pin / delete) */
.bqdmr-acts{
  position:absolute;right:10px;top:50%;transform:translateY(-50%);
  display:flex;gap:4px;
  opacity:0;translate:6px 0;
  transition:opacity .18s,translate .18s;
  pointer-events:none;
}
.bqdmr:hover .bqdmr-acts{opacity:1;translate:0 0;pointer-events:all;}
.bqdmr-act{
  width:28px;height:28px;border-radius:7px;border:1px solid var(--bq-border);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  background:var(--bq-bg-elevated);transition:all .16s;
}
.bqdmr-act svg{width:12px;height:12px;fill:none;stroke:var(--bq-text-muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bqdmr-act.bq-pin:hover{background:rgba(96,165,250,.15);border-color:rgba(96,165,250,.3);}
.bqdmr-act.bq-pin:hover svg,.bqdmr-act.bq-pin.pinned svg{stroke:var(--bq-accent);}
.bqdmr-act.bq-del:hover{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3);}
.bqdmr-act.bq-del:hover svg{stroke:var(--bq-danger);}
.bqdmr-confirm{
  position:absolute;inset:0;background:rgba(10,10,10,.97);
  display:none;align-items:center;gap:10px;padding:0 14px;
  border-left:2px solid var(--bq-danger);
}
.bqdmr-confirm.show{display:flex;}
.bqdmr-confirm-msg{font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.02em;color:var(--bq-text-muted);flex:1;}
.bqdmr-cyes{padding:6px 12px;background:var(--bq-danger);border:none;border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:#fff;transition:all .15s;}
.bqdmr-cyes:hover{background:#ef4444;}
.bqdmr-cno{padding:6px 12px;background:var(--bq-bg);border:1px solid var(--bq-border);border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:var(--bq-text-muted);transition:all .15s;}
.bqdm-pin{font-size:10px;opacity:.6;} /* kept for JS compat */

/* ── DM CONVERSATION HEADER ── */
.bqdmhav{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:800;
  position:relative;cursor:pointer;transition:transform .2s var(--bq-transition);
  box-shadow:0 2px 8px rgba(0,0,0,.3);
}
.bqdmhav:hover{transform:scale(1.1);}
.bqdmhav::after{
  content:'';position:absolute;bottom:0;right:0;
  width:10px;height:10px;border-radius:50%;background:#333;
  border:2px solid var(--bq-bg-elevated);transition:background .3s;
}
.bqdmhav[data-status="online"]::after{background:var(--bq-success);}
.bqdmhav[data-status="studying"]::after{background:var(--bq-accent);}
.bqdmhav[data-status="away"]::after{background:var(--bq-warning);}
.bqdmhav[data-status="busy"]::after{background:var(--bq-danger);}
.bqdmhi{flex:1;min-width:0;}
.bqdmhn{
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  letter-spacing:.01em;color:var(--bq-text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.bqdmhs{
  font-family:'Inter',sans-serif;font-size:11px;letter-spacing:.02em;
  color:var(--bq-text-subtle);margin-top:1px;
  display:flex;align-items:center;gap:5px;
}
.bqdmhs-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:bqPulseGreen 2s ease infinite;}
@keyframes bqPulseGreen{0%,100%{opacity:1}50%{opacity:.5}}

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

/* DM mine bubble — warmer gradient */
#bqdmmsgs .bqr.mine .bqbbl{
  background:linear-gradient(140deg,var(--bq-accent) 0%,#818cf8 100%);
  box-shadow:0 3px 14px rgba(96,165,250,.25);
}
/* DM theirs bubble — slightly elevated */
#bqdmmsgs .bqr.theirs .bqbbl{
  background:linear-gradient(145deg,#1c1c24 0%,#181820 100%);
  border-color:rgba(255,255,255,.09);
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

/* ── MESSAGE READ RECEIPTS ── */
/* Legacy .bqread rules removed — read receipts now live inside .bqbbl-meta */
.bqread{display:none;}

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

/* ── DM LIST ACTIONS (merged above) ── */
/* .bqdmr-acts already defined in DM LIST section */

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
/* ────────────────────────────────────────────
   DM INFO PANEL (slides from right inside dmconv)
──────────────────────────────────────────── */
#bq-dm-info{
  position:absolute;top:0;right:-100%;bottom:0;
  width:80%;max-width:260px;
  background:var(--bq-bg-elevated);
  border-left:1px solid var(--bq-border);
  z-index:120;
  transition:right .3s cubic-bezier(.16,1,.3,1);
  display:flex;flex-direction:column;overflow:hidden;
}
#bq-dm-info.open{right:0;}
.bq-info-hdr{
  display:flex;align-items:center;gap:10px;
  padding:14px 14px 12px;border-bottom:1px solid var(--bq-border);flex-shrink:0;
}
.bq-info-hdr-title{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:var(--bq-text);flex:1;}
.bq-info-close{background:none;border:none;cursor:pointer;padding:4px;color:var(--bq-text-subtle);transition:color .15s;border-radius:6px;line-height:0;}
.bq-info-close:hover{color:var(--bq-text);background:var(--bq-bg-hover);}
.bq-info-close svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}
.bq-info-av-section{
  display:flex;flex-direction:column;align-items:center;gap:8px;
  padding:20px 16px 16px;border-bottom:1px solid var(--bq-border);flex-shrink:0;
}
.bq-info-av{
  width:64px;height:64px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:22px;font-weight:900;
  box-shadow:0 4px 20px rgba(0,0,0,.4);
  position:relative;
}
.bq-info-av::after{
  content:'';position:absolute;bottom:2px;right:2px;
  width:13px;height:13px;border-radius:50%;background:#444;
  border:3px solid var(--bq-bg-elevated);transition:background .3s;
}
.bq-info-av.online::after{background:var(--bq-success);}
.bq-info-av.studying::after{background:var(--bq-accent);}
.bq-info-av.away::after{background:var(--bq-warning);}
.bq-info-av.busy::after{background:var(--bq-danger);}
.bq-info-name{font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:var(--bq-text);}
.bq-info-status{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);}
.bq-info-bio{
  font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);
  line-height:1.5;text-align:center;padding:0 4px;
}
.bq-info-scroll{flex:1;overflow-y:auto;padding:0;}
.bq-info-scroll::-webkit-scrollbar{width:3px;}
.bq-info-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bq-info-section{padding:14px 16px;border-bottom:1px solid var(--bq-border);}
.bq-info-section-title{font-family:'Inter',sans-serif;font-size:9px;letter-spacing:.14em;color:var(--bq-text-subtle);text-transform:uppercase;margin-bottom:10px;}
.bq-info-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 0;cursor:pointer;transition:opacity .15s;
}
.bq-info-row:hover{opacity:.8;}
.bq-info-row-left{display:flex;align-items:center;gap:10px;}
.bq-info-row-ic{
  width:30px;height:30px;border-radius:8px;background:var(--bq-bg);
  border:1px solid var(--bq-border);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.bq-info-row-ic svg{width:14px;height:14px;stroke:var(--bq-text-muted);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.bq-info-row-label{font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:var(--bq-text);}
.bq-info-row-sub{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);margin-top:1px;}
.bq-info-row-value{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-subtle);}
.bq-info-row.danger .bq-info-row-label{color:#ef4444;}
.bq-info-row.danger .bq-info-row-ic svg{stroke:#ef4444;}

/* Toggle switch */
.bq-toggle{position:relative;width:40px;height:22px;flex-shrink:0;}
.bq-toggle input{opacity:0;width:0;height:0;position:absolute;}
.bq-toggle-slider{
  position:absolute;inset:0;border-radius:11px;
  background:var(--bq-bg);border:1px solid var(--bq-border);
  cursor:pointer;transition:all .22s;
}
.bq-toggle-slider::before{
  content:'';position:absolute;width:14px;height:14px;border-radius:50%;
  background:var(--bq-text-subtle);left:3px;top:50%;transform:translateY(-50%);
  transition:all .22s;
}
.bq-toggle input:checked + .bq-toggle-slider{background:rgba(96,165,250,.2);border-color:var(--bq-accent);}
.bq-toggle input:checked + .bq-toggle-slider::before{background:var(--bq-accent);transform:translate(18px,-50%);}

/* ── STARRED MESSAGES PANEL ── */
#bq-starred-panel{
  position:absolute;inset:0;z-index:130;
  background:var(--bq-bg);
  display:flex;flex-direction:column;
  transform:translateX(100%);transition:transform .3s cubic-bezier(.16,1,.3,1);
}
#bq-starred-panel.open{transform:translateX(0);}
#bq-starred-list{flex:1;overflow-y:auto;padding:8px 12px;}
#bq-starred-list::-webkit-scrollbar{width:3px;}
#bq-starred-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bq-starred-item{
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius-sm);padding:12px 14px;margin-bottom:8px;
  cursor:pointer;transition:all .18s;position:relative;
}
.bq-starred-item:hover{border-color:var(--bq-border-hover);background:var(--bq-bg-hover);}
.bq-starred-from{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:var(--bq-accent);margin-bottom:4px;}
.bq-starred-text{font-family:'Inter',sans-serif;font-size:13px;color:var(--bq-text);line-height:1.5;}
.bq-starred-ts{font-family:'Inter',sans-serif;font-size:10px;color:var(--bq-text-subtle);margin-top:6px;}
.bq-starred-unstar{
  position:absolute;top:8px;right:8px;
  background:none;border:none;cursor:pointer;
  color:var(--bq-text-subtle);padding:4px;border-radius:4px;transition:color .15s;line-height:0;
}
.bq-starred-unstar:hover{color:#fbbf24;}
.bq-starred-unstar svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}

/* ── DM BACKGROUND THEMES ── */

/* v8: theme covers whole widget */
#bqp[class*="bq-theme-"] #bqdmmsgs,
#bqp[class*="bq-theme-"] #bqgmsgs,
#bqp[class*="bq-theme-"] .bqiw,
#bqp[class*="bq-theme-"] .bqdmh,
#bqp[class*="bq-theme-"] .bqv{background:transparent!important;background-color:transparent!important;}
/* v8: make sure the theme class moves from msgs container up to #bqp */

#bqp.bq-theme-none{background:var(--bq-bg);}
#bqp.bq-theme-grid{background:var(--bq-bg) url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40L40 0M0 0l40 40' stroke='rgba(255,255,255,.04)' stroke-width='.5'/%3E%3C/svg%3E") repeat;}
#bqp.bq-theme-dots{background:var(--bq-bg) radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px) 0 0/24px 24px;}
#bqp.bq-theme-wave{background:linear-gradient(180deg,rgba(96,165,250,.05) 0%,transparent 60%),var(--bq-bg);}
#bqp.bq-theme-aurora{background:radial-gradient(ellipse at 20% 50%,rgba(96,165,250,.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(167,139,250,.06) 0%,transparent 50%),var(--bq-bg);background-size:200% 200%;animation:bqAurora 18s ease infinite;}
#bqp.bq-theme-sunset{background:radial-gradient(ellipse at 30% 100%,rgba(251,146,60,.10) 0%,transparent 55%),radial-gradient(ellipse at 80% 0%,rgba(244,114,182,.08) 0%,transparent 50%),var(--bq-bg);}
#bqp.bq-theme-ocean{background:linear-gradient(180deg,rgba(45,212,191,.06) 0%,rgba(56,189,248,.04) 50%,transparent 100%),var(--bq-bg);}
#bqp.bq-theme-midnight{background:radial-gradient(ellipse at top,#1e1b4b 0%,#0a0a14 70%);}
#bqp.bq-theme-forest{background:linear-gradient(160deg,rgba(34,197,94,.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(20,184,166,.05) 0%,transparent 50%),var(--bq-bg);}
#bqp.bq-theme-rose{background:radial-gradient(ellipse at 50% 0%,rgba(244,114,182,.10) 0%,transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(251,113,133,.06) 0%,transparent 50%),var(--bq-bg);}
#bqp.bq-theme-mono{background:#0a0a0a;}
#bqp.bq-theme-bubblegum{background:radial-gradient(circle at 20% 20%,rgba(236,72,153,.10) 0%,transparent 40%),radial-gradient(circle at 80% 80%,rgba(168,85,247,.10) 0%,transparent 40%),var(--bq-bg);}
@keyframes bqAurora{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

/* ── BUBBLE THEME for mine in DM ── */
#bqv-dmconv .bqr.mine .bqbbl{
  background:linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)!important;
  color:#fff!important;
  border:none!important;
  box-shadow:0 2px 12px rgba(59,130,246,.3),inset 0 1px 0 rgba(255,255,255,.12)!important;
}
/* Per-theme bubble color overrides (mine, in DM) */
#bqp.bq-theme-sunset .bqr.mine .bqbbl{background:linear-gradient(135deg,#fb923c 0%,#f43f5e 100%)!important;box-shadow:0 4px 16px rgba(244,63,94,.32),inset 0 1px 0 rgba(255,255,255,.18)!important;}
.bq-theme-ocean  #bqdmmsgs .bqr.mine .bqbbl{background:linear-gradient(135deg,#06b6d4 0%,#0ea5e9 100%)!important;box-shadow:0 4px 16px rgba(14,165,233,.32),inset 0 1px 0 rgba(255,255,255,.18)!important;}
#bqp.bq-theme-midnight .bqr.mine .bqbbl{background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%)!important;box-shadow:0 4px 18px rgba(168,85,247,.4),inset 0 1px 0 rgba(255,255,255,.18)!important;}
#bqp.bq-theme-forest .bqr.mine .bqbbl{background:linear-gradient(135deg,#10b981 0%,#14b8a6 100%)!important;box-shadow:0 4px 16px rgba(16,185,129,.32),inset 0 1px 0 rgba(255,255,255,.18)!important;}
.bq-theme-rose   #bqdmmsgs .bqr.mine .bqbbl{background:linear-gradient(135deg,#ec4899 0%,#f472b6 100%)!important;box-shadow:0 4px 16px rgba(236,72,153,.32),inset 0 1px 0 rgba(255,255,255,.18)!important;}
.bq-theme-mono   #bqdmmsgs .bqr.mine .bqbbl{background:linear-gradient(135deg,#27272a 0%,#3f3f46 100%)!important;box-shadow:0 4px 14px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)!important;}
#bqp.bq-theme-bubblegum .bqr.mine .bqbbl{background:linear-gradient(135deg,#a855f7 0%,#ec4899 100%)!important;box-shadow:0 4px 18px rgba(168,85,247,.4),inset 0 1px 0 rgba(255,255,255,.2)!important;}
/* v9: Crimson theme */
#bqp.bq-theme-crimson{background:radial-gradient(ellipse at top,#1a0306 0%,#000 75%);}
#bqp.bq-theme-crimson .bqr.mine .bqbbl{background:linear-gradient(135deg,#dc143c 0%,#9b1230 100%)!important;color:#fff!important;box-shadow:0 4px 18px rgba(220,20,60,.45),inset 0 1px 0 rgba(255,255,255,.18)!important;}
#bqp.bq-theme-crimson .bqr.theirs .bqbbl{background:rgba(220,20,60,.10)!important;border-color:rgba(220,20,60,.25)!important;color:#fce7eb!important;}
#bqp.bq-theme-crimson .bqun{color:#fca5a5!important;}
/* v9: WhatsApp Light theme */
#bqp.bq-theme-walight{background:#efeae2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6z' fill='rgba(0,0,0,.03)'/%3E%3C/svg%3E");}
#bqp.bq-theme-walight .bqdmh,#bqp.bq-theme-walight .bqiw{background:#075e54!important;color:#fff!important;}
#bqp.bq-theme-walight .bqr.mine .bqbbl{background:#dcf8c6!important;color:#0b141a!important;border:none!important;box-shadow:0 1px 1px rgba(0,0,0,.13)!important;}
#bqp.bq-theme-walight .bqr.theirs .bqbbl{background:#fff!important;color:#0b141a!important;border:none!important;box-shadow:0 1px 1px rgba(0,0,0,.13)!important;}
#bqp.bq-theme-walight .bqun{color:#075e54!important;}
#bqp.bq-theme-walight .bqbbl-meta{color:#667781!important;}
#bqp.bq-theme-walight .bqbbl-tick svg{stroke:#53bdeb!important;}
/* v9: WhatsApp Dark theme */
#bqp.bq-theme-wadark{background:#0b141a url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6z' fill='rgba(255,255,255,.02)'/%3E%3C/svg%3E");}
#bqp.bq-theme-wadark .bqdmh,#bqp.bq-theme-wadark .bqiw{background:#1f2c33!important;color:#e9edef!important;}
#bqp.bq-theme-wadark .bqr.mine .bqbbl{background:#005c4b!important;color:#e9edef!important;border:none!important;box-shadow:0 1px 1px rgba(0,0,0,.4)!important;}
#bqp.bq-theme-wadark .bqr.theirs .bqbbl{background:#202c33!important;color:#e9edef!important;border:none!important;box-shadow:0 1px 1px rgba(0,0,0,.4)!important;}
#bqp.bq-theme-wadark .bqun{color:#00a884!important;}
#bqp.bq-theme-wadark .bqbbl-meta{color:#8696a0!important;}
#bqp.bq-theme-wadark .bqbbl-tick svg{stroke:#53bdeb!important;}
/* v9: perf — let off-screen rows skip layout */
#bqgmsgs .bqr,#bqdmmsgs .bqr{content-visibility:auto;contain-intrinsic-size:auto 80px;}


#bqp.bq-theme-light{background:linear-gradient(180deg,#f8fafc 0%,#e2e8f0 100%)!important;color:#0f172a!important;}
#bqp.bq-theme-light .bqv,#bqp.bq-theme-light .bqlst,#bqp.bq-theme-light #bqdmlist,#bqp.bq-theme-light .bqcomp,#bqp.bq-theme-light .bqsettings,#bqp.bq-theme-light .bq-info-scroll,#bqp.bq-theme-light .bq-profile-scroll{background:transparent!important;color:#0f172a!important;}
#bqp.bq-theme-light .bqdmh,#bqp.bq-theme-light .bqgh,#bqp.bq-theme-light .bqsh,#bqp.bq-theme-light .bq-info-header,#bqp.bq-theme-light .bq-profile-header{background:#ffffff!important;color:#0f172a!important;border-color:#dbe3ee!important;}
#bqp.bq-theme-light .bqiw,#bqp.bq-theme-light .bqgi,#bqp.bq-theme-light input,#bqp.bq-theme-light textarea{background:#ffffff!important;color:#0f172a!important;border-color:#dbe3ee!important;}
#bqp.bq-theme-light .bqr.mine .bqbbl{background:linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)!important;color:#fff!important;border:none!important;box-shadow:0 8px 24px rgba(37,99,235,.18)!important;}
#bqp.bq-theme-light .bqr.theirs .bqbbl{background:#ffffff!important;color:#0f172a!important;border:1px solid #dbe3ee!important;box-shadow:0 4px 12px rgba(15,23,42,.06)!important;}
#bqp.bq-theme-light .bqun,#bqp.bq-theme-light .bq-info-section-title{color:#1d4ed8!important;}
#bqp.bq-theme-light .bqbbl-meta,#bqp.bq-theme-light .bqds,#bqp.bq-theme-light .bqifooter,#bqp.bq-theme-light .bqih{color:#64748b!important;}
#bqp.bq-theme-whatsapp{background:#ece5dd!important;color:#0b141a!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;}
#bqp.bq-theme-whatsapp .bqv,#bqp.bq-theme-whatsapp .bqlst,#bqp.bq-theme-whatsapp #bqdmlist,#bqp.bq-theme-whatsapp .bqcomp,#bqp.bq-theme-whatsapp .bqsettings,#bqp.bq-theme-whatsapp .bq-info-scroll,#bqp.bq-theme-whatsapp .bq-profile-scroll{background:transparent!important;color:#0b141a!important;}
#bqp.bq-theme-whatsapp .bqdmh,#bqp.bq-theme-whatsapp .bqgh,#bqp.bq-theme-whatsapp .bqsh,#bqp.bq-theme-whatsapp .bq-info-header,#bqp.bq-theme-whatsapp .bq-profile-header{background:#075e54!important;color:#fff!important;border-color:#054d44!important;}
#bqp.bq-theme-whatsapp .bqiw,#bqp.bq-theme-whatsapp .bqgi,#bqp.bq-theme-whatsapp input,#bqp.bq-theme-whatsapp textarea{background:#ffffff!important;color:#0b141a!important;border-color:#d1d7db!important;}
#bqp.bq-theme-whatsapp .bqr.mine .bqbbl{background:#dcf8c6!important;color:#0b141a!important;border:none!important;box-shadow:0 1px 1px rgba(0,0,0,.12)!important;}
#bqp.bq-theme-whatsapp .bqr.theirs .bqbbl{background:#ffffff!important;color:#0b141a!important;border:none!important;box-shadow:0 1px 1px rgba(0,0,0,.12)!important;}
#bqp.bq-theme-whatsapp .bqun,#bqp.bq-theme-whatsapp .bq-info-section-title{color:#075e54!important;}
#bqp.bq-theme-whatsapp .bqbbl-meta,#bqp.bq-theme-whatsapp .bqds,#bqp.bq-theme-whatsapp .bqifooter,#bqp.bq-theme-whatsapp .bqih{color:#667781!important;}

/* v9.2: Pure Black theme */
#bqp.bq-theme-black{background:#000!important;}
#bqp.bq-theme-black .bqr.mine .bqbbl{background:#1a1a1a!important;color:#fff!important;border:1px solid #2a2a2a!important;box-shadow:none!important;}
#bqp.bq-theme-black .bqr.theirs .bqbbl{background:#0d0d0d!important;color:#e5e5e5!important;border:1px solid #1a1a1a!important;}
#bqp.bq-theme-black .bqun{color:#a3a3a3!important;}
#bqp.bq-theme-black .bqbbl-meta{color:#737373!important;}

/* v9.2: Apply selected theme to the WHOLE widget (lists, headers, settings, composer) */
#bqp.bq-theme-walight,
#bqp.bq-theme-walight .bqv,
#bqp.bq-theme-walight .bqlst,
#bqp.bq-theme-walight #bqdmlist,
#bqp.bq-theme-walight .bqcomp,
#bqp.bq-theme-walight .bqsettings,
#bqp.bq-theme-walight .bq-info-scroll,
#bqp.bq-theme-walight .bq-profile-scroll{color:#0b141a!important;}
#bqp.bq-theme-walight .bqlst,#bqp.bq-theme-walight #bqdmlist,#bqp.bq-theme-walight .bqcomp,#bqp.bq-theme-walight .bqsettings,#bqp.bq-theme-walight .bq-info-scroll,#bqp.bq-theme-walight .bq-profile-scroll{background:#efeae2!important;}
#bqp.bq-theme-walight .bqdmh,#bqp.bq-theme-walight .bqgh,#bqp.bq-theme-walight .bqsh,#bqp.bq-theme-walight .bq-info-header,#bqp.bq-theme-walight .bq-profile-header{background:#075e54!important;color:#fff!important;border-color:#054d44!important;}
#bqp.bq-theme-walight .bqiw,#bqp.bq-theme-walight .bqgi{background:#f0f2f5!important;border-color:#d1d7db!important;}
#bqp.bq-theme-walight .bqlst-item,#bqp.bq-theme-walight .bqdml,#bqp.bq-theme-walight .bq-info-row,#bqp.bq-theme-walight .bq-info-section{background:transparent!important;color:#0b141a!important;border-color:#e9edef!important;}
#bqp.bq-theme-walight .bqlst-item:hover,#bqp.bq-theme-walight .bqdml:hover{background:rgba(0,0,0,.04)!important;}
#bqp.bq-theme-walight .bq-info-section-title{color:#075e54!important;}
#bqp.bq-theme-walight input,#bqp.bq-theme-walight textarea{background:#fff!important;color:#0b141a!important;border-color:#d1d7db!important;}

#bqp.bq-theme-wadark,
#bqp.bq-theme-wadark .bqv,
#bqp.bq-theme-wadark .bqlst,
#bqp.bq-theme-wadark #bqdmlist,
#bqp.bq-theme-wadark .bqcomp,
#bqp.bq-theme-wadark .bqsettings,
#bqp.bq-theme-wadark .bq-info-scroll,
#bqp.bq-theme-wadark .bq-profile-scroll{color:#e9edef!important;}
#bqp.bq-theme-wadark .bqlst,#bqp.bq-theme-wadark #bqdmlist,#bqp.bq-theme-wadark .bqcomp,#bqp.bq-theme-wadark .bqsettings,#bqp.bq-theme-wadark .bq-info-scroll,#bqp.bq-theme-wadark .bq-profile-scroll{background:#0b141a!important;}
#bqp.bq-theme-wadark .bqdmh,#bqp.bq-theme-wadark .bqgh,#bqp.bq-theme-wadark .bqsh,#bqp.bq-theme-wadark .bq-info-header,#bqp.bq-theme-wadark .bq-profile-header{background:#1f2c33!important;color:#e9edef!important;border-color:#222e35!important;}
#bqp.bq-theme-wadark .bqiw,#bqp.bq-theme-wadark .bqgi{background:#1f2c33!important;border-color:#222e35!important;}
#bqp.bq-theme-wadark .bqlst-item,#bqp.bq-theme-wadark .bqdml,#bqp.bq-theme-wadark .bq-info-row,#bqp.bq-theme-wadark .bq-info-section{background:transparent!important;color:#e9edef!important;border-color:#222e35!important;}
#bqp.bq-theme-wadark .bqlst-item:hover,#bqp.bq-theme-wadark .bqdml:hover{background:#202c33!important;}
#bqp.bq-theme-wadark .bq-info-section-title{color:#00a884!important;}
#bqp.bq-theme-wadark input,#bqp.bq-theme-wadark textarea{background:#2a3942!important;color:#e9edef!important;border-color:#222e35!important;}

#bqp.bq-theme-crimson .bqv,
#bqp.bq-theme-crimson .bqlst,
#bqp.bq-theme-crimson #bqdmlist,
#bqp.bq-theme-crimson .bqcomp,
#bqp.bq-theme-crimson .bqsettings,
#bqp.bq-theme-crimson .bq-info-scroll,
#bqp.bq-theme-crimson .bq-profile-scroll{background:transparent!important;color:#fce7eb!important;}
#bqp.bq-theme-crimson .bqdmh,#bqp.bq-theme-crimson .bqgh,#bqp.bq-theme-crimson .bqsh,#bqp.bq-theme-crimson .bq-info-header,#bqp.bq-theme-crimson .bq-profile-header{background:linear-gradient(180deg,#1a0306,#0a0102)!important;color:#fce7eb!important;border-color:rgba(220,20,60,.25)!important;}
#bqp.bq-theme-crimson .bqiw,#bqp.bq-theme-crimson .bqgi{background:rgba(220,20,60,.06)!important;border-color:rgba(220,20,60,.2)!important;}
#bqp.bq-theme-crimson .bqlst-item:hover,#bqp.bq-theme-crimson .bqdml:hover{background:rgba(220,20,60,.08)!important;}
#bqp.bq-theme-crimson .bq-info-section-title{color:#dc143c!important;}

#bqp.bq-theme-black .bqv,
#bqp.bq-theme-black .bqlst,
#bqp.bq-theme-black #bqdmlist,
#bqp.bq-theme-black .bqcomp,
#bqp.bq-theme-black .bqsettings,
#bqp.bq-theme-black .bq-info-scroll,
#bqp.bq-theme-black .bq-profile-scroll{background:#000!important;color:#e5e5e5!important;}
#bqp.bq-theme-black .bqdmh,#bqp.bq-theme-black .bqgh,#bqp.bq-theme-black .bqsh,#bqp.bq-theme-black .bq-info-header,#bqp.bq-theme-black .bq-profile-header{background:#0a0a0a!important;color:#fff!important;border-color:#1a1a1a!important;}
#bqp.bq-theme-black .bqiw,#bqp.bq-theme-black .bqgi{background:#0a0a0a!important;border-color:#1a1a1a!important;}
#bqp.bq-theme-black .bqlst-item:hover,#bqp.bq-theme-black .bqdml:hover{background:#0d0d0d!important;}
#bqp.bq-theme-black .bq-info-section-title{color:#a3a3a3!important;}
#bqp.bq-theme-black input,#bqp.bq-theme-black textarea{background:#0a0a0a!important;color:#e5e5e5!important;border-color:#1a1a1a!important;}

/* Per-theme theirs bubble subtle tints */
#bqp.bq-theme-sunset .bqr.theirs .bqbbl{background:rgba(251,146,60,.08)!important;border-color:rgba(251,146,60,.2)!important;}
.bq-theme-ocean  #bqdmmsgs .bqr.theirs .bqbbl{background:rgba(14,165,233,.08)!important;border-color:rgba(14,165,233,.2)!important;}
#bqp.bq-theme-forest .bqr.theirs .bqbbl{background:rgba(16,185,129,.08)!important;border-color:rgba(16,185,129,.2)!important;}
.bq-theme-rose   #bqdmmsgs .bqr.theirs .bqbbl{background:rgba(236,72,153,.08)!important;border-color:rgba(236,72,153,.2)!important;}
.bq-theme-mono   #bqdmmsgs .bqr.theirs .bqbbl{background:#1a1a1a!important;border-color:rgba(255,255,255,.08)!important;}
#bqp.bq-theme-bubblegum .bqr.theirs .bqbbl{background:rgba(168,85,247,.08)!important;border-color:rgba(168,85,247,.2)!important;}
#bqv-dmconv .bqr.mine .bqbbl a{color:rgba(255,255,255,.9)!important;}
#bqv-dmconv .bqr.mine .bqrp{background:rgba(0,0,0,.18)!important;border-left-color:rgba(255,255,255,.35)!important;}
#bqv-dmconv .bqr.mine .bqrp-n{color:rgba(255,255,255,.65)!important;}
#bqv-dmconv .bqr.mine .bqrp-t{color:rgba(255,255,255,.5)!important;}
#bqv-dmconv .bqr.mine .bqun{display:none;}

/* ── STAR BUTTON in actions ── */
.bqact.star.starred svg{fill:#fbbf24;stroke:#fbbf24;}

/* ── DM PINNED MESSAGE BAR ── */
#bq-pinned-bar{
  display:none;align-items:center;gap:8px;
  padding:7px 13px;background:rgba(96,165,250,.08);
  border-bottom:1px solid rgba(96,165,250,.2);flex-shrink:0;cursor:pointer;
  transition:background .15s;
}
#bq-pinned-bar:hover{background:rgba(96,165,250,.13);}
#bq-pinned-bar.show{display:flex;}
.bq-pinbar-ic{color:var(--bq-accent);line-height:0;flex-shrink:0;}
.bq-pinbar-ic svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}
.bq-pinbar-body{flex:1;min-width:0;}
.bq-pinbar-label{font-family:'Inter',sans-serif;font-size:9px;letter-spacing:.1em;color:var(--bq-accent);font-weight:700;text-transform:uppercase;}
.bq-pinbar-text{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bq-pinbar-unpin{background:none;border:none;cursor:pointer;color:var(--bq-text-subtle);padding:2px 4px;border-radius:4px;transition:color .15s;line-height:0;flex-shrink:0;}
.bq-pinbar-unpin:hover{color:var(--bq-text);}
.bq-pinbar-unpin svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;}



/* ── MEDIA PREVIEW ── */
.bq-media-preview{
  display:none;padding:6px 10px;background:var(--bq-bg-elevated);
  border-top:1px solid var(--bq-border);flex-shrink:0;
  align-items:center;gap:10px;
}
.bq-media-preview.show{display:flex;animation:bqFadeDown .2s ease both;}
.bq-media-thumb{
  width:52px;height:52px;object-fit:cover;border-radius:var(--bq-radius-sm);
  border:1px solid var(--bq-border);flex-shrink:0;
}
.bq-media-name{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bq-media-rm{background:none;border:none;cursor:pointer;color:var(--bq-text-subtle);padding:4px;border-radius:4px;transition:color .15s;line-height:0;}
.bq-media-rm:hover{color:var(--bq-danger);}
.bq-media-rm svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

/* ── IMAGE IN MESSAGE BUBBLE ── */
.bq-msg-img{
  max-width:200px;max-height:200px;
  width:100%;border-radius:8px;display:block;cursor:pointer;
  border:1px solid rgba(255,255,255,.08);
  transition:opacity .2s;object-fit:cover;margin-bottom:4px;
}
.bq-msg-img:hover{opacity:.9;}

/* ── READ RECEIPT ── */
.bqread{display:none;}
.bq-msg-img:hover{opacity:.92;}

/* ── GIF MESSAGE ── */
.bq-msg-gif{
  max-width:240px;width:100%;border-radius:14px;display:block;cursor:pointer;
  border:1px solid rgba(255,255,255,.08);transition:transform .15s,opacity .2s;
  object-fit:cover;background:rgba(255,255,255,.04);
}
.bq-msg-gif:hover{opacity:.95;transform:scale(1.01);}

/* ── GIF PICKER PANEL ── */
.bqgifp{
  position:absolute;left:8px;right:8px;bottom:100%;margin-bottom:8px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.55);
  display:none;flex-direction:column;max-height:340px;z-index:30;overflow:hidden;
  animation:bqGifIn .18s var(--bq-transition) both;
}
@keyframes bqGifIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.bqgifp.open{display:flex;}
.bqgifp-head{padding:10px 10px 6px;border-bottom:1px solid var(--bq-border);display:flex;flex-direction:column;gap:8px;flex-shrink:0;}
.bqgifp-search{
  display:flex;align-items:center;gap:8px;background:var(--bq-bg);
  border:1px solid var(--bq-border);border-radius:10px;padding:7px 10px;
}
.bqgifp-search svg{width:14px;height:14px;stroke:var(--bq-text-subtle);fill:none;stroke-width:2;flex-shrink:0;}
.bqgifp-search input{
  flex:1;background:none;border:none;outline:none;color:var(--bq-text);
  font-family:'Inter',sans-serif;font-size:13px;
}
.bqgifp-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;}
.bqgifp-cats::-webkit-scrollbar{display:none;}
.bqgifp-cat{
  flex-shrink:0;padding:5px 11px;border-radius:14px;cursor:pointer;
  background:var(--bq-bg);border:1px solid var(--bq-border);
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:.02em;
  color:var(--bq-text-muted);transition:all .14s;white-space:nowrap;
}
.bqgifp-cat:hover{color:var(--bq-text);background:var(--bq-bg-hover);}
.bqgifp-cat.sel{background:var(--bq-accent);color:#fff;border-color:var(--bq-accent);}
.bqgifp-grid{
  flex:1;overflow-y:auto;padding:8px;
  column-count:2;column-gap:8px;
}
.bqgifp-grid::-webkit-scrollbar{width:5px;}
.bqgifp-grid::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px;}
.bqgifp-item{
  break-inside:avoid;margin-bottom:8px;display:block;width:100%;
  border-radius:10px;overflow:hidden;cursor:pointer;
  background:rgba(255,255,255,.04);border:1px solid transparent;
  transition:transform .15s,border-color .15s;
}
.bqgifp-item:hover{transform:scale(1.02);border-color:var(--bq-accent);}
.bqgifp-item img{width:100%;height:auto;display:block;}
.bqgifp-skel{
  break-inside:avoid;margin-bottom:8px;width:100%;border-radius:10px;
  background:linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.09),rgba(255,255,255,.04));
  background-size:200% 100%;animation:bqShim 1.2s linear infinite;
}
@keyframes bqShim{0%{background-position:200% 0}100%{background-position:-200% 0}}
.bqgifp-empty{padding:30px 16px;text-align:center;font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-subtle);}
.bqgifp-foot{padding:6px 10px;border-top:1px solid var(--bq-border);display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-shrink:0;font-family:'Inter',sans-serif;font-size:9px;letter-spacing:.06em;color:var(--bq-text-subtle);text-transform:uppercase;font-weight:700;}

/* GIF button (composer) */
.bqgifbtn{
  width:36px;height:36px;border-radius:50%;background:none;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;color:var(--bq-text-muted);
  font-family:'Inter',sans-serif;font-size:10px;font-weight:800;letter-spacing:.04em;
  transition:all .15s;flex-shrink:0;
}
.bqgifbtn:hover{background:var(--bq-bg-hover);color:var(--bq-accent);}
.bqgifbtn.active{background:rgba(96,165,250,.15);color:var(--bq-accent);}
.bqirow{position:relative;}


/* ── DM HEADER MENU ── */
.bq-dm-menu-dropdown{
  position:absolute;top:calc(100% + 6px);right:12px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);
  border-radius:var(--bq-radius-sm);padding:6px 0;min-width:190px;
  opacity:0;pointer-events:none;transform:translateY(-6px) scale(.96);
  transition:all .16s var(--bq-transition);z-index:200;
  box-shadow:0 12px 40px rgba(0,0,0,.5);
}
.bq-dm-menu-dropdown.open{opacity:1;pointer-events:all;transform:translateY(0) scale(1);}
.bq-dm-menu-item{
  display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:500;color:var(--bq-text);
  transition:background .1s;
}
.bq-dm-menu-item:hover{background:var(--bq-bg-hover);}
.bq-dm-menu-item.danger{color:#ef4444;}
.bq-dm-menu-item svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.bq-dm-menu-div{height:1px;background:var(--bq-border);margin:5px 0;}

/* ── THEME PICKER in info panel ── */
.bq-theme-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;}
.bq-theme-chip{
  width:36px;height:36px;border-radius:8px;cursor:pointer;
  border:2px solid transparent;transition:all .18s;position:relative;overflow:hidden;
}
.bq-theme-chip:hover{border-color:rgba(255,255,255,.3);transform:scale(1.08);}
.bq-theme-chip.sel{border-color:var(--bq-accent);}
.bq-theme-chip[data-t="none"]{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);}
.bq-theme-chip[data-t="light"]{background:linear-gradient(135deg,#ffffff 0%,#e2e8f0 100%);border-color:rgba(15,23,42,.08);}
.bq-theme-chip[data-t="whatsapp"]{background:linear-gradient(135deg,#dcf8c6 0%,#075e54 100%);}
.bq-theme-chip[data-t="black"]{background:linear-gradient(135deg,#0a0a0a 0%,#000 100%);border-color:rgba(255,255,255,.2);}
.bq-theme-chip.sel::after{content:'';position:absolute;inset:0;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.5);}

/* ── SCROLL TO BOTTOM BUTTON improved ── */
.bqscr{
  position:absolute;bottom:8px;right:14px;z-index:6;
  width:34px;height:34px;
  background:var(--bq-bg-elevated);
  border:1px solid var(--bq-border);border-radius:50%;
  cursor:pointer;display:none;align-items:center;justify-content:center;
  box-shadow:0 4px 16px rgba(0,0,0,.5);transition:all .2s;
}
.bqscr.show{display:flex;animation:bqPop .2s ease both;}
.bqscr:hover{border-color:var(--bq-border-hover);transform:scale(1.06);}
.bqscr svg{width:15px;height:15px;stroke:var(--bq-text-muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}

/* ── SEND ANIMATION ── */
@keyframes bqSendPop{
  0%{transform:scale(1)}
  40%{transform:scale(.88)}
  80%{transform:scale(1.08)}
  100%{transform:scale(1)}
}
.bqsnd.sending{animation:bqSendPop .3s ease both;}

/* ── GENERAL SMOOTHNESS ── */
.bqr{transition:opacity .2s;will-change:opacity;}
.bqbbl{transition:background .2s,border-color .2s;}

/* DM message entry — slides from side */
#bqdmmsgs .bqr.mine{animation:bqSlideFromRight .28s var(--bq-transition) both;}
#bqdmmsgs .bqr.theirs{animation:bqSlideFromLeft .28s var(--bq-transition) both;}
@keyframes bqSlideFromRight{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes bqSlideFromLeft{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}

/* ── DM CONV HEADER spacing fix ── */
#bqv-dmconv .bqhdr{padding:10px 12px;gap:8px;}
#bqv-dmconv .bqback{padding:4px 6px;border-radius:var(--bq-radius-sm);background:var(--bq-bg-hover);border:none;width:32px;height:32px;display:flex;align-items:center;justify-content:center;}
#bqv-dmconv .bqback svg{width:18px;height:18px;stroke:var(--bq-text-muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
#bqv-dmconv .bqback:hover{background:var(--bq-bg-elevated);border:1px solid var(--bq-border);}
#bqv-dmconv .bqback:hover svg{stroke:var(--bq-text);}

/* ── CSS translate property fallback ── */
@supports not (translate: 6px 0) {
  .bqdmr-acts{transform:translateY(-50%) translateX(6px);}
  .bqdmr:hover .bqdmr-acts{transform:translateY(-50%) translateX(0);}
}
@keyframes bqMsgHighlight{
  0%,100%{background:transparent}
  30%{background:rgba(96,165,250,.12)}
}
.bq-msg-jump{animation:bqMsgHighlight 1.2s ease both;}



/* ── v3: GIF/IMG LIGHTBOX ── */
#bq-media-lightbox{
  position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;padding:24px;
  opacity:0;pointer-events:none;transition:opacity .25s ease;
}
#bq-media-lightbox.open{opacity:1;pointer-events:all;}
.bq-lb-card{
  position:relative;max-width:min(720px,92vw);max-height:88vh;
  display:flex;flex-direction:column;align-items:center;gap:12px;
  animation:bqLbIn .3s cubic-bezier(.16,1,.3,1);
}
@keyframes bqLbIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.bq-lb-img{max-width:100%;max-height:74vh;object-fit:contain;border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.6);}
.bq-lb-meta{
  display:flex;align-items:center;gap:10px;color:#fff;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:500;
  background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.08);
  padding:8px 14px;border-radius:12px;backdrop-filter:blur(8px);
}
.bq-lb-meta b{font-weight:700;}
.bq-lb-meta .bq-lb-ts{opacity:.6;font-size:11px;}
.bq-lb-close{
  position:absolute;top:-44px;right:-4px;width:36px;height:36px;border-radius:50%;
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);cursor:pointer;
  display:flex;align-items:center;justify-content:center;color:#fff;transition:all .2s;
}
.bq-lb-close:hover{background:rgba(255,255,255,.2);transform:scale(1.08);}
.bq-lb-close svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;}

/* ── v3: REDESIGNED BUBBLES ── */
.bqr.mine .bqbbl{
  background:linear-gradient(135deg,var(--bq-accent) 0%,#818cf8 100%)!important;
  border-radius:20px 20px 6px 20px;
  box-shadow:
    0 6px 20px rgba(96,165,250,.30),
    inset 0 1px 0 rgba(255,255,255,.20),
    inset 0 -1px 0 rgba(0,0,0,.08);
  position:relative;overflow:hidden;
}
.bqr.mine .bqbbl::before{
  content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.10) 0%,transparent 35%);
}
.bqr.mine.consec .bqbbl{border-radius:20px 8px 8px 20px;}
.bqr.theirs .bqbbl{
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02))!important;
  border:1px solid rgba(255,255,255,.07);
  border-radius:20px 20px 20px 6px;
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  box-shadow:0 2px 12px rgba(0,0,0,.18);
}
.bqr.theirs.consec .bqbbl{border-radius:8px 20px 20px 8px;}
.bqbbl{transition:transform .18s cubic-bezier(.16,1,.3,1),box-shadow .22s;}
.bqr.mine:hover .bqbbl:not(.sticker){transform:translateY(-1px);box-shadow:0 10px 28px rgba(96,165,250,.42),inset 0 1px 0 rgba(255,255,255,.22);}
.bqr.theirs:hover .bqbbl:not(.sticker){border-color:rgba(255,255,255,.14);}
@keyframes bqBubbleIn{
  0%{opacity:0;transform:translateY(8px) scale(.94);}
  60%{opacity:1;transform:translateY(-1px) scale(1.01);}
  100%{opacity:1;transform:translateY(0) scale(1);}
}
.bqr .bqbbl{animation:bqBubbleIn .32s cubic-bezier(.16,1,.3,1) both;}

/* Refined sticker bubble */
.bqbbl.sticker{
  background:transparent!important;border:none!important;box-shadow:none!important;
  padding:2px 4px!important;
}
.bqbbl.sticker .bqsticker{
  font-size:62px;line-height:1;display:inline-block;
  filter:drop-shadow(0 6px 14px rgba(0,0,0,.4));
  animation:bqStickerPop .5s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes bqStickerPop{
  0%{opacity:0;transform:scale(.3) rotate(-12deg);}
  60%{opacity:1;transform:scale(1.15) rotate(4deg);}
  100%{opacity:1;transform:scale(1) rotate(0);}
}

/* Reply quote chip refinement */
.bqrp{
  border-left:3px solid var(--bq-accent);
  background:linear-gradient(90deg,rgba(96,165,250,.16),rgba(96,165,250,.05));
  border-radius:0 12px 12px 0;padding:6px 10px;margin-bottom:6px;
}

/* Edited indicator pill */
.bqedited{
  display:inline-block;font-size:9px!important;letter-spacing:.06em;
  background:rgba(255,255,255,.1);padding:2px 6px;border-radius:6px;
  margin-left:6px;color:rgba(255,255,255,.55);font-style:normal!important;
}

/* ── v3: NEW THEMES ── */
#bqp.bq-theme-paper{
  background:linear-gradient(180deg,#fafafa 0%,#f3f4f6 100%);
  color:#0f172a;
}
#bqp.bq-theme-paper .bqr.theirs .bqbbl{background:#fff!important;border:1px solid #e5e7eb!important;color:#0f172a!important;box-shadow:0 1px 3px rgba(0,0,0,.06);}
#bqp.bq-theme-paper .bqr.mine .bqbbl{background:linear-gradient(135deg,#3b82f6,#6366f1)!important;color:#fff!important;}
#bqp.bq-theme-paper .bqun{color:#1e293b!important;}
#bqp.bq-theme-paper .bqds{color:#64748b!important;}
#bqp.bq-theme-paper .bqds::before,#bqp.bq-theme-paper .bqds::after{background:#e5e7eb!important;}

#bqp.bq-theme-monochrome{background:#0a0a0a;}
#bqp.bq-theme-monochrome .bqr.mine .bqbbl{background:linear-gradient(135deg,#e5e5e5 0%,#a3a3a3 100%)!important;color:#0a0a0a!important;box-shadow:0 4px 14px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.4)!important;}
#bqp.bq-theme-monochrome .bqr.theirs .bqbbl{background:#1a1a1a!important;border-color:rgba(255,255,255,.08)!important;color:#e5e5e5!important;}
#bqp.bq-theme-monochrome .bqun{color:#d4d4d4!important;}

#bqp.bq-theme-midnightpurple{background:radial-gradient(ellipse at top,#1e1b4b 0%,#0a0118 70%);}
#bqp.bq-theme-midnightpurple .bqr.mine .bqbbl{background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)!important;box-shadow:0 4px 18px rgba(168,85,247,.45),inset 0 1px 0 rgba(255,255,255,.18)!important;}
#bqp.bq-theme-midnightpurple .bqr.theirs .bqbbl{background:rgba(139,92,246,.10)!important;border-color:rgba(168,85,247,.22)!important;}

.bq-theme-oceanv2 #bqdmmsgs{background:linear-gradient(180deg,#022c43 0%,#053f5e 100%);}
.bq-theme-oceanv2 #bqdmmsgs .bqr.mine .bqbbl{background:linear-gradient(135deg,#06b6d4 0%,#22d3ee 100%)!important;color:#022c43!important;box-shadow:0 4px 18px rgba(34,211,238,.4),inset 0 1px 0 rgba(255,255,255,.3)!important;}
.bq-theme-oceanv2 #bqdmmsgs .bqr.theirs .bqbbl{background:rgba(34,211,238,.10)!important;border-color:rgba(34,211,238,.22)!important;}

.bq-theme-sunsetv2 #bqdmmsgs{background:linear-gradient(180deg,#451a03 0%,#7c2d12 50%,#9f1239 100%);}
.bq-theme-sunsetv2 #bqdmmsgs .bqr.mine .bqbbl{background:linear-gradient(135deg,#fb923c 0%,#f43f5e 50%,#ec4899 100%)!important;box-shadow:0 4px 18px rgba(244,63,94,.45),inset 0 1px 0 rgba(255,255,255,.22)!important;}
.bq-theme-sunsetv2 #bqdmmsgs .bqr.theirs .bqbbl{background:rgba(251,146,60,.12)!important;border-color:rgba(251,146,60,.25)!important;}

/* ── v3: FLOATING CONVERSATION INFO CARD ── */
#bq-info-float{
  position:absolute;top:62px;right:12px;z-index:160;
  width:300px;max-width:calc(100% - 24px);max-height:calc(100% - 80px);
  background:var(--bq-bg-elevated);
  border:1px solid var(--bq-border);
  border-radius:16px;box-shadow:0 24px 72px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04) inset;
  display:flex;flex-direction:column;overflow:hidden;
  transform-origin:top right;
  opacity:0;transform:scale(.92) translateY(-6px);pointer-events:none;
  transition:transform .22s cubic-bezier(.16,1,.3,1),opacity .18s ease;
}
#bq-info-float.open{opacity:1;transform:scale(1) translateY(0);pointer-events:all;}
.bq-if-head{
  display:flex;align-items:center;gap:10px;
  padding:14px 14px 10px;border-bottom:1px solid var(--bq-border);
}
.bq-if-av{
  width:42px;height:42px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:800;
  flex-shrink:0;cursor:pointer;
}
.bq-if-info{flex:1;min-width:0;}
.bq-if-name{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:var(--bq-text);}
.bq-if-st{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);margin-top:2px;}
.bq-if-x{
  width:28px;height:28px;border-radius:8px;background:none;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;color:var(--bq-text-subtle);transition:all .15s;
}
.bq-if-x:hover{background:var(--bq-bg-hover);color:var(--bq-text);}
.bq-if-x svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
.bq-if-scroll{flex:1;overflow-y:auto;padding:10px 0;}
.bq-if-scroll::-webkit-scrollbar{width:3px;}
.bq-if-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.bq-if-sect{padding:8px 14px;}
.bq-if-sect-t{font-family:'Inter',sans-serif;font-size:9px;letter-spacing:.14em;color:var(--bq-text-subtle);text-transform:uppercase;margin-bottom:8px;}
.bq-if-row{
  display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;
  cursor:pointer;transition:background .14s;
}
.bq-if-row:hover{background:var(--bq-bg-hover);}
.bq-if-row-ic{
  width:28px;height:28px;border-radius:8px;background:var(--bq-bg);
  border:1px solid var(--bq-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.bq-if-row-ic svg{width:13px;height:13px;stroke:var(--bq-text-muted);fill:none;stroke-width:2;}
.bq-if-row-l{font-family:'Inter',sans-serif;font-size:12px;font-weight:500;color:var(--bq-text);flex:1;}
.bq-if-row-v{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);}
.bq-if-row.danger .bq-if-row-l{color:#ef4444;}
.bq-if-row.danger .bq-if-row-ic svg{stroke:#ef4444;}
.bq-if-themes{
  display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 10px;
}
.bq-if-th{
  height:34px;border-radius:8px;cursor:pointer;
  border:2px solid transparent;transition:all .15s;position:relative;
}
.bq-if-th:hover{transform:scale(1.05);}
.bq-if-th.sel{border-color:var(--bq-accent);box-shadow:0 0 0 2px rgba(96,165,250,.2);}
.bq-if-th[data-t="none"]{background:linear-gradient(135deg,#0f172a,#1e293b);}
.bq-if-th[data-t="light"]{background:linear-gradient(135deg,#ffffff,#e2e8f0);border:1px solid var(--bq-border);}
.bq-if-th[data-t="whatsapp"]{background:linear-gradient(135deg,#dcf8c6,#075e54);}
.bq-if-th[data-t="black"]{background:linear-gradient(135deg,#0a0a0a,#000);}

.bq-if-bubble{display:flex;gap:6px;padding:0 10px;}
.bq-if-bubble-opt{
  flex:1;padding:6px 8px;border-radius:8px;background:var(--bq-bg);border:1px solid var(--bq-border);
  font-family:'Inter',sans-serif;font-size:10px;font-weight:600;color:var(--bq-text-muted);
  cursor:pointer;text-align:center;transition:all .15s;
}
.bq-if-bubble-opt.sel{background:rgba(96,165,250,.15);border-color:var(--bq-accent);color:var(--bq-accent);}

.bq-if-fonts{display:flex;gap:6px;padding:0 10px;}
.bq-if-font{
  flex:1;padding:6px;border-radius:8px;background:var(--bq-bg);border:1px solid var(--bq-border);
  font-family:'Inter',sans-serif;font-weight:600;color:var(--bq-text-muted);cursor:pointer;text-align:center;transition:all .15s;
}
.bq-if-font.sel{background:rgba(96,165,250,.15);border-color:var(--bq-accent);color:var(--bq-accent);}
.bq-if-font[data-s="sm"]{font-size:10px;}
.bq-if-font[data-s="md"]{font-size:12px;}
.bq-if-font[data-s="lg"]{font-size:14px;}

/* Bubble style override classes */
.bq-bub-square #bqdmmsgs .bqbbl{border-radius:6px!important;}
.bq-bub-glass #bqdmmsgs .bqr.mine .bqbbl{background:linear-gradient(135deg,rgba(96,165,250,.7),rgba(129,140,248,.6))!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.bq-bub-glass #bqdmmsgs .bqr.theirs .bqbbl{background:rgba(255,255,255,.06)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}

/* ── v3: PROFILES V2 — banner + avatar upload, profile view modal ── */
.bqpv-modal{
  position:absolute;inset:0;z-index:200;background:rgba(0,0,0,.82);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:none;align-items:center;justify-content:center;padding:18px;
  border-radius:var(--bq-radius);
}
.bqpv-modal.open{display:flex;animation:bqFade .22s ease both;}
.bqpv-card{
  width:100%;max-width:340px;background:var(--bq-bg-elevated);
  border:1px solid var(--bq-border);border-radius:18px;overflow:hidden;
  box-shadow:0 28px 90px rgba(0,0,0,.7);animation:bqSlideUp .3s cubic-bezier(.16,1,.3,1) both;
}
.bqpv-banner{
  height:96px;background:linear-gradient(135deg,#60a5fa,#818cf8);
  background-size:cover;background-position:center;position:relative;
}
.bqpv-av-wrap{
  position:absolute;left:50%;bottom:-32px;transform:translateX(-50%);
  width:72px;height:72px;border-radius:50%;border:4px solid var(--bq-bg-elevated);
  background-size:cover;background-position:center;
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:22px;font-weight:900;
}
.bqpv-body{padding:42px 18px 18px;text-align:center;}
.bqpv-name{font-family:'Inter',sans-serif;font-size:18px;font-weight:800;color:var(--bq-text);}
.bqpv-st{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-subtle);margin-top:4px;}
.bqpv-bio{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);margin-top:10px;line-height:1.5;}
.bqpv-acts{display:flex;gap:8px;margin-top:14px;}
.bqpv-btn{
  flex:1;padding:10px;border-radius:10px;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;
  border:1px solid var(--bq-border);background:var(--bq-bg);color:var(--bq-text);transition:all .15s;
}
.bqpv-btn.primary{background:linear-gradient(135deg,var(--bq-accent),#818cf8);border:none;color:#fff;}
.bqpv-btn:hover{transform:translateY(-1px);}

/* Upload buttons in profile editor */
.bqpf-upload-row{display:flex;gap:10px;margin-bottom:14px;}
.bqpf-upload{
  flex:1;padding:10px;border-radius:10px;cursor:pointer;
  background:var(--bq-bg);border:1px dashed var(--bq-border);
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:var(--bq-text-muted);
  text-align:center;transition:all .18s;
}
.bqpf-upload:hover{border-color:var(--bq-accent);color:var(--bq-accent);background:rgba(96,165,250,.05);}
.bqpf-upload-preview{
  width:100%;height:56px;border-radius:8px;background-size:cover;background-position:center;margin-bottom:6px;
  background-color:var(--bq-bg-hover);
}

/* ── v3: VOICE NOTES ── */
.bqvoice-btn{
  width:36px;height:36px;border-radius:50%;background:var(--bq-bg-elevated);
  border:1px solid var(--bq-border);cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:all .15s;color:var(--bq-text-muted);
}
.bqvoice-btn:hover{background:var(--bq-bg-hover);color:var(--bq-accent);border-color:var(--bq-accent);}
.bqvoice-btn.recording{background:#dc2626!important;color:#fff!important;border-color:#dc2626!important;animation:bqRecPulse 1.2s ease infinite;}
@keyframes bqRecPulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.7)}50%{box-shadow:0 0 0 8px rgba(220,38,38,0)}}
.bqvoice-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}
.bqvoice-rec-bar{
  display:none;align-items:center;gap:10px;padding:6px 12px;background:rgba(220,38,38,.12);
  border:1px solid rgba(220,38,38,.3);border-radius:10px;margin:0 0 6px 0;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#fca5a5;
  position:relative;width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;
}
.bqvoice-rec-bar.show{display:flex;}
.bqvoice-rec-dot{width:8px;height:8px;border-radius:50%;background:#dc2626;animation:bqRecPulse 1.2s ease infinite;flex-shrink:0;}
.bqvoice-rec-time{flex:0 0 auto;min-width:36px;text-align:right;}
.bqvoice-rec-cancel{background:none;border:none;color:#fca5a5;cursor:pointer;font-weight:700;flex-shrink:0;padding:4px 8px;}
.bq-vn-wave{flex:1 1 0;min-width:0;height:26px;display:block;}

/* Voice message bubble */
.bq-voice-msg{
  display:flex;align-items:center;gap:10px;min-width:160px;padding:6px 4px;
}
.bq-voice-play{
  width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.18);
  border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:inherit;flex-shrink:0;transition:transform .15s;
}
.bq-voice-play:hover{transform:scale(1.08);}
.bq-voice-play svg{width:14px;height:14px;fill:currentColor;}
.bq-voice-bars{
  flex:1;display:flex;align-items:center;gap:2px;height:24px;
}
.bq-voice-bar{
  width:2px;background:currentColor;opacity:.5;border-radius:1px;
  transition:opacity .12s,height .12s;
}
.bq-voice-bar.played{opacity:1;}
.bq-voice-time{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;opacity:.85;flex-shrink:0;}

/* Hide legacy push notification UI */
.bqpf-push-section,#bqpf-push-btn{display:none!important;}

/* Theme chip swatches in old info panel — keep working */
.bq-theme-chip{width:28px;height:28px;border-radius:8px;cursor:pointer;border:2px solid transparent;}
.bq-theme-chip.sel{border-color:var(--bq-accent);}
.bq-theme-chip[data-t="none"]{background:linear-gradient(135deg,#0a0a0a,#1a1a1a);}
.bq-theme-row{display:flex;flex-wrap:wrap;gap:6px;}

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
        <div class="bqirow">
          <button class="bqieo" id="bqgeo">😊</button>
          <button class="bqgifbtn" id="bqggif" title="Send a GIF">GIF</button>
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
        <div class="bqhtitle">Messages</div>
        <button class="bqhbtn" id="bqdmnewbtn" title="New DM - go to Online">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div class="bq-me-av" id="bq-me-av-dms" title="My profile"></div>
      </div>
      <div class="bqdm-search-wrap">
        <div class="bqdm-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="bqdm-search-inp" id="bqdm-search-inp" type="text" placeholder="Search conversations..." autocomplete="off" autocapitalize="off" autocorrect="off">
        </div>
      </div>
      <div id="bqdml"></div>
    </div>

    <!-- VIEW: DM Conversation -->
    <div class="bqv" id="bqv-dmconv">
      <div class="bqhdr">
        <button class="bqback" id="bqdmback"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg></button>
        <div class="bqdmhav" id="bqdmhav"></div>
        <div class="bqdmhi">
          <div class="bqdmhn" id="bqdmhn"></div>
          <div class="bqdmhs" id="bqdmhs"><span class="bqdmhs-dot" id="bqdmhs-dot" style="display:none"></span><span id="bqdmhs-txt">Offline</span></div>
        </div>
        <button class="bqhbtn" id="bqdmprof" title="View profile"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
        <div style="position:relative">
          <button class="bqhbtn" id="bq-dm-menu-btn" title="More"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg></button>
          <div class="bq-dm-menu-dropdown" id="bq-dm-menu">
            <div class="bq-dm-menu-item" id="bq-dm-menu-info"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Settings</div>
            <div class="bq-dm-menu-item" id="bq-dm-menu-starred"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Starred Messages</div>
            <div class="bq-dm-menu-div"></div>
                        <div class="bq-dm-menu-item danger" id="bq-dm-menu-clear"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg>Clear Messages</div>
          </div>
        </div>
        <div class="bq-me-av" id="bq-me-av-dm" title="My profile"></div>
      </div>
      <div id="bq-pinned-bar">
        <span class="bq-pinbar-ic"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
        <div class="bq-pinbar-body"><div class="bq-pinbar-label">Pinned Message</div><div class="bq-pinbar-text" id="bq-pinbar-text"></div></div>
        <button class="bq-pinbar-unpin" id="bq-pinbar-unpin"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
      <div class="bq-media-preview" id="bq-media-preview"><img class="bq-media-thumb" id="bq-media-thumb" src="" alt=""><span class="bq-media-name" id="bq-media-name"></span><button class="bq-media-rm" id="bq-media-rm"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="bqiw">
        <!-- v9.3: Voice recording bar lives INSIDE composer to avoid layout shift -->
        <div class="bqvoice-rec-bar" id="bq-voice-rec-bar">
          <span class="bqvoice-rec-dot"></span>
          <span class="bqvoice-rec-time" id="bq-voice-rec-time">0:00</span>
          <button class="bqvoice-rec-cancel" id="bq-voice-rec-cancel">Cancel</button>
        </div>
        <div class="bqiet" id="bqdmet"></div>
        <div class="bqirow">
          <button class="bqieo" id="bqdmeo">😊</button>
          <button class="bqgifbtn" id="bqdmgif" title="Send a GIF">GIF</button>
          <button class="bqvoice-btn" id="bq-voice-btn" title="Voice note (tap to record, tap to stop)"><svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <textarea id="bqdminp" class="bqinp" placeholder="Message..." rows="1" maxlength="${CHAR_LIMIT}"></textarea>
          <button class="bqsnd" id="bqdmsnd" disabled><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
        <div class="bqifooter"><div class="bqcc" id="bqdmcc"></div><div class="bqih">Enter send · Shift+Enter newline</div></div>
      </div>
    </div>

    <!-- DM Info panel (inside dmconv) -->
    <div id="bq-dm-info">
      <div class="bq-info-hdr"><span class="bq-info-hdr-title">Settings</span><button class="bq-info-close" id="bq-info-close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="bq-info-av-section">
        <div class="bq-info-av" id="bq-info-av"></div>
        <div class="bq-info-name" id="bq-info-name"></div>
        <div class="bq-info-status" id="bq-info-status"></div>
        <div class="bq-info-bio" id="bq-info-bio"></div>
      </div>
      <div class="bq-info-scroll">
        <div class="bq-info-section">
          <div class="bq-info-section-title">Chat Theme</div>
          <div class="bq-theme-row" id="bq-theme-chips"><div class="bq-theme-chip sel" data-t="none" title="Dark"></div><div class="bq-theme-chip" data-t="light" title="Light"></div><div class="bq-theme-chip" data-t="whatsapp" title="WhatsApp"></div><div class="bq-theme-chip" data-t="black" title="Pure Black"></div></div>
        </div>
        <div class="bq-info-section">
          <div class="bq-info-section-title">Settings</div>
          <div class="bq-info-row"><div class="bq-info-row-left"><div class="bq-info-row-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div class="bq-info-row-label">Disappearing messages</div><div class="bq-info-row-sub" id="bq-disappear-sub">Off</div></div></div><label class="bq-toggle"><input type="checkbox" id="bq-disappear-chk"><span class="bq-toggle-slider"></span></label></div>
        </div>
        <div class="bq-info-section">
          <div class="bq-info-section-title">Actions</div>
          <div class="bq-info-row" id="bq-info-starred-row"><div class="bq-info-row-left"><div class="bq-info-row-ic"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div class="bq-info-row-label">Starred Messages</div></div><span class="bq-info-row-value" id="bq-info-star-count">0</span></div>
          <div class="bq-info-row danger" id="bq-info-clear-row"><div class="bq-info-row-left"><div class="bq-info-row-ic"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg></div><div class="bq-info-row-label">Clear conversation</div></div></div>
        </div>
      </div>
    </div>
    <!-- Starred panel -->
    <div id="bq-starred-panel">
      <div class="bqhdr"><button class="bqback" id="bq-starred-back"><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>Back</button><span class="bqhtitle">Starred Messages</span></div>
      <div id="bq-starred-list"></div>
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
<!-- v3: GIF/Image lightbox -->
<div id="bq-media-lightbox">
  <div class="bq-lb-card">
    <button class="bq-lb-close" id="bq-lb-close" title="Close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    <img class="bq-lb-img" id="bq-lb-img" src="" alt="">
    <div class="bq-lb-meta"><b id="bq-lb-from"></b><span class="bq-lb-ts" id="bq-lb-ts"></span></div>
  </div>
</div>

<!-- v3: Floating Conversation Info card -->
<div id="bq-info-float">
  <div class="bq-if-head">
    <div class="bq-if-av" id="bq-if-av"></div>
    <div class="bq-if-info">
      <div class="bq-if-name" id="bq-if-name"></div>
      <div class="bq-if-st" id="bq-if-st"></div>
    </div>
    <button class="bq-if-x" id="bq-if-close" title="Close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  </div>
  <div class="bq-if-scroll">
    <div class="bq-if-sect">
      <div class="bq-if-sect-t">Theme</div>
      <div class="bq-if-themes" id="bq-if-themes">
        <div class="bq-if-th sel" data-t="none" title="Dark"></div>
        <div class="bq-if-th" data-t="light" title="Light"></div>
        <div class="bq-if-th" data-t="whatsapp" title="WhatsApp"></div>
        <div class="bq-if-th" data-t="black" title="Pure Black"></div>
      </div>
    </div>
    <div class="bq-if-sect">
      <div class="bq-if-sect-t">Bubble Style</div>
      <div class="bq-if-bubble" id="bq-if-bubble">
        <div class="bq-if-bubble-opt sel" data-b="rounded">Rounded</div>
        <div class="bq-if-bubble-opt" data-b="square">Square</div>
        <div class="bq-if-bubble-opt" data-b="glass">Glass</div>
      </div>
    </div>
    <div class="bq-if-sect">
      <div class="bq-if-sect-t">Font Size</div>
      <div class="bq-if-fonts" id="bq-if-fonts">
        <div class="bq-if-font" data-s="sm">A</div>
        <div class="bq-if-font sel" data-s="md">A</div>
        <div class="bq-if-font" data-s="lg">A</div>
      </div>
    </div>
    <div class="bq-if-sect">
      <div class="bq-if-sect-t">Conversation</div>
      <div class="bq-if-row" id="bq-if-pin">
        <div class="bq-if-row-ic"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <div class="bq-if-row-l">Pin conversation</div>
        <div class="bq-if-row-v" id="bq-if-pin-v">Off</div>
      </div>
      <div class="bq-if-row" id="bq-if-search">
        <div class="bq-if-row-ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <div class="bq-if-row-l">Search in conversation</div>
      </div>
      <div class="bq-if-row" id="bq-if-export">
        <div class="bq-if-row-ic"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
        <div class="bq-if-row-l">Export chat (.txt)</div>
      </div>
      <div class="bq-if-row" id="bq-if-readrec">
        <div class="bq-if-row-ic"><svg viewBox="0 0 24 24"><path d="M1 5.5L4.5 9L12 1"/><path d="M8 5.5L11.5 9L19 1"/></svg></div>
        <div class="bq-if-row-l">Read receipts</div>
        <div class="bq-if-row-v" id="bq-if-rr-v">On</div>
      </div>
      <div class="bq-if-row danger" id="bq-if-clear">
        <div class="bq-if-row-ic"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg></div>
        <div class="bq-if-row-l">Clear conversation</div>
      </div>
      <div class="bq-if-row danger" id="bq-if-block">
        <div class="bq-if-row-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
        <div class="bq-if-row-l">Block user</div>
      </div>
    </div>
  </div>
</div>

<!-- v3: Profile View modal (Profiles V2) -->
<div class="bqpv-modal" id="bq-pv">
  <div class="bqpv-card">
    <div class="bqpv-banner" id="bq-pv-banner">
      <div class="bqpv-av-wrap" id="bq-pv-av"></div>
    </div>
    <div class="bqpv-body">
      <div class="bqpv-name" id="bq-pv-name"></div>
      <div class="bqpv-st" id="bq-pv-st"></div>
      <div class="bqpv-bio" id="bq-pv-bio"></div>
      <div class="bqpv-acts">
        <button class="bqpv-btn" id="bq-pv-close">Close</button>
        <button class="bqpv-btn primary" id="bq-pv-msg">Message</button>
      </div>
    </div>
  </div>
</div>

<!-- v9.3: Voice recording bar moved INSIDE DM composer (.bqiw) — see line ~2199 -->


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
let dmReadCache = {}; // {dmId:{uid:timestamp}} — cached partner read timestamps
let dmReadRef   = null; // current active read listener ref
let activeView= 'chat';
let prevView  = 'chat';
let isFull    = false;

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

/* PUSH NOTIFICATIONS REMOVED — kept stubs to avoid reference errors */
function showNotification(){ /* no-op: notifications removed */ }
function updatePushUI(){
  const btn = document.getElementById('bqpf-push-btn');
  const sec = document.getElementById('bqpf-push-section');
  if(sec) sec.style.display='none';
  if(btn) btn.style.display='none';
}
function subscribeToPush(){ /* no-op */ }

/* ────���────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function toast(m,dur=2500){
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
    if(typeof _injectProfileUploads==='function') setTimeout(_injectProfileUploads,30);
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

  const color = getColor(pUid, pName);
  const pdata = onlineU[pUid] || {};
  const hav = document.getElementById('bqdmhav');
  hav.style.background = color;
  hav.style.color = '#000';
  hav.textContent = uInit(pName);
  hav.dataset.puid = pUid;
  hav.dataset.pname = pName;
  hav.dataset.status = pdata.status || '';
  hav.className = 'bqdmhav';
  document.getElementById('bqdmhn').textContent = '@' + pName;
  const st = statusInfo(pdata.status || '');
  const isOn=!!onlineU[pUid];
  const hsTxt=document.getElementById('bqdmhs-txt');
  const hsDot=document.getElementById('bqdmhs-dot');
  if(hsTxt){
    if(isOn){
      hsTxt.textContent=st.label;
      hsTxt.style.color='var(--bq-success)';
      if(hsDot){hsDot.style.display='inline-block';hsDot.style.background='var(--bq-success)';}
    } else {
      hsTxt.textContent=pdata.ts?'Last seen '+lastSeenStr(pdata.ts):'Offline';
      hsTxt.style.color='var(--bq-text-subtle)';
      if(hsDot) hsDot.style.display='none';
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
  
  // Subscribe fresh
  if (db) {
    const ref = db.ref('bq_dms/' + activeDmId + '/messages').limitToLast(MAX_MSG);
    ref.on('child_added', s => renderMsg('dm', s.val(), s.key));
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
  
  // Mark read
  if (db && dmUnread[activeDmId]) {
    db.ref('bq_dms/' + activeDmId + '/meta/unread/' + uid).set(0);
    dmUnread[activeDmId] = 0;
    updateBadges();
  }
  // Apply saved theme
  const _theme=getDmTheme(activeDmId);
  const _v=document.getElementById('bqv-dmconv');
  if(_v) _v.className='bqv bq-active bq-theme-'+_theme;
  // v8: mirror theme on full panel
  const _panel=document.getElementById('bqp');
  if(_panel){
    Array.from(_panel.classList).forEach(c=>{ if(c.indexOf('bq-theme-')===0) _panel.classList.remove(c); });
    _panel.classList.add('bq-theme-'+_theme);
  }
  // Subscribe pinned + read receipts
  subscribeDmPinned(activeDmId);
  subscribeDmRead(activeDmId);
  // Mark read immediately + update all receipt indicators
  markDmRead(activeDmId);
  // Small delay to let messages render before checking receipt cache
  setTimeout(()=>updateAllReadReceipts(activeDmId), 300);
  // Close info panel if open
  closeDmInfo();
  // Update muted state in header status
  if(isMuted(activeDmId)){
    const hs=document.getElementById('bqdmhs');
    if(hs&&!onlineU[activeDmPuid]) hs.textContent='Offline · Muted';
  }

  bqNav('dmconv');
  // Highlight active row in DM list
  document.querySelectorAll('.bqdmr').forEach(r=>{
    r.classList.toggle('active-row', r.dataset.did===newDmId);
  });
  requestAnimationFrame(() => { if (msgs) msgs.scrollTop = msgs.scrollHeight; });
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
    // Load messaging SDK non-critically — push won't work without it but core chat will
    const _mssdk=document.createElement('script');
    _mssdk.src='https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js';
    _mssdk.onerror=()=>console.warn('[Chat] Messaging SDK unavailable');
    document.head.appendChild(_mssdk);
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
  const beat=()=>ref.set({
    uname,ts:Date.now(),
    status:myProfile.status||'online',
    activity:myProfile.activity||'',
    bio:myProfile.bio||'',
    color:myProfile.color||'',
    initials:myProfile.initials||'',
    avatar:myProfile.avatar||'',
    banner:myProfile.banner||'',
    displayName:myProfile.displayName||'',
    pronouns:myProfile.pronouns||'',
    customStatus:myProfile.customStatus||'',
    nameColor:myProfile.nameColor||'',
    bannerColor:myProfile.bannerColor||'',
  });
  beat();clearInterval(presInt);
  presInt=setInterval(beat,PRESENCE_TTL*.7);
  ref.onDisconnect().remove();
  // v9: debounced presence handler (was firing renderOnlineList on every micro-update)
  let _presT=null;
  db.ref('bq_presence').on('value',snap=>{
    const now=Date.now();onlineU={};
    snap.forEach(c=>{
      const d=c.val();
      if(d&&now-d.ts<PRESENCE_TTL*1.6){
        onlineU[c.key]=d;
        _cacheAvatarFromPresence(c.key, d);
      } else c.ref.remove();
    });
    if(_presT) clearTimeout(_presT);
    _presT=setTimeout(()=>{
      _presT=null;
      renderOnlineList();updateDmHdrStatus();
      const n=Object.keys(onlineU).length;
      const el=document.getElementById('bqocnt');if(el) el.textContent=n+' online';
      const nb=document.getElementById('bqonb');
      if(nb&&n>0){nb.textContent=n;nb.classList.add('show');}else if(nb) nb.classList.remove('show');
      _debouncedApplyAvatars();
    }, 100);
  });
}

function updateDmHdrStatus(){
  if(activeView!=='dmconv'||!activeDmPuid)return;
  const pdata=onlineU[activeDmPuid]||{};
  const isOn=!!onlineU[activeDmPuid];
  const hav=document.getElementById('bqdmhav');
  if(hav){hav.className='bqdmhav';hav.dataset.status=pdata.status||'';}
  const hsTxt=document.getElementById('bqdmhs-txt');
  const hsDot=document.getElementById('bqdmhs-dot');
  if(hsTxt){
    if(isOn){
      hsTxt.textContent=statusInfo(pdata.status||'online').label;
      hsTxt.style.color='var(--bq-success)';
      if(hsDot){hsDot.style.display='inline-block';hsDot.style.background='var(--bq-success)';}
    } else {
      hsTxt.textContent=pdata.ts?'Last seen '+lastSeenStr(pdata.ts):'Offline';
      hsTxt.style.color='var(--bq-text-subtle)';
      if(hsDot) hsDot.style.display='none';
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

  // v9: live banner + avatar with onerror fallback
  const bnEl=document.getElementById('bqpc-banner');
  if(pd.banner){
    const bp=new Image();
    bp.onload=()=>{ bnEl.style.background='url('+pd.banner.replace(/'/g,"%27")+') center/cover'; };
    bp.onerror=()=>{ bnEl.style.background='linear-gradient(135deg,'+color+'66,'+color+'33)'; };
    bp.src=pd.banner;
    bnEl.style.background='linear-gradient(135deg,'+color+'66,'+color+'33)';
  } else {
    bnEl.style.background='linear-gradient(135deg,'+color+'66,'+color+'33)';
  }
  const av=document.getElementById('bqpc-av');
  if(pd.avatar){
    const ap=new Image();
    ap.onload=()=>{ av.style.background='url('+pd.avatar.replace(/'/g,"%27")+') center/cover';av.style.color='transparent';av.textContent=''; };
    ap.onerror=()=>{ av.style.background=color;av.style.color='#000';av.textContent=uInit(targetName); };
    ap.src=pd.avatar;
    av.style.background=color;av.style.color='#000';av.textContent=uInit(targetName);
  } else {
    av.style.background=color;av.style.color='#000';av.textContent=uInit(targetName);
  }
  // v9: also re-fetch from DB in case the cached snapshot is stale
  if(db && targetUid){
    db.ref('bq_presence/'+targetUid).once('value').then(snap=>{
      const live=snap.val();
      if(live){
        onlineU[targetUid]=live; _cacheAvatarFromPresence(targetUid,live);
        if(live.avatar && live.avatar !== pd.avatar){
          const ap2=new Image();
          ap2.onload=()=>{ av.style.background='url('+live.avatar.replace(/'/g,"%27")+') center/cover';av.style.color='transparent';av.textContent=''; };
          ap2.onerror=()=>{ av.style.background=color;av.style.color='#000';av.textContent=uInit(targetName); };
          ap2.src=live.avatar;
        }
        if(live.banner && live.banner !== pd.banner){
          const bp2=new Image();
          bp2.onload=()=>{ bnEl.style.background='url('+live.banner.replace(/'/g,"%27")+') center/cover'; };
          bp2.src=live.banner;
        }
      }
    }).catch(()=>{});
  }
  document.getElementById('bqpc-name').textContent='@'+targetName;
  const stEl=document.getElementById('bqpc-status');
  stEl.innerHTML=`<div class="bqpc-sdot" style="background:${si.color}"></div><span class="bqpc-slabel" style="color:${si.color}">${si.label}</span>`;
  
  // Last seen
  const lsEl=document.getElementById('bqpc-lastseen');
  if(lsEl){
    const isOnline=!!onlineU[targetUid];
    if(isOnline){
      lsEl.textContent='Currently online';
      lsEl.className='bqls bqls-online';
    } else if(pd.ts){
      lsEl.textContent='Last seen '+lastSeenStr(pd.ts);
      lsEl.className='bqls';
    } else {
      lsEl.textContent='';
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
  const disappearingEnabled = localStorage.getItem('bq_disappearing') === 'true';
  const p={uid,uname,text:text.trim().slice(0,CHAR_LIMIT),ts:Date.now()};
  if(disappearingEnabled) p.expiresAt = Date.now() + 3600000; // 1 hour
  if(gReply) p.replyTo={key:gReply.key,uname:gReply.uname,text:gReply.text.slice(0,80)};
  db.ref('bq_messages').push(p);
  db.ref('bq_messages').once('value',snap=>{
    const keys=[];snap.forEach(c=>keys.push(c.key));
    if(keys.length>MAX_MSG+25) keys.slice(0,keys.length-MAX_MSG).forEach(k=>db.ref('bq_messages/'+k).remove());
  });
  
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
      <div class="bqdmav" data-status="${esc(stCls)}" style="background:${c};color:#000">${uInit(pname)}</div>
      <div class="bqdmin">
        <div class="bqdmn">${pinned?'<span class="bqdm-pin bqdmn-pin">📌</span>':''}${esc(shown)}${alias?`<span class="bqdmn-alias"> (@${esc(pname)})</span>`:''}</div>
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
        <button class="bqdmr-act bq-del" data-did="${did}" title="Delete">
          <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div class="bqdmr-confirm">
        <div class="bqdmr-confirm-msg">Delete conversation?</div>
        <button class="bqdmr-cyes" data-did="${did}">Delete</button>
        <button class="bqdmr-cno">Cancel</button>
      </div>`;
    // mark unread row for left-border accent
    row.classList.toggle('unread-row', unrd > 0);
    row.classList.toggle('active-row', did === activeDmId);
    if(isNew) list.appendChild(row);
  });
  // Re-append in sorted order (ensures pinned appear first)
  const frag = document.createDocumentFragment();
  items.forEach(([did])=>{const r=list.querySelector(`[data-did="${did}"]`);if(r) frag.appendChild(r);});
  list.appendChild(frag);
  // Apply search filter if active
  const q=(document.getElementById('bqdm-search-inp')?.value||'').toLowerCase().trim();
  if(q) _filterDmList(q);
}

function _filterDmList(q){
  const list=document.getElementById('bqdml');if(!list)return;
  list.querySelectorAll('.bqdmr').forEach(row=>{
    const name=(row.dataset.pname||'').toLowerCase();
    const preview=row.querySelector('.bqdmp')?.textContent?.toLowerCase()||'';
    row.style.display=(!q||name.includes(q)||preview.includes(q))?'':'none';
  });
}


function initDmDelegate(){
  // Wire up DM search
  document.getElementById('bqdm-search-inp')?.addEventListener('input',e=>{
    _filterDmList(e.target.value.toLowerCase().trim());
  });

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
───────────────────────────────────────── */
function sendDm(text){
  if(!db||!uname||!activeDmId||!activeDmPuid)return;
  const trimmed=text.trim();
  if(!trimmed&&!pendingImageData) return;
  const pname=activeDmPname||'?';
  const p={uid,uname,text:trimmed.slice(0,CHAR_LIMIT),ts:Date.now()};
  if(pendingImageData){ p.imageData=pendingImageData; clearMediaPreview(); }
  if(dmReply) p.replyTo={key:dmReply.key,uname:dmReply.uname,text:dmReply.text.slice(0,80)};
  // Disappearing message
  const dis=getDisappear();
  if(activeDmId&&dis[activeDmId]) p.expiresAt=Date.now()+5*60*1000;
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
   GIPHY — fetch + send
───────────────────────────────────────── */
let _giphyCache = {};
async function giphyFetch(category, query){
  const key = _resolvedGiphyKey;
  if(!key || key === 'PASTE_YOUR_GIPHY_KEY_HERE'){
    return { error: 'Add your Giphy API key in chat-widget.js (GIPHY_API_KEY) or set window.GIPHY_API_KEY.' };
  }
  const cacheKey = (query||'')+'|'+(category||'trending');
  if(_giphyCache[cacheKey]) return { data: _giphyCache[cacheKey] };
  let url;
  if(query && query.trim()){
    url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&limit=24&rating=pg-13&bundle=messaging_non_clips`;
  } else if(category === 'trending' || !category){
    url = `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(key)}&limit=24&rating=pg-13&bundle=messaging_non_clips`;
  } else {
    const cat = GIPHY_CATEGORIES.find(c=>c.id===category);
    const q = cat ? cat.q : category;
    url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q||category)}&limit=24&rating=pg-13&bundle=messaging_non_clips`;
  }
  try{
    const r = await fetch(url);
    if(!r.ok) return { error: 'Giphy request failed ('+r.status+')' };
    const j = await r.json();
    _giphyCache[cacheKey] = j.data || [];
    return { data: _giphyCache[cacheKey] };
  } catch(err){
    return { error: 'Network error fetching GIFs' };
  }
}

function sendGifGlobal(gifUrl, w, h){
  if(!db||!uname||!gifUrl) return;
  const p={uid,uname,text:'',type:'gif',gifUrl,gifW:w||0,gifH:h||0,ts:Date.now()};
  if(gReply) p.replyTo={key:gReply.key,uname:gReply.uname,text:gReply.text.slice(0,80)};
  db.ref('bq_messages').push(p);
  clearReply('g');
}

function sendGifDm(gifUrl, w, h){
  if(!db||!uname||!activeDmId||!activeDmPuid||!gifUrl) return;
  const pname=activeDmPname||'?';
  const p={uid,uname,text:'',type:'gif',gifUrl,gifW:w||0,gifH:h||0,ts:Date.now()};
  if(dmReply) p.replyTo={key:dmReply.key,uname:dmReply.uname,text:dmReply.text.slice(0,80)};
  db.ref('bq_dms/'+activeDmId+'/messages').push(p);
  const sorted=[uid,activeDmPuid].sort();
  db.ref('bq_dms/'+activeDmId+'/meta').update({
    p1:sorted[0],p2:sorted[1],
    n1:sorted[0]===uid?uname:pname,
    n2:sorted[0]===uid?pname:uname,
    lastMsg:'🎞️ GIF', lastTs:Date.now(),
  });
}

/* Sticker (one-tap big-emoji) — sends as type:'sticker' */
function sendStickerGlobal(emoji){
  if(!db||!uname||!emoji) return;
  const p={uid,uname,text:'',type:'sticker',sticker:emoji,ts:Date.now()};
  if(gReply) p.replyTo={key:gReply.key,uname:gReply.uname,text:gReply.text.slice(0,80)};
  db.ref('bq_messages').push(p);
  clearReply('g');
}
function sendStickerDm(emoji){
  if(!db||!uname||!activeDmId||!activeDmPuid||!emoji) return;
  const pname=activeDmPname||'?';
  const p={uid,uname,text:'',type:'sticker',sticker:emoji,ts:Date.now()};
  if(dmReply) p.replyTo={key:dmReply.key,uname:dmReply.uname,text:dmReply.text.slice(0,80)};
  db.ref('bq_dms/'+activeDmId+'/messages').push(p);
  const sorted=[uid,activeDmPuid].sort();
  db.ref('bq_dms/'+activeDmId+'/meta').update({
    p1:sorted[0],p2:sorted[1],
    n1:sorted[0]===uid?uname:pname,
    n2:sorted[0]===uid?pname:uname,
    lastMsg:emoji+' Sticker', lastTs:Date.now(),
  });
  db.ref('bq_dms/'+activeDmId+'/meta/unread/'+activeDmPuid).transaction(n=>(n||0)+1);
  clearReply('dm');
}

function attachGifPicker(ctx){
  const isG = ctx==='global';
  const btn = document.getElementById(isG?'bqggif':'bqdmgif');
  const row = btn?.closest('.bqirow');
  if(!btn||!row) return;
  if(btn.dataset.bound) return;
  btn.dataset.bound='1';

  // Build panel
  const panel = document.createElement('div');
  panel.className = 'bqgifp';
  panel.innerHTML =
    '<div class="bqgifp-head">'+
      '<div class="bqgifp-search">'+
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
        '<input type="text" placeholder="Search GIFs on Giphy..." autocomplete="off" autocapitalize="off" autocorrect="off">'+
      '</div>'+
      '<div class="bqgifp-cats">'+
        GIPHY_CATEGORIES.map((c,i)=>'<button class="bqgifp-cat'+(i===0?' sel':'')+'" data-cat="'+c.id+'">'+c.label+'</button>').join('')+
      '</div>'+
    '</div>'+
    '<div class="bqgifp-grid"></div>'+
    '<div class="bqgifp-foot"><span>Powered by GIPHY</span></div>';
  row.appendChild(panel);

  const grid = panel.querySelector('.bqgifp-grid');
  const inp  = panel.querySelector('input');
  const cats = panel.querySelectorAll('.bqgifp-cat');
  let curCat = 'trending', curQ = '', searchT = null;

  function showSkeletons(){
    grid.innerHTML = '';
    for(let i=0;i<8;i++){
      const s = document.createElement('div');
      s.className='bqgifp-skel';
      s.style.height = (90 + Math.floor(Math.random()*80))+'px';
      grid.appendChild(s);
    }
  }
  async function load(){
    showSkeletons();
    const res = await giphyFetch(curCat, curQ);
    if(res.error){
      grid.innerHTML = '<div class="bqgifp-empty" style="column-span:all">'+esc(res.error)+'</div>';
      return;
    }
    if(!res.data||!res.data.length){
      grid.innerHTML = '<div class="bqgifp-empty" style="column-span:all">No GIFs found.</div>';
      return;
    }
    grid.innerHTML = '';
    res.data.forEach(g=>{
      const img = g.images?.fixed_width || g.images?.downsized_medium;
      const full = g.images?.original?.url || img?.url;
      if(!img||!full) return;
      const item = document.createElement('div');
      item.className = 'bqgifp-item';
      item.innerHTML = '<img loading="lazy" src="'+esc(img.url)+'" alt="'+esc(g.title||'GIF')+'">';
      item.addEventListener('click', ()=>{
        const w = parseInt(g.images?.original?.width||0);
        const h = parseInt(g.images?.original?.height||0);
        if(isG) sendGifGlobal(full, w, h); else sendGifDm(full, w, h);
        panel.classList.remove('open');
        btn.classList.remove('active');
      });
      grid.appendChild(item);
    });
  }

  cats.forEach(c=>{
    c.addEventListener('click', ()=>{
      cats.forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      curCat = c.dataset.cat;
      curQ = '';
      inp.value = '';
      load();
    });
  });
  inp.addEventListener('input', ()=>{
    clearTimeout(searchT);
    searchT = setTimeout(()=>{
      curQ = inp.value.trim();
      if(curQ){
        cats.forEach(x=>x.classList.remove('sel'));
      } else {
        cats[0].classList.add('sel');
        curCat = 'trending';
      }
      load();
    }, 320);
  });

  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const opening = !panel.classList.contains('open');
    // Close any other open gif panels
    document.querySelectorAll('.bqgifp.open').forEach(p=>p.classList.remove('open'));
    document.querySelectorAll('.bqgifbtn.active').forEach(b=>b.classList.remove('active'));
    if(opening){
      panel.classList.add('open');
      btn.classList.add('active');
      if(!grid.children.length) load();
      setTimeout(()=>inp.focus(), 60);
    }
  });

  // Outside click closes (delegated to widget root)
  document.getElementById('bqp')?.addEventListener('click', e=>{
    if(!panel.classList.contains('open')) return;
    if(panel.contains(e.target) || btn.contains(e.target)) return;
    panel.classList.remove('open');
    btn.classList.remove('active');
  });
}

const LS_STARS  = 'bq_starred';
const LS_MUTED  = 'bq_muted';
const LS_THEMES = 'bq_themes';
const LS_DISAPP = 'bq_disappear';

function getStarred(){ try{return JSON.parse(localStorage.getItem(LS_STARS)||'{}')}catch{return {}}}
function getMuted(){   try{return JSON.parse(localStorage.getItem(LS_MUTED)||'[]')}catch{return []}}
function getThemes(){  try{return JSON.parse(localStorage.getItem(LS_THEMES)||'{}')}catch{return {}}}
function getDisappear(){try{return JSON.parse(localStorage.getItem(LS_DISAPP)||'{}')}catch{return {}}}

function isMuted(did){ return getMuted().includes(did); }
function toggleMute(did){
  const m=getMuted(),i=m.indexOf(did);
  if(i>-1) m.splice(i,1); else m.push(did);
  localStorage.setItem(LS_MUTED,JSON.stringify(m));
  updateDmInfoPanel();
  toast(isMuted(did)?'🔕 Muted':'🔔 Unmuted');
}

/* v9: global theme (persists across refresh, separate from per-DM theme) */
function getGlobalTheme(){
  try { return localStorage.getItem(LS_THEME) || 'none'; } catch(_) { return 'none'; }
}
function setGlobalTheme(t){
  try { localStorage.setItem(LS_THEME, t||'none'); } catch(_){}
  applyGlobalTheme(t||'none');
  if(db && uid) db.ref('bq_presence/'+uid+'/theme').set(t||'none');
}
function applyGlobalTheme(theme){
  const panel=document.getElementById('bqp');
  if(!panel) return;
  Array.from(panel.classList).forEach(c=>{ if(c.indexOf('bq-theme-')===0) panel.classList.remove(c); });
  panel.classList.add('bq-theme-'+(theme||'none'));
  document.querySelectorAll('.bq-theme-chip').forEach(ch=>{
    ch.classList.toggle('sel', ch.dataset.t===theme);
  });
}

function getDmTheme(did){ return getThemes()[did]||getGlobalTheme()||'none'; }
function setDmTheme(did,theme){
  const t=getThemes(); t[did]=theme; localStorage.setItem(LS_THEMES,JSON.stringify(t));
  // v9: also remember as the global default so a refresh keeps the theme
  try { localStorage.setItem(LS_THEME, theme||'none'); } catch(_){}
  if(db && uid) db.ref('bq_presence/'+uid+'/theme').set(theme||'none');
  applyDmTheme(did,theme);
}
function applyDmTheme(did,theme){
  theme=(theme==='light'||theme==='whatsapp'||theme==='black'||theme==='none')?theme:(theme==='paper'?'light':(theme==='walight'||theme==='wadark'?'whatsapp':'none'));
  const v=document.getElementById('bqv-dmconv'); if(!v) return;
  v.className='bqv bq-active bq-theme-'+theme;
  const panel=document.getElementById('bqp');
  if(panel){
    Array.from(panel.classList).forEach(c=>{ if(c.indexOf('bq-theme-')===0) panel.classList.remove(c); });
    panel.classList.add('bq-theme-'+theme);
  }
  document.querySelectorAll('.bq-theme-chip').forEach(ch=>{
    ch.classList.toggle('sel', ch.dataset.t===theme);
  });
}

/* ── READ RECEIPTS ── */
function markDmRead(dmId){
  if(!db||!uid||!dmId) return;
  db.ref('bq_dms/'+dmId+'/read/'+uid).set(Date.now());
}
/* ─── READ RECEIPT SVG CONSTANTS ─── */
const TICK_SINGLE = '<svg viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5.5L4.5 9L12 1"/></svg>';
const TICK_DOUBLE = '<svg viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5.5L4.5 9L12 1"/><path d="M8 5.5L11.5 9L19 1"/></svg>';

function subscribeDmRead(dmId){
  if(!db) return;
  // Detach previous listener cleanly
  if(dmReadRef){ db.ref('bq_dms/'+(dmReadRef._dmId||dmId)+'/read').off('value', dmReadRef); dmReadRef=null; }
  const handler = snap=>{
    if(!dmReadCache[dmId]) dmReadCache[dmId]={};
    snap.forEach(ch=>{ dmReadCache[dmId][ch.key]=ch.val(); });
    updateAllReadReceipts(dmId);
  };
  handler._dmId = dmId;
  dmReadRef = handler;
  db.ref('bq_dms/'+dmId+'/read').on('value', handler);
}

function updateAllReadReceipts(dmId){
  dmId = dmId||activeDmId;
  if(!dmId||!activeDmPuid) return;
  const reads = dmReadCache[dmId]||{};
  const partnerTs = reads[activeDmPuid]||0;
  document.querySelectorAll('#bqdmmsgs .bqr.mine').forEach(row=>{
    const msgTs = parseInt(row.dataset.ts||'0');
    if(!msgTs) return;
    const tickEl = row.querySelector('.bqbbl-tick');
    const metaEl = row.querySelector('.bqbbl-meta');
    if(!tickEl||!metaEl) return;
    if(partnerTs && partnerTs >= msgTs){
      tickEl.innerHTML = TICK_DOUBLE; metaEl.classList.remove('delivered'); metaEl.classList.add('seen'); metaEl.title='Seen';
    } else if(partnerTs){
      tickEl.innerHTML = TICK_DOUBLE; metaEl.classList.remove('seen'); metaEl.classList.add('delivered'); metaEl.title='Delivered';
    } else {
      tickEl.innerHTML = TICK_SINGLE; metaEl.classList.remove('seen','delivered'); metaEl.title='Sent';
    }
  });
}

/* ── STAR MESSAGE ── */
function starMessage(ctx, key, msg){
  const stars=getStarred();
  const dmId=ctx==='global'?'global':(activeDmId||'');
  if(!stars[dmId]) stars[dmId]={};
  const isStarred=!!stars[dmId][key];
  if(isStarred){ delete stars[dmId][key]; }
  else { stars[dmId][key]={text:msg.text,uname:msg.uname,ts:msg.ts,key}; }
  localStorage.setItem(LS_STARS,JSON.stringify(stars));
  // Update star button appearance
  const pfx='bqmsg-'+ctx+'-';
  const btn=document.querySelector('#'+pfx+key+' .bqact.star');
  if(btn) btn.classList.toggle('starred',!isStarred);
  updateStarCount();
  toast(isStarred?'Unstarred':'⭐ Starred');
}

function updateStarCount(){
  const stars=getStarred();
  const dmId=activeDmId||'global';
  const count=stars[dmId]?Object.keys(stars[dmId]).length:0;
  const el=document.getElementById('bq-info-star-count');
  if(el) el.textContent=count;
}

function openStarredPanel(){
  const panel=document.getElementById('bq-starred-panel'); if(!panel) return;
  panel.classList.add('open');
  renderStarredList();
}
function renderStarredList(){
  const list=document.getElementById('bq-starred-list'); if(!list) return;
  const stars=getStarred();
  const dmId=activeDmId||'global';
  const items=stars[dmId]?Object.values(stars[dmId]):[];
  if(!items.length){
    list.innerHTML='<div style="padding:32px;text-align:center;font-family:Inter,sans-serif;font-size:13px;color:var(--bq-text-subtle)">No starred messages</div>';
    return;
  }
  list.innerHTML='';
  items.sort((a,b)=>(b.ts||0)-(a.ts||0)).forEach(item=>{
    const d=document.createElement('div'); d.className='bq-starred-item';
    d.innerHTML=(
      '<div class="bq-starred-from">@'+esc(item.uname||'')+'</div>'+
      '<div class="bq-starred-text">'+esc(item.text||'').slice(0,200)+'</div>'+
      '<div class="bq-starred-ts">'+new Date(item.ts||0).toLocaleString()+'</div>'+
      '<button class="bq-starred-unstar" data-key="'+item.key+'" title="Unstar">'+
      '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    );
    d.querySelector('.bq-starred-unstar').onclick=e=>{
      e.stopPropagation();
      const s=getStarred();
      if(s[dmId]) delete s[dmId][item.key];
      localStorage.setItem(LS_STARS,JSON.stringify(s));
      d.remove(); updateStarCount();
      if(!list.children.length) list.innerHTML='<div style="padding:32px;text-align:center;font-family:Inter,sans-serif;font-size:13px;color:var(--bq-text-subtle)">No starred messages</div>';
    };
    // Click to scroll to message
    d.addEventListener('click',e=>{ if(e.target.closest('.bq-starred-unstar')) return;
      const row=document.getElementById('bqmsg-dm-'+item.key);
      if(row){ document.getElementById('bq-starred-panel').classList.remove('open');
        row.scrollIntoView({behavior:'smooth',block:'center'});
        row.classList.add('bq-msg-jump');
        setTimeout(()=>row.classList.remove('bq-msg-jump'),1200);
      }
    });
    list.appendChild(d);
  });
}

/* ── PIN MESSAGE IN DM ── */
function pinMessage(ctx, key, msg){
  if(!db||ctx==='global') return;
  const dmId=activeDmId; if(!dmId) return;
  db.ref('bq_dms/'+dmId+'/pinned').once('value',snap=>{
    const cur=snap.val();
    if(cur&&cur.key===key){
      // Unpin
      db.ref('bq_dms/'+dmId+'/pinned').remove();
      toast('Message unpinned');
    } else {
      db.ref('bq_dms/'+dmId+'/pinned').set({key,text:msg.text.slice(0,80),uname:msg.uname,ts:Date.now()});
      toast('📌 Message pinned');
    }
  });
}
function subscribeDmPinned(dmId){
  if(!db) return;
  db.ref('bq_dms/'+dmId+'/pinned').on('value',snap=>{
    const data=snap.val();
    const bar=document.getElementById('bq-pinned-bar');
    const txt=document.getElementById('bq-pinbar-text');
    if(!bar||!txt) return;
    if(data){ bar.classList.add('show'); txt.textContent=data.text||''; }
    else bar.classList.remove('show');
  });
}

/* ── DM INFO PANEL ── */
function openDmInfo(){
  // v3: route legacy "Conversation Info" to the new floating card
  document.getElementById('bq-dm-menu')?.classList.remove('open');
  if(typeof openInfoFloat==='function') openInfoFloat();
}
function closeDmInfo(){
  document.getElementById('bq-dm-info')?.classList.remove('open');
}
function updateDmInfoPanel(){
  if(!activeDmPuid) return;
  const color=getColor(activeDmPuid,activeDmPname||'');
  const pdata=onlineU[activeDmPuid]||{};
  const si=statusInfo(pdata.status||'online');
  const av=document.getElementById('bq-info-av');
  if(av){ av.style.background=color; av.style.color='#000'; av.textContent=uInit(activeDmPname||'?');
    av.className='bq-info-av'+(pdata.status?' '+pdata.status:''); }
  const nm=document.getElementById('bq-info-name'); if(nm) nm.textContent='@'+(activeDmPname||'');
  const st=document.getElementById('bq-info-status');
  if(st){ st.textContent=onlineU[activeDmPuid]?si.label:'Offline'; st.style.color=onlineU[activeDmPuid]?si.color:'var(--bq-text-subtle)'; }
  const bio=document.getElementById('bq-info-bio'); if(bio) bio.textContent=pdata.bio||'';
  // Mute toggle
  const mc=document.getElementById('bq-mute-chk'); if(mc) mc.checked=isMuted(activeDmId||'');
  // Theme chips
  const theme=getDmTheme(activeDmId||'');
  document.querySelectorAll('.bq-theme-chip').forEach(ch=>ch.classList.toggle('sel',ch.dataset.t===theme));
  // Disappear toggle
  const dc=document.getElementById('bq-disappear-chk');
  const ds=document.getElementById('bq-disappear-sub');
  const dis=getDisappear();
  const disOn=!!(activeDmId&&dis[activeDmId]);
  if(dc) dc.checked=disOn;
  if(ds) ds.textContent=disOn?'5 minutes':'Off';
  updateStarCount();
}


/* ── DISAPPEARING MESSAGES TOGGLE ── */
function toggleDisappear(did){
  const dis=getDisappear();
  dis[did]=!dis[did]; localStorage.setItem(LS_DISAPP,JSON.stringify(dis));
  const sub=document.getElementById('bq-disappear-sub');
  if(sub) sub.textContent=dis[did]?'5 minutes':'Off';
  toast(dis[did]?'⏱ Disappearing messages on (5 min)':'Disappearing messages off');
}

/* ── IMAGE PASTE / MEDIA ── */
let pendingImageData=null;
function handleDmPaste(e){
  const items=e.clipboardData?.items; if(!items) return;
  for(const item of items){
    if(item.type.startsWith('image/')){
      e.preventDefault();
      const file=item.getAsFile(); if(!file) return;
      // Guard: Firebase 1MB write limit — compress large images
      if(file.size > 400*1024){
        toast('Image too large — max ~400KB'); return;
      }
      const reader=new FileReader();
      reader.onload=ev=>{
        // Compress via canvas if needed
        const img=new Image();
        img.onload=()=>{
          const MAX=600;
          const canvas=document.createElement('canvas');
          const scale=Math.min(1,MAX/Math.max(img.width,img.height));
          canvas.width=Math.round(img.width*scale);
          canvas.height=Math.round(img.height*scale);
          canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
          const compressed=canvas.toDataURL('image/jpeg',0.7);
          if(compressed.length>800*1024){ toast('Image too large after compression'); return; }
          pendingImageData=compressed;
          const prev=document.getElementById('bq-media-preview');
          const thumb=document.getElementById('bq-media-thumb');
          const name=document.getElementById('bq-media-name');
          if(prev) prev.classList.add('show');
          if(thumb) thumb.src=pendingImageData;
          if(name) name.textContent='Image (~'+Math.round(compressed.length/1024)+'KB)';
        };
        img.src=ev.target.result;
      };
      reader.readAsDataURL(file);
      return;
    }
  }
}
function clearMediaPreview(){
  pendingImageData=null;
  document.getElementById('bq-media-preview')?.classList.remove('show');
  document.getElementById('bq-media-thumb').src='';
}

/* ── INIT DM FEATURES ── */
function initDmFeatures(){
  // DM menu button
  const menuBtn=document.getElementById('bq-dm-menu-btn');
  const menuDrop=document.getElementById('bq-dm-menu');
  menuBtn?.addEventListener('click',e=>{ e.stopPropagation(); menuDrop?.classList.toggle('open'); });
  document.getElementById('bq-dm-menu-info')?.addEventListener('click',openDmInfo);
  document.getElementById('bq-dm-menu-starred')?.addEventListener('click',()=>{ menuDrop?.classList.remove('open'); openStarredPanel(); });
  document.getElementById('bq-dm-menu-theme')?.addEventListener('click',()=>{ menuDrop?.classList.remove('open'); openDmInfo(); });
  document.getElementById('bq-dm-menu-mute')?.addEventListener('click',()=>{ menuDrop?.classList.remove('open'); if(activeDmId) toggleMute(activeDmId); });
  document.getElementById('bq-dm-menu-clear')?.addEventListener('click',()=>{ menuDrop?.classList.remove('open'); if(activeDmId&&db){ db.ref('bq_dms/'+activeDmId+'/messages').remove(); toast('Conversation cleared'); } });

  // Close menu on outside click
  document.getElementById('bqp')?.addEventListener('click',e=>{
    if(!menuBtn?.contains(e.target)) menuDrop?.classList.remove('open');
  });

  // DM info panel
  document.getElementById('bq-info-close')?.addEventListener('click',closeDmInfo);
  
  // Starred panel back
  document.getElementById('bq-starred-back')?.addEventListener('click',()=>{
    document.getElementById('bq-starred-panel')?.classList.remove('open');
  });
  
  // Starred in info panel
  document.getElementById('bq-info-starred-row')?.addEventListener('click',openStarredPanel);
  
  // Clear in info panel
  document.getElementById('bq-info-clear-row')?.addEventListener('click',()=>{
    if(activeDmId&&db){ db.ref('bq_dms/'+activeDmId+'/messages').remove(); closeDmInfo(); toast('Conversation cleared'); }
  });
  
  // Theme chips
  document.querySelectorAll('.bq-theme-chip').forEach(ch=>{
    ch.addEventListener('click',()=>{ if(activeDmId) setDmTheme(activeDmId,ch.dataset.t); });
  });
  
  // Mute toggle
  document.getElementById('bq-mute-chk')?.addEventListener('change',()=>{ if(activeDmId) toggleMute(activeDmId); });
  
  // Disappear toggle
  document.getElementById('bq-disappear-chk')?.addEventListener('change',()=>{ if(activeDmId) toggleDisappear(activeDmId); });
  
  // Pinned bar click → jump to message; unpin button
  document.getElementById('bq-pinned-bar')?.addEventListener('click',e=>{
    if(e.target.closest('#bq-pinbar-unpin')) return;
    // Jump to pinned message (if visible)
  });
  document.getElementById('bq-pinbar-unpin')?.addEventListener('click',e=>{
    e.stopPropagation();
    if(activeDmId&&db) db.ref('bq_dms/'+activeDmId+'/pinned').remove();
  });
  
  // Media paste
  document.getElementById('bqdminp')?.addEventListener('paste',handleDmPaste);
  document.getElementById('bq-media-rm')?.addEventListener('click',clearMediaPreview);
  
  // Image / GIF lightbox — centered preview overlay (no external link)
  document.getElementById('bqp')?.addEventListener('click',e=>{
    const t=e.target;
    if(t.classList.contains('bq-msg-img')||t.classList.contains('bq-msg-gif')){
      e.stopPropagation();
      openMediaLightbox(t.src, t.classList.contains('bq-msg-gif')?'gif':'image', t.closest('.bqr'));
    }
  });
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

  // ── DEDUP FIX: limitToLast re-fires child_added on delete ──
  // If this message element already exists in the DOM, skip re-render.
  if (document.getElementById(pfx + key)) return;

  if(msg.type==='system'){
    if(document.getElementById(pfx+key)) return; // dedup
    const d=document.createElement('div');d.id=pfx+key;d.className='bqsys';d.textContent=msg.text;
    msgsEl.appendChild(d);scrollD(ctx);return;
  }

  const isMine=msg.uid===uid;
  const ts=msg.ts||Date.now();
  const msgDate=new Date(ts);

  // Date sep — keyed: only insert if no sep for this date already exists
  const dateKey = msgDate.toDateString();
  const existingSep = msgsEl.querySelector('.bqds[data-date="'+dateKey+'"]');
  const lastEl=msgsEl.lastElementChild;
  if(!existingSep){
    const sep=document.createElement('div');sep.className='bqds';sep.textContent=dateLabel(ts);sep.dataset.date=dateKey;
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
  // v9.2: Full WhatsApp-style emoji picker — tabs + scrollable grid per category
  const _epCats=Object.keys(REACTION_CATEGORIES);
  const _epTabs=_epCats.map((c,i)=>`<button class="bqep-tab${i===0?' active':''}" data-cat="${c}">${c}</button>`).join('');
  const _epPanes=_epCats.map((c,i)=>{
    const btns=REACTION_CATEGORIES[c].map(e=>`<button class="bqepbtn" data-e="${e}">${e}</button>`).join('');
    return `<div class="bqep-pane${i===0?' active':''}" data-cat="${c}">${btns}</div>`;
  }).join('');
  const pickBtns=`<div class="bqep-tabs">${_epTabs}</div><div class="bqep-panes">${_epPanes}</div>`;

  const row=document.createElement('div');
  row.id=pfx+key;
  row.className='bqr '+(isMine?'mine':'theirs')+(consec?' consec':'');
  row.dataset.date=msgDate.toDateString();
  row.dataset.ts=String(ts);
  row.dataset.msguid=msg.uid;

  // Build actions safely (no nested backticks)
  var _pinBtn   = !isG ? '<button class="bqact" data-a="pin" title="Pin"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></button>' : '';
  var _editBtn  = isMine ? '<button class="bqact" data-a="edit" title="Edit"><svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>' : '';
  var _delBtn   = isMine ? '<button class="bqact del" data-a="del" title="Delete"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>' : '';
  var _imgHtml  = msg.imageData ? '<img class="bq-msg-img" src="'+msg.imageData+'" alt="" loading="lazy">' : '';
  var _gifHtml  = (msg.type==='gif' && msg.gifUrl) ? '<img class="bq-msg-gif" src="'+esc(msg.gifUrl)+'" alt="GIF" loading="lazy">' : '';
  var _stickerHtml = (msg.type==='sticker' && msg.sticker) ? '<span class="bqsticker">'+esc(msg.sticker)+'</span>' : '';
  var _voiceHtml = (msg.type==='voice' && msg.audio) ? buildVoiceHtml(msg) : '';
  var _isSticker = !!_stickerHtml;
  var _hasMedia = !!(_imgHtml || _gifHtml);
  var _txtHtml  = msg.text ? mentionify(linkify(esc(msg.text))) : '';
  var _hasText  = !!_txtHtml;
  var _bblCls   = 'bqbbl'+(msg.expiresAt?' disappearing':'')+(_hasMedia?' media':'')+(_hasMedia&&_hasText?' has-text':'')+(_isSticker?' sticker':'');
  var _unName   = isMine ? 'You' : '@'+esc(presD.displayName||msg.uname||'?');

  // Inline meta INSIDE bubble — timestamp + (mine&dm) tick
  var _tickHtml = (isMine&&!isG) ? '<span class="bqbbl-tick">'+TICK_SINGLE+'</span>' : '';
  var _metaHtml = '<span class="bqbbl-meta" title="Sent">'+tStr+_tickHtml+'</span><span class="bqbbl-meta-clear"></span>';

  row.innerHTML =
    '<div class="bqri">'+
      '<div class="bqav" style="'+(presD.avatar?('background:url('+presD.avatar+') center/cover;color:transparent;'):('background:'+col+';color:#000;'))+'"'+
        ' data-status="'+esc(presD.status||'')+'"'+
        ' data-uid="'+esc(msg.uid)+'"'+
        ' data-uname="'+esc(msg.uname||'')+'">'+(presD.avatar?'':((presD.initials||ini)))+'</div>'+
      '<div class="bqcol">'+
        '<div class="bqmeta">'+
          '<span class="bqun" style="color:'+col+'"'+
            ' data-uid="'+esc(msg.uid)+'"'+
            ' data-uname="'+esc(msg.uname||'')+'">'+_unName+'</span>'+
        '</div>'+
        '<div class="bqbw">'+
          '<div class="bqacts">'+
            '<div class="bqepick" id="'+pfx+'ep-'+key+'">'+pickBtns+'</div>'+
            '<button class="bqact" data-a="react" title="React">😊</button>'+
            '<button class="bqact" data-a="reply" title="Reply"><svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></button>'+
            '<button class="bqact" data-a="copy" title="Copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>'+
            '<button class="bqact star" data-a="star" title="Star"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>'+
            _pinBtn+_editBtn+_delBtn+
          '</div>'+
          '<div class="'+_bblCls+'">'+rpHTML+_imgHtml+_gifHtml+_stickerHtml+_voiceHtml+_txtHtml+(msg.edited?'<span class="bqedited">(edited)</span>':'')+timerHTML+_metaHtml+'</div>'+
        '</div>'+
      '</div>'+
    '</div>';

  if(msg.reactions) renderRxns(ctx,row,msg.reactions,key);
  // Mark if starred
  const _stars=getStarred();
  const _sdid=ctx==='global'?'global':(activeDmId||'');
  if(_stars[_sdid]&&_stars[_sdid][key]){ row.querySelector('.bqact.star')?.classList.add('starred'); }
  msgsEl.appendChild(row);
  // Apply any cached read receipts to this newly rendered message
  if(isMine&&!isG) requestAnimationFrame(()=>updateAllReadReceipts(activeDmId));

  // Action buttons
  row.querySelectorAll('.bqact').forEach(b=>{
    b.addEventListener('click',e=>{e.stopPropagation();doAction(ctx,b.dataset.a,key,msg,pfx);});
  });
  // Emoji pick
  row.querySelectorAll('.bqepbtn').forEach(b=>{
    b.addEventListener('click',e=>{e.stopPropagation();toggleRxn(ctx,key,b.dataset.e);document.getElementById(pfx+'ep-'+key)?.classList.remove('open');});
  });
  // v9.2: Emoji-picker category tabs
  row.querySelectorAll('.bqep-tab').forEach(t=>{
    t.addEventListener('click',e=>{
      e.stopPropagation();
      const cat=t.dataset.cat;
      const pickEl=t.closest('.bqepick'); if(!pickEl) return;
      pickEl.querySelectorAll('.bqep-tab').forEach(x=>x.classList.toggle('active',x===t));
      pickEl.querySelectorAll('.bqep-pane').forEach(p=>p.classList.toggle('active',p.dataset.cat===cat));
    });
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
  // v9.3: Mobile/tap support — tap a message bubble to toggle the action toolbar.
  // Hover still works on desktop; tap is additive for touch devices.
  const _bbl=row.querySelector('.bqbbl');
  if(_bbl){
    _bbl.addEventListener('click',e=>{
      if(e.target.closest('a,img,.bq-voice-play,.bqact,.bqepick,.bqep-tab,.bqepbtn,.bqrp')) return;
      e.stopPropagation();
      document.querySelectorAll('.bqr.bq-tapped').forEach(r=>{ if(r!==row) r.classList.remove('bq-tapped'); });
      row.classList.add('bq-tapped');
      renderMsgActionSheet(ctx,key,msg,pfx,_bbl);
    });
  }

  // Notification + badge
  if(!isOpen&&!isMine){
    if(isG) gUnread++; else {dmUnread[activeDmId]=(dmUnread[activeDmId]||0)+1;}
    updateBadges();
    /* notifications removed */
  }
  // Mark DM as read if currently viewing this DM
  if(!isG&&isOpen&&activeView==='dmconv'&&!isMine){
    markDmRead(activeDmId);
  }
  scrollD(ctx,isMine);
}

function ensureMsgActionSheet(){
  let el=document.getElementById('bq-msg-sheet');
  if(el) return el;
  el=document.createElement('div');
  el.id='bq-msg-sheet';
  el.innerHTML=''+
    '<div class="bq-ms-backdrop" data-close="1"></div>'+
    '<div class="bq-ms-panel" role="dialog" aria-label="Message actions">'+
      '<div class="bq-ms-preview" id="bq-ms-preview"></div>'+
      '<div class="bq-ms-actions" id="bq-ms-actions"></div>'+
    '</div>';
  document.body.appendChild(el);
  el.addEventListener('pointerdown',e=>{
    if(e.target.closest('.bq-ms-panel')) e.stopPropagation();
  },true);
  el.addEventListener('click',e=>{
    if(e.target.dataset.close==='1' || e.target===el) closeMsgActionSheet();
  });
  return el;
}
function closeMsgActionSheet(){
  const el=document.getElementById('bq-msg-sheet');
  if(!el) return;
  el.classList.remove('open');
  el.dataset.ctx=''; el.dataset.key=''; el.dataset.pfx='';
  delete el._anchorRect;
}
function renderMsgActionSheet(ctx,key,msg,pfx,anchorEl){
  const sheet=ensureMsgActionSheet();
  const preview=sheet.querySelector('#bq-ms-preview');
  const panel=sheet.querySelector('.bq-ms-panel');
  const actions=sheet.querySelector('#bq-ms-actions');
  if(!preview||!actions||!panel) return;
  sheet.dataset.ctx=ctx; sheet.dataset.key=key; sheet.dataset.pfx=pfx;
  const isMine=msg.uid===uid;
  const previewText = msg.type==='voice' ? '🎤 Voice note' : (msg.text || (msg.imageData?'Photo':(msg.gifUrl?'GIF':'Message')));
  preview.innerHTML = '<div class="bq-ms-author">'+esc(isMine?'You':'@'+(msg.uname||'?'))+'</div><div class="bq-ms-text">'+esc(previewText)+'</div>';
  const items = [
    {a:'reply', label:'Reply', icon:'<svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>'},
    {a:'copy', label:'Copy', icon:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'},
    {a:'react', label:'React', icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'}
  ];
  if(isMine) items.splice(0, items.length, {a:'del', label:'Delete', danger:true, icon:'<svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>'});
  actions.innerHTML = items.map(item=>'<button class="bq-ms-btn'+(item.danger?' danger':'')+'" data-a="'+item.a+'">'+item.icon+'<span>'+item.label+'</span></button>').join('');
  actions.querySelectorAll('.bq-ms-btn').forEach(btn=>{
    btn.addEventListener('pointerdown',e=>e.stopPropagation(),true);
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      closeMsgActionSheet();
      doAction(ctx, btn.dataset.a, key, msg, pfx, true);
    });
  });
  const rect=(anchorEl||document.getElementById(pfx+key))?.getBoundingClientRect?.();
  const w=Math.min(220,Math.max(148,panel.offsetWidth||168));
  const h=panel.offsetHeight||112;
  const vw=window.innerWidth||360;
  const vh=window.innerHeight||640;
  const left=Math.min(vw-w-10,Math.max(10,rect?rect.left+(rect.width-w)/2:10));
  let top=rect?rect.top-h-8:12;
  if(top<10) top=rect?Math.min(vh-h-10,rect.bottom+8):12;
  panel.style.left=left+'px';
  panel.style.top=top+'px';
  panel.style.right='auto';
  panel.style.bottom='auto';
  sheet.classList.add('open');
}

function doAction(ctx,a,key,msg,pfx,fromSheet){
  if(a==='react'){
    const p=document.getElementById(pfx+'ep-'+key);
    if(p){
      p.classList.toggle('open');
      const row=document.getElementById(pfx+key);
      row?.classList.add('bq-tapped');
      if(fromSheet){
        requestAnimationFrame(()=>{
          const first=p.querySelector('.bqepbtn');
          first?.focus?.();
        });
      }
    }
  }
  else if(a==='reply'){
    setReply(ctx==='global'?'g':'dm',{key,uname:msg.uname,text:(msg.text || (msg.type==='voice'?'🎤 Voice note':'Media'))});
    document.getElementById(ctx==='global'?'bqginp':'bqdminp')?.focus();
  }
  else if(a==='copy'){
    const copyText = msg.text || (msg.type==='voice' ? '🎤 Voice note' : msg.gifUrl || msg.imageData || '');
    navigator.clipboard?.writeText(copyText).then(()=>toast('Copied!'));
  }
  else if(a==='del'){
    if(msg.uid!==uid)return;
    const p=ctx==='global'?'bq_messages/'+key:'bq_dms/'+activeDmId+'/messages/'+key;
    document.getElementById(pfx+key)?.remove();
    db.ref(p).remove();
  }
  else if(a==='edit'){if(msg.uid!==uid)return;startEditMsg(ctx,key,msg,pfx);}
  else if(a==='star'){starMessage(ctx,key,msg);}
  else if(a==='pin'){pinMessage(ctx,key,msg);}
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
function scrollD(ctx, isMyMsg){
  const isG=ctx==='global';
  const msgsEl=document.getElementById(isG?'bqgmsgs':'bqdmmsgs');
  if(!msgsEl) return;
  const distFromBot=msgsEl.scrollHeight-msgsEl.scrollTop-msgsEl.clientHeight;
  // Scroll if: it's my own message, OR user is already near bottom (<150px)
  if(isMyMsg||(isG?gAtBot:dAtBot)||distFromBot<150){
    requestAnimationFrame(()=>{
      msgsEl.scrollTop=msgsEl.scrollHeight;
      if(isG) gAtBot=true; else dAtBot=true;
    });
  }
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
  // If DM is open, mark as read + refresh receipts
  if(activeView==='dmconv'&&activeDmId){
    markDmRead(activeDmId);
    setTimeout(()=>updateAllReadReceipts(activeDmId),200);
  }
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

  // Quick stickers tray (replaces emoji tray) — tap to send a one-tap sticker message
  QUICK_STICKERS.forEach(e=>{
    const b=document.createElement('button');
    b.className='bqietb';b.textContent=e;b.title='Send '+e+' sticker';
    b.addEventListener('click',()=>{
      if(!uname){showModal(false);return;}
      if(isG) sendStickerGlobal(e); else sendStickerDm(e);
      tray.classList.remove('open');
    });
    tray.appendChild(b);
  });
  if(eoB){
    eoB.textContent='✨';
    eoB.title='Quick Stickers';
    eoB.addEventListener('click',()=>tray.classList.toggle('open'));
  }

  // GIF picker
  attachGifPicker(ctx);

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

  function doSend(){
    const txt=inp.value.trim();if(!txt)return;
    if(!uname){showModal(false);return;}
    if(isG) sendGlobal(txt); else sendDm(txt);
    inp.value='';inp.style.height='auto';snd.disabled=true;cc.textContent='';
    snd.classList.add('sending'); setTimeout(()=>snd.classList.remove('sending'),320);
    if(isG)setGTyp(false);else setDmTyp(false);
    if(isG)gAtBot=true;else dAtBot=true;
    // Always scroll on send (it's our own message)
    if(msgs) requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight;});
  }

  // Scroll tracking
  if(msgs&&scrB){
    msgs.addEventListener('scroll',()=>{
      const d=msgs.scrollHeight-msgs.scrollTop-msgs.clientHeight;
      const atB=d<80;if(isG)gAtBot=atB;else dAtBot=atB;
      scrB.classList.toggle('show',!atB&&d>120);
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
  // DM features
  initDmFeatures();

  // Set up inputs
  setupInput('global');
  setupInput('dm');

  // Outside click — ignore clicks on widget overlays appended to body
  document.addEventListener('mousedown',e=>{
    if(!isOpen)return;
    if(isFull)return;
    const p=document.getElementById('bqp');
    const b=document.getElementById('bqb');
    // v3: skip outside-close when interacting with overlays that live outside #bqp
    if(e.target.closest('#bq-media-lightbox,#bq-pv,#bq-info-float,#bqimg-preview,#bq-confirm,#bq-msg-sheet,.bqimg-preview,.bqpv-modal,.bq-confirm')) return;
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


/* ═══════════════════════════════════════════════════════════
   v3 — NEW FEATURES: lightbox, floating info, profiles V2,
   voice notes, theme/bubble/font controls
═══════════════════════════════════════════════════════════ */

/* ── GIF / IMAGE LIGHTBOX ── */
function openMediaLightbox(src, kind, rowEl){
  const lb=document.getElementById('bq-media-lightbox');
  const img=document.getElementById('bq-lb-img');
  const from=document.getElementById('bq-lb-from');
  const tsEl=document.getElementById('bq-lb-ts');
  if(!lb||!img) return;
  img.src=src;
  if(rowEl){
    const u=rowEl.querySelector('.bqun')?.textContent||'';
    from.textContent=u;
    const ts=parseInt(rowEl.dataset.ts||'0');
    tsEl.textContent=ts?new Date(ts).toLocaleString():'';
  } else { from.textContent=''; tsEl.textContent=''; }
  lb.classList.add('open');
}
function closeMediaLightbox(){ document.getElementById('bq-media-lightbox')?.classList.remove('open'); }

/* ── FLOATING CONVERSATION INFO CARD ── */
const LS_BUBSTYLE='bq_bubble_style';
const LS_RR='bq_read_receipts';

function getBubStyle(){return localStorage.getItem(LS_BUBSTYLE)||'rounded';}
function setBubStyle(s){
  localStorage.setItem(LS_BUBSTYLE,s);
  const p=document.getElementById('bqp');
  if(!p) return;
  p.classList.remove('bq-bub-square','bq-bub-glass');
  if(s==='square') p.classList.add('bq-bub-square');
  else if(s==='glass') p.classList.add('bq-bub-glass');
}

function getRR(){return localStorage.getItem(LS_RR)!=='off';}
function toggleRR(){
  const cur=getRR();
  localStorage.setItem(LS_RR,cur?'off':'on');
  const p=document.getElementById('bqp');
  if(p) p.classList.toggle('bq-rr-off',!cur===false);
  toast('Read receipts: '+(cur?'OFF':'ON'));
  const v=document.getElementById('bq-if-rr-v');if(v) v.textContent=cur?'Off':'On';
}

function openInfoFloat(){
  const card=document.getElementById('bq-info-float');
  if(!card||!activeDmPuid) return;
  const pdata=onlineU[activeDmPuid]||{};
  const name=getAlias(activeDmPuid)||('@'+activeDmPname);
  const col=getColor(activeDmPuid,activeDmPname||'');
  const av=document.getElementById('bq-if-av');
  if(av){av.style.background=col;av.style.color='#000';av.textContent=uInit(activeDmPname||'?');}
  document.getElementById('bq-if-name').textContent=name;
  const si=statusInfo(pdata.status||'online');
  document.getElementById('bq-if-st').textContent=onlineU[activeDmPuid]?si.label:(pdata.ts?'Last seen '+lastSeenStr(pdata.ts):'Offline');
  // Theme selection
  const curTheme=getDmTheme(activeDmId)||'none';
  document.querySelectorAll('#bq-if-themes .bq-if-th').forEach(t=>{
    t.classList.toggle('sel',t.dataset.t===curTheme);
  });
  // Bubble style
  const bs=getBubStyle();
  document.querySelectorAll('#bq-if-bubble .bq-if-bubble-opt').forEach(o=>{
    o.classList.toggle('sel',o.dataset.b===bs);
  });
  // Font size
  const fs=myProfile.fontSize||'md';
  document.querySelectorAll('#bq-if-fonts .bq-if-font').forEach(f=>{
    f.classList.toggle('sel',f.dataset.s===fs);
  });
  // Pin state
  const pins=getPins();
  document.getElementById('bq-if-pin-v').textContent=pins.includes(activeDmId)?'On':'Off';
  // Read receipts
  document.getElementById('bq-if-rr-v').textContent=getRR()?'On':'Off';
  card.classList.add('open');
}
function closeInfoFloat(){ document.getElementById('bq-info-float')?.classList.remove('open'); }

function exportConversation(){
  if(!activeDmId) return;
  const rows=document.querySelectorAll('#bqdmmsgs .bqr');
  const lines=[];
  rows.forEach(r=>{
    const u=r.querySelector('.bqun')?.textContent||(r.classList.contains('mine')?'You':'Them');
    const t=r.querySelector('.bqbbl')?.innerText?.replace(/\n+/g,' ')||'';
    const ts=parseInt(r.dataset.ts||'0');
    const tStr=ts?new Date(ts).toLocaleString():'';
    lines.push('['+tStr+'] '+u+': '+t);
  });
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='chat-'+(activeDmPname||'conversation')+'.txt';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Chat exported');
}

function searchInConversation(){
  const q=prompt('Search this conversation for…');
  if(!q) return;
  const ql=q.toLowerCase();
  let found=null;
  document.querySelectorAll('#bqdmmsgs .bqr').forEach(r=>{
    const txt=r.querySelector('.bqbbl')?.innerText?.toLowerCase()||'';
    if(!found && txt.includes(ql)) found=r;
  });
  if(found){
    found.scrollIntoView({behavior:'smooth',block:'center'});
    found.classList.add('bq-msg-jump');
    setTimeout(()=>found.classList.remove('bq-msg-jump'),1200);
  } else toast('No match found');
}

function blockUser(){
  if(!activeDmPuid) return;
  if(!confirm('Block @'+activeDmPname+'? You can unblock later.')) return;
  try{
    const blocked=JSON.parse(localStorage.getItem('bq_blocked')||'[]');
    if(!blocked.includes(activeDmPuid)) blocked.push(activeDmPuid);
    localStorage.setItem('bq_blocked',JSON.stringify(blocked));
    toast('User blocked');
    closeInfoFloat();
  }catch(e){console.error(e);}
}

/* ── PROFILES V2 — view modal + uploads ── */
function openProfileView(targetUid,targetName){
  const m=document.getElementById('bq-pv'); if(!m) return;
  // v9: render with what we have NOW, then re-fetch live presence + apply onerror fallbacks
  function _paint(pd){
    const col=getColor(targetUid,targetName);
    const banner=pd.banner;
    const avatar=pd.avatar;
    const bEl=document.getElementById('bq-pv-banner');
    if(banner){
      // Probe banner URL; fall back to gradient if it fails (expired token)
      const probe=new Image();
      probe.onload=()=>{ bEl.style.background='url('+banner.replace(/'/g,"%27")+') center/cover'; };
      probe.onerror=()=>{ bEl.style.background='linear-gradient(135deg,'+col+'aa,'+col+'33)'; };
      probe.src=banner;
      bEl.style.background='linear-gradient(135deg,'+col+'aa,'+col+'33)';
    } else {
      bEl.style.background='linear-gradient(135deg,'+col+'aa,'+col+'33)';
    }
    const av=document.getElementById('bq-pv-av');
    if(avatar){
      const probe=new Image();
      probe.onload=()=>{ av.style.background='url('+avatar.replace(/'/g,"%27")+') center/cover';av.style.color='transparent';av.textContent=''; };
      probe.onerror=()=>{ av.style.background=col;av.style.color='#000';av.textContent=uInit(pd.displayName||targetName); };
      probe.src=avatar;
    } else {
      av.style.background=col;av.style.color='#000';av.textContent=uInit(pd.displayName||targetName);
    }
    document.getElementById('bq-pv-name').textContent='@'+targetName;
    const si=statusInfo(pd.status||'online');
    document.getElementById('bq-pv-st').textContent=(onlineU[targetUid]?si.label:(pd.ts?'Last seen '+lastSeenStr(pd.ts):'Offline'));
    document.getElementById('bq-pv-bio').textContent=pd.bio||'No bio yet.';
  }
  // Initial paint with cached presence (or empty)
  _paint(onlineU[targetUid]||AVATAR_CACHE[targetUid]||{});
  // Live re-fetch — handles freshly opened profile when presence hasn't synced yet
  if(db){
    db.ref('bq_presence/'+targetUid).once('value').then(snap=>{
      const live=snap.val();
      if(live){ onlineU[targetUid]=live; _cacheAvatarFromPresence(targetUid, live); _paint(live); }
    }).catch(()=>{});
  }
  const msgBtn=document.getElementById('bq-pv-msg');
  if(targetUid===uid){msgBtn.style.display='none';}
  else{
    msgBtn.style.display='';
    msgBtn.onclick=()=>{m.classList.remove('open');showDmConvo(targetUid,targetName);};
  }
  m.classList.add('open');
}
function closeProfileView(){document.getElementById('bq-pv')?.classList.remove('open');}

// Resize image file → data URL
function resizeImageFile(file,maxW,maxH){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;
        const ratio=Math.min(maxW/w,maxH/h,1);
        w=Math.round(w*ratio);h=Math.round(h*ratio);
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL('image/jpeg',0.82));
      };
      img.onerror=reject;
      img.src=ev.target.result;
    };
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}

/* v9.3: Free image hosting via catbox.moe (no API key, anonymous, permanent URLs).
   Falls back to data URL if upload fails (so the user still sees their pic locally). */
async function dataUrlToBlob(dataUrl){
  const r=await fetch(dataUrl); return await r.blob();
}
async function hostImage(dataUrl){
  try{
    const blob=await dataUrlToBlob(dataUrl);
    // Catbox accepts files up to 200MB, returns a plain-text URL like https://files.catbox.moe/abc123.jpg
    const fd=new FormData();
    fd.append('reqtype','fileupload');
    fd.append('fileToUpload', blob, 'pic.jpg');
    const resp=await fetch(IMAGE_HOST_URL, { method:'POST', body:fd });
    if(!resp.ok) throw new Error('upload http '+resp.status);
    const url=(await resp.text()).trim();
    if(!/^https?:\/\//.test(url)) throw new Error('upload bad response');
    return url;
  }catch(e){
    console.warn('[Chat] image hosting failed, keeping local data URL', e);
    return null;
  }
}

async function uploadAvatar(file){
  try{
    const data=await resizeImageFile(file,256,256);
    // Try hosting first → small URL safe to store in RTDB & loadable on every device.
    const hosted=await hostImage(data);
    const finalUrl=hosted||data;
    myProfile.avatar=finalUrl;
    localStorage.setItem(LS_PROF,JSON.stringify(myProfile));
    if(db&&uid) db.ref('bq_presence/'+uid+'/avatar').set(finalUrl);
    refreshMeAvatar();
    const prev=document.getElementById('bqpf-avatar-preview');
    if(prev) prev.style.background='url('+finalUrl+') center/cover';
    toast(hosted?'Avatar updated':'Avatar saved locally (host upload failed)');
  }catch(e){toast('Failed to upload');}
}
async function uploadBanner(file){
  try{
    const data=await resizeImageFile(file,1500,500);
    const hosted=await hostImage(data);
    const finalUrl=hosted||data;
    myProfile.banner=finalUrl;
    localStorage.setItem(LS_PROF,JSON.stringify(myProfile));
    if(db&&uid) db.ref('bq_presence/'+uid+'/banner').set(finalUrl);
    const prev=document.getElementById('bqpf-banner-upload-preview');
    if(prev) prev.style.background='url('+finalUrl+') center/cover';
    toast(hosted?'Banner updated':'Banner saved locally (host upload failed)');
  }catch(e){toast('Failed to upload');}
}

/* ── VOICE NOTES (≤30s) ── */
let _vnRecorder=null, _vnChunks=[], _vnStart=0, _vnTimer=null, _vnStream=null, _vnWaveInterval=null, _vnWaveAnalyser=null, _vnWaveData=null, _vnWavePeaks=[];
const VN_MAX_MS=30000;

function fmtRecTime(ms){
  const s=Math.floor(ms/1000),m=Math.floor(s/60),r=s%60;
  return m+':'+(r<10?'0':'')+r;
}
function normalizeVoiceWave(peaks,count){
  const src=Array.isArray(peaks)?peaks.filter(v=>Number.isFinite(v)):[];
  if(!src.length) return Array.from({length:count},()=>22);
  const out=[];
  for(let i=0;i<count;i++){
    const idx=Math.min(src.length-1,Math.floor((i/src.length)*src.length));
    const v=src[Math.min(src.length-1, Math.floor(i*(src.length/count)))] ?? src[src.length-1] ?? 0.35;
    out.push(Math.max(10,Math.min(100,Math.round(v*100))));
  }
  return out;
}
function sampleVoiceWave(){
  if(!_vnWaveAnalyser||!_vnWaveData) return;
  _vnWaveAnalyser.getByteTimeDomainData(_vnWaveData);
  let sum=0;
  for(let i=0;i<_vnWaveData.length;i++){
    const v=(_vnWaveData[i]-128)/128;
    sum+=v*v;
  }
  const rms=Math.sqrt(sum/_vnWaveData.length);
  _vnWavePeaks.push(Math.max(0.06, Math.min(1, rms*3.6)));
  if(_vnWavePeaks.length>180) _vnWavePeaks.shift();
}
function stopVoiceWaveCapture(){
  if(_vnWaveInterval){ clearInterval(_vnWaveInterval); _vnWaveInterval=null; }
  _vnWaveAnalyser=null; _vnWaveData=null;
}
async function startVoice(){
  if(!activeDmId||!navigator.mediaDevices){toast('Voice notes not supported');return;}
  try{
    _vnStream=await navigator.mediaDevices.getUserMedia({audio:true});
    let mime='audio/webm;codecs=opus';
    if(!MediaRecorder.isTypeSupported(mime)) mime='audio/webm';
    if(!MediaRecorder.isTypeSupported(mime)) mime='';
    _vnRecorder=mime?new MediaRecorder(_vnStream,{mimeType:mime}):new MediaRecorder(_vnStream);
    _vnChunks=[];
    _vnWavePeaks=[];
    try{
      const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      const source=audioCtx.createMediaStreamSource(_vnStream);
      _vnWaveAnalyser=audioCtx.createAnalyser();
      _vnWaveAnalyser.fftSize=512;
      _vnWaveData=new Uint8Array(_vnWaveAnalyser.frequencyBinCount);
      source.connect(_vnWaveAnalyser);
      _vnWaveInterval=setInterval(sampleVoiceWave, 70);
      _vnRecorder.addEventListener('stop',()=>{ try{audioCtx.close();}catch(_){} },{once:true});
    }catch(_){ stopVoiceWaveCapture(); }
    _vnRecorder.ondataavailable=e=>{if(e.data.size>0)_vnChunks.push(e.data);};
    _vnRecorder.onstop=()=>{
      stopVoiceWaveCapture();
      _vnStream?.getTracks().forEach(t=>t.stop());
      _vnStream=null;
      const blob=new Blob(_vnChunks,{type:_vnRecorder.mimeType||'audio/webm'});
      if(blob.size<800){toast('Recording too short');resetVoiceUI();return;}
      const reader=new FileReader();
      reader.onload=()=>{
        const data=reader.result;
        const dur=Math.min(VN_MAX_MS,Date.now()-_vnStart);
        const waveform=normalizeVoiceWave(_vnWavePeaks, 48);
        sendVoiceDm(data,dur,waveform);
        resetVoiceUI();
      };
      reader.readAsDataURL(blob);
    };
    _vnRecorder.start();
    _vnStart=Date.now();
    document.getElementById('bq-voice-btn')?.classList.add('recording');
    document.getElementById('bq-voice-rec-bar')?.classList.add('show');
    _vnTimer=setInterval(()=>{
      const elapsed=Date.now()-_vnStart;
      const t=document.getElementById('bq-voice-rec-time');
      if(t) t.textContent=fmtRecTime(elapsed);
      if(elapsed>=VN_MAX_MS) stopVoice();
    },200);
  }catch(e){toast('Microphone permission denied');}
}
function stopVoice(){
  if(_vnRecorder&&_vnRecorder.state==='recording'){
    try{_vnRecorder.stop();}catch(e){}
  }
  clearInterval(_vnTimer);_vnTimer=null;
}
function cancelVoice(){
  stopVoiceWaveCapture();
  _vnWavePeaks=[];
  if(_vnRecorder&&_vnRecorder.state==='recording'){
    _vnRecorder.onstop=()=>{stopVoiceWaveCapture();_vnStream?.getTracks().forEach(t=>t.stop());_vnStream=null;};
    try{_vnRecorder.stop();}catch(e){}
  }
  clearInterval(_vnTimer);_vnTimer=null;
  resetVoiceUI();
}
function resetVoiceUI(){
  document.getElementById('bq-voice-btn')?.classList.remove('recording');
  document.getElementById('bq-voice-rec-bar')?.classList.remove('show');
  const t=document.getElementById('bq-voice-rec-time');if(t) t.textContent='0:00';
}

function sendVoiceDm(audioData,durMs,waveform){
  if(!db||!uname||!activeDmId||!activeDmPuid||!audioData) return;
  const pname=activeDmPname||'?';
  const p={uid,uname,text:'',type:'voice',audio:audioData,duration:durMs,waveform:Array.isArray(waveform)?waveform.slice(0,64):undefined,ts:Date.now()};
  db.ref('bq_dms/'+activeDmId+'/messages').push(p);
  const sorted=[uid,activeDmPuid].sort();
  db.ref('bq_dms/'+activeDmId+'/meta').update({
    p1:sorted[0],p2:sorted[1],
    n1:sorted[0]===uid?uname:pname,
    n2:sorted[0]===uid?pname:uname,
    lastMsg:'🎤 Voice note', lastTs:Date.now(),
  });
  db.ref('bq_dms/'+activeDmId+'/meta/unread/'+activeDmPuid).transaction(n=>(n||0)+1);
}

/* Voice bubble renderer (called from renderMsg patch) */
function buildVoiceHtml(msg){
  const dur=msg.duration||0;
  const sec=Math.max(1,Math.round(dur/1000));
  const m=Math.floor(sec/60),r=sec%60;
  const time=m+':'+(r<10?'0':'')+r;
  const heights=normalizeVoiceWave(Array.isArray(msg.waveform)?msg.waveform:[], 48);
  const bars=heights.map(h=>{
    const px=Math.max(6,Math.round(6+(h/100)*18));
    return '<span class="bq-voice-bar" style="height:'+px+'px"></span>';
  }).join('');
  return '<div class="bq-voice-msg" data-audio="'+esc(msg.audio||'')+'" data-dur="'+dur+'">'+
    '<button class="bq-voice-play" title="Play"><svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg></button>'+
    '<div class="bq-voice-bars">'+bars+'</div>'+
    '<span class="bq-voice-time">'+time+'</span></div>';
}

/* Voice play handler delegation */
// v9.3: Dismiss tap-opened message menus when clicking elsewhere
document.addEventListener('click',function(e){
  if(e.target.closest('#bq-msg-sheet')) return;
  if(!e.target.closest('.bqr.bq-tapped')){
    document.querySelectorAll('.bqr.bq-tapped').forEach(r=>r.classList.remove('bq-tapped'));
    closeMsgActionSheet();
  }
}, true);

document.addEventListener('click',function(e){
  const btn=e.target.closest('.bq-voice-play');
  if(!btn) return;
  e.stopPropagation();
  const wrap=btn.closest('.bq-voice-msg');
  if(!wrap) return;
  let audio=wrap._audio;
  if(!audio){
    audio=new Audio(wrap.dataset.audio);
    wrap._audio=audio;
    audio.addEventListener('timeupdate',()=>{
      const bars=wrap.querySelectorAll('.bq-voice-bar');
      const pct=Math.max(0, Math.min(1, audio.currentTime/(audio.duration||1)));
      const cnt=Math.round(bars.length*pct);
      bars.forEach((b,i)=>{
        b.classList.toggle('played',i<cnt);
        b.style.opacity = i<cnt ? '1' : '.42';
      });
      wrap.style.setProperty('--bq-voice-progress', String(pct));
    });
    audio.addEventListener('ended',()=>{
      btn.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      wrap.querySelectorAll('.bq-voice-bar').forEach(b=>{b.classList.remove('played');b.style.opacity='';});
      wrap.style.setProperty('--bq-voice-progress', '0');
    });
  }
  if(audio.paused){
    document.querySelectorAll('.bq-voice-msg').forEach(other=>{
      if(other!==wrap && other._audio && !other._audio.paused){
        other._audio.pause();
        other.querySelectorAll('.bq-voice-bar').forEach(b=>{b.classList.remove('played');b.style.opacity='';});
        other.style.setProperty('--bq-voice-progress','0');
        const otherBtn=other.querySelector('.bq-voice-play');
        if(otherBtn) otherBtn.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      }
    });
    audio.play();
    btn.innerHTML='<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  } else {
    audio.pause();
    btn.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
  }
});

/* ── PATCH renderMsg to emit voice bubble: monkeypatch via the fact that
   _gifHtml etc. already concat. We hook via a MutationObserver-free approach:
   intercept by overriding the renderMsg-built bubble after the fact is awkward.
   Instead, we re-define a small helper used downstream: when a msg.type==='voice'
   is rendered, we patch the bubble's innerHTML. ── */
function _bqUpgradeVoiceBubbles(root){
  root=root||document;
  root.querySelectorAll('.bqr').forEach(row=>{
    if(row.dataset.voiceUpgraded) return;
    const bbl=row.querySelector('.bqbbl');
    if(!bbl) return;
    // Read msg type from a marker we'll inject via a sentinel attribute.
  });
}

/* ── BIND v3 EVENTS ── */
function bindV3(){
  // Lightbox close
  document.getElementById('bq-lb-close')?.addEventListener('click',closeMediaLightbox);
  document.getElementById('bq-media-lightbox')?.addEventListener('click',e=>{
    if(e.target.id==='bq-media-lightbox') closeMediaLightbox();
  });
  // Profile view
  document.getElementById('bq-pv-close')?.addEventListener('click',closeProfileView);
  document.getElementById('bq-pv')?.addEventListener('click',e=>{
    if(e.target.id==='bq-pv') closeProfileView();
  });
  // Floating info card
  document.getElementById('bq-if-close')?.addEventListener('click',closeInfoFloat);
  // Rewire DM 3-dots "Conversation Info" to floating card
  const oldInfo=document.getElementById('bq-dm-menu-info');
  if(oldInfo){
    const fresh=oldInfo.cloneNode(true);
    oldInfo.parentNode.replaceChild(fresh,oldInfo);
    fresh.addEventListener('click',()=>{
      document.getElementById('bq-dm-menu')?.classList.remove('open');
      openInfoFloat();
    });
  }
  // Click outside closes floating info
  document.addEventListener('click',e=>{
    const card=document.getElementById('bq-info-float');
    if(!card||!card.classList.contains('open')) return;
    if(card.contains(e.target)) return;
    if(e.target.closest('#bq-dm-menu-btn')) return;
    if(e.target.closest('#bq-dm-menu-info')) return;
    closeInfoFloat();
  });
  // Theme picker
  document.querySelectorAll('#bq-if-themes .bq-if-th').forEach(t=>{
    t.addEventListener('click',()=>{
      if(!activeDmId) return;
      const tname=t.dataset.t;
      setDmTheme(activeDmId,tname);
      document.querySelectorAll('#bq-if-themes .bq-if-th').forEach(x=>x.classList.toggle('sel',x===t));
    });
  });
  // Bubble style
  document.querySelectorAll('#bq-if-bubble .bq-if-bubble-opt').forEach(o=>{
    o.addEventListener('click',()=>{
      setBubStyle(o.dataset.b);
      document.querySelectorAll('#bq-if-bubble .bq-if-bubble-opt').forEach(x=>x.classList.toggle('sel',x===o));
    });
  });
  // Font size
  document.querySelectorAll('#bq-if-fonts .bq-if-font').forEach(f=>{
    f.addEventListener('click',()=>{
      myProfile.fontSize=f.dataset.s;
      localStorage.setItem(LS_PROF,JSON.stringify(myProfile));
      refreshMeAvatar();
      document.querySelectorAll('#bq-if-fonts .bq-if-font').forEach(x=>x.classList.toggle('sel',x===f));
    });
  });
  // Pin / search / export / read receipts / clear / block
  document.getElementById('bq-if-pin')?.addEventListener('click',()=>{
    if(!activeDmId) return;
    togglePin(activeDmId);
    const pins=getPins();
    document.getElementById('bq-if-pin-v').textContent=pins.includes(activeDmId)?'On':'Off';
  });
  document.getElementById('bq-if-search')?.addEventListener('click',searchInConversation);
  document.getElementById('bq-if-export')?.addEventListener('click',exportConversation);
  document.getElementById('bq-if-readrec')?.addEventListener('click',toggleRR);
  document.getElementById('bq-if-clear')?.addEventListener('click',()=>{
    if(!activeDmId) return;
    if(!confirm('Clear this entire conversation?')) return;
    db?.ref('bq_dms/'+activeDmId+'/messages').remove();
    document.getElementById('bqdmmsgs').innerHTML='';
    closeInfoFloat();toast('Conversation cleared');
  });
  document.getElementById('bq-if-block')?.addEventListener('click',blockUser);

  // v9.3: Old voice-button binding REMOVED — caused immediate-send bug.
  // The new tap-to-record + preview UI is bound in bindVoiceUi() (called near boot end).
  // Old startVoice/stopVoice/cancelVoice helpers remain only for backward compatibility.


  // Apply persisted bubble style + read receipts at boot
  setBubStyle(getBubStyle());

  // Avatar uploads in profile editor
  document.getElementById('bqpf-avatar-file')?.addEventListener('change',e=>{
    const f=e.target.files?.[0];if(f) uploadAvatar(f);
  });
  document.getElementById('bqpf-banner-file')?.addEventListener('change',e=>{
    const f=e.target.files?.[0];if(f) uploadBanner(f);
  });

  // Hook avatar clicks to open Profile View modal (Profiles V2)
  document.getElementById('bqp')?.addEventListener('click',e=>{
    const av=e.target.closest('.bqav,.bquav,.bqdmav,.bqdmhav');
    if(!av) return;
    const tuid=av.dataset.uid;
    const tname=av.dataset.uname;
    if(!tuid||!tname) return;
    e.stopPropagation();
    openProfileView(tuid,tname);
  });
}

/* ── Patch renderMsg via mutation observer to upgrade voice messages ── */
(function(){
  const obs=new MutationObserver(muts=>{
    muts.forEach(mu=>{
      mu.addedNodes.forEach(n=>{
        if(n.nodeType!==1) return;
        // Look for newly added .bqr rows; check stored msg via dataset
        const rows = n.classList?.contains('bqr') ? [n] : (n.querySelectorAll?n.querySelectorAll('.bqr'):[]);
        rows.forEach(row=>{
          if(row.dataset.voiceChecked) return;
          row.dataset.voiceChecked='1';
          // Find audio data via __msg backref (set below) — fallback: parse innerHTML hint
        });
      });
    });
  });
  // start observing message containers when they appear
  const startObs=()=>{
    ['bqgmsgs','bqdmmsgs'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) obs.observe(el,{childList:true});
    });
  };
  document.addEventListener('DOMContentLoaded',startObs);
  setTimeout(startObs,400);
})();

/* ── Override renderMsg to support voice + Profiles V2 banner data on avatar
   Since rewriting renderMsg in full is risky, we patch by monkey-overriding
   bubble HTML for voice messages right before append. We hook by intercepting
   db push child_added emits via our own subscribe wrappers — but simpler:
   override the global renderMsg only if msg.type==='voice'. ── */
const _bq_origRenderMsg = window.renderMsg || null;
// Note: renderMsg is in IIFE scope; we can't patch from outside. Instead we
// expose a small helper used at the bottom of renderMsg via a custom event.

/* Bind v3 after init has run */
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(bindV3,200));
else setTimeout(bindV3,200);

/* ── Profile editor: inject upload UI lazily ── */
function _injectProfileUploads(){
  const view=document.getElementById('bqv-profile');
  if(!view||view.querySelector('#bqpf-avatar-file')) return;
  // Find a good anchor — banner section or top of profile body
  const anchor=view.querySelector('.bqpf-scroll') || view;
  const wrap=document.createElement('div');
  wrap.className='bqpf-upload-row';
  wrap.style.padding='0 16px';
  wrap.innerHTML=
    '<label class="bqpf-upload" style="cursor:pointer">'+
      '<div class="bqpf-upload-preview" id="bqpf-avatar-preview" style="background:'+(myProfile.avatar?'url('+myProfile.avatar+') center/cover':'var(--bq-bg-hover)')+'"></div>'+
      'Upload Avatar'+
      '<input type="file" id="bqpf-avatar-file" accept="image/*" style="display:none">'+
    '</label>'+
    '<label class="bqpf-upload" style="cursor:pointer">'+
      '<div class="bqpf-upload-preview" id="bqpf-banner-upload-preview" style="background:'+(myProfile.banner?'url('+myProfile.banner+') center/cover':'var(--bq-bg-hover)')+'"></div>'+
      'Upload Banner'+
      '<input type="file" id="bqpf-banner-file" accept="image/*" style="display:none">'+
    '</label>';
  anchor.insertBefore(wrap,anchor.firstChild);
  // bind right away
  wrap.querySelector('#bqpf-avatar-file').addEventListener('change',e=>{
    const f=e.target.files?.[0];if(f) uploadAvatar(f);
  });
  wrap.querySelector('#bqpf-banner-file').addEventListener('change',e=>{
    const f=e.target.files?.[0];if(f) uploadBanner(f);
  });
}
// Try injecting after init
setTimeout(_injectProfileUploads,500);
setTimeout(_injectProfileUploads,1500);


/* ═══════════════════════════════════════════════════════════
   v4 PATCH — Settings panel redesign, Profile V3,
   voice-note preview, new themes (both-bubble), new
   reactions + stickers, fixed avatar/banner uploads.
═══════════════════════════════════════════════════════════ */
(function v4Patch(){

  const _v4css = `
  #bqv-dmconv{position:relative;overflow:hidden;}
  #bq-info-float{
    position:absolute!important;
    top:72px!important;
    right:12px!important;
    left:auto!important;
    bottom:12px!important;
    width:min(340px, calc(100% - 24px))!important;
    max-width:min(340px, calc(100% - 24px))!important;
    max-height:none!important;
    border-radius:18px!important;
    z-index:500!important;
  }
  #bqp.bq-fs #bq-info-float{
    top:84px!important;
    right:16px!important;
    bottom:16px!important;
    width:min(360px, calc(100% - 32px))!important;
    max-width:min(360px, calc(100% - 32px))!important;
  }
  @media (max-width: 680px){
    #bq-info-float{
      top:68px!important;
      right:8px!important;
      left:8px!important;
      bottom:8px!important;
      width:auto!important;
      max-width:none!important;
    }
  }

  .bqvoice-rec-bar{position:relative;z-index:4;}
  /* v9.1: Voice preview bar — Send / Discard / Play / Replay controls */
  .bq-voice-preview{
    position:relative;z-index:4;display:flex;align-items:center;gap:8px;
    padding:8px 10px;margin:6px 8px 0;border-radius:14px;
    background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(15,23,42,.78));
    border:1px solid var(--bq-border,rgba(255,255,255,.08));
    box-shadow:0 6px 18px rgba(0,0,0,.32);
    animation:bqVpIn .18s ease-out;
  }
  @keyframes bqVpIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
  .bq-voice-preview .bq-vp-play,
  .bq-voice-preview .bq-vp-replay{
    flex-shrink:0;width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;
    display:inline-flex;align-items:center;justify-content:center;
    background:var(--bq-accent,#3b82f6);color:#fff;transition:transform .12s ease,background .12s ease;
  }
  .bq-voice-preview .bq-vp-replay{background:rgba(255,255,255,.12);color:#fff;width:28px;height:28px;}
  .bq-voice-preview .bq-vp-play:hover,
  .bq-voice-preview .bq-vp-replay:hover{transform:scale(1.08);}
  .bq-voice-preview .bq-vp-play svg,
  .bq-voice-preview .bq-vp-replay svg{width:14px;height:14px;fill:currentColor;}
  .bq-voice-preview .bq-vp-replay svg{fill:none;stroke:currentColor;}
  .bq-voice-preview .bq-vp-wave{flex:1;min-width:60px;height:28px;}
  .bq-voice-preview .bq-vp-time{
    font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#cbd5e1;
    flex-shrink:0;min-width:34px;text-align:center;
  }
  .bq-voice-preview .bq-vp-btn{
    flex-shrink:0;width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;
    display:inline-flex;align-items:center;justify-content:center;
    transition:transform .12s ease,filter .12s ease;
  }
  .bq-voice-preview .bq-vp-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
  /* v9.3: preview is hidden until .show is added (prevents stale empty bar) */
  .bq-voice-preview{display:none;}
  .bq-voice-preview.show{display:flex;}
  .bq-voice-preview .bq-vp-btn.discard{background:rgba(220,38,38,.18);color:#fca5a5;}
  .bq-voice-preview .bq-vp-btn.discard:hover{background:rgba(220,38,38,.32);color:#fff;transform:scale(1.06);}
  .bq-voice-preview .bq-vp-btn.send{background:#22c55e;color:#fff;}
  .bq-voice-preview .bq-vp-btn.send svg{fill:#fff;stroke:none;}
  .bq-voice-preview .bq-vp-btn.send:hover{filter:brightness(1.1);transform:scale(1.06);}

  #bqv-profile .bqpf-scroll{padding:0!important;overflow:auto;}
  .bqp4{
    min-height:100%;
    display:flex;
    flex-direction:column;
    background:
      radial-gradient(circle at top right, rgba(96,165,250,.14), transparent 32%),
      linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0)),
      var(--bq-bg);
  }
  .bqp4-hero{
    position:sticky;
    top:0;
    z-index:4;
    padding:0 0 14px;
    background:linear-gradient(180deg, rgba(10,10,10,.98) 0%, rgba(10,10,10,.92) 74%, rgba(10,10,10,0) 100%);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
  }
  .bqp4-banner{
    position:relative;
    height:148px;
    border-bottom:1px solid rgba(255,255,255,.07);
    background-size:cover;
    background-position:center;
    overflow:hidden;
  }
  .bqp4-banner::after{
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.42));
  }
  .bqp4-banner-btn,
  .bqp4-avatar-edit{
    position:absolute;
    z-index:2;
    display:inline-flex;
    align-items:center;
    gap:6px;
    border:none;
    cursor:pointer;
    color:#fff;
    background:rgba(10,10,10,.55);
    border:1px solid rgba(255,255,255,.14);
    box-shadow:0 10px 30px rgba(0,0,0,.28);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    transition:transform .18s var(--bq-transition), background .18s;
  }
  .bqp4-banner-btn:hover,
  .bqp4-avatar-edit:hover{transform:translateY(-1px);background:rgba(10,10,10,.72);}
  .bqp4-banner-btn{
    right:14px;
    bottom:14px;
    padding:8px 12px;
    border-radius:999px;
    font-family:'Inter',sans-serif;
    font-size:11px;
    font-weight:700;
    letter-spacing:.04em;
    text-transform:uppercase;
  }
  .bqp4-banner-btn svg,
  .bqp4-avatar-edit svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
  .bqp4-head{
    display:flex;
    align-items:flex-end;
    gap:14px;
    padding:0 18px;
    margin-top:-34px;
    position:relative;
    z-index:2;
  }
  .bqp4-avatar{
    position:relative;
    width:92px;
    height:92px;
    flex-shrink:0;
    border-radius:28px;
    border:4px solid var(--bq-bg);
    box-shadow:0 18px 50px rgba(0,0,0,.35);
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:'Inter',sans-serif;
    font-size:30px;
    font-weight:900;
    color:#000;
    background-size:cover;
    background-position:center;
    overflow:hidden;
  }
  .bqp4-avatar-edit{
    right:-4px;
    bottom:-4px;
    width:34px;
    height:34px;
    justify-content:center;
    border-radius:50%;
    padding:0;
  }
  .bqp4-id{min-width:0;flex:1;padding-bottom:6px;}
  .bqp4-display{
    font-family:'Inter',sans-serif;
    font-size:22px;
    font-weight:800;
    color:var(--bq-text);
    line-height:1.05;
    word-break:break-word;
  }
  .bqp4-userline{
    display:flex;
    align-items:center;
    flex-wrap:wrap;
    gap:8px;
    margin-top:8px;
    font-family:'Inter',sans-serif;
    font-size:12px;
    color:var(--bq-text-muted);
  }
  .bqp4-userline button{
    border:none;
    background:none;
    padding:0;
    cursor:pointer;
    color:var(--bq-accent);
    font:inherit;
    font-weight:700;
  }
  .bqp4-chip{
    margin:14px 18px 0;
    display:flex;
    align-items:center;
    gap:12px;
    padding:12px 14px;
    border-radius:18px;
    border:1px solid rgba(255,255,255,.08);
    background:rgba(255,255,255,.04);
    box-shadow:0 14px 40px rgba(0,0,0,.18);
  }
  .bqp4-chip-avatar{
    width:44px;height:44px;border-radius:14px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-family:'Inter',sans-serif;font-size:16px;font-weight:800;color:#000;
    background-size:cover;background-position:center;
  }
  .bqp4-chip-main{min-width:0;flex:1;}
  .bqp4-chip-name{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:var(--bq-text);}
  .bqp4-chip-sub{font-family:'Inter',sans-serif;font-size:11px;color:var(--bq-text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .bqp4-dirty{
    flex-shrink:0;
    padding:6px 9px;
    border-radius:999px;
    background:rgba(251,191,36,.16);
    color:#fde68a;
    font-family:'Inter',sans-serif;
    font-size:10px;
    font-weight:800;
    letter-spacing:.08em;
    text-transform:uppercase;
    opacity:0;
    transform:translateY(4px);
    transition:opacity .18s, transform .18s;
  }
  .bqp4-dirty.show{opacity:1;transform:translateY(0);}
  .bqp4-tabs{
    margin:14px 18px 0;
    display:flex;
    gap:8px;
    overflow:auto;
    padding-bottom:2px;
    scrollbar-width:none;
  }
  .bqp4-tabs::-webkit-scrollbar{display:none;}
  .bqp4-tab{
    flex:0 0 auto;
    border:none;
    cursor:pointer;
    padding:10px 14px;
    border-radius:999px;
    background:rgba(255,255,255,.04);
    color:var(--bq-text-muted);
    border:1px solid rgba(255,255,255,.08);
    font-family:'Inter',sans-serif;
    font-size:11px;
    font-weight:800;
    letter-spacing:.08em;
    text-transform:uppercase;
    transition:all .18s var(--bq-transition);
  }
  .bqp4-tab.active{background:rgba(96,165,250,.18);border-color:rgba(96,165,250,.55);color:#fff;box-shadow:0 10px 24px rgba(96,165,250,.18);}
  .bqp4-panels{display:flex;flex-direction:column;gap:16px;padding:18px 18px 24px;}
  .bqp4-panel{display:none;gap:14px;}
  .bqp4-panel.active{display:flex;flex-direction:column;}
  .bqp4-card{
    border:1px solid rgba(255,255,255,.07);
    border-radius:22px;
    background:rgba(255,255,255,.03);
    box-shadow:0 14px 42px rgba(0,0,0,.15);
    overflow:hidden;
  }
  .bqp4-card-head{padding:16px 16px 0;}
  .bqp4-card-title{font-family:'Inter',sans-serif;font-size:14px;font-weight:800;color:var(--bq-text);}
  .bqp4-card-sub{font-family:'Inter',sans-serif;font-size:11px;line-height:1.5;color:var(--bq-text-muted);margin-top:4px;}
  .bqp4-fields{padding:16px;display:grid;gap:12px;}
  .bqp4-field{display:grid;gap:6px;}
  .bqp4-field.two{grid-template-columns:1fr 1fr;gap:12px;}
  .bqp4-label{font-family:'Inter',sans-serif;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--bq-text-muted);}
  .bqp4-input,
  .bqp4-textarea,
  .bqp4-select{
    width:100%;
    box-sizing:border-box;
    padding:12px 13px;
    border-radius:14px;
    border:1px solid rgba(255,255,255,.09);
    background:rgba(255,255,255,.04);
    color:var(--bq-text);
    font-family:'Inter',sans-serif;
    font-size:13px;
    outline:none;
    transition:border-color .18s, box-shadow .18s, background .18s;
  }
  .bqp4-input:focus,
  .bqp4-textarea:focus,
  .bqp4-select:focus{border-color:rgba(96,165,250,.62);box-shadow:0 0 0 3px rgba(96,165,250,.14);background:rgba(255,255,255,.06);}
  .bqp4-textarea{min-height:96px;resize:vertical;}
  .bqp4-helper{font-family:'Inter',sans-serif;font-size:11px;line-height:1.45;color:var(--bq-text-muted);}
  .bqp4-counter{font-family:'Inter',sans-serif;font-size:10px;color:var(--bq-text-subtle);text-align:right;}
  .bqp4-color-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;}
  .bqp4-color{
    width:100%;aspect-ratio:1;border-radius:16px;border:2px solid transparent;cursor:pointer;
    transition:transform .16s var(--bq-transition), border-color .16s, box-shadow .16s;
  }
  .bqp4-color:hover{transform:translateY(-1px) scale(1.03);}
  .bqp4-color.active{border-color:#fff;box-shadow:0 0 0 3px rgba(96,165,250,.25);}
  .bqp4-statuses{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
  .bqp4-status{
    border:1px solid rgba(255,255,255,.08);
    background:rgba(255,255,255,.03);
    border-radius:16px;
    padding:12px;
    cursor:pointer;
    display:flex;
    align-items:center;
    gap:10px;
    color:var(--bq-text-muted);
    transition:all .18s var(--bq-transition);
  }
  .bqp4-status.active{border-color:rgba(96,165,250,.5);background:rgba(96,165,250,.14);color:#fff;box-shadow:0 12px 28px rgba(96,165,250,.12);}
  .bqp4-status-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  .bqp4-status-copy{display:grid;gap:3px;min-width:0;}
  .bqp4-status-name{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;}
  .bqp4-status-desc{font-family:'Inter',sans-serif;font-size:11px;color:inherit;opacity:.72;}
  .bqp4-toggle-row,
  .bqp4-list-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:13px 0;
    border-bottom:1px solid rgba(255,255,255,.06);
  }
  .bqp4-toggle-row:last-child,
  .bqp4-list-row:last-child{border-bottom:none;padding-bottom:0;}
  .bqp4-toggle-copy{min-width:0;}
  .bqp4-toggle-title{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:var(--bq-text);}
  .bqp4-toggle-sub{font-family:'Inter',sans-serif;font-size:11px;line-height:1.45;color:var(--bq-text-muted);margin-top:3px;}
  .bqp4-switch{position:relative;width:46px;height:28px;flex-shrink:0;}
  .bqp4-switch input{opacity:0;width:0;height:0;position:absolute;}
  .bqp4-slider{position:absolute;inset:0;border-radius:999px;background:rgba(255,255,255,.12);cursor:pointer;transition:background .18s;}
  .bqp4-slider::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .18s var(--bq-transition);box-shadow:0 4px 12px rgba(0,0,0,.22);}
  .bqp4-switch input:checked + .bqp4-slider{background:var(--bq-accent);}
  .bqp4-switch input:checked + .bqp4-slider::after{transform:translateX(18px);}
  .bqp4-list{display:grid;gap:10px;}
  .bqp4-pill{
    display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;
    background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
    font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:var(--bq-text);
  }
  .bqp4-pill button{border:none;background:none;color:var(--bq-text-muted);cursor:pointer;font:inherit;padding:0;}
  .bqp4-savebar{
    position:sticky;
    bottom:0;
    z-index:3;
    margin-top:auto;
    padding:14px 18px 18px;
    display:flex;
    align-items:center;
    gap:12px;
    background:linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,.96) 34%, rgba(10,10,10,1) 100%);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
  }
  .bqp4-savecopy{min-width:0;flex:1;}
  .bqp4-savehint{font-family:'Inter',sans-serif;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--bq-text-muted);}
  .bqp4-saveinfo{font-family:'Inter',sans-serif;font-size:12px;color:var(--bq-text-muted);margin-top:4px;}
  .bqp4-savebtn{
    border:none;
    cursor:pointer;
    padding:13px 18px;
    border-radius:16px;
    background:linear-gradient(135deg,#60a5fa,#6366f1);
    color:#fff;
    font-family:'Inter',sans-serif;
    font-size:13px;
    font-weight:800;
    letter-spacing:.06em;
    text-transform:uppercase;
    box-shadow:0 14px 34px rgba(96,165,250,.26);
    transition:transform .18s var(--bq-transition), box-shadow .18s;
  }
  .bqp4-savebtn:hover{transform:translateY(-1px);box-shadow:0 18px 40px rgba(96,165,250,.34);}
  .bqp4-saved{font-family:'Inter',sans-serif;font-size:12px;color:#86efac;opacity:0;transition:opacity .18s;}
  .bqp4-saved.show{opacity:1;}
  @media (max-width: 480px){
    .bqp4-head{padding:0 14px;}
    .bqp4-chip,.bqp4-tabs,.bqp4-panels,.bqp4-savebar{margin-left:14px;margin-right:14px;padding-left:0;padding-right:0;}
    .bqp4-chip{padding:12px;}
    .bqp4-panels{padding-top:16px;}
    .bqp4-savebar{padding:14px 0 18px;flex-direction:column;align-items:stretch;}
    .bqp4-savebtn{width:100%;}
    .bqp4-field.two,.bqp4-statuses{grid-template-columns:1fr;}
    .bqp4-color-grid{grid-template-columns:repeat(4,minmax(0,1fr));}
  }
  `;
  const styleEl=document.createElement('style');
  styleEl.textContent=_v4css;
  document.head.appendChild(styleEl);

  const PROFILE_TABS=[
    {id:'identity',label:'Identity'},
    {id:'appearance',label:'Appearance'},
    {id:'status',label:'Status'},
    {id:'privacy',label:'Privacy'}
  ];
  const PROFILE_STATUS_OPTIONS=[
    {id:'online',label:'Online',desc:'Ready to chat',color:'#34d399'},
    {id:'away',label:'Away',desc:'Stepping out',color:'#fbbf24'},
    {id:'busy',label:'Busy',desc:'Heads down',color:'#f87171'},
    {id:'invisible',label:'Invisible',desc:'Browse quietly',color:'#94a3b8'}
  ];
  const DM_PERMISSION_OPTIONS=['Everyone','Friends only','No one'];
  const ONLINE_VISIBILITY_OPTIONS=['Everyone','Followers','Nobody'];
  const BRAINTROT_DENY=/brainrot|skibidi|sigma|rizz|gyatt|mewing|looksmax|edging|fanum|kai cenat|ohio|grimace|garten|chungus/i;
  const CURATED_GIPHY_QUERIES=['wholesome reactions','cute animals','anime smile','funny','celebrate','thumbs up'];
  let voicePreviewAudio=null;
  let voicePreviewData=null;
  let voicePreviewDuration=0;
  let voicePreviewWave=null;
  let voiceController=null;
  let profileDraft=null;
  let profileDirty=false;
  let profileViewBuilt=false;

  function getProfileDraft(){
    if(profileDraft) return profileDraft;
    const blocked=JSON.parse(localStorage.getItem('bq_blocked')||'[]');
    profileDraft={
      username: uname||'',
      displayName: myProfile.displayName || uname || '',
      pronouns: myProfile.pronouns || '',
      bio: myProfile.bio || '',
      initials: myProfile.initials || '',
      avatar: myProfile.avatar || '',
      banner: myProfile.banner || '',
      color: myProfile.color || uColor(uname||'u'),
      bannerColor: myProfile.bannerColor || myProfile.color || uColor(uname||'u'),
      nameColor: myProfile.nameColor || myProfile.color || uColor(uname||'u'),
      status: (myProfile.status==='offline'?'invisible':(myProfile.status||'online')),
      customStatus: myProfile.customStatus || '',
      activity: myProfile.activity || '',
      dmPermission: myProfile.dmPermission || 'Everyone',
      readReceipts: myProfile.readReceipts !== undefined ? !!myProfile.readReceipts : getRR(),
      onlineVisibility: myProfile.onlineVisibility || 'Everyone',
      blocked: blocked.slice(),
    };
    return profileDraft;
  }

  function ensureDmMenuBindings(){
    const root=document.getElementById('bqv-dmconv');
    if(!root || root.dataset.v4MenuBound) return;
    root.dataset.v4MenuBound='1';
    root.addEventListener('click',e=>{
      const btn=e.target.closest('#bq-dm-menu-btn');
      const menu=document.getElementById('bq-dm-menu');
      if(btn){
        e.stopPropagation();
        menu?.classList.toggle('open');
        return;
      }
      const info=e.target.closest('#bq-dm-menu-info');
      if(info){
        e.stopPropagation();
        menu?.classList.remove('open');
        openInfoFloat();
        return;
      }
      const starred=e.target.closest('#bq-dm-menu-starred');
      if(starred){
        e.stopPropagation();
        menu?.classList.remove('open');
        openStarredPanel();
        return;
      }
      const clear=e.target.closest('#bq-dm-menu-clear');
      if(clear){
        e.stopPropagation();
        menu?.classList.remove('open');
        if(activeDmId&&db){ db.ref('bq_dms/'+activeDmId+'/messages').remove(); toast('Conversation cleared'); }
        return;
      }
      if(!e.target.closest('#bq-dm-menu')) menu?.classList.remove('open');
    });
  }

  function syncSettingsSelections(){
    const curTheme=(typeof getDmTheme==='function'&&activeDmId?getDmTheme(activeDmId):'none')||'none';
    document.querySelectorAll('#bq-if-themes .bq-if-th').forEach(t=>t.classList.toggle('sel',t.dataset.t===curTheme));
    const bs=(typeof getBubStyle==='function'?getBubStyle():'rounded');
    document.querySelectorAll('#bq-if-bubble .bq-if-bubble-opt').forEach(o=>o.classList.toggle('sel',o.dataset.b===bs));
    const fs=(myProfile.fontSize)||'md';
    document.querySelectorAll('#bq-if-fonts .bq-if-font').forEach(f=>f.classList.toggle('sel',f.dataset.s===fs));
    const pins=(typeof getPins==='function'?getPins():[]);
    const pinV=document.getElementById('bq-if-pin-v');
    if(pinV) pinV.textContent=(activeDmId&&pins.includes(activeDmId))?'On':'Off';
    const rrV=document.getElementById('bq-if-rr-v');
    if(rrV) rrV.textContent=(typeof getRR==='function'&&getRR())?'On':'Off';
  }

  function bindSettingsCard(){
    const card=document.getElementById('bq-info-float');
    if(!card || card.dataset.v4Bound) return;
    card.dataset.v4Bound='1';
    card.addEventListener('click',e=>{
      const closeBtn=e.target.closest('#bq-if-close');
      if(closeBtn){ e.stopPropagation(); closeInfoFloat(); return; }
      const theme=e.target.closest('#bq-if-themes .bq-if-th');
      if(theme){ e.stopPropagation(); if(activeDmId&&typeof setDmTheme==='function') setDmTheme(activeDmId,theme.dataset.t); syncSettingsSelections(); return; }
      const bubble=e.target.closest('#bq-if-bubble .bq-if-bubble-opt');
      if(bubble){ e.stopPropagation(); if(typeof setBubStyle==='function') setBubStyle(bubble.dataset.b); syncSettingsSelections(); return; }
      const font=e.target.closest('#bq-if-fonts .bq-if-font');
      if(font){ e.stopPropagation(); myProfile.fontSize=font.dataset.s; try{localStorage.setItem(LS_PROF,JSON.stringify(myProfile));}catch(_){} refreshMeAvatar?.(); syncSettingsSelections(); return; }
      const pin=e.target.closest('#bq-if-pin');
      if(pin){ e.stopPropagation(); if(activeDmId&&typeof togglePin==='function') togglePin(activeDmId); syncSettingsSelections(); return; }
      const search=e.target.closest('#bq-if-search');
      if(search){ e.stopPropagation(); searchInConversation?.(); return; }
      const exportBtn=e.target.closest('#bq-if-export');
      if(exportBtn){ e.stopPropagation(); exportConversation?.(); return; }
      const rr=e.target.closest('#bq-if-readrec');
      if(rr){ e.stopPropagation(); toggleRR?.(); syncSettingsSelections(); return; }
      const clear=e.target.closest('#bq-if-clear');
      if(clear){ e.stopPropagation(); if(activeDmId&&confirm('Clear this entire conversation?')){ db?.ref('bq_dms/'+activeDmId+'/messages').remove(); document.getElementById('bqdmmsgs').innerHTML=''; toast('Conversation cleared'); closeInfoFloat(); } return; }
      const block=e.target.closest('#bq-if-block');
      if(block){ e.stopPropagation(); blockUser?.(); return; }
    });
  }

  openInfoFloat=function(){
    const card=document.getElementById('bq-info-float');
    const host=document.getElementById('bqv-dmconv');
    if(!card||!host||!activeDmPuid) return;
    const menu=document.getElementById('bq-dm-menu');
    menu?.classList.remove('open');
    const pdata=onlineU[activeDmPuid]||{};
    const name=getAlias(activeDmPuid)||('@'+activeDmPname);
    const col=getColor(activeDmPuid,activeDmPname||'');
    const av=document.getElementById('bq-if-av');
    if(av){
      av.style.background=col;
      av.style.color='#000';
      av.style.backgroundImage='';
      av.textContent=uInit(activeDmPname||'?');
    }
    const nm=document.getElementById('bq-if-name');
    if(nm) nm.textContent=name;
    const st=document.getElementById('bq-if-st');
    if(st){
      const si=statusInfo(pdata.status||'online');
      st.textContent=onlineU[activeDmPuid]?si.label:(pdata.ts?'Last seen '+lastSeenStr(pdata.ts):'Offline');
    }
    if(card.parentNode!==host) host.appendChild(card);
    syncSettingsSelections();
    card.classList.add('open');
  };

  closeInfoFloat=function(){
    document.getElementById('bq-info-float')?.classList.remove('open');
  };

  function cleanupVoiceController(){
    if(voiceController?.raf) cancelAnimationFrame(voiceController.raf);
    if(voiceController?.timer) clearInterval(voiceController.timer);
    if(voiceController?.stream){
      try{voiceController.stream.getTracks().forEach(t=>t.stop());}catch(_){ }
    }
    if(voiceController?.audioUrl){
      try{URL.revokeObjectURL(voiceController.audioUrl);}catch(_){ }
    }
    voiceController=null;
  }

  function drawRecordingWave(){
    if(!voiceController?.analyser || !voiceController?.canvas) return;
    const { analyser, canvas, dataArray } = voiceController;
    const ctx=canvas.getContext('2d');
    // Only resize the backing store when the CSS size actually changes
    // (resizing every frame causes layout thrash and pushes siblings offscreen).
    const cw=canvas.clientWidth, ch=canvas.clientHeight;
    if(cw>0 && ch>0){
      const tw=Math.floor(cw*devicePixelRatio), th=Math.floor(ch*devicePixelRatio);
      if(canvas.width!==tw) canvas.width=tw;
      if(canvas.height!==th) canvas.height=th;
    }
    const width=canvas.width, height=canvas.height;
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0,0,width,height);
    ctx.lineWidth=2*devicePixelRatio;
    ctx.strokeStyle='rgba(96,165,250,.95)';
    ctx.beginPath();
    const slice=width/(dataArray.length-1||1);
    for(let i=0;i<dataArray.length;i++){
      const v=dataArray[i]/128.0;
      const y=v*height/2;
      const x=i*slice;
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
    voiceController.raf=requestAnimationFrame(drawRecordingWave);
  }

  function ensureVoicePreview(){
    if(document.getElementById('bq-voice-preview')) return;
    // v9.3: Always inject inside the DM composer (.bqiw), never at body root.
    const composer=document.getElementById('bqdminp')?.closest('.bqiw');
    if(!composer) return;
    const wrap=document.createElement('div');
    wrap.className='bq-voice-preview show';
    wrap.id='bq-voice-preview';
    wrap.innerHTML=''+
      '<button class="bq-vp-play" id="bq-vp-play" title="Play/Pause"><svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg></button>'+
      '<button class="bq-vp-replay" id="bq-vp-replay" title="Replay"><svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>'+
      '<canvas class="bq-vp-wave" id="bq-vp-wave" style="flex:1;height:28px;width:100%;"></canvas>'+
      '<span class="bq-vp-time" id="bq-vp-time">0:00</span>'+
      '<button class="bq-vp-btn discard" id="bq-vp-discard" title="Discard"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
      '<button class="bq-vp-btn send" id="bq-vp-send" title="Send"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>';
    // Insert at TOP of composer so it sits above the input row but inside it
    composer.insertBefore(wrap, composer.firstChild);
  }

  function drawPreviewWave(samples){
    const canvas=document.getElementById('bq-vp-wave');
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const width=canvas.width=canvas.clientWidth*devicePixelRatio;
    const height=canvas.height=canvas.clientHeight*devicePixelRatio;
    ctx.clearRect(0,0,width,height);
    ctx.lineWidth=2*devicePixelRatio;
    ctx.strokeStyle='rgba(96,165,250,.95)';
    ctx.beginPath();
    const points=samples?.length?samples:[0.5,0.52,0.48,0.55,0.45,0.5];
    points.forEach((value,index)=>{
      const x=(width/(points.length-1||1))*index;
      const y=value*height;
      if(index===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }

  function decodeWaveform(dataUrl){
    return fetch(dataUrl)
      .then(r=>r.arrayBuffer())
      .then(buf=>{
        const Ctx=window.AudioContext||window.webkitAudioContext;
        if(!Ctx) return [];
        const ctx=new Ctx();
        return ctx.decodeAudioData(buf.slice(0)).then(audioBuf=>{
          const ch=audioBuf.getChannelData(0);
          const samples=64;
          const block=Math.max(1,Math.floor(ch.length/samples));
          const out=[];
          for(let i=0;i<samples;i++){
            let sum=0;
            const start=i*block;
            const end=Math.min(ch.length,start+block);
            for(let j=start;j<end;j++) sum+=Math.abs(ch[j]);
            out.push(0.5 + Math.min(0.42,(sum/Math.max(1,end-start))*0.9) * (i%2===0?1:-1));
          }
          ctx.close?.();
          return out.map(v=>Math.max(0.08,Math.min(0.92,v)));
        }).catch(()=>[]);
      })
      .catch(()=>[]);
  }

  function showVoicePreview(dataUrl,durMs,samples){
    ensureVoicePreview();
    const wrap=document.getElementById('bq-voice-preview');
    if(!wrap) return;
    voicePreviewData=dataUrl;
    voicePreviewDuration=durMs;
    if(voicePreviewAudio){ try{ voicePreviewAudio.pause(); }catch(_){ } }
    voicePreviewAudio=new Audio(dataUrl);
    voicePreviewAudio.preload='metadata';
    voicePreviewWave=samples||[];
    drawPreviewWave(voicePreviewWave);
    const sec=Math.max(1,Math.round(durMs/1000));
    const mm=Math.floor(sec/60), ss=sec%60;
    const timeEl=document.getElementById('bq-vp-time');
    if(timeEl) timeEl.textContent=mm+':'+(ss<10?'0':'')+ss;
    wrap.classList.add('show');
    voicePreviewAudio.addEventListener('timeupdate',()=>{
      const progress=(voicePreviewAudio.currentTime/(voicePreviewAudio.duration||sec));
      const animated=voicePreviewWave.length?voicePreviewWave.map((v,i)=>{
        const threshold=i/Math.max(1,voicePreviewWave.length-1);
        return threshold<=progress ? Math.max(0.12, v-0.12) : v;
      }):voicePreviewWave;
      drawPreviewWave(animated);
    });
    voicePreviewAudio.addEventListener('ended',()=>{
      const play=document.getElementById('bq-vp-play');
      if(play) play.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      drawPreviewWave(voicePreviewWave);
    });
  }

  function hideVoicePreview(){
    const wrap=document.getElementById('bq-voice-preview');
    if(wrap) wrap.classList.remove('show');
    if(voicePreviewAudio){ try{voicePreviewAudio.pause();}catch(_){ } }
    voicePreviewAudio=null;
    voicePreviewData=null;
    voicePreviewDuration=0;
    voicePreviewWave=[];
  }

  async function finishRecording(sendImmediately){
    if(!voiceController) return;
    const ctrl=voiceController;
    const blob=ctrl.blob || new Blob(ctrl.chunks,{type:ctrl.mimeType||'audio/webm'});
    cleanupVoiceController();
    document.getElementById('bq-voice-btn')?.classList.remove('recording');
    document.getElementById('bq-voice-rec-bar')?.classList.remove('show');
    const timeEl=document.getElementById('bq-voice-rec-time');
    if(timeEl) timeEl.textContent='0:00';
    if(!blob || blob.size<800){ toast('Recording too short'); return; }
    const reader=new FileReader();
    reader.onload=async()=>{
      const dataUrl=reader.result;
      const dur=Math.min(30000, ctrl.duration || (Date.now()-ctrl.startTime));
      const samples=await decodeWaveform(dataUrl);
      if(sendImmediately){ sendVoiceDm(dataUrl,dur); }
      else { showVoicePreview(dataUrl,dur,samples); }
    };
    reader.readAsDataURL(blob);
  }

  async function startStableRecording(){
    if(!activeDmId||!navigator.mediaDevices){ toast('Voice notes not supported'); return; }
    hideVoicePreview();
    cleanupVoiceController();
    try{
      const stream=await navigator.mediaDevices.getUserMedia({
        audio:{
          channelCount:1,
          echoCancellation:true,
          noiseSuppression:true,
          autoGainControl:true
        }
      });
      let mime='audio/webm;codecs=opus';
      if(!window.MediaRecorder || !MediaRecorder.isTypeSupported(mime)) mime='audio/webm';
      if(window.MediaRecorder && !MediaRecorder.isTypeSupported(mime)) mime='audio/mp4;codecs=mp4a.40.2';
      if(window.MediaRecorder && !MediaRecorder.isTypeSupported(mime)) mime='';
      if(!window.MediaRecorder){ toast('Voice notes not supported'); stream.getTracks().forEach(t=>t.stop()); return; }
      const recorder=mime?new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:64000}):new MediaRecorder(stream,{audioBitsPerSecond:64000});
      const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      const source=audioCtx.createMediaStreamSource(stream);
      const analyser=audioCtx.createAnalyser();
      analyser.fftSize=2048;
      analyser.smoothingTimeConstant=.8;
      source.connect(analyser);
      const dataArray=new Uint8Array(analyser.fftSize);
      const chunks=[];
      const bar=document.getElementById('bq-voice-rec-bar');
      const canvas=bar?.querySelector('canvas');
      voiceController={recorder,stream,audioCtx,source,analyser,dataArray,chunks,startTime:Date.now(),timer:null,raf:null,canvas,blob:null,duration:0,mimeType:recorder.mimeType||mime};
      recorder.ondataavailable=e=>{ if(e.data?.size) chunks.push(e.data); };
      recorder.onstop=()=>{
        voiceController.blob=new Blob(chunks,{type:recorder.mimeType||mime||'audio/webm'});
        voiceController.duration=Date.now()-voiceController.startTime;
        audioCtx.close?.();
        finishRecording(false);
      };
      recorder.start(250);
      document.getElementById('bq-voice-btn')?.classList.add('recording');
      bar?.classList.add('show');
      const timeEl=document.getElementById('bq-voice-rec-time');
      voiceController.timer=setInterval(()=>{
        if(!voiceController) return;
        const elapsed=Date.now()-voiceController.startTime;
        if(timeEl){
          const s=Math.floor(elapsed/1000),m=Math.floor(s/60),r=s%60;
          timeEl.textContent=m+':'+(r<10?'0':'')+r;
        }
        if(elapsed>=30000 && voiceController?.recorder?.state==='recording') voiceController.recorder.stop();
      },200);
      drawRecordingWave();
    }catch(_){
      cleanupVoiceController();
      document.getElementById('bq-voice-btn')?.classList.remove('recording');
      document.getElementById('bq-voice-rec-bar')?.classList.remove('show');
      toast('Microphone permission denied');
    }
  }

  function ensureRecordingCanvas(){
    const bar=document.getElementById('bq-voice-rec-bar');
    if(!bar || bar.querySelector('canvas')) return;
    const time=bar.querySelector('#bq-voice-rec-time');
    const canvas=document.createElement('canvas');
    canvas.className='bq-vn-wave';
    // Sizing handled by CSS (.bq-vn-wave) — flex:1 1 0 + min-width:0 keeps
    // siblings (Cancel button, time) on-screen no matter how wide the bar gets.
    if(time) bar.insertBefore(canvas,time);
    else bar.appendChild(canvas);
  }

  function bindVoiceUi(){
    ensureRecordingCanvas();
    // v9.2: Tap-to-record (no hold). Tap mic → start recording; tap again → stop & show preview.
    // The previous hold-to-record implementation caused jank from continuous mousemove/touchmove
    // listeners and the floating overlay shifting layout. Tap is simpler and lag-free.
    const btn=document.getElementById('bq-voice-btn');
    if(btn && !btn.dataset.v92Bound){
      btn.dataset.v92Bound='1';
      // Replace node to drop any older listeners
      const fresh=btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh,btn);
      // Remove any leftover hold-overlay DOM from older versions
      const iw=fresh.closest('.bqiw') || fresh.parentElement;
      if(iw){
        iw.querySelector('.bq-vn-hold-overlay')?.remove();
        iw.querySelector('.bq-vn-cancel-zone')?.remove();
        iw.querySelector('.bq-vn-lock-hint')?.remove();
      }
      let _starting=false;
      fresh.addEventListener('click', async function(e){
        e.preventDefault(); e.stopPropagation();
        // If already recording → stop and show preview
        if(voiceController?.recorder?.state==='recording'){
          try{
            const ctrl=voiceController;
            ctrl.recorder.onstop=function(){
              ctrl.blob=new Blob(ctrl.chunks,{type:ctrl.mimeType||'audio/webm'});
              ctrl.duration=Date.now()-ctrl.startTime;
              try{ ctrl.audioCtx?.close?.(); }catch(_){}
              finishRecording(false); // sendImmediately=false → show preview UI
              fresh.classList.remove('recording');
            };
            ctrl.recorder.stop();
          }catch(_){
            cleanupVoiceController();
            fresh.classList.remove('recording');
          }
          return;
        }
        // Else start recording
        if(_starting) return;
        _starting=true;
        try{ if(navigator.vibrate) navigator.vibrate(10); }catch(_){}
        try{
          await startStableRecording();
          fresh.classList.add('recording');
          document.getElementById('bq-voice-rec-bar')?.classList.add('show');
        }catch(err){
          toast('Microphone unavailable');
        }finally{
          _starting=false;
        }
      });
      // Keyboard accessibility — Space/Enter toggles record
      fresh.addEventListener('keydown', e=>{
        if((e.code==='Space'||e.code==='Enter') && !e.repeat){
          e.preventDefault();
          fresh.click();
        }
      });
    }
    const cancel=document.getElementById('bq-voice-rec-cancel');
    if(cancel && !cancel.dataset.v4Bound){
      cancel.dataset.v4Bound='1';
      cancel.addEventListener('click',()=>{
        if(voiceController?.recorder?.state==='recording'){
          const ctrl=voiceController;
          ctrl.recorder.onstop=()=>{
            cleanupVoiceController();
            document.getElementById('bq-voice-btn')?.classList.remove('recording');
            document.getElementById('bq-voice-rec-bar')?.classList.remove('show');
            const timeEl=document.getElementById('bq-voice-rec-time');
            if(timeEl) timeEl.textContent='0:00';
          };
          try{ctrl.recorder.stop();}catch(_){ cleanupVoiceController(); }
        }else{
          hideVoicePreview();
        }
      });
    }
    if(!document.body.dataset.voicePreviewBound){
      document.body.dataset.voicePreviewBound='1';
      document.addEventListener('click',e=>{
        const play=e.target.closest('#bq-vp-play');
        if(play){
          e.stopPropagation();
          if(!voicePreviewAudio) return;
          if(voicePreviewAudio.paused){
            voicePreviewAudio.play();
            play.innerHTML='<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          }else{
            voicePreviewAudio.pause();
            play.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
          }
          return;
        }
        if(e.target.closest('#bq-vp-replay')){
          e.stopPropagation();
          if(!voicePreviewAudio) return;
          voicePreviewAudio.currentTime=0;
          voicePreviewAudio.play();
          const playBtn=document.getElementById('bq-vp-play');
          if(playBtn) playBtn.innerHTML='<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          return;
        }
        if(e.target.closest('#bq-vp-discard')){ e.stopPropagation(); hideVoicePreview(); return; }
        if(e.target.closest('#bq-vp-send')){ e.stopPropagation(); if(voicePreviewData) sendVoiceDm(voicePreviewData,voicePreviewDuration); hideVoicePreview(); }
      });
    }
  }

  const originalGiphyFetch=giphyFetch;
  giphyFetch=async function(category,query){
    const normalizedQuery=(query||'').trim();
    const selected=(normalizedQuery ? normalizedQuery : (!category || category==='trending' ? CURATED_GIPHY_QUERIES[Math.floor(Date.now()/1000)%CURATED_GIPHY_QUERIES.length] : ''));
    const key=_resolvedGiphyKey;
    if(!key || key==='PASTE_YOUR_GIPHY_KEY_HERE') return { error:'Add your Giphy API key in chat-widget.js (GIPHY_API_KEY) or set window.GIPHY_API_KEY.' };
    const cacheKey='v2|'+(category||'trending')+'|'+selected;
    if(_giphyCache[cacheKey]) return { data:_giphyCache[cacheKey] };
    let url='';
    if(selected){
      url=`https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(selected)}&limit=24&rating=pg&lang=en&bundle=messaging_non_clips`;
    }else{
      const cat=GIPHY_CATEGORIES.find(c=>c.id===category);
      const q=cat ? cat.q : category;
      url=`https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q||category||'wholesome reactions')}&limit=24&rating=pg&lang=en&bundle=messaging_non_clips`;
    }
    try{
      const r=await fetch(url);
      if(!r.ok) return { error:'Giphy request failed ('+r.status+')' };
      const j=await r.json();
      const filtered=(j.data||[]).filter(g=>!BRAINTROT_DENY.test((g.title||'')+' '+(g.slug||'')));
      _giphyCache[cacheKey]=filtered;
      return { data:filtered };
    }catch(_){
      return { error:'Network error fetching GIFs' };
    }
  };

  try{
    GIPHY_CATEGORIES.splice(0,GIPHY_CATEGORIES.length,
      { id:'reactions', label:'Reactions', q:'wholesome reactions' },
      { id:'cute', label:'Cute', q:'cute animals' },
      { id:'happy', label:'Happy', q:'celebrate' },
      { id:'love', label:'Love', q:'love' },
      { id:'anime', label:'Anime', q:'anime smile' },
      { id:'study', label:'Study', q:'study motivation' },
      { id:'sad', label:'Sad', q:'comfort reaction' },
      { id:'sports', label:'Sports', q:'sports celebration' },
      { id:'food', label:'Food', q:'food happy' },
      { id:'memes', label:'Memes', q:'funny meme' },
      { id:'fail', label:'Fail', q:'funny fail' }
    );
  }catch(_){ }

  function setProfileDirty(next){
    profileDirty=!!next;
    const badge=document.getElementById('bqp4-dirty');
    if(badge) badge.classList.toggle('show',profileDirty);
    const info=document.getElementById('bqp4-save-info');
    if(info) info.textContent=profileDirty?'You have unsaved changes':'All profile changes are saved locally';
  }

  function renderProfilePreview(){
    const draft=getProfileDraft();
    const avatar=document.getElementById('bqp4-chip-avatar');
    const name=document.getElementById('bqp4-chip-name');
    const sub=document.getElementById('bqp4-chip-sub');
    const display=draft.displayName || draft.username || 'Your name';
    const initials=(draft.initials||uInit(draft.username||'?')).slice(0,2).toUpperCase();
    if(avatar){
      if(draft.avatar){
        avatar.style.backgroundImage='url('+draft.avatar+')';
        avatar.style.backgroundColor='transparent';
        avatar.textContent='';
      }else{
        avatar.style.backgroundImage='';
        avatar.style.backgroundColor=draft.color;
        avatar.textContent=initials;
      }
    }
    if(name){
      name.textContent=display;
      name.style.color=draft.nameColor || draft.color;
    }
    if(sub){
      const status=PROFILE_STATUS_OPTIONS.find(s=>s.id===draft.status)?.label || 'Online';
      const bits=['@'+(draft.username||'username'), draft.pronouns||'', draft.customStatus||draft.activity||status].filter(Boolean);
      sub.textContent=bits.join(' · ');
    }
    const displayEl=document.getElementById('bqp4-display');
    if(displayEl){ displayEl.textContent=display; displayEl.style.color=draft.nameColor || draft.color; }
    const userEl=document.getElementById('bqp4-user');
    if(userEl) userEl.textContent='@'+(draft.username||'username');
    const pronEl=document.getElementById('bqp4-pronouns-inline');
    if(pronEl) pronEl.textContent=draft.pronouns?('· '+draft.pronouns):'';
    const avatarBig=document.getElementById('bqp4-avatar');
    if(avatarBig){
      if(draft.avatar){
        avatarBig.style.backgroundImage='url('+draft.avatar+')';
        avatarBig.style.backgroundColor='transparent';
        avatarBig.textContent='';
      }else{
        avatarBig.style.backgroundImage='';
        avatarBig.style.backgroundColor=draft.color;
        avatarBig.textContent=initials;
      }
    }
    const banner=document.getElementById('bqp4-banner');
    if(banner){
      banner.style.background = draft.banner
        ? 'url('+draft.banner+') center/cover'
        : 'linear-gradient(135deg,'+draft.bannerColor+'cc,'+draft.bannerColor+'33)';
    }
    const bioCount=document.getElementById('bqp4-bio-count');
    if(bioCount) bioCount.textContent=(draft.bio||'').length+' / 120';
  }

  function activateProfileTab(tabId){
    document.querySelectorAll('.bqp4-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.tab===tabId));
    document.querySelectorAll('.bqp4-panel').forEach(panel=>panel.classList.toggle('active',panel.dataset.panel===tabId));
  }

  function buildProfileRedesign(){
    const view=document.getElementById('bqv-profile');
    if(!view) return;
    const scroll=view.querySelector('.bqpf-scroll');
    if(!scroll) return;
    const draft=getProfileDraft();
    profileViewBuilt=true;
    scroll.innerHTML=''+
      '<div class="bqp4">'+
        '<div class="bqp4-hero">'+
          '<div class="bqp4-banner" id="bqp4-banner">'+
            '<button class="bqp4-banner-btn" id="bqp4-banner-btn"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Banner</button>'+
            '<input type="file" id="bqp4-banner-file" accept="image/*" hidden>'+
          '</div>'+
          '<div class="bqp4-head">'+
            '<div class="bqp4-avatar" id="bqp4-avatar">'+(draft.avatar?'':(draft.initials||uInit(draft.username||'?')).slice(0,2).toUpperCase())+
              '<button class="bqp4-avatar-edit" id="bqp4-avatar-btn"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>'+
              '<input type="file" id="bqp4-avatar-file" accept="image/*" hidden>'+
            '</div>'+
            '<div class="bqp4-id">'+
              '<div class="bqp4-display" id="bqp4-display"></div>'+
              '<div class="bqp4-userline"><span id="bqp4-user"></span><span id="bqp4-pronouns-inline"></span><button id="bqp4-rename">Change username</button></div>'+
            '</div>'+
          '</div>'+
          '<div class="bqp4-chip">'+
            '<div class="bqp4-chip-avatar" id="bqp4-chip-avatar"></div>'+
            '<div class="bqp4-chip-main"><div class="bqp4-chip-name" id="bqp4-chip-name"></div><div class="bqp4-chip-sub" id="bqp4-chip-sub"></div></div>'+
            '<div class="bqp4-dirty" id="bqp4-dirty">Unsaved</div>'+
          '</div>'+
          '<div class="bqp4-tabs">'+PROFILE_TABS.map(tab=>'<button class="bqp4-tab'+(tab.id==='identity'?' active':'')+'" data-tab="'+tab.id+'">'+tab.label+'</button>').join('')+'</div>'+
        '</div>'+
        '<div class="bqp4-panels">'+
          '<div class="bqp4-panel active" data-panel="identity">'+
            '<div class="bqp4-card"><div class="bqp4-card-head"><div class="bqp4-card-title">How you appear in chat</div><div class="bqp4-card-sub">Set the public identity details people will see in the widget.</div></div><div class="bqp4-fields">'+
              '<div class="bqp4-field two"><div><div class="bqp4-label">Username</div><input class="bqp4-input" id="bqp4-username" maxlength="20" value="'+esc(draft.username)+'" disabled></div><div><div class="bqp4-label">Display name</div><input class="bqp4-input" id="bqp4-display-name" maxlength="32" value="'+esc(draft.displayName)+'"></div></div>'+
              '<div class="bqp4-field two"><div><div class="bqp4-label">Pronouns</div><input class="bqp4-input" id="bqp4-pronouns" maxlength="20" placeholder="they / them" value="'+esc(draft.pronouns)+'"></div><div><div class="bqp4-label">Initials</div><input class="bqp4-input" id="bqp4-initials" maxlength="2" placeholder="AB" value="'+esc(draft.initials)+'"></div></div>'+
              '<div class="bqp4-field"><div class="bqp4-label">Bio</div><textarea class="bqp4-textarea" id="bqp4-bio" maxlength="120" placeholder="Add a short intro">'+esc(draft.bio)+'</textarea><div class="bqp4-counter" id="bqp4-bio-count">0 / 120</div></div>'+
            '</div></div>'+
          '</div>'+
          '<div class="bqp4-panel" data-panel="appearance">'+
            '<div class="bqp4-card"><div class="bqp4-card-head"><div class="bqp4-card-title">Avatar, banner, and color styling</div><div class="bqp4-card-sub">Upload visuals or keep the fallback gradients and name accent flexible.</div></div><div class="bqp4-fields">'+
              '<div class="bqp4-field"><div class="bqp4-label">Avatar color</div><div class="bqp4-color-grid" id="bqp4-avatar-colors"></div></div>'+
              '<div class="bqp4-field"><div class="bqp4-label">Banner color</div><div class="bqp4-color-grid" id="bqp4-banner-colors"></div></div>'+
              '<div class="bqp4-field"><div class="bqp4-label">Name color</div><div class="bqp4-color-grid" id="bqp4-name-colors"></div></div>'+
              '<div class="bqp4-helper">Uploaded avatar and banner images override the fallback colors until you replace or remove them.</div>'+
            '</div></div>'+
          '</div>'+
          '<div class="bqp4-panel" data-panel="status">'+
            '<div class="bqp4-card"><div class="bqp4-card-head"><div class="bqp4-card-title">Presence & vibe</div><div class="bqp4-card-sub">Pick a live status, add a custom line, and show what you are doing right now.</div></div><div class="bqp4-fields">'+
              '<div class="bqp4-statuses" id="bqp4-statuses"></div>'+
              '<div class="bqp4-field"><div class="bqp4-label">Custom status</div><input class="bqp4-input" id="bqp4-custom-status" maxlength="40" placeholder="On a deep focus sprint" value="'+esc(draft.customStatus)+'"></div>'+
              '<div class="bqp4-field"><div class="bqp4-label">Current activity</div><input class="bqp4-input" id="bqp4-activity" maxlength="60" placeholder="Studying Biology" value="'+esc(draft.activity)+'"></div>'+
            '</div></div>'+
          '</div>'+
          '<div class="bqp4-panel" data-panel="privacy">'+
            '<div class="bqp4-card"><div class="bqp4-card-head"><div class="bqp4-card-title">Privacy controls</div><div class="bqp4-card-sub">Choose who can reach you, whether read receipts stay on, and who stays blocked.</div></div><div class="bqp4-fields">'+
              '<div class="bqp4-field two"><div><div class="bqp4-label">DM permissions</div><select class="bqp4-select" id="bqp4-dm-permission">'+DM_PERMISSION_OPTIONS.map(o=>'<option'+(o===draft.dmPermission?' selected':'')+'>'+o+'</option>').join('')+'</select></div><div><div class="bqp4-label">Online visibility</div><select class="bqp4-select" id="bqp4-online-visibility">'+ONLINE_VISIBILITY_OPTIONS.map(o=>'<option'+(o===draft.onlineVisibility?' selected':'')+'>'+o+'</option>').join('')+'</select></div></div>'+
              '<div class="bqp4-toggle-row"><div class="bqp4-toggle-copy"><div class="bqp4-toggle-title">Read receipts</div><div class="bqp4-toggle-sub">Show seen state to people in DMs.</div></div><label class="bqp4-switch"><input type="checkbox" id="bqp4-read-receipts"'+(draft.readReceipts?' checked':'')+'><span class="bqp4-slider"></span></label></div>'+
              '<div class="bqp4-field"><div class="bqp4-label">Blocked list</div><div class="bqp4-list" id="bqp4-blocked"></div></div>'+
            '</div></div>'+
          '</div>'+
        '</div>'+
        '<div class="bqp4-savebar">'+
          '<div class="bqp4-savecopy"><div class="bqp4-savehint">Profile changes</div><div class="bqp4-saveinfo" id="bqp4-save-info">All profile changes are saved locally</div></div>'+
          '<div class="bqp4-saved" id="bqp4-saved">Saved</div>'+
          '<button class="bqp4-savebtn" id="bqp4-save">Save profile</button>'+
        '</div>'+
      '</div>';

    renderProfilePreview();
    setProfileDirty(false);

    const avatarColors=document.getElementById('bqp4-avatar-colors');
    const bannerColors=document.getElementById('bqp4-banner-colors');
    const nameColors=document.getElementById('bqp4-name-colors');
    const blockedWrap=document.getElementById('bqp4-blocked');
    PALETTE.forEach(color=>{
      const buildChip=(group,key)=>{
        const chip=document.createElement('button');
        chip.type='button';
        chip.className='bqp4-color'+(draft[key]===color?' active':'');
        chip.style.background=color;
        chip.addEventListener('click',()=>{
          draft[key]=color;
          group.querySelectorAll('.bqp4-color').forEach(el=>el.classList.toggle('active',el===chip));
          renderProfilePreview();
          setProfileDirty(true);
        });
        return chip;
      };
      avatarColors?.appendChild(buildChip(avatarColors,'color'));
      bannerColors?.appendChild(buildChip(bannerColors,'bannerColor'));
      nameColors?.appendChild(buildChip(nameColors,'nameColor'));
    });
    PROFILE_STATUS_OPTIONS.forEach(opt=>{
      const item=document.createElement('button');
      item.type='button';
      item.className='bqp4-status'+(draft.status===opt.id?' active':'');
      item.innerHTML='<span class="bqp4-status-dot" style="background:'+opt.color+'"></span><span class="bqp4-status-copy"><span class="bqp4-status-name">'+opt.label+'</span><span class="bqp4-status-desc">'+opt.desc+'</span></span>';
      item.addEventListener('click',()=>{
        draft.status=opt.id;
        document.querySelectorAll('.bqp4-status').forEach(el=>el.classList.toggle('active',el===item));
        renderProfilePreview();
        setProfileDirty(true);
      });
      document.getElementById('bqp4-statuses')?.appendChild(item);
    });
    if(blockedWrap){
      blockedWrap.innerHTML='';
      if(!draft.blocked.length){
        blockedWrap.innerHTML='<div class="bqp4-helper">No blocked users yet.</div>';
      }else{
        draft.blocked.forEach(id=>{
          const pill=document.createElement('div');
          pill.className='bqp4-pill';
          pill.innerHTML='<span>'+esc(getAlias(id)||onlineU[id]?.uname||id)+'</span><button type="button" data-id="'+esc(id)+'">Remove</button>';
          pill.querySelector('button').addEventListener('click',()=>{
            draft.blocked=draft.blocked.filter(x=>x!==id);
            buildProfileRedesign();
            setProfileDirty(true);
          });
          blockedWrap.appendChild(pill);
        });
      }
    }

    document.querySelectorAll('.bqp4-tab').forEach(tab=>tab.addEventListener('click',()=>activateProfileTab(tab.dataset.tab)));
    document.getElementById('bqp4-rename')?.addEventListener('click',()=>showModal?.(true));
    document.getElementById('bqp4-avatar-btn')?.addEventListener('click',e=>{ e.stopPropagation(); document.getElementById('bqp4-avatar-file')?.click(); });
    document.getElementById('bqp4-banner-btn')?.addEventListener('click',e=>{ e.stopPropagation(); document.getElementById('bqp4-banner-file')?.click(); });

    ['display-name','pronouns','bio','initials','custom-status','activity'].forEach(id=>{
      document.getElementById('bqp4-'+id)?.addEventListener('input',e=>{
        const map={ 'display-name':'displayName', pronouns:'pronouns', bio:'bio', initials:'initials', 'custom-status':'customStatus', activity:'activity' };
        let value=e.target.value;
        if(id==='initials'){
          value=value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,2);
          e.target.value=value;
        }
        draft[map[id]]=value;
        renderProfilePreview();
        setProfileDirty(true);
      });
    });
    document.getElementById('bqp4-dm-permission')?.addEventListener('change',e=>{ draft.dmPermission=e.target.value; setProfileDirty(true); });
    document.getElementById('bqp4-online-visibility')?.addEventListener('change',e=>{ draft.onlineVisibility=e.target.value; setProfileDirty(true); });
    document.getElementById('bqp4-read-receipts')?.addEventListener('change',e=>{ draft.readReceipts=!!e.target.checked; setProfileDirty(true); });
    document.getElementById('bqp4-avatar-file')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];
      if(!file) return;
      try{ draft.avatar=await resizeImageFile(file,256,256); renderProfilePreview(); setProfileDirty(true); toast('Avatar ready to save'); }catch(_){ toast('Failed to upload avatar'); }
    });
    document.getElementById('bqp4-banner-file')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];
      if(!file) return;
      try{ draft.banner=await resizeImageFile(file,1500,500); renderProfilePreview(); setProfileDirty(true); toast('Banner ready to save'); }catch(_){ toast('Failed to upload banner'); }
    });
    document.getElementById('bqp4-save')?.addEventListener('click',()=>{
      const statusToStore=draft.status==='invisible'?'offline':draft.status;
      myProfile.displayName=draft.displayName;
      myProfile.pronouns=draft.pronouns;
      myProfile.bio=draft.bio;
      myProfile.initials=draft.initials;
      myProfile.avatar=draft.avatar;
      myProfile.banner=draft.banner;
      myProfile.color=draft.color;
      myProfile.bannerColor=draft.bannerColor;
      myProfile.nameColor=draft.nameColor;
      myProfile.status=statusToStore;
      myProfile.customStatus=draft.customStatus;
      myProfile.activity=draft.activity;
      myProfile.dmPermission=draft.dmPermission;
      myProfile.readReceipts=draft.readReceipts;
      myProfile.onlineVisibility=draft.onlineVisibility;
      localStorage.setItem(LS_PROF,JSON.stringify(myProfile));
      localStorage.setItem('bq_blocked',JSON.stringify(draft.blocked));
      localStorage.setItem(LS_RR,draft.readReceipts?'on':'off');
      if(draft.readReceipts!==getRR()) toggleRR?.(); else updateAllReadReceipts?.(activeDmId);
      if(db&&uid){
        db.ref('bq_presence/'+uid).update({
          uname,
          status:statusToStore||'online',
          activity:draft.activity||'',
          bio:draft.bio||'',
          color:draft.color||'',
          initials:draft.initials||'',
          avatar:draft.avatar||'',
          banner:draft.banner||'',
          displayName:draft.displayName||'',
          pronouns:draft.pronouns||'',
          customStatus:draft.customStatus||'',
          nameColor:draft.nameColor||'',
          ts:Date.now()
        }).catch(()=>{});
        startPresence?.();
      }
      refreshMeAvatar?.();
      renderProfilePreview();
      setProfileDirty(false);
      const saved=document.getElementById('bqp4-saved');
      if(saved){ saved.classList.add('show'); setTimeout(()=>saved.classList.remove('show'),1800); }
      toast('Profile saved');
    });
  }

  const originalRefreshProfileView=refreshProfileView;
  refreshProfileView=function(){
    originalRefreshProfileView?.();
    profileDraft=null;
    buildProfileRedesign();
  };

  const originalNav=bqNav;
  bqNav=function(targetView){
    originalNav(targetView);
    if(targetView==='profile') setTimeout(()=>refreshProfileView(),30);
  };

  ensureDmMenuBindings();
  bindSettingsCard();
  bindVoiceUi();
  setTimeout(()=>{ ensureDmMenuBindings(); bindSettingsCard(); bindVoiceUi(); if(activeView==='profile') refreshProfileView(); },400);
  setTimeout(()=>{ ensureDmMenuBindings(); bindSettingsCard(); bindVoiceUi(); },1400);

})();

// v9: ── Apply persisted theme + check for newer version ─────────
(function _bqV9Boot(){
  function _applyOnReady(){
    try {
      const t = (typeof getGlobalTheme==='function') ? getGlobalTheme() : (localStorage.getItem('bq_theme_v2')||'none');
      if(typeof applyGlobalTheme==='function') applyGlobalTheme(t);
    } catch(_){}
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', _applyOnReady);
  } else { _applyOnReady(); }
  // Re-apply after panel mounts (the widget renders #bqp lazily)
  let tries=0;
  const iv=setInterval(()=>{
    tries++;
    if(document.getElementById('bqp')){ _applyOnReady(); clearInterval(iv); }
    if(tries>40) clearInterval(iv);
  },150);

  // Version check — soft update, NEVER auto-reload (prevents reload loops when
  // a CDN/SW keeps serving a stale chat-widget.js but version.json is fresh).
  // We just clear our SW caches and expose window.BQ_UPDATE_AVAILABLE so the
  // host page can show a "tap to update" banner if it wants.
  try{
    const RELOAD_KEY='bq_widget_reload_attempt';
    fetch(VERSION_CHECK_URL+'?t='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
      if(!j || !j.version || j.version === WIDGET_VERSION) return;
      console.info('[bq-widget] new version available:', j.version, '(running '+WIDGET_VERSION+')');
      window.BQ_UPDATE_AVAILABLE = j.version;
      // Best-effort: clear our own SW caches so the NEXT natural navigation
      // picks up the new file. Do NOT reload here.
      if('caches' in window){
        try{ caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('bq-')).map(k=>caches.delete(k)))); }catch(_){}
      }
      // One-shot reload guard: only reload if we've never tried this session
      // AND the host opted in via window.BQ_AUTO_RELOAD === true.
      if(window.BQ_AUTO_RELOAD === true){
        try{
          if(sessionStorage.getItem(RELOAD_KEY)) {
            console.warn('[bq-widget] update still pending after reload — cached script is stuck. Skipping further reloads.');
            return;
          }
          sessionStorage.setItem(RELOAD_KEY, '1');
          setTimeout(()=>location.reload(), 300);
        }catch(_){}
      }
    }).catch(()=>{});
    // Clear the guard once we're actually on the new version
    try{
      const stored = sessionStorage.getItem(RELOAD_KEY);
      if(stored) sessionStorage.removeItem(RELOAD_KEY);
    }catch(_){}
  }catch(_){}
})();

})();
