import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Loader2, BookOpen, Plus, WifiOff, RefreshCw
} from 'lucide-react';
import { Howler } from 'howler';

// Hooks e Stores
import { useGameStore } from './store';

// Componentes Extraídos
import Mixer from './Mixer';
import MediaGallery from './MediaGallery';
import PresetsManager from './PresetsManager';
import InventoryModal from './components/modals/InventoryModal';
import QRCodeModal from './components/modals/QRCodeModal';
import Compendium from './components/Compendium';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Arena from './components/Arena';
// Novos Modais Componentizados
import SceneModals from './components/modals/SceneModals';
import MobModals from './components/modals/MobModals';
import PlayerModals from './components/modals/PlayerModals';
import Modal from './components/ui/Modal'; // Ainda usado para o Mapa
import { CONDITIONS, getImageUrl } from './constants';
import { API_URL } from './api';
import PillButton from './components/ui/PillButton';

export default function App() {
  const {
    scenes, activeScene, fetchScenes, isLoading, error,
    updateMobHp, deleteMob, createMob, setActiveScene, createScene, duplicateScene, deleteScene,
    createPlayer, updatePlayerHp, deletePlayer, updatePlayer, togglePlayerCondition, toggleMobCondition, syncPlayers,
    updateSceneBackground, updateScene, updateMob, presets, fetchPresets, deletePreset, createPreset, addTrackFromUrl, updatePlayer: updatePlayerStore
  } = useGameStore();

  // --- ESTADOS DE UI E FORMULÁRIOS ---
  const [mobModalOpen, setMobModalOpen] = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [editSceneModalOpen, setEditSceneModalOpen] = useState(false);
  const [editMobModalOpen, setEditMobModalOpen] = useState(false);
  const [editPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  
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
  const [inventoryMobId, setInventoryMobId] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null); // { url, title }

  const [busyScene, setBusyScene] = useState(false);

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

  // --- HANDLERS DE MODAIS (Simplificados) ---

  const handleCreateMob = async (data) => {
    if (!data.name?.trim()) return;
    try {
      await createMob(data);
      setMobModalOpen(false);
      toast.success(`Mob criado!`);
    } catch (err) { toast.error(err?.message || 'Erro'); }
  };

  const handleEditMob = async (id, data) => {
    try {
      await updateMob(activeScene.id, id, data);
      toast.success('Mob atualizado!');
      setEditMobModalOpen(false); setEditingMob(null);
    } catch (err) { toast.error('Erro ao atualizar mob'); }
  };

  const handleCreatePlayer = async (data) => {
    if (!data.playerName?.trim()) return;
    try {
      await createPlayer(data);
      setPlayerModalOpen(false);
      toast.success(`Jogador adicionado!`);
    } catch (err) { toast.error(err.message); }
  };

  const handleEditPlayer = async (id, data) => {
    try {
      await updatePlayer(activeScene.id, id, data);
      setEditPlayerModalOpen(false); setEditingPlayer(null);
      toast.success('Jogador atualizado!');
    } catch (err) { toast.error('Erro ao atualizar jogador'); }
  };

  const handleCreateScene = async (name) => {
    if (!name.trim()) return;
    try {
      await createScene({ name: name.trim() });
      setSceneModalOpen(false);
      toast.success('Cena criada!');
    } catch (err) { toast.error(err?.message); }
  };
  
  const handleEditScene = async (id, updates) => {
    try {
        await updateScene(id, updates);
        toast.success('Cena atualizada!');
        setEditSceneModalOpen(false); setEditingScene(null);
    } catch (err) { toast.error('Erro ao salvar cena'); }
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

  const handleSaveMobPreset = async (data) => {
    if (!data.name) return toast.error('Nome é obrigatório para salvar preset');
    await createPreset('mobs', data);
    toast.success('Preset de mob salvo!');
  };

  const handleUploadBg = async (file, onSuccess) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/upload/image`, { method: 'POST', body: formData });
      if (res.ok) {
          const { url } = await res.json();
          onSuccess(url);
          toast.success('Imagem enviada!');
      } else {
          toast.error('Erro no upload');
      }
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

  const handleAddItemToMob = async (item) => {
    if (!inventoryMobId || !activeScene) return;
    const mob = activeScene.mobs.find(m => m.id === inventoryMobId);
    if (!mob) return;

    const currentInventory = mob.inventory || [];
    const newInventory = [...currentInventory, item];
    await updateMob(activeScene.id, mob.id, { inventory: newInventory });
    toast.success(`Item adicionado para ${mob.name}`);
  };

  const handleRemoveItemFromMob = async (index) => {
    if (!inventoryMobId || !activeScene) return;
    const mob = activeScene.mobs.find(m => m.id === inventoryMobId);
    if (!mob) return;

    const newInventory = [...(mob.inventory || [])];
    newInventory.splice(index, 1);

    await updateMob(activeScene.id, mob.id, { inventory: newInventory });
  };

  // --- RENDERIZADORES ---

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-zinc-950 text-indigo-500"><Loader2 className="animate-spin w-12 h-12" /></div>;
  
  // Tela de Erro de Conexão
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 p-4">
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-red-500/20 flex flex-col items-center text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-200 mb-2">Erro de Conexão</h2>
            <p className="text-sm mb-6">
                Não foi possível conectar ao servidor. Verifique se o backend está rodando.
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-white/5 w-full mb-6">
                <code className="text-xs text-red-400 font-mono break-all">{error}</code>
            </div>
            <PillButton variant="neutral" onClick={() => window.location.reload()}>
                <RefreshCw size={16} className="mr-2" /> Tentar Novamente
            </PillButton>
        </div>
    </div>
  );

  // Tela de "Nenhuma Cena" (com botão de criar)
  if (!activeScene) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-zinc-200">Nenhuma cena encontrada</h2>
            <p className="text-zinc-400">Crie sua primeira cena para começar a aventura.</p>
            <div className="flex justify-center">
                <PillButton variant="primary" onClick={() => setSceneModalOpen(true)} className="px-6 py-3">
                    <Plus size={20} />
                    <span className="ml-2 text-base">Criar Nova Cena</span>
                </PillButton>
            </div>
        </div>

        {/* Modais necessários para criar a cena */}
        <SceneModals 
            createOpen={sceneModalOpen} onCloseCreate={() => setSceneModalOpen(false)}
            editOpen={editSceneModalOpen} onCloseEdit={() => { setEditSceneModalOpen(false); setEditingScene(null); }}
            editingScene={editingScene}
            onCreate={handleCreateScene}
            onEdit={handleEditScene}
            onDuplicate={async (id) => {
              if (!id) return;
              try {
                await duplicateScene(id);
                toast.success("Cena duplicada!");
              } catch (err) {
                toast.error("Erro ao duplicar cena.");
                throw err; // Repassa o erro para o modal não fechar
              }
            }}
            onDelete={async (id) => {
              if (!id) return;
              try {
                await deleteScene(id);
                setEditingScene(null);
                toast.success("Cena excluída.");
              } catch (err) {
                toast.error("Erro ao excluir cena.");
                throw err;
              }
            }}
            onUploadBg={handleUploadBg}
            onOpenGallery={(type, cb) => { setGalleryType(type); setGalleryCallback(() => cb); setGalleryOpen(true); }}
        />
        
        <MediaGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} type={galleryType} onSelect={(url, name) => { galleryCallback?.(url, name); setGalleryOpen(false); }} />
    </div>
  );

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
          className="h-full grid overflow-hidden transition-all duration-300 ease-in-out"
          style={{ 
            gridTemplateColumns: `${showLeftSidebar ? leftSidebarWidth : 0}px ${showLeftSidebar ? 4 : 0}px minmax(0, 1fr) ${showRightSidebar ? 4 : 0}px ${showRightSidebar ? mixerWidth : 0}px` 
          }}
        >
          {/* 1. Esquerda: Cenas e Presets */}
          <Sidebar 
            scenes={scenes} activeScene={activeScene}
            onSelectScene={setActiveScene}
            onDuplicateScene={async (id) => { 
              if (!id) return;
              await duplicateScene(id);
              toast.success("Cena duplicada!");
            }}
            onDeleteScene={async (id) => { 
              if (window.confirm('Tem certeza que deseja excluir esta cena?')) {
                await deleteScene(id);
                toast.success("Cena excluída.");
              }
            }}
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
          <main className="overflow-y-auto custom-scrollbar min-h-0 h-full">
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
              onOpenMobInventory={(m) => setInventoryMobId(m.id)}
              onOpenQRCode={(url, title) => setQrCodeData({ url, title })}
            />
          </main>

          {/* 4. Resizer Direito */}
          <div 
             className="w-1 bg-white/5 hover:bg-indigo-500 cursor-col-resize z-20 transition-colors h-full"
             onMouseDown={() => setIsResizingMixer(true)}
          />

          {/* 5. Direita: Mixer (Redimensionável) */}
          <aside className="border-l border-white/5 bg-zinc-900/25 backdrop-blur-md overflow-hidden flex flex-col min-h-0 h-full">
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

      {/* --- MODAIS COMPONENTIZADOS --- */}
      
      <SceneModals 
        createOpen={sceneModalOpen} onCloseCreate={() => setSceneModalOpen(false)}
        editOpen={editSceneModalOpen} onCloseEdit={() => { setEditSceneModalOpen(false); setEditingScene(null); }}
        editingScene={editingScene}
        onCreate={handleCreateScene}
        onEdit={handleEditScene}
        onUploadBg={handleUploadBg}
        onOpenGallery={(type, cb) => { setGalleryType(type); setGalleryCallback(() => cb); setGalleryOpen(true); }}
      />

      <MobModals 
        createOpen={mobModalOpen} onCloseCreate={() => setMobModalOpen(false)}
        editOpen={editMobModalOpen} onCloseEdit={() => { setEditMobModalOpen(false); setEditingMob(null); }}
        editingMob={editingMob}
        onCreate={handleCreateMob}
        onEdit={handleEditMob}
        onOpenGallery={(type, cb) => { setGalleryType(type); setGalleryCallback(() => cb); setGalleryOpen(true); }}
        onOpenPresets={(cb) => { setPresetsType('mobs'); setPresetsCallback(() => cb); setPresetsOpen(true); }}
        onSavePreset={handleSaveMobPreset}
      />

      <PlayerModals 
        createOpen={playerModalOpen} onCloseCreate={() => setPlayerModalOpen(false)}
        editOpen={editPlayerModalOpen} onCloseEdit={() => { setEditPlayerModalOpen(false); setEditingPlayer(null); }}
        editingPlayer={editingPlayer}
        onCreate={handleCreatePlayer}
        onEdit={handleEditPlayer}
        onOpenGallery={(type, cb) => { setGalleryType(type); setGalleryCallback(() => cb); setGalleryOpen(true); }}
      />

      <Modal open={mapOpen} title="Mapa da cena" onClose={() => setMapOpen(false)} widthClass="max-w-5xl">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
          <div className="aspect-[16/9] relative">
            {mapScene?.background ? <img src={getImageUrl(mapScene.background)} className="absolute inset-0 w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Sem mapa.</div>}
          </div>
        </div>
      </Modal>

      <MediaGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} type={galleryType} onSelect={(url, name) => { galleryCallback?.(url, name); setGalleryOpen(false); }} />
      <PresetsManager open={presetsOpen} onClose={() => setPresetsOpen(false)} type={presetsType} onUse={(p) => { presetsCallback?.(p); setPresetsOpen(false); }} />
      
      <InventoryModal 
        open={!!inventoryPlayerId} 
        onClose={() => setInventoryPlayerId(null)}
        player={activeScene?.players?.find(p => p.id === inventoryPlayerId)}
        onRemoveItem={handleRemoveItemFromPlayer}
        onOpenCompendium={() => setCompendiumOpen(true)}
      />

      <InventoryModal 
        open={!!inventoryMobId} 
        onClose={() => setInventoryMobId(null)}
        player={(() => {
           const m = activeScene?.mobs?.find(m => m.id === inventoryMobId);
           return m ? { ...m, characterName: m.name, playerName: 'Mob' } : null;
        })()}
        onRemoveItem={handleRemoveItemFromMob}
        onOpenCompendium={() => setCompendiumOpen(true)}
      />

      <Compendium 
        open={compendiumOpen} 
        onClose={() => setCompendiumOpen(false)} 
        onAddItem={inventoryPlayerId ? handleAddItemToPlayer : (inventoryMobId ? handleAddItemToMob : null)}
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