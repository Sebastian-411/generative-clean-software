# La vara premium — rúbrica, tells de IA y reglas de oficio

Una página de 10k no tiene más cosas. Tiene **menos decisiones, todas tomadas a propósito**, ejecutadas con precisión obsesiva. Cada frame podría ser un still de portfolio.

## Rúbrica (puntúa 1–5 cada fila; entrega con todas ≥ 4)

| # | Criterio | 5 = así se ve | 2 = así se ve |
|---|---|---|---|
| 1 | **Concepto** | Se describe en una línea ("archivo editorial en papel cálido, una tinta roja") y cada sección lo respeta | "Moderno y limpio"; cada sección parece de otra plantilla |
| 2 | **Tipografía** | Display con carácter, tamaños grandes con tracking negativo, jerarquía obvia a 2 m de distancia, body cómodo | Inter 48px tracking normal, 9 tamaños sin escala |
| 3 | **Color** | Canvas + neutrales con rol + un acento usado con disciplina (< 5 % de la superficie) | Paleta de 8 colores, gradientes decorativos, gris sobre gris |
| 4 | **Composición y ritmo** | Grid visible, asimetría intencional, secciones con ritmos distintos, aire generoso | Todo centrado y apilado, mismo padding, misma card |
| 5 | **Imagen / prueba visual** | Producto real o mock de producto construido con cariño, fondos/texturas propios | Iconos en círculos, stock, ilustraciones 3D genéricas |
| 6 | **Detalle** | Hover/focus/active en todo, bordes hairline, sombras teñidas, selección, favicon, nav al scrollear | Estados por defecto del navegador, sombra gris genérica |
| 7 | **Motion** | Un gesto firma + reveals cortos y físicos; reduced-motion dirigido | Todo hace fade-up igual, o nada se mueve, o todo rebota |
| 8 | **Copy** | Específico, con números, voz propia, titulares cortos | "Unlock the power of…", "Supercharge your workflow" |
| 9 | **Mobile** | Rediseñado para 390: tipografía, orden y aire pensados | El desktop encogido, CTA bajo el fold, overflow |
| 10 | **Calidad técnica** | LCP < 2.5s, CLS < 0.1, AA, sin errores de consola | Fuentes saltan, layout se mueve, imágenes rotas |

Prueba del screenshot: pon tu fold de desktop junto al de la referencia de Refero. Si un director de arte no puede decir cuál hizo la agencia, pasa.

## Lista negra — tells de "lo hizo una IA"

Si aparece cualquiera sin una razón escrita en `design/DESIGN.md`, es defecto:

1. Gradiente violeta→azul / índigo→rosa (fondos, botones o texto).
2. Hero centrado + subtítulo + 2 botones + **tres cards con icono** debajo.
3. Emoji como iconos, ✨ para "AI", iconos dentro de círculos de color pastel.
4. Glassmorphism en cada card; blobs borrosos de colores flotando sin concepto.
5. `rounded-2xl` + `shadow-lg` en todo; cards dentro de cards dentro de cards.
6. Texto con gradiente en cada titular.
7. Inter/system-ui en todo con tracking por defecto y pesos 400/600 sin intención.
8. Badge pill arriba del H1 con "✨ New" o "Introducing…" (salvo que sea un anuncio real).
9. Fondo negro + neon glow sin que el producto lo justifique.
10. Grids de features idénticos (icono + título + 2 líneas) repetidos 2–3 veces.
11. Testimonios falsos ("John D., CEO"), logos inventados, métricas redondas sin fuente ("10x faster").
12. Más de un CTA primario compitiendo en el fold.
13. Copy genérico: "Unlock", "Supercharge", "Seamless", "Elevate", "Revolutionize", "Your all-in-one".
14. Secciones con el mismo padding, el mismo ancho y la misma alineación de principio a fin.
15. Ilustraciones 3D isométricas de stock, manos con teléfono genéricas, avatares de IA.

**Los tells del espectáculo** (la sobrecompensación; ningún sitio de referencia medido los usa):

16. Titulares de más de ~90 px o en `vw` gigantes (15–20 vw), tracking de −0,05 em o menos.
17. Grano animado, viñeta, letterbox, barras de cine, loaders con porcentaje en un sitio de producto.
18. HUDs y lecturas en vivo decorativas (velocímetros, contadores, "tu scroll a X km/h").
19. Texto que entra letra a letra o palabra a palabra; todo con reveal; smooth scroll pesado.
20. Una escena 3D o un fondo generativo **en lugar** del producto real.
21. Tres o más familias tipográficas; mezcla de display condensada + serif + mono "para dar carácter".
22. Secciones sin contenido (solo un titular gigante sobre un efecto); páginas cortas de 5 pantallas con 300 palabras.

## Reglas de oficio

### Tipografía (lo que más separa amateur de premium)

- **Dos familias** máximo (+ mono para labels/datos). Una display con carácter; una body neutra.
- Titular principal: **40–84 px** en desktop (medido: Apple 56, Vaas 61, Founderdex 72, Nike 76, YC 84), line-height 1.0–1.1, tracking de 0 a −0,04 em. En móvil, 36–48 px. Ver reference-bar.md.
- Body 16–18px, line-height 1.5–1.65, medida 55–70 caracteres (`max-width: 62ch`).
- `text-wrap: balance` en titulares, `text-wrap: pretty` en párrafos. `font-variant-numeric: tabular-nums` en cifras.
- Labels/eyebrows en mono o small caps, 11–13px, tracking `+0.04em` a `+0.12em`, uppercase — con moderación, como sistema (numeración "01 — Producto").
- Escala modular (1.2–1.333) en tokens; nada fuera de la escala.
- **Nada light en texto de lectura.** Por debajo de ~40 px el peso mínimo es 400 (300 con opsz alto solo en serif de display ≥ 72 px). Los pesos 100–300 a 16–30 px se rasterizan con trazos finos y quedan "cuadrados", sobre todo en fondo oscuro, y es de los tells más fuertes de página generada. En oscuro, el cuerpo va en 400 y la jerarquía se arma con color y tamaño, no adelgazando la letra.
- **Carga exactamente los pesos que usas** (`wght@400;500`). Un peso o itálica no cargados hacen que el navegador los sintetice (negrita falsa, itálica forzada). `shoot.mjs` y `site.spec.ts` lo detectan.
- Con serifs de tamaño óptico (Fraunces, Newsreader), ajusta `font-variation-settings: "opsz"` al tamaño: opsz bajo para cuerpo, alto para titulares.
- **Una familia** por defecto (Geist, Inter, DM Sans, Plus Jakarta, Work Sans…); dos solo si una es serif display (YC: Source Serif + Outfit). Pares que funcionan (gratis): Instrument Serif + Inter · Fraunces + Geist · Newsreader + Inter · Geist + Geist Mono · Bricolage Grotesque + Inter · Clash Display / Cabinet Grotesk / Satoshi / General Sans (Fontshare) + Inter · Space Grotesk solo si el concepto es técnico. Mono: Geist Mono, JetBrains Mono, IBM Plex Mono.
- Si la referencia usa una fuente propietaria (Söhne, Neue Montreal, GT, Flecha), usa el sustituto que trae su DESIGN.md.

### Color

- Define en OKLCH. Neutrales **teñidos** (cálidos o fríos según el concepto), no grises puros.
- Canvas + 1 superficie elevada + 1 borde + 3 niveles de texto + 1 acento + estados. Eso es todo.
- El acento marca **la** acción o **la** palabra. Si aparece en 10 sitios, ya no es acento.
- Oscuro premium: canvas `#0a0a0b`–`#111113`, superficies a +2–4 % de luminancia, bordes `rgba(255,255,255,.06–.10)`, texto principal ~`#ededed`, no `#fff` puro en párrafos.
- Claro premium: papel cálido (`#f7f5f0`) o blanco con superficie fría (`#f3f3f7`), tinta casi negra (`#0d0d0d`), hairlines `rgba(0,0,0,.08)`.

### Espacio, grid y composición

- Grid de 12 columnas, max-width 1200–1360px, gutters 24–32px. Rompe el grid **a propósito** (una imagen a sangre, un titular que cruza columnas).
- Padding de sección desktop 128–200px, mobile 72–112px. El vacío es lo que hace que lo demás se vea caro.
- Varía el ritmo: sección densa → sección de un solo titular → sección a sangre → sección de datos.
- Alineación a la izquierda por defecto en contenido; centrar es una decisión, no el default.
- Hairlines (1px, baja opacidad) para estructurar en lugar de cajas con sombra.

### Imagen y prueba visual

- La mejor imagen es **el producto**: capturas reales en un marco cuidado, o UI de producto construida en HTML con datos verosímiles (tablas, gráficos, estados) — se ve más premium que cualquier ilustración.
- Fondos: generativos de Haikei en la paleta (layered-waves, blob-scene, blurry-gradient, low-poly), grain SVG al 3–6 % de opacidad, gradientes radiales sutiles **de la paleta** para luz direccional.
- Fotografía: una dirección (luz, temperatura, encuadre) coherente; tratamiento uniforme (duotono, grano, B/N).
- Iconos: un solo set (Lucide/Phosphor), un solo grosor, tamaño consistente. Nunca emoji.

### Profundidad y detalle

- Elevación con capas de luminancia + borde hairline + highlight interior (`inset 0 1px 0 rgba(255,255,255,.06)`), no `shadow-lg`.
- Sombras, si hay: grandes, suaves, teñidas del color del fondo, varias capas a baja opacidad.
- Radios: un sistema (ej. 6 tags / 12 controles / 20 cards / 999 pills). Nunca mezclar 8 y 10 "por compromiso".
- Estados: hover, focus-visible (anillo diseñado), active, disabled, loading — en **todos** los interactivos.
- Nav: transparente sobre el hero → fondo con blur y hairline al scrollear. Footer como objeto diseñado (wordmark grande, columnas limpias).
- `::selection` con el acento, favicon, `<title>`, OG image, scrollbar discreta si es oscuro.

### Motion

- Curva base `cubic-bezier(.16, 1, .3, 1)` (expo-out), 200–600 ms; stagger 40–80 ms; distancia 8–24 px.
- **Un momento firma** por página (ver SKILL.md → Modos). El resto: reveals cortos al entrar en viewport, hover físicos (magnetic, spotlight, border-trail) en pocos elementos.
- Nada de bounce, nada de animar todo, nada de parallax mareante. Silencio entre gestos = lujo.
- `prefers-reduced-motion`: sin desplazamientos; opacidad o nada.

### Copy

- Titular: una idea, ≤ 8 palabras, con un verbo o una imagen concreta. Subtítulo: qué hace y para quién, ≤ 25 palabras.
- Números específicos (“reconcilia 4.812 facturas en 9 min”) > adjetivos.
- CTA con verbo + objeto ("Ver una demo de 3 min"), no "Get started" en todos lados.

## Anatomía de una landing premium (punto de partida, no plantilla)

1. **Nav** discreta: wordmark, 3–5 links, un CTA.
2. **Hero**: titular display enorme + subtítulo + CTA primario + prueba visual (producto/escena). Ocupa el fold en 1440 y en 390.
3. **Prueba social** sobria: logos monocromos en marquee lento, o una cita fuerte con nombre real.
4. **Narrativa** en 3–5 actos: cada acto un problema → cómo lo resuelve → visual propio. Alterna composición.
5. **Profundidad**: bento **solo** si cada celda tiene un visual real distinto; métricas; integraciones.
6. **Testimonio(s)** con cara, nombre, rol, empresa.
7. **Pricing / CTA final** con aire.
8. **FAQ** (opcional) y **footer** diseñado.

Recorta lo que no tenga contenido real. Una landing de 5 secciones excelentes vence a una de 12 correctas.
