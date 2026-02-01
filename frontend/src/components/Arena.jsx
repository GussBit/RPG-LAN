import React from 'react';
import { Plus, Edit2, Trash2, Backpack, QrCode, Heart, User } from 'lucide-react';
import ConditionsBar from './players/ConditionsBar';
import MobCard from '../MobCard';
import { getImageUrl } from '../constants';
import { toast } from 'react-toastify';
import { clsx } from 'clsx';

export default function Arena({
  activeScene,
  updatePlayerHp, deletePlayer, onEditPlayer, onTogglePlayerCondition,
  updateMobHp, deleteMob, onEditMob, onToggleMobCondition,
  onAddPlayer, onAddMob, onOpenInventory, onOpenQRCode, onOpenMobInventory
}) {
  return (
    <div className="px-3 py-4 xl:px-4 xl:py-5 space-y-6 xl:space-y-8">
      
      {/* SEÇÃO: JOGADORES */}
      <section className="border-b border-white/10 pb-6 xl:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 xl:mb-5">
          <div>
            <h2 className="text-xl xl:text-2xl font-black tracking-tight text-zinc-100 uppercase leading-none mb-1">
              Jogadores
            </h2>
            <p className="text-xs xl:text-sm text-zinc-500">
              {activeScene?.players?.length || 0} jogador{activeScene?.players?.length !== 1 ? 'es' : ''} na cena
            </p>
          </div>
        </div>

        {/* Grid de Jogadores - BREAKPOINTS AJUSTADOS */}
        <div className="grid grid-cols-1 min-[800px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 xl:gap-4">
          {(activeScene?.players || []).map((p) => {
            const conditions = p.conditions || [];
            const isDead = p.currentHp <= 0;
            const hpPercent = Math.min(100, Math.max(0, (p.currentHp / p.maxHp) * 100));
            
            // Classes base do card
            let cardClasses = clsx(
              "relative w-full rounded-xl shadow-lg transition-all duration-500",
              "bg-gradient-to-br from-zinc-900/80 to-zinc-900/60 backdrop-blur-sm",
              "border-2",
              "group hover:shadow-2xl"
            );

            // Border effects baseado em condições
            if (isDead) {
              cardClasses += " border-red-900 grayscale brightness-50 opacity-75";
            } else if (conditions.includes('invisible')) {
              cardClasses += " opacity-40 border-dashed border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]";
            } else if (conditions.includes('charmed')) {
              cardClasses += " border-pink-500/70 shadow-[0_0_20px_rgba(236,72,153,0.5)]";
            } else if (conditions.includes('frightened')) {
              cardClasses += " border-purple-500/70 animate-pulse";
            } else if (conditions.includes('paralyzed')) {
              cardClasses += " border-zinc-500/50 contrast-150 brightness-125 grayscale";
            } else if (conditions.includes('prone')) {
              cardClasses += " border-white/20 rotate-1 scale-[0.98] opacity-90";
            } else {
              cardClasses += " border-white/10 hover:border-white/20";
            }

            // Classes da imagem
            let imgClasses = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110";
            if (conditions.includes('blinded')) imgClasses += " brightness-[0.2] blur-[1px] grayscale";
            if (conditions.includes('restrained')) imgClasses += " border-2 border-dashed border-zinc-500";

            return (
              <div key={p.id} className={cardClasses}>
                
                {/* LAYOUT VERTICAL (base até lg) */}
                <div className="lg:hidden overflow-visible">
                  {/* Header com Avatar e Botões */}
                  <div className="relative flex items-center gap-3 p-3 bg-black/30 border-b border-white/10 rounded-t-xl">
                    {/* Avatar */}
                    <div className="relative h-14 w-14 rounded-xl bg-black/50 overflow-hidden border-2 border-white/20 shrink-0">
                      {p.photo ? (
                        <img src={getImageUrl(p.photo)} className={imgClasses} alt={p.characterName} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <User size={24} />
                        </div>
                      )}
                      {/* Overlays de condições */}
                      {conditions.includes('poisoned') && (
                        <div className="absolute inset-0 bg-green-500/30 animate-pulse pointer-events-none" />
                      )}
                      {conditions.includes('charmed') && (
                        <div className="absolute inset-0 bg-pink-500/20 animate-pulse pointer-events-none" />
                      )}
                      {/* Badge de HP */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-3 pb-1 px-1">
                        <div className="flex items-center gap-0.5 justify-center">
                          <Heart size={8} className="text-red-400 fill-red-400" />
                          <span className="text-[9px] font-bold text-white">{p.currentHp}/{p.maxHp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-zinc-200 truncate leading-tight mb-0.5">
                        {p.characterName || 'Sem nome'}
                      </h3>
                      <p className="text-[10px] text-zinc-500 truncate leading-tight mb-1.5">
                        {p.playerName}
                      </p>
                      {/* HP Display Compacto */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <Heart size={12} className="text-red-400 fill-red-400" />
                        <span className="font-bold text-zinc-200">{p.currentHp}</span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-zinc-400">{p.maxHp}</span>
                      </div>
                    </div>

                    {/* Botões de Ação NO HEADER - SEMPRE VISÍVEL */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button 
                        onClick={() => onOpenInventory(p)}
                        className="p-1 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                        title="Inventário"
                      >
                        <Backpack size={13} />
                      </button>
                      <button 
                        onClick={() => onEditPlayer(p)}
                        className="p-1 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => window.confirm('Remover jogador?') && deletePlayer(activeScene.id, p.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Condições - Z-INDEX MUITO ALTO */}
                  <div className="relative z-[200] px-3 pt-3 overflow-visible">
                    <ConditionsBar 
                      conditions={conditions} 
                      onToggle={(cId) => onTogglePlayerCondition(p.id, cId)} 
                    />
                  </div>

                  {/* Botões de HP */}
                  <div className="px-3 py-3 space-y-1.5">
                    <div className="flex gap-1">
                      {[-10, -5, -1].map(v => (
                        <button 
                          key={v}
                          onClick={() => updatePlayerHp(activeScene.id, p.id, v)}
                          className="flex-1 py-1.5 bg-red-950/50 hover:bg-red-900/70 text-red-400 rounded-lg text-[11px] font-bold border border-red-900/50 transition-all active:scale-95"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {[1, 5, 10].map(v => (
                        <button 
                          key={v}
                          onClick={() => updatePlayerHp(activeScene.id, p.id, v)}
                          className="flex-1 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-400 rounded-lg text-[11px] font-bold border border-emerald-900/50 transition-all active:scale-95"
                        >
                          +{v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Link e QR Code */}
                  <div className="px-3 pb-3">
                    <div className="flex gap-1.5">
                      <div 
                        className="flex-1 bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 text-[9px] text-zinc-500 font-mono truncate cursor-pointer hover:bg-black/60 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(`http://${window.location.hostname}:5173${p.accessUrl}`);
                          toast.success('Link copiado!');
                        }}
                        title="Clique para copiar"
                      >
                        http://{window.location.hostname}:5173{p.accessUrl}
                      </div>
                      <button 
                        onClick={() => onOpenQRCode(`http://${window.location.hostname}:5173${p.accessUrl}`, p.characterName)}
                        className="px-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Gerar QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* LAYOUT HORIZONTAL (lg e acima) */}
                <div className="hidden lg:flex overflow-visible">
                  {/* Seção Esquerda: Avatar Grande */}
                  <div className="relative w-40 xl:w-36 shrink-0 overflow-hidden rounded-l-xl">
                    <div className="relative w-full h-full bg-black/50 overflow-hidden group">
                      {p.photo ? (
                        <img src={getImageUrl(p.photo)} className={imgClasses} alt={p.characterName} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <User size={56} className="xl:w-16 xl:h-16" />
                        </div>
                      )}
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
                      {conditions.includes('poisoned') && (
                        <div className="absolute inset-0 bg-green-500/30 animate-pulse pointer-events-none" />
                      )}
                      {conditions.includes('charmed') && (
                        <div className="absolute inset-0 bg-pink-500/20 animate-pulse pointer-events-none" />
                      )}

                      {/* Info sobre a imagem */}
                      <div className="absolute top-2 left-2 right-2">
                        <h3 className="font-bold text-sm xl:text-base text-white drop-shadow-lg truncate leading-tight mb-0.5">
                          {p.characterName || 'Sem nome'}
                        </h3>
                        <p className="text-[10px] xl:text-xs text-zinc-300 drop-shadow-lg truncate leading-tight">
                          {p.playerName}
                        </p>
                      </div>

                      {/* HP Badge */}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Heart size={14} className="text-red-400 fill-red-400" />
                            <span className="text-xs text-zinc-400">HP</span>
                          </div>
                          <span className="text-sm font-bold text-white">{p.currentHp} / {p.maxHp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Direita: Controles */}
                  <div className="flex-1 flex flex-col min-w-0 overflow-visible">
                    {/* Header com Botões de Ação */}
                    <div className="flex items-center justify-between px-3 py-2 bg-black/30 border-b border-white/10">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        Controles
                      </div>
                      {/* Botões de Ação - SEMPRE VISÍVEL */}
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => onOpenInventory(p)}
                          className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Inventário"
                        >
                          <Backpack size={14} />
                        </button>
                        <button 
                          onClick={() => onEditPlayer(p)}
                          className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => window.confirm('Remover jogador?') && deletePlayer(activeScene.id, p.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Condições - Z-INDEX MUITO ALTO */}
                    <div className="relative z-[200] px-3 py-2 bg-black/20 border-b border-white/10 overflow-visible">
                      <ConditionsBar 
                        conditions={conditions} 
                        onToggle={(cId) => onTogglePlayerCondition(p.id, cId)} 
                      />
                    </div>

                    {/* HP e Controles */}
                    <div className="flex-1 px-3 py-3 xl:px-4 xl:py-4 space-y-3 overflow-visible">
                      {/* Botões de Ajuste HP - 2 LINHAS */}
                      <div>
                        <div className="text-[9px] xl:text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
                          Ajustar HP
                        </div>
                        <div className="space-y-1.5">
                          {/* Linha 1: Dano */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {[-10, -5, -1].map(v => (
                              <button 
                                key={v}
                                onClick={() => updatePlayerHp(activeScene.id, p.id, v)}
                                className="py-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-lg text-xs xl:text-sm font-bold border border-red-900/50 transition-all hover:scale-105 active:scale-95"
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          {/* Linha 2: Cura */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {[1, 5, 10].map(v => (
                              <button 
                                key={v}
                                onClick={() => updatePlayerHp(activeScene.id, p.id, v)}
                                className="py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 rounded-lg text-xs xl:text-sm font-bold border border-emerald-900/50 transition-all hover:scale-105 active:scale-95"
                              >
                                +{v}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Link e QR */}
                      <div className="flex gap-1.5">
                        <div 
                          className="flex-1 bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 text-[10px] text-zinc-500 font-mono truncate cursor-pointer hover:bg-black/60 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(`http://${window.location.hostname}:5173${p.accessUrl}`);
                            toast.success('Link copiado!');
                          }}
                          title="Clique para copiar"
                        >
                          {window.location.hostname}:5173{p.accessUrl}
                        </div>
                        <button 
                          onClick={() => onOpenQRCode(`http://${window.location.hostname}:5173${p.accessUrl}`, p.characterName)}
                          className="px-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
                          title="Gerar QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Botão Adicionar Jogador */}
          <button 
            onClick={onAddPlayer}
            className="w-full min-h-[180px] lg:min-h-[200px] border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all hover:bg-white/5 gap-2 xl:gap-3"
          >
            <Plus size={32} className="xl:w-10 xl:h-10" />
            <span className="text-xs xl:text-sm uppercase font-bold tracking-widest">Novo Jogador</span>
          </button>
        </div>
      </section>

      {/* SEÇÃO: MOBS */}
      <section>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 xl:mb-5">
          <div>
            <h2 className="text-xl xl:text-2xl font-black tracking-tight text-zinc-100 uppercase leading-none mb-1">
              Arena
            </h2>
            <p className="text-xs xl:text-sm text-zinc-500">
              {activeScene?.mobs?.length || 0} mob{activeScene?.mobs?.length !== 1 ? 's' : ''} na cena
            </p>
          </div>
          <button 
            onClick={onAddMob}
            className="h-9 xl:h-10 w-9 xl:w-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-400/30 text-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-red-500/20"
          >
            <Plus size={18} className="xl:w-5 xl:h-5" />
          </button>
        </div>

        {/* Grid de Mobs - BREAKPOINTS AJUSTADOS */}
        <div className="grid grid-cols-1 min-[800px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 xl:gap-4">
          {(activeScene?.mobs || []).map((mob) => (
            <MobCard 
              key={mob.id}
              mob={mob} 
              onUpdate={(mobId, delta) => updateMobHp(activeScene.id, mobId, delta)} 
              onDelete={(mobId) => window.confirm(`Remover ${mob.name}?`) && deleteMob(activeScene.id, mobId)}
              onEdit={(mob) => onEditMob(mob)}
              onToggleCondition={(mobId, cId) => onToggleMobCondition(mobId, cId)}
              onOpenInventory={() => onOpenMobInventory(mob)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
