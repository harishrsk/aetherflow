import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Plus, Trash2, Check, Hash, Send, Briefcase, Globe, Camera } from 'lucide-react';

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: Send, color: '#1da1f2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Briefcase, color: '#0077b5' },
  { id: 'facebook', name: 'Facebook', icon: Globe, color: '#1877f2' },
  { id: 'instagram', name: 'Instagram', icon: Camera, color: '#e1306c' }
];

export const Calendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent, toggleEventStatus, apiKey, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'facebook' | 'instagram'>('twitter');
  const [time, setTime] = useState('12:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Generate current week dates (Mon-Sun)
  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      dates.push(current);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addCalendarEvent({
      date,
      time,
      platform,
      content
    });

    setContent('');
    setIsModalOpen(false);
  };

  const handleEnhanceHashtags = async () => {
    if (!content.trim() || isEnhancing) return;
    setIsEnhancing(true);

    const activeApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (activeApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Add 3 relevant, highly engaging social media hashtags to the end of this post content. Return ONLY the hashtags separated by single spaces (e.g. "#marketing #saas #social"), with a leading space. Do not include any explanations, introductory text, or markdown.
                Post content: "${content}"`
              }]
            }]
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || `API returned status ${response.status}`);
        }

        const tags = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (tags.trim()) {
          const formattedTags = tags.startsWith(' ') ? tags : ' ' + tags;
          setContent(prev => prev + formattedTags.trimEnd());
          showToast('Hashtags optimized successfully.', 'success');
        } else {
          showToast('Model returned empty hashtags.', 'warning');
        }
      } catch (err: any) {
        console.error("Gemini Hashtag Optimization Error:", err);
        showToast(`Failed to optimize hashtags: ${err.message || err}`, 'error');
      } finally {
        setIsEnhancing(false);
      }
    } else {
      showToast('Developer key missing! Please configure your Gemini API Key in the "Developer Keys" sidebar panel to enable hashtag optimization.', 'error');
      setIsEnhancing(false);
    }
  };

  // Group events by date
  const getEventsForDate = (dateStr: string) => {
    return calendarEvents.filter(evt => evt.date === dateStr);
  };

  return (
    <div style={containerStyle}>
      {/* Calendar Header Control */}
      <div style={headerControlStyle}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Weekly Agenda</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Program and edit cross-channel campaign nodes</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '8px 16px', gap: '6px' }}>
          <Plus size={14} /> Schedule Post
        </button>
      </div>

      {/* Week Grid */}
      <div style={weekGridStyle}>
        {weekDates.map((dateObj, idx) => {
          const dateStr = dateObj.toISOString().split('T')[0];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const dayEvents = getEventsForDate(dateStr);

          return (
            <div 
              key={idx} 
              className="glass" 
              style={{
                ...dayColStyle,
                borderColor: isToday ? 'var(--color-primary)' : 'var(--border-color)',
                background: isToday ? 'rgba(139, 92, 246, 0.01)' : 'rgba(255,255,255,0.01)'
              }}
            >
              {/* Day Header */}
              <div style={dayHeaderStyle(isToday)}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{dayName}</span>
                <span style={dayNumStyle(isToday)}>{dayNum}</span>
              </div>

              {/* Day Events Container */}
              <div style={eventsListContainerStyle}>
                {dayEvents.length === 0 ? (
                  <div style={emptyDayStyle}>No campaigns</div>
                ) : (
                  dayEvents.map((evt) => {
                    const platformInfo = PLATFORMS.find(p => p.id === evt.platform) || PLATFORMS[0];
                    const PlatformIcon = platformInfo.icon;
                    return (
                      <div 
                        key={evt.id} 
                        style={{
                          ...eventCardStyle,
                          borderLeftColor: platformInfo.color
                        }}
                      >
                        <div style={eventCardHeaderStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: platformInfo.color }}>
                            <PlatformIcon size={12} />
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>{platformInfo.name.split(' ')[0]}</span>
                          </div>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Clock size={8} /> {evt.time}
                          </span>
                        </div>

                        <p style={eventCardContentStyle}>{evt.content}</p>

                        <div style={eventCardActionsStyle}>
                          <button 
                            onClick={() => toggleEventStatus(evt.id)}
                            style={{
                              ...statusBadgeStyle(evt.status),
                              color: evt.status === 'posted' ? 'var(--success)' : 'var(--text-secondary)'
                            }}
                          >
                            {evt.status === 'posted' ? <><Check size={10} /> Posted</> : <><Send size={8} /> Queue</>}
                          </button>
                          <button 
                            onClick={() => deleteCalendarEvent(evt.id)}
                            style={deleteIconButtonStyle}
                            title="Delete draft"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass animate-slide-up" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '16px' }}>Schedule Campaign Draft</h3>
              <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>×</button>
            </div>
            
            <form onSubmit={handleCreateEvent} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Platform Destination</label>
                <div style={platformGridStyle}>
                  {PLATFORMS.map((p) => {
                    const PIcon = p.icon;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setPlatform(p.id as any)}
                        style={{
                          ...platformChipStyle,
                          borderColor: platform === p.id ? p.color : 'var(--border-color)',
                          background: platform === p.id ? `${p.color}15` : 'transparent',
                          color: platform === p.id ? p.color : 'var(--text-secondary)'
                        }}
                      >
                        <PIcon size={14} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Post Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Target Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Social Copy Content</label>
                  <button 
                    type="button" 
                    onClick={handleEnhanceHashtags}
                    disabled={isEnhancing || !content.trim()}
                    style={enhanceButtonStyle}
                  >
                    <Hash size={10} /> {isEnhancing ? 'Tagging...' : 'Optimize Hashtags'}
                  </button>
                </div>
                <textarea 
                  className="form-input"
                  rows={4}
                  placeholder="Draft your message node..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <PreFlightScorer content={content} />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                disabled={!content.trim()}
              >
                Schedule Campaign Node
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface PreFlightScorerProps {
  content: string;
}

const PreFlightScorer: React.FC<PreFlightScorerProps> = ({ content }) => {
  if (!content.trim()) {
    return (
      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
        Start typing to view engagement and CTR predictions.
      </div>
    );
  }

  // Hook Strength Heuristic
  let hookStrength = 20;
  if (content.includes('?')) hookStrength += 20;
  
  const sentences = content.split(/[.!?]/).filter(Boolean);
  const firstSentence = sentences[0] || '';
  if (firstSentence && firstSentence.trim().length <= 55) {
    hookStrength += 25;
  }
  if (/\d+/.test(content)) hookStrength += 15;
  
  const emojiRegex = /[\uD800-\uDFFF\u2600-\u27BF]/g;
  if (emojiRegex.test(content)) hookStrength += 20;
  if (content.length >= 100 && content.length <= 220) hookStrength += 10;
  hookStrength = Math.min(100, hookStrength);

  // Redirection Risk Heuristic
  let redirectionRisk = 10;
  const linkRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b)/g;
  const hasLink = linkRegex.test(content);
  if (hasLink) {
    redirectionRisk += 40;
    const linkIndex = content.search(linkRegex);
    if (linkIndex !== -1 && linkIndex < content.length / 2) {
      redirectionRisk += 30;
    }
  }
  const hashtagCount = (content.match(/#/g) || []).length;
  if (hashtagCount > 3) redirectionRisk += 20;
  redirectionRisk = Math.min(100, redirectionRisk);

  // CTR Potential Heuristic
  const ctaWords = ['click', 'visit', 'try', '👇', 'link', 'here', 'get', 'join', 'shop'];
  const hasCta = ctaWords.some(w => content.toLowerCase().includes(w));
  let ctrPotential = Math.round(hookStrength * 0.5 + (100 - redirectionRisk) * 0.3);
  if (hasCta) ctrPotential += 20;
  ctrPotential = Math.min(100, Math.max(0, ctrPotential));

  // Recommendations
  const recommendations: string[] = [];
  if (!hasCta) {
    recommendations.push("Add a clear Call-To-Action (e.g., 'try', 'visit', '👇')");
  }
  if (firstSentence.trim().length > 55) {
    recommendations.push("Shorten the first sentence to improve readability");
  }
  if (!emojiRegex.test(content)) {
    recommendations.push("Incorporate an emoji to boost visual engagement");
  }
  if (hashtagCount === 0) {
    recommendations.push("Add hashtags to improve discovery");
  }
  if (hasLink) {
    const firstHalfLink = content.search(linkRegex) < content.length / 2;
    if (firstHalfLink) {
      recommendations.push("Place the link at the end to lower redirection risk");
    }
  }

  const primaryGradient = 'linear-gradient(90deg, var(--color-pink), var(--color-primary))';
  const secondaryGradient = 'linear-gradient(90deg, var(--color-secondary), var(--color-indigo))';

  const hookGradient = hookStrength >= 60 ? secondaryGradient : primaryGradient;
  const ctrGradient = ctrPotential >= 60 ? secondaryGradient : primaryGradient;
  const riskGradient = redirectionRisk <= 40 ? secondaryGradient : primaryGradient;

  return (
    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Pre-Flight Engagement Scorer
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
            <span>Hook Strength</span>
            <span style={{ fontWeight: 600, color: hookStrength >= 60 ? 'var(--color-secondary)' : 'var(--color-pink)' }}>{hookStrength}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${hookStrength}%`, height: '100%', background: hookGradient, transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
            <span>Redirection Risk</span>
            <span style={{ fontWeight: 600, color: redirectionRisk <= 40 ? 'var(--color-secondary)' : 'var(--color-pink)' }}>{redirectionRisk}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${redirectionRisk}%`, height: '100%', background: riskGradient, transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
            <span>Estimated CTR Potential</span>
            <span style={{ fontWeight: 600, color: ctrPotential >= 60 ? 'var(--color-secondary)' : 'var(--color-pink)' }}>{ctrPotential}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${ctrPotential}%`, height: '100%', background: ctrGradient, transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Actionable Improvements:</div>
          <ul style={{ paddingLeft: '12px', margin: 0, fontSize: '9px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px', listStyleType: 'disc' }}>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
};

const headerControlStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const weekGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '12px',
  flex: 1,
  minHeight: '450px'
};

const dayColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  overflow: 'hidden',
  height: '100%',
  padding: 0
};

const dayHeaderStyle = (isToday: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: isToday ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-color)'
});

const dayNumStyle = (isToday: boolean): React.CSSProperties => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: isToday ? 'var(--color-primary)' : 'transparent',
  color: isToday ? '#ffffff' : 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700
});

const eventsListContainerStyle: React.CSSProperties = {
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
  overflowY: 'auto'
};

const emptyDayStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  textAlign: 'center',
  marginTop: '20px',
  fontStyle: 'italic'
};

const eventCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderLeft: '3px solid transparent',
  borderRadius: '6px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  transition: 'transform 0.2s',
  cursor: 'pointer'
};

const eventCardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const eventCardContentStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-secondary)',
  lineHeight: '1.4',
  wordBreak: 'break-word',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const eventCardActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '4px',
  borderTop: '1px solid rgba(255,255,255,0.04)',
  paddingTop: '6px'
};

const statusBadgeStyle = (_status: 'scheduled' | 'posted'): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: '9px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: '4px',
  transition: 'background 0.2s'
});

const deleteIconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '2px',
  borderRadius: '4px',
  outline: 'none'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(3, 3, 5, 0.8)',
  backdropFilter: 'blur(6px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalContentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  background: '#0d0d12',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  borderRadius: '16px',
  overflow: 'hidden'
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.06)'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '20px'
};

const platformGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px'
};

const platformChipStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  transition: 'all 0.2s'
};

const enhanceButtonStyle: React.CSSProperties = {
  background: 'rgba(139, 92, 246, 0.1)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  color: 'var(--color-primary)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '9px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '3px'
};
