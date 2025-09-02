# Energy Quest: Misteri Hemat Listrik

🎮 **Game edukasi interaktif tentang penghematan energi listrik**

## 📖 Deskripsi

Energy Quest adalah game edukasi 3D yang menggunakan Three.js untuk mengajarkan konsep penghematan energi listrik melalui petualangan misterius. Pemain berperan sebagai siswa SMP yang harus memecahkan teka-teki listrik untuk mengungkap misteri hilangnya seorang ilmuwan.

## 🎯 Fitur Utama

### 🎬 Scene Cinematik
- **Opening Scene**: Berita misteri tentang ilmuwan yang hilang
- **House Reveal Scene**: Rumah berkedip dengan bayangan misterius
- **Character Intro Scene**: Perkenalan karakter pemain
- **Main Menu Scene**: Menu utama dengan navigasi

### 🎵 Sistem Audio
- Musik latar yang dinamis untuk setiap scene
- Efek suara ambient (petir, listrik, pintu)
- Audio procedural menggunakan Web Audio API

### 🎮 Kontrol
- **Space**: Mulai permainan (di menu utama)
- **Escape**: Kembali ke menu utama
- **R**: Restart scene saat ini
- **Mouse**: Navigasi menu

### ✨ Efek Visual
- Transisi fade yang halus antar scene
- Animasi kamera cinematik
- Efek pencahayaan dinamis
- Partikel dan efek visual

## 🛠️ Teknologi

- **Three.js**: Engine 3D untuk rendering
- **WebGL**: Rendering hardware-accelerated
- **Web Audio API**: Sistem audio procedural
- **HTML5/CSS3**: Interface dan styling
- **JavaScript ES6+**: Logic game

## 🚀 Cara Menjalankan

1. **Clone atau download project**
2. **Buka terminal di folder project**
3. **Jalankan local server**:
   ```bash
   python -m http.server 8000
   ```
   atau
   ```bash
   npx serve .
   ```
4. **Buka browser dan akses**: `http://localhost:8000`

## 📁 Struktur Project

```
Energy Quest Game/
├── index.html          # File HTML utama
├── game.js            # Logic game dan Three.js setup
├── README.md          # Dokumentasi project
└── .qodo/            # Folder konfigurasi IDE
```

## 🎨 Spesifikasi Teknis

### Global Setup
- **Renderer**: WebGLRenderer dengan antialiasing
- **Camera**: PerspectiveCamera (FOV 75°, near 0.1, far 1000)
- **Controls**: OrbitControls (disabled untuk produksi)
- **Lighting**: AmbientLight + DirectionalLight
- **Audio**: AudioListener + PositionalAudio

### Scene Management
- Sistem transisi fade antar scene
- Loading state management
- Audio synchronization
- Performance optimization

## 🎓 Tujuan Edukasi

1. **Kesadaran Energi**: Memahami pentingnya penghematan listrik
2. **Konsep Listrik**: Belajar dasar-dasar kelistrikan
3. **Problem Solving**: Mengembangkan kemampuan pemecahan masalah
4. **Teknologi**: Pengenalan teknologi 3D dan web

## 🔧 Pengembangan Lanjutan

### Fitur yang Dapat Ditambahkan
- [ ] Gameplay puzzle interaktif
- [ ] Sistem scoring dan achievement
- [ ] Multiple levels dan challenges
- [ ] Multiplayer mode
- [ ] Mobile responsive design
- [ ] Audio files eksternal
- [ ] 3D models yang lebih detail
- [ ] Physics simulation

### Optimisasi
- [ ] Asset loading optimization
- [ ] Memory management
- [ ] Mobile performance
- [ ] Progressive Web App (PWA)

## 🎮 Kontribusi

Project ini terbuka untuk kontribusi! Silakan:
1. Fork repository
2. Buat feature branch
3. Commit perubahan
4. Submit pull request

## 📄 Lisensi

Project ini dibuat untuk tujuan edukasi dan dapat digunakan secara bebas.

## 👨‍💻 Developer

Dikembangkan menggunakan Trae AI dengan teknologi:
- Three.js untuk 3D rendering
- Web Audio API untuk sistem audio
- Modern JavaScript untuk interaktivitas

---

**Selamat bermain dan belajar! ⚡🎮**