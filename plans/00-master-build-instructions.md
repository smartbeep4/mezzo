# MEZZO — Master Build Instructions for Orchestrator / Implementer Agents

**Project**: Mezzo — Browser-based 3D interactive mesocyclone / tornado educational visualizer.  
**Name**: Mezzo (from mesocyclone).  
**Core experience**: Time-scrubbable, flowing 3D simulation of the full tornado lifecycle with **exactly 8** dynamic physicalized pulsing educational hotspots ("bubbles") that move intelligently with the storm features they label. Volumetric clouds + light scripted fluid simulation. Expandable data-viz side panel. Strict 1950's Fallout (game) / US civil defense / vintage educational film poster visual theme.  
**Deploy target**: Pure static site on Render free tier (CDN, Git deploy, `dist/` folder). Zero backend, zero cost, zero persistence/auth.  
**Constraint**: Procedural / parametric generation primary. Leave clean hooks for future asset injection (glTF, textures). No Blender required for v1.

---

## Non-Negotiables (Read These First, Violate Never)

1. **Follow the harness in order**. Read these files (at minimum) before writing any code:
   - `plans/00-master-build-instructions.md` (this file)
   - `plans/01-architecture-and-stack.md`
   - `plans/02-simulation-time-lifecycle-fluid-volumetrics.md`
   - `plans/03-dynamic-hotspots-attachment-system.md`
   - `plans/04-exactly-8-topics-content.md`
   - `plans/05-ui-data-viz-time-scrubber.md`
   - `plans/06-theme-1950s-fallout-imagine-prompts.md`
   - `plans/07-component-inventory.md`
   - `plans/08-deployment-render-static.md`
   - `art/theme-guide.md` (and the actual generated images in `art/reference/` + `public/art/`)

2. **Simulation is the source of truth**. All 3D visuals (funnel shape, particle motion, cloud evolution, hotspot positions) and the data-viz numbers **must** be driven by a pure, framework-agnostic simulation module. The module exposes a single function or class that, given `phase: number` (0–1) and optional `deltaTime`, returns a complete frame description (particle buffers or update rules, current geometry params, 8 attachment `Vector3`s, scalar time-series values). No hard-coded magic numbers in React components or three meshes.

3. **Dynamic physicalized hotspots are mandatory**. The 8 pulsing balls are **not** static in world space. Each has an attachment strategy that is a function of phase. When the funnel descends or the RFD slot sweeps, the corresponding ball moves with it. Implement the locator/attachment system in the sim core first.

4. **Theme is non-negotiable and generated**. All decorative graphics, logo, panel headers, icons, loading art, diagram accents, and any 2D overlays must follow the 1950s Fallout / civil-defense / "U.S. Weather Bureau Educational Film" style. Use only the prompts and generated assets documented in `plans/06-...` and `art/`. Do not invent new styles or colors. When in doubt, re-generate with the established prompt library (or edit existing images via `image_edit` if needed for consistency).

5. **Exactly 8 topics**. Content must match `plans/04-exactly-8-topics-content.md` (light-ish depth, accurate to NOAA NSSL/SPC, easy to expand). Do not add or remove.

6. **Time slider / lifecycle is the star**. The primary interaction is scrubbing or playing the simulation through wall-cloud → funnel formation & touchdown → mature tornado → rope-out. "Presets" and camera buttons are secondary helpers.

7. **Pure static at the end**. `npm run build` must produce a self-contained `dist/` that works when served by any static host (Render, Vercel preview, `python -m http.server`, etc.). No environment variables, no external API calls for core experience, no auth.

8. **Git discipline**. Commit meaningful increments with conventional-style messages. Never commit `node_modules/`, `dist/`, or secrets. Use the harness docs as the "why" in commit messages when appropriate.

9. **"Do it right" over "ship fast"**. Choose clean, maintainable, well-separated code even if it takes a few more lines. The sim core should be testable in isolation. Prefer small pure functions and clear interfaces.

10. **Procedural first, assets later**. Implement funnel, clouds, particles, attachments using math, noise, and three primitives. Document clear extension points (e.g. "replace this function with a loaded texture or model later").

---

## Recommended Agent Workflow (for future orchestrators)

1. **Read the full harness** (all plans/*.md + art/theme-guide.md). Ask clarifying questions via the user only if something is truly ambiguous after reading.
2. **Set up or continue the project** following `plans/01-architecture-and-stack.md` (Vite + React-TS + R3F recommended long-term stack with pure sim core).
3. **Implement the simulation core first** (plans/02 and 03). Test it by logging or a tiny console harness before wiring to three.js.
4. **Theme & art**: Ensure all referenced generated images from `art/reference/` are copied/optimized into `public/art/`. Apply theme classes/tokens globally early.
5. **Build the 3D layer** against the sim outputs (phase-driven).
6. **Wire UI** (time scrubber + data panel + knowledge panel + pulsing balls) per plans/05.
7. **Content**: Drop in the exact 8 topics.
8. **Polish, perf, responsive, keyboard**.
9. **Deploy verification** on Render exactly as described in plans/08. Run the full manual checklist.
10. **Self-review**: Re-read the master instructions and relevant spec. Fix any violations. Produce a short "build log" or update a `BUILD-LOG.md` noting what was done and any deviations with justification.

Parallel work is allowed (e.g. one agent on sim core, another on theme art + UI chrome) as long as the sim core contract is agreed first and interfaces are respected.

---

## Key Interfaces (Draft — Finalize in Architecture Spec)

See the dedicated specs. At minimum the sim must provide something like:

```ts
export interface SimulationFrame {
  phase: number;
  // Funnel / tornado params at this instant
  funnel: { height: number; baseRadius: number; topRadius: number; tilt: number; intensity: number };
  // Particle systems (or rules to update them)
  particles: { /* positions, colors, sizes, lifetimes or a BufferGeometry-friendly structure */ };
  // The 8 physical attachment points (MUST be stable & smooth across phase)
  attachments: Record<string, THREE.Vector3 | {x:number,y:number,z:number}>;
  // Scalars for data viz (functions of phase, for charts)
  scalars: { pressureDelta: number; maxWind: number; updraft: number; precip: number; /* etc */ };
  // Optional: velocity field sampler for advanced particle motion
  getVelocityAt?: (point: THREE.Vector3, phase: number) => THREE.Vector3;
}

export function computeSimulation(phase: number, options?: {...}): SimulationFrame;
```

Hotspot IDs and their semantic meaning are defined in the content spec.

---

## Tools & Commands Agents Should Use

- `npm run dev`, `npm run build`, `npm run preview`
- For art: the `image_gen` and `image_edit` tools (via the Grok interface) using only the prompts in the theme plan.
- Terminal for git: `git status`, `git add -p`, `git commit -m "type: message (refs plan/XX)"`
- Prefer `search_replace` (or the `write` tool for brand new files) for all code and doc changes. Never use raw echo/cat for source.
- After any substantial change, at minimum run the build and the preview checklist.

---

## What "Success" Looks Like (for the final agent handoff)

- A user can open the deployed Render URL.
- Scrub the big thematic time slider and watch a beautiful, scientifically-plausible flowing 3D storm evolve from wall cloud through rope-out, with volumetric clouds, proper particle flow, and the 8 pulsing balls moving correctly with their features.
- Clicking any pulsing ball (at any phase) shows the correct light educational content in the panel; the data-viz panel can highlight related traces.
- The entire experience feels like a 1950s government educational film brought to life in modern 3D — colors, typography, decorative elements, and "stamps" all match the theme.
- `git log` is clean.
- `npm run build` succeeds and the `dist/` folder can be dropped onto Render (or served locally) with zero errors.
- The code is readable by a future maintainer and the sim core could be reused for a 2D diagram or another renderer.

---

## Current Status Note

This harness was initially authored by the orchestration planner agent in the first session. Future agents inherit this document as the constitution of the project.

**If you are a future agent reading this**: You are empowered and expected to do excellent work. Read everything. Build it right. Commit often. Make Mezzo something people will enjoy learning from.

Now go read `plans/01-architecture-and-stack.md`.

**End of master instructions.**
