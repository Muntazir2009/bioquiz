// ===============================
// 🌌 THREE.JS SPACE SHADER BG
// ===============================

let scene, camera, renderer, mesh, start = Date.now();

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.Camera();
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("stars"),
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() }
    },
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float iTime;
      uniform vec3 iResolution;

      // --- ShaderToy-style planet shader (simplified & stable)
      vec3 palette(float t){
        return vec3(0.05,0.1,0.2) + vec3(0.3,0.2,0.4)*cos(6.283*(vec3(0.0,0.33,0.67)+t));
      }

      void main(){
        vec2 uv = (gl_FragCoord.xy - 0.5*iResolution.xy)/iResolution.y;

        float r = length(uv);
        float glow = exp(-r*3.0);

        float t = iTime*0.1;
        float n = sin(uv.x*6.0 + t) * cos(uv.y*6.0 - t);

        vec3 col = palette(n*0.2 + t*0.05);
        col *= glow * 1.6;

        // subtle stars
        float stars = fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233))) * 43758.5453);
        col += vec3(step(0.997, stars));

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  window.addEventListener("resize", onResize);
  onResize();
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  mesh.material.uniforms.iResolution.value.set(
    window.innerWidth,
    window.innerHeight,
    1
  );
}

function animate() {
  requestAnimationFrame(animate);
  mesh.material.uniforms.iTime.value = (Date.now() - start) * 0.001;
  renderer.render(scene, camera);
}
