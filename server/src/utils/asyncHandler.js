/**
 * Wraps an async Express route/controller handler so rejected promises
 * are forwarded to next(err) instead of requiring try/catch everywhere.
 */
export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export default asyncHandler;
