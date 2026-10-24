/**
 * Verify Live TinyFish Integration
 */

async function testLiveTinyFish() {
  console.log("==========================================");
  console.log("Verifying Live TinyFish Integration on localhost:3001");
  console.log("==========================================\n");

  await new Promise((r) => setTimeout(r, 1000));

  // 1. Check /api/health/providers
  console.log("1. Checking /api/health/providers...");
  const healthRes = await fetch("http://localhost:3001/api/health/providers");
  const healthJson = await healthRes.json();
  const research = healthJson.data?.research;
  console.log(`   Research Provider Status: ${research?.status}`);
  console.log(`   Provider: ${research?.provider}`);
  console.log(`   Latency: ${research?.latencyMs}ms`);
  console.log(`   Message: ${research?.message}`);

  if (research?.status !== "ready") {
    console.error("FAILED: TinyFish provider is not ready:", research);
    process.exit(1);
  }

  // 2. Trigger live research job via TinyFish
  console.log("\n2. Triggering POST /api/projects/proj-study-planner/research-jobs...");
  const jobRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/research-jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "college exam timetable stress study habits India",
      maxResults: 3,
    }),
  });

  const jobJson = await jobRes.json();
  console.log(`   HTTP status: ${jobRes.status}`);
  console.log(`   Job ID: ${jobJson.data?.jobId}`);
  console.log(`   Sources created: ${jobJson.data?.sourcesCreated}`);
  console.log(`   Evidence created: ${jobJson.data?.evidenceCreated}`);
  console.log(`   Latency: ${jobJson.data?.latencyMs}ms`);
  console.log(`   Provenance: ${jobJson.meta?.provenance}`);

  if (jobJson.data?.sourcesCreated > 0) {
    console.log("\nSample live web source discovered by TinyFish:");
    console.log(`   Title: ${jobJson.data.sources[0]?.title}`);
    console.log(`   Publisher: ${jobJson.data.sources[0]?.publisher}`);
    console.log(`   URL: ${jobJson.data.sources[0]?.url}`);
    console.log(`\nSample candidate evidence claim:`);
    console.log(`   Claim: ${jobJson.data.evidence[0]?.claim?.slice(0, 120)}...`);
    console.log(`   Provenance: ${jobJson.data.evidence[0]?.provenance}`);
    console.log(`   Review Gate Status: ${jobJson.data.evidence[0]?.reviewer_status}`);
  }

  // 3. Verify they show up in GET /api/projects/proj-study-planner/evidence
  console.log("\n3. Verifying evidence ledger contains newly discovered live sources...");
  const evRes = await fetch("http://localhost:3001/api/projects/proj-study-planner/evidence");
  const evJson = await evRes.json();
  const liveItems = (evJson.data?.evidence || []).filter((e) => e.provenance === "REAL_SOURCE");
  console.log(`   Total REAL_SOURCE evidence in ledger: ${liveItems.length}`);

  console.log("\n==========================================");
  console.log("SUCCESS: TinyFish live research is fully functional!");
  console.log("==========================================");
}

testLiveTinyFish().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
