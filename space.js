/* =================================================
   SPACE BACKGROUND – AUTO INJECT (FAIL-SAFE)
   Stars + Meteors + Subtle Galaxy Glow
================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- CREATE CANVAS ---------- */
  let canvas = document.getElementById("stars");

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "stars";
    document.body.prepend(canvas);
  }

  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.zIndex = "0";
  canvas.style.pointerEvents = "none";

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- STARS ---------- */
  const STAR_COUNT = Math.min(220, Math.floor(window.innerWidth / 4));
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.2 + 0.3,
    s: Math.random() * 0.35 + 0.1,
    a: Math.random() * 0.6 + 0.3
  }));

  /* ---------- METEORS ---------- */
  let meteors = [];

  function spawnMeteor() {
    meteors.push({
      x: Math.random() * canvas.width,
      y: -80,
      len: Math.random() * 200 + 120,
      speed: Math.random() * 6 + 5,
      alpha: 1
    });
  }

  setInterval(() => {
    if (Math.random() > 0.6) spawnMeteor();
  }, 6000);

  /* ---------- GALAXY GLOW ---------- */
  let swirl = 0;

  /* ---------- DRAW LOOP ---------- */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (const s of stars) {
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      s.y += s.s;
      if (s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }
    }

    // Galaxy glow (subtle)
    swirl += 0.0006;
    ctx.save();
    ctx.translate(canvas.width * 0.7, canvas.height * 0.4);
    ctx.rotate(swirl);
    const glow = ctx.createRadialGradient(0, 0, 40, 0, 0, 360);
    glow.addColorStop(0, "rgba(120,150,255,0.08)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 360, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      ctx.strokeStyle = `rgba(180,210,255,${m.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.len, m.y + m.len);
      ctx.stroke();

      m.x += m.speed;
      m.y += m.speed;
      m.alpha -= 0.01;

      if (m.alpha <= 0) meteors.splice(i, 1);
    }

    requestAnimationFrame(animate);
  }

  animate();
});
