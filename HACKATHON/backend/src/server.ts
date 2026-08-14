import { env } from './config/env'; // validates env vars first — fails fast before anything else runs
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/api';
import authRouter from './routes/authRoutes';

const app = express();
const HOST = '0.0.0.0';

// ── Security & platform middleware ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // required so the refresh-token cookie is sent cross-site
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) } }));

// App-wide rate limit (auth routes have their own tighter limit, see authRoutes.ts)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ── Health check (Docker HEALTHCHECK + Render health check both hit this) ──
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Kept for backwards compatibility with anything still probing this path.
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'E-Kishan Express Backend', timestamp: new Date().toISOString() });
});

// ── API routers ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

// ── Serve frontend static dist if present (monorepo-style deploy fallback) ─
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'E-Kishan Express Backend API Server', health: '/health' });
  });
}

// ── 404 + centralized error handling ────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Process guards ──────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => logger.error(`Unhandled Promise Rejection: ${reason instanceof Error ? reason.stack : String(reason)}`));
process.on('uncaughtException', (err) => logger.error(`Uncaught Exception: ${err.stack || err.message}`));

async function main() {
  await connectDB();
  app.listen(env.PORT, HOST, () => {
    logger.info(`🚀 E-Kishan Express Backend listening on http://${HOST}:${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  logger.error(`Fatal startup error: ${err instanceof Error ? err.stack : String(err)}`);
  process.exit(1);
});

export default app;
