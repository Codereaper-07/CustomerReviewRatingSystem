import apiClient from '../../../services/apiClient.js';

export const reportApi = {
  async createReport(reviewId, data) {
    const response = await apiClient.post(`/reviews/${reviewId}/report`, data);
    return response.data.data;
  },

  async listReports(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    if (params.page) query.append('page', params.page);

    const response = await apiClient.get(`/admin/reports?${query.toString()}`);
    return response.data.data;
  },

  async actionReport(reportId, data) {
    const response = await apiClient.post(`/admin/reports/${reportId}/action`, data);
    return response.data.data;
  },
};

export default reportApi;
