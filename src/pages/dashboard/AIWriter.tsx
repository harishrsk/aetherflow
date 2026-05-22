import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Copy, Check, Zap } from 'lucide-react';

const WRITER_TEMPLATES = [
  { name: 'Google Ads Search', icon: '🔍', desc: 'High CTR headlines and descriptions for search campaigns.' },
  { name: 'LinkedIn Hook', icon: '💼', desc: 'Engaging story openings that drive clicks and impressions.' },
  { name: 'Product Pitch', icon: '🚀', desc: 'Short, persuasive descriptions focused on core benefits.' },
  { name: 'Blog Intro', icon: '📝', desc: 'Hook readers and outline what they will learn.' },
  { name: 'Twitter/X Thread', icon: '🐦', desc: 'Punchy starter hooks to get retweets and bookmarks.' }
];

export const AIWriter: React.FC = () => {
  const { consumeCredits, addWriterItem, apiKey, user, showToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'conductor'>('single');
  const [selectedTemplate, setSelectedTemplate] = useState('Google Ads Search');
  const [prompt, setPrompt] = useState('');
  const [audience, setAudience] = useState('SaaS Founders');
  const [tone, setTone] = useState('Persuasive');
  const [length, setLength] = useState(150);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // One-Shot Conductor states
  const [campaignObjective, setCampaignObjective] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [conductorOutputs, setConductorOutputs] = useState<{
    googleAds: string;
    linkedin: string;
    twitter: string;
    imagePrompt: string;
  } | null>(null);

  const handleOrchestrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignObjective.trim()) return;

    setErrorMsg('');
    setIsOrchestrating(true);
    setConductorOutputs(null);

    // Pre-check credits balance
    if (user.credits < 15) {
      setErrorMsg('Insufficient credits! One-Shot Campaign Conductor requires 15 credits.');
      setIsOrchestrating(false);
      return;
    }

    const campaignId = Math.random().toString(36).substring(2, 9);
    const activeApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    let finalGoogleAds = '';
    let finalLinkedin = '';
    let finalTwitter = '';
    let finalImagePrompt = '';

    const fetchGemini = async (templateName: string, promptText: string): Promise<string> => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `API returned status ${response.status}`);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        throw new Error(`Gemini API did not return any candidate copy contents for ${templateName}.`);
      }
      return text;
    };

    if (activeApiKey) {
      try {
        const adsPrompt = `Write a Google Ads Search cluster (3 Headlines of max 30 chars, and 2 Descriptions of max 90 chars) for this campaign objective: ${campaignObjective}. Format it clearly with Headline 1/2/3 and Description 1/2. Keep it concise, professional, and high CTR.`;
        const liPrompt = `Write an engaging LinkedIn story hook/post opening for this campaign objective: ${campaignObjective}. Make it professional, compelling, and formatted with line breaks for readability. Limit to 100 words.`;
        const twPrompt = `Write a punchy Twitter/X thread concept (first 3 tweets) for this campaign objective: ${campaignObjective}. Limit each tweet to 280 characters, separated by double newlines. Focus on hook value and high bookmarking potential.`;
        const imgPrompt = `Write a single-paragraph optimized image generation prompt token string pre-filled for stable diffusion, depicting a visual asset representing this campaign objective: ${campaignObjective}. Keep it descriptive, detail style modifiers (e.g. 3d render, neon lighting, highly detailed), and limit to 40 words. Do not include introductory text, return only the prompt.`;

        // Execute in parallel
        const [adsRes, liRes, twRes, imgRes] = await Promise.all([
          fetchGemini('Google Ads Search', adsPrompt),
          fetchGemini('LinkedIn Hook', liPrompt),
          fetchGemini('Twitter/X Thread', twPrompt),
          fetchGemini('Image Prompt Conductor', imgPrompt)
        ]);

        finalGoogleAds = adsRes;
        finalLinkedin = liRes;
        finalTwitter = twRes;
        finalImagePrompt = imgRes;

        // Deduct credits only on success of all 4
        consumeCredits(15);

      } catch (err: any) {
        console.error("Gemini Conductor API Error:", err);
        setErrorMsg(`Campaign Conductor API Error: ${err.message || err}`);
        showToast(`Campaign Conductor API Error: ${err.message || err}`, 'error');
        setIsOrchestrating(false);
        return; // Halt and preserve credits
      }
    } else {
      setErrorMsg('Developer key missing! Please configure your Gemini API Key in the "Developer Keys" sidebar panel to start generating live copy.');
      setIsOrchestrating(false);
      return;
    }

    // Parallel typing simulation effect for UX
    let currentAds = '';
    let currentLi = '';
    let currentTw = '';
    let currentImg = '';
    let step = 0;
    const maxSteps = Math.max(
      finalGoogleAds.length,
      finalLinkedin.length,
      finalTwitter.length,
      finalImagePrompt.length
    );

    const interval = setInterval(() => {
      if (step < maxSteps) {
        if (step < finalGoogleAds.length) currentAds += finalGoogleAds[step];
        if (step < finalLinkedin.length) currentLi += finalLinkedin[step];
        if (step < finalTwitter.length) currentTw += finalTwitter[step];
        if (step < finalImagePrompt.length) currentImg += finalImagePrompt[step];

        setConductorOutputs({
          googleAds: currentAds,
          linkedin: currentLi,
          twitter: currentTw,
          imagePrompt: currentImg
        });
        step += 3;
      } else {
        clearInterval(interval);
        setConductorOutputs({
          googleAds: finalGoogleAds,
          linkedin: finalLinkedin,
          twitter: finalTwitter,
          imagePrompt: finalImagePrompt
        });
        setIsOrchestrating(false);
        // Save items to history with specific templates and campaign ID
        addWriterItem('Google Ads Search', `[Campaign: ${campaignId}] ${campaignObjective}`, finalGoogleAds);
        addWriterItem('LinkedIn Hook', `[Campaign: ${campaignId}] ${campaignObjective}`, finalLinkedin);
        addWriterItem('Twitter/X Thread', `[Campaign: ${campaignId}] ${campaignObjective}`, finalTwitter);
        addWriterItem('Image Prompt Conductor', `[Campaign: ${campaignId}] ${campaignObjective}`, finalImagePrompt);
        showToast('Campaign orchestrated successfully across 4 channels.', 'success');
      }
    }, 15);
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
    const activeApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    
    // If Gemini key is set, try using real API (Optional Developer feature!)
    if (activeApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`, {
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
      setErrorMsg('Developer key missing! Please configure your Gemini API Key in the "Developer Keys" sidebar panel to start generating live copy.');
      setIsGenerating(false);
      return;
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
        {/* Copywriter Sub-Tabs */}
        <div style={tabContainerStyle}>
          <button
            type="button"
            onClick={() => { setActiveSubTab('single'); setErrorMsg(''); }}
            style={{
              ...tabButtonStyle,
              borderBottomColor: activeSubTab === 'single' ? 'var(--color-primary)' : 'transparent',
              color: activeSubTab === 'single' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Single Template Copywriter
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab('conductor'); setErrorMsg(''); }}
            style={{
              ...tabButtonStyle,
              borderBottomColor: activeSubTab === 'conductor' ? 'var(--color-secondary)' : 'transparent',
              color: activeSubTab === 'conductor' ? 'var(--color-secondary)' : 'var(--text-secondary)'
            }}
          >
            One-Shot Campaign Conductor
          </button>
        </div>

        {activeSubTab === 'single' && (
          <>
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
          </>
        )}

        {activeSubTab === 'conductor' && (
          <>
            {/* Conductor Form */}
            <div className="glass" style={formCardStyle}>
              <form onSubmit={handleOrchestrate}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Campaign Objective / Product Link</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Describe what you are orchestrating</span>
                  </label>
                  <textarea 
                    className="form-input"
                    rows={4}
                    placeholder="e.g. Launching a new eco-friendly water bottle brand targeting Gen Z fitness enthusiasts. Highlight cold retention and lifetime warranty."
                    value={campaignObjective}
                    onChange={(e) => setCampaignObjective(e.target.value)}
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
                  style={{ width: '100%', padding: '14px', gap: '8px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', boxShadow: '0 4px 15px -3px var(--glow-secondary)' }}
                  disabled={isOrchestrating || !campaignObjective.trim()}
                >
                  {isOrchestrating ? (
                    <>
                      <div className="loader"></div> Orchestrating Parallel Nodes...
                    </>
                  ) : (
                    <>
                      Orchestrate Campaign <Sparkles size={14} style={{ fill: 'currentColor' }} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2x2 Grid Output */}
            {(conductorOutputs || isOrchestrating) && (
              <div style={gridContainerStyle}>
                
                {/* Node 1: Google Ads */}
                <div className="glass" style={{ ...gridPanelStyle, border: '1px solid var(--border-color)', borderLeft: '3px solid var(--color-primary)', boxShadow: '0 4px 20px -5px var(--glow-primary)' }}>
                  <div style={gridPanelHeaderStyle}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>🔍 Google Ads Search Cluster</span>
                    {conductorOutputs?.googleAds && (
                      <button onClick={() => handleCopy(conductorOutputs.googleAds, 'gads')} style={copyIconButtonStyle}>
                        {copiedId === 'gads' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        <span>{copiedId === 'gads' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div style={gridPanelBodyStyle}>
                    {conductorOutputs?.googleAds ? (
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.5' }}>{conductorOutputs.googleAds}</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <div style={skeletonLineStyle('80%')}></div>
                        <div style={skeletonLineStyle('95%')}></div>
                        <div style={skeletonLineStyle('40%')}></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Node 2: LinkedIn Hook */}
                <div className="glass" style={{ ...gridPanelStyle, border: '1px solid var(--border-color)', borderLeft: '3px solid var(--color-secondary)', boxShadow: '0 4px 20px -5px var(--glow-secondary)' }}>
                  <div style={gridPanelHeaderStyle}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>💼 LinkedIn Hook Story</span>
                    {conductorOutputs?.linkedin && (
                      <button onClick={() => handleCopy(conductorOutputs.linkedin, 'li')} style={copyIconButtonStyle}>
                        {copiedId === 'li' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        <span>{copiedId === 'li' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div style={gridPanelBodyStyle}>
                    {conductorOutputs?.linkedin ? (
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.5' }}>{conductorOutputs.linkedin}</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <div style={skeletonLineStyle('90%')}></div>
                        <div style={skeletonLineStyle('75%')}></div>
                        <div style={skeletonLineStyle('60%')}></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Node 3: Twitter Thread */}
                <div className="glass" style={{ ...gridPanelStyle, border: '1px solid var(--border-color)', borderLeft: '3px solid var(--color-indigo)', boxShadow: '0 4px 20px -5px var(--glow-indigo)' }}>
                  <div style={gridPanelHeaderStyle}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-indigo)', textTransform: 'uppercase' }}>🐦 Twitter/X Thread Concept</span>
                    {conductorOutputs?.twitter && (
                      <button onClick={() => handleCopy(conductorOutputs.twitter, 'tw')} style={copyIconButtonStyle}>
                        {copiedId === 'tw' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        <span>{copiedId === 'tw' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div style={gridPanelBodyStyle}>
                    {conductorOutputs?.twitter ? (
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.5' }}>{conductorOutputs.twitter}</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <div style={skeletonLineStyle('85%')}></div>
                        <div style={skeletonLineStyle('90%')}></div>
                        <div style={skeletonLineStyle('50%')}></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Node 4: Image Prompt */}
                <div className="glass" style={{ ...gridPanelStyle, border: '1px solid var(--border-color)', borderLeft: '3px solid var(--color-pink)', boxShadow: '0 4px 20px -5px rgba(236, 72, 153, 0.2)' }}>
                  <div style={gridPanelHeaderStyle}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-pink)', textTransform: 'uppercase' }}>🎨 Studio Image Prompt Token</span>
                    {conductorOutputs?.imagePrompt && (
                      <button onClick={() => handleCopy(conductorOutputs.imagePrompt, 'img')} style={copyIconButtonStyle}>
                        {copiedId === 'img' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        <span>{copiedId === 'img' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div style={gridPanelBodyStyle}>
                    {conductorOutputs?.imagePrompt ? (
                      <>
                        <p style={{ fontStyle: 'italic', fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>"{conductorOutputs.imagePrompt}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('switch-dashboard-tab', {
                              detail: { tab: 'studio', prompt: conductorOutputs.imagePrompt }
                            }));
                          }}
                          className="btn btn-secondary"
                          style={{ marginTop: '12px', width: '100%', gap: '6px', fontSize: '11px', borderColor: 'var(--color-pink)' }}
                        >
                          <Zap size={12} color="var(--color-pink)" />
                          <span>Send to Creative Image Studio</span>
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <div style={skeletonLineStyle('95%')}></div>
                        <div style={skeletonLineStyle('80%')}></div>
                        <div style={skeletonLineStyle('70%')}></div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      {/* Control Sidebar parameters */}
      <div className="glass" style={settingsSidebarStyle}>
        <h3 style={sidebarTitleStyle}>Copy Settings</h3>
        
        {activeSubTab === 'single' ? (
          <>
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
          </>
        ) : (
          <>
            <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.03)', border: '1px dashed rgba(6, 182, 212, 0.2)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              <Zap size={12} color="var(--color-secondary)" style={{ marginBottom: '4px', display: 'block' }} />
              Campaign parameters are optimized dynamically across four specialized neural nodes concurrently.
            </div>

            <div style={{ ...costIndicatorStyle, borderColor: 'rgba(6, 182, 212, 0.2)', background: 'rgba(6, 182, 212, 0.03)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Credits Cost</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-secondary)' }}>15 <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>credits</span></div>
            </div>
          </>
        )}
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

const tabContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '8px',
  marginBottom: '20px'
};

const tabButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.2s',
  outline: 'none'
};

const gridContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const gridPanelStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  transition: 'all 0.3s ease'
};

const gridPanelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  paddingBottom: '8px'
};

const gridPanelBodyStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-primary)',
  lineHeight: '1.6'
};

