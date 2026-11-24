"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { formatHash, type Route } from "@/lib/router";
import type { User } from "@/lib/storage";

interface NavProps {
  route: Route;
  navigate: (route: Route) => void;
  user: User | null;
  onSignOut: () => void;
}

type NavTarget = "home" | "biblioteca" | "salon" | "about" | "auth";

export function Nav({ route, navigate, user, onSignOut }: NavProps) {
  const [open, setOpen] = useState(false);

  // Detalle y Reproductor cuelgan de la Biblioteca, igual que en la plantilla.
  const isActive = (name: NavTarget) =>
    route.name === name ||
    (name === "biblioteca" && (route.name === "detalle" || route.name === "player"));

  const go = (r: Route) => {
    setOpen(false);
    navigate(r);
  };

  // Enlaces reales (href con hash) para teclado y clic central; el clic normal pasa por navigate.
  const linkProps = (r: Route) => ({
    href: formatHash(r),
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      go(r);
    },
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const activeClass = (name: NavTarget) => (isActive(name) ? "active" : undefined);

  return (
    <>
      <nav className="av-nav">
        <a className="logo" aria-label="Arcade Vault, ir al Inicio" {...linkProps({ name: "home" })}>
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </a>
        <div className="links">
          <a className={activeClass("home")} {...linkProps({ name: "home" })}>
            Inicio
          </a>
          <a className={activeClass("biblioteca")} {...linkProps({ name: "biblioteca" })}>
            Biblioteca
          </a>
          <a className={activeClass("salon")} {...linkProps({ name: "salon" })}>
            Salón de la Fama
          </a>
          <a className={activeClass("about")} {...linkProps({ name: "about" })}>
            Acerca de
          </a>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button type="button" className="btn ghost auth-btn" onClick={onSignOut}>
            {user.name} ▾
          </button>
        ) : (
          <button type="button" className="btn auth-btn" onClick={() => go({ name: "auth" })}>
            Iniciar Sesión
          </button>
        )}
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
          aria-expanded={open}
          aria-controls="av-mobile-panel"
        >
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={() => setOpen(false)} />
      <aside
        id="av-mobile-panel"
        className={"av-mobile-panel" + (open ? " open" : "")}
        aria-label="Menú"
        inert={!open}
      >
        <div className="pixel neon-cyan panel-title">MENÚ</div>
        <a className={activeClass("home")} {...linkProps({ name: "home" })}>
          Inicio
        </a>
        <a className={activeClass("biblioteca")} {...linkProps({ name: "biblioteca" })}>
          Biblioteca
        </a>
        <a className={activeClass("salon")} {...linkProps({ name: "salon" })}>
          Salón de la Fama
        </a>
        <a className={activeClass("about")} {...linkProps({ name: "about" })}>
          Acerca de
        </a>
        <a className={activeClass("auth")} {...linkProps({ name: "auth" })}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </a>
        <div className="pixel panel-credits">CRÉDITOS · 03</div>
      </aside>
    </>
  );
}
