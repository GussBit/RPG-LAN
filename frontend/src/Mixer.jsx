import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Howl, Howler } from 'howler';
import {
  Volume2, Play, Pause, Square, Wind, Zap, UploadCloud,
  Trash2, Music, SkipForward, SkipBack,
  Swords, Map as MapIcon, Trophy, GripVertical, Plus, Clock
} from 'lucide-react';
import { useGameStore } from './store';
import { getImageUrl } from './constants';

// --- COMPONENTES AUXILIARES ---

function Slider({ value, onChange, vertical = false, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center group ${vertical ? 'h-24 w-6 flex-col' : 'w-24 h-6'} ${className}`}>
       <div className={`relative bg-zinc-800 rounded-full overflow-hidden ${vertical ? 'w-1.5 h-full' : 'h-1.5 w-full'}`}>
          <div className="bg-indigo-500 absolute bottom-0 left-0 transition-all" 
               style={vertical ? { width: '100%', height: `${value * 100}%` } : { height: '100%', width: `${value * 100}%` }} />
       </div>
       <input
          type="range" min="0" max="1" step="0.01"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={vertical ? { writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } : {}}
       />
    </div>
  );
}

// --- LÓGICA DE ARRASTO ROBUSTA ---
// Verifica no clique se o alvo é a alça (handle). Se for, marca o elemento como arrastável.
const handleMouseDown = (e) => {
  e.currentTarget.dataset.dragEnabled = !!e.target.closest('.drag-handle');
};

const handleDragStart = (e, trackId) => {
  if (e.currentTarget.dataset.dragEnabled !== 'true') {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData('trackId', trackId);
};

// --- AMBIENTE (LOOPS) ---
function AmbienceTrack({ track, masterVolume, onDelete }) {
  const soundRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [localVolume, setLocalVolume] = useState(track.volume ?? 0.5);
  
  useEffect(() => {
    if (!track.url) return;
    
    if (!soundRef.current) {
        soundRef.current = new Howl({
            src: [getImageUrl(track.url)],
            html5: true,
            loop: true,
            volume: 0,
            onload: () => {
                 soundRef.current.play();
                 soundRef.current.fade(0, localVolume * masterVolume, 1000);
                 setPlaying(true);
            }
        });
    }

    if (soundRef.current && soundRef.current.playing()) {
        soundRef.current.volume(localVolume * masterVolume);
    }

    return () => {
        if (soundRef.current) {
            soundRef.current.fade(soundRef.current.volume(), 0, 500);
            setTimeout(() => soundRef.current.unload(), 500);
        }
    };
  }, [track.url]);

  useEffect(() => {
      if(soundRef.current) soundRef.current.volume(localVolume * masterVolume);
  }, [localVolume, masterVolume]);

  const togglePlay = () => {
      if (!soundRef.current) return;
      if (playing) {
          soundRef.current.fade(soundRef.current.volume(), 0, 500);
          setTimeout(() => { soundRef.current.pause(); setPlaying(false); }, 500);
      } else {
          soundRef.current.play();
          soundRef.current.fade(0, localVolume * masterVolume, 500);
          setPlaying(true);
      }
  };

  return (
    <div 
      draggable 
      onMouseDown={handleMouseDown}
      onDragStart={(e) => handleDragStart(e, track.id)} 
      className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/60 border border-white/5 hover:border-white/10 group"
    >
       <div className="drag-handle cursor-grab p-1 hover:bg-white/5 rounded"><GripVertical size={14} className="text-zinc-600" /></div>
       <button onClick={togglePlay} className={`p-2 rounded-full transition-colors ${playing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
       </button>
       <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-zinc-300 truncate">{track.name}</div>
          <Slider value={localVolume} onChange={setLocalVolume} className="!w-full !h-3 mt-1" />
       </div>
       <button onClick={() => onDelete(track.id)} className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
    </div>
  );
}

// --- MÚSICA (PLAYLIST SEQUENCIAL) ---
function MusicPlayer({ tracks, masterVolume, onUpdate, onDelete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const soundRef = useRef(null);
    
    const currentTrack = tracks[currentIndex];

    const playTrack = (index) => {
        if (index < 0 || index >= tracks.length) return;
        
        if (soundRef.current) {
            soundRef.current.stop();
            soundRef.current.unload();
        }

        const track = tracks[index];
        setCurrentIndex(index);
        setIsPlaying(true);

        soundRef.current = new Howl({
            src: [getImageUrl(track.url)],
            html5: true,
            volume: (track.volume ?? 0.5) * masterVolume,
            onend: () => {
                playTrack((index + 1) % tracks.length);
            }
        });
        soundRef.current.play();
    };

    const togglePlay = () => {
        if (!currentTrack) return;
        if (isPlaying) {
            soundRef.current?.pause();
            setIsPlaying(false);
        } else {
            if (!soundRef.current) playTrack(currentIndex);
            else { soundRef.current.play(); setIsPlaying(true); }
        }
    };

    const next = () => playTrack((currentIndex + 1) % tracks.length);
    const prev = () => playTrack((currentIndex - 1 + tracks.length) % tracks.length);

    useEffect(() => {
        if (soundRef.current) soundRef.current.volume((currentTrack?.volume ?? 0.5) * masterVolume);
    }, [masterVolume]);

    useEffect(() => {
        return () => { if (soundRef.current) soundRef.current.unload(); };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 mb-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-indigo-300 truncate flex-1 mr-2">
                        {currentTrack ? currentTrack.name : "Playlist Vazia"}
                    </div>
                    <div className="text-[10px] text-zinc-500">{currentIndex + 1} / {tracks.length}</div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <button onClick={prev} className="text-zinc-400 hover:text-white"><SkipBack size={16} /></button>
                    <button onClick={togglePlay} className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-zinc-700 text-zinc-400'}`}>
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" ml="2px" />}
                    </button>
                    <button onClick={next} className="text-zinc-400 hover:text-white"><SkipForward size={16} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-0">
                {tracks.map((track, idx) => (
                    <div 
                        key={track.id} 
                        draggable 
                        onMouseDown={handleMouseDown}
                        onDragStart={(e) => handleDragStart(e, track.id)}
                        onClick={() => playTrack(idx)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer group border border-transparent ${idx === currentIndex ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' : 'hover:bg-white/5 text-zinc-400'}`}
                    >
                        <div className="drag-handle cursor-grab p-1 hover:bg-white/5 rounded"><GripVertical size={12} className="text-zinc-600" /></div>
                        <div className="flex-1 truncate text-xs">{track.name}</div>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(track.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                ))}
                {tracks.length === 0 && <div className="text-xs text-zinc-600 text-center py-4 italic">Arraste músicas aqui</div>}
            </div>
        </div>
    );
}

// --- SFX ITEM (COM PULSO) ---
function SfxItem({ track, masterVolume, onDelete, onUpdate }) {
    const playSfx = () => {
        const sound = new Howl({ 
            src: [getImageUrl(track.url)], 
            volume: (track.volume ?? 0.5) * masterVolume 
        });
        sound.play();
    };

    // Lógica de Pulso (Loop a cada X segundos)
    useEffect(() => {
        let interval;
        if (track.pulseActive && track.pulseInterval > 0) {
            interval = setInterval(() => {
                playSfx();
            }, track.pulseInterval * 1000);
        }
        return () => clearInterval(interval);
    }, [track.pulseActive, track.pulseInterval, track.volume, masterVolume]);

    return (
        <div 
          draggable 
          onMouseDown={handleMouseDown}
          onDragStart={(e) => handleDragStart(e, track.id)} 
          className="relative group flex flex-col gap-1"
        >
            <div className="drag-handle absolute top-1 left-1 p-1 cursor-grab hover:bg-black/40 rounded z-20 text-zinc-500 hover:text-zinc-200 transition-colors"><GripVertical size={12} /></div>
            
            <button 
                onClick={playSfx}
                className="w-full aspect-square rounded-xl bg-zinc-900/60 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
                <Zap size={16} className="text-amber-600 group-hover:text-amber-400" />
                <span className="text-[9px] text-zinc-500 group-hover:text-zinc-300 truncate w-full px-1 text-center">{track.name}</span>
            </button>
            
            {/* Controles de Volume e Pulso */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded border border-white/10">
                <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={track.volume ?? 0.5}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate(track.id, { volume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    title="Volume"
                />
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpdate(track.id, { pulseActive: !track.pulseActive }); }}
                    className={`p-0.5 rounded transition-colors ${track.pulseActive ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                    title="Ativar Pulso (Repetição)"
                >
                    <Clock size={10} />
                </button>
            </div>

            {/* Configuração de Intervalo do Pulso */}
            {track.pulseActive && (
                 <div className="flex items-center gap-1 px-1 animate-in slide-in-from-top-1 duration-200">
                    <input 
                        type="number" 
                        min="1"
                        value={track.pulseInterval || 5} 
                        onChange={(e) => onUpdate(track.id, { pulseInterval: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/10 rounded text-[9px] text-center py-0.5 text-zinc-300 outline-none focus:border-amber-500/50"
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Seg"
                    />
                    <span className="text-[8px] text-zinc-600">s</span>
                 </div>
            )}

            <button onClick={() => onDelete(track.id)} className="absolute -top-1 -right-1 bg-zinc-950 border border-white/10 rounded-full p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"><Trash2 size={10} /></button>
        </div>
    );
}

// --- SFX GRID ---
function SfxGrid({ tracks, masterVolume, onDelete, onUpdate }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {tracks.map((track) => (
                <SfxItem 
                    key={track.id} 
                    track={track} 
                    masterVolume={masterVolume} 
                    onDelete={onDelete} 
                    onUpdate={onUpdate} 
                />
            ))}
        </div>
    );
}

// --- MIXER PRINCIPAL ---

export default function Mixer({ playlist = [], onOpenGallery, volAmbience, volMusic, volSfx }) {
  const { activeScene, updateTrack, addTrackToActiveScene, deleteTrack } = useGameStore();
  
  // Estado de Modo de Ambientação (Agora é a aba principal)
  const [activeTab, setActiveTab] = useState('exploration'); // 'exploration' | 'combat' | 'victory'

  // Filtros
  const musicTracks = useMemo(() => playlist.filter(t => t.type === 'musica'), [playlist]);
  const sfxTracks = useMemo(() => playlist.filter(t => t.type === 'sfx'), [playlist]);
  
  // Filtra ambiente pelo modo ativo.
  const currentAmbienceTracks = useMemo(() => 
    playlist.filter(t => t.type === 'ambiente' && (t.ambienceMode === activeTab || (!t.ambienceMode && activeTab === 'exploration'))), 
  [playlist, activeTab]);

  // --- DRAG AND DROP HANDLERS ---
  
  const handleDrop = async (e, targetType, targetMode = null) => {
      e.preventDefault();
      const trackId = e.dataTransfer.getData('trackId');
      
      // Caso 1: Movendo faixa existente
      if (trackId) {
          const track = playlist.find(t => t.id === trackId);
          if (track) {
              const updates = { type: targetType };
              if (targetType === 'ambiente') updates.ambienceMode = targetMode;
              updateTrack(activeScene.id, trackId, updates);
          }
          return;
      }

      // Caso 2: Upload de novo arquivo
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const extraData = targetType === 'ambiente' ? { ambienceMode: targetMode } : {};
          await addTrackToActiveScene(file, targetType, extraData);
      }
  };

  const allowDrop = (e) => e.preventDefault();

  // Handler para abrir a galeria interna
  const handleAddTrack = (type, mode = null) => {
      if (onOpenGallery) {
          onOpenGallery(type, mode);
      }
  };

  return (
    <div className="h-full flex flex-col bg-black/20 backdrop-blur-sm">
        
        {/* Header / Abas Principais */}
        <div className="flex items-center p-2 gap-1 border-b border-white/5 bg-zinc-950/40 shrink-0">
            {[
                { id: 'exploration', icon: MapIcon, label: 'Exploração' },
                { id: 'combat', icon: Swords, label: 'Combate' },
                { id: 'victory', icon: Trophy, label: 'Vitória' }
            ].map(mode => (
                <button 
                    key={mode.id}
                    onClick={() => setActiveTab(mode.id)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase tracking-wide ${activeTab === mode.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                >
                    <mode.icon size={14} />
                    <span className="hidden sm:inline">{mode.label}</span>
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
            
            {/* SEÇÃO 1: AMBIENTE (Filtrado pela Aba) */}
            <div 
                className="space-y-2"
                onDragOver={allowDrop} 
                onDrop={(e) => handleDrop(e, 'ambiente', activeTab)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                        <Wind size={14} /> Ambiente ({activeTab})
                        <button onClick={() => handleAddTrack('ambiente', activeTab)} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400" title="Adicionar arquivo"><Plus size={14} /></button>
                    </div>
                </div>
                
                <div className="space-y-2 min-h-[60px] bg-emerald-900/5 rounded-lg p-2 border border-emerald-500/10 border-dashed">
                    {currentAmbienceTracks.map(track => (
                        <AmbienceTrack key={track.id} track={track} masterVolume={volAmbience} onDelete={(id) => deleteTrack(activeScene.id, id)} />
                    ))}
                    {currentAmbienceTracks.length === 0 && (
                        <div className="text-center text-[10px] text-zinc-600 py-2">Arraste ou clique + para adicionar</div>
                    )}
                </div>
            </div>

            {/* SEÇÃO 2: MÚSICA (Global) */}
            <div 
                className="space-y-2"
                onDragOver={allowDrop} 
                onDrop={(e) => handleDrop(e, 'musica')}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        <Music size={14} /> Playlist
                        <button onClick={() => handleAddTrack('musica')} className="p-1 hover:bg-indigo-500/20 rounded text-indigo-400" title="Adicionar arquivo"><Plus size={14} /></button>
                    </div>
                </div>
                <div className="bg-indigo-900/5 rounded-lg p-2 border border-indigo-500/10 border-dashed min-h-[100px]">
                    <MusicPlayer tracks={musicTracks} masterVolume={volMusic} onUpdate={updateTrack} onDelete={(id) => deleteTrack(activeScene.id, id)} />
                </div>
            </div>

            {/* SEÇÃO 3: SFX (Global) */}
            <div 
                className="space-y-2"
                onDragOver={allowDrop} 
                onDrop={(e) => handleDrop(e, 'sfx')}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <Zap size={14} /> Efeitos
                        <button onClick={() => handleAddTrack('sfx')} className="p-1 hover:bg-amber-500/20 rounded text-amber-400" title="Adicionar arquivo"><Plus size={14} /></button>
                    </div>
                </div>
                <div className="bg-amber-900/5 rounded-lg p-2 border border-amber-500/10 border-dashed min-h-[100px]">
                    <SfxGrid tracks={sfxTracks} masterVolume={volSfx} onDelete={(id) => deleteTrack(activeScene.id, id)} onUpdate={(tid, data) => updateTrack(activeScene.id, tid, data)} />
                    {sfxTracks.length === 0 && <div className="text-center text-[10px] text-zinc-600 py-4">Arraste ou clique + para adicionar</div>}
                </div>
            </div>

        </div>
    </div>
  );
}
