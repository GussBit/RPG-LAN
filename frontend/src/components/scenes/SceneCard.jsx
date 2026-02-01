import React from 'react';
import { Copy, Trash2, Edit2, Map as MapIcon, Music, Users } from 'lucide-react';
import { getImageUrl } from '../../constants';
import { twMerge } from 'tailwind-merge';

export default function SceneCard({ scene, isActive, onSelect, onDuplicate, onDelete, onOpenMap, onEdit }) {
  const mobsCount = (scene.mobs || []).length;
  const tracksCount = (scene.playlist || []).length;

  return (
    <div 
      className={twMerge(
        "group relative w-full rounded-xl overflow-hidden transition-all duration-300 border",
        // Estado Ativo vs Inativo
        isActive 
          ? "border-indigo-500/50 bg-indigo-950/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]" 
          : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/10 hover:shadow-lg"
      )}
    >
      {/* --- Clicável Principal (Selecionar Cena) --- */}
      <button 
        onClick={onSelect} 
        className="absolute inset-0 w-full h-full z-10 cursor-pointer focus:outline-none"
        title="Selecionar cena"
      />

      <div className="flex h-32 relative">
        {/* --- Imagem de Fundo com Degradê --- */}
        <div className="absolute inset-0 w-full h-full">
          {scene.background ? (
            <div className="w-full h-full relative">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${getImageUrl(scene.background)})` }} 
              />
              {/* Degradê para escurecer a imagem e permitir leitura do texto */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
          )}
        </div>

        {/* --- Conteúdo --- */}
        <div className="relative z-20 flex flex-col justify-between p-4 w-full h-full pointer-events-none">
          
          {/* Topo: Título e Status */}
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className={twMerge(
                "text-lg font-bold leading-tight truncate tracking-wide transition-colors",
                isActive ? "text-indigo-200" : "text-zinc-100 group-hover:text-white"
              )}>
                {scene.name}
              </h3>
              
              {/* Badges de Contagem */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                  <Music size={12} className={tracksCount > 0 ? "text-indigo-400" : "text-zinc-600"} />
                  <span>{tracksCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                  <Users size={12} className={mobsCount > 0 ? "text-emerald-400" : "text-zinc-600"} />
                  <span>{mobsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé: Botões de Ação (Pointer Events restaurados para os botões) */}
          <div className="flex items-center justify-between mt-auto pt-2 pointer-events-auto">
            
            {/* Botão Mapa */}
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenMap(); }}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
            >
              <MapIcon size={14} />
              <span>Mapa</span>
            </button>

            {/* Grupo de Ações (Editar, Duplicar, Deletar) */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 translate-y-2 sm:translate-y-0">
              <ActionButton icon={<Edit2 size={14} />} onClick={onEdit} tooltip="Editar" />
              <ActionButton icon={<Copy size={14} />} onClick={onDuplicate} tooltip="Duplicar" />
              <ActionButton icon={<Trash2 size={14} />} onClick={onDelete} variant="danger" tooltip="Excluir" />
            </div>
          </div>
        </div>

        {/* Indicador Ativo (Barra lateral) */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[2px_0_12px_rgba(99,102,241,0.8)] z-30" />
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para botões pequenos
function ActionButton({ icon, onClick, variant = 'neutral', tooltip }) {
  const baseClass = "p-1.5 rounded-lg border transition-all duration-200 active:scale-95 z-30 relative";
  const variants = {
    neutral: "bg-zinc-800/50 hover:bg-zinc-700 border-white/5 hover:border-white/20 text-zinc-400 hover:text-white",
    danger: "bg-red-950/30 hover:bg-red-900/50 border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-200"
  };

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }} 
      className={twMerge(baseClass, variants[variant])}
      title={tooltip}
    >
      {icon}
    </button>
  );
}