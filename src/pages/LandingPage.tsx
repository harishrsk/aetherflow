import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { 
  Zap, 
  Sparkles, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  BarChart3, 
  ArrowRight, 
  Play, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  const { sessionUser } = useApp();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [demoPrompt, setDemoPrompt] = useState('An eco-friendly, double-walled stainless steel water bottle that keeps drinks cold for 48 hours.');
  const [demoResult, setDemoResult] = useState('');
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const generateDemoMock = (prompt: string): string => {
    const p = prompt.toLowerCase().trim();
    
    // 1. Water Bottle / Hydration
    if (p.includes('water') || p.includes('bottle') || p.includes('flask') || p.includes('hydration') || p.includes('drink')) {
      const brand = p.includes('eco-friendly') || p.includes('sustainable') ? 'EcoShield' : 'AeroFlow';
      return `Headline: Hydration Redefined | Meet the ${brand} Flask\nDescription: Keep your drinks crisp and at the perfect temperature for hours. Designed for active lifestyles with sustainable, high-durability materials. Shop the launch collection today.`;
    }
    
    // 2. SEO / Marketing / Traffic
    if (p.includes('seo') || p.includes('traffic') || p.includes('google') || p.includes('search') || p.includes('ranking') || p.includes('marketing')) {
      return `Headline: Explode Your Organic Traffic in 30 Days 📈\nDescription: Stop burning cash on ads. Our intelligent SEO optimizer identifies high-intent search terms and auto-generates content that ranks page one. Try it free today.`;
    }
    
    // 3. AI / GPT / Copilot / Automation / LLM
    if (p.includes('ai') || p.includes('artificial') || p.includes('gpt') || p.includes('bot') || p.includes('chat') || p.includes('automation') || p.includes('llm')) {
      return `Headline: Put Your Business on Autopilot with Advanced AI\nDescription: Automate copywriting, customer support, and content scheduling with one unified system. Save up to 20 hours a week and boost conversion rates by 40%.`;
    }
    
    // 4. Fitness / Gym / Workout / Health / Diet
    if (p.includes('fitness') || p.includes('gym') || p.includes('workout') || p.includes('health') || p.includes('protein') || p.includes('run') || p.includes('diet')) {
      return `Headline: Unlock Your Peak Performance\nDescription: Engineered for athletes who demand the best. Fuel your workouts, track progress seamlessly, and achieve your health milestones with science-backed formulas.`;
    }
    
    // 5. SaaS / Software / App / Platform / Tech
    if (p.includes('saas') || p.includes('software') || p.includes('app') || p.includes('platform') || p.includes('tool') || p.includes('code') || p.includes('tech')) {
      return `Headline: The Next-Gen Workspace for High-Growth Teams\nDescription: Streamline your workflows, integrate your favorite tools, and collaborate in real-time. Built by developers, for creators. Start your free trial today.`;
    }
    
    // 6. Food / Restaurant / Meal / Delivery / Cooking
    if (p.includes('food') || p.includes('restaurant') || p.includes('recipe') || p.includes('delivery') || p.includes('meal') || p.includes('cooking')) {
      return `Headline: Chef-Curated Meals Delivered Fresh to Your Door 🍽️\nDescription: Say goodbye to grocery shopping. Healthy, delicious recipes prepared by local chefs and ready in under 10 minutes. Order now and get 30% off your first week.`;
    }
    
    // 7. Clothing / Fashion / Apparel / Shoes / Shirt / Brand / Jewelry
    if (p.includes('clothing') || p.includes('fashion') || p.includes('apparel') || p.includes('shoes') || p.includes('shirt') || p.includes('brand') || p.includes('jewelry')) {
      return `Headline: Style Meets Comfort | The All-Season Wear\nDescription: Crafted from ultra-soft, premium organic materials. Designed to keep you looking sharp and feeling comfortable, wherever the day takes you. Shop the drop.`;
    }
    
    // 8. Book / Learn / Course / Education / Study
    if (p.includes('book') || p.includes('learn') || p.includes('course') || p.includes('education') || p.includes('read') || p.includes('study')) {
      return `Headline: Master Any Skill in Weeks, Not Years 🎓\nDescription: Learn directly from world-class industry experts. Interactive courses, real-world projects, and a global community to support your growth. Enroll today.`;
    }

    // 9. Real-estate / House / Home / Living / Apartment
    if (p.includes('house') || p.includes('home') || p.includes('real estate') || p.includes('apartment') || p.includes('property') || p.includes('living')) {
      return `Headline: Find Your Dream Space | Modern Living Reimagined\nDescription: Discover premium properties in high-demand neighborhoods. Sleek architectures, state-of-the-art amenities, and flexible payment plans. Book a private tour.`;
    }

    // 10. Finance / Crypto / Money / Investing / Stock / Wealth
    if (p.includes('finance') || p.includes('crypto') || p.includes('money') || p.includes('investing') || p.includes('stock') || p.includes('wealth')) {
      return `Headline: Grow Your Wealth Safely and Smarter 💰\nDescription: Access professional-grade investment insights, automatic portfolio balancing, and zero-fee trading. Take control of your financial future now.`;
    }

    // 11. Fallback: Parse the user's prompt to inject their keywords dynamically
    const cleanPrompt = prompt.replace(/[^\w\s]/g, '').trim();
    const words = cleanPrompt.split(/\s+/).filter(w => w.length > 2);
    const keywords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const subject = keywords || 'Your Brand';
    
    return `Headline: Elevate ${subject} | Engineered For High Performance\nDescription: Transform how you present "${cleanPrompt.length > 50 ? cleanPrompt.substring(0, 50) + '...' : cleanPrompt}" to the world. Maximize impact, drive conversions, and reach your target audience today.`;
  };

  const handleDemoGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoPrompt.trim() || isGeneratingDemo) return;

    setIsGeneratingDemo(true);
    setDemoResult('');
    
    const chosenResponse = generateDemoMock(demoPrompt);
    let currentText = '';
    let i = 0;

    // Simulate progressive typewriter effect
    const interval = setInterval(() => {
      if (i < chosenResponse.length) {
        currentText += chosenResponse[i];
        setDemoResult(currentText);
        i++;
      } else {
        clearInterval(interval);
        setIsGeneratingDemo(false);
      }
    }, 25);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "How does AetherFlow generate copy and images?",
      a: "AetherFlow uses advanced large language models (like Gemini 1.5 Pro) to analyze your prompts and generate highly optimized marketing copy. Images are built using state-of-the-art diffusion models to translate description tags into stunning graphics."
    },
    {
      q: "Can I connect my own API keys?",
      a: "Yes! If you are a power user and want to use your own Google Gemini or OpenAI API keys to pay direct usage fees, you can input them directly in the account settings page. Your keys are stored securely in local browser storage."
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 14-day money-back guarantee. If you are unsatisfied with the quality of AetherFlow, contact support, and we will issue a full refund, no questions asked."
    },
    {
      q: "How does the social media scheduler work?",
      a: "You can write, generate images, and draft calendar cards in AetherFlow. Once scheduled, our system prepares the queued assets to post directly to your social channels (Twitter/X, LinkedIn, Facebook, Instagram) based on optimal target times."
    }
  ];

  return (
    <div style={containerStyle}>
      {/* Background Blobs */}
      <div className="glow-blob glow-blob-purple" style={{ top: '-10%', left: '10%' }}></div>
      <div className="glow-blob glow-blob-cyan" style={{ top: '30%', right: '5%' }}></div>
      <div className="glow-blob glow-blob-purple" style={{ bottom: '10%', left: '20%' }}></div>

      {/* Navigation */}
      <header className="glass" style={navbarStyle}>
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>
            <Sparkles size={18} color="#8b5cf6" />
          </div>
          <span style={logoTextStyle}>AetherFlow<span style={{ color: 'var(--color-secondary)' }}>.ai</span></span>
        </div>
        <nav style={navLinksStyle}>
          <a href="#features" style={navLinkStyle}>Features</a>
          <a href="#demo" style={navLinkStyle}>Interactive Demo</a>
          <a href="#pricing" style={navLinkStyle}>Pricing</a>
          <a href="#faq" style={navLinkStyle}>FAQ</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {sessionUser ? (
            <button onClick={onEnterApp} className="btn btn-secondary">
              Dashboard
            </button>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-secondary">
              Sign In
            </button>
          )}
          <button onClick={() => setIsCheckoutOpen(true)} className="btn btn-primary">
            Upgrade Pro
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroBadgeStyle}>
          <Zap size={12} color="#06b6d4" />
          <span>V2.0 is Live: AI Engine Upgraded</span>
        </div>
        
        <h1 style={heroTitleStyle}>
          Scale Your Marketing Content <br />
          <span className="text-gradient-rainbow">At The Speed Of Sound</span>
        </h1>
        
        <p style={heroSubStyle}>
          AetherFlow merges copy generation, visual design, and social media scheduling into a unified, high-performance workspace. Stop context switching; start growing.
        </p>

        <div style={heroActionsStyle}>
          <button onClick={onEnterApp} className="btn btn-cyan" style={{ padding: '14px 28px', fontSize: '15px' }}>
            Launch Workspace <ArrowRight size={16} />
          </button>
          <a href="#demo" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
            <Play size={14} style={{ fill: 'currentColor' }} /> See Live Sandbox
          </a>
        </div>

        {/* Hero Product Shot Mockup */}
        <div className="glass animate-fade-in" style={productShotStyle}>
          <div style={browserHeaderStyle}>
            <div style={browserDotsStyle}>
              <div style={{...browserDotStyle, background: '#ff5f56'}}></div>
              <div style={{...browserDotStyle, background: '#ffbd2e'}}></div>
              <div style={{...browserDotStyle, background: '#27c93f'}}></div>
            </div>
            <div style={browserUrlStyle}>aetherflow.ai/workspace</div>
          </div>
          <div style={mockDashboardStyle}>
            <div style={mockSidebarStyle}>
              <div style={mockSidebarItemStyle}></div>
              <div style={{...mockSidebarItemStyle, width: '80%'}}></div>
              <div style={mockSidebarItemStyle}></div>
              <div style={{...mockSidebarItemStyle, width: '60%'}}></div>
            </div>
            <div style={mockMainStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={mockCardStyle}>
                  <div style={{ height: '8px', width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '10px' }}></div>
                  <div style={{ height: '16px', width: '80%', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', borderRadius: '4px' }}></div>
                </div>
                <div style={mockCardStyle}>
                  <div style={{ height: '8px', width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '10px' }}></div>
                  <div style={{ height: '16px', width: '70%', background: 'linear-gradient(90deg, #06b6d4, #6366f1)', borderRadius: '4px' }}></div>
                </div>
                <div style={mockCardStyle}>
                  <div style={{ height: '8px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '10px' }}></div>
                  <div style={{ height: '16px', width: '60%', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div style={{ ...mockCardStyle, height: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '10px', width: '30%', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }}></div>
                    <div style={{ height: '8px', width: '80%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <div style={{ width: '60px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
                  <div style={{ width: '90px', height: '24px', background: 'var(--color-primary)', borderRadius: '6px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={sectionStyle}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={sectionTitleStyle}>Built for Modern Revenue Generation</h2>
          <p style={sectionSubStyle}>Everything you need to turn AI generation into automated campaigns.</p>
        </div>

        <div style={featuresGridStyle}>
          <div className="glass-interactive" style={featureCardStyle}>
            <div style={featureIconContainerStyle('#8b5cf6')}>
              <Sparkles size={20} color="#8b5cf6" />
            </div>
            <h3 style={featureTitleStyle}>AI Copywriter</h3>
            <p style={featureDescStyle}>Get access to 20+ writing templates designed to convert: ads, sales pitches, hooks, and blog titles.</p>
          </div>

          <div className="glass-interactive" style={featureCardStyle}>
            <div style={featureIconContainerStyle('#06b6d4')}>
              <ImageIcon size={20} color="#06b6d4" />
            </div>
            <h3 style={featureTitleStyle}>Visual Image Studio</h3>
            <p style={featureDescStyle}>Describe what you need, set styling chips (synthwave, photorealistic), and generate visual assets immediately.</p>
          </div>

          <div className="glass-interactive" style={featureCardStyle}>
            <div style={featureIconContainerStyle('#6366f1')}>
              <CalendarIcon size={20} color="#6366f1" />
            </div>
            <h3 style={featureTitleStyle}>Integrated Scheduler</h3>
            <p style={featureDescStyle}>Queue and program generated content straight into our interactive calendar interface for cross-channel posting.</p>
          </div>

          <div className="glass-interactive" style={featureCardStyle}>
            <div style={featureIconContainerStyle('#ec4899')}>
              <BarChart3 size={20} color="#ec4899" />
            </div>
            <h3 style={featureTitleStyle}>Analytics Dashboard</h3>
            <p style={featureDescStyle}>Analyze generated lead data, ROI projections, and visual charts directly within the platform dashboard.</p>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo */}
      <section id="demo" style={{...sectionStyle, background: 'rgba(255, 255, 255, 0.01)'}}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={sectionTitleStyle}>Try the Sandbox Demo</h2>
          <p style={sectionSubStyle}>Experience the speed of our marketing copy engine right here.</p>
        </div>

        <div className="glass" style={demoBoxStyle}>
          <form onSubmit={handleDemoGenerate} style={{ flex: 1, minWidth: '280px' }}>
            <div className="form-group">
              <label className="form-label">Tell the AI about your product</label>
              <textarea 
                className="form-input" 
                rows={4}
                style={{ resize: 'none' }}
                value={demoPrompt}
                onChange={(e) => setDemoPrompt(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={isGeneratingDemo}
            >
              {isGeneratingDemo ? (
                <>
                  <div className="loader" style={{ marginRight: '6px' }}></div> Analyzing product parameters...
                </>
              ) : (
                <>
                  Generate Free Sample Copy <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          <div style={demoResultPanelStyle}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Copy Output Preview</span>
              {demoResult && <span style={{ color: 'var(--success)' }}>● Completed</span>}
            </div>
            <div style={demoCodeStyle}>
              {demoResult ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{demoResult}</div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  Your generated copy will display here once you press "Generate Free Sample Copy" on the left...
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" style={sectionStyle}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={sectionTitleStyle}>Simple, Revenue-focused Pricing</h2>
          <p style={sectionSubStyle}>Unlock unlimited generations and connected social channels.</p>

          <div style={toggleContainerStyle}>
            <span style={{ color: billingPeriod === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Monthly</span>
            <button 
              onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              style={toggleButtonStyle}
            >
              <div style={{
                ...toggleKnobStyle,
                transform: billingPeriod === 'yearly' ? 'translateX(24px)' : 'translateX(2px)'
              }}></div>
            </button>
            <span style={{ color: billingPeriod === 'yearly' ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Yearly <span style={saveBadgeStyle}>Save 20%</span>
            </span>
          </div>
        </div>

        <div style={pricingGridStyle}>
          {/* Starter Plan */}
          <div className="glass" style={pricingCardStyle}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Starter</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ideal for content testing</p>
            </div>
            <div style={priceContainerStyle}>
              <span style={priceSymbolStyle}>$</span>
              <span style={priceNumberStyle}>{billingPeriod === 'monthly' ? '19' : '15'}</span>
              <span style={priceDurationStyle}>/month</span>
            </div>
            <ul style={featuresListStyle}>
              <li style={featureItemStyle}>✓ 50 credits monthly</li>
              <li style={featureItemStyle}>✓ Basic copywriting templates</li>
              <li style={featureItemStyle}>✓ SD quality images</li>
              <li style={featureItemStyle}>✓ Connect 1 social channel</li>
              <li style={{...featureItemStyle, textDecoration: 'line-through', opacity: 0.5}}>✗ Advanced campaign calendar</li>
              <li style={{...featureItemStyle, textDecoration: 'line-through', opacity: 0.5}}>✗ Real API keys custom routing</li>
            </ul>
            <button onClick={() => setIsCheckoutOpen(true)} className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
              Choose Starter
            </button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="glass" style={{ ...pricingCardStyle, borderColor: 'var(--color-primary)', boxShadow: '0 10px 30px -10px var(--glow-primary)', position: 'relative' }}>
            <div style={popularBadgeStyle}>Most Popular</div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Pro</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Best for growing agencies</p>
            </div>
            <div style={priceContainerStyle}>
              <span style={priceSymbolStyle}>$</span>
              <span style={priceNumberStyle}>{billingPeriod === 'monthly' ? '49' : '39'}</span>
              <span style={priceDurationStyle}>/month</span>
            </div>
            <ul style={featuresListStyle}>
              <li style={featureItemStyle}>✓ 500 credits monthly</li>
              <li style={featureItemStyle}>✓ Premium templates (20+)</li>
              <li style={featureItemStyle}>✓ Ultra-HD visual generations</li>
              <li style={featureItemStyle}>✓ Connect unlimited social networks</li>
              <li style={featureItemStyle}>✓ Advanced planner and campaigns</li>
              <li style={featureItemStyle}>✓ Developer mode (Own API Keys)</li>
            </ul>
            <button onClick={() => setIsCheckoutOpen(true)} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
              Unlock Pro Plan
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={sectionStyle}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={sectionTitleStyle}>Frequently Asked Questions</h2>
          <p style={sectionSubStyle}>Got questions about integrations or credit limits? We have answers.</p>
        </div>

        <div style={faqContainerStyle}>
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className="glass"
              style={{
                ...faqItemStyle,
                borderColor: activeFaq === index ? 'var(--color-primary)' : 'var(--border-color)'
              }}
              onClick={() => toggleFaq(index)}
            >
              <div style={faqHeaderStyle}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform var(--transition-fast)'
                  }} 
                />
              </div>
              {activeFaq === index && (
                <div style={faqAnswerStyle}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerMainStyle}>
          <div>
            <div style={{...logoContainerStyle, marginBottom: '12px'}}>
              <Sparkles size={16} color="#8b5cf6" />
              <span style={{ fontSize: '18px', fontWeight: 700 }}>AetherFlow</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px' }}>
              Automated campaign intelligence suite for rapid startup growth and product monetization.
            </p>
          </div>
          <div style={footerLinksContainerStyle}>
            <div style={footerColumnStyle}>
              <h4 style={footerColTitleStyle}>Product</h4>
              <a href="#features" style={footerLinkStyle}>Features</a>
              <a href="#demo" style={footerLinkStyle}>Sandbox</a>
              <a href="#pricing" style={footerLinkStyle}>Pricing</a>
            </div>
            <div style={footerColumnStyle}>
              <h4 style={footerColTitleStyle}>Security</h4>
              <a href="#" style={footerLinkStyle}>Privacy Policy</a>
              <a href="#" style={footerLinkStyle}>Stripe Safe Guard</a>
              <a href="#" style={footerLinkStyle}>AWS Server Status</a>
            </div>
          </div>
        </div>
        <div style={footerBottomStyle}>
          <span>© {new Date().getFullYear()} AetherFlow.ai. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={12} /> SSL Secured Encryption
          </span>
        </div>
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-dark)',
  color: 'var(--text-primary)',
  position: 'relative',
  paddingTop: '80px'
};

const navbarStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'calc(100% - 40px)',
  maxWidth: '1200px',
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  zIndex: 100,
  borderRadius: '20px',
  background: 'rgba(5, 5, 8, 0.7)'
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer'
};

const logoIconStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(139, 92, 246, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  fontFamily: 'Outfit, sans-serif'
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  alignItems: 'center'
};

const navLinkStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'color var(--transition-fast)'
};

const heroSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '80px 20px 40px',
  position: 'relative'
};

const heroBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '30px',
  background: 'rgba(6, 182, 212, 0.08)',
  border: '1px solid rgba(6, 182, 212, 0.2)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--color-secondary)',
  marginBottom: '24px',
  letterSpacing: '0.02em'
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: '56px',
  lineHeight: '1.15',
  fontWeight: 800,
  marginBottom: '20px',
  letterSpacing: '-0.03em'
};

const heroSubStyle: React.CSSProperties = {
  fontSize: '18px',
  color: 'var(--text-secondary)',
  maxWidth: '640px',
  lineHeight: '1.6',
  marginBottom: '40px'
};

const heroActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginBottom: '60px'
};

const productShotStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '900px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
  boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px -10px var(--glow-primary)',
  background: 'rgba(5, 5, 8, 0.8)'
};

const browserHeaderStyle: React.CSSProperties = {
  height: '40px',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  position: 'relative'
};

const browserDotsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px'
};

const browserDotStyle: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '50%'
};

const browserUrlStyle: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255,255,255,0.05)',
  padding: '2px 30px',
  borderRadius: '4px',
  fontSize: '11px',
  color: 'var(--text-muted)'
};

const mockDashboardStyle: React.CSSProperties = {
  display: 'flex',
  height: '350px',
  textAlign: 'left'
};

const mockSidebarStyle: React.CSSProperties = {
  width: '160px',
  borderRight: '1px solid var(--border-color)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  background: 'rgba(255,255,255,0.01)'
};

const mockSidebarItemStyle: React.CSSProperties = {
  height: '10px',
  borderRadius: '5px',
  background: 'rgba(255,255,255,0.05)',
  width: '100%'
};

const mockMainStyle: React.CSSProperties = {
  flex: 1,
  padding: '25px',
  background: 'rgba(0,0,0,0.2)'
};

const mockCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '10px',
  padding: '15px'
};

const sectionStyle: React.CSSProperties = {
  padding: '100px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 10
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 700,
  marginBottom: '12px',
  textAlign: 'center'
};

const sectionSubStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--text-secondary)',
  maxWidth: '480px',
  margin: '0 auto',
  textAlign: 'center'
};

const featuresGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '24px',
  marginTop: '40px'
};

const featureCardStyle: React.CSSProperties = {
  padding: '30px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '16px'
};

const featureIconContainerStyle = (color: string): React.CSSProperties => ({
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  background: `rgba(${color === '#8b5cf6' ? '139,92,246' : color === '#06b6d4' ? '6,182,212' : color === '#6366f1' ? '99,102,241' : '236,72,153'}, 0.1)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px'
});

const featureTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '10px'
};

const featureDescStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6'
};

const demoBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '30px',
  padding: '30px',
  marginTop: '30px',
  borderRadius: '20px'
};

const demoResultPanelStyle: React.CSSProperties = {
  flex: 1.2,
  minWidth: '280px',
  display: 'flex',
  flexDirection: 'column'
};

const demoCodeStyle: React.CSSProperties = {
  flex: 1,
  background: '#0d0d12',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  padding: '20px',
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#cbd5e1',
  minHeight: '160px',
  fontFamily: 'monospace'
};

const toggleContainerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '24px',
  fontSize: '14px',
  fontWeight: 500
};

const toggleButtonStyle: React.CSSProperties = {
  width: '48px',
  height: '24px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid var(--border-color)',
  position: 'relative',
  cursor: 'pointer',
  outline: 'none',
  padding: 0
};

const toggleKnobStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  background: 'var(--color-primary)',
  boxShadow: '0 0 8px var(--glow-primary)',
  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
};

const saveBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  background: 'rgba(16, 185, 129, 0.1)',
  color: 'var(--success)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  padding: '2px 8px',
  borderRadius: '10px',
  fontWeight: 600
};

const pricingGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '30px',
  maxWidth: '750px',
  margin: '40px auto 0'
};

const pricingCardStyle: React.CSSProperties = {
  padding: '40px 30px',
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: '460px'
};

const popularBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-pink))',
  color: '#ffffff',
  padding: '4px 14px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase'
};

const priceContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  marginBottom: '24px'
};

const priceSymbolStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 600,
  color: 'var(--text-secondary)'
};

const priceNumberStyle: React.CSSProperties = {
  fontSize: '44px',
  fontWeight: 800,
  lineHeight: '1',
  fontFamily: 'Outfit, sans-serif'
};

const priceDurationStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  marginLeft: '4px'
};

const featuresListStyle: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
  marginBottom: '30px'
};

const featureItemStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const faqContainerStyle: React.CSSProperties = {
  maxWidth: '720px',
  margin: '40px auto 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const faqItemStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease'
};

const faqHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const faqAnswerStyle: React.CSSProperties = {
  marginTop: '12px',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  paddingTop: '12px',
  animation: 'fadeIn 0.3s ease-out forwards'
};

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border-color)',
  background: '#040406',
  padding: '60px 40px 30px',
  position: 'relative',
  zIndex: 10
};

const footerMainStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto 40px',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '40px'
};

const footerLinksContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '60px',
  flexWrap: 'wrap'
};

const footerColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const footerColTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px'
};

const footerLinkStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  transition: 'color var(--transition-fast)'
};

const footerBottomStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  paddingTop: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '11px',
  color: 'var(--text-muted)'
};
