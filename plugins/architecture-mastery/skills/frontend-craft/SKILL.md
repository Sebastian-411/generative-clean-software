---
name: frontend-craft
description: "Diseño e implementación de páginas y apps al nivel de los mejores sitios reales (Apple, Plada, Founderdex, Vaas, YC, Nike), no generadas por IA. Calibra contra referencias medidas con Playwright (dissect.mjs), consigue contenido real (producto, fotos CC0, cifras), construye sobre plantillas probadas (sitio de producto, app, y escena 3D solo para lanzamientos con assets oficiales) y valida comparando lado a lado con las referencias (compare.mjs) y con Playwright. Úsala al diseñar o implementar cualquier landing, sitio de marketing, sitio de producto o pantalla de app; al pedir que se vea premium/profesional/de alto nivel, rediseñar una UI que se ve genérica, o elegir estilo, tipografía, paleta, componentes o animaciones. No la uses para cambios de API/dominio sin UI."
metadata:
  opencode/slash: "true"
---

# Frontend craft — páginas al nivel de los mejores sitios reales

La UI generada por IA se delata de dos maneras opuestas:

1. **El promedio**: fuente segura, gradiente violeta, hero centrado y tres cards con icono.
2. **El espectáculo**: titulares de 250 px, grano, letterbox, HUDs, 3D de muestra y todo animado. Es la sobrecompensación del punto 1 y se nota igual.

Los sitios de alto nivel no hacen ninguna de las dos. **Medidos** (ver [reference-bar.md](reference-bar.md)): una familia tipográfica, titulares de 40–84 px, contenedor de 1000–1300 px, navegación convencional, casi cero motion y **el espacio lleno de contenido real**: el producto, fotografía, clientes, cifras y sellos.

No se adivina la vara: **se mide y se compara**.

```
1. Brief        → qué se vende, a quién, qué acción, qué contenido real existe
2. Calibrar     → 2–3 referencias del mismo modo, diseccionadas con dissect.mjs → tokens dentro de sus rangos
3. Contenido    → producto (capturas/tarjetas con datos verosímiles), fotos CC0, cifras, casos, sellos
4. Construir    → sobre la plantilla del modo; por secciones, hero primero
5. Comparar     → compare.mjs lado a lado con las referencias + shoot.mjs + Playwright, hasta no delatarse
```

Archivos de apoyo:

- [reference-bar.md](reference-bar.md) — **la vara medida**: 10 sitios de referencia con valores reales, lo que tienen en común, los modos y el proceso de calibración.
- [premium-bar.md](premium-bar.md) — rúbrica, lista negra de tells (los del promedio y los del espectáculo), reglas de oficio.
- [sources.md](sources.md) — Refero, Watermelon, Motion-Primitives, Haikei, Openverse.
- [cinematic.md](cinematic.md) — solo para el modo lanzamiento cinematográfico.
- [playwright-checks.md](playwright-checks.md) — loop de crítica visual y tests de regresión.
- `templates/product-site/` — **sitio de producto/B2B calibrado** (el default). `templates/anchor-scene/` — **brutal de producto**: el producto 3D viaja por la página y se posa en anclas del DOM (patrón Fizzi), con lata procedural y etiqueta de marca propia. `templates/app-shell/` — pantalla de app. `templates/scroll-scene/` — escena 3D por actos (lanzamientos).
- [briefs.md](briefs.md) — **cinco briefs de cliente resueltos** (OMEGA, The Last Company, Genesis Engine, NOCTURNAL, Atlas Zero), cada uno con su propio modo. Léelo antes de un brief parecido. Sus piezas reutilizables están en `templates/patterns/` (planeta con escenarios, grafo idea → empresa, linterna, registros escritos, audio ambiente, paleta por sección).
- `templates/tools/turntable.html` — mira un modelo GLB normalizado desde 4 lados para encuadrar los planos de cámara.
- `scripts/`:
  - `dissect.mjs`: mide una referencia (tipografía por rol, escala, paleta, contenedores, secciones, motion y capturas).
  - `compare.mjs`: tu página frente a las referencias, en láminas lado a lado y métricas.
  - `shoot.mjs`: captura y auditoría (`--mode app`).
  - `photos.mjs`: fotos con licencia abierta y hoja de contactos.
  - `scrollscope.mjs`: storyboard del scroll (16–24 fotogramas) para entender y comparar coreografías 3D.
  - `refero.mjs`, `haikei.mjs` y `still.mjs`.

## 1. Brief

En `design/BRIEF.md` (5–10 líneas): qué es y qué vende sin adjetivos, para quién, **una** acción, referencias del usuario (URLs), y **qué contenido real existe**: capturas del producto, fotos, logos de clientes con permiso, cifras, casos, sellos. Si no existe, se produce en el paso 3; nunca se tapa con efectos.

## 2. Calibrar — medir la vara, no imaginarla

Elige el modo (tabla en reference-bar.md: **producto/B2B** por defecto, **marca/consumo** o **lanzamiento cinematográfico** solo con assets oficiales). Toma 2–3 referencias de ese modo (las del usuario primero) y disecciónalas:

```bash
node <skill>/scripts/dissect.mjs https://plada.ai --out design/references/plada
```

Con sus `dissection.md` y capturas, escribe `design/DESIGN.md` **citando de qué referencia sale cada valor**: familia y escala, tracking, contenedor, nav, botón, radios, paleta (2–3 superficies, tinta, un acento) y motion. Si un valor tuyo cae fuera del rango de las referencias, justifícalo o córrelo.

`design-scout` (modo `scout`) hace este paso; además puede proponer direcciones con Refero (DESIGN.md de 2.000+ sitios).

## 3. Contenido real

Es lo que más separa un sitio caro de uno generado:

- **El producto como ilustración**: capturas reales o, si aún no hay, interfaces construidas en HTML con datos verosímiles y específicos (montos, nombres, fechas, estados), marcadas con `role="img"` + `aria-label`. Tarjetas pequeñas y nítidas sobre un escenario neutro (Plada) o una ventana de app completa (Vaas, Founderdex).
- **Fotografía**: la de la marca. Si no hay: `photos.mjs` (Openverse, CC0 preferido) y **elige mirando la hoja de contactos**. Nunca la foto de una persona real identificable junto a un nombre o cita inventada.
- **Prueba**: cifras con contexto, un caso con métricas, testimonios con nombre, rol y empresa (reales, o marcados como ejemplo en una demo), sellos de cumplimiento reales.
- **Copy**: titular de ≤ 8 palabras con una idea concreta; subtítulo que dice qué hace y para quién; FAQ con las preguntas de la primera llamada de ventas.

## 4. Construir — sobre la plantilla del modo

- **Producto/B2B y marca**: `templates/product-site/`, que está calibrada y validada contra Plada, Founderdex y Apple. Secciones: anuncio, nav, hero (copy + producto), métricas, cómo funciona, producto en grande, foto, caso, seguridad, FAQ, CTA y footer completo. Quita las que no tengan contenido real; no inventes otras para rellenar.
- **Brutal de producto**: `templates/anchor-scene/`. Un producto físico con personalidad (bebida, snack, moda, gadget). El 3D es el personaje y viaja por secciones 2D planas de color; tipografía gráfica enorme alrededor. Etiqueta o arte de la marca pintado en canvas o como textura propia, nunca un modelo de otra marca. Compara la coreografía con `scrollscope.mjs` contra la referencia.
- **App**: `templates/app-shell/`: una acción primaria por pantalla, estados diseñados, ⌘K.
- **Lanzamiento cinematográfico**: `templates/scroll-scene/` + [cinematic.md](cinematic.md), solo con key art, video o modelo 3D **de la marca**.
- Grids siempre con `minmax(0, …)`: una tabla con `nowrap` dentro de `1fr` rompe el layout.
- Componentes de Watermelon/Motion-Primitives solo si encajan con la referencia y re-tematizados. Motion por defecto: aparición sobria de 8 px, hovers y nada más.

## 5. Comparar — hasta que la lámina no delate cuál es la tuya

```bash
node <skill>/scripts/compare.mjs http://localhost:4321 --refs design/references/plada,design/references/founderdex --out design/compare/round-N
node <skill>/scripts/shoot.mjs http://localhost:4321 --out design/shots/round-N        # --mode app en apps
```

1. Mira `fold.png`, `sections.png` y `mobile.png`: tu página junto a las referencias, a la misma escala.
2. Lee `metrics.md` (familias, titular, cuerpo, contenedor, palabras, % de imagen, motion) y `audit.json` (overflow, escala, radios, texto invisible, contraste de CTAs).
3. Escribe defectos numerados por impacto y corrige. `design-scout` (modo `critique`) da la segunda opinión.

**Se entrega cuando**: la lámina lado a lado no delata cuál es la tuya, las métricas caen dentro del rango de las referencias, `audit.json` está limpio en 1440 y 390 y los tests de Playwright de la plantilla pasan.

## Sistema de componentes (obligatorio)

```
packages/ui/
  tokens/          # salen de design/DESIGN.md (calibrado)
  primitives/      # Button, Text, Input, Surface, Stack, Icon
  composites/      # Nav, Hero, Metrics, Steps, ProductFrame, Quote, FAQ, CTA, Footer, EmptyState…
  scroll-scene/    # solo si hay modo lanzamiento
```

Tokens primero (un hex suelto es un bug), variantes por API, lo instalado de terceros re-tematizado y dentro del kit. Astro (sitio) y Next (app) consumen el mismo kit.

## Rendimiento y accesibilidad

LCP < 2,5 s, CLS < 0,1. Fuentes: una familia, `display=swap`. Imágenes con `width`/`height` y `loading="lazy"` bajo el fold. Contraste AA, foco visible, hit targets ≥ 44 px, `prefers-reduced-motion`. Las ilustraciones de producto llevan `role="img"` + `aria-label`.

## Al entregar UI

1. Modo y referencias usadas, con su `dissection.md`.
2. Tabla de `metrics.md` final: tu página frente a las referencias.
3. Rutas de las láminas `fold.png`, `sections.png` y `mobile.png` de la última ronda.
4. Contenido real usado y sus licencias (fotos, modelos).
5. Qué falta: contenido que debe proveer la marca (capturas reales, logos con permiso, fotos propias).
