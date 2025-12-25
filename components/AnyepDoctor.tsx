
import React, { useState, useEffect } from 'react';
import { getAnyepDiagnosis, triggerHaptic } from '../services/smartService';
import { useGeolocation } from '../hooks/useGeolocation';

interface AnyepDoctorProps {
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
}

export const AnyepDoctor: React.FC<AnyepDoctorProps> = ({ onClose, userCoords }) => {
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localCoords, setLocalCoords] = useState<{lat: number; lng: number} | null>(userCoords);
  
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

  const activeCoords = userCoords || localCoords;

  const handleDiagnose = async () => {
    triggerHaptic('medium');
    if (!activeCoords) {
        setLoading(true);
        const result = await getAnyepDiagnosis(0, 0); 
        setDiagnosis(result);
        setLoading(false);
        triggerHaptic('success');
        return;
    }
    
    setLoading(true);
    const result = await getAnyepDiagnosis(activeCoords.lat, activeCoords.lng);
    setDiagnosis(result);
    setLoading(false);
    triggerHaptic('success');
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
                            Sistem akan mengecek Jam & Hari ini dengan 'Buku Saku' untuk mencari celah orderan.
                        </p>
                        
                        <button 
                            onClick={handleDiagnose}
                            disabled={loading}
                            className="w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-red-500/30 active:scale-95"
                        >
                            {loading ? "MENDIAGNOSA..." : "MINTA RESEP GACOR"}
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
                            onClick={() => { triggerHaptic('light'); onClose(); }}
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
