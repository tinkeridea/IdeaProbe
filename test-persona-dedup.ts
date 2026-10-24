/**
 * Regression Test Suite: Customer Persona Deduplication & Idempotent Generation
 * Decision D20 / Bugfix: Duplicate Customer Persona Issue
 */

import { initDb, getDb } from "./src/lib/db";

async function runTests() {
  console.log("=== Running Persona Deduplication Regression Tests ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // ── 1. Database table state & preservation check ──────────────────
  await initDb();
  const db = getDb();

  const personasRes = await db.execute({
    sql: "SELECT id, project_id, name, provenance, segment, context FROM personas WHERE project_id = ? ORDER BY created_at ASC",
    args: ["proj-study-planner"],
  });

  const personas = personasRes.rows as any[];
  const baseCount = personas.length;
  console.log(`Current personas in DB for proj-study-planner: ${personas.length}`);

  assert(personas.length >= 3, `Database contains at least 3 distinct personas (got ${personas.length})`);

  const ids = personas.map((p) => p.id);
  const uniqueIds = new Set(ids);
  assert(uniqueIds.size === personas.length, "All persona IDs in DB are unique");

  const names = personas.map((p) => p.name);
  const uniqueNames = new Set(names.map((n) => n.toLowerCase()));
  assert(uniqueNames.size === personas.length, "All persona names in DB are unique");

  const arjun = personas.find((p) => p.id === "persona-01");
  assert(Boolean(arjun && arjun.name === "Arjun Sharma" && arjun.provenance === "SIMULATED"), "Preserved Arjun Sharma (persona-01, SIMULATED)");

  const priya = personas.find((p) => p.id === "persona-02");
  assert(Boolean(priya && priya.name === "Priya Nair" && priya.provenance === "SIMULATED"), "Preserved Priya Nair (persona-02, SIMULATED)");

  const dualTrack = personas.find((p) => p.name === "Dual-Track Exam Student");
  assert(Boolean(dualTrack && dualTrack.provenance === "SAMPLE"), "Preserved Dual-Track Exam Student (SAMPLE hypothesis)");

  // ── 2. Test Idempotent DB Migration Cleanup (Simulate duplicate insertion) ──
  console.log("\nTesting DB deduplication migration when duplicate rows exist...");
  // Simulate the bug by inserting 2 duplicate rows of Dual-Track Exam Student with new timestamp IDs
  const dupId1 = `persona-gen-${Date.now()}`;
  const dupId2 = `persona-gen-${Date.now() + 10}`;
  await db.execute({
    sql: `INSERT INTO personas (id, project_id, name, segment, context, provenance, created_at)
          VALUES (?, 'proj-study-planner', 'Dual-Track Exam Student', 'Duplicate segment', 'Duplicate context', 'SAMPLE', datetime('now'))`,
    args: [dupId1],
  });
  await db.execute({
    sql: `INSERT INTO personas (id, project_id, name, segment, context, provenance, created_at)
          VALUES (?, 'proj-study-planner', 'Dual-Track Exam Student', 'Duplicate segment 2', 'Duplicate context 2', 'SAMPLE', datetime('now'))`,
    args: [dupId2],
  });

  const withDups = await db.execute("SELECT id FROM personas WHERE project_id = 'proj-study-planner'");
  assert(withDups.rows.length === baseCount + 2, `Simulated duplicate insertion created ${baseCount + 2} rows (got ${withDups.rows.length})`);

  // Run deduplication query (same as in initDb())
  await db.execute(`
    DELETE FROM personas
    WHERE id NOT IN (
      SELECT MIN(id) FROM personas GROUP BY project_id, LOWER(name)
    )
  `);

  const afterCleanup = await db.execute("SELECT id, name FROM personas WHERE project_id = 'proj-study-planner'");
  assert(afterCleanup.rows.length === baseCount, `Deduplication migration reduced rows back to exactly ${baseCount} (got ${afterCleanup.rows.length})`);
  assert(afterCleanup.rows.some((r) => r.id === "persona-01"), "Arjun Sharma still present after cleanup");
  assert(afterCleanup.rows.some((r) => r.id === "persona-02"), "Priya Nair still present after cleanup");
  assert(afterCleanup.rows.some((r) => r.name === "Dual-Track Exam Student"), "Dual-Track Exam Student still present after cleanup");

  // ── 3. HTTP GET /api/projects/[id]/personas ────────────────────────
  console.log("\nTesting HTTP GET /api/projects/proj-study-planner/personas...");
  const getRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/personas");
  assert(getRes.ok, `GET /api/projects/proj-study-planner/personas returns HTTP 200 (got ${getRes.status})`);

  const getData = await getRes.json();
  const apiPersonas = getData.data?.personas || [];
  assert(apiPersonas.length === baseCount, `API returns exactly ${baseCount} personas (got ${apiPersonas.length})`);

  const apiNames = apiPersonas.map((p: any) => p.name.toLowerCase());
  const apiUniqueNames = new Set(apiNames);
  assert(apiUniqueNames.size === apiPersonas.length, "API persona list contains no duplicate names");

  const apiIds = apiPersonas.map((p: any) => p.id);
  const apiUniqueIds = new Set(apiIds);
  assert(apiUniqueIds.size === apiPersonas.length, "API persona list contains no duplicate IDs");

  // ── 4. Unified Founder Report Deduplication ────────────────────────
  console.log("\nTesting Unified Founder Report deduplication...");
  const reportPostRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/report", {
    method: "POST",
  });
  assert(reportPostRes.ok, `POST /report returns HTTP 201/200 (got ${reportPostRes.status})`);

  const reportPostData = await reportPostRes.json();
  const reportSections = reportPostData.data?.report?.content || [];
  const personaSec = reportSections.find((s: any) => s.id === "sec-personas");
  assert(Boolean(personaSec), "Report contains sec-personas section");

  if (personaSec) {
    const lines = personaSec.content.split("\n\n");
    console.log(`sec-personas items count: ${lines.length}`);
    console.log("Report personas section content:\n" + personaSec.content);
    assert(lines.length === baseCount, `sec-personas contains exactly ${baseCount} personas (got ${lines.length})`);
    
    // Check no duplicate names in report content
    const reportedNames = lines.map((l: string) => {
      const match = l.match(/^\d+\.\s+([^—]+)—/);
      return match ? match[1].trim().toLowerCase() : l;
    });
    const uniqueReportedNames = new Set(reportedNames);
    assert(uniqueReportedNames.size === lines.length, "Report persona section contains zero duplicate persona names");
  }

  // Check GET /report as well
  const reportGetRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/report");
  assert(reportGetRes.ok, `GET /report returns HTTP 200 (got ${reportGetRes.status})`);
  const reportGetData = await reportGetRes.json();
  const getPersonaSec = (reportGetData.data?.report?.content || []).find((s: any) => s.id === "sec-personas");
  if (getPersonaSec) {
    const getLines = getPersonaSec.content.split("\n\n");
    assert(getLines.length === baseCount, `GET /report sec-personas contains exactly ${baseCount} personas (got ${getLines.length})`);
  }

  // ── 5. Project Counts in GET /api/projects/[id] ────────────────────
  console.log("\nTesting project summary counts...");
  const projRes = await fetch("http://localhost:3001/api/projects/proj-study-planner");
  assert(projRes.ok, "GET /api/projects/proj-study-planner returns HTTP 200");
  const projData = await projRes.json();
  assert(projData.data?.counts?.persona_count === baseCount, `Project persona_count is ${baseCount} (got ${projData.data?.counts?.persona_count})`);

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
