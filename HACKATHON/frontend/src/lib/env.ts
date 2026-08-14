/**
 * Centralizes + validates the env vars the frontend needs at runtime.
 * `VITE_API_URL` is the one that matters most once frontend (Vercel) and
 * backend (Render) are on separate domains — every relative `fetch('/api/...')`
 * call silently 404s once that split happens, so this is checked explicitly
 * rather than discovered later as a runtime bug.
 */
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

export const isApiUrlConfigured = Boolean(rawApiUrl);

if (!isApiUrlConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    '[env] VITE_API_URL is not set. API calls will be sent as relative paths, which only works if this frontend is ' +
      'served from the same origin as the backend. Set VITE_API_URL in .env.local (see .env.local.example) — ' +
      'this is required once the frontend and backend are deployed as separate services (Vercel + Render).',
  );
}

/** Strips a trailing slash so callers can safely do `${API_URL}/path`. Falls back to '' (relative paths) if unset, matching the pre-split same-origin deployment. */
export const API_URL = (rawApiUrl ?? '').replace(/\/$/, '');

export const ML_BACKEND_URL = ((import.meta.env.VITE_ML_BACKEND_URL as string | undefined) ?? 'http://localhost:8000').replace(/\/$/, '');
