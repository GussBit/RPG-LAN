import React from 'react';
import { Copy, Trash2, Edit2 } from 'lucide-react';
import { getImageUrl } from '../../constants';

export default function SceneCard({ scene, isActive, onSelect, onDuplicate, onDelete, onOpenMap, onEdit }) {
  const mobsCount = (scene.mobs || []).length;
  const tracksCount = (scene.playlist || []).length;

  return (
    <div className={[
      'group rounded-2xl border border-white/10 bg-zinc-900/30 backdrop-blur-md overflow-hidden',
      'shadow-[0_25px_80px_rgba(0,0,0,0.45)]', 'transition hover:border-white/20',
      isActive ? 'ring-1 ring-indigo-500/40 bg-indigo-500/10' : '',
    ].join(' ')}>
      <button onClick={onSelect} className="w-full text-left" title="Selecionar cena">
        <div className="flex">
          <div className="w-[120px] shrink-0">
            <div className="w-full h-full bg-black/30 relative">

              {scene.background ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getImageUrl(scene.background)})` }} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-zinc-900/10 to-amber-500/10" />
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>
          </div>
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xl font-black tracking-tight text-zinc-100 uppercase truncate">{scene.name}</div>
                <div className="mt-2 text-sm text-indigo-300/80 leading-tight">{tracksCount} trilhas<br />{mobsCount} mobs</div>
              </div>
              <div className="flex flex-col gap-2 opacity-100">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200">
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate(); }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200">
                  <Copy size={16} />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 text-red-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenMap(); }} className="text-sm text-zinc-200/80 hover:text-zinc-100 underline decoration-white/20 hover:decoration-white/40 underline-offset-4">
                Ver mapa
              </button>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
