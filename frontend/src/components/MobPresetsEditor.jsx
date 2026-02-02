import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Search, Plus, Trash2, ArrowLeft, Skull, 
  Heart, Swords, Target, Backpack, Image as ImageIcon,
  RefreshCw, Check, AlertCircle, Braces, Shield, Code,
  Eye, Edit2, Package, Coins, X, ChevronDown, ChevronUp,
  Sparkles, Zap, Activity
} from 'lucide-react';
import { API_URL } from '../api';
import { toast } from 'react-toastify';
import Compendium from './Compendium';
import { getImageUrl } from '../constants';
import MediaGallery from '../MediaGallery';
import { useGameStore } from '../store';

// Componente de Item do Inventário
function InventoryItem({ item, onRemove, index }) {
  const [expanded, setExpanded] = useState(false);
  
  const getTypeIcon = (type) => {
    const icons = {
      'weapon': Swords,
      'armor': Shield,
      'consumable': Zap,
      'treasure': Coins,
      'misc': Package
    };
    const Icon = icons[type] || Package;
    return <Icon size={16} />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'weapon': 'text-red-400 bg-red-500/10 border-red-500/20',
      'armor': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'consumable': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      'treasure': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'misc': 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    };
    return colors[type] || colors.misc;
  };

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
      <div className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getTypeColor(item.tipo)}`}>
          {getTypeIcon(item.tipo)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-100 truncate">{item.nome || 'Item sem nome'}</div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
            <span className="capitalize">{item.tipo || 'misc'}</span>
            {item.custo && (
              <span className="flex items-center gap-1">
                <Coins size={10} /> 
                {typeof item.custo === 'object' ? `${item.custo.quant} ${item.custo.moeda}` : item.custo}
              </span>
            )}
            {item.quantidade && <span>Qtd: {item.quantidade}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
            title={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            title="Remover item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {item.descricao && (
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Descrição</div>
              <div className="text-sm text-zinc-400">{item.descricao}</div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            {item.dano && (
              <div>
                <div className="text-zinc-500 uppercase font-bold mb-0.5">Dano</div>
                <div className="text-zinc-300">{item.dano}</div>
              </div>
            )}
            {item.defesa && (
              <div>
                <div className="text-zinc-500 uppercase font-bold mb-0.5">Defesa</div>
                <div className="text-zinc-300">+{item.defesa}</div>
              </div>
            )}
            {item.efeito && (
              <div className="col-span-2">
                <div className="text-zinc-500 uppercase font-bold mb-0.5">Efeito</div>
                <div className="text-zinc-300">{item.efeito}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Preview da Ficha
function MobPreview({ mob }) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/10 bg-black shrink-0">
          {mob.image ? (
            <img src={getImageUrl(mob.image)} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              <Skull size={32} />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-white truncate mb-1">{mob.name || 'Sem nome'}</h3>
          {mob.role && <p className="text-sm text-zinc-400 line-clamp-2">{mob.role}</p>}
          {mob.faction && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-400 mt-2">
              <Sparkles size={10} />
              {mob.faction}
            </div>
          )}
        </div>

        {mob.cr && (
          <div className="shrink-0 text-center">
            <div className="text-xs font-bold text-zinc-500 uppercase">CR</div>
            <div className="text-2xl font-black text-amber-400">{mob.cr}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-1">
            <Heart size={14} />
            Vida Máxima
          </div>
          <div className="text-2xl font-black text-white">{mob.maxHp || 0}</div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-1">
            <Shield size={14} />
            Armadura
          </div>
          <div className="text-2xl font-black text-white">{mob.ac || 10}</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
            <Swords size={14} />
            Dano
          </div>
          <div className="text-lg font-black text-white">{mob.damageDice || '1d6'}</div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
            <Target size={14} />
            Acerto
          </div>
          <div className="text-2xl font-black text-white">+{mob.toHit || 0}</div>
        </div>
      </div>

      {mob.inventory && mob.inventory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-2">
            <Backpack size={12} />
            Carrega {mob.inventory.length} {mob.inventory.length === 1 ? 'item' : 'itens'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MobPresetsEditor() {
  const navigate = useNavigate();
  const [presets, setPresets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showCompendium, setShowCompendium] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  
  const [formData, setFormData] = useState(null);
  const [inventoryJson, setInventoryJson] = useState('');
  const [jsonError, setJsonError] = useState(null);

  const { customItems, fetchCustomItems, updatePreset } = useGameStore();

  useEffect(() => {
    fetchPresets();
    fetchCustomItems();
  }, []);

  useEffect(() => {
    if (formData) {
      setInventoryJson(JSON.stringify(formData.inventory || [], null, 2));
      setJsonError(null);
    }
  }, [selectedId]);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/presets/mobs`);
      const data = await res.json();
      setPresets(data);
    } catch (error) {
      toast.error("Erro ao carregar presets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (preset) => {
    if (!preset?.id) return;
    setSelectedId(preset.id);
    setFormData(JSON.parse(JSON.stringify(preset)));
  };

  const handleCreate = async () => {
    const newMob = {
      name: "Novo Mob",
      color: "#ef4444",
      maxHp: 10,
      ac: 10,
      damageDice: "1d6",
      toHit: 0,
      image: "",
      inventory: [],
      conditions: [],
      role: "",
      cr: "",
      faction: ""
      // NÃO envie o ID aqui - deixe o servidor criar
    };

    try {
      const res = await fetch(`${API_URL}/api/presets/mobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMob)
      });
      const created = await res.json();
      setPresets([...presets, created]);
      handleSelect(created);
      toast.success("Mob criado!");
    } catch (e) {
      toast.error("Erro ao criar");
    }
  };

  const handleSave = async () => {
    if (!formData || !selectedId) return;

    let parsedInventory = formData.inventory;
    
    if (showJsonEditor) {
      try {
        parsedInventory = JSON.parse(inventoryJson);
      } catch (e) {
        setJsonError("JSON de inventário inválido");
        toast.error("Corrija o JSON do inventário antes de salvar");
        return;
      }
    }

    setIsSaving(true);
    const dataToSave = { ...formData, inventory: parsedInventory };

    console.log("Tentando salvar preset:", { type: 'mobs', id: selectedId, data: dataToSave });

    try {
      // Usa a função centralizada do store
      const updated = await updatePreset('mobs', selectedId, dataToSave);
      
      setPresets(presets.map(p => p.id === selectedId ? updated : p));
      setFormData(updated);
      setInventoryJson(JSON.stringify(updated.inventory || [], null, 2));
      toast.success("Salvo com sucesso!");
    } catch (e) {
      console.error('Erro completo:', e);
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir este preset?")) return;
    
    try {
      await fetch(`${API_URL}/api/presets/mobs/${id}`, { method: 'DELETE' });
      setPresets(presets.filter(p => p.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setFormData(null);
      }
      toast.success("Removido!");
    } catch (e) {
      toast.error("Erro ao remover");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (item) => {
    const newItem = { ...item };
    const currentInventory = formData.inventory || [];
    const updatedInventory = [...currentInventory, newItem];
    
    setFormData(prev => ({ ...prev, inventory: updatedInventory }));
    setInventoryJson(JSON.stringify(updatedInventory, null, 2));
    toast.success(`"${item.nome}" adicionado!`);
  };

  const handleRemoveItem = (index) => {
    const updatedInventory = formData.inventory.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, inventory: updatedInventory }));
    setInventoryJson(JSON.stringify(updatedInventory, null, 2));
    toast.info("Item removido");
  };

  const filteredPresets = presets.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950 shrink-0 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <Skull className="text-red-500" />
              Editor de Mobs
            </h1>
            <p className="text-xs text-zinc-500 hidden sm:block">Crie e gerencie criaturas do jogo</p>
          </div>
        </div>
        {formData && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-lg font-bold transition-all shadow-lg hover:scale-105 disabled:hover:scale-100"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">Salvar Alterações</span>
            <span className="sm:hidden">Salvar</span>
          </button>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar Lista */}
        <aside className="w-72 sm:w-80 border-r border-white/10 flex flex-col bg-zinc-900/30 shrink-0">
          <div className="p-3 sm:p-4 border-b border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar mob..."
                className="w-full bg-zinc-950/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <button 
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition-all shadow-lg hover:scale-105"
            >
              <Plus size={16} />
              Novo Preset
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredPresets.map(mob => (
              <div 
                key={mob.id}
                onClick={() => handleSelect(mob)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  selectedId === mob.id 
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border border-indigo-500/50 text-white shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative">
                    {mob.image ? (
                      <img src={getImageUrl(mob.image)} className="w-10 h-10 rounded-lg object-cover bg-black border border-white/10" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
                        <Skull size={18} className="text-zinc-600" />
                      </div>
                    )}
                    {mob.cr && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded">
                        {mob.cr}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{mob.name}</div>
                    <div className="text-[10px] opacity-60 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Heart size={10} /> {mob.maxHp}</span>
                      <span className="flex items-center gap-1"><Shield size={10} /> {mob.ac || 10}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDelete(mob.id, e)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {filteredPresets.length === 0 && (
              <div className="text-center text-zinc-600 text-sm py-12">
                <Skull size={48} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum mob encontrado</p>
              </div>
            )}
          </div>
        </aside>

        {/* Área de Edição */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/50 scrollbar-thin">
          {formData ? (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
              
              {/* Grid Principal com Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                
                {/* Formulário */}
                <div className="space-y-6">
                  
                  {/* Informações Básicas */}
                  <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6">
                    <h2 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-white/5">
                      <Edit2 size={20} className="text-indigo-400" />
                      Informações Básicas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
                      {/* Avatar */}
                      <div className="space-y-3">
                        <div 
                          className="aspect-square rounded-xl bg-zinc-950 border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 flex items-center justify-center overflow-hidden relative group cursor-pointer transition-all"
                          onClick={() => setShowGallery(true)}
                        >
                          {formData.image ? (
                            <img src={getImageUrl(formData.image)} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <ImageIcon size={40} className="text-zinc-700" />
                          )}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <ImageIcon size={24} className="text-white" />
                            <span className="text-xs font-bold text-white">Alterar</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Cor</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              value={formData.color || '#ef4444'}
                              onChange={e => handleChange('color', e.target.value)}
                              className="h-10 w-full rounded-lg cursor-pointer bg-zinc-950 border border-white/10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Campos de Texto */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-400 mb-2 block">Nome da Criatura</label>
                          <input 
                            value={formData.name || ''}
                            onChange={e => handleChange('name', e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="Ex: Goblin Guerreiro"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 mb-2 block">CR (Desafio)</label>
                            <input 
                              value={formData.cr || ''}
                              onChange={e => handleChange('cr', e.target.value)}
                              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all"
                              placeholder="Ex: 1/4"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-400 mb-2 block">Facção / Grupo</label>
                            <input 
                              value={formData.faction || ''}
                              onChange={e => handleChange('faction', e.target.value)}
                              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all"
                              placeholder="Ex: Horda"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-zinc-400 mb-2 block">Descrição / Papel</label>
                          <textarea 
                            value={formData.role || ''}
                            onChange={e => handleChange('role', e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all resize-none scrollbar-thin"
                            placeholder="Descreva o papel desta criatura no jogo..."
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Atributos de Combate */}
                  <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                    <h2 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-white/5">
                      <Activity size={20} className="text-red-400" />
                      Atributos de Combate
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Heart size={14} className="text-red-400" /> Vida Máxima
                        </label>
                        <input 
                          type="number"
                          value={formData.maxHp || 0}
                          onChange={e => handleChange('maxHp', Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-black outline-none focus:border-red-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Shield size={14} className="text-blue-400" /> CA
                        </label>
                        <input 
                          type="number"
                          value={formData.ac || 10}
                          onChange={e => handleChange('ac', Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-black outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Swords size={14} className="text-amber-400" /> Dano
                        </label>
                        <input 
                          value={formData.damageDice || '1d6'}
                          onChange={e => handleChange('damageDice', e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center font-bold outline-none focus:border-amber-500 transition-all"
                          placeholder="2d6+3"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Target size={14} className="text-emerald-400" /> Acerto
                        </label>
                        <input 
                          type="number"
                          value={formData.toHit || 0}
                          onChange={e => handleChange('toHit', Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-black outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Inventário */}
                  <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <Backpack size={20} className="text-indigo-400" />
                        Inventário
                        <span className="text-sm font-normal text-zinc-500">
                          ({formData.inventory?.length || 0} {formData.inventory?.length === 1 ? 'item' : 'itens'})
                        </span>
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowJsonEditor(!showJsonEditor)}
                          className={`p-2 rounded-lg transition-all ${
                            showJsonEditor 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Alternar editor JSON"
                        >
                          <Code size={18} />
                        </button>
                        <button
                          onClick={() => setShowCompendium(true)}
                          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all shadow-lg hover:scale-105"
                        >
                          <Plus size={14} /> Adicionar Item
                        </button>
                      </div>
                    </div>
                    
                    {showJsonEditor ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <textarea 
                            value={inventoryJson}
                            onChange={e => {
                              setInventoryJson(e.target.value);
                              try {
                                const parsed = JSON.parse(e.target.value);
                                handleChange('inventory', parsed);
                                setJsonError(null);
                              } catch (err) {
                                setJsonError(err.message);
                              }
                            }}
                            className={`w-full h-64 bg-zinc-950 border rounded-xl p-4 font-mono text-xs outline-none resize-y scrollbar-thin ${
                              jsonError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
                            }`}
                            spellCheck="false"
                          />
                          {jsonError && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 text-red-400 text-xs bg-red-950/90 px-3 py-1.5 rounded-lg border border-red-500/20">
                              <AlertCircle size={12} />
                              {jsonError}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600">
                          💡 Modo avançado: Edite o JSON diretamente. Cuidado com a sintaxe!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.inventory && formData.inventory.length > 0 ? (
                          formData.inventory.map((item, index) => (
                            <InventoryItem 
                              key={index} 
                              item={item} 
                              index={index}
                              onRemove={handleRemoveItem}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                            <Backpack size={48} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nenhum item no inventário</p>
                            <p className="text-xs mt-1">Clique em "Adicionar Item" para começar</p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                </div>

                {/* Preview da Ficha (Sidebar Direita - Desktop) */}
                <div className="hidden lg:block">
                  <div className="sticky top-6">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                      <Eye size={14} />
                      Preview da Ficha
                    </h3>
                    <MobPreview mob={formData} />
                  </div>
                </div>

              </div>

              {/* Preview Mobile (Abaixo do formulário) */}
              <div className="lg:hidden">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                  <Eye size={14} />
                  Preview da Ficha
                </h3>
                <MobPreview mob={formData} />
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 p-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                <Skull size={48} strokeWidth={1} className="text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-400 mb-2">Nenhum mob selecionado</h3>
              <p className="text-sm text-center max-w-md">
                Selecione um mob da lista ou crie um novo preset para começar a editar
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modais */}
      <Compendium 
        open={showCompendium} 
        onClose={() => setShowCompendium(false)} 
        onAddItem={handleAddItem}
        isGM={true}
        customItems={customItems}
      />
      
      <MediaGallery
        open={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={(url) => {
          handleChange('image', url);
          setShowGallery(false);
        }}
        type="images"
      />

      {/* Estilos da Scrollbar */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(63, 63, 70, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(63, 63, 70, 0.5);
        }
      `}</style>
    </div>
  );
}
