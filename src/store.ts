/**
 * Global UI + sim state (Zustand).
 * The phase value here is the single driver for computeSimulation and all derived views.
 * 3D components and data panels subscribe to slices only.
 * See plans/05.
 */

import { create } from 'zustand';
import { computeSimulation, type SimulationFrame, type HotspotId } from './sim';

interface MezzoState {
  phase: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5 | 1 | 2 | 4
  selectedTopicId: HotspotId | null;
  dataPanelOpen: boolean;
  knowledgePanelOpen: boolean;

  // actions
  setPhase: (p: number) => void;
  togglePlay: () => void;
  setSpeed: (s: number) => void;
  selectTopic: (id: HotspotId | null) => void;
  setDataPanelOpen: (open: boolean) => void;
  setKnowledgePanelOpen: (open: boolean) => void;

  // derived (recomputed on demand or via selector in components)
  getFrame: () => SimulationFrame;
}

export const useMezzoStore = create<MezzoState>((set, get) => ({
  phase: 0.22,
  isPlaying: false,
  playbackSpeed: 1,
  selectedTopicId: null,
  dataPanelOpen: true,
  knowledgePanelOpen: true,

  setPhase: (p) => set({ phase: Math.max(0, Math.min(1, p)) }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (s) => set({ playbackSpeed: s }),
  selectTopic: (id) => set({ selectedTopicId: id }),
  setDataPanelOpen: (open) => set({ dataPanelOpen: open }),
  setKnowledgePanelOpen: (open) => set({ knowledgePanelOpen: open }),

  getFrame: () => computeSimulation(get().phase),
}));
