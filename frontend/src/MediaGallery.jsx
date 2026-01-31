import React, { useEffect, useState } from 'react';
import { X, Upload, Music, Trash2, Check } from 'lucide-react';
import { useGameStore } from './store';
import PillButton from './components/ui/PillButton';
import { BACKEND_URL, getImageUrl } from './constants';

export default function MediaGallery({ open, onClose, type = 'images', onSelect }) {
  // Adicionado deleteFromGallery aqui
  const { gallery, fetchGallery, deleteFromGallery } = useGameStore();
  const [activeTab, setActiveTab] = useState(type);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { 
      if (open) {
          fetchGallery(); 
          setActiveTab(type);
      }
  }, [open, type, fetchGallery]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = activeTab === 'images' ? '/api/upload/image' : '/api/upload/audio';
    
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { method: 'POST', body: formData });
      if (res.ok) {
        await fetchGallery(); 
        const data = await res.json();
        const url = data.url; 
        if (onSelect) onSelect(url, data.name || file.name);
      }
    } catch (err) { console.error(err); } 
    finally { setUploading(false); }
  };

  // Função para deletar item
  const handleDelete = async (e, itemName) => {
    e.stopPropagation(); // Impede que o clique selecione a imagem/audio
    if (window.confirm(`Tem certeza que deseja excluir "${itemName}" permanentemente?`)) {
        await deleteFromGallery(activeTab, itemName);
    }
  };

  if (!open) return null;

  const items = (activeTab === 'images' ? gallery?.images : gallery?.audio) || [];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-widest text-zinc-100 uppercase">Galeria</h2>
            <div className="flex bg-black/30 p-1 rounded-lg">
              <button onClick={() => setActiveTab('images')} className={`px-3 py-1 rounded-md text-sm transition ${activeTab === 'images' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300'}`}>Imagens</button>
              <button onClick={() => setActiveTab('audio')} className={`px-3 py-1 rounded-md text-sm transition ${activeTab === 'audio' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300'}`}>Áudio</button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><X size={20} /></button>
        </div>

        {/* Upload Area */}
        <div className="p-4 bg-zinc-950/50 border-b border-white/10 flex justify-center">
          <label className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-600/30 cursor-pointer transition w-full justify-center border-dashed">
            <input type="file" className="hidden" accept={activeTab === 'images' ? "image/*" : "audio/*"} onChange={handleUpload} disabled={uploading} />
            <Upload size={18} />
            <span className="font-semibold">{uploading ? 'Enviando...' : `Upload ${activeTab === 'images' ? 'Imagem' : 'Áudio'}`}</span>
          </label>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {items.length === 0 && <div className="text-center text-zinc-500 py-10">Nenhum arquivo encontrado.</div>}
          
          {activeTab === 'images' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item, idx) => (
                <div key={item.id || idx} onClick={() => onSelect && onSelect(item.url, item.name)} className="group relative aspect-square bg-black/50 rounded-xl border border-white/5 overflow-hidden cursor-pointer hover:border-indigo-500/50 transition">
                  <img src={getImageUrl(item.url)} className="w-full h-full object-cover" loading="lazy" alt={item.name} />
                  
                  {/* Overlay com Nome */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 bg-black/80 rounded-full text-xs text-white truncate max-w-[90%]">{item.name}</span>
                  </div>

                  {/* Botão Deletar (Canto Superior Direito) */}
                  <button 
                    onClick={(e) => handleDelete(e, item.name)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
                    title="Excluir Imagem"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id || idx} onClick={() => onSelect && onSelect(item.url, item.name)} className="group flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 cursor-pointer transition">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Music size={20} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{item.name}</div>
                    <div className="text-xs text-zinc-500 truncate">{item.url}</div>
                  </div>
                  
                  {/* Botão Deletar Áudio */}
                  <button 
                    onClick={(e) => handleDelete(e, item.name)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Excluir Áudio"
                  >
                    <Trash2 size={16} />
                  </button>

                  {onSelect && <PillButton variant="neutral" className="px-2 py-1 h-8"><Check size={14} /></PillButton>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}