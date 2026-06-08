/**
 * Clean public API for the pure simulation core.
 * Consumers (React store, R3F components, future 2D diagram, tests) import from here.
 */

export * from './types';
export * from './simulation';
export { getAllAttachments } from './attachments';
export { getAllScalars, pressureDelta, maxTangentialWind, updraftMax, precipRate, sampleScalar } from './scalars';
export { getVelocityAt } from './velocityField';
export { getFunnelParams, getMesoParams, getWallCloudParams, getRfdParams, getLifecycleStage } from './lifecycle';
export { HOTSPOT_IDS, validateFrame, type ComputeOptions } from './simulation';
