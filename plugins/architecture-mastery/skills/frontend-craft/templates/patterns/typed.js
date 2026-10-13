// Registros que se escriben solos al entrar en pantalla (patrón del brief NOCTURNAL).
//   <article data-typed="03:12 — Se escuchan pasos…"><p><span class="typed"></span><span class="caret"></span></p></article>
// Las pausas en los puntos dan ritmo de máquina de escribir. Con reduced-motion, el texto aparece completo.
export function initTyped(root = document, { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches } = {}) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const text = e.target.dataset.typed, out = e.target.querySelector(".typed");
    if (reduce) { out.textContent = text; return; }
    let i = 0;
    (function type() { out.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(type, text[i - 1] === "." ? 420 : 34 + Math.random() * 50); })();
  }), { rootMargin: "0px 0px -25% 0px" });
  root.querySelectorAll("[data-typed]").forEach((el) => io.observe(el));
}
