---
name: solid-principles
description: Aplica o revisa los principios SOLID (SRP, OCP, LSP, ISP, DIP) a nivel de clase/módulo. Úsala cuando el usuario pida revisar código por violaciones de SOLID, decidir si una clase hace demasiado, diseñar interfaces, o justificar una abstracción concreta. Trátala como complemento de clean-architecture y hexagonal-architecture, no como sustituto: SOLID opera a nivel de clase, las otras a nivel de sistema.
---

# Principios SOLID

Aplícalos como herramienta de diagnóstico, no como checklist a cumplir a la fuerza. Cada violación debe señalarse con un ejemplo concreto de por qué duele (qué se vuelve difícil de cambiar), no solo con la etiqueta del principio.

## S — Single Responsibility Principle

Una clase debe tener una sola razón para cambiar. No es "una clase, un método" - es "los cambios que le llegan a esta clase vienen de un solo actor/motivo".

Señal de violación: una clase que cambia por razones de negocio Y por razones de formato de salida Y por razones de persistencia. Ejemplo típico: una clase `Reporte` que calcula números Y los formatea a PDF Y los guarda en disco.

## O — Open/Closed Principle

Abierto a extensión, cerrado a modificación: agregar un comportamiento nuevo no debería requerir editar código que ya funciona y está probado, sino agregar código nuevo (una nueva implementación de una interfaz, una nueva estrategia).

Señal de violación: un `switch`/`if-else` que crece cada vez que se agrega un tipo nuevo de algo (tipo de pago, tipo de descuento). Suele resolverse con polimorfismo o el patrón Strategy - pero solo si de verdad se espera que la lista crezca; si son 2 casos fijos para siempre, un `if` es más simple y honesto que una jerarquía de clases.

## L — Liskov Substitution Principle

Una subclase debe poder usarse donde se espera la clase base, sin romper el comportamiento esperado por quien la consume. No es solo tipos, son contratos: precondiciones, postcondiciones e invariantes.

Señal de violación clásica: `Cuadrado extends Rectangulo` que rompe el invariante de que cambiar el ancho no cambia el alto. O un método sobrescrito que lanza `NotImplementedException` para casos que la clase base sí soportaba.

## I — Interface Segregation Principle

Ninguna clase debería depender de métodos que no usa. Interfaces grandes con muchos métodos no relacionados obligan a implementaciones vacías o que lanzan excepción.

Señal de violación: una interfaz `Repository` con 20 métodos donde cada implementador solo necesita 3. Divide en interfaces más pequeñas y específicas por rol de consumo.

## D — Dependency Inversion Principle

Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones. Esto es literalmente lo mismo que la regla de dependencia de Clean Architecture y los driven ports de Hexagonal, aplicado a nivel de clase.

Señal de violación: un Use Case que instancia directamente `new PostgresPagoRepository()` en vez de recibir una interfaz `PagoRepository` inyectada.

## Advertencia contra el uso dogmático

SOLID mal aplicado produce el "empanada arquitectónica": una interfaz por cada clase, un factory por cada interfaz, y una jerarquía de cinco niveles para un caso que nunca va a tener una segunda implementación. Antes de aplicar cualquiera de estos principios, pregunta: ¿qué cambio futuro concreto estoy protegiendo? Si no hay respuesta clara, la abstracción es costo puro.

## Checklist de revisión

1. ¿Esta clase cambia por más de un motivo/actor de negocio? (SRP)
2. ¿Agregar un caso nuevo requiere editar un `switch` existente en vez de agregar código nuevo? (OCP)
3. ¿Alguna subclase rompe el contrato esperado de su clase base? (LSP)
4. ¿Hay implementaciones vacías o que lanzan `NotImplemented` por una interfaz demasiado grande? (ISP)
5. ¿El código de alto nivel instancia clases concretas de infraestructura directamente? (DIP)
6. ¿Cada abstracción introducida tiene una razón real de existir, o es "SOLID cargo cult"?

## Referencias conceptuales (no reproducir texto, solo ideas)

Robert C. Martin (acuñó el acrónimo SOLID), Barbara Liskov (LSP).
