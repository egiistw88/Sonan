
export interface AcademyModule {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    content: {
        subtitle: string;
        body: string;
    }[];
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export const ACADEMY_MODULES: AcademyModule[] = [
    {
        id: 'algo_mastery',
        title: "Algoritma & Akun Gacor",
        description: "Cara kerja sistem pembagian order dan menjaga rating.",
        icon: "🤖",
        color: "bg-blue-600",
        content: [
            {
                subtitle: "Saldo adalah Kunci",
                body: "Sistem Maxim sangat memprioritaskan driver dengan saldo akun yang cukup. Jangan biarkan saldo minim (di bawah 50rb) karena sistem akan menganggap Anda tidak siap menerima orderan tunai besar/talangan."
            },
            {
                subtitle: "Konsistensi Jam On-Bid",
                body: "Algoritma menyukai pola. Jika Anda biasa on-bid jam 06:00, usahakan selalu konsisten. Sistem akan 'menandai' Anda sebagai driver aktif di jam tersebut."
            },
            {
                subtitle: "Bahaya Cancel & Pengabaian",
                body: "Terlalu sering skip order (autobid) atau cancel manual akan membekukan akun Anda dari prioritas selama 15-30 menit. Jika ingin istirahat, matikan status 'Bebas', jangan biarkan orderan lewat begitu saja."
            }
        ]
    },
    {
        id: 'service_excellent',
        title: "Pelayanan Bintang 5",
        description: "Teknik komunikasi dan handling customer.",
        icon: "⭐️",
        color: "bg-yellow-500",
        content: [
            {
                subtitle: "Sapaan Pertama",
                body: "Selalu konfirmasi via chat/telepon segera setelah mendapat order. 'Selamat pagi Kak [Nama], saya driver Maxim yang menuju ke sana. Mohon ditunggu ya.' Ini meningkatkan kepercayaan."
            },
            {
                subtitle: "Handling Penumpang Marah",
                body: "Jika penumpang marah karena lama menunggu, JANGAN DEBAT. Katakan: 'Maaf ya Kak tadi macet di [Lokasi], saya usahakan secepatnya sampai tujuan.' Emosi dibalas sabar = Bintang aman."
            },
            {
                subtitle: "Atribut & Kebersihan",
                body: "Helm bau adalah alasan utama bintang 1. Cuci busa helm seminggu sekali. Sediakan masker cadangan murah untuk penumpang, mereka akan sangat menghargainya."
            }
        ]
    },
    {
        id: 'technical_vehicle',
        title: "Perawatan Senjata (Motor)",
        description: "Tips agar motor awet dan irit bensin.",
        icon: "🛠️",
        color: "bg-red-600",
        content: [
            {
                subtitle: "Tekanan Ban = Bensin",
                body: "Ban yang kempes membuat tarikan berat dan boros bensin hingga 10%. Cek tekanan ban setiap 3 hari sekali. Nitrogen lebih disarankan karena tidak mudah panas."
            },
            {
                subtitle: "Oli Gardan (Matic)",
                body: "Sering dilupakan! Ganti oli gardan setiap 2x ganti oli mesin. Jika gardan rontok, biaya perbaikan bisa jutaan."
            },
            {
                subtitle: "CVT Gredek?",
                body: "Jangan biarkan CVT gredek. Itu tanda mangkok ganda kotor atau roller peyang. Segera servis sebelum merembet ke V-Belt putus di jalan."
            }
        ]
    },
    {
        id: 'safety_first',
        title: "Safety Riding & P3K",
        description: "Pulang dengan selamat adalah target utama.",
        icon: "⛑️",
        color: "bg-green-600",
        content: [
            {
                subtitle: "Blind Spot Truk",
                body: "Jangan pernah berada di samping kiri truk besar. Sopir tidak bisa melihat Anda. Jika ingin menyalip, pastikan ada ruang luas dan bunyikan klakson."
            },
            {
                subtitle: "Saat Hujan Deras",
                body: "Jalanan aspal yang baru basah (gerimis awal) LEBIH LICIN daripada saat hujan deras karena minyak aspal naik. Hati-hati di 10 menit pertama hujan."
            },
            {
                subtitle: "Begal & Area Rawan",
                body: "Jika lewat jalan sepi malam hari, jangan main HP di holder stang. Simpan di kantong jaket dalam. Kaca spion pastikan bersih untuk memantau yang membuntuti."
            }
        ]
    }
];

export const CHAT_TEMPLATES = [
    { label: "Konfirmasi OTW", text: "Siang Kak, orderan sudah masuk ya. Saya segera meluncur ke titik penjemputan. Mohon ditunggu. 🙏" },
    { label: "Resto Antri", text: "Mohon maaf Kak, antrian di resto lumayan panjang. Estimasi sekitar 15-20 menit lagi. Mohon kesabarannya ya Kak. 😊" },
    { label: "Hujan Deras", text: "Kak, posisi di sini hujan deras, saya neduh sebentar ya demi keamanan makanan/barang. Nanti agak reda saya langsung gas lagi. 🙏" },
    { label: "Barang Sampai (Gosend)", text: "Permisi, paket sudah saya titipkan di [Lokasi/Orang]. Terima kasih, semoga sehat selalu!" },
    { label: "Minta Bintang", text: "Terima kasih sudah menggunakan jasa saya Kak. Jika berkenan, mohon bantu rating bintang 5 nya ya. Sangat berarti buat akun saya. Sehat selalu! ⭐⭐⭐⭐⭐" }
];

export const QUIZ_DATA: QuizQuestion[] = [
    {
        id: 1,
        question: "Apa yang harus dilakukan jika Customer salah titik jemput cukup jauh?",
        options: [
            "Marah-marah dan minta cancel",
            "Minta customer jalan kaki ke titik map",
            "Chat sopan konfirmasi posisi asli, lalu jemput jika wajar",
            "Langsung nyalakan argo walau belum sampai"
        ],
        correctIndex: 2,
        explanation: "Komunikasi adalah kunci. Jika jarak wajar (<500m), jemput saja demi pelayanan. Jika jauh, minta customer re-order dengan sopan."
    },
    {
        id: 2,
        question: "Berapa minimal saldo di akun driver agar 'Gacor' di sistem prioritas?",
        options: [
            "Rp 5.000",
            "Rp 10.000",
            "Disarankan > Rp 50.000",
            "Rp 0 juga bisa"
        ],
        correctIndex: 2,
        explanation: "Sistem memprioritaskan driver yang sanggup menerima orderan tunai (potong saldo) dan orderan talangan food."
    },
    {
        id: 3,
        question: "Saat mengantar Food, apa SOP paling penting sebelum jalan?",
        options: [
            "Minta makanan gratis ke resto",
            "Cek ulang struk dan kelengkapan item pesanan",
            "Langsung gaspol biar cepat",
            "Minta tip di awal"
        ],
        correctIndex: 1,
        explanation: "Kesalahan item adalah komplain terbanyak. Selalu cek struk vs makanan fisik sebelum meninggalkan resto."
    },
    {
        id: 4,
        question: "Jika hujan turun, strategi apa yang paling cuan?",
        options: [
            "Pulang tidur",
            "Berteduh di warkop",
            "Pakai jas hujan, fokus orderan Food/Delivery",
            "Nyalakan tuyul"
        ],
        correctIndex: 2,
        explanation: "Saat hujan, driver lain berteduh (saingan sedikit) dan orderan Food meningkat pesat. Ini adalah momen panen."
    }
];
