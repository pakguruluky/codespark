// Complete MakeCode for micro:bit Engine:
// - 5x5 LED Matrix icons & 5x5 bitmap font renderer
// - Block AST + bidirectional JavaScript & Python compiler/parser (zero eval!)
// - Web Audio piezo buzzer melody & tone synthesizer
// - Real-time micro:bit v2 hardware simulation (buttons, logo, shake, pins, temp, light, radio)

export type MicrobitCategoryId =
  | 'basic'
  | 'input'
  | 'music'
  | 'led'
  | 'radio'
  | 'loops'
  | 'logic'
  | 'variables'
  | 'math';

export type MicrobitIconName =
  | 'Heart'
  | 'SmallHeart'
  | 'Yes'
  | 'No'
  | 'Happy'
  | 'Sad'
  | 'Diamond'
  | 'Square'
  | 'Duck'
  | 'EighthNote'
  | 'Skull'
  | 'Umbrella'
  | 'Target'
  | 'ArrowNorth'
  | 'ArrowEast'
  | 'ArrowSouth'
  | 'ArrowWest';

export type MicrobitMelodyName =
  | 'ba_ding'
  | 'power_up'
  | 'jump_up'
  | 'birthday'
  | 'entertainer'
  | 'ode'
  | 'wawawawaa';

export type MicrobitEventType =
  | 'on_start'
  | 'forever'
  | 'on_button'
  | 'on_shake'
  | 'on_logo'
  | 'on_pin'
  | 'on_radio_received';

export interface MicrobitStmtBlock {
  id: string;
  type:
    | 'show_number'
    | 'show_leds'
    | 'show_icon'
    | 'show_string'
    | 'clear_screen'
    | 'pause'
    | 'show_temperature'
    | 'show_light_level'
    | 'play_melody'
    | 'play_tone'
    | 'plot_xy'
    | 'unplot_xy'
    | 'toggle_xy'
    | 'plot_bar_graph'
    | 'set_brightness'
    | 'radio_set_group'
    | 'radio_send_string'
    | 'radio_send_number'
    | 'set_var'
    | 'change_var'
    | 'show_var'
    | 'set_var_random'
    | 'if_sensor_action'
    | 'repeat_beep';
  params: Record<string, string | number | boolean>;
}

export interface MicrobitEventContainer {
  id: string;
  eventType: MicrobitEventType;
  params: Record<string, string | number | boolean>;
  blocks: MicrobitStmtBlock[];
}

export interface MicrobitProgram {
  containers: MicrobitEventContainer[];
}

export interface MicrobitCategoryDef {
  id: MicrobitCategoryId;
  label: string;
  color: string;
}

export const MICROBIT_CATEGORIES: MicrobitCategoryDef[] = [
  { id: 'basic', label: 'Basic', color: '#1E90FF' },
  { id: 'input', label: 'Input', color: '#D400D4' },
  { id: 'music', label: 'Music', color: '#E63022' },
  { id: 'led', label: 'LED', color: '#5C2D91' },
  { id: 'radio', label: 'Radio', color: '#E3008C' },
  { id: 'loops', label: 'Loops', color: '#107C10' },
  { id: 'logic', label: 'Logic', color: '#00A4A6' },
  { id: 'variables', label: 'Variables', color: '#DC143C' },
  { id: 'math', label: 'Math', color: '#9400D3' },
];

export const MICROBIT_ICONS: Record<MicrobitIconName, string[]> = {
  Heart: ['01010', '11111', '11111', '01110', '00100'],
  SmallHeart: ['00000', '01010', '01110', '00100', '00000'],
  Yes: ['00000', '00001', '00010', '10100', '01000'],
  No: ['10001', '01010', '00100', '01010', '10001'],
  Happy: ['00000', '01010', '00000', '10001', '01110'],
  Sad: ['00000', '01010', '00000', '01110', '10001'],
  Diamond: ['00100', '01010', '10001', '01010', '00100'],
  Square: ['11111', '10001', '10001', '10001', '11111'],
  Duck: ['01100', '11100', '01111', '01110', '00000'],
  EighthNote: ['00100', '00110', '00101', '11100', '11100'],
  Skull: ['01110', '10101', '11111', '01110', '01110'],
  Umbrella: ['01110', '11111', '00100', '10100', '01100'],
  Target: ['00100', '01110', '11011', '01110', '00100'],
  ArrowNorth: ['00100', '01110', '10101', '00100', '00100'],
  ArrowEast: ['00100', '00010', '11111', '00010', '00100'],
  ArrowSouth: ['00100', '00100', '10101', '01110', '00100'],
  ArrowWest: ['00100', '01000', '11111', '01000', '00100'],
};

export const MICROBIT_ICON_LIST: MicrobitIconName[] = Object.keys(
  MICROBIT_ICONS
) as MicrobitIconName[];

// Compact 5x5 bitmap font for crisp LED scrolling strings & numbers
const LED_FONT: Record<string, string[]> = {
  '0': ['01110', '10011', '10101', '11001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00110', '01000', '11111'],
  '3': ['11110', '00001', '01110', '00001', '11110'],
  '4': ['10010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '11110'],
  '6': ['01110', '10000', '11110', '10001', '01110'],
  '7': ['11111', '00010', '00100', '01000', '01000'],
  '8': ['01110', '10001', '01110', '10001', '01110'],
  '9': ['01110', '10001', '01111', '00001', '01110'],
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01111', '10000', '10111', '10001', '01110'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  '!': ['00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00110', '00000', '00100'],
  '-': ['00000', '00000', '11110', '00000', '00000'],
  '+': ['00000', '00100', '01110', '00100', '00000'],
  ':': ['00000', '00100', '00000', '00100', '00000'],
  '°': ['01100', '01100', '00000', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000'],
};

export function createEmptyLedMatrix(): number[][] {
  return Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]);
}

export function patternToLedMatrix(pattern: string[], brightness = 255): number[][] {
  return Array.from({ length: 5 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => (pattern[y]?.[x] === '1' || pattern[y]?.[x] === '#' ? brightness : 0))
  );
}

export function stringToScrollColumns(text: string): number[][] {
  const upper = text.toUpperCase();
  const cols: number[][] = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  for (const ch of upper) {
    const glyph = LED_FONT[ch] || LED_FONT[' '];
    for (let x = 0; x < 5; x++) {
      const col = [0, 0, 0, 0, 0];
      for (let y = 0; y < 5; y++) {
        col[y] = glyph[y][x] === '1' ? 1 : 0;
      }
      cols.push(col);
    }
    cols.push([0, 0, 0, 0, 0]);
  }
  cols.push([0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
  return cols;
}

export function buildBarGraphMatrix(value: number, max: number, brightness = 255): number[][] {
  const safeMax = Math.max(1, max);
  const ratio = Math.max(0, Math.min(1, value / safeMax));
  const litRows = Math.round(ratio * 5);
  const mat = createEmptyLedMatrix();
  for (let r = 0; r < litRows; r++) {
    const y = 4 - r;
    const width = r === litRows - 1 && ratio < 0.95 ? Math.max(1, Math.round(((ratio * 5) % 1 || 1) * 5)) : 5;
    const startX = Math.floor((5 - width) / 2);
    for (let x = startX; x < startX + width; x++) {
      mat[y][x] = brightness;
    }
  }
  return mat;
}

export function makeMbId(prefix = 'mb'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getMicrobitCategoryColor(cat: MicrobitCategoryId): string {
  return MICROBIT_CATEGORIES.find((c) => c.id === cat)?.color || '#1E90FF';
}

export function getMicrobitEventColor(ev: MicrobitEventType): string {
  switch (ev) {
    case 'on_start':
    case 'forever':
      return '#1E90FF';
    case 'on_button':
    case 'on_shake':
    case 'on_logo':
    case 'on_pin':
      return '#D400D4';
    case 'on_radio_received':
      return '#E3008C';
  }
}

export function getMicrobitStmtCategory(type: MicrobitStmtBlock['type']): MicrobitCategoryId {
  switch (type) {
    case 'show_number':
    case 'show_leds':
    case 'show_icon':
    case 'show_string':
    case 'clear_screen':
    case 'pause':
      return 'basic';
    case 'show_temperature':
    case 'show_light_level':
      return 'input';
    case 'play_melody':
    case 'play_tone':
      return 'music';
    case 'plot_xy':
    case 'unplot_xy':
    case 'toggle_xy':
    case 'plot_bar_graph':
    case 'set_brightness':
      return 'led';
    case 'radio_set_group':
    case 'radio_send_string':
    case 'radio_send_number':
      return 'radio';
    case 'repeat_beep':
      return 'loops';
    case 'if_sensor_action':
      return 'logic';
    case 'set_var':
    case 'change_var':
    case 'show_var':
      return 'variables';
    case 'set_var_random':
      return 'math';
  }
}

export interface MicrobitFlyoutTemplate {
  id: string;
  category: MicrobitCategoryId;
  kind: 'event' | 'statement';
  label: string;
  description: string;
  eventTemplate?: Omit<MicrobitEventContainer, 'id'>;
  stmtTemplate?: Omit<MicrobitStmtBlock, 'id'>;
}

export const MICROBIT_FLYOUT_TEMPLATES: MicrobitFlyoutTemplate[] = [
  // BASIC
  {
    id: 'mb_show_number',
    category: 'basic',
    kind: 'statement',
    label: 'show number [0]',
    description: 'Menampilkan angka pada layar matriks LED 5×5',
    stmtTemplate: { type: 'show_number', params: { value: 7 } },
  },
  {
    id: 'mb_show_leds',
    category: 'basic',
    kind: 'statement',
    label: 'show leds [5×5 Grid]',
    description: 'Melukis pola lampu LED 5×5 secara manual',
    stmtTemplate: {
      type: 'show_leds',
      params: { grid: '01010|11111|11111|01110|00100' },
    },
  },
  {
    id: 'mb_show_icon',
    category: 'basic',
    kind: 'statement',
    label: 'show icon [Heart]',
    description: 'Menampilkan ikon siap pakai (Heart, Happy, Duck, dll.)',
    stmtTemplate: { type: 'show_icon', params: { icon: 'Heart' } },
  },
  {
    id: 'mb_show_string',
    category: 'basic',
    kind: 'statement',
    label: 'show string ["Halo!"]',
    description: 'Menggulirkan teks berjalan di layar LED 5×5',
    stmtTemplate: { type: 'show_string', params: { text: 'HALO!' } },
  },
  {
    id: 'mb_clear_screen',
    category: 'basic',
    kind: 'statement',
    label: 'clear screen',
    description: 'Mematikan seluruh 25 lampu LED micro:bit',
    stmtTemplate: { type: 'clear_screen', params: {} },
  },
  {
    id: 'mb_pause',
    category: 'basic',
    kind: 'statement',
    label: 'pause (ms) [500]',
    description: 'Menunda eksekusi blok berikutnya (milidetik)',
    stmtTemplate: { type: 'pause', params: { ms: 500 } },
  },
  {
    id: 'mb_ev_forever',
    category: 'basic',
    kind: 'event',
    label: 'forever',
    description: 'Mengulang perintah di dalamnya secara terus-menerus',
    eventTemplate: { eventType: 'forever', params: {}, blocks: [] },
  },

  // INPUT
  {
    id: 'mb_ev_btn_a',
    category: 'input',
    kind: 'event',
    label: 'on button [A] pressed',
    description: 'Dijalankan setiap tombol fisik A ditekan',
    eventTemplate: { eventType: 'on_button', params: { button: 'A' }, blocks: [] },
  },
  {
    id: 'mb_ev_btn_b',
    category: 'input',
    kind: 'event',
    label: 'on button [B] pressed',
    description: 'Dijalankan setiap tombol fisik B ditekan',
    eventTemplate: { eventType: 'on_button', params: { button: 'B' }, blocks: [] },
  },
  {
    id: 'mb_ev_shake',
    category: 'input',
    kind: 'event',
    label: 'on [shake]',
    description: 'Dijalankan saat papan micro:bit digoyangkan (akselerometer)',
    eventTemplate: { eventType: 'on_shake', params: {}, blocks: [] },
  },
  {
    id: 'mb_ev_logo',
    category: 'input',
    kind: 'event',
    label: 'on logo [pressed]',
    description: 'Dijalankan saat logo emas micro:bit v2 disentuh',
    eventTemplate: { eventType: 'on_logo', params: {}, blocks: [] },
  },
  {
    id: 'mb_ev_pin',
    category: 'input',
    kind: 'event',
    label: 'on pin [P0] pressed',
    description: 'Dijalankan saat pin konektor emas 0, 1, atau 2 disentuh',
    eventTemplate: { eventType: 'on_pin', params: { pin: 'P0' }, blocks: [] },
  },
  {
    id: 'mb_show_temp',
    category: 'input',
    kind: 'statement',
    label: 'show number [temperature (°C)]',
    description: 'Membaca sensor suhu lalu menampilkannya di LED',
    stmtTemplate: { type: 'show_temperature', params: {} },
  },
  {
    id: 'mb_show_light',
    category: 'input',
    kind: 'statement',
    label: 'show number [light level]',
    description: 'Membaca sensor cahaya (0–255) ke layar LED',
    stmtTemplate: { type: 'show_light_level', params: {} },
  },

  // MUSIC
  {
    id: 'mb_play_melody',
    category: 'music',
    kind: 'statement',
    label: 'start melody [ba_ding]',
    description: 'Memainkan melodi pada speaker piezo micro:bit v2',
    stmtTemplate: { type: 'play_melody', params: { melody: 'ba_ding' } },
  },
  {
    id: 'mb_play_tone',
    category: 'music',
    kind: 'statement',
    label: 'play tone [Middle C (262Hz)] for [300] ms',
    description: 'Memainkan satu nada musik tertentu',
    stmtTemplate: { type: 'play_tone', params: { freq: 262, ms: 300 } },
  },

  // LED
  {
    id: 'mb_plot_xy',
    category: 'led',
    kind: 'statement',
    label: 'plot x [2] y [2]',
    description: 'Menyalakan 1 titik LED pada koordinat (x, y)',
    stmtTemplate: { type: 'plot_xy', params: { x: 2, y: 2 } },
  },
  {
    id: 'mb_unplot_xy',
    category: 'led',
    kind: 'statement',
    label: 'unplot x [2] y [2]',
    description: 'Mematikan 1 titik LED pada koordinat (x, y)',
    stmtTemplate: { type: 'unplot_xy', params: { x: 2, y: 2 } },
  },
  {
    id: 'mb_toggle_xy',
    category: 'led',
    kind: 'statement',
    label: 'toggle x [2] y [2]',
    description: 'Membalik status nyala/mati LED pada (x, y)',
    stmtTemplate: { type: 'toggle_xy', params: { x: 2, y: 2 } },
  },
  {
    id: 'mb_bar_graph',
    category: 'led',
    kind: 'statement',
    label: 'plot bar graph of [lightLevel] up to [255]',
    description: 'Menampilkan grafik batang LED dari nilai sensor',
    stmtTemplate: { type: 'plot_bar_graph', params: { source: 'lightLevel', max: 255 } },
  },
  {
    id: 'mb_brightness',
    category: 'led',
    kind: 'statement',
    label: 'set brightness [255]',
    description: 'Mengatur tingkat kecerahan lampu LED (40–255)',
    stmtTemplate: { type: 'set_brightness', params: { value: 255 } },
  },

  // RADIO
  {
    id: 'mb_radio_group',
    category: 'radio',
    kind: 'statement',
    label: 'radio set group [7]',
    description: 'Mengatur nomor kanal komunikasi radio nirkabel',
    stmtTemplate: { type: 'radio_set_group', params: { group: 7 } },
  },
  {
    id: 'mb_radio_send_str',
    category: 'radio',
    kind: 'statement',
    label: 'radio send string ["CERAH"]',
    description: 'Mengirim pesan teks lewat sinyal radio micro:bit',
    stmtTemplate: { type: 'radio_send_string', params: { text: 'CERAH' } },
  },
  {
    id: 'mb_radio_send_num',
    category: 'radio',
    kind: 'statement',
    label: 'radio send number [temperature]',
    description: 'Mengirim nilai angka/sensor via radio',
    stmtTemplate: { type: 'radio_send_number', params: { source: 'temperature' } },
  },
  {
    id: 'mb_ev_radio',
    category: 'radio',
    kind: 'event',
    label: 'on radio received',
    description: 'Dijalankan saat menerima paket data radio',
    eventTemplate: { eventType: 'on_radio_received', params: {}, blocks: [] },
  },

  // LOOPS
  {
    id: 'mb_repeat_beep',
    category: 'loops',
    kind: 'statement',
    label: 'repeat [3] times: blink [Heart] + beep',
    description: 'Perulangan kedip LED ikon dan bunyi beep N kali',
    stmtTemplate: { type: 'repeat_beep', params: { count: 3, icon: 'Heart' } },
  },

  // LOGIC
  {
    id: 'mb_if_sensor',
    category: 'logic',
    kind: 'statement',
    label: 'if [temperature] [>] [30] then show [Skull] + [wawawawaa]',
    description: 'Kondisi if memeriksa suhu, cahaya, atau variabel',
    stmtTemplate: {
      type: 'if_sensor_action',
      params: { source: 'temperature', op: '>', threshold: 30, icon: 'Skull', melody: 'wawawawaa' },
    },
  },

  // VARIABLES
  {
    id: 'mb_set_var',
    category: 'variables',
    kind: 'statement',
    label: 'set [counter] to [0]',
    description: 'Mengatur nilai awal variabel (counter / dice)',
    stmtTemplate: { type: 'set_var', params: { name: 'counter', value: 0 } },
  },
  {
    id: 'mb_change_var',
    category: 'variables',
    kind: 'statement',
    label: 'change [counter] by [1]',
    description: 'Menambah atau mengurangi nilai variabel',
    stmtTemplate: { type: 'change_var', params: { name: 'counter', delta: 1 } },
  },
  {
    id: 'mb_show_var',
    category: 'variables',
    kind: 'statement',
    label: 'show number [counter]',
    description: 'Menampilkan isi variabel pada matriks LED',
    stmtTemplate: { type: 'show_var', params: { name: 'counter' } },
  },

  // MATH
  {
    id: 'mb_random',
    category: 'math',
    kind: 'statement',
    label: 'set [dice] to pick random [1] to [6]',
    description: 'Mengacak angka bulat (cocok untuk Dadu Digital!)',
    stmtTemplate: { type: 'set_var_random', params: { name: 'dice', min: 1, max: 6 } },
  },
];

// ==================== PIEZO BUZZER AUDIO SYNTHESIZER ====================

let mbAudioCtx: AudioContext | null = null;

function getMbAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!mbAudioCtx) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtor) mbAudioCtx = new AudioCtor();
  }
  if (mbAudioCtx && mbAudioCtx.state === 'suspended') {
    mbAudioCtx.resume().catch(() => {});
  }
  return mbAudioCtx;
}

export function playMicrobitTone(freq: number, ms: number, muted: boolean) {
  if (muted) return;
  const ctx = getMbAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const dur = Math.max(0.05, Math.min(1.5, ms / 1000));
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(Math.max(100, Math.min(2000, freq)), now);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.01);
}

const MELODIES: Record<MicrobitMelodyName, Array<[number, number]>> = {
  ba_ding: [
    [988, 100],
    [1319, 220],
  ],
  power_up: [
    [523, 90],
    [659, 90],
    [784, 90],
    [1047, 200],
  ],
  jump_up: [
    [330, 80],
    [440, 80],
    [587, 150],
  ],
  birthday: [
    [262, 140],
    [262, 110],
    [294, 220],
    [262, 220],
    [349, 220],
    [330, 320],
  ],
  entertainer: [
    [294, 110],
    [330, 110],
    [262, 110],
    [440, 200],
    [494, 150],
    [392, 240],
  ],
  ode: [
    [330, 160],
    [330, 160],
    [349, 160],
    [392, 160],
    [392, 160],
    [349, 160],
    [330, 160],
    [294, 240],
  ],
  wawawawaa: [
    [349, 160],
    [330, 160],
    [311, 160],
    [262, 320],
  ],
};

export function playMicrobitMelody(melody: MicrobitMelodyName | string, muted: boolean) {
  if (muted) return;
  const notes = MELODIES[melody as MicrobitMelodyName] || MELODIES.ba_ding;
  let delay = 0;
  notes.forEach(([freq, dur]) => {
    window.setTimeout(() => playMicrobitTone(freq, dur, false), delay);
    delay += dur + 20;
  });
}

// ==================== BLOCKS -> JAVASCRIPT & PYTHON ====================

function stmtToJs(blk: MicrobitStmtBlock, ind: string): string {
  const p = blk.params;
  switch (blk.type) {
    case 'show_number':
      return `${ind}basic.showNumber(${Number(p.value ?? 0)})`;
    case 'show_leds':
      return `${ind}basic.showLeds("${String(p.grid || '01010|11111|11111|01110|00100')}")`;
    case 'show_icon':
      return `${ind}basic.showIcon(IconNames.${p.icon || 'Heart'})`;
    case 'show_string':
      return `${ind}basic.showString("${String(p.text || 'HALO!').replace(/"/g, "'")}")`;
    case 'clear_screen':
      return `${ind}basic.clearScreen()`;
    case 'pause':
      return `${ind}basic.pause(${Number(p.ms ?? 500)})`;
    case 'show_temperature':
      return `${ind}basic.showNumber(input.temperature())`;
    case 'show_light_level':
      return `${ind}basic.showNumber(input.lightLevel())`;
    case 'play_melody':
      return `${ind}music.startMelody("${p.melody || 'ba_ding'}")`;
    case 'play_tone':
      return `${ind}music.playTone(${Number(p.freq ?? 262)}, ${Number(p.ms ?? 300)})`;
    case 'plot_xy':
      return `${ind}led.plot(${Number(p.x ?? 2)}, ${Number(p.y ?? 2)})`;
    case 'unplot_xy':
      return `${ind}led.unplot(${Number(p.x ?? 2)}, ${Number(p.y ?? 2)})`;
    case 'toggle_xy':
      return `${ind}led.toggle(${Number(p.x ?? 2)}, ${Number(p.y ?? 2)})`;
    case 'plot_bar_graph':
      return `${ind}led.plotBarGraph(${p.source || 'lightLevel'}, ${Number(p.max ?? 255)})`;
    case 'set_brightness':
      return `${ind}led.setBrightness(${Number(p.value ?? 255)})`;
    case 'radio_set_group':
      return `${ind}radio.setGroup(${Number(p.group ?? 7)})`;
    case 'radio_send_string':
      return `${ind}radio.sendString("${String(p.text || 'CERAH').replace(/"/g, "'")}")`;
    case 'radio_send_number':
      return `${ind}radio.sendNumber(${p.source || 'temperature'})`;
    case 'set_var':
      return `${ind}${p.name || 'counter'} = ${Number(p.value ?? 0)}`;
    case 'change_var':
      return `${ind}${p.name || 'counter'} += ${Number(p.delta ?? 1)}`;
    case 'show_var':
      return `${ind}basic.showNumber(${p.name || 'counter'})`;
    case 'set_var_random':
      return `${ind}${p.name || 'dice'} = randint(${Number(p.min ?? 1)}, ${Number(p.max ?? 6)})`;
    case 'if_sensor_action':
      return `${ind}if (${p.source || 'temperature'} ${p.op || '>'} ${Number(p.threshold ?? 30)}) { basic.showIcon(IconNames.${p.icon || 'Skull'}); music.startMelody("${p.melody || 'wawawawaa'}"); }`;
    case 'repeat_beep':
      return `${ind}for (let i = 0; i < ${Number(p.count ?? 3)}; i++) { basic.showIcon(IconNames.${p.icon || 'Heart'}); music.playTone(523, 120); }`;
  }
}

export function microbitProgramToJavaScript(prog: MicrobitProgram, title: string): string {
  const lines: string[] = [`// MakeCode micro:bit JavaScript — ${title}`, ''];

  const onStart = prog.containers.find((c) => c.eventType === 'on_start');
  if (onStart && onStart.blocks.length > 0) {
    lines.push('// on start');
    onStart.blocks.forEach((b) => lines.push(stmtToJs(b, '')));
    lines.push('');
  }

  prog.containers
    .filter((c) => c.eventType !== 'on_start')
    .forEach((c) => {
      if (c.eventType === 'forever') {
        lines.push('basic.forever(function () {');
        c.blocks.forEach((b) => lines.push(stmtToJs(b, '    ')));
        lines.push('})');
        lines.push('');
      } else if (c.eventType === 'on_button') {
        const btn = String(c.params.button || 'A');
        lines.push(`input.onButtonPressed(Button.${btn}, function () {`);
        c.blocks.forEach((b) => lines.push(stmtToJs(b, '    ')));
        lines.push('})');
        lines.push('');
      } else if (c.eventType === 'on_shake') {
        lines.push('input.onGesture(Gesture.Shake, function () {');
        c.blocks.forEach((b) => lines.push(stmtToJs(b, '    ')));
        lines.push('})');
        lines.push('');
      } else if (c.eventType === 'on_logo') {
        lines.push('input.onLogoEvent(TouchButtonEvent.Pressed, function () {');
        c.blocks.forEach((b) => lines.push(stmtToJs(b, '    ')));
        lines.push('})');
        lines.push('');
      } else if (c.eventType === 'on_pin') {
        const pin = String(c.params.pin || 'P0');
        lines.push(`input.onPinPressed(TouchPin.${pin}, function () {`);
        c.blocks.forEach((b) => lines.push(stmtToJs(b, '    ')));
        lines.push('})');
        lines.push('');
      } else if (c.eventType === 'on_radio_received') {
        lines.push('radio.onReceivedString(function (receivedString) {');
        c.blocks.forEach((b) => lines.push(stmtToJs(b, '    ')));
        lines.push('})');
        lines.push('');
      }
    });

  return lines.join('\n').trim() + '\n';
}

function stmtToPy(blk: MicrobitStmtBlock, ind: string): string {
  const p = blk.params;
  switch (blk.type) {
    case 'show_number':
      return `${ind}basic.show_number(${Number(p.value ?? 0)})`;
    case 'show_leds':
      return `${ind}basic.show_leds("${String(p.grid || '01010|11111|11111|01110|00100')}")`;
    case 'show_icon':
      return `${ind}basic.show_icon(IconNames.${String(p.icon || 'Heart').toUpperCase()})`;
    case 'show_string':
      return `${ind}basic.show_string("${String(p.text || 'HALO!').replace(/"/g, "'")}")`;
    case 'clear_screen':
      return `${ind}basic.clear_screen()`;
    case 'pause':
      return `${ind}basic.pause(${Number(p.ms ?? 500)})`;
    case 'show_temperature':
      return `${ind}basic.show_number(input.temperature())`;
    case 'show_light_level':
      return `${ind}basic.show_number(input.light_level())`;
    case 'play_melody':
      return `${ind}music.start_melody("${p.melody || 'ba_ding'}")`;
    case 'play_tone':
      return `${ind}music.play_tone(${Number(p.freq ?? 262)}, ${Number(p.ms ?? 300)})`;
    case 'plot_xy':
      return `${ind}led.plot(${Number(p.x ?? 2)}, ${Number(p.y ?? 2)})`;
    case 'unplot_xy':
      return `${ind}led.unplot(${Number(p.x ?? 2)}, ${Number(p.y ?? 2)})`;
    case 'toggle_xy':
      return `${ind}led.toggle(${Number(p.x ?? 2)}, ${Number(p.y ?? 2)})`;
    case 'plot_bar_graph':
      return `${ind}led.plot_bar_graph(${p.source || 'lightLevel'}, ${Number(p.max ?? 255)})`;
    case 'set_brightness':
      return `${ind}led.set_brightness(${Number(p.value ?? 255)})`;
    case 'radio_set_group':
      return `${ind}radio.set_group(${Number(p.group ?? 7)})`;
    case 'radio_send_string':
      return `${ind}radio.send_string("${String(p.text || 'CERAH').replace(/"/g, "'")}")`;
    case 'radio_send_number':
      return `${ind}radio.send_number(${p.source || 'temperature'})`;
    case 'set_var':
      return `${ind}${p.name || 'counter'} = ${Number(p.value ?? 0)}`;
    case 'change_var':
      return `${ind}${p.name || 'counter'} += ${Number(p.delta ?? 1)}`;
    case 'show_var':
      return `${ind}basic.show_number(${p.name || 'counter'})`;
    case 'set_var_random':
      return `${ind}${p.name || 'dice'} = randint(${Number(p.min ?? 1)}, ${Number(p.max ?? 6)})`;
    case 'if_sensor_action':
      return `${ind}if ${p.source || 'temperature'} ${p.op || '>'} ${Number(p.threshold ?? 30)}: basic.show_icon(IconNames.${String(p.icon || 'Skull').toUpperCase()}); music.start_melody("${p.melody || 'wawawawaa'}")`;
    case 'repeat_beep':
      return `${ind}for _ in range(${Number(p.count ?? 3)}): basic.show_icon(IconNames.${String(p.icon || 'Heart').toUpperCase()}); music.play_tone(523, 120)`;
  }
}

export function microbitProgramToPython(prog: MicrobitProgram, title: string): string {
  const lines: string[] = [`# MakeCode micro:bit Python — ${title}`, ''];

  const onStart = prog.containers.find((c) => c.eventType === 'on_start');
  if (onStart && onStart.blocks.length > 0) {
    lines.push('# on start');
    onStart.blocks.forEach((b) => lines.push(stmtToPy(b, '')));
    lines.push('');
  }

  let idx = 1;
  prog.containers
    .filter((c) => c.eventType !== 'on_start')
    .forEach((c) => {
      if (c.eventType === 'forever') {
        const fn = `on_forever_${idx++}`;
        lines.push(`def ${fn}():`);
        if (c.blocks.length === 0) lines.push('    pass');
        else c.blocks.forEach((b) => lines.push(stmtToPy(b, '    ')));
        lines.push(`basic.forever(${fn})`);
        lines.push('');
      } else if (c.eventType === 'on_button') {
        const btn = String(c.params.button || 'A');
        const fn = `on_button_${btn.toLowerCase()}_${idx++}`;
        lines.push(`def ${fn}():`);
        if (c.blocks.length === 0) lines.push('    pass');
        else c.blocks.forEach((b) => lines.push(stmtToPy(b, '    ')));
        lines.push(`input.on_button_pressed(Button.${btn}, ${fn})`);
        lines.push('');
      } else if (c.eventType === 'on_shake') {
        const fn = `on_shake_${idx++}`;
        lines.push(`def ${fn}():`);
        if (c.blocks.length === 0) lines.push('    pass');
        else c.blocks.forEach((b) => lines.push(stmtToPy(b, '    ')));
        lines.push(`input.on_gesture(Gesture.SHAKE, ${fn})`);
        lines.push('');
      } else if (c.eventType === 'on_logo') {
        const fn = `on_logo_${idx++}`;
        lines.push(`def ${fn}():`);
        if (c.blocks.length === 0) lines.push('    pass');
        else c.blocks.forEach((b) => lines.push(stmtToPy(b, '    ')));
        lines.push(`input.on_logo_event(TouchButtonEvent.PRESSED, ${fn})`);
        lines.push('');
      } else if (c.eventType === 'on_pin') {
        const pin = String(c.params.pin || 'P0');
        const fn = `on_pin_${pin.toLowerCase()}_${idx++}`;
        lines.push(`def ${fn}():`);
        if (c.blocks.length === 0) lines.push('    pass');
        else c.blocks.forEach((b) => lines.push(stmtToPy(b, '    ')));
        lines.push(`input.on_pin_pressed(TouchPin.${pin}, ${fn})`);
        lines.push('');
      } else if (c.eventType === 'on_radio_received') {
        const fn = `on_radio_${idx++}`;
        lines.push(`def ${fn}(receivedString):`);
        if (c.blocks.length === 0) lines.push('    pass');
        else c.blocks.forEach((b) => lines.push(stmtToPy(b, '    ')));
        lines.push(`radio.on_received_string(${fn})`);
        lines.push('');
      }
    });

  return lines.join('\n').trim() + '\n';
}

// ==================== SAFE ZERO-EVAL JS/PYTHON PARSER ====================

function normalizeIconName(raw: string): MicrobitIconName {
  const lower = raw.trim().toLowerCase();
  const match = MICROBIT_ICON_LIST.find((n) => n.toLowerCase() === lower);
  return match || 'Heart';
}

function parseMicrobitStatement(rawLine: string): { stmt: MicrobitStmtBlock | null; ok: boolean } {
  const line = rawLine.trim().replace(/;$/, '').trim();
  if (!line || line.startsWith('//') || line.startsWith('#') || line === 'pass') {
    return { stmt: null, ok: true };
  }

  let m: RegExpMatchArray | null;

  if (/^basic\.(showNumber|show_number)\(\s*input\.(temperature|TEMPERATURE)\(\)\s*\)$/.test(line)) {
    return { stmt: { id: makeMbId('tmp'), type: 'show_temperature', params: {} }, ok: true };
  }
  if (/^basic\.(showNumber|show_number)\(\s*input\.(lightLevel|light_level)\(\)\s*\)$/.test(line)) {
    return { stmt: { id: makeMbId('lgt'), type: 'show_light_level', params: {} }, ok: true };
  }

  m = line.match(/^basic\.(showNumber|show_number)\(\s*(-?\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('num'), type: 'show_number', params: { value: Number(m[2]) } },
      ok: true,
    };
  }

  m = line.match(/^basic\.(showNumber|show_number)\(\s*([a-zA-Z_]\w*)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('svar'), type: 'show_var', params: { name: m[2] } },
      ok: true,
    };
  }

  m = line.match(/^basic\.(showLeds|show_leds)\(\s*["']([01|#]+)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('leds'), type: 'show_leds', params: { grid: m[2] } },
      ok: true,
    };
  }

  m = line.match(/^basic\.(showIcon|show_icon)\(\s*IconNames\.(\w+)\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeMbId('ico'),
        type: 'show_icon',
        params: { icon: normalizeIconName(m[2]) },
      },
      ok: true,
    };
  }

  m = line.match(/^basic\.(showString|show_string)\(\s*["']([^"']*)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('str'), type: 'show_string', params: { text: m[2] } },
      ok: true,
    };
  }

  if (/^basic\.(clearScreen|clear_screen)\(\s*\)$/.test(line)) {
    return { stmt: { id: makeMbId('clr'), type: 'clear_screen', params: {} }, ok: true };
  }

  m = line.match(/^basic\.pause\(\s*(\d+)\s*\)$/);
  if (m) {
    return { stmt: { id: makeMbId('pau'), type: 'pause', params: { ms: Number(m[1]) } }, ok: true };
  }

  m = line.match(/^music\.(startMelody|start_melody)\(\s*["']([^"']+)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('mel'), type: 'play_melody', params: { melody: m[2] } },
      ok: true,
    };
  }

  m = line.match(/^music\.(playTone|play_tone)\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeMbId('ton'),
        type: 'play_tone',
        params: { freq: Number(m[2]), ms: Number(m[3]) },
      },
      ok: true,
    };
  }

  m = line.match(/^led\.(plot|unplot|toggle)\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (m) {
    const type = m[1] === 'plot' ? 'plot_xy' : m[1] === 'unplot' ? 'unplot_xy' : 'toggle_xy';
    return {
      stmt: { id: makeMbId('xy'), type, params: { x: Number(m[2]), y: Number(m[3]) } },
      ok: true,
    };
  }

  m = line.match(/^led\.(plotBarGraph|plot_bar_graph)\(\s*(\w+)\s*,\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeMbId('bar'),
        type: 'plot_bar_graph',
        params: { source: m[2], max: Number(m[3]) },
      },
      ok: true,
    };
  }

  m = line.match(/^led\.(setBrightness|set_brightness)\(\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('brt'), type: 'set_brightness', params: { value: Number(m[2]) } },
      ok: true,
    };
  }

  m = line.match(/^radio\.(setGroup|set_group)\(\s*(\d+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('rgr'), type: 'radio_set_group', params: { group: Number(m[2]) } },
      ok: true,
    };
  }

  m = line.match(/^radio\.(sendString|send_string)\(\s*["']([^"']*)["']\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('rss'), type: 'radio_send_string', params: { text: m[2] } },
      ok: true,
    };
  }

  m = line.match(/^radio\.(sendNumber|send_number)\(\s*(\w+)\s*\)$/);
  if (m) {
    return {
      stmt: { id: makeMbId('rsn'), type: 'radio_send_number', params: { source: m[2] } },
      ok: true,
    };
  }

  m = line.match(/^([a-zA-Z_]\w*)\s*=\s*randint\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/);
  if (m) {
    return {
      stmt: {
        id: makeMbId('rnd'),
        type: 'set_var_random',
        params: { name: m[1], min: Number(m[2]), max: Number(m[3]) },
      },
      ok: true,
    };
  }

  m = line.match(/^([a-zA-Z_]\w*)\s*\+=\s*(-?\d+)$/);
  if (m) {
    return {
      stmt: {
        id: makeMbId('chv'),
        type: 'change_var',
        params: { name: m[1], delta: Number(m[2]) },
      },
      ok: true,
    };
  }

  m = line.match(/^([a-zA-Z_]\w*)\s*=\s*(-?\d+)$/);
  if (m) {
    return {
      stmt: {
        id: makeMbId('stv'),
        type: 'set_var',
        params: { name: m[1], value: Number(m[2]) },
      },
      ok: true,
    };
  }

  m = line.match(
    /^if\s*\(?\s*(\w+)\s*(>|<|==)\s*(-?\d+)\s*\)?\s*(?:\{|:)\s*basic\.(?:showIcon|show_icon)\(IconNames\.(\w+)\);\s*music\.(?:startMelody|start_melody)\(["']([^"']+)["']\)/
  );
  if (m) {
    return {
      stmt: {
        id: makeMbId('ifs'),
        type: 'if_sensor_action',
        params: {
          source: m[1],
          op: m[2],
          threshold: Number(m[3]),
          icon: normalizeIconName(m[4]),
          melody: m[5],
        },
      },
      ok: true,
    };
  }

  m = line.match(
    /^for\s*.*(?:<\s*(\d+)|range\(\s*(\d+)\s*\)).*IconNames\.(\w+)/
  );
  if (m) {
    return {
      stmt: {
        id: makeMbId('rep'),
        type: 'repeat_beep',
        params: { count: Number(m[1] || m[2] || 3), icon: normalizeIconName(m[3]) },
      },
      ok: true,
    };
  }

  return { stmt: null, ok: false };
}

export function parseMicrobitCode(
  code: string,
  lang: 'javascript' | 'python'
): { program: MicrobitProgram; errors: Array<{ line: number; message: string }> } {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const errors: Array<{ line: number; message: string }> = [];
  const onStartBlocks: MicrobitStmtBlock[] = [];
  const containers: MicrobitEventContainer[] = [];

  if (lang === 'javascript') {
    let activeContainer: MicrobitEventContainer | null = null;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t || t.startsWith('//')) continue;
      if (t === '})' || t === '}') {
        activeContainer = null;
        continue;
      }

      let m: RegExpMatchArray | null;
      if (/^basic\.forever\(\s*function\s*\(\)\s*\{$/.test(t)) {
        activeContainer = { id: makeMbId('ev_for'), eventType: 'forever', params: {}, blocks: [] };
        containers.push(activeContainer);
        continue;
      }
      m = t.match(/^input\.onButtonPressed\(\s*Button\.(A|B|AB)\s*,\s*function\s*\(\)\s*\{$/);
      if (m) {
        activeContainer = {
          id: makeMbId('ev_btn'),
          eventType: 'on_button',
          params: { button: m[1] },
          blocks: [],
        };
        containers.push(activeContainer);
        continue;
      }
      if (/^input\.onGesture\(\s*Gesture\.Shake\s*,\s*function\s*\(\)\s*\{$/.test(t)) {
        activeContainer = { id: makeMbId('ev_shk'), eventType: 'on_shake', params: {}, blocks: [] };
        containers.push(activeContainer);
        continue;
      }
      if (/^input\.onLogoEvent\(\s*TouchButtonEvent\.Pressed\s*,\s*function\s*\(\)\s*\{$/.test(t)) {
        activeContainer = { id: makeMbId('ev_lgo'), eventType: 'on_logo', params: {}, blocks: [] };
        containers.push(activeContainer);
        continue;
      }
      m = t.match(/^input\.onPinPressed\(\s*TouchPin\.(P0|P1|P2)\s*,\s*function\s*\(\)\s*\{$/);
      if (m) {
        activeContainer = {
          id: makeMbId('ev_pin'),
          eventType: 'on_pin',
          params: { pin: m[1] },
          blocks: [],
        };
        containers.push(activeContainer);
        continue;
      }
      if (/^radio\.onReceivedString\(\s*function\s*\([^)]*\)\s*\{$/.test(t)) {
        activeContainer = {
          id: makeMbId('ev_rad'),
          eventType: 'on_radio_received',
          params: {},
          blocks: [],
        };
        containers.push(activeContainer);
        continue;
      }

      const parsed = parseMicrobitStatement(t);
      if (!parsed.ok) {
        errors.push({ line: i + 1, message: `Perintah tidak dikenali: "${t.slice(0, 48)}"` });
      } else if (parsed.stmt) {
        if (activeContainer) activeContainer.blocks.push(parsed.stmt);
        else onStartBlocks.push(parsed.stmt);
      }
    }
  } else {
    // Python mode
    const fnMap = new Map<string, MicrobitStmtBlock[]>();
    let currentFn: string | null = null;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const t = raw.trim();
      const indent = raw.length - raw.trimStart().length;
      if (!t || t.startsWith('#')) continue;

      const defM = t.match(/^def\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*:$/);
      if (defM && indent === 0) {
        currentFn = defM[1];
        fnMap.set(currentFn, []);
        continue;
      }
      if (indent === 0) currentFn = null;

      if (indent === 0) {
        let m: RegExpMatchArray | null;
        m = t.match(/^basic\.forever\(\s*([a-zA-Z_]\w*)\s*\)$/);
        if (m) {
          containers.push({
            id: makeMbId('ev_for'),
            eventType: 'forever',
            params: {},
            blocks: [...(fnMap.get(m[1]) || [])],
          });
          continue;
        }
        m = t.match(/^input\.on_button_pressed\(\s*Button\.(A|B|AB)\s*,\s*([a-zA-Z_]\w*)\s*\)$/);
        if (m) {
          containers.push({
            id: makeMbId('ev_btn'),
            eventType: 'on_button',
            params: { button: m[1] },
            blocks: [...(fnMap.get(m[2]) || [])],
          });
          continue;
        }
        m = t.match(/^input\.on_gesture\(\s*Gesture\.SHAKE\s*,\s*([a-zA-Z_]\w*)\s*\)$/);
        if (m) {
          containers.push({
            id: makeMbId('ev_shk'),
            eventType: 'on_shake',
            params: {},
            blocks: [...(fnMap.get(m[1]) || [])],
          });
          continue;
        }
        m = t.match(
          /^input\.on_logo_event\(\s*TouchButtonEvent\.PRESSED\s*,\s*([a-zA-Z_]\w*)\s*\)$/
        );
        if (m) {
          containers.push({
            id: makeMbId('ev_lgo'),
            eventType: 'on_logo',
            params: {},
            blocks: [...(fnMap.get(m[1]) || [])],
          });
          continue;
        }
        m = t.match(/^input\.on_pin_pressed\(\s*TouchPin\.(P0|P1|P2)\s*,\s*([a-zA-Z_]\w*)\s*\)$/);
        if (m) {
          containers.push({
            id: makeMbId('ev_pin'),
            eventType: 'on_pin',
            params: { pin: m[1] },
            blocks: [...(fnMap.get(m[2]) || [])],
          });
          continue;
        }
        m = t.match(/^radio\.on_received_string\(\s*([a-zA-Z_]\w*)\s*\)$/);
        if (m) {
          containers.push({
            id: makeMbId('ev_rad'),
            eventType: 'on_radio_received',
            params: {},
            blocks: [...(fnMap.get(m[1]) || [])],
          });
          continue;
        }
      }

      const parsed = parseMicrobitStatement(t);
      if (!parsed.ok) {
        errors.push({ line: i + 1, message: `Perintah Python belum dikenali: "${t.slice(0, 48)}"` });
      } else if (parsed.stmt) {
        if (currentFn && indent > 0) fnMap.get(currentFn)?.push(parsed.stmt);
        else onStartBlocks.push(parsed.stmt);
      }
    }
  }

  return {
    program: {
      containers: [
        { id: 'mb_start', eventType: 'on_start', params: {}, blocks: onStartBlocks },
        ...containers,
      ],
    },
    errors,
  };
}
