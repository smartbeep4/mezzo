# Mezzo Visual Theme — 1950's Fallout / Civil Defense Educational Film Style Guide

**Name of aesthetic**: "Atomic Education" or "1957 U.S. Weather Bureau — Severe Storms Division — Training Film"

**Core references**:
- Fallout (the video game series) UI / Pip-Boy / Vault-Tec signage, but filtered through real 1950s–early 1960s American civil defense posters, Army training films, and educational science film strips.
- Limited, bold color palette.
- Heavy use of geometric sans, stenciled or condensed display faces, "rubber stamp" administrative marks.
- Mix of clean technical illustration + dramatic painted elements.
- Paper texture, slight aging, halftone dots, film scratches or reel marks as decorative accents (never overdone).
- Instructional, authoritative, slightly paternalistic but friendly government voice in typography and layout.

## Official Color Palette (use these tokens everywhere)

Primary / "Brass & Teal" (the heart of the look):

- `#E8D5A3` — Aged Cream / Manila (backgrounds, paper)
- `#C17B3A` — Mustard / Safety Orange (accents, titles, "danger" highlights, stamps)
- `#2E5C6E` — Government Teal / Storm Blue (main panels, 3D scene fog/sky influence, secondary text)
- `#8B2E2E` — Brick Red / Alert (critical facts, rope-out phase, pressure warnings)
- `#1F2528` — Near Black / Charcoal (body text, strong lines, 3D ground)
- `#F5EDE0` — Bright Cream (highlights, reverse text on dark)

Secondary / supporting:
- Muted olive-drab greens for vegetation hints on ground
- Cold steel grays for technical overlays
- Very small amounts of safety yellow for "watch" elements

**Never** use modern neon, gradients that look digital, or full-saturation contemporary colors in UI chrome or generated art unless they are inside the 3D render itself (and even then the 3D lighting should feel "filmed" rather than clean CGI).

## Typography Direction

- Display / Titles: Bold condensed sans (think Impact, Trade Gothic Bold Condensed, or a good system approximation like "Arial Black" or Inter Tight Black). All-caps for main titles and section stamps.
- Body / Facts: Clean grotesque or neo-grotesque at slightly larger size than modern defaults (good readability on educational material). Slight letter-spacing on all-caps.
- "Typewriter" or mono for data readouts and small labels (to evoke teletype / radar logs).

In Tailwind we will define:
```css
font-display, .stamp, .data-readout etc.
```

## Decorative Motifs (all to be generated or hand-crafted from generated references)

- Rectangular "rubber stamp" blocks: "PROPERTY OF U.S. WEATHER BUREAU", "FOR TRAINING USE ONLY", "MEZZO — MESOCYCLONE STUDY FILM NO. 3", date stamps like "1957-05".
- Halftone tornado or cloud illustrations.
- Thin technical line diagrams (cross-sections of vortex, wind arrows) over painted sky.
- Film leader / countdown marks, reel numbers, "END OF REEL" as subtle page elements.
- Warning triangles, "WATCH" / "WARNING" boxes in the classic civil defense shape language.

## 3D Scene Styling Within the Theme

The 3D render itself should feel like high-quality modern real-time graphics that has been "filmed" in 1957:
- Slightly desaturated, stormy palette (teals, muddy yellows, dark slate, warm ground).
- Strong contrast and dramatic side lighting (as if a thunderstorm at golden hour or under heavy overcast with occasional lightning "flashbulb").
- Subtle film grain or vignette can be added as a post or CSS overlay on the whole app, not baked into every material.
- The pulsing hotspot balls should read as "physical" objects in the scene but also feel like they belong to the educational diagram language (perhaps a painted highlight ring or a stamped circle around them in 2D overlay).

## How Generated Art Is Used

All 2D decorative assets are produced with the `image_gen` tool using the exact prompt templates in `plans/06-theme-1950s-fallout-imagine-prompts.md`.

Assets live in two places:
- `art/reference/` — the raw generations + the prompt text that produced them (for traceability and regeneration).
- `public/art/` — optimized / cropped / color-corrected versions that the built site actually loads (`/art/xxx.png`).

Rules:
- Never edit the theme by hand-drawing new assets that break the prompt language.
- If an asset needs a small tweak (different crop, stronger halftone), use `image_edit` with a prompt that references the original style description.
- Keep a `manifest.json` or just a clear list in the theme guide so a future agent knows which image is used where (logo, loading screen, panel header texture, data-viz paper background, etc.).

## Current Generated Assets (will be populated by the planner + future agents)

(See the files that will appear next to this guide after image_gen calls.)

## Voice & Microcopy

- Slightly formal but warm 1950s educational narrator tone: "Observe the lowering wall cloud...", "Note the rear-flank downdraft clearing the slot...".
- Data labels can be more telegraphic: "CORE ΔP — 87 mb", "EST. MAX WIND — 185 mph".
- Stamps and legends use bureaucratic language ("CLASSIFIED — TRAINING MATERIAL", "REPRODUCE LOCALLY").

## Implementation Notes for Agents

- Define the palette as Tailwind colors + CSS custom properties at the very beginning of UI work.
- Apply the stamp / film texture treatments to panels, the knowledge card, and the data-viz container.
- The time scrubber itself should look like a film editing bench or an old analog gauge — thick, chunky, with clear phase markers labeled in the vintage typography.
- When in doubt about a visual decision, re-read this document and the master instructions, then look at the reference images rather than guessing.

**This theme is a first-class citizen of the project, equal in importance to the simulation accuracy.**

Next: Read `plans/06-theme-1950s-fallout-imagine-prompts.md` (or create it if you are the first agent) and begin / continue generating the art library.
