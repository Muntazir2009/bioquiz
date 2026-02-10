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
  /* COLLAPSIBLE TYPE SELECT */
const box = document.getElementById("typeSelect");
const opts = document.getElementById("typeOptions");
const output = document.getElementById("selectedType");
const input = document.getElementById("typeInput");

box.onclick = () => {
  opts.style.display = opts.style.display === "block" ? "none" : "block";
};

opts.querySelectorAll("div").forEach(opt=>{
  opt.onclick = () => {
    output.textContent = opt.textContent;
    input.value = opt.dataset.value;
    opts.style.display = "none";
  };
});

/* CLOSE ON OUTSIDE CLICK */
document.addEventListener("click", e=>{
  if(!box.contains(e.target) && !opts.contains(e.target)){
    opts.style.display = "none";
  }
});

  const saved = JSON.parse(localStorage.getItem("mySuggestions") || "[]");
  saved.unshift(text);
  localStorage.setItem("mySuggestions", JSON.stringify(saved));

  msg.textContent = "✨ Suggestion sent!";
  form.reset();
});
