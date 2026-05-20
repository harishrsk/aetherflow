import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <AppProvider>
      {view === 'landing' ? (
        <LandingPage onEnterApp={() => setView('dashboard')} />
      ) : (
        <Dashboard onLogout={() => setView('landing')} />
      )}
    </AppProvider>
  );
}

export default App;
