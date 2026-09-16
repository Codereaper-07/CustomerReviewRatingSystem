import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../../../components/ui/Modal.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input, { Textarea } from '../../../components/ui/Input.jsx';
import StarRating from '../../../components/ui/StarRating.jsx';

export function ReviewFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: 5,
      title: '',
      body: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        rating: initialData.rating || 5,
        title: initialData.title || '',
        body: initialData.body || '',
      });
    } else {
      reset({
        rating: 5,
        title: '',
        body: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Your Review' : 'Write a Verified Review'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
        {/* Rating Picker */}
        <div className="space-y-1.5">
          <label className="block text-sm font-black text-slate-900 tracking-tight">
            Overall Star Rating
          </label>
          <div className="p-3 neo-card-sm bg-amber-50 flex items-center justify-between">
            <Controller
              name="rating"
              control={control}
              rules={{ required: 'Please pick a rating' }}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={field.value}
                    interactive
                    onChange={(val) => field.onChange(val)}
                    size="lg"
                  />
                  <span className="font-black text-base text-slate-900 ml-2">
                    {field.value} of 5 Stars
                  </span>
                </div>
              )}
            />
          </div>
          {errors.rating && <p className="text-xs font-bold text-red-600">{errors.rating.message}</p>}
        </div>

        {/* Title Input */}
        <Input
          label="Review Headline / Title"
          placeholder="e.g. Incredible sound and battery life!"
          error={errors.title?.message}
          {...register('title', {
            required: 'Please provide a review headline',
            minLength: { value: 3, message: 'Headline must be at least 3 characters' },
            maxLength: { value: 120, message: 'Headline cannot exceed 120 characters' },
          })}
        />

        {/* Review Body */}
        <Textarea
          label="Detailed Review"
          placeholder="What did you like or dislike? How was your experience using the product?"
          rows={5}
          error={errors.body?.message}
          {...register('body', {
            required: 'Please provide your review thoughts',
            minLength: { value: 10, message: 'Review body must be at least 10 characters' },
          })}
        />

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ReviewFormModal;
