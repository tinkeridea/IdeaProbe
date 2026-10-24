/**
 * IdeaProbe — Phase 5 HTTP Integration Test Suite
 */

const BASE_URL = "http://localhost:3001";
const PROJECT_ID = "proj-study-planner";

let passed = 0;
let failed = 0;

function assert(condition, name, detail) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}${detail ? `: ${detail}` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("Running Phase 5 HTTP Integration Tests");
  console.log(`Target: ${BASE_URL}/api/projects/${PROJECT_ID}`);
  console.log("=================================================\n");

  // Wait 1 second for server to initialize
  await new Promise((r) => setTimeout(r, 1000));

  // 1. GET /sources
  console.log("--- 1. Testing GET /api/projects/[id]/sources ---");
  const sourcesRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/sources`);
  const sourcesJson = await sourcesRes.json();
  assert(sourcesRes.status === 200, "GET /sources returns HTTP 200");
  assert(Array.isArray(sourcesJson.data?.sources), "Response data contains sources array");
  assert(sourcesJson.data?.sources.length >= 4, `Seeded sources found: ${sourcesJson.data?.sources.length} >= 4`);
  assert(sourcesJson.data?.sources[0].linked_evidence_count !== undefined, "Includes linked_evidence_count");

  // 2. POST /sources (create)
  console.log("\n--- 2. Testing POST /api/projects/[id]/sources ---");
  const postSrcRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Automated Test Primary Source 2026",
      url: "https://example.com/test-survey-p5",
      publisher: "IdeaProbe Research Lab",
      sourceType: "web",
    }),
  });
  const postSrcJson = await postSrcRes.json();
  assert(postSrcRes.status === 201, "POST /sources returns HTTP 201 Created");
  assert(postSrcJson.data?.source?.title === "Automated Test Primary Source 2026", "Title saved correctly");
  assert(postSrcJson.meta?.provenance === "USER_INPUT", "Provenance tagged USER_INPUT");
  const createdSourceId = postSrcJson.data?.source?.id;
  assert(Boolean(createdSourceId), `Created source ID: ${createdSourceId}`);

  // 3. GET /evidence
  console.log("\n--- 3. Testing GET /api/projects/[id]/evidence ---");
  const evRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/evidence`);
  const evJson = await evRes.json();
  assert(evRes.status === 200, "GET /evidence returns HTTP 200");
  assert(Array.isArray(evJson.data?.evidence), "Response data contains evidence array");
  assert(evJson.data?.evidence.length >= 4, `Seeded evidence found: ${evJson.data?.evidence.length} >= 4`);

  // 4. POST /evidence (create)
  console.log("\n--- 4. Testing POST /api/projects/[id]/evidence ---");
  const postEvRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claim: "Students who use dynamic micro-blocks retain 2.4x more retention during exam weeks.",
      excerpt: "Micro-blocks of 20 min demonstrated statistically significant retention gains across 50 engineering students.",
      sourceId: createdSourceId,
      confidence: "High",
      provenance: "REAL_SOURCE",
      caveat: "Sample size 50 students across 2 university campuses.",
    }),
  });
  const postEvJson = await postEvRes.json();
  assert(postEvRes.status === 201, "POST /evidence returns HTTP 201 Created");
  assert(postEvJson.data?.evidence?.claim.includes("micro-blocks"), "Claim text preserved");
  assert(postEvJson.data?.evidence?.reviewer_status === "UNREVIEWED", "Reviewer status defaults to UNREVIEWED (F06)");
  assert(postEvJson.data?.evidence?.provenance === "REAL_SOURCE", "Provenance is REAL_SOURCE");
  const createdEvidenceId = postEvJson.data?.evidence?.id;
  assert(Boolean(createdEvidenceId), `Created evidence ID: ${createdEvidenceId}`);

  // 5. PATCH /evidence (Reviewer Gate: Accept)
  console.log("\n--- 5. Testing PATCH /api/projects/[id]/evidence (Reviewer Gate: Accept) ---");
  const patchAcceptRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/evidence`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: createdEvidenceId,
      reviewerStatus: "ACCEPTED",
    }),
  });
  const patchAcceptJson = await patchAcceptRes.json();
  assert(patchAcceptRes.status === 200, "PATCH /evidence accept returns HTTP 200");
  assert(patchAcceptJson.data?.evidence?.reviewer_status === "ACCEPTED", "Reviewer status updated to ACCEPTED");

  // 6. PATCH /evidence (Reviewer Gate: Edit)
  console.log("\n--- 6. Testing PATCH /api/projects/[id]/evidence (Reviewer Gate: Edit) ---");
  const patchEditRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/evidence`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: createdEvidenceId,
      claim: "Students who use dynamic micro-blocks retain 2.4x more retention (peer-reviewed replication).",
      reviewerStatus: "EDITED",
    }),
  });
  const patchEditJson = await patchEditRes.json();
  assert(patchEditRes.status === 200, "PATCH /evidence edit returns HTTP 200");
  assert(patchEditJson.data?.evidence?.reviewer_status === "EDITED", "Reviewer status updated to EDITED");
  assert(patchEditJson.data?.evidence?.claim.includes("replication"), "Edited claim text persisted");

  // 7. POST /insights/generate (Task P5-B synthesis endpoint)
  console.log("\n--- 7. Testing POST /api/projects/[id]/insights/generate ---");
  const insightGenRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/insights/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ insightType: "theme" }),
  });
  const insightGenJson = await insightGenRes.json();
  assert(insightGenRes.status === 200, "POST /insights/generate returns HTTP 200");
  assert(Boolean(insightGenJson.data?.insight?.statement), "Insight statement synthesized");
  assert(insightGenJson.data?.insight?.type === "theme", "Insight type matches theme");
  assert(
    insightGenJson.data?.insight?.provenance === "AI_INFERENCE" || insightGenJson.data?.insight?.provenance === "SAMPLE",
    `Insight provenance is honest (${insightGenJson.data?.insight?.provenance})`
  );

  // 8. POST /personas/generate (Task P5-C persona draft endpoint)
  console.log("\n--- 8. Testing POST /api/projects/[id]/personas/generate ---");
  const personaGenRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/personas/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ segmentHint: "Commuting final-year student" }),
  });
  const personaGenJson = await personaGenRes.json();
  assert(personaGenRes.status === 200, "POST /personas/generate returns HTTP 200");
  assert(Boolean(personaGenJson.data?.persona?.name), `Persona drafted: ${personaGenJson.data?.persona?.name}`);
  assert(Boolean(personaGenJson.data?.persona?.segment), "Persona segment hypothesis defined");
  assert(Boolean(personaGenJson.data?.persona?.assumptions), "Persona explicitly includes assumptions list (Decision D03)");
  assert(
    personaGenJson.data?.persona?.provenance === "AI_INFERENCE" || personaGenJson.data?.persona?.provenance === "SAMPLE",
    `Persona provenance is honest (${personaGenJson.data?.persona?.provenance})`
  );
  assert(Boolean(personaGenJson.data?.caveat), "Simulation integrity caveat returned");

  // 9. GET /projects/[id] (verify updated counts)
  console.log("\n--- 9. Testing GET /api/projects/[id] (Live Counts) ---");
  const projRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}`);
  const projJson = await projRes.json();
  assert(projRes.status === 200, "GET /projects/[id] returns HTTP 200");
  const counts = projJson.data?.counts;
  assert(Number(counts?.evidence_count) >= 5, `Evidence count >= 5 (actual: ${counts?.evidence_count})`);
  assert(Number(counts?.source_count) >= 5, `Source count >= 5 (actual: ${counts?.source_count})`);
  assert(Number(counts?.persona_count) >= 3, `Persona count >= 3 (actual: ${counts?.persona_count})`);
  assert(Number(counts?.insight_count) >= 5, `Insight count >= 5 (actual: ${counts?.insight_count})`);

  // 10. Cleanup: DELETE evidence and source
  console.log("\n--- 10. Testing DELETE endpoints & Cleanup ---");
  const delEvRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/evidence?evidenceId=${encodeURIComponent(createdEvidenceId)}`, {
    method: "DELETE",
  });
  assert(delEvRes.status === 200, "DELETE /evidence successfully removes created evidence");

  const delSrcRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/sources?sourceId=${encodeURIComponent(createdSourceId)}`, {
    method: "DELETE",
  });
  assert(delSrcRes.status === 200, "DELETE /sources successfully removes created source");

  // 11. Provider Health Check (TinyFish & Ollama)
  console.log("\n--- 11. Testing GET /api/health/providers ---");
  const healthRes = await fetch(`${BASE_URL}/api/health/providers`);
  const healthJson = await healthRes.json();
  assert(healthRes.status === 200, "GET /api/health/providers returns HTTP 200");
  assert(Boolean(healthJson.data?.research), "Research provider health section present");
  assert(healthJson.data?.research?.provider === "tinyfish", "Research provider is tinyfish");
  assert(
    healthJson.data?.research?.status === "ready" || healthJson.data?.research?.status === "unconfigured",
    `Research provider status is honest (${healthJson.data?.research?.status})`
  );

  // 12. TinyFish Live Web Research (if ready)
  if (healthJson.data?.research?.status === "ready") {
    console.log("\n--- 12. Testing POST /api/projects/[id]/research-jobs (Live TinyFish) ---");
    const tfRes = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/research-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "undergraduate exam stress management intervals", maxResults: 2 }),
    });
    const tfJson = await tfRes.json();
    assert(tfRes.status === 201, "POST /research-jobs returns HTTP 201 Created");
    assert(Boolean(tfJson.data?.jobId), "Research job ID generated");
    assert(tfJson.data?.provider === "tinyfish", "Provider is tinyfish");
    assert(Array.isArray(tfJson.data?.sources) && tfJson.data?.sources.length > 0, "Sources array created from live web search");
    assert(Array.isArray(tfJson.data?.evidence) && tfJson.data?.evidence.length > 0, "Evidence array created from live web search");
    assert(tfJson.data?.evidence[0]?.provenance === "REAL_SOURCE", "Live evidence tagged REAL_SOURCE");
    assert(tfJson.data?.evidence[0]?.reviewer_status === "UNREVIEWED", "Live evidence placed in UNREVIEWED review gate");

    // Clean up created live research items
    for (const ev of tfJson.data?.evidence || []) {
      await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/evidence?evidenceId=${encodeURIComponent(ev.id)}`, { method: "DELETE" });
    }
    for (const src of tfJson.data?.sources || []) {
      await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/sources?sourceId=${encodeURIComponent(src.id)}`, { method: "DELETE" });
    }
    assert(true, "Cleaned up live TinyFish test research artifacts");
  }

  // Final summary
  console.log("\n=================================================");
  console.log(`Phase 5 Integration Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
