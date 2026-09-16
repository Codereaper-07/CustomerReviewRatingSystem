import { ApiError } from '../utils/ApiError.js';

/**
 * Restricts a route to authenticated admins only. Must run after
 * `authenticate()` so `req.user` is already populated.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required.'));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'FORBIDDEN', 'Admin access required.'));
  }

  next();
}

export default requireAdmin;
