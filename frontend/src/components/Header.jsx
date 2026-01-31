import React from 'react';
import { 
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Square, Play, Pause,
  Wind, Music, Zap, FolderOpen, Plus
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
}) {
  return (
    <header className="flex items-center justify-between px-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md h-[56px]">
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

      <div className="flex items-center gap-2">
        <PillButton variant="neutral" onClick={onOpenGallery} className="px-2 sm:px-3">
          <FolderOpen size={16} /> <span className="hidden sm:inline ml-1">Arquivos</span>
        </PillButton>
        <PillButton variant="neutral" onClick={onAddPlayer} className="px-2 sm:px-3">
            <Plus size={16} /> <span className="hidden sm:inline ml-1">Player</span>
        </PillButton>
        <PillButton variant="primary" onClick={onAddMob} className="px-2 sm:px-3">
            <Plus size={16} /> <span className="hidden sm:inline ml-1">Mob</span>
        </PillButton>
        
        <button onClick={() => setShowRightSidebar(!showRightSidebar)} className="text-zinc-400 hover:text-white transition-colors ml-2">
            {showRightSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
      </div>
    </header>
  );
}