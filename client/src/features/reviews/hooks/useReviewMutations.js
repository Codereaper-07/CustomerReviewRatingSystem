import { useMutation, useQueryClient } from '@tanstack/react-query';
import reviewApi from '../api/reviewApi.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function useReviewMutations(productId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (data) => reviewApi.createReview(productId, data),
    onSuccess: () => {
      // Invalidate review queries & product details (to refresh rating breakdown)
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Your review has been published!', 'Review Added');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Failed to submit review.';
      toast.error(message, 'Submission Error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ reviewId, data }) => reviewApi.updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Your review was updated successfully.', 'Review Updated');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Failed to update review.';
      toast.error(message, 'Update Error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId) => reviewApi.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.info('Your review has been deleted.', 'Review Deleted');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Failed to delete review.';
      toast.error(message, 'Delete Error');
    },
  });

  return {
    createReview: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateReview: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteReview: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export default useReviewMutations;
