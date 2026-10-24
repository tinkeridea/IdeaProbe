/**
 * IdeaProbe — Phase 7 Integration Test Suite
 *
 * Tests:
 *   P7-A: MVP Scope Board API (GET, POST, PATCH, DELETE)
 *   P7-B: Unified Report API (POST generate, GET fetch)
 *
 * Execution:
 *   cmd /c "npx --yes tsx test-phase7.ts"
 */

import { initDb, getDb } from "./src/lib/db";
import {
  GET as getMvp,
  POST as postMvp,
  PATCH as patchMvp,
  DELETE as deleteMvp,
} from "./src/app/api/projects/[id]/mvp/route";
import {
  GET as getReport,
  POST as generateReport,
} from "./src/app/api/projects/[id]/report/route";
import { NextRequest } from "next/server";

const PROJECT_ID = "proj-study-planner";

type Result = { pass: boolean; label: string; detail?: string };

let PASS = 0;
let FAIL = 0;
const results: Result[] = [];

async function assert(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ pass: true, label });
    PASS++;
  } catch (err: any) {
    results.push({ pass: false, label, detail: err.message });
    FAIL++;
  }
}

function ok(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

// ── In-process request dispatcher for Next.js App Router handlers ────────
async function dispatch(method: string, path: string, body?: object) {
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const match = path.match(/^\/api\/projects\/([^\/?#]+)\/(mvp|report)/);
  if (!match) throw new Error(`Unknown route path: ${path}`);
  const [, projectId, route] = match;
  const params = Promise.resolve({ id: projectId });

  let res: Response;
  if (route === "mvp") {
    if (method === "GET") res = await getMvp(req, { params });
    else if (method === "POST") res = await postMvp(req, { params });
    else if (method === "PATCH") res = await patchMvp(req, { params });
    else if (method === "DELETE") res = await deleteMvp(req, { params });
    else throw new Error(`Method ${method} not supported on mvp`);
  } else if (route === "report") {
    if (method === "GET") res = await getReport(req, { params });
    else if (method === "POST") res = await generateReport(req, { params });
    else throw new Error(`Method ${method} not supported on report`);
  } else {
    throw new Error(`Route ${route} not supported`);
  }

  const data = await res.json();
  return { res, data };
}

async function get(path: string) { return dispatch("GET", path); }
async function post(path: string, body: object) { return dispatch("POST", path, body); }
async function patch(path: string, body: object) { return dispatch("PATCH", path, body); }
async function del(path: string) { return dispatch("DELETE", path); }

// ════════════════════════════════════════════════════════
// P7-A: MVP Scope Board API
// ════════════════════════════════════════════════════════

let createdFeatureId: string | null = null;
let initialFeatureCount = 7;

async function runMvpTests() {
  console.log("\n── P7-A: MVP Scope Board ──────────────────────────────");

  await assert("GET /mvp returns 200 with features array", async () => {
    const { res, data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    ok(res.status === 200, `Expected 200 got ${res.status}`);
    ok(Array.isArray(data.data.features), "features should be an array");
  });

  await assert("GET /mvp returns counts object with now/later/omit/total", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    const counts = data.data.counts;
    ok(typeof counts === "object", "counts should be an object");
    ok(typeof counts.now === "number", "counts.now should be a number");
    ok(typeof counts.later === "number", "counts.later should be a number");
    ok(typeof counts.omit === "number", "counts.omit should be a number");
    ok(typeof counts.total === "number", "counts.total should be a number");
    ok(counts.total === counts.now + counts.later + counts.omit, "total = now + later + omit");
    initialFeatureCount = counts.total;
  });

  await assert("GET /mvp returns >= 7 seeded features total", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    ok(data.data.counts.total >= 7, `Expected >= 7 features, got ${data.data.counts.total}`);
  });

  await assert("GET /mvp features are ordered: now → later → omit", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    const features = data.data.features;
    const priorities = features.map((f: any) => f.priority);
    const order = ["now", "later", "omit"];
    let lastOrder = -1;
    for (const p of priorities) {
      const idx = order.indexOf(p);
      ok(idx >= lastOrder, `Priority order violated: ...${p} after ${order[lastOrder] || "start"}`);
      lastOrder = idx;
    }
  });

  await assert("GET /mvp features have experiment_ids as arrays", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    const features = data.data.features;
    for (const f of features) {
      ok(Array.isArray(f.experiment_ids), `experiment_ids should be array, got ${typeof f.experiment_ids}`);
    }
  });

  await assert("POST /mvp creates a new feature with provenance USER_INPUT", async () => {
    const { res, data } = await post(`/api/projects/${PROJECT_ID}/mvp`, {
      name: "P7 Test Feature — Automated",
      scope: "Test scope from Phase 7 integration test",
      priority: "later",
      effort: "Low",
      rationale: "Testing the Phase 7 POST endpoint",
    });
    ok(res.status === 201, `Expected 201 got ${res.status}`);
    ok(data.data.feature.name === "P7 Test Feature — Automated", "name should match");
    ok(data.data.feature.priority === "later", "priority should be 'later'");
    ok(data.data.feature.provenance === "USER_INPUT", "provenance should be USER_INPUT");
    createdFeatureId = data.data.feature.id;
  });

  await assert("POST /mvp rejects empty name with 400", async () => {
    const { res, data } = await post(`/api/projects/${PROJECT_ID}/mvp`, {
      name: "",
      priority: "now",
    });
    ok(res.status === 400, `Expected 400 got ${res.status}`);
    ok(data.error !== undefined, "Should return error object");
  });

  await assert("POST /mvp rejects invalid priority with 400", async () => {
    const { res } = await post(`/api/projects/${PROJECT_ID}/mvp`, {
      name: "Bad Priority Test",
      priority: "maybe",
    });
    ok(res.status === 400, `Expected 400 got ${res.status}`);
  });

  await assert("POST /mvp rejects invalid effort with 400", async () => {
    const { res } = await post(`/api/projects/${PROJECT_ID}/mvp`, {
      name: "Bad Effort Test",
      priority: "now",
      effort: "Extreme",
    });
    ok(res.status === 400, `Expected 400 got ${res.status}`);
  });

  await assert("PATCH /mvp changes priority of created feature to 'now'", async () => {
    ok(createdFeatureId !== null, "createdFeatureId must be set from POST test");
    const { res, data } = await patch(`/api/projects/${PROJECT_ID}/mvp`, {
      featureId: createdFeatureId,
      priority: "now",
    });
    ok(res.status === 200, `Expected 200 got ${res.status}`);
    ok(data.data.feature.priority === "now", "priority should now be 'now'");
  });

  await assert("PATCH /mvp changes priority to 'omit'", async () => {
    ok(createdFeatureId !== null, "createdFeatureId must be set from POST test");
    const { res, data } = await patch(`/api/projects/${PROJECT_ID}/mvp`, {
      featureId: createdFeatureId,
      priority: "omit",
    });
    ok(res.status === 200, `Expected 200 got ${res.status}`);
    ok(data.data.feature.priority === "omit", "priority should now be 'omit'");
  });

  await assert("PATCH /mvp returns 404 for non-existent feature", async () => {
    const { res } = await patch(`/api/projects/${PROJECT_ID}/mvp`, {
      featureId: "nonexistent-feature-id",
      priority: "now",
    });
    ok(res.status === 404, `Expected 404 got ${res.status}`);
  });

  await assert("PATCH /mvp returns 400 when no featureId provided", async () => {
    const { res } = await patch(`/api/projects/${PROJECT_ID}/mvp`, { priority: "now" });
    ok(res.status === 400, `Expected 400 got ${res.status}`);
  });

  await assert("GET /mvp count increases by 1 after POST", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    ok(data.data.counts.total === initialFeatureCount + 1, `Expected ${initialFeatureCount + 1} features after POST, got ${data.data.counts.total}`);
  });

  await assert("DELETE /mvp removes created feature", async () => {
    ok(createdFeatureId !== null, "createdFeatureId must be set from POST test");
    const { res, data } = await del(`/api/projects/${PROJECT_ID}/mvp?featureId=${createdFeatureId}`);
    ok(res.status === 200, `Expected 200 got ${res.status}`);
    ok(data.data.deleted === createdFeatureId, "Deleted id should match");
  });

  await assert("DELETE /mvp returns 404 for already-deleted feature", async () => {
    ok(createdFeatureId !== null, "createdFeatureId must be set from POST test");
    const { res } = await del(`/api/projects/${PROJECT_ID}/mvp?featureId=${createdFeatureId}`);
    ok(res.status === 404, `Expected 404 got ${res.status}`);
  });

  await assert("DELETE /mvp returns 400 when no featureId query param", async () => {
    const { res } = await del(`/api/projects/${PROJECT_ID}/mvp`);
    ok(res.status === 400, `Expected 400 got ${res.status}`);
  });

  await assert("GET /mvp count returns to initial after DELETE", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/mvp`);
    ok(data.data.counts.total === initialFeatureCount, `Expected ${initialFeatureCount} features after DELETE, got ${data.data.counts.total}`);
  });
}

// ════════════════════════════════════════════════════════
// P7-B: Unified Report API
// ════════════════════════════════════════════════════════

async function runReportTests() {
  console.log("\n── P7-B: Unified Report ──────────────────────────────");

  await assert("POST /report generates a live report (200 or 201)", async () => {
    const { res, data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    ok([200, 201].includes(res.status), `Expected 200/201 got ${res.status}: ${JSON.stringify(data.error)}`);
    ok(data.data.report !== undefined, "Should return report object");
    ok(data.data.report.id !== undefined, "Report should have id");
  });

  await assert("POST /report returns provenance_manifest with all 6 keys", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const manifest = data.data.report.provenance_manifest;
    ok(manifest !== undefined, "provenance_manifest should exist");
    const required = ["USER_INPUT", "REAL_SOURCE", "AI_INFERENCE", "SIMULATED", "SAMPLE", "REAL_EXPERIMENT_RESULT"];
    for (const key of required) {
      ok(key in manifest, `manifest should have key '${key}'`);
    }
  });

  await assert("POST /report returns 9 sections", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const sections = data.data.report.content;
    ok(Array.isArray(sections), "content should be array");
    ok(sections.length === 9, `Expected 9 sections, got ${sections.length}`);
  });

  await assert("POST /report sections have required fields: id, title, provenance, content", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    for (const sec of data.data.report.content) {
      ok(sec.id !== undefined, "section should have id");
      ok(sec.title !== undefined, "section should have title");
      ok(sec.provenance !== undefined, "section should have provenance");
      ok(sec.content !== undefined, "section should have content");
    }
  });

  await assert("POST /report returns stats with all 9 entity counts", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const stats = data.data.report.stats;
    ok(stats !== undefined, "stats should exist");
    const required = ["sources", "evidence", "personas", "insights", "assumptions", "experiments", "competitors", "mvp_features"];
    for (const key of required) {
      ok(key in stats, `stats should have key '${key}'`);
    }
  });

  await assert("POST /report includes brief section with problem statement", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const briefSection = data.data.report.content.find((s: any) => s.id === "sec-brief");
    ok(briefSection !== undefined, "Should have sec-brief section");
    ok(briefSection.content.length > 10, "Brief section content should be non-empty");
  });

  await assert("POST /report includes verdict section with VALIDATION STATUS", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const verdictSection = data.data.report.content.find((s: any) => s.id === "sec-verdict");
    ok(verdictSection !== undefined, "Should have sec-verdict section");
    ok(verdictSection.content.includes("VALIDATION STATUS"), "Verdict should include VALIDATION STATUS");
  });

  await assert("POST /report increments version on repeated calls", async () => {
    const { data: d1 } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const { data: d2 } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    ok(d2.data.report.version > d1.data.report.version, "Second call version should be higher");
  });

  await assert("POST /report returns contains_simulated flag as boolean", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    ok(typeof data.data.report.contains_simulated === "boolean", "contains_simulated should be boolean");
    ok(typeof data.data.report.contains_sample === "boolean", "contains_sample should be boolean");
  });

  await assert("GET /report returns the latest saved snapshot (200)", async () => {
    const { res, data } = await get(`/api/projects/${PROJECT_ID}/report`);
    ok(res.status === 200, `Expected 200 got ${res.status}`);
    ok(data.data.report !== undefined, "Should return report");
    ok(Array.isArray(data.data.report.content), "content should be array");
  });

  await assert("GET /report snapshot has correct provenance_manifest shape", async () => {
    const { data } = await get(`/api/projects/${PROJECT_ID}/report`);
    const manifest = data.data.report.provenance_manifest;
    ok(typeof manifest === "object", "manifest should be object");
    ok("USER_INPUT" in manifest, "manifest should have USER_INPUT");
    ok("REAL_SOURCE" in manifest, "manifest should have REAL_SOURCE");
  });

  await assert("GET /report for unknown project returns 404", async () => {
    const { res } = await get(`/api/projects/nonexistent-xyz/report`);
    ok(res.status === 404, `Expected 404 got ${res.status}`);
  });

  await assert("POST /report for unknown project returns 404", async () => {
    const { res } = await post(`/api/projects/nonexistent-xyz/report`, {});
    ok(res.status === 404, `Expected 404 got ${res.status}`);
  });

  await assert("POST /report provenance_manifest values are all non-negative integers", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const manifest = data.data.report.provenance_manifest;
    for (const [key, val] of Object.entries(manifest)) {
      ok(typeof val === "number" && Number.isInteger(val) && (val as number) >= 0, `${key} should be non-negative integer, got ${val}`);
    }
  });

  await assert("POST /report MVP features section has NOW/LATER/OMIT buckets", async () => {
    const { data } = await post(`/api/projects/${PROJECT_ID}/report`, {});
    const mvpSection = data.data.report.content.find((s: any) => s.id === "sec-mvp");
    ok(mvpSection !== undefined, "Should have sec-mvp section");
    ok(mvpSection.content.includes("NOW"), "MVP section should mention NOW");
    ok(mvpSection.content.includes("LATER"), "MVP section should mention LATER");
    ok(mvpSection.content.includes("OMIT"), "MVP section should mention OMIT");
  });
}

// ════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  IdeaProbe — Phase 7 Integration Test Suite          ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Project:  ${PROJECT_ID}`);

  await initDb();
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM mvp_features WHERE name LIKE 'P7 Test Feature%'",
    args: [],
  });
  await runMvpTests();
  await runReportTests();

  // Summary
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║  Results: ${PASS} passed, ${FAIL} failed out of ${PASS + FAIL} tests`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  for (const r of results) {
    const icon = r.pass ? "  ✓" : "  ✗";
    const color = r.pass ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";
    console.log(`${color}${icon} ${r.label}${reset}`);
    if (!r.pass && r.detail) {
      console.log(`      → ${r.detail}`);
    }
  }

  if (FAIL > 0) {
    console.log(`\n\x1b[31m${FAIL} test(s) FAILED\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32mAll ${PASS} tests PASSED ✓\x1b[0m`);
  }
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
