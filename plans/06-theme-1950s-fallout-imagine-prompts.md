# Theme Prompts Library — 1950s Fallout / Civil Defense Style

**Rule for all future image generations or edits**: Every prompt must explicitly reference the core style constraints and the official palette. Consistency is more important than novelty.

Base style phrase (include a version of this in almost every prompt):

"1950s US civil defense educational poster / Fallout (game) aesthetic, limited color palette of aged cream #E8D5A3, mustard/safety orange #C17B3A, government teal/storm blue #2E5C6E, brick red/alert #8B2E2E, near-black #1F2528, bold condensed sans all-caps or stencil lettering, halftone texture, rubber stamp administrative marks, aged paper with subtle film grain and vignette, mix of technical line illustration and dramatic painted elements, authoritative but friendly government training material style"

## Hero / Title Treatment (already generated — batch 1)

See `art/reference/01-mezzo-hero-poster.prompt.txt` and the jpg.

Future variants: different angles, night vs day storm, "with debris cloud", tighter crop for favicon or social, etc. Always keep the "MEZZO" title treatment and the 1957 stamp language.

## UI Chrome & Panel References (batch 1)

See `art/reference/02-ui-palette-mock.prompt.txt`.

Use this to lock:
- Exact color swatches for Tailwind
- Stamp density and placement
- Typewriter / data readout style
- How much "ink" vs negative space on panels

## Lifecycle / Instructional Diagrams (batch 1)

See `art/reference/03-lifecycle-diagram.prompt.txt`.

Useful for:
- Time scrubber tick labels and stage names ("WALL CLOUD", "TOUCHDOWN", "MATURE", "ROPE-OUT")
- Any "How it works" static diagram in the help modal or knowledge panel

## Additional Prompt Templates (use these as starting points)

### Logo lockup (for header, favicon treatment, loading)

"1950s government film title card, [base style phrase], large centered 'MEZZO' in bold condensed letters with subtle drop shadow, smaller subtitle 'MESOCYCLONE & TORNADO VISUALIZER', small 'U.S. SEVERE STORMS — TRAINING DIVISION — 1957' at bottom, clean circular or shield emblem containing a tiny stylized tornado, aged paper, one strong rubber stamp 'OFFICIAL TRAINING MATERIAL', square 1:1 or 3:2"

### Data visualization panel background / paper texture

"Close-up of aged 1950s manila folder or graph paper, [base style phrase], faint printed grid, one corner with 'MEZZO — RUN 47 — 14 MAY 1957' stamp in red ink, subtle coffee ring or paper crease, high resolution texture suitable for CSS background or three.js map, square"

### Pulsing hotspot / "physicalized ball" reference illustration (for 2D fallback or legend)

"Technical diagram style, [base style phrase], cross-section view of a tornado vortex with a bright highlighted 'observation ball' or marker sphere inside the funnel at low level, arrows showing rotation and updraft, clean labels 'HOTSPOT — DEBRIS CLOUD', 'PHASE 0.62', rubber stamp 'POSITION RECORDED BY MOBILE MESONET', instructional poster crop"

### "Property of" stamp variations (small assets)

"Rubber stamp impression on paper, [base style phrase], text 'PROPERTY OF U.S. WEATHER BUREAU', 'MEZZO PROJECT', 'FOR EDUCATIONAL USE ONLY', 'REPRODUCE LOCALLY', various sizes and slight rotation angles, transparent PNG style with realistic stamp texture, high contrast"

### Loading screen or intermission card

"Film leader style card, [base style phrase], 'MEZZO — REEL 2 OF 2', countdown circles or 'PLEASE STAND BY', small tornado silhouette, 'WATCH — TORNADO POSSIBLE', strong halftone and film burn edges, 16:9 or vertical phone friendly"

## Regeneration & Edit Rules

- When you need a variant, start from one of the saved .prompt.txt files and append the specific change ("tighter crop", "add more debris at base", "evening light", "add 'EF5' classification box").
- Prefer `image_gen` for new major pieces; use `image_edit` when you want to keep composition but change color, crop, or add a stamp.
- After every generation or edit, immediately create (or update) the matching `.prompt.txt` in `art/reference/` with the exact text sent to the tool and a short "Usage" note.
- Copy the final chosen PNG/JPG into `public/art/` with a stable, descriptive name (e.g. `hero-poster-1957.jpg`).
- Never commit prompt text that was not actually used to generate the asset that lives next to it.

## Theme Enforcement for Coding Agents

- All Tailwind colors and custom CSS must be derived from the palette section in `art/theme-guide.md`.
- Any new decorative element (modal header, button, scrubber track, tooltip) must look like it could have come from one of the reference images.
- When reviewing your own work, open the reference images and the theme guide side-by-side with the running app.

This library + the three reference images from the first batch + `art/theme-guide.md` give any future agent (or human designer) a complete, self-consistent visual system.

**Next step for theme work**: Generate a few more assets (stamp set, loading card, data panel texture) using the templates above, then move on to implementing the simulation core against the other plans.
