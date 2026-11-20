import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Printer,
  Code2,
  Blocks,
  HelpCircle,
  ArrowRight,
  RotateCw,
  Presentation,
  FlaskConical,
  ClipboardCheck,
  FileText,
} from 'lucide-react';
import type { Direction, TierId } from '../types';
import {
  LEARNING_MEDIA_UNITS,
  getLearningMediaUnit,
  type LearningMediaUnit,
  type MediaConceptSlide,
  type MediaUnitId,
} from '../data/learningMedia';
import { MascotPortrait } from './PandaMascot';
import { soundEngine } from '../engine/soundEngine';

interface Props {
  initialUnit?: MediaUnitId;
  onLaunchUnit?: (unitId: MediaUnitId) => void;
  onOpenPrintableModule?: (tier: TierId) => void;
  isAdminPreview?: boolean;
}

type MediaTab = 'slides' | 'sandbox' | 'quiz' | 'sheet';
type CodePreviewLang = 'blocks' | 'python' | 'javascript';

// ===================== INTERACTIVE CONCEPT VISUALIZERS =====================

const SlideVisualStage: React.FC<{ slide: MediaConceptSlide }> = ({ slide }) => {
  const [animStep, setAnimStep] = useState(0);
  const [sensorBlocked, setSensorBlocked] = useState(false);

  useEffect(() => {
    setAnimStep(0);
    setSensorBlocked(false);
    const id = window.setInterval(() => {
      setAnimStep((s) => (s + 1) % 4);
    }, 1150);
    return () => window.clearInterval(id);
  }, [slide.id]);

  if (slide.visualKind === 'sequence_grid') {
    return (
      <div className="bg-gradient-to-b from-[#2C3E50] to-[#1F4A2C] border-2 border-black p-4 space-y-3 text-white">
        <div className="flex items-center justify-between text-xs font-bold text-[#F5E3B3]">
          <span>Simulasi Urutan Langkah</span>
          <span className="font-mono tabular-nums">Langkah {animStep + 1} / 4</span>
        </div>
        <div className="grid grid-cols-5 gap-2 py-2">
          {[0, 1, 2, 3, 4].map((col) => {
            const isActive = col === animStep + 1;
            const isVisited = col <= animStep;
            const isGoal = col === 4;
            return (
              <div
                key={col}
                className={`h-16 rounded border-2 flex flex-col items-center justify-center relative transition-transform duration-200 ${
                  isGoal
                    ? 'bg-[#FEF08A] border-[#B45309] text-black'
                    : isVisited
                      ? 'bg-[#86EFAC] border-[#15803D] text-black'
                      : 'bg-[#E2E8F0] border-[#475569] text-slate-700'
                } ${isActive ? 'scale-105 ring-2 ring-[#FFE600]' : ''}`}
              >
                {isActive ? (
                  <MascotPortrait character={slide.character} className="w-12 h-12" mood="happy" />
                ) : isGoal ? (
                  <span className="font-display font-extrabold text-xs">FINIS</span>
                ) : (
                  <span className="font-mono text-xs font-extrabold">{col}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-[11px] font-mono text-[#A7F3D0] text-center">
          forward(4) memindahkan karakter tepat 4 petak dari posisi 0 → 4
        </div>
      </div>
    );
  }

  if (slide.visualKind === 'rotation_compass') {
    const dirs = [
      { label: 'Utara (↑)', deg: 0 },
      { label: 'Barat (←)', deg: -90 },
      { label: 'Selatan (↓)', deg: 180 },
      { label: 'Timur (→)', deg: 90 },
    ];
    const current = dirs[animStep % 4];
    return (
      <div className="bg-gradient-to-b from-[#3B2314] to-[#1F3A2B] border-2 border-black p-4 text-white flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-between text-xs font-bold text-[#F5E3B3]">
          <span>Kompas Rotasi 90°</span>
          <span className="font-mono">{current.label}</span>
        </div>
        <div className="relative w-36 h-36 rounded-full bg-[#F5E0A3] border-[3px] border-[#5C2A0E] flex items-center justify-center">
          <span className="absolute top-1.5 text-[10px] font-extrabold text-[#5C2A0E]">U</span>
          <span className="absolute bottom-1.5 text-[10px] font-extrabold text-[#5C2A0E]">S</span>
          <span className="absolute left-2 text-[10px] font-extrabold text-[#5C2A0E]">B</span>
          <span className="absolute right-2 text-[10px] font-extrabold text-[#5C2A0E]">T</span>
          <div
            className="transition-transform duration-300 flex flex-col items-center"
            style={{ transform: `rotate(${current.deg}deg)` }}
          >
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-[#DC2626] mb-0.5" />
            <MascotPortrait character={slide.character} className="w-16 h-16" mood="happy" />
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#FFE600]">
          turn(&quot;left&quot;) memutar arah hadap di tempat tanpa berpindah petak
        </div>
      </div>
    );
  }

  if (slide.visualKind === 'loop_compressor') {
    return (
      <div className="bg-[#1E1F26] border-2 border-black p-4 text-white space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#FFE600]">
          <span>Kompresi Kode dengan Loop</span>
          <span className="font-mono text-[#4ADE80]">Hemat 60% Baris</span>
        </div>
        <div className="grid grid-cols-11 items-center gap-2">
          <div className="col-span-5 p-2.5 bg-white/10 border border-white/20 font-mono text-[11px] space-y-0.5 text-rose-300">
            <div className="text-[10px] text-neutral-400 font-sans font-bold mb-1">Tanpa Loop (5 baris)</div>
            <div>forward(1)</div>
            <div>forward(1)</div>
            <div>forward(1)</div>
            <div>forward(1)</div>
            <div>forward(1)</div>
          </div>
          <div className="col-span-1 flex justify-center">
            <ArrowRight className="w-5 h-5 text-[#FFE600]" />
          </div>
          <div className="col-span-5 p-2.5 bg-[#4ADE80]/15 border-2 border-[#4ADE80] font-mono text-[11px] space-y-1 text-[#4ADE80]">
            <div className="text-[10px] text-[#FFE600] font-sans font-bold mb-1">
              Dengan Loop (2 baris · 3★)
            </div>
            <div>for i in range(5):</div>
            <div className="pl-3">forward(1)</div>
            <div className="pt-1 text-[10px] text-white font-sans">
              Putaran aktif: <strong className="text-[#FFE600] tabular-nums">#{animStep + 1}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slide.visualKind === 'ifelse_sensor') {
    return (
      <div className="bg-[#1F2937] border-2 border-black p-4 text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#38BDF8]">
            Uji Sensor Interaktif: path_clear()
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setSensorBlocked((v) => !v);
            }}
            className={`px-2.5 py-1 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
              sensorBlocked ? 'bg-[#FB7185] text-black' : 'bg-[#4ADE80] text-black'
            }`}
          >
            {sensorBlocked ? 'Ada Batu di Depan (False)' : 'Jalan Aman (True)'} — Klik Ubah
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div
            className={`p-3 border-2 transition-all ${
              !sensorBlocked
                ? 'bg-[#4ADE80] text-black border-black font-extrabold'
                : 'bg-white/5 text-neutral-400 border-white/15'
            }`}
          >
            <div className="font-mono text-[11px] mb-1">if path_clear():</div>
            <div>Jalan aman → forward(1)</div>
          </div>
          <div
            className={`p-3 border-2 transition-all ${
              sensorBlocked
                ? 'bg-[#FFE600] text-black border-black font-extrabold'
                : 'bg-white/5 text-neutral-400 border-white/15'
            }`}
          >
            <div className="font-mono text-[11px] mb-1">else:</div>
            <div>Ada batu → turn(&quot;left&quot;)</div>
          </div>
        </div>
      </div>
    );
  }

  if (slide.visualKind === 'pattern_stairs') {
    const stairCells = [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const activeCell = stairCells[animStep % stairCells.length];
    return (
      <div className="bg-gradient-to-b from-[#23395B] to-[#1D4E3E] border-2 border-black p-4 text-white space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#F5E3B3]">
          <span>Pola Anak Tangga Berulang</span>
          <span className="font-mono">Maju → Kiri → Maju → Kanan</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 max-w-[260px] mx-auto">
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => {
              const onPath = stairCells.some((c) => c.x === col && c.y === row);
              const isChar = activeCell.x === col && activeCell.y === row;
              return (
                <div
                  key={`${col}-${row}`}
                  className={`h-11 rounded border flex items-center justify-center ${
                    isChar
                      ? 'bg-[#FFE600] border-black text-black'
                      : onPath
                        ? 'bg-[#86EFAC] border-[#166534] text-black'
                        : 'bg-white/10 border-white/15'
                  }`}
                >
                  {isChar ? (
                    <MascotPortrait character={slide.character} className="w-9 h-9" mood="happy" />
                  ) : onPath ? (
                    <span className="w-2 h-2 rounded-full bg-[#166534]" />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Pipeline diagrams for Sense-Plan-Act, App Maker, Game Maker, and AI-ML
  const pipelineSteps =
    slide.visualKind === 'sense_plan_act'
      ? [
          { title: '1. SENSE', desc: 'Pindai kotak depan', color: '#38BDF8' },
          { title: '2. PLAN', desc: 'Pilih maju / belok', color: '#FFE600' },
          { title: '3. ACT', desc: 'Gerakkan karakter', color: '#4ADE80' },
        ]
      : slide.visualKind === 'app_architecture'
        ? [
            { title: '1. UI INPUT', desc: 'Tombol & Slider', color: '#38BDF8' },
            { title: '2. STATE', desc: 'Ubah data aktif', color: '#FFE600' },
            { title: '3. RENDER', desc: 'Perbarui layar', color: '#C084FC' },
          ]
        : slide.visualKind === 'game_loop'
          ? [
              { title: '1. KONTROL', desc: 'Baca tombol pemain', color: '#38BDF8' },
              { title: '2. FISIKA', desc: 'Geser & cek tabrakan', color: '#FFE600' },
              { title: '3. GAMBAR', desc: 'Render 60 FPS', color: '#4ADE80' },
            ]
          : [
              { title: '1. KAMERA', desc: 'Tangkap piksel RGB', color: '#38BDF8' },
              { title: '2. MODEL ML', desc: 'Sobel / 478 Mesh', color: '#FDBA74' },
              { title: '3. OUTPUT', desc: 'Kartun / Filter AR', color: '#4ADE80' },
            ];

  return (
    <div className="bg-[#1E1F26] border-2 border-black p-4 text-white space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-[#F5E3B3]">
        <span>Alur Sistem Berjalan</span>
        <span className="font-mono tabular-nums">Tahap {(animStep % 3) + 1} / 3</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {pipelineSteps.map((st, idx) => {
          const active = animStep % 3 === idx;
          return (
            <div
              key={st.title}
              className={`p-3 border-2 transition-transform duration-200 text-center ${
                active ? 'scale-105 text-black border-black' : 'bg-white/10 text-white border-white/20'
              }`}
              style={{ backgroundColor: active ? st.color : undefined }}
            >
              <div className="font-display font-extrabold text-xs">{st.title}</div>
              <div className={`text-[11px] mt-1 ${active ? 'text-black/85 font-bold' : 'text-neutral-300'}`}>
                {st.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===================== MINI COMMAND SANDBOX (TRY-IT PLAYGROUND) =====================

type MiniCmd =
  | { kind: 'forward'; steps: number }
  | { kind: 'turn'; dir: 'left' | 'right' };

const MiniCommandSandbox: React.FC<{ promptText: string }> = ({ promptText }) => {
  const [cmds, setCmds] = useState<MiniCmd[]>([
    { kind: 'forward', steps: 2 },
    { kind: 'turn', dir: 'left' },
    { kind: 'forward', steps: 1 },
  ]);
  const [pos, setPos] = useState<{ x: number; y: number; dir: Direction }>({
    x: 0,
    y: 2,
    dir: 'E',
  });
  const [running, setRunning] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [note, setNote] = useState('Klik "Jalankan" untuk mencoba rangkaian blok di grid mini!');

  const rotateDir = (d: Direction, turn: 'left' | 'right'): Direction => {
    const order: Direction[] = ['N', 'E', 'S', 'W'];
    const idx = order.indexOf(d);
    return order[(idx + (turn === 'right' ? 1 : 3)) % 4];
  };

  const resetSandbox = () => {
    setPos({ x: 0, y: 2, dir: 'E' });
    setActiveIdx(null);
    setRunning(false);
    setNote('Posisi karakter dikembalikan ke petak awal (0, 2).');
  };

  const runSandbox = () => {
    if (running || cmds.length === 0) return;
    soundEngine.playButtonClick();
    setRunning(true);

    const steps: { x: number; y: number; dir: Direction; cmdIdx: number; label: string }[] = [];
    let cx = 0;
    let cy = 2;
    let cdir: Direction = 'E';

    cmds.forEach((cmd, idx) => {
      if (cmd.kind === 'turn') {
        cdir = rotateDir(cdir, cmd.dir);
        steps.push({
          x: cx,
          y: cy,
          dir: cdir,
          cmdIdx: idx,
          label: `turn("${cmd.dir}") → menghadap ${cdir}`,
        });
      } else {
        for (let s = 0; s < cmd.steps; s++) {
          const nx = cx + (cdir === 'E' ? 1 : cdir === 'W' ? -1 : 0);
          const ny = cy + (cdir === 'S' ? 1 : cdir === 'N' ? -1 : 0);
          if (nx >= 0 && nx < 5 && ny >= 0 && ny < 3) {
            cx = nx;
            cy = ny;
          }
          steps.push({
            x: cx,
            y: cy,
            dir: cdir,
            cmdIdx: idx,
            label: `forward(${cmd.steps}) → posisi (${cx}, ${cy})`,
          });
        }
      }
    });

    setPos({ x: 0, y: 2, dir: 'E' });
    steps.forEach((st, i) => {
      window.setTimeout(() => {
        setPos({ x: st.x, y: st.y, dir: st.dir });
        setActiveIdx(st.cmdIdx);
        setNote(st.label);
        soundEngine.playStep();
        if (i === steps.length - 1) {
          setRunning(false);
          soundEngine.playGemCollect();
        }
      }, (i + 1) * 340);
    });
  };

  const pythonText = cmds
    .map((c) => (c.kind === 'forward' ? `forward(${c.steps})` : `turn("${c.dir}")`))
    .join('\n');
  const jsText = cmds
    .map((c) => (c.kind === 'forward' ? `forward(${c.steps});` : `turn("${c.dir}");`))
    .join('\n');

  const dirArrow: Record<Direction, string> = { N: '↑', E: '→', S: '↓', W: '←' };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#FFF5D6] border-2 border-[#7C4A22] text-xs font-semibold text-[#4A2508]">
        {promptText}
      </div>

      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Left: Mini Parchment Block Builder */}
        <div className="lg:col-span-5 cm-parchment border-[3px] border-[#5C2A0E] p-4 space-y-3">
          <div className="text-xs font-extrabold text-[#5C3210]">
            Klik Blok untuk Menambahkan (Maks 6):
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={cmds.length >= 6}
              onClick={() => {
                soundEngine.playBlockSnap();
                setCmds((p) => [...p, { kind: 'forward', steps: 1 }]);
              }}
              className="px-2.5 py-1.5 rounded bg-[#2B8EF2] border-2 border-[#1A65B5] text-white font-display text-xs font-extrabold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
            >
              forward 1 <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={cmds.length >= 6}
              onClick={() => {
                soundEngine.playBlockSnap();
                setCmds((p) => [...p, { kind: 'forward', steps: 2 }]);
              }}
              className="px-2.5 py-1.5 rounded bg-[#2B8EF2] border-2 border-[#1A65B5] text-white font-display text-xs font-extrabold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
            >
              forward 2 <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={cmds.length >= 6}
              onClick={() => {
                soundEngine.playBlockSnap();
                setCmds((p) => [...p, { kind: 'turn', dir: 'left' }]);
              }}
              className="px-2.5 py-1.5 rounded bg-[#F3C043] border-2 border-[#BD8D1B] text-[#3B2305] font-display text-xs font-extrabold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
            >
              turn left <RotateCw className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={cmds.length >= 6}
              onClick={() => {
                soundEngine.playBlockSnap();
                setCmds((p) => [...p, { kind: 'turn', dir: 'right' }]);
              }}
              className="px-2.5 py-1.5 rounded bg-[#F3C043] border-2 border-[#BD8D1B] text-[#3B2305] font-display text-xs font-extrabold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
            >
              turn right <RotateCw className="w-3 h-3" />
            </button>
          </div>

          <div className="pt-2 space-y-1.5">
            <div className="inline-block px-3 py-1 rounded-t-lg rounded-b bg-[#57B832] border border-[#2D6E14] text-white font-display font-extrabold text-xs">
              START
            </div>
            {cmds.length === 0 ? (
              <div className="p-3 border border-dashed border-[#8C5A2B] text-xs text-[#6E441E]">
                Belum ada blok. Klik salah satu blok di atas.
              </div>
            ) : (
              cmds.map((c, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-1.5 rounded border-2 font-display text-xs font-extrabold transition-transform ${
                    c.kind === 'forward'
                      ? 'bg-[#2B8EF2] border-[#1A65B5] text-white'
                      : 'bg-[#F3C043] border-[#BD8D1B] text-[#3B2305]'
                  } ${activeIdx === idx ? 'ring-2 ring-[#FFE600] scale-[1.02]' : ''}`}
                >
                  <span>
                    {c.kind === 'forward' ? `forward(${c.steps})` : `turn("${c.dir}")`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBlockDelete();
                      setCmds((p) => p.filter((_, i) => i !== idx));
                    }}
                    className="px-1.5 py-0.5 rounded bg-black/25 text-white text-[10px] cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={running || cmds.length === 0}
              onClick={runSandbox}
              className="neo-btn bg-[#4ADE80] px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Jalankan
            </button>
            <button
              type="button"
              onClick={resetSandbox}
              className="neo-btn bg-white px-3 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setCmds([]);
                resetSandbox();
              }}
              className="neo-btn bg-[#FFE600] px-3 py-2 text-xs font-extrabold cursor-pointer"
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Right: Mini Grid Stage + Live Code Sync */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-gradient-to-b from-[#2B4C35] to-[#1F3A28] border-[3px] border-black p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#F5E3B3]">
              <span>Arena Latihan Mini (5 × 3)</span>
              <span className="font-mono text-[#FFE600]">
                Arah: {dirArrow[pos.dir]} · Posisi ({pos.x}, {pos.y})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2].map((row) =>
                [0, 1, 2, 3, 4].map((col) => {
                  const isPanda = pos.x === col && pos.y === row;
                  const isStar = col === 2 && row === 1;
                  return (
                    <div
                      key={`${col}-${row}`}
                      className={`h-16 rounded border-2 flex flex-col items-center justify-center relative ${
                        isStar
                          ? 'bg-[#FEF08A] border-[#B45309]'
                          : 'bg-[#E2E8F0] border-[#64748B]'
                      } ${isPanda ? 'ring-2 ring-[#FFE600]' : ''}`}
                    >
                      {isPanda ? (
                        <div className="flex flex-col items-center">
                          <MascotPortrait character="panda" className="w-11 h-11" mood="happy" />
                          <span className="text-[10px] font-mono font-extrabold text-black -mt-1">
                            {dirArrow[pos.dir]}
                          </span>
                        </div>
                      ) : isStar ? (
                        <Star className="w-5 h-5 fill-[#F59E0B] text-[#78350F]" />
                      ) : (
                        <span className="font-mono text-[10px] text-slate-500">
                          {col},{row}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-xs font-semibold text-white bg-black/40 px-3 py-1.5 rounded">
              {note}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-[#1E1F26] border-2 border-black p-3 font-mono text-xs text-[#7CE38B]">
              <div className="text-[10px] text-neutral-400 font-sans font-bold mb-1">
                Sinkronisasi Python
              </div>
              <pre className="whitespace-pre-wrap">{pythonText || '# kosong'}</pre>
            </div>
            <div className="bg-[#1E1F26] border-2 border-black p-3 font-mono text-xs text-[#FDE047]">
              <div className="text-[10px] text-neutral-400 font-sans font-bold mb-1">
                Sinkronisasi JavaScript
              </div>
              <pre className="whitespace-pre-wrap">{jsText || '// kosong'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN LEARNING MEDIA HUB =====================

export const LearningMediaHub: React.FC<Props> = ({
  initialUnit = 'pemula',
  onLaunchUnit,
  onOpenPrintableModule,
  isAdminPreview = false,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<MediaUnitId>(initialUnit);
  const [activeTab, setActiveTab] = useState<MediaTab>('slides');
  const [slideIdx, setSlideIdx] = useState(0);
  const [codeLang, setCodeLang] = useState<CodePreviewLang>('blocks');
  const [speaking, setSpeaking] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const unit: LearningMediaUnit = getLearningMediaUnit(selectedUnitId);
  const slide = unit.slides[Math.min(slideIdx, unit.slides.length - 1)] || unit.slides[0];

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const handleChangeUnit = (id: MediaUnitId) => {
    stopSpeech();
    soundEngine.playButtonClick();
    setSelectedUnitId(id);
    setSlideIdx(0);
  };

  const handleSpeakSlide = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `${slide.title}. ${slide.narration} Catatan penting: ${slide.keyTakeaway}`
    );
    utter.lang = 'id-ID';
    utter.rate = 0.96;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const unitAnsweredCount = unit.quiz.filter((q) => quizAnswers[q.id] !== undefined).length;
  const unitCorrectCount = unit.quiz.filter((q) => quizAnswers[q.id] === q.correctIndex).length;
  const isStudioTier =
    unit.id === 'pemula' || unit.id === 'menengah' || unit.id === 'lanjutan';

  return (
    <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
      {/* Top Banner */}
      <div className="neo-card bg-white p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-extrabold text-neutral-600 flex items-center gap-2">
            <span>Media Belajar Interaktif CodeSpark</span>
            <span aria-hidden="true">·</span>
            <span>{isAdminPreview ? 'Pratinjau Penuh Admin' : 'Slide, Lab Mini, Kuis & Modul PDF'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-balance">
            Pustaka Materi &amp; Media Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl">
            Pelajari konsep coding, logika AI, aplikasi, dan game melalui slide visual interaktif,
            lab perintah mini, kuis pemahaman, serta lembar modul cetak Bahasa Indonesia.
          </p>
        </div>

        {onLaunchUnit && (
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              soundEngine.playButtonClick();
              onLaunchUnit(unit.id);
            }}
            className="neo-btn bg-[#4ADE80] px-5 py-3 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-black" />
            Mulai Praktik {unit.shortTitle}
          </button>
        )}
      </div>

      {/* Unit Selector Strip (6 Curriculum Units) */}
      <div className="flex flex-wrap gap-2">
        {LEARNING_MEDIA_UNITS.map((u) => {
          const active = u.id === unit.id;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => handleChangeUnit(u.id)}
              className={`px-3.5 py-2 border-2 border-black text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
                active
                  ? 'shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
              style={{ backgroundColor: active ? u.accentColor : undefined }}
            >
              {u.shortTitle}
            </button>
          );
        })}
      </div>

      {/* Active Unit Workspace Card */}
      <div className="neo-card bg-white overflow-hidden">
        {/* Unit Header + 4 Media Mode Tabs */}
        <div className="p-4 sm:p-5 bg-[#2C313A] text-white border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-neutral-300 flex items-center gap-2">
              <span>{unit.trackLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Estimasi {unit.estimatedMinutes} menit</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold mt-0.5">
              {unit.number}. {unit.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'slides' as const, label: 'Slide Konsep', icon: Presentation },
              { id: 'sandbox' as const, label: 'Lab Mini', icon: FlaskConical },
              {
                id: 'quiz' as const,
                label: `Kuis (${unitCorrectCount}/${unit.quiz.length})`,
                icon: ClipboardCheck,
              },
              { id: 'sheet' as const, label: 'Modul & Ringkasan', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    soundEngine.playTabSwitch();
                    setActiveTab(tab.id);
                  }}
                  className={`px-3 py-2 text-xs font-extrabold border-2 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-[#FFE600] text-black border-black'
                      : 'bg-[#3A414E] text-white border-white/15 hover:bg-[#495262]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">
          {/* TAB 1: INTERACTIVE CONCEPT SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-5">
              {/* Slide Stepper Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black/10">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold tabular-nums">
                    Slide {slideIdx + 1} / {unit.slides.length}
                  </span>
                  <div className="flex gap-1">
                    {unit.slides.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          stopSpeech();
                          soundEngine.playButtonClick();
                          setSlideIdx(idx);
                        }}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2.5 rounded-sm border border-black cursor-pointer transition-all ${
                          idx === slideIdx ? 'w-8 bg-[#4ADE80]' : 'w-3 bg-neutral-200 hover:bg-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSpeakSlide}
                  className={`neo-btn px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                    speaking ? 'bg-[#FB7185] text-black' : 'bg-[#FFE600] text-black'
                  }`}
                >
                  {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {speaking ? 'Hentikan Suara' : 'Bacakan Slide (Audio)'}
                </button>
              </div>

              {/* 2-Zone Educational Sandbox Layout */}
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Left: Live Interactive Stage */}
                <div className="lg:col-span-7 space-y-4">
                  <SlideVisualStage slide={slide} />

                  {/* Synchronized Blocks / Python / JavaScript Card */}
                  <div className="border-2 border-black bg-[#FFFDF7] overflow-hidden">
                    <div className="px-3 py-2 bg-[#F5E0A3] border-b-2 border-black flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#4A2508]">
                        Perbandingan Blok &amp; Kode Asli
                      </span>
                      <div className="flex gap-1">
                        {[
                          { id: 'blocks' as const, label: 'Blok', icon: Blocks },
                          { id: 'python' as const, label: 'Python', icon: Code2 },
                          { id: 'javascript' as const, label: 'JavaScript', icon: Code2 },
                        ].map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                soundEngine.playButtonClick();
                                setCodeLang(tab.id);
                              }}
                              className={`px-2.5 py-1 text-[11px] font-extrabold border border-black cursor-pointer inline-flex items-center gap-1 ${
                                codeLang === tab.id ? 'bg-[#4ADE80] text-black' : 'bg-white text-black'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5">
                      {codeLang === 'blocks' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {slide.blocksPreview.map((blk, i) => (
                            <span
                              key={`${blk}-${i}`}
                              className={`px-3 py-1.5 rounded border-2 font-display font-extrabold text-xs ${
                                blk === 'START'
                                  ? 'bg-[#57B832] border-[#2D6E14] text-white'
                                  : blk.includes('repeat')
                                    ? 'bg-[#9353D3] border-[#662D9F] text-white'
                                    : blk.includes('if') || blk.includes('else')
                                      ? 'bg-[#1EA896] border-[#117366] text-white'
                                      : blk.includes('turn')
                                        ? 'bg-[#F3C043] border-[#BD8D1B] text-[#3B2305]'
                                        : 'bg-[#2B8EF2] border-[#1A65B5] text-white'
                              }`}
                            >
                              {blk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <pre className="p-3 rounded bg-[#1E1F26] text-[#7CE38B] font-mono text-xs leading-relaxed overflow-x-auto">
                          {codeLang === 'python' ? slide.pythonCode : slide.jsCode}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Concept Narration & Takeaway */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <MascotPortrait character={slide.character} className="w-16 h-16 shrink-0" mood="happy" />
                    <div>
                      <h3 className="font-display text-xl font-extrabold leading-tight">
                        {slide.title}
                      </h3>
                      <p className="text-xs font-bold text-neutral-600 mt-0.5">{slide.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">{slide.narration}</p>

                  <div className="p-3.5 bg-[#FFE600]/40 border-2 border-black space-y-1">
                    <div className="text-xs font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Poin Penting
                    </div>
                    <p className="text-xs font-semibold text-neutral-900 leading-relaxed">
                      {slide.keyTakeaway}
                    </p>
                  </div>

                  {/* Prev / Next Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      disabled={slideIdx === 0}
                      onClick={() => {
                        stopSpeech();
                        soundEngine.playButtonClick();
                        setSlideIdx((i) => Math.max(0, i - 1));
                      }}
                      className="neo-btn bg-white px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </button>

                    {slideIdx < unit.slides.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeech();
                          soundEngine.playButtonClick();
                          setSlideIdx((i) => Math.min(unit.slides.length - 1, i + 1));
                        }}
                        className="neo-btn bg-[#4ADE80] px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Slide Berikutnya
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeech();
                          soundEngine.playGemCollect();
                          setActiveTab('quiz');
                        }}
                        className="neo-btn bg-[#FFE600] px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Lanjut ke Kuis Cepat
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE MINI COMMAND SANDBOX */}
          {activeTab === 'sandbox' && <MiniCommandSandbox promptText={unit.sandboxPrompt} />}

          {/* TAB 3: INTERACTIVE CONCEPT QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#FFFDF7] border-2 border-black">
                <div>
                  <h3 className="font-display text-lg font-extrabold">
                    Kuis Pemahaman — {unit.title}
                  </h3>
                  <p className="text-xs text-neutral-700">
                    Jawab seluruh pertanyaan untuk menguji penguasaan konsep sebelum praktik!
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm font-extrabold tabular-nums">
                    Skor: {unitCorrectCount} / {unit.quiz.length}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => {
                      const earned =
                        unitAnsweredCount === unit.quiz.length &&
                        unitCorrectCount >= Math.ceil((s / 3) * unit.quiz.length);
                      return (
                        <Star
                          key={s}
                          className={`w-5 h-5 ${
                            earned ? 'fill-[#FFE600] text-black' : 'text-neutral-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                  {unitAnsweredCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        const next = { ...quizAnswers };
                        unit.quiz.forEach((q) => delete next[q.id]);
                        setQuizAnswers(next);
                      }}
                      className="px-2.5 py-1 border-2 border-black bg-white text-xs font-extrabold cursor-pointer"
                    >
                      Ulangi
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {unit.quiz.map((q, qIdx) => {
                  const chosen = quizAnswers[q.id];
                  const answered = chosen !== undefined;
                  const isRight = chosen === q.correctIndex;
                  return (
                    <div key={q.id} className="p-4 border-2 border-black bg-white space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 bg-[#FFE600] border-2 border-black flex items-center justify-center font-mono text-xs font-extrabold shrink-0">
                          {qIdx + 1}
                        </span>
                        <div className="space-y-2 flex-1">
                          <div className="font-display font-extrabold text-sm sm:text-base">
                            {q.question}
                          </div>
                          {q.codeSnippet && (
                            <pre className="p-2.5 bg-[#1E1F26] text-[#7CE38B] font-mono text-xs rounded border border-black inline-block">
                              {q.codeSnippet}
                            </pre>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const selected = chosen === oIdx;
                          const correctOpt = oIdx === q.correctIndex;
                          let bg = 'bg-[#FFFDF7] hover:bg-neutral-100';
                          if (answered) {
                            if (correctOpt) bg = 'bg-[#4ADE80]';
                            else if (selected) bg = 'bg-[#FB7185]';
                            else bg = 'bg-neutral-50 opacity-70';
                          }
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                                if (oIdx === q.correctIndex) {
                                  soundEngine.playGemCollect();
                                } else {
                                  soundEngine.playCrash();
                                }
                              }}
                              className={`text-left px-3 py-2.5 border-2 border-black text-xs font-bold cursor-pointer flex items-center justify-between gap-2 ${bg}`}
                            >
                              <span>{opt}</span>
                              {answered && correctOpt && (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
                              )}
                              {answered && selected && !correctOpt && (
                                <XCircle className="w-4 h-4 shrink-0 text-black" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`p-3 border-2 border-black text-xs font-semibold ${
                            isRight ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'
                          }`}
                        >
                          <strong>{isRight ? 'Benar! ' : 'Belum tepat — '}</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PRINTABLE MODULE & SUMMARY SHEET */}
          {activeTab === 'sheet' && (
            <div className="space-y-5">
              <div className="p-5 bg-[#FFFDF7] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-extrabold">
                    Lembar Modul Singkat &amp; Panduan Cetak ({unit.shortTitle})
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700">{unit.summary}</p>
                </div>
                {isStudioTier && onOpenPrintableModule && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onOpenPrintableModule(unit.id as TierId);
                    }}
                    className="neo-btn bg-[#4ADE80] px-4 py-2.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    Buka Modul Cetak 3 Halaman (PDF)
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {unit.referenceNotes.map((note) => (
                  <div key={note.heading} className="p-4 border-2 border-black bg-white space-y-2.5">
                    <div className="font-display font-extrabold text-sm flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {note.heading}
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                      {note.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="p-4 border-2 border-black bg-[#FFFDF7] space-y-2.5">
                  <div className="font-display font-extrabold text-sm flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Tips Belajar Efektif
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                    <li>Buka tombol <strong>Penggaris Jarak</strong> di arena Studio untuk menghitung langkah kotak tanpa menebak.</li>
                    <li>Gunakan tombol <strong>Langkah (Step)</strong> untuk menjalankan kode satu baris demi satu baris saat mencari bug.</li>
                    <li>Bandingkan hasil blok dengan tab <strong>Python</strong> dan <strong>JavaScript</strong> agar cepat mahir coding teks.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
