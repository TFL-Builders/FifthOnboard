# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The React/Vite frontend for a "Staff Onboarding Platform" onboarding app. This `client/` folder is part of a larger monorepo (there is a sibling `server/` — an Express + Mongoose API — one level up); this file covers the client only.

## Commands

Run from `client/`:

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint over the project

There is no test setup in this project yet (no test script, no test runner installed).

## Architecture

- **Entry point**: [src/main.jsx](src/main.jsx) mounts `<App />` into `#root`.
- **Routing**: [src/App.jsx](src/App.jsx) defines all routes with `react-router-dom` (`BrowserRouter`/`Routes`/`Route`). Currently the catch-all route (`*`) renders `Login`, alongside explicit routes for `/forgot-password` and `/create-account`. There is no authenticated/dashboard area yet — this app currently only covers the auth entry flow.
- **Pages**: live in `src/Pages/` (note the capital `P`), one component per route — [Login.jsx](src/Pages/Login.jsx), [CreateAcc.jsx](src/Pages/CreateAcc.jsx), [ForgotPass.jsx](src/Pages/ForgotPass.jsx). These are currently static forms with no submit handlers or API calls wired up (`action="/submit_form"` is a placeholder); there is no API client, no auth/session state, and no global state management in the app yet.
- **Styling**: Tailwind CSS v4 via the `@tailwindcss/vite` plugin (see [vite.config.js](vite.config.js)) — there is no `tailwind.config.js`. Theme customization (e.g. `--color-background`, `--color-primary`) is done via an inline `@theme` block in [src/index.css](src/index.css), which is imported once in `main.jsx`. Prefer extending that `@theme` block over hardcoding new hex values in components.
- Password-visibility toggles (show/hide with inline SVG eye icons) are duplicated per-field across `Login.jsx` and `CreateAcc.jsx`; if adding another password field, follow the existing local `useState` + inline SVG pattern used there unless asked to refactor it into a shared component.
