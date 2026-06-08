/**
 * THE simulation core — single source of truth for the entire experience.
 * computeSimulation(phase) returns a complete, self-contained frame description.
 * All 3D geometry, particle motion, hotspot world positions, and data-viz scalars
 * must be derived exclusively from this (or the helper getters).
 *
 * Pure TypeScript. Zero React, zero three.js, zero side effects.
 * Deterministic for a given phase (plus stable internal noise).
 *
 * Freeze this interface before heavy work on consumers.
 * See plans/02, 03, 04 and the master instructions.
 */

import { getFunnelParams, getMesoParams, getWallCloudParams, getRfdParams, getLifecycleStage } from './lifecycle';
import { getAllAttachments } from './attachments';
import { getAllScalars } from './scalars';
import { getVelocityAt } from './velocityField';
import type { SimulationFrame, HotspotId } from './types';

export interface ComputeOptions {
  /** Future: strength multiplier (EF scale), surface type, etc. */
  strength?: number;
}

export function computeSimulation(phase: number, _opts?: ComputeOptions): SimulationFrame {
  const p = Math.max(0, Math.min(1, phase || 0));

  const funnel = getFunnelParams(p);
  const meso = getMesoParams(p);
  const wallCloud = getWallCloudParams(p);
  const rfd = getRfdParams(p);
  const attachments = getAllAttachments(p);
  const scalars = getAllScalars(p);

  // Stable velocity sampler bound to this phase (closure captures p for slight optimizations if desired)
  const getVel = (pt: { x: number; y: number; z: number }, ph?: number) =>
    getVelocityAt(pt, typeof ph === 'number' ? ph : p);

  return {
    phase: p,
    funnel,
    meso,
    wallCloud,
    rfd,
    attachments,
    scalars,
    getVelocityAt: getVel,
  };
}

/** Small helper for UI labels / stage markers (exact strings used in scrubber). */
export { getLifecycleStage };

/** List of the exact 8 hotspot ids (for legends, iteration, validation). */
export const HOTSPOT_IDS: readonly HotspotId[] = [
  'mesocyclone',
  'wall_cloud',
  'inflow',
  'rfd',
  'condensation_funnel',
  'debris_cloud',
  'pressure_core',
  'rope_out',
] as const;

/** Quick validation helper (for tests / harness). Returns true if frame looks sane. */
export function validateFrame(frame: SimulationFrame): boolean {
  if (frame.phase < 0 || frame.phase > 1) return false;
  if (frame.funnel.height < 0) return false;
  if (!frame.attachments || Object.keys(frame.attachments).length !== 8) return false;
  // All attachments have finite numbers
  for (const id of HOTSPOT_IDS) {
    const a = frame.attachments[id];
    if (!a || !isFinite(a.x) || !isFinite(a.y) || !isFinite(a.z)) return false;
  }
  return true;
}
