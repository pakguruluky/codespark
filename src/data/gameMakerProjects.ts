import type { GameMakerProjectId } from '../types';

export interface GameMakerStepBlock {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  badgeColor: string;
}

export interface GameMakerProjectDef {
  id: GameMakerProjectId;
  order: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  accentColor: string;
  concept: string;
  overview: string;
  learningGoals: string[];
  defaultGameName: string;
  steps: GameMakerStepBlock[];
  starterEnabledStepIds: string[];
}

export const GAME_MAKER_PROJECTS: GameMakerProjectDef[] = [
  {
    id: 'game_image_match',
    order: 1,
    title: 'Image Match',
    shortTitle: 'Image Match',
    subtitle: 'Bangun game pencocokan gambar cepat dengan sistem skor & kombo',
    accentColor: '#FFE600',
    concept: 'Event Handling, Target Comparison & Combo Scoring',
    overview:
      'Di proyek pertama Game Maker, Anda merancang game Image Match: pemain harus cepat memilih gambar di papan grid yang persis sama dengan Gambar Target untuk mengumpulkan poin dan kombo beruntun!',
    learningGoals: [
      'Menyusun papan gambar target dan grid pilihan gambar acak.',
      'Membandingkan gambar pilihan pemain dengan gambar target menggunakan kondisi if.',
      'Menambahkan penghitung waktu & pengganda skor kombo beruntun.',
      'Menetapkan target kemenangan ronde dan layar hasil akhir.',
    ],
    defaultGameName: 'Image Match Rush',
    starterEnabledStepIds: ['gm_im_board'],
    steps: [
      {
        id: 'gm_im_board',
        title: '1. Papan Target & Grid Gambar',
        description: 'Menampilkan kartu gambar target di atas dan 6 pilihan gambar acak.',
        codeSnippet: 'game.addScene("ImageMatchBoard", { gridSize: 6 });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_im_check',
        title: '2. Mesin Pencocokan & Skor',
        description: 'Memeriksa kecocokan gambar yang diklik lalu menambah skor +10 poin.',
        codeSnippet: 'game.addRule("MatchChecker", { pointsPerMatch: 10 });',
        badgeColor: '#4ADE80',
      },
      {
        id: 'gm_im_combo',
        title: '3. Bonus Kombo & Ronde Acak',
        description: 'Menghitung kombo beruntun & mengacak ulang posisi setiap ronde.',
        codeSnippet: 'game.addFeature("ComboEngine", { streakBonus: true });',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_im_win',
        title: '4. Target Menang (6 Cocok)',
        description: 'Mendeteksi saat pemain mencapai 6 kecocokan untuk menuntaskan misi.',
        codeSnippet: 'game.addFeature("WinCondition", { targetMatches: 6 });',
        badgeColor: '#C084FC',
      },
    ],
  },
  {
    id: 'game_memory_card',
    order: 2,
    title: 'Memory Card',
    shortTitle: 'Memory Card',
    subtitle: 'Ciptakan permainan balik kartu memori 6 pasang dengan pelacak langkah',
    accentColor: '#C084FC',
    concept: 'Array Shuffling, Flip State Machine & Pair Matching',
    overview:
      'Pada proyek kedua, Anda membangun game klasik Memory Card! Pemain membalik dua kartu sekaligus untuk menemukan seluruh 6 pasangan simbol yang tersembunyi dengan langkah seefisien mungkin.',
    learningGoals: [
      'Membuat dek 12 kartu (6 pasang ikon) yang teracak otomatis setiap mulai.',
      'Mengatur state kartu terbuka, tertutup, dan pasangan yang sudah cocok.',
      'Mencatat jumlah langkah (moves) serta jumlah pasangan ditemukan.',
      'Menampilkan layar kemenangan otomatis ketika semua 6 pasang ditemukan.',
    ],
    defaultGameName: 'Spark Memory Flip',
    starterEnabledStepIds: ['gm_mc_deck'],
    steps: [
      {
        id: 'gm_mc_deck',
        title: '1. Dek 12 Kartu (6 Pasang) & Acak',
        description: 'Menyusun grid kartu 4×3 tertutup yang diacak posisinya.',
        codeSnippet: 'game.addScene("MemoryDeck", { pairs: 6, shuffle: true });',
        badgeColor: '#C084FC',
      },
      {
        id: 'gm_mc_flip',
        title: '2. Logika Balik & Cek Pasangan',
        description: 'Membalik maksimal 2 kartu lalu mengunci kartu bila simbolnya sama.',
        codeSnippet: 'game.addRule("CardFlipMatcher", { flipBackMs: 650 });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_mc_stats',
        title: '3. Penghitung Langkah & Tombol Ulang',
        description: 'Menampilkan statistik langkah, pasangan cocok, dan tombol Acak Ulang.',
        codeSnippet: 'game.addFeature("MoveStats", { allowRestart: true });',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_mc_win',
        title: '4. Deteksi Kemenangan Dek',
        description: 'Merayakan kemenangan ketika seluruh 6 pasang kartu berhasil terbuka.',
        codeSnippet: 'game.addFeature("DeckVictory", { starsByMoves: true });',
        badgeColor: '#4ADE80',
      },
    ],
  },
  {
    id: 'game_color_puzzle',
    order: 3,
    title: 'Color Puzzle',
    shortTitle: 'Color Puzzle',
    subtitle: 'Rancang puzzle susun pola warna 3×3 multi-level dengan petunjuk cerdas',
    accentColor: '#FB7185',
    concept: '2D Matrix State, Cyclic Color Transitions & Pattern Validation',
    overview:
      'Pada proyek ketiga, Anda membuat game asah otak Color Puzzle! Pemain mengetuk ubin pada papan 3×3 untuk mengganti warnanya hingga seluruh papan persis cocok dengan Pola Warna Target.',
    learningGoals: [
      'Menampilkan papan puzzle 3×3 beserta kartu Pola Target di bagian atas.',
      'Mengimplementasikan siklus perubahan warna saat ubin diketuk.',
      'Menambahkan pemilih 3 level pola dan tombol Petunjuk (Hint) ubin yang belum cocok.',
      'Memvalidasi kecocokan seluruh 9 ubin untuk membuka kemenangan puzzle.',
    ],
    defaultGameName: 'Chroma Color Puzzle',
    starterEnabledStepIds: ['gm_cp_grid'],
    steps: [
      {
        id: 'gm_cp_grid',
        title: '1. Papan Puzzle Warna 3×3',
        description: 'Menampilkan 9 ubin warna interaktif beserta palet 4 warna cerah.',
        codeSnippet: 'game.addScene("ColorGrid", { size: 3, palette: 4 });',
        badgeColor: '#FB7185',
      },
      {
        id: 'gm_cp_tap',
        title: '2. Siklus Warna Saat Diketuk',
        description: 'Setiap klik mengubah warna ubin (Kuning → Hijau → Biru → Ungu).',
        codeSnippet: 'game.addRule("TileColorCycle", { colors: 4 });',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_cp_target',
        title: '3. Pola Target & Tombol Hint',
        description: 'Menampilkan mini peta Pola Target (3 Level) serta sorotan Hint.',
        codeSnippet: 'game.addFeature("TargetPattern", { levels: 3, hint: true });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_cp_win',
        title: '4. Validator Pola & Progres Kecocokan',
        description: 'Menghitung ubin yang sudah tepat (X/9) dan merayakan saat 9/9 cocok!',
        codeSnippet: 'game.addFeature("PuzzleValidator", { showProgress: true });',
        badgeColor: '#4ADE80',
      },
    ],
  },
  {
    id: 'game_save_polar_bear',
    order: 4,
    title: 'Save the Polar Bear',
    shortTitle: 'Save Polar Bear',
    subtitle: 'Selamatkan Beruang Kutub melewati es yang mencair menuju pulau aman',
    accentColor: '#38BDF8',
    concept: 'Grid Navigation, Destructible Tiles & Rescue Goal Mechanics',
    overview:
      'Di proyek keempat, Anda membangun game petualangan Save the Polar Bear! Bantu Beruang Kutub melintasi balok es 5×5 menuju Pulau Aman sambil mengumpulkan ikan — hati-hati, setiap balok es langsung mencair setelah dipijak!',
    learningGoals: [
      'Menyusun peta kutub 5×5 dengan Beruang, balok es, ikan, dan Pulau Aman.',
      'Membuat kontrol gerak 4 arah (Atas, Bawah, Kiri, Kanan) berbasis koordinat grid.',
      'Menerapkan aturan es mencair menjadi air setelah dilewati agar pemain menyusun rute cerdas.',
      'Menghitung ikan yang diselamatkan dan kondisi menang/reset saat terjebak.',
    ],
    defaultGameName: 'Save the Polar Bear',
    starterEnabledStepIds: ['gm_pb_map'],
    steps: [
      {
        id: 'gm_pb_map',
        title: '1. Peta Es Kutub 5×5 & Beruang',
        description: 'Menampilkan grid kutub, posisi Beruang, balok es, dan pulau tujuan.',
        codeSnippet: 'game.addScene("ArcticGrid", { width: 5, height: 5 });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_pb_move',
        title: '2. Kontrol Gerak 4 Arah',
        description: 'Menambahkan tombol D-Pad (Atas, Bawah, Kiri, Kanan) untuk melangkah.',
        codeSnippet: 'game.addRule("BearController", { directions: 4 });',
        badgeColor: '#4ADE80',
      },
      {
        id: 'gm_pb_ice',
        title: '3. Mekanik Es Mencair & Bahaya Air',
        description: 'Setiap ubin es yang ditinggalkan langsung mencair menjadi air.',
        codeSnippet: 'game.addFeature("MeltingIce", { meltAfterStep: true });',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_pb_rescue',
        title: '4. Koleksi Ikan & Pulau Penyelamatan',
        description: 'Mengumpulkan bonus ikan & menyelamatkan Beruang saat tiba di Pulau Aman!',
        codeSnippet: 'game.addFeature("RescueGoal", { collectFish: true });',
        badgeColor: '#C084FC',
      },
    ],
  },
  {
    id: 'game_space_mission',
    order: 5,
    title: 'Space Mission',
    shortTitle: 'Space Mission',
    subtitle: 'Kendalikan pesawat roket, tembak meteor & tuntaskan misi galaksi',
    accentColor: '#4ADE80',
    concept: 'Arcade Game Loop, Projectile Shooting & Collision Detection',
    overview:
      'Di proyek puncak Game Maker, Anda membuat game arcade Space Mission! Gerakkan pesawat roket di 5 jalur galaksi, tembak meteor dengan laser energi, kumpulkan bintang skor, dan capai 100 poin untuk menyelesaikan misi!',
    learningGoals: [
      'Menyusun arena luar angkasa 5 jalur dengan pesawat roket pemain.',
      'Menghubungkan tombol Kiri, Kanan, dan Tembak Laser secara responsif.',
      'Membuat gelombang meteor jatuh & bintang energi dengan sistem nyawa (3 hati).',
      'Menentukan target skor misi (100 poin) serta layar Misi Galaksi Berhasil!',
    ],
    defaultGameName: 'Space Mission X',
    starterEnabledStepIds: ['gm_sm_ship'],
    steps: [
      {
        id: 'gm_sm_ship',
        title: '1. Arena Galaksi & Pesawat Roket',
        description: 'Menampilkan arena luar angkasa 5 jalur lengkap dengan pesawat roket.',
        codeSnippet: 'game.addScene("SpaceArena", { lanes: 5 });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_sm_laser',
        title: '2. Kontrol Pesawat & Tembak Laser',
        description: 'Menggerakkan pesawat ke kiri/kanan dan menembakkan laser ke atas.',
        codeSnippet: 'game.addRule("ShipControls", { fireLaser: true });',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_sm_meteor',
        title: '3. Gelombang Meteor, Bintang & Nyawa',
        description: 'Menghadirkan meteor jatuh, bintang bonus, deteksi tabrakan, dan 3 nyawa.',
        codeSnippet: 'game.addFeature("MeteorSpawner", { lives: 3 });',
        badgeColor: '#FB7185',
      },
      {
        id: 'gm_sm_mission',
        title: '4. Target Skor Misi (100 Poin)',
        description: 'Menghitung skor hancurkan meteor/tangkap bintang hingga misi tuntas!',
        codeSnippet: 'game.addFeature("MissionComplete", { targetScore: 100 });',
        badgeColor: '#4ADE80',
      },
    ],
  },
];

export function getGameMakerProjectById(id: string): GameMakerProjectDef | undefined {
  return GAME_MAKER_PROJECTS.find((p) => p.id === id);
}

export function buildGameCodeFromSteps(
  project: GameMakerProjectDef,
  gameTitle: string,
  enabledStepIds: string[]
): string {
  const safeTitle = gameTitle.trim() || project.defaultGameName;
  const lines: string[] = [
    `// Proyek Game Maker #${project.order}: ${project.title}`,
    `const game = createGame("${safeTitle}");`,
    '',
  ];

  project.steps.forEach((step) => {
    if (enabledStepIds.includes(step.id)) {
      lines.push(`// ${step.title}`);
      lines.push(step.codeSnippet);
    }
  });

  lines.push('');
  lines.push('game.start();');
  return lines.join('\n');
}
