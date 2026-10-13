// ScrollScene — motor de escena para landings cinematográficas.
// Un renderer, un canvas fijo, cielo propio, entorno coherente (con softboxes de estudio),
// postproceso y calidad adaptativa. La dirección de arte vive en `palette`.
// Uso: const s = createScene({ canvas, palette }); s.onFrame((dt) => ...); s.start();
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Paleta por defecto: atardecer "hora dorada" (key art de GTA 6). Colores del cielo en lineal.
export const SUNSET = {
  zenith: [0.035, 0.02, 0.07], mid: [0.55, 0.06, 0.32], horizon: [1.0, 0.42, 0.18], ground: [0.42, 0.07, 0.12],
  sun: [1.0, 0.62, 0.35], sunDir: [-0.42, 0.075, 1], sunBands: true,
  softboxes: [],                                        // [{ pos:[x,y,z], size:[w,h], intensity }]
  fog: { color: 0xb04a66, near: 7, far: 40 },
  floor: { color: 0x150812, metalness: 0.7, roughness: 0.38 },
  grid: [0xff2e7e, 0x3a1240],
  rim: { color: 0xff8a5a, intensity: 2.4, pos: [0, 3, 12] },
  key: null,                                            // { color, intensity, pos }
  fill: { sky: 0x29e0e6, ground: 0x150812, intensity: 0.25 },
  exposure: 0.95, envIntensity: 1.1, fov: 32,
};

export function createScene({ canvas, palette = {}, mobile = matchMedia("(max-width: 820px)").matches, bloom = {} }) {
  const P = { ...SUNSET, ...palette };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = P.exposure;

  const scene = new THREE.Scene();
  if (P.fog) scene.fog = new THREE.Fog(P.fog.color, P.fog.near, P.fog.far);
  const camera = new THREE.PerspectiveCamera(mobile ? P.fov + 14 : P.fov, innerWidth / innerHeight, 0.05, 200);

  const v3 = (a) => new THREE.Vector3(...a);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        uSun: { value: v3(P.sunDir).normalize() }, uSunOn: { value: P.sun ? 1 : 0 }, uBands: { value: P.sunBands ? 1 : 0 },
        uTop: { value: v3(P.zenith) }, uMid: { value: v3(P.mid) }, uHor: { value: v3(P.horizon) },
        uGround: { value: v3(P.ground) }, uSunCol: { value: v3(P.sun ?? [0, 0, 0]) },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vDir; uniform vec3 uSun, uTop, uMid, uHor, uGround, uSunCol; uniform float uSunOn, uBands;
        void main(){
          float h = vDir.y;
          vec3 c = mix(uHor, uMid, smoothstep(0.0, .16, h));
          c = mix(c, uTop, smoothstep(.14, .55, h));
          c = mix(uGround, c, smoothstep(-.03, .015, h));
          float d = distance(vDir, uSun);
          float disc = smoothstep(.085,.06,d);
          c += uSunOn * uSunCol * disc * 2.2;
          c += uSunOn * uSunCol * vec3(1.,.55,.8) * pow(max(0., 1.0 - d*1.6), 6.0) * .9;
          float band = step(.5, fract((vDir.y - uSun.y) * 90.0)) * step(vDir.y, uSun.y + .01) * disc;
          c -= uSunOn * uBands * band * vec3(.6,.3,.25);
          gl_FragColor = vec4(max(c, 0.0), 1.0);
        }`,
    }),
  );
  scene.add(sky);

  // Entorno = el mismo cielo + softboxes de estudio (solo en el entorno: dan reflejos, no se ven).
  const envScene = new THREE.Scene();
  envScene.add(sky.clone());
  for (const b of P.softboxes) {
    const box = new THREE.Mesh(new THREE.PlaneGeometry(...b.size), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(b.intensity ?? 4), side: THREE.DoubleSide }));
    box.position.set(...b.pos); box.lookAt(0, 0, 0);
    envScene.add(box);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = P.envIntensity;
  pmrem.dispose();

  if (P.floor) {
    const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial(P.floor));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
  }
  if (P.grid) {
    const grid = new THREE.GridHelper(120, 120, P.grid[0], P.grid[1]);
    grid.material.transparent = true; grid.material.opacity = 0.16; grid.position.y = 0.002;
    scene.add(grid);
  }
  for (const L of [P.rim, P.key]) {
    if (!L) continue;
    const d = new THREE.DirectionalLight(L.color, L.intensity); d.position.set(...L.pos); scene.add(d);
  }
  // Relleno hemisférico (no direccional: su especular no deja manchas en el piso).
  if (P.fill) scene.add(new THREE.HemisphereLight(P.fill.sky, P.fill.ground, P.fill.intensity));

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), bloom.strength ?? 0.42, bloom.radius ?? 0.5, bloom.threshold ?? 0.9);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // Calidad adaptativa: frames lentos → DPR 1 → sin bloom ni extras caros (degraders del producto).
  const perf = { n: 0, acc: 0, level: 0 };
  const degraders = [];
  function govern(ms) {
    perf.acc += ms; if (++perf.n < 45) return;
    const avg = perf.acc / perf.n; perf.n = perf.acc = 0;
    if (avg < 34 || perf.level >= 2) return;
    perf.level++;
    if (perf.level === 1) { renderer.setPixelRatio(1); composer.setPixelRatio?.(1); }
    if (perf.level === 2) { bloomPass.enabled = false; degraders.forEach((f) => f()); }
    canvas.dataset.quality = String(perf.level);
  }

  const frameHandlers = [];
  let last = performance.now(), visible = !document.hidden;
  document.addEventListener("visibilitychange", () => (visible = !document.hidden));
  function frame(now) {
    govern(now - last);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;
    frameHandlers.forEach((f) => f(dt));
    composer.render();
  }

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  });

  return {
    THREE, renderer, scene, camera, composer, bloomPass, mobile,
    onFrame: (f) => frameHandlers.push(f),
    onDegrade: (f) => degraders.push(f),
    start() {
      renderer.compile(scene, camera);
      frameHandlers.forEach((f) => f(1));
      composer.render();
      canvas.setAttribute("data-scene-ready", "");
      renderer.setAnimationLoop(frame);
    },
  };
}

// Normaliza un modelo cualquiera: lo centra, lo apoya en el piso (y = 0) y lo escala
// para que su lado más largo mida `size` unidades. Así los planos de cámara son portables.
// `measure(mesh)` filtra qué mallas cuentan (p. ej. ignorar geometría suelta que infla la caja).
export function fitObject(object, { size = 4, lift = 0, measure } = {}) {
  object.updateMatrixWorld(true);
  const bounds = () => {
    if (!measure) return new THREE.Box3().setFromObject(object);
    const b = new THREE.Box3();
    object.traverse((o) => { if (o.isMesh && measure(o)) b.expandByObject(o); });
    return b;
  };
  const box = bounds();
  const dims = box.getSize(new THREE.Vector3());
  const s = size / Math.max(dims.x, dims.y, dims.z);
  object.scale.multiplyScalar(s);
  object.updateMatrixWorld(true);
  box.copy(bounds());
  const c = box.getCenter(new THREE.Vector3());
  object.position.x -= c.x;
  object.position.z -= c.z;
  object.position.y -= box.min.y - lift;
  return object;
}

// Sombra de contacto suave (textura radial) para objetos sin AO horneado o que flotan.
export function contactShadow({ width = 3, depth = 1.5, opacity = 0.55, color = "#000" } = {}) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, color); grd.addColorStop(1, "transparent");
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity, depthWrite: false, toneMapped: false }),
  );
  m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.renderOrder = 2;
  return m;
}
