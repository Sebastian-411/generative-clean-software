---
name: greenfield-defaults
description: Define el stack y la forma de carpeta cuando se inicia un proyecto desde cero o la carpeta está vacía. Úsala al crear un repo nuevo, scaffold, "proyecto desde 0", o cuando no hay lenguaje/stack definido. No la uses para extender un repo que ya tiene stack — ahí ganan las convenciones existentes. Default: monorepo con Next.js, Astro y NestJS hexagonal, cada app con su imagen Docker y su docker-compose, más un compose raíz que levanta backend y frontends juntos.
---

# Defaults de proyecto nuevo (greenfield)

Aplica **solo** cuando el usuario pide un proyecto desde 0, la carpeta está vacía, o no hay stack definido. Si el repo ya tiene lenguaje o estructura, no impongas esto.

El usuario puede overridear cualquier pieza ("solo Nest", "sin Astro", "sin Docker"). Lo no overrideado se mantiene.

## Stack por defecto

| Pieza | Default |
|---|---|
| Forma | Monorepo (`apps/`) |
| App web | Next.js en `apps/web` |
| Sitio / content | Astro en `apps/site` |
| API | NestJS + arquitectura hexagonal en `apps/api` |
| Orquestación | `docker-compose.yml` en la raíz (backend + frontends a la vez) |
| Por app | `Dockerfile` + `docker-compose.yml` propios, imagen propia |
| UI kit | `packages/ui` — tokens + primitivos + compuestos, compartido por Next y Astro |
| Craft | `frontend-craft` — landing cinematográfica (Astro), app simple y hermosa (Next), Playwright valida el diseño |

Next.js y Astro son **dos frontends**, no un framework mezclado. Next.js es la app; Astro es el sitio (marketing, content, docs). Si el pedido no necesita sitio, crea `apps/site` igual como pieza del default, o omítela solo si el usuario lo dice.

## Árbol

```
/
  docker-compose.yml          # orquesta api + web + site
  apps/
    web/                      # Next.js
      Dockerfile
      docker-compose.yml
    site/                     # Astro
      Dockerfile
      docker-compose.yml
    api/                      # NestJS hexagonal
      Dockerfile
      docker-compose.yml
  packages/
    ui/                       # design system compartido (tokens, primitivos, Hero, Scene3D)
      src/
        core/
          domain/
          application/
          ports/driving/
          ports/driven/
        adapters/
          driving/            # controllers Nest — no lógica de negocio
          driven/             # persistencia, HTTP clients, colas
        main.ts               # composition root / wiring Nest
```

No aplanes esto a un solo `package.json` en la raíz con frontend y backend mezclados. Cada app es un paquete con su propio `package.json`.

## Docker (no negociable en greenfield)

1. Cada app (`web`, `site`, `api`) tiene **su** `Dockerfile` y **su** imagen (`apps-web`, `apps-site`, `apps-api` o el nombre del servicio).
2. Cada app tiene **su** `docker-compose.yml` para levantarla sola (dev de esa pieza).
3. La raíz tiene **un** `docker-compose.yml` que construye y levanta **backend y frontends al mismo tiempo**, con `build.context` apuntando a cada app. No uses una sola imagen para todo.
4. El compose raíz es la forma por defecto de correr el sistema. Los compose de cada app son para trabajar una pieza aislada.
5. No pongas secretos en los Dockerfiles. Env por `.env` / compose `env_file`.

## NestJS hexagonal

En `apps/api`, hexagonal es el default — no preguntes si "hace falta capas" para el scaffold. Sigue `hexagonal-architecture`:

- `core/domain` y `core/application` **no** importan `@nestjs/*`, TypeORM, Prisma ni HTTP.
- Controllers Nest viven en `adapters/driving`. Repos/clients concretos en `adapters/driven`.
- El wiring (`@Module`, providers) es composition root, no se esparce por el dominio.
- Un Use Case por acción de negocio, no un `AppService` con quince métodos.
- Sigue sin inventar interfaces "por si acaso": un puerto existe si hay adapter real o test double necesario.

## Frontend (usa frontend-craft)

El scaffold no entrega páginas grises. Desde el primer commit:

- `apps/site`: landing-escena (un WebGL, scroll que mueve cámara/modelo, ≥3 actos, CTA único). Playwright cubre hero, un acto a mitad de scroll, y reduced-motion.
- `apps/web`: app en modo producto (una acción por pantalla, empty/loading/error, cero WebGL). Playwright cubre la pantalla inicial.
- `packages/ui` existe y ambas apps lo importan. No hay estilos one-off en las páginas.

## Qué no hacer

- No elijas Go, Spring, Python ni un frontend distinto salvo override explícito.
- No metas hexagonal en Next.js ni Astro. Hexagonal es del API.
- No fusiones Next y Astro en una sola app.
- No dejes un compose raíz que solo documente "TODO: agregar servicios".
- No copies este plugin (`architecture-mastery`) dentro del monorepo generado.

## Al entregar un scaffold

1. Árbol creado, cada app con Dockerfile + compose, compose raíz que levanta las tres.
2. API con carpetas hexagonales y un Use Case real del dominio pedido (no un `AppService` vacío).
3. `packages/ui` + landing y app siguiendo `frontend-craft`; Playwright de diseño en verde o el hueco reportado.
4. Qué se dejó simple y por qué.
5. Cómo se levanta: `docker compose up --build` en la raíz.
