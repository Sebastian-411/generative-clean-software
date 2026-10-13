# patterns — piezas de los briefs resueltos

Módulos sueltos y sin dependencias de marca, sacados de cinco briefs de cliente resueltos con esta skill (ver `../../briefs.md`). Se importan como módulos ES.

| Archivo | Qué hace | Brief de origen |
|---|---|---|
| `globe.js` | Planeta three.js con texturas reales, luces de ciudades, arcos de actividad con pulsos, anillo orbital y retícula de IA. Todo el aspecto sale de **4 pesos continuos** (`target.w`: sostenible, colapso, autómata, singular) más posición, escala y densidad de conexiones, amortiguados por cuadro. Calidad adaptativa incluida. | OMEGA |
| `idea-graph.js` | Grafo canvas 2D idea → oportunidad → clientes → marca → producto → lanzamiento, con fases y pulsos. El generador `strategy(idea)` es determinista (la misma idea da la misma empresa) y sirve para enlaces compartibles. | Genesis Engine |
| `torch.js` | Linterna: la imagen solo se ve donde apunta el cursor o el dedo; deriva sola en reposo; los detalles ocultos aparecen después de alumbrarlos. | NOCTURNAL |
| `typed.js` | Registros que se escriben solos al entrar en pantalla, con pausas en los puntos. | NOCTURNAL |
| `ambient-audio.js` | Sonido ambiente generado con Web Audio (zumbido + respiración + golpe), opt-in, sin archivos. | NOCTURNAL |
| `worlds.js` | La paleta de toda la página (`--bg`, `--ink`, `--acc`) se interpola hacia la de la sección visible (`data-world`). | Atlas Zero |

## globe.js

```js
import { createGlobe } from "./globe.js";
const g = createGlobe({ canvas });           // carga tex/earth-day(-2k).jpg y tex/earth-night(-2k).jpg
await g.ready();
g.target.w.set(0, 1, 0, 0);                  // escenario "colapso"
g.target.x = -1.05; g.target.s = 1.1;        // posición/escala del planeta para esa sección
requestAnimationFrame(function loop(t) { lenis?.raf(t); g.frame(t); requestAnimationFrame(loop); });
```

Texturas, de dominio público (NASA). Bájalas en 3840 px y genera también la versión `-2k`, que el módulo usa en móvil:

```bash
UA="tu-proyecto/1.0 (contacto)"
curl -sL -A "$UA" -o tex/earth-day.jpg   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Whole_world_-_land_and_oceans_12000.jpg/3840px-Whole_world_-_land_and_oceans_12000.jpg"
curl -sL -A "$UA" -o tex/earth-night.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Earth%27s_City_Lights_by_DMSP%2C_1994-1995_%28large%29.jpg/3840px-Earth%27s_City_Lights_by_DMSP%2C_1994-1995_%28large%29.jpg"
```

Atribución sugerida: "Tierra: NASA Goddard (Visible Earth) y NASA/NOAA DMSP, dominio público".

## idea-graph.js

```js
import { createIdeaGraph } from "./idea-graph.js";
const g = createIdeaGraph({ canvas, sidebarWidth: 350 });   // el canvas ocupa el escenario; deja espacio a un panel
const s = g.strategy(idea);                                 // { tam, growth, city, seg, name, tone, pal, features, price, channel, metric }
g.build(idea, s);
[0, 1, 2, 3, 4, 5].forEach((p) => setTimeout(() => g.setPhase(p), p * 900));
```

El generador es una demostración visual verosímil, no un análisis real. En un producto real, reemplaza `strategy()` por la respuesta de tu API y conserva el grafo.
