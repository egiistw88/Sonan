
import React, { useState, useEffect } from 'react';
import { getAnyepSolution } from '../services/geminiService';
import { useGeolocation } from '../hooks/useGeolocation';

interface AnyepDoctorProps {
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
}

export const AnyepDoctor: React.FC<AnyepDoctorProps> = ({ onClose, userCoords }) => {
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localCoords, setLocalCoords] = useState<{lat: number; lng: number} | null>(userCoords);
  
  // Backup: If parent didn't pass coords, try to fetch locally once
  const { coords: hookCoords, getLocation } = useGeolocation();

  useEffect(() => {
    if (!userCoords && !hookCoords) {
        getLocation();
    }
  }, [userCoords, hookCoords, getLocation]);

  useEffect(() => {
    if (hookCoords) {
        setLocalCoords(hookCoords);
    }
  }, [hookCoords]);

  // Use either prop coords (preferred) or hook coords
  const activeCoords = userCoords || localCoords;

  const handleDiagnose = async () => {
    if (!activeCoords) return;
    
    setLoading(true);
    const result = await getAnyepSolution(activeCoords.lat, activeCoords.lng);
    setDiagnosis(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[70] p-6 animate-fade-in">
        <div className="bg-slate-800 w-full max-w-sm rounded-3xl border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden relative">
            
            <div className="bg-red-500 p-4 flex justify-between items-center">
                <h2 className="text-white font-black text-lg flex items-center gap-2">
                    🚑 DOKTER ANYEP
                </h2>
                <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
            </div>

            <div className="p-6 text-center">
                {!diagnosis ? (
                    <>
                        <div className="mb-6">
                            <span className="text-6xl filter drop-shadow-lg">🥶</span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Lagi Sepi Bosku?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Jangan diam saja. Biar AI analisa lokasi & jam sekarang untuk cari celah orderan.
                        </p>
                        
                        {!activeCoords && (
                            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                                <span className="text-yellow-500 text-xs font-bold">📡 Mencari Titik GPS...</span>
                            </div>
                        )}

                        <button 
                            onClick={handleDiagnose}
                            disabled={loading || !activeCoords}
                            className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                                loading || !activeCoords 
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30 active:scale-95'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    MENDIAGNOSA...
                                </>
                            ) : !activeCoords ? (
                                "TUNGGU SINYAL GPS..."
                            ) : (
                                "MINTA RESEP GACOR"
                            )}
                        </button>
                    </>
                ) : (
                    <div className="animate-slide-up">
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-3">RESEP DOKTER:</p>
                        <div className="bg-slate-900/50 border border-slate-700 p-5 rounded-xl mb-6">
                            <p className="text-lg text-white font-medium leading-relaxed">
                                "{diagnosis}"
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            SIAP LAKSANAKAN
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
