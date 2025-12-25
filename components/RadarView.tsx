
import React, { useState, useEffect, useRef } from 'react';
import { GacorSpot, Transaction, TransactionType } from '../types';
import { findSmartSpots, triggerHaptic } from '../services/smartService';
import { useGeolocation } from '../hooks/useGeolocation';

interface RadarViewProps {
  transactions: Transaction[];
}

declare const L: any; // Leaflet global type definition for this environment

export const RadarView: React.FC<RadarViewProps> = ({ transactions }) => {
  // Use startWatching for Radar View to get continuous updates
  const { coords, loading: gpsLoading, error: gpsError, startWatching, stopWatching } = useGeolocation();
  
  const [activeMode, setActiveMode] = useState<'AI' | 'HISTORY'>('AI');
  const [spots, setSpots] = useState<GacorSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<GacorSpot | null>(null);
  const [isFollowing, setIsFollowing] = useState(true); // Auto-center map on user
  
  const mapRef = useRef<any>(null); 
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Leaflet Layer References
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const spotMarkersRef = useRef<any[]>([]); 

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map but don't set view yet (wait for GPS)
    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([-6.9175, 107.6191], 12); // Default Bandung (will be overwritten instantly if GPS ready)

    // Dark Matter Tile Layer (High Contrast)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(map);

    // Event listeners
    map.on('dragstart', () => setIsFollowing(false)); // Disable auto-follow if user drags

    mapRef.current = map;

    // Start Real-time Tracking
    startWatching();

    return () => {
        stopWatching();
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  // 2. Handle User Location Updates (Real-time)
  useEffect(() => {
    if (!coords || !mapRef.current) return;

    const { lat, lng, accuracy, heading } = coords;

    // A. Update User Marker
    if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
    } else {
        // Create custom pulsing marker
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div class="relative w-8 h-8 flex items-center justify-center">
                      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                      <div class="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg z-10"></div>
                      ${heading ? `<div class="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-blue-400 transform" style="transform: rotate(${heading}deg) translateY(-10px);"></div>` : ''}
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
    }

    // B. Update Accuracy Circle
    if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(accuracy || 50);
    } else {
        accuracyCircleRef.current = L.circle([lat, lng], {
            radius: accuracy || 50,
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            color: '#3b82f6',
            opacity: 0.3,
            weight: 1
        }).addTo(mapRef.current);
    }

    // C. Fly to user if "Following" mode is active
    if (isFollowing) {
        mapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1 });
    }

  }, [coords, isFollowing]);

  // 3. Fetch Spots when User Location or Mode changes
  useEffect(() => {
    if (coords) {
        fetchSpots();
    }
  }, [coords?.lat, coords?.lng, activeMode]);

  // 4. Render Spots
  useEffect(() => {
     renderSpotMarkers();
  }, [spots]);

  const fetchSpots = async () => {
      if (!coords) return;

      let results: GacorSpot[] = [];

      if (activeMode === 'AI') {
          results = await findSmartSpots(coords.lat, coords.lng);
      } else {
          // History Logic
          const now = new Date();
          const currentHour = now.getHours();
          
          const relevantTx = transactions.filter(tx => {
            if (tx.type !== TransactionType.INCOME || !tx.coords) return false;
            const txDate = new Date(tx.timestamp);
            const txHour = txDate.getHours();
            return Math.abs(txHour - currentHour) <= 3; 
          });

          // Limit & Format
          results = relevantTx.slice(0, 15).map(tx => ({
              name: tx.description,
              type: 'LANGGANAN',
              reason: `Orderanmu jam segini`,
              distance: '0km',
              distanceValue: 0,
              coords: tx.coords,
              priority: 'TINGGI',
              source: 'HISTORY'
          }));
      }
      setSpots(results);
  };

  const renderSpotMarkers = () => {
      if (!mapRef.current) return;

      // Clear old markers
      spotMarkersRef.current.forEach(m => mapRef.current.removeLayer(m));
      spotMarkersRef.current = [];

      spots.forEach((spot, idx) => {
          if (!spot.coords) return;

          const color = spot.source === 'HISTORY' ? 'text-yellow-400' : 'text-cyan-400';
          const isHighPriority = spot.priority === 'TINGGI';
          
          const iconHtml = `<div class="custom-marker-pin ${color} flex flex-col items-center group">
                                <div class="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 drop-shadow-xl transform transition-transform group-hover:-translate-y-2 ${isHighPriority ? 'scale-110' : ''}" viewBox="0 0 24 24" fill="currentColor">
                                        <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                                    </svg>
                                    ${isHighPriority ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>' : ''}
                                </div>
                                <span class="text-[10px] font-bold bg-black/70 backdrop-blur px-2 py-0.5 rounded text-white mt-[-5px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${spot.distance}
                                </span>
                            </div>`;

          const icon = L.divIcon({
              className: 'bg-transparent border-none',
              html: iconHtml,
              iconSize: [40, 40],
              iconAnchor: [20, 40]
          });

          const marker = L.marker([spot.coords.lat, spot.coords.lng], { icon })
            .addTo(mapRef.current)
            .on('click', () => {
                triggerHaptic('light');
                setSelectedSpot(spot);
                setIsFollowing(false); // User clicked a spot, stop auto-following
                mapRef.current.flyTo([spot.coords!.lat - 0.003, spot.coords!.lng], 15, { duration: 0.5 });
            });
          
          spotMarkersRef.current.push(marker);
      });
  };

  const handleNavigate = () => {
      if (!selectedSpot || !selectedSpot.coords) return;
      triggerHaptic('medium');
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.coords.lat},${selectedSpot.coords.lng}`, '_blank');
  };

  const handleRecenter = () => {
      triggerHaptic('medium');
      setIsFollowing(true);
      if (coords && mapRef.current) {
          mapRef.current.flyTo([coords.lat, coords.lng], 16, { duration: 1 });
      } else {
          startWatching(); // Try starting GPS again if lost
      }
  };

  // --- LOADING STATE (If no coords yet) ---
  if (!coords && gpsLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-84px)] bg-slate-950 text-slate-400">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-bold animate-pulse">Mencari Koordinat Satelit...</p>
              <p className="text-xs text-slate-600 mt-2">Pastikan GPS Aktif & Berada di Luar Ruangan</p>
          </div>
      );
  }

  // --- GPS ERROR STATE ---
  if (!coords && gpsError) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-84px)] bg-slate-950 text-red-400 p-6 text-center">
            <span className="text-4xl mb-4">📡❌</span>
            <h3 className="text-lg font-bold text-white mb-2">GPS Bermasalah</h3>
            <p className="text-sm mb-6">{gpsError}</p>
            <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
            >
                Coba Lagi
            </button>
        </div>
      );
  }

  return (
    <div className="relative h-[calc(100vh-84px)] w-full bg-slate-950 overflow-hidden">
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>

        {/* Overlay: Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-10 pointer-events-none">
            <div className="flex justify-between items-start">
                <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto flex gap-1">
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveMode('AI'); setSelectedSpot(null); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeMode === 'AI' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span>🤖</span> Rekomendasi
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveMode('HISTORY'); setSelectedSpot(null); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeMode === 'HISTORY' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span>📒</span> Riwayat
                    </button>
                </div>

                <div className="flex flex-col gap-2 pointer-events-auto">
                    {/* Recenter Button */}
                    <button 
                        onClick={handleRecenter}
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                            isFollowing 
                            ? 'bg-blue-600 border-blue-400 text-white' 
                            : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Overlay: Accuracy Info */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-0 pointer-events-none opacity-50">
             {coords?.accuracy && (
                 <p className="text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded-full backdrop-blur">
                     Akurasi GPS: +/- {Math.round(coords.accuracy)}m
                 </p>
             )}
        </div>

        {/* Overlay: Bottom Sheet Detail */}
        {selectedSpot && (
            <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${activeMode === 'AI' ? 'bg-cyan-500' : 'bg-yellow-500'}`}></div>
                    
                    <button 
                        onClick={() => { setSelectedSpot(null); setIsFollowing(true); }}
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
                            <p className="text-xs text-slate-400 font-bold mt-1">Jarak: {selectedSpot.distance}</p>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-3 mb-4 border border-slate-800">
                        <p className="text-xs text-slate-300 italic">"{selectedSpot.reason}"</p>
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
