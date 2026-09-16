import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import { productReviewsRouter, reviewsRouter } from './modules/reviews/review.routes.js';

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
app.use('/api/v1/products', productRoutes);
// Nested review routes (/:productId/reviews) fall through from
// productRoutes above since it has no matching route of its own.
app.use('/api/v1/products', productReviewsRouter);
app.use('/api/v1/reviews', reviewsRouter);

// --- 404 + centralized error handling ---------------------------------------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
