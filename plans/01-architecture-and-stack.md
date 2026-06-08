# Architecture & Stack (Long-Term "Do It Right" Choices)

## Guiding Principle

"Ship it once, correctly, so future maintainers (human or agent) can live with it and extend it without pain."

We optimize for:
- Clarity of the **simulation as the single source of truth**.
- Separation of concerns so the hard math / procedural logic is not mixed with rendering or UI state.
- Excellent developer experience for a visualization + rich interactive UI project.
- Small but high-quality dependency surface.
- Easy static deploy (no special server requirements ever).
- Future expandability (new environments, strength levels, more topics, alternative renderers) without rewriting the core.

## Recommended Stack (Chosen for This Project)

**Build / bundler**: Vite (React-TS template)
- Fast HMR, excellent three.js + TypeScript support, trivial static `dist/` output.
- `npm run build` → pure static assets. Perfect for Render.

**UI layer**: React 18 + TypeScript + Tailwind CSS (v4 or PostCSS)
- The app has non-trivial UI: time scrubber (with play/pause, speed, stage markers), expandable data-viz panel, knowledge panel that reacts to both time and selection, theme chrome, responsive behavior.
- React makes this state (current phase, playback, selectedTopicId, panelOpen, etc.) trivial and performant with minimal boilerplate.
- Tailwind gives us the 1950s theme tokens (colors, typography, "stamp" effects, paper textures) extremely quickly and consistently.

**3D layer**: Three.js + @react-three/fiber + @react-three/drei
- **Why not pure vanilla three.js?** For a project whose *primary value* is the interplay between a live simulation, a prominent time slider, clickable 3D objects, and synchronized 2D data viz + info panels, the cost of manually syncing React state ↔ three scene graph, handling resize, raycasting, Html overlays, and controls is high. R3F + drei eliminate an enormous amount of glue code while still letting you drop down to raw three objects and custom shaders when you need to (which we will for the velocity field, volumetric-ish clouds, and custom materials).
- **Long-term maintainability**: R3F is mature, widely used in production viz/education/tools, has great TypeScript support, and a healthy ecosystem (leva for debug controls during development, react-spring or drei helpers for camera tweens, etc.). The React "cost" is a thin declarative wrapper around the canvas; the expensive simulation work lives outside it.
- **Escape hatch built-in**: The simulation core (see below) is 100% pure TS and has zero dependency on React or three. A future "Mezzo 2D" or "headless" or "WebGPU only" version can consume the exact same `computeSimulation(phase)` output.

**State management**: Zustand (tiny, ~1kB gzipped)
- Single store for: `phase`, `isPlaying`, `playbackSpeed`, `selectedTopicId`, `panelTab` (knowledge vs data), etc.
- The 3D components and the data-viz components subscribe only to the slices they need.
- Alternative (if we want zero extra deps): React Context + useReducer + useMemo. Zustand is the pragmatic "do it right" choice here — tiny and excellent DX.

**Simulation core**: Pure TypeScript module (no React, no three in the core types)
- `src/sim/simulation.ts` (or `core/`)
- Exports `computeSimulation(phase: number, opts?: {...}): SimulationFrame`
- Internals use simple math, simplex/curl noise (we can vendor a tiny noise lib or implement basic 3D noise), parametric curves for funnel profile over phase, velocity field functions.
- Returns:
  - Current funnel / wall-cloud / meso params (numbers + curves the three layer can turn into BufferGeometry or shader uniforms).
  - Particle update rules or pre-computed positions (the three layer decides how to render — Points with custom attributes, InstancedMesh for debris, etc.).
  - The 8 attachment points as plain `{x,y,z}` or Vector3-compatible objects (stable across small phase deltas for smooth motion of the pulsing balls).
  - Scalar time series samples or samplers for the charts (pressureDelta(phase), estimatedMaxWind(phase), etc.).
- This module can be imported in a Node script for testing, in a Canvas 2D fallback diagram, or in the main R3F scene.

**Noise / procedural utilities**
- We will need consistent 3D noise for turbulence. Options (choose one in the harness execution and document):
  - Tiny vendored simplex or value noise (good control, no extra dep).
  - `simplex-noise` or similar small package if we accept the dep (still fine for static).
- Curl noise for divergence-free flow (classic for "swirly" fluid feel) can be derived from the gradient of a noise field.

**Volumetric clouds approach (v1)**
- Not full 3D texture raymarching on day one (expensive to set up and perf-heavy on low-end devices).
- Layered / billboarded soft cloud volumes with:
  - Multiple large low-poly or plane meshes at different heights/rotations.
  - Custom ShaderMaterial or `meshBasicMaterial` + vertex displacement + fragment alpha using 2D or 3D noise (time + phase offset).
  - Additive or multiply blending + depth tricks for "volume" illusion.
  - Density and vertical structure change with phase (base lowers, organization increases as tornado forms).
- This gives convincing 3D presence and parallax as the user orbits while staying performant and easy to drive from the phase param.
- Document a clear path to upgrade to real raymarched volumes later (custom WebGL or TSL material) if desired.

**Camera & controls**
- `@react-three/drei` OrbitControls (or the underlying three OrbitControls) with sensible polar/azimuth limits so the user never goes underground or loses the storm.
- Phase-aware camera targets / "interest" points (the sim can also suggest a good look-at position per phase or per selected hotspot).
- Optional: springy camera transitions when clicking a hotspot (drei or a small useEffect + lerp).

**Data visualization in the side panel**
- Keep it lightweight: SVG with `<path>` or a small Canvas 2D element, or Recharts / Chart.js if we want (but prefer 1–2 tiny custom components using the scalar samplers from the sim to avoid heavy charting deps).
- The panel shows traces for the major scalars over the full 0–1 phase, with a playhead at current phase. Selecting a topic can emphasize the relevant trace(s) and show callouts.

**Theming / visuals**
- All colors, fonts, decorative rules defined as Tailwind config or CSS variables early.
- Generated art from the Imagine prompts lives in `public/art/` and is referenced by path (never hot-linked).
- "Vintage film" touches (subtle vignette, slight grain, paper texture on panels) implemented via CSS + a lightweight three post or overlay where it makes sense. Keep the 3D render itself clean and theme-colored.

**File / folder shape (high level — detailed inventory in plan 07)**

```
src/
  sim/
    simulation.ts          # THE core. Pure. Testable.
    noise.ts
    lifecycle.ts           # phase → funnel profile, attachment locators, etc.
    scalars.ts
  three/
    Scene.tsx              # <Canvas> root, lights, camera, environment
    StormGroup.tsx         # composes the time-driven elements
    Funnel.tsx
    Particles.tsx
    VolumetricClouds.tsx
    HotspotBall.tsx        # the pulsing physicalized ones — reads attachments from store or props
  ui/
    TimeScrubber.tsx
    DataVizPanel.tsx
    KnowledgePanel.tsx
    ThemeChrome.tsx
  store.ts                 # zustand
  App.tsx
  main.tsx
```

**Dependencies we will actually ship (keep minimal)**
- three, @react-three/fiber, @react-three/drei
- zustand
- Tailwind
- lucide-react or heroicons for any UI icons (thematic ones can be custom SVGs from Imagine)
- Optional dev-only: leva (beautiful debug panel for sim params during development — tree-shaken or behind a flag in prod)

**TypeScript strictness**
- `strict: true`, noImplicitAny, etc.
- Define clear interfaces for `SimulationFrame`, `HotspotDefinition`, `ScalarSeries`, etc. in `src/sim/types.ts`.

**Testing strategy (future agent note)**
- The sim core is the easiest to test: feed it phases 0, 0.25, 0.5, 0.75, 1.0 and assert monotonicity or expected ranges on funnel height, attachment stability, scalar values.
- Visual / interaction tests are manual + the harness verification checklist for now. Add Vitest + happy-dom or @react-three/test-renderer later if the harness executor decides it adds value.

## Why This Is "Long Term Good"

- The simulation is the asset. Everything else is a viewer.
- React + R3F gives us the best leverage for the UI + 3D dance without making the hard part (the flowing storm) harder.
- Pure static output is guaranteed.
- Adding a new environment, a strength multiplier, or a 5th lifecycle stage is mostly a matter of extending the sim functions + a few phase lerps — the UI and three layer stay largely the same.
- A future agent (or human) six months from now can understand the architecture in 20 minutes by reading the sim module and the 8 topic definitions.

## Alternatives Considered (and why not primary)

- **Pure vanilla TS + three.js only**: Excellent for tiny demos. Painful for synchronized time slider + rich panels + selection state + responsive drawers + keyboard handling. We would end up re-implementing a lot of what R3F gives us for free.
- **Svelte + Threlte**: Lovely and lighter. Slightly smaller ecosystem for 3D helpers and community examples at the time of writing. Fine choice, but React + R3F has more "future agent will have seen this pattern before" benefit.
- **Next.js**: Zero benefit for a pure interactive viz (no SEO pages, no server components needed). Adds complexity for static export.
- **Full WebGPU + TSL from day one**: The official three tornado example is inspiring, but WebGPU support is still not universal enough for a public educational tool aimed at schools, phones, and older laptops. We design for WebGL first with clear notes on how to port the materials/shaders later.

The chosen stack is the pragmatic, high-quality, long-term sweet spot.

**Next file to read for an implementer agent**: `plans/02-simulation-time-lifecycle-fluid-volumetrics.md`
