import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { AIWriter } from './dashboard/AIWriter';
import { AIImageStudio } from './dashboard/AIImageStudio';
import { Calendar } from './dashboard/Calendar';
import { Analytics } from './dashboard/Analytics';

import { 
  Sparkles, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  BarChart3, 
  ChevronDown, 
  Search, 
  Bell, 
  LogOut, 
  Key, 
  Check, 
  Cpu,
  User,
  Zap
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'writer' | 'studio' | 'calendar' | 'analytics';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user, apiKey, setApiKey } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('writer');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('My Hub');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'writer':
        return <AIWriter />;
      case 'studio':
        return <AIImageStudio />;
      case 'calendar':
        return <Calendar />;
      case 'analytics':
        return <Analytics />;
      default:
        return <AIWriter />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'writer': return 'AI Content Copywriter';
      case 'studio': return 'Creative Image Studio';
      case 'calendar': return 'Social Media Scheduler';
      case 'analytics': return 'Performance & Lead Analytics';
    }
  };

  const creditPercentage = Math.max(0, Math.min(100, (user.credits / user.totalCredits) * 100));

  return (
    <div style={dashboardLayoutContainer}>
      {/* Sidebar */}
      <aside className="glass" style={sidebarStyle}>
        {/* Workspace Dropdown */}
        <div style={workspaceSelectorContainer}>
          <div 
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            style={workspaceSelectorStyle}
          >
            <div style={workspaceLogoStyle}>
              <Cpu size={16} color="#8b5cf6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedWorkspace}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Personal Workspace</div>
            </div>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </div>

          {showWorkspaceMenu && (
            <div className="glass" style={workspaceDropdownStyle}>
              <div 
                style={workspaceItemStyle} 
                onClick={() => { setSelectedWorkspace('My Hub'); setShowWorkspaceMenu(false); }}
              >
                My Hub
              </div>
              <div 
                style={workspaceItemStyle} 
                onClick={() => { setSelectedWorkspace('Acme Corp'); setShowWorkspaceMenu(false); }}
              >
                Acme Corp (Demo)
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={navigationStyle}>
          <div 
            onClick={() => setActiveTab('writer')}
            style={{
              ...navItemStyle,
              background: activeTab === 'writer' ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: activeTab === 'writer' ? 'var(--color-primary)' : 'var(--text-secondary)'
            }}
          >
            <Sparkles size={16} />
            <span>AI Copywriter</span>
          </div>

          <div 
            onClick={() => setActiveTab('studio')}
            style={{
              ...navItemStyle,
              background: activeTab === 'studio' ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: activeTab === 'studio' ? 'var(--color-secondary)' : 'var(--text-secondary)'
            }}
          >
            <ImageIcon size={16} />
            <span>Image Studio</span>
          </div>

          <div 
            onClick={() => setActiveTab('calendar')}
            style={{
              ...navItemStyle,
              background: activeTab === 'calendar' ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--color-indigo)' : 'var(--text-secondary)'
            }}
          >
            <CalendarIcon size={16} />
            <span>Social Planner</span>
          </div>

          <div 
            onClick={() => setActiveTab('analytics')}
            style={{
              ...navItemStyle,
              background: activeTab === 'analytics' ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--color-pink)' : 'var(--text-secondary)'
            }}
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </div>
        </nav>

        {/* Footer Area with Credit Meter & API Settings */}
        <div style={sidebarFooterStyle}>
          {/* Credit Bar */}
          <div style={creditCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span>Credits Limit</span>
              <span style={{ fontWeight: 600 }}>{user.credits} / {user.totalCredits}</span>
            </div>
            <div style={creditTrackStyle}>
              <div 
                style={{
                  ...creditProgressStyle,
                  width: `${creditPercentage}%`,
                  background: user.tier === 'premium' 
                    ? 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' 
                    : 'var(--color-primary)'
                }}
              ></div>
            </div>
            {user.tier === 'free' && (
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="btn btn-primary"
                style={upgradeSidebarButtonStyle}
              >
                <Zap size={12} style={{ fill: 'currentColor' }} /> Upgrade (500 credits)
              </button>
            )}
          </div>

          {/* API Keys Configuration Toggle */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
            <button 
              onClick={() => setShowApiSettings(!showApiSettings)}
              style={apiToggleButtonStyle}
            >
              <Key size={14} />
              <span>Developer Keys</span>
              <ChevronDown size={12} style={{ marginLeft: 'auto', transform: showApiSettings ? 'rotate(180deg)' : 'none' }} />
            </button>

            {showApiSettings && (
              <form onSubmit={handleSaveKey} style={{ marginTop: '10px' }}>
                <input 
                  type="password"
                  placeholder="Gemini API Key..."
                  className="form-input"
                  style={apiKeyInputStyle}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={apiSaveButtonStyle}>
                  {keySaved ? <><Check size={12} color="var(--success)" /> Saved</> : 'Save Key'}
                </button>
              </form>
            )}
          </div>

          {/* User Profile */}
          <div style={profileContainerStyle}>
            <div style={avatarStyle}>
              <User size={14} color="#ffffff" />
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{user.email}</div>
            </div>
            <button onClick={onLogout} style={logoutButtonStyle} title="Sign Out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        {/* Header */}
        <header style={dashboardHeaderStyle}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{getTabTitle()}</h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AetherFlow Workspace Workspace v2.0</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search */}
            <div style={searchContainerStyle}>
              <Search size={14} style={searchIconStyle} />
              <input type="text" placeholder="Search templates..." style={searchInputStyle} />
            </div>

            {/* Notifications */}
            <div style={iconBadgeContainerStyle}>
              <Bell size={16} />
              <div style={badgePulseStyle}></div>
            </div>

            {user.tier === 'free' && (
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <Zap size={12} style={{ fill: 'currentColor' }} /> Go Premium
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <div style={tabBodyStyle}>
          {renderActiveTab()}
        </div>
      </main>

      {/* Stripe Payment Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
};

// Styles
const dashboardLayoutContainer: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--bg-dark)',
  color: 'var(--text-primary)',
  overflow: 'hidden'
};

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  height: '100vh',
  borderRight: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  borderRadius: 0,
  background: 'rgba(5, 5, 8, 0.9)',
  flexShrink: 0,
  zIndex: 10
};

const workspaceSelectorContainer: React.CSSProperties = {
  position: 'relative',
  marginBottom: '25px'
};

const workspaceSelectorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'background var(--transition-fast)'
};

const workspaceLogoStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  background: 'rgba(139, 92, 246, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const workspaceDropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 5px)',
  left: 0,
  right: 0,
  borderRadius: '8px',
  zIndex: 20,
  padding: '6px',
  background: 'var(--bg-darker)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
};

const workspaceItemStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'background var(--transition-fast)',
  color: 'var(--text-secondary)'
};

const navigationStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const navItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)'
};

const sidebarFooterStyle: React.CSSProperties = {
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const creditCardStyle: React.CSSProperties = {
  padding: '14px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '10px'
};

const creditTrackStyle: React.CSSProperties = {
  height: '6px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '3px',
  overflow: 'hidden',
  marginBottom: '10px'
};

const creditProgressStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '3px',
  transition: 'width 0.5s ease-out'
};

const upgradeSidebarButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 12px',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  fontWeight: 700
};

const apiToggleButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '11px',
  outline: 'none',
  padding: '4px 0'
};

const apiKeyInputStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: '11px',
  marginBottom: '6px'
};

const apiSaveButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px',
  fontSize: '10px'
};

const profileContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  paddingTop: '15px',
  borderTop: '1px solid rgba(255,255,255,0.04)'
};

const avatarStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const logoutButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  marginLeft: 'auto',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  outline: 'none'
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(to bottom, #07070b, #050508)',
  overflow: 'hidden'
};

const dashboardHeaderStyle: React.CSSProperties = {
  height: '70px',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 30px',
  flexShrink: 0,
  background: 'rgba(5, 5, 8, 0.4)',
  backdropFilter: 'blur(8px)'
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '180px'
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)'
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '20px',
  padding: '6px 12px 6px 30px',
  color: 'var(--text-primary)',
  fontSize: '11px',
  outline: 'none'
};

const iconBadgeContainerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'relative'
};

const badgePulseStyle: React.CSSProperties = {
  position: 'absolute',
  top: '2px',
  right: '2px',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--color-secondary)',
  boxShadow: '0 0 8px var(--glow-secondary)'
};

const tabBodyStyle: React.CSSProperties = {
  flex: 1,
  padding: '30px',
  overflowY: 'auto',
  position: 'relative'
};
