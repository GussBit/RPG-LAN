import React from 'react';
import { getImageUrl } from '../../constants';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function InventoryItemCard({ item, index, onClick, onUpdateQuantity, onRemove, viewMode = 'expanded' }) {
  // Normaliza as tags
  const tags = item.renderData?.tags || 
    (item.caracteristicas ? item.caracteristicas.split('\n')[0].split(',') : []);

  // Helper para gerar iniciais
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Resolve imagem
  const imageSrc = item.image 
    ? getImageUrl(item.image) 
    : (item._folder ? `/${item._folder}/${item.nome_ingles || item.nome}.png` : null);

  const quantity = item.quantity || item.quantidade || 1;

  // MODO COMPACTO - Só imagem e título
  if (viewMode === 'compact') {
    return (
      <div
        onClick={onClick}
        className="group relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-lg overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer"
      >
        {/* Badge de Quantidade */}
        {quantity > 1 && (
          <div className="absolute top-1 right-1 z-10 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
            ×{quantity}
          </div>
        )}

        {/* Badge de Invisível */}
        {item.invisivel && (
          <div className="absolute top-1 left-1 z-10 bg-red-600/80 text-white text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded-full backdrop-blur-sm">
            🚫
          </div>
        )}

        {/* Imagem ou Iniciais - SEM PADDING, COLADO NO TOPO */}
        <div className="aspect-square w-full bg-gradient-to-br from-zinc-800 to-black relative overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.nome}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback - Iniciais */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ display: imageSrc ? 'none' : 'flex' }}
          >
            <span className="text-2xl sm:text-3xl font-black text-white/20 select-none">
              {getInitials(item.nome)}
            </span>
          </div>

          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          
          {/* Título sobre a imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
            <h3 className="text-[10px] sm:text-xs font-bold text-white leading-tight line-clamp-2 break-words drop-shadow-lg hyphens-auto">
              {item.nome}
            </h3>
          </div>
        </div>

        {/* Indicador de "Toque para abrir" */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-indigo-600 rounded-full p-0.5 sm:p-1">
            <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // MODO EXPANDIDO - Completo com descrição e tags
  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Badge de Quantidade */}
      {quantity > 1 && (
        <div className="absolute top-2 right-2 z-10 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          ×{quantity}
        </div>
      )}

      {/* Badge de Invisível */}
      {item.invisivel && (
        <div className="absolute top-2 left-2 z-10 bg-red-600/80 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          🚫 Oculto
        </div>
      )}

      {/* Imagem ou Iniciais - SEM PADDING, COLADO NO TOPO */}
      <div className="aspect-square w-full bg-gradient-to-br from-zinc-800 to-black relative overflow-hidden flex-shrink-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback - Iniciais */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: imageSrc ? 'none' : 'flex' }}
        >
          <span className="text-4xl font-black text-white/20 select-none">
            {getInitials(item.nome)}
          </span>
        </div>

        {/* Overlay gradiente na imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Info do Item */}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        {/* Nome - com quebra de palavra */}
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 text-left break-words hyphens-auto">
          {item.nome}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] text-indigo-300 uppercase tracking-wider"
              >
                {tag.trim()}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 bg-zinc-700/50 border border-zinc-600/30 rounded text-[10px] text-zinc-400">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Descrição Curta */}
        {item.descricao && (
          <p className="text-xs text-zinc-400 line-clamp-2 text-left break-words">
            {item.descricao}
          </p>
        )}
      </div>

      {/* Controles de Ação (Visíveis no Hover ou sempre em mobile se desejar) */}
      {(onUpdateQuantity || onRemove) && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={e => e.stopPropagation()}>
          {onUpdateQuantity && (
            <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden shadow-xl">
              <button 
                onClick={() => onUpdateQuantity(index, -1)}
                className="p-1.5 hover:bg-white/10 text-zinc-300 hover:text-red-400 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-mono w-5 text-center text-white font-bold">
                {quantity}
              </span>
              <button 
                onClick={() => onUpdateQuantity(index, 1)}
                className="p-1.5 hover:bg-white/10 text-zinc-300 hover:text-emerald-400 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
          {onRemove && (
            <button 
              onClick={() => onRemove(index)}
              className="p-1.5 bg-black/60 backdrop-blur-md hover:bg-red-900/80 border border-white/10 hover:border-red-500/50 rounded-lg text-zinc-400 hover:text-red-400 transition-colors shadow-xl"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* Indicador de "Toque para abrir" */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-indigo-600 rounded-full p-1.5">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
