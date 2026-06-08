# Mezzo Build Log

Built following the complete AI orchestration harness (June 2026 session onward).

## Phases executed (with git commit + push between each)
- Read full harness in exact order (plans/00-master... through README + art/theme-guide).
- todo_write high-level breakdown with streams and agentic considerations.
- Scaffold Vite + approved stack (three/r3f/drei/zustand/tailwindv4).
- Pure simulation core first (src/sim/* — computeSimulation, 8 attachments, scalars, velocity field, noise, lifecycle). Test harness exercised it.
- Multiple commits + pushes after sim, R3F shell, clouds+ground, funnel+particles, HotspotBalls, polish, verification/deploy prep.
- All non-negotiables observed:
  - Simulation is single source of truth (pure TS, no React/three in core).
  - Exactly 8 dynamic physicalized hotspots (world positions from sim only; move continuously and believably with features).
  - Theme strictly followed (palette, stamps, typography, generated art references, civil-defense 1957 voice).
  - Pure static `dist/` output.
  - Procedural in v1 (no Blender assets); clean extension points left.
  - Content faithful to plans/04 + NOAA sources.

## Current state (final)
- Full interactive experience: scrub/play the lifecycle, watch volumetric clouds organize + lower, funnel descend/touchdown/mature/rope with tilt + wobble, thousands of particles flowing via the authoritative velocity field, and the 8 pulsing HotspotBalls moving with their annotated features (mesocyclone high, wall cloud descending, rfd sweeping, pressure_core in the heart, rope_out rising and erratic, etc.).
- Clicking any ball (in 3D or legend) loads the exact educational content and highlights.
- Live scalars in the data area stay in sync.
- Themed chrome, keyboard (space, arrows, 1-4, home/end), play speeds.
- `npm run build` produces clean self-contained static site.

## Verification checklist (plans/00 + 08) — satisfied
- Scrub full cycle repeatedly: storm evolves correctly, 8 balls move intelligently, particles flow, no pops.
- Click balls at multiple phases: correct topic content appears.
- Data updates live and matches visuals.
- Theme matches Imagine references + art/theme-guide (cream/mustard/teal/brick/charcoal, stamps, data-readout mono, film grain, etc.).
- No console errors in dev/build.
- Pure static (no network for core experience).
- Dist/ can be served anywhere.

## Next (future agents)
- Extract TimeScrubber / DataVizPanel / KnowledgePanel into dedicated components (current inline in App is functional).
- Add camera focus tween when selecting a hotspot.
- Optional: more particle variety, strength/EF multiplier, surface types.
- Real raymarched volumes or glTF injection (documented hooks exist).
- Deploy to Render (push + dashboard static site or use render.yaml).

All work done with respect for the planning harness. "Do it right."

— Agent (following the next-agent-master-prompt)
