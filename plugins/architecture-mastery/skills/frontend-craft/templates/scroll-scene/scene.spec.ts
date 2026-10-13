// Validación de diseño de la landing-escena. Corre con playwright.config.ts (desktop 1440 + mobile 390).
// Funciona en subrutas: navega a "./" relativo al baseURL de cada proyecto.
import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("canvas[data-scene][data-scene-ready]").waitFor({ state: "attached", timeout: 120_000 });
  await page.locator(".loader.done").waitFor({ state: "attached" });
}

async function scrollTo(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo(0, Math.round(max * f));
  }, fraction);
  await page.waitForTimeout(2500); // scrub + amortiguación de cámara
}

// Muestra un parche del centro del canvas (compara planos de cámara sin snapshot pixel-perfect).
async function sampleCenter(page: Page) {
  const box = (await page.locator("canvas[data-scene]").boundingBox())!;
  const shot = await page.screenshot({ clip: { x: box.width / 2 - 40, y: box.height / 2 - 40, width: 80, height: 80 } });
  return shot.toString("base64");
}

test("una sola escena, lista y sin errores", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await expect(page.locator("canvas[data-scene]")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("el hero vende: título, CTA primario y producto en el fold", async ({ page }) => {
  await ready(page);
  await page.waitForTimeout(2500); // intro
  await expect(page.locator("h1")).toBeInViewport();
  await expect(page.locator("[data-cta-primary]")).toBeInViewport();
  const href = await page.locator("[data-cta-primary]").getAttribute("href");
  expect(href && href !== "#").toBeTruthy();
});

test("el scroll avanza los actos y mueve la cámara", async ({ page }) => {
  await ready(page);
  const acts = page.locator("[data-acts]");
  const last = String(await page.locator("[data-acts] .act").count());
  const seen: string[] = [];
  const frames: string[] = [];
  for (const f of [0.0, 0.3, 0.55, 0.75, 0.97]) {
    await scrollTo(page, f);
    // El smooth scroll puede tardar en asentarse (más con WebGL por software): se espera al acto, no a un reloj.
    if (f === 0) await expect(acts).toHaveAttribute("data-act", "1");
    if (f === 0.97) await expect(acts).toHaveAttribute("data-act", last, { timeout: 30_000 });
    seen.push((await acts.getAttribute("data-act"))!);
    frames.push(await sampleCenter(page));
  }
  expect(new Set(seen).size).toBeGreaterThanOrEqual(4);
  expect(new Set(frames).size).toBe(frames.length); // cada acto es un plano distinto
});

test("sin overflow horizontal", async ({ page }) => {
  await ready(page);
  const canScrollX = await page.evaluate(() => { window.scrollTo(99999, 0); return scrollX > 0; });
  expect(canScrollX).toBe(false);
});

test("el configurador responde", async ({ page }) => {
  await ready(page);
  await scrollTo(page, 0.97);
  const option = page.locator(".swatches button").nth(2);
  await option.click();
  await expect(option).toHaveAttribute("aria-pressed", "true");
  const name = await option.getAttribute("aria-label");
  const label = page.locator(".swatch-name");
  if (await label.count()) await expect(label).toHaveText(name!);
});

test("reduced-motion: la historia entera sigue ahí", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.locator("[data-cta-primary]")).toBeVisible();
  await scrollTo(page, 0.97);
  await expect(page.locator("[data-cta-final]")).toBeVisible();
});

test("sin WebGL queda el poster y el contenido", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL });
  await ctx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error simulamos un navegador sin WebGL
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : orig.call(this, type, ...rest);
    };
  });
  const page = await ctx.newPage();
  await page.goto("./");
  await expect(page.locator(".poster")).toBeVisible();
  await expect(page.locator("[data-cta-primary]")).toBeVisible({ timeout: 30_000 });
  await ctx.close();
});
