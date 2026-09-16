/**
 * Standard application error. Thrown from services/controllers and
 * translated into the centralized error response format by
 * middleware/error.middleware.js.
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isApiError = true;
  }
}

export default ApiError;
