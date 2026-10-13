# architecture-mastery (plugin)

DDD + Hexagonal + Clean Architecture + SOLID + Design Patterns, como un solo set de skills — más un flujo multi-agente que reproduce cómo un staff engineer escala su proceso según el riesgo del cambio.

Compatible con Claude Code, Cursor, Codex y OpenCode. El contenido canónico es esta carpeta (`skills/` + `agents/`). Los manifiestos por host viven al lado (`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `plugin.json` portable).

Empieza siempre por `architecture-review`: decide primero si la complejidad se justifica, y solo entonces invoca al resto de skills en orden (dominio -> fronteras -> SOLID -> patrones). Si el pedido es un proyecto desde 0, aplica además `greenfield-defaults` (monorepo Next.js + Astro + NestJS hexagonal, Docker por app y compose raíz). Toda UI sigue `frontend-craft`: el agente `design-scout` investiga referencias reales (Refero Styles, Watermelon UI, Motion-Primitives, Haikei, 21st.dev; UI/UX Pro Max como fuente filtrada) con Playwright y fija un `DESIGN.md`; se construye por secciones y se itera con capturas + rúbrica premium hasta que la página se ve de agencia, no generada por IA. Antes, se calibra contra sitios reales medidos (`dissect.mjs`, `reference-bar.md`) y se compara lado a lado (`compare.mjs`). Trae plantillas probadas con Playwright: `product-site` (default), `app-shell`, `anchor-scene` (producto 3D que viaja por la página), `scroll-scene` (lanzamiento cinematográfico), `motion` (presets de Motion para Next) y `patterns` (piezas de cinco briefs resueltos, ver `briefs.md`).

Para desarrollo de punta a punta (spec + diseñar + implementar + revisar + testear), usa la skill `staff-workflow`: clasifica el cambio (trivial/pequeño/mediano/sensible) y solo entonces decide a cuáles de estos agentes invocar. Para mediano/grande/sensible, antes de tocar código pasa por `story.md` y `plan.md` en `specs/` con aprobación humana en cada checkpoint — inspirado en Spec-Driven Development, pero con disciplina de un solo pase por documento para que no se vuelva lento.

| Agente | Acceso | Rol |
|---|---|---|
| `story-writer` | escribe solo `story.md` | Qué y por qué del cambio, criterios de aceptación verificables |
| `architecture-reviewer` | solo lectura | Veredicto de complejidad y diseño antes de escribir código |
| `planner` | escribe solo `plan.md` | Convierte el veredicto en fases chicas y verificables |
| `implementer` | lectura + escritura | Implementa lo mínimo correcto, fase por fase |
| `code-reviewer` | solo lectura | Bugs, seguridad básica, simplificación/reuso sobre el diff |
| `test-engineer` | tests + lectura de producción | Tests de negocio y bordes, corre el suite |
| `design-scout` | escribe `design/` + assets | Dirección de arte con navegador: referencias reales, 3 direcciones, DESIGN.md, crítica visual por rondas |

Ver el README raíz del repo para instalación por host y la tabla completa de skills.
