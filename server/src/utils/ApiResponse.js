/**
 * Helpers that produce the standard success/paginated response envelopes
 * documented in the API design spec.
 */
export function success(data) {
  return { success: true, data };
}

export function paginated(data, pagination) {
  return { success: true, data, pagination };
}

export default { success, paginated };
