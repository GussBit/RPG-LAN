import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, widthClass = 'max-w-xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widthClass} rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.65)]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="text-sm font-extrabold tracking-widest text-zinc-200 uppercase">{title}</div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
