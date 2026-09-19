import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({
  rating = 0,
  maxRating = 5,
  interactive = false,
  onChange,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const current = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(current);

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer transition-transform hover:scale-125' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-black stroke-[2]'
                  : 'fill-slate-200 text-black stroke-[2]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
