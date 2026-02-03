import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Field from '../ui/Field';
import PillButton from '../ui/PillButton';
import { Loader, Ship } from 'lucide-react';

const INITIAL_SHIP = { name: '', type: 'mob', color: 'green', maxHp: 100, maxMorale: 10, image: '' };

export default function ShipModals({
  createOpen, onCloseCreate,
  editOpen, onCloseEdit,
  editingShip,
  onCreate, onEdit,
  onOpenGallery, onOpenPresets
}) {
  const [form, setForm] = useState(INITIAL_SHIP);
  const [editForm, setEditForm] = useState(INITIAL_SHIP);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (editingShip) {
      setEditForm({
        name: editingShip.name,
        type: editingShip.type || 'mob',
        color: editingShip.color || 'green',
        maxHp: editingShip.maxHp,
        maxMorale: editingShip.maxMorale,
        image: editingShip.image || ''
      });
    }
  }, [editingShip]);

  // Reset loading state when image URL changes
  useEffect(() => {
    setImageLoading(true);
  }, [form.image, editForm.image]);

  const handleCreate = (e) => {
    e.preventDefault();
    onCreate(form);
    setForm(INITIAL_SHIP);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    onEdit(editingShip.id, editForm);
  };

  const renderFields = (data, setData) => (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Nome do Navio">
        <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" autoFocus />
      </Field>
      <Field label="Tipo">
        <select value={data.type} onChange={e => setData({...data, type: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none">
          <option value="mob">Inimigo (Mob)</option>
          <option value="player">Jogador (Aliado)</option>
        </select>
      </Field>
      <Field label="Cor">
        <select value={data.color} onChange={e => setData({...data, color: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none">
          {['red', 'yellow', 'green', 'blue', 'orange', 'purple', 'cyan', 'white'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Casco (PV)">
        <input type="number" value={data.maxHp} onChange={e => setData({...data, maxHp: Number(e.target.value)})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" />
      </Field>
      <Field label="Moral (PM)">
        <input type="number" value={data.maxMorale} onChange={e => setData({...data, maxMorale: Number(e.target.value)})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" />
      </Field>
      <Field label="Imagem" className="col-span-2">
        <div className="flex gap-2 mb-3">
          <input value={data.image} onChange={e => setData({...data, image: e.target.value})} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" placeholder="URL ou..." />
          <button type="button" onClick={() => onOpenGallery('images', (url) => setData({...data, image: url}))} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button>
        </div>
        
        {/* Preview da Imagem */}
        {data.image && (
          <div className="relative w-full h-40 bg-black/40 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <Loader className="w-6 h-6 text-zinc-500 animate-spin" />
              </div>
            )}
            <img 
              src={data.image} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onLoad={() => setImageLoading(false)}
              onError={(e) => { e.target.style.display = 'none'; setImageLoading(false); }}
            />
            {/* Fallback visual se a imagem falhar (controlado pelo display:none acima) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 -z-10">
               <Ship size={32} />
               <span className="text-xs mt-2">Imagem indisponível</span>
            </div>
          </div>
        )}
      </Field>
    </div>
  );

  return (
    <>
      <Modal open={createOpen} title="Novo Navio" onClose={onCloseCreate}>
        <form onSubmit={handleCreate} className="space-y-4">
          {renderFields(form, setForm)}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenPresets((p) => setForm({ ...form, ...p }))} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm hover:bg-white/10">📋 Carregar Preset</button>
            <PillButton type="submit" variant="primary">Criar</PillButton>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Editar Navio" onClose={onCloseEdit}>
        <form onSubmit={handleEdit} className="space-y-4">
          {renderFields(editForm, setEditForm)}
          <div className="flex justify-end gap-2">
            <PillButton type="submit" variant="primary">Salvar</PillButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
