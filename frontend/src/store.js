import { create } from 'zustand';

const API_URL = 'http://localhost:3333/api';

export const useGameStore = create((set, get) => ({
  scenes: [],
  activeScene: null,
  isLoading: false,

  fetchScenes: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/state`);
      const state = await res.json();
      const scenes = state.scenes || [];
      const active = scenes.find((s) => s.id === state.activeSceneId) || scenes[0] || null;
      set({ scenes, activeScene: active });
    } catch (error) {
      console.error('Erro ao buscar cenas:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveScene: async (sceneId) => {
    const { scenes } = get();
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    set({ activeScene: scene });
    try {
      await fetch(`${API_URL}/active-scene`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeSceneId: sceneId }),
      });
    } catch (error) {
      console.error(error);
    }
  },

  createScene: async (payload) => {
    const res = await fetch(`${API_URL}/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const newScene = await res.json();
    set((state) => ({
      scenes: [...state.scenes, newScene],
      activeScene: newScene,
    }));
  },

  duplicateScene: async (sceneId) => {
    const res = await fetch(`${API_URL}/scenes/${sceneId}/duplicate`, { method: 'POST' });
    const newScene = await res.json();
    set((state) => ({
      scenes: [...state.scenes, newScene],
      activeScene: newScene,
    }));
  },

  renameScene: async (sceneId, name) => {
    const { scenes, activeScene } = get();
    const updatedScenes = scenes.map((s) => (s.id === sceneId ? { ...s, name } : s));
    const updatedActive = activeScene?.id === sceneId ? { ...activeScene, name } : activeScene;

    set({ scenes: updatedScenes, activeScene: updatedActive });
    await fetch(`${API_URL}/scenes/${sceneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },

  deleteScene: async (sceneId) => {
    await fetch(`${API_URL}/scenes/${sceneId}`, { method: 'DELETE' });
    get().fetchScenes();
  },

  // --- MOBS ---
  
  createMob: async (mobData) => {
    const { activeScene, scenes } = get();
    const res = await fetch(`${API_URL}/scenes/${activeScene.id}/mobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mobData),
    });
    const newMob = await res.json();
    const updatedScene = { ...activeScene, mobs: [...(activeScene.mobs || []), newMob] };
    
    set({
      activeScene: updatedScene,
      scenes: scenes.map(s => s.id === activeScene.id ? updatedScene : s)
    });
  },

  updateMobHp: async (sceneId, mobId, delta) => {
    const { scenes, activeScene } = get();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const mob = scene.mobs.find(m => m.id === mobId);
    if (!mob) return;

    const newHp = Math.max(0, Math.min(mob.maxHp, (mob.currentHp ?? mob.maxHp) + delta));

    // Otimista
    const updatedMobs = scene.mobs.map(m => m.id === mobId ? { ...m, currentHp: newHp } : m);
    const updatedScene = { ...scene, mobs: updatedMobs };

    set({
      scenes: scenes.map(s => s.id === sceneId ? updatedScene : s),
      activeScene: activeScene?.id === sceneId ? updatedScene : activeScene
    });

    try {
      await fetch(`${API_URL}/scenes/${sceneId}/mobs/${mobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentHp: newHp })
      });
    } catch (error) {
      console.error("Erro HP:", error);
    }
  },

  updateMob: async (sceneId, mobId, updates) => {
    const { scenes, activeScene } = get();
    const updatedMobs = activeScene.mobs.map(m => m.id === mobId ? { ...m, ...updates } : m);
    const updatedScene = { ...activeScene, mobs: updatedMobs };

    set({
      scenes: scenes.map(s => s.id === sceneId ? updatedScene : s),
      activeScene: activeScene?.id === sceneId ? updatedScene : activeScene
    });

    await fetch(`${API_URL}/scenes/${sceneId}/mobs/${mobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },

  deleteMob: async (sceneId, mobId) => {
    const { scenes, activeScene } = get();
    const updatedMobs = activeScene.mobs.filter(m => m.id !== mobId);
    const updatedScene = { ...activeScene, mobs: updatedMobs };

    set({
      scenes: scenes.map(s => s.id === sceneId ? updatedScene : s),
      activeScene: activeScene?.id === sceneId ? updatedScene : activeScene
    });

    await fetch(`${API_URL}/scenes/${sceneId}/mobs/${mobId}`, { method: 'DELETE' });
  },

  // --- AUDIO ---

  addTrackToActiveScene: async (file, type = 'ambiente') => {
    const { activeScene } = get();
    if (!activeScene) return;

    const form = new FormData();
    form.append('file', file);

    const uploadRes = await fetch(`${API_URL}/upload/audio`, {
      method: 'POST',
      body: form,
    });

    if (!uploadRes.ok) throw new Error('Falha upload');
    const uploaded = await uploadRes.json();

    const track = {
      id: `track-${Date.now()}`,
      name: uploaded.name.replace(/\.[^/.]+$/, ""), // remove extensão do display
      url: uploaded.url,
      type, // 'ambiente', 'musica', 'sfx'
      volume: 0.5,
    };

    const res = await fetch(`${API_URL}/scenes/${activeScene.id}/playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(track)
    });
    
    // Atualiza estado local
    const playlist = await res.json();
    const updatedScene = { ...activeScene, playlist };
    
    set((state) => ({
       activeScene: updatedScene,
       scenes: state.scenes.map(s => s.id === activeScene.id ? updatedScene : s)
    }));
  },

  updateTrack: async (sceneId, trackId, updates) => {
    const { scenes, activeScene } = get();
    
    // Otimista
    if (activeScene && activeScene.id === sceneId) {
       const updatedPlaylist = activeScene.playlist.map(t => 
          t.id === trackId ? { ...t, ...updates } : t
       );
       const updatedScene = { ...activeScene, playlist: updatedPlaylist };
       
       set({
          activeScene: updatedScene,
          scenes: scenes.map(s => s.id === sceneId ? updatedScene : s)
       });
    }

    // Persiste
    await fetch(`${API_URL}/scenes/${sceneId}/playlist/${trackId}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(updates)
    });
  },

  deleteTrack: async (sceneId, trackId) => {
    const { scenes, activeScene } = get();

    // Otimista
    if (activeScene && activeScene.id === sceneId) {
       const updatedPlaylist = activeScene.playlist.filter(t => t.id !== trackId);
       const updatedScene = { ...activeScene, playlist: updatedPlaylist };
       
       set({
          activeScene: updatedScene,
          scenes: scenes.map(s => s.id === sceneId ? updatedScene : s)
       });
    }

    await fetch(`${API_URL}/scenes/${sceneId}/playlist/${trackId}`, { method: 'DELETE' });
  }

}));