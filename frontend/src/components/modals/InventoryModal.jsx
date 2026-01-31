import React from 'react';
import { X, Trash2, Plus, Scroll } from 'lucide-react';
import Modal from '../ui/Modal';

export default function InventoryModal({ open, onClose, player, onRemoveItem, onOpenCompendium }) {
  if (!player) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Inventário de ${player.characterName}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-zinc-400">
          {player.inventory?.length || 0} itens
        </div>
        <button
          onClick={onOpenCompendium}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {(player.inventory || []).length === 0 && (
            <div className="text-center text-zinc-600 py-8 border-2 border-dashed border-zinc-800 rounded-xl">
                Inventário vazio.
            </div>
        )}
        {(player.inventory || []).map((item, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg flex justify-between items-start group hover:border-indigo-500/30 transition-colors">
            <div>
              <div className="font-bold text-zinc-200 text-sm">{item.nome}</div>
              <div className="text-xs text-indigo-400 font-mono">{item.nome_ingles}</div>
            </div>
            <button
              onClick={() => onRemoveItem(idx)}
              className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
