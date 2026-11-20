"use client";

import { useCallback, useEffect, useState } from "react";
import { formatHash, HOME, parseHash, type Route } from "@/lib/router";

/**
 * Estado de ruta sincronizado con `location.hash`.
 * El render inicial siempre es la Biblioteca (igual en servidor y cliente);
 * el hash real se lee en `useEffect` para evitar desajustes de hidratación.
 */
export function useHashRoute() {
  const [route, setRoute] = useState<Route>(HOME);

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    const onHashChange = () => {
      sync();
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    sync();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = formatHash(next);
    if (window.location.hash === hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    // Dispara `hashchange`, que actualiza el estado y hace scroll al inicio.
    window.location.hash = hash;
  }, []);

  return { route, navigate };
}
