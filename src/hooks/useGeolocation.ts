
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
        enableHighAccuracy: true, 
        timeout: 10000,           
        maximumAge: 60000 
      }
    );
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;
    
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    setState(prev => ({ ...prev, loading: true, error: null }));

    const options = { 
      enableHighAccuracy: true, 
      timeout: 15000, 
      maximumAge: 30000 
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isMounted.current) return;
        
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
        setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: getErrorMsg(err) 
        }));
      },
      options
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
          case err.PERMISSION_DENIED: return "Izin lokasi ditolak. Cek pengaturan HP.";
          case err.POSITION_UNAVAILABLE: return "Sinyal GPS hilang. Pindah ke area terbuka.";
          case err.TIMEOUT: return "Koneksi GPS lambat (Timeout).";
          default: return "Gagal mengambil lokasi.";
      }
  };

  return { ...state, getLocation, startWatching, stopWatching };
};
