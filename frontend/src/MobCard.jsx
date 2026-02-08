import React from 'react';
import { Shield, Heart, Skull, Trash2, Edit2, Swords, Target, Backpack, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ConditionsBar from './components/players/ConditionsBar';
import { useGameStore } from './store';

const COLORS = {
  red: { bg: 'bg-red-950/40', border: 'border-red-500/50', text: 'text-red-400', dot: 'bg-red-500' },
  yellow: { bg: 'bg-yellow-950/40', border: 'border-yellow-500/50', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  green: { bg: 'bg-green-950/40', border: 'border-green-500/50', text: 'text-green-400', dot: 'bg-green-500' },
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-500/50', text: 'text-blue-400', dot: 'bg-blue-500' },
  orange: { bg: 'bg-orange-950/40', border: 'border-orange-500/50', text: 'text-orange-400', dot: 'bg-orange-500' },
  purple: { bg: 'bg-purple-950/40', border: 'border-purple-500/50', text: 'text-purple-400', dot: 'bg-purple-500' },
  pink: { bg: 'bg-pink-950/40', border: 'border-pink-500/50', text: 'text-pink-400', dot: 'bg-pink-500' },
  fuchsia: { bg: 'bg-fuchsia-950/40', border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', dot: 'bg-fuchsia-500' },
  black: { bg: 'bg-zinc-900', border: 'border-zinc-600', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  white: { bg: 'bg-zinc-200/10', border: 'border-zinc-200/50', text: 'text-zinc-200', dot: 'bg-white' },
};

export default function MobCard({ mob, onUpdate, onDelete, onEdit, onToggleCondition, onOpenInventory }) {
  const theme = COLORS[mob.color] || COLORS.red;
  const { openCharacterSheet } = useGameStore();
  
  const hp = mob.currentHp ?? mob.maxHp;
  const isDead = hp <= 0;
  const hpPercent = Math.min(100, Math.max(0, (hp / mob.maxHp) * 100));

  const changeHp = (delta) => {
    if (onUpdate) {
      onUpdate(mob.id, delta);
    }
  };

  return (
    <>
      {/* LAYOUT VERTICAL COMPACTO (< lg / < 1024px) */}
      <div className={twMerge(
        "lg:hidden relative w-full rounded-xl border-2 transition-all duration-300 flex flex-col backdrop-blur-sm",
        theme.bg, theme.border,
        isDead ? "opacity-60 grayscale scale-95" : "opacity-100 shadow-lg hover:shadow-xl",
        "cursor-pointer hover:ring-2 hover:ring-indigo-500/50"
      )}
      onClick={() => openCharacterSheet('mob', mob.id)}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center px-2.5 py-2 border-b border-white/10 bg-black/30 rounded-t-[10px]">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
             <div className={clsx("w-2 h-2 rounded-full shrink-0", theme.dot, !isDead && "shadow-[0_0_6px_currentColor]")} />
             <h3 className={clsx("font-bold text-sm leading-none truncate", theme.text)}>
               {mob.name}
             </h3>
          </div>

        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onOpenInventory && onOpenInventory(mob)}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition-all"
              title="Inventário"
            >
              <Backpack size={14} />
            </button>
            <button 
              onClick={() => onEdit && onEdit(mob)}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition-all"
              title="Editar"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={() => onDelete && onDelete(mob.id)}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-all"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Imagem */}
        <div className="relative w-full h-24 bg-black/50 overflow-hidden">
          {mob.image ? (
             <img 
               src={`http://${window.location.hostname}:3333${mob.image}`}
               className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
               loading="lazy"
               alt={mob.name} 
             />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-zinc-700">
               <Skull size={32} />
             </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          {isDead && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <span className="font-black text-lg text-red-500 uppercase tracking-wider rotate-6 border-2 border-red-500 px-3 py-1 rounded-lg shadow-lg">
                Morto
              </span>
            </div>
          )}

          {/* Stats Overlay (Vertical Layout) */}
          <div className="absolute top-1 left-1 flex flex-col gap-1 z-10 pointer-events-none">
             <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[10px] w-fit">
                <Shield size={10} className="text-zinc-400" />
                <span className="text-zinc-200 font-bold">{mob.ac || 10}</span>
             </div>
             <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[10px] w-fit">
                <Swords size={10} className="text-amber-400" />
                <span className="text-zinc-200 font-bold">{mob.damageDice}</span>
             </div>
             <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[10px] w-fit">
                <Target size={10} className="text-blue-400" />
                <span className="text-zinc-200 font-bold">+{mob.toHit}</span>
             </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-2 space-y-2 rounded-b-[10px] overflow-visible">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex gap-2"></div>
            <div className={clsx("font-bold text-base tabular-nums", theme.text)}>
               {hp}<span className="text-[10px] text-zinc-500 font-normal">/{mob.maxHp}</span>
            </div>
          </div>

          <div className="relative h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div 
              className={clsx("h-full transition-all duration-300", theme.dot)} 
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Container de Condições - Z-INDEX ALTO */}
          <div className="relative z-[200] min-h-[24px]" onClick={(e) => e.stopPropagation()}>
            <ConditionsBar 
              conditions={mob.conditions || []} 
              onToggle={(cId) => onToggleCondition && onToggleCondition(mob.id, cId)} 
            />
          </div>

          <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-1">
              {[-1, -5, -10, -20].map(val => (
                <button 
                  key={val} 
                  onClick={() => changeHp(val)} 
                  className="bg-red-950/50 hover:bg-red-900/70 border border-red-900/50 text-red-400 text-[10px] font-bold py-1 rounded transition-all active:scale-95"
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[1, 5, 10, 20].map(val => (
                <button 
                  key={val} 
                  onClick={() => changeHp(val)} 
                  className="bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-900/50 text-emerald-400 text-[10px] font-bold py-1 rounded transition-all active:scale-95"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT HORIZONTAL COMPACTO (lg até 2xl / 1024px-1535px) */}
      <div className={twMerge(
        "hidden lg:flex 2xl:hidden relative w-full rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
        theme.bg, theme.border,
        isDead ? "opacity-60 grayscale" : "opacity-100 shadow-lg hover:shadow-xl",
        "cursor-pointer hover:ring-2 hover:ring-indigo-500/50"
      )}
      onClick={() => openCharacterSheet('mob', mob.id)}
      >
        
        {/* Seção Esquerda: Imagem Compacta */}
        <div className="relative w-28 shrink-0 flex flex-col overflow-hidden rounded-l-[10px]">
          {/* Header no topo */}
          <div className="absolute top-0 left-0 right-0 z-10 px-2 py-1.5 bg-gradient-to-b from-black/95 via-black/80 to-transparent">
            <div className="flex items-center gap-1.5 overflow-hidden">
               <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", theme.dot, !isDead && "shadow-[0_0_6px_currentColor]")} />
               <h3 className={clsx("font-bold text-xs leading-none truncate", theme.text)}>
                 {mob.name}
               </h3>
            </div>
          </div>

          {/* Imagem */}
          <div className="relative w-full h-full bg-black/50 overflow-hidden group min-h-[160px]">
            {mob.image ? (
               <img 
                 src={`http://${window.location.hostname}:3333${mob.image}`}
                 className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                 loading="lazy"
                 alt={mob.name} 
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-zinc-700">
                 <Skull size={36} />
               </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            {isDead && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                <span className="font-black text-sm text-red-500 uppercase tracking-wider rotate-12 border-2 border-red-500 px-2 py-1 rounded-lg shadow-2xl">
                  Morto
                </span>
              </div>
            )}

            {/* Stats sobre a imagem */}
            <div className="absolute top-8 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
               <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[10px] w-fit">
                  <Shield size={10} className="text-zinc-400" />
                  <span className="text-zinc-200 font-bold">{mob.ac || 10}</span>
               </div>
               <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[10px] w-fit">
                  <Swords size={10} className="text-amber-400" />
                  <span className="text-zinc-200 font-bold">{mob.damageDice}</span>
               </div>
               <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[10px] w-fit">
                  <Target size={10} className="text-blue-400" />
                  <span className="text-zinc-200 font-bold">+{mob.toHit}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Seção Direita: Controles Compactos */}
        <div className="flex-1 flex flex-col min-w-0 overflow-visible">
          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-0.5 px-2 py-1.5 border-b border-white/10 bg-black/20" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onOpenInventory && onOpenInventory(mob)}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition-all"
              title="Inventário"
            >
              <Backpack size={13} />
            </button>
            <button 
              onClick={() => onEdit && onEdit(mob)}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition-all"
              title="Editar"
            >
              <Edit2 size={13} />
            </button>
            <button 
              onClick={() => onDelete && onDelete(mob.id)}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-all"
              title="Excluir"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Controles */}
          <div className="flex-1 p-2 space-y-2 overflow-visible">
            {/* HP Display Compacto - SEM BARRA */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Heart size={12} className={clsx(theme.text, "fill-current")} />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">HP</span>
              </div>
              <div className={clsx("font-black text-lg tabular-nums", theme.text)}>
                {hp} <span className="text-xs text-zinc-500 font-normal">/ {mob.maxHp}</span>
              </div>
            </div>

            {/* Condições Compactas - Z-INDEX ALTO */}
            <div className="relative z-[200] bg-black/40 border border-white/10 rounded-lg p-1.5 min-h-[28px]" onClick={(e) => e.stopPropagation()}>
              <ConditionsBar 
                conditions={mob.conditions || []} 
                onToggle={(cId) => onToggleCondition && onToggleCondition(mob.id, cId)} 
              />
            </div>

            {/* Botões de Ajuste HP Compactos - 2 LINHAS */}
            <div onClick={(e) => e.stopPropagation()}>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Ajustar HP</div>
              
              <div className="space-y-1">
                {/* Linha 1: Dano */}
                <div className="grid grid-cols-4 gap-1">
                  {[-1, -5, -10, -20].map(val => (
                    <button 
                      key={val} 
                      onClick={() => changeHp(val)} 
                      className="bg-red-950/60 hover:bg-red-900/80 border border-red-900/50 text-red-400 text-[10px] font-bold py-1.5 rounded transition-all hover:scale-105 active:scale-95"
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {/* Linha 2: Cura */}
                <div className="grid grid-cols-4 gap-1">
                  {[1, 5, 10, 20].map(val => (
                    <button 
                      key={val} 
                      onClick={() => changeHp(val)} 
                      className="bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-900/50 text-emerald-400 text-[10px] font-bold py-1.5 rounded transition-all hover:scale-105 active:scale-95"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT HORIZONTAL EXPANDIDO (2xl+ / 1536px+) */}
      <div className={twMerge(
        "hidden 2xl:flex relative w-full rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
        theme.bg, theme.border,
        isDead ? "opacity-60 grayscale" : "opacity-100 shadow-lg hover:shadow-xl",
        "cursor-pointer hover:ring-2 hover:ring-indigo-500/50"
      )}
      onClick={() => openCharacterSheet('mob', mob.id)}
      >
        
        {/* Seção Esquerda: Imagem + Header */}
        <div className="relative w-44 shrink-0 flex flex-col overflow-hidden rounded-l-[10px]">
          {/* Header no topo da imagem */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-2.5 py-2 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-sm">
            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
               <div className={clsx("w-2 h-2 rounded-full shrink-0", theme.dot, !isDead && "shadow-[0_0_8px_currentColor]")} />
               <h3 className={clsx("font-bold text-sm leading-none truncate", theme.text)}>
                 {mob.name}
               </h3>
            </div>
          </div>

          {/* Imagem */}
          <div className="relative w-full h-full bg-black/50 overflow-hidden group">
            {mob.image ? (
               <img 
                 src={`http://${window.location.hostname}:3333${mob.image}`}
                 className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                 loading="lazy"
                 alt={mob.name} 
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-zinc-700">
                 <Skull size={56} />
               </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            {isDead && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                <span className="font-black text-2xl text-red-500 uppercase tracking-widest rotate-12 border-4 border-red-500 px-4 py-2 rounded-xl shadow-2xl">
                  Morto
                </span>
              </div>
            )}

            {/* Stats sobre a imagem */}
            <div className="absolute top-10 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
               <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded border border-white/10 text-xs w-fit">
                  <Shield size={12} className="text-zinc-400" />
                  <span className="text-zinc-200 font-bold">{mob.ac || 10}</span>
               </div>
               <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded border border-white/10 text-xs w-fit">
                  <Swords size={12} className="text-amber-400" />
                  <span className="text-zinc-200 font-bold">{mob.damageDice}</span>
               </div>
               <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded border border-white/10 text-xs w-fit">
                  <Target size={12} className="text-blue-400" />
                  <span className="text-zinc-200 font-bold">+{mob.toHit}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Seção Direita: Controles */}
        <div className="flex-1 flex flex-col min-w-0 overflow-visible">
          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-1 px-3 py-2 border-b border-white/10 bg-black/20" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onOpenInventory && onOpenInventory(mob)}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1.5 rounded-lg transition-all"
              title="Inventário"
            >
              <Backpack size={16} />
            </button>
            <button 
              onClick={() => onEdit && onEdit(mob)}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1.5 rounded-lg transition-all"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete && onDelete(mob.id)}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Área de Controles */}
          <div className="flex-1 p-4 space-y-3 overflow-visible">
            {/* HP Display Compacto - SEM BARRA */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart size={16} className={clsx(theme.text, "fill-current")} />
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">HP</span>
              </div>
              <div className={clsx("font-black text-1xl tabular-nums", theme.text)}>
                {hp} <span className="text-sm text-zinc-500 font-normal">/ {mob.maxHp}</span>
              </div>
            </div>

            {/* Condições - Z-INDEX ALTO */}
            <div className="relative z-[200] bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
              <ConditionsBar 
                conditions={mob.conditions || []} 
                onToggle={(cId) => onToggleCondition && onToggleCondition(mob.id, cId)} 
              />
            </div>

            {/* Botões de Ajuste HP - 2 LINHAS */}
            <div onClick={(e) => e.stopPropagation()}>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Ajustar HP</div>
              
              <div className="space-y-2">
                {/* Linha 1: Dano */}
                <div className="grid grid-cols-4 gap-2">
                  {[-1, -5, -10, -20].map(val => (
                    <button 
                      key={val} 
                      onClick={() => changeHp(val)} 
                      className="bg-red-950/60 hover:bg-red-900/80 border border-red-900/50 hover:border-red-700/70 text-red-400 text-sm font-bold py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {/* Linha 2: Cura */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 20].map(val => (
                    <button 
                      key={val} 
                      onClick={() => changeHp(val)} 
                      className="bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-900/50 hover:border-emerald-700/70 text-emerald-400 text-sm font-bold py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
