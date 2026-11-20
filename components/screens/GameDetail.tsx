"use client";

import { useMemo } from "react";
import { GAMES, seededScores } from "@/lib/data";
import type { Route } from "@/lib/router";

interface GameDetailProps {
  id: string;
  navigate: (route: Route) => void;
}

const PODIUM_CLASS = [" top1", " top2", " top3"];

export function GameDetail({ id, navigate }: GameDetailProps) {
  const game = useMemo(() => GAMES.find((g) => g.id === id), [id]);
  // Misma semilla que la plantilla: cada juego tiene su propio leaderboard estable.
  const scores = useMemo(() => seededScores(id.length * 17 + 3, 10), [id]);

  // El router ya descarta ids inexistentes; esto es solo una salvaguarda.
  if (!game) return null;

  return (
    <div className="av-detail fade-in">
      <div>
        <div className="detail-cover">
          <div className={"cover-bg " + game.cover} />
        </div>
        <div className="detail-info">
          <div className="detail-tags">
            <span>{game.cat}</span>
            <span>1 JUGADOR</span>
            <span>TECLADO / TÁCTIL</span>
            <span>RETRO 1985</span>
          </div>
          <h2 className="neon-cyan">{game.title}</h2>
          <p>{game.long}</p>
          <div className="stat-strip">
            <div>
              <div className="l">Partidas</div>
              <div className="v">{game.plays}</div>
            </div>
            <div>
              <div className="l">Mejor global</div>
              <div className="v magenta">{game.best.toLocaleString("es-ES")}</div>
            </div>
            <div>
              <div className="l">Dificultad</div>
              <div className="v yellow" aria-label="Dificultad 3 de 5">★ ★ ★ ☆ ☆</div>
            </div>
          </div>
          <div className="detail-actions">
            <button
              type="button"
              className="btn xl pulse"
              onClick={() => navigate({ name: "player", id: game.id })}
            >
              ▶  JUGAR AHORA
            </button>
            <button type="button" className="btn ghost lg" onClick={() => navigate({ name: "biblioteca" })}>
              VOLVER AL VAULT
            </button>
          </div>
        </div>
      </div>

      <aside>
        <div className="leaderboard">
          <h3>MEJORES PUNTUACIONES</h3>
          {scores.map((r, i) => (
            <div key={`${r.name}-${i}`} className={"lb-row" + (PODIUM_CLASS[i] ?? "")}>
              <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
              <div className="pl">
                {r.name}
                <div className="date">{r.date}</div>
              </div>
              <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
