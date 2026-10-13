// AnchorScene — el producto 3D como personaje que viaja por una página 2D (patrón Fizzi / CAN-DO).
//
// Un canvas transparente fijo ENCIMA del contenido (pointer-events: none). Cada objeto 3D tiene una lista
// de anclas en el DOM: <div data-anchor="lata" data-rot="-12 25 18" data-scale="1" data-dx="0" data-dy="0">.
// El objeto se posa en el ancla cuando esta llega al centro de la pantalla y viaja entre anclas con el scroll.
// Las anclas son cajas reales del layout: su alto define el tamaño del objeto y se acomodan solas en mobile.
//
//   const s = createAnchorScene({ canvas });
//   s.add("lata", objeto3D);          // objeto normalizado: 1 unidad de alto
//   s.start();
//
// Atributos del ancla:
//   data-anchor="id [id2]"   objetos que usan esta ancla
//   data-rot="x y z"         rotación en grados al posarse
//   data-scale               multiplicador sobre el alto del ancla (default 1)
//   data-dx / data-dy        desplazamiento en px
//   data-out="left|right|top|bottom"  el objeto sale de pantalla por ese lado
//   data-hold-spin="vueltas" si el ancla está dentro de un [data-hold] sticky, gira mientras dura el pin
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Suavidad (medida con ?trace): un solo reloj (lenis.raf dentro del cuadro de la escena), resorte
// críticamente amortiguado en vez de lerp, ease suave entre anclas e inclinación por velocidad de scroll.
//   stiffness: 6–12 (más alto = sigue más pegado al scroll; más bajo = más peso)
export function createAnchorScene({ canvas, lenis = null, stiffness = 8, tilt = 1, fov = 30, exposure = 1, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches } = {}) {
  const mobile = matchMedia("(max-width: 820px)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(4, 2, -3); scene.add(rim);

  const DIST = 10;
  const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, DIST);
  const unitsPerPx = () => (2 * DIST * Math.tan(THREE.MathUtils.degToRad(fov) / 2)) / innerHeight;

  const actors = new Map();
  const deg = THREE.MathUtils.degToRad;
  // Ease suave (sinusoidal): sin la aceleración brusca del cúbico, no "frena en seco" en cada ancla.
  const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;

  function readAnchor(el) {
    const r = el.getBoundingClientRect();
    const rot = (el.dataset.rot ?? "0 0 0").split(/\s+/).map(Number);
    const h = r.height * +(el.dataset.scale ?? 1);
    let x = r.left + r.width / 2 + +(el.dataset.dx ?? 0);
    let y = r.top + r.height / 2 + +(el.dataset.dy ?? 0);
    const out = el.dataset.out;
    if (out === "left") x = -h; if (out === "right") x = innerWidth + h;
    if (out === "top") y = -h; if (out === "bottom") y = innerHeight + h;
    let spin = 0;
    if (el.dataset.holdSpin) {
      const hold = el.closest("[data-hold]");
      if (hold) {
        const hr = hold.getBoundingClientRect();
        const p = THREE.MathUtils.clamp(-hr.top / Math.max(1, hr.height - innerHeight), 0, 1);
        spin = p * +el.dataset.holdSpin * Math.PI * 2;
      }
    }
    // d = cuánto scroll falta para posarse. Se posa en el scroll más cercano a centrar el ancla,
    // acotado a [0, máx]: un ancla del hero arriba del centro ya está posada al cargar.
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const ideal = THREE.MathUtils.clamp(r.top + scrollY + r.height / 2 - innerHeight / 2, 0, maxScroll);
    return { x, y, h, rx: deg(rot[0]), ry: deg(rot[1]) + spin, rz: deg(rot[2]), d: ideal - scrollY };
  }

  function solve(anchors) {
    const s = anchors.map(readAnchor);
    if (!s.length) return null;
    if (s[0].d >= 0) return { ...s[0], at: 0 };                                  // antes de la primera ancla: viaja con ella
    if (s[s.length - 1].d <= 0) return { ...s[s.length - 1], at: s.length - 1 }; // después de la última: se va con ella
    let i = 0;
    while (i < s.length - 2 && s[i + 1].d <= 0) i++;
    const a = s[i], b = s[i + 1];
    const t = ease(THREE.MathUtils.clamp(-a.d / (b.d - a.d), 0, 1));
    const L = (k) => a[k] + (b[k] - a[k]) * t;
    return { x: L("x"), y: L("y"), h: L("h"), rx: L("rx"), ry: L("ry"), rz: L("rz"), at: t < 0.05 ? i : t > 0.95 ? i + 1 : -1 };
  }

  const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpV = new THREE.Vector3();
  // Resorte críticamente amortiguado (sin rebote): sigue al objetivo con inercia física.
  function spring(cur, vel, target, dt) {
    const w = stiffness, x = cur - target, e = Math.exp(-w * dt);
    const v = (vel + w * x) * dt;
    return [target + (x + v) * e, (vel - w * v) * e];
  }
  let lastScroll = scrollY, scrollVel = 0;
  function update(dt) {
    const upp = unitsPerPx();
    const time = performance.now() / 1000;
    // Velocidad de scroll suavizada (px/s): alimenta la inclinación.
    const rawVel = lenis ? lenis.velocity * 60 : (scrollY - lastScroll) / Math.max(dt, 1e-3);
    lastScroll = scrollY;
    scrollVel += (rawVel - scrollVel) * (1 - Math.exp(-6 * dt));
    const lean = reduce ? 0 : THREE.MathUtils.clamp(scrollVel / 4000, -0.35, 0.35) * tilt;
    for (const [id, a] of actors) {
      const st = solve(a.anchors());
      if (!st) { a.object.visible = false; continue; }
      a.object.visible = true;
      // Expone en qué ancla está posado (para tests): <html data-at-lata="2">.
      if (st.at >= 0) document.documentElement.dataset["at" + id[0].toUpperCase() + id.slice(1)] = st.at;
      // Flotación sutil: está vivo aunque nadie haga scroll.
      const bob = reduce ? 0 : Math.sin(time * 1.3 + a.phase) * 0.02;
      const target = [(st.x - innerWidth / 2) * upp, -(st.y - innerHeight / 2) * upp + bob * st.h * upp, st.h * upp];
      // La lata se ladea con la velocidad: hacia atrás al bajar, como si tuviera masa.
      tmpE.set(st.rx + lean + (reduce ? 0 : Math.sin(time * 0.9 + a.phase) * 0.03), st.ry, st.rz - lean * 0.4);
      tmpQ.setFromEuler(tmpE);
      if (reduce || !a.s) {
        a.s = target.slice(); a.v = [0, 0, 0];
        a.object.quaternion.copy(tmpQ);
      } else {
        for (let k = 0; k < 3; k++) [a.s[k], a.v[k]] = spring(a.s[k], a.v[k], target[k], dt);
        a.object.quaternion.slerp(tmpQ, 1 - Math.exp(-stiffness * 1.1 * dt));
      }
      a.object.position.set(a.s[0], a.s[1], 0);
      a.object.scale.setScalar(a.s[2]);
    }
  }

  // Calidad adaptativa: si los frames son lentos, baja la resolución.
  const perf = { n: 0, acc: 0, level: 0 };
  function govern(ms) {
    perf.acc += ms; if (++perf.n < 45) return;
    const avg = perf.acc / perf.n; perf.n = perf.acc = 0;
    if (avg > 34 && perf.level < 2) { perf.level++; renderer.setPixelRatio(perf.level === 1 ? 1.25 : 1); canvas.dataset.quality = perf.level; }
  }

  // ?trace: registra la posición del primer objeto por cuadro (para medir suavidad).
  const trace = new URLSearchParams(location.search).has("trace") ? (window.__trace = []) : null;
  let last = performance.now(), visible = !document.hidden;
  document.addEventListener("visibilitychange", () => (visible = !document.hidden));
  const hooks = [];
  function frame(now) {
    lenis?.raf(now); // mismo cuadro: el scroll suave y la escena nunca se desfasan
    govern(now - last);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;
    update(dt);
    hooks.forEach((f) => f(dt));
    if (trace) { const o = actors.values().next().value?.object; if (o) trace.push([now, o.position.x, o.position.y, scrollY]); }
    renderer.render(scene, camera);
  }
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });

  return {
    THREE, scene, renderer, camera, mobile,
    add(id, object) {
      scene.add(object);
      actors.set(id, { object, phase: actors.size * 1.7, anchors: () => [...document.querySelectorAll(`[data-anchor~="${id}"]`)] });
      return object;
    },
    onFrame: (f) => hooks.push(f),
    start() {
      update(1); // primera pose sin animación
      renderer.render(scene, camera);
      canvas.setAttribute("data-scene-ready", "");
      document.documentElement.classList.add("scene-on");
      renderer.setAnimationLoop(frame);
    },
  };
}
