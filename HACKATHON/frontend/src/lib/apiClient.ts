import { API_URL } from './env';

// ─── Access token store ─────────────────────────────────────────────────────
// The access token lives in memory only (never localStorage, to shrink the
// XSS attack surface) — AuthContext is the only thing that calls
// `setAccessToken`; everything else just calls `apiFetch`.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ─── Refresh (dedup'd so concurrent 401s don't fire N parallel refreshes) ──
let refreshInFlight: Promise<string | null> | null = null;

/** Calls POST /api/auth/refresh using the httpOnly cookie. Returns the new access token, or null if the refresh itself failed (session truly expired). */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        const token = data?.accessToken ?? null;
        setAccessToken(token);
        return token;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Set false to skip the automatic 401 -> refresh -> retry-once dance (used by /auth/refresh itself, to avoid recursion). */
  allowRefreshRetry?: boolean;
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * The one fetch wrapper every service file should use. Prefixes VITE_API_URL,
 * attaches the bearer access token, always sends the refresh cookie
 * (`credentials: 'include'`), normalizes error responses to `ApiError`, and
 * transparently refreshes+retries once on a 401 caused by an expired access
 * token — so callers don't need to think about token expiry at all.
 */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { allowRefreshRetry = true, headers, ...rest } = options;

  const doFetch = async (): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    });

  let res = await doFetch();

  if (res.status === 401 && allowRefreshRetry) {
    const body = await parseJsonSafe(res.clone());
    const isExpired = body?.error?.code === 'TOKEN_EXPIRED' || body?.error?.code === 'UNAUTHORIZED';
    if (isExpired) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await doFetch();
      }
    }
  }

  const data = await parseJsonSafe(res);

  if (!res.ok || data?.success === false) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const code = data?.error?.code || 'UNKNOWN_ERROR';
    throw new ApiError(message, res.status, code);
  }

  return data as T;
}
