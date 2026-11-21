import type { CharacterId } from '../components/PandaMascot';

export type MediaUnitId =
  | 'pemula'
  | 'menengah'
  | 'lanjutan'
  | 'app_maker'
  | 'game_maker'
  | 'ai_ml';

export type SlideVisualKind =
  | 'sequence_grid'
  | 'rotation_compass'
  | 'loop_compressor'
  | 'ifelse_sensor'
  | 'pattern_stairs'
  | 'sense_plan_act'
  | 'app_architecture'
  | 'game_loop'
  | 'vision_pipeline';

export interface MediaConceptSlide {
  id: string;
  title: string;
  subtitle: string;
  narration: string;
  visualKind: SlideVisualKind;
  character: CharacterId;
  blocksPreview: string[];
  pythonCode: string;
  jsCode: string;
  keyTakeaway: string;
}

export interface MediaQuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningMediaUnit {
  id: MediaUnitId;
  number: string;
  title: string;
  shortTitle: string;
  trackLabel: string;
  accentColor: string;
  summary: string;
  estimatedMinutes: number;
  slides: MediaConceptSlide[];
  quiz: MediaQuizQuestion[];
  sandboxPrompt: string;
  referenceNotes: {
    heading: string;
    bullets: string[];
  }[];
}

export const LEARNING_MEDIA_UNITS: LearningMediaUnit[] = [
  {
    id: 'pemula',
    number: '01',
    title: 'Dasar Algoritma, Gerakan & Loop',
    shortTitle: '01. Pemula (Basics)',
    trackLabel: 'Coding Studio · Level 1–3',
    accentColor: '#4ADE80',
    summary:
      'Pelajari cara menyusun urutan perintah (algoritma), memutar arah karakter 90 derajat, dan meringkas langkah berulang menggunakan loop.',
    estimatedMinutes: 8,
    sandboxPrompt:
      'Coba klik blok forward(2) lalu turn("left") lalu forward(2) di Lab Mini untuk melihat Panda berjalan langsung!',
    slides: [
      {
        id: 'p-s1',
        title: 'Apa Itu Algoritma?',
        subtitle: 'Urutan langkah logis dari START sampai tujuan',
        narration:
          'Algoritma adalah daftar perintah yang tersusun rapi dari atas ke bawah. Komputer menjalankan perintah satu per satu secara berurutan, seperti resep masakan atau petunjuk arah jalan.',
        visualKind: 'sequence_grid',
        character: 'panda',
        blocksPreview: ['START', 'forward(4)'],
        pythonCode: '# Maju lurus 4 kotak ke tujuan\nforward(4)',
        jsCode: '// Maju lurus 4 kotak ke tujuan\nforward(4);',
        keyTakeaway:
          'Gunakan Penggaris Jarak di arena untuk menghitung jumlah kotak sebelum mengisi angka pada forward(n).',
      },
      {
        id: 'p-s2',
        title: 'Mengubah Arah dengan turn()',
        subtitle: 'Belok kiri atau kanan sebesar 90 derajat di tempat',
        narration:
          'Perintah turn("left") atau turn("right") hanya memutar arah hadap karakter di kotak yang sama tanpa melangkah. Setelah menghadap arah baru, barulah gunakan forward() untuk maju.',
        visualKind: 'rotation_compass',
        character: 'bear',
        blocksPreview: ['START', 'forward(2)', 'turn("left")', 'forward(3)'],
        pythonCode: 'forward(2)\nturn("left")\nforward(3)',
        jsCode: 'forward(2);\nturn("left");\nforward(3);',
        keyTakeaway:
          'Selalu bayangkan diri Anda berdiri sebagai karakter dan perhatikan panah kuning arah hadapnya!',
      },
      {
        id: 'p-s3',
        title: 'Menghemat Kode dengan Repeat / Loop',
        subtitle: 'Satu blok perulangan menggantikan banyak baris berulang',
        narration:
          'Jika sebuah langkah harus diulang berkali-kali, programmer tidak mengetiknya berulang. Kita memakai blok repeat(n) atau for loop agar kode jauh lebih pendek dan mudah meraih 3 Bintang!',
        visualKind: 'loop_compressor',
        character: 'koala',
        blocksPreview: ['START', 'repeat(5) {', '  forward(1)', '}'],
        pythonCode: 'for i in range(5):\n  forward(1)',
        jsCode: 'for (let i = 0; i < 5; i++) {\n  forward(1);\n}',
        keyTakeaway:
          'Kode yang ringkas dan efisien (sesuai target jumlah baris) akan langsung mendapatkan skor penuh 3 Bintang.',
      },
      {
        id: 'p-s4',
        title: 'Blok, Python & JavaScript Itu Sama!',
        subtitle: 'Transisi halus dari blok visual menuju kode teks profesional',
        narration:
          'Di CodeSpark, setiap blok warna yang kamu pasang di bawah START otomatis diterjemahkan menjadi bahasa Python dan JavaScript asli. Kamu bisa belajar pelan-pelan dari Blok lalu mencoba mengedit teksnya.',
        visualKind: 'sequence_grid',
        character: 'panda',
        blocksPreview: ['START', 'forward(3)', 'turn("right")', 'forward(2)'],
        pythonCode: 'forward(3)\nturn("right")\nforward(2)',
        jsCode: 'forward(3);\nturn("right");\nforward(2);',
        keyTakeaway:
          'Klik tombol Langkah (Step) di studio untuk melihat hubungan baris kode dan gerakan karakter satu per satu!',
      },
    ],
    quiz: [
      {
        id: 'pq1',
        question: 'Jika Panda harus maju 4 kotak lurus untuk mengambil 2 permata, perintah mana yang paling ringkas?',
        options: ['forward(1) ditulis 4 kali', 'forward(4)', 'turn("left") lalu forward(4)', 'repeat(2) forward(1)'],
        correctIndex: 1,
        explanation:
          'forward(4) langsung menggerakkan Panda 4 kotak hanya dalam 1 baris kode sehingga otomatis meraih 3 Bintang!',
      },
      {
        id: 'pq2',
        question: 'Apa yang terjadi saat karakter menjalankan perintah turn("left")?',
        codeSnippet: 'turn("left")',
        options: [
          'Karakter langsung melangkah ke kotak sebelah kiri',
          'Karakter berputar 90° ke kiri di kotak yang sama tanpa berpindah',
          'Karakter mundur 1 langkah',
          'Permainan langsung selesai',
        ],
        correctIndex: 1,
        explanation:
          'turn() hanya memutar arah hadap di tempat. Untuk berpindah kotak, tambahkan forward() setelahnya.',
      },
      {
        id: 'pq3',
        question: 'Berapa total kotak yang ditempuh Koala dari potongan kode Python berikut?',
        codeSnippet: 'for i in range(3):\n  forward(2)',
        options: ['3 kotak', '5 kotak', '6 kotak', '2 kotak'],
        correctIndex: 2,
        explanation: 'Loop berjalan 3 kali dan tiap putaran maju 2 kotak, sehingga 3 × 2 = 6 kotak.',
      },
    ],
    referenceNotes: [
      {
        heading: 'Ringkasan Sintaks Pemula',
        bullets: [
          'forward(n): melangkah maju sebanyak n kotak.',
          'turn("left") / turn("right"): berputar 90 derajat di tempat.',
          'for i in range(n): mengulang blok kode di dalamnya sebanyak n kali.',
        ],
      },
    ],
  },

  {
    id: 'menengah',
    number: '02',
    title: 'Logika Percabangan (If/Else) & Pola',
    shortTitle: '02. Menengah (Logic)',
    trackLabel: 'Coding Studio · Level 4–6',
    accentColor: '#38BDF8',
    summary:
      'Ajarkan karakter mengambil keputusan otomatis saat menemui rintangan menggunakan sensor path_clear() dan kenali pola tangga berulang.',
    estimatedMinutes: 10,
    sandboxPrompt:
      'Uji pola tangga: repeat(2) → forward(1), turn("left"), forward(1), turn("right") pada Lab Mini!',
    slides: [
      {
        id: 'm-s1',
        title: 'Membuat Karakter Pintar dengan If / Else',
        subtitle: 'Pengambilan keputusan otomatis berdasarkan kondisi arena',
        narration:
          'Percabangan if/else membuat program bisa memilih jalan sendiri. Jika syarat bernilai BENAR (True), jalankan blok if. Jika SALAH (False), jalankan blok else.',
        visualKind: 'ifelse_sensor',
        character: 'bear',
        blocksPreview: ['if path_clear():', '  forward(1)', 'else:', '  turn("left")'],
        pythonCode: 'if path_clear():\n  forward(1)\nelse:\n  turn("left")',
        jsCode: 'if (pathClear()) {\n  forward(1);\n} else {\n  turn("left");\n}',
        keyTakeaway:
          'Sensor path_clear() mengecek tepat 1 kotak di depan karakter: aman atau ada batu/tepi pulau.',
      },
      {
        id: 'm-s2',
        title: 'Menggabungkan Loop + If/Else',
        subtitle: 'Karakter terus memeriksa jalan pada setiap langkah',
        narration:
          'Jika if path_clear() hanya ditulis sekali, karakter cuma mengecek 1 kali. Dengan membungkusnya di dalam repeat(7), karakter mengecek jalan berkali-kali secara otomatis sampai tujuan!',
        visualKind: 'ifelse_sensor',
        character: 'bear',
        blocksPreview: ['repeat(7)', '  if path_clear():', '    forward(1)', '  else:', '    turn("left")'],
        pythonCode: 'for i in range(7):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        jsCode:
          'for (let i = 0; i < 7; i++) {\n  if (pathClear()) {\n    forward(1);\n  } else {\n    turn("left");\n  }\n}',
        keyTakeaway:
          'Di mode Blok, klik "+ Isi di sini" atau "+ Isi Else" untuk memasukkan perintah ke dalam wadah yang tepat.',
      },
      {
        id: 'm-s3',
        title: 'Pengenalan Pola (Pattern Recognition)',
        subtitle: 'Memecah jalur tangga panjang menjadi 1 pola kecil',
        narration:
          'Saat melihat jalur berbentuk anak tangga, temukan 1 pola berulang: Maju 1 → Belok Kiri → Maju 1 → Belok Kanan. Ulangi pola itu 3 kali dengan repeat(3)!',
        visualKind: 'pattern_stairs',
        character: 'koala',
        blocksPreview: ['repeat(3)', '  forward(1)', '  turn("left")', '  forward(1)', '  turn("right")'],
        pythonCode:
          'for i in range(3):\n  forward(1)\n  turn("left")\n  forward(1)\n  turn("right")',
        jsCode:
          'for (let i = 0; i < 3; i++) {\n  forward(1);\n  turn("left");\n  forward(1);\n  turn("right");\n}',
        keyTakeaway:
          'Pattern Recognition adalah salah satu dari 4 pilar utama Computational Thinking!',
      },
    ],
    quiz: [
      {
        id: 'mq1',
        question: 'Jika tepat di depan Beruang ada batu besar, apa yang dijalankan kode berikut?',
        codeSnippet: 'if path_clear():\n  forward(1)\nelse:\n  turn("left")',
        options: ['Beruang menabrak batu', 'Beruang maju 1 kotak', 'Beruang otomatis belok kiri', 'Program berhenti'],
        correctIndex: 2,
        explanation:
          'Karena ada batu, path_clear() bernilai False sehingga program langsung masuk ke blok else: turn("left").',
      },
      {
        id: 'mq2',
        question: 'Mengapa indentasi (spasi di awal baris) sangat penting di Python?',
        options: [
          'Hanya agar terlihat cantik',
          'Menentukan perintah mana yang berada di dalam blok for, if, atau else',
          'Supaya warna teks berubah',
          'Agar karakter berjalan lebih cepat',
        ],
        correctIndex: 1,
        explanation:
          'Python memakai indentasi (2 atau 4 spasi) untuk menandai isi di dalam loop dan percabangan.',
      },
      {
        id: 'mq3',
        question: 'Berapa langkah yang dipangkas jika 3 anak tangga (12 baris) diringkas memakai repeat(3)?',
        options: ['Menjadi 5 baris kode saja', 'Tetap 12 baris', 'Menjadi 20 baris', 'Tidak bisa memakai repeat'],
        correctIndex: 0,
        explanation:
          '1 baris for + 4 perintah pola di dalamnya = 5 baris! Jauh lebih ringkas dan mudah dibaca.',
      },
    ],
    referenceNotes: [
      {
        heading: 'Ringkasan Logika & Pola',
        bullets: [
          'if path_clear(): memeriksa apakah 1 kotak di depan aman.',
          'else: dijalankan hanya saat kondisi if bernilai salah.',
          'Pola anak tangga: ulangi (maju → belok kiri → maju → belok kanan).',
        ],
      },
    ],
  },

  {
    id: 'lanjutan',
    number: '03',
    title: 'AI Navigator & Optimasi Algoritma',
    shortTitle: '03. Lanjutan (AI Logic)',
    trackLabel: 'Coding Studio · Level 7–9',
    accentColor: '#FFE600',
    summary:
      'Terapkan siklus robotika Sense-Plan-Act untuk menembus labirin otomatis dengan kode ultra-ringkas (≤ 5 baris) dan sensor permata.',
    estimatedMinutes: 10,
    sandboxPrompt:
      'Coba rancang kombinasi loop + belokan untuk memutari sudut labirin di Lab Mini!',
    slides: [
      {
        id: 'l-s1',
        title: 'Siklus AI: Sense → Plan → Act',
        subtitle: 'Cara kerja robot otonom dan mobil tanpa pengemudi',
        narration:
          'Robot pintar tidak menghafal setiap belokan. Ia terus menjalankan 3 tahap: Sense (memindai rintangan depan), Plan (memutuskan maju atau belok), dan Act (bergerak).',
        visualKind: 'sense_plan_act',
        character: 'panda',
        blocksPreview: ['repeat(13)', '  if path_clear():', '    forward(1)', '  else:', '    turn("left")'],
        pythonCode: 'for i in range(13):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        jsCode:
          'for (let i = 0; i < 13; i++) {\n  if (pathClear()) {\n    forward(1);\n  } else {\n    turn("left");\n  }\n}',
        keyTakeaway:
          'Ingat: setiap aksi belok (turn) juga memakai 1 putaran dari total iterasi repeat(n).',
      },
      {
        id: 'l-s2',
        title: 'Sensor Objek: if gem_ahead()',
        subtitle: 'Mendeteksi target permata tepat di depan karakter',
        narration:
          'Selain sensor dinding, karakter memiliki sensor target gem_ahead() untuk mendeteksi permata energi 1 kotak di depan. Ini mirip sensor kamera pada sistem AI modern.',
        visualKind: 'sense_plan_act',
        character: 'koala',
        blocksPreview: ['if gem_ahead():', '  forward(1)'],
        pythonCode: 'if gem_ahead():\n  forward(1)',
        jsCode: 'if (gemAhead()) {\n  forward(1);\n}',
        keyTakeaway:
          'Gabungkan sensor kondisi dengan loop untuk menciptakan agen cerdas yang adaptif.',
      },
      {
        id: 'l-s3',
        title: 'Code Optimization (Target 3 Bintang)',
        subtitle: 'Menulis solusi elegan dengan baris kode seminimal mungkin',
        narration:
          'Dua program bisa sama-sama sampai ke garis finis, tetapi programmer hebat selalu mencari algoritma yang paling ringkas, bersih, dan tidak mengulang kode yang sama.',
        visualKind: 'loop_compressor',
        character: 'bear',
        blocksPreview: ['repeat(16)', '  if path_clear():', '    forward(1)', '  else:', '    turn("left")'],
        pythonCode: '# Labirin 4 sudut hanya dalam 5 baris!\nfor i in range(16):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        jsCode:
          '// Labirin 4 sudut hanya dalam 5 baris!\nfor (let i = 0; i < 16; i++) {\n  if (pathClear()) {\n    forward(1);\n  } else {\n    turn("left");\n  }\n}',
        keyTakeaway:
          'Pantau indikator Target 3★ di pojok studio agar tahu berapa batas maksimal baris idealnya.',
      },
    ],
    quiz: [
      {
        id: 'lq1',
        question: 'Apa urutan yang benar dari siklus navigasi AI otonom?',
        options: [
          'Act → Sense → Plan',
          'Sense (Pindai) → Plan (Putuskan) → Act (Jalankan)',
          'Plan → Stop → Reset',
          'Forward → Forward → Stop',
        ],
        correctIndex: 1,
        explanation:
          'Agen AI selalu memindai lingkungan terlebih dahulu (Sense), memilih keputusan (Plan), lalu mengeksekusi aksi (Act).',
      },
      {
        id: 'lq2',
        question: 'Jika karakter perlu maju 9 kotak dan berbelok 3 kali memakai loop if path_clear() / else, berapa minimal iterasi repeat?',
        options: ['9 kali', '3 kali', '12 kali', '6 kali'],
        correctIndex: 2,
        explanation:
          '9 langkah maju + 3 kali belokan = total 12 iterasi di dalam loop if/else.',
      },
      {
        id: 'lq3',
        question: 'Mengapa batas langkah maksimal (120 langkah) ada pada simulator?',
        options: [
          'Untuk mencegah infinite loop (perulangan tanpa henti)',
          'Karena baterai karakter habis',
          'Agar pengguna tidak bisa memakai repeat',
          'Hanya hiasan layar',
        ],
        correctIndex: 0,
        explanation:
          'Batas langkah pengaman menjaga aplikasi tidak macet jika kode mengalami pengulangan tanpa akhir.',
      },
    ],
    referenceNotes: [
      {
        heading: 'Tips Menuntaskan Level 7–9',
        bullets: [
          'Level 7 & 9 menggunakan pola belok kiri ("left") saat terhalang.',
          'Level 8 menggunakan pola belok kanan ("right") saat terhalang.',
          'Hitung total kotak maju + jumlah belokan untuk menentukan angka repeat(n).',
        ],
      },
    ],
  },

  {
    id: 'app_maker',
    number: '04',
    title: 'Mikrokontroler & IoT (micro:bit Lab)',
    shortTitle: '04. micro:bit Lab',
    trackLabel: 'micro:bit · 5 Proyek Hardware',
    accentColor: '#60A5FA',
    summary:
      'Pahami cara kerja papan BBC micro:bit v2: matriks LED 5×5, tombol fisik A/B, sensor sentuh logo, akselerometer (shake), suhu/cahaya, speaker piezo, dan Radio.',
    estimatedMinutes: 8,
    sandboxPrompt:
      'Latih pemahaman logika event & perulangan di Lab Mini sebelum memprogram papan micro:bit!',
    slides: [
      {
        id: 'a-s1',
        title: 'Anatomi Papan BBC micro:bit v2',
        subtitle: 'Input Sensor → Proses Mikrokontroler → Output LED & Suara',
        narration:
          'Papan micro:bit adalah komputer mini berukuran saku yang memiliki 25 lampu LED (5×5), tombol fisik A & B, logo sentuh emas, sensor suhu, sensor cahaya, akselerometer, speaker piezo, dan pemancar Radio!',
        visualKind: 'app_architecture',
        character: 'panda',
        blocksPreview: ['on start', 'forever', 'on button A', 'show icon Heart'],
        pythonCode: '# Animasi LED & Tombol micro:bit\nbasic.show_icon(IconNames.HEART)\ninput.on_button_pressed(Button.A, on_a)',
        jsCode: 'basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.pause(400)\n})',
        keyTakeaway:
          'Blok on start berjalan sekali saat papan menyala, sedangkan blok forever berulang terus-menerus.',
      },
      {
        id: 'a-s2',
        title: 'Sensor Lingkungan & Komunikasi Radio',
        subtitle: 'Membaca Suhu, Cahaya & Mengirim Sinyal Nirkabel',
        narration:
          'Dengan blok Input dan Radio, micro:bit dapat menampilkan grafik batang intensitas cahaya, membunyikan alarm jika suhu di atas 30°C, serta mengirim pesan nirkabel ke papan micro:bit lain pada grup radio yang sama.',
        visualKind: 'app_architecture',
        character: 'bear',
        blocksPreview: ['plot bar graph', 'if temp > 30', 'radio set group 7', 'radio send string'],
        pythonCode: '# Mengirim pesan radio saat tombol A ditekan\nradio.set_group(7)\nradio.send_string("CERAH")',
        jsCode: 'radio.setGroup(7)\nled.plotBarGraph(lightLevel, 255)',
        keyTakeaway:
          'Pastikan nomor radio.setGroup() sama agar pengirim dan penerima bisa saling bertukar pesan.',
      },
    ],
    quiz: [
      {
        id: 'aq1',
        question: 'Apa perbedaan utama blok "on start" dan "forever" di MakeCode micro:bit?',
        options: [
          'Tidak ada perbedaan sama sekali',
          'on start berjalan sekali saat menyala, sedangkan forever berjalan berulang terus-menerus',
          'forever hanya berjalan saat tombol A ditekan',
          'on start digunakan untuk mematikan layar saja',
        ],
        correctIndex: 1,
        explanation:
          'on start ideal untuk pengaturan awal (misal radio set group atau nilai awal variabel), sedangkan forever untuk animasi atau pemantauan sensor kontinu.',
      },
      {
        id: 'aq2',
        question: 'Blok event mana yang dipakai untuk membuat Dadu Digital yang teracak saat papan digoyangkan?',
        options: ['on shake (Input / Akselerometer)', 'clear screen', 'set brightness', 'on start'],
        correctIndex: 0,
        explanation:
          'Sensor akselerometer pada micro:bit mendeteksi gerakan goyang lewat blok on shake.',
      },
    ],
    referenceNotes: [
      {
        heading: 'Urutan 5 Proyek micro:bit Lab',
        bullets: [
          '01. Flashing Heart & Name Badge: animasi LED 5×5, forever & tombol A.',
          '02. Dadu Digital & Penghitung: akselerometer on shake, variabel & randint(1, 6).',
          '03. Piano & Jukebox micro:bit: speaker piezo, tombol A/B, Logo sentuh & Pin P0.',
          '04. Termometer & Sensor Cahaya: bar graph cahaya & alarm logika if suhu > 30°C.',
          '05. Radio Telegrap & Stasiun Cuaca: radio set group, kirim teks/suhu & on radio received.',
        ],
      },
    ],
  },

  {
    id: 'game_maker',
    number: '05',
    title: 'Desain & Logika Game (Game Maker)',
    shortTitle: '05. Game Maker',
    trackLabel: 'Game Maker · 5 Game Interaktif',
    accentColor: '#38BDF8',
    summary:
      'Pelajari cara kerja Game Loop 60 FPS, deteksi tabrakan (collision), sistem nyawa/skor, dan pencocokan memori pada 5 game.',
    estimatedMinutes: 8,
    sandboxPrompt:
      'Uji pola gerakan dan koordinat di Lab Mini untuk memahami perpindahan karakter game!',
    slides: [
      {
        id: 'g-s1',
        title: 'Anatomi Game Loop',
        subtitle: 'Input → Update Posisi → Cek Tabrakan → Gambar Frame',
        narration:
          'Game seperti Space Mission dan Save the Polar Bear menggambar ulang layar berkali-kali setiap detik. Setiap frame mengecek tombol pemain, menggerakkan objek, mengecek tabrakan, lalu memperbarui skor.',
        visualKind: 'game_loop',
        character: 'koala',
        blocksPreview: ['Input Kontrol', 'Update Koordinat', 'Collision Check', 'Skor & Nyawa'],
        pythonCode: '# Siklus Game Loop\nwhile playing:\n  move_player()\n  check_collision()',
        jsCode: 'function gameLoop() {\n  updatePositions();\n  checkCollision();\n  requestAnimationFrame(gameLoop);\n}',
        keyTakeaway:
          'Collision Detection (deteksi tabrakan) menentukan kapan pemain mendapat poin atau kehilangan nyawa.',
      },
      {
        id: 'g-s2',
        title: 'State Kartu & Puzzle Logic',
        subtitle: 'Cara kerja Memory Card, Image Match, dan Color Puzzle',
        narration:
          'Pada game puzzle dan memori, komputer menyimpan array kartu yang diacak (shuffle), membandingkan dua pilihan pemain, lalu mengunci pasangan yang cocok.',
        visualKind: 'game_loop',
        character: 'panda',
        blocksPreview: ['Acak Kartu', 'Buka 2 Kartu', 'Cek Cocok?', 'Tambah Skor'],
        pythonCode: 'if card_a == card_b:\n  score += 10\n  lock_pair()',
        jsCode: 'if (first.id === second.id) {\n  setMatched([...matched, first.id]);\n}',
        keyTakeaway:
          'Game yang seru menggabungkan aturan jelas, umpan balik suara, dan tingkat tantangan bertahap.',
      },
    ],
    quiz: [
      {
        id: 'gq1',
        question: 'Apa fungsi Collision Detection dalam game seperti Space Mission?',
        options: [
          'Mengubah jenis huruf skor',
          'Mendeteksi saat peluru mengenai asteroid atau pesawat tertabrak rintangan',
          'Menyimpan nama pemain ke database',
          'Mematikan layar monitor',
        ],
        correctIndex: 1,
        explanation:
          'Collision Detection memeriksa apakah dua kotak/lingkaran objek saling bersentuhan di layar.',
      },
      {
        id: 'gq2',
        question: 'Mengapa Memory Card memakai fungsi pengacakan (shuffle) di awal permainan?',
        options: [
          'Agar posisi pasangan kartu selalu berbeda dan menantang di setiap ronde',
          'Agar kartu tidak bisa diklik',
          'Supaya skor selalu nol',
          'Untuk menghapus semua gambar',
        ],
        correctIndex: 0,
        explanation:
          'Pengacakan membuat permainan dapat dimainkan ulang berkali-kali tanpa pola yang sama persis.',
      },
    ],
    referenceNotes: [
      {
        heading: 'Urutan 5 Proyek Game Maker',
        bullets: [
          '01. Image Match: pencocokan gambar cepat & ketelitian visual.',
          '02. Memory Card: array kartu acak, flip state & pencocokan pasangan.',
          '03. Color Puzzle: logika tebak & susun kombinasi warna.',
          '04. Save the Polar Bear: menyelamatkan beruang kutub dari es mencair.',
          '05. Space Mission: game arcade roket luar angkasa dengan asteroid & skor.',
        ],
      },
    ],
  },

  {
    id: 'ai_ml',
    number: '06',
    title: 'Computer Vision & Machine Learning',
    shortTitle: '06. AI-ML Vision',
    trackLabel: 'AI-ML · Cartoonizer & Face Detection',
    accentColor: '#FDBA74',
    summary:
      'Kenali bagaimana komputer "melihat" piksel kamera, mengubah foto menjadi kartun dengan Sobel Edge, dan melacak 478 titik wajah secara real-time.',
    estimatedMinutes: 8,
    sandboxPrompt:
      'Pahami alur pipeline Input → Preprocess → Model ML → Output sebelum membuka kamera AI-ML!',
    slides: [
      {
        id: 'ml-s1',
        title: 'Bagaimana Komputer Melihat Gambar?',
        subtitle: 'Setiap gambar adalah matriks jutaan piksel [R, G, B]',
        narration:
          'Komputer tidak melihat wajah atau pemandangan secara langsung, melainkan deretan angka warna Merah, Hijau, dan Biru (RGB) dari 0 sampai 255 pada setiap titik piksel.',
        visualKind: 'vision_pipeline',
        character: 'panda',
        blocksPreview: ['Kamera RGB', 'Noise Smooth', 'Posterize LUT', 'Sobel Edge'],
        pythonCode: '# Pipeline Cartoonizer\nquantized = posterize(frame, levels=5)\nedges = sobel_edge(frame)\nresult = combine(quantized, edges)',
        jsCode: 'const gray = 0.299 * r + 0.587 * g + 0.114 * b;\nconst edge = Math.abs(gx) + Math.abs(gy) > threshold;',
        keyTakeaway:
          'Cartoonizer AI menggabungkan penyederhanaan warna (Quantization) + garis tepi tegas (Sobel Edge).',
      },
      {
        id: 'ml-s2',
        title: 'Face Detection & 478 Facial Landmarks',
        subtitle: 'Jaringan saraf tiruan melacak mata, hidung, bibir & ekspresi',
        narration:
          'Model Machine Learning MediaPipe FaceLandmarker memindai frame kamera real-time untuk menemukan lokasi wajah, 478 titik koordinat wajah, hingga skor ekspresi seperti Senyum dan Terkejut untuk menempelkan filter AR.',
        visualKind: 'vision_pipeline',
        character: 'bear',
        blocksPreview: ['Live Video', 'FaceLandmarker ML', '478 Mesh + Blendshapes', 'AR Filter'],
        pythonCode: '# Deteksi wajah & ekspresi real-time\nfaces = model.detect(camera_frame)\ndraw_ar_filter(faces, "glasses")',
        jsCode: 'const res = faceLandmarker.detectForVideo(video, now);\ndrawFaceOverlays(ctx, res.faceLandmarks);',
        keyTakeaway:
          'Semua pemrosesan AI berjalan langsung di browser perangkat Anda (On-Device ML) sehingga cepat dan menjaga privasi!',
      },
    ],
    quiz: [
      {
        id: 'mlq1',
        question: 'Dua teknik utama apa yang digunakan Cartoonizer AI untuk mengubah foto menjadi gaya komik?',
        options: [
          'Memutar gambar dan memotong tepi',
          'Color Quantization (menyederhanakan warna) + Sobel Edge Detection (garis tepi tinta)',
          'Mengubah audio menjadi teks',
          'Menghapus seluruh warna biru',
        ],
        correctIndex: 1,
        explanation:
          'Color Quantization menciptakan bidang warna rata khas kartun, sedangkan Sobel Edge menambahkan garis luar hitam tegas.',
      },
      {
        id: 'mlq2',
        question: 'Apa kegunaan titik Landmark wajah (mata kiri, mata kanan, dahi) pada Face Detection AI?',
        options: [
          'Menghitung kapasitas baterai laptop',
          'Menentukan posisi, ukuran, dan kemiringan Filter AR agar menempel akurat pada wajah',
          'Mempercepat koneksi Wi-Fi',
          'Mengubah bahasa browser',
        ],
        correctIndex: 1,
        explanation:
          'Koordinat mata kiri & kanan dipakai menghitung sudut kemiringan kepala sehingga kacamata & mahkota AR ikut miring secara alami!',
      },
    ],
    referenceNotes: [
      {
        heading: 'Proyek AI-ML Vision CodeSpark',
        bullets: [
          '01. Cartoonizer AI: filter Komik Pop, Anime Cerah, Sketsa Tinta & Split 50/50 langsung di kamera.',
          '02. Face Detection AI: pelacakan multi-wajah real-time MediaPipe, Face Mesh, skor ekspresi & Filter AR.',
        ],
      },
    ],
  },
];

export function getLearningMediaUnit(id: MediaUnitId): LearningMediaUnit {
  return LEARNING_MEDIA_UNITS.find((u) => u.id === id) || LEARNING_MEDIA_UNITS[0];
}
