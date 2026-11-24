"use client";

// Home (landing) de Arcade Vault — portada de la plantilla `home-about/home.jsx` (SPEC 02).

import { useRef } from "react";
import { FeatureIcon } from "@/components/home/FeatureIcon";
import { FloatingSilhouettes } from "@/components/home/FloatingSilhouettes";
import { MiniCard } from "@/components/home/MiniCard";
import { GAMES } from "@/lib/data";
import { FEATURES, HOME_STATS, RECENT_SCORES, TOP_PLAYERS } from "@/lib/homeData";
import type { Route } from "@/lib/router";
import { useReveal } from "@/lib/useReveal";

// Clase de podio para los tres primeros del Top jugadores.
const TOP_CLASS = ["top1", "top2", "top3"];

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

      {/* ESTADÍSTICAS */}
      <section className="home-stats reveal">
        <div className="stats-inner">
          {HOME_STATS.map((st) => (
            <div key={st.n} className="stat-block">
              <div className="stat-n neon-yellow">{st.n}</div>
              <div className="stat-u pixel">{st.unit}</div>
              <div className="stat-s">{st.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* // 03 ACTIVIDAD EN VIVO */}
      <section className="home-section reveal">
        <div className="section-head">
          <div className="kicker pixel neon-yellow">{"// 03"}</div>
          <h2 className="section-title">ACTIVIDAD EN VIVO</h2>
          <div className="section-rule" />
        </div>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="ac-head">
              <div className="ac-title pixel">▸ ÚLTIMAS PUNTUACIONES</div>
            </div>
            <div className="ticker">
              {RECENT_SCORES.map((r) => (
                <div key={r.player + r.ago} className="tick-row">
                  <span className={"tk-p neon-" + r.color}>{r.player}</span>
                  <span className="tk-mid">▸ {r.game}</span>
                  <span className="tk-s">+{r.score.toLocaleString("es-ES")}</span>
                  <span className="tk-t">{r.ago}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-card">
            <div className="ac-head">
              <div className="ac-title pixel neon-magenta">▸ TOP JUGADORES · HOY</div>
              <button type="button" className="lb-link" onClick={() => navigate({ name: "salon" })}>
                VER SALÓN →
              </button>
            </div>
            <div className="top-list">
              {TOP_PLAYERS.map((r, i) => (
                <div key={r.rank} className={"top-row" + (TOP_CLASS[i] ? " " + TOP_CLASS[i] : "")}>
                  <span className="tp-rk">#{String(r.rank).padStart(2, "0")}</span>
                  <span className="tp-bar">
                    <span className="tp-fill" />
                  </span>
                  <span className="tp-p">{r.player}</span>
                  <span className="tp-s">{r.score.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* // 04 PRECIOS */}
      <section className="home-section reveal">
        <div className="section-head">
          <div className="kicker pixel neon-green">{"// 04"}</div>
          <h2 className="section-title">PRECIOS</h2>
          <div className="section-rule" />
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="pc-label pixel">PLAN ÚNICO</div>
            <div className="pc-name pixel">JUGADOR VAULT</div>
            <div className="pc-amount">
              <span className="pc-amount-n">$0</span>
              <span className="pc-amount-u">/ SIEMPRE</span>
            </div>
            <div className="pc-tag">SIN TRUCOS · SIN LETRA PEQUEÑA</div>
            <ul className="pc-list">
              <li>✔ Acceso a todos los juegos</li>
              <li>✔ Ranking global y salón de la fama</li>
              <li>✔ Sin anuncios entre partidas</li>
              <li>✔ Guarda tus puntuaciones</li>
              <li>✔ Nuevos juegos cada mes</li>
              <li>✔ Funciona en cualquier navegador</li>
            </ul>
            <button type="button" className="btn xl pulse" onClick={() => navigate({ name: "auth" })}>
              EMPEZAR GRATIS →
            </button>
            <div className="pc-foot">No pedimos tarjeta. Nunca lo haremos.</div>
            <div className="pc-stamp pixel">
              FREE
              <br />
              PLAY
            </div>
          </div>

          <div className="pricing-faq">
            <div className="faq-item">
              <div className="faq-q pixel">¿REALMENTE ES GRATIS?</div>
              <div className="faq-a">
                Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión
                &quot;premium&quot; escondida.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q pixel">¿NECESITO CREAR CUENTA?</div>
              <div className="faq-a">
                No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking, regístrate
                en 10 segundos.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q pixel">¿CÓMO SOBREVIVEN SIN COBRAR?</div>
              <div className="faq-a">
                Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="home-final reveal">
        <h2 className="final-title pixel">¿LISTO PARA JUGAR?</h2>
        <button type="button" className="btn xl pulse final-cta" onClick={() => navigate({ name: "biblioteca" })}>
          INSERTAR MONEDA →
        </button>
        <div className="final-tag">Gratis. Sin registro obligatorio. Empieza en segundos.</div>
      </section>
    </div>
  );
}
