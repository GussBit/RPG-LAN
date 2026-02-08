import React, { useEffect, useState, useRef, useMemo, useLayoutEffect, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Howl, Howler } from 'howler';
import {
  Volume2, Play, Pause, Wind, Zap, UploadCloud, Trash2, Music,
  SkipForward, SkipBack, Swords, Map as MapIcon, Trophy, GripVertical,
  Plus, Clock, MoreVertical, ArrowRight, Repeat, Repeat1, Maximize2, Minimize2, Power
} from 'lucide-react';
import { useGameStore } from './store';
import { getImageUrl } from './constants';

// --- COMPONENTES AUXILIARES ---
const Slider = memo(({ value, onChange, vertical = false, className = '', expanded = false }) => {
  const size = expanded
    ? (vertical ? 'h-24 w-8' : 'w-32 h-8')
    : (vertical ? 'h-16 2xl:h-24 w-4 2xl:w-6' : 'w-16 2xl:w-24 h-4 2xl:h-6');
  const trackSize = expanded
    ? (vertical ? 'w-2' : 'h-2')
    : (vertical ? 'w-1.5' : 'h-1.5');

  return (
    <div className={`relative flex items-center justify-center group ${vertical ? 'flex-col' : ''} ${size} ${className}`}>
      <div className={`relative bg-zinc-800 rounded-full overflow-hidden ${vertical ? `${trackSize} h-full` : `w-full ${trackSize}`}`}>
        <div
          className="bg-indigo-500 absolute bottom-0 left-0 transition-all"
          style={vertical ? { width: '100%', height: `${value * 100}%` } : { height: '100%', width: `${value * 100}%` }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 opacity-0 cursor-pointer"
        style={vertical ? { writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } : {}}
      />
    </div>
  );
});

// Menu de Contexto
const CategoryMenu = memo(({ onSelect, onClose, position, currentType }) => {
  const menuRef = useRef(null);

  const categories = [
    { type: 'ambiente', mode: 'exploration', label: 'Ambiente - Exploração', icon: MapIcon, color: 'emerald' },
    { type: 'ambiente', mode: 'combat', label: 'Ambiente - Combate', icon: Swords, color: 'emerald' },
    { type: 'ambiente', mode: 'victory', label: 'Ambiente - Vitória', icon: Trophy, color: 'emerald' },
    { type: 'musica', mode: null, label: 'Música', icon: Music, color: 'indigo' },
    { type: 'sfx', mode: null, label: 'Efeito Sonoro', icon: Zap, color: 'amber' },
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;

      let newTop = position.y;
      let newLeft = position.x;

      if (newLeft + rect.width > innerWidth) newLeft = innerWidth - rect.width - 10;
      if (newTop + rect.height > innerHeight) newTop = innerHeight - rect.height - 10;

      menuRef.current.style.top = `${newTop}px`;
      menuRef.current.style.left = `${newLeft}px`;
    }
  }, [position]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[100] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 min-w-[220px]"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      {categories.map((cat, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(cat.type, cat.mode)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 flex items-center gap-2 transition-colors text-zinc-200"
        >
          <cat.icon className={`w-4 h-4 text-${cat.color}-400`} />
          <span>{cat.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
});

// Drag handlers
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

// ✅ AMBIENTE TRACK - CORRIGIDO
const AmbienceTrack = memo(({ track, masterVolume, onDelete, onChangeCategory, isExpanded }) => {
  const soundRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [localVolume, setLocalVolume] = useState(track.volume ?? 0.5);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    soundRef.current = new Howl({
      src: [getImageUrl(track.url)],
      loop: true,
      volume: localVolume * masterVolume,
      html5: true,
      onload: () => {
        if (playing) {
          soundRef.current.play();
        }
      },
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [track.url]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(localVolume * masterVolume);
    }
  }, [localVolume, masterVolume]);

  const togglePlay = useCallback(() => {
    if (!soundRef.current) return;
    
    if (playing) {
      soundRef.current.pause();
      setPlaying(false);
    } else {
      soundRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  const handleCategoryClick = useCallback((e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setShowCategoryMenu(true);
  }, []);

  const iconSize = isExpanded ? 20 : 14;
  const padding = isExpanded ? 'p-3' : 'p-1.5 2xl:p-2';
  const gap = isExpanded ? 'gap-4' : 'gap-2';

  return (
    <div
      draggable="true"
      onMouseDown={handleMouseDown}
      onDragStart={(e) => handleDragStart(e, track.id)}
      className={`flex items-center ${gap} ${padding} bg-zinc-900/60 rounded-lg border border-zinc-700 hover:border-emerald-500/50 transition-all group ${isExpanded ? 'shadow-lg' : ''}`}
    >
      <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-700/50 rounded">
        <GripVertical size={iconSize} className="text-zinc-600" />
      </div>

      <button
        onClick={togglePlay}
        className={`${isExpanded ? 'p-3' : 'p-1.5 2xl:p-2'} bg-emerald-600/20 hover:bg-emerald-600/40 rounded-lg transition-colors shrink-0`}
      >
        {playing ? <Pause size={iconSize} /> : <Play size={iconSize} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`${isExpanded ? 'text-base' : 'text-xs'} font-medium text-zinc-200 truncate`}>{track.name}</div>
        {isExpanded && <div className="text-xs text-emerald-400/60 mt-1">Loop Ambiente</div>}
      </div>

      {isExpanded && (
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-zinc-500" />
          <div className="text-xs text-zinc-400 w-8 text-right">{Math.round(localVolume * 100)}</div>
        </div>
      )}

      <Slider value={localVolume} onChange={setLocalVolume} className="shrink-0" expanded={isExpanded} />

      <button
        onClick={handleCategoryClick}
        className={`${isExpanded ? 'p-2' : 'p-1.5'} hover:bg-zinc-700/50 rounded transition-colors text-zinc-400 ${isExpanded ? 'opacity-0 group-hover:opacity-100' : ''} shrink-0`}
        title="Mudar categoria"
      >
        <ArrowRight size={iconSize} />
      </button>

      <button
        onClick={() => onDelete(track.id)}
        className={`${isExpanded ? 'p-2' : 'p-2'} hover:bg-red-500/20 rounded-lg transition-colors text-red-400 ${isExpanded ? 'opacity-0 group-hover:opacity-100' : ''} shrink-0`}
      >
        <Trash2 size={iconSize} />
      </button>

      {showCategoryMenu && (
        <CategoryMenu
          currentType="ambiente"
          position={menuPosition}
          onSelect={(type, mode) => {
            onChangeCategory(track.id, type, mode);
            setShowCategoryMenu(false);
          }}
          onClose={() => setShowCategoryMenu(false)}
        />
      )}
    </div>
  );
});

// ✅ MUSIC PLAYER - CORRIGIDO
const MusicPlayer = memo(({ tracks, masterVolume, onUpdate, onDelete, onChangeCategory, isExpanded }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState('none');
  const soundRef = useRef(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  
  // ✅ ADICIONADO: Estado local do volume para atualização imediata
  const [localVolume, setLocalVolume] = useState(0.7);

  const currentTrack = tracks[currentIndex];

  // ✅ Sincroniza localVolume com o track atual
  useEffect(() => {
    if (currentTrack) {
      setLocalVolume(currentTrack.volume ?? 0.7);
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!currentTrack) return;

    if (soundRef.current) {
      soundRef.current.unload();
    }

    const shouldLoop = loopMode === 'one';

    soundRef.current = new Howl({
      src: [getImageUrl(currentTrack.url)],
      volume: localVolume * masterVolume, // ✅ Usa localVolume
      loop: shouldLoop,
      html5: true,
      onload: () => {
        if (playing) {
          soundRef.current.play();
        }
      },
      onend: () => {
        if (!shouldLoop) {
          if (loopMode === 'all') {
            const nextIndex = (currentIndex + 1) % tracks.length;
            setCurrentIndex(nextIndex);
          } else if (currentIndex < tracks.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setPlaying(false);
          }
        }
      },
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [currentTrack?.id, loopMode]);

  // ✅ CORRIGIDO: Atualiza volume imediatamente quando localVolume ou masterVolume mudam
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(localVolume * masterVolume);
    }
  }, [localVolume, masterVolume]);

  const togglePlay = useCallback(() => {
    if (!soundRef.current) return;
    
    if (playing) {
      soundRef.current.pause();
      setPlaying(false);
    } else {
      soundRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  const handlePrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, tracks.length]);

  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % tracks.length;
    setCurrentIndex(newIndex);
  }, [currentIndex, tracks.length]);

  // ✅ CORRIGIDO: Atualiza volume local E persiste no store
  const handleVolumeChange = useCallback((newVolume) => {
    if (!currentTrack) return;
    
    // Atualiza localmente (imediato)
    setLocalVolume(newVolume);
    
    // Persiste no store (assíncrono)
    onUpdate(currentTrack.id, { volume: newVolume });
  }, [currentTrack, onUpdate]);

  const toggleLoopMode = useCallback(() => {
    const modes = ['none', 'one', 'all'];
    const currentModeIndex = modes.indexOf(loopMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setLoopMode(nextMode);
  }, [loopMode]);

  const handleCategoryClick = useCallback((e, trackId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedTrackId(trackId);
    setShowCategoryMenu(true);
  }, []);

  if (tracks.length === 0) {
    return <div className="text-center text-[10px] text-zinc-600 py-4">Arraste ou clique para adicionar</div>;
  }

  return (
    <div className={`space-y-3 ${isExpanded ? 'h-full flex flex-col' : ''}`}>
      {/* Player Principal */}
      <div className={`flex items-center gap-3 ${isExpanded ? 'p-4' : 'p-2 2xl:p-3'} bg-zinc-900/80 rounded-lg border border-indigo-500/30 ${isExpanded ? 'shadow-lg' : ''}`}>
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/30 flex items-center justify-center relative">
          <Music size={32} className="text-indigo-400/30" />
          {playing && <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent animate-pulse" />}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className={`${isExpanded ? 'p-2' : 'p-1.5'} hover:bg-zinc-700/50 rounded transition-colors shrink-0`}>
              <SkipBack size={isExpanded ? 18 : 14} />
            </button>

            <button onClick={togglePlay} className={`${isExpanded ? 'p-4' : 'p-1.5 2xl:p-2'} bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shrink-0 shadow-lg shadow-indigo-900/20`}>
              {playing ? <Pause size={isExpanded ? 24 : 16} /> : <Play size={isExpanded ? 24 : 16} />}
            </button>

            <button onClick={handleNext} className={`${isExpanded ? 'p-2' : 'p-1.5'} hover:bg-zinc-700/50 rounded transition-colors shrink-0`}>
              <SkipForward size={isExpanded ? 18 : 14} />
            </button>

            <button
              onClick={toggleLoopMode}
              className={`${isExpanded ? 'p-2' : 'p-1.5'} rounded transition-colors shrink-0 ${loopMode !== 'none' ? 'bg-indigo-500/30 text-indigo-300' : 'hover:bg-zinc-700/50 text-zinc-400'}`}
              title={loopMode === 'one' ? 'Loop Uma música' : loopMode === 'all' ? 'Loop Todas' : 'Loop Desativado'}
            >
              {loopMode === 'one' ? <Repeat1 size={isExpanded ? 18 : 14} /> : <Repeat size={isExpanded ? 18 : 14} />}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className={`${isExpanded ? 'text-base' : 'text-xs'} font-medium text-zinc-200 truncate`}>{currentTrack?.name}</div>
            <div className={`${isExpanded ? 'text-sm' : 'text-[10px]'} text-zinc-500 flex items-center gap-2`}>
              <span>{currentIndex + 1}/{tracks.length}</span>
              {loopMode !== 'none' && <span className="text-indigo-400">●</span>}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-zinc-500 shrink-0" />
            <Slider value={localVolume} onChange={handleVolumeChange} expanded={isExpanded} className="flex-1" />
            <div className="text-sm text-zinc-400 w-10 text-right">{Math.round(localVolume * 100)}</div>
          </div>
        )}

        {!isExpanded && <Slider value={localVolume} onChange={handleVolumeChange} className="shrink-0" />}
      </div>

      {/* Lista de Faixas */}
      <div className={`space-y-2 overflow-y-auto custom-scrollbar pr-1 ${isExpanded ? 'flex-1 min-h-0' : 'max-h-32 2xl:max-h-48'}`}>
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            draggable="true"
            onMouseDown={handleMouseDown}
            onDragStart={(e) => handleDragStart(e, track.id)}
            className={`flex items-center gap-3 ${isExpanded ? 'p-3' : 'p-2'} rounded-lg border transition-all group cursor-pointer ${
              idx === currentIndex ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-zinc-900/40 border-zinc-700 hover:border-indigo-500/30'
            }`}
            onClick={() => setCurrentIndex(idx)}
          >
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-700/50 rounded">
              <GripVertical size={isExpanded ? 16 : 12} className="text-zinc-600" />
            </div>

            <Music size={isExpanded ? 16 : 12} className={idx === currentIndex ? 'text-indigo-400' : 'text-zinc-600'} />

            <div className="flex-1 min-w-0">
              <div className={`${isExpanded ? 'text-sm' : 'text-xs'} text-zinc-300 truncate font-medium`}>{track.name}</div>
              {isExpanded && <div className="text-xs text-zinc-600 mt-0.5">Faixa {idx + 1}</div>}
            </div>

            <button
              onClick={(e) => handleCategoryClick(e, track.id)}
              className={`p-1.5 hover:bg-zinc-700/50 rounded transition-colors text-zinc-400 ${isExpanded ? 'opacity-0 group-hover:opacity-100' : ''} shrink-0`}
              title="Mudar categoria"
            >
              <ArrowRight size={isExpanded ? 14 : 12} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(track.id);
                if (idx === currentIndex && idx > 0) setCurrentIndex(idx - 1);
              }}
              className={`p-1.5 hover:bg-red-500/20 rounded transition-colors text-red-400 ${isExpanded ? 'opacity-0 group-hover:opacity-100' : ''} shrink-0`}
            >
              <Trash2 size={isExpanded ? 14 : 12} />
            </button>
          </div>
        ))}
      </div>

      {showCategoryMenu && selectedTrackId && (
        <CategoryMenu
          currentType="musica"
          position={menuPosition}
          onSelect={(type, mode) => {
            onChangeCategory(selectedTrackId, type, mode);
            setShowCategoryMenu(false);
            setSelectedTrackId(null);
          }}
          onClose={() => {
            setShowCategoryMenu(false);
            setSelectedTrackId(null);
          }}
        />
      )}
    </div>
  );
});


// ✅ SFX GRID - CORRIGIDO
const SfxGrid = memo(({ tracks, masterVolume, onDelete, onUpdate, onChangeCategory, isExpanded }) => {
  const [playingId, setPlayingId] = useState(null);
  const soundsRef = useRef({});
  const activeIntervalsRef = useRef({});
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [editingPulseId, setEditingPulseId] = useState(null);
  
  // ✅ ADICIONADO: Estado local para edição do intervalo
  const [editingPulseValue, setEditingPulseValue] = useState(5);

  const trackIds = useMemo(() => tracks.map(t => t.id).join(','), [tracks]);

  useEffect(() => {
    tracks.forEach((track) => {
      if (!soundsRef.current[track.id]) {
        soundsRef.current[track.id] = new Howl({
          src: [getImageUrl(track.url)],
          volume: (track.volume ?? 0.8) * masterVolume,
          html5: true,
        });
      }
    });

    return () => {
      Object.values(soundsRef.current).forEach((sound) => sound.unload());
      soundsRef.current = {};
    };
  }, [trackIds]);

  useEffect(() => {
    tracks.forEach((track) => {
      if (soundsRef.current[track.id]) {
        soundsRef.current[track.id].volume((track.volume ?? 0.8) * masterVolume);
      }
    });
  }, [tracks, masterVolume]);

  const playSound = useCallback((trackId) => {
    const sound = soundsRef.current[trackId];
    if (!sound) return;
    
    sound.play();
    setPlayingId(trackId);
    
    setTimeout(() => {
      setPlayingId(null);
    }, 300);
  }, []);

  // ✅ GERENCIAMENTO DE PULSO (ROBUSTO)
  useEffect(() => {
    // 1. Mapeia o estado desejado (quais faixas devem pulsar e com qual intervalo)
    const desiredPulses = {};
    tracks.forEach(track => {
      if (track.pulseActive) {
        desiredPulses[track.id] = (track.pulseInterval || 5) * 1000;
      }
    });

    // 2. Remove pulsos que não deveriam existir ou cuja duração mudou
    Object.keys(activeIntervalsRef.current).forEach(id => {
      const current = activeIntervalsRef.current[id];
      const desiredDuration = desiredPulses[id];

      if (!desiredDuration || desiredDuration !== current.duration) {
        clearInterval(current.timerId);
        delete activeIntervalsRef.current[id];
      }
    });

    // 3. Cria novos pulsos para os que faltam (ou foram recém removidos por mudança de duração)
    Object.keys(desiredPulses).forEach(id => {
      if (!activeIntervalsRef.current[id]) {
        const duration = desiredPulses[id];
        const timerId = setInterval(() => playSound(id), duration);
        activeIntervalsRef.current[id] = { timerId, duration };
      }
    });
  }, [tracks, playSound]);

  // Limpeza final ao desmontar
  useEffect(() => {
    return () => {
        Object.values(activeIntervalsRef.current).forEach(i => clearInterval(i.timerId));
        activeIntervalsRef.current = {};
    };
  }, []);

  // ✅ CORRIGIDO: Permite digitação livre e aplica debounce
  const handlePulseIntervalChange = useCallback((trackId, value) => {
    // Permite string vazia para digitar
    if (value === '') {
      setEditingPulseValue('');
      return;
    }

    const numValue = Number(value);
    
    // Valida range
    if (numValue < 1) {
      setEditingPulseValue(1);
      return;
    }
    if (numValue > 60) {
      setEditingPulseValue(60);
      return;
    }

    setEditingPulseValue(numValue);

    // Atualiza no store
    onUpdate(trackId, { pulseInterval: numValue });
  }, [onUpdate]);

  const handleCategoryClick = useCallback((e, trackId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedTrackId(trackId);
    setShowCategoryMenu(true);
  }, []);

  // ✅ ADICIONADO: Sincroniza valor local ao abrir popup
  const handleOpenPulseEdit = useCallback((track) => {
    setEditingPulseValue(track.pulseInterval || 5);
    setEditingPulseId(track.id);
  }, []);

  return (
    <div className={`grid gap-3 overflow-y-auto custom-scrollbar pr-1 ${isExpanded ? 'grid-cols-4 2xl:grid-cols-5 flex-1 min-h-0' : 'grid-cols-2 2xl:grid-cols-2 max-h-80'}`}>
      {tracks.map((track) => (
        <div
          key={track.id}
          draggable="true"
          onMouseDown={handleMouseDown}
          onDragStart={(e) => handleDragStart(e, track.id)}
          className={`relative flex flex-col justify-between rounded-lg border transition-all ${isExpanded ? 'aspect-[4/5]' : 'aspect-[6/6]'} overflow-visible ${
            playingId === track.id
              ? 'bg-amber-600/40 border-amber-400 scale-0.98'
              : track.pulseActive
              ? 'bg-amber-950/40 border-amber-500/50'
              : 'bg-zinc-900/60 border-zinc-700 hover:border-amber-500/50'
          }`}
        >
          <button
            onClick={() => playSound(track.id)}
            className="flex-1 w-full flex flex-col items-center justify-center p-3 gap-3 outline-none group"
          >
            <div className={`${isExpanded ? 'p-4' : 'p-3'} rounded-full transition-colors ${playingId === track.id ? 'bg-amber-400 text-amber-950' : 'bg-black/40 text-amber-500 group-hover:text-amber-400'}`}>
              <Zap size={isExpanded ? 28 : 20} className={playingId === track.id ? 'fill-current' : ''} />
            </div>

            <div className="w-full text-center px-2">
              <div className={`${isExpanded ? 'text-sm' : 'text-[10px] 2xl:text-xs'} font-bold text-zinc-300 line-clamp-2 leading-tight`}>{track.name}</div>
            </div>
          </button>

          <div className={`w-full grid grid-cols-4 border-t border-white/5 bg-black/20 divide-x divide-white/5 ${isExpanded ? 'h-10' : 'h-8'} shrink-0`}>
            <div className="drag-handle cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-white/5 transition-colors">
              <GripVertical size={isExpanded ? 14 : 12} className="text-zinc-500" />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (editingPulseId === track.id) {
                  setEditingPulseId(null);
                } else {
                  handleOpenPulseEdit(track);
                }
              }}
              className={`flex items-center justify-center transition-colors ${
                editingPulseId === track.id ? 'text-amber-400 bg-amber-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
              title="Configurar pulso"
            >
              <Clock size={isExpanded ? 14 : 12} />
            </button>

            <button
              onClick={(e) => handleCategoryClick(e, track.id)}
              className="flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
              title="Mover"
            >
              <ArrowRight size={isExpanded ? 14 : 12} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(track.id);
              }}
              className="flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="Excluir"
            >
              <Trash2 size={isExpanded ? 14 : 12} />
            </button>
          </div>

          {/* ✅ POPUP CORRIGIDO */}
          {editingPulseId === track.id && (
            <div 
              className="absolute inset-0 z-10 bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 rounded-lg" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`${isExpanded ? 'text-xs' : 'text-[10px]'} text-zinc-400 mb-3 font-bold uppercase`}>Intervalo</div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="60"
                  value={editingPulseValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permite apenas números e string vazia
                    if (value === '' || /^\d+$/.test(value)) {
                      handlePulseIntervalChange(track.id, value);
                    }
                  }}
                  onBlur={() => {
                    // Se estiver vazio ao perder foco, volta para 5
                    if (editingPulseValue === '') {
                      setEditingPulseValue(5);
                      handlePulseIntervalChange(track.id, '5');
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.target.select(); // ✅ Seleciona tudo ao clicar
                  }}
                  className={`${isExpanded ? 'w-16 text-base' : 'w-12 text-sm'} text-center py-1.5 bg-black border border-zinc-700 rounded text-amber-400 font-bold focus:border-amber-500 outline-none`}
                />
                <span className="text-[10px] text-zinc-500">seg</span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPulseId(null);
                }} 
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 text-[10px] uppercase font-bold"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Feedback de Tempo (Canto Superior Esquerdo) */}
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
             <span className="text-[10px] font-bold font-mono text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10 shadow-sm">
                {track.pulseInterval || 5} seg
             </span>
          </div>

          {/* Switch iOS (Canto Superior Direito) */}
          <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
             <button
                onClick={() => onUpdate(track.id, { pulseActive: !track.pulseActive })}
                className={`w-8 h-4.5 rounded-full transition-colors relative border border-white/10 shadow-inner ${track.pulseActive ? 'bg-green-500' : 'bg-zinc-700'}`}
                title={track.pulseActive ? "Desativar pulso" : "Ativar pulso"}
             >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all ${track.pulseActive ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
             </button>
          </div>
        </div>
      ))}

      {showCategoryMenu && selectedTrackId && (
        <CategoryMenu
          currentType="sfx"
          position={menuPosition}
          onSelect={(type, mode) => {
            onChangeCategory(selectedTrackId, type, mode);
            setShowCategoryMenu(false);
            setSelectedTrackId(null);
          }}
          onClose={() => {
            setShowCategoryMenu(false);
            setSelectedTrackId(null);
          }}
        />
      )}
    </div>
  );
});


// ✅ COMPONENTE PRINCIPAL
export default function Mixer({ playlist = [], onOpenGallery, volAmbience, volMusic, volSfx, isExpanded, onToggleExpanded }) {
  const { activeScene, updateTrack, addTrackToActiveScene, deleteTrack } = useGameStore();
  const [activeTab, setActiveTab] = useState('exploration');

  const playlistKey = useMemo(() => playlist.map(t => t.id).join(','), [playlist]);

  const musicTracks = useMemo(() => playlist.filter((t) => t.type === 'musica'), [playlist]);
  const sfxTracks = useMemo(() => playlist.filter((t) => t.type === 'sfx'), [playlist]);
  const currentAmbienceTracks = useMemo(
    () => playlist.filter((t) => t.type === 'ambiente' && (t.ambienceMode === activeTab || !t.ambienceMode)),
    [playlist, activeTab]
  );

  const handleDrop = async (e, targetType, targetMode = null) => {
    e.preventDefault();
    const trackId = e.dataTransfer.getData('trackId');

    if (trackId) {
      const track = playlist.find((t) => t.id === trackId);
      if (track) {
        const updates = { type: targetType };
        if (targetType === 'ambiente') updates.ambienceMode = targetMode;
        updateTrack(activeScene.id, trackId, updates);
      }
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const extraData = targetType === 'ambiente' ? { ambienceMode: targetMode } : {};
      await addTrackToActiveScene(file, targetType, extraData);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const handleAddTrack = (type, mode = null) => {
    if (onOpenGallery) onOpenGallery(type, mode);
  };

  const handleChangeCategory = useCallback((trackId, newType, newMode) => {
    const updates = { type: newType };
    if (newType === 'ambiente' && newMode) updates.ambienceMode = newMode;
    updateTrack(activeScene.id, trackId, updates);
  }, [activeScene.id, updateTrack]);

  return (
    <div className={isExpanded ? 'h-full flex flex-col bg-zinc-950/95 backdrop-blur-xl p-6 transition-all duration-300' : 'h-full flex flex-col bg-black/20 backdrop-blur-sm transition-all duration-300'}>
      <div className={`flex items-center gap-2 border-b border-white/5 bg-zinc-950/40 shrink-0 ${isExpanded ? 'rounded-xl mb-6 px-4 py-3' : 'p-1.5 gap-1'}`}>
        {[
          { id: 'exploration', icon: MapIcon, label: 'Exploração' },
          { id: 'combat', icon: Swords, label: 'Combate' },
          { id: 'victory', icon: Trophy, label: 'Vitória' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveTab(mode.id)}
            className={`flex-1 ${isExpanded ? 'py-3 text-sm' : 'py-1.5 2xl:py-2 text-[10px] 2xl:text-xs'} rounded-lg flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wide ${
              activeTab === mode.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
            }`}
          >
            <mode.icon size={isExpanded ? 18 : 12} className="2xl:w-3.5 2xl:h-3.5" />
            <span className={isExpanded ? '' : 'hidden sm:inline'}>{mode.label}</span>
          </button>
        ))}

        <button
          onClick={onToggleExpanded}
          className={`ml-auto p-2 rounded-lg transition-all ${isExpanded ? 'bg-white/10 text-white hover:bg-white/20' : 'p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          title={isExpanded ? 'Restaurar' : 'Expandir'}
        >
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className={isExpanded ? 'flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-8 overflow-hidden' : 'flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3 2xl:space-y-6'}>
        {/* AMBIENTE */}
        <div className={`space-y-2 ${isExpanded ? 'flex flex-col h-full min-h-0' : 'space-y-1 2xl:space-y-2'}`} onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'ambiente', activeTab)}>
          <div className="flex items-center justify-between shrink-0">
            <div className={`flex items-center gap-2 ${isExpanded ? 'text-sm' : 'text-[10px] 2xl:text-xs'} font-bold text-emerald-500 uppercase tracking-wider`}>
              <Wind size={isExpanded ? 18 : 12} className="2xl:w-3.5 2xl:h-3.5" />
              <span>Ambiente</span>
              {isExpanded && <span className="text-zinc-600">{activeTab}</span>}
            </div>

            <button onClick={() => handleAddTrack('ambiente', activeTab)} className={`${isExpanded ? 'p-1.5' : 'p-0.5 2xl:p-1'} hover:bg-emerald-500/20 rounded text-emerald-400`} title="Adicionar arquivo">
              <Plus size={isExpanded ? 16 : 12} className="2xl:w-3.5 2xl:h-3.5" />
            </button>
          </div>

          <div className={`space-y-2 overflow-y-auto custom-scrollbar bg-emerald-900/5 rounded-lg ${isExpanded ? 'p-3' : 'p-1.5 2xl:p-2'} border border-emerald-500/10 border-dashed ${isExpanded ? 'flex-1 min-h-0' : 'min-h-[60px] max-h-40 2xl:max-h-64'}`}>
            {currentAmbienceTracks.map((track) => (
              <AmbienceTrack
                key={track.id}
                track={track}
                masterVolume={volAmbience}
                onDelete={(id) => deleteTrack(activeScene.id, id)}
                onChangeCategory={handleChangeCategory}
                isExpanded={isExpanded}
              />
            ))}

            {currentAmbienceTracks.length === 0 && (
              <div className={`text-center ${isExpanded ? 'text-sm py-8' : 'text-[10px] py-2'} text-zinc-600`}>{isExpanded ? 'Nenhum som de ambiente adicionado' : 'Arraste ou clique para adicionar'}</div>
            )}
          </div>
        </div>

        {/* MÚSICA */}
        <div className={`space-y-2 ${isExpanded ? 'flex flex-col h-full min-h-0' : 'space-y-1 2xl:space-y-2'}`} onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'musica')}>
          <div className="flex items-center justify-between shrink-0">
            <div className={`flex items-center gap-2 ${isExpanded ? 'text-sm' : 'text-[10px] 2xl:text-xs'} font-bold text-indigo-400 uppercase tracking-wider`}>
              <Music size={isExpanded ? 18 : 12} className="2xl:w-3.5 2xl:h-3.5" />
              <span>Playlist</span>
              {isExpanded && <span className="text-zinc-600">{musicTracks.length} faixas</span>}
            </div>

            <button onClick={() => handleAddTrack('musica')} className={`${isExpanded ? 'p-1.5' : 'p-0.5 2xl:p-1'} hover:bg-indigo-500/20 rounded text-indigo-400`} title="Adicionar arquivo">
              <Plus size={isExpanded ? 16 : 12} className="2xl:w-3.5 2xl:h-3.5" />
            </button>
          </div>

          <div className={`bg-indigo-900/5 rounded-lg ${isExpanded ? 'p-3' : 'p-1.5 2xl:p-2'} border border-indigo-500/10 border-dashed ${isExpanded ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
            <MusicPlayer tracks={musicTracks} masterVolume={volMusic} onUpdate={(tid, data) => updateTrack(activeScene.id, tid, data)} onDelete={(id) => deleteTrack(activeScene.id, id)} onChangeCategory={handleChangeCategory} isExpanded={isExpanded} />
          </div>
        </div>

        {/* SFX */}
        <div className={`space-y-2 ${isExpanded ? 'flex flex-col h-full min-h-0' : 'space-y-1 2xl:space-y-2'}`} onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'sfx')}>
          <div className="flex items-center justify-between shrink-0">
            <div className={`flex items-center gap-2 ${isExpanded ? 'text-sm' : 'text-[10px] 2xl:text-xs'} font-bold text-amber-400 uppercase tracking-wider`}>
              <Zap size={isExpanded ? 18 : 12} className="2xl:w-3.5 2xl:h-3.5" />
              <span>Efeitos</span>
              {isExpanded && <span className="text-zinc-600">{sfxTracks.length} efeitos</span>}
            </div>

            <button onClick={() => handleAddTrack('sfx')} className={`${isExpanded ? 'p-1.5' : 'p-0.5 2xl:p-1'} hover:bg-amber-500/20 rounded text-amber-400`} title="Adicionar arquivo">
              <Plus size={isExpanded ? 16 : 12} className="2xl:w-3.5 2xl:h-3.5" />
            </button>
          </div>

          <div className={`bg-amber-900/5 rounded-lg ${isExpanded ? 'p-3' : 'p-1.5 2xl:p-2'} border border-amber-500/10 border-dashed ${isExpanded ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
            <SfxGrid tracks={sfxTracks} masterVolume={volSfx} onDelete={(id) => deleteTrack(activeScene.id, id)} onUpdate={(tid, data) => updateTrack(activeScene.id, tid, data)} onChangeCategory={handleChangeCategory} isExpanded={isExpanded} />

            {sfxTracks.length === 0 && (
              <div className={`text-center ${isExpanded ? 'text-sm py-8' : 'text-[10px] py-4'} text-zinc-600`}>{isExpanded ? 'Nenhum efeito sonoro adicionado' : 'Arraste ou clique para adicionar'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
