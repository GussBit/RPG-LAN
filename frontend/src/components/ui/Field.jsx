import React from 'react';

export default function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}
