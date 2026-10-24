"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProvenanceBadge } from "@/components/Badges";
import type { ProvenanceType } from "@/types";

const PROJECT_ID = "proj-study-planner";

interface ReportSection {
  id: string;
  title: string;
  provenance: string;
  content: string;
  caveat: string | null;
}

interface LiveReport {
  id: string;
  project_id: string;
  version: number;
  generated_at: string;
  content: ReportSection[];
  provenance_manifest: Record<string, number>;
  contains_simulated: boolean;
  contains_sample: boolean;
  project?: any;
  brief?: any;
  stats?: Record<string, number>;
}

const PROV_ICONS: Record<string, string> = {
  USER_INPUT: "✏️",
  REAL_SOURCE: "🌐",
  AI_INFERENCE: "🤖",
  SIMULATED: "🎭",
  SAMPLE: "🧪",
  REAL_EXPERIMENT_RESULT: "✅",
};

function generateMarkdown(report: LiveReport): string {
  let md = `# IdeaProbe — Founder Validation Report\n\n`;
  md += `**Project ID:** ${report.project_id}\n`;
  if (report.project) {
    md += `**Project:** ${report.project.title}\n`;
  }
  md += `**Generated At:** ${report.generated_at}\n`;
  md += `**Snapshot Version:** v${report.version}\n`;
  md += `**Report ID:** ${report.id}\n\n`;
  md += `---\n\n`;
  md += `## 🛡️ Provenance Audit Manifest\n\n`;
  for (const [key, val] of Object.entries(report.provenance_manifest)) {
    md += `- **${key}**: ${val} item(s)\n`;
  }
  md += `\n`;
  if (report.contains_simulated || report.contains_sample) {
    md += `> ⚠️ **CRITICAL CAVEAT:** This report contains ${report.provenance_manifest.SIMULATED || 0} simulated item(s) and ${report.provenance_manifest.SAMPLE || 0} sample fixture(s). Simulations and sample fixtures are speculative hypotheses or demo placeholders and NEVER constitute real customer evidence. Do not cite simulated data or sample fixtures as demand validation, market traction, or business viability evidence.\n\n`;
  }
  md += `---\n\n`;

  report.content.forEach((sec, idx) => {
    md += `## ${idx + 1}. ${sec.title} [${sec.provenance}]\n\n`;
    md += `${sec.content}\n\n`;
    if (sec.caveat) {
      md += `> ⚠️ *Note:* ${sec.caveat}\n\n`;
    }
    md += `---\n\n`;
  });

  if (report.stats) {
    md += `## 📊 Pipeline Statistics\n\n`;
    for (const [key, val] of Object.entries(report.stats)) {
      md += `- ${key.replace(/_/g, " ")}: ${val}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*Built with **IdeaProbe** — Local-First Idea Validation Engine*\n`;
  md += `*Report ID: ${report.id} | Certified Offline*\n`;

  return md;
}

export default function UnifiedReportPage() {
  const [report, setReport] = useState<LiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // ── Fetch existing report snapshot ─────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/report`);
      if (res.status === 404) {
        // No snapshot yet — that's fine
        setReport(null);
      } else {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to load report");
        setReport(data.data.report);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ── Generate fresh report ───────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${PROJECT_ID}/report`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Report generation failed");
      setReport(data.data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(generateMarkdown(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!report) return;
    const md = generateMarkdown(report);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ideaprobe-validation-report-${report.project_id}-v${report.version}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const totalItems = report
    ? Object.values(report.provenance_manifest).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            <span>/</span>
            <Link href="/overview" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Study Planner</Link>
            <span>/</span>
            <span style={{ color: "var(--color-accent-light)" }}>Unified Report</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
              Unified Founder Report (F15)
            </h1>
            {report && (
              <span style={{ fontSize: "0.6875rem", padding: "2px 7px", borderRadius: "999px", background: "rgba(34,197,94,0.15)", color: "var(--color-success)", border: "1px solid rgba(34,197,94,0.3)", fontWeight: "700" }}>
                ✓ LIVE
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)", fontSize: "0.9rem" }}>
            Immutable, audit-sealed synthesis across all pipeline modules with full provenance traceability.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary btn-sm"
            id="btn-generate-report"
          >
            {generating ? "⏳ Generating..." : "⚡ Generate Fresh Report"}
          </button>
          {report && (
            <>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm" id="btn-print-report">
                🖨️ Print / PDF
              </button>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm" id="btn-copy-report">
                {copied ? "✓ Copied!" : "📋 Copy Markdown"}
              </button>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm" id="btn-download-report">
                💾 Download .md
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card mb-4" style={{ padding: "var(--space-4)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--color-error)" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "var(--space-5)", height: "80px", background: "var(--color-surface-2)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      )}

      {/* No report yet */}
      {!loading && !report && !error && (
        <div className="card" style={{ padding: "var(--space-10)", textAlign: "center", background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,197,94,0.03) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>📋</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
            No Report Generated Yet
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto var(--space-6)" }}>
            Click &quot;Generate Fresh Report&quot; to synthesize all live data from your SQLite database — sources, personas, insights, risks, experiments, competitors, and MVP features — into a single provenance-audited document.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary"
            id="btn-generate-report-empty"
          >
            {generating ? "⏳ Generating..." : "⚡ Generate My First Report"}
          </button>
        </div>
      )}

      {/* Generating spinner */}
      {generating && (
        <div className="card mb-4" style={{ padding: "var(--space-4)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ width: "20px", height: "20px", border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: "var(--color-accent-light)", fontSize: "0.9rem", fontWeight: "600" }}>
            Aggregating live data from SQLite and computing provenance manifest…
          </div>
        </div>
      )}

      {/* Full report */}
      {!loading && report && (
        <>
          {/* Provenance Audit Manifest */}
          <div
            className="card mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(99,102,241,0.06) 100%)",
              border: "1px solid rgba(34,197,94,0.3)",
              padding: "var(--space-5)",
            }}
          >
            <div className="flex justify-between items-start mb-4" style={{ flexWrap: "wrap", gap: "var(--space-2)" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "1.25rem" }}>🛡️</span>
                <div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: "700", color: "var(--text-primary)" }}>
                    Provenance Audit Manifest (Decision D04)
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Snapshot ID: <code>{report.id}</code> • Version: v{report.version} • Generated: {new Date(report.generated_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", background: "rgba(34,197,94,0.15)", color: "var(--color-success)", border: "1px solid rgba(34,197,94,0.3)", fontWeight: "600" }}>
                  ✓ AUDIT PASSED
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{totalItems} total items</span>
              </div>
            </div>

            {/* Manifest grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
              {Object.entries(report.provenance_manifest).map(([key, val]) => (
                <div
                  key={key}
                  style={{ background: "rgba(0,0,0,0.2)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", textAlign: "center" }}
                >
                  <div style={{ fontSize: "1.25rem", marginBottom: "2px" }}>{PROV_ICONS[key] || "📄"}</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1 }}>
                    {val} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>({totalItems > 0 ? Math.round((val / totalItems) * 100) : 0}%)</span>
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <ProvenanceBadge type={key as ProvenanceType} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline stats */}
            {report.stats && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                {Object.entries(report.stats).map(([k, v]) => (
                  <span key={k} style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--text-secondary)" }}>
                    {k.replace(/_/g, " ")}: <strong style={{ color: "var(--text-primary)" }}>{v}</strong>
                  </span>
                ))}
              </div>
            )}

            {/* Caveat notice */}
            {(report.contains_simulated || report.contains_sample) && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", fontSize: "0.8125rem", color: "var(--color-error)" }}>
                ⚠️ <strong>Non-Negotiable Verification Notice:</strong> This report incorporates{" "}
                <strong>{report.provenance_manifest.SIMULATED || 0} simulated item(s)</strong> and{" "}
                <strong>{report.provenance_manifest.SAMPLE || 0} sample fixture(s)</strong>.
                Simulations and sample fixtures are hypothetical or illustrative placeholders. They do <strong>NOT</strong> count as independently verified real-world evidence and must <strong>NEVER</strong> be cited as proof of market demand, problem severity, or business viability.
              </div>
            )}
          </div>

          {/* Section Navigation Tabs */}
          <div className="card mb-6" style={{ padding: "var(--space-3)", background: "var(--color-surface-2)", display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", alignSelf: "center", marginRight: "var(--space-2)" }}>SECTIONS:</span>
            {report.content.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  fontSize: "0.75rem", padding: "4px 8px", borderRadius: "var(--radius-sm)", border: "1px solid",
                  borderColor: activeSection === sec.id ? "var(--color-accent)" : "var(--color-border)",
                  background: activeSection === sec.id ? "var(--color-accent)" : "transparent",
                  color: activeSection === sec.id ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {idx + 1}. {sec.title}
              </button>
            ))}
          </div>

          {/* Full Report Document */}
          <div className="card mb-8" style={{ padding: "var(--space-8)", background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            {/* Document header */}
            <div className="flex justify-between items-start mb-8" style={{ borderBottom: "2px solid var(--color-border)", paddingBottom: "var(--space-5)", flexWrap: "wrap", gap: "var(--space-4)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent-light)", fontWeight: "600" }}>
                  IDEA VALIDATION REPORT
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px" }}>
                  {report.project?.title || report.project_id}
                </h2>
                {report.project && (
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    Mode: <strong>{report.project.mode}</strong> • Status: <strong>{report.project.status}</strong>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Report ID: <code style={{ fontSize: "0.7rem" }}>{report.id}</code>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Version: <strong>v{report.version}</strong>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <ProvenanceBadge type={report.contains_sample ? "SAMPLE" : (report.contains_simulated ? "SIMULATED" : "AI_INFERENCE")} size="sm" />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
              {report.content.map((sec, idx) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  style={{ scrollMarginTop: "80px", paddingBottom: "var(--space-6)", borderBottom: idx === report.content.length - 1 ? "none" : "1px solid var(--color-border)" }}
                >
                  <div className="flex justify-between items-center mb-3" style={{ flexWrap: "wrap", gap: "var(--space-2)" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      {idx + 1}. {sec.title}
                    </h3>
                    <ProvenanceBadge type={sec.provenance as ProvenanceType} size="sm" />
                  </div>

                  <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                    {sec.content}
                  </p>

                  {sec.caveat && (
                    <div style={{
                      marginTop: "var(--space-3)", padding: "10px 14px", borderRadius: "var(--radius-sm)",
                      background: sec.provenance === "SIMULATED" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                      border: `1px solid ${sec.provenance === "SIMULATED" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`,
                      fontSize: "0.8125rem",
                      color: sec.provenance === "SIMULATED" ? "var(--color-error)" : "#f59e0b",
                    }}>
                      {sec.caveat}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Footer seal */}
            <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-6)", borderTop: "2px dashed var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <div>Built with <strong>IdeaProbe</strong> — Local-First Idea Validation Engine</div>
              <div>Version: <code>v{report.version}</code> • Report ID: <code>{report.id.slice(0, 24)}…</code> • Certified Offline</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
