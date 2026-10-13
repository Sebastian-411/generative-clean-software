// Grafo idea → empresa (patrón del brief Genesis Engine): una frase se convierte en nodos de oportunidad,
// clientes, marca, producto y lanzamiento que aparecen por fases. Canvas 2D, sin dependencias.
// El generador es determinista (misma idea = misma empresa), así que el enlace con la idea reproduce la demo.
//
//   const g = createIdeaGraph({ canvas, sidebarWidth: 350 });
//   const s = g.strategy("Comida casera congelada…");  // datos para tu panel lateral
//   g.build(idea, s); for (let p = 0; p <= 5; p++) setTimeout(() => g.setPhase(p), p * 900);
export function createIdeaGraph({ canvas, sidebarWidth = 350, mobileReserve = 280, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches }) {
/* ---------- Generador (determinista, sin red): idea → estrategia ---------- */
  function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function rng(seed) { let s = seed; return () => (s = Math.imul(s ^ (s >>> 15), 2246822519) ^ Math.imul(s ^ (s >>> 13), 3266489917), ((s ^= s >>> 16) >>> 0) / 4294967296); }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  function words(idea) { return idea.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-zñ]{4,}/g) ?? ["idea"]; }
  function brandName(idea, r) {
    const w = words(idea).filter((x) => !["para","entre","sobre","desde","como","automatica","automatico"].includes(x));
    const root = (w[Math.floor(r() * Math.min(3, w.length))] ?? "nova");
    const stem = root.slice(0, 3 + Math.floor(r() * 2));
    const ends = ["a", "o", "ia", "ly", "eo", "ix", "ra", "on"];
    const n = stem + pick(r, ends);
    return n[0].toUpperCase() + n.slice(1);
  }
  const PALETTES = [["#0F172A","#38BDF8","#F0F9FF"],["#1C1917","#F59E0B","#FFFBEB"],["#052E16","#4ADE80","#F0FDF4"],["#2E1065","#C084FC","#FAF5FF"],["#3F0D12","#FB7185","#FFF1F2"],["#0C0A09","#E7E5E4","#FAFAF9"]];
  function strategy(idea) {
    const r = rng(hash(idea.trim().toLowerCase()));
    const city = pick(r, ["Bogotá", "Medellín", "Ciudad de México", "Lima", "Santiago", "Buenos Aires"]);
    const tam = (0.2 + r() * 2.6).toFixed(1).replace(".", ",");
    const growth = Math.round(8 + r() * 22);
    const seg = [
      pick(r, ["Profesionales de 28–40 años", "Dueños de negocios pequeños", "Creadores de contenido", "Familias con hijos pequeños", "Estudiantes universitarios", "Equipos de operaciones"]),
      pick(r, ["que ya pagan por una alternativa peor", "que hoy lo resuelven con hojas de cálculo", "que buscan esto en Google cada semana", "que delegan todo lo que pueden"]),
    ];
    const name = brandName(idea, r);
    const tone = pick(r, ["cálida y directa", "técnica y confiable", "irreverente y clara", "serena y premium"]);
    const pal = pick(r, PALETTES);
    const features = ["Registro en 60 segundos", "Precios visibles desde el inicio", "Pago recurrente", "Soporte por WhatsApp", "Panel de seguimiento", "Recordatorios automáticos", "Marketplace curado"].sort(() => r() - 0.5).slice(0, 4);
    const price = pick(r, ["$ 39.000/mes", "$ 89.000/mes", "$ 19 USD/mes", "8 % por transacción", "$ 149.000 por pedido"]);
    const channel = pick(r, ["comunidades de WhatsApp", "TikTok orgánico", "alianzas con 5 negocios locales", "búsqueda pagada en Google", "referidos con descuento"]);
    return { city, tam, growth, seg, name, tone, pal, features, price, channel, metric: pick(r, ["30 clientes que repiten", "costo de adquisición < $ 25.000", "10 % de conversión del piloto"]) };
  }
  
  /* ---------- Grafo animado (canvas 2D, física ligera) ---------- */
  const ctx = canvas.getContext("2d");
  const COLORS = ["#EDEFF2", "#5EEAD4", "#7DD3FC", "#C4B5FD", "#FDBA74", "#F9A8D4"];
  let W = 0, H = 0, DPR = 1, nodes = [], edges = [], phase = -1, t0 = 0, playing = false;
  function size() {
    const b = canvas.getBoundingClientRect(); DPR = Math.min(2, devicePixelRatio || 1);
    W = b.width; H = b.height; canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener("resize", size); size();
  const mobile = () => W < 700;
  function area() { return mobile() ? { x: 0, y: 44, w: W, h: H - 44 - mobileReserve } : { x: 0, y: 44, w: W - sidebarWidth, h: H - 44 }; }
  
  function build(idea, s) {
    const A = area(), cx = A.x + A.w / 2, cy = A.y + A.h / 2;
    const R = mobile() ? Math.min(A.w * 0.42, A.h * 0.4) : Math.min(A.w, A.h) * 0.36;
    nodes = []; edges = [];
    const add = (stage, label, angle, rad, size = 1) => { const n = { stage, label, tx: cx + Math.cos(angle) * rad, ty: cy + Math.sin(angle) * rad, x: cx, y: cy, vx: 0, vy: 0, a: 0, size }; nodes.push(n); return n; };
    const maxRoot = mobile() ? 18 : 34;
    const root = add(0, idea.length > maxRoot ? idea.slice(0, maxRoot - 2) + "…" : idea, 0, 0, 1.6);
    const groups = [
      [1, [`Mercado $ ${s.tam} B`, `+${s.growth} % anual`, s.city]],
      [2, [s.seg[0], s.seg[1].replace(/^que /, ""), "Early adopters: 400"]],
      [3, [s.name, `Voz ${s.tone}`, "Dominio disponible"]],
      [4, s.features.slice(0, 3).concat([s.price])],
      [5, [`Canal: ${s.channel}`, "Día 30: piloto", `Meta: ${s.metric}`]],
    ];
    groups.forEach(([stage, labels], gi) => {
      const base = -Math.PI / 2 + (gi / groups.length) * Math.PI * 2;
      const hub = add(stage, ["", "Oportunidad", "Clientes", "Marca", "Producto", "Lanzamiento"][stage], base, R * (mobile() ? 0.66 : 0.55), 1.25);
      edges.push([root, hub]);
      labels.forEach((l, i) => {
        const spread = (i - (labels.length - 1) / 2) * 0.32;
        if (mobile() && i > 1) return;                       // en móvil, dos hojas por etapa
        const leaf = add(stage, l, base + spread * (mobile() ? 1.4 : 1), R * (mobile() ? 0.98 : 1.02), 0.85);
        edges.push([hub, leaf]);
      });
      if (gi > 0) edges.push([nodes.find((n) => n.stage === stage - 1 && n.size === 1.25), hub, true]);
    });
    edges.push([nodes.find((n) => n.stage === 5 && n.size === 1.25), nodes.find((n) => n.stage === 1 && n.size === 1.25), true]);
  }
  
  function draw(now) {
    const time = now / 1000;
    ctx.clearRect(0, 0, W, H);
    const visible = (n) => n.stage <= phase;
    for (const n of nodes) {
      const on = visible(n);
      n.a += ((on ? 1 : 0) - n.a) * 0.08;
      const fx = (n.tx - n.x) * 0.06 + Math.sin(time * 0.7 + n.tx) * 0.04, fy = (n.ty - n.y) * 0.06 + Math.cos(time * 0.6 + n.ty) * 0.04;
      if (on) { n.vx = (n.vx + fx) * 0.82; n.vy = (n.vy + fy) * 0.82; n.x += n.vx; n.y += n.vy; }
    }
    // aristas con pulsos
    for (const [a, b, cross] of edges) {
      const al = Math.min(a.a, b.a); if (al < 0.02) continue;
      const c = COLORS[b.stage];
      ctx.strokeStyle = c; ctx.globalAlpha = al * (cross ? 0.18 : 0.35); ctx.lineWidth = cross ? 1 : 1.2;
      ctx.setLineDash(cross ? [3, 5] : []);
      ctx.beginPath(); ctx.moveTo(a.x, a.y);
      const mx = (a.x + b.x) / 2 + (cross ? (b.y - a.y) * 0.25 : 0), my = (a.y + b.y) / 2 - (cross ? (b.x - a.x) * 0.25 : 0);
      ctx.quadraticCurveTo(mx, my, b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
      if (!reduce) { const p = (time * 0.6 + a.tx * 0.001) % 1; const qx = (1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * mx + p * p * b.x, qy = (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * my + p * p * b.y;
        ctx.globalAlpha = al * 0.9; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(qx, qy, 1.8, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    // nodos
    ctx.font = `500 ${mobile() ? 11 : 12}px Geist, system-ui`; ctx.textBaseline = "middle";
    for (const n of nodes) {
      if (n.a < 0.02) continue;
      const c = COLORS[n.stage];
      if (n.size >= 1.25) {
        const label = n.stage === 0 ? n.label : n.label.toUpperCase();
        ctx.font = n.stage === 0 ? `500 ${mobile() ? 13 : 15}px Geist, system-ui` : `500 ${mobile() ? 9 : 11}px "Geist Mono", monospace`;
        const w = ctx.measureText(label).width + (mobile() ? 16 : 26), h = n.stage === 0 ? (mobile() ? 32 : 38) : (mobile() ? 22 : 28);
        ctx.globalAlpha = n.a;
        ctx.fillStyle = n.stage === 0 ? "#EDEFF2" : "#0E1013";
        ctx.strokeStyle = c; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(n.x - w / 2, n.y - h / 2, w, h, h / 2); ctx.fill(); if (n.stage) ctx.stroke();
        if (n.stage === 0) { ctx.shadowColor = "rgba(125,211,252,.5)"; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0; }
        ctx.fillStyle = n.stage === 0 ? "#08090B" : c; ctx.textAlign = "center"; ctx.fillText(label, n.x, n.y + 1);
        ctx.font = `500 ${mobile() ? 11 : 12}px Geist, system-ui`;
      } else {
        ctx.globalAlpha = n.a;
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = n.a * 0.25; ctx.beginPath(); ctx.arc(n.x, n.y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = n.a; ctx.fillStyle = "#A1A7B0";
        const left = n.x < (area().w) / 2;
        ctx.textAlign = left ? "right" : "left";
        const max = mobile() ? 14 : 30;
        const txt = n.label.length > max ? n.label.slice(0, max - 1) + "…" : n.label;
        ctx.fillText(txt, n.x + (left ? -12 : 12), n.y);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  return { strategy, build, setPhase: (p) => (phase = p), get phase() { return phase; }, resize: size };
}
