import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportApi from '../api/reportApi.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function useAdminReports(params = {}) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminReports', params],
    queryFn: () => reportApi.listReports(params),
    staleTime: 10 * 1000,
  });

  const actionMutation = useMutation({
    mutationFn: ({ reportId, data }) => reportApi.actionReport(reportId, data),
    onSuccess: (result, variables) => {
      const isApproved = variables.data?.action === 'approve';
      toast.success(
        isApproved
          ? 'Review deleted and report marked as resolved. Notifications sent.'
          : 'Report dismissed. Review remains active and reporter notified.',
        isApproved ? 'Review Removed' : 'Report Dismissed'
      );
      // Invalidate reports, products, reviews, and admin dashboard
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminProductInsights'] });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.error?.message ||
        'Failed to process moderation action. Please try again.';
      toast.error(message, 'Action Failed');
    },
  });

  return {
    reports: query.data?.items || [],
    pagination: query.data?.pagination,
    counts: query.data?.counts || { pending: 0, resolved: 0, dismissed: 0, total: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    actionReport: actionMutation.mutateAsync,
    isProcessing: actionMutation.isPending,
  };
}

export default useAdminReports;
