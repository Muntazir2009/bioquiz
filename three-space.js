// ================================
// PREMIUM DEEP SPACE BACKGROUND
// ================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
camera.position.z = 400;

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
// STARFIELD (DEPTH LAYERS)
// ================================
function createStars(count, size, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = [];

  for (let i = 0; i < count; i++) {
    pos.push(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      -Math.random() * spread
    );
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });

  return new THREE.Points(geo, mat);
}

// Three depth layers
scene.add(createStars(1200, 1.2, 1600));
scene.add(createStars(600, 1.8, 1200));
scene.add(createStars(300, 2.4, 800));

// ================================
// NEBULA GLOW (SOFT, NOT LOUD)
// ================================
const nebulaGeo = new THREE.PlaneGeometry(2000, 2000);
const nebulaMat = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.35,
  color: 0x5a7cff
});
const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
nebula.position.z = -800;
scene.add(nebula);

// ================================
// ANIMATION (SLOW, CINEMATIC)
// ================================
let t = 0;
function animate() {
  t += 0.0004;

  camera.position.x = Math.sin(t) * 8;
  camera.position.y = Math.cos(t * 0.8) * 6;
  camera.lookAt(0, 0, -300);

  nebula.rotation.z += 0.0001;

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
