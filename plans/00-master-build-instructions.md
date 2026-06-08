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
2. **Evaluate agentic execution strategy**. After reading, decide whether to proceed as a single-threaded implementer or as an orchestrator that uses worktrees + `spawn_subagent` for parallel streams. See the "Agentic Workflow Patterns" section below.
3. **Set up or continue the project** following `plans/01-architecture-and-stack.md` (Vite + React-TS + R3F recommended long-term stack with pure sim core).
4. **Implement the simulation core first** (plans/02 and 03). Test it by logging or a tiny console harness before wiring to three.js. Freeze the public interface (`computeSimulation` + `SimulationFrame` + attachment contract) before heavy parallel work on consumers.
5. **Theme & art**: Ensure all referenced generated images from `art/reference/` are copied/optimized into `public/art/`. Apply theme classes/tokens globally early.
6. **Build the 3D layer** against the sim outputs (phase-driven).
7. **Wire UI** (time scrubber + data panel + knowledge panel + pulsing balls) per plans/05.
8. **Content**: Drop in the exact 8 topics.
9. **Polish, perf, responsive, keyboard**.
10. **Deploy verification** on Render exactly as described in plans/08. Run the full manual checklist.
11. **Self-review**: Re-read the master instructions and relevant spec. Fix any violations. Produce a short "build log" or update a `BUILD-LOG.md` noting what was done and any deviations with justification.

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
- Terminal for git and orchestration: `git status`, `git worktree add ../mezzo-sim-core -b sim-core`, `git add -p`, `git commit -m "type: message (refs plan/XX)"`. Worktrees are the preferred way to give parallel agents isolated working directories.
- Agent spawning: Use the `spawn_subagent` tool to delegate scoped work (e.g. "implement and test the pure simulation core in isolation"). Prefer `isolation="worktree"` for substantial parallel streams and `capability_mode` restrictions when appropriate (read-only for reviewers, etc.).
- Coordination: `todo_write` is the primary mechanism for the orchestrator to break down work and for sub-agents to report status.
- File operations: Prefer `search_replace` (or the `write` tool for brand new files) for all code and doc changes. Never use raw echo/cat for source.
- After any substantial change (especially integration points), at minimum run the build and the preview checklist.

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

## Agentic Workflow Patterns & Parallelization

The environment has strong support for agentic workflows (git worktrees, `spawn_subagent`, background tasks, `todo_write` coordination, etc.). As an orchestrator you are expected to use these capabilities intelligently rather than defaulting to a single linear agent doing everything sequentially.

### Core Principles
- The simulation core contract (`computeSimulation`, `SimulationFrame`, attachment points, scalar functions) is the **primary synchronization point**. No heavy parallel work on visualization, UI, or data layers should proceed until this interface is designed, implemented, and reasonably stable.
- The orchestrator (you) owns integration, conflict resolution, and final verification.
- Use isolation where it reduces risk: worktrees for different agents, `capability_mode` restrictions on sub-agents, clear scoped prompts that reference specific harness sections.

### Recommended Patterns

**1. Worktree-based Parallel Streams (preferred for substantial independent work)**
- Create dedicated worktrees from the main branch:
  ```bash
  git worktree add ../mezzo-sim -b feature/sim-core
  git worktree add ../mezzo-viz -b feature/viz-layer
  ```
- Assign a sub-agent (via `spawn_subagent` with `cwd` pointing to the worktree) to each stream.
- The orchestrator periodically pulls/merges stable interfaces from the sub-worktrees into the primary worktree.
- This gives each stream a completely clean git history and filesystem while still allowing easy integration.

**2. Sub-Agent Delegation via `spawn_subagent`**
- Use this for specialized or long-running subtasks once contracts are agreed.
- Good candidates:
  - Pure simulation core + unit tests / console driver.
  - R3F scene graph and particle systems (once `SimulationFrame` is stable).
  - Data visualization components and charts.
  - Theme application + additional `image_gen` / `image_edit` work.
  - Mobile responsiveness + accessibility audit.
  - Final Render deployment + verification run.
- Always give sub-agents a focused prompt that starts with "You are a specialized agent for Mezzo. You have already read the relevant sections of the harness..." and reference exact plan files.
- Use `isolation="worktree"` + explicit `cwd` when the sub-agent will do significant git work.
- Use `todo_write` (with `merge: true`) as the shared coordination mechanism so the orchestrator can see progress across all agents.

**3. Orchestrator + Swarm Pattern**
- One main agent stays on the primary worktree acting as orchestrator.
- It maintains the high-level `todo_write` list.
- It spawns short-lived or long-lived sub-agents for leaf tasks.
- The orchestrator periodically runs integration builds and the verification checklist.

**4. When *Not* to Parallelize**
- Anything that touches the core simulation interface before it is frozen.
- Final integration, theme consistency enforcement, and the end-to-end verification checklist.
- Early exploration / architecture decisions.

### Natural Decomposition Opportunities (see also plan 07)
- **Stream A (highest priority, independent)**: Pure `src/sim/` (types, noise, lifecycle, attachments, scalars, velocityField, simulation.ts) + a small test harness.
- **Stream B**: R3F / Three.js visualization layer (Scene, StormGroup, VolumetricClouds, Funnel, Particles, HotspotBall) — can start once Stream A publishes a stable frame interface.
- **Stream C**: UI + theme (TimeScrubber, DataVizPanel, KnowledgePanel, global styling, stamp effects) — can proceed in parallel with B once basic phase wiring exists.
- **Stream D**: Art generation & asset integration (additional Imagine calls + copying into `public/art/`).
- **Stream E**: Polish, perf, mobile, keyboard, final verification, Render deploy.

Use `todo_write` to track these streams and their dependencies.

## Current Status Note

This harness was initially authored by the orchestration planner agent in the first session. Future agents inherit this document as the constitution of the project.

**If you are a future agent reading this**: You are empowered and expected to do excellent work. Read everything. Build it right. Use the agentic tools available to you (worktrees, sub-agents, todo coordination) where they help, while respecting the non-negotiables. Make Mezzo something people will enjoy learning from.

Now go read `plans/01-architecture-and-stack.md`.

**End of master instructions.**
