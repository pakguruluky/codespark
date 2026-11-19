/**
 * Konfigurasi Firebase Firestore untuk CodeSpark (Vercel & Production Ready).
 *
 * Mendukung environment variables Vercel (VITE_FIREBASE_*) sekaligus terhubung
 * langsung ke proyek Firebase `codespark-a5c49`.
 */
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyA6Av0_mjqBHY7TYC-8f-cOE5o8YiXgPmk',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'codespark-a5c49.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'codespark-a5c49',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'codespark-a5c49.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '108743048688',
  appId: env.VITE_FIREBASE_APP_ID || '1:108743048688:web:28dc4c241be0e5bdbe7135',
  firestoreDatabaseId:
    env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-938dd198-ef1c-41d0-af0f-fdd235abce03',
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
