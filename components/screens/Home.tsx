"use client";

// Home (landing) de Arcade Vault — portada de la plantilla `home-about/home.jsx` (SPEC 02).

import { useRef } from "react";
import { FeatureIcon } from "@/components/home/FeatureIcon";
import { FloatingSilhouettes } from "@/components/home/FloatingSilhouettes";
import { MiniCard } from "@/components/home/MiniCard";
import { GAMES } from "@/lib/data";
import { FEATURES } from "@/lib/homeData";
import type { Route } from "@/lib/router";
import { useReveal } from "@/lib/useReveal";

interface HomeProps {
  navigate: (route: Route) => void;
}

export function Home({ navigate }: HomeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  return (
    <div ref={rootRef} className="home fade-in">
      {/* HERO */}
      <section className="home-hero">
        <FloatingSilhouettes />
        <div className="home-hero-inner">
          <div className="hero-eyebrow pixel neon-yellow">
            ▸ INSERTA UNA MONEDA<span className="blink">_</span>
          </div>
          <h1 className="home-title">
            <span className="line-1">EL ARCADE</span>
            <span className="line-2">CLÁSICO ESTÁ</span>
            <span className="line-3">DE VUELTA</span>
          </h1>
          <p className="home-sub">
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>
          <div className="home-ctas">
            <button type="button" className="btn xl pulse" onClick={() => navigate({ name: "biblioteca" })}>
              ▶ EXPLORAR JUEGOS
            </button>
            <button type="button" className="btn xl magenta" onClick={() => navigate({ name: "auth" })}>
              ✦ CREAR CUENTA
            </button>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>DESLIZA</span>
            <span className="arrow">▼</span>
          </div>
        </div>
      </section>

      {/* // 01 ¿POR QUÉ ARCADE VAULT? */}
      <section className="home-section reveal">
        <div className="section-head">
          <div className="kicker pixel neon-magenta">{"// 01"}</div>
          <h2 className="section-title">¿POR QUÉ ARCADE VAULT?</h2>
          <div className="section-rule" />
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={"feature-card " + f.color}>
              <FeatureIcon kind={f.icon} />
              <div className="ft-title pixel">{f.title}</div>
              <div className="ft-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* // 02 JUEGOS DISPONIBLES AHORA */}
      <section className="home-section reveal">
        <div className="section-head">
          <div className="kicker pixel neon-cyan">{"// 02"}</div>
          <h2 className="section-title">JUEGOS DISPONIBLES AHORA</h2>
          <div className="section-rule" />
        </div>
        <div className="mini-rail">
          {GAMES.slice(0, 6).map((g) => (
            <MiniCard key={g.id} game={g} onSelect={(game) => navigate({ name: "detalle", id: game.id })} />
          ))}
        </div>
        <div className="home-more">
          <button type="button" className="btn lg" onClick={() => navigate({ name: "biblioteca" })}>
            VER TODOS LOS JUEGOS →
          </button>
        </div>
      </section>
    </div>
  );
}
