# Simulation, Time Lifecycle, Fluid Motion & Volumetrics Spec

This is one of the two most important files in the harness (the other is the exact 8 topics + attachment semantics).

## Lifecycle Phases (Normalized Phase 0.0 – 1.0)

We model four main educational stages. The sim must produce smooth, continuous, physically plausible transitions between them. The UI will expose clear stage markers on the scrubber.

1. **Wall Cloud / Pre-Tornadic** (phase ~0.0 – 0.25)
   - Broad, organized low-level rotation visible as a lowering, persistent wall cloud beneath the rain-free base.
   - Mesocyclone aloft is strong and relatively wide.
   - No (or very weak) condensation funnel reaching the ground.
   - Inflow bands organizing, RFD beginning to wrap.

2. **Funnel Descent & Touchdown** (phase ~0.25 – 0.45)
   - Condensation funnel descends from the wall cloud.
   - First ground contact (debris cloud appears).
   - Rapid increase in low-level rotation and updraft concentration.
   - RFD clear slot becomes prominent on the rear (usually southwest) side.

3. **Mature Tornado** (phase ~0.45 – 0.75)
   - Full, intense, relatively wide and vertical or slightly tilted funnel from cloud base to ground.
   - Strong debris cloud / "multiple vortex" hints possible.
   - Maximum low-level wind speeds and pressure drop.
   - Precipitation (rain/hail curtains) wrapped around but the core often relatively clear.

4. **Rope-out / Decay** (phase ~0.75 – 1.0)
   - Funnel narrows dramatically and becomes more tilted / contorted.
   - Tornado "ropes out", lifts, or dissipates.
   - Debris becomes more diffuse.
   - Mesocyclone may still be present aloft but low-level rotation collapses.
   - Storm may cycle or new development begins (for v1 we simply let the primary feature weaken gracefully).

The sim should allow a user to scrub smoothly back and forth; nothing should "pop" or jump.

## Core Simulation Contract

```ts
export interface FunnelParams {
  height: number;           // 0 = no funnel, up to ~ full storm scale
  baseRadius: number;
  topRadius: number;
  tiltX: number;            // small radians or normalized
  tiltZ: number;
  condensation: number;     // 0–1 density/opacity factor
  debrisStrength: number;   // how much heavy debris is lofted
}

export interface AttachmentPoint {
  x: number; y: number; z: number;
}

export interface SimulationFrame {
  phase: number;
  funnel: FunnelParams;
  meso: { rotation: number; radius: number; height: number; strength: number };
  wallCloud: { baseHeight: number; radius: number; rotation: number };
  rfd: { angle: number; strength: number; clearSlotWidth: number };
  attachments: Record<HotspotId, AttachmentPoint>;
  scalars: {
    pressureDelta: number;   // mb, negative for drop
    maxTangentialWind: number; // mph or m/s — document unit
    updraftMax: number;
    precipRate: number;      // proxy 0–1 or mm/h
  };
  // For the three layer to drive its own particle systems efficiently
  getVelocityAt?: (worldPoint: {x:number;y:number;z:number}, phase: number) => {x:number;y:number;z:number};
}
```

The implementation must be **deterministic** for a given phase (plus any small internal seeded noise that is stable).

## Scripted Fluid / Velocity Field (Light but "Actual Flowing")

We do **not** run a full fluid solver. Instead we define an **authoritative, time-varying procedural velocity field** that particles (and conceptually air parcels) follow.

Typical components (lerped or multiplied by phase-dependent envelopes):

- **Background updraft** (stronger in the mesocyclone core, varies with phase).
- **Rotational / tangential** field — classic vortex: v_theta ~ Gamma / r (with core cutoff to avoid singularity). Strength and core radius change with phase.
- **Radial inflow** near the ground and low levels (convergence into the updraft).
- **RFD downdraft** on the rear flank — a localized descending + diverging flow whose azimuth rotates or sweeps with phase.
- **Turbulence** — curl noise or several octaves of simplex noise added as a perturbation. The amplitude and spatial scale can be higher during intense phases.
- **Precipitation / debris fallout** — a downward bias on certain particle types once they are high.

The `getVelocityAt(point, phase)` function (or an equivalent that the particle system samples every frame) is the heart of the "flowing" feel.

Particle systems in the three layer will typically:
- Spawn new particles continuously according to phase (more condensation when funnel is active, more debris near touchdown and mature).
- Advect existing particles using the velocity field (with some drag, lifetime, size variation).
- Re-spawn or reset particles that leave the interesting volume or exceed age.
- Use different "species" (condensation vs dust vs rain) with different drag / terminal velocity behaviors.

For performance we will use `THREE.Points` + `BufferGeometry` with custom attributes (age, seed, type) and update the positions in `useFrame` using the sim's field or a snapshot of positions returned by the sim.

## Volumetric Clouds

Goal: convincing 3D presence and parallax for the supercell / wall cloud / anvil region that evolves with phase (base lowers, rotation organizes, "vault" or clear slot appears).

v1 technique (performant + controllable):
- 6–12 large soft cloud "slabs" or slightly warped planes at different altitudes and horizontal positions.
- Each has a ShaderMaterial (or `meshLambertMaterial` + heavy use of alphaMap / map with noise) that samples 2D or faked 3D noise.
- Noise is offset by phase and by a slow global wind so the clouds have internal motion even when the camera is still.
- Opacity, vertical thickness, and horizontal density distribution change with phase (wall cloud base lowers dramatically between phase 0.1 and 0.4).
- Lighting: hemisphere + a directional "sun" that can be slightly occluded or colored by the storm. Some self-shadowing via simple normal or multiple layers.
- The three layer reads current meso / wallCloud params from the frame and positions/scales the cloud group accordingly.

Later upgrade path (documented): replace or augment with a single raymarched volume box using a 3D noise texture or TSL/compute shader. The interface (a cloud "bounding volume" + density parameters) should be designed so swapping the renderer is localized.

## Parametric Funnel / Tornado Geometry

- The visible condensation funnel is built from 3–5 stacked or lofted rings / a `TubeGeometry` or custom `BufferGeometry` whose radius profile is a function of height and phase (wider at top during early phases, more cylindrical or even wider near ground in mature violent phases).
- A second, lower "debris" sheath or separate wider cone for the ground-level debris cloud (opacity and particle density peak in mature phase).
- Vertex animation or a simple vertex shader displacement using noise + phase gives the characteristic "wobble" and multiple-vortex hints without needing true secondary vortices in v1.
- The entire funnel group can have a slight overall tilt that increases in rope-out.

All of these params come from `funnel` in the `SimulationFrame`.

## Attachment System for the 8 Physicalized Hotspots

See also `plans/03-dynamic-hotspots-attachment-system.md`.

High-level rule: every hotspot that has a meaningful 3D location must have its world position **computed inside the simulation module** as a function of phase (and possibly small internal state for smoothness).

Examples of attachment strategies (to be finalized with the 8 topics content):
- "Mesocyclone center aloft" — relatively high, follows the slow rotation of the broad meso, radius may shrink slightly as low-level rotation concentrates.
- "Wall cloud / base" — descends with the cloud base height over early phases, then stays low.
- "Funnel tip / condensation point" — starts high and descends roughly with the funnel height param; once on ground it may lift slightly or follow the rope.
- "Maximum debris / ground circulation" — near (0,0,0) or a small orbiting offset during mature phase; becomes weaker and more diffuse in rope-out.
- "RFD clear slot edge" — an angular offset that rotates with the storm or sweeps in from the rear as phase progresses.
- Inflow band feature, etc.

The three layer (HotspotBall components) simply read the current attachment positions (from Zustand or by subscribing to the latest frame) and place the pulsing balls there. They do **not** decide where to be.

This is what makes the balls "physicalized" and believable as the simulation plays.

## Performance & Budget Targets

- Particle count: aim for beautiful motion with 4k–12k points total across all systems on mid hardware. Use `frustumCulled` and simple distance or phase-based culling.
- Cloud slabs: 8–12 is usually plenty.
- Funnel geometry: a few hundred vertices is more than enough; do not over-tessellate.
- The sim itself must be cheap enough to call every frame (or at least at 30–60 Hz) with no perceptible cost.

## Testing the Sim (for the implementing agent)

- Write a tiny node or browser console test harness that steps phase from 0 to 1 in 0.05 increments and prints or asserts:
  - Funnel height is monotonic or follows the documented envelope.
  - Attachment points move smoothly (no large jumps between adjacent phases).
  - Scalars stay in reasonable meteorological ranges (pressure drops of tens to ~100+ mb, winds from 0 to 200+ mph for the most violent).
- Visual test: once wired, scrub slowly and watch that particles generally follow the expected flow (inward + up near core, descending in RFD region, etc.).

## Future Extensions (document the hooks)

- Multi-vortex mode (secondary vortices orbiting the main circulation) — add more attachment points and particle emitter locations.
- Strength / EF multiplier that scales rotation rates, pressure drop, debris, funnel width.
- Different surface types (crops, neighborhood, water, forest) that change ground color, debris character, and perhaps add a few environment props. The sim can return a "surfaceType" or the three layer can receive it as a prop.
- Full 3D wind field visualization (streamlines or arrows) driven by the same `getVelocityAt`.

This spec + the master instructions + the attachment detail file give a future agent everything needed to implement a convincing, educational, flowing storm simulation.

**Next critical file**: `plans/03-dynamic-hotspots-attachment-system.md` and `plans/04-exactly-8-topics-content.md`.
