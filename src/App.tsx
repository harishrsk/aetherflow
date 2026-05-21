import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AuthModal } from './components/AuthModal';

function AppContent() {
  const { signOutUser, showToast } = useApp();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check if there are error parameters in the hash or query string from Supabase redirects
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (hash && hash.startsWith('#')) {
      const params = new URLSearchParams(hash.substring(1));
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      if (error || errorDescription) {
        const decodedDesc = errorDescription ? decodeURIComponent(errorDescription).replace(/\+/g, ' ') : '';
        showToast(decodedDesc || error || 'Authentication redirection error', 'error');
        // Clear hash to prevent alert on subsequent refreshes
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    
    if (searchParams.has('error')) {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const decodedDesc = errorDescription ? decodeURIComponent(errorDescription).replace(/\+/g, ' ') : '';
      showToast(decodedDesc || error || 'Authentication error', 'error');
      // Clear query params
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }, [showToast]);

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
