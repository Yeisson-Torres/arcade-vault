// Router por hash legible: #/, #/detalle/:id, #/jugar/:id, #/auth, #/salon.

import { GAMES } from "@/lib/data";

export type Route =
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };

export const HOME: Route = { name: "biblioteca" };

const gameExists = (id: string) => GAMES.some((g) => g.id === id);

/** Convierte un hash ("#/detalle/caida") en una ruta. Todo lo desconocido cae en la Biblioteca. */
export function parseHash(hash: string): Route {
  const parts = hash
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    });

  const [head, id, ...rest] = parts;
  if (rest.length > 0) return HOME;

  switch (head) {
    case undefined:
      return HOME;
    case "auth":
      return id === undefined ? { name: "auth" } : HOME;
    case "salon":
      return id === undefined ? { name: "salon" } : HOME;
    case "detalle":
      return id !== undefined && gameExists(id) ? { name: "detalle", id } : HOME;
    case "jugar":
      return id !== undefined && gameExists(id) ? { name: "player", id } : HOME;
    default:
      return HOME;
  }
}

/** Convierte una ruta en su hash legible. */
export function formatHash(route: Route): string {
  switch (route.name) {
    case "biblioteca":
      return "#/";
    case "detalle":
      return `#/detalle/${encodeURIComponent(route.id)}`;
    case "player":
      return `#/jugar/${encodeURIComponent(route.id)}`;
    case "auth":
      return "#/auth";
    case "salon":
      return "#/salon";
  }
}
