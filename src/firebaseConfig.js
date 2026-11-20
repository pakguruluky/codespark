/**
 * Konfigurasi Firebase Firestore untuk CodeSpark (Vercel & Production Ready).
 *
 * Mendukung environment variables Vercel (VITE_FIREBASE_*) sekaligus terhubung
 * langsung ke proyek Firebase `codesparknew-e460e` (database `(default)`).
 */
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAPzkDvm5ZW2VuKCaEGLuT3DrhuCACUsyc',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'codesparknew-e460e.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'codesparknew-e460e',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'codesparknew-e460e.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '412507962548',
  appId: env.VITE_FIREBASE_APP_ID || '1:412507962548:web:a2fe2a8c2e5989fdb86be1',
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || '(default)',
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
