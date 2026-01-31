import React from 'react';

export default function PillButton({
  children, onClick, type = 'button', disabled, variant = 'neutral', className = '', title,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ' +
    'transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ' +
    'border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]';

  const variants = {
    neutral: 'bg-white/5 hover:bg-white/10 text-zinc-200',
    primary: 'bg-indigo-500/15 hover:bg-indigo-500/20 text-indigo-200 border-indigo-400/20',
    success: 'bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-200 border-emerald-400/20',
    danger: 'bg-red-500/15 hover:bg-red-500/20 text-red-200 border-red-400/20',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`} title={title}>
      {children}
    </button>
  );
}
