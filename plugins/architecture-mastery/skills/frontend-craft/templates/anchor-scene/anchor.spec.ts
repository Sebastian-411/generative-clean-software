// Validación del patrón "producto 3D que viaja por la página" (anchor-scene).
import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("./");
  await page.locator("canvas[data-scene][data-scene-ready]").waitFor({ state: "attached", timeout: 120_000 });
}
const centerOf = (page: Page, sel: string) => page.evaluate((s) => {
  const e = document.querySelector(s)!; scrollTo(0, (e as HTMLElement).offsetTop + e.clientHeight / 2 - innerHeight / 2);
}, sel);

test("escena lista, sin errores, canvas encima del contenido sin bloquear clics", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  const pe = await page.locator("canvas[data-scene]").evaluate((c) => getComputedStyle(c).pointerEvents);
  expect(pe).toBe("none");
  await expect(page.locator("[data-cta-primary]")).toBeInViewport();
  await page.locator("[data-cta-primary]").click({ trial: true }); // clicable aunque el canvas esté encima
  expect(errors).toEqual([]);
});

test("el producto se posa en cada una de sus anclas al hacer scroll", async ({ page }) => {
  await ready(page);
  const id = (await page.locator("[data-anchor]").first().getAttribute("data-anchor"))!.split(" ")[0];
  const attr = "data-at-" + id;
  const anchors = page.locator(`[data-anchor~="${id}"]:not([data-out])`);
  const n = await anchors.count();
  expect(n).toBeGreaterThanOrEqual(4);
  const all = page.locator(`[data-anchor~="${id}"]`);
  for (let i = 0; i < n; i++) {
    const el = anchors.nth(i);
    const index = await el.evaluate((e, sel) => [...document.querySelectorAll(sel)].indexOf(e), `[data-anchor~="${id}"]`);
    await el.evaluate((e) => {
      const hold = e.closest("[data-hold]") as HTMLElement | null;
      const top = (n: Element) => n.getBoundingClientRect().top + scrollY;
      scrollTo(0, hold ? top(hold) + 10 : top(e) + e.clientHeight / 2 - innerHeight / 2);
    });
    await expect(page.locator("html")).toHaveAttribute(attr, String(index), { timeout: 20_000 });
  }
  expect(await all.count()).toBeGreaterThanOrEqual(n);
});

test("sin overflow horizontal", async ({ page }) => {
  await ready(page);
  const x = await page.evaluate(() => { scrollTo(99999, 0); return scrollX; });
  expect(x).toBe(0);
});

test("sin WebGL quedan las imágenes de respaldo", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL });
  await ctx.addInitScript(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error simulamos un navegador sin WebGL
    HTMLCanvasElement.prototype.getContext = function (t: string, ...r: unknown[]) { return /webgl/.test(t) ? null : o.call(this, t, ...r); };
  });
  const page = await ctx.newPage();
  await page.goto("./");
  await expect(page.locator("[data-hero] .anchor img").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[data-cta-primary]")).toBeVisible();
  await ctx.close();
});
