// ================================
// DEEP SPACE – PARALLAX STARFIELD
// ================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  1,
  3000
);
camera.position.z = 600;

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

// ================================
// STAR LAYER CREATOR
// ================================
function createStarLayer(count, size, spread, speed, colors) {
  const geo = new THREE.BufferGeometry();
  const pos = [];
  const col = [];

  for (let i = 0; i < count; i++) {
    pos.push(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      -Math.random() * spread
    );

    const c = colors[Math.floor(Math.random() * colors.length)];
    col.push(c.r, c.g, c.b);
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geo, mat);
  points.userData.speed = speed;
  return points;
}

// Color palette (realistic stars)
const STAR_COLORS = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xcfe6ff),
  new THREE.Color(0xffe7b3)
];

// Layers (near → far)
const nearStars = createStarLayer(700, 2.2, 1200, 0.35, STAR_COLORS);
const midStars  = createStarLayer(500, 1.6, 1800, 0.2, STAR_COLORS);
const farStars  = createStarLayer(350, 1.1, 2400, 0.1, STAR_COLORS);

scene.add(nearStars, midStars, farStars);

// ================================
// NEBULA GLOW (SOFT & WIDE)
// ================================
const nebula = new THREE.Mesh(
  new THREE.PlaneGeometry(2600, 2600),
  new THREE.MeshBasicMaterial({
    color: 0x3a5cff,
    transparent: true,
    opacity: 0.18
  })
);
nebula.position.z = -1200;
scene.add(nebula);

// ================================
// ANIMATION
// ================================
let time = 0;
function animate() {
  time += 0.0008;

  // Slow cinematic camera drift
  camera.position.x = Math.sin(time) * 10;
  camera.position.y = Math.cos(time * 0.7) * 8;

  // Parallax star motion
  [nearStars, midStars, farStars].forEach(layer => {
    layer.rotation.z += layer.userData.speed * 0.0002;
    layer.position.z += layer.userData.speed;
    if (layer.position.z > camera.position.z)
      layer.position.z = -2000;
  });

  nebula.rotation.z += 0.00015;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ================================
// RESIZE
// ================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
