
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

  const getErrorMsg = (err: GeolocationPositionError) => {
      switch(err.code) {
          case err.PERMISSION_DENIED: return "Izin lokasi ditolak. Aktifkan GPS.";
          case err.POSITION_UNAVAILABLE: return "Sinyal GPS hilang.";
          case err.TIMEOUT: return "Koneksi GPS lambat.";
          default: return "Gagal memuat lokasi.";
      }
  };

  const handleSuccess = (pos: GeolocationPosition) => {
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
  };

  const handleError = (err: GeolocationPositionError) => {
      if (!isMounted.current) return;
      // Jangan hapus coords lama jika error timeout (agar peta tidak blank)
      setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: getErrorMsg(err) 
      }));
  };

  // Settingan GPS untuk Driver (Agresif tapi Akurat)
  const geoOptions = { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 2000 // Cache hanya 2 detik agar tidak loncat saat bergerak
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, loading: false, error: 'Perangkat tidak mendukung GPS.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;
    
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    setState(prev => ({ ...prev, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { ...state, getLocation, startWatching, stopWatching };
};
