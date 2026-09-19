import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 border-2 border-black/30 rounded-lg ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="neo-card p-5 space-y-4 bg-white">
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-3 flex gap-2">
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

export default Skeleton;
