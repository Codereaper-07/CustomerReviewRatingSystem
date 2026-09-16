import { useQuery } from '@tanstack/react-query';
import adminApi from '../api/adminApi.js';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.getDashboard,
    staleTime: 30 * 1000,
  });
}

export default useAdminDashboard;
