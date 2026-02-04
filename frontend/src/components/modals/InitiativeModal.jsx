import React, { useState } from 'react';
import { Dices } from 'lucide-react';

export default function InitiativeModal({ open, onConfirm }) {
  const [value, setValue] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value) onConfirm(parseInt(value));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-indigo-500/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-indigo-900/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <Dices className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Rolar Iniciativa!</h2>
          <p className="text-zinc-400 text-sm mt-1">O combate começou. Role 1d20 + Des.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-black/50 border-2 border-zinc-700 focus:border-indigo-500 rounded-xl px-4 py-4 text-3xl text-center font-bold text-white outline-none transition-colors"
            placeholder="0"
          />
          
          <button
            type="submit"
            disabled={!value}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95"
          >
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
}
