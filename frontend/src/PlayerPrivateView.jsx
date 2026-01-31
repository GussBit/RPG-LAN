import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Shield, Loader2, AlertCircle, ArrowLeft,
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull,
  FlaskConical, Ghost, Heart as HeartIcon, EyeOff, Cloud, Moon, Timer, BookOpen, Backpack, Scroll, Trash2, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Compendium from './components/Compendium';

const BACKEND_URL = `http://${window.location.hostname}:3333`;

const CONDITIONS = [
    { id: 'prone', icon: ArrowDownCircle, color: 'bg-amber-500', label: 'Caído' },
    { id: 'restrained', icon: LinkIcon, color: 'bg-zinc-400', label: 'Impedido' },
    { id: 'paralyzed', icon: ZapOff, color: 'bg-blue-500', label: 'Paralisado' },
    { id: 'incapacitated', icon: Skull, color: 'bg-red-500', label: 'Incapacitado' },
    { id: 'poisoned', icon: FlaskConical, color: 'bg-green-500', label: 'Envenenado' },
    { id: 'frightened', icon: Ghost, color: 'bg-purple-500', label: 'Amedrontado' },
    { id: 'charmed', icon: HeartIcon, color: 'bg-pink-500', label: 'Enfeitiçado' },
    { id: 'blinded', icon: EyeOff, color: 'bg-gray-600', label: 'Cego' },
    { id: 'invisible', icon: Cloud, color: 'bg-cyan-400', label: 'Invisível' },
    { id: 'unconscious', icon: Moon, color: 'bg-indigo-500', label: 'Inconsciente' },
    { id: 'exhausted', icon: Timer, color: 'bg-orange-500', label: 'Exausto' },
];

// Componente de Card de Item Compacto
function InventoryItemCard({ item, index, onRemove }) {
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

export default function PlayerPrivateView() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [compendiumOpen, setCompendiumOpen] = useState(false);
    const [viewMode, setViewMode] = useState('sheet');

    useEffect(() => {
        fetchPlayerData();
        const interval = setInterval(fetchPlayerData, 1500);
        return () => clearInterval(interval);
    }, [token]);

    const fetchPlayerData = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/players/token/${token}`);
            if (!res.ok) throw new Error('Token inválido ou jogador não encontrado');
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleCondition = async (conditionId) => {
        if (!data) return;
        
        const currentConditions = data.player.conditions || [];
        const hasCondition = currentConditions.includes(conditionId);
        const newConditions = hasCondition 
            ? currentConditions.filter(c => c !== conditionId)
            : [...currentConditions, conditionId];

        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conditions: newConditions })
            });
            fetchPlayerData();
            
            const condition = CONDITIONS.find(c => c.id === conditionId);
            toast.info(
                hasCondition 
                    ? `${condition?.label} removido` 
                    : `${condition?.label} ativado`,
                { autoClose: 2000 }
            );
        } catch (err) {
            console.error('Erro ao atualizar condição:', err);
            toast.error('Erro ao atualizar condição');
        }
    };

    const updateHP = async (delta) => {
        if (!data) return;
        const newHp = Math.max(0, Math.min(data.player.maxHp, data.player.currentHp + delta));
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentHp: newHp })
            });
            fetchPlayerData();
        } catch (err) { 
            console.error(err); 
        }
    };

    const handleAddToInventory = async (item) => {
        if (!data) return;
        const currentInventory = data.player.inventory || [];
        
        if (currentInventory.some(i => i.nome === item.nome)) {
            toast.warning('Item já está no inventário');
            return;
        }

        const newInventory = [...currentInventory, item];
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
            toast.success(`${item.nome} adicionado!`);
        } catch (err) { 
            toast.error('Erro ao salvar item'); 
        }
    };

    const handleRemoveFromInventory = async (index) => {
        if (!data) return;
        const itemName = data.player.inventory[index]?.nome || 'este item';
        if (!window.confirm(`Remover "${itemName}"?`)) return;
        
        const newInventory = (data.player.inventory || []).filter((_, i) => i !== index);
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
            toast.success('Item removido');
        } catch (err) { 
            toast.error('Erro ao remover item'); 
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 flex items-center justify-center p-4">
                <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
                    <h1 className="text-2xl font-bold text-zinc-200 mb-2">Acesso Negado</h1>
                    <p className="text-zinc-500 mb-6">{error || 'Link inválido ou expirado'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 rounded-full text-indigo-200 transition"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                </div>
            </div>
        );
    }

    const { player, scene } = data;
    const hpPercent = (player.currentHp / player.maxHp) * 100;
    const isLowHp = hpPercent < 30;
    const isMediumHp = hpPercent >= 30 && hpPercent < 70;
    const conditions = player.conditions || [];
    const isDead = player.currentHp <= 0;

    return (
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden pb-16">
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme="dark"
            />

            {/* Background da cena (blur) */}
            {scene.background && (
                <div
                    className="fixed inset-0 opacity-20 blur-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${BACKEND_URL}${scene.background})` }}
                />
            )}

            <div className="relative z-10 min-h-screen">
                {/* Conteúdo Principal */}
                <main className="overflow-y-auto custom-scrollbar p-3 sm:p-4">
                    {viewMode === 'sheet' ? (
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
                                            src={player.photo}
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
                                                style={{ width: `${hpPercent}%` }}
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
                                            {CONDITIONS.map(condition => {
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
                    ) : (
                        <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-300">
                            {/* Header do Inventário */}
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                                        <Scroll size={18} className="text-indigo-400 sm:w-5 sm:h-5"/> 
                                        Grimório & Habilidades
                                    </h2>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                                        {(player.inventory || []).length} {(player.inventory || []).length === 1 ? 'item' : 'itens'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setCompendiumOpen(true)} 
                                    className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors font-bold flex items-center gap-1.5"
                                >
                                    <Scroll size={14} />
                                    Adicionar
                                </button>
                            </div>
                            
                            {/* Lista de Itens Compacta */}
                            <div className="space-y-2">
                                {(player.inventory || []).length === 0 && (
                                    <div className="text-center text-zinc-600 py-12 sm:py-16 border-2 border-dashed border-zinc-800 rounded-xl">
                                        <Backpack className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-xs sm:text-sm">Seu inventário está vazio</p>
                                        <p className="text-[10px] sm:text-xs text-zinc-700 mt-1">
                                            Abra o compêndio para adicionar magias
                                        </p>
                                    </div>
                                )}
                                
                                {(player.inventory || []).map((item, idx) => (
                                    <InventoryItemCard
                                        key={idx}
                                        item={item}
                                        index={idx}
                                        onRemove={handleRemoveFromInventory}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Menu Inferior */}
            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-lg border-t border-white/10 z-50">
                <div className="flex justify-around items-center h-14 sm:h-16">
                    <button 
                        onClick={() => setViewMode('sheet')} 
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors w-full h-full ${
                            viewMode === 'sheet' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <User size={18} className="sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-bold">Ficha</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('inventory')} 
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors w-full h-full relative ${
                            viewMode === 'inventory' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <Backpack size={18} className="sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-bold">Inventário</span>
                        {(player.inventory || []).length > 0 && (
                            <span className="absolute top-1 right-1/4 h-4 w-4 bg-indigo-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                {(player.inventory || []).length}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setCompendiumOpen(true)} 
                        className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-zinc-500 hover:text-zinc-300 transition-colors w-full h-full"
                    >
                        <BookOpen size={18} className="sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-bold">Compêndio</span>
                    </button>
                </div>
            </nav>

            <Compendium open={compendiumOpen} onClose={() => setCompendiumOpen(false)} onAddItem={handleAddToInventory} />
        </div>
    );
}
