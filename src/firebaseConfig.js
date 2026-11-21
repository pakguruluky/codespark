import appletConfig from '../firebase-applet-config.json';

/**
 * Konfigurasi Firebase Firestore untuk CodeSpark.
 *
 * Menggunakan konfigurasi proyek & database yang telah diprovisioning pada
 * `firebase-applet-config.json` (mendukung override environment variables
 * `VITE_FIREBASE_*` jika di-deploy secara mandiri).
 */
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || appletConfig.appId || '',
  firestoreDatabaseId:
    env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || '(default)',
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.startsWith('YOUR_') &&
      firebaseConfig.projectId &&
      !firebaseConfig.projectId.startsWith('YOUR_') &&
      firebaseConfig.projectId !== 'remixed-project-id'
  );
}
