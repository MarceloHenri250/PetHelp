import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { notFound } from './middlewares/notFound.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/', (_req, res) => {
    res.json({
      name: 'PetHelp API',
      version: '0.0.1',
    });
  });

  app.use('/api', apiRouter);
  app.use(notFound);

  return app;
}