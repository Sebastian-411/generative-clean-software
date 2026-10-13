# app-shell — pantalla de aplicativo sencilla y hermosa

Referencia de cómo se siente una pantalla de app en este sistema: la misma marca que la landing (fuente, acento, radios), con otra energía.

## Reglas que encarna

- **Una acción primaria** por pantalla (`data-cta-primary`); todo lo demás es secundario o silencioso.
- **Happy path en ≤ 3 interacciones**; tareas cortas en una **hoja lateral** (sheet), no en una página nueva.
- **Errores junto al campo**, foco al primer campo inválido, botón con estado de carga, estado de éxito propio.
- **Cuatro estados diseñados** en cada lista: carga (skeleton), vacío (con explicación y siguiente paso), error (con reintentar), datos.
- **⌘K** para todo; navegación lateral en desktop, tab bar en mobile.
- Hoja/diálogo cerrado = `inert` + `visibility:hidden` (no solo fuera de pantalla).
- Cero 3D, cero fondos animados. El producto aparece como render fijo (`still.mjs`) reutilizado de la landing.

## Correr

```bash
npx http-server -p 4802 -s .
npx playwright test          # app.spec.ts, desktop + mobile
node ../../scripts/shoot.mjs http://localhost:4802 --mode app --out design/shots/app-1
```

En Next.js (`apps/web`) cada bloque es un componente de `packages/ui` (`Sidebar`, `PageHeader`, `Card`, `Steps`, `Sheet`, `Field`, `EmptyState`, `CommandMenu`, `Toast`); la pantalla solo compone.
