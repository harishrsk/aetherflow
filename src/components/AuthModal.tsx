import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { Sparkles, Mail, Lock, AlertCircle, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading) return;

    if (!isSupabaseConfigured) {
      setErrorMsg('Authentication is disabled because Supabase is not configured.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          setSuccessMsg('Email already registered! Try signing in.');
        } else {
          setSuccessMsg('Account registered successfully! Check your inbox for a confirmation email.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message?.includes('fetch')) {
        setErrorMsg('Could not establish database connection. Please check your network connection or verify that VITE_SUPABASE_URL is correct.');
      } else {
        setErrorMsg(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="glass animate-slide-up" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoIconStyle}>
            <Sparkles size={16} color="#8b5cf6" />
          </div>
          <span style={logoTextStyle}>AetherFlow Auth Portal</span>
          <button onClick={onClose} style={closeButtonStyle} disabled={isLoading}>×</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
            {mode === 'signin' ? 'Sign In to Workspace' : 'Create Custom Account'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
            {mode === 'signin' 
              ? 'Enter credentials to load synced creative files and credit balances.' 
              : 'Sign up to receive 50 free cloud credits and setup calendar sync.'}
          </p>

          {!isSupabaseConfigured && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#fef08a',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '11px',
              marginBottom: '15px',
              lineHeight: '1.4',
              textAlign: 'left'
            }}>
              <strong>⚠️ Database Sandbox Mode Active</strong>
              <br />
              Supabase environment variables are not configured. Authenticating and syncing accounts is disabled. To enable, configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in AWS Amplify or your <code>.env</code> file.
            </div>
          )}

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Email Address</label>
            <div style={inputWrapperStyle}>
              <Mail size={14} style={inputIconStyle} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '36px' }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={14} style={inputIconStyle} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '36px' }}
                disabled={isLoading}
              />
            </div>
          </div>

          {errorMsg && (
            <div style={errorContainerStyle}>
              <AlertCircle size={14} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={successContainerStyle}>
              <Check size={14} /> <span>{successMsg}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={isLoading || !email.trim() || !password.trim() || !isSupabaseConfigured}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="loader"></div> Verifying Account...
              </div>
            ) : (
              mode === 'signin' ? 'Access Workspace Pool' : 'Register Free Workspace'
            )}
          </button>

          <div style={footerToggleStyle}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {mode === 'signin' ? "Don't have a secure database workspace?" : 'Already registered?'}
            </span>
            <button 
              type="button" 
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={modeToggleButtonStyle}
              disabled={isLoading}
            >
              {mode === 'signin' ? 'Sign Up Free' : 'Sign In Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(3, 3, 5, 0.85)',
  backdropFilter: 'blur(8px)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalContentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  background: '#0d0d12',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px -10px var(--glow-primary)',
  borderRadius: '20px',
  overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  background: 'rgba(255, 255, 255, 0.01)'
};

const logoIconStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  background: 'rgba(139, 92, 246, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  flex: 1,
  marginLeft: '8px',
  color: 'var(--text-secondary)'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '22px',
  padding: '0 5px'
};

const inputWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%'
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)'
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '8px',
  color: '#fca5a5',
  fontSize: '12px',
  marginBottom: '15px'
};

const successContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  background: 'rgba(16, 185, 129, 0.08)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  borderRadius: '8px',
  color: '#a7f3d0',
  fontSize: '12px',
  marginBottom: '15px'
};

const footerToggleStyle: React.CSSProperties = {
  marginTop: '20px',
  textAlign: 'center',
  fontSize: '11px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const modeToggleButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '12px',
  outline: 'none',
  padding: '2px'
};
