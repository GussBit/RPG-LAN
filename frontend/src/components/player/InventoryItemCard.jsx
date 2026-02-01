import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function InventoryItemCard({ item, index, onRemove }) {
    const [expanded, setExpanded] = useState(false);
    
    // Extrai primeira linha de características (tipo, nível, escola)
    const firstCharLine = item.caracteristicas?.split('\n')[0] || '';
    
    return (
        <div className="bg-zinc-900/80 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all group">
            {/* Header Compacto - Sempre Visível */}
            <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-zinc-200 text-sm sm:text-base truncate">
                                {item.nome}
                            </h3>
                            {item.nome_ingles && (
                                <span className="text-[10px] text-indigo-400/60 font-mono hidden sm:inline">
                                    {item.nome_ingles}
                                </span>
                            )}
                        </div>
                        
                        {/* Tags de Características */}
                        {firstCharLine && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {firstCharLine.split(',').slice(0, 3).map((tag, i) => (
                                    <span 
                                        key={i} 
                                        className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex gap-1 shrink-0">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title={expanded ? 'Recolher' : 'Ver Mais'}
                        >
                            {expanded ? (
                                <ChevronUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                            ) : (
                                <ChevronDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                            )}
                        </button>
                        <button
                            onClick={() => onRemove(index)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover"
                        >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Detalhes Expandíveis */}
            {expanded && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                    {/* Nome em Inglês (mobile) */}
                    {item.nome_ingles && (
                        <div className="text-[10px] text-indigo-400/80 font-mono mb-3 sm:hidden">
                            {item.nome_ingles}
                        </div>
                    )}
                    
                    {/* Características Completas */}
                    {item.caracteristicas && (
                        <div className="bg-black/20 rounded-lg p-2 sm:p-3 mb-3 space-y-1">
                            {item.caracteristicas.split('\n').slice(1).map((line, i) => {
                                const [key, val] = line.split(':');
                                if (!val) return null;
                                return (
                                    <div key={i} className="flex items-start gap-2 text-[10px] sm:text-xs">
                                        <span className="font-bold text-zinc-500 uppercase tracking-wide min-w-[80px] shrink-0">
                                            {key.trim()}
                                        </span>
                                        <span className="text-zinc-300">
                                            {val.trim()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Descrição */}
                    <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-950/50 rounded-lg p-3 border-l-2 border-indigo-500/30">
                        {item.descricao}
                    </div>
                </div>
            )}
        </div>
    );
}
