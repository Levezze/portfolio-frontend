# Portfolio Frontend

levezze.com: a one-page site whose four pages (Chat, Projects, Resume, Contact) are faces of a viewport-sized **sliced prism**. A page turn snapshots the live page, hides the DOM, rotates the slices in a stagger, then shows the live target page again. Dark only. The chat is "Gimli", served over WebSocket by `portfolio-backend`.

pnpm, Next.js 15 (App Router, Turbopack), React 19, Tailwind v4 (CSS-first, `src/app/globals.css`), React Three Fiber, motion/react, modern-screenshot, biome, vitest + jsdom.

## Gates

```bash
pnpm exec tsc --noEmit -p .
pnpm exec biome check src
pnpm exec vitest run
```

Run each unpiped and read its exit code. Vercel builds every push; production deploys from `main`.

## Map

Everything lives in `src/components/lab/`; `src/app/page.tsx` only renders `<LabApp />`.

| file | owns |
|---|---|
| `LabApp.tsx` | Phases (intro, locking, idle, turning), page snapshots, the turn sequence, resize gating, the no-prism fallback |
| `PrismScene.tsx` | The R3F canvas: slices, light, and the imperative `PrismHandle` (`turn`, `startIntro`, `lockIntro`, `snap`) |
| `layout.ts`, `motion.ts` | Slice geometry from the viewport; per-slice turn plans and easing |
| `config.ts` | **Every tunable value** (motion, light, slice size, skin). Change it here, nowhere else |
| `presets.ts`, `fonts.ts` | Palettes and design tokens; self-hosted fonts via `next/font/local` |
| `pages/` | One file per page plus `shared.tsx` (Frame, panel, blurs, media). `LabPages.tsx` is the index |
| `content.ts` | All copy about Lev: projects, resume, welcome text. Mirrors the backend seeds |
| `chat.ts`, `useLabChat.ts` | Pure chat logic (wire format, error copy, typing pace) and the hook that drives it |
| `backStack.ts` | The browser back button undoes page turns and in-page steps |
| `Drift.tsx`, `Cubes.tsx` | Background glow and passing cube shadows; both stop under reduced motion |

`src/lib/api/core/wsManager.ts` is the one WebSocket client. It queues sends while offline and never fails them; `useLabChat` owns the timeouts.

## Rules that are easy to break

- **Snapshots must match the screen.** Anything that differs between the live page and its snapshot shows as a jump at the end of a turn. That is why the drift runs on one shared clock that pauses during turns, why media is same-origin (`public/media`, or the Next image route), and why overlays carry `data-lab-nocapture`.
- **Panel borders go through `--panel-line`.** `panel` sets the border inline, which beats any Tailwind class. Change the colour with `hover:[--panel-line:var(--accent)]`, not `hover:border-*`.
- **Copy about Lev comes from the user or the backend seeds.** Never invent it. Keep `content.ts` and the backend's `profile.json` and seeds in step when either changes.
- **Type never goes below 14px.**
- **A turn always ends.** A failed snapshot or turn still lands on the target page, and with no WebGL the pages show without the prism. Keep any new async step inside that guarantee.

## Dev server

`preview_start` with name `frontend` (port 4317). The file watcher misses changes, so restart after edits: stop, `rm -rf .next`, start. Port 3000 belongs to another project.

## Stale docs

`docs/decisions/adr_0002`–`0004` and `docs/implementation/` describe the retired rotating-cube site. Read them for history only. `adr_0005` (chat security) still applies to the backend contract.
