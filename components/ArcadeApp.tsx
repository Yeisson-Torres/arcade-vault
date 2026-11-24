"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Auth } from "@/components/screens/Auth";
import { GameDetail } from "@/components/screens/GameDetail";
import { GamePlayer } from "@/components/screens/GamePlayer";
import { HallOfFame } from "@/components/screens/HallOfFame";
import { Library } from "@/components/screens/Library";
import { appendScore, clearUser, loadUser, saveUser, type User } from "@/lib/storage";
import { useHashRoute } from "@/lib/useHashRoute";

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

  // `null` = invitado: no hay sesión que guardar.
  const handleLogin = (next: User | null) => {
    setUser(next);
    if (next) saveUser(next);
    else clearUser();
  };

  const handleSignOut = () => {
    setUser(null);
    clearUser();
  };

  return (
    <>
      <Nav route={route} navigate={navigate} user={user} onSignOut={handleSignOut} />
      <main className="av-main">
        {route.name === "home" ? (
          // Placeholder temporal (SPEC 02, paso 1): se sustituye por <Home /> en el paso 7.
          <div className="fade-in">
            <p>HOME</p>
          </div>
        ) : route.name === "biblioteca" ? (
          <Library navigate={navigate} />
        ) : route.name === "detalle" ? (
          <GameDetail key={route.id} id={route.id} navigate={navigate} />
        ) : route.name === "player" ? (
          <GamePlayer key={route.id} id={route.id} user={user} navigate={navigate} onSaveScore={appendScore} />
        ) : route.name === "auth" ? (
          <Auth navigate={navigate} onLogin={handleLogin} />
        ) : (
          <HallOfFame user={user} navigate={navigate} />
        )}
      </main>
      <Footer />
    </>
  );
}
