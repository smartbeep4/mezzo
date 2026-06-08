/**
 * Phase → parametric storm structure (funnel, meso, wall cloud, RFD).
 * All outputs are smooth, continuous functions of normalized phase 0–1.
 * See plans/02 for lifecycle envelopes and plans/03 for attachment implications.
 */

import { clamp, lerp, smoothstep, riseFall } from './utils';
import type { FunnelParams, MesoParams, WallCloudParams, RfdParams } from './types';

/** Core lifecycle envelopes (educational stages) */
export function getLifecycleStage(phase: number): string {
  if (phase < 0.22) return 'WALL CLOUD';
  if (phase < 0.42) return 'FUNNEL DESCENT / TOUCHDOWN';
  if (phase < 0.72) return 'MATURE TORNADO';
  return 'ROPE-OUT / DECAY';
}

/** Funnel / condensation + debris geometry profile. */
export function getFunnelParams(phase: number): FunnelParams {
  const p = clamp(phase, 0, 1);

  // Height: starts 0, descends from wall cloud ~0.25, peaks mature, shrinks + lifts in rope
  let height: number;
  if (p < 0.18) {
    height = 0;
  } else if (p < 0.38) {
    height = lerp(0, 4.8, smoothstep(0.18, 0.38, p));
  } else if (p < 0.72) {
    height = lerp(4.8, 6.2, smoothstep(0.38, 0.58, p));
  } else {
    // rope: narrows, lifts slightly, tilts
    height = lerp(6.2, 3.2, smoothstep(0.72, 1.0, p));
  }

  // Radii: early wide at top (wall), mature more cylindrical or ground-widened, rope narrow + contorted
  const topR = lerp(1.8, 0.7, smoothstep(0.2, 0.9, p));
  let baseR: number;
  if (p < 0.32) baseR = lerp(0.3, 1.1, smoothstep(0.18, 0.32, p));
  else if (p < 0.72) baseR = lerp(1.1, 1.6, smoothstep(0.32, 0.55, p));
  else baseR = lerp(1.6, 0.5, smoothstep(0.72, 1.0, p));

  // Tilt grows in rope-out
  const tilt = p > 0.72 ? lerp(0, 0.55, smoothstep(0.72, 1.0, p)) : 0.02 * Math.sin(p * 3);

  // Condensation density ramps with funnel presence, strongest mature
  const cond = riseFall(p, 0.18, 0.55, 0.92) * (p > 0.18 ? 1 : 0);

  // Debris peaks at/after touchdown, wide in mature, diffuses in rope
  const debris = riseFall(p, 0.28, 0.58, 0.95);

  return {
    height: Math.max(0, height),
    baseRadius: Math.max(0.2, baseR),
    topRadius: Math.max(0.3, topR),
    tiltX: tilt * 0.6,
    tiltZ: tilt,
    condensation: clamp(cond, 0, 1),
    debrisStrength: clamp(debris, 0, 1),
  };
}

export function getMesoParams(phase: number): MesoParams {
  const p = clamp(phase, 0, 1);
  // Meso persists aloft, slowly contracts as low-level tightens, still present in rope
  const strength = lerp(0.65, 0.95, smoothstep(0.0, 0.35, p)) * (1 - 0.35 * smoothstep(0.7, 1, p));
  const radius = lerp(3.8, 2.1, smoothstep(0.1, 0.65, p));
  const height = lerp(7.5, 8.2, 0.5 + 0.5 * Math.sin(p * 1.7)); // slight breathing
  const rot = 0.6 + 0.9 * smoothstep(0.15, 0.55, p) * (1 - 0.4 * smoothstep(0.65, 1, p));
  return { rotation: rot, radius, height, strength: clamp(strength, 0.4, 1) };
}

export function getWallCloudParams(phase: number): WallCloudParams {
  const p = clamp(phase, 0, 1);
  // Dramatic lowering 0.0 → ~0.35, then stays low
  const baseH = p < 0.32
    ? lerp(5.8, 2.1, smoothstep(0.0, 0.32, p))
    : lerp(2.1, 1.6, smoothstep(0.32, 0.9, p));
  const rad = lerp(2.4, 1.3, smoothstep(0.05, 0.6, p));
  const rot = 0.8 + 1.4 * smoothstep(0.1, 0.5, p);
  return { baseHeight: baseH, radius: rad, rotation: rot };
}

export function getRfdParams(phase: number): RfdParams {
  const p = clamp(phase, 0, 1);
  // RFD starts wrapping ~0.15, clear slot prominent 0.25-0.6, still present late
  const baseAngle = 3.9; // ~223° (classic SW rear flank)
  const sweep = smoothstep(0.15, 0.48, p) * 0.9; // sweeps in
  const angle = baseAngle + sweep + (p - 0.5) * 0.3; // continues slight rotation

  const str = riseFall(p, 0.12, 0.42, 0.82);
  const slot = lerp(0.6, 1.35, smoothstep(0.2, 0.55, p)) * (1 - 0.3 * smoothstep(0.7, 1, p));
  return { angle, strength: clamp(str, 0, 1), clearSlotWidth: clamp(slot, 0.3, 1.6) };
}
