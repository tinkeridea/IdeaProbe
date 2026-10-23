import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import IdeaForm from './components/validation/IdeaForm';
import LoadingAnalysis from './components/validation/LoadingAnalysis';
import ResultsDashboard from './components/validation/ResultsDashboard';
import FloatingIdeaIllustration from './components/landing/FloatingIdeaIllustration';
import { api } from './services/api';
import { env } from './config/env';
import { generateDemoValidation } from './services/demoResults';
import './App.css';

export function App() {
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'form' | 'loading' | 'results'
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [results, setResults] = useState(null);
  const [probeResult, setProbeResult] = useState(null);
  const [isProbing, setIsProbing] = useState(false);

  // Navigate between views and scroll to top smoothly
  const handleNavigate = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Idea Submission with real API call or transparent demo fallback
  const handleIdeaSubmit = async (formData) => {
    setCurrentSubmission(formData);
    setActiveView('loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const startTime = Date.now();

    try {
      const apiResponse = await api.validateStartupIdea(formData);

      // Enforce a minimum display time for smooth UX of the loading state
      const elapsed = Date.now() - startTime;
      const minDelay = 1400;
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
      }

      if (apiResponse && apiResponse.success && apiResponse.data) {
        setResults({
          ...apiResponse.data,
          isDemo: false,
        });
      } else {
        const demoData = generateDemoValidation(formData);
        setResults(demoData);
      }
    } catch {
      const demoData = generateDemoValidation(formData);
      setResults(demoData);
    } finally {
      setActiveView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Test backend connection directly from landing
  const handleTestBackendConnection = async () => {
    setIsProbing(true);
    setProbeResult(null);
    try {
      const response = await api.checkHealth();
      setProbeResult(response);
    } catch (err) {
      setProbeResult({
        success: false,
        message: err.message || 'Connection error',
      });
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        hasResults={Boolean(results)}
      />

      <main className="main-content">
        <div key={activeView} className="view-transition-wrapper">
          {/* VIEW 1: LANDING PAGE (Wix wh-1092 Style Layout) */}
          {activeView === 'landing' && (
          <>
            {/* Hero Section with Mesh Gradient & Layered UI Mockup */}
            <section className="hero-section">
              <div className="container hero-section__container">
                <div className="hero-pill-badge">
                  <span className="hero-pill-dot" />
                  <span>AI STARTUP VALIDATION PLATFORM • FOR INDIAN FOUNDERS</span>
                </div>

                <h1 className="hero-section__title">
                  Validate, de-risk and scale <br />
                  <span className="hero-gradient-text">your startup idea with precision.</span>
                </h1>

                <p className="hero-section__subtitle">
                  Over 90% of Indian startups fail because they build something the market does not need.
                  Zenith India evaluates market viability, competitor defensibility, customer personas, 
                  and lean MVP experiments before you invest capital.
                </p>

                <div className="hero-cta-wrap">
                  <button
                    type="button"
                    className="btn-pill-primary"
                    onClick={() => handleNavigate('form')}
                  >
                    Validate My Idea Now →
                  </button>
                  <a href="#how-it-works" className="btn-pill-secondary">
                    How Validation Works
                  </a>
                </div>

                {/* 3D-Inspired Floating Startup Idea Illustration with Mouse Tilt */}
                <FloatingIdeaIllustration />

                {/* Layered Dashboard UI Mockup (Inspired by Wix Ad Tech template preview) */}
                <div className="hero-mockup-frame">
                  <div className="mockup-window-bar">
                    <div className="mockup-window-dots">
                      <span className="mockup-dot mockup-dot--red" />
                      <span className="mockup-dot mockup-dot--yellow" />
                      <span className="mockup-dot mockup-dot--green" />
                    </div>
                    <div className="mockup-window-search">
                      <span>zenith.india/validation-suite</span>
                    </div>
                    <div className="mockup-window-status">
                      <span className="mockup-status-indicator" />
                      <span>Validation Engine Active</span>
                    </div>
                  </div>

                  <div className="mockup-content-grid">
                    {/* Left Metric Widget */}
                    <div className="mockup-card mockup-card--left">
                      <div className="mockup-card__header">
                        <span className="mockup-card__tag">Viability Index</span>
                        <span className="mockup-card__score">84/100</span>
                      </div>
                      <h4 className="mockup-card__title">Market Opportunity Fit</h4>
                      <p className="mockup-card__desc">
                        High pain-point resonance detected in Tier-2/3 Indian retail kirana digitization.
                      </p>
                      <div className="mockup-meter">
                        <div className="mockup-meter__fill" style={{ width: '84%' }} />
                      </div>
                    </div>

                    {/* Center Moat Widget */}
                    <div className="mockup-card mockup-card--center">
                      <div className="mockup-card__header">
                        <span className="mockup-card__tag">Moat Analysis</span>
                        <span className="mockup-badge--violet">Defensible</span>
                      </div>
                      <h4 className="mockup-card__title">Competitive Landscape</h4>
                      <div className="mockup-chips">
                        <span className="mockup-chip">Direct: 2 Category Players</span>
                        <span className="mockup-chip mockup-chip--peach">Legacy Habit: WhatsApp / Pen-Paper</span>
                        <span className="mockup-chip mockup-chip--sky">Moat: Localized Logistics Data</span>
                      </div>
                    </div>

                    {/* Right Experiments Widget */}
                    <div className="mockup-card mockup-card--right">
                      <div className="mockup-card__header">
                        <span className="mockup-card__tag">Action Plan</span>
                        <span className="mockup-badge--green">3 MVP Tests</span>
                      </div>
                      <h4 className="mockup-card__title">Lean Validation Roadmap</h4>
                      <ul className="mockup-list">
                        <li><span>1.</span> 5-Day Landing Page Smoke Test</li>
                        <li><span>2.</span> 15 Founder Customer Discovery Interviews</li>
                        <li><span>3.</span> Concierge Pilot with 3 Store Owners</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Impact & Metric Stat Bar */}
            <section className="stats-bar-section">
              <div className="container stats-bar__container">
                <div className="stat-box">
                  <div className="stat-box__value">90%</div>
                  <div className="stat-box__label">Startup Failures Caused By Zero Market Demand</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-box">
                  <div className="stat-box__value">5 Vectors</div>
                  <div className="stat-box__label">Analyzed: Market, Moat, Risks, Personas & Tests</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-box">
                  <div className="stat-box__value">&lt; 2 Mins</div>
                  <div className="stat-box__label">Time to Generate Actionable Validation Thesis</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-box">
                  <div className="stat-box__value">100%</div>
                  <div className="stat-box__label">Confidential & Safe from Key Exposure</div>
                </div>
              </div>
            </section>

            {/* Bento-Box Features Section */}
            <section id="framework" className="section-bento">
              <div className="container">
                <div className="section-header">
                  <span className="section-header__tag">Comprehensive Framework</span>
                  <h2 className="section-header__title">Structured Intelligence For Every Vector</h2>
                  <p className="section-header__subtitle">
                    Move from intuitive guesswork to data-backed validation. Zenith India covers the five critical pillars of venture viability.
                  </p>
                </div>

                <div className="bento-grid">
                  {/* Bento 1: Market Opportunity (Span 2) */}
                  <div className="bento-card bento-card--large">
                    <div className="bento-card__badge">01 • Market Viability</div>
                    <h3 className="bento-card__title">TAM, SAM & Geographic Opportunity</h3>
                    <p className="bento-card__desc">
                      Evaluate whether your market is large enough to sustain venture returns. From Pan-India scale to hyper-localized Tier-2/3 focus, measure pain-point urgency and willingness to pay.
                    </p>
                    <div className="bento-visual bento-visual--market">
                      <div className="bento-chip-row">
                        <span className="bento-tag bento-tag--violet">High Pain Resonance</span>
                        <span className="bento-tag bento-tag--peach">Tier-2/3 Localization</span>
                        <span className="bento-tag bento-tag--sky">Recurring Revenue Potential</span>
                      </div>
                    </div>
                  </div>

                  {/* Bento 2: Competitors & Moats */}
                  <div className="bento-card">
                    <div className="bento-card__badge">02 • Defensibility</div>
                    <h3 className="bento-card__title">Competitor & Moat Mapping</h3>
                    <p className="bento-card__desc">
                      Identify direct contenders and the hardest competitor of all: customer inertia and legacy manual processes.
                    </p>
                    <div className="bento-visual">
                      <div className="bento-moat-pill">
                        <strong>Primary Alternative:</strong> Manual Excel & Offline Habits
                      </div>
                    </div>
                  </div>

                  {/* Bento 3: Risks & Unit Economics */}
                  <div className="bento-card">
                    <div className="bento-card__badge">03 • Risk Assessment</div>
                    <h3 className="bento-card__title">Vulnerability & CAC Diagnosis</h3>
                    <p className="bento-card__desc">
                      Surface hidden unit economic traps, distribution hurdles, and customer acquisition cost (CAC) inflation before you burn capital.
                    </p>
                    <div className="bento-visual">
                      <div className="bento-risk-alert">
                        <span className="bento-risk-dot" />
                        <span>Early Mitigation: Prioritize Founder-led Sales</span>
                      </div>
                    </div>
                  </div>

                  {/* Bento 4: Personas & Lean Experiments (Span 2) */}
                  <div className="bento-card bento-card--large">
                    <div className="bento-card__badge">04 & 05 • Execution</div>
                    <h3 className="bento-card__title">Customer Personas & 3 MVP Validation Tests</h3>
                    <p className="bento-card__desc">
                      Map the archetype buyer persona with core friction points. Then execute a step-by-step lean roadmap: landing page smoke test, 15 user interviews, and concierge pilots.
                    </p>
                    <div className="bento-visual bento-visual--tests">
                      <div className="bento-step-pill">Test 1: Smoke Test</div>
                      <div className="bento-step-arrow">→</div>
                      <div className="bento-step-pill">Test 2: 15 Interviews</div>
                      <div className="bento-step-arrow">→</div>
                      <div className="bento-step-pill bento-step-pill--highlight">Test 3: Concierge Pilot</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works 3-Step Section */}
            <section id="how-it-works" className="section-process">
              <div className="container">
                <div className="section-header">
                  <span className="section-header__tag">The 3-Step Process</span>
                  <h2 className="section-header__title">How Zenith India Works</h2>
                  <p className="section-header__subtitle">
                    Simple, transparent validation designed for founders who value their time.
                  </p>
                </div>

                <div className="process-grid">
                  <div className="process-card">
                    <div className="process-card__number">01</div>
                    <h3 className="process-card__title">Submit Idea Hypotheses</h3>
                    <p className="process-card__text">
                      Provide your startup name, core problem statement, target customer archetype, and target market geography.
                    </p>
                  </div>

                  <div className="process-card">
                    <div className="process-card__number">02</div>
                    <h3 className="process-card__title">Multi-Vector Analysis</h3>
                    <p className="process-card__text">
                      The pipeline evaluates market opportunity, competitor alternatives, risk vulnerabilities, and persona willingness to pay.
                    </p>
                  </div>

                  <div className="process-card">
                    <div className="process-card__number">03</div>
                    <h3 className="process-card__title">Deploy Lean Experiments</h3>
                    <p className="process-card__text">
                      Receive an actionable dashboard with low-cost validation experiments you can run immediately to confirm customer demand.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Backend Integration & Diagnostic Section (Preserved) */}
            <section className="section-lavender">
              <div className="container">
                <div className="lavender-panel">
                  <div className="lavender-panel__content">
                    <div className="lavender-panel__tag">
                      <span className="lavender-panel__dot" />
                      <span>Security & Backend Integration</span>
                    </div>

                    <h2 className="lavender-panel__title">
                      Zero Exposed Keys. Safe Architecture.
                    </h2>

                    <p className="lavender-panel__description">
                      Zenith India connects securely via <code>src/services/api.js</code>. 
                      If your backend server is offline, the platform seamlessly displays an architectural sample framework without hallucinating fake market data.
                    </p>

                    <div className="probe-box">
                      <div className="probe-box__header">
                        <span className="probe-box__label">Target Backend URL:</span>
                        <code className="probe-box__url">{env.apiBaseUrl}</code>
                      </div>

                      <div className="probe-box__action">
                        <button
                          type="button"
                          className="btn-pill-primary btn-pill-sm"
                          onClick={handleTestBackendConnection}
                          disabled={isProbing}
                        >
                          {isProbing ? 'Probing...' : 'Probe Backend Health'}
                        </button>
                        <span className="probe-box__note">
                          Tests live endpoint without mock data
                        </span>
                      </div>

                      {probeResult && (
                        <div className={`probe-box__result ${probeResult.isNetworkError ? 'probe-box__result--expected' : 'probe-box__result--connected'}`}>
                          <div className="probe-box__result-header">
                            <strong>Status:</strong> {probeResult.isNetworkError ? 'Backend Offline (Demo Fallback Active)' : 'Backend Connected!'}
                          </div>
                          <p className="probe-box__result-detail">
                            {probeResult.isNetworkError
                              ? 'Form submissions will display a clearly marked structured sample framework until your AI server is launched.'
                              : JSON.stringify(probeResult)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lavender-panel__card">
                    <h4 className="lavender-panel__card-title">Live Architecture Stack</h4>
                    <ul className="mvp-module-list">
                      <li>
                        <span className="check-icon">✓</span>
                        <span><strong>React 19 + Vite 8:</strong> Fast sub-second client environment</span>
                      </li>
                      <li>
                        <span className="check-icon">✓</span>
                        <span><strong>Modular API Service:</strong> Zero secret leakage via frontend</span>
                      </li>
                      <li>
                        <span className="check-icon">✓</span>
                        <span><strong>Bento Design System:</strong> Warm ivory, violet accents, peach highlights</span>
                      </li>
                      <li>
                        <span className="check-icon">✓</span>
                        <span><strong>Transparent Fallback:</strong> Clear labeling when backend is offline</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA Banner (Wix wh-1092 Style) */}
            <section className="section-cta-banner">
              <div className="container">
                <div className="final-cta-card">
                  <div className="final-cta-card__badge">Start Validating Now</div>
                  <h2 className="final-cta-card__title">
                    Put Zenith India to work. <br />
                    Test your startup hypothesis before you build.
                  </h2>
                  <p className="final-cta-card__subtitle">
                    Takes under 2 minutes. Free and confidential for early-stage entrepreneurs.
                  </p>
                  <button
                    type="button"
                    className="btn-pill-primary btn-pill-lg"
                    onClick={() => handleNavigate('form')}
                  >
                    Validate My Idea Now →
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* VIEW 2: IDEA SUBMISSION FORM */}
        {activeView === 'form' && (
          <IdeaForm
            onSubmit={handleIdeaSubmit}
            onCancel={() => handleNavigate('landing')}
          />
        )}

        {/* VIEW 3: LOADING STATE */}
        {activeView === 'loading' && (
          <LoadingAnalysis
            startupName={currentSubmission?.startupName}
          />
        )}

        {/* VIEW 4: RESULTS DASHBOARD */}
          {activeView === 'results' && (
            <ResultsDashboard
              results={results}
              onReset={() => handleNavigate('form')}
              onGoHome={() => handleNavigate('landing')}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
