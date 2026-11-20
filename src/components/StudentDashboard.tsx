import React, { useState } from 'react';
import {
  Map as MapIcon,
  Code2,
  Award,
  LogOut,
  Star,
  Lock,
  CheckCircle2,
  Play,
  Sparkles,
  Menu,
  X,
  Eye,
  BookOpen,
  Volume2,
  VolumeX,
  Phone,
  MessageCircle,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  Layers,
  Gamepad2,
  Cpu,
  Presentation,
} from 'lucide-react';
import type {
  AiMlProjectId,
  AppMakerProjectId,
  AppSession,
  CertificateRecord,
  CodeLanguage,
  DataStoreSnapshot,
  GameMakerProjectId,
  Student,
  TierId,
} from '../types';
import { LEVELS, TIERS, getLevelById, getLevelsByTier, getTierMeta } from '../data/levels';
import { APP_MAKER_PROJECTS } from '../data/appMakerProjects';
import { GAME_MAKER_PROJECTS } from '../data/gameMakerProjects';
import { AI_ML_PROJECTS } from '../data/aiMlProjects';
import type { MediaUnitId } from '../data/learningMedia';
import {
  dataEngine,
  hasStudentAiMlAccess,
  hasStudentAppMakerAccess,
  hasStudentGameMakerAccess,
  isTrialAccessCode,
} from '../services/dataEngine';
import { soundEngine } from '../engine/soundEngine';
import { CodingStudio } from './CodingStudio';
import { AppMakerWorkspace } from './AppMakerWorkspace';
import { GameMakerWorkspace } from './GameMakerWorkspace';
import { AiMlWorkspace } from './AiMlWorkspace';
import { LearningMediaHub } from './LearningMediaHub';
import { CertificateView } from './CertificateView';
import { ModuleGuideModal } from './ModuleGuideModal';
import { CHARACTER_META, MascotPortrait, getCharacterForLevel } from './PandaMascot';
import { formatIndonesianDate, formatWhatsAppUrl } from '../utils/crypto';

interface Props {
  session: AppSession;
  store: DataStoreSnapshot;
  onLogout: () => void;
  onUpdateSession?: (nextSession: AppSession) => void;
}

type StudentTab = 'studio' | 'map' | 'media' | 'app_maker' | 'game_maker' | 'ai_ml' | 'certificates';

export const StudentDashboard: React.FC<Props> = ({
  session,
  store,
  onLogout,
  onUpdateSession,
}) => {
  // Start directly inside the Codementum-style Coding Studio for instant play!
  const [activeTab, setActiveTab] = useState<StudentTab>('studio');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('p1');
  const [mediaInitialUnit, setMediaInitialUnit] = useState<MediaUnitId>('pemula');
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [moduleModalTier, setModuleModalTier] = useState<TierId | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sfxOn, setSfxOn] = useState(() => soundEngine.isSfxEnabled());

  // Trial Upgrade / Contact Admin Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeCodeInput, setUpgradeCodeInput] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const studentRecord: Student = store.students.find((s) => s.id === session.id) || {
    id: session.id,
    name: session.name,
    username: session.username,
    passwordHash: '',
    accessCode: session.accessCode || 'BELAJAR2026',
    className: session.className || 'Kelas CodeSpark',
    instructorId: session.instructorId || 'admin',
    instructorName: session.instructorName || 'Admin CodeSpark',
    instructorUid: session.instructorUid || 'local_admin',
    ownerUid: session.id,
    hasAppMakerAccess: session.hasAppMakerAccess,
    requestedAppMaker: session.requestedAppMaker,
    hasGameMakerAccess: session.hasGameMakerAccess,
    requestedGameMaker: session.requestedGameMaker,
    hasAiMlAccess: session.hasAiMlAccess,
    requestedAiMl: session.requestedAiMl,
    createdAt: new Date().toISOString(),
  };

  const myAllProgress = store.progress.filter((p) => p.studentId === studentRecord.id);
  const myProgress = myAllProgress.filter(
    (p) => p.tier !== 'app_maker' && p.tier !== 'game_maker' && p.tier !== 'ai_ml'
  );
  const myAppMakerProgress = myAllProgress.filter((p) => p.tier === 'app_maker');
  const myGameMakerProgress = myAllProgress.filter((p) => p.tier === 'game_maker');
  const myAiMlProgress = myAllProgress.filter((p) => p.tier === 'ai_ml');
  const progressByLevel = new Map(myProgress.map((p) => [p.levelId, p]));
  const appMakerProgressMap = new Map(myAppMakerProgress.map((p) => [p.levelId, p]));
  const gameMakerProgressMap = new Map(myGameMakerProgress.map((p) => [p.levelId, p]));
  const aiMlProgressMap = new Map(myAiMlProgress.map((p) => [p.levelId, p]));
  const myCertificates = store.certificates.filter((c) => c.studentId === studentRecord.id);

  const totalStars = myProgress.reduce((acc, p) => acc + p.stars, 0);
  const maxStars = LEVELS.length * 3;
  const completedCount = myProgress.length;
  const progressPercent = Math.round((completedCount / LEVELS.length) * 100);

  const isTrialStudent = isTrialAccessCode(studentRecord.accessCode, store.accessCodes);
  const hasAppMaker = hasStudentAppMakerAccess(studentRecord, store.accessCodes);
  const hasGameMaker = hasStudentGameMakerAccess(studentRecord, store.accessCodes);
  const hasAiMl = hasStudentAiMlAccess(studentRecord, store.accessCodes);

  const isLevelUnlocked = (order: number): boolean => {
    if (order === 1) return true;
    if (isTrialStudent) return false;
    const prevLevel = LEVELS.find((l) => l.order === order - 1);
    return prevLevel ? progressByLevel.has(prevLevel.id) : true;
  };

  const currentLevel = getLevelById(selectedLevelId) || LEVELS[0];
  const currentTierMeta = getTierMeta(currentLevel.tier);
  const prevLevel = LEVELS.find((l) => l.order === currentLevel.order - 1);
  const nextLevel = LEVELS.find((l) => l.order === currentLevel.order + 1);
  const canGoNext = nextLevel ? isLevelUnlocked(nextLevel.order) : false;

  const handleOpenLevel = (levelId: string) => {
    soundEngine.playButtonClick();
    const targetLvl = getLevelById(levelId);
    if (isTrialStudent && targetLvl && targetLvl.order > 1) {
      setUpgradeError(null);
      setUpgradeSuccess(null);
      setUpgradeModalOpen(true);
      setDrawerOpen(false);
      return;
    }
    setSelectedLevelId(levelId);
    setActiveTab('studio');
    setDrawerOpen(false);
  };

  const openMediaUnit = (unit: MediaUnitId) => {
    soundEngine.playButtonClick();
    setMediaInitialUnit(unit);
    setActiveTab('media');
    setDrawerOpen(false);
  };

  const handleLaunchFromMedia = (unit: MediaUnitId) => {
    soundEngine.playButtonClick();
    if (unit === 'app_maker') {
      setActiveTab('app_maker');
      return;
    }
    if (unit === 'game_maker') {
      setActiveTab('game_maker');
      return;
    }
    if (unit === 'ai_ml') {
      setActiveTab('ai_ml');
      return;
    }
    const tierLevels = getLevelsByTier(unit);
    const nextUnlocked =
      tierLevels.find((l) => isLevelUnlocked(l.order) && !progressByLevel.has(l.id)) ||
      tierLevels.find((l) => isLevelUnlocked(l.order)) ||
      tierLevels[0];
    if (nextUnlocked) {
      handleOpenLevel(nextUnlocked.id);
    }
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);
    setUpgradeSuccess(null);
    setUpgradeLoading(true);
    try {
      const updated = await dataEngine.upgradeStudentAccessCode(
        studentRecord.id,
        upgradeCodeInput
      );
      onUpdateSession?.({
        ...session,
        accessCode: updated.accessCode,
        className: updated.className,
        instructorId: updated.instructorId,
        instructorName: updated.instructorName,
        instructorUid: updated.instructorUid,
        hasAppMakerAccess: updated.hasAppMakerAccess,
        hasGameMakerAccess: updated.hasGameMakerAccess,
        hasAiMlAccess: updated.hasAiMlAccess,
      });
      const unlockedExtras = [
        updated.hasAppMakerAccess ? 'Program App Maker (5 Proyek)' : null,
        updated.hasGameMakerAccess ? 'Program Game Maker (5 Game)' : null,
        updated.hasAiMlAccess ? 'Program AI-ML (2 Proyek)' : null,
      ].filter(Boolean);
      setUpgradeSuccess(
        `Berhasil! Akun Anda kini tergabung di "${updated.className}" (${updated.accessCode}). ${
          unlockedExtras.length > 0
            ? `Coding Studio & ${unlockedExtras.join(' + ')} kini telah terbuka!`
            : 'Level 2–9 Coding Studio telah terbuka!'
        }`
      );
      setUpgradeCodeInput('');
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Gagal mengaktifkan kode akses.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCopyPhone = () => {
    if (!store.settings.adminPhone) return;
    navigator.clipboard?.writeText(store.settings.adminPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1800);
  };

  const handleLevelComplete = async (payload: {
    levelId: string;
    tier: TierId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
    language: CodeLanguage;
  }) => {
    const res = await dataEngine.saveLevelProgress({
      student: studentRecord,
      ...payload,
    });
    return { newCertificate: res.newCertificate };
  };

  const handleAppMakerComplete = async (payload: {
    projectId: AppMakerProjectId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
  }) => {
    const res = await dataEngine.saveAppMakerProgress({
      student: studentRecord,
      ...payload,
    });
    return { newCertificate: res.newCertificate };
  };

  const handleGameMakerComplete = async (payload: {
    projectId: GameMakerProjectId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
  }) => {
    const res = await dataEngine.saveGameMakerProgress({
      student: studentRecord,
      ...payload,
    });
    return { newCertificate: res.newCertificate };
  };

  const handleAiMlComplete = async (payload: {
    projectId: AiMlProjectId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
  }) => {
    const res = await dataEngine.saveAiMlProgress({
      student: studentRecord,
      ...payload,
    });
    return { newCertificate: res.newCertificate };
  };

  const toggleSound = () => {
    const next = !sfxOn;
    setSfxOn(next);
    soundEngine.setSfxEnabled(next);
  };

  const navItems: { id: StudentTab; label: string; icon: typeof MapIcon }[] = [
    { id: 'studio', label: 'Studio', icon: Code2 },
    { id: 'map', label: 'Peta', icon: MapIcon },
    { id: 'media', label: 'Media', icon: Presentation },
    {
      id: 'app_maker',
      label: hasAppMaker
        ? `App (${myAppMakerProgress.length}/${APP_MAKER_PROJECTS.length})`
        : 'App 🔒',
      icon: Layers,
    },
    {
      id: 'game_maker',
      label: hasGameMaker
        ? `Game (${myGameMakerProgress.length}/${GAME_MAKER_PROJECTS.length})`
        : 'Game 🔒',
      icon: Gamepad2,
    },
    {
      id: 'ai_ml',
      label: hasAiMl
        ? `AI-ML (${myAiMlProgress.length}/${AI_ML_PROJECTS.length})`
        : 'AI-ML 🔒',
      icon: Cpu,
    },
    { id: 'certificates', label: `Sertif (${myCertificates.length})`, icon: Award },
  ];

  const mobileBottomNavItems = navItems.filter((item) => item.id !== 'certificates');

  const isStudioMode = activeTab === 'studio';

  return (
    <div className={`min-h-screen flex flex-col ${isStudioMode ? 'bg-[#333840]' : 'bg-[#FFFDF7]'}`}>
      {/* CODEMENTUM-STYLE DARK TOP HEADER BAR */}
      <header className="no-print sticky top-0 z-30 bg-[#2C313A] text-white border-b-2 border-black shadow-md">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
          {/* Left Brand + Class Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setDrawerOpen((v) => !v);
              }}
              className="lg:hidden p-2 rounded bg-[#3E4552] border border-white/20 text-white cursor-pointer"
              aria-label="Menu navigasi"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('studio');
              }}
              className="flex items-center gap-2 font-display text-lg sm:text-xl font-extrabold tracking-tight text-white cursor-pointer shrink-0"
            >
              <span className="w-8 h-8 rounded bg-gradient-to-b from-[#FFBE45] to-[#E68A1E] border-2 border-[#7C3E08] flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </span>
              <span>CodeSpark</span>
            </button>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/20 text-xs text-neutral-300 truncate">
              <span className="px-2 py-1 rounded bg-white text-black font-extrabold text-[11px] shrink-0">
                {studentRecord.className}
              </span>
              <span className="truncate">Instruktur: {studentRecord.instructorName}</span>
            </div>
          </div>

          {/* Center-Right: Codementum Green Course Pill + Tabs + User + Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Green Course / Level Map Button (like Codementum "The Basics ▶") */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(activeTab === 'map' ? 'studio' : 'map');
              }}
              className="hidden sm:inline-flex items-center rounded overflow-hidden border border-[#2D7A1E] shadow cursor-pointer"
              title="Buka Peta Kursus & Level Kurikulum"
            >
              <span className="bg-[#57B832] hover:bg-[#4FA62C] px-3 py-1.5 text-xs font-extrabold text-white inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{currentTierMeta.name}</span>
              </span>
              <span className="bg-[#459925] px-2 py-1.5 text-white flex items-center">
                <Play className="w-3 h-3 fill-white" />
              </span>
            </button>

            {/* Codementum Interactive Learning Media Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                if (activeTab === 'media') {
                  setActiveTab('studio');
                } else {
                  setMediaInitialUnit(currentLevel.tier);
                  setActiveTab('media');
                }
              }}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-extrabold border cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-[#FFE600] text-black border-black'
                  : 'bg-[#3A414E] text-white border-white/15 hover:bg-[#485060]'
              }`}
              title="Media Belajar Interaktif (Slide Konsep, Lab Mini & Kuis)"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Media Belajar</span>
            </button>

            {/* Trial Mode Quick Upgrade Button */}
            {isTrialStudent && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setUpgradeError(null);
                  setUpgradeSuccess(null);
                  setUpgradeModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-[#FFE600] hover:bg-[#FFD900] text-black text-xs font-extrabold border-2 border-black cursor-pointer"
                title="Mode Uji Coba Level 1 — Hubungi Admin untuk buka Level 2–9"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Uji Coba L1 · Hubungi Admin</span>
                <span className="sm:hidden">Upgrade</span>
              </button>
            )}

            {/* App Maker Switch Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(activeTab === 'app_maker' ? 'studio' : 'app_maker');
              }}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-extrabold border cursor-pointer ${
                activeTab === 'app_maker'
                  ? 'bg-[#C084FC] text-black border-black'
                  : 'bg-[#3A414E] text-white border-white/15 hover:bg-[#485060]'
              }`}
              title="Program Panduan App Maker (5 Proyek Interaktif)"
            >
              {hasAppMaker ? <Layers className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>
                App Maker{hasAppMaker ? ` (${myAppMakerProgress.length}/${APP_MAKER_PROJECTS.length})` : ''}
              </span>
            </button>

            {/* Game Maker Switch Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(activeTab === 'game_maker' ? 'studio' : 'game_maker');
              }}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-extrabold border cursor-pointer ${
                activeTab === 'game_maker'
                  ? 'bg-[#38BDF8] text-black border-black'
                  : 'bg-[#3A414E] text-white border-white/15 hover:bg-[#485060]'
              }`}
              title="Program Panduan Game Maker (5 Game Interaktif)"
            >
              {hasGameMaker ? <Gamepad2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>
                Game Maker{hasGameMaker ? ` (${myGameMakerProgress.length}/${GAME_MAKER_PROJECTS.length})` : ''}
              </span>
            </button>

            {/* AI-ML Switch Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(activeTab === 'ai_ml' ? 'studio' : 'ai_ml');
              }}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-extrabold border cursor-pointer ${
                activeTab === 'ai_ml'
                  ? 'bg-[#FDBA74] text-black border-black'
                  : 'bg-[#3A414E] text-white border-white/15 hover:bg-[#485060]'
              }`}
              title="Program Panduan AI-ML (Cartoonizer & Face Detection)"
            >
              {hasAiMl ? <Cpu className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>
                AI-ML{hasAiMl ? ` (${myAiMlProgress.length}/${AI_ML_PROJECTS.length})` : ''}
              </span>
            </button>

            {/* Quick Certificate Switch */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(activeTab === 'certificates' ? 'studio' : 'certificates');
              }}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border cursor-pointer ${
                activeTab === 'certificates'
                  ? 'bg-[#FFE600] text-black border-black'
                  : 'bg-[#3A414E] text-white border-white/15 hover:bg-[#485060]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sertifikat ({myCertificates.length})</span>
            </button>

            {/* Audio Quick Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded border cursor-pointer ${
                sfxOn
                  ? 'bg-[#3A414E] border-white/20 text-[#4ADE80]'
                  : 'bg-[#3A414E] border-white/20 text-neutral-400'
              }`}
              title={sfxOn ? 'Matikan Efek Suara' : 'Aktifkan Efek Suara'}
              aria-label="Toggle suara"
            >
              {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Stars & Student Name */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#22262E] border border-white/10 text-xs font-bold tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#FFE600] text-[#FFE600]" />
              <span>
                {totalStars}/{maxStars}
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-200 max-w-[110px] truncate">{studentRecord.name}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                soundEngine.stopBgm();
                onLogout();
              }}
              className="px-3 py-1.5 rounded bg-[#4A9AC4] hover:bg-[#3A84AB] text-white text-xs font-extrabold inline-flex items-center gap-1.5 border border-[#2C6584] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Slide Drawer */}
      {drawerOpen && (
        <div className="no-print lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setDrawerOpen(false)}>
          <div
            className="w-72 h-full bg-[#FFFDF7] border-r-[3px] border-black p-5 flex flex-col justify-between text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold">Menu Siswa</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="neo-btn bg-white p-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-white border-2 border-black space-y-1 text-xs">
                <div className="font-display font-extrabold text-sm">{studentRecord.name}</div>
                <div>Kelas: {studentRecord.className}</div>
                <div>Instruktur: {studentRecord.instructorName}</div>
                <div className="font-extrabold pt-1 tabular-nums">
                  Bintang: {totalStars}/{maxStars} ({progressPercent}%)
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        setActiveTab(item.id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-2 border-black font-extrabold text-sm flex items-center gap-2.5 cursor-pointer ${
                        active ? 'bg-[#FFE600]' : 'bg-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="text-[11px] font-bold text-neutral-600">
              © 2026 CodeSpark · @copyright Pak GuruAI
            </div>
          </div>
        </div>
      )}

      {/* MAIN BODY */}
      <div className="no-print flex-1 flex flex-col pb-16 lg:pb-0">
        {activeTab === 'studio' && (
          <CodingStudio
            level={currentLevel}
            prevLevel={prevLevel}
            nextLevel={nextLevel}
            canGoNext={canGoNext}
            previousBestStars={progressByLevel.get(currentLevel.id)?.stars || 0}
            isTrialStudent={isTrialStudent}
            adminPhone={store.settings.adminPhone}
            adminContactName={store.settings.adminContactName}
            onRequestUpgrade={() => {
              setUpgradeError(null);
              setUpgradeSuccess(null);
              setUpgradeModalOpen(true);
            }}
            onBackToMap={() => setActiveTab('map')}
            onSelectLevel={(id) => handleOpenLevel(id)}
            onOpenCertificates={() => setActiveTab('certificates')}
            onOpenModule={(tier) => setModuleModalTier(tier)}
            onOpenMedia={(tier) => openMediaUnit(tier)}
            onLevelComplete={handleLevelComplete}
          />
        )}

        {activeTab === 'media' && (
          <LearningMediaHub
            initialUnit={mediaInitialUnit}
            onLaunchUnit={handleLaunchFromMedia}
            onOpenPrintableModule={(tier) => setModuleModalTier(tier)}
          />
        )}

        {activeTab === 'map' && (
          <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-black">
            {isTrialStudent && (
              <div className="neo-card bg-[#FFE600] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-display font-extrabold text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    Akun Kode Belajar Uji Coba ({studentRecord.accessCode}) — Khusus Level 1
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900 leading-relaxed">
                    {store.settings.upgradeMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setUpgradeError(null);
                    setUpgradeSuccess(null);
                    setUpgradeModalOpen(true);
                  }}
                  className="neo-btn bg-black text-white px-4 py-2.5 text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Admin / Aktivasi Kode
                </button>
              </div>
            )}

            {/* CODEMENTUM-STYLE COURSE HUB HEADER + 4 PROGRAM TRACKS */}
            <div className="neo-card bg-white p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-extrabold">
                    Peta Kursus &amp; Petualangan Coding
                  </h1>
                  <p className="text-sm text-neutral-700 mt-1">
                    Pelajari slide konsep interaktif, selesaikan pulau misi Studio L1–L9, lalu bangun proyek App, Game, dan AI-ML.
                  </p>
                </div>
                <div className="w-full sm:w-64 space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold tabular-nums">
                    <span>Progres Coding Studio</span>
                    <span>
                      {completedCount}/{LEVELS.length} Level ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-3.5 bg-[#FFFDF7] border-2 border-black">
                    <div className="h-full bg-[#4ADE80]" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* 4 Codementum My Courses Cards */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {[
                  {
                    id: 'studio' as const,
                    title: 'Coding Studio',
                    sub: 'Blok, Python & JS (9 Level)',
                    done: completedCount,
                    total: LEVELS.length,
                    unlocked: true,
                    accent: '#4ADE80',
                    mediaUnit: currentLevel.tier as MediaUnitId,
                    onOpen: () => setActiveTab('studio'),
                  },
                  {
                    id: 'app_maker' as const,
                    title: 'App Maker',
                    sub: '5 Proyek Web Interaktif',
                    done: myAppMakerProgress.length,
                    total: APP_MAKER_PROJECTS.length,
                    unlocked: hasAppMaker,
                    accent: '#C084FC',
                    mediaUnit: 'app_maker' as MediaUnitId,
                    onOpen: () => setActiveTab('app_maker'),
                  },
                  {
                    id: 'game_maker' as const,
                    title: 'Game Maker',
                    sub: '5 Game Arcade & Logika',
                    done: myGameMakerProgress.length,
                    total: GAME_MAKER_PROJECTS.length,
                    unlocked: hasGameMaker,
                    accent: '#38BDF8',
                    mediaUnit: 'game_maker' as MediaUnitId,
                    onOpen: () => setActiveTab('game_maker'),
                  },
                  {
                    id: 'ai_ml' as const,
                    title: 'AI-ML Vision',
                    sub: 'Cartoonizer & Face Detection',
                    done: myAiMlProgress.length,
                    total: AI_ML_PROJECTS.length,
                    unlocked: hasAiMl,
                    accent: '#FDBA74',
                    mediaUnit: 'ai_ml' as MediaUnitId,
                    onOpen: () => setActiveTab('ai_ml'),
                  },
                ].map((course) => {
                  const pct = Math.round((course.done / Math.max(1, course.total)) * 100);
                  return (
                    <div
                      key={course.id}
                      className="border-2 border-black bg-[#FFFDF7] p-3.5 flex flex-col justify-between gap-3 shadow-[3px_3px_0px_0px_#000]"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="px-2 py-0.5 border-2 border-black text-[11px] font-extrabold"
                            style={{ backgroundColor: course.accent }}
                          >
                            {course.unlocked ? 'Aktif' : 'Terkunci'}
                          </span>
                          <span className="font-mono text-xs font-extrabold tabular-nums">
                            {course.done}/{course.total}
                          </span>
                        </div>
                        <div className="font-display font-extrabold text-base">{course.title}</div>
                        <div className="text-[11px] text-neutral-700">{course.sub}</div>
                        <div className="h-2 bg-white border border-black">
                          <div
                            className="h-full"
                            style={{ width: `${pct}%`, backgroundColor: course.accent }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playButtonClick();
                            course.onOpen();
                          }}
                          className="neo-btn flex-1 py-1.5 px-2 text-xs font-extrabold bg-white cursor-pointer"
                        >
                          {course.unlocked ? 'Buka Lab' : 'Aktifkan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openMediaUnit(course.mediaUnit)}
                          className="neo-btn py-1.5 px-2.5 text-xs font-extrabold bg-[#FFE600] inline-flex items-center gap-1 cursor-pointer"
                          title={`Buka Media Belajar ${course.title}`}
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          Slide
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CODEMENTUM WINDING FOREST ISLAND ADVENTURE PATHS PER TIER */}
            <div className="space-y-8">
              {TIERS.map((tier) => {
                const tierLevels = getLevelsByTier(tier.id);
                const tierDoneCount = tierLevels.filter((l) => progressByLevel.has(l.id)).length;
                const hasCert = myCertificates.find((c) => c.tierId === tier.id);

                return (
                  <section key={tier.id} className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b-[3px] border-black">
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-extrabold">
                          {tier.number}. {tier.name} — {tier.subtitle}
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-700">{tier.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold tabular-nums">
                          {tierDoneCount}/{tierLevels.length} Selesai
                        </span>
                        <button
                          type="button"
                          onClick={() => openMediaUnit(tier.id)}
                          className="neo-btn bg-[#FFE600] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Presentation className="w-4 h-4" />
                          Slide &amp; Kuis
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setModuleModalTier(tier.id);
                          }}
                          className="neo-btn bg-[#38BDF8] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          Modul PDF
                        </button>
                        {hasCert && (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playButtonClick();
                              setPreviewCert(hasCert);
                            }}
                            className="neo-btn bg-[#4ADE80] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Award className="w-4 h-4" />
                            Sertifikat
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Winding Isometric Meadow Adventure Strip (Codementum Island Path) */}
                    <div className="neo-card bg-gradient-to-r from-[#2D6A2E] via-[#419234] to-[#2D6A2E] p-4 sm:p-5 relative overflow-hidden">
                      <svg
                        viewBox="0 0 900 120"
                        preserveAspectRatio="none"
                        className="hidden sm:block pointer-events-none absolute inset-0 w-full h-full opacity-90"
                        aria-hidden="true"
                      >
                        <path
                          d="M 150 62 C 280 18, 340 105, 450 62 C 560 18, 620 105, 750 62"
                          fill="none"
                          stroke="#E8D19A"
                          strokeWidth="16"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 150 62 C 280 18, 340 105, 450 62 C 560 18, 620 105, 750 62"
                          fill="none"
                          stroke="#8C5A2B"
                          strokeWidth="4"
                          strokeDasharray="10 10"
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="relative z-10 grid grid-cols-3 gap-3 items-center">
                        {tierLevels.map((lvl) => {
                          const prog = progressByLevel.get(lvl.id);
                          const unlocked = isLevelUnlocked(lvl.order);
                          const completed = Boolean(prog);
                          const charId = getCharacterForLevel(lvl.order);
                          const isCurrent = selectedLevelId === lvl.id;
                          return (
                            <button
                              key={`node-${lvl.id}`}
                              type="button"
                              onClick={() => handleOpenLevel(lvl.id)}
                              disabled={!unlocked && !(isTrialStudent && lvl.order > 1)}
                              className="flex flex-col items-center gap-1.5 group cursor-pointer disabled:cursor-not-allowed"
                            >
                              <div className="relative">
                                <div
                                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-[#3B1F0B] flex items-center justify-center font-display text-xl sm:text-2xl font-extrabold shadow-[0_4px_0_#2A1406] transition-transform group-hover:scale-105 ${
                                    completed
                                      ? 'bg-gradient-to-b from-[#FFE600] to-[#F59E0B] text-black'
                                      : unlocked
                                        ? 'bg-gradient-to-b from-[#77E248] to-[#469A22] text-white'
                                        : 'bg-neutral-500 text-neutral-200'
                                  } ${isCurrent ? 'ring-4 ring-white' : ''}`}
                                >
                                  {unlocked ? lvl.order : <Lock className="w-5 h-5" />}
                                </div>
                                <div className="absolute -right-2 -bottom-1 bg-[#FFFDF7] rounded-full border-2 border-[#3B1F0B] p-0.5">
                                  <MascotPortrait character={charId} className="w-6 h-6" mood={completed ? 'excited' : 'happy'} />
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 bg-black/45 px-2 py-0.5 rounded-full">
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      prog && s <= prog.stars
                                        ? 'fill-[#FFE600] text-[#FFE600]'
                                        : 'text-white/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-extrabold text-white drop-shadow text-center line-clamp-1">
                                {lvl.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {tierLevels.map((lvl) => {
                        const prog = progressByLevel.get(lvl.id);
                        const unlocked = isLevelUnlocked(lvl.order);
                        const completed = Boolean(prog);
                        const charId = getCharacterForLevel(lvl.order);
                        const charMeta = CHARACTER_META[charId];

                        return (
                          <div
                            key={lvl.id}
                            className={`neo-card p-5 flex flex-col justify-between ${
                              unlocked ? 'bg-white' : 'bg-neutral-100 opacity-80'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className="px-2.5 py-1 border-2 border-black font-mono text-xs font-extrabold"
                                    style={{ backgroundColor: unlocked ? tier.accentColor : '#E5E5E5' }}
                                  >
                                    Level {lvl.order}
                                  </span>
                                  <span
                                    className="px-2 py-0.5 border-2 border-black text-[11px] font-extrabold inline-flex items-center gap-1"
                                    style={{ backgroundColor: unlocked ? charMeta.badgeBg : '#EFEFEF' }}
                                  >
                                    <MascotPortrait character={charId} className="w-5 h-5" mood="happy" />
                                    {charMeta.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
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

                              <h3 className="font-display text-lg font-extrabold mb-1">{lvl.title}</h3>
                              <p className="text-xs text-neutral-700 leading-relaxed mb-4">
                                {lvl.subtitle}
                              </p>
                            </div>

                            <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                              <span className="text-xs font-bold inline-flex items-center gap-1">
                                {completed ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                    Selesai
                                  </>
                                ) : unlocked ? (
                                  'Terbuka'
                                ) : isTrialStudent && lvl.order > 1 ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    Khusus Akses Penuh
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    Terkunci
                                  </>
                                )}
                              </span>

                              {isTrialStudent && lvl.order > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLevel(lvl.id)}
                                  className="neo-btn bg-[#FFE600] px-3 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  Hubungi Admin
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!unlocked}
                                  onClick={() => handleOpenLevel(lvl.id)}
                                  className={`neo-btn px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                                    completed ? 'bg-[#FFE600]' : 'bg-[#4ADE80]'
                                  }`}
                                >
                                  <Play className="w-3.5 h-3.5 fill-black" />
                                  {completed ? 'Main Lagi' : 'Mulai'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </main>
        )}

        {activeTab === 'app_maker' && (
          <AppMakerWorkspace
            hasAccess={hasAppMaker}
            requestedAppMaker={studentRecord.requestedAppMaker}
            completedProgressMap={appMakerProgressMap}
            adminPhone={store.settings.adminPhone}
            adminContactName={store.settings.adminContactName}
            onRequestUpgrade={() => {
              setUpgradeError(null);
              setUpgradeSuccess(null);
              setUpgradeModalOpen(true);
            }}
            onProjectComplete={handleAppMakerComplete}
            onOpenCertificates={() => setActiveTab('certificates')}
          />
        )}

        {activeTab === 'game_maker' && (
          <GameMakerWorkspace
            hasAccess={hasGameMaker}
            requestedGameMaker={studentRecord.requestedGameMaker}
            completedProgressMap={gameMakerProgressMap}
            adminPhone={store.settings.adminPhone}
            adminContactName={store.settings.adminContactName}
            onRequestUpgrade={() => {
              setUpgradeError(null);
              setUpgradeSuccess(null);
              setUpgradeModalOpen(true);
            }}
            onProjectComplete={handleGameMakerComplete}
            onOpenCertificates={() => setActiveTab('certificates')}
          />
        )}

        {activeTab === 'ai_ml' && (
          <AiMlWorkspace
            hasAccess={hasAiMl}
            requestedAiMl={studentRecord.requestedAiMl}
            completedProgressMap={aiMlProgressMap}
            adminPhone={store.settings.adminPhone}
            adminContactName={store.settings.adminContactName}
            onRequestUpgrade={() => {
              setUpgradeError(null);
              setUpgradeSuccess(null);
              setUpgradeModalOpen(true);
            }}
            onProjectComplete={handleAiMlComplete}
            onOpenCertificates={() => setActiveTab('certificates')}
          />
        )}

        {activeTab === 'certificates' && (
          <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-extrabold">Sertifikat Kelulusan Saya</h1>
                <p className="text-sm text-neutral-700 mt-1">
                  Sertifikat terbit secara otomatis begitu Anda menuntaskan seluruh 3 level pada satu tingkatan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('studio');
                }}
                className="neo-btn bg-[#4ADE80] px-4 py-2.5 text-sm font-extrabold cursor-pointer"
              >
                Kembali ke Coding Studio
              </button>
            </div>

            {myCertificates.length === 0 ? (
              <div className="neo-card bg-white p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFE600] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mx-auto flex items-center justify-center">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="font-display text-xl font-extrabold">Belum Ada Sertifikat Terbit</h2>
                <p className="text-sm text-neutral-700 max-w-md mx-auto">
                  Selesaikan Level 1, 2, dan 3 pada Tingkat Pemula untuk langsung mendapatkan sertifikat
                  kelulusan pertamamu!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setActiveTab('studio');
                  }}
                  className="neo-btn bg-[#4ADE80] px-5 py-2.5 text-sm font-extrabold cursor-pointer"
                >
                  Lanjut Main di Coding Studio
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myCertificates.map((cert) => {
                  const tierMeta =
                    cert.tierId === 'app_maker'
                      ? { name: 'Program App Maker', accentColor: '#FB7185' }
                      : cert.tierId === 'game_maker'
                        ? { name: 'Program Game Maker', accentColor: '#38BDF8' }
                        : cert.tierId === 'ai_ml'
                          ? { name: 'Program AI-ML Vision', accentColor: '#FDBA74' }
                          : TIERS.find((t) => t.id === cert.tierId) || TIERS[0];
                  return (
                    <div key={cert.id} className="neo-card bg-white flex flex-col justify-between">
                      <div>
                        <div
                          className="p-4 border-b-[3px] border-black flex items-center justify-between"
                          style={{ backgroundColor: tierMeta.accentColor }}
                        >
                          <span className="font-display font-extrabold text-base">{tierMeta.name}</span>
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="p-5 space-y-2">
                          <div className="font-mono text-xs font-bold text-neutral-600">
                            {cert.certificateNo}
                          </div>
                          <h3 className="font-display font-extrabold text-lg">{cert.tierName}</h3>
                          <p className="text-xs text-neutral-700">
                            Diterbitkan: <strong>{formatIndonesianDate(cert.issuedAt)}</strong>
                          </p>
                          <p className="text-xs text-neutral-700">
                            Instruktur: <strong>{cert.instructorName}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setPreviewCert(cert);
                          }}
                          className="neo-btn bg-[#FFE600] w-full py-2.5 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Pratinjau &amp; Cetak PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}
      </div>

      {/* Mobile Compact Bottom Nav */}
      <nav className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#2C313A] text-white border-t-2 border-black grid grid-cols-6 h-14">
        {mobileBottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold cursor-pointer ${
                active ? 'bg-[#57B832] text-white' : 'bg-[#2C313A] text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {previewCert && (
        <CertificateView certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}

      {/* CONTACT ADMIN & UPGRADE ACCESS CODE MODAL */}
      {upgradeModalOpen && (
        <div
          className="no-print fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setUpgradeModalOpen(false)}
        >
          <div
            className="neo-card bg-[#FFFDF7] text-black w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold">
                    Aktivasi Kode Akses / Program Panduan
                  </h2>
                  <p className="text-xs font-semibold text-neutral-600">
                    Kode aktif saat ini: {studentRecord.accessCode} · Buka Level 2–9, App Maker, Game Maker &amp; AI-ML
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="neo-btn bg-white p-1.5 cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-neutral-800 leading-relaxed">
              {store.settings.upgradeMessage}
            </p>

            {/* Admin Contact Box */}
            <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
              <div className="text-xs font-bold text-neutral-600">
                Hubungi {store.settings.adminContactName || 'Admin CodeSpark'}
              </div>

              {store.settings.adminPhone.trim() ? (
                <>
                  <div className="flex items-center justify-between gap-2 bg-[#FFFDF7] border-2 border-black px-3 py-2">
                    <span className="font-mono text-base font-extrabold inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      {store.settings.adminPhone}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="neo-btn bg-[#38BDF8] px-2.5 py-1 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPhone ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  {(() => {
                    const waUrl = formatWhatsAppUrl(
                      store.settings.adminPhone,
                      `Halo ${store.settings.adminContactName || 'Admin CodeSpark'}, saya ${studentRecord.name} (@${studentRecord.username}) sudah mencoba Level 1 dan ingin mendapatkan Kode Akses Kelas Penuh untuk Level 2–9.`
                    );
                    if (!waUrl) return null;
                    return (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neo-btn bg-[#4ADE80] w-full py-3 text-sm font-extrabold inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Hubungi Admin via WhatsApp
                      </a>
                    );
                  })()}
                </>
              ) : (
                <div className="p-3 bg-[#FFE600]/40 border-2 border-black text-xs font-bold leading-relaxed">
                  Admin belum mengatur Nomor HP / WhatsApp. Minta Admin membuka menu{' '}
                  <strong>Portal Admin → Pengaturan</strong> untuk menambahkan nomor HP.
                </div>
              )}
            </div>

            {/* Instant Upgrade Code Form */}
            <form
              onSubmit={handleUpgradeSubmit}
              className="p-4 bg-white border-2 border-black space-y-3"
            >
              <div className="font-display font-extrabold text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Sudah Punya Kode Akses Kelas Penuh?
              </div>

              {upgradeError && (
                <div className="p-2.5 bg-[#FB7185]/30 border-2 border-black text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{upgradeError}</span>
                </div>
              )}
              {upgradeSuccess && (
                <div className="p-2.5 bg-[#4ADE80]/40 border-2 border-black text-xs font-bold">
                  {upgradeSuccess}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={upgradeCodeInput}
                  onChange={(e) => setUpgradeCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: SPARK-4821"
                  className="neo-input flex-1 px-3 py-2 text-sm font-mono font-extrabold uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={upgradeLoading}
                  className="neo-btn bg-[#FFE600] px-4 py-2 text-xs sm:text-sm font-extrabold cursor-pointer shrink-0"
                >
                  {upgradeLoading ? 'Proses...' : 'Aktifkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moduleModalTier && (
        <ModuleGuideModal initialTier={moduleModalTier} onClose={() => setModuleModalTier(null)} />
      )}
    </div>
  );
};
