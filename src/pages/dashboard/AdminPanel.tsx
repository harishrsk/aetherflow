import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../utils/supabaseClient';
import { 
  Users, 
  Award, 
  Zap, 
  ShieldAlert, 
  Search, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Key, 
  Database,
  UserCheck,
  Mail,
  UserPlus
} from 'lucide-react';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'premium';
  credits: number;
  totalCredits: number;
  api_key: string | null;
  joined: string;
}

const INITIAL_MOCK_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    name: 'Sarah Connor',
    email: 'sarah.c@cyberdyne.ai',
    tier: 'premium',
    credits: 450,
    totalCredits: 550,
    api_key: 'sk_live_gemini_5c82',
    joined: '2026-04-12'
  },
  {
    id: 'sub-2',
    name: 'Bruce Wayne',
    email: 'bruce@waynecorp.com',
    tier: 'premium',
    credits: 550,
    totalCredits: 550,
    api_key: null,
    joined: '2026-05-01'
  },
  {
    id: 'sub-3',
    name: 'Peter Parker',
    email: 'peter@dailybugle.net',
    tier: 'free',
    credits: 15,
    totalCredits: 50,
    api_key: null,
    joined: '2026-05-15'
  },
  {
    id: 'sub-4',
    name: 'Tony Stark',
    email: 'tony@starkindustries.com',
    tier: 'premium',
    credits: 950,
    totalCredits: 1000,
    api_key: 'sk_live_gemini_a94f',
    joined: '2026-03-20'
  },
  {
    id: 'sub-5',
    name: 'Clark Kent',
    email: 'clark.k@dailyplanet.com',
    tier: 'free',
    credits: 45,
    totalCredits: 50,
    api_key: null,
    joined: '2026-05-10'
  }
];

export const AdminPanel: React.FC = () => {
  const { showToast } = useApp();
  
  // Subscriber list state
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_MOCK_SUBSCRIBERS);
  const [dbSubscribers, setDbSubscribers] = useState<Subscriber[]>([]);
  
  // View options
  const [viewMode, setViewMode] = useState<'sandbox' | 'database'>('sandbox');
  const [dbError, setDbError] = useState<string | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'premium'>('all');
  
  // Subscriber Creation Modal/Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubTier, setNewSubTier] = useState<'free' | 'premium'>('free');
  const [newSubCredits, setNewSubCredits] = useState(50);
  
  // Credit update overlay
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState<number>(0);

  // Load Database profiles
  const fetchDatabaseProfiles = async () => {
    setIsLoadingDb(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Map database profiles to Subscribers model.
        // Profiles don't store name/email, so synthesize placeholder data based on uuid.
        const mapped: Subscriber[] = data.map((profile: any) => {
          const idShort = profile.id.substring(0, 5);
          return {
            id: profile.id,
            name: `DB Profile ${idShort}`,
            email: `user_${idShort}@aetherflow-cloud.io`,
            tier: (profile.tier || 'free') as 'free' | 'premium',
            credits: profile.credits ?? 50,
            totalCredits: profile.tier === 'premium' ? 550 : 50,
            api_key: profile.api_key || null,
            joined: new Date().toISOString().split('T')[0] // Fallback join date
          };
        });
        setDbSubscribers(mapped);
        
        if (data.length <= 1) {
          // If only the current user's profile is loaded due to RLS policies
          setDbError("Supabase RLS Policy restriction: Select returned only your profile. To see other subscribers, you must modify your public.profiles policies or query via a service role API key.");
        }
      }
    } catch (err: any) {
      console.error("Database query failed:", err);
      setDbError(err.message || "Failed to load cloud subscribers list. Check table configuration.");
      setViewMode('sandbox'); // Fall back to sandbox automatically
      showToast("RLS Policy active. Redirected to Sandbox Simulator.", "warning");
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'database') {
      fetchDatabaseProfiles();
    }
  }, [viewMode]);

  // Actions for modifying subscribers
  const handleUpdateCredits = async (subId: string, change: number) => {
    if (viewMode === 'sandbox') {
      setSubscribers(prev => prev.map(sub => {
        if (sub.id === subId) {
          const nextCredits = Math.max(0, sub.credits + change);
          return { ...sub, credits: nextCredits };
        }
        return sub;
      }));
      showToast(`Subscriber balance adjusted by ${change > 0 ? '+' : ''}${change} credits.`, 'success');
    } else {
      // Live DB Update
      const subToUpdate = dbSubscribers.find(s => s.id === subId);
      if (!subToUpdate) return;
      const nextCredits = Math.max(0, subToUpdate.credits + change);
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ credits: nextCredits })
          .eq('id', subId);
        
        if (error) throw error;
        
        setDbSubscribers(prev => prev.map(sub => {
          if (sub.id === subId) {
            return { ...sub, credits: nextCredits };
          }
          return sub;
        }));
        showToast('Database profiles updated successfully.', 'success');
      } catch (err: any) {
        showToast(`Failed to update DB: ${err.message}. Sandbox override applied.`, 'warning');
        // Apply locally anyway to let them see UI reflect changes
        setDbSubscribers(prev => prev.map(sub => {
          if (sub.id === subId) {
            return { ...sub, credits: nextCredits };
          }
          return sub;
        }));
      }
    }
    setEditingSubId(null);
  };

  const handleToggleTier = async (subId: string, currentTier: 'free' | 'premium') => {
    const nextTier = currentTier === 'free' ? 'premium' : 'free';
    const nextTotal = nextTier === 'premium' ? 550 : 50;
    
    if (viewMode === 'sandbox') {
      setSubscribers(prev => prev.map(sub => {
        if (sub.id === subId) {
          return { 
            ...sub, 
            tier: nextTier,
            totalCredits: nextTotal,
            credits: nextTier === 'premium' ? Math.max(sub.credits, 500) : Math.min(sub.credits, 50)
          };
        }
        return sub;
      }));
      showToast(`Subscriber plans updated to ${nextTier.toUpperCase()}.`, 'success');
    } else {
      const subToUpdate = dbSubscribers.find(s => s.id === subId);
      if (!subToUpdate) return;
      const targetCredits = nextTier === 'premium' ? Math.max(subToUpdate.credits, 500) : Math.min(subToUpdate.credits, 50);
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ tier: nextTier, credits: targetCredits })
          .eq('id', subId);
        
        if (error) throw error;
        
        setDbSubscribers(prev => prev.map(sub => {
          if (sub.id === subId) {
            return { 
              ...sub, 
              tier: nextTier,
              totalCredits: nextTotal,
              credits: targetCredits
            };
          }
          return sub;
        }));
        showToast(`Plan successfully synchronised to database.`, 'success');
      } catch (err: any) {
        showToast(`DB update restricted: ${err.message}. Sandbox simulation updated.`, 'warning');
        setDbSubscribers(prev => prev.map(sub => {
          if (sub.id === subId) {
            return { 
              ...sub, 
              tier: nextTier,
              totalCredits: nextTotal,
              credits: targetCredits
            };
          }
          return sub;
        }));
      }
    }
  };

  const handleDeleteSubscriber = async (subId: string) => {
    if (viewMode === 'sandbox') {
      setSubscribers(prev => prev.filter(sub => sub.id !== subId));
      showToast('Subscriber account removed from Sandbox panel.', 'success');
    } else {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', subId);
          
        if (error) throw error;
        setDbSubscribers(prev => prev.filter(sub => sub.id !== subId));
        showToast('Profile deleted from Supabase backend.', 'success');
      } catch (err: any) {
        showToast(`Delete restricted: ${err.message}. Local simulator removed profile.`, 'warning');
        setDbSubscribers(prev => prev.filter(sub => sub.id !== subId));
      }
    }
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubEmail) {
      showToast('Please enter user name and email.', 'error');
      return;
    }
    
    const newSub: Subscriber = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      name: newSubName,
      email: newSubEmail,
      tier: newSubTier,
      credits: newSubCredits,
      totalCredits: newSubTier === 'premium' ? 550 : 50,
      api_key: newSubTier === 'premium' ? 'sk_live_gemini_auto' : null,
      joined: new Date().toISOString().split('T')[0]
    };
    
    if (viewMode === 'sandbox') {
      setSubscribers(prev => [newSub, ...prev]);
      showToast(`Subscriber ${newSubName} created successfully!`, 'success');
    } else {
      setDbSubscribers(prev => [newSub, ...prev]);
      showToast(`Mock subscriber registered in database view context (Sandbox fallback).`, 'success');
    }

    // Reset Form
    setNewSubName('');
    setNewSubEmail('');
    setNewSubTier('free');
    setNewSubCredits(50);
    setShowAddForm(false);
  };

  // Compute active list based on view mode and filters
  const activeList = viewMode === 'sandbox' ? subscribers : dbSubscribers;
  
  const filteredSubscribers = activeList.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTier = 
      tierFilter === 'all' || 
      sub.tier === tierFilter;
      
    return matchesSearch && matchesTier;
  });

  // Calculate stats based on current view dataset
  const totalSubscribers = activeList.length;
  const premiumCount = activeList.filter(s => s.tier === 'premium').length;
  const totalCredits = activeList.reduce((sum, s) => sum + s.credits, 0);
  const activeKeysCount = activeList.filter(s => s.api_key !== null).length;

  return (
    <div style={containerStyle} className="animate-fade-in">
      {/* Mode Selector and Alert Banner */}
      <div className="glass" style={modeSelectorCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="var(--color-primary)" />
              Database Synchronisation Management
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Toggle administration data mode to switch between Sandbox simulation and live Postgres schemas.
            </p>
          </div>
          
          <div style={toggleButtonGroupStyle}>
            <button 
              onClick={() => setViewMode('sandbox')}
              style={{
                ...toggleButtonStyle,
                background: viewMode === 'sandbox' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                borderColor: viewMode === 'sandbox' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'sandbox' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Sandbox Simulator
            </button>
            <button 
              onClick={() => setViewMode('database')}
              style={{
                ...toggleButtonStyle,
                background: viewMode === 'database' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                borderColor: viewMode === 'database' ? 'var(--color-secondary)' : 'transparent',
                color: viewMode === 'database' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {isLoadingDb ? <div className="loader" style={{ width: '12px', height: '12px', marginRight: '4px' }}></div> : null}
              Live DB Profiles
            </button>
          </div>
        </div>

        {/* Database Diagnostic Notice */}
        {viewMode === 'database' && dbError && (
          <div style={dbNoticeBoxStyle}>
            <ShieldAlert size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--warning)' }}>Database Policy Limit:</strong> {dbError}
              <div style={{ marginTop: '6px', borderTop: '1px solid rgba(245, 158, 11, 0.15)', paddingTop: '6px' }}>
                💡 <strong>How to Enable Full Administration in Cloud:</strong> By default, Row Level Security restricts data retrieval. To let admins read and manage all profiles, create a secure postgres function using <code>security definer</code> or set up a role-based access policy matching admin email metadata.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={metricsGridStyle}>
        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-primary)')}>
              <Users size={16} color="var(--color-primary)" />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active users</span>
          </div>
          <div style={metricValueStyle}>{totalSubscribers}</div>
          <div style={metricLabelStyle}>Registered Subscribers</div>
        </div>

        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-secondary)')}>
              <Award size={16} color="var(--color-secondary)" />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 600 }}>
              {totalSubscribers > 0 ? Math.round((premiumCount / totalSubscribers) * 100) : 0}% Ratio
            </span>
          </div>
          <div style={metricValueStyle}>{premiumCount}</div>
          <div style={metricLabelStyle}>Premium SaaS Subscriptions</div>
        </div>

        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-indigo)')}>
              <Zap size={16} color="var(--color-indigo)" />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Aggregate Credit Pools</span>
          </div>
          <div style={metricValueStyle}>{totalCredits}</div>
          <div style={metricLabelStyle}>Credits Allocated Globally</div>
        </div>

        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-pink)')}>
              <Key size={16} color="var(--color-pink)" />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>API Keys configured</span>
          </div>
          <div style={metricValueStyle}>{activeKeysCount}</div>
          <div style={metricLabelStyle}>Active Developer Keys</div>
        </div>
      </div>

      {/* Controls and Subscriber List */}
      <div className="glass" style={tableCardStyle}>
        <div style={tableHeaderControlsStyle}>
          <div style={searchContainerStyle}>
            <Search size={14} style={searchIconStyle} />
            <input 
              type="text" 
              placeholder="Search subscribers by name, email..." 
              style={searchInputStyle}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              style={selectStyle} 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
            >
              <option value="all">All Plan Tiers</option>
              <option value="premium">Premium Only</option>
              <option value="free">Free Only</option>
            </select>

            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              {showAddForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showAddForm ? 'Cancel' : 'Add User'}</span>
            </button>
          </div>
        </div>

        {/* Add User Form overlay */}
        {showAddForm && (
          <form onSubmit={handleAddSubscriber} className="glass" style={addFormStyle}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <UserPlus size={16} color="var(--color-primary)" />
              <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Create New Sandbox User Profile</h4>
            </div>
            <div style={formGridStyle}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="E.g. Elon Musk"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="elon@spacex.com"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Plan Tier</label>
                <select 
                  className="form-select"
                  value={newSubTier}
                  onChange={(e) => {
                    const tier = e.target.value as 'free' | 'premium';
                    setNewSubTier(tier);
                    setNewSubCredits(tier === 'premium' ? 550 : 50);
                  }}
                >
                  <option value="free">Free Tier (50 credits)</option>
                  <option value="premium">Premium Tier (550 credits)</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Starting Credits</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0"
                  max="10000"
                  value={newSubCredits}
                  onChange={(e) => setNewSubCredits(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddForm(false)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Subscribers Table Container */}
        <div style={{ overflowX: 'auto', marginTop: '10px' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={{ ...thStyle, width: '25%' }}>Subscriber Details</th>
                <th style={thStyle}>Date Joined</th>
                <th style={thStyle}>Subscription Tier</th>
                <th style={thStyle}>Credits Balance</th>
                <th style={thStyle}>API Developer Key</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Administration Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={tableEmptyStateStyle}>
                    No subscribers found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const creditPercent = Math.max(0, Math.min(100, (sub.credits / sub.totalCredits) * 100));
                  return (
                    <tr key={sub.id} style={trStyle} className="table-row">
                      {/* Name & Email */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Mail size={10} />
                            {sub.email}
                          </span>
                        </div>
                      </td>

                      {/* Joined Timestamp */}
                      <td style={{ ...tdStyle, fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {sub.joined}
                      </td>

                      {/* Subscription Tier badge */}
                      <td style={tdStyle}>
                        <div 
                          style={{
                            ...tierBadgeStyle,
                            background: sub.tier === 'premium' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: sub.tier === 'premium' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid var(--border-color)',
                            color: sub.tier === 'premium' ? 'var(--color-secondary)' : 'var(--text-secondary)',
                            boxShadow: sub.tier === 'premium' ? '0 0 10px rgba(6, 182, 212, 0.1)' : 'none'
                          }}
                        >
                          <div 
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: sub.tier === 'premium' ? 'var(--color-secondary)' : 'var(--text-muted)'
                            }}
                          ></div>
                          {sub.tier.toUpperCase()}
                        </div>
                      </td>

                      {/* Credit Balance Progress */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                            <span>Remaining</span>
                            <span style={{ fontWeight: 600 }}>{sub.credits} / {sub.totalCredits}</span>
                          </div>
                          
                          {/* Credit Bar */}
                          <div style={creditTrackStyle}>
                            <div 
                              style={{
                                ...creditProgressStyle,
                                width: `${creditPercent}%`,
                                background: sub.tier === 'premium'
                                  ? 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
                                  : 'var(--color-primary)'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Developer key status */}
                      <td style={tdStyle}>
                        {sub.api_key ? (
                          <div style={apiKeyBadgeStyle}>
                            <Key size={10} color="var(--success)" />
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              {sub.api_key.substring(0, 10)}...
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not configured</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {editingSubId === sub.id ? (
                            <div className="glass" style={inlineCreditEditStyle}>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ width: '60px', padding: '4px 6px', fontSize: '11px', textAlign: 'center' }}
                                value={creditAdjustment}
                                onChange={(e) => setCreditAdjustment(parseInt(e.target.value) || 0)}
                              />
                              <button 
                                onClick={() => handleUpdateCredits(sub.id, creditAdjustment)}
                                style={confirmBtnStyle}
                                title="Apply credit shift"
                              >
                                <Check size={10} />
                              </button>
                              <button 
                                onClick={() => setEditingSubId(null)}
                                style={cancelBtnStyle}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Adjust credits trigger */}
                              <button 
                                onClick={() => {
                                  setEditingSubId(sub.id);
                                  setCreditAdjustment(50);
                                }}
                                style={actionButtonStyle}
                                title="Adjust subscriber credits"
                              >
                                <Plus size={12} color="var(--color-primary)" />
                                <span style={{ fontSize: '10px' }}>Credits</span>
                              </button>

                              {/* Upgrade Plan */}
                              <button 
                                onClick={() => handleToggleTier(sub.id, sub.tier)}
                                style={{
                                  ...actionButtonStyle,
                                  borderColor: sub.tier === 'premium' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                }}
                                title={sub.tier === 'premium' ? "Downgrade user plan" : "Upgrade user plan"}
                              >
                                <Zap size={11} color={sub.tier === 'premium' ? 'var(--danger)' : 'var(--success)'} style={{ fill: sub.tier === 'premium' ? 'none' : 'currentColor' }} />
                                <span style={{ fontSize: '10px', color: sub.tier === 'premium' ? 'var(--danger)' : 'var(--success)' }}>
                                  {sub.tier === 'premium' ? 'Downgrade' : 'Upgrade'}
                                </span>
                              </button>

                              {/* Delete Subscriber */}
                              <button 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove subscriber ${sub.name}?`)) {
                                    handleDeleteSubscriber(sub.id);
                                  }
                                }}
                                style={deleteButtonStyle}
                                title="Delete Subscriber Profile"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Schema Guide */}
      <div className="glass animate-slide-up" style={schemaGuideCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <UserCheck size={16} color="var(--color-secondary)" />
          <h4 style={{ fontSize: '13px', fontWeight: 600 }}>SaaS Subscriber Administration Notes</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <h5 style={guideSubTitleStyle}>Postgres Schema Design</h5>
            <p style={guideParagraphStyle}>
              Subscribers are tracked inside the <code>public.profiles</code> table, referencing auth tables. Profiles are automatically initialized via database triggers upon user registration, allocating 50 credits to new sandbox accounts.
            </p>
          </div>
          <div>
            <h5 style={guideSubTitleStyle}>Security definer Triggers</h5>
            <p style={guideParagraphStyle}>
              The trigger uses Postgres <code>security definer</code> permissions to automatically create user rows, bypassing client RLS policies during registration and ensuring consistent profiles are cached locally on first sign in.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const modeSelectorCardStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(255,255,255,0.01)'
};

const toggleButtonGroupStyle: React.CSSProperties = {
  display: 'flex',
  background: 'rgba(0,0,0,0.2)',
  padding: '4px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

const toggleButtonStyle: React.CSSProperties = {
  border: '1px solid transparent',
  padding: '6px 14px',
  fontSize: '11px',
  fontWeight: 600,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  display: 'flex',
  alignItems: 'center',
  outline: 'none'
};

const dbNoticeBoxStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  background: 'rgba(245, 158, 11, 0.04)',
  border: '1px solid rgba(245, 158, 11, 0.15)',
  borderRadius: '8px',
  padding: '12px 16px',
  marginTop: '15px'
};

const metricsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px'
};

const metricCardStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(255,255,255,0.01)'
};

const metricHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const iconBoxStyle = (color: string): React.CSSProperties => ({
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  background: `${color}15`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const metricValueStyle: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: 800,
  fontFamily: 'Outfit, sans-serif'
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-secondary)',
  marginTop: '4px'
};

const tableCardStyle: React.CSSProperties = {
  padding: '24px',
  background: 'rgba(255,255,255,0.01)'
};

const tableHeaderControlsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '15px',
  marginBottom: '20px'
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '280px'
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)'
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '20px',
  padding: '8px 12px 8px 36px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  outline: 'none',
  transition: 'all var(--transition-fast)'
};

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-darker)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  outline: 'none',
  cursor: 'pointer'
};

const addFormStyle: React.CSSProperties = {
  padding: '20px',
  background: 'var(--bg-darker)',
  border: '1px solid var(--border-hover)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  marginBottom: '20px',
  borderRadius: '12px'
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '15px'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  transition: 'background var(--transition-fast)',
  verticalAlign: 'middle'
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'middle'
};

const tableEmptyStateStyle: React.CSSProperties = {
  padding: '30px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '12px'
};

const tierBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '9px',
  fontWeight: 700,
  letterSpacing: '0.03em'
};

const creditTrackStyle: React.CSSProperties = {
  height: '5px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '2.5px',
  overflow: 'hidden',
  width: '100%',
  marginTop: '4px'
};

const creditProgressStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '2.5px',
  transition: 'width 0.5s ease-out'
};

const apiKeyBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  padding: '4px 8px',
  borderRadius: '6px'
};

const actionButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  padding: '5px 10px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all var(--transition-fast)',
  color: 'var(--text-primary)'
};

const deleteButtonStyle: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.05)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  borderRadius: '6px',
  padding: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all var(--transition-fast)',
  color: 'var(--danger)'
};

const inlineCreditEditStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 8px',
  borderRadius: '8px',
  background: 'var(--bg-darker)',
  border: '1px solid var(--border-hover)',
  position: 'relative',
  zIndex: 5
};

const confirmBtnStyle: React.CSSProperties = {
  background: 'rgba(16, 185, 129, 0.15)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  color: 'var(--success)',
  borderRadius: '4px',
  padding: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const cancelBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  borderRadius: '4px',
  padding: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const schemaGuideCardStyle: React.CSSProperties = {
  padding: '24px',
  background: 'rgba(255,255,255,0.01)'
};

const guideSubTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px'
};

const guideParagraphStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  lineHeight: '1.5'
};
