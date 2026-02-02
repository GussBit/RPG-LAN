import React, { useState } from 'react';
import { Scroll, Backpack, Search, Plus, Grid3x3, LayoutGrid, X } from 'lucide-react';
import Modal from '../ui/Modal';
import InventoryItemCard from '../player/InventoryItemCard';
import ItemDetailsModal from './ItemDetailsModal';

export default function InventoryModal({ 
  open, 
  onClose, 
  player, 
  onRemoveItem, 
  onUpdateQuantity, 
  onToggleVisibility, 
  onOpenCompendium 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('gmInventoryViewMode') || 'expanded');

  if (!player) return null;

  const filteredInventory = (player.inventory || []).filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.descricao && item.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Grid responsivo: 3 colunas no modo compacto (mobile e desktop), 2 colunas no expandido (mobile) → 3 (desktop)
  const gridClasses = viewMode === 'compact' 
    ? 'grid-cols-3 gap-2 sm:gap-3'  // 3 colunas sempre no compacto
    : 'grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3'; // 2→3 no expandido

  const selectedItem = selectedItemIndex !== null ? (player.inventory || [])[selectedItemIndex] : null;

  // Wrappers para o Modal (Item -> Index)
  const handleModalQuantityUpdate = (item, newQty) => {
    if (selectedItemIndex !== null && player.inventory && player.inventory[selectedItemIndex]) {
      const currentItem = player.inventory[selectedItemIndex];
      const currentQty = currentItem.quantity || currentItem.quantidade || 1;
      const delta = newQty - currentQty;
      onUpdateQuantity(selectedItemIndex, delta);
    }
  };

  const handleModalRemove = (item) => {
    if (selectedItemIndex !== null) {
      onRemoveItem(selectedItemIndex);
      setSelectedItemIndex(null);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg">
        {/* Header Fixo com Close e Título */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Backpack className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {player.characterName || player.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                {player.inventory?.length || 0} {(player.inventory?.length || 0) === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Toggle View Mode */}
            <button
              onClick={() => {
                  const newMode = viewMode === 'compact' ? 'expanded' : 'compact';
                  setViewMode(newMode);
                  localStorage.setItem('gmInventoryViewMode', newMode);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/10 rounded-lg flex items-center justify-center transition-colors"
              title={viewMode === 'compact' ? 'Visão Expandida' : 'Visão Compacta'}
            >
              {viewMode === 'compact' ? (
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              ) : (
                <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              )}
            </button>

            {/* Botão Adicionar */}
            <button
              onClick={onOpenCompendium}
              className="flex items-center gap-1 sm:gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-[10px] sm:text-xs font-medium"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar no inventário..."
            className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Grid de Itens */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pb-2">
          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Scroll className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium mb-1">Inventário vazio</p>
              <p className="text-zinc-600 text-[10px] sm:text-xs">
                Clique em "Adicionar" para incluir itens
              </p>
            </div>
          ) : (
            <div className={`grid ${gridClasses}`}>
              {filteredInventory.map((item, idx) => (
                <InventoryItemCard
                  key={item.id || idx}
                  index={(player.inventory || []).indexOf(item)}
                  item={item}
                  onClick={() => setSelectedItemIndex((player.inventory || []).indexOf(item))}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Detalhes */}
      <ItemDetailsModal
        item={selectedItem}
        open={selectedItemIndex !== null}
        onClose={() => setSelectedItemIndex(null)}
        onRemove={handleModalRemove}
        onUpdateQuantity={handleModalQuantityUpdate}
        onToggleVisibility={onToggleVisibility}
      />
    </>
  );
}
