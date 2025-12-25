
import { GacorSpot, StrategyTip, PerformanceGrade, VehicleHealth } from "../types";
import { LOCATIONS_DB, STATIC_STRATEGIES, MOTIVATION_QUOTES } from "../data/knowledgeBase";

// --- UTILITY: Haptic Feedback ---
export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
        switch (pattern) {
        case 'light': navigator.vibrate(5); break; 
        case 'medium': navigator.vibrate(10); break; 
        case 'heavy': navigator.vibrate(20); break; 
        case 'success': navigator.vibrate([10, 30, 10]); break; 
        case 'error': navigator.vibrate([50, 30, 50, 30, 50]); break; 
        }
    } catch(e) { /* ignore on unsupported devices */ }
  }
};

// --- UTILITY: Calculate Distance (Haversine) ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d; 
};

// --- LOGIC 1: SMART SPOTS (REAL-TIME PRIORITY) ---
export const findSmartSpots = async (userLat: number, userLng: number): Promise<GacorSpot[]> => {
  // Simulasi latency
  await new Promise(r => setTimeout(r, 200));

  const now = new Date();
  const day = now.getDay(); // 0=Minggu, 1=Senin...
  const hour = now.getHours();
  
  // 1. Hitung jarak semua spot dulu
  const mappedSpots = LOCATIONS_DB.map(loc => {
      const dist = getDistance(userLat, userLng, loc.lat, loc.lng);
      return { ...loc, distanceVal: dist };
  });

  // 2. Filter yang relevan (Radius max 10km)
  // Kita perluas radius sedikit karena data kita sekarang lebih spesifik/sedikit jumlahnya dibanding random points
  let relevantSpots = mappedSpots.filter(loc => loc.distanceVal <= 10);

  // Fallback: Jika di area sepi database, ambil 5 terdekat apapun itu
  if (relevantSpots.length < 3) {
      relevantSpots = mappedSpots.sort((a,b) => a.distanceVal - b.distanceVal).slice(0, 5);
  }

  const scoredSpots = relevantSpots.map(loc => {
      let priority: 'TINGGI' | 'SEDANG' | 'RENDAH' = 'RENDAH';
      let dynamicReason = loc.notes; // Default pakai notes asli dari DB

      // Logic Waktu & Kategori
      const isBestHour = loc.bestHours.some(h => Math.abs(h - hour) <= 1);
      
      // Check Day Specificity (Sangat Penting untuk Data Baru)
      const isDayMatch = loc.specificDays ? loc.specificDays.includes(day) : true; // True jika general spot

      // SCORING LOGIC
      if (isDayMatch && isBestHour) {
          priority = 'TINGGI';
          dynamicReason = `🔥 HOTSPOT HARI INI! ${loc.notes}`;
      } else if (isDayMatch && !isBestHour) {
          priority = 'SEDANG';
          // Cek apakah jamnya sudah lewat atau belum
          const firstBest = loc.bestHours[0];
          if (hour < firstBest) dynamicReason = `Siap-siap untuk jam ${firstBest}:00. ${loc.notes}`;
          else dynamicReason = `Tadi ramai jam ${firstBest}:00. Coba geser dikit.`;
      } else if (!isDayMatch && loc.distanceVal < 2) {
          // Salah hari tapi dekat
          priority = 'RENDAH';
          dynamicReason = `Biasanya ramai hari ${getDayName(loc.specificDays?.[0])}. Tapi karena dekat, boleh dicoba.`;
      }

      // Boost Priority based on Distance (Hyper-local) overrides everything if VERY close
      if (loc.distanceVal < 0.5 && isDayMatch) {
          priority = 'TINGGI'; 
          dynamicReason = "SANGAT DEKAT! " + dynamicReason;
      }

      return {
          name: loc.name,
          type: loc.type, // Pakai Type dari DB
          reason: dynamicReason,
          distanceValue: loc.distanceVal, 
          distance: loc.distanceVal < 1 ? `${(loc.distanceVal * 1000).toFixed(0)}m` : `${loc.distanceVal.toFixed(1)}km`,
          coords: { lat: loc.lat, lng: loc.lng },
          priority: priority,
          source: 'AI' as const
      };
  });

  // 3. Sorting Final
  // Filter out 'RENDAH' priority unless we have very few spots
  let finalSpots = scoredSpots.filter(s => s.priority !== 'RENDAH');
  if (finalSpots.length < 3) finalSpots = scoredSpots;

  return finalSpots.sort((a, b) => {
      // Priority Score: TINGGI=0, SEDANG=2, RENDAH=4
      const pScoreA = a.priority === 'TINGGI' ? 0 : a.priority === 'SEDANG' ? 2 : 4;
      const pScoreB = b.priority === 'TINGGI' ? 0 : b.priority === 'SEDANG' ? 2 : 4;
      
      // Distance weight
      const totalScoreA = a.distanceValue + pScoreA;
      const totalScoreB = b.distanceValue + pScoreB;

      return totalScoreA - totalScoreB;
  }).slice(0, 8); 
};

const getDayName = (idx?: number) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    if (idx === undefined) return "Setiap Hari";
    return days[idx];
};

// --- LOGIC 2: PERFORMANCE GRADING ---
export const calculatePerformanceGrade = (orders: number, target: number): PerformanceGrade => {
    if (target === 0) return 'C';
    const percentage = (orders / target) * 100;

    if (percentage >= 120) return 'S'; 
    if (percentage >= 100) return 'A'; 
    if (percentage >= 75) return 'B'; 
    if (percentage >= 50) return 'C'; 
    return 'D'; 
};

// --- LOGIC 3: VEHICLE HEALTH ESTIMATOR ---
export const calculateVehicleHealth = (totalLifetimeOrders: number): VehicleHealth => {
    const SERVICE_INTERVAL_ORDERS = 400; // ~2000km
    
    const ordersSinceService = totalLifetimeOrders % SERVICE_INTERVAL_ORDERS;
    const remainingOrders = SERVICE_INTERVAL_ORDERS - ordersSinceService;
    
    const healthPercent = Math.max(0, Math.round((remainingOrders / SERVICE_INTERVAL_ORDERS) * 100));
    
    return {
        oilLife: healthPercent,
        tireCondition: Math.max(0, 100 - Math.round(totalLifetimeOrders / 50)), 
        nextServiceIn: remainingOrders
    };
};

export const getSmartStrategy = async (category: 'TEKNIS' | 'MARKETING' | 'MENTAL'): Promise<StrategyTip[]> => {
    return STATIC_STRATEGIES.filter(s => s.category === category);
};

export const getAnyepDiagnosis = async (lat: number, lng: number): Promise<string> => {
    await new Promise(r => setTimeout(r, 600)); 
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 4 && hour <= 7) return "Zona Bahaya Pagi: Hindari Jl. Rajawali/Andir (Pasar Tumpah). Fokus area perumahan timur.";
    if (hour >= 11 && hour <= 13) return "Jam Istirahat: Geser ke pusat kuliner (Dipatiukur/Lengkong) atau ngetem dekat Masjid Besar.";
    if (hour >= 16 && hour <= 19) return "Golden Hour: Standby area perkantoran. Jangan lawan arus macet, cari orderan searah 'Pulang'.";
    if (hour >= 21) return "Mode Malam: Geser ke area hiburan (Lengkong Kecil/Braga) atau standby RS 24 Jam.";
    
    return "Gunakan teknik 'Grid System'. Scan area 500m, jika 10 menit hening, geser ke titik niche terdekat.";
};

export const getDailyMotivation = (): string => {
    const idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    return MOTIVATION_QUOTES[idx];
};

export const getFinancialAdviceLogic = (revenue: number, expenses: number, targetRevenue: number): string => {
    if (revenue === 0) return "Dompet kosong. Fokus orderan pendek untuk 'pecah telur' dan bangun mood.";
    const expenseRatio = (expenses / revenue) * 100;
    if (expenseRatio > 30) return "PERINGATAN: Biaya operasional > 30%. Kurangi jajan, fokus kejar setoran.";
    if (revenue >= targetRevenue) return "Target Tembus! Tabung kelebihannya untuk servis motor bulan depan.";
    return "On Track. Pertahankan ritme, jaga stamina.";
};
