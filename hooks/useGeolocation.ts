import { useState, useCallback } from 'react';

interface Coords {
  lat: number;
  lng: number;
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

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, loading: false, error: 'GPS tidak didukung browser ini.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMsg = 'Gagal mengambil lokasi.';
        switch(error.code) {
            case error.PERMISSION_DENIED: errorMsg = "Izin GPS ditolak."; break;
            case error.POSITION_UNAVAILABLE: errorMsg = "Sinyal GPS lemah."; break;
            case error.TIMEOUT: errorMsg = "Waktu habis mencari GPS."; break;
        }
        setState(prev => ({ ...prev, loading: false, error: errorMsg }));
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  }, []);

  return { ...state, getLocation };
};