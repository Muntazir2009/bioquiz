// =====================================
// CINEMATIC SPACE BACKGROUND
// Stars • Constellations • Shooting Stars
// =====================================

const canvas = document.getElementById("space-bg");
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.inset = "0";
canvas.style.zIndex = "0";
canvas.style.pointerEvents = "none";

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// --------------------
// STAR FIELD
// --------------------
const STAR_COUNT = Math.min(300, window.innerWidth / 3);
const stars = [];

for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.2,
    a: Math.random(),
    tw: Math.random() * 0.02 + 0.005
  });
}

// --------------------
// CONSTELLATIONS
// --------------------
const constellationLines = [];
for (let i = 0; i < 45; i++) {
  constellationLines.push({
    a: stars[Math.floor(Math.random() * stars.length)],
    b: stars[Math.floor(Math.random() * stars.length)]
  });
}

// --------------------
// SHOOTING STARS
// --------------------
let meteors = [];
function spawnMeteor() {
  meteors.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.3,
    len: Math.random() * 300 + 200,
    speed: Math.random() * 10 + 8,
    life: 1
  });
}
setInterval(() => {
  if (Math.random() > 0.7) spawnMeteor();
}, 5000);

// --------------------
// ANIMATION LOOP
// --------------------
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  for (const s of stars) {
    s.a += s.tw;
    if (s.a > 1 || s.a < 0) s.tw *= -1;

    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Constellation lines
  ctx.strokeStyle = "rgba(180,200,255,0.12)";
  ctx.lineWidth = 0.6;
  constellationLines.forEach(l => {
    const dx = l.a.x - l.b.x;
    const dy = l.a.y - l.b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 160) {
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(l.b.x, l.b.y);
      ctx.stroke();
    }
  });

  // Shooting stars
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    ctx.strokeStyle = `rgba(200,220,255,${m.life})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.len, m.y + m.len);
    ctx.stroke();

    m.x += m.speed;
    m.y += m.speed;
    m.life -= 0.015;

    if (m.life <= 0) meteors.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

animate();
