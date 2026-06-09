import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  roomId: null,
  myConnectionId: null,
  isHost: false,

  phase: 'lobby',
  manifest: null,
  currentSectorIndex: 0,
  currentEventIndex: 0,
  resources: {},
  eventHistory: [],
  players: {},
  votes: {},

  isGenerating: false,
  generationError: null,

  setRoomId: (roomId) => set({ roomId }),
  setMyConnectionId: (id) => set({ myConnectionId: id }),

  syncState: (state) =>
    set((prev) => ({
      phase: state.phase,
      manifest: state.manifest,
      currentSectorIndex: state.currentSectorIndex,
      currentEventIndex: state.currentEventIndex,
      resources: state.resources,
      eventHistory: state.eventHistory,
      players: state.players,
      votes: state.votes,
      isHost: Object.entries(state.players).some(
        ([id, p]) => p.isHost && id === prev.myConnectionId
      ),
    })),

  setPlayers: (players) =>
    set((prev) => ({
      players,
      isHost: Object.entries(players).some(
        ([id, p]) => p.isHost && id === prev.myConnectionId
      ),
    })),

  setVotes: (votes) => set({ votes }),
  setGenerating: (v) => set({ isGenerating: v }),
  setGenerationError: (e) => set({ generationError: e }),

  getCurrentEvent: () => {
    const { manifest, currentSectorIndex, currentEventIndex } = get();
    if (!manifest) return null;
    const sector = manifest.sectors[currentSectorIndex];
    const eventId = sector?.events[currentEventIndex];
    return manifest.events.find((e) => e.id === eventId) || null;
  },

  getCurrentSector: () => {
    const { manifest, currentSectorIndex } = get();
    return manifest?.sectors[currentSectorIndex] || null;
  },

  getWinStatus: () => {
    const { manifest, resources, phase } = get();
    if (!manifest || phase !== 'finished') return null;
    const thresholds = manifest.win_condition.resource_thresholds;
    const won = Object.entries(thresholds).every(
      ([k, min]) => (resources[k] || 0) >= min
    );
    return won ? 'win' : 'loss';
  },
}));

export default useGameStore;
