import React, { useMemo } from 'react';
import { X, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../store';

const COLORS = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  fuchsia: 'bg-fuchsia-500',
  black: 'bg-zinc-500',
  white: 'bg-white text-black',
};

export default function InitiativeTracker({ isGM = false }) {
  const { activeScene, initiativeTrackerOpen, toggleInitiativeTracker, rollInitiativeForAll, updateMob, updatePlayer } = useGameStore();

  const sortedList = useMemo(() => {
    if (!activeScene) return [];
    const mobs = (activeScene.mobs || []).map(m => ({ ...m, type: 'mob' }));
    const players = (activeScene.players || []).map(p => ({ ...p, type: 'player', name: p.characterName, color: 'blue' })); // Players default blue
    
    return [...mobs, ...players]
      .filter(i => {
          if (!isGM && i.hiddenInInitiative) return false; // Esconde do player se estiver oculto
          return (i.currentHp > 0 || i.type === 'player');
      })
      .sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
  }, [activeScene, isGM]);

  if (!initiativeTrackerOpen) return null;

  const toggleVisibility = (e, item) => {
      e.stopPropagation();
      const newVal = !item.hiddenInInitiative;
      if (item.type === 'mob') {
          updateMob(activeScene.id, item.id, { hiddenInInitiative: newVal });
      } else {
          updatePlayer(activeScene.id, item.id, { hiddenInInitiative: newVal });
      }
  };

  // Posição: Esquerda para GM, Direita para Player
  const positionClasses = isGM ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <div className={`fixed top-14 bottom-0 w-64 bg-zinc-900/95 backdrop-blur-md border-white/10 z-40 flex flex-col shadow-2xl transition-transform duration-300 ${positionClasses}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <h3 className="font-bold text-zinc-100 flex items-center gap-2">
          🎲 Iniciativa
        </h3>
        <button onClick={toggleInitiativeTracker} className="text-zinc-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {sortedList.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-2 rounded border ${item.hiddenInInitiative ? 'bg-zinc-800/50 border-zinc-700 opacity-60' : 'bg-white/5 border-white/5'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${COLORS[item.color] || 'bg-zinc-600'}`}>
              {item.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-200 truncate">{item.name}</div>
              <div className="text-xs text-zinc-500">{item.type === 'player' ? 'Jogador' : 'Mob'}</div>
            </div>
            <div className="text-xl font-bold text-indigo-400 tabular-nums">
              {item.initiative || 0}
            </div>

            {/* Botão de Visibilidade (Apenas GM) */}
            {isGM && (
                <button 
                    onClick={(e) => toggleVisibility(e, item)}
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                    title={item.hiddenInInitiative ? "Mostrar para jogadores" : "Esconder de jogadores"}
                >
                    {item.hiddenInInitiative ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            )}
          </div>
        ))}
        
        {sortedList.length === 0 && (
            <div className="text-center text-zinc-500 text-sm py-4">Nenhum combatente</div>
        )}
      </div>

      {/* Footer Actions (Apenas GM) */}
      {isGM && (
      <div className="p-4 border-t border-white/10 bg-black/20">
        <button 
            onClick={() => {
                if(window.confirm("Isso resetará todas as iniciativas para 0 e pedirá rolagem aos jogadores. Continuar?")) {
                    rollInitiativeForAll();
                }
            }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors"
        >
            <RefreshCw size={16} /> Rolar Iniciativa
        </button>
      </div>
      )}
    </div>
  );
}
