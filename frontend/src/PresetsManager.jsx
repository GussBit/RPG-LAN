import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Save, Users, Skull } from 'lucide-react';
import { useGameStore } from './store';
import { toast } from 'react-toastify';

export default function PresetsManager({ open, onClose, type, onUse }) {
  const [presets, setPresets] = useState([]);
  const { fetchPresets, deletePreset } = useGameStore();

  const loadPresets = useCallback(async () => {
    const data = await fetchPresets(type);
    setPresets(data);
  }, [fetchPresets, type]);

  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open, loadPresets]);

  const handleDelete = async (presetId) => {
    if (!window.confirm('Excluir este preset?')) return;
    
    try {
      await deletePreset(type, presetId);
      toast.success('Preset excluído!');
      loadPresets();
    } catch (error) {
      console.error('Erro ao excluir preset:', error);
      toast.error('Erro ao excluir');
    }
  };

  if (!open) return null;

  const isMob = type === 'mobs';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {isMob ? <Skull size={18} /> : <Users size={18} />}
            <span className="text-sm font-extrabold tracking-widest text-zinc-200 uppercase">
              Presets de {isMob ? 'Mobs' : 'Jogadores'}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="relative group rounded-xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-indigo-400/30 transition cursor-pointer p-4"
                onClick={() => {
                  onUse?.(preset);
                  onClose();
                }}
              >
                <div className="text-sm font-bold text-zinc-200 mb-2 truncate">
                  {preset.name || preset.characterName}
                </div>
                
                {isMob ? (
                  <div className="text-xs text-zinc-500 space-y-1">
                    <div>HP: {preset.maxHp}</div>
                    <div>Dano: {preset.damageDice}</div>
                    <div>Cor: {preset.color}</div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 space-y-1">
                    <div>Player: {preset.playerName}</div>
                    <div>HP: {preset.maxHp}</div>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(preset.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-950/80 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {presets.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              Nenhum preset salvo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
