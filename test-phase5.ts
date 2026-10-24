/**
 * IdeaProbe — Phase 5 Automated Test Suite
 *
 * Validates:
 * 1. GET /api/projects/[id]/sources
 * 2. POST /api/projects/[id]/sources (create source with validation)
 * 3. GET /api/projects/[id]/evidence (with joined sources)
 * 4. POST /api/projects/[id]/evidence (create evidence claim linked to source)
 * 5. PATCH /api/projects/[id]/evidence (Human Review Gate: ACCEPTED, EDITED, REJECTED)
 * 6. DELETE /api/projects/[id]/evidence
 * 7. DELETE /api/projects/[id]/sources
 * 8. POST /api/projects/[id]/insights/generate (Ollama or SAMPLE fallback)
 * 9. POST /api/projects/[id]/personas/generate (Ollama or SAMPLE fallback)
 * 10. GET /api/projects/[id] (verifies live counts)
 */

import { initDb, getDb } from "./src/lib/db";
import { GET as getSources, POST as postSource, DELETE as deleteSource } from "./src/app/api/projects/[id]/sources/route";
import { GET as getEvidence, POST as postEvidence, PATCH as patchEvidence, DELETE as deleteEvidence } from "./src/app/api/projects/[id]/evidence/route";
import { POST as generateInsight } from "./src/app/api/projects/[id]/insights/generate/route";
import { POST as generatePersona } from "./src/app/api/projects/[id]/personas/generate/route";
import { GET as getProject } from "./src/app/api/projects/[id]/route";
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
  console.log("IdeaProbe Phase 5 Automated Test Suite");
  console.log("=================================================");

  await initDb();
  const projectId = "proj-study-planner";
  const params = Promise.resolve({ id: projectId });

  // ── TEST GROUP 1: Sources API ──────────────────────────────
  console.log("\n--- Group 1: Sources API ---");
  {
    // GET sources
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/sources`);
    const res = await getSources(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /sources returns HTTP 200");
    assert(Array.isArray(json.data?.sources), "Response contains sources array");
    assert(json.data?.sources.length >= 4, `Found ${json.data?.sources.length} sources (>= 4 seeded)`);
    assert(json.data?.sources[0].linked_evidence_count !== undefined, "Sources include linked_evidence_count");
  }

  let createdSourceId = "";
  {
    // POST source
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Primary Survey 2026",
        url: "https://example.org/test-survey",
        publisher: "IdeaProbe Research Lab",
        sourceType: "web",
      }),
    });
    const res = await postSource(req, { params });
    const json = await res.json();

    assert(res.status === 201, "POST /sources returns HTTP 201 Created");
    assert(json.data?.source?.title === "Test Primary Survey 2026", "Source title persisted correctly");
    assert(json.data?.source?.source_type === "web", "Source type is web");
    assert(json.meta?.provenance === "USER_INPUT", "Source creation tagged USER_INPUT");
    createdSourceId = json.data?.source?.id;
    assert(Boolean(createdSourceId), `Created source ID: ${createdSourceId}`);
  }

  // ── TEST GROUP 2: Evidence API & Reviewer Gate ───────────────
  console.log("\n--- Group 2: Evidence API & Reviewer Gate ---");
  {
    // GET evidence
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/evidence`);
    const res = await getEvidence(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /evidence returns HTTP 200");
    assert(Array.isArray(json.data?.evidence), "Response contains evidence array");
    assert(Array.isArray(json.data?.sources), "Response contains sources array");
    assert(json.data?.evidence.length >= 4, `Found ${json.data?.evidence.length} evidence records (>= 4 seeded)`);
  }

  let createdEvidenceId = "";
  {
    // POST evidence
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claim: "78% of pilot students reported anxiety reduction with 15-minute study intervals.",
        excerpt: "Structured intervals reduced reported panic scores by 42% on average.",
        sourceId: createdSourceId,
        confidence: "High",
        provenance: "REAL_SOURCE",
        caveat: "Pilot study limited to 45 students.",
      }),
    });
    const res = await postEvidence(req, { params });
    const json = await res.json();

    assert(res.status === 201, "POST /evidence returns HTTP 201 Created");
    assert(json.data?.evidence?.claim.startsWith("78%"), "Evidence claim persisted");
    assert(json.data?.evidence?.reviewer_status === "UNREVIEWED", "New evidence defaults to UNREVIEWED (F06 Gate)");
    assert(json.data?.evidence?.provenance === "REAL_SOURCE", "Evidence provenance is REAL_SOURCE");
    createdEvidenceId = json.data?.evidence?.id;
    assert(Boolean(createdEvidenceId), `Created evidence ID: ${createdEvidenceId}`);
  }

  {
    // PATCH evidence — Review Gate: Accept
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/evidence`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: createdEvidenceId,
        reviewerStatus: "ACCEPTED",
      }),
    });
    const res = await patchEvidence(req, { params });
    const json = await res.json();

    assert(res.status === 200, "PATCH /evidence returns HTTP 200");
    assert(json.data?.evidence?.reviewer_status === "ACCEPTED", "Reviewer accepted evidence successfully");
  }

  {
    // PATCH evidence — Review Gate: Edit
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/evidence`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: createdEvidenceId,
        claim: "78% of pilot students reported anxiety reduction with 15-minute study intervals (verified).",
        reviewerStatus: "EDITED",
      }),
    });
    const res = await patchEvidence(req, { params });
    const json = await res.json();

    assert(res.status === 200, "PATCH /evidence edit returns HTTP 200");
    assert(json.data?.evidence?.reviewer_status === "EDITED", "Evidence status updated to EDITED");
    assert(json.data?.evidence?.claim.includes("(verified)"), "Claim text updated");
  }

  // ── TEST GROUP 3: Insight Synthesis Inference Route ─────────
  console.log("\n--- Group 3: Insight Synthesis (POST /insights/generate) ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/insights/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightType: "theme" }),
    });
    const res = await generateInsight(req, { params });
    const json = await res.json();

    assert(res.status === 200, "POST /insights/generate returns HTTP 200");
    assert(Boolean(json.data?.insight?.statement), "Insight statement exists");
    assert(json.data?.insight?.type === "theme", "Insight type is theme");
    assert(
      json.data?.insight?.provenance === "AI_INFERENCE" || json.data?.insight?.provenance === "SAMPLE",
      `Insight provenance is honest: ${json.data?.insight?.provenance}`
    );
    assert(Boolean(json.data?.inference), "Inference metadata present");
  }

  // ── TEST GROUP 4: Persona Draft Inference Route ────────────
  console.log("\n--- Group 4: Persona Draft (POST /personas/generate) ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/personas/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmentHint: "Commuting engineering student" }),
    });
    const res = await generatePersona(req, { params });
    const json = await res.json();

    assert(res.status === 200, "POST /personas/generate returns HTTP 200");
    assert(Boolean(json.data?.persona?.name), `Drafted persona name: ${json.data?.persona?.name}`);
    assert(Boolean(json.data?.persona?.segment), "Persona segment hypothesis defined");
    assert(Boolean(json.data?.persona?.assumptions), "Persona explicitly includes assumptions field (D03)");
    assert(
      json.data?.persona?.provenance === "AI_INFERENCE" || json.data?.persona?.provenance === "SAMPLE",
      `Persona provenance is honest: ${json.data?.persona?.provenance}`
    );
    assert(Boolean(json.data?.caveat), "Mandatory simulation caveat returned");
  }

  // ── TEST GROUP 5: Project Overview & Entity Counts ─────────
  console.log("\n--- Group 5: Project Overview & Counts ---");
  {
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}`);
    const res = await getProject(req, { params });
    const json = await res.json();

    assert(res.status === 200, "GET /projects/[id] returns HTTP 200");
    const counts = json.data?.counts;
    assert(Number(counts?.evidence_count) >= 5, `Evidence count >= 5 (actual: ${counts?.evidence_count})`);
    assert(Number(counts?.source_count) >= 5, `Source count >= 5 (actual: ${counts?.source_count})`);
    assert(Number(counts?.persona_count) >= 3, `Persona count >= 3 (actual: ${counts?.persona_count})`);
    assert(Number(counts?.insight_count) >= 5, `Insight count >= 5 (actual: ${counts?.insight_count})`);
  }

  // ── TEST GROUP 6: Cleanup Test Data ────────────────────────
  console.log("\n--- Group 6: Deletion & Cleanup ---");
  {
    // DELETE created evidence
    const req = new NextRequest(`http://localhost:3000/api/projects/${projectId}/evidence?evidenceId=${encodeURIComponent(createdEvidenceId)}`, {
      method: "DELETE",
    });
    const res = await deleteEvidence(req, { params });
    assert(res.status === 200, "DELETE /evidence successfully removes test record");

    // DELETE created source
    const srcReq = new NextRequest(`http://localhost:3000/api/projects/${projectId}/sources?sourceId=${encodeURIComponent(createdSourceId)}`, {
      method: "DELETE",
    });
    const srcRes = await deleteSource(srcReq, { params });
    assert(srcRes.status === 200, "DELETE /sources successfully removes test source");
  }

  // ── SUMMARY ────────────────────────────────────────────────
  console.log("\n=================================================");
  console.log(`Phase 5 Test Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
