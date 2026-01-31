import React from 'react';
import { Plus, Edit2, Trash2, Backpack, QrCode } from 'lucide-react';
import ConditionsBar from './players/ConditionsBar';
import MobCard from '../MobCard';
import { getImageUrl } from '../constants';
import { toast } from 'react-toastify';

export default function Arena({
  activeScene,
  updatePlayerHp, deletePlayer, onEditPlayer, onTogglePlayerCondition,
  updateMobHp, deleteMob, onEditMob, onToggleMobCondition,
  onAddPlayer, onAddMob, onOpenInventory, onOpenQRCode
}) {
  return (
    <div className="p-4">
      {/* Jogadores */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center justify-between mb-4"><div className="text-2xl font-black tracking-tight text-zinc-100 uppercase">Jogadores</div></div>
        <div className="flex flex-wrap gap-4">
          {(activeScene.players || []).map((p) => {
            const conditions = p.conditions || [];
            const isDead = p.currentHp <= 0;
            
            let cardClasses = "relative w-64 bg-zinc-900/60 border rounded-xl overflow-visible shadow-lg group transition-all duration-500 hover:z-50 ";
            
            // Base border
            if (!isDead && !conditions.includes('charmed') && !conditions.includes('frightened') && !conditions.includes('invisible')) cardClasses += "border-white/10 ";

            // Efeitos no Card
            if (isDead) cardClasses += "grayscale brightness-50 border-red-900 ";
            if (conditions.includes('invisible')) cardClasses += "opacity-40 border-dashed border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] ";
            if (conditions.includes('charmed')) cardClasses += "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] ";
            if (conditions.includes('frightened')) cardClasses += "border-purple-500 animate-pulse ";
            if (conditions.includes('paralyzed')) cardClasses += "contrast-150 brightness-125 grayscale ";
            if (conditions.includes('prone')) cardClasses += "rotate-3 scale-95 opacity-90 ";

            // Efeitos na Imagem
            let imgClasses = "w-full h-full object-cover ";
            if (conditions.includes('blinded')) imgClasses += "brightness-[0.2] blur-[1px] grayscale ";
            if (conditions.includes('restrained')) imgClasses += "border-2 border-dashed border-zinc-500 ";

            return (
            <div key={p.id} className={cardClasses}>
              <div className="flex items-center p-3 gap-3">
                <div className="h-12 w-12 rounded-full bg-black/50 overflow-hidden border border-white/10 shrink-0 relative">
                  {p.photo ? <img src={getImageUrl(p.photo)} className={imgClasses} /> : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">Foto</div>}
                  {/* Overlays de Imagem */}
                  {conditions.includes('poisoned') && <div className="absolute inset-0 bg-green-500/30 animate-pulse pointer-events-none" />}
                  {conditions.includes('charmed') && <div className="absolute inset-0 bg-pink-500/20 animate-pulse pointer-events-none" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-zinc-200 truncate">{p.characterName}</div>
                  <div className="text-xs text-zinc-500 truncate">{p.playerName}</div>
                  <ConditionsBar conditions={p.conditions || []} onToggle={(cId) => onTogglePlayerCondition(p.id, cId)} />
                </div>
              </div>
              <div className="px-3 pb-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1"><span>HP</span><span>{p.currentHp} / {p.maxHp}</span></div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }} />
                </div>
                <div className="flex gap-1 justify-center mb-3">
                  {[-10, -5, -1].map(v => <button key={v} onClick={() => updatePlayerHp(activeScene.id, p.id, v)} className="px-2 py-1 bg-red-950/50 text-red-400 rounded text-xs hover:bg-red-900">{v}</button>)}
                  <div className="w-px bg-white/10 mx-1"></div>
                  {[1, 5, 10].map(v => <button key={v} onClick={() => updatePlayerHp(activeScene.id, p.id, v)} className="px-2 py-1 bg-emerald-950/50 text-emerald-400 rounded text-xs hover:bg-emerald-900">+{v}</button>)}
                </div>
                
                {/* Link e QR Code */}
                <div className="flex gap-1 mb-2">
                    <div className="flex-1 bg-black/40 p-2 rounded border border-white/5 text-[10px] text-zinc-500 font-mono truncate select-all cursor-pointer hover:bg-black/60 transition-colors" 
                        onClick={() => { navigator.clipboard.writeText(`http://${window.location.hostname}:5173${p.accessUrl}`); toast.success('Link copiado!'); }}
                        title="Clique para copiar o link">
                    http://{window.location.hostname}:5173{p.accessUrl}
                    </div>
                    <button onClick={() => onOpenQRCode(`http://${window.location.hostname}:5173${p.accessUrl}`, p.characterName)} className="px-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-zinc-400 hover:text-zinc-200 transition-colors" title="Gerar QR Code">
                        <QrCode size={14} />
                    </button>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onOpenInventory(p)} className="p-1.5 text-zinc-600 hover:text-indigo-400 bg-black/50 rounded" title="Inventário"><Backpack size={14} /></button>
                <button onClick={() => onEditPlayer(p)} className="p-1.5 text-zinc-600 hover:text-indigo-400 bg-black/50 rounded"><Edit2 size={14} /></button>
                <button onClick={() => window.confirm('Remover player?') && deletePlayer(activeScene.id, p.id)} className="p-1.5 text-zinc-600 hover:text-red-400 bg-black/50 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          )})}
          <button onClick={onAddPlayer} className="w-64 h-40 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors gap-2">
            <Plus size={24} /><span className="text-xs uppercase font-bold tracking-widest">Novo Jogador</span>
          </button>
        </div>
      </div>

      {/* Mobs */}
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-2xl font-black tracking-tight text-zinc-100 uppercase">Arena</div><div className="text-sm text-zinc-500 mt-1">Mobs</div></div>
        <button onClick={onAddMob} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200"><Plus className="mx-auto" size={18} /></button>
      </div>
      <div className="flex flex-wrap gap-6 justify-center items-start">
        {(activeScene.mobs || []).map((mob) => (
          <div key={mob.id} className="relative group">
            <MobCard 
              mob={mob} 
              onUpdate={(mobId, delta) => updateMobHp(activeScene.id, mobId, delta)} 
              onDelete={(mobId) => window.confirm(`Remover ${mob.name}?`) && deleteMob(activeScene.id, mobId)}
              onEdit={(mob) => onEditMob(mob)}
              onToggleCondition={(mobId, cId) => onToggleMobCondition(mobId, cId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}