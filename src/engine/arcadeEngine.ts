import {
  BG_COLOR_OPTIONS,
  drawPixelSprite,
  getSpritePixels,
  type PixelSpriteGrid,
} from './arcadeSprites';

export const ARCADE_WIDTH = 160;
export const ARCADE_HEIGHT = 120;

export type ArcadeCategoryId =
  | 'sprites'
  | 'controller'
  | 'game'
  | 'music'
  | 'scene'
  | 'info'
  | 'loops'
  | 'logic'
  | 'variables';

export type SpriteKind = 'Player' | 'Food' | 'Enemy' | 'Projectile';
export type BgEffectType = 'none' | 'starfield' | 'snow' | 'grid' | 'bubbles';
export type ParticleEffectType = 'none' | 'confetti' | 'fire' | 'hearts' | 'rings' | 'halo';
export type ArcadeSoundName =
  | 'ba_ding'
  | 'pew_pew'
  | 'jump_up'
  | 'power_up'
  | 'wawawawaa'
  | 'zapped'
  | 'magic_wand';
export type SpawnPattern = 'top_random' | 'side_random' | 'wander';

export interface ArcadeStatementBlock {
  id: string;
  type:
    | 'set_bg_color'
    | 'set_bg_effect'
    | 'create_player'
    | 'move_with_buttons'
    | 'stay_in_screen'
    | 'fire_projectile'
    | 'spawn_sprite'
    | 'destroy_other'
    | 'destroy_self'
    | 'start_effect'
    | 'say_text'
    | 'dash_player'
    | 'cycle_player_color'
    | 'set_score'
    | 'change_score'
    | 'set_life'
    | 'change_life'
    | 'start_countdown'
    | 'set_win_score'
    | 'play_sound'
    | 'splash'
    | 'game_over'
    | 'if_score_gte_win'
    | 'if_color_match_score'
    | 'set_speed_var'
    | 'change_speed_var'
    | 'repeat_spawn';
  params: Record<string, string | number | boolean>;
}

export type ArcadeEventType =
  | 'on_start'
  | 'on_button'
  | 'on_update_interval'
  | 'on_overlap';

export interface ArcadeEventContainer {
  id: string;
  eventType: ArcadeEventType;
  params: Record<string, string | number | boolean>;
  blocks: ArcadeStatementBlock[];
}

export interface ArcadeBlockProgram {
  containers: ArcadeEventContainer[];
}

export interface ArcadeCategoryDef {
  id: ArcadeCategoryId;
  label: string;
  color: string;
  bgTint: string;
}

export const ARCADE_CATEGORIES: ArcadeCategoryDef[] = [
  { id: 'sprites', label: 'Sprites', color: '#3B82F6', bgTint: '#EFF6FF' },
  { id: 'controller', label: 'Controller', color: '#EA580C', bgTint: '#FFF7ED' },
  { id: 'game', label: 'Game', color: '#8B5CF6', bgTint: '#F5F3FF' },
  { id: 'music', label: 'Music', color: '#EC4899', bgTint: '#FDF2F8' },
  { id: 'scene', label: 'Scene', color: '#1E3A5F', bgTint: '#F1F5F9' },
  { id: 'info', label: 'Info', color: '#D9468F', bgTint: '#FDF2F8' },
  { id: 'loops', label: 'Loops', color: '#22C55E', bgTint: '#F0FDF4' },
  { id: 'logic', label: 'Logic', color: '#0EA5E9', bgTint: '#F0F9FF' },
  { id: 'variables', label: 'Variables', color: '#EF4444', bgTint: '#FEF2F2' },
];

export interface FlyoutTemplate {
  id: string;
  category: ArcadeCategoryId;
  kind: 'event' | 'statement';
  label: string;
  description: string;
  eventTemplate?: Omit<ArcadeEventContainer, 'id'>;
  statementTemplate?: Omit<ArcadeStatementBlock, 'id'>;
}

export const ARCADE_FLYOUT_TEMPLATES: FlyoutTemplate[] = [
  // SPRITES
  {
    id: 'tpl_create_player',
    category: 'sprites',
    kind: 'statement',
    label: 'set mySprite to sprite [rocket] of kind Player',
    description: 'Membuat karakter utama (Player) di layar arcade',
    statementTemplate: {
      type: 'create_player',
      params: { spriteId: 'rocket', x: 80, y: 92 },
    },
  },
  {
    id: 'tpl_fire_proj',
    category: 'sprites',
    kind: 'statement',
    label: 'projectile [laser] from mySprite vx [0] vy [-120]',
    description: 'Menembakkan proyektil dari posisi pemain',
    statementTemplate: {
      type: 'fire_projectile',
      params: { spriteId: 'laser', vx: 0, vy: -125 },
    },
  },
  {
    id: 'tpl_spawn_food',
    category: 'sprites',
    kind: 'statement',
    label: 'spawn Food [star] pattern [top_random] speed [38]',
    description: 'Memunculkan item bonus (Food) secara otomatis',
    statementTemplate: {
      type: 'spawn_sprite',
      params: { kind: 'Food', spriteId: 'star', speed: 38, pattern: 'top_random' },
    },
  },
  {
    id: 'tpl_spawn_enemy',
    category: 'sprites',
    kind: 'statement',
    label: 'spawn Enemy [meteor] pattern [top_random] speed [48]',
    description: 'Memunculkan musuh/rintangan (Enemy)',
    statementTemplate: {
      type: 'spawn_sprite',
      params: { kind: 'Enemy', spriteId: 'meteor', speed: 48, pattern: 'top_random' },
    },
  },
  {
    id: 'tpl_on_overlap_food',
    category: 'sprites',
    kind: 'event',
    label: 'on sprite of kind [Player] overlaps [Food]',
    description: 'Event saat Pemain menyentuh item Food/Bintang',
    eventTemplate: {
      eventType: 'on_overlap',
      params: { kindA: 'Player', kindB: 'Food' },
      blocks: [],
    },
  },
  {
    id: 'tpl_on_overlap_enemy',
    category: 'sprites',
    kind: 'event',
    label: 'on sprite of kind [Player] overlaps [Enemy]',
    description: 'Event saat Pemain menabrak Musuh',
    eventTemplate: {
      eventType: 'on_overlap',
      params: { kindA: 'Player', kindB: 'Enemy' },
      blocks: [],
    },
  },
  {
    id: 'tpl_on_overlap_proj',
    category: 'sprites',
    kind: 'event',
    label: 'on sprite of kind [Projectile] overlaps [Enemy]',
    description: 'Event saat Laser/Proyektil mengenai Musuh',
    eventTemplate: {
      eventType: 'on_overlap',
      params: { kindA: 'Projectile', kindB: 'Enemy' },
      blocks: [],
    },
  },
  {
    id: 'tpl_destroy_other',
    category: 'sprites',
    kind: 'statement',
    label: 'destroy otherSprite with [fire] effect',
    description: 'Menghancurkan sprite yang disentuh dengan efek partikel',
    statementTemplate: {
      type: 'destroy_other',
      params: { effect: 'fire' },
    },
  },
  {
    id: 'tpl_destroy_self',
    category: 'sprites',
    kind: 'statement',
    label: 'destroy projectile with [rings] effect',
    description: 'Menghapus proyektil setelah mengenai target',
    statementTemplate: {
      type: 'destroy_self',
      params: { effect: 'rings' },
    },
  },
  {
    id: 'tpl_say_text',
    category: 'sprites',
    kind: 'statement',
    label: 'mySprite say ["Siap!"] for [900] ms',
    description: 'Menampilkan balon teks di atas karakter',
    statementTemplate: {
      type: 'say_text',
      params: { text: 'Siap!', ms: 900 },
    },
  },
  {
    id: 'tpl_dash',
    category: 'sprites',
    kind: 'statement',
    label: 'dash mySprite boost [70]',
    description: 'Memberikan dorongan cepat (dash) ke arah gerak pemain',
    statementTemplate: {
      type: 'dash_player',
      params: { boost: 70 },
    },
  },
  {
    id: 'tpl_cycle_color',
    category: 'sprites',
    kind: 'statement',
    label: 'cycle mySprite chroma color',
    description: 'Mengganti warna aura pemain (Merah/Kuning/Hijau/Biru)',
    statementTemplate: {
      type: 'cycle_player_color',
      params: {},
    },
  },

  // CONTROLLER
  {
    id: 'tpl_move_buttons',
    category: 'controller',
    kind: 'statement',
    label: 'move mySprite with buttons vx [105] vy [105]',
    description: 'Aktifkan kontrol D-Pad & tombol Panah/WASD',
    statementTemplate: {
      type: 'move_with_buttons',
      params: { vx: 105, vy: 105 },
    },
  },
  {
    id: 'tpl_stay_screen',
    category: 'controller',
    kind: 'statement',
    label: 'set mySprite stay in screen [ON]',
    description: 'Mencegah karakter keluar dari batas layar 160x120',
    statementTemplate: {
      type: 'stay_in_screen',
      params: { enabled: true },
    },
  },
  {
    id: 'tpl_on_a',
    category: 'controller',
    kind: 'event',
    label: 'on [A] button [pressed]',
    description: 'Jalankan kode setiap tombol A / Spasi ditekan',
    eventTemplate: {
      eventType: 'on_button',
      params: { button: 'A' },
      blocks: [],
    },
  },
  {
    id: 'tpl_on_b',
    category: 'controller',
    kind: 'event',
    label: 'on [B] button [pressed]',
    description: 'Jalankan kode setiap tombol B / X ditekan',
    eventTemplate: {
      eventType: 'on_button',
      params: { button: 'B' },
      blocks: [],
    },
  },

  // GAME
  {
    id: 'tpl_on_interval',
    category: 'game',
    kind: 'event',
    label: 'on game update every [1000] ms',
    description: 'Menjalankan perintah berulang tiap sekian milidetik',
    eventTemplate: {
      eventType: 'on_update_interval',
      params: { ms: 1000 },
      blocks: [],
    },
  },
  {
    id: 'tpl_splash',
    category: 'game',
    kind: 'statement',
    label: 'splash ["MULAI MISI!"]',
    description: 'Menampilkan banner judul sebelum aksi dimulai',
    statementTemplate: {
      type: 'splash',
      params: { text: 'MULAI MISI!' },
    },
  },
  {
    id: 'tpl_game_over_win',
    category: 'game',
    kind: 'statement',
    label: 'game over [WIN]',
    description: 'Mengakhiri permainan dengan status Menang / Kalah',
    statementTemplate: {
      type: 'game_over',
      params: { win: true },
    },
  },

  // MUSIC
  {
    id: 'tpl_play_sound',
    category: 'music',
    kind: 'statement',
    label: 'play sound [ba_ding]',
    description: 'Memainkan efek suara retro 8-bit chiptune',
    statementTemplate: {
      type: 'play_sound',
      params: { sound: 'ba_ding' },
    },
  },

  // SCENE
  {
    id: 'tpl_bg_color',
    category: 'scene',
    kind: 'statement',
    label: 'set background color to [space]',
    description: 'Mengatur warna latar belakang layar arcade',
    statementTemplate: {
      type: 'set_bg_color',
      params: { color: 'space' },
    },
  },
  {
    id: 'tpl_bg_effect',
    category: 'scene',
    kind: 'statement',
    label: 'start screen effect [starfield]',
    description: 'Menambahkan animasi bintang, salju, grid, atau gelembung',
    statementTemplate: {
      type: 'set_bg_effect',
      params: { effect: 'starfield' },
    },
  },
  {
    id: 'tpl_effect_burst',
    category: 'scene',
    kind: 'statement',
    label: 'start [confetti] effect on [player]',
    description: 'Memunculkan semburan partikel di posisi sprite',
    statementTemplate: {
      type: 'start_effect',
      params: { target: 'player', effect: 'confetti' },
    },
  },

  // INFO
  {
    id: 'tpl_set_score',
    category: 'info',
    kind: 'statement',
    label: 'set score to [0]',
    description: 'Mengatur nilai awal skor pemain',
    statementTemplate: {
      type: 'set_score',
      params: { value: 0 },
    },
  },
  {
    id: 'tpl_change_score',
    category: 'info',
    kind: 'statement',
    label: 'change score by [15]',
    description: 'Menambah atau mengurangi skor',
    statementTemplate: {
      type: 'change_score',
      params: { delta: 15 },
    },
  },
  {
    id: 'tpl_set_life',
    category: 'info',
    kind: 'statement',
    label: 'set life to [3]',
    description: 'Mengatur jumlah hati / nyawa awal pemain',
    statementTemplate: {
      type: 'set_life',
      params: { value: 3 },
    },
  },
  {
    id: 'tpl_change_life',
    category: 'info',
    kind: 'statement',
    label: 'change life by [-1]',
    description: 'Mengurangi atau menambah nyawa saat terkena bahaya',
    statementTemplate: {
      type: 'change_life',
      params: { delta: -1 },
    },
  },
  {
    id: 'tpl_countdown',
    category: 'info',
    kind: 'statement',
    label: 'start countdown [45] s',
    description: 'Menjalankan timer hitung mundur permainan',
    statementTemplate: {
      type: 'start_countdown',
      params: { seconds: 45 },
    },
  },
  {
    id: 'tpl_win_score',
    category: 'info',
    kind: 'statement',
    label: 'set win target score [100]',
    description: 'Menampilkan target skor kemenangan di HUD atas',
    statementTemplate: {
      type: 'set_win_score',
      params: { target: 100 },
    },
  },

  // LOOPS
  {
    id: 'tpl_repeat_spawn',
    category: 'loops',
    kind: 'statement',
    label: 'repeat [3] times: spawn [Food] [star]',
    description: 'Memunculkan beberapa sprite sekaligus menggunakan perulangan',
    statementTemplate: {
      type: 'repeat_spawn',
      params: { count: 3, kind: 'Food', spriteId: 'star' },
    },
  },

  // LOGIC
  {
    id: 'tpl_if_score_win',
    category: 'logic',
    kind: 'statement',
    label: 'if score >= [100] then game over [WIN]',
    description: 'Kondisi if untuk memeriksa apakah target skor tercapai',
    statementTemplate: {
      type: 'if_score_gte_win',
      params: { target: 100 },
    },
  },
  {
    id: 'tpl_if_color_match',
    category: 'logic',
    kind: 'statement',
    label: 'if color matches: +[20] score else [-1] life',
    description: 'Logika Chroma: cek kecocokan warna pemain dan orb target',
    statementTemplate: {
      type: 'if_color_match_score',
      params: { points: 20, penalty: -1 },
    },
  },

  // VARIABLES
  {
    id: 'tpl_set_speed',
    category: 'variables',
    kind: 'statement',
    label: 'set [speed] to [50]',
    description: 'Menyimpan variabel kecepatan dasar musuh/item',
    statementTemplate: {
      type: 'set_speed_var',
      params: { speed: 50 },
    },
  },
  {
    id: 'tpl_change_speed',
    category: 'variables',
    kind: 'statement',
    label: 'change [speed] by [5]',
    description: 'Meningkatkan tingkat kesulitan secara bertahap',
    statementTemplate: {
      type: 'change_speed_var',
      params: { delta: 5 },
    },
  },
];

export function getStatementCategory(type: ArcadeStatementBlock['type']): ArcadeCategoryId {
  switch (type) {
    case 'set_bg_color':
    case 'set_bg_effect':
    case 'start_effect':
      return 'scene';
    case 'create_player':
    case 'fire_projectile':
    case 'spawn_sprite':
    case 'destroy_other':
    case 'destroy_self':
    case 'say_text':
    case 'dash_player':
    case 'cycle_player_color':
      return 'sprites';
    case 'move_with_buttons':
    case 'stay_in_screen':
      return 'controller';
    case 'set_score':
    case 'change_score':
    case 'set_life':
    case 'change_life':
    case 'start_countdown':
    case 'set_win_score':
      return 'info';
    case 'play_sound':
      return 'music';
    case 'splash':
    case 'game_over':
      return 'game';
    case 'if_score_gte_win':
    case 'if_color_match_score':
      return 'logic';
    case 'repeat_spawn':
      return 'loops';
    case 'set_speed_var':
    case 'change_speed_var':
      return 'variables';
  }
}

export function getEventColor(eventType: ArcadeEventType): string {
  switch (eventType) {
    case 'on_start':
      return '#22A06B';
    case 'on_button':
      return '#EA580C';
    case 'on_update_interval':
      return '#8B5CF6';
    case 'on_overlap':
      return '#3B82F6';
  }
}

export function getCategoryColor(cat: ArcadeCategoryId): string {
  return ARCADE_CATEGORIES.find((c) => c.id === cat)?.color || '#3B82F6';
}

export function makeBlockId(prefix = 'blk'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// ==================== BLOCKS -> MAKECODE PYTHON ====================

function stmtToPython(stmt: ArcadeStatementBlock, indent = ''): string[] {
  const p = stmt.params;
  switch (stmt.type) {
    case 'set_bg_color':
      return [`${indent}scene.set_background_color("${p.color || 'space'}")`];
    case 'set_bg_effect':
      return [`${indent}scene.set_background_effect("${p.effect || 'starfield'}")`];
    case 'create_player':
      return [
        `${indent}my_sprite = sprites.create(assets.image("${p.spriteId || 'rocket'}"), SpriteKind.player)`,
        `${indent}my_sprite.set_position(${Number(p.x ?? 80)}, ${Number(p.y ?? 92)})`,
      ];
    case 'move_with_buttons':
      return [`${indent}controller.move_sprite(my_sprite, ${Number(p.vx ?? 105)}, ${Number(p.vy ?? 105)})`];
    case 'stay_in_screen':
      return [`${indent}my_sprite.set_stay_in_screen(${p.enabled === false ? 'False' : 'True'})`];
    case 'fire_projectile':
      return [
        `${indent}sprites.create_projectile_from_sprite(assets.image("${p.spriteId || 'laser'}"), my_sprite, ${Number(p.vx ?? 0)}, ${Number(p.vy ?? -125)})`,
      ];
    case 'spawn_sprite':
      return [
        `${indent}sprites.spawn(SpriteKind.${String(p.kind || 'Enemy').toLowerCase()}, assets.image("${p.spriteId || 'meteor'}"), ${Number(p.speed ?? 45)}, "${p.pattern || 'top_random'}")`,
      ];
    case 'destroy_other':
      return [`${indent}other_sprite.destroy("${p.effect || 'fire'}")`];
    case 'destroy_self':
      return [`${indent}sprite.destroy("${p.effect || 'rings'}")`];
    case 'start_effect':
      return [`${indent}effects.start("${p.effect || 'confetti'}", "${p.target || 'player'}")`];
    case 'say_text':
      return [`${indent}my_sprite.say("${String(p.text || 'Halo!').replace(/"/g, "'")}", ${Number(p.ms ?? 900)})`];
    case 'dash_player':
      return [`${indent}my_sprite.dash(${Number(p.boost ?? 70)})`];
    case 'cycle_player_color':
      return [`${indent}my_sprite.cycle_chroma_color()`];
    case 'set_score':
      return [`${indent}info.set_score(${Number(p.value ?? 0)})`];
    case 'change_score':
      return [`${indent}info.change_score_by(${Number(p.delta ?? 10)})`];
    case 'set_life':
      return [`${indent}info.set_life(${Number(p.value ?? 3)})`];
    case 'change_life':
      return [`${indent}info.change_life_by(${Number(p.delta ?? -1)})`];
    case 'start_countdown':
      return [`${indent}info.start_countdown(${Number(p.seconds ?? 45)})`];
    case 'set_win_score':
      return [`${indent}info.set_win_target(${Number(p.target ?? 100)})`];
    case 'play_sound':
      return [`${indent}music.play_sound("${p.sound || 'ba_ding'}")`];
    case 'splash':
      return [`${indent}game.splash("${String(p.text || 'MULAI!').replace(/"/g, "'")}")`];
    case 'game_over':
      return [`${indent}game.over(${p.win === false ? 'False' : 'True'})`];
    case 'if_score_gte_win':
      return [
        `${indent}if info.score() >= ${Number(p.target ?? 100)}:`,
        `${indent}    game.over(True)`,
      ];
    case 'if_color_match_score':
      return [
        `${indent}if my_sprite.matches_color(other_sprite):`,
        `${indent}    info.change_score_by(${Number(p.points ?? 20)})`,
        `${indent}else:`,
        `${indent}    info.change_life_by(${Number(p.penalty ?? -1)})`,
      ];
    case 'set_speed_var':
      return [`${indent}speed = ${Number(p.speed ?? 50)}`];
    case 'change_speed_var':
      return [`${indent}speed += ${Number(p.delta ?? 5)}`];
    case 'repeat_spawn':
      return [
        `${indent}for _ in range(${Number(p.count ?? 3)}):`,
        `${indent}    sprites.spawn(SpriteKind.${String(p.kind || 'Food').toLowerCase()}, assets.image("${p.spriteId || 'star'}"), 36, "wander")`,
      ];
  }
}

export function arcadeProgramToPython(program: ArcadeBlockProgram, gameTitle: string): string {
  const lines: string[] = [
    `# CodeSpark Arcade Python — ${gameTitle || 'My Arcade Game'}`,
    '',
  ];

  const onStart = program.containers.find((c) => c.eventType === 'on_start');
  if (onStart) {
    lines.push('# --- on start ---');
    if (onStart.blocks.length === 0) {
      lines.push('# Tambahkan blok ke on start');
    } else {
      onStart.blocks.forEach((blk) => {
        lines.push(...stmtToPython(blk, ''));
      });
    }
    lines.push('');
  }

  let fnIndex = 1;
  program.containers
    .filter((c) => c.eventType !== 'on_start')
    .forEach((container) => {
      if (container.eventType === 'on_button') {
        const btn = String(container.params.button || 'A').toUpperCase();
        const fnName = `on_${btn.toLowerCase()}_pressed_${fnIndex++}`;
        lines.push(`def ${fnName}():`);
        if (container.blocks.length === 0) {
          lines.push('    pass');
        } else {
          container.blocks.forEach((blk) => lines.push(...stmtToPython(blk, '    ')));
        }
        lines.push(`controller.${btn}.on_event(ControllerButtonEvent.PRESSED, ${fnName})`);
        lines.push('');
      } else if (container.eventType === 'on_update_interval') {
        const ms = Number(container.params.ms ?? 1000);
        const fnName = `on_update_interval_${fnIndex++}`;
        lines.push(`def ${fnName}():`);
        if (container.blocks.length === 0) {
          lines.push('    pass');
        } else {
          container.blocks.forEach((blk) => lines.push(...stmtToPython(blk, '    ')));
        }
        lines.push(`game.on_update_interval(${ms}, ${fnName})`);
        lines.push('');
      } else if (container.eventType === 'on_overlap') {
        const kindA = String(container.params.kindA || 'Player');
        const kindB = String(container.params.kindB || 'Food');
        const fnName = `on_overlap_${kindA.toLowerCase()}_${kindB.toLowerCase()}_${fnIndex++}`;
        lines.push(`def ${fnName}(sprite, other_sprite):`);
        if (container.blocks.length === 0) {
          lines.push('    pass');
        } else {
          container.blocks.forEach((blk) => lines.push(...stmtToPython(blk, '    ')));
        }
        lines.push(
          `sprites.on_overlap(SpriteKind.${kindA.toLowerCase()}, SpriteKind.${kindB.toLowerCase()}, ${fnName})`
        );
        lines.push('');
      }
    });

  return lines.join('\n').trim() + '\n';
}

// ==================== SAFE PYTHON -> BLOCK PROGRAM PARSER ====================

export interface ArcadeParseResult {
  program: ArcadeBlockProgram;
  errors: Array<{ line: number; message: string }>;
}

function capitalizeKind(raw: string): SpriteKind {
  const lower = raw.trim().toLowerCase();
  if (lower === 'food') return 'Food';
  if (lower === 'enemy') return 'Enemy';
  if (lower === 'projectile') return 'Projectile';
  return 'Player';
}

function parseSinglePythonStatement(
  rawLine: string,
  allLines: string[],
  index: number
): { stmt: ArcadeStatementBlock | null; consumedExtra: number; recognized: boolean } {
  const line = rawLine.trim();
  if (!line || line.startsWith('#') || line === 'pass') {
    return { stmt: null, consumedExtra: 0, recognized: true };
  }

  let m: RegExpMatchArray | null;

  // scene.set_background_color("space")
  m = line.match(/^scene\.set_background_color\(\s*["']([^"']+)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('bg'), type: 'set_bg_color', params: { color: m[1] } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // scene.set_background_effect("starfield")
  m = line.match(/^scene\.set_background_effect\(\s*["']([^"']+)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('bge'), type: 'set_bg_effect', params: { effect: m[1] } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // my_sprite = sprites.create(assets.image("rocket"), SpriteKind.player)
  m = line.match(
    /^[a-zA-Z_]\w*\s*=\s*sprites\.create\(\s*assets\.image\(\s*["']([^"']+)["']\s*\)\s*,\s*SpriteKind\.(\w+)\s*\)$/
  );
  if (m) {
    let x = 80;
    let y = 92;
    let consumedExtra = 0;
    const nextLine = (allLines[index + 1] || '').trim();
    const posMatch = nextLine.match(/^[a-zA-Z_]\w*\.set_position\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/);
    if (posMatch) {
      x = Number(posMatch[1]);
      y = Number(posMatch[2]);
      consumedExtra = 1;
    }
    return {
      stmt: { id: makeBlockId('plr'), type: 'create_player', params: { spriteId: m[1], x, y } },
      consumedExtra,
      recognized: true,
    };
  }

  // standalone set_position ignored if already merged, else recognized
  if (/^[a-zA-Z_]\w*\.set_position\(\s*-?\d+\s*,\s*-?\d+\s*\)$/.test(line)) {
    return { stmt: null, consumedExtra: 0, recognized: true };
  }

  // controller.move_sprite(my_sprite, 100, 100)
  m = line.match(/^controller\.move_sprite\(\s*[a-zA-Z_]\w*(?:\s*,\s*(-?\d+)\s*,\s*(-?\d+))?\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeBlockId('mov'),
        type: 'move_with_buttons',
        params: { vx: Number(m[1] ?? 100), vy: Number(m[2] ?? 100) },
      },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // my_sprite.set_stay_in_screen(True)
  m = line.match(/^[a-zA-Z_]\w*\.set_stay_in_screen\(\s*(True|False)\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeBlockId('stay'),
        type: 'stay_in_screen',
        params: { enabled: m[1] === 'True' },
      },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // sprites.create_projectile_from_sprite(assets.image("laser"), my_sprite, 0, -120)
  m = line.match(
    /^sprites\.create_projectile_from_sprite\(\s*assets\.image\(\s*["']([^"']+)["']\s*\)\s*,\s*[a-zA-Z_]\w*\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/
  );
  if (m) {
    return {
      stmt: {
        id: makeBlockId('proj'),
        type: 'fire_projectile',
        params: { spriteId: m[1], vx: Number(m[2]), vy: Number(m[3]) },
      },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // sprites.spawn(SpriteKind.enemy, assets.image("meteor"), 48, "top_random")
  m = line.match(
    /^sprites\.spawn\(\s*SpriteKind\.(\w+)\s*,\s*assets\.image\(\s*["']([^"']+)["']\s*\)\s*,\s*(-?\d+)(?:\s*,\s*["']([^"']+)["'])?\s*\)$/
  );
  if (m) {
    return {
      stmt: {
        id: makeBlockId('spn'),
        type: 'spawn_sprite',
        params: {
          kind: capitalizeKind(m[1]),
          spriteId: m[2],
          speed: Number(m[3]),
          pattern: m[4] || 'top_random',
        },
      },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // other_sprite.destroy("fire")
  m = line.match(/^other_sprite\.destroy\(\s*(?:["']([^"']+)["'])?\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('deso'), type: 'destroy_other', params: { effect: m[1] || 'fire' } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // sprite.destroy("rings")
  m = line.match(/^sprite\.destroy\(\s*(?:["']([^"']+)["'])?\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('dess'), type: 'destroy_self', params: { effect: m[1] || 'rings' } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // effects.start("confetti", "player")
  m = line.match(/^effects\.start\(\s*["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeBlockId('eff'),
        type: 'start_effect',
        params: { effect: m[1], target: m[2] || 'player' },
      },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // my_sprite.say("Halo!", 900)
  m = line.match(/^[a-zA-Z_]\w*\.say\(\s*["']([^"']*)["'](?:\s*,\s*(\d+))?\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeBlockId('say'),
        type: 'say_text',
        params: { text: m[1], ms: Number(m[2] ?? 900) },
      },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // my_sprite.dash(70)
  m = line.match(/^[a-zA-Z_]\w*\.dash\(\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('dsh'), type: 'dash_player', params: { boost: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // my_sprite.cycle_chroma_color()
  if (/^[a-zA-Z_]\w*\.cycle_chroma_color\(\s*\)$/.test(line)) {
    return {
      stmt: { id: makeBlockId('col'), type: 'cycle_player_color', params: {} },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // info.set_score(0)
  m = line.match(/^info\.set_score\(\s*(-?\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('ss'), type: 'set_score', params: { value: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // info.change_score_by(10)
  m = line.match(/^info\.change_score_by\(\s*(-?\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('cs'), type: 'change_score', params: { delta: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // info.set_life(3)
  m = line.match(/^info\.set_life\(\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('sl'), type: 'set_life', params: { value: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // info.change_life_by(-1)
  m = line.match(/^info\.change_life_by\(\s*(-?\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('cl'), type: 'change_life', params: { delta: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // info.start_countdown(45)
  m = line.match(/^info\.start_countdown\(\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('cd'), type: 'start_countdown', params: { seconds: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // info.set_win_target(100)
  m = line.match(/^info\.set_win_target\(\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('wt'), type: 'set_win_score', params: { target: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // music.play_sound("ba_ding")
  m = line.match(/^music\.play_sound\(\s*["']([^"']+)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('snd'), type: 'play_sound', params: { sound: m[1] } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // game.splash("TEXT")
  m = line.match(/^game\.splash\(\s*["']([^"']*)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('spl'), type: 'splash', params: { text: m[1] } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // game.over(True)
  m = line.match(/^game\.over\(\s*(True|False)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('ovr'), type: 'game_over', params: { win: m[1] === 'True' } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // if info.score() >= 100:
  m = line.match(/^if\s+info\.score\(\)\s*>=\s*(\d+)\s*:$/);
  if (m) {
    let consumedExtra = 0;
    const nextTrim = (allLines[index + 1] || '').trim();
    if (/^game\.over\(/.test(nextTrim)) consumedExtra = 1;
    return {
      stmt: { id: makeBlockId('ifw'), type: 'if_score_gte_win', params: { target: Number(m[1]) } },
      consumedExtra,
      recognized: true,
    };
  }

  // if my_sprite.matches_color(other_sprite):
  if (/^if\s+[a-zA-Z_]\w*\.matches_color\(\s*other_sprite\s*\)\s*:$/.test(line)) {
    let points = 20;
    let penalty = -1;
    let consumedExtra = 0;
    const l1 = (allLines[index + 1] || '').trim();
    const m1 = l1.match(/^info\.change_score_by\(\s*(-?\d+)\s*\)$/);
    if (m1) {
      points = Number(m1[1]);
      consumedExtra = 1;
    }
    const l2 = (allLines[index + 2] || '').trim();
    if (l2 === 'else:') {
      consumedExtra = 2;
      const l3 = (allLines[index + 3] || '').trim();
      const m3 = l3.match(/^info\.change_life_by\(\s*(-?\d+)\s*\)$/);
      if (m3) {
        penalty = Number(m3[1]);
        consumedExtra = 3;
      }
    }
    return {
      stmt: { id: makeBlockId('ifc'), type: 'if_color_match_score', params: { points, penalty } },
      consumedExtra,
      recognized: true,
    };
  }

  // for _ in range(3):
  m = line.match(/^for\s+\w+\s+in\s+range\(\s*(\d+)\s*\)\s*:$/);
  if (m) {
    const count = Math.max(1, Math.min(8, Number(m[1])));
    let kind: SpriteKind = 'Food';
    let spriteId = 'star';
    let consumedExtra = 0;
    const nextTrim = (allLines[index + 1] || '').trim();
    const sm = nextTrim.match(
      /^sprites\.spawn\(\s*SpriteKind\.(\w+)\s*,\s*assets\.image\(\s*["']([^"']+)["']\s*\)/
    );
    if (sm) {
      kind = capitalizeKind(sm[1]);
      spriteId = sm[2];
      consumedExtra = 1;
    }
    return {
      stmt: { id: makeBlockId('rep'), type: 'repeat_spawn', params: { count, kind, spriteId } },
      consumedExtra,
      recognized: true,
    };
  }

  // speed = 50
  m = line.match(/^speed\s*=\s*(\d+)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('spd'), type: 'set_speed_var', params: { speed: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  // speed += 5
  m = line.match(/^speed\s*\+=\s*(-?\d+)$/);
  if (m) {
    return {
      stmt: { id: makeBlockId('spdc'), type: 'change_speed_var', params: { delta: Number(m[1]) } },
      consumedExtra: 0,
      recognized: true,
    };
  }

  return { stmt: null, consumedExtra: 0, recognized: false };
}

export function parseArcadePython(code: string): ArcadeParseResult {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const errors: Array<{ line: number; message: string }> = [];

  const onStartBlocks: ArcadeStatementBlock[] = [];
  const functionsMap = new Map<string, ArcadeStatementBlock[]>();
  const eventContainers: ArcadeEventContainer[] = [];

  let currentFnName: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const indentLen = raw.length - raw.trimStart().length;

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Function definition
    const defMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*:$/);
    if (defMatch && indentLen === 0) {
      currentFnName = defMatch[1];
      functionsMap.set(currentFnName, []);
      continue;
    }

    // Exit function scope when indentation returns to 0
    if (indentLen === 0) {
      currentFnName = null;
    }

    // Event bindings at top level
    if (indentLen === 0) {
      const btnMatch = trimmed.match(
        /^controller\.(A|B)\.on_event\(\s*ControllerButtonEvent\.PRESSED\s*,\s*([a-zA-Z_]\w*)\s*\)$/i
      );
      if (btnMatch) {
        const button = btnMatch[1].toUpperCase();
        const fnBlocks = functionsMap.get(btnMatch[2]) || [];
        eventContainers.push({
          id: makeBlockId('ev_btn'),
          eventType: 'on_button',
          params: { button },
          blocks: [...fnBlocks],
        });
        continue;
      }

      const intMatch = trimmed.match(
        /^game\.on_update_interval\(\s*(\d+)\s*,\s*([a-zA-Z_]\w*)\s*\)$/
      );
      if (intMatch) {
        const ms = Math.max(200, Number(intMatch[1]));
        const fnBlocks = functionsMap.get(intMatch[2]) || [];
        eventContainers.push({
          id: makeBlockId('ev_int'),
          eventType: 'on_update_interval',
          params: { ms },
          blocks: [...fnBlocks],
        });
        continue;
      }

      const ovMatch = trimmed.match(
        /^sprites\.on_overlap\(\s*SpriteKind\.(\w+)\s*,\s*SpriteKind\.(\w+)\s*,\s*([a-zA-Z_]\w*)\s*\)$/
      );
      if (ovMatch) {
        const kindA = capitalizeKind(ovMatch[1]);
        const kindB = capitalizeKind(ovMatch[2]);
        const fnBlocks = functionsMap.get(ovMatch[3]) || [];
        eventContainers.push({
          id: makeBlockId('ev_ov'),
          eventType: 'on_overlap',
          params: { kindA, kindB },
          blocks: [...fnBlocks],
        });
        continue;
      }
    }

    const parsed = parseSinglePythonStatement(raw, lines, i);
    if (!parsed.recognized) {
      errors.push({
        line: i + 1,
        message: `Perintah Python belum dikenali: "${trimmed.slice(0, 48)}"`,
      });
      continue;
    }

    i += parsed.consumedExtra;
    if (parsed.stmt) {
      if (currentFnName && indentLen > 0) {
        functionsMap.get(currentFnName)?.push(parsed.stmt);
      } else {
        onStartBlocks.push(parsed.stmt);
      }
    }
  }

  const containers: ArcadeEventContainer[] = [
    {
      id: 'ev_start',
      eventType: 'on_start',
      params: {},
      blocks: onStartBlocks,
    },
    ...eventContainers,
  ];

  return {
    program: { containers },
    errors,
  };
}

// ==================== 8-BIT CHIPTUNE AUDIO SYNTHESIZER ====================

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtor) {
      sharedAudioCtx = new AudioCtor();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playArcadeSfx(sound: ArcadeSoundName | string, muted: boolean) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playTone = (
    freq: number,
    startOffset: number,
    dur: number,
    type: OscillatorType = 'square',
    vol = 0.08,
    endFreq?: number
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + startOffset + dur);
    }
    gain.gain.setValueAtTime(vol, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + dur + 0.01);
  };

  switch (sound) {
    case 'ba_ding':
      playTone(987.77, 0, 0.08, 'square', 0.07);
      playTone(1318.51, 0.07, 0.16, 'square', 0.07);
      break;
    case 'pew_pew':
      playTone(920, 0, 0.11, 'sawtooth', 0.06, 220);
      break;
    case 'jump_up':
      playTone(300, 0, 0.14, 'square', 0.06, 720);
      break;
    case 'power_up':
      playTone(523.25, 0, 0.07, 'square', 0.07);
      playTone(659.25, 0.06, 0.07, 'square', 0.07);
      playTone(783.99, 0.12, 0.07, 'square', 0.07);
      playTone(1046.5, 0.18, 0.16, 'square', 0.08);
      break;
    case 'wawawawaa':
      playTone(360, 0, 0.15, 'sawtooth', 0.07, 300);
      playTone(310, 0.15, 0.18, 'sawtooth', 0.07, 230);
      playTone(230, 0.33, 0.25, 'sawtooth', 0.07, 140);
      break;
    case 'zapped':
      playTone(220, 0, 0.14, 'sawtooth', 0.08, 80);
      break;
    case 'magic_wand':
      playTone(660, 0, 0.06, 'triangle', 0.08);
      playTone(880, 0.05, 0.06, 'triangle', 0.08);
      playTone(1174, 0.1, 0.12, 'triangle', 0.08);
      break;
    default:
      playTone(660, 0, 0.09, 'square', 0.06);
  }
}

// ==================== 60 FPS RETRO ARCADE RUNTIME ====================

export interface ArcadeInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
}

interface RuntimeSprite {
  id: string;
  kind: SpriteKind;
  spriteId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  alive: boolean;
  chromaIndex?: number; // 0..3 for Chroma Color Puzzle
  wanderTimer?: number;
}

interface RuntimeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface BgStar {
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
}

export const CHROMA_CHANNELS = [
  { name: 'MERAH', hex: '#ff2121' },
  { name: 'KUNING', hex: '#fff609' },
  { name: 'HIJAU', hex: '#78dc52' },
  { name: 'CYAN', hex: '#87f2ff' },
];

export interface ArcadeHudSnapshot {
  score: number;
  life: number;
  winTarget: number | null;
  countdown: number | null;
  status: 'playing' | 'splash' | 'win' | 'lose';
  spriteCount: number;
  fps: number;
  hasPlayed: boolean;
}

export class ArcadeRuntime {
  private program: ArcadeBlockProgram;
  private customSprites: Record<string, PixelSpriteGrid>;
  public muted = false;
  public showDebug = false;

  private bgHex = '#0b1026';
  private bgEffect: BgEffectType = 'none';
  private bgParticles: BgStar[] = [];

  private player: RuntimeSprite | null = null;
  private sprites: RuntimeSprite[] = [];
  private particles: RuntimeParticle[] = [];

  private moveVx = 0;
  private moveVy = 0;
  private stayInScreen = true;

  private score = 0;
  private life = 3;
  private winTarget: number | null = null;
  private countdown: number | null = null;
  private speedVar = 45;

  private status: 'playing' | 'splash' | 'win' | 'lose' = 'playing';
  private splashText = '';
  private sayText = '';
  private sayTimer = 0;
  private invulnTimer = 0;
  private shakeTimer = 0;
  private dashTimer = 0;
  private dashVx = 0;
  private dashVy = 0;
  private lastDirX = 0;
  private lastDirY = -1;
  private chromaEnabled = false;

  private intervalTimers: number[] = [];
  private prevA = false;
  private prevB = false;
  private elapsed = 0;
  private fps = 60;
  private hasPlayed = false;

  constructor(program: ArcadeBlockProgram, customSprites: Record<string, PixelSpriteGrid> = {}) {
    this.program = program;
    this.customSprites = customSprites;
    this.reset();
  }

  public updateCustomSprites(customSprites: Record<string, PixelSpriteGrid>) {
    this.customSprites = customSprites;
  }

  public loadProgram(program: ArcadeBlockProgram, customSprites?: Record<string, PixelSpriteGrid>) {
    this.program = program;
    if (customSprites) {
      this.customSprites = customSprites;
    }
    this.reset();
  }

  public reset() {
    this.bgHex = '#0b1026';
    this.bgEffect = 'none';
    this.player = null;
    this.sprites = [];
    this.particles = [];
    this.moveVx = 0;
    this.moveVy = 0;
    this.stayInScreen = true;
    this.score = 0;
    this.life = 3;
    this.winTarget = null;
    this.countdown = null;
    this.speedVar = 45;
    this.status = 'playing';
    this.splashText = '';
    this.sayText = '';
    this.sayTimer = 0;
    this.invulnTimer = 0;
    this.shakeTimer = 0;
    this.dashTimer = 0;
    this.chromaEnabled = false;
    this.prevA = false;
    this.prevB = false;
    this.elapsed = 0;
    this.hasPlayed = false;

    const intervals = this.program.containers.filter((c) => c.eventType === 'on_update_interval');
    this.intervalTimers = intervals.map(() => 0.35);

    // Check if program uses chroma features
    const usesChroma = this.program.containers.some((c) =>
      c.blocks.some((b) => b.type === 'cycle_player_color' || b.type === 'if_color_match_score')
    );
    this.chromaEnabled = usesChroma;

    // Execute on_start blocks
    const onStart = this.program.containers.find((c) => c.eventType === 'on_start');
    if (onStart) {
      this.executeStatements(onStart.blocks, null, null);
    }

    this.initBgParticles();
  }

  public dismissSplash() {
    if (this.status === 'splash') {
      this.status = 'playing';
      playArcadeSfx('ba_ding', this.muted);
    } else if (this.status === 'win' || this.status === 'lose') {
      this.reset();
    }
  }

  public getSnapshot(): ArcadeHudSnapshot {
    return {
      score: this.score,
      life: this.life,
      winTarget: this.winTarget,
      countdown: this.countdown !== null ? Math.max(0, Math.ceil(this.countdown)) : null,
      status: this.status,
      spriteCount: this.sprites.length + (this.player ? 1 : 0),
      fps: this.fps,
      hasPlayed: this.hasPlayed,
    };
  }

  private initBgParticles() {
    this.bgParticles = [];
    const count = this.bgEffect === 'starfield' ? 32 : this.bgEffect === 'snow' ? 28 : this.bgEffect === 'bubbles' ? 20 : 0;
    for (let i = 0; i < count; i++) {
      this.bgParticles.push({
        x: Math.random() * ARCADE_WIDTH,
        y: Math.random() * ARCADE_HEIGHT,
        speed:
          this.bgEffect === 'starfield'
            ? 14 + Math.random() * 32
            : this.bgEffect === 'snow'
              ? 12 + Math.random() * 20
              : 10 + Math.random() * 18,
        size: Math.random() > 0.72 ? 2 : 1,
        color:
          this.bgEffect === 'snow'
            ? '#ffffff'
            : this.bgEffect === 'bubbles'
              ? '#87f2ff'
              : Math.random() > 0.65
                ? '#fff609'
                : '#ffffff',
      });
    }
  }

  private spawnParticles(x: number, y: number, effect: ParticleEffectType) {
    if (effect === 'none') return;
    const colors =
      effect === 'fire'
        ? ['#ff2121', '#ff8135', '#fff609']
        : effect === 'hearts'
          ? ['#ff2121', '#ff93c4', '#ffffff']
          : effect === 'rings' || effect === 'halo'
            ? ['#87f2ff', '#ffffff', '#249ca3']
            : ['#fff609', '#78dc52', '#ff93c4', '#87f2ff', '#ff8135'];

    const count = effect === 'confetti' ? 16 : 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = 25 + Math.random() * 55;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: colors[i % colors.length],
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.65,
        size: Math.random() > 0.5 ? 2 : 1,
      });
    }
  }

  private spawnOneSprite(
    kind: SpriteKind,
    spriteId: string,
    speed: number,
    pattern: SpawnPattern
  ) {
    if (this.sprites.length > 36) return;
    const effSpeed = Math.max(15, speed || this.speedVar);
    let x = 20 + Math.random() * (ARCADE_WIDTH - 40);
    let y = -6;
    let vx = 0;
    let vy = effSpeed;

    if (pattern === 'side_random') {
      const fromLeft = Math.random() > 0.5;
      x = fromLeft ? -6 : ARCADE_WIDTH + 6;
      y = 20 + Math.random() * (ARCADE_HEIGHT - 34);
      vx = fromLeft ? effSpeed : -effSpeed;
      vy = (Math.random() - 0.5) * 18;
    } else if (pattern === 'wander') {
      x = 18 + Math.random() * (ARCADE_WIDTH - 36);
      y = 22 + Math.random() * (ARCADE_HEIGHT - 40);
      // Avoid spawning right on top of player
      if (this.player && Math.hypot(x - this.player.x, y - this.player.y) < 28) {
        x = this.player.x > ARCADE_WIDTH / 2 ? 26 : ARCADE_WIDTH - 26;
      }
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * (effSpeed * 0.75);
      vy = Math.sin(angle) * (effSpeed * 0.75);
    }

    const chromaIndex = this.chromaEnabled ? Math.floor(Math.random() * CHROMA_CHANNELS.length) : undefined;

    this.sprites.push({
      id: makeBlockId('sp'),
      kind,
      spriteId,
      x,
      y,
      vx,
      vy,
      width: 13,
      height: 13,
      alive: true,
      chromaIndex,
      wanderTimer: pattern === 'wander' ? 1.5 + Math.random() * 1.5 : undefined,
    });
  }

  private executeStatements(
    blocks: ArcadeStatementBlock[],
    selfSprite: RuntimeSprite | null,
    otherSprite: RuntimeSprite | null
  ) {
    for (const blk of blocks) {
      if (this.status === 'win' || this.status === 'lose') break;
      const p = blk.params;

      switch (blk.type) {
        case 'set_bg_color': {
          const found = BG_COLOR_OPTIONS.find((b) => b.id === p.color);
          this.bgHex = found ? found.hex : String(p.color || '#0b1026');
          break;
        }
        case 'set_bg_effect':
          this.bgEffect = (p.effect as BgEffectType) || 'none';
          this.initBgParticles();
          break;
        case 'create_player':
          this.player = {
            id: 'player',
            kind: 'Player',
            spriteId: String(p.spriteId || 'rocket'),
            x: Number(p.x ?? 80),
            y: Number(p.y ?? 92),
            vx: 0,
            vy: 0,
            width: 13,
            height: 13,
            alive: true,
            chromaIndex: this.chromaEnabled ? 0 : undefined,
          };
          break;
        case 'move_with_buttons':
          this.moveVx = Number(p.vx ?? 100);
          this.moveVy = Number(p.vy ?? 100);
          break;
        case 'stay_in_screen':
          this.stayInScreen = p.enabled !== false;
          break;
        case 'fire_projectile':
          if (this.player) {
            const pvx = Number(p.vx ?? 0);
            const pvy = Number(p.vy ?? -125);
            this.sprites.push({
              id: makeBlockId('prj'),
              kind: 'Projectile',
              spriteId: String(p.spriteId || 'laser'),
              x: this.player.x,
              y: this.player.y - (pvy < 0 ? 8 : 0),
              vx: pvx,
              vy: pvy,
              width: 9,
              height: 11,
              alive: true,
              chromaIndex: this.player.chromaIndex,
            });
          }
          break;
        case 'spawn_sprite':
          this.spawnOneSprite(
            (p.kind as SpriteKind) || 'Enemy',
            String(p.spriteId || 'meteor'),
            Number(p.speed ?? this.speedVar),
            (p.pattern as SpawnPattern) || 'top_random'
          );
          break;
        case 'destroy_other':
          if (otherSprite && otherSprite.alive) {
            otherSprite.alive = false;
            this.spawnParticles(
              otherSprite.x,
              otherSprite.y,
              (p.effect as ParticleEffectType) || 'fire'
            );
          }
          break;
        case 'destroy_self':
          if (selfSprite && selfSprite.kind !== 'Player' && selfSprite.alive) {
            selfSprite.alive = false;
            this.spawnParticles(
              selfSprite.x,
              selfSprite.y,
              (p.effect as ParticleEffectType) || 'rings'
            );
          }
          break;
        case 'start_effect': {
          const target = p.target === 'other' && otherSprite ? otherSprite : this.player;
          if (target) {
            this.spawnParticles(
              target.x,
              target.y,
              (p.effect as ParticleEffectType) || 'confetti'
            );
          }
          break;
        }
        case 'say_text':
          this.sayText = String(p.text || 'Halo!');
          this.sayTimer = Math.max(0.3, Number(p.ms ?? 900) / 1000);
          break;
        case 'dash_player':
          if (this.player) {
            const boost = Number(p.boost ?? 70);
            this.dashTimer = 0.16;
            this.dashVx = this.lastDirX * boost * 2.1;
            this.dashVy = this.lastDirY * boost * 2.1;
            this.spawnParticles(this.player.x, this.player.y, 'rings');
          }
          break;
        case 'cycle_player_color':
          if (this.player) {
            this.chromaEnabled = true;
            this.player.chromaIndex = ((this.player.chromaIndex ?? 0) + 1) % CHROMA_CHANNELS.length;
            this.spawnParticles(this.player.x, this.player.y, 'halo');
          }
          break;
        case 'set_score':
          this.score = Number(p.value ?? 0);
          break;
        case 'change_score':
          this.score += Number(p.delta ?? 10);
          if (this.winTarget !== null && this.score >= this.winTarget) {
            this.status = 'win';
            playArcadeSfx('power_up', this.muted);
            if (this.player) this.spawnParticles(this.player.x, this.player.y, 'confetti');
          }
          break;
        case 'set_life':
          this.life = Math.max(1, Number(p.value ?? 3));
          break;
        case 'change_life': {
          const delta = Number(p.delta ?? -1);
          if (delta < 0) {
            if (this.invulnTimer > 0) break;
            this.invulnTimer = 0.9;
            this.shakeTimer = 0.25;
          }
          this.life += delta;
          if (this.life <= 0) {
            this.life = 0;
            this.status = 'lose';
            playArcadeSfx('wawawawaa', this.muted);
          }
          break;
        }
        case 'start_countdown':
          this.countdown = Math.max(5, Number(p.seconds ?? 45));
          break;
        case 'set_win_score':
          this.winTarget = Math.max(10, Number(p.target ?? 100));
          break;
        case 'play_sound':
          playArcadeSfx(String(p.sound || 'ba_ding'), this.muted);
          break;
        case 'splash':
          this.splashText = String(p.text || 'MULAI!');
          this.status = 'splash';
          break;
        case 'game_over':
          this.status = p.win === false ? 'lose' : 'win';
          playArcadeSfx(this.status === 'win' ? 'power_up' : 'wawawawaa', this.muted);
          break;
        case 'if_score_gte_win': {
          const target = Number(p.target ?? 100);
          this.winTarget = target;
          if (this.score >= target) {
            this.status = 'win';
            playArcadeSfx('power_up', this.muted);
            if (this.player) this.spawnParticles(this.player.x, this.player.y, 'confetti');
          }
          break;
        }
        case 'if_color_match_score': {
          const pts = Number(p.points ?? 20);
          const pen = Number(p.penalty ?? -1);
          const matched =
            this.player &&
            otherSprite &&
            this.player.chromaIndex !== undefined &&
            otherSprite.chromaIndex === this.player.chromaIndex;
          if (matched) {
            this.score += pts;
            playArcadeSfx('ba_ding', this.muted);
            if (otherSprite) this.spawnParticles(otherSprite.x, otherSprite.y, 'confetti');
            if (this.winTarget !== null && this.score >= this.winTarget) {
              this.status = 'win';
              playArcadeSfx('power_up', this.muted);
            }
          } else {
            if (this.invulnTimer <= 0) {
              this.life += pen;
              this.invulnTimer = 0.7;
              this.shakeTimer = 0.2;
              playArcadeSfx('zapped', this.muted);
              if (this.life <= 0) {
                this.life = 0;
                this.status = 'lose';
                playArcadeSfx('wawawawaa', this.muted);
              }
            }
          }
          break;
        }
        case 'set_speed_var':
          this.speedVar = Math.max(10, Number(p.speed ?? 45));
          break;
        case 'change_speed_var':
          this.speedVar = Math.max(10, Math.min(130, this.speedVar + Number(p.delta ?? 5)));
          break;
        case 'repeat_spawn': {
          const count = Math.max(1, Math.min(8, Number(p.count ?? 3)));
          for (let k = 0; k < count; k++) {
            this.spawnOneSprite(
              (p.kind as SpriteKind) || 'Food',
              String(p.spriteId || 'star'),
              Math.max(24, this.speedVar * 0.8),
              'wander'
            );
          }
          break;
        }
      }
    }
  }

  public step(dtRaw: number, input: ArcadeInputState) {
    const dt = Math.min(0.05, Math.max(0.001, dtRaw));
    this.fps = Math.round(1 / dt);
    this.elapsed += dt;

    // Background animation runs even on splash/end
    for (const bp of this.bgParticles) {
      if (this.bgEffect === 'bubbles') {
        bp.y -= bp.speed * dt;
        bp.x += Math.sin(this.elapsed * 2 + bp.y * 0.1) * 8 * dt;
        if (bp.y < -3) {
          bp.y = ARCADE_HEIGHT + 3;
          bp.x = Math.random() * ARCADE_WIDTH;
        }
      } else {
        bp.y += bp.speed * dt;
        if (this.bgEffect === 'snow') {
          bp.x += Math.sin(this.elapsed * 2 + bp.y * 0.08) * 10 * dt;
        }
        if (bp.y > ARCADE_HEIGHT + 3) {
          bp.y = -3;
          bp.x = Math.random() * ARCADE_WIDTH;
        }
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    const aJustPressed = input.a && !this.prevA;
    const bJustPressed = input.b && !this.prevB;
    this.prevA = input.a;
    this.prevB = input.b;

    if (input.up || input.down || input.left || input.right || aJustPressed || bJustPressed) {
      this.hasPlayed = true;
    }

    if (this.status === 'splash') {
      if (aJustPressed || bJustPressed) {
        this.dismissSplash();
      }
      return;
    }

    if (this.status === 'win' || this.status === 'lose') {
      if (aJustPressed) {
        this.reset();
      }
      return;
    }

    // Active timers
    if (this.sayTimer > 0) this.sayTimer -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    if (this.dashTimer > 0) this.dashTimer -= dt;

    if (this.countdown !== null) {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.countdown = 0;
        const won = this.winTarget !== null ? this.score >= this.winTarget : this.score > 0;
        this.status = won ? 'win' : 'lose';
        playArcadeSfx(won ? 'power_up' : 'wawawawaa', this.muted);
        return;
      }
    }

    // Player movement
    if (this.player) {
      let dx = 0;
      let dy = 0;
      if (input.left) dx -= 1;
      if (input.right) dx += 1;
      if (input.up) dy -= 1;
      if (input.down) dy += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        this.lastDirX = dx;
        this.lastDirY = dy;
      }

      const vx = this.dashTimer > 0 ? this.dashVx : dx * this.moveVx;
      const vy = this.dashTimer > 0 ? this.dashVy : dy * this.moveVy;

      this.player.x += vx * dt;
      this.player.y += vy * dt;

      if (this.stayInScreen) {
        this.player.x = Math.max(8, Math.min(ARCADE_WIDTH - 8, this.player.x));
        this.player.y = Math.max(16, Math.min(ARCADE_HEIGHT - 8, this.player.y));
      }
    }

    // Button events
    if (aJustPressed) {
      this.program.containers
        .filter((c) => c.eventType === 'on_button' && String(c.params.button).toUpperCase() === 'A')
        .forEach((c) => this.executeStatements(c.blocks, this.player, null));
    }
    if (bJustPressed) {
      this.program.containers
        .filter((c) => c.eventType === 'on_button' && String(c.params.button).toUpperCase() === 'B')
        .forEach((c) => this.executeStatements(c.blocks, this.player, null));
    }

    // Interval events
    const intervals = this.program.containers.filter((c) => c.eventType === 'on_update_interval');
    intervals.forEach((container, idx) => {
      const periodSec = Math.max(0.2, Number(container.params.ms ?? 1000) / 1000);
      this.intervalTimers[idx] = (this.intervalTimers[idx] ?? 0) - dt;
      if (this.intervalTimers[idx] <= 0) {
        this.intervalTimers[idx] = periodSec;
        this.executeStatements(container.blocks, this.player, null);
      }
    });

    // Update non-player sprites
    for (const sp of this.sprites) {
      if (!sp.alive) continue;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;

      if (sp.wanderTimer !== undefined) {
        // Bounce inside screen for wandering sprites
        if (sp.x < 9 || sp.x > ARCADE_WIDTH - 9) {
          sp.vx *= -1;
          sp.x = Math.max(9, Math.min(ARCADE_WIDTH - 9, sp.x));
        }
        if (sp.y < 18 || sp.y > ARCADE_HEIGHT - 9) {
          sp.vy *= -1;
          sp.y = Math.max(18, Math.min(ARCADE_HEIGHT - 9, sp.y));
        }
      } else {
        // Cull sprites off screen
        if (sp.x < -20 || sp.x > ARCADE_WIDTH + 20 || sp.y < -20 || sp.y > ARCADE_HEIGHT + 20) {
          sp.alive = false;
        }
      }
    }

    // Overlap checks
    const overlapContainers = this.program.containers.filter((c) => c.eventType === 'on_overlap');
    for (const container of overlapContainers) {
      const kindA = (container.params.kindA as SpriteKind) || 'Player';
      const kindB = (container.params.kindB as SpriteKind) || 'Food';

      const listA: RuntimeSprite[] =
        kindA === 'Player'
          ? this.player
            ? [this.player]
            : []
          : this.sprites.filter((s) => s.alive && s.kind === kindA);

      const listB: RuntimeSprite[] =
        kindB === 'Player'
          ? this.player
            ? [this.player]
            : []
          : this.sprites.filter((s) => s.alive && s.kind === kindB);

      for (const a of listA) {
        if (!a.alive) continue;
        for (const b of listB) {
          if (!b.alive || a.id === b.id) continue;
          const overlapX = Math.abs(a.x - b.x) < (a.width + b.width) * 0.45;
          const overlapY = Math.abs(a.y - b.y) < (a.height + b.height) * 0.45;
          if (overlapX && overlapY) {
            this.executeStatements(container.blocks, a, b);
          }
        }
      }
    }

    this.sprites = this.sprites.filter((s) => s.alive);
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Screen shake offset
    if (this.shakeTimer > 0) {
      const ox = Math.round((Math.random() - 0.5) * 4);
      const oy = Math.round((Math.random() - 0.5) * 4);
      ctx.translate(ox, oy);
    }

    // Background fill
    ctx.fillStyle = this.bgHex;
    ctx.fillRect(0, 0, ARCADE_WIDTH, ARCADE_HEIGHT);

    // Optional Grid background
    if (this.bgEffect === 'grid') {
      ctx.strokeStyle = 'rgba(135, 242, 255, 0.14)';
      ctx.lineWidth = 1;
      for (let x = 0; x < ARCADE_WIDTH; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, ARCADE_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < ARCADE_HEIGHT; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(ARCADE_WIDTH, y + 0.5);
        ctx.stroke();
      }
    }

    // Background stars / snow / bubbles
    for (const bp of this.bgParticles) {
      ctx.fillStyle = bp.color;
      ctx.fillRect(Math.round(bp.x), Math.round(bp.y), bp.size, bp.size);
    }

    // Non-player sprites
    for (const sp of this.sprites) {
      const tint =
        sp.chromaIndex !== undefined ? CHROMA_CHANNELS[sp.chromaIndex]?.hex : undefined;
      if (tint) {
        ctx.strokeStyle = tint;
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(sp.x - 8), Math.round(sp.y - 8), 16, 16);
      }
      const grid = getSpritePixels(sp.spriteId, this.customSprites);
      drawPixelSprite(ctx, grid, sp.x, sp.y, 1, tint);

      if (this.showDebug) {
        ctx.strokeStyle = sp.kind === 'Enemy' ? '#ff2121' : sp.kind === 'Food' ? '#78dc52' : '#87f2ff';
        ctx.strokeRect(
          Math.round(sp.x - sp.width / 2),
          Math.round(sp.y - sp.height / 2),
          sp.width,
          sp.height
        );
      }
    }

    // Player sprite
    if (this.player) {
      const blinkHide = this.invulnTimer > 0 && Math.floor(this.invulnTimer * 18) % 2 === 0;
      if (!blinkHide) {
        const tint =
          this.player.chromaIndex !== undefined
            ? CHROMA_CHANNELS[this.player.chromaIndex]?.hex
            : undefined;
        if (tint) {
          ctx.strokeStyle = tint;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(Math.round(this.player.x), Math.round(this.player.y), 10, 0, Math.PI * 2);
          ctx.stroke();
        }
        const grid = getSpritePixels(this.player.spriteId, this.customSprites);
        drawPixelSprite(ctx, grid, this.player.x, this.player.y, 1, tint);
      }

      if (this.showDebug) {
        ctx.strokeStyle = '#fff609';
        ctx.strokeRect(
          Math.round(this.player.x - this.player.width / 2),
          Math.round(this.player.y - this.player.height / 2),
          this.player.width,
          this.player.height
        );
      }

      // Speech bubble
      if (this.sayTimer > 0 && this.sayText) {
        ctx.font = 'bold 7px monospace';
        const tw = Math.min(110, ctx.measureText(this.sayText).width + 8);
        const bx = Math.max(4, Math.min(ARCADE_WIDTH - tw - 4, Math.round(this.player.x - tw / 2)));
        const by = Math.max(14, Math.round(this.player.y - 22));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, by, tw, 11);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, tw - 1, 10);
        ctx.fillStyle = '#000000';
        ctx.fillText(this.sayText.slice(0, 18), bx + 4, by + 8);
      }
    }

    // Particles
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }

    // ==================== AUTHENTIC MAKECODE ARCADE HUD ====================
    // Top-left red pixel hearts
    const displayLives = Math.min(5, Math.max(0, this.life));
    for (let i = 0; i < displayLives; i++) {
      const hx = 4 + i * 9;
      const hy = 4;
      ctx.fillStyle = '#ff2121';
      ctx.fillRect(hx + 1, hy, 2, 1);
      ctx.fillRect(hx + 4, hy, 2, 1);
      ctx.fillRect(hx, hy + 1, 7, 2);
      ctx.fillRect(hx + 1, hy + 3, 5, 1);
      ctx.fillRect(hx + 2, hy + 4, 3, 1);
      ctx.fillRect(hx + 3, hy + 5, 1, 1);
      ctx.fillStyle = '#ff93c4';
      ctx.fillRect(hx + 1, hy + 1, 1, 1);
    }

    // Top-center countdown timer
    if (this.countdown !== null) {
      const sec = Math.max(0, Math.ceil(this.countdown));
      const label = `${sec}s`;
      ctx.fillStyle = '#000000';
      ctx.fillRect(67, 2, 26, 10);
      ctx.strokeStyle = sec <= 10 ? '#ff2121' : '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(67.5, 2.5, 25, 9);
      ctx.fillStyle = sec <= 10 ? '#ff2121' : '#ffffff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, 80, 9.5);
      ctx.textAlign = 'left';
    }

    // Top-right yellow score badge (MakeCode classic)
    const scoreStr = this.winTarget ? `${this.score}/${this.winTarget}` : `${this.score}`;
    ctx.font = 'bold 7px monospace';
    const sw = Math.max(22, ctx.measureText(scoreStr).width + 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ARCADE_WIDTH - sw - 3, 2, sw, 10);
    ctx.strokeStyle = '#ff8135';
    ctx.lineWidth = 1;
    ctx.strokeRect(ARCADE_WIDTH - sw - 2.5, 2.5, sw - 1, 9);
    ctx.fillStyle = '#fff609';
    ctx.fillText(scoreStr, ARCADE_WIDTH - sw + 1, 9.5);

    // Bottom-left chroma indicator when chroma mode is active
    if (this.chromaEnabled && this.player && this.player.chromaIndex !== undefined) {
      const ch = CHROMA_CHANNELS[this.player.chromaIndex];
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(3, ARCADE_HEIGHT - 12, 56, 10);
      ctx.fillStyle = ch.hex;
      ctx.fillRect(5, ARCADE_HEIGHT - 10, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px monospace';
      ctx.fillText(`B:${ch.name}`, 14, ARCADE_HEIGHT - 5);
    }

    // Debug overlay
    if (this.showDebug) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(2, ARCADE_HEIGHT - 11, 78, 9);
      ctx.fillStyle = '#78dc52';
      ctx.font = '6px monospace';
      ctx.fillText(`FPS:${this.fps} SPR:${this.sprites.length + (this.player ? 1 : 0)}`, 4, ARCADE_HEIGHT - 4);
    }

    // Splash / Win / Lose overlays
    if (this.status === 'splash') {
      ctx.fillStyle = 'rgba(0,0,0,0.68)';
      ctx.fillRect(0, 0, ARCADE_WIDTH, ARCADE_HEIGHT);
      ctx.fillStyle = '#249ca3';
      ctx.fillRect(14, 38, ARCADE_WIDTH - 28, 42);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 38, ARCADE_WIDTH - 28, 42);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.splashText.slice(0, 20), ARCADE_WIDTH / 2, 56);
      ctx.fillStyle = '#fff609';
      ctx.font = '6px monospace';
      ctx.fillText('TEKAN [A] / SPASI', ARCADE_WIDTH / 2, 70);
      ctx.textAlign = 'left';
    } else if (this.status === 'win' || this.status === 'lose') {
      ctx.fillStyle = 'rgba(0,0,0,0.76)';
      ctx.fillRect(0, 0, ARCADE_WIDTH, ARCADE_HEIGHT);
      const isWin = this.status === 'win';
      ctx.fillStyle = isWin ? '#166534' : '#7f1d1d';
      ctx.fillRect(16, 28, ARCADE_WIDTH - 32, 62);
      ctx.strokeStyle = isWin ? '#fff609' : '#ff93c4';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 28, ARCADE_WIDTH - 32, 62);
      ctx.textAlign = 'center';
      ctx.fillStyle = isWin ? '#fff609' : '#ff93c4';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(isWin ? 'YOU WIN!' : 'GAME OVER', ARCADE_WIDTH / 2, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px monospace';
      ctx.fillText(`SCORE: ${this.score}`, ARCADE_WIDTH / 2, 63);
      ctx.fillStyle = '#87f2ff';
      ctx.font = '6px monospace';
      ctx.fillText('TEKAN [A] MAIN LAGI', ARCADE_WIDTH / 2, 79);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }
}
