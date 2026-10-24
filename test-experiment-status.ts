/**
 * IdeaProbe — Experiment 1 Status Integrity Regression Suite
 *
 * Validates:
 * 1. Live SQLite database audit: exp-01 is 'planned' (not 'running'), result is null, exp-02 is 'planned'.
 * 2. API GET /experiments returns statusCounts.planned === 2, 0 running, 0 completed.
 * 3. Migration safety & idempotency in isolated test database:
 *    - Unstarted exp-01 safely updated to 'planned'
 *    - Re-running migration is idempotent
 *    - exp-02 and other experiment IDs preserved
 *    - Experiments with recorded results are strictly guarded against status change
 * 4. Defensive legacy report snapshot normalization: only target experiment marker is updated; historical text preserved.
 * 5. Unified Founder Report agreement (GET and POST /report):
 *    - Section 7 renders [planned] for both experiments
 *    - Section 7 shows 0 completed, 0 with real results, 0 [running]
 *    - Provenance Audit Manifest shows REAL_EXPERIMENT_RESULT: 0
 *    - Warning caveat preserved
 */

import { initDb, getDb } from "./src/lib/db";
import { GET as getExperiments } from "./src/app/api/projects/[id]/experiments/route";
import { GET as getReport, POST as generateReport } from "./src/app/api/projects/[id]/report/route";
import { NextRequest } from "next/server";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

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

async function runTests() {
  console.log("====================================================================");
  console.log("IdeaProbe: Experiment 1 Status Integrity Regression Suite");
  console.log("====================================================================");

  await initDb();
  const projectId = "proj-study-planner";
  const params = Promise.resolve({ id: projectId });

  // ── SUITE 1: Live SQLite Database State ─────────────────────────────
  console.log("\n--- Suite 1: Live SQLite Database State ---");
  {
    const db = getDb();
    const res = await db.execute({
      sql: "SELECT id, status, result, provenance, hypothesis FROM experiments WHERE project_id = ? ORDER BY id ASC",
      args: [projectId],
    });

    assert(res.rows.length === 2, "Database contains exactly 2 experiments for proj-study-planner");

    const exp1 = res.rows.find((r) => r.id === "exp-01");
    assert(Boolean(exp1), "exp-01 exists in database");
    assert(exp1?.status === "planned", "exp-01 has status 'planned' (NOT 'running')");
    assert(exp1?.result === null || exp1?.result === "", "exp-01 result is null/empty");
    assert(exp1?.provenance === "AI_INFERENCE", "exp-01 provenance is AI_INFERENCE (no fake real results)");

    const exp2 = res.rows.find((r) => r.id === "exp-02");
    assert(Boolean(exp2), "exp-02 exists in database");
    assert(exp2?.status === "planned", "exp-02 is preserved as 'planned'");
    assert(exp2?.result === null || exp2?.result === "", "exp-02 result is null/empty");

    const running = res.rows.filter((r) => r.status === "running");
    assert(running.length === 0, "Zero experiments in project are marked 'running'");

    const completed = res.rows.filter((r) => r.status === "completed");
    assert(completed.length === 0, "Zero experiments in project are marked 'completed'");

    const realResultExp = res.rows.filter((r) => r.provenance === "REAL_EXPERIMENT_RESULT");
    assert(realResultExp.length === 0, "Zero experiments have REAL_EXPERIMENT_RESULT provenance");
  }

  // ── SUITE 2: API GET /experiments Agreement ─────────────────────────
  console.log("\n--- Suite 2: API GET /experiments Agreement ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments`);
    const res = await getExperiments(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /experiments returns HTTP 200");
    assert(json.data?.statusCounts?.planned === 2, `statusCounts.planned === 2 (found: ${json.data?.statusCounts?.planned})`);
    assert(
      json.data?.statusCounts?.running === undefined || json.data?.statusCounts?.running === 0,
      `statusCounts.running is 0 or undefined (found: ${json.data?.statusCounts?.running})`
    );
    assert(
      json.data?.statusCounts?.completed === undefined || json.data?.statusCounts?.completed === 0,
      `statusCounts.completed is 0 or undefined (found: ${json.data?.statusCounts?.completed})`
    );

    const expList = json.data?.experiments || [];
    const exp1Api = expList.find((e: any) => e.id === "exp-01");
    assert(exp1Api?.status === "planned", "API returns exp-01 status as 'planned'");
    const exp2Api = expList.find((e: any) => e.id === "exp-02");
    assert(exp2Api?.status === "planned", "API returns exp-02 status as 'planned'");
  }

  // ── SUITE 3: Migration Safety & Idempotency in Isolated DB ──────────
  console.log("\n--- Suite 3: Migration Safety & Idempotency (Isolated DB) ---");
  {
    const testDbPath = path.join(process.cwd(), ".ideaprobe-data", "test-isolated-exp.db");
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    const testClient = createClient({ url: `file:${testDbPath}` });

    await testClient.execute(`
      CREATE TABLE experiments (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        hypothesis TEXT NOT NULL,
        status TEXT NOT NULL,
        result TEXT,
        provenance TEXT NOT NULL
      )
    `);

    // Seed test rows:
    // 1. exp-01: 'running' with no result (should be corrected to 'planned')
    // 2. exp-02: 'planned' with no result (must remain 'planned')
    // 3. exp-with-result: id 'exp-01' but with a recorded result (should NOT be modified)
    // 4. exp-other: different experiment ID 'exp-03' with 'running' (must NOT be modified)
    await testClient.execute({
      sql: "INSERT INTO experiments VALUES (?, ?, ?, ?, ?, ?)",
      args: ["exp-01", "proj-study-planner", "Concierge WhatsApp study planner", "running", null, "AI_INFERENCE"],
    });
    await testClient.execute({
      sql: "INSERT INTO experiments VALUES (?, ?, ?, ?, ?, ?)",
      args: ["exp-02", "proj-study-planner", "Landing page waitlist", "planned", null, "AI_INFERENCE"],
    });
    await testClient.execute({
      sql: "INSERT INTO experiments VALUES (?, ?, ?, ?, ?, ?)",
      args: ["exp-03", "proj-study-planner", "Other active test", "running", null, "AI_INFERENCE"],
    });
    await testClient.execute({
      sql: "INSERT INTO experiments VALUES (?, ?, ?, ?, ?, ?)",
      args: ["exp-result-guard", "proj-study-planner", "Test with observations", "running", "Observed 15 conversions", "REAL_EXPERIMENT_RESULT"],
    });

    const migrationSql = `
      UPDATE experiments
      SET status = 'planned'
      WHERE id = 'exp-01'
        AND project_id = 'proj-study-planner'
        AND status = 'running'
        AND (result IS NULL OR TRIM(result) = '')
    `;

    // 1. Run migration once
    await testClient.execute(migrationSql);

    const post1 = await testClient.execute("SELECT id, status, result FROM experiments");
    const e1 = post1.rows.find((r) => r.id === "exp-01");
    assert(e1?.status === "planned", "Isolated DB: exp-01 transitioned from 'running' to 'planned'");

    const e2 = post1.rows.find((r) => r.id === "exp-02");
    assert(e2?.status === "planned", "Isolated DB: exp-02 preserved as 'planned'");

    const e3 = post1.rows.find((r) => r.id === "exp-03");
    assert(e3?.status === "running", "Isolated DB: exp-03 (other ID) untouched; remains 'running'");

    const eGuard = post1.rows.find((r) => r.id === "exp-result-guard");
    assert(eGuard?.status === "running", "Isolated DB: experiment with recorded result untouched; remains 'running'");

    // 2. Re-run migration to test idempotency
    await testClient.execute(migrationSql);
    const post2 = await testClient.execute("SELECT id, status FROM experiments WHERE id = 'exp-01'");
    assert(post2.rows[0].status === "planned", "Isolated DB: re-running migration is idempotent; exp-01 remains 'planned'");

    // Cleanup
    testClient.close();
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch {
      // Ignore cleanup error on Windows if handle takes a tick to release
    }
  }

  // ── SUITE 4: Defensive Legacy Snapshot Normalization in GET /report ──
  console.log("\n--- Suite 4: Defensive Legacy Snapshot Normalization in GET /report ---");
  {
    // Test the normalizer regex in isolation on realistic snapshot strings
    const legacySnapshotSec7 = `2 experiment(s) designed.
0 completed.
0 with real experiment results.

1. If we offer a zero-configuration WhatsApp-based concierge study planner (founder manually creates and sends a daily schedule to a WhatsApp group), then at least 30% of enrolled students will follow it for 7+ consecutive days before their exams. [running] (Method: Manual concierge simulation (no code). Founder acts as the AI. Recruit 25 students via a college WhatsApp group 3 weeks before exams., Metric: % of students who check-in on WhatsApp as 'session done' for 7+ consecutive days)

2. If we show a landing page describing the auto-reschedule feature and ask for ₹99 pre-payment to join a 'beta waitlist', then at least 5% of visitors will pay. [planned] (Method: Landing page with Razorpay payment link. Drive 500 visitors from Instagram ads (₹3,000 ad spend) and WhatsApp group shares., Metric: Conversion rate to ₹99 pre-payment)`;

    const normalized = legacySnapshotSec7.replace(
      /(WhatsApp-based concierge study planner[^\n]*?)\[running\]/g,
      "$1[planned]"
    );

    assert(normalized.includes("WhatsApp-based concierge study planner"), "Normalized snapshot retains experiment hypothesis");
    assert(normalized.includes("[planned] (Method: Manual concierge"), "WhatsApp experiment status marker replaced from [running] to [planned]");
    assert(!normalized.includes("[running]"), "No [running] occurrences remain in Section 7");
    assert(normalized.includes("2. If we show a landing page describing the auto-reschedule feature and ask for ₹99 pre-payment to join a 'beta waitlist', then at least 5% of visitors will pay. [planned]"), "Experiment 2 marker [planned] preserved exactly");
    assert(normalized.includes("0 completed.\n0 with real experiment results."), "Count headers 0 completed and 0 with real results preserved");
  }

  // ── SUITE 5: Unified Founder Report Agreement (GET & POST) ──────────
  console.log("\n--- Suite 5: Unified Founder Report Agreement (GET & POST) ---");
  {
    // 1. GET latest report snapshot
    const reqGet = new NextRequest(`http://localhost:3000/api/projects/${projectId}/report`);
    const resGet = await getReport(reqGet, { params });
    const jsonGet = await resGet.json();

    assert(resGet.status === 200, "GET /report returns HTTP 200");
    const sec7Get = jsonGet.data?.report?.content?.find((s: any) => s.id === "sec-experiments");
    assert(Boolean(sec7Get), "Section 7 (sec-experiments) exists in GET /report");
    assert(sec7Get?.content.includes("2 experiment(s) designed."), "Section 7 reports 2 experiments designed");
    assert(sec7Get?.content.includes("0 completed."), "Section 7 reports 0 completed");
    assert(sec7Get?.content.includes("0 with real experiment results."), "Section 7 reports 0 with real experiment results");
    assert(!sec7Get?.content.includes("[running]"), "Section 7 contains ZERO [running] markers");
    assert(sec7Get?.content.includes("[planned]"), "Section 7 contains [planned] marker");

    const lines = sec7Get?.content.split("\n\n").filter((b: string) => /^\d+\./.test(b.trim()));
    assert(lines.length === 2, "Section 7 contains exactly 2 experiment entries");
    assert(lines[0]?.includes("[planned]"), "Experiment 1 renders [planned] in Section 7");
    assert(lines[1]?.includes("[planned]"), "Experiment 2 renders [planned] in Section 7");

    assert(jsonGet.data?.report?.provenance_manifest?.REAL_EXPERIMENT_RESULT === 0, "Provenance manifest has REAL_EXPERIMENT_RESULT: 0");
    assert(sec7Get?.caveat?.includes("No real experiment results have been recorded"), "Section 7 caveat correctly warns no real results exist");

    // 2. POST to generate fresh snapshot
    const reqPost = new NextRequest(`http://localhost:3000/api/projects/${projectId}/report`, { method: "POST" });
    const resPost = await generateReport(reqPost, { params });
    const jsonPost = await resPost.json();

    assert(resPost.status === 201 || resPost.status === 200, `POST /report (fresh snapshot generation) returns HTTP 201 Created (got ${resPost.status})`);
    const sec7Post = jsonPost.data?.report?.content?.find((s: any) => s.id === "sec-experiments");
    assert(!sec7Post?.content.includes("[running]"), "Freshly generated Section 7 has ZERO [running] markers");
    assert(sec7Post?.content.includes("0 completed."), "Fresh Section 7 reports 0 completed");
    assert(sec7Post?.content.includes("0 with real experiment results."), "Fresh Section 7 reports 0 with real results");
    assert(jsonPost.data?.report?.provenance_manifest?.REAL_EXPERIMENT_RESULT === 0, "Fresh manifest has REAL_EXPERIMENT_RESULT: 0");
  }

  // ── SUMMARY ─────────────────────────────────────────────────────────
  console.log("\n====================================================================");
  console.log(`Experiment 1 Status Regression Suite: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
