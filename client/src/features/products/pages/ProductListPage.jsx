import React, { useState, useMemo } from 'react';
import { Package, Sparkles, RefreshCw } from 'lucide-react';
import { useInfiniteProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductFilter from '../components/ProductFilter.jsx';
import { ProductCardSkeleton } from '../../../components/ui/Skeleton.jsx';
import Button from '../../../components/ui/Button.jsx';

export function ProductListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProducts(12);

  // Flatten infinite query pages
  const allProducts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : page?.data?.items ?? []));
  }, [data]);

  // Client-side search and category filtering on loaded products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="neo-card p-8 bg-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 neo-badge bg-black text-white text-xs px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Discover &amp; Review</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Verified Customer Reviews &amp; Product Ratings
          </h1>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">
            Browse our top-rated catalog, read in-depth honest reviews from verified buyers, and share your own experience.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4 z-10">
          <div className="neo-card p-4 bg-white text-center shadow-[3px_3px_0_0_#000]">
            <div className="text-3xl font-black text-slate-900">100%</div>
            <div className="text-[11px] font-black uppercase text-slate-500 mt-0.5">Real Reviews</div>
          </div>
          <div className="neo-card p-4 bg-white text-center shadow-[3px_3px_0_0_#000]">
            <div className="text-3xl font-black text-amber-500">★ 4.8</div>
            <div className="text-[11px] font-black uppercase text-slate-500 mt-0.5">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <ProductFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <div className="neo-card p-8 bg-rose-100 text-center space-y-4">
          <h2 className="text-xl font-black text-rose-900">Failed to load product catalog</h2>
          <p className="text-xs font-bold text-rose-700">
            {error?.response?.data?.error?.message || 'Could not reach the server.'}
          </p>
          <Button variant="danger" onClick={() => refetch()} className="mx-auto">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Try Again
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="neo-card p-12 bg-white text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 border-2 border-black rounded-lg flex items-center justify-center mx-auto shadow-[2px_2px_0_0_#000]">
            <Package className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No products found</h3>
          <p className="text-xs font-bold text-slate-500">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Cursor Pagination "Load More" */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="primary"
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                className="px-8 py-3 text-sm font-black shadow-[4px_4px_0_0_#000]"
              >
                Load More Products ({allProducts.length} loaded)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductListPage;
