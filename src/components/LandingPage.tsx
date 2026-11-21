import React, { useState } from 'react';
import {
  Code2,
  Gamepad2,
  Award,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Layers,
  Cpu,
  Presentation,
  FlaskConical,
  ClipboardCheck,
  Camera,
  Users,
  ShieldCheck,
  GraduationCap,
  Maximize2,
} from 'lucide-react';
import type { TierId } from '../types';
import { TIERS } from '../data/levels';
import { APP_MAKER_PROJECTS } from '../data/appMakerProjects';
import { GAME_MAKER_PROJECTS } from '../data/gameMakerProjects';
import { AI_ML_PROJECTS } from '../data/aiMlProjects';
import {
  CHARACTER_META,
  MascotPortrait,
  type CharacterId,
} from './PandaMascot';
import { ModuleGuideModal } from './ModuleGuideModal';
import { soundEngine } from '../engine/soundEngine';

interface Props {
  onGoLogin: (defaultRole?: 'student' | 'instructor' | 'admin') => void;
  onGoRegister: () => void;
}

const DEMO_CHARACTERS: CharacterId[] = ['panda', 'bear', 'koala'];
const HERO_STUDIO_IMAGE = '/assets/aistudio/image_25530e88.png';

export const LandingPage: React.FC<Props> = ({ onGoLogin, onGoRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [moduleModalTier, setModuleModalTier] = useState<TierId | null>(null);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);

  const handleCopyTrialCode = () => {
    soundEngine.playButtonClick();
    navigator.clipboard?.writeText('BELAJAR2026');
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-black">
      {/* TOP BAR CONTRACT: 3 Zones (Wordmark — 4 Single-line Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7] border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </span>
            <span>CodeSpark</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
            <a href="#program" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Program
            </a>
            <a href="#media" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Media Belajar
            </a>
            <a href="#kurikulum" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Kurikulum
            </a>
            <a href="#ekosistem" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Untuk Sekolah
            </a>
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onGoLogin('student');
              }}
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk
            </button>
          </nav>

          <div className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onGoRegister();
              }}
              className="neo-btn bg-[#FFE600] px-4 py-2 text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Daftar Siswa
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden neo-btn bg-[#FFE600] p-2 cursor-pointer"
            aria-label="Menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF7] border-t-2 border-black px-4 py-4 space-y-3">
            <div className="flex flex-col gap-1.5 text-sm font-bold">
              <a href="#program" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                4 Program Belajar
              </a>
              <a href="#media" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Media Belajar Interaktif
              </a>
              <a href="#kurikulum" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Kurikulum &amp; Modul PDF
              </a>
              <a href="#ekosistem" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Portal Siswa, Instruktur &amp; Admin
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoLogin('student');
                }}
                className="neo-btn bg-white py-2.5 text-sm font-bold cursor-pointer"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoRegister();
                }}
                className="neo-btn bg-[#FFE600] py-2.5 text-sm font-extrabold cursor-pointer"
              >
                Daftar Siswa
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* 1. HERO SECTION — PROPOSITION + ACTUAL CODING STUDIO SCREENSHOT */}
        <section className="neo-grid-bg border-b-[3px] border-black py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-10 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700">
                <span>Coding Studio</span>
                <span aria-hidden="true">·</span>
                <span>micro:bit Lab</span>
                <span aria-hidden="true">·</span>
                <span>Game Maker</span>
                <span aria-hidden="true">·</span>
                <span>AI-ML Vision</span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.1rem] font-extrabold leading-[1.08] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Platform Belajar Coding, Game, micro:bit &amp;{' '}
                <span className="bg-[#FFE600] px-2 border-2 border-black inline-block">
                  AI Interaktif
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-800 leading-relaxed max-w-xl">
                Belajar pemrograman dari blok visual hingga Python dan JavaScript di studio pulau
                isometrik bergaya Codementum lengkap dengan penggaris jarak, debugger per langkah,
                slide interaktif, hingga lab proyek mikrokontroler micro:bit, game, dan kamera AI realtime.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoRegister();
                  }}
                  className="neo-btn bg-[#4ADE80] px-6 py-3.5 text-sm sm:text-base font-extrabold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  Mulai Belajar Gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoLogin('student');
                  }}
                  className="neo-btn bg-white px-5 py-3.5 text-sm sm:text-base font-bold cursor-pointer whitespace-nowrap"
                >
                  Masuk ke Kelas
                </button>
              </div>

              {/* Clean Unboxed Quantitative Proof Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-bold text-neutral-800 border-t-2 border-black/15 tabular-nums">
                <span>9 Misi Studio</span>
                <span aria-hidden="true">·</span>
                <span>5 Proyek micro:bit</span>
                <span aria-hidden="true">·</span>
                <span>5 Game Maker</span>
                <span aria-hidden="true">·</span>
                <span>2 Lab AI-ML</span>
                <span aria-hidden="true">·</span>
                <span>6 Unit Media &amp; Modul</span>
              </div>
            </div>

            {/* Uploaded Actual Application Screenshot Showcase */}
            <div className="lg:col-span-7">
              <div className="neo-card bg-[#23272F] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#1D2129] border-b-2 border-black flex items-center justify-between gap-3 text-white">
                  <span className="text-xs font-extrabold truncate">
                    CodeSpark Coding Studio · Blocks, Python &amp; JavaScript
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setPreviewZoomOpen(true);
                    }}
                    className="px-2.5 py-1 rounded bg-[#3A414E] hover:bg-[#4B5465] text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    title="Perbesar tampilan layar Coding Studio"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Perbesar</span>
                  </button>
                </div>

                {heroImgError ? (
                  <div className="aspect-[16/9] bg-[#2C313A] flex flex-col items-center justify-center p-8 text-center text-white space-y-2">
                    <Code2 className="w-10 h-10 text-[#FFE600]" />
                    <div className="font-display font-extrabold text-lg">
                      CodeSpark Coding Studio
                    </div>
                    <p className="text-xs text-neutral-300">
                      Workspace blok visual, Python, JavaScript, dan pulau isometrik interaktif.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setPreviewZoomOpen(true);
                    }}
                    className="block w-full bg-[#2C313A] cursor-zoom-in focus:outline-none group"
                    aria-label="Perbesar pratinjau tampilan aplikasi CodeSpark"
                  >
                    <img
                      src={HERO_STUDIO_IMAGE}
                      alt="Tampilan nyata aplikasi CodeSpark Coding Studio dengan blok perintah repeat dan if path_clear, sinkronisasi Python, tombol debugger, penggaris jarak, dan pulau isometrik Panda"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="w-full h-auto block transition-transform duration-200 group-hover:scale-[1.01]"
                    />
                  </button>
                )}

                <div className="px-4 py-2.5 bg-[#FFFDF7] border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-neutral-800">
                  <span>
                    Tampilan nyata ruang belajar: blok drag-and-drop, Live Python, Step 1× &amp; Penggaris Jarak.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoRegister();
                    }}
                    className="underline font-extrabold hover:text-neutral-600 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Coba Studio Langsung →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 4 PROGRAM BELAJAR LENGKAP — ASYMMETRIC BENTO SHOWCASE */}
        <section id="program" className="py-16 sm:py-20 border-b-[3px] border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                Empat Jalur Pembelajaran Terpadu
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Dari Logika Dasar hingga micro:bit, Game Arcade, dan Kamera AI Realtime
              </h2>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                Setiap siswa wajib menyelesaikan Coding Studio sebagai pondasi, dan dapat membuka
                program lanjutan micro:bit Lab, Game Maker, serta AI-ML Vision melalui kode akses atau aktivasi Admin.
              </p>
            </div>

            {/* Row 1: Coding Studio (7 cols) + AI-ML Vision (5 cols) */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* 01. Coding Studio */}
              <div className="lg:col-span-7 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#4ADE80] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                        <Code2 className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-600">
                          01. Program Wajib · 9 Level Bertingkat
                        </div>
                        <h3 className="font-display text-2xl font-extrabold">Coding Studio Isometrik</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Susun blok puzzle dengan drag-and-drop atau ketik langsung di editor Python dan
                    JavaScript. Dilengkapi <strong>Penggaris Jarak</strong> untuk mengukur langkah,{' '}
                    <strong>Step-by-Step Debugger</strong>, sorotan blok aktif, narasi suara Bahasa
                    Indonesia, dan 3 karakter petualang yang berganti di setiap stage.
                  </p>

                  {/* 3 Stage Characters Strip */}
                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    {DEMO_CHARACTERS.map((cid, i) => {
                      const meta = CHARACTER_META[cid];
                      return (
                        <div
                          key={cid}
                          className="p-3 bg-white border-2 border-black flex items-center gap-2.5"
                        >
                          <MascotPortrait character={cid} className="w-10 h-10 shrink-0" mood="happy" />
                          <div className="min-w-0">
                            <div className="font-display font-extrabold text-sm">{meta.name}</div>
                            <div className="text-[11px] text-neutral-600 truncate">
                              Stage {i + 1}, {i + 4}, {i + 7}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black/15 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                  <span className="text-neutral-700">
                    Blocks · Python (.py) · JavaScript (.js) · Sertifikat Otomatis
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoRegister();
                    }}
                    className="underline hover:text-neutral-600 cursor-pointer whitespace-nowrap"
                  >
                    Coba Level 1 Gratis →
                  </button>
                </div>
              </div>

              {/* 02. AI-ML Vision */}
              <div className="lg:col-span-5 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#FDBA74] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <Cpu className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        02. Program Pilihan · 2 Lab Vision
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">AI-ML Vision Kamera</h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Eksperimen Computer Vision langsung dari kamera perangkat asli dengan performa
                    realtime menggunakan MediaPipe Face Landmarker.
                  </p>

                  <div className="space-y-2.5">
                    {AI_ML_PROJECTS.map((proj) => (
                      <div key={proj.id} className="p-3 bg-white border-2 border-black space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-extrabold text-sm">{proj.title}</span>
                          <span className="font-mono text-[11px] font-bold text-neutral-600">
                            {proj.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 leading-snug">{proj.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black/15 flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-black shrink-0" />
                    Kamera Live · Unggah Foto · Sampel
                  </span>
                  <span>Bertahap</span>
                </div>
              </div>
            </div>

            {/* Row 2: App Maker (6 cols) + Game Maker (6 cols) */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* 03. App Maker */}
              <div className="lg:col-span-6 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#C084FC] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        03. Program Pilihan · 5 Proyek Hardware
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">MakeCode micro:bit Lab</h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Program papan mikrokontroler BBC micro:bit v2 dengan Blocks, JavaScript &amp; Python:
                    LED 5×5, tombol A/B, akselerometer, speaker piezo, sensor suhu/cahaya, hingga Radio.
                  </p>

                  <ol className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    {APP_MAKER_PROJECTS.map((proj) => (
                      <li
                        key={proj.id}
                        className="p-2.5 bg-white border-2 border-black flex items-start gap-2"
                      >
                        <span className="font-mono font-extrabold text-neutral-500 tabular-nums">
                          0{proj.order}
                        </span>
                        <div>
                          <div className="font-display font-extrabold text-sm leading-tight">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                            {proj.subtitle}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-3 border-t-2 border-black/15 text-xs font-bold text-neutral-700">
                  Simulator micro:bit v2 · Blocks / JS / Python · Sertifikat micro:bit
                </div>
              </div>

              {/* 04. Game Maker */}
              <div className="lg:col-span-6 neo-card bg-[#FFFDF7] p-6 sm:p-7 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#38BDF8] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-600">
                        04. Program Pilihan · 5 Game Bertahap
                      </div>
                      <h3 className="font-display text-2xl font-extrabold">Game Maker Lab</h3>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">
                    Rancang dan mainkan lima game logika hingga arcade langsung di browser dengan
                    sistem skor, nyawa, dan tantangan bertahap.
                  </p>

                  <ol className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    {GAME_MAKER_PROJECTS.map((proj) => (
                      <li
                        key={proj.id}
                        className="p-2.5 bg-white border-2 border-black flex items-start gap-2"
                      >
                        <span className="font-mono font-extrabold text-neutral-500 tabular-nums">
                          0{proj.order}
                        </span>
                        <div>
                          <div className="font-display font-extrabold text-sm leading-tight">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                            {proj.subtitle}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-3 border-t-2 border-black/15 text-xs font-bold text-neutral-700">
                  Logika game · Event &amp; skor realtime · Sertifikat Game Maker
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PUSAT MEDIA BELAJAR INTERAKTIF (ALA CODEMENTUM) */}
        <section id="media" className="py-16 sm:py-20 border-b-[3px] border-black bg-[#FFFDF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs sm:text-sm font-bold text-neutral-600">
                  Pusat Media Belajar Interaktif · 6 Unit Kurikulum
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Pahami Konsep Dulu Sebelum Menulis Kode
                </h2>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                  Setiap unit dilengkapi empat media belajar terstruktur agar siswa benar-benar
                  memahami logika pemrograman, bukan sekadar menghafal sintaks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setModuleModalTier('pemula');
                }}
                className="neo-btn bg-[#38BDF8] px-4 py-2.5 text-sm font-extrabold inline-flex items-center gap-2 self-start lg:self-auto cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                Pratinjau Modul PDF
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: '01',
                  title: 'Slide Konsep Animasi',
                  desc: 'Visualisasi urutan langkah, kompas belok, loop, sensor if/else, hingga pipeline AI lengkap dengan narasi suara Bahasa Indonesia.',
                  color: '#FFE600',
                  icon: Presentation,
                },
                {
                  num: '02',
                  title: 'Lab Mini Perintah',
                  desc: 'Papan latihan cepat 5×3 untuk mencoba blok forward dan turn sambil melihat perubahan kode Python & JavaScript secara langsung.',
                  color: '#4ADE80',
                  icon: FlaskConical,
                },
                {
                  num: '03',
                  title: 'Kuis Pemahaman 3★',
                  desc: 'Evaluasi pilihan ganda interaktif per unit dengan pembahasan instan untuk menguji pemahaman sebelum masuk ke tantangan utama.',
                  color: '#C084FC',
                  icon: ClipboardCheck,
                },
                {
                  num: '04',
                  title: 'Modul Singkat PDF',
                  desc: 'Ringkasan materi 3 halaman bergaya buku kerja yang rapi dan siap cetak PDF untuk pendampingan di kelas maupun di rumah.',
                  color: '#38BDF8',
                  icon: BookOpen,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className="neo-card bg-white p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-11 h-11 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-mono text-sm font-extrabold text-neutral-500 tabular-nums">
                          {item.num}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-extrabold">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. KURIKULUM 3 TINGKATAN STUDIO + PRATINJAU MODUL LANGSUNG */}
        <section id="kurikulum" className="py-16 sm:py-20 border-b-[3px] border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                Jalur Petualangan Coding Studio
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Tiga Tingkatan Terstruktur dari Nol hingga AI Navigator
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <div key={tier.id} className="neo-card bg-[#FFFDF7] flex flex-col justify-between">
                  <div>
                    <div
                      className="px-5 py-4 border-b-[3px] border-black flex items-center justify-between gap-2"
                      style={{ backgroundColor: tier.accentColor }}
                    >
                      <span className="font-display font-extrabold text-lg">
                        {tier.number}. {tier.name}
                      </span>
                      <span className="font-mono text-xs font-extrabold">{tier.badgeText}</span>
                    </div>
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-display text-xl font-extrabold">{tier.subtitle}</h3>
                      <p className="text-sm text-neutral-700 leading-relaxed">{tier.description}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2">
                    <div className="border-t-2 border-black/15 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          setModuleModalTier(tier.id);
                        }}
                        className="neo-btn bg-white hover:bg-[#FFE600] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Baca Modul PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          onGoRegister();
                        }}
                        className="underline hover:text-neutral-600 cursor-pointer"
                      >
                        Ikuti Kelas →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. EKOSISTEM 3 PERAN REALTIME (SISWA, INSTRUKTUR, ADMIN) */}
        <section id="ekosistem" className="py-16 sm:py-20 border-b-[3px] border-black bg-[#FFFDF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                Terhubung Realtime dengan Cloud Database
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Satu Ekosistem untuk Siswa, Instruktur, dan Administrator
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  role: 'Siswa',
                  accent: '#4ADE80',
                  icon: GraduationCap,
                  points: [
                    'Peta kursus & pulau petualangan interaktif lengkap dengan perolehan 3 bintang.',
                    'Akses Media Belajar, Modul PDF, Coding Studio, serta proyek pilihan App, Game & AI-ML.',
                    'Sertifikat kelulusan bernomor unik terbit otomatis & siap cetak PDF.',
                  ],
                  actionLabel: 'Masuk Portal Siswa',
                  onClick: () => onGoLogin('student'),
                },
                {
                  role: 'Instruktur',
                  accent: '#38BDF8',
                  icon: Users,
                  points: [
                    'Buat kode akses kelas khusus dengan pilihan paket program (Studio, App, Game, AI-ML).',
                    'Pantau kemajuan bintang, level tuntas, dan sertifikat seluruh siswa binaan secara realtime.',
                    'Evaluasi capaian tiap tingkatan dengan grafik analitik kelas.',
                  ],
                  actionLabel: 'Portal Instruktur',
                  onClick: () => onGoLogin('instructor'),
                },
                {
                  role: 'Administrator',
                  accent: '#C084FC',
                  icon: ShieldCheck,
                  points: [
                    'Pratinjau penuh seluruh materi, slide media, Coding Studio L1–L9, App, Game & AI-ML yang semuanya terbuka.',
                    'Kelola akun instruktur, kode akses global, serta buka akses program siswa secara manual.',
                    'Dashboard analitik sekolah realtime dengan grafik Recharts & pengaturan kontak upgrade.',
                  ],
                  actionLabel: 'Portal Admin',
                  onClick: () => onGoLogin('admin'),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.role}
                    className="neo-card bg-white p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: item.accent }}
                        >
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="font-display text-xl font-extrabold">Portal {item.role}</h3>
                      </div>

                      <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed list-disc pl-4">
                        {item.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        item.onClick();
                      }}
                      className="neo-btn bg-[#FFFDF7] hover:bg-[#FFE600] w-full py-2.5 px-4 text-xs sm:text-sm font-extrabold cursor-pointer"
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. KONVERSI & KODE UJI COBA */}
        <section id="cara-bergabung" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="neo-card bg-[#FFE600] p-6 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-neutral-900">
                  <Award className="w-4 h-4" />
                  <span>Sertifikat Resmi Otomatis</span>
                  <span aria-hidden="true">·</span>
                  <BarChart3 className="w-4 h-4" />
                  <span>Sinkronisasi Cloud Realtime</span>
                </div>

                <h2
                  className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Siap Mulai Belajar Coding, App, Game &amp; AI Hari Ini?
                </h2>

                <p className="text-sm sm:text-base font-medium text-neutral-900 leading-relaxed max-w-2xl">
                  Daftar menggunakan Kode Akses Kelas Penuh dari Admin/Instruktur Anda, atau langsung
                  coba Coding Studio Level 1 dan Media Belajar dengan kode uji coba bawaan berikut.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-600">Kode Uji Coba (L1):</span>
                    <code className="font-mono font-extrabold text-base tracking-wider">BELAJAR2026</code>
                    <button
                      type="button"
                      onClick={handleCopyTrialCode}
                      className="p-1.5 border-2 border-black bg-[#4ADE80] hover:bg-[#4ADE80]/80 cursor-pointer"
                      title="Salin kode uji coba"
                      aria-label="Salin kode uji coba"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoRegister();
                  }}
                  className="neo-btn bg-black text-white px-6 py-4 text-sm sm:text-base font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  Daftar Akun Siswa Sekarang
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoLogin('instructor');
                    }}
                    className="neo-btn bg-white text-black px-4 py-3 text-xs sm:text-sm font-extrabold cursor-pointer"
                  >
                    Portal Instruktur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoLogin('admin');
                    }}
                    className="neo-btn bg-[#38BDF8] text-black px-4 py-3 text-xs sm:text-sm font-extrabold cursor-pointer"
                  >
                    Portal Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t-[3px] border-black bg-[#FFFDF7] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-[#FFE600] border-2 border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-display text-base font-extrabold">CodeSpark</span>
            <span className="text-neutral-500 font-normal">· CodeQuest Studio</span>
          </div>
          <p className="text-neutral-800 text-center sm:text-right">
            © 2026 CodeSpark · @copyright Pak GuruAI
          </p>
        </div>
      </footer>

      {previewZoomOpen && !heroImgError && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomOpen(false)}
        >
          <div
            className="neo-card bg-[#23272F] w-full max-w-6xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-[#1D2129] border-b-2 border-black flex items-center justify-between gap-3 text-white">
              <span className="font-display font-extrabold text-sm">
                Pratinjau Penuh — CodeSpark Coding Studio
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoomOpen(false)}
                className="neo-btn bg-[#FFE600] text-black p-1.5 cursor-pointer"
                aria-label="Tutup pratinjau penuh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-[#2C313A] max-h-[82vh] overflow-auto">
              <img
                src={HERO_STUDIO_IMAGE}
                alt="Pratinjau penuh aplikasi CodeSpark Coding Studio"
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      )}

      {moduleModalTier && (
        <ModuleGuideModal initialTier={moduleModalTier} onClose={() => setModuleModalTier(null)} />
      )}
    </div>
  );
};
