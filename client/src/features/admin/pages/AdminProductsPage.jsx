import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, RefreshCw, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInfiniteProducts } from '../../products/hooks/useProducts.js';
import { useProductMutations } from '../../products/hooks/useProductMutations.js';
import ProductFormModal from '../components/ProductFormModal.jsx';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import { formatCurrency } from '../../../utils/formatters.js';

export function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data, isLoading, isError, error, refetch } = useInfiniteProducts(50);
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting,
  } = useProductMutations();

  const allProducts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : page?.data?.items ?? []));
  }, [data]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      await deleteProduct(productId);
    }
  };

  const handleSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct({ productId: editingProduct.id, data: formData });
    } else {
      await createProduct(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Catalog Management
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Add, edit, or remove products from the public catalog ({allProducts.length} items)
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="text-xs py-2 px-4 shadow-[3px_3px_0_0_#000]"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
          Add New Product
        </Button>
      </div>

      {/* Search Bar */}
      <div className="neo-card p-4 bg-white flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, category, or slug..."
            className="neo-input pl-10 text-sm"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="neo-card bg-white overflow-hidden shadow-[4px_4px_0_0_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-100 border-b-2.5 border-black text-xs font-black uppercase text-slate-900 tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Rating Stats</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-sm font-bold">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                    Loading catalog items...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-rose-600 font-bold">
                    Error loading products.{' '}
                    <button onClick={() => refetch()} className="underline font-black ml-1">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900">{p.name}</div>
                      <div className="text-xs font-semibold text-slate-400">{p.slug}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{p.category}</Badge>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="neo-badge bg-amber-300 text-[10px]">
                          ★ {(p.ratingStats?.average ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({p.ratingStats?.count ?? 0})
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/products/${p.id}`}
                          className="p-1.5 border-1.5 border-black rounded bg-slate-100 hover:bg-slate-200 transition-colors shadow-[1px_1px_0_0_#000]"
                          title="View on store"
                        >
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 border-1.5 border-black rounded bg-amber-200 hover:bg-amber-300 transition-colors cursor-pointer shadow-[1px_1px_0_0_#000]"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={isDeleting}
                          className="p-1.5 border-1.5 border-black rounded bg-rose-200 hover:bg-rose-300 transition-colors cursor-pointer shadow-[1px_1px_0_0_#000]"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProduct}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

export default AdminProductsPage;
