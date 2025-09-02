# Energy Quest: Misteri Hemat Listrik

Game edukasi interaktif tentang penghematan energi listrik yang dikembangkan dengan Three.js.

## 🎮 Tentang Game

Energy Quest adalah game petualangan 3D yang mengajarkan konsep-konsep penting tentang penghematan energi listrik melalui gameplay yang menarik. Pemain akan menjelajahi rumah misterius seorang ilmuwan yang hilang dan memecahkan teka-teki listrik untuk mengungkap misteri.

## 🚀 Fitur

- **Grafis 3D Cinematic**: Menggunakan Three.js dengan lighting dan shadow mapping yang realistis
- **Gameplay Edukatif**: Belajar tentang rangkaian listrik, penghematan energi, dan efisiensi
- **Multiple Scenes**: Ruang tamu, dapur, laboratorium, dan ruang rahasia
- **Interactive Puzzles**: Teka-teki wiring, simulasi tagihan listrik, dan kuis
- **Audio Immersive**: Musik latar dan efek suara yang mendukung atmosfer

## 🛠️ Teknologi

- **Three.js** - 3D graphics rendering
- **Vanilla JavaScript** - Game logic dan interaksi
- **HTML5 Canvas** - Texture generation
- **Web Audio API** - Sound effects

## 📦 Deployment

Game ini dikonfigurasi untuk autodeploy ke Vercel:

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Auto Deploy
Push ke branch `main` atau `master` akan otomatis trigger deployment melalui GitHub Actions.

## 🔧 Development

### Local Development
```bash
# Jalankan local server
python3 -m http.server 8000

# Atau menggunakan npm script
npm run dev
```

### File Structure
```
├── index.html          # Main HTML file
├── game.js            # Game logic dan Three.js setup
├── vercel.json        # Vercel configuration
├── package.json       # Project metadata
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Actions workflow
```

## 🎯 Gameplay

1. **Opening Scene**: Introduksi misteri ilmuwan yang hilang
2. **Living Room**: Pelajari rangkaian listrik dasar
3. **Kitchen**: Simulasi penghematan energi di dapur
4. **Laboratory**: Simulasi tagihan listrik dan efisiensi
5. **Quiz Room**: Kuis final untuk menguji pemahaman
6. **Ending**: Resolusi cerita dan pesan edukatif

## 🏆 Learning Objectives

- Memahami konsep rangkaian listrik tertutup dan terbuka
- Belajar cara menghemat energi di rumah tangga
- Mengerti hubungan antara penggunaan listrik dan tagihan
- Mengembangkan kesadaran tentang efisiensi energi

## 📱 Browser Support

- Chrome/Chromium (Recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat pull request atau buka issue untuk bug reports dan feature requests.

## 📄 License

MIT License - Lihat file LICENSE untuk detail lengkap.