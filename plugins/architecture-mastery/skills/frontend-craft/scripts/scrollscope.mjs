// Storyboard del scroll: para entender la coreografía de un sitio con 3D/animación, que una captura
// de página completa no muestra (el canvas es fijo y lo que cambia es la escena).
//
//   node scrollscope.mjs <url> [--out design/references/<nombre>/scroll] [--frames 24] [--mobile]
//
// Hace scroll real con la rueda (dispara GSAP/ScrollTrigger/Lenis igual que un usuario), captura N
// fotogramas repartidos en todo el recorrido y arma storyboard.png (cuadrícula numerada con el % de scroll).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadChromium, args, UA } from "./_pw.mjs";

const a = args();
const url = a._[0];
if (!url) { console.log("Uso: node scrollscope.mjs <url> [--out dir] [--frames 24] [--mobile]"); process.exit(1); }
const out = a.out ?? path.join("design", "references", new URL(url).hostname.replace(/^www\./, ""), "scroll");
fs.mkdirSync(out, { recursive: true });
const N = +(a.frames ?? 24);
const viewport = a.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };

const chromium = loadChromium();
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport, userAgent: UA });
for (let i = 1; ; i++) {
  try { await page.goto(url, { waitUntil: "load", timeout: 90000 }); break; }
  catch (e) { if (i >= 3) throw e; await page.waitForTimeout(3000 * i); }
}
await page.waitForTimeout(+(a.wait ?? 6000));
await page.mouse.move(viewport.width / 2, viewport.height / 2);

const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const frames = [];
for (let i = 0; i < N; i++) {
  const target = Math.round((total * i) / (N - 1));
  // Rueda real en pasos: los sitios con smooth scroll ignoran scrollTo o lo interpolan distinto.
  for (let guard = 0; guard < 80; guard++) {
    const y = await page.evaluate(() => scrollY);
    const d = target - y;
    if (Math.abs(d) < 40) break;
    await page.mouse.wheel(0, Math.max(-600, Math.min(600, d)));
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(+(a.settle ?? 1400));
  const y = await page.evaluate(() => scrollY);
  const file = `${String(i + 1).padStart(2, "0")}.png`;
  await page.screenshot({ path: path.join(out, file), timeout: 180000 });
  frames.push({ file, pct: total ? Math.round((y / total) * 100) : 0 });
}
const html = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${a.mobile ? 6 : 4},1fr);gap:6px;padding:6px;font:12px monospace;color:#ccc">${frames
  .map((f, i) => `<figure style="margin:0"><img src="${f.file}" style="width:100%;display:block"><figcaption>${i + 1} · ${f.pct}%</figcaption></figure>`).join("")}</body></html>`;
fs.writeFileSync(path.join(out, "storyboard.html"), html);
const sheet = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await sheet.goto(pathToFileURL(path.resolve(out, "storyboard.html")).href);
await sheet.waitForTimeout(800);
await sheet.screenshot({ path: path.join(out, "storyboard.png"), fullPage: true });
await browser.close();
console.log(`${frames.length} fotogramas → ${out}/storyboard.png`);
