---
name: clean-architecture
description: Aplica o revisa Clean Architecture - la regla de dependencia (las capas internas no conocen las externas), Use Cases explícitos, y frameworks/DB relegados a los bordes. Úsala cuando el usuario pida estructurar capas de un backend, decidir qué va en cada capa, o auditar si el código de negocio depende de un framework o de la base de datos. Se solapa con hexagonal-architecture; úsalas juntas cuando el usuario pida "clean + hexagonal" y evita duplicar el mismo consejo dos veces.
---

# Clean Architecture

## La regla de dependencia

El código fuente solo puede depender hacia adentro. Nada en un círculo interno puede conocer nada de un círculo externo, incluyendo nombres, tipos o anotaciones de un framework.

```
Frameworks & Drivers (web, DB, UI, devices)
        -> Interface Adapters (controllers, presenters, gateways)
                -> Application Business Rules (Use Cases)
                        -> Enterprise Business Rules (Entities)
```

Las flechas de dependencia (imports) van hacia adentro. Las flechas de control (quién llama a quién) pueden ir hacia afuera, pero cruzando la frontera con una interfaz definida en el círculo interno (Dependency Inversion) - lo mismo que un driven port en hexagonal.

## Use Cases explícitos

Cada acción relevante del negocio debería tener un Use Case nombrado con el verbo del negocio (`RegistrarPago`, `AprobarSolicitud`), no un `Service` genérico con quince métodos sin relación. Un Use Case:
- Recibe un input (DTO o comando), no un objeto HTTP crudo.
- Orquesta Entities y puertos de salida.
- No sabe si lo llamó un controller REST, un cron o un test.

## Relación con Hexagonal y con DDD

Clean Architecture, Hexagonal y Onion son variantes del mismo principio (dependencias hacia el dominio, frameworks en los bordes) con nombres de capas distintos. En la práctica:
- Hexagonal habla en términos de puertos/adapters.
- Clean Architecture habla en términos de capas concéntricas y Use Cases.
- DDD aporta el modelado del dominio que vive en el centro de ambas.

No trates estas tres cosas como sistemas en competencia: son ángulos del mismo problema. Si el usuario pide las tres, aplica un solo vocabulario consistente en vez de mezclar tres jergas en el mismo archivo.

## Composition Root

Todo el "wiring" (qué implementación concreta de cada interfaz se usa) vive en un solo lugar, típicamente en el punto de entrada de la app (`main`, `bootstrap`, configuración de DI). Ningún archivo de dominio o de application debería instanciar una clase concreta de infraestructura con `new`.

## Señales de violación comunes

- Una Entity o Use Case con un import de un ORM, un framework web, o un SDK de nube.
- Anotaciones de framework (`@Entity`, `@Component`, decoradores de un ORM) puestas directamente sobre las clases de dominio en vez de en un modelo de persistencia separado.
- Lógica de negocio dentro de un controller porque "es más rápido".
- Tests de Use Cases que necesitan levantar HTTP o DB real para pasar.

## Cuándo NO vale la pena

Un script, una función pura, o un servicio de una sola operación sin reglas de negocio no necesita cuatro capas. Aplicar Clean Architecture ahí produce indirection sin beneficio: dilo directamente.

## Checklist de revisión

1. ¿Hay algún import que rompa la regla de dependencia (interno -> externo)?
2. ¿Existen Use Cases nombrados con verbos del negocio, o solo un `Service` fourre-tout?
3. ¿El wiring de dependencias concretas está centralizado en un composition root?
4. ¿Se puede testear un Use Case sin infraestructura real?
5. ¿La cantidad de capas está justificada por la complejidad real del sistema?

## Referencias conceptuales (no reproducir texto, solo ideas)

Robert C. Martin (*Clean Architecture*), Jason Taylor (Clean Architecture template .NET), Tom Hombergs.
