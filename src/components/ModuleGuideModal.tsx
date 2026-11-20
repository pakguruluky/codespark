import React, { useState } from 'react';
import {
  X,
  Printer,
  BookOpen,
  ArrowRight,
  RotateCw,
  Repeat,
  GitBranch,
  Gem,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type { TierId } from '../types';
import {
  TIER_MODULES,
  type ModuleVisualBlock,
  type ModuleCommandCard,
} from '../data/modules';
import { CHARACTER_META, MascotPortrait } from './PandaMascot';

interface Props {
  initialTier: TierId;
  onClose: () => void;
}

const TIER_TABS: { id: TierId; label: string }[] = [
  { id: 'pemula', label: '01. Pemula' },
  { id: 'menengah', label: '02. Menengah' },
  { id: 'lanjutan', label: '03. Lanjutan' },
];

const BLOCK_STYLES: Record<ModuleCommandCard['blockKind'], string> = {
  forward: 'bg-[#2B8EF2] border-[#1A65B5] text-white',
  turn: 'bg-[#F3C043] border-[#BD8D1B] text-[#3B2305]',
  repeat: 'bg-[#9353D3] border-[#662D9F] text-white',
  if_clear: 'bg-[#1EA896] border-[#117366] text-white',
  else: 'bg-[#0F766E] border-[#0B4F4A] text-white',
  if_gem: 'bg-[#E95B7A] border-[#B22F4C] text-white',
};

const MiniBlockBadge: React.FC<{
  kind: ModuleCommandCard['blockKind'];
  label: string;
  param?: string;
}> = ({ kind, label, param }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border-2 font-display font-extrabold text-xs shadow-[0_2px_0_rgba(0,0,0,0.22)] ${BLOCK_STYLES[kind]}`}
  >
    {kind === 'repeat' && <Repeat className="w-3.5 h-3.5 shrink-0" />}
    {(kind === 'if_clear' || kind === 'else') && <GitBranch className="w-3.5 h-3.5 shrink-0" />}
    {kind === 'if_gem' && <Gem className="w-3.5 h-3.5 shrink-0" />}
    <span>{label}</span>
    {kind === 'forward' && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
    {kind === 'turn' && <RotateCw className="w-3 h-3 shrink-0" />}
    {param && (
      <span className="px-1.5 py-0.5 rounded bg-black/25 text-white font-mono text-[10px]">
        {param}
      </span>
    )}
  </div>
);

const MiniBlockTree: React.FC<{ blocks: ModuleVisualBlock[]; depth?: number }> = ({
  blocks,
  depth = 0,
}) => (
  <div className="space-y-1" style={{ marginLeft: depth > 0 ? 10 : 0 }}>
    {blocks.map((blk, idx) => (
      <div key={`${blk.label}-${idx}`} className="space-y-1">
        <MiniBlockBadge kind={blk.kind} label={blk.label} param={blk.param} />
        {blk.children && blk.children.length > 0 && (
          <div className="ml-2 pl-2 border-l-2 border-[#7C4A22]/60 space-y-1 py-0.5">
            <MiniBlockTree blocks={blk.children} depth={depth + 1} />
          </div>
        )}
        {blk.elseChildren && blk.elseChildren.length > 0 && (
          <div className="ml-2 pl-2 border-l-2 border-[#0F766E]/70 space-y-1 py-0.5">
            <div className="text-[10px] font-mono font-extrabold text-[#4A2508]">else:</div>
            <MiniBlockTree blocks={blk.elseChildren} depth={depth + 1} />
          </div>
        )}
      </div>
    ))}
  </div>
);

export const ModuleGuideModal: React.FC<Props> = ({ initialTier, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<TierId>(initialTier);
  const guide = TIER_MODULES[selectedTier];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:block"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[94vh] flex flex-col bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden print-only-module print:max-h-none print:border-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls (Hidden on Print) */}
        <div className="no-print bg-[#2B303A] text-white px-4 py-3 border-b-[3px] border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FFE600] border-2 border-black flex items-center justify-center text-black shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display font-extrabold text-sm sm:text-base leading-tight">
                Modul Singkat Pembelajaran (Bahasa Indonesia)
              </div>
              <div className="text-[11px] text-neutral-300">
                Panduan Ringkas Konsep, Blok Perintah, Peringatan &amp; Contoh Solusi
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Switch between Tier 01 / 02 / 03 */}
            <div className="flex items-center bg-[#1E222A] p-0.5 rounded border border-white/15">
              {TIER_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTier(t.id)}
                  className={`px-2.5 py-1 text-xs font-extrabold rounded cursor-pointer transition-colors ${
                    selectedTier === t.id
                      ? 'bg-[#FFE600] text-black'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="neo-btn bg-[#4ADE80] text-black px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="neo-btn bg-white text-black p-1.5 cursor-pointer"
              aria-label="Tutup modul"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Module Document (Codementum 3-Page Sheet Style) */}
        <div className="overflow-y-auto p-5 sm:p-8 bg-white text-black space-y-8 print:overflow-visible print:p-4">
          {/* ==================== BAGIAN 1: RINGKASAN & REFERENSI BLOK ==================== */}
          <section className="space-y-5">
            {/* Sheet Brand Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-300 pb-3">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#1E73BE]">
                  {guide.subjectTitle}
                </h1>
                <p className="text-xs font-bold text-neutral-600 mt-0.5">{guide.badge}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#F59E0B] border-2 border-black flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-extrabold text-lg tracking-tight">CodeSpark</span>
              </div>
            </div>

            {/* 2-Column Page 1 Layout (Left: Overview & Outcomes | Right: Block & Explanation Cards) */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-4 lg:border-r lg:border-neutral-400 lg:pr-6">
                {/* Ringkasan Materi */}
                <div className="space-y-2">
                  <div className="bg-[#E5EDD8] border-l-4 border-[#6B9B37] px-3 py-1 font-display font-extrabold text-sm text-[#1E293B]">
                    Ringkasan Materi (Overview)
                  </div>
                  {guide.overviewParagraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-xs sm:text-[13px] leading-relaxed text-neutral-800 text-justify"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {/* Tujuan & Capaian Pembelajaran */}
                <div className="space-y-2">
                  <div className="bg-[#E5EDD8] border-l-4 border-[#6B9B37] px-3 py-1 font-display font-extrabold text-sm text-[#1E293B]">
                    Tujuan &amp; Capaian Pembelajaran
                  </div>
                  <p className="text-xs font-semibold text-neutral-700">
                    Di akhir materi ini, peserta diharapkan mampu:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-[13px] text-neutral-800 leading-relaxed">
                    {guide.learningOutcomes.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Perintah yang Digunakan */}
                <div className="space-y-2">
                  <div className="bg-[#E5EDD8] border-l-4 border-[#6B9B37] px-3 py-1 font-display font-extrabold text-sm text-[#1E293B]">
                    Perintah yang Digunakan
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.commandsUsed.map((cmd) => (
                      <code
                        key={cmd}
                        className="px-2 py-0.5 bg-[#FFFDF7] border border-neutral-400 rounded font-mono text-xs font-bold text-[#1E293B]"
                      >
                        {cmd}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Cara Kerja Blok, Tombol & Penjelasan */}
                <div className="space-y-1.5">
                  <div className="bg-[#E5EDD8] border-l-4 border-[#6B9B37] px-3 py-1 font-display font-extrabold text-sm text-[#1E293B]">
                    Ikon Blok &amp; Tombol pada Materi Ini
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-800">
                    <strong>Blok:</strong> Anda dapat menyusun algoritma secara visual dengan mengklik blok perintah di panel kiri.
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-800">
                    <strong>Tombol / Kode:</strong> Setiap blok otomatis membentuk kode Python &amp; JavaScript yang dapat diklik atau diedit langsung.
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-800">
                    <strong>Penjelasan:</strong> Berisi fungsi dasar dan contoh penggunaan masing-masing perintah.
                  </p>
                </div>
              </div>

              {/* Right Column: Block | Button | Explanation Tables */}
              <div className="lg:col-span-6 space-y-4">
                {guide.commandCards.map((card) => (
                  <div
                    key={card.id}
                    className="border border-neutral-800 bg-white overflow-hidden"
                  >
                    <div className="grid grid-cols-12 border-b border-neutral-800 bg-neutral-100 text-xs font-extrabold">
                      <div className="col-span-5 px-2.5 py-1.5 border-r border-neutral-800">Blok</div>
                      <div className="col-span-7 px-2.5 py-1.5">Penjelasan</div>
                    </div>
                    <div className="grid grid-cols-12">
                      {/* Left Stacked Cell: Block visual + Button syntax */}
                      <div className="col-span-5 border-r border-neutral-800 flex flex-col">
                        <div className="p-3 bg-[#F6E6B4] flex items-center justify-center flex-1 border-b border-neutral-800">
                          <MiniBlockBadge
                            kind={card.blockKind}
                            label={card.blockLabel}
                            param={card.blockParam}
                          />
                        </div>
                        <div className="px-2.5 py-1 bg-neutral-100 border-b border-neutral-800 text-[11px] font-extrabold">
                          Sintaks / Tombol
                        </div>
                        <div className="p-2.5 bg-[#FFFDF7] flex items-center justify-center">
                          <code className="px-2 py-1 rounded bg-[#2B303A] text-[#FFE600] font-mono text-[11px] font-bold text-center">
                            {card.buttonSyntax}
                          </code>
                        </div>
                      </div>

                      {/* Right Cell: Explanation + Sample Usage */}
                      <div className="col-span-7 p-3 flex flex-col justify-between gap-2.5 text-xs">
                        <p className="leading-relaxed text-neutral-800">{card.explanation}</p>
                        <div className="border-t border-neutral-200 pt-2">
                          <div className="italic underline font-bold text-[11px] text-neutral-700 mb-1">
                            Contoh penggunaan:
                          </div>
                          <pre className="p-2 rounded bg-neutral-100 border border-neutral-300 font-mono text-[11px] text-neutral-900 whitespace-pre-wrap leading-relaxed">
                            {card.sampleCode}
                          </pre>
                          <div className="font-mono text-[10px] text-emerald-800 mt-1">
                            {card.sampleComment}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==================== BAGIAN 2: KARAKTER PETUALANG & PERINGATAN ==================== */}
          <section className="pt-6 border-t-2 border-dashed border-neutral-300 space-y-5">
            <div className="grid md:grid-cols-12 gap-6 items-start">
              {/* Karakter Petualang per Stage */}
              <div className="md:col-span-7 space-y-3">
                <div className="bg-[#E5EDD8] border-l-4 border-[#6B9B37] px-3 py-1 font-display font-extrabold text-sm text-[#1E293B]">
                  Karakter Petualang pada Materi Ini
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-800">
                  {guide.characterIntro}
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-1">
                  {guide.stageCharacters.map((sc) => {
                    const meta = CHARACTER_META[sc.character];
                    return (
                      <div
                        key={sc.stage}
                        className="border-2 border-black p-3 bg-[#FFFDF7] flex flex-col items-center text-center gap-1.5"
                      >
                        <MascotPortrait character={sc.character} className="w-16 h-16" mood="happy" />
                        <span
                          className="px-2 py-0.5 border border-black text-[11px] font-extrabold"
                          style={{ backgroundColor: meta.badgeBg }}
                        >
                          {meta.title}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-700 leading-snug">
                          {sc.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PERINGATAN 1 & PERINGATAN 2 (Exact Codementum Rose Warning Style) */}
              <div className="md:col-span-5 space-y-4">
                {guide.warnings.map((warn) => (
                  <div key={warn.title} className="border border-rose-300 bg-white">
                    <div className="bg-[#F6D6D6] px-3 py-1.5 flex items-center gap-1.5 font-display font-extrabold text-xs text-[#991B1B]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{warn.title}</span>
                    </div>
                    <p className="p-3 text-xs leading-relaxed text-neutral-800">{warn.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==================== BAGIAN 3: CONTOH SOLUSI (4 KOLOM) ==================== */}
          <section className="pt-6 border-t-2 border-dashed border-neutral-300 space-y-6">
            {guide.sampleSolutions.map((sol) => {
              const meta = CHARACTER_META[sol.character];
              return (
                <div key={sol.stageTitle} className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display font-extrabold text-sm sm:text-base text-neutral-900">
                      {sol.stageTitle}
                    </h3>
                    <span
                      className="px-2 py-0.5 border border-black text-[11px] font-extrabold inline-flex items-center gap-1"
                      style={{ backgroundColor: meta.badgeBg }}
                    >
                      <MascotPortrait character={sol.character} className="w-4 h-4" mood="happy" />
                      {meta.name}
                    </span>
                  </div>

                  {/* 4-Column Colored Header Solution Table matching PDF Page 3 */}
                  <div className="grid md:grid-cols-4 gap-3 border-b border-neutral-300 pb-5">
                    {/* Col 1: Algoritma (Green) */}
                    <div className="space-y-2">
                      <div className="bg-[#76933C] text-white font-display font-extrabold text-xs px-3 py-1.5">
                        Algoritma
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-800 leading-relaxed">
                        {sol.algorithmSteps.map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Col 2: Blok (Purple) */}
                    <div className="space-y-2">
                      <div className="bg-[#604A7B] text-white font-display font-extrabold text-xs px-3 py-1.5">
                        Blok
                      </div>
                      <div className="p-3 rounded bg-[#F5E0A3] border border-[#8C5A2B]/60 space-y-1.5">
                        <div className="inline-block px-3 py-1 rounded-t-lg rounded-b bg-[#57B832] border border-[#2D6E14] text-white font-display font-extrabold text-[11px] tracking-wider">
                          START
                        </div>
                        <MiniBlockTree blocks={sol.blocks} />
                      </div>
                    </div>

                    {/* Col 3: Python (Blue) */}
                    <div className="space-y-2">
                      <div className="bg-[#365F91] text-white font-display font-extrabold text-xs px-3 py-1.5">
                        Python
                      </div>
                      <pre className="p-3 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs text-neutral-900 whitespace-pre-wrap leading-relaxed">
                        {sol.pythonCode}
                      </pre>
                    </div>

                    {/* Col 4: JavaScript (Amber/Yellow) */}
                    <div className="space-y-2">
                      <div className="bg-[#F59E0B] text-black font-display font-extrabold text-xs px-3 py-1.5">
                        JavaScript
                      </div>
                      <pre className="p-3 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs text-neutral-900 whitespace-pre-wrap leading-relaxed">
                        {sol.jsCode}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sheet Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-neutral-500 pt-1">
              <span>Modul Singkat CodeSpark · Kurikulum Coding &amp; AI Bahasa Indonesia</span>
              <span>© 2026 CodeSpark · @copyright Pak GuruAI</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
