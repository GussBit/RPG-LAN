import React, { useState } from 'react';
import { X, Shield, Heart, Swords, Target, Backpack, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useGameStore } from '../../store';
import { getImageUrl } from '../../constants';
import EditableField from './EditableField';
import ConditionsBar from '../players/ConditionsBar';
import Compendium from '../Compendium';
import MediaGallery from '../../MediaGallery';

export default function CharacterSheetModal({ entity, type, onClose }) {
  const { updateCharacterField, activeScene, updateMob, updatePlayer } = useGameStore();
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (!entity) return null;

  const handleUpdate = (field, value) => {
    updateCharacterField(type, entity.id, field, value);
  };

  // Handlers de Inventário
  const handleAddItem = async (item) => {
    const currentInv = entity.inventory || [];
    const newItem = { ...item, quantity: 1 };
    handleUpdate('inventory', [...currentInv, newItem]);
  };

  const handleRemoveItem = (index) => {
    if(!window.confirm("Remover item?")) return;
    const newInv = [...(entity.inventory || [])];
    newInv.splice(index, 1);
    handleUpdate('inventory', newInv);
  };

  const handleUpdateItem = (index, field, value) => {
    const newInv = [...(entity.inventory || [])];
    newInv[index] = { ...newInv[index], [field]: value };
    handleUpdate('inventory', newInv);
  };

  // Handlers de Condição
  const handleToggleCondition = (conditionId) => {
      const current = entity.conditions || [];
      const newConditions = current.includes(conditionId) 
        ? current.filter(c => c !== conditionId)
        : [...current, conditionId];
      handleUpdate('conditions', newConditions);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-6 animate-in fade-in duration-200">
      
      {/* Container Principal - Tablet First */}
      <div className="w-full h-full md:h-[90vh] md:max-w-6xl bg-zinc-900 md:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* 1. Header Fixo */}
        <div className="h-16 shrink-0 border-b border-white/10 bg-zinc-950/50 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-3 h-3 rounded-full ${type === 'player' ? 'bg-blue-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
            <EditableField 
              value={entity.name || entity.characterName} 
              onSave={(val) => handleUpdate(type === 'player' ? 'characterName' : 'name', val)}
              className="font-black text-xl md:text-2xl text-white truncate min-w-[200px]"
            />
            {type === 'player' && (
                <EditableField 
                    value={entity.playerName} 
                    onSave={(val) => handleUpdate('playerName', val)}
                    className="text-sm text-zinc-500 hidden md:block"
                    placeholder="Nome do Jogador"
                />
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[40%_35%_25%] h-full min-h-min">
            
            {/* COLUNA 1: Imagem e Stats Visuais */}
            <div className="relative group min-h-[300px] md:h-full bg-black/40 border-b md:border-b-0 md:border-r border-white/10">
              {entity.image || entity.photo ? (
                <img 
                  src={getImageUrl(entity.image || entity.photo)} 
                  className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-40 transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <ImageIcon size={64} />
                </div>
              )}
              
              {/* Overlay de Edição de Imagem */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/20 backdrop-blur-[2px]"
                onClick={() => setGalleryOpen(true)}
              >
                <div className="bg-black/80 px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 border border-white/20">
                  <ImageIcon size={16} /> Alterar Imagem
                </div>
              </div>

              {/* Stats Sobrepostos (Mobile/Tablet) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-12">
                 <div className="flex items-end justify-between gap-4">
                    {/* HP */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase">Pontos de Vida</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleUpdate('currentHp', (entity.currentHp||0) - 1)} className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded flex items-center justify-center">-</button>
                                <button onClick={() => handleUpdate('currentHp', (entity.currentHp||0) + 1)} className="w-6 h-6 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded flex items-center justify-center">+</button>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <EditableField 
                                value={entity.currentHp} 
                                type="number" 
                                onSave={(v) => handleUpdate('currentHp', v)}
                                className="text-4xl font-black text-white leading-none"
                            />
                            <span className="text-zinc-500 text-xl">/</span>
                            <EditableField 
                                value={entity.maxHp} 
                                type="number" 
                                onSave={(v) => handleUpdate('maxHp', v)}
                                className="text-xl font-bold text-zinc-500"
                            />
                        </div>
                        {/* Barra de HP */}
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, ((entity.currentHp||0) / (entity.maxHp||1)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* AC */}
                    <div className="bg-zinc-800/80 p-3 rounded-xl border border-white/10 text-center min-w-[80px]">
                        <Shield size={20} className="mx-auto text-zinc-400 mb-1" />
                        <EditableField 
                            value={entity.ac || 10} 
                            type="number" 
                            onSave={(v) => handleUpdate('ac', v)}
                            className="text-2xl font-black text-white block"
                        />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">CA</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* COLUNA 2: Combate e Detalhes */}
            <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Grid de Combate */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Swords size={16} />
                            <span className="text-xs font-bold uppercase">Dano Base</span>
                        </div>
                        <EditableField 
                            value={entity.damageDice} 
                            placeholder="ex: 1d6+2"
                            onSave={(v) => handleUpdate('damageDice', v)}
                            className="text-lg font-bold text-indigo-300"
                        />
                    </div>
                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Target size={16} />
                            <span className="text-xs font-bold uppercase">Acerto</span>
                        </div>
                        <EditableField 
                            value={entity.toHit} 
                            type="number"
                            placeholder="+0"
                            onSave={(v) => handleUpdate('toHit', v)}
                            className="text-lg font-bold text-emerald-300"
                            prefix="+"
                        />
                    </div>
                </div>

                {/* Condições */}
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Condições</h3>
                    <ConditionsBar 
                        conditions={entity.conditions || []} 
                        onToggle={handleToggleCondition}
                        size="md" // Assumindo que ConditionsBar suporta ou ignora
                    />
                </div>

                {/* Descrição / Notas */}
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Anotações / Papel</h3>
                    <EditableField 
                        value={entity.notes || ''} 
                        type="textarea"
                        placeholder="Descreva o comportamento, táticas ou itens importantes..."
                        onSave={(v) => handleUpdate('notes', v)}
                        className="text-sm text-zinc-300 leading-relaxed"
                    />
                </div>
            </div>

            {/* COLUNA 3: Inventário (Sidebar em Desktop, abaixo em Tablet) */}
            <div className="bg-zinc-950/30 border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-full min-h-[300px]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                        <Backpack size={18} /> Inventário
                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                            {(entity.inventory || []).length}
                        </span>
                    </h3>
                    <button 
                        onClick={() => setCompendiumOpen(true)}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                        title="Adicionar Item"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {(entity.inventory || []).map((item, idx) => (
                        <div key={idx} className="group flex items-start gap-2 p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/80 border border-white/5 transition-all">
                            <div className="mt-1 w-1 h-full bg-indigo-500/50 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <EditableField 
                                    value={item.nome} 
                                    onSave={(v) => handleUpdateItem(idx, 'nome', v)}
                                    className="font-bold text-sm text-zinc-200 truncate"
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-zinc-500 uppercase">Qtd:</span>
                                    <EditableField 
                                        value={item.quantity || 1} 
                                        type="number"
                                        onSave={(v) => handleUpdateItem(idx, 'quantity', v)}
                                        className="text-xs font-mono text-zinc-300 bg-black/30 px-1 rounded"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveItem(idx)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {(entity.inventory || []).length === 0 && (
                        <div className="text-center py-8 text-zinc-600 text-sm italic">
                            Inventário vazio
                        </div>
                    )}
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modais Auxiliares */}
      <Compendium 
        open={compendiumOpen} 
        onClose={() => setCompendiumOpen(false)} 
        onAddItem={handleAddItem}
        isGM={true}
      />
      
      <MediaGallery 
        open={galleryOpen} 
        onClose={() => setGalleryOpen(false)} 
        type="images" 
        onSelect={(url) => {
            handleUpdate(type === 'player' ? 'photo' : 'image', url);
            setGalleryOpen(false);
        }} 
      />

    </div>
  );
}
