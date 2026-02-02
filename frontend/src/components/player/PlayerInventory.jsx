import React, { useState } from 'react';
import { Scroll, Backpack, Search, Grid3x3, LayoutGrid } from 'lucide-react';
import InventoryItemCard from './InventoryItemCard';
import ItemDetailsModal from '../modals/ItemDetailsModal';

export default function PlayerInventory({ 
  inventory, 
  onUpdateQuantity, 
  onRemove, 
  onOpenCompendium 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('playerInventoryViewMode') || 'expanded');

  const filteredInventory = (inventory || []).filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grid responsivo: 3 colunas no compacto, 2→3 no expandido
  const gridClasses = viewMode === 'compact' 
    ? 'grid-cols-3 gap-2 sm:gap-3'
    : 'grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3';

  // Recupera o item atualizado usando o índice
  const selectedItem = selectedItemIndex !== null ? (inventory || [])[selectedItemIndex] : null;

  // Wrappers para o Modal (Item -> Index)
  const handleModalQuantityUpdate = (item, newQty) => {
    if (selectedItemIndex !== null && inventory[selectedItemIndex]) {
      const currentItem = inventory[selectedItemIndex];
      const currentQty = currentItem.quantity || currentItem.quantidade || 1;
      const delta = newQty - currentQty;
      onUpdateQuantity(selectedItemIndex, delta);
    }
  };

  const handleModalRemove = (item) => {
    if (selectedItemIndex !== null) {
      onRemove(selectedItemIndex);
      setSelectedItemIndex(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Backpack className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            Grimório & Habilidades
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <button
            onClick={() => {
                const newMode = viewMode === 'compact' ? 'expanded' : 'compact';
                setViewMode(newMode);
                localStorage.setItem('playerInventoryViewMode', newMode);
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
          
          {/* Badge de contagem */}
          <span className="text-[10px] sm:text-xs text-zinc-400 bg-zinc-800/50 px-2 sm:px-3 py-1 rounded-full">
            {(inventory || []).length}
          </span>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      {(inventory || []).length > 0 && (
        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      )}

      {/* Grid de Itens - COM LARGURA MÁXIMA */}
      {filteredInventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center bg-zinc-900/50 rounded-xl border border-white/5 max-w-4xl mx-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Scroll className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mb-1">
            Seu inventário está vazio
          </p>
          <p className="text-zinc-600 text-[10px] sm:text-xs max-w-[200px]">
            Abra o compêndio para adicionar magias e habilidades
          </p>
        </div>
      ) : (
        <div className={`grid ${gridClasses} max-w-4xl mx-auto`}>
          {filteredInventory.map((item, idx) => (
            <InventoryItemCard
              key={item.id || idx}
              index={inventory.indexOf(item)} // Passa o índice real
              item={item}
              onClick={() => setSelectedItemIndex(inventory.indexOf(item))}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <ItemDetailsModal
        item={selectedItem}
        open={selectedItemIndex !== null}
        onClose={() => setSelectedItemIndex(null)}
        onRemove={handleModalRemove}
        onUpdateQuantity={handleModalQuantityUpdate}
      />
    </div>
  );
}
