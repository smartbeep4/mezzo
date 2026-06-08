# Dynamic Physicalized Hotspots — Attachment System Spec

This file + `plans/02-simulation...` and `plans/04-exactly-8-topics...` give a complete contract for the 8 pulsing balls.

## Requirements (Non-Negotiable)

- Every hotspot is a **physicalized** object whose 3D position is determined by the simulation, not the UI or the three renderer.
- The position must be a **smooth, continuous function of phase** (and any small internal stable noise). No teleporting.
- The pulsing balls must be **easy to see** at all times and from typical camera angles: good size, emissive or rim-lit in the theme palette (mustard or teal glow against the stormy background), subtle scale or brightness pulse (1–2 Hz, not distracting), optional soft label on hover or when selected.
- Clicking a ball at any phase selects the corresponding topic and updates the knowledge panel (and optionally the data-viz highlights). The sim does not care about selection — it only provides position + (optionally) a "relevance" scalar so the ball can be drawn more prominently when its topic is active.
- The attachment logic must be **inside the pure sim core** (`src/sim/...`). The React/three layer only reads the current frame's attachment positions.

## Hotspot ID Contract

Use the stable ids from `plans/04`:

- `mesocyclone`
- `wall_cloud`
- `inflow`
- `rfd`
- `condensation_funnel`
- `debris_cloud`
- `pressure_core`
- `rope_out`

These ids are used in the `attachments` map returned by `computeSimulation`.

## Attachment Strategies (Implementation Guidance)

Each strategy below should be implemented as a small pure function or method inside the sim that is called for the current phase.

1. **mesocyclone**
   - High altitude (roughly 60–80% of storm height).
   - Slow circular motion around the storm axis with a radius that slowly contracts as low-level rotation tightens.
   - Very little vertical movement; slight bob or breathing with overall updraft strength.
   - Position = `lerp( broadMesoCenter(phase), tighteningCenter(phase), phase ) + small noise`.

2. **wall_cloud**
   - Vertical position directly tracks the lowering wall cloud base height (the sim already computes this for the funnel top).
   - Horizontal position near the main updraft center but slightly offset toward the inflow side.
   - Descends dramatically in the first 0.3–0.4 of phase, then stays low.

3. **inflow**
   - Lower altitude, larger horizontal radius (southeast or east of the main circulation).
   - Slowly spirals inward as phase increases (showing air being drawn into the storm).
   - Can have a small "band" offset so it feels like part of a visible inflow feature.

4. **rfd**
   - Rear (southwest in classic Northern Hemisphere orientation) side.
   - Angular position that wraps with the storm's rotation or sweeps in from ~220° as the clear slot develops (phase 0.2–0.5).
   - Height is mid-to-low; can descend a bit as the downdraft reaches the surface.
   - Good candidate for a ball that has a slight "leading edge" offset from the main RFD axis.

5. **condensation_funnel**
   - The most "dramatic" mover.
   - Starts high (under wall cloud) at phase ~0.2.
   - Vertical coordinate follows the current funnel tip height (or a point 70% down the visible funnel).
   - Once on the ground, stays near surface and can have a small orbiting radius (subvortex feel) that increases then decreases.
   - During rope-out (0.75+) it rises again and the horizontal wander increases as the vortex tilts and stretches.

6. **debris_cloud**
   - Very low (near ground, 0–10% height).
   - Horizontal position close to the surface circulation center, with more turbulent / larger random walk than the funnel ball (debris is messy).
   - Radius of the "cloud" (and thus the wander of this ball) is widest in mature phase, shrinks in rope-out.
   - Excellent place to add a little fast orbiting motion to illustrate ground-level rotation.

7. **pressure_core**
   - Should feel like it is "inside" the vortex.
   - Follows the geometric center of the current funnel (average of base and a point higher up, or a weighted point that stays in the strongest low-pressure region).
   - Descends with the funnel, stays low and central during mature, then rises and becomes more erratic in rope-out.
   - This is the ball users will most often associate with "the heart of the tornado."

8. **rope_out**
   - Can be a dedicated "filament" or "decay" marker.
   - During 0.7–1.0 it becomes the most prominent mover: it stretches, tilts, and lifts with the roping funnel.
   - One good technique: place it at the current highest or most contorted point of the visible vortex structure.
   - In earlier phases it can be co-located with or hidden near the condensation_funnel ball (or simply de-emphasized by size/opacity in the renderer).

## Smoothing & Stability

- Use `lerp` / `smoothstep` / low-pass filtering on the raw parametric positions so that small phase changes produce believable continuous motion.
- If using noise, seed it consistently per hotspot (e.g. `noise(phase * 0.3 + hotspotSeed)` ) so the wobble is repeatable on every scrub.
- The three layer should further lerp the visual ball positions toward the sim-reported positions (one-frame or spring) to hide any discrete sim update rate.

## Visual Treatment of the Balls (three layer responsibility)

- Geometry: small sphere (or slightly flattened "bead").
- Material: emissive or MeshBasic/MeshPhong with a bright theme color (mustard or a hot teal) + a second larger faint sphere or ring for the "glow".
- Animation: scale = 1.0 + sin(time * pulseFreq) * 0.15 (or brightness pulse).
- When the topic is selected: increase pulse amplitude or add a second outer ring / "selection" stamp graphic (can be a 2D Html element or a three ring).
- Labels: use drei `<Html>` or a screen-space 2D overlay. Keep them minimal ("WALL CLOUD", "RFD") so they don't fight the 3D.
- Raycasting: the balls (or slightly larger invisible hit spheres) must be easily clickable even on mobile.

## Data for the Renderer

The sim can also return, per attachment:
- `relevance: number` (0–1) — how "active/important" this feature is at the current phase. The renderer can use it for size, glow, or label visibility.
- `label: string` (short) for the 2D callout.

## Testing Checklist for the Attachment System

- Scrub slowly from 0 to 1 and back. Every ball must move continuously and believably.
- At phase 0.3 the wall_cloud ball must be visibly lower than at phase 0.1.
- At phase 0.6 the condensation_funnel and pressure_core balls must be near the ground.
- At phase 0.9 the rope_out (and/or condensation_funnel) ball must be higher and more tilted than at phase 0.6.
- Clicking any ball while the sim is playing or paused must select the correct topic without changing the current phase.

Implement the locators first in the sim, then the visual balls. Do not hard-code world positions in React components.

This is what makes Mezzo feel like a real simulation instead of a pretty animation with floating labels.
