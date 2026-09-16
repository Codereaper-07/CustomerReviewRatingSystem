import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/ApiResponse.js';
import env, { isProduction } from '../../config/env.js';
import * as authService from './auth.service.js';

/**
 * HttpOnly auth cookie options. Secure/SameSite adapt to environment:
 * production requires HTTPS + strict cross-site protection, while local
 * development (frontend/backend on different ports over HTTP) relaxes
 * both so the cookie still round-trips.
 */
function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: env.jwtExpiresInMs,
  };
}

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json(success(user));
});

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.authenticateUser(req.body);
  res.cookie(env.authCookieName, token, getAuthCookieOptions());
  res.status(200).json(success(user));
});

export const logout = asyncHandler(async (req, res) => {
  const { maxAge, ...clearOptions } = getAuthCookieOptions();
  res.clearCookie(env.authCookieName, clearOptions);
  res.status(200).json(success({ loggedOut: true }));
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.status(200).json(success(user));
});
