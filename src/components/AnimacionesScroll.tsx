"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Muestra con una animación los elementos marcados con `data-revelar`
 * cuando entran en pantalla. Sin JavaScript se ven igual, sin animar.
 */
export function AnimacionesScroll() {
  const ruta = usePathname();

  useEffect(() => {
    const elementos = document.querySelectorAll<HTMLElement>("[data-revelar]:not([data-visible])");
    if (!("IntersectionObserver" in window)) {
      elementos.forEach((el) => el.setAttribute("data-visible", ""));
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-visible", "");
            observador.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [ruta]);

  return null;
}
