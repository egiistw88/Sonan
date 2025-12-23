
import { useState, useCallback, useRef, useEffect } from 'react';

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

  // Ref untuk mencegah memory leak jika komponen unmount saat GPS masih mencari
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, loading: false, error: 'GPS tidak didukung di HP ini.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const successHandler = (position: GeolocationPosition) => {
      if (!isMounted.current) return;
      setState({
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        loading: false,
        error: null,
      });
    };

    const handleLowAccuracy = () => {
        console.log("Mencoba mode hemat daya (Low Accuracy)...");
        navigator.geolocation.getCurrentPosition(
            successHandler,
            (finalError) => {
                if (!isMounted.current) return;
                let errorMsg = 'Gagal mendeteksi lokasi.';
                if (finalError.code === finalError.PERMISSION_DENIED) errorMsg = "Izin lokasi ditolak. Cek pengaturan browser.";
                else if (finalError.code === finalError.POSITION_UNAVAILABLE) errorMsg = "Sinyal GPS hilang/lemah.";
                else if (finalError.code === finalError.TIMEOUT) errorMsg = "Waktu habis. Coba geser ke area terbuka.";
                
                setState({ coords: null, loading: false, error: errorMsg });
            },
            { 
                enableHighAccuracy: false, 
                timeout: 10000, 
                maximumAge: 60000 // Boleh pakai cache 1 menit terakhir
            }
        );
    };

    const errorHandler = (error: GeolocationPositionError) => {
        if (!isMounted.current) return;

        // Jika error karena Timeout (3) atau Position Unavailable (2), coba Low Accuracy
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
             handleLowAccuracy();
        } else {
            // Permission Denied (1) atau error lain
            let errorMsg = "Gagal mengambil lokasi.";
            if (error.code === error.PERMISSION_DENIED) errorMsg = "Izin lokasi wajib diaktifkan.";
            setState({ coords: null, loading: false, error: errorMsg });
        }
    };

    // Percobaan Pertama: High Accuracy (Satelit)
    // Timeout 7 detik. Jika lebih dari itu, anggap gagal dan lempar ke errorHandler (fallback)
    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      { 
        enableHighAccuracy: true, 
        timeout: 7000, 
        maximumAge: 10000 
      }
    );
  }, []);

  return { ...state, getLocation };
};
