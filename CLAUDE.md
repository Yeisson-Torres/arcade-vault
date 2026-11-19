# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault is an online gaming platform where players compete for the highest scores. The README (in Spanish) states the project follows **Spec Driven Design** using the `/spec` and `/spec-impl` skills from https://github.com/Klerith/fernando-skills (installed with `npx skills@latest add Klerith/fernando-skills`). When adding features, write/update the spec first, then implement from it.

The repo is currently a fresh Create Next App scaffold (`app/layout.tsx`, `app/page.tsx`); no game, scoring, or backend code exists yet.

## Commands

- `npm run dev` — dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build (also the type check; there is no separate `tsc` script)
- `npm run start` — serve the production build
- `npm run lint` — ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript)

No test framework is configured yet.

## Stack and non-default configuration

- **Next.js 16.4 (App Router) + React 19.3 + TypeScript.** Per AGENTS.md, APIs differ from older Next.js — check `node_modules/next/dist/docs/` (`01-app`, `03-architecture`, …) before writing Next-specific code.
- `next.config.ts` enables options that change how code must be written:
  - `cacheComponents: true` — Cache Components model (`"use cache"`, dynamic data must be inside `<Suspense>`); read the docs before fetching data or using request APIs in components.
  - `partialPrefetching: true` and `experimental.agentFeedback: true`.
  - Tailwind is wired through a Turbopack rule (`@tailwindcss/turbopack` loader for `*.css`), not PostCSS — there is no `postcss.config`.
- **Tailwind CSS v4**: configured CSS-first in `app/globals.css` (`@import "tailwindcss"` + `@theme inline`); there is no `tailwind.config` file. Theme tokens (`--background`, `--foreground`, Geist font vars) live there.
- Layouts/pages use the generated global types (e.g. `LayoutProps<"/">`) rather than hand-written prop types.
- Import alias: `@/*` maps to the repo root.

#Styles

Usa siempre /fronted-design para diseñar la interfaz de usuario.
