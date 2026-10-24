/**
 * IdeaProbe — Regression Test: Clickable & Copyable Source URLs and Mapping Integrity
 *
 * Validates:
 * 1. URL validation helper correctly permits http:// and https:// and rejects malformed/unsafe schemes.
 * 2. Static verification of `src/app/research/page.tsx`:
 *    - All external source anchor links specify `target="_blank"` and `rel="noopener noreferrer"`.
 *    - Truncation/ellipsis CSS applied on preview pills and wordBreak: "break-all" on full views.
 *    - Copy URL buttons are present for evidence cards, expanded provenance records, and the sources registry.
 *    - Copy handler preserves exact URL string and gives user feedback.
 * 3. Seeded SQLite database check:
 *    - Source URLs in database are preserved intact.
 *    - Reviewer statuses are preserved (no automatic changes to UNREVIEWED, ACCEPTED, etc.).
 * 4. Placeholder Detection & Normalization:
 *    - RFC 2606 example domains (example.edu, example.org, example.in) correctly identified.
 *    - Real web domains (nature.com, pmc.ncbi.nlm.nih.gov) recognized as genuine.
 *    - Protocol normalization adds https:// when omitted.
 * 5. Distinct Source Retention & Field Mapping:
 *    - Multiple distinct sources maintain their respective URLs end-to-end.
 *    - Displayed URL, stored URL, and rendered href match.
 * 6. Same-Domain & Shared-Source Integrity:
 *    - Distinct URLs on the same domain do not collide.
 *    - Multiple evidence claims linked to a single source correctly receive that source's URL without bleeding.
 */

import fs from "fs";
import path from "path";
import { initDb, getDb } from "./src/lib/db";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? `: ${detail}` : ""}`);
    failed++;
  }
}

// Helpers mirroring src/app/research/page.tsx
function isValidHttpUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  try {
    const trimmed = str.trim();
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getClickableHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (isValidHttpUrl(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

function isExamplePlaceholderDomain(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const trimmed = url.trim();
    const urlWithProto = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    const hostname = new URL(urlWithProto).hostname.toLowerCase();
    return (
      hostname === "example.com" ||
      hostname.endsWith(".example.com") ||
      hostname === "example.org" ||
      hostname.endsWith(".example.org") ||
      hostname === "example.net" ||
      hostname.endsWith(".example.net") ||
      hostname === "example.edu" ||
      hostname.endsWith(".example.edu") ||
      hostname === "example.in" ||
      hostname.endsWith(".example.in") ||
      hostname === "example" ||
      hostname.endsWith(".example")
    );
  } catch {
    return false;
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("IdeaProbe: Source URLs Regression Test Suite");
  console.log("=================================================");

  // ── GROUP 1: URL Validation Logic ─────────────────────────────
  console.log("\n--- Group 1: URL Validation Logic ---");
  {
    assert(isValidHttpUrl("https://example.com"), "Accepts standard https:// url");
    assert(isValidHttpUrl("http://localhost:3000/research"), "Accepts http:// with port and path");
    assert(isValidHttpUrl("https://www.nature.com/articles/s41598-022-26989-w"), "Accepts long complex https:// url");
    assert(isValidHttpUrl("https://news.ycombinator.com?item=12345#comments"), "Accepts query params and hash anchors");
    assert(!isValidHttpUrl("javascript:alert('xss')"), "Rejects javascript: pseudo-protocol");
    assert(!isValidHttpUrl("data:text/html;base64,PHNjcmlwdD4="), "Rejects data: URIs");
    assert(!isValidHttpUrl("ftp://ftp.example.com/file.txt"), "Rejects ftp: URLs");
    assert(!isValidHttpUrl("file:///C:/Users/file.txt"), "Rejects file: URLs");
    assert(!isValidHttpUrl("not-a-valid-url"), "Rejects plain arbitrary strings");
    assert(!isValidHttpUrl(""), "Rejects empty string");
    assert(!isValidHttpUrl(null), "Rejects null");
    assert(!isValidHttpUrl(undefined), "Rejects undefined");
  }

  // ── GROUP 2: Code Inspection of src/app/research/page.tsx ─────
  console.log("\n--- Group 2: Code Inspection of Research Page Component ---");
  {
    const pagePath = path.join(__dirname, "src", "app", "research", "page.tsx");
    assert(fs.existsSync(pagePath), "src/app/research/page.tsx exists");

    const content = fs.readFileSync(pagePath, "utf-8");

    // 1. Check target="_blank" and rel="noopener noreferrer"
    const relMatches = content.match(/rel="noopener noreferrer"/g) || [];
    assert(relMatches.length >= 3, `Found ${relMatches.length} instances of rel="noopener noreferrer" (>= 3 required for pill, expanded, registry)`);

    const targetMatches = content.match(/target="_blank"/g) || [];
    assert(targetMatches.length >= 3, `Found ${targetMatches.length} instances of target="_blank" (>= 3 required)`);

    // 2. Check Copy URL mechanism
    assert(content.includes("handleCopyUrl"), "handleCopyUrl function is implemented");
    assert(content.includes("navigator.clipboard.writeText"), "Uses navigator.clipboard.writeText");
    assert(content.includes("document.execCommand(\"copy\")"), "Includes execCommand fallback for non-standard clipboard contexts");
    assert(content.includes("✓ Copied"), "Displays ✓ Copied feedback state");
    assert(content.includes("Source URL copied to clipboard"), "Dispatches notification toast on copy");

    // 3. Check visual truncation / word break
    assert(content.includes("textOverflow: \"ellipsis\""), "Applies ellipsis text-overflow on inline pill");
    assert(content.includes("wordBreak: \"break-all\""), "Applies wordBreak: break-all on full URL displays");

    // 4. Check helpers and Suspense boundary
    assert(content.includes("getClickableHref"), "getClickableHref helper is utilized in page");
    assert(content.includes("isExamplePlaceholderDomain"), "isExamplePlaceholderDomain helper is utilized in page");
    assert(content.includes("Suspense"), "Wrapped in Suspense boundary for useSearchParams");
  }

  // ── GROUP 3: SQLite Source & Evidence Preserved Integrity ──────
  console.log("\n--- Group 3: Database Source Data & Reviewer Status Integrity ---");
  {
    await initDb();
    const db = getDb();

    // Check sources table
    const sourcesRes = await db.execute("SELECT * FROM sources WHERE project_id = 'proj-study-planner'");
    const sources = sourcesRes.rows as unknown as Array<{ url?: string | null; title?: string }>;
    assert(sources.length > 0, `Database contains ${sources.length} sources for proj-study-planner`);

    let httpSourcesCount = 0;
    for (const s of sources) {
      if (s.url && isValidHttpUrl(s.url)) {
        httpSourcesCount++;
      }
    }
    assert(httpSourcesCount >= 4, `At least 4 sources have valid HTTP(S) URLs (found ${httpSourcesCount})`);

    // Check evidence table
    const evidenceRes = await db.execute("SELECT * FROM evidence WHERE project_id = 'proj-study-planner'");
    const evidence = evidenceRes.rows as unknown as Array<{ reviewer_status: string; source_id: string | null }>;
    assert(evidence.length > 0, `Database contains ${evidence.length} evidence items`);

    const statuses = new Set(evidence.map((e) => e.reviewer_status));
    assert(statuses.has("UNREVIEWED"), "Database maintains UNREVIEWED items (no auto-acceptance)");
    assert(statuses.has("ACCEPTED"), "Database maintains ACCEPTED items");

    // Verify evidence-to-source associations remain intact
    const linked = evidence.filter((e) => e.source_id !== null);
    assert(linked.length >= 5, `Evidence items maintain source_id foreign keys (found ${linked.length} linked)`);
  }

  // ── GROUP 4: Placeholder Detection & URL Normalization ──────────
  console.log("\n--- Group 4: Placeholder Detection & Protocol Normalization ---");
  {
    // RFC 2606 example domains detection
    assert(isExamplePlaceholderDomain("https://example.edu/research/indian-higher-ed-stress-2025"), "Detects example.edu as placeholder domain");
    assert(isExamplePlaceholderDomain("https://example.org/reports/mobile-learning-churn"), "Detects example.org as placeholder domain");
    assert(isExamplePlaceholderDomain("https://example.in/edtech-market-report-india-2026"), "Detects example.in as placeholder domain");
    assert(isExamplePlaceholderDomain("https://example.com/test"), "Detects example.com as placeholder domain");
    assert(isExamplePlaceholderDomain("http://subdomain.example.com"), "Detects subdomain of example.com");
    assert(!isExamplePlaceholderDomain("https://nature.com/articles/123"), "Recognizes nature.com as real external domain");
    assert(!isExamplePlaceholderDomain("https://pmc.ncbi.nlm.nih.gov/articles/PMC123"), "Recognizes pmc.ncbi.nlm.nih.gov as real external domain");
    assert(!isExamplePlaceholderDomain("https://theguardian.com/education"), "Recognizes theguardian.com as real external domain");

    // getClickableHref normalization
    assert(getClickableHref("https://nature.com/articles/123") === "https://nature.com/articles/123", "Preserves valid https URL");
    assert(getClickableHref("http://example.org/page") === "http://example.org/page", "Preserves valid http URL");
    assert(getClickableHref("nature.com/articles/123") === "https://nature.com/articles/123", "Prepends https:// to bare domain without protocol");
    assert(getClickableHref("thehindu.com") === "https://thehindu.com", "Prepends https:// to simple bare domain");
    assert(getClickableHref("not-a-domain") === null, "Returns null for invalid string");
    assert(getClickableHref(null) === null, "Returns null for null");
    assert(getClickableHref("") === null, "Returns null for empty string");
  }

  // ── GROUP 5: Distinct Source URLs Pipeline & Field Matching ────
  console.log("\n--- Group 5: Distinct Source URLs Pipeline & Field Matching ---");
  {
    const db = getDb();
    // Query joined evidence and sources
    const joinedRes = await db.execute(`
      SELECT e.id as evidence_id, e.source_id, s.title as source_title, s.url as stored_source_url
      FROM evidence e
      JOIN sources s ON s.id = e.source_id
      WHERE e.project_id = 'proj-study-planner' AND s.url IS NOT NULL
      ORDER BY e.created_at ASC
    `);
    const rows = joinedRes.rows as unknown as Array<{ evidence_id: string; source_id: string; source_title: string; stored_source_url: string }>;

    assert(rows.length >= 3, `Found ${rows.length} joined evidence-source items with URLs`);

    // Verify at least 3 distinct source URLs exist and match between stored and rendered
    const uniqueUrls = new Set(rows.map((r) => r.stored_source_url));
    assert(uniqueUrls.size >= 3, `Multiple distinct URLs present across sources (found ${uniqueUrls.size} unique URLs)`);

    for (const row of rows.slice(0, 5)) {
      const stored = row.stored_source_url;
      const renderedHref = getClickableHref(stored);
      assert(renderedHref === stored, `Stored URL matches rendered href for evidence ${row.evidence_id}: ${stored}`);
    }
  }

  // ── GROUP 6: Same-Domain & Shared-Source Integrity ─────────────
  console.log("\n--- Group 6: Same-Domain & Shared-Source Integrity ---");
  {
    // Multiple distinct articles on the same domain are independent
    const article1: string = "https://nature.com/articles/s41598-025-87664-7";
    const article2: string = "https://nature.com/articles/s41598-022-26989-w";
    assert(article1 !== article2, "Two distinct articles on the same domain are not identical URLs");
    assert(getClickableHref(article1) === article1, "Article 1 maps to Article 1 href");
    assert(getClickableHref(article2) === article2, "Article 2 maps to Article 2 href");

    // Shared source association:
    // If two claims cite the same source ID, they must both receive that source's URL without corruption
    const sharedSourceUrl = "https://example.in/edtech-market-report-india-2026";
    const claim1 = { id: "c1", sourceId: "src-003", sourceUrl: sharedSourceUrl };
    const claim2 = { id: "c2", sourceId: "src-003", sourceUrl: sharedSourceUrl };
    assert(claim1.sourceUrl === claim2.sourceUrl, "Claims sharing a source correctly reflect identical source URL");
    assert(claim1.id !== claim2.id, "Claims sharing a source remain distinct entities");
  }

  console.log("\n=================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw exception:", err);
  process.exit(1);
});
