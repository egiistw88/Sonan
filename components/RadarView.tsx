import React, { useState, useEffect } from 'react';
import { GacorSpot, Transaction, TransactionType } from '../types';
import { findGacorSpots } from '../services/geminiService';
import { useGeolocation } from '../hooks/useGeolocation';

interface RadarViewProps {
  transactions: Transaction[];
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d;
};

export const RadarView: React.FC<RadarViewProps> = ({ transactions }) => {
  const { coords, loading: gpsLoading, getLocation } = useGeolocation();
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'AI'>('HISTORY');
  
  const [aiSpots, setAiSpots] = useState<GacorSpot[]>([]);
  const [historySpots, setHistorySpots] = useState<GacorSpot[]>([]);
  
  const [scanning, setScanning] = useState(false);
  const [analyzingHistory, setAnalyzingHistory] = useState(false);

  useEffect(() => {
    if (coords && transactions.length > 0) {
      analyzeHistory();
    }
  }, [coords, transactions]);

  useEffect(() => {
    if (!coords && !gpsLoading) {
        getLocation();
    }
  }, []);

  const analyzeHistory = () => {
    setAnalyzingHistory(true);
    const now = new Date();
    const currentHour = now.getHours();
    
    const relevantTx = transactions.filter(tx => {
        if (tx.type !== TransactionType.INCOME || !tx.coords) return false;
        const txDate = new Date(tx.timestamp);
        const txHour = txDate.getHours();
        return Math.abs(txHour - currentHour) <= 2;
    });

    const spots: GacorSpot[] = relevantTx.reverse().slice(0, 5).map(tx => {
        let distStr = 'Jauh';
        if (coords && tx.coords) {
            const d = calculateDistance(coords.lat, coords.lng, tx.coords.lat, tx.coords.lng);
            distStr = d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
        }

        return {
            name: tx.description,
            type: 'LANGGANAN',
            reason: `Pernah dapat order jam segini`,
            distance: distStr,
            coords: tx.coords,
            priority: 'TINGGI',
            source: 'HISTORY'
        };
    });

    setHistorySpots(spots);
    setAnalyzingHistory(false);
    
    if (spots.length === 0) {
        setActiveTab('AI');
    }
  };

  const handleScanAI = async () => {
    if (!coords) {
        getLocation();
        return;
    }
    setScanning(true);
    await new Promise(r => setTimeout(r, 1500));
    const results = await findGacorSpots(coords.lat, coords.lng);
    setAiSpots(results);
    setScanning(false);
  };

  const openRoute = (spot: GacorSpot) => {
    if (spot.coords) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.coords.lat},${spot.coords.lng}`, '_blank');
    } else {
        const query = encodeURIComponent(spot.name);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const currentSpots = activeTab === 'HISTORY' ? historySpots : aiSpots;
  const mainColor = activeTab === 'HISTORY' ? 'yellow' : 'cyan';

  return (
    <div className="min-h-screen bg-slate-900 pb-28 animate-fade-in flex flex-col">
       {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 pt-safe pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-3 tracking-wide">
                <span className={`text-${mainColor}-400 animate-pulse`}>📡</span> RADAR GACOR
            </h1>
         </div>

         {/* Segmented Control */}
         <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
             <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Riwayat Saya
             </button>
             <button 
                onClick={() => setActiveTab('AI')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'AI' ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Saran Senior (AI)
             </button>
         </div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center w-full max-w-lg mx-auto">
        
        {/* Radar Animation Area */}
        <div className="relative w-72 h-72 my-8 flex items-center justify-center">
            {/* Pulsing Rings */}
            <div className={`absolute w-full h-full border-2 rounded-full opacity-20 ${activeTab === 'HISTORY' ? 'border-yellow-500' : 'border-cyan-500'} animate-ping`}></div>
            <div className={`absolute w-3/4 h-3/4 border border-dashed rounded-full opacity-40 ${activeTab === 'HISTORY' ? 'border-yellow-500' : 'border-cyan-500'}`}></div>
            <div className={`absolute w-1/2 h-1/2 border rounded-full opacity-60 ${activeTab === 'HISTORY' ? 'border-yellow-500' : 'border-cyan-500'}`}></div>
            
            {/* Scanning Sweeper */}
            {(scanning || analyzingHistory) && (
                <div className={`absolute w-full h-full rounded-full animate-spin-slow bg-gradient-to-t border-t-2 ${activeTab === 'HISTORY' ? 'from-yellow-500/10 border-yellow-400' : 'from-cyan-500/10 border-cyan-400'} to-transparent`}></div>
            )}

            {/* Center User Dot */}
            <div className="relative z-10 bg-slate-900 p-2 rounded-full border-4 border-slate-800 shadow-2xl">
                 <div className={`w-4 h-4 rounded-full ${activeTab === 'HISTORY' ? 'bg-yellow-400' : 'bg-cyan-400'} shadow-[0_0_20px_currentColor]`}></div>
            </div>
        </div>

        {/* Status Text / Button */}
        <div className="text-center mb-8 w-full px-6">
            {!coords ? (
                <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 text-xs font-bold animate-pulse">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Menunggu Sinyal GPS...
                </div>
            ) : activeTab === 'AI' && !scanning && aiSpots.length === 0 ? (
                <button 
                    onClick={handleScanAI}
                    className="group relative bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-black py-4 px-10 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-95 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        SCAN AREA SEKARANG
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            ) : activeTab === 'HISTORY' && historySpots.length === 0 && !analyzingHistory ? (
                 <div className="flex flex-col items-center">
                    <p className="text-slate-500 text-sm font-medium mb-3">Tidak ada riwayat gacor di jam segini.</p>
                    <button 
                        onClick={() => setActiveTab('AI')}
                        className="text-cyan-400 text-xs font-bold border-b border-cyan-400/30 hover:text-cyan-300 pb-0.5"
                    >
                        Beralih ke Mode AI Senior &rarr;
                    </button>
                 </div>
            ) : (scanning || analyzingHistory) ? (
                <p className={`text-sm font-bold animate-pulse ${activeTab === 'HISTORY' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    {activeTab === 'HISTORY' ? 'Membuka Catatan Lama...' : 'Menghubungkan ke Satelit...'}
                </p>
            ) : null}
        </div>

        {/* Results List */}
        <div className="w-full space-y-3">
            {currentSpots.map((spot, idx) => (
                <div 
                    key={idx} 
                    className={`bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border relative overflow-hidden group animate-slide-up transition-all active:scale-[0.98] ${
                        activeTab === 'HISTORY' 
                        ? 'border-yellow-500/20 hover:border-yellow-500/50' 
                        : 'border-cyan-500/20 hover:border-cyan-500/50'
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                {spot.source === 'HISTORY' ? (
                                    <span className="bg-yellow-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                        LANGGANAN
                                    </span>
                                ) : (
                                    <span className="bg-cyan-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                        REKOMENDASI AI
                                    </span>
                                )}
                                <span className="text-[9px] text-slate-400 font-bold tracking-wider border border-slate-700 px-1.5 py-0.5 rounded">
                                    {spot.type}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight mb-1">{spot.name}</h3>
                            <p className="text-xs text-slate-400 leading-snug">"{spot.reason}"</p>
                        </div>
                        <div className="text-right shrink-0 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-0.5">Jarak</p>
                            <p className={`text-sm font-mono font-black ${activeTab === 'HISTORY' ? 'text-yellow-400' : 'text-cyan-400'}`}>{spot.distance}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => openRoute(spot)}
                        className={`mt-4 w-full text-slate-900 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 shadow-lg ${
                            activeTab === 'HISTORY'
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-yellow-500/20'
                            : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-cyan-500/20'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        GAS KE TITIK INI
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};