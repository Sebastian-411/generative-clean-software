// Mundos por sección: la paleta de toda la página se interpola hacia la de la sección que domina la pantalla
// (patrón del brief Atlas Zero). Cada sección declara su paleta en data-world, p. ej.
//   <article data-world='{"bg":"#E9D2B8","ink":"#2B1A10","acc":"#B4532A"}'>
// Escribe --bg, --ink, --acc, --ink-2 y --line en :root; el CSS solo usa esas variables.
// Llama a tick() en tu bucle de animación o usa start().
export function createWorlds({ selector = "[data-world]", speed = 0.06, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, onChange } = {}) {
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const worlds = [...document.querySelectorAll(selector)].map((el) => ({ el, w: JSON.parse(el.dataset.world) }));
  const first = worlds[0]?.w ?? { bg: "#ffffff", ink: "#111111", acc: "#555555" };
  const cur = { bg: hex(first.bg), ink: hex(first.ink), acc: hex(first.acc) };
  const root = document.documentElement;
  let active = null;
  function tick() {
    const mid = innerHeight * 0.5;
    let best = worlds[0];
    for (const x of worlds) { const r = x.el.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) best = x; }
    if (!best) return;
    for (const k of ["bg", "ink", "acc"]) {
      const tg = hex(best.w[k]);
      cur[k] = cur[k].map((v, i) => v + (tg[i] - v) * (reduce ? 1 : speed));
      root.style.setProperty("--" + k, `rgb(${cur[k].map(Math.round).join(",")})`);
    }
    const ink = cur.ink.map(Math.round).join(",");
    root.style.setProperty("--ink-2", `rgba(${ink},.66)`);
    root.style.setProperty("--line", `rgba(${ink},.16)`);
    if (best !== active) { active = best; onChange?.(best.el); }
  }
  return { tick, start() { const f = () => { tick(); requestAnimationFrame(f); }; requestAnimationFrame(f); } };
}
