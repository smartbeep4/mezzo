/**
 * Basic R3F Scene for Mezzo.
 * Subscribes to phase via Zustand store (or receives frame prop).
 * Renders:
 * - Stormy ground
 * - Simple parametric funnel stub (cylinder) driven by frame.funnel
 * - Wall cloud hint
 * - 8 small spheres at the live attachment positions from the pure sim
 *   (this is the first visual proof that hotspots are physicalized and move with features)
 *
 * Later phases will replace the stub geometry with VolumetricClouds, real FunnelAndDebris,
 * Particles (advected via getVelocityAt), and dedicated HotspotBall components.
 *
 * Refs: plans/01, 02, 03, 05, 07-component-inventory (14-r3f-scaffold)
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import { useMezzoStore } from '../store'
import { HOTSPOT_IDS, type HotspotId } from '../sim'
import type { SimulationFrame } from '../sim/types'

interface StormProps {
  frame: SimulationFrame
  selectedId: HotspotId | null
  onSelect: (id: HotspotId | null) => void
}

function StormObjects({ frame, selectedId, onSelect }: StormProps) {
  const { funnel, wallCloud, attachments } = frame

  // Simple funnel stub: cylinder that changes height, radii, slight tilt via rotation
  const funnelRotation = useMemo(() => {
    return new THREE.Euler(funnel.tiltX, 0, funnel.tiltZ)
  }, [funnel.tiltX, funnel.tiltZ])

  // Wall cloud as a flattened sphere at base height
  const wallY = wallCloud.baseHeight

  return (
    <group>
      {/* Ground plane - stylized earth / plains */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#2f271f" />
      </mesh>

      {/* Simple ground circle for tornado base area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[4.5]} />
        <meshLambertMaterial color="#3a2f1f" />
      </mesh>

      {/* Funnel stub (will be replaced by proper FunnelAndDebris) */}
      <group position={[0, funnel.height / 2, 0]} rotation={funnelRotation}>
        <mesh>
          <cylinderGeometry
            args={[
              funnel.baseRadius,
              funnel.topRadius || funnel.baseRadius * 0.6,
              Math.max(0.1, funnel.height),
              18,
              1,
              true,
            ]}
          />
          <meshLambertMaterial
            color="#4a5a68"
            side={THREE.DoubleSide}
            transparent
            opacity={0.35 + funnel.condensation * 0.45}
          />
        </mesh>
        {/* Inner darker core for condensation hint */}
        <mesh>
          <cylinderGeometry
            args={[
              funnel.baseRadius * 0.6,
              (funnel.topRadius || funnel.baseRadius * 0.6) * 0.7,
              Math.max(0.1, funnel.height),
              12,
              1,
              true,
            ]}
          />
          <meshLambertMaterial
            color="#2a3a48"
            side={THREE.DoubleSide}
            transparent
            opacity={0.25 + funnel.condensation * 0.55}
          />
        </mesh>
      </group>

      {/* Wall cloud lowering indicator (broad lowering mass) */}
      <mesh position={[0, wallY + 0.3, 0]}>
        <sphereGeometry args={[wallCloud.radius * 0.9]} />
        <meshLambertMaterial
          color="#3f4f5f"
          transparent
          opacity={0.4 + (wallY < 3 ? 0.25 : 0)}
        />
      </mesh>

      {/* The 8 physicalized attachment preview spheres.
          Their positions come 100% from the pure sim (attachments.ts).
          This proves the "dynamic physicalized hotspots" requirement in 3D. */}
      {HOTSPOT_IDS.map((id) => {
        const att = attachments[id]
        const isSel = id === selectedId
        const baseColor =
          id === 'pressure_core' || id === 'condensation_funnel'
            ? '#C17B3A' // mustard for core drama
            : id === 'rfd' || id === 'rope_out'
              ? '#8B2E2E' // brick/alert
              : '#2E5C6E' // teal for meso/wall/inflow/debris

        const size = isSel ? 0.38 : 0.22 + att.relevance * 0.12

        return (
          <group key={id} position={[att.x, att.y, att.z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation()
                onSelect(isSel ? null : id)
              }}
            >
              <sphereGeometry args={[size]} />
              <meshBasicMaterial color={baseColor} />
            </mesh>
            {/* Subtle glow ring for visibility */}
            <mesh>
              <ringGeometry args={[size * 1.35, size * 1.65, 16]} />
              <meshBasicMaterial
                color={isSel ? '#E8D5A3' : baseColor}
                transparent
                opacity={isSel ? 0.7 : 0.25 + att.relevance * 0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}

      {/* Very rough meso aloft indicator (high ring) */}
      <mesh position={[0, frame.meso.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[frame.meso.radius * 0.7, frame.meso.radius * 0.85, 24]} />
        <meshBasicMaterial color="#2E5C6E" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function Scene() {
  // Subscribe to store for live updates (phase drives everything via frame)
  const selectedId = useMezzoStore((s) => s.selectedTopicId)
  const selectTopic = useMezzoStore((s) => s.selectTopic)

  // Fresh frame every time phase (or store) changes — pure & cheap
  const frame = useMezzoStore((s) => s.getFrame())

  return (
    <Canvas
      camera={{ position: [11, 5.5, 13], fov: 48, near: 0.5, far: 120 }}
      style={{ width: '100%', height: '100%', background: '#0f161c' }}
      gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
    >
      {/* Lights — dramatic 1950s film side lighting */}
      <ambientLight intensity={0.35} color="#a8b8c8" />
      <directionalLight
        position={[18, 22, -8]}
        intensity={0.9}
        color="#f5e8c7"
        castShadow
      />
      <directionalLight
        position={[-12, 8, 14]}
        intensity={0.35}
        color="#9ab8c8"
      />

      <StormObjects
        frame={frame}
        selectedId={selectedId}
        onSelect={selectTopic}
      />

      {/* User can orbit but not go underground or too far */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.5}
        maxDistance={32}
        maxPolarAngle={Math.PI * 0.82}
        minPolarAngle={0.18}
        target={[0, 2.8, 0]}
      />

      {/* Subtle fog for depth / storm atmosphere */}
      <fog attach="fog" args={['#0f161c', 22, 48]} />
    </Canvas>
  )
}
