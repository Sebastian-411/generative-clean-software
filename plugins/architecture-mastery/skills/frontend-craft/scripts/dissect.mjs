// Disección de un sitio de referencia: mide su sistema de diseño real en vez de adivinarlo.
//
//   node dissect.mjs <url> [--out design/references/<nombre>] [--wait 4000]
//
// Genera: desktop-full.png, mobile-full.png, desktop-fold.png, sections/NN.png y dissection.json/.md con
//   tipografía por rol (familia, tamaño, peso, line-height, tracking), escala de tamaños, paleta por frecuencia
//   de área, anchos de contenedor, padding vertical de secciones, radios, botones, nav, proporción
//   imagen/texto por sección, densidad de palabras y librerías de motion detectadas.
import fs from "node:fs";
import path from "node:path";
import { loadChromium, args, UA } from "./_pw.mjs";

const a = args();
const url = a._[0];
if (!url) { console.log("Uso: node dissect.mjs <url> [--out dir]"); process.exit(1); }
const out = a.out ?? path.join("design", "references", new URL(url).hostname.replace(/^www\./, ""));
fs.mkdirSync(path.join(out, "sections"), { recursive: true });

const chromium = loadChromium();
const browser = await chromium.launch();

async function open(viewport) {
  const page = await browser.newPage({ viewport, userAgent: UA, deviceScaleFactor: 1 });
  for (let attempt = 1; ; attempt++) {
    try { await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 }); break; }
    catch (e) { if (attempt >= 4) throw e; await page.waitForTimeout(3000 * attempt); } // DNS/red transitoria
  }
  await page.waitForTimeout(+(a.wait ?? 4000));
  // Página sin estilos (CSS lento o diferido): fuente por defecto del navegador → espera la carga completa.
  for (let i = 0; i < 3; i++) {
    const unstyled = await page.evaluate(() => /Times New Roman|serif$/i.test(getComputedStyle(document.body).fontFamily) && document.styleSheets.length < 2);
    if (!unstyled) break;
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);
    if (i === 1) await page.reload({ waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
  }
  // Cierra banners de cookies comunes para no medirlos.
  for (const t of ["Accept", "Aceptar", "Accept all", "Aceptar todo", "Allow all", "OK", "Got it", "Entendido"]) {
    const b = page.getByRole("button", { name: t, exact: true }).first();
    if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
  }
  // Recorre la página para disparar lazy-load y reveals.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(250); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800);
  return page;
}

const desk = await open({ width: 1440, height: 900 });
await desk.screenshot({ path: path.join(out, "desktop-fold.png") });
await desk.screenshot({ path: path.join(out, "desktop-full.png"), fullPage: true }).catch(() => {});

const data = await desk.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; };
  const px = (v) => Math.round(parseFloat(v) * 10) / 10;
  const role = (el) => {
    const t = el.tagName;
    if (/^H[1-6]$/.test(t)) return t.toLowerCase();
    if (el.closest("nav,header")) return "nav";
    if (el.closest("button,a[class*=btn],a[class*=button],[role=button]")) return "button";
    if (el.closest("footer")) return "footer";
    if (t === "P" || t === "LI") return "body";
    return null;
  };
  // Tipografía por rol: se pondera por cantidad de caracteres.
  const typo = {};
  const sizes = {};
  for (const el of document.querySelectorAll("body *")) {
    if (!vis(el)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ");
    if (own.length < 2) continue;
    const s = getComputedStyle(el), r = role(el) ?? "other";
    const key = [s.fontFamily.split(",")[0].replace(/["']/g, ""), px(s.fontSize), s.fontWeight, px(parseFloat(s.lineHeight) / parseFloat(s.fontSize) || 0), s.letterSpacing === "normal" ? "0" : (parseFloat(s.letterSpacing) / parseFloat(s.fontSize)).toFixed(3) + "em", s.textTransform].join(" | ");
    typo[r] ??= {}; typo[r][key] = (typo[r][key] ?? 0) + own.length;
    sizes[px(s.fontSize)] = (sizes[px(s.fontSize)] ?? 0) + own.length;
  }
  const top = (o, n = 4) => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, n).map(([k, v]) => ({ style: k, chars: v }));
  const typography = Object.fromEntries(Object.entries(typo).map(([k, v]) => [k, top(v)]));
  const scale = Object.entries(sizes).filter(([, c]) => c > 40).map(([s]) => +s).sort((x, y) => x - y);

  // Paleta por área pintada (fondos) y por texto.
  const bg = {}, fg = {};
  for (const el of document.querySelectorAll("body, body *")) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    if (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") bg[s.backgroundColor] = (bg[s.backgroundColor] ?? 0) + r.width * r.height;
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) fg[s.color] = (fg[s.color] ?? 0) + el.textContent.length;
  }
  const palette = { backgrounds: top(bg, 8).map((x) => ({ color: x.style, area: Math.round(x.chars / 1000) + "k px²" })), text: top(fg, 6).map((x) => ({ color: x.style, chars: x.chars })) };

  // Contenedores: anchos más frecuentes de bloques centrados con margen.
  const widths = {};
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 600 || r.width > 1420 || r.height < 120) continue;
    const left = Math.round(r.left), right = Math.round(innerWidth - r.right);
    if (Math.abs(left - right) < 4 && left > 8) widths[Math.round(r.width)] = (widths[Math.round(r.width)] ?? 0) + 1;
  }
  const containers = top(widths, 5).map((x) => +x.style);

  // Secciones: bloques de primer nivel con alto real; padding vertical, imagen vs texto, palabras.
  const candidates = [...document.querySelectorAll("main > *, body > section, main section, body > div > section, [class*=section]")]
    .filter((el, i, arr) => vis(el) && el.getBoundingClientRect().height > 200 && !arr.some((o) => o !== el && o.contains(el) && o.getBoundingClientRect().height < 4000));
  const uniq = []; for (const el of candidates) if (!uniq.some((u) => u.contains(el) || el.contains(u))) uniq.push(el);
  const sections = uniq.slice(0, 30).map((el) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    let media = 0;
    for (const m of el.querySelectorAll("img,video,canvas,svg,picture")) { const b = m.getBoundingClientRect(); if (b.width > 120 && b.height > 80) media += b.width * b.height; }
    const words = el.innerText.trim().split(/\s+/).filter(Boolean).length;
    const h = el.querySelector("h1,h2,h3");
    return {
      top: Math.round(r.top + scrollY), height: Math.round(r.height),
      paddingY: [px(s.paddingTop), px(s.paddingBottom)], bg: s.backgroundColor,
      mediaRatio: +(Math.min(1, media / (r.width * r.height))).toFixed(2), words,
      heading: h ? h.innerText.trim().slice(0, 90) : null,
    };
  });

  const radii = {}; for (const el of document.querySelectorAll("body *")) { if (!vis(el)) continue; const v = getComputedStyle(el).borderTopLeftRadius; if (v !== "0px") radii[v] = (radii[v] ?? 0) + 1; }
  const buttons = [...document.querySelectorAll("a,button")].filter((el) => vis(el) && getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)" && el.innerText.trim().length > 1 && el.getBoundingClientRect().height < 80).slice(0, 6).map((el) => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return { text: el.innerText.trim().slice(0, 40), h: Math.round(r.height), padX: px(s.paddingLeft), radius: s.borderTopLeftRadius, bg: s.backgroundColor, color: s.color, font: `${px(s.fontSize)}px/${s.fontWeight}` };
  });
  const nav = document.querySelector("header, nav");
  const navInfo = nav ? { height: Math.round(nav.getBoundingClientRect().height), position: getComputedStyle(nav).position, bg: getComputedStyle(nav).backgroundColor, backdrop: getComputedStyle(nav).backdropFilter } : null;

  const html = document.documentElement.outerHTML;
  const libs = { gsap: !!window.gsap || /gsap/i.test(html), framerMotion: /framer-motion|data-framer/i.test(html), lottie: /lottie/i.test(html), webflowIx2: /data-w-id|webflow/i.test(html), three: !!window.THREE || /three(\.module)?\.js/i.test(html), lenis: /lenis/i.test(html), video: document.querySelectorAll("video").length };
  const imgs = [...document.images].filter(vis);
  return {
    title: document.title, pageHeight: document.documentElement.scrollHeight, words: document.body.innerText.split(/\s+/).length,
    typography, scale, palette, containers, sections, radii: top(radii, 6).map((x) => x.style), buttons, nav: navInfo,
    motion: libs, images: { count: imgs.length, formats: [...new Set(imgs.map((i) => (i.currentSrc.split("?")[0].match(/\.(\w+)$/) || [])[1]))].filter(Boolean) },
  };
});

// Capturas por sección (máx. 12) para mirar cada patrón de cerca.
for (const [i, s] of data.sections.slice(0, 12).entries()) {
  await desk.evaluate((y) => scrollTo(0, y), s.top);
  await desk.waitForTimeout(500);
  await desk.screenshot({ path: path.join(out, "sections", String(i + 1).padStart(2, "0") + ".png") });
}
await desk.close();

const mob = await open({ width: 390, height: 844 });
await mob.screenshot({ path: path.join(out, "mobile-fold.png") });
await mob.screenshot({ path: path.join(out, "mobile-full.png"), fullPage: true }).catch(() => {});
await mob.close();
await browser.close();

data.url = url;
fs.writeFileSync(path.join(out, "dissection.json"), JSON.stringify(data, null, 2));
const md = [
  `# Disección — ${data.title}`, `${url}`, "",
  `Alto de página: ${data.pageHeight}px · palabras: ${data.words} · imágenes: ${data.images.count} (${data.images.formats.join(", ")})`,
  `Contenedores frecuentes: ${data.containers.join(", ")}px · radios: ${data.radii.join(", ")}`,
  `Nav: ${JSON.stringify(data.nav)}`, `Motion: ${JSON.stringify(data.motion)}`, "",
  "## Escala tipográfica (px con > 40 caracteres)", data.scale.join(" · "), "",
  "## Tipografía por rol (familia | px | peso | line-height | tracking | transform)",
  ...Object.entries(data.typography).flatMap(([r, list]) => [`**${r}**`, ...list.map((x) => `- ${x.style} — ${x.chars} car.`)]), "",
  "## Paleta", "Fondos por área: " + data.palette.backgrounds.map((x) => `${x.color} (${x.area})`).join(", "),
  "Texto: " + data.palette.text.map((x) => x.color).join(", "), "",
  "## Botones", ...data.buttons.map((b) => `- "${b.text}" h${b.h} padX${b.padX} r${b.radius} ${b.bg} / ${b.color} ${b.font}`), "",
  "## Secciones (top · alto · padding Y · % imagen · palabras · título)",
  ...data.sections.map((s, i) => `${String(i + 1).padStart(2, "0")}. ${s.top} · ${s.height} · ${s.paddingY.join("/")} · ${Math.round(s.mediaRatio * 100)}% · ${s.words}w · ${s.heading ?? ""}`),
].join("\n");
fs.writeFileSync(path.join(out, "dissection.md"), md);
console.log(md);
