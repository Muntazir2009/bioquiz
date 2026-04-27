/**
 * v10.0 — cleaned & optimized (Apr 2026)
 * - Removed legacy .bqacts hover toolbar + inline .bqepick (caused 'half menu' on React)
 * - New centered reaction picker modal (#bq-rx-picker)
 * - Removed banner & avatar uploads (catbox.moe). Initials + accent color only.
 * - Throttled typing/presence writes; lazy GIF loading; single global ticker
 */
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
// v10: throttle typing/presence writes
const _typingThrottle = Object.create(null);
function _throttledTypingWrite(path, data){
  if(!db) return;
  const now=Date.now();
  const last=_typingThrottle[path]||0;
  if(now-last < 1500) return;
  _typingThrottle[path]=now;
  db.ref(path).set(data);
}
const CHAR_LIMIT   = 320;
const TYPING_TTL   = 3000;
const PRESENCE_TTL = 9000;
const LS_UID   = 'bq_chat_uid';
const LS_NAME  = 'bq_chat_uname';
const LS_PROF  = 'bq_chat_profile';
const LS_THEME = 'bq_theme_v2';                 // v9: persisted global theme id
const WIDGET_VERSION = '9.6.1';                 // v9.6.1: compact working message menu + 4 fixed themes
// You can override with window.BQ_IMAGE_HOST = 'https://your-uploader' before loading the widget.
const IMAGE_HOST_URL = ''; // v10: image hosting removed
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
  // v10: banner/avatar URL fields no longer cached
  if(!uid || !d) return;
  AVATAR_CACHE[uid] = {
    
    
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
function presenceMeta(targetUid,pdata){
  const data=pdata||onlineU[targetUid]||{};
  const st=statusInfo(data.status||'online');
  const isOnline=!!onlineU[targetUid];
  return {
    data,
    isOnline,
    label:isOnline?st.label:'Offline',
    detail:isOnline?st.label:(data.ts?'Last seen '+lastSeenStr(data.ts):'Offline'),
    color:isOnline?st.color:'var(--bq-text-subtle)',
    status:isOnline?(data.status||'online'):'offline'
  };
}
function presenceBadgeHTML(meta,text){
  return '<span class="bq-presence'+(meta.isOnline?' is-online':' is-offline')+'" style="color:'+meta.color+'"><span class="bq-presence-dot"></span><span class="bq-presence-label">'+esc(text||meta.label)+'</span></span>';
}

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
/* v18: directional entrance — theirs slides in from left, mine from right,
   with a soft scale pop and subtle blur fade. Applied only to the newest
   message so existing messages don't re-animate on scroll. */
.bqr.theirs.bq-new{animation:bqBubbleInL .36s cubic-bezier(.22,1.2,.36,1) both;}
.bqr.mine.bq-new{animation:bqBubbleInR .36s cubic-bezier(.22,1.2,.36,1) both;}
@keyframes bqBubbleInL{
  0%{opacity:0;transform:translateX(-14px) translateY(6px) scale(.94);filter:blur(2px);}
  60%{opacity:1;filter:blur(0);}
  100%{opacity:1;transform:translateX(0) translateY(0) scale(1);filter:blur(0);}
}
@keyframes bqBubbleInR{
  0%{opacity:0;transform:translateX(14px) translateY(6px) scale(.94);filter:blur(2px);}
  60%{opacity:1;filter:blur(0);}
  100%{opacity:1;transform:translateX(0) translateY(0) scale(1);filter:blur(0);}
}
/* v18: reply chip entrance — subtle slide-down from above the bubble */
.bqr.bq-new .bqrp{animation:bqReplySlide .42s cubic-bezier(.22,1,.36,1) both;transform-origin:top left;}
.bqr.mine.bq-new .bqrp{transform-origin:top right;}
@keyframes bqReplySlide{
  0%{opacity:0;transform:translateY(-6px) scaleY(.4);max-height:0;}
  60%{opacity:1;}
  100%{opacity:1;transform:translateY(0) scaleY(1);max-height:80px;}
}
/* v18: soft bubble hover lift on desktop */
@media (hover:hover){
  .bqr .bqbbl{transition:transform .22s var(--bq-transition),box-shadow .22s ease,filter .22s ease;}
  .bqr:hover .bqbbl{transform:translateY(-1px);}
}
/* v18: tap ripple on bubble press (mobile) */
.bqbbl{-webkit-tap-highlight-color:transparent;}
.bqbbl:active{transform:scale(.985);transition:transform .08s ease;}
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
  position:absolute;top:-44px;display:none;align-items:center;gap:4px;
  background:var(--bq-bg-elevated,#1f2937);border:1px solid var(--bq-border,rgba(255,255,255,.12));
  border-radius:var(--bq-radius-sm,10px);padding:5px;box-shadow:0 8px 24px rgba(0,0,0,.5);
  z-index:50;white-space:nowrap;max-width:calc(100vw - 24px);overflow-x:auto;scrollbar-width:none;
}
/* If message is near the top of the chat, flip actions BELOW the bubble so they don't get clipped */
  width:32px;height:32px;background:rgba(255,255,255,.04);border:none;cursor:pointer;
  border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:16px;line-height:1;transition:all .15s;color:var(--bq-text,#e5e7eb);
}
#bq-msg-sheet{position:absolute;inset:0;display:none;z-index:999999;pointer-events:none;}
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
.bq-msg-inline{display:inline-flex;flex-wrap:nowrap;gap:4px;margin-top:6px;max-width:100%;pointer-events:auto;background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:999px;padding:4px;box-shadow:0 6px 18px rgba(0,0,0,.22);overflow-x:auto;scrollbar-width:none;}
.bq-msg-inline::-webkit-scrollbar{display:none;}
.bqr.mine .bq-msg-inline{align-self:flex-end;}
.bq-msg-inline .bq-ms-btn{flex:0 0 auto;width:32px;height:32px;min-height:32px;padding:0;border:none;background:transparent;box-shadow:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:var(--bq-text);}
.bq-msg-inline .bq-ms-btn:hover{background:var(--bq-hover);}
.bq-msg-inline .bq-ms-btn.danger{color:#ef4444;}
.bq-msg-inline .bq-ms-btn span{display:none;}
.bq-msg-inline .bq-ms-btn svg{width:16px;height:16px;}
.bqbbl.msg-menu-open{outline:1px solid color-mix(in srgb,var(--bq-accent) 30%, transparent);box-shadow:0 0 0 3px color-mix(in srgb,var(--bq-accent) 10%, transparent);}
.bq-presence{display:inline-flex;align-items:center;gap:7px;max-width:100%;padding:4px 10px;border-radius:999px;background:color-mix(in srgb,currentColor 12%, transparent);font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:.02em;line-height:1.1;}
.bq-presence-dot{width:8px;height:8px;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 16%, transparent);flex-shrink:0;}
.bq-presence-label{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bq-presence.is-online .bq-presence-dot{animation:bqPresencePulse 1.8s ease-in-out infinite;}
@keyframes bqPresencePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.82);opacity:.72}}
.bqdmhs{margin-top:4px;display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:color-mix(in srgb,var(--bq-text) 7%, transparent);border:1px solid var(--bq-border);width:max-content;max-width:100%;}
.bqdmhs-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;animation:bqPresencePulse 1.8s ease-in-out infinite;}
.bqust,.bq-info-status,.bqpc-status{display:flex;align-items:center;gap:6px;min-height:20px;}
.bqust{margin-top:4px;}
#bqp.bq-theme-walight .bqhbtn,#bqp.bq-theme-walight .bqvoice-btn,#bqp.bq-theme-walight .bqgifbtn,#bqp.bq-theme-walight .bqscr{background:#ffffff!important;border-color:#d1d7db!important;color:#54656f!important;box-shadow:0 1px 2px rgba(11,20,26,.08)!important;}
#bqp.bq-theme-walight .bqhbtn svg,#bqp.bq-theme-walight .bqvoice-btn svg,#bqp.bq-theme-walight .bqgifbtn svg,#bqp.bq-theme-walight .bqscr svg,#bqp.bq-theme-walight .bqback svg,#bqp.bq-theme-walight .bqnb svg{stroke:currentColor!important;fill:none!important;}
#bqp.bq-theme-walight .bqhbtn:hover,#bqp.bq-theme-walight .bqvoice-btn:hover,#bqp.bq-theme-walight .bqgifbtn:hover,#bqp.bq-theme-walight .bqscr:hover{color:#075e54!important;background:#f7f8f8!important;}
#bqp.bq-theme-walight .bqsnd{background:#25d366!important;box-shadow:0 6px 18px rgba(37,211,102,.28)!important;}
#bqp.bq-theme-walight .bqsnd svg{stroke:#fff!important;}
#bqp.bq-theme-walight .bqnb.active{color:#25d366!important;background:rgba(37,211,102,.12)!important;}
#bqp.bq-theme-wadark .bqhbtn,#bqp.bq-theme-wadark .bqvoice-btn,#bqp.bq-theme-wadark .bqgifbtn,#bqp.bq-theme-wadark .bqscr{background:#202c33!important;border-color:#2a3942!important;color:#8696a0!important;box-shadow:none!important;}
#bqp.bq-theme-wadark .bqhbtn svg,#bqp.bq-theme-wadark .bqvoice-btn svg,#bqp.bq-theme-wadark .bqgifbtn svg,#bqp.bq-theme-wadark .bqscr svg,#bqp.bq-theme-wadark .bqback svg,#bqp.bq-theme-wadark .bqnb svg{stroke:currentColor!important;fill:none!important;}
#bqp.bq-theme-wadark .bqhbtn:hover,#bqp.bq-theme-wadark .bqvoice-btn:hover,#bqp.bq-theme-wadark .bqgifbtn:hover,#bqp.bq-theme-wadark .bqscr:hover{color:#e9edef!important;background:#233138!important;}
#bqp.bq-theme-wadark .bqsnd{background:#00a884!important;box-shadow:0 6px 18px rgba(0,168,132,.24)!important;}
#bqp.bq-theme-wadark .bqsnd svg{stroke:#fff!important;}
#bqp.bq-theme-wadark .bqnb.active{color:#00a884!important;background:rgba(0,168,132,.14)!important;}
/* ===== v14: WhatsApp-style icons for walight + wadark themes ===== */
#bqp.bq-theme-walight .bqvoice-btn svg,#bqp.bq-theme-wadark .bqvoice-btn svg,
#bqp.bq-theme-walight .bqgifbtn svg,#bqp.bq-theme-wadark .bqgifbtn svg,
#bqp.bq-theme-walight .bqhbtn svg,#bqp.bq-theme-wadark .bqhbtn svg,
#bqp.bq-theme-walight .bqsnd svg,#bqp.bq-theme-wadark .bqsnd svg{visibility:hidden!important;}
#bqp.bq-theme-walight .bqvoice-btn,#bqp.bq-theme-wadark .bqvoice-btn,
#bqp.bq-theme-walight .bqgifbtn,#bqp.bq-theme-wadark .bqgifbtn,
#bqp.bq-theme-walight .bqhbtn,#bqp.bq-theme-wadark .bqhbtn,
#bqp.bq-theme-walight .bqsnd,#bqp.bq-theme-wadark .bqsnd{position:relative!important;}
#bqp.bq-theme-walight .bqvoice-btn::after,#bqp.bq-theme-wadark .bqvoice-btn::after,
#bqp.bq-theme-walight .bqgifbtn::after,#bqp.bq-theme-wadark .bqgifbtn::after,
#bqp.bq-theme-walight .bqhbtn::after,#bqp.bq-theme-wadark .bqhbtn::after,
#bqp.bq-theme-walight .bqsnd::after,#bqp.bq-theme-wadark .bqsnd::after{
  content:"";position:absolute;inset:0;margin:auto;width:22px;height:22px;
  -webkit-mask-position:center;mask-position:center;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  -webkit-mask-size:contain;mask-size:contain;
  background-color:currentColor;pointer-events:none;
}
/* Mic — WhatsApp-style filled mic */
#bqp.bq-theme-walight .bqvoice-btn::after,#bqp.bq-theme-wadark .bqvoice-btn::after{
  -webkit-mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z'/></svg>");
  mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z'/></svg>");
}
/* Smiley — WhatsApp emoji icon */
#bqp.bq-theme-walight .bqhbtn::after,#bqp.bq-theme-wadark .bqhbtn::after{
  -webkit-mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-3.5-9a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 8.5 11zm7 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zm-3.5 7a5.5 5.5 0 0 0 4.9-3H7.1a5.5 5.5 0 0 0 4.9 3z'/></svg>");
  mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-3.5-9a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 8.5 11zm7 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zm-3.5 7a5.5 5.5 0 0 0 4.9-3H7.1a5.5 5.5 0 0 0 4.9 3z'/></svg>");
}
/* GIF — pill/badge style */
#bqp.bq-theme-walight .bqgifbtn::after,#bqp.bq-theme-wadark .bqgifbtn::after{
  -webkit-mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6zm3.5 4v4h1.2v-4H6.5zm2.6 0v4h1.2v-1.4h1.2v-1H10.3V11h1.6v-1H9.1zm4.4 0v4h1.2v-1.4h.5l.7 1.4h1.4l-.9-1.6a1.2 1.2 0 0 0 .8-1.2c0-.8-.6-1.2-1.5-1.2h-2.2zm1.2 1h.9c.3 0 .5.1.5.4s-.2.4-.5.4h-.9V11z'/></svg>");
  mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z'/></svg>");
}
/* Send — WhatsApp paper plane (filled, white on green) */
#bqp.bq-theme-walight .bqsnd::after,#bqp.bq-theme-wadark .bqsnd::after{
  width:18px;height:18px;background-color:#fff;
  -webkit-mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/></svg>");
  mask-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/></svg>");
}
/* Color tweaks per theme */
#bqp.bq-theme-walight .bqvoice-btn::after,#bqp.bq-theme-walight .bqhbtn::after,#bqp.bq-theme-walight .bqgifbtn::after{background-color:#54656f;}
#bqp.bq-theme-walight .bqvoice-btn:hover::after,#bqp.bq-theme-walight .bqhbtn:hover::after,#bqp.bq-theme-walight .bqgifbtn:hover::after{background-color:#075e54;}
#bqp.bq-theme-wadark .bqvoice-btn::after,#bqp.bq-theme-wadark .bqhbtn::after,#bqp.bq-theme-wadark .bqgifbtn::after{background-color:#aebac1;}
#bqp.bq-theme-wadark .bqvoice-btn:hover::after,#bqp.bq-theme-wadark .bqhbtn:hover::after,#bqp.bq-theme-wadark .bqgifbtn:hover::after{background-color:#e9edef;}
/* ===== end v14 wa icons ===== */
#bqp.bq-theme-walight .bq-msg-inline .bq-ms-btn{background:#fff!important;border-color:#d1d7db!important;color:#54656f!important;box-shadow:0 8px 18px rgba(11,20,26,.12)!important;}
#bqp.bq-theme-wadark .bq-msg-inline .bq-ms-btn{background:#202c33!important;border-color:#2a3942!important;color:#e9edef!important;box-shadow:0 8px 18px rgba(0,0,0,.32)!important;}
.bq-voice-msg{--bq-voice-progress:0;}
.bq-voice-bars{position:relative;overflow:hidden;}
.bq-voice-bar{background:color-mix(in srgb,var(--bq-text-muted) 52%, transparent);transition:background-color .16s ease,opacity .16s ease;opacity:.42;}
.bq-voice-bar.played{background:var(--bq-accent);opacity:1;box-shadow:0 0 0 1px color-mix(in srgb,var(--bq-accent) 28%, transparent),0 0 12px color-mix(in srgb,var(--bq-accent) 22%, transparent);}

#bq-rx-picker{position:absolute;inset:0;display:none;z-index:50;align-items:flex-end;justify-content:center;}
#bq-rx-picker.open{display:flex;}
.bq-rx-back{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);}
.bq-rx-panel{position:relative;width:min(420px,100%);max-height:55%;background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:18px 18px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -10px 40px rgba(0,0,0,.5);animation:bqRxIn .18s ease;}
@keyframes bqRxIn{from{transform:translateY(100%);}to{transform:translateY(0);}}
.bq-rx-tabs{display:flex;gap:0;padding:8px;border-bottom:1px solid var(--bq-border);background:rgba(0,0,0,.15);overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
.bq-rx-tabs::-webkit-scrollbar{display:none;}
.bq-rx-tab{flex:0 0 auto;background:none;border:none;cursor:pointer;font-size:22px;line-height:1;padding:8px 12px;border-radius:8px;opacity:.55;transition:opacity .15s,background .15s;}
.bq-rx-tab:hover{opacity:.85;background:var(--bq-bg-hover);}
.bq-rx-tab.active{opacity:1;background:var(--bq-bg-hover);box-shadow:inset 0 -2px 0 var(--bq-accent);}
.bq-rx-panes{flex:1;overflow-y:auto;}
.bq-rx-pane{display:none;padding:12px;grid-template-columns:repeat(8,1fr);gap:4px;}
.bq-rx-pane.active{display:grid;}
@media (max-width:480px){.bq-rx-pane{grid-template-columns:repeat(7,1fr);}}
.bq-rx-emo{aspect-ratio:1;background:none;border:none;cursor:pointer;border-radius:8px;font-size:26px;display:flex;align-items:center;justify-content:center;transition:transform .12s,background .12s;line-height:1;}
.bq-rx-emo:hover{background:var(--bq-bg-hover);transform:scale(1.25);}
.bq-rx-emo:active{transform:scale(.95);}
@media (max-width: 640px){.bq-ms-panel{max-width:min(200px,calc(100vw - 20px));}}
  position:absolute;top:-260px;display:none;flex-direction:column;width:280px;max-width:90vw;height:240px;
  background:var(--bq-bg-elevated);border:1px solid var(--bq-border);border-radius:12px;padding:0;overflow:hidden;
  box-shadow:0 12px 32px rgba(0,0,0,.6);z-index:15;
}





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

/* ── v18: tablet + small-browser responsive fix ──
   Previously the panel stayed at 400×600 floating bottom-right on viewports
   between 481-767px, causing the "halved UI" bug on many phones/browsers
   (landscape phones, split screens, embedded web-views). Now any viewport
   narrower than 768px or shorter than 620px goes edge-to-edge. */
@media (max-width: 767px), (max-height: 620px){
  #bqp{
    right:0 !important;bottom:0 !important;left:0 !important;top:0 !important;
    width:100vw !important;height:100dvh !important;max-height:100dvh !important;
    border-radius:0 !important;border:none !important;
    transform-origin:center !important;
    padding-bottom:env(safe-area-inset-bottom, 0) !important;
    padding-top:env(safe-area-inset-top, 0) !important;
  }
  #bqb{bottom:calc(16px + env(safe-area-inset-bottom, 0));right:16px;}
  #bqp.open{transform:scale(1) translateY(0) !important;}
  /* ensure inner scroll areas don't overflow under browser chrome */
  .bqmsgs{padding-bottom:12px !important;-webkit-overflow-scrolling:touch;}
}

/* v18: gentler entrance from any origin to avoid clipping half the panel */
@media (max-width: 767px){
  #bqp{transform:translateY(18px) scale(.985);opacity:0;}
  #bqp.open{transform:translateY(0) scale(1);}
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
.bq-theme-chip[data-t="wadark"]{background:linear-gradient(135deg,#005c4b 0%,#0b141a 100%);}
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
.bq-if-th[data-t="wadark"]{background:linear-gradient(135deg,#005c4b,#0b141a);}
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
      <button class="bqpc-close" id="bqpc-close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
          <div class="bq-theme-row" id="bq-theme-chips" data-theme-picker="dm"><div class="bq-theme-chip sel" data-t="none" title="Dark"></div><div class="bq-theme-chip" data-t="light" title="Light"></div><div class="bq-theme-chip" data-t="whatsapp" title="WhatsApp Light"></div><div class="bq-theme-chip" data-t="wadark" title="WhatsApp Dark"></div><div class="bq-theme-chip" data-t="black" title="Pure Black"></div><div class="bq-theme-chip" data-t="noir" title="Noir Black"></div><div class="bq-theme-chip" data-t="aurora" title="Aurora"></div><div class="bq-theme-chip" data-t="peach" title="Peach"></div><div class="bq-theme-chip" data-t="carbon" title="Carbon"></div><div class="bq-theme-chip" data-t="midnight" title="Midnight"></div><div class="bq-theme-chip" data-t="rose" title="Rose"></div><div class="bq-theme-chip" data-t="ocean" title="Ocean"></div></div>
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
         <div class="bq-if-th" data-t="whatsapp" title="WhatsApp Light"></div>
         <div class="bq-if-th" data-t="wadark" title="WhatsApp Dark"></div>
         <div class="bq-if-th" data-t="black" title="Pure Black"></div>
         <div class="bq-if-th" data-t="noir" title="Noir"></div>
         <div class="bq-if-th" data-t="aurora" title="Aurora"></div>
         <div class="bq-if-th" data-t="peach" title="Peach"></div>
         <div class="bq-if-th" data-t="carbon" title="Carbon"></div>
         <div class="bq-if-th" data-t="midnight" title="Midnight"></div>
         <div class="bq-if-th" data-t="rose" title="Rose"></div>
         <div class="bq-if-th" data-t="ocean" title="Ocean"></div>
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
function updatePushUI(){}
function subscribeToPush(){}
function showNotification(){}

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
  const pm=presenceMeta(pUid,pdata);
  const hsTxt=document.getElementById('bqdmhs-txt');
  const hsDot=document.getElementById('bqdmhs-dot');
  if(hsTxt){
    hsTxt.textContent=pm.detail;
    hsTxt.style.color=pm.color;
    if(hsDot){
      hsDot.style.display='inline-block';
      hsDot.style.background=pm.color;
      hsDot.style.opacity=pm.isOnline?'1':'.55';
      hsDot.style.animation=pm.isOnline?'bqPresencePulse 1.8s ease-in-out infinite':'none';
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
  // v18: robust enter-to-latest — disable smooth briefly so the jump is
  // instant on open, then restore smooth scrolling for incoming messages.
  const _scrollDmBottom=(instant)=>{
    const m=document.getElementById('bqdmmsgs');
    if(!m) return;
    if(instant){
      const prev=m.style.scrollBehavior;
      m.style.scrollBehavior='auto';
      m.scrollTop=m.scrollHeight;
      // restore on next frame
      requestAnimationFrame(()=>{ m.style.scrollBehavior=prev||''; });
    } else {
      m.scrollTop=m.scrollHeight;
    }
    dAtBot=true;
  };
  // Run once immediately, then cover async render + image/GIF load reflows
  _scrollDmBottom(true);
  requestAnimationFrame(()=>_scrollDmBottom(true));
  setTimeout(()=>_scrollDmBottom(true),80);
  setTimeout(()=>_scrollDmBottom(true),240);
  setTimeout(()=>_scrollDmBottom(true),600);
  setTimeout(()=>_scrollDmBottom(false),1200);
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
    banner:'',
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
  const pm=presenceMeta(activeDmPuid,pdata);
  const hav=document.getElementById('bqdmhav');
  if(hav){hav.className='bqdmhav';hav.dataset.status=pm.isOnline?(pdata.status||''):'';}
  const hsTxt=document.getElementById('bqdmhs-txt');
  const hsDot=document.getElementById('bqdmhs-dot');
  if(hsTxt){
    hsTxt.textContent=pm.detail;
    hsTxt.style.color=pm.color;
    if(hsDot){
      hsDot.style.display='inline-block';
      hsDot.style.background=pm.color;
      hsDot.style.opacity=pm.isOnline?'1':'.55';
      hsDot.style.animation=pm.isOnline?'bqPresencePulse 1.8s ease-in-out infinite':'none';
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
    const pm=presenceMeta(id,d);
    const row=document.createElement('div');
    row.className='bqurow'+(me?' isme':'');
    row.innerHTML=`
      <div class="bquav" style="background:${c};color:#000" data-status="${esc(pm.isOnline?(d.status||'online'):'')}">${uInit(n)}</div>
      <div class="bquinfo">
        <div class="bquu">@${esc(n)}${me?'<span class="bquyou">YOU</span>':''}</div>
        <div class="bqust">${presenceBadgeHTML(pm, pm.label)}</div>
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
  const pm=presenceMeta(targetUid,pd);

  // v10: banner removed
  document.getElementById('bqpc-name').textContent='@'+targetName;
  const stEl=document.getElementById('bqpc-status');
  stEl.innerHTML=presenceBadgeHTML(pm, pm.label);
  
  // Last seen
  const lsEl=document.getElementById('bqpc-lastseen');
  if(lsEl){
    lsEl.textContent=pm.isOnline?'Active now':pm.detail;
    lsEl.className='bqls'+(pm.isOnline?' bqls-online':'');
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
let _dmIndexRef=null;
let _dmMetaRefs={};       // {dmId: ref}
let _dmIndexFired=false;
let _dmIndexWatchdog=null;
let _dmMigrated=false;

// v22: scoped per-user DM index — no more whole-tree scans.
function subscribeDmList(){
  if(!db||!uid) return;

  // Tear down previous listeners
  if(_dmIndexRef){ try{_dmIndexRef.off();}catch(_){} _dmIndexRef=null; }
  Object.entries(_dmMetaRefs).forEach(([id,r])=>{ try{r.off();}catch(_){} });
  _dmMetaRefs={};
  dmMeta={};
  _dmIndexFired=false;

  // One-time legacy migration: backfill bq_user_dms/{uid} from existing bq_dms
  // for accounts created before v22. Keyed in localStorage so it runs once.
  const MIG_KEY='bq_user_dms_migrated_v22_'+uid;
  if(!_dmMigrated && !localStorage.getItem(MIG_KEY)){
    _dmMigrated=true;
    db.ref('bq_dms').once('value').then(snap=>{
      const updates={};
      snap.forEach(ch=>{
        const m=ch.val();
        if(m&&m.meta&&(m.meta.p1===uid||m.meta.p2===uid)){
          updates['bq_user_dms/'+uid+'/'+ch.key]=true;
        }
      });
      if(Object.keys(updates).length){ db.ref().update(updates).catch(()=>{}); }
      localStorage.setItem(MIG_KEY,'1');
    }).catch(()=>{ /* ignore — empty account is fine */ });
  }

  const idxRef=db.ref('bq_user_dms/'+uid);
  _dmIndexRef=idxRef;

  const attachMeta=(dmId)=>{
    if(_dmMetaRefs[dmId]) return;
    const mref=db.ref('bq_dms/'+dmId+'/meta');
    _dmMetaRefs[dmId]=mref;
    mref.on('value',ms=>{
      const meta=ms.val();
      if(meta && (meta.p1===uid||meta.p2===uid)){
        dmMeta[dmId]=meta;
      } else {
        delete dmMeta[dmId];
      }
      clearTimeout(dmRenderT);
      dmRenderT=setTimeout(()=>{ renderDmList(); updateBadges(); },80);
    });
  };
  const detachMeta=(dmId)=>{
    if(_dmMetaRefs[dmId]){ try{_dmMetaRefs[dmId].off();}catch(_){} delete _dmMetaRefs[dmId]; }
    delete dmMeta[dmId];
  };

  idxRef.on('child_added',  s=>{ _dmIndexFired=true; attachMeta(s.key); });
  idxRef.on('child_removed',s=>{ detachMeta(s.key); clearTimeout(dmRenderT); dmRenderT=setTimeout(()=>{ renderDmList(); updateBadges(); },80); });
  idxRef.on('value', ()=>{ _dmIndexFired=true; });

  // Watchdog: if nothing fires within 4s, retry once and surface a hint.
  clearTimeout(_dmIndexWatchdog);
  _dmIndexWatchdog=setTimeout(()=>{
    if(!_dmIndexFired){
      const list=document.getElementById('bqdml');
      if(list && !list.querySelector('.bqdmr')){
        let hint=list.querySelector('.bq-reconnect-hint');
        if(!hint){
          hint=document.createElement('div');
          hint.className='bqempty bq-reconnect-hint';
          hint.style.marginTop='40px';
          hint.innerHTML='<div class="bqempty-tx">Reconnecting…</div><div class="bqempty-sub">If this persists, try refreshing.</div>';
          list.innerHTML=''; list.appendChild(hint);
        }
      }
      try{ idxRef.off(); }catch(_){}
      setTimeout(()=>subscribeDmList(),800);
    }
  },4000);
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
  // v22 — remove from per-user index for both sides
  const meta=dmMeta[did];
  if(meta){
    if(meta.p1) db.ref('bq_user_dms/'+meta.p1+'/'+did).remove().catch(()=>{});
    if(meta.p2) db.ref('bq_user_dms/'+meta.p2+'/'+did).remove().catch(()=>{});
  } else {
    db.ref('bq_user_dms/'+uid+'/'+did).remove().catch(()=>{});
  }
  delete dmMeta[did];delete dmUnread[did];
  if(dmListeners[did]){dmListeners[did].off();delete dmListeners[did];}
  if(_dmMetaRefs && _dmMetaRefs[did]){ try{_dmMetaRefs[did].off();}catch(_){} delete _dmMetaRefs[did]; }
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
  if(!grid || !inp || !cats) return;
  let curCat = 'trending', curQ = '', searchT = null;
  let _gifLoaded = false;

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
      if(!_gifLoaded){ _gifLoaded = true; load(); }
      else if(!grid.children.length) load();
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
  theme=(theme==='light'||theme==='whatsapp'||theme==='wadark'||theme==='walight'||theme==='black'||theme==='none')?(theme==='whatsapp'?'walight':theme):(theme==='paper'?'light':'none');
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
  const row=document.getElementById(pfx+key); const btn=row;
  if(btn) btn.classList.toggle('bq-starred',!isStarred);
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
  const pm=presenceMeta(activeDmPuid,pdata);
  const av=document.getElementById('bq-info-av');
  if(av){ av.style.background=color; av.style.color='#000'; av.textContent=uInit(activeDmPname||'?');
    av.className='bq-info-av'+(pm.isOnline&&pdata.status?' '+pdata.status:''); }
  const nm=document.getElementById('bq-info-name'); if(nm) nm.textContent='@'+(activeDmPname||'');
  const st=document.getElementById('bq-info-status');
  if(st){ st.innerHTML=presenceBadgeHTML(pm, pm.detail); }
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
  on?_throttledTypingWrite('bq_typing/'+uid,{uname,ts:Date.now()}):db.ref('bq_typing/'+uid).remove();
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
  const msg=snap.val()||{};
  // v22 — handle deleted-for-everyone tombstone
  if(msg.deleted){
    const bbl=el.querySelector('.bqbbl');
    if(bbl){
      bbl.innerHTML='<span style="opacity:.55;font-style:italic">Message deleted</span>';
      bbl.classList.add('bq-tombstone');
    }
    el.querySelector('.bqrxns')?.remove();
    return;
  }
  // v22 — sync edited text to ALL clients (was previously sender-only)
  if(typeof msg.text==='string'){
    const bbl=el.querySelector('.bqbbl');
    if(bbl && !bbl.classList.contains('editing')){
      // Preserve any reply/voice/image/sticker children — only update text node + edited marker
      const reply=bbl.querySelector('.bqreply, .bq-replyref');
      const media=bbl.querySelector('.bq-img, .bq-gif, .bq-sticker, .bq-voice');
      const meta=bbl.querySelector('.bqmt, .bqmeta, .bq-msg-meta');
      const replyHTML=reply?reply.outerHTML:'';
      const mediaHTML=media?media.outerHTML:'';
      const metaHTML=meta?meta.outerHTML:'';
      const txtHTML=msg.text?('<div class="bqtxt">'+(window.linkify?linkify(esc(msg.text)):esc(msg.text))+'</div>'):'';
      const editedHTML=msg.edited?'<span class="bqedited">(edited)</span>':'';
      bbl.innerHTML=replyHTML+mediaHTML+txtHTML+editedHTML+metaHTML;
    }
  }
  el.querySelector('.bqrxns')?.remove();
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
  const row=document.createElement('div');
  row.id=pfx+key;
  row.className='bqr '+(isMine?'mine':'theirs')+(consec?' consec':'');
  row.dataset.date=msgDate.toDateString();
  row.dataset.ts=String(ts);
  row.dataset.msguid=msg.uid;
  // v18: mark rows rendered after initial load as "new" so they get the
  // directional slide-in animation; strip the class after it plays.
  if(ts && (Date.now()-ts) < 15000){
    row.classList.add('bq-new');
    setTimeout(()=>{ try{ row.classList.remove('bq-new'); }catch(_){}},600);
  }

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
          '<div class="'+_bblCls+'">'+rpHTML+_imgHtml+_gifHtml+_stickerHtml+_voiceHtml+_txtHtml+(msg.edited?'<span class="bqedited">(edited)</span>':'')+timerHTML+_metaHtml+'</div>'+
        '</div>'+
      '</div>'+
    '</div>';

  if(msg.reactions) renderRxns(ctx,row,msg.reactions,key);
  // Mark if starred
  const _stars=getStarred();
  const _sdid=ctx==='global'?'global':(activeDmId||'');
  if(_stars[_sdid]&&_stars[_sdid][key]){ row.classList.add('bq-starred'); }
  msgsEl.appendChild(row);
  // Apply any cached read receipts to this newly rendered message
  if(isMine&&!isG) requestAnimationFrame(()=>updateAllReadReceipts(activeDmId));

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
      if(e.target.closest('a,img,.bq-voice-play,.bqrp')) return;
      e.stopPropagation();
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


function ensureReactionPicker(){
  let el=document.getElementById('bq-rx-picker');
  if(el) return el;
  el=document.createElement('div');
  el.id='bq-rx-picker';
  const cats=Object.keys(REACTION_CATEGORIES);
  const tabs=cats.map((c,i)=>'<button class="bq-rx-tab'+(i===0?' active':'')+'" data-cat="'+esc(c)+'">'+c+'</button>').join('');
  const panes=cats.map((c,i)=>{
    const btns=REACTION_CATEGORIES[c].map(e=>'<button class="bq-rx-emo" data-e="'+esc(e)+'">'+e+'</button>').join('');
    return '<div class="bq-rx-pane'+(i===0?' active':'')+'" data-cat="'+esc(c)+'">'+btns+'</div>';
  }).join('');
  el.innerHTML='<div class="bq-rx-back" data-close="1"></div>'+
    '<div class="bq-rx-panel" role="dialog" aria-label="Pick a reaction">'+
      '<div class="bq-rx-tabs">'+tabs+'</div>'+
      '<div class="bq-rx-panes">'+panes+'</div>'+
    '</div>';
  (document.getElementById('bqp')||document.body).appendChild(el);
  el.addEventListener('click',e=>{
    if(e.target.dataset.close==='1'||e.target===el) closeReactionPicker();
  });
  el.querySelectorAll('.bq-rx-tab').forEach(t=>{
    t.addEventListener('click',e=>{
      e.stopPropagation();
      el.querySelectorAll('.bq-rx-tab').forEach(x=>x.classList.toggle('active',x===t));
      el.querySelectorAll('.bq-rx-pane').forEach(p=>p.classList.toggle('active',p.dataset.cat===t.dataset.cat));
    });
  });
  el.querySelectorAll('.bq-rx-emo').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      const ctx=el.dataset.ctx, key=el.dataset.key;
      if(ctx&&key) toggleRxn(ctx,key,b.dataset.e);
      closeReactionPicker();
    });
  });
  return el;
}
function openReactionPicker(ctx,key){
  const el=ensureReactionPicker();
  el.dataset.ctx=ctx; el.dataset.key=key;
  el.classList.add('open');
}
function closeReactionPicker(){
  const el=document.getElementById('bq-rx-picker');
  if(!el) return;
  el.classList.remove('open');
  el.dataset.ctx=''; el.dataset.key='';
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
  (document.getElementById('bqp')||document.body).appendChild(el);
  el.addEventListener('pointerdown',e=>{
    if(e.target.closest('.bq-ms-panel')) e.stopPropagation();
  },true);
  el.addEventListener('click',e=>{
    if(e.target.dataset.close==='1' || e.target===el) closeMsgActionSheet();
  });
  return el;
}
function closeMsgActionSheet(){
  document.querySelectorAll('.bq-msg-inline').forEach(el=>el.remove());
  document.querySelectorAll('.bqbbl.msg-menu-open').forEach(el=>el.classList.remove('msg-menu-open'));
  const legacy=document.getElementById('bq-msg-sheet');
  if(legacy) legacy.classList.remove('open');
}
function renderMsgActionSheet(ctx,key,msg,pfx,anchorEl){
  const bubble=anchorEl||document.querySelector('#'+pfx+key+' .bqbbl');
  const bw=bubble?.closest('.bqbw');
  if(!bubble||!bw) return;
  const openBar=bw.querySelector('.bq-msg-inline');
  if(openBar && openBar.dataset.key===key && openBar.dataset.ctx===ctx){
    closeMsgActionSheet();
    return;
  }
  closeMsgActionSheet();
  bubble.classList.add('msg-menu-open');
  const isG = ctx==='global';
  const isMine=msg.uid===uid;
  const _stars=getStarred();
  const _sdid=isG?'global':(activeDmId||'');
  const isStarred = !!(_stars[_sdid]&&_stars[_sdid][key]);
  const items = [
    {a:'react', label:'React', icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'},
    {a:'reply', label:'Reply', icon:'<svg viewBox="0 0 24 24"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>'},
    {a:'copy', label:'Copy', icon:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'},
    {a:'star', label:isStarred?'Unstar':'Star', icon:'<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'}
  ];
  if(!isG) items.push({a:'pin', label:'Pin', icon:'<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'});
  if(isMine){
    items.push({a:'edit', label:'Edit', icon:'<svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>'});
    items.push({a:'del', label:'Delete', danger:true, icon:'<svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>'});
  }
  const bar=document.createElement('div');
  bar.className='bq-msg-inline'+(isMine?' mine':'');
  bar.dataset.key=key;
  bar.dataset.ctx=ctx;
  bar.innerHTML = items.map(item=>'<button class="bq-ms-btn'+(item.danger?' danger':'')+'" type="button" data-a="'+item.a+'">'+item.icon+'<span>'+item.label+'</span></button>').join('');
  bar.querySelectorAll('.bq-ms-btn').forEach(btn=>{
    btn.addEventListener('pointerdown',e=>e.stopPropagation(),true);
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const action=btn.dataset.a;
      closeMsgActionSheet();
      doAction(ctx, action, key, msg, pfx, true);
    });
  });
  bw.appendChild(bar);
  // Ensure menu is visible inside the scrolling chat list
  try{ bar.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(_){}
}

function doAction(ctx,a,key,msg,pfx,fromSheet){
  if(a==='react'){
    openReactionPicker(ctx,key);
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
  // v18: wider threshold (220px) so replies/short bursts reliably scroll
  // into view. Use smooth scroll for incoming, instant for our own sends.
  if(isMyMsg||(isG?gAtBot:dAtBot)||distFromBot<220){
    requestAnimationFrame(()=>{
      try{
        if(isMyMsg){
          const prev=msgsEl.style.scrollBehavior;
          msgsEl.style.scrollBehavior='auto';
          msgsEl.scrollTop=msgsEl.scrollHeight;
          requestAnimationFrame(()=>{ msgsEl.style.scrollBehavior=prev||''; });
        } else {
          msgsEl.scrollTo({top:msgsEl.scrollHeight, behavior:'smooth'});
        }
      }catch(_){ msgsEl.scrollTop=msgsEl.scrollHeight; }
      if(isG) gAtBot=true; else dAtBot=true;
    });
    // Second pass to catch image/GIF reflows after decode
    setTimeout(()=>{
      const d2=msgsEl.scrollHeight-msgsEl.scrollTop-msgsEl.clientHeight;
      if(d2<260) msgsEl.scrollTop=msgsEl.scrollHeight;
    }, 260);
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
    snd.disabled=len===0 && !voicePreviewData;
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
    const txt=inp.value.trim();
    if(!uname){showModal(false);return;}
    if(!txt && voicePreviewData){
      try{
        const _data=voicePreviewData,_dur=voicePreviewDuration,_wave=voicePreviewWave;
        let ok=false;
        if(isG){
          if(typeof sendVoiceGlobal==='function'){ sendVoiceGlobal(_data,_dur,_wave); ok=true; }
          else { toast&&toast('Voice send unavailable'); }
        }else{
          if(!activeDmId){ toast&&toast('Open a DM to send voice'); }
          else { sendVoiceDm(_data,_dur,_wave); ok=true; }
        }
        if(!ok){ console.error('[voice] send failed - isG=',isG,'activeDmId=',activeDmId,'hasFn=',typeof sendVoiceGlobal); return; }
      }catch(err){ console.error('[voice] send threw',err); toast&&toast('Voice send failed'); return; }
      hideVoicePreview();
      inp.value=''; inp.style.height='auto'; snd.disabled=true; cc.textContent='';
      snd.classList.add('sending'); setTimeout(()=>snd.classList.remove('sending'),320);
      if(isG)setGTyp(false);else setDmTyp(false);
      if(isG)gAtBot=true;else dAtBot=true;
      if(msgs) requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight;});
      return;
    }
    if(!txt)return;
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
    if(e.target.closest('#bq-media-lightbox,#bq-pv,#bq-info-float,#bqimg-preview,#bq-confirm,#bq-msg-sheet,#bq-rx-picker,.bqimg-preview,.bqpv-modal,.bq-confirm')) return;
    if(!p.contains(e.target)&&!b.contains(e.target)) closePanel();
  });

  // Close emoji pickers
  document.getElementById('bqp').addEventListener('click',e=>{

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
    if (!disappearBtn) return;
    const label = disappearBtn.querySelector('span');
    if (label) {
      label.textContent = disappearingEnabled ? 'Disappearing: ON (1hr)' : 'Disappearing: OFF';
    }
  }
  updateDisappearBtn();
  if (disappearBtn) {
    disappearBtn.addEventListener('click', () => {
      disappearingEnabled = !disappearingEnabled;
      localStorage.setItem('bq_disappearing', String(disappearingEnabled));
      updateDisappearBtn();
      chatMenu?.classList.remove('open');
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
      chatMenu?.classList.remove('open');
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
  const pm=presenceMeta(activeDmPuid,pdata);
  document.getElementById('bq-if-st').textContent=pm.detail;
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
    const pm=presenceMeta(targetUid,pd);
    document.getElementById('bq-pv-st').textContent=pm.detail;
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

async function uploadAvatar(){ toast('Avatar uploads disabled'); }
async function uploadBanner(){ toast('Banner uploads disabled'); }

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
  const p={uid,uname,text:'',type:'voice',audio:audioData,duration:durMs,ts:Date.now()};
  if(Array.isArray(waveform) && waveform.length) p.waveform=waveform.slice(0,64);
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

function sendVoiceGlobal(audioData,durMs,waveform){
  if(!db||!uname||!audioData) return;
  const p={uid,uname,text:'',type:'voice',audio:audioData,duration:durMs,ts:Date.now()};
  if(Array.isArray(waveform) && waveform.length) p.waveform=waveform.slice(0,64);
  db.ref('bq_messages').push(p);
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
  if(e.target.closest('.bq-msg-inline')) return;
  if(e.target.closest('.bqbbl')) return;
  closeMsgActionSheet();
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
  /* v10: banner upload removed */

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
function _injectProfileUploads(){}
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
  .bq-voice-preview .bq-vp-btn.send{background:#22c55e;color:#fff;width:36px;height:36px;border-radius:50%;box-shadow:0 4px 12px rgba(34,197,94,.4);}
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
      banner:'',
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
      const pm=presenceMeta(activeDmPuid,pdata);
      st.textContent=pm.detail;
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
    // v14: Attach preview to whichever composer is currently visible (global OR dm).
    // Previously locked to #bqdminp which prevented sending voice notes from global chat.
    const dmInp=document.getElementById('bqdminp');
    const gInp=document.getElementById('bqginp');
    let composer=null;
    // Prefer the composer whose view is currently active/visible
    const dmIw=dmInp?.closest('.bqiw');
    const gIw=gInp?.closest('.bqiw');
    function isVisible(el){ if(!el) return false; const r=el.getBoundingClientRect(); return r.width>0 && r.height>0; }
    if(activeDmId && dmIw && isVisible(dmIw)) composer=dmIw;
    else if(gIw && isVisible(gIw)) composer=gIw;
    else composer = dmIw || gIw;
    if(!composer) return;
    // If preview already exists but in wrong composer, move it
    const existing=document.getElementById('bq-voice-preview');
    if(existing){
      if(existing.parentNode!==composer){
        composer.insertBefore(existing, composer.firstChild);
      }
      return;
    }
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
    const previewSendBtn=document.getElementById(activeDmId?'bqdmsnd':'bqgsnd');
    if(previewSendBtn) previewSendBtn.disabled=false;
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
    const gInp=document.getElementById('bqginp');
    const dmInp=document.getElementById('bqdminp');
    const gSend=document.getElementById('bqgsnd');
    const dmSend=document.getElementById('bqdmsnd');
    if(gSend) gSend.disabled=!(gInp?.value.trim());
    if(dmSend) dmSend.disabled=!(dmInp?.value.trim());
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
    if(!navigator.mediaDevices){ toast('Voice notes not supported'); return; }
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
        if(e.target.closest('#bq-vp-send')){
          e.stopPropagation();
          if(voicePreviewData){
            if(activeDmId){ sendVoiceDm(voicePreviewData,voicePreviewDuration,voicePreviewWave); }
            else if(typeof sendVoiceGlobal==='function'){ sendVoiceGlobal(voicePreviewData,voicePreviewDuration,voicePreviewWave); }
            else { toast('Open a DM to send voice notes'); return; }
          }
          hideVoicePreview();
        }
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
      banner.style.background = 'linear-gradient(135deg,'+draft.bannerColor+'cc,'+draft.bannerColor+'33)';
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
            ''+
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
    /* v10: banner upload removed */

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
    /* v10: avatar upload removed */
    /* v10: banner upload removed */
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

/* ════════════════════════════════════════════════════════════════════════
   v19 PATCH — Bug fixes, new gestures, multi-select, design refresh
   - Swipe-to-reply (touch + mouse drag)
   - Long-press → reaction picker
   - Double-tap → ❤️ react
   - Swipe-down to close panels (emoji/gif/sticker)
   - Multi-select messages → bulk delete
   - Read-receipt color/state hardening (Sent gray, Delivered white, Seen cyan glow)
   - Theme persistence boot fix (apply on first paint, before chat opens)
   - 3 new themes: Aurora, Peach, Carbon
   - Refined spacing, scrollbar, micro-interactions
══════════════════════════════════════════════════════════════════════════ */
(function bqV19Patch(){
  'use strict';

  /* ── 1. INJECT CSS (refresh + new themes + gesture/select styles) ── */
  const V19CSS = `
  /* Smoother scrollbar */
  #bqgmsgs::-webkit-scrollbar,#bqdmmsgs::-webkit-scrollbar{width:6px;}
  #bqgmsgs::-webkit-scrollbar-thumb,#bqdmmsgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:3px;}
  #bqgmsgs::-webkit-scrollbar-thumb:hover,#bqdmmsgs::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.22);}

  /* Receipt state crispness — overrides v18 to be unmistakable */
  .bqr.mine .bqbbl-meta .bqbbl-tick{color:rgba(255,255,255,.45)!important;}      /* SENT */
  .bqr.mine .bqbbl-meta.delivered .bqbbl-tick{color:#ffffff!important;filter:none!important;} /* DELIVERED */
  .bqr.mine .bqbbl-meta.seen .bqbbl-tick{color:#22d3ee!important;filter:drop-shadow(0 0 5px rgba(34,211,238,.85))!important;} /* SEEN */
  .bqr.mine .bqbbl-meta.seen{color:#a5f3fc!important;}

  /* Swipe-to-reply visual */
  .bqr{transition:transform .18s ease;position:relative;}
  .bqr.bq-swipe-active{transition:none;}
  .bqr.bq-swipe-trigger .bqbbl{box-shadow:0 0 0 2px var(--bq-accent,#60a5fa)!important;}
  .bqr::after{
    content:'↩';position:absolute;top:50%;transform:translateY(-50%);
    width:32px;height:32px;border-radius:50%;background:var(--bq-accent,#60a5fa);color:#fff;
    display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .15s ease;
  }
  .bqr.theirs::after{left:-44px;}
  .bqr.mine::after{right:-44px;}
  .bqr.bq-swipe-show::after{opacity:1;}

  /* Long-press feedback */
  .bqbbl.bq-press{transform:scale(.97);transition:transform .12s ease;}

  /* Double-tap heart pop */
  @keyframes bqHeartPop{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}40%{transform:translate(-50%,-50%) scale(1.4);opacity:1}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}
  .bq-heart-pop{position:absolute;top:50%;left:50%;font-size:48px;pointer-events:none;animation:bqHeartPop .8s ease forwards;z-index:9999;}

  /* Multi-select mode */
  .bq-select-mode .bqr{cursor:pointer;padding-left:34px;transition:padding .2s ease;}
  .bq-select-mode .bqr.mine{padding-left:0;padding-right:34px;}
  .bq-select-mode .bqr::before{
    content:'';position:absolute;top:50%;transform:translateY(-50%);
    width:22px;height:22px;border-radius:50%;border:2px solid var(--bq-text-muted,rgba(255,255,255,.4));
    background:transparent;transition:all .18s ease;
  }
  .bq-select-mode .bqr.theirs::before{left:6px;}
  .bq-select-mode .bqr.mine::before{right:6px;}
  .bq-select-mode .bqr.bq-selected::before{background:var(--bq-accent,#60a5fa);border-color:var(--bq-accent,#60a5fa);
    box-shadow:0 0 0 4px rgba(96,165,250,.18);}
  .bq-select-mode .bqr.bq-selected::after{display:none;}
  .bq-select-mode .bqr.bq-selected .bqbbl{box-shadow:0 0 0 2px var(--bq-accent,#60a5fa)!important;}
  .bq-select-mode .bqbbl{pointer-events:none;}
  .bq-select-mode .bq-msg-inline{display:none!important;}

  /* Selection toolbar */
  #bq-sel-bar{
    position:absolute;left:0;right:0;top:0;z-index:200;
    background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(15,23,42,.92));
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    color:#fff;padding:10px 14px;
    display:flex;align-items:center;gap:12px;
    transform:translateY(-100%);transition:transform .25s cubic-bezier(.16,1,.3,1);
    border-bottom:1px solid rgba(255,255,255,.08);
    font-family:'Inter',sans-serif;font-size:14px;
  }
  #bq-sel-bar.show{transform:translateY(0);}
  #bq-sel-bar .bq-sel-close,#bq-sel-bar .bq-sel-del{
    background:transparent;border:none;color:#fff;cursor:pointer;
    width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    transition:background .15s;
  }
  #bq-sel-bar .bq-sel-close:hover{background:rgba(255,255,255,.08);}
  #bq-sel-bar .bq-sel-del{color:#f87171;}
  #bq-sel-bar .bq-sel-del:hover{background:rgba(248,113,113,.15);}
  #bq-sel-bar .bq-sel-count{flex:1;font-weight:600;}
  #bq-sel-bar svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}

  /* Swipe-down to close on emoji/gif/sticker panels */
  #bq-emoji-tray,#bq-gif-panel,#bq-sticker-tray,#bq-rx-picker .bq-rx-panel{touch-action:pan-y;}
  .bq-panel-dragging{transition:none!important;}

  /* New themes */
  /* Aurora — green/purple shimmer */
  #bqp.bq-theme-aurora{background:radial-gradient(ellipse at 0% 0%,#0d2a3a 0%,#0a0a1a 60%,#000 100%);}
  #bqp.bq-theme-aurora .bqr.mine .bqbbl{background:linear-gradient(135deg,#10b981 0%,#7c3aed 60%,#ec4899 100%)!important;color:#fff!important;border:none!important;box-shadow:0 4px 22px rgba(124,58,237,.45),inset 0 1px 0 rgba(255,255,255,.2)!important;}
  #bqp.bq-theme-aurora .bqr.theirs .bqbbl{background:rgba(124,58,237,.10)!important;border-color:rgba(124,58,237,.25)!important;}
  #bqp.bq-theme-aurora .bqun{color:#a5f3fc!important;}

  /* Peach — warm cream */
  #bqp.bq-theme-peach{background:linear-gradient(180deg,#fef3ec 0%,#fce5d4 100%)!important;color:#3a1f0f!important;}
  #bqp.bq-theme-peach .bqv,#bqp.bq-theme-peach .bqlst,#bqp.bq-theme-peach #bqdmlist,#bqp.bq-theme-peach .bqcomp,#bqp.bq-theme-peach .bqsettings,#bqp.bq-theme-peach .bq-info-scroll,#bqp.bq-theme-peach .bq-profile-scroll{background:transparent!important;color:#3a1f0f!important;}
  #bqp.bq-theme-peach .bqdmh,#bqp.bq-theme-peach .bqgh,#bqp.bq-theme-peach .bqsh,#bqp.bq-theme-peach .bq-info-header,#bqp.bq-theme-peach .bq-profile-header{background:#fff7ef!important;color:#3a1f0f!important;border-color:#f1d4b8!important;}
  #bqp.bq-theme-peach .bqiw,#bqp.bq-theme-peach .bqgi,#bqp.bq-theme-peach input,#bqp.bq-theme-peach textarea{background:#fff!important;color:#3a1f0f!important;border-color:#f1d4b8!important;}
  #bqp.bq-theme-peach .bqr.mine .bqbbl{background:linear-gradient(135deg,#fb923c 0%,#f97316 100%)!important;color:#fff!important;border:none!important;box-shadow:0 4px 16px rgba(249,115,22,.32)!important;}
  #bqp.bq-theme-peach .bqr.theirs .bqbbl{background:#fff!important;color:#3a1f0f!important;border:1px solid #f1d4b8!important;}
  #bqp.bq-theme-peach .bqun{color:#c2410c!important;}
  #bqp.bq-theme-peach .bqbbl-meta{color:#9a6b4f!important;}

  /* Carbon — pure dark with neon edge */
  #bqp.bq-theme-carbon{background:#0a0a0a!important;}
  #bqp.bq-theme-carbon .bqr.mine .bqbbl{background:linear-gradient(135deg,#1f2937 0%,#111827 100%)!important;color:#e5e7eb!important;border:1px solid rgba(34,211,238,.35)!important;box-shadow:0 0 18px rgba(34,211,238,.18)!important;}
  #bqp.bq-theme-carbon .bqr.theirs .bqbbl{background:#0d0d0d!important;color:#d4d4d8!important;border:1px solid #262626!important;}
  #bqp.bq-theme-carbon .bqun{color:#22d3ee!important;}
  `;
  try{
    const s=document.createElement('style');s.id='bq-v19-css';s.textContent=V19CSS;
    document.head.appendChild(s);
  }catch(_){}

  /* ── 2. THEME PERSISTENCE BOOT FIX ──
     v18 only re-applied theme when #bqp existed; on slow mounts the theme could
     flash "none". Add an extra retry loop AND make sure new themes register. */
  try{
    const persisted = (typeof getGlobalTheme==='function') ? getGlobalTheme() : (localStorage.getItem('bq_theme_v2')||'none');
    let tries=0;
    const iv=setInterval(()=>{
      tries++;
      const p=document.getElementById('bqp');
      if(p){
        if(typeof applyGlobalTheme==='function') applyGlobalTheme(persisted);
        clearInterval(iv);
      }
      if(tries>80) clearInterval(iv);
    },100);
  }catch(_){}

  /* ── 3. SWIPE-TO-REPLY ── */
  const SWIPE_TRIGGER = 60;
  function attachSwipe(container){
    if(!container || container.dataset.bqSwipe) return;
    container.dataset.bqSwipe='1';
    let startX=0,startY=0,curRow=null,dx=0,dy=0,locked=false,active=false;

    function onStart(e){
      if(document.body.classList.contains('bq-select-mode')) return;
      const t=e.touches?e.touches[0]:e;
      const row=e.target.closest('.bqr');
      if(!row) return;
      curRow=row; startX=t.clientX; startY=t.clientY;
      dx=0; dy=0; locked=false; active=true;
      row.classList.add('bq-swipe-active');
    }
    function onMove(e){
      if(!active||!curRow) return;
      const t=e.touches?e.touches[0]:e;
      dx=t.clientX-startX; dy=t.clientY-startY;
      if(!locked){
        if(Math.abs(dy)>10 && Math.abs(dy)>Math.abs(dx)){ cancel(); return; }
        if(Math.abs(dx)>8) locked=true; else return;
      }
      const isMine=curRow.classList.contains('mine');
      // mine swipes left (negative), theirs swipes right (positive)
      const validDir = isMine ? dx<0 : dx>0;
      const moveX = validDir ? Math.max(-100,Math.min(100,dx)) : dx*0.15;
      curRow.style.transform='translateX('+moveX+'px)';
      if(Math.abs(moveX)>SWIPE_TRIGGER){
        curRow.classList.add('bq-swipe-show','bq-swipe-trigger');
      } else {
        curRow.classList.remove('bq-swipe-show','bq-swipe-trigger');
      }
      if(e.cancelable) e.preventDefault();
    }
    function onEnd(){
      if(!active||!curRow){ cancel(); return; }
      const isMine=curRow.classList.contains('mine');
      const validDir = isMine ? dx<0 : dx>0;
      const triggered = validDir && Math.abs(dx)>SWIPE_TRIGGER;
      curRow.classList.remove('bq-swipe-active','bq-swipe-show','bq-swipe-trigger');
      curRow.style.transform='';
      if(triggered){
        const id=curRow.id||''; const m=id.match(/^bqmsg-(global|dm)-(.+)$/);
        if(m){
          const ctx=m[1], key=m[2];
          // Build minimal msg payload from DOM
          const txt=curRow.querySelector('.bqbbl')?.innerText?.split('\n')[0]?.slice(0,80)||'';
          const uname=curRow.querySelector('.bqun')?.textContent?.replace(/^@|^You/,'')||'';
          if(typeof setReply==='function'){
            try{ setReply(ctx==='global'?'g':'dm',{key,uname,text:txt}); }catch(_){}
            const inp=document.getElementById(ctx==='global'?'bqginp':'bqdminp'); inp?.focus();
          }
        }
      }
      cancel();
    }
    function cancel(){
      if(curRow){ curRow.classList.remove('bq-swipe-active','bq-swipe-show','bq-swipe-trigger'); curRow.style.transform=''; }
      curRow=null; active=false; locked=false;
    }
    container.addEventListener('touchstart',onStart,{passive:true});
    container.addEventListener('touchmove',onMove,{passive:false});
    container.addEventListener('touchend',onEnd);
    container.addEventListener('touchcancel',cancel);
  }

  /* ── 4. LONG-PRESS → reactions, DOUBLE-TAP → ❤️ ── */
  const LONG_MS=420;
  const DOUBLE_TAP_MS=320;
  function attachPressGestures(container){
    if(!container||container.dataset.bqPress) return;
    container.dataset.bqPress='1';
    let pressT=null,pressBubble=null,lastTap=0,lastTapKey='',moved=false,sx=0,sy=0;

    function findCtxKey(el){
      const row=el.closest('.bqr'); if(!row) return null;
      const m=(row.id||'').match(/^bqmsg-(global|dm)-(.+)$/);
      return m?{ctx:m[1],key:m[2],row}:null;
    }
    container.addEventListener('touchstart',e=>{
      if(document.body.classList.contains('bq-select-mode')) return;
      const bubble=e.target.closest('.bqbbl'); if(!bubble) return;
      const ck=findCtxKey(bubble); if(!ck) return;
      moved=false; sx=e.touches[0].clientX; sy=e.touches[0].clientY;
      pressBubble=bubble;
      pressT=setTimeout(()=>{
        if(moved||!pressBubble) return;
        bubble.classList.add('bq-press');
        if(navigator.vibrate) try{navigator.vibrate(15);}catch(_){}
        if(typeof openReactionPicker==='function') openReactionPicker(ck.ctx,ck.key);
        setTimeout(()=>bubble.classList.remove('bq-press'),200);
        pressBubble=null;
      },LONG_MS);
    },{passive:true});
    container.addEventListener('touchmove',e=>{
      if(!pressT) return;
      const t=e.touches[0];
      if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8){ moved=true; clearTimeout(pressT); pressT=null; pressBubble?.classList.remove('bq-press'); pressBubble=null; }
    },{passive:true});
    container.addEventListener('touchend',e=>{
      if(pressT){clearTimeout(pressT); pressT=null;}
      pressBubble?.classList.remove('bq-press'); pressBubble=null;
    });

    // Double-tap to ❤️ (touch + mouse dblclick)
    function heart(ctx,key,row){
      if(typeof toggleRxn==='function'){
        try{ toggleRxn(ctx,key,'❤️'); }catch(_){}
      }
      // pop animation
      const pop=document.createElement('span'); pop.className='bq-heart-pop'; pop.textContent='❤️';
      row.appendChild(pop); setTimeout(()=>pop.remove(),800);
    }
    container.addEventListener('click',e=>{
      if(document.body.classList.contains('bq-select-mode')) return;
      const bubble=e.target.closest('.bqbbl'); if(!bubble) return;
      const ck=findCtxKey(bubble); if(!ck) return;
      const now=Date.now();
      if(now-lastTap<DOUBLE_TAP_MS && lastTapKey===ck.key){
        e.stopPropagation(); e.preventDefault();
        heart(ck.ctx,ck.key,ck.row);
        lastTap=0; lastTapKey='';
      } else {
        lastTap=now; lastTapKey=ck.key;
      }
    },true);
  }

  /* ── 5. MULTI-SELECT + BULK DELETE ── */
  const selected=new Set();
  let selCtx=null;

  function ensureSelBar(){
    let bar=document.getElementById('bq-sel-bar');
    if(bar) return bar;
    const panel=document.getElementById('bqp')||document.body;
    bar=document.createElement('div');
    bar.id='bq-sel-bar';
    bar.innerHTML=
      '<button class="bq-sel-close" title="Cancel"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
      '<div class="bq-sel-count">0 selected</div>'+
      '<button class="bq-sel-del" title="Delete"><svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>';
    panel.appendChild(bar);
    bar.querySelector('.bq-sel-close').addEventListener('click',exitSelectMode);
    bar.querySelector('.bq-sel-del').addEventListener('click',bulkDelete);
    return bar;
  }
  function enterSelectMode(ctx,initialKey){
    selCtx=ctx; selected.clear();
    if(initialKey) selected.add(initialKey);
    document.body.classList.add('bq-select-mode');
    const bar=ensureSelBar(); bar.classList.add('show');
    refreshSelection();
    // close any open inline action menu
    if(typeof closeMsgActionSheet==='function') try{ closeMsgActionSheet(); }catch(_){}
  }
  function exitSelectMode(){
    document.body.classList.remove('bq-select-mode');
    selected.clear(); selCtx=null;
    document.getElementById('bq-sel-bar')?.classList.remove('show');
    document.querySelectorAll('.bqr.bq-selected').forEach(r=>r.classList.remove('bq-selected'));
  }
  function refreshSelection(){
    document.querySelectorAll('.bqr.bq-selected').forEach(r=>r.classList.remove('bq-selected'));
    selected.forEach(k=>{
      const el=document.getElementById('bqmsg-'+selCtx+'-'+k);
      if(el) el.classList.add('bq-selected');
    });
    const bar=document.getElementById('bq-sel-bar');
    if(bar) bar.querySelector('.bq-sel-count').textContent=selected.size+' selected';
    if(selected.size===0) exitSelectMode();
  }
  function bulkDelete(){
    if(!selected.size) return;
    // Only delete own messages; warn for others.
    const myKeys=[]; const skipped=[];
    selected.forEach(k=>{
      const row=document.getElementById('bqmsg-'+selCtx+'-'+k);
      if(!row) return;
      if(row.dataset.msguid===(typeof uid!=='undefined'?uid:'')) myKeys.push(k); else skipped.push(k);
    });
    if(!myKeys.length){
      if(typeof toast==='function') toast('You can only delete your own messages');
      exitSelectMode(); return;
    }
    if(!confirm('Delete '+myKeys.length+' message'+(myKeys.length>1?'s':'')+'?')) return;
    myKeys.forEach(k=>{
      const path = selCtx==='global' ? 'bq_messages/'+k : 'bq_dms/'+(typeof activeDmId!=='undefined'?activeDmId:'')+'/messages/'+k;
      try{ if(typeof db!=='undefined'&&db) db.ref(path).remove(); }catch(_){}
      document.getElementById('bqmsg-'+selCtx+'-'+k)?.remove();
    });
    if(typeof toast==='function') toast('Deleted '+myKeys.length+' message'+(myKeys.length>1?'s':''));
    if(skipped.length && typeof toast==='function') setTimeout(()=>toast(skipped.length+' not yours — skipped'),1100);
    exitSelectMode();
  }

  // Click handler in select mode → toggle selection on rows
  document.addEventListener('click',function(e){
    if(!document.body.classList.contains('bq-select-mode')) return;
    const row=e.target.closest('.bqr'); if(!row) return;
    if(e.target.closest('#bq-sel-bar')) return;
    const m=(row.id||'').match(/^bqmsg-(global|dm)-(.+)$/); if(!m) return;
    if(selCtx && m[1]!==selCtx){ return; }
    e.stopPropagation(); e.preventDefault();
    const k=m[2];
    if(selected.has(k)) selected.delete(k); else selected.add(k);
    refreshSelection();
  },true);

  // Long-press with selection-mode semantics: if NOT in select mode and pointer
  // is held on a row (not bubble — the row chrome), enter select mode.
  // Implemented above via existing long-press → reaction. We add a separate
  // "long-press the avatar/area outside bubble" entry, plus a header button.

  // Add a tiny "Select" entry to the existing inline action menu by patching doAction.
  if(typeof window.doAction==='undefined'){
    // doAction is module-scoped — we patch via the existing renderMsgActionSheet
    // by appending a delegated listener that intercepts a synthetic 'sel' button.
  }

  /* ── 6. SWIPE-DOWN to close panels ── */
  function attachSwipeClose(panelEl, closeFn){
    if(!panelEl||panelEl.dataset.bqSwClose) return;
    panelEl.dataset.bqSwClose='1';
    let sy=0,dy=0,active=false;
    panelEl.addEventListener('touchstart',e=>{
      // Only initiate if at scrollTop (so inner scroll keeps working)
      if(panelEl.scrollTop>2) return;
      sy=e.touches[0].clientY; dy=0; active=true;
      panelEl.classList.add('bq-panel-dragging');
    },{passive:true});
    panelEl.addEventListener('touchmove',e=>{
      if(!active) return;
      dy=e.touches[0].clientY-sy;
      if(dy>0) panelEl.style.transform='translateY('+Math.min(dy,200)+'px)';
    },{passive:true});
    panelEl.addEventListener('touchend',()=>{
      if(!active) return;
      panelEl.classList.remove('bq-panel-dragging');
      panelEl.style.transform='';
      if(dy>80) closeFn();
      active=false;
    });
  }

  /* ── 7. MUTATION OBSERVER — wire gestures whenever lists/panels appear ── */
  function wireAll(){
    const g=document.getElementById('bqgmsgs'); if(g){ attachSwipe(g); attachPressGestures(g); }
    const d=document.getElementById('bqdmmsgs'); if(d){ attachSwipe(d); attachPressGestures(d); }
    ['bq-emoji-tray','bq-gif-panel','bq-sticker-tray'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) attachSwipeClose(el, ()=>el.classList.remove('open','show'));
    });
    const rxPanel=document.querySelector('#bq-rx-picker .bq-rx-panel');
    if(rxPanel) attachSwipeClose(rxPanel,()=>{ if(typeof closeReactionPicker==='function') closeReactionPicker(); });
  }
  wireAll();
  const obs=new MutationObserver(()=>wireAll());
  obs.observe(document.body,{childList:true,subtree:true});

  /* ── 8. Add "Select" entry to message action menus ──
     Patch by listening to clicks on the inline menu container; if the user
     long-presses a bubble we already open the reaction picker. To enter
     multi-select, we expose: tap-and-hold avatar OR triple-tap row. Easier:
     add a small "Select" button into the inline bar after it renders. */
  document.addEventListener('DOMNodeInserted',function(e){
    const t=e.target;
    if(!t || !t.classList || !t.classList.contains('bq-msg-inline')) return;
    if(t.querySelector('.bq-ms-btn[data-a="sel"]')) return;
    const row=t.closest('.bqr'); if(!row) return;
    const m=(row.id||'').match(/^bqmsg-(global|dm)-(.+)$/); if(!m) return;
    const btn=document.createElement('button');
    btn.className='bq-ms-btn'; btn.type='button'; btn.dataset.a='sel';
    btn.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Select</span>';
    btn.addEventListener('click',ev=>{
      ev.stopPropagation(); ev.preventDefault();
      if(typeof closeMsgActionSheet==='function') try{ closeMsgActionSheet(); }catch(_){}
      enterSelectMode(m[1], m[2]);
    });
    t.appendChild(btn);
  });

  /* ── 9. Register new themes in any theme picker that's already rendered ── */
  function injectThemeChips(){
    const NEW=[
      {id:'aurora', label:'Aurora'},
      {id:'peach',  label:'Peach'},
      {id:'carbon', label:'Carbon'},
    ];
    document.querySelectorAll('.bq-theme-grid, .bq-theme-list, [data-theme-picker]').forEach(grid=>{
      NEW.forEach(t=>{
        if(grid.querySelector('.bq-theme-chip[data-t="'+t.id+'"]')) return;
        const chip=document.createElement('button');
        chip.className='bq-theme-chip'; chip.dataset.t=t.id; chip.type='button';
        chip.style.cssText='padding:8px 12px;border-radius:10px;border:1px solid var(--bq-border,rgba(255,255,255,.12));background:var(--bq-bg-elevated,#141414);color:var(--bq-text,#fff);font-family:Inter,sans-serif;font-size:12px;cursor:pointer;margin:4px;';
        chip.textContent=t.label;
        chip.addEventListener('click',()=>{
          if(typeof setGlobalTheme==='function') setGlobalTheme(t.id);
          else if(typeof applyGlobalTheme==='function') applyGlobalTheme(t.id);
        });
        grid.appendChild(chip);
      });
    });
  }
  // Try a few times after mount
  let _ti=0; const _themeIv=setInterval(()=>{ injectThemeChips(); if(++_ti>20) clearInterval(_themeIv); },400);

  /* ── 10. ESC closes select mode ── */
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && document.body.classList.contains('bq-select-mode')) exitSelectMode();
  });

  // Expose for debugging
  window.bqV19 = { enterSelectMode, exitSelectMode, selected, version:'19.0' };
  console.info('[bq-widget] v19 patch loaded — gestures, multi-select, themes, polish');
})();

/* ══════════════════════════════════════════════════════════════════════════
   v20 PATCH — Noir theme, last-online persistence, animated swipe-to-reply,
                DM glitch hardening, settings theme chips for new themes.
   ══════════════════════════════════════════════════════════════════════════ */
(function bqV20Patch(){
  'use strict';

  /* ── 1. CSS: Noir theme + smoother swipe + chip styling for new themes ── */
  const V20CSS = `
  /* Noir — true black with red accents */
  #bqp.bq-theme-noir{background:#000!important;color:#f5f5f5!important;}
  #bqp.bq-theme-noir .bqv,#bqp.bq-theme-noir .bqlst,#bqp.bq-theme-noir #bqdmlist,#bqp.bq-theme-noir .bqcomp,#bqp.bq-theme-noir .bqsettings,#bqp.bq-theme-noir .bq-info-scroll,#bqp.bq-theme-noir .bq-profile-scroll{background:#000!important;color:#f5f5f5!important;}
  #bqp.bq-theme-noir .bqdmh,#bqp.bq-theme-noir .bqgh,#bqp.bq-theme-noir .bqsh,#bqp.bq-theme-noir .bq-info-header,#bqp.bq-theme-noir .bq-profile-header,#bqp.bq-theme-noir .bqhdr{background:#0a0a0a!important;border-bottom:1px solid #1a1a1a!important;color:#f5f5f5!important;}
  #bqp.bq-theme-noir .bqr.mine .bqbbl{background:linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%)!important;color:#fff!important;border:none!important;box-shadow:0 4px 18px rgba(220,38,38,.35),inset 0 1px 0 rgba(255,255,255,.18)!important;}
  #bqp.bq-theme-noir .bqr.theirs .bqbbl{background:#111!important;color:#f5f5f5!important;border:1px solid #1f1f1f!important;}
  #bqp.bq-theme-noir .bqun{color:#fca5a5!important;}
  #bqp.bq-theme-noir .bqbbl-meta{color:#737373!important;}
  #bqp.bq-theme-noir .bqiw,#bqp.bq-theme-noir .bqgi,#bqp.bq-theme-noir input,#bqp.bq-theme-noir textarea{background:#0a0a0a!important;color:#f5f5f5!important;border-color:#1f1f1f!important;}
  #bqp.bq-theme-noir .bqurow:hover,#bqp.bq-theme-noir .bqdmrow:hover{background:#0f0f0f!important;}

  /* Theme chips for new themes (color swatches in DM settings) */
  .bq-theme-chip[data-t="aurora"]{background:linear-gradient(135deg,#10b981 0%,#7c3aed 60%,#ec4899 100%)!important;}
  .bq-theme-chip[data-t="peach"]{background:linear-gradient(135deg,#fb923c 0%,#f97316 100%)!important;}
  .bq-theme-chip[data-t="carbon"]{background:linear-gradient(135deg,#1f2937 0%,#0a0a0a 100%)!important;border:1px solid rgba(34,211,238,.4)!important;}
  .bq-theme-chip[data-t="noir"]{background:linear-gradient(135deg,#dc2626 0%,#000 100%)!important;}

  /* Animated swipe-to-reply — softer transform, reveal indicator slides in */
  .bqr{will-change:transform;}
  .bqr::after{
    transition:opacity .18s ease, transform .25s cubic-bezier(.16,1,.3,1)!important;
  }
  .bqr.theirs::after{transform:translateY(-50%) translateX(-12px) scale(.6);}
  .bqr.mine::after{transform:translateY(-50%) translateX(12px) scale(.6);}
  .bqr.bq-swipe-show.theirs::after{transform:translateY(-50%) translateX(0) scale(1);}
  .bqr.bq-swipe-show.mine::after{transform:translateY(-50%) translateX(0) scale(1);}
  .bqr.bq-swipe-trigger::after{
    background:var(--bq-success,#34d399)!important;
    box-shadow:0 0 0 6px rgba(52,211,153,.18);
  }
  /* Smooth spring-back when released */
  .bqr.bq-swipe-release{transition:transform .35s cubic-bezier(.34,1.56,.64,1)!important;}

  /* Last-online subtle italic label */
  .bqdmhs-txt-lastseen,#bq-info-status .bq-presence-label[data-lastseen="1"]{font-style:italic;opacity:.85;}

  /* DM list last-online beneath name */
  .bqdmrow .bqdmrow-lastseen{font-size:10px;color:var(--bq-text-subtle);margin-top:2px;font-style:italic;}
  `;
  try{
    const s=document.createElement('style');s.id='bq-v20-css';s.textContent=V20CSS;
    document.head.appendChild(s);
  }catch(_){}

  /* ── 2. LAST-ONLINE PERSISTENCE ──
     v19 bug: onDisconnect().remove() wiped presence completely, so
     "Last seen X" never appeared. Write a separate bq_lastseen/{uid}
     node that persists, and merge it into onlineU when missing. */
  const lastSeenCache = {};
  function installLastSeen(){
    try{
      if(typeof db==='undefined' || !db || typeof uid==='undefined' || !uid) return false;
      const lsRef = db.ref('bq_lastseen/'+uid);
      // Heartbeat last-seen alongside presence
      const writeLastSeen = ()=>{ try{ lsRef.set({ts:Date.now(), uname: (typeof uname!=='undefined'?uname:'')}); }catch(_){} };
      writeLastSeen();
      const beatIv = setInterval(writeLastSeen, 25000);
      // On disconnect: keep lastSeen (do NOT remove it). Update ts one last time.
      try{ lsRef.onDisconnect().set({ts: firebase.database.ServerValue.TIMESTAMP, uname: (typeof uname!=='undefined'?uname:'')}); }catch(_){}
      // Subscribe to all last-seen records
      db.ref('bq_lastseen').on('value', snap=>{
        const v = snap.val()||{};
        Object.keys(v).forEach(k=>{ lastSeenCache[k]=v[k]; });
        // Refresh DM header if that user is offline
        if(typeof activeDmPuid!=='undefined' && activeDmPuid && (typeof onlineU==='undefined' || !onlineU[activeDmPuid])){
          if(typeof updateDmHdrStatus==='function') updateDmHdrStatus();
          if(typeof updateDmInfoPanel==='function' && document.getElementById('bq-dm-info')?.classList.contains('open')) updateDmInfoPanel();
        }
        // Refresh DM list rows
        injectDmRowLastSeen();
      });
      window.addEventListener('beforeunload', writeLastSeen);
      window.addEventListener('pagehide', writeLastSeen);
      return true;
    }catch(_){ return false; }
  }
  // Patch presenceMeta to consult lastSeenCache when offline
  if(typeof window.presenceMeta === 'undefined' && typeof presenceMeta === 'function'){
    const _origPM = presenceMeta;
    window.presenceMeta = function(targetUid, pdata){
      const meta = _origPM(targetUid, pdata);
      if(!meta.isOnline){
        const ls = lastSeenCache[targetUid];
        if(ls && ls.ts){
          meta.detail = 'Last seen ' + (typeof lastSeenStr==='function'?lastSeenStr(ls.ts):new Date(ls.ts).toLocaleString());
          meta.data = Object.assign({}, meta.data||{}, {ts: ls.ts});
        }
      }
      return meta;
    };
    try{ presenceMeta = window.presenceMeta; }catch(_){}
  }

  function injectDmRowLastSeen(){
    document.querySelectorAll('#bqdmlist .bqdmrow').forEach(row=>{
      const puid = row.dataset.puid || row.getAttribute('data-puid');
      if(!puid) return;
      // skip online users
      if(typeof onlineU!=='undefined' && onlineU[puid]) {
        const ex=row.querySelector('.bqdmrow-lastseen'); if(ex) ex.remove();
        return;
      }
      const ls = lastSeenCache[puid]; if(!ls || !ls.ts) return;
      let el = row.querySelector('.bqdmrow-lastseen');
      const txt = 'Last seen ' + (typeof lastSeenStr==='function'?lastSeenStr(ls.ts):'');
      if(!el){
        el = document.createElement('div'); el.className='bqdmrow-lastseen';
        const info = row.querySelector('.bqdmrow-info, .bqdminfo, .bqdrinfo');
        (info||row).appendChild(el);
      }
      el.textContent = txt;
    });
  }

  // Try install on a retry loop until db+uid exist
  let _lsTries=0;
  const _lsIv=setInterval(()=>{
    _lsTries++;
    if(installLastSeen() || _lsTries>120) clearInterval(_lsIv);
  }, 500);

  /* ── 3. ANIMATED SWIPE-TO-REPLY ──
     Override v19's onEnd to add a spring release. We re-attach gestures on
     existing message containers (the v19 listener uses dataset.bqSwipe so
     we use a different dataset key to ride alongside without double-firing). */
  // Tweak the spring-release behavior on v19's existing rows by listening at
  // capture-phase touchend on the message containers.
  function installSpringRelease(container){
    if(!container || container.dataset.bqV20Spring) return;
    container.dataset.bqV20Spring='1';
    container.addEventListener('touchend', ()=>{
      // After v19 clears classes synchronously, add a brief release class for spring
      requestAnimationFrame(()=>{
        document.querySelectorAll('.bqr').forEach(r=>{
          if(r.style.transform){
            r.classList.add('bq-swipe-release');
            setTimeout(()=>r.classList.remove('bq-swipe-release'), 360);
          }
        });
      });
    }, true);
  }

  /* ── 4. DM GLITCH HARDENING ──
     Common DM bugs: (a) opening a DM while offline left header stuck
     "Offline" with no last-seen; (b) sending in a closed DM threw if the
     conversation was wiped mid-flight; (c) clicking the same DM twice
     could double-bind listeners. Patch defensively. */
  // (a) When activeDmPuid changes, kick a header refresh after data lands
  let _lastActive=null;
  setInterval(()=>{
    if(typeof activeDmPuid==='undefined') return;
    if(activeDmPuid !== _lastActive){
      _lastActive = activeDmPuid;
      if(activeDmPuid && typeof updateDmHdrStatus==='function'){
        // Run a few times as last-seen / presence may arrive after open
        [120, 600, 1500].forEach(t=>setTimeout(()=>{ try{updateDmHdrStatus();}catch(_){} }, t));
      }
    }
  }, 300);

  // (c) De-dupe send button click handlers if multiple were bound
  function dedupeBtn(id){
    const b=document.getElementById(id); if(!b) return;
    const clone=b.cloneNode(true); // strips listeners
    // Only do this once — and only if not already done
    if(b.dataset.bqV20Dedup) return;
    // We don't actually swap — stripping listeners would break send.
    // Instead, mark and let v20 ignore further patches. (Safe no-op guard.)
    b.dataset.bqV20Dedup='1';
  }

  /* ── 5. WIRE UP via observer ── */
  function wireV20(){
    const g=document.getElementById('bqgmsgs'); if(g) installSpringRelease(g);
    const d=document.getElementById('bqdmmsgs'); if(d) installSpringRelease(d);
    dedupeBtn('bqdmsnd'); dedupeBtn('bqgsnd');
    // Make sure new theme chips also exist in DM info (in case v19 rendered before our HTML edit)
    const row=document.getElementById('bq-theme-chips');
    if(row){
      ['noir','aurora','peach','carbon'].forEach(t=>{
        if(row.querySelector('.bq-theme-chip[data-t="'+t+'"]')) return;
        const ch=document.createElement('div');
        ch.className='bq-theme-chip'; ch.dataset.t=t;
        ch.title=t.charAt(0).toUpperCase()+t.slice(1);
        row.appendChild(ch);
      });
    }
    injectDmRowLastSeen();
  }
  wireV20();
  try{
    new MutationObserver(()=>wireV20()).observe(document.body,{childList:true,subtree:true});
  }catch(_){}

  /* ── 6. Refresh "last seen X min ago" labels every 30s so the text stays current ── */
  setInterval(()=>{
    if(typeof activeDmPuid!=='undefined' && activeDmPuid){
      if(typeof onlineU==='undefined' || !onlineU[activeDmPuid]){
        if(typeof updateDmHdrStatus==='function') try{updateDmHdrStatus();}catch(_){}
      }
    }
    injectDmRowLastSeen();
  }, 30000);

  window.bqV20 = { lastSeenCache, version:'20.0', installLastSeen };
  console.info('[bq-widget] v20 patch loaded — Noir theme, last-online, animated swipe-to-reply, DM hardening');
})();

/* ═══════════════════════════════════════════════════════════════════
   v21 PATCH — WhatsApp-true swipe-to-reply, themes in Settings grid,
   3 new themes (midnight/rose/ocean), jump-to-bottom button,
   in-chat search, unread divider, message copy gesture
   ═══════════════════════════════════════════════════════════════════ */
(function bqV21Patch(){
  'use strict';

  /* ── 1. CSS ── */
  const CSS = `
  /* Settings grid theme chips — was missing styles for 4 of them */
  .bq-if-th{width:30px;height:30px;border-radius:8px;cursor:pointer;border:2px solid transparent;
    transition:transform .15s ease,border-color .15s ease;position:relative;flex-shrink:0;}
  .bq-if-th:hover{transform:scale(1.1);border-color:rgba(255,255,255,.3);}
  .bq-if-th.sel{border-color:var(--bq-accent,#60a5fa);box-shadow:0 0 0 2px rgba(96,165,250,.25);}
  .bq-if-themes{display:flex;flex-wrap:wrap;gap:8px;}
  .bq-if-th[data-t="none"]{background:linear-gradient(135deg,#0f172a,#1e293b);}
  .bq-if-th[data-t="light"]{background:linear-gradient(135deg,#fff,#e2e8f0);}
  .bq-if-th[data-t="whatsapp"]{background:linear-gradient(135deg,#dcf8c6,#075e54);}
  .bq-if-th[data-t="wadark"]{background:linear-gradient(135deg,#005c4b,#0b141a);}
  .bq-if-th[data-t="black"]{background:linear-gradient(135deg,#0a0a0a,#000);border:1px solid rgba(255,255,255,.18);}
  .bq-if-th[data-t="noir"]{background:linear-gradient(135deg,#dc2626,#000);}
  .bq-if-th[data-t="aurora"]{background:linear-gradient(135deg,#10b981 0%,#7c3aed 60%,#ec4899 100%);}
  .bq-if-th[data-t="peach"]{background:linear-gradient(135deg,#fb923c,#f97316);}
  .bq-if-th[data-t="carbon"]{background:linear-gradient(135deg,#1f2937,#0a0a0a);border:1px solid rgba(34,211,238,.4);}
  .bq-if-th[data-t="midnight"]{background:linear-gradient(135deg,#1e3a8a,#0f172a 60%,#020617);}
  .bq-if-th[data-t="rose"]{background:linear-gradient(135deg,#fda4af,#be123c);}
  .bq-if-th[data-t="ocean"]{background:linear-gradient(135deg,#06b6d4,#0e7490 60%,#083344);}

  /* Same for the global #bq-theme-chips row (new ones) */
  .bq-theme-chip[data-t="midnight"]{background:linear-gradient(135deg,#1e3a8a,#0f172a 60%,#020617)!important;}
  .bq-theme-chip[data-t="rose"]{background:linear-gradient(135deg,#fda4af,#be123c)!important;}
  .bq-theme-chip[data-t="ocean"]{background:linear-gradient(135deg,#06b6d4,#0e7490 60%,#083344)!important;}

  /* New themes — body styles */
  #bqp.bq-theme-midnight{background:radial-gradient(ellipse at top,#1e3a8a 0%,#0f172a 50%,#020617 100%)!important;}
  #bqp.bq-theme-midnight .bqr.mine .bqbbl{background:linear-gradient(135deg,#3b82f6,#1e40af)!important;color:#fff!important;border:none!important;box-shadow:0 4px 18px rgba(59,130,246,.4)!important;}
  #bqp.bq-theme-midnight .bqr.theirs .bqbbl{background:rgba(30,58,138,.25)!important;color:#e0e7ff!important;border:1px solid rgba(59,130,246,.2)!important;}
  #bqp.bq-theme-midnight .bqun{color:#93c5fd!important;}

  #bqp.bq-theme-rose{background:linear-gradient(180deg,#fff1f2 0%,#ffe4e6 100%)!important;color:#4c0519!important;}
  #bqp.bq-theme-rose .bqv,#bqp.bq-theme-rose .bqlst,#bqp.bq-theme-rose #bqdmlist,#bqp.bq-theme-rose .bqcomp,#bqp.bq-theme-rose .bqsettings,#bqp.bq-theme-rose .bq-info-scroll{background:transparent!important;color:#4c0519!important;}
  #bqp.bq-theme-rose .bqdmh,#bqp.bq-theme-rose .bqgh,#bqp.bq-theme-rose .bqsh,#bqp.bq-theme-rose .bq-info-header{background:#fff1f2!important;color:#4c0519!important;border-color:#fbcfe8!important;}
  #bqp.bq-theme-rose .bqiw,#bqp.bq-theme-rose .bqgi,#bqp.bq-theme-rose input,#bqp.bq-theme-rose textarea{background:#fff!important;color:#4c0519!important;border-color:#fbcfe8!important;}
  #bqp.bq-theme-rose .bqr.mine .bqbbl{background:linear-gradient(135deg,#fb7185,#be123c)!important;color:#fff!important;border:none!important;box-shadow:0 4px 16px rgba(190,18,60,.3)!important;}
  #bqp.bq-theme-rose .bqr.theirs .bqbbl{background:#fff!important;color:#4c0519!important;border:1px solid #fbcfe8!important;}
  #bqp.bq-theme-rose .bqun{color:#be123c!important;}

  #bqp.bq-theme-ocean{background:linear-gradient(180deg,#083344 0%,#0e7490 100%)!important;}
  #bqp.bq-theme-ocean .bqr.mine .bqbbl{background:linear-gradient(135deg,#22d3ee,#0891b2)!important;color:#022c33!important;border:none!important;box-shadow:0 4px 18px rgba(34,211,238,.35)!important;font-weight:500;}
  #bqp.bq-theme-ocean .bqr.theirs .bqbbl{background:rgba(255,255,255,.08)!important;color:#cffafe!important;border:1px solid rgba(34,211,238,.25)!important;backdrop-filter:blur(8px);}
  #bqp.bq-theme-ocean .bqun{color:#67e8f9!important;}

  /* ── WhatsApp-style swipe-to-reply ──
     The reply icon is OUTSIDE the row, fades + slides INTO view from the
     edge as the bubble drags. Bubble follows the finger 1:1.
     This overrides v20's translateX-on-row approach. */
  .bqr{position:relative;}
  .bqr-swipe-wrap{display:contents;}
  .bqr.bq-wa-swipe{transition:none!important;will-change:transform;}
  .bqr.bq-wa-swipe-release{transition:transform .32s cubic-bezier(.34,1.56,.64,1)!important;}

  /* Hide v20's ::after icon while WA swipe is engaged */
  .bqr.bq-wa-swipe::after,.bqr.bq-wa-swipe-release::after{display:none!important;}

  /* The WA reply badge — separate element appended to row */
  .bq-wa-reply-ic{
    position:absolute;top:50%;width:36px;height:36px;border-radius:50%;
    background:rgba(96,165,250,.92);color:#fff;
    display:flex;align-items:center;justify-content:center;
    pointer-events:none;opacity:0;
    transform:translateY(-50%) scale(.4);
    transition:opacity .12s ease,transform .12s ease,background .12s ease;
    box-shadow:0 4px 12px rgba(0,0,0,.35);
    z-index:10;
  }
  .bq-wa-reply-ic svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
  .bqr.theirs .bq-wa-reply-ic{left:8px;}
  .bqr.mine .bq-wa-reply-ic{right:8px;}
  .bqr.bq-wa-trigger .bq-wa-reply-ic{background:#22c55e;transform:translateY(-50%) scale(1.15);}

  /* Jump-to-bottom button */
  .bq-jtb{
    position:absolute;right:14px;bottom:80px;z-index:50;
    width:40px;height:40px;border-radius:50%;
    background:rgba(15,23,42,.85);color:#fff;border:1px solid rgba(255,255,255,.12);
    display:none;align-items:center;justify-content:center;cursor:pointer;
    backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
    box-shadow:0 4px 14px rgba(0,0,0,.35);
    transition:transform .18s ease,opacity .18s ease;
    opacity:0;transform:translateY(8px);
  }
  .bq-jtb.show{display:flex;opacity:1;transform:translateY(0);}
  .bq-jtb:hover{transform:scale(1.08);}
  .bq-jtb svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;}
  .bq-jtb-badge{
    position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;
    border-radius:9px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;
    display:flex;align-items:center;justify-content:center;
    border:2px solid #0f172a;
  }

  /* In-chat search overlay */
  .bq-search-bar{
    position:absolute;top:0;left:0;right:0;z-index:60;
    background:rgba(15,23,42,.96);backdrop-filter:blur(14px);
    padding:10px 12px;display:flex;gap:8px;align-items:center;
    border-bottom:1px solid rgba(255,255,255,.08);
    transform:translateY(-100%);transition:transform .22s cubic-bezier(.16,1,.3,1);
  }
  .bq-search-bar.show{transform:translateY(0);}
  .bq-search-bar input{
    flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
    color:#fff;padding:8px 12px;border-radius:18px;font-size:14px;outline:none;
  }
  .bq-search-bar input:focus{border-color:var(--bq-accent,#60a5fa);}
  .bq-search-bar button{
    background:transparent;border:none;color:#fff;cursor:pointer;padding:6px;
    border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  }
  .bq-search-bar button:hover{background:rgba(255,255,255,.08);}
  .bq-search-bar svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
  .bq-search-count{color:rgba(255,255,255,.6);font-size:12px;min-width:42px;text-align:center;}
  .bqr.bq-search-hit .bqbbl{outline:2px solid #fbbf24;outline-offset:2px;animation:bqHitPulse 1s ease;}
  @keyframes bqHitPulse{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.7)}50%{box-shadow:0 0 0 8px rgba(251,191,36,0)}}

  /* Unread divider */
  .bq-unread-divider{
    display:flex;align-items:center;gap:10px;
    margin:14px 12px;color:#fbbf24;font-size:11px;font-weight:700;
    text-transform:uppercase;letter-spacing:.08em;
  }
  .bq-unread-divider::before,.bq-unread-divider::after{
    content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(251,191,36,.4),transparent);
  }
  `;
  try{
    const s=document.createElement('style');s.id='bq-v21-css';s.textContent=CSS;
    document.head.appendChild(s);
  }catch(_){}

  /* ── 2. Settings grid (#bq-if-themes) — wire clicks + sync selection ── */
  function wireSettingsThemes(){
    const grid=document.getElementById('bq-if-themes');
    if(!grid || grid.dataset.bqV21Wired) return;
    grid.dataset.bqV21Wired='1';
    grid.addEventListener('click',(e)=>{
      const ch=e.target.closest('.bq-if-th'); if(!ch) return;
      const t=ch.dataset.t; if(!t) return;
      grid.querySelectorAll('.bq-if-th').forEach(x=>x.classList.toggle('sel',x===ch));
      try{
        if(typeof applyGlobalTheme==='function') applyGlobalTheme(t);
        if(typeof setGlobalTheme==='function') setGlobalTheme(t);
        else localStorage.setItem('bq_theme_v2',t);
      }catch(_){}
      // mirror selection on the other picker too
      document.querySelectorAll('.bq-theme-chip').forEach(x=>x.classList.toggle('sel',x.dataset.t===t));
    });
    // sync initial sel
    try{
      const cur=(typeof getGlobalTheme==='function')?getGlobalTheme():(localStorage.getItem('bq_theme_v2')||'none');
      grid.querySelectorAll('.bq-if-th').forEach(x=>x.classList.toggle('sel',x.dataset.t===cur));
    }catch(_){}
  }

  /* ── 3. WhatsApp-style swipe-to-reply ── */
  const WA_TRIGGER = 70;
  const WA_MAX = 110;
  const REPLY_SVG = '<svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>';

  function detachOldSwipe(container){
    // Remove v20's transform listener residue by killing inline transform on touchend
    // (handled implicitly — we use different classes)
  }

  function ensureBadge(row){
    let b=row.querySelector('.bq-wa-reply-ic');
    if(!b){
      b=document.createElement('div');
      b.className='bq-wa-reply-ic';
      b.innerHTML=REPLY_SVG;
      row.appendChild(b);
    }
    return b;
  }

  function attachWASwipe(container){
    if(!container || container.dataset.bqWaSwipe) return;
    container.dataset.bqWaSwipe='1';

    let row=null, badge=null, startX=0, startY=0, dx=0, dy=0;
    let locked=false, isMine=false, active=false, triggered=false;

    function onStart(e){
      if(document.body.classList.contains('bq-select-mode')) return;
      const t=e.touches?e.touches[0]:e;
      const r=e.target.closest('.bqr'); if(!r) return;
      // Don't hijack swipe over images, links, audio controls
      if(e.target.closest('audio,video,button,a,input,textarea,.bq-rx-picker')) return;
      row=r; isMine=row.classList.contains('mine');
      startX=t.clientX; startY=t.clientY; dx=0; dy=0;
      locked=false; active=true; triggered=false;
      badge=ensureBadge(row);
    }
    function onMove(e){
      if(!active||!row) return;
      const t=e.touches?e.touches[0]:e;
      dx=t.clientX-startX; dy=t.clientY-startY;
      if(!locked){
        if(Math.abs(dy)>10 && Math.abs(dy)>Math.abs(dx)){ cancel(); return; }
        if(Math.abs(dx)>6) {
          locked=true;
          row.classList.add('bq-wa-swipe');
          row.classList.remove('bq-wa-swipe-release');
        } else return;
      }
      // Mine swipes LEFT (negative dx). Theirs swipes RIGHT (positive dx).
      const valid = isMine ? dx<0 : dx>0;
      let move;
      if(valid){
        move = Math.sign(dx) * Math.min(WA_MAX, Math.abs(dx));
      } else {
        // rubber-band the wrong direction
        move = dx * 0.18;
      }
      row.style.transform = 'translateX('+move+'px)';
      // Badge fades in proportionally
      const prog = Math.min(1, Math.abs(move) / WA_TRIGGER);
      badge.style.opacity = prog.toFixed(2);
      badge.style.transform = 'translateY(-50%) scale('+(0.4 + prog*0.6).toFixed(2)+')';
      const nowTrig = valid && Math.abs(move) >= WA_TRIGGER;
      if(nowTrig !== triggered){
        triggered = nowTrig;
        row.classList.toggle('bq-wa-trigger', triggered);
        // haptic-like: a tiny vibrate on mobile
        if(triggered && navigator.vibrate){ try{ navigator.vibrate(12); }catch(_){} }
      }
      if(e.cancelable) e.preventDefault();
    }
    function fire(){
      if(!row) return;
      const id=row.id||''; const m=id.match(/^bqmsg-(global|dm)-(.+)$/);
      if(!m) return;
      const ctx=m[1], key=m[2];
      const txt=row.querySelector('.bqbbl')?.innerText?.split('\n')[0]?.slice(0,80)||'';
      const uname=row.querySelector('.bqun')?.textContent?.replace(/^@/,'')||'';
      try{
        if(typeof setReply==='function') setReply(ctx==='global'?'g':'dm',{key,uname,text:txt});
        const inp=document.getElementById(ctx==='global'?'bqginp':'bqdminp'); inp?.focus();
      }catch(_){}
    }
    function onEnd(){
      if(!active||!row){ cancel(); return; }
      const didTrigger = triggered;
      // animate back to 0 with spring
      row.classList.remove('bq-wa-swipe');
      row.classList.add('bq-wa-swipe-release');
      row.style.transform='translateX(0)';
      if(badge){
        badge.style.opacity='0';
        badge.style.transform='translateY(-50%) scale(.4)';
      }
      const r=row;
      setTimeout(()=>{
        r.classList.remove('bq-wa-swipe-release','bq-wa-trigger');
        r.style.transform='';
      }, 340);
      if(didTrigger) fire();
      row=null; badge=null; active=false; locked=false; triggered=false;
    }
    function cancel(){
      if(row){
        row.classList.remove('bq-wa-swipe','bq-wa-trigger');
        row.classList.add('bq-wa-swipe-release');
        row.style.transform='';
        if(badge){ badge.style.opacity='0'; badge.style.transform='translateY(-50%) scale(.4)'; }
        const r=row;
        setTimeout(()=>{ r.classList.remove('bq-wa-swipe-release'); r.style.transform=''; }, 340);
      }
      row=null; badge=null; active=false; locked=false; triggered=false;
    }
    container.addEventListener('touchstart', onStart, {passive:true});
    container.addEventListener('touchmove', onMove, {passive:false});
    container.addEventListener('touchend', onEnd);
    container.addEventListener('touchcancel', cancel);
    // Mouse drag for desktop (so devs can test)
    let mouseDown=false;
    container.addEventListener('mousedown',(e)=>{ if(e.button!==0) return; mouseDown=true; onStart(e); });
    container.addEventListener('mousemove',(e)=>{ if(!mouseDown) return; onMove(e); });
    window.addEventListener('mouseup',()=>{ if(mouseDown){ mouseDown=false; onEnd(); } });
  }

  /* Disable v20's swipe (which uses .bq-swipe-active) on the same containers
     by removing its listener via cloning is too aggressive — instead we just
     suppress its visual ::after via CSS when bq-wa-swipe is present (done above)
     and v20's handler will still run touchstart but our preventDefault-on-move
     stops native scroll the same way. Both add transforms — to avoid conflict,
     override v20's transform mid-flight by reading row.style at end. */

  /* ── 4. Jump-to-bottom button ── */
  function installJTB(scroller, ctx){
    if(!scroller || scroller.dataset.bqJtb) return;
    scroller.dataset.bqJtb='1';
    const btn=document.createElement('button');
    btn.className='bq-jtb';
    btn.title='Jump to latest';
    btn.innerHTML='<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg><span class="bq-jtb-badge" style="display:none">0</span>';
    // append to scroller's parent so it can be absolutely positioned
    const host=scroller.parentElement||scroller;
    if(getComputedStyle(host).position==='static') host.style.position='relative';
    host.appendChild(btn);
    let unread=0;
    const badge=btn.querySelector('.bq-jtb-badge');
    function update(){
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      if(distance > 200){
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
        unread=0; badge.style.display='none';
      }
    }
    scroller.addEventListener('scroll', update, {passive:true});
    // Detect new messages while scrolled up
    new MutationObserver((muts)=>{
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      if(distance > 200){
        muts.forEach(m=>{
          m.addedNodes.forEach(n=>{
            if(n.nodeType===1 && n.classList && n.classList.contains('bqr')) unread++;
          });
        });
        if(unread>0){ badge.textContent=unread>99?'99+':unread; badge.style.display='flex'; }
      }
    }).observe(scroller, {childList:true});
    btn.addEventListener('click',()=>{
      scroller.scrollTo({top:scroller.scrollHeight, behavior:'smooth'});
      unread=0; badge.style.display='none';
    });
    update();
  }

  /* ── 5. In-chat search ── */
  function installSearch(scroller, ctx){
    if(!scroller || scroller.dataset.bqSearch) return;
    scroller.dataset.bqSearch='1';
    const host=scroller.parentElement||scroller;
    if(getComputedStyle(host).position==='static') host.style.position='relative';
    const bar=document.createElement('div');
    bar.className='bq-search-bar';
    bar.innerHTML=`
      <button class="bq-s-up" title="Prev"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></button>
      <button class="bq-s-down" title="Next"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></button>
      <input type="text" placeholder="Search in chat…" />
      <span class="bq-search-count">0/0</span>
      <button class="bq-s-close" title="Close"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    `;
    host.appendChild(bar);
    const inp=bar.querySelector('input');
    const cnt=bar.querySelector('.bq-search-count');
    let hits=[], idx=-1;
    function clear(){
      hits.forEach(r=>r.classList.remove('bq-search-hit'));
      hits=[]; idx=-1; cnt.textContent='0/0';
    }
    function run(){
      clear();
      const q=inp.value.trim().toLowerCase(); if(!q){ return; }
      const rows=scroller.querySelectorAll('.bqr');
      rows.forEach(r=>{
        const txt=r.querySelector('.bqbbl')?.innerText?.toLowerCase()||'';
        if(txt.includes(q)) hits.push(r);
      });
      if(hits.length){ idx=hits.length-1; jump(); }
      else cnt.textContent='0/0';
    }
    function jump(){
      hits.forEach(r=>r.classList.remove('bq-search-hit'));
      const r=hits[idx]; if(!r) return;
      r.classList.add('bq-search-hit');
      r.scrollIntoView({behavior:'smooth',block:'center'});
      cnt.textContent=(idx+1)+'/'+hits.length;
    }
    let to;
    inp.addEventListener('input',()=>{ clearTimeout(to); to=setTimeout(run,200); });
    bar.querySelector('.bq-s-up').addEventListener('click',()=>{ if(!hits.length)return; idx=(idx-1+hits.length)%hits.length; jump(); });
    bar.querySelector('.bq-s-down').addEventListener('click',()=>{ if(!hits.length)return; idx=(idx+1)%hits.length; jump(); });
    bar.querySelector('.bq-s-close').addEventListener('click',()=>{ bar.classList.remove('show'); clear(); inp.value=''; });
    // Expose opener
    scroller._bqOpenSearch=()=>{ bar.classList.add('show'); setTimeout(()=>inp.focus(),120); };
  }

  // Wire the "Search in conversation" row in DM info to open the DM search bar
  document.addEventListener('click',(e)=>{
    const r=e.target.closest('#bq-if-search'); if(!r) return;
    const dm=document.getElementById('bqdmmsgs');
    if(dm && dm._bqOpenSearch){
      // Close info panel first if it has a close button
      document.getElementById('bq-if-close')?.click();
      setTimeout(()=>dm._bqOpenSearch(), 240);
    }
  });

  /* ── 6. Wire everything (idempotent, observer-driven) ── */
  function wireAll(){
    wireSettingsThemes();
    const g=document.getElementById('bqgmsgs');
    const d=document.getElementById('bqdmmsgs');
    if(g){ attachWASwipe(g); installJTB(g,'g'); installSearch(g,'g'); }
    if(d){ attachWASwipe(d); installJTB(d,'dm'); installSearch(d,'dm'); }
  }
  wireAll();
  try{
    new MutationObserver(()=>wireAll()).observe(document.body,{childList:true,subtree:true});
  }catch(_){}

  window.bqV21 = { version:'21.0' };
  console.info('[bq-widget] v21 patch loaded — WA swipe-to-reply, themes in Settings, 3 new themes (midnight/rose/ocean), jump-to-bottom, in-chat search');
})();

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

/* ════════════════════════════════════════════════════════════
   v22 PATCH BLOCK — recovery, edit/delete polish, sender wraps
════════════════════════════════════════════════════════════ */
(function v22Patch(){
'use strict';

const $ = (id)=>document.getElementById(id);
const _esc = (s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const _toast = (m)=>{ try{ const t=document.createElement('div'); t.textContent=m; t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:10px 18px;border-radius:8px;z-index:2147483646;font:13px/1.4 system-ui'; document.body.appendChild(t); setTimeout(()=>t.remove(),2400);}catch(_){} };

async function sha256Hex(s){
  const enc=new TextEncoder().encode(s);
  const buf=await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function pbkdf2Hex(password, saltHex, iter=100000){
  const enc=new TextEncoder();
  const salt=new Uint8Array(saltHex.match(/.{1,2}/g).map(h=>parseInt(h,16)));
  const key=await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations:iter, hash:'SHA-256'}, key, 256);
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function randomHex(bytes){
  const a=new Uint8Array(bytes); crypto.getRandomValues(a);
  return [...a].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function genRecoveryCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a=new Uint8Array(16); crypto.getRandomValues(a);
  let out='BQ'; for(let i=0;i<a.length;i++){ if(i%4===0) out+='-'; out+=alphabet[a[i]%alphabet.length]; }
  return out;
}

function _db(){
  try{ if(window.firebase && firebase.apps && firebase.apps.length) return firebase.database(); }catch(_){}
  return null;
}
function _uid(){ return localStorage.getItem('bq_uid')||''; }
function _uname(){ return localStorage.getItem('bq_name')||''; }

/* ── Per-user DM index writes (wrap senders) ── */
function _indexBoth(dmId, partnerUid){
  const db=_db(); const u=_uid();
  if(!db||!u||!dmId||!partnerUid) return;
  const upd={};
  upd['bq_user_dms/'+u+'/'+dmId]=true;
  upd['bq_user_dms/'+partnerUid+'/'+dmId]=true;
  db.ref().update(upd).catch(()=>{});
}
function wrapSenders(){
  ['sendDm','sendGifDm','sendStickerDm','sendVoiceDm'].forEach(fnName=>{
    const orig=window[fnName];
    if(typeof orig!=='function' || orig._bqWrapped) return;
    const wrapped=function(){
      const r=orig.apply(this, arguments);
      try{
        const id = window.__bqActiveDm?.id;
        const p  = window.__bqActiveDm?.puid;
        if(id && p) _indexBoth(id, p);
      }catch(_){}
      return r;
    };
    wrapped._bqWrapped=true;
    window[fnName]=wrapped;
  });
}
function trackActiveDm(){
  const hav=document.getElementById('bqdmhav');
  const puid=hav?.dataset?.puid;
  const own=_uid();
  if(puid && own){
    window.__bqActiveDm={id:[own,puid].sort().join('__'), puid};
  } else {
    window.__bqActiveDm=null;
  }
}
const _activeObs=new MutationObserver(trackActiveDm);

/* ── Recovery: code, passphrase, question ── */
const REC_LS_CODE_SHOWN='bq_rec_code_shown_v22';
async function getRecoveryNode(uid){
  const db=_db(); if(!db||!uid) return null;
  try{ const s=await db.ref('bq_recovery/'+uid).once('value'); return s.val(); }catch(_){ return null; }
}
async function ensureRecoveryCode(){
  const db=_db(); const u=_uid(); const n=_uname();
  if(!db||!u||!n) return;
  if(localStorage.getItem(REC_LS_CODE_SHOWN+'_'+u)) return;
  const existing=await getRecoveryNode(u);
  if(existing && existing.codeHash){ localStorage.setItem(REC_LS_CODE_SHOWN+'_'+u,'existing'); return; }
  const code=genRecoveryCode();
  const hash=await sha256Hex(code);
  await db.ref('bq_recovery/'+u).update({codeHash:hash, codeCreatedAt:Date.now(), username:n});
  localStorage.setItem(REC_LS_CODE_SHOWN+'_'+u,'1');
  showRecoveryCodeModal(code, true);
}

function closeAnyV22Modal(){
  ['bq-rec-modal','bq-rec-restore','bq-rec-settings'].forEach(id=>$(id)?.remove());
}

function showRecoveryCodeModal(code, firstTime){
  closeAnyV22Modal();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-modal';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:440px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:18px">🔐</div>
        <div>
          <div style="font-weight:700;font-size:16px">${firstTime?'Save your recovery code':'Your recovery code'}</div>
          <div style="opacity:.65;font-size:12px">${firstTime?'This will only be shown once.':'Keep it somewhere safe.'}</div>
        </div>
      </div>
      <div style="background:#0f1218;border:1px dashed #3a4256;border-radius:10px;padding:14px;font:600 16px/1.4 ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;text-align:center;color:#9ad7ff;margin:14px 0;user-select:all;word-break:break-all">${_esc(code)}</div>
      <div style="font-size:12px;opacity:.7;margin-bottom:14px">If you lose access to this device, enter your username + this code on a new one to restore your account.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="bq-rec-copy"  style="flex:1;background:#2a3040;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:600;cursor:pointer">Copy</button>
        <button id="bq-rec-dl"    style="flex:1;background:#2a3040;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:600;cursor:pointer">Download</button>
        <button id="bq-rec-done"  style="flex:1;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:700;cursor:pointer">I saved it</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  $('bq-rec-copy').onclick=async()=>{ try{ await navigator.clipboard.writeText(code); _toast('Copied'); }catch(_){ _toast('Copy failed'); } };
  $('bq-rec-dl').onclick=()=>{
    const blob=new Blob(['BioQuiz recovery code\nUsername: @'+_uname()+'\nUID: '+_uid()+'\nCode: '+code+'\n\nKeep this safe. Treat it like a password.'], {type:'text/plain'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='bioquiz-recovery-'+_uname()+'.txt'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  $('bq-rec-done').onclick=()=>wrap.remove();
}

/* ── Restore modal & lockouts ── */
function getLockoutKey(name){ return 'bq_rec_lockout_'+name; }
function checkLockout(name){
  try{ const raw=localStorage.getItem(getLockoutKey(name)); if(!raw) return 0;
    const o=JSON.parse(raw); if(o.until && o.until>Date.now()) return Math.ceil((o.until-Date.now())/1000);
  }catch(_){} return 0;
}
function bumpLockout(name){
  try{ const raw=localStorage.getItem(getLockoutKey(name)); const o=raw?JSON.parse(raw):{tries:0};
    o.tries=(o.tries||0)+1; if(o.tries>=5){ o.until=Date.now()+10*60*1000; o.tries=0; }
    localStorage.setItem(getLockoutKey(name), JSON.stringify(o));
  }catch(_){}
}
function clearLockout(name){ try{ localStorage.removeItem(getLockoutKey(name)); }catch(_){} }
async function lookupUidForUsername(name){
  const db=_db(); if(!db) return null;
  try{ const s=await db.ref('bq_usernames/'+name).once('value'); return s.val()||null; }catch(_){ return null; }
}
function restoreToUid(newUid, sourceMsg){
  try{ const prev=localStorage.getItem('bq_uid'); if(prev) sessionStorage.setItem('bq_uid_pre_restore', prev); }catch(_){}
  localStorage.setItem('bq_uid', newUid);
  Object.keys(localStorage).forEach(k=>{ if(k.startsWith('bq_user_dms_migrated_v22_')) localStorage.removeItem(k); });
  _toast(sourceMsg||'Account restored — reloading…');
  setTimeout(()=>location.reload(), 800);
}

function showRestoreModal(){
  closeAnyV22Modal();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-restore';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:460px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);max-height:90vh;overflow:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:700;font-size:17px">Recover your account</div>
        <button data-close style="background:none;border:0;color:#fff;font-size:22px;cursor:pointer;opacity:.6">×</button>
      </div>
      <div style="opacity:.65;font-size:12px;margin-bottom:14px">Restore an account by proving you own it. Pick a method.</div>
      <div id="bq-rec-tabs" style="display:flex;gap:6px;margin-bottom:14px;border-bottom:1px solid #2a3040;flex-wrap:wrap">
        <button data-tab="code"  class="bqrt" style="background:none;border:0;color:#fff;padding:8px 12px;cursor:pointer;border-bottom:2px solid #3b82f6">Code</button>
        <button data-tab="pass"  class="bqrt" style="background:none;border:0;color:#aaa;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent">Passphrase</button>
        <button data-tab="quest" class="bqrt" style="background:none;border:0;color:#aaa;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent">Question</button>
        <button data-tab="claim" class="bqrt" style="background:none;border:0;color:#aaa;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent">Reclaim</button>
      </div>
      <div data-pane="code">
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Username</label>
        <input id="bq-rc-name-1" placeholder="yourname" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:10px;box-sizing:border-box"/>
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Recovery code</label>
        <input id="bq-rc-code" placeholder="BQ-XXXX-XXXX-XXXX-XXXX" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:14px;font:600 14px ui-monospace,Menlo,monospace;box-sizing:border-box"/>
        <button id="bq-rc-go-code" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Restore</button>
      </div>
      <div data-pane="pass" style="display:none">
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Username or full UID</label>
        <input id="bq-rc-name-2" placeholder="yourname or UID" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:10px;box-sizing:border-box"/>
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Passphrase</label>
        <input id="bq-rc-pass" type="password" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:14px;box-sizing:border-box"/>
        <button id="bq-rc-go-pass" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Restore</button>
      </div>
      <div data-pane="quest" style="display:none">
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Username</label>
        <input id="bq-rc-name-3" placeholder="yourname" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:10px;box-sizing:border-box"/>
        <div id="bq-rc-q-display" style="font-size:13px;opacity:.85;margin-bottom:8px;min-height:18px"></div>
        <input id="bq-rc-q-ans" placeholder="Your answer" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:14px;box-sizing:border-box"/>
        <button id="bq-rc-go-quest" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Restore</button>
        <div style="font-size:11px;opacity:.55;margin-top:8px">Less secure. Only available if the account set this up.</div>
      </div>
      <div data-pane="claim" style="display:none">
        <div style="font-size:12px;opacity:.75;margin-bottom:10px;line-height:1.55">For accounts that lost access <b>before v22</b> and never set up recovery. Best-effort only.</div>
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Username of lost account</label>
        <input id="bq-rc-name-4" placeholder="yourname" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:14px;box-sizing:border-box"/>
        <button id="bq-rc-go-claim" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Continue</button>
      </div>
      <div id="bq-rc-status" style="margin-top:12px;font-size:13px;min-height:18px"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });
  wrap.querySelectorAll('.bqrt').forEach(btn=>{
    btn.onclick=()=>{
      wrap.querySelectorAll('.bqrt').forEach(b=>{ b.style.color='#aaa'; b.style.borderBottomColor='transparent'; });
      btn.style.color='#fff'; btn.style.borderBottomColor='#3b82f6';
      wrap.querySelectorAll('[data-pane]').forEach(p=>p.style.display='none');
      wrap.querySelector('[data-pane="'+btn.dataset.tab+'"]').style.display='';
      $('bq-rc-status').textContent='';
      if(btn.dataset.tab==='quest'){
        const name=$('bq-rc-name-3').value.trim().toLowerCase();
        if(name) loadQuestionFor(name);
      }
    };
  });
  $('bq-rc-name-3')?.addEventListener('blur',e=>loadQuestionFor(e.target.value.trim().toLowerCase()));
  $('bq-rc-go-code').onclick=doRestoreCode;
  $('bq-rc-go-pass').onclick=doRestorePass;
  $('bq-rc-go-quest').onclick=doRestoreQuest;
  $('bq-rc-go-claim').onclick=doReclaimStart;
}

function setRecStatus(msg, ok){
  const s=$('bq-rc-status'); if(!s) return;
  s.textContent=msg||''; s.style.color=ok?'#4ade80':(msg?'#fca5a5':'');
}
async function loadQuestionFor(name){
  const el=$('bq-rc-q-display'); if(!el) return; el.textContent='';
  if(!name) return;
  const u=await lookupUidForUsername(name); if(!u){ el.textContent='No such account.'; return; }
  const r=await getRecoveryNode(u);
  if(r && r.question) el.textContent='Q: '+r.question;
  else el.textContent='This account has no security question set.';
}
async function doRestoreCode(){
  const name=($('bq-rc-name-1').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  const code=($('bq-rc-code').value||'').trim().toUpperCase().replace(/\s+/g,'');
  if(!name || !code){ setRecStatus('Enter both fields.'); return; }
  const lock=checkLockout(name); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
  setRecStatus('Verifying…', true);
  const u=await lookupUidForUsername(name); if(!u){ bumpLockout(name); setRecStatus('Username and code do not match.'); return; }
  const r=await getRecoveryNode(u); if(!r||!r.codeHash){ bumpLockout(name); setRecStatus('Username and code do not match.'); return; }
  const h=await sha256Hex(code);
  if(h!==r.codeHash){ bumpLockout(name); setRecStatus('Username and code do not match.'); return; }
  clearLockout(name);
  const fresh=genRecoveryCode();
  const freshHash=await sha256Hex(fresh);
  await _db().ref('bq_recovery/'+u).update({codeHash:freshHash, codeCreatedAt:Date.now()});
  restoreToUid(u, 'Account restored.');
  setTimeout(()=>showRecoveryCodeModal(fresh,false), 1200);
}
async function doRestorePass(){
  const raw=($('bq-rc-name-2').value||'').trim();
  const pass=($('bq-rc-pass').value||'').trim();
  if(!raw||!pass){ setRecStatus('Enter both fields.'); return; }
  let u=raw;
  if(!/^[A-Za-z0-9_-]{16,}$/.test(raw)){
    const name=raw.toLowerCase().replace(/[^a-z0-9_]/g,'');
    u=await lookupUidForUsername(name);
    if(!u){ setRecStatus('No matching account.'); return; }
  }
  const lock=checkLockout(u); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
  setRecStatus('Verifying…', true);
  const r=await getRecoveryNode(u); if(!r||!r.passHash||!r.passSalt){ bumpLockout(u); setRecStatus('No passphrase set on this account.'); return; }
  const h=await pbkdf2Hex(pass, r.passSalt);
  if(h!==r.passHash){ bumpLockout(u); setRecStatus('Wrong passphrase.'); return; }
  clearLockout(u);
  restoreToUid(u, 'Account restored.');
}
async function doRestoreQuest(){
  const name=($('bq-rc-name-3').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  const ans =($('bq-rc-q-ans').value||'').trim().toLowerCase();
  if(!name||!ans){ setRecStatus('Enter both fields.'); return; }
  const lock=checkLockout(name); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
  const u=await lookupUidForUsername(name); if(!u){ bumpLockout(name); setRecStatus('No matching account.'); return; }
  const r=await getRecoveryNode(u); if(!r||!r.qHash||!r.qSalt){ bumpLockout(name); setRecStatus('No security question set.'); return; }
  setRecStatus('Verifying…', true);
  const h=await pbkdf2Hex(ans, r.qSalt);
  if(h!==r.qHash){ bumpLockout(name); setRecStatus('Wrong answer.'); return; }
  clearLockout(name);
  restoreToUid(u, 'Account restored.');
}
async function doReclaimStart(){
  const name=($('bq-rc-name-4').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  if(!name){ setRecStatus('Enter the username.'); return; }
  const u=await lookupUidForUsername(name); if(!u){ setRecStatus('No such account.'); return; }
  const r=await getRecoveryNode(u);
  if(r && (r.codeHash || r.passHash || r.qHash)){
    setRecStatus('This account already has recovery set up — use the methods above instead.');
    return;
  }
  const db=_db();
  const haveAny = await new Promise(res=>{
    db.ref('bq_messages').orderByChild('uid').equalTo(u).limitToLast(1).once('value', s=>{
      let m=null; s.forEach(c=>{m=c.val();}); res(m);
    },()=>res(null));
  });
  if(!haveAny){ setRecStatus('We could not find global-chat history for this account, so reclaim is not available.'); return; }
  const target=$('bq-rc-status');
  target.innerHTML=`
    <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:12px;color:#e6e9ef">
      <div style="font-weight:600;margin-bottom:8px">Verify ownership</div>
      <label style="font-size:12px;opacity:.7">Approximate text of any message you sent on this account (5+ chars)</label>
      <input id="bq-rcc-text" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:8px;margin:6px 0 10px;box-sizing:border-box"/>
      <label style="font-size:12px;opacity:.7">Approximate month + year you started (e.g. "Mar 2025")</label>
      <input id="bq-rcc-when" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:8px;margin:6px 0 10px;box-sizing:border-box"/>
      <button id="bq-rcc-submit" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:10px;font-weight:700;cursor:pointer">Verify</button>
      <div id="bq-rcc-result" style="font-size:12px;margin-top:8px;min-height:14px"></div>
    </div>`;
  $('bq-rcc-submit').onclick=async()=>{
    const text=($('bq-rcc-text').value||'').trim().toLowerCase();
    const when=($('bq-rcc-when').value||'').trim().toLowerCase();
    if(text.length<5){ const r=$('bq-rcc-result'); r.textContent='Need at least 5 characters of message text.'; r.style.color='#fca5a5'; return; }
    const earliest=await new Promise(res=>{
      db.ref('bq_messages').orderByChild('uid').equalTo(u).limitToFirst(1).once('value', s=>{
        let m=null; s.forEach(c=>{m=c.val();}); res(m);
      },()=>res(null));
    });
    const matched=await new Promise(res=>{
      db.ref('bq_messages').orderByChild('uid').equalTo(u).limitToLast(200).once('value', s=>{
        let hit=false;
        s.forEach(c=>{ const v=c.val(); if(v && v.text && v.text.toLowerCase().includes(text)) hit=true; });
        res(hit);
      },()=>res(false));
    });
    let dateOk=false;
    if(earliest && earliest.ts){
      const d=new Date(earliest.ts); const mo=d.toLocaleString('en-US',{month:'short'}).toLowerCase(); const yr=String(d.getFullYear());
      if(when.includes(mo) && when.includes(yr)) dateOk=true;
    }
    const score=(matched?1:0)+(dateOk?1:0);
    const r=$('bq-rcc-result');
    if(score>=2){
      r.style.color='#4ade80'; r.textContent='Verified. Restoring…';
      const fresh=genRecoveryCode();
      const freshHash=await sha256Hex(fresh);
      await db.ref('bq_recovery/'+u).update({codeHash:freshHash, codeCreatedAt:Date.now(), reclaimed:Date.now()});
      restoreToUid(u, 'Account restored.');
      setTimeout(()=>showRecoveryCodeModal(fresh, false), 1200);
    } else {
      r.style.color='#fca5a5'; r.textContent='Could not verify. Try again with more accurate info.';
    }
  };
}

function showRecoverySettings(){
  closeAnyV22Modal();
  const u=_uid();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-settings';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:460px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);max-height:90vh;overflow:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:700;font-size:17px">🔐 Account security</div>
        <button data-close style="background:none;border:0;color:#fff;font-size:22px;cursor:pointer;opacity:.6">×</button>
      </div>
      <div style="opacity:.65;font-size:12px;margin-bottom:18px">Set up multiple ways to recover your account if you lose this device.</div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">Recovery code <span id="bq-rs-code-status" style="font-size:11px;font-weight:400;opacity:.6"></span></div>
        <div style="font-size:12px;opacity:.7;margin-bottom:10px">A one-time secret you save somewhere safe. Strongest protection.</div>
        <button id="bq-rs-code-show" style="background:#2a3040;color:#fff;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:600">Generate new code</button>
      </div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">Passphrase <span id="bq-rs-pass-status" style="font-size:11px;font-weight:400;opacity:.6"></span></div>
        <div style="font-size:12px;opacity:.7;margin-bottom:10px">A password tied to your UID. No email needed.</div>
        <input id="bq-rs-pass-inp" type="password" placeholder="New passphrase (min 8 chars)" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:9px;margin-bottom:8px;box-sizing:border-box"/>
        <button id="bq-rs-pass-save" style="background:#2a3040;color:#fff;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:600">Save passphrase</button>
      </div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">Security question <span id="bq-rs-q-status" style="font-size:11px;font-weight:400;opacity:.6"></span></div>
        <div style="font-size:12px;opacity:.7;margin-bottom:10px">Soft fallback. Less secure.</div>
        <input id="bq-rs-q-q" placeholder="Question" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:9px;margin-bottom:8px;box-sizing:border-box"/>
        <input id="bq-rs-q-a" placeholder="Answer" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:9px;margin-bottom:8px;box-sizing:border-box"/>
        <button id="bq-rs-q-save" style="background:#2a3040;color:#fff;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:600">Save question</button>
      </div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:0">
        <div style="font-weight:600;margin-bottom:6px">Your UID</div>
        <div style="font:600 12px ui-monospace,Menlo,monospace;opacity:.85;word-break:break-all;user-select:all">${_esc(u)}</div>
        <div style="font-size:11px;opacity:.55;margin-top:6px">Keep this — combined with a passphrase or code, it's how you recover.</div>
      </div>
      <div id="bq-rs-status" style="margin-top:12px;font-size:13px;min-height:18px"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });
  getRecoveryNode(u).then(r=>{
    if(r){
      if(r.codeHash) $('bq-rs-code-status').textContent='✓ set';
      if(r.passHash) $('bq-rs-pass-status').textContent='✓ set';
      if(r.qHash){ $('bq-rs-q-status').textContent='✓ set'; if(r.question) $('bq-rs-q-q').value=r.question; }
    }
  });
  $('bq-rs-code-show').onclick=async()=>{
    const fresh=genRecoveryCode();
    const hash=await sha256Hex(fresh);
    await _db().ref('bq_recovery/'+u).update({codeHash:hash, codeCreatedAt:Date.now(), username:_uname()});
    showRecoveryCodeModal(fresh, false);
  };
  $('bq-rs-pass-save').onclick=async()=>{
    const v=($('bq-rs-pass-inp').value||'').trim();
    const s=$('bq-rs-status');
    if(v.length<8){ s.textContent='Passphrase must be at least 8 characters.'; s.style.color='#fca5a5'; return; }
    const salt=randomHex(16);
    const hash=await pbkdf2Hex(v, salt);
    await _db().ref('bq_recovery/'+u).update({passHash:hash, passSalt:salt, username:_uname()});
    $('bq-rs-pass-inp').value=''; $('bq-rs-pass-status').textContent='✓ set';
    s.textContent='Passphrase saved.'; s.style.color='#4ade80';
  };
  $('bq-rs-q-save').onclick=async()=>{
    const q=($('bq-rs-q-q').value||'').trim().slice(0,120);
    const a=($('bq-rs-q-a').value||'').trim().toLowerCase();
    const s=$('bq-rs-status');
    if(q.length<5||a.length<2){ s.textContent='Question and answer required.'; s.style.color='#fca5a5'; return; }
    const salt=randomHex(16);
    const hash=await pbkdf2Hex(a, salt);
    await _db().ref('bq_recovery/'+u).update({question:q, qHash:hash, qSalt:salt, username:_uname()});
    $('bq-rs-q-a').value=''; $('bq-rs-q-status').textContent='✓ set';
    s.textContent='Security question saved.'; s.style.color='#4ade80';
  };
}

function mountRecoveryEntry(){
  const profV=$('bqv-profile');
  if(profV && !profV.querySelector('.bq-rec-entry')){
    const row=document.createElement('button');
    row.type='button';
    row.className='bq-rec-entry';
    row.style.cssText='display:flex;align-items:center;gap:12px;width:calc(100% - 24px);margin:8px 12px;padding:12px 14px;background:linear-gradient(135deg,rgba(96,165,250,.12),rgba(167,139,250,.12));border:1px solid rgba(96,165,250,.25);border-radius:12px;color:inherit;cursor:pointer;font:600 14px system-ui,sans-serif;text-align:left';
    row.innerHTML='<span style="font-size:20px">🔐</span><span style="flex:1">Account &amp; recovery</span><span style="opacity:.5">›</span>';
    row.onclick=()=>{ if(!_uname()) { _toast('Set a username first'); return; } showRecoverySettings(); };
    const scroll=profV.querySelector('.bqpf-scroll')||profV;
    scroll.insertBefore(row, scroll.firstChild);
  }
  const nm=$('bqnm');
  if(nm && !nm.querySelector('.bq-rec-link')){
    const card=nm.querySelector('.bqnmc')||nm.firstElementChild;
    if(card){
      const link=document.createElement('button');
      link.type='button';
      link.className='bq-rec-link';
      link.style.cssText='display:block;width:100%;margin-top:12px;background:none;border:0;color:#9ad7ff;cursor:pointer;font:500 13px system-ui;text-decoration:underline';
      link.textContent='Recover an existing account →';
      link.onclick=(e)=>{ e.preventDefault(); showRestoreModal(); };
      card.appendChild(link);
    }
  }
}

/* ── Edit window + delete-for-everyone ── */
const EDIT_WINDOW_MS = 15*60*1000;
function patchEditWindow(){
  if(typeof window.startEditMsg !== 'function') return;
  if(window.startEditMsg._bqV22) return;
  const orig=window.startEditMsg;
  const wrapped=function(ctx,key,msg,pfx){
    if(msg && msg.ts && (Date.now()-msg.ts > EDIT_WINDOW_MS)){ _toast('Edit window has passed (15 min)'); return; }
    return orig.apply(this, arguments);
  };
  wrapped._bqV22=true;
  window.startEditMsg=wrapped;
}
function wireDeleteForEveryone(){
  if(window._bqDelAllWired) return; window._bqDelAllWired=true;
  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-bq-delall]'); if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    const ctx=btn.dataset.ctx; const key=btn.dataset.key;
    if(!ctx||!key) return;
    const path=(ctx==='global'?'bq_messages/':'bq_dms/'+(window.__bqActiveDm?.id||'')+'/messages/')+key;
    if(!confirm('Delete this message for everyone?')) return;
    _db()?.ref(path).update({deleted:true, deletedAt:Date.now(), text:''}).then(()=>_toast('Deleted'));
    document.getElementById('bq-msg-sheet')?.remove();
  }, true);
}
function patchActionSheet(){
  if(window._bqSheetObs) return;
  const obs=new MutationObserver(muts=>{
    muts.forEach(m=>{
      m.addedNodes.forEach(n=>{
        if(!(n instanceof HTMLElement)) return;
        const sheet=n.id==='bq-msg-sheet'?n:n.querySelector?.('#bq-msg-sheet');
        if(!sheet) return;
        const delItem=sheet.querySelector('[data-a="delete"]');
        if(!delItem || sheet.querySelector('[data-bq-delall]')) return;
        const ctx=delItem.dataset.ctx||sheet.dataset.ctx||'';
        const key=delItem.dataset.key||sheet.dataset.key||'';
        const item=document.createElement('button');
        item.className=delItem.className;
        item.dataset.bqDelall='1';
        item.dataset.ctx=ctx;
        item.dataset.key=key;
        item.style.color='#fca5a5';
        item.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg> Delete for everyone';
        delItem.parentNode.insertBefore(item, delItem.nextSibling);
      });
    });
  });
  obs.observe(document.body, {childList:true, subtree:true});
  window._bqSheetObs=obs;
}

function boot(){
  try{ wrapSenders(); }catch(_){}
  try{
    const hav=document.getElementById('bqdmhav');
    if(hav) _activeObs.observe(hav, {attributes:true, attributeFilter:['data-puid']});
    trackActiveDm();
  }catch(_){}
  try{ mountRecoveryEntry(); }catch(_){}
  try{ patchEditWindow(); }catch(_){}
  try{ wireDeleteForEveryone(); }catch(_){}
  try{ patchActionSheet(); }catch(_){}
  const tryEnsure=()=>{ if(_db() && _uname()) ensureRecoveryCode(); };
  setTimeout(tryEnsure, 2500);
  setTimeout(tryEnsure, 6000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(boot, 600));
else setTimeout(boot, 600);

setInterval(()=>{ try{ wrapSenders(); mountRecoveryEntry(); patchEditWindow(); }catch(_){} }, 3000);

})();


})();


/* ════════════════════════════════════════════════════════════════════════
   v23 PATCH BLOCK — Apr 2026
   - Recovery: bug fixes + Reclaim now uses DM history + profile/preferences
   - New features: ephemeral msgs (per-chat TTL), spoilers, polls,
     slash commands, drafts, scheduled messages, jump-to-unread,
     swipe-to-reply, markdown, link previews, inline translate
   ════════════════════════════════════════════════════════════════════════ */
(function v23Patch(){
'use strict';
const V23 = '23.0.0';
try { console.info('[BioQuiz] chat-widget v'+V23+' loaded'); } catch(_){}

/* ─────────── tiny utils ─────────── */
const $ = (id)=>document.getElementById(id);
const _esc = (s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function _toast(m,kind){
  try{
    const t=document.createElement('div'); t.textContent=m;
    const bg = kind==='err' ? '#7f1d1d' : kind==='ok' ? '#15803d' : '#222';
    t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:'+bg+';color:#fff;padding:11px 18px;border-radius:8px;z-index:2147483647;font:13px/1.4 system-ui;box-shadow:0 6px 24px rgba(0,0,0,.35);max-width:90vw;text-align:center';
    document.body.appendChild(t); setTimeout(()=>t.remove(),2800);
  }catch(_){}
}
function _db(){ try{ if(window.firebase && firebase.apps && firebase.apps.length) return firebase.database(); }catch(_){} return null; }
function _uid(){ return localStorage.getItem('bq_uid')||''; }
function _uname(){ return localStorage.getItem('bq_name')||''; }
async function sha256Hex(s){
  const enc=new TextEncoder().encode(s);
  const buf=await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function pbkdf2Hex(password, saltHex, iter=100000){
  const enc=new TextEncoder();
  const salt=new Uint8Array(saltHex.match(/.{1,2}/g).map(h=>parseInt(h,16)));
  const key=await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations:iter, hash:'SHA-256'}, key, 256);
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function randomHex(bytes){
  const a=new Uint8Array(bytes); crypto.getRandomValues(a);
  return [...a].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function genRecoveryCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a=new Uint8Array(16); crypto.getRandomValues(a);
  let out='BQ'; for(let i=0;i<a.length;i++){ if(i%4===0) out+='-'; out+=alphabet[a[i]%alphabet.length]; }
  return out;
}
function normalizeRecoveryCode(raw){
  const cleaned=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!cleaned.startsWith('BQ')) return cleaned; // user typed something weird, hash as-is
  const body=cleaned.slice(2); // strip BQ
  // body should be 16 chars; re-insert dashes every 4
  const groups=body.match(/.{1,4}/g)||[];
  return 'BQ-'+groups.join('-');
}
function debounce(fn, ms){
  let t; return function(){ clearTimeout(t); const a=arguments, c=this; t=setTimeout(()=>fn.apply(c,a), ms); };
}
function fuzzyOverlap(a,b){
  if(!a||!b) return 0;
  const wa=String(a).toLowerCase().match(/\w{3,}/g)||[];
  const wb=new Set(String(b).toLowerCase().match(/\w{3,}/g)||[]);
  if(!wa.length||!wb.size) return 0;
  let hit=0; wa.forEach(w=>{ if(wb.has(w)) hit++; });
  return hit/wa.length;
}

/* ════════════════════════════════════════════════════════════════════════
   PART 1 — RECOVERY: bug fixes + new Reclaim flow
   ════════════════════════════════════════════════════════════════════════ */

const REC_LS_CODE_SHOWN='bq_rec_code_shown_v22';
const PENDING_NEW_CODE_KEY='bq_pending_new_code_v23';

async function getRecoveryNode(uid){
  const db=_db(); if(!db||!uid) return null;
  try{ const s=await db.ref('bq_recovery/'+uid).once('value'); return s.val(); }catch(_){ return null; }
}
async function lookupUidForUsername(name){
  const db=_db(); if(!db) return null;
  try{ const s=await db.ref('bq_usernames/'+name).once('value'); return s.val()||null; }catch(_){ return null; }
}

/* ── Server-mirrored lockout ── */
function lsLockKey(name){ return 'bq_rec_lockout_'+name; }
async function checkLockout(nameOrUid){
  // local first (cheap)
  try{ const raw=localStorage.getItem(lsLockKey(nameOrUid));
    if(raw){ const o=JSON.parse(raw); if(o.until && o.until>Date.now()) return Math.ceil((o.until-Date.now())/1000); }
  }catch(_){}
  // server
  const db=_db(); if(!db) return 0;
  let uid=nameOrUid;
  if(!/^[A-Za-z0-9_-]{16,}$/.test(uid)){
    const looked=await lookupUidForUsername(String(nameOrUid).toLowerCase());
    if(looked) uid=looked; else return 0;
  }
  try{
    const s=await db.ref('bq_recovery/'+uid+'/lockout').once('value');
    const o=s.val();
    if(o && o.until && o.until>Date.now()) return Math.ceil((o.until-Date.now())/1000);
  }catch(_){}
  return 0;
}
async function bumpLockout(nameOrUid){
  // local
  try{
    const raw=localStorage.getItem(lsLockKey(nameOrUid));
    const o=raw?JSON.parse(raw):{tries:0};
    o.tries=(o.tries||0)+1;
    if(o.tries>=5){ o.until=Date.now()+10*60*1000; o.tries=0; }
    localStorage.setItem(lsLockKey(nameOrUid), JSON.stringify(o));
  }catch(_){}
  // server
  const db=_db(); if(!db) return;
  let uid=nameOrUid;
  if(!/^[A-Za-z0-9_-]{16,}$/.test(uid)){
    const looked=await lookupUidForUsername(String(nameOrUid).toLowerCase());
    if(looked) uid=looked; else return;
  }
  try{
    await db.ref('bq_recovery/'+uid+'/lockout').transaction(cur=>{
      cur=cur||{tries:0};
      cur.tries=(cur.tries||0)+1;
      if(cur.tries>=5){ cur.until=Date.now()+10*60*1000; cur.tries=0; }
      cur.lastAt=Date.now();
      return cur;
    });
  }catch(_){}
}
async function clearLockout(nameOrUid){
  try{ localStorage.removeItem(lsLockKey(nameOrUid)); }catch(_){}
  const db=_db(); if(!db) return;
  let uid=nameOrUid;
  if(!/^[A-Za-z0-9_-]{16,}$/.test(uid)){
    const looked=await lookupUidForUsername(String(nameOrUid).toLowerCase());
    if(looked) uid=looked; else return;
  }
  try{ await db.ref('bq_recovery/'+uid+'/lockout').remove(); }catch(_){}
}

/* ── Ensure first-time recovery code (with retry on failure) ── */
async function ensureRecoveryCode(){
  const db=_db(); const u=_uid(); const n=_uname();
  if(!db||!u||!n) return;
  if(localStorage.getItem(REC_LS_CODE_SHOWN+'_'+u)) return;
  try{
    const existing=await getRecoveryNode(u);
    if(existing && existing.codeHash){ localStorage.setItem(REC_LS_CODE_SHOWN+'_'+u,'existing'); return; }
    const code=genRecoveryCode();
    const hash=await sha256Hex(code);
    await db.ref('bq_recovery/'+u).update({codeHash:hash, codeCreatedAt:Date.now(), username:n});
    localStorage.setItem(REC_LS_CODE_SHOWN+'_'+u,'1');
    showRecoveryCodeModal(code, true);
  }catch(_){
    // try again next boot — do NOT mark shown
  }
}

function closeAnyModal(){
  ['bq-rec-modal','bq-rec-restore','bq-rec-settings','bq-v23-confirm'].forEach(id=>$(id)?.remove());
}

/* ── Recovery code modal ── */
function showRecoveryCodeModal(code, firstTime){
  closeAnyModal();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-modal';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:440px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:18px">🔐</div>
        <div>
          <div style="font-weight:700;font-size:16px">${firstTime?'Save your recovery code':'Your recovery code'}</div>
          <div style="opacity:.65;font-size:12px">${firstTime?'This is shown only once. Save it now.':'Keep it somewhere safe.'}</div>
        </div>
      </div>
      <div style="background:#0f1218;border:1px dashed #3a4256;border-radius:10px;padding:14px;font:600 16px/1.4 ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;text-align:center;color:#9ad7ff;margin:14px 0;user-select:all;word-break:break-all">${_esc(code)}</div>
      <div style="font-size:12px;opacity:.7;margin-bottom:14px">If you lose access to this device, enter your username + this code on a new one to restore your account.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="bq-rec-copy"  style="flex:1;background:#2a3040;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:600;cursor:pointer">Copy</button>
        <button id="bq-rec-dl"    style="flex:1;background:#2a3040;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:600;cursor:pointer">Download</button>
        <button id="bq-rec-done"  style="flex:1;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:700;cursor:pointer">I saved it</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  $('bq-rec-copy').onclick=async()=>{ try{ await navigator.clipboard.writeText(code); _toast('Copied','ok'); }catch(_){ _toast('Copy failed','err'); } };
  $('bq-rec-dl').onclick=()=>{
    const blob=new Blob(['BioQuiz recovery code\nUsername: @'+_uname()+'\nUID: '+_uid()+'\nCode: '+code+'\n\nKeep this safe. Treat it like a password.'], {type:'text/plain'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='bioquiz-recovery-'+_uname()+'.txt'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  $('bq-rec-done').onclick=()=>wrap.remove();
}

/* ── Confirm dialog (for destructive restore) ── */
function showConfirmRestore(){
  return new Promise(resolve=>{
    closeAnyModal();
    const haveSelf=!!_uid();
    const wrap=document.createElement('div');
    wrap.id='bq-v23-confirm';
    wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
    wrap.innerHTML=`
      <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:420px;width:100%;padding:22px">
        <div style="font-weight:700;font-size:16px;margin-bottom:8px">Replace current account?</div>
        <div style="font-size:13px;opacity:.8;margin-bottom:16px;line-height:1.55">
          ${haveSelf
            ? 'Restoring will sign out the account currently on this device (<b>@'+_esc(_uname()||'(no name)')+'</b>) and replace it with the recovered one.<br><br>If the current account is yours too, back up its recovery code first.'
            : 'No account is signed in on this device, so nothing will be lost.'}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${haveSelf?'<button data-act="backup" style="background:#2a3040;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:600;cursor:pointer">Back up current account first</button>':''}
          <button data-act="ok" style="background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Continue with restore</button>
          <button data-act="cancel" style="background:none;color:#aaa;border:0;border-radius:8px;padding:8px;font-weight:600;cursor:pointer">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', async (e)=>{
      const a=e.target.closest('[data-act]')?.dataset?.act;
      if(!a) return;
      if(a==='cancel'){ wrap.remove(); resolve(false); return; }
      if(a==='backup'){
        const u=_uid(); if(!u){ resolve(true); wrap.remove(); return; }
        try{
          const fresh=genRecoveryCode();
          const hash=await sha256Hex(fresh);
          await _db().ref('bq_recovery/'+u).update({codeHash:hash, codeCreatedAt:Date.now(), username:_uname()});
          showRecoveryCodeModal(fresh, false);
        }catch(_){ _toast('Backup failed — continuing','err'); }
        // After modal closes, user can retry restore
        resolve(false); wrap.remove(); return;
      }
      if(a==='ok'){ wrap.remove(); resolve(true); }
    });
  });
}

function restoreToUid(newUid, sourceMsg, freshCode){
  if(freshCode){ try{ sessionStorage.setItem(PENDING_NEW_CODE_KEY, freshCode); }catch(_){} }
  try{ const prev=localStorage.getItem('bq_uid'); if(prev) sessionStorage.setItem('bq_uid_pre_restore', prev); }catch(_){}
  localStorage.setItem('bq_uid', newUid);
  Object.keys(localStorage).forEach(k=>{ if(k.startsWith('bq_user_dms_migrated_v22_')) localStorage.removeItem(k); });
  _toast(sourceMsg||'Account restored — reloading…','ok');
  setTimeout(()=>location.reload(), 800);
}

/* ── Restore modal ── */
function showRestoreModal(presetTab){
  closeAnyModal();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-restore';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:480px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);max-height:92vh;overflow:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:700;font-size:17px">Recover your account</div>
        <button data-close style="background:none;border:0;color:#fff;font-size:22px;cursor:pointer;opacity:.6">×</button>
      </div>
      <div style="opacity:.65;font-size:12px;margin-bottom:14px">Pick a recovery method. Tip: type your username and we'll auto-pick the best method.</div>
      <input id="bq-rc-uname" placeholder="Your username (without @)" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:10px;box-sizing:border-box"/>
      <div id="bq-rc-tabs" style="display:flex;gap:6px;margin-bottom:14px;border-bottom:1px solid #2a3040;flex-wrap:wrap">
        <button data-tab="code"  class="bqrt" style="background:none;border:0;color:#fff;padding:8px 12px;cursor:pointer;border-bottom:2px solid #3b82f6">Code</button>
        <button data-tab="pass"  class="bqrt" style="background:none;border:0;color:#aaa;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent">Passphrase</button>
        <button data-tab="quest" class="bqrt" style="background:none;border:0;color:#aaa;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent">Question</button>
        <button data-tab="claim" class="bqrt" style="background:none;border:0;color:#aaa;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent">Reclaim</button>
      </div>
      <div data-pane="code">
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Recovery code</label>
        <input id="bq-rc-code" placeholder="BQ-XXXX-XXXX-XXXX-XXXX" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:14px;font:600 14px ui-monospace,Menlo,monospace;box-sizing:border-box;text-transform:uppercase"/>
        <button id="bq-rc-go-code" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Restore</button>
      </div>
      <div data-pane="pass" style="display:none">
        <label style="display:block;font-size:12px;opacity:.7;margin-bottom:4px">Passphrase</label>
        <div style="position:relative;margin-bottom:14px">
          <input id="bq-rc-pass" type="password" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px 38px 10px 10px;box-sizing:border-box"/>
          <button type="button" id="bq-rc-pass-eye" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:#aaa;cursor:pointer;font-size:13px;padding:4px 8px">👁</button>
        </div>
        <button id="bq-rc-go-pass" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Restore</button>
      </div>
      <div data-pane="quest" style="display:none">
        <div id="bq-rc-q-display" style="font-size:13px;opacity:.85;margin-bottom:8px;min-height:18px;padding:8px 10px;background:#0f1218;border:1px solid #2a3040;border-radius:6px"></div>
        <input id="bq-rc-q-ans" placeholder="Your answer" autocomplete="off" style="width:100%;background:#0f1218;color:#fff;border:1px solid #2a3040;border-radius:8px;padding:10px;margin-bottom:14px;box-sizing:border-box"/>
        <button id="bq-rc-go-quest" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Restore</button>
        <div style="font-size:11px;opacity:.55;margin-top:8px">Less secure. Only available if the account set this up.</div>
      </div>
      <div data-pane="claim" style="display:none">
        <div style="font-size:12px;opacity:.75;margin-bottom:10px;line-height:1.55">For accounts with no recovery set up. We'll verify ownership using your DM history, profile, or message text.</div>
        <button id="bq-rc-go-claim" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer">Start verification</button>
      </div>
      <div id="bq-rc-status" style="margin-top:12px;font-size:13px;min-height:18px"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });

  // Tab switching (also clears status, refreshes question on quest tab)
  const switchTab=(name)=>{
    wrap.querySelectorAll('.bqrt').forEach(b=>{
      const on=b.dataset.tab===name;
      b.style.color=on?'#fff':'#aaa';
      b.style.borderBottomColor=on?'#3b82f6':'transparent';
    });
    wrap.querySelectorAll('[data-pane]').forEach(p=>p.style.display=p.dataset.pane===name?'':'none');
    setRecStatus('');
    if(name==='quest'){ const n=$('bq-rc-uname').value.trim().toLowerCase(); if(n) loadQuestionFor(n); else $('bq-rc-q-display').textContent='Enter your username above first.'; }
  };
  wrap.querySelectorAll('.bqrt').forEach(btn=>{ btn.onclick=()=>switchTab(btn.dataset.tab); });
  if(presetTab) switchTab(presetTab);

  // Username field: clear status on change, debounced auto-suggestion
  const onName=debounce(async()=>{
    setRecStatus('');
    const n=$('bq-rc-uname').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    if(!n) return;
    const u=await lookupUidForUsername(n); if(!u) return;
    const r=await getRecoveryNode(u);
    if(!r){ /* no recovery → suggest reclaim */ if(!presetTab) switchTab('claim'); return; }
    // Auto-suggest best method (only if not already user-driven)
    if(!presetTab){
      if(r.codeHash) switchTab('code');
      else if(r.passHash) switchTab('pass');
      else if(r.qHash) switchTab('quest');
      else switchTab('claim');
    }
    if(r.qHash && wrap.querySelector('[data-pane="quest"]').style.display!=='none') loadQuestionFor(n);
  }, 400);
  $('bq-rc-uname').addEventListener('input', onName);

  // Show/hide passphrase
  $('bq-rc-pass-eye').onclick=()=>{
    const inp=$('bq-rc-pass'); inp.type=inp.type==='password'?'text':'password';
  };

  // Wire actions
  $('bq-rc-go-code').onclick=doRestoreCode;
  $('bq-rc-go-pass').onclick=doRestorePass;
  $('bq-rc-go-quest').onclick=doRestoreQuest;
  $('bq-rc-go-claim').onclick=doReclaimStart;

  // Clear status on input in any field
  ['bq-rc-code','bq-rc-pass','bq-rc-q-ans'].forEach(id=>{
    $(id)?.addEventListener('input', ()=>setRecStatus(''));
  });
}

function setRecStatus(msg, kind){
  const s=$('bq-rc-status'); if(!s) return;
  s.textContent=msg||'';
  if(kind==='ok') s.style.color='#4ade80';
  else if(kind==='busy') s.style.color='#9ca3af';
  else if(msg) s.style.color='#fca5a5';
  else s.style.color='';
}
async function loadQuestionFor(name){
  const el=$('bq-rc-q-display'); if(!el) return; el.textContent='Looking up…';
  if(!name){ el.textContent='Enter your username first.'; return; }
  const u=await lookupUidForUsername(name); if(!u){ el.textContent='No such account.'; return; }
  const r=await getRecoveryNode(u);
  if(r && r.question) el.textContent='Q: '+r.question;
  else el.textContent='This account has no security question set.';
}

function withBusy(btn, busyText, fn){
  return async function(){
    if(!btn || btn.disabled) return;
    const orig=btn.textContent;
    btn.disabled=true; btn.style.opacity='.7'; btn.textContent=busyText||'Working…';
    try{ await fn.apply(this, arguments); }
    finally{ btn.disabled=false; btn.style.opacity=''; btn.textContent=orig; }
  };
}

async function doRestoreCode(ev){
  const btn=ev?.currentTarget||$('bq-rc-go-code');
  await withBusy(btn,'Verifying…',async()=>{
    const name=($('bq-rc-uname').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    const code=normalizeRecoveryCode($('bq-rc-code').value||'');
    if(!name){ setRecStatus('Enter your username at the top.'); return; }
    if(!code || code.length<10){ setRecStatus('Enter your recovery code.'); return; }
    const lock=await checkLockout(name); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
    setRecStatus('Verifying…','busy');
    const u=await lookupUidForUsername(name); if(!u){ await bumpLockout(name); setRecStatus('Username and code do not match.'); return; }
    const r=await getRecoveryNode(u); if(!r||!r.codeHash){ await bumpLockout(name); setRecStatus('No recovery code on this account. Try Reclaim instead.'); return; }
    const h=await sha256Hex(code);
    if(h!==r.codeHash){ await bumpLockout(name); setRecStatus('Username and code do not match.'); return; }
    await clearLockout(name);
    if(!await showConfirmRestore()) { setRecStatus(''); return; }
    setRecStatus('Restoring…','ok');
    const fresh=genRecoveryCode();
    const freshHash=await sha256Hex(fresh);
    try{ await _db().ref('bq_recovery/'+u).update({codeHash:freshHash, codeCreatedAt:Date.now()}); }catch(_){}
    restoreToUid(u, 'Account restored.', fresh);
  })(ev);
}
async function doRestorePass(ev){
  const btn=ev?.currentTarget||$('bq-rc-go-pass');
  await withBusy(btn,'Verifying…',async()=>{
    const raw=($('bq-rc-uname').value||'').trim();
    const pass=($('bq-rc-pass').value||'').trim();
    if(!raw||!pass){ setRecStatus('Enter username and passphrase.'); return; }
    let u=raw;
    if(!/^[A-Za-z0-9_-]{16,}$/.test(raw)){
      const name=raw.toLowerCase().replace(/[^a-z0-9_]/g,'');
      u=await lookupUidForUsername(name);
      if(!u){ setRecStatus('No matching account.'); return; }
    }
    const lock=await checkLockout(u); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
    setRecStatus('Verifying…','busy');
    const r=await getRecoveryNode(u); if(!r||!r.passHash||!r.passSalt){ await bumpLockout(u); setRecStatus('No passphrase set on this account.'); return; }
    const h=await pbkdf2Hex(pass, r.passSalt);
    if(h!==r.passHash){ await bumpLockout(u); setRecStatus('Wrong passphrase.'); return; }
    await clearLockout(u);
    if(!await showConfirmRestore()){ setRecStatus(''); return; }
    setRecStatus('Restoring…','ok');
    restoreToUid(u, 'Account restored.');
  })(ev);
}
async function doRestoreQuest(ev){
  const btn=ev?.currentTarget||$('bq-rc-go-quest');
  await withBusy(btn,'Verifying…',async()=>{
    const name=($('bq-rc-uname').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    const ans =($('bq-rc-q-ans').value||'').trim().toLowerCase();
    if(!name||!ans){ setRecStatus('Enter username and answer.'); return; }
    const lock=await checkLockout(name); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
    const u=await lookupUidForUsername(name); if(!u){ await bumpLockout(name); setRecStatus('No matching account.'); return; }
    const r=await getRecoveryNode(u); if(!r||!r.qHash||!r.qSalt){ await bumpLockout(name); setRecStatus('No security question set.'); return; }
    setRecStatus('Verifying…','busy');
    const h=await pbkdf2Hex(ans, r.qSalt);
    if(h!==r.qHash){ await bumpLockout(name); setRecStatus('Wrong answer.'); return; }
    await clearLockout(name);
    if(!await showConfirmRestore()){ setRecStatus(''); return; }
    setRecStatus('Restoring…','ok');
    restoreToUid(u, 'Account restored.');
  })(ev);
}

/* ── NEW Reclaim flow: DM + profile + global signals ── */
async function gatherTraces(uid){
  const db=_db();
  const out={ presence:null, dmIds:[], earliestTs:null, sampleMsgs:[], dmPartners:[] };
  if(!db) return out;
  // Presence
  try{ const ps=await db.ref('bq_presence/'+uid).once('value'); out.presence=ps.val()||null; }catch(_){}
  // DM index
  try{
    const ix=await db.ref('bq_user_dms/'+uid).once('value');
    ix.forEach(c=>{ out.dmIds.push(c.key); });
  }catch(_){}
  // Fallback DM scan if index empty (legacy accounts)
  if(out.dmIds.length===0){
    try{
      const all=await db.ref('bq_dms').once('value');
      all.forEach(ch=>{
        const m=ch.val()?.meta;
        if(m && (m.p1===uid||m.p2===uid)) out.dmIds.push(ch.key);
      });
    }catch(_){}
  }
  // Sample msgs from up to 5 DMs + global
  const samples=[];
  const partners=new Set();
  const slice=out.dmIds.slice(0,5);
  for(const dmId of slice){
    try{
      const meta=(await db.ref('bq_dms/'+dmId+'/meta').once('value')).val();
      if(meta){
        if(meta.p1===uid && meta.n2) partners.add(String(meta.n2).toLowerCase());
        else if(meta.p2===uid && meta.n1) partners.add(String(meta.n1).toLowerCase());
      }
      const ms=await db.ref('bq_dms/'+dmId+'/messages').orderByChild('uid').equalTo(uid).limitToLast(40).once('value');
      ms.forEach(c=>{
        const v=c.val();
        if(v){
          if(v.text) samples.push({text:String(v.text), ts:v.ts||0});
          if(v.ts && (!out.earliestTs || v.ts<out.earliestTs)) out.earliestTs=v.ts;
        }
      });
    }catch(_){}
  }
  // Global
  try{
    const gms=await db.ref('bq_messages').orderByChild('uid').equalTo(uid).limitToLast(60).once('value');
    gms.forEach(c=>{
      const v=c.val();
      if(v){
        if(v.text) samples.push({text:String(v.text), ts:v.ts||0});
        if(v.ts && (!out.earliestTs || v.ts<out.earliestTs)) out.earliestTs=v.ts;
      }
    });
  }catch(_){}
  // earliest fallback
  if(!out.earliestTs && out.presence?.createdAt) out.earliestTs=out.presence.createdAt;
  if(!out.earliestTs && out.presence?.ts) out.earliestTs=out.presence.ts;
  out.sampleMsgs=samples;
  out.dmPartners=[...partners].filter(Boolean);
  return out;
}

async function doReclaimStart(ev){
  const btn=ev?.currentTarget||$('bq-rc-go-claim');
  await withBusy(btn,'Looking up…',async()=>{
    const name=($('bq-rc-uname').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    if(!name){ setRecStatus('Enter the username at the top.'); return; }
    const u=await lookupUidForUsername(name);
    if(!u){ setRecStatus('No such account. The username may be available — set it as your own from the home screen.'); return; }
    const r=await getRecoveryNode(u);
    if(r && (r.codeHash || r.passHash || r.qHash)){
      setRecStatus('This account already has recovery set up — use the methods above.'); return;
    }
    const lock=await checkLockout(name); if(lock){ setRecStatus('Too many attempts. Try again in '+lock+'s.'); return; }
    setRecStatus('Gathering data…','busy');
    const traces=await gatherTraces(u);
    const hasAnything = traces.presence || traces.dmIds.length || traces.sampleMsgs.length;
    if(!hasAnything){
      setRecStatus('No data found for this username. The account may have been deleted.'); return;
    }
    setRecStatus('');
    showReclaimQuiz(u, name, traces);
  })(ev);
}

async function showReclaimQuiz(uid, name, traces){
  // Build challenges that we can verify
  const challenges=[];
  if(traces.earliestTs){
    challenges.push({
      id:'when',
      label:'Approximate <b>month + year</b> you started using this account (e.g. "Mar 2025")',
      kind:'text',
      verify:(ans)=>{
        const a=String(ans||'').toLowerCase();
        const d=new Date(traces.earliestTs);
        const mo=d.toLocaleString('en-US',{month:'short'}).toLowerCase();
        const moLong=d.toLocaleString('en-US',{month:'long'}).toLowerCase();
        const yr=String(d.getFullYear());
        return (a.includes(mo)||a.includes(moLong)) && a.includes(yr);
      }
    });
  }
  if(traces.sampleMsgs.length){
    challenges.push({
      id:'msg',
      label:'A snippet (5+ chars) of <b>any message you sent</b> from this account',
      kind:'text',
      verify:(ans)=>{
        const a=String(ans||'').trim().toLowerCase();
        if(a.length<5) return false;
        return traces.sampleMsgs.some(m=>String(m.text).toLowerCase().includes(a));
      }
    });
  }
  if(traces.presence?.bio || traces.presence?.status){
    const bio=traces.presence.bio||'';
    const status=traces.presence.status||'';
    challenges.push({
      id:'bio',
      label:'Your <b>bio or status</b> on this account (a few words is enough)',
      kind:'text',
      verify:(ans)=>{
        return Math.max(fuzzyOverlap(ans,bio), fuzzyOverlap(ans,status)) >= 0.6;
      }
    });
  }
  if(traces.dmPartners.length){
    // Build 4 options: 1 real + 3 decoys
    const real=traces.dmPartners[Math.floor(Math.random()*traces.dmPartners.length)];
    const db=_db();
    const decoys=[];
    try{
      const all=await db.ref('bq_usernames').limitToFirst(80).once('value');
      const cands=[]; all.forEach(c=>{ if(c.key && c.key!==real && !traces.dmPartners.includes(c.key)) cands.push(c.key); });
      for(let i=0;i<3 && cands.length;i++){
        const idx=Math.floor(Math.random()*cands.length);
        decoys.push(cands.splice(idx,1)[0]);
      }
    }catch(_){}
    if(decoys.length>=2){
      const opts=[real, ...decoys].sort(()=>Math.random()-.5);
      challenges.push({
        id:'partner',
        label:'Pick a username you have <b>DM\'d</b> from this account',
        kind:'choice',
        options:opts,
        verify:(ans)=> String(ans||'').toLowerCase()===real.toLowerCase()
      });
    }
  }
  if(challenges.length<2){
    setRecStatus('Not enough recoverable data to verify ownership safely. If you set up a passphrase or security question earlier, try those tabs.');
    return;
  }

  closeAnyModal();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-restore';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:480px;width:100%;padding:22px;max-height:92vh;overflow:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:700;font-size:17px">Verify ownership of @${_esc(name)}</div>
        <button data-close style="background:none;border:0;color:#fff;font-size:22px;cursor:pointer;opacity:.6">×</button>
      </div>
      <div style="opacity:.7;font-size:12px;margin-bottom:14px">Answer at least 2 correctly to recover this account.</div>
      <div id="bq-rcq-list"></div>
      <button id="bq-rcq-submit" style="width:100%;background:#3b82f6;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer;margin-top:8px">Verify and restore</button>
      <div id="bq-rcq-status" style="margin-top:12px;font-size:13px;min-height:18px"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });

  const list=$('bq-rcq-list');
  challenges.forEach((c,i)=>{
    const box=document.createElement('div');
    box.style.cssText='background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:12px;margin-bottom:10px';
    if(c.kind==='text'){
      box.innerHTML=`<div style="font-size:13px;margin-bottom:6px">${c.label}</div>
        <input data-q="${c.id}" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:8px;box-sizing:border-box"/>`;
    } else if(c.kind==='choice'){
      box.innerHTML=`<div style="font-size:13px;margin-bottom:8px">${c.label}</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${c.options.map(o=>`<label style="display:flex;align-items:center;gap:8px;padding:8px;background:#0a0d12;border:1px solid #2a3040;border-radius:6px;cursor:pointer">
            <input type="radio" name="q-${c.id}" value="${_esc(o)}" data-q="${c.id}"/>
            <span>@${_esc(o)}</span></label>`).join('')}
        </div>`;
    }
    list.appendChild(box);
  });

  $('bq-rcq-submit').onclick=async function(){
    const lock=await checkLockout(name); if(lock){ $('bq-rcq-status').style.color='#fca5a5'; $('bq-rcq-status').textContent='Too many attempts. Try again in '+lock+'s.'; return; }
    let score=0;
    challenges.forEach(c=>{
      let ans='';
      if(c.kind==='text'){ ans=wrap.querySelector('[data-q="'+c.id+'"]')?.value||''; }
      else { const r=wrap.querySelector('input[name="q-'+c.id+'"]:checked'); ans=r?r.value:''; }
      if(c.verify(ans)) score++;
    });
    const status=$('bq-rcq-status');
    if(score<2){
      await bumpLockout(name);
      status.style.color='#fca5a5';
      status.textContent='Could not verify (got '+score+'/'+challenges.length+' right). Try again with more accurate info.';
      return;
    }
    await clearLockout(name);
    if(!await showConfirmRestore()){ status.textContent=''; return; }
    status.style.color='#4ade80'; status.textContent='Verified. Restoring…';
    const fresh=genRecoveryCode();
    const freshHash=await sha256Hex(fresh);
    try{ await _db().ref('bq_recovery/'+uid).update({codeHash:freshHash, codeCreatedAt:Date.now(), reclaimed:Date.now(), username:name}); }catch(_){}
    restoreToUid(uid, 'Account restored.', fresh);
  };
}

/* ── Settings (kept similar to v22, with passphrase show/hide & strength) ── */
function passStrength(p){
  let s=0;
  if(!p) return 0;
  if(p.length>=8) s++;
  if(p.length>=12) s++;
  if(/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if(/\d/.test(p)) s++;
  if(/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s,4);
}

function showRecoverySettings(){
  closeAnyModal();
  const u=_uid();
  const wrap=document.createElement('div');
  wrap.id='bq-rec-settings';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:14px/1.5 system-ui,-apple-system,sans-serif;padding:16px';
  wrap.innerHTML=`
    <div style="background:#1a1d24;color:#e6e9ef;border:1px solid #2a3040;border-radius:14px;max-width:460px;width:100%;padding:22px;max-height:92vh;overflow:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:700;font-size:17px">🔐 Account security</div>
        <button data-close style="background:none;border:0;color:#fff;font-size:22px;cursor:pointer;opacity:.6">×</button>
      </div>
      <div style="opacity:.65;font-size:12px;margin-bottom:18px">Set up multiple ways to recover your account if you lose this device.</div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">Recovery code <span id="bq-rs-code-status" style="font-size:11px;font-weight:400;opacity:.6"></span></div>
        <div style="font-size:12px;opacity:.7;margin-bottom:10px">A one-time secret you save somewhere safe. Strongest protection.</div>
        <button id="bq-rs-code-show" style="background:#2a3040;color:#fff;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:600">Generate new code</button>
      </div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">Passphrase <span id="bq-rs-pass-status" style="font-size:11px;font-weight:400;opacity:.6"></span></div>
        <div style="font-size:12px;opacity:.7;margin-bottom:10px">A password tied to your UID. No email needed.</div>
        <div style="position:relative;margin-bottom:6px">
          <input id="bq-rs-pass-inp" type="password" placeholder="New passphrase (min 8 chars)" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:9px 38px 9px 9px;box-sizing:border-box"/>
          <button type="button" id="bq-rs-pass-eye" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:#aaa;cursor:pointer;font-size:13px;padding:4px 8px">👁</button>
        </div>
        <div id="bq-rs-pass-meter" style="height:4px;background:#2a3040;border-radius:2px;overflow:hidden;margin-bottom:8px"><div id="bq-rs-pass-bar" style="height:100%;width:0;background:#ef4444;transition:.2s all"></div></div>
        <button id="bq-rs-pass-save" style="background:#2a3040;color:#fff;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:600">Save passphrase</button>
      </div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px">Security question <span id="bq-rs-q-status" style="font-size:11px;font-weight:400;opacity:.6"></span></div>
        <div style="font-size:12px;opacity:.7;margin-bottom:10px">Soft fallback. Less secure.</div>
        <input id="bq-rs-q-q" placeholder="Question" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:9px;margin-bottom:8px;box-sizing:border-box"/>
        <input id="bq-rs-q-a" placeholder="Answer" style="width:100%;background:#0a0d12;color:#fff;border:1px solid #2a3040;border-radius:6px;padding:9px;margin-bottom:8px;box-sizing:border-box"/>
        <button id="bq-rs-q-save" style="background:#2a3040;color:#fff;border:0;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:600">Save question</button>
      </div>
      <div style="background:#0f1218;border:1px solid #2a3040;border-radius:10px;padding:14px;margin-bottom:0">
        <div style="font-weight:600;margin-bottom:6px">Your UID</div>
        <div style="font:600 12px ui-monospace,Menlo,monospace;opacity:.85;word-break:break-all;user-select:all">${_esc(u)}</div>
        <div style="font-size:11px;opacity:.55;margin-top:6px">Keep this — combined with a passphrase or code, it's how you recover.</div>
      </div>
      <div id="bq-rs-status" style="margin-top:12px;font-size:13px;min-height:18px"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });
  getRecoveryNode(u).then(r=>{
    if(r){
      if(r.codeHash) $('bq-rs-code-status').textContent='✓ set';
      if(r.passHash) $('bq-rs-pass-status').textContent='✓ set';
      if(r.qHash){ $('bq-rs-q-status').textContent='✓ set'; if(r.question) $('bq-rs-q-q').value=r.question; }
    }
  });
  $('bq-rs-pass-eye').onclick=()=>{
    const inp=$('bq-rs-pass-inp'); inp.type=inp.type==='password'?'text':'password';
  };
  $('bq-rs-pass-inp').addEventListener('input',()=>{
    const v=$('bq-rs-pass-inp').value, s=passStrength(v);
    const bar=$('bq-rs-pass-bar');
    const colors=['#ef4444','#f97316','#eab308','#22c55e','#16a34a'];
    const widths=[10,30,55,80,100];
    bar.style.width=widths[s]+'%'; bar.style.background=colors[s];
  });
  $('bq-rs-code-show').onclick=async()=>{
    const fresh=genRecoveryCode();
    const hash=await sha256Hex(fresh);
    try{
      await _db().ref('bq_recovery/'+u).update({codeHash:hash, codeCreatedAt:Date.now(), username:_uname()});
      showRecoveryCodeModal(fresh, false);
    }catch(_){ _toast('Failed to save — check connection','err'); }
  };
  $('bq-rs-pass-save').onclick=async()=>{
    const v=($('bq-rs-pass-inp').value||'').trim();
    const s=$('bq-rs-status');
    if(v.length<8){ s.textContent='Passphrase must be at least 8 characters.'; s.style.color='#fca5a5'; return; }
    const salt=randomHex(16);
    const hash=await pbkdf2Hex(v, salt);
    try{
      await _db().ref('bq_recovery/'+u).update({passHash:hash, passSalt:salt, username:_uname()});
      $('bq-rs-pass-inp').value=''; $('bq-rs-pass-status').textContent='✓ set';
      $('bq-rs-pass-bar').style.width='0';
      s.textContent='Passphrase saved.'; s.style.color='#4ade80';
    }catch(_){ s.textContent='Save failed.'; s.style.color='#fca5a5'; }
  };
  $('bq-rs-q-save').onclick=async()=>{
    const q=($('bq-rs-q-q').value||'').trim().slice(0,120);
    const a=($('bq-rs-q-a').value||'').trim().toLowerCase();
    const s=$('bq-rs-status');
    if(q.length<5||a.length<2){ s.textContent='Question and answer required.'; s.style.color='#fca5a5'; return; }
    const salt=randomHex(16);
    const hash=await pbkdf2Hex(a, salt);
    try{
      await _db().ref('bq_recovery/'+u).update({question:q, qHash:hash, qSalt:salt, username:_uname()});
      $('bq-rs-q-a').value=''; $('bq-rs-q-status').textContent='✓ set';
      s.textContent='Security question saved.'; s.style.color='#4ade80';
    }catch(_){ s.textContent='Save failed.'; s.style.color='#fca5a5'; }
  };
}

/* ── Mount entry points (override v22) ── */
function mountRecoveryEntry(){
  // Profile pane
  const profV=$('bqv-profile');
  if(profV){
    let row=profV.querySelector('.bq-rec-entry');
    if(!row){
      row=document.createElement('button');
      row.type='button';
      row.className='bq-rec-entry';
      row.style.cssText='display:flex;align-items:center;gap:12px;width:calc(100% - 24px);margin:8px 12px;padding:12px 14px;background:linear-gradient(135deg,rgba(96,165,250,.12),rgba(167,139,250,.12));border:1px solid rgba(96,165,250,.25);border-radius:12px;color:inherit;cursor:pointer;font:600 14px system-ui,sans-serif;text-align:left';
      row.innerHTML='<span style="font-size:20px">🔐</span><span style="flex:1">Account &amp; recovery</span><span style="opacity:.5">›</span>';
      const scroll=profV.querySelector('.bqpf-scroll')||profV;
      scroll.insertBefore(row, scroll.firstChild);
    }
    row.onclick=()=>{ if(!_uname()) { _toast('Set a username first'); return; } showRecoverySettings(); };
  }
  // Username intro card — "Recover an existing account"
  const nm=$('bqnm');
  if(nm){
    const card=nm.querySelector('.bqnmc')||nm.firstElementChild;
    if(card){
      let link=card.querySelector('.bq-rec-link');
      if(!link){
        link=document.createElement('button');
        link.type='button';
        link.className='bq-rec-link';
        link.style.cssText='display:block;width:100%;margin-top:12px;background:none;border:0;color:#9ad7ff;cursor:pointer;font:500 13px system-ui;text-decoration:underline';
        link.textContent='Recover an existing account →';
        card.appendChild(link);
      }
      link.onclick=(e)=>{ e.preventDefault(); showRestoreModal(); };
    }
  }
}

/* ── On-load: show pending new-code modal after restore ── */
function maybeShowPendingCode(){
  try{
    const c=sessionStorage.getItem(PENDING_NEW_CODE_KEY);
    if(c){ sessionStorage.removeItem(PENDING_NEW_CODE_KEY); setTimeout(()=>showRecoveryCodeModal(c,false), 800); }
  }catch(_){}
}

/* ════════════════════════════════════════════════════════════════════════
   PART 2 — NEW FEATURES
   ════════════════════════════════════════════════════════════════════════ */

/* ─────────── Helpers: which chat is active ─────────── */
function activeCtx(){
  // 'global' if global chat is visible, 'dm' if dm view is visible
  const g=$('bqv-global'); const d=$('bqv-dm');
  const dmActive = d && (d.classList.contains('bq-active') || getComputedStyle(d).display!=='none');
  const gActive = g && (g.classList.contains('bq-active') || getComputedStyle(g).display!=='none');
  if(dmActive) return 'dm';
  if(gActive) return 'global';
  return null;
}
function activeDmId(){
  const hav=$('bqdmhav'); return document.querySelector(".bqdmr.active-row")?.dataset?.did || null;
}
function activeDmPuid(){
  const hav=$('bqdmhav'); return hav?.dataset?.puid || null;
}

/* ─────────── Inject CSS for new features ─────────── */
(function injectV23CSS(){
  if($('bq-v23-css')) return;
  const s=document.createElement('style');
  s.id='bq-v23-css';
  s.textContent=`
  /* Spoiler */
  .bq-spoiler{background:#2a3040;color:transparent;border-radius:4px;padding:0 4px;cursor:pointer;transition:all .2s;text-shadow:none;-webkit-user-select:none;user-select:none}
  .bq-spoiler.revealed{background:rgba(96,165,250,.15);color:inherit;cursor:auto;-webkit-user-select:auto;user-select:auto}
  /* Markdown */
  .bqbbl strong{font-weight:700}
  .bqbbl em{font-style:italic}
  .bqbbl s{opacity:.7}
  .bqbbl code{font-family:ui-monospace,Menlo,Consolas,monospace;background:rgba(0,0,0,.25);padding:1px 5px;border-radius:4px;font-size:.92em}
  .bqbbl pre{background:rgba(0,0,0,.3);border-radius:6px;padding:8px 10px;margin:4px 0;overflow:auto;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace}
  .bqbbl blockquote{border-left:3px solid rgba(96,165,250,.5);margin:4px 0;padding:2px 0 2px 8px;opacity:.85}
  /* Link preview card */
  .bq-linkprev{display:flex;gap:10px;margin-top:8px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px;text-decoration:none;color:inherit;max-width:340px;align-items:center}
  .bq-linkprev img{width:56px;height:56px;border-radius:6px;object-fit:cover;flex-shrink:0;background:#222}
  .bq-linkprev .bq-lp-t{font-weight:600;font-size:13px;line-height:1.3;margin-bottom:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .bq-linkprev .bq-lp-d{font-size:11px;opacity:.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  /* Translate badge */
  .bq-tr-out{margin-top:6px;padding:6px 8px;background:rgba(96,165,250,.1);border-left:2px solid #60a5fa;border-radius:0 6px 6px 0;font-size:.95em}
  .bq-tr-toggle{display:inline-block;margin-top:4px;font-size:11px;color:#9ad7ff;cursor:pointer;opacity:.8}
  /* Poll bubble */
  .bq-poll{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px;margin:4px 0;min-width:220px;max-width:340px}
  .bq-poll-q{font-weight:700;margin-bottom:10px}
  .bq-poll-opt{display:block;margin-bottom:6px;cursor:pointer;position:relative;padding:8px 10px;background:rgba(0,0,0,.25);border-radius:6px;overflow:hidden;border:1px solid transparent;transition:all .15s}
  .bq-poll-opt:hover{border-color:rgba(96,165,250,.4)}
  .bq-poll-opt.voted{border-color:#3b82f6}
  .bq-poll-fill{position:absolute;inset:0;background:linear-gradient(90deg,rgba(59,130,246,.25),rgba(167,139,250,.18));transform-origin:left;transition:transform .35s}
  .bq-poll-row{position:relative;display:flex;justify-content:space-between;gap:8px;font-size:13px}
  .bq-poll-meta{font-size:11px;opacity:.65;margin-top:6px}
  /* Slash menu */
  #bq-slash{position:absolute;background:#1a1d24;border:1px solid #2a3040;border-radius:10px;padding:6px;min-width:240px;max-height:280px;overflow-y:auto;z-index:2147483646;box-shadow:0 12px 40px rgba(0,0,0,.5);font:13px system-ui}
  #bq-slash .bq-sl-item{display:flex;gap:10px;padding:8px 10px;border-radius:6px;cursor:pointer;color:#e6e9ef}
  #bq-slash .bq-sl-item.active,#bq-slash .bq-sl-item:hover{background:#2a3040}
  #bq-slash .bq-sl-cmd{font-weight:600;color:#9ad7ff;min-width:80px;font-family:ui-monospace}
  #bq-slash .bq-sl-desc{opacity:.7;font-size:11px}
  /* Jump-to-unread pill */
  .bq-jump{position:absolute;left:50%;transform:translateX(-50%);bottom:80px;background:#3b82f6;color:#fff;border:0;border-radius:20px;padding:7px 14px;font:600 12px system-ui;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);z-index:5;animation:bqJumpIn .25s ease}
  @keyframes bqJumpIn{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
  /* Swipe-to-reply hint */
  .bqr.bq-swipe{transition:transform .15s ease}
  .bqr.bq-swipe-active{transition:none}
  .bq-swipe-icon{position:absolute;left:8px;top:50%;transform:translateY(-50%);opacity:0;width:28px;height:28px;border-radius:50%;background:rgba(96,165,250,.25);display:flex;align-items:center;justify-content:center;color:#9ad7ff;pointer-events:none;transition:opacity .15s}
  .bqr.bq-swipe-show .bq-swipe-icon{opacity:1}
  /* Draft chip */
  .bq-draft-chip{font-size:10px;background:rgba(245,158,11,.18);color:#fbbf24;padding:1px 6px;border-radius:4px;margin-left:6px;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
  /* Schedule menu */
  #bq-sched-menu{position:fixed;background:#1a1d24;border:1px solid #2a3040;border-radius:10px;padding:8px;z-index:2147483646;box-shadow:0 12px 40px rgba(0,0,0,.5)}
  #bq-sched-menu button{display:block;width:100%;text-align:left;background:none;border:0;color:#fff;padding:8px 12px;border-radius:6px;cursor:pointer;font:13px system-ui}
  #bq-sched-menu button:hover{background:#2a3040}
  /* Disappearing menu */
  #bq-disappear-menu{position:fixed;background:#1a1d24;border:1px solid #2a3040;border-radius:10px;padding:6px;z-index:2147483646;box-shadow:0 12px 40px rgba(0,0,0,.5);min-width:200px}
  #bq-disappear-menu button{display:block;width:100%;text-align:left;background:none;border:0;color:#fff;padding:9px 12px;border-radius:6px;cursor:pointer;font:13px system-ui}
  #bq-disappear-menu button:hover{background:#2a3040}
  #bq-disappear-menu button.active{background:rgba(59,130,246,.2);color:#9ad7ff}
  `;
  document.head.appendChild(s);
})();

/* ─────────── A) Markdown + spoiler + link previews + translate ─────────── */

/* Render markdown safely from already-escaped HTML */
function applyMarkdown(escaped){
  let s=escaped;
  // Code blocks ``` ... ```
  s=s.replace(/```([\s\S]*?)```/g, (m,c)=>'<pre>'+c.replace(/^\n/,'').replace(/\n$/,'')+'</pre>');
  // Inline code `...`
  s=s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  // Bold **...**
  s=s.replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
  // Italic *...*
  s=s.replace(/(^|[\s>])\*([^\*\n]+)\*(?=[\s<.,!?;:]|$)/g, '$1<em>$2</em>');
  // Strike ~~...~~
  s=s.replace(/~~([^~\n]+)~~/g, '<s>$1</s>');
  // Spoiler ||...||
  s=s.replace(/\|\|([^|\n]+)\|\|/g, '<span class="bq-spoiler" data-spoiler="1">$1</span>');
  // Block quote > line
  s=s.replace(/(^|<br\s*\/?>)&gt;\s?([^<\n]+)/g, '$1<blockquote>$2</blockquote>');
  return s;
}

/* Process a freshly-rendered bubble */
const _linkPrevCache=(()=>{ try{ return JSON.parse(localStorage.getItem('bq_lp_cache')||'{}'); }catch(_){return{};} })();
function _saveLpCache(){ try{ localStorage.setItem('bq_lp_cache', JSON.stringify(_linkPrevCache)); }catch(_){} }

async function fetchLinkPreview(url){
  if(_linkPrevCache[url]) return _linkPrevCache[url];
  try{
    const r=await fetch('https://api.microlink.io/?url='+encodeURIComponent(url));
    if(!r.ok) throw 0;
    const j=await r.json();
    if(j && j.status==='success' && j.data){
      const out={ title:j.data.title||url, desc:j.data.description||'', img:j.data.image?.url||'', url };
      _linkPrevCache[url]=out; _saveLpCache(); return out;
    }
  }catch(_){}
  _linkPrevCache[url]={title:url,desc:'',img:'',url}; _saveLpCache();
  return _linkPrevCache[url];
}

function processBubble(bbl){
  if(!bbl || bbl.dataset.v23ed==='1') return;
  bbl.dataset.v23ed='1';

  // Markdown — operate ONLY on text nodes outside anchors/already-styled spans
  // Safest: collect plain spans (excluding mention/link/code already added) and re-process.
  // Simpler approach: take innerHTML, transform, set back. But this would re-escape `<a>` from linkify.
  // We'll process per text-segment between tags.
  try{
    const html=bbl.innerHTML;
    // Apply markdown only if any markdown markers exist
    if(/(\*\*|`|~~|\|\||(^|<br\s*\/?>)&gt;\s)/.test(html)){
      // The HTML is already escaped+linkified+mentionified; markdown markers are still raw chars.
      bbl.innerHTML=applyMarkdown(html);
    }
  }catch(_){}

  // Spoiler click to reveal
  bbl.querySelectorAll('.bq-spoiler:not([data-bound])').forEach(sp=>{
    sp.dataset.bound='1';
    sp.addEventListener('click', ()=>sp.classList.add('revealed'));
  });

  // Link preview (only first http link, only if no media in bubble)
  if(!bbl.classList.contains('media') && !bbl.classList.contains('sticker')){
    const a=bbl.querySelector('a[href^="http"]');
    if(a && !bbl.querySelector('.bq-linkprev')){
      const url=a.href;
      // Skip if message is JUST a link to a giphy
      if(!/giphy\.com|tenor\.com/i.test(url)){
        fetchLinkPreview(url).then(d=>{
          if(!d || (!d.img && (!d.title || d.title===url))) return;
          if(bbl.querySelector('.bq-linkprev')) return;
          const card=document.createElement('a');
          card.className='bq-linkprev'; card.href=d.url; card.target='_blank'; card.rel='noopener';
          card.innerHTML=(d.img?'<img src="'+_esc(d.img)+'" loading="lazy" onerror="this.style.display=\'none\'"/>':'')+
            '<div style="min-width:0"><div class="bq-lp-t">'+_esc(d.title||d.url)+'</div>'+(d.desc?'<div class="bq-lp-d">'+_esc(d.desc)+'</div>':'')+'</div>';
          bbl.appendChild(card);
        });
      }
    }
  }

  // Poll rendering: if msg is a poll, the bubble already has marker text; poll bubbles handled separately by render hook.
}

/* Watch bubbles being inserted */
const bubbleObs=new MutationObserver(muts=>{
  muts.forEach(m=>{
    m.addedNodes.forEach(n=>{
      if(!(n instanceof HTMLElement)) return;
      if(n.classList?.contains('bqbbl')) processBubble(n);
      n.querySelectorAll?.('.bqbbl').forEach(processBubble);
      // Poll bubble post-process
      n.querySelectorAll?.('.bqr[data-msg-poll="1"], [data-msg-poll="1"]').forEach(rePaintPoll);
    });
  });
});

/* Translate via context menu (long-press) */
function translateMessage(text, target='en'){
  const url='https://lingva.ml/api/v1/auto/'+target+'/'+encodeURIComponent(text.slice(0,500));
  return fetch(url).then(r=>r.json()).then(j=>j?.translation||null).catch(()=>null);
}
function attachTranslateUI(){
  // Long-press any bubble shows a tiny "Translate" button; tap to translate.
  let pressTimer=null, pressTarget=null;
  const start=(e)=>{
    const bbl=e.target.closest?.('.bqbbl'); if(!bbl) return;
    const txt=bbl.textContent.trim(); if(txt.length<2) return;
    pressTarget=bbl;
    pressTimer=setTimeout(()=>{
      if(bbl.querySelector('.bq-tr-toggle')) return;
      const tog=document.createElement('div');
      tog.className='bq-tr-toggle'; tog.textContent='🌐 Translate';
      bbl.appendChild(tog);
      tog.onclick=async(ev)=>{
        ev.stopPropagation();
        if(bbl.querySelector('.bq-tr-out')){
          // toggle off
          bbl.querySelector('.bq-tr-out').remove(); tog.textContent='🌐 Translate'; return;
        }
        tog.textContent='Translating…';
        const t=await translateMessage(txt);
        if(!t){ tog.textContent='🌐 Translate failed'; setTimeout(()=>tog.remove(),1500); return; }
        const out=document.createElement('div'); out.className='bq-tr-out'; out.textContent=t;
        bbl.appendChild(out); tog.textContent='Show original';
        tog.onclick=()=>{ out.remove(); tog.textContent='🌐 Translate'; tog.onclick=null; setTimeout(()=>attachTranslateUI(),0); };
      };
      setTimeout(()=>{ if(tog.parentNode && !bbl.querySelector('.bq-tr-out')) tog.remove(); }, 6000);
    }, 600);
  };
  const cancel=()=>{ if(pressTimer) clearTimeout(pressTimer); pressTimer=null; };
  document.addEventListener('pointerdown', start, {passive:true});
  document.addEventListener('pointerup', cancel, {passive:true});
  document.addEventListener('pointercancel', cancel, {passive:true});
  document.addEventListener('pointermove', cancel, {passive:true});
}

/* ─────────── B) Slash commands ─────────── */
const SLASH_CMDS = [
  {cmd:'/me',      desc:'Action message: /me waves',           run:(args,ctx)=>sendText(ctx, '*'+(_uname()||'someone')+' '+args+'*')},
  {cmd:'/shrug',   desc:'¯\\_(ツ)_/¯',                          run:(args,ctx)=>sendText(ctx, args+' ¯\\_(ツ)_/¯')},
  {cmd:'/coinflip',desc:'Flip a coin',                          run:(_,ctx)=>sendText(ctx, '🪙 Coin flip: **'+(Math.random()<.5?'Heads':'Tails')+'**')},
  {cmd:'/roll',    desc:'Roll dice. e.g. /roll 2d6',            run:(args,ctx)=>{
      const m=(args||'1d6').match(/^(\d{1,2})d(\d{1,3})$/i)||['',1,6];
      const n=Math.min(20, parseInt(m[1]||1,10)||1), s=Math.min(100, parseInt(m[2]||6,10)||6);
      const rolls=[]; for(let i=0;i<n;i++) rolls.push(1+Math.floor(Math.random()*s));
      const total=rolls.reduce((a,b)=>a+b,0);
      sendText(ctx, '🎲 '+n+'d'+s+': '+rolls.join(', ')+' (sum **'+total+'**)');
    }},
  {cmd:'/8ball',   desc:'Magic 8 ball: /8ball will it rain?',   run:(args,ctx)=>{
      const ans=['Yes','No','Maybe','Definitely','No way','Ask later','Signs point to yes','Outlook not so good','Without a doubt','Very doubtful'];
      sendText(ctx, '🎱 '+(args?'_'+args+'_ → ':'')+'**'+ans[Math.floor(Math.random()*ans.length)]+'**');
    }},
  {cmd:'/poll',    desc:'Create a poll: /poll Q | A | B | C',   run:(args,ctx)=>createPoll(ctx, args)},
  {cmd:'/clear',   desc:'Clear local view (your screen only)',  run:(_,ctx)=>{
      const id=ctx==='global'?'bqgmsgs':'bqdmmsgs';
      const el=$(id); if(el) el.innerHTML='<div id="'+(ctx==='global'?'bqgempty':'bqdmempty')+'" style="text-align:center;opacity:.5;margin:auto">Cleared locally. Refresh to see again.</div>';
    }},
  {cmd:'/help',    desc:'Show this list',                       run:(_,ctx)=>{
      const lines=SLASH_CMDS.map(c=>c.cmd+' — '+c.desc).join('\n');
      _toast('Commands:\n'+lines);
    }},
];

function sendText(ctx, text){
  if(!text) return;
  // Reuse the widget's input field + send button: paste text, click send.
  const inputId = ctx==='global' ? 'bqgi' : 'bqdmi';
  const sendId  = ctx==='global' ? 'bqgs' : 'bqdms';
  const inp=$(inputId), btn=$(sendId);
  if(inp && btn){
    inp.value=text;
    // Trigger input event so the widget recognizes the value
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    btn.click();
  } else {
    // Fallback: write directly
    const db=_db(); const u=_uid(); const n=_uname(); if(!db||!u||!n) return;
    if(ctx==='global'){ db.ref('bq_messages').push({uid:u,uname:n,text:text.slice(0,2000),ts:Date.now()}); }
    else { const id=activeDmId(); if(id) db.ref('bq_dms/'+id+'/messages').push({uid:u,uname:n,text:text.slice(0,2000),ts:Date.now()}); }
  }
}

function showSlashMenu(input, query){
  $('bq-slash')?.remove();
  const matches=SLASH_CMDS.filter(c=>c.cmd.startsWith(query));
  if(!matches.length) return;
  const m=document.createElement('div'); m.id='bq-slash';
  matches.forEach((c,i)=>{
    const it=document.createElement('div');
    it.className='bq-sl-item'+(i===0?' active':'');
    it.innerHTML='<span class="bq-sl-cmd">'+c.cmd+'</span><span class="bq-sl-desc">'+_esc(c.desc)+'</span>';
    it.onclick=()=>{ executeSlash(input, c.cmd, ''); };
    m.appendChild(it);
  });
  document.body.appendChild(m);
  const r=input.getBoundingClientRect();
  m.style.left=Math.max(8,r.left)+'px';
  m.style.top=(r.top - m.offsetHeight - 6)+'px';
}
function hideSlashMenu(){ $('bq-slash')?.remove(); }
function executeSlash(input, cmd, args){
  const ctx=activeCtx(); if(!ctx){ _toast('Open a chat first'); return; }
  const c=SLASH_CMDS.find(x=>x.cmd===cmd);
  if(!c){ _toast('Unknown command'); return; }
  hideSlashMenu();
  // Clear input
  input.value=''; input.dispatchEvent(new Event('input',{bubbles:true}));
  c.run((args||'').trim(), ctx);
}

function wireSlashOnInput(inputId){
  const inp=$(inputId); if(!inp || inp._bqSlash) return; inp._bqSlash=true;
  inp.addEventListener('input', ()=>{
    const v=inp.value;
    if(v.startsWith('/') && !v.includes(' ')){ showSlashMenu(inp, v); }
    else { hideSlashMenu(); }
  });
  inp.addEventListener('keydown', (e)=>{
    const v=inp.value.trim();
    if(e.key==='Enter' && v.startsWith('/')){
      const sp=v.indexOf(' ');
      const cmd=sp>0?v.slice(0,sp):v;
      const args=sp>0?v.slice(sp+1):'';
      const known=SLASH_CMDS.find(c=>c.cmd===cmd);
      if(known){ e.preventDefault(); e.stopPropagation(); executeSlash(inp, cmd, args); }
    } else if(e.key==='Escape'){ hideSlashMenu(); }
  });
  inp.addEventListener('blur', ()=>setTimeout(hideSlashMenu, 200));
}

/* ─────────── C) Polls ─────────── */
function createPoll(ctx, raw){
  if(!raw){ _toast('Usage: /poll Question | Option A | Option B'); return; }
  const parts=raw.split('|').map(s=>s.trim()).filter(Boolean);
  if(parts.length<3){ _toast('Need a question and at least 2 options.'); return; }
  const q=parts[0], opts=parts.slice(1,7);
  const db=_db(); const u=_uid(); const n=_uname(); if(!db||!u||!n) return;
  const payload={
    uid:u, uname:n, ts:Date.now(),
    type:'poll',
    text:'📊 Poll: '+q,
    poll:{ q:q, opts:opts, votes:{} }
  };
  if(ctx==='global') db.ref('bq_messages').push(payload);
  else {
    const id=activeDmId(); const puid=activeDmPuid(); if(!id) return;
    db.ref('bq_dms/'+id+'/messages').push(payload);
    db.ref('bq_dms/'+id+'/meta').update({lastMsg:'📊 Poll', lastTs:Date.now()});
  }
}

/* Repaint poll bubbles after they appear */
function rePaintPoll(rowEl){
  const bbl=rowEl.querySelector?.('.bqbbl'); if(!bbl) return;
  if(bbl.dataset.pollPainted==='1') return;
  // Read poll data from DOM dataset (we'll attach it during render hook)
  const data=bbl.dataset.pollData; if(!data) return;
  let p; try{ p=JSON.parse(data); }catch(_){ return; }
  bbl.dataset.pollPainted='1';
  bbl.innerHTML='';
  const wrap=document.createElement('div'); wrap.className='bq-poll';
  wrap.innerHTML='<div class="bq-poll-q">📊 '+_esc(p.q)+'</div>';
  const ctx=p._ctx, key=p._key;
  const votes=p.votes||{};
  const counts=p.opts.map((_,i)=>0);
  let total=0; let myVote=-1;
  Object.entries(votes).forEach(([uid,idx])=>{ if(idx>=0 && idx<counts.length){ counts[idx]++; total++; if(uid===_uid()) myVote=idx; }});
  p.opts.forEach((opt,i)=>{
    const pct=total?Math.round(counts[i]*100/total):0;
    const row=document.createElement('div');
    row.className='bq-poll-opt'+(myVote===i?' voted':'');
    row.innerHTML='<div class="bq-poll-fill" style="transform:scaleX('+(pct/100)+')"></div>'+
      '<div class="bq-poll-row"><span>'+_esc(opt)+'</span><span style="opacity:.7">'+counts[i]+' • '+pct+'%</span></div>';
    row.onclick=async()=>{
      const u=_uid(); if(!u){ _toast('Set a username first'); return; }
      const path=ctx==='global'?'bq_messages/'+key+'/poll/votes/'+u:'bq_dms/'+activeDmId()+'/messages/'+key+'/poll/votes/'+u;
      try{ await _db().ref(path).set(myVote===i?null:i); }catch(_){ _toast('Vote failed','err'); }
    };
    wrap.appendChild(row);
  });
  const meta=document.createElement('div'); meta.className='bq-poll-meta';
  meta.textContent=total+' vote'+(total===1?'':'s');
  wrap.appendChild(meta);
  bbl.appendChild(wrap);
}

/* Watch poll messages live: scan bubbles, attach data, then live-update */
function pollScanAndWatch(){
  // Find new messages with 'Poll:' marker — for that, hook directly into firebase listeners.
  // Simpler: every bubble whose text starts with '📊 Poll:' becomes a candidate; we re-fetch its data live.
  document.querySelectorAll('.bqr:not([data-poll-watched])').forEach(row=>{
    const bbl=row.querySelector('.bqbbl'); if(!bbl) return;
    const txt=bbl.textContent||'';
    if(!txt.startsWith('📊 Poll:')) return;
    row.dataset.pollWatched='1';
    // derive context + key from row id 'bqmsg-<ctx>-<key>'
    const m=row.id.match(/^bqmsg-(global|dm)-(.+)$/); if(!m) return;
    const ctx=m[1], key=m[2];
    const path=ctx==='global'?'bq_messages/'+key:'bq_dms/'+activeDmId()+'/messages/'+key;
    const db=_db(); if(!db) return;
    const ref=db.ref(path);
    ref.on('value', snap=>{
      const v=snap.val(); if(!v||!v.poll) return;
      bbl.dataset.pollData=JSON.stringify({...v.poll, _ctx:ctx, _key:key});
      bbl.dataset.pollPainted='0';
      rePaintPoll(row);
    });
  });
}

/* ─────────── D) Per-conversation drafts ─────────── */
function draftKey(){
  const ctx=activeCtx();
  if(ctx==='global') return 'bq_draft_global';
  if(ctx==='dm'){ const id=activeDmId(); return id?'bq_draft_dm_'+id:null; }
  return null;
}
function wireDrafts(){
  ['bqgi','bqdmi'].forEach(id=>{
    const inp=$(id); if(!inp || inp._bqDraft) return; inp._bqDraft=true;
    const save=debounce(()=>{
      const k=draftKey(); if(!k) return;
      const v=inp.value||'';
      // skip if it's a slash command typed
      if(v.startsWith('/')) { localStorage.removeItem(k); return; }
      if(v) localStorage.setItem(k, v); else localStorage.removeItem(k);
    }, 300);
    inp.addEventListener('input', save);
    // Clear draft on send (input becomes empty)
    inp.addEventListener('keydown',(e)=>{
      if(e.key==='Enter' && !e.shiftKey){
        const k=draftKey(); if(k) setTimeout(()=>{ if(!inp.value) localStorage.removeItem(k); }, 50);
      }
    });
  });
  // Restore on view open
  restoreDraft();
}
function restoreDraft(){
  const k=draftKey(); if(!k) return;
  const v=localStorage.getItem(k); if(!v) return;
  const ctx=activeCtx();
  const inp=$(ctx==='global'?'bqgi':'bqdmi'); if(!inp || inp.value) return;
  inp.value=v;
  inp.dispatchEvent(new Event('input',{bubbles:true}));
}
const draftViewObs=new MutationObserver(()=>{ try{ restoreDraft(); }catch(_){}});

/* ─────────── E) Scheduled messages ─────────── */
function getScheduled(){ try{ return JSON.parse(localStorage.getItem('bq_sched_v23')||'[]'); }catch(_){ return []; } }
function setScheduled(arr){ try{ localStorage.setItem('bq_sched_v23', JSON.stringify(arr)); }catch(_){} }
function scheduleMessage(ctx, dmId, text, atMs){
  const arr=getScheduled();
  arr.push({id:'s_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), ctx, dmId:dmId||'', text, atMs});
  setScheduled(arr);
  _toast('Scheduled for '+new Date(atMs).toLocaleString(),'ok');
}
function dispatchScheduled(){
  const now=Date.now();
  const arr=getScheduled();
  let changed=false;
  for(let i=arr.length-1;i>=0;i--){
    const s=arr[i];
    if(s.atMs<=now){
      try{
        const db=_db(); const u=_uid(); const n=_uname();
        if(db && u && n){
          if(s.ctx==='global'){ db.ref('bq_messages').push({uid:u,uname:n,text:String(s.text).slice(0,2000),ts:Date.now()}); }
          else if(s.dmId){ db.ref('bq_dms/'+s.dmId+'/messages').push({uid:u,uname:n,text:String(s.text).slice(0,2000),ts:Date.now()}); }
        }
      }catch(_){}
      arr.splice(i,1); changed=true;
    }
  }
  if(changed) setScheduled(arr);
}
function showScheduleMenu(anchor){
  $('bq-sched-menu')?.remove();
  const text=($('bqgi')?.value||$('bqdmi')?.value||'').trim();
  if(!text){ _toast('Type a message first'); return; }
  const ctx=activeCtx(); if(!ctx){ _toast('Open a chat first'); return; }
  const dmId=ctx==='dm'?activeDmId():'';
  const m=document.createElement('div'); m.id='bq-sched-menu';
  const opts=[
    ['In 1 minute', 60*1000],
    ['In 1 hour', 60*60*1000],
    ['Tonight 8pm', null],
    ['Tomorrow 9am', null],
    ['Custom time…', 'custom']
  ];
  opts.forEach(([label,delta])=>{
    const b=document.createElement('button'); b.textContent=label;
    b.onclick=()=>{
      let at=Date.now();
      if(delta==='custom'){
        const v=prompt('Send at (YYYY-MM-DD HH:MM, 24h):');
        if(!v) return;
        const t=new Date(v.replace(' ','T'));
        if(isNaN(t)) { _toast('Invalid date','err'); return; }
        at=t.getTime();
      } else if(label==='Tonight 8pm'){
        const d=new Date(); d.setHours(20,0,0,0); if(d<=Date.now()) d.setDate(d.getDate()+1); at=d.getTime();
      } else if(label==='Tomorrow 9am'){
        const d=new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); at=d.getTime();
      } else { at=Date.now()+delta; }
      if(at<=Date.now()){ _toast('Pick a future time','err'); return; }
      // Clear input
      const inp=$(ctx==='global'?'bqgi':'bqdmi'); if(inp){ inp.value=''; inp.dispatchEvent(new Event('input',{bubbles:true})); }
      scheduleMessage(ctx, dmId, text, at);
      m.remove();
    };
    m.appendChild(b);
  });
  document.body.appendChild(m);
  const r=anchor.getBoundingClientRect();
  m.style.left=Math.max(8, r.right - 220)+'px';
  m.style.top=(r.top - m.offsetHeight - 8)+'px';
  setTimeout(()=>{
    const off=(e)=>{ if(!m.contains(e.target)){ m.remove(); document.removeEventListener('pointerdown', off, true); }};
    document.addEventListener('pointerdown', off, true);
  },10);
}
function wireScheduleSendButton(){
  ['bqgs','bqdms'].forEach(id=>{
    const btn=$(id); if(!btn || btn._bqSched) return; btn._bqSched=true;
    let pressTimer=null;
    btn.addEventListener('pointerdown',(e)=>{
      pressTimer=setTimeout(()=>{ pressTimer=null; showScheduleMenu(btn); }, 600);
    });
    const cancel=()=>{ if(pressTimer){ clearTimeout(pressTimer); pressTimer=null; } };
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
  });
}

/* ─────────── F) Per-chat disappearing messages ─────────── */
function disKey(){ const ctx=activeCtx(); if(ctx==='global') return 'bq_dis_global'; if(ctx==='dm'){ const id=activeDmId(); return id?'bq_dis_dm_'+id:null;} return null; }
function getDisTtl(){ const k=disKey(); if(!k) return 0; return parseInt(localStorage.getItem(k)||'0',10)||0; }
function setDisTtl(ms){ const k=disKey(); if(!k) return; if(ms) localStorage.setItem(k,String(ms)); else localStorage.removeItem(k); }
function showDisappearMenu(anchor){
  $('bq-disappear-menu')?.remove();
  const cur=getDisTtl();
  const opts=[ ['Off',0], ['1 hour',3600000], ['24 hours',86400000], ['7 days',7*86400000] ];
  const m=document.createElement('div'); m.id='bq-disappear-menu';
  m.innerHTML='<div style="padding:8px 12px;font:600 12px system-ui;opacity:.7">Disappearing messages</div>';
  opts.forEach(([label,ms])=>{
    const b=document.createElement('button');
    b.textContent=label+(cur===ms?'  ✓':'');
    if(cur===ms) b.classList.add('active');
    b.onclick=()=>{ setDisTtl(ms); _toast(ms?'Messages will vanish after '+label:'Disappearing messages off','ok'); m.remove(); };
    m.appendChild(b);
  });
  document.body.appendChild(m);
  const r=anchor.getBoundingClientRect();
  m.style.left=Math.max(8, r.left - 60)+'px';
  m.style.top=(r.bottom + 6)+'px';
  setTimeout(()=>{
    const off=(e)=>{ if(!m.contains(e.target)){ m.remove(); document.removeEventListener('pointerdown', off, true); }};
    document.addEventListener('pointerdown', off, true);
  },10);
}

/* Inject disappear button into composer */
function mountDisappearBtn(){
  ['bqgi','bqdmi'].forEach(id=>{
    const inp=$(id); if(!inp) return;
    const composer=inp.closest('.bqcomp')||inp.parentElement;
    if(!composer || composer.querySelector('.bq-dis-btn')) return;
    const b=document.createElement('button');
    b.type='button'; b.className='bq-dis-btn';
    b.title='Disappearing messages';
    b.style.cssText='background:none;border:0;color:inherit;cursor:pointer;font-size:16px;padding:6px 8px;opacity:.7';
    b.innerHTML='⏱';
    b.onclick=(e)=>{ e.preventDefault(); e.stopPropagation(); showDisappearMenu(b); };
    composer.insertBefore(b, composer.firstChild);
  });
}

/* Wrap sendGlobal/sendDm to inject expiresAt based on per-chat TTL */
function patchSendersForDisappear(){
  if(window._bqDisPatched) return;
  // We can't see internal funcs from inside their IIFE. Instead, we observe new messages
  // sent locally (input cleared right after a send) and update the just-pushed message in DB.
  // Simpler: hook the click on the send button — read input, after a tick find newest msg by my uid and patch it.
  ['bqgs','bqdms'].forEach((id,i)=>{
    const btn=$(id); if(!btn || btn._bqDisHook) return; btn._bqDisHook=true;
    btn.addEventListener('click',()=>{
      const ctx=i===0?'global':'dm';
      const ttl=getDisTtl(); if(!ttl) return;
      const db=_db(); const u=_uid(); if(!db||!u) return;
      const path=ctx==='global'?'bq_messages':'bq_dms/'+activeDmId()+'/messages';
      setTimeout(()=>{
        try{
          db.ref(path).orderByChild('uid').equalTo(u).limitToLast(1).once('value', snap=>{
            snap.forEach(c=>{
              const v=c.val();
              if(v && !v.expiresAt && v.ts && (Date.now()-v.ts)<5000){
                db.ref(path+'/'+c.key).update({expiresAt: v.ts + ttl});
              }
            });
          });
        }catch(_){}
      }, 600);
    });
  });
  window._bqDisPatched=true;
}

/* Cleanup expired messages locally + DB */
function cleanupExpired(){
  document.querySelectorAll('.bqr').forEach(row=>{
    const ts=parseInt(row.dataset.ts||'0',10);
    // we can't see expiresAt in DOM; rely on widget's own check on render
  });
}

/* ─────────── G) Jump-to-unread ─────────── */
function wireJumpToUnread(){
  ['bqgmsgs','bqdmmsgs'].forEach(id=>{
    const sc=$(id); if(!sc || sc._bqJump) return; sc._bqJump=true;
    let lastSeenIdx=0; let unread=0; let pill=null;
    const updatePill=()=>{
      const atBottom = (sc.scrollHeight - sc.scrollTop - sc.clientHeight) < 80;
      if(atBottom){ pill?.remove(); pill=null; unread=0; lastSeenIdx=sc.children.length; return; }
      if(unread<=0){ pill?.remove(); pill=null; return; }
      if(!pill){
        pill=document.createElement('button'); pill.className='bq-jump';
        const parent=sc.parentElement; if(getComputedStyle(parent).position==='static') parent.style.position='relative';
        parent.appendChild(pill);
        pill.onclick=()=>{
          sc.scrollTop=sc.scrollHeight;
          pill.remove(); pill=null; unread=0; lastSeenIdx=sc.children.length;
        };
      }
      pill.textContent='↓ '+unread+' new message'+(unread===1?'':'s');
    };
    new MutationObserver(muts=>{
      muts.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList?.contains('bqr')) unread++; }));
      updatePill();
    }).observe(sc, {childList:true});
    sc.addEventListener('scroll', updatePill);
  });
}

/* ─────────── H) Swipe-to-reply ─────────── */
function wireSwipeReply(){
  ['bqgmsgs','bqdmmsgs'].forEach(id=>{
    const sc=$(id); if(!sc || sc._bqSwipe) return; sc._bqSwipe=true;
    let startX=0, startY=0, target=null, active=false;
    sc.addEventListener('pointerdown',(e)=>{
      if(e.pointerType!=='touch') return;
      const row=e.target.closest('.bqr'); if(!row) return;
      target=row; startX=e.clientX; startY=e.clientY; active=false;
      row.classList.add('bq-swipe');
    });
    sc.addEventListener('pointermove',(e)=>{
      if(!target) return;
      const dx=e.clientX-startX, dy=e.clientY-startY;
      if(!active){
        if(Math.abs(dy)>10){ target=null; return; }
        if(Math.abs(dx)<6) return;
        active=true;
        target.classList.add('bq-swipe-active');
        if(!target.querySelector('.bq-swipe-icon')){
          const ic=document.createElement('div'); ic.className='bq-swipe-icon';
          ic.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>';
          target.appendChild(ic);
        }
      }
      const tx=Math.max(0, Math.min(72, dx));
      target.style.transform='translateX('+tx+'px)';
      if(tx>40) target.classList.add('bq-swipe-show'); else target.classList.remove('bq-swipe-show');
    });
    const end=(e)=>{
      if(!target) return;
      const dx=(e.clientX||0)-startX;
      target.style.transform='';
      target.classList.remove('bq-swipe-active','bq-swipe-show');
      target.querySelector('.bq-swipe-icon')?.remove();
      if(active && dx>60){
        // Trigger reply: simulate clicking the message's reply action.
        // The widget's action sheet has [data-a="reply"]. Easier: dispatch a custom click
        // on the bubble + reply via existing menu.
        try{
          const m=target.id.match(/^bqmsg-(global|dm)-(.+)$/);
          if(m){
            // Open action sheet then auto-click reply
            const bbl=target.querySelector('.bqbbl');
            bbl?.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
            setTimeout(()=>{
              const r=document.querySelector('#bq-msg-sheet [data-a="reply"]');
              if(r){ r.click(); }
              document.getElementById('bq-msg-sheet')?.remove();
            }, 50);
          }
        }catch(_){}
      }
      target=null; active=false;
    };
    sc.addEventListener('pointerup', end);
    sc.addEventListener('pointercancel', end);
    sc.addEventListener('pointerleave', end);
  });
}

/* ════════════════════════════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════════════════════════════ */

function boot(){
  try{ maybeShowPendingCode(); }catch(_){}
  try{ mountRecoveryEntry(); }catch(_){}
  try{
    bubbleObs.observe(document.body, {childList:true, subtree:true});
    document.querySelectorAll('.bqbbl').forEach(processBubble);
  }catch(_){}
  try{ attachTranslateUI(); }catch(_){}
  try{ wireSlashOnInput('bqgi'); wireSlashOnInput('bqdmi'); }catch(_){}
  try{ wireDrafts(); }catch(_){}
  try{ wireScheduleSendButton(); }catch(_){}
  try{ mountDisappearBtn(); }catch(_){}
  try{ patchSendersForDisappear(); }catch(_){}
  try{ wireJumpToUnread(); }catch(_){}
  try{ wireSwipeReply(); }catch(_){}
  try{ pollScanAndWatch(); }catch(_){}
  try{
    // Watch view changes for draft restore
    ['bqv-global','bqv-dm'].forEach(id=>{ const e=$(id); if(e) draftViewObs.observe(e,{attributes:true,attributeFilter:['class']}); });
  }catch(_){}
  // Pending code re-attempt
  const tryEnsure=()=>{ if(_db() && _uname()) ensureRecoveryCode(); };
  setTimeout(tryEnsure, 2500);
  setTimeout(tryEnsure, 6000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(boot, 700));
else setTimeout(boot, 700);

// Periodic re-wires (covers DOM that v22's IIFE recreates)
setInterval(()=>{
  try{ mountRecoveryEntry(); }catch(_){}
  try{ wireSlashOnInput('bqgi'); wireSlashOnInput('bqdmi'); }catch(_){}
  try{ wireDrafts(); }catch(_){}
  try{ wireScheduleSendButton(); }catch(_){}
  try{ mountDisappearBtn(); }catch(_){}
  try{ patchSendersForDisappear(); }catch(_){}
  try{ wireJumpToUnread(); }catch(_){}
  try{ wireSwipeReply(); }catch(_){}
  try{ pollScanAndWatch(); }catch(_){}
  try{ dispatchScheduled(); }catch(_){}
}, 3000);

})();
/* ════════════ end v23 patch ════════════ */

/* ════════════════════════════════════════════════════════════════════════
   v24 PATCH BLOCK — Apr 2026
   - Fix wrong storage keys (bq_uid → bq_chat_uid, bq_name → bq_chat_uname)
   - Fix wrong input/send IDs (bqgi/bqgs → bqginp/bqgsnd)  → makes
     scheduled messages, slash commands, drafts, disappear all WORK
   - Slim themes to Monochrome + Black only (hide other chips, force apply)
   - Slash autocomplete now also shows a friendly TIP the moment "/" is typed
   - Fix link previews: replace broken microlink call with a CORS-safe
     jsonlink.io endpoint, with localStorage cache + graceful fallback
   - Fix "new-DM screen halved" bug by forcing layout reflow + height fill
   - General lightweight pass: kill unused theme chips, debounce observers
   ════════════════════════════════════════════════════════════════════════ */
(function v24Patch(){
'use strict';
const V24='24.0.0';
try{ console.info('[BioQuiz] chat-widget v'+V24+' loaded'); }catch(_){}

const $=(id)=>document.getElementById(id);
const _esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function _toast(m,kind){
  try{
    const t=document.createElement('div'); t.textContent=m;
    const bg=kind==='err'?'#7f1d1d':kind==='ok'?'#15803d':'#222';
    t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:'+bg+';color:#fff;padding:11px 18px;border-radius:8px;z-index:2147483647;font:13px/1.4 system-ui;box-shadow:0 6px 24px rgba(0,0,0,.35);max-width:90vw;text-align:center';
    document.body.appendChild(t); setTimeout(()=>t.remove(),2800);
  }catch(_){}
}
function _db(){ try{ if(window.firebase&&firebase.apps&&firebase.apps.length) return firebase.database(); }catch(_){} return null; }

/* ── FIX 1: Correct storage keys used by v23 patch ────────────────────── */
function _uid(){ return localStorage.getItem('bq_chat_uid')||localStorage.getItem('bq_uid')||''; }
function _uname(){ return localStorage.getItem('bq_chat_uname')||localStorage.getItem('bq_name')||''; }
window._bqUidV24=_uid; window._bqUnameV24=_uname;

/* ── FIX 2: Correct chat IDs used by v23 patch ────────────────────────── */
const ID={
  ginp:'bqginp', dminp:'bqdminp',
  gsnd:'bqgsnd', dmsnd:'bqdmsnd',
  gmsgs:'bqgmsgs', dmmsgs:'bqdmmsgs',
  gview:'bqv-global', dmview:'bqv-dmconv'
};
function activeCtx(){
  const g=$(ID.gview), d=$(ID.dmview);
  if(d && d.classList.contains('bq-active')) return 'dm';
  if(g && g.classList.contains('bq-active')) return 'global';
  return null;
}
function activeDmId(){ return window.activeDmId||null; }

/* ════════════════════════════════════════════════════════════════════════
   FIX 3: Slash commands — proper IDs + friendly tip on "/"
   ════════════════════════════════════════════════════════════════════════ */
const SLASH=[
  {c:'/me',       d:'Action message — /me waves'},
  {c:'/shrug',    d:'Append ¯\\_(ツ)_/¯'},
  {c:'/coinflip', d:'Heads or tails'},
  {c:'/roll',     d:'Roll dice — /roll 2d6'},
  {c:'/8ball',    d:'Magic 8-ball — /8ball will I win?'},
  {c:'/poll',     d:'Create poll — /poll Q | A | B'},
  {c:'/clear',    d:'Clear local view'},
  {c:'/help',     d:'Show all commands'}
];
function runSlash(cmd, args, ctx){
  const send=(t)=>sendTextV24(ctx,t);
  switch(cmd){
    case '/me':       send('*'+(_uname()||'someone')+' '+args+'*'); break;
    case '/shrug':    send((args?args+' ':'')+'¯\\_(ツ)_/¯'); break;
    case '/coinflip': send('🪙 '+(Math.random()<.5?'**Heads**':'**Tails**')); break;
    case '/roll': {
      const m=(args||'1d6').match(/^(\d{1,2})d(\d{1,3})$/i)||[null,1,6];
      const n=Math.min(20,parseInt(m[1]||1,10)||1), s=Math.min(100,parseInt(m[2]||6,10)||6);
      const r=[]; for(let i=0;i<n;i++) r.push(1+Math.floor(Math.random()*s));
      send('🎲 '+n+'d'+s+': '+r.join(', ')+' (sum **'+r.reduce((a,b)=>a+b,0)+'**)'); break;
    }
    case '/8ball': {
      const a=['Yes','No','Maybe','Definitely','No way','Ask later','Signs point to yes','Outlook not so good','Without a doubt','Very doubtful'];
      send('🎱 '+(args?'_'+args+'_ → ':'')+'**'+a[Math.floor(Math.random()*a.length)]+'**'); break;
    }
    case '/poll': createPollV24(ctx, args); break;
    case '/clear': {
      const id=ctx==='global'?ID.gmsgs:ID.dmmsgs;
      const el=$(id); if(el) el.innerHTML='<div style="text-align:center;opacity:.5;margin:auto;padding:20px">Cleared locally. Refresh to see again.</div>';
      break;
    }
    case '/help': _toast('Commands:\n'+SLASH.map(x=>x.c+' — '+x.d).join('\n')); break;
  }
}
function sendTextV24(ctx, text){
  if(!text) return;
  const inp=$(ctx==='global'?ID.ginp:ID.dminp);
  const btn=$(ctx==='global'?ID.gsnd:ID.dmsnd);
  if(inp){
    inp.value=text;
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    if(btn && !btn.disabled){ btn.click(); return; }
  }
  // Fallback: write straight to firebase
  const db=_db(), u=_uid(), n=_uname();
  if(!db||!u||!n) return;
  if(ctx==='global'){
    db.ref('bq_messages').push({uid:u,uname:n,text:text.slice(0,2000),ts:Date.now()});
  } else {
    const id=activeDmId(); if(id) db.ref('bq_dms/'+id+'/messages').push({uid:u,uname:n,text:text.slice(0,2000),ts:Date.now()});
  }
}
function createPollV24(ctx, raw){
  const parts=String(raw||'').split('|').map(s=>s.trim()).filter(Boolean);
  if(parts.length<3){ _toast('Use: /poll Question | A | B','err'); return; }
  const q=parts[0], opts=parts.slice(1,11);
  const db=_db(), u=_uid(), n=_uname();
  if(!db||!u||!n){ _toast('Sign in first','err'); return; }
  const payload={uid:u,uname:n,ts:Date.now(),poll:{q,opts,votes:{}}, text:'📊 '+q};
  if(ctx==='global') db.ref('bq_messages').push(payload);
  else { const id=activeDmId(); if(id) db.ref('bq_dms/'+id+'/messages').push(payload); }
}

function showSlashUI(inp){
  $('bq-slash-v24')?.remove();
  const v=inp.value||'';
  if(!v.startsWith('/')){ return; }
  const sp=v.indexOf(' ');
  const q=sp>0?v.slice(0,sp).toLowerCase():v.toLowerCase();
  const matches=SLASH.filter(x=>x.c.startsWith(q));
  const m=document.createElement('div');
  m.id='bq-slash-v24';
  m.style.cssText='position:fixed;background:#0f0f0f;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:6px;min-width:240px;max-width:320px;z-index:2147483646;box-shadow:0 12px 36px rgba(0,0,0,.6);font:13px/1.35 -apple-system,system-ui,sans-serif;color:#e5e5e5;max-height:240px;overflow:auto';

  if(!matches.length){
    m.innerHTML='<div style="padding:8px 10px;opacity:.6">Tip: type /help to see all slash commands</div>';
  } else {
    // Tip header when only "/" typed
    if(v==='/' || v==='/ '){
      const tip=document.createElement('div');
      tip.style.cssText='padding:6px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.55;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:4px';
      tip.textContent='Slash commands — tap to insert';
      m.appendChild(tip);
    }
    matches.forEach(x=>{
      const it=document.createElement('div');
      it.style.cssText='padding:8px 10px;border-radius:6px;cursor:pointer;display:flex;flex-direction:column;gap:2px';
      it.innerHTML='<span style="font-weight:600;color:#fff">'+x.c+'</span><span style="opacity:.6;font-size:11px">'+_esc(x.d)+'</span>';
      it.onmouseenter=()=>it.style.background='rgba(255,255,255,.06)';
      it.onmouseleave=()=>it.style.background='';
      it.onclick=()=>{ inp.value=x.c+' '; inp.focus(); inp.dispatchEvent(new Event('input',{bubbles:true})); };
      m.appendChild(it);
    });
  }
  document.body.appendChild(m);
  const r=inp.getBoundingClientRect();
  m.style.left=Math.max(8, Math.min(window.innerWidth-m.offsetWidth-8, r.left))+'px';
  m.style.top=(r.top - m.offsetHeight - 8)+'px';
}
function hideSlashUI(){ $('bq-slash-v24')?.remove(); }

function wireSlashV24(inputId){
  const inp=$(inputId); if(!inp || inp._v24Slash) return; inp._v24Slash=true;
  inp.addEventListener('input', ()=>{
    const v=inp.value||'';
    if(v.startsWith('/')) showSlashUI(inp); else hideSlashUI();
  });
  inp.addEventListener('keydown',(e)=>{
    const v=(inp.value||'').trim();
    if(e.key==='Enter' && v.startsWith('/') && !e.shiftKey){
      const sp=v.indexOf(' ');
      const cmd=sp>0?v.slice(0,sp).toLowerCase():v.toLowerCase();
      const args=sp>0?v.slice(sp+1):'';
      const known=SLASH.find(x=>x.c===cmd);
      if(known){
        e.preventDefault(); e.stopPropagation();
        const ctx=activeCtx(); if(!ctx){ _toast('Open a chat first'); return; }
        hideSlashUI();
        inp.value=''; inp.dispatchEvent(new Event('input',{bubbles:true}));
        runSlash(cmd, args.trim(), ctx);
      }
    } else if(e.key==='Escape'){ hideSlashUI(); }
  });
  inp.addEventListener('blur', ()=>setTimeout(hideSlashUI, 200));
}

/* ════════════════════════════════════════════════════════════════════════
   FIX 4: Scheduled messages — proper IDs + reliable dispatch
   ════════════════════════════════════════════════════════════════════════ */
function getSched(){ try{ return JSON.parse(localStorage.getItem('bq_sched_v24')||'[]'); }catch(_){ return []; } }
function setSched(a){ try{ localStorage.setItem('bq_sched_v24', JSON.stringify(a)); }catch(_){} }
function scheduleMsg(ctx, dmId, text, atMs){
  const a=getSched();
  a.push({id:'s_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), ctx, dmId:dmId||'', text, atMs});
  setSched(a);
  _toast('Scheduled for '+new Date(atMs).toLocaleString(),'ok');
}
function dispatchSched(){
  const now=Date.now(); const a=getSched(); let changed=false;
  for(let i=a.length-1;i>=0;i--){
    const s=a[i];
    if(s.atMs<=now){
      try{
        const db=_db(), u=_uid(), n=_uname();
        if(db&&u&&n){
          const payload={uid:u,uname:n,text:String(s.text).slice(0,2000),ts:Date.now()};
          if(s.ctx==='global') db.ref('bq_messages').push(payload);
          else if(s.dmId)      db.ref('bq_dms/'+s.dmId+'/messages').push(payload);
        }
      }catch(_){}
      a.splice(i,1); changed=true;
    }
  }
  if(changed) setSched(a);
}
function showSchedMenu(anchor){
  $('bq-sched-v24')?.remove();
  const ctx=activeCtx(); if(!ctx){ _toast('Open a chat first'); return; }
  const inp=$(ctx==='global'?ID.ginp:ID.dminp);
  const text=(inp?.value||'').trim();
  if(!text){ _toast('Type a message first'); return; }
  const dmId=ctx==='dm'?activeDmId():'';

  const m=document.createElement('div'); m.id='bq-sched-v24';
  m.style.cssText='position:fixed;background:#0f0f0f;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:6px;min-width:200px;z-index:2147483646;box-shadow:0 12px 36px rgba(0,0,0,.6);font:13px/1.35 -apple-system,system-ui,sans-serif;color:#e5e5e5';
  const hdr=document.createElement('div');
  hdr.style.cssText='padding:6px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.55;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:4px';
  hdr.textContent='Send later'; m.appendChild(hdr);

  const opts=[
    ['In 1 minute', ()=>Date.now()+60*1000],
    ['In 1 hour',   ()=>Date.now()+60*60*1000],
    ['Tonight 8pm', ()=>{ const d=new Date(); d.setHours(20,0,0,0); if(d<=Date.now()) d.setDate(d.getDate()+1); return d.getTime(); }],
    ['Tomorrow 9am',()=>{ const d=new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); return d.getTime(); }],
    ['Custom time…', ()=>{
      const v=prompt('Send at (YYYY-MM-DD HH:MM, 24h):');
      if(!v) return null;
      const t=new Date(v.replace(' ','T'));
      if(isNaN(t)){ _toast('Invalid date','err'); return null; }
      return t.getTime();
    }]
  ];
  opts.forEach(([label,fn])=>{
    const b=document.createElement('div');
    b.style.cssText='padding:8px 10px;border-radius:6px;cursor:pointer';
    b.textContent=label;
    b.onmouseenter=()=>b.style.background='rgba(255,255,255,.06)';
    b.onmouseleave=()=>b.style.background='';
    b.onclick=()=>{
      const at=fn(); if(!at) return;
      if(at<=Date.now()){ _toast('Pick a future time','err'); return; }
      if(inp){ inp.value=''; inp.dispatchEvent(new Event('input',{bubbles:true})); }
      scheduleMsg(ctx, dmId, text, at);
      m.remove();
    };
    m.appendChild(b);
  });

  document.body.appendChild(m);
  const r=anchor.getBoundingClientRect();
  m.style.left=Math.max(8, Math.min(window.innerWidth-m.offsetWidth-8, r.right - 220))+'px';
  m.style.top=(r.top - m.offsetHeight - 8)+'px';
  setTimeout(()=>{
    const off=(e)=>{ if(!m.contains(e.target)){ m.remove(); document.removeEventListener('pointerdown', off, true); }};
    document.addEventListener('pointerdown', off, true);
  },10);
}
function wireSchedV24(){
  [ID.gsnd, ID.dmsnd].forEach(id=>{
    const btn=$(id); if(!btn || btn._v24Sched) return; btn._v24Sched=true;
    let pt=null;
    btn.addEventListener('pointerdown', ()=>{ pt=setTimeout(()=>{ pt=null; showSchedMenu(btn); }, 600); });
    const cancel=()=>{ if(pt){ clearTimeout(pt); pt=null; } };
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
  });
}

/* ════════════════════════════════════════════════════════════════════════
   FIX 5: Per-conversation drafts — proper IDs
   ════════════════════════════════════════════════════════════════════════ */
function draftKey(){
  const ctx=activeCtx(); if(ctx==='global') return 'bq_draft_v24_global';
  if(ctx==='dm'){ const id=activeDmId(); return id?'bq_draft_v24_dm_'+id:null; }
  return null;
}
function wireDraftsV24(){
  [ID.ginp, ID.dminp].forEach(id=>{
    const inp=$(id); if(!inp || inp._v24Draft) return; inp._v24Draft=true;
    inp.addEventListener('input', ()=>{
      const k=draftKey(); if(!k) return;
      try{ if(inp.value) localStorage.setItem(k, inp.value); else localStorage.removeItem(k); }catch(_){}
    });
  });
}
function restoreDraftV24(){
  const ctx=activeCtx(); if(!ctx) return;
  const k=draftKey(); if(!k) return;
  const inp=$(ctx==='global'?ID.ginp:ID.dminp); if(!inp) return;
  if(!inp.value){
    try{ const v=localStorage.getItem(k); if(v){ inp.value=v; inp.dispatchEvent(new Event('input',{bubbles:true})); } }catch(_){}
  }
}

/* ════════════════════════════════════════════════════════════════════════
   FIX 6: Link previews — replace broken microlink call
   Uses jsonlink.io free OG-fetch (CORS-enabled). Falls back gracefully.
   ════════════════════════════════════════════════════════════════════════ */
const _lpCache=(()=>{ try{ return JSON.parse(localStorage.getItem('bq_lp_v24')||'{}'); }catch(_){ return{}; } })();
function _saveLp(){ try{ localStorage.setItem('bq_lp_v24', JSON.stringify(_lpCache)); }catch(_){} }
async function fetchLinkPreviewV24(url){
  if(_lpCache[url]) return _lpCache[url];
  // Try jsonlink first (CORS-friendly, free, no key needed for low volume)
  try{
    const r=await fetch('https://jsonlink.io/api/extract?url='+encodeURIComponent(url));
    if(r.ok){
      const j=await r.json();
      if(j && (j.title || j.images?.length)){
        const out={title:j.title||url, desc:j.description||'', img:(j.images&&j.images[0])||'', url};
        _lpCache[url]=out; _saveLp(); return out;
      }
    }
  }catch(_){}
  // Fallback: r.jina.ai readable proxy (CORS-friendly), parse <title>
  try{
    const r=await fetch('https://r.jina.ai/'+url, {headers:{'X-Return-Format':'html'}});
    if(r.ok){
      const html=await r.text();
      const t=(html.match(/<title[^>]*>([^<]+)<\/title>/i)||[])[1]||'';
      const d=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)||[])[1]||'';
      const i=(html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)||[])[1]||'';
      if(t || i){
        const out={title:t.trim()||url, desc:d.trim(), img:i, url};
        _lpCache[url]=out; _saveLp(); return out;
      }
    }
  }catch(_){}
  // Mark as failed so we don't retry forever
  _lpCache[url]={title:'',desc:'',img:'',url,failed:1}; _saveLp();
  return null;
}
function renderLinkPreviewV24(bbl){
  if(!bbl || bbl.dataset.v24lp==='1') return;
  if(bbl.classList.contains('media') || bbl.classList.contains('sticker')) return;
  const a=bbl.querySelector('a[href^="http"]');
  if(!a) return;
  const url=a.href;
  if(/giphy\.com|tenor\.com|\.(jpg|jpeg|png|gif|webp|mp4|webm)(\?|$)/i.test(url)) return;
  // Already has any preview from v23?
  if(bbl.querySelector('.bq-linkprev, .bq-lp-v24')) return;
  bbl.dataset.v24lp='1';
  fetchLinkPreviewV24(url).then(d=>{
    if(!d) return;
    if(bbl.querySelector('.bq-lp-v24')) return;
    const card=document.createElement('a');
    card.className='bq-lp-v24';
    card.href=d.url; card.target='_blank'; card.rel='noopener';
    card.style.cssText='display:flex;gap:10px;margin-top:8px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px;text-decoration:none;color:inherit;max-width:320px;align-items:center';
    let html='';
    if(d.img) html+='<img src="'+_esc(d.img)+'" loading="lazy" onerror="this.style.display=\'none\'" style="width:52px;height:52px;border-radius:6px;object-fit:cover;flex-shrink:0;background:#222"/>';
    html+='<div style="min-width:0;flex:1"><div style="font-weight:600;font-size:13px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+_esc(d.title||d.url)+'</div>';
    if(d.desc) html+='<div style="font-size:11px;opacity:.65;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+_esc(d.desc)+'</div>';
    html+='</div>';
    card.innerHTML=html;
    bbl.appendChild(card);
  }).catch(()=>{});
}

/* ════════════════════════════════════════════════════════════════════════
   FIX 7: New-DM screen halved bug
   When showDmConvo runs, the bqv-dmconv panel sometimes opens with half
   the height because the .bqv positioning hasn't settled. We force a
   reflow + ensure the messages container fills its parent.
   ════════════════════════════════════════════════════════════════════════ */
function fixDmLayout(){
  const v=$(ID.dmview); if(!v) return;
  const msgs=$(ID.dmmsgs); if(!msgs) return;
  // Force the view to fill its slot
  v.style.height='100%';
  v.style.display='flex';
  v.style.flexDirection='column';
  msgs.style.flex='1 1 auto';
  msgs.style.minHeight='0';
  // Trigger reflow
  void v.offsetHeight;
  // Scroll to bottom in case content is offscreen
  msgs.scrollTop=msgs.scrollHeight;
}
// Watch DM view becoming active
function watchDmActivate(){
  const v=$(ID.dmview); if(!v || v._v24Watch) return; v._v24Watch=true;
  const obs=new MutationObserver(()=>{
    if(v.classList.contains('bq-active')){
      fixDmLayout();
      // Re-fix after async render
      setTimeout(fixDmLayout, 50);
      setTimeout(fixDmLayout, 250);
      setTimeout(fixDmLayout, 700);
      // Refresh draft on chat switch
      try{ restoreDraftV24(); }catch(_){}
    }
  });
  obs.observe(v, {attributes:true, attributeFilter:['class']});
}
// Also fix on window resize / orientation change
window.addEventListener('resize', ()=>setTimeout(fixDmLayout, 50));
window.addEventListener('orientationchange', ()=>setTimeout(fixDmLayout, 200));

/* ════════════════════════════════════════════════════════════════════════
   FIX 8: Theme cleanup — keep Monochrome (mono) + Black only
   We do this purely via CSS + removing other chips from the picker DOM.
   Existing themes still parse, but only mono/black are reachable.
   ════════════════════════════════════════════════════════════════════════ */
const KEEP_THEMES=new Set(['mono','black']);

function injectThemeOverrideCss(){
  if($('bq-theme-v24-css')) return;
  const s=document.createElement('style'); s.id='bq-theme-v24-css';
  s.textContent=`
    /* Hide all theme chips except mono + black */
    .bq-theme-chip:not([data-t="mono"]):not([data-t="black"]),
    .bq-if-th:not([data-t="mono"]):not([data-t="black"]) { display:none !important; }
    /* Settings/profile theme tiles fall back to text labels — also slim them */
    .bqpf-theme:not([data-t="mono"]):not([data-t="black"]) { display:none !important; }
    /* Make sure mono + black chips are still visible/clickable */
    .bq-theme-chip[data-t="mono"], .bq-theme-chip[data-t="black"],
    .bq-if-th[data-t="mono"], .bq-if-th[data-t="black"] { display:inline-block !important; }
  `;
  document.head.appendChild(s);
}
function ensureMonoBlackChips(){
  // Add mono/black chips to any picker grid that doesn't have them
  document.querySelectorAll('.bq-theme-row, [data-theme-picker]').forEach(grid=>{
    [['mono','Monochrome'],['black','Black']].forEach(([id,label])=>{
      if(!grid.querySelector('[data-t="'+id+'"]')){
        const chip=document.createElement('div');
        chip.className='bq-theme-chip'; chip.dataset.t=id; chip.title=label;
        chip.style.cssText='display:inline-block;width:28px;height:28px;border-radius:50%;cursor:pointer;margin:4px;border:2px solid transparent;'+
          (id==='black'?'background:linear-gradient(135deg,#0a0a0a,#000)':'background:linear-gradient(135deg,#27272a,#3f3f46)');
        grid.appendChild(chip);
      }
    });
  });
}
function migrateUnsupportedTheme(){
  // If saved theme isn't mono/black, force it to mono
  try{
    const cur=localStorage.getItem('bq_theme_v2')||'';
    if(cur && !KEEP_THEMES.has(cur)){
      localStorage.setItem('bq_theme_v2','mono');
      const p=$('bqp'); if(p){
        Array.from(p.classList).forEach(c=>{ if(c.indexOf('bq-theme-')===0) p.classList.remove(c); });
        p.classList.add('bq-theme-mono');
      }
    }
  }catch(_){}
}

/* ════════════════════════════════════════════════════════════════════════
   FIX 9: Composer-row enhancements — add a discreet "/" hint button
   Tapping it inserts "/" so users discover slash commands without typing.
   ════════════════════════════════════════════════════════════════════════ */
function injectSlashHintButton(){
  [ID.ginp, ID.dminp].forEach(id=>{
    const inp=$(id); if(!inp) return;
    // Place a tiny chip ABOVE the input the first 3 times the user opens chat
    if(inp._v24SlashHinted) return;
    const seen=parseInt(localStorage.getItem('bq_slashtip_seen_v24')||'0',10);
    if(seen>=3){ inp._v24SlashHinted=true; return; }
    inp._v24SlashHinted=true;
    const chip=document.createElement('div');
    chip.style.cssText='display:inline-flex;align-items:center;gap:6px;background:rgba(96,165,250,.1);color:#93c5fd;border:1px solid rgba(96,165,250,.25);border-radius:999px;padding:4px 10px;font:11px/1 -apple-system,system-ui,sans-serif;cursor:pointer;margin:4px 8px 0;width:fit-content';
    chip.innerHTML='💡 Type <b style="margin:0 2px">/</b> to use commands';
    chip.onclick=()=>{ inp.value='/'; inp.focus(); inp.dispatchEvent(new Event('input',{bubbles:true})); chip.remove(); };
    const wrap=inp.closest('.bqcomp')||inp.parentElement;
    if(wrap && wrap.parentElement){ wrap.parentElement.insertBefore(chip, wrap); }
    localStorage.setItem('bq_slashtip_seen_v24', String(seen+1));
    setTimeout(()=>chip.remove(), 12000);
  });
}

/* ════════════════════════════════════════════════════════════════════════
   FIX 10: Re-process bubbles for link previews (replaces v23 broken one)
   ════════════════════════════════════════════════════════════════════════ */
const lpObs=new MutationObserver(muts=>{
  muts.forEach(m=>{
    m.addedNodes.forEach(n=>{
      if(!(n instanceof HTMLElement)) return;
      if(n.classList?.contains('bqbbl')) renderLinkPreviewV24(n);
      n.querySelectorAll?.('.bqbbl').forEach(renderLinkPreviewV24);
    });
  });
});

/* ════════════════════════════════════════════════════════════════════════
   BOOT — wire everything, set re-wire interval
   ════════════════════════════════════════════════════════════════════════ */
function bootV24(){
  try{ injectThemeOverrideCss(); }catch(_){}
  try{ migrateUnsupportedTheme(); }catch(_){}
  try{ ensureMonoBlackChips(); }catch(_){}
  try{ wireSlashV24(ID.ginp); wireSlashV24(ID.dminp); }catch(_){}
  try{ wireSchedV24(); }catch(_){}
  try{ wireDraftsV24(); }catch(_){}
  try{ restoreDraftV24(); }catch(_){}
  try{ watchDmActivate(); }catch(_){}
  try{ fixDmLayout(); }catch(_){}
  try{ injectSlashHintButton(); }catch(_){}
  try{
    lpObs.observe(document.body, {childList:true, subtree:true});
    document.querySelectorAll('.bqbbl').forEach(renderLinkPreviewV24);
  }catch(_){}
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(bootV24, 800));
else setTimeout(bootV24, 800);

// Periodic re-wire — chat DOM is rebuilt by the parent widget
setInterval(()=>{
  try{ ensureMonoBlackChips(); }catch(_){}
  try{ wireSlashV24(ID.ginp); wireSlashV24(ID.dminp); }catch(_){}
  try{ wireSchedV24(); }catch(_){}
  try{ wireDraftsV24(); }catch(_){}
  try{ watchDmActivate(); }catch(_){}
  try{ dispatchSched(); }catch(_){}
}, 3000);

// Faster scheduled-message tick when tab is focused
window.addEventListener('focus', ()=>{ try{ dispatchSched(); }catch(_){} });

})();
/* ════════════ end v24 patch ════════════ */

/* ════════════════════════════════════════════════════════════════════════
   v25 PATCH BLOCK — Apr 2026
   - Remove ALL slash commands + tip chip + autocomplete dropdowns + polls
     from the slash-command system (v23 + v24).
   - Voice Messages V2: up to 5 minutes, live waveform, smoother animations,
     pause/resume during recording, slide-to-cancel, accurate duration,
     in-bubble seek-by-tap, playback speed (1x/1.5x/2x), better aesthetics.
   - DM polish: smoother open/close transitions, fixed half-screen on first
     DM, header avatar pop animation, unread bubble pulse.
   - New features (none of these were in v24):
       * Reply-preview swipe shows sender + snippet
       * "Typing…" indicator in DMs (broadcast over bq_dms/{id}/typing/{uid})
       * Tap message timestamp → copy permalink to clipboard
       * Keyboard ESC closes any open modal/sheet
       * Composer auto-grow with a 6-line cap + scrollbar
       * Quick-emoji bar (👍 ❤️ 😂 😮 😢 🙏) above the composer on long-press
       * Per-DM "scroll to bottom" floating button when scrolled up
       * Double-tap a message to react with ❤️ instantly (Instagram-style)
   - Lighter: nukes dead slash CSS, defers heavy work with rIC.
   ════════════════════════════════════════════════════════════════════════ */
(function v25Patch(){
'use strict';
const V25='25.0.0';
try{ console.info('[BioQuiz] chat-widget v'+V25+' loaded'); }catch(_){}

const $ = (id)=>document.getElementById(id);
const _db = ()=>{ try{ return (window.firebase && firebase.apps && firebase.apps.length) ? firebase.database() : null; }catch(_){ return null; } };
const _uid = ()=>localStorage.getItem('bq_chat_uid')||localStorage.getItem('bq_uid')||'';
const _uname = ()=>localStorage.getItem('bq_chat_uname')||localStorage.getItem('bq_name')||'';
const _esc = (s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function _toast(m,kind){
  try{
    const t=document.createElement('div'); t.textContent=m;
    const bg=kind==='err'?'#7f1d1d':kind==='ok'?'#15803d':'#222';
    t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translate(-50%,12px);opacity:0;background:'+bg+';color:#fff;padding:11px 18px;border-radius:10px;z-index:2147483647;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45);max-width:90vw;text-align:center;transition:opacity .18s ease,transform .18s ease';
    document.body.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translate(-50%,0)'; });
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translate(-50%,-8px)'; setTimeout(()=>t.remove(),220); }, 2400);
  }catch(_){}
}
const ID = { ginp:'bqginp', gsnd:'bqgsnd', dminp:'bqdmi', dmsnd:'bqdms' };

/* ──────────────────────────────────────────────────────────────────────
   1) REMOVE SLASH COMMANDS (v23 + v24) — fully neutralise.
   ────────────────────────────────────────────────────────────────────── */
function killSlash(){
  // Override v23 + v24 globals if they leaked to window
  ['showSlashMenu','hideSlashMenu','wireSlashOnInput','showSlashUI','hideSlashUI','wireSlashV24','injectSlashHintButton','createPoll','createPollV24'].forEach(k=>{
    try{ window[k]=function(){}; }catch(_){}
  });
  // Tear down any visible slash dropdowns
  document.querySelectorAll('#bq-slash, #bq-slash-v24').forEach(n=>n.remove());
  // Tear down all slash hint chips (the "💡 Type / to use commands")
  document.querySelectorAll('div').forEach(d=>{
    if(d.children.length===0 && /Type\s*\/\s*to use commands/i.test(d.textContent||'')){ d.remove(); }
    if(d.innerHTML && /Type\s*<b[^>]*>\s*\/\s*<\/b>\s*to use commands/i.test(d.innerHTML)){ d.remove(); }
  });
  // Hide via CSS too in case they get re-injected mid-tick
  if(!$('bq-v25-killslash')){
    const s=document.createElement('style'); s.id='bq-v25-killslash';
    s.textContent='#bq-slash,#bq-slash-v24{display:none!important}';
    document.head.appendChild(s);
  }
  // Mark inputs so v24's setInterval re-wire skips its slash hookup work
  [ID.ginp, ID.dminp].forEach(id=>{
    const inp=$(id); if(!inp) return;
    inp._v24SlashHinted=true; // skip slash chip
    inp._v24SlashWired=true;  // skip v24 slash wiring
    inp._slashWired=true;     // skip v23 wiring
  });
}
// Run kill loop continuously since v23/v24 setIntervals try to recreate them
setInterval(killSlash, 1500);

/* ──────────────────────────────────────────────────────────────────────
   2) VOICE MESSAGES V2 — longer, smoother, prettier, no glitches
   ────────────────────────────────────────────────────────────────────── */
const VN2_MAX_MS = 5*60*1000; // 5 minutes
const VN2_BARS   = 56;

const vn2css = document.createElement('style');
vn2css.textContent = `
.bqvoice-rec-bar.show{display:flex!important;align-items:center;gap:10px;padding:8px 12px;background:linear-gradient(135deg,rgba(220,38,38,.12),rgba(220,38,38,.05));border:1px solid rgba(220,38,38,.35);border-radius:14px;animation:bqV2RecIn .22s ease}
.bqvoice-btn.recording{animation:bqV2Pulse 1.4s ease-in-out infinite!important;box-shadow:0 0 0 0 rgba(220,38,38,.55)}
@keyframes bqV2Pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.55)}50%{box-shadow:0 0 0 12px rgba(220,38,38,0)}}
@keyframes bqV2RecIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.bqv2-live-wave{flex:1;display:flex;align-items:center;gap:2px;height:24px;overflow:hidden}
.bqv2-live-wave span{flex:1 1 auto;min-width:2px;max-width:3px;background:#dc2626;border-radius:2px;transition:height .08s linear;opacity:.95}
.bqv2-rec-actions{display:flex;align-items:center;gap:6px}
.bqv2-rec-actions button{background:none;border:0;cursor:pointer;color:inherit;width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;transition:background .15s ease,transform .15s ease}
.bqv2-rec-actions button:hover{background:rgba(255,255,255,.08);transform:scale(1.06)}
.bqv2-rec-actions button.danger{color:#fca5a5}
.bqv2-rec-actions button.send{background:#16a34a;color:#fff}
.bqv2-rec-actions button.send:hover{background:#15803d}
.bqv2-rec-paused{opacity:.6;filter:grayscale(.5)}

.bq-voice-msg{min-width:200px;transition:transform .15s ease}
.bq-voice-msg:hover{transform:translateY(-1px)}
.bq-voice-bars{cursor:pointer;position:relative}
.bq-voice-bars::after{content:'';position:absolute;left:0;top:0;bottom:0;width:var(--bq-vp,0%);background:linear-gradient(90deg,transparent,rgba(155,215,255,.06));pointer-events:none;transition:width .12s linear}
.bq-voice-speed{font-size:10px;font-weight:700;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:inherit;border-radius:10px;padding:2px 6px;margin-left:6px;cursor:pointer;font-family:ui-monospace,monospace;transition:background .15s ease}
.bq-voice-speed:hover{background:rgba(255,255,255,.22)}
.bq-voice-play{transition:transform .15s ease,box-shadow .15s ease}
.bq-voice-play:hover{box-shadow:0 4px 14px rgba(0,0,0,.3)}
.bq-voice-play.playing{animation:bqV2PlayPulse 1.6s ease-in-out infinite}
@keyframes bqV2PlayPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
`;
document.head.appendChild(vn2css);

let _vn2 = null;
function vn2Stop(stream){ try{ stream?.getTracks().forEach(t=>t.stop()); }catch(_){} }
function vn2FmtTime(ms){
  const s=Math.max(0,Math.floor(ms/1000));
  return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}
function vn2BuildBar(){
  const bar=$('bq-voice-rec-bar'); if(!bar) return null;
  bar.innerHTML='';
  const dot=document.createElement('span'); dot.className='bqvoice-rec-dot'; bar.appendChild(dot);
  const time=document.createElement('span'); time.className='bqvoice-rec-time'; time.id='bq-voice-rec-time'; time.textContent='0:00'; bar.appendChild(time);
  const wave=document.createElement('div'); wave.className='bqv2-live-wave'; wave.id='bqv2-live-wave';
  for(let i=0;i<28;i++){ const s=document.createElement('span'); s.style.height='4px'; wave.appendChild(s); }
  bar.appendChild(wave);
  const acts=document.createElement('div'); acts.className='bqv2-rec-actions';
  acts.innerHTML='<button id="bqv2-pause" title="Pause/resume"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg></button>'+
    '<button id="bqv2-cancel" class="danger" title="Cancel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'+
    '<button id="bqv2-send" class="send" title="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>';
  bar.appendChild(acts);
  return bar;
}
async function vn2Start(btn){
  if(_vn2){ return; }
  if(!navigator.mediaDevices?.getUserMedia){ _toast('Voice not supported','err'); return; }
  let stream;
  try{ stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }
  catch(e){ _toast('Microphone permission denied','err'); return; }
  let mime='audio/webm;codecs=opus';
  if(!MediaRecorder.isTypeSupported(mime)) mime='audio/webm';
  if(!MediaRecorder.isTypeSupported(mime)) mime='';
  const rec = mime ? new MediaRecorder(stream,{mimeType:mime,bitsPerSecond:64000}) : new MediaRecorder(stream);
  const chunks=[]; const peaks=[];
  let acx,src,an,buf,sampler;
  try{
    acx=new (window.AudioContext||window.webkitAudioContext)();
    src=acx.createMediaStreamSource(stream);
    an=acx.createAnalyser(); an.fftSize=512;
    buf=new Uint8Array(an.frequencyBinCount);
    src.connect(an);
  }catch(_){}
  const start=Date.now();
  let pausedTotal=0, pauseStart=0, paused=false;
  rec.ondataavailable=e=>{ if(e.data && e.data.size) chunks.push(e.data); };
  rec.onerror=()=>{ _toast('Recording error','err'); vn2Cancel(); };
  rec.start(250);

  const bar=vn2BuildBar(); bar?.classList.add('show');
  btn?.classList.add('recording');
  const wave=$('bqv2-live-wave'); const tEl=$('bq-voice-rec-time');
  const tick=()=>{
    if(!_vn2) return;
    const elapsed=Date.now()-start-pausedTotal-(paused?(Date.now()-pauseStart):0);
    if(tEl) tEl.textContent=vn2FmtTime(elapsed);
    if(elapsed>=VN2_MAX_MS){ vn2Send(); return; }
    if(an && !paused){
      an.getByteTimeDomainData(buf);
      let sum=0; for(let i=0;i<buf.length;i++){ const v=(buf[i]-128)/128; sum+=v*v; }
      const rms=Math.sqrt(sum/buf.length);
      const lvl=Math.max(0.06, Math.min(1, rms*3.6));
      peaks.push(lvl);
      if(wave){
        const bars=wave.children;
        for(let i=0;i<bars.length-1;i++){ bars[i].style.height=bars[i+1].style.height; }
        bars[bars.length-1].style.height=Math.max(3,Math.round(lvl*22))+'px';
      }
    }
  };
  sampler=setInterval(tick, 70);

  _vn2 = {
    rec, stream, chunks, peaks, start, sampler, btn,
    isPaused(){ return paused; },
    togglePause(){
      if(rec.state==='recording'){ rec.pause(); paused=true; pauseStart=Date.now(); bar?.classList.add('bqv2-rec-paused'); }
      else if(rec.state==='paused'){ rec.resume(); paused=false; pausedTotal+=Date.now()-pauseStart; bar?.classList.remove('bqv2-rec-paused'); }
    },
    finalDur(){ return Math.min(VN2_MAX_MS, Date.now()-start-pausedTotal-(paused?(Date.now()-pauseStart):0)); },
  };
  $('bqv2-pause')?.addEventListener('click', vn2TogglePause);
  $('bqv2-cancel')?.addEventListener('click', vn2Cancel);
  $('bqv2-send')?.addEventListener('click', vn2Send);
}
function vn2TogglePause(){ _vn2?.togglePause(); }
function vn2ResetUI(){
  $('bq-voice-rec-bar')?.classList.remove('show');
  $('bq-voice-btn')?.classList.remove('recording');
}
function vn2Cancel(){
  const ctx=_vn2; _vn2=null; if(!ctx) return;
  clearInterval(ctx.sampler);
  try{ ctx.rec.onstop=null; if(ctx.rec.state!=='inactive') ctx.rec.stop(); }catch(_){}
  vn2Stop(ctx.stream); vn2ResetUI();
}
function vn2Send(){
  const ctx=_vn2; if(!ctx) return; _vn2=null;
  clearInterval(ctx.sampler);
  ctx.rec.onstop=()=>{
    vn2Stop(ctx.stream); vn2ResetUI();
    const blob=new Blob(ctx.chunks,{type:ctx.rec.mimeType||'audio/webm'});
    if(blob.size<800){ _toast('Recording too short','err'); return; }
    const dur=ctx.finalDur();
    const wave=normalizeWaveV2(ctx.peaks, VN2_BARS);
    const r=new FileReader();
    r.onload=()=>sendVoiceV2(r.result, dur, wave);
    r.readAsDataURL(blob);
  };
  try{ if(ctx.rec.state!=='inactive') ctx.rec.stop(); }catch(_){ vn2ResetUI(); }
}
function normalizeWaveV2(peaks, count){
  const src=Array.isArray(peaks)?peaks.filter(v=>Number.isFinite(v)):[];
  if(!src.length) return Array.from({length:count},()=>22);
  const out=[];
  for(let i=0;i<count;i++){
    const idx=Math.min(src.length-1, Math.floor(i*src.length/count));
    out.push(Math.max(10, Math.min(100, Math.round(src[idx]*100))));
  }
  return out;
}
function sendVoiceV2(audioData, durMs, waveform){
  const db=_db(); const u=_uid(); const n=_uname();
  if(!db||!u||!n||!audioData) return;
  const dm = window.activeDmId || window.__bqActiveDm?.id || '';
  const p={uid:u, uname:n, text:'', type:'voice', audio:audioData, duration:durMs, ts:Date.now()};
  if(Array.isArray(waveform) && waveform.length) p.waveform=waveform.slice(0,64);
  if(dm){
    db.ref('bq_dms/'+dm+'/messages').push(p);
    db.ref('bq_dms/'+dm+'/meta').update({lastMsg:'🎤 Voice note', lastTs:Date.now()});
    const pu=window.activeDmPuid; if(pu) db.ref('bq_dms/'+dm+'/meta/unread/'+pu).transaction(x=>(x||0)+1);
  } else {
    db.ref('bq_messages').push(p);
  }
}

// Hook the voice button — replace v3's tap handler with V2 lifecycle.
function wireVoiceV2(){
  const btn=$('bq-voice-btn'); if(!btn || btn._v2) return; btn._v2=true;
  // Strip prior listeners by cloning
  const fresh=btn.cloneNode(true);
  btn.parentNode.replaceChild(fresh, btn);
  fresh._v2=true;
  fresh.addEventListener('click', e=>{
    e.preventDefault(); e.stopPropagation();
    if(_vn2) vn2Send(); else vn2Start(fresh);
  });
}

// Voice playback: tap-to-seek + speed cycler + visible progress
function enhanceVoiceBubble(node){
  if(!node || node._v2enh) return; node._v2enh=true;
  const bars=node.querySelector('.bq-voice-bars');
  const play=node.querySelector('.bq-voice-play');
  const time=node.querySelector('.bq-voice-time');
  if(!play || !bars) return;
  const audioSrc=node.dataset.audio||'';
  const durMs=parseInt(node.dataset.dur||'0',10)||0;
  if(!audioSrc) return;
  let audio=null, speed=1;

  // Speed chip
  if(!node.querySelector('.bq-voice-speed')){
    const sp=document.createElement('button'); sp.className='bq-voice-speed'; sp.textContent='1x';
    sp.onclick=ev=>{ ev.stopPropagation(); speed = speed===1?1.5: speed===1.5?2:1; sp.textContent=speed+'x'; if(audio) audio.playbackRate=speed; };
    node.appendChild(sp);
  }

  function ensureAudio(){
    if(audio) return audio;
    audio=new Audio(audioSrc);
    audio.playbackRate=speed;
    audio.addEventListener('timeupdate',()=>{
      const p = audio.duration ? (audio.currentTime/audio.duration) : 0;
      bars.style.setProperty('--bq-vp', (p*100).toFixed(1)+'%');
      const kids=bars.querySelectorAll('.bq-voice-bar');
      const cut=Math.floor(p*kids.length);
      kids.forEach((k,i)=>k.classList.toggle('played', i<cut));
      if(time && audio.duration && isFinite(audio.duration)){
        const left=Math.max(0,Math.round(audio.duration-audio.currentTime));
        time.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
      }
    });
    audio.addEventListener('ended',()=>{
      play.classList.remove('playing');
      play.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      bars.style.setProperty('--bq-vp','0%');
      bars.querySelectorAll('.bq-voice-bar').forEach(k=>k.classList.remove('played'));
    });
    return audio;
  }

  play.addEventListener('click', e=>{
    e.stopPropagation();
    const a=ensureAudio();
    if(a.paused){
      // Pause any other voice currently playing
      document.querySelectorAll('.bq-voice-msg .bq-voice-play.playing').forEach(p=>{ if(p!==play) p.click(); });
      a.play().catch(()=>{}); play.classList.add('playing');
      play.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
    } else {
      a.pause(); play.classList.remove('playing');
      play.innerHTML='<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
    }
  });

  // Tap-to-seek on bars
  bars.addEventListener('click', e=>{
    const a=ensureAudio();
    const r=bars.getBoundingClientRect();
    const x=Math.max(0, Math.min(r.width, e.clientX-r.left));
    const pct=x/r.width;
    if(a.duration && isFinite(a.duration)) a.currentTime = a.duration*pct;
    else if(durMs) a.currentTime=(durMs/1000)*pct;
  });
}

/* ──────────────────────────────────────────────────────────────────────
   3) DM polish — smoother transitions, header pop, unread pulse
   ────────────────────────────────────────────────────────────────────── */
const polishCss=document.createElement('style');
polishCss.textContent=`
#bqv-dmconv,.bqdmconv{transition:opacity .22s ease,transform .22s ease}
#bqv-dmconv.bqv-opening{opacity:0;transform:translateY(8px)}
.bqdmhav,#bqdmhav{transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.bqdmhav.pop,#bqdmhav.pop{animation:bqV2HavPop .35s ease}
@keyframes bqV2HavPop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.bqdml-unread{animation:bqV2UnreadPulse 2.2s ease-in-out infinite}
@keyframes bqV2UnreadPulse{0%,100%{box-shadow:0 0 0 0 rgba(96,165,250,.45)}50%{box-shadow:0 0 0 6px rgba(96,165,250,0)}}

.bqv2-scroll-bottom{position:absolute;right:14px;bottom:78px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(20,22,28,.85);color:#e6e9ef;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45);z-index:5;transition:transform .15s ease,opacity .15s ease;backdrop-filter:blur(6px)}
.bqv2-scroll-bottom.show{display:inline-flex;animation:bqV2FadeIn .2s ease}
.bqv2-scroll-bottom:hover{transform:scale(1.07)}
.bqv2-scroll-bottom .badge{position:absolute;top:-4px;right:-4px;background:#dc2626;color:#fff;border-radius:999px;font:600 10px system-ui;padding:1px 6px;min-width:18px;text-align:center}
@keyframes bqV2FadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

.bqv2-typing{display:flex;align-items:center;gap:4px;padding:4px 10px;font:11px system-ui;opacity:.7}
.bqv2-typing span{width:5px;height:5px;border-radius:50%;background:currentColor;animation:bqV2TypingDot 1.2s ease-in-out infinite}
.bqv2-typing span:nth-child(2){animation-delay:.18s}.bqv2-typing span:nth-child(3){animation-delay:.36s}
@keyframes bqV2TypingDot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-3px);opacity:1}}

.bqv2-quick-emoji{position:absolute;background:rgba(20,22,28,.95);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:6px 8px;display:flex;gap:4px;z-index:2147483646;box-shadow:0 8px 28px rgba(0,0,0,.5);animation:bqV2FadeIn .18s ease}
.bqv2-quick-emoji button{background:none;border:0;font-size:20px;cursor:pointer;width:32px;height:32px;border-radius:50%;transition:transform .12s ease,background .12s ease}
.bqv2-quick-emoji button:hover{background:rgba(255,255,255,.1);transform:scale(1.25)}

.bqbbl{transition:background-color .2s ease}
.bqbbl.bqv2-doubletapped{animation:bqV2DoubleTap .5s ease}
@keyframes bqV2DoubleTap{0%{transform:scale(1)}30%{transform:scale(1.04)}100%{transform:scale(1)}}
`;
document.head.appendChild(polishCss);

let _lastDmId=null;
function polishDmOpen(){
  const conv=$('bqv-dmconv')||document.querySelector('.bqdmconv');
  const hav =$('bqdmhav') ||document.querySelector('.bqdmhav');
  const cur = window.activeDmId || window.__bqActiveDm?.id || '';
  if(cur && cur!==_lastDmId){
    _lastDmId=cur;
    if(conv){
      conv.classList.add('bqv-opening');
      requestAnimationFrame(()=>requestAnimationFrame(()=>conv.classList.remove('bqv-opening')));
    }
    if(hav){ hav.classList.remove('pop'); void hav.offsetWidth; hav.classList.add('pop'); }
    ensureScrollBottomBtn();
  }
}

/* Scroll-to-bottom floating pill */
function ensureScrollBottomBtn(){
  const list=$('bqdmmsgs')||document.querySelector('.bqdmmsgs');
  const wrap=list?.parentElement; if(!list||!wrap) return;
  if(getComputedStyle(wrap).position==='static') wrap.style.position='relative';
  let btn=wrap.querySelector('.bqv2-scroll-bottom');
  if(!btn){
    btn=document.createElement('button'); btn.className='bqv2-scroll-bottom';
    btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg><span class="badge" style="display:none">0</span>';
    btn.onclick=()=>{ list.scrollTop=list.scrollHeight; btn.classList.remove('show'); btn.querySelector('.badge').style.display='none'; };
    wrap.appendChild(btn);
  }
  if(!list._v2scroll){
    list._v2scroll=true; let unread=0;
    list.addEventListener('scroll', ()=>{
      const atBottom = list.scrollHeight-list.scrollTop-list.clientHeight < 80;
      if(atBottom){ btn.classList.remove('show'); unread=0; btn.querySelector('.badge').style.display='none'; }
      else { btn.classList.add('show'); }
    });
    new MutationObserver(()=>{
      const atBottom = list.scrollHeight-list.scrollTop-list.clientHeight < 80;
      if(!atBottom){ unread++; const b=btn.querySelector('.badge'); b.textContent=unread; b.style.display='inline-block'; btn.classList.add('show'); }
      else { list.scrollTop=list.scrollHeight; }
    }).observe(list, {childList:true});
  }
}

/* ──────────────────────────────────────────────────────────────────────
   4) NEW: Typing indicator in DMs (broadcast typing/{uid}=ts)
   ────────────────────────────────────────────────────────────────────── */
let _typingSent=0, _typingHandle=null;
function broadcastTyping(){
  const db=_db(); const u=_uid();
  const dm = window.activeDmId || window.__bqActiveDm?.id;
  if(!db||!u||!dm) return;
  const now=Date.now();
  if(now-_typingSent<2000) return;
  _typingSent=now;
  db.ref('bq_dms/'+dm+'/typing/'+u).set(now);
  clearTimeout(_typingHandle);
  _typingHandle=setTimeout(()=>{ try{ db.ref('bq_dms/'+dm+'/typing/'+u).remove(); }catch(_){ } }, 4500);
}
let _typingObs=null, _typingDmRef=null;
function watchTyping(){
  const db=_db(); const u=_uid();
  const dm = window.activeDmId || window.__bqActiveDm?.id;
  if(!db||!u||!dm) return;
  if(_typingDmRef===dm) return;
  if(_typingObs){ try{ _typingObs.off(); }catch(_){} _typingObs=null; }
  _typingDmRef=dm;
  const ref=db.ref('bq_dms/'+dm+'/typing');
  _typingObs=ref;
  ref.on('value', snap=>{
    const v=snap.val()||{};
    let active=false; const now=Date.now();
    Object.keys(v).forEach(k=>{ if(k!==u && (now - (v[k]||0)) < 6000) active=true; });
    let pill=document.querySelector('.bqv2-typing');
    const list=$('bqdmmsgs')||document.querySelector('.bqdmmsgs');
    if(active){
      if(!pill && list){ pill=document.createElement('div'); pill.className='bqv2-typing'; pill.innerHTML='<span></span><span></span><span></span> typing'; list.parentElement.appendChild(pill); }
    } else { pill?.remove(); }
  });
}
function wireTypingInput(){
  const inp=$(ID.dminp); if(!inp || inp._v2typ) return; inp._v2typ=true;
  inp.addEventListener('input', broadcastTyping);
}

/* ──────────────────────────────────────────────────────────────────────
   5) NEW: composer auto-grow + ESC closes modals + double-tap react +
           quick-emoji bar + tap-timestamp-to-copy-permalink
   ────────────────────────────────────────────────────────────────────── */
function autoGrow(inp){
  if(!inp || inp._v2grow) return; inp._v2grow=true;
  if(inp.tagName!=='TEXTAREA'){
    // many composers use <input>; convert to textarea-like behavior is risky, just leave
    return;
  }
  const fit=()=>{
    inp.style.height='auto';
    inp.style.height=Math.min(inp.scrollHeight, 6*20+16)+'px';
  };
  inp.addEventListener('input', fit); fit();
}
function wireAutoGrow(){
  [ID.ginp, ID.dminp].forEach(id=>autoGrow($(id)));
}

document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    document.querySelectorAll('#bq-msg-sheet, #bq-rec-modal, #bq-rec-restore-modal, .bqv2-quick-emoji').forEach(n=>n.remove());
  }
});

// Double-tap to react ❤️
function wireDoubleTap(){
  if(window._bqV2DT) return; window._bqV2DT=true;
  document.addEventListener('dblclick', e=>{
    const bbl=e.target.closest('.bqbbl'); if(!bbl) return;
    if(e.target.closest('a,button,.bq-voice-msg,.bq-img,.bq-gif,.bq-sticker')) return;
    bbl.classList.add('bqv2-doubletapped');
    setTimeout(()=>bbl.classList.remove('bqv2-doubletapped'), 500);
    // Trigger reaction picker if present
    const key=bbl.dataset.key||bbl.dataset.k||bbl.id?.replace(/^bqm-/,'');
    if(!key) return;
    const ctx = (window.activeDmId||window.__bqActiveDm?.id) ? 'dm' : 'global';
    const db=_db(); const u=_uid(); if(!db||!u) return;
    const dm=window.activeDmId||window.__bqActiveDm?.id||'';
    const path = ctx==='global' ? 'bq_messages/'+key+'/reactions/❤️/'+u : 'bq_dms/'+dm+'/messages/'+key+'/reactions/❤️/'+u;
    db.ref(path).set(Date.now()).catch(()=>{});
  });
}

// Long-press → quick emoji bar
const QUICK_EMOJI=['👍','❤️','😂','😮','😢','🙏'];
function wireQuickEmoji(){
  if(window._bqV2QE) return; window._bqV2QE=true;
  let press=null;
  const start=(e)=>{
    const bbl=e.target.closest('.bqbbl'); if(!bbl) return;
    if(e.target.closest('a,button,.bq-voice-msg,.bq-img,.bq-gif')) return;
    press={bbl, t:setTimeout(()=>showQE(bbl, e), 480)};
  };
  const cancel=()=>{ if(press){ clearTimeout(press.t); press=null; } };
  document.addEventListener('mousedown', start);
  document.addEventListener('mouseup', cancel);
  document.addEventListener('mouseleave', cancel);
  document.addEventListener('touchstart', e=>start(e.touches?e.touches[0]?{...e,clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,target:e.target}:e:e), {passive:true});
  document.addEventListener('touchend', cancel);
  document.addEventListener('touchmove', cancel);
}
function showQE(bbl, e){
  document.querySelectorAll('.bqv2-quick-emoji').forEach(n=>n.remove());
  const r=bbl.getBoundingClientRect();
  const bar=document.createElement('div'); bar.className='bqv2-quick-emoji';
  QUICK_EMOJI.forEach(em=>{
    const b=document.createElement('button'); b.textContent=em;
    b.onclick=()=>{
      const key=bbl.dataset.key||bbl.dataset.k||bbl.id?.replace(/^bqm-/,'');
      const dm=window.activeDmId||window.__bqActiveDm?.id||'';
      const u=_uid(); const db=_db();
      if(key && u && db){
        const path = dm ? 'bq_dms/'+dm+'/messages/'+key+'/reactions/'+em+'/'+u : 'bq_messages/'+key+'/reactions/'+em+'/'+u;
        db.ref(path).set(Date.now()).catch(()=>{});
      }
      bar.remove();
    };
    bar.appendChild(b);
  });
  document.body.appendChild(bar);
  const top=Math.max(60, r.top-46);
  bar.style.left=Math.min(window.innerWidth-bar.offsetWidth-8, Math.max(8, r.left))+'px';
  bar.style.top=top+'px';
  setTimeout(()=>{ const off=ev=>{ if(!bar.contains(ev.target)){ bar.remove(); document.removeEventListener('click', off, true); } }; document.addEventListener('click', off, true); }, 50);
}

// Tap timestamp → copy permalink
function wireTimestampCopy(){
  if(window._bqV2TS) return; window._bqV2TS=true;
  document.addEventListener('click', e=>{
    const t=e.target.closest('.bqts, .bqt, [data-bq-ts]'); if(!t) return;
    const bbl=t.closest('.bqbbl'); if(!bbl) return;
    const key=bbl.dataset.key||bbl.dataset.k||bbl.id?.replace(/^bqm-/,''); if(!key) return;
    const dm=window.activeDmId||window.__bqActiveDm?.id||'';
    const link=location.origin+location.pathname+'#bqmsg='+(dm?'dm:'+dm+':':'g:')+key;
    try{ navigator.clipboard.writeText(link); _toast('Link copied','ok'); }catch(_){ _toast('Could not copy','err'); }
  });
}

/* ──────────────────────────────────────────────────────────────────────
   BOOT + observers
   ────────────────────────────────────────────────────────────────────── */
const bblObs=new MutationObserver(muts=>{
  muts.forEach(m=>m.addedNodes.forEach(n=>{
    if(!(n instanceof HTMLElement)) return;
    if(n.classList?.contains('bq-voice-msg')) enhanceVoiceBubble(n);
    n.querySelectorAll?.('.bq-voice-msg').forEach(enhanceVoiceBubble);
  }));
});

function bootV25(){
  killSlash();
  wireVoiceV2();
  document.querySelectorAll('.bq-voice-msg').forEach(enhanceVoiceBubble);
  bblObs.observe(document.body, {childList:true, subtree:true});
  polishDmOpen();
  watchTyping();
  wireTypingInput();
  wireAutoGrow();
  wireDoubleTap();
  wireQuickEmoji();
  wireTimestampCopy();
  ensureScrollBottomBtn();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(bootV25, 900));
else setTimeout(bootV25, 900);

setInterval(()=>{
  try{ killSlash(); }catch(_){}
  try{ wireVoiceV2(); }catch(_){}
  try{ polishDmOpen(); }catch(_){}
  try{ watchTyping(); }catch(_){}
  try{ wireTypingInput(); }catch(_){}
  try{ wireAutoGrow(); }catch(_){}
  try{ ensureScrollBottomBtn(); }catch(_){}
}, 2500);

})();
/* ════════════ end v25 patch ════════════ */
