// ======================================
// SUPREME SPACE BACKGROUND (THREE.JS)
// Stars + Parallax + Shooting Stars
// ======================================

if (!window.THREE) {
  console.error("Three.js not loaded");
}

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  1,
  4000
);
camera.position.z = 800;

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "0";
renderer.domElement.style.pointerEvents = "none";
document.body.prepend(renderer.domElement);

// ---------- STAR COLORS ----------
const STAR_COLORS = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xcfe6ff),
  new THREE.Color(0xfff1c1),
  new THREE.Color(0xffd2d2)
];

// ---------- CREATE STAR FIELD ----------
function createStars(count, size, depth, speed) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * depth,
      (Math.random() - 0.5) * depth,
      -Math.random() * depth
    );

    const c = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    colors.push(c.r, c.g, c.b);
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const stars = new THREE.Points(geo, mat);
  stars.userData.speed = speed;
  return stars;
}

// ---------- STAR LAYERS ----------
const starsNear = createStars(700, 2.2, 1400, 0.45);
const starsMid  = createStars(500, 1.5, 2200, 0.25);
const starsFar  = createStars(350, 1.0, 3000, 0.12);

scene.add(starsNear, starsMid, starsFar);

// ---------- NEBULA GLOW ----------
const nebula = new THREE.Mesh(
  new THREE.PlaneGeometry(3500, 3500),
  new THREE.MeshBasicMaterial({
    color: 0x3a4cff,
    transparent: true,
    opacity: 0.12
  })
);
nebula.position.z = -2000;
scene.add(nebula);

// ---------- SHOOTING STARS ----------
const meteors = [];
function spawnMeteor() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0, -120, 60, 0], 3)
  );

  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  });

  const line = new THREE.Line(geo, mat);
  line.position.set(
    (Math.random() - 0.5) * 1200,
    600,
    -800
  );

  line.userData.life = 0;
  meteors.push(line);
  scene.add(line);
}

setInterval(() => {
  if (Math.random() > 0.7) spawnMeteor();
}, 5000);

// ---------- ANIMATION ----------
let t = 0;
function animate() {
  t += 0.0006;

  // Camera drift (cinematic)
  camera.position.x = Math.sin(t) * 15;
  camera.position.y = Math.cos(t * 0.8) * 10;

  // Parallax motion
  [starsNear, starsMid, starsFar].forEach(layer => {
    layer.position.z += layer.userData.speed;
    if (layer.position.z > camera.position.z)
      layer.position.z = -3000;
  });

  // Nebula slow rotation
  nebula.rotation.z += 0.0001;

  // Meteors
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.position.x += 12;
    m.position.y -= 8;
    m.material.opacity -= 0.02;
    m.userData.life++;

    if (m.userData.life > 40) {
      scene.remove(m);
      meteors.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---------- RESIZE ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
