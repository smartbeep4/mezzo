/**
 * Authoritative procedural velocity field for "flowing" particle motion.
 * Particles (and conceptually air) are advected using this.
 * Components: rotational vortex, updraft, radial inflow, RFD downdraft + divergence,
 * + curl-noise turbulence scaled by phase.
 * Pure, cheap to sample every frame.
 * See plans/02 "Scripted Fluid / Velocity Field".
 */

import { clamp, lerp } from './utils';
import { curlNoise3, turbulenceAmplitude } from './noise';
import { getFunnelParams, getRfdParams } from './lifecycle';

const PI = Math.PI;

export function getVelocityAt(
  point: { x: number; y: number; z: number },
  phase: number
): { x: number; y: number; z: number } {
  const p = clamp(phase, 0, 1);
  const { x, y, z } = point;
  const funnel = getFunnelParams(p);
  const rfd = getRfdParams(p);

  const r = Math.sqrt(x * x + z * z) + 1e-6;
  const coreR = lerp(0.45, 0.95, smoothstepish(p)); // core widens then contracts

  // 1. Tangential (rotational) vortex — classic 1/r with core cutoff
  const gamma = 2.8 * (0.6 + 0.9 * funnel.condensation); // circulation strength
  let vTheta = (gamma / Math.max(r, coreR)) * (r / (r + 0.6));
  vTheta *= 0.7 + 0.6 * funnel.debrisStrength; // stronger near ground in mature
  const tx = -z / r * vTheta;
  const tz = x / r * vTheta;

  // 2. Updraft (stronger in core, varies with meso organization)
  const upCore = 1.6 * (0.4 + 0.8 * funnel.condensation);
  const up = upCore * Math.exp(- (r * r) / (coreR * coreR * 3.5)) * (y > 0.1 ? 1 : 0.6);
  let vy = up;

  // 3. Radial inflow near surface (convergence)
  let inflow = 0;
  if (y < 2.5) {
    const infStr = 0.9 * (0.3 + 0.7 * smoothstepish(p));
    inflow = - (x / r) * infStr * Math.max(0, 1 - r / 5.5) * (1 - y / 3);
  }

  // 4. RFD downdraft + divergence on rear flank
  const rfdAngle = rfd.angle;
  const rfdVecX = Math.cos(rfdAngle);
  const rfdVecZ = Math.sin(rfdAngle);
  const distRfd = Math.abs(Math.atan2(z, x) - rfdAngle) % (PI * 2);
  const rfdProx = Math.max(0, 1 - (distRfd / (rfd.clearSlotWidth + 0.4)));
  let rfdDown = 0;
  let rfdDivX = 0;
  let rfdDivZ = 0;
  if (rfdProx > 0.05) {
    const rfdStr = rfd.strength * 1.8;
    rfdDown = -rfdStr * rfdProx * (y < 4 ? 1.1 : 0.6);
    // slight diverging at surface
    if (y < 1.8) {
      rfdDivX = rfdVecX * rfdStr * 0.5 * rfdProx;
      rfdDivZ = rfdVecZ * rfdStr * 0.5 * rfdProx;
    }
  }

  // 5. Turbulence (curl noise)
  const turbScale = turbulenceAmplitude(p) * (0.7 + 0.5 * (funnel.debrisStrength + funnel.condensation) * 0.5);
  const curl = curlNoise3(x * 0.9, y * 1.1 + p * 0.4, z * 0.9, 0.07, 1.35 + p * 0.6, 23);
  const txTurb = curl.x * turbScale * 2.2;
  const tyTurb = curl.y * turbScale * 1.6;
  const tzTurb = curl.z * turbScale * 2.2;

  // Combine + light vertical bias for fallout on debris particles (caller decides)
  const vx = tx + inflow + rfdDivX + txTurb;
  const vz = tz + inflow * 0.6 + rfdDivZ + tzTurb; // slight azimuthal bias
  vy = vy + rfdDown + tyTurb - (y > 6 ? 0.15 : 0); // weak upper damping

  // Scale overall by phase intensity (calmer early/late)
  const global = 0.55 + 0.9 * Math.max(funnel.condensation, funnel.debrisStrength);
  return { x: vx * global, y: vy * global, z: vz * global };
}

function smoothstepish(p: number): number {
  // local smooth for core
  return p < 0.5 ? (p * 2) : (1 - (p - 0.5) * 2);
}
