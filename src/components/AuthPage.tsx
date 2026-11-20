import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
  Cloud,
  Check,
  Code2,
  Layers,
  Gamepad2,
} from 'lucide-react';
import { dataEngine } from '../services/dataEngine';
import { connectFirebaseWithGoogle } from '../lib/firebase';
import type { AppSession, FirebaseConnectionStatus, UserRole } from '../types';

interface Props {
  initialMode: 'login' | 'register';
  initialRole?: UserRole;
  firebaseStatus?: FirebaseConnectionStatus;
  onBack: () => void;
  onAuthenticated: (session: AppSession) => void;
}

export const AuthPage: React.FC<Props> = ({
  initialMode,
  initialRole = 'student',
  firebaseStatus = 'connected',
  onBack,
  onAuthenticated,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [roleTab, setRoleTab] = useState<UserRole>(initialRole);

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regWantAppMaker, setRegWantAppMaker] = useState(false);
  const [regWantGameMaker, setRegWantGameMaker] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const uname = loginUsername.trim();
      if (!uname || !loginPassword) {
        throw new Error('Username dan password wajib diisi.');
      }

      if (roleTab === 'admin') {
        if (uname.toLowerCase() === 'admin' && loginPassword === 'bajuri39') {
          onAuthenticated({
            role: 'admin',
            id: 'admin',
            name: 'Administrator CodeSpark',
            username: 'admin',
          });
          return;
        }
        throw new Error('Username atau password Admin salah! Periksa kembali kredensial Anda.');
      }

      if (roleTab === 'instructor') {
        const inst = await dataEngine.authenticateInstructor(uname, loginPassword);
        onAuthenticated({
          role: 'instructor',
          id: inst.id,
          name: inst.name,
          username: inst.username,
          specialty: inst.specialty,
        });
        return;
      }

      const student = await dataEngine.authenticateStudent(uname, loginPassword);
      onAuthenticated({
        role: 'student',
        id: student.id,
        name: student.name,
        username: student.username,
        className: student.className,
        instructorId: student.instructorId,
        instructorName: student.instructorName,
        instructorUid: student.instructorUid,
        accessCode: student.accessCode,
        hasAppMakerAccess: student.hasAppMakerAccess,
        requestedAppMaker: student.requestedAppMaker,
        hasGameMakerAccess: student.hasGameMakerAccess,
        requestedGameMaker: student.requestedGameMaker,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const student = await dataEngine.registerStudent({
        name: regName,
        username: regUsername,
        password: regPassword,
        accessCode: regCode,
        requestedAppMaker: regWantAppMaker,
        requestedGameMaker: regWantGameMaker,
      });
      onAuthenticated({
        role: 'student',
        id: student.id,
        name: student.name,
        username: student.username,
        className: student.className,
        instructorId: student.instructorId,
        instructorName: student.instructorName,
        instructorUid: student.instructorUid,
        accessCode: student.accessCode,
        hasAppMakerAccess: student.hasAppMakerAccess,
        requestedAppMaker: student.requestedAppMaker,
        hasGameMakerAccess: student.hasGameMakerAccess,
        requestedGameMaker: student.requestedGameMaker,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pendaftaran siswa gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen neo-grid-bg flex flex-col justify-between">
      <header className="bg-[#FFFDF7] border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="neo-btn bg-white px-3.5 py-2 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </button>
          <div className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="w-8 h-8 bg-[#FFE600] border-2 border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <span>CodeSpark</span>
          </div>
          <div className="w-20" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="neo-card bg-white w-full max-w-lg p-6 sm:p-8">
          {/* Top Mode Switcher */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className={`neo-btn py-2.5 px-4 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login' ? 'bg-[#FFE600]' : 'bg-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              className={`neo-btn py-2.5 px-4 text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register' ? 'bg-[#4ADE80]' : 'bg-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Daftar Siswa
            </button>
          </div>

          {firebaseStatus === 'auth_required' && (
            <div className="mb-5 p-3 bg-[#FFE600]/45 border-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span>Aktifkan sinkronisasi Firebase Cloud Realtime dengan akun Google:</span>
              <button
                type="button"
                onClick={() => void connectFirebaseWithGoogle().catch(() => undefined)}
                className="neo-btn bg-[#4ADE80] px-2.5 py-1 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
                Hubungkan Google
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-[#FB7185]/30 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-start gap-2.5 text-sm font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2">Pilih Peran Akun</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student' as const, label: 'Siswa', icon: GraduationCap, color: '#4ADE80' },
                    { id: 'instructor' as const, label: 'Instruktur', icon: Users, color: '#38BDF8' },
                    { id: 'admin' as const, label: 'Admin', icon: ShieldCheck, color: '#C084FC' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = roleTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setRoleTab(tab.id);
                          setError(null);
                        }}
                        className="border-2 border-black py-2.5 px-2 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        style={{
                          backgroundColor: active ? tab.color : '#FFFFFF',
                          boxShadow: active ? '3px 3px 0px 0px #000' : 'none',
                        }}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="login-username" className="block text-sm font-bold mb-1.5">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={
                    roleTab === 'admin'
                      ? 'admin'
                      : roleTab === 'instructor'
                        ? 'username instruktur dari Admin'
                        : 'username siswa Anda'
                  }
                  className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-bold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="neo-input w-full pl-3.5 pr-11 py-2.5 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-neutral-100 cursor-pointer"
                    aria-label={showLoginPass ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {roleTab === 'admin' && (
                <div className="p-3 bg-[#FFFDF7] border-2 border-black text-xs text-neutral-800">
                  Akun Administrator menggunakan username <code className="font-mono font-bold">admin</code>.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neo-btn bg-[#FFE600] w-full py-3 text-base font-extrabold cursor-pointer"
              >
                {loading ? 'Memeriksa Akun...' : `Masuk sebagai ${roleTab === 'student' ? 'Siswa' : roleTab === 'instructor' ? 'Instruktur' : 'Admin'}`}
              </button>

              {roleTab === 'student' && (
                <p className="text-center text-xs font-semibold text-neutral-700">
                  Siswa baru?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setError(null);
                    }}
                    className="font-extrabold text-black underline cursor-pointer"
                  >
                    Daftar dengan Kode Akses di sini
                  </button>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold">Pendaftaran Siswa Baru</h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Masukkan Kode Akses aktif dari instruktur untuk langsung terhubung ke kelas Anda.
                </p>
              </div>

              <div>
                <label htmlFor="reg-name" className="block text-sm font-bold mb-1">
                  Nama Lengkap
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Rafa Pratama"
                  className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-username" className="block text-sm font-bold mb-1">
                    Username
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="rafa_coder"
                    className="neo-input w-full px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-bold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showRegPass ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 4 karakter"
                      className="neo-input w-full pl-3.5 pr-10 py-2.5 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-neutral-100 cursor-pointer"
                      aria-label={showRegPass ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="reg-code" className="text-sm font-bold inline-flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Kode Akses Kelas (Wajib)
                  </label>
                  <button
                    type="button"
                    onClick={() => setRegCode('BELAJAR2026')}
                    className="text-xs font-bold underline cursor-pointer hover:text-neutral-600"
                  >
                    Pakai kode uji coba: BELAJAR2026
                  </button>
                </div>
                <input
                  id="reg-code"
                  type="text"
                  required
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: BELAJAR2026 atau CODE-7X9A"
                  className="neo-input w-full px-3.5 py-2.5 text-sm font-mono font-bold uppercase tracking-wider"
                />
              </div>

              {/* Guided Program Selection (Studio Wajib + App Maker Opsional) */}
              <div className="space-y-2 pt-1">
                <div className="text-sm font-bold">Pilih Program Panduan</div>
                <div className="space-y-2">
                  {/* Mandatory Coding Studio */}
                  <div className="p-3 bg-[#4ADE80]/20 border-2 border-black flex items-start gap-2.5">
                    <span className="w-5 h-5 mt-0.5 bg-[#4ADE80] border-2 border-black flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-display font-extrabold text-sm">Coding Studio</span>
                        <span className="px-1.5 py-0.5 bg-[#FFE600] border border-black text-[10px] font-extrabold">
                          WAJIB
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-700 mt-0.5 leading-snug">
                        9 Level interaktif Block, Python &amp; JavaScript (otomatis diikuti semua siswa).
                      </p>
                    </div>
                  </div>

                  {/* Optional App Maker */}
                  <button
                    type="button"
                    onClick={() => setRegWantAppMaker((v) => !v)}
                    className={`w-full text-left p-3 border-2 border-black flex items-start gap-2.5 cursor-pointer transition-colors ${
                      regWantAppMaker
                        ? 'bg-[#C084FC]/25 shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-white hover:bg-[#FFFDF7]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 mt-0.5 border-2 border-black flex items-center justify-center shrink-0 ${
                        regWantAppMaker ? 'bg-[#C084FC]' : 'bg-white'
                      }`}
                    >
                      {regWantAppMaker && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-display font-extrabold text-sm">App Maker</span>
                        <span className="px-1.5 py-0.5 bg-[#38BDF8] border border-black text-[10px] font-extrabold">
                          OPSIONAL · 5 PROYEK
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-700 mt-0.5 leading-snug">
                        Proyek bertahap: Photogram AI, Todo App, Simple Calculator, Color Generatif &amp; Weather App. Terbuka lewat Kode Akses App Maker atau aktivasi Admin.
                      </p>
                    </div>
                  </button>

                  {/* Optional Game Maker */}
                  <button
                    type="button"
                    onClick={() => setRegWantGameMaker((v) => !v)}
                    className={`w-full text-left p-3 border-2 border-black flex items-start gap-2.5 cursor-pointer transition-colors ${
                      regWantGameMaker
                        ? 'bg-[#38BDF8]/25 shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-white hover:bg-[#FFFDF7]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 mt-0.5 border-2 border-black flex items-center justify-center shrink-0 ${
                        regWantGameMaker ? 'bg-[#38BDF8]' : 'bg-white'
                      }`}
                    >
                      {regWantGameMaker && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-display font-extrabold text-sm">Game Maker</span>
                        <span className="px-1.5 py-0.5 bg-[#FFE600] border border-black text-[10px] font-extrabold">
                          OPSIONAL · 5 GAME
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-700 mt-0.5 leading-snug">
                        Proyek game bertahap: Image Match, Memory Card, Color Puzzle, Save the Polar Bear &amp; Space Mission. Terbuka lewat Kode Akses Game Maker atau aktivasi Admin.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn bg-[#4ADE80] w-full py-3 text-base font-extrabold cursor-pointer mt-2"
              >
                {loading ? 'Memvalidasi Kode Akses...' : 'Daftar & Masuk ke Coding Studio'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t-2 border-black bg-[#FFFDF7] py-4 text-center text-xs font-bold text-neutral-700">
        © 2026 CodeSpark · @copyright Pak GuruAI
      </footer>
    </div>
  );
};
