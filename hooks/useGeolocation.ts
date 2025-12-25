
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

  // Mode 1: Single Shot (Hemat Baterai - untuk Dashboard/Input)
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
        setState({ coords: null, loading: false, error: getErrorMsg(err) });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Mode 2: Real-time Watch (Boros Baterai - untuk Radar/Navigasi)
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;
    
    // Clear previous watch if any
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    setState(prev => ({ ...prev, loading: true, error: null }));

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
        // Don't clear state on minor errors during watch, just log/update error
        console.warn("GPS Watch Error:", err);
      },
      { 
        enableHighAccuracy: true, // Wajib ON untuk Radar
        timeout: 10000, 
        maximumAge: 0 
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
          case err.PERMISSION_DENIED: return "Izin lokasi ditolak. Aktifkan di pengaturan.";
          case err.POSITION_UNAVAILABLE: return "Sinyal GPS hilang.";
          case err.TIMEOUT: return "Waktu habis mencari satelit.";
          default: return "Gagal mengambil lokasi.";
      }
  };

  return { ...state, getLocation, startWatching, stopWatching };
};
