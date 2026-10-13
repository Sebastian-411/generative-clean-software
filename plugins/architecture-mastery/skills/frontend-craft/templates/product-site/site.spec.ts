// Validación del sitio de producto: lo funcional + la vara medida en reference-bar.md.
// Navega a "./" relativo al baseURL del proyecto (funciona en subrutas).
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
});

test("hero: titular, CTA primario y producto visibles en el fold", async ({ page }) => {
  await expect(page.locator("h1")).toBeInViewport();
  await expect(page.locator("[data-cta-primary]")).toBeInViewport();
  const href = await page.locator("[data-cta-primary]").getAttribute("href");
  expect(href && href !== "#").toBeTruthy();
  // El hero muestra el producto (ilustración marcada como imagen), no decoración.
  await expect(page.locator("[data-hero] [role=img]").first()).toBeVisible();
});

test("calibración: una familia y titular dentro del rango de las referencias", async ({ page }, info) => {
  const m = await page.evaluate(() => {
    const fams = new Set<string>();
    for (const el of document.querySelectorAll("body *")) {
      if ((el as HTMLElement).closest("[role=img]")) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim().length > 1);
      if (own) fams.add(getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim());
    }
    const h1 = getComputedStyle(document.querySelector("h1")!);
    return { fams: [...fams], h1: parseFloat(h1.fontSize), tracking: parseFloat(h1.letterSpacing) / parseFloat(h1.fontSize) || 0, words: document.body.innerText.split(/\s+/).length, height: document.documentElement.scrollHeight };
  });
  expect(m.fams.length, `familias: ${m.fams.join(", ")}`).toBeLessThanOrEqual(2);
  const mobile = info.project.name.includes("mobile");
  expect(m.h1).toBeGreaterThanOrEqual(mobile ? 32 : 40);
  expect(m.h1).toBeLessThanOrEqual(mobile ? 52 : 90);
  expect(m.tracking).toBeGreaterThanOrEqual(-0.045);
  expect(m.words, "contenido real suficiente").toBeGreaterThan(600);
});

test("tipografía: sin pesos light en texto de lectura y sin pesos sintetizados", async ({ page }) => {
  const r = await page.evaluate(() => {
    const thin: string[] = [], missing = new Set<string>();
    for (const el of document.querySelectorAll("body *")) {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join("");
      if (own.length < 3) continue;
      const s = getComputedStyle(el), fam = s.fontFamily.split(",")[0].replace(/["']/g, "").trim(), w = +s.fontWeight, fs = parseFloat(s.fontSize);
      if (w < 400 && fs < 40) thin.push(`${fam} ${w} ${Math.round(fs)}px: "${own.slice(0, 30)}"`);
      if (!document.fonts.check(`${s.fontStyle} ${w} ${fs}px "${fam}"`)) missing.add(`${fam} ${w} ${s.fontStyle}`);
    }
    return { thin: thin.slice(0, 5), missing: [...missing] };
  });
  expect(r.thin, "texto de lectura en peso light").toEqual([]);
  expect(r.missing, "pesos sin cargar").toEqual([]);
});

test("estructura de sitio real: nav, secciones con contenido y footer completo", async ({ page }) => {
  await expect(page.locator("header nav, header ul").first()).toBeAttached();
  expect(await page.locator("main section, main > div").count()).toBeGreaterThanOrEqual(6);
  expect(await page.locator("footer a").count()).toBeGreaterThanOrEqual(10);
});

test("sin overflow horizontal ni errores de consola", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.reload();
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  const canScrollX = await page.evaluate(() => { scrollTo(99999, scrollY); return scrollX > 0; });
  expect(canScrollX).toBe(false);
  expect(errors).toEqual([]);
});

test("accesibilidad básica: imágenes con alt, ilustraciones con etiqueta, FAQ operable", async ({ page }) => {
  for (const img of await page.locator("img").all()) expect(await img.getAttribute("alt")).not.toBeNull();
  for (const il of await page.locator("[role=img]").all()) expect((await il.getAttribute("aria-label"))?.length).toBeGreaterThan(5);
  const faq = page.locator("details").nth(1);
  if (await faq.count()) {
    await faq.locator("summary").click();
    await expect(faq).toHaveAttribute("open", "");
  }
});

test("todo el contenido aparece al recorrer la página (los reveals no dejan huecos)", async ({ page }) => {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await page.waitForTimeout(800);
  const hidden = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).opacity === "0" && (el as HTMLElement).innerText?.trim()).length);
  expect(hidden).toBe(0);
  await expect(page.locator("[data-cta-final]")).toBeVisible();
});

test("reduced-motion: todo visible desde el inicio", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const hidden = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).opacity === "0" && (el as HTMLElement).innerText?.trim()).length);
  expect(hidden).toBe(0);
});
