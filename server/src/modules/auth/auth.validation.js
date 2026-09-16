import { z } from 'zod';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Registration intentionally has no `role` field — the client can never
 * choose "admin" (or anything else) during registration; the service
 * layer always forces new accounts to "customer".
 */
const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name is too long.'),
  email: z.string().trim().toLowerCase().email('A valid email is required.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password is too long.'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * Builds an Express middleware that validates `req.body` against a Zod
 * schema, replacing `req.body` with the parsed (trimmed/normalized) data
 * on success, or forwarding a 400 ApiError with field-level details.
 */
function validateBody(schema) {
  return function validate(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data.', details));
    }

    req.body = result.data;
    next();
  };
}

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
