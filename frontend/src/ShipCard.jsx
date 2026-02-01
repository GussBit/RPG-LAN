import React from 'react';
import { 
  Anchor, Wind, Skull, Flame, Droplets, Hammer, Heart, 
  AlertTriangle, Ship, Smile, Meh, Frown, Swords, Zap,
  MoreVertical, Shield, Waves, Backpack
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getImageUrl } from './constants';
import { toast } from 'react-toastify';

const CRISIS_CONDITIONS = [
  { id: 'crisis_powder', label: 'Pólvora', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'crisis_flood', label: 'Inundação', icon: Waves, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'crisis_fire', label: 'Incêndio', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'crisis_mast', label: 'Vela/Mastro', icon: Wind, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
  { id: 'crisis_crew', label: 'Tripulação', icon: Skull, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const COLORS = {
  red: { bg: 'bg-red-950/40', border: 'border-red-500/50', text: 'text-red-400' },
  yellow: { bg: 'bg-yellow-950/40', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  green: { bg: 'bg-green-950/40', border: 'border-green-500/50', text: 'text-green-400' },
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-500/50', text: 'text-blue-400' },
  orange: { bg: 'bg-orange-950/40', border: 'border-orange-500/50', text: 'text-orange-400' },
  purple: { bg: 'bg-purple-950/40', border: 'border-purple-500/50', text: 'text-purple-400' },
  cyan: { bg: 'bg-cyan-950/40', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  white: { bg: 'bg-zinc-900/60', border: 'border-zinc-500/50', text: 'text-zinc-200' },
};

export default function ShipCard({ 
  data, 
  type = 'mob', // 'player' | 'mob'
  onUpdate, 
  onUpdateMorale,
  onDelete, 
  onEdit,
  onToggleCondition,
  onOpenInventory
}) {
  const maxHp = Number(data.maxHp) || 100;
  const currentHp = Number(data.currentHp ?? maxHp);
  const hpPct = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));

  // Moral (Padrão 10 se não definido)
  const maxMorale = data.maxMorale || 10;
  const currentMorale = data.currentMorale ?? maxMorale;
  const moralePct = Math.min(100, Math.max(0, (currentMorale / maxMorale) * 100));

  const theme = COLORS[data.color] || (type === 'player' ? COLORS.blue : COLORS.green);

  const conditions = data.conditions || [];

  // --- LÓGICA DE CONDIÇÕES DO CASCO ---
  let hullStatus = { label: 'Intacto', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/30', icon: Ship };
  if (hpPct < 10) {
    hullStatus = { label: 'Condenado', color: 'text-red-500', border: 'border-red-500/50', bg: 'bg-red-950/50', icon: Skull, animate: 'animate-pulse' };
  } else if (hpPct < 50) {
    hullStatus = { label: 'Avariado', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-950/40', icon: AlertTriangle };
  }

  // --- LÓGICA DE CONDIÇÕES DE MORAL ---
  let moraleStatus = { label: 'Normal', color: 'text-blue-400', icon: Smile };
  if (moralePct <= 0) {
    moraleStatus = { label: 'Motim', color: 'text-red-500', icon: Frown };
  } else if (moralePct <= 40) {
    moraleStatus = { label: 'Abalado', color: 'text-orange-400', icon: Meh };
  }

  return (
    <div className={twMerge(
      "relative w-full rounded-xl border-2 transition-all duration-300 flex flex-col backdrop-blur-md overflow-hidden group",
      theme.border, theme.bg, hullStatus.animate
    )}>
      
      {/* HEADER: Nome e Ícone */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <hullStatus.icon size={18} className={hullStatus.color} />
          <div className="flex flex-col min-w-0">
            <span className={clsx("font-black text-sm uppercase truncate leading-none", hullStatus.color)}>
              {data.name || data.characterName || 'Navio Desconhecido'}
            </span>
            <span className="text-[10px] text-zinc-400 truncate">
              {type === 'player' ? data.playerName : 'Inimigo'}
            </span>
          </div>
        </div>
        
        {/* Ações Rápidas */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onOpenInventory && onOpenInventory(data)}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-indigo-300 transition-colors"
            title="Carga / Inventário"
          >
            <Backpack size={14} />
          </button>
          {onEdit && (
            <button onClick={() => onEdit(data)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200">
              <MoreVertical size={14} />
            </button>
          )}
          {onDelete && (
             <button onClick={() => onDelete(data.id)} className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400">
               <Skull size={14} />
             </button>
          )}
        </div>
      </div>

      {/* CORPO: Imagem e Stats */}
      <div className="flex flex-1 min-h-0">
        {/* Imagem (Opcional) */}
        <div className="w-24 bg-black/50 relative shrink-0 border-r border-white/10">
          {data.image || data.photo ? (
            <img 
              src={getImageUrl(data.image || data.photo)} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
              alt="" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              <Ship size={32} />
            </div>
          )}
          {/* Status Overlay na Imagem */}
          <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-center">
             <span className={clsx("text-[10px] font-bold uppercase", hullStatus.color)}>
               {hullStatus.label}
             </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex-1 p-2 space-y-3">
          
          {/* CASCO (PV) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
              <span className="flex items-center gap-1"><Shield size={10} /> Casco</span>
              <span className="text-zinc-200">{currentHp} / {maxHp}</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
              <div 
                className={clsx("h-full transition-all duration-500 ease-out", 
                  hpPct < 25 ? "bg-red-500" : hpPct < 50 ? "bg-amber-500" : "bg-emerald-500"
                )} 
                style={{ width: `${hpPct}%` }} 
              />
            </div>
            <div className="flex gap-1">
              {[-10, -5, -1].map(v => (
                <button key={v} onClick={() => onUpdate(data.id, v)} className="flex-1 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 text-[10px] font-bold rounded py-0.5">{v}</button>
              ))}
              {[1, 5, 10].map(v => (
                <button key={v} onClick={() => onUpdate(data.id, v)} className="flex-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/30 text-emerald-400 text-[10px] font-bold rounded py-0.5">+{v}</button>
              ))}
            </div>
          </div>

          {/* MORAL (PM) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
              <span className="flex items-center gap-1"><Anchor size={10} /> Moral ({moraleStatus.label})</span>
              <span className={moraleStatus.color}>{currentMorale} / {maxMorale}</span>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className={clsx("h-full transition-all duration-500 ease-out", 
                  moralePct <= 40 ? "bg-orange-500" : "bg-blue-500"
                )} 
                style={{ width: `${moralePct}%` }} 
              />
            </div>
            <div className="flex gap-1">
              {[-10, -5, -1].map(v => (
                <button key={v} onClick={() => onUpdateMorale(data.id, v)} className="flex-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold rounded py-0.5">{v}</button>
              ))}
              {[1, 5, 10].map(v => (
                <button key={v} onClick={() => onUpdateMorale(data.id, v)} className="flex-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold rounded py-0.5">+{v}</button>
              ))}
            </div>
          </div>

          {/* CRISES (Botões de Toggle) */}
          <div>
             <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Crises & Condições</div>
             <div className="flex flex-wrap gap-1">
                {CRISIS_CONDITIONS.map(crisis => {
                   const isActive = conditions.includes(crisis.id);
                   return (
                     <button
                        key={crisis.id}
                        onClick={() => onToggleCondition && onToggleCondition(data.id, crisis.id)}
                        className={clsx(
                          "p-1.5 rounded border transition-all flex items-center gap-1",
                          isActive 
                            ? `${crisis.bg} ${crisis.border} ${crisis.color}` 
                            : "bg-zinc-900/40 border-transparent text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400"
                        )}
                        title={crisis.label}
                     >
                        <crisis.icon size={14} />
                     </button>
                   );
                })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
