
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GacorSpot, Transaction, TransactionType } from '../types';
import { findSmartSpots, triggerHaptic } from '../services/smartService';
import { useGeolocation } from '../hooks/useGeolocation';

interface RadarViewProps {
  transactions: Transaction[];
}

export const RadarView: React.FC<RadarViewProps> = ({ transactions }) => {
  const { coords, loading: gpsLoading, error: gpsError, startWatching, stopWatching } = useGeolocation();
  
  const [activeMode, setActiveMode] = useState<'AI' | 'HISTORY'>('AI');
  const [spots, setSpots] = useState<GacorSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<GacorSpot | null>(null);
  const [isFollowing, setIsFollowing] = useState(true); 
  
  const mapRef = useRef<any>(null); 
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const spotLayerRef = useRef<any>(null);

  // --- 1. Map Initialization (Safe & Clean) ---
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Check if map is already initialized to prevent error
    if (mapRef.current !== null) return;

    console.log("Initializing Map Engine...");
    
    // Default Center (Bandung) if no GPS yet
    const initialLat = coords?.lat || -6.9175;
    const initialLng = coords?.lng || 107.6191;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        zoomAnimation: false, // Performance boost for mobile
        fadeAnimation: false,
        markerZoomAnimation: false
    }).setView([initialLat, initialLng], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        opacity: 0.9
    }).addTo(map);

    // Create a layer group for spots for easy clearing
    spotLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Interaction Listeners to disable Auto-Follow
    map.on('dragstart', () => setIsFollowing(false));
    
    startWatching();

    return () => {
        stopWatching();
        if (mapRef.current) {
            mapRef.current.off();
            mapRef.current.remove();
            mapRef.current = null;
            spotLayerRef.current = null;
        }
    };
  }, []);

  // --- 2. GPS & User Marker Updates ---
  useEffect(() => {
    const L = (window as any).L;
    if (!mapRef.current || !coords || !L) return;

    const { lat, lng, accuracy, heading } = coords;

    // Update User Marker
    if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div class="relative flex items-center justify-center w-10 h-10">
                      <div class="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
                      <div class="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg z-10"></div>
                      <div class="user-arrow absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-blue-400 transition-transform duration-300" style="transform: translateY(-12px)"></div>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
    } else {
        userMarkerRef.current.setLatLng([lat, lng]);
        
        // Rotate arrow based on heading
        const el = userMarkerRef.current.getElement();
        if (el && heading) {
            const arrow = el.querySelector('.user-arrow');
            if (arrow) arrow.style.transform = `translateY(-12px) rotate(${heading}deg)`;
        }
    }

    // Update Accuracy Circle
    if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle([lat, lng], {
            radius: accuracy || 50,
            fillColor: '#3b82f6',
            fillOpacity: 0.05,
            stroke: false
        }).addTo(mapRef.current);
    } else {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(accuracy || 50);
    }

    // Auto Follow Logic
    if (isFollowing) {
        mapRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    }

  }, [coords, isFollowing]);

  // --- 3. Spot Fetching & Rendering ---
  const updateSpots = useCallback(async () => {
      if (!coords) return;
      
      let newSpots: GacorSpot[] = [];
      if (activeMode === 'AI') {
          newSpots = await findSmartSpots(coords.lat, coords.lng);
      } else {
          // History Mode Logic
          const now = new Date();
          const currentHour = now.getHours();
          const relevantTx = transactions.filter(tx => 
             tx.type === TransactionType.INCOME && 
             tx.coords && 
             Math.abs(new Date(tx.timestamp).getHours() - currentHour) <= 2
          );
          newSpots = relevantTx.slice(0, 10).map(tx => ({
              name: tx.description,
              type: 'HISTORY',
              reason: 'Riwayat orderan Anda di jam segini.',
              distance: '0m',
              distanceValue: 0,
              coords: tx.coords,
              priority: 'TINGGI',
              source: 'HISTORY'
          }));
      }
      setSpots(newSpots);
  }, [coords, activeMode, transactions]);

  // Update spots when coords or mode changes
  useEffect(() => {
      updateSpots();
  }, [updateSpots]);

  // Render Markers
  useEffect(() => {
      const L = (window as any).L;
      if (!mapRef.current || !L || !spotLayerRef.current) return;

      spotLayerRef.current.clearLayers();

      spots.forEach(spot => {
          if (!spot.coords) return;
          
          const isHigh = spot.priority === 'TINGGI';
          const colorClass = spot.source === 'HISTORY' ? 'text-yellow-400' : isHigh ? 'text-red-400' : 'text-cyan-400';
          const zIndex = isHigh ? 500 : 400;

          const iconHtml = `
            <div class="flex flex-col items-center transform transition-transform hover:scale-110">
                <div class="relative ${colorClass}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                    ${isHigh ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>' : ''}
                </div>
                <span class="text-[9px] font-bold bg-slate-900/80 text-white px-1.5 rounded -mt-1 backdrop-blur-sm whitespace-nowrap">
                    ${spot.distance}
                </span>
            </div>
          `;

          const icon = L.divIcon({
              className: 'bg-transparent',
              html: iconHtml,
              iconSize: [40, 50],
              iconAnchor: [20, 45]
          });

          const marker = L.marker([spot.coords.lat, spot.coords.lng], { icon, zIndexOffset: zIndex })
            .on('click', () => {
                triggerHaptic('medium');
                setSelectedSpot(spot);
                setIsFollowing(false);
                mapRef.current.setView([spot.coords!.lat, spot.coords!.lng], 16, { animate: true });
            });
          
          spotLayerRef.current.addLayer(marker);
      });
  }, [spots]);

  // --- Handlers ---
  const handleRecenter = () => {
      triggerHaptic('medium');
      setIsFollowing(true);
      if (coords && mapRef.current) {
          mapRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
      } else {
          startWatching();
      }
  };

  const handleNavigate = () => {
      if (!selectedSpot?.coords) return;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.coords.lat},${selectedSpot.coords.lng}`, '_blank');
  };

  return (
    <div className="relative w-full bg-slate-950 overflow-hidden" style={{ height: 'calc(100vh - 84px)' }}>
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-900" />

        {/* Loading / Error States (Floating) */}
        <div className="absolute top-24 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-4 space-y-2">
             {!coords && gpsLoading && (
                 <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl animate-pulse">
                     <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                     <span className="text-xs font-bold text-slate-300">Mencari Satelit...</span>
                 </div>
             )}
             {gpsError && (
                 <div className="bg-red-900/90 backdrop-blur-md border border-red-500 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl pointer-events-auto">
                     <span className="text-white text-xs font-bold">⚠️ {gpsError}</span>
                     <button onClick={() => window.location.reload()} className="bg-red-600 px-2 py-0.5 rounded text-[10px] text-white font-bold">RETRY</button>
                 </div>
             )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-10 pointer-events-none">
            <div className="flex justify-between items-start">
                <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto flex gap-1">
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveMode('AI'); setSelectedSpot(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'AI' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                        🤖 AI
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveMode('HISTORY'); setSelectedSpot(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'HISTORY' ? 'bg-yellow-500 text-slate-900' : 'text-slate-400'}`}
                    >
                        📒 Riwayat
                    </button>
                </div>

                <button 
                    onClick={handleRecenter}
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xl transition-all active:scale-95 pointer-events-auto ${
                        isFollowing ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-400'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Bottom Detail Sheet */}
        {selectedSpot && (
            <div className="absolute bottom-4 left-4 right-4 z-30 animate-slide-up">
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-700 shadow-2xl relative">
                    <button 
                        onClick={() => { setSelectedSpot(null); setIsFollowing(true); }}
                        className="absolute top-3 right-3 p-2 text-slate-500 hover:text-white"
                    >✕</button>

                    <div className="flex gap-4 mb-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${activeMode === 'AI' ? 'bg-cyan-500/20' : 'bg-yellow-500/20'}`}>
                            📍
                        </div>
                        <div>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${activeMode === 'AI' ? 'bg-cyan-900 text-cyan-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                {selectedSpot.type}
                            </span>
                            <h3 className="text-lg font-bold text-white leading-tight mt-1">{selectedSpot.name}</h3>
                            <p className="text-xs text-slate-400 font-bold">Jarak: {selectedSpot.distance}</p>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-3 mb-4 border border-slate-800">
                        <p className="text-xs text-slate-300 italic">"{selectedSpot.reason}"</p>
                    </div>

                    <button 
                        onClick={handleNavigate}
                        className="w-full py-3.5 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95"
                    >
                        NAVIGASI SEKARANG 🚀
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
