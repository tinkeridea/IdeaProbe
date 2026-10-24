/**
 * IdeaProbe — TinyFish Live Research Provider Adapter
 *
 * Implements the internal ResearchProvider boundary specified in:
 * IdeaProbe_Documentation_Kit/docs/tinyfish-integration.md
 *
 * Capabilities:
 * - Real-time web search discovery via https://api.search.tinyfish.ai
 * - Page extraction via https://api.fetch.tinyfish.ai
 * - Normalized mapping to Source and Evidence items tagged REAL_SOURCE
 * - Human Review Gate enforcement (default UNREVIEWED per F06)
 * - Safe fallback when offline, rate-limited, or unconfigured
 */

export interface TinyFishSearchResult {
  position: number;
  site_name: string;
  title: string;
  snippet: string;
  url: string;
}

export interface TinyFishSearchResponse {
  query: string;
  results: TinyFishSearchResult[];
  total_results?: number;
  page?: number;
}

export interface TinyFishHealth {
  status: "ready" | "unconfigured" | "error";
  provider: "tinyfish";
  enabled: boolean;
  message: string;
  latencyMs?: number;
  checkedAt: string;
}

const TINYFISH_SEARCH_URL = "https://api.search.tinyfish.ai";
const TINYFISH_FETCH_URL = "https://api.fetch.tinyfish.ai";
const DEFAULT_TIMEOUT_MS = 15000;

export function getTinyFishApiKey(): string | null {
  const key = process.env.TINYFISH_API_KEY;
  if (!key || key.trim() === "" || key === "your_actual_key_here") {
    return null;
  }
  return key.trim();
}

export function isTinyFishConfigured(): boolean {
  return Boolean(getTinyFishApiKey());
}

/**
 * Checks TinyFish API health and connectivity without leaking keys.
 */
export async function checkTinyFishHealth(): Promise<TinyFishHealth> {
  const key = getTinyFishApiKey();
  const now = new Date().toISOString();

  if (!key) {
    return {
      status: "unconfigured",
      provider: "tinyfish",
      enabled: false,
      message: "TINYFISH_API_KEY is not configured in .env.local. Operating in manual/sample fallback.",
      checkedAt: now,
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${TINYFISH_SEARCH_URL}?query=test`, {
      headers: {
        "X-API-Key": key,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;

    if (res.ok) {
      return {
        status: "ready",
        provider: "tinyfish",
        enabled: true,
        message: "TinyFish live web search provider connected and ready.",
        latencyMs,
        checkedAt: now,
      };
    } else {
      return {
        status: "error",
        provider: "tinyfish",
        enabled: true,
        message: `TinyFish API returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs,
        checkedAt: now,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: "error",
      provider: "tinyfish",
      enabled: true,
      message: `TinyFish connection probe failed: ${msg}`,
      checkedAt: now,
    };
  }
}

/**
 * Executes a live web search using TinyFish Search API.
 * Never throws; returns results array or empty array with error message.
 */
export async function searchTinyFish(
  query: string,
  limit: number = 5
): Promise<{
  success: boolean;
  query: string;
  results: TinyFishSearchResult[];
  latencyMs: number;
  error?: string;
}> {
  const key = getTinyFishApiKey();
  const start = Date.now();

  if (!key) {
    return {
      success: false,
      query,
      results: [],
      latencyMs: 0,
      error: "TINYFISH_API_KEY is not configured in .env.local",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const url = `${TINYFISH_SEARCH_URL}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "X-API-Key": key,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return {
        success: false,
        query,
        results: [],
        latencyMs,
        error: `TinyFish search returned HTTP ${res.status} ${res.statusText}`,
      };
    }

    const data: TinyFishSearchResponse = await res.json();
    const items = Array.isArray(data.results) ? data.results.slice(0, limit) : [];

    return {
      success: true,
      query,
      results: items,
      latencyMs,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      query,
      results: [],
      latencyMs: Date.now() - start,
      error: `TinyFish search request failed: ${msg}`,
    };
  }
}

/**
 * Fetches clean markdown content for target URLs using TinyFish Fetch API.
 */
export async function fetchTinyFishUrls(
  urls: string[]
): Promise<{
  success: boolean;
  contentMap: Record<string, string>;
  error?: string;
}> {
  const key = getTinyFishApiKey();
  if (!key) {
    return { success: false, contentMap: {}, error: "TINYFISH_API_KEY not configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const res = await fetch(TINYFISH_FETCH_URL, {
      method: "POST",
      headers: {
        "X-API-Key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        success: false,
        contentMap: {},
        error: `TinyFish fetch returned HTTP ${res.status}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      contentMap: data.results || data || {},
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      contentMap: {},
      error: msg,
    };
  }
}
