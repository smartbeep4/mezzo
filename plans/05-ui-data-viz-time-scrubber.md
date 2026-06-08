# UI, Time Scrubber, Data Visualization Panel & Interaction Spec

## Overall Layout (Desktop first, then responsive)

- Full-bleed 3D canvas (the hero).
- Thin thematic header bar at top: "MEZZO" logo (using generated art or styled type) + small "1957 Training Film" tag + help / about button.
- **Primary control**: Large, chunky time scrubber near the bottom or as a floating film-editing style bar across the lower third. Must be the most obvious interactive element.
- Expandable / toggleable **Data + Knowledge** panel on the right (desktop) or as a bottom / side drawer (tablet & mobile).
- The 8 pulsing balls live entirely in the 3D world (see hotspot spec).

Theme application: every chrome element (header, scrubber track, panel background, buttons) must feel like it came from the Imagine reference images (aged paper, stamps, bold limited colors, halftone where appropriate).

## The Time Scrubber (Core Interaction)

Visual:
- Thick track with film-strip or analog-gauge personality.
- Clear, labeled stage markers: WALL CLOUD | TOUCHDOWN | MATURE | ROPE-OUT (use the language from the content spec and the generated lifecycle diagram).
- Play / Pause button (large, thematic).
- Playback speed control (0.5×, 1×, 2×, 4× — or a simple "fast" toggle).
- Current phase readout in "data" typography (e.g. "PHASE 0.47 — MATURE").

Behavior:
- Dragging the thumb sets `phase` immediately; the entire 3D scene (funnel, particles, clouds, all 8 balls) updates live.
- Play button drives an animation loop that advances phase using `requestAnimationFrame` modulated by speed.
- When playing, the scrubber thumb moves; the user can grab it at any time to take manual control (standard video-scrubber expectation).
- Looping: when it reaches 1.0 it can either stop or loop (user preference or a "loop" toggle). Default: stop at end so the user can study rope-out.
- Keyboard: Space = toggle play/pause, Left/Right arrows = step by small delta or jump to previous/next stage marker, Home/End = 0/1, number keys 1–4 = jump to stage.

The scrubber is wired to the Zustand store `phase`. The 3D scene and data panel subscribe to it.

## Data Visualization Side Panel

Purpose: show the "numbers" side of the science in a way that is directly tied to the visual simulation.

Contents (at minimum):
- 2–4 line or area charts (SVG or lightweight Canvas) for the key scalars over the full 0–1 phase:
  - Core Pressure Drop (dramatic negative curve)
  - Estimated Maximum Wind (rises at touchdown, peaks, falls)
  - Updraft / Organization index
  - Precip / Debris loading (optional fourth)
- A vertical playhead line or dot that follows the current phase on all charts.
- Large current-value callouts that update live ("ΔP —87 mb", "185 mph").
- When a hotspot/topic is selected, the panel can:
  - Bold or recolor the most relevant trace.
  - Scroll or highlight a short explanatory paragraph tied to that topic.
  - Show "at this phase" mini values.

The data is **not** invented in the UI. It comes from the same `SimulationFrame.scalars` (or `getScalar(phase)`) functions that live in the pure sim core. This guarantees that what the user sees in the 3D and in the charts is the same underlying model.

Expand/collapse: the panel can be closed to give more space to the 3D (very useful on smaller screens or when the user just wants to watch the storm).

## Knowledge / Topic Panel

- Triggered primarily by clicking one of the 8 pulsing balls (or by a list/legend in the panel).
- Shows the exact title + blurb + key facts from `plans/04-exactly-8-topics-content.md`.
- "Sources" line with link or note to NSSL/SPC (even if just text for static).
- While a topic is selected, its pulsing ball can have a stronger visual treatment (brighter pulse, outer ring, the camera can optionally "interest" in it).
- Deselect by clicking empty space in the 3D, a close button, or selecting a different ball.

## Camera & 3D Interaction

- OrbitControls (constrained) for free exploration at any phase.
- "Focus on hotspot" behavior: when a ball is clicked, in addition to selecting the topic, the camera can smoothly tween to a good viewing angle/distance for that feature at the *current* phase (the sim can even suggest a target look-at point per attachment).
- Stage preset buttons (small, thematic): "Wall Cloud View", "Ground Level", "Aloft — Mesocyclone", "Follow RFD". These set both camera and (optionally) jump the phase to the middle of the recommended range for that stage.
- Double-click or a "Reset Camera" button returns to a canonical overview pose.

## Responsive Behavior

- Desktop (wide): 3D dominant + right panel (knowledge or data tabs).
- Tablet: 3D + collapsible right or bottom sheet.
- Mobile (portrait): 3D takes most of the screen. Big play/scrubber at bottom. Tap a pulsing ball (they must be sized generously) → opens a full or half-height drawer with the knowledge content + current data values. Data charts can live in a second tab of that drawer.
- Touch: OrbitControls must support one-finger orbit, two-finger pan/zoom. The scrubber must have a large hit target.

## Theming & Accessibility

- All text in panels and on the scrubber must be high-contrast on the chosen paper/cream or dark backgrounds.
- Focus states for keyboard users (the balls themselves may need invisible but focusable proxies or a separate legend list that is keyboard-navigable).
- Reduced motion: respect `prefers-reduced-motion` by making the pulse slower or static and by offering an "instant phase jump" mode.
- ARIA: the scrubber should be an `<input type="range">` or properly labeled custom control; the 3D canvas can have `aria-label` describing the current phase and selected feature.

## State Shape (Zustand or equivalent)

```ts
interface MezzoState {
  phase: number;              // 0–1, the single most important value
  isPlaying: boolean;
  playbackSpeed: number;
  selectedTopicId: string | null;
  dataPanelOpen: boolean;
  knowledgePanelOpen: boolean; // or unified "infoOpen"
  // camera state if we need to persist presets, etc.
}
```

The sim is called (or its outputs are cached) whenever phase changes. The three scene and the React UI re-render based on the frame + the above state.

## Acceptance Criteria for This Layer (for the implementing agent)

- Scrubbing or playing the timeline makes the 3D storm visibly evolve through all four lifecycle stages with correct particle flow and the 8 balls moving with their features.
- Clicking any ball at any phase reliably selects the matching topic and shows the exact content from the spec.
- The data charts are driven by the sim scalars and the playhead stays in sync with the 3D.
- On mobile the experience remains usable and the balls remain clickable.
- The entire UI chrome matches the Imagine reference images and the theme guide (no modern flat or neon elements).

This layer is mostly "plumbing" once the sim core and the 8 topics are solid. Do the sim first.
