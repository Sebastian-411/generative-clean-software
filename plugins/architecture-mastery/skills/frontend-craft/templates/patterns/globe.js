// Planeta con escenarios (patrón del brief OMEGA). Texturas NASA de dominio público: ver patterns/README.md.
// de actividad humana y una retícula de IA. Todo el aspecto sale de un estado continuo de 4 pesos
// (sostenible, colapso, autómata, singular) que la página interpola: escenarios por scroll o variables del laboratorio.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// [lat, lon] de 44 nodos urbanos.
const CITIES = [[40.7,-74],[34,-118.2],[19.4,-99.1],[4.7,-74.1],[-12,-77],[-23.5,-46.6],[-34.6,-58.4],[-33.4,-70.6],[45.5,-73.6],[49.3,-123.1],[25.8,-80.2],[41.9,-87.6],
  [51.5,-0.1],[48.9,2.3],[52.5,13.4],[40.4,-3.7],[41.9,12.5],[55.8,37.6],[59.3,18.1],[38.7,-9.1],[30,31.2],[6.5,3.4],[-1.3,36.8],[-26.2,28],[33.6,-7.6],[9,38.7],
  [25.2,55.3],[24.7,46.7],[35.7,51.4],[28.6,77.2],[19.1,72.9],[13,77.6],[23.8,90.4],[1.35,103.8],[13.8,100.5],[-6.2,106.8],[14.6,121],[22.3,114.2],[31.2,121.5],
  [39.9,116.4],[37.6,127],[35.7,139.7],[-33.9,151.2],[-37.8,145]];

const deg = THREE.MathUtils.degToRad;
const toVec = (lat, lon, r = 1) => new THREE.Vector3().setFromSphericalCoords(r, deg(90 - lat), deg(lon + 180));

export function createGlobe({ canvas, quality = innerWidth > 900 ? "hi" : "lo" }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality === "hi" ? 1.75 : 1.5));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x020306, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 6.2);

  const world = new THREE.Group();           // posición/escala por sección
  const spin = new THREE.Group();            // rotación propia
  world.add(spin); scene.add(world);
  spin.rotation.z = deg(-23.4) * 0.35;

  // Estado de escena (lo escribe la página; aquí se amortigua).
  const target = { w: new THREE.Vector4(0, 0, 0, 0), x: 0, y: 0, s: 1, density: 1, pulse: 1 };
  const state = { w: new THREE.Vector4(0, 0, 0, 0), x: 0, y: 0, s: 1, density: 1, pulse: 1 };

  const loader = new THREE.TextureLoader();
  const res = quality === "hi" ? "" : "-2k";
  const tex = (name) => { const t = loader.load(`tex/${name}${res}.jpg`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const day = tex("earth-day"), night = tex("earth-night");

  const common = { uTime: { value: 0 }, uW: { value: state.w } };

  // Superficie: lado nocturno con luces; escenarios tiñen, apagan o estructuran las luces.
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { ...common, uDay: { value: day }, uNight: { value: night }, uSun: { value: new THREE.Vector3(-1, 0.3, -0.35).normalize() } },
    vertexShader: `
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform sampler2D uDay, uNight; uniform vec3 uSun; uniform float uTime; uniform vec4 uW;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec3 dayc = texture2D(uDay, vUv).rgb;
        float lights = pow(texture2D(uNight, vUv).r, 1.6);
        float sun = clamp(dot(vN, uSun) * 1.6 + .1, 0., 1.);
        // Base: planeta casi negro con continentes apenas visibles (luz rasante de la instalación).
        vec3 land = dayc * (0.025 + 0.32 * sun * sun);
        // Colores de luces por escenario.
        vec3 present = vec3(1., .72, .42);
        vec3 solar = vec3(.45, 1., .78);
        vec3 collapse = vec3(1., .36, .14);
        vec3 auto = vec3(.85, .93, 1.);
        vec3 singular = vec3(.78, .55, 1.);
        float baseW = clamp(1. - (uW.x + uW.y + uW.z + uW.w), 0., 1.);
        vec3 tint = present * baseW + solar * uW.x + collapse * uW.y + auto * uW.z + singular * uW.w;
        // Colapso: regiones que se apagan y titilan.
        float dead = smoothstep(.45, .7, n2(vUv * vec2(18., 9.) + uTime * .02)) * uW.y;
        float flick = mix(1., .55 + .45 * step(.5, h(floor(vUv * 300.) + floor(uTime * 6.))), uW.y);
        // Autómata: las luces se ordenan en una retícula hexagonal brillante.
        vec2 g = vUv * vec2(240., 120.); vec2 cell = abs(fract(g) - .5);
        float grid = smoothstep(.42, .5, max(cell.x, cell.y));
        float autoL = mix(1., .25 + 2.2 * grid, uW.z);
        // Sostenible: luces más suaves y verdor del día.
        land += dayc * vec3(.0,.08,.05) * uW.x;
        // Solaris: el día se vuelve verde y vivo; Fractura: polvo rojizo; Autómata: metal frío.
        float lum = dot(dayc, vec3(.3,.59,.11));
        land = mix(land, dayc * vec3(.35,.75,.55) * (0.25 + 0.6 * sun), uW.x * .8);
        land = mix(land, vec3(lum) * vec3(.55,.22,.1) * (0.12 + 0.5 * sun), uW.y * .85);
        land = mix(land, vec3(lum) * vec3(.55,.62,.75) * (0.08 + 0.45 * sun), uW.z * .7);
        land = mix(land, vec3(lum) * vec3(.4,.25,.65) * (0.06 + 0.35 * sun), uW.w * .6);
        float L = lights * (1. - dead) * flick * autoL * (1.2 + uW.w * .6);
        vec3 col = land * (1. - uW.y * .5) + tint * L * (1. - sun * .85) * 2.2;
        // Fresnel interior.
        float fr = pow(1. - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 3.);
        vec3 rim = mix(vec3(.35,.6,1.), tint, .5) * fr * .22;
        gl_FragColor = vec4(col + rim, 1.);
      }`,
  });
  const segs = quality === "hi" ? 128 : 72;
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, segs, segs / 2), earthMat);
  spin.add(earth);

  // Atmósfera: halo por fuera, color según escenario.
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.035, 96, 48), new THREE.ShaderMaterial({
    uniforms: { ...common },
    side: THREE.FrontSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      uniform vec4 uW; varying vec3 vN; varying vec3 vV;
      void main(){
        float i = pow(1. - max(dot(vN, vV), 0.), 6.) * .9;
        float b = clamp(1. - (uW.x+uW.y+uW.z+uW.w), 0., 1.);
        vec3 c = vec3(.3,.55,1.)*b + vec3(.3,1.,.75)*uW.x + vec3(1.,.38,.12)*uW.y + vec3(.8,.9,1.)*uW.z + vec3(.7,.45,1.)*uW.w;
        gl_FragColor = vec4(c * i, 1.);
      }`,
  }));
  world.add(atmo);

  // Red de actividad: arcos de gran círculo con pulsos que viajan.
  const arcGeo = new THREE.BufferGeometry();
  const P = [], T = [], ID = [];
  const pairs = [];
  for (let i = 0; i < CITIES.length; i++) for (let k = 0; k < 3; k++) {
    const j = (i * 7 + k * 11 + 3) % CITIES.length; if (j !== i) pairs.push([i, j]);
  }
  pairs.forEach(([i, j], idx) => {
    const a = toVec(...CITIES[i], 1.002), b = toVec(...CITIES[j], 1.002);
    const dist = a.angleTo(b);
    const N = 48;
    for (let s = 0; s < N; s++) {
      for (const t of [s / N, (s + 1) / N]) {
        const p = new THREE.Vector3().copy(a).lerp(b, t).normalize().multiplyScalar(1.002 + Math.sin(Math.PI * t) * dist * 0.07);
        P.push(p.x, p.y, p.z); T.push(t); ID.push(idx);
      }
    }
  });
  arcGeo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  arcGeo.setAttribute("aT", new THREE.Float32BufferAttribute(T, 1));
  arcGeo.setAttribute("aId", new THREE.Float32BufferAttribute(ID, 1));
  const arcMat = new THREE.ShaderMaterial({
    uniforms: { ...common, uDensity: { value: 1 }, uCount: { value: pairs.length } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aT; attribute float aId; varying float vT; varying float vId; void main(){ vT = aT; vId = aId; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `
      uniform float uTime, uDensity, uCount; uniform vec4 uW; varying float vT; varying float vId;
      float h(float x){ return fract(sin(x*91.7)*43758.5); }
      void main(){
        float r = h(vId);
        if (r > uDensity) discard;                       // menos conexiones = mundo más aislado
        float speed = .12 + r * .18;
        float head = fract(uTime * speed + r);
        float pulse = smoothstep(.18, 0., abs(vT - head));
        // Colapso: los arcos se rompen.
        if (uW.y > .05 && h(vId + floor(vT * 12.)) < uW.y * .75) discard;
        float b = clamp(1. - (uW.x+uW.y+uW.z+uW.w), 0., 1.);
        vec3 c = vec3(.55,.8,1.)*b + vec3(.4,1.,.8)*uW.x + vec3(1.,.45,.2)*uW.y + vec3(.9,.95,1.)*uW.z + vec3(.85,.6,1.)*uW.w;
        float base = .035 + uW.z * .06;
        gl_FragColor = vec4(c * (base + pulse * 1.1), base + pulse * .8);
      }`,
  });
  spin.add(new THREE.LineSegments(arcGeo, arcMat));

  // Nodos urbanos.
  const nodeGeo = new THREE.BufferGeometry().setFromPoints(CITIES.map((c) => toVec(...c, 1.004)));
  const nodeMat = new THREE.PointsMaterial({ size: 0.028, color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  spin.add(new THREE.Points(nodeGeo, nodeMat));

  // Retícula de IA (singular): una cáscara geodésica que envuelve el planeta.
  const lattice = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.32, 3)),
    new THREE.LineBasicMaterial({ color: 0xc9a3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(lattice);
  const lattice2 = new THREE.Points(new THREE.IcosahedronGeometry(1.32, 3),
    new THREE.PointsMaterial({ size: 0.02, color: 0xffe2a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(lattice2);

  // Anillo orbital de satélites (autómata).
  const ringPts = [];
  for (let i = 0; i < 900; i++) { const a = Math.random() * Math.PI * 2, r = 1.55 + Math.random() * 0.04; ringPts.push(new THREE.Vector3(Math.cos(a) * r, (Math.random() - 0.5) * 0.02, Math.sin(a) * r)); }
  const ring = new THREE.Points(new THREE.BufferGeometry().setFromPoints(ringPts),
    new THREE.PointsMaterial({ size: 0.012, color: 0xe6f0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.rotation.x = deg(72); world.add(ring);

  // Estrellas.
  const starPts = [];
  for (let i = 0; i < 2600; i++) starPts.push(new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 40));
  const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints(starPts), new THREE.PointsMaterial({ size: 0.09, color: 0xbfcbe0, transparent: true, opacity: 0.7, depthWrite: false }));
  scene.add(stars);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.4, 0.5);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const pointer = new THREE.Vector2();
  addEventListener("pointermove", (e) => pointer.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });

  let last = performance.now();
  const perf = { n: 0, acc: 0, level: 0 };
  function frame(now, extra) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    perf.acc += dt; if (++perf.n === 60) { if (perf.acc / 60 > 0.034 && perf.level < 2) { perf.level++; renderer.setPixelRatio(perf.level === 1 ? 1.1 : 0.85); bloom.enabled = perf.level < 2; } perf.n = 0; perf.acc = 0; }
    const k = 1 - Math.exp(-3.2 * dt);
    state.w.lerp(target.w, k);
    for (const key of ["x", "y", "s", "density", "pulse"]) state[key] += (target[key] - state[key]) * k;
    common.uTime.value = now / 1000;
    arcMat.uniforms.uDensity.value = state.density;
    spin.rotation.y += dt * (0.05 + state.pulse * 0.03);
    lattice.rotation.y -= dt * 0.04; lattice2.rotation.y = lattice.rotation.y;
    lattice.material.opacity = state.w.w * 0.32; lattice2.material.opacity = state.w.w * 0.9;
    ring.material.opacity = state.w.z * 0.85; ring.rotation.z += dt * 0.05;
    nodeMat.opacity = 0.9 * (1 - state.w.y * 0.6);
    world.position.set(state.x, state.y, 0);
    world.scale.setScalar(state.s);
    world.rotation.x += ((pointer.y * 0.18) - world.rotation.x) * k;
    world.rotation.y += ((pointer.x * 0.25) - world.rotation.y) * k;
    stars.rotation.y += dt * 0.004;
    extra?.(dt);
    composer.render();
  }
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight);
  });

  return { target, state, frame, renderer, ready: () => new Promise((ok) => {
    const check = () => (day.image && night.image ? ok() : setTimeout(check, 50)); check();
  }) };
}
