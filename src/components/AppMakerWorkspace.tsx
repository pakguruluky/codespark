import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  CloudSun,
  Code2,
  Copy,
  Delete,
  Droplets,
  Heart,
  KeyRound,
  Layers,
  Lock,
  MessageCircle,
  Palette,
  Phone,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Unlock,
  Wind,
  Calculator as CalcIcon,
  Wand2,
  AlertCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import type {
  AppMakerProjectId,
  CertificateRecord,
  ProgressRecord,
} from '../types';
import {
  APP_MAKER_PROJECTS,
  buildProjectCodeFromSteps,
  getAppMakerProjectById,
  type AppMakerProjectDef,
} from '../data/appMakerProjects';
import { soundEngine } from '../engine/soundEngine';
import { formatWhatsAppUrl } from '../utils/crypto';

interface Props {
  hasAccess: boolean;
  requestedAppMaker?: boolean;
  isAdminPreview?: boolean;
  initialProjectId?: AppMakerProjectId | null;
  completedProgressMap: Map<string, ProgressRecord>;
  adminPhone?: string;
  adminContactName?: string;
  onRequestUpgrade?: () => void;
  onProjectComplete: (payload: {
    projectId: AppMakerProjectId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
  }) => Promise<{ newCertificate: CertificateRecord | null }>;
  onOpenCertificates?: () => void;
}

function getProjectIcon(id: AppMakerProjectId) {
  switch (id) {
    case 'app_photogram':
      return Camera;
    case 'app_todo':
      return CheckSquare;
    case 'app_calculator':
      return CalcIcon;
    case 'app_color':
      return Palette;
    case 'app_weather':
      return CloudSun;
  }
}

// ==================== 1. PHOTOGRAM AI LIVE SIMULATOR ====================

const PHOTO_SCENES = [
  {
    id: 'sunset',
    name: 'Senja Pantai Bali',
    emoji: '🌅',
    gradient: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 45%, #86A8E7 100%)',
    captionBase: 'Menikmati hangatnya cahaya senja di tepi pantai.',
    tags: '#SenjaBali #GoldenHour #PhotogramAI',
  },
  {
    id: 'cyber',
    name: 'Kota Neon Malam',
    emoji: '🌃',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #6D28D9 52%, #EC4899 100%)',
    captionBase: 'Lampu kota berpendar penuh energi futuristik malam ini!',
    tags: '#CyberCity #NeonVibes #CodingArt',
  },
  {
    id: 'bamboo',
    name: 'Hutan Bambu Hijau',
    emoji: '🎋',
    gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 50%, #A7F3D0 100%)',
    captionBase: 'Udara segar dan ketenangan alami di tengah rimbunnya alam.',
    tags: '#AlamHijau #FreshVibe #CodeSpark',
  },
  {
    id: 'galaxy',
    name: 'Galaksi Bintang',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #020617 0%, #1D4ED8 50%, #C084FC 100%)',
    captionBase: 'Menjelajah imajinasi melampaui gugusan bintang galaksi.',
    tags: '#SpaceExplorer #AIArt #Galaxy',
  },
];

const PHOTO_FILTERS = [
  { id: 'normal', label: 'Normal', css: 'none', mood: 'natural dan autentik' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.75) contrast(1.12)', mood: 'cerah penuh warna' },
  { id: 'retro', label: 'Retro', css: 'sepia(0.65) contrast(1.08) brightness(0.96)', mood: 'klasik bernuansa nostalgia' },
  { id: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.35)', mood: 'dramatis hitam-putih' },
  { id: 'neon', label: 'Neon', css: 'hue-rotate(38deg) saturate(2.1) contrast(1.15)', mood: 'futuristik bergaya neon' },
];

const PhotogramLiveApp: React.FC<{ appTitle: string; enabledSteps: Set<string> }> = ({
  appTitle,
  enabledSteps,
}) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [filterId, setFilterId] = useState('normal');
  const [caption, setCaption] = useState('');
  const [likes, setLikes] = useState(24);
  const [liked, setLiked] = useState(false);
  const [feed, setFeed] = useState<
    { id: number; sceneName: string; emoji: string; gradient: string; filterCss: string; filterLabel: string; caption: string; likes: number }[]
  >([]);

  const hasGallery = enabledSteps.has('pg_gallery');
  const hasFilters = enabledSteps.has('pg_filters');
  const hasAiCaption = enabledSteps.has('pg_ai_caption');
  const hasPublish = enabledSteps.has('pg_publish');

  const scene = PHOTO_SCENES[sceneIdx];
  const activeFilter = PHOTO_FILTERS.find((f) => f.id === filterId) || PHOTO_FILTERS[0];

  const handleGenerateCaption = () => {
    soundEngine.playBlockSnap();
    setCaption(
      `${scene.captionBase} Sentuhan filter ${activeFilter.label} membuatnya terasa ${activeFilter.mood}. ${scene.tags}`
    );
  };

  const handlePublish = () => {
    soundEngine.playButtonClick();
    setFeed((prev) => [
      {
        id: Date.now(),
        sceneName: scene.name,
        emoji: scene.emoji,
        gradient: scene.gradient,
        filterCss: hasFilters ? activeFilter.css : 'none',
        filterLabel: hasFilters ? activeFilter.label : 'Normal',
        caption: caption || `${scene.captionBase} ${scene.tags}`,
        likes: likes,
      },
      ...prev.slice(0, 2),
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <Camera className="w-4 h-4 text-[#E11D48]" />
          <span className="truncate">{appTitle}</span>
        </div>
        <span className="text-[10px] font-mono font-extrabold bg-[#FB7185] px-1.5 py-0.5 border border-black">
          AI STUDIO
        </span>
      </div>

      {!hasGallery ? (
        <div className="p-6 text-center border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500">
          Aktifkan Modul 1 (Galeri &amp; Pemilih Foto) di panel kiri untuk menampilkan kanvas foto.
        </div>
      ) : (
        <>
          {/* Photo Canvas */}
          <div
            className="h-44 border-2 border-black relative overflow-hidden flex flex-col items-center justify-center text-white p-4 transition-all"
            style={{
              background: scene.gradient,
              filter: hasFilters ? activeFilter.css : 'none',
            }}
          >
            <div className="text-5xl drop-shadow">{scene.emoji}</div>
            <div className="mt-2 px-2.5 py-0.5 bg-black/60 text-white text-xs font-extrabold rounded">
              {scene.name}
            </div>
            {hasFilters && (
              <span className="absolute top-2 right-2 bg-white text-black border border-black px-2 py-0.5 text-[10px] font-extrabold">
                Filter: {activeFilter.label}
              </span>
            )}
          </div>

          {/* Scene Selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {PHOTO_SCENES.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  soundEngine.playBlockSnap();
                  setSceneIdx(idx);
                }}
                className={`p-1.5 border-2 border-black text-center cursor-pointer transition-transform ${
                  idx === sceneIdx ? 'bg-[#FFE600] -translate-y-0.5 shadow-[2px_2px_0px_0px_#000]' : 'bg-white'
                }`}
              >
                <div className="text-lg leading-none">{sc.emoji}</div>
                <div className="text-[9px] font-extrabold truncate mt-1">{sc.name.split(' ')[0]}</div>
              </button>
            ))}
          </div>

          {/* Step 2: Filters */}
          {hasFilters ? (
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold">Preset Filter Visual:</div>
              <div className="flex flex-wrap gap-1.5">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playBlockSnap();
                      setFilterId(f.id);
                    }}
                    className={`px-2.5 py-1 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
                      filterId === f.id ? 'bg-[#FFE600]' : 'bg-white hover:bg-neutral-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 2 untuk membuka Mesin Filter Visual.
            </div>
          )}

          {/* Step 3: AI Caption */}
          {hasAiCaption ? (
            <div className="p-2.5 bg-[#FFFDF7] border-2 border-black space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold">Caption &amp; Tagar AI</span>
                <button
                  type="button"
                  onClick={handleGenerateCaption}
                  className="px-2.5 py-1 bg-[#C084FC] border-2 border-black text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  Buat Caption AI
                </button>
              </div>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder='Klik "Buat Caption AI" atau tulis caption...'
                className="w-full p-2 text-xs border border-black bg-white font-medium resize-none"
              />
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 3 untuk membuka Generator Caption AI.
            </div>
          )}

          {/* Step 4: Like & Publish */}
          {hasPublish ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playBlockSnap();
                    setLiked((v) => {
                      setLikes((c) => (v ? c - 1 : c + 1));
                      return !v;
                    });
                  }}
                  className={`px-3 py-1.5 border-2 border-black text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                    liked ? 'bg-[#FB7185]' : 'bg-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-black' : ''}`} />
                  {likes} Suka
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-3 py-1.5 bg-[#4ADE80] border-2 border-black text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Posting ke Feed
                </button>
              </div>

              {feed.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t-2 border-black/15">
                  <div className="text-[10px] font-extrabold uppercase text-neutral-600">
                    Feed Mini ({feed.length} Postingan)
                  </div>
                  {feed.map((post) => (
                    <div
                      key={post.id}
                      className="p-2 bg-white border-2 border-black flex items-start gap-2.5 text-xs"
                    >
                      <div
                        className="w-10 h-10 border border-black shrink-0 flex items-center justify-center text-lg"
                        style={{ background: post.gradient, filter: post.filterCss }}
                      >
                        {post.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-[11px] flex items-center justify-between">
                          <span>{post.sceneName}</span>
                          <span className="text-[10px] text-neutral-500">{post.filterLabel}</span>
                        </div>
                        <p className="text-[11px] text-neutral-700 line-clamp-2">{post.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 4 untuk membuka tombol Like &amp; Feed Publikasi.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== 2. TODO APP LIVE SIMULATOR ====================

const TodoLiveApp: React.FC<{ appTitle: string; enabledSteps: Set<string> }> = ({
  appTitle,
  enabledSteps,
}) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Selesaikan proyek App Maker', done: true },
    { id: 2, text: 'Latihan logika JavaScript 15 menit', done: false },
    { id: 3, text: 'Rapikan catatan modul belajar', done: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const hasInput = enabledSteps.has('td_input');
  const hasToggle = enabledSteps.has('td_toggle');
  const hasFilter = enabledSteps.has('td_filter');
  const hasProgress = enabledSteps.has('td_progress');

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const visibleTasks = tasks.filter((t) => {
    if (!hasFilter || filter === 'all') return true;
    return filter === 'done' ? t.done : !t.done;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    soundEngine.playBlockSnap();
    setTasks((prev) => [{ id: Date.now(), text, done: false }, ...prev]);
    setNewTask('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <CheckSquare className="w-4 h-4 text-emerald-700" />
          <span className="truncate">{appTitle}</span>
        </div>
        <span className="text-[10px] font-mono font-extrabold bg-[#4ADE80] px-1.5 py-0.5 border border-black">
          {tasks.length} TUGAS
        </span>
      </div>

      {/* Step 4: Progress Bar */}
      {hasProgress && (
        <div className="p-2.5 bg-[#FFFDF7] border-2 border-black space-y-1">
          <div className="flex items-center justify-between text-xs font-extrabold tabular-nums">
            <span>Progres Harian</span>
            <span>
              {doneCount}/{tasks.length} ({percent}%)
            </span>
          </div>
          <div className="h-3 bg-white border-2 border-black">
            <div
              className="h-full bg-[#4ADE80] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Task Input */}
      {hasInput ? (
        <form onSubmit={handleAdd} className="flex gap-1.5">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tulis tugas baru..."
            className="flex-1 px-2.5 py-2 text-xs font-semibold border-2 border-black bg-white"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#4ADE80] border-2 border-black text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </form>
      ) : (
        <div className="p-3 border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500 text-center">
          Aktifkan Modul 1 untuk menampilkan Form Input Tugas.
        </div>
      )}

      {/* Step 3: Status Filter */}
      {hasFilter ? (
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'all', label: `Semua (${tasks.length})` },
              { id: 'active', label: `Aktif (${tasks.length - doneCount})` },
              { id: 'done', label: `Selesai (${doneCount})` },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                soundEngine.playBlockSnap();
                setFilter(f.id);
              }}
              className={`py-1.5 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
                filter === f.id ? 'bg-[#FFE600]' : 'bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 3 untuk membuka Filter Status Tugas.
        </div>
      )}

      {/* Task List */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
        {visibleTasks.length === 0 ? (
          <div className="p-4 text-center text-xs font-bold text-neutral-500 border border-dashed border-black/30">
            Tidak ada tugas pada filter ini.
          </div>
        ) : (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              className={`p-2.5 border-2 border-black flex items-center justify-between gap-2 text-xs ${
                task.done ? 'bg-[#4ADE80]/25' : 'bg-white'
              }`}
            >
              <button
                type="button"
                disabled={!hasToggle}
                onClick={() => {
                  soundEngine.playBlockSnap();
                  setTasks((prev) =>
                    prev.map((item) =>
                      item.id === task.id ? { ...item, done: !item.done } : item
                    )
                  );
                }}
                className={`flex items-center gap-2 text-left flex-1 min-w-0 ${
                  hasToggle ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                }`}
              >
                <span
                  className={`w-4 h-4 border-2 border-black flex items-center justify-center shrink-0 ${
                    task.done ? 'bg-[#4ADE80]' : 'bg-white'
                  }`}
                >
                  {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span className={`font-bold truncate ${task.done ? 'line-through text-neutral-500' : ''}`}>
                  {task.text}
                </span>
              </button>
              {hasToggle && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playBlockSnap();
                    setTasks((prev) => prev.filter((item) => item.id !== task.id));
                  }}
                  className="p-1 bg-[#FB7185] border border-black cursor-pointer shrink-0"
                  aria-label="Hapus tugas"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {!hasToggle && (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 2 agar tugas bisa dicentang selesai &amp; dihapus.
        </div>
      )}
      {!hasProgress && (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 4 untuk menampilkan Indikator Progres Harian.
        </div>
      )}
    </div>
  );
};

// ==================== 3. SIMPLE CALCULATOR LIVE SIMULATOR ====================

const CalculatorLiveApp: React.FC<{ appTitle: string; enabledSteps: Set<string> }> = ({
  appTitle,
  enabledSteps,
}) => {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const hasDisplay = enabledSteps.has('calc_display');
  const hasDigits = enabledSteps.has('calc_digits');
  const hasOps = enabledSteps.has('calc_ops');
  const hasHistory = enabledSteps.has('calc_history');

  const inputDigit = (digit: string) => {
    soundEngine.playBlockSnap();
    if (digit === '.') {
      if (waitingNext) {
        setDisplay('0.');
        setWaitingNext(false);
        return;
      }
      if (!display.includes('.')) setDisplay(display + '.');
      return;
    }
    if (waitingNext || display === '0' || display === 'Error') {
      setDisplay(digit);
      setWaitingNext(false);
    } else if (display.length < 12) {
      setDisplay(display + digit);
    }
  };

  const compute = (a: number, b: number, op: string): number | 'Error' => {
    switch (op) {
      case '+':
        return a + b;
      case '−':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? 'Error' : a / b;
      default:
        return b;
    }
  };

  const formatNum = (val: number | 'Error') => {
    if (val === 'Error' || !Number.isFinite(val)) return 'Error';
    return String(Number(val.toFixed(6)));
  };

  const handleOperator = (nextOp: string) => {
    soundEngine.playBlockSnap();
    const current = parseFloat(display);
    if (Number.isNaN(current)) return;

    if (storedValue !== null && operator && !waitingNext) {
      const result = compute(storedValue, current, operator);
      const formatted = formatNum(result);
      setDisplay(formatted);
      setStoredValue(result === 'Error' ? null : result);
      setExpression(`${formatted} ${nextOp}`);
    } else {
      setStoredValue(current);
      setExpression(`${current} ${nextOp}`);
    }
    setOperator(nextOp);
    setWaitingNext(true);
  };

  const handleEquals = () => {
    soundEngine.playButtonClick();
    if (storedValue === null || !operator) return;
    const current = parseFloat(display);
    if (Number.isNaN(current)) return;
    const result = compute(storedValue, current, operator);
    const formatted = formatNum(result);
    const exprStr = `${storedValue} ${operator} ${current} = ${formatted}`;
    setDisplay(formatted);
    setExpression(`${storedValue} ${operator} ${current} =`);
    if (hasHistory) {
      setHistory((prev) => [exprStr, ...prev.slice(0, 2)]);
    }
    setStoredValue(null);
    setOperator(null);
    setWaitingNext(true);
  };

  const handleClear = () => {
    soundEngine.playBlockSnap();
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingNext(false);
    setExpression('');
  };

  const handleBackspace = () => {
    soundEngine.playBlockSnap();
    if (waitingNext || display === 'Error') return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <CalcIcon className="w-4 h-4" />
          <span className="truncate">{appTitle}</span>
        </div>
        <span className="text-[10px] font-mono font-extrabold bg-[#FFE600] px-1.5 py-0.5 border border-black">
          CALC v1
        </span>
      </div>

      {/* Step 1: Display */}
      {hasDisplay ? (
        <div className="bg-[#181C24] text-[#4ADE80] border-2 border-black p-3 text-right font-mono">
          <div className="text-[11px] text-neutral-400 h-4 truncate">{expression || 'Siap menghitung'}</div>
          <div className="text-2xl font-extrabold tracking-wider truncate tabular-nums">{display}</div>
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500 text-center">
          Aktifkan Modul 1 untuk menampilkan Layar Angka.
        </div>
      )}

      {/* Clear & Backspace (Step 4) */}
      {hasHistory && (
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleClear}
            className="py-2 bg-[#FB7185] border-2 border-black font-extrabold text-xs cursor-pointer"
          >
            C (Reset)
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-2 bg-[#FFE600] border-2 border-black font-extrabold text-xs inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Delete className="w-3.5 h-3.5" />
            Hapus 1 Digit
          </button>
        </div>
      )}

      {/* Keypad + Operators */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          '7', '8', '9', '÷',
          '4', '5', '6', '×',
          '1', '2', '3', '−',
          '0', '.', '=', '+',
        ].map((key) => {
          const isOp = ['÷', '×', '−', '+', '='].includes(key);
          const disabled = isOp ? !hasOps : !hasDigits;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (key === '=') handleEquals();
                else if (isOp) handleOperator(key);
                else inputDigit(key);
              }}
              className={`py-2.5 border-2 border-black font-mono font-extrabold text-sm transition-transform ${
                disabled
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : key === '='
                    ? 'bg-[#4ADE80] cursor-pointer active:translate-y-0.5'
                    : isOp
                      ? 'bg-[#38BDF8] cursor-pointer active:translate-y-0.5'
                      : 'bg-white hover:bg-[#FFFDF7] cursor-pointer active:translate-y-0.5'
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>

      {!hasDigits && (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 2 untuk menyalakan tombol angka 0–9.
        </div>
      )}
      {!hasOps && (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 3 untuk menyalakan operator + − × ÷ =.
        </div>
      )}

      {/* Step 4: History */}
      {hasHistory ? (
        <div className="p-2.5 bg-[#FFFDF7] border-2 border-black space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-neutral-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Riwayat Hitungan ({history.length}/3)
          </div>
          {history.length === 0 ? (
            <div className="text-[11px] text-neutral-500">Belum ada riwayat. Coba tekan 12 + 8 =</div>
          ) : (
            <div className="space-y-1">
              {history.map((item, i) => (
                <div key={i} className="font-mono text-xs font-bold bg-white px-2 py-1 border border-black/25">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 4 untuk membuka tombol Reset &amp; Riwayat Hitungan.
        </div>
      )}
    </div>
  );
};

// ==================== 4. COLOR GENERATIF LIVE SIMULATOR ====================

type HarmonyMode = 'Acak' | 'Pastel' | 'Neon' | 'Monokrom';

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(mode: HarmonyMode, prev: { hex: string; locked: boolean }[]) {
  const baseHue = Math.floor(Math.random() * 360);
  return prev.map((swatch, idx) => {
    if (swatch.locked) return swatch;
    let h = Math.floor(Math.random() * 360);
    let s = 72;
    let l = 56;
    if (mode === 'Pastel') {
      h = (baseHue + idx * 55) % 360;
      s = 68;
      l = 80;
    } else if (mode === 'Neon') {
      h = (baseHue + idx * 65) % 360;
      s = 96;
      l = 54;
    } else if (mode === 'Monokrom') {
      h = baseHue;
      s = 70;
      l = 28 + idx * 14;
    } else {
      h = Math.floor(Math.random() * 360);
      s = 65 + Math.floor(Math.random() * 30);
      l = 45 + Math.floor(Math.random() * 25);
    }
    return { hex: hslToHex(h, s, l), locked: false };
  });
}

const ColorGeneratifLiveApp: React.FC<{ appTitle: string; enabledSteps: Set<string> }> = ({
  appTitle,
  enabledSteps,
}) => {
  const [mode, setMode] = useState<HarmonyMode>('Acak');
  const [swatches, setSwatches] = useState([
    { hex: '#FF5E7E', locked: false },
    { hex: '#FFE600', locked: false },
    { hex: '#4ADE80', locked: false },
    { hex: '#38BDF8', locked: false },
    { hex: '#C084FC', locked: false },
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const hasSwatches = enabledSteps.has('clr_swatches');
  const hasHarmony = enabledSteps.has('clr_harmony');
  const hasLock = enabledSteps.has('clr_lock');
  const hasGradient = enabledSteps.has('clr_gradient');

  const gradientCss = `linear-gradient(90deg, ${swatches[0].hex}, ${swatches[2].hex}, ${swatches[4].hex})`;

  const handleGenerate = (nextMode: HarmonyMode = mode) => {
    soundEngine.playBlockSnap();
    setSwatches((prev) => generatePalette(nextMode, prev));
  };

  const handleCopy = (val: string) => {
    navigator.clipboard?.writeText(val);
    soundEngine.playButtonClick();
    setCopiedHex(val);
    setTimeout(() => setCopiedHex(null), 1400);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <Palette className="w-4 h-4 text-purple-700" />
          <span className="truncate">{appTitle}</span>
        </div>
        <span className="text-[10px] font-mono font-extrabold bg-[#C084FC] px-1.5 py-0.5 border border-black">
          PALETTE
        </span>
      </div>

      {/* Step 2: Harmony Mode */}
      {hasHarmony ? (
        <div className="grid grid-cols-4 gap-1">
          {(['Acak', 'Pastel', 'Neon', 'Monokrom'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                handleGenerate(m);
              }}
              className={`py-1.5 border-2 border-black text-[10px] font-extrabold cursor-pointer ${
                mode === m ? 'bg-[#38BDF8]' : 'bg-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 2 untuk memilih Mode Harmoni Warna.
        </div>
      )}

      {/* Step 1: 5 Color Swatches */}
      {hasSwatches ? (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1.5">
            {swatches.map((sw, idx) => (
              <div key={idx} className="border-2 border-black bg-white flex flex-col">
                <div
                  className="h-24 border-b-2 border-black flex items-start justify-end p-1"
                  style={{ backgroundColor: sw.hex }}
                >
                  {hasLock && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playBlockSnap();
                        setSwatches((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, locked: !item.locked } : item
                          )
                        );
                      }}
                      className={`p-1 border border-black cursor-pointer ${
                        sw.locked ? 'bg-[#FFE600]' : 'bg-white/90'
                      }`}
                      title={sw.locked ? 'Buka kunci warna' : 'Kunci warna ini'}
                    >
                      {sw.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!hasGradient}
                  onClick={() => handleCopy(sw.hex)}
                  className={`py-1.5 px-1 font-mono text-[9px] font-extrabold text-center truncate ${
                    hasGradient ? 'cursor-pointer hover:bg-[#FFE600]' : 'cursor-default'
                  }`}
                  title={hasGradient ? 'Klik untuk salin HEX' : sw.hex}
                >
                  {copiedHex === sw.hex ? 'Tersalin!' : sw.hex}
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            className="w-full py-2.5 bg-[#C084FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Palet Baru ({hasHarmony ? mode : 'Acak'})
          </button>
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500 text-center">
          Aktifkan Modul 1 untuk menampilkan 5 Kartu Palet Warna.
        </div>
      )}

      {!hasLock && (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 3 agar warna favorit bisa dikunci (Lock).
        </div>
      )}

      {/* Step 4: Gradient Export */}
      {hasGradient ? (
        <div className="p-2.5 bg-[#FFFDF7] border-2 border-black space-y-2">
          <div className="text-[11px] font-extrabold">Pratinjau CSS Linear Gradient:</div>
          <div
            className="h-12 border-2 border-black flex items-center justify-center text-xs font-extrabold text-white drop-shadow"
            style={{ background: gradientCss }}
          >
            CSS Gradient Preview
          </div>
          <button
            type="button"
            onClick={() => handleCopy(`background: ${gradientCss};`)}
            className="w-full py-1.5 bg-[#4ADE80] border-2 border-black text-[11px] font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            {copiedHex?.startsWith('background:') ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedHex?.startsWith('background:') ? 'CSS Gradien Tersalin!' : 'Salin Kode CSS Gradien'}
          </button>
        </div>
      ) : (
        <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
          🔒 Aktifkan Modul 4 untuk membuka Pratinjau Gradien &amp; Salin HEX.
        </div>
      )}
    </div>
  );
};

// ==================== 5. WEATHER APP LIVE SIMULATOR ====================

const WEATHER_CITIES = [
  {
    name: 'Jakarta',
    tempC: 32,
    condition: 'Cerah Berawan',
    icon: '⛅',
    humidity: 72,
    wind: 14,
    uv: 'Tinggi (8)',
    bg: 'linear-gradient(135deg, #38BDF8 0%, #BAE6FD 100%)',
    forecast: [
      { time: '12:00', icon: '☀️', tempC: 33 },
      { time: '15:00', icon: '⛅', tempC: 31 },
      { time: '18:00', icon: '🌦️', tempC: 28 },
      { time: '21:00', icon: '🌙', tempC: 26 },
    ],
    tip: 'Gunakan pakaian katun tipis, bawa air minum & payung lipat untuk sore hari.',
  },
  {
    name: 'Bandung',
    tempC: 23,
    condition: 'Sejuk & Berkabut',
    icon: '🌤️',
    humidity: 81,
    wind: 10,
    uv: 'Sedang (5)',
    bg: 'linear-gradient(135deg, #60A5FA 0%, #A7F3D0 100%)',
    forecast: [
      { time: '12:00', icon: '🌤️', tempC: 25 },
      { time: '15:00', icon: '🌧️', tempC: 22 },
      { time: '18:00', icon: '🌧️', tempC: 20 },
      { time: '21:00', icon: '🌙', tempC: 19 },
    ],
    tip: 'Siapkan jaket ringan atau hoodie — udara sore di Bandung terasa sejuk dan berpotensi gerimis.',
  },
  {
    name: 'Bali',
    tempC: 30,
    condition: 'Cerah Tropis',
    icon: '☀️',
    humidity: 75,
    wind: 19,
    uv: 'Sangat Tinggi (9)',
    bg: 'linear-gradient(135deg, #F59E0B 0%, #FDE047 100%)',
    forecast: [
      { time: '12:00', icon: '☀️', tempC: 31 },
      { time: '15:00', icon: '☀️', tempC: 30 },
      { time: '18:00', icon: '🌅', tempC: 27 },
      { time: '21:00', icon: '🌙', tempC: 26 },
    ],
    tip: 'Cocok untuk aktivitas pantai! Pakai sunscreen SPF 30+ dan kacamata hitam.',
  },
  {
    name: 'Surabaya',
    tempC: 34,
    condition: 'Panas Cerah',
    icon: '☀️',
    humidity: 66,
    wind: 16,
    uv: 'Ekstrem (10)',
    bg: 'linear-gradient(135deg, #FB7185 0%, #FDBA74 100%)',
    forecast: [
      { time: '12:00', icon: '☀️', tempC: 35 },
      { time: '15:00', icon: '☀️', tempC: 34 },
      { time: '18:00', icon: '⛅', tempC: 30 },
      { time: '21:00', icon: '🌙', tempC: 28 },
    ],
    tip: 'Cuaca cukup terik! Perbanyak minum air putih dan hindari sinar matahari langsung pukul 11–14.',
  },
  {
    name: 'Yogyakarta',
    tempC: 29,
    condition: 'Hujan Ringan',
    icon: '🌦️',
    humidity: 84,
    wind: 11,
    uv: 'Sedang (4)',
    bg: 'linear-gradient(135deg, #6366F1 0%, #93C5FD 100%)',
    forecast: [
      { time: '12:00', icon: '⛅', tempC: 30 },
      { time: '15:00', icon: '🌦️', tempC: 28 },
      { time: '18:00', icon: '🌧️', tempC: 26 },
      { time: '21:00', icon: '☁️', tempC: 25 },
    ],
    tip: 'Bawa jas hujan atau payung saat berkeliling kota, suasana cocok untuk menikmati wedang hangat.',
  },
  {
    name: 'Tokyo',
    tempC: 17,
    condition: 'Berangin Sejuk',
    icon: '🍃',
    humidity: 58,
    wind: 21,
    uv: 'Rendah (3)',
    bg: 'linear-gradient(135deg, #A855F7 0%, #7DD3FC 100%)',
    forecast: [
      { time: '12:00', icon: '🌤️', tempC: 18 },
      { time: '15:00', icon: '⛅', tempC: 17 },
      { time: '18:00', icon: '💨', tempC: 14 },
      { time: '21:00', icon: '🌙', tempC: 12 },
    ],
    tip: 'Kenakan jaket windbreaker agar tetap hangat saat berjalan di ruang terbuka.',
  },
];

const WeatherLiveApp: React.FC<{ appTitle: string; enabledSteps: Set<string> }> = ({
  appTitle,
  enabledSteps,
}) => {
  const [cityIdx, setCityIdx] = useState(0);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const hasCities = enabledSteps.has('wt_cities');
  const hasMetrics = enabledSteps.has('wt_metrics');
  const hasUnit = enabledSteps.has('wt_unit');
  const hasForecast = enabledSteps.has('wt_forecast');

  const city = WEATHER_CITIES[cityIdx];
  const displayTemp = (c: number) =>
    hasUnit && unit === 'F' ? `${Math.round((c * 9) / 5 + 32)}°F` : `${c}°C`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <CloudSun className="w-4 h-4 text-sky-700" />
          <span className="truncate">{appTitle}</span>
        </div>
        {hasUnit && (
          <div className="inline-flex border-2 border-black overflow-hidden">
            {(['C', 'F'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  soundEngine.playBlockSnap();
                  setUnit(u);
                }}
                className={`px-2 py-0.5 text-[10px] font-extrabold cursor-pointer ${
                  unit === u ? 'bg-[#FFE600]' : 'bg-white'
                }`}
              >
                °{u}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasCities ? (
        <div className="p-4 border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500 text-center">
          Aktifkan Modul 1 untuk menampilkan Pemilih Kota &amp; Kartu Cuaca.
        </div>
      ) : (
        <>
          {/* City Buttons */}
          <div className="flex flex-wrap gap-1">
            {WEATHER_CITIES.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  soundEngine.playBlockSnap();
                  setCityIdx(idx);
                }}
                className={`px-2 py-1 border-2 border-black text-[10px] font-extrabold cursor-pointer ${
                  idx === cityIdx ? 'bg-[#FFE600]' : 'bg-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Main Weather Card */}
          <div
            className="p-4 border-2 border-black flex items-center justify-between text-black"
            style={{ background: city.bg }}
          >
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wide">{city.name}</div>
              <div className="font-display text-4xl font-extrabold tabular-nums mt-0.5">
                {displayTemp(city.tempC)}
              </div>
              <div className="text-xs font-bold mt-0.5">{city.condition}</div>
            </div>
            <div className="text-5xl">{city.icon}</div>
          </div>

          {/* Step 2: Metrics */}
          {hasMetrics ? (
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 bg-white border-2 border-black">
                <Droplets className="w-3.5 h-3.5 mx-auto text-sky-600" />
                <div className="text-[10px] font-bold text-neutral-600 mt-0.5">Lembap</div>
                <div className="font-mono text-xs font-extrabold">{city.humidity}%</div>
              </div>
              <div className="p-2 bg-white border-2 border-black">
                <Wind className="w-3.5 h-3.5 mx-auto text-emerald-700" />
                <div className="text-[10px] font-bold text-neutral-600 mt-0.5">Angin</div>
                <div className="font-mono text-xs font-extrabold">{city.wind} km/j</div>
              </div>
              <div className="p-2 bg-white border-2 border-black">
                <Sun className="w-3.5 h-3.5 mx-auto text-amber-600" />
                <div className="text-[10px] font-bold text-neutral-600 mt-0.5">Indeks UV</div>
                <div className="font-mono text-[10px] font-extrabold">{city.uv}</div>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 2 untuk menampilkan Kelembapan, Angin &amp; UV.
            </div>
          )}

          {!hasUnit && (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 3 untuk tombol konversi °C ↔ °F di pojok kanan atas.
            </div>
          )}

          {/* Step 4: Forecast + AI Tips */}
          {hasForecast ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {city.forecast.map((slot) => (
                  <div key={slot.time} className="p-1.5 bg-[#FFFDF7] border-2 border-black">
                    <div className="text-[10px] font-mono font-bold text-neutral-600">{slot.time}</div>
                    <div className="text-lg my-0.5">{slot.icon}</div>
                    <div className="font-mono text-xs font-extrabold">{displayTemp(slot.tempC)}</div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-[#C084FC]/25 border-2 border-black text-[11px] leading-relaxed">
                <strong className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Saran Aktivitas AI:
                </strong>{' '}
                {city.tip}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 4 untuk membuka Prakiraan Jam &amp; Saran AI.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== MAIN WORKSPACE COMPONENT ====================

export const AppMakerWorkspace: React.FC<Props> = ({
  hasAccess,
  requestedAppMaker = false,
  isAdminPreview = false,
  initialProjectId = null,
  completedProgressMap,
  adminPhone = '',
  adminContactName = 'Admin CodeSpark',
  onRequestUpgrade,
  onProjectComplete,
  onOpenCertificates,
}) => {
  const [activeProjectId, setActiveProjectId] = useState<AppMakerProjectId | null>(
    initialProjectId
  );
  const [builderMode, setBuilderMode] = useState<'blocks' | 'code'>('blocks');
  const [appTitle, setAppTitle] = useState('');
  const [enabledStepIds, setEnabledStepIds] = useState<string[]>([]);
  const [codeText, setCodeText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [victoryInfo, setVictoryInfo] = useState<{
    projectTitle: string;
    newCertificate: CertificateRecord | null;
    nextProject: AppMakerProjectDef | null;
  } | null>(null);

  useEffect(() => {
    if (initialProjectId) {
      setActiveProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  const activeProject = activeProjectId ? getAppMakerProjectById(activeProjectId) || null : null;

  // Load project state when switching project
  useEffect(() => {
    if (!activeProject) return;
    const prevRecord = completedProgressMap.get(activeProject.id);
    const defaultSteps = prevRecord
      ? activeProject.steps.map((s) => s.id)
      : [...activeProject.starterEnabledStepIds];
    setAppTitle(activeProject.defaultAppName);
    setEnabledStepIds(defaultSteps);
    setCodeText(
      prevRecord?.codeSubmitted ||
        buildProjectCodeFromSteps(activeProject, activeProject.defaultAppName, defaultSteps)
    );
    setValidationError(null);
    setVictoryInfo(null);
    setBuilderMode('blocks');
  }, [activeProjectId]);

  const completedCount = useMemo(
    () => APP_MAKER_PROJECTS.filter((p) => completedProgressMap.has(p.id)).length,
    [completedProgressMap]
  );

  const totalStars = useMemo(
    () =>
      APP_MAKER_PROJECTS.reduce(
        (sum, p) => sum + (completedProgressMap.get(p.id)?.stars || 0),
        0
      ),
    [completedProgressMap]
  );

  const isProjectUnlocked = (project: AppMakerProjectDef): boolean => {
    if (isAdminPreview) return true;
    if (project.order === 1) return true;
    const prev = APP_MAKER_PROJECTS.find((p) => p.order === project.order - 1);
    return prev ? completedProgressMap.has(prev.id) : true;
  };

  // Derive active steps dynamically from code if in code mode, or enabledStepIds in blocks mode
  const effectiveEnabledSteps = useMemo(() => {
    if (!activeProject) return new Set<string>();
    if (builderMode === 'blocks') return new Set(enabledStepIds);
    const detected = new Set<string>();
    activeProject.steps.forEach((step) => {
      // Check if snippet or component/feature name is present in user's JS code
      const match = step.codeSnippet.match(/"([^"]+)"/);
      const featureKey = match ? match[1] : step.codeSnippet;
      if (codeText.includes(featureKey) || codeText.includes(step.codeSnippet)) {
        detected.add(step.id);
      }
    });
    return detected;
  }, [activeProject, builderMode, enabledStepIds, codeText]);

  const handleToggleStep = (stepId: string) => {
    if (!activeProject) return;
    soundEngine.playBlockSnap();
    setValidationError(null);
    setEnabledStepIds((prev) => {
      const next = prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId];
      setCodeText(buildProjectCodeFromSteps(activeProject, appTitle, next));
      return next;
    });
  };

  const handleAppTitleChange = (val: string) => {
    setAppTitle(val);
    if (activeProject && builderMode === 'blocks') {
      setCodeText(buildProjectCodeFromSteps(activeProject, val, enabledStepIds));
    }
  };

  const handleEnableAllSteps = () => {
    if (!activeProject) return;
    soundEngine.playBlockSnap();
    const allIds = activeProject.steps.map((s) => s.id);
    setEnabledStepIds(allIds);
    setCodeText(buildProjectCodeFromSteps(activeProject, appTitle, allIds));
    setValidationError(null);
  };

  const handleResetProject = () => {
    if (!activeProject) return;
    soundEngine.playButtonClick();
    const starter = [...activeProject.starterEnabledStepIds];
    setAppTitle(activeProject.defaultAppName);
    setEnabledStepIds(starter);
    setCodeText(buildProjectCodeFromSteps(activeProject, activeProject.defaultAppName, starter));
    setValidationError(null);
    setVictoryInfo(null);
  };

  const handleRunAndComplete = async () => {
    if (!activeProject) return;
    const missing = activeProject.steps.filter((s) => !effectiveEnabledSteps.has(s.id));
    if (missing.length > 0) {
      soundEngine.playCrash();
      setValidationError(
        `Masih ada ${missing.length} modul fitur belum diaktifkan: ${missing
          .map((m) => m.title)
          .join(', ')}. Aktifkan seluruh 4 modul agar aplikasi siap dijalankan!`
      );
      return;
    }

    setValidationError(null);
    setSaving(true);
    try {
      const finalCode =
        builderMode === 'code'
          ? codeText
          : buildProjectCodeFromSteps(activeProject, appTitle, enabledStepIds);
      const res = await onProjectComplete({
        projectId: activeProject.id,
        stars: 3,
        codeSubmitted: finalCode,
      });
      soundEngine.playVictory();
      const nextProj =
        APP_MAKER_PROJECTS.find((p) => p.order === activeProject.order + 1) || null;
      setVictoryInfo({
        projectTitle: activeProject.title,
        newCertificate: res.newCertificate,
        nextProject: nextProj,
      });
    } catch (err) {
      soundEngine.playCrash();
      setValidationError(
        err instanceof Error ? err.message : 'Gagal menyimpan progres proyek App Maker.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================== LOCKED ACCESS GATE (NO APP MAKER ACCESS) ====================
  if (!hasAccess && !isAdminPreview) {
    const waUrl = formatWhatsAppUrl(
      adminPhone,
      `Halo ${adminContactName}, saya ingin mengaktifkan akses Program Panduan App Maker (5 Proyek: Photogram AI, Todo App, Simple Calculator, Color Generatif, Weather App) di akun CodeSpark saya.`
    );

    return (
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
        <div className="neo-card bg-[#FFE600] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 text-xs font-extrabold">
              <Lock className="w-3.5 h-3.5" />
              Program Panduan App Maker · Terkunci
            </span>
            {requestedAppMaker && (
              <span className="inline-flex items-center gap-1.5 bg-[#C084FC] border-2 border-black px-3 py-1 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                Sudah Dipilih Saat Pendaftaran · Menunggu Aktivasi Admin
              </span>
            )}
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
              Bangun 5 Aplikasi Nyata di Program App Maker!
            </h1>
            <p className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed">
              {requestedAppMaker
                ? 'Permintaan program App Maker Anda sudah tercatat di sistem. Admin dapat langsung membuka akses di akun Anda secara manual, atau Anda bisa memasukkan Kode Akses yang menyertakan Program App Maker.'
                : 'Program App Maker merupakan kelas proyek lanjutan selain Coding Studio. Minta Admin membuka akses manual pada akun Anda atau masukkan Kode Akses Kelas App Maker.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {onRequestUpgrade && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  onRequestUpgrade();
                }}
                className="neo-btn bg-black text-white px-5 py-3 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                Aktifkan dengan Kode Akses
              </button>
            )}
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn bg-[#4ADE80] px-5 py-3 text-sm font-extrabold inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Admin via WhatsApp
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black text-xs font-extrabold">
                <Phone className="w-4 h-4" />
                Hubungi {adminContactName} untuk aktivasi manual
              </div>
            )}
          </div>
        </div>

        {/* Locked Roadmap Preview */}
        <div className="space-y-3">
          <h2 className="font-display text-xl font-extrabold">
            Pratinjau 5 Proyek Bertahap App Maker
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {APP_MAKER_PROJECTS.map((proj) => {
              const Icon = getProjectIcon(proj.id);
              return (
                <div key={proj.id} className="neo-card bg-neutral-100 p-5 opacity-85 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 border-2 border-black font-mono text-xs font-extrabold"
                      style={{ backgroundColor: proj.accentColor }}
                    >
                      Proyek 0{proj.order}
                    </span>
                    <Lock className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-extrabold leading-tight">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-neutral-600">{proj.concept}</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{proj.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // ==================== BUILDER VIEW (ACTIVE PROJECT) ====================
  if (activeProject) {
    const Icon = getProjectIcon(activeProject.id);
    const activeStepsCount = effectiveEnabledSteps.size;
    const isCompleted = completedProgressMap.has(activeProject.id);

    return (
      <main className="max-w-[1440px] w-full mx-auto p-4 sm:p-6 space-y-5 text-black">
        {/* Top Project Bar */}
        <div className="neo-card bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveProjectId(null);
              }}
              className="neo-btn bg-[#FFFDF7] px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Semua Proyek
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0"
                style={{ backgroundColor: activeProject.accentColor }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-extrabold bg-black text-white px-1.5 py-0.5">
                    PROYEK 0{activeProject.order}/05
                  </span>
                  {isAdminPreview && (
                    <span className="font-mono text-[11px] font-extrabold bg-[#FFE600] border border-black px-1.5 py-0.5">
                      PRATINJAU ADMIN
                    </span>
                  )}
                  {isCompleted && (
                    <span className="font-mono text-[11px] font-extrabold bg-[#4ADE80] border border-black px-1.5 py-0.5 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      SELESAI
                    </span>
                  )}
                </div>
                <h1 className="font-display text-lg sm:text-xl font-extrabold">
                  {activeProject.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Project Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {APP_MAKER_PROJECTS.map((proj) => {
              const unlocked = isProjectUnlocked(proj);
              const active = proj.id === activeProject.id;
              const done = completedProgressMap.has(proj.id);
              return (
                <button
                  key={proj.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setActiveProjectId(proj.id);
                  }}
                  title={
                    unlocked
                      ? `Proyek ${proj.order}: ${proj.title}`
                      : `Terkunci — Selesaikan Proyek ${proj.order - 1} dulu`
                  }
                  className={`px-2.5 py-1.5 border-2 border-black font-mono text-xs font-extrabold inline-flex items-center gap-1 ${
                    active
                      ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#000] cursor-pointer'
                      : unlocked
                        ? done
                          ? 'bg-[#4ADE80] cursor-pointer'
                          : 'bg-white cursor-pointer hover:bg-neutral-100'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {!unlocked && <Lock className="w-3 h-3" />}
                  P{proj.order}
                </button>
              );
            })}
          </div>
        </div>

        {/* Victory Banner */}
        {victoryInfo && (
          <div className="neo-card bg-[#4ADE80] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-display text-xl font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Proyek {victoryInfo.projectTitle} Berhasil Diselesaikan! (★★★)
              </div>
              <p className="text-xs sm:text-sm font-bold text-neutral-900">
                {victoryInfo.nextProject
                  ? `Hebat! Proyek berikutnya (${victoryInfo.nextProject.title}) kini sudah terbuka.`
                  : 'Luar biasa! Anda telah menuntaskan seluruh 5 proyek App Maker!'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {victoryInfo.newCertificate && onOpenCertificates && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onOpenCertificates();
                  }}
                  className="neo-btn bg-[#FFE600] px-4 py-2.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  Lihat Sertifikat App Maker
                </button>
              )}
              {victoryInfo.nextProject ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setActiveProjectId(victoryInfo.nextProject!.id);
                  }}
                  className="neo-btn bg-black text-white px-4 py-2.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Lanjut ke {victoryInfo.nextProject.shortTitle}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveProjectId(null)}
                  className="neo-btn bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
                >
                  Kembali ke Peta App Maker
                </button>
              )}
            </div>
          </div>
        )}

        {/* Split-Screen Builder + Live Device Simulator */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Guided Builder Panel */}
          <div className="lg:col-span-7 neo-card bg-white p-5 space-y-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold px-2 py-0.5 bg-[#FFFDF7] border-2 border-black">
                  Konsep: {activeProject.concept}
                </span>
                <span className="font-mono text-xs font-extrabold tabular-nums">
                  {activeStepsCount}/{activeProject.steps.length} Modul Aktif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                {activeProject.overview}
              </p>
            </div>

            {/* App Name + Mode Switch */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t-2 border-black/15">
              <div>
                <label htmlFor="app-maker-title" className="block text-xs font-extrabold mb-1">
                  Nama Aplikasi Anda
                </label>
                <input
                  id="app-maker-title"
                  type="text"
                  value={appTitle}
                  onChange={(e) => handleAppTitleChange(e.target.value)}
                  maxLength={32}
                  className="neo-input w-full px-3 py-2 text-sm font-bold"
                />
              </div>

              <div>
                <span className="block text-xs font-extrabold mb-1">Mode Perakitan</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setBuilderMode('blocks');
                    }}
                    className={`py-2 px-2 border-2 border-black text-xs font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer ${
                      builderMode === 'blocks' ? 'bg-[#FFE600]' : 'bg-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Blok Fitur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setBuilderMode('code');
                    }}
                    className={`py-2 px-2 border-2 border-black text-xs font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer ${
                      builderMode === 'code' ? 'bg-[#38BDF8]' : 'bg-white'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Kode JS
                  </button>
                </div>
              </div>
            </div>

            {/* Blocks or JS Editor */}
            {builderMode === 'blocks' ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display font-extrabold text-sm">
                    Aktifkan 4 Modul Fitur Secara Bertahap:
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleEnableAllSteps}
                      className="text-xs font-extrabold underline cursor-pointer hover:text-neutral-600"
                    >
                      Aktifkan Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleResetProject}
                      className="text-xs font-bold text-neutral-600 inline-flex items-center gap-1 cursor-pointer hover:text-black"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {activeProject.steps.map((step) => {
                    const active = enabledStepIds.includes(step.id);
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleToggleStep(step.id)}
                        className={`w-full text-left p-3.5 border-2 border-black transition-all cursor-pointer ${
                          active
                            ? 'bg-[#FFFDF7] shadow-[3px_3px_0px_0px_#000]'
                            : 'bg-neutral-50 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="w-5 h-5 border-2 border-black flex items-center justify-center shrink-0"
                                style={{ backgroundColor: active ? '#4ADE80' : '#FFFFFF' }}
                              >
                                {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </span>
                              <span className="font-display font-extrabold text-sm">
                                {step.title}
                              </span>
                              <span
                                className="px-1.5 py-0.5 border border-black text-[10px] font-extrabold"
                                style={{ backgroundColor: step.badgeColor }}
                              >
                                {active ? 'AKTIF' : 'KLIK UNTUK PASANG'}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-700 leading-relaxed pl-7">
                              {step.description}
                            </p>
                            <code className="block ml-7 mt-1.5 px-2 py-1 bg-neutral-900 text-[#4ADE80] font-mono text-[11px] overflow-x-auto">
                              {step.codeSnippet}
                            </code>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Editor Kode Aplikasi (JavaScript)</span>
                  <button
                    type="button"
                    onClick={handleEnableAllSteps}
                    className="underline font-extrabold cursor-pointer"
                  >
                    Isi Kode Lengkap 4 Modul
                  </button>
                </div>
                <textarea
                  rows={14}
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  spellCheck={false}
                  className="w-full p-3.5 bg-[#151821] text-[#4ADE80] border-[3px] border-black font-mono text-xs leading-relaxed resize-y"
                />
                <p className="text-[11px] text-neutral-600">
                  Tip: Setiap pemanggilan <code className="font-mono font-bold">app.addComponent(...)</code> &amp;{' '}
                  <code className="font-mono font-bold">app.addFeature(...)</code> langsung menyalakan fitur di pratinjau aplikasi sebelah kanan!
                </p>
              </div>
            )}

            {validationError && (
              <div className="p-3 bg-[#FB7185]/30 border-2 border-black text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Primary Build & Finish Action */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/15">
              <div className="text-xs font-bold text-neutral-700">
                Uji aplikasi di layar kanan, lalu klik tombol untuk menyelesaikan proyek!
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleRunAndComplete()}
                className="neo-btn bg-[#4ADE80] px-5 py-3 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                {saving
                  ? 'Menyimpan...'
                  : isCompleted
                    ? 'Simpan Ulang & Uji Proyek'
                    : 'Jalankan & Selesaikan Proyek'}
              </button>
            </div>
          </div>

          {/* RIGHT: Interactive Live App Simulator Frame */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
            <div className="bg-[#1F242D] border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-3 sm:p-4">
              {/* Mock Phone / Browser Top Chrome */}
              <div className="flex items-center justify-between mb-3 px-1 text-white">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FB7185] border border-black" />
                  <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-black" />
                  <span className="w-3 h-3 rounded-full bg-[#4ADE80] border border-black" />
                </div>
                <span className="font-mono text-[11px] font-bold text-neutral-300">
                  LIVE APP PREVIEW · INTERAKTIF
                </span>
                <span className="font-mono text-[10px] font-extrabold bg-[#4ADE80] text-black px-1.5 py-0.5">
                  {activeStepsCount}/4 ON
                </span>
              </div>

              {/* Actual Interactive App Canvas */}
              <div className="bg-[#FFFDF7] border-[3px] border-black p-4 min-h-[420px]">
                {activeProject.id === 'app_photogram' && (
                  <PhotogramLiveApp
                    appTitle={appTitle || activeProject.defaultAppName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'app_todo' && (
                  <TodoLiveApp
                    appTitle={appTitle || activeProject.defaultAppName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'app_calculator' && (
                  <CalculatorLiveApp
                    appTitle={appTitle || activeProject.defaultAppName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'app_color' && (
                  <ColorGeneratifLiveApp
                    appTitle={appTitle || activeProject.defaultAppName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'app_weather' && (
                  <WeatherLiveApp
                    appTitle={appTitle || activeProject.defaultAppName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
              </div>
            </div>

            {/* Learning Goals Compact Card */}
            <div className="neo-card bg-[#FFFDF7] p-4 space-y-2">
              <div className="font-display font-extrabold text-xs uppercase tracking-wide">
                Target Pembelajaran Proyek Ini:
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-800">
                {activeProject.learningGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-700" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==================== ROADMAP VIEW (5 SEQUENTIAL PROJECTS) ====================
  const progressPct = Math.round((completedCount / APP_MAKER_PROJECTS.length) * 100);

  return (
    <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
      {/* Header Banner */}
      <div className="neo-card bg-white p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-[#C084FC] border-2 border-black px-2.5 py-0.5 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            {isAdminPreview
              ? 'Pratinjau Admin · Seluruh 5 Proyek App Maker Terbuka'
              : 'Program Panduan App Maker · Akses Aktif'}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            App Maker — 5 Proyek Aplikasi Interaktif
          </h1>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl leading-relaxed">
            {isAdminPreview
              ? 'Uji langsung seluruh 5 proyek aplikasi interaktif tanpa terkunci. Siswa mengerjakan proyek secara bertahap dari Proyek 01 hingga Proyek 05.'
              : 'Setiap proyek dibuka secara bertahap. Selesaikan proyek sebelumnya terlebih dahulu untuk membuka proyek berikutnya dan raih Sertifikat App Maker!'}
          </p>
        </div>

        <div className="w-full lg:w-72 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-extrabold tabular-nums">
            <span>Progres App Maker</span>
            <span>
              {completedCount}/{APP_MAKER_PROJECTS.length} Proyek ({progressPct}%)
            </span>
          </div>
          <div className="h-3.5 bg-[#FFFDF7] border-2 border-black">
            <div className="h-full bg-[#C084FC]" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-neutral-600 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#FFE600] text-black" />
              {totalStars}/{APP_MAKER_PROJECTS.length * 3} Bintang
            </span>
            {completedCount === APP_MAKER_PROJECTS.length && onOpenCertificates && (
              <button
                type="button"
                onClick={onOpenCertificates}
                className="underline font-extrabold text-black cursor-pointer"
              >
                Lihat Sertifikat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5 Sequential Project Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {APP_MAKER_PROJECTS.map((proj) => {
          const Icon = getProjectIcon(proj.id);
          const prog = completedProgressMap.get(proj.id);
          const completed = Boolean(prog);
          const unlocked = isProjectUnlocked(proj);
          const prevProj = APP_MAKER_PROJECTS.find((p) => p.order === proj.order - 1);

          return (
            <div
              key={proj.id}
              className={`neo-card p-5 flex flex-col justify-between gap-4 ${
                unlocked ? 'bg-white' : 'bg-neutral-100 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2.5 py-1 border-2 border-black font-mono text-xs font-extrabold"
                    style={{ backgroundColor: unlocked ? proj.accentColor : '#E5E5E5' }}
                  >
                    Proyek 0{proj.order}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          prog && s <= prog.stars
                            ? 'fill-[#FFE600] text-black'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: unlocked ? proj.accentColor : '#E5E5E5' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-extrabold leading-tight">
                      {proj.title}
                    </h2>
                    <p className="text-[11px] font-bold text-neutral-600 mt-0.5">{proj.concept}</p>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed">{proj.subtitle}</p>

                <div className="flex flex-wrap gap-1">
                  {proj.steps.map((st) => (
                    <span
                      key={st.id}
                      className="text-[10px] font-bold px-2 py-0.5 bg-[#FFFDF7] border border-black/30"
                    >
                      {st.title.replace(/^\d+\.\s*/, '')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                <span className="text-xs font-bold inline-flex items-center gap-1">
                  {completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Selesai
                    </>
                  ) : unlocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                      Siap Dibangun
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Terkunci
                    </>
                  )}
                </span>

                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setActiveProjectId(proj.id);
                    }}
                    className={`neo-btn px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                      completed ? 'bg-[#FFE600]' : 'bg-[#4ADE80]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    {completed ? 'Buka Lagi' : 'Mulai Proyek'}
                  </button>
                ) : (
                  <span className="px-2.5 py-1.5 bg-neutral-200 border border-black/40 text-[11px] font-extrabold text-neutral-600">
                    Selesaikan {prevProj?.shortTitle} dulu
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
