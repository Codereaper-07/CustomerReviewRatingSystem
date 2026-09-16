import { ApiError } from '../utils/ApiError.js';

/**
 * Restricts a route to authenticated customers only. Must run after
 * `authenticate()` so `req.user` is already populated. Mirrors
 * `requireAdmin` — this app has exactly two roles (customer, admin),
 * so this is a plain role check, not a general RBAC/permissions system.
 */
export function requireCustomer(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required.'));
  }

  if (req.user.role !== 'customer') {
    return next(new ApiError(403, 'FORBIDDEN', 'Customer access required.'));
  }

  next();
}

export default requireCustomer;
