import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/ui/Modal.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input, { Textarea } from '../../../components/ui/Input.jsx';
import { CATEGORIES } from '../../../utils/constants.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function ProductFormModal({
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
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      category: 'Electronics',
      price: '',
      image: '',
      description: '',
    },
  });

  const nameValue = watch('name');
  const imageValue = watch('image');

  useEffect(() => {
    if (!isEditing && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isEditing, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        category: initialData.category || 'Electronics',
        price: initialData.price || '',
        image: initialData.image || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        slug: '',
        category: 'Electronics',
        price: '',
        image: '',
        description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...data,
      price: parseFloat(data.price),
    });
    onClose();
  };

  const formCategories = CATEGORIES.filter((c) => c !== 'All');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
        <Input
          label="Product Name"
          placeholder="e.g. Wireless Noise-Cancelling Headphones"
          error={errors.name?.message}
          {...register('name', { required: 'Product name is required' })}
        />

        <Input
          label="URL Slug"
          placeholder="e.g. wireless-headphones"
          error={errors.slug?.message}
          {...register('slug', { required: 'Slug is required' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-black text-slate-900 tracking-tight">
              Category
            </label>
            <select
              className="neo-input"
              {...register('category', { required: 'Category is required' })}
            >
              {formCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Price ($ USD)"
            type="number"
            step="0.01"
            placeholder="89.99"
            error={errors.price?.message}
            {...register('price', {
              required: 'Price is required',
              min: { value: 0.01, message: 'Price must be greater than 0' },
            })}
          />
        </div>

        <div className="space-y-2">
          <Input
            label="Product Image URL"
            placeholder="e.g. https://images.unsplash.com/photo-..."
            error={errors.image?.message}
            {...register('image')}
          />
          {imageValue && (
            <div className="flex items-center gap-3 p-2 bg-amber-50 border-1.5 border-black rounded-lg">
              <div className="w-14 h-14 rounded border border-black overflow-hidden bg-white shrink-0">
                <img
                  src={imageValue}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs font-bold text-slate-600 truncate">
                Image preview: {imageValue}
              </p>
            </div>
          )}
        </div>

        <Textarea
          label="Product Description"
          placeholder="Detailed specification and features..."
          rows={4}
          error={errors.description?.message}
          {...register('description', { required: 'Description is required' })}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductFormModal;
