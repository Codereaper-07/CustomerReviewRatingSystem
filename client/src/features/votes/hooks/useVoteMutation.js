import { useMutation, useQueryClient } from '@tanstack/react-query';
import voteApi from '../api/voteApi.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function useVoteMutation(productId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ reviewId, type }) => voteApi.castVote(reviewId, type),

    // Optimistic Update
    onMutate: async ({ reviewId, type, currentVote }) => {
      // Cancel outgoing queries to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['reviews', productId] });

      // Snapshot previous review cache entries for this product
      const previousQueries = queryClient.getQueriesData({ queryKey: ['reviews', productId] });

      // Optimistically update all matching cached review queries (e.g. infinite query pages)
      queryClient.setQueriesData({ queryKey: ['reviews', productId] }, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            const rawList = Array.isArray(page?.data) ? page.data : page?.data?.items ?? [];
            const updatedItems = rawList.map((item) => {
              if (item._id !== reviewId) return item;

              const oldUpvotes = item.voteStats?.upvotes ?? 0;
              const oldDownvotes = item.voteStats?.downvotes ?? 0;

              let nextUpvotes = oldUpvotes;
              let nextDownvotes = oldDownvotes;
              let nextUserVote = type;

              if (currentVote === type) {
                // Toggle off
                nextUserVote = null;
                if (type === 'up') nextUpvotes = Math.max(0, oldUpvotes - 1);
                if (type === 'down') nextDownvotes = Math.max(0, oldDownvotes - 1);
              } else if (currentVote === null || currentVote === undefined) {
                // First vote
                if (type === 'up') nextUpvotes = oldUpvotes + 1;
                if (type === 'down') nextDownvotes = oldDownvotes + 1;
              } else {
                // Flipped vote (e.g. up -> down)
                if (type === 'up') {
                  nextUpvotes = oldUpvotes + 1;
                  nextDownvotes = Math.max(0, oldDownvotes - 1);
                } else {
                  nextDownvotes = oldDownvotes + 1;
                  nextUpvotes = Math.max(0, oldUpvotes - 1);
                }
              }

              return {
                ...item,
                currentUserVote: nextUserVote,
                voteStats: {
                  upvotes: nextUpvotes,
                  downvotes: nextDownvotes,
                },
              };
            });

            return {
              ...page,
              data: Array.isArray(page?.data) ? updatedItems : { ...page.data, items: updatedItems },
            };
          }),
        };
      });

      return { previousQueries };
    },

    onError: (err, variables, context) => {
      // Rollback to snapshot on error
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      const message = err.response?.data?.error?.message || 'Could not record your vote. Please try again.';
      toast.error(message, 'Vote Failed');
    },

    onSettled: (data, error, variables) => {
      // Sync definitive state from server response if available
      if (data && !error) {
        queryClient.setQueriesData({ queryKey: ['reviews', productId] }, (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              const rawList = Array.isArray(page?.data) ? page.data : page?.data?.items ?? [];
              const updatedItems = rawList.map((item) => {
                if (item._id !== variables.reviewId) return item;
                return {
                  ...item,
                  currentUserVote: data.vote?.type ?? null,
                  voteStats: data.voteStats,
                };
              });

              return {
                ...page,
                data: Array.isArray(page?.data) ? updatedItems : { ...page.data, items: updatedItems },
              };
            }),
          };
        });
      }
    },
  });
}

export default useVoteMutation;
