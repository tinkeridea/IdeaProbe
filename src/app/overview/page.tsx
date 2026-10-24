"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StageList } from "@/components/StageList";
import { FixtureBadge, ProvenanceBadge, StatusDot } from "@/components/Badges";
import { DEMO_PROJECT, DEMO_RUN, DEMO_STAGES } from "@/lib/mockData";
import type { Stage, StageKey } from "@/types";

interface ProjectCounts {
  evidence_count: number;
  source_count: number;
  competitor_count: number;
  persona_count: number;
  interview_count: number;
  insight_count: number;
  assumption_count: number;
  experiment_count: number;
  mvp_count: number;
}

interface ProjectBrief {
  problem: string;
  target_customer: string;
  solution: string;
  geography: string;
  category: string;
  stage: string;
}

export default function OverviewPage() {
  const [projectId] = useState("proj-study-planner");
  const [projectTitle, setProjectTitle] = useState(DEMO_PROJECT.title);
  const [brief, setBrief] = useState<ProjectBrief>({
    problem: DEMO_PROJECT.problem,
    targetCustomer: DEMO_PROJECT.targetCustomer,
    solution: DEMO_PROJECT.solution,
    geography: DEMO_PROJECT.geography || "India",
    category: DEMO_PROJECT.category || "EdTech",
    stage: DEMO_PROJECT.stage || "Idea / Problem Validation",
  } as any);

  const [counts, setCounts] = useState<ProjectCounts>({
    evidence_count: 4,
    source_count: 4,
    competitor_count: 5,
    persona_count: 2,
    interview_count: 2,
    insight_count: 4,
    assumption_count: 4,
    experiment_count: 2,
    mvp_count: 7,
  });

  const [stages, setStages] = useState<Stage[]>(DEMO_STAGES);
  const [loading, setLoading] = useState(true);

  // Load live project metadata and entity counts from SQLite
  const loadProjectOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const p = json.data?.project;
      const b = json.data?.brief;
      const c = json.data?.counts;

      if (p?.title) setProjectTitle(p.title);
      if (b) {
        setBrief({
          problem: b.problem || DEMO_PROJECT.problem,
          target_customer: b.target_customer || DEMO_PROJECT.targetCustomer,
          solution: b.solution || DEMO_PROJECT.solution,
          geography: b.geography || "India",
          category: b.category || "EdTech",
          stage: b.stage || "Idea / Problem Validation",
        });
      }

      if (c) {
        const liveCounts: ProjectCounts = {
          evidence_count: Number(c.evidence_count || 0),
          source_count: Number(c.source_count || 0),
          competitor_count: Number(c.competitor_count || 0),
          persona_count: Number(c.persona_count || 0),
          interview_count: Number(c.interview_count || 0),
          insight_count: Number(c.insight_count || 0),
          assumption_count: Number(c.assumption_count || 0),
          experiment_count: Number(c.experiment_count || 0),
          mvp_count: Number(c.mvp_count || 0),
        };
        setCounts(liveCounts);

        // Derive dynamic stage progression from real SQLite counts
        const dynamicStages: Stage[] = [
          {
            id: "s-research",
            runId: DEMO_RUN.id,
            stageKey: "research",
            status: liveCounts.evidence_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:00:45Z",
            outputJson: {
              _label: "SAMPLE",
              provenance: "SAMPLE",
              summary: `${liveCounts.evidence_count} evidence items linked to ${liveCounts.source_count} registered sources in SQLite ledger.`,
            },
          },
          {
            id: "s-competitors",
            runId: DEMO_RUN.id,
            stageKey: "competitors",
            status: liveCounts.competitor_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:01:15Z",
            outputJson: {
              _label: "SAMPLE",
              provenance: "SAMPLE",
              summary: `${liveCounts.competitor_count} alternative and substitute solutions mapped across direct, indirect, and status quo categories.`,
            },
          },
          {
            id: "s-icp",
            runId: DEMO_RUN.id,
            stageKey: "icp",
            status: "completed",
            attempt: 1,
            completedAt: "2026-10-24T01:01:45Z",
            outputJson: {
              _label: "AI_INFERENCE",
              provenance: "AI_INFERENCE",
              summary: "High-priority ICP baseline defined: Undergraduate engineering students with active backlog pressure.",
            },
          },
          {
            id: "s-personas",
            runId: DEMO_RUN.id,
            stageKey: "personas",
            status: liveCounts.persona_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:02:15Z",
            outputJson: {
              _label: "SIMULATED",
              provenance: "SIMULATED",
              summary: `${liveCounts.persona_count} simulated persona hypotheses drafted. Strictly labeled as assumptions.`,
              caveat: "SIMULATED ARTIFACT — Not real customer evidence.",
            },
          },
          {
            id: "s-interviews",
            runId: DEMO_RUN.id,
            stageKey: "interviews",
            status: liveCounts.interview_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:02:55Z",
            outputJson: {
              _label: "SIMULATED",
              provenance: "SIMULATED",
              summary: `${liveCounts.interview_count} synthetic interview simulations with interactive chat turns.`,
              caveat: "NEVER use synthetic interviews as proof of market demand.",
            },
          },
          {
            id: "s-insights",
            runId: DEMO_RUN.id,
            stageKey: "insights",
            status: liveCounts.insight_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:03:25Z",
            outputJson: {
              _label: "AI_INFERENCE",
              provenance: "AI_INFERENCE",
              summary: `${liveCounts.insight_count} insights synthesized from evidence ledger via Ollama inference.`,
            },
          },
          {
            id: "s-risks",
            runId: DEMO_RUN.id,
            stageKey: "risks",
            status: liveCounts.assumption_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:03:50Z",
            outputJson: {
              _label: "AI_INFERENCE",
              provenance: "AI_INFERENCE",
              summary: `${liveCounts.assumption_count} critical assumptions ranked by Impact × Uncertainty.`,
            },
          },
          {
            id: "s-experiments",
            runId: DEMO_RUN.id,
            stageKey: "experiments",
            status: liveCounts.experiment_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:04:10Z",
            outputJson: {
              _label: "AI_INFERENCE",
              provenance: "AI_INFERENCE",
              summary: `${liveCounts.experiment_count} falsifiable experiments planned with clear decision rules.`,
            },
          },
          {
            id: "s-mvp",
            runId: DEMO_RUN.id,
            stageKey: "mvp",
            status: liveCounts.mvp_count > 0 ? "completed" : "queued",
            attempt: 1,
            completedAt: "2026-10-24T01:04:25Z",
            outputJson: {
              _label: "AI_INFERENCE",
              provenance: "AI_INFERENCE",
              summary: `${liveCounts.mvp_count} MVP feature candidates triaged into Now / Next / Later.`,
            },
          },
          {
            id: "s-report",
            runId: DEMO_RUN.id,
            stageKey: "report",
            status: "completed",
            attempt: 1,
            completedAt: "2026-10-24T01:04:30Z",
            outputJson: {
              _label: "AI_INFERENCE",
              provenance: "AI_INFERENCE",
              summary: "Unified Founder Validation Report with 6-type Provenance Audit Manifest breakdown.",
            },
          },
        ];
        setStages(dynamicStages);
      }
    } catch (err) {
      console.error("Failed to load live overview:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectOverview();
  }, [loadProjectOverview]);

  const completedStagesCount = stages.filter((s) => s.status === "completed").length;

  return (
    <div className="page-container animate-fade-in">
      {/* Header breadcrumb & title */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            <span>/</span>
            <span>Active Project</span>
            <span>/</span>
            <span style={{ color: "var(--color-accent-light)" }}>Run Overview</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {projectTitle}
            </h1>
            <FixtureBadge />
          </div>
        </div>

        <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={loadProjectOverview} title="Sync status with SQLite">
            ↻ Sync SQLite
          </button>
          <Link href="/report" className="btn btn-primary" id="btn-view-report">
            📄 View Unified Report
          </Link>
          <Link href="/new" className="btn btn-secondary">
            ✨ New Project
          </Link>
        </div>
      </div>

      {/* Project Meta Card */}
      <div
        className="card mb-6"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-5)",
        }}
      >
        <div className="flex justify-between items-center mb-3" style={{ flexWrap: "wrap", gap: "var(--space-2)" }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "1.25rem" }}>💡</span>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Venture Hypotheses &amp; Baseline Intake (F01)
            </span>
            <ProvenanceBadge type="USER_INPUT" size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <StatusDot status={DEMO_RUN.status} label="Pipeline Run Completed (Demo Fixture)" />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              ID: {DEMO_RUN.id}
            </span>
          </div>
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "var(--space-4)", lineHeight: "1.5" }}>
          {brief.problem}
        </p>

        <div className="grid-3" style={{ gap: "var(--space-3)", borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-3)" }}>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Target Customer: </span>
            <strong style={{ color: "var(--text-primary)" }}>{brief.target_customer}</strong>
          </div>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Target Market: </span>
            <strong style={{ color: "var(--text-primary)" }}>{brief.geography}</strong>
          </div>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Industry / Stage: </span>
            <strong style={{ color: "var(--text-primary)" }}>{brief.category} • {brief.stage}</strong>
          </div>
        </div>
      </div>

      {/* Live Entity Count Badges */}
      <div className="grid-4 mb-6" style={{ gap: "var(--space-3)" }}>
        <Link href="/research" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: "var(--space-4)", cursor: "pointer", transition: "all 0.15s ease" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Evidence &amp; Sources</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {counts.evidence_count} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>items</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-accent-light)" }}>
              {counts.source_count} registered sources →
            </div>
          </div>
        </Link>

        <Link href="/personas" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: "var(--space-4)", cursor: "pointer", transition: "all 0.15s ease" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Persona Hypotheses</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {counts.persona_count} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>drafts</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-accent-light)" }}>
              {counts.interview_count} simulated interviews →
            </div>
          </div>
        </Link>

        <Link href="/insights" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: "var(--space-4)", cursor: "pointer", transition: "all 0.15s ease" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Synthesized Insights</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {counts.insight_count} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>patterns</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-accent-light)" }}>
              Ollama AI_INFERENCE ready →
            </div>
          </div>
        </Link>

        <Link href="/mvp" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: "var(--space-4)", cursor: "pointer", transition: "all 0.15s ease" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>MVP Features &amp; Risks</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {counts.mvp_count} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>features</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-accent-light)" }}>
              {counts.assumption_count} assumptions · {counts.experiment_count} tests →
            </div>
          </div>
        </Link>
      </div>

      {/* Notice on Simulation Integrity (D03 / D04) */}
      <div
        className="card mb-6"
        style={{
          background: "rgba(167,139,250,0.06)",
          border: "1px solid rgba(167,139,250,0.2)",
          padding: "var(--space-4) var(--space-5)",
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "1.25rem" }}>🛡️</span>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--badge-simulation)" }}>
              IdeaProbe Provenance Guarantee (Decisions D03 &amp; D04)
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Simulated interviews and personas are speculative stress-testing tools. They do <strong>not</strong> count as customer evidence or proof of demand. All items below are labeled with their origin.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Stage List */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Validation Pipeline Stages
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Click any stage to expand details or jump directly to its dedicated analysis screen.
            </p>
          </div>

          <span style={{ fontSize: "0.75rem", color: "var(--color-success)", background: "rgba(34,197,94,0.1)", padding: "3px 8px", borderRadius: "4px" }}>
            {completedStagesCount} / 10 Stages Ready
          </span>
        </div>

        <StageList stages={stages} />
      </div>
    </div>
  );
}
