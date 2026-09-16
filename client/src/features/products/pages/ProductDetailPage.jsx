import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Tag, Star } from 'lucide-react';
import { useProduct } from '../hooks/useProducts.js';
import { useReviewMutations } from '../../reviews/hooks/useReviewMutations.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { formatCurrency } from '../../../utils/formatters.js';
import RatingBreakdown from '../../../components/ui/RatingBreakdown.jsx';
import ReviewList from '../../reviews/components/ReviewList.jsx';
import ReviewFormModal from '../../reviews/components/ReviewFormModal.jsx';
import StarRating from '../../../components/ui/StarRating.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { createReview, updateReview, isCreating, isUpdating } = useReviewMutations(productId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const handleOpenWriteModal = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to write a review.', 'Sign In Required');
      navigate('/login', { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleReviewSubmit = async (formData) => {
    if (editingReview) {
      await updateReview({ reviewId: editingReview._id, data: formData });
    } else {
      await createReview(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-80 col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="neo-card p-12 bg-rose-50 text-center space-y-4">
        <h2 className="text-2xl font-black text-rose-900">Product Not Found</h2>
        <p className="text-sm font-bold text-rose-700">
          {error?.response?.data?.error?.message || 'The requested product could not be found.'}
        </p>
        <Link to="/products">
          <Button variant="secondary" className="mx-auto">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back to Catalog Link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-black hover:underline group"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3] group-hover:-translate-x-1 transition-transform" />
          Back to Catalog
        </Link>
      </div>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Product Details */}
        <div className="lg:col-span-2 neo-card p-8 bg-white space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="secondary">{product.category}</Badge>
            <div className="text-3xl font-black text-slate-900">
              {formatCurrency(product.price)}
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {product.name}
            </h1>
            <div className="mt-2.5 flex items-center gap-2">
              <StarRating rating={product.ratingStats?.average ?? 0} size="sm" />
              <span className="font-black text-sm text-slate-900">
                {(product.ratingStats?.average ?? 0).toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-500">
                • {product.ratingStats?.count ?? 0} ratings
              </span>
            </div>
          </div>

          {/* Placeholder Product Image Banner */}
          <div className="w-full h-64 bg-amber-50 border-2.5 border-black rounded-xl flex items-center justify-center relative overflow-hidden shadow-[3px_3px_0_0_#000]">
            <ShoppingBag className="w-20 h-20 text-slate-300 stroke-[1.5]" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white border-1.5 border-black px-2.5 py-1 rounded-md text-xs font-black shadow-[1.5px_1.5px_0_0_#000]">
              <Tag className="w-3.5 h-3.5 mr-1 text-amber-500" />
              SKU: {product.slug}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="p-4 neo-card-sm bg-emerald-50 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 stroke-[2.5]" />
            <div>
              <div className="text-xs font-black text-emerald-900">
                Guaranteed Verified Reviews
              </div>
              <div className="text-[11px] font-bold text-emerald-700">
                All ratings and reviews on this product are submitted by verified accounts.
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Rating Breakdown & Summary */}
        <div className="space-y-6">
          <RatingBreakdown ratingStats={product.ratingStats} />

        {/* {!Boolean(editingReview) &&
          <div className="neo-card p-6 bg-amber-100 text-center space-y-3">
            <h4 className="font-black text-base text-slate-900">Have you used this product?</h4>
            <p className="text-xs font-bold text-slate-700">
              Your feedback helps other buyers make the right choice!
            </p>
            <Button
              variant="primary"
              onClick={handleOpenWriteModal}
              className="w-full py-2.5 text-xs font-black"
            >
              Write a Review
            </Button>
          </div> 
         } */}
        </div>
      </div>

      {/* Reviews Feed Section */}
      <div className="pt-6">
        <ReviewList
          productId={productId}
          onOpenWriteModal={handleOpenWriteModal}
          onOpenEditModal={handleOpenEditModal}
        />
      </div>

      {/* Review Modal Form */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewSubmit}
        initialData={editingReview}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

export default ProductDetailPage;
