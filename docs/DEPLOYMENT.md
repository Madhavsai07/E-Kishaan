# Deployment

Two independent services. Deploy the backend first — the frontend needs its URL.

## 1. Backend → Render (Docker)

1. **Provision MongoDB** first (not covered here — e.g. a free MongoDB Atlas cluster).
   Grab its connection string.
2. Render dashboard → **New → Web Service** → connect this GitHub repo.
3. Render should detect `render.yaml` at the repo root and offer to create both services
   from it (`e-kishaan-backend` + `e-kishaan-ml-backend`) in one go — accept that, or
   configure `e-kishaan-backend` manually with:
   - **Environment**: Docker
   - **Dockerfile Path**: `HACKATHON/backend/Dockerfile`
   - **Docker Context**: `HACKATHON/backend`
   - **Health Check Path**: `/health`
4. Set the environment variables Render prompts for (everything marked `sync: false` in
   `render.yaml` — see `docs/ENVIRONMENT.md` for what each one is). At minimum:
   `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`.
   `FRONTEND_URL` can be a placeholder for now — you'll update it after step 2 gives you
   the real Vercel URL.
5. Deploy. Confirm `https://<your-service>.onrender.com/health` returns `{"status":"ok"}`.

## 2. ML backend → Render (native Python)

Unchanged from before this split — `render.yaml`'s `e-kishaan-ml-backend` service deploys
it automatically alongside the backend if you used the "create from render.yaml" flow in
step 3 above. No Docker, no new env vars beyond what already existed.

## 3. Frontend → Vercel

1. Vercel dashboard → **Add New → Project** → import this repo.
2. Vercel should pick up the root `vercel.json` (build command
   `cd HACKATHON/frontend && npm install && npm run build`, output directory
   `HACKATHON/frontend/dist`) automatically. If it asks for a root directory, leave it at
   the repo root (not `HACKATHON/frontend`) so `vercel.json`'s paths resolve correctly.
3. Project Settings → Environment Variables → add:
   - `VITE_API_URL` = the Render backend URL from step 1 (e.g.
     `https://e-kishaan-backend.onrender.com`)
   - `VITE_ML_BACKEND_URL` = the Render ML backend URL from step 2
4. Deploy.

## 4. Close the loop

Go back to the Render backend service and set `FRONTEND_URL` to the real Vercel URL from
step 3 (needed for CORS — requests from any other origin are rejected — and for the links
inside password-reset/setup emails). Redeploy the backend for it to take effect.

## 5. (Optional) Migrate existing Supabase accounts

See `docs/MIGRATION.md`. Run once, locally, before or after going live — it writes
directly to the production `MONGODB_URI`, so point your local `.env` at the real
connection string when you run it, not a local dev database.

## Verifying the split works end-to-end

1. Open the Vercel URL, sign up a new account (this exercises: frontend → backend CORS,
   MongoDB write, JWT issuance, refresh cookie).
2. Reload the page — you should stay logged in (silent refresh using the cookie).
3. Open Soil Health / My Farm Roadmap / Crop Growth tabs — each calls the backend via
   `VITE_API_URL`; if any of them silently show stale/fallback data, check the browser
   console for CORS or `VITE_API_URL` errors.
4. Open Market Prediction — calls the ML backend directly via `VITE_ML_BACKEND_URL`.
5. Log out, then use "Forgot password" — check the backend's Render logs for the emailed
   link (or your inbox, if `EMAIL_USER`/`EMAIL_PASS` are set).

## Local development

```bash
# Terminal 1 — backend (needs a MongoDB, e.g. docker/docker-compose.yml, or Atlas)
cd HACKATHON/backend
cp .env.example .env   # fill in MONGODB_URI, JWT secrets, FRONTEND_URL=http://localhost:5173
npm install
npm run dev             # http://localhost:5000

# Terminal 2 — ML backend
cd HACKATHON/ml_backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3 — frontend
cd HACKATHON/frontend
cp .env.local.example .env.local   # defaults already point at localhost:5000 / :8000
npm install
npm run dev              # http://localhost:5173 (or next free port)
```

Or start the backend + a local MongoDB together via Docker — see `docker/README.md`.
