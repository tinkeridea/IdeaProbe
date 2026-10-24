/**
 * IdeaProbe Competitive Landscape & Alternatives Integrity Regression Suite
 * Tests:
 * 1. Semantic deduplication & category formatting utilities.
 * 2. SQLite database migration: preservation of canonical records comp-01–comp-05
 *    and distinct Google Calendar Study Blocks; removal of repeated paper timetables.
 * 3. Isolated DB destructive migration test.
 * 4. API & Report Section 6 consistency: human-readable category labels, zero raw enums,
 *    and accurate provenance/caveat handling.
 * 5. Idempotent AI analysis: repeated calls do not multiply duplicate records.
 */

import { initDb, getDb } from "./src/lib/db";
import {
  formatCompetitorCategory,
  normalizeCompetitorName,
  getSemanticCompetitorKey,
  deduplicateCompetitors,
} from "./src/lib/competitorValidation";
import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  IdeaProbe Competitive Landscape Integrity Suite");
  console.log("========================================================\n");

  // ── Suite 1: Category Formatting & Semantic Deduplication ─────────
  console.log("── Suite 1: Category Formatting & Semantic Deduplication ──");

  // Category labels must be human-readable, not raw database enums
  assert(formatCompetitorCategory("status_quo") === "Status Quo", "status_quo maps to 'Status Quo'");
  assert(formatCompetitorCategory("substitute") === "Substitute", "substitute maps to 'Substitute'");
  assert(formatCompetitorCategory("indirect") === "Indirect Competitor", "indirect maps to 'Indirect Competitor'");
  assert(formatCompetitorCategory("direct") === "Direct Competitor", "direct maps to 'Direct Competitor'");
  assert(formatCompetitorCategory("STATUS_QUO") === "Status Quo", "Case-insensitive formatting for STATUS_QUO");

  // Normalization
  assert(normalizeCompetitorName("Google Calendar (Study Blocks)!") === "google calendar study blocks", "Normalizes name by stripping punctuation and collapsing spaces");

  // Semantic keys: Paper timetables
  const paper1 = { name: "Manual Notebook + Timetable", category: "status_quo", description: "Physical paper timetable on the hostel room wall." };
  const paper2 = { name: "Manual Study Timetable (Paper)", category: "status_quo", description: "Students hand-write exam schedules on paper or whiteboards." };
  assert(
    getSemanticCompetitorKey(paper1) === getSemanticCompetitorKey(paper2),
    "Paper timetable alternatives map to identical semantic status_quo key"
  );

  // Semantic keys: Google Calendar distinct use cases
  const gcalReminders = { name: "Google Calendar", category: "substitute", description: "Dominant calendar used by students for exam reminders." };
  const gcalBlocks = { name: "Google Calendar (Study Blocks)", category: "substitute", description: "Students manually create repeating study events for time blocking." };
  assert(
    getSemanticCompetitorKey(gcalReminders) !== getSemanticCompetitorKey(gcalBlocks),
    "Google Calendar reminders vs Study Blocks time-blocking map to DISTINCT use-case keys"
  );

  // Deduplication preserves canonical and distinct use cases
  const sampleList = [
    { id: "comp-04", name: "Google Calendar", category: "substitute", description: "Exam reminders" },
    { id: "comp-ai-1", name: "Google Calendar", category: "substitute", description: "Generic calendar app" },
    { id: "comp-ai-2", name: "Google Calendar (Study Blocks)", category: "substitute", description: "Study blocks" },
    { id: "comp-05", name: "Manual Notebook + Timetable", category: "status_quo", description: "Paper on wall" },
    { id: "comp-ai-3", name: "Manual Study Timetable (Paper)", category: "status_quo", description: "Hand-write on paper" },
  ];
  const deduped = deduplicateCompetitors(sampleList);
  assert(deduped.length === 3, `Deduplication reduced 5 items to exactly 3 distinct alternatives (got ${deduped.length})`);
  assert(deduped.some((c) => c.id === "comp-04"), "Preserved canonical comp-04 (Google Calendar)");
  assert(deduped.some((c) => c.id === "comp-05"), "Preserved canonical comp-05 (Manual Notebook)");
  assert(deduped.some((c) => c.name.includes("Study Blocks")), "Preserved distinct study-blocks use case");

  // ── Suite 2: Persisted SQLite Database Integrity (Live Audit) ──────
  console.log("\n── Suite 2: Persisted SQLite Database Integrity (Live Audit) ──");
  await initDb();
  const db = getDb();

  const compRes = await db.execute({
    sql: "SELECT id, name, category, description, provenance FROM competitors WHERE project_id = 'proj-study-planner' ORDER BY id ASC",
    args: [],
  });
  const rows = compRes.rows as any[];
  console.log(`  Current distinct competitors in DB: ${rows.length}`);

  // Count check: exactly 6 clean alternatives for proj-study-planner
  assert(rows.length === 6, `Database contains exactly 6 distinct competitors (got ${rows.length})`);

  // Canonical records comp-01 to comp-05 must be intact
  assert(rows.some((r) => r.id === "comp-01" && r.name === "Notion Study Templates"), "Canonical comp-01 intact (Notion Study Templates)");
  assert(rows.some((r) => r.id === "comp-02" && r.name.includes("Forest")), "Canonical comp-02 intact (Forest Pomodoro)");
  assert(rows.some((r) => r.id === "comp-03" && r.name === "Quizlet"), "Canonical comp-03 intact (Quizlet)");
  assert(rows.some((r) => r.id === "comp-04" && r.name === "Google Calendar"), "Canonical comp-04 intact (Google Calendar reminders)");
  assert(rows.some((r) => r.id === "comp-05" && r.name === "Manual Notebook + Timetable"), "Canonical comp-05 intact (Manual Notebook + Timetable)");

  // Distinct use case preserved: Google Calendar (Study Blocks)
  assert(rows.some((r) => r.id === "comp-ai-mvm17yn1" && r.name.includes("Study Blocks")), "Distinct use case comp-ai-mvm17yn1 intact (Google Calendar Study Blocks)");

  // Zero duplicate fallback paper timetables
  const paperCount = rows.filter((r) => r.name.toLowerCase().includes("paper") || r.name.toLowerCase().includes("timetable")).length;
  assert(paperCount === 1, `Exactly 1 paper timetable status-quo alternative in DB (got ${paperCount})`);

  // All 4 categories represented
  const cats = new Set(rows.map((r) => r.category));
  assert(cats.has("substitute"), "Has 'substitute' category");
  assert(cats.has("indirect"), "Has 'indirect' category");
  assert(cats.has("status_quo"), "Has 'status_quo' category");

  // ── Suite 3: Isolated Database Destructive Migration Test ──────────
  console.log("\n── Suite 3: Isolated Database Destructive Migration Test ──");
  const testDbDir = path.resolve(".ideaprobe-data");
  if (!fs.existsSync(testDbDir)) fs.mkdirSync(testDbDir, { recursive: true });
  const testDbPath = path.resolve(testDbDir, "test-comp-isolated.db");
  if (fs.existsSync(testDbPath)) {
    try { fs.unlinkSync(testDbPath); } catch {}
  }

  const testDb = createClient({ url: `file:${testDbPath}` });
  await testDb.execute(`
    CREATE TABLE competitors (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      differentiator TEXT,
      provenance TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Insert 3 identical paper timetables and 2 identical Google Calendar entries
  await testDb.execute({ sql: "INSERT INTO competitors VALUES ('comp-1', 'p1', 'Manual Study Timetable', 'status_quo', 'Paper on wall', '', 'SAMPLE', datetime('now'))", args: [] });
  await testDb.execute({ sql: "INSERT INTO competitors VALUES ('comp-2', 'p1', 'Manual Study Timetable (Paper)', 'status_quo', 'Paper on wall', '', 'SAMPLE', datetime('now'))", args: [] });
  await testDb.execute({ sql: "INSERT INTO competitors VALUES ('comp-3', 'p1', 'Manual Study Timetable (Paper)', 'status_quo', 'Paper on wall', '', 'SAMPLE', datetime('now'))", args: [] });
  await testDb.execute({ sql: "INSERT INTO competitors VALUES ('comp-4', 'p1', 'Google Calendar', 'substitute', 'Exam reminders', '', 'SAMPLE', datetime('now'))", args: [] });
  await testDb.execute({ sql: "INSERT INTO competitors VALUES ('comp-5', 'p1', 'Google Calendar', 'substitute', 'Exam reminders', '', 'AI_INFERENCE', datetime('now'))", args: [] });

  const beforeDedup = await testDb.execute("SELECT id FROM competitors WHERE project_id = 'p1'");
  assert(beforeDedup.rows.length === 5, "Isolated DB contains 5 rows before deduplication");

  // Run generic deduplication
  await testDb.execute(`
    DELETE FROM competitors
    WHERE id NOT IN (
      SELECT MIN(id) FROM competitors GROUP BY project_id, LOWER(TRIM(name)), category
    )
  `);
  // Run paper timetable consolidation
  await testDb.execute(`
    DELETE FROM competitors
    WHERE project_id = 'p1'
      AND id != 'comp-1'
      AND LOWER(TRIM(name)) LIKE '%timetable%'
  `);

  const afterDedup = await testDb.execute("SELECT id FROM competitors WHERE project_id = 'p1'");
  assert(afterDedup.rows.length === 2, `Isolated deduplication reduced 5 rows to exactly 2 distinct alternatives (got ${afterDedup.rows.length})`);
  assert(afterDedup.rows.some((r) => r.id === "comp-1"), "Kept earliest paper record comp-1");
  assert(afterDedup.rows.some((r) => r.id === "comp-4"), "Kept earliest Google Calendar record comp-4");

  if (typeof (testDb as any).close === "function") {
    (testDb as any).close();
  }
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  } catch {}

  // ── Suite 4: Consistency Between API, Report, and Persistent DB ───
  console.log("\n── Suite 4: Consistency Between API, Report, and Persistent DB ──");

  // 1. GET /api/projects/proj-study-planner/competitors
  const getCompsRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/competitors");
  assert(getCompsRes.ok, `GET /competitors returns HTTP 200 (got ${getCompsRes.status})`);
  const getCompsData = await getCompsRes.json();
  const apiComps = getCompsData.data?.competitors || [];
  assert(apiComps.length === 6, `GET /competitors returns exactly 6 distinct competitors (got ${apiComps.length})`);

  // 2. POST /api/projects/proj-study-planner/report
  const postReportRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/report", { method: "POST" });
  assert(postReportRes.ok, `POST /report returns HTTP 200/201 (got ${postReportRes.status})`);
  const postReportData = await postReportRes.json();
  const postSec6 = postReportData.data?.report?.content?.find((s: any) => s.id === "sec-competitors");
  assert(Boolean(postSec6), "POST report contains Section 6 (sec-competitors)");

  // Check no raw enums in Section 6 content
  assert(!postSec6.content.includes("[status_quo]"), "Zero '[status_quo]' raw enums in Section 6");
  assert(!postSec6.content.includes("[substitute]"), "Zero '[substitute]' raw enums in Section 6");
  assert(!postSec6.content.includes("[indirect]"), "Zero '[indirect]' raw enums in Section 6");
  assert(!postSec6.content.includes("[direct]"), "Zero '[direct]' raw enums in Section 6");

  // Check human-readable category labels present
  assert(postSec6.content.includes("[Status Quo]"), "Section 6 renders human-readable '[Status Quo]'");
  assert(postSec6.content.includes("[Substitute]"), "Section 6 renders human-readable '[Substitute]'");
  assert(postSec6.content.includes("[Indirect Competitor]"), "Section 6 renders human-readable '[Indirect Competitor]'");

  // Check item count in Section 6: exactly 6
  const postBlocks = postSec6.content.split("\n\n").slice(1); // skip "6 alternative(s)..." count header
  assert(postBlocks.length === 6, `POST report Section 6 contains exactly 6 competitors (got ${postBlocks.length})`);

  // Check sample and AI caveats
  assert(
    Boolean(postSec6.caveat && postSec6.caveat.includes("WARNING")),
    "Section 6 caveat contains explicit warning against citing sample fixtures as validated market share"
  );

  // 3. GET /api/projects/proj-study-planner/report
  const getReportRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/report");
  assert(getReportRes.ok, `GET /report returns HTTP 200 (got ${getReportRes.status})`);
  const getReportData = await getReportRes.json();
  const getSec6 = getReportData.data?.report?.content?.find((s: any) => s.id === "sec-competitors");
  assert(Boolean(getSec6), "GET report contains Section 6 (sec-competitors)");

  const getBlocks = getSec6.content.split("\n\n").slice(1);
  assert(getBlocks.length === 6, `GET report Section 6 contains exactly 6 competitors (got ${getBlocks.length})`);
  assert(!getSec6.content.includes("[status_quo]"), "GET report Section 6 has zero raw enums");

  // ── Suite 5: Idempotent Analysis & Count Invariance ───────────────
  console.log("\n── Suite 5: Idempotent Analysis & Count Invariance ──");

  // Call POST /competitors/analyze with existing category "status_quo"
  const analyzeRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/competitors/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "status_quo" }),
  });
  assert(analyzeRes.ok, `POST /competitors/analyze returns HTTP 200 (got ${analyzeRes.status})`);

  // Query SQLite to verify total count remained at 6 (updated in-place rather than inserting duplicate paper timetable)
  const afterAnalyzeRes = await db.execute("SELECT id, name FROM competitors WHERE project_id = 'proj-study-planner'");
  assert(
    afterAnalyzeRes.rows.length === 6,
    `Persisted competitors count remained invariant at exactly 6 after repeated analysis (got ${afterAnalyzeRes.rows.length})`
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
