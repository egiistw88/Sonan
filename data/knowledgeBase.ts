
import { GacorSpot, StrategyTip } from "../types";

interface LocationData {
  lat: number;
  lng: number;
  name: string;
  type: string;
  tags: string[]; // TIMUR, BARAT, PUSAT, UTARA, SELATAN
  bestHours: number[]; // Jam-jam gacor (misal [6, 7, 16, 17])
}

// DATABASE LENGKAP BANDUNG 2025
export const LOCATIONS_DB: LocationData[] = [
  // --- ZONA 1: TIMUR (HUNI & INDUSTRI) ---
  { lat: -6.9261, lng: 107.7176, name: "Bundaran Cibiru / UIN", type: "MAHASISWA", tags: ["TIMUR"], bestHours: [5, 6, 7, 16, 17] },
  { lat: -6.9135, lng: 107.6625, name: "Terminal Antapani", type: "PERUMAHAN", tags: ["TIMUR"], bestHours: [5, 6, 7] },
  { lat: -6.9234, lng: 107.6756, name: "Arcamanik Sport Center", type: "PERUMAHAN", tags: ["TIMUR"], bestHours: [6, 7, 16] },
  { lat: -6.9459, lng: 107.7032, name: "Masjid Al-Jabbar", type: "WISATA", tags: ["TIMUR"], bestHours: [15, 16, 17, 18] }, // Weekend heavy
  { lat: -6.9317, lng: 107.7735, name: "Unpad Jatinangor (Gerbang Lama)", type: "KAMPUS", tags: ["TIMUR"], bestHours: [7, 8, 16, 17] },
  { lat: -6.9380, lng: 107.7280, name: "Pabrik Kahatex (Rancaekek)", type: "INDUSTRI", tags: ["TIMUR"], bestHours: [14, 15, 22, 23] },
  { lat: -6.9583, lng: 107.6890, name: "Summarecon Bandung", type: "MALL", tags: ["TIMUR"], bestHours: [11, 12, 18, 19] },

  // --- ZONA 2: TENGAH (KANTOR & BISNIS) ---
  { lat: -6.9210, lng: 107.6106, name: "Asia Afrika / Alun-alun", type: "WISATA", tags: ["PUSAT"], bestHours: [9, 10, 16, 17, 18, 19] },
  { lat: -6.9247, lng: 107.6152, name: "Lengkong Kecil (Kuliner)", type: "KULINER", tags: ["PUSAT"], bestHours: [18, 19, 20, 21, 22] },
  { lat: -6.9140, lng: 107.6101, name: "Balai Kota / BEC", type: "KANTOR", tags: ["PUSAT"], bestHours: [8, 9, 16, 17] },
  { lat: -6.9126, lng: 107.6024, name: "Stasiun Bandung (Pintu Selatan)", type: "STASIUN", tags: ["PUSAT"], bestHours: [8, 9, 15, 18, 19] },
  { lat: -6.9172, lng: 107.6187, name: "Jalan Riau (FO & Cafe)", type: "WISATA", tags: ["PUSAT"], bestHours: [11, 12, 13, 19, 20] },
  { lat: -6.9205, lng: 107.6335, name: "Trans Studio Mall (TSM)", type: "MALL", tags: ["PUSAT"], bestHours: [12, 13, 20, 21] },

  // --- ZONA 3: UTARA (PENDIDIKAN & ELIT) ---
  { lat: -6.8927, lng: 107.6171, name: "Dipatiukur (Unpad/ITHB)", type: "KAMPUS", tags: ["UTARA"], bestHours: [8, 9, 12, 13, 17, 18] },
  { lat: -6.8915, lng: 107.6107, name: "Gerbang Depan ITB", type: "KAMPUS", tags: ["UTARA"], bestHours: [8, 16, 17] },
  { lat: -6.8922, lng: 107.5959, name: "PVJ Mall", type: "MALL", tags: ["UTARA"], bestHours: [12, 13, 19, 20, 21] },
  { lat: -6.8624, lng: 107.5936, name: "Setiabudi (Arah Lembang)", type: "WISATA", tags: ["UTARA"], bestHours: [9, 10, 15, 16] },
  { lat: -6.8865, lng: 107.5810, name: "Universitas Maranatha", type: "KAMPUS", tags: ["UTARA"], bestHours: [8, 15, 16] },
  { lat: -6.9034, lng: 107.6056, name: "Cihampelas Walk (Ciwalk)", type: "MALL", tags: ["UTARA"], bestHours: [12, 19, 20] },
  { lat: -6.8800, lng: 107.6145, name: "Dago Simpang", type: "FOOD", tags: ["UTARA"], bestHours: [11, 12, 18, 19] },

  // --- ZONA 4: BARAT (INDUSTRI & GERBANG) ---
  { lat: -6.8988, lng: 107.5372, name: "Cimahi / Leuwigajah", type: "INDUSTRI", tags: ["BARAT"], bestHours: [6, 7, 14, 15, 22] },
  { lat: -6.9419, lng: 107.5756, name: "Pasar Induk Caringin", type: "PASAR", tags: ["BARAT"], bestHours: [2, 3, 4, 5] },
  { lat: -6.8415, lng: 107.4764, name: "Stasiun Whoosh Padalarang", type: "STASIUN", tags: ["BARAT"], bestHours: [9, 10, 13, 17] },
  { lat: -6.8938, lng: 107.5815, name: "Pasteur / BTC", type: "TRAVEL", tags: ["BARAT"], bestHours: [5, 6, 18, 19] },
  { lat: -6.9083, lng: 107.5612, name: "Borma Cijerah", type: "BELANJA", tags: ["BARAT"], bestHours: [10, 11, 16, 17] },

  // --- ZONA 5: SELATAN (PERMUKIMAN PADAT) ---
  { lat: -6.9472, lng: 107.6033, name: "Terminal Leuwipanjang", type: "TERMINAL", tags: ["SELATAN"], bestHours: [5, 6, 17, 18] },
  { lat: -6.9367, lng: 107.5966, name: "RS Immanuel / Kopo", type: "RS", tags: ["SELATAN"], bestHours: [7, 8, 14, 15] },
  { lat: -6.9490, lng: 107.6320, name: "Buah Batu (Griya)", type: "BELANJA", tags: ["SELATAN"], bestHours: [11, 12, 16, 17] },
  { lat: -6.9740, lng: 107.6305, name: "Telkom University", type: "KAMPUS", tags: ["SELATAN"], bestHours: [7, 8, 16, 17] },
  { lat: -6.9175, lng: 107.6186, name: "Dayeuhkolot / Banjir", type: "INDUSTRI", tags: ["SELATAN"], bestHours: [7, 16] }, // Warning zone

  // --- CADANGAN & NICHE ---
  { lat: -6.9175, lng: 107.6186, name: "SMA BPI / Taruna Bakti", type: "SEKOLAH", tags: ["PUSAT"], bestHours: [6, 13, 14] },
  { lat: -6.9098, lng: 107.6163, name: "SMAN 3 & 5 Bandung", type: "SEKOLAH", tags: ["PUSAT"], bestHours: [15, 16] },
  { lat: -6.9159, lng: 107.5986, name: "RS Santosa (Kebon Jati)", type: "RS", tags: ["PUSAT"], bestHours: [7, 11, 12] },
  { lat: -6.8942, lng: 107.6146, name: "RS Borromeus", type: "RS", tags: ["UTARA"], bestHours: [8, 9, 14, 15] },
  { lat: -6.9083, lng: 107.6010, name: "RS Mata Cicendo", type: "RS", tags: ["PUSAT"], bestHours: [7, 8, 9] },
  { lat: -6.8953, lng: 107.6163, name: "Pool Cititrans Dipatiukur", type: "TRAVEL", tags: ["UTARA"], bestHours: [5, 18, 19] },
  { lat: -6.9056, lng: 107.6044, name: "Pool XTrans Cihampelas", type: "TRAVEL", tags: ["UTARA"], bestHours: [14, 15, 19] },
  { lat: -6.9022, lng: 107.6136, name: "Roti Gempol", type: "KULINER", tags: ["PUSAT"], bestHours: [7, 8, 9] },
  { lat: -6.8485, lng: 107.6225, name: "Punclut", type: "WISATA", tags: ["UTARA"], bestHours: [10, 11, 15, 16] }
];

export const STATIC_STRATEGIES: StrategyTip[] = [
  {
    title: "Pola Golden Hour Sore",
    content: "Jam 16:00 - 19:00 adalah emas. Standby di area perkantoran (Asia Afrika, Dago, Gedung Sate). Arah orderan biasanya 'Pulang ke Timur/Selatan'. Jangan lawan arus.",
    category: "MARKETING",
    difficulty: "PEMULA"
  },
  {
    title: "Jebakan Zona Mati",
    content: "Hindari Jl. Rajawali/Andir jam 04:00-07:00 (Pasar tumpah, macet total). Hindari Gedebage saat hujan deras (banjir cileuncang, motor mogok).",
    category: "TEKNIS",
    difficulty: "SENIOR"
  },
  {
    title: "Teknik 'Grid System'",
    content: "Jangan diam di satu titik. Gunakan sistem Jaring Laba-laba. Drop penumpang -> Scan radius 500m (5 menit) -> Geser perlahan ke titik Niche terdekat (misal ke Jl. Purnawarman cari anak Bimbel).",
    category: "TEKNIS",
    difficulty: "SENIOR"
  },
  {
    title: "Mindset Pemenang",
    content: "Husnut tadbir nishful ma'isyah: Perencanaan yang baik adalah setengah dari penghidupan. Dokumen ini bukan jimat, tapi peta jalan agar tidak buang bensin percuma.",
    category: "MENTAL",
    difficulty: "PEMULA"
  },
  {
    title: "Adab Bawa Rezeki",
    content: "Haqqut Thariq: Jangan parkir bergerombol memakan bahu jalan. Jujur: Jangan pakai fake GPS. Layanan: Sediakan helm bersih & wangi.",
    category: "MENTAL",
    difficulty: "PEMULA"
  },
  {
    title: "Klaster Sekolah Elit",
    content: "Kawasan Darul Hikam (Dago Atas) sering macet, orang tua sering orderkan Maxim Bike untuk anaknya agar cepat sampai rumah. Standby jam 13:00 - 15:00.",
    category: "MARKETING",
    difficulty: "SENIOR"
  },
  {
    title: "Kunci Rating Bintang 5",
    content: "Selalu sapa penumpang dengan nama. Sediakan masker cadangan atau permen. Jika hujan, tawarkan berteduh dulu atau lanjut (sesuai kesepakatan).",
    category: "MARKETING",
    difficulty: "PEMULA"
  },
  {
    title: "Manajemen Order Food",
    content: "Saat dapat order food, chat resto dulu 'Pesanan sudah siap?'. Jika antri panjang (>30mnt), kabari customer. Jangan cancel sepihak biar performa aman.",
    category: "TEKNIS",
    difficulty: "SENIOR"
  }
];

export const MOTIVATION_QUOTES = [
  "Mengubah Lelah Menjadi Lillah, Mengubah Waktu Menjadi Rupiah.",
  "Rezeki tidak akan tertukar, tapi ia harus dijemput dengan ikhtiar yang benar.",
  "Jangan lawan arus, tapi tunggangi arus.",
  "Fokus: Wisata & Kuliner (Santai tapi Pasti).",
  "Sebaik-baik strategi adalah yang fleksibel mengikuti keadaan, bukan yang kaku melawan kenyataan.",
  "Motor boleh tua, semangat harus muda. Service rutin adalah kunci cuan lancar.",
  "Sabar di jalan, gaspol di rezeki. Emosi hanya bikin orderan lari.",
  "Bukan tentang seberapa cepat, tapi seberapa tepat kita ada di lokasi."
];

// Compatibility export for existing code using object keys
export const LOCATIONS = {
  ASIA_AFRIKA: { lat: -6.9210, lng: 107.6106 },
  TERMINAL_ANTAPANI: { lat: -6.9135, lng: 107.6625 },
  ARCAMANIK_SPORT: { lat: -6.9234, lng: 107.6756 },
  CIBIRU_UIN: { lat: -6.9261, lng: 107.7176 },
  LEUWIGAJAH: { lat: -6.8988, lng: 107.5372 },
  SETIABUDI_ATAS: { lat: -6.8624, lng: 107.5936 },
  BALAI_KOTA: { lat: -6.9140, lng: 107.6101 },
  RS_SANTOSA: { lat: -6.9159, lng: 107.5986 },
  DIPATIUKUR: { lat: -6.8927, lng: 107.6171 },
  ROTI_GEMPOL: { lat: -6.9022, lng: 107.6136 },
  ITB_GANESHA: { lat: -6.8915, lng: 107.6107 },
  POOL_CITITRANS_DU: { lat: -6.8953, lng: 107.6163 },
  POOL_LINTAS_BTC: { lat: -6.8938, lng: 107.5815 },
  LENGKONG_KECIL: { lat: -6.9247, lng: 107.6152 },
  RS_IMMANUEL: { lat: -6.9367, lng: 107.5966 },
  PVJ_MALL: { lat: -6.8922, lng: 107.5959 },
  AL_JABBAR: { lat: -6.9459, lng: 107.7032 },
  PUNCLUT: { lat: -6.8485, lng: 107.6225 },
  STASIUN_BANDUNG: { lat: -6.9126, lng: 107.6024 }
};
