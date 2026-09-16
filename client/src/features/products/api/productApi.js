import apiClient from '../../../services/apiClient.js';

export const productApi = {
  async listProducts({ limit = 9, cursor } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  },

  async getProductById(productId) {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data.data;
  },

  async createProduct(data) {
    const response = await apiClient.post('/products', data);
    return response.data.data;
  },

  async updateProduct(productId, data) {
    const response = await apiClient.put(`/products/${productId}`, data);
    return response.data.data;
  },

  async deleteProduct(productId) {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data.data;
  },
};

export default productApi;
