/* ⭐ STAR BACKGROUND */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

const stars = Array.from({length:140}, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: Math.random() * 1.2,
  o: Math.random()
}));

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    ctx.globalAlpha=s.o;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();

/* 💾 SAVE + SEND */
const form = document.getElementById("suggestionForm");
const msg = document.getElementById("message");

function saveLocal(data){
  const saved = JSON.parse(localStorage.getItem("mySuggestions") || "[]");
  saved.unshift({
    id: Date.now(),
    type: data.get("type"),
    text: data.get("suggestion"),
    date: new Date().toLocaleString()
  });
  localStorage.setItem("mySuggestions", JSON.stringify(saved));
}

form.addEventListener("submit", e=>{
  e.preventDefault();

  const data = new FormData(form);
  saveLocal(data);

  fetch("https://formspree.io/f/xqedearo",{
    method:"POST",
    body:data,
    headers:{Accept:"application/json"}
  }).then(()=>{
    msg.textContent="✨ Suggestion sent successfully!";
    msg.style.color="#6dffcc";
    form.reset();
  }).catch(()=>{
    msg.textContent="⚠ Failed to submit.";
    msg.style.color="#ff8a8a";
  });
});
