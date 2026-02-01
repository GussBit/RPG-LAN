import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload as UploadIcon, Trash2, Copy, FileText, Settings, Plus, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Field from '../ui/Field';
import PillButton from '../ui/PillButton';
import { getImageUrl } from '../../constants';

export default function SceneModals({
  createOpen, onCloseCreate,
  editOpen, onCloseEdit,
  editingScene,
  onCreate, onEdit, onDuplicate, onDelete,
  onUploadBg, onOpenGallery
}) {
  // Estados de Criação
  const [sceneName, setSceneName] = useState('');
  
  // Estados de Edição
  const [activeTab, setActiveTab] = useState('general');
  const [editName, setEditName] = useState('');
  const [editBg, setEditBg] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editImages, setEditImages] = useState([]);
  
  // Estados de loading
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Sincroniza o estado local quando a cena em edição muda
  useEffect(() => {
    if (editingScene) {
      setEditName(editingScene.name);
      setEditBg(editingScene.background || '');
      setEditNotes(editingScene.notes || '');
      setEditImages(editingScene.images || []);
      setActiveTab('general');
    }
  }, [editingScene]);

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    onCreate(sceneName);
    setSceneName('');
  };

  const handleSubmitEdit = (e) => {
    if (e) e.preventDefault();
    onEdit(editingScene.id, {
      name: editName,
      background: editBg,
      notes: editNotes,
      images: editImages
    });
  };

  const handleAddImage = () => {
    onOpenGallery('images', (url) => {
      setEditImages([...editImages, url]);
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = [...editImages];
    newImages.splice(index, 1);
    setEditImages(newImages);
  };

  // Handler para duplicar com loading
  const handleDuplicate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editingScene?.id) return;
    
    try {
      setIsDuplicating(true);
      await onDuplicate(editingScene.id);
      onCloseEdit();
    } catch (error) {
      console.error('Erro ao duplicar:', error);
      // O erro já é tratado com Toast no App.jsx
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handler para excluir com loading
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editingScene?.id) return;
    
    if (!window.confirm(`Tem certeza que deseja excluir a cena "${editingScene.name}"?`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await onDelete(editingScene.id);
      onCloseEdit();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      // O erro já é tratado com Toast no App.jsx
      setIsDeleting(false); // Só reseta se der erro (se sucesso, modal fecha)
    }
  };

  return (
    <>
      {/* --- MODAL DE CRIAÇÃO --- */}
      <Modal open={createOpen} onClose={onCloseCreate} title="Nova Cena">
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <Field label="Nome da Cena">
            <input
              type="text"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none focus:border-indigo-500/50 transition-colors"
              autoFocus
              placeholder="Ex: Taverna do Dragão"
            />
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <PillButton type="button" variant="neutral" onClick={onCloseCreate}>
              Cancelar
            </PillButton>
            <PillButton type="submit" variant="primary" disabled={!sceneName.trim()}>
              Criar
            </PillButton>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DE DETALHES / EDIÇÃO --- */}
      <Modal open={editOpen} onClose={onCloseEdit} title={editingScene?.name || 'Editar Cena'} size="large">
        <form onSubmit={handleSubmitEdit} className="flex flex-col h-full">
          {/* Abas */}
          <div className="flex border-b border-white/10 gap-6 px-1">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'general' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings size={16} />
              Geral
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'notes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileText size={16} />
              Notas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'images' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ImageIcon size={16} />
              Imagens
            </button>
          </div>

          {/* Conteúdo das Abas */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
            {/* Botão invisível para permitir submit com Enter */}
            <button type="submit" className="hidden" />

            {/* ABA GERAL */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <Field label="Nome da Cena">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none focus:border-indigo-500/50"
                  />
                </Field>

                <Field label="Imagem de Fundo" description="Esta imagem será exibida no fundo da tela e no modal de Mapa.">
                  <div className="relative group aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                    {editBg ? (
                      <img src={getImageUrl(editBg)} className="w-full h-full object-cover" alt="Background" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                        Sem imagem de fundo
                      </div>
                    )}

                    {/* Overlay de troca rápida */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenGallery('images', (url) => setEditBg(url))}
                        className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white"
                        title="Escolher da Galeria"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <label className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer" title="Upload Nova">
                        <UploadIcon size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && onUploadBg(e.target.files[0], (url) => setEditBg(url))}
                        />
                      </label>
                      {editBg && (
                        <button
                          type="button"
                          onClick={() => setEditBg('')}
                          className="p-2 rounded-full bg-red-600 hover:bg-red-500 text-white"
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {/* ABA NOTAS */}
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col">
                <Field label="Notas da Cena" description="Escreva descrições, segredos, estatísticas ou lembretes sobre esta cena.">
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full flex-1 min-h-[200px] px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-300 outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed custom-scrollbar"
                    placeholder="Escreva descrições, segredos, estatísticas ou lembretes sobre esta cena..."
                  />
                </Field>
              </div>
            )}

            {/* ABA IMAGENS (HANDOUTS) */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 mb-1">Galeria da Cena</h3>
                    <p className="text-xs text-zinc-500">Imagens adicionais que podem ser compartilhadas com os jogadores</p>
                  </div>
                  <PillButton type="button" variant="primary" onClick={handleAddImage}>
                    <Plus size={16} />
                    Adicionar Imagem
                  </PillButton>
                </div>

                {editImages.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm bg-black/20 rounded-xl border border-white/5">
                    Nenhuma imagem adicional adicionada.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10">
                        <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`Handout ${idx + 1}`} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer com Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-2">
            {/* Botões de Ação à Esquerda */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isDuplicating}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Excluir Cena"
              >
                {isDeleting ? (
                  <div className="w-[18px] h-[18px] border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isDeleting || isDuplicating}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Duplicar Cena"
              >
                {isDuplicating ? (
                  <div className="w-[18px] h-[18px] border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>

            {/* Botões de Ação à Direita */}
            <div className="flex gap-2">
              <PillButton type="button" variant="neutral" onClick={onCloseEdit} disabled={isDeleting || isDuplicating}>
                Fechar
              </PillButton>
              <PillButton type="submit" variant="primary" disabled={isDeleting || isDuplicating || !editName.trim()}>
                Salvar Alterações
              </PillButton>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
