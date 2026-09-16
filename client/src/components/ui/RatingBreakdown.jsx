import React from 'react';
import StarRating from './StarRating.jsx';

const BUCKET_LABELS = [
  { key: 'five', stars: 5 },
  { key: 'four', stars: 4 },
  { key: 'three', stars: 3 },
  { key: 'two', stars: 2 },
  { key: 'one', stars: 1 },
];

export function RatingBreakdown({ ratingStats }) {
  const average = ratingStats?.average ?? 0;
  const count = ratingStats?.count ?? 0;
  const distribution = ratingStats?.distribution ?? { one: 0, two: 0, three: 0, four: 0, five: 0 };

  return (
    <div className="neo-card p-6 bg-white space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-black">
        <div className="text-center sm:text-left">
          <div className="text-5xl font-black tracking-tight text-slate-900">
            {count > 0 ? average.toFixed(1) : '0.0'}
          </div>
          <div className="mt-2 flex items-center justify-center sm:justify-start gap-1">
            <StarRating rating={average} size="md" />
          </div>
          <p className="mt-1 text-sm font-bold text-slate-600">
            Based on {count} {count === 1 ? 'verified review' : 'verified reviews'}
          </p>
        </div>

        <div className="neo-badge bg-amber-300 text-black text-xs font-black px-3 py-1.5">
          {count === 0 ? 'No Reviews Yet' : average >= 4.5 ? '⭐ Highly Rated' : 'Customer Feedback'}
        </div>
      </div>

      {/* 5-to-1 Star Distribution Progress Bars */}
      <div className="space-y-2.5">
        {BUCKET_LABELS.map(({ key, stars }) => {
          const bucketCount = distribution[key] || 0;
          const percentage = count > 0 ? Math.round((bucketCount / count) * 100) : 0;

          return (
            <div key={stars} className="flex items-center gap-3 text-sm font-bold text-slate-800">
              <span className="w-12 text-left">{stars} ★</span>
              <div className="flex-1 neo-progress-container h-3.5">
                <div
                  className="neo-progress-bar"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs font-bold text-slate-600">
                {percentage}%
              </span>
              <span className="w-8 text-right text-xs text-slate-400 font-semibold">
                ({bucketCount})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RatingBreakdown;
