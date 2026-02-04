import React from 'react';
import { Swords } from 'lucide-react';
import { useGameStore } from '../store';

export default function InitiativeButton({ side = 'right' }) {
  const { toggleInitiativeTracker, initiativeTrackerOpen } = useGameStore();

  // Configuração de posição baseada no lado
  const positionClass = side === 'left' 
    ? 'bottom-6 left-6' 
    : 'top-20 right-4';

  // Configuração de translação quando aberto (empurra o botão)
  const translateClass = initiativeTrackerOpen
    ? (side === 'left' ? 'translate-x-[16rem]' : 'translate-x-[-15rem]')
    : '';

  return (
    <button
      onClick={toggleInitiativeTracker}
      className={`fixed z-30 p-3 rounded-full shadow-lg transition-all duration-300 border-2 ${positionClass} ${translateClass} ${
        initiativeTrackerOpen 
          ? 'bg-indigo-600 border-indigo-400 text-white' 
          : 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:text-white hover:border-white'
      }`}
      title="Rastreador de Iniciativa"
    >
      <Swords size={20} />
    </button>
  );
}
