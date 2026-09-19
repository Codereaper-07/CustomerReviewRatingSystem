import apiClient from '../../../services/apiClient.js';

export const adminApi = {
  async getDashboard() {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  async getProductInsights() {
    const response = await apiClient.get('/admin/product-insights');
    return response.data.data;
  },
};

export default adminApi;
