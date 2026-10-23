import React from 'react';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const currentYear = CURRENT_YEAR;

  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__grid">
          {/* Brand Info */}
          <div className="footer__col footer__col--brand">
            <div className="footer__brand-wrap">
              <span className="footer__brand-title">zenith<span className="footer__brand-dot">.</span></span>
              <span className="footer__brand-badge">india</span>
            </div>
            <p className="footer__desc">
              AI-powered startup idea validation platform designed for ambitious Indian founders and entrepreneurs. 
              De-risk venture viability before building.
            </p>
            <div className="footer__security-badge">
              <span className="footer__security-dot" />
              <span>Zero-Leakage Client Architecture</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Navigation</h4>
            <ul className="footer__col-links">
              <li><a href="#home">Overview</a></li>
              <li><a href="#framework">Viability Framework</a></li>
              <li><a href="#how-it-works">3-Step Process</a></li>
              <li><a href="#security">Architecture</a></li>
            </ul>
          </div>

          {/* Validation Vectors Column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Validation Vectors</h4>
            <ul className="footer__col-links">
              <li><span>Market Opportunity (TAM/SAM)</span></li>
              <li><span>Competitor & Moat Mapping</span></li>
              <li><span>Unit Economics & CAC Risks</span></li>
              <li><span>Customer Personas</span></li>
              <li><span>Lean MVP Experiments</span></li>
            </ul>
          </div>

          {/* Platform Status Column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Platform Status</h4>
            <ul className="footer__col-links">
              <li><span className="status-live-chip">Vite 8 + React 19 MVP</span></li>
              <li><span>Target Backend: Local / Node</span></li>
              <li><span>Safe Fallback: Active</span></li>
              <li><span>Encrypted Client State</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer__bottom">
          <p>© {currentYear} Zenith India. Built with clean modern architecture.</p>
          <div className="footer__bottom-links">
            <span>Confidential & Private</span>
            <span>•</span>
            <span>Founder-First Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
