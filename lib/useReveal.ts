"use client";

import { useEffect, type RefObject } from "react";

/**
 * Animación de aparición al hacer scroll: añade la clase `in` a cada `.reveal`
 * dentro del contenedor `ref` cuando entra en pantalla (umbral 12 %, como la plantilla).
 * Solo observa dentro del contenedor, nunca `document`, para no tocar otras pantallas.
 * Sin `IntersectionObserver`, muestra todo de inmediato para que nada quede invisible.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const els = root.querySelectorAll<HTMLElement>(".reveal");

    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}
