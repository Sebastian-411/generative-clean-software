// Captura + auditoría visual de una página para el loop de crítica.
//
//   node shoot.mjs <url> [--out design/shots/round-1] [--reduced-motion] [--mode landing|app]
//   --mode app: pantalla de aplicativo (sin exigencia de hero grande; sí una sola acción primaria).
//
// Genera, por viewport (desktop 1440x900, mobile 390x844):
//   <vp>-fold.png, <vp>-full.png, <vp>-s1..s4.png (cortes al 20/40/60/80% del scroll)
// y audit.json con señales objetivas de "se ve generado por IA" o de falta de oficio.
// La auditoría no reemplaza mirar las imágenes: es el piso, no el techo.
import fs from "node:fs";
import path from "node:path";
import { loadChromium, args } from "./_pw.mjs";

const a = args();
const url = a._[0];
if (!url) {
  console.log("Uso: node shoot.mjs <url> [--out dir] [--reduced-motion] [--mode landing|app]");
  process.exit(1);
}
const out = a.out ?? path.join("design", "shots", "round-" + Date.now());
fs.mkdirSync(out, { recursive: true });

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const chromium = loadChromium();
// WebGL por software en headless (escenas 3D).
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const report = { url, viewports: {} };

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: name === "mobile" ? 2 : 1,
    reducedMotion: a["reduced-motion"] ? "reduce" : "no-preference",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("requestfailed", (r) => errors.push("request failed: " + r.url()));

  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  // Escena 3D: espera la primera frame estable (data-scene-ready) y deja correr la intro.
  const hasScene = (await page.locator("[data-scene]").count()) > 0;
  if (hasScene) await page.locator("[data-scene-ready]").first().waitFor({ state: "attached", timeout: 120000 });
  await page.waitForTimeout(hasScene ? 3500 : 1200);
  await page.screenshot({ path: path.join(out, `${name}-fold.png`), timeout: 180000 });

  // Recorre la página (en una escena, cada corte es un acto) antes de la captura completa.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const actsSeen = [];
  const stops = hasScene ? [0.15, 0.35, 0.55, 0.72, 0.9] : [0.2, 0.4, 0.6, 0.8, 1];
  for (const [i, f] of stops.entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((height - viewport.height) * f));
    await page.waitForTimeout(hasScene ? 3000 : 900);
    actsSeen.push(await page.evaluate(() => document.querySelector("[data-act]")?.dataset.act ?? null));
    await page.screenshot({ path: path.join(out, `${name}-s${i + 1}.png`), timeout: 180000 });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  // Con canvas fijo la captura completa no dice nada (y con WebGL por software tarda minutos).
  if (!hasScene) await page.screenshot({ path: path.join(out, `${name}-full.png`), fullPage: true });

  const audit = await page.evaluate(([vpName, mode]) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
    };
    const textEls = [...document.querySelectorAll("body *")].filter(
      // Las capturas de producto ([role=img]) tienen su propia escala de UI: no cuentan para la tipografía de la página.
      (el) => visible(el) && !el.closest('[role="img"]') && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1),
    );
    const families = new Set(), sizes = new Set(), radii = new Set(), colors = new Set();
    let shadows = 0, gradients = 0, aiGradients = 0, timidDisplay = 0, longLines = 0, centeredParagraphs = 0;
    const invisible = [];
    const thin = {}, unloaded = new Set();
    const toHue = (rgb) => {
      const [r, g, b] = rgb.map((v) => v / 255);
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      if (!d) return null;
      let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return (h * 60 + 360) % 360;
    };
    for (const el of textEls) {
      const s = getComputedStyle(el);
      families.add(s.fontFamily.split(",")[0].replace(/["']/g, "").trim());
      sizes.add(Math.round(parseFloat(s.fontSize)));
      colors.add(s.color);
      // Peso light en tamaño de lectura: trazos finos que se rasterizan "cuadrados" (el tell tipográfico más común).
      const wgt = +s.fontWeight, fam0 = s.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      if (wgt < 400 && fs < 40) { const k = `${fam0} ${wgt} ${Math.round(fs)}px`; thin[k] = (thin[k] ?? 0) + el.innerText.length; }
      // Peso o estilo que la fuente no cargó: el navegador lo sintetiza (negrita falsa, itálica inclinada a la fuerza).
      if (!document.fonts.check(`${s.fontStyle} ${wgt} ${fs}px "${fam0}"`)) unloaded.add(`${fam0} ${wgt} ${s.fontStyle}`);
      // Texto transparente sin background-clip:text propio (típico gradient-text roto por spans animados)
      if (/rgba\(.*,\s*0\)$/.test(s.color) && s.backgroundClip !== "text" && s.webkitBackgroundClip !== "text")
        invisible.push(el.innerText.trim().slice(0, 30));
      const fs = parseFloat(s.fontSize);
      const ls = s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing);
      if (fs >= 48 && ls >= 0) timidDisplay++;
      if (el.tagName === "P") {
        const perLine = el.getBoundingClientRect().width / (fs * 0.5);
        if (perLine > 85 && el.innerText.length > 90) longLines++;
        if (s.textAlign === "center" && el.innerText.length > 220) centeredParagraphs++;
      }
    }
    for (const el of document.querySelectorAll("body *")) {
      if (!visible(el)) continue;
      const s = getComputedStyle(el);
      // Círculos (50%) y píldoras (≥ 100px) son formas, no radios del sistema.
      const r0 = s.borderRadius.split(" ")[0];
      if (r0 !== "0px" && /^\d/.test(r0) && !r0.endsWith("%") && parseFloat(r0) < 100) radii.add(r0);
      if (s.boxShadow !== "none") shadows++;
      if (s.backgroundImage.includes("gradient")) {
        gradients++;
        const hues = [...s.backgroundImage.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)]
          .map((m) => toHue([+m[1], +m[2], +m[3]])).filter((h) => h !== null);
        if (hues.some((h) => h >= 250 && h <= 300) && hues.some((h) => h >= 190 && h < 250)) aiGradients++;
      }
    }
    const hero = [...textEls].filter((el) => el.getBoundingClientRect().top < innerHeight);
    const heroMax = Math.max(0, ...hero.map((el) => parseFloat(getComputedStyle(el).fontSize)));
    const headingText = [...document.querySelectorAll("h1,h2,h3,button,a")].map((e) => e.innerText).join(" ");
    const emoji = (headingText.match(/\p{Extended_Pictographic}/gu) || []).length;
    const imgs = [...document.images];
    const brokenImgs = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
    // CTA "fuerte" = relleno opaco con contraste alto contra el fondo de la página.
    const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, al = 1] = m.map(Number);
      if (al < 0.6) return null; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
    const pageLum = lum(getComputedStyle(document.body).backgroundColor) ?? lum(getComputedStyle(document.documentElement).backgroundColor) ?? 1;
    const ctas = hero.filter((el) => {
      if (!el.matches("a,button")) return false;
      const l = lum(getComputedStyle(el).backgroundColor);
      return l !== null && Math.abs(l - pageLum) > 0.45;
    }).length;
    // Overflow real: ¿el usuario puede desplazarse en X? (un overflow recortado no cuenta)
    const y = scrollY;
    window.scrollTo(100000, y);
    const overflowX = scrollX > 0;
    window.scrollTo(0, y);

    const warnings = [];
    if (families.size > 3) warnings.push(`${families.size} familias tipográficas visibles (máx. 2 + mono): ${[...families].join(", ")}`);
    if (sizes.size > 11) warnings.push(`${sizes.size} tamaños de fuente distintos — la escala no está gobernada por tokens`);
    if (radii.size > 4) warnings.push(`${radii.size} radios distintos: ${[...radii].join(", ")}`);
    if (aiGradients) warnings.push(`${aiGradients} gradiente(s) violeta→azul (el tell #1 de UI generada)`);
    if (shadows > 40) warnings.push(`${shadows} elementos con box-shadow — elevación por defecto, no por intención`);
    if (mode !== "app" && vpName === "desktop" && heroMax < 56) warnings.push(`El texto más grande del fold mide ${heroMax}px: hero tímido (premium suele ir ≥ 64px en desktop)`);
    if (timidDisplay) warnings.push(`${timidDisplay} titular(es) ≥48px sin tracking negativo`);
    if (longLines) warnings.push(`${longLines} párrafo(s) con líneas > 85 caracteres`);
    if (centeredParagraphs) warnings.push(`${centeredParagraphs} párrafo(s) largos centrados`);
    if (emoji) warnings.push(`${emoji} emoji en titulares/botones/links (emoji como icono = tell de IA)`);
    if (brokenImgs.length) warnings.push(`Imágenes rotas: ${brokenImgs.slice(0, 5).join(", ")}`);
    if (overflowX) warnings.push("Overflow horizontal");
    const thinList = Object.entries(thin).filter(([, n]) => n > 60).map(([k]) => k);
    if (thinList.length) warnings.push(`Peso light (<400) en texto de lectura (<40px): ${thinList.slice(0, 5).join(" · ")}. Usa 400 o más; el light solo en display grande`);
    if (unloaded.size) warnings.push(`Pesos/estilos sin cargar (el navegador los sintetiza): ${[...unloaded].slice(0, 5).join(" · ")}`);
    if (invisible.length) warnings.push(`Texto invisible (color transparente sin clip propio): ${invisible.slice(0, 5).join(" | ")}`);
    if (/lorem ipsum/i.test(document.body.innerText)) warnings.push("Lorem ipsum en la página");
    if (ctas > 2) warnings.push(`${ctas} botones con fondo en el fold — compiten por la acción primaria`);

    return {
      fontFamilies: [...families],
      fontSizes: [...sizes].sort((x, y) => x - y),
      radii: [...radii],
      textColors: colors.size,
      shadows,
      gradients,
      heroMaxFontPx: heroMax,
      overflowX,
      warnings,
    };
  }, [name, a.mode ?? "landing"]);
  audit.errors = [...new Set(errors)].slice(0, 20);
  if (audit.errors.length) audit.warnings.push(`${audit.errors.length} error(es) de consola/red`);
  if (hasScene) {
    audit.actsSeen = actsSeen;
    if (new Set(actsSeen.filter(Boolean)).size < 3)
      audit.warnings.push(`El scroll solo recorrió ${new Set(actsSeen).size} acto(s) [${actsSeen.join(",")}]: la escena no avanza con el scroll`);
  }
  report.viewports[name] = audit;
  await page.close();
}
await browser.close();

fs.writeFileSync(path.join(out, "audit.json"), JSON.stringify(report, null, 2));
for (const [vp, r] of Object.entries(report.viewports)) {
  console.log(`\n[${vp}] familias: ${r.fontFamilies.join(", ")} · tamaños: ${r.fontSizes.join("/")} · radios: ${r.radii.join(" ")}`);
  console.log(r.warnings.length ? r.warnings.map((w) => "  ⚠ " + w).join("\n") : "  sin alertas objetivas");
}
console.log(`\nCapturas y audit.json en ${out}. Ahora MIRA las imágenes con la rúbrica de premium-bar.md.`);
