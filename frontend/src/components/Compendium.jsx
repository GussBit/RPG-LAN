import React, { useState, useMemo } from 'react';
import { 
  Search, X, Zap, Scroll, Sword, Book, Activity, Plus,
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull, 
  FlaskConical, Ghost, Heart, EyeOff, Cloud, Moon, Timer, HelpCircle 
} from 'lucide-react';

// Importando os dados (Certifique-se que os arquivos estão em src/data)
import spellsData from '../data/spells.json';
import actionsData from '../data/actions.json';
import conditionsData from '../data/conditions.json';

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

export default function Compendium({ open, onClose, onAddItem }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('spells'); // 'spells' | 'actions' | 'conditions'
  const [selectedItem, setSelectedItem] = useState(null);

  const data = tab === 'spells' ? spellsData : tab === 'actions' ? actionsData : conditionsData;
  const folder = tab; // 'spells', 'actions', 'conditions'

  // Filtro de busca (Nome PT ou EN)
  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return data.filter(item => 
      item.nome.toLowerCase().includes(lower) || 
      (item.nome_ingles && item.nome_ingles.toLowerCase().includes(lower))
    );
  }, [search, data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header de Busca */}
        <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/20 shrink-0">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
             <input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder={`Buscar...`}
               className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-zinc-200 outline-none focus:border-indigo-500/50 transition-colors"
               autoFocus
             />
           </div>
           <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl text-zinc-400 transition-colors"><X size={20} /></button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-white/10 shrink-0">
          <button 
            onClick={() => { setTab('spells'); setSelectedItem(null); }}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${tab === 'spells' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Scroll size={16} /> Grimório
          </button>
          <button 
            onClick={() => { setTab('actions'); setSelectedItem(null); }}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${tab === 'actions' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Sword size={16} /> Ações
          </button>
          <button 
            onClick={() => { setTab('conditions'); setSelectedItem(null); }}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${tab === 'conditions' ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
          >
            <Activity size={16} /> Condições
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex min-h-0">
           
           {/* Lista Lateral */}
           <div className={`w-full md:w-1/3 border-r border-white/10 overflow-y-auto custom-scrollbar p-2 space-y-1 ${selectedItem ? 'hidden md:block' : 'block'}`}>
              {filtered.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-all group ${selectedItem === item ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  {/* Ícone */}
                  <div className={`h-12 w-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative ${tab === 'conditions' ? 'p-2' : ''}`}>
                     {tab === 'conditions' ? (
                        (() => {
                            const config = CONDITION_ICONS[item.nome] || { icon: HelpCircle, color: 'text-zinc-600' };
                            const Icon = config.icon;
                            return <Icon size={24} className={config.color} />;
                        })()
                     ) : (
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
                     )}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="font-bold truncate text-sm">{item.nome}</div>
                    <div className="text-[10px] opacity-60 truncate">{item.nome_ingles || ''}</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="p-8 text-center text-zinc-600 text-sm italic">Nenhum resultado encontrado.</div>}
           </div>

           {/* Detalhes (Direita) */}
           <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-900/50 ${!selectedItem ? 'hidden md:flex items-center justify-center' : 'block'}`}>
              {selectedItem ? (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setSelectedItem(null)} className="md:hidden text-xs text-zinc-500 flex items-center gap-1">← Voltar</button>
                      {onAddItem && (
                        <button 
                          onClick={() => onAddItem(selectedItem)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ml-auto"
                        >
                          <Plus size={14} /> Adicionar
                        </button>
                      )}
                   </div>
                   
                   <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                      <div className="h-32 w-32 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 shadow-2xl mx-auto sm:mx-0">
                         {tab === 'conditions' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                {(() => {
                                    const config = CONDITION_ICONS[selectedItem.nome] || { icon: HelpCircle, color: 'text-zinc-600' };
                                    const Icon = config.icon;
                                    return <Icon size={64} className={config.color} />;
                                })()}
                            </div>
                         ) : (
                            <img 
                            src={`/${folder}/${selectedItem.nome_ingles || selectedItem.nome}.png`} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'} 
                            />
                         )}
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h2 className="text-3xl font-black text-white mb-1 leading-tight">{selectedItem.nome}</h2>
                        <div className="text-lg text-zinc-400 italic mb-3">{selectedItem.nome_ingles || ''}</div>
                        {selectedItem.caracteristicas && (
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                {selectedItem.caracteristicas.split('\n')[0].split(',').map((tag, i) => (
                                    <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-6 text-zinc-300 leading-relaxed text-sm">
                      {/* Grid de Características */}
                      {selectedItem.caracteristicas && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5 text-xs">
                           {selectedItem.caracteristicas.split('\n').slice(1).map((line, i) => {
                             const [key, val] = line.split(':');
                             if (!val) return null;
                             return (
                               <div key={i} className="flex flex-col">
                                 <span className="font-bold text-zinc-500 uppercase tracking-wider text-[9px] mb-0.5">{key}</span>
                                 <span className="text-zinc-200 font-medium">{val}</span>
                               </div>
                             );
                           })}
                        </div>
                      )}
                      
                      {/* Descrição */}
                      <div className="whitespace-pre-wrap text-justify border-l-2 border-white/10 pl-4">
                        {selectedItem.descricao}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-zinc-700 flex flex-col items-center gap-4 select-none">
                  <Book size={64} strokeWidth={1} />
                  <p className="text-sm">Selecione um item para ver os detalhes.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
