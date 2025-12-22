import React, { useRef, useState } from 'react';
import { Transaction, DailyTargets } from '../types';

interface SettingsModalProps {
  transactions: Transaction[];
  targets: DailyTargets;
  onImport: (tx: Transaction[], tg: DailyTargets) => void;
  onReset: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  transactions, 
  targets, 
  onImport, 
  onReset,
  onClose 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      targets,
      transactions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Sonan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMsg('✅ Data berhasil didownload!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions && Array.isArray(json.transactions)) {
           if (window.confirm(`Timpa data saat ini dengan backup dari ${new Date(json.exportedAt).toLocaleDateString()}?`)) {
              onImport(json.transactions, json.targets || targets);
              setMsg('✅ Data berhasil dipulihkan!');
              setTimeout(() => {
                  setMsg('');
                  onClose();
              }, 1500);
           }
        } else {
            alert("Format file tidak valid!");
        }
      } catch (err) {
        alert("Gagal membaca file backup.");
      }
    };
    reader.readAsText(file);
  };

  const handleHardReset = () => {
      const confirmText = "HAPUS SEMUA";
      const input = prompt(`Ketik "${confirmText}" untuk menghapus seluruh data aplikasi secara permanen.`);
      if (input === confirmText) {
          onReset();
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-bold text-lg">⚙️ Pengaturan & Data</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-6">
            
            {msg && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm text-center font-bold border border-green-500/30">
                    {msg}
                </div>
            )}

            {/* Backup Section */}
            <div>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-3">Backup Data (Penting!)</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 border border-blue-500/50 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="text-xs font-bold">Simpan Data</span>
                    </button>

                    <button 
                        onClick={handleImportClick}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-4 rounded-xl flex flex-col items-center gap-2 border border-slate-600 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-xs font-bold">Restore Data</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    *Simpan file .json ke Google Drive atau WhatsApp agar aman jika HP hilang/rusak.
                </p>
            </div>

            <hr className="border-slate-800" />

            {/* Danger Zone */}
            <div>
                <h4 className="text-red-500/70 text-xs font-bold uppercase mb-3">Zona Bahaya</h4>
                <button 
                    onClick={handleHardReset}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-xl border border-red-500/20 text-sm font-bold flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Reset Aplikasi ke Awal
                </button>
            </div>

            <div className="text-center pt-2">
                <p className="text-[10px] text-slate-600">Versi 1.3.0 (Build Stability)</p>
            </div>
        </div>
      </div>
    </div>
  );
};