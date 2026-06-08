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
import { useMezzoStore } from '../store'
import { HOTSPOT_IDS } from '../sim'
import { VolumetricClouds } from './VolumetricClouds'
import { Ground } from './Ground'
import { FunnelAndDebris } from './FunnelAndDebris'
import { Particles } from './Particles'
import { HotspotBall } from './HotspotBall'
import type { SimulationFrame } from '../sim'

interface StormProps {
  frame: SimulationFrame
}

function StormObjects({ frame }: StormProps) {
  const { wallCloud, attachments } = frame

  const wallY = wallCloud.baseHeight

  return (
    <group>
      {/* Clouds + ground (phase driven) */}
      <VolumetricClouds frame={frame} />
      <Ground frame={frame} />

      {/* Proper parametric funnel + debris sheath */}
      <FunnelAndDebris frame={frame} />

      {/* Flowing particles (condensation + debris) advected by sim velocity field */}
      <Particles frame={frame} />

      {/* Wall cloud mass hint (subtle) */}
      <mesh position={[0, wallY + 0.3, 0]}>
        <sphereGeometry args={[wallCloud.radius * 0.9]} />
        <meshLambertMaterial
          color="#3f4f5f"
          transparent
          opacity={0.4 + (wallY < 3 ? 0.25 : 0)}
        />
      </mesh>

      {/* The 8 dynamic physicalized pulsing hotspots — positions 100% from the pure sim */}
      {HOTSPOT_IDS.map((id) => {
        const att = attachments[id]
        return (
          <HotspotBall
            key={id}
            id={id}
            position={[att.x, att.y, att.z]}
            relevance={att.relevance}
          />
        )
      })}
    </group>
  )
}

export function Scene() {
  // Fresh frame every time phase (or store) changes — pure & cheap.
  // The 8 HotspotBalls are self-contained (they subscribe to selection via zustand inside).
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

      <StormObjects frame={frame} />

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
