import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import rateLimit from 'express-rate-limit';
import path from 'node:path';

import connectDB from './config/db.js';
import { swaggerUi, specs } from './config/swagger.js';
import authRoutes from './routes/auth.route.js';
import jobRoutes from './routes/job.route.js';
import candidateRoutes from './routes/candidate.route.js';
import screeningRoutes from './routes/screening.route.js';
import uploadRoutes from './routes/upload.route.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 4000;
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const publicDir = path.resolve(process.cwd(), 'public');
let databaseConnected = false;
const dbRetryIntervalMs = 15000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
  }),
);
app.use(express.json({ limit: '50mb' }));
app.use('/public', express.static(publicDir));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.get(['/', '/status'], (req, res) => {
  res.sendFile(path.join(publicDir, 'status.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/health', (req, res) => {
  const statusCode = databaseConnected ? 200 : 503;

  res.status(statusCode).json({
    status: databaseConnected ? 'ok' : 'degraded',
    time: new Date().toISOString(),
    databaseConnected,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  });
});

app.use(errorHandler);

const attemptDatabaseConnection = async () => {
  try {
    await connectDB();
    databaseConnected = true;
  } catch (err) {
    databaseConnected = false;
    logger.error('Database unavailable. Status page will remain online in disconnected mode.');
  }
};

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Umurava AI Backend running on http://localhost:${PORT}`);
  });

  await attemptDatabaseConnection();

  setInterval(() => {
    if (!databaseConnected) {
      void attemptDatabaseConnection();
    }
  }, dbRetryIntervalMs);
};

startServer();
