
import React, { useState, useEffect, useRef } from 'react';
import { GacorSpot, Transaction, TransactionType } from '../types';
import { findSmartSpots, triggerHaptic } from '../services/smartService';
import { useGeolocation } from '../hooks/useGeolocation';

interface RadarViewProps {
  transactions: Transaction[];
}

declare const L: any; // Leaflet global type definition for this environment

export const RadarView: React.FC<RadarViewProps> = ({ transactions }) => {
  const { coords, loading: gpsLoading, error: gpsError, getLocation } = useGeolocation();
  const [activeMode, setActiveMode] = useState<'AI' | 'HISTORY'>('AI');
  
  const [spots, setSpots] = useState<GacorSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<GacorSpot | null>(null);
  
  const mapRef = useRef<any>(null); // Map instance
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]); // Array of current markers

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (Bandung) if no coords yet, will fly to user later
    const initialLat = -6.9175;
    const initialLng = 107.6191;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([initialLat, initialLng], 13);

    // Dark Matter Tile Layer (CartoDB) - Looks very "app-like"
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  // 2. Fetch Data Logic
  useEffect(() => {
    if (!coords) {
        getLocation();
        return;
    }

    // Fly to user location once found
    if (mapRef.current) {
        mapRef.current.setView([coords.lat, coords.lng], 14);
        renderUserMarker(coords.lat, coords.lng);
    }

    fetchSpots();
  }, [coords, activeMode, transactions]);

  // 3. Render Spots on Map
  useEffect(() => {
     renderSpotMarkers();
  }, [spots]);

  const fetchSpots = async () => {
      if (!coords) return;

      let results: GacorSpot[] = [];

      if (activeMode === 'AI') {
          // Get from Database logic
          results = await findSmartSpots(coords.lat, coords.lng);
      } else {
          // Get from History logic
          const now = new Date();
          const currentHour = now.getHours();
          
          const relevantTx = transactions.filter(tx => {
            if (tx.type !== TransactionType.INCOME || !tx.coords) return false;
            const txDate = new Date(tx.timestamp);
            const txHour = txDate.getHours();
            return Math.abs(txHour - currentHour) <= 3; // Window +/- 3 jam
          });

          // Deduplicate roughly by name/location
          const uniqueTx = relevantTx.slice(0, 15); // Limit 15

          results = uniqueTx.map(tx => ({
              name: tx.description,
              type: 'LANGGANAN',
              reason: `Riwayat order jam segini`,
              distance: '0km', // Will be calculated if needed
              distanceValue: 0,
              coords: tx.coords,
              priority: 'TINGGI',
              source: 'HISTORY'
          }));
      }
      setSpots(results);
  };

  const renderUserMarker = (lat: number, lng: number) => {
      if (!mapRef.current) return;

      // Custom Pulse Icon for User
      const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div class="relative w-6 h-6">
                    <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    <div class="absolute inset-0 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
      });

      // Clear existing user marker if tracked differently, 
      // but for simple implementation we usually just add it once or update it.
      // Here we assume simple one-time add for demo.
      L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
  };

  const renderSpotMarkers = () => {
      if (!mapRef.current) return;

      // Clear old markers
      markersRef.current.forEach(m => mapRef.current.removeLayer(m));
      markersRef.current = [];

      spots.forEach(spot => {
          if (!spot.coords) return;

          const color = spot.source === 'HISTORY' ? 'text-yellow-400' : 'text-cyan-400';
          const iconHtml = `<div class="custom-marker-pin ${color}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 drop-shadow-md transform transition-transform hover:-translate-y-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                                </svg>
                            </div>`;

          const icon = L.divIcon({
              className: 'bg-transparent border-none',
              html: iconHtml,
              iconSize: [32, 32],
              iconAnchor: [16, 32]
          });

          const marker = L.marker([spot.coords.lat, spot.coords.lng], { icon })
            .addTo(mapRef.current)
            .on('click', () => {
                triggerHaptic('light');
                setSelectedSpot(spot);
                // Center map on click slightly offset to show bottom sheet
                mapRef.current.flyTo([spot.coords!.lat - 0.002, spot.coords!.lng], 15, { duration: 0.5 });
            });
          
          markersRef.current.push(marker);
      });
  };

  const handleNavigate = () => {
      if (!selectedSpot || !selectedSpot.coords) return;
      triggerHaptic('medium');
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.coords.lat},${selectedSpot.coords.lng}`, '_blank');
  };

  const toggleMode = (mode: 'AI' | 'HISTORY') => {
      triggerHaptic('light');
      setActiveMode(mode);
      setSelectedSpot(null); // Close sheet
  };

  return (
    <div className="relative h-[calc(100vh-84px)] w-full bg-slate-950 overflow-hidden">
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>

        {/* Overlay: Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-10 pointer-events-none">
            <div className="flex justify-between items-start">
                <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
                    <div className="flex gap-1">
                        <button 
                            onClick={() => toggleMode('AI')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'AI' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            🤖 Rekomendasi
                        </button>
                        <button 
                            onClick={() => toggleMode('HISTORY')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'HISTORY' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            📒 Riwayatku
                        </button>
                    </div>
                </div>

                <button 
                    onClick={getLocation}
                    className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-slate-700 shadow-xl active:scale-95 transition-transform pointer-events-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${gpsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
            
            {/* Info Badge */}
            <div className="mt-4 flex justify-center">
                 <span className="bg-slate-950/80 backdrop-blur text-[10px] text-slate-300 px-3 py-1 rounded-full border border-slate-800 shadow-lg pointer-events-auto">
                    {activeMode === 'AI' ? `📡 Memindai Database Pukul ${new Date().getHours()}:00` : `📂 Memuat Riwayat Order Pukul ${new Date().getHours()}:00`}
                 </span>
            </div>
        </div>

        {/* Overlay: Bottom Sheet Detail */}
        {selectedSpot && (
            <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-700 shadow-2xl relative overflow-hidden">
                    {/* Glow effect based on type */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${activeMode === 'AI' ? 'bg-cyan-500' : 'bg-yellow-500'}`}></div>
                    
                    <button 
                        onClick={() => setSelectedSpot(null)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-white p-2"
                    >
                        ✕
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${activeMode === 'AI' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            📍
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${activeMode === 'AI' ? 'bg-cyan-900 text-cyan-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                    {selectedSpot.type}
                                </span>
                                {selectedSpot.priority === 'TINGGI' && (
                                    <span className="text-[10px] font-black bg-red-900 text-red-300 px-1.5 py-0.5 rounded animate-pulse">
                                        PRIORITAS
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight pr-6">{selectedSpot.name}</h3>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-3 mb-4 border border-slate-800">
                        <p className="text-xs text-slate-400 italic">"{selectedSpot.reason}"</p>
                    </div>

                    <div className="flex gap-2">
                         <button 
                            onClick={handleNavigate}
                            className={`flex-1 py-3.5 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${activeMode === 'AI' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'}`}
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            GASPOL NAVIGASI
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
