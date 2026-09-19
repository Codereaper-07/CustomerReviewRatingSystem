import { useQuery } from '@tanstack/react-query';
import adminApi from '../api/adminApi.js';

export function useProductInsights() {
  return useQuery({
    queryKey: ['adminProductInsights'],
    queryFn: adminApi.getProductInsights,
    staleTime: 60 * 60 * 1000, // 1 hour — mirrors the server cache TTL
  });
}

export default useProductInsights;
