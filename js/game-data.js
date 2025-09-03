// Energy Quest: Game Data
// Quiz questions database dengan kategori untuk Fisher-Yates shuffle

const QUIZ_QUESTIONS = [
    // Basic Electricity Questions
    {
        id: 1,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.BASIC_ELECTRICITY,
        question: "Apa yang dimaksud dengan rangkaian listrik tertutup?",
        answers: [
            "Rangkaian yang tidak memiliki saklar",
            "Rangkaian dimana arus dapat mengalir dari positif ke negatif",
            "Rangkaian yang selalu menyala",
            "Rangkaian yang tidak menggunakan kabel"
        ],
        correctAnswer: 1,
        explanation: "Rangkaian tertutup memungkinkan arus listrik mengalir dari kutub positif ke negatif sumber tegangan."
    },
    {
        id: 2,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.BASIC_ELECTRICITY,
        question: "Fungsi utama saklar dalam rangkaian listrik adalah?",
        answers: [
            "Menambah tegangan",
            "Memutus atau menghubungkan arus listrik",
            "Mengurangi daya",
            "Menyimpan energi"
        ],
        correctAnswer: 1,
        explanation: "Saklar berfungsi untuk memutus atau menghubungkan aliran arus listrik dalam rangkaian."
    },
    {
        id: 3,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.BASIC_ELECTRICITY,
        question: "Satuan untuk mengukur daya listrik adalah?",
        answers: ["Volt", "Ampere", "Watt", "Ohm"],
        correctAnswer: 2,
        explanation: "Watt adalah satuan untuk mengukur daya listrik. Semakin tinggi watt, semakin besar konsumsi energi."
    },
    {
        id: 4,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.BASIC_ELECTRICITY,
        question: "Apa yang terjadi jika rangkaian listrik terbuka?",
        answers: [
            "Arus mengalir dengan lancar",
            "Arus tidak mengalir",
            "Tegangan naik",
            "Daya bertambah"
        ],
        correctAnswer: 1,
        explanation: "Pada rangkaian terbuka, arus tidak dapat mengalir karena tidak ada jalur tertutup."
    },
    {
        id: 5,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.BASIC_ELECTRICITY,
        question: "Komponen apa yang berfungsi sebagai sumber energi dalam rangkaian sederhana?",
        answers: ["Lampu", "Kabel", "Baterai", "Saklar"],
        correctAnswer: 2,
        explanation: "Baterai berfungsi sebagai sumber energi listrik dalam rangkaian sederhana."
    },

    // Energy Efficiency Questions
    {
        id: 6,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_EFFICIENCY,
        question: "Cara terbaik menghemat energi di siang hari adalah?",
        answers: [
            "Menyalakan semua lampu",
            "Menutup semua jendela",
            "Memanfaatkan cahaya alami",
            "Menggunakan AC terus-menerus"
        ],
        correctAnswer: 2,
        explanation: "Memanfaatkan cahaya alami dari jendela dapat mengurangi penggunaan lampu di siang hari."
    },
    {
        id: 7,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_EFFICIENCY,
        question: "Mengapa pintu kulkas harus ditutup dengan cepat?",
        answers: [
            "Agar makanan tidak basi",
            "Untuk menghemat energi listrik",
            "Agar kulkas tidak rusak",
            "Semua jawaban benar"
        ],
        correctAnswer: 3,
        explanation: "Semua jawaban benar. Menutup kulkas dengan cepat menghemat energi dan menjaga kualitas makanan."
    },
    {
        id: 8,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_EFFICIENCY,
        question: "Perangkat mana yang paling boros energi di rumah?",
        answers: [
            "Lampu LED 10W",
            "Kipas angin 75W",
            "AC 1500W",
            "Charger HP 20W"
        ],
        correctAnswer: 2,
        explanation: "AC mengonsumsi energi paling besar (1500W) dibanding perangkat lainnya."
    },
    {
        id: 9,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_EFFICIENCY,
        question: "Cara terbaik menggunakan rice cooker yang hemat energi?",
        answers: [
            "Dibiarkan menyala terus",
            "Digunakan mode hemat energi",
            "Dimatikan saat memasak",
            "Dipanaskan berkali-kali"
        ],
        correctAnswer: 1,
        explanation: "Mode hemat energi pada rice cooker mengurangi konsumsi listrik setelah nasi matang."
    },
    {
        id: 10,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_EFFICIENCY,
        question: "Mengapa lampu LED lebih hemat energi dari lampu pijar?",
        answers: [
            "Lebih terang",
            "Konsumsi daya lebih rendah",
            "Lebih murah",
            "Tahan lama"
        ],
        correctAnswer: 1,
        explanation: "Lampu LED mengonsumsi daya jauh lebih rendah (10W) dibanding lampu pijar (60W) untuk tingkat kecerahan yang sama."
    },

    // Energy Calculation Questions
    {
        id: 11,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_CALCULATION,
        question: "Lampu 60W menyala 8 jam/hari. Berapa konsumsi energi hariannya?",
        answers: ["0.48 kWh", "4.8 kWh", "48 kWh", "480 kWh"],
        correctAnswer: 0,
        explanation: "E = (60 × 8) / 1000 = 0.48 kWh per hari"
    },
    {
        id: 12,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_CALCULATION,
        question: "Jika tarif listrik Rp1.467/kWh, berapa biaya TV 200W yang menyala 6 jam/hari selama sebulan?",
        answers: ["Rp52.812", "Rp105.624", "Rp158.436", "Rp211.248"],
        correctAnswer: 0,
        explanation: "E = (200 × 6 × 30) / 1000 = 36 kWh. Biaya = 36 × 1.467 = Rp52.812"
    },
    {
        id: 13,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_CALCULATION,
        question: "Setrika 1000W digunakan 1 jam/hari. Berapa biaya bulanannya jika tarif Rp1.467/kWh?",
        answers: ["Rp44.010", "Rp22.005", "Rp66.015", "Rp88.020"],
        correctAnswer: 0,
        explanation: "E = (1000 × 1 × 30) / 1000 = 30 kWh. Biaya = 30 × 1.467 = Rp44.010"
    },
    {
        id: 14,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ENERGY_CALCULATION,
        question: "Jika target tagihan Rp300.000 dengan tarif Rp1.467/kWh, berapa maksimal konsumsi bulanan?",
        answers: ["204.5 kWh", "245.6 kWh", "189.3 kWh", "167.8 kWh"],
        correctAnswer: 0,
        explanation: "Konsumsi maksimal = 300.000 / 1.467 = 204.5 kWh per bulan"
    },

    // Electrical Safety Questions
    {
        id: 15,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ELECTRICAL_SAFETY,
        question: "Yang harus dilakukan jika ada konsleting listrik?",
        answers: [
            "Menyiram dengan air",
            "Matikan saklar utama dulu",
            "Memegang kabel langsung",
            "Membiarkannya"
        ],
        correctAnswer: 1,
        explanation: "Matikan saklar utama (MCB) terlebih dahulu untuk memutus aliran listrik sebelum memperbaiki."
    },
    {
        id: 16,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ELECTRICAL_SAFETY,
        question: "Mengapa tidak boleh menyentuh kabel listrik dengan tangan basah?",
        answers: [
            "Air menghantarkan listrik",
            "Tangan akan kotor",
            "Kabel akan rusak",
            "Tidak ada masalah"
        ],
        correctAnswer: 0,
        explanation: "Air adalah penghantar listrik yang baik, sehingga menyentuh kabel dengan tangan basah sangat berbahaya."
    },
    {
        id: 17,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ELECTRICAL_SAFETY,
        question: "Apa fungsi MCB (Miniature Circuit Breaker) di rumah?",
        answers: [
            "Menambah tegangan",
            "Melindungi dari korsleting",
            "Menghemat energi",
            "Mempercepat aliran listrik"
        ],
        correctAnswer: 1,
        explanation: "MCB berfungsi melindungi rangkaian listrik dari korsleting dan arus berlebih."
    },
    {
        id: 18,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.ELECTRICAL_SAFETY,
        question: "Berapa tegangan listrik standar di rumah Indonesia?",
        answers: ["110V", "220V", "240V", "380V"],
        correctAnswer: 1,
        explanation: "Tegangan listrik standar di Indonesia adalah 220V untuk rumah tangga."
    },

    // Renewable Energy Questions
    {
        id: 19,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.RENEWABLE_ENERGY,
        question: "Sumber energi terbarukan yang paling umum untuk rumah adalah?",
        answers: ["Batu bara", "Panel surya", "Gas alam", "Bensin"],
        correctAnswer: 1,
        explanation: "Panel surya mengkonversi energi matahari menjadi listrik dan merupakan sumber energi terbarukan."
    },
    {
        id: 20,
        category: GAME_CONSTANTS.EDUCATIONAL_CATEGORIES.RENEWABLE_ENERGY,
        question: "Keuntungan utama menggunakan energi terbarukan adalah?",
        answers: [
            "Lebih murah",
            "Ramah lingkungan",
            "Lebih cepat",
            "Lebih mudah"
        ],
        correctAnswer: 1,
        explanation: "Energi terbarukan ramah lingkungan karena tidak menghasilkan polusi dan tidak akan habis."
    }
];

// Level data
const LEVEL_DATA = {
    1: {
        title: "Level 1: Ruang Tamu",
        subtitle: "Dasar Listrik",
        objective: "Nyalakan listrik di ruang tamu dan temukan petunjuk pertama",
        description: "Pelajari dasar-dasar rangkaian listrik dengan menghubungkan kabel dan menyalakan TV",
        puzzles: ["cable", "tv"],
        educationalTopics: [
            "Rangkaian listrik dasar",
            "Fungsi saklar dan komponen listrik",
            "Konsep rangkaian tertutup dan terbuka"
        ],
        completionMessage: "Selamat! Kamu telah memahami dasar-dasar rangkaian listrik.",
        energyKeyReward: 0
    },
    2: {
        title: "Level 2: Dapur",
        subtitle: "Efisiensi Energi",
        objective: "Kelola perangkat dapur secara efisien untuk menjaga Power Meter tetap hijau",
        description: "Belajar menggunakan perangkat rumah tangga dengan efisien",
        puzzles: ["kitchen"],
        educationalTopics: [
            "Efisiensi penggunaan energi",
            "Pemanfaatan cahaya alami",
            "Pengelolaan perangkat rumah tangga"
        ],
        completionMessage: "Hebat! Kamu telah menguasai efisiensi energi di dapur.",
        energyKeyReward: 1
    },
    3: {
        title: "Level 3: Laboratorium",
        subtitle: "Simulasi Tagihan",
        objective: "Gunakan simulator untuk mengatur penggunaan energi rumah dengan efisien",
        description: "Pelajari cara menghitung dan mengoptimalkan tagihan listrik",
        puzzles: ["simulator"],
        educationalTopics: [
            "Perhitungan konsumsi energi",
            "Simulasi tagihan listrik",
            "Formula E = (P × t) / 1000",
            "Optimasi penggunaan listrik"
        ],
        completionMessage: "Luar biasa! Kamu telah menguasai perhitungan energi listrik.",
        energyKeyReward: 2
    },
    4: {
        title: "Level 4: Ruang Bawah Tanah",
        subtitle: "Evaluasi Akhir",
        objective: "Gunakan 4 Kunci Energi untuk membuka Gerbang Evaluasi Akhir",
        description: "Selesaikan kuis pengetahuan untuk menyelamatkan ilmuwan",
        puzzles: ["quiz"],
        educationalTopics: [
            "Evaluasi pemahaman menyeluruh",
            "Keamanan kelistrikan",
            "Energi terbarukan",
            "Aplikasi pengetahuan"
        ],
        completionMessage: "Fantastis! Kamu telah menyelesaikan semua tantangan dan menyelamatkan ilmuwan!",
        energyKeyReward: 3
    }
};

// Opening animation script
const OPENING_SCRIPT = [
    {
        time: 0,
        duration: 8000,
        narration: "Seorang ilmuwan listrik terkenal telah menghilang secara misterius. Rumahnya kini dipenuhi teka-teki yang belum terpecahkan.",
        subtitle: "Ilmuwan listrik terkenal menghilang misterius. Rumahnya penuh teka-teki listrik.",
        visual: "night_sky_news"
    },
    {
        time: 8000,
        duration: 8000,
        narration: "Jika kau mendengar ini... maka aku butuh bantuanmu. Carilah kunci energi... hanya itu jalanmu.",
        subtitle: "Jika kau mendengar ini... maka aku butuh bantuanmu. Carilah kunci energi...",
        visual: "mysterious_house"
    },
    {
        time: 16000,
        duration: 8000,
        narration: "Kamu adalah seorang siswa dengan rasa ingin tahu besar. Kini, tugasmu adalah menyelidiki rumah ini dan mengungkap rahasia yang tersembunyi di dalamnya.",
        subtitle: "Kamu adalah seorang siswa dengan rasa ingin tahu besar. Tugasmu mengungkap rahasia ini.",
        visual: "player_intro"
    },
    {
        time: 24000,
        duration: 6000,
        narration: "Selamat datang di Energy Quest: Misteri Hemat Listrik. Perjalananmu dimulai sekarang.",
        subtitle: "Selamat datang di Energy Quest: Misteri Hemat Listrik. Perjalananmu dimulai sekarang.",
        visual: "game_title"
    }
];

// Educational content
const EDUCATIONAL_CONTENT = {
    BASIC_ELECTRICITY: {
        title: "Dasar-Dasar Kelistrikan",
        content: `
            <h3>Rangkaian Listrik Sederhana</h3>
            <p>Listrik mengalir dalam rangkaian tertutup dari kutub positif (+) ke kutub negatif (-) baterai.</p>
            
            <h4>Komponen yang diperlukan:</h4>
            <ul>
                <li><strong>Sumber listrik</strong> (baterai) - memberikan energi</li>
                <li><strong>Penghantar</strong> (kabel) - jalur aliran listrik</li>
                <li><strong>Beban</strong> (lampu) - menggunakan energi listrik</li>
                <li><strong>Saklar</strong> - mengontrol aliran listrik</li>
            </ul>
            
            <h4>Prinsip Kerja:</h4>
            <p>Saklar berfungsi untuk memutus atau menghubungkan arus listrik dalam rangkaian. Ketika saklar tertutup, arus dapat mengalir dan lampu menyala. Ketika saklar terbuka, arus terputus dan lampu mati.</p>
        `
    },
    
    ENERGY_EFFICIENCY: {
        title: "Efisiensi Energi",
        content: `
            <h3>Tips Hemat Energi di Rumah</h3>
            
            <h4>1. Pencahayaan</h4>
            <ul>
                <li>Manfaatkan cahaya alami dengan membuka jendela</li>
                <li>Matikan lampu saat cahaya alami cukup</li>
                <li>Gunakan lampu LED yang lebih hemat energi</li>
            </ul>
            
            <h4>2. Peralatan Dapur</h4>
            <ul>
                <li>Tutup pintu kulkas dengan cepat</li>
                <li>Gunakan peralatan listrik seperlunya</li>
                <li>Matikan peralatan yang tidak digunakan</li>
                <li>Gunakan mode hemat energi pada rice cooker</li>
            </ul>
            
            <h4>3. Kebiasaan Sehari-hari</h4>
            <p>Setiap tindakan kecil berkontribusi pada penghematan energi. Dengan mengubah kebiasaan sederhana, kita dapat menghemat energi secara signifikan.</p>
        `
    },
    
    ENERGY_CALCULATION: {
        title: "Perhitungan Energi Listrik",
        content: `
            <h3>Formula Dasar: E = (P × t) / 1000</h3>
            
            <h4>Keterangan:</h4>
            <ul>
                <li><strong>E</strong> = Energi konsumsi (kWh)</li>
                <li><strong>P</strong> = Daya perangkat (Watt)</li>
                <li><strong>t</strong> = Waktu pemakaian (jam)</li>
            </ul>
            
            <h4>Contoh Perhitungan:</h4>
            <p><strong>Lampu 60W menyala 8 jam/hari:</strong></p>
            <p>E = (60 × 8) / 1000 = 0,48 kWh/hari</p>
            <p>E bulanan = 0,48 × 30 = 14,4 kWh</p>
            <p>Biaya = 14,4 × Rp1.467 = Rp21.125</p>
            
            <h4>Tips Menghemat:</h4>
            <ul>
                <li>Kurangi P (gunakan perangkat hemat energi)</li>
                <li>Kurangi t (matikan saat tidak digunakan)</li>
            </ul>
        `
    },
    
    ELECTRICAL_SAFETY: {
        title: "Keamanan Kelistrikan",
        content: `
            <h3>Prinsip Keamanan Listrik</h3>
            
            <h4>Bahaya Listrik:</h4>
            <ul>
                <li>Sengatan listrik dapat menyebabkan cedera serius</li>
                <li>Korsleting dapat menyebabkan kebakaran</li>
                <li>Air dan listrik adalah kombinasi yang sangat berbahaya</li>
            </ul>
            
            <h4>Tindakan Pencegahan:</h4>
            <ul>
                <li>Jangan menyentuh kabel listrik dengan tangan basah</li>
                <li>Matikan saklar utama (MCB) saat ada masalah listrik</li>
                <li>Periksa kabel secara berkala untuk mencegah korsleting</li>
                <li>Gunakan peralatan listrik sesuai kapasitas</li>
            </ul>
            
            <h4>Prosedur Darurat:</h4>
            <p>Jika terjadi korsleting, segera matikan saklar utama dan jangan menyentuh peralatan listrik sampai aman.</p>
        `
    }
};

// Export data for global access
window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
window.LEVEL_DATA = LEVEL_DATA;
window.OPENING_SCRIPT = OPENING_SCRIPT;
window.EDUCATIONAL_CONTENT = EDUCATIONAL_CONTENT;