"use client";

import { useMemo, useState } from "react";
import { GAMES, seededScores } from "@/lib/data";
import type { Route } from "@/lib/router";
import type { User } from "@/lib/storage";

interface HallOfFameProps {
  user: User | null;
  navigate: (route: Route) => void;
}

const PODIUM_CLASS = [" top1", " top2", " top3"];
const fmt = (n: number) => n.toLocaleString("es-ES");

export function HallOfFame({ user, navigate }: HallOfFameProps) {
  const [tab, setTab] = useState(GAMES[0].id);
  // Misma semilla que la plantilla: 12 filas estables por juego.
  const rows = useMemo(() => seededScores(tab.length * 23 + 7, 12), [tab]);
  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];

  // "TU MEJOR MARCA" es mock, como en la plantilla (no se lee av_scores).
  const youRank = Math.floor(8 + (tab.length % 4));
  const youScore = rows[5].score - 2400 || 9999;

  const [first, second, third] = rows;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel tagline">LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA</p>
      </div>

      <div className="hall-tabs" role="group" aria-label="Juego">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            aria-pressed={tab === g.id}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{second.name}</div>
          <div className="score">{fmt(second.score)}</div>
          <div className="date">{second.date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel champ">CAMPEÓN</div>
          <div className="rank-num">01</div>
          <div className="name">{first.name}</div>
          <div className="score">{fmt(first.score)}</div>
          <div className="date">{first.date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{third.name}</div>
          <div className="score">{fmt(third.score)}</div>
          <div className="date">{third.date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div key={`${r.name}-${i}`} className={"tr" + (PODIUM_CLASS[i] ?? "")}>
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{fmt(r.score)}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you">
              <div className="rk">#{String(youRank).padStart(2, "0")}</div>
              <div className="pl">{user.name}</div>
              <div className="sc">{fmt(youScore)}</div>
              <div className="dt">11/05/2026</div>
            </div>
          </>
        )}
      </div>

      <div className="hall-back">
        <button type="button" className="btn lg" onClick={() => navigate({ name: "biblioteca" })}>
          VOLVER A LA BIBLIOTECA
        </button>
      </div>
    </div>
  );
}
