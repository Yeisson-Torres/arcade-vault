# SPEC 03 — About y formulario de contacto con Resend

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-24
> **Objetivo:** Portar la pantalla About de `references/resources/resources/templates/home-about/home-about/about.jsx` en `#/about` y hacer que su formulario de contacto envíe un correo real al equipo mediante Resend desde una Server Action.

## Por qué existe esta spec

La SPEC 02 dejó el enlace "Acerca de" apuntando a la Home (`#/`) hasta que existiera esta pantalla.
La plantilla solo simula el envío: muestra la terminal de éxito sin contactar ningún servidor.
Esta spec introduce el primer código de servidor del proyecto (una Server Action) y el primer secreto (`RESEND_API_KEY`).
Por eso fija cómo se leen las variables de entorno, cómo se valida en servidor y qué ve el usuario cuando el envío falla, cosa que la plantilla no contempla.

## Alcance

**Dentro:**

- Nueva ruta `{ name: "about" }` en `#/about`.
- El enlace "Acerca de" del Nav (escritorio y panel móvil) navega a `#/about` y se marca como activo en esa ruta.
- Pantalla `About` con las secciones de la plantilla, en este orden y con el copy literal de `about.jsx`:
  1. **Hero:** "▸ ACERCA DE", título "ACERCA DE ARCADE VAULT", párrafo de misión y 3 highlights con icono pixel SVG (HEART magenta, BROWSER cyan, PLANT green).
  2. **Divisor:** dos barras degradadas y 24 píxeles parpadeantes con retraso escalonado.
  3. **Contacto:** "▸ CONTACTO", "CONTÁCTANOS", subtítulo, 3 tips con LED ("RESPUESTA EN 24-48H", "SUGERENCIAS BIENVENIDAS", "SIN SPAM, JAMÁS") y formulario (NOMBRE, CORREO ELECTRÓNICO, MENSAJE, botón "▶  ENVIAR MENSAJE").
- Animación `.reveal` en el divisor y la sección de contacto reutilizando `lib/useReveal.ts`.
- Validación en cliente: si algún campo está vacío (tras `trim`), el formulario se sacude 400 ms (`.shake`) y no se envía.
- Estado de envío: el botón pasa a "▶ TRANSMITIENDO…", queda deshabilitado y los campos pasan a `readOnly` hasta recibir respuesta.
- Server Action `sendContactMessage` que valida en servidor y envía **un** correo al equipo con el SDK `resend`.
- Correo en texto plano a `CONTACT_TO_EMAIL`, desde `CONTACT_FROM_EMAIL`, con `replyTo` igual al correo del jugador.
- Terminal de éxito idéntica a la plantilla ("GRACIAS, <NOMBRE>.") con botón "ENVIAR OTRO MENSAJE", que vacía el formulario.
- Terminal de error (nueva): misma ventana VAULT-OS con borde magenta, línea final `[ERR]` y botón "REINTENTAR" que vuelve al formulario conservando lo escrito.
- Honeypot oculto (`website`): si llega relleno, la acción responde éxito sin enviar correo.
- Variables de entorno `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` y `CONTACT_TO_EMAIL`, leídas solo en servidor.
- Archivo `.env.example` versionado con las tres variables sin valores, y excepción `!.env.example` en `.gitignore`.
- Portar a `app/globals.css` el bloque `ABOUT PAGE` de `styles.css` (sin duplicar reglas ya existentes) más las reglas nuevas de la terminal de error.

**Fuera de alcance (para specs futuras):**

- Correo de acuse de recibo al jugador (requiere dominio verificado en Resend).
- Plantillas HTML o React Email.
- Rate limiting, CAPTCHA o cualquier anti-spam más allá del honeypot.
- Guardar los mensajes en base de datos o en `localStorage`.
- Rellenar el nombre/correo con la sesión mock `av_user`.
- Verificación de dominio propio en Resend (se cambia por variable de entorno sin tocar código).
- Bloques `GAMEPAD` y `Theme variants` de `styles.css`.
- Rutas reales del App Router.
- Tests automatizados.

## Modelo de datos

```ts
// lib/router.ts — se añade "about"
export type Route =
  | { name: "home" }
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" }
  | { name: "about" };

// parseHash("#/about")           -> { name: "about" }
// parseHash("#/about/x")         -> { name: "home" }
// formatHash({ name: "about" })  -> "#/about"
```

```ts
// lib/contact.ts — tipos y validación compartidos por cliente y servidor (sin dependencias)
export interface ContactInput {
  name: string;     // 1–80 caracteres tras trim
  email: string;    // formato email básico, ≤ 254 caracteres
  msg: string;      // 1–2000 caracteres tras trim
  website: string;  // honeypot: debe llegar vacío
}

export type ContactErrorCode = "invalid" | "not_configured" | "send_failed";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: ContactErrorCode };

export const CONTACT_LIMITS = { name: 80, email: 254, msg: 2000 } as const;

// validateContact(input): { ok: true; data: ContactInput } | { ok: false }
// Devuelve los campos ya recortados (trim).
```

```ts
// lib/aboutData.ts — copy literal de about.jsx
import type { GameColor } from "@/lib/data";

export type HighlightIconKind = "HEART" | "BROWSER" | "PLANT";
export interface Highlight { icon: HighlightIconKind; text: string; color: GameColor }

export const HIGHLIGHTS: Highlight[]; // 3
```

```ts
// app/actions/contact.ts
"use server";
export async function sendContactMessage(input: ContactInput): Promise<ContactResult>;
```

```bash
# .env.example (versionado, sin valores) — los valores reales van en .env.local
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Correo enviado al equipo:

- **Asunto:** `[Arcade Vault] Mensaje de <nombre>`
- **Cuerpo (texto plano):** líneas `Nombre: <nombre>`, `Correo: <email>`, una línea en blanco y el mensaje.
- **replyTo:** `<email del jugador>`

Textos de la terminal de error, por código:

- `invalid` → `> DATOS NO VÁLIDOS. REVISA EL FORMULARIO.`
- `not_configured` y `send_failed` → `> NO SE PUDO TRANSMITIR. INTÉNTALO DE NUEVO.`

Convenciones:

- La UI nunca muestra el detalle técnico del error; el detalle va a `console.error` en el servidor.
- `RESEND_API_KEY` no se importa nunca desde un archivo `"use client"`.

## Plan de implementación

1. Ampliar `lib/router.ts` con `{ name: "about" }` y `#/about`. Añadir en `components/ArcadeApp.tsx` un placeholder temporal para `about`. Cambiar en `components/Nav.tsx` el enlace "Acerca de" (escritorio y móvil) a `{ name: "about" }` y marcarlo activo en esa ruta. Verificación: `npm run build` pasa; clic en "Acerca de" lleva a `#/about`.
2. Portar a `app/globals.css` el bloque `ABOUT PAGE` de `styles.css`, omitiendo selectores ya existentes (`.field`, `.btn.xl`, `@keyframes shake` si ya está). Añadir reglas `:nth-child` para los retrasos de `.highlight` y `.div-pixels span`. Añadir las reglas nuevas `.terminal-error` (borde y sombra magenta, línea `.line.error`).
3. Crear `lib/aboutData.ts` con `HIGHLIGHTS` y `components/about/HighlightIcon.tsx` con los tres SVG de la plantilla.
4. Crear `components/screens/About.tsx` con hero, divisor y la columna de introducción del contacto, usando `useReveal`. Sustituir el placeholder de `ArcadeApp`. Verificación: `#/about` muestra el hero y los 3 highlights.
5. Crear `lib/contact.ts` con los tipos, `CONTACT_LIMITS` y `validateContact`.
6. Crear `components/about/ContactForm.tsx` (cliente) con los tres campos, el honeypot oculto, la sacudida por campos vacíos y las vistas éxito / error. En este paso el envío llama a una función local que resuelve `{ ok: true }`. Verificación: enviar con campos llenos muestra la terminal de éxito; con uno vacío, se sacude.
7. Instalar `resend` (`npm install resend`). Crear `.env.example` y añadir `!.env.example` a `.gitignore`.
8. Crear `app/actions/contact.ts` con `sendContactMessage`: honeypot → éxito sin enviar; `validateContact` falla → `invalid`; falta alguna variable → `console.error` + `not_configured`; error de Resend → `console.error` + `send_failed`; si no, `{ ok: true }`. Consultar `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` y `environment-variables.md` antes de escribirlo.
9. Conectar `ContactForm` a `sendContactMessage` con `useTransition`, mostrando "▶ TRANSMITIENDO…" y bloqueando el formulario mientras `isPending`.
10. Dejar `npm run lint` y `npm run build` sin errores.

Al construir la UI se usa la skill `/frontend-design`, como indica `CLAUDE.md`, manteniendo la fidelidad visual a la plantilla.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] `#/about` muestra "ACERCA DE ARCADE VAULT" sin errores ni avisos de hidratación en consola; recargar en esa URL la mantiene.
- [ ] `#/about/x` muestra la Home.
- [ ] Clic en "Acerca de" (escritorio y panel móvil) cambia la URL a `#/about` y ese enlace queda marcado como activo.
- [ ] La pantalla muestra 3 highlights, el divisor con 24 píxeles y 3 tips de contacto.
- [ ] Pulsar "▶  ENVIAR MENSAJE" con algún campo vacío o solo con espacios sacude el formulario y no hace ninguna petición al servidor.
- [ ] Durante el envío el botón muestra "▶ TRANSMITIENDO…", está deshabilitado y los campos no se pueden editar.
- [ ] Con `.env.local` correcto, enviar el formulario hace llegar un correo a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de <nombre>` y el mensaje en el cuerpo.
- [ ] Responder a ese correo desde el cliente de correo lo dirige al email que escribió el jugador.
- [ ] Tras un envío correcto se ve la terminal "GRACIAS, <NOMBRE EN MAYÚSCULAS>."; "ENVIAR OTRO MENSAJE" muestra el formulario vacío.
- [ ] Sin `RESEND_API_KEY` en el entorno, enviar muestra la terminal de error "NO SE PUDO TRANSMITIR…" y el servidor registra un `console.error`.
- [ ] En la terminal de error, "REINTENTAR" vuelve al formulario con los tres campos conservando lo escrito.
- [ ] Llamar a `sendContactMessage` con un email sin `@` o un mensaje de más de 2000 caracteres devuelve `{ ok: false, error: "invalid" }` y no envía correo.
- [ ] Llamar a `sendContactMessage` con `website` no vacío devuelve `{ ok: true }` y no envía correo.
- [ ] El campo honeypot no es visible ni alcanzable con Tab (`tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`).
- [ ] `RESEND_API_KEY` no aparece en ningún archivo bajo `.next/static/` tras `npm run build`.
- [ ] `.env.example` está versionado y `.env.local` no aparece en `git status`.
- [ ] A 375px de ancho no hay scroll horizontal en `#/about`.
- [ ] No hay ningún `style={{…}}` inline en `components/screens/About.tsx` ni en `components/about/`.

## Decisiones

- **Sí:** hash `#/about`, decisión del usuario. **No:** `#/acerca`, aunque el resto de hashes estén en español.
- **Sí:** Server Action en `app/actions/contact.ts`. **No:** Route Handler `/api/contact`; no hay otros clientes y la acción evita mantener un endpoint público y da tipado de punta a punta.
- **Sí:** remitente configurable por `CONTACT_FROM_EMAIL` (en desarrollo `onboarding@resend.dev`). **No:** remitente fijo en código; al verificar un dominio solo cambia la variable.
- **Sí:** un único correo al equipo con `replyTo` del jugador. **No:** acuse al jugador; con `onboarding@resend.dev` Resend solo entrega al dueño de la cuenta.
- **Sí:** correo en texto plano. **No:** HTML ni React Email; evita inyección de HTML y dependencias extra.
- **Sí:** terminal de error con "REINTENTAR" que conserva los datos. **No:** mensaje suelto bajo el botón; mantiene la estética VAULT-OS.
- **Sí:** botón deshabilitado "▶ TRANSMITIENDO…" durante el envío. **No:** terminal animada en vivo; más lógica sin valor funcional.
- **Sí:** validación manual en cliente (vacíos) y servidor (trim, formato, límites) en `lib/contact.ts`. **No:** zod; no merece una dependencia para tres campos.
- **Sí:** honeypot que responde éxito silencioso. **No:** rate limit en memoria; poco fiable en serverless y va en otra spec si hace falta.
- **Sí:** variable faltante → error en UI + `console.error`. **No:** fallar al arrancar; la app debe funcionar aunque el contacto no esté configurado.
- **Sí:** `.env.example` versionado. **No:** documentar las variables solo en la spec.
- **Sí:** la API key la guarda el usuario en `.env.local`. **No:** escribirla en la spec, en el código ni en el chat.
- **Sí:** reutilizar `useReveal` con `ref` del contenedor. **No:** `document.querySelectorAll(".reveal")` global de la plantilla.
- **Sí:** retrasos escalonados por `:nth-child` en CSS. **No:** `style={{…}}` inline, por coherencia con SPEC 01 y 02.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Filtrar `RESEND_API_KEY` al bundle del cliente | Solo se lee en `app/actions/contact.ts` (`"use server"`), sin prefijo `NEXT_PUBLIC_`; criterio de aceptación que revisa `.next/static/`. |
| Commitear la API key por accidente | `.gitignore` ya excluye `.env*`; solo se exceptúa `.env.example`, que no lleva valores. |
| Con `onboarding@resend.dev`, Resend rechaza destinatarios distintos al dueño de la cuenta | `CONTACT_TO_EMAIL` debe ser el correo de la cuenta Resend hasta verificar un dominio; el fallo se ve como terminal de error y `console.error`. |
| Spam masivo vía la acción, que es invocable aunque no haya formulario | Honeypot + validación de límites en servidor; rate limit queda para otra spec. |
| Inyección en cabeceras o en el cuerpo del correo | Texto plano, campos recortados y límites de longitud; Resend construye las cabeceras con `replyTo` validado como email. |
| Reglas CSS de `ABOUT PAGE` que chocan con las ya portadas (`.field`, `.shake`) | Portar por bloques omitiendo selectores existentes. |

## Qué **no** entra en esta spec

- Acuse de recibo al jugador.
- Correos HTML o React Email.
- Rate limiting o CAPTCHA.
- Persistencia de mensajes.
- Autorrelleno con la sesión mock.
- Dominio propio verificado en Resend.
- Rutas reales del App Router.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
