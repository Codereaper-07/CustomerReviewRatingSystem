import apiClient from '../../../services/apiClient.js';

export const reviewApi = {
  async listReviews(productId, { limit = 10, cursor } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get(`/products/${productId}/reviews?${params.toString()}`);
    return response.data;
  },

  async createReview(productId, data) {
    const response = await apiClient.post(`/products/${productId}/reviews`, data);
    return response.data.data;
  },

  async updateReview(reviewId, data) {
    const response = await apiClient.patch(`/reviews/${reviewId}`, data);
    return response.data.data;
  },

  async deleteReview(reviewId) {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data.data;
  },
};

export default reviewApi;
