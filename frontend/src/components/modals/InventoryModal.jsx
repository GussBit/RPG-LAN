import React, { useState } from 'react';
import { X, Trash2, Plus, Scroll, ChevronDown, ChevronUp, Backpack } from 'lucide-react';
import Modal from '../ui/Modal';

// Componente de Card de Item Compacto
function InventoryItemCard({ item, index, onRemove }) {
    const [expanded, setExpanded] = useState(false);
    
    // Extrai primeira linha de características (tipo, nível, escola)
    const firstCharLine = item.caracteristicas?.split('\n')[0] || '';
    
    return (
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all group">
            {/* Header Compacto - Sempre Visível */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-zinc-200 text-sm truncate">
                                {item.nome}
                            </h3>
                            {item.nome_ingles && (
                                <span className="text-[10px] text-indigo-400/60 font-mono truncate">
                                    {item.nome_ingles}
                                </span>
                            )}
                        </div>
                        
                        {/* Tags de Características */}
                        {firstCharLine && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {firstCharLine.split(',').slice(0, 3).map((tag, i) => (
                                    <span 
                                        key={i} 
                                        className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex gap-1 shrink-0">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title={expanded ? 'Recolher' : 'Ver Mais'}
                        >
                            {expanded ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}
                        </button>
                        <button
                            onClick={() => onRemove(index)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Detalhes Expandíveis */}
            {expanded && (
                <div className="px-3 pb-3 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                    {/* Características Completas */}
                    {item.caracteristicas && (
                        <div className="bg-black/20 rounded-lg p-2 mb-3 space-y-1 mt-3">
                            {item.caracteristicas.split('\n').slice(1).map((line, i) => {
                                const [key, val] = line.split(':');
                                if (!val) return null;
                                return (
                                    <div key={i} className="flex items-start gap-2 text-[10px]">
                                        <span className="font-bold text-zinc-500 uppercase tracking-wide min-w-[80px] shrink-0">
                                            {key.trim()}
                                        </span>
                                        <span className="text-zinc-300">
                                            {val.trim()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Descrição */}
                    <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-950/50 rounded-lg p-3 border-l-2 border-indigo-500/30">
                        {item.descricao}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function InventoryModal({ open, onClose, player, onRemoveItem, onOpenCompendium }) {
  if (!player) return null;

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <Backpack size={20} className="text-indigo-400" />
          <span>Inventário de {player.characterName}</span>
        </div>
      }
    >
      {/* Header com Info e Botão */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
        <div className="text-sm text-zinc-400">
          <span className="font-bold text-zinc-200">{player.inventory?.length || 0}</span> {(player.inventory?.length || 0) === 1 ? 'item' : 'itens'}
        </div>
        <button
          onClick={onOpenCompendium}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-105 shadow-lg shadow-indigo-900/30"
        >
          <Scroll size={14} /> Adicionar
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {(player.inventory || []).length === 0 && (
          <div className="text-center text-zinc-600 py-12 border-2 border-dashed border-zinc-800 rounded-xl">
            <Backpack className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Inventário vazio</p>
            <p className="text-xs text-zinc-700 mt-1">
              Clique em "Adicionar" para incluir itens
            </p>
          </div>
        )}
        
        {(player.inventory || []).map((item, idx) => (
          <InventoryItemCard
            key={idx}
            item={item}
            index={idx}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
    </Modal>
  );
}
