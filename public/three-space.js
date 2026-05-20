// =====================================
// TRUE DEEP SPACE — INFINITE STARFIELD
// No gaps • No loops • Mobile-safe
// =====================================

const scene = new THREE.Scene();

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 800;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "0";
renderer.domElement.style.pointerEvents = "none";
document.body.prepend(renderer.domElement);

/* ===============================
   STARFIELD
=============================== */

const STAR_COUNT = window.innerWidth < 768 ? 1200 : 2200;
const STAR_SPREAD = 4000;

const starGeo = new THREE.BufferGeometry();
const positions = [];
const colors = [];

const starColors = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xcfe6ff),
  new THREE.Color(0xfff1d6),
];

for (let i = 0; i < STAR_COUNT; i++) {
  positions.push(
    (Math.random() - 0.5) * STAR_SPREAD,
    (Math.random() - 0.5) * STAR_SPREAD,
    (Math.random() - 0.5) * STAR_SPREAD
  );

  const c = starColors[Math.floor(Math.random() * starColors.length)];
  colors.push(c.r, c.g, c.b);
}

starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

const starMat = new THREE.PointsMaterial({
  size: 1.8,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

/* ===============================
   NEBULA CLOUD (SUBTLE)
=============================== */

const nebula = new THREE.Mesh(
  new THREE.SphereGeometry(3000, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
  })
);
scene.add(nebula);

/* ===============================
   ANIMATION (NO RESET)
=============================== */

let t = 0;

function animate() {
  t += 0.00035;

  // ultra-slow drift (no looping feel)
  camera.position.x = Math.sin(t * 0.8) * 18;
  camera.position.y = Math.cos(t * 0.6) * 14;

  stars.rotation.y += 0.00005;
  stars.rotation.x += 0.00002;

  nebula.rotation.y -= 0.00008;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

/* ===============================
   RESIZE
=============================== */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
