
import { StrategyTip } from "../types";

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  type: string;
  zone: string;
  notes: string; 
  bestHours: number[]; 
  specificDays?: number[]; 
}

export const LOCATIONS_DB: LocationData[] = [
  { lat: -6.9205, lng: 107.6200, name: "Toko Tiga Jl. Jendral Ahmad Yani", type: "COMMERCIAL", zone: "Pusat Kota - Kosambi", notes: "Area pertokoan ramai sore hari saat tutup toko/pulang kerja.", bestHours: [16, 17], specificDays: [4] },
  { lat: -6.9080, lng: 107.6250, name: "Doublesteak Bengawan (Cihapit)", type: "CULINARY", zone: "Riau - Cihapit", notes: "Spot kuliner, potensi orderan food tinggi saat jam makan siang.", bestHours: [12, 13], specificDays: [4] },
  { lat: -6.9380, lng: 107.6450, name: "RSJP Paramarta Soekarno Hatta", type: "HEALTH", zone: "Soekarno Hatta - Binong", notes: "Rumah sakit/perkantoran, ramai kunjungan pagi.", bestHours: [8, 9, 10], specificDays: [4] },
  { lat: -6.9320, lng: 107.6300, name: "Gerai Tiki 084 Martanegara", type: "LOGISTICS", zone: "Turangga - Martanegara", notes: "Logistik/Ekspedisi biasanya ramai pengiriman siang hari.", bestHours: [13, 14, 15], specificDays: [4] },
  { lat: -6.9250, lng: 107.6550, name: "Jl. Cidurian Utara (Sukapura)", type: "RESIDENTIAL", zone: "Kiaracondong - Sukapura", notes: "Area padat penduduk, orderan berangkat kerja/sekolah.", bestHours: [7, 8], specificDays: [4] },
  { lat: -6.8955, lng: 107.6610, name: "Gudang Kopi Jatihandap Timur", type: "HANGOUT", zone: "Jatihandap", notes: "Spot santai sore atau ambil kendaraan setelah cuci.", bestHours: [16, 17, 18], specificDays: [4] },
  { lat: -6.9350, lng: 107.5750, name: "Cahaya Plastik Ps. Induk Caringin", type: "MARKET", zone: "Caringin", notes: "Pasar Induk Caringin adalah hotspot Dini Hari.", bestHours: [2, 3, 4, 5], specificDays: [4] },
  { lat: -6.9650, lng: 107.5900, name: "PT. Tirta Makmur (Kavling Manglid)", type: "INDUSTRIAL", zone: "Margahayu", notes: "Kawasan pabrik/PT, hotspot jemput karyawan pulang kerja.", bestHours: [16, 17, 18], specificDays: [4] },
  { lat: -6.9200, lng: 107.7150, name: "Mie Gacoan Cibiru", type: "CULINARY", zone: "Cibiru", notes: "Spot antrian panjang, sangat ramai saat makan siang.", bestHours: [11, 12, 13], specificDays: [4] },
  { lat: -6.9220, lng: 107.5980, name: "Jl. Cibadak (Kuliner Malam)", type: "CULINARY NIGHT", zone: "Pusat Kota - Cibadak", notes: "Cibadak adalah pusat kuliner malam (Street Food) Bandung.", bestHours: [19, 20, 21], specificDays: [3] },
  { lat: -6.9350, lng: 107.5750, name: "Serunai Collection Caringin", type: "COMMERCIAL", zone: "Caringin - Holis", notes: "Area tekstil/gudang, aktif jam kerja.", bestHours: [12, 13, 14], specificDays: [3] },
  { lat: -6.9320, lng: 107.6800, name: "Apotek Al Fattah 2 Cingised", type: "HEALTH", zone: "Cisaranten - Cingised", notes: "Pembelian obat sering terjadi di malam hari.", bestHours: [19, 20, 21], specificDays: [3] },
  { lat: -6.9200, lng: 107.6400, name: "Toko Megaria Plastik (Stasiun)", type: "COMMERCIAL", zone: "Stasiun Kiaracondong", notes: "Area stasiun sangat sibuk di jam keberangkatan pagi.", bestHours: [7, 8], specificDays: [3] },
  { lat: -6.9020, lng: 107.6520, name: "UPT Puskesmas Padasuka", type: "HEALTH", zone: "Cicaheum - Padasuka", notes: "Layanan kesehatan ramai di pagi hari.", bestHours: [8, 9, 10], specificDays: [2] },
  { lat: -6.9420, lng: 107.6230, name: "SMK Bina Warga Buah Batu", type: "EDUCATION", zone: "Buah Batu", notes: "Jam pulang sekolah tingkat SMK/SMA.", bestHours: [14, 15, 16], specificDays: [2] },
  { lat: -6.8900, lng: 107.6000, name: "AMP FK Unpad (Eijkman)", type: "EDUCATION", zone: "Sukajadi - Sederhana", notes: "Aktivitas kampus/akademik pagi hari.", bestHours: [7, 8, 9], specificDays: [2] },
  { lat: -6.8980, lng: 107.6360, name: "Seafood Bang Bopak Pahlawan", type: "CULINARY", zone: "Pahlawan - Katamso", notes: "Restoran seafood biasanya puncak keramaian saat makan malam.", bestHours: [18, 19, 20], specificDays: [1] },
  { lat: -6.8900, lng: 107.6150, name: "SDN 103 Coblong", type: "EDUCATION", zone: "Dago - Coblong", notes: "Hotspot sekolah sangat spesifik di jam antar (06:30-07:00).", bestHours: [6, 7], specificDays: [1] },
  { lat: -6.9000, lng: 107.6350, name: "Itenas (Institut Teknologi Nasional)", type: "EDUCATION", zone: "Suci - Itenas", notes: "Jam bubaran kuliah sore.", bestHours: [15, 16, 17], specificDays: [1] },
  { lat: -6.9150, lng: 107.6420, name: "Jl. H. Ibrahim Adjie (Kebonwaru)", type: "RESIDENTIAL", zone: "Kiaracondong - Kebonwaru", notes: "Area transit padat dan toko kelontong.", bestHours: [10, 11, 12], specificDays: [0] },
  { lat: -6.9100, lng: 107.6700, name: "Lapas Sukamiskin", type: "FACILITY", zone: "Arcamanik - Sukamiskin", notes: "Jam kunjungan fasilitas umum biasanya pagi menjelang siang.", bestHours: [9, 10, 11], specificDays: [0] },
  { lat: -6.9350, lng: 107.6300, name: "Mie Gacoan Gatsu", type: "CULINARY", zone: "Lengkong - Gatsu", notes: "Spot kuliner populer, Minggu malam sangat padat.", bestHours: [18, 19, 20], specificDays: [0] },
  { lat: -6.9350, lng: 107.5750, name: "UD Sutrisno - Pasar Caringin", type: "MARKET", zone: "Caringin", notes: "Aktivitas pasar tradisional/induk pagi buta.", bestHours: [4, 5, 6], specificDays: [0] },
  { lat: -6.9180, lng: 107.6480, name: "Masjid Jami Nurul Falah", type: "RESIDENTIAL", zone: "Babakan Sari", notes: "Aktivitas warga sore hari di kawasan padat.", bestHours: [15, 16], specificDays: [6] },
  { lat: -6.9200, lng: 107.6400, name: "Stasiun Kiaracondong (Kedatangan)", type: "TRANSPORT", zone: "Stasiun Kiaracondong", notes: "Kedatangan kereta ekonomi/lokal sering terjadi sore hari.", bestHours: [15, 16, 17], specificDays: [6] },
  { lat: -6.9250, lng: 107.6500, name: "Pos Honda Jl. PSM", type: "SERVICE", zone: "Kiaracondong - Sukapura", notes: "Bengkel/Pos sering ramai setelah Jumatan.", bestHours: [13, 14], specificDays: [5] },
  { lat: -6.9320, lng: 107.7700, name: "Jatinangor Town Square (Jatos)", type: "MALL", zone: "Jatinangor", notes: "Pusat keramaian mahasiswa Jatinangor (Unpad/ITB/Ikopin) di malam hari.", bestHours: [18, 19, 20], specificDays: [5] },
  { lat: -6.9250, lng: 107.6360, name: "Trans Studio Mall (TSM)", type: "MALL", zone: "Gatot Subroto - TSM", notes: "Jumat malam adalah peak hour bubaran mall/nonton.", bestHours: [19, 20, 21], specificDays: [5] },
  { lat: -6.9200, lng: 107.6800, name: "Perumahan Arcamanik Urban Living", type: "RESIDENTIAL", zone: "Arcamanik", notes: "Warga berangkat kerja dari perumahan.", bestHours: [7, 8], specificDays: [5] },
  { lat: -6.9261, lng: 107.7176, name: "Bundaran Cibiru / UIN", type: "EDUCATION", zone: "Cibiru", notes: "Titik temu mahasiswa dan pekerja timur.", bestHours: [6, 7, 16, 17] },
  { lat: -6.9126, lng: 107.6024, name: "Stasiun Bandung (Pintu Selatan)", type: "TRANSPORT", zone: "Pusat Kota", notes: "Selalu ramai saat kedatangan kereta Jakarta.", bestHours: [9, 10, 15, 16, 19] },
  { lat: -6.8927, lng: 107.6171, name: "Dipatiukur (Unpad/ITHB)", type: "EDUCATION", zone: "Dago", notes: "Pusat travel dan mahasiswa.", bestHours: [8, 17, 19] },
  { lat: -6.9472, lng: 107.6033, name: "Terminal Leuwipanjang", type: "TRANSPORT", zone: "Selatan", notes: "Bus AKAP dan Damri.", bestHours: [5, 6, 17] }
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
