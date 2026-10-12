---
name: hexagonal-architecture
description: Diseña o revisa un backend usando Arquitectura Hexagonal (Ports & Adapters) - separar el dominio/aplicación de frameworks, DB, colas y HTTP mediante puertos e interfaces. Úsala cuando el usuario pida diseñar un servicio nuevo, aislar el dominio de un framework (NestJS, Spring, Express, Django, etc.), decidir dónde va una interfaz o un adapter, o revisar si una capa está filtrando detalles de infraestructura hacia el dominio. En un proyecto desde 0, NestJS hexagonal es el default de `greenfield-defaults`. NO la apliques si el proyecto es un script pequeño, un CRUD trivial o un prototipo desechable - primero evalúa si la complejidad la justifica.
---

# Arquitectura Hexagonal (Ports & Adapters)

## Idea central

Todo lo que puede cambiar por una decisión externa (framework, DB, broker, proveedor de pagos, HTTP vs gRPC) debe poder cambiarse sin tocar la lógica de negocio. La pregunta que gobierna cada decisión de diseño es:

> ¿Qué parte de este sistema debería sobrevivir si mañana cambio el framework, la base de datos, el broker o el protocolo de entrada?

Esa parte es el **core** (dominio + aplicación). Todo lo demás son **adapters**.

## Estructura

```
core/
  domain/        # Entidades, Value Objects, reglas de negocio puras, sin imports de infra
  application/    # Casos de uso / servicios de aplicación, orquestan el dominio
  ports/
    driving/      # Interfaces que el mundo exterior usa para ENTRAR (ej: UseCase)
    driven/       # Interfaces que el core usa para SALIR (ej: Repository, EventPublisher)
adapters/
  driving/        # REST controllers, CLI, consumers de cola - implementan/llaman driving ports
  driven/         # Implementaciones concretas de DB, APIs externas, mensajería
```

Regla de dependencia: `adapters -> core`, nunca `core -> adapters`. El dominio no debe importar Spring, JPA, Express, un SDK de AWS, ni un ORM - ni siquiera envuelto dentro de un objeto de "config" o "deps": si algo dentro de ese objeto es un tipo del SDK, el import sigue rompiendo la regla aunque no se vea directo.

**Convención alternativa: vertical slicing.** La estructura de arriba organiza por tipo de archivo. Para sistemas con muchos casos de uso, organizar por feature/caso de uso suele reducir el acoplamiento entre módulos que no cambian juntos:

```
Usuario/
  domain/            # Entities, VOs, ports del feature
  application/
  commands/
    CrearUsuario/
      CrearUsuarioService     # handler
      CrearUsuarioCommand     # input
      CrearUsuarioController  # adapter de entrada
  infrastructure/
    UsuarioRepository         # adapter que implementa el port
```

Ambas convenciones (por tipo o vertical slicing) son válidas - elige una y sé consistente en todo el proyecto, no las mezcles a mitad de camino.

## Puertos: driving vs driven

- **Driving ports** (primary/inbound): definen qué puede hacer el sistema. Los implementa el `application` y los invocan los adapters de entrada (controller, consumer). Ejemplo: `interface RegistrarPagoUseCase`.
- **Driven ports** (secondary/outbound): definen qué necesita el core del mundo exterior. Los implementa un adapter concreto (repo con Postgres, cliente HTTP). Ejemplo: `interface PagoRepository`.

Si una interfaz no tiene una razón concreta para tener más de una implementación (test double, o un cambio de proveedor real y esperado), cuestiona si necesitas la interfaz o si es indirection gratuita.

Nombra los puertos por su rol de negocio (`PaymentGateway`, `PagoRepository`), no por su mecánica (`IPagoRepository`, `PagoRepositoryInterface`, `PagoRepositoryImpl`). El prefijo/sufijo que grita "esto es una interfaz" es ruido - el nombre debería seguir leyéndose bien si mañana esto se vuelve una clase concreta.

## Cuándo SÍ aplicar esto

- El dominio tiene reglas de negocio no triviales que van a evolucionar.
- Hay más de un adapter real o esperado por puerto (ej: REST + gRPC, Postgres hoy y otro motor mañana, o simplemente necesitas testear el dominio sin DB).
- El equipo va a mantener el sistema por meses/años, no es un one-off.

## Cuándo NO aplicarla (señal de overengineering)

- CRUD simple sin lógica de negocio real: el "dominio" sería solo getters/setters envueltos en capas.
- Prototipo o script de una sola corrida.
- Nunca vas a cambiar de DB, de framework ni de protocolo, y no necesitas testear el dominio aislado.

En estos casos, decláralo explícitamente al usuario: "esto no necesita hexagonal, un service simple basta" es una respuesta válida y preferible.

**Regla de opt-in explícito**: si el repo no ha adoptado hexagonal ya (no hay un README, ADR o CLAUDE.md que lo declare), no lo infieras ni lo impongas solo porque un pedido puntual menciona "aislar esto" o "agregar un test seam" - eso es una señal de testabilidad puntual, no un mandato de arquitectura para todo el módulo. Confirma con el usuario antes de reestructurar algo que no pidió explícitamente.

## Testing

Los tests de dominio y aplicación deben poder correr con dobles de los driven ports (in-memory, fakes), sin levantar DB ni HTTP. Si un test de "unit" del dominio necesita un contenedor de Postgres, la frontera está mal puesta.

## Checklist de revisión

1. ¿El dominio importa algo de un framework, ORM o SDK externo? -> violación.
2. ¿Cada puerto tiene una razón real de existir (más de una implementación, o necesidad real de test doble)? -> si no, simplifica.
3. ¿Los adapters de entrada (controllers) contienen lógica de negocio? -> muévela a application/domain.
4. ¿El caso de uso depende de una interfaz (driven port) o de una clase concreta de infraestructura? -> debe depender de la interfaz.
5. ¿Cuántas capas hay realmente y cada una justifica su existencia, o es folder-cargo-culting (`domain/`, `application/`, `infrastructure/` sin que nada cruce boundaries)?

## Referencias conceptuales (no reproducir texto, solo ideas)

Alistair Cockburn (Ports & Adapters original), Robert C. Martin (Clean Architecture), Tom Hombergs (*Get Your Hands Dirty on Clean Architecture*).
