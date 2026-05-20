import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { upgradeToPremium } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('pro');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Payment states: 'idle' | 'processing' | 'success'
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvv(value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!cardName.trim()) newErrors.cardName = 'Name on card is required';
    if (cardNumber.replace(/\s/g, '').length !== 16) newErrors.cardNumber = 'Valid 16-digit card number required';
    
    const expiryPattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryPattern.test(cardExpiry)) {
      newErrors.cardExpiry = 'MM/YY format required';
    } else {
      const [month, year] = cardExpiry.split('/');
      const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
      if (expiryDate < new Date()) {
        newErrors.cardExpiry = 'Card has expired';
      }
    }

    if (cardCvv.length !== 3) newErrors.cardCvv = '3-digit CVV required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate Stripe payment workflow
    setPaymentStatus('processing');
    setStatusMessage('Contacting Stripe secure network...');

    setTimeout(() => {
      setStatusMessage('Verifying credentials & 3D Secure...');
      setTimeout(() => {
        setStatusMessage('Settling transaction authorizations...');
        setTimeout(() => {
          upgradeToPremium();
          setPaymentStatus('success');
        }, 1200);
      }, 1200);
    }, 1200);
  };

  return (
    <div style={modalOverlayStyle}>
      <div className="glass animate-slide-up" style={modalContentStyle}>
        
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={logoIconStyle}>
              <ShieldCheck size={20} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px' }}>Secure Checkout</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Powered by Stripe Integration</p>
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={18} />
          </button>
        </div>

        {paymentStatus === 'idle' && (
          <form onSubmit={handleSubmit} style={formContainerStyle}>
            {/* Plan Selector */}
            <div style={planSelectorStyle}>
              <div 
                onClick={() => setSelectedPlan('starter')}
                style={{
                  ...planOptionStyle,
                  borderColor: selectedPlan === 'starter' ? 'var(--color-primary)' : 'var(--border-color)',
                  background: selectedPlan === 'starter' ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="radio" 
                    checked={selectedPlan === 'starter'} 
                    onChange={() => setSelectedPlan('starter')}
                    style={radioStyle}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Starter Plan</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>50 credits/mo</div>
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>$19<span style={{ fontSize: '11px', fontWeight: 400 }}>/mo</span></div>
              </div>

              <div 
                onClick={() => setSelectedPlan('pro')}
                style={{
                  ...planOptionStyle,
                  borderColor: selectedPlan === 'pro' ? 'var(--color-primary)' : 'var(--border-color)',
                  background: selectedPlan === 'pro' ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="radio" 
                    checked={selectedPlan === 'pro'} 
                    onChange={() => setSelectedPlan('pro')}
                    style={radioStyle}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Pro Plan</span>
                      <span style={badgeStyle}>Popular</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>500 credits/mo</div>
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>$49<span style={{ fontSize: '11px', fontWeight: 400 }}>/mo</span></div>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="Jane Doe"
                className="form-input" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
              {errors.cardName && <p style={errorTextStyle}>{errors.cardName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
                <CreditCard size={18} style={inputIconStyle} color="var(--text-secondary)" />
              </div>
              {errors.cardNumber && <p style={errorTextStyle}>{errors.cardNumber}</p>}
            </div>

            <div style={flexFieldsStyle}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  className="form-input" 
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                />
                {errors.cardExpiry && <p style={errorTextStyle}>{errors.cardExpiry}</p>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">CVV / CVC</label>
                <input 
                  type="password" 
                  placeholder="•••"
                  className="form-input" 
                  value={cardCvv}
                  onChange={handleCvvChange}
                />
                {errors.cardCvv && <p style={errorTextStyle}>{errors.cardCvv}</p>}
              </div>
            </div>

            {/* Guarantee footer */}
            <div style={securityBannerStyle}>
              <Lock size={12} color="var(--text-muted)" />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Your payment info is encrypted end-to-end. SECURE SSL transaction.
              </span>
            </div>

            {/* Pay Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              Pay ${selectedPlan === 'starter' ? '19.00' : '49.00'} Securely
            </button>
          </form>
        )}

        {paymentStatus === 'processing' && (
          <div style={loaderContainerStyle}>
            <div className="loader" style={{ width: '50px', height: '50px', borderWidth: '3px', marginBottom: '20px' }}></div>
            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Processing Payment...</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{statusMessage}</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div style={successContainerStyle}>
            <CheckCircle2 size={60} color="var(--success)" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))' }} />
            <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>Subscription Activated!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px', maxWidth: '300px' }}>
              Congratulations! Your AetherFlow Premium status is active. We've added 500 generation credits to your dashboard.
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
              Go to Workspace
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(3, 3, 5, 0.85)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalContentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  background: '#0d0d12',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5), 0 0 40px -10px var(--glow-primary)',
  borderRadius: '20px',
  overflow: 'hidden'
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
};

const logoIconStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: 'rgba(139, 92, 246, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '6px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
  outline: 'none'
};

const formContainerStyle: React.CSSProperties = {
  padding: '20px'
};

const planSelectorStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '20px'
};

const planOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const radioStyle: React.CSSProperties = {
  marginRight: '6px',
  accentColor: 'var(--color-primary)',
  cursor: 'pointer'
};

const badgeStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-pink))',
  color: '#ffffff',
  padding: '2px 6px',
  borderRadius: '10px',
  textTransform: 'uppercase'
};

const flexFieldsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px'
};

const errorTextStyle: React.CSSProperties = {
  color: 'var(--danger)',
  fontSize: '11px',
  marginTop: '4px'
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none'
};

const securityBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px',
  background: 'rgba(255,255,255,0.02)',
  borderRadius: '6px',
  marginBottom: '15px'
};

const loaderContainerStyle: React.CSSProperties = {
  padding: '60px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const successContainerStyle: React.CSSProperties = {
  padding: '40px 30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};
