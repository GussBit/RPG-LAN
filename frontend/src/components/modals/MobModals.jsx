import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Field from '../ui/Field';
import PillButton from '../ui/PillButton';

const INITIAL_MOB = { name: '', color: 'red', maxHp: 10, damageDice: '1d6', toHit: 0, image: '' };

export default function MobModals({
  createOpen, onCloseCreate,
  editOpen, onCloseEdit,
  editingMob,
  onCreate, onEdit,
  onOpenGallery, onOpenPresets, onSavePreset
}) {
  const [form, setForm] = useState(INITIAL_MOB);
  const [editForm, setEditForm] = useState(INITIAL_MOB);

  useEffect(() => {
    if (editingMob) {
      setEditForm({
        name: editingMob.name,
        color: editingMob.color,
        maxHp: editingMob.maxHp,
        damageDice: editingMob.damageDice,
        toHit: editingMob.toHit,
        image: editingMob.image || ''
      });
    }
  }, [editingMob]);

  const handleCreate = (e) => {
    e.preventDefault();
    onCreate(form);
    setForm(INITIAL_MOB);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    onEdit(editingMob.id, editForm);
  };

  // Renderiza os campos comuns para evitar duplicação
  const renderFields = (data, setData) => (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Nome">
        <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" autoFocus />
      </Field>
      <Field label="Cor">
        <select value={data.color} onChange={e => setData({...data, color: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none">
          {['red', 'yellow', 'green', 'blue', 'orange', 'fuchsia', 'black', 'white'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="HP">
        <input type="number" value={data.maxHp} onChange={e => setData({...data, maxHp: Number(e.target.value)})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" />
      </Field>
      <Field label="Dano">
        <input value={data.damageDice} onChange={e => setData({...data, damageDice: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" />
      </Field>
      <Field label="Imagem">
        <div className="flex gap-2">
          <input value={data.image} onChange={e => setData({...data, image: e.target.value})} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" placeholder="URL ou..." />
          <button type="button" onClick={() => onOpenGallery('images', (url) => setData({...data, image: url}))} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button>
        </div>
      </Field>
    </div>
  );

  return (
    <>
      <Modal open={createOpen} title="Novo mob" onClose={onCloseCreate}>
        <form onSubmit={handleCreate} className="space-y-4">
          {renderFields(form, setForm)}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onSavePreset(form)} className="px-3 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-sm transition-colors">Salvar Preset</button>
            <button type="button" onClick={() => onOpenPresets((p) => setForm({ ...form, ...p }))} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm hover:bg-white/10">📋 Carregar</button>
            <PillButton type="submit" variant="primary">Criar</PillButton>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Editar mob" onClose={onCloseEdit}>
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
