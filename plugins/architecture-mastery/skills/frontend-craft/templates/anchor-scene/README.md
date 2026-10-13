# anchor-scene — el producto 3D viaja por la página

Patrón de Fizzi y CAN/DO: secciones 2D planas y bien diseñadas, y **encima** un canvas transparente donde el producto 3D se posa en anclas del layout y viaja entre ellas con el scroll.

```html
<canvas id="scene" data-scene></canvas>          <!-- fixed, z-index alto, pointer-events: none -->
<div class="anchor" data-anchor="lata" data-rot="6 -28 20"><img src="img/lata.png" alt=""></div>
<section data-hold>…<div data-anchor="lata" data-hold-spin="1"></div>…</section>   <!-- gira mientras la sección está fija -->
<div data-anchor="lata2" data-out="right"></div>  <!-- sale de escena -->
```

```js
const lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }); // sin raf propio
const s = createAnchorScene({ canvas, lenis, stiffness: 7 });   // la escena avanza Lenis en su mismo cuadro
const can = s.add("lata", createCan(labelCanvas));   // can.setLabel(otro) para cambiar de sabor
s.start();                                           // <html class="scene-on" data-at-lata="2">
```

- **El ancla es una caja real del layout**: su alto define el tamaño del producto y en mobile se reacomoda sola.
- El producto se posa cuando el ancla llega al centro de la pantalla; entre anclas interpola posición, tamaño y rotación con ease, más un amortiguado de peso y una flotación sutil.
- `img` dentro del ancla = respaldo sin WebGL y LCP; se oculta con `.scene-on`. Se genera con `scripts/still.mjs` desde un `still.html` (ver `still.html` en esta carpeta).
- `can.js` es una lata de 355 ml procedural (aluminio + etiqueta en canvas, 2048 × 1024; el centro de la textura es el frente y los bordes son la espalda). Para otros productos, carga un GLB normalizado a 1 unidad de alto con `fitObject` (en `scroll-scene/scene.js`).
- **Suavidad** (medida con `?trace` → `window.__trace`, posición por cuadro):
  - **Un solo reloj.** Pasa `lenis` y no le des su propio `requestAnimationFrame`. Con dos relojes, la escena lee un scroll de un cuadro atrás y tironea.
  - **Resorte críticamente amortiguado** (`stiffness`, de 6 a 12) en vez de `lerp`.
  - **Ease sinusoidal** entre anclas: el cúbico frena en seco en cada una.
  - **Inclinación por velocidad de scroll** (`tilt`).
  - Las animaciones de la página, en `s.onFrame()` y ligadas al progreso, no activadas con clases.

  En CHISPA esto bajó la aceleración media de la lata 4 veces y los picos casi 4 veces.
- El ancla se posa en el scroll más cercano a centrarla, acotado al inicio y al final de la página, así que un ancla del hero arriba del centro ya está posada al cargar.
- `anchor.spec.ts`: escena lista, el canvas no bloquea clics, **el producto se posa en cada ancla** (`html[data-at-<id>]`), sin overflow y respaldo sin WebGL.

Ejemplo de etiquetas de marca: `labels.example.js` (una soda ficticia con cinco sabores: arte, tabla nutricional en la espalda y sello). Cópialo como `labels.js`.
