
/* ════════════ v68 patch — Liquid Glass DM Chat ════════════ */
(function v68Patch(){
'use strict';
try{

/* ── Inject Liquid Glass CSS ── */
const v68css = document.createElement('style');
v68css.id = 'bq-v68-liquid-glass';
v68css.textContent = `

/* ════════════════════════════════════════════════════════════
   LIQUID GLASS — Chat Widget
   Key insight: backdrop-filter:blur() only works when there
   is visible content BEHIND the element. The panel (#bqp)
   must be semi-transparent for the glass to show.
   ════════════════════════════════════════════════════════════ */

/* ── 1. PANEL (#bqp) — Semi-transparent + orb layer ── */
#bqp{
  background: rgba(8, 8, 10, 0.72) !important;
  backdrop-filter: blur(60px) saturate(200%) brightness(1.08) !important;
  -webkit-backdrop-filter: blur(60px) saturate(200%) brightness(1.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow:
    0 40px 120px rgba(0,0,0,.85),
    0 0 0 1px rgba(255,255,255,.05) inset,
    0 -2px 40px rgba(96,165,250,.06),
    inset 0 1px 0 rgba(255,255,255,.06) !important;
}

/* Animated liquid orbs — on #bqp::after since ::before is the glow line */
#bqp::after{
  content: '' !important;
  position: absolute !important;
  top: -80px !important; left: -80px !important; right: -80px !important; bottom: -80px !important;
  background:
    radial-gradient(ellipse 250px 250px at 12% 20%, rgba(96, 165, 250, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 88% 78%, rgba(167, 139, 250, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 45% 8%, rgba(52, 211, 153, 0.09) 0%, transparent 70%),
    radial-gradient(ellipse 220px 220px at 72% 35%, rgba(244, 114, 182, 0.09) 0%, transparent 70%),
    radial-gradient(ellipse 170px 170px at 25% 85%, rgba(251, 191, 36, 0.06) 0%, transparent 70%) !important;
  z-index: 0 !important;
  pointer-events: none !important;
  animation: bqLiquidOrbs 24s ease-in-out infinite alternate !important;
  will-change: transform !important;
  filter: blur(30px) !important;
}
@keyframes bqLiquidOrbs{
  0%  { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(14px, -12px) scale(1.04) rotate(0.5deg); }
  50% { transform: translate(-10px, 8px) scale(0.97) rotate(-0.4deg); }
  75% { transform: translate(8px, 16px) scale(1.03) rotate(0.3deg); }
  100%{ transform: translate(-6px, -10px) scale(1) rotate(-0.6deg); }
}

/* Keep the top glow line above orbs */
#bqp::before{ z-index: 2 !important; }

/* All direct children of #bqp above the orb layer */
#bqp > *{ position: relative !important; z-index: 1 !important; }


/* ── 2. VIEW LAYER (.bqv) — Second glass layer ── */
.bqv{
  background: rgba(8, 8, 10, 0.25) !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
}

#bqv-dmconv{
  background: rgba(8, 8, 10, 0.3) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
}

#bqv-dms{
  background: rgba(8, 8, 10, 0.25) !important;
}

#bqv-global{
  background: rgba(8, 8, 10, 0.25) !important;
}


/* ── 3. MESSAGE AREA — Transparent ── */
#bqdmmsgs, #bqgmsgs{
  background: transparent !important;
  background-color: transparent !important;
}


/* ── 4. HEADER — Frosted glass bar ── */
.bqhdr{
  background: rgba(8, 8, 10, 0.45) !important;
  backdrop-filter: blur(28px) saturate(200%) brightness(1.06) !important;
  -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.06) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}
#bqv-dmconv .bqhdr{
  background: rgba(8, 10, 18, 0.45) !important;
  backdrop-filter: blur(28px) saturate(200%) brightness(1.08) !important;
  -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.08) !important;
  z-index: 10 !important;
}


/* ── 5. MESSAGE BUBBLES — Glass bubbles ── */
/* Theirs — frosted white glass */
#bqdmmsgs .bqr.theirs .bqbbl,
#bqgmsgs .bqr.theirs .bqbbl{
  background: rgba(255, 255, 255, 0.06) !important;
  backdrop-filter: blur(12px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(12px) saturate(150%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  color: rgba(240, 240, 240, 0.92) !important;
}

/* Mine — tinted blue glass */
#bqdmmsgs .bqr.mine .bqbbl,
#bqgmsgs .bqr.mine .bqbbl{
  background: rgba(59, 130, 246, 0.22) !important;
  backdrop-filter: blur(14px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(180%) !important;
  border: 1px solid rgba(96, 165, 250, 0.16) !important;
  box-shadow: 0 2px 14px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.09) !important;
  color: #fff !important;
}

/* Hover — light refraction */
#bqdmmsgs .bqr.theirs:hover .bqbbl,
#bqgmsgs .bqr.theirs:hover .bqbbl{
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}
#bqdmmsgs .bqr.mine:hover .bqbbl,
#bqgmsgs .bqr.mine:hover .bqbbl{
  background: rgba(59, 130, 246, 0.3) !important;
  border-color: rgba(96, 165, 250, 0.24) !important;
}


/* ── 6. INPUT WRAPPER — Frosted glass ── */
.bqiw{
  background: rgba(8, 8, 10, 0.45) !important;
  backdrop-filter: blur(28px) saturate(200%) brightness(1.05) !important;
  -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.05) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
}
#bqv-dmconv .bqiw{ z-index: 10 !important; }


/* ── 7. NAV PILL — Frosted glass ── */
.bqnavpill, .bqnav-pill{
  background: rgba(8, 8, 10, 0.5) !important;
  backdrop-filter: blur(32px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(200%) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}


/* ── 8. MISC ELEMENTS ── */
#bqv-dmconv #bq-pinned-bar{
  background: rgba(8, 8, 10, 0.4) !important;
  backdrop-filter: blur(18px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(160%) !important;
}
#bq-dm-info{
  background: rgba(8, 8, 10, 0.6) !important;
  backdrop-filter: blur(32px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(200%) !important;
}
#bqdmmsgs .bqds, #bqgmsgs .bqds{ color: rgba(255, 255, 255, 0.12) !important; }
#bqdmmsgs .bqds::before, #bqdmmsgs .bqds::after,
#bqgmsgs .bqds::before, #bqgmsgs .bqds::after{ background: rgba(255, 255, 255, 0.04) !important; }
#bqdmmsgs .bqsys, #bqgmsgs .bqsys{ color: rgba(255, 255, 255, 0.16) !important; }
#bqdmmsgs .bqtyping, #bqgmsgs .bqtyping{
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-radius: 14px !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.bqiet{
  background: rgba(8, 8, 10, 0.6) !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
}
#bq-rx-picker .bq-rx-panel{
  background: rgba(8, 8, 10, 0.7) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.04) !important;
}
#bqdmmsgs::-webkit-scrollbar-thumb,
#bqgmsgs::-webkit-scrollbar-thumb{ background: rgba(255,255,255,.06) !important; }
#bqdmmsgs::-webkit-scrollbar-thumb:hover,
#bqgmsgs::-webkit-scrollbar-thumb:hover{ background: rgba(255,255,255,.14) !important; }
#bqdml .bqdmr{ border-radius: 12px !important; transition: background .2s ease, box-shadow .2s ease !important; }
#bqdml .bqdmr:hover{ background: rgba(255,255,255,.05) !important; box-shadow: inset 0 0 0 1px rgba(255,255,255,.05) !important; }
.bq-msg-inline{
  background: rgba(8, 8, 10, 0.7) !important;
  backdrop-filter: blur(18px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(160%) !important;
  border-color: rgba(255,255,255,.08) !important;
}
.bqv2-quick-emoji{
  background: rgba(8, 8, 10, 0.75) !important;
  backdrop-filter: blur(18px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
  border-color: rgba(255,255,255,.1) !important;
}
#bqnm{
  background: rgba(8, 8, 10, 0.7) !important;
  backdrop-filter: blur(32px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}
#bqv-profile{
  background: rgba(8, 8, 10, 0.3) !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
}
#bq-confirm, .bq-confirm{
  background: rgba(8, 8, 10, 0.8) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
}
.bqpcard, #bq-pv{
  background: rgba(8, 8, 10, 0.75) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
}


/* ════════════════════════════════════════════════════════════
   THEME AWARE — Orb colors + glass tint per theme
   ════════════════════════════════════════════════════════════ */

/* No theme (default) — blue/purple orbs */
#bqp.bq-theme-none::after{
  background:
    radial-gradient(ellipse 250px 250px at 12% 20%, rgba(96, 165, 250, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 88% 78%, rgba(167, 139, 250, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 45% 8%, rgba(52, 211, 153, 0.09) 0%, transparent 70%),
    radial-gradient(ellipse 220px 220px at 72% 35%, rgba(244, 114, 182, 0.09) 0%, transparent 70%),
    radial-gradient(ellipse 170px 170px at 25% 85%, rgba(251, 191, 36, 0.06) 0%, transparent 70%) !important;
}

/* Ocean — cyan/teal orbs */
#bqp.bq-theme-ocean{ background: rgba(4, 14, 28, 0.72) !important; }
#bqp.bq-theme-ocean::after{
  background:
    radial-gradient(ellipse 250px 250px at 15% 25%, rgba(6, 182, 212, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 85% 75%, rgba(14, 165, 233, 0.16) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(45, 212, 191, 0.1) 0%, transparent 70%) !important;
}
#bqp.bq-theme-ocean .bqr.mine .bqbbl{
  background: rgba(6, 182, 212, 0.22) !important;
  border-color: rgba(6, 182, 212, 0.18) !important;
  box-shadow: 0 2px 14px rgba(6,182,212,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Sunset — warm orange/rose orbs */
#bqp.bq-theme-sunset{ background: rgba(22, 10, 6, 0.72) !important; }
#bqp.bq-theme-sunset::after{
  background:
    radial-gradient(ellipse 250px 250px at 20% 30%, rgba(251, 146, 60, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 80% 70%, rgba(244, 63, 94, 0.16) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(251, 191, 36, 0.1) 0%, transparent 70%) !important;
}
#bqp.bq-theme-sunset .bqr.mine .bqbbl{
  background: rgba(251, 146, 60, 0.22) !important;
  border-color: rgba(251, 146, 60, 0.18) !important;
  box-shadow: 0 2px 14px rgba(244,63,94,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Midnight — deep indigo/purple orbs */
#bqp.bq-theme-midnight{ background: rgba(10, 6, 22, 0.72) !important; }
#bqp.bq-theme-midnight::after{
  background:
    radial-gradient(ellipse 250px 250px at 18% 22%, rgba(99, 102, 241, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 82% 78%, rgba(168, 85, 247, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(139, 92, 246, 0.1) 0%, transparent 70%) !important;
}
#bqp.bq-theme-midnight .bqr.mine .bqbbl{
  background: rgba(99, 102, 241, 0.22) !important;
  border-color: rgba(99, 102, 241, 0.18) !important;
  box-shadow: 0 2px 14px rgba(168,85,247,.22), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Forest — green/teal orbs */
#bqp.bq-theme-forest{ background: rgba(4, 14, 8, 0.72) !important; }
#bqp.bq-theme-forest::after{
  background:
    radial-gradient(ellipse 250px 250px at 15% 25%, rgba(16, 185, 129, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 85% 75%, rgba(20, 184, 166, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(34, 197, 94, 0.1) 0%, transparent 70%) !important;
}
#bqp.bq-theme-forest .bqr.mine .bqbbl{
  background: rgba(16, 185, 129, 0.22) !important;
  border-color: rgba(16, 185, 129, 0.18) !important;
  box-shadow: 0 2px 14px rgba(20,184,166,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Rose — pink orbs */
#bqp.bq-theme-rose{ background: rgba(20, 8, 14, 0.72) !important; }
#bqp.bq-theme-rose::after{
  background:
    radial-gradient(ellipse 250px 250px at 18% 22%, rgba(236, 72, 153, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 82% 78%, rgba(244, 114, 182, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(251, 113, 133, 0.1) 0%, transparent 70%) !important;
}
#bqp.bq-theme-rose .bqr.mine .bqbbl{
  background: rgba(236, 72, 153, 0.22) !important;
  border-color: rgba(236, 72, 153, 0.18) !important;
  box-shadow: 0 2px 14px rgba(244,114,182,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Crimson — red orbs */
#bqp.bq-theme-crimson{ background: rgba(20, 4, 6, 0.72) !important; }
#bqp.bq-theme-crimson::after{
  background:
    radial-gradient(ellipse 250px 250px at 18% 22%, rgba(220, 20, 60, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 82% 78%, rgba(248, 113, 113, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(252, 165, 165, 0.08) 0%, transparent 70%) !important;
}
#bqp.bq-theme-crimson .bqr.mine .bqbbl{
  background: rgba(220, 20, 60, 0.22) !important;
  border-color: rgba(220, 20, 60, 0.18) !important;
  box-shadow: 0 2px 14px rgba(248,113,113,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Aurora — multi-color orbs */
#bqp.bq-theme-aurora{ background: rgba(6, 8, 14, 0.68) !important; }
#bqp.bq-theme-aurora::after{
  background:
    radial-gradient(ellipse 280px 280px at 12% 20%, rgba(96, 165, 250, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 320px 320px at 88% 78%, rgba(167, 139, 250, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 220px 220px at 50% 8%, rgba(52, 211, 153, 0.12) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 72% 35%, rgba(244, 114, 182, 0.1) 0%, transparent 70%) !important;
  background-size: 200% 200% !important;
  animation: bqLiquidOrbs 24s ease-in-out infinite alternate, bqAurora 18s ease infinite !important;
}

/* Bubblegum — purple-pink orbs */
#bqp.bq-theme-bubblegum{ background: rgba(18, 6, 18, 0.72) !important; }
#bqp.bq-theme-bubblegum::after{
  background:
    radial-gradient(ellipse 250px 250px at 18% 22%, rgba(168, 85, 247, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 82% 78%, rgba(236, 72, 153, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 50% 10%, rgba(192, 132, 252, 0.1) 0%, transparent 70%) !important;
}
#bqp.bq-theme-bubblegum .bqr.mine .bqbbl{
  background: rgba(168, 85, 247, 0.22) !important;
  border-color: rgba(168, 85, 247, 0.18) !important;
  box-shadow: 0 2px 14px rgba(236,72,153,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
}

/* Mono — subtle white orbs */
#bqp.bq-theme-mono{ background: rgba(8, 8, 8, 0.72) !important; }
#bqp.bq-theme-mono::after{
  background:
    radial-gradient(ellipse 220px 220px at 20% 30%, rgba(255, 255, 255, 0.06) 0%, transparent 70%),
    radial-gradient(ellipse 250px 250px at 80% 70%, rgba(255, 255, 255, 0.04) 0%, transparent 70%) !important;
}
#bqp.bq-theme-mono .bqr.mine .bqbbl{
  background: rgba(255,255,255,.08) !important;
  border-color: rgba(255,255,255,.1) !important;
  box-shadow: 0 2px 14px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06) !important;
}
#bqp.bq-theme-mono .bqr.theirs .bqbbl{
  background: rgba(255,255,255,.03) !important;
  border-color: rgba(255,255,255,.05) !important;
}

/* WA Light — inverted glass */
#bqp.bq-theme-walight{
  background: rgba(239, 234, 226, 0.75) !important;
  backdrop-filter: blur(50px) saturate(150%) brightness(1.1) !important;
  -webkit-backdrop-filter: blur(50px) saturate(150%) brightness(1.1) !important;
}
#bqp.bq-theme-walight::after{
  background:
    radial-gradient(ellipse 250px 250px at 12% 20%, rgba(7, 94, 84, 0.08) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 88% 78%, rgba(7, 94, 84, 0.06) 0%, transparent 70%) !important;
  filter: blur(20px) !important;
}
#bqp.bq-theme-walight .bqhdr{
  background: rgba(7, 94, 84, 0.55) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
}
#bqp.bq-theme-walight .bqiw{
  background: rgba(7, 94, 84, 0.55) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
}
#bqp.bq-theme-walight .bqr.theirs .bqbbl{
  background: rgba(255,255,255,.6) !important;
  border-color: rgba(0,0,0,.06) !important;
  color: rgba(0,0,0,.87) !important;
}
#bqp.bq-theme-walight .bqr.mine .bqbbl{
  background: rgba(220, 248, 198, 0.7) !important;
  border-color: rgba(0,0,0,.04) !important;
  color: rgba(0,0,0,.87) !important;
}

/* Grid/Dots/Wave — default orbs */
#bqp.bq-theme-grid::after,
#bqp.bq-theme-dots::after,
#bqp.bq-theme-wave::after{
  background:
    radial-gradient(ellipse 250px 250px at 12% 20%, rgba(96, 165, 250, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 88% 78%, rgba(167, 139, 250, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 45% 8%, rgba(52, 211, 153, 0.09) 0%, transparent 70%) !important;
}

/* Ocean v2 / Sunset v2 */
#bqp.bq-theme-oceanv2{ background: rgba(2, 22, 34, 0.72) !important; }
#bqp.bq-theme-oceanv2::after{
  background:
    radial-gradient(ellipse 250px 250px at 15% 25%, rgba(6, 182, 212, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 85% 75%, rgba(14, 165, 233, 0.16) 0%, transparent 70%) !important;
}
#bqp.bq-theme-sunsetv2{ background: rgba(28, 10, 4, 0.72) !important; }
#bqp.bq-theme-sunsetv2::after{
  background:
    radial-gradient(ellipse 250px 250px at 20% 30%, rgba(251, 146, 60, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 80% 70%, rgba(244, 63, 94, 0.16) 0%, transparent 70%) !important;
}

/* WA Dark */
#bqp.bq-theme-wadark{ background: rgba(17, 27, 33, 0.72) !important; }
#bqp.bq-theme-wadark::after{
  background:
    radial-gradient(ellipse 250px 250px at 18% 22%, rgba(32, 44, 51, 0.3) 0%, transparent 70%),
    radial-gradient(ellipse 300px 300px at 82% 78%, rgba(42, 57, 66, 0.25) 0%, transparent 70%) !important;
  filter: blur(25px) !important;
}

`;

document.head.appendChild(v68css);

/* ── FIX: Reaction popup closing the widget ── */
(function fixReactionPopup(){
  const _origClosePanel = typeof closePanel === 'function' ? closePanel : null;
  if(_origClosePanel){
    window._bqClosePanelOrig = _origClosePanel;
    window.closePanel = function(){
      const rxPicker = document.getElementById('bq-rx-picker');
      if(rxPicker && rxPicker.classList.contains('open')) return;
      const qe = document.querySelector('.bqv2-quick-emoji');
      if(qe) return;
      const sheet = document.getElementById('bq-msg-sheet');
      if(sheet && sheet.classList.contains('open')) return;
      _origClosePanel.call(this);
    };
  }
  function patchReactionPicker(){
    const rxPicker = document.getElementById('bq-rx-picker');
    if(!rxPicker || rxPicker.dataset.v68Patched) return;
    rxPicker.dataset.v68Patched = '1';
    rxPicker.addEventListener('pointerdown', e => e.stopPropagation(), true);
    rxPicker.addEventListener('touchstart', e => e.stopPropagation(), true);
    rxPicker.querySelectorAll('.bq-rx-emo').forEach(btn => {
      btn.addEventListener('pointerdown', e => e.stopPropagation(), true);
    });
  }
  const _origEnsureRP = typeof ensureReactionPicker === 'function' ? ensureReactionPicker : null;
  if(_origEnsureRP){
    window.ensureReactionPicker = function(){
      const result = _origEnsureRP();
      patchReactionPicker();
      return result;
    };
  }
  const qeObs = new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if(!(n instanceof HTMLElement)) return;
      if(n.classList && n.classList.contains('bqv2-quick-emoji')){
        n.addEventListener('pointerdown', e => e.stopPropagation(), true);
        n.addEventListener('touchstart', e => e.stopPropagation(), true);
      }
      n.querySelectorAll?.('.bqv2-quick-emoji').forEach(el => {
        el.addEventListener('pointerdown', e => e.stopPropagation(), true);
        el.addEventListener('touchstart', e => e.stopPropagation(), true);
      });
    }));
  });
  qeObs.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('mousedown', function(e){
    if(e.target.closest('#bq-rx-picker, .bqv2-quick-emoji, .bqrxn')) return;
    const rxPicker = document.getElementById('bq-rx-picker');
    if(rxPicker && rxPicker.classList.contains('open')){
      e.stopPropagation();
      if(typeof closeReactionPicker === 'function') closeReactionPicker();
    }
  }, true);
  document.addEventListener('pointerdown', function(e){
    if(e.target.closest('#bq-rx-picker, .bqv2-quick-emoji, .bqrxn')) return;
    const rxPicker = document.getElementById('bq-rx-picker');
    if(rxPicker && rxPicker.classList.contains('open')){
      e.stopPropagation();
      if(typeof closeReactionPicker === 'function') closeReactionPicker();
    }
  }, true);
})();

console.log('[bq] v68 patch loaded — Liquid Glass + Reaction popup fix');
}catch(e){ console.error('[bq] v68 patch error:', e); }
})();
/* ════════════ end v68 patch ════════════ */
