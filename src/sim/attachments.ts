/**
 * Dynamic physicalized hotspot attachment system.
 * Every position is a pure, smooth, deterministic function of phase inside the sim core.
 * The 3D renderer (HotspotBall) only reads these; it never decides location.
 * Exactly the 8 ids from plans/04-exactly-8-topics-content.md.
 * See plans/03 for strategy details and testing checklist.
 */

import { clamp, lerp, smoothstep, polarOffset, wiggle } from './utils';
import { getFunnelParams, getMesoParams, getWallCloudParams, getRfdParams } from './lifecycle';
import type { HotspotId, AttachmentPoint } from './types';

export function getAllAttachments(phase: number): Record<HotspotId, AttachmentPoint> {
  const p = clamp(phase, 0, 1);
  const funnel = getFunnelParams(p);
  const meso = getMesoParams(p);
  const wall = getWallCloudParams(p);
  const rfd = getRfdParams(p);

  const centerX = 0;
  const centerZ = 0;

  // 1. mesocyclone — high, broad slow orbit, contracts slightly, persists
  const mesoR = meso.radius * 0.55 + wiggle(p, 0.08, 0.15, 1.1);
  const mesoAngle = p * 0.7;
  const mesoPos = polarOffset(centerX, centerZ, mesoR, mesoAngle);
  const mesoY = meso.height + wiggle(p, 0.11, 0.2, 2.3);
  const mesoRel = lerp(0.85, 0.55, smoothstep(0.6, 1.0, p));

  // 2. wall_cloud — tracks lowering base, slight inflow offset
  const wcY = wall.baseHeight + 0.15;
  const wcR = wall.radius * 0.35;
  const wcAngle = -1.2 + wiggle(p, 0.15, 0.25, 3.7); // southeast-ish inflow bias
  const wcPos = polarOffset(centerX, centerZ, wcR, wcAngle);
  const wcRel = p < 0.08 ? 0.3 : 1.0 - 0.2 * smoothstep(0.65, 1, p);

  // 3. inflow — lower, spirals inward from SE
  const inR = lerp(5.5, 2.8, smoothstep(0.0, 0.55, p));
  const inAngle = -2.3 + p * 1.6 + wiggle(p, 0.2, 0.4, 4.9);
  const inPos = polarOffset(centerX, centerZ, Math.max(1.8, inR), inAngle);
  const inY = lerp(1.8, 0.9, smoothstep(0.1, 0.6, p));
  const inRel = 1.0 - 0.6 * smoothstep(0.45, 0.95, p);

  // 4. rfd — rear (SW) flank, sweeps in with clear slot
  const rfdR = lerp(4.2, 2.1, smoothstep(0.15, 0.6, p));
  const rfdPos = polarOffset(centerX, centerZ, rfdR, rfd.angle);
  const rfdY = lerp(3.2, 0.8, smoothstep(0.2, 0.55, p)) + wiggle(p, 0.3, 0.25, 6.1);
  const rfdRel = rfd.strength * (0.7 + 0.3 * smoothstep(0.2, 0.55, p));

  // 5. condensation_funnel — most dramatic mover. Follows funnel tip, then surface orbit, then rises in rope
  let cfY = funnel.height * (p < 0.35 ? 0.85 : 0.15);
  let cfR = 0.0;
  if (p > 0.32 && p < 0.72) {
    cfR = lerp(0.1, 0.55, smoothstep(0.32, 0.55, p)) * (1 - 0.3 * smoothstep(0.55, 0.72, p));
    cfY += Math.sin(p * 11) * 0.08; // subvortex wobble
  } else if (p >= 0.72) {
    cfY = lerp(funnel.height * 0.15, funnel.height * 0.65, smoothstep(0.72, 1.0, p));
    cfR = lerp(0.55, 0.9, smoothstep(0.72, 0.92, p));
  }
  const cfAngle = p * 6.5 + wiggle(p, 0.9, 0.6, 7.3);
  const cfPos = polarOffset(centerX, centerZ, cfR, cfAngle);
  const cfRel = funnel.condensation * (p > 0.2 ? 1 : 0.4);

  // 6. debris_cloud — very low, turbulent, widest in mature
  const debR = lerp(0.2, 1.35, smoothstep(0.28, 0.58, p)) * (1 - 0.6 * smoothstep(0.7, 1, p));
  const debAngle = p * 9.0 + wiggle(p, 1.4, 0.9, 8.5);
  const debPos = polarOffset(centerX, centerZ, debR, debAngle);
  const debY = 0.15 + wiggle(p, 1.8, 0.12, 9.1);
  const debRel = funnel.debrisStrength * (0.6 + 0.4 * smoothstep(0.35, 0.6, p));

  // 7. pressure_core — heart of vortex, follows funnel axis, low in mature
  const pcY = Math.max(0.2, funnel.height * (p < 0.38 ? 0.55 : 0.12));
  const pcR = (p > 0.3 && p < 0.78) ? lerp(0.05, 0.28, smoothstep(0.3, 0.5, p)) * (1 - smoothstep(0.5, 0.78, p)) : 0.1;
  const pcAngle = p * 4.2;
  const pcPos = polarOffset(centerX, centerZ, pcR, pcAngle);
  const pcRel = Math.max(0.3, funnel.condensation * (1 - 0.5 * smoothstep(0.75, 1, p)));

  // 8. rope_out — becomes prominent late; rides the contorted upper filament
  let ropeY = funnel.height * (p < 0.68 ? 0.75 : lerp(0.75, 0.95, smoothstep(0.68, 0.92, p)));
  const ropeR = (p > 0.68 ? lerp(0.3, 1.1, smoothstep(0.68, 0.9, p)) : 0.15);
  const ropeAngle = p * 5.5 + wiggle(p, 0.7, 0.7, 11.3);
  const ropePos = polarOffset(centerX, centerZ, ropeR, ropeAngle);
  const ropeRel = Math.max(0, (p - 0.68) * 3.2);

  return {
    mesocyclone: { x: mesoPos.x, y: mesoY, z: mesoPos.z, relevance: clamp(mesoRel, 0.3, 1) },
    wall_cloud: { x: wcPos.x, y: wcY, z: wcPos.z, relevance: clamp(wcRel, 0.2, 1) },
    inflow: { x: inPos.x, y: inY, z: inPos.z, relevance: clamp(inRel, 0.1, 1) },
    rfd: { x: rfdPos.x, y: rfdY, z: rfdPos.z, relevance: clamp(rfdRel, 0.1, 1) },
    condensation_funnel: { x: cfPos.x, y: cfY, z: cfPos.z, relevance: clamp(cfRel, 0.1, 1) },
    debris_cloud: { x: debPos.x, y: debY, z: debPos.z, relevance: clamp(debRel, 0.05, 1) },
    pressure_core: { x: pcPos.x, y: pcY, z: pcPos.z, relevance: clamp(pcRel, 0.2, 1) },
    rope_out: { x: ropePos.x, y: ropeY, z: ropePos.z, relevance: clamp(ropeRel, 0, 1) },
  };
}
