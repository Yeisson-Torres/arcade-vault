// Datos de la pantalla About: copy literal de `about.jsx`.

import type { GameColor } from "@/lib/data";

export type HighlightIconKind = "HEART" | "BROWSER" | "PLANT";

export interface Highlight {
  icon: HighlightIconKind;
  text: string;
  color: GameColor;
}

export const HIGHLIGHTS: Highlight[] = [
  { icon: "HEART", text: "HECHO CON ❤️ PARA JUGADORES", color: "magenta" },
  { icon: "BROWSER", text: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", color: "cyan" },
  { icon: "PLANT", text: "PROYECTO EN CONSTANTE CRECIMIENTO", color: "green" },
];
