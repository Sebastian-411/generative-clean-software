"use client";
// Presets de Motion (Framer Motion) para sitios de producto. Un solo lenguaje de movimiento:
// curva expo-out, distancias cortas (8–16 px), 0,5–0,8 s, stagger de 60–80 ms. Con reduced-motion
// todo aparece sin desplazamiento. Regla (UI/UX Pro Max + reference-bar.md): 1–2 gestos clave por vista.
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, delay = 0, y = 14, className, ...rest }: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.3 : 0.75, ease, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const group: Variants = { show: { transition: { staggerChildren: 0.07 } } };
const item: Variants = { hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } };
const itemReduced: Variants = { hide: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } };

export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const M = motion[as];
  return (
    <M className={className} variants={group} initial="hide" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </M>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return <M className={className} variants={reduce ? itemReduced : item}>{children}</M>;
}

// Titular por líneas: cada línea sube detrás de una máscara (el gesto firma del hero, una sola vez).
export function LineReveal({ lines, className }: { lines: ReactNode[]; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={reduce ? { opacity: 0 } : { y: "105%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            transition={{ duration: reduce ? 0.3 : 1, ease, delay: 0.08 + i * 0.09 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
