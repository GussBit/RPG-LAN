import React from 'react';
import { Scroll, Backpack } from 'lucide-react';
import InventoryItemCard from './InventoryItemCard';

export default function PlayerInventory({ inventory, onUpdateQuantity, onRemove, onOpenCompendium }) {
    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-300">
            {/* Header do Inventário */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                        <Scroll size={18} className="text-indigo-400 sm:w-5 sm:h-5"/> 
                        Grimório & Habilidades
                    </h2>
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                        {(inventory || []).length} {(inventory || []).length === 1 ? 'item' : 'itens'}
                    </p>
                </div>
                <button 
                    onClick={onOpenCompendium} 
                    className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors font-bold flex items-center gap-1.5"
                >
                    <Scroll size={14} />
                    Adicionar
                </button>
            </div>
            
            {/* Lista de Itens Compacta */}
            <div className="space-y-2">
                {(inventory || []).length === 0 && (
                    <div className="text-center text-zinc-600 py-12 sm:py-16 border-2 border-dashed border-zinc-800 rounded-xl">
                        <Backpack className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xs sm:text-sm">Seu inventário está vazio</p>
                        <p className="text-[10px] sm:text-xs text-zinc-700 mt-1">
                            Abra o compêndio para adicionar magias
                        </p>
                    </div>
                )}
                
                {(inventory || []).map((item, idx) => (
                    <InventoryItemCard
                        key={idx}
                        item={item}
                        index={idx}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}
