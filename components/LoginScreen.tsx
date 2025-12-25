
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

  const handleLogin = async () => {
    triggerHaptic('medium');
    setLoading(true);
    setErrorMsg('');
    
    try {
      await loginWithGoogle();
      // App.tsx will auto-detect user change and redirect
      triggerHaptic('success');
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = "Gagal terhubung ke Google.";
      
      if (err.code === 'auth/popup-closed-by-user') msg = "Login dibatalkan.";
      else if (err.code === 'auth/network-request-failed') msg = "Koneksi internet bermasalah.";
      else if (err.code === 'auth/unauthorized-domain') msg = "Domain ini belum diizinkan di Firebase Console.";
      else if (err?.message) msg = err.message;

      setErrorMsg(msg);
      triggerHaptic('error');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    if (window.confirm("Yakin masuk tanpa akun? Data tidak akan tersimpan di Cloud (hanya di HP ini).")) {
        onSkip();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[60%] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        {/* Logo Section */}
        <div className="mb-10 animate-fade-in scale-110">
           <SonanLogo className="w-64 h-auto drop-shadow-2xl" />
        </div>

        {/* Value Props */}
        <div className="space-y-6 mb-12 w-full animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold">Data Aman & Permanen</h3>
                    <p className="text-slate-400 text-xs">Ganti HP? Tenang, riwayat orderan & settingan balik lagi otomatis.</p>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold">Sinkronisasi Otomatis</h3>
                    <p className="text-slate-400 text-xs">Catat di satu HP, muncul di semua perangkat Anda secara realtime.</p>
                </div>
            </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg w-full text-left animate-shake">
                ⚠️ {errorMsg}
            </div>
        )}

        {/* Main Action */}
        <div className="w-full space-y-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                        <span className="text-lg">Masuk dengan Google</span>
                    </>
                )}
            </button>

            <button
                onClick={handleSkip}
                className="text-slate-500 text-xs font-bold hover:text-slate-300 py-2 transition-colors"
            >
                Masuk Tanpa Akun (Mode Offline)
            </button>
        </div>
        
        <p className="absolute bottom-6 text-[10px] text-slate-600 animate-pulse">
            Sobat Jalanan v5.0 - Dibuat untuk Pejuang Keluarga
        </p>
      </div>
    </div>
  );
};
