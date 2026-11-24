"use client";

// Mini‑tarjeta del carril "JUEGOS DISPONIBLES AHORA", portada de `home.jsx`.
// Es un enlace real (href con hash) para teclado y clic central; el clic normal pasa por onSelect.

import type { MouseEvent } from "react";
import type { Game } from "@/lib/data";
import { formatHash } from "@/lib/router";

interface MiniCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export function MiniCard({ game, onSelect }: MiniCardProps) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onSelect(game);
  };

  return (
    <a className="mini-card" href={formatHash({ name: "detalle", id: game.id })} onClick={onClick}>
      <div className="mini-cover">
        <div className={"cover-bg " + game.cover} />
      </div>
      <div className="mini-meta">
        <div className="mini-title">{game.title}</div>
        <div className="mini-cat">{game.cat}</div>
      </div>
    </a>
  );
}
