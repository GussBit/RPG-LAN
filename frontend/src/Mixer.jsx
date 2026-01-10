import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler'; 
import { Volume2, UploadCloud, Trash2, Music, Wind, Zap, Square, Play, Pause } from 'lucide-react';
import { useGameStore } from './store';

const BACKEND_URL = 'http://localhost:3333';

// --- COMPONENTE: FAIXA DE AMBIENTE/MÚSICA (COM PLAY/PAUSE) ---
const BackgroundTrack = ({ track, sceneId, onUpdate, onDelete }) => {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true); // Começa tocando por padrão
  
  useEffect(() => {
    // Cria a instância do áudio
    soundRef.current = new Howl({
      src: [`${BACKEND_URL}${track.url}`],
      html5: true,
      loop: true,
      autoplay: true,
      volume: track.volume,
      // Sincroniza o estado caso o áudio pare por outros motivos
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false)
    });

    return () => {
      if (soundRef.current) soundRef.current.unload();
    };
  }, [track.url]);

  // Atualiza volume em tempo real
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(track.volume);
    }
  }, [track.volume]);

  // Lógica de Retomar/Pausar
  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play(); // O Howler retoma automaticamente de onde parou
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-zinc-900/80 p-3 rounded-lg border border-zinc-700/50 min-w-[300px]">
      {/* Ícone do Tipo */}
      <div className="p-2 rounded-full bg-indigo-900/30 text-indigo-400">
        {track.type === 'musica' ? <Music size={18} /> : <Wind size={18} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm text-zinc-200 truncate pr-2" title={track.name}>
            {track.name}
          </span>
          <select 
             value={track.type}
             onChange={(e) => onUpdate(track.id, { type: e.target.value })}
             className="bg-black text-[10px] text-zinc-500 border border-zinc-800 rounded px-1 outline-none"
          >
             <option value="ambiente">Amb</option>
             <option value="musica">Mus</option>
             <option value="sfx">SFX</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÃO PLAY/PAUSE NOVO */}
          <button 
            onClick={togglePlay}
            className="text-zinc-400 hover:text-white transition-colors focus:outline-none"
            title={isPlaying ? "Pausar" : "Retomar"}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>

          <Volume2 size={12} className="text-zinc-500" />
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={track.volume}
            onChange={(e) => onUpdate(track.id, { volume: parseFloat(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      <button 
        onClick={() => onDelete(track.id)}
        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// --- COMPONENTE: BOTÃO SFX ---
const SfxButton = ({ track, shortcutIndex, onUpdate, onDelete }) => {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [`${BACKEND_URL}${track.url}`],
      html5: true,
      loop: false,
      volume: track.volume,
      onend: () => setIsPlaying(false),
      onplay: () => setIsPlaying(true)
    });

    return () => {
      if (soundRef.current) soundRef.current.unload();
    };
  }, [track.url]);

  useEffect(() => {
    if(soundRef.current) soundRef.current.volume(track.volume);
  }, [track.volume]);

  const play = () => {
    if (soundRef.current) {
      soundRef.current.stop(); // SFX reinicia ao clicar (comportamento padrão)
      soundRef.current.play();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.shiftKey && e.code === `Digit${shortcutIndex + 1}`) {
        e.preventDefault();
        play();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutIndex]);

  return (
    <div className={`relative group bg-zinc-900 border border-zinc-700 hover:border-indigo-500/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer h-28 w-28 shadow-lg select-none active:scale-95`}>
      <div className="absolute inset-0 z-0" onClick={play} />
      <div className="absolute top-1 left-2 text-[10px] font-mono text-zinc-500 bg-black/50 px-1 rounded border border-white/5">
        Shift+{shortcutIndex + 1}
      </div>
      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
         <select 
             value={track.type}
             onClick={(e) => e.stopPropagation()} 
             onChange={(e) => onUpdate(track.id, { type: e.target.value })}
             className="bg-black text-[8px] h-5 text-zinc-400 border border-zinc-700 rounded outline-none"
          >
             <option value="sfx">SFX</option>
             <option value="musica">Mus</option>
          </select>
         <button 
          onClick={(e) => { e.stopPropagation(); onDelete(track.id); }}
          className="bg-red-950/80 text-red-400 p-1 rounded hover:bg-red-900"
        >
          <Trash2 size={10} />
        </button>
      </div>
      <div className={`p-3 rounded-full transition-colors duration-200 pointer-events-none ${isPlaying ? 'bg-amber-500 text-black shadow-[0_0_15px_#f59e0b]' : 'bg-zinc-800 text-zinc-400'}`}>
        <Zap size={24} className={isPlaying ? 'fill-current' : ''} />
      </div>
      <div className="text-center w-full z-20">
        <div className="text-xs font-bold text-zinc-300 truncate w-full px-1 pointer-events-none">{track.name}</div>
        <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={track.volume}
            onClick={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()} 
            onChange={(e) => onUpdate(track.id, { volume: parseFloat(e.target.value) })}
            className="w-16 h-1 mt-2 bg-zinc-700 rounded appearance-none cursor-pointer accent-amber-500 opacity-0 group-hover:opacity-100 transition-opacity relative"
        />
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Mixer({ playlist }) {
  // No Mixer.jsx, adicione este estado logo no início do componente Mixer:
const [globalPlaying, setGlobalPlaying] = useState(true);

// Função para dar Play/Pause em tudo que é Música/Ambiente
const toggleGlobalPlay = () => {
  const newState = !globalPlaying;
  setGlobalPlaying(newState);
  
  // O Howler permite buscar todas as instâncias ativas
  // Mas para ser preciso, usamos o comando global:
  if (newState) {
    // Retoma todas as instâncias que estavam pausadas
    Howler._howls.forEach(h => {
      // Verificamos se é um loop (geralmente música/ambiente no seu código)
      if (h._loop) h.play();
    });
  } else {
    // Pausa todas as instâncias que são loops
    Howler._howls.forEach(h => {
      if (h._loop) h.pause();
    });
  }
};
  const { addTrackToActiveScene, updateTrack, deleteTrack, activeScene } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const fileInputRef = useRef(null);

  const backgroundTracks = playlist.filter(t => t.type === 'ambiente' || t.type === 'musica');
  const sfxTracks = playlist.filter(t => t.type === 'sfx');

  useEffect(() => {
    const handlePanicKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key.toLowerCase() === 'z') {
        setPanicMode(prev => {
          const newState = !prev;
          Howler.mute(newState);
          return newState;
        });
      }
    };
    window.addEventListener('keydown', handlePanicKey);
    return () => window.removeEventListener('keydown', handlePanicKey);
  }, []);

  const handleFile = async (file) => {
    const defaultType = file.size < 500000 ? 'sfx' : 'musica';
    try {
      await addTrackToActiveScene(file, defaultType);
    } catch (error) {
      alert('Erro ao enviar áudio');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const stopAllAudio = () => {
    Howler.stop(); 
  };

  return (
    <>
      {panicMode && (
        <div className="fixed inset-0 z-[9999] bg-white text-black flex items-start justify-center pt-20 font-mono text-sm">
           <div className="w-full max-w-4xl p-8 border border-gray-300 shadow-sm bg-white">
              <h1 className="text-xl font-bold mb-4 border-b pb-2">Relatório Financeiro Trimestral - Q3 2024</h1>
              <div className="grid grid-cols-4 gap-4 text-gray-600">
                 <div className="font-bold border-b">Categoria</div>
                 <div className="font-bold border-b">Previsto</div>
                 <div className="font-bold border-b">Realizado</div>
                 <div className="font-bold border-b">Delta</div>
                 <div>Operacional</div><div>R$ 45.000</div><div>R$ 42.100</div><div className="text-green-600">+6.4%</div>
                 <div>Marketing</div><div>R$ 12.000</div><div>R$ 15.400</div><div className="text-red-600">-28.3%</div>
                 <div>Logística</div><div>R$ 8.500</div><div>R$ 8.200</div><div className="text-green-600">+3.5%</div>
              </div>
              <p className="mt-8 text-xs text-gray-400">Pressione 'Z' para retornar ao sistema.</p>
           </div>
        </div>
      )}

      <div 
        className={`fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-indigo-500/20 z-40 transition-all duration-300 ${isDragging ? 'bg-indigo-900/20' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex h-48">
          {/* --- BARRA LATERAL ESQUERDA --- */}
<div className="w-12 border-r border-white/10 flex flex-col items-center py-4 bg-zinc-950/50 gap-4">
  
  <div className="flex-1 flex items-center justify-center">
    <div className="rotate-180 writing-vertical-lr text-xs font-black text-zinc-600 uppercase tracking-widest cursor-default select-none whitespace-nowrap">
      Soundboard
    </div>
  </div>

  <div className="flex flex-col gap-2 mb-2">
    {/* --- BOTÃO PLAY/PAUSE GLOBAL --- */}
    <button 
      onClick={toggleGlobalPlay}
      className={`p-2 rounded-lg transition-all ${globalPlaying ? 'text-indigo-400 bg-indigo-500/10' : 'text-amber-500 bg-amber-500/10 animate-pulse'}`}
      title={globalPlaying ? "Pausar Tudo" : "Retomar Tudo"}
    >
      {globalPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
    </button>

    <button 
      onClick={() => fileInputRef.current?.click()}
      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      title="Upload de Áudio"
    >
      <UploadCloud size={20} />
    </button>
    
    <button 
      onClick={stopAllAudio}
      className="p-2 text-red-500 hover:text-red-200 hover:bg-red-900/40 rounded-lg transition-colors"
      title="Parar Total (Reset)"
    >
      <Square size={20} fill="currentColor" />
    </button>
  </div>
</div>

          <div className="flex-1 p-4 border-r border-white/10 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-500 uppercase select-none">
               <Wind size={14} /> Ambiente & Música (Loop)
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {backgroundTracks.map(track => (
                 <BackgroundTrack 
                   key={track.id} 
                   track={track} 
                   sceneId={activeScene.id} 
                   onUpdate={(tid, data) => updateTrack(activeScene.id, tid, data)}
                   onDelete={(tid) => deleteTrack(activeScene.id, tid)}
                 />
              ))}
              {backgroundTracks.length === 0 && (
                <div className="text-zinc-600 text-sm italic py-4 select-none">Arraste arquivos aqui para tocar música...</div>
              )}
            </div>
          </div>

          <div className="w-[450px] p-4 bg-zinc-950/30 overflow-x-auto custom-scrollbar">
             <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-500 uppercase select-none">
               <Zap size={14} /> SFX (Shift + 1..9)
            </div>
            <div className="flex gap-3 pb-2">
              {sfxTracks.map((track, idx) => (
                <SfxButton 
                  key={track.id} 
                  track={track} 
                  shortcutIndex={idx}
                  onUpdate={(tid, data) => updateTrack(activeScene.id, tid, data)}
                  onDelete={(tid) => deleteTrack(activeScene.id, tid)}
                />
              ))}
               {sfxTracks.length === 0 && (
                <div className="text-zinc-600 text-sm italic py-4 select-none">...ou aqui para efeitos sonoros</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}