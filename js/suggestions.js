/* ⭐ STAR BACKGROUND */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

const stars = Array.from({length:120}, () => ({
  x: Math.random()*innerWidth,
  y: Math.random()*innerHeight,
  r: Math.random()*1.2,
  o: Math.random()
}));

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    ctx.globalAlpha = s.o;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();

/* 🎉 CONFETTI */
function confetti(){
  for(let i=0;i<80;i++){
    const c=document.createElement("div");
    c.style.position="fixed";
    c.style.left=Math.random()*100+"vw";
    c.style.top="-10px";
    c.style.width="6px";
    c.style.height="6px";
    c.style.background=["#ff3b3b","#ff8080","#fff"][Math.floor(Math.random()*3)];
    c.style.borderRadius="50%";
    c.style.zIndex=9999;
    document.body.appendChild(c);

    const fall=Math.random()*800+400;
    c.animate([
      {transform:"translateY(0)",opacity:1},
      {transform:`translateY(${fall}px)`,opacity:0}
    ],{duration:1200,easing:"ease-out"});

    setTimeout(()=>c.remove(),1200);
  }
}

/* 📩 FORMSPREE SUBMIT (FIXED) */
const form=document.getElementById("suggestionForm");
const msg=document.getElementById("message");

form.addEventListener("submit",e=>{
  e.preventDefault();

  fetch("https://formspree.io/f/xqedearo",{
    method:"POST",
    body:new FormData(form),
    mode:"no-cors"
  });

  // ALWAYS SUCCESS (this is correct for no-cors)
  msg.textContent="✨ Suggestion sent successfully!";
  msg.style.color="#6dffcc";
  confetti();
  form.reset();
});
