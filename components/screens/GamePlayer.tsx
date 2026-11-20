"use client";

import { useEffect, useReducer } from "react";
import { GAMES } from "@/lib/data";
import type { Route } from "@/lib/router";
import type { User } from "@/lib/storage";

interface GamePlayerProps {
  id: string;
  user: User | null;
  navigate: (route: Route) => void;
}

interface SimState {
  score: number;
  lives: number;
  level: number;
  paused: boolean;
  over: boolean;
}

type SimAction =
  | { type: "tick"; points: number }
  | { type: "togglePause" }
  | { type: "end" }
  | { type: "restart" };

const INITIAL: SimState = { score: 0, lives: 3, level: 1, paused: false, over: false };

// Simulación igual que la plantilla: la puntuación sube sola y, al caer en la
// ventana [0, 100) de cada múltiplo de 2500, se sube de nivel.
function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "tick": {
      if (state.paused || state.over) return state;
      const score = state.score + action.points;
      const levelUp = score > 0 && score % 2500 < 100;
      return { ...state, score, level: levelUp ? state.level + 1 : state.level };
    }
    case "togglePause":
      return state.over ? state : { ...state, paused: !state.paused };
    case "end":
      return { ...state, over: true };
    case "restart":
      return INITIAL;
  }
}

const TICK_MS = 220;

export function GamePlayer({ id, user, navigate }: GamePlayerProps) {
  const game = GAMES.find((g) => g.id === id);
  const [sim, dispatch] = useReducer(simReducer, INITIAL);
  const { score, lives, level, paused, over } = sim;
  const running = !paused && !over;

  useEffect(() => {
    if (!running) return;
    // Math.random solo en el cliente, dentro del intervalo.
    const t = setInterval(() => dispatch({ type: "tick", points: Math.floor(10 + Math.random() * 90) }), TICK_MS);
    return () => clearInterval(t);
  }, [running]);

  // El router ya descarta ids inexistentes; esto es solo una salvaguarda.
  if (!game) return null;

  const playerName = user ? user.name : "INVITADO";

  return (
    <div className="av-player fade-in">
      <div className="player-hud">
        <div className="hud-stats">
          <div className="hud-stat player">
            <div className="l">Jugador</div>
            <div className="v">{playerName}</div>
          </div>
          <div className="hud-stat">
            <div className="l">Puntuación</div>
            <div className="v">{score.toLocaleString("es-ES")}</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Vidas</div>
            <div className="v" aria-label={`${lives} vidas`}>
              {"♥ ".repeat(lives).trim() || "—"}
            </div>
          </div>
          <div className="hud-stat level">
            <div className="l">Nivel</div>
            <div className="v">{String(level).padStart(2, "0")}</div>
          </div>
        </div>
        <div className="hud-actions">
          <button type="button" className="btn yellow" onClick={() => dispatch({ type: "togglePause" })}>
            {paused ? "REANUDAR" : "PAUSA"}
          </button>
          <button type="button" className="btn magenta" onClick={() => dispatch({ type: "end" })}>
            FIN
          </button>
          <button type="button" className="btn ghost" onClick={() => navigate({ name: "detalle", id: game.id })}>
            SALIR
          </button>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          <div className="game-arena" aria-hidden="true">
            <div className="grid-floor" />
            <div className="enemy e1" />
            <div className="enemy e2" />
            <div className="enemy e3" />
            <div className="player-ship" />
          </div>
          {paused && (
            <div className="crt-content paused" role="status">
              <div>
                <div className="pixel neon-yellow pause-title">EN PAUSA</div>
                <div className="mono pause-hint">PULSA REANUDAR PARA CONTINUAR</div>
              </div>
            </div>
          )}
        </div>
        <div className="crt-bottom">
          <span className="led">SEÑAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>
    </div>
  );
}
