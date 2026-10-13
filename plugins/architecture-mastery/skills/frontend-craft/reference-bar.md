# La vara medida — qué hacen de verdad los sitios de alto nivel

Medido con `scripts/dissect.mjs` (Playwright, estilos computados) sobre 10 sitios (Tesla bloquea navegadores automatizados). No son opiniones: son los valores que esas páginas renderizan.

| Sitio | Familias | Titular principal | Cuerpo | Contenedor | Nav | Botón | Motion | Qué ocupa el espacio |
|---|---|---|---|---|---|---|---|---|
| apple.com | 1 (SF Pro) | 56 px / 600 / −0,005 em | 17–21 px | 980–1024 | 44 px, blur | 44 px píldora azul | ninguna | renders y fotos de producto, 100 % de cada tile |
| getvaas.com | 1 (Montserrat) | 61 px / 700 | 15–20 px | 1296 | 72 px | píldora blanca | gsap + three (burbujas de fondo) | capturas reales del producto, logos y citas de clientes reales |
| vozy.ai | 1 (Work Sans) | 37 px / 700 | 15 px / 300 | 1070 | 80 px | 47 px recto, lima | webflow | foto de persona real + UI real + logos de bancos clientes |
| ycombinator.com | 2 (Source Serif + Outfit) | 84 px / 400, itálica de énfasis | 16 px / 300 | 1100 | 64 px | 40 px píldora negra | ninguna | texto editorial, empresas y fundadores reales |
| rockstargames.com/VI | 1 (Art Deco propia) | arte oficial | 16 px | 1066–1150 | 115 px | 50 px píldora rosa | lenis | **key art y video oficiales** (el espectáculo es el asset, no el código) |
| founderdex.ai | 1 (DM Sans) | 72 px / 500 / −0,042 em | 17 px | 1200 | 65 px sticky | 41 px píldora azul | lenis | su grafo de datos real, interactivo; video del producto |
| plada.ai | 1 (Inter) | 25–27 px / 380 | 14 px / 300 | — | 58 px, blur | 34 px píldora negra | lenis | tarjetas pequeñas de UI con datos verosímiles sobre gris claro |
| icesi.edu.co | 1 (Jakarta) | 84 px / light | 14 px | 1200 | 94 px | 43 px recto | ninguna | fotografía institucional real a sangre |
| nike.com | 2 (Helvetica Now + Futura) | 76 px | 16 px | 1344 | 56 px | 46 px píldora | ninguna | fotografía de campaña, producto |
| zolvo.com | 1 (Clother) + itálica serif | 40–52 px / 300–400 | 15–16 px | 1152 | 94 px, blur | 64 px, radio 8 | ninguna | sellos de cumplimiento reales (SOC 2, YC), copy específico |

## Lo que tienen en común (y lo que yo hacía al revés)

1. **Una familia tipográfica** (dos como máximo: serif display + sans). Nunca tres.
2. **Titulares de 40–84 px.** No de 200 px. El tamaño lo da la jerarquía, no el grito.
3. **Tracking casi neutro**: de 0 a −0,04 em solo en display grande. −0,05 em o más se ve "generado".
4. **Contenedor de 1000–1300 px** con gutters generosos. El contenido no va de borde a borde (salvo foto o arte a sangre).
5. **Nav convencional de 44–94 px**, con 4–7 links y un CTA. Nadie reinventa la navegación.
6. **Botón píldora o recto de 34–50 px.** Un color de CTA en toda la página.
7. **Motion: ninguna o Lenis.** Ningún sitio usa grano animado, letterbox, HUDs, velocímetros ni titulares que entran letra por letra. Las 3D que aparecen (Vaas) son fondo, no protagonista.
8. **El espacio lo ocupa contenido real**: el producto (capturas o tarjetas de UI con datos concretos), fotografía o renders de verdad, clientes con nombre, cifras con contexto, sellos de cumplimiento. **Cuando no hay contenido real, ningún efecto lo reemplaza.**
9. **Páginas largas y con información**: 900–1.900 palabras y 6.000–18.000 px de alto. Secciones: anuncio, hero, prueba social, cómo funciona, producto, caso, seguridad o FAQ, CTA y footer completo.
10. **Copy específico**: "Condonar $1.240.000 de intereses", "20,000+ startups", "Pre-Order Now · November 19, 2026". Nombres, montos, fechas.

## Modos (elige por el brief, no por gusto)

| Modo | Cuándo | Referencias | Plantilla |
|---|---|---|---|
| **Producto / B2B** (default) | SaaS, fintech, IA, herramientas, servicios | Plada, Founderdex, Vaas, Zolvo, YC | `templates/product-site/` |
| **Marca / consumo** | Retail, moda, universidad, hardware | Apple, Nike, Icesi | `templates/product-site/` + fotografía a sangre |
| **Brutal de producto** | Consumo joven, bebidas, snacks, moda, gadgets: un producto físico con personalidad | Fizzi, CAN/DO | `templates/anchor-scene/` |
| **Lanzamiento cinematográfico** | Solo si hay **assets oficiales** (key art, video, modelo 3D de la marca) y el brief pide espectáculo | Rockstar VI | `templates/scroll-scene/` |

El modo cinematográfico **no es el default**. Sin arte o 3D de la propia marca, la escena se ve como una demo técnica.

## Modo brutal de producto — medido (Fizzi, CAN/DO)

Medidos con `dissect.mjs` y, para la coreografía, con `scrollscope.mjs` (storyboard del scroll):

| | Fizzi | CAN/DO |
|---|---|---|
| Familias | 1 (Alpino, redonda y pesada) | 3 (Barlow Condensed, Playfair itálica, DM Mono) |
| Tipografía gráfica | 160–490 px, line-height 0,7, mayúsculas | 145–200 px, tracking −0,07 em |
| Cuerpo | 20 px | casi nada (43 palabras) |
| Color | bloques planos por sección: lima, cielo, amarillo, lila, naranja | negro, una tinta lima |
| 3D | **la lata es un personaje que viaja de sección en sección**, encima del texto | fila de latas; la cámara enfoca una y la gira hasta la tabla nutricional |
| Palabras | 173 | 43 |

Aquí la tipografía gigante **sí** es legítima: es composición gráfica alrededor del producto, no relleno. Lo que lo hace funcionar:
1. **El producto 3D es el protagonista** y tiene la identidad de la marca (etiqueta propia), no es un modelo genérico.
2. **Las secciones son 2D, planas y bien diseñadas.** El 3D va encima (`canvas` fijo, `pointer-events: none`) y se posa en anclas del layout, alternando lados.
3. **Un gesto por sección**: palabras que pasan detrás de la lata, el selector que cambia etiqueta y fondo, la lata que gira y muestra su espalda, la caída en el cierre.
4. Nada de grano, letterbox ni HUD. El color plano y la tipografía cargan la energía.

## Proceso de calibración (obligatorio en UI nueva)

1. **Elige 2–3 referencias** de la tabla (o las que dé el usuario) del mismo modo y sector.
2. **Disecciónalas**: `node scripts/dissect.mjs <url> --out design/references/<nombre>`. Lee `dissection.md` y mira `desktop-full.png` y `sections/`. Si tiene 3D o animación ligada al scroll, corre también `node scripts/scrollscope.mjs <url>`: la captura completa no muestra la coreografía; el storyboard sí.
3. **Fija tus tokens dentro de sus rangos**: familia, escala, contenedor, nav, botón y motion. Escríbelos en `design/DESIGN.md` citando de qué referencia sale cada decisión.
4. **Consigue contenido real antes de diseñar**: capturas o tarjetas del producto con datos verosímiles, fotos (`scripts/photos.mjs`, CC0, nunca personas reales junto a citas inventadas), cifras, sellos y casos.
5. **Construye** y compara: `node scripts/compare.mjs <tu-url> --refs design/references/a,design/references/b`. Mira `fold.png`, `sections.png` y `mobile.png` lado a lado y lee `metrics.md`.
6. **Itera hasta que la lámina no delate cuál es la tuya.**
