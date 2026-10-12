# Playwright — validación de diseño

Vive junto al frontend que tocas (`apps/site` y/o `apps/web`). No es opcional en cambios de UI.

## Setup

- `@playwright/test`
- Proyectos: `chromium` desktop `1440x900` y mobile `390x844`
- `toHaveScreenshot` con `maxDiffPixels` bajo. Si el 3D tiembla, snapshot del **poster/fallback** + assert de que el canvas existe (`data-scene-ready`)
- Artefactos en `test-results/`; no commitees diffs accidentales

## Landings (`apps/site`)

Por cada landing nueva o hero tocado:

```ts
test("landing hero — desktop", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-hero]").waitFor();
  await expect(page.locator("[data-hero]")).toHaveScreenshot("hero-desktop.png");
  await expect(page.locator("[data-cta-primary]")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("landing hero — mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-hero]")).toHaveScreenshot("hero-mobile.png");
  await expect(page.locator("[data-cta-primary]")).toBeInViewport();
});

test("reduced-motion no rompe el hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-hero]")).toBeVisible();
  await expect(page.locator("[data-cta-primary]")).toBeVisible();
  await expect(page.locator("[data-hero]")).toHaveScreenshot("hero-reduced-motion.png");
});
```

Si hay escena 3D:

- El canvas lleva `data-scene` y pasa a `data-scene-ready` cuando la primera frame es estable.
- Un test confirma que, sin WebGL (o con reduced-motion), `[data-hero-fallback]` se ve y el CTA sigue.

Happy path: click del CTA llega a destino (signup, demo, `#act-2`), no a un `href="#"`.

Scroll-escena (obligatorio en landing):

```ts
test("el scroll cambia de acto", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-scene-ready]").waitFor();
  const before = await page.locator("[data-act]").getAttribute("data-act");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await page.waitForTimeout(400);
  const after = await page.locator("[data-act]").getAttribute("data-act");
  expect(after).not.toEqual(before);
  await expect(page.locator("[data-act]")).toHaveScreenshot("act-mid-desktop.png");
});
```

- Un solo `canvas[data-scene]`.
- `data-act` avanza al scrollear (1 → 2 o 3).
- Snapshot a mitad de scroll, no solo el fold.

## Aplicativo (`apps/web`)

Por cada pantalla tocada:

- Screenshot del estado empty y del estado con datos (o fixture).
- El CTA primario es uno y está visible.
- El flujo corto (ej. crear X) se completa en el test; no solo "la página carga".
- No existe `canvas`, `three`, ni video de fondo en rutas de app (`page.locator("canvas").count()` === 0 salvo un canvas de chart 2D justificado).

## Qué no testear aquí

- Invariantes de dominio (eso es test de Nest / core).
- Pixel-perfect del WebGL frame a frame.
- Cada hover de cada botón.

## Fallos

Si el snapshot falla porque "se ve distinto y mejor", actualiza el baseline **después** de mirar el diff. Si falla porque el layout saltó o el CTA se fue, es bug de `implementer`, no de la aserción.
