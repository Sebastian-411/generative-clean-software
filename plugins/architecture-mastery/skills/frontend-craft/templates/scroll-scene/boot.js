// bootScrollScene — arranque estándar de una landing-escena. Una página solo aporta:
//   shots        planos de cámara por acto
//   palette      dirección de arte de la escena (ver SUNSET en scene.js)
//   loadProduct  adaptador del modelo → { object, select?(variant), paint?, degrade?(), ... }
//   animate      (opcional) ({ dt, p, state, product }) → animación propia por frame
//   readout      (opcional) (state) → texto de la lectura en vivo del HUD (#readout-value)
//
// Marcado esperado: canvas#scene[data-scene], .loader (#pct, .rule i), main[data-acts] con .act,
// #hint, #readout, .swatches button[data-variant | data-color] (+ .swatch-name opcional).
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createCameraRig } from "./camera-rig.js";
import { initActs } from "./acts.js";

export async function bootScrollScene({ shots, palette, bloom, loadProduct, animate, readout, rigOptions }) {
  const $ = (q) => document.querySelector(q);
  const canvas = $("#scene");
  const state = { speed: 0, progress: 0 };
  let rig = null, product = null, mobile = matchMedia("(max-width: 820px)").matches;

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_, loaded, total) => {
    const p = Math.round((loaded / total) * 100);
    if ($("#pct")) $("#pct").textContent = p;
    $(".loader .rule i")?.style.setProperty("--p", p + "%");
  };

  const acts = initActs({
    onProgress: (p, velocity) => {
      state.progress = p;
      if (rig) rig.state.progress = p;
      state.speed = velocity / 140;
      if ($("#hint")) $("#hint").style.opacity = p > 0.02 ? 0 : 1;
      if ($("#readout")) $("#readout").style.opacity = p > 0.02 && p < 0.97 ? 1 : 0;
    },
  });

  try {
    const s = createScene({ canvas, palette, bloom });
    mobile = s.mobile;
    rig = createCameraRig(s.camera, shots, { reduce: acts.reduce, ...rigOptions });
    product = await loadProduct({ manager, mobile, THREE, scene: s.scene });
    s.scene.add(product.object);
    if (product.degrade) s.onDegrade(product.degrade);
    s.onFrame((dt) => {
      rig.update(dt);
      animate?.({ dt, p: rig.state.eased, state, product, rig, THREE });
    });
    s.start();
  } catch (err) {
    // Sin WebGL o sin modelo: queda el poster + los actos en HTML.
    console.warn("Escena no disponible, uso el poster:", err);
    canvas.remove();
    rig = null;
  }

  $(".loader")?.classList.add("done");
  document.body.classList.remove("loading");
  acts.start();

  // Cada plano de cámara coincide con el centro de su sección.
  function alignStops() {
    const main = $("[data-acts]");
    const range = main.offsetHeight - innerHeight;
    const stops = [...main.querySelectorAll(".act")].map((sec, i, all) => {
      if (i === 0) return 0;
      if (i === all.length - 1) return 1;
      return Math.min(1, Math.max(0, (sec.offsetTop + sec.offsetHeight / 2 - innerHeight / 2) / range));
    });
    rig?.setStops(stops);
  }
  alignStops();
  addEventListener("resize", alignStops);

  // Lectura en vivo del HUD (velocidad del scroll → la métrica que tenga sentido para la marca).
  gsap.ticker.add(() => {
    state.speed *= 0.94;
    if (readout && $("#readout-value")) $("#readout-value").textContent = readout(state);
  });

  // Configurador: variantes reales del modelo (data-variant) o color de pintura (data-color).
  document.querySelectorAll(".swatches button").forEach((b) => b.addEventListener("click", async () => {
    document.querySelectorAll(".swatches button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    if ($(".swatch-name")) $(".swatch-name").textContent = b.getAttribute("aria-label");
    if (b.dataset.variant && product?.select) await product.select(b.dataset.variant);
    if (b.dataset.color && product?.paint) state.chosenColor = new THREE.Color(b.dataset.color);
  }));

  if (rig && !mobile && !acts.reduce) addEventListener("pointermove", (e) => {
    gsap.to(rig.state, { pointerX: (e.clientX / innerWidth - 0.5) * 2, pointerY: -(e.clientY / innerHeight - 0.5) * 2, duration: 1.2, ease: "power3.out", overwrite: "auto" });
  });

  return { state, rig, product };
}
