import { useMutation, useQueryClient } from '@tanstack/react-query';
import productApi from '../api/productApi.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function useProductMutations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      toast.success('Product created successfully!', 'Catalog Updated');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Failed to create product.';
      toast.error(message, 'Creation Failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }) => productApi.updateProduct(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      toast.success('Product updated successfully!', 'Catalog Updated');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Failed to update product.';
      toast.error(message, 'Update Failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      toast.info('Product removed from catalog.', 'Product Deleted');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Failed to delete product.';
      toast.error(message, 'Delete Failed');
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export default useProductMutations;
