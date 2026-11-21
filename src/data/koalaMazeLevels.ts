export type KoalaDir = 'N' | 'E' | 'S' | 'W';

export type KoalaBlockType =
  | 'move_forward'
  | 'turn'
  | 'repeat_times'
  | 'repeat_until_goal'
  | 'if_path'
  | 'if_else_path';

export type KoalaPathSensor = 'forward' | 'left' | 'right';

export interface KoalaBlockNode {
  id: string;
  type: KoalaBlockType;
  turnDir?: 'left' | 'right';
  count?: number;
  sensor?: KoalaPathSensor;
  children?: KoalaBlockNode[];
  elseChildren?: KoalaBlockNode[];
}

export interface KoalaSubLevel {
  id: string;
  levelIndex: number; // 1..4
  subIndex: number; // 1..5
  globalNumber: number; // 1..18
  title: string;
  instruction: string;
  tip: string;
  maxBlocks: number; // Including "ketika dijalankan" hat block (just like Code.org)
  grid: string[]; // 8 rows x 8 cols: '#' crate, 'S' stone, '.' path, '^' path with cyan hint
  start: { x: number; y: number; dir: KoalaDir };
  goal: { x: number; y: number };
  availableBlocks: KoalaBlockType[];
  starterBlocks: KoalaBlockNode[];
  solutionBlocks: KoalaBlockNode[];
}

export interface KoalaLevelGroup {
  levelNumber: number;
  title: string;
  shortTitle: string;
  concept: string;
  description: string;
  accentColor: string;
  videoTipTitle: string;
  videoTipSummary: string;
  subLevels: KoalaSubLevel[];
}

export const KOALA_MAZE_LEVELS: KoalaLevelGroup[] = [
  // ==================== LEVEL 1: URUTAN (SEKUENSIAL) ====================
  {
    levelNumber: 1,
    title: 'Level 1: Pengenalan Urutan',
    shortTitle: 'Level 1 · Urutan',
    concept: 'Sekuensial & Arah Belok',
    description: 'Belajar menyusun perintah Gerak maju dan Belok secara berurutan agar Koala menemukan daun eukaliptus.',
    accentColor: '#1CA8B8',
    videoTipTitle: 'Tips Urutan Langkah Koala',
    videoTipSummary:
      'Setiap blok "Gerak maju" memindahkan Koala 1 kotak ke depan sesuai arah hadapnya. Blok "belok kiri/kanan" memutar Koala di tempat sebesar 90°.',
    subLevels: [
      {
        id: 'km_1_1',
        levelIndex: 1,
        subIndex: 1,
        globalNumber: 1,
        title: 'Langkah Pertama Koala',
        instruction: 'Cobalah bantu saya meraih daun eukaliptus dengan menggunakan 2 blok Gerak maju.',
        tip: 'Klik atau seret blok "Gerak maju" sebanyak 2 kali ke bawah blok oranye "ketika dijalankan".',
        maxBlocks: 3,
        grid: [
          '########',
          '#S####S#',
          '##S##S##',
          '########',
          '##.^.###',
          '########',
          '##S##S##',
          '########',
        ],
        start: { x: 2, y: 4, dir: 'E' },
        goal: { x: 4, y: 4 },
        availableBlocks: ['move_forward', 'turn'],
        starterBlocks: [],
        solutionBlocks: [
          { id: 's11_1', type: 'move_forward' },
          { id: 's11_2', type: 'move_forward' },
        ],
      },
      {
        id: 'km_1_2',
        levelIndex: 1,
        subIndex: 2,
        globalNumber: 2,
        title: 'Jalan Lurus Hutan',
        instruction: 'Daun eukaliptus agak lebih jauh! Susun 3 blok Gerak maju agar Koala sampai di tujuan.',
        tip: 'Hitung jumlah kotak dari posisi Koala ke daun eukaliptus: tepat 3 langkah ke kanan.',
        maxBlocks: 4,
        grid: [
          '########',
          '#S####S#',
          '########',
          '##.^^.##',
          '########',
          '#S#S#S##',
          '########',
          '########',
        ],
        start: { x: 2, y: 3, dir: 'E' },
        goal: { x: 5, y: 3 },
        availableBlocks: ['move_forward', 'turn'],
        starterBlocks: [],
        solutionBlocks: [
          { id: 's12_1', type: 'move_forward' },
          { id: 's12_2', type: 'move_forward' },
          { id: 's12_3', type: 'move_forward' },
        ],
      },
      {
        id: 'km_1_3',
        levelIndex: 1,
        subIndex: 3,
        globalNumber: 3,
        title: 'Belokan Pertama',
        instruction: 'Jalur berbelok ke bawah! Gunakan Gerak maju dan belok kanan untuk membantu Koala.',
        tip: 'Maju 2 kali, lalu pasang "belok kanan", kemudian maju 2 kali lagi.',
        maxBlocks: 6,
        grid: [
          '########',
          '#S####S#',
          '##.^.###',
          '####^###',
          '####.###',
          '##S##S##',
          '########',
          '########',
        ],
        start: { x: 2, y: 2, dir: 'E' },
        goal: { x: 4, y: 4 },
        availableBlocks: ['move_forward', 'turn'],
        starterBlocks: [],
        solutionBlocks: [
          { id: 's13_1', type: 'move_forward' },
          { id: 's13_2', type: 'move_forward' },
          { id: 's13_3', type: 'turn', turnDir: 'right' },
          { id: 's13_4', type: 'move_forward' },
          { id: 's13_5', type: 'move_forward' },
        ],
      },
      {
        id: 'km_1_4',
        levelIndex: 1,
        subIndex: 4,
        globalNumber: 4,
        title: 'Jalur Zig-Zag',
        instruction: 'Lewati belokan kiri lalu belokan kanan untuk menangkap daun segar dengan hanya 6 blok!',
        tip: 'Koala menghadap kanan: maju 1, belok kiri (menghadap atas), maju 1, belok kanan, maju 1.',
        maxBlocks: 6,
        grid: [
          '########',
          '#S####S#',
          '########',
          '###^.###',
          '##.^####',
          '##S##S##',
          '########',
          '########',
        ],
        start: { x: 2, y: 4, dir: 'E' },
        goal: { x: 4, y: 3 },
        availableBlocks: ['move_forward', 'turn'],
        starterBlocks: [],
        solutionBlocks: [
          { id: 's14_1', type: 'move_forward' },
          { id: 's14_2', type: 'turn', turnDir: 'left' },
          { id: 's14_3', type: 'move_forward' },
          { id: 's14_4', type: 'turn', turnDir: 'right' },
          { id: 's14_5', type: 'move_forward' },
        ],
      },
      {
        id: 'km_1_5',
        levelIndex: 1,
        subIndex: 5,
        globalNumber: 5,
        title: 'Mengelilingi Peti Kayu',
        instruction: 'Peti kayu menghalangi di kanan! Ajak Koala memutar lewat atas menggunakan 7 blok.',
        tip: 'Koala menghadap atas: maju 1, belok kanan, maju 2, belok kanan, lalu maju 1 ke daun.',
        maxBlocks: 7,
        grid: [
          '########',
          '#S####S#',
          '########',
          '##.^.###',
          '##.#.###',
          '##S##S##',
          '########',
          '########',
        ],
        start: { x: 2, y: 4, dir: 'N' },
        goal: { x: 4, y: 4 },
        availableBlocks: ['move_forward', 'turn'],
        starterBlocks: [],
        solutionBlocks: [
          { id: 's15_1', type: 'move_forward' },
          { id: 's15_2', type: 'turn', turnDir: 'right' },
          { id: 's15_3', type: 'move_forward' },
          { id: 's15_4', type: 'move_forward' },
          { id: 's15_5', type: 'turn', turnDir: 'right' },
          { id: 's15_6', type: 'move_forward' },
        ],
      },
    ],
  },

  // ==================== LEVEL 2: PERULANGAN (LOOP ULANGI) ====================
  {
    levelNumber: 2,
    title: 'Level 2: Perulangan (Loop)',
    shortTitle: 'Level 2 · Loop',
    concept: 'Blok Ulangi N Kali',
    description: 'Gunakan blok merah muda "ulangi ... kali" untuk menghemat blok pada jalur panjang dan pola berulang!',
    accentColor: '#E63E97',
    videoTipTitle: 'Tips Menggunakan Blok Ulangi',
    videoTipSummary:
      'Daripada menumpuk 5 blok "Gerak maju", masukkan 1 blok "Gerak maju" ke dalam blok "ulangi 5 kali". Kode jauh lebih rapi dan hemat!',
    subLevels: [
      {
        id: 'km_2_1',
        levelIndex: 2,
        subIndex: 1,
        globalNumber: 6,
        title: 'Lompatan 5 Langkah',
        instruction: 'Cobalah bantu saya menangkap daun eukaliptus dengan menggunakan hanya tiga blok.',
        tip: 'Gunakan blok merah muda "ulangi 5 kali" lalu masukkan 1 blok "Gerak maju" ke dalamnya!',
        maxBlocks: 3,
        grid: [
          '####^###',
          '##^#.###',
          '#S##^#S#',
          '###S.###',
          '##^#.###',
          '###S^#^#',
          '####.###',
          '########',
        ],
        start: { x: 4, y: 1, dir: 'S' },
        goal: { x: 4, y: 6 },
        availableBlocks: ['move_forward', 'turn', 'repeat_times'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's21_1',
            type: 'repeat_times',
            count: 5,
            children: [{ id: 's21_2', type: 'move_forward' }],
          },
        ],
      },
      {
        id: 'km_2_2',
        levelIndex: 2,
        subIndex: 2,
        globalNumber: 7,
        title: 'Sudut Siku Loop',
        instruction: 'Gunakan dua blok "ulangi 4 kali" dan satu blok belok untuk menempuh lintasan siku.',
        tip: 'Pasang ulangi 4 kali (Gerak maju), lalu belok kanan, lalu ulangi 4 kali (Gerak maju).',
        maxBlocks: 6,
        grid: [
          '########',
          '#S####S#',
          '#.^^..##',
          '#####^##',
          '#####.##',
          '#####^##',
          '#####.##',
          '########',
        ],
        start: { x: 1, y: 2, dir: 'E' },
        goal: { x: 5, y: 6 },
        availableBlocks: ['move_forward', 'turn', 'repeat_times'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's22_1',
            type: 'repeat_times',
            count: 4,
            children: [{ id: 's22_2', type: 'move_forward' }],
          },
          { id: 's22_3', type: 'turn', turnDir: 'right' },
          {
            id: 's22_4',
            type: 'repeat_times',
            count: 4,
            children: [{ id: 's22_5', type: 'move_forward' }],
          },
        ],
      },
      {
        id: 'km_2_3',
        levelIndex: 2,
        subIndex: 3,
        globalNumber: 8,
        title: 'Tangga Hutan Koala',
        instruction: 'Jalur ini berbentuk tangga yang berulang 3 kali! Selesaikan dengan maksimal 6 blok.',
        tip: 'Di dalam "ulangi 3 kali", masukkan: Gerak maju, belok kanan, Gerak maju, belok kiri.',
        maxBlocks: 6,
        grid: [
          '########',
          '#..#####',
          '##..####',
          '###..###',
          '####.###',
          '##S##S##',
          '########',
          '########',
        ],
        start: { x: 1, y: 1, dir: 'E' },
        goal: { x: 4, y: 4 },
        availableBlocks: ['move_forward', 'turn', 'repeat_times'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's23_1',
            type: 'repeat_times',
            count: 3,
            children: [
              { id: 's23_2', type: 'move_forward' },
              { id: 's23_3', type: 'turn', turnDir: 'right' },
              { id: 's23_4', type: 'move_forward' },
              { id: 's23_5', type: 'turn', turnDir: 'left' },
            ],
          },
        ],
      },
      {
        id: 'km_2_4',
        levelIndex: 2,
        subIndex: 4,
        globalNumber: 9,
        title: 'Keliling Kebun Eukaliptus',
        instruction: 'Tiga sisi kebun memiliki panjang sama (3 langkah). Gunakan loop bersarang agar cukup 5 blok!',
        tip: 'Pasang "ulangi 3 kali", di dalamnya isi "ulangi 3 kali (Gerak maju)" lalu "belok kanan".',
        maxBlocks: 6,
        grid: [
          '########',
          '########',
          '##.^^.##',
          '##.##.##',
          '##^##^##',
          '##.##.##',
          '##S##S##',
          '########',
        ],
        start: { x: 2, y: 5, dir: 'N' },
        goal: { x: 5, y: 5 },
        availableBlocks: ['move_forward', 'turn', 'repeat_times'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's24_1',
            type: 'repeat_times',
            count: 3,
            children: [
              {
                id: 's24_2',
                type: 'repeat_times',
                count: 3,
                children: [{ id: 's24_3', type: 'move_forward' }],
              },
              { id: 's24_4', type: 'turn', turnDir: 'right' },
            ],
          },
        ],
      },
      {
        id: 'km_2_5',
        levelIndex: 2,
        subIndex: 5,
        globalNumber: 10,
        title: 'Terowongan Panjang',
        instruction: 'Koala harus naik 5 kotak lalu belok kanan 5 kotak! Gunakan 2 blok ulangi agar tetap 6 blok.',
        tip: 'Ulangi 5 kali (Gerak maju), belok kanan, lalu ulangi 5 kali (Gerak maju).',
        maxBlocks: 6,
        grid: [
          '########',
          '#.^^^..#',
          '#^######',
          '#.######',
          '#^##S###',
          '#.######',
          '#.######',
          '########',
        ],
        start: { x: 1, y: 6, dir: 'N' },
        goal: { x: 6, y: 1 },
        availableBlocks: ['move_forward', 'turn', 'repeat_times'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's25_1',
            type: 'repeat_times',
            count: 5,
            children: [{ id: 's25_2', type: 'move_forward' }],
          },
          { id: 's25_3', type: 'turn', turnDir: 'right' },
          {
            id: 's25_4',
            type: 'repeat_times',
            count: 5,
            children: [{ id: 's25_5', type: 'move_forward' }],
          },
        ],
      },
    ],
  },

  // ==================== LEVEL 3: ULANGI SAMPAI TUJUAN ====================
  {
    levelNumber: 3,
    title: 'Level 3: Ulangi Sampai Tujuan',
    shortTitle: 'Level 3 · Sampai Daun',
    concept: 'While Loop (Ulangi Sampai)',
    description: 'Dengan blok "ulangi sampai Daun", Koala terus mengulang perintah tanpa perlu menghitung jumlah kotak!',
    accentColor: '#C026D3',
    videoTipTitle: 'Tips Blok Ulangi Sampai Daun',
    videoTipSummary:
      'Blok "ulangi sampai Daun" otomatis berhenti tepat saat Koala menyentuh daun eukaliptus. Cocok untuk jalur panjang atau pola berulang!',
    subLevels: [
      {
        id: 'km_3_1',
        levelIndex: 3,
        subIndex: 1,
        globalNumber: 11,
        title: 'Terus Maju Sampai Daun',
        instruction: 'Cobalah blok baru "ulangi sampai Daun" agar Koala terus berjalan hingga menemukan daun!',
        tip: 'Cukup masukkan 1 blok "Gerak maju" ke dalam "ulangi sampai Daun" (total 3 blok).',
        maxBlocks: 3,
        grid: [
          '########',
          '#S####S#',
          '########',
          '########',
          '#.^^^^.#',
          '########',
          '#S####S#',
          '########',
        ],
        start: { x: 1, y: 4, dir: 'E' },
        goal: { x: 6, y: 4 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's31_1',
            type: 'repeat_until_goal',
            children: [{ id: 's31_2', type: 'move_forward' }],
          },
        ],
      },
      {
        id: 'km_3_2',
        levelIndex: 3,
        subIndex: 2,
        globalNumber: 12,
        title: 'Tangga Naik Otomatis',
        instruction: 'Naiki tangga batu hingga puncak daun menggunakan blok "ulangi sampai Daun" (6 blok).',
        tip: 'Masukkan: Gerak maju, belok kiri, Gerak maju, belok kanan ke dalam "ulangi sampai Daun".',
        maxBlocks: 6,
        grid: [
          '########',
          '########',
          '#####.##',
          '####..##',
          '###..###',
          '##..####',
          '#..#####',
          '########',
        ],
        start: { x: 1, y: 6, dir: 'E' },
        goal: { x: 5, y: 2 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's32_1',
            type: 'repeat_until_goal',
            children: [
              { id: 's32_2', type: 'move_forward' },
              { id: 's32_3', type: 'turn', turnDir: 'left' },
              { id: 's32_4', type: 'move_forward' },
              { id: 's32_5', type: 'turn', turnDir: 'right' },
            ],
          },
        ],
      },
      {
        id: 'km_3_3',
        levelIndex: 3,
        subIndex: 3,
        globalNumber: 13,
        title: 'Tangga Besar 2 Langkah',
        instruction: 'Setiap anak tangga butuh 2 langkah! Susun polanya di dalam "ulangi sampai Daun".',
        tip: 'Di dalam ulangi sampai Daun: maju, maju, belok kanan, maju, maju, belok kiri.',
        maxBlocks: 8,
        grid: [
          '########',
          '#..^####',
          '###.####',
          '###..^##',
          '#####.##',
          '#####.##',
          '##S#####',
          '########',
        ],
        start: { x: 1, y: 1, dir: 'E' },
        goal: { x: 5, y: 5 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's33_1',
            type: 'repeat_until_goal',
            children: [
              { id: 's33_2', type: 'move_forward' },
              { id: 's33_3', type: 'move_forward' },
              { id: 's33_4', type: 'turn', turnDir: 'right' },
              { id: 's33_5', type: 'move_forward' },
              { id: 's33_6', type: 'move_forward' },
              { id: 's33_7', type: 'turn', turnDir: 'left' },
            ],
          },
        ],
      },
      {
        id: 'km_3_4',
        levelIndex: 3,
        subIndex: 4,
        globalNumber: 14,
        title: 'Tebing Eukaliptus',
        instruction: 'Pola jalur ini maju 2 langkah lalu turun 1 langkah berulang kali. Bantu Koala sampai ujung!',
        tip: 'Di dalam ulangi sampai Daun: maju, maju, belok kanan, maju, belok kiri.',
        maxBlocks: 7,
        grid: [
          '########',
          '#..^####',
          '###..^##',
          '#####..^',
          '###S####',
          '##S##S##',
          '########',
          '########',
        ],
        start: { x: 1, y: 1, dir: 'E' },
        goal: { x: 7, y: 3 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's34_1',
            type: 'repeat_until_goal',
            children: [
              { id: 's34_2', type: 'move_forward' },
              { id: 's34_3', type: 'move_forward' },
              { id: 's34_4', type: 'turn', turnDir: 'right' },
              { id: 's34_5', type: 'move_forward' },
              { id: 's34_6', type: 'turn', turnDir: 'left' },
            ],
          },
        ],
      },
    ],
  },

  // ==================== LEVEL 4: LOGIKA PERCABANGAN (JIKA / JIKA TIDAK) ====================
  {
    levelNumber: 4,
    title: 'Level 4: Logika Percabangan',
    shortTitle: 'Level 4 · Logika Jika',
    concept: 'Kondisi If & If-Else',
    description: 'Berikan sensor pintar pada Koala dengan blok biru "jika jalan ke depan/kiri/kanan" agar mampu memecahkan labirin otomatis!',
    accentColor: '#2596D1',
    videoTipTitle: 'Tips Sensor Jalan Koala (Jika)',
    videoTipSummary:
      'Gabungkan "ulangi sampai Daun" dengan blok biru "jika jalan ke depan". Jika depan kosong Koala maju, jika buntu Koala otomatis berbelok!',
    subLevels: [
      {
        id: 'km_4_1',
        levelIndex: 4,
        subIndex: 1,
        globalNumber: 15,
        title: 'Spiral Belok Kanan',
        instruction: 'Labirin spiral ini selalu berbelok ke kanan saat buntu! Gunakan "jika / jika tidak" dalam 5 blok.',
        tip: 'Ulangi sampai Daun -> jika jalan ke depan: Gerak maju; jika tidak: belok kanan.',
        maxBlocks: 5,
        grid: [
          '########',
          '#.^^^^.#',
          '######.#',
          '#.^.##.#',
          '#.####.#',
          '#.####.#',
          '#.^^^^.#',
          '########',
        ],
        start: { x: 1, y: 1, dir: 'E' },
        goal: { x: 3, y: 3 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal', 'if_path', 'if_else_path'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's41_1',
            type: 'repeat_until_goal',
            children: [
              {
                id: 's41_2',
                type: 'if_else_path',
                sensor: 'forward',
                children: [{ id: 's41_3', type: 'move_forward' }],
                elseChildren: [{ id: 's41_4', type: 'turn', turnDir: 'right' }],
              },
            ],
          },
        ],
      },
      {
        id: 'km_4_2',
        levelIndex: 4,
        subIndex: 2,
        globalNumber: 16,
        title: 'Spiral Belok Kiri',
        instruction: 'Sekarang arah spiral berlawanan! Buat Koala berbelok kiri setiap kali jalan di depan buntu.',
        tip: 'Ulangi sampai Daun -> jika jalan ke depan: Gerak maju; jika tidak: belok kiri.',
        maxBlocks: 5,
        grid: [
          '########',
          '#.^^^^.#',
          '#.####.#',
          '#.####.#',
          '#.##.#.#',
          '#.##^#.#',
          '#....#.#',
          '########',
        ],
        start: { x: 6, y: 6, dir: 'N' },
        goal: { x: 4, y: 4 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal', 'if_path', 'if_else_path'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's42_1',
            type: 'repeat_until_goal',
            children: [
              {
                id: 's42_2',
                type: 'if_else_path',
                sensor: 'forward',
                children: [{ id: 's42_3', type: 'move_forward' }],
                elseChildren: [{ id: 's42_4', type: 'turn', turnDir: 'left' }],
              },
            ],
          },
        ],
      },
      {
        id: 'km_4_3',
        levelIndex: 4,
        subIndex: 3,
        globalNumber: 17,
        title: 'Sensor Belokan Kanan',
        instruction: 'Gunakan blok "jika jalan ke kanan" agar Koala langsung berbelok saat melihat lorong kanan!',
        tip: 'Ulangi sampai Daun -> Gerak maju, lalu "jika jalan ke kanan: belok kanan".',
        maxBlocks: 5,
        grid: [
          '########',
          '#.^^^.##',
          '#####.##',
          '#####^##',
          '#####.##',
          '##.^^.##',
          '########',
          '########',
        ],
        start: { x: 1, y: 1, dir: 'E' },
        goal: { x: 2, y: 5 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal', 'if_path', 'if_else_path'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's43_1',
            type: 'repeat_until_goal',
            children: [
              { id: 's43_2', type: 'move_forward' },
              {
                id: 's43_3',
                type: 'if_path',
                sensor: 'right',
                children: [{ id: 's43_4', type: 'turn', turnDir: 'right' }],
              },
            ],
          },
        ],
      },
      {
        id: 'km_4_4',
        levelIndex: 4,
        subIndex: 4,
        globalNumber: 18,
        title: 'Master Labirin Koala',
        instruction: 'Tantangan terakhir! Lorong berbelok ke kanan dan ke kiri. Pasang dua sensor "jika" sekaligus!',
        tip: 'Di dalam ulangi sampai Daun: Gerak maju, jika jalan ke kanan -> belok kanan, jika jalan ke kiri -> belok kiri.',
        maxBlocks: 7,
        grid: [
          '########',
          '###.^^.#',
          '###.####',
          '###^####',
          '#.^.####',
          '#.######',
          '#.######',
          '########',
        ],
        start: { x: 1, y: 6, dir: 'N' },
        goal: { x: 6, y: 1 },
        availableBlocks: ['move_forward', 'turn', 'repeat_until_goal', 'if_path', 'if_else_path'],
        starterBlocks: [],
        solutionBlocks: [
          {
            id: 's44_1',
            type: 'repeat_until_goal',
            children: [
              { id: 's44_2', type: 'move_forward' },
              {
                id: 's44_3',
                type: 'if_path',
                sensor: 'right',
                children: [{ id: 's44_4', type: 'turn', turnDir: 'right' }],
              },
              {
                id: 's44_5',
                type: 'if_path',
                sensor: 'left',
                children: [{ id: 's44_6', type: 'turn', turnDir: 'left' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const ALL_KOALA_SUBLEVELS: KoalaSubLevel[] = KOALA_MAZE_LEVELS.flatMap(
  (lvl) => lvl.subLevels
);

export function getKoalaSubLevelById(id: string): KoalaSubLevel | undefined {
  return ALL_KOALA_SUBLEVELS.find((s) => s.id === id);
}
