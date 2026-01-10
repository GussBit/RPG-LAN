import React from 'react';
import { Shield, Heart, Skull, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export default function MobCard({ mob, onUpdate, onDelete }) {
  // Pega o tema ou usa red como fallback
  const theme = COLORS[mob.color] || COLORS.red;
  
  // Usa o valor da prop (vindo da Store/DB) como fonte da verdade
  const hp = mob.currentHp ?? mob.maxHp;
  const isDead = hp <= 0;

  // Função para enviar a alteração para o pai (App -> Store)
  const changeHp = (delta) => {
    if (onUpdate) {
      onUpdate(mob.id, delta);
    }
  };

  return (
    <div className={twMerge(
      "relative w-64 rounded-xl border-2 transition-all duration-500 flex flex-col overflow-hidden backdrop-blur-sm",
      theme.bg, theme.border,
      isDead ? "opacity-60 grayscale" : "opacity-100 shadow-lg"
    )}>
      
      {/* Header Compacto */}
      <div className="flex justify-between items-center p-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2 overflow-hidden">
           <div className={`w-2.5 h-2.5 rounded-full ${theme.dot} shadow-[0_0_8px_currentColor] shrink-0`} />
           <h3 className={clsx("font-black text-lg leading-none truncate", theme.text)}>
             {mob.name}
           </h3>
        </div>

        {/* Botão Deletar */}
        <button 
          onClick={() => onDelete && onDelete(mob.id)}
          className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30 p-1.5 rounded transition-colors"
          title="Excluir mob"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Imagem */}
      <div className="relative w-full h-40 bg-black/50 group border-b border-white/5">
        {mob.image ? (
           <img src={`http://localhost:3333${mob.image}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={mob.name} />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-zinc-700">
             <Skull size={48} />
           </div>
        )}
        
        {/* Overlay de Status quando morto */}
        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="font-black text-3xl text-red-600 uppercase tracking-widest rotate-12 border-4 border-red-600 px-4 py-2 rounded-lg opacity-80">
              Morto
            </span>
          </div>
        )}
      </div>

      {/* Stats e Controles */}
      <div className="p-3 space-y-3">
        {/* Status Bar */}
        <div className="flex justify-between text-sm font-mono text-zinc-400 items-end">
          <div className="flex gap-3 text-xs uppercase tracking-wider">
            <div title="Dano">⚔️ <span className="text-zinc-200">{mob.damageDice}</span></div>
            <div title="Acerto">🎯 <span className="text-zinc-200">+{mob.toHit}</span></div>
          </div>
          <div className={clsx("font-bold text-lg", theme.text)}>
             {hp} <span className="text-xs text-zinc-500">/ {mob.maxHp}</span>
          </div>
        </div>

        {/* Barra de Vida Visual */}
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <div 
            className={clsx("h-full transition-all duration-300", theme.dot)} 
            style={{ width: `${Math.min(100, (hp / mob.maxHp) * 100)}%` }}
          />
        </div>

        {/* Botões de Dano (Vermelhos) */}
        <div className="grid grid-cols-4 gap-1">
          {[-1, -5, -10, -20].map(val => (
            <button key={val} onClick={() => changeHp(val)} 
              className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 text-xs font-bold py-1.5 rounded transition-all active:scale-95">
              {val}
            </button>
          ))}
        </div>

        {/* Botões de Cura (Verdes) */}
        <div className="grid grid-cols-4 gap-1">
          {[1, 5, 10, 20].map(val => (
            <button key={val} onClick={() => changeHp(val)} 
              className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 text-emerald-400 text-xs font-bold py-1.5 rounded transition-all active:scale-95">
              +{val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}