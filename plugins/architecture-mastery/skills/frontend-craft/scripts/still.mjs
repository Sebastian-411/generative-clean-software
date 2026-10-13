// Exporta un render fijo con fondo transparente desde una página de "still" (ver templates/scroll-scene/still.html).
//   node still.mjs http://localhost:4800/still.html?color=%23ff2e7e apps/web/public/car.png
import fs from "node:fs";
import path from "node:path";
import { loadChromium, args } from "./_pw.mjs";

const a = args();
const [url, out] = a._;
if (!url || !out) {
  console.log("Uso: node still.mjs <url-de-still.html> <salida.png>");
  process.exit(1);
}
const chromium = loadChromium();
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(url, { waitUntil: "load", timeout: 120000 });
await page.locator("body[data-ready]").waitFor({ state: "attached", timeout: 180000 });
fs.mkdirSync(path.dirname(out), { recursive: true });
await page.locator("canvas").screenshot({ path: out, omitBackground: true, timeout: 180000 });
await browser.close();
console.log("still →", out);
