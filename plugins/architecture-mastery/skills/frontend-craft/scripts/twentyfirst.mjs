// 21st.dev — 12.000+ componentes React + Tailwind de la comunidad (hero, pricing, testimonios, FAQ, CTA…).
//
//   node twentyfirst.mjs search hero [--n 12] [--out design/21st/hero]
//       Lista los componentes de la etiqueta (sin API key) y captura la PREVIEW real de cada uno a 1440 px
//       en contact-sheet.png, para elegir mirando y no por el nombre.
//   node twentyfirst.mjs install <autor>/<slug>
//       Instala con el shadcn CLI. Requiere API_KEY_21ST (créala en https://21st.dev/mcp; el plan gratis
//       tiene un límite diario). Sin key, muestra licencia, librería de origen y cómo instalarla desde su registro.
//
// Regla: un componente de 21st es un punto de partida. Se re-tematiza con tus tokens (color, fuente,
// radios, sombras, motion) y se mide con shoot.mjs/compare.mjs como cualquier otra pieza.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { loadChromium, args, UA } from "./_pw.mjs";

const a = args();
const [cmd, target] = a._;
const md = async (url) => {
  const r = await fetch(url, { headers: { Accept: "text/markdown", "User-Agent": UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};

if (cmd === "search" && target) {
  const n = +(a.n ?? 12);
  const out = a.out ?? path.join("design", "21st", target.replace(/\W+/g, "-"));
  fs.mkdirSync(out, { recursive: true });
  const list = await md(`https://21st.dev/community/components/s/${encodeURIComponent(target)}.md`);
  const items = [...list.matchAll(/- \[([^\]]+)\]\((https:\/\/21st\.dev\/@([^/]+)\/components\/([^)]+?)\.md)\) — by (.+)/g)]
    .slice(0, n).map((m) => ({ title: m[1], md: m[2], author: m[3], slug: m[4], by: m[5].trim() }));
  if (!items.length) { console.log("Sin resultados. Etiquetas útiles: hero, pricing, testimonials, faq, cta, footer, navbar, features, bento, background."); process.exit(1); }

  const chromium = loadChromium();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, userAgent: UA });
  const shots = [];
  for (const [i, it] of items.entries()) {
    try {
      const meta = await md(it.md);
      it.license = meta.match(/- License: (.+)/)?.[1] ?? "?";
      it.library = meta.match(/- Library: \[([^\]]+)\]/)?.[1] ?? "";
      it.tags = meta.match(/- Tags: (.+)/)?.[1] ?? "";
      await page.goto(`https://21st.dev/@${it.author}/components/${it.slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      // La preview se monta tarde: espera un iframe con src real (no about:blank).
      await page.waitForFunction(() => [...document.querySelectorAll("iframe")].some((f) => /cdn\.21st\.dev/.test(f.src)), null, { timeout: 30000 });
      const src = await page.evaluate(() => [...document.querySelectorAll("iframe")].find((f) => /cdn\.21st\.dev/.test(f.src)).src);
      // La preview es un bundle HTML propio: se abre a ancho completo para verla como en un sitio real.
      await page.goto(src.replace(/theme=\w+/, `theme=${a.theme ?? "light"}`), { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(2500);
      const file = `${String(i + 1).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(out, file) });
      shots.push({ ...it, file });
      console.log(`${file}  ${it.author}/${it.slug}  · ${it.title} · ${it.license}${it.library ? " · lib " + it.library : ""}`);
    } catch (e) { console.error(`  omitido ${it.author}/${it.slug}: ${e.message.split("\n")[0]}`); }
  }
  fs.writeFileSync(path.join(out, "components.json"), JSON.stringify(shots, null, 2));
  const html = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px;font:12px monospace;color:#ccc">${shots
    .map((s) => `<figure style="margin:0"><img src="${s.file}" style="width:100%;display:block"><figcaption>${s.file} · ${s.author}/${s.slug} · ${s.license}</figcaption></figure>`).join("")}</body></html>`;
  fs.writeFileSync(path.join(out, "contact.html"), html);
  const sheet = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await sheet.goto(pathToFileURL(path.resolve(out, "contact.html")).href);
  await sheet.waitForTimeout(800);
  await sheet.screenshot({ path: path.join(out, "contact-sheet.png"), fullPage: true });
  await browser.close();
  console.log(`\n${shots.length} previews → ${out}/contact-sheet.png. Elige mirando; luego: node twentyfirst.mjs install <autor>/<slug>`);
} else if (cmd === "install" && target) {
  const [author, slug] = target.split("/");
  const meta = await md(`https://21st.dev/@${author}/components/${slug}.md`).catch(() => "");
  console.log(meta.split("\n").filter((l) => /^(# |- (Author|Library|License|Tags))/.test(l)).join("\n"));
  const key = process.env.API_KEY_21ST;
  if (!key) {
    console.log(`\nSin API_KEY_21ST. Opciones:
  1) Crea una key gratis en https://21st.dev/mcp y exporta API_KEY_21ST.
  2) Si el componente viene de una librería abierta (ver "Library"), instálalo desde su propio registro
     (p. ej. Magic UI: npx shadcn@latest add "https://magicui.design/r/<componente>").
  3) Conecta el MCP: npx @21st-dev/cli@latest init --client claude`);
    process.exit(2);
  }
  const r = spawnSync("npx", ["shadcn@latest", "add", `https://21st.dev/r/${author}/${slug}?api_key=${key}`], { stdio: "inherit", shell: true });
  process.exit(r.status ?? 1);
} else {
  console.log("Uso:\n  node twentyfirst.mjs search <etiqueta> [--n 12] [--theme light|dark] [--out dir]\n  node twentyfirst.mjs install <autor>/<slug>");
  process.exit(1);
}
