import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Gamepad2,
  Grid3X3,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Lock,
  MessageCircle,
  Minus,
  Music,
  Phone,
  Play,
  Plus,
  Puzzle,
  Redo2,
  RefreshCw,
  Repeat,
  Rocket,
  Save,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Split,
  Star,
  Trees,
  Trophy,
  Undo2,
  Unlock,
  Wand2,
  X,
} from 'lucide-react';
import type {
  CertificateRecord,
  GameMakerProjectId,
  ProgressRecord,
} from '../types';
import {
  GAME_MAKER_PROJECTS,
  getGameMakerProjectById,
  type GameMakerProjectDef,
} from '../data/gameMakerProjects';
import {
  ARCADE_CATEGORIES,
  ARCADE_FLYOUT_TEMPLATES,
  arcadeProgramToPython,
  getCategoryColor,
  getEventColor,
  makeBlockId,
  parseArcadePython,
  playArcadeSfx,
  type ArcadeBlockProgram,
  type ArcadeCategoryId,
  type ArcadeHudSnapshot,
  type FlyoutTemplate,
} from '../engine/arcadeEngine';
import type { PixelSpriteGrid } from '../engine/arcadeSprites';
import { ArcadeHandheldConsole } from './ArcadeHandheldConsole';
import { ArcadeBlocksCanvas } from './ArcadeBlocksCanvas';
import { ArcadePixelEditor } from './ArcadePixelEditor';
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

type EditorTab = 'blocks' | 'python' | 'assets';

function cloneProgram(prog: ArcadeBlockProgram): ArcadeBlockProgram {
  return {
    containers: prog.containers.map((c) => ({
      ...c,
      params: { ...c.params },
      blocks: c.blocks.map((b) => ({ ...b, params: { ...b.params } })),
    })),
  };
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

function getCategoryIcon(id: ArcadeCategoryId) {
  switch (id) {
    case 'sprites':
      return Send;
    case 'controller':
      return Gamepad2;
    case 'game':
      return Sparkles;
    case 'music':
      return Music;
    case 'scene':
      return Trees;
    case 'info':
      return ListChecks;
    case 'loops':
      return Repeat;
    case 'logic':
      return Split;
    case 'variables':
      return SlidersHorizontal;
  }
}

const PYTHON_SNIPPETS: Array<{ label: string; code: string }> = [
  {
    label: '+ Tembak Laser (A)',
    code: `\ndef on_a_pressed():\n    sprites.create_projectile_from_sprite(assets.image("laser"), my_sprite, 0, -135)\n    music.play_sound("pew_pew")\ncontroller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)\n`,
  },
  {
    label: '+ Spawn Musuh',
    code: `\ndef on_spawn_enemy():\n    sprites.spawn(SpriteKind.enemy, assets.image("meteor"), 48, "top_random")\ngame.on_update_interval(1100, on_spawn_enemy)\n`,
  },
  {
    label: '+ Overlap Food (+15)',
    code: `\ndef on_hit_food(sprite, other_sprite):\n    other_sprite.destroy("confetti")\n    info.change_score_by(15)\n    music.play_sound("ba_ding")\nsprites.on_overlap(SpriteKind.player, SpriteKind.food, on_hit_food)\n`,
  },
  {
    label: '+ Overlap Enemy (-1)',
    code: `\ndef on_hit_enemy(sprite, other_sprite):\n    other_sprite.destroy("fire")\n    info.change_life_by(-1)\n    music.play_sound("zapped")\nsprites.on_overlap(SpriteKind.player, SpriteKind.enemy, on_hit_enemy)\n`,
  },
];

export const GameMakerWorkspace: React.FC<Props> = ({
  hasAccess,
  requestedGameMaker,
  isAdminPreview = false,
  initialProjectId = null,
  completedProgressMap,
  adminPhone,
  adminContactName = 'Admin CodeSpark',
  onRequestUpgrade,
  onProjectComplete,
  onOpenCertificates,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<GameMakerProjectId | null>(
    initialProjectId
  );

  // Sync if parent explicitly passes initialProjectId
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  const [activeTab, setActiveTab] = useState<EditorTab>('blocks');
  const [program, setProgram] = useState<ArcadeBlockProgram>(() =>
    cloneProgram(GAME_MAKER_PROJECTS[0].arcadeStarter)
  );
  const [history, setHistory] = useState<ArcadeBlockProgram[]>([]);
  const [future, setFuture] = useState<ArcadeBlockProgram[]>([]);
  const [gameTitle, setGameTitle] = useState<string>(GAME_MAKER_PROJECTS[0].defaultGameName);
  const [pythonDraft, setPythonDraft] = useState<string>('');
  const [pythonDirty, setPythonDirty] = useState(false);
  const [pythonErrors, setPythonErrors] = useState<Array<{ line: number; message: string }>>([]);

  // Toolbox & Flyout state (matches MakeCode Arcade middle panel)
  const [toolboxCollapsed, setToolboxCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ArcadeCategoryId | null>('game');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContainerId, setActiveContainerId] = useState<string>('im_start');
  const [zoom, setZoom] = useState<number>(1);

  // Pixel Art Custom Sprites
  const [customSprites, setCustomSprites] = useState<Record<string, PixelSpriteGrid>>({});
  const [selectedAssetSpriteId, setSelectedAssetSpriteId] = useState<string>('rocket');

  // UI Helpers & HUD
  const [showMissionGuide, setShowMissionGuide] = useState(false);
  const [hudSnapshot, setHudSnapshot] = useState<ArcadeHudSnapshot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [victoryModal, setVictoryModal] = useState<{
    project: GameMakerProjectDef;
    newCertificate: CertificateRecord | null;
  } | null>(null);

  const selectedProject = useMemo(
    () => (selectedProjectId ? getGameMakerProjectById(selectedProjectId) || null : null),
    [selectedProjectId]
  );

  const isProjectUnlocked = useCallback(
    (project: GameMakerProjectDef) => {
      if (isAdminPreview) return true;
      if (project.order === 1) return true;
      const prev = GAME_MAKER_PROJECTS.find((p) => p.order === project.order - 1);
      if (!prev) return true;
      return completedProgressMap.has(prev.id);
    },
    [completedProgressMap, isAdminPreview]
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2600);
  }, []);

  // Load project starter/solution when opening a project
  const openProject = useCallback(
    (project: GameMakerProjectDef) => {
      const alreadyDone = completedProgressMap.has(project.id);
      const initialProg = cloneProgram(
        alreadyDone ? project.arcadeSolution : project.arcadeStarter
      );
      setSelectedProjectId(project.id);
      setProgram(initialProg);
      setHistory([]);
      setFuture([]);
      setGameTitle(project.defaultGameName);
      setActiveContainerId(initialProg.containers[0]?.id || '');
      setPythonDraft(arcadeProgramToPython(initialProg, project.defaultGameName));
      setPythonDirty(false);
      setPythonErrors([]);
      setActiveTab('blocks');
      setSelectedCategory('sprites');
      setShowMissionGuide(false);
      setZoom(1);

      // Select primary hero sprite for Assets editor
      const playerBlk = initialProg.containers
        .flatMap((c) => c.blocks)
        .find((b) => b.type === 'create_player');
      if (playerBlk && typeof playerBlk.params.spriteId === 'string') {
        setSelectedAssetSpriteId(playerBlk.params.spriteId);
      }
    },
    [completedProgressMap]
  );

  // If initialized directly into a project via initialProjectId
  useEffect(() => {
    if (initialProjectId) {
      const proj = getGameMakerProjectById(initialProjectId);
      if (proj) {
        openProject(proj);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  // Keep Python code synced whenever Blocks change (if not currently mid-editing dirty python)
  useEffect(() => {
    if (!pythonDirty) {
      setPythonDraft(arcadeProgramToPython(program, gameTitle));
    }
  }, [program, gameTitle, pythonDirty]);

  const commitProgram = useCallback(
    (next: ArcadeBlockProgram) => {
      setHistory((prev) => [...prev.slice(-24), cloneProgram(program)]);
      setFuture([]);
      setProgram(next);
      setPythonDirty(false);
      setPythonErrors([]);
    },
    [program]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [cloneProgram(program), ...f]);
    setHistory((h) => h.slice(0, -1));
    setProgram(prev);
    setPythonDirty(false);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, cloneProgram(program)]);
    setFuture((f) => f.slice(1));
    setProgram(next);
    setPythonDirty(false);
  };

  // Add block or event container from flyout
  const handleInsertTemplate = useCallback(
    (tpl: FlyoutTemplate, targetContainerId?: string) => {
      const next = cloneProgram(program);

      if (tpl.kind === 'event' && tpl.eventTemplate) {
        const newId = makeBlockId('ev');
        next.containers.push({
          id: newId,
          eventType: tpl.eventTemplate.eventType,
          params: { ...tpl.eventTemplate.params },
          blocks: tpl.eventTemplate.blocks.map((b) => ({
            ...b,
            id: makeBlockId('blk'),
            params: { ...b.params },
          })),
        });
        commitProgram(next);
        setActiveContainerId(newId);
        playArcadeSfx('ba_ding', false);
        showToast(`Event ditambahkan: ${tpl.label}`);
        return;
      }

      if (tpl.kind === 'statement' && tpl.statementTemplate) {
        const destId = targetContainerId || activeContainerId || next.containers[0]?.id;
        let container = next.containers.find((c) => c.id === destId);
        if (!container) {
          container = next.containers[0];
        }
        if (container) {
          container.blocks.push({
            id: makeBlockId('blk'),
            type: tpl.statementTemplate.type,
            params: { ...tpl.statementTemplate.params },
          });
          commitProgram(next);
          playArcadeSfx('ba_ding', false);
        }
      }
    },
    [activeContainerId, commitProgram, program, showToast]
  );

  const handleDropTemplateIntoContainer = useCallback(
    (containerId: string, templateId: string) => {
      const tpl = ARCADE_FLYOUT_TEMPLATES.find((t) => t.id === templateId);
      if (!tpl) return;
      handleInsertTemplate(tpl, containerId);
      setActiveContainerId(containerId);
    },
    [handleInsertTemplate]
  );

  const handleUpdateContainerParam = (
    containerId: string,
    key: string,
    value: string | number | boolean
  ) => {
    const next = cloneProgram(program);
    const c = next.containers.find((item) => item.id === containerId);
    if (!c) return;
    c.params[key] = value;
    commitProgram(next);
  };

  const handleRemoveContainer = (containerId: string) => {
    const next = cloneProgram(program);
    next.containers = next.containers.filter((c) => c.id !== containerId);
    commitProgram(next);
    if (activeContainerId === containerId) {
      setActiveContainerId(next.containers[0]?.id || '');
    }
  };

  const handleUpdateBlockParam = (
    containerId: string,
    blockId: string,
    key: string,
    value: string | number | boolean
  ) => {
    const next = cloneProgram(program);
    const c = next.containers.find((item) => item.id === containerId);
    const b = c?.blocks.find((item) => item.id === blockId);
    if (!b) return;
    b.params[key] = value;
    commitProgram(next);
  };

  const handleMoveBlock = (containerId: string, blockId: string, dir: -1 | 1) => {
    const next = cloneProgram(program);
    const c = next.containers.find((item) => item.id === containerId);
    if (!c) return;
    const idx = c.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= c.blocks.length) return;
    const [removed] = c.blocks.splice(idx, 1);
    c.blocks.splice(targetIdx, 0, removed);
    commitProgram(next);
  };

  const handleRemoveBlock = (containerId: string, blockId: string) => {
    const next = cloneProgram(program);
    const c = next.containers.find((item) => item.id === containerId);
    if (!c) return;
    c.blocks = c.blocks.filter((b) => b.id !== blockId);
    commitProgram(next);
  };

  // Run & Sync Python Code -> Blocks & Live Handheld Simulator
  const handleRunPython = () => {
    const res = parseArcadePython(pythonDraft);
    setPythonErrors(res.errors);
    if (res.errors.length === 0) {
      commitProgram(res.program);
      setActiveContainerId(res.program.containers[0]?.id || '');
      playArcadeSfx('power_up', false);
      showToast('Kode Python berhasil dikompilasi & dijalankan di konsol!');
    } else {
      playArcadeSfx('zapped', false);
      showToast(`Ada ${res.errors.length} baris Python yang perlu diperbaiki.`);
    }
  };

  const handleLoadSolution = () => {
    if (!selectedProject) return;
    const sol = cloneProgram(selectedProject.arcadeSolution);
    commitProgram(sol);
    setActiveContainerId(sol.containers[0]?.id || '');
    playArcadeSfx('magic_wand', false);
    showToast('Kode lengkap proyek dimuat! Coba mainkan di konsol kiri.');
  };

  const handleResetProject = () => {
    if (!selectedProject) return;
    const starter = cloneProgram(selectedProject.arcadeStarter);
    commitProgram(starter);
    setActiveContainerId(starter.containers[0]?.id || '');
    showToast('Workspace direset ke template awal.');
  };

  const handleDownloadPython = () => {
    const code = pythonDirty ? pythonDraft : arcadeProgramToPython(program, gameTitle);
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(gameTitle || 'codespark_arcade').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.py`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File Python (.py) berhasil diunduh!');
  };

  // Mission checks evaluation
  const missionResults = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.missionChecks.map((m) => ({
      ...m,
      passed: m.check(program),
    }));
  }, [program, selectedProject]);

  const passedCount = missionResults.filter((m) => m.passed).length;
  const allMissionsPassed =
    selectedProject !== null && passedCount === selectedProject.missionChecks.length;

  const handleSubmitProject = async () => {
    if (!selectedProject) return;
    if (!allMissionsPassed && !isAdminPreview) {
      setShowMissionGuide(true);
      showToast('Lengkapi semua misi blok/Python dulu atau klik "Pasang Kode Lengkap".');
      return;
    }

    setSubmitting(true);
    try {
      const codeSubmitted = pythonDirty ? pythonDraft : arcadeProgramToPython(program, gameTitle);
      const stars: 1 | 2 | 3 =
        allMissionsPassed && (hudSnapshot?.status === 'win' || hudSnapshot?.hasPlayed)
          ? 3
          : allMissionsPassed
            ? 3
            : 2;
      const res = await onProjectComplete({
        projectId: selectedProject.id,
        stars,
        codeSubmitted,
      });
      playArcadeSfx('power_up', false);
      setVictoryModal({
        project: selectedProject,
        newCertificate: res.newCertificate,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter flyout blocks by selected category or search query
  const visibleFlyoutTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return ARCADE_FLYOUT_TEMPLATES.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (!selectedCategory) return [];
    return ARCADE_FLYOUT_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [searchQuery, selectedCategory]);

  // ==================== ACCESS GATE (WHEN LOCKED) ====================
  if (!hasAccess && !isAdminPreview) {
    const waHref = adminPhone
      ? formatWhatsAppUrl(
          adminPhone,
          'Halo Admin CodeSpark, saya ingin membuka akses kelas Game Maker Arcade Lab.'
        )
      : '';

    return (
      <div className="max-w-3xl mx-auto my-6 bg-white border-[3px] border-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#0f172a] text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#276C73] text-white flex items-center justify-center border-2 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Program Game Maker Arcade Terkunci
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          Bangun 5 game arcade piksel dengan <b>Blocks</b>, <b>Python</b>, dan <b>Sprite Editor</b>{' '}
          seperti MakeCode Arcade. Hubungi Admin atau minta pembukaan akses untuk mulai berkarya!
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRequestUpgrade && (
            <button
              type="button"
              onClick={onRequestUpgrade}
              disabled={requestedGameMaker}
              className="px-5 py-3 rounded-xl font-extrabold text-sm border-2 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] bg-[#FFE600] hover:bg-amber-300 text-slate-900 disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {requestedGameMaker ? 'Permintaan Akses Terkirim' : 'Minta Buka Akses Game Maker'}
            </button>
          )}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl font-extrabold text-sm border-2 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat {adminContactName}
            </a>
          )}
          {adminPhone && !waHref && (
            <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              {adminPhone}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ==================== PROJECT HUB SCREEN ====================
  if (!selectedProject) {
    const completedCount = GAME_MAKER_PROJECTS.filter((p) =>
      completedProgressMap.has(p.id)
    ).length;

    return (
      <div className="space-y-5">
        {/* Teal MakeCode-Inspired Hub Header */}
        <div className="rounded-2xl overflow-hidden border-[3px] border-[#0f172a] shadow-[5px_5px_0px_#0f172a] bg-gradient-to-r from-[#1D565C] via-[#276C73] to-[#2e858d] text-white p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-extrabold tracking-wide">
                <Gamepad2 className="w-3.5 h-3.5 text-[#FFE600]" />
                CODESPARK ARCADE STUDIO · BLOCKS + PYTHON + ASSETS
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Game Maker Arcade Lab
              </h2>
              <p className="text-xs sm:text-sm text-teal-50/95 max-w-2xl">
                Rakit 5 game piksel 60 FPS menggunakan blok visual & kode Python ala MakeCode
                Arcade, gambar sprite 16×16 milikmu sendiri, lalu mainkan langsung di konsol handheld!
              </p>
            </div>

            <div className="bg-black/25 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 min-w-[200px]">
              <div className="text-[11px] font-bold uppercase text-teal-100">
                Progres Game Maker
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#FFE600]">
                  {completedCount}/{GAME_MAKER_PROJECTS.length}
                </span>
                <span className="text-xs font-bold text-teal-100">Proyek Tuntas</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/30 mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#4ADE80] transition-all"
                  style={{ width: `${(completedCount / GAME_MAKER_PROJECTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {isAdminPreview && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold">
              <Unlock className="w-3.5 h-3.5" />
              Mode Pratinjau Admin/Instruktur: Semua 5 Proyek Arcade Terbuka Bebas
            </div>
          )}
        </div>

        {/* 5 Progressive Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GAME_MAKER_PROJECTS.map((project) => {
            const Icon = getGameIcon(project.id);
            const unlocked = isProjectUnlocked(project);
            const completedRec = completedProgressMap.get(project.id);

            return (
              <div
                key={project.id}
                className={`rounded-2xl border-[2.5px] border-[#0f172a] p-5 flex flex-col justify-between transition-all ${
                  unlocked
                    ? 'bg-white shadow-[4px_4px_0px_#0f172a] hover:-translate-y-0.5'
                    : 'bg-slate-100 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-[#0f172a] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: unlocked ? project.accentColor : '#cbd5e1' }}
                    >
                      {unlocked ? (
                        <Icon className="w-6 h-6 text-slate-900" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-900 text-white">
                        Proyek #{project.order}
                      </span>
                      {completedRec && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {completedRec.stars}★
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mt-3">{project.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{project.subtitle}</p>
                  <div className="mt-3 text-[11px] font-bold text-[#276C73] bg-[#e6f4f5] px-2.5 py-1 rounded-lg inline-block">
                    {project.concept}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => openProject(project)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#276C73] hover:bg-[#1D565C] text-white font-extrabold text-xs border-2 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {completedRec ? 'Buka & Edit di Studio Arcade' : 'Mulai Buat di Studio Arcade'}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Selesaikan Proyek #{project.order - 1} terlebih dahulu
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== MAKECODE ARCADE IDE STUDIO ====================
  return (
    <div className="rounded-xl overflow-hidden border-2 border-[#164247] shadow-2xl bg-white flex flex-col min-h-[760px]">
      {/* 1. AUTHENTIC MAKECODE TEAL TOP BAR */}
      <header className="bg-[#276C73] text-white px-3 h-12 flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Left: Brand & Project Selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 grid grid-cols-2 gap-0.5 p-0.5 bg-white/15 rounded">
              <span className="bg-[#FFE600] rounded-[1px]" />
              <span className="bg-[#78dc52] rounded-[1px]" />
              <span className="bg-[#87f2ff] rounded-[1px]" />
              <span className="bg-[#ff93c4] rounded-[1px]" />
            </div>
            <span className="font-black text-sm tracking-tight hidden sm:inline">CodeSpark</span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="font-extrabold text-sm text-teal-50 truncate">
              Game Maker Arcade
            </span>
          </div>

          <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-black/20 text-[11px] font-bold text-[#FFE600]">
            #{selectedProject.order} {selectedProject.shortTitle}
          </span>
        </div>

        {/* Center: Blocks | Python | Assets Segmented Switcher */}
        <div className="flex items-center h-full pt-1.5">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'python' && pythonDirty) {
                handleRunPython();
              }
              setActiveTab('blocks');
            }}
            className={`h-full px-3.5 sm:px-5 rounded-t-md text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'blocks'
                ? 'bg-white text-[#276C73] shadow-sm'
                : 'bg-[#1D565C] text-teal-100 hover:bg-[#194b50]'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Blocks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('python')}
            className={`h-full px-3.5 sm:px-5 rounded-t-md text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors border-l border-[#276C73] ${
              activeTab === 'python'
                ? 'bg-white text-[#276C73] shadow-sm'
                : 'bg-[#1D565C] text-teal-100 hover:bg-[#194b50]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Python
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`h-full px-3.5 sm:px-5 rounded-t-md text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors border-l border-[#276C73] ${
              activeTab === 'assets'
                ? 'bg-white text-[#276C73] shadow-sm'
                : 'bg-[#1D565C] text-teal-100 hover:bg-[#194b50]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Assets
          </button>
        </div>

        {/* Right: Utility Action Icons (Home, Mission Guide, Auto-Fill Solution, Reset) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedProjectId(null)}
            className="p-2 rounded hover:bg-white/15 text-white cursor-pointer"
            title="Kembali ke Daftar 5 Proyek Game Maker"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMissionGuide((v) => !v)}
            className={`px-2.5 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showMissionGuide
                ? 'bg-[#FFE600] text-slate-900'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="Checklist Misi Proyek"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              Misi ({passedCount}/{selectedProject.missionChecks.length})
            </span>
          </button>
          <button
            type="button"
            onClick={handleLoadSolution}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold cursor-pointer"
            title="Pasang blok & kode Python lengkap proyek ini"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Pasang Solusi</span>
          </button>
          <button
            type="button"
            onClick={handleResetProject}
            className="p-2 rounded hover:bg-white/15 text-white cursor-pointer"
            title="Reset ke Template Awal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Optional Collapsible Mission Guide Strip */}
      {showMissionGuide && (
        <div className="bg-[#eef8f9] border-b border-[#bfe0e3] px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#1D565C] uppercase">
                Misi Proyek #{selectedProject.order}: {selectedProject.title}
              </span>
              {allMissionsPassed && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  SEMUA MISI TERPENUHI!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">{selectedProject.overview}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {missionResults.map((m) => (
                <div
                  key={m.id}
                  title={m.hint}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${
                    m.passed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {m.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSolution}
              className="px-3 py-1.5 rounded-lg bg-[#276C73] hover:bg-[#1D565C] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Bantu Pasang Kode Lengkap
            </button>
            <button
              type="button"
              onClick={() => setShowMissionGuide(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN 3-PANE MAKECODE ARCADE WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[580px] relative overflow-hidden">
        {/* LEFT PANE: Teal Handheld Arcade Console Simulator */}
        <aside className="w-full lg:w-[272px] xl:w-[292px] shrink-0 bg-[#f5f7f8] border-b lg:border-b-0 lg:border-r border-slate-300 p-3 flex flex-col justify-between gap-3">
          <ArcadeHandheldConsole
            program={program}
            customSprites={customSprites}
            controlsHint={selectedProject.controlsHint}
            onHudUpdate={setHudSnapshot}
          />

          {/* Compact Live Mission Progress Card under Handheld */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Checklist Misi
              </span>
              <span className="text-[11px] font-black text-[#276C73]">
                {passedCount}/{selectedProject.missionChecks.length}
              </span>
            </div>
            <div className="space-y-1">
              {missionResults.map((m) => (
                <div
                  key={m.id}
                  title={m.hint}
                  className={`text-[10.5px] font-semibold flex items-start gap-1.5 leading-snug ${
                    m.passed ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      m.passed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {m.passed ? <Check className="w-2.5 h-2.5" /> : '·'}
                  </span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MIDDLE PANE: MakeCode Category Toolbox + Dark Gray Flyout Drawer (Visible in Blocks Mode) */}
        {activeTab === 'blocks' && (
          <div className="flex shrink-0 relative border-b lg:border-b-0 border-slate-300">
            {/* White Category Rail with Colored Left Stripes */}
            {!toolboxCollapsed && (
              <div className="w-40 bg-white border-r border-slate-200 flex flex-col shrink-0">
                {/* Search input */}
                <div className="p-2 border-b border-slate-200 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-2.5 pr-7 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#276C73]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 9 MakeCode Categories */}
                <div className="flex-1 overflow-y-auto py-1">
                  {ARCADE_CATEGORIES.map((cat) => {
                    const Icon = getCategoryIcon(cat.id);
                    const isSelected = !searchQuery.trim() && selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory((curr) => (curr === cat.id ? null : cat.id));
                        }}
                        className="w-full px-3 py-2.5 text-left text-[13px] font-bold flex items-center gap-2.5 transition-colors cursor-pointer relative"
                        style={{
                          borderLeft: `6px solid ${cat.color}`,
                          backgroundColor: isSelected ? cat.color : 'transparent',
                          color: isSelected ? '#ffffff' : cat.color,
                        }}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Collapse Toggle Pill (like MakeCode Arcade's gray side handle) */}
            <button
              type="button"
              onClick={() => setToolboxCollapsed((c) => !c)}
              className="w-4 bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center border-r border-slate-300 cursor-pointer shrink-0"
              title={toolboxCollapsed ? 'Tampilkan Toolbox' : 'Sembunyikan Toolbox'}
            >
              {toolboxCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Dark Gray MakeCode Flyout Drawer (#63696E) */}
            {!toolboxCollapsed && (selectedCategory || searchQuery.trim()) && (
              <div className="w-64 xl:w-72 bg-[#63696E] text-white flex flex-col border-r border-slate-700 shadow-inner max-h-[580px] lg:max-h-none overflow-y-auto shrink-0">
                <div className="px-3.5 py-2.5 border-b border-white/15 flex items-center justify-between sticky top-0 bg-[#63696E] z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{
                        backgroundColor: selectedCategory
                          ? getCategoryColor(selectedCategory)
                          : '#FFE600',
                      }}
                    />
                    <span className="font-extrabold text-sm capitalize">
                      {searchQuery.trim()
                        ? `Hasil: "${searchQuery}"`
                        : ARCADE_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="p-1 rounded hover:bg-white/15 text-white/80 cursor-pointer"
                    title="Tutup laci blok"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 space-y-2.5">
                  <p className="text-[10.5px] text-slate-200/90 leading-snug">
                    Klik atau seret blok ke kanvas kanan (blok pernyataan masuk ke event bertanda{' '}
                    <b>Target</b>).
                  </p>

                  {visibleFlyoutTemplates.length === 0 ? (
                    <div className="text-xs text-slate-300 py-4 text-center">
                      Tidak ada blok yang cocok.
                    </div>
                  ) : (
                    visibleFlyoutTemplates.map((tpl) => {
                      const bg =
                        tpl.kind === 'event' && tpl.eventTemplate
                          ? getEventColor(tpl.eventTemplate.eventType)
                          : getCategoryColor(tpl.category);

                      return (
                        <div
                          key={tpl.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/arcade-template', tpl.id);
                          }}
                          onClick={() => handleInsertTemplate(tpl)}
                          className="group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                          title={tpl.description}
                        >
                          {tpl.kind === 'event' ? (
                            <div className="rounded-lg overflow-hidden shadow-md">
                              <div
                                className="px-3 py-2 text-[11.5px] font-extrabold text-white flex items-center justify-between gap-1"
                                style={{ backgroundColor: bg }}
                              >
                                <span>{tpl.label}</span>
                                <Plus className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              </div>
                              <div
                                className="h-3 border-l-[10px] bg-black/20"
                                style={{ borderLeftColor: bg }}
                              />
                              <div className="h-2.5" style={{ backgroundColor: bg }} />
                            </div>
                          ) : (
                            <div
                              className="px-3 py-2 rounded-lg text-[11.5px] font-extrabold text-white shadow-md border-b-2 border-black/25 flex items-center justify-between gap-2"
                              style={{ backgroundColor: bg }}
                            >
                              <span className="leading-snug">{tpl.label}</span>
                              <Plus className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            </div>
                          )}
                          <div className="text-[10px] text-slate-200/80 mt-1 px-0.5">
                            {tpl.description}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANE: Blocks Dotted Canvas / Python Code Editor / Pixel Art Assets Editor */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
          {activeTab === 'blocks' && (
            <ArcadeBlocksCanvas
              program={program}
              customSprites={customSprites}
              activeContainerId={activeContainerId}
              zoom={zoom}
              onSelectContainer={setActiveContainerId}
              onUpdateContainerParam={handleUpdateContainerParam}
              onRemoveContainer={handleRemoveContainer}
              onUpdateBlockParam={handleUpdateBlockParam}
              onMoveBlock={handleMoveBlock}
              onRemoveBlock={handleRemoveBlock}
              onDropTemplateIntoContainer={handleDropTemplateIntoContainer}
            />
          )}

          {activeTab === 'python' && (
            <div className="flex-1 flex flex-col bg-[#1e1e2e] text-slate-100 overflow-hidden">
              {/* Python Editor Toolbar */}
              <div className="px-4 py-2.5 bg-[#151522] border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#FFE600]" />
                  <span className="text-xs font-extrabold text-white">main.py — MakeCode Arcade Python</span>
                  {pythonDirty && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Belum dijalankan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunPython}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Jalankan Python & Sinkronkan
                  </button>
                </div>
              </div>

              {/* Quick Insert Python Snippets */}
              <div className="px-4 py-2 bg-[#181826] border-b border-slate-800 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                  Sisipkan Cepat:
                </span>
                {PYTHON_SNIPPETS.map((sn) => (
                  <button
                    key={sn.label}
                    type="button"
                    onClick={() => {
                      setPythonDraft((prev) => prev.trimEnd() + '\n' + sn.code);
                      setPythonDirty(true);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[#87f2ff] text-[11px] font-bold cursor-pointer border border-slate-700"
                  >
                    {sn.label}
                  </button>
                ))}
              </div>

              {/* Error Diagnostics Banner */}
              {pythonErrors.length > 0 && (
                <div className="px-4 py-2 bg-rose-950/90 border-b border-rose-700 text-rose-200 text-xs space-y-1">
                  {pythonErrors.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        Baris {err.line}: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Textarea with Line Numbers */}
              <div className="flex-1 flex overflow-auto font-mono text-[13px] leading-6">
                <div className="py-3 px-3 bg-[#151522] text-slate-500 text-right select-none border-r border-slate-800 shrink-0">
                  {pythonDraft.split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                <textarea
                  value={pythonDraft}
                  onChange={(e) => {
                    setPythonDraft(e.target.value);
                    setPythonDirty(true);
                  }}
                  spellCheck={false}
                  className="flex-1 w-full h-full min-h-[420px] p-3 bg-transparent text-[#e2e8f0] focus:outline-none resize-none font-mono text-[13px] leading-6"
                />
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <ArcadePixelEditor
              customSprites={customSprites}
              selectedSpriteId={selectedAssetSpriteId}
              onSelectSprite={setSelectedAssetSpriteId}
              onUpdateSprite={(id, grid) => {
                setCustomSprites((prev) => ({ ...prev, [id]: grid }));
              }}
              onResetSprite={(id) => {
                setCustomSprites((prev) => {
                  const copy = { ...prev };
                  delete copy[id];
                  return copy;
                });
                showToast('Sprite dikembalikan ke desain default.');
              }}
            />
          )}
        </main>
      </div>

      {/* 3. AUTHENTIC MAKECODE PURPLE BOTTOM ACTION BAR */}
      <footer className="bg-[#f1f5f9] border-t border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Purple Download & Submit Buttons + Editable Project Title */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={handleSubmitProject}
              disabled={submitting}
              className="px-4 h-10 bg-[#5B4DB7] hover:bg-[#4c3fa3] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-colors"
            >
              <Award className="w-4 h-4 text-[#FFE600]" />
              {submitting ? 'Menyimpan...' : 'Selesai & Simpan Proyek'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPython}
              className="px-3 h-10 bg-[#483b99] hover:bg-[#3c3182] text-white border-l border-white/20 flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Download Kode Python (.py)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">.py</span>
            </button>
          </div>

          {/* Editable Game Title Box (like MakeCode's "tes" box + save icon) */}
          <div className="flex items-center rounded-md overflow-hidden border border-slate-300 bg-white shadow-sm">
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="Nama game..."
              className="px-3 h-9 text-xs font-bold text-slate-800 w-36 sm:w-48 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'python' && pythonDirty) handleRunPython();
                else showToast(`Judul proyek "${gameTitle}" disimpan.`);
              }}
              className="w-9 h-9 bg-[#5B4DB7] hover:bg-[#4c3fa3] text-white flex items-center justify-center cursor-pointer"
              title="Simpan Perubahan"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Undo/Redo & Zoom -/+ Buttons (MakeCode Arcade style) */}
        <div className="flex items-center gap-2">
          {toastMessage && (
            <span className="hidden md:inline-block px-3 py-1 rounded-full bg-slate-900 text-[#FFE600] text-[11px] font-bold">
              {toastMessage}
            </span>
          )}

          <div className="flex items-center rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="w-9 h-9 bg-[#7467c7] hover:bg-[#5B4DB7] disabled:opacity-45 text-white flex items-center justify-center cursor-pointer"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={future.length === 0}
              className="w-9 h-9 bg-[#7467c7] hover:bg-[#5B4DB7] disabled:opacity-45 text-white border-l border-white/20 flex items-center justify-center cursor-pointer"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
              className="w-9 h-9 bg-[#5B4DB7] hover:bg-[#4c3fa3] text-white flex items-center justify-center cursor-pointer"
              title="Perkecil Kanvas"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
              className="w-9 h-9 bg-[#5B4DB7] hover:bg-[#4c3fa3] text-white border-l border-white/20 flex items-center justify-center cursor-pointer"
              title="Perbesar Kanvas"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Victory & Certificate Modal */}
      {victoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[3px] border-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-[8px_8px_0px_#0f172a] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFE600] border-2 border-[#0f172a] flex items-center justify-center shadow-[3px_3px_0px_#0f172a]">
              <Trophy className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-amber-500 mb-1">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Proyek {victoryModal.project.title} Selesai!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Progres kode Arcade kamu sudah tersimpan secara realtime!
              </p>
            </div>

            {victoryModal.newCertificate && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 text-left flex items-center gap-3">
                <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-emerald-900">
                    Sertifikat Baru Terbit!
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {victoryModal.newCertificate.tierName} · #{victoryModal.newCertificate.certificateNo}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {victoryModal.newCertificate && onOpenCertificates && (
                <button
                  type="button"
                  onClick={() => {
                    setVictoryModal(null);
                    onOpenCertificates();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs border-2 border-[#0f172a] cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  Lihat Sertifikat
                </button>
              )}
              {(() => {
                const nextProj = GAME_MAKER_PROJECTS.find(
                  (p) => p.order === victoryModal.project.order + 1
                );
                if (!nextProj) return null;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setVictoryModal(null);
                      openProject(nextProj);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#276C73] hover:bg-[#1D565C] text-white font-extrabold text-xs border-2 border-[#0f172a] cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4" />
                    Lanjut Proyek #{nextProj.order}
                  </button>
                );
              })()}
              <button
                type="button"
                onClick={() => setVictoryModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-2 border-[#0f172a] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
