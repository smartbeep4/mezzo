/**
 * Parametric condensation funnel + debris sheath.
 * Geometry is built from the sim frame.funnel params (height, radii, tilt, condensation, debrisStrength).
 * Multiple stacked segments give a nice profile that changes over the lifecycle.
 * Slight wobble via vertex displacement (time + phase + simple noise).
 *
 * Debris cloud is a wider, lower, more opaque cone/sheath that peaks in mature phase.
 *
 * This replaces the crude cylinder stub. Still pure three primitives + Buffer for wobble.
 * Clear extension point: swap for a glTF or custom shader later.
 *
 * Refs: plans/02, 07.
 */

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { SimulationFrame } from '../sim/types'

interface Props {
  frame: SimulationFrame
}

export function FunnelAndDebris({ frame }: Props) {
  const funnelGroup = useRef<THREE.Group>(null!)
  const debrisRef = useRef<THREE.Mesh>(null!)

  const { funnel } = frame

  // Build a simple multi-segment funnel profile (top wider early, more cylindrical or ground-flared in mature)
  const funnelGeometry = useMemo(() => {
    const segments = 7
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    const h = Math.max(0.2, funnel.height)
    const circumference = 18

    for (let s = 0; s <= segments; s++) {
      const t = s / segments
      const y = t * h - h / 2

      // Radius profile (lerp between base/top with some flare at bottom in mature)
      let r = funnel.topRadius + (funnel.baseRadius - funnel.topRadius) * (1 - t)
      if (t > 0.7) {
        r += (funnel.baseRadius * 0.4) * (t - 0.7) * 3 * funnel.debrisStrength
      }

      for (let c = 0; c <= circumference; c++) {
        const ca = (c / circumference) * Math.PI * 2
        const x = Math.cos(ca) * r
        const z = Math.sin(ca) * r

        // Add some wobble (will be animated in useFrame via morph or we just set initial + rotate group)
        const wx = Math.sin(y * 1.8 + c) * 0.03 * (funnel.condensation + 0.2)
        const wz = Math.cos(y * 2.1 + c * 1.3) * 0.03 * (funnel.condensation + 0.2)

        positions.push(x + wx, y, z + wz)
        normals.push(x / r, 0, z / r) // rough
        uvs.push(c / circumference, t)
      }
    }

    const vertsPerRing = 19
    for (let s = 0; s < segments; s++) {
      for (let c = 0; c < circumference; c++) {
        const a = s * vertsPerRing + c
        const b = a + vertsPerRing
        const c2 = a + 1
        const d = b + 1

        indices.push(a, b, c2)
        indices.push(c2, b, d)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [funnel.baseRadius, funnel.topRadius, funnel.height, funnel.condensation, funnel.debrisStrength])

  // Debris sheath (wider low cone)
  const debrisGeometry = useMemo(() => {
    const rBot = funnel.baseRadius * (1.6 + funnel.debrisStrength * 0.9)
    const h = Math.min(funnel.height * 0.55, 3.2)
    return new THREE.ConeGeometry(rBot, h, 16, 1, true)
  }, [funnel.baseRadius, funnel.debrisStrength, funnel.height])

  useFrame((state) => {
    if (funnelGroup.current) {
      // Gentle wobble + tilt already in geometry, add breathing rotation
      const t = state.clock.elapsedTime
      funnelGroup.current.rotation.y = Math.sin(t * 0.7) * 0.015 * funnel.condensation
      funnelGroup.current.position.y = funnel.height / 2 + Math.sin(t * 1.6) * 0.04 * funnel.condensation
    }
    if (debrisRef.current) {
      debrisRef.current.rotation.y = state.clock.elapsedTime * -0.6
    }
  })

  const tilt = new THREE.Euler(funnel.tiltX * 0.7, 0, funnel.tiltZ)

  return (
    <group>
      {/* Condensation funnel */}
      <group ref={funnelGroup} position={[0, 0, 0]} rotation={tilt}>
        <mesh geometry={funnelGeometry} position={[0, 0, 0]}>
          <meshLambertMaterial
            color="#5a6a78"
            side={THREE.DoubleSide}
            transparent
            opacity={0.28 + funnel.condensation * 0.55}
            depthWrite={false}
          />
        </mesh>
        {/* Darker inner vortex */}
        <mesh geometry={funnelGeometry} position={[0, 0, 0]} scale={[0.72, 1, 0.72]}>
          <meshLambertMaterial
            color="#2a3644"
            side={THREE.DoubleSide}
            transparent
            opacity={0.35 + funnel.condensation * 0.4}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Debris cloud / sheath at surface */}
      {funnel.debrisStrength > 0.05 && (
        <group position={[0, funnel.debrisStrength * 0.6, 0]} rotation={tilt}>
          <mesh ref={debrisRef} geometry={debrisGeometry} position={[0, -0.6, 0]}>
            <meshLambertMaterial
              color="#3a2f22"
              side={THREE.DoubleSide}
              transparent
              opacity={0.15 + funnel.debrisStrength * 0.55}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}
