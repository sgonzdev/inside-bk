import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './shared/config/env';
import { errorHandler } from './shared/middleware/error-handler';
import { generalLimiter } from './shared/middleware/rate-limiter';
import apiRoutes from './shared/routes';
import swaggerRouter from './infrastructure/swagger/swagger';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '500kb' }));
app.use(cookieParser());

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() });
});

app.use('/api', generalLimiter, apiRoutes);
app.use('/docs', swaggerRouter);
app.get('/ws-test', (_req, res) => {
  res.sendFile(path.join(__dirname, 'infrastructure/websocket/ws-playground.html'));
});
app.get('/diary-test', (_req, res) => {
  res.sendFile(path.join(__dirname, 'infrastructure/playground/diary-playground.html'));
});
app.get('/chat-test', (_req, res) => {
  res.sendFile(path.join(__dirname, 'infrastructure/playground/chat-playground.html'));
});


app.use(errorHandler);

export default app;
