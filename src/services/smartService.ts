
import { GacorSpot, StrategyTip, PerformanceGrade, VehicleHealth } from "../types";
import { LOCATIONS_DB, STATIC_STRATEGIES, MOTIVATION_QUOTES } from "../data/knowledgeBase";

// --- UTILITY: Haptic Feedback ---
export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
        // Cek apakah user sedang berinteraksi agar tidak diblokir browser
        switch (pattern) {
        case 'light': navigator.vibrate(5); break; 
        case 'medium': navigator.vibrate(10); break; 
        case 'heavy': navigator.vibrate(20); break; 
        case 'success': navigator.vibrate([10, 30, 10]); break; 
        case 'error': navigator.vibrate([50, 30, 50, 30, 50]); break; 
        }
    } catch(e) { /* ignore */ }
  }
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
};

// --- LOGIC 1: SMART SPOTS (INSTANT - NO FAKE LATENCY) ---
export const findSmartSpots = async (userLat: number, userLng: number): Promise<GacorSpot[]> => {
  // REMOVED: await new Promise(r => setTimeout(r, 200)); <- Bikin lemot!

  const now = new Date();
  const day = now.getDay(); 
  const hour = now.getHours();
  
  // 1. Calculate distances
  const mappedSpots = LOCATIONS_DB.map(loc => ({
      ...loc, 
      distanceVal: getDistance(userLat, userLng, loc.lat, loc.lng)
  }));

  // 2. Filter Radius (Max 15km agar mencakup pinggiran kota)
  let relevantSpots = mappedSpots.filter(loc => loc.distanceVal <= 15);

  // Fallback jika kosong
  if (relevantSpots.length < 3) {
      relevantSpots = mappedSpots.sort((a,b) => a.distanceVal - b.distanceVal).slice(0, 5);
  }

  // 3. Scoring
  const scoredSpots = relevantSpots.map(loc => {
      let priority: 'TINGGI' | 'SEDANG' | 'RENDAH' = 'RENDAH';
      let dynamicReason = loc.notes; 

      const isBestHour = loc.bestHours.some(h => Math.abs(h - hour) <= 1);
      const isDayMatch = loc.specificDays ? loc.specificDays.includes(day) : true; 

      if (isDayMatch && isBestHour) {
          priority = 'TINGGI';
          dynamicReason = `🔥 SEDANG GACOR! ${loc.notes}`;
      } else if (isDayMatch && !isBestHour) {
          priority = 'SEDANG';
          const firstBest = loc.bestHours[0];
          if (hour < firstBest) dynamicReason = `Persiapan jam ${firstBest}:00. ${loc.notes}`;
          else dynamicReason = `Biasanya ramai jam ${firstBest}:00.`;
      } else if (!isDayMatch && loc.distanceVal < 2) {
          priority = 'RENDAH';
          dynamicReason = `Dekat lokasi Anda. Coba cek siapa tau hoki.`;
      }

      // Boost jika sangat dekat (< 500m)
      if (loc.distanceVal < 0.5) {
          priority = 'TINGGI'; 
          dynamicReason = "POSISI SANGAT DEKAT! " + dynamicReason;
      }

      return {
          name: loc.name,
          type: loc.type, 
          reason: dynamicReason,
          distanceValue: loc.distanceVal, 
          distance: loc.distanceVal < 1 ? `${(loc.distanceVal * 1000).toFixed(0)}m` : `${loc.distanceVal.toFixed(1)}km`,
          coords: { lat: loc.lat, lng: loc.lng },
          priority: priority,
          source: 'AI' as const
      };
  });

  // 4. Sort: Priority first, then Distance
  return scoredSpots.sort((a, b) => {
      const pScore = (p: string) => (p === 'TINGGI' ? 0 : p === 'SEDANG' ? 10 : 20);
      const scoreA = pScore(a.priority) + a.distanceValue;
      const scoreB = pScore(b.priority) + b.distanceValue;
      return scoreA - scoreB;
  }).slice(0, 10); 
};

const getDayName = (idx?: number) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    if (idx === undefined) return "Setiap Hari";
    return days[idx];
};

export const calculatePerformanceGrade = (orders: number, target: number): PerformanceGrade => {
    if (target === 0) return 'C';
    const percentage = (orders / target) * 100;
    if (percentage >= 120) return 'S'; 
    if (percentage >= 100) return 'A'; 
    if (percentage >= 75) return 'B'; 
    if (percentage >= 50) return 'C'; 
    return 'D'; 
};

export const calculateVehicleHealth = (totalLifetimeOrders: number): VehicleHealth => {
    const SERVICE_INTERVAL_ORDERS = 400; 
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
    // No latency needed
    const hour = new Date().getHours();

    if (hour >= 4 && hour <= 7) return "Zona Pagi: Hindari pasar tumpah macet. Geser ke perumahan elit (orang berangkat kerja).";
    if (hour >= 11 && hour <= 13) return "Jam Makan: Matikan fitur 'Bebas', geser ke pusat kuliner/mall terdekat.";
    if (hour >= 16 && hour <= 19) return "Jam Pulang: Standby di gedung perkantoran. Cari orderan arah pulang ke timur/selatan.";
    if (hour >= 21) return "Mode Malam: Geser ke area hiburan, stasiun, atau RS 24 Jam.";
    
    return "Teknik Grid: Jangan diam > 10 menit di satu titik. Geser radius 500m ke titik keramaian baru.";
};

export const getDailyMotivation = (): string => {
    const idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    return MOTIVATION_QUOTES[idx];
};

export const getFinancialAdviceLogic = (revenue: number, expenses: number, targetRevenue: number): string => {
    if (revenue === 0) return "Belum pecah telur? Cari orderan jarak pendek dulu buat mancing server.";
    const expenseRatio = (expenses / revenue) * 100;
    if (expenseRatio > 35) return "PERINGATAN: Pengeluaran boros! Kurangi jajan, bawa bekal air minum.";
    if (revenue >= targetRevenue) return "Target Tembus! Sisa waktu bisa buat istirahat atau bonus tabungan.";
    return "Lanjut terus! Jaga ritme, jangan lupa istirahat sejenak.";
};
