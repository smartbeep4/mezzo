# Exactly 8 Educational Topics + Attachment & Data-Viz Guidance

**Rule**: There are precisely these 8. They are intentionally "light-ish" so they are approachable and can be expanded later without the UI or sim changing much. All text must be accurate to NOAA NSSL and SPC sources (see citations at bottom).

Each topic entry includes:
- `id` (stable, used in code and attachments)
- Short title (for the pulsing ball label and panel header)
- Primary educational blurb (2–4 sentences, friendly but authoritative)
- 2–4 Key Facts (bullet list, with numbers where classic)
- Suggested data-viz emphasis (which scalar(s) to highlight when this topic is selected)
- Attachment strategy / lifecycle behavior (how the physicalized ball should move with phase)
- Best viewing phase range (for camera presets or "fly to" behavior)

The 8 (in rough order of appearance through the lifecycle):

1. **mesocyclone**
2. **wall_cloud**
3. **inflow**
4. **rfd**
5. **condensation_funnel**
6. **debris_cloud**
7. **pressure_core**
8. **rope_out**

---

## 1. mesocyclone

**Title**: The Mesocyclone

**Blurb**: A mesocyclone is a deep, rotating updraft inside a supercell thunderstorm — the parent circulation from which the most powerful tornadoes are born. It is typically several kilometers across and can persist for tens of minutes. Radar sees it as a velocity couplet; visually it is often marked by the storm's overall structure and the wall cloud beneath it.

**Key Facts**:
- Most strong and violent (EF2–EF5) tornadoes form from supercells containing well-developed mesocyclones.
- The mesocyclone is usually 1–6 miles (2–10 km) in diameter.
- Not every mesocyclone produces a tornado; many "fail" to tighten into a surface vortex.
- Rotation develops from wind shear (speed and direction changes with height) that is tilted into the vertical by the storm's updraft.

**Data-viz emphasis**: Updraft strength, broad rotation (if we expose a "meso rotation" scalar), overall storm organization.

**Attachment & movement**:
- Positioned relatively high in the storm (mid-levels).
- Slow, broad circular or near-stationary motion with a slight drift following the storm motion.
- Should remain visible and high even as the low-level tornado forms and later ropes out (the mesocyclone can persist after the tornado decays).

**Best viewing phases**: 0.0 – 0.6 (strongest and most coherent before full rope-out).

---

## 2. wall_cloud

**Title**: The Wall Cloud

**Blurb**: A wall cloud is a localized, persistent lowering of the cloud base beneath the rain-free base of the supercell. It is usually to the rear (often southwest) of the main precipitation area. Wall clouds that rotate, exhibit strong inflow, or show rapid vertical motion are the most likely to be tornadic.

**Key Facts**:
- Wall clouds can exist for 10–20 minutes or more before a tornado appears — but not always.
- They form when rain-cooled air from the downdraft is pulled into the updraft and condenses below the main cloud base.
- A rotating wall cloud is a classic visual warning sign for spotters.
- The wall cloud is where the tornado condensation funnel usually first becomes visible as it descends.

**Data-viz emphasis**: Lowering base height, increasing low-level convergence / inflow.

**Attachment & movement**:
- Starts relatively high and descends noticeably during phases 0.0–0.35.
- Once the tornado touches down it stays low, near the top of the visible funnel.
- The ball should feel "attached to the underside of the storm" and lower with the feature.

**Best viewing phases**: 0.05 – 0.5.

---

## 3. inflow

**Title**: Inflow & Wind Shear

**Blurb**: Warm, moist air rushes into the storm from many miles around — this is the inflow. Strong low-level wind shear (change of wind speed and direction with height) is what allows horizontal spin to be tilted upright into the mesocyclone. You can sometimes see this as ragged inflow bands or a "beaver tail" cloud.

**Key Facts**:
- Inflow bands are low cumulus clouds that often show a spiraling character when rotation is present.
- The storm "vacuums" air from a large area; this convergence helps stretch and intensify rotation.
- Without sufficient shear and instability, even a strong updraft will not organize into a supercell mesocyclone.

**Data-viz emphasis**: Inflow strength or low-level shear proxy (we can use a simple "inflow" or "shear" scalar that peaks in the early-to-middle phases).

**Attachment & movement**:
- Positioned out to the side or southeast of the main updraft, lower in the atmosphere.
- The ball can slowly spiral inward or stay at a characteristic inflow radius that decreases as the tornado organizes.
- Good for showing "where the air is coming from."

**Best viewing phases**: 0.0 – 0.4.

---

## 4. rfd

**Title**: Rear-Flank Downdraft (RFD)

**Blurb**: The RFD is a rush of cooler air descending on the back side of the supercell. It wraps around the mesocyclone and helps focus the rotation near the ground. On the ground it produces the "clear slot" or "bright slot" — a region of clearing or lighter rain just behind the wall cloud. The RFD is also responsible for the hook echo on radar.

**Key Facts**:
- The RFD can produce strong, gusty surface winds and occasional downbursts.
- Its interaction with the updraft and the forward-flank downdraft is thought to be important for tornadogenesis in many cases.
- Visually, the clear slot is one of the most useful things a spotter can recognize.

**Data-viz emphasis**: Downdraft strength or a "clear slot" progress value.

**Attachment & movement**:
- The ball should live on the rear/southwest side and move with the wrapping downdraft.
- It often appears to "sweep in" from the west or southwest as phase increases from ~0.2 to 0.5.
- During rope-out it may still be visible but the tornado is no longer being fed as effectively.

**Best viewing phases**: 0.2 – 0.7.

---

## 5. condensation_funnel

**Title**: Condensation Funnel

**Blurb**: The funnel you see is a column of water droplets condensed because of the low pressure inside the vortex. It is **not** the tornado itself — it is just the visible cloud. A true tornado is the violently rotating column of air that reaches the ground, whether or not a condensation funnel is present.

**Key Facts**:
- "Funnel cloud" = condensation funnel not yet touching the ground.
- Dust and debris at the surface are what confirm a tornado is on the ground, even if the funnel looks like it is still aloft.
- Tornadoes can be on the ground with little or no visible funnel (especially in dry or dusty environments).
- The funnel is usually most impressive during the mature phase.

**Data-viz emphasis**: Funnel height / condensation amount (derived from funnel params).

**Attachment & movement**:
- The ball starts high under the wall cloud and descends with the funnel tip.
- Once on the ground (around phase 0.35–0.4) it stays near the surface connection point and may wobble or orbit slightly with subvortices.
- During rope-out the ball rises and shrinks with the narrowing funnel.

**Best viewing phases**: 0.25 – 0.85 (the most visually dramatic window).

---

## 6. debris_cloud

**Title**: Debris Cloud & Surface Winds

**Blurb**: When the rotating column reaches the ground it picks up dust, dirt, vegetation, and building materials. This debris cloud is often the most visible and dangerous part of the tornado at the surface. Flying debris is the cause of most tornado fatalities.

**Key Facts**:
- The strongest winds are usually in the lowest few hundred feet.
- Debris can be lofted hundreds or thousands of feet and carried long distances.
- Even a "weak" tornado (EF0–EF1) can produce dangerous flying objects.
- The width of the debris cloud does not always equal the width of the most intense winds.

**Data-viz emphasis**: Debris strength / max low-level wind scalar.

**Attachment & movement**:
- Stays very close to the ground.
- During mature phase it is wide and turbulent; in rope-out it becomes narrower and more diffuse.
- Good candidate for a ball that has some small horizontal orbiting motion to show the rotation at the surface.

**Best viewing phases**: 0.35 – 0.9.

---

## 7. pressure_core

**Title**: Extreme Low Pressure in the Core

**Blurb**: The center of a strong tornado has a dramatic drop in atmospheric pressure — sometimes 100 millibars or more below the surroundings in the most intense cases. This is part of what allows the air to accelerate to such high speeds (and why the condensation funnel can form).

**Key Facts**:
- Pressure drops of 50–100+ mb have been directly measured by probes that survived passage through violent tornadoes.
- The pressure gradient helps drive the powerful inflow and the upward motion inside the vortex.
- Structures that are not well anchored can literally "explode" outward because the pressure outside drops so fast (though "exploding houses" is somewhat overstated in popular media).

**Data-viz emphasis**: The pressureDelta scalar (most negative in mature phase, recovering in rope-out).

**Attachment & movement**:
- Should ride right in the center of the visible funnel / vortex axis.
- Descends with the funnel and stays near the surface during the strongest phase.
- Excellent for showing the "heart" of the storm.

**Best viewing phases**: 0.3 – 0.8.

---

## 8. rope_out

**Title**: Rope-out & Dissipation

**Blurb**: As the tornado weakens it often becomes narrower, more tilted, and contorted — the classic "rope" stage. The vortex is stretching and losing its energy supply. Many tornadoes rope out and lift; some are absorbed back into the parent storm or a new circulation forms nearby.

**Key Facts**:
- Rope-out does **not** mean the tornado is no longer dangerous — the winds can still be strong in a narrow zone.
- The storm may be cycling (old tornado dies, new one forms).
- The visual narrowing and increasing tilt are very characteristic.

**Data-viz emphasis**: Decreasing funnel width + intensity scalars, increasing tilt.

**Attachment & movement**:
- The ball(s) that were in the mature funnel should rise, narrow, and become more tilted and erratic.
- One ball can specifically illustrate the "roping" filament as it stretches and breaks.
- Good for a dramatic final phase of the scrubber.

**Best viewing phases**: 0.7 – 1.0.

---

## Data-Viz Panel Guidance (shared)

The side panel should show at minimum:
- Pressure drop trace (dramatic negative spike in mature phase)
- Estimated max wind trace (rises sharply at touchdown, peaks, falls in rope-out)
- Updraft or "organization" proxy
- A simple precip / debris loading indicator

When a topic is selected, the panel can:
- Draw a vertical playhead line or highlight the relevant portion of the curves.
- Show a large current value callout for the most relevant scalar.
- Offer one-sentence "why this matters" tied to the topic.

## Sources & Accuracy Note (for all agents)

- NOAA NSSL: https://www.nssl.noaa.gov/education/svrwx101/tornadoes/
- SPC Tornado FAQ: https://www.spc.noaa.gov/faq/tornado/
- Classic references: Davies-Jones, Snow, Church, etc. on vortex dynamics and pressure measurements (probes).

All numbers and causal statements must be defensible from these public sources. When in doubt, use ranges ("can exceed 200 mph in the most violent cases") rather than precise single values unless a specific famous measurement is well-documented.

**This document + the simulation spec together tell a future agent exactly what the 8 balls should be, where they live in 3D over time, and what the user should learn when they click them.**

Next files: `plans/03-dynamic-hotspots-attachment-system.md` (more technical detail on the locator functions) and the UI spec.
