/* =================================================
   SUPREME SPACE BACKGROUND (GALAXY EDITION)
   Stars • Parallax • Nebula • Rare Meteors
================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- CANVAS ---------- */
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
  let w, h;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- STAR LAYERS (PARALLAX) ---------- */
  const layers = [
    { count: 80, speed: 0.08, size: 0.8 },
    { count: 120, speed: 0.18, size: 1.4 },
    { count: 160, speed: 0.35, size: 2.2 }
  ];

  let stars = [];
  layers.forEach(layer=>{
    for(let i=0;i<layer.count;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*layer.size + 0.3,
        speed: layer.speed,
        phase: Math.random()*Math.PI*2
      });
    }
  });

  /* ---------- NEBULA CLOUDS ---------- */
  const nebula = Array.from({length:4},()=>({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*700 + 500,
    hue: Math.random()*60 + 210
  }));

  /* ---------- METEORS (RARE) ---------- */
  let meteors = [];
  function spawnMeteor(){
    meteors.push({
      x: Math.random()*w*0.8 + w*0.2,
      y: -100,
      len: Math.random()*220 + 160,
      speed: Math.random()*8 + 10,
      alpha: 1
    });
  }
  setInterval(()=>{
    if(Math.random() > 0.75) spawnMeteor();
  }, 8000);

  /* ---------- DRAW LOOP ---------- */
  function animate(){
    ctx.clearRect(0,0,w,h);

    /* Nebula */
    nebula.forEach(n=>{
      const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
      g.addColorStop(0,`hsla(${n.hue},70%,60%,0.06)`);
      g.addColorStop(1,"transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fill();
    });

    /* Stars */
    stars.forEach(s=>{
      s.y += s.speed;
      s.phase += 0.02;
      if(s.y > h) s.y = 0;

      const alpha = 0.4 + Math.sin(s.phase)*0.35;
      ctx.fillStyle = `rgba(210,225,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();
    });

    /* Meteors */
    for(let i=meteors.length-1;i>=0;i--){
      const m = meteors[i];
      ctx.strokeStyle = `rgba(190,220,255,${m.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x,m.y);
      ctx.lineTo(m.x-m.len,m.y+m.len);
      ctx.stroke();

      m.x += m.speed;
      m.y += m.speed;
      m.alpha -= 0.015;

      if(m.alpha <= 0) meteors.splice(i,1);
    }

    requestAnimationFrame(animate);
  }

  animate();
});
