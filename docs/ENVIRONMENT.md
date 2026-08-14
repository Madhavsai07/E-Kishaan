# Environment variables

## Backend — `HACKATHON/backend/.env` (see `.env.example`)

| Variable | Required | Service | Notes |
|---|---|---|---|
| `NODE_ENV` | no (default `development`) | backend | `production` on Render |
| `PORT` | no (default `5000`) | backend | Render sets this automatically |
| `MONGODB_URI` | **yes** | backend | Atlas connection string or local mongod URI |
| `JWT_ACCESS_SECRET` | **yes** | backend | random string, 32+ chars |
| `JWT_REFRESH_SECRET` | **yes** | backend | random string, 32+ chars, **different** from the access secret |
| `JWT_ACCESS_EXPIRY` | no (default `15m`) | backend | jsonwebtoken duration format |
| `JWT_REFRESH_EXPIRY` | no (default `30d`) | backend | jsonwebtoken duration format |
| `FRONTEND_URL` | **yes** | backend | full origin, e.g. `https://your-app.vercel.app` — used for CORS + email links |
| `ML_BACKEND_URL` | no (default `http://localhost:8000`) | backend | the FastAPI service's URL |
| `EMAIL_HOST` | no (default `smtp.gmail.com`) | backend | |
| `EMAIL_PORT` | no (default `587`) | backend | |
| `EMAIL_USER` | no | backend | if unset, password-reset/setup links are logged to the console instead of emailed |
| `EMAIL_PASS` | no | backend | an app password, not your real account password, for Gmail/most providers |

Generate strong secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Backend migration script only — `HACKATHON/backend/.env` (see `scripts/.env.migration.example`)

| Variable | Notes |
|---|---|
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | the **secret** service_role key (Project Settings → API) — never the anon key, never committed |

These are only read by `npm run migrate:supabase`, never by the running server.

## Frontend — `HACKATHON/frontend/.env.local` (see `.env.local.example`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | **yes** (once split across domains) | the Express backend's URL, no trailing slash |
| `VITE_ML_BACKEND_URL` | no (default `http://localhost:8000`) | the FastAPI service's URL |

If `VITE_API_URL` is unset, the frontend logs a console error and falls back to relative
paths — which only work if the frontend happens to be served from the same origin as the
backend (the old monorepo-style deploy). Once split across Vercel + Render, this **must**
be set.

## Where to set these in production

- **Render** (backend): dashboard → service → Environment. `render.yaml` lists every var
  with `sync: false` as a placeholder Render will prompt for on first deploy.
- **Vercel** (frontend): dashboard → project → Settings → Environment Variables. Set
  `VITE_API_URL` there (build-time — a redeploy is needed if you change it).
