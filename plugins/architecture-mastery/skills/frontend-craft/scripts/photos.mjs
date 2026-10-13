// Fotografía real con licencia abierta (Openverse: Wikimedia, StockSnap, Rawpixel, Flickr CC…).
//
//   node photos.mjs "city night aerial" --out design/photos/ciudad [--license cc0] [--n 12] [--wide] [--source wikimedia] [--min-width 2400]
//
// --min-width: descarta previews (Rawpixel/StockSnap entregan 960–1300 px, a veces con marca de agua).
// --source wikimedia: originales en alta resolución (licencias cc0/by/by-sa; atribución en el footer).
//
// Descarga candidatas, guarda credits.json (autor, fuente, licencia, URL) y contact-sheet.png para
// ELEGIR MIRANDO. Reglas: nunca la foto de una persona real identificable junto a una cita o nombre
// inventado; preferir cc0; si es CC BY, la atribución va en el footer.
import fs from "node:fs";
import path from "node:path";
import { loadChromium, args } from "./_pw.mjs";

const a = args();
const q = a._[0];
if (!q) { console.log('Uso: node photos.mjs "<búsqueda en inglés>" [--out dir] [--license cc0|cc0,by] [--n 12] [--wide]'); process.exit(1); }
const out = a.out ?? path.join("design", "photos", q.replace(/\W+/g, "-"));
fs.mkdirSync(out, { recursive: true });

const params = new URLSearchParams({ q, license: a.license ?? "cc0", page_size: String(a.n ?? 12), size: "large", mature: "false" });
if (a.wide) params.set("aspect_ratio", "wide");
if (a.source) params.set("source", a.source);
const minW = +(a["min-width"] ?? 0);
if (minW) params.set("page_size", "20"); // máximo anónimo de Openverse; el filtro descarta muchas
const res = await fetch(`https://api.openverse.org/v1/images/?${params}`);
if (!res.ok) { console.error("Openverse respondió", res.status); process.exit(1); }
let { results = [] } = await res.json();
// Previews de Rawpixel (editor_1024) traen marca de agua: fuera siempre.
results = results.filter((r) => !/rawpixel\.com\/(editor_1024|image_png_)/.test(r.url) && (!minW || r.width >= minW)).slice(0, +(a.n ?? 12));

const credits = [];
for (const [i, r] of results.entries()) {
  const ext = (r.url.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1] ?? "jpg").toLowerCase();
  const file = `${String(i + 1).padStart(2, "0")}.${ext}`;
  // Wikimedia: miniatura de 1920 px (los originales pesan 5–20 MB) y User-Agent con contacto (su política lo exige).
  const src = /upload\.wikimedia\.org\/wikipedia\/commons\/(?!thumb)/.test(r.url) && r.width > 1920
    ? r.url.replace("/commons/", "/commons/thumb/") + "/1920px-" + r.url.split("/").pop()
    : r.url;
  try {
    let img;
    for (let attempt = 0; attempt < 3; attempt++) {
      img = await fetch(src, { headers: { "User-Agent": "frontend-craft/1.0 (https://github.com/Sebastian-411/generative-clean-software; design research)" } });
      if (img.status !== 429 && img.status < 500) break;
      await new Promise((ok) => setTimeout(ok, 1500 * (attempt + 1)));
    }
    if (!img.ok) { console.error("  omitida", img.status, src.slice(0, 90)); continue; }
    fs.writeFileSync(path.join(out, file), Buffer.from(await img.arrayBuffer()));
    credits.push({ file, title: r.title, creator: r.creator, source: r.source, license: `${r.license} ${r.license_version}`, license_url: r.license_url, url: r.foreign_landing_url, width: r.width, height: r.height });
  } catch {}
}
fs.writeFileSync(path.join(out, "credits.json"), JSON.stringify(credits, null, 2));

// Hoja de contactos para elegir con los ojos.
const html = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px;font:12px monospace;color:#ddd">${credits
  .map((c) => `<figure style="margin:0"><img src="${c.file}" style="width:100%;height:220px;object-fit:cover;display:block"><figcaption>${c.file} · ${c.license} · ${c.source}</figcaption></figure>`).join("")}</body></html>`;
fs.writeFileSync(path.join(out, "contact.html"), html);
const chromium = loadChromium();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
await page.goto("file://" + path.resolve(out, "contact.html"));
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, "contact-sheet.png"), fullPage: true });
await browser.close();
console.log(`${credits.length} fotos → ${out} (credits.json, contact-sheet.png). Mira la hoja antes de elegir.`);
