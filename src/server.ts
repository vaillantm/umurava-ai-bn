import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';           // Use plain pino instead of pino-http for simplicity
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

import { swaggerUi, specs } from '../src/config/swagger.js';
import authRoutes from './routes/auth.route.js';
import jobRoutes from './routes/job.route.js';
import candidateRoutes from './routes/candidate.route.js';
import screeningRoutes from './routes/screening.route.js';
import uploadRoutes from './routes/upload.route.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 4000;
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000' 
}));
app.use(express.json({ limit: '50mb' }));

// Simple request logging with pino
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100 
}));


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro'
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Umurava AI Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();