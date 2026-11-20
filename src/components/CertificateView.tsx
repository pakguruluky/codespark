import React from 'react';
import { Award, Printer, X, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CertificateRecord } from '../types';
import { formatIndonesianDate } from '../utils/crypto';
import { getTierMeta } from '../data/levels';

interface Props {
  certificate: CertificateRecord;
  onClose?: () => void;
}

export const CertificateView: React.FC<Props> = ({ certificate, onClose }) => {
  const isAppMaker = certificate.tierId === 'app_maker';
  const isGameMaker = certificate.tierId === 'game_maker';
  const isAiMl = certificate.tierId === 'ai_ml';
  const accentColor =
    certificate.tierId === 'app_maker'
      ? '#FB7185'
      : certificate.tierId === 'game_maker'
        ? '#38BDF8'
        : certificate.tierId === 'ai_ml'
          ? '#FDBA74'
          : getTierMeta(certificate.tierId).accentColor;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl space-y-4 my-auto">
        {/* Action Bar (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#FFFDF7] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-3 sm:p-4">
          <div className="flex items-center gap-2 font-display font-extrabold text-base">
            <Award className="w-5 h-5" />
            <span>Pratinjau Sertifikat Kelulusan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="neo-btn bg-[#4ADE80] px-4 py-2 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="neo-btn bg-white p-2 cursor-pointer"
                aria-label="Tutup sertifikat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Neo-Brutalism Certificate Canvas */}
        <div className="print-only-certificate bg-[#FFFDF7] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 sm:p-10 relative overflow-hidden">
          {/* Top Accent Ribbon */}
          <div
            className="h-4 border-b-[3px] border-black -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-8"
            style={{ backgroundColor: accentColor }}
          />

          <div className="border-[3px] border-black bg-white p-6 sm:p-10 space-y-8 relative">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFE600] border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold leading-none">CodeSpark</div>
                  <div className="text-xs font-bold text-neutral-600 mt-1">
                    CodeQuest Studio · Edukasi Coding &amp; AI
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs font-bold text-neutral-600">Nomor Sertifikat Resmi</div>
                <div className="font-mono text-sm sm:text-base font-extrabold tracking-wider bg-[#FFE600] px-2.5 py-1 border-2 border-black inline-block mt-1">
                  {certificate.certificateNo}
                </div>
              </div>
            </div>

            {/* Main Award Body */}
            <div className="text-center space-y-4 py-2">
              <p className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-600">
                Sertifikat Kompetensi &amp; Kelulusan
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
                {certificate.studentName}
              </h2>
              <p className="text-sm sm:text-base text-neutral-700 max-w-2xl mx-auto leading-relaxed">
                {isAppMaker
                  ? 'Telah berhasil merancang dan membangun seluruh 5 proyek aplikasi interaktif (Photogram AI, Todo App, Simple Calculator, Color Generatif, dan Weather App) pada program panduan:'
                  : isGameMaker
                    ? 'Telah berhasil merancang, memprogram, dan menyelesaikan seluruh 5 proyek game interaktif (Image Match, Memory Card, Color Puzzle, Save the Polar Bear, dan Space Mission) pada program panduan:'
                    : isAiMl
                      ? 'Telah berhasil merancang dan menguji pipeline Computer Vision & Machine Learning (Cartoonizer AI dan Face Detection AI) secara interaktif pada program panduan:'
                      : 'Telah berhasil menyelesaikan seluruh tantangan pemrograman interaktif (Python & JavaScript) serta lulus evaluasi logika algoritma pada kurikulum:'}
              </p>
              <div
                className="inline-block px-6 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-display text-lg sm:text-2xl font-extrabold"
                style={{ backgroundColor: accentColor }}
              >
                {certificate.tierName}
              </div>
            </div>

            {/* Footer Signatures & Seal */}
            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t-2 border-black items-end">
              <div>
                <div className="text-xs font-bold text-neutral-600">Tanggal Kelulusan</div>
                <div className="font-display font-extrabold text-base mt-1">
                  {formatIndonesianDate(certificate.issuedAt)}
                </div>
              </div>

              <div className="flex sm:justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE600] border-2 border-black font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Terverifikasi CodeSpark
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs font-bold text-neutral-600">Instruktur / Pengesah</div>
                <div className="font-display font-extrabold text-base mt-1">
                  {certificate.instructorName}
                </div>
                <div className="text-[11px] font-semibold text-neutral-500">
                  © 2026 CodeSpark · Pak GuruAI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
