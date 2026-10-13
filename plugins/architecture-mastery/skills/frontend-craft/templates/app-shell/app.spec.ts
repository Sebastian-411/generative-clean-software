// Validación de la pantalla de app: simple de usar, hermosa, sin espectáculo.
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("una sola acción primaria visible y sin 3D", async ({ page }) => {
  await expect(page.locator("[data-cta-primary]")).toBeInViewport();
  const primaries = await page.locator(".btn-primary:visible").count();
  expect(primaries).toBe(1);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("happy path en ≤ 3 interacciones: agendar una prueba", async ({ page }) => {
  await page.locator("[data-cta-primary]").click();                    // 1
  await page.locator(".slots button").first().click();                 // 2
  await page.locator("#phone").fill("600123456");
  await page.locator("#submit").click();                               // 3
  await expect(page.getByRole("status").filter({ hasText: "Te esperamos" })).toBeVisible();
});

test("errores junto al campo, no en un toast", async ({ page }) => {
  await page.locator("[data-cta-primary]").click();
  await page.locator("#submit").click();
  await expect(page.locator("#slot-msg")).toBeVisible();
  await expect(page.locator("#f-phone .msg")).toBeVisible();
  await expect(page.locator("#sheet")).not.toHaveClass(/done/);
});

test("los cuatro estados de la lista están diseñados", async ({ page }) => {
  const docs = page.locator("#docs");
  await expect(docs).toHaveAttribute("data-state", "con datos");
  for (const state of ["vacío", "error", "cargando", "con datos"]) {
    await page.locator("#cycle").click();
    await expect(docs).toHaveAttribute("data-state", state);
    await expect(docs.locator(":scope > *")).not.toHaveCount(0); // cada estado tiene contenido propio
  }
});

test("⌘K abre la paleta y ejecuta con teclado", async ({ page }) => {
  await page.keyboard.press("Control+K");
  await expect(page.locator("#cmdk")).toHaveClass(/open/);
  await page.keyboard.type("agendar");
  await page.keyboard.press("Enter");
  await expect(page.locator("body")).toHaveClass(/sheet-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/sheet-open/);
});

test("sin overflow horizontal y snapshot de la pantalla", async ({ page }) => {
  const canScrollX = await page.evaluate(() => { window.scrollTo(99999, 0); return scrollX > 0; });
  expect(canScrollX).toBe(false);
  await expect(page).toHaveScreenshot("app.png", { fullPage: true, animations: "disabled", maxDiffPixelRatio: 0.01 });
});
