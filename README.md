# architecture-mastery

Marketplace open source de Claude Code con un solo plugin que combina **DDD + Arquitectura Hexagonal + Clean Architecture + SOLID + Design Patterns** en un criterio coherente, con foco explícito en no caer en overengineering.

Pensado para stacks tipo Go + Spring Boot, pero las skills son agnósticas de lenguaje.

## Instalación

```
/plugin marketplace add tu-usuario/architecture-mastery
/plugin install architecture-mastery@architecture-mastery
```

(Reemplaza `tu-usuario` por tu cuenta de GitHub una vez publiques el repo.)

## Qué incluye

| Skill | Para qué |
|---|---|
| `architecture-review` | Orquestador — punto de entrada para diseñar o revisar arquitectura completa |
| `staff-workflow` | Orquestador multi-agente — desarrollo de punta a punta, con proceso escalado al riesgo del cambio |
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

`staff-workflow` los orquesta adaptativamente. Para mediano/grande/sensible, `story-writer` y `planner` dejan `story.md`/`plan.md` en `specs/<timestamp>_<slug>/` con un checkpoint de aprobación humana antes de seguir - un solo pase por documento, sin re-analizar lo que otro agente ya resolvió, para que la ganancia en calidad de la spec no salga a costa de velocidad. Todos los agentes también se pueden invocar sueltos ("usa el agente code-reviewer").

## Estructura del repo

```
.claude-plugin/
  marketplace.json
plugins/
  architecture-mastery/
    .claude-plugin/
      plugin.json
    agents/
      story-writer.md
      architecture-reviewer.md
      planner.md
      implementer.md
      code-reviewer.md
      test-engineer.md
    skills/
      architecture-review/SKILL.md
      staff-workflow/SKILL.md
      domain-driven-design/SKILL.md
      hexagonal-architecture/SKILL.md
      clean-architecture/SKILL.md
      solid-principles/SKILL.md
      design-patterns/SKILL.md
```

## Contribuir

Pull requests bienvenidos. Si agregas una skill nueva, regístrala en `plugins/architecture-mastery/.claude-plugin/plugin.json` (si aplica) y sigue el formato de frontmatter de las skills existentes: `name` + `description` con triggers explícitos de cuándo SÍ y cuándo NO usarla.

## Licencia

MIT — ver `LICENSE`.
