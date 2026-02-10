/* RADIO ACTIVE STATE */
document.querySelectorAll(".type-option").forEach(opt=>{
  opt.addEventListener("click",()=>{
    document.querySelectorAll(".type-option")
      .forEach(o=>o.classList.remove("active"));
    opt.classList.add("active");
    opt.querySelector("input").checked = true;
  });
});

/* STAR BACKGROUND */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.onresize = resize;

const stars = Array.from({length:120},()=>({
  x:Math.random()*innerWidth,
  y:Math.random()*innerHeight,
  r:Math.random()*1.3,
  o:Math.random()
}));

(function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    ctx.globalAlpha=s.o;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
  });
  requestAnimationFrame(draw);
})();

/* FORMSPREE SUBMIT */
const form = document.getElementById("suggestionForm");
const msg = document.getElementById("message");

form.addEventListener("submit",e=>{
  e.preventDefault();
  fetch("https://formspree.io/f/xqedearo",{
    method:"POST",
    mode:"no-cors",
    body:new FormData(form)
  }).then(()=>{
    msg.textContent="✨ Suggestion sent successfully!";
    msg.style.color="#6dffcc";
    form.reset();
    document.querySelectorAll(".type-option")
      .forEach(o=>o.classList.remove("active"));
  }).catch(()=>{
    msg.textContent="⚠ Something went wrong.";
    msg.style.color="#ff8a8a";
  });
});
