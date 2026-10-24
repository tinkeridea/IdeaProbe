import { NextRequest } from "next/server";
import { initDb, getDb, nowUtc } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/apiResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/runs/[id]/retry — Retry a failed stage or entire run
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();

    // Verify run exists
    const runCheck = await db.execute({
      sql: "SELECT id, status FROM runs WHERE id = ?",
      args: [id],
    });
    if (runCheck.rows.length === 0) {
      return apiError("RUN_NOT_FOUND", `Run '${id}' not found.`, 404);
    }

    const body = await req.json().catch(() => ({}));
    const { stage, idempotencyKey } = body;
    const timestamp = nowUtc();

    if (stage) {
      // Retry specific stage
      const result = await db.execute({
        sql: `UPDATE stages 
              SET status = 'queued', attempt = attempt + 1, safe_error = NULL 
              WHERE run_id = ? AND stage_key = ?`,
        args: [id, stage],
      });
      if (result.rowsAffected === 0) {
        return apiError("STAGE_NOT_FOUND", `Stage '${stage}' not found for run '${id}'.`, 404);
      }
    } else {
      // Retry all non-completed stages
      await db.execute({
        sql: `UPDATE stages 
              SET status = 'queued', attempt = attempt + 1, safe_error = NULL 
              WHERE run_id = ? AND status != 'completed'`,
        args: [id],
      });
    }

    // Set run back to running/queued
    await db.execute({
      sql: "UPDATE runs SET status = 'queued', completed_at = NULL WHERE id = ?",
      args: [id],
    });

    return apiSuccess({
      runId: id,
      stage: stage || "all_pending",
      status: "queued",
      idempotencyKey: idempotencyKey || null,
      retried_at: timestamp,
    });
  } catch (err: any) {
    console.error("POST /api/runs/[id]/retry error:", err);
    return apiError("RETRY_FAILED", err.message, 500);
  }
}
