import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Award,
  LogOut,
  Sparkles,
  KeyRound,
  BarChart3,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Shuffle,
  Search,
  Eye,
  EyeOff,
  Star,
  Menu,
  X,
  AlertCircle,
  Settings,
  Phone,
  MessageCircle,
  Save,
  BookOpen,
  Gamepad2,
  Play,
  ArrowLeft,
  Unlock,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type {
  AppSession,
  CertificateRecord,
  DataStoreSnapshot,
  TierId,
} from '../types';
import { dataEngine } from '../services/dataEngine';
import { CHARACTER_META, MascotPortrait, getCharacterForLevel } from './PandaMascot';
import { LEVELS, TIERS, getLevelById, getLevelsByTier, getTierMeta } from '../data/levels';
import { blocksToCode } from '../engine/interpreter';
import { soundEngine } from '../engine/soundEngine';
import { formatShortDate, formatWhatsAppUrl, generateAccessCode } from '../utils/crypto';
import { CertificateView } from './CertificateView';
import { CodingStudio } from './CodingStudio';
import { ModuleGuideModal } from './ModuleGuideModal';

interface Props {
  session: AppSession;
  store: DataStoreSnapshot;
  onLogout: () => void;
}

type AdminTab = 'analytics' | 'instructors' | 'codes' | 'students' | 'preview' | 'settings';

const PIE_COLORS = ['#FFE600', '#4ADE80', '#38BDF8', '#C084FC', '#FB7185', '#FDBA74'];

export const AdminDashboard: React.FC<Props> = ({ session, store, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add Instructor Form
  const [instName, setInstName] = useState('');
  const [instUsername, setInstUsername] = useState('');
  const [instPassword, setInstPassword] = useState('');
  const [instSpecialty, setInstSpecialty] = useState('');
  const [showInstPass, setShowInstPass] = useState(false);
  const [instLoading, setInstLoading] = useState(false);
  const [instError, setInstError] = useState<string | null>(null);
  const [instSuccess, setInstSuccess] = useState<string | null>(null);

  // Add Global Access Code Form
  const [codeClassName, setCodeClassName] = useState('');
  const [codeValue, setCodeValue] = useState(() => generateAccessCode('SPARK'));
  const [codeIsTrial, setCodeIsTrial] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Contact / App Settings Form
  const [adminPhone, setAdminPhone] = useState(store.settings.adminPhone || '');
  const [adminContactName, setAdminContactName] = useState(
    store.settings.adminContactName || 'Admin CodeSpark (Pak GuruAI)'
  );
  const [upgradeMessage, setUpgradeMessage] = useState(store.settings.upgradeMessage || '');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setAdminPhone(store.settings.adminPhone || '');
    setAdminContactName(store.settings.adminContactName || 'Admin CodeSpark (Pak GuruAI)');
    setUpgradeMessage(store.settings.upgradeMessage || '');
  }, [store.settings.updatedAt, store.settings.adminPhone, store.settings.adminContactName, store.settings.upgradeMessage]);

  // Student Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('ALL');
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [moduleModalTier, setModuleModalTier] = useState<TierId | null>(null);

  // Admin Full Materials & Unlocked Studio Preview State
  const [previewView, setPreviewView] = useState<'materials' | 'studio'>('materials');
  const [previewLevelId, setPreviewLevelId] = useState<string>('p1');
  const [previewTierFilter, setPreviewTierFilter] = useState<'ALL' | TierId>('ALL');
  const [previewStars, setPreviewStars] = useState<Record<string, 1 | 2 | 3>>({});

  const previewLevel = getLevelById(previewLevelId) || LEVELS[0];
  const previewPrevLevel = LEVELS.find((l) => l.order === previewLevel.order - 1);
  const previewNextLevel = LEVELS.find((l) => l.order === previewLevel.order + 1);

  const openSampleCertificate = (tierId: TierId) => {
    const tierMeta = getTierMeta(tierId);
    setPreviewCert({
      id: `preview_cert_${tierId}`,
      certificateNo: `CS-2026-${tierId.slice(0, 3).toUpperCase()}-DEMO`,
      studentId: 'admin_preview',
      studentName: `${session.name} (Contoh Sertifikat)`,
      tierId,
      tierName: tierMeta.certificateTitle,
      instructorName: 'Admin CodeSpark (Pak GuruAI)',
      instructorUid: 'admin',
      ownerUid: 'admin',
      issuedAt: new Date().toISOString(),
    });
  };

  const openLevelInPreviewStudio = (levelId: string) => {
    soundEngine.playButtonClick();
    setPreviewLevelId(levelId);
    setActiveTab('preview');
    setPreviewView('studio');
    setDrawerOpen(false);
  };

  // ==================== ANALYTICS DATA ====================

  // 1. Bar Chart: Progress per Tier (Pemula, Menengah, Lanjutan)
  const tierBarData = useMemo(() => {
    return TIERS.map((tier) => {
      const tierProg = store.progress.filter((p) => p.tier === tier.id);
      const uniqueStudents = new Set(tierProg.map((p) => p.studentId)).size;
      const tierCerts = store.certificates.filter((c) => c.tierId === tier.id).length;
      return {
        name: tier.shortName,
        penyelesaianLevel: tierProg.length,
        siswaAktif: uniqueStudents,
        sertifikat: tierCerts,
      };
    });
  }, [store.progress, store.certificates]);

  // 2. Pie / Donut Chart: Student Distribution by Instructor / Class
  const instructorPieData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const stu of store.students) {
      const key = stu.instructorName || 'Admin CodeSpark';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const entries = Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
    return entries.length > 0 ? entries : [{ name: 'Belum ada siswa', value: 1 }];
  }, [store.students]);

  const certRatioData = useMemo(() => {
    const withCert = new Set(store.certificates.map((c) => c.studentId)).size;
    const withoutCert = Math.max(0, store.students.length - withCert);
    if (store.students.length === 0) {
      return [{ name: 'Belum ada data', value: 1 }];
    }
    return [
      { name: 'Sudah Raih Sertifikat', value: withCert },
      { name: 'Sedang Belajar', value: withoutCert },
    ];
  }, [store.students.length, store.certificates]);

  // 3. Area Chart: Completion & Star Trend across Levels L1..L9
  const trendAreaData = useMemo(() => {
    return LEVELS.map((lvl) => {
      const lvlProg = store.progress.filter((p) => p.levelId === lvl.id);
      const stars = lvlProg.reduce((sum, p) => sum + p.stars, 0);
      return {
        level: `L${lvl.order}`,
        penyelesaian: lvlProg.length,
        bintang: stars,
      };
    });
  }, [store.progress]);

  // Filter options for students table
  const instructorFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    map.set('admin', 'Admin CodeSpark');
    for (const inst of store.instructors) {
      map.set(inst.id, inst.name);
    }
    for (const stu of store.students) {
      if (!map.has(stu.instructorId)) {
        map.set(stu.instructorId, stu.instructorName);
      }
    }
    return Array.from(map.entries());
  }, [store.instructors, store.students]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return store.students.filter((stu) => {
      const matchQuery =
        !q ||
        stu.name.toLowerCase().includes(q) ||
        stu.username.toLowerCase().includes(q) ||
        stu.className.toLowerCase().includes(q) ||
        stu.accessCode.toLowerCase().includes(q);
      const matchInst =
        filterInstructor === 'ALL' || stu.instructorId === filterInstructor;
      return matchQuery && matchInst;
    });
  }, [store.students, searchQuery, filterInstructor]);

  // ==================== HANDLERS ====================

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setInstError(null);
    setInstSuccess(null);
    setInstLoading(true);
    try {
      const created = await dataEngine.createInstructor({
        name: instName,
        username: instUsername,
        password: instPassword,
        specialty: instSpecialty,
      });
      setInstSuccess(
        `Instruktur "${created.name}" (@${created.username}) berhasil ditambahkan dan siap login!`
      );
      setInstName('');
      setInstUsername('');
      setInstPassword('');
      setInstSpecialty('');
    } catch (err) {
      setInstError(err instanceof Error ? err.message : 'Gagal menambah instruktur.');
    } finally {
      setInstLoading(false);
    }
  };

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    setCodeSuccess(null);
    setCodeLoading(true);
    try {
      const created = await dataEngine.createAccessCode({
        code: codeValue,
        className: codeClassName,
        createdByRole: 'admin',
        createdById: 'admin',
        createdByName: 'Admin CodeSpark',
        isTrial: codeIsTrial,
      });
      setCodeSuccess(
        `Kode akses "${created.code}" (${created.isTrial ? 'Uji Coba Level 1' : 'Akses Penuh L1–L9'}) untuk kelas "${created.className}" aktif!`
      );
      setCodeClassName('');
      setCodeIsTrial(false);
      setCodeValue(generateAccessCode('SPARK'));
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Gagal membuat kode akses.');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    setSettingsLoading(true);
    try {
      await dataEngine.saveAppSettings({
        adminPhone,
        adminContactName,
        upgradeMessage,
      });
      setSettingsSuccess(
        'Pengaturan kontak Admin berhasil disimpan! Nomor HP kini tampil langsung di layar siswa uji coba.'
      );
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const navItems: { id: AdminTab; label: string; shortLabel: string; icon: typeof BarChart3 }[] = [
    { id: 'analytics', label: 'Analitik Realtime', shortLabel: 'Analitik', icon: BarChart3 },
    { id: 'instructors', label: `Instruktur (${store.instructors.length})`, shortLabel: 'Instruktur', icon: Users },
    { id: 'codes', label: `Kode Akses (${store.accessCodes.length})`, shortLabel: 'Kode', icon: KeyRound },
    { id: 'students', label: `Semua Siswa (${store.students.length})`, shortLabel: 'Siswa', icon: GraduationCap },
    { id: 'preview', label: 'Materi & Studio (L1–L9)', shortLabel: 'Studio', icon: Gamepad2 },
    { id: 'settings', label: 'Pengaturan', shortLabel: 'Setting', icon: Settings },
  ];

  const isFullscreenStudioPreview = activeTab === 'preview' && previewView === 'studio';

  return (
    <div className={`min-h-screen flex flex-col ${isFullscreenStudioPreview ? 'bg-[#333840]' : 'bg-[#FFFDF7]'}`}>
      {/* Header */}
      <header className="no-print sticky top-0 z-30 bg-[#FFFDF7] border-b-[3px] border-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="lg:hidden neo-btn bg-[#C084FC] p-2 cursor-pointer"
              aria-label="Menu admin"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 font-display text-lg sm:text-xl font-extrabold shrink-0">
              <span className="w-8 h-8 bg-[#C084FC] border-2 border-black flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span>CodeSpark</span>
            </div>
            <span className="hidden md:inline text-xs font-bold text-neutral-700 border-l-2 border-black pl-3 truncate">
              Panel Administrator · {session.name}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                if (activeTab === 'preview' && previewView === 'studio') {
                  setPreviewView('materials');
                } else {
                  setActiveTab('preview');
                  setPreviewView('studio');
                }
              }}
              className={`neo-btn px-3 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview' ? 'bg-[#FFE600]' : 'bg-[#4ADE80]'
              }`}
            >
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {isFullscreenStudioPreview ? 'Daftar Materi' : 'Studio Peserta (L1–L9)'}
              </span>
              <span className="sm:hidden">Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.stopBgm();
                onLogout();
              }}
              className="neo-btn bg-[#FB7185] px-3.5 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Drawer */}
      {drawerOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-72 h-full bg-white border-r-[3px] border-black p-5 flex flex-col justify-between text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-lg">Menu Admin</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="neo-btn bg-white p-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
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
                        setActiveTab(item.id);
                        if (item.id === 'preview') setPreviewView('materials');
                        setDrawerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-2 border-black font-extrabold text-sm flex items-center gap-2.5 cursor-pointer ${
                        active ? 'bg-[#C084FC]' : 'bg-white'
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

      {isFullscreenStudioPreview ? (
        /* FULLSCREEN UNLOCKED STUDENT STUDIO PREVIEW FOR ADMIN */
        <div className="no-print flex-1 flex flex-col pb-14 lg:pb-0">
          {/* Admin Studio Preview Control Ribbon */}
          <div className="bg-[#23272F] text-white border-b-2 border-black px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setPreviewView('materials');
                }}
                className="px-3 py-1.5 rounded bg-[#3A414E] hover:bg-[#4B5465] border border-white/20 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Semua Materi
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('analytics');
                }}
                className="px-3 py-1.5 rounded bg-[#C084FC] text-black border border-black text-xs font-extrabold cursor-pointer"
              >
                Dashboard Admin
              </button>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFE600] text-black text-[11px] font-extrabold">
                <Unlock className="w-3.5 h-3.5" />
                Mode Pratinjau Admin · Semua 9 Level Terbuka
              </span>
            </div>

            {/* Instant Level 1..9 Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full">
              {LEVELS.map((lvl) => {
                const active = lvl.id === previewLevel.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setPreviewLevelId(lvl.id);
                    }}
                    title={`Level ${lvl.order}: ${lvl.title} (${lvl.tierLabel})`}
                    className={`px-2.5 py-1 rounded font-mono text-xs font-extrabold border cursor-pointer shrink-0 ${
                      active
                        ? 'bg-[#4ADE80] text-black border-black shadow'
                        : 'bg-[#3A414E] text-neutral-200 border-white/15 hover:bg-[#4D5666]'
                    }`}
                  >
                    L{lvl.order}
                  </button>
                );
              })}
            </div>
          </div>

          <CodingStudio
            level={previewLevel}
            prevLevel={previewPrevLevel}
            nextLevel={previewNextLevel}
            canGoNext={Boolean(previewNextLevel)}
            previousBestStars={previewStars[previewLevel.id] || 0}
            isTrialStudent={false}
            onBackToMap={() => setPreviewView('materials')}
            onSelectLevel={(id) => setPreviewLevelId(id)}
            onOpenCertificates={() => openSampleCertificate(previewLevel.tier)}
            onOpenModule={(tier) => setModuleModalTier(tier)}
            onLevelComplete={async ({ levelId, stars }) => {
              setPreviewStars((prev) => ({
                ...prev,
                [levelId]: Math.max(prev[levelId] || 0, stars) as 1 | 2 | 3,
              }));
              return { newCertificate: null };
            }}
          />
        </div>
      ) : (
      <div className="no-print flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r-[3px] border-black bg-white p-5 flex-col justify-between">
          <div className="space-y-6">
            <div className="p-4 bg-[#C084FC]/30 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
              <div className="text-xs font-bold text-neutral-700">Super Admin</div>
              <div className="font-display font-extrabold text-base">{session.name}</div>
              <div className="font-mono text-xs text-neutral-700">@{session.username}</div>
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
                        setActiveTab(item.id);
                        if (item.id === 'preview') setPreviewView('materials');
                      }}
                      className={`w-full text-left px-4 py-3 border-2 border-black font-extrabold text-sm flex items-center gap-2.5 cursor-pointer ${
                        active
                          ? 'bg-[#C084FC] shadow-[3px_3px_0px_0px_#000]'
                          : 'bg-white hover:bg-[#FFFDF7]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="text-[11px] font-bold text-neutral-600 pt-6 border-t-2 border-black/15">
              © 2026 CodeSpark · @copyright Pak GuruAI
            </div>
          </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 space-y-8 overflow-x-hidden">
          {/* 4 Realtime KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {[
              { label: 'Total Siswa', value: store.students.length, icon: GraduationCap, color: '#4ADE80' },
              { label: 'Total Instruktur', value: store.instructors.length, icon: Users, color: '#38BDF8' },
              { label: 'Level Diselesaikan', value: store.progress.length, icon: CheckCircle2, color: '#FFE600' },
              { label: 'Sertifikat Terbit', value: store.certificates.length, icon: Award, color: '#C084FC' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="neo-card bg-white p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-neutral-600">{kpi.label}</div>
                    <div className="font-display text-3xl sm:text-4xl font-extrabold mt-1 tabular-nums">
                      {kpi.value}
                    </div>
                  </div>
                  <div
                    className="w-11 h-11 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: kpi.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ANALYTICS TAB (3 Neo-Brutalism Recharts Visualizations) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6">
                {/* 1. Bar Chart: Per Tingkatan Level */}
                <div className="lg:col-span-7 neo-card bg-white p-5 sm:p-6 space-y-4">
                  <div>
                    <h2 className="font-display text-xl font-extrabold">
                      Progres Penyelesaian per Tingkatan Level
                    </h2>
                    <p className="text-xs text-neutral-600">
                      Perbandingan siswa aktif, level tuntas, dan sertifikat pada Pemula, Menengah, dan Lanjutan.
                    </p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tierBarData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D4D4D4" />
                        <XAxis dataKey="name" tick={{ fill: '#000', fontSize: 12, fontWeight: 700 }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 700 }} />
                        <Tooltip
                          contentStyle={{
                            border: '2px solid #000',
                            boxShadow: '3px 3px 0px #000',
                            backgroundColor: '#FFFDF7',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                        <Bar
                          dataKey="siswaAktif"
                          name="Siswa Aktif"
                          fill="#38BDF8"
                          stroke="#000"
                          strokeWidth={2}
                        />
                        <Bar
                          dataKey="penyelesaianLevel"
                          name="Level Selesai"
                          fill="#4ADE80"
                          stroke="#000"
                          strokeWidth={2}
                        />
                        <Bar
                          dataKey="sertifikat"
                          name="Sertifikat"
                          fill="#FFE600"
                          stroke="#000"
                          strokeWidth={2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Donut Chart: Distribusi Siswa per Instruktur & Rasio Sertifikat */}
                <div className="lg:col-span-5 neo-card bg-white p-5 sm:p-6 space-y-4">
                  <div>
                    <h2 className="font-display text-xl font-extrabold">
                      Distribusi Siswa &amp; Rasio Sertifikat
                    </h2>
                    <p className="text-xs text-neutral-600">
                      Sebaran siswa berdasarkan instruktur pembimbing serta proporsi peraih sertifikat.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="h-56">
                      <div className="text-xs font-extrabold text-center mb-1">Per Instruktur</div>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={instructorPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={66}
                            stroke="#000"
                            strokeWidth={2}
                          >
                            {instructorPieData.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              border: '2px solid #000',
                              boxShadow: '3px 3px 0px #000',
                              backgroundColor: '#FFFDF7',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-56">
                      <div className="text-xs font-extrabold text-center mb-1">Rasio Sertifikat</div>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={certRatioData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={66}
                            stroke="#000"
                            strokeWidth={2}
                          >
                            <Cell fill="#4ADE80" />
                            <Cell fill="#FFE600" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              border: '2px solid #000',
                              boxShadow: '3px 3px 0px #000',
                              backgroundColor: '#FFFDF7',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Area Chart: Tren Penyelesaian Level & Perolehan Bintang */}
              <div className="neo-card bg-white p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold">
                    Tren Penyelesaian &amp; Perolehan Bintang (Level 1 – Level 9)
                  </h2>
                  <p className="text-xs text-neutral-600">
                    Grafik pergerakan pencapaian siswa dan total bintang yang dikumpulkan dari setiap level.
                  </p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendAreaData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4D4D4" />
                      <XAxis dataKey="level" tick={{ fill: '#000', fontSize: 12, fontWeight: 700 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 700 }} />
                      <Tooltip
                        contentStyle={{
                          border: '2px solid #000',
                          boxShadow: '3px 3px 0px #000',
                          backgroundColor: '#FFFDF7',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                      <Area
                        type="monotone"
                        dataKey="bintang"
                        name="Total Bintang"
                        stroke="#000000"
                        strokeWidth={2.5}
                        fill="#FFE600"
                        fillOpacity={0.75}
                      />
                      <Area
                        type="monotone"
                        dataKey="penyelesaian"
                        name="Level Selesai"
                        stroke="#000000"
                        strokeWidth={2.5}
                        fill="#C084FC"
                        fillOpacity={0.65}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTORS MANAGEMENT TAB */}
          {activeTab === 'instructors' && (
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Add Instructor Form */}
              <form onSubmit={handleAddInstructor} className="lg:col-span-5 neo-card bg-white p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Tambah Instruktur Baru
                  </h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Instruktur dapat langsung login menggunakan username &amp; password yang dibuat di sini.
                  </p>
                </div>

                {instError && (
                  <div className="p-3 bg-[#FB7185]/30 border-2 border-black text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{instError}</span>
                  </div>
                )}
                {instSuccess && (
                  <div className="p-3 bg-[#4ADE80]/40 border-2 border-black text-xs font-bold">
                    {instSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="adm-inst-name" className="block text-sm font-bold mb-1">
                    Nama Lengkap Instruktur
                  </label>
                  <input
                    id="adm-inst-name"
                    type="text"
                    required
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    placeholder="Contoh: Ibu Dini Wijaya"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="adm-inst-user" className="block text-sm font-bold mb-1">
                      Username
                    </label>
                    <input
                      id="adm-inst-user"
                      type="text"
                      required
                      value={instUsername}
                      onChange={(e) => setInstUsername(e.target.value)}
                      placeholder="ibu_dini"
                      className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor="adm-inst-pass" className="block text-sm font-bold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="adm-inst-pass"
                        type={showInstPass ? 'text' : 'password'}
                        required
                        value={instPassword}
                        onChange={(e) => setInstPassword(e.target.value)}
                        placeholder="Min. 4 karakter"
                        className="neo-input w-full pl-3.5 pr-9 py-2.5 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInstPass((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                        aria-label="Toggle password"
                      >
                        {showInstPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="adm-inst-spec" className="block text-sm font-bold mb-1">
                    Bidang / Keterangan
                  </label>
                  <input
                    id="adm-inst-spec"
                    type="text"
                    required
                    value={instSpecialty}
                    onChange={(e) => setInstSpecialty(e.target.value)}
                    placeholder="Contoh: Python & AI untuk SMP"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={instLoading}
                  className="neo-btn bg-[#4ADE80] w-full py-3 text-sm font-extrabold cursor-pointer"
                >
                  {instLoading ? 'Menyimpan...' : 'Simpan Akun Instruktur'}
                </button>
              </form>

              {/* Instructors List */}
              <div className="lg:col-span-7 neo-card bg-white p-5 sm:p-6 space-y-4">
                <h2 className="font-display text-xl font-extrabold">
                  Daftar Instruktur Terdaftar ({store.instructors.length})
                </h2>

                {store.instructors.length === 0 ? (
                  <p className="text-sm text-neutral-600 py-8 text-center border-2 border-dashed border-black/30">
                    Belum ada instruktur ditambahkan. Buat akun instruktur pertama di samping!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {store.instructors.map((inst) => {
                      const stuCount = store.students.filter((s) => s.instructorId === inst.id).length;
                      const codeCount = store.accessCodes.filter((c) => c.createdById === inst.id).length;
                      return (
                        <div
                          key={inst.id}
                          className="p-4 bg-[#FFFDF7] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="font-display font-extrabold text-base">{inst.name}</div>
                            <div className="text-xs font-semibold text-neutral-700">
                              <span className="font-mono font-bold text-black">@{inst.username}</span> ·{' '}
                              {inst.specialty}
                            </div>
                            <div className="text-xs font-bold text-neutral-600 tabular-nums">
                              {stuCount} siswa binaan · {codeCount} kode akses · Bergabung{' '}
                              {formatShortDate(inst.createdAt)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => void dataEngine.deleteInstructor(inst.id)}
                            className="neo-btn bg-[#FB7185] px-3 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GLOBAL ACCESS CODES TAB */}
          {activeTab === 'codes' && (
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              <form onSubmit={handleAddCode} className="lg:col-span-5 neo-card bg-white p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold">Buat Kode Akses Global</h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Buat kode akses langsung atas nama Admin untuk pendaftaran kelas baru.
                  </p>
                </div>

                {codeError && (
                  <div className="p-3 bg-[#FB7185]/30 border-2 border-black text-xs font-bold">
                    {codeError}
                  </div>
                )}
                {codeSuccess && (
                  <div className="p-3 bg-[#4ADE80]/40 border-2 border-black text-xs font-bold">
                    {codeSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="adm-class-name" className="block text-sm font-bold mb-1">
                    Nama Kelas
                  </label>
                  <input
                    id="adm-class-name"
                    type="text"
                    required
                    value={codeClassName}
                    onChange={(e) => setCodeClassName(e.target.value)}
                    placeholder="Contoh: Bootcamp AI Angkatan 2"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="adm-code-val" className="block text-sm font-bold mb-1">
                    Kode Akses
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="adm-code-val"
                      type="text"
                      required
                      value={codeValue}
                      onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                      className="neo-input flex-1 px-3.5 py-2.5 text-sm font-mono font-extrabold uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setCodeValue(generateAccessCode('SPARK'))}
                      className="neo-btn bg-[#FFE600] px-3 py-2 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Shuffle className="w-4 h-4" />
                      Acak
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-bold mb-1.5">Tipe Akses Level</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCodeIsTrial(false)}
                      className={`px-3 py-2 border-2 border-black text-xs font-extrabold cursor-pointer text-left ${
                        !codeIsTrial
                          ? 'bg-[#4ADE80] shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-white text-neutral-700'
                      }`}
                    >
                      Akses Penuh (L1–L9)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeIsTrial(true)}
                      className={`px-3 py-2 border-2 border-black text-xs font-extrabold cursor-pointer text-left ${
                        codeIsTrial
                          ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-white text-neutral-700'
                      }`}
                    >
                      Uji Coba (Level 1 Saja)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={codeLoading}
                  className="neo-btn bg-[#4ADE80] w-full py-3 text-sm font-extrabold cursor-pointer"
                >
                  {codeLoading ? 'Menyimpan...' : 'Buat Kode Akses'}
                </button>
              </form>

              <div className="lg:col-span-7 neo-card bg-white p-5 sm:p-6 space-y-4">
                <h2 className="font-display text-xl font-extrabold">
                  Semua Kode Akses Global ({store.accessCodes.length})
                </h2>

                <div className="space-y-3">
                  {store.accessCodes.map((item) => {
                    const count = store.students.filter((s) => s.accessCode === item.code).length;
                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-[#FFFDF7] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="font-mono text-base font-extrabold bg-[#FFE600] px-2 py-0.5 border-2 border-black">
                              {item.code}
                            </code>
                            <span
                              className={`text-xs font-extrabold px-2 py-0.5 border border-black ${
                                item.isActive ? 'bg-[#4ADE80]' : 'bg-neutral-200'
                              }`}
                            >
                              {item.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                            <span
                              className={`text-xs font-extrabold px-2 py-0.5 border border-black ${
                                item.isTrial ? 'bg-[#FFE600]' : 'bg-[#38BDF8]'
                              }`}
                            >
                              {item.isTrial ? 'Uji Coba · L1' : 'Akses Penuh · L1–L9'}
                            </span>
                            <span className="text-xs font-bold text-neutral-600">
                              · oleh {item.createdByName} ({item.createdByRole})
                            </span>
                          </div>
                          <div className="font-bold text-sm">{item.className}</div>
                          <div className="text-xs text-neutral-600 tabular-nums">
                            {count} siswa terdaftar · {formatShortDate(item.createdAt)}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code)}
                            className="neo-btn bg-[#38BDF8] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === item.code ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copiedId === item.code ? 'Tersalin' : 'Salin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void dataEngine.toggleAccessCode(item.id, !item.isActive)}
                            className="neo-btn bg-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                          >
                            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void dataEngine.deleteAccessCode(item.id)}
                            className="neo-btn bg-[#FB7185] p-1.5 cursor-pointer"
                            title="Hapus kode akses"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ALL STUDENTS MONITORING TAB */}
          {activeTab === 'students' && (
            <div className="neo-card bg-white p-5 sm:p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold">
                    Monitoring Seluruh Siswa ({filteredStudents.length})
                  </h2>
                  <p className="text-xs text-neutral-600">
                    Cari berdasarkan nama/kelas atau saring berdasarkan instruktur pembimbing.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, kelas, kode..."
                      className="neo-input pl-9 pr-3 py-2 text-sm font-medium w-full sm:w-56"
                    />
                  </div>
                  <select
                    value={filterInstructor}
                    onChange={(e) => setFilterInstructor(e.target.value)}
                    aria-label="Filter instruktur"
                    className="neo-input px-3 py-2 text-sm font-bold bg-white cursor-pointer"
                  >
                    <option value="ALL">Semua Instruktur</option>
                    {instructorFilterOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-black/30 text-sm font-semibold text-neutral-600">
                  Tidak ada data siswa yang cocok dengan filter saat ini.
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-left border-collapse min-w-[780px]">
                    <thead>
                      <tr className="bg-[#FFE600] border-b-2 border-black text-xs font-extrabold">
                        <th className="p-3 border-r-2 border-black">Siswa</th>
                        <th className="p-3 border-r-2 border-black">Instruktur &amp; Kelas</th>
                        <th className="p-3 border-r-2 border-black">Progres Belajar</th>
                        <th className="p-3 border-r-2 border-black">Bintang</th>
                        <th className="p-3 border-r-2 border-black">Level Selesai</th>
                        <th className="p-3">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black text-sm">
                      {filteredStudents.map((stu) => {
                        const stuProg = store.progress.filter((p) => p.studentId === stu.id);
                        const stuStars = stuProg.reduce((a, b) => a + b.stars, 0);
                        const stuCerts = store.certificates.filter((c) => c.studentId === stu.id);
                        const pct = Math.round((stuProg.length / LEVELS.length) * 100);
                        const doneOrders = stuProg
                          .map((p) => LEVELS.find((l) => l.id === p.levelId)?.order)
                          .filter((n): n is number => typeof n === 'number')
                          .sort((a, b) => a - b);

                        return (
                          <tr key={stu.id} className="bg-white hover:bg-[#FFFDF7]">
                            <td className="p-3 border-r-2 border-black">
                              <div className="font-extrabold">{stu.name}</div>
                              <div className="font-mono text-xs text-neutral-600">@{stu.username}</div>
                            </td>
                            <td className="p-3 border-r-2 border-black">
                              <div className="font-bold text-xs">{stu.instructorName}</div>
                              <div className="text-xs text-neutral-600">
                                {stu.className} · <span className="font-mono">{stu.accessCode}</span>
                              </div>
                            </td>
                            <td className="p-3 border-r-2 border-black tabular-nums">
                              <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                                <span>{pct}%</span>
                                <span>
                                  {stuProg.length}/{LEVELS.length}
                                </span>
                              </div>
                              <div className="h-2.5 bg-neutral-100 border border-black w-32">
                                <div className="h-full bg-[#4ADE80]" style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                            <td className="p-3 border-r-2 border-black font-mono font-extrabold tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Star className="w-4 h-4 fill-[#FFE600] text-black" />
                                {stuStars}/{LEVELS.length * 3}
                              </span>
                            </td>
                            <td className="p-3 border-r-2 border-black font-mono text-xs font-bold">
                              {doneOrders.length > 0 ? doneOrders.map((n) => `L${n}`).join(', ') : '—'}
                            </td>
                            <td className="p-3">
                              {stuCerts.length === 0 ? (
                                <span className="text-xs text-neutral-500">Belum ada</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {stuCerts.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => setPreviewCert(c)}
                                      className="px-2 py-1 text-xs font-extrabold border-2 border-black bg-[#C084FC] inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      {c.tierId}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ADMIN SETTINGS TAB (NOMOR HP / WHATSAPP ADMIN) */}
          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleSaveSettings}
                className="lg:col-span-7 neo-card bg-white p-5 sm:p-6 space-y-5"
              >
                <div>
                  <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Pengaturan Kontak Admin &amp; Akses Uji Coba
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Siswa yang mendaftar menggunakan kode belajar uji coba (seperti{' '}
                    <code className="font-mono font-bold bg-[#FFE600]/60 px-1">BELAJAR2026</code>) hanya dapat
                    mencoba <strong>Level 1</strong>. Nomor HP / WhatsApp yang Anda simpan di sini akan muncul
                    otomatis agar siswa dapat menghubungi Admin untuk membuka Level 2–9.
                  </p>
                </div>

                {settingsError && (
                  <div className="p-3 bg-[#FB7185]/30 border-2 border-black text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{settingsError}</span>
                  </div>
                )}
                {settingsSuccess && (
                  <div className="p-3 bg-[#4ADE80]/40 border-2 border-black text-xs font-bold">
                    {settingsSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="adm-phone" className="block text-sm font-bold mb-1">
                    Nomor HP / WhatsApp Admin
                  </label>
                  <input
                    id="adm-phone"
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="Contoh: 081234567890 atau +62 812-3456-7890"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-mono font-bold"
                  />
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Format <code>08...</code> otomatis dikonversi menjadi tautan WhatsApp (<code>wa.me/62...</code>).
                  </p>
                </div>

                <div>
                  <label htmlFor="adm-contact-name" className="block text-sm font-bold mb-1">
                    Nama Kontak Admin
                  </label>
                  <input
                    id="adm-contact-name"
                    type="text"
                    required
                    value={adminContactName}
                    onChange={(e) => setAdminContactName(e.target.value)}
                    placeholder="Admin CodeSpark (Pak GuruAI)"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="adm-upgrade-msg" className="block text-sm font-bold mb-1">
                    Pesan Panduan untuk Siswa Uji Coba (Level 1)
                  </label>
                  <textarea
                    id="adm-upgrade-msg"
                    rows={4}
                    required
                    value={upgradeMessage}
                    onChange={(e) => setUpgradeMessage(e.target.value)}
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="neo-btn bg-[#4ADE80] w-full py-3 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {settingsLoading ? 'Menyimpan...' : 'Simpan Pengaturan Nomor HP Admin'}
                </button>
              </form>

              {/* Live Preview of Student Upgrade Prompt */}
              <div className="lg:col-span-5 neo-card bg-[#FFFDF7] p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Pratinjau di Layar Siswa</h3>
                  <p className="text-xs text-neutral-600">
                    Begini tampilan jendela yang muncul saat siswa uji coba ingin membuka Level 2–9:
                  </p>
                </div>

                <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wide bg-[#FFE600] px-2 py-1 border border-black inline-block">
                    Kode Belajar Uji Coba · Level 1
                  </div>
                  <p className="text-xs text-neutral-800 leading-relaxed">
                    {upgradeMessage || 'Hubungi Admin untuk membuka Level 2 hingga Level 9.'}
                  </p>
                  <div className="p-3 bg-[#FFFDF7] border-2 border-black space-y-1">
                    <div className="text-xs font-bold text-neutral-600">
                      {adminContactName || 'Admin CodeSpark'}
                    </div>
                    <div className="font-mono text-base font-extrabold">
                      {adminPhone.trim() ? adminPhone : 'Belum diatur — isi No. HP di kiri'}
                    </div>
                  </div>
                  {(() => {
                    const previewWaUrl = formatWhatsAppUrl(
                      adminPhone,
                      'Halo Admin CodeSpark, saya ingin meminta Kode Akses Kelas Penuh (Level 2–9).'
                    );
                    if (!previewWaUrl) return null;
                    return (
                      <a
                        href={previewWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neo-btn bg-[#4ADE80] w-full py-2.5 text-xs font-extrabold inline-flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Uji Tautan WhatsApp Admin
                      </a>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ALL MATERIALS & UNLOCKED STUDENT STUDIO PREVIEW TAB */}
          {activeTab === 'preview' && previewView === 'materials' && (
            <div className="space-y-6">
              <div className="neo-card bg-[#FFE600] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-0.5 text-xs font-extrabold">
                    <Unlock className="w-3.5 h-3.5" />
                    Akses Penuh Administrator · Seluruh 9 Level Terbuka
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
                    Seluruh Materi Kurikulum &amp; Studio Peserta
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900 max-w-2xl leading-relaxed">
                    Tinjau seluruh materi, misi, petunjuk karakter (Panda, Beruang, Koala), kode awal, pratinjau sertifikat, dan uji langsung
                    Coding Studio peserta dari Level 1 sampai Level 9 tanpa terkunci (tidak mengubah data siswa).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openLevelInPreviewStudio(previewLevelId)}
                  className="neo-btn bg-black text-white px-5 py-3 text-sm font-extrabold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Buka Coding Studio (L{previewLevel.order})
                </button>
              </div>

              {/* Tier Filter Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'ALL' as const, label: 'Semua Tingkatan (9 Level)' },
                  ...TIERS.map((t) => ({ id: t.id, label: `${t.number}. ${t.name} (3 Level)` })),
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPreviewTierFilter(opt.id)}
                    className={`neo-btn px-3.5 py-2 text-xs font-extrabold cursor-pointer ${
                      previewTierFilter === opt.id ? 'bg-[#C084FC]' : 'bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Tiers & Level Material Cards */}
              <div className="space-y-8">
                {TIERS.filter((t) => previewTierFilter === 'ALL' || t.id === previewTierFilter).map(
                  (tier) => {
                    const tierLevels = getLevelsByTier(tier.id);
                    return (
                      <section key={tier.id} className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b-[3px] border-black">
                          <div>
                            <h3 className="font-display text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                              <BookOpen className="w-5 h-5 shrink-0" />
                              {tier.number}. {tier.name} — {tier.subtitle}
                            </h3>
                            <p className="text-xs sm:text-sm text-neutral-700 mt-0.5">{tier.description}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playButtonClick();
                                setModuleModalTier(tier.id);
                              }}
                              className="neo-btn bg-[#38BDF8] px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-4 h-4" />
                              Modul Singkat {tier.shortName}
                            </button>
                            <button
                              type="button"
                              onClick={() => openSampleCertificate(tier.id)}
                              className="neo-btn bg-[#FFE600] px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Award className="w-4 h-4" />
                              Pratinjau Sertifikat {tier.shortName}
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {tierLevels.map((lvl) => {
                            const starterPy = blocksToCode(lvl.starterBlocks, 'python');
                            const testedStars = previewStars[lvl.id] || 0;
                            const charId = getCharacterForLevel(lvl.order);
                            const charMeta = CHARACTER_META[charId];
                            return (
                              <div
                                key={lvl.id}
                                className="neo-card bg-white p-5 flex flex-col justify-between gap-4"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className="px-2.5 py-1 border-2 border-black font-mono text-xs font-extrabold"
                                        style={{ backgroundColor: tier.accentColor }}
                                      >
                                        Level {lvl.order} · Terbuka
                                      </span>
                                      <span
                                        className="px-2 py-0.5 border-2 border-black text-[11px] font-extrabold inline-flex items-center gap-1"
                                        style={{ backgroundColor: charMeta.badgeBg }}
                                      >
                                        <MascotPortrait character={charId} className="w-5 h-5" mood="happy" />
                                        {charMeta.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0" title="Hasil uji coba Admin">
                                      {[1, 2, 3].map((s) => (
                                        <Star
                                          key={s}
                                          className={`w-4 h-4 ${
                                            s <= testedStars
                                              ? 'fill-[#FFE600] text-black'
                                              : 'text-neutral-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-display text-lg font-extrabold">{lvl.title}</h4>
                                    <p className="text-xs font-semibold text-neutral-600">{lvl.subtitle}</p>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div className="p-2.5 bg-[#FFFDF7] border border-black/30">
                                      <div className="font-extrabold text-black mb-0.5">Konsep Materi:</div>
                                      <p className="text-neutral-700 leading-relaxed">{lvl.concept}</p>
                                    </div>

                                    <div className="p-2.5 bg-[#FFFDF7] border border-black/30">
                                      <div className="font-extrabold text-black mb-0.5">Misi Peserta:</div>
                                      <p className="text-neutral-700 leading-relaxed">{lvl.mission}</p>
                                    </div>

                                    <div className="p-2.5 bg-[#38BDF8]/15 border border-black/30 flex items-start gap-1.5">
                                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
                                      <p className="text-neutral-800 leading-relaxed">
                                        <strong>Hint {charMeta.name}:</strong> {lvl.hint}
                                      </p>
                                    </div>

                                    <div className="p-2.5 bg-neutral-950 text-[#4ADE80] border-2 border-black font-mono text-[11px] overflow-x-auto">
                                      <div className="text-neutral-400 text-[10px] mb-1 flex justify-between">
                                        <span>Kode Awal (Python)</span>
                                        <span>3★ ≤ {lvl.optimalLines} baris</span>
                                      </div>
                                      <pre className="whitespace-pre-wrap">{starterPy || '# kosong'}</pre>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLevelInPreviewStudio(lvl.id)}
                                  className="neo-btn bg-[#4ADE80] w-full py-2.5 px-3 text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Play className="w-4 h-4 fill-black" />
                                  Buka Level {lvl.order} di Studio Peserta
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t-[3px] border-black grid grid-cols-6 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'preview') setPreviewView('materials');
              }}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer ${
                active ? 'bg-[#C084FC]' : 'bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-full px-0.5">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {previewCert && <CertificateView certificate={previewCert} onClose={() => setPreviewCert(null)} />}
      {moduleModalTier && (
        <ModuleGuideModal initialTier={moduleModalTier} onClose={() => setModuleModalTier(null)} />
      )}
    </div>
  );
};
