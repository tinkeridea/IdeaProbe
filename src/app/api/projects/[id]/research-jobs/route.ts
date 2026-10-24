import { NextRequest } from "next/server";
import { initDb, getDb, nowUtc } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/apiResponse";
import { searchTinyFish, isTinyFishConfigured } from "@/lib/tinyfish";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/research-jobs — Trigger live web research crawl via TinyFish
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();

    // 1. Verify project exists
    const projRes = await db.execute({
      sql: "SELECT id, title FROM projects WHERE id = ?",
      args: [id],
    });
    if (projRes.rows.length === 0) {
      return apiError("PROJECT_NOT_FOUND", `Project '${id}' not found.`, 404);
    }
    const project = projRes.rows[0];

    // 2. Read query from body or build intelligent query from idea brief
    const body = await req.json().catch(() => ({}));
    let query: string = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      const briefRes = await db.execute({
        sql: "SELECT problem, target_customer, category FROM idea_briefs WHERE project_id = ? ORDER BY version DESC LIMIT 1",
        args: [id],
      });
      const brief = briefRes.rows[0] as { problem?: string; target_customer?: string; category?: string } | undefined;

      if (brief?.target_customer && brief?.problem) {
        // Extract 3-5 keywords
        const targetClean = brief.target_customer.split(" ").slice(0, 4).join(" ");
        const problemClean = brief.problem.split(" ").slice(0, 5).join(" ");
        query = `${targetClean} ${problemClean}`;
      } else {
        query = `${project.title} market research`;
      }
    }

    const maxResults = typeof body.maxResults === "number" ? Math.min(body.maxResults, 10) : 4;

    // 3. Execute live TinyFish search
    const searchOutcome = await searchTinyFish(query, maxResults);

    if (!searchOutcome.success) {
      return apiError(
        "TINYFISH_RESEARCH_FAILED",
        searchOutcome.error || "TinyFish search failed to complete.",
        502,
        true,
        { query, latencyMs: searchOutcome.latencyMs }
      );
    }

    const now = nowUtc();
    const createdSources: any[] = [];
    const createdEvidence: any[] = [];

    // 4. Ingest and persist results to SQLite
    for (let i = 0; i < searchOutcome.results.length; i++) {
      const item = searchOutcome.results[i];
      const sourceId = `src-tf-${Date.now()}-${i}`;
      const evidenceId = `ev-tf-${Date.now()}-${i}`;

      // Insert Source
      await db.execute({
        sql: `INSERT OR IGNORE INTO sources
                (id, project_id, url, title, publisher, retrieved_at, source_type, provider, created_at)
              VALUES (?, ?, ?, ?, ?, ?, 'web', 'tinyfish', ?)`,
        args: [sourceId, id, item.url, item.title, item.site_name, now, now],
      });

      // Insert Evidence (F06: defaults to UNREVIEWED for human review gate)
      const claimText = item.snippet && item.snippet.length > 10 ? item.snippet : item.title;

      await db.execute({
        sql: `INSERT OR IGNORE INTO evidence
                (id, project_id, source_id, claim, excerpt, provenance, confidence, reviewer_status, caveat, created_at)
              VALUES (?, ?, ?, ?, ?, 'REAL_SOURCE', 'High', 'UNREVIEWED', ?, ?)`,
        args: [
          evidenceId,
          id,
          sourceId,
          claimText,
          item.snippet,
          `Live citation discovered via TinyFish Web Search. Site: ${item.site_name}. Requires human verification.`,
          now,
        ],
      });

      createdSources.push({
        id: sourceId,
        url: item.url,
        title: item.title,
        publisher: item.site_name,
        source_type: "web",
        provider: "tinyfish",
      });

      createdEvidence.push({
        id: evidenceId,
        source_id: sourceId,
        source_title: item.title,
        source_url: item.url,
        claim: claimText,
        excerpt: item.snippet,
        provenance: "REAL_SOURCE",
        confidence: "High",
        reviewer_status: "UNREVIEWED",
      });
    }

    return apiSuccess(
      {
        jobId: `job-tf-${Date.now()}`,
        projectId: id,
        query,
        provider: "tinyfish",
        latencyMs: searchOutcome.latencyMs,
        sourcesCreated: createdSources.length,
        evidenceCreated: createdEvidence.length,
        sources: createdSources,
        evidence: createdEvidence,
      },
      "REAL_SOURCE",
      201
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("POST /api/projects/[id]/research-jobs error:", msg);
    return apiError("RESEARCH_JOB_ERROR", msg, 500);
  }
}
