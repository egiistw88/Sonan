
import React, { useRef, useState } from 'react';
import { Transaction, DailyTargets } from '../types';
import { triggerHaptic } from '../services/smartService';
import { useAppStore } from '../context/GlobalState';
import { loginWithGoogle, logoutUser } from '../services/firebase';

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
  const { state } = useAppStore();
  const { user, isSyncing } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
      triggerHaptic('medium');
      try {
          await loginWithGoogle();
          setMsg('✅ Berhasil Masuk!');
          triggerHaptic('success');
      } catch (error) {
          setMsg('❌ Gagal Login');
          triggerHaptic('error');
      }
  };

  const handleLogout = async () => {
      triggerHaptic('medium');
      if (window.confirm("Keluar akun? Data lokal akan tetap ada.")) {
        await logoutUser();
        setMsg('👋 Sampai Jumpa');
      }
  };

  const handleExport = () => {
    triggerHaptic('medium');
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
    triggerHaptic('success');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleImportClick = () => {
    triggerHaptic('light');
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
           triggerHaptic('medium');
           if (window.confirm(`Timpa data saat ini dengan backup dari ${new Date(json.exportedAt).toLocaleDateString()}?`)) {
              onImport(json.transactions, json.targets || targets);
              setMsg('✅ Data berhasil dipulihkan!');
              triggerHaptic('success');
              setTimeout(() => {
                  setMsg('');
                  onClose();
              }, 1500);
           }
        } else {
            triggerHaptic('error');
            alert("Format file tidak valid!");
        }
      } catch (err) {
        triggerHaptic('error');
        alert("Gagal membaca file backup.");
      }
    };
    reader.readAsText(file);
  };

  const handleHardReset = () => {
      triggerHaptic('heavy');
      const confirmText = "HAPUS SEMUA";
      const input = prompt(`Ketik "${confirmText}" untuk menghapus seluruh data aplikasi secara permanen.`);
      if (input === confirmText) {
          triggerHaptic('error'); 
          onReset();
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-white font-bold text-lg">⚙️ Pengaturan & Data</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-6">
            
            {msg && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm text-center font-bold border border-green-500/30">
                    {msg}
                </div>
            )}

            {/* SYNC SECTION (NEW) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-yellow-500 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                    ☁️ Cloud Sync (Lintas HP)
                </h4>
                
                {user ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-slate-600" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">👤</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{user.displayName || "Pengguna"}</p>
                                <p className="text-slate-500 text-xs truncate">{user.email}</p>
                            </div>
                            {isSyncing && <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-bold border border-slate-700"
                        >
                            Keluar Akun
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                            Masuk agar data orderan tersimpan di cloud. Aman saat ganti HP atau pakai 2 HP sekaligus.
                        </p>
                        <button 
                            onClick={handleLogin}
                            className="w-full bg-white hover:bg-gray-100 text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Masuk dengan Google
                        </button>
                    </div>
                )}
            </div>

            {/* Backup Section (Manual) */}
            <div>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-3">Backup Manual (File)</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 border border-blue-500/50 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="text-xs font-bold">Simpan File</span>
                    </button>

                    <button 
                        onClick={handleImportClick}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-4 rounded-xl flex flex-col items-center gap-2 border border-slate-600 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-xs font-bold">Restore File</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
            </div>

            <hr className="border-slate-800" />

            {/* Danger Zone */}
            <div>
                <h4 className="text-red-500/70 text-xs font-bold uppercase mb-3">Zona Bahaya</h4>
                <button 
                    onClick={handleHardReset}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-xl border border-red-500/20 text-sm font-bold flex items-center justify-center gap-2"
                >
                    Reset Aplikasi ke Awal
                </button>
            </div>

            <div className="text-center pt-2">
                <p className="text-[10px] text-slate-600">Versi 1.4.0 (Cloud Sync Enabled)</p>
            </div>
        </div>
      </div>
    </div>
  );
};
