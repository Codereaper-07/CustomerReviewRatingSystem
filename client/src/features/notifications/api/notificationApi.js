import apiClient from '../../../services/apiClient.js';

export const notificationApi = {
  async listNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  },

  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data.data;
  },
};

export default notificationApi;
