import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const Support: React.FC = () => {
  const { user, showToast } = useApp();
  
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      showToast('Please fill in all the form fields.', 'error');
      return;
    }

    // Construct Mailto link
    const mailtoUrl = `mailto:harishrsk@gmail.com?subject=${encodeURIComponent(
      `[AetherFlow Support] ${subject}`
    )}&body=${encodeURIComponent(
      `Support Query details:\n\n` +
      `From Name: ${name}\n` +
      `From Email: ${email}\n\n` +
      `Message:\n${message}\n\n` +
      `---\nSent via AetherFlow Support Center`
    )}`;

    try {
      // Trigger redirection
      window.location.href = mailtoUrl;
      setSubmitted(true);
      showToast('Redirecting to your default mail client...', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to open email client. Please email harishrsk@gmail.com directly.', 'error');
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
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct Inquiry</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>harishrsk@gmail.com</div>
            </div>
          </div>

          <div style={tipBoxStyle}>
            <span style={{ fontWeight: 600, color: 'var(--color-secondary)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
              💡 System Note
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Upon submission, your query is formatted and loaded into your local email client. Simply click send to dispatch the ticket to the support desk.
            </span>
          </div>
        </div>

        {/* Contact Form Right Panel */}
        <div className="glass" style={formPanelStyle}>
          {submitted ? (
            <div style={successStateStyle} className="animate-fade-in">
              <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '15px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Query Formatted Successfully!
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6', maxWidth: '300px', marginBottom: '20px' }}>
                If your browser did not automatically open your mail app, please send your query directly to <strong style={{ color: 'var(--text-primary)' }}>harishrsk@gmail.com</strong>.
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
                style={{ padding: '12px', width: '100%', marginTop: '10px', fontSize: '13px', fontWeight: 600 }}
              >
                <Send size={14} />
                <span>Submit Query to Admin</span>
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
