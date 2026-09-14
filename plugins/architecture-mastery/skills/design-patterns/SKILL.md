---
name: design-patterns
description: Elige o revisa el uso de patrones de diseño GoF (Strategy, Factory, Adapter, Decorator, Observer, Repository, etc.) en el contexto de un backend con DDD/Hexagonal/Clean Architecture. Úsala cuando el usuario pida sugerir un patrón para un problema concreto, nombrar un patrón que ya está usando sin saberlo, o revisar si un patrón fue aplicado donde no hacía falta. Aplica siempre junto con el criterio anti-overengineering: nombrar el patrón correcto para el código simple que ya funciona no es una mejora.
---

# Design Patterns (GoF) aplicados a arquitectura backend

## Cómo usar esta skill

No sugieras un patrón porque "es lo que se espera" en una arquitectura hexagonal/DDD. Sugiérelo cuando resuelve un problema de variación real: algo que hoy tiene 2+ variantes, o que se sabe con certeza razonable que las va a tener pronto. Para cada patrón sugerido, di explícitamente qué problema concreto resuelve en ese código.

## Patrones más relevantes en este contexto

### Strategy
Encapsula un algoritmo intercambiable detrás de una interfaz (ej: distintas formas de calcular una comisión). Reemplaza `if/switch` que crecen con cada tipo nuevo. Encaja directamente con el Open/Closed Principle y con los driven ports de Hexagonal.

### Factory / Factory Method
Centraliza la creación de objetos complejos o con lógica de selección de tipo concreto, para que el código cliente no dependa de clases concretas. Útil cuando construir el objeto correcto depende de datos de entrada (ej: elegir qué `PagoProcessor` según el método de pago). Evítalo si solo hay un `new` simple sin variación real - un constructor directo es más claro.

### Adapter
Traduce la interfaz de un sistema externo (SDK, librería, API de terceros) a la interfaz que espera tu core. Es literalmente el "adapter" de la arquitectura hexagonal, aplicado a nivel de patrón de código: por ejemplo, envolver un SDK de un proveedor de pagos detrás de tu propio `PaymentGateway` port.

### Decorator
Añade comportamiento a un objeto sin modificar su clase, envolviéndolo. Útil para cross-cutting concerns sobre un puerto (logging, retries, caching) sin ensuciar la implementación principal - por ejemplo, un `CachedPagoRepository` que envuelve al repository real.

### Observer / Domain Events
Notifica a otras partes del sistema que algo pasó, sin acoplar al emisor con cada consumidor. En DDD esto se modela como Domain Events publicados desde el aggregate y consumidos por handlers independientes.

### Repository
No es un patrón GoF puro, pero es central aquí: abstrae el acceso a persistencia de un Aggregate completo detrás de una interfaz orientada al dominio (`buscarPorId`, `guardar`), no orientada a SQL. Vive como driven port.

### Specification
Encapsula una regla de negocio evaluable (ej: `EsElegibleParaDescuento`) como un objeto combinable (`and`, `or`, `not`), útil para reglas de elegibilidad complejas que si no se aíslan terminan repetidas en varios lugares.

## Anti-patrones de uso de patrones

- **Pattern-itis**: aplicar Factory + Strategy + Decorator a un caso con una sola variante conocida y sin planes de crecer.
- **God Factory**: una fábrica que termina conociendo y construyendo medio sistema.
- **Singleton como excusa de estado global**: en la mayoría de backends modernos con DI, un singleton manual es peor que dejar que el contenedor de DI maneje el ciclo de vida.

## Checklist de revisión

1. ¿El patrón sugerido resuelve una variación real (2+ implementaciones hoy, o certeza razonable de que las habrá)?
2. ¿El nombre del patrón usado coincide con lo que el código realmente hace, o es un patrón mal aplicado con el nombre correcto?
3. ¿Hay patrones apilados (Factory de Strategy de Decorator) para un problema que un `if` resolvería igual de bien?
4. ¿El patrón introduce una interfaz que hexagonal-architecture o solid-principles ya cuestionarían por no tener una segunda implementación real?

## Referencias conceptuales (no reproducir texto, solo ideas)

Gang of Four - Gamma, Helm, Johnson, Vlissides (*Design Patterns*), Martin Fowler (*Patterns of Enterprise Application Architecture*, Specification pattern).
