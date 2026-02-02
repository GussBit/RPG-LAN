import React from 'react';
import { Scroll, Backpack } from 'lucide-react';
import Modal from '../ui/Modal';
import InventoryItemCard from '../player/InventoryItemCard';

export default function InventoryModal({ open, onClose, player, onRemoveItem, onUpdateQuantity, onToggleVisibility, onOpenCompendium }) {
  if (!player) return null;

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <Backpack size={20} className="text-indigo-400" />
          <span>Inventário de {player.characterName || player.name}</span>
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
            onUpdateQuantity={onUpdateQuantity}
            onToggleVisibility={onToggleVisibility}
            isGM={true}
          />
        ))}
      </div>
    </Modal>
  );
}
