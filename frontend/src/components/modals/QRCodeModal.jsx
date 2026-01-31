import React from 'react';
import Modal from '../ui/Modal';

export default function QRCodeModal({ open, onClose, url, title }) {
  if (!url) return null;
  
  // Usa uma API pública para gerar o QR Code sem dependências extras
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  return (
    <Modal open={open} onClose={onClose} title={title || "QR Code"}>
      <div className="flex flex-col items-center justify-center p-6 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-xl">
            <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
        </div>
        <div className="text-center space-y-2">
            <p className="text-sm text-zinc-400">Escaneie para acessar a ficha</p>
            <p className="text-[10px] text-zinc-600 font-mono bg-black/30 p-2 rounded break-all max-w-xs mx-auto">{url}</p>
        </div>
      </div>
    </Modal>
  );
}
