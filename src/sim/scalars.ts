/**
 * Phase-driven scientific scalars for data visualization panel and tooltips.
 * Values are educational approximations grounded in NOAA NSSL/SPC ranges.
 * Must be the same functions driving both 3D and charts (no duplication).
 * See plans/04 and plans/05.
 */

import { clamp, lerp, smoothstep, riseFall } from './utils';
import type { Scalars } from './types';

export function pressureDelta(phase: number): number {
  const p = clamp(phase, 0, 1);
  // Typical drops: early small, sharp at touchdown, deepest mature (~80-110 mb), recovers in rope
  if (p < 0.22) return lerp(-8, -32, smoothstep(0.05, 0.22, p));
  if (p < 0.42) return lerp(-32, -78, smoothstep(0.22, 0.42, p));
  if (p < 0.72) return lerp(-78, -102, smoothstep(0.42, 0.58, p));
  return lerp(-102, -22, smoothstep(0.72, 1.0, p));
}

export function maxTangentialWind(phase: number): number {
  const p = clamp(phase, 0, 1);
  // mph estimated max near-surface. Rises sharply at touchdown, peaks violent, drops in rope
  if (p < 0.25) return lerp(18, 72, smoothstep(0.1, 0.25, p));
  if (p < 0.48) return lerp(72, 148, smoothstep(0.25, 0.48, p));
  if (p < 0.72) return lerp(148, 172, smoothstep(0.48, 0.62, p));
  return lerp(172, 55, smoothstep(0.72, 1.0, p));
}

export function updraftMax(phase: number): number {
  const p = clamp(phase, 0, 1);
  // Normalized 0-1 proxy (strongest when meso + low-level rotation align)
  return lerp(0.35, 1.0, riseFall(p, 0.08, 0.52, 0.88)) * (0.7 + 0.3 * smoothstep(0.2, 0.55, p));
}

export function precipRate(phase: number): number {
  const p = clamp(phase, 0, 1);
  // Rain/hail loading: wraps in, core often clearer in mature, debris mixes late
  if (p < 0.18) return lerp(0.15, 0.55, smoothstep(0, 0.18, p));
  if (p < 0.45) return lerp(0.55, 0.78, smoothstep(0.18, 0.38, p));
  if (p < 0.72) return lerp(0.78, 0.42, smoothstep(0.45, 0.72, p));
  return lerp(0.42, 0.65, smoothstep(0.72, 0.95, p));
}

export function getAllScalars(phase: number): Scalars {
  return {
    pressureDelta: pressureDelta(phase),
    maxTangentialWind: maxTangentialWind(phase),
    updraftMax: updraftMax(phase),
    precipRate: precipRate(phase),
  };
}

/** Convenience for charts: sample a scalar at N evenly spaced points (0..1). */
export function sampleScalar(fn: (p: number) => number, samples = 64): number[] {
  const out: number[] = [];
  for (let i = 0; i <= samples; i++) {
    out.push(fn(i / samples));
  }
  return out;
}
