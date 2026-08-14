# syntax=docker/dockerfile:1

# ── Stage 1: build ───────────────────────────────────────────────────────
# Installs full deps (incl. devDependencies, needed for `tsc`) and compiles
# TypeScript -> dist/. This stage's node_modules never ships in the final image.
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────
# Only production deps + the compiled output, run as a non-root user.
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# wget is used by the HEALTHCHECK below; alpine's base image doesn't include it.
RUN apk add --no-cache wget

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Run as the built-in unprivileged `node` user rather than root.
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/health || exit 1

CMD ["node", "dist/server.js"]
