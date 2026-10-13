# Playwright — loop de crítica visual y regresión de diseño

Dos usos distintos:

1. **Loop de crítica** (durante el diseño): `scripts/shoot.mjs` captura y audita para que el agente **vea** lo que construyó. Es donde se gana la calidad.
2. **Tests de regresión** (en el repo): `@playwright/test` congela lo aprobado para que no se rompa después.

## 1. Loop de crítica

```bash
node <skill>/scripts/shoot.mjs http://localhost:4321 --out design/shots/round-1
node <skill>/scripts/shoot.mjs http://localhost:4321 --out design/shots/round-1-rm --reduced-motion
```

Genera `desktop-*.png` y `mobile-*.png` (fold, full, 4 cortes de scroll) y `audit.json` con alertas objetivas: familias y tamaños tipográficos, radios, gradientes violeta→azul, sombras en exceso, hero tímido, titulares sin tracking, líneas largas, párrafos centrados, emoji, imágenes rotas, overflow, errores de consola, CTAs compitiendo.

Por ronda:

1. Abre y **mira** las capturas (fold desktop, fold mobile, cortes). Compáralas con `design/references/*/style-page.png`.
2. Puntúa la rúbrica de `premium-bar.md`. Escribe en `design/shots/round-N/notes.md`: puntaje por fila + defectos numerados por impacto.
3. Arregla, de mayor a menor impacto. Siguiente ronda.

Defectos que este loop encuentra casi siempre en la ronda 1 (búscalos a propósito):

- **Texto con gradiente que desaparece** al envolver palabras en spans animados: el gradiente va en cada `.word`, no en el padre. (`audit.json` lo marca como "Texto invisible".)
- **Overflow por halos/fondos decorativos** con `inset` negativo: usa `overflow-x: clip` en `html` y `body`, no solo `hidden` en `body`.
- **Botones partidos en mobile**: `white-space: nowrap` en botones y CTAs apilados a ancho completo bajo 900px.
- **Escala tipográfica sin gobierno** (15+ tamaños): todo tamaño sale de un token `--t-*`.
- **Radios de compromiso** (12/16/18 mezclados): un token por tipo de elemento.
- **Marcos dobles** en cards con `padding` sobre un fondo-hairline.

`design/shots/` va en `.gitignore`; solo se versionan `notes.md` si el equipo quiere historial.

Una alerta de `audit.json` se puede aceptar solo si `design/DESIGN.md` la justifica (ej. "3 familias: display serif + body + mono para datos").

## 2. Tests de regresión (`apps/site`, `apps/web`)

- `@playwright/test`, proyectos `desktop` 1440x900 y `mobile` 390x844.
- `toHaveScreenshot` con `maxDiffPixels` bajo, `animations: "disabled"`, esperando `document.fonts.ready`.
- Si hay escena 3D/canvas: snapshot del poster/fallback y assert de `data-scene-ready`; no compares frames WebGL.

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("hero aprobado", async ({ page }) => {
  const hero = page.locator("[data-hero]");
  await expect(hero).toHaveScreenshot("hero.png", { animations: "disabled" });
  await expect(page.locator("[data-cta-primary]")).toBeInViewport();
});

test("página completa sin overflow ni errores", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.reload();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await expect(page).toHaveScreenshot("full.png", { fullPage: true, animations: "disabled" });
});

test("reduced-motion sigue dirigido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator("[data-hero]")).toBeVisible();
  await expect(page.locator("[data-cta-primary]")).toBeVisible();
  await expect(page.locator("[data-hero]")).toHaveScreenshot("hero-reduced.png");
});

test("el CTA primario lleva a algún lado", async ({ page }) => {
  const href = await page.locator("[data-cta-primary]").getAttribute("href");
  expect(href && href !== "#").toBeTruthy();
});
```

Si el momento firma depende del scroll (pin, escena), añade un test que scrollee al 45 % y compruebe que el estado cambió (`data-act`, clase, transform) + snapshot a mitad de scroll.

### Aplicativo (`apps/web`)

Por pantalla tocada:

- Screenshot de empty y de con-datos (fixture).
- Un solo CTA primario visible.
- El flujo corto se completa en el test, no solo "la página carga".
- Sin `canvas` 3D ni video de fondo en rutas de app.

## Qué no testear aquí

- Invariantes de dominio (tests de Nest / core).
- Pixel-perfect del WebGL frame a frame.
- Cada hover de cada botón.

## Fallos

Si el snapshot falla porque "se ve distinto y mejor", actualiza el baseline **después** de mirar el diff. Si falla porque el layout saltó o el CTA se fue, es bug de `implementer`, no de la aserción.
