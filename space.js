const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let w, h;
function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ===== STAR SYSTEM ===== */
const STAR_LAYERS = [
  { count: 80, speed: 0.15, size: 1.2 },
  { count: 120, speed: 0.3, size: 1.6 },
  { count: 180, speed: 0.6, size: 2.2 }
];

let stars = [];

function createStars(){
  stars = [];
  STAR_LAYERS.forEach(layer=>{
    for(let i=0;i<layer.count;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random(),
        r: Math.random()*layer.size + 0.3,
        speed: layer.speed,
        twinkle: Math.random()*Math.PI*2
      });
    }
  });
}
createStars();

/* ===== NEBULA ===== */
const nebula = [];
for(let i=0;i<6;i++){
  nebula.push({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*600 + 400,
    hue: Math.random()*60 + 220
  });
}

/* ===== DRAW ===== */
function draw(){
  ctx.clearRect(0,0,w,h);

  /* Nebula background */
  nebula.forEach(n=>{
    const g = ctx.createRadialGradient(
      n.x,n.y,0,
      n.x,n.y,n.r
    );
    g.addColorStop(0,`hsla(${n.hue},70%,60%,0.08)`);
    g.addColorStop(1,"transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fill();
  });

  /* Stars */
  stars.forEach(s=>{
    s.y += s.speed;
    s.x += Math.sin(s.z*10)*0.05;

    if(s.y > h) s.y = 0;
    if(s.x > w) s.x = 0;

    s.twinkle += 0.03;
    const alpha = 0.4 + Math.sin(s.twinkle)*0.4;

    ctx.fillStyle = `rgba(200,220,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}

draw();
