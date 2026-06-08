/**
 * Exactly 8 educational topics — single source of truth.
 * Text is copied verbatim (lightly edited only for formatting) from plans/04-exactly-8-topics-content.md.
 * All science claims traceable to NOAA NSSL + SPC public sources.
 * Used by KnowledgePanel and any legend.
 * Do not add, remove, or rewrite the 8 entries.
 */

import type { HotspotId } from '../sim/types';

export interface Topic {
  id: HotspotId;
  title: string;
  blurb: string;
  facts: string[];
  dataVizHint: string;
  bestPhases: string; // e.g. "0.25 – 0.85"
}

export const topics: Record<HotspotId, Topic> = {
  mesocyclone: {
    id: 'mesocyclone',
    title: 'The Mesocyclone',
    blurb: 'A mesocyclone is a deep, rotating updraft inside a supercell thunderstorm — the parent circulation from which the most powerful tornadoes are born. It is typically several kilometers across and can persist for tens of minutes. Radar sees it as a velocity couplet; visually it is often marked by the storm\'s overall structure and the wall cloud beneath it.',
    facts: [
      'Most strong and violent (EF2–EF5) tornadoes form from supercells containing well-developed mesocyclones.',
      'The mesocyclone is usually 1–6 miles (2–10 km) in diameter.',
      'Not every mesocyclone produces a tornado; many "fail" to tighten into a surface vortex.',
      'Rotation develops from wind shear (speed and direction changes with height) that is tilted into the vertical by the storm\'s updraft.',
    ],
    dataVizHint: 'Updraft strength, broad rotation (if we expose a "meso rotation" scalar), overall storm organization.',
    bestPhases: '0.0 – 0.6',
  },
  wall_cloud: {
    id: 'wall_cloud',
    title: 'The Wall Cloud',
    blurb: 'A wall cloud is a localized, persistent lowering of the cloud base beneath the rain-free base of the supercell. It is usually to the rear (often southwest) of the main precipitation area. Wall clouds that rotate, exhibit strong inflow, or show rapid vertical motion are the most likely to be tornadic.',
    facts: [
      'Wall clouds can exist for 10–20 minutes or more before a tornado appears — but not always.',
      'They form when rain-cooled air from the downdraft is pulled into the updraft and condenses below the main cloud base.',
      'A rotating wall cloud is a classic visual warning sign for spotters.',
      'The wall cloud is where the tornado condensation funnel usually first becomes visible as it descends.',
    ],
    dataVizHint: 'Lowering base height, increasing low-level convergence / inflow.',
    bestPhases: '0.05 – 0.5',
  },
  inflow: {
    id: 'inflow',
    title: 'Inflow & Wind Shear',
    blurb: 'Warm, moist air rushes into the storm from many miles around — this is the inflow. Strong low-level wind shear (change of wind speed and direction with height) is what allows horizontal spin to be tilted upright into the mesocyclone. You can sometimes see this as ragged inflow bands or a "beaver tail" cloud.',
    facts: [
      'Inflow bands are low cumulus clouds that often show a spiraling character when rotation is present.',
      'The storm "vacuums" air from a large area; this convergence helps stretch and intensify rotation.',
      'Without sufficient shear and instability, even a strong updraft will not organize into a supercell mesocyclone.',
    ],
    dataVizHint: 'Inflow strength or low-level shear proxy (we can use a simple "inflow" or "shear" scalar that peaks in the early-to-middle phases).',
    bestPhases: '0.0 – 0.4',
  },
  rfd: {
    id: 'rfd',
    title: 'Rear-Flank Downdraft (RFD)',
    blurb: 'The RFD is a rush of cooler air descending on the back side of the supercell. It wraps around the mesocyclone and helps focus the rotation near the ground. On the ground it produces the "clear slot" or "bright slot" — a region of clearing or lighter rain just behind the wall cloud. The RFD is also responsible for the hook echo on radar.',
    facts: [
      'The RFD can produce strong, gusty surface winds and occasional downbursts.',
      'Its interaction with the updraft and the forward-flank downdraft is thought to be important for tornadogenesis in many cases.',
      'Visually, the clear slot is one of the most useful things a spotter can recognize.',
    ],
    dataVizHint: 'Downdraft strength or a "clear slot" progress value.',
    bestPhases: '0.2 – 0.7',
  },
  condensation_funnel: {
    id: 'condensation_funnel',
    title: 'Condensation Funnel',
    blurb: 'The funnel you see is a column of water droplets condensed because of the low pressure inside the vortex. It is not the tornado itself — it is just the visible cloud. A true tornado is the violently rotating column of air that reaches the ground, whether or not a condensation funnel is present.',
    facts: [
      '"Funnel cloud" = condensation funnel not yet touching the ground.',
      'Dust and debris at the surface are what confirm a tornado is on the ground, even if the funnel looks like it is still aloft.',
      'Tornadoes can be on the ground with little or no visible funnel (especially in dry or dusty environments).',
      'The funnel is usually most impressive during the mature phase.',
    ],
    dataVizHint: 'Funnel height / condensation amount (derived from funnel params).',
    bestPhases: '0.25 – 0.85 (the most visually dramatic window)',
  },
  debris_cloud: {
    id: 'debris_cloud',
    title: 'Debris Cloud & Surface Winds',
    blurb: 'When the rotating column reaches the ground it picks up dust, dirt, vegetation, and building materials. This debris cloud is often the most visible and dangerous part of the tornado at the surface. Flying debris is the cause of most tornado fatalities.',
    facts: [
      'The strongest winds are usually in the lowest few hundred feet.',
      'Debris can be lofted hundreds or thousands of feet and carried long distances.',
      'Even a "weak" tornado (EF0–EF1) can produce dangerous flying objects.',
      'The width of the debris cloud does not always equal the width of the most intense winds.',
    ],
    dataVizHint: 'Debris strength / max low-level wind scalar.',
    bestPhases: '0.35 – 0.9',
  },
  pressure_core: {
    id: 'pressure_core',
    title: 'Extreme Low Pressure in the Core',
    blurb: 'The center of a strong tornado has a dramatic drop in atmospheric pressure — sometimes 100 millibars or more below the surroundings in the most intense cases. This is part of what allows the air to accelerate to such high speeds (and why the condensation funnel can form).',
    facts: [
      'Pressure drops of 50–100+ mb have been directly measured by probes that survived passage through violent tornadoes.',
      'The pressure gradient helps drive the powerful inflow and the upward motion inside the vortex.',
      'Structures that are not well anchored can literally "explode" outward because the pressure outside drops so fast (though "exploding houses" is somewhat overstated in popular media).',
    ],
    dataVizHint: 'The pressureDelta scalar (most negative in mature phase, recovering in rope-out).',
    bestPhases: '0.3 – 0.8',
  },
  rope_out: {
    id: 'rope_out',
    title: 'Rope-out & Dissipation',
    blurb: 'As the tornado weakens it often becomes narrower, more tilted, and contorted — the classic "rope" stage. The vortex is stretching and losing its energy supply. Many tornadoes rope out and lift; some are absorbed back into the parent storm or a new circulation forms nearby.',
    facts: [
      'Rope-out does not mean the tornado is no longer dangerous — the winds can still be strong in a narrow zone.',
      'The storm may be cycling (old tornado dies, new one forms).',
      'The visual narrowing and increasing tilt are very characteristic.',
    ],
    dataVizHint: 'Decreasing funnel width + intensity scalars, increasing tilt.',
    bestPhases: '0.7 – 1.0',
  },
};

export const TOPIC_ORDER: HotspotId[] = [
  'mesocyclone', 'wall_cloud', 'inflow', 'rfd',
  'condensation_funnel', 'debris_cloud', 'pressure_core', 'rope_out',
];
