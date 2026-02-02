import React, { useState, useMemo } from 'react';
import { 
  Search, X, Zap, Scroll, Sword, Book, Activity, Plus, Sparkles,
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull, 
  FlaskConical, Ghost, Heart, EyeOff, Cloud, Moon, Timer, HelpCircle,
  ChevronLeft, Package, Anchor
} from 'lucide-react';

// Importando os dados
import spellsData from '../data/spells.json';
import actionsData from '../data/actions.json';
import conditionsData from '../data/conditions.json';
import skillsData from '../data/habilidades.json';
import shipItemsData from '../data/itensNavio.json';
import objectsData from '../data/objetos.json';

const CONDITION_ICONS = {
  'Caído': { icon: ArrowDownCircle, color: 'text-amber-500' },
  'Contido': { icon: LinkIcon, color: 'text-zinc-400' },
  'Paralisado': { icon: ZapOff, color: 'text-blue-500' },
  'Incapacitado': { icon: Skull, color: 'text-red-500' },
  'Envenenado': { icon: FlaskConical, color: 'text-green-500' },
  'Amedrontado': { icon: Ghost, color: 'text-purple-500' },
  'Enfeitiçado': { icon: Heart, color: 'text-pink-500' },
  'Cego': { icon: EyeOff, color: 'text-gray-600' },
  'Invisível': { icon: Cloud, color: 'text-cyan-400' },
  'Inconsciente': { icon: Moon, color: 'text-indigo-500' },
  'Exaustão': { icon: Timer, color: 'text-orange-500' },
};

export default function Compendium({ open, onClose, onAddItem, isGM, customItems = [], onCreateCustomItem, onDeleteCustomItem }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('spells');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [newItem, setNewItem] = useState({
    nome: '',
    categoria: 'spells',
    descricao: '',
    caracteristicas: ''
  });

  const formattedObjects = useMemo(() => {
    const formatCost = (c) => c ? `${c.quant} ${c.moeda}` : '-';
    
    const armors = (objectsData.armaduras || []).map(i => ({
      ...i,
      grupo: 'Armadura',
      renderData: {
        tags: [
            i.tipo === 'escudo' ? 'Escudo' : `Armadura ${i.categoria}`,
            i.furtividade ? 'Furtividade: Desvantagem' : null
        ].filter(Boolean),
        stats: [
            { label: 'CA', value: i.ca || i.bonus_ca },
            { label: 'Força Mín.', value: i.forca_min || '-' },
            { label: 'Peso', value: i.peso_kg ? `${i.peso_kg} kg` : '-' },
            { label: 'Custo', value: formatCost(i.custo) }
        ]
      }
    }));
    
    const weapons = (objectsData.armas || []).map(i => ({
      ...i,
      grupo: 'Arma',
      renderData: {
        tags: ['Arma', ...(i.propriedades || [])],
        stats: [
            { label: 'Dano', value: i.dano || '-' },
            { label: 'Peso', value: i.peso_kg ? `${i.peso_kg} kg` : '-' },
            { label: 'Custo', value: formatCost(i.custo) }
        ]
      }
    }));

    const gear = (objectsData.equipamentos || []).map(i => ({
      ...i,
      grupo: 'Equipamento',
      renderData: {
        tags: ['Equipamento', i.categoria],
        stats: [
            { label: 'Peso', value: i.peso_kg ? `${i.peso_kg} kg` : '-' },
            { label: 'Custo', value: formatCost(i.custo) }
        ]
      }
    }));

    return [...armors, ...weapons, ...gear].sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const formattedShipItems = useMemo(() => {
    const { apendice_navio } = shipItemsData;
    if (!apendice_navio) return [];
    
    const formatCost = (c) => c ? `${c.quant} ${c.moeda}` : '-';

    const recursos = (apendice_navio.recursos_consumo || []).map(i => ({
        ...i,
        grupo: 'Recurso',
        renderData: {
            tags: ['Recurso', i.unidade],
            stats: [
                { label: 'Custo', value: formatCost(i.custo) },
                { label: 'Estoque', value: i.estoque_inicial ? (i.estoque_inicial.quant || `${i.estoque_inicial.min}-${i.estoque_inicial.max}`) + ' ' + i.estoque_inicial.unidade : '-' },
                { label: 'Rendimento', value: i.rendimento ? `Serve ${i.rendimento.serve_tripulantes}` : '-' }
            ]
        },
        descricao: i.efeitos_falta ? `Efeitos de Falta:\n${Object.entries(i.efeitos_falta).map(([k, v]) => {
            const key = k.replace(/_/g, ' ').replace('dia', 'Dia').replace('apos', 'Após');
            const val = Object.entries(v).map(([vk, vv]) => `${vk.replace(/_/g, ' ')}: ${vv}`).join(', ');
            return `• ${key}: ${val}`;
        }).join('\n')}` : ''
    }));

    const municao = (apendice_navio.municao_combate || []).map(i => ({
        ...i,
        grupo: 'Munição',
        renderData: {
            tags: ['Munição', i.unidade],
            stats: [
                { label: 'Estoque', value: i.estoque_inicial ? `${i.estoque_inicial.min}-${i.estoque_inicial.max} ${i.estoque_inicial.unidade}` : '-' }
            ]
        }
    }));

    const municaoEsp = (apendice_navio.municao_especial || []).map(i => ({
        ...i,
        grupo: 'Munição Especial',
        renderData: {
            tags: ['Munição Especial'],
            stats: [
                { label: 'Custo Adicional', value: formatCost(i.custo_adicional_por_bateria) },
                { label: 'Crise', value: i.modificadores?.crise_automatica || '-' }
            ]
        },
        descricao: i.modificadores ? Object.entries(i.modificadores).map(([k,v]) => `${k}: ${v}`).join('\n') : ''
    }));

    const reparos = (apendice_navio.reparos_manutencao || []).map(i => ({
        ...i,
        grupo: 'Reparo',
        renderData: {
            tags: ['Reparo', i.unidade],
            stats: [
                { label: 'Custo', value: formatCost(i.custo) }
            ]
        }
    }));

    const aprimoramentos = [
        ...(apendice_navio.aprimoramentos?.estruturais || []),
        ...(apendice_navio.aprimoramentos?.ofensivos || []),
        ...(apendice_navio.aprimoramentos?.utilitarios || [])
    ].map(i => ({
        ...i,
        grupo: 'Aprimoramento',
        renderData: {
            tags: ['Aprimoramento', i.categoria],
            stats: [
                { label: 'Custo', value: formatCost(i.custo) }
            ]
        },
        descricao: i.efeitos ? i.efeitos.map(e => Object.entries(e).map(([k,v]) => `${k}: ${v}`).join(' ')).join('\n') : ''
    }));

    return [...recursos, ...municao, ...municaoEsp, ...reparos, ...aprimoramentos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const data = useMemo(() => {
    let baseData = [];
    if (tab === 'spells') baseData = spellsData;
    else if (tab === 'actions') baseData = actionsData;
    else if (tab === 'conditions') baseData = conditionsData;
    else if (tab === 'habilidades') baseData = skillsData;
    else if (tab === 'objects') baseData = formattedObjects;
    else if (tab === 'ship') baseData = formattedShipItems;
    
    // Mescla com itens customizados da categoria atual
    const custom = customItems.filter(i => i.categoria === tab);
    
    // Ordena tudo alfabeticamente
    return [...baseData, ...custom].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [tab, formattedObjects, formattedShipItems, customItems]);
  
  const folder = tab;

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return data.filter(item => 
      item.nome.toLowerCase().includes(lower) || 
      (item.nome_ingles && item.nome_ingles.toLowerCase().includes(lower))
    );
  }, [search, data]);

  const handleCreateAndAdd = async () => {
    if (onAddItem && newItem.nome) {
        const itemToAdd = {
            ...newItem,
            tipo: newItem.categoria,
            visible: isVisible,
            renderData: {
                tags: [newItem.categoria.charAt(0).toUpperCase() + newItem.categoria.slice(1)],
                stats: []
            }
        };

        // Salva globalmente se a função for fornecida
        if (onCreateCustomItem) {
            const created = await onCreateCustomItem(itemToAdd);
            // Adiciona ao inventário o item criado (com ID)
            onAddItem(created || itemToAdd);
        } else {
            onAddItem(itemToAdd);
        }
        
        // Limpa e volta para a lista
        setNewItem({ nome: '', categoria: 'spells', descricao: '', caracteristicas: '' });
        setTab(newItem.categoria); // Vai para a aba do novo item
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-5xl h-[100vh] sm:h-[90vh] sm:rounded-2xl border-0 sm:border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header com Busca e Botão Voltar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Botão Voltar - Sempre visível no mobile quando há item selecionado */}
            {selectedItem && (
              <button 
                onClick={() => setSelectedItem(null)} 
                className="md:hidden flex items-center justify-center p-2 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-zinc-950/50 border border-white/10 rounded-lg sm:rounded-xl pl-9 pr-3 py-2 sm:py-3 text-sm sm:text-base text-zinc-200 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-lg sm:rounded-xl text-zinc-400 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Abas - Mobile First */}
        <div className="flex border-b border-white/10 shrink-0 overflow-x-auto">
          <button 
            onClick={() => { setTab('spells'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'spells' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Scroll size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Grimório</span>
            <span className="xs:hidden">Spells</span>
          </button>
          
          <button 
            onClick={() => { setTab('actions'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'actions' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Sword size={14} className="sm:w-4 sm:h-4" /> Ações
          </button>

          <button 
            onClick={() => { setTab('objects'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'objects' ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Package size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Itens</span>
            <span className="xs:hidden">Itens</span>
          </button>

          <button 
            onClick={() => { setTab('ship'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'ship' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Anchor size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Navio</span>
            <span className="xs:hidden">Navio</span>
          </button>
          
          <button 
            onClick={() => { setTab('habilidades'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[90px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'habilidades' ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Sparkles size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Habilidades</span>
            <span className="xs:hidden">Hab.</span>
          </button>
          
          <button 
            onClick={() => { setTab('conditions'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'conditions' ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Activity size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Condições</span>
            <span className="xs:hidden">Cond.</span>
          </button>

          <button 
            onClick={() => { setTab('create'); setSelectedItem(null); setIsVisible(true); }}
            className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'create' ? 'bg-zinc-100 text-zinc-900 border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Plus size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Criar</span>
            <span className="xs:hidden">Criar</span>
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex min-h-0">
           
           {/* Lista Lateral */}
           <div className={`w-full md:w-1/3 border-r border-white/10 overflow-y-auto custom-scrollbar p-2 space-y-1 ${selectedItem || tab === 'create' ? 'hidden md:block' : 'block'}`}>
              {tab === 'create' ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                      Preencha o formulário ao lado para criar um novo item personalizado.
                  </div>
              ) : (
              <>
              {filtered.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 sm:gap-3 transition-all group ${selectedItem === item ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  {/* Ícone */}
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative ${tab === 'conditions' ? 'p-1.5 sm:p-2' : ''}`}>
                     {tab === 'conditions' ? (
                        (() => {
                            const config = CONDITION_ICONS[item.nome] || { icon: HelpCircle, color: 'text-zinc-600' };
                            const Icon = config.icon;
                            return <Icon size={20} className={`sm:w-6 sm:h-6 ${config.color}`} />;
                        })()
                     ) : (tab !== 'objects' && tab !== 'ship') ? (
                        <>
                            <img 
                              src={`/${folder}/${item.nome_ingles || item.nome}.png`} 
                              alt={item.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold opacity-20 group-hover:opacity-40 -z-10">
                                {(item.nome_ingles || item.nome)[0]}
                            </div>
                        </>
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-lg">
                            {(item.nome)[0]}
                        </div>
                     )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate text-xs sm:text-sm">{item.nome}</div>
                    <div className="text-[9px] sm:text-[10px] opacity-60 truncate">{item.nome_ingles || ''}</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-zinc-600 text-xs sm:text-sm italic">
                  Nenhum resultado encontrado.
                </div>
              )}
              </>
              )}
           </div>

           {/* Detalhes (Direita) */}
           <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-zinc-900/50 ${!selectedItem && tab !== 'create' ? 'hidden md:flex items-center justify-center' : 'block'}`}>
              {tab === 'create' ? (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><Plus className="text-indigo-500"/> Criar Novo Item</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome</label>
                            <input 
                                value={newItem.nome}
                                onChange={e => setNewItem({...newItem, nome: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:border-indigo-500 outline-none transition-colors"
                                placeholder="Nome do item..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Categoria</label>
                            <select 
                                value={newItem.categoria}
                                onChange={e => setNewItem({...newItem, categoria: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="spells">Spells (Magias)</option>
                                <option value="actions">Ações</option>
                                <option value="objects">Itens</option>
                                <option value="ship">Navio</option>
                                <option value="habilidades">Habilidades</option>
                                <option value="conditions">Condições</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrição</label>
                            <textarea 
                                value={newItem.descricao}
                                onChange={e => setNewItem({...newItem, descricao: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:border-indigo-500 outline-none min-h-[150px] resize-y"
                                placeholder="Descrição detalhada..."
                            />
                        </div>

                        {isGM && (
                            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-black/30 transition-colors" onClick={() => setIsVisible(!isVisible)}>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isVisible ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm text-zinc-400 font-bold select-none">
                                    {isVisible ? 'Visível para Jogadores' : 'Oculto para Jogadores'}
                                </span>
                            </div>
                        )}

                        <button 
                            onClick={handleCreateAndAdd}
                            disabled={!newItem.nome}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                        >
                            <Plus size={20} />
                            Criar e Adicionar
                        </button>
                    </div>
                </div>
              ) : selectedItem ? (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-300">
                   {/* Botão Adicionar */}
                   {onAddItem && tab !== 'conditions' && (
                     <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-4 mb-4">
                       {isGM && (
                            <div className="flex items-center gap-2 mr-auto sm:mr-0 cursor-pointer" onClick={() => setIsVisible(!isVisible)}>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider select-none">{isVisible ? 'Visível' : 'Oculto'}</span>
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isVisible ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                       )}
                       {/* Botão de Deletar (Apenas para itens customizados e GM) */}
                       {isGM && selectedItem.id && onDeleteCustomItem && (
                           <button 
                             onClick={() => { if(window.confirm('Deletar este item globalmente?')) { onDeleteCustomItem(selectedItem.id); setSelectedItem(null); } }}
                             className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors border border-red-500/30"
                           >
                             <Trash2 size={14} /> Deletar
                           </button>
                       )}
                       <button 
                         onClick={() => onAddItem({ ...selectedItem, visible: isVisible })}
                         className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
                       >
                         <Plus size={14} /> Adicionar
                       </button>
                     </div>
                   )}
                   
                   {/* Cabeçalho com Imagem */}
                   <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 shadow-2xl mx-auto sm:mx-0">
                         {tab === 'conditions' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                {(() => {
                                    const config = CONDITION_ICONS[selectedItem.nome] || { icon: HelpCircle, color: 'text-zinc-600' };
                                    const Icon = config.icon;
                                    return <Icon size={48} className={`sm:w-16 sm:h-16 ${config.color}`} />;
                                })()}
                            </div>
                         ) : (tab !== 'objects' && tab !== 'ship') ? (
                            <img 
                              src={`/${folder}/${selectedItem.nome_ingles || selectedItem.nome}.png`} 
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.style.display = 'none'} 
                            />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                {tab === 'objects' ? <Package size={48} /> : <Anchor size={48} />}
                            </div>
                         )}
                      </div>
                      
                      <div className="text-center sm:text-left flex-1 w-full">
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 leading-tight break-words">
                          {selectedItem.nome}
                        </h2>
                        <div className="text-base sm:text-lg text-zinc-400 italic mb-3">
                          {selectedItem.nome_ingles || ''}
                        </div>
                        {selectedItem.caracteristicas && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                                {selectedItem.caracteristicas.split('\n')[0].split(',').map((tag, i) => (
                                    <span key={i} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-4 sm:space-y-6 text-zinc-300 leading-relaxed text-sm">
                      {/* Renderização Personalizada (Objetos/Navio) ou Padrão */}
                      {selectedItem.renderData ? (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {selectedItem.renderData.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 rounded-md bg-white/10 text-xs font-bold text-zinc-300 border border-white/5 uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {selectedItem.renderData.stats.map((stat, i) => (
                                    <div key={i} className="bg-black/20 p-2 rounded-lg border border-white/5">
                                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-0.5">{stat.label}</div>
                                        <div className="text-sm text-zinc-200 font-medium">{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                            {selectedItem.descricao && (
                                <div className="whitespace-pre-wrap text-justify border-l-2 border-white/10 pl-3 sm:pl-4 text-xs sm:text-sm mt-4">
                                    {selectedItem.descricao}
                                </div>
                            )}
                        </div>
                      ) : (
                        <>
                          {selectedItem.caracteristicas && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-black/20 p-3 sm:p-4 rounded-xl border border-white/5 text-xs">
                               {selectedItem.caracteristicas.split('\n').slice(1).map((line, i) => {
                                 const [key, val] = line.split(':');
                                 if (!val) return null;
                                 return (
                                   <div key={i} className="flex flex-col">
                                     <span className="font-bold text-zinc-500 uppercase tracking-wider text-[9px] mb-0.5">{key}</span>
                                     <span className="text-zinc-200 font-medium text-xs sm:text-sm">{val}</span>
                                   </div>
                                 );
                               })}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap text-justify border-l-2 border-white/10 pl-3 sm:pl-4 text-xs sm:text-sm">
                            {selectedItem.descricao}
                          </div>
                        </>
                      )}
                   </div>
                </div>
              ) : (
                <div className="text-zinc-700 flex flex-col items-center gap-4 select-none">
                  <Book size={48} className="sm:w-16 sm:h-16" strokeWidth={1} />
                  <p className="text-xs sm:text-sm">Selecione um item para ver os detalhes.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
