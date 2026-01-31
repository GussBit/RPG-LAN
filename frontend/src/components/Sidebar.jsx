import React from 'react';
import { Map as MapIcon, Users, Skull, Plus, Trash2 } from 'lucide-react';
import SceneCard from './scenes/SceneCard';
import { getImageUrl } from '../constants';

export default function Sidebar({
  mode, setMode,
  scenes, activeScene, onSelectScene, onDuplicateScene, onDeleteScene, onEditScene, onOpenMap, onAddScene,
  presets, onAddPreset, onDeletePreset
}) {
  return (
    <aside className="border-r border-white/5 bg-zinc-900/25 backdrop-blur-md flex flex-col overflow-hidden shrink-0 h-full">
      {/* Tabs */}
      <div className="flex items-center p-2 gap-1 border-b border-white/5 bg-black/20">
         <button onClick={() => setMode('scenes')} className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${mode === 'scenes' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`} title="Cenas"><MapIcon size={18} /></button>
         <button onClick={() => setMode('players')} className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${mode === 'players' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`} title="Jogadores (Presets)"><Users size={18} /></button>
         <button onClick={() => setMode('mobs')} className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${mode === 'mobs' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`} title="Mobs (Presets)"><Skull size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {mode === 'scenes' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black tracking-tight text-zinc-100 uppercase">Cenas</div>
              <button onClick={onAddScene} className="h-8 w-8 rounded-full bg-indigo-500/20 hover:bg-indigo-500/25 border border-indigo-400/20 text-indigo-200 flex items-center justify-center"><Plus size={16} /></button>
            </div>
            <div className="space-y-3">
              {(scenes || []).map((scene) => (
                <SceneCard
                  key={scene.id} scene={scene} isActive={scene.id === activeScene?.id}
                  onSelect={() => onSelectScene(scene.id)}
                  onDuplicate={() => onDuplicateScene(scene.id)}
                  onDelete={() => onDeleteScene(scene.id)}
                  onEdit={() => onEditScene(scene)}
                  onOpenMap={() => onOpenMap(scene.id)}
                />
              ))}
            </div>
          </>
        )}
        
        {mode === 'players' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black tracking-tight text-zinc-100 uppercase">Jogadores</div>
              <div className="text-[10px] text-zinc-500">Clique para adicionar</div>
            </div>
            <div className="space-y-2">
              {(presets.players || []).map((p) => (
                <div key={p.id} onClick={() => onAddPreset('players', p)} className="group flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer transition-all">
                    <div className="h-10 w-10 rounded-full bg-black/50 overflow-hidden shrink-0 border border-white/10">
                      {p.photo ? <img src={getImageUrl(p.photo)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">Foto</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-zinc-200 truncate text-sm">{p.characterName}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{p.playerName} • HP {p.maxHp}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDeletePreset('players', p.id); }} className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {mode === 'mobs' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-black tracking-tight text-zinc-100 uppercase">Bestiário</div>
              <div className="text-[10px] text-zinc-500">Clique para invocar</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(presets.mobs || []).map((m) => (
                <div key={m.id} onClick={() => onAddPreset('mobs', m)} className="group relative p-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 cursor-pointer transition-all flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-lg bg-black/50 overflow-hidden mb-2 border border-white/10">
                      {m.image ? <img src={getImageUrl(m.image)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Skull size={20} /></div>}
                    </div>
                    <div className="font-bold text-zinc-300 text-xs truncate w-full">{m.name}</div>
                    <div className="text-[10px] text-zinc-500">HP {m.maxHp}</div>
                    <button onClick={(e) => { e.stopPropagation(); onDeletePreset('mobs', m.id); }} className="absolute top-1 right-1 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}