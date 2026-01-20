/* ===============================
   CINEMATIC SPACE BACKGROUND
   =============================== */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let w, h, dpr;
function resize() {
  dpr = window.devicePixelRatio || 1;
  w = canvas.width = window.innerWidth * dpr;
  h = canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.scale(dpr, dpr);
}
resize();
window.addEventListener("resize", resize);

/* ---------- STAR LAYERS ---------- */
const STAR_LAYERS = [
  { count: 80, speed: 0.05, size: 0.6 },
  { count: 120, speed: 0.12, size: 1 },
  { count: 160, speed: 0.25, size: 1.4 }
];

let stars = [];
STAR_LAYERS.forEach((layer, li) => {
  for (let i = 0; i < layer.count; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: li,
      size: layer.size * (0.5 + Math.random()),
      speed: layer.speed * (0.5 + Math.random()),
      alpha: 0.3 + Math.random() * 0.7
    });
  }
});

/* ---------- METEORS ---------- */
let meteors = [];

function spawnMeteor() {
  meteors.push({
    x: Math.random() * window.innerWidth,
    y: -50,
    vx: 6 + Math.random() * 4,
    vy: 8 + Math.random() * 4,
    life: 0,
    maxLife: 40 + Math.random() * 20
  });
}

setInterval(() => {
  if (Math.random() < 0.35) spawnMeteor();
}, 2500);

/* ---------- GALAXY SWIRL ---------- */
let swirlAngle = 0;

/* ---------- DRAW LOOP ---------- */
function draw() {
  ctx.clearRect(0, 0, w, h);

  /* Stars */
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > window.innerHeight) {
      s.y = -5;
      s.x = Math.random() * window.innerWidth;
    }

    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });

  /* Galaxy swirl (very subtle) */
  swirlAngle += 0.0005;
  ctx.save();
  ctx.translate(window.innerWidth * 0.7, window.innerHeight * 0.4);
  ctx.rotate(swirlAngle);
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 280);
  grd.addColorStop(0, "rgba(120,160,255,0.05)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Meteors */
  meteors.forEach((m, i) => {
    m.life++;
    m.x += m.vx;
    m.y += m.vy;

    ctx.strokeStyle = "rgba(180,220,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.vx * 3, m.y - m.vy * 3);
    ctx.stroke();

    if (m.life > m.maxLife) meteors.splice(i, 1);
  });

  requestAnimationFrame(draw);
}

draw();
