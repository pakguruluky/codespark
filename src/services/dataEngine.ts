import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { isFirebaseConfigured } from '../firebaseConfig.js';
import type {
  AccessCode,
  AppSettings,
  CertificateRecord,
  CodeLanguage,
  DataStoreSnapshot,
  Instructor,
  ProgressRecord,
  Student,
  TierId,
} from '../types';
import {
  clampString,
  generateCertificateNo,
  hashPassword,
  sanitizeId,
} from '../utils/crypto';
import { getLevelsByTier, getTierMeta } from '../data/levels';

const LOCAL_STORAGE_KEY = 'codespark_realtime_db_v1';
const CHANNEL_NAME = 'codespark_realtime_sync';
const BOOTSTRAPPED_ADMIN_EMAIL = 'pakguruluky@gmail.com';
const DEFAULT_ACCESS_CODE = 'BELAJAR2026';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  adminPhone: '',
  adminContactName: 'Admin CodeSpark (Pak GuruAI)',
  upgradeMessage:
    'Kode akses uji coba (BELAJAR2026) hanya dapat mencoba Level 1. Untuk membuka Level 2 hingga Level 9 & Sertifikat Kelulusan, silakan hubungi Admin untuk mendapatkan Kode Akses Kelas Penuh.',
  updatedAt: new Date().toISOString(),
};

export function isTrialAccessCode(code: string | undefined, accessCodes: AccessCode[]): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  if (upper === DEFAULT_ACCESS_CODE || upper.startsWith('BELAJAR')) return true;
  const found = accessCodes.find((c) => c.code.toUpperCase() === upper);
  return Boolean(found?.isTrial);
}

interface LocalDatabase {
  instructors: Instructor[];
  accessCodes: AccessCode[];
  students: Student[];
  progress: ProgressRecord[];
  certificates: CertificateRecord[];
  settings: AppSettings;
}

function createInitialLocalDb(): LocalDatabase {
  const now = new Date().toISOString();
  return {
    instructors: [],
    accessCodes: [
      {
        id: DEFAULT_ACCESS_CODE,
        code: DEFAULT_ACCESS_CODE,
        className: 'Kelas Uji Coba (Level 1)',
        createdByRole: 'admin',
        createdById: 'admin',
        createdByName: 'Admin CodeSpark',
        ownerUid: 'local_admin',
        isActive: true,
        isTrial: true,
        createdAt: now,
      },
    ],
    students: [],
    progress: [],
    certificates: [],
    settings: { ...DEFAULT_APP_SETTINGS, updatedAt: now },
  };
}

function readLocalDb(): LocalDatabase {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const init = createInitialLocalDb();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw) as Partial<LocalDatabase>;
    const accessCodes: AccessCode[] = Array.isArray(parsed.accessCodes)
      ? parsed.accessCodes.map((c) => ({
          ...c,
          isTrial:
            c.isTrial ??
            (c.code.toUpperCase() === DEFAULT_ACCESS_CODE ||
              c.code.toUpperCase().startsWith('BELAJAR')),
        }))
      : [];
    if (accessCodes.length === 0) {
      accessCodes.push(createInitialLocalDb().accessCodes[0]);
    }
    return {
      instructors: Array.isArray(parsed.instructors) ? parsed.instructors : [],
      accessCodes,
      students: Array.isArray(parsed.students) ? parsed.students : [],
      progress: Array.isArray(parsed.progress) ? parsed.progress : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      settings: parsed.settings
        ? {
            adminPhone: String(parsed.settings.adminPhone || ''),
            adminContactName: String(
              parsed.settings.adminContactName || DEFAULT_APP_SETTINGS.adminContactName
            ),
            upgradeMessage: String(
              parsed.settings.upgradeMessage || DEFAULT_APP_SETTINGS.upgradeMessage
            ),
            updatedAt: String(parsed.settings.updatedAt || new Date().toISOString()),
          }
        : { ...DEFAULT_APP_SETTINGS },
    };
  } catch {
    return createInitialLocalDb();
  }
}

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (
    val &&
    typeof val === 'object' &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function mapInstructorDoc(d: QueryDocumentSnapshot<DocumentData>): Instructor {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    name: String(data.name || ''),
    username: String(data.username || ''),
    passwordHash: String(data.passwordHash || ''),
    specialty: String(data.specialty || ''),
    ownerUid: String(data.ownerUid || ''),
    createdAt: timestampToIso(data.createdAt),
  };
}

function mapAccessCodeDoc(d: QueryDocumentSnapshot<DocumentData>): AccessCode {
  const data = d.data();
  const codeStr = String(data.code || d.id);
  return {
    id: String(data.id || d.id),
    code: codeStr,
    className: String(data.className || ''),
    createdByRole: data.createdByRole === 'instructor' ? 'instructor' : 'admin',
    createdById: String(data.createdById || ''),
    createdByName: String(data.createdByName || ''),
    ownerUid: String(data.ownerUid || ''),
    isActive: Boolean(data.isActive),
    isTrial:
      typeof data.isTrial === 'boolean'
        ? data.isTrial
        : codeStr.toUpperCase().startsWith('BELAJAR'),
    createdAt: timestampToIso(data.createdAt),
  };
}

function mapStudentDoc(d: QueryDocumentSnapshot<DocumentData>): Student {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    name: String(data.name || ''),
    username: String(data.username || ''),
    passwordHash: String(data.passwordHash || ''),
    accessCode: String(data.accessCode || ''),
    className: String(data.className || ''),
    instructorId: String(data.instructorId || ''),
    instructorName: String(data.instructorName || ''),
    instructorUid: String(data.instructorUid || ''),
    ownerUid: String(data.ownerUid || ''),
    createdAt: timestampToIso(data.createdAt),
  };
}

function mapProgressDoc(d: QueryDocumentSnapshot<DocumentData>): ProgressRecord {
  const data = d.data();
  const rawStars = Number(data.stars) || 1;
  const stars = Math.min(3, Math.max(1, rawStars)) as 1 | 2 | 3;
  return {
    id: String(data.id || d.id),
    studentId: String(data.studentId || ''),
    levelId: String(data.levelId || ''),
    tier: (data.tier as TierId) || 'pemula',
    stars,
    codeSubmitted: String(data.codeSubmitted || ''),
    language: data.language === 'javascript' ? 'javascript' : 'python',
    ownerUid: String(data.ownerUid || ''),
    instructorUid: String(data.instructorUid || ''),
    completedAt: timestampToIso(data.completedAt),
  };
}

function mapCertDoc(d: QueryDocumentSnapshot<DocumentData>): CertificateRecord {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    certificateNo: String(data.certificateNo || ''),
    studentId: String(data.studentId || ''),
    studentName: String(data.studentName || ''),
    tierId: (data.tierId as TierId) || 'pemula',
    tierName: String(data.tierName || ''),
    instructorName: String(data.instructorName || ''),
    instructorUid: String(data.instructorUid || ''),
    ownerUid: String(data.ownerUid || ''),
    issuedAt: timestampToIso(data.issuedAt),
  };
}

function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of a) map.set(item.id, item);
  for (const item of b) map.set(item.id, item);
  return Array.from(map.values());
}

function isPermissionDeniedError(err: unknown): boolean {
  const code = (err as { code?: string })?.code || '';
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code === 'permission-denied' ||
    msg.toLowerCase().includes('permission-denied') ||
    msg.toLowerCase().includes('missing or insufficient permissions')
  );
}

type Listener = (snapshot: DataStoreSnapshot) => void;

class CodeSparkDataEngine {
  private listeners = new Set<Listener>();
  private firestoreUnsubs: Unsubscribe[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private snapshot: DataStoreSnapshot;
  private initialized = false;
  private connectionAttemptId = 0;

  constructor() {
    const local = readLocalDb();
    this.snapshot = {
      instructors: local.instructors,
      accessCodes: local.accessCodes,
      students: local.students,
      progress: local.progress,
      certificates: local.certificates,
      settings: local.settings,
      mode: 'local',
      firebaseConnected: false,
      firebaseStatus: isFirebaseConfigured() ? 'connecting' : 'offline',
      firebaseError: null,
      firebaseUserEmail: null,
      lastSyncedAt: null,
      loading: false,
    };
  }

  public start() {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === LOCAL_STORAGE_KEY && this.snapshot.mode === 'local') {
          this.reloadLocal();
        }
      });

      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = () => {
          if (this.snapshot.mode === 'local') {
            this.reloadLocal();
          }
        };
      }
    }

    if (isFirebaseConfigured() && auth && db) {
      onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified) {
          void this.connectFirebaseRealtime({
            uid: user.uid,
            email: user.email || '',
            directMode: false,
          });
        } else {
          // Automatically connect in direct realtime mode if Firestore rules allow it
          void this.connectFirebaseRealtime({
            uid: 'direct_client',
            email: null,
            directMode: true,
          });
        }
      });
    }
  }

  public async retryFirebaseConnection(): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    const currentUser = auth?.currentUser;
    if (currentUser && currentUser.emailVerified) {
      await this.connectFirebaseRealtime({
        uid: currentUser.uid,
        email: currentUser.email || '',
        directMode: false,
      });
    } else {
      await this.connectFirebaseRealtime({
        uid: 'direct_client',
        email: null,
        directMode: true,
      });
    }
  }

  private fallbackToLocal(
    status: 'auth_required' | 'offline',
    errorMessage: string | null,
    userEmail: string | null = null
  ) {
    this.cleanupFirestoreListeners();
    const local = readLocalDb();
    this.snapshot = {
      instructors: local.instructors,
      accessCodes: local.accessCodes,
      students: local.students,
      progress: local.progress,
      certificates: local.certificates,
      settings: local.settings,
      mode: 'local',
      firebaseConnected: false,
      firebaseStatus: status,
      firebaseError: errorMessage,
      firebaseUserEmail: userEmail,
      lastSyncedAt: null,
      loading: false,
    };
    this.emit();
  }

  private async connectFirebaseRealtime(opts: {
    uid: string;
    email: string | null;
    directMode: boolean;
  }) {
    if (!db) return;
    const attemptId = ++this.connectionAttemptId;
    this.cleanupFirestoreListeners();

    this.snapshot = {
      ...this.snapshot,
      firebaseStatus: 'connecting',
      firebaseError: null,
      firebaseUserEmail: opts.email,
      loading: true,
    };
    this.emit();

    // Probe Firestore server reachability & permission before switching mode
    try {
      await getDocFromServer(doc(db, 'settings', 'app_config'));
      if (opts.directMode) {
        // Verify collection list access works in direct mode
        await getDocsFromServer(query(collection(db, 'access_codes'), limit(1)));
      }
    } catch (error) {
      if (attemptId !== this.connectionAttemptId) return;
      if (isPermissionDeniedError(error)) {
        this.fallbackToLocal(
          'auth_required',
          opts.directMode
            ? 'Aturan keamanan Firestore (firestore.rules) aktif. Klik "Hubungkan Firebase (Google)" untuk menyalakan sinkronisasi cloud realtime.'
            : 'Akun Google Anda belum mendapat izin baca/tulis pada Firestore rules proyek ini.',
          opts.email
        );
        return;
      }
      this.fallbackToLocal(
        'offline',
        'Cloud Firestore (default) pada proyek codespark-a5c49 belum dapat dijangkau. Pastikan Cloud Firestore sudah dibuat di Firebase Console.',
        opts.email
      );
      return;
    }

    if (attemptId !== this.connectionAttemptId) return;

    this.snapshot = {
      ...this.snapshot,
      mode: 'firebase',
      firebaseConnected: true,
      firebaseStatus: 'connected',
      firebaseError: null,
      firebaseUserEmail: opts.email,
      lastSyncedAt: new Date().toISOString(),
      loading: true,
    };
    this.emit();

    this.attachFirestoreListeners(opts.uid, opts.email || '', opts.directMode, attemptId);
  }

  private cleanupFirestoreListeners() {
    for (const unsub of this.firestoreUnsubs) {
      unsub();
    }
    this.firestoreUnsubs = [];
  }

  private async ensureDefaultCloudRecords(uid: string) {
    if (!db) return;
    const codeRef = doc(db, 'access_codes', DEFAULT_ACCESS_CODE);
    try {
      const existing = await getDoc(codeRef);
      if (!existing.exists()) {
        await setDoc(codeRef, {
          id: DEFAULT_ACCESS_CODE,
          code: DEFAULT_ACCESS_CODE,
          className: 'Kelas Uji Coba (Level 1)',
          createdByRole: 'admin',
          createdById: 'admin',
          createdByName: 'Admin CodeSpark',
          ownerUid: uid,
          isActive: true,
          isTrial: true,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.warn('Default access code seed skipped:', error);
    }

    const settingsRef = doc(db, 'settings', 'app_config');
    try {
      const existingSettings = await getDoc(settingsRef);
      if (!existingSettings.exists()) {
        await setDoc(settingsRef, {
          adminPhone: DEFAULT_APP_SETTINGS.adminPhone,
          adminContactName: DEFAULT_APP_SETTINGS.adminContactName,
          upgradeMessage: DEFAULT_APP_SETTINGS.upgradeMessage,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.warn('Default settings seed skipped:', error);
    }
  }

  private attachFirestoreListeners(
    uid: string,
    email: string,
    directMode: boolean,
    attemptId: number
  ) {
    if (!db) return;
    const isAdminUser =
      directMode || email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

    if (isAdminUser) {
      void this.ensureDefaultCloudRecords(uid);
    }

    const onListenerError = (path: string) => (error: Error) => {
      if (attemptId !== this.connectionAttemptId) return;
      console.warn(`Firestore listener notice (${path}):`, error.message);
      if (isPermissionDeniedError(error)) {
        this.fallbackToLocal(
          'auth_required',
          'Akses Firestore membutuhkan Login Google sesuai firestore.rules.',
          email || null
        );
      }
    };

    const touchSync = () => new Date().toISOString();

    // 1. Global App Settings (Admin Phone / WhatsApp / Upgrade Message)
    this.firestoreUnsubs.push(
      onSnapshot(
        doc(db, 'settings', 'app_config'),
        (snap) => {
          if (attemptId !== this.connectionAttemptId) return;
          if (snap.exists()) {
            const data = snap.data();
            this.snapshot = {
              ...this.snapshot,
              settings: {
                adminPhone: String(data.adminPhone || ''),
                adminContactName: String(
                  data.adminContactName || DEFAULT_APP_SETTINGS.adminContactName
                ),
                upgradeMessage: String(
                  data.upgradeMessage || DEFAULT_APP_SETTINGS.upgradeMessage
                ),
                updatedAt: timestampToIso(data.updatedAt),
              },
              lastSyncedAt: touchSync(),
            };
            this.emit();
          }
        },
        (error) => {
          console.warn('Settings listener notice:', error.message);
        }
      )
    );

    // 2. Instructors
    const qInstructors = isAdminUser
      ? collection(db, 'instructors')
      : query(collection(db, 'instructors'), where('ownerUid', '==', uid));

    this.firestoreUnsubs.push(
      onSnapshot(
        qInstructors,
        (snap) => {
          if (attemptId !== this.connectionAttemptId) return;
          this.snapshot = {
            ...this.snapshot,
            instructors: snap.docs.map(mapInstructorDoc),
            lastSyncedAt: touchSync(),
            loading: false,
          };
          this.emit();
        },
        onListenerError('instructors')
      )
    );

    // 3. Access Codes
    const qCodes = isAdminUser
      ? collection(db, 'access_codes')
      : query(collection(db, 'access_codes'), where('ownerUid', '==', uid));

    this.firestoreUnsubs.push(
      onSnapshot(
        qCodes,
        (snap) => {
          if (attemptId !== this.connectionAttemptId) return;
          this.snapshot = {
            ...this.snapshot,
            accessCodes: snap.docs.map(mapAccessCodeDoc),
            lastSyncedAt: touchSync(),
            loading: false,
          };
          this.emit();
        },
        onListenerError('access_codes')
      )
    );

    // 4, 5, 6. Students, Progress, Certificates
    if (isAdminUser) {
      this.firestoreUnsubs.push(
        onSnapshot(
          collection(db, 'students'),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            this.snapshot = {
              ...this.snapshot,
              students: snap.docs.map(mapStudentDoc),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('students')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          collection(db, 'progress'),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            this.snapshot = {
              ...this.snapshot,
              progress: snap.docs.map(mapProgressDoc),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('progress')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          collection(db, 'certificates'),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            this.snapshot = {
              ...this.snapshot,
              certificates: snap.docs.map(mapCertDoc),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('certificates')
        )
      );
    } else {
      // Non-admin Google user (Student or Instructor): merge ownerUid + instructorUid queries
      let ownStudents: Student[] = [];
      let mentoredStudents: Student[] = [];
      let ownProgress: ProgressRecord[] = [];
      let mentoredProgress: ProgressRecord[] = [];
      let ownCerts: CertificateRecord[] = [];
      let mentoredCerts: CertificateRecord[] = [];

      this.firestoreUnsubs.push(
        onSnapshot(
          query(collection(db, 'students'), where('ownerUid', '==', uid)),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            ownStudents = snap.docs.map(mapStudentDoc);
            this.snapshot = {
              ...this.snapshot,
              students: mergeById(ownStudents, mentoredStudents),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('students:owner')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          query(collection(db, 'students'), where('instructorUid', '==', uid)),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            mentoredStudents = snap.docs.map(mapStudentDoc);
            this.snapshot = {
              ...this.snapshot,
              students: mergeById(ownStudents, mentoredStudents),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('students:instructor')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          query(collection(db, 'progress'), where('ownerUid', '==', uid)),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            ownProgress = snap.docs.map(mapProgressDoc);
            this.snapshot = {
              ...this.snapshot,
              progress: mergeById(ownProgress, mentoredProgress),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('progress:owner')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          query(collection(db, 'progress'), where('instructorUid', '==', uid)),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            mentoredProgress = snap.docs.map(mapProgressDoc);
            this.snapshot = {
              ...this.snapshot,
              progress: mergeById(ownProgress, mentoredProgress),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('progress:instructor')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          query(collection(db, 'certificates'), where('ownerUid', '==', uid)),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            ownCerts = snap.docs.map(mapCertDoc);
            this.snapshot = {
              ...this.snapshot,
              certificates: mergeById(ownCerts, mentoredCerts),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('certificates:owner')
        )
      );

      this.firestoreUnsubs.push(
        onSnapshot(
          query(collection(db, 'certificates'), where('instructorUid', '==', uid)),
          (snap) => {
            if (attemptId !== this.connectionAttemptId) return;
            mentoredCerts = snap.docs.map(mapCertDoc);
            this.snapshot = {
              ...this.snapshot,
              certificates: mergeById(ownCerts, mentoredCerts),
              lastSyncedAt: touchSync(),
              loading: false,
            };
            this.emit();
          },
          onListenerError('certificates:instructor')
        )
      );
    }
  }

  private reloadLocal() {
    const local = readLocalDb();
    this.snapshot = {
      ...this.snapshot,
      instructors: local.instructors,
      accessCodes: local.accessCodes,
      students: local.students,
      progress: local.progress,
      certificates: local.certificates,
      settings: local.settings,
    };
    this.emit();
  }

  private writeLocalDb(updater: (dbState: LocalDatabase) => LocalDatabase) {
    const current = readLocalDb();
    const updated = updater(current);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    this.broadcastChannel?.postMessage({ type: 'sync', ts: Date.now() });
    this.reloadLocal();
  }

  private emit() {
    const snap = this.snapshot;
    this.listeners.forEach((fn) => fn(snap));
  }

  public getSnapshot(): DataStoreSnapshot {
    return this.snapshot;
  }

  public subscribe(listener: Listener): () => void {
    this.start();
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ===================== ADMIN SETTINGS (PHONE / WHATSAPP) =====================

  public async saveAppSettings(input: {
    adminPhone: string;
    adminContactName: string;
    upgradeMessage: string;
  }): Promise<AppSettings> {
    const adminPhone = clampString(input.adminPhone, 30);
    const adminContactName = clampString(input.adminContactName, 100);
    const upgradeMessage = clampString(input.upgradeMessage, 500);

    if (adminContactName.length < 2) {
      throw new Error('Nama kontak admin minimal 2 karakter.');
    }
    if (upgradeMessage.length < 5) {
      throw new Error('Pesan panduan upgrade minimal 5 karakter.');
    }

    const now = new Date().toISOString();
    const record: AppSettings = {
      adminPhone,
      adminContactName,
      upgradeMessage,
      updatedAt: now,
    };

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await setDoc(doc(db, 'settings', 'app_config'), {
          adminPhone,
          adminContactName,
          upgradeMessage,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'settings/app_config');
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        settings: record,
      }));
    }

    return record;
  }

  // ===================== INSTRUCTOR CRUD =====================

  public async createInstructor(input: {
    name: string;
    username: string;
    password: string;
    specialty: string;
  }): Promise<Instructor> {
    const name = clampString(input.name, 100);
    const username = clampString(input.username, 50).toLowerCase();
    const specialty = clampString(input.specialty, 120);

    if (name.length < 2) throw new Error('Nama instruktur minimal 2 karakter.');
    if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) {
      throw new Error('Username instruktur harus 3-50 karakter (huruf, angka, titik, underscore, atau strip).');
    }
    if (input.password.length < 4) throw new Error('Password minimal 4 karakter.');
    if (specialty.length < 2) throw new Error('Bidang keahlian minimal 2 karakter.');

    const duplicate = this.snapshot.instructors.some((i) => i.username.toLowerCase() === username);
    if (duplicate) throw new Error(`Username "${username}" sudah digunakan instruktur lain.`);

    const id = sanitizeId('inst');
    const passwordHash = await hashPassword(input.password);
    const ownerUid =
      this.snapshot.mode === 'firebase' && auth?.currentUser ? auth.currentUser.uid : 'local_admin';
    const now = new Date().toISOString();

    const record: Instructor = {
      id,
      name,
      username,
      passwordHash,
      specialty,
      ownerUid,
      createdAt: now,
    };

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await setDoc(doc(db, 'instructors', id), {
          id,
          name,
          username,
          passwordHash,
          specialty,
          ownerUid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `instructors/${id}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        instructors: [record, ...state.instructors],
      }));
    }

    return record;
  }

  public async deleteInstructor(instructorId: string): Promise<void> {
    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await deleteDoc(doc(db, 'instructors', instructorId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `instructors/${instructorId}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        instructors: state.instructors.filter((i) => i.id !== instructorId),
      }));
    }
  }

  // ===================== ACCESS CODE CRUD =====================

  public async createAccessCode(input: {
    code: string;
    className: string;
    createdByRole: 'admin' | 'instructor';
    createdById: string;
    createdByName: string;
    isTrial?: boolean;
  }): Promise<AccessCode> {
    const code = clampString(input.code, 32)
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '');
    const className = clampString(input.className, 100);

    if (code.length < 3) throw new Error('Kode akses minimal 3 karakter (huruf kapital, angka, atau strip).');
    if (className.length < 2) throw new Error('Nama kelas minimal 2 karakter.');

    const exists = this.snapshot.accessCodes.some((c) => c.code.toUpperCase() === code);
    if (exists) throw new Error(`Kode akses "${code}" sudah terdaftar. Gunakan kode lain.`);

    const ownerUid =
      this.snapshot.mode === 'firebase' && auth?.currentUser ? auth.currentUser.uid : 'local_admin';
    const now = new Date().toISOString();
    const isTrial = input.isTrial ?? code.startsWith('BELAJAR');

    const record: AccessCode = {
      id: code,
      code,
      className,
      createdByRole: input.createdByRole,
      createdById: input.createdById,
      createdByName: clampString(input.createdByName, 100),
      ownerUid,
      isActive: true,
      isTrial,
      createdAt: now,
    };

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await setDoc(doc(db, 'access_codes', code), {
          id: code,
          code,
          className,
          createdByRole: input.createdByRole,
          createdById: input.createdById,
          createdByName: clampString(input.createdByName, 100),
          ownerUid,
          isActive: true,
          isTrial,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `access_codes/${code}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        accessCodes: [record, ...state.accessCodes],
      }));
    }

    return record;
  }

  public async toggleAccessCode(codeId: string, isActive: boolean): Promise<void> {
    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await updateDoc(doc(db, 'access_codes', codeId), { isActive });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `access_codes/${codeId}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        accessCodes: state.accessCodes.map((c) => (c.id === codeId ? { ...c, isActive } : c)),
      }));
    }
  }

  public async deleteAccessCode(codeId: string): Promise<void> {
    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await deleteDoc(doc(db, 'access_codes', codeId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `access_codes/${codeId}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        accessCodes: state.accessCodes.filter((c) => c.id !== codeId),
      }));
    }
  }

  public async lookupAccessCode(rawCode: string): Promise<AccessCode | null> {
    const code = rawCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return null;

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        const snap = await getDoc(doc(db, 'access_codes', code));
        if (!snap.exists()) return null;
        const data = snap.data();
        const codeStr = String(data.code || snap.id);
        return {
          id: String(data.id || snap.id),
          code: codeStr,
          className: String(data.className || ''),
          createdByRole: data.createdByRole === 'instructor' ? 'instructor' : 'admin',
          createdById: String(data.createdById || ''),
          createdByName: String(data.createdByName || ''),
          ownerUid: String(data.ownerUid || ''),
          isActive: Boolean(data.isActive),
          isTrial:
            typeof data.isTrial === 'boolean'
              ? data.isTrial
              : codeStr.toUpperCase().startsWith('BELAJAR'),
          createdAt: timestampToIso(data.createdAt),
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `access_codes/${code}`);
      }
    }

    return this.snapshot.accessCodes.find((c) => c.code.toUpperCase() === code) || null;
  }

  // ===================== STUDENT AUTH, REGISTRATION & UPGRADE =====================

  public async registerStudent(input: {
    name: string;
    username: string;
    password: string;
    accessCode: string;
  }): Promise<Student> {
    const name = clampString(input.name, 100);
    const username = clampString(input.username, 50).toLowerCase();
    const codeStr = clampString(input.accessCode, 32).toUpperCase();

    if (name.length < 2) throw new Error('Nama lengkap minimal 2 karakter.');
    if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) {
      throw new Error('Username harus 3-50 karakter (huruf, angka, titik, underscore, atau strip).');
    }
    if (input.password.length < 4) throw new Error('Password minimal 4 karakter.');

    const matchedCode = await this.lookupAccessCode(codeStr);
    if (!matchedCode) {
      throw new Error(`Kode Akses "${codeStr}" tidak ditemukan! Periksa kembali kode dari instruktur/admin.`);
    }
    if (!matchedCode.isActive) {
      throw new Error(`Kode Akses "${codeStr}" saat ini sedang NONAKTIF. Hubungi instruktur/admin.`);
    }

    const duplicate = this.snapshot.students.some((s) => s.username.toLowerCase() === username);
    if (duplicate) {
      throw new Error(`Username "${username}" sudah terdaftar. Silakan gunakan username lain atau langsung Masuk.`);
    }

    const id = sanitizeId('stu');
    const passwordHash = await hashPassword(input.password);
    const ownerUid =
      this.snapshot.mode === 'firebase' && auth?.currentUser ? auth.currentUser.uid : id;
    const now = new Date().toISOString();

    const record: Student = {
      id,
      name,
      username,
      passwordHash,
      accessCode: matchedCode.code,
      className: matchedCode.className,
      instructorId: matchedCode.createdById,
      instructorName: matchedCode.createdByName,
      instructorUid: matchedCode.ownerUid,
      ownerUid,
      createdAt: now,
    };

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await setDoc(doc(db, 'students', id), {
          id,
          name,
          username,
          passwordHash,
          accessCode: matchedCode.code,
          className: matchedCode.className,
          instructorId: matchedCode.createdById,
          instructorName: matchedCode.createdByName,
          instructorUid: matchedCode.ownerUid,
          ownerUid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `students/${id}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        students: [record, ...state.students],
      }));
    }

    return record;
  }

  public async upgradeStudentAccessCode(studentId: string, rawCode: string): Promise<Student> {
    const codeStr = clampString(rawCode, 32).toUpperCase();
    const matchedCode = await this.lookupAccessCode(codeStr);
    if (!matchedCode) {
      throw new Error(`Kode Akses "${codeStr}" tidak ditemukan! Minta kode kelas penuh dari Admin.`);
    }
    if (!matchedCode.isActive) {
      throw new Error(`Kode Akses "${codeStr}" sedang nonaktif.`);
    }
    if (matchedCode.isTrial || codeStr.startsWith('BELAJAR')) {
      throw new Error(`Kode "${codeStr}" adalah kode uji coba (Level 1 saja). Masukkan Kode Akses Kelas Penuh dari Admin.`);
    }

    const existing = this.snapshot.students.find((s) => s.id === studentId);
    if (!existing) throw new Error('Data siswa tidak ditemukan.');

    const updated: Student = {
      ...existing,
      accessCode: matchedCode.code,
      className: matchedCode.className,
      instructorId: matchedCode.createdById,
      instructorName: matchedCode.createdByName,
      instructorUid: matchedCode.ownerUid,
    };

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        await updateDoc(doc(db, 'students', studentId), {
          accessCode: matchedCode.code,
          className: matchedCode.className,
          instructorId: matchedCode.createdById,
          instructorName: matchedCode.createdByName,
          instructorUid: matchedCode.ownerUid,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
      }
    } else {
      this.writeLocalDb((state) => ({
        ...state,
        students: state.students.map((s) => (s.id === studentId ? updated : s)),
      }));
    }

    return updated;
  }

  public async authenticateStudent(username: string, password: string): Promise<Student> {
    const normalized = username.trim().toLowerCase();
    const hash = await hashPassword(password);
    let found = this.snapshot.students.find(
      (s) => s.username.toLowerCase() === normalized && s.passwordHash === hash
    );
    if (!found && this.snapshot.mode === 'firebase' && db) {
      try {
        const snap = await getDocs(
          query(collection(db, 'students'), where('username', '==', normalized), limit(5))
        );
        const matched = snap.docs
          .map(mapStudentDoc)
          .find((s) => s.passwordHash === hash);
        if (matched) found = matched;
      } catch (err) {
        console.warn('Direct student query skipped:', err);
      }
    }
    if (!found) {
      throw new Error('Username atau password siswa tidak cocok.');
    }
    return found;
  }

  public async authenticateInstructor(username: string, password: string): Promise<Instructor> {
    const normalized = username.trim().toLowerCase();
    const hash = await hashPassword(password);
    let found = this.snapshot.instructors.find(
      (i) => i.username.toLowerCase() === normalized && i.passwordHash === hash
    );
    if (!found && this.snapshot.mode === 'firebase' && db) {
      try {
        const snap = await getDocs(
          query(collection(db, 'instructors'), where('username', '==', normalized), limit(5))
        );
        const matched = snap.docs
          .map(mapInstructorDoc)
          .find((i) => i.passwordHash === hash);
        if (matched) found = matched;
      } catch (err) {
        console.warn('Direct instructor query skipped:', err);
      }
    }
    if (!found) {
      throw new Error('Username atau password instruktur tidak cocok.');
    }
    return found;
  }

  // ===================== PROGRESS & AUTO CERTIFICATES =====================

  public async saveLevelProgress(input: {
    student: Student;
    levelId: string;
    tier: TierId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
    language: CodeLanguage;
  }): Promise<{ progress: ProgressRecord; newCertificate: CertificateRecord | null }> {
    const progressId = `${input.student.id}_${input.levelId}`;
    const existing = this.snapshot.progress.find((p) => p.id === progressId);
    const bestStars = (existing ? Math.max(existing.stars, input.stars) : input.stars) as 1 | 2 | 3;
    const trimmedCode = clampString(input.codeSubmitted, 4000) || 'forward(1)';
    const ownerUid =
      this.snapshot.mode === 'firebase' && auth?.currentUser ? auth.currentUser.uid : input.student.ownerUid;
    const now = new Date().toISOString();

    const record: ProgressRecord = {
      id: progressId,
      studentId: input.student.id,
      levelId: input.levelId,
      tier: input.tier,
      stars: bestStars,
      codeSubmitted: trimmedCode,
      language: input.language,
      ownerUid,
      instructorUid: input.student.instructorUid,
      completedAt: now,
    };

    if (this.snapshot.mode === 'firebase' && db) {
      try {
        if (existing) {
          await updateDoc(doc(db, 'progress', progressId), {
            stars: bestStars,
            codeSubmitted: trimmedCode,
            language: input.language,
            completedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, 'progress', progressId), {
            id: progressId,
            studentId: input.student.id,
            levelId: input.levelId,
            tier: input.tier,
            stars: bestStars,
            codeSubmitted: trimmedCode,
            language: input.language,
            ownerUid,
            instructorUid: input.student.instructorUid,
            completedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, existing ? OperationType.UPDATE : OperationType.CREATE, `progress/${progressId}`);
      }
    } else {
      this.writeLocalDb((state) => {
        const others = state.progress.filter((p) => p.id !== progressId);
        return {
          ...state,
          progress: [record, ...others],
        };
      });
    }

    const tierLevels = getLevelsByTier(input.tier);
    const studentCompletedIds = new Set(
      this.snapshot.progress
        .filter((p) => p.studentId === input.student.id)
        .map((p) => p.levelId)
    );
    studentCompletedIds.add(input.levelId);

    const allTierDone = tierLevels.every((lvl) => studentCompletedIds.has(lvl.id));
    let newCertificate: CertificateRecord | null = null;

    if (allTierDone) {
      const certId = `${input.student.id}_${input.tier}`;
      const existingCert = this.snapshot.certificates.find((c) => c.id === certId);
      if (!existingCert) {
        const tierMeta = getTierMeta(input.tier);
        const certNo = generateCertificateNo(input.tier);
        const certRecord: CertificateRecord = {
          id: certId,
          certificateNo: certNo,
          studentId: input.student.id,
          studentName: input.student.name,
          tierId: input.tier,
          tierName: tierMeta.certificateTitle,
          instructorName: input.student.instructorName,
          instructorUid: input.student.instructorUid,
          ownerUid,
          issuedAt: now,
        };

        if (this.snapshot.mode === 'firebase' && db) {
          try {
            await setDoc(doc(db, 'certificates', certId), {
              id: certId,
              certificateNo: certNo,
              studentId: input.student.id,
              studentName: input.student.name,
              tierId: input.tier,
              tierName: tierMeta.certificateTitle,
              instructorName: input.student.instructorName,
              instructorUid: input.student.instructorUid,
              ownerUid,
              issuedAt: serverTimestamp(),
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `certificates/${certId}`);
          }
        } else {
          this.writeLocalDb((state) => ({
            ...state,
            certificates: [certRecord, ...state.certificates],
          }));
        }
        newCertificate = certRecord;
      }
    }

    return { progress: record, newCertificate };
  }
}

export const dataEngine = new CodeSparkDataEngine();
