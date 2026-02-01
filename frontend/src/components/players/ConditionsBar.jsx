import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CONDITIONS } from '../../constants';

export default function ConditionsBar({ conditions = [], onToggle, direction = 'down' }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative mt-2">
      <div className="flex gap-1 flex-wrap min-h-[20px]">
        {CONDITIONS.filter(c => conditions.includes(c.id)).map(condition => {
          const Icon = condition.icon;
          return (
            <button
              key={condition.id}
              onClick={(e) => { e.stopPropagation(); onToggle(condition.id); }}
              className={`${condition.color} p-1 hover:bg-white/10 rounded transition z-30`}
              title={condition.label}
            >
              <Icon size={14} />
            </button>
          );
        })}
        
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded transition z-30"
          title="Adicionar condição"
        >
          <Plus size={14} />
        </button>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          
          {/* Lógica de Direção aqui */}
          <div className={`
            absolute z-50 left-0 bg-zinc-900 border border-white/10 rounded-lg shadow-xl p-2 min-w-[180px] max-h-[300px] overflow-y-auto
            ${direction === 'up' ? 'bottom-full mb-1' : 'mt-1 top-full'}
          `}>
            {CONDITIONS.map(condition => {
              const Icon = condition.icon;
              const isActive = conditions.includes(condition.id);
              return (
                <button
                  key={condition.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(condition.id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-white/5 transition ${isActive ? 'bg-white/10' : ''}`}
                >
                  <Icon size={14} className={condition.color} />
                  <span className="text-zinc-300">{condition.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}