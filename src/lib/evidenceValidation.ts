/**
 * IdeaProbe Evidence Validation & Provenance Quarantine Logic
 * 
 * Implements Non-Negotiable Evidence Integrity Rules (Decision D03, D14, D19):
 * 1. Placeholder-backed claims must NEVER be represented as verified real-world evidence.
 * 2. User acceptance (ACCEPTED) of a demo fixture marks it as accepted for the demonstration
 *    workflow only — it does NOT constitute independent real-world verification.
 * 3. Every placeholder citation must carry an explicit warning banner:
 *    "Unverified sample — source is a placeholder."
 * 4. Placeholder citations are strictly quarantined and prevented from contributing to
 *    any verified-evidence count or evidence-based validation conclusion.
 */

export const PLACEHOLDER_WARNING_TEXT =
  "Unverified sample — source is a placeholder. For demonstration only; cannot be cited as real customer proof.";

/**
 * Detects whether a URL uses an RFC 2606 / RFC 6761 reserved example/placeholder domain,
 * or localhost / dummy test URLs.
 */
export function isPlaceholderUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();
    
    // RFC 2606 & RFC 6761 reserved domains
    if (
      host === "example.com" ||
      host.endsWith(".example.com") ||
      host === "example.org" ||
      host.endsWith(".example.org") ||
      host === "example.net" ||
      host.endsWith(".example.net") ||
      host === "example.edu" ||
      host.endsWith(".example.edu") ||
      host === "example.in" ||
      host.endsWith(".example.in") ||
      host === "example" ||
      host.endsWith(".example") ||
      host === "invalid" ||
      host.endsWith(".invalid") ||
      host === "test" ||
      host.endsWith(".test") ||
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host === "127.0.0.1"
    ) {
      return true;
    }
  } catch {
    // If URL parsing fails, check substring matches
  }

  const placeholderPatterns = [
    "://example.com",
    "://example.org",
    "://example.net",
    "://example.edu",
    "://example.in",
    ".example.com",
    ".example.org",
    ".example.net",
    ".example.edu",
    ".example.in",
    "://localhost",
    "://127.0.0.1",
    "://dummy.test",
    "://placeholder.",
  ];

  return placeholderPatterns.some((pattern) => trimmed.includes(pattern));
}

/**
 * Checks if a source record is a placeholder or demo fixture.
 */
export function isPlaceholderSource(source: {
  url?: string | null;
  sourceType?: string | null;
  source_type?: string | null;
  provenance?: string | null;
  title?: string | null;
}): boolean {
  if (!source) return false;
  const sType = source.sourceType || source.source_type;
  if (sType === "demo_fixture") return true;
  if (source.provenance === "SAMPLE") return true;
  if (isPlaceholderUrl(source.url)) return true;
  return false;
}

/**
 * Checks if an evidence item is backed by a placeholder/sample source.
 */
export function isPlaceholderEvidence(evidence: {
  provenance?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  source_type_resolved?: string | null;
  url?: string | null;
  caveat?: string | null;
}): boolean {
  if (!evidence) return false;
  // Provenance is SAMPLE -> explicit sample claim
  if (evidence.provenance === "SAMPLE") return true;
  // Source URL is an RFC 2606 or placeholder domain
  const urlToCheck = evidence.source_url || evidence.url;
  if (isPlaceholderUrl(urlToCheck)) return true;
  // Source type is demo_fixture
  const sType = evidence.source_type || evidence.source_type_resolved;
  if (sType === "demo_fixture") return true;
  return false;
}

/**
 * Determines whether an evidence item qualifies as an INDEPENDENTLY VERIFIED REAL EVIDENCE item.
 * Must satisfy all three:
 * 1. Must NOT be a placeholder or sample claim.
 * 2. Provenance must be REAL_SOURCE or REAL_EXPERIMENT_RESULT.
 * 3. Human Review Gate status must be ACCEPTED or EDITED.
 */
export function isVerifiedRealEvidence(evidence: {
  provenance?: string | null;
  reviewer_status?: string | null;
  reviewerStatus?: string | null;
  source_url?: string | null;
  url?: string | null;
  source_type?: string | null;
  source_type_resolved?: string | null;
}): boolean {
  if (isPlaceholderEvidence(evidence)) return false;

  const prov = evidence.provenance;
  const isRealProv = prov === "REAL_SOURCE" || prov === "REAL_EXPERIMENT_RESULT";
  if (!isRealProv) return false;

  const status = (evidence.reviewer_status || evidence.reviewerStatus || "").toUpperCase();
  return status === "ACCEPTED" || status === "EDITED";
}

export interface ReviewDisplayInfo {
  label: string;
  badgeClass: string;
  color: string;
  borderColor: string;
  backgroundColor: string;
  tooltip: string;
  isVerifiedReal: boolean;
  isPlaceholder: boolean;
}

/**
 * Returns human-readable review gate display info that strictly prevents
 * sample acceptance from masquerading as real-world source verification.
 */
export function getEvidenceReviewDisplay(evidence: {
  reviewer_status?: string | null;
  reviewerStatus?: string | null;
  provenance?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  source_type_resolved?: string | null;
  url?: string | null;
}): ReviewDisplayInfo {
  const isPlaceholder = isPlaceholderEvidence(evidence);
  const rawStatus = (evidence.reviewer_status || evidence.reviewerStatus || "UNREVIEWED").toUpperCase();

  if (isPlaceholder) {
    if (rawStatus === "ACCEPTED") {
      return {
        label: "ACCEPTED (Sample Demo)",
        badgeClass: "badge-review-sample-accepted",
        color: "#a855f7", // Purple / Sample distinction
        borderColor: "rgba(168, 85, 247, 0.4)",
        backgroundColor: "rgba(168, 85, 247, 0.12)",
        tooltip: "Accepted for demo workflow only. Source is a placeholder and has NOT been independently verified.",
        isVerifiedReal: false,
        isPlaceholder: true,
      };
    }
    if (rawStatus === "EDITED") {
      return {
        label: "EDITED (Sample Demo)",
        badgeClass: "badge-review-sample-edited",
        color: "#60a5fa",
        borderColor: "rgba(96, 165, 250, 0.4)",
        backgroundColor: "rgba(96, 165, 250, 0.12)",
        tooltip: "Edited by user for demo workflow only. Source remains an unverified placeholder.",
        isVerifiedReal: false,
        isPlaceholder: true,
      };
    }
    if (rawStatus === "REJECTED") {
      return {
        label: "REJECTED",
        badgeClass: "badge-review-rejected",
        color: "var(--color-error, #ef4444)",
        borderColor: "rgba(239, 68, 68, 0.4)",
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        tooltip: "Rejected from downstream synthesis.",
        isVerifiedReal: false,
        isPlaceholder: true,
      };
    }
    // UNREVIEWED sample
    return {
      label: "UNREVIEWED (Sample)",
      badgeClass: "badge-review-sample-unreviewed",
      color: "var(--text-muted, #94a3b8)",
      borderColor: "var(--color-border, #334155)",
      backgroundColor: "var(--color-surface-2, #1e293b)",
      tooltip: "Sample fixture pending review.",
      isVerifiedReal: false,
      isPlaceholder: true,
    };
  }

  // Real Source evidence
  if (rawStatus === "ACCEPTED") {
    return {
      label: "ACCEPTED (Verified Real)",
      badgeClass: "badge-review-accepted",
      color: "var(--color-success, #22c55e)",
      borderColor: "rgba(34, 197, 94, 0.4)",
      backgroundColor: "rgba(34, 197, 94, 0.12)",
      tooltip: "Independently verified real-world source accepted by reviewer.",
      isVerifiedReal: true,
      isPlaceholder: false,
    };
  }
  if (rawStatus === "EDITED") {
    return {
      label: "EDITED (Verified Real)",
      badgeClass: "badge-review-edited",
      color: "var(--color-info, #38bdf8)",
      borderColor: "rgba(56, 189, 248, 0.4)",
      backgroundColor: "rgba(56, 189, 248, 0.12)",
      tooltip: "Real-world claim edited and accepted by reviewer.",
      isVerifiedReal: true,
      isPlaceholder: false,
    };
  }
  if (rawStatus === "REJECTED") {
    return {
      label: "REJECTED",
      badgeClass: "badge-review-rejected",
      color: "var(--color-error, #ef4444)",
      borderColor: "rgba(239, 68, 68, 0.4)",
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      tooltip: "Real-world claim rejected from downstream synthesis.",
      isVerifiedReal: false,
      isPlaceholder: false,
    };
  }
  return {
    label: "UNREVIEWED (Live Web)",
    badgeClass: "badge-review-unreviewed",
    color: "var(--color-warning, #f59e0b)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    tooltip: "Real web evidence retrieved via TinyFish awaiting human review gate decision.",
    isVerifiedReal: false,
    isPlaceholder: false,
  };
}

export interface ConfidenceDisplayInfo {
  level: string;
  displayLabel: string;
  color: string;
  tooltip: string;
}

/**
 * Returns formatted confidence label that guarantees placeholder citations
 * are NEVER presented with unjustified "High" real-world confidence.
 */
export function getEvidenceConfidenceDisplay(evidence: {
  confidence?: string | null;
  provenance?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  source_type_resolved?: string | null;
  url?: string | null;
}): ConfidenceDisplayInfo {
  const isPlaceholder = isPlaceholderEvidence(evidence);
  const rawConf = evidence.confidence || "Medium";

  if (isPlaceholder) {
    return {
      level: "Low",
      displayLabel: "● Low Confidence (Unverified Sample)",
      color: "var(--color-warning, #f59e0b)",
      tooltip: "Source is an unverified placeholder citation. Real-world confidence is Low pending authentic research.",
    };
  }

  // Real source confidence
  const confLower = rawConf.toLowerCase();
  if (confLower === "high") {
    return {
      level: "High",
      displayLabel: "● High Confidence (Verified Source)",
      color: "var(--color-success, #22c55e)",
      tooltip: "High confidence backed by reputable external source.",
    };
  }
  if (confLower === "medium") {
    return {
      level: "Medium",
      displayLabel: "● Medium Confidence",
      color: "var(--color-warning, #f59e0b)",
      tooltip: "Medium confidence external evidence.",
    };
  }
  return {
    level: "Low",
    displayLabel: "● Low Confidence",
    color: "var(--text-muted, #94a3b8)",
    tooltip: "Low confidence external evidence.",
  };
}
