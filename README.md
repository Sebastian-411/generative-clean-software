# architecture-mastery

Marketplace open source con un solo plugin que combina **DDD + Arquitectura Hexagonal + Clean Architecture + SOLID + Design Patterns** en un criterio coherente, con foco explícito en no caer en overengineering.

Funciona en **Claude Code**, **Cursor**, **Codex** y **OpenCode**. Las skills y agentes se escriben una vez en `plugins/architecture-mastery/`; cada host solo añade su manifiesto.

En un repo existente las skills siguen el stack que ya está. En un proyecto desde 0 el default es monorepo **Next.js + Astro + NestJS hexagonal**, con Docker por app y un compose raíz que levanta backend y frontends juntos (skill `greenfield-defaults`).

## Instalación

Repo: [Sebastian-411/generative-clean-software](https://github.com/Sebastian-411/generative-clean-software).

### Cursor

En **Customize** importa el repo (From GitHub Repository) o, en un Team plan, **Dashboard → Plugins & MCPs → Import from Repo**.

Cursor detecta `.cursor-plugin/marketplace.json`. Después instala `architecture-mastery`.

Para probar en local sin marketplace: copia `plugins/architecture-mastery` a `~/.cursor/plugins/local/architecture-mastery` (tiene que ser copia, no un symlink fuera de esa carpeta), recarga la ventana y revísalo en Customize.

### Codex

```
codex plugin marketplace add Sebastian-411/generative-clean-software
```

O, si ya clonaste este repo, Codex descubre `.agents/plugins/marketplace.json` solo. Actívalo en `.codex/config.toml` (ya viene en el repo):

```toml
[plugins."architecture-mastery@architecture-mastery"]
enabled = true
```

Los agentes custom de este repo viven en `.codex/agents/`. Si instalas el plugin en otro proyecto y quieres los mismos agentes, copia esa carpeta a `.codex/agents/` del proyecto (o a `~/.codex/agents/`). Las skills viajan con el plugin; los agentes TOML de Codex son overlay de proyecto.

### OpenCode

Clona el repo y ábrelo: `opencode.json` apunta a las skills y declara los 6 agentes.

En otro proyecto, añade esto a tu `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["./ruta/a/generative-clean-software/plugins/architecture-mastery/skills"]
}
```

Copia también el bloque `agent` de este `opencode.json` si quieres los subagentes (`@architecture-reviewer`, etc.). Las skills orquestadoras `architecture-review` y `staff-workflow` se exponen como `/architecture-review` y `/staff-workflow`.

### Claude Code

```
/plugin marketplace add Sebastian-411/generative-clean-software
/plugin install architecture-mastery@architecture-mastery
```

## Qué incluye

| Skill | Para qué |
|---|---|
| `architecture-review` | Orquestador — punto de entrada para diseñar o revisar arquitectura completa |
| `staff-workflow` | Orquestador multi-agente — desarrollo de punta a punta, con proceso escalado al riesgo del cambio |
| `greenfield-defaults` | Scaffold desde 0 — monorepo Next.js + Astro + NestJS hexagonal, Docker por app y compose raíz |
| `frontend-craft` | UI/UX — landings cinematográficas, apps simples y hermosas, `packages/ui`, Playwright de diseño |
| `domain-driven-design` | Entities, Value Objects, Aggregates, Bounded Contexts, lenguaje ubicuo |
| `hexagonal-architecture` | Ports & Adapters, driving/driven, aislar el dominio del framework |
| `clean-architecture` | Regla de dependencia, Use Cases explícitos, composition root |
| `solid-principles` | SRP, OCP, LSP, ISP, DIP como lente de calidad de clase |
| `design-patterns` | Strategy, Factory, Adapter, Decorator, Observer, Repository, Specification — aplicados solo donde hay variación real |

Todas las skills comparten un mismo principio rector: **cada abstracción debe justificar su existencia con un cambio futuro concreto**. Ninguna skill recomienda un patrón "porque la arquitectura lo dice". `staff-workflow` extiende ese mismo principio al proceso: cada agente que se invoca debe justificarse con el riesgo real del cambio.

## Agentes

| Agente | Acceso | Rol |
|---|---|---|
| `story-writer` | escribe solo `story.md` | Qué y por qué del cambio, criterios de aceptación verificables |
| `architecture-reviewer` | solo lectura | Veredicto de complejidad y diseño antes de escribir código |
| `planner` | escribe solo `plan.md` | Convierte el veredicto en fases chicas y verificables |
| `implementer` | lectura + escritura | Implementa lo mínimo correcto para el problema real |
| `code-reviewer` | solo lectura | Bugs, seguridad básica, simplificación/reuso sobre el diff |
| `test-engineer` | tests + lectura de producción | Tests de negocio y bordes, corre el suite |

`staff-workflow` los orquesta adaptativamente. Para mediano/grande/sensible, `story-writer` y `planner` dejan `story.md`/`plan.md` en `specs/<timestamp>_<slug>/` con un checkpoint de aprobación humana antes de seguir — un solo pase por documento, sin re-analizar lo que otro agente ya resolvió. Todos los agentes también se pueden invocar sueltos.

En cambios sensibles, usa la revisión de seguridad del host (Cursor: `/review-security`; Claude Code: `security-review` si existe). No la sustituyas por el pase básico de `code-reviewer`.

## Cómo está empaquetado

```
.claude-plugin/marketplace.json          # Claude Code
.cursor-plugin/marketplace.json          # Cursor
.agents/plugins/marketplace.json         # Codex
opencode.json                            # OpenCode (skills + agentes)
AGENTS.md                                # instrucciones de proyecto (todos)
plugins/architecture-mastery/
  plugin.json                            # Agent Plugins 1.0 (portable)
  .claude-plugin/plugin.json
  .cursor-plugin/plugin.json
  .codex-plugin/plugin.json
  agents/                                # canónico — Claude + Cursor
  skills/                                # canónico — todos los hosts
.codex/agents/                           # overlay Codex (TOML)
```

Cursor y Codex descubren `skills/` y, en Cursor, también `agents/` dentro del plugin. OpenCode y Codex CLI leen este repo como proyecto vía `opencode.json` / `.codex/`.

## Contribuir

Pull requests bienvenidos. Si agregas una skill nueva, ponla en `plugins/architecture-mastery/skills/<nombre>/SKILL.md` y sigue el frontmatter existente: `name` + `description` con triggers de cuándo SÍ y cuándo NO usarla. No copies la skill a carpetas de host.

Si agregas un agente, escríbelo primero en `plugins/architecture-mastery/agents/` y luego:

1. Cursor/Claude lo descubren solos.
2. Añade la entrada en `opencode.json` (`agent.<nombre>` con `prompt: "{file:...}"`).
3. Añade `.codex/agents/<nombre>.toml` que apunte al markdown canónico.

## Licencia

MIT — ver `LICENSE`.
