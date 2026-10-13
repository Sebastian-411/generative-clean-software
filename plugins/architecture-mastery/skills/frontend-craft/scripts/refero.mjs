// Refero Styles (styles.refero.design): 2.000+ sistemas visuales de sitios reales en DESIGN.md.
//
//   node refero.mjs list [--q "quiet luxury dark"] [--tab trending|popular|newest] [--limit 30]
//       Lista estilos (nombre · tagline · url). Si la búsqueda no responde, cae a la galería.
//       Para explorar un vecindario visual, haz `get` de un estilo cercano y abre su related.md.
//   node refero.mjs get <style-url> --out design/references/<slug>
//       Guarda DESIGN.md, screenshot de la página de estilo y los estilos relacionados.
import fs from "node:fs";
import path from "node:path";
import { loadChromium, args, UA } from "./_pw.mjs";

const BASE = "https://styles.refero.design/";
const a = args();
const [cmd, target] = a._;
const chromium = loadChromium();

async function open() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, userAgent: UA });
  return { browser, page };
}

async function styleLinks(page, limit) {
  return page.evaluate((limit) => {
    const seen = new Set();
    return [...document.querySelectorAll('a[href*="/style/"]')]
      .filter((el) => !seen.has(el.href) && seen.add(el.href))
      .slice(0, limit)
      .map((el) => {
        const [name, ...rest] = el.innerText.split("\n").map((s) => s.trim()).filter(Boolean);
        return { name, tagline: rest.join(" "), url: el.href };
      });
  }, limit);
}

async function scrollToLoad(page, rounds = 4) {
  for (let i = 0; i < rounds; i++) {
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(700);
  }
}

if (cmd === "list") {
  const limit = Number(a.limit ?? 30);
  const { browser, page } = await open();
  let url = BASE;
  if (a.q) url += "?q=" + encodeURIComponent(a.q);
  await page.goto(url, { waitUntil: "load", timeout: 90000 });
  if (a.tab) {
    await page.getByRole("button", { name: new RegExp("^" + a.tab + "$", "i") }).first().click().catch(() => {});
  }
  await page.waitForTimeout(6000);
  await scrollToLoad(page);
  let items = await styleLinks(page, limit);
  if (!items.length) {
    console.error("Búsqueda sin resultados o no disponible; uso la galería (Trending/Popular).");
    await page.goto(BASE, { waitUntil: "load", timeout: 90000 });
    await page.waitForTimeout(5000);
    await scrollToLoad(page, 6);
    items = await styleLinks(page, limit);
  }
  const chips = await page.evaluate(() =>
    [...document.querySelectorAll("button, a")]
      .map((e) => e.innerText.trim())
      .filter((t) => t && t.length < 32 && /^[A-Z]/.test(t) && !t.includes("\n")),
  );
  for (const it of items) console.log(`${it.name} · ${it.tagline}\n  ${it.url}`);
  console.log("\nEstilos-semilla sugeridos (úsalos como --q): " + [...new Set(chips)].slice(0, 30).join(" | "));
  await browser.close();
} else if (cmd === "get" && target) {
  const out = a.out ?? path.join("design", "references", target.split("/").pop());
  fs.mkdirSync(out, { recursive: true });
  const { browser, page } = await open();
  await page.goto(target, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(out, "style-page.png") });
  const title = (await page.title()).replace(/\s*\|.*$/, "");
  const related = await styleLinks(page, 20);
  await page.locator("button[role=tab]:visible", { hasText: "DESIGN.md" }).first().click();
  await page.waitForTimeout(2500);
  const md = await page.evaluate(() => {
    const pre = document.querySelector("pre, code, textarea");
    return pre ? pre.innerText : document.body.innerText;
  });
  fs.writeFileSync(path.join(out, "DESIGN.md"), md);
  fs.writeFileSync(
    path.join(out, "related.md"),
    related.map((r) => `- [${r.name}](${r.url}) — ${r.tagline}`).join("\n") + "\n",
  );
  console.log(`${title}\n  DESIGN.md (${md.length} chars), style-page.png, related.md → ${out}`);
  await browser.close();
} else {
  console.log("Uso:\n  node refero.mjs list [--q texto] [--tab popular|newest] [--limit n]\n  node refero.mjs get <url-de-estilo> [--out dir]");
  process.exit(1);
}
