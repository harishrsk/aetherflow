import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { AIWriter } from './dashboard/AIWriter';
import { AIImageStudio } from './dashboard/AIImageStudio';
import { Calendar } from './dashboard/Calendar';
import { Analytics } from './dashboard/Analytics';
import { AdminPanel } from './dashboard/AdminPanel';
import { Support } from './dashboard/Support';

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
  Zap,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  onOpenAuth: () => void;
}

type TabType = 'writer' | 'studio' | 'calendar' | 'analytics' | 'admin' | 'support';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onOpenAuth }) => {
  const { user, apiKey, setApiKey, sessionUser, toast, clearToast, isSupabaseReady } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('writer');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab as TabType);
      }
    };
    window.addEventListener('switch-dashboard-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-dashboard-tab', handleSwitchTab);
  }, []);
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
      case 'admin':
        return <AdminPanel />;
      case 'support':
        return <Support />;
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
      case 'admin': return 'Subscriber Administration Panel';
      case 'support': return 'AetherFlow Customer Support';
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

          {(!isSupabaseReady || user.isAdmin) && (
            <div 
              onClick={() => setActiveTab('admin')}
              style={{
                ...navItemStyle,
                background: activeTab === 'admin' ? 'rgba(255,255,255,0.04)' : 'transparent',
                color: activeTab === 'admin' ? 'var(--color-primary)' : 'var(--text-secondary)'
              }}
            >
              <ShieldAlert size={16} />
              <span>Admin Panel</span>
            </div>
          )}

          <div 
            onClick={() => setActiveTab('support')}
            style={{
              ...navItemStyle,
              background: activeTab === 'support' ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: activeTab === 'support' ? 'var(--color-secondary)' : 'var(--text-secondary)'
            }}
          >
            <HelpCircle size={16} />
            <span>Support</span>
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
            {sessionUser ? (
              <>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{user.email}</div>
                </div>
                <button onClick={onLogout} style={logoutButtonStyle} title="Sign Out">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Guest Sandbox</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Progress not saved</div>
                </div>
                <button 
                  onClick={onOpenAuth} 
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: 'var(--color-primary)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  Sign In
                </button>
              </>
            )}
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
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowNotifications(!showNotifications)}
                style={iconBadgeContainerStyle}
                title="Workspace Status & Notifications"
              >
                <Bell size={16} />
                <div style={badgePulseStyle}></div>
              </div>
              
              {showNotifications && (
                <div className="glass" style={notificationDropdownStyle}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={14} color="var(--color-primary)" />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Workspace Status</span>
                    </div>
                    <span 
                      style={{ fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Database Status */}
                    <div style={notificationItemStyle}>
                      <div style={notificationIconWrapperStyle(isSupabaseReady ? 'success' : 'warning')}>
                        <Cpu size={12} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Database Connection</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {isSupabaseReady 
                            ? 'Cloud Synchronization: Operational.' 
                            : 'Sandbox Mode (Offline/Placeholder)'}
                        </div>
                      </div>
                    </div>

                    {/* API Key Status */}
                    <div style={notificationItemStyle}>
                      <div style={notificationIconWrapperStyle(apiKey ? 'secondary' : import.meta.env.VITE_GEMINI_API_KEY ? 'primary' : 'danger')}>
                        <Key size={12} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Gemini AI Credentials</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {apiKey 
                            ? 'Using custom Developer Key.' 
                            : import.meta.env.VITE_GEMINI_API_KEY 
                              ? 'Using system fallback key.' 
                              : 'API key completely missing.'}
                        </div>
                      </div>
                    </div>

                    {/* User Session status */}
                    <div style={notificationItemStyle}>
                      <div style={notificationIconWrapperStyle(sessionUser ? 'indigo' : 'muted')}>
                        <User size={12} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Auth Session</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {sessionUser 
                            ? `User: ${sessionUser.email}` 
                            : 'Guest (local sandbox)'}
                        </div>
                      </div>
                    </div>

                    {/* Credit Status alerts */}
                    <div style={notificationItemStyle}>
                      <div style={notificationIconWrapperStyle(user.credits < 15 ? 'danger' : 'success')}>
                        <Zap size={12} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Credit Pools</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {user.credits < 15 
                            ? `Low credit alert: ${user.credits} remaining.` 
                            : `${user.credits} of ${user.totalCredits} credits available.`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {!sessionUser && (
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          onOpenAuth();
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(139, 92, 246, 0.25)',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                          textAlign: 'center'
                        }}
                      >
                        Sign In to Cloud Sync
                      </button>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setShowApiSettings(true);
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                          textAlign: 'center'
                        }}
                      >
                        Manage Keys
                      </button>
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('support');
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                          textAlign: 'center'
                        }}
                      >
                        Get Support
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

      {/* Toast Notification Banner */}
      {toast && (
        <div 
          onClick={clearToast}
          className="glass animate-slide-up"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 3000,
            padding: '16px 20px',
            maxWidth: '360px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            background: 'rgba(10, 10, 16, 0.95)',
            borderLeft: `4px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: '1.4'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : toast.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--success)',
            flexShrink: 0
          }}>
            {toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠️' : '✓'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              {toast.type === 'error' ? 'System Error' : toast.type === 'warning' ? 'System Warning' : 'Success Notification'}
            </div>
            {toast.message}
          </div>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
            lineHeight: 1
          }}>×</button>
        </div>
      )}
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

const getIconColor = (type: 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'indigo' | 'muted') => {
  switch (type) {
    case 'success': return '#10b981';
    case 'warning': return '#f59e0b';
    case 'danger': return '#ef4444';
    case 'primary': return '#8b5cf6';
    case 'secondary': return '#06b6d4';
    case 'indigo': return '#6366f1';
    default: return '#64748b';
  }
};

const notificationDropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  width: '320px',
  background: 'rgba(10, 10, 16, 0.95)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.05)',
  padding: '16px',
  zIndex: 100,
  cursor: 'default'
};

const notificationItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '8px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.02)'
};

const notificationIconWrapperStyle = (type: 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'indigo' | 'muted'): React.CSSProperties => {
  const color = getIconColor(type);
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: `${color}1a`,
    color: color,
    flexShrink: 0,
    marginTop: '2px'
  };
};
