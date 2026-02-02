import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, FileJson, Check, AlertCircle, Braces, Search, ChevronRight, ArrowLeft,
  Plus, Trash2, Edit3, Package, Folder, FolderOpen, File, RefreshCw,
  AlertTriangle, Database, Layers, Box, ChevronDown, Home, Sparkles,
  Menu, X, PanelLeftOpen, PanelLeftClose, List
} from 'lucide-react';
import { API_URL } from '../api';
import { toast } from 'react-toastify';

// --- HELPERS PARA MANIPULAÇÃO DE OBJETOS ANINHADOS ---

const getValue = (obj, path) => {
  if (!path || path.length === 0) return obj;
  return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
};

const setValue = (obj, path, value) => {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[head] = rest.length === 0 ? value : setValue(copy[head], rest, value);
  return copy;
};

const normalizeText = (text) => {
  return text ? text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
};

// --- COMPONENTE DE BREADCRUMB ---
function Breadcrumb({ path, fileData, onNavigate }) {
  if (!path || path.length === 0) return null;
  
  const items = [];
  let currentData = fileData;
  
  path.forEach((segment, index) => {
    const partialPath = path.slice(0, index + 1);
    
    if (Array.isArray(currentData)) {
      currentData = currentData[segment];
      items.push({ label: currentData?.nome || `Item ${segment + 1}`, path: partialPath });
    } else {
      currentData = currentData[segment];
      items.push({ label: segment, path: partialPath });
    }
  });
  
  return (
    <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-thin pb-2">
      <button 
        onClick={() => onNavigate(null)}
        className="px-2 py-1 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
      >
        <Home size={14} />
      </button>
      <ChevronRight size={12} className="text-zinc-700 shrink-0" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => onNavigate(item.path)}
            className={`px-2 py-1 rounded-md transition-colors truncate max-w-[150px] shrink-0 ${
              index === items.length - 1
                ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                : 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
            }`}
            title={item.label}
          >
            {item.label}
          </button>
          {index < items.length - 1 && <ChevronRight size={12} className="text-zinc-700 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// --- COMPONENTE DE ITEM DA ÁRVORE ---
function TreeItem({ item, index, path, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30 shadow-lg shadow-indigo-900/10' 
          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2 truncate flex-1">
        <div className={`p-1.5 rounded-md transition-colors ${
          isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800/50 text-zinc-600 group-hover:text-zinc-400'
        }`}>
          <Box size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.nome || `Item ${index + 1}`}</div>
          {item.descricao && (
            <div className="text-[10px] text-zinc-600 truncate mt-0.5">{item.descricao.substring(0, 40)}...</div>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="shrink-0 ml-2">
          <ChevronRight size={16} className="text-indigo-400" />
        </div>
      )}
    </button>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function DataEditor() {
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTermFiles, setSearchTermFiles] = useState('');

  const [fileData, setFileData] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchTermObjects, setSearchTermObjects] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados para controle de sidebars responsivas
  const [showFilesSidebar, setShowFilesSidebar] = useState(true);
  const [showStructureSidebar, setShowStructureSidebar] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  // Fecha sidebars em mobile por padrão
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowFilesSidebar(false);
        setShowStructureSidebar(false);
      } else {
        setShowFilesSidebar(true);
        setShowStructureSidebar(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data-files`);
      if (res.ok) {
        const list = await res.json();
        setFiles(list);
      }
    } catch (error) {
      toast.error("Erro ao buscar arquivos");
    }
  };

  const handleSelectFile = async (filename) => {
    if (hasUnsavedChanges && !window.confirm('Você tem alterações não salvas. Deseja continuar?')) {
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: '', msg: '' });
    setFileData(null);
    setSelectedPath(null);
    setHasUnsavedChanges(false);
    
    try {
      const res = await fetch(`${API_URL}/api/data/${filename}`);
      if (res.ok) {
        const data = await res.json();
        setFileData(data); 
        setSelectedFile(filename);
        toast.success(`Arquivo "${filename}" carregado`);
        
        // Fecha sidebar de arquivos em mobile após seleção
        if (window.innerWidth < 1024) {
          setShowFilesSidebar(false);
        }
      } else {
        toast.error('Erro ao carregar arquivo');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !fileData) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/data/${selectedFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData, null, 2)
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: 'Alterações salvas com sucesso!' });
        setHasUnsavedChanges(false);
        toast.success('Arquivo salvo!');
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
      } else {
        setStatus({ type: 'error', msg: 'Erro ao salvar no servidor' });
        toast.error('Falha ao salvar');
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Erro de conexão ao salvar' });
      toast.error('Erro de conexão');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (key, value) => {
    if (!selectedPath) return;
    
    const currentObject = getValue(fileData, selectedPath);
    const newObject = { ...currentObject, [key]: value };
    const newFileData = setValue(fileData, selectedPath, newObject);
    
    setFileData(newFileData);
    setHasUnsavedChanges(true);
  };

  const handleAddItem = () => {
    if (!fileData || !selectedPath) {
        if (Array.isArray(fileData)) {
             const newObject = { nome: "Novo Item", descricao: "" };
             const newFileData = [...fileData, newObject];
             setFileData(newFileData);
             setSelectedPath([newFileData.length - 1]);
             setHasUnsavedChanges(true);
             toast.success('Novo item criado');
             return;
        }
        return toast.warn('Selecione um item para criar um irmão');
    }

    const parentPath = selectedPath.slice(0, -1);
    const parent = getValue(fileData, parentPath);

    if (Array.isArray(parent)) {
        const template = parent.length > 0 ? parent[0] : { nome: "Novo Item" };
        const newObject = {};
        Object.keys(template).forEach(k => {
          newObject[k] = (typeof template[k] === 'object' ? (Array.isArray(template[k]) ? [] : {}) : "");
        });
        newObject.nome = "Novo Item";

        const newParent = [...parent, newObject];
        const newFileData = setValue(fileData, parentPath, newParent);
        
        setFileData(newFileData);
        setSelectedPath([...parentPath, newParent.length - 1]);
        setHasUnsavedChanges(true);
        toast.success('Novo item adicionado');
        
        // Fecha sidebar de estrutura em mobile após adicionar
        if (window.innerWidth < 768) {
          setShowStructureSidebar(false);
        }
    } else {
        toast.warn('Não é possível adicionar item aqui');
    }
  };

  const handleDeleteItem = () => {
    if (!selectedPath) return;
    
    const currentObject = getValue(fileData, selectedPath);
    if (window.confirm(`Tem certeza que deseja deletar "${currentObject?.nome || 'este item'}"?`)) {
        const parentPath = selectedPath.slice(0, -1);
        const index = selectedPath[selectedPath.length - 1];
        const parent = getValue(fileData, parentPath);

        if (Array.isArray(parent)) {
            const newParent = parent.filter((_, i) => i !== index);
            const newFileData = setValue(fileData, parentPath, newParent);
            setFileData(newFileData);
            setSelectedPath(null);
            setHasUnsavedChanges(true);
            toast.info('Item removido');
        }
    }
  };

  const handleTreeItemClick = (itemPath) => {
    setSelectedPath(itemPath);
    // Fecha sidebar de estrutura em mobile após seleção
    if (window.innerWidth < 768) {
      setShowStructureSidebar(false);
    }
  };

  // --- RENDERIZAÇÃO DA ÁRVORE ---
  const renderTree = (data, path = []) => {
    if (Array.isArray(data)) {
      const filteredItems = data.map((item, index) => ({ item, index })).filter(({ item }) => {
         if (!searchTermObjects) return true;
         const term = normalizeText(searchTermObjects);
         return normalizeText(item.nome).includes(term) || normalizeText(item.descricao).includes(term);
      });

      return (
        <div className="space-y-1">
           {filteredItems.map(({ item, index }) => {
             const itemPath = [...path, index];
             const isSelected = JSON.stringify(selectedPath) === JSON.stringify(itemPath);
             
             return (
                <TreeItem
                  key={index}
                  item={item}
                  index={index}
                  path={itemPath}
                  isSelected={isSelected}
                  onClick={() => handleTreeItemClick(itemPath)}
                />
             );
           })}
           {filteredItems.length === 0 && (
             <div className="text-center text-zinc-600 text-xs italic py-6 border border-dashed border-white/5 rounded-lg">
               {searchTermObjects ? 'Nenhum resultado encontrado' : 'Lista vazia'}
             </div>
           )}
        </div>
      );
    } else if (typeof data === 'object' && data !== null) {
       return (
         <div className="space-y-3">
           {Object.entries(data).map(([key, value]) => (
             <div key={key} className="space-y-1.5">
               <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/50 rounded-lg border border-white/5">
                 <Layers size={14} className="text-indigo-400" />
                 <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{key}</span>
                 <div className="flex-1 h-px bg-white/5"></div>
               </div>
               {renderTree(value, [...path, key])}
             </div>
           ))}
         </div>
       );
    }
    return null;
  };

  const filteredFiles = files.filter(f => f.toLowerCase().includes(searchTermFiles.toLowerCase()));
  const selectedObject = selectedPath ? getValue(fileData, selectedPath) : null;

  // --- RENDERIZADOR DE CAMPOS ---
  const renderFieldEditor = (object) => {
    if (!object || typeof object !== 'object') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-4">
          <AlertTriangle size={48} strokeWidth={1} className="mb-4" />
          <p className="text-sm text-center">Selecione um objeto válido para editar</p>
        </div>
      );
    }
    
    return Object.entries(object).map(([key, value]) => {
      const type = typeof value;
      let inputElement;

      if (type === 'boolean') {
        inputElement = (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={!!value} 
              onChange={e => handleFieldChange(key, e.target.checked)}
              className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900 cursor-pointer transition-all" 
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
              {value ? 'Ativado' : 'Desativado'}
            </span>
          </label>
        );
      } else if (type === 'number') {
        inputElement = (
          <input 
            type="number" 
            value={value} 
            onChange={e => handleFieldChange(key, Number(e.target.value))}
            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
          />
        );
      } else if (type === 'object' && value !== null) {
        inputElement = (
          <div className="space-y-2">
            <textarea 
              rows={4} 
              value={JSON.stringify(value, null, 2)}
              onChange={e => {
                try { 
                  handleFieldChange(key, JSON.parse(e.target.value)); 
                } catch (err) {
                  // Ignora erro de parsing durante digitação
                }
              }}
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-400 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 font-mono resize-y transition-all scrollbar-thin"
              spellCheck="false" 
            />
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Braces size={12} />
              <span>Formato JSON - Edite com cuidado</span>
            </div>
          </div>
        );
      } else {
        const strVal = String(value || '');
        const rowCount = Math.min(8, Math.max(2, Math.ceil(strVal.length / 60)));
        inputElement = (
          <textarea 
            rows={rowCount} 
            value={strVal} 
            onChange={e => handleFieldChange(key, e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-y transition-all scrollbar-thin" 
            placeholder="Digite o valor..."
          />
        );
      }

      return (
        <div key={key} className="p-4 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-indigo-500"></div>
            {key}
          </label>
          {inputElement}
        </div>
      );
    });
  };

  // Estilos da scrollbar
  const scrollbarStyles = `
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
      transition: background 0.2s ease;
    }
    
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: rgba(63, 63, 70, 0.5);
    }
    
    .scrollbar-thin::-webkit-scrollbar-thumb:active {
      background: rgba(99, 102, 241, 0.5);
    }
    
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: rgba(63, 63, 70, 0.3) transparent;
    }
    
    .scrollbar-thin:hover {
      scrollbar-color: rgba(63, 63, 70, 0.5) transparent;
    }
  `;

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <style>{scrollbarStyles}</style>
      
      {/* Header - z-index: 50 */}
      <header className="relative z-50 p-3 sm:p-5 border-b border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 shrink-0 shadow-2xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-900/30 shrink-0">
              <Database size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
                <span className="truncate">Editor de Dados</span>
                <Sparkles size={14} className="sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 hidden sm:block">Gerencie os arquivos JSON do sistema</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {hasUnsavedChanges && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-bold animate-pulse">
                <AlertCircle size={14} />
                <span className="hidden md:inline">Não salvo</span>
              </div>
            )}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-white/10"
            >
              <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline font-medium">Voltar</span>
            </button>
          </div>
        </div>
        
        {/* Barra de Status */}
        {selectedFile && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-950/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/5 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 w-full sm:w-auto">
              <FileJson size={14} className="sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <span className="text-xs sm:text-sm font-mono text-zinc-300 truncate">{selectedFile}</span>
              {status.msg && (
                <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold animate-in fade-in slide-in-from-left-2 ${
                  status.type === 'error' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}>
                  {status.type === 'error' ? <AlertCircle size={10} className="sm:w-3 sm:h-3" /> : <Check size={10} className="sm:w-3 sm:h-3" />}
                  <span className="hidden sm:inline">{status.msg}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-900/30 hover:scale-105 disabled:hover:scale-100"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="sm:w-4 sm:h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save size={14} className="sm:w-4 sm:h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Container Principal - z-index: 10 */}
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Overlay - z-index: 35 */}
        {(showFilesSidebar || showStructureSidebar) && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-35 lg:hidden"
            onClick={() => {
              setShowFilesSidebar(false);
              setShowStructureSidebar(false);
            }}
          />
        )}

        {/* Sidebar Arquivos - z-index: 40 */}
        <aside className={`
          ${showFilesSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative h-[calc(100vh-theme(spacing.32))] sm:h-[calc(100vh-theme(spacing.40))] lg:h-full
          top-[8rem] sm:top-[10rem] lg:top-0 left-0
          w-72 sm:w-80 lg:w-72
          z-40 lg:z-auto
          border-r border-white/10 bg-zinc-900/98 lg:bg-zinc-900/30 backdrop-blur-xl
          flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          shadow-2xl lg:shadow-none
        `}>
          <div className="p-3 sm:p-4 border-b border-white/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Arquivos</h3>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-indigo-500/10 rounded-md text-[10px] font-bold text-indigo-400">
                  {filteredFiles.length}
                </div>
                <button
                  onClick={() => setShowFilesSidebar(false)}
                  className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
              <input 
                value={searchTermFiles}
                onChange={e => setSearchTermFiles(e.target.value)}
                placeholder="Buscar arquivos..."
                className="w-full bg-zinc-950/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
            {filteredFiles.map(file => (
              <button
                key={file}
                onClick={() => handleSelectFile(file)}
                disabled={isLoading}
                className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between group transition-all ${
                  selectedFile === file 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-900/30 scale-[1.02]' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 truncate flex-1">
                  <div className={`p-2 rounded-lg transition-colors ${
                    selectedFile === file 
                      ? 'bg-white/20' 
                      : 'bg-zinc-800/50 group-hover:bg-zinc-800'
                  }`}>
                    <FileJson size={16} className={selectedFile === file ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'} />
                  </div>
                  <span className="text-sm font-medium truncate">{file}</span>
                </div>
                {selectedFile === file && <ChevronRight size={16} className="shrink-0" />}
              </button>
            ))}
            
            {filteredFiles.length === 0 && (
              <div className="text-center text-zinc-600 text-sm py-12">
                <File size={48} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum arquivo encontrado</p>
              </div>
            )}
          </div>
        </aside>
        
        {/* Sidebar Estrutura - z-index: 40 */}
        <aside className={`
          ${showStructureSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative h-[calc(100vh-theme(spacing.32))] sm:h-[calc(100vh-theme(spacing.40))] lg:h-full
          top-[8rem] sm:top-[10rem] lg:top-0 left-0
          w-80 sm:w-96 lg:w-96
          z-40 lg:z-auto
          border-r border-white/10 bg-zinc-950/98 lg:bg-zinc-950/30 backdrop-blur-xl
          flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          shadow-2xl lg:shadow-none
        `}>
          <div className="p-3 sm:p-4 border-b border-white/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estrutura</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddItem}
                  disabled={!fileData}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100 shadow-lg shadow-indigo-900/30"
                  title="Adicionar novo item"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setShowStructureSidebar(false)}
                  className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
              <input 
                value={searchTermObjects}
                onChange={e => setSearchTermObjects(e.target.value)}
                placeholder="Buscar itens..."
                className="w-full bg-zinc-950/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                disabled={!fileData}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
            {fileData ? (
              renderTree(fileData)
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-4">
                <Folder size={64} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm text-center">Selecione um arquivo</p>
                <p className="text-xs text-zinc-700 mt-1 text-center">para visualizar a estrutura</p>
              </div>
            )}
          </div>
        </aside>

        {/* Área de Edição - z-index: 0 */}
        <main className="flex-1 flex flex-col bg-zinc-900/20 min-w-0 relative z-0">
          {selectedObject ? (
            <>
              {/* Toolbar */}
              <div className="p-3 sm:p-4 border-b border-white/5 bg-zinc-950/50 space-y-3 shrink-0">
                <Breadcrumb 
                  path={selectedPath} 
                  fileData={fileData} 
                  onNavigate={(path) => setSelectedPath(path)} 
                />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg sm:rounded-xl border border-indigo-500/30 shrink-0">
                      <Edit3 size={16} className="sm:w-[18px] sm:h-[18px] text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">{selectedObject.nome || 'Item sem nome'}</h3>
                      <p className="text-[10px] sm:text-xs text-zinc-600 mt-0.5">Editando propriedades</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDeleteItem}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm font-bold transition-all border border-red-500/20 hover:border-red-500/30 hover:scale-105"
                  >
                    <Trash2 size={16} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              {/* Campos */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-3">
                {renderFieldEditor(selectedObject)}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-6 p-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 flex items-center justify-center shadow-2xl">
                {selectedFile ? (
                  <Edit3 size={40} strokeWidth={1} className="sm:w-12 sm:h-12 text-zinc-700" />
                ) : (
                  <FileJson size={40} strokeWidth={1} className="sm:w-12 sm:h-12 text-zinc-700" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base font-medium text-zinc-500 mb-1">
                  {selectedFile ? 'Selecione um item para editar' : 'Nenhum arquivo selecionado'}
                </p>
                <p className="text-xs sm:text-sm text-zinc-700">
                  {selectedFile ? 'Clique em um item na estrutura' : 'Escolha um arquivo para começar'}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Botões Flutuantes (FAB) - z-index: 50 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 lg:hidden">
        {selectedFile && (
          <button
            onClick={() => {
              setShowStructureSidebar(!showStructureSidebar);
              setShowFilesSidebar(false);
            }}
            className={`p-4 rounded-full shadow-2xl transition-all ${
              showStructureSidebar
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 scale-110'
                : 'bg-gradient-to-br from-purple-600 to-purple-700 hover:scale-110'
            } text-white`}
          >
            <List size={24} />
          </button>
        )}
        <button
          onClick={() => {
            setShowFilesSidebar(!showFilesSidebar);
            setShowStructureSidebar(false);
          }}
          className={`p-4 rounded-full shadow-2xl transition-all ${
            showFilesSidebar
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 scale-110'
              : 'bg-gradient-to-br from-indigo-600 to-indigo-700 hover:scale-110'
          } text-white`}
        >
          <FileJson size={24} />
        </button>
      </div>
    </div>
  );
}
