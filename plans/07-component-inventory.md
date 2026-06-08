# Component & File Inventory (for the Implementing Agent)

Use this as a checklist and as the target structure. Create files in roughly this order once the simulation core contract is agreed.

## Root & Config

- `package.json` (after `npm create vite@latest . -- --template react-ts`)
- `vite.config.ts` (add any needed three.js asset handling if required)
- `tsconfig.json` (strict)
- `tailwind.config.ts` or v4 CSS (define the exact 1950s palette as theme colors + stamp utilities)
- `.gitignore` (already present in harness)
- `README.md` (already present — keep it pointing at the harness)
- `render.yaml` (optional but recommended — see deployment plan)
- `public/art/` (copy final chosen generated images here with stable names)
- `art/` + `plans/` + `specs/` (the harness itself — do not delete or move)

## Simulation Core (implement very early, test in isolation)

`src/sim/`
- `types.ts` — `SimulationFrame`, `FunnelParams`, `HotspotId`, `Attachment`, `ScalarName`, etc.
- `noise.ts` — tiny consistent noise (or re-export from a small vendored module)
- `lifecycle.ts` — phase → funnel profile, wall cloud height, meso params, rfd angle, etc.
- `attachments.ts` — the 8 locator functions (`getMesocyclonePosition(phase)`, ...). Export a `getAllAttachments(phase): Record<HotspotId, Attachment>`
- `scalars.ts` — `pressureDelta(phase)`, `maxWind(phase)`, etc. + a `getAllScalars(phase)` or individual getters
- `velocityField.ts` — `getVelocityAt(point, phase)` and any helpers for advection
- `simulation.ts` — the public `computeSimulation(phase: number, opts?): SimulationFrame` that orchestrates the above and returns a complete frame (or a lightweight object + methods)
- `index.ts` — clean re-exports

This folder should be importable in a plain TS file or test without React or three.

## Store (tiny)

`src/store.ts` (or `src/state/mezzoStore.ts`)
- Zustand store exposing `phase`, `isPlaying`, `playbackSpeed`, `selectedTopicId`, setters, and any derived selectors.
- Optional: a `useSimulationFrame` hook that calls `computeSimulation(phase)` and memoizes or subscribes cleverly.

## Three.js / R3F Layer

`src/three/`
- `Scene.tsx` — the `<Canvas>` root, camera, lights, fog, environment group. Receives or subscribes to phase + frame.
- `Storm.tsx` or `StormGroup.tsx` — top-level composer for the time-driven storm (meso clouds + funnel + particles + ground).
- `VolumetricClouds.tsx` — the layered / shader-driven supercell and wall cloud elements. Driven by frame.meso + wallCloud + phase.
- `FunnelAndDebris.tsx` — parametric funnel geometry + debris sheath. Heavily driven by `frame.funnel`.
- `Particles.tsx` — one or more Points / Instanced systems for condensation, dust, rain. Use `useFrame` + the velocity field or a snapshot of positions.
- `HotspotBall.tsx` — the pulsing physicalized marker. Takes a `hotspotId` or a live `position` prop + `isSelected`. Handles its own subtle animation + raycast hit area. Uses `<Html>` for any 2D label.
- `Ground.tsx` — simple plane or stylized terrain, possibly with some static debris scatter.
- `Lights.tsx` or inline in Scene — hemisphere + directional with phase-aware tweaks (optional lightning flash system).
- `CameraRig.tsx` (optional) — helpers for presets and focus tweens.

`src/three/utils/` (if needed)
- geometry helpers for building the funnel profile from params
- material factories that accept theme colors + noise uniforms

## UI Components (thematic, responsive)

`src/ui/`
- `AppShell.tsx` or layout pieces in `App.tsx`
- `TimeScrubber.tsx` — the star. Large range input or custom SVG/canvas thumb + stage markers + play controls. Fully wired to the store.
- `DataVizPanel.tsx` — the expandable side panel with charts + current values. Charts can be simple SVG paths generated from the scalar functions sampled at fixed intervals (or live from the current frame).
- `KnowledgePanel.tsx` — shows the exact content for the selected topic (import the data from a content module, do not hard-code strings here).
- `HotspotLegend.tsx` (optional) — a small 2D list of the 8 topics that also allows selection and shows current relevance. Useful for accessibility and mobile.
- `ThemeStamp.tsx` or decorative atoms — reusable "rubber stamp", film grain overlay, panel header with 1957 styling.
- `HelpModal.tsx` — short how-to + science sources + "about this simulation" (keeps the main UI clean).

## Content

`src/content/`
- `topics.ts` — the single source of truth. Export `topics: Record<HotspotId, Topic>` where Topic has `title`, `blurb`, `facts: string[]`, `dataVizHint`, `bestPhases`, etc.
- Keep the text 100% in sync with `plans/04-exactly-8-topics-content.md`.

## Main App Glue

- `src/App.tsx` — brings the 3D Scene, the UI panels, the scrubber, and the store together. Applies global theme classes.
- `src/main.tsx` — standard Vite + React entry (StrictMode, etc.).

## Public Assets

`public/art/`
- All final chosen Imagine-generated images (hero, stamps, textures, diagram references, etc.).
- A small `manifest.json` or just clear naming so code can reference `/art/mezzo-hero.jpg` etc.

## Specs / Harness (do not touch during implementation except to clarify)

Keep the entire `plans/`, `art/`, `specs/` trees as the living documentation.

## Order of Creation (Suggested for the Agent)

1. Simulation core + types + a tiny test harness (console or vitest) that you can drive with a slider or buttons.
2. Zustand store + a minimal React app that shows the current phase and a "scrub me" input wired to `computeSimulation`.
3. Basic Vite + Tailwind + R3F scaffold with a spinning box or simple torus just to prove the 3D pipeline.
4. Theme tokens + first chrome (header + stub scrubber + stub panel) using the Imagine references.
5. Wire the real scrubber to the store; the 3D box can now scale or color with phase as a smoke test.
6. Volumetric clouds + ground + basic lighting (phase can drive cloud base height).
7. Parametric funnel + first particle system (use the velocity field).
8. Dynamic HotspotBall components reading live attachment positions; clicking works and highlights.
9. Full particle & funnel reactivity to phase + nice motion.
10. Data viz charts driven by the scalar functions.
11. Knowledge panel content drop-in.
12. Polish, camera presets, mobile, perf, keyboard, final theme application.
13. Build + preview + full verification checklist.
14. Deploy to Render + final checklist on the live URL.
15. Update README with the live link and a short "built following the harness" note.

## Do Not Create (or keep minimal)

- Heavy charting libraries (implement simple SVG or Canvas charts from the sim data).
- Full post-processing pipeline on day one (bloom, etc. can come later).
- Real backend or any network calls for the core experience.
- More or fewer than 8 topics.
- Any visual style that deviates from the Imagine + theme guide references.

Follow the master instructions and the individual plan files. When the harness and the code disagree, the harness wins (update the code, or propose a documented change to the harness).

This inventory plus the detailed specs in the other plans should let a competent agent produce a coherent, maintainable codebase without thrashing.
