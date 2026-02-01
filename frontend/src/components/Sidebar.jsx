import React, { useState } from 'react';
import { Map as MapIcon, Users, Skull, Plus, Trash2, Image as ImageIcon, Swords, Heart, Settings, MapPin, Copy, Edit2, Ship } from 'lucide-react';
import { getImageUrl } from '../constants';

export default function Sidebar({
  scenes, 
  activeScene, 
  onSelectScene, 
  onDuplicateScene, 
  onDeleteScene, 
  onEditScene, 
  onOpenMap, 
  onAddScene,
  presets, 
  onAddPreset, 
  onDeletePreset
}) {
  const [mode, setMode] = useState('scenes');

  return (
    <aside className="relative z-30 border-r border-white/10 bg-gradient-to-b from-zinc-900/40 via-zinc-900/30 to-zinc-900/40 backdrop-blur-xl flex flex-col overflow-hidden shrink-0 h-full min-h-0">
      
      {/* Header com Tabs */}
      <div className="relative overflow-hidden border-b border-white/10">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
        
        {/* Tabs com padding individual */}
        <div className="relative flex items-center gap-1 px-2 pt-2 pb-2 xl:gap-1.5 xl:px-2.5 xl:pt-2.5 xl:pb-2.5">
          <button 
            onClick={() => setMode('scenes')} 
            className={`group flex-1 py-2 px-2 xl:py-2.5 xl:px-3 rounded-lg xl:rounded-xl flex items-center justify-center gap-1.5 xl:gap-2 transition-all duration-300 ${
              mode === 'scenes' 
                ? 'bg-indigo-500/30 text-indigo-200 shadow-lg shadow-indigo-500/20 scale-105' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:scale-105'
            }`}
          >
            <MapIcon size={16} className="xl:w-[18px] xl:h-[18px]" />
            <span className="hidden lg:inline text-[10px] xl:text-xs font-bold uppercase tracking-wide">Cenas</span>
          </button>
          
          <button 
            onClick={() => setMode('players')} 
            className={`group flex-1 py-2 px-2 xl:py-2.5 xl:px-3 rounded-lg xl:rounded-xl flex items-center justify-center gap-1.5 xl:gap-2 transition-all duration-300 ${
              mode === 'players' 
                ? 'bg-emerald-500/30 text-emerald-200 shadow-lg shadow-emerald-500/20 scale-105' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:scale-105'
            }`}
          >
            <Users size={16} className="xl:w-[18px] xl:h-[18px]" />
            <span className="hidden lg:inline text-[10px] xl:text-xs font-bold uppercase tracking-wide">Players</span>
          </button>
          
          <button 
            onClick={() => setMode('mobs')} 
            className={`group flex-1 py-2 px-2 xl:py-2.5 xl:px-3 rounded-lg xl:rounded-xl flex items-center justify-center gap-1.5 xl:gap-2 transition-all duration-300 ${
              mode === 'mobs' 
                ? 'bg-red-500/30 text-red-200 shadow-lg shadow-red-500/20 scale-105' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:scale-105'
            }`}
          >
            <Skull size={16} className="xl:w-[18px] xl:h-[18px]" />
            <span className="hidden lg:inline text-[10px] xl:text-xs font-bold uppercase tracking-wide">Mobs</span>
          </button>

          <button 
            onClick={() => setMode('ships')} 
            className={`group flex-1 py-2 px-2 xl:py-2.5 xl:px-3 rounded-lg xl:rounded-xl flex items-center justify-center gap-1.5 xl:gap-2 transition-all duration-300 ${
              mode === 'ships' 
                ? 'bg-cyan-500/30 text-cyan-200 shadow-lg shadow-cyan-500/20 scale-105' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:scale-105'
            }`}
          >
            <Ship size={16} className="xl:w-[18px] xl:h-[18px]" />
            <span className="hidden lg:inline text-[10px] xl:text-xs font-bold uppercase tracking-wide">Navios</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Scrollável */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* MODO: CENAS */}
        {mode === 'scenes' && (
          <div className="px-3 pt-4 pb-4 xl:px-4 xl:pt-5 xl:pb-5">
            
            {/* Header da Seção com padding específico */}
            <div className="flex items-center justify-between mb-4 xl:mb-5">
              <div className="flex items-center gap-2 xl:gap-2.5">
                <div className="w-1 h-6 xl:h-7 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                <div>
                  <div className="text-base xl:text-lg font-black tracking-tight text-zinc-100 uppercase leading-none mb-1">
                    Cenas
                  </div>
                  <div className="text-[9px] xl:text-[10px] text-zinc-500 leading-none">
                    {scenes?.length || 0} cena{scenes?.length !== 1 ? 's' : ''} criada{scenes?.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <button 
                onClick={onAddScene} 
                className="h-8 xl:h-9 w-8 xl:w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 text-indigo-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                <Plus size={16} className="xl:w-[18px] xl:h-[18px]" />
              </button>
            </div>

            {/* Lista de Cenas com espaçamento individual */}
            <div className="space-y-3 xl:space-y-3.5">
              {(scenes || []).map((scene) => (
                <div 
                  key={scene.id} 
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    activeScene?.id === scene.id 
                      ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                      : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'
                  }`}
                  onClick={() => onSelectScene(scene.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${activeScene?.id === scene.id ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-zinc-800 border-white/10 text-zinc-500'}`}>
                       {scene.background ? (
                         <img src={getImageUrl(scene.background)} className="w-full h-full object-cover rounded-lg" alt="" />
                       ) : (
                         <MapPin size={18} />
                       )}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold text-sm truncate ${activeScene?.id === scene.id ? 'text-indigo-200' : 'text-zinc-300'}`}>{scene.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{scene.mobs?.length || 0} mobs • {scene.playlist?.length || 0} faixas</div>
                    </div>
                  </div>

                  {/* Ações da Cena (Hover) */}
                  <div className="flex items-center gap-1 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditScene(scene); }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-white/10 transition-colors"
                      title="Editar / Detalhes"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDuplicateScene(scene.id); }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-300 hover:bg-white/10 transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {scenes?.length === 0 && (
                <div className="text-center py-12 xl:py-16 px-4">
                  <MapIcon size={40} className="xl:w-12 xl:h-12 mx-auto text-zinc-700 mb-3" />
                  <p className="text-xs xl:text-sm text-zinc-500 mb-1">Nenhuma cena criada ainda</p>
                  <p className="text-[10px] xl:text-xs text-zinc-600">Clique no + para começar</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* MODO: JOGADORES */}
        {mode === 'players' && (
          <div className="px-3 pt-4 pb-4 xl:px-4 xl:pt-5 xl:pb-5">
            
            {/* Header da Seção */}
            <div className="flex items-center justify-between mb-4 xl:mb-5">
              <div className="flex items-center gap-2 xl:gap-2.5">
                <div className="w-1 h-6 xl:h-7 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <div>
                  <div className="text-base xl:text-lg font-black tracking-tight text-zinc-100 uppercase leading-none mb-1">
                    Jogadores
                  </div>
                  <div className="text-[9px] xl:text-[10px] text-emerald-400 leading-none">
                    Clique para adicionar à cena
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Jogadores com padding e margin individuais */}
            <div className="space-y-2 xl:space-y-2.5">
              {(presets.players || []).map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => onAddPreset('players', p)} 
                  className="group relative flex items-center gap-2.5 xl:gap-3 p-2.5 xl:p-3 rounded-xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-white/10 hover:border-emerald-500/50 hover:from-emerald-500/10 hover:to-emerald-600/5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  {/* Avatar com dimensões específicas */}
                  <div className="relative h-12 xl:h-14 w-12 xl:w-14 rounded-xl bg-black/50 overflow-hidden shrink-0 border-2 border-white/10 group-hover:border-emerald-500/50 transition-all">
                    {p.photo ? (
                      <img 
                        src={getImageUrl(p.photo)} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" 
                        alt={p.characterName}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Users size={24} className="xl:w-7 xl:h-7" />
                      </div>
                    )}
                    {/* Overlay com HP - padding específico */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-3 pb-1 px-1">
                      <div className="flex items-center gap-1 justify-center">
                        <Heart size={8} className="text-red-400 fill-red-400" />
                        <span className="text-[8px] xl:text-[9px] font-bold text-white">{p.maxHp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info com padding lateral específico */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-bold text-zinc-200 truncate text-xs xl:text-sm group-hover:text-emerald-200 transition-colors mb-0.5">
                      {p.characterName || 'Sem nome'}
                    </div>
                    <div className="text-[9px] xl:text-[10px] text-zinc-500 truncate">
                      {p.playerName}
                    </div>
                  </div>

                  {/* Botão Deletar com padding individual */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDeletePreset('players', p.id); 
                    }} 
                    className="p-1.5 xl:p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shrink-0"
                  >
                    <Trash2 size={14} className="xl:w-4 xl:h-4" />
                  </button>

                  {/* Indicador de Hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}

              {(presets.players || []).length === 0 && (
                <div className="text-center py-12 xl:py-16 px-4">
                  <Users size={40} className="xl:w-12 xl:h-12 mx-auto text-zinc-700 mb-3" />
                  <p className="text-xs xl:text-sm text-zinc-500 mb-1">Nenhum preset de jogador</p>
                  <p className="text-[10px] xl:text-xs text-zinc-600">Salve presets ao criar jogadores</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODO: MOBS */}
        {mode === 'mobs' && (
          <div className="px-3 pt-4 pb-4 xl:px-4 xl:pt-5 xl:pb-5">
            
            {/* Header da Seção */}
            <div className="flex items-center justify-between mb-4 xl:mb-5">
              <div className="flex items-center gap-2 xl:gap-2.5">
                <div className="w-1 h-6 xl:h-7 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                <div>
                  <div className="text-base xl:text-lg font-black tracking-tight text-zinc-100 uppercase leading-none mb-1">
                    Bestiário
                  </div>
                  <div className="text-[9px] xl:text-[10px] text-red-400 leading-none">
                    Clique para invocar
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Mobs com gap específico */}
            <div className="grid grid-cols-2 gap-2.5 xl:gap-3">
              {(presets.mobs || []).map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => onAddPreset('mobs', m)} 
                  className="group relative rounded-xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-white/10 hover:border-red-500/50 hover:from-red-500/10 hover:to-red-600/5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 flex flex-col items-center overflow-hidden"
                >
                  {/* Imagem/Ícone do Mob com padding top específico */}
                  <div className="relative w-full pt-2.5 xl:pt-3 px-2.5 xl:px-3">
                    <div className="relative h-20 xl:h-24 w-full rounded-xl bg-black/50 overflow-hidden border-2 border-white/10 group-hover:border-red-500/50 transition-all">
                      {m.image ? (
                        <img 
                          src={getImageUrl(m.image)} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" 
                          alt={m.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 group-hover:text-red-500/50 transition-colors">
                          <Skull size={32} className="xl:w-10 xl:h-10" />
                        </div>
                      )}
                      
                      {/* Badge de HP com padding individual */}
                      <div className="absolute top-1.5 left-1.5 bg-black/90 backdrop-blur-sm px-1.5 py-1 rounded-md border border-white/20">
                        <div className="flex items-center gap-1">
                          <Heart size={8} className="text-red-400 fill-red-400" />
                          <span className="text-[9px] xl:text-[10px] font-bold text-white leading-none">{m.maxHp}</span>
                        </div>
                      </div>

                      {/* Badge de Ataque com padding individual */}
                      {m.toHit !== undefined && (
                        <div className="absolute top-1.5 right-1.5 bg-black/90 backdrop-blur-sm px-1.5 py-1 rounded-md border border-white/20">
                          <div className="flex items-center gap-0.5">
                            <Swords size={8} className="text-amber-400" />
                            <span className="text-[9px] xl:text-[10px] font-bold text-white leading-none">+{m.toHit}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nome e Info com padding específico */}
                  <div className="w-full text-center px-2.5 xl:px-3 pt-2 pb-2.5 xl:pb-3">
                    <div className="font-bold text-zinc-300 text-[11px] xl:text-xs truncate group-hover:text-red-200 transition-colors mb-0.5 leading-tight">
                      {m.name}
                    </div>
                    <div className="text-[9px] xl:text-[10px] text-zinc-600 truncate leading-tight">
                      {m.damageDice || 'Sem dano'}
                    </div>
                  </div>

                  {/* Botão Deletar com posicionamento específico */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDeletePreset('mobs', m.id); 
                    }} 
                    className="absolute top-2 right-2 p-1 xl:p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/90 backdrop-blur-sm rounded-lg hover:scale-110 border border-white/10"
                  >
                    <Trash2 size={10} className="xl:w-3 xl:h-3" />
                  </button>

                  {/* Indicador de Hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 via-red-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}

              {(presets.mobs || []).length === 0 && (
                <div className="col-span-2 text-center py-12 xl:py-16 px-4">
                  <Skull size={40} className="xl:w-12 xl:h-12 mx-auto text-zinc-700 mb-3" />
                  <p className="text-xs xl:text-sm text-zinc-500 mb-1">Bestiário vazio</p>
                  <p className="text-[10px] xl:text-xs text-zinc-600">Salve presets ao criar mobs</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODO: NAVIOS */}
        {mode === 'ships' && (
          <div className="px-3 pt-4 pb-4 xl:px-4 xl:pt-5 xl:pb-5">
            <div className="flex items-center justify-between mb-4 xl:mb-5">
              <div className="flex items-center gap-2 xl:gap-2.5">
                <div className="w-1 h-6 xl:h-7 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                <div>
                  <div className="text-base xl:text-lg font-black tracking-tight text-zinc-100 uppercase leading-none mb-1">
                    Estaleiro
                  </div>
                  <div className="text-[9px] xl:text-[10px] text-cyan-400 leading-none">
                    Navios salvos
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 xl:space-y-2.5">
              {(presets.ships || []).map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => onAddPreset('ships', s)} 
                  className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-br from-emerald-900/60 to-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400/50 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <div className="relative h-10 w-10 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-emerald-500/30">
                    {s.image ? <img src={getImageUrl(s.image)} className="w-full h-full object-cover" /> : <Ship size={20} className="m-auto text-emerald-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-emerald-100 text-xs truncate">{s.name}</div>
                    <div className="text-[10px] text-emerald-400/70">HP: {s.maxHp} • Moral: {s.maxMorale}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeletePreset('ships', s.id); }} 
                    className="p-1.5 text-emerald-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(presets.ships || []).length === 0 && (
                <div className="text-center py-10 text-zinc-600 text-xs">
                  <Ship size={32} className="mx-auto mb-2 opacity-20" />
                  Nenhum navio salvo.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
