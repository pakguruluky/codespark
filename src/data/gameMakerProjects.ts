import type { GameMakerProjectId } from '../types';
import type { ArcadeBlockProgram, ArcadeStatementBlock } from '../engine/arcadeEngine';

export interface GameMakerStepBlock {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  badgeColor: string;
}

export interface ArcadeMissionCheck {
  id: string;
  label: string;
  hint: string;
  check: (program: ArcadeBlockProgram) => boolean;
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
  controlsHint: string;
  steps: GameMakerStepBlock[];
  starterEnabledStepIds: string[];
  arcadeStarter: ArcadeBlockProgram;
  arcadeSolution: ArcadeBlockProgram;
  missionChecks: ArcadeMissionCheck[];
}

function hasStatement(
  program: ArcadeBlockProgram,
  predicate: (blk: ArcadeStatementBlock) => boolean
): boolean {
  return program.containers.some((c) => c.blocks.some(predicate));
}

function hasEvent(
  program: ArcadeBlockProgram,
  eventType: string,
  predicate?: (params: Record<string, string | number | boolean>, blocks: ArcadeStatementBlock[]) => boolean
): boolean {
  return program.containers.some(
    (c) => c.eventType === eventType && (!predicate || predicate(c.params, c.blocks))
  );
}

export const GAME_MAKER_PROJECTS: GameMakerProjectDef[] = [
  // ==================== 1. IMAGE MATCH ARCADE ====================
  {
    id: 'game_image_match',
    order: 1,
    title: 'Image Match Arcade',
    shortTitle: 'Image Match',
    subtitle: 'Kendalikan Panda Piksel, tangkap Bintang Target & hindari Hantu Pengecoh',
    accentColor: '#FFE600',
    concept: 'Sprites, Controller Movement, Overlap Events & Target Score',
    overview:
      'Di proyek pertama Game Maker Arcade, Anda membangun game Image Match berbasis sprite piksel! Gerakkan Panda dengan D-Pad/Panah, tekan tombol A untuk Dash cepat, tangkap Bintang Emas (+15 skor) dan hindari Hantu Pengecoh sampai mencapai 60 poin!',
    learningGoals: [
      'Membuat sprite karakter utama (Panda) dan latar grid arcade di blok on start.',
      'Menghubungkan D-Pad / tombol panah (controller.move_sprite) dan batas layar.',
      'Menambahkan event overlap untuk menangkap Bintang Target & memberi skor.',
      'Menentukan target kemenangan 60 poin dan efek suara chiptune.',
    ],
    defaultGameName: 'Image Match Arcade',
    controlsHint: 'D-Pad / Panah: Gerak Panda · Tombol A / Spasi: Dash Cepat',
    starterEnabledStepIds: ['gm_im_board'],
    steps: [
      {
        id: 'gm_im_board',
        title: '1. Arena & Sprite Panda',
        description: 'Menyiapkan latar belakang grid arcade dan karakter Panda.',
        codeSnippet: 'my_sprite = sprites.create(assets.image("panda"), SpriteKind.player)',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_im_check',
        title: '2. Kontrol D-Pad & Tombol A Dash',
        description: 'Menggerakkan Panda di layar serta menambahkan aksi Dash pada tombol A.',
        codeSnippet: 'controller.move_sprite(my_sprite, 105, 105)',
        badgeColor: '#4ADE80',
      },
      {
        id: 'gm_im_combo',
        title: '3. Spawn Bintang Target & Cek Overlap',
        description: 'Memunculkan Bintang Target dan menambah skor +15 saat disentuh.',
        codeSnippet: 'sprites.on_overlap(SpriteKind.player, SpriteKind.food, on_overlap_food)',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_im_win',
        title: '4. Rintangan Hantu & Target Menang 60',
        description: 'Menambahkan Hantu pengecoh (-1 nyawa) dan cek kemenangan 60 poin.',
        codeSnippet: 'info.set_win_target(60)',
        badgeColor: '#C084FC',
      },
    ],
    arcadeStarter: {
      containers: [
        {
          id: 'im_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'im_b1', type: 'set_bg_color', params: { color: 'midnight' } },
            { id: 'im_b2', type: 'set_bg_effect', params: { effect: 'grid' } },
            { id: 'im_b3', type: 'create_player', params: { spriteId: 'panda', x: 80, y: 80 } },
            { id: 'im_b4', type: 'move_with_buttons', params: { vx: 105, vy: 105 } },
            { id: 'im_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'im_b6', type: 'set_life', params: { value: 3 } },
            { id: 'im_b7', type: 'set_win_score', params: { target: 60 } },
            { id: 'im_b8', type: 'repeat_spawn', params: { count: 2, kind: 'Food', spriteId: 'star' } },
          ],
        },
        {
          id: 'im_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'im_ba1', type: 'dash_player', params: { boost: 75 } },
            { id: 'im_ba2', type: 'play_sound', params: { sound: 'jump_up' } },
          ],
        },
        {
          id: 'im_int',
          eventType: 'on_update_interval',
          params: { ms: 1300 },
          blocks: [
            {
              id: 'im_in1',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'star', speed: 34, pattern: 'wander' },
            },
          ],
        },
        {
          id: 'im_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'im_of1', type: 'destroy_other', params: { effect: 'confetti' } },
            { id: 'im_of2', type: 'change_score', params: { delta: 15 } },
            { id: 'im_of3', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
      ],
    },
    arcadeSolution: {
      containers: [
        {
          id: 'im_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'im_b1', type: 'set_bg_color', params: { color: 'midnight' } },
            { id: 'im_b2', type: 'set_bg_effect', params: { effect: 'grid' } },
            { id: 'im_b3', type: 'create_player', params: { spriteId: 'panda', x: 80, y: 80 } },
            { id: 'im_b4', type: 'move_with_buttons', params: { vx: 110, vy: 110 } },
            { id: 'im_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'im_b6', type: 'set_life', params: { value: 3 } },
            { id: 'im_b7', type: 'set_win_score', params: { target: 60 } },
            { id: 'im_b8', type: 'repeat_spawn', params: { count: 3, kind: 'Food', spriteId: 'star' } },
          ],
        },
        {
          id: 'im_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'im_ba1', type: 'dash_player', params: { boost: 80 } },
            { id: 'im_ba2', type: 'play_sound', params: { sound: 'jump_up' } },
          ],
        },
        {
          id: 'im_int',
          eventType: 'on_update_interval',
          params: { ms: 1200 },
          blocks: [
            {
              id: 'im_in1',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'star', speed: 36, pattern: 'wander' },
            },
            {
              id: 'im_in2',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'ghost', speed: 38, pattern: 'side_random' },
            },
          ],
        },
        {
          id: 'im_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'im_of1', type: 'destroy_other', params: { effect: 'confetti' } },
            { id: 'im_of2', type: 'change_score', params: { delta: 15 } },
            { id: 'im_of3', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
        {
          id: 'im_ov_enemy',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Enemy' },
          blocks: [
            { id: 'im_oe1', type: 'destroy_other', params: { effect: 'fire' } },
            { id: 'im_oe2', type: 'change_life', params: { delta: -1 } },
            { id: 'im_oe3', type: 'play_sound', params: { sound: 'zapped' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'chk_im_player',
        label: 'Buat karakter Player & Kontrol D-Pad',
        hint: 'Pastikan blok create_player dan move_with_buttons ada di on start.',
        check: (p) =>
          hasStatement(p, (b) => b.type === 'create_player') &&
          hasStatement(p, (b) => b.type === 'move_with_buttons'),
      },
      {
        id: 'chk_im_food',
        label: 'Event overlap Player & Food (+skor)',
        hint: 'Tambahkan blok change_score di dalam on overlap Player & Food.',
        check: (p) =>
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Player' &&
              par.kindB === 'Food' &&
              blks.some((b) => b.type === 'change_score')
          ),
      },
      {
        id: 'chk_im_enemy',
        label: 'Tambahkan Hantu Pengecoh (Enemy) & overlap nyawa',
        hint: 'Dari kategori Sprites, tambahkan spawn Enemy dan event overlap Player -> Enemy dengan change_life (-1).',
        check: (p) =>
          hasStatement(p, (b) => b.type === 'spawn_sprite' && b.params.kind === 'Enemy') &&
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Player' &&
              par.kindB === 'Enemy' &&
              blks.some((b) => b.type === 'change_life')
          ),
      },
    ],
  },

  // ==================== 2. MEMORY CARD / GEM CHEST HUNT ====================
  {
    id: 'game_memory_card',
    order: 2,
    title: 'Memory Card Arcade',
    shortTitle: 'Memory Card',
    subtitle: 'Buru Permata Ruby tersembunyi & buka Peti Misteri dengan Robot Memori',
    accentColor: '#C084FC',
    concept: 'Countdown Timer, Projectile Scan, Loop Spawner & Bonus Scoring',
    overview:
      'Pada proyek kedua, Anda membangun game arcade Memory Chest Hunt! Gerakkan Robot Memori melintasi ruang bawah tanah piksel, kumpulkan Permata Ruby (+15 poin), dan tekan tombol A untuk menembakkan sinar pemindai guna membuka Peti Misteri (+10 poin) sebelum waktu 45 detik habis!',
    learningGoals: [
      'Membuat perulangan (repeat) untuk memunculkan beberapa Permata sekaligus.',
      'Menambahkan tombol A untuk menembakkan proyektil pemindai ke Peti Misteri.',
      'Menghubungkan timer hitung mundur 45 detik (info.start_countdown).',
      'Mendeteksi tabrakan Projectile -> Enemy untuk membuka peti & mencetak skor.',
    ],
    defaultGameName: 'Memory Gem Hunt',
    controlsHint: 'D-Pad / Panah: Gerak Robot · Tombol A / Spasi: Pindai Peti Misteri',
    starterEnabledStepIds: ['gm_mc_deck'],
    steps: [
      {
        id: 'gm_mc_deck',
        title: '1. Arena Robot & Permata',
        description: 'Membuat Robot Memori dan memunculkan Permata menggunakan Loops.',
        codeSnippet: 'for _ in range(3): sprites.spawn(SpriteKind.food, assets.image("gem"), 32, "wander")',
        badgeColor: '#C084FC',
      },
      {
        id: 'gm_mc_flip',
        title: '2. Sinar Pemindai (Tombol A)',
        description: 'Menembakkan proyektil saat tombol A ditekan untuk membuka Peti Misteri.',
        codeSnippet: 'sprites.create_projectile_from_sprite(assets.image("laser"), my_sprite, 0, -120)',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_mc_stats',
        title: '3. Hitung Mundur 45 Detik',
        description: 'Mengaktifkan timer countdown untuk tantangan kecepatan memori.',
        codeSnippet: 'info.start_countdown(45)',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_mc_win',
        title: '4. Target Kemenangan 75 Poin',
        description: 'Menetapkan target 75 poin dan efek confetti saat misi berhasil.',
        codeSnippet: 'info.set_win_target(75)',
        badgeColor: '#4ADE80',
      },
    ],
    arcadeStarter: {
      containers: [
        {
          id: 'mc_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'mc_b1', type: 'set_bg_color', params: { color: 'arcade' } },
            { id: 'mc_b2', type: 'set_bg_effect', params: { effect: 'grid' } },
            { id: 'mc_b3', type: 'create_player', params: { spriteId: 'robot', x: 80, y: 95 } },
            { id: 'mc_b4', type: 'move_with_buttons', params: { vx: 105, vy: 105 } },
            { id: 'mc_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'mc_b6', type: 'set_life', params: { value: 3 } },
            { id: 'mc_b7', type: 'start_countdown', params: { seconds: 45 } },
            { id: 'mc_b8', type: 'set_win_score', params: { target: 75 } },
            { id: 'mc_b9', type: 'repeat_spawn', params: { count: 3, kind: 'Food', spriteId: 'gem' } },
          ],
        },
        {
          id: 'mc_int',
          eventType: 'on_update_interval',
          params: { ms: 1400 },
          blocks: [
            {
              id: 'mc_in1',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'chest', speed: 34, pattern: 'top_random' },
            },
            {
              id: 'mc_in2',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'gem', speed: 28, pattern: 'wander' },
            },
          ],
        },
        {
          id: 'mc_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'mc_of1', type: 'destroy_other', params: { effect: 'hearts' } },
            { id: 'mc_of2', type: 'change_score', params: { delta: 15 } },
            { id: 'mc_of3', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
      ],
    },
    arcadeSolution: {
      containers: [
        {
          id: 'mc_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'mc_b1', type: 'set_bg_color', params: { color: 'arcade' } },
            { id: 'mc_b2', type: 'set_bg_effect', params: { effect: 'grid' } },
            { id: 'mc_b3', type: 'create_player', params: { spriteId: 'robot', x: 80, y: 95 } },
            { id: 'mc_b4', type: 'move_with_buttons', params: { vx: 105, vy: 105 } },
            { id: 'mc_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'mc_b6', type: 'set_life', params: { value: 3 } },
            { id: 'mc_b7', type: 'start_countdown', params: { seconds: 45 } },
            { id: 'mc_b8', type: 'set_win_score', params: { target: 75 } },
            { id: 'mc_b9', type: 'repeat_spawn', params: { count: 3, kind: 'Food', spriteId: 'gem' } },
          ],
        },
        {
          id: 'mc_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'mc_ba1', type: 'fire_projectile', params: { spriteId: 'laser', vx: 0, vy: -125 } },
            { id: 'mc_ba2', type: 'play_sound', params: { sound: 'magic_wand' } },
          ],
        },
        {
          id: 'mc_int',
          eventType: 'on_update_interval',
          params: { ms: 1350 },
          blocks: [
            {
              id: 'mc_in1',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'chest', speed: 34, pattern: 'top_random' },
            },
            {
              id: 'mc_in2',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'gem', speed: 28, pattern: 'wander' },
            },
          ],
        },
        {
          id: 'mc_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'mc_of1', type: 'destroy_other', params: { effect: 'hearts' } },
            { id: 'mc_of2', type: 'change_score', params: { delta: 15 } },
            { id: 'mc_of3', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
        {
          id: 'mc_ov_proj',
          eventType: 'on_overlap',
          params: { kindA: 'Projectile', kindB: 'Enemy' },
          blocks: [
            { id: 'mc_op1', type: 'destroy_other', params: { effect: 'confetti' } },
            { id: 'mc_op2', type: 'destroy_self', params: { effect: 'rings' } },
            { id: 'mc_op3', type: 'change_score', params: { delta: 10 } },
            { id: 'mc_op4', type: 'play_sound', params: { sound: 'power_up' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'chk_mc_countdown',
        label: 'Aktifkan Timer Hitung Mundur (Countdown)',
        hint: 'Pastikan blok start_countdown ada di on start.',
        check: (p) => hasStatement(p, (b) => b.type === 'start_countdown'),
      },
      {
        id: 'chk_mc_shoot',
        label: 'Tombol A menembakkan Sinar Pemindai (Projectile)',
        hint: 'Tambahkan event on [A] button pressed (Controller) lalu isi dengan fire_projectile (Sprites).',
        check: (p) =>
          hasEvent(p, 'on_button', (par, blks) => par.button === 'A' && blks.some((b) => b.type === 'fire_projectile')),
      },
      {
        id: 'chk_mc_proj_enemy',
        label: 'Event Projectile mengenai Peti Misteri (+skor)',
        hint: 'Tambahkan event on overlap Projectile & Enemy lalu beri destroy_other dan change_score.',
        check: (p) =>
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Projectile' &&
              par.kindB === 'Enemy' &&
              blks.some((b) => b.type === 'change_score')
          ),
      },
    ],
  },

  // ==================== 3. COLOR PUZZLE / CHROMA ARCADE ====================
  {
    id: 'game_color_puzzle',
    order: 3,
    title: 'Color Puzzle Arcade',
    shortTitle: 'Color Puzzle',
    subtitle: 'Cocokkan warna aura pesawat dengan Orb Chroma menggunakan tombol B',
    accentColor: '#FB7185',
    concept: 'State Cycling, Conditional Logic (if/else) & Color Matching',
    overview:
      'Pada proyek ketiga, Anda membuat game refleks & logika warna Chroma Arcade! Tekan tombol B (atau tombol X di keyboard) untuk mengganti warna aura pesawat (Merah → Kuning → Hijau → Cyan), lalu tangkap Orb Warna yang sama untuk mencetak +20 poin. Hati-hati, warna yang salah mengurangi 1 nyawa!',
    learningGoals: [
      'Mengubah state warna karakter dengan blok cycle_player_color saat tombol B ditekan.',
      'Menggunakan logika percabangan if/else (if_color_match_score) saat menyentuh Orb.',
      'Menghadirkan efek confetti saat cocok & efek getar saat warna berbeda.',
      'Mencapai target 80 poin dengan akurasi warna tinggi.',
    ],
    defaultGameName: 'Chroma Color Arcade',
    controlsHint: 'D-Pad / Panah: Gerak · Tombol B / X: Ganti Warna Aura',
    starterEnabledStepIds: ['gm_cp_grid'],
    steps: [
      {
        id: 'gm_cp_grid',
        title: '1. Pesawat Penjelajah Chroma',
        description: 'Menyiapkan arena galaksi ungu dan Penjelajah Chroma.',
        codeSnippet: 'my_sprite = sprites.create(assets.image("chroma_ship"), SpriteKind.player)',
        badgeColor: '#FB7185',
      },
      {
        id: 'gm_cp_tap',
        title: '2. Tombol B Ganti Warna Aura',
        description: 'Mengganti siklus warna Merah → Kuning → Hijau → Cyan setiap tekan B.',
        codeSnippet: 'my_sprite.cycle_chroma_color()',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_cp_target',
        title: '3. Logika If/Else Kecocokan Warna',
        description: 'Memeriksa warna pemain vs Orb Chroma (+20 poin jika cocok, -1 nyawa jika salah).',
        codeSnippet: 'if my_sprite.matches_color(other_sprite): info.change_score_by(20)',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_cp_win',
        title: '4. Target Skor Chroma 80 Poin',
        description: 'Menuntaskan puzzle arcade begitu skor menyentuh 80 poin!',
        codeSnippet: 'info.set_win_target(80)',
        badgeColor: '#4ADE80',
      },
    ],
    arcadeStarter: {
      containers: [
        {
          id: 'cp_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'cp_b1', type: 'set_bg_color', params: { color: 'midnight' } },
            { id: 'cp_b2', type: 'set_bg_effect', params: { effect: 'starfield' } },
            { id: 'cp_b3', type: 'create_player', params: { spriteId: 'chroma_ship', x: 80, y: 94 } },
            { id: 'cp_b4', type: 'move_with_buttons', params: { vx: 115, vy: 95 } },
            { id: 'cp_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'cp_b6', type: 'set_life', params: { value: 4 } },
            { id: 'cp_b7', type: 'set_win_score', params: { target: 80 } },
          ],
        },
        {
          id: 'cp_btn_b',
          eventType: 'on_button',
          params: { button: 'B' },
          blocks: [
            { id: 'cp_bb1', type: 'cycle_player_color', params: {} },
            { id: 'cp_bb2', type: 'play_sound', params: { sound: 'magic_wand' } },
          ],
        },
        {
          id: 'cp_int',
          eventType: 'on_update_interval',
          params: { ms: 1050 },
          blocks: [
            {
              id: 'cp_in1',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'chroma_orb', speed: 38, pattern: 'top_random' },
            },
          ],
        },
      ],
    },
    arcadeSolution: {
      containers: [
        {
          id: 'cp_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'cp_b1', type: 'set_bg_color', params: { color: 'midnight' } },
            { id: 'cp_b2', type: 'set_bg_effect', params: { effect: 'starfield' } },
            { id: 'cp_b3', type: 'create_player', params: { spriteId: 'chroma_ship', x: 80, y: 94 } },
            { id: 'cp_b4', type: 'move_with_buttons', params: { vx: 115, vy: 95 } },
            { id: 'cp_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'cp_b6', type: 'set_life', params: { value: 4 } },
            { id: 'cp_b7', type: 'set_win_score', params: { target: 80 } },
          ],
        },
        {
          id: 'cp_btn_b',
          eventType: 'on_button',
          params: { button: 'B' },
          blocks: [
            { id: 'cp_bb1', type: 'cycle_player_color', params: {} },
            { id: 'cp_bb2', type: 'play_sound', params: { sound: 'magic_wand' } },
          ],
        },
        {
          id: 'cp_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'cp_ba1', type: 'cycle_player_color', params: {} },
            { id: 'cp_ba2', type: 'play_sound', params: { sound: 'magic_wand' } },
          ],
        },
        {
          id: 'cp_int',
          eventType: 'on_update_interval',
          params: { ms: 1050 },
          blocks: [
            {
              id: 'cp_in1',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'chroma_orb', speed: 38, pattern: 'top_random' },
            },
          ],
        },
        {
          id: 'cp_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'cp_of1', type: 'if_color_match_score', params: { points: 20, penalty: -1 } },
            { id: 'cp_of2', type: 'destroy_other', params: { effect: 'rings' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'chk_cp_cycle',
        label: 'Tombol B mengganti warna aura (cycle_player_color)',
        hint: 'Pastikan blok cycle_player_color ada di dalam on [B] button pressed.',
        check: (p) => hasStatement(p, (b) => b.type === 'cycle_player_color'),
      },
      {
        id: 'chk_cp_logic',
        label: 'Tambahkan blok Logic if color matches saat overlap Orb',
        hint: 'Tambahkan event on overlap Player & Food, lalu masukkan blok Logic "if color matches" dan "destroy otherSprite".',
        check: (p) =>
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Player' &&
              par.kindB === 'Food' &&
              blks.some((b) => b.type === 'if_color_match_score')
          ),
      },
    ],
  },

  // ==================== 4. SAVE THE POLAR BEAR ARCADE ====================
  {
    id: 'game_save_polar_bear',
    order: 4,
    title: 'Save the Polar Bear',
    shortTitle: 'Save Polar Bear',
    subtitle: 'Bantu Beruang Kutub kumpulkan Ikan Arktik & hancurkan Retakan Es berbahaya',
    accentColor: '#38BDF8',
    concept: 'Arctic Effects, Multi-Kind Spawning, Ice Shield & Rescue Goal',
    overview:
      'Di proyek keempat, selamatkan Beruang Kutub di tengah badai salju Arktik! Kendalikan Beruang Kutub melintasi laut es, kumpulkan Ikan Arktik (+15 poin), tekan tombol A untuk menembakkan Bola Es guna memecahkan Retakan Es berbahaya, dan raih 90 poin untuk menuntaskan penyelamatan!',
    learningGoals: [
      'Menghidupkan atmosfer Kutub Utara dengan warna Laut Arktik & efek salju turun.',
      'Membuat dua jalur spawn: Ikan Arktik (Food) dan Retakan Es (Enemy).',
      'Menggunakan tombol A untuk menembakkan Bola Es pelindung.',
      'Menjaga 3 nyawa Beruang Kutub hingga mencapai target penyelamatan 90 poin.',
    ],
    defaultGameName: 'Save Polar Bear Arcade',
    controlsHint: 'D-Pad / Panah: Gerak Beruang · Tombol A / Spasi: Tembak Bola Es',
    starterEnabledStepIds: ['gm_pb_map'],
    steps: [
      {
        id: 'gm_pb_map',
        title: '1. Laut Arktik, Salju & Beruang Kutub',
        description: 'Menampilkan latar Laut Arktik, efek salju, dan sprite Beruang Kutub.',
        codeSnippet: 'scene.set_background_effect("snow")',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_pb_move',
        title: '2. Ikan Arktik & Retakan Es',
        description: 'Memunculkan Ikan Arktik (Food) dan Retakan Es (Enemy) berkala.',
        codeSnippet: 'sprites.spawn(SpriteKind.food, assets.image("fish"), 36, "side_random")',
        badgeColor: '#4ADE80',
      },
      {
        id: 'gm_pb_ice',
        title: '3. Bola Es Pelindung (Tombol A)',
        description: 'Menembakkan Bola Es untuk memecahkan Retakan Es yang mendekat.',
        codeSnippet: 'sprites.create_projectile_from_sprite(assets.image("shield_bolt"), my_sprite, 0, -120)',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_pb_rescue',
        title: '4. Penyelamatan 90 Poin',
        description: 'Menghitung ikan yang terkumpul dan merayakan penyelamatan di 90 poin!',
        codeSnippet: 'info.set_win_target(90)',
        badgeColor: '#C084FC',
      },
    ],
    arcadeStarter: {
      containers: [
        {
          id: 'pb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'pb_b1', type: 'set_bg_color', params: { color: 'arctic' } },
            { id: 'pb_b2', type: 'set_bg_effect', params: { effect: 'snow' } },
            { id: 'pb_b3', type: 'create_player', params: { spriteId: 'polar_bear', x: 80, y: 92 } },
            { id: 'pb_b4', type: 'move_with_buttons', params: { vx: 100, vy: 100 } },
            { id: 'pb_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'pb_b6', type: 'set_life', params: { value: 3 } },
            { id: 'pb_b7', type: 'set_win_score', params: { target: 90 } },
          ],
        },
        {
          id: 'pb_int',
          eventType: 'on_update_interval',
          params: { ms: 1150 },
          blocks: [
            {
              id: 'pb_in1',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'fish', speed: 36, pattern: 'side_random' },
            },
            {
              id: 'pb_in2',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'ice_hazard', speed: 44, pattern: 'top_random' },
            },
          ],
        },
        {
          id: 'pb_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'pb_of1', type: 'destroy_other', params: { effect: 'hearts' } },
            { id: 'pb_of2', type: 'change_score', params: { delta: 15 } },
            { id: 'pb_of3', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
        {
          id: 'pb_ov_enemy',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Enemy' },
          blocks: [
            { id: 'pb_oe1', type: 'destroy_other', params: { effect: 'fire' } },
            { id: 'pb_oe2', type: 'change_life', params: { delta: -1 } },
            { id: 'pb_oe3', type: 'play_sound', params: { sound: 'zapped' } },
          ],
        },
      ],
    },
    arcadeSolution: {
      containers: [
        {
          id: 'pb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'pb_b1', type: 'set_bg_color', params: { color: 'arctic' } },
            { id: 'pb_b2', type: 'set_bg_effect', params: { effect: 'snow' } },
            { id: 'pb_b3', type: 'create_player', params: { spriteId: 'polar_bear', x: 80, y: 92 } },
            { id: 'pb_b4', type: 'move_with_buttons', params: { vx: 105, vy: 105 } },
            { id: 'pb_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'pb_b6', type: 'set_life', params: { value: 3 } },
            { id: 'pb_b7', type: 'set_win_score', params: { target: 90 } },
          ],
        },
        {
          id: 'pb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'pb_ba1', type: 'fire_projectile', params: { spriteId: 'shield_bolt', vx: 0, vy: -120 } },
            { id: 'pb_ba2', type: 'play_sound', params: { sound: 'pew_pew' } },
          ],
        },
        {
          id: 'pb_int',
          eventType: 'on_update_interval',
          params: { ms: 1100 },
          blocks: [
            {
              id: 'pb_in1',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'fish', speed: 38, pattern: 'side_random' },
            },
            {
              id: 'pb_in2',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'ice_hazard', speed: 44, pattern: 'top_random' },
            },
          ],
        },
        {
          id: 'pb_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'pb_of1', type: 'destroy_other', params: { effect: 'hearts' } },
            { id: 'pb_of2', type: 'change_score', params: { delta: 15 } },
            { id: 'pb_of3', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
        {
          id: 'pb_ov_enemy',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Enemy' },
          blocks: [
            { id: 'pb_oe1', type: 'destroy_other', params: { effect: 'fire' } },
            { id: 'pb_oe2', type: 'change_life', params: { delta: -1 } },
            { id: 'pb_oe3', type: 'play_sound', params: { sound: 'zapped' } },
          ],
        },
        {
          id: 'pb_ov_proj',
          eventType: 'on_overlap',
          params: { kindA: 'Projectile', kindB: 'Enemy' },
          blocks: [
            { id: 'pb_op1', type: 'destroy_other', params: { effect: 'rings' } },
            { id: 'pb_op2', type: 'destroy_self', params: { effect: 'none' } },
            { id: 'pb_op3', type: 'change_score', params: { delta: 10 } },
            { id: 'pb_op4', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'chk_pb_snow',
        label: 'Efek salju Kutub Utara & sprite Beruang Kutub',
        hint: 'Pastikan set_bg_effect("snow") dan create_player ada di on start.',
        check: (p) =>
          hasStatement(p, (b) => b.type === 'set_bg_effect' && b.params.effect === 'snow') &&
          hasStatement(p, (b) => b.type === 'create_player'),
      },
      {
        id: 'chk_pb_shield',
        label: 'Tombol A menembakkan Bola Es Pelindung',
        hint: 'Tambahkan event on [A] button pressed (Controller) berisi fire_projectile (Sprites).',
        check: (p) =>
          hasEvent(p, 'on_button', (par, blks) => par.button === 'A' && blks.some((b) => b.type === 'fire_projectile')),
      },
      {
        id: 'chk_pb_clear',
        label: 'Bola Es menghancurkan Retakan Es (+skor)',
        hint: 'Tambahkan event on overlap Projectile & Enemy dengan destroy_other dan change_score.',
        check: (p) =>
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Projectile' &&
              par.kindB === 'Enemy' &&
              blks.some((b) => b.type === 'destroy_other')
          ),
      },
    ],
  },

  // ==================== 5. SPACE MISSION ARCADE ====================
  {
    id: 'game_space_mission',
    order: 5,
    title: 'Space Mission',
    shortTitle: 'Space Mission',
    subtitle: 'Game tembak luar angkasa klasik ala MakeCode Arcade — hancurkan Meteor!',
    accentColor: '#4ADE80',
    concept: 'Full Arcade Shooter Loop, Laser Projectiles, Meteor Waves & Win Condition',
    overview:
      'Di proyek puncak Game Maker Arcade, Anda membangun game Space Shooter penuh aksi! Terbangkan pesawat Roket di angkasa berbintang, tekan A/Spasi untuk menembakkan Laser ke gelombang Meteor Api (+15 poin), tangkap Bintang Energi (+20 poin), dan capai 100 poin untuk menuntaskan Misi Galaksi!',
    learningGoals: [
      'Menyiapkan latar Galaksi dengan animasi Starfield dan sprite Roket.',
      'Menghubungkan tombol A untuk menembak Laser berkecepatan tinggi dengan efek pew-pew.',
      'Membuat spawner berkala untuk gelombang Meteor Api & Bintang Energi.',
      'Menghubungkan 3 jenis tabrakan (Laser→Meteor, Player→Bintang, Player→Meteor) hingga 100 poin!',
    ],
    defaultGameName: 'Space Mission X',
    controlsHint: 'D-Pad / Panah: Terbang · Tombol A / Spasi: Tembak Laser',
    starterEnabledStepIds: ['gm_sm_ship'],
    steps: [
      {
        id: 'gm_sm_ship',
        title: '1. Arena Galaksi & Pesawat Roket',
        description: 'Menampilkan bintang bergerak (starfield) dan pesawat Roket pemain.',
        codeSnippet: 'scene.set_background_effect("starfield")',
        badgeColor: '#38BDF8',
      },
      {
        id: 'gm_sm_laser',
        title: '2. Tembak Laser Energi (Tombol A)',
        description: 'Menembakkan Laser ke atas dengan efek suara retro pew_pew.',
        codeSnippet: 'sprites.create_projectile_from_sprite(assets.image("laser"), my_sprite, 0, -135)',
        badgeColor: '#FFE600',
      },
      {
        id: 'gm_sm_meteor',
        title: '3. Gelombang Meteor & Tabrakan Laser',
        description: 'Menghancurkan Meteor dengan Laser (+15 skor) dan menjaga 3 nyawa.',
        codeSnippet: 'sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, on_hit_meteor)',
        badgeColor: '#FB7185',
      },
      {
        id: 'gm_sm_mission',
        title: '4. Target Skor Misi 100 Poin',
        description: 'Menetapkan target 100 poin & merayakan Misi Galaksi Berhasil!',
        codeSnippet: 'info.set_win_target(100)',
        badgeColor: '#4ADE80',
      },
    ],
    arcadeStarter: {
      containers: [
        {
          id: 'sm_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'sm_b1', type: 'set_bg_color', params: { color: 'space' } },
            { id: 'sm_b2', type: 'set_bg_effect', params: { effect: 'starfield' } },
            { id: 'sm_b3', type: 'create_player', params: { spriteId: 'rocket', x: 80, y: 98 } },
            { id: 'sm_b4', type: 'move_with_buttons', params: { vx: 115, vy: 95 } },
            { id: 'sm_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'sm_b6', type: 'set_life', params: { value: 3 } },
            { id: 'sm_b7', type: 'set_win_score', params: { target: 100 } },
          ],
        },
        {
          id: 'sm_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'sm_ba1', type: 'fire_projectile', params: { spriteId: 'laser', vx: 0, vy: -135 } },
            { id: 'sm_ba2', type: 'play_sound', params: { sound: 'pew_pew' } },
          ],
        },
        {
          id: 'sm_int',
          eventType: 'on_update_interval',
          params: { ms: 900 },
          blocks: [
            {
              id: 'sm_in1',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'meteor', speed: 48, pattern: 'top_random' },
            },
          ],
        },
        {
          id: 'sm_ov_proj',
          eventType: 'on_overlap',
          params: { kindA: 'Projectile', kindB: 'Enemy' },
          blocks: [
            { id: 'sm_op1', type: 'destroy_other', params: { effect: 'fire' } },
            { id: 'sm_op2', type: 'destroy_self', params: { effect: 'rings' } },
            { id: 'sm_op3', type: 'change_score', params: { delta: 15 } },
            { id: 'sm_op4', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
      ],
    },
    arcadeSolution: {
      containers: [
        {
          id: 'sm_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 'sm_b1', type: 'set_bg_color', params: { color: 'space' } },
            { id: 'sm_b2', type: 'set_bg_effect', params: { effect: 'starfield' } },
            { id: 'sm_b3', type: 'create_player', params: { spriteId: 'rocket', x: 80, y: 98 } },
            { id: 'sm_b4', type: 'move_with_buttons', params: { vx: 120, vy: 95 } },
            { id: 'sm_b5', type: 'stay_in_screen', params: { enabled: true } },
            { id: 'sm_b6', type: 'set_life', params: { value: 3 } },
            { id: 'sm_b7', type: 'set_win_score', params: { target: 100 } },
          ],
        },
        {
          id: 'sm_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 'sm_ba1', type: 'fire_projectile', params: { spriteId: 'laser', vx: 0, vy: -140 } },
            { id: 'sm_ba2', type: 'play_sound', params: { sound: 'pew_pew' } },
          ],
        },
        {
          id: 'sm_int',
          eventType: 'on_update_interval',
          params: { ms: 850 },
          blocks: [
            {
              id: 'sm_in1',
              type: 'spawn_sprite',
              params: { kind: 'Enemy', spriteId: 'meteor', speed: 50, pattern: 'top_random' },
            },
            {
              id: 'sm_in2',
              type: 'spawn_sprite',
              params: { kind: 'Food', spriteId: 'star', speed: 38, pattern: 'top_random' },
            },
          ],
        },
        {
          id: 'sm_ov_proj',
          eventType: 'on_overlap',
          params: { kindA: 'Projectile', kindB: 'Enemy' },
          blocks: [
            { id: 'sm_op1', type: 'destroy_other', params: { effect: 'fire' } },
            { id: 'sm_op2', type: 'destroy_self', params: { effect: 'rings' } },
            { id: 'sm_op3', type: 'change_score', params: { delta: 15 } },
            { id: 'sm_op4', type: 'play_sound', params: { sound: 'ba_ding' } },
          ],
        },
        {
          id: 'sm_ov_food',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Food' },
          blocks: [
            { id: 'sm_of1', type: 'destroy_other', params: { effect: 'confetti' } },
            { id: 'sm_of2', type: 'change_score', params: { delta: 20 } },
            { id: 'sm_of3', type: 'play_sound', params: { sound: 'power_up' } },
          ],
        },
        {
          id: 'sm_ov_enemy',
          eventType: 'on_overlap',
          params: { kindA: 'Player', kindB: 'Enemy' },
          blocks: [
            { id: 'sm_oe1', type: 'destroy_other', params: { effect: 'fire' } },
            { id: 'sm_oe2', type: 'change_life', params: { delta: -1 } },
            { id: 'sm_oe3', type: 'play_sound', params: { sound: 'zapped' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'chk_sm_laser',
        label: 'Tombol A menembakkan Laser & menghancurkan Meteor',
        hint: 'Pastikan on [A] button memanggil fire_projectile dan on overlap Projectile & Enemy memberi skor.',
        check: (p) =>
          hasStatement(p, (b) => b.type === 'fire_projectile') &&
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Projectile' &&
              par.kindB === 'Enemy' &&
              blks.some((b) => b.type === 'destroy_other')
          ),
      },
      {
        id: 'chk_sm_star',
        label: 'Tambahkan Bintang Energi (Food) & overlap Player -> Food',
        hint: 'Tambahkan spawn Food (star) di interval dan event on overlap Player & Food (+20 skor).',
        check: (p) =>
          hasStatement(p, (b) => b.type === 'spawn_sprite' && b.params.kind === 'Food') &&
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Player' &&
              par.kindB === 'Food' &&
              blks.some((b) => b.type === 'change_score')
          ),
      },
      {
        id: 'chk_sm_damage',
        label: 'Deteksi tabrakan Player & Meteor (-1 nyawa)',
        hint: 'Tambahkan event on overlap Player & Enemy berisi destroy_other dan change_life (-1).',
        check: (p) =>
          hasEvent(
            p,
            'on_overlap',
            (par, blks) =>
              par.kindA === 'Player' &&
              par.kindB === 'Enemy' &&
              blks.some((b) => b.type === 'change_life')
          ),
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
    `# Proyek Game Maker Arcade #${project.order}: ${safeTitle}`,
    '',
  ];

  project.steps.forEach((step) => {
    if (enabledStepIds.includes(step.id)) {
      lines.push(`# ${step.title}`);
      lines.push(step.codeSnippet);
    }
  });

  return lines.join('\n');
}
