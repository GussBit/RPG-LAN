import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Shield, Loader2, AlertCircle, ArrowLeft,
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull,
  FlaskConical, Ghost, Heart as HeartIcon, EyeOff, Cloud, Moon, Timer, BookOpen, Backpack, Scroll, Trash2, User, ChevronDown, ChevronUp, Ship, Anchor, Box, Zap, Waves, Flame, Wind
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Compendium from './components/Compendium';
import PlayerSheet from './components/player/PlayerSheet';
import PlayerInventory from './components/player/PlayerInventory';
import PlayerShips from './components/player/PlayerShips';

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

const CRISIS_CONDITIONS = [
    { id: 'crisis_powder', label: 'Pólvora', icon: Zap, color: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
    { id: 'crisis_flood', label: 'Inundação', icon: Waves, color: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
    { id: 'crisis_fire', label: 'Incêndio', icon: Flame, color: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
    { id: 'crisis_mast', label: 'Vela/Mastro', icon: Wind, color: 'bg-zinc-500/20', border: 'border-zinc-500/50', text: 'text-zinc-400' },
    { id: 'crisis_crew', label: 'Tripulação', icon: Skull, color: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
];

export default function PlayerPrivateView() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [compendiumOpen, setCompendiumOpen] = useState(false);
    const [viewMode, setViewMode] = useState('sheet');
    const [selectedShipId, setSelectedShipId] = useState(null);
    const [shipTab, setShipTab] = useState('controls'); // 'controls' | 'cargo'
    const [customItems, setCustomItems] = useState([]);

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
        const existingIdx = currentInventory.findIndex(i => i.nome === item.nome);
        
        let newInventory;
        if (existingIdx >= 0) {
            newInventory = [...currentInventory];
            newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: (newInventory[existingIdx].quantity || 1) + 1 };
            toast.success(`+1 ${item.nome} (Total: ${newInventory[existingIdx].quantity})`);
        } else {
            newInventory = [...currentInventory, { ...item, quantity: 1 }];
            toast.success(`${item.nome} adicionado!`);
        }

        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
        } catch (err) { 
            toast.error('Erro ao salvar item'); 
        }
    };

    const handleUpdateInventoryQuantity = async (index, delta) => {
        if (!data) return;
        const newInventory = [...data.player.inventory];
        const item = newInventory[index];
        const newQuantity = (item.quantity || 1) + delta;
        
        if (newQuantity <= 0) {
            if (window.confirm(`Remover "${item.nome}"?`)) {
                newInventory.splice(index, 1);
            } else {
                return;
            }
        } else {
            newInventory[index] = { ...item, quantity: newQuantity };
        }

        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/players/${data.player.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
        } catch (err) { 
            toast.error('Erro ao atualizar inventário'); 
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

    const handleAddToShipInventory = async (item) => {
        if (!data || !data.scene || !selectedShipId) return;
        const ship = (data.scene.ships || []).find(s => s.id === selectedShipId);
        if (!ship) return;

        const currentInventory = ship.inventory || [];
        const existingIdx = currentInventory.findIndex(i => i.nome === item.nome);
        
        let newInventory;
        if (existingIdx >= 0) {
            newInventory = [...currentInventory];
            newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: (newInventory[existingIdx].quantity || 1) + 1 };
            toast.success(`+1 ${item.nome} no navio`);
        } else {
            newInventory = [...currentInventory, { ...item, quantity: 1 }];
            toast.success(`${item.nome} carregado no navio!`);
        }
        
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/ships/${ship.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
        } catch (err) { 
            toast.error('Erro ao carregar item'); 
        }
    };

    const handleUpdateShipInventoryQuantity = async (shipId, index, delta) => {
        if (!data) return;
        const ship = data.scene.ships.find(s => s.id === shipId);
        if (!ship) return;

        const newInventory = [...ship.inventory];
        const item = newInventory[index];
        const newQuantity = (item.quantity || 1) + delta;

        if (newQuantity <= 0) {
             if (window.confirm(`Remover "${item.nome}" do navio?`)) {
                newInventory.splice(index, 1);
            } else {
                return;
            }
        } else {
            newInventory[index] = { ...item, quantity: newQuantity };
        }

        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/ships/${ship.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
        } catch (err) { 
            toast.error('Erro ao atualizar carga'); 
        }
    };

    const handleRemoveFromShipInventory = async (index) => {
        if (!data || !selectedShipId) return;
        const ship = data.scene.ships.find(s => s.id === selectedShipId);
        if (!ship) return;
        
        if (!window.confirm(`Remover item do navio?`)) return;

        const newInventory = (ship.inventory || []).filter((_, i) => i !== index);
        
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/ships/${ship.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            fetchPlayerData();
            toast.success('Item removido do navio');
        } catch (err) { 
            toast.error('Erro ao remover item'); 
        }
    };

    const updateShipHP = async (shipId, delta) => {
        if (!data) return;
        const ship = data.scene.ships.find(s => s.id === shipId);
        if (!ship) return;
        
        const newHp = Math.max(0, Math.min(ship.maxHp, (ship.currentHp || 0) + delta));
        
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/ships/${shipId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentHp: newHp })
            });
            fetchPlayerData();
        } catch (err) { console.error(err); }
    };

    const updateShipMorale = async (shipId, delta) => {
        if (!data) return;
        const ship = data.scene.ships.find(s => s.id === shipId);
        if (!ship) return;
        
        const newMorale = Math.max(0, Math.min(ship.maxMorale, (ship.currentMorale || 0) + delta));
        
        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/ships/${shipId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentMorale: newMorale })
            });
            fetchPlayerData();
        } catch (err) { console.error(err); }
    };

    const toggleShipCondition = async (shipId, conditionId) => {
        if (!data) return;
        const ship = data.scene.ships.find(s => s.id === shipId);
        if (!ship) return;

        const currentConditions = ship.conditions || [];
        const hasCondition = currentConditions.includes(conditionId);
        const newConditions = hasCondition 
            ? currentConditions.filter(c => c !== conditionId)
            : [...currentConditions, conditionId];

        try {
            await fetch(`${BACKEND_URL}/api/scenes/${data.scene.id}/ships/${shipId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conditions: newConditions })
            });
            fetchPlayerData();

            const condition = CRISIS_CONDITIONS.find(c => c.id === conditionId);
            const shipName = ship.name || 'Navio';
            if (condition) {
                toast.info(
                    hasCondition 
                        ? `${shipName}: ${condition.label} resolvido` 
                        : `${shipName}: ${condition.label} detectado!`,
                    { autoClose: 3000, icon: <condition.icon size={18} /> }
                );
            }
        } catch (err) { console.error(err); }
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
    const ships = scene.ships || [];

    // Filtra itens ocultos
    const visibleInventory = (player.inventory || []).filter(i => i.visible !== false);
    const visibleShips = ships.map(s => ({ ...s, inventory: (s.inventory || []).filter(i => i.visible !== false) }));

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
                style={{ zIndex: 99999 }}
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
                        <PlayerSheet 
                            player={player} 
                            updateHP={updateHP} 
                            toggleCondition={toggleCondition} 
                            conditionsList={CONDITIONS} 
                        />
                    ) : viewMode === 'inventory' ? (
                        <PlayerInventory 
                            inventory={visibleInventory} 
                            onUpdateQuantity={handleUpdateInventoryQuantity}
                            onRemove={handleRemoveFromInventory} 
                            onOpenCompendium={() => setCompendiumOpen(true)} 
                        />
                    ) : (
                        <PlayerShips 
                            ships={visibleShips} 
                            selectedShipId={selectedShipId} 
                            setSelectedShipId={setSelectedShipId} 
                            shipTab={shipTab} 
                            setShipTab={setShipTab} 
                            updateShipHP={updateShipHP} 
                            updateShipMorale={updateShipMorale}
                            toggleShipCondition={toggleShipCondition} 
                            updateShipInventoryQuantity={handleUpdateShipInventoryQuantity}
                            onRemoveItem={handleRemoveFromShipInventory} 
                            onOpenCompendium={() => setCompendiumOpen(true)} 
                            crisisConditions={CRISIS_CONDITIONS} 
                        />
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
                    <button 
                        onClick={() => setViewMode('ships')} 
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors w-full h-full ${viewMode === 'ships' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Anchor size={18} className="sm:w-5 sm:h-5" />
                        <span className="text-[9px] sm:text-[10px] font-bold">Navios</span>
                    </button>
                </div>
            </nav>

            <Compendium 
                open={compendiumOpen} 
                onClose={() => setCompendiumOpen(false)} 
                customItems={customItems}
                onAddItem={viewMode === 'ships' ? handleAddToShipInventory : handleAddToInventory} 
            />
        </div>
    );
}
