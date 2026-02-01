import React, { useEffect, useState, useRef } from 'react';
import { X, Upload, Music, Trash2, Check, Play, Pause, Search, Grid, List, Image, FileAudio } from 'lucide-react';
import { Howl } from 'howler';
import { useGameStore } from './store';
import PillButton from './components/ui/PillButton';
import { BACKEND_URL, getImageUrl } from './constants';

// Componente auxiliar para item de áudio
function AudioItem({ item, onSelect, onDelete, previewState, isSelected }) {
  const { playingName, setPlayingName, howlerRef } = previewState;
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPlaying = playingName === item.name;

  useEffect(() => {
    const audio = new Audio(getImageUrl(item.url));
    audio.preload = 'metadata';
    const onLoadedMetadata = () => {
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setLoading(false);
      }
    };
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', () => setLoading(false));
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.src = '';
    };
  }, [item.url]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      howlerRef.current?.stop();
      setPlayingName(null);
    } else {
      if (howlerRef.current) howlerRef.current.stop();
      const sound = new Howl({ 
        src: [getImageUrl(item.url)],
        html5: true,
        onend: () => setPlayingName(null)
      });
      howlerRef.current = sound;
      sound.play();
      setPlayingName(item.name);
    }
  };

  const formatTime = (secs) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(item.url, item.name)} 
      className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
        isSelected 
          ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20' 
          : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {/* Play Button */}
      <button 
        onClick={togglePlay} 
        className={`p-2.5 rounded-lg transition-all shrink-0 ${
          isPlaying 
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' 
            : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'
        }`}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-zinc-200 truncate mb-1">{item.name}</div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-zinc-400 bg-black/30 px-2 py-0.5 rounded">{formatTime(duration)}</span>
          {loading && <span className="text-zinc-600">Carregando...</span>}
        </div>
      </div>
      
      {/* Delete Button */}
      <button 
        onClick={(e) => onDelete(e, item.name)}
        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Excluir Áudio"
      >
        <Trash2 size={16} />
      </button>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
          <Check size={14} />
        </div>
      )}
    </div>
  );
}

export default function MediaGallery({ open, onClose, type = 'images', onSelect }) {
  const { gallery, fetchGallery, deleteFromGallery } = useGameStore();
  const [activeTab, setActiveTab] = useState(type);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [dragActive, setDragActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const howlerRef = useRef(null);
  const [playingName, setPlayingName] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    if (open) {
      fetchGallery(); 
      setActiveTab(type);
      setSearchQuery('');
    }
    
    return () => {
      if (howlerRef.current) howlerRef.current.stop();
      setPlayingName(null);
    };
  }, [open, type, fetchGallery]);
  
  useEffect(() => {
    if (howlerRef.current) {
      howlerRef.current.stop();
      setPlayingName(null);
    }
    setSearchQuery('');
    setSelectedItem(null);
  }, [activeTab]);

  const handleUpload = async (file) => {
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
        if (onSelect) {
          onSelect(url, data.name || file.name);
          setSelectedItem(data.name || file.name);
        }
      }
    } catch (err) { 
      console.error(err);
      alert('Erro ao fazer upload. Tente novamente.');
    } 
    finally { 
      setUploading(false); 
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    handleUpload(file);
  };

  // Drag and Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValidType = activeTab === 'images' 
        ? file.type.startsWith('image/') 
        : file.type.startsWith('audio/');
      
      if (isValidType) {
        handleUpload(file);
      } else {
        alert(`Por favor, envie apenas arquivos de ${activeTab === 'images' ? 'imagem' : 'áudio'}.`);
      }
    }
  };

  const handleDelete = async (e, itemName) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir "${itemName}" permanentemente?`)) {
      await deleteFromGallery(activeTab, itemName);
      if (selectedItem === itemName) setSelectedItem(null);
    }
  };

  const handleSelect = (url, name) => {
    setSelectedItem(name);
    if (onSelect) onSelect(url, name);
  };

  if (!open) return null;

  const items = (activeTab === 'images' ? gallery?.images : gallery?.audio) || [];
  
  // Filtrar items por busca
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              {activeTab === 'images' ? <Image size={20} className="text-indigo-400" /> : <FileAudio size={20} className="text-indigo-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Galeria de Mídia</h2>
              <p className="text-xs text-zinc-500">{filteredItems.length} {activeTab === 'images' ? 'imagens' : 'áudios'} disponíveis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs e Controles */}
        <div className="p-4 bg-zinc-950/50 border-b border-white/10 space-y-3">
          {/* Tabs */}
          <div className="flex bg-black/30 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('images')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'images' 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Image size={16} />
              Imagens
            </button>
            <button 
              onClick={() => setActiveTab('audio')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'audio' 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music size={16} />
              Áudio
            </button>
          </div>

          {/* Search e View Mode */}
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text"
                placeholder={`Buscar ${activeTab === 'images' ? 'imagens' : 'áudios'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-black/50 transition-all"
              />
            </div>

            {/* View Mode Toggle (apenas para imagens) */}
            {activeTab === 'images' && (
              <div className="flex bg-black/30 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                  title="Visualização em Grade"
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                  title="Visualização em Lista"
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Area com Drag and Drop */}
        <div 
          className={`p-4 bg-zinc-950/50 border-b border-white/10 transition-all ${dragActive ? 'bg-indigo-500/10 border-indigo-500' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label className={`flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragActive 
              ? 'bg-indigo-600/30 border-indigo-400 scale-[1.02]' 
              : uploading 
                ? 'bg-black/30 border-zinc-700 cursor-wait'
                : 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/20 hover:border-indigo-500/50'
          }`}>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept={activeTab === 'images' ? "image/*" : "audio/*"} 
              onChange={handleFileInput} 
              disabled={uploading} 
            />
            
            <div className={`p-3 rounded-full transition-all ${
              dragActive ? 'bg-indigo-500 scale-110' : 'bg-indigo-500/20'
            }`}>
              <Upload size={24} className={dragActive ? 'text-white' : 'text-indigo-400'} />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-200 mb-1">
                {uploading 
                  ? 'Enviando arquivo...' 
                  : dragActive 
                    ? 'Solte o arquivo aqui' 
                    : `Arraste e solte ou clique para enviar`
                }
              </p>
              <p className="text-xs text-zinc-500">
                {activeTab === 'images' ? 'Formatos: JPG, PNG, GIF, WebP' : 'Formatos: MP3, WAV, OGG'}
              </p>
            </div>
          </label>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                {activeTab === 'images' ? <Image size={32} className="text-zinc-600" /> : <Music size={32} className="text-zinc-600" />}
              </div>
              <p className="text-zinc-400 font-medium mb-1">
                {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum arquivo encontrado'}
              </p>
              <p className="text-xs text-zinc-600">
                {searchQuery ? 'Tente outro termo de busca' : 'Faça upload do seu primeiro arquivo'}
              </p>
            </div>
          )}
          
          {activeTab === 'images' ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredItems.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    onClick={() => handleSelect(item.url, item.name)} 
                    className={`group relative aspect-square rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      selectedItem === item.name 
                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]' 
                        : 'border-white/5 hover:border-white/20'
                    } ${onSelect ? 'cursor-pointer' : ''}`}
                  >
                    <img 
                      src={getImageUrl(item.url)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      loading="lazy" 
                      alt={item.name} 
                    />
                    
                    {/* Overlay com Nome */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="text-xs text-white font-medium truncate">{item.name}</span>
                    </div>

                    {/* Botão Deletar */}
                    <button 
                      onClick={(e) => handleDelete(e, item.name)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 z-10 shadow-lg"
                      title="Excluir Imagem"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Selected Indicator */}
                    {selectedItem === item.name && (
                      <div className="absolute top-2 left-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {filteredItems.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    onClick={() => handleSelect(item.url, item.name)} 
                    className={`group flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedItem === item.name 
                        ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20' 
                        : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                    } ${onSelect ? 'cursor-pointer' : ''}`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img src={getImageUrl(item.url)} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-200 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{item.url}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, item.name)}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Imagem"
                    >
                      <Trash2 size={16} />
                    </button>
                    {selectedItem === item.name && (
                      <div className="bg-indigo-500 text-white rounded-full p-1">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            // Audio List
            <div className="space-y-2">
              {filteredItems.map((item, idx) => (
                <AudioItem 
                  key={item.id || idx}
                  item={item}
                  onSelect={onSelect ? handleSelect : null}
                  onDelete={handleDelete}
                  previewState={{ playingName, setPlayingName, howlerRef }}
                  isSelected={selectedItem === item.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer com ações */}
        {onSelect && (
          <div className="p-4 border-t border-white/10 bg-zinc-950/50 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              {selectedItem ? `Selecionado: ${selectedItem}` : 'Selecione um arquivo'}
            </p>
            <div className="flex gap-2">
              <PillButton variant="neutral" onClick={onClose}>
                Cancelar
              </PillButton>
              <PillButton variant="primary" onClick={onClose} disabled={!selectedItem}>
                <Check size={16} />
                Confirmar
              </PillButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
