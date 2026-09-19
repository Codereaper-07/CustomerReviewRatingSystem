import { useInfiniteQuery } from '@tanstack/react-query';
import reviewApi from '../api/reviewApi.js';

export function useInfiniteReviews(productId, limit = 10) {
  return useInfiniteQuery({
    queryKey: ['reviews', productId, { limit }],
    queryFn: ({ pageParam }) => reviewApi.listReviews(productId, { limit, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination?.hasNextPage ? pagination.nextCursor : undefined;
    },
    enabled: Boolean(productId),
    staleTime: 30 * 1000,
  });
}

export default { useInfiniteReviews };
