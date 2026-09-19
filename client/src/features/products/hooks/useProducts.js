import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import productApi from '../api/productApi.js';

export function useInfiniteProducts(limit = 9) {
  return useInfiniteQuery({
    queryKey: ['products', { limit }],
    queryFn: ({ pageParam }) => productApi.listProducts({ limit, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination?.hasNextPage ? pagination.nextCursor : undefined;
    },
    staleTime: 60 * 1000,
  });
}

export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getProductById(productId),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  });
}

export default { useInfiniteProducts, useProduct };
