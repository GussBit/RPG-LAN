import React, { useEffect, useState } from 'react';
import MobCard from './MobCard';
import Mixer from './Mixer';
import { useGameStore } from './store';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Store
  const {
    scenes,
    activeScene,
    fetchScenes,
    isLoading,
    updateMobHp,
    deleteMob, // <--- Nova função importada
    createMob,
    setActiveScene,
    createScene,
    duplicateScene,
    renameScene,
    deleteScene,
  } = useGameStore();

  // Form de criação de mob
  const [mobForm, setMobForm] = useState({
    name: '',
    color: 'red',
    maxHp: 10,
    damageDice: '1d6',
    toHit: 0,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Cena: criar / renomear / ações
  const [sceneName, setSceneName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [busyScene, setBusyScene] = useState(false);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  // Sempre que trocar de cena ativa, atualiza o campo de renomear
  useEffect(() => {
    setRenameValue(activeScene?.name || '');
  }, [activeScene?.id]);

  const submitMob = async (e) => {
    e.preventDefault();
    if (!mobForm.name?.trim()) return;

    try {
      setIsCreating(true);
      await createMob(mobForm);
      // Reseta apenas o nome para facilitar criar vários mobs parecidos
      setMobForm({ ...mobForm, name: '' }); 
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Erro ao criar mob');
    } finally {
      setIsCreating(false);
    }
  };

  const submitScene = async (e) => {
    e.preventDefault();
    if (!sceneName.trim()) return;

    try {
      setBusyScene(true);
      await createScene({ name: sceneName.trim() });
      setSceneName('');
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Erro ao criar cena');
    } finally {
      setBusyScene(false);
    }
  };

  const handleRename = async () => {
    if (!activeScene) return;
    if (!renameValue.trim()) return;

    try {
      setBusyScene(true);
      await renameScene(activeScene.id, renameValue.trim());
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Erro ao renomear cena');
    } finally {
      setBusyScene(false);
    }
  };

  const handleDuplicate = async () => {
    if (!activeScene) return;

    try {
      setBusyScene(true);
      await duplicateScene(activeScene.id);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Erro ao duplicar cena');
    } finally {
      setBusyScene(false);
    }
  };

  const handleDelete = async () => {
    if (!activeScene) return;

    const ok = window.confirm('Excluir esta cena? (não dá pra desfazer)');
    if (!ok) return;

    try {
      setBusyScene(true);
      await deleteScene(activeScene.id);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Erro ao excluir cena');
    } finally {
      setBusyScene(false);
    }
  };

  // Loader inicial
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-indigo-500">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  // Estado vazio / erro
  if (!activeScene) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <h2 className="text-xl">Nenhuma cena encontrada</h2>
        <p className="text-sm mt-2">Verifique se o backend está rodando e se o db.json tem dados.</p>
      </div>
    );
  }

  const disableDelete = (scenes?.length ?? 0) <= 1;

  return (
    <div
      className="min-h-screen p-8 bg-zinc-950 pb-40 transition-colors duration-1000"
      style={{ backgroundColor: activeScene.background ? 'transparent' : '' }}
    >
      {/* Imagem de Fundo da Cena (Opcional) */}
      {activeScene.background && (
        <div
          className="fixed inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(http://localhost:3333${activeScene.background})` }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-3 border-l-4 border-indigo-500 pl-4 bg-zinc-900/50 p-4 rounded-r-lg backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold text-zinc-100">{activeScene.name}</h1>

            <span className="text-zinc-500 text-sm bg-zinc-800 px-2 py-1 rounded">
              Cena Atual
            </span>

            {/* Trocar Cena */}
            <div className="flex flex-col">
              <label className="text-[10px] text-zinc-500">Trocar cena</label>
              <select
                value={activeScene.id}
                onChange={(e) => setActiveScene(e.target.value)}
                className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm"
              >
                {(scenes || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Controles de Cena */}
            <div className="flex flex-wrap items-end gap-2">
              {/* Criar cena */}
              <form onSubmit={submitScene} className="flex items-end gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] text-zinc-500">Nova cena</label>
                  <input
                    value={sceneName}
                    onChange={(e) => setSceneName(e.target.value)}
                    className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm w-44"
                    placeholder="Ex: Taverna"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busyScene}
                  className="px-3 py-2 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-50"
                >
                  {busyScene ? '...' : 'Criar cena'}
                </button>
              </form>

              {/* Renomear + ações */}
              <div className="flex items-end gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] text-zinc-500">Renomear</label>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm w-44"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRename}
                  disabled={busyScene}
                  className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-bold disabled:opacity-50"
                >
                  Salvar nome
                </button>

                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={busyScene}
                  className="px-3 py-2 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm font-bold disabled:opacity-50"
                >
                  Duplicar
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busyScene || disableDelete}
                  className="px-3 py-2 rounded bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50"
                  title={disableDelete ? 'Não é possível excluir a última cena' : 'Excluir cena'}
                >
                  Excluir
                </button>
              </div>
            </div>

            {/* Formulário de criação de mob */}
            <form onSubmit={submitMob} className="ml-auto flex flex-wrap items-end gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500">Nome</label>
                <input
                  value={mobForm.name}
                  onChange={(e) => setMobForm({ ...mobForm, name: e.target.value })}
                  className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm w-44"
                  placeholder="Ex: Lobo"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500">Cor</label>
                <select
                  value={mobForm.color}
                  onChange={(e) => setMobForm({ ...mobForm, color: e.target.value })}
                  className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm"
                >
                  {['red', 'yellow', 'green', 'blue', 'orange', 'fuchsia', 'black', 'white'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500">HP</label>
                <input
                  type="number"
                  value={mobForm.maxHp}
                  onChange={(e) => setMobForm({ ...mobForm, maxHp: Number(e.target.value) })}
                  className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm w-20"
                  min={1}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500">Dano</label>
                <input
                  value={mobForm.damageDice}
                  onChange={(e) => setMobForm({ ...mobForm, damageDice: e.target.value })}
                  className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm w-24"
                  placeholder="1d6+2"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500">Acerto</label>
                <input
                  type="number"
                  value={mobForm.toHit}
                  onChange={(e) => setMobForm({ ...mobForm, toHit: Number(e.target.value) })}
                  className="px-2 py-1 rounded bg-zinc-950/60 border border-white/10 text-zinc-100 text-sm w-20"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="px-3 py-2 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm font-bold disabled:opacity-50"
              >
                {isCreating ? 'Criando...' : 'Criar mob'}
              </button>
            </form>
          </div>
        </header>

        {/* Grid de Mobs */}
        <div className="flex flex-wrap gap-6 justify-center items-start">
          {(activeScene.mobs || []).map((mob) => (
            <MobCard 
              key={mob.id} 
              mob={mob} 
              // Envia o ID da cena + ID do mob + Valor da mudança
              onUpdate={(mobId, delta) => updateMobHp(activeScene.id, mobId, delta)}
              // Envia o comando de deletar após confirmação
              onDelete={(mobId) => {
                if(window.confirm(`Tem certeza que deseja remover ${mob.name}?`)) {
                   deleteMob(activeScene.id, mobId);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Mixer com a playlist da cena */}
      <Mixer playlist={activeScene.playlist || []} />
    </div>
  );
}