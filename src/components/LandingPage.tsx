import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
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
  Volume2,
  BookOpen,
} from 'lucide-react';
import type { TierId } from '../types';
import { TIERS } from '../data/levels';
import { IsometricPandaSprite, PandaPortrait } from './PandaMascot';
import { ModuleGuideModal } from './ModuleGuideModal';
import { soundEngine } from '../engine/soundEngine';

interface Props {
  onGoLogin: (defaultRole?: 'student' | 'instructor' | 'admin') => void;
  onGoRegister: () => void;
}

interface DemoStep {
  x: number;
  y: number;
  dir: 'E' | 'N';
  line: number;
  orbCollected: boolean;
  done: boolean;
}

const DEMO_STEPS: DemoStep[] = [
  { x: 0, y: 1, dir: 'E', line: 0, orbCollected: false, done: false },
  { x: 1, y: 1, dir: 'E', line: 0, orbCollected: false, done: false },
  { x: 2, y: 1, dir: 'E', line: 0, orbCollected: true, done: false },
  { x: 3, y: 1, dir: 'E', line: 0, orbCollected: true, done: true },
];

export const LandingPage: React.FC<Props> = ({ onGoLogin, onGoRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoTab, setDemoTab] = useState<'blocks' | 'python' | 'javascript'>('blocks');
  const [copiedCode, setCopiedCode] = useState(false);
  const [moduleModalTier, setModuleModalTier] = useState<TierId | null>(null);

  useEffect(() => {
    if (!demoRunning) return;
    if (demoIdx >= DEMO_STEPS.length - 1) {
      setDemoRunning(false);
      return;
    }
    const timer = setTimeout(() => {
      const nextIdx = demoIdx + 1;
      const nextStep = DEMO_STEPS[nextIdx];
      if (nextStep.done) {
        soundEngine.playGemCollect();
        soundEngine.playVictory(3);
      } else if (nextStep.orbCollected && !DEMO_STEPS[demoIdx].orbCollected) {
        soundEngine.playGemCollect();
      } else {
        soundEngine.playStep();
      }
      setDemoIdx(nextIdx);
    }, 480);
    return () => clearTimeout(timer);
  }, [demoRunning, demoIdx]);

  const runDemo = () => {
    soundEngine.playButtonClick();
    setDemoIdx(0);
    setDemoRunning(true);
  };

  const resetDemo = () => {
    soundEngine.playButtonClick();
    setDemoRunning(false);
    setDemoIdx(0);
  };

  const handleCopyTrialCode = () => {
    soundEngine.playButtonClick();
    navigator.clipboard?.writeText('BELAJAR2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const currentDemo = DEMO_STEPS[demoIdx];

  // Mini isometric projection for the Hero preview
  const toIso = (gx: number, gy: number) => ({
    ix: 120 + (gx - gy) * 34,
    iy: 52 + (gx + gy) * 18,
  });
  const pandaIso = toIso(currentDemo.x, currentDemo.y);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7] border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="w-9 h-9 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </span>
            <span>CodeSpark</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
            <a href="#fitur" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Fitur
            </a>
            <a href="#kurikulum" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Kurikulum
            </a>
            <a href="#cara-bergabung" className="hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Cara Bergabung
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onGoLogin('student');
              }}
              className="neo-btn bg-white px-4 py-2 text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onGoRegister();
              }}
              className="neo-btn bg-[#FFE600] px-4 py-2 text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
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
            <div className="flex flex-col gap-2 text-sm font-bold">
              <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Fitur Utama
              </a>
              <a href="#kurikulum" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Kurikulum 3 Tingkatan
              </a>
              <a href="#cara-bergabung" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/15">
                Cara Bergabung
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
                className="neo-btn bg-[#FFE600] py-2.5 text-sm font-bold cursor-pointer"
              >
                Daftar Siswa
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* HERO SECTION */}
        <section className="neo-grid-bg border-b-[3px] border-black py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm font-bold text-neutral-700">
                CodeQuest Studio · Blocks · Python · JavaScript · Efek Suara Interaktif
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Belajar Coding &amp; AI Seru Lewat{' '}
                <span className="bg-[#FFE600] px-2 border-2 border-black inline-block">
                  Petualangan 2D Isometrik
                </span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-800 leading-relaxed max-w-xl">
                Susun blok <code className="font-mono font-bold bg-[#FFE600]/60 px-1">forward(3)</code> di papan
                kayu interaktif, lihat kode Python &amp; JavaScript terbentuk otomatis, pandu Panda melintasi
                pulau hutan isometrik, dan raih sertifikat resmi!
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoRegister();
                  }}
                  className="neo-btn bg-[#4ADE80] px-6 py-3.5 text-base font-extrabold inline-flex items-center gap-2 cursor-pointer"
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
                  className="neo-btn bg-white px-6 py-3.5 text-base font-bold cursor-pointer"
                >
                  Sudah Punya Akun
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-neutral-800 border-t-2 border-black/15">
                <span>9 Misi Playable</span>
                <span aria-hidden="true">·</span>
                <span>Blocks · Python · JS</span>
                <span aria-hidden="true">·</span>
                <span>Suara &amp; Musik Interaktif</span>
                <span aria-hidden="true">·</span>
                <span>Sertifikat PDF</span>
              </div>
            </div>

            {/* Interactive Codementum-Style Preview Card */}
            <div className="lg:col-span-6">
              <div className="neo-card bg-[#2C313A] overflow-hidden">
                {/* Mini Top Bar */}
                <div className="px-4 py-2.5 bg-[#23272F] border-b-2 border-black flex items-center justify-between gap-2 text-white">
                  <div className="flex items-center gap-2 text-xs font-extrabold">
                    <Volume2 className="w-4 h-4 text-[#4ADE80]" />
                    <span>Pratinjau Studio + Efek Suara</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['blocks', 'python', 'javascript'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          soundEngine.playTabSwitch();
                          setDemoTab(t);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded cursor-pointer capitalize ${
                          demoTab === t
                            ? 'bg-[#E29E4B] text-white'
                            : 'bg-[#3A414E] text-neutral-300 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-12">
                  {/* Left Mini Parchment */}
                  <div className="sm:col-span-5 cm-parchment p-3.5 border-b-2 sm:border-b-0 sm:border-r-4 border-[#6E3412] flex flex-col justify-between gap-3">
                    {demoTab === 'blocks' ? (
                      <div className="space-y-1.5">
                        <div className="w-24 rounded-t-lg rounded-b bg-[#57B832] border-2 border-[#317215] px-3 py-1.5 font-display text-xs font-extrabold text-white">
                          START
                        </div>
                        <div className="rounded bg-[#2B8EF2] border-2 border-[#1A65B5] px-3 py-1.5 font-display text-xs font-extrabold text-white flex items-center justify-between">
                          <span>forward →</span>
                          <span className="px-2 py-0.5 rounded bg-[#1B67B7] font-mono">3</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded bg-[#1E1F26] border-2 border-[#5C2A0E] p-3 font-mono text-xs text-[#7CE38B]">
                        <div className="text-neutral-500 text-[10px] mb-1">
                          {demoTab === 'python' ? 'misi_1.py' : 'misi1.js'}
                        </div>
                        <div className={demoRunning ? 'bg-[#FFE600] text-black px-1 font-bold' : ''}>
                          {demoTab === 'python' ? 'forward(3)' : 'forward(3);'}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={runDemo}
                        disabled={demoRunning}
                        className="cm-green-ok text-white px-3 py-2 text-xs font-extrabold flex-1 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Jalankan
                      </button>
                      <button
                        type="button"
                        onClick={resetDemo}
                        className="px-2.5 py-2 rounded bg-[#2B8EF2] border-2 border-[#1A65B5] text-white cursor-pointer"
                        aria-label="Reset demo"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right Mini Isometric Forest */}
                  <div className="sm:col-span-7 bg-gradient-to-b from-[#3A414A] to-[#2B6224] p-3 flex flex-col justify-between">
                    <svg viewBox="0 0 280 185" className="w-full h-44">
                      {/* Green island */}
                      <polygon points="140,18 265,86 140,156 15,86" fill="#5CB834" stroke="#2D6A1A" strokeWidth="3" />
                      <polygon points="15,86 140,156 140,172 15,102" fill="#6D4C2F" />
                      <polygon points="140,156 265,86 265,102 140,172" fill="#4E331B" />

                      {/* Stone Walkway (4 tiles) */}
                      {[0, 1, 2, 3].map((gx) => {
                        const c = toIso(gx, 1);
                        return (
                          <polygon
                            key={gx}
                            points={`${c.ix},${c.iy - 16} ${c.ix + 32},${c.iy} ${c.ix},${c.iy + 16} ${c.ix - 32},${c.iy}`}
                            fill={gx === 3 ? '#FEF08A' : '#EEF2F6'}
                            stroke="#64748B"
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* Collectible Orb */}
                      {!currentDemo.orbCollected && (() => {
                        const o = toIso(2, 1);
                        return (
                          <g transform={`translate(${o.ix}, ${o.iy})`}>
                            <circle cx="0" cy="-7" r="8" fill="#E63946" stroke="#4A0E14" strokeWidth="1.8" />
                            <circle cx="0" cy="-16" r="2.2" fill="#FFE600" />
                          </g>
                        );
                      })()}

                      {/* Panda Sprite */}
                      <g
                        style={{
                          transform: `translate(${pandaIso.ix}px, ${pandaIso.iy}px) scale(0.8)`,
                          transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <IsometricPandaSprite
                          dir="E"
                          status={currentDemo.done ? 'success' : demoRunning ? 'running' : 'idle'}
                        />
                      </g>
                    </svg>

                    <div className="cm-wood-dialog px-3 py-2 flex items-center gap-2.5">
                      <PandaPortrait className="w-10 h-10 shrink-0" mood={currentDemo.done ? 'excited' : 'happy'} />
                      <p className="text-[11px] font-semibold text-[#FFF4DC] leading-snug">
                        {currentDemo.done
                          ? 'Hore! Panda sampai ke tujuan dengan 3 bintang!'
                          : 'Klik tombol Jalankan untuk mendengar efek suara & melihat Panda melangkah!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FITUR UTAMA */}
        <section id="fitur" className="py-16 sm:py-20 border-b-[3px] border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-sm font-bold text-neutral-600 mb-2">Keunggulan Platform</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Dirancang Khusus untuk Belajar Pemrograman Modern
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: '01',
                  title: 'Block-to-Text Sync',
                  desc: 'Transisi mulus dari blok puzzle visual ke sintaks Python & JavaScript secara otomatis di layar yang sama.',
                  color: '#FFE600',
                  icon: Code2,
                },
                {
                  num: '02',
                  title: 'Arena 2D Isometrik + Suara',
                  desc: 'Pulau hutan isometrik interaktif lengkap dengan efek suara langkah, permata, musik latar, dan sistem 3 bintang.',
                  color: '#4ADE80',
                  icon: Gamepad2,
                },
                {
                  num: '03',
                  title: 'Sertifikat Otomatis',
                  desc: 'Sertifikat resmi bernomor unik langsung terbit begitu siswa menuntaskan seluruh level tiap tingkatan.',
                  color: '#38BDF8',
                  icon: Award,
                },
                {
                  num: '04',
                  title: 'Pantauan Realtime',
                  desc: 'Dashboard analitik khusus Instruktur dan Admin dengan grafik Recharts yang diperbarui langsung.',
                  color: '#C084FC',
                  icon: BarChart3,
                },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.num} className="neo-card p-6 flex flex-col justify-between bg-[#FFFDF7]">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className="w-12 h-12 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center"
                          style={{ backgroundColor: feat.color }}
                        >
                          <Icon className="w-6 h-6 text-black" />
                        </div>
                        <span className="font-mono text-sm font-bold text-neutral-500">{feat.num}</span>
                      </div>
                      <h3 className="font-display text-xl font-extrabold mb-2">{feat.title}</h3>
                      <p className="text-sm text-neutral-700 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* KURIKULUM 3 TINGKATAN */}
        <section id="kurikulum" className="py-16 sm:py-20 border-b-[3px] border-black bg-[#FFFDF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-sm font-bold text-neutral-600 mb-2">Kurikulum Terstruktur</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Tiga Tingkatan dari Nol hingga AI Navigator
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <div key={tier.id} className="neo-card bg-white flex flex-col justify-between">
                  <div>
                    <div
                      className="px-6 py-4 border-b-[3px] border-black flex items-center justify-between"
                      style={{ backgroundColor: tier.accentColor }}
                    >
                      <span className="font-display font-extrabold text-lg">
                        {tier.number}. {tier.name}
                      </span>
                      <span className="font-mono text-xs font-bold">{tier.badgeText}</span>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="font-display text-xl font-extrabold">{tier.subtitle}</h3>
                      <p className="text-sm text-neutral-700 leading-relaxed">{tier.description}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-2">
                    <div className="border-t-2 border-black/15 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          setModuleModalTier(tier.id);
                        }}
                        className="neo-btn bg-[#FFFDF7] hover:bg-[#FFE600] px-2.5 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Modul Singkat
                      </button>
                      <button
                        type="button"
                        onClick={onGoRegister}
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

        {/* CARA BERGABUNG + DEFAULT ACCESS CODE */}
        <section id="cara-bergabung" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="neo-card bg-[#FFE600] p-6 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Siap Memulai Petualangan Coding Hari Ini?
                </h2>
                <p className="text-base font-medium text-neutral-900 leading-relaxed max-w-2xl">
                  Dapatkan Kode Akses Kelas Penuh dari Admin / Instruktur Anda, atau coba langsung Level 1
                  menggunakan kode akses uji coba bawaan di bawah ini.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-600">Kode Uji Coba (Level 1):</span>
                    <code className="font-mono font-extrabold text-base tracking-wider">BELAJAR2026</code>
                    <button
                      type="button"
                      onClick={handleCopyTrialCode}
                      className="p-1.5 border-2 border-black bg-[#4ADE80] hover:bg-[#4ADE80]/80 cursor-pointer"
                      title="Salin kode akses"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onGoRegister();
                  }}
                  className="neo-btn bg-black text-white px-6 py-4 text-base font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
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
                    className="neo-btn bg-white text-black px-4 py-3 text-sm font-bold cursor-pointer"
                  >
                    Portal Instruktur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onGoLogin('admin');
                    }}
                    className="neo-btn bg-[#38BDF8] text-black px-4 py-3 text-sm font-bold cursor-pointer"
                  >
                    Portal Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
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

      {moduleModalTier && (
        <ModuleGuideModal initialTier={moduleModalTier} onClose={() => setModuleModalTier(null)} />
      )}
    </div>
  );
};
