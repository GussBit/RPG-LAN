import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Shield, Loader2, AlertCircle, ArrowLeft,
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull,
  FlaskConical, Ghost, Heart as HeartIcon, EyeOff, Cloud, Moon, Timer, BookOpen, Backpack, Scroll, Trash2
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


export default function PlayerPrivateView() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [compendiumOpen, setCompendiumOpen] = useState(false);
    const [viewMode, setViewMode] = useState('sheet'); // 'sheet' | 'inventory'

    useEffect(() => {
        fetchPlayerData();
        // Atualiza a cada 5 segundos
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
      
      // Toast de notificação
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

  const handleAddToInventory = async (item) => {
    if (!data) return;
    const currentInventory = data.player.inventory || [];
    
    // Opcional: Evitar duplicatas exatas
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
    } catch (err) { toast.error('Erro ao salvar item'); }
  };

  const handleRemoveFromInventory = async (index) => {
    if (!data) return;
    if (!window.confirm('Remover este item?')) return;
    
    const newInventory = (data.player.inventory || []).filter((_, i) => i !== index);
    try {
        await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inventory: newInventory })
        });
        fetchPlayerData();
        toast.success('Item removido');
    } catch (err) { toast.error('Erro ao remover item'); }
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
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

                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-zinc-200 mb-2">Acesso Negado</h1>
                <p className="text-zinc-500 mb-6">{error || 'Link inválido ou expirado'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 rounded-full text-indigo-200 transition"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>
            </div>
        );
    }

    const { player, scene } = data;
    const hpPercent = (player.currentHp / player.maxHp) * 100;
    const isLowHp = hpPercent < 30;
    const isMediumHp = hpPercent >= 30 && hpPercent < 70;

    return (
        
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
            {/* Background da cena (blur) */}
            {scene.background && (
                <div
                    className="fixed inset-0 opacity-20 blur-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${BACKEND_URL}${scene.background})` }}
                />
            )}

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="max-w-2xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                                    {scene.name}
                                </div>
                                <div className="text-lg font-black text-zinc-100 tracking-tight">
                                    RPG-LAN LAB
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 transition"
                                title="Voltar para DM View"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Navegação de Abas */}
                <div className="flex justify-center mt-4 gap-2">
                    <button onClick={() => setViewMode('sheet')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${viewMode === 'sheet' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <Shield size={16} /> Ficha
                    </button>
                    <button onClick={() => setViewMode('inventory')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${viewMode === 'inventory' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <Backpack size={16} /> Inventário
                    </button>
                </div>

                {/* Conteúdo Principal */}
                <main className="flex-1 flex items-center justify-center p-4">
                    {viewMode === 'sheet' ? (
                        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                        {/* Card do Personagem */}
                        <div
                            className={`bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.7)] transition-all ${(player.conditions || []).includes('prone') ? 'transform rotate-[-2deg]' : ''
                                } ${(player.conditions || []).includes('invisible') ? 'opacity-50' : ''
                                } ${(player.conditions || []).includes('unconscious') ? 'brightness-50' : ''
                                } ${(player.conditions || []).includes('paralyzed') ? 'grayscale' : ''
                                } ${(player.conditions || []).includes('frightened') ? 'animate-pulse' : ''
                                }`}
                            style={{
                                filter: (player.conditions || []).includes('blinded') ? 'blur(2px)' : 'none'
                            }}
                        >

                            {/* Foto */}
                            <div className="aspect-square relative bg-gradient-to-br from-indigo-500/20 via-zinc-900/50 to-purple-500/20">
                                {player.photo ? (
                                    <img
                                        src={player.photo}
                                        alt={player.characterName}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Shield className="w-24 h-24 text-zinc-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                            </div>

                            {/* Info */}
                            <div className="p-6 space-y-6">
                                {/* Nome */}
                                <div className="text-center">
                                    <h1 className="text-3xl font-black text-zinc-100 tracking-tight mb-1">
                                        {player.characterName}
                                    </h1>
                                    <p className="text-sm text-zinc-500 uppercase tracking-widest">
                                        {player.playerName}
                                    </p>
                                </div>

                                {/* Barra de HP */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Heart
                                                size={20}
                                                className={
                                                    isLowHp
                                                        ? 'text-red-500'
                                                        : isMediumHp
                                                            ? 'text-yellow-500'
                                                            : 'text-emerald-500'
                                                }
                                                fill="currentColor"
                                            />
                                            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                                Pontos de Vida
                                            </span>
                                        </div>
                                        <span className="text-lg font-black text-zinc-100">
                                            {player.currentHp} / {player.maxHp}
                                        </span>
                                    </div>

                                    {/* Barra Visual */}
                                    <div className="h-6 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                                        <div
                                            className={`h-full transition-all duration-500 ${isLowHp
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

                                {/* Controles de HP - Player pode auto-ajustar */}
                                <div className="space-y-2 mt-4">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={async () => {
                                                const newHp = Math.max(0, player.currentHp - 10);
                                                try {
                                                    await fetch(`${BACKEND_URL}/api/scenes/${scene.id}/players/${player.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentHp: newHp })
                                                    });
                                                    fetchPlayerData();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="px-3 py-2 bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 rounded-xl text-red-300 font-bold text-sm transition-all active:scale-95"
                                        >
                                            -10
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const newHp = Math.max(0, player.currentHp - 5);
                                                try {
                                                    await fetch(`${BACKEND_URL}/api/scenes/${scene.id}/players/${player.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentHp: newHp })
                                                    });
                                                    fetchPlayerData();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="px-3 py-2 bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 rounded-xl text-red-300 font-bold text-sm transition-all active:scale-95"
                                        >
                                            -5
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const newHp = Math.max(0, player.currentHp - 1);
                                                try {
                                                    await fetch(`${BACKEND_URL}/api/scenes/${scene.id}/players/${player.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentHp: newHp })
                                                    });
                                                    fetchPlayerData();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="px-3 py-2 bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 rounded-xl text-red-300 font-bold text-sm transition-all active:scale-95"
                                        >
                                            -1
                                        </button>
                                    </div>

                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={async () => {
                                                const newHp = Math.min(player.maxHp, player.currentHp + 1);
                                                try {
                                                    await fetch(`${BACKEND_URL}/api/scenes/${scene.id}/players/${player.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentHp: newHp })
                                                    });
                                                    fetchPlayerData();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="px-3 py-2 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold text-sm transition-all active:scale-95"
                                        >
                                            +1
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const newHp = Math.min(player.maxHp, player.currentHp + 5);
                                                try {
                                                    await fetch(`${BACKEND_URL}/api/scenes/${scene.id}/players/${player.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentHp: newHp })
                                                    });
                                                    fetchPlayerData();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="px-3 py-2 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold text-sm transition-all active:scale-95"
                                        >
                                            +5
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const newHp = Math.min(player.maxHp, player.currentHp + 10);
                                                try {
                                                    await fetch(`${BACKEND_URL}/api/scenes/${scene.id}/players/${player.id}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentHp: newHp })
                                                    });
                                                    fetchPlayerData();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="px-3 py-2 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold text-sm transition-all active:scale-95"
                                        >
                                            +10
                                        </button>
                                    </div>
                                </div>

                                {/* Condições */}
                                <div className="space-y-3 border-t border-white/10 pt-6">
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">
                                        Condições
                                    </div>

                                    <div className="grid grid-cols-6 gap-2">
                                        {CONDITIONS.map(condition => {
                                            const Icon = condition.icon;
                                            const isActive = (player.conditions || []).includes(condition.id);
                                            return (
                                                <button
                                                    key={condition.id}
                                                    onClick={() => toggleCondition(condition.id)}
                                                    className={`aspect-square rounded-full flex items-center justify-center transition-all active:scale-90 ${isActive
                                                        ? `${condition.color} text-white shadow-lg`
                                                        : 'bg-zinc-800/50 text-zinc-600 hover:bg-zinc-700/50'
                                                        }`}
                                                    title={condition.label}
                                                >
                                                    <Icon size={18} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>





                                {/* Status Alert */}
                                {isLowHp && (
                                    <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 text-center">
                                        <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-red-300">
                                            Atenção! Vida Crítica
                                        </p>
                                        <p className="text-xs text-red-400/80 mt-1">
                                            Procure cura imediatamente
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-zinc-600">
                                Esta página atualiza automaticamente a cada 5 segundos
                            </p>
                        </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl h-[70vh] flex flex-col animate-in slide-in-from-right-8 duration-300">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2"><Scroll size={20} className="text-indigo-400"/> Grimório & Habilidades</h2>
                                <button onClick={() => setCompendiumOpen(true)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                                    + Adicionar
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                {(player.inventory || []).length === 0 && (
                                    <div className="text-center text-zinc-600 py-10 border-2 border-dashed border-zinc-800 rounded-xl">
                                        Seu inventário está vazio.<br/>Abra o compêndio para adicionar magias.
                                    </div>
                                )}
                                {(player.inventory || []).map((item, idx) => (
                                    <div key={idx} className="bg-zinc-900/80 border border-white/5 p-4 rounded-xl relative group hover:border-indigo-500/30 transition-colors">
                                        <div className="pr-8">
                                            <div className="font-bold text-zinc-200 text-lg">{item.nome}</div>
                                            <div className="text-xs text-indigo-400 mb-2 font-mono">{item.nome_ingles}</div>
                                            <div className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{item.descricao}</div>
                                        </div>
                                        <button onClick={() => handleRemoveFromInventory(idx)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 p-1 rounded transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Efeitos Especiais */}
                    {(player.conditions || []).includes('restrained') && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 border-4 border-dashed border-zinc-500/50 animate-spin rounded-3xl" style={{ animationDuration: '8s' }} />
                        </div>
                    )}

                    {(player.conditions || []).includes('poisoned') && (
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-500/40 to-transparent pointer-events-none animate-pulse rounded-b-3xl" />
                    )}

                    {(player.conditions || []).includes('charmed') && (
                        <div className="absolute inset-0 pointer-events-none rounded-3xl">
                            <div className="absolute inset-0 bg-pink-500/10 animate-pulse rounded-3xl" />
                        </div>
                    )}


                </main>
            </div>

            {/* Botão Flutuante do Compêndio */}
            <div className="fixed bottom-6 right-6 z-50">
                <button 
                    onClick={() => setCompendiumOpen(true)} 
                    className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-900/50 flex items-center justify-center transition-all hover:scale-110 border-2 border-indigo-400"
                    title="Abrir Compêndio"
                >
                    <BookOpen size={24} />
                </button>
            </div>

            <Compendium open={compendiumOpen} onClose={() => setCompendiumOpen(false)} onAddItem={handleAddToInventory} />
        </div>
    );
}
