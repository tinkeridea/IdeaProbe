"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProvenanceBadge } from "@/components/Badges";

interface ProviderHealth {
  database: {
    driver: string;
    status: string;
    total_projects: number;
  };
  inference: {
    provider: string;
    baseUrl: string;
    targetModel: string;
    status: "ready" | "model_missing" | "unreachable" | "error";
    latencyMs: number | null;
    availableModels: string[];
    checkedAt: string;
    note: string;
  };
  research: {
    provider: string;
    status: string;
    enabled: boolean;
    latencyMs?: number;
    message?: string;
  };
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "ready" || status === "healthy"
      ? "var(--color-success)"
      : status === "model_missing"
      ? "var(--color-warning)"
      : "var(--color-error)";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        marginRight: 6,
        boxShadow: `0 0 4px ${color}`,
      }}
    />
  );
}

export default function SettingsPage() {
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [reseeding, setReseeding] = useState(false);
  const [reseedMessage, setReseedMessage] = useState<string | null>(null);

  const handleReseed = async () => {
    setReseeding(true);
    setReseedMessage(null);
    try {
      const res = await fetch("/api/health/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reseed" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Reseed failed");
      setReseedMessage("✓ Demo project fixtures verified & re-seeded successfully.");
      await fetchHealth();
    } catch (err: any) {
      setReseedMessage(`⚠️ Reseed error: ${err.message}`);
    } finally {
      setReseeding(false);
    }
  };

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health/providers");
      const json = await res.json();
      if (json.data) {
        setHealth(json.data as ProviderHealth);
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const ollamaStatus = health?.inference.status ?? "unreachable";
  const statusLabel =
    ollamaStatus === "ready"
      ? "● Live — AI_INFERENCE Mode"
      : ollamaStatus === "model_missing"
      ? "● Model Missing — Fixture Mode"
      : "● Offline — Fixture Mode";
  const statusColor =
    ollamaStatus === "ready"
      ? "var(--color-success)"
      : ollamaStatus === "model_missing"
      ? "var(--color-warning)"
      : "var(--color-error)";

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: "var(--color-accent-light)" }}>Settings &amp; Environment</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
              Provider Settings &amp; Privacy
            </h1>
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchHealth}
          disabled={loading}
          id="btn-refresh-health"
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
        >
          {loading ? "⟳ Checking…" : "↺ Refresh Status"}
        </button>
      </div>

      {/* Local Ollama Inference Provider Status */}
      <div className="card mb-6" style={{ padding: "var(--space-6)" }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "1.25rem" }}>🤖</span>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Local Inference Provider (Ollama)
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Runs completely on your laptop via{" "}
                <code>{health?.inference.baseUrl ?? "http://127.0.0.1:11434"}</code>. Zero cloud egress.
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              background:
                ollamaStatus === "ready"
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(245,158,11,0.15)",
              color: statusColor,
              padding: "3px 10px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Status grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-3)",
            marginBottom: "var(--space-4)",
          }}
        >
          {[
            {
              label: "Status",
              value: loading ? "Checking…" : ollamaStatus,
              highlight: true,
            },
            {
              label: "Target Model",
              value: health?.inference.targetModel ?? "qwen2.5:3b",
            },
            {
              label: "Latency",
              value: health?.inference.latencyMs != null
                ? `${health.inference.latencyMs} ms`
                : loading ? "…" : "N/A",
            },
            {
              label: "Last Checked",
              value: lastChecked ?? "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-3)",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: item.highlight ? statusColor : "var(--text-primary)" }}>
                {item.highlight && <StatusDot status={ollamaStatus} />}
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Available models */}
        {health?.inference.availableModels && health.inference.availableModels.length > 0 && (
          <div style={{ marginBottom: "var(--space-4)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Available Models</div>
            <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>
              {health.inference.availableModels.map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: "0.75rem",
                    background: m.toLowerCase().startsWith(health.inference.targetModel.toLowerCase())
                      ? "rgba(34,197,94,0.15)"
                      : "var(--color-surface-2)",
                    color: m.toLowerCase().startsWith(health.inference.targetModel.toLowerCase())
                      ? "var(--color-success)"
                      : "var(--text-secondary)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mode explanation */}
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            background: "var(--color-surface-2)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-sm)",
            lineHeight: 1.6,
          }}
        >
          {ollamaStatus === "ready" ? (
            <>
              <strong style={{ color: "var(--color-success)" }}>✓ AI_INFERENCE mode active.</strong> Persona chat, insight synthesis, and persona generation will use real{" "}
              <code>{health?.inference.targetModel}</code> completions tagged{" "}
              <ProvenanceBadge type="AI_INFERENCE" /> with <code>model_name</code> and{" "}
              <code>prompt_version</code> recorded.
            </>
          ) : ollamaStatus === "model_missing" ? (
            <>
              <strong style={{ color: "var(--color-warning)" }}>⚠ Ollama running but model not found.</strong> Run{" "}
              <code>ollama pull {health?.inference.targetModel ?? "qwen2.5:3b"}</code> to enable AI_INFERENCE mode. Currently serving SAMPLE fixtures.
            </>
          ) : (
            <>
              <strong style={{ color: "var(--color-error)" }}>✗ Ollama unreachable.</strong> All inference calls serve pre-computed SAMPLE fixtures.
              To enable live inference: run <code>ollama serve</code> in a terminal, then{" "}
              <code>ollama pull qwen2.5:3b</code>.
            </>
          )}
        </div>
      </div>

      {/* Research Provider (TinyFish Status) */}
      <div className="card mb-6" style={{ padding: "var(--space-6)" }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "1.25rem" }}>🌐</span>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Live Research Provider (TinyFish)
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Web search discovery &amp; content extraction (api.search.tinyfish.ai).
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              background: health?.research.status === "ready" ? "rgba(34,197,94,0.15)" : "rgba(56,189,248,0.15)",
              color: health?.research.status === "ready" ? "var(--color-success)" : "var(--color-info)",
              padding: "3px 8px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            {health?.research.status === "ready"
              ? `● Live Search Connected (${health.research.latencyMs ?? 0}ms)`
              : "Fallback Active (D10)"}
          </span>
        </div>

        <div
          style={{
            background: health?.research.status === "ready" ? "rgba(34,197,94,0.06)" : "rgba(56,189,248,0.06)",
            border: `1px solid ${health?.research.status === "ready" ? "rgba(34,197,94,0.25)" : "rgba(56,189,248,0.2)"}`,
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
            {health?.research.status === "ready" ? (
              <>
                <strong style={{ color: "var(--color-success)" }}>✓ TinyFish Live Provider Connected.</strong> API key verified. Live web search queries execute via <code>https://api.search.tinyfish.ai</code> and return structured real-world evidence into the Human Review Gate.
              </>
            ) : (
              <>
                <strong>Status (Decision D10):</strong> TinyFish operating in manual fallback mode. Configure <code>TINYFISH_API_KEY</code> in <code>.env.local</code> to activate live web crawling.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Database */}
      <div className="card mb-6" style={{ padding: "var(--space-6)" }}>
        <div className="flex items-center gap-3 mb-4">
          <span style={{ fontSize: "1.25rem" }}>🗄️</span>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Local Database (SQLite)
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {health?.database.driver ?? "@libsql/client (local SQLite)"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)", minWidth: 120 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Status</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              <StatusDot status={health?.database.status ?? "error"} />
              {loading ? "…" : (health?.database.status ?? "unknown")}
            </div>
          </div>
          <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)", minWidth: 120 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Projects</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {loading ? "…" : (health?.database.total_projects ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Local Storage & Cascading Deletion (Decision D08) */}
      <div className="card" style={{ padding: "var(--space-6)" }}>
        <div className="flex items-center gap-3 mb-4">
          <span style={{ fontSize: "1.25rem" }}>🗑️</span>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Data Storage &amp; Cascading Deletion (Decision D08)
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              All database records and validation snapshots reside strictly on your local device.
            </p>
          </div>
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
          When you delete a project, IdeaProbe executes an immediate cascading purge: all linked runs, stages, evidence items, and simulated interviews are permanently removed.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-reseed-demo"
            className="btn btn-secondary btn-sm"
            style={{ color: "var(--color-accent-light)", borderColor: "rgba(99,102,241,0.3)" }}
            onClick={handleReseed}
            disabled={reseeding}
          >
            {reseeding ? "⏳ Re-seeding..." : "↺ Re-seed Demo Fixtures (Idempotent)"}
          </button>
          {reseedMessage && (
            <span style={{ fontSize: "0.8125rem", color: reseedMessage.startsWith("✓") ? "var(--color-success)" : "var(--color-error)" }}>
              {reseedMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

