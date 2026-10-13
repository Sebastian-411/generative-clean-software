# Landing cinematográfica — receta (GTA 6 key art × Apple product page)

La landing no es un documento con un 3D de adorno: **es una película que el scroll reproduce**. Un canvas WebGL fijo, una cámara que recorre actos, tipografía enorme que entra y sale sobre la escena, y detalles que reaccionan a ti.

Plantilla funcional en [`templates/scroll-scene/`](templates/scroll-scene/): motor reutilizable (`scene.js`, `camera-rig.js`, `acts.js`, `boot.js`, `variants.js`, `scene.css`) + página de ejemplo + `scene.spec.ts`. Cópiala a `packages/ui/composites/scroll-scene/` y úsala; no reescribas el motor por página.

Este motor se validó con tres landings distintas sin tocarlo, solo cambiando `product.js`, `shots`, `palette` y tokens: un auto concepto (atardecer al estilo GTA 6), un reloj (estudio negro y oro, con las agujas marcando la hora real) y una zapatilla (tema claro de hormigón, cuenta regresiva del drop). Los modelos salieron de los glTF Sample Assets de Khronos (CC BY 4.0).

### Dirección por paleta, no por código

La misma escena cambia de mundo con `palette` (ver `SUNSET` en `scene.js`):

- **Atardecer / exterior**: `sun` + `sunBands`, `grid`, niebla del color del horizonte.
- **Estudio negro (lujo)**: `sun: null`, cielo casi negro, `softboxes` (solo en el entorno: dibujan líneas de luz sobre metal y vidrio sin verse), piso mate, `rim` cálido detrás.
- **Estudio claro (moda, deporte)**: cielo neutro claro, piso de hormigón mate, `key` + `fill` altos, bloom casi apagado. En tema claro el HUD cambia de color con `body.bars-open`.

## Stack (una orquesta, no cinco)

| Pieza | Elección | Por qué |
|---|---|---|
| 3D | three.js (o R3F en Next) | Control fino, ecosistema, postprocesado |
| Orquestación del scroll | GSAP + ScrollTrigger (gratis, incluidos plugins) | `scrub`, pins, timelines, velocidad |
| Smooth scroll | Lenis | Inercia tipo Apple; ScrollTrigger lo escucha |
| Modelos | glTF/GLB + Draco (o Meshopt) | 5–10× más livianos |
| Postproceso | EffectComposer: Bloom + Output (+ grano en CSS) | Look de render, barato |

En Astro: la escena es **una isla** (`client:only` / script de módulo) montada una vez en el layout de la landing. En Next: `dynamic(() => import(...), { ssr: false })`.

## Anatomía

```
<canvas data-scene>            fijo, z-index 0, un solo renderer para toda la página
<div .poster>                  imagen fallback (LCP) detrás del canvas
<div .vignette> <div .grain>   capas 2D de cine encima
<header .nav> .rail .speedo    HUD fijo (progreso de actos, lecturas en vivo)
<main data-act="1">            secciones .act (≥ 120vh), contenido sticky de 100vh
  <section .act data-step=n>   un acto = un plano de cámara + un mensaje
```

## Los 8 movimientos que lo hacen "trailer"

1. **Loader con cifra** (0–100 %) de la carga real (`LoadingManager`) y salida en fundido. Nunca un spinner.
2. **Letterbox**: barras negras de cine (~11vh) que se abren con el primer scroll.
3. **Cámara por actos**: un keyframe `{pos, look, color}` por acto, interpolados con `CatmullRomCurve3` y movidos por `scrub` (1–1.5 s de inercia). Planos variados: 3/4 bajo heroico → perfil → primer plano de un detalle → cenital → plano abierto final.
4. **Tipografía-póster**: display condensada gigante (15–20vw) con máscara de línea (`overflow:hidden` + `yPercent:110 → 0`), sobre el cielo, **sin tapar el producto**. Entra al llegar al acto y **sale** al irse (`toggleActions: "play reverse play reverse"`).
5. **El objeto reacciona**: ruedas que giran con la velocidad del scroll, pintura que cambia por acto, rotación en el acto cenital, parallax de puntero en desktop.
6. **Luz con intención**: cielo propio (shader de gradiente + sol), entorno generado **desde ese mismo cielo** (`PMREMGenerator.fromScene`) para que los reflejos tengan la paleta; contraluz cálido + relleno frío; niebla del color del horizonte.
7. **Postproceso con mesura**: bloom bajo (strength ~0.4, threshold ~0.9), tone mapping ACES, viñeta y grano CSS. Si algo "brilla" sin ser fuente de luz, el threshold está mal.
8. **Final interactivo**: un configurador (color, versión) que cambia el render en vivo + CTA. El usuario termina *jugando*, no leyendo.

## Rendimiento (no negociable)

- Un renderer, un canvas, un `setAnimationLoop`. Pausa con `visibilitychange`.
- `setPixelRatio(min(dpr, 1.75))` desktop, `1.5` mobile. Transmisión/refracción fuera en mobile.
- **Calidad adaptativa**: mide el tiempo de frame (~45 frames); si el promedio > 34 ms, baja DPR a 1; si sigue, apaga bloom y transmisión. Expone `data-quality` para tests.
- Modelo en Draco/Meshopt, < 3 MB idealmente; texturas KTX2 si hay muchas. `preload` del GLB.
- El **poster es el LCP**: `.poster` con una imagen del primer plano (captúrala con `shoot.mjs` una vez aprobado). El canvas entra encima.
- JS de la escena en módulo diferido; la tipografía y CTA del hero son HTML y se ven antes del 3D.

## Reduced motion / sin WebGL

- `prefers-reduced-motion`: sin Lenis, sin `scrub` (la cámara salta de plano por acto), sin grano animado, sin parallax. La historia completa sigue ahí.
- Sin WebGL (o error de carga): queda el `.poster` + los actos en HTML. Nunca una pantalla negra.

## Assets 3D: de dónde y con qué licencia

- **Propios** (la marca los entrega) o encargados: lo ideal.
- **Poly Haven** (CC0): HDRIs, texturas, modelos. **Sketchfab** filtro "Downloadable + CC0/CC-BY" (atribuye). **Kenney** (CC0, low-poly). **Quaternius** (CC0).
- **glTF Sample Assets de Khronos**: modelos de producto de calidad comercial con licencia CC0/CC BY y variantes de material (auto, reloj, zapatilla, gafas, sofá, lámpara…). Revisa `metadata.json` de cada uno: licencia y marcas registradas.
- **Prohibido**: modelos de marcas reales (autos, gadgets) en un producto ficticio o de otro, logos o insignias visibles. Si un modelo trae marcas: oculta la malla (`visible = false`), quita el `map` del material (rotulados de neumático) o **reescribe la textura** en carga (detecta el logo por color en un cúmulo del atlas y tápalo con el color del entorno: detecta el cúmulo más denso de píxeles del color del logo, en celdas de 1/64 del atlas, y crece solo por vecinas densas para no tocar el resto de la textura). No estampes texto en el atlas: las islas UV pueden estar giradas.
- **Optimiza siempre**: `npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp --texture-size 1024` (≈ 10× menos peso).
- **Calibra antes de encuadrar**: normaliza con `fitObject(obj, { size, measure })` (`measure` ignora geometría suelta que infla la caja) y mira el modelo desde 4 lados con `templates/tools/turntable.html`.
- Sin modelo posible: escena **procedural** (formas + materiales físicos + luz) o **secuencia de imágenes** estilo Apple (frames renderizados en Blender dibujados en `<canvas>` según el scroll).

## Validación Playwright (además del loop de `shoot.mjs`)

`shoot.mjs` detecta `[data-scene]`: espera `data-scene-ready`, captura un corte por acto (15/35/55/72/90 %) y falla si el scroll recorre menos de 3 actos. El test del repo (ver `templates/scroll-scene/scene.spec.ts`) afirma:

1. Un solo `canvas[data-scene]` y llega a `data-scene-ready`.
2. `data-act` avanza 1 → 5 al scrollear, y el píxel central del canvas cambia entre actos (la cámara se movió).
3. CTA primario visible en el hero a 1440 y 390.
4. Sin overflow horizontal ni errores de consola.
5. Con `reducedMotion: "reduce"` la página se recorre entera y el CTA final funciona.
6. Snapshot del **poster/HTML** del hero, no del frame WebGL (no es determinista).

## Errores que ya cometimos (no los repitas)

- Título enorme **encima** del producto: lo tapa. El título vive en el cielo; el producto en el tercio inferior.
- `filter: drop-shadow` sobre texto con `background-clip:text`: dibuja un rectángulo.
- HDRI de stock con otra paleta: los reflejos traicionan la escena. Genera el entorno desde tu cielo.
- Niebla de un color distinto al horizonte: banda dura donde termina el piso.
- Textos sticky que no salen: se encima el acto anterior con el siguiente.
- HUD (velocímetro, rail) chocando con el copy de un acto: reserva su zona.
- Bloom con threshold bajo: llantas y cromados "radioactivos".
- Amortiguar la **posición** de la cámara: cuando el scroll salta, corta en línea recta a través del modelo. Se amortigua el **progreso** y la cámara siempre queda en su órbita (`camera-rig.js`).
- Encuadre de desktop en mobile: en vertical el campo horizontal es estrecho. El rig aleja la cámara según el aspecto.
- Luz direccional de relleno sobre un piso metálico: deja una mancha especular. Usa relleno hemisférico.
- HUD blanco en tema claro: invisible cuando se abren las barras. Usa `.bars-open`.
- Modelo de muestra con marcas (logo en la esfera, rotulado del neumático, placa): revísalo plano por plano antes de dar por buena la escena.
