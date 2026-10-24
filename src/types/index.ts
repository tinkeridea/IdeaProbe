/**
 * IdeaProbe — Shared TypeScript Definitions (Phase 3)
 * Authoritative source: IdeaProbe_Documentation_Kit/docs/
 *
 * All provenance enums follow Decision D04 & docs/research-evidence-policy.md
 */

// ── Provenance Enums (D04: 6 types) ────────────────────────────────

export type ProvenanceType =
  | "SAMPLE"                  // Prepared demo fixture data
  | "SIMULATED"               // AI-generated synthetic interview / persona (NEVER real evidence)
  | "REAL_SOURCE"             // Material retrieved from an identifiable external source
  | "USER_INPUT"              // Claims or parameters directly provided by founder
  | "REAL_EXPERIMENT_RESULT"  // Actual data from real-world experiment execution
  | "AI_INFERENCE";           // Generated analysis/synthesis from evidence/assumptions

// Legacy alias
export type EvidenceBasis = "evidence" | "inference" | "simulation" | "user_input" | "assumption";

// ── Status Enums ───────────────────────────────────────────────────

export type RunStatus = "queued" | "running" | "completed" | "partial" | "failed" | "cancelled";
export type StageStatus = "queued" | "running" | "completed" | "failed" | "skipped";
export type RunMode = "live" | "demo_fixture" | "DEMO" | "LIVE" | "MIXED";
export type SourceType = "web" | "document" | "user_input" | "demo_fixture";
export type ReviewerStatus = "UNREVIEWED" | "ACCEPTED" | "EDITED" | "REJECTED";
export type CompetitorCategory = "direct" | "indirect" | "substitute" | "status_quo";
export type InsightType = "theme" | "contradiction" | "open_question";
export type AssumptionStatus = "unvalidated" | "testing" | "validated" | "invalidated";
export type ExperimentStatus = "planned" | "running" | "completed" | "abandoned";
export type MVPPriority = "now" | "later" | "omit";
export type ConfidenceLevel = "High" | "Medium" | "Low";

// ── Stage Keys ─────────────────────────────────────────────────────

export const STAGE_KEYS = [
  "research", "competitors", "icp", "personas", "interviews",
  "insights", "risks", "experiments", "mvp", "report",
] as const;
export type StageKey = (typeof STAGE_KEYS)[number];

export const STAGE_LABELS: Record<StageKey, string> = {
  research: "Market Research",
  competitors: "Competitor Mapping",
  icp: "Ideal Customer Profile",
  personas: "Simulated Personas",
  interviews: "Synthetic Interviews",
  insights: "Insight Extraction",
  risks: "Assumptions & Risks",
  experiments: "Experiment Planner",
  mvp: "MVP Planning",
  report: "Founder Report",
};

// ── Core Domain Entities ───────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  ideaText?: string;
  problem: string;
  targetCustomer: string;
  solution: string;
  geography?: string;
  category?: string;
  alternatives?: string;
  stage?: string;
  constraints?: string;
  goals?: string;
  provenance: ProvenanceType;
  status?: string;
  mode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Run {
  id: string;
  projectId: string;
  status: RunStatus;
  mode: RunMode;
  modelName?: string;
  promptVersion: string;
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
}

export interface Stage {
  id: string;
  runId: string;
  stageKey: StageKey;
  status: StageStatus;
  outputJson?: unknown;
  attempt: number;
  startedAt?: string;
  completedAt?: string;
  safeError?: string;
}

export interface Source {
  id: string;
  projectId?: string;
  url?: string | null;
  title: string;
  publisher?: string | null;
  publishedAt?: string | null;
  retrievedAt: string;
  sourceType: SourceType;
  provider?: string | null;
  contentHash?: string | null;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  runId?: string;
  projectId?: string;
  sourceId?: string;
  url?: string;
  title: string;
  publisher?: string;
  retrievedAt?: string;
  publishedAt?: string;
  excerpt: string;
  claim?: string;
  sourceType: SourceType;
  provenance: ProvenanceType;
  confidence: ConfidenceLevel;
  reviewerStatus?: ReviewerStatus;
  status?: "verified" | "unverified" | "disputed";
  caveat?: string;
}

// ── F07: Competitors ────────────────────────────────────────────────

export interface Competitor {
  id: string;
  projectId?: string;
  name: string;
  category: CompetitorCategory;
  description: string;
  differentiator: string;
  provenance: ProvenanceType;
  evidenceIds?: string[];
}

// ── F08: Personas ──────────────────────────────────────────────────

export interface Persona {
  id: string;
  projectId?: string;
  name: string;
  segment: string;
  age?: string;
  context: string;
  jobs: string;
  pains: string;
  goals: string;
  behaviors: string;
  constraints: string;
  objections: string;
  assumptions: string;
  provenance: ProvenanceType;
  evidenceIds?: string[];
  caveat: string;
}

// ── F09: Interviews & Turns ────────────────────────────────────────

export interface InterviewTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  provenance: ProvenanceType;
}

export interface Interview {
  id: string;
  projectId?: string;
  personaId: string;
  personaName: string;
  scenario: string;
  provenance: "SIMULATED";
  model?: string;
  turns: InterviewTurn[];
  caveat: string;
  createdAt: string;
}

// ── F11: Insights ──────────────────────────────────────────────────

export interface Insight {
  id: string;
  projectId?: string;
  statement: string;
  type: InsightType;
  confidence: ConfidenceLevel;
  evidenceForIds: string[];
  evidenceAgainstIds?: string[];
  caveat?: string;
  provenance: ProvenanceType;
}

// ── F12: Assumptions / Risks ───────────────────────────────────────

export interface Assumption {
  id: string;
  projectId?: string;
  statement: string;
  category: string;
  impact: ConfidenceLevel;
  uncertainty: "Critical" | "High" | "Medium" | "Low";
  rationale: string;
  status: AssumptionStatus;
  evidenceIds?: string[];
  provenance: ProvenanceType;
}

// ── F13: Experiments ───────────────────────────────────────────────

export interface Experiment {
  id: string;
  projectId?: string;
  assumptionId?: string;
  hypothesis: string;
  method: string;
  cohort: string;
  metric: string;
  threshold: string;
  duration: string;
  costEstimate?: string;
  decisionRules: string;
  status: ExperimentStatus;
  result?: string;
  provenance: ProvenanceType;
}

// ── F14: MVP Features ──────────────────────────────────────────────

export interface MVPFeature {
  id: string;
  projectId?: string;
  name: string;
  scope: string;
  priority: MVPPriority;
  effort: ConfidenceLevel;
  rationale: string;
  dependencyIds?: string[];
  experimentIds?: string[];
  status: string;
  provenance: ProvenanceType;
}

// ── F15: Report ────────────────────────────────────────────────────

export interface ProvenanceManifest {
  USER_INPUT: number;
  SAMPLE: number;
  AI_INFERENCE: number;
  SIMULATED: number;
  REAL_SOURCE: number;
  REAL_EXPERIMENT_RESULT: number;
}

export interface ReportSnapshot {
  id: string;
  projectId: string;
  runId: string;
  version: number;
  generatedAt: string;
  containsSimulated: boolean;
  containsSample: boolean;
  provenanceManifest: ProvenanceManifest;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  provenance: ProvenanceType;
  content: string;
  caveat?: string;
}

// ── ICP (Ideal Customer Profile) ───────────────────────────────────

export interface ICPProfile {
  primarySegment: string;
  demographic: string;
  psychographic: string;
  jobToBeDone: string;
  painIntensity: "Critical" | "High" | "Medium" | "Low";
  willingnessToPaySignal: string;
  acquisitionChannel: string;
  provenance: ProvenanceType;
  caveat?: string;
}

// ── Form & Clarification Types ─────────────────────────────────────

export interface IdeaFormValues {
  title: string;
  problem: string;
  targetCustomer: string;
  solution: string;
  geography: string;
  category: string;
  alternatives: string;
  stage: string;
  constraints: string;
  goals: string;
}

export type IdeaFormErrors = Partial<Record<keyof IdeaFormValues, string>>;

export interface ClarifyingQuestion {
  id: string;
  question: string;
  category: "customer" | "business_model" | "distribution" | "technical";
  assumptionIfBlank: string;
  answer?: string;
}

// ── Mock & Fixture Detail Types ────────────────────────────────────

export interface MockRunDetail {
  run: Run;
  project: Project;
  stages: Stage[];
}
