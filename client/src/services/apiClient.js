import axios from 'axios';

/**
 * Shared Axios instance for all API calls.
 * Uses HttpOnly cookies for JWT auth (see architecture), so credentials
 * must be included on every request; no tokens are stored in JS.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export default apiClient;
