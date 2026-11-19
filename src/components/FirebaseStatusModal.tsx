import React, { useState } from 'react';
import { Cloud, CloudOff, Copy, Check, X, LogOut, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { connectFirebaseWithGoogle, disconnectFirebaseGoogle, testConnection } from '../lib/firebase';
import { firebaseConfig, isFirebaseConfigured } from '../firebaseConfig.js';

interface Props {
  mode: 'firebase' | 'local';
  firebaseUserEmail: string | null;
}

const CONFIG_SNIPPET = `// src/firebaseConfig.js (Terhubung ke ${firebaseConfig.projectId})
export const firebaseConfig = {
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  projectId: "${firebaseConfig.projectId}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
  appId: "${firebaseConfig.appId}"
};`;

export const FirebaseStatusModal: React.FC<Props> = ({ mode, firebaseUserEmail }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isFirebaseConfigured();

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      await connectFirebaseWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghubungkan ke Firebase Cloud. Pastikan Google Sign-In aktif & domain sudah terdaftar di Firebase Auth.'
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    await disconnectFirebaseGoogle();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection();
    setTesting(false);
    if (res.ok) {
      setTestResult(`Firestore pada proyek "${firebaseConfig.projectId}" dapat dijangkau!`);
    } else {
      setTestResult(
        `Firestore pada "${firebaseConfig.projectId}" belum dapat dijangkau. Pastikan Cloud Firestore Database (default) sudah dibuat di Firebase Console.`
      );
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard?.writeText(CONFIG_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`no-print fixed bottom-4 right-4 z-40 neo-btn px-3 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
          mode === 'firebase' ? 'bg-[#4ADE80]' : 'bg-[#FFE600]'
        }`}
        title="Pengaturan Sinkronisasi Database Realtime"
      >
        {mode === 'firebase' ? (
          <>
            <Cloud className="w-4 h-4 shrink-0" />
            <span>Firebase · {firebaseConfig.projectId}</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4 shrink-0" />
            <span>Demo Lokal · Cloud Setup</span>
          </>
        )}
      </button>

      {open && (
        <div
          className="no-print fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="neo-card bg-[#FFFDF7] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 ${
                    mode === 'firebase' ? 'bg-[#4ADE80]' : 'bg-[#FFE600]'
                  }`}
                >
                  <Database className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold">
                    Firebase &amp; Deploy Vercel
                  </h2>
                  <p className="text-xs text-neutral-700">
                    {mode === 'firebase'
                      ? `Terhubung ke ${firebaseConfig.projectId} (${firebaseUserEmail})`
                      : `Proyek terkonfigurasi: ${firebaseConfig.projectId} (Mode Lokal aktif)`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="neo-btn bg-white p-1.5 cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {configured && (
                <div className="p-4 bg-white border-2 border-black space-y-3">
                  <h3 className="font-display font-bold text-base">
                    {mode === 'firebase'
                      ? 'Firebase Firestore Aktif 100% Realtime'
                      : `Hubungkan ke Firebase (${firebaseConfig.projectId})`}
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {mode === 'firebase'
                      ? 'Seluruh data instruktur, kode akses, siswa, progres bintang, sertifikat, dan pengaturan nomor HP Admin tersinkronisasi langsung dengan Cloud Firestore.'
                      : 'Konfigurasi Firebase Cloud untuk proyek Anda sudah terpasang dan siap deploy ke Vercel. Masuk dengan Google untuk mengaktifkan sinkronisasi Cloud Firestore.'}
                  </p>
                  {error && (
                    <div className="p-3 bg-[#FB7185]/25 border-2 border-black text-xs font-semibold">
                      {error}
                    </div>
                  )}
                  {testResult && (
                    <div className="p-3 bg-[#38BDF8]/25 border-2 border-black text-xs font-semibold">
                      {testResult}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2.5">
                    {mode === 'firebase' ? (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="neo-btn bg-[#FB7185] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Putuskan Sesi Cloud
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnect}
                        disabled={connecting}
                        className="neo-btn bg-[#4ADE80] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Cloud className="w-4 h-4" />
                        {connecting ? 'Menghubungkan...' : 'Hubungkan Firebase (Google)'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="neo-btn bg-white px-3.5 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                      {testing ? 'Menguji...' : 'Uji Koneksi Firestore'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-white border-2 border-black space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base">
                    Checklist Deploy Vercel &amp; Firebase Console
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="neo-btn bg-[#38BDF8] px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin' : 'Salin Config'}
                  </button>
                </div>
                <ol className="text-xs text-neutral-800 space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>
                    Buka Firebase Console proyek <code className="font-mono font-bold">{firebaseConfig.projectId}</code> → aktifkan{' '}
                    <strong>Firestore Database (default)</strong> dan salin aturan dari file{' '}
                    <code className="font-mono bg-[#FFE600]/50 px-1">firestore.rules</code>.
                  </li>
                  <li>
                    Buka <strong>Authentication → Sign-in method</strong> → aktifkan <strong>Google</strong>, lalu
                    tambahkan domain <code className="font-mono bg-[#FFE600]/50 px-1">*.vercel.app</code> di{' '}
                    <strong>Authorized domains</strong>.
                  </li>
                  <li>
                    Deploy ke <strong>Vercel</strong> (file <code className="font-mono bg-[#FFE600]/50 px-1">vercel.json</code> sudah siap;
                    Build Command: <code className="font-mono">npm run build</code>, Output: <code className="font-mono">dist</code>).
                  </li>
                </ol>
                <pre className="p-3 bg-neutral-950 text-[#4ADE80] border-2 border-black text-xs font-mono overflow-x-auto leading-relaxed">
                  {CONFIG_SNIPPET}
                </pre>
                <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
                  <span>Koleksi: instructors · access_codes · students · progress · certificates · settings</span>
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/overview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-black underline shrink-0"
                  >
                    Console
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

