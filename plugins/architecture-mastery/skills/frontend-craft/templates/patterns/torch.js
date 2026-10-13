// Linterna: la imagen solo se ve donde apunta el cursor o el dedo; en reposo deriva sola (patrón del brief NOCTURNAL).
// Los detalles ocultos (.hidden dentro del contenedor) aparecen después de alumbrarlos un rato.
//
// Marcado: <div class="torch" data-torch data-r="190"><img …><span class="hidden" style="left:60%;top:30%">…</span></div>
// CSS mínimo:
//   .torch{position:relative;overflow:hidden}
//   .torch::after{content:"";position:absolute;inset:0;pointer-events:none;
//     background:radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0,rgba(0,0,0,.55) 45%,rgba(0,0,0,.97) 100%)}
//   .torch .hidden{position:absolute;opacity:0;transition:opacity 1.2s}
//   .torch.seen .hidden{opacity:.85}
export function initTorches(root = document, { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches } = {}) {
  root.querySelectorAll("[data-torch]").forEach((el) => {
    const r = +(el.dataset.r ?? 180);
    el.style.setProperty("--r", (reduce ? 600 : r) + "px");
    let tx = 0.5, ty = 0.45, x = tx, y = ty, active = false, seen = 0;
    const move = (cx, cy) => { const b = el.getBoundingClientRect(); tx = (cx - b.left) / b.width; ty = (cy - b.top) / b.height; active = true; };
    el.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
    el.addEventListener("pointerleave", () => (active = false));
    el.addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    const loop = (t) => {
      if (!active && !reduce) { tx = 0.5 + Math.sin(t / 2300) * 0.28; ty = 0.48 + Math.sin(t / 1700) * 0.12; }
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      el.style.setProperty("--x", (x * 100).toFixed(2) + "%");
      el.style.setProperty("--y", (y * 100).toFixed(2) + "%");
      const h = el.querySelector(".hidden");
      if (h && active) {
        const b = el.getBoundingClientRect(), hb = h.getBoundingClientRect();
        const d = Math.hypot(hb.left + hb.width / 2 - (b.left + x * b.width), hb.top + hb.height / 2 - (b.top + y * b.height));
        if (d < r * 0.8 && ++seen > 50) el.classList.add("seen");
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}
