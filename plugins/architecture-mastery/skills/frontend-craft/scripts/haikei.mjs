// Haikei (app.haikei.app): fondos SVG generativos (waves, blobs, peaks, low-poly, blurry gradient…).
//
//   node haikei.mjs <generator> --colors "#0b0b0c,#1d1d22,#ff5900" --out public/bg/hero.svg [--seed 3]
//
// generator: blob-scene | layered-waves | stacked-waves | wave | layered-peaks | stacked-peaks |
//            layered-steps | stacked-steps | blob-scatter | circle-scatter | polygon-scatter |
//            low-poly | low-poly-grid | blurry-gradient | symbol-scatter | blob
//
// --colors: primer color = fondo; el resto se reparte por capas en orden (interpolando).
// --seed n: pulsa "randomize" n veces para otra variante de la misma familia.
// El SVG sale con preserveAspectRatio="xMidYMid slice" para usarlo como background que cubre.
import fs from "node:fs";
import path from "node:path";
import { loadChromium, args, UA } from "./_pw.mjs";

const a = args();
const generator = a._[0];
if (!generator || !a.out) {
  console.log('Uso: node haikei.mjs <generator> --out file.svg [--colors "#bg,#c1,#c2"] [--seed n]');
  process.exit(1);
}

const chromium = loadChromium();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, userAgent: UA });
await page.goto(`https://app.haikei.app/?generator=${generator}`, { waitUntil: "load", timeout: 90000 });
await page.waitForSelector("svg#visual", { timeout: 60000 });
await page.waitForTimeout(1500);

for (let i = 0; i < Number(a.seed ?? 0); i++) {
  // El botón de dado/randomize es el primer botón sin texto junto a los de exportar.
  await page.evaluate(() => {
    const exportBtn = [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "SVG");
    const row = exportBtn?.parentElement?.parentElement;
    const dice = row && [...row.querySelectorAll("button")].find((b) => !b.innerText.trim());
    dice?.click();
  });
  await page.waitForTimeout(600);
}

let svg = await page.evaluate(() => document.querySelector("svg#visual").outerHTML);
await browser.close();

svg = svg
  .replace(/\sstyle="transition:[^"]*"/g, "")
  .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" ');

if (a.colors) {
  const target = a.colors.split(",").map((c) => c.trim());
  const found = [...new Set([...svg.matchAll(/(?:fill|stop-color|stroke)="(#[0-9a-fA-F]{3,8})"/g)].map((m) => m[1]))];
  const hex = (h) => h.replace("#", "").padEnd(6, "0").slice(0, 6).match(/../g).map((x) => parseInt(x, 16));
  const mix = (c1, c2, t) =>
    "#" + hex(c1).map((v, i) => Math.round(v + (hex(c2)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const layers = target.slice(1).length ? target.slice(1) : target;
  found.forEach((orig, i) => {
    let next;
    if (i === 0) next = target[0];
    else if (layers.length === 1) next = layers[0];
    else {
      const t = (i - 1) / Math.max(1, found.length - 2);
      const pos = t * (layers.length - 1);
      const k = Math.min(layers.length - 2, Math.floor(pos));
      next = mix(layers[k], layers[k + 1], pos - k);
    }
    svg = svg.split(`"${orig}"`).join(`"${next}"`);
  });
}

fs.mkdirSync(path.dirname(a.out), { recursive: true });
fs.writeFileSync(a.out, svg);
console.log(`${generator} → ${a.out} (${svg.length} bytes)`);
