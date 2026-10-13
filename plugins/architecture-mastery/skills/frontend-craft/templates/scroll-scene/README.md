# scroll-scene — landing cinematográfica

Escena 3D fija + scroll que reproduce una película por actos. Ver `../../cinematic.md` para la receta y las reglas.

## Correr el ejemplo

```bash
# Modelo con licencia (CC BY 4.0) + optimización obligatoria (Draco + WebP 1024): 11,8 MB → 1,1 MB
B=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary
mkdir -p models draco
curl -sL -o models/raw.glb $B/CarConcept.glb
npx @gltf-transform/cli optimize models/raw.glb models/car.glb --compress draco --texture-compress webp --texture-size 1024
R=https://raw.githubusercontent.com/mrdoob/three.js/r169/examples/jsm/libs/draco/gltf
for f in draco_decoder.js draco_decoder.wasm draco_wasm_wrapper.js; do curl -sL -o draco/$f $R/$f; done

npx http-server -p 4800 -s .
npm i -D @playwright/test && npx playwright install chromium
npx playwright test                    # scene.spec.ts, desktop 1440 + mobile 390
node ../../scripts/still.mjs "http://localhost:4800/still.html?variant=Pearly%20Swirly" car.png
```

El motor se validó con tres productos y tres direcciones (auto en atardecer, reloj en estudio negro, zapatilla en tema claro) sin cambiar una línea del motor; ver `../../cinematic.md`.

**Archivos del motor** (no se tocan por página): `scene.js` (renderer, cielo, entorno con softboxes, postproceso, calidad adaptativa, `fitObject`, `contactShadow`), `camera-rig.js` (planos por acto, órbita, holds, encuadre vertical), `acts.js` (Lenis + ScrollTrigger, `data-act`, revelados, letterbox, `bars-open`), `boot.js` (arranque estándar, configurador, lecturas del HUD, parallax), `variants.js` (KHR_materials_variants), `scene.css` (capas de cine, HUD y actos por tokens).

## Qué se cambia por proyecto

| Archivo | Qué |
|---|---|
| `product.js` | Modelo (normalizado con `fitObject`), marcas ajenas ocultas, `select` de variantes, `degrade()` |
| `index.html` → `shots` | Un plano de cámara por acto: `pos`, `look` (usa `../tools/turntable.html` para ver hacia dónde mira el modelo) |
| `index.html` → `palette` | Cielo, sol (o `null` para estudio), softboxes, niebla, piso, grid, luces, exposición |
| `index.html` → `animate` / `readout` | Animación propia por frame y la lectura en vivo del HUD |
| `index.html` → `<style>` sobre `:root` | Tokens de marca (vienen de `design/DESIGN.md`); `scene.css` no se edita |
| `index.html` → secciones `.act` | Copy por acto (`data-step`, `.split-line`, `data-reveal`, `.swatches button[data-variant]`) |

El motor vive en `packages/ui/composites/scroll-scene/` y todas las landings lo importan.

## Astro (`apps/site`)

- Copia el motor (`scene.js`, `camera-rig.js`, `acts.js`, `boot.js`, `variants.js`, `scene.css`) a `packages/ui/composites/scroll-scene/` y `product.js` al sitio.
- `npm i three gsap lenis` y quita el import map. Antes de `bootScrollScene` expón los globales que usa el motor: `import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger"; import Lenis from "lenis"; Object.assign(window, { gsap, ScrollTrigger, Lenis });`.
- La página es `.astro` con el marcado de los actos; el `<script>` del final va como `<script>` de Astro (módulo, se agrupa y difiere solo).
- Modelos y Draco en `public/`.

## Next.js

Mismo motor en un componente cliente montado con `dynamic(() => import("./Scene"), { ssr: false })`. Úsalo solo en rutas de marketing, nunca en `apps/web` de aplicativo.
