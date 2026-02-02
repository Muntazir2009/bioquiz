/* ========= REAL SPACE BACKGROUND ========= */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("stars") || document.createElement("canvas");
  canvas.id = "stars";
  document.body.prepend(canvas);

  Object.assign(canvas.style,{
    position:"fixed",
    inset:"0",
    zIndex:"0",
    pointerEvents:"none"
  });

  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;

  function resize(){
    canvas.width = innerWidth * DPR;
    canvas.height = innerHeight * DPR;
    ctx.scale(DPR, DPR);
  }
  resize();
  addEventListener("resize", resize);

  /* ---------- STAR FIELD ---------- */
  const stars = Array.from({length:600},()=>({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    r:Math.random()*1.5,
    a:Math.random()*0.8+0.2,
    s:Math.random()*0.15+0.05
  }));

  /* ---------- NEBULA ---------- */
  function drawNebula(){
    const g = ctx.createRadialGradient(
      innerWidth*0.6, innerHeight*0.4, 0,
      innerWidth*0.6, innerHeight*0.4, innerWidth
    );
    g.addColorStop(0,"rgba(120,90,255,.08)");
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;
    ctx.fillRect(0,0,innerWidth,innerHeight);
  }

  /* ---------- SHOOTING STAR ---------- */
  let meteor=null;
  function spawnMeteor(){
    meteor={
      x:Math.random()*innerWidth,
      y:-100,
      dx:6, dy:6,
      life:80
    };
  }

  function animate(){
    ctx.clearRect(0,0,innerWidth,innerHeight);

    // stars
    for(const s of stars){
      ctx.fillStyle=`rgba(255,255,255,${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();

      s.y+=s.s;
      if(s.y>innerHeight){s.y=0;s.x=Math.random()*innerWidth;}
    }

    // nebula
    drawNebula();

    // meteor
    if(Math.random()<0.002 && !meteor) spawnMeteor();
    if(meteor){
      ctx.strokeStyle="rgba(180,200,255,.8)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(meteor.x,meteor.y);
      ctx.lineTo(meteor.x-80,meteor.y+80);
      ctx.stroke();
      meteor.x+=meteor.dx;
      meteor.y+=meteor.dy;
      meteor.life--;
      if(meteor.life<=0) meteor=null;
    }

    requestAnimationFrame(animate);
  }

  animate();
});
