import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// API Router
app.use('/api', apiRouter);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to AgriSmart E-Kishaan Backend API Server',
    endpoints: '/api/health',
  });
});

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 AgriSmart Express Backend running on http://${HOST}:${PORT}`);
});

export default app;
