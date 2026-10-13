# Briefs resueltos — cómo se tradujo cada uno

Cinco briefs de cliente muy distintos, resueltos con esta skill. **Cada uno eligió su propio modo**; ninguno usó una plantilla única. Úsalos como precedente cuando llegue un brief parecido. Las piezas reutilizables están en `templates/patterns/`.

Todos se validaron con Playwright en 1440 y 390: carga sin errores, CTA visible, sin overflow, la interacción del brief funcionando de punta a punta, tipografía sin pesos light ni sintetizados, y reduced-motion.

## 1. OMEGA — deep tech, generar expectativa ("instalación científica ultrasecreta")

- **Dirección:** negro de observatorio. Serif editorial (Instrument Serif) para la voz, Inter Tight 400 para el cuerpo y mono para los instrumentos. La luz la pone el planeta.
- **Momento firma:** la Tierra con texturas reales de la NASA en un shader propio (`globe.js`). **Los cuatro futuros cambian el planeta**, no solo un color: Solaris verdea el día, Fractura apaga regiones y corta los arcos, Autómata ordena las luces en retícula y suma un anillo orbital, Singular envuelve el planeta en una geodésica.
- **Interacción:** laboratorio con cuatro variables (cooperación, energía limpia, automatización, autonomía de la IA). Recalcula las probabilidades, tiñe el planeta y **guarda el futuro en la URL** (`#f=…`) para compartirlo, que era el objetivo del brief.
- **Narrativa:** secuencia de acceso corta y saltable, presente, escenarios en una sección sostenida (un futuro por tramo de scroll), laboratorio, visión con una frase tachada que conserva el misterio, y lista privada con número de observador.

## 2. The Last Company — reclutamiento exclusivo ("experiencia de selección")

- **Dirección:** archivo de una institución que todavía no existe. Papel hueso, tinta casi negra y **un azul de sello** (el brief pedía evitar negro y rojo). Grotesca monumental + serif editorial + mono de archivo. Fotografía de arquitectura brutalista en B/N y mucho vacío.
- **Interacción:** pregunta que se escribe sola; manifiesto que se enciende palabra por palabra; foto a sangre que se abre con el scroll; **memorando censurado** cuyas partes publicables se revelan al pasar el cursor; visor de figuras; tres pruebas sin respuesta correcta; y una **candidatura en cuatro pasos** con validación propia de cada paso, que termina sellada con número.
- **Filtro:** un botón explícito "Seguir de largo", porque el brief quería que las personas equivocadas se fueran.

## 3. Genesis Engine — IA, captar clientes ("ver nacer una empresa")

- **Dirección:** laboratorio de IA × herramienta empresarial. Pizarra con retícula de puntos, una sola familia (Geist) y su mono, un color por etapa del grafo. La complejidad vive en la visualización; el resto es silencio y jerarquía, calibrado con Linear, Vercel y Founderdex.
- **Momento firma:** el hero **es** la demo: escribes una idea y `idea-graph.js` la convierte en fases mientras un panel lateral explica cada una. Se reproduce sola al entrar en pantalla; la idea queda en la URL.
- **Después:** capacidades con mini-visualizaciones, un caso de una frase a la primera venta con métricas, resultados esperables y CTA de acceso anticipado.

## 4. NOCTURNAL — terror presencial, vender entradas ("la página da miedo por sí misma")

- **Dirección:** expediente policial de una instalación clausurada. Casi negro, serif clásica para la calma, máquina de escribir para los registros, papel de archivo para el expediente. Sin rojo sangre: **el miedo es la luz que no alcanza**.
- **Percepción:** `torch.js`: la foto solo se ve donde apunta la linterna y los detalles ocultos aparecen después de alumbrarlos un rato. Registros que se escriben solos (`typed.js`). Un corte a negro con flash único. Sonido ambiente opcional (`ambient-audio.js`). Scroll más lento y pesado que en las otras demos.
- **Ritmo:** momentos de calma (testimonios en itálica) antes de los golpes, como pedía el brief.
- **Venta:** datos prácticos (duración, grupo, lugar, +18, palabra de seguridad) y un **selector de fechas y horarios con cupos**. Lleva a un checkout que exige confirmar la mayoría de edad.

## 5. Atlas Zero — turismo de expedición, reservas ("hojear un atlas del futuro")

- **Dirección:** fotografía a sangre como protagonista absoluta; textos breves en serif de tamaño óptico (Fraunces); el lujo es el acceso, no el hotel.
- **Momento firma:** `worlds.js`: **cada destino es un mundo y la página entera cambia de paleta** al entrar en él (arena, salar lavanda, glaciar azul, volcán oscuro, noche de Atacama).
- **Contenido por destino:** lámina con número monumental, relato corto, ficha (duración, dificultad visual, grupo, precio), disponibilidad con fechas casi llenas o agotadas, e imagen secundaria. "Pedir este itinerario" precarga el destino en el formulario.
- **Confianza:** guías con nombre y oficio, cuatro criterios de sostenibilidad en cifras y un formulario conversacional ("Cuéntanos qué quieres sentir").

## Lo que aprendimos en estos cinco

- La fotografía con licencia de Wikimedia en alta resolución (`photos.mjs --source wikimedia --min-width 2400`, elegida en hoja de contactos) sostiene una página editorial; los previews de bancos gratuitos no.
- El texto de lectura nunca va en peso light (ver `premium-bar.md`): fue lo que más delató la primera versión.
- Cada brief necesita **un** gesto propio (planeta que cambia, linterna, memorando censurado, grafo, paleta por mundo), y que ese gesto sirva al objetivo de negocio: compartir, filtrar, entender, comprar, reservar.
