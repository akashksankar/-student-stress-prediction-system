import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes.js';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createExpressApp() {
  const app = express();

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Ensure Database initializes
  app.use(async (req, res, next) => {
    try {
      await getDb();
    } catch (err) {
      console.warn('DB initialization error on request:', err);
    }
    next();
  });

  // Mount API router on both '/api' and '/' so regardless of whether Vercel preserves or strips '/api', routes work
  app.use('/api', apiRouter);
  app.use(apiRouter);

  return app;
}

const app = createExpressApp();
export default app;
