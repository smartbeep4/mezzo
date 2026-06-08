/**
 * Pure math + easing utilities for the simulation core.
 * No React, no three.js. Deterministic, stable across calls.
 * References: plans/02, plans/03.
 */

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function mix(a: number, b: number, t: number): number {
  return lerp(a, b, t);
}

/** Map phase through a smooth rise then fall envelope (0 at ends, 1 at peak). */
export function riseFall(phase: number, riseStart: number, peak: number, fallEnd: number): number {
  if (phase <= riseStart) return 0;
  if (phase >= fallEnd) return 0;
  if (phase <= peak) {
    return smoothstep(riseStart, peak, phase);
  }
  return 1 - smoothstep(peak, fallEnd, phase);
}

/** Small deterministic wiggle using sin (seeded by id/offset for repeatability). */
export function wiggle(phase: number, freq: number, amp: number, seed: number): number {
  return Math.sin(phase * freq * Math.PI * 2 + seed) * amp;
}

/** 2D polar offset helper. */
export function polarOffset(cx: number, cz: number, radius: number, angleRad: number): { x: number; z: number } {
  return {
    x: cx + Math.cos(angleRad) * radius,
    z: cz + Math.sin(angleRad) * radius,
  };
}
