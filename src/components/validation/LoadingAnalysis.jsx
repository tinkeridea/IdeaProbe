import React, { useState, useEffect } from 'react';
import './LoadingAnalysis.css';

const VECTORS = [
  {
    id: 'market',
    title: 'Market Opportunity',
    subtitle: 'TAM, SAM & Geographic Demand Signals',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    details: 'Parsing addressable Indian retail and SME market signals...',
    color: 'violet',
  },
  {
    id: 'competitors',
    title: 'Competitors & Moats',
    subtitle: 'Incumbents, Manual Inertia & Defensibility',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    details: 'Benchmarking direct category players and pen-and-paper habits...',
    color: 'peach',
  },
  {
    id: 'personas',
    title: 'Customer Personas',
    subtitle: 'Archetype Buyer & Willingness to Pay',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    details: 'Mapping core customer frictions and price tolerance...',
    color: 'lavender',
  },
  {
    id: 'risks',
    title: 'Viability Risks',
    subtitle: 'CAC Inflation, Unit Economics & Execution',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    details: 'Detecting structural distribution bottlenecks and margins...',
    color: 'red',
  },
];

export function LoadingAnalysis({ startupName }) {
  const [activeVectorIndex, setActiveVectorIndex] = useState(0);
  const [completedVectors, setCompletedVectors] = useState(new Set());
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    // Sequential progress through the 4 vectors
    const vectorTimers = [
      setTimeout(() => {
        setActiveVectorIndex(0);
        setProgressPercent(28);
      }, 100),
      setTimeout(() => {
        setCompletedVectors((prev) => new Set([...prev, 'market']));
        setActiveVectorIndex(1);
        setProgressPercent(54);
      }, 650),
      setTimeout(() => {
        setCompletedVectors((prev) => new Set([...prev, 'competitors']));
        setActiveVectorIndex(2);
        setProgressPercent(76);
      }, 1250),
      setTimeout(() => {
        setCompletedVectors((prev) => new Set([...prev, 'personas']));
        setActiveVectorIndex(3);
        setProgressPercent(94);
      }, 1850),
    ];

    return () => {
      vectorTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <section className="loading-analysis-section" aria-live="polite">
      <div className="container loading-analysis__container">
        <div className="loading-card">
          {/* Top 3D Radar Scanner Header */}
          <div className="loading-scanner-header">
            <div className="scanner-radar-orb">
              <div className="radar-sweep-beam" />
              <div className="radar-grid-rings" />
              <div className="radar-center-blip" />
            </div>

            <div className="scanner-header-text">
              <span className="scanner-badge-pill">Multi-Vector AI Evaluation</span>
              <h2 className="loading-title">
                Validating {startupName || 'Your Startup Hypothesis'}
              </h2>
              <p className="loading-subtitle">
                Running simultaneous structural analysis across 4 venture vectors.
              </p>
            </div>
          </div>

          {/* Overall Sequential Progress Bar */}
          <div className="loading-progress-container">
            <div className="loading-progress-header">
              <span className="progress-label">Analysis Sequence Progress</span>
              <span className="progress-value">{progressPercent}%</span>
            </div>
            <div className="loading-progress-bar">
              <div
                className="loading-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3D-Styled Sequential Vector Deck */}
          <div className="analysis-vectors-deck">
            {VECTORS.map((vector, index) => {
              const isCompleted = completedVectors.has(vector.id);
              const isScanning = activeVectorIndex === index && !isCompleted;
              const isPending = activeVectorIndex < index;

              let statusLabel = 'Queued';
              if (isScanning) statusLabel = 'Scanning...';
              if (isCompleted) statusLabel = 'Verified ✓';

              return (
                <div
                  key={vector.id}
                  className={`vector-row vector-row--${vector.color} ${
                    isScanning ? 'vector-row--active' : ''
                  } ${isCompleted ? 'vector-row--completed' : ''} ${
                    isPending ? 'vector-row--pending' : ''
                  }`}
                >
                  {/* Scanning Laser Beam Effect */}
                  {isScanning && <div className="vector-scan-beam" />}

                  <div className="vector-row__icon-wrap">
                    {vector.icon}
                  </div>

                  <div className="vector-row__info">
                    <div className="vector-row__title-wrap">
                      <strong className="vector-row__title">{vector.title}</strong>
                      <span className="vector-row__badge">{statusLabel}</span>
                    </div>
                    <p className="vector-row__subtitle">
                      {isScanning ? vector.details : vector.subtitle}
                    </p>
                  </div>

                  <div className="vector-row__indicator">
                    {isCompleted ? (
                      <span className="vector-check-circle" aria-label="Completed">
                        ✓
                      </span>
                    ) : isScanning ? (
                      <div className="vector-pulse-spinner" />
                    ) : (
                      <span className="vector-queued-dot" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="loading-note">
            Synthesizing market defensibility, unit economics & lean experiment roadmap...
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoadingAnalysis;
