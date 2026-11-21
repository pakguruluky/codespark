import React, { useState } from 'react';
import {
  Eraser,
  FlipHorizontal2,
  PaintBucket,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  ARCADE_SPRITE_LIBRARY,
  ARCADE_SPRITE_LIST,
  MAKECODE_COLOR_LIST,
  MAKECODE_PALETTE,
  clonePixelGrid,
  createBlankPixelGrid,
  getSpritePixels,
  spriteToDataUrl,
  type PixelSpriteGrid,
} from '../engine/arcadeSprites';

interface Props {
  customSprites: Record<string, PixelSpriteGrid>;
  selectedSpriteId: string;
  onSelectSprite: (spriteId: string) => void;
  onUpdateSprite: (spriteId: string, grid: PixelSpriteGrid) => void;
  onResetSprite: (spriteId: string) => void;
}

export const ArcadePixelEditor: React.FC<Props> = ({
  customSprites,
  selectedSpriteId,
  onSelectSprite,
  onUpdateSprite,
  onResetSprite,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('5'); // Yellow default
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill'>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);

  const activeGrid = getSpritePixels(selectedSpriteId, customSprites);
  const presetInfo = ARCADE_SPRITE_LIBRARY[selectedSpriteId];

  const applyPixel = (x: number, y: number, overrideTool?: 'pencil' | 'eraser' | 'fill') => {
    const activeTool = overrideTool || tool;
    const targetColor = activeTool === 'eraser' ? '0' : selectedColor;

    if (activeTool === 'fill') {
      const orig = activeGrid[y]?.[x] || '0';
      if (orig === targetColor) return;
      const nextRows = activeGrid.map((r) => r.split(''));
      const queue: Array<[number, number]> = [[x, y]];
      const visited = new Set<string>();
      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        const key = `${cx},${cy}`;
        if (visited.has(key)) continue;
        if (cx < 0 || cx >= 16 || cy < 0 || cy >= 16) continue;
        if (nextRows[cy][cx] !== orig) continue;
        visited.add(key);
        nextRows[cy][cx] = targetColor;
        queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      onUpdateSprite(
        selectedSpriteId,
        nextRows.map((r) => r.join(''))
      );
      return;
    }

    const row = activeGrid[y] || '0000000000000000';
    if (row[x] === targetColor) return;
    const next = clonePixelGrid(activeGrid);
    next[y] = row.slice(0, x) + targetColor + row.slice(x + 1);
    onUpdateSprite(selectedSpriteId, next);
  };

  const handleFlipHorizontal = () => {
    const flipped = activeGrid.map((row) => row.split('').reverse().join(''));
    onUpdateSprite(selectedSpriteId, flipped);
  };

  const handleClear = () => {
    onUpdateSprite(selectedSpriteId, createBlankPixelGrid());
  };

  return (
    <div
      className="flex-1 flex flex-col lg:flex-row gap-4 p-4 bg-[#f3f5f7] overflow-y-auto select-none"
      onMouseUp={() => setIsDrawing(false)}
      onMouseLeave={() => setIsDrawing(false)}
    >
      {/* Left: Sprite Gallery Selector */}
      <div className="lg:w-56 shrink-0 bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#276C73]">
            Galeri Sprite (16×16)
          </h4>
          <span className="text-[10px] font-bold text-slate-400">
            {ARCADE_SPRITE_LIST.length} aset
          </span>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
          {ARCADE_SPRITE_LIST.map((sp) => {
            const grid = getSpritePixels(sp.id, customSprites);
            const url = spriteToDataUrl(grid, 2);
            const isSel = sp.id === selectedSpriteId;
            const isModified = Boolean(customSprites[sp.id]);
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => onSelectSprite(sp.id)}
                className={`p-2 rounded-md border text-left transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSel
                    ? 'bg-[#e6f4f5] border-[#276C73] ring-2 ring-[#276C73]/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-9 h-9 bg-slate-900 rounded flex items-center justify-center relative">
                  {url && (
                    <img
                      src={url}
                      alt={sp.name}
                      className="w-8 h-8"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  {isModified && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 border border-slate-900" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                  {sp.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: 16x16 Interactive Pixel Canvas */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col items-center gap-3">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Editor Sprite Piksel: {presetInfo?.name || selectedSpriteId}
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik atau seret di kanvas 16×16 — perubahan langsung tampil di konsol kiri!
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTool('pencil')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                tool === 'pencil'
                  ? 'bg-[#276C73] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Pensil"
            >
              <Pencil className="w-3.5 h-3.5" />
              Pensil
            </button>
            <button
              type="button"
              onClick={() => setTool('fill')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                tool === 'fill'
                  ? 'bg-[#276C73] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Isi Warna (Bucket)"
            >
              <PaintBucket className="w-3.5 h-3.5" />
              Isi
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-[#276C73] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Penghapus"
            >
              <Eraser className="w-3.5 h-3.5" />
              Hapus
            </button>
            <button
              type="button"
              onClick={handleFlipHorizontal}
              className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              title="Balik Horizontal"
            >
              <FlipHorizontal2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded bg-slate-100 text-rose-600 hover:bg-rose-50 cursor-pointer"
              title="Bersihkan Kanvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onResetSprite(selectedSpriteId)}
              className="px-2 py-1.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Kembalikan ke bentuk asli"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Default
            </button>
          </div>
        </div>

        {/* 16x16 Pixel Matrix + Palette */}
        <div className="flex flex-col sm:flex-row items-center gap-5 py-1">
          {/* MakeCode 16-Color Swatch Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-3 gap-1.5 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setTool('eraser')}
              title="Transparan"
              className={`w-7 h-7 rounded border-2 cursor-pointer flex items-center justify-center text-[10px] font-black text-slate-500 ${
                tool === 'eraser' ? 'border-[#276C73] scale-105' : 'border-slate-300'
              }`}
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            >
              ×
            </button>
            {MAKECODE_COLOR_LIST.map((col) => {
              const isSelected = tool !== 'eraser' && selectedColor === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  title={col.name}
                  onClick={() => {
                    setSelectedColor(col.key);
                    if (tool === 'eraser') setTool('pencil');
                  }}
                  className={`w-7 h-7 rounded border-2 cursor-pointer transition-transform ${
                    isSelected ? 'border-slate-900 scale-110 ring-2 ring-[#276C73]' : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              );
            })}
          </div>

          {/* 16x16 Drawing Surface */}
          <div
            className="grid border-2 border-slate-700 rounded overflow-hidden shadow-md touch-none"
            style={{
              gridTemplateColumns: 'repeat(16, 18px)',
              gridTemplateRows: 'repeat(16, 18px)',
              backgroundImage:
                'linear-gradient(45deg, #e2e8f0 25%, #f8fafc 25%, #f8fafc 50%, #e2e8f0 50%, #e2e8f0 75%, #f8fafc 75%, #f8fafc 100%)',
              backgroundSize: '18px 18px',
            }}
          >
            {activeGrid.map((row, y) =>
              row.split('').map((ch, x) => (
                <div
                  key={`${x}-${y}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDrawing(true);
                    applyPixel(x, y);
                  }}
                  onMouseEnter={() => {
                    if (isDrawing && tool !== 'fill') {
                      applyPixel(x, y);
                    }
                  }}
                  className="w-[18px] h-[18px] border-[0.5px] border-slate-300/40 cursor-crosshair"
                  style={{
                    backgroundColor: ch === '0' ? 'transparent' : MAKECODE_PALETTE[ch],
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
