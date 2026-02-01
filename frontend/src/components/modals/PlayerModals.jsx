import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Field from '../ui/Field';
import PillButton from '../ui/PillButton';

const INITIAL_PLAYER = { playerName: '', characterName: '', photo: '', maxHp: 20 };

export default function PlayerModals({
  createOpen, onCloseCreate,
  editOpen, onCloseEdit,
  editingPlayer,
  onCreate, onEdit,
  onOpenGallery
}) {
  const [form, setForm] = useState(INITIAL_PLAYER);
  const [editForm, setEditForm] = useState(INITIAL_PLAYER);

  useEffect(() => {
    if (editingPlayer) {
      setEditForm({
        playerName: editingPlayer.playerName,
        characterName: editingPlayer.characterName,
        photo: editingPlayer.photo || '',
        maxHp: editingPlayer.maxHp
      });
    }
  }, [editingPlayer]);

  const handleCreate = (e) => {
    e.preventDefault();
    onCreate(form);
    setForm(INITIAL_PLAYER);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    onEdit(editingPlayer.id, editForm);
  };

  const renderFields = (data, setData) => (
    <div className="grid grid-cols-2 gap-3">
       <Field label="Nome"><input value={data.playerName} onChange={e => setData({...data, playerName: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
       <Field label="Personagem"><input value={data.characterName} onChange={e => setData({...data, characterName: e.target.value})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
       <Field label="Foto"><div className="flex gap-2"><input value={data.photo} onChange={e => setData({...data, photo: e.target.value})} className="flex-1 px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /><button type="button" onClick={() => onOpenGallery('images', (url) => setData({ ...data, photo: url }))} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">📁</button></div></Field>
       <Field label="HP"><input type="number" value={data.maxHp} onChange={e => setData({...data, maxHp: Number(e.target.value)})} className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-zinc-100 outline-none" /></Field>
    </div>
  );

  return (
    <>
      <Modal open={createOpen} title="Novo Jogador" onClose={onCloseCreate}>
        <form onSubmit={handleCreate} className="space-y-4">
          {renderFields(form, setForm)}
          <div className="flex justify-end gap-2"><PillButton type="submit" variant="primary">Criar</PillButton></div>
        </form>
      </Modal>
      
      <Modal open={editOpen} title="Editar Jogador" onClose={onCloseEdit}>
        <form onSubmit={handleEdit} className="space-y-4">
          {renderFields(editForm, setEditForm)}
          <div className="flex justify-end gap-2"><PillButton type="submit" variant="primary">Salvar</PillButton></div>
        </form>
      </Modal>
    </>
  );
}
