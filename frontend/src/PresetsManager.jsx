import React, { useEffect, useState } from 'react';
import { X, User, Trash2, Plus, Ghost, Map as MapIcon, Image as ImageIcon } from 'lucide-react';
import { useGameStore } from './store';
import PillButton from './components/ui/PillButton';
import { getImageUrl } from './constants';

export default function PresetsManager({ open, onClose, type = 'players' }) {
  const { fetchPresets, deletePreset, createPlayer, createMob, activeScene } = useGameStore();
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState(type);

  // Carrega os presets ao abrir ou trocar de aba
  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open, activeTab]);

  const loadPresets = async () => {
    const data = await fetchPresets(activeTab);
    setItems(data || []);
  };

  const handleAdd = async (preset) => {
    if (!activeScene) return;

    if (activeTab === 'players') {
      // Cria player usando os dados do preset (INCLUINDO O TOKEN)
      await createPlayer(preset);
      // Feedback visual ou toast poderia ser adicionado aqui
    } else if (activeTab === 'mobs') {
      await createMob(preset);
    }
    
    // Opcional: Fechar ao adicionar
    // onClose();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Excluir este preset permanentemente?')) {
      await deletePreset(activeTab, id);
      loadPresets(); // Recarrega lista
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-widest text-zinc-100 uppercase">Biblioteca de Presets</h2>
            <div className="flex bg-black/30 p-1 rounded-lg">
              <button onClick={() => setActiveTab('players')} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${activeTab === 'players' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <User size={14} /> Jogadores
              </button>
              <button onClick={() => setActiveTab('mobs')} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${activeTab === 'mobs' ? 'bg-red-500/20 text-red-300' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Ghost size={14} /> Mobs
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><X size={20} /></button>
        </div>

        {/* Lista de Presets */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 py-10 flex flex-col items-center gap-2">
              <Ghost size={40} className="opacity-20" />
              <span>Nenhum preset salvo nesta categoria.</span>
              <span className="text-xs text-zinc-600">Salve jogadores ou mobs existentes para que apareçam aqui.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-zinc-950/50 border border-white/5 rounded-xl overflow-hidden hover:border-indigo-500/50 transition flex flex-col">
                
                {/* Imagem / Avatar */}
                <div className="aspect-video bg-black/50 relative overflow-hidden">
                   {item.image || item.photo ? (
                      <img src={getImageUrl(item.image || item.photo)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        {activeTab === 'players' ? <User size={32} /> : <Ghost size={32} />}
                      </div>
                   )}
                   
                   {/* Botão Adicionar (Sobreposição) */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <PillButton onClick={() => handleAdd(item)} variant="primary" className="scale-90 hover:scale-100">
                        <Plus size={14} /> Adicionar
                      </PillButton>
                   </div>

                   {/* Botão Deletar */}
                   <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      title="Excluir Preset"
                   >
                      <Trash2 size={12} />
                   </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="font-bold text-zinc-200 truncate">{item.name || item.playerName}</div>
                  <div className="text-xs text-zinc-500 truncate">{item.characterName || 'Nível ?'}</div>
                  
                  {/* Status Rápido */}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                     <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">HP: {item.maxHp}</span>
                     {activeTab === 'players' && <span className="text-emerald-500">LINK SALVO</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}