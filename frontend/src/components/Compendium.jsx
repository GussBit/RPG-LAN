import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, X, Zap, Scroll, Sword, Book, Activity, Plus, Sparkles,
  ArrowDownCircle, Link as LinkIcon, ZapOff, Skull,
  FlaskConical, Ghost, Heart, EyeOff, Cloud, Moon, Timer, HelpCircle,
  ChevronLeft, Package, Anchor, Globe, Loader, List, Shield, Filter
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

const normalizeText = (text) => {
  return text ? text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
};

const normalizeFilename = (text) => {
  return text ? text.toString()
    .replace(/'/g, '')
    .replace(/\s+/g, '_')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
};

const normalizeItemFilename = (text) => {
  return text ? text.toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() : "";
};

const formatDescription = (text) => {
  if (!text) return "";

  // Marca fim de frase com um separador, evitando quebrar decimais (ex: 3.14)
  const marked = text.replace(/\.(?:\s+|(?=[^\d\s]))/g, ".<SPLIT>");

  const sentences = marked
    .split("<SPLIT>")
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return "";

  const MAX_INLINE = 100;

  let result = sentences[0];

  for (let i = 1; i < sentences.length; i++) {
    const next = sentences[i];

    // Se a próxima frase for curta (<= 70), mantém no mesmo parágrafo
    // Se for maior, cria quebra dupla (novo parágrafo)
    if (next.length <= MAX_INLINE) {
      result += (result.endsWith(".") ? " " : " ") + next;
    } else {
      result += "\n\n" + next;
    }
  }

  return result;
};



const getSpellFallbackImage = (item) => {
  if (item._folder !== 'spells' || !item.caracteristicas) return null;
  if (typeof item.caracteristicas !== 'string') return null;

  const match = item.caracteristicas.match(/(\d+)º Círculo/);
  if (match) {
    return `/${item._folder}/${match[1]}c.png`;
  }
  if (item.caracteristicas.toLowerCase().includes('truque')) return `/${item._folder}/0c.png`;
  return null;
};

const Highlight = ({ text, highlight }) => {
  if (!highlight || !text) return text;
  const normalizedText = normalizeText(text);
  const normalizedHighlight = normalizeText(highlight);

  if (!normalizedText.includes(normalizedHighlight)) return text;

  const parts = [];
  let currentIndex = 0;
  let matchIndex = normalizedText.indexOf(normalizedHighlight, currentIndex);

  while (matchIndex !== -1) {
    if (matchIndex > currentIndex) {
      parts.push(text.substring(currentIndex, matchIndex));
    }
    const matchLength = normalizedHighlight.length;
    parts.push(
      <span key={matchIndex} className="bg-indigo-500/50 text-white font-bold px-0.5 rounded">
        {text.substring(matchIndex, matchIndex + matchLength)}
      </span>
    );
    currentIndex = matchIndex + matchLength;
    matchIndex = normalizedText.indexOf(normalizedHighlight, currentIndex);
  }
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  return <>{parts}</>;
};

const CompendiumItemIcon = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retrySuffix, setRetrySuffix] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setRetrySuffix('');
  }, [item]);

  useEffect(() => {
    let timeout;
    if (isLoading) {
      timeout = setTimeout(() => {
        setRetrySuffix(`?t=${Date.now()}`);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, retrySuffix]);

  if (item._folder === 'conditions') {
    const config = CONDITION_ICONS[item.nome] || { icon: HelpCircle, color: 'text-zinc-600' };
    const Icon = config.icon;
    return <Icon size={20} className={`sm:w-6 sm:h-6 ${config.color}`} />;
  }

  // Lógica de Caminho de Imagem
  let imageSrc = '';
  
  if (item._folder === 'itens') {
    imageSrc = `/${item._folder}/${normalizeItemFilename(item.nome)}.jpg`;
  } 
  else if (item._folder === 'ship') {
    imageSrc = `/ship/${normalizeItemFilename(item.nome)}.jpg`;
  } 
  else if (item._folder === 'habilidades') {
    // Nova lógica para habilidades e classes
    // Se for sub-habilidade, usa a origem (nome da classe). Se for classe, usa o próprio nome.
    const targetName = item.origem || item.nome;
    imageSrc = `/skills/${normalizeFilename(targetName).toLowerCase()}.jpg`;
  }
  else {
    imageSrc = `/${item._folder}/${normalizeFilename(item.nome_ingles || item.nome)}.png`;
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <Loader className="w-4 h-4 text-zinc-600 animate-spin" />
        </div>
      )}
      <img
        src={`${imageSrc}${retrySuffix}`}
        alt={item.nome}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          // Lógica de Fallback
          if (item._folder === 'itens') {
            if (!e.target.src.includes('item_generico.jpg')) {
              e.target.src = '/itens/item_generico.jpg';
            } else {
              e.target.style.display = 'none';
              setIsLoading(false);
            }
          } 
          else if (item._folder === 'ship') {
             if (e.target.src.endsWith('.jpg')) {
                 e.target.src = e.target.src.replace('.jpg', '.png');
             } else {
                 e.target.style.display = 'none';
                 setIsLoading(false);
             }
          }
          else if (item._folder === 'habilidades') {
             // Se falhar a imagem da skill, esconde e mostra o ícone
             e.target.style.display = 'none';
             setIsLoading(false);
          }
          else {
            const fallback = getSpellFallbackImage(item);
            if (fallback && !e.target.src.includes(fallback)) {
              e.target.src = fallback;
            } else {
              e.target.style.display = 'none';
              setIsLoading(false);
            }
          }
        }}
      />
      {/* Ícones de Fundo (Fallback visual) */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold opacity-20 group-hover:opacity-40 -z-10">
        {item._folder === 'ship' ? <Anchor size={20} /> :
         item._folder === 'habilidades' ? <Sparkles size={20} /> :
         (item.nome_ingles || item.nome)[0]}
      </div>
    </>
  );
};

export default function Compendium({ open, onClose, onAddItem, isGM, customItems = [], onCreateCustomItem, onDeleteCustomItem }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('general');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [detailImageLoading, setDetailImageLoading] = useState(true);
  
  // Estado para filtros
  const [activeFilters, setActiveFilters] = useState({
    type: null, // Para itens (Arma, Equipamento, etc) ou Nível de Magia
    subType: null // Para Classes de Magia
  });

  // Reseta filtros ao mudar de aba
  useEffect(() => {
    setActiveFilters({ type: null, subType: null });
    setSelectedItem(null);
  }, [tab]);

  useEffect(() => {
    if (selectedItem) {
      setDetailImageLoading(true);
    }
  }, [selectedItem]);

  // Extração de Classes Únicas das Magias (com limpeza de parênteses)
  const spellClasses = useMemo(() => {
    const classesSet = new Set();
    spellsData.forEach(spell => {
        if (spell.classes) {
            // Remove parênteses e seus conteúdos para limpeza ou apenas os caracteres ()
            // O user pediu para "ignorar parenteses", vou remover os caracteres globais
            const cleanString = spell.classes.replace(/[()]/g, '');
            const parts = cleanString.split(',');
            parts.forEach(p => {
                const c = p.trim();
                if (c) classesSet.add(c);
            });
        }
    });
    return Array.from(classesSet).sort();
  }, []);

  // Extração de Classes de Habilidades
  const skillClasses = useMemo(() => {
    return skillsData.map(c => c.nome).sort();
  }, []);

  // Processamento de Objetos
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

  // Processamento de Navio
  const formattedShipItems = useMemo(() => {
    const { apendice_navio } = shipItemsData;
    if (!apendice_navio) return [];

    const formatCost = (c) => c ? `${c.quant} ${c.moeda}` : '-';

    // Helper para formatar chaves de objetos (snake_case para Title Case)
    const formatKey = (key) => {
        const map = {
            'pv_percent_delta': 'PV %',
            'moral_delta': 'Moral',
            'moral_delta_por_dia': 'Moral/Dia',
            'ca_inimigo_delta': 'CA Inimigo',
            'movimento_delta': 'Movimento',
            'crise_automatica': 'Crise Automática',
            'custo_diario_tripulacao_percent_delta': 'Custo Tripulação %',
            'moral_inicial_delta': 'Moral Inicial',
            'canhao_pesado_frontal_por_rodada_delta': 'Canhão Frontal/Rodada',
            'ataques_em_todos_canhoes_delta': 'Ataques Totais',
            'dano_colisao': 'Dano Colisão',
            'vantagem_em': 'Vantagem em',
            'ignora_primeira_crise_vela': 'Ignora 1ª Crise Vela',
            'vento_a_favor': 'Vento a Favor',
            'velocidade_delta': 'Velocidade',
            'detectar_carga_ilegal': 'Detectar Carga Ilegal'
        };
        if (map[key]) return map[key];
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatValue = (val) => {
        if (val === true) return 'Sim';
        if (val === false) return 'Não';
        if (Array.isArray(val)) return val.map(formatValue).join(', ');
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
    };

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
        const val = Object.entries(v).map(([vk, vv]) => `${formatKey(vk)}: ${vv}`).join(', ');
        return `• ${key}: ${val}`;
      }).join('\n')}` : (i.efeitos ? `Efeitos:\n${i.efeitos.map(e => Object.entries(e).map(([k, v]) => `• ${formatKey(k)}: ${v}`).join('\n')).join('\n')}` : '')
    }));

    const municao = (apendice_navio.municao_combate || []).map(i => ({
      ...i,
      grupo: 'Munição',
      renderData: {
        tags: ['Munição', i.unidade],
        stats: [
          { label: 'Estoque', value: i.estoque_inicial ? `${i.estoque_inicial.min}-${i.estoque_inicial.max} ${i.estoque_inicial.unidade}` : '-' }
        ]
      },
      descricao: i.variantes_por_categoria_navio ? i.variantes_por_categoria_navio.map(v => 
        `• ${v.categoria_navio}: ${formatCost(v.custo)} (${v.equivalencia})`
      ).join('\n') : ''
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
      descricao: i.modificadores ? Object.entries(i.modificadores).map(([k, v]) => `• ${formatKey(k)}: ${formatValue(v)}`).join('\n') : ''
    }));

    const reparos = (apendice_navio.reparos_manutencao || []).map(i => ({
      ...i,
      grupo: 'Reparo',
      renderData: {
        tags: ['Reparo', i.unidade],
        stats: [
          { label: 'Custo', value: formatCost(i.custo) }
        ]
      },
      descricao: i.calculo_estoque ? `Cálculo de Estoque:\n• ${i.calculo_estoque.opcao_a}\n• ${i.calculo_estoque.opcao_b}\n(Regra: ${formatKey(i.calculo_estoque.regra)})` : 
                 (i.estoque_por_categoria ? i.estoque_por_categoria.map(e => `• ${e.categoria_navio}: Suporta ${e.suporta_reparos} reparos`).join('\n') : '')
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
      descricao: i.efeitos ? i.efeitos.map(e => Object.entries(e).map(([k, v]) => `• ${formatKey(k)}: ${formatValue(v)}`).join('\n')).join('\n') : ''
    }));

    return [...recursos, ...municao, ...municaoEsp, ...reparos, ...aprimoramentos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const formattedSkills = useMemo(() => {
     return skillsData.flatMap(classe => {
        const parent = { ...classe, _folder: 'habilidades' };
        let children = [];
        if (classe.habilidades && Array.isArray(classe.habilidades)) {
            children = classe.habilidades.map(hab => ({
                ...hab,
                _folder: 'habilidades',
                tipo: 'sub_habilidade',
                origem: classe.nome
            }));
        }
        return [parent, ...children];
     });
  }, []);

  const data = useMemo(() => {
    let baseData = [];
    const tag = (arr, folder) => arr.map(i => ({ ...i, _folder: folder }));

    if (tab === 'general') {
      baseData = [
        ...tag(spellsData, 'spells'),
        ...tag(actionsData, 'actions'),
        ...tag(conditionsData, 'conditions'),
        ...formattedSkills,
        ...tag(formattedObjects, 'itens'),
        ...tag(formattedShipItems, 'ship')
      ];
    }
    else if (tab === 'spells') baseData = tag(spellsData, 'spells');
    else if (tab === 'actions') baseData = tag(actionsData, 'actions');
    else if (tab === 'conditions') baseData = tag(conditionsData, 'conditions');
    else if (tab === 'habilidades') baseData = formattedSkills;
    else if (tab === 'objects') baseData = tag(formattedObjects, 'itens');
    else if (tab === 'ship') baseData = tag(formattedShipItems, 'ship');

    const custom = customItems
      .filter(i => tab === 'general' || i.categoria === tab)
      .map(i => ({ ...i, _folder: i.categoria }));

    return [...baseData, ...custom].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [tab, formattedObjects, formattedShipItems, formattedSkills, customItems]);

  // Lógica de Filtragem Principal
  const filtered = useMemo(() => {
    const term = normalizeText(search);
    
    return data.filter(item => {
        // 1. Busca por Texto (Search Bar)
        const matchesSearch = 
            normalizeText(item.nome).includes(term) ||
            normalizeText(item.nome_ingles).includes(term) ||
            (item.descricao && normalizeText(item.descricao).includes(term)) ||
            (item.origem && normalizeText(item.origem).includes(term));

        if (!matchesSearch) return false;

        // 2. Filtros Específicos por Aba
        if (tab === 'objects') {
            if (activeFilters.type) {
                if (activeFilters.type === 'Arma') return item.grupo === 'Arma';
                if (activeFilters.type === 'Equipamento') return item.grupo === 'Equipamento';
                
                // Lógica para Armaduras (Leve, Média, Pesada)
                if (activeFilters.type.includes('Armadura')) {
                    if (item.grupo !== 'Armadura') return false;
                    const requiredType = activeFilters.type.split(' ')[1].toLowerCase(); // "Leve", "Média", "Pesada"
                    // Normaliza a categoria do item (remove acentos)
                    const itemCat = normalizeText(item.categoria);
                    if (requiredType === 'medio' && itemCat === 'medio') return true;
                    if (requiredType === 'leve' && itemCat === 'leve') return true;
                    if (requiredType === 'pesado' && itemCat === 'pesado') return true;
                    return false;
                }
            }
        }

        if (tab === 'spells') {
            // Filtro de Nível
            if (activeFilters.type) {
                // Truque
                if (activeFilters.type === '0') {
                    if (!item.caracteristicas || !item.caracteristicas.toLowerCase().includes('truque')) return false;
                } else {
                    // Círculos 1-9
                    if (!item.caracteristicas || !item.caracteristicas.includes(`${activeFilters.type}º Círculo`)) return false;
                }
            }
            // Filtro de Classe
            if (activeFilters.subType) {
                // Remove parenteses para comparação segura
                const cleanClasses = item.classes ? item.classes.replace(/[()]/g, '') : '';
                if (!cleanClasses.includes(activeFilters.subType)) return false;
            }
        }

        if (tab === 'habilidades') {
            if (activeFilters.type) {
                // Se uma classe está selecionada, mostra a classe e suas habilidades
                if (item.nome !== activeFilters.type && item.origem !== activeFilters.type) {
                    return false;
                }
            } else {
                // Se nenhuma classe estiver selecionada, mostra apenas as classes pai
                if (item.tipo !== 'classe') return false;
            }
        }

        if (tab === 'ship' && activeFilters.type) {
            if (item.grupo !== activeFilters.type) return false;
        }

        return true;
    });
  }, [search, data, activeFilters, tab]);

  const getDescSnippet = (item) => {
    if (!search) return null;
    const term = normalizeText(search);
    if (item.descricao && normalizeText(item.descricao).includes(term)) {
        const text = item.descricao;
        const index = normalizeText(text).indexOf(term);
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + search.length + 40);
        return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    }
    return null;
  };

  const toggleFilter = (key, value) => {
    setActiveFilters(prev => ({
        ...prev,
        [key]: prev[key] === value ? null : value
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-5xl h-[100vh] sm:h-[90vh] sm:rounded-2xl border-0 sm:border border-white/10 flex flex-col overflow-hidden shadow-2xl">

        {/* Header com Busca */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-black/20 shrink-0 space-y-3">
          <div className="flex items-center gap-2 sm:gap-4">
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
                className="w-full bg-zinc-950/50 border border-white/10 rounded-lg sm:rounded-xl pl-9 pr-3 py-2 sm:py-3 text-base text-zinc-200 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg sm:rounded-xl text-zinc-400 transition-colors shrink-0">
              <X size={20} />
            </button>
          </div>

          {/* Área de Filtros (Aparece apenas em abas específicas) */}
          {(tab === 'objects' || tab === 'spells' || tab === 'habilidades' || tab === 'ship') && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <Filter size={14} className="text-zinc-500 shrink-0" />
                    
                    {/* Filtros de Objetos */}
                    {tab === 'objects' && (
                        <>
                            {['Arma', 'Equipamento', 'Armadura Leve', 'Armadura Média', 'Armadura Pesada'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => toggleFilter('type', f)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeFilters.type === f ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Filtros de Magias - Níveis */}
                    {tab === 'spells' && (
                        <>
                            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => toggleFilter('type', lvl)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeFilters.type === lvl ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'}`}
                                >
                                    {lvl === '0' ? 'Truque' : `${lvl}º`}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Filtros de Habilidades */}
                    {tab === 'habilidades' && (
                        <>
                            {skillClasses.map(f => (
                                <button
                                    key={f}
                                    onClick={() => toggleFilter('type', f)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeFilters.type === f ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Filtros de Itens de Navio */}
                    {tab === 'ship' && (
                        <>
                            {['Aprimoramento', 'Munição', 'Munição Especial', 'Recurso', 'Reparo'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => toggleFilter('type', f)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeFilters.type === f ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Filtros de Magias - Classes (Sub-linha) */}
                {tab === 'spells' && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-t border-white/5 pt-2">
                         <span className="text-[10px] uppercase text-zinc-600 font-bold shrink-0">Classes:</span>
                         {spellClasses.map(cls => (
                            <button
                                key={cls}
                                onClick={() => toggleFilter('subType', cls)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-colors border ${activeFilters.subType === cls ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-zinc-800/50 text-zinc-500 border-transparent hover:bg-zinc-700'}`}
                            >
                                {cls}
                            </button>
                         ))}
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Abas */}
        <div className="flex border-b border-white/10 shrink-0 overflow-x-auto">
          <button onClick={() => { setTab('general'); }} className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'general' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Globe size={14} className="sm:w-4 sm:h-4" /> Geral </button>
          <button onClick={() => { setTab('spells'); }} className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'spells' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Scroll size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Grimório</span> <span className="xs:hidden">Spells</span> </button>
          <button onClick={() => { setTab('actions'); }} className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'actions' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Sword size={14} className="sm:w-4 sm:h-4" /> Ações </button>
          <button onClick={() => { setTab('objects'); }} className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'objects' ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Package size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Itens</span> <span className="xs:hidden">Itens</span> </button>
          <button onClick={() => { setTab('ship'); }} className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'ship' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Anchor size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Navio</span> <span className="xs:hidden">Navio</span> </button>
          <button onClick={() => { setTab('habilidades'); }} className={`flex-1 min-w-[90px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'habilidades' ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Sparkles size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Habilidades</span> <span className="xs:hidden">Hab.</span> </button>
          <button onClick={() => { setTab('conditions'); }} className={`flex-1 min-w-[80px] py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-colors ${tab === 'conditions' ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}> <Activity size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Condições</span> <span className="xs:hidden">Cond.</span> </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex min-h-0">

          {/* Lista Lateral */}
          <div className={`w-full md:w-1/3 border-r border-white/10 overflow-y-auto custom-scrollbar p-2 space-y-1 ${selectedItem ? 'hidden md:block' : 'block'}`}>
            {filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 sm:gap-3 transition-all group ${selectedItem === item ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
              >
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative ${item._folder === 'conditions' ? 'p-1.5 sm:p-2' : ''}`}>
                  <CompendiumItemIcon item={item} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate text-xs sm:text-sm">
                    <Highlight text={item.nome} highlight={search} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] opacity-60 truncate flex items-center">
                    <Highlight text={item.nome_ingles || ''} highlight={search} />
                    
                    {item.tipo === 'classe' && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700 text-[8px] font-bold uppercase">
                            Classe
                        </span>
                    )}
                    {item.tipo === 'sub_habilidade' && item.origem && (
                         <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 text-[8px] font-bold uppercase truncate max-w-[100px]">
                            {item.origem}
                        </span>
                    )}
                  </div>
                  {search && !normalizeText(item.nome).includes(normalizeText(search)) && !normalizeText(item.nome_ingles || '').includes(normalizeText(search)) && (
                    <div className="text-[9px] text-indigo-400 truncate mt-0.5">
                      <Highlight text={getDescSnippet(item)} highlight={search} />
                    </div>
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-zinc-600 text-xs sm:text-sm italic">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>

          {/* Detalhes (Direita) */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-zinc-900/50 ${!selectedItem ? 'hidden md:flex items-center justify-center' : 'block'}`}>
            {selectedItem ? (
              <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-300">
                {/* Botão Adicionar */}
                {onAddItem && selectedItem._folder !== 'conditions' && (
                  <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-4 mb-4">
                    {isGM && (
                      <div className="flex items-center gap-2 mr-auto sm:mr-0 cursor-pointer" onClick={() => setIsVisible(!isVisible)}>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider select-none">{isVisible ? 'Visível' : 'Oculto'}</span>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isVisible ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                          <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    )}
                    {isGM && selectedItem.id && onDeleteCustomItem && (
                      <button
                        onClick={() => { if (window.confirm('Deletar este item globalmente?')) { onDeleteCustomItem(selectedItem.id); setSelectedItem(null); } }}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors border border-red-500/30"
                      >
                        <Skull size={14} /> Deletar
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
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 shadow-2xl mx-auto sm:mx-0 relative">
                    {selectedItem._folder === 'conditions' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        {(() => {
                          const config = CONDITION_ICONS[selectedItem.nome] || { icon: HelpCircle, color: 'text-zinc-600' };
                          const Icon = config.icon;
                          return <Icon size={48} className={`sm:w-16 sm:h-16 ${config.color}`} />;
                        })()}
                      </div>
                    ) : (
                      <>
                        {detailImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                            <Loader className="w-8 h-8 text-zinc-600 animate-spin" />
                          </div>
                        )}
                        <img
                          src={selectedItem._folder === 'itens'
                            ? `/${selectedItem._folder}/${normalizeItemFilename(selectedItem.nome)}.jpg`
                            : selectedItem._folder === 'ship'
                            ? `/ship/${normalizeItemFilename(selectedItem.nome)}.jpg`
                            : selectedItem._folder === 'habilidades'
                            ? `/skills/${normalizeFilename(selectedItem.origem || selectedItem.nome)}.jpg`
                            : `/${selectedItem._folder}/${normalizeFilename(selectedItem.nome_ingles || selectedItem.nome)}.png`}
                          className="w-full h-full object-cover"
                          onLoad={() => setDetailImageLoading(false)}
                          onError={(e) => {
                            // Fallbacks
                            if (selectedItem._folder === 'itens') {
                              if (!e.target.src.includes('item_generico.jpg')) {
                                e.target.src = '/itens/item_generico.jpg';
                              } else {
                                e.target.style.display = 'none';
                                setDetailImageLoading(false);
                              }
                            } else if (selectedItem._folder === 'ship' || selectedItem._folder === 'habilidades') {
                                if (e.target.src.endsWith('.jpg')) {
                                    e.target.src = e.target.src.replace('.jpg', '.png');
                                } else {
                                    e.target.style.display = 'none';
                                    setDetailImageLoading(false);
                                }
                            } else {
                              const fallback = getSpellFallbackImage(selectedItem);
                              if (fallback && !e.target.src.includes(fallback)) {
                                e.target.src = fallback;
                              } else {
                                e.target.style.display = 'none';
                                setDetailImageLoading(false);
                              }
                            }
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center -z-20 text-zinc-700">
                             {selectedItem.habilidades ? <Shield size={32} /> : 
                              selectedItem.tipo === 'sub_habilidade' ? <List size={32} /> :
                              selectedItem._folder === 'ship' ? <Anchor size={32} /> :
                              selectedItem._folder === 'habilidades' ? <Sparkles size={32} /> :
                              <Sparkles size={32} />}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-center sm:text-left flex-1 w-full">
                    {selectedItem.origem && (
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                            Habilidade de {selectedItem.origem}
                        </div>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 leading-tight break-words">
                      <Highlight text={selectedItem.nome} highlight={search} />
                    </h2>
                    <div className="text-base sm:text-lg text-zinc-400 italic mb-3">
                      <Highlight text={selectedItem.nome_ingles || ''} highlight={search} />
                    </div>
                    {selectedItem.caracteristicas && typeof selectedItem.caracteristicas === 'string' && !selectedItem.habilidades && (
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
                  {/* CASO 1: Objetos/Navio */}
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
                          <Highlight text={formatDescription(selectedItem.descricao)} highlight={search} />
                        </div>
                      )}
                    </div>
                  ) 
                  /* CASO 2: Classes com Sub-Habilidades */
                  : selectedItem.habilidades ? (
                     <div className="space-y-6">
                        {selectedItem.caracteristicas && (
                           <div className="bg-white/5 p-4 rounded-xl border border-white/5 italic text-zinc-400">
                              "{selectedItem.caracteristicas}"
                           </div>
                        )}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 border-b border-indigo-500/20 pb-2 mb-4">
                                Características da Classe
                            </h3>
                            {selectedItem.habilidades.map((hab, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setSelectedItem({ ...hab, _folder: 'habilidades', tipo: 'sub_habilidade', origem: selectedItem.nome })}
                                    className="w-full text-left bg-black/20 rounded-lg p-4 border border-white/5 hover:border-indigo-500/30 hover:bg-white/5 transition-all group"
                                >
                                    <h4 className="font-bold text-white mb-1 flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        {hab.nome}
                                    </h4>
                                    <p className="text-zinc-500 text-xs line-clamp-2">
                                        {hab.descricao}
                                    </p>
                                </button>
                            ))}
                        </div>
                     </div>
                  ) 
                  /* CASO 3: Padrão (Magias, etc) */
                  : (
                    <>
                      {selectedItem.caracteristicas && !selectedItem.tipo === 'sub_habilidade' && (
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
                        <Highlight text={formatDescription(selectedItem.descricao)} highlight={search} />
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
