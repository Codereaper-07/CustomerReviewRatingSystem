import apiClient from '../../../services/apiClient.js';

export const voteApi = {
  async castVote(reviewId, type) {
    const response = await apiClient.put(`/reviews/${reviewId}/vote`, { type });
    return response.data.data;
  },
};

export default voteApi;
