/**
 * IdeaProbe — Phase 3 Test Suite
 *
 * Verifies:
 *  1. SQLite Seeding across all 11 domain entities
 *  2. Entity row counts matching mockData.ts
 *  3. Sub-resource API routes for modules:
 *     - /api/projects/[id]/evidence
 *     - /api/projects/[id]/competitors
 *     - /api/projects/[id]/personas
 *     - /api/projects/[id]/insights
 *     - /api/projects/[id]/assumptions
 *     - /api/projects/[id]/experiments
 *     - /api/projects/[id]/mvp
 *     - /api/projects/[id]/report
 *  4. Persona chat POST endpoint (/api/personas/[id]/chat)
 *  5. Provenance integrity & simulation warnings
 */

import { initDb, getDb } from "./src/lib/db";
import { GET as getProjectDetail } from "./src/app/api/projects/[id]/route";
import { GET as getEvidence } from "./src/app/api/projects/[id]/evidence/route";
import { GET as getCompetitors } from "./src/app/api/projects/[id]/competitors/route";
import { GET as getPersonas } from "./src/app/api/projects/[id]/personas/route";
import { GET as getInsights } from "./src/app/api/projects/[id]/insights/route";
import { GET as getAssumptions } from "./src/app/api/projects/[id]/assumptions/route";
import { GET as getExperiments } from "./src/app/api/projects/[id]/experiments/route";
import { GET as getMvp } from "./src/app/api/projects/[id]/mvp/route";
import { GET as getReport } from "./src/app/api/projects/[id]/report/route";
import { POST as postPersonaChat } from "./src/app/api/personas/[id]/chat/route";
import { NextRequest } from "next/server";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failed++;
  }
}

function makeReq(url: string, method = "GET", body?: any): NextRequest {
  const init: any = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

async function runTests() {
  console.log("══════════════════════════════════════════════════════");
  console.log(" IdeaProbe — Phase 3 Test Suite (Demo Fixtures & APIs)");
  console.log("══════════════════════════════════════════════════════\n");

  // 1. Initialize DB and Seed
  console.log("1. Database & Domain Entity Seeding");
  await initDb();
  const db = getDb();

  const counts: Record<string, number> = {};
  const tables = [
    "projects", "idea_briefs", "runs", "stages", "sources", "evidence",
    "competitors", "personas", "interviews", "turns", "insights",
    "assumptions", "experiments", "mvp_features", "report_snapshots"
  ];

  for (const t of tables) {
    const res = await db.execute(`SELECT COUNT(*) as cnt FROM ${t}`);
    counts[t] = Number(res.rows[0].cnt);
  }

  assert(counts.projects >= 3, `projects count = ${counts.projects} (>= 3)`);
  assert(counts.idea_briefs >= 3, `idea_briefs count = ${counts.idea_briefs} (>= 3)`);
  assert(counts.runs >= 1, `runs count = ${counts.runs} (>= 1)`);
  assert(counts.stages >= 10, `stages count = ${counts.stages} (>= 10)`);
  assert(counts.sources >= 4, `sources count = ${counts.sources} (>= 4)`);
  assert(counts.evidence >= 4, `evidence count = ${counts.evidence} (>= 4)`);
  assert(counts.competitors >= 5, `competitors count = ${counts.competitors} (>= 5)`);
  assert(counts.personas >= 2, `personas count = ${counts.personas} (>= 2)`);
  assert(counts.interviews >= 2, `interviews count = ${counts.interviews} (>= 2)`);
  assert(counts.turns >= 12, `turns count = ${counts.turns} (>= 12)`);
  assert(counts.insights >= 4, `insights count = ${counts.insights} (>= 4)`);
  assert(counts.assumptions >= 4, `assumptions count = ${counts.assumptions} (>= 4)`);
  assert(counts.experiments >= 2, `experiments count = ${counts.experiments} (>= 2)`);
  assert(counts.mvp_features >= 7, `mvp_features count = ${counts.mvp_features} (>= 7)`);
  assert(counts.report_snapshots >= 1, `report_snapshots count = ${counts.report_snapshots} (>= 1)`);

  // 2. Project Detail Endpoint with entity counts
  console.log("\n2. GET /api/projects/proj-study-planner (Entity Counts)");
  const projDetailRes = await getProjectDetail(
    makeReq("http://localhost:3000/api/projects/proj-study-planner"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(projDetailRes.status === 200, "Project detail status is 200");
  const projData = (await projDetailRes.json()).data;
  assert(projData.project.id === "proj-study-planner", "Project id matches");
  assert(Number(projData.counts.evidence_count) >= 4, `evidence_count is ${projData.counts.evidence_count}`);
  assert(Number(projData.counts.competitor_count) >= 5, `competitor_count is ${projData.counts.competitor_count}`);
  assert(Number(projData.counts.persona_count) >= 2, `persona_count is ${projData.counts.persona_count}`);
  assert(Number(projData.counts.mvp_count) >= 7, `mvp_count is ${projData.counts.mvp_count}`);

  // 3. Evidence API
  console.log("\n3. GET /api/projects/proj-study-planner/evidence");
  const evRes = await getEvidence(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/evidence"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(evRes.status === 200, "Evidence status is 200");
  const evData = (await evRes.json()).data;
  assert(evData.sources.length >= 4, `Returned ${evData.sources.length} sources`);
  assert(evData.evidence.length >= 4, `Returned ${evData.evidence.length} evidence items`);
  assert(evData.evidence.some((e: any) => e.provenance === "SAMPLE"), "Contains SAMPLE evidence");
  assert(evData.evidence.some((e: any) => e.provenance === "USER_INPUT"), "Contains USER_INPUT evidence");

  // 4. Competitors API
  console.log("\n4. GET /api/projects/proj-study-planner/competitors");
  const compRes = await getCompetitors(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/competitors"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(compRes.status === 200, "Competitors status is 200");
  const compData = (await compRes.json()).data;
  assert(compData.competitors.length >= 5, `Returned ${compData.competitors.length} competitors`);
  assert(compData.competitors.every((c: any) => c.provenance === "SAMPLE"), "All demo competitors labeled SAMPLE");

  // 5. Personas API
  console.log("\n5. GET /api/projects/proj-study-planner/personas");
  const perRes = await getPersonas(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/personas"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(perRes.status === 200, "Personas status is 200");
  const perData = (await perRes.json()).data;
  assert(perData.personas.length >= 2, `Returned ${perData.personas.length} personas`);
  assert(perData.personas.every((p: any) => p.provenance === "SIMULATED"), "All personas labeled SIMULATED");
  assert(perData.interviews.length >= 2, `Returned ${perData.interviews.length} interviews`);
  assert(perData.interviews[0].turns.length >= 6, `Interview 1 has ${perData.interviews[0].turns.length} turns`);

  // 6. Insights API
  console.log("\n6. GET /api/projects/proj-study-planner/insights");
  const insRes = await getInsights(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/insights"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(insRes.status === 200, "Insights status is 200");
  const insData = (await insRes.json()).data;
  assert(insData.insights.length >= 4, `Returned ${insData.insights.length} insights`);
  assert(insData.insights.some((i: any) => i.type === "contradiction"), "Contains contradiction insight");
  assert(insData.insights.some((i: any) => i.type === "open_question"), "Contains open question insight");

  // 7. Assumptions API
  console.log("\n7. GET /api/projects/proj-study-planner/assumptions");
  const asmRes = await getAssumptions(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/assumptions"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(asmRes.status === 200, "Assumptions status is 200");
  const asmData = (await asmRes.json()).data;
  assert(asmData.assumptions.length >= 4, `Returned ${asmData.assumptions.length} assumptions`);
  assert(asmData.assumptions.some((a: any) => a.uncertainty === "Critical"), "Contains Critical uncertainty assumption");

  // 8. Experiments API
  console.log("\n8. GET /api/projects/proj-study-planner/experiments");
  const expRes = await getExperiments(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/experiments"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(expRes.status === 200, "Experiments status is 200");
  const expData = (await expRes.json()).data;
  assert(expData.experiments.length >= 2, `Returned ${expData.experiments.length} experiments`);
  assert(expData.experiments[0].threshold.includes("30%"), "Experiment threshold verified");

  // 9. MVP API
  console.log("\n9. GET /api/projects/proj-study-planner/mvp");
  const mvpRes = await getMvp(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/mvp"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(mvpRes.status === 200, "MVP status is 200");
  const mvpData = (await mvpRes.json()).data;
  assert(mvpData.features.length >= 7, `Returned ${mvpData.features.length} MVP features`);
  assert(mvpData.features.filter((f: any) => f.priority === "now").length === 3, "3 'Now' core features");
  assert(mvpData.features.filter((f: any) => f.priority === "later").length === 3, "3 'Later' features");
  assert(mvpData.features.filter((f: any) => f.priority === "omit").length === 1, "1 'Omit' feature");

  // 10. Report API
  console.log("\n10. GET /api/projects/proj-study-planner/report");
  const repRes = await getReport(
    makeReq("http://localhost:3000/api/projects/proj-study-planner/report"),
    { params: Promise.resolve({ id: "proj-study-planner" }) }
  );
  assert(repRes.status === 200, "Report status is 200");
  const repData = (await repRes.json()).data;
  assert(repData.report.id === "report-snap-001", "Report ID matches");
  assert(repData.report.contains_simulated === true, "Report marks contains_simulated=true");
  assert(repData.report.contains_sample === true, "Report marks contains_sample=true");
  assert(repData.report.provenance_manifest.USER_INPUT === 1, "Provenance manifest USER_INPUT count = 1");

  // 11. Persona Chat Endpoint
  console.log("\n11. POST /api/personas/persona-01/chat");
  const testSessionId = `test-session-${Date.now()}`;
  const chatRes = await postPersonaChat(
    makeReq("http://localhost:3000/api/personas/persona-01/chat", "POST", {
      message: "Would you pay ₹99 a month for an exam study planner?",
      sessionId: testSessionId,
    }),
    { params: Promise.resolve({ id: "persona-01" }) }
  );
  assert(chatRes.status === 200, "Persona chat status is 200");
  const chatData = (await chatRes.json()).data;
  assert(chatData.provenance === "SIMULATED", "Chat response provenance is SIMULATED");
  assert(chatData.caveat.includes("SIMULATED ARTIFACT"), "Chat response contains mandatory caveat");
  assert(chatData.assistantTurn.text.includes("pocket money"), "Response grounded in persona objections");

  // 12. Verify chat turn saved in SQLite
  const turnsAfter = await db.execute({
    sql: "SELECT COUNT(*) as cnt FROM turns WHERE conversation_id = ?",
    args: [testSessionId],
  });
  assert(Number(turnsAfter.rows[0].cnt) === 2, "2 turns saved to SQLite for test chat session");

  console.log("\n══════════════════════════════════════════════════════");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("══════════════════════════════════════════════════════");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
