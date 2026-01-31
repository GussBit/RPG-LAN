import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Loader2, Plus, Trash2, Edit2, Map as MapIcon, 
  FolderOpen, Image as ImageIcon, Upload as UploadIcon, Users, Skull, BookOpen,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Square, Play, Pause,
  Wind, Music, Zap
} from 'lucide-react';
import { Howler } from 'howler';

// Hooks e Stores
import { useGameStore } from './store';

// Componentes Extraídos
import Modal from './components/ui/Modal';
import Field from './components/ui/Field';
import PillButton from './components/ui/PillButton';
import SceneCard from './components/scenes/SceneCard';
import ConditionsBar from './components/players/ConditionsBar';
import MobCard from './MobCard';
import Mixer from './Mixer';
import MediaGallery from './MediaGallery';
import PresetsManager from './PresetsManager';
import Compendium from './components/Compendium';
import { CONDITIONS, getImageUrl, BACKEND_URL } from './constants';

export default function App() {
  const {
    scenes, activeScene, fetchScenes, isLoading,
    updateMobHp, deleteMob, createMob, setActiveScene, createScene, duplicateScene, deleteScene,
    createPlayer, updatePlayerHp, deletePlayer, updatePlayer, togglePlayerCondition, syncPlayers,
    updateSceneBackground, updateMob, presets, fetchPresets, deletePreset, createPreset
  } = useGameStore();

  // --- ESTADOS DE UI E FORMULÁRIOS ---
  const [mobModalOpen, setMobModalOpen] = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [editSceneModalOpen, setEditSceneModalOpen] = useState(false);
  const [editMobModalOpen, setEditMobModalOpen] = useState(false);
  const [editPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('scenes');

  const [sceneName, setSceneName] = useState('');
  const [mobForm, setMobForm] = useState({ name: '', color: 'red', maxHp: 10, damageDice: '1d6', toHit: 0, image: '' });
  const [playerForm, setPlayerForm] = useState({ playerName: '', characterName: '', photo: '', maxHp: 20 });
  
  const [editingScene, setEditingScene] = useState(null);
  const [editingMob, setEditingMob] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [mapSceneId, setMapSceneId] = useState(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryType, setGalleryType] = useState('images');
  const [galleryCallback, setGalleryCallback] = useState(null);
  
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presetsType, setPresetsType] = useState('mobs');
  const [presetsCallback, setPresetsCallback] = useState(null);

  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [busyScene, setBusyScene] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [tensionMaxMultiplier, setTensionMaxMultiplier] = useState(1.5);

  // --- ESTADOS DE LAYOUT E ÁUDIO (NOVO) ---
  const [mixerWidth, setMixerWidth] = useState(360);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [isResizingMixer, setIsResizingMixer] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  const [volAmbience, setVolAmbience] = useState(1);
  const [volMusic, setVolMusic] = useState(0.8);
  const [volSfx, setVolSfx] = useState(1);
  
  const [isGlobalPaused, setIsGlobalPaused] = useState(false);

  const mapScene = useMemo(() => (scenes || []).find((s) => s.id === mapSceneId) || null, [scenes, mapSceneId]);

  // Efeitos
  useEffect(() => { fetchScenes(); }, [fetchScenes]);
  useEffect(() => { 
    fetchPresets('mobs'); 
    fetchPresets('players'); 
  }, [fetchPresets]);
  
  useEffect(() => {
    const interval = setInterval(() => syncPlayers(), 2000);
    return () => clearInterval(interval);
  }, [syncPlayers]);

  // Lógica de Redimensionamento Unificada
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Redimensionar Esquerda
      if (isResizingLeft) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 600) {
            setLeftSidebarWidth(newWidth);
        }
      }
      // Redimensionar Direita
      if (isResizingMixer) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 280 && newWidth < 800) {
          setMixerWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
        setIsResizingMixer(false);
        setIsResizingLeft(false);
    };

    if (isResizingMixer || isResizingLeft) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingMixer, isResizingLeft]);

  // --- HELPERS E CÁLCULOS ---
  const players = activeScene?.players || [];
  const totalMaxHp = players.reduce((acc, p) => acc + (p.maxHp || 0), 0);
  const totalCurrentHp = players.reduce((acc, p) => acc + (p.currentHp ?? p.maxHp ?? 0), 0);
  const partyPct = totalMaxHp > 0 ? Math.max(0, totalCurrentHp / totalMaxHp) : 1;
  // const tensionFactor = 1 + (1 - partyPct) * (tensionMaxMultiplier - 1); // Pode ser usado para efeitos visuais globais

  // --- HANDLERS ---
  
  const toggleGlobalPause = () => {
    if (Howler.ctx.state === 'running') {
      Howler.ctx.suspend();
      setIsGlobalPaused(true);
    } else {
      Howler.ctx.resume();
      setIsGlobalPaused(false);
    }
  };

  const stopAllAudio = () => {
    Howler.stop();
    setIsGlobalPaused(false);
  };

  const openGalleryForAudio = (callback) => {
    setGalleryType('audio');
    setGalleryCallback(() => callback);
    setGalleryOpen(true);
  };

  const submitMob = async (e) => {
    e.preventDefault();
    if (!mobForm.name?.trim()) return;
    try {
      setIsCreating(true);
      await createMob(mobForm);
      setMobForm({ name: '', color: 'red', maxHp: 10, damageDice: '1d6', toHit: 0, image: '' });
      setMobModalOpen(false);
      toast.success(`Mob criado!`);
    } catch (err) { toast.error(err?.message || 'Erro'); } 
    finally { setIsCreating(false); }
  };

  const submitEditMob = async (e) => {
    e.preventDefault();
    if (!editingMob?.name?.trim()) return;
    try {
      await updateMob(activeScene.id, editingMob.id, {
        name: editingMob.name, color: editingMob.color, maxHp: Number(editingMob.maxHp),
        damageDice: editingMob.damageDice, toHit: Number(editingMob.toHit), image: editingMob.image || null,
      });
      toast.success('Mob atualizado!');
      setEditMobModalOpen(false); setEditingMob(null);
    } catch (err) { toast.error('Erro ao atualizar mob'); }
  };

  const submitPlayer = async (e) => {
    e.preventDefault();
    if (!playerForm.playerName?.trim()) return;
    try {
      setIsCreatingPlayer(true);
      await createPlayer(playerForm);
      setPlayerForm({ playerName: '', characterName: '', photo: '', maxHp: 20 });
      setPlayerModalOpen(false);
      toast.success(`Jogador adicionado!`);
    } catch (err) { toast.error(err.message); } 
    finally { setIsCreatingPlayer(false); }
  };

  const submitEditPlayer = async (e) => {
    e.preventDefault();
    if (!editingPlayer?.playerName?.trim()) return;
    try {
      await updatePlayer(activeScene.id, editingPlayer.id, {
        playerName: editingPlayer.playerName, characterName: editingPlayer.characterName,
        photo: editingPlayer.photo, maxHp: Number(editingPlayer.maxHp),
      });
      setEditPlayerModalOpen(false); setEditingPlayer(null);
      toast.success('Jogador atualizado!');
    } catch (err) { toast.error('Erro ao atualizar jogador'); }
  };

  const submitScene = async (e) => {
    e.preventDefault();
    if (!sceneName.trim()) return;
    try {
      setBusyScene(true);
      await createScene({ name: sceneName.trim() });
      setSceneName(''); setSceneModalOpen(false);
      toast.success('Cena criada!');
    } catch (err) { toast.error(err?.message); } 
    finally { setBusyScene(false); }
  };
  
  const submitEditScene = async (e) => {
    e.preventDefault();
    if (!editingScene) return;
    try {
        await updateSceneBackground(editingScene.id, editingScene.background);
        toast.success('Cena atualizada!');
        setEditSceneModalOpen(false);
    } catch (err) {
        toast.error('Erro ao salvar cena');
    }
  };

  const handleUploadSceneImage = async (file) => {
    if (!editingScene) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BACKEND_URL}/api/upload/image`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Falha no upload');
      const { url } = await res.json();
      setEditingScene({ ...editingScene, background: url });
      toast.success('Imagem enviada! Clique em Salvar para confirmar.');
    } catch (err) { toast.error('Erro ao fazer upload'); } 
    finally { setUploadingImage(false); }
  };

  const handleToggleCondition = (playerId, conditionId) => {
    togglePlayerCondition(activeScene.id, playerId, conditionId);
    const condition = CONDITIONS.find(c => c.id === conditionId);
    const player = players.find(p => p.id === playerId);
    const isActive = (player?.conditions || []).includes(conditionId);
    toast.info(isActive ? `${player?.characterName}: ${condition?.label} removido` : `${player?.characterName}: ${condition?.label} ativado`, { autoClose: 2000 });
  };

  const handleAddPreset = async (type, preset) => {
    if (!activeScene) return;
    try {
        if (type === 'mobs') {
            await createMob({
                name: preset.name, color: preset.color, maxHp: preset.maxHp,
                damageDice: preset.damageDice, toHit: preset.toHit, image: preset.image
            });
            toast.success(`${preset.name} invocado!`);
        } else if (type === 'players') {
            await createPlayer({
                playerName: preset.playerName, characterName: preset.characterName,
                photo: preset.photo, maxHp: preset.maxHp,
            });
            toast.success(`${preset.characterName} entrou na cena!`);
        }
    } catch (err) { toast.error('Erro ao adicionar preset'); }
  };

  const handleSaveMobPreset = async () => {
    if (!mobForm.name) return toast.error('Nome é obrigatório para salvar preset');
    await createPreset('mobs', mobForm);
    toast.success('Preset de mob salvo!');
  };

  // --- RENDERIZADORES ---

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-zinc-950 text-indigo-500"><Loader2 className="animate-spin w-12 h-12" /></div>;
  if (!activeScene) return <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-500"><h2 className="text-xl">Nenhuma cena encontrada</h2><p className="text-sm mt-2">Verifique se o backend está rodando.</p></div>;

  // Estilos da Scrollbar
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
  `;

  return (
    <div className="h-dvh overflow-hidden bg-[#09090b] text-zinc-100" style={{ backgroundColor: activeScene.background ? 'transparent' : undefined }}>
      <style>{scrollbarStyles}</style>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {activeScene.background && (
        <div className="fixed inset-0 z-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${getImageUrl(activeScene.background)})` }} />
      )}

      <div className="relative z-10 h-full grid grid-rows-[56px_1fr]">
        {/* Topbar Renovada */}
        <header className="flex items-center justify-between px-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
          <div className="flex items-center gap-4 min-w-0">
            {/* Toggle Left Sidebar */}
            <button onClick={() => setShowLeftSidebar(!showLeftSidebar)} className="text-zinc-400 hover:text-white transition-colors">
                {showLeftSidebar ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            
            <div className="hidden md:block text-amber-600 font-semibold tracking-wide">RPG-LAN</div>
            
            <div className="hidden sm:block text-xs text-zinc-500 truncate">
              Cena: <span className="text-zinc-200">{activeScene.name}</span>
            </div>
          </div>
          
          {/* Barra de Tensão (Mantida do original e ajustada) */}
          {players.length > 0 && (
            <div className="hidden xl:flex flex-col w-40 mx-4">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-red-500 mb-1">
                <span>Tensão</span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[9px] text-zinc-600">X:</span>
                  <input type="number" step="0.1" min="1" max="3" value={tensionMaxMultiplier} onChange={(e) => setTensionMaxMultiplier(Number(e.target.value))} className="bg-transparent border-b border-white/10 w-8 text-red-400 text-[10px] outline-none" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_red]" style={{ width: `${(1 - partyPct) * 100}%`, opacity: Math.max(0.3, 1 - partyPct) }} />
              </div>
            </div>
          )}

          {/* Master Volumes & Controles Globais */}
          <div className="hidden lg:flex items-center gap-4 mx-4 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
             {/* Play/Pause & Stop */}
             <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
                <button onClick={toggleGlobalPause} className="text-zinc-400 hover:text-white transition-colors" title={isGlobalPaused ? "Resumir Áudio" : "Pausar Áudio"}>
                   {isGlobalPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                </button>
                <button onClick={stopAllAudio} className="text-red-400 hover:text-red-300 transition-colors" title="Parar Tudo (Forçado)">
                   <Square size={18} fill="currentColor" />
                </button>
             </div>

             <div className="flex items-center gap-2 group" title="Ambiente">
                <Wind size={14} className="text-emerald-500" />
                <input type="range" min="0" max="1" step="0.05" value={volAmbience} onChange={(e) => setVolAmbience(Number(e.target.value))} className="w-20 md:w-32 lg:w-48 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
             </div>
             <div className="flex items-center gap-2 group" title="Música">
                <Music size={14} className="text-indigo-500" />
                <input type="range" min="0" max="1" step="0.05" value={volMusic} onChange={(e) => setVolMusic(Number(e.target.value))} className="w-20 md:w-32 lg:w-48 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
             </div>
             <div className="flex items-center gap-2 group" title="Efeitos">
                <Zap size={14} className="text-amber-500" />
                <input type="range" min="0" max="1" step="0.05" value={volSfx} onChange={(e) => setVolSfx(Number(e.target.value))} className="w-20 md:w-32 lg:w-48 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
             </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-2">
            <PillButton variant="neutral" onClick={() => { setGalleryType('images'); setGalleryCallback(null); setGalleryOpen(true); }} className="px-2 sm:px-3">
              <FolderOpen size={16} /> <span className="hidden sm:inline ml-1">Arquivos</span>
            </PillButton>
            <PillButton variant="neutral" onClick={() => setPlayerModalOpen(true)} className="px-2 sm:px-3">
                <Plus size={16} /> <span className="hidden sm:inline ml-1">Player</span>
            </PillButton>
            <PillButton variant="primary" onClick={() => setMobModalOpen(true)} className="px-2 sm:px-3">
                <Plus size={16} /> <span className="hidden sm:inline ml-1">Mob</span>
            </PillButton>
            
            {/* Toggle Right Sidebar */}
            <button onClick={() => setShowRightSidebar(!showRightSidebar)} className="text-zinc-400 hover:text-white transition-colors ml-2">
                {showRightSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>
          </div>
        </header>

        {/* LAYOUT PRINCIPAL COM GRID DINÂMICO DE 5 COLUNAS */}
        <div 
          className="h-full grid transition-all duration-300 ease-in-out"
          style={{ 
            // 1. Sidebar Esq | 2. Resizer Esq | 3. Arena (Auto) | 4. Resizer Dir | 5. Mixer Dir
            gridTemplateColumns: `${showLeftSidebar ? leftSidebarWidth : 0}px ${showLeftSidebar ? 4 : 0}px minmax(0, 1fr) ${showRightSidebar ? 4 : 0}px ${showRightSidebar ? mixerWidth : 0}px` 
          }}
        >
          {/* 1. Esquerda: Cenas e Presets */}
          <aside className="border-r border-white/5 bg-zinc-900/25 backdrop-blur-md flex flex-col overflow-hidden shrink-0">
             {/* Conteúdo da Sidebar Esquerda */}
            <div className="flex items-center p-2 gap-1 border-b border-white/5 bg-black/20">
               <button onClick={() => setSidebarMode('scenes')} className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${sidebarMode === 'scenes' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`} title="Cenas"><MapIcon size={18} /></button>
               <button onClick={() => setSidebarMode('players')} className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${sidebarMode === 'players' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`} title="Jogadores (Presets)"><Users size={18} /></button>
               <button onClick={() => setSidebarMode('mobs')} className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${sidebarMode === 'mobs' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`} title="Mobs (Presets)"><Skull size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {sidebarMode === 'scenes' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-black tracking-tight text-zinc-100 uppercase">Cenas</div>
                    <button onClick={() => setSceneModalOpen(true)} className="h-8 w-8 rounded-full bg-indigo-500/20 hover:bg-indigo-500/25 border border-indigo-400/20 text-indigo-200 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                  <div className="space-y-3">
                    {(scenes || []).map((scene) => (
                      <SceneCard
                        key={scene.id} scene={scene} isActive={scene.id === activeScene.id}
                        onSelect={() => setActiveScene(scene.id)}
                        onDuplicate={() => { setBusyScene(true); duplicateScene(scene.id).finally(() => setBusyScene(false)); }}
                        onDelete={() => window.confirm('Excluir cena?') && deleteScene(scene.id)}
                        onEdit={() => { setEditingScene(scene); setEditSceneModalOpen(true); }}
                        onOpenMap={() => { setMapSceneId(scene.id); setMapOpen(true); }}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Presets de Player */}
              {sidebarMode === 'players' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-black tracking-tight text-zinc-100 uppercase">Jogadores</div>
                    <div className="text-[10px] text-zinc-500">Clique para adicionar</div>
                  </div>
                  <div className="space-y-2">
                    {(presets.players || []).map((p) => (
                      <div key={p.id} onClick={() => handleAddPreset('players', p)} className="group flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer transition-all">
                          <div className="h-10 w-10 rounded-full bg-black/50 overflow-hidden shrink-0 border border-white/10">
                            {p.photo ? <img src={getImageUrl(p.photo)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">Foto</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-zinc-200 truncate text-sm">{p.characterName}</div>
                            <div className="text-[10px] text-zinc-500 truncate">{p.playerName} • HP {p.maxHp}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Deletar preset?')) deletePreset('players', p.id); }} className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* Presets de Mobs */}
              {sidebarMode === 'mobs' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-black tracking-tight text-zinc-100 uppercase">Bestiário</div>
                    <div className="text-[10px] text-zinc-500">Clique para invocar</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(presets.mobs || []).map((m) => (
                      <div key={m.id} onClick={() => handleAddPreset('mobs', m)} className="group relative p-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 cursor-pointer transition-all flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-lg bg-black/50 overflow-hidden mb-2 border border-white/10">
                            {m.image ? <img src={getImageUrl(m.image)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Skull size={20} /></div>}
                          </div>
                          <div className="font-bold text-zinc-300 text-xs truncate w-full">{m.name}</div>
                          <div className="text-[10px] text-zinc-500">HP {m.maxHp}</div>
                          <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Deletar preset?')) deletePreset('mobs', m.id); }} className="absolute top-1 right-1 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* 2. Resizer Esquerdo */}
          <div 
            className="w-1 bg-white/5 hover:bg-indigo-500 cursor-col-resize z-20 transition-colors h-full"
            onMouseDown={() => setIsResizingLeft(true)}
          />

          {/* 3. Centro: Arena (Conteúdo Principal) */}
          <main className="overflow-y-auto custom-scrollbar min-h-0">
            <div className="p-4">
              {/* Jogadores */}
              <div className="mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center justify-between mb-4"><div className="text-2xl font-black tracking-tight text-zinc-100 uppercase">Jogadores</div></div>
                <div className="flex flex-wrap gap-4">
                  {(activeScene.players || []).map((p) => (
                    <div key={p.id} className="relative w-64 bg-zinc-900/60 border border-white/10 rounded-xl overflow-hidden shadow-lg group transition-all">
                      <div className="flex items-center p-3 gap-3">
                        <div className="h-12 w-12 rounded-full bg-black/50 overflow-hidden border border-white/10 shrink-0">
                          {p.photo ? <img src={getImageUrl(p.photo)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">Foto</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-zinc-200 truncate">{p.characterName}</div>
                          <div className="text-xs text-zinc-500 truncate">{p.playerName}</div>
                          <ConditionsBar conditions={p.conditions || []} onToggle={(cId) => handleToggleCondition(p.id, cId)} />
                        </div>
                      </div>
                      <div className="px-3 pb-3">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1"><span>HP</span><span>{p.currentHp} / {p.maxHp}</span></div>
                        <div className="h-2 w-full bg-black rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }} />
                        </div>
                        <div className="flex gap-1 justify-center mb-3">
                          {[-10, -5, -1].map(v => <button key={v} onClick={() => updatePlayerHp(activeScene.id, p.id, v)} className="px-2 py-1 bg-red-950/50 text-red-400 rounded text-xs hover:bg-red-900">{v}</button>)}
                          <div className="w-px bg-white/10 mx-1"></div>
                          {[1, 5, 10].map(v => <button key={v} onClick={() => updatePlayerHp(activeScene.id, p.id, v)} className="px-2 py-1 bg-emerald-950/50 text-emerald-400 rounded text-xs hover:bg-emerald-900">+{v}</button>)}
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-white/5 text-[10px] text-zinc-500 font-mono truncate select-all cursor-pointer mb-2" 
                             onClick={() => { navigator.clipboard.writeText(`http://${window.location.hostname}:5173${p.accessUrl}`); toast.success('Link copiado!'); }}>
                          http://{window.location.hostname}:5173{p.accessUrl}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingPlayer(p); setEditPlayerModalOpen(true); }} className="p-1.5 text-zinc-600 hover:text-indigo-400 bg-black/50 rounded"><Edit2 size={14} /></button>
                        <button onClick={() => window.confirm('Remover player?') && deletePlayer(activeScene.id, p.id)} className="p-1.5 text-zinc-600 hover:text-red-400 bg-black/50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setPlayerModalOpen(true)} className="w-64 h-40 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors gap-2">
                    <Plus size={24} /><span className="text-xs uppercase font-bold tracking-widest">Novo Jogador</span>
                  </button>
                </div>
              </div>

              {/* Mobs */}
              <div className="flex items-center justify-between mb-4">
                <div><div className="text-2xl font-black tracking-tight text-zinc-100 uppercase">Arena</div><div className="text-sm text-zinc-500 mt-1">Mobs</div></div>
                <button onClick={() => setMobModalOpen(true)} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200"><Plus className="mx-auto" size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-6 justify-center items-start">
                {(activeScene.mobs || []).map((mob) => (
                  <div key={mob.id} className="relative group">
                    <MobCard 
                      mob={mob} 
                      onUpdate={(mobId, delta) => updateMobHp(activeScene.id, mobId, delta)} 
                      onDelete={(mobId) => window.confirm(`Remover ${mob.name}?`) && deleteMob(activeScene.id, mobId)}
                      onEdit={(mob) => { setEditingMob(mob); setEditMobModalOpen(true); }}
                      onToggleCondition={handleToggleCondition} // Usando o handler genérico se aplicável, ou crie um específico para mobs
                    />
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* 4. Resizer Direito */}
          <div 
             className="w-1 bg-white/5 hover:bg-indigo-500 cursor-col-resize z-20 transition-colors h-full"
             onMouseDown={() => setIsResizingMixer(true)}
          />

          {/* 5. Direita: Mixer (Redimensionável) */}
          <aside className="border-l border-white/5 bg-zinc-900/25 backdrop-blur-md overflow-hidden flex flex-col">
             <Mixer 
               playlist={activeScene.playlist} 
               // Passando volumes para o Mixer usar
               volAmbience={volAmbience}
               volMusic={volMusic}
               volSfx={volSfx}
               onOpenGallery={openGalleryForAudio} 
             />
          </aside>
        </div>
      </div>

      {/* Botão Flutuante do Compêndio */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
            onClick={() => setCompendiumOpen(true)} 
            className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-900/50 flex items-center justify-center transition-all hover:scale-110 border-2 border-indigo-400"
            title="Abrir Compêndio (Magias e Ações)"
        >
            <BookOpen size={24} />
        </button>
      </div>

      {/* --- MODAIS (Igual ao original) --- */}
      <Modal open={sceneModalOpen} title="Criar cena" onClose={() => setSceneModalOpen(false)}>
        <form onSubmit={submitScene} className="space-y-4">
          <Field label="Nome da cena"><input value={sceneName} onChange={(e) => setSceneName(e.target.value)} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" autoFocus /></Field>
          <div className="flex justify-end gap-2"><PillButton onClick={() => setSceneModalOpen(false)} variant="neutral">Cancelar</PillButton><PillButton type="submit" disabled={busyScene} variant="success">{busyScene ? '...' : 'Criar'}</PillButton></div>
        </form>
      </Modal>

      <Modal open={editSceneModalOpen} title="Editar cena" onClose={() => { setEditSceneModalOpen(false); setEditingScene(null); }}>
        <form onSubmit={submitEditScene} className="space-y-4">
          <Field label="Nome da cena"><input value={editingScene?.name || ''} onChange={(e) => setEditingScene({ ...editingScene, name: e.target.value })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
          <Field label="Imagem de fundo">
            <div className="space-y-2">
              {editingScene?.background && <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10"><img src={getImageUrl(editingScene.background)} className="w-full h-full object-cover" /></div>}
              <div className="flex gap-2">
                 <input value={editingScene?.background || ''} readOnly className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-500 outline-none" placeholder="Selecione..." />
                 <button type="button" onClick={() => { setGalleryType('images'); setGalleryCallback(() => (url) => setEditingScene({ ...editingScene, background: url })); setGalleryOpen(true); }} className="px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300" title="Abrir Galeria">
                    <ImageIcon size={20} />
                 </button>
                 <label className="px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center justify-center cursor-pointer" title="Upload Rápido">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadSceneImage(e.target.files[0])} />
                    <UploadIcon size={20} />
                 </label>
              </div>
            </div>
          </Field>
          <div className="flex justify-end gap-2"><PillButton type="submit" variant="primary">Salvar</PillButton></div>
        </form>
      </Modal>

      <Modal open={mobModalOpen} title="Novo mob" onClose={() => setMobModalOpen(false)}>
        <form onSubmit={submitMob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome"><input value={mobForm.name} onChange={(e) => setMobForm({ ...mobForm, name: e.target.value })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" autoFocus /></Field>
            <Field label="Cor"><select value={mobForm.color} onChange={(e) => setMobForm({ ...mobForm, color: e.target.value })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none">{['red', 'yellow', 'green', 'blue', 'orange', 'fuchsia', 'black', 'white'].map(c => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="HP"><input type="number" value={mobForm.maxHp} onChange={(e) => setMobForm({ ...mobForm, maxHp: Number(e.target.value) })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
            <Field label="Dano"><input value={mobForm.damageDice} onChange={(e) => setMobForm({ ...mobForm, damageDice: e.target.value })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
            <Field label="Imagem">
              <div className="flex gap-2">
                <input value={mobForm.image} onChange={(e) => setMobForm({ ...mobForm, image: e.target.value })} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" placeholder="URL ou..." />
                <button type="button" onClick={() => { setGalleryType('images'); setGalleryCallback(() => (url) => setMobForm({ ...mobForm, image: url })); setGalleryOpen(true); }} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button>
              </div>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleSaveMobPreset} className="px-3 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-sm transition-colors">Salvar Preset</button>
            <button type="button" onClick={() => { setPresetsType('mobs'); setPresetsCallback(() => (p) => setMobForm({ name: p.name, color: p.color, maxHp: p.maxHp, damageDice: p.damageDice, toHit: p.toHit, image: p.image || '' })); setPresetsOpen(true); }} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm hover:bg-white/10">📋 Carregar</button>
            <PillButton type="submit" disabled={isCreating} variant="primary">Criar</PillButton>
          </div>
        </form>
      </Modal>

      <Modal open={editMobModalOpen} title="Editar mob" onClose={() => { setEditMobModalOpen(false); setEditingMob(null); }}>
        <form onSubmit={submitEditMob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome"><input value={editingMob?.name || ''} onChange={(e) => setEditingMob({ ...editingMob, name: e.target.value })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
            <Field label="HP"><input type="number" value={editingMob?.maxHp || 10} onChange={(e) => setEditingMob({ ...editingMob, maxHp: Number(e.target.value) })} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
            <Field label="Imagem">
              <div className="flex gap-2">
                <input value={editingMob?.image || ''} onChange={(e) => setEditingMob({ ...editingMob, image: e.target.value })} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" />
                <button type="button" onClick={() => { setGalleryType('images'); setGalleryCallback(() => (url) => setEditingMob({ ...editingMob, image: url })); setGalleryOpen(true); }} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button>
              </div>
            </Field>
          </div>
          <div className="flex justify-end gap-2"><PillButton type="submit" variant="primary">Salvar</PillButton></div>
        </form>
      </Modal>

      <Modal open={playerModalOpen} title="Novo Jogador" onClose={() => setPlayerModalOpen(false)}>
        <form onSubmit={submitPlayer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <Field label="Nome"><input value={playerForm.playerName} onChange={e => setPlayerForm({...playerForm, playerName: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
             <Field label="Personagem"><input value={playerForm.characterName} onChange={e => setPlayerForm({...playerForm, characterName: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
             <Field label="Foto"><div className="flex gap-2"><input value={playerForm.photo} onChange={e => setPlayerForm({...playerForm, photo: e.target.value})} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /><button type="button" onClick={() => { setGalleryType('images'); setGalleryCallback(() => (url) => setPlayerForm({ ...playerForm, photo: url })); setGalleryOpen(true); }} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button></div></Field>
             <Field label="HP"><input type="number" value={playerForm.maxHp} onChange={e => setPlayerForm({...playerForm, maxHp: Number(e.target.value)})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
          </div>
          <div className="flex justify-end gap-2"><PillButton type="submit" disabled={isCreatingPlayer} variant="primary">Criar</PillButton></div>
        </form>
      </Modal>
      
      <Modal open={editPlayerModalOpen} title="Editar Jogador" onClose={() => { setEditPlayerModalOpen(false); setEditingPlayer(null); }}>
        <form onSubmit={submitEditPlayer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome"><input value={editingPlayer?.playerName || ''} onChange={e => setEditingPlayer({...editingPlayer, playerName: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
            <Field label="Personagem"><input value={editingPlayer?.characterName || ''} onChange={e => setEditingPlayer({...editingPlayer, characterName: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
            <Field label="Foto"><div className="flex gap-2"><input value={editingPlayer?.photo || ''} onChange={e => setEditingPlayer({...editingPlayer, photo: e.target.value})} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /><button type="button" onClick={() => { setGalleryType('images'); setGalleryCallback(() => (url) => setEditingPlayer({ ...editingPlayer, photo: url })); setGalleryOpen(true); }} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button></div></Field>
            <Field label="HP"><input type="number" value={editingPlayer?.maxHp || 20} onChange={e => setEditingPlayer({...editingPlayer, maxHp: Number(e.target.value)})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
          </div>
          <div className="flex justify-end gap-2"><PillButton type="submit" variant="primary">Salvar</PillButton></div>
        </form>
      </Modal>

      <Modal open={mapOpen} title="Mapa da cena" onClose={() => setMapOpen(false)} widthClass="max-w-5xl">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
          <div className="aspect-[16/9] relative">
            {mapScene?.background ? <img src={getImageUrl(mapScene.background)} className="absolute inset-0 w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Sem mapa.</div>}
          </div>
        </div>
      </Modal>

      <MediaGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} type={galleryType} onSelect={(url, name) => { galleryCallback?.(url, name); setGalleryOpen(false); }} />
      <PresetsManager open={presetsOpen} onClose={() => setPresetsOpen(false)} type={presetsType} onUse={(p) => { presetsCallback?.(p); setPresetsOpen(false); }} />
      <Compendium open={compendiumOpen} onClose={() => setCompendiumOpen(false)} />
    </div>
  );
}