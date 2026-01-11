import React from 'react';
import { 
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull,
  FlaskConical, Ghost, Heart as HeartIcon, EyeOff, Cloud, Moon, Timer
} from 'lucide-react';

// Replicando a configuração exata da Visão do Jogador para consistência total
const CONDITIONS_CONFIG = [
    { id: 'prone', icon: ArrowDownCircle, color: '#f59e0b', label: 'Caído' }, // amber-500
    { id: 'restrained', icon: LinkIcon, color: '#71717a', label: 'Impedido' }, // zinc-500
    { id: 'paralyzed', icon: ZapOff, color: '#3b82f6', label: 'Paralisado' }, // blue-500
    { id: 'incapacitated', icon: Skull, color: '#ef4444', label: 'Incapacitado' }, // red-500
    { id: 'poisoned', icon: FlaskConical, color: '#22c55e', label: 'Envenenado' }, // green-500
    { id: 'frightened', icon: Ghost, color: '#a855f7', label: 'Amedrontado' }, // purple-500
    { id: 'charmed', icon: HeartIcon, color: '#ec4899', label: 'Enfeitiçado' }, // pink-500
    { id: 'blinded', icon: EyeOff, color: '#4b5563', label: 'Cego' }, // gray-600
    { id: 'invisible', icon: Cloud, color: '#22d3ee', label: 'Invisível' }, // cyan-400
    { id: 'unconscious', icon: Moon, color: '#6366f1', label: 'Inconsciente' }, // indigo-500
    { id: 'exhausted', icon: Timer, color: '#f97316', label: 'Exausto' }, // orange-500
];

export default function ConditionsBar({ conditions = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2 justify-start">
      {CONDITIONS_CONFIG.map((cond) => {
        const isActive = conditions.includes(cond.id);
        const Icon = cond.icon;

        return (
          <button
            key={cond.id}
            onClick={(e) => {
              e.stopPropagation(); // Evita abrir o editor do player ao clicar
              onToggle(cond.id);
            }}
            title={cond.label}
            className={`
              relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 border
              ${isActive 
                ? 'shadow-md scale-110 border-transparent text-white' 
                : 'bg-zinc-800/50 border-white/10 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400'
              }
            `}
            style={{ 
              backgroundColor: isActive ? cond.color : undefined,
              boxShadow: isActive ? `0 0 8px ${cond.color}60` : 'none' // Glow effect
            }}
          >
            <Icon size={14} strokeWidth={2.5} />
          </button>
        );
      })}
    </div>
  );
}