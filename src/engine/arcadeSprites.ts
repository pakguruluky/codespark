// Authentic MakeCode Arcade 16-color palette & 16x16 pixel-art sprite library

export const MAKECODE_PALETTE: Record<string, string> = {
  '0': 'transparent',
  '1': '#ffffff', // White
  '2': '#ff2121', // Red
  '3': '#ff93c4', // Pink
  '4': '#ff8135', // Orange
  '5': '#fff609', // Yellow
  '6': '#249ca3', // Teal
  '7': '#78dc52', // Green
  '8': '#003fad', // Blue
  '9': '#87f2ff', // Light Blue / Cyan
  a: '#8e2ec4', // Purple
  b: '#a4839f', // Light Purple
  c: '#5c406c', // Dark Purple
  d: '#e5cdc4', // Tan
  e: '#91463d', // Brown
  f: '#000000', // Black
};

export const MAKECODE_COLOR_LIST: Array<{ key: string; name: string; hex: string }> = [
  { key: '1', name: 'Putih', hex: '#ffffff' },
  { key: '2', name: 'Merah', hex: '#ff2121' },
  { key: '3', name: 'Pink', hex: '#ff93c4' },
  { key: '4', name: 'Oranye', hex: '#ff8135' },
  { key: '5', name: 'Kuning', hex: '#fff609' },
  { key: '6', name: 'Teal', hex: '#249ca3' },
  { key: '7', name: 'Hijau', hex: '#78dc52' },
  { key: '8', name: 'Biru', hex: '#003fad' },
  { key: '9', name: 'Cyan', hex: '#87f2ff' },
  { key: 'a', name: 'Ungu', hex: '#8e2ec4' },
  { key: 'b', name: 'Lavender', hex: '#a4839f' },
  { key: 'c', name: 'Ungu Tua', hex: '#5c406c' },
  { key: 'd', name: 'Krem', hex: '#e5cdc4' },
  { key: 'e', name: 'Cokelat', hex: '#91463d' },
  { key: 'f', name: 'Hitam', hex: '#000000' },
];

export const BG_COLOR_OPTIONS: Array<{ id: string; label: string; hex: string }> = [
  { id: 'space', label: 'Galaksi Gelap', hex: '#0b1026' },
  { id: 'arctic', label: 'Laut Arktik', hex: '#0c4a6e' },
  { id: 'midnight', label: 'Ungu Malam', hex: '#1e1b4b' },
  { id: 'forest', label: 'Hutan Piksel', hex: '#14532d' },
  { id: 'arcade', label: 'Slate Arcade', hex: '#1e293b' },
  { id: 'sky', label: 'Langit Cerah', hex: '#0284c7' },
  { id: 'black', label: 'Hitam Klasik', hex: '#000000' },
];

export type PixelSpriteGrid = string[]; // 16 rows of 16 hex chars ('0'-'f')

export interface ArcadeSpritePreset {
  id: string;
  name: string;
  category: 'hero' | 'food' | 'enemy' | 'projectile';
  pixels: PixelSpriteGrid;
}

function normalizeGrid(rows: string[]): PixelSpriteGrid {
  const out: string[] = [];
  for (let y = 0; y < 16; y++) {
    const raw = (rows[y] || '').replace(/\s+/g, '').toLowerCase();
    out.push(raw.padEnd(16, '0').slice(0, 16));
  }
  return out;
}

export const ARCADE_SPRITE_LIBRARY: Record<string, ArcadeSpritePreset> = {
  rocket: {
    id: 'rocket',
    name: 'Roket Galaksi',
    category: 'hero',
    pixels: normalizeGrid([
      '0000000220000000',
      '0000002222000000',
      '0000021111200000',
      '0000011991100000',
      '0000119999110000',
      '0000119119110000',
      '0000111991110000',
      '0002111111112000',
      '0022111111112200',
      '0222111881112220',
      '0220111881110220',
      '0200011111100020',
      '0000004554000000',
      '0000004554000000',
      '0000000550000000',
      '0000000400000000',
    ]),
  },
  meteor: {
    id: 'meteor',
    name: 'Meteor Api',
    category: 'enemy',
    pixels: normalizeGrid([
      '0000004550000000',
      '0000045424000000',
      '0000eeeee4400000',
      '000eeeeeee400000',
      '00eefeeeeeee0000',
      '00efdeeeeece0000',
      '0eeedeeceecee000',
      '0eeeeeecceeee000',
      '0eeeeeeceefee000',
      '00eeeecceffee000',
      '00eeecceeeee0000',
      '000eeeeeeee00000',
      '0000eeeeee000000',
      '00000cccc0000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  star: {
    id: 'star',
    name: 'Bintang Emas',
    category: 'food',
    pixels: normalizeGrid([
      '0000000550000000',
      '0000000550000000',
      '0000005555000000',
      '0000005155000000',
      '0055555155555500',
      '0005555555555000',
      '0000555555550000',
      '0000055555500000',
      '0000055555500000',
      '0000555445550000',
      '0005554004555000',
      '0005540000455000',
      '0004400000044000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  laser: {
    id: 'laser',
    name: 'Laser Energi',
    category: 'projectile',
    pixels: normalizeGrid([
      '0000000990000000',
      '0000009119000000',
      '0000009119000000',
      '0000009119000000',
      '0000009119000000',
      '0000009119000000',
      '0000009119000000',
      '0000009559000000',
      '0000000550000000',
      '0000000440000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  polar_bear: {
    id: 'polar_bear',
    name: 'Beruang Kutub',
    category: 'hero',
    pixels: normalizeGrid([
      '0000110000110000',
      '0001111111111000',
      '0001111111111000',
      '0011111111111100',
      '00111f1111f11100',
      '0011111111111100',
      '0011111ff1111100',
      '0001111dd1111000',
      '0000222222220000',
      '0001111111111000',
      '0011111111111100',
      '0011111991111100',
      '0001111111111000',
      '0001110000111000',
      '0009990000999000',
      '0000000000000000',
    ]),
  },
  fish: {
    id: 'fish',
    name: 'Ikan Arktik',
    category: 'food',
    pixels: normalizeGrid([
      '0000000000000000',
      '0000000000000000',
      '0000000999000000',
      '0000099999900000',
      '00909991f9990000',
      '0999999999999000',
      '0999966669999900',
      '0999999999999000',
      '0090999999990000',
      '0000099999900000',
      '0000000999000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  ice_hazard: {
    id: 'ice_hazard',
    name: 'Retakan Es',
    category: 'enemy',
    pixels: normalizeGrid([
      '0000000900000000',
      '0000009190000000',
      '0000091119000000',
      '0000911911900000',
      '0009199899190000',
      '0091988288919000',
      '0911882228811900',
      '0919822522891900',
      '0099882228899000',
      '0009888288890000',
      '0000988888900000',
      '0000098889000000',
      '0000009890000000',
      '0000000900000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  panda: {
    id: 'panda',
    name: 'Panda Spark',
    category: 'hero',
    pixels: normalizeGrid([
      '000ff000000ff000',
      '00ffff0000ffff00',
      '00ff11111111ff00',
      '0001111111111000',
      '0011ff1111ff1100',
      '0011f111111f1100',
      '0011ff1ff1ff1100',
      '0001111111111000',
      '0000777777770000',
      '00ff11111111ff00',
      '00ff11111111ff00',
      '0000111111110000',
      '0000ff1111ff0000',
      '0000ff0000ff0000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  ghost: {
    id: 'ghost',
    name: 'Hantu Piksel',
    category: 'enemy',
    pixels: normalizeGrid([
      '000000aaaa000000',
      '0000aaaaaaaa0000',
      '000aaaaaaaaaa000',
      '00aaaaaaaaaaaa00',
      '00aa11aaaa11aa00',
      '00aa1faaaa1faa00',
      '00aa11aaaa11aa00',
      '00aaaaaaaaaaaa00',
      '00aaaa3333aaaa00',
      '00aaaaaaaaaaaa00',
      '00aaaaaaaaaaaa00',
      '00aaaaaaaaaaaa00',
      '00aa00aaaa00aa00',
      '00a0000aa0000a00',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  gem: {
    id: 'gem',
    name: 'Permata Ruby',
    category: 'food',
    pixels: normalizeGrid([
      '0000000000000000',
      '0000022222200000',
      '0000233222220000',
      '0002313222222000',
      '0023332222222200',
      '0022222222222200',
      '0002222222222000',
      '0000222222220000',
      '0000022222200000',
      '0000002222000000',
      '0000000220000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  robot: {
    id: 'robot',
    name: 'Robot Memori',
    category: 'hero',
    pixels: normalizeGrid([
      '0000000550000000',
      '0000000990000000',
      '0000999999990000',
      '0009999999999000',
      '0009ff9999ff9000',
      '0009f59999f59000',
      '0009999999999000',
      '0009911111199000',
      '0000999999990000',
      '0066888888886600',
      '0066885555886600',
      '0000888888880000',
      '0000880000880000',
      '0000660000660000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  chest: {
    id: 'chest',
    name: 'Peti Misteri',
    category: 'enemy',
    pixels: normalizeGrid([
      '0000000000000000',
      '000eeeeeeeeee000',
      '00e5555555555e00',
      '00eeeeeeeeeeee00',
      '00e4444444444e00',
      '00e4444554444e00',
      '00fffff55fffff00',
      '00e4444554444e00',
      '00e4444444444e00',
      '00e4444444444e00',
      '00eeeeeeeeeeee00',
      '000eeeeeeeeee000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  chroma_ship: {
    id: 'chroma_ship',
    name: 'Penjelajah Chroma',
    category: 'hero',
    pixels: normalizeGrid([
      '0000001111000000',
      '0000011111100000',
      '0000119999110000',
      '0001199119911000',
      '0011119999111100',
      '0011111111111100',
      '0115511111155110',
      '0115511111155110',
      '0011111111111100',
      '0001111111111000',
      '0000111001110000',
      '0000010000100000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  chroma_orb: {
    id: 'chroma_orb',
    name: 'Orb Warna',
    category: 'food',
    pixels: normalizeGrid([
      '0000000000000000',
      '0000001111000000',
      '0000111111110000',
      '0001111111111000',
      '0011111111111100',
      '0011199111111100',
      '0011191111111100',
      '0011111111111100',
      '0011111111111100',
      '0001111111111000',
      '0000111111110000',
      '0000001111000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  shield_bolt: {
    id: 'shield_bolt',
    name: 'Bola Es',
    category: 'projectile',
    pixels: normalizeGrid([
      '0000000000000000',
      '0000009999000000',
      '0000991111990000',
      '0009111991119000',
      '0009199999919000',
      '0009199119919000',
      '0009199999919000',
      '0009111991119000',
      '0000991111990000',
      '0000009999000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  coin: {
    id: 'coin',
    name: 'Koin Arcade',
    category: 'food',
    pixels: normalizeGrid([
      '0000005555000000',
      '0000555555550000',
      '0005544444455000',
      '0055455555545500',
      '0054551555554500',
      '0054551555554500',
      '0054551555554500',
      '0054551555554500',
      '0055455555545500',
      '0005544444455000',
      '0000555555550000',
      '0000005555000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
  alien: {
    id: 'alien',
    name: 'Alien Invader',
    category: 'enemy',
    pixels: normalizeGrid([
      '0000070000700000',
      '0000007007000000',
      '0000077777700000',
      '000077f77f770000',
      '0007777777777000',
      '0007077777707000',
      '0007070000707000',
      '0000007707700000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ]),
  },
};

export const ARCADE_SPRITE_LIST: ArcadeSpritePreset[] = Object.values(ARCADE_SPRITE_LIBRARY);

export function clonePixelGrid(grid: PixelSpriteGrid): PixelSpriteGrid {
  return [...grid];
}

export function createBlankPixelGrid(): PixelSpriteGrid {
  return Array.from({ length: 16 }, () => '0000000000000000');
}

export function getSpritePixels(
  spriteId: string,
  customSprites?: Record<string, PixelSpriteGrid>
): PixelSpriteGrid {
  if (customSprites && customSprites[spriteId]) {
    return customSprites[spriteId];
  }
  return ARCADE_SPRITE_LIBRARY[spriteId]?.pixels || ARCADE_SPRITE_LIBRARY.rocket.pixels;
}

export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  grid: PixelSpriteGrid,
  cx: number,
  cy: number,
  scale = 1,
  tintColor?: string
) {
  const half = (16 * scale) / 2;
  const x0 = Math.round(cx - half);
  const y0 = Math.round(cy - half);

  for (let y = 0; y < 16; y++) {
    const row = grid[y] || '';
    for (let x = 0; x < 16; x++) {
      const ch = row[x];
      if (!ch || ch === '0') continue;
      if (tintColor && ch === '1') {
        ctx.fillStyle = tintColor;
      } else {
        ctx.fillStyle = MAKECODE_PALETTE[ch] || '#ffffff';
      }
      ctx.fillRect(x0 + x * scale, y0 + y * scale, scale, scale);
    }
  }
}

const dataUrlCache = new Map<string, string>();

export function spriteToDataUrl(grid: PixelSpriteGrid, scale = 2): string {
  const cacheKey = `${scale}:${grid.join('|')}`;
  const cached = dataUrlCache.get(cacheKey);
  if (cached) return cached;

  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 16 * scale;
  canvas.height = 16 * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  drawPixelSprite(ctx, grid, (16 * scale) / 2, (16 * scale) / 2, scale);
  const url = canvas.toDataURL('image/png');
  if (dataUrlCache.size > 200) {
    dataUrlCache.clear();
  }
  dataUrlCache.set(cacheKey, url);
  return url;
}
