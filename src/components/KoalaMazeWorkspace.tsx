import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  ALL_KOALA_SUBLEVELS,
  KOALA_MAZE_LEVELS,
  type KoalaBlockNode,
  type KoalaBlockType,
  type KoalaDir,
  type KoalaPathSensor,
  type KoalaSubLevel,
} from '../data/koalaMazeLevels';
import {
  cloneKoalaBlocks,
  countKoalaBlocks,
  executeKoalaMaze,
  koalaBlocksToJavaScript,
  koalaBlocksToPython,
  type KoalaFrame,
} from '../engine/koalaMazeEngine';
import { soundEngine } from '../engine/soundEngine';

interface Props {
  studentName?: string;
}

const STORAGE_KEY = 'codespark_koala_maze_completed_v1';

// ==================== HAND-CRAFTED KOALA & EUCALYPTUS SVGS ====================

const KoalaSvg: React.FC<{
  className?: string;
  mood?: 'normal' | 'happy' | 'dizzy';
}> = ({ className = 'w-10 h-10', mood = 'normal' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-label="Karakter Koala">
    {/* Big fluffy ears */}
    <circle cx="14" cy="24" r="12" fill="#7D8794" stroke="#2D3748" strokeWidth="2.5" />
    <circle cx="14" cy="24" r="6.5" fill="#E2E8F0" />
    <circle cx="50" cy="24" r="12" fill="#7D8794" stroke="#2D3748" strokeWidth="2.5" />
    <circle cx="50" cy="24" r="6.5" fill="#E2E8F0" />

    {/* Head */}
    <ellipse cx="32" cy="35" rx="20" ry="18" fill="#94A0AE" stroke="#2D3748" strokeWidth="2.5" />
    {/* Forehead highlight */}
    <ellipse cx="32" cy="24" rx="11" ry="5" fill="#B0BAC6" opacity="0.7" />
    {/* Soft chin */}
    <ellipse cx="32" cy="45" rx="11" ry="6" fill="#E2E8F0" opacity="0.85" />

    {/* Eyes */}
    {mood === 'dizzy' ? (
      <>
        <path d="M20 30 L26 36 M26 30 L20 36" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M38 30 L44 36 M44 30 L38 36" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ) : mood === 'happy' ? (
      <>
        <path d="M19 33 Q23 28 27 33" fill="none" stroke="#1E293B" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M37 33 Q41 28 45 33" fill="none" stroke="#1E293B" strokeWidth="2.6" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="23" cy="33" r="3.4" fill="#1E293B" />
        <circle cx="24" cy="31.8" r="1.1" fill="#FFFFFF" />
        <circle cx="41" cy="33" r="3.4" fill="#1E293B" />
        <circle cx="42" cy="31.8" r="1.1" fill="#FFFFFF" />
      </>
    )}

    {/* Rosy cheeks */}
    <ellipse cx="18" cy="39" rx="3.2" ry="2" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="46" cy="39" rx="3.2" ry="2" fill="#FDA4AF" opacity="0.8" />

    {/* Iconic big oval koala nose */}
    <ellipse cx="32" cy="37" rx="5.5" ry="7.2" fill="#1E293B" />
    <ellipse cx="30.6" cy="34.2" rx="1.6" ry="2.2" fill="#64748B" opacity="0.8" />

    {/* Smile */}
    {mood === 'dizzy' ? (
      <path d="M27 47 Q32 43 37 47" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
    ) : (
      <path d="M27 45 Q32 49.5 37 45" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
    )}
  </svg>
);

const EucalyptusTargetSvg: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-label="Daun Eukaliptus">
    {/* Soft glow */}
    <circle cx="32" cy="32" r="24" fill="#FEF08A" opacity="0.45" />
    {/* Stem */}
    <path d="M32 54 C32 40, 32 24, 34 12" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
    {/* Leaves */}
    <ellipse cx="22" cy="38" rx="11" ry="7" transform="rotate(-28 22 38)" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
    <ellipse cx="43" cy="36" rx="11" ry="7" transform="rotate(28 43 36)" fill="#4ADE80" stroke="#14532D" strokeWidth="2" />
    <ellipse cx="23" cy="24" rx="10" ry="6.5" transform="rotate(-22 23 24)" fill="#4ADE80" stroke="#14532D" strokeWidth="2" />
    <ellipse cx="42" cy="22" rx="10" ry="6.5" transform="rotate(24 42 22)" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
    <ellipse cx="33" cy="14" rx="7" ry="9" fill="#86EFAC" stroke="#14532D" strokeWidth="2" />
    {/* Sparkle star */}
    <circle cx="48" cy="14" r="3" fill="#FFE600" />
  </svg>
);

// ==================== BLOCK TREE IMMUTABLE HELPERS ====================

type InsertionTarget =
  | { kind: 'root' }
  | { kind: 'children'; parentId: string }
  | { kind: 'elseChildren'; parentId: string };

function uid(prefix = 'kb'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function createBlockNode(type: KoalaBlockType, turnDir?: 'left' | 'right'): KoalaBlockNode {
  switch (type) {
    case 'move_forward':
      return { id: uid('mv'), type: 'move_forward' };
    case 'turn':
      return { id: uid('tn'), type: 'turn', turnDir: turnDir || 'left' };
    case 'repeat_times':
      return { id: uid('rp'), type: 'repeat_times', count: 5, children: [] };
    case 'repeat_until_goal':
      return { id: uid('ru'), type: 'repeat_until_goal', children: [] };
    case 'if_path':
      return { id: uid('if'), type: 'if_path', sensor: 'forward', children: [] };
    case 'if_else_path':
      return {
        id: uid('ie'),
        type: 'if_else_path',
        sensor: 'forward',
        children: [],
        elseChildren: [],
      };
  }
}

function insertIntoTree(
  blocks: KoalaBlockNode[],
  target: InsertionTarget,
  node: KoalaBlockNode
): KoalaBlockNode[] {
  if (target.kind === 'root') {
    return [...blocks, node];
  }
  return blocks.map((blk) => {
    if (blk.id === target.parentId) {
      if (target.kind === 'children') {
        return { ...blk, children: [...(blk.children || []), node] };
      }
      if (target.kind === 'elseChildren') {
        return { ...blk, elseChildren: [...(blk.elseChildren || []), node] };
      }
    }
    return {
      ...blk,
      children: blk.children ? insertIntoTree(blk.children, target, node) : undefined,
      elseChildren: blk.elseChildren
        ? insertIntoTree(blk.elseChildren, target, node)
        : undefined,
    };
  });
}

function updateNodeInTree(
  blocks: KoalaBlockNode[],
  id: string,
  updater: (node: KoalaBlockNode) => KoalaBlockNode
): KoalaBlockNode[] {
  return blocks.map((blk) => {
    if (blk.id === id) return updater(blk);
    return {
      ...blk,
      children: blk.children ? updateNodeInTree(blk.children, id, updater) : undefined,
      elseChildren: blk.elseChildren
        ? updateNodeInTree(blk.elseChildren, id, updater)
        : undefined,
    };
  });
}

function removeNodeInTree(blocks: KoalaBlockNode[], id: string): KoalaBlockNode[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((blk) => ({
      ...blk,
      children: blk.children ? removeNodeInTree(blk.children, id) : undefined,
      elseChildren: blk.elseChildren ? removeNodeInTree(blk.elseChildren, id) : undefined,
    }));
}

function moveNodeInTree(blocks: KoalaBlockNode[], id: string, dir: -1 | 1): KoalaBlockNode[] {
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx >= 0) {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= blocks.length) return blocks;
    const copy = [...blocks];
    const [removed] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, removed);
    return copy;
  }
  return blocks.map((blk) => ({
    ...blk,
    children: blk.children ? moveNodeInTree(blk.children, id, dir) : undefined,
    elseChildren: blk.elseChildren ? moveNodeInTree(blk.elseChildren, id, dir) : undefined,
  }));
}

function dirToArrow(dir: KoalaDir): string {
  if (dir === 'N') return '▲';
  if (dir === 'E') return '▶';
  if (dir === 'S') return '▼';
  return '◀';
}

// ==================== MAIN COMPONENT ====================

export const KoalaMazeWorkspace: React.FC<Props> = ({ studentName = 'Siswa' }) => {
  const [activeSubLevelId, setActiveSubLevelId] = useState<string>(ALL_KOALA_SUBLEVELS[0].id);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const subLevel: KoalaSubLevel = useMemo(
    () => ALL_KOALA_SUBLEVELS.find((s) => s.id === activeSubLevelId) || ALL_KOALA_SUBLEVELS[0],
    [activeSubLevelId]
  );

  const currentLevelGroup = useMemo(
    () =>
      KOALA_MAZE_LEVELS.find((l) => l.levelNumber === subLevel.levelIndex) || KOALA_MAZE_LEVELS[0],
    [subLevel.levelIndex]
  );

  const [blocks, setBlocks] = useState<KoalaBlockNode[]>([]);
  const [insertTarget, setInsertTarget] = useState<InsertionTarget>({ kind: 'root' });

  // Playback / Simulation state
  const [frames, setFrames] = useState<KoalaFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [runFeedback, setRunFeedback] = useState<string | null>(null);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Modals & popovers
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeTab, setCodeTab] = useState<'javascript' | 'python'>('javascript');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHintDrawer, setShowHintDrawer] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [victoryInfo, setVictoryInfo] = useState<{
    blockCount: number;
    optimal: boolean;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  // Reset workspace when switching sub-level
  useEffect(() => {
    stopAnimation();
    stopSpeech();
    setBlocks(cloneKoalaBlocks(subLevel.starterBlocks));
    setInsertTarget({ kind: 'root' });
    setFrames([]);
    setFrameIdx(0);
    setHasRun(false);
    setRunFeedback(null);
    setVictoryInfo(null);
    setShowHintDrawer(false);
  }, [subLevel, stopAnimation, stopSpeech]);

  useEffect(() => {
    return () => {
      stopAnimation();
      stopSpeech();
    };
  }, [stopAnimation, stopSpeech]);

  const markCompleted = useCallback((id: string) => {
    setCompletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  }, []);

  // Current Koala visual position & mood
  const activeFrame: KoalaFrame | null = frames[frameIdx] || null;
  const koalaX = activeFrame ? activeFrame.x : subLevel.start.x;
  const koalaY = activeFrame ? activeFrame.y : subLevel.start.y;
  const koalaDir = activeFrame ? activeFrame.dir : subLevel.start.dir;
  const activeBlockId = isPlaying || hasRun ? activeFrame?.activeBlockId || null : null;
  const koalaMood: 'normal' | 'happy' | 'dizzy' =
    activeFrame?.status === 'won'
      ? 'happy'
      : activeFrame?.status === 'crashed' || activeFrame?.status === 'infinite'
        ? 'dizzy'
        : 'normal';

  const blockCount = useMemo(() => countKoalaBlocks(blocks), [blocks]);
  const overBudget = blockCount > subLevel.maxBlocks;

  const handleResetRun = () => {
    stopAnimation();
    setFrames([]);
    setFrameIdx(0);
    setHasRun(false);
    setRunFeedback(null);
    setVictoryInfo(null);
  };

  const handleRun = () => {
    stopAnimation();
    const res = executeKoalaMaze(subLevel, blocks);
    setFrames(res.frames);
    setFrameIdx(0);
    setHasRun(true);
    setRunFeedback(null);
    setVictoryInfo(null);
    setIsPlaying(true);

    let idx = 0;
    timerRef.current = window.setInterval(() => {
      idx += 1;
      if (idx >= res.frames.length) {
        stopAnimation();
        setRunFeedback(res.finalMessage);
        if (res.won) {
          markCompleted(subLevel.id);
          if (sfxEnabled) soundEngine.playVictory();
          setVictoryInfo({ blockCount: res.blockCount, optimal: res.optimal });
        } else {
          if (sfxEnabled) soundEngine.playCrash();
        }
        return;
      }
      setFrameIdx(idx);
      const fr = res.frames[idx];
      if (sfxEnabled) {
        if (fr.status === 'crashed' || fr.status === 'infinite') {
          soundEngine.playCrash();
        } else if (fr.status === 'won') {
          soundEngine.playGemCollect();
        } else {
          soundEngine.playStep();
        }
      }
    }, 340);
  };

  const handleStep = () => {
    stopAnimation();
    if (!hasRun || frames.length === 0) {
      const res = executeKoalaMaze(subLevel, blocks);
      setFrames(res.frames);
      const nextIdx = res.frames.length > 1 ? 1 : 0;
      setFrameIdx(nextIdx);
      setHasRun(true);
      const fr = res.frames[nextIdx];
      setRunFeedback(fr?.message || res.finalMessage);
      if (fr?.status === 'won') {
        markCompleted(subLevel.id);
        if (sfxEnabled) soundEngine.playVictory();
        setVictoryInfo({ blockCount: res.blockCount, optimal: res.optimal });
      } else if (sfxEnabled) {
        soundEngine.playStep();
      }
      return;
    }

    const nextIdx = Math.min(frames.length - 1, frameIdx + 1);
    setFrameIdx(nextIdx);
    const fr = frames[nextIdx];
    setRunFeedback(fr?.message || null);
    if (fr?.status === 'won') {
      markCompleted(subLevel.id);
      if (sfxEnabled) soundEngine.playVictory();
      setVictoryInfo({ blockCount, optimal: blockCount <= subLevel.maxBlocks });
    } else if (sfxEnabled) {
      soundEngine.playStep();
    }
  };

  const handleAddBlock = (
    type: KoalaBlockType,
    turnDir?: 'left' | 'right',
    overrideTarget?: InsertionTarget
  ) => {
    handleResetRun();
    const newNode = createBlockNode(type, turnDir);
    const target = overrideTarget || insertTarget;
    setBlocks((prev) => insertIntoTree(prev, target, newNode));
    if (sfxEnabled) soundEngine.playButtonClick();

    // Auto-focus inside a newly added C-block so kids can snap inner commands effortlessly!
    if (
      type === 'repeat_times' ||
      type === 'repeat_until_goal' ||
      type === 'if_path' ||
      type === 'if_else_path'
    ) {
      setInsertTarget({ kind: 'children', parentId: newNode.id });
    }
  };

  const handleLoadSolution = () => {
    handleResetRun();
    setBlocks(cloneKoalaBlocks(subLevel.solutionBlocks));
    setInsertTarget({ kind: 'root' });
    setRunFeedback('Solusi dimuat! Klik tombol oranye "Jalankan" untuk melihat Koala beraksi.');
    if (sfxEnabled) soundEngine.playGemCollect();
  };

  const handleClearWorkspace = () => {
    handleResetRun();
    setBlocks([]);
    setInsertTarget({ kind: 'root' });
    if (sfxEnabled) soundEngine.playButtonClick();
  };

  const handleSpeakInstruction = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `${subLevel.title}. ${subLevel.instruction}`
    );
    utter.lang = 'id-ID';
    utter.rate = 0.96;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const handleNextSubLevel = () => {
    const idx = ALL_KOALA_SUBLEVELS.findIndex((s) => s.id === subLevel.id);
    if (idx >= 0 && idx < ALL_KOALA_SUBLEVELS.length - 1) {
      setActiveSubLevelId(ALL_KOALA_SUBLEVELS[idx + 1].id);
    } else {
      setVictoryInfo(null);
      setShowSummaryModal(true);
    }
  };

  const generatedJs = useMemo(() => koalaBlocksToJavaScript(blocks), [blocks]);
  const generatedPy = useMemo(() => koalaBlocksToPython(blocks), [blocks]);

  const handleCopyCode = () => {
    const text = codeTab === 'javascript' ? generatedJs : generatedPy;
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1600);
  };

  // ==================== RECURSIVE BLOCKLY WORKSPACE RENDERER ====================

  const renderBlockStack = (
    list: KoalaBlockNode[],
    dropTarget: InsertionTarget,
    emptyPlaceholder: string
  ) => {
    const isSelectedTarget =
      insertTarget.kind === dropTarget.kind &&
      (dropTarget.kind === 'root' ||
        (insertTarget.kind !== 'root' && insertTarget.parentId === dropTarget.parentId));

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setInsertTarget(dropTarget);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const raw = e.dataTransfer.getData('text/koala-block');
          if (!raw) return;
          const [bType, bDir] = raw.split(':') as [KoalaBlockType, 'left' | 'right' | undefined];
          handleAddBlock(bType, bDir, dropTarget);
        }}
        className={`space-y-1 min-h-[34px] rounded-md transition-colors ${
          isSelectedTarget ? 'ring-2 ring-dashed ring-[#3B3FA8]/45 bg-[#3B3FA8]/[0.04] p-1' : 'p-0.5'
        }`}
      >
        {list.length === 0 ? (
          <div className="px-3 py-2 rounded border border-dashed border-slate-300 text-[11px] font-semibold text-slate-400">
            {emptyPlaceholder}
          </div>
        ) : (
          list.map((blk, idx) => {
            const isActiveExec = activeBlockId === blk.id;
            const highlightClass = isActiveExec
              ? 'ring-4 ring-[#FFE600] shadow-lg scale-[1.01]'
              : '';

            // 1. Action Blocks (Teal-Cyan #1CA8B8)
            if (blk.type === 'move_forward' || blk.type === 'turn') {
              return (
                <div
                  key={blk.id}
                  className={`group inline-flex items-center justify-between gap-2 bg-[#1CA8B8] border-b-[3px] border-[#137C88] text-white font-bold text-xs px-3 py-2 rounded-md shadow-sm min-w-[200px] max-w-full transition-all ${highlightClass}`}
                >
                  <div className="flex items-center gap-1.5">
                    {blk.type === 'move_forward' ? (
                      <span>Gerak maju</span>
                    ) : (
                      <>
                        <span>belok</span>
                        <select
                          value={blk.turnDir || 'left'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            handleResetRun();
                            const nextDir = e.target.value as 'left' | 'right';
                            setBlocks((prev) =>
                              updateNodeInTree(prev, blk.id, (n) => ({ ...n, turnDir: nextDir }))
                            );
                          }}
                          className="bg-[#BEEBF0] text-slate-900 font-extrabold text-xs rounded px-1.5 py-0.5 border border-[#137C88] cursor-pointer focus:outline-none"
                        >
                          <option value="left">kiri ↺</option>
                          <option value="right">kanan ↻</option>
                        </select>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetRun();
                        setBlocks((prev) => moveNodeInTree(prev, blk.id, -1));
                      }}
                      className="p-0.5 rounded hover:bg-black/20 disabled:opacity-30 cursor-pointer"
                      title="Pindah ke atas"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === list.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetRun();
                        setBlocks((prev) => moveNodeInTree(prev, blk.id, 1));
                      }}
                      className="p-0.5 rounded hover:bg-black/20 disabled:opacity-30 cursor-pointer"
                      title="Pindah ke bawah"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetRun();
                        setBlocks((prev) => removeNodeInTree(prev, blk.id));
                      }}
                      className="p-0.5 rounded hover:bg-black/25 cursor-pointer"
                      title="Hapus blok"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            }

            // 2. Loop C-Blocks (Pink-Magenta #E63E97)
            if (blk.type === 'repeat_times' || blk.type === 'repeat_until_goal') {
              const isChildTarget =
                insertTarget.kind === 'children' && insertTarget.parentId === blk.id;
              return (
                <div
                  key={blk.id}
                  className={`rounded-md overflow-hidden shadow-sm max-w-[380px] transition-all ${highlightClass}`}
                >
                  {/* Top C-Bar */}
                  <div className="bg-[#E63E97] text-white font-bold text-xs px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {blk.type === 'repeat_times' ? (
                        <>
                          <span>ulangi</span>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={blk.count ?? 5}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              handleResetRun();
                              const val = Math.max(1, Math.min(12, Number(e.target.value) || 1));
                              setBlocks((prev) =>
                                updateNodeInTree(prev, blk.id, (n) => ({ ...n, count: val }))
                              );
                            }}
                            className="w-11 text-center bg-[#FCE7F3] text-slate-900 font-extrabold rounded px-1 py-0.5 border border-[#BE185D] focus:outline-none"
                          />
                          <span>kali</span>
                        </>
                      ) : (
                        <>
                          <span>ulangi sampai</span>
                          <span className="inline-flex items-center gap-1 bg-white/95 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[11px]">
                            🌿 Daun
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInsertTarget({ kind: 'children', parentId: blk.id });
                        }}
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer ${
                          isChildTarget
                            ? 'bg-[#FFE600] text-black'
                            : 'bg-black/20 text-white hover:bg-black/30'
                        }`}
                      >
                        + Isi
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetRun();
                          setBlocks((prev) => removeNodeInTree(prev, blk.id));
                          if (insertTarget.kind !== 'root' && insertTarget.parentId === blk.id) {
                            setInsertTarget({ kind: 'root' });
                          }
                        }}
                        className="p-0.5 rounded hover:bg-black/25 cursor-pointer"
                        title="Hapus blok ulangi"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Spine + Inner Blocks */}
                  <div className="border-l-[14px] border-[#E63E97] pl-2.5 pr-2 py-2 bg-[#FDF2F8]/60">
                    <div className="text-[10px] font-extrabold text-[#BE185D] mb-1">kerjakan</div>
                    {renderBlockStack(
                      blk.children || [],
                      { kind: 'children', parentId: blk.id },
                      'Klik "+ Isi" atau seret blok ke sini'
                    )}
                  </div>

                  {/* Bottom C-Cap */}
                  <div className="h-3 bg-[#E63E97] border-b-2 border-[#B32470]" />
                </div>
              );
            }

            // 3. Logic C-Blocks (Blue #2596D1)
            const isChildTarget =
              insertTarget.kind === 'children' && insertTarget.parentId === blk.id;
            const isElseTarget =
              insertTarget.kind === 'elseChildren' && insertTarget.parentId === blk.id;

            return (
              <div
                key={blk.id}
                className={`rounded-md overflow-hidden shadow-sm max-w-[400px] transition-all ${highlightClass}`}
              >
                <div className="bg-[#2596D1] text-white font-bold text-xs px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>jika jalan</span>
                    <select
                      value={blk.sensor || 'forward'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        handleResetRun();
                        const sensor = e.target.value as KoalaPathSensor;
                        setBlocks((prev) =>
                          updateNodeInTree(prev, blk.id, (n) => ({ ...n, sensor }))
                        );
                      }}
                      className="bg-[#DBEAFE] text-slate-900 font-extrabold text-xs rounded px-1.5 py-0.5 border border-[#1D6FA0] cursor-pointer focus:outline-none"
                    >
                      <option value="forward">ke depan</option>
                      <option value="left">ke kiri</option>
                      <option value="right">ke kanan</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInsertTarget({ kind: 'children', parentId: blk.id });
                      }}
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer ${
                        isChildTarget
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-black/20 text-white hover:bg-black/30'
                      }`}
                    >
                      + Jika
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetRun();
                        setBlocks((prev) => removeNodeInTree(prev, blk.id));
                        if (insertTarget.kind !== 'root' && insertTarget.parentId === blk.id) {
                          setInsertTarget({ kind: 'root' });
                        }
                      }}
                      className="p-0.5 rounded hover:bg-black/25 cursor-pointer"
                      title="Hapus blok jika"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* IF branch */}
                <div className="border-l-[14px] border-[#2596D1] pl-2.5 pr-2 py-2 bg-[#EFF6FF]/70">
                  <div className="text-[10px] font-extrabold text-[#1D6FA0] mb-1">kerjakan</div>
                  {renderBlockStack(
                    blk.children || [],
                    { kind: 'children', parentId: blk.id },
                    'Isi aksi jika jalan terbuka'
                  )}
                </div>

                {/* ELSE branch (if_else_path) */}
                {blk.type === 'if_else_path' && (
                  <>
                    <div className="bg-[#2596D1] text-white font-bold text-xs px-3 py-1.5 flex items-center justify-between">
                      <span>jika tidak</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInsertTarget({ kind: 'elseChildren', parentId: blk.id });
                        }}
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer ${
                          isElseTarget
                            ? 'bg-[#FFE600] text-black'
                            : 'bg-black/20 text-white hover:bg-black/30'
                        }`}
                      >
                        + Jika tidak
                      </button>
                    </div>
                    <div className="border-l-[14px] border-[#2596D1] pl-2.5 pr-2 py-2 bg-[#EFF6FF]/70">
                      {renderBlockStack(
                        blk.elseChildren || [],
                        { kind: 'elseChildren', parentId: blk.id },
                        'Isi aksi jika jalan buntu'
                      )}
                    </div>
                  </>
                )}

                <div className="h-3 bg-[#2596D1] border-b-2 border-[#1B74A3]" />
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border-2 border-[#2A2D80] shadow-xl bg-white flex flex-col">
      {/* ==================== 1. CODE.ORG-STYLE INDIGO TOP BAR ==================== */}
      <header className="bg-[#3B3FA8] text-white px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Left: CODE Square Tiles Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-0.5 font-display font-black text-xs">
            {['C', 'O', 'D', 'E'].map((ch) => (
              <span
                key={ch}
                className="w-5 h-5 bg-white text-[#3B3FA8] rounded-[2px] flex items-center justify-center leading-none"
              >
                {ch}
              </span>
            ))}
            <span className="ml-1 text-[#FFE600] font-extrabold tracking-tight hidden sm:inline">
              KOALA
            </span>
          </div>

          {/* Level Dropdown Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLevelMenu((v) => !v)}
              className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>{currentLevelGroup.shortTitle}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showLevelMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border-2 border-slate-200 p-2 z-40 space-y-1">
                <div className="px-2 py-1 text-[11px] font-extrabold text-slate-500 uppercase">
                  Pilih Level &amp; Sub-Level
                </div>
                {KOALA_MAZE_LEVELS.map((lvl) => {
                  const doneInLvl = lvl.subLevels.filter((s) =>
                    completedIds.includes(s.id)
                  ).length;
                  const isCurr = lvl.levelNumber === currentLevelGroup.levelNumber;
                  return (
                    <button
                      key={lvl.levelNumber}
                      type="button"
                      onClick={() => {
                        setActiveSubLevelId(lvl.subLevels[0].id);
                        setShowLevelMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        isCurr
                          ? 'bg-[#EEF2FF] text-[#3B3FA8]'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold">{lvl.title}</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 tabular-nums">
                          {doneInLvl}/{lvl.subLevels.length}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5">
                        {lvl.concept} · {lvl.subLevels.length} Sub-Level
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: Labirin Koala + White Sub-Level Circle Stepper + Saya sudah selesai! */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="font-display font-extrabold text-sm tracking-tight whitespace-nowrap">
            Labirin Koala
          </span>

          {/* White Pill Circle Stepper (mirrors Code.org's exact top circle bar!) */}
          <div className="bg-white/95 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 shadow-inner">
            {currentLevelGroup.subLevels.map((sl) => {
              const isCurrent = sl.id === subLevel.id;
              const isDone = completedIds.includes(sl.id);
              return (
                <button
                  key={sl.id}
                  type="button"
                  onClick={() => {
                    if (sfxEnabled) soundEngine.playButtonClick();
                    setActiveSubLevelId(sl.id);
                  }}
                  title={`Sub-Level ${sl.levelIndex}.${sl.subIndex}: ${sl.title}`}
                  className={`rounded-full flex items-center justify-center font-mono font-extrabold transition-all cursor-pointer tabular-nums ${
                    isCurrent
                      ? 'w-7 h-7 text-xs bg-white text-[#1E293B] border-2 border-[#3B3FA8] shadow-sm scale-105'
                      : isDone
                        ? 'w-5 h-5 text-[10px] bg-[#22C55E] text-white border border-[#15803D]'
                        : 'w-5 h-5 text-[10px] bg-white text-slate-400 border border-slate-300 hover:border-[#3B3FA8] hover:text-[#3B3FA8]'
                  }`}
                >
                  {isCurrent ? `${sl.levelIndex}.${sl.subIndex}` : isDone ? <Check className="w-3 h-3" /> : sl.subIndex}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowSummaryModal(true)}
            className="text-xs font-extrabold text-white/95 hover:text-[#FFE600] underline-offset-2 hover:underline cursor-pointer whitespace-nowrap"
          >
            Saya sudah selesai! ({completedIds.length}/{ALL_KOALA_SUBLEVELS.length})
          </button>
        </div>

        {/* Right: Student Name + Help Circle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/30 bg-white/10 text-xs font-bold">
            <KoalaSvg className="w-4 h-4" />
            <span className="max-w-[90px] truncate">{studentName}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowConceptModal(true)}
            className="w-7 h-7 rounded-full bg-white text-[#3B3FA8] flex items-center justify-center font-black cursor-pointer hover:bg-[#FFE600] hover:text-black transition-colors"
            title="Panduan Konsep Level Ini"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Level Quick Switch Strip (4 Levels clearly visible so sub-level hierarchy is crystal clear) */}
      <div className="bg-[#EEF2FF] border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {KOALA_MAZE_LEVELS.map((lvl) => {
            const active = lvl.levelNumber === currentLevelGroup.levelNumber;
            const doneCount = lvl.subLevels.filter((s) => completedIds.includes(s.id)).length;
            return (
              <button
                key={lvl.levelNumber}
                type="button"
                onClick={() => {
                  if (sfxEnabled) soundEngine.playTabSwitch();
                  setActiveSubLevelId(lvl.subLevels[0].id);
                }}
                className={`px-2.5 py-1 rounded-md font-extrabold text-[11.5px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'bg-[#3B3FA8] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <span>{lvl.shortTitle}</span>
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    active ? 'text-[#FFE600]' : 'text-emerald-700'
                  }`}
                >
                  {doneCount}/{lvl.subLevels.length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-[11px] font-bold text-slate-600">
          Sub-Level {subLevel.levelIndex}.{subLevel.subIndex}:{' '}
          <span className="text-slate-900">{subLevel.title}</span>
        </div>
      </div>

      {/* ==================== 2. MAIN TWO-COLUMN CODE.ORG WORKSPACE ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[560px]">
        {/* LEFT COLUMN: 8x8 Lush Green Koala Maze Stage + Coral Jalankan Button + Help */}
        <aside className="lg:col-span-4 xl:col-span-4 bg-[#F3F4F6] border-b lg:border-b-0 lg:border-r border-slate-300 p-3.5 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            {/* 8x8 Classic Green Maze Canvas (modeled on Code.org screenshot) */}
            <div className="relative aspect-square w-full max-w-[360px] mx-auto rounded-md overflow-hidden border-[3px] border-[#6B4423] bg-[#5DA832] shadow-md select-none">
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {subLevel.grid.map((row, y) =>
                  row.split('').map((cell, x) => {
                    const isWalkable = cell === '.' || cell === '^';
                    const isHint = cell === '^';
                    const isStone = cell === 'S';
                    const isGoal = x === subLevel.goal.x && y === subLevel.goal.y;
                    const isKoala = x === koalaX && y === koalaY;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor: isWalkable
                            ? (x + y) % 2 === 0
                              ? '#73BF43'
                              : '#6BB63C'
                            : '#589C2E',
                          border: isWalkable
                            ? '0.5px solid rgba(255,255,255,0.18)'
                            : '0.5px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        {/* Wooden Crate Wall (#) */}
                        {cell === '#' && (
                          <div className="w-[88%] h-[88%] rounded-[3px] bg-[#C87D32] border-2 border-[#8B4D18] shadow-inner flex items-center justify-center">
                            <div className="w-[58%] h-[58%] rounded-[2px] bg-[#66AE39] border border-[#8B4D18]/70" />
                          </div>
                        )}

                        {/* Beveled Stone Corner Block (S) */}
                        {isStone && (
                          <div
                            className="w-[88%] h-[88%] rounded-[2px] bg-[#959FA8] border-2 border-[#646E78] shadow-inner"
                            style={{
                              backgroundImage:
                                'linear-gradient(135deg, #B2BCC5 48%, #737E89 52%)',
                            }}
                          />
                        )}

                        {/* Glowing Cyan Hint Triangle (like screenshot!) */}
                        {isHint && !isKoala && !isGoal && (
                          <div
                            className="w-4 h-4 opacity-85"
                            style={{
                              clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                              backgroundColor: '#7CE7F5',
                              border: '1px solid #0891B2',
                            }}
                          />
                        )}

                        {/* Goal Eucalyptus Target */}
                        {isGoal && (
                          <div
                            className={`absolute inset-0 flex items-center justify-center ${
                              isKoala ? 'scale-75 opacity-60' : 'animate-pulse'
                            }`}
                          >
                            <EucalyptusTargetSvg className="w-[86%] h-[86%] drop-shadow" />
                          </div>
                        )}

                        {/* Koala Character */}
                        {isKoala && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center transition-transform duration-200">
                            <KoalaSvg
                              className="w-[92%] h-[92%] drop-shadow-md"
                              mood={koalaMood}
                            />
                            {/* Clear Facing Direction Indicator Badge */}
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EA6A3A] text-white text-[9px] font-black flex items-center justify-center border border-white shadow"
                              title={`Arah hadap: ${koalaDir}`}
                            >
                              {dirToArrow(koalaDir)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Coral-Orange Jalankan + Langkah Controls (matches Code.org) */}
            <div className="flex items-center gap-2 max-w-[360px] mx-auto">
              {!hasRun ? (
                <button
                  type="button"
                  onClick={handleRun}
                  className="flex-1 py-2.5 px-4 rounded-md bg-[#EA6A3A] hover:bg-[#D95B2C] text-white font-display font-extrabold text-sm shadow-sm border-b-[3px] border-[#B8471E] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Jalankan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetRun}
                  className="flex-1 py-2.5 px-4 rounded-md bg-[#EA6A3A] hover:bg-[#D95B2C] text-white font-display font-extrabold text-sm shadow-sm border-b-[3px] border-[#B8471E] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={handleStep}
                className="py-2.5 px-3 rounded-md bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-300 shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Jalankan 1 langkah per klik"
              >
                <SkipForward className="w-4 h-4 text-[#3B3FA8]" />
                Langkah
              </button>
            </div>

            {/* Live Feedback Banner when running / crashed / incomplete */}
            {runFeedback && !victoryInfo && (
              <div
                className={`max-w-[360px] mx-auto px-3 py-2 rounded-md border text-xs font-bold ${
                  activeFrame?.status === 'crashed' || activeFrame?.status === 'infinite'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {runFeedback}
              </div>
            )}

            {/* Left Sidebar Help Section (matches "Lihat solusi / Perlu bantuan?" in screenshot!) */}
            <div className="max-w-[360px] mx-auto pt-1 space-y-2">
              <button
                type="button"
                onClick={handleLoadSolution}
                className="text-xs font-extrabold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Lihat solusi (Pasang otomatis)
              </button>

              <div className="space-y-1">
                <div className="text-xs font-extrabold text-slate-800">Perlu bantuan?</div>
                <p className="text-[11px] text-slate-600">
                  Pelajari panduan konsep dan tips cepat untuk {currentLevelGroup.shortTitle}
                </p>
                <button
                  type="button"
                  onClick={() => setShowConceptModal(true)}
                  className="w-full mt-1 rounded-lg overflow-hidden border border-slate-300 bg-white hover:border-[#3B3FA8] transition-colors text-left cursor-pointer shadow-sm group"
                >
                  <div className="bg-gradient-to-r from-[#2E3A59] to-[#3B3FA8] p-3 text-white flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <KoalaSvg className="w-9 h-9" mood="happy" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold truncate group-hover:text-[#FFE600]">
                        {currentLevelGroup.videoTipTitle}
                      </div>
                      <div className="text-[10px] text-indigo-100 line-clamp-2 mt-0.5">
                        {currentLevelGroup.videoTipSummary}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Bottom Utility Bar (mirrors Bahasa / Audio toggle) */}
          <div className="max-w-[360px] mx-auto w-full pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span className="px-2 py-1 rounded bg-white border border-slate-300">
              Bahasa Indonesia
            </span>
            <button
              type="button"
              onClick={() => setSfxEnabled((s) => !s)}
              className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              {sfxEnabled ? 'Suara Aktif' : 'Suara Mati'}
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Instruction Speech Bubble + Blockly Toolbox & White Workspace */}
        <section className="lg:col-span-8 xl:col-span-8 flex flex-col min-w-0">
          {/* Top Charcoal "Instruksi" Tab Bar */}
          <div className="bg-[#1F2227] text-white px-4 h-9 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 h-full">
              <span className="text-xs font-extrabold border-b-2 border-white h-full flex items-center">
                Instruksi
              </span>
              <span className="text-[11px] text-slate-300 hidden sm:inline">
                {currentLevelGroup.title} · Sub-Level {subLevel.levelIndex}.{subLevel.subIndex}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#FFE600]">
              Target: ≤ {subLevel.maxBlocks} blok
            </span>
          </div>

          {/* Koala Speech Bubble Strip (exact match to screenshot!) */}
          <div className="bg-[#F0F1F3] border-b border-slate-300 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0 shadow-sm">
              <KoalaSvg className="w-10 h-10" mood={koalaMood} />
            </div>

            <div className="relative flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 shadow-sm flex items-center justify-between gap-3">
              {/* Speech bubble triangle pointer */}
              <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-300 rotate-45" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                {subLevel.instruction}
              </p>
              <button
                type="button"
                onClick={handleSpeakInstruction}
                className={`p-2 rounded border shrink-0 cursor-pointer transition-colors ${
                  speaking
                    ? 'bg-[#FFE600] border-black text-black'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Bacakan instruksi dengan suara"
              >
                {speaking ? <VolumeX className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Workspace Header Bar ("Blok" | "Area kerja: X / Y blok" | "Mulai kembali" | "Tampilkan kode") */}
          <div className="bg-[#23262B] text-white px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold w-36 text-center hidden sm:inline-block">
                Blok
              </span>
              <span
                className={`text-xs font-extrabold tabular-nums ${
                  overBudget ? 'text-amber-300' : 'text-white'
                }`}
              >
                Area kerja: {blockCount} / {subLevel.maxBlocks} blok
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearWorkspace}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Mulai kembali
              </button>
              <button
                type="button"
                onClick={() => setShowCodeModal(true)}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                Tampilkan kode
              </button>
            </div>
          </div>

          {/* Split Toolbox (#E6E9ED) + White Blockly Canvas (#FFFFFF) */}
          <div className="flex-1 flex flex-col sm:flex-row relative overflow-hidden">
            {/* Left Toolbox Column */}
            <div className="w-full sm:w-48 bg-[#E6E9ED] border-b sm:border-b-0 sm:border-r border-slate-300 p-3 space-y-2.5 shrink-0 select-none">
              <div className="text-[10.5px] font-bold text-slate-500">
                Klik atau seret blok ke Area Kerja:
              </div>

              {subLevel.availableBlocks.includes('move_forward') && (
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/koala-block', 'move_forward')}
                  onClick={() => handleAddBlock('move_forward')}
                  className="w-full text-left bg-[#1CA8B8] hover:bg-[#1796A5] border-b-[3px] border-[#137C88] text-white font-bold text-xs px-3 py-2 rounded-md shadow-sm cursor-grab active:cursor-grabbing transition-transform active:scale-95"
                >
                  Gerak maju
                </button>
              )}

              {subLevel.availableBlocks.includes('turn') && (
                <>
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/koala-block', 'turn:left')}
                    onClick={() => handleAddBlock('turn', 'left')}
                    className="w-full text-left bg-[#1CA8B8] hover:bg-[#1796A5] border-b-[3px] border-[#137C88] text-white font-bold text-xs px-3 py-2 rounded-md shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>belok</span>
                    <span className="bg-[#BEEBF0] text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[11px]">
                      kiri ↺
                    </span>
                  </button>
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/koala-block', 'turn:right')}
                    onClick={() => handleAddBlock('turn', 'right')}
                    className="w-full text-left bg-[#1CA8B8] hover:bg-[#1796A5] border-b-[3px] border-[#137C88] text-white font-bold text-xs px-3 py-2 rounded-md shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>belok</span>
                    <span className="bg-[#BEEBF0] text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[11px]">
                      kanan ↻
                    </span>
                  </button>
                </>
              )}

              {subLevel.availableBlocks.includes('repeat_times') && (
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/koala-block', 'repeat_times')}
                  onClick={() => handleAddBlock('repeat_times')}
                  className="w-full text-left rounded-md overflow-hidden shadow-sm cursor-grab active:cursor-grabbing transition-transform active:scale-95"
                >
                  <div className="bg-[#E63E97] hover:bg-[#D12E84] text-white font-bold text-xs px-3 py-2 flex items-center gap-1.5">
                    <span>ulangi</span>
                    <span className="bg-[#FCE7F3] text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[11px]">
                      5
                    </span>
                    <span>kali</span>
                  </div>
                  <div className="bg-[#E63E97] border-b-[3px] border-[#B32470] text-white/95 font-bold text-[11px] px-3 pb-1.5">
                    kerjakan
                  </div>
                </button>
              )}

              {subLevel.availableBlocks.includes('repeat_until_goal') && (
                <button
                  type="button"
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData('text/koala-block', 'repeat_until_goal')
                  }
                  onClick={() => handleAddBlock('repeat_until_goal')}
                  className="w-full text-left rounded-md overflow-hidden shadow-sm cursor-grab active:cursor-grabbing transition-transform active:scale-95"
                >
                  <div className="bg-[#E63E97] hover:bg-[#D12E84] text-white font-bold text-xs px-3 py-2 flex items-center gap-1 flex-wrap">
                    <span>ulangi sampai</span>
                    <span className="bg-white text-emerald-800 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                      🌿 Daun
                    </span>
                  </div>
                  <div className="bg-[#E63E97] border-b-[3px] border-[#B32470] text-white/95 font-bold text-[11px] px-3 pb-1.5">
                    kerjakan
                  </div>
                </button>
              )}

              {subLevel.availableBlocks.includes('if_path') && (
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/koala-block', 'if_path')}
                  onClick={() => handleAddBlock('if_path')}
                  className="w-full text-left rounded-md overflow-hidden shadow-sm cursor-grab active:cursor-grabbing transition-transform active:scale-95"
                >
                  <div className="bg-[#2596D1] hover:bg-[#1E82B7] text-white font-bold text-xs px-3 py-2">
                    jika jalan ke depan
                  </div>
                  <div className="bg-[#2596D1] border-b-[3px] border-[#1B74A3] text-white/95 font-bold text-[11px] px-3 pb-1.5">
                    kerjakan
                  </div>
                </button>
              )}

              {subLevel.availableBlocks.includes('if_else_path') && (
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/koala-block', 'if_else_path')}
                  onClick={() => handleAddBlock('if_else_path')}
                  className="w-full text-left rounded-md overflow-hidden shadow-sm cursor-grab active:cursor-grabbing transition-transform active:scale-95"
                >
                  <div className="bg-[#2596D1] hover:bg-[#1E82B7] text-white font-bold text-xs px-3 py-1.5">
                    jika jalan ke depan
                  </div>
                  <div className="bg-[#2596D1] border-b-[3px] border-[#1B74A3] text-white/95 font-bold text-[11px] px-3 pb-1.5">
                    kerjakan / jika tidak
                  </div>
                </button>
              )}
            </div>

            {/* Right White Blockly Workspace Canvas */}
            <div
              onClick={() => setInsertTarget({ kind: 'root' })}
              className="flex-1 bg-white p-5 overflow-auto relative min-h-[380px]"
            >
              {/* Orange "ketika dijalankan" Hat Block */}
              <div className="inline-block min-w-[260px] max-w-full space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInsertTarget({ kind: 'root' });
                    }}
                    className="bg-[#EA7D35] border-b-[3px] border-[#C45E1C] text-white font-display font-extrabold text-xs px-4 py-2 rounded-t-xl rounded-b-md shadow-sm cursor-pointer"
                  >
                    ketika dijalankan
                  </button>
                  {insertTarget.kind !== 'root' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInsertTarget({ kind: 'root' });
                      }}
                      className="text-[11px] font-bold text-[#3B3FA8] hover:underline cursor-pointer"
                    >
                      + Tambah di jalur utama
                    </button>
                  )}
                </div>

                {/* Root Block Stack */}
                <div className="pl-1 pt-0.5">
                  {renderBlockStack(
                    blocks,
                    { kind: 'root' },
                    'Klik atau seret blok dari kolom "Blok" di sebelah kiri'
                  )}
                </div>
              </div>

              {/* Floating Pink Koala Hint Circle Button (matches pink TA circle in screenshot!) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHintDrawer((v) => !v);
                }}
                className="fixed sm:absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#E9356B] hover:bg-[#D12257] text-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 z-20"
                title="Petunjuk Koala untuk Sub-Level ini"
              >
                <Lightbulb className="w-5 h-5" />
              </button>

              {showHintDrawer && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-20 right-4 w-72 bg-white border-2 border-[#E9356B] rounded-xl shadow-2xl p-3.5 z-30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#E9356B] flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Petunjuk Koala ({subLevel.levelIndex}.{subLevel.subIndex})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHintDrawer(false)}
                      className="p-0.5 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{subLevel.tip}</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleLoadSolution();
                      setShowHintDrawer(false);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#3B3FA8] text-xs font-extrabold cursor-pointer"
                  >
                    Tampilkan Solusi di Area Kerja
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ==================== MODAL 1: TAMPILKAN KODE (JS & PYTHON) ==================== */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
          onClick={() => setShowCodeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border-2 border-slate-900 max-w-lg w-full overflow-hidden shadow-2xl"
          >
            <div className="bg-[#3B3FA8] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm">
                <Code2 className="w-4 h-4 text-[#FFE600]" />
                Kode Program Koala — Sub-Level {subLevel.levelIndex}.{subLevel.subIndex}
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="p-1 rounded hover:bg-white/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setCodeTab('javascript')}
                    className={`px-3 py-1 rounded text-xs font-extrabold cursor-pointer ${
                      codeTab === 'javascript' ? 'bg-white text-[#3B3FA8] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeTab('python')}
                    className={`px-3 py-1 rounded text-xs font-extrabold cursor-pointer ${
                      codeTab === 'python' ? 'bg-white text-[#3B3FA8] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Python
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Tersalin!' : 'Salin Kode'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#1E1F26] text-[#7CE38B] font-mono text-xs leading-6 overflow-x-auto">
                {codeTab === 'javascript' ? generatedJs : generatedPy}
              </pre>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#3B3FA8] hover:bg-[#313591] text-white text-xs font-extrabold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: PANDUAN KONSEP LEVEL ==================== */}
      {showConceptModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
          onClick={() => setShowConceptModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border-2 border-slate-900 max-w-md w-full overflow-hidden shadow-2xl"
          >
            <div className="bg-[#3B3FA8] text-white px-5 py-4 flex items-center justify-between">
              <div className="font-display font-extrabold text-sm">
                {currentLevelGroup.videoTipTitle}
              </div>
              <button
                type="button"
                onClick={() => setShowConceptModal(false)}
                className="p-1 rounded hover:bg-white/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <KoalaSvg className="w-14 h-14 shrink-0" mood="happy" />
                <div>
                  <div className="text-xs font-extrabold text-[#3B3FA8]">
                    {currentLevelGroup.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {currentLevelGroup.videoTipSummary}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Petunjuk Sub-Level {subLevel.levelIndex}.{subLevel.subIndex}:</strong>{' '}
                {subLevel.tip}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowConceptModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#EA6A3A] hover:bg-[#D95B2C] text-white text-xs font-extrabold cursor-pointer"
                >
                  Siap Mencoba!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: VICTORY SUB-LEVEL ==================== */}
      {victoryInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-[3px] border-slate-900 max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <KoalaSvg className="w-16 h-16" mood="happy" />
              <EucalyptusTargetSvg className="w-14 h-14" />
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-slate-900">
                Selamat! Sub-Level {subLevel.levelIndex}.{subLevel.subIndex} Selesai!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Koala berhasil meraih daun eukaliptus menggunakan{' '}
                <strong className="text-slate-900">{victoryInfo.blockCount} blok</strong>!
              </p>
              {victoryInfo.optimal ? (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Sangat Optimal (sesuai batas {subLevel.maxBlocks} blok)
                </div>
              ) : (
                <div className="mt-2 text-xs font-bold text-amber-700">
                  Kamu bisa mencoba lagi agar ≤ {subLevel.maxBlocks} blok!
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setVictoryInfo(null);
                  handleResetRun();
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer"
              >
                Ulangi
              </button>
              <button
                type="button"
                onClick={() => {
                  setVictoryInfo(null);
                  setShowCodeModal(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-extrabold cursor-pointer"
              >
                Tampilkan Kode
              </button>
              <button
                type="button"
                onClick={handleNextSubLevel}
                className="px-4 py-2 rounded-lg bg-[#EA6A3A] hover:bg-[#D95B2C] text-white text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shadow"
              >
                Lanjutkan
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: RINGKASAN SEMUA LEVEL & SUB-LEVEL ==================== */}
      {showSummaryModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
          onClick={() => setShowSummaryModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border-2 border-slate-900 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="bg-[#3B3FA8] text-white px-5 py-4 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2 font-display font-extrabold text-base">
                <Trophy className="w-5 h-5 text-[#FFE600]" />
                Progres Labirin Koala ({completedIds.length} / {ALL_KOALA_SUBLEVELS.length} Sub-Level)
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="p-1 rounded hover:bg-white/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {KOALA_MAZE_LEVELS.map((lvl) => (
                <div key={lvl.levelNumber} className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-display font-extrabold text-sm text-slate-900">
                        {lvl.title}
                      </div>
                      <div className="text-xs text-slate-500">{lvl.description}</div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {lvl.subLevels.map((sl) => {
                      const done = completedIds.includes(sl.id);
                      const isCurrent = sl.id === subLevel.id;
                      return (
                        <button
                          key={sl.id}
                          type="button"
                          onClick={() => {
                            setActiveSubLevelId(sl.id);
                            setShowSummaryModal(false);
                          }}
                          className={`text-left px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-[#EEF2FF] border-[#3B3FA8] text-[#3B3FA8]'
                              : done
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">
                            {sl.levelIndex}.{sl.subIndex} · {sl.title}
                          </span>
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
