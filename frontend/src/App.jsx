import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Loader2, BookOpen, Image as ImageIcon, Upload as UploadIcon
} from 'lucide-react';
import { Howler } from 'howler';

// Hooks e Stores
import { useGameStore } from './store';

// Componentes Extraídos
import Modal from './components/ui/Modal';
import Field from './components/ui/Field';
import PillButton from './components/ui/PillButton';
import Mixer from './Mixer';
import MediaGallery from './MediaGallery';
import PresetsManager from './PresetsManager';
import InventoryModal from './components/modals/InventoryModal';
import QRCodeModal from './components/modals/QRCodeModal';
import Compendium from './components/Compendium';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Arena from './components/Arena';
import { CONDITIONS, getImageUrl, BACKEND_URL } from './constants';

export default function App() {
  const {
    scenes, activeScene, fetchScenes, isLoading,
    updateMobHp, deleteMob, createMob, setActiveScene, createScene, duplicateScene, deleteScene,
    createPlayer, updatePlayerHp, deletePlayer, updatePlayer, togglePlayerCondition, toggleMobCondition, syncPlayers,
    updateSceneBackground, updateMob, presets, fetchPresets, deletePreset, createPreset, addTrackFromUrl, updatePlayer: updatePlayerStore
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
  
  // Estados para Inventário e QR Code
  const [inventoryPlayerId, setInventoryPlayerId] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null); // { url, title }

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

  const openGalleryForAudio = (type, mode) => {
    setGalleryType('audio');
    setGalleryCallback(() => (url, name) => {
      addTrackFromUrl({ 
        name, url, type, 
        extraData: type === 'ambiente' ? { ambienceMode: mode } : {} 
      });
    });
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

  const handleToggleMobCondition = (mobId, conditionId) => {
    toggleMobCondition(activeScene.id, mobId, conditionId);
    // Opcional: Adicionar toast para mobs se desejar
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

  // Handlers de Inventário
  const handleAddItemToPlayer = async (item) => {
    if (!inventoryPlayerId || !activeScene) return;
    const player = activeScene.players.find(p => p.id === inventoryPlayerId);
    if (!player) return;

    const currentInventory = player.inventory || [];
    // Evita duplicatas exatas se desejar
    // if (currentInventory.some(i => i.nome === item.nome)) return toast.warning('Item já existe');

    const newInventory = [...currentInventory, item];
    await updatePlayerStore(activeScene.id, player.id, { inventory: newInventory });
    toast.success(`Item adicionado para ${player.characterName}`);
  };

  const handleRemoveItemFromPlayer = async (index) => {
    if (!inventoryPlayerId || !activeScene) return;
    const player = activeScene.players.find(p => p.id === inventoryPlayerId);
    if (!player) return;

    const newInventory = [...(player.inventory || [])];
    newInventory.splice(index, 1);

    await updatePlayerStore(activeScene.id, player.id, { inventory: newInventory });
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
        <Header 
          showLeftSidebar={showLeftSidebar} setShowLeftSidebar={setShowLeftSidebar}
          showRightSidebar={showRightSidebar} setShowRightSidebar={setShowRightSidebar}
          activeSceneName={activeScene.name}
          players={players} tensionMaxMultiplier={tensionMaxMultiplier} setTensionMaxMultiplier={setTensionMaxMultiplier} partyPct={partyPct}
          volAmbience={volAmbience} setVolAmbience={setVolAmbience}
          volMusic={volMusic} setVolMusic={setVolMusic}
          volSfx={volSfx} setVolSfx={setVolSfx}
          isGlobalPaused={isGlobalPaused} toggleGlobalPause={toggleGlobalPause} stopAllAudio={stopAllAudio}
          onOpenGallery={() => { setGalleryType('images'); setGalleryCallback(null); setGalleryOpen(true); }}
          onAddPlayer={() => setPlayerModalOpen(true)}
          onAddMob={() => setMobModalOpen(true)}
        />

        {/* LAYOUT PRINCIPAL COM GRID DINÂMICO DE 5 COLUNAS */}
        <div 
          className="h-full grid transition-all duration-300 ease-in-out"
          style={{ 
            gridTemplateColumns: `${showLeftSidebar ? leftSidebarWidth : 0}px ${showLeftSidebar ? 4 : 0}px minmax(0, 1fr) ${showRightSidebar ? 4 : 0}px ${showRightSidebar ? mixerWidth : 0}px` 
          }}
        >
          {/* 1. Esquerda: Cenas e Presets */}
          <Sidebar 
            mode={sidebarMode} setMode={setSidebarMode}
            scenes={scenes} activeScene={activeScene}
            onSelectScene={setActiveScene}
            onDuplicateScene={(id) => { setBusyScene(true); duplicateScene(id).finally(() => setBusyScene(false)); }}
            onDeleteScene={(id) => window.confirm('Excluir cena?') && deleteScene(id)}
            onEditScene={(scene) => { setEditingScene(scene); setEditSceneModalOpen(true); }}
            onOpenMap={(id) => { setMapSceneId(id); setMapOpen(true); }}
            onAddScene={() => setSceneModalOpen(true)}
            presets={presets}
            onAddPreset={handleAddPreset}
            onDeletePreset={(type, id) => window.confirm('Deletar preset?') && deletePreset(type, id)}
          />

          {/* 2. Resizer Esquerdo */}
          <div 
            className="w-1 bg-white/5 hover:bg-indigo-500 cursor-col-resize z-20 transition-colors h-full"
            onMouseDown={() => setIsResizingLeft(true)}
          />

          {/* 3. Centro: Arena (Conteúdo Principal) */}
          <main className="overflow-y-auto custom-scrollbar min-h-0">
            <Arena 
              activeScene={activeScene}
              updatePlayerHp={updatePlayerHp}
              deletePlayer={deletePlayer}
              onEditPlayer={(p) => { setEditingPlayer(p); setEditPlayerModalOpen(true); }}
              onTogglePlayerCondition={handleToggleCondition}
              updateMobHp={updateMobHp}
              deleteMob={deleteMob}
              onEditMob={(m) => { setEditingMob(m); setEditMobModalOpen(true); }}
              onToggleMobCondition={handleToggleMobCondition}
              onAddPlayer={() => setPlayerModalOpen(true)}
              onAddMob={() => setMobModalOpen(true)}
              onOpenInventory={(p) => setInventoryPlayerId(p.id)}
              onOpenQRCode={(url, title) => setQrCodeData({ url, title })}
            />
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
      
      <Compendium 
        open={compendiumOpen} 
        onClose={() => setCompendiumOpen(false)} 
        onAddItem={inventoryPlayerId ? handleAddItemToPlayer : null}
      />

      <InventoryModal 
        open={!!inventoryPlayerId} 
        onClose={() => setInventoryPlayerId(null)}
        player={activeScene?.players?.find(p => p.id === inventoryPlayerId)}
        onRemoveItem={handleRemoveItemFromPlayer}
        onOpenCompendium={() => setCompendiumOpen(true)}
      />

      <QRCodeModal 
        open={!!qrCodeData} 
        onClose={() => setQrCodeData(null)} 
        url={qrCodeData?.url} 
        title={qrCodeData?.title} 
      />
    </div>
  );
}