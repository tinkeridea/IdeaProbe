/**
 * IdeaProbe — Insight Validation, Deduplication & Sample-Statistic Quarantine
 * Decision D21
 *
 * Enforces:
 * 1. Normalized statement deduplication so identical insights are never duplicated.
 * 2. Strict quarantine of placeholder-backed claims and demo fixture metrics (68% cramming, 82% abandonment, etc.).
 * 3. Distinguishes real literature statistics (e.g. 74% board exam anxiety from Mary 2014) from RFC 2606 placeholder fixtures.
 * 4. Explicit labeling: placeholder-backed claims must never masquerade as established facts.
 */

// Known placeholder evidence IDs (Decision D19, backed by RFC 2606 example domains)
export const PLACEHOLDER_EVIDENCE_IDS = new Set(["ev-001", "ev-002", "ev-003"]);

// Known placeholder metrics originating exclusively from demo fixtures (ev-001, ev-002, ev-003)
export const DEMO_FIXTURE_METRIC_PATTERNS = [
  /\b68%/i,
  /\b82%/i,
  /\b3\.1[x×]/i,
  /\b6[x×]\s+more\s+monetized/i,
];

/**
 * Normalizes an insight statement for duplicate comparison.
 * - Lowercases and trims
 * - Collapses whitespace
 * - Strips leading bracket tags (e.g. "[Unverified Sample Claim ...]", "[SAMPLE]")
 * - Strips trailing punctuation (. ! ? ; : ,)
 */
export function normalizeInsightStatement(statement: string): string {
  if (!statement) return "";
  let s = statement.toLowerCase().trim();
  // Strip leading bracket disclaimers if present (can be multiple, e.g. [SAMPLE] [Unverified...])
  s = s.replace(/^(?:\[[^\]]+\]\s*)+/, "");
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  // Strip trailing punctuation (. ! ? ; : ,)
  s = s.replace(/[.!?;:,]+$/, "");
  return s;
}

/**
 * Checks whether text specifically asserts unverified demo fixture metrics (68%, 82%, 3.1x, 6x).
 * Does NOT classify real-literature statistics (e.g. 74% from PMC4129138) as demo fixtures.
 */
export function containsPlaceholderStatistics(text: string): boolean {
  if (!text) return false;
  return DEMO_FIXTURE_METRIC_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Checks whether an insight relies on placeholder fixtures or asserts sample statistics.
 * Uses source and evidence linkage to determine whether a claim is placeholder-backed.
 */
export function isPlaceholderBackedInsight(insight: {
  provenance?: string;
  evidence_for_ids?: string[] | string;
  statement?: string;
  caveat?: string;
}): boolean {
  if (!insight) return false;

  // 1. Explicit SAMPLE provenance
  if (insight.provenance === "SAMPLE") return true;

  // 2. Parse linked evidence IDs
  const rawIds = insight.evidence_for_ids;
  let ids: string[] = [];
  if (Array.isArray(rawIds)) {
    ids = rawIds;
  } else if (typeof rawIds === "string") {
    try {
      const parsed = JSON.parse(rawIds);
      if (Array.isArray(parsed)) ids = parsed;
    } catch {
      // not JSON array
    }
  }

  // 3. Links to known RFC 2606 placeholder fixtures (ev-001, ev-002, ev-003)
  if (ids.some((id) => PLACEHOLDER_EVIDENCE_IDS.has(id))) {
    return true;
  }

  // 4. Asserts demo fixture statistics (68% cramming, 82% abandonment, etc.) in statement
  if (containsPlaceholderStatistics(insight.statement || "")) {
    return true;
  }

  // 5. Caveat declares unverified sample claim AND links to sample fixtures
  if (
    insight.caveat &&
    (insight.caveat.includes("RFC 2606") || insight.caveat.includes("UNVERIFIED SAMPLE CLAIM"))
  ) {
    if (ids.some((id) => PLACEHOLDER_EVIDENCE_IDS.has(id)) || containsPlaceholderStatistics(insight.caveat || "")) {
      return true;
    }
  }

  return false;
}

export const SAMPLE_CLAIM_PREFIX = "[Unverified Sample Claim — Demo Placeholder Metric]";

/**
 * Formats an insight statement so placeholder metrics are never presented as established facts.
 * If not placeholder-backed, strips any erroneous quarantine prefix.
 */
export function sanitizeInsightStatement(statement: string, isPlaceholderBacked: boolean): string {
  if (!statement) return "";
  const cleaned = statement.replace(/^\[Unverified Sample Claim[^\]]*\]\s*/i, "").trim();

  if (!isPlaceholderBacked) {
    return cleaned;
  }

  return `${SAMPLE_CLAIM_PREFIX} ${cleaned}`;
}

export const MANDATORY_SAMPLE_INSIGHT_CAVEAT =
  "⚠️ UNVERIFIED SAMPLE CLAIM: Relies on illustrative demo placeholder fixtures/metrics (68% cramming / 82% abandonment from RFC 2606 example domains). Must NOT be cited as established customer evidence or market validation.";

/**
 * Ensures caveat explicitly warns about placeholder fixtures when present,
 * and strips erroneous RFC 2606 boilerplate from legitimate real-source insights.
 */
export function sanitizeInsightCaveat(
  caveat: string | null | undefined,
  isPlaceholderBacked: boolean
): string | null {
  if (!isPlaceholderBacked) {
    if (!caveat) return null;
    const stripped = caveat
      .replace(/\s*\|\s*⚠️ UNVERIFIED SAMPLE CLAIM:[\s\S]*$/, "")
      .replace(/^⚠️ UNVERIFIED SAMPLE CLAIM:[\s\S]*$/, "")
      .trim();
    return stripped || null;
  }

  if (!caveat || caveat.trim().length === 0) {
    return MANDATORY_SAMPLE_INSIGHT_CAVEAT;
  }

  if (caveat.includes("UNVERIFIED SAMPLE CLAIM")) {
    return caveat;
  }

  return `${caveat.trim()} | ${MANDATORY_SAMPLE_INSIGHT_CAVEAT}`;
}

/**
 * Deduplicates an array of insights by unique ID and normalized statement content.
 */
export function deduplicateInsights<T extends { id: string; statement: string }>(insights: T[]): T[] {
  const seenIds = new Set<string>();
  const seenStatements = new Set<string>();
  const result: T[] = [];

  for (const item of insights) {
    if (!item) continue;
    const norm = normalizeInsightStatement(item.statement);
    if (seenIds.has(item.id) || (norm && seenStatements.has(norm))) {
      continue;
    }
    seenIds.add(item.id);
    if (norm) seenStatements.add(norm);
    result.push(item);
  }

  return result;
}
