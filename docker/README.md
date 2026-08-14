# Docker — local dev & image verification

## Run the backend + a local MongoDB together

```bash
cd docker
docker compose up --build
```

This starts:
- `mongodb` — MongoDB 7, exposed on `localhost:27017`, data persisted in a named volume.
- `backend` — the Express API (built from `HACKATHON/backend/Dockerfile`), exposed on `localhost:5000`, pre-wired with working (but dev-only, insecure) JWT secrets and pointed at the `mongodb` container.

Then run the frontend separately (it isn't containerized — Vercel builds it directly from source):

```bash
cd HACKATHON/frontend
npm install
npm run dev
```

Point the frontend's `.env.local` at `VITE_API_URL=http://localhost:5000`.

## Build/run just the backend image

```bash
docker build -t ekishaan-backend -f HACKATHON/backend/Dockerfile HACKATHON/backend

docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/ekishaan" \
  -e JWT_ACCESS_SECRET="dev-access-secret-at-least-32-characters-long" \
  -e JWT_REFRESH_SECRET="dev-refresh-secret-at-least-32-characters-long" \
  -e FRONTEND_URL="http://localhost:5173" \
  ekishaan-backend
```

Check it's alive:

```bash
curl http://localhost:5000/health
# {"status":"ok"}
```

## Notes

- The migration script (`npm run migrate:supabase`, see `../docs/MIGRATION.md`) is **not** run
  inside the container — it's a one-off, run locally with `npm install` (which needs
  devDependencies the production image deliberately excludes).
- `docker-compose.yml`'s secrets are dev-only placeholders. Never reuse them in production —
  generate real ones (see `HACKATHON/backend/.env.example`) and set them via Render's
  dashboard, not this file.
