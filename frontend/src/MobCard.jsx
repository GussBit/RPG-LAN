import React, { useState } from 'react';
import { Shield, Heart, Skull, Trash2, Settings, X, 
  ArrowDownCircle, Link as LinkIcon, ZapOff, 
  FlaskConical, Ghost, EyeOff, Cloud, Moon, Timer
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Função auxiliar para imagem
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://${window.location.hostname}:3333${path.startsWith('/') ? '' : '/'}${path}`;
};

const COLORS = {
  red: { bg: 'bg-red-950/40', border: 'border-red-500/50', text: 'text-red-400', dot: 'bg-red-500' },
  yellow: { bg: 'bg-yellow-950/40', border: 'border-yellow-500/50', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  green: { bg: 'bg-green-950/40', border: 'border-green-500/50', text: 'text-green-400', dot: 'bg-green-500' },
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-500/50', text: 'text-blue-400', dot: 'bg-blue-500' },
  orange: { bg: 'bg-orange-950/40', border: 'border-orange-500/50', text: 'text-orange-400', dot: 'bg-orange-500' },
  fuchsia: { bg: 'bg-fuchsia-950/40', border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', dot: 'bg-fuchsia-500' },
  black: { bg: 'bg-zinc-900', border: 'border-zinc-600', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  white: { bg: 'bg-zinc-200/10', border: 'border-zinc-200/50', text: 'text-zinc-200', dot: 'bg-white' },
};

// Lista de Condições (igual ao player)
const CONDITIONS_LIST = [
    { id: 'prone', icon: ArrowDownCircle, color: 'bg-amber-500', label: 'Caído' },
    { id: 'restrained', icon: LinkIcon, color: 'bg-zinc-500', label: 'Impedido' },
    { id: 'paralyzed', icon: ZapOff, color: 'bg-blue-500', label: 'Paralisado' },
    { id: 'poisoned', icon: FlaskConical, color: 'bg-green-500', label: 'Envenenado' },
    { id: 'frightened', icon: Ghost, color: 'bg-purple-500', label: 'Amedrontado' },
    { id: 'charmed', icon: Heart, color: 'bg-pink-500', label: 'Enfeitiçado' },
    { id: 'blinded', icon: EyeOff, color: 'bg-gray-600', label: 'Cego' },
    { id: 'invisible', icon: Cloud, color: 'bg-cyan-400', label: 'Invisível' },
    { id: 'unconscious', icon: Moon, color: 'bg-indigo-500', label: 'Inconsciente' },
    { id: 'dead', icon: Skull, color: 'bg-red-600', label: 'Morto' },
];

export default function MobCard({ mob, onUpdate, onDelete }) {
  const theme = COLORS[mob.color] || COLORS.red;
  const hp = mob.currentHp ?? mob.maxHp;
  const conditions = mob.conditions || [];
  const isDead = hp <= 0 || conditions.includes('dead');
  
  const [menuOpen, setMenuOpen] = useState(false);

  const changeHp = (delta) => {
    if (onUpdate) onUpdate(mob.id, { currentHp: Math.max(0, hp + delta) }); // Envia objeto
  };

  const toggleCondition = (conditionId) => {
      const has = conditions.includes(conditionId);
      const newConditions = has 
        ? conditions.filter(c => c !== conditionId)
        : [...conditions, conditionId];
      
      if (onUpdate) onUpdate(mob.id, { conditions: newConditions }); // Envia objeto
  };

  return (
    <div className={twMerge(
      "relative w-64 rounded-xl border-2 transition-all duration-500 flex flex-col overflow-hidden backdrop-blur-sm group select-none",
      theme.bg, theme.border,
      isDead ? "opacity-60 grayscale" : "opacity-100 shadow-lg",
      conditions.includes('invisible') && "opacity-30 border-dashed border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
      conditions.includes('blinded') && "brightness-50 grayscale blur-[0.5px]",
      conditions.includes('charmed') && "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]",
      conditions.includes('prone') && "rotate-2 translate-y-1 origin-bottom-right",
      conditions.includes('paralyzed') && "grayscale brightness-150 contrast-125",
      conditions.includes('frightened') && "animate-pulse border-purple-500/50"
    )}>
      
      {/* Overlays Visuais */}
      {conditions.includes('poisoned') && <div className="absolute inset-0 bg-green-500/10 pointer-events-none z-10 animate-pulse mix-blend-overlay" />}
      {conditions.includes('charmed') && <div className="absolute inset-0 bg-pink-500/5 pointer-events-none z-10" />}
      
      {/* --- MENU DE CONDIÇÕES (OVERLAY) --- */}
      {menuOpen && (
          <div className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex flex-col p-2 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Condições</span>
                  <button onClick={() => setMenuOpen(false)} className="text-zinc-400 hover:text-white"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 overflow-y-auto content-start">
                  {CONDITIONS_LIST.map(cond => {
                      const isActive = conditions.includes(cond.id);
                      const Icon = cond.icon;
                      return (
                          <button 
                            key={cond.id}
                            onClick={() => toggleCondition(cond.id)}
                            className={`aspect-square rounded-lg flex items-center justify-center transition-all ${isActive ? `${cond.color} text-white shadow-lg` : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}
                            title={cond.label}
                          >
                              <Icon size={18} />
                          </button>
                      )
                  })}
              </div>
          </div>
      )}

      {/* Header Compacto */}
      <div className="flex justify-between items-center p-3 border-b border-white/10 bg-black/20 relative z-20">
        <div className="flex items-center gap-2 overflow-hidden">
           <div className={`w-2.5 h-2.5 rounded-full ${theme.dot} shadow-[0_0_8px_currentColor] shrink-0`} />
           <h3 className={clsx("font-black text-lg leading-none truncate", theme.text)}>
             {mob.name}
           </h3>
        </div>

        <div className="flex items-center gap-1">
            {/* Botão Abrir Menu */}
            <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-950/30 p-1.5 rounded transition-colors"
            >
                <Settings size={16} />
            </button>
            {/* Botão Deletar */}
            <button 
                onClick={() => onDelete && onDelete(mob.id)}
                className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30 p-1.5 rounded transition-colors"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>

      {/* Imagem */}
      <div className="relative w-full h-40 bg-black/50 group-hover:bg-black/40 border-b border-white/5 transition-colors">
        {mob.image ? (
           <img 
             src={getImageUrl(mob.image)}
             className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
             alt={mob.name} 
           />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-zinc-700">
             <Skull size={48} />
           </div>
        )}
        
        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
            <span className="font-black text-3xl text-red-600 uppercase tracking-widest rotate-12 border-4 border-red-600 px-4 py-2 rounded-lg opacity-80">Morto</span>
          </div>
        )}

        {conditions.includes('charmed') && (
            <div className="absolute top-2 right-2 text-pink-500 animate-bounce drop-shadow-md z-30"><Heart size={20} fill="currentColor" /></div>
        )}
      </div>

      {/* Stats e Controles */}
      <div className="p-3 space-y-3 relative z-20">
        <div className="flex justify-between text-sm font-mono text-zinc-400 items-end">
          <div className="flex gap-3 text-xs uppercase tracking-wider">
            <div title="Dano">⚔️ <span className="text-zinc-200">{mob.damageDice}</span></div>
            <div title="Acerto">🎯 <span className="text-zinc-200">+{mob.toHit}</span></div>
          </div>
          <div className={clsx("font-bold text-lg", theme.text)}>
             {hp} <span className="text-xs text-zinc-500">/ {mob.maxHp}</span>
          </div>
        </div>

        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <div className={clsx("h-full transition-all duration-300", theme.dot)} style={{ width: `${Math.min(100, (hp / mob.maxHp) * 100)}%` }} />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[-1, -5, -10, -20].map(val => (
            <button key={val} onClick={() => changeHp(val)} className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 text-xs font-bold py-1.5 rounded active:scale-95">{val}</button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[1, 5, 10, 20].map(val => (
            <button key={val} onClick={() => changeHp(val)} className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 text-emerald-400 text-xs font-bold py-1.5 rounded active:scale-95">+{val}</button>
          ))}
        </div>

        {/* Indicadores de condição no rodapé */}
        {conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-white/5 justify-center">
                {conditions.map(c => {
                   const condData = CONDITIONS_LIST.find(x => x.id === c);
                   if(!condData) return null;
                   const Icon = condData.icon;
                   return (
                     <div key={c} className={`w-5 h-5 rounded flex items-center justify-center ${condData.color} text-white shadow-sm`} title={condData.label}>
                        <Icon size={12} />
                     </div>
                   )
                })}
            </div>
        )}
      </div>
    </div>
  );
}