/**
 * TEMPORARY SIMULATION TEST HARNESS (pure core verification).
 * This is the "console-driven" first running version of the sim per master instructions.
 * 
 * - Phase scrubber + playhead (keyboard friendly)
 * - Live scalars and lifecycle stage
 * - Live positions + relevance for all 8 dynamic physicalized hotspots
 * - Buttons to step / validate / log frame
 * - Proves: attachments move continuously, scalars are sane, velocity field exists, everything deterministic.
 *
 * This will be replaced by the full R3F + themed UI (TimeScrubber, DataVizPanel, KnowledgePanel, 3D Scene)
 * once the core contract is exercised and stable.
 *
 * References: plans/00, 02, 03, 04, 07.
 */

import { useEffect, useRef, useState } from 'react';
import { computeSimulation, HOTSPOT_IDS, validateFrame, getLifecycleStage, type HotspotId } from './sim';
import type { SimulationFrame } from './sim/types';

const SPEEDS = [0.5, 1, 2, 4];

export default function App() {
  const [phase, setPhase] = useState(0.22);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedId, setSelectedId] = useState<HotspotId | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const frame: SimulationFrame = computeSimulation(phase);
  const stage = getLifecycleStage(phase);
  const valid = validateFrame(frame);

  // Simple RAF playback loop (respects speed)
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = (t: number) => {
      const dt = (t - (lastTimeRef.current || t)) / 1000;
      lastTimeRef.current = t;

      setPhase((prev) => {
        let next = prev + dt * speed * 0.18; // tuned so 1.0 takes ~reasonable real seconds at 1x
        if (next >= 1.0) {
          next = 1.0;
          setIsPlaying(false);
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, speed]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setPhase(parseFloat(e.target.value));
  };

  const jumpTo = (p: number) => {
    setIsPlaying(false);
    setPhase(clamp(p, 0, 1));
  };

  const togglePlay = () => {
    if (phase >= 0.999) setPhase(0);
    setIsPlaying((v) => !v);
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  const logFrame = () => {
    console.log('[MEZZO] current frame @ phase', phase.toFixed(3), frame);
    console.log('[MEZZO] attachments (world positions):', frame.attachments);
  };

  const validate = () => {
    const ok = validateFrame(frame);
    console.log('[MEZZO] validateFrame @', phase.toFixed(3), '=>', ok ? 'PASS' : 'FAIL');
    alert(ok ? 'Frame valid ✓ (see console for details)' : 'Frame INVALID — see console');
  };

  const selectHotspot = (id: HotspotId) => {
    setSelectedId(id === selectedId ? null : id);
  };

  // Sample velocity at a few diagnostic points (ground core, mid funnel, RFD region)
  const velCore = frame.getVelocityAt({ x: 0.1, y: 0.8, z: 0.2 }, phase);
  const velRFD = frame.getVelocityAt({ x: -2.8, y: 1.5, z: -2.4 }, phase);

  return (
    <div className="min-h-screen bg-[#E8D5A3] text-[#1F2528] p-4 font-mono text-sm app-shell">
      <header className="max-w-6xl mx-auto mb-4 flex items-center justify-between border-b-4 border-[#1F2528] pb-3">
        <div>
          <div className="stamp text-2xl tracking-[3px] text-[#8B2E2E]">MEZZO</div>
          <div className="text-[10px] tracking-[1.5px] text-[#2E5C6E] -mt-1">U.S. SEVERE STORMS — TRAINING DIVISION — 1957</div>
        </div>
        <div className="text-right">
          <div className="text-xs">PURE SIMULATION TEST HARNESS</div>
          <div className="text-[10px] text-[#2E5C6E]">phase-driven • attachments physicalized • no three yet</div>
        </div>
      </header>

      {/* PRIMARY TIME CONTROL — will become the big themed scrubber */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="scrubber p-3 rounded-none border-4 border-[#1F2528] bg-[#1F2528] text-[#E8D5A3]">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={togglePlay} className="btn btn-primary text-base px-5 py-1">
              {isPlaying ? 'PAUSE ■' : 'PLAY ▶'}
            </button>
            <button onClick={cycleSpeed} className="btn text-xs px-3 py-1">SPEED ×{speed}</button>

            <div className="flex-1" />

            <div className="data-readout text-[#C17B3A] text-lg font-bold tracking-widest">
              PHASE {phase.toFixed(3)} — {stage}
            </div>

            <button onClick={() => jumpTo(0)} className="btn text-xs">0.00</button>
            <button onClick={() => jumpTo(0.3)} className="btn text-xs">TOUCHDOWN</button>
            <button onClick={() => jumpTo(0.58)} className="btn text-xs">MATURE</button>
            <button onClick={() => jumpTo(0.85)} className="btn text-xs">ROPE</button>
            <button onClick={() => jumpTo(1)} className="btn text-xs">1.00</button>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={phase}
            onChange={handleScrub}
            className="w-full accent-[#C17B3A] cursor-pointer"
          />

          <div className="flex justify-between text-[9px] mt-1 tracking-[1px] text-[#C17B3A]/70">
            <div>WALL CLOUD</div>
            <div>TOUCHDOWN</div>
            <div>MATURE</div>
            <div>ROPE-OUT</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SCALARS + VALIDATION (data-viz precursor) */}
        <div className="lg:col-span-5 vintage-panel p-4">
          <div className="panel-header mb-3 -mx-4 -mt-4">DATA — LIVE SCALARS (from pure sim)</div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-base">
            <div>CORE ΔP</div>
            <div className="data-readout text-right text-[#8B2E2E] font-bold">{frame.scalars.pressureDelta.toFixed(0)} mb</div>

            <div>EST. MAX WIND</div>
            <div className="data-readout text-right text-[#8B2E2E] font-bold">{frame.scalars.maxTangentialWind.toFixed(0)} mph</div>

            <div>UPDRAFT (proxy)</div>
            <div className="data-readout text-right">{frame.scalars.updraftMax.toFixed(2)}</div>

            <div>PRECIP / DEBRIS</div>
            <div className="data-readout text-right">{frame.scalars.precipRate.toFixed(2)}</div>
          </div>

          <div className="mt-4 text-xs flex gap-2">
            <button onClick={validate} className="btn">VALIDATE FRAME</button>
            <button onClick={logFrame} className="btn">LOG FULL FRAME</button>
            <div className={`ml-auto px-2 py-0.5 text-[10px] border ${valid ? 'border-[#2E5C6E] text-[#2E5C6E]' : 'border-[#8B2E2E] text-[#8B2E2E]'}`}>
              {valid ? 'VALID ✓' : 'INVALID'}
            </div>
          </div>

          <div className="mt-3 text-[10px] text-[#2E5C6E]">
            Velocity sample (core): ({velCore.x.toFixed(2)}, {velCore.y.toFixed(2)}, {velCore.z.toFixed(2)})<br />
            Velocity sample (RFD flank): ({velRFD.x.toFixed(2)}, {velRFD.y.toFixed(2)}, {velRFD.z.toFixed(2)})
          </div>
        </div>

        {/* THE 8 DYNAMIC ATTACHMENTS — proves physicalized movement */}
        <div className="lg:col-span-7 vintage-panel p-4">
          <div className="panel-header mb-3 -mx-4 -mt-4">8 PHYSICALIZED HOTSPOTS — LIVE WORLD POSITIONS (sim core)</div>

          <div className="text-[10px] mb-2 text-[#2E5C6E]">All positions computed inside computeSimulation(phase). Scrub to watch them move continuously with the storm features. Click to select (sim does not care).</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {HOTSPOT_IDS.map((id) => {
              const a = frame.attachments[id];
              const isSel = id === selectedId;
              return (
                <button
                  key={id}
                  onClick={() => selectHotspot(id)}
                  className={`text-left border p-2 font-mono transition-colors ${isSel ? 'border-[#C17B3A] bg-[#C17B3A]/10' : 'border-[#1F2528]/40 hover:bg-[#1F2528]/5'}`}
                >
                  <div className="flex justify-between">
                    <span className="font-bold tracking-wider">{id.toUpperCase().replace('_', ' ')}</span>
                    <span className="data-readout text-[#8B2E2E]">rel {a.relevance.toFixed(2)}</span>
                  </div>
                  <div className="data-readout mt-0.5 text-[11px]">
                    x:{a.x.toFixed(2)}  y:{a.y.toFixed(2)}  z:{a.z.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedId && (
            <div className="mt-3 text-xs border border-[#C17B3A] p-2 bg-white/40">
              SELECTED: <span className="font-bold">{selectedId}</span> — position is authoritative from the simulation at this exact phase. In the final app this will highlight the pulsing 3D ball and open the knowledge panel.
            </div>
          )}
        </div>
      </div>

      <footer className="max-w-6xl mx-auto mt-8 text-[10px] text-[#2E5C6E] flex gap-4 flex-wrap">
        <div>MEZZO SIM CORE v0.1 — pure TS, deterministic, no framework deps.</div>
        <div>Follows plans/02 + 03 + 04 exactly. 8 hotspots are physicalized (positions from computeSimulation).</div>
        <div className="ml-auto">Next: R3F viz layer + full themed UI (TimeScrubber, DataViz, Knowledge, pulsing balls)</div>
      </footer>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
