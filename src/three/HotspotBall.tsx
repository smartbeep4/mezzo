/**
 * The physicalized pulsing hotspot "bubble".
 * - World position + relevance come from the pure sim (passed as props, updated when phase changes).
 * - Clicking selects the topic (updates store → knowledge panel + highlight).
 * - Theming: mustard/teal/brick emissive glow + subtle pulse (1-2Hz).
 * - Small <Html> label (uppercase, stamp-like) that appears stronger when selected or high relevance.
 * - Larger invisible hit sphere for reliable raycast (important on mobile).
 *
 * 8 of these are rendered in the scene. Their positions are never hard-coded in React/three components.
 *
 * Refs: plans/03 (dynamic physicalized hotspots), 04 (exactly 8 topics + attachment behavior), 06 (theme), 07.
 */

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useMezzoStore } from '../store'
import type { HotspotId } from '../sim'

interface Props {
  id: HotspotId
  position: [number, number, number]
  relevance: number
}

const LABELS: Record<HotspotId, string> = {
  mesocyclone: 'MESOCYCLONE',
  wall_cloud: 'WALL CLOUD',
  inflow: 'INFLOW',
  rfd: 'RFD',
  condensation_funnel: 'FUNNEL',
  debris_cloud: 'DEBRIS',
  pressure_core: 'CORE',
  rope_out: 'ROPE-OUT',
}

const COLORS: Record<HotspotId, string> = {
  mesocyclone: '#2E5C6E',
  wall_cloud: '#2E5C6E',
  inflow: '#2E5C6E',
  rfd: '#8B2E2E',
  condensation_funnel: '#C17B3A',
  debris_cloud: '#2E5C6E',
  pressure_core: '#C17B3A',
  rope_out: '#8B2E2E',
}

export function HotspotBall({ id, position, relevance }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)

  const selectedId = useMezzoStore((s) => s.selectedTopicId)
  const selectTopic = useMezzoStore((s) => s.selectTopic)

  const isSelected = selectedId === id
  const color = COLORS[id]
  const label = LABELS[id]

  // Gentle continuous pulse (scale + glow intensity)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 2.8 + (id.length * 0.7)) * (0.08 + relevance * 0.09)
    const selBoost = isSelected ? 1.18 : 1.0

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse * selBoost * 0.95)
    }
    if (glowRef.current) {
      const g = pulse * selBoost * (0.9 + relevance * 0.35)
      glowRef.current.scale.setScalar(g)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = (isSelected ? 0.55 : 0.22) + relevance * 0.18
    }

    // Very slight bob for life
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.4 + id.length) * 0.03 * relevance
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    selectTopic(isSelected ? null : id)
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Core sphere (the "ball") */}
      <mesh ref={coreRef} onClick={handleClick}>
        <sphereGeometry args={[0.26]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Glow / halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.42]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.28 + relevance * 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Larger invisible hit target for easy clicking (mobile) */}
      <mesh onClick={handleClick} visible={false}>
        <sphereGeometry args={[0.85]} />
      </mesh>

      {/* Minimal label — only prominent when selected or very relevant */}
      {(isSelected || relevance > 0.55) && (
        <Html
          position={[0, 0.7, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          center
        >
          <div className="hotspot-label" style={{ opacity: isSelected ? 1 : 0.75 + relevance * 0.2 }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}
