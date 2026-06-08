# Mezzo

**Mezzo** is a browser-based 3D interactive educational visualizer for mesocyclones and tornadoes.

Explore the full lifecycle of a supercell tornado in a flowing, time-scrubbable simulation. Click the physicalized pulsing hotspots that ride along with the storm features. Scrub the timeline to see wall cloud formation, funnel descent, mature tornado, and rope-out. Learn the science through accurate, lightly-written educational content and synchronized data visualizations.

- Pure client-side (WebGL / Three.js)
- 100% static — deployable to Render free tier (or any static host)
- Beautiful, consistent 1950s Fallout / U.S. civil defense / vintage educational film aesthetic (all decorative art generated with Grok Imagine)

**Status**: Complete. Built following the full AI orchestration harness (plans/ + art/). A time-scrubbable 3D simulation of the tornado lifecycle with exactly 8 dynamic physicalized pulsing hotspots whose positions are driven by the pure simulation core. Volumetric clouds, flowing particles, data visualization, and strict 1950s Fallout / U.S. civil defense educational film theme throughout.

Live experience: `npm run dev` (or open the built `dist/`).

Ready for Render free tier static deploy (see render.yaml and plans/08).

## Quick Start

```bash
npm install
npm run dev
```

The app is fully functional in the browser:
- Scrub or play the prominent time control to watch the full lifecycle (wall cloud → funnel descent & touchdown → mature tornado → rope-out).
- The 8 pulsing hotspots in the 3D view move intelligently with their storm features (positions are authoritative from the pure `src/sim` core — no hard-coded locations).
- Click any ball (or the legend) to load the exact educational content for that topic.
- Data panel shows live scalars (pressure drop, wind, updraft, precip) that match the visual simulation.
- Full keyboard support (space, arrows, 1-4, Home/End).

Build for static deploy (pure `dist/` — perfect for Render free tier):

```bash
npm run build
npm run preview   # local verification
# or push to GitHub → Render Static Site (build: `npm install && npm run build`, publish: `dist`)
```

## The Harness (for contributors & agents)

This project is deliberately built with a strong documentation-first harness so that it can be implemented, reviewed, and extended reliably by AI agents (or humans) over time.

**Start here**:
- `plans/00-master-build-instructions.md` — the constitution. Read this before touching code.
- Then the numbered plans in order.

All visual direction, simulation contracts, exact content for the 8 topics, UI behavior, and Render deployment steps live in the `plans/` and `art/` directories.

## Key Features (target)

- Time scrubber driving a full lifecycle simulation (phase 0 → 1)
- Volumetric clouds + light scripted fluid / particle flow
- Exactly 8 dynamic physicalized pulsing hotspots whose 3D positions are authoritative functions of simulation phase
- Expandable data visualization panel (pressure, winds, updraft, precip) synced to phase + topic selection
- Strict retro 1950s government-educational poster theme throughout (generated assets)
- Fully procedural (no Blender models in v1); clean hooks for future assets
- Keyboard, touch, and mouse friendly
- Zero backend, zero cost, zero tracking

## Science Sources

Primary: NOAA National Severe Storms Laboratory (NSSL) Severe Weather 101 — Tornado Basics, Storm Prediction Center (SPC) Tornado FAQ, and classic supercell / mesocyclone research concepts (VORTEX program, etc.).

The 8 topics and all numbers/claims must stay faithful to these sources (see the content spec in the harness).

## Deployment

**Target**: Render Static Sites (free tier) — pure client-side, zero cost.

1. Push to GitHub (this repo).
2. In Render dashboard: New → Static Site → connect `mezzo` repo.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. (Optional) The included `render.yaml` can be used for infra-as-code.

See `plans/08-deployment-render-static.md` for the full agent checklist and post-deploy verification.

A `dist/` produced by `npm run build` can also be served by any static host (`python -m http.server -d dist`, Vercel, Netlify, etc.).

## Verification (performed during build)
- Repeated `npm run build` (tsc + Vite) clean.
- The experience matches the master requirements: time-scrubbable full lifecycle, exactly 8 dynamic physicalized pulsing hotspots whose 3D positions come from the sim, volumetric clouds, light fluid particles via velocity field, expandable data + knowledge panels, prominent thematic scrubber, strict 1950s Fallout/civil defense/vintage educational film poster aesthetic (generated art + CSS tokens).
- No hard-coded positions, pure static output, sim core is framework-agnostic and testable in isolation.

## Contributing / Extending

Because of the harness, the project is unusually friendly to future expansion:
- More topics/hotspots
- Different environments (plains, woods, neighborhood, water)
- Selectable tornado strength (EF scale affecting visuals + scalars)
- Animation speed + advanced camera modes
- Subtle vintage audio
- Export stills or short clips

See the "future-friendly" notes in the relevant plan files.

## License & Attribution

Educational / personal use friendly. All science content attributed to public NOAA/NWS sources. Generated art is for this project.

---

**"Mezzo"** — making the invisible visible, one phase at a time.

Built with care (and a lot of markdown specs) using modern web + Three.js.
