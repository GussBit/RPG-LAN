import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';

export default function EditableField({ 
  value, 
  onSave, 
  label, 
  type = 'text', 
  placeholder = '', 
  className = '',
  suffix = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== 'number') inputRef.current.select();
    }
  }, [isEditing, type]);

  const handleSave = () => {
    if (tempValue !== value) {
      // Validação básica para números
      if (type === 'number') {
        const num = parseFloat(tempValue);
        if (!isNaN(num)) onSave(num);
      } else {
        onSave(tempValue);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <div className={`relative group ${className}`}>
        {label && <span className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">{label}</span>}
        <div className="relative">
          {type === 'textarea' ? (
            <textarea
              ref={inputRef}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-800 border border-indigo-500 rounded px-2 py-1 text-white outline-none min-h-[100px] resize-y text-sm"
              placeholder={placeholder}
            />
          ) : (
            <input
              ref={inputRef}
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-800 border border-indigo-500 rounded px-2 py-1 text-white outline-none text-sm font-medium"
              placeholder={placeholder}
            />
          )}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
             <button onMouseDown={handleSave} className="text-green-500 hover:text-green-400"><Check size={14}/></button>
             <button onMouseDown={handleCancel} className="text-red-500 hover:text-red-400"><X size={14}/></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative cursor-pointer hover:bg-white/5 rounded px-2 py-1 transition-colors border border-transparent hover:border-white/10 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {label && <span className="block text-[10px] uppercase text-zinc-500 font-bold mb-0.5">{label}</span>}
      <div className="flex items-center justify-between gap-2">
        <span className={`truncate ${!value ? 'text-zinc-600 italic' : 'text-zinc-200'}`}>
          {value || placeholder || '-'} {value && suffix}
        </span>
        <Pencil size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
