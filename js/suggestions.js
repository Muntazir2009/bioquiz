/* STAR BACKGROUND */
const c = document.getElementById("stars");
const ctx = c.getContext("2d");

function resize(){
  c.width = innerWidth;
  c.height = innerHeight;
}
resize();
window.onresize = resize;

const stars = Array.from({length:140},()=>({
  x:Math.random()*innerWidth,
  y:Math.random()*innerHeight,
  r:Math.random()*1.2,
  o:Math.random()
}));

(function draw(){
  ctx.clearRect(0,0,c.width,c.height);
  stars.forEach(s=>{
    ctx.globalAlpha=s.o;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
  });
  requestAnimationFrame(draw);
})();

/* SUBMIT */
const form = document.getElementById("suggestionForm");
const msg = document.getElementById("message");

form.addEventListener("submit", e=>{
  e.preventDefault();
  const data = new FormData(form);
  const text = data.get("suggestion");

  fetch("https://formspree.io/f/xqedearo",{
    method:"POST",
    body:data,
    mode:"no-cors"
  });

  const saved = JSON.parse(localStorage.getItem("mySuggestions") || "[]");
  saved.unshift(text);
  localStorage.setItem("mySuggestions", JSON.stringify(saved));

  msg.textContent = "✨ Suggestion sent!";
  form.reset();
});
