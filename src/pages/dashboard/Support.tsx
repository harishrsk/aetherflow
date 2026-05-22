import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../utils/supabaseClient';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const Support: React.FC = () => {
  const { user, showToast, isSupabaseReady, sessionUser } = useApp();
  
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      showToast('Please fill in all the form fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isSupabaseReady) {
        const { error } = await supabase
          .from('support_queries')
          .insert({
            user_id: sessionUser?.id || null,
            name,
            email,
            subject,
            message
          });
        
        if (error) throw error;
      } else {
        // Fallback simulation mode
        const queries = JSON.parse(localStorage.getItem('aetherflow_support_queries') || '[]');
        queries.push({
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
          subject,
          message,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('aetherflow_support_queries', JSON.stringify(queries));
      }
      
      setSubmitted(true);
      showToast('Support query submitted successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to submit query: ${err.message || err}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={layoutGridStyle}>
        
        {/* Support Information Left Panel */}
        <div className="glass" style={infoPanelStyle}>
          <div style={iconBoxStyle}>
            <MessageSquare size={24} color="var(--color-secondary)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
            AetherFlow Customer Desk
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            Have a question about credits, billing, image variations, or custom copywriting workflows? Send a query directly to the app administrator.
          </p>

          <div style={contactRowStyle}>
            <div style={contactIconStyle}>
              <Mail size={14} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Support Channel</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Admin Ticket Queue</div>
            </div>
          </div>

          <div style={tipBoxStyle}>
            <span style={{ fontWeight: 600, color: 'var(--color-secondary)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
              💡 Ticket System
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Upon submission, your query will be registered directly in our administrator ticket queue. The support team will review your request and get back to you shortly.
            </span>
          </div>
        </div>

        {/* Contact Form Right Panel */}
        <div className="glass" style={formPanelStyle}>
          {submitted ? (
            <div style={successStateStyle} className="animate-fade-in">
              <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '15px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Query Submitted Successfully!
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6', maxWidth: '300px', marginBottom: '20px' }}>
                Your ticket has been registered in the system. The platform administrator will review your query.
              </p>
              <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                Submit Another Query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={formRowStyle}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="yourname@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="E.g., Credit limit upgrade inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message / Query Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Describe your query in detail here..."
                  style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '12px', width: '100%', marginTop: '10px', fontSize: '13px', fontWeight: 600 }}
              >
                <Send size={14} />
                <span>{submitting ? 'Submitting query...' : 'Submit Query to Admin'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '900px',
  margin: '0 auto',
  paddingTop: '10px'
};

const layoutGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px',
  alignItems: 'stretch'
};

const infoPanelStyle: React.CSSProperties = {
  padding: '30px',
  background: 'rgba(255,255,255,0.01)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const formPanelStyle: React.CSSProperties = {
  padding: '30px',
  background: 'rgba(255,255,255,0.01)'
};

const iconBoxStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  background: 'rgba(6, 182, 212, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px'
};

const contactRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  marginBottom: '20px'
};

const contactIconStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  background: 'rgba(139, 92, 246, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const tipBoxStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '8px',
  background: 'rgba(6, 182, 212, 0.03)',
  border: '1px solid rgba(6, 182, 212, 0.1)'
};

const formRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  flexWrap: 'wrap'
};

const successStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px 0',
  minHeight: '280px'
};
