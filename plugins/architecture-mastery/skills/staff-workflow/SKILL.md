---
name: staff-workflow
description: Orquesta a los agentes story-writer, architecture-reviewer, planner, implementer, code-reviewer y test-engineer de este plugin como un único proceso de desarrollo adaptativo, igual que lo escalaría un staff engineer - más proceso (con story.md/plan.md en specs/ y checkpoints de aprobación humana) para un cambio grande y riesgoso, casi nada de proceso para un cambio trivial. Úsala cuando el usuario pida implementar una feature o fix "de punta a punta", diga algo como "hazlo como lo haría un staff engineer" o "quiero todo el proceso", o cuando el pedido claramente involucra diseñar + planear + escribir + revisar + testear en una sola tarea. No la uses para una pregunta puntual de arquitectura (usa architecture-review) o una revisión suelta de código ya escrito (invoca code-reviewer directo).
metadata:
  opencode/slash: "true"
---

# Flujo de desarrollo adaptativo (staff engineer)

Un staff engineer no aplica el mismo proceso a un typo que a un módulo nuevo con reglas de negocio. Esta skill decide cuánto proceso aplicar antes de aplicarlo - el criterio de "no sobre-diseñar" de `architecture-review` se extiende aquí al proceso mismo: no sobre-procesar un cambio trivial.

## Paso 0 — Clasifica el cambio antes de invocar a nadie

Si el pedido es un proyecto desde 0 o la carpeta está vacía, clasifícalo como **mediano/grande** (o **sensible** si toca auth/pagos/PII) y pasa `greenfield-defaults` + `frontend-craft` como restricción fija a `architecture-reviewer`, `planner` e `implementer`: monorepo, Next.js + Astro + NestJS hexagonal, Docker por app y compose raíz, UI de producción (landing trailer / app simple), Playwright de diseño. No dejes que elijan otro stack ni un frontend de template.

Responde tú mismo, en el hilo principal, sin gastar un subagente en esto:

1. **Trivial**: typo, copy, ajuste de config, un valor constante, un fix de una línea sin lógica de negocio nueva.
2. **Pequeño**: bug fix acotado a una función/clase existente, sin nuevas abstracciones ni cambios de contrato.
3. **Mediano/grande**: feature nueva, nuevo módulo, nuevas reglas de negocio, cambio de contrato entre componentes, algo que va a vivir meses/años.
4. **Sensible**: cualquiera de los anteriores si además toca auth, pagos, datos personales, permisos, o una migración de datos.

## Paso 1 — Rutea según la clasificación

- **Trivial**: implementa el cambio tú mismo, inline, sin invocar ningún agente. Pedirle a cuatro agentes que opinen sobre un typo es la forma de overengineering que este plugin existe para evitar.
- **Pequeño**: invoca `implementer` con el encargo concreto, y luego `code-reviewer` sobre el diff resultante. Sin `architecture-reviewer` ni `test-engineer` salvo que el fix toque una regla de negocio real (en ese caso, agrega `test-engineer`).
- **Mediano/grande**: pipeline de spec + implementación, en este orden - ver Paso 1bis para la disciplina de velocidad, que es tan obligatoria como el orden mismo:
  1. `architecture-reviewer` sobre el diseño propuesto (o sobre el código existente si es una refactorización) - obtén el veredicto de complejidad y las fronteras antes de escribir una sola línea o una sola story.
  2. `story-writer`, con el pedido original del usuario y el veredicto del paso anterior - produce `specs/<ts>_<slug>/story.md` (qué, por qué, criterios de aceptación). **Checkpoint**: muestra la story al usuario y espera su aprobación explícita (o el ajuste puntual que pida) antes de seguir.
  3. `planner`, con `story.md` + el veredicto de `architecture-reviewer` - produce `plan.md` en la misma carpeta, con fases chicas y verificables. **Checkpoint**: muestra el plan y espera aprobación antes de tocar código.
  4. `implementer`, fase por fase según `plan.md` - no le pases el plan completo como "implementa todo esto", dale una fase a la vez y confirma que pasó sus tests antes de avanzar a la siguiente.
  5. `code-reviewer` y `test-engineer` sobre el resultado completo de `implementer` - estos dos pueden ir en paralelo, uno no bloquea al otro porque los dos solo leen el mismo diff.
- **Sensible**: lo anterior según tamaño, más una pasada explícita de seguridad del host antes de dar el trabajo por cerrado. En Cursor usa `/review-security`. En Claude Code, la skill `security-review` si está disponible. En Codex u OpenCode, una revisión de seguridad dedicada (agente o prompt explícito). No la sustituyas por el pase básico de `code-reviewer` — ese es un filtro rápido, no el análisis completo.

## Paso 1bis — Disciplina de velocidad en Story/Plan (no negociable)

Esta capa de spec existe para tener mejores requisitos y un plan verificado, no para convertir cada feature en una ceremonia de veinte minutos. Si el pipeline de story/plan se siente lento, algo se está haciendo mal - no es el costo normal de hacerlo bien:

- `story-writer` y `planner` hacen **un solo pase cada uno**. Ninguno de los dos vuelve a explorar el repo a fondo ni re-deriva un análisis que otro agente ya hizo - `planner` reempaqueta el veredicto de `architecture-reviewer`, no lo repite.
- En cada checkpoint, si el usuario pide un ajuste puntual ("cambia este criterio de aceptación", "la fase 2 y 3 deberían ser una sola"), aplica el ajuste directo sobre el archivo existente - nunca vuelvas a invocar el agente completo para regenerar el documento desde cero.
- Si `story.md` o `plan.md` no caben en una pantalla, el cambio probablemente es más grande de lo que Paso 0 asumió - dilo y considera partirlo, no alargues el documento.
- Estos dos checkpoints reemplazan al ida-y-vuelta informal que normalmente pasaría en el chat - no agregues además una ronda extra de "¿estás seguro?" tuya encima de la aprobación del usuario.

## Paso 2 — Ciclo de corrección acotado

Si `code-reviewer` o `test-engineer` encuentran algo real (no solo estilo), vuelve a invocar `implementer` con esos hallazgos concretos para que los corrija, y repite la revisión. Máximo dos vueltas de este ciclo - si al tercer intento sigue habiendo hallazgos reales, detente y repórtalo al usuario en vez de seguir iterando solo.

## Paso 3 — Cierre

Al terminar, entrega al usuario, en este orden:

1. Clasificación del Paso 0 y por qué (qué agentes se invocaron y cuáles se saltaron deliberadamente).
2. Qué se implementó, con archivo:línea de los puntos clave.
3. Qué encontró la revisión de código y qué se corrigió (o por qué no, si algo quedó abierto).
4. Resultado de los tests.
5. Qué quedó deliberadamente simple y por qué - la misma disciplina anti-overengineering de `architecture-review`, aplicada de punta a punta.

Si el cambio pasó por el pipeline de spec (mediano/grande/sensible), escribe además `specs/<ts>_<slug>/resume.md` con este mismo resumen de 5 puntos - queda como trazabilidad junto a `story.md` y `plan.md`, útil para la descripción del PR. Los cambios trivial/pequeño no generan carpeta en `specs/` - reportar en el chat basta.

## Cuándo NO usar esta skill

Si el usuario ya te dio el diseño completo y solo quiere que escribas el código, invoca `implementer` directo - correr el Paso 0 encima sería el mismo overengineering de proceso que esta skill busca evitar. Si solo quiere una opinión de arquitectura sin tocar código, usa `architecture-review` o el agente `architecture-reviewer` directamente, sin el resto del pipeline.
