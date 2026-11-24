# SPEC 02 — Home (landing) de Arcade Vault

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-24
> **Objetivo:** Portar la Home de `references/resources/resources/templates/home-about/home-about/home.jsx` como nueva pantalla de entrada en `#/`, moviendo la Biblioteca a `#/biblioteca`.

## Por qué existe esta spec

La SPEC 01 dejó la Biblioteca como pantalla de entrada (`#/`).
La nueva plantilla `home-about` añade una landing (Home) y un Nav de cuatro enlaces.
Esta spec porta solo la Home; la pantalla About y su formulario de contacto van en una spec propia.
Cambia el contrato de rutas de la SPEC 01, así que se documenta aquí qué criterios de aquella quedan sustituidos.

## Alcance

**Dentro:**

- Nueva ruta `{ name: "home" }` en `#/`; la Biblioteca pasa a `#/biblioteca`.
- Hashes desconocidos e `id` inexistentes caen en la Home (antes caían en la Biblioteca).
- Nav con cuatro enlaces en escritorio y panel móvil: "Inicio", "Biblioteca", "Salón de la Fama", "Acerca de".
- El logo y "Inicio" navegan a la Home. "Acerca de" navega también a la Home (`#/`) hasta que exista la spec de About.
- Pantalla `Home` con las secciones de la plantilla, en este orden:
  1. **Hero:** siluetas pixel flotantes (8 SVG), "▸ INSERTA UNA MONEDA_" con parpadeo, título en 3 líneas "EL ARCADE / CLÁSICO ESTÁ / DE VUELTA", subtítulo, botones "▶ EXPLORAR JUEGOS" (→ Biblioteca) y "✦ CREAR CUENTA" (→ Acceso), indicador "DESLIZA ▼".
  2. **// 01 ¿POR QUÉ ARCADE VAULT?:** 4 tarjetas (JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS, SIEMPRE CRECIENDO) con icono pixel SVG.
  3. **// 02 JUEGOS DISPONIBLES AHORA:** carril con los 6 primeros `GAMES` como mini‑tarjetas (clic → `#/detalle/:id`) y botón "VER TODOS LOS JUEGOS →" (→ Biblioteca).
  4. **Franja de estadísticas:** "12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING".
  5. **// 03 ACTIVIDAD EN VIVO:** "▸ ÚLTIMAS PUNTUACIONES" (7 filas) y "▸ TOP JUGADORES · HOY" (5 filas con barra) con botón "VER SALÓN →" (→ Salón).
  6. **// 04 PRECIOS:** tarjeta "JUGADOR VAULT $0 / SIEMPRE" con 6 ventajas, sello "FREE PLAY", botón "EMPEZAR GRATIS →" (→ Acceso) y 3 preguntas FAQ.
  7. **CTA final:** "¿LISTO PARA JUGAR?" y botón "INSERTAR MONEDA →" (→ Biblioteca).
- Animación de aparición al hacer scroll (`.reveal` → `.reveal.in`) con `IntersectionObserver`.
- Textos copiados literalmente de `home.jsx` (incluidos "12+ JUEGOS" y "Arkanoid, Tetris, Snake").
- Portar a `app/globals.css` las reglas de la plantilla que faltan: bloques `HOME PAGE`, `ACTIVITY (leaderboard + ticker)` y `PRICING` de `styles.css`.

**Fuera de alcance (para specs futuras):**

- Pantalla About / "Acerca de" y su formulario de contacto (estado de terminal, sacudida de error).
- Bloques `ABOUT PAGE`, `GAMEPAD` y `Theme variants` de `styles.css`.
- Datos reales en "Actividad en vivo" o "Top jugadores" (se usan listas mock fijas).
- Lógica de pagos o planes: la sección de precios es solo visual y sus botones solo navegan.
- Adaptar el copy a los datos reales (número de juegos, nombres).
- Rutas reales del App Router.
- Tests automatizados.

## Modelo de datos

```ts
// lib/router.ts — se añade "home" y cambia la ruta por defecto
export type Route =
  | { name: "home" }
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };

export const HOME: Route = { name: "home" };
// parseHash("#/")            -> { name: "home" }
// parseHash("#/biblioteca")  -> { name: "biblioteca" }
// parseHash("#/loquesea")    -> { name: "home" }
// formatHash({ name: "biblioteca" }) -> "#/biblioteca"
```

```ts
// lib/homeData.ts — listas mock de la Home, mismos valores que home.jsx
import type { GameColor } from "@/lib/data";

export type FeatureIconKind = "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";

export interface Feature { icon: FeatureIconKind; title: string; desc: string; color: GameColor }
export interface HomeStat { n: string; unit: string; sub: string }            // "12+", "JUEGOS", "Y CONTANDO"
export interface RecentScore { player: string; game: string; score: number; ago: string; color: GameColor }
export interface TopPlayer { rank: number; player: string; score: number }

export const FEATURES: Feature[];          // 4
export const HOME_STATS: HomeStat[];       // 3
export const RECENT_SCORES: RecentScore[]; // 7
export const TOP_PLAYERS: TopPlayer[];     // 5
```

Convenciones (las mismas de la SPEC 01):

- Números con `toLocaleString("es-ES")`.
- Rango de Top jugadores con dos dígitos: `#01`…`#05`.

## Plan de implementación

1. Ampliar `lib/router.ts`: añadir `{ name: "home" }`, `HOME = { name: "home" }`, `#/` → home, `#/biblioteca` → biblioteca, y lo desconocido → home. Añadir en `components/ArcadeApp.tsx` un placeholder temporal para `home`. Verificación: `npm run build` pasa; `#/biblioteca` muestra la Biblioteca y `#/` el placeholder.
2. Actualizar `components/Nav.tsx`: logo → home; enlaces "Inicio", "Biblioteca", "Salón de la Fama", "Acerca de" (este último → home) en escritorio y panel móvil. "Inicio" está activo en `home`; "Acerca de" nunca se marca como activo. Revisar que `Library`, `GameDetail`, `GamePlayer`, `Auth` y `HallOfFame` sigan navegando a `{ name: "biblioteca" }` donde corresponde.
3. Portar a `app/globals.css` los bloques `HOME PAGE`, `ACTIVITY` y `PRICING` de `styles.css`, sin duplicar reglas ya existentes (`.btn.xl`, `.pulse`, `.btn.magenta`, `.fade-in`). Añadir reglas `:nth-child` para los retrasos escalonados y el ancho de `.tp-fill` (ver Decisiones). Respetar `prefers-reduced-motion` en `.reveal`.
4. Crear `lib/homeData.ts` con `FEATURES`, `HOME_STATS`, `RECENT_SCORES` y `TOP_PLAYERS`.
5. Crear `components/home/FloatingSilhouettes.tsx`, `components/home/FeatureIcon.tsx` y `components/home/MiniCard.tsx`.
6. Crear `lib/useReveal.ts` (hook cliente que observa `.reveal` dentro de un `ref` y añade `in`; desconecta en el cleanup).
7. Crear `components/screens/Home.tsx` con Hero, // 01 y // 02, y sustituir el placeholder de `ArcadeApp`. Verificación: `#/` muestra el hero; clic en una mini‑tarjeta lleva a `#/detalle/<id>`.
8. Añadir a `Home.tsx` la franja de estadísticas, // 03 ACTIVIDAD EN VIVO, // 04 PRECIOS y el CTA final.
9. Dejar `npm run lint` y `npm run build` sin errores.

Al construir la UI se usa la skill `/frontend-design`, como indica `CLAUDE.md`, manteniendo la fidelidad visual a la plantilla.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Abrir `http://localhost:3000/` muestra la Home (hero "EL ARCADE CLÁSICO ESTÁ DE VUELTA") sin errores ni avisos de hidratación en consola.
- [ ] `#/biblioteca` muestra la Biblioteca con 8 tarjetas; recargar en esa URL la mantiene.
- [ ] `#/loquesea` y `#/detalle/no-existe` muestran la Home.
- [ ] El Nav de escritorio muestra, en orden, "Inicio", "Biblioteca", "Salón de la Fama", "Acerca de"; el panel móvil muestra los mismos más "Iniciar Sesión"/"Cuenta".
- [ ] En la Home, "Inicio" está marcado como activo; en `#/detalle/caida`, lo está "Biblioteca".
- [ ] Clic en el logo, en "Inicio" o en "Acerca de" cambia la URL a `#/`.
- [ ] "▶ EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" llevan a `#/biblioteca`.
- [ ] "✦ CREAR CUENTA" y "EMPEZAR GRATIS →" llevan a `#/auth`; "VER SALÓN →" lleva a `#/salon`.
- [ ] La sección // 02 muestra exactamente 6 mini‑tarjetas; clic en la primera lleva a `#/detalle/<id del primer juego de GAMES>`.
- [ ] La sección // 01 muestra 4 tarjetas y la sección // 03 muestra 7 filas de puntuaciones y 5 de top jugadores.
- [ ] Al hacer scroll, cada sección `.reveal` pasa de invisible a visible (gana la clase `in`).
- [ ] Con `prefers-reduced-motion: reduce`, las secciones `.reveal` son visibles sin animación.
- [ ] A 375px de ancho no hay scroll horizontal en la Home.
- [ ] No hay ningún `style={{…}}` inline en `components/screens/Home.tsx` ni en `components/home/`.
- [ ] Ningún archivo usa globales de `window` para compartir componentes o datos.

## Decisiones

- **Sí:** solo Home en esta spec. **No:** About + contacto, que van en su propia spec. Spec más pequeña y verificable.
- **Sí:** Home en `#/` y Biblioteca en `#/biblioteca`, como en la plantilla. **No:** Home en `#/inicio`; la portada debe ser la entrada.
- **Sí:** hash inválido → Home. Sustituye los criterios de la SPEC 01 que esperaban la Biblioteca en `#/`, `#/loquesea` y `#/detalle/no-existe`.
- **Sí:** el Nav muestra los 4 enlaces de la plantilla ya ahora. **Sí:** "Acerca de" lleva a la Home hasta que exista About. **No:** un placeholder `#/acerca` ni un enlace deshabilitado; decisión del usuario.
- **Sí:** copy literal de `home.jsx`, aunque diga "12+ JUEGOS" y haya 8. **No:** adaptarlo ahora; es trivial cambiarlo después.
- **Sí:** listas mock fijas en `lib/homeData.ts`. **No:** derivarlas de `GAMES`/`seededScores()`; la plantilla usa valores fijos con nombres concretos.
- **Sí:** retrasos escalonados (`transitionDelay`, `animationDelay`) y ancho de `.tp-fill` mediante reglas `:nth-child` en CSS. **No:** `style={{…}}` inline, por coherencia con la SPEC 01.
- **Sí:** `useReveal` con `ref` del contenedor de la Home. **No:** `document.querySelectorAll(".reveal")` global como la plantilla; podría tocar elementos de otras pantallas.
- **Sí:** portar solo los bloques CSS que usa la Home. **No:** `ABOUT PAGE`, `GAMEPAD` ni `Theme variants`.
- **Sí:** componentes auxiliares en `components/home/`, siguiendo la convención `components/` + `lib/` de la SPEC 01.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las secciones `.reveal` quedan invisibles si el observer no corre (JS lento, entorno sin `IntersectionObserver`) | Si `IntersectionObserver` no existe, el hook añade `in` a todo de inmediato. Con `prefers-reduced-motion`, `.reveal` es visible por CSS. |
| Enlaces internos que aún apuntan a `#/` esperando la Biblioteca | El paso 2 revisa todas las llamadas a `navigate` y `formatHash`; criterio de `#/biblioteca` en aceptación. |
| Reglas CSS de la plantilla que chocan con las ya portadas en `globals.css` | Portar por bloques y omitir selectores ya existentes (`.btn.xl`, `.pulse`, `.fade-in`). |
| Error de hidratación por la ruta inicial | `useHashRoute` ya arranca con `HOME` en servidor y cliente y lee el hash en `useEffect`; ahora `HOME` es la Home. |
| Scroll horizontal en móvil por las siluetas flotantes del hero | `.home-hero` con `overflow: hidden` (como en la plantilla); comprobado en el criterio de 375px. |

## Qué **no** entra en esta spec

- Pantalla About / "Acerca de" y formulario de contacto.
- Datos reales en actividad, ranking o estadísticas.
- Pagos o planes reales.
- Copy adaptado a los juegos reales.
- Rutas reales del App Router.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
