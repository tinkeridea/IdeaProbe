"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProvenanceBadge } from "@/components/Badges";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: string;
}

const WORKSPACE_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "📊", exact: true },
  { href: "/new", label: "New Idea Intake", icon: "✨" },
];

const PROJECT_NAV: NavItem[] = [
  { href: "/overview", label: "Project Overview", icon: "🎯" },
  { href: "/research", label: "Market Research", icon: "🔍" },
  { href: "/alternatives", label: "Alternatives", icon: "⚔️" },
  { href: "/personas", label: "Personas", icon: "🎭" },
  { href: "/interviews", label: "Simulated Interviews", icon: "💬" },
  { href: "/chat", label: "Persona Chat", icon: "🤖" },
  { href: "/insights", label: "Insights & Contradictions", icon: "💡" },
  { href: "/risks", label: "Assumptions & Risks", icon: "⚠️" },
  { href: "/experiments", label: "Experiment Planner", icon: "🧪" },
  { href: "/mvp", label: "MVP Plan", icon: "🚀" },
  { href: "/report", label: "Unified Report", icon: "📄" },
];

const SYSTEM_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/about", label: "About & Scope", icon: "ℹ️" },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Header / Logo */}
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo" aria-label="IdeaProbe home">
          <div className="logo-icon" aria-hidden="true">🔬</div>
          <div>
            <div className="logo-text">IdeaProbe</div>
            <div className="logo-badge">Phase 1 Prototype</div>
          </div>
        </Link>
      </div>

      {/* Global Mode & Health Banner */}
      <div style={{ padding: "0 var(--space-4) var(--space-3) var(--space-4)" }}>
        <div
          style={{
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-2) var(--space-3)",
            fontSize: "0.75rem",
            color: "var(--color-info)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>📋 <strong>Demo Mode Active</strong></span>
          <span
            style={{
              fontSize: "0.625rem",
              background: "rgba(34,197,94,0.15)",
              color: "var(--color-success)",
              padding: "1px 5px",
              borderRadius: "4px",
            }}
          >
            Offline
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Workspace */}
        <div className="nav-section-label">Workspace</div>
        {WORKSPACE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive(item) ? " active" : ""}`}
            aria-current={isActive(item) ? "page" : undefined}
          >
            <span className="nav-link-icon" aria-hidden="true">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
          </Link>
        ))}

        {/* Current Project Context */}
        <div className="nav-section-label" style={{ marginTop: "var(--space-4)" }}>
          Active Project: <span style={{ color: "var(--color-accent-light)" }}>Study Planner</span>
        </div>
        {PROJECT_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive(item) ? " active" : ""}`}
            aria-current={isActive(item) ? "page" : undefined}
          >
            <span className="nav-link-icon" aria-hidden="true">{item.icon}</span>
            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.label}
            </span>
          </Link>
        ))}

        {/* System */}
        <div className="nav-section-label" style={{ marginTop: "var(--space-4)" }}>
          System &amp; Info
        </div>
        {SYSTEM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive(item) ? " active" : ""}`}
            aria-current={isActive(item) ? "page" : undefined}
          >
            <span className="nav-link-icon" aria-hidden="true">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Evidence Provenance Legend (D04: 6 Types) */}
      <div className="sidebar-footer">
        <div className="evidence-legend" role="complementary" aria-label="Evidence provenance key">
          <div className="legend-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Provenance Key</span>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Policy D04</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginTop: "var(--space-2)" }}>
            <ProvenanceBadge type="REAL_SOURCE" size="sm" />
            <ProvenanceBadge type="AI_INFERENCE" size="sm" />
            <ProvenanceBadge type="SIMULATED" size="sm" />
            <ProvenanceBadge type="USER_INPUT" size="sm" />
            <ProvenanceBadge type="REAL_EXPERIMENT_RESULT" size="sm" />
            <ProvenanceBadge type="SAMPLE" size="sm" />
          </div>
        </div>
      </div>
    </aside>
  );
}
