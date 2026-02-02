/* =========================================
   THREE.JS – DEEP SPACE STARFIELD
========================================= */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 120;

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "0";
renderer.domElement.style.pointerEvents = "none";

document.body.prepend(renderer.domElement);

/* ===== STAR GEOMETRY ===== */
const starGeometry = new THREE.BufferGeometry();
const starCount = 2500;

const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 800;
}
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xbfdfff,
  size: 0.8,
  transparent: true,
  opacity: 0.85
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

/* ===== ANIMATION ===== */
function animate() {
  stars.rotation.y += 0.0003;
  stars.rotation.x += 0.0001;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

/* ===== PARALLAX ===== */
document.addEventListener("mousemove", e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 0.3;
  const y = (e.clientY / window.innerHeight - 0.5) * 0.3;
  camera.position.x = x * 30;
  camera.position.y = -y * 30;
});

/* ===== RESIZE ===== */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
