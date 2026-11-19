import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gem,
  Trophy,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { Direction, LevelDefinition } from '../types';
import { IsometricPandaSprite, PandaPortrait } from './PandaMascot';
import { soundEngine } from '../engine/soundEngine';

export type PlaybackSpeed = 'slow' | 'normal' | 'fast';

interface Props {
  level: LevelDefinition;
  robotX: number;
  robotY: number;
  robotDir: Direction;
  collectedGems: string[];
  status: 'idle' | 'running' | 'success' | 'crashed' | 'incomplete';
  actionLabel: string;
  errorMsg: string | null;
  speed: PlaybackSpeed;
  onChangeSpeed: (s: PlaybackSpeed) => void;
  onRun: () => void;
  onReset: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  onOpenMap: () => void;
  onOpenCertificates: () => void;
  showTutor: boolean;
  onToggleTutor: () => void;
  sfxEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSfx: () => void;
  onToggleBgm: () => void;
}

/** Format inline code tokens like forward(4) or turn("left") into Codementum cream code badges */
function renderHighlightedCopy(text: string) {
  const parts = text.split(/(\b(?:forward|turn|repeat|path_clear|pathClear|gem_ahead|for i in range)\([^)]*\)|"left"|"right")/g);
  return parts.map((part, idx) => {
    if (
      /^(?:forward|turn|repeat|path_clear|pathClear|gem_ahead|for i in range)\([^)]*\)$/.test(part) ||
      part === '"left"' ||
      part === '"right"'
    ) {
      return (
        <code
          key={idx}
          className="mx-0.5 px-1.5 py-0.5 rounded bg-[#F5E3B3] text-[#4A2508] font-mono font-extrabold text-[12px] sm:text-[13px] border border-[#9E6B38]"
        >
          {part}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const GameCanvas: React.FC<Props> = ({
  level,
  robotX,
  robotY,
  robotDir,
  collectedGems,
  status,
  actionLabel,
  errorMsg,
  speed,
  onChangeSpeed,
  onRun,
  onReset,
  canGoPrev,
  canGoNext,
  onPrevLevel,
  onNextLevel,
  onOpenMap,
  onOpenCertificates,
  showTutor,
  onToggleTutor,
  sfxEnabled,
  bgmEnabled,
  onToggleSfx,
  onToggleBgm,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const wallSet = new Set(level.walls.map((w) => `${w.x},${w.y}`));
  const collectedSet = new Set(collectedGems);

  // Isometric projection constants (2:1 diamond)
  const tileW = 86;
  const tileH = 44;
  const cols = level.gridWidth;
  const rows = level.gridHeight;

  const toIso = (gx: number, gy: number) => ({
    ix: (gx - gy) * (tileW / 2),
    iy: (gx + gy) * (tileH / 2),
  });

  // Compute SVG viewBox bounds around the island + padding for trees, hut & Panda height
  const padMargin = 1;
  const minX = toIso(-padMargin, rows + padMargin).ix - 95;
  const maxX = toIso(cols + padMargin, -padMargin).ix + 95;
  const minY = toIso(-padMargin, -padMargin).iy - 110;
  const maxY = toIso(cols + padMargin, rows + padMargin).iy + 115;
  const vbW = maxX - minX;
  const vbH = maxY - minY;

  // Island outer diamond corners (padded by 1.25 tiles for lush forest rim)
  const rim = 1.25;
  const topCorner = toIso(-rim, -rim);
  const rightCorner = toIso(cols - 1 + rim, -rim);
  const bottomCorner = toIso(cols - 1 + rim, rows - 1 + rim);
  const leftCorner = toIso(-rim, rows - 1 + rim);
  const cliffDepth = 42;

  // Deterministic decorative elements around the island rim
  const rimTrees = [
    { gx: -1.1, gy: 0.4, scale: 1.05, pine: false },
    { gx: -0.9, gy: rows - 1.2, scale: 0.95, pine: true },
    { gx: cols - 0.1, gy: -1.0, scale: 1.1, pine: true },
    { gx: cols + 0.15, gy: 1.2, scale: 0.9, pine: false },
    { gx: cols + 0.1, gy: rows - 0.5, scale: 1.0, pine: true },
    { gx: 1.4, gy: -1.05, scale: 0.92, pine: false },
    { gx: 0.4, gy: rows + 0.05, scale: 0.95, pine: false },
    { gx: cols - 1.5, gy: rows + 0.1, scale: 0.85, pine: true },
  ];

  const wildflowers = [
    { gx: -0.6, gy: 1.8, color: '#FB7185' },
    { gx: -0.4, gy: 3.1, color: '#FFE600' },
    { gx: 0.8, gy: -0.6, color: '#F472B6' },
    { gx: 2.6, gy: -0.7, color: '#FFFFFF' },
    { gx: cols - 0.3, gy: 0.3, color: '#EF4444' },
    { gx: cols - 0.2, gy: 2.7, color: '#FFE600' },
    { gx: 1.7, gy: rows - 0.1, color: '#FFFFFF' },
    { gx: 3.2, gy: rows - 0.2, color: '#F472B6' },
  ];

  // Build depth-sorted renderables (Painter's algorithm by gx + gy)
  type RenderEntity = {
    key: string;
    depth: number;
    render: () => React.ReactNode;
  };

  const entities: RenderEntity[] = [];

  // Cozy thatched explorer hut near starting point
  const hutGx = Math.max(-1.0, level.start.x - 1.05);
  const hutGy = Math.max(-0.9, level.start.y - 1.05);
  const hutPos = toIso(hutGx, hutGy);
  entities.push({
    key: 'hut',
    depth: hutGx + hutGy - 0.2,
    render: () => (
      <g key="hut" transform={`translate(${hutPos.ix}, ${hutPos.iy})`}>
        <ellipse cx="0" cy="8" rx="34" ry="16" fill="rgba(0,0,0,0.22)" />
        {/* Wooden cabin walls */}
        <polygon points="-24,-6 0,8 0,-22 -24,-34" fill="#8D5524" stroke="#3B1F0B" strokeWidth="2" />
        <polygon points="0,8 24,-6 24,-34 0,-22" fill="#6F411B" stroke="#3B1F0B" strokeWidth="2" />
        {/* Arched doorway */}
        <path d="M6,4 L6,-12 Q13,-17 18,-10 L18,-2 Z" fill="#4A2508" stroke="#2D1504" strokeWidth="1.8" />
        {/* Thatched straw roof */}
        <path
          d="M-30,-28 Q-6,-58 0,-60 Q14,-56 30,-28 L0,-14 Z"
          fill="#D4A359"
          stroke="#5C3A16"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M-22,-25 Q-4,-48 0,-50 Q8,-45 22,-25" fill="none" stroke="#9C6B2D" strokeWidth="2" />
        {/* Terracotta pots */}
        <ellipse cx="26" cy="4" rx="6" ry="7" fill="#A05A3B" stroke="#3B1F0B" strokeWidth="1.6" />
        <ellipse cx="35" cy="8" rx="5" ry="5.5" fill="#B56E4A" stroke="#3B1F0B" strokeWidth="1.6" />
      </g>
    ),
  });

  // Decorative perimeter trees
  rimTrees.forEach((t, idx) => {
    const pos = toIso(t.gx, t.gy);
    entities.push({
      key: `rim-tree-${idx}`,
      depth: t.gx + t.gy,
      render: () => (
        <g key={`rim-tree-${idx}`} transform={`translate(${pos.ix}, ${pos.iy}) scale(${t.scale})`}>
          <ellipse cx="0" cy="4" rx="18" ry="8" fill="rgba(0,0,0,0.22)" />
          <rect x="-4" y="-22" width="8" height="24" rx="2" fill="#6D4423" stroke="#2D1808" strokeWidth="1.8" />
          {t.pine ? (
            <g>
              <polygon points="0,-68 20,-34 -20,-34" fill="#2E7D32" stroke="#143D16" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="0,-54 24,-20 -24,-20" fill="#3B933E" stroke="#143D16" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="0,-68 8,-34 0,-34" fill="#52B155" opacity="0.5" />
            </g>
          ) : (
            <g>
              <circle cx="0" cy="-38" r="20" fill="#3C9434" stroke="#184315" strokeWidth="2" />
              <circle cx="-11" cy="-31" r="13" fill="#4BA83E" stroke="#184315" strokeWidth="1.8" />
              <circle cx="11" cy="-32" r="12" fill="#2E7D28" stroke="#184315" strokeWidth="1.8" />
              <circle cx="-4" cy="-45" r="8" fill="#7AD456" opacity="0.6" />
            </g>
          )}
        </g>
      ),
    });
  });

  // Obstacles (Walls rendered as mossy boulders & forest trees)
  level.walls.forEach((w, idx) => {
    const pos = toIso(w.x, w.y);
    const isBoulder = (w.x + w.y) % 2 === 0;
    entities.push({
      key: `wall-${w.x}-${w.y}`,
      depth: w.x + w.y + 0.1,
      render: () => (
        <g key={`wall-${idx}`} transform={`translate(${pos.ix}, ${pos.iy})`}>
          <ellipse cx="0" cy="4" rx="20" ry="9" fill="rgba(0,0,0,0.25)" />
          {isBoulder ? (
            <g>
              <path
                d="M-20,2 L-16,-16 L-2,-24 L16,-15 L21,2 L6,10 L-12,9 Z"
                fill="#9AA4AD"
                stroke="#2D3748"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path d="M-16,-16 L-2,-24 L4,-8 L-12,-4 Z" fill="#C7D0D8" />
              <path d="M-4,-18 Q4,-22 10,-15 Q4,-10 -2,-12 Z" fill="#5CB834" />
            </g>
          ) : (
            <g>
              <rect x="-4" y="-18" width="8" height="20" rx="2" fill="#6D4423" stroke="#2D1808" strokeWidth="1.8" />
              <polygon
                points="0,-58 19,-26 -19,-26"
                fill="#2E7D32"
                stroke="#143D16"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <polygon
                points="0,-45 22,-14 -22,-14"
                fill="#43A047"
                stroke="#143D16"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          )}
        </g>
      ),
    });
  });

  // Collectible Magical Red-Gold Orbs / Gems (like Codementum's orb)
  level.gems.forEach((gem) => {
    const k = `${gem.x},${gem.y}`;
    if (collectedSet.has(k)) return;
    const pos = toIso(gem.x, gem.y);
    entities.push({
      key: `gem-${k}`,
      depth: gem.x + gem.y + 0.15,
      render: () => (
        <g key={`gem-${k}`} transform={`translate(${pos.ix}, ${pos.iy})`}>
          <ellipse cx="0" cy="4" rx="12" ry="5.5" fill="rgba(0,0,0,0.26)" />
          {/* Cute red & gold magical orb */}
          <circle cx="0" cy="-9" r="11.5" fill="#E63946" stroke="#4A0E14" strokeWidth="2.2" />
          <path d="M-9,-13 Q0,-20 9,-13 Q0,-8 -9,-13 Z" fill="#FF758F" opacity="0.8" />
          {/* Golden star clasp */}
          <polygon
            points="0,-16 2.5,-11 8,-11 3.5,-7.5 5,-2 0,-5.2 -5,-2 -3.5,-7.5 -8,-11 -2.5,-11"
            fill="#FFE600"
            stroke="#7C4A00"
            strokeWidth="1.2"
          />
          <circle cx="0" cy="-21" r="3" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.5" />
        </g>
      ),
    });
  });

  // Goal Golden Lantern / Finish Star Portal
  const goalPos = toIso(level.goal.x, level.goal.y);
  entities.push({
    key: 'goal',
    depth: level.goal.x + level.goal.y + 0.12,
    render: () => (
      <g key="goal" transform={`translate(${goalPos.ix}, ${goalPos.iy})`}>
        <ellipse cx="0" cy="3" rx="16" ry="8" fill="#FFE600" opacity="0.45" />
        <line x1="0" y1="2" x2="0" y2="-32" stroke="#5C3210" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M0,-32 L22,-24 L0,-16 Z"
          fill="#FFE600"
          stroke="#4A2508"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="-34" r="4" fill="#4ADE80" stroke="#1E293B" strokeWidth="1.8" />
      </g>
    ),
  });

  // Animated Panda Explorer Sprite
  const pandaPos = toIso(robotX, robotY);
  const transitionMs = speed === 'slow' ? 500 : speed === 'fast' ? 160 : 300;
  entities.push({
    key: 'panda',
    depth: robotX + robotY + 0.35,
    render: () => (
      <g
        key="panda"
        style={{
          transform: `translate(${pandaPos.ix}px, ${pandaPos.iy}px)`,
          transition: `transform ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        <IsometricPandaSprite dir={robotDir} status={status} />
      </g>
    ),
  });

  entities.sort((a, b) => a.depth - b.depth);

  return (
    <div className="relative w-full h-full min-h-[430px] lg:min-h-[580px] bg-gradient-to-b from-[#3A414A] via-[#344A39] to-[#285629] overflow-hidden select-none flex flex-col justify-between">
      {/* Subtle atmospheric hills silhouette */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 90%, #52A832 0%, #2B6224 55%, transparent 80%)',
        }}
      />

      {/* TOP FLOATING HUD: Left Arcade Controls (Play/Reset/Settings) + Right Level < 1 > */}
      <div className="relative z-20 flex items-start justify-between p-3 sm:p-4 pointer-events-none">
        {/* Left Play / Reset / Settings Buttons */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Play Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onRun();
            }}
            disabled={status === 'running'}
            className="cm-arcade-btn bg-gradient-to-b from-[#77E248] to-[#49A522] w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center cursor-pointer disabled:opacity-60"
            title="Jalankan Program (Ctrl+Enter)"
          >
            <span className="absolute -top-1 -left-1 px-1 py-0.5 text-[9px] font-mono font-bold bg-black/75 text-white rounded">
              ⌘↵
            </span>
            <Play className="w-7 h-7 text-white fill-white drop-shadow" />
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onReset();
            }}
            className="cm-arcade-btn bg-gradient-to-b from-[#3CA4F7] to-[#1D71C7] w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center cursor-pointer"
            title="Reset Arena (Alt+R)"
          >
            <span className="absolute -top-1 -left-1 px-1 py-0.5 text-[9px] font-mono font-bold bg-black/75 text-white rounded">
              ⌘R
            </span>
            <RotateCcw className="w-6 h-6 text-white drop-shadow" strokeWidth={2.8} />
          </button>

          {/* Settings (Speed & Audio) Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setSettingsOpen((v) => !v);
              }}
              className="cm-arcade-btn bg-gradient-to-b from-[#FFBE45] to-[#DA8215] w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center cursor-pointer"
              title="Pengaturan Kecepatan & Suara"
            >
              <span className="absolute -top-1 -left-1 px-1 py-0.5 text-[9px] font-mono font-bold bg-black/75 text-white rounded">
                ⌘E
              </span>
              <Settings className="w-6 h-6 text-white drop-shadow" strokeWidth={2.5} />
            </button>

            {settingsOpen && (
              <div className="absolute left-0 top-16 z-40 w-64 rounded-lg border-[3px] border-[#5C2A0E] bg-[#F5E0A3] shadow-[0_8px_20px_rgba(0,0,0,0.45)] p-3.5 text-[#3A1E08] space-y-3">
                <div className="flex items-center justify-between border-b border-[#8C5A2B]/40 pb-2">
                  <span className="font-display font-extrabold text-sm">Pengaturan Arena</span>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed */}
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold">Kecepatan Panda</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'slow' as const, label: '0.5x' },
                      { id: 'normal' as const, label: '1x' },
                      { id: 'fast' as const, label: '2x' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          onChangeSpeed(opt.id);
                        }}
                        className={`py-1.5 text-xs font-extrabold rounded border-2 border-[#5C2A0E] cursor-pointer ${
                          speed === opt.id ? 'bg-[#57B832] text-white' : 'bg-white text-[#3A1E08]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Toggles */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onToggleSfx}
                    className={`w-full py-2 px-3 rounded border-2 border-[#5C2A0E] text-xs font-extrabold flex items-center justify-between cursor-pointer ${
                      sfxEnabled ? 'bg-[#4ADE80] text-black' : 'bg-white text-neutral-600'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Efek Suara (SFX)
                    </span>
                    <span>{sfxEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleBgm}
                    className={`w-full py-2 px-3 rounded border-2 border-[#5C2A0E] text-xs font-extrabold flex items-center justify-between cursor-pointer ${
                      bgmEnabled ? 'bg-[#FFE600] text-black' : 'bg-white text-neutral-600'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Music className="w-4 h-4" />
                      Musik Latar (BGM)
                    </span>
                    <span>{bgmEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Level Stepper (< 1 >) & Vertical Arcade Buttons */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Level Switcher < 1 > */}
          <div className="flex items-center gap-1.5 bg-black/35 px-2.5 py-1 rounded-lg border border-white/15">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => {
                soundEngine.playButtonClick();
                onPrevLevel();
              }}
              className="text-[#FF6B4A] hover:text-[#FFE600] disabled:opacity-30 cursor-pointer p-0.5"
              aria-label="Level sebelumnya"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>
            <span className="font-display text-2xl font-extrabold text-white min-w-[26px] text-center tabular-nums drop-shadow">
              {level.order}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => {
                soundEngine.playButtonClick();
                onNextLevel();
              }}
              className="text-[#FF6B4A] hover:text-[#FFE600] disabled:opacity-30 cursor-pointer p-0.5"
              aria-label="Level berikutnya"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* 3 Floating Right-Edge Icon Buttons matching Codementum */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenMap();
            }}
            className="cm-arcade-btn bg-gradient-to-b from-[#F9D976] to-[#C88D2B] w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer"
            title="Peta Level (9 Misi)"
          >
            <Gem className="w-6 h-6 text-[#D62828] fill-[#FF4D6D]" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenCertificates();
            }}
            className="cm-arcade-btn bg-gradient-to-b from-[#45B1FF] to-[#1D74C9] w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer"
            title="Sertifikat & Pencapaian Bintang"
          >
            <Trophy className="w-6 h-6 text-white" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onToggleTutor();
            }}
            className="cm-arcade-btn bg-gradient-to-b from-[#FFCE4A] to-[#D68910] w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center cursor-pointer"
            title="Buka / Tutup Panduan Panda (Alt+I)"
          >
            <span className="absolute -top-1 -left-1 px-1 py-0.5 text-[9px] font-mono font-bold bg-black/75 text-white rounded">
              ⌘I
            </span>
            <HelpCircle className="w-6 h-6 text-white" strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {/* CENTER ISOMETRIC 2D FOREST ISLAND */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2 -mt-10 sm:-mt-14">
        <svg
          viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
          className="w-full max-w-[680px] h-auto max-h-[420px] sm:max-h-[470px] drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
          role="img"
          aria-label={`Pulau Isometrik Level ${level.order}: ${level.title}`}
        >
          <defs>
            <linearGradient id="grassTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#72C942" />
              <stop offset="55%" stopColor="#5BB334" />
              <stop offset="100%" stopColor="#469627" />
            </linearGradient>
            <linearGradient id="stoneTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4F7FA" />
              <stop offset="100%" stopColor="#D7E0E7" />
            </linearGradient>
          </defs>

          {/* 3D Earth Cliff Sides */}
          <polygon
            points={`${leftCorner.ix},${leftCorner.iy} ${bottomCorner.ix},${bottomCorner.iy} ${bottomCorner.ix},${
              bottomCorner.iy + cliffDepth
            } ${leftCorner.ix},${leftCorner.iy + cliffDepth}`}
            fill="#6D4C2F"
            stroke="#3A2513"
            strokeWidth="2.5"
          />
          <polygon
            points={`${bottomCorner.ix},${bottomCorner.iy} ${rightCorner.ix},${rightCorner.iy} ${rightCorner.ix},${
              rightCorner.iy + cliffDepth
            } ${bottomCorner.ix},${bottomCorner.iy + cliffDepth}`}
            fill="#4E331B"
            stroke="#2B1B0D"
            strokeWidth="2.5"
          />

          {/* Main Lush Grass Meadow Island */}
          <polygon
            points={`${topCorner.ix},${topCorner.iy} ${rightCorner.ix},${rightCorner.iy} ${bottomCorner.ix},${bottomCorner.iy} ${leftCorner.ix},${leftCorner.iy}`}
            fill="url(#grassTopGrad)"
            stroke="#397D1E"
            strokeWidth="3"
          />

          {/* Wildflowers scattered on meadow */}
          {wildflowers.map((fl, i) => {
            const p = toIso(fl.gx, fl.gy);
            return (
              <g key={`fl-${i}`} transform={`translate(${p.ix}, ${p.iy})`}>
                <circle cx="0" cy="0" r="3.2" fill={fl.color} />
                <circle cx="4" cy="2" r="2.2" fill="#FFE600" />
                <circle cx="-3" cy="3" r="2.2" fill={fl.color} />
              </g>
            );
          })}

          {/* Isometric Grid Tiles (Stone slabs for walkable tiles, darker meadow turf for obstacles) */}
          {Array.from({ length: rows }).map((_, gy) =>
            Array.from({ length: cols }).map((__, gx) => {
              const key = `${gx},${gy}`;
              const isWall = wallSet.has(key);
              const isGoal = level.goal.x === gx && level.goal.y === gy;
              const c = toIso(gx, gy);
              const hw = tileW / 2 - 2;
              const hh = tileH / 2 - 1;
              const topPts = `${c.ix},${c.iy - hh} ${c.ix + hw},${c.iy} ${c.ix},${c.iy + hh} ${c.ix - hw},${c.iy}`;

              if (isWall) {
                return (
                  <polygon
                    key={key}
                    points={topPts}
                    fill="rgba(42, 102, 24, 0.45)"
                    stroke="rgba(34, 82, 18, 0.35)"
                    strokeWidth="1.2"
                  />
                );
              }

              return (
                <g key={key}>
                  {/* 3D Stone Slab Thickness */}
                  <polygon
                    points={`${c.ix - hw},${c.iy} ${c.ix},${c.iy + hh} ${c.ix},${c.iy + hh + 6} ${c.ix - hw},${c.iy + 6}`}
                    fill={isGoal ? '#C9A227' : '#B5C2CC'}
                    stroke="#64748B"
                    strokeWidth="1"
                  />
                  <polygon
                    points={`${c.ix},${c.iy + hh} ${c.ix + hw},${c.iy} ${c.ix + hw},${c.iy + 6} ${c.ix},${c.iy + hh + 6}`}
                    fill={isGoal ? '#A6831B' : '#94A3B8'}
                    stroke="#64748B"
                    strokeWidth="1"
                  />
                  {/* Top Stone Surface */}
                  <polygon
                    points={topPts}
                    fill={isGoal ? '#FEF08A' : 'url(#stoneTopGrad)'}
                    stroke={isGoal ? '#B45309' : '#94A3B8'}
                    strokeWidth="1.6"
                  />
                  {/* Subtle stone tile seam */}
                  <line
                    x1={c.ix - hw * 0.35}
                    y1={c.iy - hh * 0.25}
                    x2={c.ix + hw * 0.2}
                    y2={c.iy + hh * 0.3}
                    stroke="rgba(100,116,139,0.22)"
                    strokeWidth="1.2"
                  />
                </g>
              );
            })
          )}

          {/* Depth-sorted 3D objects: Hut, Trees, Boulders, Orbs, Goal, Panda */}
          {entities.map((e) => e.render())}
        </svg>
      </div>

      {/* BOTTOM FLOATING WOODEN PANDA TUTOR DIALOGUE BOX (Exact Codementum signature!) */}
      <div className="relative z-20 px-3 pb-3 sm:px-4 sm:pb-4">
        {errorMsg ? (
          <div className="cm-wood-dialog p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-[#FB7185]">
            <PandaPortrait className="w-20 h-20 shrink-0" mood="oops" />
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-xs font-extrabold text-[#FFE600] flex items-center justify-center sm:justify-start gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Ups, Perlu Perbaikan!
              </div>
              <p className="text-sm font-semibold text-[#FFF4DC] leading-relaxed">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onReset();
              }}
              className="cm-green-ok px-5 py-2 text-sm font-extrabold text-white cursor-pointer shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        ) : showTutor ? (
          <div className="cm-wood-dialog p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <PandaPortrait
              className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 -my-2"
              mood={status === 'success' ? 'excited' : 'happy'}
            />
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="text-xs font-extrabold text-[#FFE600] flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>
                  Level {level.order}: {level.title}
                </span>
                <span className="text-[#F5E3B3]/80">·</span>
                <span className="text-[#A7F3D0]">
                  Permata {collectedGems.length}/{level.gems.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#FFF6E5] leading-relaxed">
                {renderHighlightedCopy(level.mission)}
              </p>
              <p className="text-[11px] sm:text-xs text-[#F5D69E] leading-relaxed">
                <strong>Petunjuk:</strong> {renderHighlightedCopy(level.hint)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onToggleTutor();
              }}
              className="cm-green-ok px-7 py-2.5 text-sm font-extrabold text-white cursor-pointer shrink-0 self-center sm:self-end"
            >
              OK
            </button>
          </div>
        ) : (
          /* Compact Status Strip when Tutor box is dismissed */
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-bold text-white">
            <div className="flex items-center gap-2 min-w-0">
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
              ) : (
                <Gem className="w-4 h-4 text-[#FF6B6B] fill-[#FF6B6B] shrink-0" />
              )}
              <span className="truncate">{actionLabel}</span>
            </div>
            <span className="font-mono text-[#FFE600] shrink-0 tabular-nums">
              Permata {collectedGems.length}/{level.gems.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
