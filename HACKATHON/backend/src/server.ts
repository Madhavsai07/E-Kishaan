import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

// Global CORS & Body Parsers
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express API Health Check (Direct Root & API Route)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'E-Kishan Express Backend', timestamp: new Date().toISOString() });
});

// Primary REST API Router
app.use('/api', apiRouter);

// Serve frontend static dist if available (Monorepo deployment)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root fallback for API-only deployment
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      message: 'E-Kishan Express Backend API Server',
      health: '/api/health',
    });
  });
}

// Global Express Error Middleware (Prevents server crashes on unhandled errors)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Backend API Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? err.message : err.stack,
  });
});

// Process Guard Handlers
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 E-Kishan Express Backend listening on http://${HOST}:${PORT}`);
});

export default app;
