// Comparación lado a lado contra referencias diseccionadas: la crítica se hace contra la vara, no contra el gusto propio.
//
//   node compare.mjs <url-propia> --refs design/references/plada-ai,design/references/founderdex-ai [--out design/compare/round-1]
//
// Requiere haber corrido dissect.mjs sobre cada referencia. Genera:
//   fold.png      tu fold desktop junto a los folds de las referencias (misma escala)
//   mobile.png    lo mismo en 390
//   sections.png  tus secciones vs. secciones de referencia
//   metrics.md    tabla de métricas medidas (familias, H1, cuerpo, contenedor, palabras, % imagen, motion) con alertas
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadChromium, args } from "./_pw.mjs";

const a = args();
const url = a._[0];
const refs = (a.refs ?? "").split(",").filter(Boolean);
if (!url || !refs.length) { console.log("Uso: node compare.mjs <url> --refs dirA,dirB [--out dir]"); process.exit(1); }
const out = a.out ?? path.join("design", "compare", "round-" + Date.now());
const mine = path.join(out, "mine");
fs.mkdirSync(mine, { recursive: true });

// 1) Disección propia con el mismo instrumento que las referencias.
const { spawnSync } = await import("node:child_process");
const r = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "dissect.mjs"), url, "--out", mine, "--wait", "2500"], { stdio: "pipe", encoding: "utf8" });
if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exit(1); }

const load = (dir) => JSON.parse(fs.readFileSync(path.join(dir, "dissection.json"), "utf8"));
const me = load(mine);
const others = refs.map((d) => ({ name: path.basename(d), dir: d, data: load(d) }));

// 2) Métricas comparables.
const fams = (d) => [...new Set(Object.values(d.typography).flat().map((x) => x.style.split(" | ")[0]))];
const first = (d, role) => (d.typography[role]?.[0]?.style ?? "").split(" | ");
const headline = (d) => { const s = [...(d.typography.h1 ?? []), ...(d.typography.h2 ?? [])].map((x) => +x.style.split(" | ")[1]).filter(Boolean); return s.length ? Math.max(...s) : 0; };
const body = (d) => +(first(d, "body")[1] ?? 0);
const media = (d) => d.sections.length ? Math.round((d.sections.reduce((s, x) => s + x.mediaRatio, 0) / d.sections.length) * 100) : 0;
const motion = (d) => Object.entries(d.motion).filter(([k, v]) => v && k !== "video").map(([k]) => k).join(", ") || "ninguna";
const row = (n, d) => `| ${n} | ${fams(d).length} (${fams(d).slice(0, 2).join(", ")}) | ${headline(d)} | ${body(d)} | ${d.containers[0] ?? "—"} | ${d.words} | ${media(d)} % | ${d.buttons[0] ? d.buttons[0].h + "px r" + d.buttons[0].radius : "—"} | ${motion(d)} |`;
const lines = [
  "| Sitio | Familias | Titular máx. px | Cuerpo px | Contenedor | Palabras | % imagen/sección | Botón | Motion |",
  "|---|---|---|---|---|---|---|---|---|",
  row("**tuya**", me), ...others.map((o) => row(o.name, o.data)),
];
const warn = [];
const refMax = Math.max(...others.map((o) => headline(o.data)));
if (fams(me).length > Math.max(...others.map((o) => fams(o.data).length))) warn.push(`Usas ${fams(me).length} familias; las referencias usan como máximo ${Math.max(...others.map((o) => fams(o.data).length))}.`);
if (headline(me) > refMax * 1.25) warn.push(`Tu titular (${headline(me)}px) es mucho más grande que el de cualquier referencia (máx. ${refMax}px).`);
if (me.words < Math.min(...others.map((o) => o.data.words)) * 0.6) warn.push(`Tu página tiene ${me.words} palabras; las referencias, ${others.map((o) => o.data.words).join("/")}. Falta contenido real.`);
if (motion(me) !== "ninguna" && others.every((o) => motion(o.data) === "ninguna" || motion(o.data) === "lenis")) warn.push(`Usas ${motion(me)}; las referencias usan casi nada.`);
fs.writeFileSync(path.join(out, "metrics.md"), ["# Comparación medida", "", ...lines, "", ...(warn.length ? ["## Alertas", ...warn.map((w) => "- " + w)] : ["Sin alertas de calibración."])].join("\n"));

// 3) Láminas lado a lado.
const chromium = loadChromium();
const browser = await chromium.launch();
async function sheet(file, imgs, colWidth) {
  const html = `<html><body style="margin:0;background:#1a1a1a;display:flex;gap:12px;padding:12px;align-items:flex-start;font:13px monospace;color:#bbb">${imgs
    .map(([label, src]) => `<figure style="margin:0;width:${colWidth}px"><figcaption style="padding:0 0 6px">${label}</figcaption><img src="${path.relative(out, src).replace(/\\/g, "/")}" style="width:100%;display:block;border:1px solid #333"></figure>`).join("")}</body></html>`;
  // Se escribe a disco y se abre por file:// (una página de setContent no puede cargar archivos locales).
  const htmlFile = path.join(out, file.replace(".png", ".html"));
  fs.writeFileSync(htmlFile, html);
  const page = await browser.newPage({ viewport: { width: imgs.length * (colWidth + 12) + 12, height: 400 } });
  await page.goto(pathToFileURL(path.resolve(htmlFile)).href);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  await page.close();
}
await sheet("fold.png", [["TUYA", path.join(mine, "desktop-fold.png")], ...others.map((o) => [o.name, path.join(o.dir, "desktop-fold.png")])], 720);
await sheet("mobile.png", [["TUYA", path.join(mine, "mobile-fold.png")], ...others.map((o) => [o.name, path.join(o.dir, "mobile-fold.png")])], 300);
const secs = (dir) => { const d = path.join(dir, "sections"); return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith(".png")).slice(1, 4).map((f) => path.join(d, f)) : []; };
await sheet("sections.png", [...secs(mine).map((s, i) => [`TUYA ${i + 2}`, s]), ...others.flatMap((o) => secs(o.dir).slice(0, 1).map((s) => [o.name, s]))], 480);
await browser.close();

console.log(fs.readFileSync(path.join(out, "metrics.md"), "utf8"));
console.log(`\nLáminas en ${out}: fold.png, mobile.png, sections.png. Míralas: ¿un director de arte las pondría en la misma liga?`);
