import React from 'react';
import { use3DTilt } from '../../utils/use3DTilt';
import './FloatingIdeaIllustration.css';

export function FloatingIdeaIllustration() {
  const { tiltProps, isHovered } = use3DTilt({
    maxTilt: 6.5,
    scale: 1.012,
    perspective: 1100,
    speed: 350,
  });

  return (
    <div className="hero-illustration-viewport" aria-label="Interactive 3D Startup Idea Validation Diagram">
      <div className={`hero-3d-stage ${isHovered ? 'hero-3d-stage--hovered' : ''}`} {...tiltProps}>
        {/* Ambient Glow Backdrops */}
        <div className="stage-ambient-glow stage-ambient-glow--violet" />
        <div className="stage-ambient-glow stage-ambient-glow--peach" />

        {/* SVG Dynamic Energy Connectors */}
        <svg
          className="stage-connectors-svg"
          viewBox="0 0 800 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="beamGradientViolet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="beamGradientPeach" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FED7AA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>

          {/* Connectors from Center (400, 240) to each satellite */}
          {/* Path 1: Center to Market Node (Top Left: 190, 110) */}
          <path
            d="M 400 240 C 330 240, 260 170, 190 110"
            className="connector-line connector-line--base"
          />
          <path
            d="M 400 240 C 330 240, 260 170, 190 110"
            className="connector-line connector-line--pulse"
          />

          {/* Path 2: Center to Customer Node (Top Right: 610, 110) */}
          <path
            d="M 400 240 C 470 240, 540 170, 610 110"
            className="connector-line connector-line--base"
          />
          <path
            d="M 400 240 C 470 240, 540 170, 610 110"
            className="connector-line connector-line--pulse"
          />

          {/* Path 3: Center to Competitor Node (Bottom Left: 190, 370) */}
          <path
            d="M 400 240 C 330 240, 260 310, 190 370"
            className="connector-line connector-line--base"
          />
          <path
            d="M 400 240 C 330 240, 260 310, 190 370"
            className="connector-line connector-line--pulse"
          />

          {/* Path 4: Center to Growth Chart Node (Bottom Right: 610, 370) */}
          <path
            d="M 400 240 C 470 240, 540 310, 610 370"
            className="connector-line connector-line--base"
          />
          <path
            d="M 400 240 C 470 240, 540 310, 610 370"
            className="connector-line connector-line--pulse"
          />

          {/* Center Orbital Rings */}
          <circle cx="400" cy="240" r="64" className="orbit-ring orbit-ring--inner" />
          <circle cx="400" cy="240" r="102" className="orbit-ring orbit-ring--outer" />
        </svg>

        {/* =========================================
            CENTRAL 3D NUCLEUS (Startup Idea Core)
            ========================================= */}
        <div className="node-center-wrap">
          <div className="node-center-core">
            <div className="core-3d-prism">
              <div className="core-prism-ring" />
              <div className="core-prism-ring core-prism-ring--reverse" />
              <div className="core-icon-gem">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>
            </div>
            <div className="core-label-box">
              <span className="core-pill-tag">Hypothesis Hub</span>
              <strong className="core-title">Startup Idea Core</strong>
              <span className="core-status">
                <span className="core-dot-live" /> Live Evaluation
              </span>
            </div>
          </div>
        </div>

        {/* =========================================
            SATELLITE 1: MARKET OPPORTUNITY (Top Left)
            ========================================= */}
        <div className="satellite-card satellite-card--market">
          <div className="satellite-inner">
            <div className="satellite-badge-row">
              <div className="satellite-icon-wrap satellite-icon-wrap--violet">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span className="satellite-tag satellite-tag--violet">Market Signal</span>
              <span className="satellite-mini-score">86% Fit</span>
            </div>
            <h4 className="satellite-title">Pan-India Market TAM</h4>
            <p className="satellite-detail">₹1.8T Opportunity • Tier-2/3 Retail Surge</p>
            <div className="satellite-metric-bar">
              <div className="satellite-metric-fill" style={{ width: '86%' }} />
            </div>
          </div>
        </div>

        {/* =========================================
            SATELLITE 2: CUSTOMER PERSONAS (Top Right)
            ========================================= */}
        <div className="satellite-card satellite-card--customer">
          <div className="satellite-inner">
            <div className="satellite-badge-row">
              <div className="satellite-icon-wrap satellite-icon-wrap--peach">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="satellite-tag satellite-tag--peach">Persona Fit</span>
              <span className="satellite-mini-pill">High WTP</span>
            </div>
            <h4 className="satellite-title">Kirana Owner Archetype</h4>
            <p className="satellite-detail">Critical daily inventory leakage pain point</p>
            <div className="satellite-avatar-group">
              <span className="avatar-dot avatar-dot--1">KO</span>
              <span className="avatar-dot avatar-dot--2">SME</span>
              <span className="avatar-count">15 Validated Interviews</span>
            </div>
          </div>
        </div>

        {/* =========================================
            SATELLITE 3: COMPETITORS & MOAT (Bottom Left)
            ========================================= */}
        <div className="satellite-card satellite-card--competitor">
          <div className="satellite-inner">
            <div className="satellite-badge-row">
              <div className="satellite-icon-wrap satellite-icon-wrap--sky">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="satellite-tag satellite-tag--sky">Moat Index</span>
              <span className="satellite-mini-pill satellite-mini-pill--green">Defensible</span>
            </div>
            <h4 className="satellite-title">Competitive Defensibility</h4>
            <p className="satellite-detail">Main Rival: Inertia & Offline Pen/Paper Habits</p>
            <div className="satellite-radar-track">
              <span className="radar-ping" />
              <span className="radar-label">Local Logistics Data Moat</span>
            </div>
          </div>
        </div>

        {/* =========================================
            SATELLITE 4: GROWTH CHART & EXPERIMENTS (Bottom Right)
            ========================================= */}
        <div className="satellite-card satellite-card--growth">
          <div className="satellite-inner">
            <div className="satellite-badge-row">
              <div className="satellite-icon-wrap satellite-icon-wrap--lavender">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <span className="satellite-tag satellite-tag--lavender">Growth Vector</span>
              <span className="satellite-growth-pct">+38% MoM</span>
            </div>
            <h4 className="satellite-title">3 Lean MVP Experiments</h4>
            <p className="satellite-detail">Smoke Page → Discovery → Concierge Pilot</p>
            {/* 3D Mini Bar Chart Visual */}
            <div className="satellite-mini-chart">
              <div className="chart-bar-col">
                <div className="chart-bar chart-bar--1" />
                <span className="chart-bar-lbl">T1</span>
              </div>
              <div className="chart-bar-col">
                <div className="chart-bar chart-bar--2" />
                <span className="chart-bar-lbl">T2</span>
              </div>
              <div className="chart-bar-col">
                <div className="chart-bar chart-bar--3" />
                <span className="chart-bar-lbl">T3</span>
              </div>
              <div className="chart-trajectory">
                <svg width="100%" height="24" viewBox="0 0 100 24" fill="none">
                  <path d="M 10 18 Q 50 12, 90 4" stroke="#7C3AED" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="90" cy="4" r="3" fill="#EA580C" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingIdeaIllustration;
