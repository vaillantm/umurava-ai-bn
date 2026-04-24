import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

import { swaggerUi, specs } from './config/swagger.js';
import authRoutes from './routes/auth.route.js';
import jobRoutes from './routes/job.route.js';
import candidateRoutes from './routes/candidate.route.js';
import screeningRoutes from './routes/screening.route.js';
import uploadRoutes from './routes/upload.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import { primeAuthCache } from './services/auth-cache.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [process.env.CLIENT_URL || 'http://localhost:3000'];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method.padEnd(6)} ${String(res.statusCode).padEnd(3)}  ${req.url}  ${ms}ms`);
  });
  next();
});

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await primeAuthCache();
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs on http://localhost:${PORT}/api-docs`);
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Kill the process or change PORT in .env`);
        process.exit(1);
      } else throw err;
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
