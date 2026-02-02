import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Square, Play, Pause,
  Wind, Music, Zap, FolderOpen, Plus, Volume2, BookOpen, FileJson
} from 'lucide-react';
import PillButton from './ui/PillButton';

export default function Header({
  showLeftSidebar, setShowLeftSidebar,
  showRightSidebar, setShowRightSidebar,
  activeSceneName,
  players, tensionMaxMultiplier, setTensionMaxMultiplier, partyPct,
  volAmbience, setVolAmbience, volMusic, setVolMusic, volSfx, setVolSfx,
  isGlobalPaused, toggleGlobalPause, stopAllAudio,
  onOpenGallery, onAddPlayer, onAddMob
  , onAddItem
}) {
  const navigate = useNavigate();
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [volumeMenuOpen, setVolumeMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const volumeMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAddMenuOpen(false);
      }
      if (volumeMenuRef.current && !volumeMenuRef.current.contains(event.target)) {
        setVolumeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, volumeMenuRef]);

  return (
    <header className="relative z-50 flex items-center justify-between px-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md h-[56px]">
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={() => setShowLeftSidebar(!showLeftSidebar)} className="text-zinc-400 hover:text-white transition-colors">
            {showLeftSidebar ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        
        <div className="hidden md:block text-amber-600 font-semibold tracking-wide">RPG-LAN</div>
        
        <div className="hidden sm:block text-xs text-zinc-500 truncate">
          Cena: <span className="text-zinc-200">{activeSceneName}</span>
        </div>
      </div>
      
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

      {/* CONTROLES DE ÁUDIO - VERSÃO DESKTOP (lg+) */}
      <div className="hidden lg:flex items-center gap-4 mx-4 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
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

      {/* CONTROLES DE ÁUDIO - VERSÃO COMPACTA (< lg) */}
      <div className="flex lg:hidden items-center gap-2 mx-2">
        <button onClick={toggleGlobalPause} className="p-2 text-zinc-400 hover:text-white transition-colors bg-black/20 rounded-lg border border-white/5" title={isGlobalPaused ? "Resumir Áudio" : "Pausar Áudio"}>
          {isGlobalPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
        </button>
        
        <button onClick={stopAllAudio} className="p-2 text-red-400 hover:text-red-300 transition-colors bg-black/20 rounded-lg border border-white/5" title="Parar Tudo">
          <Square size={16} fill="currentColor" />
        </button>

        {/* Botão de Volume com Dropdown */}
        <div className="relative" ref={volumeMenuRef}>
          <button 
            onClick={() => setVolumeMenuOpen(prev => !prev)} 
            className="p-2 text-zinc-400 hover:text-white transition-colors bg-black/20 rounded-lg border border-white/5"
            title="Controles de Volume"
          >
            <Volume2 size={16} />
          </button>

          {volumeMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-[100] p-4 space-y-4">
              {/* Ambiente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-emerald-500" />
                    <span className="text-xs text-zinc-400">Ambiente</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{(volAmbience * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volAmbience} 
                  onChange={(e) => setVolAmbience(Number(e.target.value))} 
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Música */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Music size={14} className="text-indigo-500" />
                    <span className="text-xs text-zinc-400">Música</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{(volMusic * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volMusic} 
                  onChange={(e) => setVolMusic(Number(e.target.value))} 
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Efeitos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-xs text-zinc-400">Efeitos</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{(volSfx * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volSfx} 
                  onChange={(e) => setVolSfx(Number(e.target.value))} 
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      
      

      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/editor')}
          className="p-2 text-zinc-400 hover:text-white transition-colors bg-black/20 rounded-lg border border-white/5"
          title="Editor de JSON"
        >
          <FileJson size={16} />
        </button>

        <div className="relative" ref={menuRef}>
          <PillButton variant="primary" onClick={() => setAddMenuOpen(prev => !prev)} className="px-2 sm:px-3">
            <Plus size={16} />
            <span className="hidden sm:inline ml-1">Adicionar</span>
          </PillButton>

          {addMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg z-50 py-1">
              <button onClick={() => { onAddMob(); setAddMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3 transition-colors">
                <Plus size={16} className="text-zinc-400" />
                <span>Novo Mob</span>
              </button>
              <button onClick={() => { onAddPlayer(); setAddMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3 transition-colors">
                <Plus size={16} className="text-zinc-400" />
                <span>Novo Player</span>
              </button>
              <button onClick={() => { if(onAddItem) onAddItem(); setAddMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3 transition-colors">
                <BookOpen size={16} className="text-zinc-400" />
                <span>Novo Item</span>
              </button>
              <button onClick={() => { onOpenGallery(); setAddMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3 transition-colors">
                <FolderOpen size={16} className="text-zinc-400" />
                <span>Galeria de Arquivos</span>
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setShowRightSidebar(!showRightSidebar)} className="text-zinc-400 hover:text-white transition-colors ml-2">
            {showRightSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
      </div>
    </header>
  );
}
