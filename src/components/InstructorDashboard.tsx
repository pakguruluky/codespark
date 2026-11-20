import React, { useState, useMemo } from 'react';
import {
  Users,
  KeyRound,
  Star,
  Award,
  LogOut,
  Sparkles,
  Copy,
  Check,
  Shuffle,
  Plus,
  Trash2,
  BarChart3,
  LayoutDashboard,
  Menu,
  X,
  Eye,
  AlertCircle,
  BookOpen,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { AppSession, CertificateRecord, DataStoreSnapshot, TierId } from '../types';
import { dataEngine, hasStudentAppMakerAccess } from '../services/dataEngine';
import { LEVELS } from '../data/levels';
import { APP_MAKER_PROJECTS } from '../data/appMakerProjects';
import { formatShortDate, generateAccessCode } from '../utils/crypto';
import { CertificateView } from './CertificateView';
import { ModuleGuideModal } from './ModuleGuideModal';

interface Props {
  session: AppSession;
  store: DataStoreSnapshot;
  onLogout: () => void;
}

type InstructorTab = 'overview' | 'codes' | 'students';

export const InstructorDashboard: React.FC<Props> = ({ session, store, onLogout }) => {
  const [activeTab, setActiveTab] = useState<InstructorTab>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Create access code form
  const [className, setClassName] = useState('');
  const [customCode, setCustomCode] = useState(() => generateAccessCode('CODE'));
  const [includeAppMaker, setIncludeAppMaker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [moduleModalTier, setModuleModalTier] = useState<TierId | null>(null);

  const myCodes = useMemo(
    () => store.accessCodes.filter((c) => c.createdById === session.id),
    [store.accessCodes, session.id]
  );

  const myStudents = useMemo(
    () => store.students.filter((s) => s.instructorId === session.id),
    [store.students, session.id]
  );

  const myStudentIds = useMemo(() => new Set(myStudents.map((s) => s.id)), [myStudents]);

  const myProgress = useMemo(
    () => store.progress.filter((p) => myStudentIds.has(p.studentId)),
    [store.progress, myStudentIds]
  );

  const myCertificates = useMemo(
    () => store.certificates.filter((c) => myStudentIds.has(c.studentId)),
    [store.certificates, myStudentIds]
  );

  const activeCodesCount = myCodes.filter((c) => c.isActive).length;
  const totalStarsAll = myProgress.reduce((sum, p) => sum + p.stars, 0);
  const avgStars =
    myStudents.length > 0 ? (totalStarsAll / myStudents.length).toFixed(1) : '0.0';

  const levelChartData = useMemo(() => {
    return LEVELS.map((lvl) => {
      const done = myProgress.filter((p) => p.levelId === lvl.id).length;
      const stars = myProgress
        .filter((p) => p.levelId === lvl.id)
        .reduce((acc, p) => acc + p.stars, 0);
      return {
        name: `L${lvl.order}`,
        title: lvl.title,
        siswaSelesai: done,
        totalBintang: stars,
      };
    });
  }, [myProgress]);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setCreating(true);
    try {
      const created = await dataEngine.createAccessCode({
        code: customCode,
        className,
        createdByRole: 'instructor',
        createdById: session.id,
        createdByName: session.name,
        includeAppMaker,
      });
      setFormSuccess(
        `Kode akses "${created.code}" untuk kelas "${created.className}"${created.includeAppMaker ? ' (+ App Maker)' : ''} berhasil dibuat!`
      );
      setClassName('');
      setIncludeAppMaker(false);
      setCustomCode(generateAccessCode('CODE'));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal membuat kode akses.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const navItems: { id: InstructorTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Ringkasan Kelas', icon: LayoutDashboard },
    { id: 'codes', label: `Kode Akses (${myCodes.length})`, icon: KeyRound },
    { id: 'students', label: `Siswa Binaan (${myStudents.length})`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col">
      {/* Top Bar */}
      <header className="no-print sticky top-0 z-30 bg-[#FFFDF7] border-b-[3px] border-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="lg:hidden neo-btn bg-[#38BDF8] p-2 cursor-pointer"
              aria-label="Menu instruktur"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 font-display text-lg sm:text-xl font-extrabold shrink-0">
              <span className="w-8 h-8 bg-[#38BDF8] border-2 border-black flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span>CodeSpark</span>
            </div>
            <span className="hidden md:inline text-xs font-bold text-neutral-700 border-l-2 border-black pl-3 truncate">
              Portal Instruktur · {session.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModuleModalTier('pemula')}
              className="neo-btn bg-[#FFE600] px-3 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Modul Materi</span>
              <span className="sm:hidden">Modul</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="neo-btn bg-[#FB7185] px-3.5 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="no-print flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r-[3px] border-black bg-white p-5 flex-col justify-between">
          <div className="space-y-6">
            <div className="p-4 bg-[#38BDF8]/25 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
              <div className="text-xs font-bold text-neutral-700">Instruktur Aktif</div>
              <div className="font-display font-extrabold text-base">{session.name}</div>
              {session.specialty && (
                <div className="text-xs font-semibold text-neutral-800">{session.specialty}</div>
              )}
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 border-2 border-black font-extrabold text-sm flex items-center gap-2.5 cursor-pointer ${
                      active
                        ? 'bg-[#38BDF8] shadow-[3px_3px_0px_0px_#000]'
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

        {/* Mobile/Tablet Drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setDrawerOpen(false)}>
            <div
              className="w-72 h-full bg-white border-r-[3px] border-black p-5 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-lg">Portal Instruktur</span>
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
                          setDrawerOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 border-2 border-black font-extrabold text-sm flex items-center gap-2.5 cursor-pointer ${
                          active ? 'bg-[#38BDF8]' : 'bg-white'
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 space-y-8 overflow-x-hidden">
          {/* KPI Row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {[
              { label: 'Siswa Binaan', value: myStudents.length, icon: Users, color: '#4ADE80' },
              { label: 'Kode Akses Aktif', value: activeCodesCount, icon: KeyRound, color: '#FFE600' },
              { label: 'Rata-rata Bintang', value: avgStars, icon: Star, color: '#38BDF8' },
              { label: 'Sertifikat Terbit', value: myCertificates.length, icon: Award, color: '#C084FC' },
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

          {/* OVERVIEW TAB: Chart + Quick Student Table */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="neo-card bg-white p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Progres Siswa Binaan per Level (Realtime)
                    </h2>
                    <p className="text-xs text-neutral-600">
                      Jumlah siswa yang telah menyelesaikan setiap level dari L1 (Pemula) hingga L9 (AI Navigator).
                    </p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
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
                      <Bar
                        dataKey="siswaSelesai"
                        name="Siswa Selesai"
                        fill="#38BDF8"
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      <Bar
                        dataKey="totalBintang"
                        name="Total Bintang"
                        fill="#FFE600"
                        stroke="#000000"
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('codes')}
                  className="neo-btn bg-[#FFE600] px-5 py-3 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Buat Kode Akses Kelas Baru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className="neo-btn bg-white px-5 py-3 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Lihat Semua Siswa Binaan
                </button>
              </div>
            </div>
          )}

          {/* ACCESS CODES TAB */}
          {activeTab === 'codes' && (
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Create Code Form */}
              <form onSubmit={handleCreateCode} className="lg:col-span-5 neo-card bg-white p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold">Buat Kode Akses Baru</h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Bagikan kode akses ini kepada siswa agar otomatis bergabung ke kelas binaan Anda.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-[#FB7185]/30 border-2 border-black text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-[#4ADE80]/40 border-2 border-black text-xs font-bold">
                    {formSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="inst-class" className="block text-sm font-bold mb-1">
                    Nama Kelas
                  </label>
                  <input
                    id="inst-class"
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Contoh: Kelas 8A Robotika & AI"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="inst-code" className="block text-sm font-bold mb-1">
                    Kode Akses (Acak / Custom)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="inst-code"
                      type="text"
                      required
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="CODE-7X9A"
                      className="neo-input flex-1 px-3.5 py-2.5 text-sm font-mono font-extrabold uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCode(generateAccessCode('CODE'))}
                      className="neo-btn bg-[#FFE600] px-3 py-2 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shrink-0"
                      title="Acak kode baru"
                    >
                      <Shuffle className="w-4 h-4" />
                      Acak
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIncludeAppMaker((v) => !v)}
                  className={`w-full p-3 border-2 border-black text-left flex items-start gap-2.5 cursor-pointer ${
                    includeAppMaker
                      ? 'bg-[#C084FC]/30 shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white'
                  }`}
                >
                  <span
                    className={`w-5 h-5 mt-0.5 border-2 border-black flex items-center justify-center shrink-0 ${
                      includeAppMaker ? 'bg-[#C084FC]' : 'bg-white'
                    }`}
                  >
                    {includeAppMaker && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Sertakan Akses Program App Maker (5 Proyek)
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Siswa yang memakai kode ini otomatis mendapat akses 5 proyek App Maker bertahap.
                    </p>
                  </div>
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="neo-btn bg-[#4ADE80] w-full py-3 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {creating ? 'Menyimpan...' : 'Simpan Kode Akses'}
                </button>
              </form>

              {/* Access Codes List */}
              <div className="lg:col-span-7 neo-card bg-white p-5 sm:p-6 space-y-4">
                <h2 className="font-display text-xl font-extrabold">Daftar Kode Akses Saya</h2>
                {myCodes.length === 0 ? (
                  <p className="text-sm text-neutral-600 py-8 text-center border-2 border-dashed border-black/30">
                    Belum ada kode akses dibuat. Buat kode pertama Anda di formulir sebelah!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myCodes.map((item) => {
                      const joinedCount = myStudents.filter((s) => s.accessCode === item.code).length;
                      return (
                        <div
                          key={item.id}
                          className="p-4 bg-[#FFFDF7] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
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
                              {item.includeAppMaker && (
                                <span className="text-xs font-extrabold px-2 py-0.5 border border-black bg-[#C084FC]">
                                  + App Maker
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-sm truncate">{item.className}</div>
                            <div className="text-xs text-neutral-600 tabular-nums">
                              {joinedCount} siswa bergabung · Dibuat {formatShortDate(item.createdAt)}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.code)}
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
                )}
              </div>
            </div>
          )}

          {/* STUDENTS MONITORING TAB */}
          {activeTab === 'students' && (
            <div className="neo-card bg-white p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-extrabold">Monitoring Siswa Binaan (Realtime)</h2>
                <p className="text-xs text-neutral-600">
                  Seluruh progres bintang, level selesai, dan sertifikat siswa yang mendaftar memakai kode akses Anda.
                </p>
              </div>

              {myStudents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-black/30 space-y-2">
                  <p className="font-bold text-sm">Belum ada siswa yang bergabung di kelas Anda.</p>
                  <p className="text-xs text-neutral-600">
                    Buat kode akses di tab "Kode Akses" dan bagikan kepada siswa Anda.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-left border-collapse min-w-[680px]">
                    <thead>
                      <tr className="bg-[#FFE600] border-b-2 border-black text-xs font-extrabold">
                        <th className="p-3 border-r-2 border-black">Nama Siswa</th>
                        <th className="p-3 border-r-2 border-black">Kelas &amp; Kode</th>
                        <th className="p-3 border-r-2 border-black">Progres Level</th>
                        <th className="p-3 border-r-2 border-black">Total Bintang</th>
                        <th className="p-3">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black text-sm">
                      {myStudents.map((stu) => {
                        const stuAllProg = myProgress.filter((p) => p.studentId === stu.id);
                        const stuProg = stuAllProg.filter((p) => p.tier !== 'app_maker');
                        const stuAppProg = stuAllProg.filter((p) => p.tier === 'app_maker');
                        const stuStars = stuProg.reduce((a, b) => a + b.stars, 0);
                        const stuCerts = myCertificates.filter((c) => c.studentId === stu.id);
                        const pct = Math.round((stuProg.length / LEVELS.length) * 100);
                        const hasApp = hasStudentAppMakerAccess(stu, store.accessCodes);

                        return (
                          <tr key={stu.id} className="bg-white hover:bg-[#FFFDF7]">
                            <td className="p-3 border-r-2 border-black">
                              <div className="font-extrabold">{stu.name}</div>
                              <div className="font-mono text-xs text-neutral-600">@{stu.username}</div>
                            </td>
                            <td className="p-3 border-r-2 border-black">
                              <div className="font-bold text-xs">{stu.className}</div>
                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                <code className="font-mono text-xs text-neutral-600">{stu.accessCode}</code>
                                {hasApp && (
                                  <span className="px-1.5 py-0.5 bg-[#C084FC] border border-black text-[10px] font-extrabold">
                                    App Maker {stuAppProg.length}/{APP_MAKER_PROJECTS.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 border-r-2 border-black tabular-nums">
                              <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                                <span>
                                  {stuProg.length}/{LEVELS.length} Level
                                </span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-2.5 bg-neutral-100 border border-black w-36">
                                <div className="h-full bg-[#4ADE80]" style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                            <td className="p-3 border-r-2 border-black font-mono font-extrabold tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Star className="w-4 h-4 fill-[#FFE600] text-black" />
                                {stuStars}/{LEVELS.length * 3}
                              </span>
                            </td>
                            <td className="p-3">
                              {stuCerts.length === 0 ? (
                                <span className="text-xs text-neutral-500 font-semibold">Belum terbit</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {stuCerts.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => setPreviewCert(c)}
                                      className={`px-2 py-1 text-xs font-extrabold border-2 border-black inline-flex items-center gap-1 cursor-pointer ${
                                        c.tierId === 'app_maker' ? 'bg-[#FB7185]' : 'bg-[#C084FC]'
                                      }`}
                                    >
                                      <Eye className="w-3 h-3" />
                                      {c.tierId === 'app_maker' ? 'App Maker' : c.tierId}
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
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t-[3px] border-black grid grid-cols-3 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold cursor-pointer ${
                active ? 'bg-[#38BDF8]' : 'bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-full px-1">{item.label}</span>
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
