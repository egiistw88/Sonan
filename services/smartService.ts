
import { GacorSpot, StrategyTip, PerformanceGrade, VehicleHealth } from "../types";
import { LOCATIONS_DB, STATIC_STRATEGIES, MOTIVATION_QUOTES } from "../data/knowledgeBase";

// --- UTILITY: Calculate Distance (Haversine) ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d; // Distance in km
};

// --- LOGIC 1: SMART SPOTS (DATA-DRIVEN + GEO-INTELLIGENCE) ---
export const findSmartSpots = async (userLat: number, userLng: number): Promise<GacorSpot[]> => {
  await new Promise(r => setTimeout(r, 600)); // Simulasi processing

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday
  const hour = now.getHours();
  
  // 1. FILTER CANDIDATES BERDASARKAN WAKTU & HARI
  let candidates = LOCATIONS_DB.filter(loc => {
    // Weekend Logic (Sabtu=6, Minggu=0)
    if (day === 0 || day === 6) {
        // Di weekend, prioritaskan Wisata, Mall, Kuliner, Stasiun
        return ['WISATA', 'MALL', 'KULINER', 'STASIUN', 'TRAVEL', 'BELANJA'].includes(loc.type);
    }
    
    // Weekday Logic: Cek apakah jam sekarang termasuk 'bestHours' lokasi tersebut
    // Kita berikan toleransi +/- 1 jam
    const isBestHour = loc.bestHours.some(h => Math.abs(h - hour) <= 1);
    
    // Khusus RS dan Pasar, selalu relevan di jam-jam tertentu
    if (loc.type === 'PASAR' && hour < 6) return true;
    if (loc.type === 'RS' && (hour >= 7 && hour <= 15)) return true;

    return isBestHour;
  });

  // Jika hasil filter sedikit (misal jam sepi), ambil lokasi umum terdekat (Fallback)
  if (candidates.length < 3) {
      candidates = LOCATIONS_DB; // Buka semua kemungkinan, nanti disort jarak
  }

  // 2. SCORING BERDASARKAN JARAK & KONTEKS
  const scoredSpots = candidates.map(loc => {
      const dist = getDistance(userLat, userLng, loc.lat, loc.lng);
      let priority: 'TINGGI' | 'SEDANG' | 'RENDAH' = 'SEDANG';
      let dynamicReason = "";

      // Tentukan alasan berdasarkan Jam
      if (hour < 7) dynamicReason = "Traffic Pagi (Sekolah/Pasar)";
      else if (hour >= 11 && hour <= 13) dynamicReason = "Jam Makan Siang";
      else if (hour >= 16 && hour <= 19) dynamicReason = "Golden Hour (Bubaran)";
      else if (hour > 19) dynamicReason = "Zona Malam/Santai";
      else dynamicReason = "Standby Area Strategis";

      // Logika Prioritas Radius
      if (dist <= 3) {
          priority = 'TINGGI';
          dynamicReason += " (Sangat Dekat)";
      } else if (dist <= 8) {
          priority = 'SEDANG';
      } else {
          priority = 'RENDAH';
          dynamicReason = "Cukup jauh, ambil jika searah";
      }

      // Boost priority jika tipe lokasi sangat relevan dengan jam
      if (hour >= 6 && hour <= 7 && loc.type === 'SEKOLAH') priority = 'TINGGI';
      if (hour >= 11 && hour <= 13 && loc.type === 'FOOD') priority = 'TINGGI';
      if (hour >= 17 && hour <= 20 && loc.type === 'MALL') priority = 'TINGGI';

      return {
          name: loc.name,
          type: loc.type,
          reason: dynamicReason,
          distanceValue: dist, 
          distance: dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`,
          coords: { lat: loc.lat, lng: loc.lng },
          priority: priority,
          source: 'AI' as const
      };
  });

  // 3. SORTING FINAL
  // Urutkan: Priority Tinggi -> Jarak Terdekat
  return scoredSpots.sort((a, b) => {
      const priorityScore = { 'TINGGI': 1, 'SEDANG': 2, 'RENDAH': 3 };
      if (priorityScore[a.priority] !== priorityScore[b.priority]) {
          return priorityScore[a.priority] - priorityScore[b.priority];
      }
      return a.distanceValue - b.distanceValue;
  }).slice(0, 5); // Ambil 5 terbaik
};

// --- LOGIC 2: PERFORMANCE GRADING ---
export const calculatePerformanceGrade = (orders: number, target: number): PerformanceGrade => {
    if (target === 0) return 'C';
    const percentage = (orders / target) * 100;

    if (percentage >= 120) return 'S'; // Super
    if (percentage >= 100) return 'A'; // Excellent
    if (percentage >= 75) return 'B'; // Good
    if (percentage >= 50) return 'C'; // Average
    return 'D'; // Low
};

// --- LOGIC 3: VEHICLE HEALTH ESTIMATOR ---
export const calculateVehicleHealth = (totalLifetimeOrders: number): VehicleHealth => {
    const SERVICE_INTERVAL_ORDERS = 400; // ~2000km
    
    const ordersSinceService = totalLifetimeOrders % SERVICE_INTERVAL_ORDERS;
    const remainingOrders = SERVICE_INTERVAL_ORDERS - ordersSinceService;
    
    const healthPercent = Math.max(0, Math.round((remainingOrders / SERVICE_INTERVAL_ORDERS) * 100));
    
    return {
        oilLife: healthPercent,
        tireCondition: Math.max(0, 100 - Math.round(totalLifetimeOrders / 50)), // Ban habis tiap 5000 order (kasar)
        nextServiceIn: remainingOrders
    };
};

export const getSmartStrategy = async (category: 'TEKNIS' | 'MARKETING' | 'MENTAL'): Promise<StrategyTip[]> => {
    return STATIC_STRATEGIES.filter(s => s.category === category);
};

export const getAnyepDiagnosis = async (lat: number, lng: number): Promise<string> => {
    await new Promise(r => setTimeout(r, 800));
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
