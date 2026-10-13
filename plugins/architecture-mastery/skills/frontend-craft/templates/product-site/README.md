# product-site — sitio de producto B2B calibrado (modo por defecto)

Sitio de producto calibrado contra referencias medidas con `dissect.mjs` (Plada, Founderdex, Apple, Vaas; ver `../../reference-bar.md`):
- **Tipografía:** una familia (Geist), H1 de 64 px, cuerpo de 17 px en 400.
- **Estructura:** contenedor de 1200 px, nav de 64 px con blur, botones píldora de 40 px.
- **Contenido:** el producto como ilustración (ventanas de app con datos verosímiles, `role="img"`), fotografía CC0 y casi cero motion.

Secciones: anuncio, nav, hero, métricas, cómo funciona, producto en grande, foto, caso, seguridad, FAQ, CTA y footer. Quita las que no tengan contenido real.

```bash
npx http-server -p 4321 -s .
node ../../scripts/compare.mjs http://localhost:4321 --refs design/references/plada,design/references/founderdex
npx playwright test site.spec.ts      # usa baseURL de tu playwright.config
```

`site.spec.ts` valida: hero con CTA y producto en el fold, una familia y un titular dentro del rango medido, pesos sin light ni sintetizados, estructura de sitio real, sin overflow ni errores, accesibilidad básica y reveals sin huecos (también con reduced-motion).

`img/ciudad.jpg`: "City Aerial" de Dennis Kummer (StockSnap, CC0). Reemplázala por fotografía de la marca.
