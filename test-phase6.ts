/**
 * IdeaProbe — Phase 6 Automated Test Suite
 *
 * Validates:
 * 1. Competitors API (GET, POST with category enum, PATCH, DELETE, and AI analyze discovery)
 * 2. Assumptions API (GET with priority_score and statusCounts, POST, PATCH status transitions, DELETE)
 * 3. Experiments API (GET with joined assumption statements, POST with validation, PATCH with REAL_EXPERIMENT_RESULT auto-upgrade, DELETE, and AI generate)
 * 4. Provenance and FK integrity between Assumptions and Experiments
 */

import { initDb, getDb } from "./src/lib/db";
import { GET as getCompetitors, POST as postCompetitor, PATCH as patchCompetitor, DELETE as deleteCompetitor } from "./src/app/api/projects/[id]/competitors/route";
import { POST as analyzeCompetitors } from "./src/app/api/projects/[id]/competitors/analyze/route";
import { GET as getAssumptions, POST as postAssumption, PATCH as patchAssumption, DELETE as deleteAssumption } from "./src/app/api/projects/[id]/assumptions/route";
import { GET as getExperiments, POST as postExperiment, PATCH as patchExperiment, DELETE as deleteExperiment } from "./src/app/api/projects/[id]/experiments/route";
import { POST as generateExperiment } from "./src/app/api/projects/[id]/experiments/generate/route";
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
  console.log("=================================================");
  console.log("IdeaProbe Phase 6 Automated Test Suite");
  console.log("=================================================");

  await initDb();
  const projectId = "proj-study-planner";
  const params = Promise.resolve({ id: projectId });

  // ── GROUP 1: Competitors API ─────────────────────────────────────────
  console.log("\n--- Group 1: Competitors API ---");
  let testCompId = "";
  {
    // 1. GET competitors
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors`);
    const res = await getCompetitors(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /competitors returns HTTP 200");
    assert(Array.isArray(json.data?.competitors), "Response contains competitors array");
    assert(json.data?.competitors.length >= 4, `Found ${json.data?.competitors.length} competitors (>= 4 seeded)`);
    assert(json.data?.byCategory?.direct !== undefined, "Response includes byCategory counts");
  }

  {
    // 2. POST competitor validation failure (missing name)
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors`, {
      method: "POST",
      body: JSON.stringify({ category: "direct" }),
    });
    const res = await postCompetitor(req, { params });
    assert(res.status === 400, "POST /competitors rejects missing name with HTTP 400");
  }

  {
    // 3. POST competitor validation failure (invalid category)
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors`, {
      method: "POST",
      body: JSON.stringify({ name: "Bad Comp", category: "invalid_cat" }),
    });
    const res = await postCompetitor(req, { params });
    assert(res.status === 400, "POST /competitors rejects invalid category with HTTP 400");
  }

  {
    // 4. POST competitor success
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors`, {
      method: "POST",
      body: JSON.stringify({
        name: "Test Notion Template",
        category: "substitute",
        description: "Free student Notion workspace template for course planning.",
        differentiator: "IdeaProbe is automated with zero manual table maintenance.",
      }),
    });
    const res = await postCompetitor(req, { params });
    const json = await res.json();

    assert(res.status === 201, "POST /competitors creates competitor with HTTP 201");
    assert(json.data?.competitor?.name === "Test Notion Template", "Created competitor has expected name");
    assert(json.data?.competitor?.provenance === "USER_INPUT", "Created competitor has USER_INPUT provenance");
    testCompId = json.data?.competitor?.id;
  }

  {
    // 5. PATCH competitor
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors`, {
      method: "PATCH",
      body: JSON.stringify({
        id: testCompId,
        description: "Updated description for test competitor.",
      }),
    });
    const res = await patchCompetitor(req, { params });
    const json = await res.json();

    assert(res.status === 200, "PATCH /competitors returns HTTP 200");
    assert(json.data?.competitor?.description === "Updated description for test competitor.", "Competitor description updated");
  }

  {
    // 6. POST /competitors/analyze (AI discovery or SAMPLE fallback)
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors/analyze`, {
      method: "POST",
      body: JSON.stringify({ category: "status_quo", focusArea: "physical paper planners" }),
    });
    const res = await analyzeCompetitors(req, { params });
    const json = await res.json();

    assert(res.status === 200, "POST /competitors/analyze returns HTTP 200");
    assert(typeof json.data?.competitor?.name === "string" && json.data?.competitor?.name.length > 0, "AI competitor has a name");
    assert(
      json.data?.inference?.provenance === "AI_INFERENCE" || json.data?.inference?.provenance === "SAMPLE",
      `AI competitor has legitimate provenance: ${json.data?.inference?.provenance}`
    );

    // Clean up analyzed comp
    if (json.data?.competitor?.id) {
      const delReq = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors?competitorId=${encodeURIComponent(json.data.competitor.id)}`);
      await deleteCompetitor(delReq, { params });
    }
  }

  {
    // 7. DELETE competitor
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/competitors?competitorId=${encodeURIComponent(testCompId)}`);
    const res = await deleteCompetitor(req, { params });
    assert(res.status === 200, "DELETE /competitors returns HTTP 200");

    // Verify deletion
    const db = getDb();
    const check = await db.execute({ sql: "SELECT id FROM competitors WHERE id = ?", args: [testCompId] });
    assert(check.rows.length === 0, "Competitor was deleted from database");
  }

  // ── GROUP 2: Assumptions API ─────────────────────────────────────────
  console.log("\n--- Group 2: Assumptions API ---");
  let testAsmId = "";
  {
    // 8. GET assumptions
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/assumptions`);
    const res = await getAssumptions(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /assumptions returns HTTP 200");
    assert(Array.isArray(json.data?.assumptions), "Response contains assumptions array");
    assert(json.data?.assumptions.length >= 4, `Found ${json.data?.assumptions.length} assumptions (>= 4 seeded)`);
    assert(typeof json.data?.assumptions[0].priority_score === "number", "Assumptions include calculated priority_score");
    assert(json.data?.statusCounts?.unvalidated !== undefined, "Response includes statusCounts");
  }

  {
    // 9. POST assumption validation failure
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/assumptions`, {
      method: "POST",
      body: JSON.stringify({ category: "viability" }),
    });
    const res = await postAssumption(req, { params });
    assert(res.status === 400, "POST /assumptions rejects missing statement with HTTP 400");
  }

  {
    // 10. POST assumption success
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/assumptions`, {
      method: "POST",
      body: JSON.stringify({
        statement: "Students will pay $4/month if the app predicts exam questions from syllabus.",
        category: "viability",
        impact: "High",
        uncertainty: "Critical",
        rationale: "Zero willingness-to-pay evidence exists today.",
        status: "unvalidated",
      }),
    });
    const res = await postAssumption(req, { params });
    const json = await res.json();

    assert(res.status === 201, "POST /assumptions creates assumption with HTTP 201");
    assert(json.data?.assumption?.impact === "High", "Created assumption has High impact");
    assert(json.data?.assumption?.uncertainty === "Critical", "Created assumption has Critical uncertainty");
    assert(json.data?.assumption?.priority_score === 12, "Critical × High calculates priority_score = 12");
    testAsmId = json.data?.assumption?.id;
  }

  {
    // 11. PATCH assumption status transition
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/assumptions`, {
      method: "PATCH",
      body: JSON.stringify({
        id: testAsmId,
        status: "testing",
      }),
    });
    const res = await patchAssumption(req, { params });
    const json = await res.json();

    assert(res.status === 200, "PATCH /assumptions returns HTTP 200");
    assert(json.data?.assumption?.status === "testing", "Assumption status transitioned to 'testing'");
  }

  // ── GROUP 3: Experiments API ─────────────────────────────────────────
  console.log("\n--- Group 3: Experiments API ---");
  let testExpId = "";
  {
    // 12. GET experiments
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments`);
    const res = await getExperiments(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /experiments returns HTTP 200");
    assert(Array.isArray(json.data?.experiments), "Response contains experiments array");
    assert(json.data?.experiments.length >= 2, `Found ${json.data?.experiments.length} experiments (>= 2 seeded)`);
    assert(json.data?.statusCounts?.planned !== undefined, "Response includes statusCounts");
  }

  {
    // 13. POST experiment validation failure
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments`, {
      method: "POST",
      body: JSON.stringify({ hypothesis: "Incomplete experiment" }),
    });
    const res = await postExperiment(req, { params });
    assert(res.status === 400, "POST /experiments rejects incomplete payload with HTTP 400");
  }

  {
    // 14. POST custom experiment linked to test assumption
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments`, {
      method: "POST",
      body: JSON.stringify({
        assumptionId: testAsmId,
        hypothesis: "If we pitch a $4/month prepay tier on campus, at least 15% will place a refundable deposit.",
        method: "Pre-sale Campaign / Paper Slips",
        cohort: "Campus engineering undergraduates (n=50)",
        metric: "Pre-sale deposit rate",
        threshold: ">= 15% deposit rate",
        duration: "5 days",
        cost_estimate: "$10 (paper slips)",
        decision_rules: {
          continue: ">= 15% pre-sales",
          pivot: "8-14% pre-sales with feature requests",
          stop: "< 8% pre-sales",
        },
        status: "running",
      }),
    });
    const res = await postExperiment(req, { params });
    const json = await res.json();

    assert(res.status === 201, "POST /experiments creates experiment with HTTP 201");
    assert(json.data?.experiment?.assumption_id === testAsmId, "Experiment is linked to test assumption");
    assert(json.data?.experiment?.status === "running", "Experiment status is 'running'");
    testExpId = json.data?.experiment?.id;
  }

  {
    // 15. PATCH experiment with real result -> auto-upgrades provenance to REAL_EXPERIMENT_RESULT
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments`, {
      method: "PATCH",
      body: JSON.stringify({
        id: testExpId,
        result: "Tested 52 students; 11 placed deposits (21.1% vs 15% threshold). Exceeded criteria.",
        status: "completed",
      }),
    });
    const res = await patchExperiment(req, { params });
    const json = await res.json();

    assert(res.status === 200, "PATCH /experiments returns HTTP 200");
    assert(json.data?.experiment?.status === "completed", "Experiment status marked 'completed'");
    assert(json.data?.experiment?.provenance === "REAL_EXPERIMENT_RESULT", "Provenance auto-upgraded to REAL_EXPERIMENT_RESULT");
  }

  {
    // 16. POST /experiments/generate (AI experiment designer)
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments/generate`, {
      method: "POST",
      body: JSON.stringify({
        assumptionId: testAsmId,
        method: "Smoke Test Landing Page",
      }),
    });
    const res = await generateExperiment(req, { params });
    const json = await res.json();

    assert(res.status === 201, "POST /experiments/generate returns HTTP 201");
    assert(typeof json.data?.experiment?.hypothesis === "string", "Generated experiment has hypothesis");
    assert(
      json.data?.provenance === "AI_INFERENCE" || json.data?.provenance === "SAMPLE",
      `Generated experiment has legitimate provenance: ${json.data?.provenance}`
    );

    // Clean up generated exp
    if (json.data?.experiment?.id) {
      const delReq = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments?experimentId=${encodeURIComponent(json.data.experiment.id)}`);
      await deleteExperiment(delReq, { params });
    }
  }

  {
    // 17. DELETE assumption unlinks foreign key in linked experiments
    const delAsmReq = new NextRequest(`http://localhost:3000/api/projects/${projectId}/assumptions?assumptionId=${encodeURIComponent(testAsmId)}`);
    const delAsmRes = await deleteAssumption(delAsmReq, { params });
    assert(delAsmRes.status === 200, "DELETE /assumptions returns HTTP 200");

    // Verify experiment's assumption_id was safely set to NULL
    const db = getDb();
    const expRow = await db.execute({ sql: "SELECT assumption_id FROM experiments WHERE id = ?", args: [testExpId] });
    assert(expRow.rows[0].assumption_id === null, "Experiment assumption_id safely nullified after assumption deletion");
  }

  {
    // 18. DELETE experiment
    const delExpReq = new NextRequest(`http://localhost:3000/api/projects/${projectId}/experiments?experimentId=${encodeURIComponent(testExpId)}`);
    const delExpRes = await deleteExperiment(delExpReq, { params });
    assert(delExpRes.status === 200, "DELETE /experiments returns HTTP 200");

    const db = getDb();
    const check = await db.execute({ sql: "SELECT id FROM experiments WHERE id = ?", args: [testExpId] });
    assert(check.rows.length === 0, "Experiment was deleted from database");
  }

  // ── FINAL SUMMARY ────────────────────────────────────────────────────
  console.log("\n=================================================");
  console.log(`Phase 6 Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
