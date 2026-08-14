# Architecture

## Services

E-Kishaan is three independently deployable services:

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌───────────────────────────┐
│   Frontend (Vercel)  │──────▶│  Backend (Render, Docker)  │──────▶│  ML Backend (Render, Python) │
│   React + Vite SPA   │  REST  │  Express + MongoDB + JWT   │  REST  │  FastAPI + XGBoost/Prophet    │
│   HACKATHON/frontend │◀──────│  HACKATHON/backend          │◀──────│  HACKATHON/ml_backend          │
└─────────────────────┘        └──────────────────────────┘        └───────────────────────────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │   MongoDB      │
                                  │  (Atlas/self-  │
                                  │   hosted)      │
                                  └───────────────┘
```

- **Frontend** — a Vite/React SPA. Talks to the Express backend for auth, soil, roadmap,
  and crop data (via `VITE_API_URL`), and directly to the ML backend for market price
  predictions (via `VITE_ML_BACKEND_URL`) — that split already existed before this
  deployment split and wasn't changed.
- **Backend** — Express, runs as a Docker container on Render. Owns authentication
  (JWT access + refresh tokens, MongoDB-backed) and everything under `/api/*`. The other
  modules (soil, roadmap, market summary, crop recommendation, solver) are unchanged —
  they were already computed server-side rather than reading from a database.
- **ML backend** — FastAPI, unchanged, still deploys on Render's native Python runtime
  (not Dockerized — it already worked, and there was no reason to add Docker there).

## Why MongoDB, not Supabase

Auth used to be Supabase (Postgres + Supabase Auth). It moved to a self-owned MongoDB +
JWT system so the backend doesn't depend on a third-party auth provider staying free/
available, and so it's fully portable to any MongoDB host. See `MIGRATION.md` for how
existing Supabase accounts move over.

## Auth flow

- **Access token**: short-lived JWT (15 min default), returned in the response body,
  kept in memory only on the frontend (never localStorage) to shrink the XSS attack
  surface. Sent as `Authorization: Bearer <token>`.
- **Refresh token**: long-lived (30 days default) random opaque value, never a JWT — its
  SHA-256 hash is stored in MongoDB (`RefreshToken` collection) so it can be revoked
  immediately (logout, rotation). Delivered as an `httpOnly; Secure; SameSite=None`
  cookie scoped to `/api/auth`.
- On every access-token expiry, the frontend's `apiFetch` wrapper (`lib/apiClient.ts`)
  automatically calls `/api/auth/refresh` once and retries the original request — callers
  never see a 401 from an expired (but still refreshable) session.

### Known trade-off: cross-site cookies

Vercel's and Render's default domains (`*.vercel.app` / `*.onrender.com`) are different
registrable domains, so the refresh-token cookie is a **third-party cookie** from the
browser's perspective, even though it's `SameSite=None; Secure`. This works in mainstream
browsers today, but third-party cookie restrictions (Safari ITP, Chrome's Privacy
Sandbox changes) are an active area of browser policy — a cookie that works today isn't
guaranteed to keep working indefinitely on two unrelated default domains.

**Long-term fix**: put both services under one registrable domain, e.g.
`app.yourdomain.com` (Vercel) and `api.yourdomain.com` (Render) — cookies scoped to
`.yourdomain.com` are first-party for both, sidestepping the issue entirely. This needs
you to own a domain and configure it in both the Vercel and Render dashboards; nothing in
the code needs to change to support it (the cookie is already set without an explicit
`Domain` attribute, so it'll naturally scope correctly once both services share one).

## What did NOT change

Every other module (Weather, Soil Health, Crop Growth/Recommendation, Market Prediction,
My Farm Roadmap, AI Solver, i18n/multi-language) keeps its existing logic, UI, and API
contracts untouched. The only backend behavior change outside auth is that all API
responses now go through the same security middleware (helmet, rate limiting, etc.) and
error-handling shape.
