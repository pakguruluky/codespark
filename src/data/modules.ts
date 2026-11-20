import type { TierId } from '../types';
import type { CharacterId } from '../components/PandaMascot';

export interface ModuleCommandCard {
  id: string;
  blockLabel: string;
  blockParam?: string;
  blockKind: 'forward' | 'turn' | 'repeat' | 'if_clear' | 'else' | 'if_gem';
  buttonSyntax: string;
  explanation: string;
  sampleCode: string;
  sampleComment: string;
}

export interface ModuleVisualBlock {
  label: string;
  param?: string;
  kind: 'forward' | 'turn' | 'repeat' | 'if_clear' | 'else' | 'if_gem';
  children?: ModuleVisualBlock[];
  elseChildren?: ModuleVisualBlock[];
}

export interface ModuleSampleSolution {
  stageTitle: string;
  character: CharacterId;
  algorithmSteps: string[];
  blocks: ModuleVisualBlock[];
  pythonCode: string;
  jsCode: string;
}

export interface TierModuleGuide {
  tierId: TierId;
  number: string;
  subjectTitle: string;
  badge: string;
  overviewParagraphs: string[];
  learningOutcomes: string[];
  commandsUsed: string[];
  commandCards: ModuleCommandCard[];
  characterIntro: string;
  stageCharacters: { stage: number; character: CharacterId; role: string }[];
  warnings: [
    { title: string; body: string },
    { title: string; body: string },
  ];
  sampleSolutions: ModuleSampleSolution[];
}

export const TIER_MODULES: Record<TierId, TierModuleGuide> = {
  pemula: {
    tierId: 'pemula',
    number: '01',
    subjectTitle: 'Materi 01: Dasar-Dasar Coding (Tingkat Pemula)',
    badge: 'Level 1 – Level 3 · Dasar Algoritma & Loop',
    overviewParagraphs: [
      'Pada pelajaran pertama ini, peserta akan memasuki dunia pemrograman bersama platform CodeSpark. Peserta mempelajari dasar berpikir komputasional melalui penyusunan urutan perintah (algoritma) untuk memandu karakter petualang mengambil permata dan mencapai lentera tujuan.',
      'Materi disusun bertahap dari mudah ke menantang dengan transisi halus pada setiap stage. Melalui mode Blok visual yang tersinkronisasi otomatis ke bahasa Python dan JavaScript, peserta mulai melatih cara memecahkan masalah langkah demi langkah seperti seorang programmer.',
    ],
    learningOutcomes: [
      'Memahami dasar berpikir komputasional (computational thinking) dan penyusunan algoritma berurutan.',
      'Mengenal konsep perintah maju (forward), berbelok (turn), serta pengulangan (repeat / for loop).',
      'Melihat hubungan langsung antara blok kode visual dengan sintaks Python dan JavaScript.',
      'Mengoperasikan studio coding interaktif (tombol Jalankan, Reset, Kecepatan, dan Panduan).',
      'Menyelesaikan 3 misi awal (Level 1–3) dan meraih Sertifikat Tingkat Pemula.',
    ],
    commandsUsed: [
      'forward(a)',
      'turn("left")',
      'turn("right")',
      'repeat(n) / for i in range(n):',
    ],
    commandCards: [
      {
        id: 'p-forward',
        blockLabel: 'forward',
        blockParam: '4',
        blockKind: 'forward',
        buttonSyntax: 'forward( )',
        explanation:
          'Digunakan untuk menggerakkan karakter maju lurus sesuai arah hadapnya. Jumlah langkah mengikuti angka yang ditulis di dalam parameter.',
        sampleCode: 'forward(4)',
        sampleComment: '// menggerakkan karakter maju 4 kotak ke depan',
      },
      {
        id: 'p-turn',
        blockLabel: 'turn',
        blockParam: 'left ▾',
        blockKind: 'turn',
        buttonSyntax: 'turn( )',
        explanation:
          'Digunakan untuk memutar arah hadap karakter sebesar 90° di tempat. Karakter dapat berbelok ke kiri ("left") atau ke kanan ("right").',
        sampleCode: 'turn("left")\nturn("right")',
        sampleComment: '// mengubah arah hadap sebelum melangkah',
      },
      {
        id: 'p-repeat',
        blockLabel: 'repeat',
        blockParam: '5',
        blockKind: 'repeat',
        buttonSyntax: 'for i in range(5):',
        explanation:
          'Digunakan untuk mengulang perintah yang berada di dalamnya sebanyak n kali secara otomatis, sehingga kode jauh lebih ringkas dan efisien.',
        sampleCode: 'for i in range(5):\n  forward(1)',
        sampleComment: '// mengulang langkah maju sebanyak 5 kali',
      },
    ],
    characterIntro:
      'Setiap pergantian stage pada Tingkat Pemula ditemani oleh karakter petualang yang berbeda. Perintah yang Anda tulis otomatis menggerakkan karakter aktif di arena tanpa perlu menulis nama karakter.',
    stageCharacters: [
      { stage: 1, character: 'panda', role: 'Stage 1 — Langkah Pertama (Sequence)' },
      { stage: 2, character: 'bear', role: 'Stage 2 — Belok & Ambil Permata (Rotasi)' },
      { stage: 3, character: 'koala', role: 'Stage 3 — Pengulangan Lorong (Loop)' },
    ],
    warnings: [
      {
        title: 'PERINGATAN 1',
        body: 'Pada mode Blok, cukup klik blok perintah di kolom kiri agar langsung tersusun rapi di bawah blok START. Saat berpindah ke tab Python atau JavaScript, kode teks akan otomatis dibuat dan bisa langsung diedit.',
      },
      {
        title: 'PERINGATAN 2',
        body: 'Perhatikan tanda panah kuning di bawah kaki karakter sebelum memilih turn("left") atau turn("right"). Pastikan seluruh permata di jalur diambil sebelum menyentuh bendera/lentera tujuan agar misi dianggap selesai.',
      },
    ],
    sampleSolutions: [
      {
        stageTitle: 'Contoh Solusi: Stage 1 (Langkah Pertama)',
        character: 'panda',
        algorithmSteps: [
          'Mulai (START)',
          'Hitung jarak Panda ke lentera tujuan (4 kotak)',
          'Jalankan perintah maju 4 kotak lurus',
          'Ambil 2 permata otomatis di sepanjang jalur',
        ],
        blocks: [{ label: 'forward', param: '4', kind: 'forward' }],
        pythonCode: 'forward(4)',
        jsCode: 'forward(4);',
      },
      {
        stageTitle: 'Contoh Solusi: Stage 2 (Belok & Ambil Permata)',
        character: 'bear',
        algorithmSteps: [
          'Mulai (START)',
          'Beruang maju 2 kotak menuju permata pertama',
          'Belok ke kiri sebelum menabrak batu',
          'Maju 3 kotak mengambil permata kedua & masuk tujuan',
        ],
        blocks: [
          { label: 'forward', param: '2', kind: 'forward' },
          { label: 'turn', param: 'left ▾', kind: 'turn' },
          { label: 'forward', param: '3', kind: 'forward' },
        ],
        pythonCode: 'forward(2)\nturn("left")\nforward(3)',
        jsCode: 'forward(2);\nturn("left");\nforward(3);',
      },
    ],
  },

  menengah: {
    tierId: 'menengah',
    number: '02',
    subjectTitle: 'Materi 02: Logika Percabangan & Pola (Tingkat Menengah)',
    badge: 'Level 4 – Level 6 · Sensor If/Else & Pola',
    overviewParagraphs: [
      'Pada Tingkat Menengah, peserta naik satu tingkat dari instruksi statis menuju pemrograman cerdas yang mampu mengambil keputusan sendiri. Peserta belajar mengenali rintangan, menyusun rute memutar, serta memanfaatkan sensor kondisi (if / else).',
      'Peserta juga berlatih menemukan pola berulang (pattern recognition) seperti jalur anak tangga agar rangkaian langkah panjang dapat diringkas hanya dalam beberapa baris kode Python maupun JavaScript.',
    ],
    learningOutcomes: [
      'Merancang rute penghindaran rintangan (pathfinding) secara terstruktur.',
      'Menggunakan percabangan kondisional if path_clear() dan blok else untuk keputusan otomatis.',
      'Menggabungkan perulangan (repeat / for) dengan percabangan bersarang (nested logic).',
      'Mengidentifikasi pola langkah berulang untuk menyederhanakan kode dan meraih 3 bintang.',
      'Menyelesaikan 3 tantangan Tingkat Menengah (Level 4–6) dan meraih Sertifikat Tingkat Menengah.',
    ],
    commandsUsed: [
      'if path_clear():',
      'else:',
      'if (pathClear()) { ... } else { ... }',
      'repeat(n)',
      'forward(a)',
      'turn("left") / turn("right")',
    ],
    commandCards: [
      {
        id: 'm-if-clear',
        blockLabel: 'if path_clear()',
        blockKind: 'if_clear',
        buttonSyntax: 'if path_clear():',
        explanation:
          'Sensor cerdas untuk memeriksa apakah 1 kotak tepat di depan karakter aman (bukan batu/pohon dan bukan tepi pulau). Jika aman, perintah di dalamnya dijalankan.',
        sampleCode: 'if path_clear():\n  forward(1)',
        sampleComment: '// maju 1 langkah hanya jika jalan di depan aman',
      },
      {
        id: 'm-else',
        blockLabel: 'else: (terhalang)',
        blockKind: 'else',
        buttonSyntax: 'else:',
        explanation:
          'Blok cadangan yang otomatis dijalankan ketika kondisi if path_clear() bernilai salah (terdapat batu atau batas pulau di depan karakter).',
        sampleCode: 'if path_clear():\n  forward(1)\nelse:\n  turn("left")',
        sampleComment: '// otomatis belok kiri jika menemui rintangan',
      },
      {
        id: 'm-pattern',
        blockLabel: 'repeat',
        blockParam: '3',
        blockKind: 'repeat',
        buttonSyntax: 'for (let i=0; i<3; i++)',
        explanation:
          'Digunakan untuk mengulang satu pola gerakan majemuk (misalnya: maju → belok kiri → maju → belok kanan) untuk menapaki pola tangga batu.',
        sampleCode: 'for i in range(3):\n  forward(1)\n  turn("left")\n  forward(1)\n  turn("right")',
        sampleComment: '// mengulang 1 pola anak tangga sebanyak 3 kali',
      },
    ],
    characterIntro:
      'Ketiga karakter petualang kembali bergantian memandu misi logika pada Tingkat Menengah. Perhatikan kombinasi sensor dan arah belok pada tiap stage!',
    stageCharacters: [
      { stage: 4, character: 'panda', role: 'Stage 4 — Hindari Rintangan (Pathfinding)' },
      { stage: 5, character: 'bear', role: 'Stage 5 — Percabangan If / Else Otomatis' },
      { stage: 6, character: 'koala', role: 'Stage 6 — Pengumpulan Berpola Tangga' },
    ],
    warnings: [
      {
        title: 'PERINGATAN 1',
        body: 'Saat mengetik di tab Python, perhatikan indentasi (2 spasi di awal baris) di dalam blok for, if, dan else. Pada mode Blok, klik tombol "+ Isi di sini" atau "+ Isi Else" terlebih dahulu sebelum memilih blok agar masuk ke wadah yang tepat.',
      },
      {
        title: 'PERINGATAN 2',
        body: 'Sensor path_clear() hanya memeriksa 1 kotak tepat di depan arah hadap karakter saat itu. Letakkan blok if path_clear() di dalam repeat(n) agar karakter terus mengecek jalan pada setiap langkahnya.',
      },
    ],
    sampleSolutions: [
      {
        stageTitle: 'Contoh Solusi: Stage 5 (Percabangan If / Else)',
        character: 'bear',
        algorithmSteps: [
          'Mulai (START)',
          'Ulangi pengecekan sebanyak 7 kali',
          'Jika jalan di depan aman (path_clear), maju 1 kotak',
          'Jika terhalang (else), Beruang otomatis belok kiri',
        ],
        blocks: [
          {
            label: 'repeat',
            param: '7',
            kind: 'repeat',
            children: [
              {
                label: 'if path_clear()',
                kind: 'if_clear',
                children: [{ label: 'forward', param: '1', kind: 'forward' }],
                elseChildren: [{ label: 'turn', param: 'left ▾', kind: 'turn' }],
              },
            ],
          },
        ],
        pythonCode: 'for i in range(7):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        jsCode:
          'for (let i = 0; i < 7; i++) {\n  if (pathClear()) {\n    forward(1);\n  } else {\n    turn("left");\n  }\n}',
      },
      {
        stageTitle: 'Contoh Solusi: Stage 6 (Pengumpulan Berpola)',
        character: 'koala',
        algorithmSteps: [
          'Mulai (START)',
          'Ulangi pola tangga 3 kali: maju 1, belok kiri, maju 1, belok kanan',
          'Setelah keluar dari loop, maju 1 kotak terakhir ke tujuan',
        ],
        blocks: [
          {
            label: 'repeat',
            param: '3',
            kind: 'repeat',
            children: [
              { label: 'forward', param: '1', kind: 'forward' },
              { label: 'turn', param: 'left ▾', kind: 'turn' },
              { label: 'forward', param: '1', kind: 'forward' },
              { label: 'turn', param: 'right ▾', kind: 'turn' },
            ],
          },
          { label: 'forward', param: '1', kind: 'forward' },
        ],
        pythonCode:
          'for i in range(3):\n  forward(1)\n  turn("left")\n  forward(1)\n  turn("right")\nforward(1)',
        jsCode:
          'for (let i = 0; i < 3; i++) {\n  forward(1);\n  turn("left");\n  forward(1);\n  turn("right");\n}\nforward(1);',
      },
    ],
  },

  lanjutan: {
    tierId: 'lanjutan',
    number: '03',
    subjectTitle: 'Materi 03: Algoritma Kompleks & AI Navigator (Tingkat Lanjutan)',
    badge: 'Level 7 – Level 9 · Navigasi Otonom & Optimasi',
    overviewParagraphs: [
      'Pada Tingkat Lanjutan, peserta berperan sebagai perancang algoritma otonom dan AI Navigator. Alih-alih memerintahkan setiap belokan secara manual, peserta membuat satu siklus keputusan cerdas (Sense-Plan-Act) agar karakter mampu menembus labirin kompleks secara mandiri.',
      'Fokus utama materi ini adalah efisiensi kode (Code Optimization): semakin ringkas dan cerdas algoritma yang ditulis, semakin tinggi skor bintang yang diperoleh hingga meraih predikat 3 Bintang penuh dan Sertifikat Tingkat Lanjutan.',
    ],
    learningOutcomes: [
      'Menerapkan siklus AI Sense-Plan-Act (Pindai → Putuskan → Jalankan) untuk navigasi otonom.',
      'Menyelesaikan labirin multi-belokan hanya dengan 4–5 baris kode yang sangat efisien.',
      'Menggunakan sensor deteksi objek if gem_ahead() untuk strategi pengambilan permata.',
      'Mengoptimalkan jumlah baris kode agar memenuhi target efisiensi 3 Bintang.',
      'Menyelesaikan seluruh tantangan final (Level 7–9) dan meraih Sertifikat Tingkat Lanjutan.',
    ],
    commandsUsed: [
      'if path_clear(): ... else:',
      'if gem_ahead():',
      'for i in range(n):',
      'turn("left") / turn("right")',
    ],
    commandCards: [
      {
        id: 'l-sense-act',
        blockLabel: 'if path_clear()',
        blockKind: 'if_clear',
        buttonSyntax: 'Sense-Plan-Act Loop',
        explanation:
          'Pola inti robot/AI otonom: di dalam loop repeat(n), karakter terus memindai depan (Sense), memutuskan maju atau belok (Plan), lalu bergerak (Act).',
        sampleCode: 'for i in range(13):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        sampleComment: '// menembus labirin spiral otomatis hanya 5 baris',
      },
      {
        id: 'l-gem-ahead',
        blockLabel: 'if gem_ahead()',
        blockKind: 'if_gem',
        buttonSyntax: 'if gem_ahead():',
        explanation:
          'Sensor pendeteksi permata energi tepat 1 kotak di depan karakter. Berguna saat merancang keputusan prioritas untuk mengambil objek target.',
        sampleCode: 'if gem_ahead():\n  forward(1)',
        sampleComment: '// langsung maju mengambil permata saat terdeteksi',
      },
      {
        id: 'l-optimize',
        blockLabel: 'repeat',
        blockParam: '16',
        blockKind: 'repeat',
        buttonSyntax: 'Target 3★ ≤ 5 baris',
        explanation:
          'Sistem penilaian CodeSpark menghitung efektivitas baris kode. Menggabungkan repeat + if/else jauh lebih hemat baris dibanding menulis forward & turn berulang kali.',
        sampleCode: 'for i in range(16):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        sampleComment: '// 1 loop cerdas untuk memindai 4 sudut pulau',
      },
    ],
    characterIntro:
      'Pada tantangan final, Panda menembus Labirin Cerdas (Stage 7), Beruang menguji Optimasi Langkah arah kanan (Stage 8), dan Koala memimpin Misi AI Navigator 4 sudut (Stage 9).',
    stageCharacters: [
      { stage: 7, character: 'panda', role: 'Stage 7 — Labirin Cerdas (Autonomous Maze)' },
      { stage: 8, character: 'bear', role: 'Stage 8 — Optimasi Langkah Efisien (Belok Kanan)' },
      { stage: 9, character: 'koala', role: 'Stage 9 — Misi AI Navigator Final (4 Sudut)' },
    ],
    warnings: [
      {
        title: 'PERINGATAN 1',
        body: 'Hitung jumlah iterasi repeat(n) dengan cermat! Setiap belokan (turn) juga dihitung 1 iterasi di dalam loop if/else. Jika jumlah langkah melebihi 120, simulator akan menghentikan program secara otomatis untuk mencegah infinite loop.',
      },
      {
        title: 'PERINGATAN 2',
        body: 'Untuk meraih 3 Bintang penuh pada Level 7–9, usahakan jumlah baris kode ≤ 5 baris. Amati pola belokan labirin: Level 7 & 9 selalu berbelok ke kiri ("left"), sedangkan Level 8 selalu berbelok ke kanan ("right").',
      },
    ],
    sampleSolutions: [
      {
        stageTitle: 'Contoh Solusi: Stage 8 (Optimasi Langkah Efisien)',
        character: 'bear',
        algorithmSteps: [
          'Mulai (Beruang menghadap ke Utara)',
          'Jalankan loop otonom sebanyak 12 iterasi',
          'Jika jalan depan aman, maju 1 kotak',
          'Jika bertemu batu/tepi, otomatis belok kanan ("right")',
        ],
        blocks: [
          {
            label: 'repeat',
            param: '12',
            kind: 'repeat',
            children: [
              {
                label: 'if path_clear()',
                kind: 'if_clear',
                children: [{ label: 'forward', param: '1', kind: 'forward' }],
                elseChildren: [{ label: 'turn', param: 'right ▾', kind: 'turn' }],
              },
            ],
          },
        ],
        pythonCode: 'for i in range(12):\n  if path_clear():\n    forward(1)\n  else:\n    turn("right")',
        jsCode:
          'for (let i = 0; i < 12; i++) {\n  if (pathClear()) {\n    forward(1);\n  } else {\n    turn("right");\n  }\n}',
      },
      {
        stageTitle: 'Contoh Solusi: Stage 9 (Misi AI Navigator)',
        character: 'koala',
        algorithmSteps: [
          'Mulai (Koala AI Navigator memindai pulau)',
          'Jalankan siklus Sense-Plan-Act sebanyak 16 kali',
          'Jika jalan aman → maju 1 kotak menyapu 4 permata',
          'Jika terhalang → belok kiri otomatis menuju AI Core',
        ],
        blocks: [
          {
            label: 'repeat',
            param: '16',
            kind: 'repeat',
            children: [
              {
                label: 'if path_clear()',
                kind: 'if_clear',
                children: [{ label: 'forward', param: '1', kind: 'forward' }],
                elseChildren: [{ label: 'turn', param: 'left ▾', kind: 'turn' }],
              },
            ],
          },
        ],
        pythonCode: 'for i in range(16):\n  if path_clear():\n    forward(1)\n  else:\n    turn("left")',
        jsCode:
          'for (let i = 0; i < 16; i++) {\n  if (pathClear()) {\n    forward(1);\n  } else {\n    turn("left");\n  }\n}',
      },
    ],
  },
};

export function getModuleForTier(tier: TierId): TierModuleGuide {
  return TIER_MODULES[tier] || TIER_MODULES.pemula;
}
