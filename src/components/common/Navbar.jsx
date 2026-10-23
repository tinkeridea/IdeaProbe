import React, { useState } from 'react';
import './Navbar.css';

export function Navbar({ activeView = 'landing', onNavigate, hasResults = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view, e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar__container">
        {/* Brand Logo in Wix 'clics.' minimalist style */}
        <a
          href="#home"
          className="navbar__brand"
          aria-label="Zenith India Home"
          onClick={(e) => handleNavClick('landing', e)}
        >
          <div className="navbar__brand-symbol">
            <span className="navbar__symbol-dot" />
          </div>
          <div className="navbar__brand-text">
            <span className="navbar__brand-name">zenith<span className="navbar__brand-dot">.</span></span>
            <span className="navbar__brand-region">india</span>
          </div>
        </a>

        {/* Mobile toggle button */}
        <button
          type="button"
          className="navbar__toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        {/* Centered Navigation Links */}
        <nav className={`navbar__nav ${mobileMenuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            <li>
              <a
                href="#home"
                className={activeView === 'landing' ? 'active' : ''}
                onClick={(e) => handleNavClick('landing', e)}
              >
                Overview
              </a>
            </li>
            <li>
              <a
                href="#framework"
                onClick={(e) => {
                  if (activeView !== 'landing') {
                    handleNavClick('landing', e);
                    setTimeout(() => {
                      document.getElementById('framework')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('framework')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Framework
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  if (activeView !== 'landing') {
                    handleNavClick('landing', e);
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Process
              </a>
            </li>
            {hasResults && (
              <li>
                <a
                  href="#results"
                  className={activeView === 'results' ? 'active' : ''}
                  onClick={(e) => handleNavClick('results', e)}
                >
                  Results Dashboard
                </a>
              </li>
            )}
          </ul>

          <div className="navbar__actions">
            <button
              type="button"
              className="btn-pill-dark"
              onClick={(e) => handleNavClick('form', e)}
            >
              Validate My Idea →
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
