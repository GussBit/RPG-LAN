import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles,
  Package,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Modal from '../ui/Modal';
import { getImageUrl } from '../../constants';

export default function ItemDetailsModal({ 
  item, 
  open,
  onClose, 
  onRemove, 
  onUpdateQuantity, 
  onToggleVisibility,
  isGM = false 
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [compactView, setCompactView] = useState(false);

  if (!item) return null;

  // Normaliza propriedades (suporta legado 'quantidade'/'invisivel' e novo 'quantity'/'visible')
  const quantity = item.quantity || item.quantidade || 1;
  const isHidden = item.visible === false || item.invisivel;

  const imageSrc = item.image
    ? getImageUrl(item.image)
    : (item._folder ? `/${item._folder}/${item.nome_ingles || item.nome}.png` : null);

  const tags = item.renderData?.tags || 
    (item.caracteristicas ? item.caracteristicas.split('\n')[0].split(',') : []);

  const handleRemove = async () => {
    if (!isRemoving) {
      setIsRemoving(true);
      setTimeout(() => setIsRemoving(false), 3000);
      return;
    }
    
    if (onRemove) {
      await onRemove(item);
      onClose();
    }
  };

  const handleQuantityChange = (delta) => {
    if (onUpdateQuantity) {
      const newQuantity = Math.max(1, quantity + delta);
      onUpdateQuantity(item, newQuantity);
    }
  };

  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility(item);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="relative pb-4 sm:pb-6">
        {/* Header Fixo com Título e Botões */}
        <div className="absolute top-0 right-0 z-20 flex items-center gap-1.5 sm:gap-2 -mt-1 -mr-1">
          {/* Título do Item (sempre visível) */}
          <div className="max-w-[180px] sm:max-w-[240px] bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5">
            <h3 className="text-[10px] sm:text-xs font-bold text-white truncate">
              {item.nome}
            </h3>
          </div>

          {/* Toggle Compact View */}
          <button
            onClick={() => setCompactView(!compactView)}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-full flex items-center justify-center transition-colors"
            title={compactView ? 'Visão Completa' : 'Visão Compacta'}
          >
            {compactView ? (
              <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
            ) : (
              <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
            )}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
          </button>
        </div>

        {/* MODO COMPACTO */}
        {compactView ? (
          <div className="space-y-3 pt-10">
            {/* Imagem Compacta */}
            {imageSrc ? (
              <div className="relative w-full aspect-square max-h-[40vh] rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                <img
                  src={imageSrc}
                  alt={item.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 hidden flex-col items-center justify-center bg-zinc-900">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700 mb-2" />
                </div>
                {isHidden && (
                  <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <EyeOff className="w-2.5 h-2.5" />
                    Oculto
                  </div>
                )}
                {quantity > 1 && (
                  <div className="absolute top-2 right-2 bg-indigo-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold">
                    ×{quantity}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-square max-h-[40vh] rounded-lg bg-gradient-to-br from-zinc-900 to-black flex flex-col items-center justify-center">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700 mb-2" />
              </div>
            )}

            {/* Título Compacto (repetido abaixo da imagem para contexto) */}
            <h2 className="text-base sm:text-lg font-black text-white leading-tight px-1 break-words hyphens-auto">
              {item.nome}
            </h2>

            {/* Tags Compactas */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 px-1">
                {tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] text-indigo-300 uppercase tracking-wider font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Controles Compactos */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {onUpdateQuantity && (
                <div className="flex items-center justify-between bg-zinc-900/50 border border-white/5 rounded-lg p-2">
                  <span className="text-xs font-medium text-zinc-300">Qtd</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-base font-bold text-white min-w-[1.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {isGM && onToggleVisibility && (
                <button
                  onClick={handleToggleVisibility}
                  className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors text-xs ${
                    isHidden
                      ? 'bg-red-900/20 border border-red-500/30 hover:bg-red-900/30'
                      : 'bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="font-medium text-zinc-300">
                    {isHidden ? 'Oculto' : 'Visível'}
                  </span>
                  {isHidden ? (
                    <EyeOff className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              )}

              {onRemove && (
                <button
                  onClick={handleRemove}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-lg p-2 transition-all text-xs ${
                    isRemoving
                      ? 'bg-red-600 hover:bg-red-700 border-red-500'
                      : 'bg-zinc-900/50 hover:bg-red-900/20 border-white/5 hover:border-red-500/30'
                  } border`}
                >
                  <Trash2 className={`w-3 h-3 ${isRemoving ? 'text-white' : 'text-zinc-400'}`} />
                  <span className={`font-medium ${isRemoving ? 'text-white' : 'text-zinc-400'}`}>
                    {isRemoving ? 'Confirmar?' : 'Remover'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MODO COMPLETO */
          <div className="pt-10">
            {/* Header com Imagem */}
            <div className="relative mb-3 sm:mb-4">
              {imageSrc ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                  <img
                    src={imageSrc}
                    alt={item.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback').style.display = 'flex';
                    }}
                  />
                  <div className="fallback absolute inset-0 hidden flex-col items-center justify-center">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700 mb-2" />
                    <span className="text-xs sm:text-sm text-zinc-600">Sem imagem</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-zinc-900 to-black flex flex-col items-center justify-center">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700 mb-2" />
                  <span className="text-xs sm:text-sm text-zinc-600">Sem imagem</span>
                </div>
              )}

              {isHidden && (
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-600/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-2">
                  <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Oculto dos Jogadores</span>
                  <span className="sm:hidden">Oculto</span>
                </div>
              )}

              {quantity > 1 && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-indigo-600/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold">
                  ×{quantity}
                </div>
              )}
            </div>

            {/* Nome do Item (grande) */}
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4 leading-tight px-0.5 break-words hyphens-auto">
              {item.nome}
            </h2>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5 px-0.5">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-md sm:rounded-lg text-[10px] sm:text-xs text-indigo-300 uppercase tracking-wider font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Descrição */}
            {item.descricao && (
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Descrição
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line break-words bg-zinc-900/50 border border-white/5 rounded-lg p-3 sm:p-4">
                  {item.descricao}
                </p>
              </div>
            )}

            {/* Estatísticas */}
            {item.renderData?.stats && item.renderData.stats.length > 0 && (
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Atributos
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {item.renderData.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900/50 border border-white/5 rounded-lg p-2.5 sm:p-3 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                        {stat.label}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white break-words">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: Características */}
            {!item.renderData?.stats && item.caracteristicas && (
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Características
                  </h3>
                </div>
                <pre className="text-[10px] sm:text-xs text-zinc-400 whitespace-pre-wrap break-words font-mono bg-zinc-900/50 border border-white/5 rounded-lg p-3 sm:p-4">
                  {item.caracteristicas}
                </pre>
              </div>
            )}

            {/* Controles - COM PADDING MAIOR NO BOTTOM */}
            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 pb-4 sm:pb-6 border-t border-white/10">
              {onUpdateQuantity && (
                <div className="flex items-center justify-between bg-zinc-900/50 border border-white/5 rounded-lg p-2.5 sm:p-3">
                  <span className="text-xs sm:text-sm font-medium text-zinc-300">
                    Quantidade
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-md sm:rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </button>
                    <span className="text-base sm:text-lg font-bold text-white min-w-[1.5rem] sm:min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-md sm:rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {isGM && onToggleVisibility && (
                <button
                  onClick={handleToggleVisibility}
                  className={`w-full flex items-center justify-between rounded-lg p-2.5 sm:p-3 transition-colors ${
                    isHidden
                      ? 'bg-red-900/20 border border-red-500/30 hover:bg-red-900/30'
                      : 'bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium text-zinc-300">
                    {isHidden ? 'Item Oculto' : 'Item Visível'}
                  </span>
                  <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg ${
                    isHidden ? 'bg-red-600' : 'bg-indigo-600'
                  }`}>
                    {isHidden ? (
                      <>
                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-[10px] sm:text-xs font-medium text-white">
                          Mostrar
                        </span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-[10px] sm:text-xs font-medium text-white">
                          Ocultar
                        </span>
                      </>
                    )}
                  </div>
                </button>
              )}

              {onRemove && (
                <button
                  onClick={handleRemove}
                  className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg p-2.5 sm:p-3 transition-all ${
                    isRemoving
                      ? 'bg-red-600 hover:bg-red-700 border-red-500'
                      : 'bg-zinc-900/50 hover:bg-red-900/20 border-white/5 hover:border-red-500/30'
                  } border`}
                >
                  <Trash2 className={`w-3 h-3 sm:w-4 sm:h-4 ${isRemoving ? 'text-white' : 'text-zinc-400'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${
                    isRemoving ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {isRemoving ? 'Confirmar Remoção?' : 'Remover do Inventário'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
