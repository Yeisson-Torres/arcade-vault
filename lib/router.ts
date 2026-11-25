// Router por hash legible: #/ (Home), #/biblioteca, #/detalle/:id, #/jugar/:id, #/auth, #/salon, #/about.

import { GAMES } from "@/lib/data";

export type Route =
  | { name: "home" }
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" }
  | { name: "about" };

export const HOME: Route = { name: "home" };

const gameExists = (id: string) => GAMES.some((g) => g.id === id);

/** Convierte un hash ("#/detalle/caida") en una ruta. Todo lo desconocido cae en la Home. */
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
    case "biblioteca":
      return id === undefined ? { name: "biblioteca" } : HOME;
    case "auth":
      return id === undefined ? { name: "auth" } : HOME;
    case "salon":
      return id === undefined ? { name: "salon" } : HOME;
    case "about":
      return id === undefined ? { name: "about" } : HOME;
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
    case "home":
      return "#/";
    case "biblioteca":
      return "#/biblioteca";
    case "detalle":
      return `#/detalle/${encodeURIComponent(route.id)}`;
    case "player":
      return `#/jugar/${encodeURIComponent(route.id)}`;
    case "auth":
      return "#/auth";
    case "salon":
      return "#/salon";
    case "about":
      return "#/about";
  }
}
