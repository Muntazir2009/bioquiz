/* ===============================
   ⭐ STAR BACKGROUND
=============================== */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.3 + 0.2,
  o: Math.random() * 0.8 + 0.2,
  s: Math.random() * 0.2 + 0.05
}));

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    ctx.globalAlpha = star.o;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    star.y += star.s;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animateStars);
}
animateStars();

/* ===============================
   📨 CLOUDFLARE WORKER SUBMIT
=============================== */
const form = document.getElementById("suggestionForm");
const msg = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.textContent = "Submitting...";
  msg.style.color = "#ffb3b3";

  try {
    const res = await fetch(
      "https://bioquiz-suggestion.killermunu.workers.dev",
      {
        method: "POST",
        body: new FormData(form)
      }
    );

    if (!res.ok) throw new Error("Worker failed");

    msg.textContent = "✨ Thank you! Your suggestion has been saved.";
    msg.style.color = "#6dffcc";
    form.reset();

  } catch (err) {
    msg.textContent = "⚠ Submission failed. Please try again.";
    msg.style.color = "#ff8a8a";
  }
});
