/* ===============================
   ⭐ STAR BACKGROUND
=============================== */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize(){
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

function animateStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(star => {
    ctx.globalAlpha = star.o;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    star.y += star.s;
    if(star.y > canvas.height){
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
  requestAnimationFrame(animateStars);
}
animateStars();

/* ===============================
   📨 FORMSPREE SUBMIT (FIXED)
=============================== */
const form = document.getElementById("suggestionForm");
const msg  = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.textContent = "Submitting...";
  msg.style.color = "#ffb3b3";

  try{
    const res = await fetch(
      "https://formspree.io/f/xqedearo",
      {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: new FormData(form)
      }
    );

    if(res.ok){
      msg.textContent = "✨ Thank you! Your suggestion has been sent.";
      msg.style.color = "#6dffcc";
      form.reset();
    } else {
      throw new Error("Formspree error");
    }
  } catch(err){
    msg.textContent = "⚠ Something went wrong. Try again.";
    msg.style.color = "#ff8a8a";
  }
});
