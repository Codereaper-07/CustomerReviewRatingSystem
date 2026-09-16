import React, { useMemo } from 'react';
import { MessageSquarePlus, RefreshCw } from 'lucide-react';
import { useInfiniteReviews } from '../hooks/useReviews.js';
import { useReviewMutations } from '../hooks/useReviewMutations.js';
import { useVoteMutation } from '../../votes/hooks/useVoteMutation.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import ReviewItem from './ReviewItem.jsx';
import Button from '../../../components/ui/Button.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';

export function ReviewList({
  productId,
  onOpenWriteModal,
  onOpenEditModal,
}) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteReviews(productId, 10);

  const { deleteReview, isDeleting } = useReviewMutations(productId);
  const voteMutation = useVoteMutation(productId);

  const reviews = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : page?.data?.items ?? []));
  }, [data]);

  // Check if current user already submitted a review for this product
  const userReview = useMemo(() => {
    if (!currentUserId) return null;
    return reviews.find(
      (r) =>
        String(r.user?.id || r.user?._id || r.userId || r.user) === String(currentUserId)
    );
  }, [reviews, currentUserId]);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      await deleteReview(reviewId);
    }
  };

  const handleVote = (votePayload) => {
    voteMutation.mutate(votePayload);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="neo-card p-6 space-y-4 bg-white">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="neo-card p-6 bg-rose-100 text-center space-y-3">
        <p className="font-bold text-rose-800 text-sm">
          {error?.response?.data?.error?.message || 'Failed to load reviews.'}
        </p>
        <Button variant="danger" onClick={() => refetch()} className="text-xs py-1.5 px-3">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Review Counter & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2.5 border-black">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Reviews ({reviews.length})
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Verified ratings and feedback from actual users
          </p>
        </div>

        {userReview ? (
          <Button
            variant="accent"
            onClick={() => onOpenEditModal(userReview)}
            className="text-xs py-2 px-4"
          >
            Edit Your Review
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onOpenWriteModal}
            className="text-xs py-2 px-4 shadow-[3px_3px_0_0_#000]"
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Review List Items */}
      {reviews.length === 0 ? (
        <div className="neo-card p-10 bg-white text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 border-2 border-black rounded-lg flex items-center justify-center mx-auto shadow-[2px_2px_0_0_#000]">
            <MessageSquarePlus className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-lg text-slate-900">No reviews yet</h4>
            <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
              Be the first to share your thoughts and help others make an informed decision!
            </p>
          </div>
          <Button variant="primary" onClick={onOpenWriteModal} className="text-xs py-2 px-4">
            Write First Review
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onEdit={onOpenEditModal}
              onDelete={handleDelete}
              onVote={handleVote}
              isDeleting={isDeleting}
            />
          ))}

          {/* Cursor Pagination "Load More" */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                className="px-6 py-2.5 text-xs font-black shadow-[3px_3px_0_0_#000]"
              >
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewList;
