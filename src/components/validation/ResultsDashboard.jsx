import React, { useState, useEffect } from 'react';
import StatusBadge from '../common/StatusBadge';
import CustomerPersonaSimulator from './CustomerPersonaSimulator';
import './ResultsDashboard.css';

export function ResultsDashboard({ results, onReset, onGoHome }) {
  const targetScore = results?.startupOverview?.readinessScore || 75;
  const [animatedScore, setAnimatedScore] = useState(0);

  // Smooth animated count-up for the viability score
  useEffect(() => {
    if (!results) return;
    let startTime;
    let animationFrame;
    const duration = 1100; // ms

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeProgress * targetScore));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetScore, results]);

  if (!results) return null;

  const {
    isDemo,
    disclaimer,
    timestamp,
    startupOverview,
    marketOpportunity,
    competitors,
    risks,
    customerPersonas,
    suggestedExperiments,
  } = results;

  // SVG circular ring metrics
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  return (
    <section className="results-section">
      <div className="container results__container">
        {/* Backend Status Notice */}
        {isDemo && (
          <div className="demo-notice-banner stagger-entrance stagger-entrance--0" role="alert">
            <div className="demo-notice-banner__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="demo-notice-banner__content">
              <strong>DEMO MODE: Backend Offline</strong>
              <p>{disclaimer}</p>
            </div>
            <div className="demo-notice-banner__badge">
              <StatusBadge type="peach">Sample Framework</StatusBadge>
            </div>
          </div>
        )}

        {/* Header Block */}
        <div className="results-header stagger-entrance stagger-entrance--1">
          <div className="results-header__top">
            <div className="results-header__tags">
              <StatusBadge type="violet">{startupOverview?.market || 'Target Market'}</StatusBadge>
              <StatusBadge type="ready">Analysis Generated</StatusBadge>
            </div>
            <span className="results-header__timestamp">{timestamp}</span>
          </div>

          <div className="results-header__main">
            <div className="results-header__info">
              <h1 className="results-header__title">{startupOverview?.name || 'Startup Report'}</h1>
              <p className="results-header__desc">{startupOverview?.description}</p>
              <div className="results-header__meta">
                <span><strong>Target Customers:</strong> {startupOverview?.customers}</span>
                <span><strong>Geography:</strong> {startupOverview?.market}</span>
              </div>
            </div>

            {/* 3D-Styled Score Card with Circular SVG Progress Ring */}
            <div className="results-score-card">
              <span className="results-score-card__label">Viability Readiness</span>

              <div className="score-ring-wrap">
                <svg className="score-ring-svg" width="96" height="96" viewBox="0 0 96 96">
                  {/* Background Track */}
                  <circle
                    className="score-ring-track"
                    cx="48"
                    cy="48"
                    r={radius}
                    strokeWidth="6"
                  />
                  {/* Animated Progress Ring */}
                  <circle
                    className="score-ring-progress"
                    cx="48"
                    cy="48"
                    r={radius}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="score-ring-center">
                  <span className="score-number">{animatedScore}</span>
                  <span className="score-max">/100</span>
                </div>
              </div>

              <span className="results-score-card__status">
                {animatedScore >= 75 ? 'Solid Foundation' : 'Requires Iteration'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation / Actions Bar */}
        <div className="results-actions-bar stagger-entrance stagger-entrance--2">
          <div className="results-actions-bar__left">
            <button type="button" className="btn-pill-secondary" onClick={onGoHome}>
              ← Back to Overview
            </button>
          </div>
          <div className="results-actions-bar__right">
            <button type="button" className="btn-pill-primary" onClick={onReset}>
              Validate Another Idea →
            </button>
          </div>
        </div>

        {/* Dashboard Modules with Staggered Entrance & 3D Lift/Tilt */}
        <div className="results-grid">
          {/* Module 1: Market Opportunity */}
          <div className="result-card stagger-entrance stagger-entrance--3">
            <div className="result-card__header">
              <div className="result-card__icon result-card__icon--violet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div>
                <h3 className="result-card__title">1. Market Opportunity</h3>
                <span className="result-card__subtitle">{marketOpportunity?.category}</span>
              </div>
            </div>
            <p className="result-card__summary">{marketOpportunity?.summary}</p>
            <div className="indicator-list">
              {marketOpportunity?.indicators?.map((item, idx) => {
                const barWidth =
                  item.status === 'positive' ? '88%' : item.status === 'neutral' ? '68%' : '48%';
                return (
                  <div key={idx} className="indicator-item">
                    <div className="indicator-item__top">
                      <span className="indicator-item__label">{item.label}</span>
                      <span className={`indicator-item__badge indicator-item__badge--${item.status}`}>
                        {item.value}
                      </span>
                    </div>
                    {/* Visual Meter Reveal */}
                    <div className="indicator-meter-bar">
                      <div
                        className={`indicator-meter-fill indicator-meter-fill--${item.status}`}
                        style={{ width: barWidth }}
                      />
                    </div>
                    <p className="indicator-item__detail">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module 2: Competitors & Moats */}
          <div className="result-card stagger-entrance stagger-entrance--4">
            <div className="result-card__header">
              <div className="result-card__icon result-card__icon--peach">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
              </div>
              <div>
                <h3 className="result-card__title">2. Competitors & Moat</h3>
                <span className="result-card__subtitle">{competitors?.category}</span>
              </div>
            </div>
            <p className="result-card__summary">{competitors?.summary}</p>
            <div className="competitor-list">
              {competitors?.landscape?.map((comp, idx) => (
                <div key={idx} className="competitor-row">
                  <div className="competitor-row__header">
                    <span className="competitor-row__name">{comp.name}</span>
                    <span className="competitor-row__type">{comp.type}</span>
                  </div>
                  <p className="competitor-row__notes">{comp.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Module 3: Key Risks & Mitigations */}
          <div className="result-card result-card--full stagger-entrance stagger-entrance--5">
            <div className="result-card__header">
              <div className="result-card__icon result-card__icon--red">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="result-card__title">3. Critical Risks & Strategic Mitigations</h3>
                <span className="result-card__subtitle">{risks?.category}</span>
              </div>
            </div>
            <div className="risks-grid">
              {risks?.items?.map((item, idx) => (
                <div key={idx} className="risk-card">
                  <div className="risk-card__badge-row">
                    <span className="risk-card__title">{item.risk}</span>
                    <span className={`risk-pill risk-pill--${item.level.toLowerCase()}`}>
                      {item.level} Severity
                    </span>
                  </div>
                  <p className="risk-card__explanation">{item.explanation}</p>
                  <div className="risk-card__mitigation">
                    <span className="risk-card__mitigation-label">Mitigation:</span>
                    <span>{item.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module 4: Interactive Customer Persona Simulator */}
          <div className="result-card result-card--full stagger-entrance stagger-entrance--6">
            <div className="result-card__header">
              <div className="result-card__icon result-card__icon--lavender">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="result-card__header-info">
                <div className="result-card__title-row">
                  <h3 className="result-card__title">4. Interactive AI Customer Persona Simulator</h3>
                  <span className="result-card__tag-live">Interactive Simulation</span>
                </div>
                <span className="result-card__subtitle">{customerPersonas?.category || 'Customer Archetypes & Discovery'}</span>
              </div>
            </div>
            <p className="result-card__summary">
              {customerPersonas?.summary} Test customer objections, daily pain points, and pricing tolerance through realistic persona discovery dialogues.
            </p>

            <CustomerPersonaSimulator
              customerPersonas={customerPersonas}
              startupOverview={startupOverview}
            />
          </div>

          {/* Module 5: Suggested Lean Experiments */}
          <div className="result-card result-card--full stagger-entrance stagger-entrance--7">
            <div className="result-card__header">
              <div className="result-card__icon result-card__icon--violet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div>
                <h3 className="result-card__title">5. Lean MVP Experiments</h3>
                <span className="result-card__subtitle">{suggestedExperiments?.category}</span>
              </div>
            </div>
            <p className="result-card__summary">{suggestedExperiments?.summary}</p>
            <div className="experiments-timeline">
              {suggestedExperiments?.experiments?.map((exp, idx) => (
                <div key={idx} className="experiment-step">
                  <div className="experiment-step__pill">{exp.phase} • {exp.duration}</div>
                  <h4 className="experiment-step__name">{exp.name}</h4>
                  <p className="experiment-step__obj">{exp.objective}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultsDashboard;
