---
name: design
description: FifthOnboard client design system — use when creating or styling any UI component in client/src
---

## Styling approach

Tailwind CSS v4, configured CSS-first via `@tailwindcss/vite` (see `client/vite.config.js`) — there is no `tailwind.config.js`. Theme tokens live in an `@theme` block in `client/src/index.css`. No custom CSS files exist beyond that (`App.css` is empty); don't add one unless a Tailwind utility genuinely can't express what you need.

A shared component kit lives in `src/Components/` — see **Component patterns** below for the full list. Some older pages (`pages/app/Profile.jsx`'s Account Info fields, `Components/InviteTeammate.jsx`'s role/department dropdown triggers) still hand-roll markup that predates these components and hasn't been migrated. Prefer swapping to the shared component whenever you're touching that code anyway; there's no standing task to do a big-bang migration.

## Color palette

Three colors are promoted to theme tokens; the rest are used as Tailwind arbitrary hex values (`text-[#64748B]`, `border-[#E5E7EB]`, etc.) scattered across pages. Treat the table below as the de facto palette — reuse these exact values for new work instead of picking a new nearby shade.

| Token / hex | Role | Notes |
|---|---|---|
| `bg-background` → `#F9FAFB` | Page background | Theme token — always use `bg-background`, not the raw hex |
| `text-primary` / `bg-primary` / `border-primary` → `#06B6D4` | Brand color — primary buttons, links, active nav state, focus accents | Theme token |
| `border-border` → `#E1E7EF` | Card border color (e.g. template cards) | Theme token — prefer this over `border-[#E5E7EB]`/`border-[#64748B]` for new card borders |
| `#0891B2` | Darker primary, used for icon strokes inside light icon badges (`bg-[#ECFEFF]`) | Not yet a token — see Rules |
| `#ECFEFF` | Light icon-badge background (pairs with `#0891B2` icon) | |
| `#F0F9FF` | Hover/active background for list rows (e.g. sidebar user card) | |
| `#64748B` | Standard muted/secondary text — the most common non-heading text color | Use this, not `#65758B` (a one-off typo, already fixed in `Sidebar.jsx`) |
| `#94A3B8` | Lighter muted text — timestamps, placeholders, de-emphasized meta text | |
| `#E5E7EB` | Standard border color — inputs, dividers, badge outlines | Default for form-control borders; use `border-border` instead for card borders |
| `#E2E8F0` | Alternate divider color, used once under forms | Prefer `#E5E7EB` for new work |
| `#0F1729` | Near-black heading/body text (used once) | Reasonable default for primary text if you need something darker than browser default |
| `#10B981` / `#059669` | Success (emerald) — status dots, password-rule checkmarks | |
| `text-red-500` | Validation error text (e.g. "passwords do not match") | Use for form-level errors |
| `text-red-900` | Logout / destructive action text | Heavier than standard red — reserved for the logout affordance, not general errors |

## Typography

Font: **DM Sans**, with a system-ui fallback — loaded via `@import url(...)` at the top of `index.css` and registered as `--font-sans` in the `@theme` block, so it applies globally as Tailwind's default sans stack. Don't set `font-family` per component.

Fixed scale — these are the base/desktop sizes; scale down on small screens with a responsive prefix rather than hardcoding one size everywhere (e.g. `text-[24px] sm:text-[30px]` for a heading):

| Use | Size | Notes |
|---|---|---|
| Page heading | 30px | e.g. "Templates", "Profile Settings" — baked into the `PageHeading` component |
| Subheading | 16px | the subtitle line directly under a page heading — also baked into `PageHeading` |
| Everything else (body, labels, buttons, form text) | 14px | the default — don't reach for a nearby size out of habit |
| Auth hero heading (e.g. "Welcome Back") | 36px, bold | existing exception, larger than a standard page heading |
| Small meta text (timestamps, badges) | 12px | existing exception, smaller than body |

## Component patterns

A real component kit exists in `src/Components/` — import these rather than re-authoring the markup:

- **`Button`** — `variant` prop: `"primary"` (default; full-width `w-100 h-12`, form-submit style, hover inverts to outline), `"action"` (compact, icon + label, toolbar context, e.g. "New Template"), `"secondary"` (bare outline, e.g. modal Cancel). Extra `className` merges in; everything else spreads onto the `<button>` (`type`, `form`, `onClick`, `disabled`, ...).
- **`Input`** — labeled text input (`label`, `id`, plus native input props). Pass `noMargin` to drop its default `mb-4` when composing inside a `gap-*` flex/grid container (e.g. a grid cell — see Gotchas below). `label` accepts a node, so colored `<span>` fragments inside a label work fine.
- **`PasswordInput`** — same API as `Input`, but self-contained: owns its own show/hide state and renders the eye-toggle button internally. Don't reimplement the toggle per page.
- **`Textarea`** — same API as `Input`, multi-line, `rows={3}` default.
- **`Select`** — native `<select>` styled to match, with a `ChevronDown` overlay. Same `label`/`id`/`noMargin` API, plus `options` (array of strings rendered as `<option>`s).
- **`PageHeading`** — `title` + optional `subtitle`, fixed at the 30px/16px scale above. Use this instead of hand-writing page titles.
- **`IconBadge`** — tinted icon container (`bg-[#ECFEFF]`), size/radius/padding passed via `className` since usages vary (`rounded-full p-4`, `rounded-md p-2 w-9 h-9`, etc.).
- **`Badge`** — pill/tag (`text-[12px] border border-[#E5E7EB] rounded-full px-2 py-0.5`) — see the category tag on template cards.
- **`IconButton`** — small square icon-only button, `variant`: `"default"` or `"danger"` (red hover, for delete-style actions).
- **`NewTemplateModal`** — full worked example of composing the above into a real form: overlay + centered panel (`fixed inset-0 bg-black/40` → `bg-white rounded-2xl shadow-2xl`, click-outside-to-close via `stopPropagation` on the inner panel), sectioned with bordered `border-border rounded-xl` cards, dynamic list state. Copy this shell for the next modal rather than re-deriving the overlay/panel pattern; `Components/InviteTeammate.jsx` is an older modal that predates this pattern and hasn't been converged onto it.

Still hand-rolled markup (no component yet — cite the file, don't copy-paste into a third place without extracting one):

- **Auth card shell**: outer `flex justify-center items-center bg-background min-h-screen py-10 overflow-y-auto`, card `max-w-md`, inner `page-container` with `shadow-2xl rounded-b-2xl`, content `card flex flex-col gap-8 px-6` — see any file in `pages/auth/`.
- **Content/settings card**: `border border-[#64748B] rounded-xl`, header strip `border-b border-[#64748B] p-4` — see `pages/app/Profile.jsx`. (Predates the `border-border` token; new cards should use `border-border` instead per the palette table.)
- **Sidebar nav item**: real `react-router` `NavLink`s (not manual active-state tracking) — active `bg-primary text-white hover:brightness-95`, inactive `text-[#64748B] hover:bg-background hover:text-black`, both on `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors` — see `Components/Sidebar.jsx`. The sidebar itself is a fixed `w-64` (not viewport-relative), `bg-white border-r border-border`, with a working collapse toggle (`w-20`, icon-only, labels hidden) rather than a decorative one.
- **Icons**: prefer `lucide-react` (already a dependency, used throughout `Templates.jsx` and `NewTemplateModal.jsx`) for anything new. Most older icons are hand-copied inline SVGs from a design tool — don't add more of those; use a lucide icon instead, even if it means a page mixes both styles for now.

### Gotcha: Fragment-returning inputs inside CSS grid

`Input`/`Select`/`Textarea` return a Fragment of `[label, control]` so they work as direct siblings in a `flex flex-col` form. If you place one of them directly as a child of a `grid` container, its label and control become **separate grid cells** instead of a stacked pair (this was a real bug in `NewTemplateModal`'s 3-column task row). Always wrap each field in its own `<div>` when using them inside a `grid`.

## Spacing / layout

- App page padding: `p-8` on the outer content wrapper (see `Dashboard.jsx`, `Templates.jsx`).
- Card gaps: `gap-3`–`gap-4` for compact cards, `gap-6`–`gap-8` for auth/form sections.
- Radius scale: `rounded-[5px]` inputs → `rounded-md` buttons/icon squares → `rounded-xl` settings cards / modal sections → `rounded-2xl` data cards (e.g. template cards) → `rounded-full` avatars/pills/circular icon badges.
- Sidebar is fixed at `w-[12vw]`; app content sits in a `flex-1` region next to it (`layouts/Layout.jsx`).
- Auth pages cap card width at `max-w-md` and center with flex; use `min-h-screen` + `overflow-y-auto` (not bare `h-screen`) so content isn't clipped on short viewports.

## Rules

- Reuse the exact hex values in the palette table above — don't introduce a nearby-but-different shade of gray/blue for something that already has a color.
- If a color gets used a third time, promote it into the `@theme` block in `index.css` as a named token instead of repeating the arbitrary hex.
- New icons: use `lucide-react`, not hand-copied inline SVG paths.
- Buttons always get a `hover:` state and `transition-colors` (every existing button does this — keep it up).
- Every focusable form control gets `focus:border-primary focus:outline-none` (and typically `hover:border-primary` too) — this is baked into `Input`/`Textarea`/`Select`/`PasswordInput` already; apply it by hand only to raw `<input>`/`<select>`/`<button>` markup that hasn't been migrated onto those components yet.
- Don't add a `tailwind.config.js` — this project is Tailwind v4 CSS-first; configure via `@theme` in `index.css`.
- Anything reusable — buttons, cards, badges, icon badges, page headings, form fields — gets extracted into a component in `src/Components/` the first time it's about to be copy-pasted, not left as duplicated markup across pages. Check `src/Components/` first; there's a good chance the piece you're about to build already exists.
