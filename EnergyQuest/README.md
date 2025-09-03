# Energy Quest: Misteri Hemat Listrik

## Deskripsi Game
**Energy Quest: Misteri Hemat Listrik** adalah game edukasi bergenre puzzle adventure yang dirancang khusus untuk siswa SMP (usia 12-15 tahun). Game ini memadukan elemen eksplorasi, teka-teki, dan edukasi berbasis materi kelistrikan untuk meningkatkan kesadaran penggunaan energi listrik yang efisien.

## Konsep Utama
Pemain berperan sebagai siswa SMP yang menyelidiki rumah pintar misterius milik seorang ilmuwan listrik yang hilang. Untuk menemukan ilmuwan tersebut, pemain harus memecahkan berbagai puzzle terkait energi listrik dan mengumpulkan 4 Kunci Energi yang diperlukan untuk membuka Gerbang Evaluasi Akhir.

## Fitur Utama

### 🎮 Gameplay
- **Genre**: Puzzle Adventure Edukasi
- **Platform**: Android (Unity 3D)
- **Core Loop**: Eksplorasi → Puzzle → Kunci Energi → Evaluasi Akhir
- **4 Level Utama**: Ruang Tamu, Dapur, Laboratorium, Ruang Bawah Tanah

### 🧠 Sistem Edukasi
- **Materi**: Rangkaian listrik, efisiensi energi, perhitungan tagihan
- **Metode**: Learning by doing dengan puzzle interaktif
- **Evaluasi**: Kuis acak dengan Fisher-Yates Shuffle
- **Formula**: Implementasi rumus E = (P × t) / 1000

### 🔧 Teknologi
- **Engine**: Unity 2022.3 LTS
- **Algoritma**: Finite State Machine (FSM) & Fisher-Yates Shuffle
- **Optimasi**: Mobile-first design dengan performa 60 FPS
- **Audio**: Sistem narasi lengkap dengan subtitle Indonesia

## Struktur Level

### Level 1: Ruang Tamu - Dasar Listrik
- **Puzzle Kabel**: Drag & connect untuk membuat rangkaian tertutup
- **Puzzle TV**: Urutan menyalakan TV (colok kabel → saklar → power → channel)
- **Edukasi**: Rangkaian listrik dasar dan fungsi saklar
- **Reward**: Kunci Energi Pertama

### Level 2: Dapur - Efisiensi Energi
- **Mekanik**: Kelola perangkat dapur untuk menjaga Power Meter hijau
- **Interaksi**: Lampu, jendela, kulkas, dan peralatan listrik
- **Edukasi**: Efisiensi energi dan pemanfaatan cahaya alami
- **Reward**: Kunci Energi Kedua

### Level 3: Laboratorium - Simulasi Tagihan
- **Simulator**: Atur konsumsi listrik untuk mencapai target Rp300.000
- **Formula**: Implementasi perhitungan energi real-time
- **Edukasi**: Perhitungan tagihan dan optimasi penggunaan
- **Reward**: Kunci Energi Ketiga + Blueprint

### Level 4: Ruang Bawah Tanah - Evaluasi Final
- **Kuis**: 10 soal acak dari 20+ bank soal
- **Algoritma**: Fisher-Yates Shuffle untuk pengacakan fair
- **Syarat**: Minimal 70% jawaban benar untuk lulus
- **Reward**: Kunci Energi Keempat + Penyelamatan Ilmuwan

## Instalasi & Setup

### Persyaratan Sistem
- **Unity**: 2022.3.0f1 atau lebih baru
- **Platform**: Android API Level 22+
- **RAM**: Minimum 2GB
- **Storage**: ~500MB

### Cara Install
```bash
# Clone atau download project
cd EnergyQuest

# Buka di Unity Hub
# File → Open Project → Pilih folder EnergyQuest

# Build untuk Android
# File → Build Settings → Android → Build
```

### Setup Development
```bash
# Struktur folder sudah disiapkan:
Assets/
├── Scripts/
│   ├── Core/          # GameManager, FSM, EnergyCalculator
│   ├── GameStates/    # Handler untuk setiap level
│   ├── Puzzles/       # Sistem puzzle dan kuis
│   ├── UI/            # User Interface components
│   ├── Audio/         # Audio management
│   └── Utils/         # Utility classes
├── Scenes/            # Unity scenes
├── Prefabs/           # Game objects prefabs
├── Materials/         # Materials dan shaders
├── Textures/          # Texture assets
├── Audio/             # Audio clips
└── Animations/        # Animation clips
```

## Algoritma Implementasi

### 1. Finite State Machine (FSM)
```csharp
// Mengatur transisi antar state game
public enum GameState
{
    OpeningScene, MainMenu, Level1_LivingRoom, 
    Level2_Kitchen, Level3_Laboratory, Level4_Basement, 
    EndingScene, Settings, About, Paused
}

// Transisi state berdasarkan kondisi game
FiniteStateMachine.Instance.ChangeState(GameState.Level1_LivingRoom);
```

### 2. Fisher-Yates Shuffle
```csharp
// Pengacakan soal kuis yang fair dan unbiased
public static void Shuffle<T>(IList<T> list)
{
    for (int i = list.Count - 1; i > 0; i--)
    {
        int randomIndex = Random.Range(0, i + 1);
        T temp = list[i];
        list[i] = list[randomIndex];
        list[randomIndex] = temp;
    }
}
```

### 3. Perhitungan Energi
```csharp
// Formula: E = (P × t) / 1000
public static float CalculateEnergyConsumption(float powerWatts, float timeHours)
{
    return (powerWatts * timeHours) / 1000f;
}

// Perhitungan tagihan bulanan
public static float CalculateMonthlyBill(float monthlyKwh)
{
    return monthlyKwh * TARIFF_PER_KWH; // Rp1.467,28/kWh
}
```

## Kontrol Game

### Mobile (Android)
- **Tap**: Interaksi dengan objek
- **Drag**: Menghubungkan kabel, menggeser slider
- **Pinch**: Zoom kamera (opsional)
- **Long Press**: Informasi detail objek

### Desktop (Testing)
- **Mouse Click**: Interaksi objek
- **WASD**: Pergerakan kamera
- **Scroll**: Zoom
- **Esc**: Pause/Menu
- **1-4**: Quick access ke level (debug)

## Fitur Edukasi

### Materi Pembelajaran
1. **Rangkaian Listrik Dasar**
   - Komponen rangkaian (baterai, saklar, lampu, kabel)
   - Konsep rangkaian tertutup dan terbuka
   - Aliran arus dari positif ke negatif

2. **Efisiensi Energi**
   - Pemanfaatan cahaya alami
   - Penggunaan perangkat seperlunya
   - Pengelolaan peralatan rumah tangga

3. **Perhitungan Energi**
   - Formula E = (P × t) / 1000
   - Konversi Watt ke kWh
   - Simulasi tagihan listrik PLN

4. **Keamanan Kelistrikan**
   - Bahaya air dan listrik
   - Fungsi MCB dan pengaman
   - Prosedur darurat

### Metode Penilaian
- **Formative**: Feedback real-time pada setiap puzzle
- **Summative**: Kuis akhir dengan skor minimal 70%
- **Self-Assessment**: Refleksi melalui educational panels

## Optimasi Mobile

### Performa
- Target 60 FPS dengan fallback ke 30 FPS
- Dynamic quality adjustment berdasarkan device specs
- Memory management otomatis
- Battery optimization mode

### UI/UX
- Touch-friendly button sizes (minimum 44x44 points)
- Landscape orientation untuk gameplay optimal
- Subtitle dan narasi dalam Bahasa Indonesia
- Visual feedback yang jelas untuk setiap interaksi

## Audio System

### Jenis Audio
- **Background Music**: Ambient untuk setiap level
- **Sound Effects**: Interaksi, feedback, dan atmosfer
- **Narration**: Voice-over untuk story dan tutorial
- **Educational**: Audio penjelasan untuk setiap konsep

### Kontrol Audio
- Volume terpisah untuk musik, SFX, dan narasi
- Subtitle toggle untuk accessibility
- Audio compression untuk mobile optimization

## Debugging & Testing

### Debug Commands (Editor)
- **[ContextMenu]** pada setiap script untuk testing
- Quick level access dengan tombol 1-4
- Reset progress dengan tombol R
- System status display untuk monitoring

### Testing Checklist
- [ ] FSM transitions berfungsi dengan benar
- [ ] Semua puzzle dapat diselesaikan
- [ ] Audio playback lancar
- [ ] UI responsive di berbagai resolusi
- [ ] Performance stabil di target device
- [ ] Save/load system berfungsi
- [ ] Educational content akurat

## Deployment

### Build Configuration
```
Platform: Android
Architecture: ARM64
Scripting Backend: IL2CPP
API Compatibility: .NET Standard 2.1
Target API Level: 30 (Android 11)
Minimum API Level: 22 (Android 5.1)
```

### Optimization Settings
```
Texture Compression: ASTC
Audio Compression: Vorbis
Shader Stripping: Enabled
Code Stripping: Aggressive
```

## Kontribusi
Game ini dikembangkan untuk tujuan edukasi. Kontribusi dalam bentuk:
- Improvement puzzle mechanics
- Penambahan soal kuis
- Optimasi performa
- Accessibility features
- Localization

## Lisensi
Dikembangkan untuk tujuan edukasi. Semua materi pembelajaran mengacu pada:
- Kurikulum Fisika SMP 2013
- Standar Tarif Listrik PLN 2024
- Panduan Efisiensi Energi ESDM

---

**Target**: Meningkatkan kesadaran penggunaan energi listrik yang efisien melalui media game edukasi yang menyenangkan dan interaktif.

**Visi**: Menjadikan generasi muda Indonesia sebagai generasi yang peduli dan bijak dalam menggunakan energi listrik untuk masa depan yang berkelanjutan.