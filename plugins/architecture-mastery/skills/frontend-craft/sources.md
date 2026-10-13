# Fuentes de diseño — cómo consultarlas desde un agente

Todas son públicas. Se usan para **decidir con referencias reales** y para **traer fuente/asset que luego se re-tematiza**. Nunca para copiar la identidad de otra marca.

Los scripts viven en `scripts/` de esta skill. Córrelos desde un directorio con Playwright instalado (`npm i -D playwright && npx playwright install chromium`); escriben bajo `design/` por defecto.

| Fuente | Para qué | Cómo |
|---|---|---|
| **Sitios de referencia** (los del usuario, o los de reference-bar.md) | Medir la vara real: tipografía, escala, contenedor, nav, motion y contenido | `dissect.mjs` + `compare.mjs` (Playwright) |
| **Openverse** (Wikimedia, StockSnap, Rawpixel…) | Fotografía con licencia abierta (CC0 preferido) | `photos.mjs` → hoja de contactos |
| Refero Styles | Elegir dirección visual y sacar un sistema completo (DESIGN.md) | `refero.mjs` (Playwright) |
| Watermelon UI | Blocks de página y componentes animados con fuente | API JSON (curl) + shadcn CLI, o MCP |
| Motion-Primitives | Primitivas de motion de calidad (React + Motion + Tailwind) | CLI propio |
| Haikei | Fondos/texturas SVG generativos en tu paleta | `haikei.mjs` (Playwright) |
| 21st.dev | 12.000+ secciones React + Tailwind (hero, pricing, testimonios, FAQ, CTA) | `twentyfirst.mjs` (Playwright) + shadcn CLI o MCP |
| UI/UX Pro Max | Patrón de conversión por industria, reglas UX y checklist | `search.py` de la skill (Python) |
| Motion (Framer Motion) | Movimiento en React/Next | `templates/motion/motion.tsx` |

## Refero Styles — `styles.refero.design`

2.000+ sistemas visuales extraídos de sitios reales (Apple, Linear, Stripe, Brex, Fey, Mercury, Lamborghini, teenage engineering…). Cada estilo trae: concepto en una línea, paleta con roles, tipografía con escala y tracking, espaciado, radios, componentes descritos, do/don't, y un **DESIGN.md** listo para agentes.

```bash
# Explorar (si la búsqueda falla, cae a la galería Trending/Popular)
node scripts/refero.mjs list --q "editorial serif warm paper" --limit 20
node scripts/refero.mjs list --tab popular

# Traer un estilo: DESIGN.md + captura + estilos relacionados
node scripts/refero.mjs get https://styles.refero.design/style/<id> --out design/references/<nombre>
```

Cómo usarlo bien:

- Busca por **concepto y material**, no por industria: "midnight instrument", "warm cream editorial", "white concrete one accent", "industrial catalogue", "blueprint hairlines", "quiet luxury".
- Desde un estilo cercano, abre `related.md` y navega el vecindario: así se encuentran las mejores referencias.
- Mira siempre `style-page.png` además de leer el DESIGN.md: la descripción no reemplaza ver.
- Al adaptar a `design/DESIGN.md`: conserva **la lógica** (cómo usa el acento, el tracking, la densidad, los radios), cambia **la identidad** (acento propio o justificado, fuentes sustitutas libres, nombres de tokens propios, copy propio).
- Refero también tiene MCP de pago (145k pantallas, flujos) y una skill (`npx skills add https://github.com/referodesign/refero_skill`). Si el usuario lo tiene conectado, úsalo para patrones de pantallas de app (onboarding, empty states, settings).

## Watermelon UI — `ui.watermelon.sh`

849 entradas open source (MIT): 516 componentes, 131 animados, 189 blocks (hero, footer, pricing, CTA, bento, auth, contact, blog, career, error, announcement…), 12 dashboards. Estilo shadcn: instalas la fuente en tu repo.

```bash
# Catálogo (sin auth): kind = components | animated-components | blocks | dashboards | templates
curl -s "https://ui.watermelon.sh/api/v1/catalog/entries?kind=blocks&query=hero&limit=20"
curl -s "https://ui.watermelon.sh/api/v1/catalog/entries?kind=animated-components&category=micro-interaction"
curl -s "https://ui.watermelon.sh/api/v1/catalog/entries/blocks/hero-1"

# Cada entrada trae image (preview .webp), previewUrl, registryUrl e installCommand:
npx shadcn@latest add https://registry.watermelon.sh/r/hero-1.json
# Leer la fuente sin instalar:
curl -s https://registry.watermelon.sh/r/hero-1.json   # files[].content
```

- **Mira la preview** (`image`, descárgala y ábrela) antes de elegir; descarta lo que no encaje con el concepto.
- Requiere `npx shadcn@latest init` (crea `components.json`) y Tailwind.
- Después de instalar: re-tematiza (tokens de color, radios, fuentes, sombras, copy). Muévelo a `packages/ui` si se reutiliza.
- MCP opcional, gratis y sin API key: `claude mcp add --transport http watermelon https://mcp.watermelon.sh/mcp` (Codex: `codex mcp add watermelon --url https://mcp.watermelon.sh/mcp`). Herramientas: `search`, `get_inspiration`, `get_component`, `compose_page`, `list_categories`.

## Motion-Primitives — `motion-primitives.com`

Primitivas de animación cuidadas (React + `motion` + Tailwind), open source:

`text-effect` · `text-scramble` · `text-shimmer` · `text-loop` · `text-morph` · `text-roll` · `spinning-text` · `animated-number` · `sliding-number` · `in-view` · `animated-group` · `scroll-progress` · `infinite-slider` · `progressive-blur` · `spotlight` · `glow-effect` · `border-trail` · `magnetic` · `tilt` · `cursor` · `image-comparison` · `carousel` · `dock` · `morphing-dialog` · `morphing-popover` · `transition-panel` · `toolbar-dynamic` · `toolbar-expandable` · `animated-background` · `accordion` · `disclosure` · `dialog`

```bash
npm i motion clsx tailwind-merge
npx motion-primitives@latest add text-effect
# Docs y ejemplos de cada una: https://motion-primitives.com/docs/<nombre>
```

Usos que se ven caros:

- Hero: `text-effect` (per word/char, blur-in) en el titular — una vez, al cargar.
- Secciones: `in-view` / `animated-group` para reveals cortos y escalonados.
- Logos: `infinite-slider` + `progressive-blur` en los bordes.
- Métricas: `animated-number` / `sliding-number` al entrar en viewport.
- CTA o cards destacadas: `magnetic`, `spotlight` o `border-trail` — en **uno o dos** elementos, no en todos.
- Comparar antes/después: `image-comparison`.

En Astro: úsalas como islas React (`client:visible`).

## Haikei — `haikei.app`

Generadores de SVG: `layered-waves`, `stacked-waves`, `wave`, `blob-scene`, `blob-scatter`, `blob`, `layered-peaks`, `stacked-peaks`, `layered-steps`, `stacked-steps`, `low-poly`, `low-poly-grid`, `circle-scatter`, `polygon-scatter`, `symbol-scatter`, `blurry-gradient`.

```bash
# Primer color = fondo; los demás se reparten por capas. --seed n = otra variante
node scripts/haikei.mjs layered-waves --colors "#0a0a0b,#16161a,#ff5900" --out apps/site/public/bg/section-divider.svg
node scripts/haikei.mjs blurry-gradient --colors "#0b0b0c,#1b2a4a,#3b5bdb" --out apps/site/public/bg/hero-light.svg --seed 3
```

Cuándo sirve: separadores de sección (waves/peaks/steps), luz de fondo (blurry-gradient), textura de marca (low-poly-grid, symbol-scatter). Cuándo no: como protagonista del hero en un concepto editorial o de producto. Siempre **en la paleta** del DESIGN.md y a baja intensidad; combínalo con grain.

## 21st.dev — `twentyfirst.mjs`

```bash
node scripts/twentyfirst.mjs search hero --n 12 --out design/21st/hero     # previews reales a 1440 → contact-sheet.png
node scripts/twentyfirst.mjs search testimonials --theme light
node scripts/twentyfirst.mjs install <autor>/<slug>                         # requiere API_KEY_21ST
```

Cada página de 21st tiene un gemelo en Markdown (`Accept: text/markdown`), y el listado está en `https://21st.dev/community/components/s/<etiqueta>.md`. El script lo usa sin key y captura el bundle de la preview (`cdn.21st.dev`). **Elige mirando la hoja de contactos**, no por el nombre.

- **Instalar** pide una key: `npx shadcn@latest add "https://21st.dev/r/<autor>/<slug>?api_key=$API_KEY_21ST"`. Sin key el registro responde 403. La key se crea en `21st.dev/mcp`, que también instala el MCP (`npx @21st-dev/cli@latest init --client claude`).
- **Licencia**: muchas fichas dicen `unknown`. Usa solo MIT o equivalente. Si el componente viene de una librería abierta (Magic UI, Aceternity, Origin UI…), instálalo **desde el registro de esa librería**, sin key: `npx shadcn@latest add "https://magicui.design/r/marquee"`.
- Un componente de 21st es un punto de partida. Lleva tokens propios (color, fuente, radios, sombras, motion) y locale propio (`Intl.NumberFormat("es-CO")`, no `en-US`), y se mide con `shoot.mjs` como cualquier otra pieza. Los que traen gradiente violeta, glass o spotlight caen en la lista negra de premium-bar.md.

## UI/UX Pro Max — `nextlevelbuilder/ui-ux-pro-max-skill` (MIT)

```bash
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill    # luego: /plugin install ui-ux-pro-max@ui-ux-pro-max-skill
npm i -g ui-ux-pro-max-cli && uipro init --ai claude             # alternativa sin marketplace
python scripts/search.py "ai automation agency b2b" --design-system -p "Kora"
python scripts/search.py "landing conversion" --domain ux        # también: style, typography, chart, icons
python scripts/search.py "hero animation" --stack react          # o html-tailwind
```

Es una base de datos de estilos, paletas y reglas por industria. **Úsala como fuente filtrada, no como dirección**:

- **Sí**: el patrón de página por industria (p. ej. "Product Demo + Features" para servicios de IA), las reglas UX (animar 1–2 elementos clave por vista, `prefers-reduced-motion`, tokens de motion compartidos, contraste, estados) y su checklist previo a entregar.
- **No sin medir**: su paleta y su tipografía. Para "AI automation agency" recomienda violeta `#7C3AED`, cian y solo Inter, que es exactamente el promedio que delata un sitio generado. Recalibra color y tipo con `dissect.mjs` contra las referencias del modo. Si su sugerencia cae fuera del rango, gana la referencia.

## Motion (Framer Motion) — React/Next

Paquete `motion` (`import { motion } from "motion/react"`). En sitios Next arranca de `templates/motion/motion.tsx`: `Reveal`, `Stagger`/`StaggerItem` y `LineReveal`, con una sola curva y reduced-motion resuelto. No mezcles otras curvas ni distancias: el sitio entero habla un solo idioma de movimiento.

## Otras referencias (si el usuario las tiene)

- Mobbin / Refero MCP: patrones de pantallas de app reales.
- Las URLs que el usuario ame: `shoot.mjs <url> --out design/references/<nombre>` para capturarlas y analizarlas igual que un estilo de Refero.

## Sitios de referencia — `dissect.mjs` y `compare.mjs`

```bash
node scripts/dissect.mjs https://plada.ai --out design/references/plada        # mide y captura
node scripts/compare.mjs http://localhost:4321 --refs design/references/plada,design/references/founderdex
```

`dissect.mjs` reintenta ante fallos de red y espera los estilos si la página carga sin CSS. Algunos sitios bloquean navegadores automatizados (Tesla devuelve "Access Denied"); en ese caso usa otra referencia del mismo modo.

## Fotografía — `photos.mjs` (Openverse)

```bash
node scripts/photos.mjs "city night aerial" --out design/photos/ciudad --wide
```

Descarga candidatas con `credits.json` y `contact-sheet.png`. Para fotografía a sangre usa `--source wikimedia --min-width 2400`, que da originales sin marca de agua. Rawpixel y StockSnap entregan previews de 960–1300 px, a veces con marca, y el script los descarta solo. **Elige mirando.** Reglas: CC0 primero; CC BY con atribución en el footer; nunca la foto de una persona real identificable junto a un nombre o cita inventada. Unsplash bloquea bots con un challenge, así que no está automatizado.
