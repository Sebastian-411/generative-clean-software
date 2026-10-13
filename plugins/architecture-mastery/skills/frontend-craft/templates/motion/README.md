# motion — presets de Motion (Framer Motion) para React/Next

`npm i motion` y copia `motion.tsx` a `src/components/`. Trae:

- `ease`: la única curva del sitio (expo-out `[0.16, 1, 0.3, 1]`).
- `Reveal`: aparición al entrar en vista (8–16 px, 0,75 s, una vez).
- `Stagger` / `StaggerItem`: listas y grids con 70 ms entre hijos.
- `LineReveal`: titular por líneas detrás de máscara. Es el gesto firma: úsalo **una vez**, en el hero.

Reglas:

- Una curva y una escala de distancias en todo el sitio. Animar 1–2 cosas por vista; el resto queda quieto.
- Con `prefers-reduced-motion` todo aparece sin desplazamiento. Las demos que avanzan solas muestran su estado final.
- **Hidratación**: `useReducedMotion()` solo existe en el cliente. No lo uses para el estado inicial de un `useState` ni para decidir qué se renderiza, porque el HTML del servidor no coincide y React lanza el error #418. Léelo en un `useEffect` (ver la demo del hero en `briefs.md` §0).
- Una demo que se repite (agente, dashboard vivo) lleva pausa visible y se detiene fuera de pantalla (`useInView`).
