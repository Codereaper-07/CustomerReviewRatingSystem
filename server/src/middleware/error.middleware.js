import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Centralized error handler. Every error in the application should
 * eventually flow through here so API responses stay consistent and
 * stack traces / internals are never leaked in production.
 */
export function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isKnownError = err instanceof ApiError || err?.isApiError;

  const statusCode = isKnownError ? err.statusCode : 500;
  const code = isKnownError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isKnownError || !isProduction
    ? err.message
    : 'Something went wrong. Please try again later.';

  if (!isKnownError) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(isKnownError && err.details ? { details: err.details } : {}),
      ...(!isProduction && !isKnownError ? { stack: err.stack } : {}),
    },
  });
}

export function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

export default errorMiddleware;
