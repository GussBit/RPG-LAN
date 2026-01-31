import React, { useEffect, useState, useRef } from 'react';
import { Howl, Howler } from 'howler';
import {
  Volume2, Play, Pause, Square, Wind, Zap, UploadCloud,
  Trash2, FolderOpen, Music, Clock, Repeat
} from 'lucide-react';
import { useGameStore } from './store';
import { getImageUrl, BACKEND_URL } from './constants';

// --- COMPONENTES AUXILIARES ---

function SliderGroup({ label, value, setValue, color }) {
  return (
    <div className="flex flex-col items-center gap-2 w-10 group h-32">
       <div className="relative flex-1 w-2 bg-zinc-800 rounded-full flex items-end justify-center group-hover:bg-zinc-700 transition-colors">
          <div className={`w-full rounded-full transition-all duration-75 ${color} opacity-80 group-hover:opacity-100`} style={{ height: `${value * 100}%` }} />
          <input
            type="range" min="0" max="1" step="0.01"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none m-0 p-0"
            style={{ WebkitAppearance: 'slider-vertical' }}
            title={`${label}: ${Math.round(value * 100)}%`}
          />
       </div>
       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors text-center w-full truncate">{label}</span>
    </div>
  );
}

function TrackTypeSelector({ type, onChange }) {
    const [open, setOpen] = useState(false);
    const types = [
        { id: 'musica', label: 'Música', icon: Music, color: 'text-indigo-400' },
        { id: 'ambiente', label: 'Ambiente', icon: Wind, color: 'text-emerald-400' },
        { id: 'sfx', label: 'SFX', icon: Zap, color: 'text-amber-400' }
    ];
    const current = types.find(t => t.id === type) || types[0];

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 transition" title="Alterar tipo">
                <current.icon size={14} className={current.color} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-28 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                        {types.map(t => (
                            <button key={t.id} onClick={() => { onChange(t.id); setOpen(false); }} className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/5 ${type === t.id ? 'bg-white/5 text-white' : 'text-zinc-400'}`}>
                                <t.icon size={12} className={t.color} /> {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Componente de Faixa de Fundo (Music/Ambience)
function BackgroundTrack({ track, masterVolume, onUpdate, onDelete, globalCommand }) {
  const soundRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [localVolume, setLocalVolume] = useState(track.volume ?? 0.5);
  const finalVolume = localVolume * masterVolume;

  // 1. Inicialização do Howl
  useEffect(() => {
    if (!track.url) return;
    
    // Se o SRC for diferente, recria
    if (soundRef.current && soundRef.current._src !== getImageUrl(track.url)) {
        soundRef.current.unload();
        soundRef.current = null;
    }

    if (!soundRef.current) {
        soundRef.current = new Howl({
            src: [getImageUrl(track.url)], 
            html5: true, 
            loop: true, 
            volume: finalVolume,
            onloaderror: (id, err) => console.error('Erro audio:', err),
        });
    }

    // Atualiza volume
    soundRef.current.volume(finalVolume);

    return () => {
        // Cleanup ao desmontar
        if (soundRef.current) soundRef.current.unload();
    };
  }, [track.url]); // Apenas recria se URL mudar

  // 2. Listener de Comandos Globais (Play All, Pause All, Stop All)
  useEffect(() => {
      if (!globalCommand) return;

      // O comando vem com um ID (timestamp) para garantir que execute mesmo se for o mesmo tipo repetido
      if (globalCommand.type === 'PLAY') {
          setPlaying(true);
      } else if (globalCommand.type === 'PAUSE') {
          setPlaying(false);
      } else if (globalCommand.type === 'STOP') {
          setPlaying(false);
          if (soundRef.current) {
              soundRef.current.stop(); // Stop real (reset to 0)
          }
      }
  }, [globalCommand]);

  // 3. Sincronia Estado React -> Howler Audio
  useEffect(() => {
    if (!soundRef.current) return;
    soundRef.current.volume(finalVolume); // Garante volume atualizado

    if (playing) {
        if (!soundRef.current.playing()) {
            soundRef.current.play();
        }
    } else {
        if (soundRef.current.playing()) {
            soundRef.current.pause(); // Pause real (mantém posição)
        }
    }
  }, [playing, finalVolume]);

  return (
    <div className={`relative flex items-center gap-2 p-2 rounded-xl border transition-all ${playing ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}`}>
      <button 
        onClick={() => setPlaying(!playing)} 
        className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center transition-all ${playing ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-bold text-zinc-300 truncate">{track.name}</div>
          <div className="text-[10px] text-zinc-500 font-mono">{Math.round(localVolume * 100)}%</div>
        </div>
        <div className="relative h-4 w-full flex items-center">
             <div className="absolute w-full h-1 bg-zinc-700 rounded-full overflow-hidden pointer-events-none">
                 <div className="h-full bg-zinc-400 transition-all" style={{ width: `${localVolume * 100}%` }} />
             </div>
             <input type="range" min="0" max="1" step="0.05" value={localVolume} onChange={(e) => { const v = Number(e.target.value); setLocalVolume(v); onUpdate(track.id, { volume: v }); }} className="w-full h-4 opacity-0 cursor-pointer z-10" />
             <div className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none transition-all" style={{ left: `calc(${localVolume * 100}% - 6px)` }} />
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
          <TrackTypeSelector type={track.type} onChange={(newType) => onUpdate(track.id, { type: newType })} />
          <button onClick={() => onDelete(track.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function SfxButton({ track, shortcutIndex, masterVolume, onUpdate, onDelete }) {
  const [active, setActive] = useState(false);
  const [localVolume, setLocalVolume] = useState(track.volume ?? 0.5);
  const [intervalSec, setIntervalSec] = useState(0);
  const [timerOpen, setTimerOpen] = useState(false);
  const intervalRef = useRef(null);

  const playSfx = () => {
    setActive(true);
    setTimeout(() => setActive(false), 200);
    const sound = new Howl({ src: [getImageUrl(track.url)], volume: localVolume * masterVolume });
    sound.play();
  };

  useEffect(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (intervalSec > 0) {
          intervalRef.current = setInterval(playSfx, intervalSec * 1000);
      }
      return () => clearInterval(intervalRef.current);
  }, [intervalSec, localVolume, masterVolume]);

  useEffect(() => {
    const handleKey = (e) => {
        const targetCode = `Digit${shortcutIndex + 1}`;
        if (e.shiftKey && e.code === targetCode && !e.target.matches('input, textarea')) {
            e.preventDefault();
            playSfx();
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortcutIndex, track, masterVolume, localVolume]);

  return (
    <div className="relative group w-24">
      <button onClick={playSfx} className={`relative w-full h-20 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden mb-1 ${active ? 'bg-amber-500/30 border-amber-500 scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10'}`}>
        <Zap size={20} className={`transition-colors ${active ? 'text-amber-300' : 'text-amber-600 opacity-80'}`} />
        <span className="text-[10px] font-medium text-zinc-400 truncate w-full px-1 text-center leading-tight">{track.name}</span>
        <div className="absolute top-1 right-1 text-[8px] font-black text-zinc-700 bg-white/10 px-1 rounded">Shift+{shortcutIndex + 1}</div>
        {intervalSec > 0 && <div className="absolute top-1 left-1 flex items-center gap-0.5 text-[8px] text-amber-400 font-mono bg-black/50 px-1 rounded animate-pulse"><Clock size={8} /> {intervalSec}s</div>}
      </button>

      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden group-hover:h-2 transition-all cursor-pointer relative">
          <div className="h-full bg-amber-600/50 group-hover:bg-amber-500 transition-colors" style={{ width: `${localVolume * 100}%` }} />
          <input type="range" min="0" max="1" step="0.1" value={localVolume} onChange={(e) => { const v = Number(e.target.value); setLocalVolume(v); onUpdate(track.id, { volume: v }); }} className="absolute inset-0 opacity-0 cursor-pointer" title={`Volume SFX: ${Math.round(localVolume * 100)}%`} />
      </div>

      <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-zinc-950 rounded-lg border border-white/10 p-1 shadow-xl">
        <button onClick={() => setTimerOpen(!timerOpen)} className={`p-1 rounded hover:bg-white/5 ${intervalSec > 0 ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-200'}`} title="Repetir a cada X segundos"><Clock size={12} /></button>
        <TrackTypeSelector type="sfx" onChange={(newType) => onUpdate(track.id, { type: newType })} />
        <button onClick={() => onDelete(track.id)} className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-white/5"><Trash2 size={12} /></button>
      </div>

      {timerOpen && (
          <div className="absolute top-full left-0 mt-2 z-30 bg-zinc-900 border border-white/10 rounded-lg p-2 shadow-xl w-32">
              <div className="text-[10px] text-zinc-500 mb-1 uppercase font-bold">Repetir (seg)</div>
              <input 
                  type="number" 
                  min="0" 
                  value={intervalSec} 
                  onChange={(e) => setIntervalSec(Number(e.target.value))} 
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-amber-500" 
                  placeholder="0 (Desligado)"
                  autoFocus
              />
              <div className="text-[9px] text-zinc-600 mt-1">0 = Desligado</div>
          </div>
      )}
    </div>
  );
}

// --- MIXER PRINCIPAL ---

export default function Mixer({ playlist = [], onOpenGallery }) {
  const { activeScene, fetchScenes } = useGameStore();
  const sceneId = activeScene?.id;

  const [masterAll, setMasterAll] = useState(1);
  const [masterAmb, setMasterAmb] = useState(1);
  const [masterMusic, setMasterMusic] = useState(1);
  const [masterSfx, setMasterSfx] = useState(1);
  
  // ESTADO DE COMANDO GLOBAL: { type: 'PLAY'|'PAUSE'|'STOP', id: Date.now() }
  // O 'id' garante que o comando seja processado mesmo se for o mesmo tipo repetido
  const [globalCommand, setGlobalCommand] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const backgroundTracks = playlist.filter(t => t.type !== 'sfx');
  const sfxTracks = playlist.filter(t => t.type === 'sfx');

  const addTrack = async (file) => {
    if (!sceneId) return;
    const formData = new FormData(); formData.append('file', file);
    try {
        const res = await fetch(`${BACKEND_URL}/api/upload/audio`, { method: 'POST', body: formData });
        if (res.ok) {
            const { url, name } = await res.json();
            const type = name.toLowerCase().includes('musica') ? 'musica' : (name.toLowerCase().includes('amb') ? 'ambiente' : 'sfx');
            await fetch(`${BACKEND_URL}/api/scenes/${sceneId}/playlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: `track-${Date.now()}`, name, url, type, volume: 0.5 }) });
            fetchScenes();
        }
    } catch (e) { console.error(e); }
  };

  const updateTrack = async (tid, data) => {
      await fetch(`${BACKEND_URL}/api/scenes/${sceneId}/playlist/${tid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (data.type) fetchScenes();
  };

  const deleteTrack = async (tid) => {
      if(!window.confirm('Remover faixa?')) return;
      await fetch(`${BACKEND_URL}/api/scenes/${sceneId}/playlist/${tid}`, { method: 'DELETE' });
      fetchScenes();
  };

  const handleAddFromGallery = async (url, name) => {
      if (!sceneId) return;
      await fetch(`${BACKEND_URL}/api/scenes/${sceneId}/playlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: `track-${Date.now()}`, name: name || 'Audio', url, type: 'sfx', volume: 0.5 }) });
      fetchScenes();
  };

  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) addTrack(e.dataTransfer.files[0]); };

  // --- CONTROLES GLOBAIS ---
  
  const triggerPlay = () => setGlobalCommand({ type: 'PLAY', id: Date.now() });
  
  const triggerPause = () => setGlobalCommand({ type: 'PAUSE', id: Date.now() });

  const triggerStop = () => {
      Howler.stop(); // Garante parada engine global
      setGlobalCommand({ type: 'STOP', id: Date.now() });
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addTrack(e.target.files[0]); e.target.value = ''; }} />
      
      <div className={`h-full w-full bg-black/20 backdrop-blur-sm flex flex-col transition-all duration-300 ${isDragging ? 'bg-indigo-900/20' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}>
        <div className="p-3 border-b border-white/5 bg-zinc-950/40 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest select-none">SoundRack</div>
            <div className="flex items-center gap-1">
                <button onClick={() => onOpenGallery && onOpenGallery(handleAddFromGallery)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition" title="Galeria"><FolderOpen size={16} /></button>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition" title="Upload Local"><UploadCloud size={16} /></button>
                
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                
                {/* BOTÕES DE CONTROLE GLOBAL */}
                <button onClick={triggerPlay} className="p-2 text-emerald-500 hover:text-emerald-200 hover:bg-emerald-900/40 rounded-lg transition" title="Play All (Retomar)"><Play size={16} fill="currentColor" /></button>
                <button onClick={triggerPause} className="p-2 text-amber-500 hover:text-amber-200 hover:bg-amber-900/40 rounded-lg transition" title="Pause All (Manter Posição)"><Pause size={16} fill="currentColor" /></button>
                <button onClick={triggerStop} className="p-2 text-red-500 hover:text-red-200 hover:bg-red-900/40 rounded-lg transition" title="Stop All (Reiniciar do 0)"><Square size={16} fill="currentColor" /></button>
            </div>
          </div>

          <div className="flex gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5 justify-around items-center">
            <SliderGroup label="Master" value={masterAll} setValue={setMasterAll} color="bg-red-500" />
            <div className="w-px h-20 bg-white/5 mx-1"></div>
            <SliderGroup label="Amb" value={masterAmb} setValue={setMasterAmb} color="bg-emerald-500" />
            <SliderGroup label="Music" value={masterMusic} setValue={setMasterMusic} color="bg-indigo-500" />
            <SliderGroup label="SFX" value={masterSfx} setValue={setMasterSfx} color="bg-amber-500" />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-zinc-500 uppercase select-none tracking-wider"><Wind size={14} /> Loops</div>
            <div className="flex flex-col gap-2">
              {backgroundTracks.map((track) => (
                <BackgroundTrack 
                    key={track.id} 
                    track={track} 
                    masterVolume={(track.type === 'musica' ? masterMusic : masterAmb) * masterAll} 
                    onUpdate={updateTrack} 
                    onDelete={deleteTrack} 
                    globalCommand={globalCommand}
                />
              ))}
              {backgroundTracks.length === 0 && <div className="text-xs text-zinc-700 italic text-center py-4 border border-dashed border-zinc-800 rounded-lg">Arraste arquivos aqui</div>}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-zinc-500 uppercase select-none tracking-wider"><Zap size={14} /> SFX (Shift+N)</div>
            <div className="flex gap-3 flex-wrap">
              {sfxTracks.map((track, idx) => (
                <SfxButton key={track.id} track={track} shortcutIndex={idx} masterVolume={masterSfx * masterAll} onUpdate={updateTrack} onDelete={deleteTrack} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}