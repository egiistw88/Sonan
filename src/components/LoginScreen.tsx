
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
      // App.tsx will auto-detect user change and redirect
      triggerHaptic('success');
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = "Gagal terhubung ke Google.";
      
      if (err.code === 'auth/popup-closed-by-user') msg = "Login dibatalkan (Popup ditutup).";
      else if (err.code === 'auth/network-request-failed') msg = "Koneksi internet bermasalah. Cek sinyal.";
      else if (err.code === 'auth/unauthorized-domain') msg = "Domain aplikasi belum diizinkan.";
      else if (err?.message) msg = err.message;

      setErrorMsg(msg);
      triggerHaptic('error');
      setLoading(false);
    }
  };

  const handleSkipClick = () => {
    triggerHaptic('light');
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
      triggerHaptic('medium');
      onSkip();
  };

  return (
    <div className="fixed inset-0 z-[50] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[60%] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        {/* Logo Section */}
        <div className="mb-8 animate-fade-in scale-110">
           <SonanLogo className="w-64 h-auto drop-shadow-2xl" />
        </div>

        {/* Value Props */}
        <div className="space-y-4 mb-8 w-full animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold text-sm">Data Aman & Permanen</h3>
                    <p className="text-slate-400 text-[10px] leading-tight">Ganti HP? Tenang, riwayat orderan & settingan balik lagi otomatis.</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className="bg-green-500/20 p-3 rounded-full text-green-400 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold text-sm">Sinkronisasi Otomatis</h3>
                    <p className="text-slate-400 text-[10px] leading-tight">Catat di satu HP, muncul di semua perangkat Anda secara realtime.</p>
                </div>
            </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
            <div className="mb-4 bg-red-900/80 border border-red-500 text-white text-xs font-bold p-3 rounded-xl w-full text-left flex items-center gap-2 animate-shake shadow-lg">
                <span className="text-xl">⚠️</span> 
                <div>
                    <p>{errorMsg}</p>
                    {errorMsg.includes("cancelled") && <p className="text-[10px] font-normal mt-1 opacity-80">Pastikan tidak menutup popup login.</p>}
                </div>
            </div>
        )}

        {/* Main Action */}
        <div className="w-full space-y-3 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-black py-4 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                        <span className="text-base tracking-wide">Masuk dengan Google</span>
                    </>
                )}
            </button>

            <button
                onClick={handleSkipClick}
                className="text-slate-500 text-xs font-bold hover:text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-900/50 transition-all w-full"
            >
                Masuk Tanpa Akun (Mode Offline)
            </button>
        </div>
        
        <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono tracking-widest opacity-50">
            SONAN v5.0 • BUATAN ANAK BANGSA
        </p>
      </div>

      {/* --- CUSTOM CONFIRMATION DIALOG (Fixed Z-Index & Opacity) --- */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Solid Dark Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowSkipConfirm(false)}
            ></div>
            
            {/* Modal Card - Fully Opaque Background */}
            <div className="relative bg-slate-900 w-full max-w-xs rounded-3xl border border-slate-600 shadow-2xl p-6 animate-slide-up text-center z-[101]">
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-yellow-500/30">
                    ⚠️
                </div>
                
                <h3 className="text-white font-black text-xl mb-2">Yakin Tanpa Akun?</h3>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                    <p className="text-slate-300 text-xs leading-relaxed">
                        Data orderan hanya tersimpan di HP ini. Jika ganti HP atau hapus cache, <span className="text-red-400 font-bold">data akan hilang permanen.</span>
                    </p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => { triggerHaptic('light'); setShowSkipConfirm(false); }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-600 transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={confirmSkip}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
                    >
                        Lanjut Saja
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
