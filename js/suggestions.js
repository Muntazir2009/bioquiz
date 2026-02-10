/* ⭐ STAR BACKGROUND */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

const stars = Array.from({length:160}, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: Math.random() * 1.4,
  o: Math.random()
}));

function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    ctx.globalAlpha = s.o;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

/* DEVICE */
document.getElementById("device").value =
  /Mobile|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";

/* AUTO EXPAND + CHAR COUNT */
const textarea = document.getElementById("suggestionText");
const counter = document.getElementById("charCount");

textarea.addEventListener("input", ()=>{
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
  counter.textContent = textarea.value.length;
});

/* FORM SUBMIT */
const form = document.getElementById("suggestionForm");
const msg = document.getElementById("message");

form.addEventListener("submit", e=>{
  e.preventDefault();

  fetch("https://formspree.io/f/xqedearo", {
    method:"POST",
    body:new FormData(form),
    mode:"no-cors"
  }).then(()=>{
    msg.textContent = "✨ Thank you! Your suggestion has been received.";
    msg.style.color = "#6dffcc";
    form.reset();
    counter.textContent = "0";
  }).catch(()=>{
    msg.textContent = "⚠ Something went wrong. Try again.";
    msg.style.color = "#ff8a8a";
  });
});
