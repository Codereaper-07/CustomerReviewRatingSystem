import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from '../api/notificationApi.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.listNotifications,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    staleTime: 10 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: query.data?.items || [],
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAll: markAllAsReadMutation.isPending,
  };
}

export default useNotifications;
