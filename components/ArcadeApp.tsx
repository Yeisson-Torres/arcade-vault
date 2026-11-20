"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Library } from "@/components/screens/Library";
import type { Route } from "@/lib/router";
import { loadUser, type User } from "@/lib/storage";
import { useHashRoute } from "@/lib/useHashRoute";

const SCREEN_NAMES: Record<Route["name"], string> = {
  biblioteca: "BIBLIOTECA",
  detalle: "DETALLE",
  player: "REPRODUCTOR",
  auth: "ACCESO",
  salon: "SALÓN DE LA FAMA",
};

// Placeholder temporal: se sustituye por cada pantalla en los pasos 6–11.
function Placeholder({ route, user }: { route: Route; user: User | null }) {
  return (
    <section className="px-8 py-24 text-center">
      <h1 className="font-pixel text-xl text-cyan">{SCREEN_NAMES[route.name]}</h1>
      <p className="mt-4 text-ink-dim">
        {"id" in route ? `id: ${route.id} · ` : ""}
        sesión: {user ? user.name : "ninguna"}
      </p>
    </section>
  );
}

export function ArcadeApp() {
  const { route, navigate } = useHashRoute();
  // Estado inicial fijo (null) en servidor y cliente; la sesión se lee tras montar.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Hidratación desde localStorage: debe ocurrir tras montar para que el
    // primer render coincida con el HTML del servidor (ver Riesgos de la spec).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(loadUser());
  }, []);

  // La persistencia del cierre de sesión (clearUser) se conecta en el paso 10.
  const handleSignOut = () => setUser(null);

  return (
    <>
      <Nav route={route} navigate={navigate} user={user} onSignOut={handleSignOut} />
      <main className="av-main">
        {route.name === "biblioteca" ? (
          <Library navigate={navigate} />
        ) : (
          <Placeholder route={route} user={user} />
        )}
      </main>
      <Footer />
    </>
  );
}
