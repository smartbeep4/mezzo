/**
 * Layered volumetric-ish supercell / wall cloud / anvil representation.
 * v1: several large soft planes + discs at different altitudes and radii.
 * Driven by frame.meso + wallCloud + phase (base lowers, organization increases).
 * Internal motion via simple time + noise feel (no full raymarch yet — clear hook for upgrade).
 *
 * Uses plain three primitives + transparency + slight vertex offset for volume illusion.
 * Parallax works nicely with OrbitControls.
 *
 * Refs: plans/02 (volumetric clouds), plan07.
 */

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { SimulationFrame } from '../sim/types'

interface Props {
  frame: SimulationFrame
}

export function VolumetricClouds({ frame }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const { meso, wallCloud, funnel } = frame

  // Base height of the whole cloud mass lowers dramatically early, then stabilizes
  const cloudBase = wallCloud.baseHeight + 1.2

  // Organization: clouds tighten and become more structured as tornado forms
  const organization = meso.strength * (0.6 + 0.4 * funnel.condensation)

  useFrame((state) => {
    if (!groupRef.current) return
    // Very slow global wind + internal breathing so it feels alive even when paused
    const t = state.clock.elapsedTime * 0.04
    groupRef.current.rotation.y = t * 0.03 + phaseOffset(frame.phase)
  })

  // 9-10 soft cloud "slabs". Different sizes, heights, slight rotations.
  const slabs = [
    { y: 1.6, r: 5.8, rot: 0.1, op: 0.55, scaleY: 0.9 },
    { y: 3.2, r: 4.9, rot: -0.6, op: 0.65, scaleY: 1.1 },
    { y: 4.6, r: 6.2, rot: 1.1, op: 0.48, scaleY: 0.75 },
    { y: 6.1, r: 4.2, rot: -0.3, op: 0.72, scaleY: 1.3 },
    { y: 7.4, r: 5.5, rot: 0.8, op: 0.42, scaleY: 0.85 },
    { y: 8.8, r: 3.8, rot: -1.4, op: 0.6, scaleY: 1.0 },
    { y: 2.4, r: 3.1, rot: 2.2, op: 0.35, scaleY: 1.6 }, // lower inflow-ish band
    { y: 5.0, r: 7.0, rot: 0.4, op: 0.38, scaleY: 0.6 }, // broad anvil-ish
  ]

  return (
    <group ref={groupRef} position={[0, cloudBase - 1.8, 0]}>
      {slabs.map((s, i) => {
        const h = s.y * (0.7 + 0.6 * organization)
        const rad = s.r * (0.85 + 0.3 * (1 - organization))
        const opacity = s.op * (0.6 + 0.5 * (funnel.condensation + meso.strength) * 0.5)

        return (
          <group key={i} rotation={[0, s.rot + i * 0.07, 0]}>
            {/* Main soft slab */}
            <mesh position={[0, h, 0]}>
              <planeGeometry args={[rad * 2, rad * 1.35]} />
              <meshLambertMaterial
                color="#5b6b7a"
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Slightly offset second layer for fake volume */}
            <mesh position={[0.6, h + 0.4, -0.8]} rotation={[0.2, 0, 0]}>
              <planeGeometry args={[rad * 1.6, rad * 1.1]} />
              <meshLambertMaterial
                color="#4a5966"
                transparent
                opacity={opacity * 0.7}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}

      {/* Low rain-free base / wall cloud mass hint (dark underside) */}
      <mesh position={[0, 0.8, 0]} rotation={[0.6, 0.3, 0]}>
        <planeGeometry args={[wallCloud.radius * 2.4, wallCloud.radius * 1.8]} />
        <meshLambertMaterial
          color="#2a353f"
          transparent
          opacity={0.55 + (wallCloud.baseHeight < 3 ? 0.25 : 0)}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function phaseOffset(phase: number) {
  return Math.sin(phase * 1.7) * 0.15
}
