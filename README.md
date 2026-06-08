# Mezzo

**Mezzo** is a browser-based 3D interactive educational visualizer for mesocyclones and tornadoes.

Explore the full lifecycle of a supercell tornado in a flowing, time-scrubbable simulation. Click the physicalized pulsing hotspots that ride along with the storm features. Scrub the timeline to see wall cloud formation, funnel descent, mature tornado, and rope-out. Learn the science through accurate, lightly-written educational content and synchronized data visualizations.

- Pure client-side (WebGL / Three.js)
- 100% static — deployable to Render free tier (or any static host)
- Beautiful, consistent 1950s Fallout / U.S. civil defense / vintage educational film aesthetic (all decorative art generated with Grok Imagine)

**Status**: In active construction via a detailed AI harness (see `/plans`).

## Quick Start (once built)

```bash
npm install
npm run dev
```

Build for static deploy:

```bash
npm run build
# serve dist/ or push to Render / Vercel / Netlify etc.
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

Target: Render Static Sites (free tier).

See `plans/08-deployment-render-static.md` for the exact steps an agent (or you) should follow.

The built `dist/` folder is the only artifact needed.

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
