import { useMutation, useQueryClient } from '@tanstack/react-query';
import reportApi from '../api/reportApi.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function useReportMutation() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }) => reportApi.createReport(reviewId, data),
    onSuccess: (result) => {
      toast.success(
        `Your report was submitted for moderator review. (${result.reportsRemainingInWindow} reports remaining today)`,
        'Report Submitted'
      );
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.error?.message ||
        'Failed to submit report. Please try again.';
      toast.error(message, 'Report Failed');
    },
  });
}

export default useReportMutation;
