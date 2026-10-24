/**
 * IdeaProbe — Ollama Local Inference Adapter (Phase 4)
 *
 * Implements the provider contract from docs/ollama-prompts-schemas.md:
 *   - Accepts task, model, bounded context, JSON schema, temperature, timeout
 *   - Returns validated structured data + provider/model metadata
 *   - Tags all real completions AI_INFERENCE with model_name + prompt_version
 *   - Fallback to SAMPLE / SIMULATED mode when Ollama is unavailable
 *   - Never stores chain-of-thought; only structured output persisted
 *   - No cloud model fallback (Decision D09 + no Phase 0 approval for cloud)
 *
 * Prompt rules enforced:
 *   - System prompt frames IdeaProbe as decision support
 *   - Only bounded project context sent; no cross-project data
 *   - JSON schema required in prompt; validated on receipt
 *   - Repair attempts bounded to MAX_REPAIR_ATTEMPTS
 *   - Timeout enforced per call
 */

export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3.5:4b";

/** How many ms to wait for a completion (generous for CPU inference) */
const INFERENCE_TIMEOUT_MS = 90_000;
/** How many ms to wait for health check / tags probe */
const HEALTH_TIMEOUT_MS = 3_000;
/** Max JSON repair attempts before giving up */
const MAX_REPAIR_ATTEMPTS = 2;
/** Current prompt template version — increment when prompts change */
export const PROMPT_VERSION = "1.0.0";

// ─── Types ────────────────────────────────────────────────────────

export type OllamaStatus = "ready" | "model_missing" | "unreachable" | "error";

export interface OllamaHealthResult {
  status: OllamaStatus;
  baseUrl: string;
  targetModel: string;
  latencyMs: number | null;
  availableModels: string[];
  checkedAt: string;
}

export interface InferenceResult<T> {
  data: T;
  provenance: "AI_INFERENCE";
  modelName: string;
  promptVersion: string;
  generatedAt: string;
  latencyMs: number;
}

export interface InferenceFallback<T> {
  data: T;
  provenance: "SAMPLE" | "SIMULATED";
  reason: string;
  fallbackAt: string;
}

export type InferenceOutcome<T> = InferenceResult<T> | InferenceFallback<T>;

/** Options for a single inference call */
export interface InferenceOptions<T> {
  /** Human-readable task name for logging */
  task: string;
  /** System prompt fragment (IdeaProbe adds standard header) */
  systemFragment: string;
  /** The user message / main prompt */
  userPrompt: string;
  /** JSON schema description embedded in prompt */
  schemaDescription: string;
  /** Validator: return typed object or throw if invalid */
  validate: (raw: unknown) => T;
  /** Fallback data to return when Ollama is unavailable */
  fallback: T;
  /** Fallback provenance type */
  fallbackProvenance?: "SAMPLE" | "SIMULATED";
  /** Temperature (default 0.4 for structured tasks) */
  temperature?: number;
  /** Custom timeout override */
  timeoutMs?: number;
}

// ─── SYSTEM PROMPT HEADER ─────────────────────────────────────────

const IDEAPROBE_SYSTEM_HEADER = `You are IdeaProbe, an AI decision-support assistant that helps startup founders validate ideas rigorously.

CRITICAL RULES:
- You separate clearly: observed evidence, user claims, your own inference, and simulation.
- You NEVER invent sources, citations, or real people.
- Simulated persona voices must not claim to be real people or to have lived experience.
- You produce concise, falsifiable statements and flag open questions.
- You do NOT output raw chain-of-thought; respond ONLY with valid JSON.
- You MUST return a single JSON object matching the schema exactly — no markdown fences, no extra text.
- If you cannot produce valid JSON, respond with: {"error": "CANNOT_COMPLETE", "reason": "<brief reason>"}
`;

// ─── Health Check ─────────────────────────────────────────────────

/**
 * Probe the local Ollama server.
 * Returns a detailed health result including available model list.
 */
export async function checkOllamaHealth(): Promise<OllamaHealthResult> {
  const checkedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return {
        status: "error",
        baseUrl: OLLAMA_BASE_URL,
        targetModel: OLLAMA_MODEL,
        latencyMs,
        availableModels: [],
        checkedAt,
      };
    }

    const data = await res.json();
    const availableModels: string[] = (data.models || []).map(
      (m: { name: string }) => m.name
    );

    const hasModel = availableModels.some((m) =>
      m.toLowerCase().startsWith(OLLAMA_MODEL.toLowerCase())
    );

    return {
      status: hasModel ? "ready" : "model_missing",
      baseUrl: OLLAMA_BASE_URL,
      targetModel: OLLAMA_MODEL,
      latencyMs,
      availableModels,
      checkedAt,
    };
  } catch {
    return {
      status: "unreachable",
      baseUrl: OLLAMA_BASE_URL,
      targetModel: OLLAMA_MODEL,
      latencyMs: null,
      availableModels: [],
      checkedAt,
    };
  }
}

// ─── JSON Extraction ──────────────────────────────────────────────

/**
 * Try to extract a JSON object from an Ollama completion.
 * Handles common issues: markdown fences, leading/trailing text,
 * and truncated JSON.
 */
function extractJson(text: string): unknown {
  // Strip markdown code fences
  const cleaned = text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // Find first JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // continue
    }
  }

  // Find first JSON array
  const aStart = cleaned.indexOf("[");
  const aEnd = cleaned.lastIndexOf("]");
  if (aStart !== -1 && aEnd > aStart) {
    try {
      return JSON.parse(cleaned.slice(aStart, aEnd + 1));
    } catch {
      // continue
    }
  }

  throw new Error(
    `Cannot extract JSON from completion: ${cleaned.slice(0, 200)}`
  );
}

// ─── Core Inference Call ──────────────────────────────────────────

/**
 * Call Ollama /api/generate with a structured output requirement.
 * Returns raw validated object T or throws.
 */
async function callOllama<T>(
  options: InferenceOptions<T>
): Promise<{ raw: T; latencyMs: number }> {
  const {
    systemFragment,
    userPrompt,
    schemaDescription,
    validate,
    temperature = 0.4,
    timeoutMs = INFERENCE_TIMEOUT_MS,
  } = options;

  const systemPrompt = `${IDEAPROBE_SYSTEM_HEADER}\n${systemFragment}\n\nRESPOND WITH VALID JSON ONLY MATCHING THIS SCHEMA:\n${schemaDescription}`;

  const body = {
    model: OLLAMA_MODEL,
    system: systemPrompt,
    prompt: userPrompt,
    stream: false,
    format: "json",
    think: false,
    options: {
      temperature,
      num_predict: 1024,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  let responseText: string;
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    responseText = (data.response as string) || "";
  } catch (err: unknown) {
    clearTimeout(timer);
    throw err;
  }

  const latencyMs = Date.now() - start;

  // Try to parse and validate; repair up to MAX_REPAIR_ATTEMPTS times
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    try {
      let parsed: unknown;
      if (attempt === 0) {
        parsed = extractJson(responseText);
      } else {
        // Repair attempt: ask model to fix JSON
        const repairBody = {
          model: OLLAMA_MODEL,
          system:
            "Fix the following malformed JSON so it matches the schema. Return ONLY valid JSON, no markdown.",
          prompt: `Schema: ${schemaDescription}\n\nMalformed output:\n${responseText}\n\nFixed JSON:`,
          stream: false,
          format: "json",
          think: false,
          options: { temperature: 0.1, num_predict: 512 },
        };
        const repairController = new AbortController();
        const repairTimer = setTimeout(() => repairController.abort(), 30_000);
        const repairRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(repairBody),
          signal: repairController.signal,
        });
        clearTimeout(repairTimer);
        const repairData = await repairRes.json();
        responseText = (repairData.response as string) || "";
        parsed = extractJson(responseText);
      }

      const validated = validate(parsed);
      return { raw: validated, latencyMs };
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError || new Error("Validation failed after repair attempts");
}

// ─── Public Inference API ─────────────────────────────────────────

/**
 * Run inference with automatic fallback when Ollama is unavailable.
 * Never throws — returns either AI_INFERENCE result or SAMPLE/SIMULATED fallback.
 */
export async function runInference<T>(
  options: InferenceOptions<T>
): Promise<InferenceOutcome<T>> {
  // Quick health check before attempting inference
  const health = await checkOllamaHealth();

  if (health.status !== "ready") {
    return {
      data: options.fallback,
      provenance: options.fallbackProvenance ?? "SAMPLE",
      reason: `Ollama status: ${health.status}. Serving pre-computed fixture. Start 'ollama serve' and run 'ollama pull ${OLLAMA_MODEL}'.`,
      fallbackAt: new Date().toISOString(),
    };
  }

  try {
    const { raw, latencyMs } = await callOllama(options);
    return {
      data: raw,
      provenance: "AI_INFERENCE",
      modelName: OLLAMA_MODEL,
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date().toISOString(),
      latencyMs,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      data: options.fallback,
      provenance: options.fallbackProvenance ?? "SAMPLE",
      reason: `Inference error: ${message}`,
      fallbackAt: new Date().toISOString(),
    };
  }
}

// ─── Type guard ───────────────────────────────────────────────────

export function isAiInference<T>(
  outcome: InferenceOutcome<T>
): outcome is InferenceResult<T> {
  return outcome.provenance === "AI_INFERENCE";
}

// ─── Structured Schemas (from ollama-prompts-schemas.md) ──────────

/** Insight */
export interface InsightSchema {
  statement: string;
  type: "theme" | "contradiction" | "open_question";
  confidence: "low" | "medium" | "high";
  evidence_for_ids: string[];
  evidence_against_ids: string[];
  caveat: string;
  provenance: "AI_INFERENCE";
}

export function validateInsight(raw: unknown): InsightSchema {
  const r = raw as Record<string, unknown>;
  if (typeof r.statement !== "string" || !r.statement)
    throw new Error("Missing statement");
  if (!["theme", "contradiction", "open_question"].includes(r.type as string))
    throw new Error(`Invalid type: ${r.type}`);
  if (!["low", "medium", "high"].includes(r.confidence as string))
    throw new Error(`Invalid confidence: ${r.confidence}`);
  return {
    statement: r.statement,
    type: r.type as InsightSchema["type"],
    confidence: r.confidence as InsightSchema["confidence"],
    evidence_for_ids: Array.isArray(r.evidence_for_ids)
      ? (r.evidence_for_ids as string[])
      : [],
    evidence_against_ids: Array.isArray(r.evidence_against_ids)
      ? (r.evidence_against_ids as string[])
      : [],
    caveat: typeof r.caveat === "string" ? r.caveat : "",
    provenance: "AI_INFERENCE",
  };
}

export const INSIGHT_SCHEMA_DESC = `{
  "statement": "string — concise falsifiable finding",
  "type": "theme | contradiction | open_question",
  "confidence": "low | medium | high",
  "evidence_for_ids": ["string — evidence ID"],
  "evidence_against_ids": ["string — evidence ID"],
  "caveat": "string — key assumption or limitation",
  "provenance": "AI_INFERENCE"
}`;

/** Persona */
export interface PersonaSchema {
  name: string;
  segment: string;
  context: string;
  jobs: string[];
  pains: string[];
  goals: string[];
  behaviors: string[];
  constraints: string[];
  objections: string[];
  evidence_ids: string[];
  assumptions: string[];
  provenance: "AI_INFERENCE" | "SAMPLE";
}

export function validatePersona(raw: unknown): PersonaSchema {
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== "string" || !r.name) throw new Error("Missing name");
  if (typeof r.segment !== "string" || !r.segment)
    throw new Error("Missing segment");
  return {
    name: r.name,
    segment: r.segment,
    context: typeof r.context === "string" ? r.context : "",
    jobs: Array.isArray(r.jobs) ? (r.jobs as string[]) : [],
    pains: Array.isArray(r.pains) ? (r.pains as string[]) : [],
    goals: Array.isArray(r.goals) ? (r.goals as string[]) : [],
    behaviors: Array.isArray(r.behaviors) ? (r.behaviors as string[]) : [],
    constraints: Array.isArray(r.constraints) ? (r.constraints as string[]) : [],
    objections: Array.isArray(r.objections) ? (r.objections as string[]) : [],
    evidence_ids: Array.isArray(r.evidence_ids)
      ? (r.evidence_ids as string[])
      : [],
    assumptions: Array.isArray(r.assumptions) ? (r.assumptions as string[]) : [],
    provenance: "AI_INFERENCE",
  };
}

export const PERSONA_SCHEMA_DESC = `{
  "name": "string — descriptive segment label (NOT a real person's name)",
  "segment": "string — target market segment",
  "context": "string — usage scenario",
  "jobs": ["string — job to be done"],
  "pains": ["string — pain point"],
  "goals": ["string — desired outcome"],
  "behaviors": ["string — observed or plausible behavior"],
  "constraints": ["string — budget/time/knowledge constraint"],
  "objections": ["string — likely objection to this product"],
  "evidence_ids": ["string — IDs from supplied evidence"],
  "assumptions": ["string — labeled assumption, not verified fact"],
  "provenance": "AI_INFERENCE"
}`;

/** Simulated persona chat reply */
export interface PersonaChatSchema {
  reply: string;
  sentiment: "positive" | "neutral" | "skeptical" | "negative";
  revealed_concern: string | null;
  simulation_note: string;
}

export function validatePersonaChat(raw: unknown): PersonaChatSchema {
  const r = raw as Record<string, unknown>;
  if (typeof r.reply !== "string" || !r.reply) throw new Error("Missing reply");
  if (
    !["positive", "neutral", "skeptical", "negative"].includes(
      r.sentiment as string
    )
  )
    throw new Error(`Invalid sentiment: ${r.sentiment}`);
  return {
    reply: r.reply,
    sentiment: r.sentiment as PersonaChatSchema["sentiment"],
    revealed_concern:
      typeof r.revealed_concern === "string" ? r.revealed_concern : null,
    simulation_note:
      typeof r.simulation_note === "string"
        ? r.simulation_note
        : "SIMULATED — not real customer evidence",
  };
}

export const PERSONA_CHAT_SCHEMA_DESC = `{
  "reply": "string — persona's in-character response (2-4 sentences)",
  "sentiment": "positive | neutral | skeptical | negative",
  "revealed_concern": "string | null — main objection surfaced, or null",
  "simulation_note": "string — MUST include the word SIMULATED"
}`;

/** Experiment */
export interface ExperimentSchema {
  hypothesis: string;
  method: string;
  cohort: string;
  metric: string;
  threshold: string;
  duration: string;
  cost_estimate: string;
  decision_rules: {
    continue: string;
    pivot: string;
    stop: string;
  };
  ethical_notes: string[];
  linked_assumption_ids: string[];
}

export function validateExperiment(raw: unknown): ExperimentSchema {
  const r = raw as Record<string, unknown>;
  if (typeof r.hypothesis !== "string" || !r.hypothesis)
    throw new Error("Missing hypothesis");
  const dr = ((r.decision_rules as Record<string, unknown>) || {});
  return {
    hypothesis: r.hypothesis,
    method: typeof r.method === "string" ? r.method : "",
    cohort: typeof r.cohort === "string" ? r.cohort : "",
    metric: typeof r.metric === "string" ? r.metric : "",
    threshold: typeof r.threshold === "string" ? r.threshold : "",
    duration: typeof r.duration === "string" ? r.duration : "",
    cost_estimate: typeof r.cost_estimate === "string" ? r.cost_estimate : "",
    decision_rules: {
      continue: typeof dr.continue === "string" ? dr.continue : "",
      pivot: typeof dr.pivot === "string" ? dr.pivot : "",
      stop: typeof dr.stop === "string" ? dr.stop : "",
    },
    ethical_notes: Array.isArray(r.ethical_notes)
      ? (r.ethical_notes as string[])
      : [],
    linked_assumption_ids: Array.isArray(r.linked_assumption_ids)
      ? (r.linked_assumption_ids as string[])
      : [],
  };
}

export const EXPERIMENT_SCHEMA_DESC = `{
  "hypothesis": "string — falsifiable if-then statement",
  "method": "string — experiment type",
  "cohort": "string — target participant segment",
  "metric": "string — primary success metric",
  "threshold": "string — pass/fail threshold value",
  "duration": "string — time-bounded (e.g. 2 weeks)",
  "cost_estimate": "string — rough cost estimate",
  "decision_rules": {
    "continue": "string",
    "pivot": "string",
    "stop": "string"
  },
  "ethical_notes": ["string"],
  "linked_assumption_ids": ["string"]
}`;

/** Competitor */
export interface CompetitorSchema {
  name: string;
  category: "direct" | "indirect" | "substitute" | "status_quo";
  description: string;
  differentiation: string;
  source_ids: string[];
  confidence: "low" | "medium" | "high";
  caveat: string;
}

export function validateCompetitor(raw: unknown): CompetitorSchema {
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== "string" || !r.name) throw new Error("Missing name");
  if (
    !["direct", "indirect", "substitute", "status_quo"].includes(
      r.category as string
    )
  )
    throw new Error(`Invalid category: ${r.category}`);
  return {
    name: r.name,
    category: r.category as CompetitorSchema["category"],
    description: typeof r.description === "string" ? r.description : "",
    differentiation:
      typeof r.differentiation === "string" ? r.differentiation : "",
    source_ids: Array.isArray(r.source_ids) ? (r.source_ids as string[]) : [],
    confidence: ["low", "medium", "high"].includes(r.confidence as string)
      ? (r.confidence as CompetitorSchema["confidence"])
      : "low",
    caveat: typeof r.caveat === "string" ? r.caveat : "",
  };
}

export const COMPETITOR_SCHEMA_DESC = `{
  "name": "string — competitor or alternative name",
  "category": "direct | indirect | substitute | status_quo",
  "description": "string",
  "differentiation": "string — how the idea differs",
  "source_ids": ["string"],
  "confidence": "low | medium | high",
  "caveat": "string"
}`;
