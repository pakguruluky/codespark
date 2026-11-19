import { useState, useEffect } from 'react';
import { dataEngine } from './services/dataEngine';
import type { AppSession, DataStoreSnapshot, UserRole } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { StudentDashboard } from './components/StudentDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';

const SESSION_KEY = 'codespark_active_session_v1';

function loadSavedSession(): AppSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppSession) : null;
  } catch {
    return null;
  }
}

type PublicView =
  | { page: 'landing' }
  | { page: 'auth'; mode: 'login' | 'register'; role: UserRole };

export default function App() {
  const [store, setStore] = useState<DataStoreSnapshot>(() => dataEngine.getSnapshot());
  const [session, setSession] = useState<AppSession | null>(() => loadSavedSession());
  const [publicView, setPublicView] = useState<PublicView>({ page: 'landing' });

  useEffect(() => {
    return dataEngine.subscribe((nextSnap) => {
      setStore(nextSnap);
    });
  }, []);

  const handleAuthenticated = (nextSession: AppSession) => {
    setSession(nextSession);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } catch {
      // ignore storage quota
    }
  };

  const handleLogout = () => {
    setSession(null);
    setPublicView({ page: 'landing' });
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <ErrorBoundary>
      {session ? (
        session.role === 'student' ? (
          <StudentDashboard
            session={session}
            store={store}
            onLogout={handleLogout}
            onUpdateSession={handleAuthenticated}
          />
        ) : session.role === 'instructor' ? (
          <InstructorDashboard session={session} store={store} onLogout={handleLogout} />
        ) : (
          <AdminDashboard session={session} store={store} onLogout={handleLogout} />
        )
      ) : publicView.page === 'landing' ? (
        <LandingPage
          onGoLogin={(role = 'student') =>
            setPublicView({ page: 'auth', mode: 'login', role })
          }
          onGoRegister={() =>
            setPublicView({ page: 'auth', mode: 'register', role: 'student' })
          }
        />
      ) : (
        <AuthPage
          initialMode={publicView.mode}
          initialRole={publicView.role}
          firebaseStatus={store.firebaseStatus}
          onBack={() => setPublicView({ page: 'landing' })}
          onAuthenticated={handleAuthenticated}
        />
      )}

      <FirebaseStatusModal
        mode={store.mode}
        firebaseStatus={store.firebaseStatus}
        firebaseError={store.firebaseError}
        firebaseUserEmail={store.firebaseUserEmail}
        lastSyncedAt={store.lastSyncedAt}
      />
    </ErrorBoundary>
  );
}
