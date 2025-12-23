
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
      setState(prev => ({ ...prev, loading: false, error: 'GPS tidak didukung.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const successHandler = (position: GeolocationPosition) => {
      setState({
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        loading: false,
        error: null,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
        // Fallback Logic:
        // Error Code 3 = TIMEOUT, Code 2 = POSITION_UNAVAILABLE
        // Jika High Accuracy gagal, coba Low Accuracy (lebih cepat, pakai tower seluler/wifi)
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
             console.log("High accuracy GPS failed, trying low accuracy fallback...");
             navigator.geolocation.getCurrentPosition(
                successHandler,
                (finalError) => {
                    let errorMsg = 'Gagal mengambil lokasi.';
                    switch(finalError.code) {
                        case finalError.PERMISSION_DENIED: errorMsg = "Izin GPS ditolak."; break;
                        case finalError.POSITION_UNAVAILABLE: errorMsg = "Sinyal GPS hilang."; break;
                        case finalError.TIMEOUT: errorMsg = "Waktu habis."; break;
                    }
                    setState(prev => ({ ...prev, loading: false, error: errorMsg }));
                },
                { 
                    enableHighAccuracy: false, // Kunci fallback: matikan high accuracy
                    timeout: 10000, 
                    maximumAge: 60000 // Boleh pakai cache posisi 1 menit terakhir
                }
             );
        } else {
            // Permission denied atau error lain yang tidak bisa di-fallback
            setState(prev => ({ ...prev, loading: false, error: "Izin GPS diperlukan." }));
        }
    };

    // Attempt 1: High Accuracy (GPS Satellite)
    // Timeout dipersingkat ke 5 detik agar user tidak menunggu lama sebelum fallback
    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
      }
    );
  }, []);

  return { ...state, getLocation };
};
