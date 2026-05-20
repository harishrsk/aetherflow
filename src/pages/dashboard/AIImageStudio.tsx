import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ImageIcon, Sparkles, Download, Zap } from 'lucide-react';

const STYLE_PRESETS = [
  { name: 'Photorealistic', chip: '📸' },
  { name: '3D Render', chip: '💻' },
  { name: 'Synthwave', chip: '🌆' },
  { name: 'Watercolor', chip: '🎨' },
  { name: 'Minimalist Line Art', chip: '✏️' }
];

const PRESETS = [
  "A futuristic office workspace with glowing holographic interfaces, 3d render",
  "A serene mountain peak surrounded by purple aurora borealis, digital art",
  "A glowing cybernetic brain representing machine learning, cyberpunk style",
  "Minimalist packaging mockups for an eco-friendly skincare brand, warm sunlight"
];

export const AIImageStudio: React.FC = () => {
  const { studioImages, consumeCredits, addStudioImage } = useApp();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('3D Render');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Unsplash images mapped to prompt keywords to simulate a real image generator!
  const getSimulatedImage = (promptText: string): string => {
    const key = promptText.toLowerCase();
    if (key.includes('office') || key.includes('workspace') || key.includes('desk') || key.includes('computer')) {
      return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'; // developer desk
    }
    if (key.includes('aurora') || key.includes('mountain') || key.includes('landscape') || key.includes('sky')) {
      return 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=800&q=80'; // starry night
    }
    if (key.includes('brain') || key.includes('cyber') || key.includes('tech') || key.includes('ai')) {
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'; // tech neon lines
    }
    if (key.includes('skincare') || key.includes('cosmetics') || key.includes('product') || key.includes('minimal')) {
      return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'; // product shoot
    }
    
    // Default pool of stunning abstract images
    const defaultPool = [
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80', // fluid 3d shape
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80', // abstract light paint
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', // neon shapes
      'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80'  // abstract space dust
    ];
    return defaultPool[Math.floor(Math.random() * defaultPool.length)];
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setErrorMsg('');
    setIsGenerating(true);
    setCurrentProgress(5);
    setStatusMessage('Analyzing prompt tags...');

    // Consume 10 credits
    const success = consumeCredits(10);
    if (!success) {
      setErrorMsg('Insufficient credits! Please upgrade to Pro to receive 500 premium credits.');
      setIsGenerating(false);
      return;
    }

    const steps = [
      { progress: 20, msg: 'Connecting to Stable Diffusion latent nodes...' },
      { progress: 45, msg: 'Generating latent noise mapping grid...' },
      { progress: 70, msg: 'Denoising steps (18/25) - injecting styling tokens...' },
      { progress: 90, msg: 'Upscaling textures & normalizing color spectrums...' },
      { progress: 100, msg: 'Finalizing canvas output...' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentProgress(steps[stepIndex].progress);
        setStatusMessage(steps[stepIndex].msg);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          const generatedUrl = getSimulatedImage(prompt);
          addStudioImage(prompt, selectedStyle, generatedUrl);
          setIsGenerating(false);
        }, 600);
      }
    }, 1200);
  };

  const handleDownload = async (url: string, _promptText: string) => {
    try {
      // In production we trigger a file download. Here we open in a new tab.
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={studioContainerStyle}>
      <div style={mainPanelStyle}>
        
        {/* Presets Grid */}
        <div style={presetsSectionStyle}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            Quick Prompts Inspiration:
          </div>
          <div style={presetsGridStyle}>
            {PRESETS.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => setPrompt(p)}
                style={presetCardStyle}
              >
                "{p.substring(0, 50)}..."
              </div>
            ))}
          </div>
        </div>

        {/* Studio Workspace Canvas */}
        <div className="glass" style={canvasContainerStyle}>
          {isGenerating ? (
            <div style={generatingOverlayStyle}>
              <div style={progressBoxStyle}>
                <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '3px', marginBottom: '16px' }}></div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Diffusing Latent Space</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{statusMessage}</div>
                <div style={progressBarTrackStyle}>
                  <div style={{...progressBarFillStyle, width: `${currentProgress}%`}}></div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>{currentProgress}% complete</div>
              </div>
            </div>
          ) : (
            <div style={canvasPlaceholderStyle}>
              {studioImages.length > 0 ? (
                <div style={activeImageFrameStyle}>
                  <img 
                    src={activePreviewImage || studioImages[0].url} 
                    alt="Latest generated render" 
                    style={activeImgStyle}
                  />
                  <div style={imageActionOverlayStyle}>
                    <button 
                      onClick={() => handleDownload(activePreviewImage || studioImages[0].url, activePreviewImage ? 'AetherFlow-image' : studioImages[0].prompt)}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', fontSize: '11px' }}
                    >
                      <Download size={12} /> Download HD
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontSize: '13px' }}>Your AI generated canvas output will render here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gallery / Saved images grid */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '15px' }}>Studio History & Gallery</h3>
          {studioImages.length === 0 ? (
            <div style={emptyGalleryStyle}>No images generated yet.</div>
          ) : (
            <div style={galleryGridStyle}>
              {studioImages.map((img) => (
                <div 
                  key={img.id}
                  className="glass-interactive" 
                  style={galleryCardStyle}
                  onClick={() => setActivePreviewImage(img.url)}
                >
                  <img src={img.url} alt={img.prompt} style={galleryImgStyle} />
                  <div style={galleryCardInfoStyle}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 600 }}>
                      {img.prompt}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '9px', color: 'var(--text-muted)' }}>
                      <span>{img.style}</span>
                      <span>{new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Control Sidebar parameters */}
      <div className="glass" style={settingsSidebarStyle}>
        <h3 style={sidebarTitleStyle}>Image Parameters</h3>

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Image prompt description</label>
            <textarea 
              className="form-input"
              rows={4}
              placeholder="e.g. A gorgeous modern office desk overlooking Tokyo skylines at midnight, synthwave styling, highly detailed..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ resize: 'none', fontSize: '12px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Artistic Style</label>
            <div style={styleSelectorGridStyle}>
              {STYLE_PRESETS.map((s) => (
                <div 
                  key={s.name}
                  onClick={() => setSelectedStyle(s.name)}
                  style={{
                    ...styleSelectorChipStyle,
                    borderColor: selectedStyle === s.name ? 'var(--color-secondary)' : 'var(--border-color)',
                    background: selectedStyle === s.name ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                    color: selectedStyle === s.name ? 'var(--color-secondary)' : 'var(--text-secondary)'
                  }}
                >
                  <span>{s.chip}</span>
                  <span style={{ fontSize: '10px' }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Aspect Ratio</label>
            <div style={ratioSelectorStyle}>
              {['1:1', '16:9', '9:16'].map((r) => (
                <div 
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  style={{
                    ...ratioChipStyle,
                    borderColor: aspectRatio === r ? 'var(--color-primary)' : 'var(--border-color)',
                    background: aspectRatio === r ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div style={errorContainerStyle}>
              <Zap size={14} /> <span>{errorMsg}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', gap: '6px', marginTop: '10px' }}
            disabled={isGenerating || !prompt.trim()}
          >
            Generate Image <Sparkles size={14} style={{ fill: 'currentColor' }} />
          </button>
        </form>

        <div style={costIndicatorStyle}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Credits Cost</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-secondary)' }}>10 <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>credits</span></div>
        </div>
      </div>
    </div>
  );
};

// Styles
const studioContainerStyle: React.CSSProperties = {
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

const presetsSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
};

const presetsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px'
};

const presetCardStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  fontSize: '11px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const canvasContainerStyle: React.CSSProperties = {
  height: '380px',
  background: '#07070b',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255, 255, 255, 0.04)'
};

const generatingOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(5, 5, 8, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 5
};

const progressBoxStyle: React.CSSProperties = {
  width: '260px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const progressBarTrackStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '3px',
  overflow: 'hidden'
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
  borderRadius: '3px',
  transition: 'width 0.4s ease-out'
};

const canvasPlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const activeImageFrameStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
};

const activeImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  background: '#000000'
};

const imageActionOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '15px',
  right: '15px',
  background: 'rgba(3, 3, 5, 0.6)',
  backdropFilter: 'blur(4px)',
  padding: '6px',
  borderRadius: '8px'
};

const emptyGalleryStyle: React.CSSProperties = {
  padding: '30px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '12px',
  border: '1px dashed var(--border-color)',
  borderRadius: '8px'
};

const galleryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
  gap: '15px'
};

const galleryCardStyle: React.CSSProperties = {
  borderRadius: '10px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  padding: 0
};

const galleryImgStyle: React.CSSProperties = {
  width: '100%',
  height: '90px',
  objectFit: 'cover'
};

const galleryCardInfoStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: 'rgba(255,255,255,0.01)'
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

const styleSelectorGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '8px'
};

const styleSelectorChipStyle: React.CSSProperties = {
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

const ratioSelectorStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px'
};

const ratioChipStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'center',
  fontSize: '11px',
  fontWeight: 600,
  transition: 'all 0.2s',
  color: 'var(--text-secondary)'
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

const costIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  background: 'rgba(6, 182, 212, 0.03)',
  border: '1px solid rgba(6, 182, 212, 0.1)',
  borderRadius: '8px',
  marginTop: '20px'
};
