"use client";

import { useId, useState, type FormEvent } from "react";
import type { Route } from "@/lib/router";
import type { User } from "@/lib/storage";

interface AuthProps {
  navigate: (route: Route) => void;
  /** `null` = entrar como invitado (sin sesión). */
  onLogin: (user: User | null) => void;
}

type Tab = "in" | "up";

export function Auth({ navigate, onLogin }: AuthProps) {
  const [tab, setTab] = useState<Tab>("in");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const ids = useId();

  // Sesión mock: sin validación real (fuera de alcance de esta spec).
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin({ name: (user || "PLAYER1").toUpperCase().slice(0, 10) });
    navigate({ name: "biblioteca" });
  };

  const playAsGuest = () => {
    onLogin(null);
    navigate({ name: "biblioteca" });
  };

  return (
    <div className="av-auth-wrap fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="mark" />
          <h2 className="neon-cyan">ARCADE VAULT</h2>
          <div className="mono sub">ACCESO AL SISTEMA · v2.6</div>
        </div>

        <div className="auth-tabs" role="group" aria-label="Tipo de acceso">
          <button type="button" className={tab === "in" ? "on" : ""} aria-pressed={tab === "in"} onClick={() => setTab("in")}>
            INICIAR SESIÓN
          </button>
          <button type="button" className={tab === "up" ? "on" : ""} aria-pressed={tab === "up"} onClick={() => setTab("up")}>
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor={`${ids}-user`}>Usuario</label>
            <input
              id={`${ids}-user`}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="px_kai"
              autoComplete="username"
            />
          </div>
          {tab === "up" && (
            <div className="field slide-in">
              <label htmlFor={`${ids}-email`}>Correo electrónico</label>
              <input
                id={`${ids}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jugador@vault.gg"
                autoComplete="email"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor={`${ids}-pass`}>Contraseña</label>
            <input
              id={`${ids}-pass`}
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === "in" ? "current-password" : "new-password"}
            />
          </div>

          <button className="btn lg auth-submit" type="submit">
            {tab === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
          </button>
        </form>

        <button type="button" className="btn ghost auth-guest" onClick={playAsGuest}>
          JUGAR COMO INVITADO
        </button>

        <div className="auth-divider">O CONTINÚA CON</div>
        {/* Decorativos: OAuth queda fuera del alcance de esta spec. */}
        <div className="social">
          <button className="btn ghost" type="button">◆  GOOGLE</button>
          <button className="btn ghost" type="button">▣  GITHUB</button>
        </div>

        <div className="auth-terms">AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE</div>
      </div>
    </div>
  );
}
