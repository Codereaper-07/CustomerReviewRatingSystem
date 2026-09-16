import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Reads the JWT from the HttpOnly auth cookie, verifies it, and attaches
 * the authenticated identity to `req.user` as `{ id, role }`.
 *
 * Rejects missing, invalid, or expired tokens with a generic 401 — never
 * leaks JWT verification internals (e.g. which check failed) to the client.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.authCookieName];

  if (!token) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token.');
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
});

export default authenticate;
