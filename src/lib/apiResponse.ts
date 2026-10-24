/**
 * IdeaProbe — Standard API Response Helpers
 *
 * Implements the shared response and error shape defined in docs/api-contract.md:
 * Success: { data, meta: { requestId, schemaVersion: "1.0", provenance? } }
 * Error:   { error: { code, message, retryable, details? }, meta: { requestId } }
 */

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export interface ApiMeta {
  requestId: string;
  schemaVersion: string;
  provenance?: string;
  timestamp: string;
}

export function apiSuccess<T>(data: T, provenance?: string, status = 200) {
  const meta: ApiMeta = {
    requestId: uuidv4(),
    schemaVersion: "1.0",
    timestamp: new Date().toISOString(),
    ...(provenance ? { provenance } : {}),
  };
  return NextResponse.json({ data, meta }, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  retryable = false,
  details?: Record<string, unknown>
) {
  const meta: ApiMeta = {
    requestId: uuidv4(),
    schemaVersion: "1.0",
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(
    {
      error: {
        code,
        message,
        retryable,
        ...(details ? { details } : {}),
      },
      meta,
    },
    { status }
  );
}
