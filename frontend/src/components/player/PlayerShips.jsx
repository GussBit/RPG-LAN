import React from 'react';
import { Ship, ArrowLeft, Shield, Anchor, Box } from 'lucide-react';
import InventoryItemCard from './InventoryItemCard';

export default function PlayerShips({
    ships,
    selectedShipId,
    setSelectedShipId,
    shipTab,
    setShipTab,
    updateShipHP,
    updateShipMorale,
    toggleShipCondition,
    updateShipInventoryQuantity,
    onRemoveItem,
    onOpenCompendium,
    crisisConditions
}) {
    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                    <Ship size={18} className="text-cyan-400 sm:w-5 sm:h-5"/> 
                    Navios & Carga
                </h2>
            </div>

            {/* Lista de Seleção de Navios */}
            {!selectedShipId ? (
                <div className="grid gap-3">
                    {ships.filter(s => s.type === 'player').map(ship => (
                        <button 
                            key={ship.id}
                            onClick={() => setSelectedShipId(ship.id)}
                            className="bg-zinc-900/80 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:border-cyan-500/50 transition-all text-left group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-cyan-950/30 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-900/50">
                                <Ship size={24} className="text-cyan-400" />
                            </div>
                            <div>
                                <div className="font-bold text-zinc-200">{ship.name}</div>
                                <div className="text-xs text-zinc-500">
                                    Casco: {ship.currentHp}/{ship.maxHp} • Moral: {ship.currentMorale}/{ship.maxMorale}
                                </div>
                            </div>
                        </button>
                    ))}
                    {ships.filter(s => s.type === 'player').length === 0 && (
                        <div className="text-center text-zinc-600 py-10">Nenhum navio aliado na cena.</div>
                    )}
                </div>
            ) : (
                /* Detalhes do Navio Selecionado */
                (() => {
                    const ship = ships.find(s => s.id === selectedShipId);
                    if (!ship) return <div className="text-center">Navio não encontrado</div>;
                    
                    const hpPct = Math.max(0, Math.min(100, (ship.currentHp / ship.maxHp) * 100));
                    const moralePct = Math.max(0, Math.min(100, (ship.currentMorale / ship.maxMorale) * 100));

                    // Status do Casco
                    let hullStatus = 'Intacto';
                    let hullColor = 'text-emerald-400';
                    if (hpPct < 10) { hullStatus = 'Condenado'; hullColor = 'text-red-500 animate-pulse'; }
                    else if (hpPct < 50) { hullStatus = 'Avariado'; hullColor = 'text-amber-500'; }

                    // Status de Moral
                    let moraleStatus = 'Contente';
                    let moraleColor = 'text-blue-400';
                    if (moralePct === 0) { moraleStatus = 'Motim'; moraleColor = 'text-red-500 animate-pulse'; }
                    else if (moralePct <= 40) { moraleStatus = 'Abalado'; moraleColor = 'text-amber-500'; }

                    // Lógica de Efeitos Visuais
                    const conditions = ship.conditions || [];
                    const isFire = conditions.includes('crisis_fire');
                    const isFlood = conditions.includes('crisis_flood');
                    const isPowder = conditions.includes('crisis_powder');
                    const isCrew = conditions.includes('crisis_crew');

                    let borderClass = 'border-cyan-500/30';
                    let shadowClass = 'shadow-2xl';

                    if (isFire) { borderClass = 'border-orange-500 animate-pulse'; shadowClass = 'shadow-[0_0_30px_rgba(249,115,22,0.4)]'; }
                    else if (isFlood) { borderClass = 'border-blue-500'; shadowClass = 'shadow-[0_0_30px_rgba(59,130,246,0.4)]'; }
                    else if (isPowder) { borderClass = 'border-yellow-500 animate-pulse'; shadowClass = 'shadow-[0_0_30px_rgba(234,179,8,0.4)]'; }
                    else if (isCrew) { borderClass = 'border-red-500'; shadowClass = 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'; }

                    return (
                        <div className="space-y-4">
                            {/* Header com Voltar e Switch */}
                            <div className="flex items-center justify-between">
                                <button onClick={() => setSelectedShipId(null)} className="text-xs text-cyan-400 flex items-center gap-1">
                                    <ArrowLeft size={12} /> Voltar
                                </button>
                                
                                <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-0.5">
                                    <button 
                                        onClick={() => setShipTab('controls')}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${shipTab === 'controls' ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Controles
                                    </button>
                                    <button 
                                        onClick={() => setShipTab('cargo')}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${shipTab === 'cargo' ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Carga
                                    </button>
                                </div>
                            </div>
                            
                            {/* Card do Navio (Estilo Player) */}
                            <div className={`bg-zinc-900/60 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-500 ${borderClass} ${shadowClass}`}>
                                {/* Foto */}
                                <div className="h-48 sm:h-56 relative bg-gradient-to-br from-cyan-900/40 to-blue-900/40">
                                    {ship.image ? (
                                        <img src={ship.image} alt={ship.name} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Ship className="w-20 h-20 text-cyan-700" />
                                        </div>
                                    )}
                                    
                                    {/* Overlays de Condição */}
                                    {isFire && <div className="absolute inset-0 bg-orange-500/20 mix-blend-overlay animate-pulse" />}
                                    {isFlood && <div className="absolute inset-0 bg-blue-500/30 mix-blend-overlay" />}
                                    {isPowder && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay animate-pulse" />}
                                    {isCrew && <div className="absolute inset-0 bg-red-900/30 mix-blend-multiply" />}

                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                                    
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight">{ship.name}</h3>
                                            <p className="text-xs text-cyan-300 uppercase tracking-widest font-bold">Navio Aliado</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider ${hullColor}`}>
                                                {hullStatus}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider ${moraleColor}`}>
                                                {moraleStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {shipTab === 'controls' ? (
                                    <div className="p-4 space-y-6">
                                        {/* Status Bars */}
                                        <div className="space-y-4">
                                            {/* Casco */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase">
                                                    <span className="flex items-center gap-1"><Shield size={14}/> Casco</span>
                                                    <span className="text-emerald-400 text-sm">{ship.currentHp} / {ship.maxHp}</span>
                                                </div>
                                                <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${hpPct}%` }} />
                                                </div>
                                                {/* Botões de HP */}
                                                <div className="grid grid-cols-6 gap-1">
                                                    {[-10, -5, -1].map(v => (
                                                        <button key={v} onClick={() => updateShipHP(ship.id, v)} className="bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-400 text-[10px] font-bold rounded py-1.5 transition-colors">{v}</button>
                                                    ))}
                                                    {[1, 5, 10].map(v => (
                                                        <button key={v} onClick={() => updateShipHP(ship.id, v)} className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded py-1.5 transition-colors">+{v}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Moral */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase">
                                                    <span className="flex items-center gap-1"><Anchor size={14}/> Moral</span>
                                                    <span className="text-blue-400 text-sm">{ship.currentMorale} / {ship.maxMorale}</span>
                                                </div>
                                                <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${moralePct}%` }} />
                                                </div>
                                                {/* Botões de Moral */}
                                                <div className="grid grid-cols-6 gap-1">
                                                    {[-10, -5, -1].map(v => (
                                                        <button key={v} onClick={() => updateShipMorale(ship.id, v)} className="bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold rounded py-1.5 transition-colors">{v}</button>
                                                    ))}
                                                    {[1, 5, 10].map(v => (
                                                        <button key={v} onClick={() => updateShipMorale(ship.id, v)} className="bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold rounded py-1.5 transition-colors">+{v}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Condições (Crises) */}
                                        <div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2 text-center">Condições & Crises</div>
                                            <div className="grid grid-cols-5 gap-2">
                                                {crisisConditions.map(crisis => {
                                                    const isActive = (ship.conditions || []).includes(crisis.id);
                                                    return (
                                                        <button
                                                            key={crisis.id}
                                                            onClick={() => toggleShipCondition(ship.id, crisis.id)}
                                                            className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                                                                isActive 
                                                                    ? `${crisis.color} ${crisis.border} ${crisis.text}` 
                                                                    : 'bg-zinc-800/50 border-transparent text-zinc-600 hover:bg-zinc-800'
                                                            }`}
                                                            title={crisis.label}
                                                        >
                                                            <crisis.icon size={20} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Inventário do Navio */
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                                <Box size={14} /> Carga
                                            </h4>
                                            <button onClick={onOpenCompendium} className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded hover:bg-cyan-600/40">+ Item</button>
                                        </div>
                                        <div className="space-y-2">
                                            {(ship.inventory || []).map((item, idx) => (
                                                <InventoryItemCard 
                                                    key={idx} 
                                                    item={item} 
                                                    index={idx} 
                                                    onUpdateQuantity={(idx, delta) => updateShipInventoryQuantity(ship.id, idx, delta)}
                                                    onRemove={onRemoveItem} 
                                                />
                                            ))}
                                            {(ship.inventory || []).length === 0 && (
                                                <div className="text-center text-zinc-600 text-xs py-8 border-2 border-dashed border-zinc-800 rounded-xl">Porão de carga vazio</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
