import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { taskRouter } from './routes/task.routes';

export const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/tasks', taskRouter);
app.use(notFoundHandler);
app.use(errorHandler);
