import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db, initializeDatabase } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import { isTrustedOrigin } from './config/security.js';

import publicRouter from './routes/public.js';
import authRouter from './routes/auth.js';
import adminProjectsRouter from './routes/adminProjects.js';
import adminMediaRouter from './routes/adminMedia.js';
import adminContentRouter from './routes/adminContent.js';
import selectedWorksAdminRouter from './routes/adminSelectedWorks.js';
import adminCvRouter from './routes/adminCv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
let httpServer = null;
let serverlessInitPromise = null;
const ensureServerlessInitialized = () => {
  if (!serverlessInitPromise) {
    serverlessInitPromise = initializeDatabase().then(() => seedDatabase());
  }
  return serverlessInitPromise;
};
app.disable('x-powered-by');
const rawHops = process.env.TRUST_PROXY_HOPS !== undefined ? Number(process.env.TRUST_PROXY_HOPS) : (process.env.VERCEL ? 1 : 0);
const proxyHops = Number.isInteger(rawHops) && rawHops >= 0 && rawHops <= 5 ? rawHops : (process.env.VERCEL ? 1 : 0);
app.set('trust proxy', proxyHops);

// Ensure req.socket and remoteAddress exist in serverless environments
app.use((req, res, next) => {
  try {
    if (!req.socket) {
      req.socket = {};
    }
    if (!req.socket.remoteAddress) {
      const xff = req.headers?.['x-forwarded-for'];
      req.socket.remoteAddress = (typeof xff === 'string' && xff.split(',')[0].trim()) || req.headers?.['x-real-ip'] || '127.0.0.1';
    }
  } catch {
    // Ignore polyfill fallback errors
  }
  next();
});

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || isTrustedOrigin(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  })
);
app.options('*', cors());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self' https:; frame-src 'self' https:");
  }
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '100kb', parameterLimit: 50 }));

// Await schema and seed setup before serving the first serverless API request.
app.use('/api', async (req, res, next) => {
  if (!process.env.VERCEL) return next();
  try { await ensureServerlessInitialized(); next(); }
  catch { return res.status(503).json({ success: false, error: 'Portfolio storage is unavailable. Check DATABASE_URL and database connectivity.' }); }
});

// Static files (uploads, public assets, and selective works)
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));
app.use('/assets', express.static(path.join(publicDir, 'assets')));

const selectedWorksDir = path.resolve(__dirname, '../Selected works/Selected works');
if (fs.existsSync(selectedWorksDir)) {
  app.use('/selected-works', express.static(selectedWorksDir));
}

// API Routes
app.use('/api', publicRouter);
app.use('/api/admin/auth', authRouter);
app.use('/api/admin/projects', adminProjectsRouter);
app.use('/api/admin/media', adminMediaRouter);
app.use('/api/admin/cv', adminCvRouter);
app.use('/api/admin/selected-works', selectedWorksAdminRouter);
app.use('/api/admin', adminContentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: db.isPostgres ? 'postgresql' : 'local-development' });
});

app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'API route not found.' }));

// Production Client Serving
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || (err.code === 'LIMIT_FILE_SIZE' ? 413 : err.code?.startsWith('LIMIT_') ? 400 : err.code === '23505' || err.code === '23503' || err.code === 'CATEGORY_IN_USE' ? 409 : 500);
  console.error('[Server Error]', { method: req.method, path: req.path, status, code: err.code || 'UNHANDLED' });
  res.status(status).json({
    success: false,
    error: status >= 500 ? 'An internal error occurred.' : err.message || 'Invalid request.',
  });
});

// Apply schema and one-time bootstrap before listening; failed initialization stays unavailable.
if (!process.env.VERCEL) {
  initializeDatabase()
    .then(() => seedDatabase())
    .then(() => {
      httpServer = app.listen(PORT, () => {
        console.log(`[Server] Sanjay Portfolio API running on http://localhost:${PORT}`);
      });
    })
    .catch(async (err) => {
      console.error('[Server] Database or administrator bootstrap failed:', err?.message || err);
      try { await db.close(); } catch { /* preserve the startup error status */ }
      process.exitCode = 1;
    });

  let shuttingDown = false;
  const shutdown = () => {
    if (!httpServer || shuttingDown) return;
    shuttingDown = true;
    const forceExit = setTimeout(() => process.exit(1), 10000);
    forceExit.unref?.();
    httpServer.close(async () => {
      clearTimeout(forceExit);
      try {
        await db.close();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} else {
  // Warm the serverless instance; the API middleware also awaits this promise per request.
  void ensureServerlessInitialized();
}

export default app;
