
import React, { useState } from 'react';
import { loginWithGoogle } from '../services/firebase';
import { triggerHaptic } from '../services/smartService';
import { SonanLogo } from './Logo';

interface LoginScreenProps {
  onSkip: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSkip }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handleLogin = async () => {
    triggerHaptic('medium');
    setLoading(true);
    setErrorMsg('');
    
    try {
      await loginWithGoogle();
      // Page will redirect, keep loading state
    } catch (err: any) {
      console.error("Login Error:", err);
      setErrorMsg("Gagal mengalihkan ke Google. Cek koneksi.");
      triggerHaptic('error');
      setLoading(false);
    }
  };

  const confirmSkip = () => {
      triggerHaptic('medium');
      onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* Static Background for Performance */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[60%] bg-yellow-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        <div className="mb-8 scale-110">
           <SonanLogo className="w-64 h-auto drop-shadow-2xl" />
        </div>

        <div className="space-y-4 mb-8 w-full">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold text-sm">Data Aman & Permanen</h3>
                    <p className="text-slate-400 text-[10px] leading-tight">Riwayat orderan tersimpan di cloud (Google Account).</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="bg-green-500/20 p-3 rounded-full text-green-400 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold text-sm">Sinkronisasi Otomatis</h3>
                    <p className="text-slate-400 text-[10px] leading-tight">Ganti HP tidak masalah, data kembali otomatis.</p>
                </div>
            </div>
        </div>

        {errorMsg && (
            <div className="mb-4 bg-red-900/80 border border-red-500 text-white text-xs font-bold p-3 rounded-xl w-full text-left flex items-center gap-2 animate-shake">
                <span className="text-xl">⚠️</span> 
                <p>{errorMsg}</p>
            </div>
        )}

        <div className="w-full space-y-3">
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Menghubungkan...</span>
                    </div>
                ) : (
                    <>
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                        <span className="text-base tracking-wide">Masuk dengan Google</span>
                    </>
                )}
            </button>

            <button
                onClick={() => setShowSkipConfirm(true)}
                className="text-slate-500 text-xs font-bold hover:text-slate-300 py-3 px-4 rounded-lg w-full"
            >
                Masuk Tanpa Akun (Mode Offline)
            </button>
        </div>
        
        <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono tracking-widest opacity-50">
            SONAN v5.1 • BUATAN ANAK BANGSA
        </p>
      </div>

      {/* Confirmation Dialog */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowSkipConfirm(false)}></div>
            <div className="relative bg-slate-900 w-full max-w-xs rounded-3xl border border-slate-600 shadow-2xl p-6 animate-slide-up text-center z-[101]">
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-yellow-500/30">
                    ⚠️
                </div>
                <h3 className="text-white font-black text-xl mb-2">Yakin Tanpa Akun?</h3>
                <p className="text-slate-400 text-xs mb-6">Data hanya tersimpan di HP ini. Jika aplikasi dihapus, data hilang.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowSkipConfirm(false)} className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl border border-slate-600">Batal</button>
                    <button onClick={confirmSkip} className="flex-1 bg-yellow-500 text-slate-900 font-black py-3 rounded-xl">Lanjut</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
