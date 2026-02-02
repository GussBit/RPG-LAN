import React from 'react';
import { Shield, Heart, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../../constants';

export default function PlayerSheet({ player, updateHP, toggleCondition, conditionsList }) {
    const hpPercent = (player.currentHp / player.maxHp) * 100;
    const isLowHp = hpPercent < 30;
    const isMediumHp = hpPercent >= 30 && hpPercent < 70;
    const conditions = player.conditions || [];
    const isDead = player.currentHp <= 0;

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
            {/* Card do Personagem */}
            <div
                className={`bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all ${
                    isDead ? 'grayscale brightness-50 border-red-900' : ''
                } ${
                    conditions.includes('prone') ? 'transform rotate-3 scale-95 opacity-90' : ''
                } ${
                    conditions.includes('invisible') ? 'opacity-40 border-dashed border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''
                } ${
                    conditions.includes('charmed') ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : ''
                } ${
                    conditions.includes('frightened') ? 'border-purple-500 animate-pulse' : ''
                } ${
                    conditions.includes('paralyzed') ? 'contrast-150 brightness-125 grayscale' : ''
                }`}
            >
                {/* Foto - Reduzida */}
                <div className="h-64 sm:h-80 relative bg-gradient-to-br from-indigo-500/20 via-zinc-900/50 to-purple-500/20">
                    {player.photo ? (
                        <img
                            src={getImageUrl(player.photo)}
                            alt={player.characterName}
                            className={`absolute inset-0 w-full h-full object-cover ${
                                conditions.includes('blinded') ? 'brightness-[0.2] blur-[1px] grayscale' : ''
                            } ${
                                conditions.includes('restrained') ? 'border-4 border-dashed border-zinc-600' : ''
                            }`}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-20 h-20 sm:w-24 sm:h-24 text-zinc-700" />
                        </div>
                    )}
                    
                    {/* Overlays de Imagem */}
                    {conditions.includes('poisoned') && <div className="absolute inset-0 bg-green-500/30 animate-pulse pointer-events-none" />}
                    {conditions.includes('charmed') && <div className="absolute inset-0 bg-pink-500/20 animate-pulse pointer-events-none" />}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                </div>

                {/* Info - Mais compacta */}
                <div className="p-4 sm:p-5 space-y-4">
                    {/* Nome */}
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight mb-0.5">
                            {player.characterName}
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-widest">
                            {player.playerName}
                        </p>
                    </div>

                    {/* Barra de HP */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Heart
                                    size={18}
                                    className={
                                        isLowHp
                                            ? 'text-red-500'
                                            : isMediumHp
                                            ? 'text-yellow-500'
                                            : 'text-emerald-500'
                                    }
                                    fill="currentColor"
                                />
                                <span className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Pontos de Vida
                                </span>
                            </div>
                            <span className="text-base sm:text-lg font-black text-zinc-100">
                                {player.currentHp} / {player.maxHp}
                            </span>
                        </div>

                        {/* Barra Visual */}
                        <div className="h-5 sm:h-6 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    isLowHp
                                        ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                                        : isMediumHp
                                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                                        : 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                }`}
                                style={{ width: `%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {Math.round(hpPercent)}%
                            </div>
                        </div>
                    </div>

                    {/* Controles de HP */}
                    <div className="space-y-1.5">
                        <div className="flex gap-1.5 justify-center">
                            <button
                                onClick={() => updateHP(-10)}
                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 rounded-lg text-red-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                -10
                            </button>
                            <button
                                onClick={() => updateHP(-5)}
                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 rounded-lg text-red-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                -5
                            </button>
                            <button
                                onClick={() => updateHP(-1)}
                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 rounded-lg text-red-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                -1
                            </button>
                        </div>

                        <div className="flex gap-1.5 justify-center">
                            <button
                                onClick={() => updateHP(1)}
                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                +1
                            </button>
                            <button
                                onClick={() => updateHP(5)}
                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                +5
                            </button>
                            <button
                                onClick={() => updateHP(10)}
                                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                +10
                            </button>
                        </div>
                    </div>

                    {/* Condições */}
                    <div className="space-y-2 border-t border-white/10 pt-4">
                        <div className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">
                            Condições
                        </div>

                        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                            {conditionsList.map(condition => {
                                const Icon = condition.icon;
                                const isActive = (player.conditions || []).includes(condition.id);
                                return (
                                    <button
                                        key={condition.id}
                                        onClick={() => toggleCondition(condition.id)}
                                        className={`aspect-square rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                            isActive
                                                ? `${condition.color} text-white shadow-lg`
                                                : 'bg-zinc-800/50 text-zinc-600 hover:bg-zinc-700/50'
                                        }`}
                                        title={condition.label}
                                    >
                                        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Alert */}
                    {isLowHp && (
                        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 text-center">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mx-auto mb-1.5" />
                            <p className="text-xs sm:text-sm font-bold text-red-300">
                                Atenção! Vida Crítica
                            </p>
                            <p className="text-[10px] sm:text-xs text-red-400/80 mt-0.5">
                                Procure cura imediatamente
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4 text-center">
                <p className="text-[10px] sm:text-xs text-zinc-600">
                    Atualização automática a cada 1.5s
                </p>
            </div>
        </div>
    );
}
