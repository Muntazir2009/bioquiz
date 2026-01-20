// ================= ADVANCED SPACE BACKGROUND =================
// Auto-injects canvas, nebula, galaxy swirl, meteors

/* ---------- CSS INJECTION ---------- */
const style = document.createElement("style");
style.textContent = `
  .space-canvas, .space-nebula, .space-galaxy {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }

  .space-canvas { z-index: 0; }
  .space-nebula { z-index: 1; }
  .space-galaxy { z-index: 2; }

  .space-nebula {
    background:
      radial-gradient(900px 700px at 30% 40%, rgba(90,140,255,.06), transparent 60%),
      radial-gradient(1000px 800px at 70% 60%, rgba(180,80,255,.05), transparent 65%);
    animation: nebulaMove 140s linear infinite;
  }

  @keyframes nebulaMove {
    from { transform: translate(0,0); }
    to { transform: translate(-220px,160px); }
  }

  .space-galaxy {
    background:
      radial-gradient(circle at center,
        rgba(160,120,255,.08) 0%,
        rgba(100,60,200,.05) 25%,
        transparent 60%);
    animation: galaxySpin 180s linear infinite;
    mix-blend-mode: screen;
  }

  @keyframes galaxySpin {
    from { transform: rotate(0deg) scale(1.05); }
    to { transform: rotate(360deg) scale(1.05); }
  }
`;
document.head.appendChild(style);

/* ---------- DOM ---------- */
const canvas = document.createElement("canvas");
canvas.className = "space-canvas";
document.body.prepend(canvas);

const nebula = document.createElement("div");
nebula.className = "space-nebula";
document.body.prepend(nebula);

const galaxy = document.createElement("div");
galaxy.className = "space-galaxy";
document.body.prepend(galaxy);

/* ---------- CANVAS ---------- */
const ctx = canvas.getContext("2d");
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* ---------- STAR FIELD ---------- */
const STAR_COUNT = 160;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.2 + 0.2,
  s: Math.random() * 0.3 + 0.05
}));

/* ---------- METEORS ---------- */
let meteors = [];

function spawnMeteor(big=false){
  meteors.push({
    x: Math.random() * canvas.width,
    y: -50,
    len: big ? 300 : 180,
    speed: big ? 12 : 8,
    alpha: 1
  });
}

/* Random meteors */
setInterval(() => spawnMeteor(false), 4500);

/* Meteor shower every ~60s */
setInterval(() => {
  for(let i=0;i<8;i++){
    setTimeout(()=>spawnMeteor(true), i*120);
  }
}, 60000);

/* ---------- CAMERA DRIFT ---------- */
let driftX = 0;
let driftY = 0;
let driftAngle = 0;

/* ---------- ANIMATION LOOP ---------- */
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  driftAngle += 0.0003;
  driftX = Math.sin(driftAngle) * 8;
  driftY = Math.cos(driftAngle) * 6;

  ctx.save();
  ctx.translate(driftX, driftY);

  // Stars
  ctx.fillStyle = "#ffffff";
  for(const s of stars){
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();

    s.y += s.s;
    if(s.y > canvas.height){
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }

  // Meteors
  for(let i=meteors.length-1;i>=0;i--){
    const m = meteors[i];
    ctx.strokeStyle = `rgba(180,200,255,${m.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.len, m.y + m.len);
    ctx.stroke();

    m.x += m.speed;
    m.y += m.speed;
    m.alpha -= 0.01;

    if(m.alpha <= 0) meteors.splice(i,1);
  }

  ctx.restore();
  requestAnimationFrame(animate);
}

animate();
