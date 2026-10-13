// Acts — Lenis + ScrollTrigger: progreso global, data-act, revelado de tipografía por acto,
// letterbox, cifras que cuentan. Requiere gsap, ScrollTrigger y Lenis globales (UMD) o importados.
// Marcado esperado:
//   <main data-acts data-act="1">
//     <section class="act" data-step="1" data-hero> … .split-line>span … </section> …
export function initActs({ root = document.querySelector("[data-acts]"), onProgress, reduce, gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis } = {}) {
  gsap.registerPlugin(ScrollTrigger);
  reduce ??= matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lenis = reduce ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const el = document.querySelector(a.getAttribute("href"));
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { duration: 2.2 }) : el.scrollIntoView();
  }));

  const sections = [...root.querySelectorAll(".act")];
  document.body.classList.add("bars-open");

  function start() {
    lenis?.start();
    const hero = root.querySelector("[data-hero]");
    if (hero && !reduce) {
      gsap.timeline({ delay: 0.35 })
        .from(hero.querySelectorAll(".split-line>span"), { yPercent: 105, duration: 1.4, ease: "expo.out" })
        .from(hero.querySelectorAll("[data-reveal]"), { y: 24, opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out" }, "-=1.0");
      gsap.to(hero.querySelector(".inner"), { opacity: 0, y: -80, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "55% top", scrub: true } });
    }

    ScrollTrigger.create({
      trigger: root, start: "top top", end: "bottom bottom", scrub: reduce ? false : 1.2,
      onUpdate: (st) => {
        const bar = Math.max(0, 11 - st.progress * 90);
        document.body.style.setProperty("--bar", bar + "vh");
        // El HUD vive sobre las barras negras mientras están abiertas; luego sobre la escena.
        // Las marcas en tema claro usan .bars-open para cambiar el color del HUD.
        document.body.classList.toggle("bars-open", bar > 1.5);
        onProgress?.(st.progress, st.getVelocity());
      },
    });

    sections.forEach((sec) => {
      const n = sec.dataset.step;
      ScrollTrigger.create({
        trigger: sec, start: "top 55%", end: "bottom 55%",
        onToggle: (st) => {
          if (!st.isActive) return;
          root.dataset.act = n;
          document.querySelectorAll("[data-to]").forEach((a) => a.classList.toggle("on", a.dataset.to === n));
        },
      });
      if (sec.hasAttribute("data-hero") || reduce) return;
      gsap.from(sec.querySelectorAll(".split-line>span"), {
        yPercent: 110, duration: 1.2, stagger: 0.09, ease: "expo.out",
        scrollTrigger: { trigger: sec, start: "top 62%", end: "bottom 35%", toggleActions: "play reverse play reverse" },
      });
      gsap.from(sec.querySelectorAll("[data-reveal]"), {
        y: 28, opacity: 0, duration: 1, stagger: 0.06, ease: "expo.out",
        scrollTrigger: { trigger: sec, start: "top 52%", end: "bottom 40%", toggleActions: "play reverse play reverse" },
      });
    });

    root.querySelectorAll("[data-count]").forEach((el) => {
      const to = +el.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () =>
        gsap.to(o, { v: to, duration: reduce ? 0 : 1.6, ease: "expo.out",
          onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString(document.documentElement.lang || "en")) }) });
    });
  }

  return { lenis, start, reduce };
}
