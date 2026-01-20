/* =====================================================
   CINEMATIC NASA UI SPACE BACKGROUND
   Auto-injected | Minimal | Professional | Realistic
===================================================== */

/* ---------- CSS ---------- */
const style = document.createElement("style");
style.textContent = `
  .nasa-canvas, .nasa-nebula, .nasa-grid {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }

  .nasa-canvas { z-index: 0; }
  .nasa-nebula { z-index: 1; }
  .nasa-grid   { z-index: 2; }

  /* Nebula – VERY subtle */
  .nasa-nebula {
    background:
      radial-gradient(900px 700px at 30% 40%, rgba(80,120,255,.035), transparent 60%),
      radial-gradient(1000px 800px at 70% 60%, rgba(160,90,255,.025), transparent 65%);
    animation: nebulaDrift 240s linear infinite;
  }

  @keyframes nebulaDrift {
    from { transform: translate(0,0); }
    to   { transform: translate(-180px,140px); }
  }

  /* HUD grid overlay */
  .nasa-grid {
    background:
      linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size: 120px 120px;
    opacity: .25;
    mix-blend-mode: overlay;
  }
`;
document.head.appendChild(style);

/* ---------- DOM ---------- */
const canvas = document.createElement("canvas");
canvas.className = "nasa-canvas";
document.body.prepend(canvas);

const nebula = document.createElement("div");
nebula.className = "nasa-nebula";
document.body.prepend(nebula);

const grid = document.createElement("div");
grid.className = "nasa-grid";
document.body.prepend(grid);

/* ---------- CANVAS ---------- */
const ctx = canvas.getContext("2d");
function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* ---------- STARFIELD (REALISTIC) ---------- */
const STAR_COUNT = Math.min(220, Math.floor(innerWidth / 5));
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 0.9 + 0.2,
  v: Math.random() * 0.12 + 0.03,
  a: Math.random() * 0.6 + 0.2
}));

/* ---------- METEORS (RARE, CINEMATIC) ---------- */
let meteors = [];

function spawnMeteor(){
  meteors.push({
    x: Math.random() * canvas.width * 0.7,
    y: -80,
    len: Math.random() * 180 + 140,
    speed: Math.random() * 6 + 4,
    alpha: 1
  });
}

/* One meteor every ~25–40s */
setInterval(() => {
  if (Math.random() > 0.6) spawnMeteor();
}, 28000);

/* ---------- CAMERA DRIFT ---------- */
let drift = 0;

/* ---------- ANIMATION LOOP ---------- */
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drift += 0.00025;
  const dx = Math.sin(drift) * 6;
  const dy = Math.cos(drift * 0.8) * 4;

  ctx.save();
  ctx.translate(dx, dy);

  /* Stars */
  for(const s of stars){
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();

    s.y += s.v;
    if(s.y > canvas.height){
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }

  /* Meteors */
  for(let i = meteors.length - 1; i >= 0; i--){
    const m = meteors[i];
    ctx.strokeStyle = `rgba(200,220,255,${m.alpha})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.len, m.y + m.len);
    ctx.stroke();

    m.x += m.speed;
    m.y += m.speed;
    m.alpha -= 0.008;

    if(m.alpha <= 0) meteors.splice(i,1);
  }

  ctx.restore();
  requestAnimationFrame(animate);
}

animate();
