import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

/**
 * Generic cursor-based pagination helpers, shared by any module that lists
 * records newest-first (Products, Reviews, ...). Deliberately dependency-
 * free beyond Mongoose (needed to build a correctly-typed ObjectId filter)
 * and intentionally minimal: no pagination classes/services, no
 * page/skip-based pagination, no third-party pagination libraries.
 *
 * Ordering contract: all consumers must sort by { createdAt: -1, _id: -1 }
 * (see CURSOR_SORT below). The cursor encodes the last item's createdAt +
 * _id, and the filter fetches strictly "after" that position in that same
 * descending order, using _id as the tie-breaker when createdAt matches.
 */

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

/** The sort every cursor-paginated query must use for the cursor to be valid. */
export const CURSOR_SORT = { createdAt: -1, _id: -1 };

/**
 * Parses and validates the `limit` query parameter.
 * - Missing/empty -> DEFAULT_LIMIT.
 * - Not a positive integer -> 400 ApiError (no silent coercion of garbage input).
 * - Above MAX_LIMIT -> capped to MAX_LIMIT (server enforces the ceiling).
 */
export function parseLimit(rawLimit) {
  if (rawLimit === undefined || rawLimit === null || rawLimit === '') {
    return DEFAULT_LIMIT;
  }

  const limit = Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new ApiError(400, 'INVALID_PAGINATION', '`limit` must be a positive integer.');
  }

  return Math.min(limit, MAX_LIMIT);
}

/**
 * Encodes a cursor from the last item of a page. The wire format is an
 * opaque, base64url-encoded JSON string — clients must treat it as a
 * black box and only pass it back verbatim as `?cursor=`.
 */
export function encodeCursor({ createdAt, _id }) {
  const payload = JSON.stringify({
    createdAt: new Date(createdAt).toISOString(),
    _id: String(_id),
  });
  return Buffer.from(payload, 'utf8').toString('base64url');
}

/**
 * Decodes and validates a cursor produced by `encodeCursor`.
 * Returns `null` when no cursor was provided (first page).
 * Throws a 400 ApiError for anything malformed/tampered-with, without
 * leaking why decoding failed.
 */
export function decodeCursor(rawCursor) {
  if (rawCursor === undefined || rawCursor === null || rawCursor === '') {
    return null;
  }

  const invalidCursorError = new ApiError(400, 'INVALID_CURSOR', 'The provided cursor is invalid.');

  let payload;
  try {
    payload = JSON.parse(Buffer.from(rawCursor, 'base64url').toString('utf8'));
  } catch {
    throw invalidCursorError;
  }

  const id = payload?._id;
  const createdAt = new Date(payload?.createdAt);

  if (typeof id !== 'string' || !mongoose.isValidObjectId(id) || Number.isNaN(createdAt.getTime())) {
    throw invalidCursorError;
  }

  return { createdAt, _id: id };
}

/**
 * Builds the MongoDB filter that fetches records strictly "after" the
 * cursor position under { createdAt: -1, _id: -1 } ordering:
 *   - createdAt earlier than the cursor's, OR
 *   - the same createdAt with a smaller _id (tie-breaker).
 * Returns `{}` (no constraint) when there is no cursor, i.e. the first page.
 */
export function buildCursorFilter(cursor) {
  if (!cursor) return {};

  const cursorId = new mongoose.Types.ObjectId(cursor._id);

  return {
    $or: [{ createdAt: { $lt: cursor.createdAt } }, { createdAt: cursor.createdAt, _id: { $lt: cursorId } }],
  };
}

/**
 * Convenience wrapper combining limit + cursor parsing for a controller's
 * `req.query`.
 */
export function parsePaginationParams(query = {}) {
  return {
    limit: parseLimit(query.limit),
    cursor: decodeCursor(query.cursor),
  };
}

/**
 * Builds the page of items + pagination metadata from a query result.
 *
 * Callers must fetch `limit + 1` records (sorted by CURSOR_SORT) and pass
 * the raw array here — the extra record is how we detect a next page
 * exists, without a separate count query.
 */
export function buildPaginationMeta(records, limit) {
  const hasNextPage = records.length > limit;
  const items = hasNextPage ? records.slice(0, limit) : records;
  const lastItem = items[items.length - 1];

  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    items,
    pagination: { nextCursor, hasNextPage },
  };
}

export default {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  CURSOR_SORT,
  parseLimit,
  encodeCursor,
  decodeCursor,
  buildCursorFilter,
  parsePaginationParams,
  buildPaginationMeta,
};
