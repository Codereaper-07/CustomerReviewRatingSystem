import apiClient from '../../../services/apiClient.js';

export const authApi = {
  async register({ name, email, password }) {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data.data;
  },

  async login({ email, password }) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data.data;
  },

  async getMe() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data?.data ?? null;
    } catch (err) {
      if (err.response?.status === 401) {
        return null;
      }
      throw err;
    }
  },
};

export default authApi;
