---
name: frontend-craft
description: Criterio de UI/UX de alto nivel para landings y aplicativos. Úsala al diseñar o implementar páginas, landings interactivas con 3D y animaciones al scroll (Awwwards / Apple product page / trailer), o apps Next.js que deben sentirse simples y hermosas. Exige escena WebGL enganchada al scroll, reutilización de componentes, rendimiento, y Playwright de diseño. No la uses para cambios de API/dominio sin UI.
metadata:
  opencode/slash: "true"
---

# Frontend craft — landings cinematográficas, apps simples y hermosas

La vara no es "bonito". Es **producción AAA en marketing** y **producto Apple en la app**. Si una pantalla se ve de template, bootstrap o dashboard genérico, está mal. Si una pantalla de app parece trailer de videojuego, también está mal.

Decide primero el modo de la superficie:

| Superficie | Dónde | Sensación | Complejidad visual |
|---|---|---|---|
| **Landing / marketing** | `apps/site` (Astro) y home pública | Trailer interactivo: 3D + scroll + cursor | Alta. La página es una escena, no un documento |
| **Aplicativo** | `apps/web` (Next.js) autenticado | Herramienta: clara, rápida, hermosa | Baja. Cero espectáculo. Cero 3D |

No mezcles los modos. El login puede tomar un *eco* de la landing (tipo, color, un material), no el canvas WebGL.

## Craft compartido (los dos modos)

- **Tipografía**: una display + una body. Tracking y jerarquía como Apple, no como plantilla de SaaS. Títulos que ocupan el aire; no 12 pesos de fuente.
- **Materiales**: pocos. Negro/graphite, un accent, vidrio o metal, luz direccional. Nada de paletas de 12 colores ni gradients decorativos en cada card.
- **Espacio**: el vacío es diseño. Si todo está lleno, no es premium.
- **Motion**: corto, físico, ease real. Un gesto por transición. Respeta `prefers-reduced-motion` — la versión quieta tiene que seguir viéndose diseñada, no "CSS apagado".
- **Reutilización**: cero one-offs. Todo sale de `packages/ui` (tokens + primitivos + compuestos). Si un botón existe, la página no inventa otro.
- **Rendimiento**: LCP < 2.5s en 4G lento, CLS < 0.1, JS del hero diferido. Imágenes `width`/`height` + modern formats. El 3D no se monta hasta `requestIdleCallback` / viewport, y tiene fallback estático (imagen/poster) si WebGL falla o `prefers-reduced-motion`.

## Landing — página-escena (3D + scroll + interacción)

Esto es lo que pediste: sitios **brutales e interactivos** — modelo 3D, efectos mientras scrolleas, animaciones coreografiadas. La referencia es Apple product page, Awwwards, trailers web (dirección GTA 6 / keynote), no un hero estático con un canvas de adorno.

Si la landing se puede leer igual recortando el JS, **está mal**. El scroll tiene que *hacer* algo.

### La página es un timeline

El scroll no baja un documento: **avanza una película**. Un orquestador (GSAP ScrollTrigger, Motion+scroll, o equivalente) mapea `progress` 0→1 a cámara, luz, copy y UI.

1. **Una escena WebGL, varios actos.** Un solo canvas persistente (Three / R3F / Trois). Al scrollear cambia cámara, material, foco del modelo — no montes un WebGL por sección. Los actos son pins: el modelo gira / se desarma / se acerca mientras el copy entra.
2. **El modelo reacciona a ti.** Pointer/tilt en el hero (órbita suave, no first-person). Hover en hotspots. Click que lleva a un acto o al CTA. En mobile: scroll + gesture, no dependas del cursor.
3. **Capas 2D encima del 3D.** Títulos, masks, grain, light leaks, sticky copy. Parallax de tipografía y stills. El texto se sienta *sobre* la escena.
4. **Animaciones coreografiadas, no "muchas".** Cada acto tiene un gesto (reveal, wipe, camera move, type). Stagger corto. Nada de 12 librerías peleándose ni animar todo lo que se mueve. Silencio entre actos = lujo.
5. **Una promesa, un CTA** visible above the fold. El resto de CTAs aparecen cuando el acto los gana, no una barra llena de botones.
6. **Brutal = preciso y caro.** Cada frame podría ser un still. No caos brutalista, no particles por aburrimiento, no Lottie random.
7. **Degradar bien.** `prefers-reduced-motion` o sin WebGL: misma historia en stills + fade de actos (scroll sigue existiendo, sin pin agresivo). El fallback se ve dirigido, no "imagen rota".

Patrón de implementación:

```
packages/ui/composites/
  ScrollScene     # canvas único, progress, data-scene-ready
  Act             # pin + copy de un acto
  Cursor          # follower discreto (desktop only)
  HeroFallback    # poster / still
```

`ScrollScene` recibe `progress` (0–1) y un `act` (`data-act="1"`). El modelo no se anima en `useFrame` a lo loco: **el scroll manda**.

Checklist landing (falla = no entregar):

- [ ] Scrollear cambia la escena (cámara/modelo/copy). Si no, no es esta landing
- [ ] Un canvas 3D, no cinco. `data-scene` + `data-scene-ready` + `data-act`
- [ ] El modelo o la composición reacciona a pointer (desktop) o al gesto (mobile)
- [ ] ≥ 3 actos con ritmo distinto; cero feature-grid de cards
- [ ] CTA primario visible al cargar en 1440 y 390
- [ ] Reduced-motion / no-WebGL: historia completa, layout intacto
- [ ] Bloques en `packages/ui`, no timeline embebida en la página

## Aplicativo — "se usa sin pensar y se ve hermoso"

Objetivo: la persona termina la tarea. La belleza es claridad, no decoración.

1. **Una acción primaria por pantalla.** El resto es secundario o está escondido.
2. **Densidad Apple**: márgenes generosos, hit targets ≥ 44px, alineación óptica, no "más botones".
3. **Estados de verdad**: vacío, carga, error, éxito. El empty state se diseña; no es un texto gris.
4. **Formularios cortos**: labels visibles, errores junto al campo, no un toast genérico.
5. **Navegación predecible**: sidebar o top bar, no un invento. El usuario siempre sabe dónde está.
6. **Cero 3D, cero particles, cero video de fondo** en dashboards, tablas, settings, CRUD.
7. **Misma familia visual que la landing** (tokens), otra energía (silencio vs trailer).

Checklist app (falla = no entregar):

- [ ] Se puede completar el happy path en < 3 clics desde la home de la app
- [ ] No hay más de un CTA primario visible
- [ ] Empty/loading/error existen y se ven intencionales
- [ ] No hay canvas 3D ni animaciones que distraigan del formulario/tabla
- [ ] Componentes de `packages/ui` (Button, Input, Surface, PageHeader, EmptyState…). Nada copiado con otros radios/colores

## Sistema de componentes (obligatorio)

En greenfield o al tocar UI, existe `packages/ui`:

```
packages/ui/
  tokens/          # color, type, space, radius, motion, z
  primitives/      # Button, Text, Input, Surface, Stack, Row
  composites/      # PageHeader, EmptyState, ScrollScene, Act, Cursor, HeroFallback, Nav
  index.ts
```

Reglas:

- Tokens primero. Un hex suelto en una página es un bug.
- Un primitivo no conoce el dominio. Un composite puede conocer un *slot* (title, action), no un aggregate.
- Variantes por API (`tone`, `size`, `emphasis`), no por copiar el archivo.
- Astro y Next importan el mismo kit (componentes React en Next; en Astro, islas o equivalentes que no dupliquen estilos).
- Si necesitas un componente nuevo, lo añades al kit y lo usas. No "esta página es especial".

## Rendimiento (también es diseño)

- Landing: JS del 3D en chunk propio, `dynamic()` / `client:visible`, texturas comprimidas, no HDR de 40MB.
- App: casi cero JS de marketing. Listas virtualizadas si > 100 filas. No importes Three en `apps/web`.
- Fuentes: máximo 2 familias, `font-display: swap`, subset.
- Landing: **sí** una librería de scroll-timeline (GSAP ScrollTrigger o equivalente) — eso es orquestación real, no un fade. No instales Framer + GSAP + Lottie + AOS a la vez. Una orquesta.
- App: CSS primero. Cero ScrollTrigger. Cero Three.
- Mide: LCP del hero, TBT, peso del JS del route. Si el 3D rompe LCP, el poster es el LCP y el canvas entra después.

## Playwright valida el diseño

Una landing o pantalla de app **no está hecha** hasta que Playwright la valida. Detalle en [playwright-checks.md](playwright-checks.md).

Mínimo:

1. Screenshot del hero y de al menos un acto a mitad de scroll (desktop 1440 y mobile 390).
2. Al hacer scroll, `data-act` cambia — la escena no es un poster fijo.
3. CTA / happy path clickeable y visible.
4. No hay overflow horizontal.
5. Reduced-motion no deja un layout roto; fallback sin WebGL renderiza.

Si Playwright falla por "el 3D no es determinista", fija seed/cámara, espera `data-scene-ready`, o compara el fallback. No bajes la vara del snapshot para que pase.

## Qué no hacer

- Templates de SaaS (hero + 3 columnas + logos + pricing).
- Glassmorphism en cada card, gradients arcoíris, emojis como iconos, sombras pesadas.
- 3D en el aplicativo.
- CSS one-off que contradice tokens.
- "Ya lo vemos en el browser" sin test Playwright de diseño.
- Copiar GTA o Apple de forma literal (assets, logo, copy). La referencia es **calidad y dirección**, no IP.

## Al entregar UI

1. Modo (landing vs app) y por qué.
2. Componentes nuevos o reusados en `packages/ui`.
3. Cómo el scroll mueve la escena (actos, cámara, interacción) o por qué se overrideó.
4. Resultado Playwright de diseño (pass/fail, viewport).
5. Qué se dejó quieto a propósito (rendimiento / reduced-motion).
