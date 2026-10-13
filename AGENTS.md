# architecture-mastery

Este repo es un plugin multi-host (Claude Code, Cursor, Codex, OpenCode). El criterio canónico vive en `plugins/architecture-mastery/`. No dupliques skills ni agentes.

## Punto de entrada

- Pregunta de diseño o "¿esto está sobre-diseñado?" → skill `architecture-review`.
- Feature/fix de punta a punta → skill `staff-workflow`.
- Revisión suelta de un diff → agente `code-reviewer`.

## Agentes

| Agente | Acceso | Rol |
|---|---|---|
| `story-writer` | escribe `story.md` | Qué, por qué, criterios de aceptación |
| `architecture-reviewer` | solo lectura | Veredicto de complejidad y diseño |
| `planner` | escribe `plan.md` | Fases chicas y verificables |
| `implementer` | lectura + escritura | Mínimo código correcto |
| `code-reviewer` | solo lectura | Bugs, seguridad básica, simplificación |
| `test-engineer` | solo tests | Casos de negocio y bordes |
| `design-scout` | escribe `design/` + assets | Dirección de arte: referencias reales, DESIGN.md, crítica visual |

Cada agente y cada abstracción deben justificar su existencia. Un typo no pasa por cuatro agentes. Un CRUD sin reglas no necesita más patrones de los del scaffold.

## Proyecto desde 0

Si la carpeta está vacía o no hay stack, usa `greenfield-defaults` sin preguntar lenguaje:

- Monorepo `apps/web` (Next.js), `apps/site` (Astro), `apps/api` (NestJS hexagonal).
- Cada app: su `Dockerfile`, su imagen y su `docker-compose.yml`.
- Raíz: `docker-compose.yml` que construye y levanta backend y frontends a la vez.
- Hexagonal solo en el API. El usuario puede overridear piezas; el resto se mantiene.
- UI: skill `frontend-craft`. Antes de construir, `design-scout` investiga referencias reales (Refero, Watermelon, Motion-Primitives, Haikei, 21st.dev; UI/UX Pro Max solo como fuente filtrada) y fija `design/DESIGN.md`; se construye por secciones (hero primero) y se itera con capturas 1440/390 + rúbrica premium hasta pasar. Calibra contra referencias medidas (`dissect.mjs`, `reference-bar.md`) y compara lado a lado (`compare.mjs`). Sitios (Astro) sobre `templates/product-site` (default), `templates/anchor-scene` para producto físico con personalidad (el 3D viaja por la página) y `templates/scroll-scene` solo para lanzamientos con assets oficiales; briefs experimentales con las piezas de `templates/patterns` (ver `briefs.md`); movimiento en Next con `templates/motion`; apps (Next) sobre `templates/app-shell` (una acción por pantalla, estados diseñados, ⌘K, `app.spec.ts`). Componentes en `packages/ui`.

## Hosts

- Cursor carga el plugin vía `.cursor-plugin/` y también este `AGENTS.md`.
- Codex carga skills vía `.agents/plugins/marketplace.json` + `.codex-plugin/`; agentes en `.codex/agents/`.
- OpenCode carga skills y agentes vía `opencode.json`.
- Claude Code sigue usando `.claude-plugin/`.
