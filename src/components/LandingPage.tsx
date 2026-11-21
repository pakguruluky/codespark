import React, { useState } from 'react';
import {
  Code2,
  Gamepad2,
  Award,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Cpu,
  Presentation,
  FlaskConical,
  ClipboardCheck,
  Camera,
  Users,
  ShieldCheck,
  GraduationCap,
  Maximize2,
  Compass,
  CircuitBoard,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { TierId } from '../types';
import { TIERS } from '../data/levels';
import { APP_MAKER_PROJECTS } from '../data/appMakerProjects';
import { GAME_MAKER_PROJECTS } from '../data/gameMakerProjects';
import { AI_ML_PROJECTS } from '../data/aiMlProjects';
import { KOALA_MAZE_LEVELS } from '../data/koalaMazeLevels';
import {
  CHARACTER_META,
  MascotPortrait,
  type CharacterId,
} from './PandaMascot';
import { ModuleGuideModal } from './ModuleGuideModal';
import { soundEngine } from '../engine/soundEngine';

interface Props {
  onGoLogin: (defaultRole?: 'student' | 'instructor' | 'admin') => void;
  onGoRegister: () => void;
}

type ShowcaseId = 'studio' | 'koala' | 'microbit' | 'arcade';

interface ShowcaseSlide {
  id: ShowcaseId;
  tabLabel: string;
  headerTitle: string;
  caption: string;
  accentColor: string;
}

const DEMO_CHARACTERS: CharacterId[] = ['panda', 'bear', 'koala'];

const STUDIO_SCREENSHOT_SRC = '/assets/aistudio/image_25530e88.png';
const STUDIO_SCREENSHOT_ALT =
  'Tampilan nyata CodeSpark Coding Studio dengan blok perintah repeat dan if path_clear, sinkronisasi Python, debugger per langkah, penggaris jarak, dan pulau isometrik';

const TOTAL_KOALA_SUBLEVELS = KOALA_MAZE_LEVELS.reduce(
  (sum, grp) => sum + grp.subLevels.length,
  0
);

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'studio',
    tabLabel: 'Coding Studio',
    headerTitle: 'CodeSpark Coding Studio · Blocks, Python & JavaScript',
    caption:
      'Ruang belajar pulau isometrik: blok drag-and-drop, sinkronisasi Python/JS, Step 1× & Penggaris Jarak.',
    accentColor: '#4ADE80',
  },
  {
    id: 'koala',
    tabLabel: 'Labirin Koala',
    headerTitle: `Media Belajar · Labirin Koala (${KOALA_MAZE_LEVELS.length} Level · ${TOTAL_KOALA_SUBLEVELS} Sub-Level)`,
    caption:
      'Tantangan blok visual bertingkat bersama karakter Koala: Urutan, Ulangi, Ulangi Sampai & Logika Jika/Selain Itu.',
    accentColor: '#38BDF8',
  },
  {
    id: 'microbit',
    tabLabel: 'micro:bit Lab',
    headerTitle: 'CodeSpark micro:bit v2 Studio · Simulator Hardware & IoT',
    caption:
      'Klik tombol A, B, atau Shake di papan micro:bit! Dilengkapi LED 5×5, Pin 0–2, sensor suhu/cahaya & Radio.',
    accentColor: '#60A5FA',
  },
  {
    id: 'arcade',
    tabLabel: 'Game Arcade',
    headerTitle: 'CodeSpark Game Maker Arcade · Konsol Handheld & Sprite Piksel',
    caption:
      'Coba gerakkan karakter lewat D-Pad atau tombol A! Rakit 5 game arcade lewat Blocks, JS, Python & Editor Piksel.',
    accentColor: '#FFE600',
  },
];

const LED_PATTERNS: Record<'heart' | 'smile' | 'dice', number[][]> = {
  heart: [
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  smile: [
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  dice: [
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
  ],
};

const KoalaShowcasePreview: React.FC = () => {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    if (running) return;
    soundEngine.playButtonClick();
    setStep(0);
    setRunning(true);
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= 4) {
        window.clearInterval(timer);
        setRunning(false);
        soundEngine.playBlockSnap();
      }
    }, 340);
  };

  return (
    <div className="bg-[#F8FAFC] text-black select-none">
      {/* Authentic CodeSpark Koala Maze Top Strip */}
      <div className="px-3.5 py-2 bg-[#4C1D95] text-white flex items-center justify-between gap-2 text-[11px] font-bold">
        <span className="font-display font-extrabold tracking-wide">
          CodeSpark · Labirin Koala
        </span>
        <div className="flex items-center gap-1 tabular-nums">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span
              key={n}
              className={`w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center border ${
                n === 7
                  ? 'bg-[#FFE600] text-black border-black'
                  : n < 7
                  ? 'bg-[#4ADE80] text-black border-black'
                  : 'bg-white/15 text-white border-white/40'
              }`}
            >
              {n}
            </span>
          ))}
          <span className="ml-1 text-[10px] text-purple-200">/ {TOTAL_KOALA_SUBLEVELS}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-12 gap-3 p-3.5 items-stretch">
        {/* Left: Koala 6x5 Maze Grid */}
        <div className="sm:col-span-5 flex flex-col justify-between gap-2.5">
          <div className="bg-[#15803D] border-2 border-black p-2 rounded-sm">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 20 }).map((_, idx) => {
                const row = Math.floor(idx / 5);
                const col = idx % 5;
                const isPath = row === 2;
                const isKoala = row === 2 && col === step;
                const isGoal = row === 2 && col === 4;
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-[2px] flex items-center justify-center text-xs font-extrabold border ${
                      isPath
                        ? 'bg-[#FEF3C7] border-[#D97706]/50'
                        : 'bg-[#166534] border-[#14532D]'
                    }`}
                  >
                    {isKoala ? (
                      <MascotPortrait character="koala" className="w-7 h-7" mood={step === 4 ? 'excited' : 'happy'} />
                    ) : isGoal ? (
                      <span title="Daun Eukaliptus" className="text-sm leading-none">
                        🌿
                      </span>
                    ) : !isPath && (row + col) % 2 === 0 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="flex-1 neo-btn bg-[#F97316] text-white py-1.5 px-3 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {step === 4 ? 'Ulangi Aksi' : 'Jalankan Koala'}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setStep(0);
              }}
              className="neo-btn bg-white p-1.5 cursor-pointer"
              aria-label="Reset posisi Koala"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Koala Instruction + Visual Blocks */}
        <div className="sm:col-span-7 flex flex-col justify-between gap-2.5">
          <div className="bg-white border-2 border-black p-2.5 flex items-center gap-2.5">
            <MascotPortrait character="koala" className="w-9 h-9 shrink-0" mood="happy" />
            <p className="text-[11px] font-bold text-neutral-800 leading-snug">
              {step === 4
                ? 'Hore! Koala berhasil sampai ke daun eukaliptus hanya dengan 3 blok!'
                : 'Bantu Koala melangkah 4 petak ke kanan dengan blok Ulangi.'}
            </p>
          </div>

          <div className="bg-[#F1F5F9] border-2 border-black p-3 space-y-1.5 flex-1">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-neutral-600 mb-1">
              <span>AREA KERJA BLOK</span>
              <span className="font-mono tabular-nums">3 / 4 blok</span>
            </div>
            <div className="inline-block bg-[#EA580C] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-sm border border-black">
              ketika dijalankan
            </div>
            <div className="bg-[#EC4899] text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-sm border border-black space-y-1.5">
              <div>ulangi 4 kali · kerjakan</div>
              <div className="ml-3 inline-block bg-[#06B6D4] text-white px-2.5 py-1 rounded-sm border border-black">
                gerak maju →
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] text-[#7DD3FC] font-mono text-[10px] px-3 py-1.5 border-2 border-black rounded-sm">
            {'for (let i = 0; i < 4; i++) { moveForward(); }'}
          </div>
        </div>
      </div>
    </div>
  );
};

const MicrobitShowcasePreview: React.FC = () => {
  const [pattern, setPattern] = useState<'heart' | 'smile' | 'dice'>('heart');
  const matrix = LED_PATTERNS[pattern];

  const handleSelect = (next: 'heart' | 'smile' | 'dice') => {
    soundEngine.playButtonClick();
    setPattern(next);
  };

  return (
    <div className="bg-[#F8FAFC] text-black select-none">
      {/* Authentic CodeSpark MakeCode micro:bit Bar */}
      <div className="px-3.5 py-2 bg-[#1D4ED8] text-white flex items-center justify-between gap-2 text-[11px] font-bold">
        <span className="font-display font-extrabold">CodeSpark · micro:bit v2</span>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-white text-[#1D4ED8] font-extrabold">Blocks</span>
          <span className="px-2 py-0.5 rounded bg-white/15">JavaScript</span>
          <span className="px-2 py-0.5 rounded bg-white/15">Python</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-12 gap-3 p-3.5 items-stretch">
        {/* Left: Interactive BBC micro:bit v2 Board */}
        <div className="sm:col-span-5 flex flex-col justify-between gap-2.5">
          <div className="bg-[#111827] border-2 border-black rounded-lg p-3 relative overflow-hidden">
            {/* Gold top touch logo */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-extrabold text-[#FACC15]">v2</span>
              <span className="w-7 h-3.5 rounded-full border-2 border-[#FACC15] flex items-center justify-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#FACC15]" />
                <span className="w-1 h-1 rounded-full bg-[#FACC15]" />
              </span>
              <span className="text-[9px] font-mono font-extrabold text-[#FACC15]">LED</span>
            </div>

            <div className="flex items-center justify-between gap-2 my-1">
              <button
                type="button"
                onClick={() => handleSelect('heart')}
                className={`w-7 h-7 rounded-sm border-2 text-[10px] font-extrabold cursor-pointer flex items-center justify-center ${
                  pattern === 'heart'
                    ? 'bg-[#FFE600] text-black border-white'
                    : 'bg-[#374151] text-white border-[#9CA3AF] hover:bg-[#4B5563]'
                }`}
                title="Tekan Tombol A (Heart)"
              >
                A
              </button>

              {/* 5x5 LED Matrix */}
              <div className="grid grid-cols-5 gap-1 p-1.5 bg-[#030712] rounded border border-neutral-700">
                {matrix.flat().map((on, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-3.5 rounded-[2px] transition-all ${
                      on ? 'bg-[#EF4444] shadow-[0_0_6px_#EF4444]' : 'bg-[#262626]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSelect('smile')}
                className={`w-7 h-7 rounded-sm border-2 text-[10px] font-extrabold cursor-pointer flex items-center justify-center ${
                  pattern === 'smile'
                    ? 'bg-[#FFE600] text-black border-white'
                    : 'bg-[#374151] text-white border-[#9CA3AF] hover:bg-[#4B5563]'
                }`}
                title="Tekan Tombol B (Senyum)"
              >
                B
              </button>
            </div>

            {/* Bottom Gold Edge Pins */}
            <div className="mt-2.5 pt-1.5 border-t border-[#FACC15]/40 flex items-center justify-around text-[9px] font-mono font-extrabold text-[#FACC15]">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3V</span>
              <span>GND</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelect('dice')}
            className={`neo-btn py-1.5 px-3 text-xs font-extrabold cursor-pointer ${
              pattern === 'dice' ? 'bg-[#FFE600]' : 'bg-white hover:bg-[#FFE600]'
            }`}
          >
            Shake · Kocok Dadu (5)
          </button>
        </div>

        {/* Right: Toolbox & MakeCode Blocks */}
        <div className="sm:col-span-7 grid grid-cols-12 gap-2">
          <div className="col-span-4 bg-white border-2 border-black p-1.5 space-y-1 text-[10px] font-extrabold">
            {[
              { name: 'Basic', c: '#2563EB' },
              { name: 'Input', c: '#D946EF' },
              { name: 'Music', c: '#EF4444' },
              { name: 'LED', c: '#7C3AED' },
              { name: 'Radio', c: '#EC4899' },
              { name: 'Loops', c: '#16A34A' },
              { name: 'Logic', c: '#0EA5E9' },
            ].map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-1.5 px-1.5 py-1 bg-[#F8FAFC] border border-black/15"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.c }} />
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="col-span-8 bg-[#EFF6FF] border-2 border-black p-2.5 flex flex-col justify-between gap-2">
            <div className="space-y-2">
              <div className="bg-[#D946EF] text-white text-[10px] font-extrabold p-2 rounded-sm border border-black space-y-1">
                <div>on button A pressed</div>
                <div className="ml-2 bg-[#2563EB] px-2 py-1 rounded-sm border border-black">
                  show icon (Heart ♥)
                </div>
              </div>
              <div className="bg-[#D946EF] text-white text-[10px] font-extrabold p-2 rounded-sm border border-black space-y-1">
                <div>on shake</div>
                <div className="ml-2 bg-[#2563EB] px-2 py-1 rounded-sm border border-black">
                  show number (pick 1..6)
                </div>
              </div>
            </div>
            <div className="bg-[#0F172A] text-[#93C5FD] font-mono text-[10px] px-2.5 py-1.5 border border-black rounded-sm">
              {pattern === 'heart'
                ? 'basic.show_icon(IconNames.HEART)'
                : pattern === 'smile'
                ? 'basic.show_icon(IconNames.HAPPY)'
                : 'basic.show_number(randint(1, 6))'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArcadeShowcasePreview: React.FC = () => {
  const [heroX, setHeroX] = useState(2);
  const [score, setScore] = useState(3);
  const [laser, setLaser] = useState(false);

  const moveHero = (delta: number) => {
    soundEngine.playButtonClick();
    setHeroX((prev) => Math.max(0, Math.min(4, prev + delta)));
  };

  const fireAction = () => {
    soundEngine.playBlockSnap();
    setLaser(true);
    setScore((s) => s + 1);
    window.setTimeout(() => setLaser(false), 320);
  };

  return (
    <div className="bg-[#F8FAFC] text-black select-none">
      {/* Authentic CodeSpark MakeCode Arcade Top Bar */}
      <div className="px-3.5 py-2 bg-[#0F766E] text-white flex items-center justify-between gap-2 text-[11px] font-bold">
        <span className="font-display font-extrabold">CodeSpark · Game Maker Arcade</span>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-white text-[#0F766E] font-extrabold">Blocks</span>
          <span className="px-2 py-0.5 rounded bg-white/15">Python</span>
          <span className="px-2 py-0.5 rounded bg-white/15">Assets 16×16</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-12 gap-3 p-3.5 items-stretch">
        {/* Left: Interactive Teal Handheld Arcade Console */}
        <div className="sm:col-span-5 bg-[#2B8A96] border-2 border-black rounded-xl p-3 flex flex-col justify-between gap-2.5">
          {/* Arcade Screen */}
          <div className="bg-[#0B1220] border-2 border-black rounded p-2.5 text-white space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#FACC15] tabular-nums">
              <span>SCORE {score}</span>
              <span>♥♥♥</span>
            </div>
            <div className="grid grid-cols-5 gap-1 items-center text-center py-2">
              {[0, 1, 2, 3, 4].map((col) => (
                <div key={col} className="flex flex-col items-center justify-between h-14">
                  <span className="text-xs">{col === 2 ? '⭐' : col % 2 === 0 ? '☄️' : '·'}</span>
                  <span className="text-[10px] text-[#38BDF8] font-bold">
                    {laser && col === heroX ? '▲' : ''}
                  </span>
                  <span className="text-sm">{col === heroX ? '🚀' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Handheld D-Pad + A/B Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveHero(-1)}
                className="w-7 h-7 bg-[#1F2937] hover:bg-black text-white border-2 border-black text-xs font-extrabold cursor-pointer"
                aria-label="Geser kiri"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => moveHero(1)}
                className="w-7 h-7 bg-[#1F2937] hover:bg-black text-white border-2 border-black text-xs font-extrabold cursor-pointer"
                aria-label="Geser kanan"
              >
                ▶
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={fireAction}
                className="w-8 h-8 rounded-full bg-[#FFE600] hover:bg-[#FEF08A] text-black border-2 border-black text-xs font-extrabold cursor-pointer"
                aria-label="Tombol A Tembak"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setScore(3);
                  setHeroX(2);
                }}
                className="w-7 h-7 rounded-full bg-[#38BDF8] text-black border-2 border-black text-[11px] font-extrabold cursor-pointer"
                aria-label="Tombol B Reset"
              >
                B
              </button>
            </div>
          </div>
        </div>

        {/* Right: Arcade Toolbox & Blocks */}
        <div className="sm:col-span-7 grid grid-cols-12 gap-2">
          <div className="col-span-4 bg-white border-2 border-black p-1.5 space-y-1 text-[10px] font-extrabold">
            {[
              { name: 'Sprites', c: '#3B82F6' },
              { name: 'Controller', c: '#EA580C' },
              { name: 'Game', c: '#7C3AED' },
              { name: 'Music', c: '#EC4899' },
              { name: 'Scene', c: '#475569' },
              { name: 'Info', c: '#E11D48' },
              { name: 'Loops', c: '#16A34A' },
            ].map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-1.5 px-1.5 py-1 bg-[#F8FAFC] border border-black/15"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.c }} />
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="col-span-8 bg-[#F0FDFA] border-2 border-black p-2.5 flex flex-col justify-between gap-2">
            <div className="space-y-2">
              <div className="bg-[#7C3AED] text-white text-[10px] font-extrabold p-2 rounded-sm border border-black space-y-1">
                <div>on game update every 500 ms</div>
                <div className="ml-2 bg-[#3B82F6] px-2 py-1 rounded-sm border border-black">
                  spawn meteor sprite
                </div>
              </div>
              <div className="bg-[#EA580C] text-white text-[10px] font-extrabold p-2 rounded-sm border border-black space-y-1">
                <div>on A button pressed</div>
                <div className="ml-2 bg-[#E11D48] px-2 py-1 rounded-sm border border-black">
                  fire laser · change score +1
                </div>
              </div>
            </div>
            <div className="bg-[#0F172A] text-[#5EEAD4] font-mono text-[10px] px-2.5 py-1.5 border border-black rounded-sm">
              {'controller.move_sprite(hero, 100, 0)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<Props> = ({ onGoLogin, onGoRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [moduleModalTier, setModuleModalTier] = useState<TierId | null>(null);
  const [activeShowcaseId, setActiveShowcaseId] = useState<ShowcaseId>('studio');
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const [studioImgBroken, setStudioImgBroken] = useState(false);

  const activeSlide =
    SHOWCASE_SLIDES.find((s) => s.id === activeShowcaseId) || SHOWCASE_SLIDES[0];

  const handleCopyTrialCode = () => {
    soundEngine.playButtonClick();
    navigator.clipboard?.writeText('BELAJAR2026');
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-black">
      {/* TOP BAR CONTRACT: 3 Zones (Wordmark — 5 Single-line Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7] border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </span>
            <span>CodeSpark</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
            <a href="#program" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Program
            </a>
            <a href="#media" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Media &amp; Labirin
            </a>
            <a href="#kurikulum" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Kurikulum
            </a>
            <a href="#ekosistem" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Untuk Sekolah
            </a>
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onGoLogin('student');
              }}
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk
            </button>
          </nav>

          <div className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onGoRegister();
              }}
              className="neo-btn bg-[#FFE600] px-4 py-2 text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Daftar Siswa
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden neo-btn bg-[#FFE600] p-2 cursor-pointer"
            aria-label="Menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF7] border-t-2 border-black px-4 py-4 space-y-3">
            <div className="flex flex-col gap-1.5 text-sm font-bold">
              <a href="#program" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                4 Jalur Program Belajar
              </a>
              <a href="#media" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Media Belajar &amp; Labirin Koala
              </a>
              <a href="#kurikulum" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Kurikulum &amp; Modul PDF
              </a>
              <a href="#ekosistem" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Portal Siswa, Instruktur &amp; Admin
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoLogin('student');
                }}
                className="neo-btn bg-white py-2.5 text-sm font-bold cursor-pointer"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoRegister();
                }}
                className="neo-btn bg-[#FFE600] py-2.5 text-sm font-extrabold cursor-pointer"
              >
                Daftar Siswa
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* 1. HERO SECTION — PROPOSITION + INTERACTIVE REAL WORKSPACE SHOWCASE */}
        <section className="neo-grid-bg border-b-[3px] border-black py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700">
                <span>Coding Studio</span>
                <span aria-hidden="true">·</span>
                <span>Labirin Koala</span>
                <span aria-hidden="true">·</span>
                <span>micro:bit</span>
                <span aria-hidden="true">·</span>
                <span>Game Arcade</span>
                <span aria-hidden="true">·</span>
                <span>AI-ML</span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.05rem] font-extrabold leading-[1.08] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Belajar Coding, micro:bit, Game Arcade &amp;{' '}
                <span className="bg-[#FFE600] px-2 border-2 border-black inline-block">
                  AI Interaktif
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-800 leading-relaxed max-w-xl">
                Satu platform belajar pemrograman dari blok visual hingga Python dan JavaScript:
                Coding Studio pulau isometrik, Labirin Koala {TOTAL_KOALA_SUBLEVELS} sub-level,
                simulator papan BBC micro:bit v2, studio MakeCode Game Arcade, hingga kamera AI-ML
                realtime.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoRegister();
                  }}
                  className="neo-btn bg-[#4ADE80] px-6 py-3.5 text-sm sm:text-base font-extrabold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  Mulai Belajar Gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoLogin('student');
                  }}
                  className="neo-btn bg-white px-5 py-3.5 text-sm sm:text-base font-bold cursor-pointer whitespace-nowrap"
                >
                  Masuk ke Kelas
                </button>
              </div>

              {/* Unboxed Quantitative Curriculum Summary */}
              <div className="pt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs sm:text-sm font-bold text-neutral-800 border-t-2 border-black/15 tabular-nums">
                <span>9 Misi Studio</span>
                <span aria-hidden="true">·</span>
                <span>{TOTAL_KOALA_SUBLEVELS} Sub-Level Koala</span>
                <span aria-hidden="true">·</span>
                <span>{APP_MAKER_PROJECTS.length} Proyek micro:bit</span>
                <span aria-hidden="true">·</span>
                <span>{GAME_MAKER_PROJECTS.length} Game Arcade</span>
                <span aria-hidden="true">·</span>
                <span>{AI_ML_PROJECTS.length} Lab AI-ML</span>
              </div>
            </div>

            {/* Interactive Real Workspace Screenshot Showcase */}
            <div className="lg:col-span-7 space-y-3">
              {/* Interactive Workspace Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Pilih pratinjau ruang belajar">
                {SHOWCASE_SLIDES.map((slide) => {
                  const isActive = slide.id === activeSlide.id;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        soundEngine.playButtonClick();
                        setActiveShowcaseId(slide.id);
                      }}
                      className={`px-3.5 py-2 text-xs font-extrabold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'shadow-[3px_3px_0px_0px_#000] -translate-y-0.5 text-black'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                      style={isActive ? { backgroundColor: slide.accentColor } : undefined}
                    >
                      {slide.tabLabel}
                    </button>
                  );
                })}
              </div>

              <div className="neo-card bg-[#23272F] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#1D2129] border-b-2 border-black flex items-center justify-between gap-3 text-white">
                  <span className="text-xs font-extrabold truncate">
                    {activeSlide.headerTitle}
                  </span>
                  {activeShowcaseId === 'studio' && !studioImgBroken ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        setPreviewZoomOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-[#3A414E] hover:bg-[#4B5465] text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      title="Perbesar tampilan layar"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-[#FFE600] whitespace-nowrap shrink-0">
                      Demo Interaktif
                    </span>
                  )}
                </div>

                {activeShowcaseId === 'studio' ? (
                  studioImgBroken ? (
                    <div className="aspect-[16/9] bg-[#2C313A] flex flex-col items-center justify-center p-8 text-center text-white space-y-2">
                      <Code2 className="w-10 h-10 text-[#FFE600]" />
                      <div className="font-display font-extrabold text-lg">
                        {activeSlide.tabLabel}
                      </div>
                      <p className="text-xs text-neutral-300 max-w-md">{activeSlide.caption}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        setPreviewZoomOpen(true);
                      }}
                      className="block w-full bg-[#2C313A] cursor-zoom-in focus:outline-none group"
                      aria-label={`Perbesar pratinjau ${activeSlide.tabLabel}`}
                    >
                      <img
                        src={STUDIO_SCREENSHOT_SRC}
                        alt={STUDIO_SCREENSHOT_ALT}
                        referrerPolicy="no-referrer"
                        onError={() => setStudioImgBroken(true)}
                        className="w-full h-auto block transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                    </button>
                  )
                ) : activeShowcaseId === 'koala' ? (
                  <KoalaShowcasePreview />
                ) : activeShowcaseId === 'microbit' ? (
                  <MicrobitShowcasePreview />
                ) : (
                  <ArcadeShowcasePreview />
                )}

                <div className="px-4 py-2.5 bg-[#FFFDF7] border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-neutral-800">
                  <span>{activeSlide.caption}</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoRegister();
                    }}
                    className="underline font-extrabold hover:text-neutral-600 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Coba Langsung →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 4 PROGRAM BELAJAR LENGKAP — ASYMMETRIC BENTO SHOWCASE */}
        <section id="program" className="py-16 sm:py-20 border-b-[3px] border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                Empat Jalur Pembelajaran Terpadu
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Dari Logika Algoritma hingga micro:bit, Game Arcade, dan Kamera AI Realtime
              </h2>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                Setiap siswa memulai dari Coding Studio sebagai pondasi wajib, lalu dapat membuka
                program lanjutan MakeCode micro:bit Lab, MakeCode Game Arcade, serta AI-ML Vision
                melalui kode akses atau aktivasi Admin.
              </p>
            </div>

            {/* Row 1: Coding Studio (7 cols) + AI-ML Vision (5 cols) */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* 01. Coding Studio */}
              <div className="lg:col-span-7 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#4ADE80] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <Code2 className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        01. Program Wajib · 9 Level Bertingkat
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">
                        Coding Studio Isometrik
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Susun blok puzzle dengan drag-and-drop atau ketik langsung di editor Python dan
                    JavaScript. Dilengkapi <strong>Penggaris Jarak</strong> untuk mengukur langkah,{' '}
                    <strong>Step-by-Step Debugger</strong>, sorotan blok aktif, narasi suara Bahasa
                    Indonesia, dan 3 karakter petualang yang berganti di setiap stage.
                  </p>

                  {/* 3 Stage Characters Strip */}
                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    {DEMO_CHARACTERS.map((cid, i) => {
                      const meta = CHARACTER_META[cid];
                      return (
                        <div
                          key={cid}
                          className="p-3 bg-white border-2 border-black flex items-center gap-2.5"
                        >
                          <MascotPortrait
                            character={cid}
                            className="w-10 h-10 shrink-0"
                            mood="happy"
                          />
                          <div className="min-w-0">
                            <div className="font-display font-extrabold text-sm">{meta.name}</div>
                            <div className="text-[11px] text-neutral-600 truncate">
                              Stage {i + 1}, {i + 4}, {i + 7}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black/15 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                  <span className="text-neutral-700">
                    Blocks · Python (.py) · JavaScript (.js) · Sertifikat Otomatis
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoRegister();
                    }}
                    className="underline hover:text-neutral-600 cursor-pointer whitespace-nowrap"
                  >
                    Coba Level 1 Gratis →
                  </button>
                </div>
              </div>

              {/* 02. AI-ML Vision */}
              <div className="lg:col-span-5 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#FDBA74] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <Cpu className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        02. Program Pilihan · {AI_ML_PROJECTS.length} Lab Vision
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">AI-ML Vision Kamera</h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Eksperimen Computer Vision langsung dari kamera perangkat asli dengan performa
                    realtime menggunakan MediaPipe Face Landmarker &amp; filter citra langsung di
                    browser.
                  </p>

                  <div className="space-y-2.5">
                    {AI_ML_PROJECTS.map((proj) => (
                      <div key={proj.id} className="p-3 bg-white border-2 border-black space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-extrabold text-sm">{proj.title}</span>
                          <span className="font-mono text-[11px] font-bold text-neutral-600">
                            {proj.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 leading-snug">{proj.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black/15 flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-black shrink-0" />
                    Kamera Live · Unggah Foto · Sampel
                  </span>
                  <span>Bertahap</span>
                </div>
              </div>
            </div>

            {/* Row 2: MakeCode micro:bit Lab (6 cols) + MakeCode Game Maker Arcade (6 cols) */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* 03. MakeCode micro:bit Lab */}
              <div className="lg:col-span-6 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#60A5FA] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <CircuitBoard className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        03. Program Pilihan · {APP_MAKER_PROJECTS.length} Proyek Hardware
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">
                        MakeCode micro:bit Lab
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Program papan mikrokontroler BBC micro:bit v2 menggunakan Blocks, JavaScript
                    &amp; Python: matriks LED 5×5 interaktif, tombol A/B, Logo sentuh, Pin 0–2,
                    akselerometer (Shake), speaker piezo, sensor suhu &amp; cahaya, serta Radio.
                  </p>

                  <ol className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    {APP_MAKER_PROJECTS.map((proj) => (
                      <li
                        key={proj.id}
                        className="p-2.5 bg-white border-2 border-black flex items-start gap-2"
                      >
                        <span className="font-mono font-extrabold text-neutral-500 tabular-nums">
                          0{proj.order}
                        </span>
                        <div>
                          <div className="font-display font-extrabold text-sm leading-tight">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                            {proj.subtitle}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-3 border-t-2 border-black/15 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-neutral-700">
                  <span>Simulator micro:bit v2 · Blocks / JS / Python · Sertifikat</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setActiveShowcaseId('microbit');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="underline text-black hover:text-neutral-600 cursor-pointer whitespace-nowrap"
                  >
                    Lihat Tampilan →
                  </button>
                </div>
              </div>

              {/* 04. MakeCode Game Maker Arcade */}
              <div className="lg:col-span-6 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#38BDF8] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        04. Program Pilihan · {GAME_MAKER_PROJECTS.length} Game Bertahap
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">
                        MakeCode Game Maker Arcade
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Bangun lima game arcade di IDE bergaya MakeCode Arcade lengkap dengan konsol
                    handheld (D-Pad, tombol A/B), blok &amp; kode JavaScript/Python dua arah, serta
                    Editor Sprite Piksel 16×16.
                  </p>

                  <ol className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    {GAME_MAKER_PROJECTS.map((proj) => (
                      <li
                        key={proj.id}
                        className="p-2.5 bg-white border-2 border-black flex items-start gap-2"
                      >
                        <span className="font-mono font-extrabold text-neutral-500 tabular-nums">
                          0{proj.order}
                        </span>
                        <div>
                          <div className="font-display font-extrabold text-sm leading-tight">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                            {proj.subtitle}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-3 border-t-2 border-black/15 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-neutral-700">
                  <span>Konsol Handheld · Editor Piksel · Blocks / JS / Python</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setActiveShowcaseId('arcade');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="underline text-black hover:text-neutral-600 cursor-pointer whitespace-nowrap"
                  >
                    Lihat Tampilan →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PUSAT MEDIA BELAJAR INTERAKTIF + LABIRIN KOALA (4 LEVEL · 18 SUB-LEVEL) */}
        <section id="media" className="py-16 sm:py-20 border-b-[3px] border-black bg-[#FFFDF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs sm:text-sm font-bold text-neutral-600">
                  Pusat Media Belajar Interaktif · 6 Unit + Labirin Koala
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Pahami Konsep Lewat Slide, Labirin Koala, Kuis &amp; Modul PDF
                </h2>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                  Sebelum masuk ke proyek besar, siswa melatih logika pemrograman melalui media
                  belajar interaktif dan latihan blok bertahap di Labirin Koala.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setModuleModalTier('pemula');
                }}
                className="neo-btn bg-[#38BDF8] px-4 py-2.5 text-sm font-extrabold inline-flex items-center gap-2 self-start lg:self-auto cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                Pratinjau Modul PDF
              </button>
            </div>

            {/* Featured Spotlight: Labirin Koala (4 Level · 18 Sub-Level) */}
            <div className="neo-card bg-white p-6 sm:p-7 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-[#E0F2FE] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                    <MascotPortrait character="koala" className="w-12 h-12" mood="happy" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-600 tabular-nums">
                      Materi Latihan Blok Klasik · {KOALA_MAZE_LEVELS.length} Level ·{' '}
                      {TOTAL_KOALA_SUBLEVELS} Sub-Level
                    </div>
                    <h3 className="font-display text-2xl font-extrabold">
                      Labirin Koala (Classic Maze)
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setActiveShowcaseId('koala');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="neo-btn bg-[#FFE600] px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 self-start md:self-auto cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-4 h-4" />
                  Lihat Pratinjau Labirin
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {KOALA_MAZE_LEVELS.map((grp) => (
                  <div
                    key={grp.levelNumber}
                    className="p-4 bg-[#FFFDF7] border-2 border-black flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs font-extrabold tabular-nums">
                        <span className="font-mono text-neutral-600">Level 0{grp.levelNumber}</span>
                        <span>{grp.subLevels.length} Sub-Level</span>
                      </div>
                      <h4 className="font-display font-extrabold text-base leading-snug">
                        {grp.concept}
                      </h4>
                      <p className="text-xs text-neutral-700 leading-relaxed">{grp.description}</p>
                    </div>
                    <div className="pt-2 border-t border-black/15 text-[11px] font-bold text-neutral-600">
                      Batas blok optimal · Pratinjau JS
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Media Tools Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: '01',
                  title: 'Slide Konsep Animasi',
                  desc: 'Visualisasi urutan langkah, kompas belok, loop, sensor if/else, papan micro:bit, hingga pipeline AI dengan narasi suara Bahasa Indonesia.',
                  color: '#FFE600',
                  icon: Presentation,
                },
                {
                  num: '02',
                  title: 'Lab Mini Perintah',
                  desc: 'Papan latihan cepat 5×3 untuk mencoba blok forward dan turn sambil melihat perubahan kode Python & JavaScript secara langsung.',
                  color: '#4ADE80',
                  icon: FlaskConical,
                },
                {
                  num: '03',
                  title: 'Kuis Pemahaman 3★',
                  desc: 'Evaluasi pilihan ganda interaktif per unit dengan pembahasan instan untuk menguji pemahaman sebelum masuk ke tantangan utama.',
                  color: '#C084FC',
                  icon: ClipboardCheck,
                },
                {
                  num: '04',
                  title: 'Modul Singkat PDF',
                  desc: 'Ringkasan materi bergaya buku kerja yang rapi dan siap cetak PDF untuk pendampingan di kelas maupun di rumah.',
                  color: '#38BDF8',
                  icon: BookOpen,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className="neo-card bg-white p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-11 h-11 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-mono text-sm font-extrabold text-neutral-500 tabular-nums">
                          {item.num}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-extrabold">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. KURIKULUM 3 TINGKATAN STUDIO + PRATINJAU MODUL LANGSUNG */}
        <section id="kurikulum" className="py-16 sm:py-20 border-b-[3px] border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                Jalur Petualangan Coding Studio
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Tiga Tingkatan Terstruktur dari Nol hingga AI Navigator
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <div key={tier.id} className="neo-card bg-[#FFFDF7] flex flex-col justify-between">
                  <div>
                    <div
                      className="px-5 py-4 border-b-[3px] border-black flex items-center justify-between gap-2"
                      style={{ backgroundColor: tier.accentColor }}
                    >
                      <span className="font-display font-extrabold text-lg">
                        {tier.number}. {tier.name}
                      </span>
                      <span className="font-mono text-xs font-extrabold">{tier.badgeText}</span>
                    </div>
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-display text-xl font-extrabold">{tier.subtitle}</h3>
                      <p className="text-sm text-neutral-700 leading-relaxed">{tier.description}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2">
                    <div className="border-t-2 border-black/15 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          setModuleModalTier(tier.id);
                        }}
                        className="neo-btn bg-white hover:bg-[#FFE600] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Baca Modul PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          onGoRegister();
                        }}
                        className="underline hover:text-neutral-600 cursor-pointer"
                      >
                        Ikuti Kelas →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. EKOSISTEM 3 PERAN REALTIME (SISWA, INSTRUKTUR, ADMIN) */}
        <section id="ekosistem" className="py-16 sm:py-20 border-b-[3px] border-black bg-[#FFFDF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                Terhubung Realtime dengan Cloud Firestore
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Satu Ekosistem untuk Siswa, Instruktur, dan Administrator
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  role: 'Siswa',
                  accent: '#4ADE80',
                  icon: GraduationCap,
                  points: [
                    `Peta kursus, Labirin Koala (${TOTAL_KOALA_SUBLEVELS} sub-level), dan Coding Studio isometrik lengkap dengan perolehan 3 bintang.`,
                    'Akses Media Belajar, Modul PDF, serta proyek pilihan micro:bit Lab, Game Arcade & AI-ML Vision.',
                    'Sertifikat kelulusan bernomor unik terbit otomatis & siap cetak PDF untuk setiap program.',
                  ],
                  actionLabel: 'Masuk Portal Siswa',
                  onClick: () => onGoLogin('student'),
                },
                {
                  role: 'Instruktur',
                  accent: '#38BDF8',
                  icon: Users,
                  points: [
                    'Buat kode akses kelas khusus dengan pilihan paket program (Studio, micro:bit, Game Arcade, AI-ML).',
                    'Pantau kemajuan bintang, proyek selesai, dan sertifikat seluruh siswa binaan secara realtime.',
                    'Evaluasi capaian tiap tingkatan dengan grafik analitik kelas.',
                  ],
                  actionLabel: 'Portal Instruktur',
                  onClick: () => onGoLogin('instructor'),
                },
                {
                  role: 'Administrator',
                  accent: '#C084FC',
                  icon: ShieldCheck,
                  points: [
                    'Pratinjau penuh seluruh materi, slide media, Labirin Koala, Coding Studio L1–L9, micro:bit, Game Arcade & AI-ML yang semuanya terbuka.',
                    'Kelola akun instruktur, kode akses global, serta buka atau kunci akses program siswa secara manual.',
                    'Dashboard analitik sekolah realtime dengan grafik Recharts & pengaturan kontak upgrade.',
                  ],
                  actionLabel: 'Portal Admin',
                  onClick: () => onGoLogin('admin'),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.role}
                    className="neo-card bg-white p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: item.accent }}
                        >
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="font-display text-xl font-extrabold">Portal {item.role}</h3>
                      </div>

                      <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed list-disc pl-4">
                        {item.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        item.onClick();
                      }}
                      className="neo-btn bg-[#FFFDF7] hover:bg-[#FFE600] w-full py-2.5 px-4 text-xs sm:text-sm font-extrabold cursor-pointer"
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. KONVERSI & KODE UJI COBA */}
        <section id="cara-bergabung" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="neo-card bg-[#FFE600] p-6 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-neutral-900">
                  <Award className="w-4 h-4" />
                  <span>Sertifikat Resmi Otomatis</span>
                  <span aria-hidden="true">·</span>
                  <BarChart3 className="w-4 h-4" />
                  <span>Sinkronisasi Cloud Realtime</span>
                </div>

                <h2
                  className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Siap Belajar Coding, micro:bit, Game Arcade &amp; AI Hari Ini?
                </h2>

                <p className="text-sm sm:text-base font-medium text-neutral-900 leading-relaxed max-w-2xl">
                  Daftar menggunakan Kode Akses Kelas Penuh dari Admin/Instruktur Anda, atau langsung
                  coba Coding Studio Level 1, Labirin Koala, dan Media Belajar dengan kode uji coba
                  bawaan berikut.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-600">Kode Uji Coba (L1):</span>
                    <code className="font-mono font-extrabold text-base tracking-wider">BELAJAR2026</code>
                    <button
                      type="button"
                      onClick={handleCopyTrialCode}
                      className="p-1.5 border-2 border-black bg-[#4ADE80] hover:bg-[#4ADE80]/80 cursor-pointer"
                      title="Salin kode uji coba"
                      aria-label="Salin kode uji coba"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoRegister();
                  }}
                  className="neo-btn bg-black text-white px-6 py-4 text-sm sm:text-base font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  Daftar Akun Siswa Sekarang
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoLogin('instructor');
                    }}
                    className="neo-btn bg-white text-black px-4 py-3 text-xs sm:text-sm font-extrabold cursor-pointer"
                  >
                    Portal Instruktur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoLogin('admin');
                    }}
                    className="neo-btn bg-[#38BDF8] text-black px-4 py-3 text-xs sm:text-sm font-extrabold cursor-pointer"
                  >
                    Portal Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t-[3px] border-black bg-[#FFFDF7] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-[#FFE600] border-2 border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-display text-base font-extrabold">CodeSpark</span>
            <span className="text-neutral-500 font-normal">· CodeQuest Studio</span>
          </div>
          <p className="text-neutral-800 text-center sm:text-right">
            © 2026 CodeSpark · @copyright Pak GuruAI
          </p>
        </div>
      </footer>

      {previewZoomOpen && !studioImgBroken && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomOpen(false)}
        >
          <div
            className="neo-card bg-[#23272F] w-full max-w-6xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-[#1D2129] border-b-2 border-black flex items-center justify-between gap-3 text-white">
              <span className="font-display font-extrabold text-sm">
                Pratinjau Penuh — CodeSpark Coding Studio (Blocks, Python &amp; JavaScript)
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoomOpen(false)}
                className="neo-btn bg-[#FFE600] text-black p-1.5 cursor-pointer"
                aria-label="Tutup pratinjau penuh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-[#2C313A] max-h-[82vh] overflow-auto">
              <img
                src={STUDIO_SCREENSHOT_SRC}
                alt={STUDIO_SCREENSHOT_ALT}
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      )}

      {moduleModalTier && (
        <ModuleGuideModal initialTier={moduleModalTier} onClose={() => setModuleModalTier(null)} />
      )}
    </div>
  );
};
