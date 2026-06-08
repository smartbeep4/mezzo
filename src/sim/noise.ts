/**
 * Lightweight, deterministic 3D noise for turbulence and curl noise.
 * No external deps. Value-noise + fBm style. Good enough for convincing fluid feel.
 * All functions are pure and repeatable for a given (x,y,z,seed,phase) combo.
 * Used by velocityField and for vertex wobble.
 * See plans/02.
 */

function hash(x: number, y: number, z: number, seed: number): number {
  // Cheap 3D hash -> [-1,1]
  let h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 13.3) * 43758.5453;
  h = h - Math.floor(h);
  return h * 2 - 1;
}

function smooth(x: number): number {
  return x * x * (3 - 2 * x);
}

export function valueNoise3(x: number, y: number, z: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;

  const n000 = hash(xi, yi, zi, seed);
  const n100 = hash(xi + 1, yi, zi, seed);
  const n010 = hash(xi, yi + 1, zi, seed);
  const n110 = hash(xi + 1, yi + 1, zi, seed);
  const n001 = hash(xi, yi, zi + 1, seed);
  const n101 = hash(xi + 1, yi, zi + 1, seed);
  const n011 = hash(xi, yi + 1, zi + 1, seed);
  const n111 = hash(xi + 1, yi + 1, zi + 1, seed);

  const u = smooth(xf);
  const v = smooth(yf);
  const w = smooth(zf);

  const nx00 = n000 * (1 - u) + n100 * u;
  const nx10 = n010 * (1 - u) + n110 * u;
  const nx01 = n001 * (1 - u) + n101 * u;
  const nx11 = n011 * (1 - u) + n111 * u;

  const nxy0 = nx00 * (1 - v) + nx10 * v;
  const nxy1 = nx01 * (1 - v) + nx11 * v;

  return nxy0 * (1 - w) + nxy1 * w;
}

export function fbm3(x: number, y: number, z: number, octaves = 4, lac = 2.0, gain = 0.5, seed = 0): number {
  let amp = 1.0;
  let freq = 1.0;
  let sum = 0.0;
  let norm = 0.0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise3(x * freq, y * freq, z * freq, seed + i) * amp;
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / norm;
}

/**
 * Approximate curl noise (divergence-free-ish) at point.
 * Samples fbm gradient numerically. Scale controls frequency.
 */
export function curlNoise3(
  x: number,
  y: number,
  z: number,
  eps = 0.08,
  scale = 1.2,
  seed = 17
): { x: number; y: number; z: number } {
  const f = (px: number, py: number, pz: number) => fbm3(px * scale, py * scale, pz * scale, 3, 2.0, 0.55, seed);

  const dx = (f(x + eps, y, z) - f(x - eps, y, z)) / (2 * eps);
  const dy = (f(x, y + eps, z) - f(x, y - eps, z)) / (2 * eps);
  const dz = (f(x, y, z + eps) - f(x, y, z - eps)) / (2 * eps);

  // Curl of (f, f, f) like field gives rotation
  return {
    x: dy - dz,
    y: dz - dx,
    z: dx - dy,
  };
}

/** Phase-stable turbulence amount (higher in intense phases). */
export function turbulenceAmplitude(phase: number): number {
  // peaks in mature, lower in rope-out
  if (phase < 0.25) return 0.15 + phase * 0.4;
  if (phase < 0.5) return 0.35 + (phase - 0.25) * 1.6;
  if (phase < 0.75) return 0.75;
  return 0.75 * (1 - (phase - 0.75) / 0.25);
}
