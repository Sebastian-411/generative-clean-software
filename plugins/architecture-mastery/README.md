# architecture-mastery (plugin)

DDD + Hexagonal + Clean Architecture + SOLID + Design Patterns, como un solo set de skills para Claude Code — más un flujo multi-agente que reproduce cómo un staff engineer escala su proceso según el riesgo del cambio.

Empieza siempre por `architecture-review`: decide primero si la complejidad se justifica, y solo entonces invoca al resto de skills en orden (dominio -> fronteras -> SOLID -> patrones).

Para desarrollo de punta a punta (spec + diseñar + implementar + revisar + testear), usa la skill `staff-workflow`: clasifica el cambio (trivial/pequeño/mediano/sensible) y solo entonces decide a cuáles de estos agentes invocar. Para mediano/grande/sensible, antes de tocar código pasa por `story.md` y `plan.md` en `specs/` con aprobación humana en cada checkpoint - inspirado en Spec-Driven Development, pero con disciplina de un solo pase por documento para que no se vuelva lento.

| Agente | Acceso | Rol |
|---|---|---|
| `story-writer` | escribe solo `story.md` | Qué y por qué del cambio, criterios de aceptación verificables |
| `architecture-reviewer` | solo lectura | Veredicto de complejidad y diseño antes de escribir código |
| `planner` | escribe solo `plan.md` | Convierte el veredicto en fases chicas y verificables |
| `implementer` | lectura + escritura | Implementa lo mínimo correcto, fase por fase |
| `code-reviewer` | solo lectura | Bugs, seguridad básica, simplificación/reuso sobre el diff |
| `test-engineer` | tests + lectura de producción | Tests de negocio y bordes, corre el suite |

Ver el README raíz del repo para la tabla completa de skills.
