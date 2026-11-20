import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Check,
  CheckCircle2,
  Code2,
  Gamepad2,
  Grid3X3,
  Heart,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Lightbulb,
  Lock,
  MessageCircle,
  Pause,
  Phone,
  Play,
  RefreshCw,
  Rocket,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react';
import type {
  CertificateRecord,
  GameMakerProjectId,
  ProgressRecord,
} from '../types';
import {
  GAME_MAKER_PROJECTS,
  buildGameCodeFromSteps,
  getGameMakerProjectById,
  type GameMakerProjectDef,
} from '../data/gameMakerProjects';
import { soundEngine } from '../engine/soundEngine';
import { formatWhatsAppUrl } from '../utils/crypto';

interface Props {
  hasAccess: boolean;
  requestedGameMaker?: boolean;
  isAdminPreview?: boolean;
  initialProjectId?: GameMakerProjectId | null;
  completedProgressMap: Map<string, ProgressRecord>;
  adminPhone?: string;
  adminContactName?: string;
  onRequestUpgrade?: () => void;
  onProjectComplete: (payload: {
    projectId: GameMakerProjectId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
  }) => Promise<{ newCertificate: CertificateRecord | null }>;
  onOpenCertificates?: () => void;
}

function getGameIcon(id: GameMakerProjectId) {
  switch (id) {
    case 'game_image_match':
      return ImageIcon;
    case 'game_memory_card':
      return Grid3X3;
    case 'game_color_puzzle':
      return Sparkles;
    case 'game_save_polar_bear':
      return Shield;
    case 'game_space_mission':
      return Rocket;
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ==================== 1. IMAGE MATCH LIVE GAME ====================

const MATCH_POOL = [
  { id: 'panda', emoji: '🐼', label: 'Panda', bg: '#DCFCE7' },
  { id: 'rocket', emoji: '🚀', label: 'Roket', bg: '#E0F2FE' },
  { id: 'crown', emoji: '👑', label: 'Mahkota', bg: '#FEF9C3' },
  { id: 'robot', emoji: '🤖', label: 'Robot', bg: '#F3E8FF' },
  { id: 'star', emoji: '🌟', label: 'Bintang', bg: '#FFEDD5' },
  { id: 'gem', emoji: '💎', label: 'Permata', bg: '#FCE7F3' },
  { id: 'bear', emoji: '🐻', label: 'Beruang', bg: '#FEF3C7' },
  { id: 'koala', emoji: '🐨', label: 'Koala', bg: '#E2E8F0' },
];

const ImageMatchLiveGame: React.FC<{ gameTitle: string; enabledSteps: Set<string> }> = ({
  gameTitle,
  enabledSteps,
}) => {
  const [options, setOptions] = useState(() => shuffleArray(MATCH_POOL).slice(0, 6));
  const [targetId, setTargetId] = useState(() => options[0].id);
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string>('Pilih gambar yang sama persis dengan target!');

  const hasBoard = enabledSteps.has('gm_im_board');
  const hasCheck = enabledSteps.has('gm_im_check');
  const hasCombo = enabledSteps.has('gm_im_combo');
  const hasWin = enabledSteps.has('gm_im_win');

  const targetItem = options.find((o) => o.id === targetId) || options[0];
  const won = hasWin && matches >= 6;

  const nextRound = () => {
    const nextOpts = shuffleArray(MATCH_POOL).slice(0, 6);
    const nextTarget = nextOpts[Math.floor(Math.random() * nextOpts.length)];
    setOptions(nextOpts);
    setTargetId(nextTarget.id);
  };

  const handleRestart = () => {
    soundEngine.playButtonClick();
    setScore(0);
    setMatches(0);
    setCombo(0);
    setFeedback('Ronde baru dimulai! Cari gambar yang cocok!');
    nextRound();
  };

  const handlePick = (itemId: string) => {
    if (!hasCheck || won) return;
    if (itemId === targetItem.id) {
      const nextCombo = hasCombo ? combo + 1 : 1;
      const gain = 10 + (hasCombo && nextCombo >= 2 ? (nextCombo - 1) * 5 : 0);
      const nextMatches = matches + 1;
      setScore((s) => s + gain);
      setMatches(nextMatches);
      setCombo(nextCombo);
      if (hasWin && nextMatches >= 6) {
        soundEngine.playVictory();
        setFeedback('🎉 Target 6 cocok tercapai! Kamu menang Image Match!');
      } else {
        soundEngine.playGemCollect();
        setFeedback(`Cocok! +${gain} poin${hasCombo && nextCombo >= 2 ? ` (Kombo x${nextCombo}!)` : ''}`);
        if (hasCombo) {
          nextRound();
        } else {
          const other = options[Math.floor(Math.random() * options.length)];
          setTargetId(other.id);
        }
      }
    } else {
      soundEngine.playCrash();
      setCombo(0);
      setFeedback('Belum cocok! Coba perhatikan gambar target di atas.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <ImageIcon className="w-4 h-4" />
          <span className="truncate">{gameTitle}</span>
        </div>
        <button
          type="button"
          onClick={handleRestart}
          className="px-2 py-0.5 bg-[#FFE600] border border-black text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Ulang
        </button>
      </div>

      {!hasBoard ? (
        <div className="p-5 text-center border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500">
          Aktifkan Modul 1 (Papan Target &amp; Grid Gambar) untuk menampilkan arena game.
        </div>
      ) : (
        <>
          {/* HUD Bar */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 bg-white border-2 border-black">
              <div className="text-[10px] font-bold text-neutral-500">Skor</div>
              <div className="font-mono text-sm font-extrabold">{score}</div>
            </div>
            <div className="p-1.5 bg-white border-2 border-black">
              <div className="text-[10px] font-bold text-neutral-500">Kombo</div>
              <div className="font-mono text-sm font-extrabold">{hasCombo ? `x${combo}` : '—'}</div>
            </div>
            <div className="p-1.5 bg-white border-2 border-black">
              <div className="text-[10px] font-bold text-neutral-500">Target</div>
              <div className="font-mono text-sm font-extrabold">{hasWin ? `${matches}/6` : matches}</div>
            </div>
          </div>

          {/* Target Box */}
          <div className="p-3 bg-[#FFE600] border-2 border-black flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase">Gambar Target:</div>
              <div className="font-display text-base font-extrabold">{targetItem.label}</div>
            </div>
            <div className="w-14 h-14 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-3xl">
              {targetItem.emoji}
            </div>
          </div>

          {/* Grid Options */}
          <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={!hasCheck || won}
                onClick={() => handlePick(opt.id)}
                className={`p-3 border-2 border-black flex flex-col items-center justify-center gap-1 transition-transform ${
                  hasCheck && !won
                    ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_#000]'
                    : 'opacity-70 cursor-not-allowed'
                }`}
                style={{ backgroundColor: opt.bg }}
              >
                <span className="text-3xl leading-none">{opt.emoji}</span>
                <span className="text-[10px] font-extrabold">{opt.label}</span>
              </button>
            ))}
          </div>

          <div
            className={`p-2 border-2 border-black text-xs font-extrabold text-center ${
              won ? 'bg-[#4ADE80]' : 'bg-white'
            }`}
          >
            {feedback}
          </div>

          {!hasCheck && (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 2 agar kartu gambar bisa diklik dan dinilai skornya.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== 2. MEMORY CARD LIVE GAME ====================

const MEMORY_ICONS = ['🐼', '🦊', '🚀', '💎', '🎮', '🌈'];

interface MemoryCardItem {
  uid: number;
  icon: string;
  matched: boolean;
}

function createMemoryDeck(): MemoryCardItem[] {
  return shuffleArray([...MEMORY_ICONS, ...MEMORY_ICONS]).map((icon, idx) => ({
    uid: idx,
    icon,
    matched: false,
  }));
}

const MemoryCardLiveGame: React.FC<{ gameTitle: string; enabledSteps: Set<string> }> = ({
  gameTitle,
  enabledSteps,
}) => {
  const [deck, setDeck] = useState<MemoryCardItem[]>(() => createMemoryDeck());
  const [flippedUids, setFlippedUids] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const hasDeck = enabledSteps.has('gm_mc_deck');
  const hasFlip = enabledSteps.has('gm_mc_flip');
  const hasStats = enabledSteps.has('gm_mc_stats');
  const hasWin = enabledSteps.has('gm_mc_win');

  const matchedPairs = deck.filter((c) => c.matched).length / 2;
  const allMatched = matchedPairs === MEMORY_ICONS.length;

  const handleRestart = () => {
    soundEngine.playButtonClick();
    setDeck(createMemoryDeck());
    setFlippedUids([]);
    setMoves(0);
    setLocked(false);
  };

  const handleCardClick = (uid: number) => {
    if (!hasFlip || locked) return;
    const card = deck.find((c) => c.uid === uid);
    if (!card || card.matched || flippedUids.includes(uid)) return;

    soundEngine.playBlockSnap();
    const nextFlipped = [...flippedUids, uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = deck.find((c) => c.uid === nextFlipped[0]);
      const second = deck.find((c) => c.uid === nextFlipped[1]);
      if (first && second && first.icon === second.icon) {
        const nextDeck = deck.map((c) =>
          c.uid === first.uid || c.uid === second.uid ? { ...c, matched: true } : c
        );
        setDeck(nextDeck);
        setFlippedUids([]);
        const doneNow = nextDeck.every((c) => c.matched);
        if (doneNow && hasWin) {
          soundEngine.playVictory();
        } else {
          soundEngine.playGemCollect();
        }
      } else {
        setLocked(true);
        window.setTimeout(() => {
          setFlippedUids([]);
          setLocked(false);
        }, 650);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <Grid3X3 className="w-4 h-4 text-purple-700" />
          <span className="truncate">{gameTitle}</span>
        </div>
        {hasStats && (
          <button
            type="button"
            onClick={handleRestart}
            className="px-2 py-0.5 bg-[#FFE600] border border-black text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Acak Ulang
          </button>
        )}
      </div>

      {!hasDeck ? (
        <div className="p-5 text-center border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500">
          Aktifkan Modul 1 (Dek 12 Kartu) untuk menampilkan papan kartu memori.
        </div>
      ) : (
        <>
          {hasStats && (
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-1.5 bg-white border-2 border-black">
                <div className="text-[10px] font-bold text-neutral-500">Langkah</div>
                <div className="font-mono text-sm font-extrabold">{moves}</div>
              </div>
              <div className="p-1.5 bg-white border-2 border-black">
                <div className="text-[10px] font-bold text-neutral-500">Pasangan Cocok</div>
                <div className="font-mono text-sm font-extrabold">
                  {matchedPairs}/{MEMORY_ICONS.length}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {deck.map((card) => {
              const isOpen = card.matched || flippedUids.includes(card.uid);
              return (
                <button
                  key={card.uid}
                  type="button"
                  disabled={!hasFlip || card.matched}
                  onClick={() => handleCardClick(card.uid)}
                  className={`h-16 border-2 border-black flex items-center justify-center text-2xl font-extrabold transition-all ${
                    card.matched
                      ? 'bg-[#4ADE80]'
                      : isOpen
                        ? 'bg-[#FFE600]'
                        : hasFlip
                          ? 'bg-[#C084FC] hover:bg-[#D8B4FE] cursor-pointer shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-neutral-200 cursor-not-allowed'
                  }`}
                >
                  {isOpen ? card.icon : '?'}
                </button>
              );
            })}
          </div>

          {hasWin && allMatched && (
            <div className="p-2.5 bg-[#4ADE80] border-2 border-black text-xs font-extrabold text-center flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4" />
              Semua 6 Pasang Kartu Ditemukan dalam {moves} Langkah!
            </div>
          )}

          {!hasFlip && (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 2 agar kartu dapat dibalik dan dicocokkan.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== 3. COLOR PUZZLE LIVE GAME ====================

const PUZZLE_COLORS = ['#FFE600', '#4ADE80', '#38BDF8', '#C084FC'];
const PUZZLE_LEVELS = [
  {
    name: 'Lv 1: Pelangi Baris',
    target: [0, 0, 0, 1, 1, 1, 2, 2, 2],
    start: [0, 1, 0, 1, 2, 1, 2, 0, 2],
  },
  {
    name: 'Lv 2: Silang Neon',
    target: [3, 0, 3, 0, 2, 0, 3, 0, 3],
    start: [0, 0, 3, 0, 1, 0, 3, 2, 0],
  },
  {
    name: 'Lv 3: Mahkota Warna',
    target: [0, 3, 0, 2, 1, 2, 1, 1, 1],
    start: [2, 3, 1, 2, 0, 2, 1, 3, 1],
  },
];

const ColorPuzzleLiveGame: React.FC<{ gameTitle: string; enabledSteps: Set<string> }> = ({
  gameTitle,
  enabledSteps,
}) => {
  const [lvlIdx, setLvlIdx] = useState(0);
  const [tiles, setTiles] = useState<number[]>(() => [...PUZZLE_LEVELS[0].start]);
  const [showHint, setShowHint] = useState(false);

  const hasGrid = enabledSteps.has('gm_cp_grid');
  const hasTap = enabledSteps.has('gm_cp_tap');
  const hasTarget = enabledSteps.has('gm_cp_target');
  const hasWin = enabledSteps.has('gm_cp_win');

  const currentLvl = PUZZLE_LEVELS[lvlIdx];
  const matchedCount = tiles.filter((val, i) => val === currentLvl.target[i]).length;
  const solved = matchedCount === 9;

  const selectLevel = (idx: number) => {
    soundEngine.playButtonClick();
    setLvlIdx(idx);
    setTiles([...PUZZLE_LEVELS[idx].start]);
    setShowHint(false);
  };

  const handleTileTap = (index: number) => {
    if (!hasTap) return;
    soundEngine.playBlockSnap();
    const next = [...tiles];
    next[index] = (next[index] + 1) % PUZZLE_COLORS.length;
    setTiles(next);
    if (hasWin && next.every((val, i) => val === currentLvl.target[i])) {
      soundEngine.playVictory();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <Sparkles className="w-4 h-4 text-[#E11D48]" />
          <span className="truncate">{gameTitle}</span>
        </div>
        {hasWin && (
          <span className="px-2 py-0.5 bg-[#4ADE80] border border-black font-mono text-[10px] font-extrabold">
            {matchedCount}/9 COCOK
          </span>
        )}
      </div>

      {!hasGrid ? (
        <div className="p-5 text-center border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500">
          Aktifkan Modul 1 (Papan Puzzle Warna 3×3) untuk memulai.
        </div>
      ) : (
        <>
          {/* Level Selector + Mini Target Pattern */}
          {hasTarget ? (
            <div className="p-2.5 bg-white border-2 border-black flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="text-[10px] font-extrabold uppercase text-neutral-600">
                  Pola Target ({currentLvl.name}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {PUZZLE_LEVELS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectLevel(idx)}
                      className={`px-2 py-0.5 border border-black text-[10px] font-extrabold cursor-pointer ${
                        idx === lvlIdx ? 'bg-[#FFE600]' : 'bg-white'
                      }`}
                    >
                      Lv {idx + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setShowHint((h) => !h);
                    }}
                    className={`px-2 py-0.5 border border-black text-[10px] font-extrabold inline-flex items-center gap-0.5 cursor-pointer ${
                      showHint ? 'bg-[#38BDF8]' : 'bg-white'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3" />
                    Hint
                  </button>
                </div>
              </div>

              {/* Mini 3x3 Target */}
              <div className="grid grid-cols-3 gap-0.5 p-1 bg-black shrink-0">
                {currentLvl.target.map((cIdx, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4"
                    style={{ backgroundColor: PUZZLE_COLORS[cIdx] }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 3 untuk melihat Pola Target &amp; tombol Hint.
            </div>
          )}

          {/* Main Interactive 3x3 Grid */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {tiles.map((cIdx, idx) => {
              const wrong = hasTarget && showHint && cIdx !== currentLvl.target[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!hasTap}
                  onClick={() => handleTileTap(idx)}
                  className={`h-16 border-[3px] border-black flex items-center justify-center font-extrabold text-xs transition-transform ${
                    hasTap
                      ? 'cursor-pointer active:scale-95 shadow-[3px_3px_0px_0px_#000]'
                      : 'cursor-not-allowed opacity-75'
                  }`}
                  style={{ backgroundColor: PUZZLE_COLORS[cIdx] }}
                >
                  {wrong ? '!' : ''}
                </button>
              );
            })}
          </div>

          {hasWin && solved && (
            <div className="p-2.5 bg-[#4ADE80] border-2 border-black text-xs font-extrabold text-center flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4" />
              Hebat! Pola Warna 3×3 Cocok Sempurna!
            </div>
          )}

          {!hasTap && (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 2 agar ubin bisa diklik untuk mengganti warna.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== 4. SAVE THE POLAR BEAR LIVE GAME ====================

// 0 = ice, 1 = water/hole, 2 = fish, 3 = safe island
const INITIAL_ARCTIC_MAP = [
  [0, 0, 2, 0, 0],
  [0, 1, 0, 1, 0],
  [2, 0, 0, 0, 2],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 3],
];

const SavePolarBearLiveGame: React.FC<{ gameTitle: string; enabledSteps: Set<string> }> = ({
  gameTitle,
  enabledSteps,
}) => {
  const [grid, setGrid] = useState<number[][]>(() => INITIAL_ARCTIC_MAP.map((r) => [...r]));
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [fish, setFish] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'trapped'>('playing');

  const hasMap = enabledSteps.has('gm_pb_map');
  const hasMove = enabledSteps.has('gm_pb_move');
  const hasIce = enabledSteps.has('gm_pb_ice');
  const hasRescue = enabledSteps.has('gm_pb_rescue');

  const handleReset = () => {
    soundEngine.playButtonClick();
    setGrid(INITIAL_ARCTIC_MAP.map((r) => [...r]));
    setPos({ x: 0, y: 0 });
    setFish(0);
    setStatus('playing');
  };

  const moveBear = (dx: number, dy: number) => {
    if (!hasMove || status !== 'playing') return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) {
      soundEngine.playCrash();
      return;
    }
    const targetTile = grid[ny][nx];
    if (targetTile === 1) {
      soundEngine.playCrash();
      return;
    }

    const nextGrid = grid.map((r) => [...r]);
    if (hasIce) {
      nextGrid[pos.y][pos.x] = 1; // Previous ice melts into ocean!
    }

    if (hasRescue && targetTile === 2) {
      setFish((f) => f + 1);
      nextGrid[ny][nx] = 0;
      soundEngine.playGemCollect();
    } else if (hasRescue && targetTile === 3) {
      setGrid(nextGrid);
      setPos({ x: nx, y: ny });
      setStatus('won');
      soundEngine.playVictory();
      return;
    } else {
      soundEngine.playStep();
    }

    setGrid(nextGrid);
    setPos({ x: nx, y: ny });

    // Check if trapped (all 4 neighbors blocked)
    if (hasIce) {
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      const canEscape = dirs.some(([ox, oy]) => {
        const cx = nx + ox;
        const cy = ny + oy;
        return cx >= 0 && cx < 5 && cy >= 0 && cy < 5 && nextGrid[cy][cx] !== 1;
      });
      if (!canEscape) {
        setStatus('trapped');
        soundEngine.playCrash();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <Shield className="w-4 h-4 text-sky-700" />
          <span className="truncate">{gameTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasRescue && (
            <span className="px-2 py-0.5 bg-[#FFE600] border border-black font-mono text-[10px] font-extrabold">
              🐟 {fish}/3
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-0.5 bg-white border border-black text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Ulang
          </button>
        </div>
      </div>

      {!hasMap ? (
        <div className="p-5 text-center border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500">
          Aktifkan Modul 1 (Peta Es Kutub 5×5) untuk menampilkan Beruang Kutub.
        </div>
      ) : (
        <>
          {/* 5x5 Arctic Grid */}
          <div className="grid grid-cols-5 gap-1 max-w-[260px] mx-auto p-1.5 bg-[#0EA5E9] border-2 border-black">
            {grid.map((row, y) =>
              row.map((cell, x) => {
                const isBear = pos.x === x && pos.y === y;
                let bg = '#E0F2FE';
                let symbol = '';
                if (cell === 1) {
                  bg = '#0284C7';
                  symbol = '🌊';
                } else if (cell === 2 && hasRescue) {
                  bg = '#BAE6FD';
                  symbol = '🐟';
                } else if (cell === 3 && hasRescue) {
                  bg = '#4ADE80';
                  symbol = '🏝️';
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    className="h-11 border border-black flex items-center justify-center text-xl font-bold select-none"
                    style={{ backgroundColor: bg }}
                  >
                    {isBear ? '🐻‍❄️' : symbol}
                  </div>
                );
              })
            )}
          </div>

          {/* D-Pad Controls */}
          {hasMove ? (
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => moveBear(0, -1)}
                className="w-11 h-9 bg-[#FFE600] border-2 border-black flex items-center justify-center cursor-pointer active:translate-y-0.5"
                aria-label="Atas"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBear(-1, 0)}
                  className="w-11 h-9 bg-[#FFE600] border-2 border-black flex items-center justify-center cursor-pointer active:translate-y-0.5"
                  aria-label="Kiri"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBear(0, 1)}
                  className="w-11 h-9 bg-[#FFE600] border-2 border-black flex items-center justify-center cursor-pointer active:translate-y-0.5"
                  aria-label="Bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBear(1, 0)}
                  className="w-11 h-9 bg-[#FFE600] border-2 border-black flex items-center justify-center cursor-pointer active:translate-y-0.5"
                  aria-label="Kanan"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 2 untuk menyalakan tombol arah 4 penjuru.
            </div>
          )}

          {status === 'won' && (
            <div className="p-2.5 bg-[#4ADE80] border-2 border-black text-xs font-extrabold text-center">
              🎉 Beruang Kutub berhasil selamat di Pulau Aman! (Ikan terkumpul: {fish}/3)
            </div>
          )}
          {status === 'trapped' && (
            <div className="p-2.5 bg-[#FB7185] border-2 border-black text-xs font-extrabold text-center">
              Es di sekitar mencair! Klik "Ulang" untuk mencoba jalur penyelamatan lain.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== 5. SPACE MISSION LIVE GAME ====================

interface SpaceEntity {
  id: number;
  lane: number; // 0..4
  row: number; // 0..5 (5 = ship row)
  kind: 'meteor' | 'star';
}

const SpaceMissionLiveGame: React.FC<{ gameTitle: string; enabledSteps: Set<string> }> = ({
  gameTitle,
  enabledSteps,
}) => {
  const [shipLane, setShipLane] = useState(2);
  const [running, setRunning] = useState(false);
  const [entities, setEntities] = useState<SpaceEntity[]>([]);
  const [laserLane, setLaserLane] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [missionWon, setMissionWon] = useState(false);

  const hasShip = enabledSteps.has('gm_sm_ship');
  const hasLaser = enabledSteps.has('gm_sm_laser');
  const hasMeteor = enabledSteps.has('gm_sm_meteor');
  const hasMission = enabledSteps.has('gm_sm_mission');

  const gameOver = lives <= 0;

  useEffect(() => {
    if (!running || !hasMeteor || gameOver || missionWon) return;

    const timer = window.setInterval(() => {
      setEntities((prev) => {
        const moved: SpaceEntity[] = [];
        let hitMeteor = false;
        let caughtStar = false;

        for (const item of prev) {
          const nextRow = item.row + 1;
          if (nextRow === 5) {
            if (item.lane === shipLane) {
              if (item.kind === 'meteor') hitMeteor = true;
              else caughtStar = true;
            }
          } else if (nextRow < 5) {
            moved.push({ ...item, row: nextRow });
          }
        }

        if (hitMeteor) {
          soundEngine.playCrash();
          setLives((l) => Math.max(0, l - 1));
        }
        if (caughtStar) {
          soundEngine.playGemCollect();
          setScore((s) => {
            const nextScore = s + 20;
            if (hasMission && nextScore >= 100) {
              setMissionWon(true);
              setRunning(false);
              soundEngine.playVictory();
            }
            return nextScore;
          });
        }

        // Spawn 1 new meteor or star at row 0
        const spawnLane = Math.floor(Math.random() * 5);
        const kind: 'meteor' | 'star' = Math.random() < 0.35 ? 'star' : 'meteor';
        moved.push({ id: Date.now() + Math.random(), lane: spawnLane, row: 0, kind });
        return moved;
      });
    }, 620);

    return () => window.clearInterval(timer);
  }, [running, hasMeteor, gameOver, missionWon, shipLane, hasMission]);

  const handleRestart = () => {
    soundEngine.playButtonClick();
    setShipLane(2);
    setEntities([]);
    setScore(0);
    setLives(3);
    setMissionWon(false);
    setRunning(true);
  };

  const handleFire = () => {
    if (!hasLaser || gameOver || missionWon) return;
    soundEngine.playBlockSnap();
    setLaserLane(shipLane);
    window.setTimeout(() => setLaserLane(null), 180);

    setEntities((prev) => {
      // Destroy lowest meteor in shipLane
      const targets = prev
        .filter((e) => e.lane === shipLane && e.kind === 'meteor')
        .sort((a, b) => b.row - a.row);
      if (targets.length === 0) return prev;
      const target = targets[0];
      setScore((s) => {
        const nextScore = s + 15;
        if (hasMission && nextScore >= 100) {
          setMissionWon(true);
          setRunning(false);
          soundEngine.playVictory();
        }
        return nextScore;
      });
      return prev.filter((e) => e.id !== target.id);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-display font-extrabold text-sm">
          <Rocket className="w-4 h-4 text-emerald-700" />
          <span className="truncate">{gameTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasMeteor && (
            <span className="inline-flex items-center gap-0.5 text-xs font-extrabold">
              {[1, 2, 3].map((i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i <= lives ? 'fill-[#FB7185] text-black' : 'text-neutral-300'
                  }`}
                />
              ))}
            </span>
          )}
          <span className="px-2 py-0.5 bg-[#FFE600] border border-black font-mono text-[10px] font-extrabold">
            {score}/{hasMission ? 100 : '∞'}
          </span>
        </div>
      </div>

      {!hasShip ? (
        <div className="p-5 text-center border-2 border-dashed border-black/30 text-xs font-bold text-neutral-500">
          Aktifkan Modul 1 (Arena Galaksi &amp; Pesawat Roket) untuk memulai misi.
        </div>
      ) : (
        <>
          {/* Space 5x6 Arena */}
          <div className="bg-[#0F172A] border-2 border-black p-2 grid grid-cols-5 gap-1">
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: 5 }).map((__, lane) => {
                const isShip = row === 5 && lane === shipLane;
                const ent = entities.find((e) => e.row === row && e.lane === lane);
                const isBeam = laserLane === lane && row < 5;

                return (
                  <div
                    key={`${row}-${lane}`}
                    className={`h-9 border border-white/10 flex items-center justify-center text-lg relative ${
                      isBeam ? 'bg-[#FFE600]/30' : 'bg-[#1E293B]/60'
                    }`}
                  >
                    {isShip ? (
                      <span>🚀</span>
                    ) : ent ? (
                      <span>{ent.kind === 'meteor' ? '☄️' : '⭐'}</span>
                    ) : isBeam ? (
                      <span className="text-xs text-[#FFE600]">⚡</span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              disabled={!hasLaser || gameOver || missionWon}
              onClick={() => {
                soundEngine.playStep();
                setShipLane((l) => Math.max(0, l - 1));
              }}
              className="py-2 bg-[#38BDF8] border-2 border-black font-extrabold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
              aria-label="Kiri"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!hasLaser || gameOver || missionWon}
              onClick={handleFire}
              className="py-2 bg-[#FFE600] border-2 border-black font-extrabold text-xs inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 col-span-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Tembak Laser
            </button>
            <button
              type="button"
              disabled={!hasLaser || gameOver || missionWon}
              onClick={() => {
                soundEngine.playStep();
                setShipLane((l) => Math.min(4, l + 1));
              }}
              className="py-2 bg-[#38BDF8] border-2 border-black font-extrabold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
              aria-label="Kanan"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {hasMeteor ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (gameOver || missionWon) handleRestart();
                  else setRunning((r) => !r);
                }}
                className="flex-1 py-2 bg-[#4ADE80] border-2 border-black text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {running ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Jeda Misi
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    {gameOver || missionWon ? 'Main Ulang Misi' : 'Mulai Gelombang Meteor'}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-2 bg-neutral-100 border border-dashed border-black/40 text-[11px] font-bold text-neutral-500">
              🔒 Aktifkan Modul 3 untuk menghadirkan Gelombang Meteor &amp; Bintang.
            </div>
          )}

          {missionWon && (
            <div className="p-2.5 bg-[#4ADE80] border-2 border-black text-xs font-extrabold text-center">
              🏆 MISI GALAKSI BERHASIL! Skor mencapai {score} poin!
            </div>
          )}
          {gameOver && (
            <div className="p-2.5 bg-[#FB7185] border-2 border-black text-xs font-extrabold text-center">
              Pesawat terkena meteor! Klik "Main Ulang Misi" untuk mencoba lagi.
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== MAIN GAME MAKER WORKSPACE ====================

export const GameMakerWorkspace: React.FC<Props> = ({
  hasAccess,
  requestedGameMaker = false,
  isAdminPreview = false,
  initialProjectId = null,
  completedProgressMap,
  adminPhone = '',
  adminContactName = 'Admin CodeSpark',
  onRequestUpgrade,
  onProjectComplete,
  onOpenCertificates,
}) => {
  const [activeProjectId, setActiveProjectId] = useState<GameMakerProjectId | null>(
    initialProjectId
  );
  const [builderMode, setBuilderMode] = useState<'blocks' | 'code'>('blocks');
  const [gameTitle, setGameTitle] = useState('');
  const [enabledStepIds, setEnabledStepIds] = useState<string[]>([]);
  const [codeText, setCodeText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [victoryInfo, setVictoryInfo] = useState<{
    projectTitle: string;
    newCertificate: CertificateRecord | null;
    nextProject: GameMakerProjectDef | null;
  } | null>(null);

  useEffect(() => {
    if (initialProjectId) {
      setActiveProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  const activeProject = activeProjectId ? getGameMakerProjectById(activeProjectId) || null : null;

  useEffect(() => {
    if (!activeProject) return;
    const prevRecord = completedProgressMap.get(activeProject.id);
    const defaultSteps = prevRecord
      ? activeProject.steps.map((s) => s.id)
      : [...activeProject.starterEnabledStepIds];
    setGameTitle(activeProject.defaultGameName);
    setEnabledStepIds(defaultSteps);
    setCodeText(
      prevRecord?.codeSubmitted ||
        buildGameCodeFromSteps(activeProject, activeProject.defaultGameName, defaultSteps)
    );
    setValidationError(null);
    setVictoryInfo(null);
    setBuilderMode('blocks');
  }, [activeProjectId]);

  const completedCount = useMemo(
    () => GAME_MAKER_PROJECTS.filter((p) => completedProgressMap.has(p.id)).length,
    [completedProgressMap]
  );

  const totalStars = useMemo(
    () =>
      GAME_MAKER_PROJECTS.reduce(
        (sum, p) => sum + (completedProgressMap.get(p.id)?.stars || 0),
        0
      ),
    [completedProgressMap]
  );

  const isProjectUnlocked = (project: GameMakerProjectDef): boolean => {
    if (isAdminPreview) return true;
    if (project.order === 1) return true;
    const prev = GAME_MAKER_PROJECTS.find((p) => p.order === project.order - 1);
    return prev ? completedProgressMap.has(prev.id) : true;
  };

  const effectiveEnabledSteps = useMemo(() => {
    if (!activeProject) return new Set<string>();
    if (builderMode === 'blocks') return new Set(enabledStepIds);
    const detected = new Set<string>();
    activeProject.steps.forEach((step) => {
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
      setCodeText(buildGameCodeFromSteps(activeProject, gameTitle, next));
      return next;
    });
  };

  const handleGameTitleChange = (val: string) => {
    setGameTitle(val);
    if (activeProject && builderMode === 'blocks') {
      setCodeText(buildGameCodeFromSteps(activeProject, val, enabledStepIds));
    }
  };

  const handleEnableAllSteps = () => {
    if (!activeProject) return;
    soundEngine.playBlockSnap();
    const allIds = activeProject.steps.map((s) => s.id);
    setEnabledStepIds(allIds);
    setCodeText(buildGameCodeFromSteps(activeProject, gameTitle, allIds));
    setValidationError(null);
  };

  const handleResetProject = () => {
    if (!activeProject) return;
    soundEngine.playButtonClick();
    const starter = [...activeProject.starterEnabledStepIds];
    setGameTitle(activeProject.defaultGameName);
    setEnabledStepIds(starter);
    setCodeText(buildGameCodeFromSteps(activeProject, activeProject.defaultGameName, starter));
    setValidationError(null);
    setVictoryInfo(null);
  };

  const handleRunAndComplete = async () => {
    if (!activeProject) return;
    const missing = activeProject.steps.filter((s) => !effectiveEnabledSteps.has(s.id));
    if (missing.length > 0) {
      soundEngine.playCrash();
      setValidationError(
        `Masih ada ${missing.length} modul game belum diaktifkan: ${missing
          .map((m) => m.title)
          .join(', ')}. Aktifkan seluruh 4 modul agar game lengkap & siap diselesaikan!`
      );
      return;
    }

    setValidationError(null);
    setSaving(true);
    try {
      const finalCode =
        builderMode === 'code'
          ? codeText
          : buildGameCodeFromSteps(activeProject, gameTitle, enabledStepIds);
      const res = await onProjectComplete({
        projectId: activeProject.id,
        stars: 3,
        codeSubmitted: finalCode,
      });
      soundEngine.playVictory();
      const nextProj =
        GAME_MAKER_PROJECTS.find((p) => p.order === activeProject.order + 1) || null;
      setVictoryInfo({
        projectTitle: activeProject.title,
        newCertificate: res.newCertificate,
        nextProject: nextProj,
      });
    } catch (err) {
      soundEngine.playCrash();
      setValidationError(
        err instanceof Error ? err.message : 'Gagal menyimpan progres proyek Game Maker.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================== LOCKED ACCESS GATE ====================
  if (!hasAccess && !isAdminPreview) {
    const waUrl = formatWhatsAppUrl(
      adminPhone,
      `Halo ${adminContactName}, saya ingin mengaktifkan akses Program Panduan Game Maker (5 Game: Image Match, Memory Card, Color Puzzle, Save the Polar Bear, Space Mission) di akun CodeSpark saya.`
    );

    return (
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
        <div className="neo-card bg-[#38BDF8] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 text-xs font-extrabold">
              <Lock className="w-3.5 h-3.5" />
              Program Panduan Game Maker · Terkunci
            </span>
            {requestedGameMaker && (
              <span className="inline-flex items-center gap-1.5 bg-[#FFE600] border-2 border-black px-3 py-1 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                Sudah Dipilih Saat Pendaftaran · Menunggu Aktivasi Admin
              </span>
            )}
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
              Ciptakan 5 Game Seru di Program Game Maker!
            </h1>
            <p className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed">
              {requestedGameMaker
                ? 'Permintaan program Game Maker Anda sudah tercatat. Admin dapat langsung membuka akses manual pada akun Anda, atau masukkan Kode Akses yang menyertakan Program Game Maker.'
                : 'Program Game Maker mengajarkan perancangan 5 game interaktif secara bertahap (Image Match hingga Space Mission). Minta Admin membuka akses manual di akun Anda atau gunakan Kode Akses Game Maker.'}
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
            Pratinjau 5 Game Bertahap Game Maker
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAME_MAKER_PROJECTS.map((proj) => {
              const Icon = getGameIcon(proj.id);
              return (
                <div key={proj.id} className="neo-card bg-neutral-100 p-5 opacity-85 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 border-2 border-black font-mono text-xs font-extrabold"
                      style={{ backgroundColor: proj.accentColor }}
                    >
                      Game 0{proj.order}
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

  // ==================== BUILDER + LIVE PLAY VIEW ====================
  if (activeProject) {
    const Icon = getGameIcon(activeProject.id);
    const activeStepsCount = effectiveEnabledSteps.size;
    const isCompleted = completedProgressMap.has(activeProject.id);

    return (
      <main className="max-w-[1440px] w-full mx-auto p-4 sm:p-6 space-y-5 text-black">
        {/* Top Game Bar */}
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
              Semua Game
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
                    GAME 0{activeProject.order}/05
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

          {/* Quick Game Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {GAME_MAKER_PROJECTS.map((proj) => {
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
                      ? `Game ${proj.order}: ${proj.title}`
                      : `Terkunci — Selesaikan Game ${proj.order - 1} dulu`
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
                  G{proj.order}
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
                <Trophy className="w-5 h-5" />
                Game {victoryInfo.projectTitle} Berhasil Diselesaikan! (★★★)
              </div>
              <p className="text-xs sm:text-sm font-bold text-neutral-900">
                {victoryInfo.nextProject
                  ? `Keren! Game berikutnya (${victoryInfo.nextProject.title}) kini sudah terbuka.`
                  : 'Luar biasa! Anda telah menuntaskan seluruh 5 proyek Game Maker!'}
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
                  Lihat Sertifikat Game Maker
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
                  Kembali ke Peta Game Maker
                </button>
              )}
            </div>
          </div>
        )}

        {/* Split-Screen Game Builder + Live Playable Arcade Frame */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Guided Game Builder */}
          <div className="lg:col-span-7 neo-card bg-white p-5 space-y-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold px-2 py-0.5 bg-[#FFFDF7] border-2 border-black">
                  Konsep: {activeProject.concept}
                </span>
                <span className="font-mono text-xs font-extrabold tabular-nums">
                  {activeStepsCount}/{activeProject.steps.length} Modul Game Aktif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                {activeProject.overview}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t-2 border-black/15">
              <div>
                <label htmlFor="game-maker-title" className="block text-xs font-extrabold mb-1">
                  Judul Game Anda
                </label>
                <input
                  id="game-maker-title"
                  type="text"
                  value={gameTitle}
                  onChange={(e) => handleGameTitleChange(e.target.value)}
                  maxLength={32}
                  className="neo-input w-full px-3 py-2 text-sm font-bold"
                />
              </div>

              <div>
                <span className="block text-xs font-extrabold mb-1">Mode Perakitan Game</span>
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
                    Blok Mekanik
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

            {builderMode === 'blocks' ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display font-extrabold text-sm">
                    Aktifkan 4 Modul Mekanik Game Secara Bertahap:
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
                        <div className="space-y-1">
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
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Editor Kode Game (JavaScript)</span>
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
                  className="w-full p-3.5 bg-[#151821] text-[#38BDF8] border-[3px] border-black font-mono text-xs leading-relaxed resize-y"
                />
                <p className="text-[11px] text-neutral-600">
                  Tip: Setiap pemanggilan <code className="font-mono font-bold">game.addScene(...)</code>,{' '}
                  <code className="font-mono font-bold">game.addRule(...)</code> &amp;{' '}
                  <code className="font-mono font-bold">game.addFeature(...)</code> langsung menyalakan mekanik di mesin game kanan!
                </p>
              </div>
            )}

            {validationError && (
              <div className="p-3 bg-[#FB7185]/30 border-2 border-black text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/15">
              <div className="text-xs font-bold text-neutral-700">
                Mainkan &amp; uji game di layar kanan, lalu klik tombol untuk membuka game berikutnya!
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
                    ? 'Simpan Ulang & Uji Game'
                    : 'Jalankan & Selesaikan Game'}
              </button>
            </div>
          </div>

          {/* RIGHT: Live Playable Game Console */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
            <div className="bg-[#181C24] border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 px-1 text-white">
                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-[#38BDF8]" />
                  <span className="font-mono text-[11px] font-bold text-neutral-200">
                    PLAYABLE GAME CONSOLE
                  </span>
                </div>
                <span className="font-mono text-[10px] font-extrabold bg-[#38BDF8] text-black px-1.5 py-0.5">
                  {activeStepsCount}/4 ON
                </span>
              </div>

              <div className="bg-[#FFFDF7] border-[3px] border-black p-4 min-h-[420px]">
                {activeProject.id === 'game_image_match' && (
                  <ImageMatchLiveGame
                    gameTitle={gameTitle || activeProject.defaultGameName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'game_memory_card' && (
                  <MemoryCardLiveGame
                    gameTitle={gameTitle || activeProject.defaultGameName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'game_color_puzzle' && (
                  <ColorPuzzleLiveGame
                    gameTitle={gameTitle || activeProject.defaultGameName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'game_save_polar_bear' && (
                  <SavePolarBearLiveGame
                    gameTitle={gameTitle || activeProject.defaultGameName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
                {activeProject.id === 'game_space_mission' && (
                  <SpaceMissionLiveGame
                    gameTitle={gameTitle || activeProject.defaultGameName}
                    enabledSteps={effectiveEnabledSteps}
                  />
                )}
              </div>
            </div>

            <div className="neo-card bg-[#FFFDF7] p-4 space-y-2">
              <div className="font-display font-extrabold text-xs uppercase tracking-wide">
                Target Pembelajaran Game Ini:
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

  // ==================== ROADMAP VIEW (5 SEQUENTIAL GAMES) ====================
  const progressPct = Math.round((completedCount / GAME_MAKER_PROJECTS.length) * 100);

  return (
    <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
      {/* Header Banner */}
      <div className="neo-card bg-white p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-[#38BDF8] border-2 border-black px-2.5 py-0.5 text-xs font-extrabold">
            <Gamepad2 className="w-3.5 h-3.5" />
            {isAdminPreview
              ? 'Pratinjau Admin · Seluruh 5 Game Terbuka'
              : 'Program Panduan Game Maker · Akses Aktif'}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            Game Maker — 5 Proyek Game Interaktif
          </h1>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl leading-relaxed">
            {isAdminPreview
              ? 'Uji langsung seluruh 5 proyek game tanpa terkunci. Di sisi siswa, game dibuka secara bertahap dari Game 01 hingga Game 05.'
              : 'Setiap game dibuka secara bertahap! Selesaikan game sebelumnya untuk membuka tantangan game berikutnya dan raih Sertifikat Game Maker.'}
          </p>
        </div>

        <div className="w-full lg:w-72 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-extrabold tabular-nums">
            <span>Progres Game Maker</span>
            <span>
              {completedCount}/{GAME_MAKER_PROJECTS.length} Game ({progressPct}%)
            </span>
          </div>
          <div className="h-3.5 bg-[#FFFDF7] border-2 border-black">
            <div className="h-full bg-[#38BDF8]" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-neutral-600 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#FFE600] text-black" />
              {totalStars}/{GAME_MAKER_PROJECTS.length * 3} Bintang
            </span>
            {completedCount === GAME_MAKER_PROJECTS.length && onOpenCertificates && (
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

      {/* 5 Sequential Game Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {GAME_MAKER_PROJECTS.map((proj) => {
          const Icon = getGameIcon(proj.id);
          const prog = completedProgressMap.get(proj.id);
          const completed = Boolean(prog);
          const unlocked = isProjectUnlocked(proj);
          const prevProj = GAME_MAKER_PROJECTS.find((p) => p.order === proj.order - 1);

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
                    Game 0{proj.order}
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
                    {completed ? 'Main & Edit' : 'Buat Game'}
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
