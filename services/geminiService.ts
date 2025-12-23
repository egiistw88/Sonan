
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GacorSpot, StrategyTip } from "../types";

// Safety check for API Key
const API_KEY = process.env.API_KEY;

// Jika API Key tidak ada (lupa setting di Vercel), gunakan dummy agar app tidak crash saat dibuka
// Nanti akan error saat user mencoba fitur AI, tapi UI utama tetap jalan.
const ai = new GoogleGenAI({ apiKey: API_KEY || "dummy_key_for_rendering_ui" });

if (!API_KEY) {
  console.warn("WARNING: API_KEY is missing. AI features will not work. Please set it in Vercel Settings.");
}

// --- PERSISTENT CACHE SYSTEM (localStorage) ---
// Menggunakan localStorage agar data bertahan reload page / switch app
const CACHE_PREFIX = 'sonan_cache_';
// Cache durations
const WEATHER_TTL = 20 * 60 * 1000; // 20 Menit
const STRATEGY_TTL = 24 * 60 * 60 * 1000; // 24 Jam (Strategi jarang berubah)
const SPOTS_TTL = 45 * 60 * 1000; // 45 Menit

const getFromCache = (key: string, ttl: number) => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp < ttl) {
      return parsed.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const saveToCache = (key: string, data: any) => {
  try {
    const payload = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch (e) {
    console.warn("Cache storage failed (Quota Exceeded?)", e);
  }
};

// Schema Definition
const weatherSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING, description: "Nama jalan atau daerah spesifik" },
    temp: { type: Type.STRING, description: "Suhu saat ini misal 29°C" },
    condition: { type: Type.STRING, description: "Kondisi cuaca singkat, misal: Hujan Ringan, Berawan" },
    advice: { type: Type.STRING, description: "Saran singkat untuk pengendara motor maksimal 1 kalimat" },
  },
  required: ["location", "temp", "condition", "advice"],
};

const spotSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    spots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nama tempat spesifik, misal 'Stasiun Tebet Pintu Barat'" },
          type: { type: Type.STRING, description: "Kategori singkat (Stasiun/Mall/Kantor/Perumahan/Kampus)" },
          reason: { type: Type.STRING, description: "Alasan kenapa gacor jam segini (maks 10 kata)" },
          distance: { type: Type.STRING, description: "Estimasi jarak relatif (misal 'Sekitar 500m')" },
          priority: { type: Type.STRING, enum: ["TINGGI", "SEDANG"] }
        },
        required: ["name", "type", "reason", "distance", "priority"]
      }
    }
  },
  required: ["spots"]
};

const strategySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Judul Tips (Punchy & Menarik)" },
          content: { type: Type.STRING, description: "Isi tips lengkap, teknis, dan detail (min 2 kalimat)" },
          category: { type: Type.STRING, enum: ['TEKNIS', 'MARKETING', 'MENTAL'] },
          difficulty: { type: Type.STRING, enum: ['PEMULA', 'SENIOR'] }
        },
        required: ["title", "content", "category", "difficulty"]
      }
    }
  },
  required: ["tips"]
};

export const fetchWeatherAndInsight = async (lat: number, lng: number) => {
  // Round coordinates to 3 decimal places to group nearby caches (~100m radius)
  const cacheKey = `weather_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const cached = getFromCache(cacheKey, WEATHER_TTL);
  if (cached) {
    console.log("Using Cached Weather");
    return cached;
  }

  // Jika API Key tidak ada, jangan panggil Gemini, return default langsung
  if (!API_KEY) {
    return {
      location: "Mode Tanpa Kunci",
      temp: "--",
      condition: "API Key Missing",
      advice: "Silakan set API Key di dashboard Vercel."
    };
  }

  try {
    const prompt = `
      Saya driver ojek online. Koordinat: ${lat}, ${lng}.
      Cari cuaca REAL-TIME saat ini di lokasi tersebut menggunakan Google Search.
      Berikan output JSON sesuai schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: weatherSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const data = JSON.parse(text);
    saveToCache(cacheKey, data);
    return data;

  } catch (error) {
    console.error("Gemini Weather Error:", error);
    const staleItem = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if(staleItem) return JSON.parse(staleItem).data;

    return {
      location: "Lokasi Offline",
      temp: "--",
      condition: "Tidak Terdeteksi",
      advice: "Pastikan internet stabil dan jas hujan siap."
    };
  }
};

export const getSmartAssistantAnalysis = async (
  currentOrders: number, 
  currentRevenue: number, 
  targetOrders: number, 
  targetRevenue: number
) => {
  const cacheKey = 'daily_motivation';
  const cached = getFromCache(cacheKey, 4 * 60 * 60 * 1000); 
  if (cached) return cached;
  
  if (!API_KEY) return "Set API Key di Vercel untuk mengaktifkan asisten pintar.";

  try {
    const prompt = `
      Peran: Asisten pribadi driver ojol (Sonan).
      Status: Order ${currentOrders}/${targetOrders}, Pendapatan Rp ${currentRevenue}/Rp ${targetRevenue}.
      Jam: ${new Date().toLocaleTimeString('id-ID')}.
      Tugas: Berikan 1 kalimat motivasi singkat, padat, gaya 'jalanan' yang membakar semangat.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 50,
      }
    });

    const result = response.text || "Gas terus, rejeki gak akan lari!";
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    return "Fokus jalan, rejeki sudah diatur!";
  }
};

export const getFinancialConsultation = async (
  revenue: number,
  expenses: number,
  targetRevenue: number,
  maintenanceFund: number,
  cleanProfit: number
) => {
  if (!API_KEY) return "Fitur Konsultan butuh API Key.";

  try {
    const prompt = `
      Peran: Konsultan Keuangan Pribadi (Sonan) untuk Driver Ojek Online.
      Data Keuangan:
      - Pendapatan: Rp ${revenue}
      - Pengeluaran: Rp ${expenses}
      - Target: Rp ${targetRevenue}
      - Dana Service: Rp ${maintenanceFund}
      - Jatah Rumah/Bersih: Rp ${cleanProfit}

      Berikan saran keuangan singkat (maksimal 2 kalimat) yang bijak tapi santai untuk driver.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 100,
      }
    });

    return response.text || "Keuangan aman, tetap semangat!";
  } catch (error) {
    return "Dompet aman, gaspol terus!";
  }
};

export const findGacorSpots = async (lat: number, lng: number): Promise<GacorSpot[]> => {
  const cacheKey = `spots_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const cached = getFromCache(cacheKey, SPOTS_TTL);
  if (cached) {
      console.log("Using Cached Spots");
      return cached;
  }

  if (!API_KEY) {
      return [{
        name: "Mode Tanpa API Key",
        type: "SYSTEM",
        reason: "Mohon setting API Key di Vercel Settings.",
        distance: "-",
        priority: "SEDANG",
        source: 'AI'
      }];
  }

  const now = new Date();
  const day = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  try {
    const prompt = `
      Peran: Senior Driver Ojol Motor (Maxim/Gojek/Grab) berpengalaman 10 tahun.
      Lokasi Driver: Lat ${lat}, Lng ${lng}.
      Waktu Sekarang: Hari ${day}, Jam ${time}.

      Tugas:
      1. Cari tempat ramai terdekat menggunakan Google Search.
      2. Filter tempat yang cocok untuk Ojek Online Motor (Bukan mobil).
      3. Fokus pada: Sekolah/Kampus, Pasar, Stasiun KRL/MRT, dan Area Kos-kosan.
      4. Hindari tol atau area yang sulit akses motor.

      Berikan 3-4 rekomendasi titik ngetem.
      Output JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: spotSchema,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const result = JSON.parse(text).spots.map((s: any) => ({
        ...s,
        source: 'AI'
    }));
    
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Gacor Spot Error:", error);
    return [
      {
        name: "Pasar / Minimarket Terdekat",
        type: "UMUM",
        reason: "Sinyal AI sedang gangguan, geser ke pusat keramaian manual.",
        distance: "Sekitar Sini",
        priority: "SEDANG",
        source: 'AI'
      }
    ];
  }
};

export const getDriverStrategy = async (category: 'TEKNIS' | 'MARKETING' | 'MENTAL'): Promise<StrategyTip[]> => {
    const cacheKey = `strategy_${category}`;
    const cached = getFromCache(cacheKey, STRATEGY_TTL);
    if(cached) return cached;

    if (!API_KEY) {
        return [{
            title: "Setup API Key",
            content: "Untuk mendapatkan strategi jitu, Anda harus memasukkan API Key di pengaturan Vercel.",
            category: category,
            difficulty: "PEMULA"
        }];
    }

    try {
        const prompt = `
            Peran: Kamu adalah 'Suhu' Driver Maxim yang sudah 10 tahun narik DAN seorang Pakar Marketing Jalanan.
            Tugas: Berikan 3 Tips & Trik SANGAT SPESIFIK untuk kategori: ${category}.
            
            Panduan Konten:
            - Jika kategori TEKNIS: Bahas tentang PTO, Filter Auto, Jarak Antar, atau Setting HP.
            - Jika kategori MARKETING: Bahas "Personal Branding", cara chat, penampilan, atau cara minta bintang 5.
            - Jika kategori MENTAL: Bahas manajemen emosi saat anyep.

            Format: JSON only.
            Gaya Bahasa: Santai, tegas, to the point (Bahasa Driver Lapangan).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: strategySchema,
            },
        });

        const text = response.text;
        if(!text) return [];

        const result = JSON.parse(text).tips;
        saveToCache(cacheKey, result);
        return result;

    } catch (error) {
        return [
            {
                title: "Mode Offline",
                content: "Tidak dapat terhubung ke server strategi. Pastikan kuota internet aman.",
                category: category,
                difficulty: "PEMULA"
            }
        ];
    }
};

export const getAnyepSolution = async (lat: number, lng: number) => {
  if (!API_KEY) return "Dokter Anyep sedang cuti (Cek API Key Vercel).";

  try {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const prompt = `
      [URGENT] Saya Driver Ojek Motor Online (Maxim/Gojek).
      Lokasi: Lat ${lat}, Lng ${lng}.
      Jam Sekarang: ${time}.
      Masalah: Orderan ANYEP (Sepi) total.

      Tugas AI:
      1. Gunakan Google Search untuk cek "Keramaian Real-time" di sekitar lokasi ini (Radius 1-2 KM). 
      2. Cari tahu apakah ada jadwal kedatangan kereta (KRL/LRT), bubaran pabrik/kantor, atau jam istirahat sekolah/kampus SAAT INI.
      3. Berikan 1 (SATU) instruksi pergerakan taktis.
      
      Format Jawaban: Langsung instruksi (Maksimal 20 kata). 
      Contoh: "Geser ke Stasiun Tebet Pintu Barat, KRL Bogor baru turun 5 menit lagi."
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        maxOutputTokens: 60,
      }
    });

    return response.text || "Sinyal sepi. Coba geser ke minimarket terdekat untuk refresh titik GPS.";
  } catch (error) {
    return "Gagal diagnosa. Geser ke area pasar atau jalan raya utama.";
  }
};
