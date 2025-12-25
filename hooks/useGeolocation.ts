
import { useState, useCallback, useEffect, useRef } from 'react';

interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopWatching();
    };
  }, []);

  // Mode 1: Single Shot (Untuk input transaksi / dashboard)
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, loading: false, error: 'GPS tidak didukung.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMounted.current) return;
        setState({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          },
          loading: false,
          error: null,
        });
      },
      (err) => {
        if (!isMounted.current) return;
        console.warn("GPS Single Shot Error:", err);
        setState(prev => ({ ...prev, loading: false, error: getErrorMsg(err) }));
      },
      { 
        enableHighAccuracy: true, // Paksa hardware GPS
        timeout: 15000,           // Waktu tunggu lebih lama (15s) agar lock lebih akurat
        maximumAge: 10000         // Boleh pakai cache maks 10 detik lalu
      }
    );
  }, []);

  // Mode 2: Real-time Watch (Untuk Radar/Navigasi)
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;
    
    // Clear previous watch if any to prevent duplicates
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    setState(prev => ({ ...prev, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isMounted.current) return;
        
        // Filter out bad accuracy data (optional, but good for radar)
        // if (pos.coords.accuracy > 100) return; 

        setState({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed
          },
          loading: false,
          error: null,
        });
      },
      (err) => {
        if (!isMounted.current) return;
        console.warn("GPS Watch Error:", err);
        // Jangan hapus state coords lama jika error transient (misal masuk terowongan)
        // Hanya set error message
        setState(prev => ({ ...prev, loading: false, error: getErrorMsg(err) }));
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 0 // Selalu minta data fresh
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const getErrorMsg = (err: GeolocationPositionError) => {
      switch(err.code) {
          case err.PERMISSION_DENIED: return "Izin lokasi ditolak. Cek pengaturan browser/HP.";
          case err.POSITION_UNAVAILABLE: return "Sinyal GPS lemah/hilang. Coba pindah ke area terbuka.";
          case err.TIMEOUT: return "Waktu habis mencari satelit. Pastikan GPS aktif.";
          default: return "Gagal mengambil lokasi.";
      }
  };

  return { ...state, getLocation, startWatching, stopWatching };
};
