import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

// --- Security & core middleware -------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- Health check -----------------------------------------------------------
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// --- Feature module routes are mounted here as they are implemented. -------
app.use('/api/v1/auth', authRoutes);

// --- 404 + centralized error handling ---------------------------------------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
