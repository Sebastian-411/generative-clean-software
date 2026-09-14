---
name: architecture-review
description: Orquesta domain-driven-design, hexagonal-architecture, clean-architecture, solid-principles y design-patterns como un solo criterio coherente para diseñar backends nuevos o auditar código existente. Úsala como punto de entrada cuando el usuario pida "diseña esto con DDD + Hexagonal + Clean + SOLID", pida una revisión de arquitectura general, o pregunte si su código está sobre-diseñado o mal diseñado. Esta skill decide primero si la complejidad se justifica, antes de aplicar cualquier patrón - evitar overengineering es el criterio, no una excepción.
---

# Revisión y diseño de arquitectura (skill orquestadora)

Esta skill combina domain-driven-design, hexagonal-architecture, clean-architecture, solid-principles y design-patterns bajo un único flujo de decisión, en vez de aplicarlas como cinco checklists independientes que pueden contradecirse entre sí.

## Paso 0 — Siempre primero: ¿la complejidad se justifica?

Antes de sugerir cualquier patrón o capa, responde:

1. ¿Cuánta lógica de negocio real hay (reglas, invariantes, cálculos que cambian con el tiempo)?
2. ¿Cuántos actores/consumidores distintos van a usar esto, y con qué probabilidad de cambio de infraestructura (DB, framework, protocolo)?
3. ¿Este código va a vivir meses/años, o es desechable?

Si la respuesta es "poca lógica, un solo consumidor, vida corta": la recomendación correcta es simplicidad — un service plano, sin capas ni interfaces de más. Dilo explícitamente. No conviertas un CRUD en una demo de arquitectura.

Solo si hay complejidad real, avanza a los pasos siguientes.

## Paso 1 — Modelar el dominio (usa domain-driven-design)

Identifica Entities, Value Objects y dónde están las invariantes reales de negocio. Define el Aggregate más pequeño que mantenga la consistencia transaccional necesaria. Si hay más de un Bounded Context involucrado, sepáralos antes de seguir.

## Paso 2 — Definir las fronteras del sistema (usa hexagonal-architecture + clean-architecture)

Con el dominio ya modelado, decide:
- Qué entra por driving ports (casos de uso invocables desde afuera).
- Qué sale por driven ports (persistencia, servicios externos, mensajería).
- Dónde vive el composition root que conecta implementaciones concretas.

Usa el vocabulario de puertos/adapters o de capas concéntricas indistintamente - son el mismo modelo. No dupliques ambos vocabularios en el mismo diseño.

## Paso 3 — Verificar con SOLID a nivel de clase (usa solid-principles)

Con las fronteras definidas, revisa cada clase nueva: ¿responsabilidad única real?, ¿depende de abstracciones y no de concreciones?, ¿las interfaces son del tamaño correcto? SOLID aquí es un lente de calidad sobre el diseño ya hecho en el paso 2, no un motivo para crear interfaces adicionales.

## Paso 4 — Elegir patrones solo donde hay variación real (usa design-patterns)

Aplica Strategy/Factory/Adapter/Decorator/Specification únicamente donde el paso 1-3 ya reveló una variación concreta (2+ implementaciones esperadas). Si no la hay, no introduzcas el patrón todavía - un comentario indicando dónde extendería en el futuro es suficiente.

## Paso 5 — Cerrar con una crítica activa (rol de architecture reviewer)

Antes de entregar el diseño o la revisión, hazte estas preguntas y respóndelas explícitamente en la salida:

1. ¿Qué parte de este diseño podría eliminarse sin perder ninguna propiedad importante (testabilidad, capacidad real de reemplazar infraestructura)?
2. ¿Hay una interfaz con una sola implementación real y sin necesidad de test doble? -> candidata a eliminar.
3. ¿El dominio importa algo de infraestructura? -> corregir.
4. ¿El diccionario de nombres (lenguaje ubicuo) es consistente entre código y negocio?
5. ¿Esto es lo mínimo necesario para la complejidad real del problema, o es una demo de patrones?

## Formato de salida recomendado

Cuando diseñes algo desde cero, entrega en este orden: (1) veredicto de complejidad del Paso 0, (2) modelo de dominio, (3) puertos/capas, (4) patrones aplicados con su justificación puntual, (5) qué se dejó deliberadamente simple y por qué.

Cuando revises código existente, entrega: (1) violaciones reales encontradas con ejemplo concreto, (2) sobre-ingeniería encontrada (si la hay) con la misma seriedad que las violaciones, (3) las 2-3 correcciones de mayor impacto primero.
