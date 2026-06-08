/**
 * Particle system for condensation, inflow, and debris.
 * Uses a fixed pool of Points + BufferAttributes (age, seed, type, velocity seed).
 * Every frame we advect using the authoritative velocity field from the sim:
 *   frame.getVelocityAt(worldPoint, phase)
 *
 * Multiple "species":
 *  - 0: condensation / cloud droplets (light, follow rotation + updraft strongly)
 *  - 1: debris / dust (heavier, more fallout, start near ground, larger)
 *
 * Spawn rate and initial locations are phase driven (more condensation when funnel active,
 * more debris near touchdown/mature).
 *
 * This delivers the "light but convincing scripted fluid" requirement.
 * Refs: plans/02 (velocity field + particles), 07.
 */

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { SimulationFrame } from '../sim/types'

const MAX_PARTICLES = 7200
const CONDENSATION = 0
const DEBRIS = 1

interface Props {
  frame: SimulationFrame
}

export function Particles({ frame }: Props) {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, ages, seeds, types } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3)
    const age = new Float32Array(MAX_PARTICLES)
    const seed = new Float32Array(MAX_PARTICLES)
    const typ = new Float32Array(MAX_PARTICLES)

    // Initial scatter (some in air, some near ground)
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const isDebris = i % 5 === 0
      typ[i] = isDebris ? DEBRIS : CONDENSATION

      const r = isDebris ? 1.2 + Math.random() * 2.8 : 0.4 + Math.random() * 3.5
      const a = Math.random() * Math.PI * 2
      pos[i * 3 + 0] = Math.cos(a) * r
      pos[i * 3 + 1] = isDebris ? Math.random() * 1.2 : 1.5 + Math.random() * 5
      pos[i * 3 + 2] = Math.sin(a) * r * 0.9

      age[i] = Math.random() * 3.5
      seed[i] = Math.random() * 100
    }
    return { positions: pos, ages: age, seeds: seed, types: typ }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('age', new THREE.BufferAttribute(ages, 1))
    geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('ptype', new THREE.BufferAttribute(types, 1))
    return geo
  }, [positions, ages, seeds, types])

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.07,
      color: '#c8d4e0',
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      sizeAttenuation: true,
    })
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const ageAttr = pointsRef.current.geometry.attributes.age as THREE.BufferAttribute
    const ptypeAttr = pointsRef.current.geometry.attributes.ptype as THREE.BufferAttribute

    const positionsArr = posAttr.array as Float32Array
    const ageArr = ageAttr.array as Float32Array
    const typeArr = ptypeAttr.array as Float32Array

    const dt = Math.min(delta, 0.04)
    const p = frame.phase
    const getVel = frame.getVelocityAt

    const spawnRadius = 3.2 + frame.funnel.debrisStrength * 1.2
    const condSpawnY = frame.wallCloud.baseHeight + 0.5

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3
      let x = positionsArr[i3]
      let y = positionsArr[i3 + 1]
      let z = positionsArr[i3 + 2]

      const age = ageArr[i]
      const ptype = typeArr[i]

      // Age and possibly respawn
      const life = ptype === DEBRIS ? 2.8 : 4.2
      let newAge = age + dt * (1.0 + ptype * 0.3)

      if (newAge > life || y < -0.5 || (y > 14 && ptype === CONDENSATION)) {
        // Respawn
        newAge = Math.random() * 0.8
        const isDebris = ptype === DEBRIS
        const r = isDebris
          ? 0.6 + Math.random() * (1.8 + frame.funnel.debrisStrength * 2.2)
          : 0.3 + Math.random() * spawnRadius
        const a = Math.random() * Math.PI * 2 + p * 2

        x = Math.cos(a) * r + (Math.random() - 0.5) * 0.6
        z = Math.sin(a) * r * 0.85 + (Math.random() - 0.5) * 0.6

        if (isDebris) {
          y = 0.15 + Math.random() * 0.9
        } else {
          y = condSpawnY + Math.random() * (frame.funnel.height * 0.7 + 1.5)
        }
      } else {
        // Advect using the sim velocity field
        const vel = getVel({ x, y, z }, p)

        // Drag + terminal velocity bias for debris
        const drag = ptype === DEBRIS ? 0.78 : 0.92
        x += vel.x * dt * drag
        y += vel.y * dt * (ptype === DEBRIS ? 0.6 : 1.05)
        z += vel.z * dt * drag

        // Extra gravity / fallout for debris
        if (ptype === DEBRIS) {
          y -= dt * 1.6
        }
      }

      positionsArr[i3] = x
      positionsArr[i3 + 1] = y
      positionsArr[i3 + 2] = z
      ageArr[i] = newAge
    }

    posAttr.needsUpdate = true
    ageAttr.needsUpdate = true

    // Subtle size / opacity pulse with condensation
    const mat = pointsRef.current.material as THREE.PointsMaterial
    mat.size = 0.055 + frame.funnel.condensation * 0.04
    mat.opacity = 0.55 + frame.funnel.condensation * 0.35
  })

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
  )
}
