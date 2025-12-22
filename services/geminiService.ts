
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GacorSpot, StrategyTip } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SIMPLE CACHE SYSTEM ---
const CACHE_TTL = 15 * 60 * 1000; // 15 Menit untuk cuaca
let weatherCache: { data: any; timestamp: number; key: string } | null = null;
let motivationCache: string | null = null;
// Cache untuk spot agar tidak spam API jika lokasi tidak berubah jauh
let spotCache: { lat: number; lng: number; data: any; timestamp: number } | null = null;
// Cache strategi agar tidak request berulang untuk kategori yang sama dalam sesi singkat
const strategyCache: Record<string, StrategyTip[]> = {};

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
  // 1. Cek Cache (Hemat API Call)
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`; 
  if (weatherCache && 
      weatherCache.key === cacheKey && 
      (Date.now() - weatherCache.timestamp < CACHE_TTL)) {
    console.log("Using Cached Weather Data");
    return weatherCache.data;
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
    if (!text) throw new Error("Empty response from AI");
    
    const data = JSON.parse(text);
    
    // 2. Simpan ke Cache
    weatherCache = {
      data,
      timestamp: Date.now(),
      key: cacheKey
    };

    return data;

  } catch (error) {
    console.error("Gemini Weather Error:", error);
    // Return cached data if available (even if expired) on error, otherwise fallback
    if (weatherCache) return weatherCache.data;
    
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
  if (motivationCache) return motivationCache;

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
    motivationCache = result;
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
    console.error("Gemini Finance Error:", error);
    return "Dompet aman, gaspol terus!";
  }
};

export const findGacorSpots = async (lat: number, lng: number): Promise<GacorSpot[]> => {
  if (spotCache) {
    const dist = Math.sqrt(Math.pow(spotCache.lat - lat, 2) + Math.pow(spotCache.lng - lng, 2));
    const isClose = dist < 0.005; // ~500m
    const isFresh = (Date.now() - spotCache.timestamp) < (30 * 60 * 1000);
    
    if (isClose && isFresh) {
      console.log("Using Cached Spots");
      return spotCache.data;
    }
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
    
    // Update Cache
    spotCache = {
      lat,
      lng,
      data: result,
      timestamp: Date.now()
    };

    return result;
  } catch (error) {
    console.error("Gacor Spot Error:", error);
    // Fallback Static Data jika API Error
    return [
      {
        name: "Pasar / Minimarket Terdekat",
        type: "UMUM",
        reason: "Spot alternatif saat sinyal sulit.",
        distance: "Sekitar Sini",
        priority: "SEDANG",
        source: 'AI'
      }
    ];
  }
};

export const getDriverStrategy = async (category: 'TEKNIS' | 'MARKETING' | 'MENTAL'): Promise<StrategyTip[]> => {
    if (strategyCache[category]) return strategyCache[category];

    try {
        const prompt = `
            Peran: Kamu adalah 'Suhu' Driver Maxim yang sudah 10 tahun narik DAN seorang Pakar Marketing Jalanan.
            Tugas: Berikan 3 Tips & Trik SANGAT SPESIFIK untuk kategori: ${category}.
            
            Panduan Konten:
            - Jika kategori TEKNIS: Bahas tentang PTO (Penolakan Tugas Otomatis), Filter Auto, Jarak Antar, atau Setting HP (Gunakan istilah aplikasi Maxim).
            - Jika kategori MARKETING: Bahas "Personal Branding" driver, cara chat (script), penampilan, atau cara minta bintang 5 tanpa mengemis.
            - Jika kategori MENTAL: Bahas manajemen emosi saat anyep, atau cara menghadapi customer rewel.

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
        strategyCache[category] = result;
        return result;

    } catch (error) {
        console.error("Strategy AI Error", error);
        // Fallback Content
        return [
            {
                title: "Mode Offline / Fallback",
                content: "Sinyal AI sedang gangguan. Tips umum: Selalu cek tekanan ban dan pastikan saldo driver cukup untuk terima orderan besar.",
                category: category,
                difficulty: "PEMULA"
            }
        ];
    }
};

export const getAnyepSolution = async (lat: number, lng: number) => {
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
    console.error("Dokter Anyep Error:", error);
    return "Gagal diagnosa. Geser ke area pasar atau jalan raya utama.";
  }
};
