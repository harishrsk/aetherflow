import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Copy, Check, History, Zap } from 'lucide-react';

const WRITER_TEMPLATES = [
  { name: 'Google Ads Search', icon: '🔍', desc: 'High CTR headlines and descriptions for search campaigns.' },
  { name: 'LinkedIn Hook', icon: '💼', desc: 'Engaging story openings that drive clicks and impressions.' },
  { name: 'Product Pitch', icon: '🚀', desc: 'Short, persuasive descriptions focused on core benefits.' },
  { name: 'Blog Intro', icon: '📝', desc: 'Hook readers and outline what they will learn.' },
  { name: 'Twitter/X Thread', icon: '🐦', desc: 'Punchy starter hooks to get retweets and bookmarks.' }
];

export const AIWriter: React.FC = () => {
  const { writerHistory, consumeCredits, addWriterItem, apiKey, user } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState('Google Ads Search');
  const [prompt, setPrompt] = useState('');
  const [audience, setAudience] = useState('SaaS Founders');
  const [tone, setTone] = useState('Persuasive');
  const [length, setLength] = useState(150);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateMockText = (template: string, promptText: string): string => {
    const key = promptText.toLowerCase();
    
    // Custom responses based on keywords in the prompt to make it look incredibly realistic!
    if (key.includes('bottle') || key.includes('water') || key.includes('drink')) {
      if (template === 'Google Ads Search') {
        return `Headline: Ice-Cold Hydration For 48 Hours\nHeadline: Zero Waste Stainless Steel Bottle\nHeadline: Ditch Plastic, Upgrade to Premium\n\nDescription: Keep your cold drinks crisp and hot drinks steaming. Engineered with dual-wall vacuum steel insulation. Lifetime guarantee. Shop our collections today with 10% off.`;
      }
      if (template === 'LinkedIn Hook') {
        return `I used to buy 3 plastic water bottles a day. \n\nThat's 1,095 bottles a year. Not only was it destroying my wallet ($2,190/yr!), it was filling up landfills. \n\nSo we designed something better. Double-walled stainless steel that keeps ice solid for 48 hours. Here's what we learned about sustainable hardware design in 2026... 👇`;
      }
      return `Product Pitch: The ultimate vacuum-insulated thermal flask. Keeps beverages freezing cold for 48 hours or piping hot for 24. Sleek ergonomic design with a powder-coated sweat-proof finish. Protect the planet, one refill at a time.`;
    }

    if (key.includes('seo') || key.includes('traffic') || key.includes('blog') || key.includes('rank')) {
      if (template === 'Google Ads Search') {
        return `Headline: Rank #1 on Google in 30 Days\nHeadline: Automated SEO Content Writer\nHeadline: Generate Organic Traffic Free\n\nDescription: Create search-optimized content in seconds. Stop paying expensive SEO agencies. Let our intelligence engine write copy that drives high-intent clicks. Start free.`;
      }
      return `LinkedIn Hook: SEO is dead. Or is it? \n\nMost founders are writing 2,000-word blog posts that get exactly zero visits from Google. The algorithm has changed. Now it's about semantic depth and intent matching. \n\nHere is our exact 3-step playbook that generated 120,000 visitors without spending a dollar on ads... 🧵`;
    }

    // Default responses if no keywords match
    switch (template) {
      case 'Google Ads Search':
        return `Headline: Supercharge ${promptText || 'Your Project'} with AI\nHeadline: Scale Marketing Automation\nHeadline: 10x Content Speed in 1 Click\n\nDescription: Turn hours of manual copywriting into seconds of automated generation. Designed for startup marketing, social scheduling, and conversion optimization. Start free today.`;
      case 'LinkedIn Hook':
        return `We just built an AI workflow that saved our team 35 hours a week. \n\nNo, it's not a generic prompt wrapper. We integrated copywriting with calendar workflows. \n\nHere is how automation is restructuring the modern content stack, and why founders who don't adapt will get left behind:`;
      case 'Product Pitch':
        return `Pitch: Scale ${promptText || 'your brand'} with an intelligent creative ecosystem. It automatically matches target tone (witty, persuasive, professional), consumes credits only on execution, and lets teams deploy production-ready campaigns in a fraction of the traditional time.`;
      case 'Blog Intro':
        return `Introduction:\nIn the digital age, content velocity is no longer optional. But keeping quality high while scaling output is a bottleneck that stifles growth. In this guide, we dive deep into how automated campaign engines are closing the gap, enabling startups to maintain premium messaging across channels without scaling overhead.`;
      case 'Twitter/X Thread':
        return `Hook: Most founders spend 10+ hours a week formatting Twitter threads.\n\nHere is how to automate the entire process using semantic styling chips and AI context pipelines.\n\nA step-by-step masterclass: 🧵`;
      default:
        return `Generated copy for: ${promptText}. Formatted targeting ${audience} in a ${tone} tone. Ready for deployment.`;
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setErrorMsg('');
    setIsGenerating(true);
    setOutput('');

    // Pre-check credits balance
    if (user.credits < 5) {
      setErrorMsg('Insufficient credits! Please upgrade to Pro to receive 500 premium credits.');
      setIsGenerating(false);
      return;
    }

    let generatedResult = '';
    
    // If Gemini key is set, try using real API (Optional Developer feature!)
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Write marketing copy for a tool. 
                      Template Type: ${selectedTemplate}
                      Product Description: ${prompt}
                      Target Audience: ${audience}
                      Tone of Voice: ${tone}
                      Length limit: ${length} words.
                      Return only the copy, no explanations or markdown markers.`
              }]
            }]
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || `API returned status ${response.status}`);
        }
        
        generatedResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!generatedResult) {
          throw new Error('Gemini API did not return any candidate copy contents.');
        }

        // Consume 5 credits only on successful generation
        consumeCredits(5);

      } catch (err: any) {
        console.error("Gemini API Error:", err);
        setErrorMsg(`Gemini API Error: ${err.message || err}`);
        setIsGenerating(false);
        return; // Halt and preserve credits
      }
    } else {
      // Simulate generator - consume credits and use local fallback
      consumeCredits(5);
      generatedResult = generateMockText(selectedTemplate, prompt);
    }

    let currentText = '';
    let i = 0;
    
    // Typewriter effect
    const interval = setInterval(() => {
      if (i < generatedResult.length) {
        currentText += generatedResult[i];
        setOutput(currentText);
        i++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        addWriterItem(selectedTemplate, prompt, generatedResult);
      }
    }, 15);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div style={writerContainerStyle}>
      <div style={mainPanelStyle}>
        
        {/* Template Selector Chips */}
        <div style={templateSelectorStyle}>
          {WRITER_TEMPLATES.map((tpl) => (
            <div 
              key={tpl.name}
              onClick={() => setSelectedTemplate(tpl.name)}
              className="glass"
              style={{
                ...templateChipStyle,
                borderColor: selectedTemplate === tpl.name ? 'var(--color-primary)' : 'var(--border-color)',
                background: selectedTemplate === tpl.name ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tpl.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{tpl.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{tpl.name.split(' ')[0]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Generator Form */}
        <div className="glass" style={formCardStyle}>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>What are you building/advertising?</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Describe product core features</span>
              </label>
              <textarea 
                className="form-input"
                rows={5}
                placeholder="e.g. AetherFlow is a unified SaaS marketing hub that merges writing, image generation, and calendars to save growth teams 15 hours a week."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ resize: 'none', lineHeight: '1.5' }}
              />
            </div>

            {errorMsg && (
              <div style={errorContainerStyle}>
                <Zap size={14} /> <span>{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', gap: '8px' }}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <div className="loader"></div> Processing prompt tokens...
                </>
              ) : (
                <>
                  Generate Content <Sparkles size={14} style={{ fill: 'currentColor' }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Copy Output Area */}
        {(output || isGenerating) && (
          <div className="glass" style={outputCardStyle}>
            <div style={outputHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                <Sparkles size={14} color="var(--color-primary)" />
                <span>AI Creative Draft</span>
              </div>
              {output && !isGenerating && (
                <button 
                  onClick={() => handleCopy(output, 'current')}
                  style={copyIconButtonStyle}
                >
                  {copiedId === 'current' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  <span>{copiedId === 'current' ? 'Copied' : 'Copy Draft'}</span>
                </button>
              )}
            </div>
            <div style={outputTextContainerStyle}>
              {output ? (
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>{output}</p>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <div style={skeletonLineStyle('80%')}></div>
                  <div style={skeletonLineStyle('95%')}></div>
                  <div style={skeletonLineStyle('50%')}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History / Toggle list */}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={historyToggleStyle}
          >
            <History size={14} />
            <span>Show Copywriting History ({writerHistory.length})</span>
          </button>

          {showHistory && (
            <div style={historyListStyle}>
              {writerHistory.length === 0 ? (
                <div style={emptyHistoryStyle}>No generations saved yet.</div>
              ) : (
                writerHistory.map((item) => (
                  <div key={item.id} className="glass" style={historyItemStyle}>
                    <div style={historyItemHeaderStyle}>
                      <span style={historyTemplateBadgeStyle}>{item.template}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={historyPromptStyle}>Prompt: "{item.prompt}"</p>
                    <div style={historyOutputContainerStyle}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{item.response}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button 
                        onClick={() => handleCopy(item.response, item.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px', gap: '4px' }}
                      >
                        {copiedId === item.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Control Sidebar parameters */}
      <div className="glass" style={settingsSidebarStyle}>
        <h3 style={sidebarTitleStyle}>Copy Settings</h3>
        
        <div className="form-group">
          <label className="form-label">Target Audience</label>
          <select 
            className="form-select"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option>SaaS Founders</option>
            <option>Digital Marketers</option>
            <option>Growth Hackers</option>
            <option>Developers</option>
            <option>General Consumer</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Tone of Voice</label>
          <select 
            className="form-select"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option>Persuasive</option>
            <option>Professional</option>
            <option>Creative</option>
            <option>Witty</option>
            <option>Formal</option>
          </select>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>Max Word Count</label>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{length} words</span>
          </div>
          <input 
            type="range" 
            min={50} 
            max={300} 
            step={10} 
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            style={sliderStyle}
          />
        </div>

        <div style={costIndicatorStyle}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Credits Cost</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>5 <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>credits</span></div>
        </div>
      </div>
    </div>
  );
};

// Styles
const writerContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '30px',
  alignItems: 'flex-start'
};

const mainPanelStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const templateSelectorStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: '12px'
};

const templateChipStyle: React.CSSProperties = {
  padding: '10px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s'
};

const formCardStyle: React.CSSProperties = {
  padding: '24px',
  background: 'rgba(255,255,255,0.01)'
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '8px',
  color: '#fca5a5',
  fontSize: '13px',
  marginBottom: '15px'
};

const outputCardStyle: React.CSSProperties = {
  padding: '20px',
  borderColor: 'var(--color-primary)',
  background: 'rgba(139, 92, 246, 0.02)',
  boxShadow: '0 4px 20px -5px var(--glow-primary)',
  animation: 'fadeIn 0.4s ease-out'
};

const outputHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  paddingBottom: '10px',
  marginBottom: '12px'
};

const copyIconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11px',
  outline: 'none',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'background-color 0.2s'
};

const outputTextContainerStyle: React.CSSProperties = {
  minHeight: '60px'
};

const skeletonLineStyle = (width: string): React.CSSProperties => ({
  height: '10px',
  width,
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '4px',
  animation: 'pulseGlow 1.5s infinite ease-in-out'
});

const historyToggleStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  outline: 'none',
  padding: '5px 0'
};

const historyListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '15px'
};

const emptyHistoryStyle: React.CSSProperties = {
  padding: '20px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '12px',
  border: '1px dashed var(--border-color)',
  borderRadius: '8px'
};

const historyItemStyle: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(255,255,255,0.01)'
};

const historyItemHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px'
};

const historyTemplateBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  background: 'rgba(255,255,255,0.05)',
  padding: '2px 8px',
  borderRadius: '4px',
  fontWeight: 600,
  color: 'var(--text-secondary)'
};

const historyPromptStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
  marginBottom: '8px'
};

const historyOutputContainerStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.15)',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#cbd5e1',
  lineHeight: '1.5'
};

const settingsSidebarStyle: React.CSSProperties = {
  width: '260px',
  padding: '20px',
  background: 'rgba(255,255,255,0.01)',
  borderRadius: '16px',
  flexShrink: 0
};

const sidebarTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  marginBottom: '20px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  paddingBottom: '8px'
};

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: 'var(--color-primary)',
  cursor: 'pointer'
};

const costIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  background: 'rgba(139, 92, 246, 0.03)',
  border: '1px solid rgba(139, 92, 246, 0.1)',
  borderRadius: '8px',
  marginTop: '20px'
};
