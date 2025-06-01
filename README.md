# 🎯 EddyQuiz Trivia Oyunu

Bu proje, çocuklar için eğlenceli ve eğitici bir trivia (bilgi yarışması) oyunudur. Oyun, önce çarkın dönmesi ve çıkan kategoriye göre sorular sorulması prensibine dayanır.

## 🎮 Oyun Özellikleri

### 📱 Çark Sistemi
- **6 farklı kategori**: toys, colors, animals, body parts, food, daily routines
- **Animasyonlu çark**: Gerçekçi dönme efekti
- **Rastgele seçim**: Her dönüşte farklı kategori

### 🧠 Soru Sistemi
- Her kategoride **3 soru**
- **4 seçenekli** çoktan seçmeli sorular
- **Çocuk dostu** içerik
- **Anlık puanlama** sistemi

### 🎨 Tasarım Özellikleri
- **Modern ve renkli** arayüz
- **Responsive** tasarım (mobil uyumlu)
- **Smooth animasyonlar**
- **Gradient** arka planlar
- **Emoji** destekli kategoriler

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Kurulum Adımları

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/tegemenozyurek/Quiz.git
cd Quiz
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Uygulamayı başlatın:**
```bash
npm start
```

4. **Tarayıcıda açın:**
   - Otomatik olarak [http://localhost:3000](http://localhost:3000) adresinde açılacaktır

## 📂 Proje Yapısı

```
eddyquiz/
├── src/
│   ├── App.js          # Ana oyun bileşeni
│   ├── App.css         # Stil dosyası
│   ├── index.js        # React giriş noktası
│   └── ...
├── Assets/             # Tasarım dosyaları
│   ├── AI/            # Adobe Illustrator dosyaları
│   ├── EPS/           # EPS vektör dosyaları
│   └── PNG/           # PNG resim dosyaları
├── public/            # Statik dosyalar
└── package.json       # Proje konfigürasyonu
```

## 🎯 Kategoriler ve Sorular

### 🧸 Toys (Oyuncaklar)
- Çocukların sevdiği oyuncaklar hakkında sorular
- Top, topaç, uçurtma gibi konular

### 🌈 Colors (Renkler)
- Temel renkler ve karışımları
- Doğadaki renkler

### 🐕 Animals (Hayvanlar)
- Hayvan sesleri ve özellikleri
- Evcil ve çiftlik hayvanları

### 👁️ Body Parts (Vücut Parçaları)
- Vücut organları ve işlevleri
- Beş duyu organı

### 🍎 Food (Yiyecekler)
- Sağlıklı beslenme
- Meyveler ve besinler

### ⏰ Daily Routines (Günlük Rutinler)
- Günlük aktiviteler
- Zaman kavramı

## 🛠️ Teknolojiler

- **React 19.1.0** - Modern JavaScript framework
- **CSS3** - Animasyonlar ve responsive tasarım
- **JavaScript ES6+** - Modern JavaScript özellikleri
- **HTML5** - Semantik markup

## 📱 Responsive Tasarım

Oyun tüm cihazlarda çalışacak şekilde tasarlanmıştır:
- **Desktop** - Tam özellikli deneyim
- **Tablet** - Optimize edilmiş layout
- **Mobile** - Touch-friendly arayüz

## 🎨 Assets Hakkında

Projede kullanılan görsel tasarımlar:
- **Trivia Crack** stili oyun arayüzü
- **Vektör tabanlı** (ölçeklenebilir) grafikler
- **Adobe Illustrator** kaynak dosyaları
- **PNG** formatında hazır görseller

## 🔧 Geliştirme

### Yeni Soru Ekleme
`src/App.js` dosyasındaki `questions` objesine yeni sorular ekleyebilirsiniz:

```javascript
const questions = {
  "kategori_adı": [
    { 
      question: "Soru metni?", 
      options: ["Seçenek1", "Seçenek2", "Seçenek3", "Seçenek4"], 
      correct: 0 // Doğru cevabın index'i
    }
  ]
};
```

### Yeni Kategori Ekleme
`categories` dizisine yeni kategori ekleyebilirsiniz:

```javascript
const categories = [
  { name: 'yeni_kategori', emoji: '🎵', color: '#FF9999' }
];
```

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

## 🌟 English Version

# 🎯 EddyQuiz Trivia Game

An educational and fun trivia game designed for children. The game works by spinning a wheel first, then asking questions about the selected category.

## 🎮 Game Features

- **Spinning Wheel**: 6 colorful categories with smooth animations
- **Question System**: 3 questions per category with 4 multiple choice options
- **Scoring System**: Real-time score tracking
- **Child-Friendly**: Age-appropriate content and interface
- **Responsive Design**: Works on all devices

## 🚀 Quick Start

```bash
git clone https://github.com/tegemenozyurek/Quiz.git
cd Quiz
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play!

## 📝 Categories

1. **Toys** 🧸 - Fun questions about toys and games
2. **Colors** 🌈 - Basic colors and color mixing
3. **Animals** 🐕 - Animal sounds and characteristics  
4. **Body Parts** 👁️ - Body organs and their functions
5. **Food** 🍎 - Healthy eating and nutrition
6. **Daily Routines** ⏰ - Daily activities and time concepts

## 🛠️ Built With

- React 19.1.0
- CSS3 with animations
- Modern JavaScript (ES6+)
- Responsive design principles

---

**🎯 Have fun learning with EddyQuiz!** 🎯
