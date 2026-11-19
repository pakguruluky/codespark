import React, { useState } from 'react';
import {
  Cloud,
  CloudOff,
  Copy,
  Check,
  X,
  LogOut,
  Database,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { connectFirebaseWithGoogle, disconnectFirebaseGoogle } from '../lib/firebase';
import { firebaseConfig, isFirebaseConfigured } from '../firebaseConfig.js';
import { dataEngine } from '../services/dataEngine';
import type { FirebaseConnectionStatus } from '../types';

interface Props {
  mode: 'firebase' | 'local';
  firebaseStatus: FirebaseConnectionStatus;
  firebaseError: string | null;
  firebaseUserEmail: string | null;
  lastSyncedAt: string | null;
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

export const FirebaseStatusModal: React.FC<Props> = ({
  mode,
  firebaseStatus,
  firebaseError,
  firebaseUserEmail,
  lastSyncedAt,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [retrying, setRetrying] = useState(false);
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

  const handleRetryConnection = async () => {
    setError(null);
    setRetrying(true);
    try {
      await dataEngine.retryFirebaseConnection();
    } finally {
      setRetrying(false);
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard?.writeText(CONFIG_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  const buttonBg =
    firebaseStatus === 'connected'
      ? 'bg-[#4ADE80]'
      : firebaseStatus === 'connecting'
        ? 'bg-[#38BDF8]'
        : 'bg-[#FFE600]';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`no-print fixed bottom-4 right-4 z-40 neo-btn px-3 py-2 text-xs font-extrabold flex items-center gap-2 cursor-pointer whitespace-nowrap ${buttonBg}`}
        title="Status Sinkronisasi Firebase Realtime"
      >
        {firebaseStatus === 'connected' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 animate-pulse shrink-0" />
            <span>Firebase Realtime · {firebaseConfig.projectId}</span>
          </>
        ) : firebaseStatus === 'connecting' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Menghubungkan Firebase...</span>
          </>
        ) : firebaseStatus === 'auth_required' ? (
          <>
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Firebase · Login Google</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4 shrink-0" />
            <span>Mode Lokal · Hubungkan Firebase</span>
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
                  className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 ${buttonBg}`}
                >
                  <Database className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold">
                    Firebase Firestore Realtime
                  </h2>
                  <p className="text-xs text-neutral-700 font-semibold">
                    {firebaseStatus === 'connected'
                      ? `Terhubung Realtime ke ${firebaseConfig.projectId}${firebaseUserEmail ? ` (${firebaseUserEmail})` : ''}${formattedSyncTime ? ` · Sync ${formattedSyncTime}` : ''}`
                      : firebaseStatus === 'connecting'
                        ? `Menghubungkan ke ${firebaseConfig.projectId}...`
                        : firebaseStatus === 'auth_required'
                          ? `Proyek ${firebaseConfig.projectId} aktif — butuh Login Google`
                          : `Proyek ${firebaseConfig.projectId} belum terjangkau (Mode Lokal aktif)`}
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
                      ? 'Sinkronisasi Realtime (onSnapshot) Aktif!'
                      : `Hubungkan ke Firebase (${firebaseConfig.projectId})`}
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {mode === 'firebase'
                      ? 'Seluruh data instruktur, kode akses, siswa, progres bintang, sertifikat, dan pengaturan nomor HP Admin kini tersinkronisasi 100% realtime lintas perangkat melalui Cloud Firestore onSnapshot.'
                      : 'Aplikasi otomatis mencoba terhubung ke Cloud Firestore saat dibuka. Jika aturan keamanan memerlukan autentikasi Google, klik tombol di bawah untuk mengaktifkan sinkronisasi cloud.'}
                  </p>

                  {(error || firebaseError) && (
                    <div className="p-3 bg-[#FFE600]/45 border-2 border-black text-xs font-bold leading-relaxed">
                      {error || firebaseError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {firebaseUserEmail ? (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="neo-btn bg-[#FB7185] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun Google
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnect}
                        disabled={connecting}
                        className="neo-btn bg-[#4ADE80] px-4 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Cloud className="w-4 h-4" />
                        {connecting ? 'Menghubungkan...' : 'Hubungkan Firebase (Google)'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRetryConnection}
                      disabled={retrying}
                      className="neo-btn bg-white px-3.5 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                      {retrying ? 'Menghubungkan...' : 'Hubungkan Ulang'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-white border-2 border-black space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base">
                    Checklist Firebase Console ({firebaseConfig.projectId}) &amp; Vercel
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
                    Buka <strong>Firestore Database</strong> pada proyek{' '}
                    <code className="font-mono font-bold">{firebaseConfig.projectId}</code> lalu klik{' '}
                    <strong>Create database</strong> (pilih database <code>(default)</code>).
                  </li>
                  <li>
                    Pasang aturan keamanan dari file{' '}
                    <code className="font-mono bg-[#FFE600]/50 px-1">firestore.rules</code> di tab{' '}
                    <strong>Firestore → Rules</strong> lalu klik <strong>Publish</strong>.
                  </li>
                  <li>
                    Aktifkan <strong>Authentication → Google</strong> dan tambahkan domain Vercel Anda (serta domain preview) di{' '}
                    <strong>Authentication → Settings → Authorized domains</strong>.
                  </li>
                </ol>
                <pre className="p-3 bg-neutral-950 text-[#4ADE80] border-2 border-black text-xs font-mono overflow-x-auto leading-relaxed">
                  {CONFIG_SNIPPET}
                </pre>
                <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
                  <span>Koleksi: instructors · access_codes · students · progress · certificates · settings</span>
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-black underline shrink-0"
                  >
                    Buka Firestore
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


