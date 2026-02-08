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
    <div className="w-full max-w-md mx-auto px-3 sm:px-0 animate-in fade-in zoom-in duration-300">
      {/* Card Principal com Imagem de Fundo */}
      <div
        className={`relative overflow-hidden rounded-2xl shadow-2xl transition-all min-h-[700px] sm:min-h-[800px] ${
          isDead ? 'grayscale brightness-50' : ''
        } ${
          conditions.includes('prone') ? 'transform rotate-3 scale-95 opacity-90' : ''
        } ${
          conditions.includes('invisible') ? 'opacity-40 border-dashed border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''
        } ${
          conditions.includes('charmed') ? 'border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : ''
        } ${
          conditions.includes('frightened') ? 'border-2 border-purple-500 animate-pulse' : ''
        } ${
          conditions.includes('paralyzed') ? 'contrast-150 brightness-125 grayscale' : ''
        }`}
      >
        {/* CAMADA 1: Imagem de Fundo */}
        <div className="absolute inset-0 z-0">
          {player.photo ? (
            <img
              src={getImageUrl(player.photo)}
              alt={player.characterName}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover object-top ${
                conditions.includes('blinded') ? 'brightness-[0.2] blur-[1px] grayscale' : ''
              } ${
                conditions.includes('restrained') ? 'border-4 border-dashed border-zinc-600' : ''
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-zinc-900/50 to-purple-500/20 flex items-center justify-center">
              <Shield className="w-32 h-32 text-zinc-700/50" />
            </div>
          )}
        </div>

        {/* CAMADA 2: Gradiente de Escurecimento */}
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-black/40 to-black/90 pointer-events-none" />

        {/* CAMADA 3: Overlays de Condições */}
        {conditions.includes('poisoned') && (
          <div className="absolute inset-0 z-2 bg-green-500/30 animate-pulse pointer-events-none" />
        )}
        {conditions.includes('charmed') && (
          <div className="absolute inset-0 z-2 bg-pink-500/20 animate-pulse pointer-events-none" />
        )}

        {/* CAMADA 4: Conteúdo com Efeito de Vidro - COLADO NO FUNDO */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Wrapper com Glass Morphism - SEM MARGEM INFERIOR */}
          <div className="backdrop-blur-md bg-black/50 border-t border-white/10 rounded-t-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
            
            {/* Nome do Personagem */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 leading-tight break-words px-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                {player.characterName}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {player.playerName}
              </p>
            </div>

            {/* Barra de HP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg ${
                      isLowHp
                        ? 'text-red-500'
                        : isMediumHp
                        ? 'text-yellow-500'
                        : 'text-emerald-500'
                    }`}
                    fill="currentColor"
                  />
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider drop-shadow-lg">
                    HP
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {player.currentHp} / {player.maxHp}
                </span>
              </div>

              {/* Barra Visual */}
              <div className="h-7 sm:h-8 w-full bg-black/70 rounded-full overflow-hidden border-2 border-white/20 relative shadow-lg">
                <div
                  className={`h-full transition-all duration-500 ${
                    isLowHp
                      ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                      : isMediumHp
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                  {Math.round(hpPercent)}%
                </div>
              </div>
            </div>

            {/* Controles de HP */}
            <div className="space-y-2">
              {/* Dano (Red) */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => updateHP(-10)}
                  className="flex-1 max-w-[90px] h-11 sm:h-12 bg-red-950/80 hover:bg-red-900/90 active:bg-red-900 border-2 border-red-500/50 rounded-xl text-red-200 font-bold text-base sm:text-lg transition-all active:scale-95 touch-manipulation shadow-lg backdrop-blur-sm"
                >
                  -10
                </button>
                <button
                  onClick={() => updateHP(-5)}
                  className="flex-1 max-w-[90px] h-11 sm:h-12 bg-red-950/80 hover:bg-red-900/90 active:bg-red-900 border-2 border-red-500/50 rounded-xl text-red-200 font-bold text-base sm:text-lg transition-all active:scale-95 touch-manipulation shadow-lg backdrop-blur-sm"
                >
                  -5
                </button>
                <button
                  onClick={() => updateHP(-1)}
                  className="flex-1 max-w-[90px] h-11 sm:h-12 bg-red-950/80 hover:bg-red-900/90 active:bg-red-900 border-2 border-red-500/50 rounded-xl text-red-200 font-bold text-base sm:text-lg transition-all active:scale-95 touch-manipulation shadow-lg backdrop-blur-sm"
                >
                  -1
                </button>
              </div>

              {/* Cura (Green) */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => updateHP(1)}
                  className="flex-1 max-w-[90px] h-11 sm:h-12 bg-emerald-950/80 hover:bg-emerald-900/90 active:bg-emerald-900 border-2 border-emerald-500/50 rounded-xl text-emerald-200 font-bold text-base sm:text-lg transition-all active:scale-95 touch-manipulation shadow-lg backdrop-blur-sm"
                >
                  +1
                </button>
                <button
                  onClick={() => updateHP(5)}
                  className="flex-1 max-w-[90px] h-11 sm:h-12 bg-emerald-950/80 hover:bg-emerald-900/90 active:bg-emerald-900 border-2 border-emerald-500/50 rounded-xl text-emerald-200 font-bold text-base sm:text-lg transition-all active:scale-95 touch-manipulation shadow-lg backdrop-blur-sm"
                >
                  +5
                </button>
                <button
                  onClick={() => updateHP(10)}
                  className="flex-1 max-w-[90px] h-11 sm:h-12 bg-emerald-950/80 hover:bg-emerald-900/90 active:bg-emerald-900 border-2 border-emerald-500/50 rounded-xl text-emerald-200 font-bold text-base sm:text-lg transition-all active:scale-95 touch-manipulation shadow-lg backdrop-blur-sm"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Status Alert */}
            {isLowHp && (
              <div className="bg-red-950/90 border-2 border-red-500/50 rounded-xl p-3 text-center animate-pulse backdrop-blur-sm shadow-2xl">
                <AlertCircle className="w-6 h-6 text-red-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-red-200">
                  ⚠️ Vida Crítica!
                </p>
                <p className="text-xs text-red-300/90 mt-1">
                  Procure cura imediatamente
                </p>
              </div>
            )}

            {/* Condições */}
            <div className="space-y-3 border-t border-white/20 pt-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider text-center drop-shadow-lg">
                Condições
              </div>

              <div className="grid grid-cols-6 gap-2">
                {conditionsList.map(condition => {
                  const Icon = condition.icon;
                  const isActive = conditions.includes(condition.id);
                  return (
                    <button
                      key={condition.id}
                      onClick={() => toggleCondition(condition.id)}
                      className={`aspect-square rounded-full flex items-center justify-center transition-all active:scale-90 touch-manipulation min-h-[44px] sm:min-h-0 shadow-lg backdrop-blur-sm ${
                        isActive
                          ? `${condition.color} text-white shadow-xl border-2 border-white/30`
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 active:bg-zinc-700 border-2 border-white/10'
                      }`}
                      title={condition.label}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  );
                })}
              </div>

              {/* Labels das Condições Ativas */}
              {conditions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center pt-2 pb-2">
                  {conditions.map(condId => {
                    const cond = conditionsList.find(c => c.id === condId);
                    if (!cond) return null;
                    return (
                      <span
                        key={condId}
                        className={`px-3 py-1.5 ${cond.color} text-white text-xs sm:text-sm font-bold rounded-full shadow-lg border border-white/20`}
                      >
                        {cond.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
