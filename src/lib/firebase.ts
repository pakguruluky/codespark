import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../firebaseConfig.js';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    const useNamedDb =
      Boolean(firebaseConfig.firestoreDatabaseId) &&
      firebaseConfig.firestoreDatabaseId !== '(default)';

    try {
      dbInstance = useNamedDb
        ? initializeFirestore(
            app,
            { experimentalAutoDetectLongPolling: true },
            firebaseConfig.firestoreDatabaseId
          )
        : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
    } catch {
      dbInstance = useNamedDb
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    }

    authInstance = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization skipped, using Local Realtime Engine:', err);
  }
}

export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<{ ok: boolean; offline?: boolean }> {
  if (!db) return { ok: false, offline: true };
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline') || msg.includes('Failed to get document')) {
      return { ok: false, offline: true };
    }
    // Permission denied / not-found means Firestore endpoint IS reachable
    return { ok: true };
  }
}

export async function connectFirebaseWithGoogle(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase belum dikonfigurasi pada src/firebaseConfig.js.');
  }
  await signInWithPopup(auth, googleProvider);
}

export async function disconnectFirebaseGoogle(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

