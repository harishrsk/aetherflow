import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AuthModal } from './components/AuthModal';

function AppContent() {
  const { signOutUser } = useApp();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    setView('landing');
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage 
          onEnterApp={() => setView('dashboard')} 
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <Dashboard 
          onLogout={handleLogout} 
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
