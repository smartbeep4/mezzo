/**
 * Core simulation types and the public contract.
 * This module + simulation.ts are the single source of truth.
 * Pure TypeScript — importable from tests, console harness, 2D diagrams, or the R3F layer.
 * See plans/02-simulation-time-lifecycle-fluid-volumetrics.md and plans/03-dynamic-hotspots-attachment-system.md
 */

export type HotspotId =
  | 'mesocyclone'
  | 'wall_cloud'
  | 'inflow'
  | 'rfd'
  | 'condensation_funnel'
  | 'debris_cloud'
  | 'pressure_core'
  | 'rope_out';

export interface AttachmentPoint {
  x: number;
  y: number;
  z: number;
  /** 0–1 how visually prominent / relevant this feature is at the current phase (drives ball size/glow in renderer) */
  relevance: number;
}

export interface FunnelParams {
  height: number;           // 0 = none aloft, up to full storm scale (~6-8 world units)
  baseRadius: number;
  topRadius: number;
  tiltX: number;            // radians, small
  tiltZ: number;
  condensation: number;     // 0–1 factor for visible density
  debrisStrength: number;   // 0–1 surface debris lofting
}

export interface MesoParams {
  rotation: number;         // rad/s proxy or normalized strength
  radius: number;
  height: number;           // center altitude of meso
  strength: number;         // 0–1 organization
}

export interface WallCloudParams {
  baseHeight: number;
  radius: number;
  rotation: number;
}

export interface RfdParams {
  angle: number;            // radians from +Z or standard (SW ~ 3.9 rad)
  strength: number;
  clearSlotWidth: number;   // angular width proxy
}

export interface Scalars {
  pressureDelta: number;    // mb, negative (e.g. -92)
  maxTangentialWind: number; // mph (estimated surface max)
  updraftMax: number;       // m/s or normalized 0–1 proxy
  precipRate: number;       // 0–1 proxy for rain/hail loading
}

export interface SimulationFrame {
  phase: number;            // 0–1 (clamped input)
  funnel: FunnelParams;
  meso: MesoParams;
  wallCloud: WallCloudParams;
  rfd: RfdParams;
  attachments: Record<HotspotId, AttachmentPoint>;
  scalars: Scalars;
  /** Velocity field sampler for particle advection (pure, stable). */
  getVelocityAt: (point: { x: number; y: number; z: number }, phase: number) => { x: number; y: number; z: number };
}
