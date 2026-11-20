# SPEC 01 — MVP visual de Arcade Vault (5 pantallas)

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-11-19
> **Objetivo:** Portar a Next.js las cinco pantallas de la plantilla `references/resources/resources/templates/` (Biblioteca, Detalle, Reproductor, Acceso y Salón de la Fama) como una SPA visual con datos mock, sin ningún juego real.

## Por qué existe esta spec

La plantilla de referencia es un prototipo React 18 cargado con Babel en el navegador (`window.*` globales, `<script type="text/babel">`).
El proyecto ya tiene sus estilos portados en `app/globals.css` y las fuentes en `app/layout.tsx` (PR #1).
Falta convertir los componentes `.jsx` en componentes TypeScript del proyecto y montarlos en `app/page.tsx`.
Se mantiene deliberadamente la navegación por hash de la plantilla para que el MVP sea fiel al prototipo.

## Alcance

**Dentro:**

- Datos mock tipados: `GAMES` (8 juegos), `CATS`, `PLAYERS` y `seededScores()` copiados de `data.jsx`.
- Router por hash en cliente con formato legible: `#/`, `#/detalle/:id`, `#/jugar/:id`, `#/auth`, `#/salon`.
- Barra de navegación (`Nav`) con enlaces activos, contador "CRÉDITOS · 03", botón de sesión y panel móvil (hamburguesa).
- Footer "© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0".
- **Biblioteca:** hero con parpadeo, buscador por nombre, chips de categoría, grilla de tarjetas con efecto tilt 3D y estado "NO HAY RESULTADOS".
- **Detalle:** portada CSS, etiquetas, descripción larga, franja de estadísticas, botones "JUGAR AHORA" / "VOLVER AL VAULT" y leaderboard de 10 filas.
- **Reproductor:** HUD (jugador, puntuación, vidas, nivel), arena CRT animada solo con CSS, puntuación simulada que sube sola, PAUSA/REANUDAR, FIN, SALIR y modal "FIN DEL JUEGO" con guardar puntuación, jugar de nuevo y volver.
- **Acceso:** pestañas Iniciar sesión / Crear cuenta, campos, botón invitado, botones sociales decorativos (Google, GitHub).
- **Salón de la Fama:** pestañas por juego, podio top 3, tabla de 12 filas con animación escalonada y fila mock "TU MEJOR MARCA" si hay usuario.
- Sesión mock en `localStorage` (`av_user`) y guardado de puntuaciones en `localStorage` (`av_scores`), igual que la plantilla.
- Sustituir los `style={{…}}` inline de la plantilla por utilidades Tailwind o clases nuevas en `app/globals.css`.

**Fuera de alcance (para specs futuras):**

- Cualquier juego jugable (lógica, canvas, controles de teclado/táctil).
- Rutas reales del App Router (`/juegos/[id]`, `/salon`, …).
- Autenticación real, validación de formularios, OAuth con Google/GitHub.
- Backend, base de datos o API de puntuaciones.
- Leer `av_scores` para alimentar leaderboards o la fila "TU MEJOR MARCA".
- Menú desplegable de cuenta (el botón del usuario cierra sesión directamente, como en la plantilla).
- Sistema real de créditos/monedas.
- Tests automatizados (no hay framework configurado).

## Modelo de datos

```ts
// lib/data.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;          // "bloque-buster", "caida", …
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;       // clase CSS existente: "cover-bricks", "cover-tetro", …
  color: GameColor;
  best: number;
  plays: string;       // "12.4K"
}

export interface ScoreRow { rank: number; name: string; score: number; date: string } // date "dd/mm/2026"

export const GAMES: Game[];                       // 8 juegos, mismos valores que data.jsx
export const CATS: ("TODOS" | Category)[];
export function seededScores(seed: number, count?: number): ScoreRow[];
```

```ts
// lib/router.ts
export type Route =
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };
// parseHash("#/detalle/caida") -> { name: "detalle", id: "caida" }
// formatHash({ name: "player", id: "caida" }) -> "#/jugar/caida"
```

```ts
// lib/storage.ts
export interface User { name: string }                       // clave "av_user"
export interface SavedScore { game: string; score: number; name: string; at: number } // clave "av_scores" (array)
```

Convenciones:

- Números formateados con `toLocaleString("es-ES")`.
- Nombres de jugador en mayúsculas, máximo 10 caracteres.
- Un hash desconocido o un `id` que no existe en `GAMES` resuelve a `{ name: "biblioteca" }`.

## Plan de implementación

1. Crear `lib/data.ts` con los tipos y datos de `data.jsx`. Verificación: `npm run build` pasa.
2. Crear `lib/router.ts` (`Route`, `parseHash`, `formatHash`) y `lib/useHashRoute.ts` (hook cliente que lee `location.hash` en `useEffect`, escucha `hashchange`, expone `navigate(route)` y hace scroll al inicio).
3. Crear `lib/storage.ts` con `loadUser`, `saveUser`, `clearUser`, `appendScore`, todos envueltos en `try/catch`.
4. Crear `components/ArcadeApp.tsx` (`"use client"`) con el estado de ruta y usuario, `components/Footer.tsx`, y reemplazar `app/page.tsx` del scaffold para que renderice `<ArcadeApp />`. Las pantallas aún son placeholders con su nombre. Verificación: `npm run dev`, cambiar el hash a mano muestra cada placeholder.
5. Crear `components/Nav.tsx` (escritorio + panel móvil) y conectarlo. Verificación: los enlaces cambian el hash y marcan el activo; a <840px aparece la hamburguesa.
6. Crear `components/GameCard.tsx` (con tilt) y `components/screens/Library.tsx`. Verificación: búsqueda y chips filtran; clic en tarjeta navega a `#/detalle/:id`.
7. Crear `components/screens/GameDetail.tsx`. Verificación: `#/detalle/caida` muestra portada, stats y leaderboard; botones navegan.
8. Crear `components/screens/GamePlayer.tsx` (HUD, CRT, simulación de puntuación, pausa).
9. Añadir a `GamePlayer` el modal "FIN DEL JUEGO" con guardado en `av_scores` y el toast "▸ PUNTUACIÓN GUARDADA_".
10. Crear `components/screens/Auth.tsx` y conectar `onLogin` / cierre de sesión con `lib/storage.ts`.
11. Crear `components/screens/HallOfFame.tsx` (pestañas, podio, tabla, fila "TU MEJOR MARCA").
12. Eliminar los imports/recursos del scaffold que queden sin uso en `app/page.tsx` y dejar `npm run lint` sin errores.

Al construir la UI se usa la skill `/frontend-design`, como indica `CLAUDE.md`, manteniendo la fidelidad visual a la plantilla.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Abrir `http://localhost:3000/` muestra la Biblioteca con 8 tarjetas y sin errores ni avisos de hidratación en consola.
- [ ] Escribir "ser" en el buscador deja solo SERPENTINA.
- [ ] Pulsar el chip PUZZLE deja solo CAÍDA; buscar "zzz" muestra "NO HAY RESULTADOS".
- [ ] Clic en una tarjeta cambia la URL a `#/detalle/<id>` y muestra el detalle de ese juego con 10 filas de leaderboard.
- [ ] Recargar en `#/detalle/caida` mantiene la pantalla de detalle de CAÍDA.
- [ ] `#/detalle/no-existe` y `#/loquesea` muestran la Biblioteca.
- [ ] El botón atrás del navegador vuelve a la pantalla anterior.
- [ ] En `#/jugar/caida` la puntuación del HUD aumenta sola; PAUSA la detiene y muestra "EN PAUSA"; REANUDAR la continúa.
- [ ] FIN abre el modal "FIN DEL JUEGO" con la puntuación final; GUARDAR PUNTUACIÓN añade una entrada a `av_scores` y muestra "▸ PUNTUACIÓN GUARDADA_".
- [ ] JUGAR DE NUEVO reinicia puntuación a 0, vidas a 3 y nivel a 01.
- [ ] Enviar el formulario de Acceso con usuario "px_kai" guarda `{"name":"PX_KAI"}` en `av_user`, navega a la Biblioteca y el Nav muestra "PX_KAI ▾".
- [ ] Clic en "PX_KAI ▾" borra `av_user` y el Nav vuelve a mostrar "Iniciar Sesión".
- [ ] Tras recargar con sesión iniciada, el Nav sigue mostrando el usuario.
- [ ] La pestaña CREAR CUENTA muestra el campo "Correo electrónico"; INICIAR SESIÓN lo oculta.
- [ ] El Salón de la Fama muestra podio de 3 y tabla de 12 filas; cambiar de pestaña cambia los datos.
- [ ] Con sesión iniciada, el Salón muestra la fila "▸ TU MEJOR MARCA EN <JUEGO>"; sin sesión no aparece.
- [ ] A 375px de ancho no hay scroll horizontal y la hamburguesa abre el panel móvil.
- [ ] No queda ningún `style={{…}}` inline copiado de la plantilla en `components/`.
- [ ] Ningún archivo usa `window.GAMES` ni globales de `window` para compartir componentes.

## Decisiones

- **Sí:** SPA con router por hash en una sola página (`app/page.tsx`). Fidelidad con el prototipo; decisión del usuario.
- **No:** rutas reales del App Router. Se deja para una spec futura; el formato legible del hash facilita esa migración.
- **Sí:** hash legible (`#/detalle/caida`). **No:** JSON codificado de la plantilla, ilegible.
- **Sí:** simulación del Reproductor igual que la plantilla (puntuación aleatoria, pausa, modal de fin). Permite mostrar todos los estados visuales sin juego.
- **Sí:** sesión y puntuaciones mock en `localStorage` (`av_user`, `av_scores`). **No:** estado solo en memoria.
- **Sí:** leer `localStorage` y `location.hash` solo dentro de `useEffect`. Evita desajustes de hidratación con el render del servidor.
- **Sí:** reusar las clases ya portadas en `app/globals.css`. **No:** reescribir todo en Tailwind; más trabajo y riesgo de perder fidelidad.
- **Sí:** `components/` y `lib/` en la raíz, importados con `@/`. **No:** `app/_components/`.
- **Sí:** fila "TU MEJOR MARCA" con datos mock como la plantilla. **No:** calcularla desde `av_scores`.
- **Sí:** un hash o `id` inválido cae en la Biblioteca. La plantilla renderizaba `null`, lo que dejaba la pantalla vacía.
- **Sí:** se mantiene el nombre "Arcade Vault" de la plantilla y del proyecto (la petición decía "Arcade Bot").

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Error de hidratación por leer `localStorage`/`location` en el render | Estado inicial fijo (`biblioteca`, `user = null`) y lectura en `useEffect`. |
| `cacheComponents: true` exige `<Suspense>` para datos dinámicos | Todo el estado es de cliente dentro de `ArcadeApp` (`"use client"`); no se usan APIs de request del servidor. Revisar `node_modules/next/dist/docs/` antes del paso 4. |
| `localStorage` bloqueado (modo privado) | Todas las lecturas/escrituras en `try/catch`; la app funciona sin persistir. |
| El intervalo de la simulación sigue vivo al salir del Reproductor | Limpiar el `setInterval` en el cleanup del `useEffect`. |
| `seededScores` con pocos jugadores únicos podría repetir nombres como `key` | Usar `name + índice` como `key`. |

## Qué **no** entra en esta spec

- Juegos jugables.
- Rutas reales del App Router.
- Autenticación, OAuth o backend reales.
- Leaderboards alimentados con puntuaciones guardadas.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
