/* =========================================
   CINEMATIC SPACE BACKGROUND (THREE.JS)
   Stars • Shooting Stars • Nebulae
========================================= */

const scene = new THREE.Scene();

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.z = 800;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "0";
renderer.domElement.style.pointerEvents = "none";
document.body.prepend(renderer.domElement);

/* =========================================
   STARFIELD (REALISTIC COLORS + DEPTH)
========================================= */

function createStars(count, size, spread, speed) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  const palette = [
    new THREE.Color(0xffffff),   // white
    new THREE.Color(0xcfe6ff),   // blue
    new THREE.Color(0xfff1c1),   // yellow
    new THREE.Color(0xffd2d2)    // red
  ];

  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      -Math.random() * spread
    );

    const c = palette[Math.floor(Math.random() * palette.length)];
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

/* Layers for depth */
const starsNear = createStars(900, 2.4, 1400, 0.35);
const starsMid  = createStars(600, 1.7, 2200, 0.2);
const starsFar  = createStars(400, 1.2, 3200, 0.1);

scene.add(starsNear, starsMid, starsFar);

/* =========================================
   NEBULAE (SOFT, CLOUD-LIKE)
========================================= */

function createNebula(color, x, y, z, size, opacity) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    mat
  );

  mesh.position.set(x, y, z);
  mesh.rotation.z = Math.random() * Math.PI;
  return mesh;
}

const nebulae = [
  createNebula(0x5c6cff, -300, 200, -1600, 2400, 0.18),
  createNebula(0x8a3cff,  500,-300, -2200, 3000, 0.14),
  createNebula(0x2a9dff, -600,-200, -2600, 3200, 0.12)
];

nebulae.forEach(n => scene.add(n));

/* =========================================
   SHOOTING STARS (METEORS)
========================================= */

const meteors = [];

function spawnMeteor() {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-200, 200, 0)
  ]);

  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  });

  const meteor = new THREE.Line(geo, mat);

  meteor.position.set(
    Math.random() * 1200 - 600,
    Math.random() * 800 + 400,
    -500
  );

  meteor.userData.life = 1;
  meteors.push(meteor);
  scene.add(meteor);
}

/* Rare, cinematic */
setInterval(() => {
  if (Math.random() > 0.7) spawnMeteor();
}, 6000);

/* =========================================
   ANIMATION LOOP
========================================= */

let t = 0;
function animate() {
  t += 0.0008;

  /* Camera drift */
  camera.position.x = Math.sin(t) * 12;
  camera.position.y = Math.cos(t * 0.7) * 10;

  /* Star parallax */
  [starsNear, starsMid, starsFar].forEach(layer => {
    layer.position.z += layer.userData.speed;
    layer.rotation.z += layer.userData.speed * 0.00015;
    if (layer.position.z > camera.position.z) {
      layer.position.z = -3000;
    }
  });

  /* Nebula motion */
  nebulae.forEach(n => {
    n.rotation.z += 0.00012;
  });

  /* Meteors */
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.position.x += 12;
    m.position.y -= 12;
    m.material.opacity -= 0.02;

    if (m.material.opacity <= 0) {
      scene.remove(m);
      meteors.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

/* =========================================
   RESIZE
========================================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
