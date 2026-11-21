import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Dices,
  Download,
  GitBranch,
  Grid3X3,
  Heart,
  HelpCircle,
  Home,
  KeyRound,
  Lightbulb,
  ListChecks,
  Lock,
  MessageCircle,
  Minus,
  Music,
  Phone,
  Play,
  Plus,
  Puzzle,
  Radio,
  Redo2,
  Repeat,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Star,
  Thermometer,
  Undo2,
  Unlock,
  Variable,
  Wand2,
  Zap,
  X,
} from 'lucide-react';
import type {
  AppMakerProjectId,
  CertificateRecord,
  ProgressRecord,
} from '../types';
import {
  APP_MAKER_PROJECTS,
  getAppMakerProjectById,
  type AppMakerProjectDef,
} from '../data/appMakerProjects';
import {
  MICROBIT_CATEGORIES,
  MICROBIT_FLYOUT_TEMPLATES,
  makeMbId,
  microbitProgramToJavaScript,
  microbitProgramToPython,
  parseMicrobitCode,
  playMicrobitMelody,
  playMicrobitTone,
  type MicrobitCategoryId,
  type MicrobitEventContainer,
  type MicrobitFlyoutTemplate,
  type MicrobitProgram,
  type MicrobitStmtBlock,
} from '../engine/microbitEngine';
import { MicrobitBoardSimulator } from './MicrobitBoardSimulator';
import { MicrobitBlocksCanvas } from './MicrobitBlocksCanvas';
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

function cloneProgram(prog: MicrobitProgram): MicrobitProgram {
  return {
    containers: prog.containers.map((c) => ({
      ...c,
      params: { ...c.params },
      blocks: c.blocks.map((b) => ({ ...b, params: { ...b.params } })),
    })),
  };
}

function getCategoryIcon(cat: MicrobitCategoryId) {
  switch (cat) {
    case 'basic':
      return Grid3X3;
    case 'input':
      return Zap;
    case 'music':
      return Music;
    case 'led':
      return Lightbulb;
    case 'radio':
      return Radio;
    case 'loops':
      return Repeat;
    case 'logic':
      return GitBranch;
    case 'variables':
      return Variable;
    case 'math':
      return Calculator;
  }
}

function getProjectIcon(id: AppMakerProjectId) {
  switch (id) {
    case 'app_photogram':
      return Heart;
    case 'app_todo':
      return Dices;
    case 'app_calculator':
      return Music;
    case 'app_color':
      return Thermometer;
    case 'app_weather':
      return Radio;
  }
}

const QUICK_SNIPPETS_JS = [
  { label: 'showIcon(Heart)', code: 'basic.showIcon(IconNames.Heart)' },
  { label: 'showString', code: 'basic.showString("HALO!")' },
  { label: 'pause(400)', code: 'basic.pause(400)' },
  { label: 'playMelody', code: 'music.startMelody("ba_ding")' },
  { label: 'onButton(A)', code: 'input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})' },
  { label: 'onShake', code: 'input.onGesture(Gesture.Shake, function () {\n    dice = randint(1, 6)\n    basic.showNumber(dice)\n})' },
];

const QUICK_SNIPPETS_PY = [
  { label: 'show_icon(HEART)', code: 'basic.show_icon(IconNames.HEART)' },
  { label: 'show_string', code: 'basic.show_string("HALO!")' },
  { label: 'pause(400)', code: 'basic.pause(400)' },
  { label: 'start_melody', code: 'music.start_melody("ba_ding")' },
  { label: 'on_button_a', code: 'def on_btn_a():\n    basic.show_icon(IconNames.HAPPY)\ninput.on_button_pressed(Button.A, on_btn_a)' },
];

export const AppMakerWorkspace: React.FC<Props> = ({
  hasAccess,
  requestedAppMaker,
  isAdminPreview,
  initialProjectId,
  completedProgressMap,
  adminPhone,
  adminContactName,
  onRequestUpgrade,
  onProjectComplete,
  onOpenCertificates,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<AppMakerProjectId | null>(
    initialProjectId ?? null
  );

  // IDE state
  const [editorTab, setEditorTab] = useState<'blocks' | 'code'>('blocks');
  const [codeLang, setCodeLang] = useState<'javascript' | 'python'>('javascript');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [program, setProgram] = useState<MicrobitProgram>(() =>
    cloneProgram(APP_MAKER_PROJECTS[0].microbitStarter)
  );
  const [history, setHistory] = useState<MicrobitProgram[]>([]);
  const [future, setFuture] = useState<MicrobitProgram[]>([]);

  const [activeContainerId, setActiveContainerId] = useState<string>('mb_start');
  const [activeCategory, setActiveCategory] = useState<MicrobitCategoryId | null>('basic');
  const [toolboxSearch, setToolboxSearch] = useState('');
  const [toolboxCollapsed, setToolboxCollapsed] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [projectName, setProjectName] = useState('flashing-heart');
  const [codeText, setCodeText] = useState('');
  const [codeErrors, setCodeErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [codeSyncBanner, setCodeSyncBanner] = useState<string | null>(null);
  const [activeExecBlockId, setActiveExecBlockId] = useState<string | null>(null);

  const [showMissionDrawer, setShowMissionDrawer] = useState(true);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [victoryModal, setVictoryModal] = useState<{
    project: AppMakerProjectDef;
    stars: 1 | 2 | 3;
    newCertificate: CertificateRecord | null;
    nextProjectId: AppMakerProjectId | null;
  } | null>(null);

  const selectedProject = useMemo(
    () => (selectedProjectId ? getAppMakerProjectById(selectedProjectId) || null : null),
    [selectedProjectId]
  );

  const completedIds = useMemo(() => {
    const s = new Set<string>();
    APP_MAKER_PROJECTS.forEach((p) => {
      if (completedProgressMap.has(p.id)) s.add(p.id);
    });
    return s;
  }, [completedProgressMap]);

  const isProjectUnlocked = useCallback(
    (proj: AppMakerProjectDef): boolean => {
      if (isAdminPreview) return true;
      if (proj.order === 1) return true;
      const prev = APP_MAKER_PROJECTS.find((p) => p.order === proj.order - 1);
      return prev ? completedIds.has(prev.id) : true;
    },
    [completedIds, isAdminPreview]
  );

  // Sync initialProjectId if provided from outside
  useEffect(() => {
    if (initialProjectId) {
      const p = getAppMakerProjectById(initialProjectId);
      if (p && isProjectUnlocked(p)) {
        setSelectedProjectId(initialProjectId);
      }
    }
  }, [initialProjectId, isProjectUnlocked]);

  // Load project starter whenever selectedProject changes
  useEffect(() => {
    if (!selectedProject) return;
    const starter = cloneProgram(selectedProject.microbitStarter);
    setProgram(starter);
    setHistory([]);
    setFuture([]);
    setProjectName(selectedProject.defaultAppName);
    setActiveContainerId(starter.containers[0]?.id || 'mb_start');
    setEditorTab('blocks');
    setCodeErrors([]);
    setCodeSyncBanner(null);
    setActiveCategory('basic');
    setCodeText(
      codeLang === 'javascript'
        ? microbitProgramToJavaScript(starter, selectedProject.defaultAppName)
        : microbitProgramToPython(starter, selectedProject.defaultAppName)
    );
  }, [selectedProject]);

  // Keep code editor synced when toggling to code tab or switching JS/Python
  useEffect(() => {
    if (!selectedProject) return;
    const generated =
      codeLang === 'javascript'
        ? microbitProgramToJavaScript(program, projectName)
        : microbitProgramToPython(program, projectName);
    setCodeText(generated);
    setCodeErrors([]);
  }, [program, codeLang, projectName, selectedProject]);

  // Mission checks evaluation
  const missionResults = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.missionChecks.map((mc) => ({
      ...mc,
      passed: mc.check(program),
    }));
  }, [selectedProject, program]);

  const passedCount = missionResults.filter((m) => m.passed).length;
  const allMissionsPassed =
    missionResults.length > 0 && passedCount === missionResults.length;

  // History-aware program updater
  const updateProgram = useCallback((updater: (prev: MicrobitProgram) => MicrobitProgram) => {
    setProgram((prev) => {
      const next = updater(cloneProgram(prev));
      setHistory((h) => [...h.slice(-24), cloneProgram(prev)]);
      setFuture([]);
      return next;
    });
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [cloneProgram(program), ...f.slice(0, 24)]);
    setProgram(prev);
    playMicrobitTone(440, 60, false);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h.slice(-24), cloneProgram(program)]);
    setProgram(next);
    playMicrobitTone(523, 60, false);
  };

  const addTemplateToWorkspace = useCallback(
    (tpl: MicrobitFlyoutTemplate, targetContainerId?: string) => {
      playMicrobitTone(587, 55, false);
      if (tpl.kind === 'event' && tpl.eventTemplate) {
        const newId = makeMbId('ev');
        const newContainer: MicrobitEventContainer = {
          id: newId,
          eventType: tpl.eventTemplate.eventType,
          params: { ...tpl.eventTemplate.params },
          blocks: [],
        };
        updateProgram((prev) => ({
          containers: [...prev.containers, newContainer],
        }));
        setActiveContainerId(newId);
        return;
      }

      if (tpl.kind === 'statement' && tpl.stmtTemplate) {
        const newBlk: MicrobitStmtBlock = {
          id: makeMbId('blk'),
          type: tpl.stmtTemplate.type,
          params: { ...tpl.stmtTemplate.params },
        };
        const destId = targetContainerId || activeContainerId;
        updateProgram((prev) => {
          const exists = prev.containers.some((c) => c.id === destId);
          const actualDest = exists ? destId : prev.containers[0]?.id;
          return {
            containers: prev.containers.map((c) =>
              c.id === actualDest ? { ...c, blocks: [...c.blocks, newBlk] } : c
            ),
          };
        });
      }
    },
    [activeContainerId, updateProgram]
  );

  const handleDropTemplate = useCallback(
    (containerId: string, templateId: string) => {
      const tpl = MICROBIT_FLYOUT_TEMPLATES.find((t) => t.id === templateId);
      if (!tpl) return;
      addTemplateToWorkspace(tpl, containerId);
    },
    [addTemplateToWorkspace]
  );

  const handleUpdateContainerParam = useCallback(
    (id: string, key: string, val: string | number | boolean) => {
      updateProgram((prev) => ({
        containers: prev.containers.map((c) =>
          c.id === id ? { ...c, params: { ...c.params, [key]: val } } : c
        ),
      }));
    },
    [updateProgram]
  );

  const handleRemoveContainer = useCallback(
    (id: string) => {
      updateProgram((prev) => ({
        containers: prev.containers.filter((c) => c.id !== id),
      }));
      if (activeContainerId === id) {
        setActiveContainerId('mb_start');
      }
    },
    [activeContainerId, updateProgram]
  );

  const handleUpdateBlockParam = useCallback(
    (containerId: string, blockId: string, key: string, val: string | number | boolean) => {
      updateProgram((prev) => ({
        containers: prev.containers.map((c) =>
          c.id === containerId
            ? {
                ...c,
                blocks: c.blocks.map((b) =>
                  b.id === blockId ? { ...b, params: { ...b.params, [key]: val } } : b
                ),
              }
            : c
        ),
      }));
    },
    [updateProgram]
  );

  const handleMoveBlock = useCallback(
    (containerId: string, blockId: string, dir: -1 | 1) => {
      updateProgram((prev) => ({
        containers: prev.containers.map((c) => {
          if (c.id !== containerId) return c;
          const idx = c.blocks.findIndex((b) => b.id === blockId);
          const swapIdx = idx + dir;
          if (idx < 0 || swapIdx < 0 || swapIdx >= c.blocks.length) return c;
          const arr = [...c.blocks];
          [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
          return { ...c, blocks: arr };
        }),
      }));
    },
    [updateProgram]
  );

  const handleRemoveBlock = useCallback(
    (containerId: string, blockId: string) => {
      updateProgram((prev) => ({
        containers: prev.containers.map((c) =>
          c.id === containerId
            ? { ...c, blocks: c.blocks.filter((b) => b.id !== blockId) }
            : c
        ),
      }));
    },
    [updateProgram]
  );

  const handleApplyCode = () => {
    const { program: parsed, errors } = parseMicrobitCode(codeText, codeLang);
    setCodeErrors(errors);
    if (errors.length === 0) {
      updateProgram(() => parsed);
      setActiveContainerId(parsed.containers[0]?.id || 'mb_start');
      playMicrobitMelody('ba_ding', false);
      setCodeSyncBanner(
        `Kode ${codeLang === 'javascript' ? 'JavaScript' : 'Python'} berhasil disinkronkan ke papan micro:bit!`
      );
      window.setTimeout(() => setCodeSyncBanner(null), 3200);
    } else {
      playMicrobitTone(220, 180, false);
    }
  };

  const handleFillSolution = () => {
    if (!selectedProject) return;
    const sol = cloneProgram(selectedProject.microbitSolution);
    updateProgram(() => sol);
    setActiveContainerId(sol.containers[sol.containers.length - 1]?.id || 'mb_start');
    playMicrobitMelody('power_up', false);
    setSaveToast('Contoh solusi micro:bit terpasang! Coba uji tombol & sensor di papan kiri.');
    window.setTimeout(() => setSaveToast(null), 3200);
  };

  const handleResetProject = () => {
    if (!selectedProject) return;
    const starter = cloneProgram(selectedProject.microbitStarter);
    updateProgram(() => starter);
    setActiveContainerId(starter.containers[0]?.id || 'mb_start');
    playMicrobitTone(330, 80, false);
    setSaveToast('Proyek dikembalikan ke blok awal.');
    window.setTimeout(() => setSaveToast(null), 2400);
  };

  const handleDownloadCode = () => {
    const ext = codeLang === 'javascript' ? 'js' : 'py';
    const content =
      codeLang === 'javascript'
        ? microbitProgramToJavaScript(program, projectName)
        : microbitProgramToPython(program, projectName);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectName || 'microbit-project').replace(/[^a-zA-Z0-9_-]/g, '-')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    playMicrobitTone(659, 90, false);
    setSaveToast(`Berhasil mengunduh file .${ext} micro:bit!`);
    window.setTimeout(() => setSaveToast(null), 2600);
  };

  const handleCompleteProject = async () => {
    if (!selectedProject || submitting) return;
    setSubmitting(true);
    try {
      const stars: 1 | 2 | 3 =
        passedCount >= selectedProject.missionChecks.length
          ? 3
          : passedCount >= 2
            ? 2
            : 1;
      const codeSubmitted =
        codeLang === 'javascript'
          ? microbitProgramToJavaScript(program, projectName)
          : microbitProgramToPython(program, projectName);

      const { newCertificate } = await onProjectComplete({
        projectId: selectedProject.id,
        stars,
        codeSubmitted,
      });

      playMicrobitMelody('power_up', false);
      const nextProj = APP_MAKER_PROJECTS.find((p) => p.order === selectedProject.order + 1);
      setVictoryModal({
        project: selectedProject,
        stars,
        newCertificate,
        nextProjectId: nextProj ? nextProj.id : null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered flyout templates
  const flyoutTemplates = useMemo(() => {
    const q = toolboxSearch.trim().toLowerCase();
    if (q) {
      return MICROBIT_FLYOUT_TEMPLATES.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (!activeCategory) return [];
    return MICROBIT_FLYOUT_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory, toolboxSearch]);

  // ==================== 1. LOCKED ACCESS GATE ====================
  if (!hasAccess && !isAdminPreview) {
    const waUrl = adminPhone
      ? formatWhatsAppUrl(
          adminPhone,
          'Halo Admin CodeSpark, saya ingin mengaktifkan akses kelas micro:bit Lab di akun siswa saya.'
        )
      : '';

    return (
      <div className="max-w-3xl mx-auto my-6 bg-white rounded-2xl border-2 border-[#2B56D6]/25 shadow-xl overflow-hidden">
        <div className="bg-[#2B56D6] text-white px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#FFE600]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-100">
                Program Khusus Hardware & IoT
              </span>
              <h2 className="text-xl font-black">MakeCode micro:bit Lab</h2>
            </div>
          </div>
          <Lock className="w-7 h-7 text-blue-200 shrink-0" />
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-700 leading-relaxed">
            Pelajari pemrograman mikrokontroler <strong>BBC micro:bit v2</strong> lengkap dengan
            simulator matriks LED 5×5, tombol A/B, sensor sentuh logo, akselerometer (shake),
            speaker piezo, sensor suhu & cahaya, serta komunikasi nirkabel Radio melalui{' '}
            <strong>5 proyek hardware bertahap</strong> dengan Blocks, JavaScript, dan Python!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APP_MAKER_PROJECTS.map((p) => {
              const Icon = getProjectIcon(p.id);
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-lg text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: p.accentColor }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900">
                      Proyek {p.order}: {p.shortTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{p.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onRequestUpgrade && (
              <button
                type="button"
                onClick={onRequestUpgrade}
                disabled={requestedAppMaker}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 cursor-pointer transition-all ${
                  requestedAppMaker
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-[#2B56D6] hover:bg-[#2145b3] text-white shadow-md'
                }`}
              >
                {requestedAppMaker ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Permintaan Akses micro:bit Terkirim
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Minta Buka Akses micro:bit ke Admin
                  </>
                )}
              </button>
            )}

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi {adminContactName || 'Admin'}
              </a>
            )}
            {adminPhone && !waUrl && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Phone className="w-3.5 h-3.5" />
                {adminPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. 5-PROJECT PROGRESSIVE HUB ====================
  if (!selectedProject) {
    const completedCount = completedIds.size;
    return (
      <div className="max-w-6xl mx-auto space-y-5">
        {/* MakeCode micro:bit Royal-Blue Hero Header */}
        <div className="rounded-2xl bg-[#2B56D6] text-white p-6 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border-2 border-[#F4C744] text-[10px] font-black text-[#F4C744]">
                  ••
                </span>
                MakeCode micro:bit v2 Studio
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Lab Hardware & IoT micro:bit
              </h2>
              <p className="text-blue-100 text-sm max-w-2xl">
                Rakit program Blocks, JavaScript, atau Python untuk papan BBC micro:bit v2.
                Selesaikan 5 proyek secara bertahap untuk membuka sertifikat micro:bit!
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/12 border border-white/20 rounded-xl px-4 py-3 shrink-0">
              <div className="text-right">
                <div className="text-[11px] font-bold text-blue-100 uppercase">Progres Lab</div>
                <div className="text-2xl font-black tabular-nums">
                  {completedCount} / {APP_MAKER_PROJECTS.length}
                </div>
              </div>
              {onOpenCertificates && completedCount === APP_MAKER_PROJECTS.length && (
                <button
                  type="button"
                  onClick={onOpenCertificates}
                  className="px-3 py-2 rounded-lg bg-[#F4C744] text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-105"
                >
                  <Award className="w-4 h-4" />
                  Sertifikat
                </button>
              )}
            </div>
          </div>

          {isAdminPreview && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold">
              <Unlock className="w-3.5 h-3.5" />
              Mode Pratinjau Admin/Instruktur — Seluruh 5 proyek micro:bit terbuka bebas.
            </div>
          )}
        </div>

        {/* Progressive Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_MAKER_PROJECTS.map((proj) => {
            const unlocked = isProjectUnlocked(proj);
            const progRec = completedProgressMap.get(proj.id);
            const done = Boolean(progRec);
            const stars = progRec?.stars || 0;
            const Icon = getProjectIcon(proj.id);

            return (
              <div
                key={proj.id}
                className={`rounded-2xl bg-white border-2 transition-all flex flex-col justify-between overflow-hidden ${
                  unlocked
                    ? 'border-slate-200 hover:border-[#2B56D6] hover:shadow-lg'
                    : 'border-slate-200/80 opacity-75 bg-slate-50'
                }`}
              >
                <div>
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: unlocked ? proj.accentColor : '#cbd5e1' }}
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: unlocked ? proj.accentColor : '#94a3b8' }}
                      >
                        {unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>

                      <div className="flex items-center gap-1">
                        {done ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai
                          </span>
                        ) : unlocked ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#2B56D6] text-[11px] font-black">
                            Proyek {proj.order}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold">
                            Terkunci
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.subtitle}</p>
                    </div>

                    <div className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                      Konsep: <span className="text-slate-700">{proj.concept}</span>
                    </div>

                    {done && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      playMicrobitTone(523, 70, false);
                      setSelectedProjectId(proj.id);
                    }}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                      unlocked
                        ? 'bg-[#2B56D6] hover:bg-[#2145b3] text-white shadow-sm cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {unlocked ? (
                      <>
                        {done ? 'Buka & Modifikasi Studio' : 'Mulai Proyek micro:bit'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Selesaikan Proyek {proj.order - 1} Dulu
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 3. FULL MAKECODE FOR MICRO:BIT STUDIO ====================
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-300 shadow-xl bg-white flex flex-col min-h-[700px] lg:h-[calc(100vh-118px)]">
      {/* ===== ROYAL-BLUE TOP HEADER BAR (Matches MakeCode for micro:bit screenshot!) ===== */}
      <header className="bg-[#2B56D6] text-white h-13 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 select-none relative z-30">
        {/* Left Brand: CodeSpark | micro:bit */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 font-black text-sm sm:text-[15px] tracking-tight">
            <span className="hidden sm:inline font-black">CodeSpark</span>
            <span className="hidden sm:inline text-white/45 font-light">|</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full border-2 border-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              <span className="font-black tracking-tight">micro:bit</span>
            </span>
          </div>
          <span className="hidden xl:inline-block text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full truncate max-w-[230px]">
            Proyek {selectedProject.order}: {selectedProject.shortTitle}
          </span>
        </div>

        {/* Center Rounded Pill Switcher: Blocks | JavaScript / Python */}
        <div className="relative flex items-center bg-[#1c3ca3] p-1 rounded-full border border-white/20 shadow-inner">
          <button
            type="button"
            onClick={() => setEditorTab('blocks')}
            className={`px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
              editorTab === 'blocks'
                ? 'bg-white text-[#2B56D6] shadow-sm'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Blocks
          </button>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setEditorTab('code')}
              className={`pl-3.5 pr-2 py-1.5 rounded-l-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                editorTab === 'code'
                  ? 'bg-white text-[#2B56D6] shadow-sm'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              {codeLang === 'javascript' ? 'JavaScript' : 'Python'}
            </button>
            <button
              type="button"
              onClick={() => setLangMenuOpen((v) => !v)}
              className={`px-2 py-1.5 rounded-r-full text-xs cursor-pointer transition-colors ${
                editorTab === 'code'
                  ? 'bg-white text-[#2B56D6] border-l border-slate-200'
                  : 'text-white/85 hover:bg-white/10'
              }`}
              title="Pilih Bahasa Teks (JavaScript / Python)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1 z-50">
              <button
                type="button"
                onClick={() => {
                  setCodeLang('javascript');
                  setEditorTab('code');
                  setLangMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-extrabold flex items-center justify-between hover:bg-blue-50 cursor-pointer ${
                  codeLang === 'javascript' ? 'text-[#2B56D6]' : 'text-slate-700'
                }`}
              >
                <span>JavaScript (.js)</span>
                {codeLang === 'javascript' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeLang('python');
                  setEditorTab('code');
                  setLangMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-extrabold flex items-center justify-between hover:bg-blue-50 cursor-pointer ${
                  codeLang === 'python' ? 'text-[#2B56D6]' : 'text-slate-700'
                }`}
              >
                <span>Python (.py)</span>
                {codeLang === 'python' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Right Utility Icons (Home, Mission Checklist, Auto-fill Solution, Reset) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedProjectId(null)}
            className="p-2 rounded-lg hover:bg-white/15 text-white cursor-pointer transition-colors"
            title="Kembali ke Daftar 5 Proyek micro:bit"
          >
            <Home className="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowMissionDrawer((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showMissionDrawer ? 'bg-white/20 text-white' : 'hover:bg-white/15 text-white/90'
            }`}
            title="Tampilkan / Sembunyikan Panduan Misi"
          >
            <ListChecks className="w-4 h-4" />
            <span className="hidden md:inline">
              Misi {passedCount}/{missionResults.length}
            </span>
          </button>
          <button
            type="button"
            onClick={handleFillSolution}
            className="p-2 rounded-lg hover:bg-white/15 text-[#FFE600] cursor-pointer transition-colors"
            title="Pasang Contoh Solusi Proyek Ini"
          >
            <Wand2 className="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            onClick={handleResetProject}
            className="p-2 rounded-lg hover:bg-white/15 text-white cursor-pointer transition-colors"
            title="Reset ke Blok Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ===== MAIN 3-PANE MAKECODE WORKSPACE ===== */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-[#f3f5f8]">
        {/* LEFT PANE: Authentic BBC micro:bit v2 Hardware Simulator + Compact Mission Card */}
        <aside className="w-full lg:w-[290px] xl:w-[310px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-3 flex flex-col gap-3 overflow-y-auto shrink-0">
          <MicrobitBoardSimulator
            program={program}
            onActiveBlockChange={setActiveExecBlockId}
          />

          {showMissionDrawer && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#2B56D6]">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Target Proyek {selectedProject.order}</span>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    allMissionsPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-100 text-[#2B56D6]'
                  }`}
                >
                  {passedCount}/{missionResults.length}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedProject.hardwareHint}
              </p>

              <ul className="space-y-1.5">
                {missionResults.map((m) => (
                  <li
                    key={m.id}
                    className={`flex items-start gap-2 text-[11px] font-bold rounded-lg px-2 py-1.5 border ${
                      m.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        m.passed ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <span>{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* MIDDLE PANE (Blocks Mode Only): MakeCode White Category Toolbox + Flyout Drawer */}
        {editorTab === 'blocks' && (
          <div className="flex shrink-0 relative border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
            {!toolboxCollapsed && (
              <div className="w-[162px] sm:w-[172px] flex flex-col border-r border-slate-200 bg-white">
                {/* Search input */}
                <div className="p-2 border-b border-slate-200">
                  <div className="relative">
                    <input
                      type="text"
                      value={toolboxSearch}
                      onChange={(e) => setToolboxSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-2.5 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#2B56D6] text-slate-800 placeholder:text-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 9 MakeCode Categories with Colored Left Stripe */}
                <div className="flex-1 overflow-y-auto py-1">
                  {MICROBIT_CATEGORIES.map((cat) => {
                    const Icon = getCategoryIcon(cat.id);
                    const isSelected = activeCategory === cat.id && !toolboxSearch.trim();
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setToolboxSearch('');
                          setActiveCategory((curr) => (curr === cat.id ? null : cat.id));
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-bold transition-colors cursor-pointer border-b border-slate-100/80 ${
                          isSelected ? 'text-white' : 'hover:bg-slate-50'
                        }`}
                        style={{
                          borderLeft: `6px solid ${cat.color}`,
                          backgroundColor: isSelected ? cat.color : undefined,
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

            {/* Collapsible Drawer Toggle Tab (matches gray curved tab in MakeCode screenshot!) */}
            <button
              type="button"
              onClick={() => setToolboxCollapsed((v) => !v)}
              className="hidden lg:flex items-center justify-center w-4 h-16 bg-slate-400/85 hover:bg-slate-500 text-white rounded-r-lg absolute -left-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer shadow"
              style={{ left: toolboxCollapsed ? '0px' : '-16px' }}
              title={toolboxCollapsed ? 'Buka Toolbox Blok' : 'Sembunyikan Toolbox'}
            >
              {toolboxCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Flyout Block Drawer */}
            {!toolboxCollapsed && (activeCategory || toolboxSearch.trim()) && (
              <div className="w-[235px] sm:w-[250px] bg-[#64696e] text-white flex flex-col max-h-[300px] lg:max-h-none overflow-hidden shadow-inner">
                <div className="px-3 py-2.5 border-b border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          MICROBIT_CATEGORIES.find((c) => c.id === activeCategory)?.color ||
                          '#1E90FF',
                      }}
                    />
                    <span className="text-xs font-black uppercase tracking-wide">
                      {toolboxSearch.trim()
                        ? `Hasil "${toolboxSearch}"`
                        : MICROBIT_CATEGORIES.find((c) => c.id === activeCategory)?.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setToolboxSearch('');
                    }}
                    className="p-1 rounded hover:bg-white/15 cursor-pointer"
                    title="Tutup Laci Blok"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {flyoutTemplates.length === 0 ? (
                    <p className="text-xs text-white/70 p-2">Tidak ada blok yang cocok.</p>
                  ) : (
                    flyoutTemplates.map((tpl) => {
                      const color =
                        MICROBIT_CATEGORIES.find((c) => c.id === tpl.category)?.color || '#1E90FF';
                      return (
                        <div
                          key={tpl.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/mb-template', tpl.id);
                          }}
                          onClick={() => addTemplateToWorkspace(tpl)}
                          className="group rounded-lg p-2.5 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-2 border-black/25"
                          style={{ backgroundColor: color }}
                          title="Klik untuk menambah ke blok aktif, atau seret ke kanvas"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11.5px] font-extrabold leading-snug">
                              {tpl.label}
                            </span>
                            <Plus className="w-3.5 h-3.5 shrink-0 opacity-80 group-hover:opacity-100" />
                          </div>
                          <p className="text-[10px] text-white/85 mt-1 leading-tight">
                            {tpl.description}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANE: Blocks Dot-Grid Canvas OR JavaScript / Python Code Editor */}
        <main className="flex-1 flex flex-col min-w-0 min-h-[380px] relative">
          {saveToast && (
            <div className="absolute top-3 right-3 z-30 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
              {saveToast}
            </div>
          )}

          {editorTab === 'blocks' ? (
            <MicrobitBlocksCanvas
              program={program}
              activeContainerId={activeContainerId}
              activeExecutingBlockId={activeExecBlockId}
              zoom={zoom}
              onSelectContainer={setActiveContainerId}
              onUpdateContainerParam={handleUpdateContainerParam}
              onRemoveContainer={handleRemoveContainer}
              onUpdateBlockParam={handleUpdateBlockParam}
              onMoveBlock={handleMoveBlock}
              onRemoveBlock={handleRemoveBlock}
              onDropTemplate={handleDropTemplate}
            />
          ) : (
            <div className="flex-1 flex flex-col bg-[#1e1e1e] text-slate-100 min-h-0">
              {/* Code Editor Toolbar */}
              <div className="px-4 py-2.5 bg-[#252526] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-300">
                    {codeLang === 'javascript' ? 'main.ts' : 'main.py'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Edit kode lalu klik Jalankan untuk sinkron dua arah ke Blocks & papan micro:bit
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCode}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Jalankan & Sinkronkan
                </button>
              </div>

              {/* Quick Snippets Bar */}
              <div className="px-4 py-2 bg-[#2d2d30] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1">
                  Sisipkan:
                </span>
                {(codeLang === 'javascript' ? QUICK_SNIPPETS_JS : QUICK_SNIPPETS_PY).map((sn) => (
                  <button
                    key={sn.label}
                    type="button"
                    onClick={() => setCodeText((prev) => `${prev.trimEnd()}\n${sn.code}\n`)}
                    className="px-2.5 py-1 rounded bg-[#3c3c40] hover:bg-[#4e4e54] text-[11px] font-mono text-sky-200 shrink-0 cursor-pointer"
                  >
                    + {sn.label}
                  </button>
                ))}
              </div>

              {codeSyncBanner && (
                <div className="px-4 py-2 bg-emerald-900/50 border-b border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {codeSyncBanner}
                </div>
              )}

              {codeErrors.length > 0 && (
                <div className="px-4 py-2 bg-rose-950/70 border-b border-rose-500/40 text-rose-200 text-xs space-y-1">
                  {codeErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        Baris {err.line}: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Line-numbered Code Textarea */}
              <div className="flex-1 flex min-h-0 overflow-hidden">
                <div className="w-11 py-3 pr-2.5 text-right select-none bg-[#1a1a1c] text-slate-500 font-mono text-xs leading-6 overflow-hidden border-r border-white/5">
                  {codeText.split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                <textarea
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  spellCheck={false}
                  className="flex-1 p-3 bg-[#1e1e1e] text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-none overflow-auto"
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== BOTTOM MAKECODE ACTION BAR (Matches MakeCode screenshot!) ===== */}
      <footer className="bg-white border-t border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Left: Purple Download / Complete Split Button + Editable Project Name + Blue Save */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              disabled={submitting}
              onClick={handleCompleteProject}
              className="px-4 sm:px-6 py-2 bg-[#6D35C9] hover:bg-[#5c29b0] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Menyimpan...' : 'Selesai & Simpan Proyek'}
            </button>
            <button
              type="button"
              onClick={handleDownloadCode}
              className="px-3 py-2 bg-[#5625a8] hover:bg-[#471d8f] text-white border-l border-white/20 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Download kode proyek (.js / .py)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              aria-label="Nama Proyek micro:bit"
              className="w-36 sm:w-48 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-l-md focus:outline-none focus:border-[#2B56D6]"
            />
            <button
              type="button"
              onClick={handleDownloadCode}
              className="px-2.5 py-1.5 bg-[#2B56D6] hover:bg-[#2145b3] text-white rounded-r-md border border-[#2B56D6] cursor-pointer"
              title="Simpan berkas kode ke komputer"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Royal-Blue Undo / Redo & Zoom - / + */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="inline-flex rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              disabled={history.length === 0}
              onClick={handleUndo}
              className="w-9 h-8 bg-[#2B56D6] hover:bg-[#2145b3] disabled:opacity-45 text-white flex items-center justify-center cursor-pointer"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={future.length === 0}
              onClick={handleRedo}
              className="w-9 h-8 bg-[#2B56D6] hover:bg-[#2145b3] disabled:opacity-45 text-white border-l border-white/20 flex items-center justify-center cursor-pointer"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="inline-flex rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
              className="w-9 h-8 bg-[#2B56D6] hover:bg-[#2145b3] text-white flex items-center justify-center cursor-pointer"
              title="Perkecil Kanvas Blok"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
              className="w-9 h-8 bg-[#2B56D6] hover:bg-[#2145b3] text-white border-l border-white/20 flex items-center justify-center cursor-pointer"
              title="Perbesar Kanvas Blok"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* ===== VICTORY & CERTIFICATE MODAL ===== */}
      {victoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#2B56D6]">
            <div className="bg-[#2B56D6] text-white px-6 py-5 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F4C744] text-slate-950 mx-auto flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black">Proyek micro:bit Tersimpan!</h3>
              <p className="text-xs text-blue-100 font-bold">
                Proyek {victoryModal.project.order}: {victoryModal.project.title}
              </p>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-9 h-9 ${
                      s <= victoryModal.stars
                        ? 'text-amber-400 fill-amber-400 drop-shadow'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {victoryModal.stars === 3
                  ? 'Luar biasa! Semua target hardware micro:bit terpenuhi dengan sempurna.'
                  : 'Proyek berhasil disimpan! Lengkapi semua centang Misi untuk meraih 3 bintang penuh.'}
              </p>

              {victoryModal.newCertificate && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <div className="text-xs font-black flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Sertifikat micro:bit Lab Terbuka!
                  </div>
                  {onOpenCertificates && (
                    <button
                      type="button"
                      onClick={() => {
                        setVictoryModal(null);
                        onOpenCertificates();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold cursor-pointer"
                    >
                      Lihat Sertifikat Sekarang
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setVictoryModal(null);
                    setSelectedProjectId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer"
                >
                  Ke Daftar Proyek
                </button>
                {victoryModal.nextProjectId && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = victoryModal.nextProjectId;
                      setVictoryModal(null);
                      setSelectedProjectId(nextId);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#2B56D6] hover:bg-[#2145b3] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Proyek Berikutnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
