/**
 * Stylized ground + subtle debris scatter for the tornado scene.
 * Phase aware: more disturbed ground / debris hints appear as funnel touches down and matures.
 *
 * Simple but effective — later can receive a "surfaceType" from sim for crops vs dirt vs neighborhood.
 */

import * as THREE from 'three'
import type { SimulationFrame } from '../sim/types'

interface Props {
  frame: SimulationFrame
}

export function Ground({ frame }: Props) {
  const { funnel } = frame
  const debrisStrength = funnel.debrisStrength

  // Debris "kicks up" more in mature phase
  const debrisCount = Math.floor(6 + debrisStrength * 18)
  const debrisItems = Array.from({ length: debrisCount })

  return (
    <group>
      {/* Main ground plane already in Scene; this adds detail layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[18]} />
        <meshLambertMaterial color="#2a2218" />
      </mesh>

      {/* Disturbed earth ring that grows with debrisStrength */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[1.8, 3.8 + debrisStrength * 1.6, 28]} />
        <meshLambertMaterial color="#1f1812" transparent opacity={0.6 + debrisStrength * 0.3} />
      </mesh>

      {/* Scattered debris / dust hints (small cylinders + flat shards) */}
      {debrisItems.map((_, i) => {
        const angle = (i * 1.7 + debrisStrength * 2) % (Math.PI * 2)
        const r = 0.9 + ((i * 0.7) % 3.2) + debrisStrength * 1.5
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r * 0.9
        const y = 0.08 + (i % 3) * 0.04
        const rot = angle + i

        const scale = 0.35 + (i % 4) * 0.12 + debrisStrength * 0.4

        return (
          <group key={i} position={[x, y, z]} rotation={[0.4, rot, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06 * scale, 0.09 * scale, 0.7 * scale, 3]} />
              <meshLambertMaterial color={i % 2 === 0 ? '#3a2f22' : '#2f251a'} />
            </mesh>
            {/* flat shard */}
            <mesh position={[0.15 * scale, 0.1, 0]} rotation={[1.2, 0, 0]}>
              <planeGeometry args={[0.45 * scale, 0.18 * scale]} />
              <meshLambertMaterial color="#2a2118" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}

      {/* Funnel "scar" on ground when strong */}
      {funnel.debrisStrength > 0.3 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <circleGeometry args={[funnel.baseRadius * 1.1]} />
          <meshLambertMaterial color="#1a140f" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  )
}
