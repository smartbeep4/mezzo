/**
 * MEZZO — Main Application Shell (Phase 1+)
 * Themed 1950s U.S. Weather Bureau / Fallout civil defense aesthetic.
 * - Header with stamps
 * - Primary 3D canvas (R3F) driven live by the pure simulation core
 * - Live side panels (Data scalars + Knowledge for selected topic)
 * - Themed time scrubber + playback controls (wired to Zustand store)
 * - Interactive 8-hotspot legend (positions from sim, clickable)
 * - Keyboard support
 *
 * The 3D currently shows a proof-of-concept funnel + the 8 physicalized attachment
 * spheres whose world positions come exclusively from computeSimulation(phase).
 * This is the first visual confirmation of the dynamic hotspot requirement.
 *
 * Future phases will extract TimeScrubber / DataVizPanel / KnowledgePanel,
 * replace stub 3D objects with VolumetricClouds + Funnel + Particles + real
 * pulsing HotspotBalls, add camera presets, full responsive, etc.
 *
 * All science and positions remain 100% from the pure sim (src/sim).
 * Refs: plans/00, 01, 05, 07 (component inventory), 14-r3f-scaffold.
 */

import { useEffect } from 'react'
import { Scene } from './three/Scene'
import { useMezzoStore } from './store'
import { HOTSPOT_IDS, getLifecycleStage } from './sim'
import { topics } from './content/topics'
import type { SimulationFrame } from './sim/types'

const SPEEDS = [0.5, 1, 2, 4] as const

export default function App() {
  const phase = useMezzoStore((s) => s.phase)
  const isPlaying = useMezzoStore((s) => s.isPlaying)
  const playbackSpeed = useMezzoStore((s) => s.playbackSpeed)
  const selectedId = useMezzoStore((s) => s.selectedTopicId)

  const setPhase = useMezzoStore((s) => s.setPhase)
  const togglePlay = useMezzoStore((s) => s.togglePlay)
  const setSpeed = useMezzoStore((s) => s.setSpeed)
  const selectTopic = useMezzoStore((s) => s.selectTopic)

  const frame: SimulationFrame = useMezzoStore((s) => s.getFrame())
  const stage = getLifecycleStage(phase)

  // Playback loop — drives the entire experience (3D + numbers + scrubber)
  // Note: setPhase expects a number (Zustand action), not a React-style updater.
  useEffect(() => {
    if (!isPlaying) return

    let raf: number
    let last = performance.now()

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now

      const current = useMezzoStore.getState().phase
      let next = current + dt * playbackSpeed * 0.22
      if (next >= 1) {
        next = 1
        setTimeout(() => {
          const st = useMezzoStore.getState()
          if (st.isPlaying) st.togglePlay()
        }, 0)
      }
      setPhase(next)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, playbackSpeed, setPhase])

  // Keyboard controls (space, arrows, 1-4 stages, home/end)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (phase >= 0.999) setPhase(0)
        togglePlay()
      }
      if (e.key === 'ArrowLeft') {
        setPhase(Math.max(0, phase - 0.018))
      }
      if (e.key === 'ArrowRight') {
        setPhase(Math.min(1, phase + 0.018))
      }
      if (e.key === 'Home') setPhase(0)
      if (e.key === 'End') setPhase(1)
      if (e.key === 'r' || e.key === 'R') setPhase(0.22)
      if (e.key === '1') setPhase(0.12)
      if (e.key === '2') setPhase(0.33)
      if (e.key === '3') setPhase(0.58)
      if (e.key === '4') setPhase(0.82)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, setPhase, togglePlay])

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhase(parseFloat(e.target.value))
  }

  const jumpTo = (p: number) => {
    setPhase(Math.max(0, Math.min(1, p)))
  }

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(playbackSpeed as any)
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    setSpeed(next)
  }

  const logFrame = () => {
    console.log('[MEZZO] frame @', phase.toFixed(3), frame)
  }

  const selectedTopic = selectedId ? topics[selectedId] : null

  return (
    <div className="min-h-screen bg-[#E8D5A3] text-[#1F2528] font-mono text-sm app-shell flex flex-col">
      {/* HEADER — 1950s government film title treatment */}
      <header className="app-header px-4 py-3 flex items-center justify-between max-w-[1280px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div>
            <div className="stamp text-[28px] tracking-[4px] text-[#8B2E2E] leading-none">MEZZO</div>
            <div className="text-[9px] tracking-[2px] text-[#2E5C6E] -mt-0.5 font-bold">U.S. SEVERE STORMS — TRAINING DIVISION — 1957</div>
          </div>
          <div className="hidden md:block text-xs pl-3 border-l border-[#1F2528]/40 text-[#2E5C6E]">
            MESOCYCLONE &amp; TORNADO VISUALIZER<br />
            <span className="opacity-70">Pure client-side • Procedural • Educational</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="stamp stamp-teal text-[10px] px-2 py-px">OFFICIAL TRAINING MATERIAL</div>
          <button
            onClick={() => alert('MEZZO — 1957 U.S. Weather Bureau training film brought to interactive life.\n\nAll positions, scalars, and lifecycle are driven by a pure simulation core (see src/sim).\nScrub the timeline or click the physicalized hotspots in the 3D view.')}
            className="btn text-xs px-2 py-0.5"
          >
            ABOUT
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1280px] mx-auto w-full gap-3 p-3 overflow-hidden">
        {/* 3D CANVAS — the hero */}
        <div className="flex-1 flex flex-col min-h-[420px] lg:min-h-0">
          <div className="three-container flex-1 rounded-none overflow-hidden relative">
            <Scene />
          </div>
          <div className="text-[9px] text-[#2E5C6E] mt-1 pl-1 tracking-widest hidden lg:block">
            DRAG TO ORBIT • SCROLL TO ZOOM • HOTSPOTS IN 3D ARE DRIVEN BY THE SIM
          </div>
        </div>

        {/* SIDE PANELS — Data + Knowledge (expandable in later phases) */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 side-panel">
          {/* DATA PANEL (scalars live from sim) */}
          <div className="vintage-panel p-3 flex-shrink-0">
            <div className="panel-header -mx-3 -mt-3 mb-3 text-sm">DATA — CURRENT CONDITIONS</div>

            <div className="space-y-1 text-base">
              <div className="flex justify-between">
                <span>CORE PRESSURE DROP</span>
                <span className="data-readout font-bold text-[#8B2E2E]">{frame.scalars.pressureDelta.toFixed(0)} mb</span>
              </div>
              <div className="flex justify-between">
                <span>EST. MAX SURFACE WIND</span>
                <span className="data-readout font-bold text-[#8B2E2E]">{frame.scalars.maxTangentialWind.toFixed(0)} mph</span>
              </div>
              <div className="flex justify-between">
                <span>UPDRAFT STRENGTH</span>
                <span className="data-readout">{frame.scalars.updraftMax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>PRECIP / DEBRIS LOAD</span>
                <span className="data-readout">{frame.scalars.precipRate.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1F2528]/20 text-[10px] text-[#2E5C6E]">
              All values are deterministic functions of phase from the pure simulation core.
            </div>
          </div>

          {/* KNOWLEDGE PANEL — reacts to selection (from 3D or list) */}
          <div className="vintage-panel p-3 flex-1 min-h-[180px]">
            <div className="panel-header -mx-3 -mt-3 mb-3 text-sm flex items-center justify-between">
              <span>KNOWLEDGE — {selectedId ? selectedTopic?.title.toUpperCase() : 'SELECT A HOTSPOT'}</span>
              {selectedId && (
                <button onClick={() => selectTopic(null)} className="text-xs underline">CLEAR</button>
              )}
            </div>

            {selectedTopic ? (
              <div className="text-sm space-y-2">
                <p className="leading-snug">{selectedTopic.blurb}</p>
                <ul className="text-xs list-disc pl-4 space-y-0.5 text-[#1F2528]/90">
                  {selectedTopic.facts.slice(0, 3).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <div className="text-[10px] text-[#2E5C6E] pt-1">
                  Best viewing: phases {selectedTopic.bestPhases}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#2E5C6E]">
                Click any glowing sphere in the 3D view or any item in the legend below to load the corresponding educational content. The physical position of the hotspot is authoritative from the simulation at the current phase.
              </div>
            )}
          </div>

          {/* LIVE 8-HOTSPOT LEGEND (positions from sim — proves physicalization) */}
          <div className="vintage-panel p-3 text-xs">
            <div className="panel-header -mx-3 -mt-3 mb-2 text-sm">8 PHYSICALIZED HOTSPOTS — LIVE POSITIONS</div>
            <div className="grid grid-cols-1 gap-1">
              {HOTSPOT_IDS.map((id) => {
                const a = frame.attachments[id]
                const isSel = id === selectedId
                const label = id.replace('_', ' ').toUpperCase()
                return (
                  <button
                    key={id}
                    onClick={() => selectTopic(isSel ? null : id)}
                    className={`text-left px-2 py-1 border flex justify-between items-center transition-colors font-mono ${
                      isSel
                        ? 'border-[#C17B3A] bg-[#C17B3A]/10'
                        : 'border-[#1F2528]/30 hover:bg-[#1F2528]/5'
                    }`}
                  >
                    <span className="font-bold tracking-wider">{label}</span>
                    <span className="data-readout text-[#8B2E2E] text-[10px]">
                      y:{a.y.toFixed(1)} rel:{a.relevance.toFixed(2)}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="text-[9px] text-[#2E5C6E] mt-2">Positions are computed inside the pure sim (src/sim/attachments.ts). They move continuously with storm features as you scrub.</div>
          </div>
        </div>
      </div>

      {/* PRIMARY TIME SCRUBBER — the star of the experience (thematic film-gauge style) */}
      <div className="scrubber-bar mt-auto px-3 py-2">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {/* Play controls */}
            <button
              onClick={() => {
                if (phase >= 0.999) setPhase(0)
                togglePlay()
              }}
              className="btn btn-primary text-sm px-4 py-1 flex items-center gap-1.5"
            >
              {isPlaying ? 'PAUSE' : 'PLAY'} <span className="text-xs">▶</span>
            </button>

            <button onClick={cycleSpeed} className="btn text-xs px-3 py-1">
              ×{playbackSpeed}
            </button>

            {/* Phase readout + stage */}
            <div className="data-readout text-[#C17B3A] font-bold tracking-[1.5px] text-base ml-1">
              PHASE {phase.toFixed(3)} — {stage}
            </div>

            {/* Stage jump buttons (thematic) */}
            <div className="flex gap-1 ml-auto lg:ml-2">
              <button onClick={() => jumpTo(0.08)} className="btn text-[10px] px-2 py-px">WALL CLOUD</button>
              <button onClick={() => jumpTo(0.33)} className="btn text-[10px] px-2 py-px">TOUCHDOWN</button>
              <button onClick={() => jumpTo(0.58)} className="btn text-[10px] px-2 py-px">MATURE</button>
              <button onClick={() => jumpTo(0.82)} className="btn text-[10px] px-2 py-px">ROPE-OUT</button>
            </div>

            <button onClick={() => { setPhase(0); if (isPlaying) togglePlay() }} className="btn text-xs ml-1">RESET</button>
            <button onClick={logFrame} className="btn text-xs">LOG</button>
            <button
              onClick={() => {
                // Simple camera reset hint — user can also double-click in 3D or use OrbitControls
                const st = useMezzoStore.getState()
                st.setPhase(Math.min(1, Math.max(0, st.phase)))
              }}
              className="btn text-xs ml-1"
            >
              RESET VIEW
            </button>
          </div>

          {/* The actual scrubber track */}
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.0005}
              value={phase}
              onChange={handleScrub}
              className="flex-1 accent-[#C17B3A] cursor-pointer"
              style={{ height: '6px' }}
            />
            <div className="data-readout w-12 text-right text-[#C17B3A] tabular-nums">{phase.toFixed(2)}</div>
          </div>

          {/* Stage tick labels */}
          <div className="flex justify-between text-[9px] tracking-[1px] text-[#C17B3A]/70 mt-0.5 px-0.5">
            <div>WALL CLOUD</div>
            <div>FUNNEL / TOUCHDOWN</div>
            <div>MATURE TORNADO</div>
            <div>ROPE-OUT</div>
          </div>
        </div>
      </div>

      <footer className="text-center text-[9px] text-[#2E5C6E] py-1 border-t border-[#1F2528]/20">
        MEZZO • Pure static • All motion &amp; data from src/sim/computeSimulation(phase) • 1950s civil defense aesthetic
      </footer>
    </div>
  )
}

