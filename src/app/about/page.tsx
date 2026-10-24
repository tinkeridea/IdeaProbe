import React from "react";
import Link from "next/link";
import { ProvenanceBadge, FixtureBadge } from "@/components/Badges";

export const metadata = {
  title: "About & Scope — IdeaProbe",
  description: "Mission, evidence integrity policy, provenance standards, and local-first architecture.",
};

export default function AboutPage() {
  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
              About IdeaProbe
            </h1>
            <span className="badge badge-live">v0.1.0 Prototype</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "var(--space-1)" }}>
            Validate before you build. Decision support grounded in evidence, not speculative hype.
          </p>
        </div>

        <Link href="/" className="btn btn-secondary btn-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Core Philosophy Card */}
      <div className="card mb-6" style={{ padding: "var(--space-6)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
          The IdeaProbe Mission
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "var(--space-4)" }}>
          Most startup tools generate flattering, generic business plans that encourage founders to start building immediately.
          <strong> IdeaProbe does the opposite:</strong> it systematically surfaces blindspots, catalogues unspoken assumptions,
          maps competitor substitutes, and designs falsifiable experiments so founders learn the truth before spending capital.
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          IdeaProbe is not a guaranteed market forecaster. It is a <em>traceable validation engine</em> that keeps founders honest
          about what has actually been observed versus what remains an assumption.
        </p>
      </div>

      {/* Non-Negotiable Evidence Integrity Policy */}
      <div
        className="card mb-6"
        style={{
          background: "rgba(167,139,250,0.05)",
          border: "1px solid rgba(167,139,250,0.25)",
          padding: "var(--space-6)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: "1.25rem" }}>🛡️</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--badge-simulation)" }}>
            Non-Negotiable Evidence Policy (Decision D03)
          </h2>
        </div>

        <div style={{ background: "rgba(0,0,0,0.2)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "0.9375rem", fontWeight: "600", color: "#f87171" }}>
            "Simulated interviews and generated personas are NEVER customer evidence or proof of demand."
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Synthetic interviews are speculative tools used solely to brainstorm potential objections and test narrative clarity.
            They are permanently excluded from validation scores and demand calculations.
          </p>
        </div>

        <h3 style={{ fontSize: "0.9375rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
          The Six Provenance Enums (Decision D04)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="flex items-center gap-3" style={{ background: "var(--color-surface)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <ProvenanceBadge type="REAL_SOURCE" size="sm" />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              External data with publisher, URL, retrieval timestamp, and exact quoted excerpts.
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ background: "var(--color-surface)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <ProvenanceBadge type="USER_INPUT" size="sm" />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Claims, parameters, and constraints provided directly by the founder.
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ background: "var(--color-surface)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <ProvenanceBadge type="AI_INFERENCE" size="sm" />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Synthesis or deductive patterns derived by the local model from inputs or sources.
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ background: "var(--color-surface)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <ProvenanceBadge type="SIMULATED" size="sm" />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Hypothetical persona dialogue or synthetic customer feedback (Never proof of demand).
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ background: "var(--color-surface)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <ProvenanceBadge type="REAL_EXPERIMENT_RESULT" size="sm" />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Directly measured outcomes from real-world experiment execution (e.g. landing page signups).
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ background: "var(--color-surface)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <ProvenanceBadge type="SAMPLE" size="sm" />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Bundled demo fixtures provided for offline demonstration and testing.
            </span>
          </div>
        </div>
      </div>

      {/* Architecture & Zero-Cloud Privacy (D05 / D06 / D09) */}
      <div className="card mb-6" style={{ padding: "var(--space-6)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
          Local-First Architecture &amp; Privacy
        </h2>
        <div className="grid-2" style={{ gap: "var(--space-4)" }}>
          <div style={{ background: "var(--color-surface-2)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontWeight: "600", color: "var(--color-accent-light)", marginBottom: "var(--space-1)" }}>
              Local CPU Inference (Ollama)
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Targeting <code className="font-mono">qwen3.5:4b</code> running entirely on your laptop via localhost:11434.
              No proprietary startup ideas or sensitive customer data are sent to third-party LLM clouds.
            </p>
          </div>

          <div style={{ background: "var(--color-surface-2)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontWeight: "600", color: "var(--color-accent-light)", marginBottom: "var(--space-1)" }}>
              Local SQLite Database
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              All project records, evidence ledgers, and runs persist in a private local file.
              Cascading user-initiated deletion ensures zero lingering data residue.
            </p>
          </div>
        </div>
      </div>

      {/* Current Roadmap Status */}
      <div className="card" style={{ padding: "var(--space-6)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
          Development Roadmap
        </h2>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--color-success)" }}>✓</span>
            <strong>Phase 0:</strong> Architecture audit &amp; Confirmation Gate passed (2026-10-24)
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--color-accent-light)" }}>●</span>
            <strong>Phase 1 (Active):</strong> App shell, navigation, PRD idea intake form, and mock run detail screen
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--text-muted)" }}>○</span>
            <strong>Phase 2:</strong> SQLite persistence, schema migrations, and REST API routes
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--text-muted)" }}>○</span>
            <strong>Phase 3:</strong> End-to-end coherent sample datasets
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--text-muted)" }}>○</span>
            <strong>Phase 4:</strong> Bounded Ollama inference adapter with strict schema validation
          </div>
        </div>
      </div>
    </div>
  );
}
