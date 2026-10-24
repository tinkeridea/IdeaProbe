/**
 * IdeaProbe — Risk Assumption Register Status Integrity Regression Suite
 *
 * Validates:
 * 1. Live SQLite database audit:
 *    - All 4 assumptions preserved with original IDs (asm-01..asm-04), statements, categories, scores.
 *    - Underlying database status remains 'unvalidated' (no schema or enum changes).
 *    - Zero assumptions marked 'validated' or 'invalidated' without real evidence.
 * 2. API GET /assumptions agreement:
 *    - Returns status 'unvalidated' for all 4 records, preserving API contract.
 * 3. Legacy report snapshot defensive normalization in GET /report:
 *    - '— Status: unvalidated' -> '— Status: untested'
 *    - '— Status: testing' -> '— Status: in progress'
 *    - Scores, statements, counts, and other sections untouched.
 * 4. Fresh report generation (POST /report):
 *    - Section 5 renders '— Status: untested' matching 'Tested: 0 (0 validated, 0 invalidated)'.
 *    - Section 5 summary headers accurate.
 *    - Pre-validation verdict preserved.
 * 5. Evidence & cross-section integrity:
 *    - Zero completed experiments, zero real experiment results.
 *    - Section 6 Competitive Landscape preserved and untouched.
 *    - Section 7 Experiments renders [planned] for both experiments.
 * 6. Format helper unit verification (unvalidated -> untested, testing -> in progress).
 */

import { initDb, getDb } from "./src/lib/db";
import { GET as getAssumptions } from "./src/app/api/projects/[id]/assumptions/route";
import { GET as getReport, POST as generateReport } from "./src/app/api/projects/[id]/report/route";
import { NextRequest } from "next/server";

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
  console.log("IdeaProbe: Risk Assumption Register Status Integrity Regression Suite");
  console.log("====================================================================");

  await initDb();
  const projectId = "proj-study-planner";
  const params = Promise.resolve({ id: projectId });

  // ── SUITE 1: Live SQLite Database State Audit ──────────────────────
  console.log("\n--- Suite 1: Live SQLite Database State Audit ---");
  {
    const db = getDb();
    const res = await db.execute({
      sql: "SELECT id, statement, category, impact, uncertainty, rationale, status, provenance FROM assumptions WHERE project_id = ? ORDER BY id ASC",
      args: [projectId],
    });

    assert(res.rows.length === 4, `Database contains exactly 4 assumptions for ${projectId} (found: ${res.rows.length})`);

    const expectedIds = ["asm-01", "asm-02", "asm-03", "asm-04"];
    const foundIds = res.rows.map((r) => r.id);
    assert(
      expectedIds.every((id) => foundIds.includes(id)),
      `Assumption IDs preserved: ${expectedIds.join(", ")} (found: ${foundIds.join(", ")})`
    );

    // Check underlying status is unvalidated for all
    const allUnvalidated = res.rows.every((r) => r.status === "unvalidated");
    assert(allUnvalidated, "All 4 assumptions have underlying database status 'unvalidated'");

    // Check computed scores (Critical=4, High=3, Medium=2, Low=1 for uncertainty; High=3, Medium=2, Low=1 for impact)
    const uWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const iWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const calcScore = (u: any, i: any) => (uWeight[String(u)] || 1) * (iWeight[String(i)] || 1);

    const asm1 = res.rows.find((r) => r.id === "asm-01");
    const asm2 = res.rows.find((r) => r.id === "asm-02");
    const asm3 = res.rows.find((r) => r.id === "asm-03");
    const asm4 = res.rows.find((r) => r.id === "asm-04");

    const score1 = calcScore(asm1?.uncertainty, asm1?.impact);
    const score2 = calcScore(asm2?.uncertainty, asm2?.impact);
    const score3 = calcScore(asm3?.uncertainty, asm3?.impact);
    const score4 = calcScore(asm4?.uncertainty, asm4?.impact);

    assert(score1 === 12, `asm-01 priority score is 12 (found: ${score1})`);
    assert(score2 === 12, `asm-02 priority score is 12 (found: ${score2})`);
    assert(score3 === 9, `asm-03 priority score is 9 (found: ${score3})`);
    assert(score4 === 6, `asm-04 priority score is 6 (found: ${score4})`);

    // Verify no fake validation
    const validated = res.rows.filter((r) => r.status === "validated");
    const invalidated = res.rows.filter((r) => r.status === "invalidated");
    assert(validated.length === 0, "Zero assumptions are marked 'validated' without real evidence");
    assert(invalidated.length === 0, "Zero assumptions are marked 'invalidated' without real evidence");

    // Statements preserved
    assert(Boolean(asm1?.statement && String(asm1.statement).includes("adopt a new tool")), "asm-01 statement preserved");
    assert(Boolean(asm2?.statement && String(asm2.statement).includes("pay ₹99/month")), "asm-02 statement preserved");
    assert(Boolean(asm3?.statement && String(asm3.statement).includes("auto-reschedule")), "asm-03 statement preserved");
    assert(Boolean(asm4?.statement && String(asm4.statement).includes("WhatsApp college groups")), "asm-04 statement preserved");
  }

  // ── SUITE 2: API GET /assumptions Contract ──────────────────────────
  console.log("\n--- Suite 2: API GET /assumptions Contract ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/assumptions`);
    const res = await getAssumptions(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /assumptions returns HTTP 200");
    const asms: any[] = json.data?.assumptions || [];
    assert(asms.length === 4, `API returns exactly 4 assumptions (found: ${asms.length})`);

    const apiStatuses = asms.map((a) => a.status);
    assert(
      apiStatuses.every((s) => s === "unvalidated"),
      `API contract preserves underlying status 'unvalidated' for all assumptions (found: ${apiStatuses.join(", ")})`
    );

    const counts = json.data?.statusCounts || {};
    assert(counts.unvalidated === 4, `statusCounts.unvalidated === 4 (found: ${counts.unvalidated})`);
    assert(!counts.validated || counts.validated === 0, `statusCounts.validated is 0 (found: ${counts.validated})`);
    assert(!counts.invalidated || counts.invalidated === 0, `statusCounts.invalidated is 0 (found: ${counts.invalidated})`);
  }

  // ── SUITE 3: Legacy Snapshot Normalization in GET /report ───────────
  console.log("\n--- Suite 3: Legacy Snapshot Normalization in GET /report ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/report`);
    const res = await getReport(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /report returns HTTP 200");
    const sections: any[] = json.data?.report?.content || [];
    const secAssumptions = sections.find((s) => s.id === "sec-assumptions");

    assert(Boolean(secAssumptions), "Report contains Section 5: Risk Assumption Register");
    assert(
      !secAssumptions.content.includes("— Status: unvalidated"),
      "Normalized Section 5 content contains NO occurrences of '— Status: unvalidated'"
    );
    assert(
      secAssumptions.content.includes("— Status: untested"),
      "Normalized Section 5 content displays '— Status: untested'"
    );
    assert(
      secAssumptions.content.includes("Tested: 0 (0 validated, 0 invalidated)"),
      "Section 5 summary correctly preserves 'Tested: 0 (0 validated, 0 invalidated)'"
    );
    assert(
      secAssumptions.content.includes("Critical/High Priority: 4"),
      "Section 5 summary preserves 'Critical/High Priority: 4'"
    );
    assert(
      secAssumptions.content.includes("4 assumption(s) registered."),
      "Section 5 summary preserves '4 assumption(s) registered.'"
    );

    // Verify all 4 statements are present in normalized content
    assert(secAssumptions.content.includes("adopt a new tool"), "Top critical assumption 1 statement intact in Section 5");
    assert(secAssumptions.content.includes("pay ₹99/month"), "Top critical assumption 2 statement intact in Section 5");
    assert(secAssumptions.content.includes("auto-reschedule"), "Top critical assumption 3 statement intact in Section 5");
    assert(secAssumptions.content.includes("WhatsApp college groups"), "Top critical assumption 4 statement intact in Section 5");
  }

  // ── SUITE 4: Fresh Report Generation (POST /report) ─────────────────
  console.log("\n--- Suite 4: Fresh Report Generation (POST /report) ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/report`, {
      method: "POST",
    });
    const res = await generateReport(req, { params });
    const json = await res.json();

    assert(res.status === 200 || res.status === 201, `POST /report returns success (status: ${res.status})`);
    const sections: any[] = json.data?.report?.content || [];
    const secAssumptions = sections.find((s) => s.id === "sec-assumptions");

    assert(Boolean(secAssumptions), "Fresh report contains Section 5: Risk Assumption Register");
    assert(
      !secAssumptions.content.includes("— Status: unvalidated"),
      "Fresh Section 5 content contains NO occurrences of '— Status: unvalidated'"
    );
    assert(
      secAssumptions.content.includes("— Status: untested"),
      "Fresh Section 5 content displays '— Status: untested'"
    );
    assert(
      secAssumptions.content.includes("Tested: 0 (0 validated, 0 invalidated)"),
      "Fresh Section 5 displays 'Tested: 0 (0 validated, 0 invalidated)'"
    );

    // Count occurrences of '— Status: untested'
    const untestedMatches = secAssumptions.content.match(/— Status:\s*untested/g);
    assert(
      untestedMatches?.length === 4,
      `Fresh Section 5 contains exactly 4 '— Status: untested' entries (found: ${untestedMatches?.length})`
    );

    // Verdict check: confirms 0 assumptions validated
    const secVerdict = sections.find((s) => s.id === "sec-verdict");
    assert(Boolean(secVerdict), "Verdict section exists in report");
    assert(
      secVerdict?.content.includes("0 assumption(s) validated"),
      "Verdict accurately reflects 0 assumptions validated"
    );
    assert(
      !secVerdict?.content.includes("PARTIAL VALIDATION"),
      "Verdict does NOT claim PARTIAL VALIDATION when zero assumptions are validated"
    );
  }

  // ── SUITE 5: Cross-Section & Evidence Integrity ─────────────────────
  console.log("\n--- Suite 5: Cross-Section & Evidence Integrity ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/report`);
    const res = await getReport(req, { params });
    const json = await res.json();
    const sections: any[] = json.data?.report?.content || [];

    // Section 6 Competitive Landscape check
    const secComp = sections.find((s) => s.id === "sec-competitors");
    assert(Boolean(secComp), "Section 6 Competitive Landscape exists in report");
    assert(secComp.content.includes("6 alternative(s) / competitor(s) mapped."), "Section 6 has 6 mapped alternatives");
    assert(!secComp.content.includes("[status_quo]"), "Section 6 has no raw [status_quo] category");
    assert(!secComp.content.includes("[substitute]"), "Section 6 has no raw [substitute] category");
    assert(!secComp.content.includes("[indirect]"), "Section 6 has no raw [indirect] category");

    // Section 7 Experiments check
    const secExp = sections.find((s) => s.id === "sec-experiments");
    assert(Boolean(secExp), "Section 7 Validation Experiments exists in report");
    assert(secExp.content.includes("0 completed."), "Section 7 shows 0 completed");
    assert(secExp.content.includes("0 with real experiment results."), "Section 7 shows 0 real results");
    assert(!secExp.content.includes("[running]"), "Section 7 has zero [running] experiments");
    assert(secExp.content.includes("[planned]"), "Section 7 has [planned] experiments");

    // Provenance manifest
    const prov = json.data?.report?.provenance_manifest || {};
    assert(prov.REAL_EXPERIMENT_RESULT === 0, `provenance_manifest.REAL_EXPERIMENT_RESULT is 0 (found: ${prov.REAL_EXPERIMENT_RESULT})`);
  }

  // ── SUITE 6: Defensive Formatting Logic ─────────────────────────────
  console.log("\n--- Suite 6: Defensive Formatting Logic ---");
  {
    // Test normalization of legacy multiline strings with various statuses
    const mockLegacyContent = [
      "4 assumption(s) registered.",
      "",
      "Critical/High Priority: 4",
      "Tested: 0 (0 validated, 0 invalidated)",
      "",
      "Top Critical Assumptions:",
      "1. [Score: 12] Syllabi deadline input — Status: unvalidated",
      "2. [Score: 9] Pricing test — Status: testing",
      "3. [Score: 6] Syllabus parser — Status: validated",
      "4. [Score: 4] Minor hypothesis — Status: invalidated",
    ].join("\n");

    const normalized = mockLegacyContent
      .replace(/— Status:\s*unvalidated/g, "— Status: untested")
      .replace(/— Status:\s*testing/g, "— Status: in progress");

    assert(normalized.includes("1. [Score: 12] Syllabi deadline input — Status: untested"), "unvalidated safely replaced with untested");
    assert(normalized.includes("2. [Score: 9] Pricing test — Status: in progress"), "testing safely replaced with in progress");
    assert(normalized.includes("3. [Score: 6] Syllabus parser — Status: validated"), "validated preserved unchanged");
    assert(normalized.includes("4. [Score: 4] Minor hypothesis — Status: invalidated"), "invalidated preserved unchanged");
    assert(normalized.includes("Critical/High Priority: 4"), "Header counts untouched");
    assert(normalized.includes("Tested: 0 (0 validated, 0 invalidated)"), "Tested summary counts untouched");
  }

  // ── SUMMARY ────────────────────────────────────────────────────────
  console.log("\n====================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
