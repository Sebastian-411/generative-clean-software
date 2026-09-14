---
name: domain-driven-design
description: Modela el dominio de negocio usando Domain-Driven Design - Entities, Value Objects, Aggregates, Bounded Contexts y lenguaje ubicuo. Úsala cuando el usuario pida modelar un dominio complejo, decidir si algo es Entity o Value Object, definir los límites de un Aggregate, separar un monolito en Bounded Contexts, o cuando el negocio tenga reglas e invariantes no triviales. NO la apliques a dominios simples tipo CRUD sin reglas de negocio reales - ahí un modelo anémico simple es preferible.
---

# Domain-Driven Design (DDD)

## Cuándo aplica de verdad

DDD paga cuando el dominio tiene complejidad real: reglas de negocio, invariantes que deben cumplirse siempre, y vocabulario que el negocio usa y que el código debería reflejar. Si el "dominio" es guardar y leer filas de una tabla sin reglas, DDD es sobrecostoso: dilo explícitamente en vez de forzarlo.

## Building blocks

- **Entity**: tiene identidad propia que persiste en el tiempo, aunque sus atributos cambien (ej: `Prestamo`, identificado por su id, aunque cambie de estado).
- **Value Object**: se define por sus atributos, es inmutable, no tiene identidad (ej: `Dinero(monto, moneda)`, `Direccion`). Dos VOs con los mismos valores son iguales. Prefiere VOs sobre primitivos sueltos (`Money` en vez de un `float` + un `string` de moneda flotando por el código) - esto evita bugs de invariantes olvidadas.
- **Aggregate**: un clúster de Entities/VOs con una raíz (Aggregate Root) que es el único punto de entrada externo. Las invariantes del aggregate se protegen SIEMPRE dentro de sus métodos, nunca desde afuera seteando campos.
  - Regla práctica: un aggregate pequeño (idealmente una sola Entity + sus VOs) es casi siempre mejor que uno grande. Aggregates grandes generan contención de escritura y acoplan cosas que no necesitan cambiar juntas.
  - Solo una transacción debe modificar un aggregate a la vez. Referencias entre aggregates van por id, no por objeto cargado.
- **Domain Event**: algo que pasó en el dominio y le importa a otras partes del sistema (ej: `PagoRegistrado`). Se usa para desacoplar efectos secundarios del caso de uso principal. Si el evento dispara cambios en otro aggregate, esos cambios deben quedar dentro de la misma transacción (o un Unit of Work explícito) - un handler que corre "en algún momento después" sin esa garantía es el origen clásico de datos inconsistentes entre aggregates.
- **Repository**: abstracción para recuperar/persistir Aggregates completos (no filas sueltas). Es un driven port en términos hexagonales.
- **Mapper**: traduce entre el modelo de dominio (Entity/Aggregate) y el modelo de persistencia (fila, documento, esquema del ORM). Evita que un cambio de normalización en la DB fuerce un cambio en el dominio. Solo se justifica cuando la forma de persistencia realmente diverge de la forma del dominio (un aggregate que se reparte en varias tablas, un ORM que exige columnas planas); si el modelo de persistencia es idéntico al dominio, un mapper 1:1 es indirection sin beneficio - no lo agregues por costumbre.
- **Domain Service**: lógica de dominio que no pertenece naturalmente a una sola Entity/VO porque involucra a varias.

## Bounded Context

Un Bounded Context es el límite dentro del cual un término del negocio tiene un significado único y consistente. La misma palabra ("Cliente", "Cuenta") puede significar cosas distintas en dos contextos (facturación vs soporte) - eso está bien, no hay que forzar un modelo único para toda la empresa.

Señales de que necesitas separar contextos:
- El mismo término tiene atributos/reglas distintas según el equipo que lo usa.
- Dos equipos negocian constantemente el significado de una entidad compartida.
- Un cambio en un módulo rompe reglas en otro que "no debería" estar relacionado.

## Lenguaje ubicuo

El código debe usar los mismos nombres que usa el negocio, dentro de cada Bounded Context. Si el negocio dice "desembolso" y el código dice `disburse()`, tradúcelo, o mejor, adopta el término del negocio directamente si el equipo es hispanohablante.

## Anti-patrones a señalar

- **Modelo anémico forzado a "rico"**: envolver un DTO plano en clases con getters/setters y llamarlo "Entity" no es DDD.
- **Aggregate God-object**: un aggregate que incluye media base de datos "por si acaso".
- **Anemic aggregate root**: exponer setters públicos que permiten romper invariantes desde afuera.
- **DDD táctico sin DDD estratégico**: usar Entities/VOs con nombres elegantes pero sin haber pensado los Bounded Contexts ni el lenguaje ubicuo - suele producir el mismo acoplamiento de siempre con más ceremonia.

## Checklist de revisión

1. ¿Cada invariante de negocio se protege dentro del aggregate, o se puede romper seteando un campo desde afuera?
2. ¿Hay primitivos sueltos que deberían ser Value Objects (dinero, email, rango de fechas)?
3. ¿El aggregate es lo más pequeño posible dado lo que realmente debe ser transaccionalmente consistente?
4. ¿El vocabulario del código coincide con el que usa el negocio en ese contexto?
5. ¿Se está modelando complejidad que no existe? Si el dominio es simple, dilo y no impongas el patrón.

## Referencias conceptuales (no reproducir texto, solo ideas)

Eric Evans (*Domain-Driven Design*), Vaughn Vernon (*Implementing Domain-Driven Design*).
