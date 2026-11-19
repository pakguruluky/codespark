import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Trash2,
  Star,
  ChevronRight,
  Award,
  CornerDownRight,
  RotateCw,
  Menu,
  GitBranch,
  Gem,
  Repeat,
  Lock,
  Phone,
} from 'lucide-react';
import type {
  BlockType,
  CertificateRecord,
  CodeBlockItem,
  CodeLanguage,
  Direction,
  ExecutionFrame,
  LevelDefinition,
} from '../types';
import { blocksToCode, executeCode } from '../engine/interpreter';
import { soundEngine } from '../engine/soundEngine';
import { GameCanvas, type PlaybackSpeed } from './GameCanvas';

interface Props {
  level: LevelDefinition;
  nextLevel?: LevelDefinition;
  prevLevel?: LevelDefinition;
  canGoNext: boolean;
  previousBestStars?: number;
  isTrialStudent?: boolean;
  adminPhone?: string;
  adminContactName?: string;
  onRequestUpgrade?: () => void;
  onBackToMap: () => void;
  onSelectLevel: (levelId: string) => void;
  onOpenCertificates: () => void;
  onLevelComplete: (payload: {
    levelId: string;
    tier: LevelDefinition['tier'];
    stars: 1 | 2 | 3;
    codeSubmitted: string;
    language: CodeLanguage;
  }) => Promise<{ newCertificate: CertificateRecord | null }>;
}

type StudioTab = 'blocks' | 'python' | 'javascript';

type TargetContainer =
  | { kind: 'root' }
  | { kind: 'children'; blockId: string }
  | { kind: 'else'; blockId: string };

function uid() {
  return `blk_${Math.random().toString(36).slice(2, 9)}`;
}

function cloneBlocks(blocks: CodeBlockItem[]): CodeBlockItem[] {
  return blocks.map((b) => ({
    ...b,
    id: uid(),
    children: b.children ? cloneBlocks(b.children) : undefined,
    elseChildren: b.elseChildren ? cloneBlocks(b.elseChildren) : undefined,
  }));
}

export const CodingStudio: React.FC<Props> = ({
  level,
  nextLevel,
  prevLevel,
  canGoNext,
  previousBestStars = 0,
  isTrialStudent = false,
  adminPhone,
  adminContactName,
  onRequestUpgrade,
  onBackToMap,
  onSelectLevel,
  onOpenCertificates,
  onLevelComplete,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('blocks');
  const [textLang, setTextLang] = useState<CodeLanguage>('python');
  const [blocks, setBlocks] = useState<CodeBlockItem[]>(() => cloneBlocks(level.starterBlocks));
  const [textCode, setTextCode] = useState<string>(() =>
    blocksToCode(level.starterBlocks, 'python')
  );
  const [target, setTarget] = useState<TargetContainer>({ kind: 'root' });
  const [toolboxTurnDir, setToolboxTurnDir] = useState<'left' | 'right'>('left');
  const [toolboxForwardSteps, setToolboxForwardSteps] = useState<number>(1);
  const [toolboxRepeatCount, setToolboxRepeatCount] = useState<number>(3);
  const [menuOpen, setMenuOpen] = useState(false);

  // Audio & Game Settings
  const [speed, setSpeed] = useState<PlaybackSpeed>('normal');
  const [showTutor, setShowTutor] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(() => soundEngine.isSfxEnabled());
  const [bgmEnabled, setBgmEnabled] = useState(() => soundEngine.isBgmEnabled());

  // Simulation State
  const [robotX, setRobotX] = useState(level.start.x);
  const [robotY, setRobotY] = useState(level.start.y);
  const [robotDir, setRobotDir] = useState<Direction>(level.start.dir);
  const [collectedGems, setCollectedGems] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'crashed' | 'incomplete'>('idle');
  const [actionLabel, setActionLabel] = useState('Klik tombol ▶ untuk menjalankan Panda!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Victory Modal State
  const [victoryData, setVictoryData] = useState<{
    stars: 1 | 2 | 3;
    lineCount: number;
    newCertificate: CertificateRecord | null;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset on level change
  useEffect(() => {
    stopTimer();
    const initialBlocks = cloneBlocks(level.starterBlocks);
    setBlocks(initialBlocks);
    setTextCode(blocksToCode(initialBlocks, textLang));
    setTarget({ kind: 'root' });
    setShowTutor(true);
    setRobotX(level.start.x);
    setRobotY(level.start.y);
    setRobotDir(level.start.dir);
    setCollectedGems([]);
    setStatus('idle');
    setActionLabel('Klik tombol ▶ untuk menjalankan Panda!');
    setErrorMsg(null);
    setActiveLine(null);
    setVictoryData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id]);

  // Keep synced text updated whenever blocks change while on Blocks tab
  useEffect(() => {
    if (activeTab === 'blocks') {
      setTextCode(blocksToCode(blocks, textLang));
    }
  }, [blocks, textLang, activeTab]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  // Keyboard shortcuts matching Codementum badges (Ctrl+Enter Run, Alt+R Reset, Alt+B/P/J Tabs, Alt+I Hint)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      } else if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetArena();
      } else if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        switchTab('blocks');
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        switchTab('python');
      } else if (e.altKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        switchTab('javascript');
      } else if (e.altKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setShowTutor((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const switchTab = (next: StudioTab) => {
    soundEngine.playTabSwitch();
    if (next === 'python') {
      if (activeTab === 'blocks') {
        setTextCode(blocksToCode(blocks, 'python'));
      } else if (activeTab === 'javascript') {
        setTextCode(blocksToCode(blocks, 'python'));
      }
      setTextLang('python');
    } else if (next === 'javascript') {
      if (activeTab === 'blocks' || activeTab === 'python') {
        setTextCode(blocksToCode(blocks, 'javascript'));
      }
      setTextLang('javascript');
    }
    setActiveTab(next);
  };

  const resetArena = () => {
    stopTimer();
    setRobotX(level.start.x);
    setRobotY(level.start.y);
    setRobotDir(level.start.dir);
    setCollectedGems([]);
    setStatus('idle');
    setActionLabel('Arena di-reset. Siap dicoba lagi!');
    setErrorMsg(null);
    setActiveLine(null);
    setVictoryData(null);
  };

  const resetToStarter = () => {
    soundEngine.playBlockDelete();
    resetArena();
    const fresh = cloneBlocks(level.starterBlocks);
    setBlocks(fresh);
    setTextCode(blocksToCode(fresh, textLang));
    setTarget({ kind: 'root' });
    setMenuOpen(false);
  };

  // Recursive block tree mutators
  const insertBlockInTree = (
    list: CodeBlockItem[],
    newBlock: CodeBlockItem,
    dest: TargetContainer
  ): CodeBlockItem[] => {
    if (dest.kind === 'root') return [...list, newBlock];
    return list.map((item) => {
      if (item.id === dest.blockId) {
        if (dest.kind === 'children') {
          return { ...item, children: [...(item.children || []), newBlock] };
        }
        return { ...item, elseChildren: [...(item.elseChildren || []), newBlock] };
      }
      return {
        ...item,
        children: item.children ? insertBlockInTree(item.children, newBlock, dest) : item.children,
        elseChildren: item.elseChildren
          ? insertBlockInTree(item.elseChildren, newBlock, dest)
          : item.elseChildren,
      };
    });
  };

  const removeBlockFromTree = (list: CodeBlockItem[], id: string): CodeBlockItem[] => {
    return list
      .filter((item) => item.id !== id)
      .map((item) => ({
        ...item,
        children: item.children ? removeBlockFromTree(item.children, id) : item.children,
        elseChildren: item.elseChildren
          ? removeBlockFromTree(item.elseChildren, id)
          : item.elseChildren,
      }));
  };

  const moveBlockInTree = (list: CodeBlockItem[], id: string, delta: -1 | 1): CodeBlockItem[] => {
    const idx = list.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const nextIdx = idx + delta;
      if (nextIdx < 0 || nextIdx >= list.length) return list;
      const copy = [...list];
      const [moved] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, moved);
      return copy;
    }
    return list.map((item) => ({
      ...item,
      children: item.children ? moveBlockInTree(item.children, id, delta) : item.children,
      elseChildren: item.elseChildren
        ? moveBlockInTree(item.elseChildren, id, delta)
        : item.elseChildren,
    }));
  };

  const updateBlockInTree = (
    list: CodeBlockItem[],
    id: string,
    patch: Partial<CodeBlockItem>
  ): CodeBlockItem[] => {
    return list.map((item) => {
      if (item.id === id) return { ...item, ...patch };
      return {
        ...item,
        children: item.children ? updateBlockInTree(item.children, id, patch) : item.children,
        elseChildren: item.elseChildren
          ? updateBlockInTree(item.elseChildren, id, patch)
          : item.elseChildren,
      };
    });
  };

  const handleAddBlock = (type: BlockType) => {
    soundEngine.playBlockSnap();
    const newBlock: CodeBlockItem = {
      id: uid(),
      type,
      ...(type === 'move_forward' ? { steps: Math.max(1, Math.min(15, toolboxForwardSteps)) } : {}),
      ...(type === 'repeat'
        ? { count: Math.max(1, Math.min(25, toolboxRepeatCount)), children: [] }
        : {}),
      ...(type === 'if_path_clear' ? { children: [], elseChildren: [] } : {}),
      ...(type === 'if_gem_ahead' ? { children: [] } : {}),
    };
    setBlocks((prev) => insertBlockInTree(prev, newBlock, target));
    if (type === 'repeat' || type === 'if_path_clear' || type === 'if_gem_ahead') {
      setTarget({ kind: 'children', blockId: newBlock.id });
    }
  };

  const handleRun = () => {
    stopTimer();
    setVictoryData(null);
    setErrorMsg(null);
    setShowTutor(false);

    const effectiveLang: CodeLanguage =
      activeTab === 'javascript' ? 'javascript' : activeTab === 'python' ? 'python' : textLang;
    const codeToRun =
      activeTab === 'blocks' ? blocksToCode(blocks, effectiveLang) : textCode;

    const result = executeCode(codeToRun, effectiveLang, level);

    setRobotX(level.start.x);
    setRobotY(level.start.y);
    setRobotDir(level.start.dir);
    setCollectedGems([]);
    setStatus('running');
    setActionLabel('Panda mulai melangkah...');

    const stepDelay = speed === 'slow' ? 580 : speed === 'fast' ? 190 : 360;

    const playFrame = (index: number, frames: ExecutionFrame[]) => {
      if (index >= frames.length) return;
      const frame = frames[index];
      setRobotX(frame.x);
      setRobotY(frame.y);
      setRobotDir(frame.dir);
      setCollectedGems(frame.collectedGems);
      setActiveLine(frame.activeLine);
      setActionLabel(frame.actionLabel);

      // Trigger synthesized sound for each step!
      if (frame.soundEvent === 'step') soundEngine.playStep();
      else if (frame.soundEvent === 'turn') soundEngine.playTurn();
      else if (frame.soundEvent === 'gem') soundEngine.playGemCollect();
      else if (frame.soundEvent === 'crash' || frame.soundEvent === 'incomplete') {
        soundEngine.playCrash();
      } else if (frame.soundEvent === 'success') {
        soundEngine.playGemCollect();
      }

      if (index === frames.length - 1) {
        setStatus(frame.status);
        if (result.success && result.stars > 0) {
          const earnedStars = result.stars as 1 | 2 | 3;
          soundEngine.playVictory(earnedStars);
          void onLevelComplete({
            levelId: level.id,
            tier: level.tier,
            stars: earnedStars,
            codeSubmitted: codeToRun,
            language: effectiveLang,
          }).then(({ newCertificate }) => {
            if (newCertificate) {
              setTimeout(() => soundEngine.playCertificateUnlock(), 650);
            }
            setVictoryData({
              stars: earnedStars,
              lineCount: result.lineCount,
              newCertificate,
            });
          });
        } else if (result.errorMessage) {
          setErrorMsg(result.errorMessage);
        }
        return;
      }

      timerRef.current = window.setTimeout(() => {
        playFrame(index + 1, frames);
      }, stepDelay);
    };

    timerRef.current = window.setTimeout(() => {
      playFrame(0, result.frames);
    }, 180);
  };

  const renderWorkspaceBlock = (block: CodeBlockItem, depth = 0) => {
    const isContainer =
      block.type === 'repeat' || block.type === 'if_path_clear' || block.type === 'if_gem_ahead';
    const isTargetingChildren = target.kind === 'children' && target.blockId === block.id;
    const isTargetingElse = target.kind === 'else' && target.blockId === block.id;

    const bgStyle: Record<BlockType, string> = {
      move_forward: 'bg-[#2B8EF2] border-[#1A65B5] text-white',
      turn_left: 'bg-[#F3C043] border-[#BD8D1B] text-[#3B2305]',
      turn_right: 'bg-[#F3C043] border-[#BD8D1B] text-[#3B2305]',
      repeat: 'bg-[#9353D3] border-[#662D9F] text-white',
      if_path_clear: 'bg-[#1EA896] border-[#117366] text-white',
      if_gem_ahead: 'bg-[#E95B7A] border-[#B22F4C] text-white',
    };

    return (
      <div key={block.id} className="space-y-1" style={{ marginLeft: depth > 0 ? 10 : 0 }}>
        {/* Interlocking Codementum Puzzle Block */}
        <div
          className={`cm-puzzle-block relative rounded-md border-2 px-2.5 py-2 flex flex-wrap items-center justify-between gap-2 shadow-[0_3px_0_rgba(0,0,0,0.22)] ${bgStyle[block.type]}`}
        >
          <div className="flex items-center gap-1.5 min-w-0 font-display font-extrabold text-sm">
            {depth > 0 && <CornerDownRight className="w-3.5 h-3.5 shrink-0 opacity-85" />}

            {block.type === 'move_forward' && (
              <>
                <span>forward</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={block.steps ?? 1}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(15, parseInt(e.target.value, 10) || 1));
                    soundEngine.playButtonClick();
                    setBlocks((prev) => updateBlockInTree(prev, block.id, { steps: val }));
                  }}
                  aria-label="Jumlah langkah maju"
                  className="w-11 h-7 rounded bg-[#1D6CC0] text-white text-center font-mono text-xs font-extrabold border border-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
                />
              </>
            )}

            {(block.type === 'turn_left' || block.type === 'turn_right') && (
              <>
                <span>turn</span>
                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                <select
                  value={block.type === 'turn_left' ? 'left' : 'right'}
                  onChange={(e) => {
                    soundEngine.playButtonClick();
                    const nextType: BlockType =
                      e.target.value === 'right' ? 'turn_right' : 'turn_left';
                    setBlocks((prev) => updateBlockInTree(prev, block.id, { type: nextType }));
                  }}
                  aria-label="Arah belok"
                  className="h-7 px-2 rounded bg-[#B5822C] text-white font-sans text-xs font-extrabold border border-black/25 cursor-pointer focus:outline-none"
                >
                  <option value="left">left</option>
                  <option value="right">right</option>
                </select>
              </>
            )}

            {block.type === 'repeat' && (
              <>
                <Repeat className="w-4 h-4 shrink-0" />
                <span>repeat</span>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={block.count ?? 3}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(25, parseInt(e.target.value, 10) || 1));
                    soundEngine.playButtonClick();
                    setBlocks((prev) => updateBlockInTree(prev, block.id, { count: val }));
                  }}
                  aria-label="Jumlah pengulangan"
                  className="w-11 h-7 rounded bg-[#6C30A8] text-white text-center font-mono text-xs font-extrabold border border-white/40 focus:outline-none"
                />
              </>
            )}

            {block.type === 'if_path_clear' && (
              <>
                <GitBranch className="w-4 h-4 shrink-0" />
                <span>if path_clear()</span>
              </>
            )}

            {block.type === 'if_gem_ahead' && (
              <>
                <Gem className="w-4 h-4 shrink-0" />
                <span>if gem_ahead()</span>
              </>
            )}
          </div>

          {/* Reorder & Remove Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBlockSnap();
                setBlocks((prev) => moveBlockInTree(prev, block.id, -1));
              }}
              className="w-7 h-7 rounded bg-black/20 hover:bg-black/35 text-white flex items-center justify-center cursor-pointer"
              title="Pindah ke atas"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playBlockSnap();
                setBlocks((prev) => moveBlockInTree(prev, block.id, 1));
              }}
              className="w-7 h-7 rounded bg-black/20 hover:bg-black/35 text-white flex items-center justify-center cursor-pointer"
              title="Pindah ke bawah"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playBlockDelete();
                setBlocks((prev) => removeBlockFromTree(prev, block.id));
                if (
                  (target.kind === 'children' || target.kind === 'else') &&
                  target.blockId === block.id
                ) {
                  setTarget({ kind: 'root' });
                }
              }}
              className="w-7 h-7 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center cursor-pointer"
              title="Hapus blok"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nested Body for repeat / if */}
        {isContainer && (
          <div className="ml-3 pl-2.5 border-l-4 border-[#8C5A2B]/60 space-y-1.5 py-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-[#5C3210]">
                {block.type === 'repeat' ? 'Ulangi perintah:' : 'Jika benar:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setTarget({ kind: 'children', blockId: block.id });
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold border border-[#5C3210] cursor-pointer ${
                  isTargetingChildren ? 'bg-[#57B832] text-white' : 'bg-[#FFF5D6] text-[#5C3210]'
                }`}
              >
                {isTargetingChildren ? 'Target Aktif ✓' : '+ Isi di sini'}
              </button>
            </div>

            {block.children && block.children.length > 0 ? (
              block.children.map((ch) => renderWorkspaceBlock(ch, depth + 1))
            ) : (
              <div className="text-[11px] italic text-[#7A5128] px-2 py-1 rounded border border-dashed border-[#8C5A2B]/50 bg-[#FFF5D6]/50">
                Klik blok di sebelah kiri untuk menambahkan ke sini.
              </div>
            )}

            {block.type === 'if_path_clear' && (
              <div className="pt-1.5 space-y-1 border-t border-[#8C5A2B]/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-extrabold text-[#5C3210]">
                    else: (jika terhalang)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setTarget({ kind: 'else', blockId: block.id });
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-extrabold border border-[#5C3210] cursor-pointer ${
                      isTargetingElse ? 'bg-[#57B832] text-white' : 'bg-[#FFF5D6] text-[#5C3210]'
                    }`}
                  >
                    {isTargetingElse ? 'Target Else ✓' : '+ Isi Else'}
                  </button>
                </div>
                {block.elseChildren && block.elseChildren.length > 0 ? (
                  block.elseChildren.map((ch) => renderWorkspaceBlock(ch, depth + 1))
                ) : (
                  <div className="text-[11px] italic text-[#7A5128] px-2 py-1 rounded border border-dashed border-[#8C5A2B]/50 bg-[#FFF5D6]/50">
                    Opsional: klik "+ Isi Else" lalu pilih blok turn.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] bg-[#3A414A]">
      {/* RIGHT (ON TOP FOR MOBILE, RIGHT ON DESKTOP): ISOMETRIC FOREST GAME WORLD */}
      <div className="order-1 lg:order-2 lg:w-[56%] xl:w-[58%] flex flex-col">
        <GameCanvas
          level={level}
          robotX={robotX}
          robotY={robotY}
          robotDir={robotDir}
          collectedGems={collectedGems}
          status={status}
          actionLabel={actionLabel}
          errorMsg={errorMsg}
          speed={speed}
          onChangeSpeed={setSpeed}
          onRun={handleRun}
          onReset={resetArena}
          canGoPrev={Boolean(prevLevel)}
          canGoNext={Boolean(nextLevel) && (canGoNext || (isTrialStudent && level.order === 1))}
          onPrevLevel={() => prevLevel && onSelectLevel(prevLevel.id)}
          onNextLevel={() => {
            if (isTrialStudent && level.order === 1) {
              onRequestUpgrade?.();
              return;
            }
            if (nextLevel && canGoNext) {
              onSelectLevel(nextLevel.id);
            }
          }}
          onOpenMap={onBackToMap}
          onOpenCertificates={onOpenCertificates}
          showTutor={showTutor}
          onToggleTutor={() => setShowTutor((v) => !v)}
          sfxEnabled={sfxEnabled}
          bgmEnabled={bgmEnabled}
          onToggleSfx={() => {
            const next = !sfxEnabled;
            setSfxEnabled(next);
            soundEngine.setSfxEnabled(next);
          }}
          onToggleBgm={() => {
            const next = !bgmEnabled;
            setBgmEnabled(next);
            soundEngine.setBgmEnabled(next);
          }}
        />
      </div>

      {/* LEFT: CODEMENTUM CARVED WOODEN FRAME & PARCHMENT CODING PANEL */}
      <div className="order-2 lg:order-1 lg:w-[44%] xl:w-[42%] p-2 sm:p-3 flex flex-col bg-[#333840]">
        <div className="cm-wood-frame flex-1 flex flex-col rounded-md overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
          {/* Carved Wooden Top Tabs Header (Blocks | Python | Javascript + Menu) */}
          <div className="cm-wood-header px-2.5 pt-2.5 pb-0 flex items-end justify-between gap-1.5 relative">
            {/* Decorative green leaves in top-left corner matching Codementum */}
            <svg
              viewBox="0 0 60 32"
              className="pointer-events-none absolute -top-1 -left-1 w-14 h-8 opacity-95"
              aria-hidden="true"
            >
              <path d="M2,28 Q10,6 32,6 Q22,22 2,28 Z" fill="#5CB834" stroke="#265A12" strokeWidth="1.8" />
              <path d="M16,24 Q30,4 54,12 Q36,24 16,24 Z" fill="#76CC45" stroke="#265A12" strokeWidth="1.6" />
            </svg>

            <div className="flex items-end gap-1.5 pl-6 sm:pl-8 overflow-x-auto">
              {[
                { id: 'blocks' as const, label: 'Blocks', shortcut: '⌘B' },
                { id: 'python' as const, label: 'Python', shortcut: '⌘P' },
                { id: 'javascript' as const, label: 'Javascript', shortcut: '⌘J' },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => switchTab(tab.id)}
                    className={`relative px-3.5 sm:px-5 py-2 rounded-t-md border-t-2 border-x-2 font-display font-extrabold text-xs sm:text-sm tracking-wide cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-gradient-to-b from-[#F4B459] to-[#D4872E] border-[#5C2A0E] text-white shadow-[0_-2px_6px_rgba(0,0,0,0.2)] -mb-[2px] pb-2.5 z-10'
                        : 'bg-gradient-to-b from-[#9B5226] to-[#743917] border-[#4A210A] text-[#F5DEC0] hover:brightness-110'
                    }`}
                  >
                    <span className="absolute -top-1.5 left-1 px-1 text-[8px] font-mono font-bold bg-black/70 text-white rounded">
                      {tab.shortcut}
                    </span>
                    <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Golden Menu Button on Right of Wooden Header */}
            <div className="relative pb-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setMenuOpen((v) => !v);
                }}
                className="w-9 h-9 rounded bg-gradient-to-b from-[#FFE07D] to-[#D99B26] border-2 border-[#5C2A0E] flex items-center justify-center text-white shadow cursor-pointer"
                title="Opsi Editor Kode"
              >
                <Menu className="w-5 h-5 drop-shadow" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 z-30 w-52 rounded-md border-2 border-[#5C2A0E] bg-[#FFF5D6] shadow-lg p-2 space-y-1 text-xs font-bold text-[#3A1E08]">
                  <button
                    type="button"
                    onClick={resetToStarter}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#EED48A] cursor-pointer"
                  >
                    Kembalikan Kode Awal Level
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBlockDelete();
                      setBlocks([]);
                      setTextCode('');
                      setTarget({ kind: 'root' });
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#FB7185]/30 text-red-800 cursor-pointer"
                  >
                    Kosongkan Semua Blok
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onBackToMap();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#EED48A] cursor-pointer"
                  >
                    Kembali ke Peta Level
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* WARM PARCHMENT WORKSPACE BODY */}
          <div className="cm-parchment flex-1 flex flex-col border-t-2 border-[#5C2A0E] min-h-[380px] lg:min-h-[500px]">
            {activeTab === 'blocks' ? (
              <div className="flex-1 grid grid-cols-12 min-h-0">
                {/* LEFT COLUMN: CODEMENTUM BLOCK TOOLBOX */}
                <div className="col-span-5 border-r-2 border-dashed border-[#8C5A2B]/45 p-2.5 sm:p-3 space-y-2.5 overflow-y-auto">
                  <div className="text-[11px] font-extrabold text-[#6E441E] uppercase tracking-wider">
                    Blok Perintah
                  </div>

                  {/* Blue forward(n) block */}
                  <div className="rounded-md bg-[#2B8EF2] border-2 border-[#1A65B5] shadow-[0_3px_0_rgba(0,0,0,0.22)] p-2 text-white">
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddBlock('move_forward')}
                        className="flex items-center gap-1 font-display font-extrabold text-xs sm:text-sm cursor-pointer flex-1 text-left"
                      >
                        <span>forward</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={toolboxForwardSteps}
                        onChange={(e) =>
                          setToolboxForwardSteps(
                            Math.max(1, Math.min(15, parseInt(e.target.value, 10) || 1))
                          )
                        }
                        aria-label="Nilai langkah forward"
                        className="w-9 h-6 rounded bg-[#1B67B7] text-white text-center font-mono text-xs font-extrabold border border-white/40"
                      />
                    </div>
                  </div>

                  {/* Gold turn(left|right) block */}
                  <div className="rounded-md bg-[#F3C043] border-2 border-[#BD8D1B] shadow-[0_3px_0_rgba(0,0,0,0.22)] p-2 text-[#3B2305]">
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleAddBlock(toolboxTurnDir === 'left' ? 'turn_left' : 'turn_right')
                        }
                        className="flex items-center gap-1 font-display font-extrabold text-xs sm:text-sm cursor-pointer flex-1 text-left"
                      >
                        <span>turn</span>
                        <RotateCw className="w-3.5 h-3.5 shrink-0" />
                      </button>
                      <select
                        value={toolboxTurnDir}
                        onChange={(e) => setToolboxTurnDir(e.target.value as 'left' | 'right')}
                        aria-label="Pilih arah turn"
                        className="h-6 px-1.5 rounded bg-[#B5822C] text-white text-[11px] font-extrabold border border-black/20 cursor-pointer"
                      >
                        <option value="left">left</option>
                        <option value="right">right</option>
                      </select>
                    </div>
                  </div>

                  {/* Purple repeat(n) block */}
                  <div className="rounded-md bg-[#9353D3] border-2 border-[#662D9F] shadow-[0_3px_0_rgba(0,0,0,0.22)] p-2 text-white">
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddBlock('repeat')}
                        className="flex items-center gap-1 font-display font-extrabold text-xs sm:text-sm cursor-pointer flex-1 text-left"
                      >
                        <Repeat className="w-3.5 h-3.5 shrink-0" />
                        <span>repeat</span>
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={toolboxRepeatCount}
                        onChange={(e) =>
                          setToolboxRepeatCount(
                            Math.max(1, Math.min(25, parseInt(e.target.value, 10) || 1))
                          )
                        }
                        aria-label="Nilai repeat"
                        className="w-9 h-6 rounded bg-[#6C30A8] text-white text-center font-mono text-xs font-extrabold border border-white/40"
                      />
                    </div>
                  </div>

                  {/* Teal if path_clear block */}
                  <button
                    type="button"
                    onClick={() => handleAddBlock('if_path_clear')}
                    className="w-full rounded-md bg-[#1EA896] border-2 border-[#117366] shadow-[0_3px_0_rgba(0,0,0,0.22)] p-2 text-white font-display font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <GitBranch className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">if path_clear</span>
                  </button>

                  {/* Coral if gem_ahead block */}
                  <button
                    type="button"
                    onClick={() => handleAddBlock('if_gem_ahead')}
                    className="w-full rounded-md bg-[#E95B7A] border-2 border-[#B22F4C] shadow-[0_3px_0_rgba(0,0,0,0.22)] p-2 text-white font-display font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Gem className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">if gem_ahead</span>
                  </button>

                  {/* Compact Live Sync Preview */}
                  <div className="pt-2">
                    <div className="rounded border border-[#8C5A2B]/60 bg-[#2A231D] text-[#FDE68A] p-2 font-mono text-[11px] leading-relaxed overflow-x-auto">
                      <div className="text-[10px] text-[#94A3B8] mb-1 flex items-center justify-between">
                        <span>Live {textLang === 'python' ? 'Python' : 'JS'}</span>
                        <button
                          type="button"
                          onClick={() => switchTab(textLang)}
                          className="text-[#38BDF8] hover:underline cursor-pointer"
                        >
                          Edit →
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">
                        {textCode || '# klik blok'}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: START CAP & SNAPPED PROGRAM STACK */}
                <div className="col-span-7 p-2.5 sm:p-3 flex flex-col overflow-y-auto">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold text-[#6E441E]">
                      {target.kind === 'root' ? 'Program Utama' : 'Target: Dalam Blok'}
                    </span>
                    {target.kind !== 'root' && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          setTarget({ kind: 'root' });
                        }}
                        className="text-[11px] font-extrabold text-[#1D6CC0] underline cursor-pointer"
                      >
                        Ke START
                      </button>
                    )}
                  </div>

                  {/* Iconic Codementum Green START Cap Block */}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setTarget({ kind: 'root' });
                    }}
                    className={`w-36 rounded-t-xl rounded-b-md bg-gradient-to-b from-[#66C93B] to-[#4CA626] border-2 border-[#317215] px-4 py-2 text-left font-display font-extrabold text-white tracking-wider text-sm shadow-[0_3px_0_rgba(0,0,0,0.2)] cursor-pointer mb-1.5 ${
                      target.kind === 'root' ? 'ring-2 ring-[#FFE600]' : ''
                    }`}
                  >
                    START
                  </button>

                  {blocks.length === 0 ? (
                    <div className="mt-1 p-4 rounded border-2 border-dashed border-[#8C5A2B]/45 bg-[#FFF7DF]/55 text-xs font-bold text-[#7A5128] text-center">
                      Klik blok di sebelah kiri (mis. <code>forward</code>) untuk memasangnya di bawah START!
                    </div>
                  ) : (
                    <div className="space-y-1.5">{blocks.map((b) => renderWorkspaceBlock(b, 0))}</div>
                  )}
                </div>
              </div>
            ) : (
              /* PYTHON / JAVASCRIPT CODE EDITOR TAB */
              <div className="flex-1 flex flex-col p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-[#4A2508]">
                  <span>
                    Mode Teks: {activeTab === 'python' ? 'Python (.py)' : 'JavaScript (.js)'}
                  </span>
                  <span className="font-mono text-[11px] text-[#7A5128]">
                    Target 3★: ≤ {level.optimalLines} baris
                  </span>
                </div>

                <div className="flex-1 min-h-[260px] rounded-md border-2 border-[#5C2A0E] bg-[#1E1F26] text-white flex overflow-hidden shadow-inner">
                  <div className="py-3 px-2.5 bg-[#15161B] border-r border-white/10 font-mono text-xs text-neutral-500 select-none text-right">
                    {(textCode || ' ').split('\n').map((_, idx) => (
                      <div
                        key={idx}
                        className={`leading-6 ${
                          activeLine === idx + 1 ? 'text-[#FFE600] font-extrabold' : ''
                        }`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={textCode}
                    onChange={(e) => setTextCode(e.target.value)}
                    spellCheck={false}
                    aria-label="Editor kode Python atau JavaScript"
                    className="w-full h-full p-3 bg-[#1E1F26] text-[#7CE38B] font-mono text-sm leading-6 focus:outline-none resize-none"
                    placeholder={
                      activeTab === 'python'
                        ? 'forward(3)\nturn("left")'
                        : 'forward(3);\nturn("left");'
                    }
                  />
                </div>

                {/* Quick-Insert Command Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {(activeTab === 'python'
                    ? ['forward(1)', 'turn("left")', 'turn("right")', 'for i in range(3):\n  forward(1)', 'if path_clear():\n  forward(1)\nelse:\n  turn("left")']
                    : ['forward(1);', 'turn("left");', 'turn("right");', 'for (let i = 0; i < 3; i++) {\n  forward(1);\n}', 'if (pathClear()) {\n  forward(1);\n} else {\n  turn("left");\n}']
                  ).map((snippet) => (
                    <button
                      key={snippet}
                      type="button"
                      onClick={() => {
                        soundEngine.playBlockSnap();
                        setTextCode((prev) => (prev.trim() ? `${prev}\n${snippet}` : snippet));
                      }}
                      className="px-2 py-1 rounded bg-[#FFF5D6] hover:bg-[#FFE600] border border-[#7C4A22] font-mono text-[11px] font-bold text-[#3A1E08] cursor-pointer"
                    >
                      + {snippet.split('\n')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Info Bar inside Parchment */}
            <div className="px-3 py-2 border-t border-[#8C5A2B]/35 bg-[#E6C776]/70 flex items-center justify-between text-[11px] font-extrabold text-[#5C3210]">
              <span>
                Tingkat {level.tierLabel} · Level {level.order}
              </span>
              <div className="flex items-center gap-1">
                <span>Skor Terbaik:</span>
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= previousBestStars
                        ? 'fill-[#F59E0B] text-[#5C3210]'
                        : 'text-[#8C5A2B]/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VICTORY MODAL */}
      {victoryData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="neo-card bg-[#FFFDF7] w-full max-w-md p-6 sm:p-7 text-center space-y-5">
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-14 h-14 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center ${
                    s <= victoryData.stars ? 'bg-[#FFE600]' : 'bg-white'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      s <= victoryData.stars ? 'fill-black text-black' : 'text-neutral-300'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-display text-3xl font-extrabold">Hebat! Misi Selesai!</h3>
              <p className="text-sm font-semibold text-neutral-700 mt-1">
                Kamu meraih <strong>{victoryData.stars} dari 3 bintang</strong> dengan{' '}
                <span className="font-mono font-bold">{victoryData.lineCount} baris</span> kode!
              </p>
              {victoryData.stars < 3 && (
                <p className="text-xs text-neutral-600 mt-1">
                  Tips: Ringkas kodemu hingga ≤ {level.optimalLines} baris untuk meraih 3 bintang penuh.
                </p>
              )}
            </div>

            {victoryData.newCertificate && (
              <div className="p-4 bg-[#4ADE80] border-[3px] border-black shadow-[3px_3px_0px_0px_#000] text-left space-y-2">
                <div className="flex items-center gap-2 font-display font-extrabold text-base">
                  <Award className="w-5 h-5 shrink-0" />
                  Sertifikat Kelulusan Terbit!
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  Selamat! Kamu menuntaskan seluruh level {level.tierLabel}. Sertifikat{' '}
                  <span className="font-mono">{victoryData.newCertificate.certificateNo}</span> siap dicetak!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setVictoryData(null);
                    onOpenCertificates();
                  }}
                  className="neo-btn bg-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                >
                  Lihat &amp; Cetak Sertifikat →
                </button>
              </div>
            )}

            {isTrialStudent && level.order === 1 && (
              <div className="p-4 bg-[#FFE600] border-[3px] border-black shadow-[3px_3px_0px_0px_#000] text-left space-y-2">
                <div className="flex items-center gap-2 font-display font-extrabold text-sm">
                  <Lock className="w-4 h-4 shrink-0" />
                  Batas Kode Belajar Uji Coba (Level 1)
                </div>
                <p className="text-xs font-semibold leading-relaxed text-neutral-900">
                  Kode belajar uji coba hanya mencakup Level 1. Untuk melanjutkan ke Level 2 hingga Level 9 &amp;
                  meraih Sertifikat, hubungi Admin untuk mendapatkan Kode Akses Penuh.
                </p>
                {adminPhone && (
                  <div className="text-xs font-extrabold inline-flex items-center gap-1.5 bg-white px-2.5 py-1 border-2 border-black">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {adminContactName || 'Admin'}: {adminPhone}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  resetArena();
                }}
                className="neo-btn bg-white py-3 px-4 text-sm font-bold flex-1 cursor-pointer"
              >
                Ulangi Level
              </button>
              {isTrialStudent && level.order === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setVictoryData(null);
                    onRequestUpgrade?.();
                  }}
                  className="neo-btn bg-[#4ADE80] py-3 px-4 text-sm font-extrabold flex-1 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Admin
                </button>
              ) : nextLevel ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setVictoryData(null);
                    onSelectLevel(nextLevel.id);
                  }}
                  className="neo-btn bg-[#4ADE80] py-3 px-4 text-sm font-extrabold flex-1 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Level Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setVictoryData(null);
                    onOpenCertificates();
                  }}
                  className="neo-btn bg-[#FFE600] py-3 px-4 text-sm font-extrabold flex-1 cursor-pointer"
                >
                  Lihat Sertifikat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
