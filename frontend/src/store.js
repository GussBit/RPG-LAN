import { create } from 'zustand';
import { API_URL as BASE_URL } from './api';

const API_URL = `${BASE_URL}/api`;

export const useGameStore = create((set, get) => ({
  scenes: [],
  activeScene: null,
  isLoading: false,
  error: null,
  
  // Estado inicial da galeria
  gallery: { images: [], audio: [] },
  presets: { mobs: [], players: [] },

  // --- CENAS (SCENES) ---

  fetchScenes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/state`);
      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
      const state = await res.json();
      const scenes = state.scenes || [];
      const active = scenes.find((s) => s.id === state.activeSceneId) || scenes[0] || null;
      set({ scenes, activeScene: active });
    } catch (error) {
      console.error('Erro ao buscar cenas:', error);
      set({ error: error.message });
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
    if (!res.ok) throw new Error('Falha ao duplicar');
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

  updateScene: async (sceneId, updates) => {
    const { scenes, activeScene } = get();
    const updatedScenes = scenes.map((s) => (s.id === sceneId ? { ...s, ...updates } : s));
    const updatedActive = activeScene?.id === sceneId ? { ...activeScene, ...updates } : activeScene;

    set({ scenes: updatedScenes, activeScene: updatedActive });
    
    await fetch(`${API_URL}/scenes/${sceneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },
  
  updateSceneBackground: async (sceneId, backgroundUrl) => {
    // Usa a função updateScene para evitar duplicação de lógica
    get().updateScene(sceneId, { background: backgroundUrl });
  },

  deleteScene: async (sceneId) => {
    // Atualização Otimista: Remove da lista imediatamente
    const { scenes, activeScene } = get();
    const updatedScenes = scenes.filter(s => s.id !== sceneId);
    
    // Se a cena ativa foi a deletada, muda para a primeira disponível ou null
    let newActive = activeScene;
    if (activeScene?.id === sceneId) {
        newActive = updatedScenes[0] || null;
    }
    
    set({ scenes: updatedScenes, activeScene: newActive });

    // Envia para o servidor (sem recarregar tudo com fetchScenes)
    await fetch(`${API_URL}/scenes/${sceneId}`, { method: 'DELETE' }).catch(err => console.error("Erro ao deletar no servidor:", err));
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

  toggleMobCondition: async (sceneId, mobId, condition) => {
    const { scenes, activeScene } = get();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const mob = (scene.mobs || []).find(m => m.id === mobId);
    if (!mob) return;

    const conditions = mob.conditions || [];
    const hasCondition = conditions.includes(condition);
    const newConditions = hasCondition 
      ? conditions.filter(c => c !== condition)
      : [...conditions, condition];

    const updatedMobs = scene.mobs.map(m => 
      m.id === mobId ? { ...m, conditions: newConditions } : m
    );
    const updatedScene = { ...scene, mobs: updatedMobs };

    set({
      scenes: scenes.map(s => s.id === sceneId ? updatedScene : s),
      activeScene: activeScene?.id === sceneId ? updatedScene : activeScene
    });

    try {
      await fetch(`${API_URL}/scenes/${sceneId}/mobs/${mobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions: newConditions })
      });
    } catch (error) { console.error("Erro ao atualizar condição:", error); }
  },

  // --- PLAYERS ---

  createPlayer: async (playerData) => {
    const { activeScene, scenes } = get();
    const res = await fetch(`${API_URL}/scenes/${activeScene.id}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playerData),
    });
    const newPlayer = await res.json();
    
    const updatedScene = { ...activeScene, players: [...(activeScene.players || []), newPlayer] };
    set({
      activeScene: updatedScene,
      scenes: scenes.map(s => s.id === activeScene.id ? updatedScene : s)
    });
    get().fetchPresets('players'); // Atualiza lista de presets
  },

  updatePlayerHp: async (sceneId, playerId, delta) => {
    const { scenes, activeScene } = get();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const player = (scene.players || []).find(p => p.id === playerId);
    if (!player) return;

    const newHp = Math.max(0, Math.min(player.maxHp, (player.currentHp ?? player.maxHp) + delta));
    const charName = player.characterName;

    // Otimista Global: Atualiza em TODAS as cenas onde esse personagem existe
    const updatedScenes = scenes.map(s => {
        const hasChar = s.players?.some(p => p.characterName === charName);
        if (!hasChar && s.id !== sceneId) return s; // Pula cenas sem esse char

        return {
            ...s,
            players: (s.players || []).map(p => 
                (p.id === playerId || (charName && p.characterName === charName)) 
                ? { ...p, currentHp: newHp } : p
            )
        };
    });

    set({ scenes: updatedScenes, activeScene: updatedScenes.find(s => s.id === activeScene?.id) || activeScene });

    try {
      await fetch(`${API_URL}/scenes/${sceneId}/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentHp: newHp })
      });
    } catch (error) { console.error("Erro HP Player:", error); }
    // Não chamamos fetchPresets aqui para evitar spam de requests durante combate, mas poderia ser adicionado se crítico.
  },

  togglePlayerCondition: async (sceneId, playerId, condition) => {
    const { scenes, activeScene } = get();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const player = (scene.players || []).find(p => p.id === playerId);
    if (!player) return;

    const conditions = player.conditions || [];
    const hasCondition = conditions.includes(condition);
    const newConditions = hasCondition 
      ? conditions.filter(c => c !== condition)
      : [...conditions, condition];
    
    const charName = player.characterName;

    // Otimista Global
    const updatedScenes = scenes.map(s => {
        const hasChar = s.players?.some(p => p.characterName === charName);
        if (!hasChar && s.id !== sceneId) return s;

        return {
            ...s,
            players: (s.players || []).map(p => 
                (p.id === playerId || (charName && p.characterName === charName)) 
                ? { ...p, conditions: newConditions } : p
            )
        };
    });

    set({ scenes: updatedScenes, activeScene: updatedScenes.find(s => s.id === activeScene?.id) || activeScene });

    try {
      await fetch(`${API_URL}/scenes/${sceneId}/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions: newConditions })
      });
    } catch (error) { console.error("Erro ao atualizar condição:", error); }
    get().fetchPresets('players'); // Atualiza lista de presets (condições são salvas no preset)
  },

  deletePlayer: async (sceneId, playerId) => {
    const { scenes, activeScene } = get();
    const updatedPlayers = (activeScene.players || []).filter(p => p.id !== playerId);
    const updatedScene = { ...activeScene, players: updatedPlayers };

    set({
      scenes: scenes.map(s => s.id === sceneId ? updatedScene : s),
      activeScene: activeScene?.id === sceneId ? updatedScene : activeScene
    });

    await fetch(`${API_URL}/scenes/${sceneId}/players/${playerId}`, { method: 'DELETE' });
  },

  updatePlayer: async (sceneId, playerId, updates) => {
    const { scenes, activeScene } = get();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const player = (scene.players || []).find(p => p.id === playerId);
    const charName = player?.characterName;

    // Otimista Global
    const updatedScenes = scenes.map(s => {
        const hasChar = s.players?.some(p => p.characterName === charName);
        if (!hasChar && s.id !== sceneId) return s;

        return {
            ...s,
            players: (s.players || []).map(p => 
                (p.id === playerId || (charName && p.characterName === charName)) 
                ? { ...p, ...updates } : p
            )
        };
    });

    set({ scenes: updatedScenes, activeScene: updatedScenes.find(s => s.id === activeScene?.id) || activeScene });

    try {
      await fetch(`${API_URL}/scenes/${sceneId}/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) { console.error("Erro ao atualizar player:", error); }
    get().fetchPresets('players'); // Atualiza lista de presets
  },

  // Sincroniza apenas os players sem recarregar tudo
  syncPlayers: async () => {
    const { activeScene, scenes } = get();
    if (!activeScene?.id) return;

    try {
      const res = await fetch(`${API_URL}/sync/players/${activeScene.id}`);
      if (!res.ok) return;
      
      const { players } = await res.json();
      
      // Atualiza apenas os players da cena ativa
      const updatedScene = { ...activeScene, players };
      
      set({
        activeScene: updatedScene,
        scenes: scenes.map(s => s.id === activeScene.id ? updatedScene : s)
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  },

  // --- AUDIO / TRACKS ---

  addTrackToActiveScene: async (file, type = 'ambiente', extraData = {}) => {
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
      ...extraData
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

  addTrackFromUrl: async (trackData) => {
    const { activeScene } = get();
    if (!activeScene) return;

    const track = {
      id: `track-${Date.now()}`,
      name: trackData.name,
      url: trackData.url,
      type: trackData.type || 'ambiente',
      volume: 0.5,
      ...trackData.extraData
    };

    const res = await fetch(`${API_URL}/scenes/${activeScene.id}/playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(track)
    });
    
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
  },

  // --- PRESETS ---
  
  fetchPresets: async (type) => {
    try {
      const res = await fetch(`${API_URL}/presets/${type}`);
      const data = await res.json();
      set(state => ({
        presets: { ...state.presets, [type]: data }
      }));
      return data;
    } catch (error) {
      console.error('Erro ao buscar presets:', error);
      return [];
    }
  },

  createPreset: async (type, data) => {
    const res = await fetch(`${API_URL}/presets/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const newPreset = await res.json();
    set(state => ({
        presets: { ...state.presets, [type]: [...(state.presets[type] || []), newPreset] }
    }));
    return newPreset;
  },

  deletePreset: async (type, presetId) => {
    await fetch(`${API_URL}/presets/${type}/${presetId}`, {
      method: 'DELETE'
    });
    set(state => ({
        presets: { ...state.presets, [type]: state.presets[type].filter(p => p.id !== presetId) }
    }));
  },

  // --- GALERIA ---
  // (Lógica centralizada da galeria)
  
  fetchGallery: async () => {
    try {
      const res = await fetch(`${API_URL}/gallery`);
      const data = await res.json();
      set({ gallery: data });
    } catch (error) {
      console.error('Erro ao buscar galeria:', error);
    }
  },

  // Função correta de delete usando o NOME do arquivo
  deleteFromGallery: async (type, fileName) => {
    // type: 'images' | 'audio'
    // fileName: 'nome-do-arquivo.webp' (Exatamente como vem na API)
    
    await fetch(`${API_URL}/gallery/${type}/${fileName}`, {
      method: 'DELETE'
    });
    
    // Atualiza o estado local removendo o item que tem esse nome
    const { gallery } = get();
    const updatedList = gallery[type].filter(item => item.name !== fileName);
    
    set({ 
      gallery: { 
        ...gallery, 
        [type]: updatedList 
      } 
    });
  },

}));