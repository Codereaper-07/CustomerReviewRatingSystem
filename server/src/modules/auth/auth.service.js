import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';
import env from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const SALT_ROUNDS = 12;

// Precomputed at module load so `authenticateUser` can always run a bcrypt
// comparison, even when no user exists for the given email. This keeps
// response timing for "unknown email" and "wrong password" similar, so
// the login endpoint doesn't leak which one occurred via timing.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('no-such-account-timing-guard', SALT_ROUNDS);

/**
 * Maps a User document to the safe, public shape returned by the API.
 * passwordHash is never included, even if it happened to be selected.
 */
function toSafeUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

function signToken(user) {
  // Minimal payload: sub + role only (iat/exp are added by jsonwebtoken).
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Role is never taken from client input — registration always creates
  // a customer. Admin accounts are provisioned outside this flow.
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'customer',
  });

  return toSafeUser(user);
}

export async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const hashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const token = signToken(user);
  return { token, user: toSafeUser(user) };
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
  }
  return toSafeUser(user);
}

export default { registerUser, authenticateUser, getUserById };
