/**
 * Regression Test Suite: Research Insights & Synthesis Integrity
 * Decision D21 & Post-Synthesis Integrity Audit
 *
 * Requirements covered:
 * 1. No duplicate normalized statements are persisted after synthesis.
 * 2. The 30-day free-trial sample claim appears at most once.
 * 3. Canonical insights ins-01 through ins-04 remain intact with contradiction/open-question roles.
 * 4. Placeholder-backed metrics cannot be promoted to verified real evidence.
 * 5. Real-source claims with valid evidence (e.g. 74% from RA Mary 2014) are NOT incorrectly quarantined.
 * 6. The Insights page, API, database, and report use consistent deduplicated records (10 records).
 * 7. Regenerating the report preserves deduplication, provenance labels, and Section 4 caveats.
 * 8. Repeated synthesis runs do not increase counts by inserting identical records (idempotent generation).
 * 9. Uses an isolated test database for destructive migration tests so live DB is never polluted.
 */

import { initDb, getDb } from "./src/lib/db";
import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import {
  normalizeInsightStatement,
  containsPlaceholderStatistics,
  isPlaceholderBackedInsight,
  sanitizeInsightStatement,
  sanitizeInsightCaveat,
  deduplicateInsights,
  PLACEHOLDER_EVIDENCE_IDS,
} from "./src/lib/insightValidation";

async function runTests() {
  console.log("========================================================");
  console.log("  IdeaProbe Research Insights & Synthesis Integrity Suite");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // ── Suite 1: Normalization & Metric Differentiation ───────────────
  console.log("── Suite 1: Normalization & Metric Differentiation ──");

  const s1 = "Students are willing to pay for auto-rescheduling after a 30-day trial.";
  const s2 = "  STUDENTS ARE WILLING TO PAY FOR AUTO-RESCHEDULING AFTER A 30-DAY TRIAL   ";
  const s3 = "[SAMPLE] Students are willing to pay for auto-rescheduling after a 30-day trial!";
  const s4 = "[Unverified Sample Claim — Demo Placeholder Metric] Students are willing to pay for auto-rescheduling after a 30-day trial.";

  assert(
    normalizeInsightStatement(s1) === normalizeInsightStatement(s2),
    "Normalized statement ignores whitespace and case differences"
  );
  assert(
    normalizeInsightStatement(s1) === normalizeInsightStatement(s3),
    "Normalized statement strips bracketed tags and punctuation"
  );
  assert(
    normalizeInsightStatement(s1) === normalizeInsightStatement(s4),
    "Normalized statement strips unverified sample claim prefixes"
  );

  // Demo fixture metrics
  assert(containsPlaceholderStatistics("68% of study sessions are cramming sessions."), "Identifies 68% as demo fixture metric");
  assert(containsPlaceholderStatistics("82% abandonment rate after 14 days without reminders."), "Identifies 82% as demo fixture metric");
  assert(containsPlaceholderStatistics("6x more monetized in K-12 than college segment."), "Identifies 6x as demo fixture metric");
  assert(!containsPlaceholderStatistics("Students prefer weekly mock exams over daily quizzes."), "Qualitative finding is not flagged as demo metric");

  // Real source statistics (e.g. 74% from RA Mary 2014 study) must NOT be blindly quarantined as demo fixtures
  assert(!containsPlaceholderStatistics("74% of board exam students experience moderate anxiety."), "74% from real research is not classified as an RFC 2606 demo fixture");

  // Evidence-aware placeholder detection
  const realSourceInsight = {
    id: "test-real",
    statement: "Evidence indicates that college students in India experience significant exam anxiety (74% moderate levels in board exam study).",
    provenance: "AI_INFERENCE",
    evidence_for_ids: ["ev-tf-1792841654165-0"],
    caveat: "Study evaluated board exam students; requires validation for college undergraduates.",
  };
  assert(!isPlaceholderBackedInsight(realSourceInsight), "Real source insight citing 74% study is NOT classified as placeholder-backed");
  assert(
    sanitizeInsightStatement(realSourceInsight.statement, false) === realSourceInsight.statement,
    "Real source statement is NOT prepended with [Unverified Sample Claim]"
  );
  assert(
    !sanitizeInsightCaveat(realSourceInsight.caveat, false)?.includes("RFC 2606"),
    "Real source caveat does NOT have RFC 2606 boilerplate appended"
  );

  const demoFixtureInsight = {
    id: "test-sample",
    statement: "68% of students cram before exams based on preliminary data.",
    provenance: "SAMPLE",
    evidence_for_ids: ["ev-001"],
  };
  assert(isPlaceholderBackedInsight(demoFixtureInsight), "Placeholder insight citing ev-001 / 68% is classified as placeholder-backed");
  assert(
    sanitizeInsightStatement(demoFixtureInsight.statement, true).startsWith("[Unverified Sample Claim"),
    "Demo fixture statement is quarantined with [Unverified Sample Claim] prefix"
  );
  assert(
    Boolean(sanitizeInsightCaveat(null, true)?.includes("RFC 2606")),
    "Demo fixture caveat attaches mandatory RFC 2606 warning"
  );

  // ── Suite 2: Persisted SQLite Database Integrity (Live Audit) ──────
  console.log("\n── Suite 2: Persisted SQLite Database Integrity (Live Audit) ──");
  await initDb();
  const db = getDb();

  const insightsRes = await db.execute({
    sql: "SELECT * FROM insights WHERE project_id = 'proj-study-planner' ORDER BY created_at ASC",
    args: [],
  });
  const currentInsights = insightsRes.rows as any[];
  console.log(`  Current distinct insights in DB: ${currentInsights.length}`);

  assert(currentInsights.length === 10, `Database contains exactly 10 distinct insights (got ${currentInsights.length})`);

  // Canonical insights 1 to 4
  const ins01 = currentInsights.find((i) => i.id === "ins-01");
  assert(Boolean(ins01 && ins01.statement.includes("zero-configuration onboarding")), "Canonical ins-01 intact (zero-configuration onboarding)");

  const ins02 = currentInsights.find((i) => i.id === "ins-02");
  assert(Boolean(ins02 && ins02.statement.includes("Auto-reschedule when sessions are missed")), "Canonical ins-02 intact (Auto-reschedule differentiator)");

  const ins03 = currentInsights.find((i) => i.id === "ins-03");
  assert(Boolean(ins03 && ins03.type === "contradiction" && ins03.statement.includes("Counter-signal")), "Canonical ins-03 intact (contradiction role)");

  const ins04 = currentInsights.find((i) => i.id === "ins-04");
  assert(Boolean(ins04 && ins04.type === "open_question" && ins04.statement.includes("Open question")), "Canonical ins-04 intact (open question role)");

  // 30-day trial willingness to pay sample claim
  const wtpClaims = currentInsights.filter((i) => i.statement.toLowerCase().includes("auto-rescheduling") && i.statement.toLowerCase().includes("30-day"));
  assert(wtpClaims.length === 1, `The 30-day free-trial sample claim appears exactly once (got ${wtpClaims.length})`);
  assert(wtpClaims[0].provenance === "SAMPLE", "30-day free-trial claim has SAMPLE provenance");
  assert(wtpClaims[0].confidence === "Low", "30-day free-trial claim has Low confidence");

  // Placeholder 68% cramming claim
  const cramClaims = currentInsights.filter((i) => i.statement.includes("68%"));
  assert(cramClaims.length === 1, "68% cramming claim appears exactly once");
  assert(cramClaims[0].statement.startsWith("[Unverified Sample Claim"), "68% cramming claim has [Unverified Sample Claim] prefix");
  assert(cramClaims[0].confidence === "Low", "68% cramming claim has Low confidence");

  // Real-source research claims (e.g. 74% study, freezing during exams) must NOT be quarantined
  const realAnxietyClaims = currentInsights.filter((i) => String(i.id).startsWith("insight-gen-") && !i.statement.includes("68%") && i.provenance === "AI_INFERENCE");
  assert(realAnxietyClaims.length >= 3, `Preserved distinct real-source exam anxiety insights (got ${realAnxietyClaims.length})`);
  const anyFalseQuarantine = realAnxietyClaims.some((i) => i.statement.includes("[Unverified Sample Claim") || (i.caveat && i.caveat.includes("RFC 2606")));
  assert(!anyFalseQuarantine, "Zero real-source research claims have false RFC 2606 quarantine banners");

  // ── Suite 3: Isolated Database Destructive Migration Test ─────────
  console.log("\n── Suite 3: Isolated Database Destructive Migration Test ──");
  const testDbPath = path.join(process.cwd(), ".ideaprobe-data", "test-isolated.db");
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  const testDb = createClient({ url: `file:${testDbPath}` });
  await testDb.execute(`
    CREATE TABLE insights (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      statement TEXT NOT NULL,
      type TEXT NOT NULL,
      confidence TEXT NOT NULL,
      evidence_for_ids TEXT,
      evidence_against_ids TEXT,
      caveat TEXT,
      provenance TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Insert base insight and 2 identical duplicates
  const baseStmt = "Students require a 30-day free trial before committing.";
  await testDb.execute({ sql: "INSERT INTO insights VALUES ('test-1', 'proj-1', ?, 'theme', 'Low', '[]', '[]', NULL, 'SAMPLE', datetime('now'))", args: [baseStmt] });
  await testDb.execute({ sql: "INSERT INTO insights VALUES ('test-2', 'proj-1', ?, 'theme', 'Low', '[]', '[]', NULL, 'SAMPLE', datetime('now'))", args: [baseStmt] });
  await testDb.execute({ sql: "INSERT INTO insights VALUES ('test-3', 'proj-1', ?, 'theme', 'Low', '[]', '[]', NULL, 'SAMPLE', datetime('now'))", args: [baseStmt] });

  const beforeDedup = await testDb.execute("SELECT id FROM insights WHERE project_id = 'proj-1'");
  assert(beforeDedup.rows.length === 3, "Isolated DB contains 3 rows before deduplication");

  // Run deduplication query
  await testDb.execute(`
    DELETE FROM insights
    WHERE id NOT IN (
      SELECT MIN(id) FROM insights GROUP BY project_id, LOWER(TRIM(statement))
    )
  `);

  const afterDedup = await testDb.execute("SELECT id FROM insights WHERE project_id = 'proj-1'");
  assert(afterDedup.rows.length === 1, `Isolated deduplication reduced 3 identical rows to exactly 1 (got ${afterDedup.rows.length})`);
  assert(afterDedup.rows[0].id === "test-1", "Kept earliest record test-1");

  // Clean up isolated DB
  if (typeof (testDb as any).close === "function") {
    (testDb as any).close();
  }
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  } catch (e) {
    // On Windows, SQLite might retain file lock until process exit
  }

  // ── Suite 4: Consistency Between API, Report, and Persistent DB ───
  console.log("\n── Suite 4: Consistency Between API, Report, and Persistent DB ──");

  // 1. GET /api/projects/proj-study-planner/insights
  const getInsightsRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/insights");
  assert(getInsightsRes.ok, `GET /insights returns HTTP 200 (got ${getInsightsRes.status})`);
  const getInsightsData = await getInsightsRes.json();
  const apiInsights = getInsightsData.data?.insights || [];
  assert(apiInsights.length === 10, `GET /insights returns exactly 10 insights (got ${apiInsights.length})`);

  const apiNormalized = apiInsights.map((i: any) => normalizeInsightStatement(i.statement));
  const uniqueApiNorms = new Set(apiNormalized);
  assert(uniqueApiNorms.size === 10, `All 10 API insights have unique normalized statements (got ${uniqueApiNorms.size})`);

  // 2. POST /api/projects/proj-study-planner/report
  const postReportRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/report", { method: "POST" });
  assert(postReportRes.ok, `POST /report returns HTTP 200/201 (got ${postReportRes.status})`);
  const postReportData = await postReportRes.json();
  const postSec4 = postReportData.data?.report?.content?.find((s: any) => s.id === "sec-insights");
  assert(Boolean(postSec4), "POST report contains Section 4 (sec-insights)");

  const postBlocks = postSec4?.content?.split("\n\n") || [];
  assert(postBlocks.length === 10, `POST report Section 4 contains exactly 10 items (got ${postBlocks.length})`);

  // 3. GET /api/projects/proj-study-planner/report
  const getReportRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/report");
  assert(getReportRes.ok, `GET /report returns HTTP 200 (got ${getReportRes.status})`);
  const getReportData = await getReportRes.json();
  const getSec4 = getReportData.data?.report?.content?.find((s: any) => s.id === "sec-insights");
  assert(Boolean(getSec4), "GET report contains Section 4 (sec-insights)");

  const getBlocks = getSec4?.content?.split("\n\n") || [];
  assert(getBlocks.length === 10, `GET report Section 4 contains exactly 10 items (got ${getBlocks.length})`);

  // Verify caveat warning on Section 4
  assert(
    Boolean(postSec4.caveat && postSec4.caveat.includes("unverified sample claims")),
    "Section 4 contains explicit warning against citing unverified sample claims"
  );

  // ── Suite 5: Idempotent Generation & Count Invariance ─────────────
  console.log("\n── Suite 5: Idempotent Generation & Count Invariance ──");

  // Call POST /insights/generate with an existing insight type ("theme")
  const genRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/insights/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ insightType: "theme" }),
  });
  assert(genRes.ok, `POST /insights/generate returns HTTP 200 (got ${genRes.status})`);

  // Query SQLite to verify total count remained at 10 (updated in-place rather than inserted duplicate row)
  const afterGenRes = await db.execute("SELECT id, statement FROM insights WHERE project_id = 'proj-study-planner'");
  assert(
    afterGenRes.rows.length === 10,
    `Persisted insights count remained invariant at exactly 10 after synthesis (got ${afterGenRes.rows.length})`
  );

  const afterGenNorms = (afterGenRes.rows as any[]).map((r) => normalizeInsightStatement(r.statement));
  const uniqueAfterGenNorms = new Set(afterGenNorms);
  assert(
    uniqueAfterGenNorms.size === 10,
    `Zero duplicate statements after repeated synthesis (${uniqueAfterGenNorms.size} unique / 10 total)`
  );

  // ── Summary ────────────────────────────────────────────────────────
  console.log(`\n========================================================`);
  console.log(`  Tests completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
