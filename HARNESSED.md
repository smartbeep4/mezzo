# Mezzo is HARNESSED

This project is being built (and will be maintained/extended) using a deliberate **AI orchestration harness** consisting of detailed, self-contained markdown specifications.

## For any future Grok (or human) agent

**Read in this order before writing a single line of app code**:

1. `plans/00-master-build-instructions.md` (the constitution — non-negotiables, workflow, success criteria)
2. `plans/01-architecture-and-stack.md`
3. `plans/02-simulation-time-lifecycle-fluid-volumetrics.md`
4. `plans/03-dynamic-hotspots-attachment-system.md`
5. `plans/04-exactly-8-topics-content.md`
6. `plans/05-ui-data-viz-time-scrubber.md`
7. `plans/06-theme-1950s-fallout-imagine-prompts.md` + `art/theme-guide.md` + the images in `art/reference/`
8. `plans/07-component-inventory.md`
9. `plans/08-deployment-render-static.md`

The root `README.md` also points here.

## What has been delivered in this initial planner phase (current commit)

- Complete harness docs covering simulation contract, dynamic physicalized attachments, exact 8 topics with NOAA-aligned content, UI behavior for the time scrubber + data panel, strict 1950s Fallout / civil defense theme with first Imagine generations + full prompt provenance, component breakdown, and Render static deploy steps.
- First batch of theme art generated with `image_gen` and properly filed in `art/reference/` (with `.prompt.txt` records) and `public/art/` (for the eventual static site).
- Git initialized and shaped up with a clean root commit containing the harness.
- The session `plan.md` has been kept in sync with all user feedback.

## Next step for an implementer agent

Scaffold the Vite React-TS project (or continue if partial work exists), install the long-term stack (three + fiber + drei + zustand + Tailwind), then follow the order in `plans/07-component-inventory.md` while constantly cross-referencing the detailed specs.

The simulation core (`src/sim/`) must be solid and tested in isolation before any three.js or React wiring.

## Theme reminder

All decorative 2D art and UI chrome must stay faithful to the Imagine references and `art/theme-guide.md`. When you need more assets, use the prompt templates in `plans/06-...`.

## Verification

Any agent that completes a major phase must be able to run the full manual checklist in the master instructions + the Render deploy verification in plan 08 and confirm that a real user can scrub the lifecycle, watch the 8 balls move physically with the storm features, click them for accurate light educational content, and see the data viz update in sync — all while the visuals and chrome feel like a 1957 U.S. Weather Bureau training film brought into the browser.

---

Built with care by the initial orchestration planner agent, June 2026.

The harness is the project. Code is the execution of the harness.
