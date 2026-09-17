import React from 'react';
import { Brain, Clock, Star } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatters.js';

/**
 * Displays AI-generated review insights for a single product —
 * including the Gemini summary and the positive/neutral/negative
 * sentiment breakdown. Admin-only component.
 */
export function ProductSentimentCard({ product }) {
  const { name, reviewCount, averageRating, aiInsights } = product;
  const { summary, sentiment, lastGeneratedAt } = aiInsights;

  const hasInsights = summary && summary !== 'No reviews yet.';

  return (
    <div className="neo-card p-5 bg-white space-y-4">
      {/* Product Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <h4 className="font-black text-sm text-slate-900 truncate">{name}</h4>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="text-amber-500">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
            <span>{averageRating.toFixed(1)}</span>
            <span>•</span>
            <span>{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 neo-badge bg-violet-200 text-violet-900 shrink-0">
          <Brain className="w-3 h-3" />
          <span className="text-[10px]">AI</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="space-y-1.5">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">AI Summary</p>
        {hasInsights ? (
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            {summary}
          </p>
        ) : (
          <p className="text-xs font-medium text-slate-400 italic">
            {reviewCount === 0 ? 'No reviews yet — summary will be generated once reviews come in.' : 'Summary pending next cron run.'}
          </p>
        )}
      </div>

      {/* Sentiment Breakdown */}
      {hasInsights && (
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Sentiment</p>
          <div className="space-y-1.5">
            {/* Positive */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 w-16 shrink-0">Positive</span>
              <div className="flex-1 h-3 bg-slate-100 border border-black rounded-sm overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${sentiment.positive}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-700 w-8 text-right">{sentiment.positive}%</span>
            </div>
            {/* Neutral */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 w-16 shrink-0">Neutral</span>
              <div className="flex-1 h-3 bg-slate-100 border border-black rounded-sm overflow-hidden">
                <div
                  className="h-full bg-amber-300 transition-all duration-500"
                  style={{ width: `${sentiment.neutral}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-700 w-8 text-right">{sentiment.neutral}%</span>
            </div>
            {/* Negative */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700 w-16 shrink-0">Negative</span>
              <div className="flex-1 h-3 bg-slate-100 border border-black rounded-sm overflow-hidden">
                <div
                  className="h-full bg-rose-400 transition-all duration-500"
                  style={{ width: `${sentiment.negative}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-700 w-8 text-right">{sentiment.negative}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Last Generated Timestamp */}
      {lastGeneratedAt && (
        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400">
            Updated {formatRelativeTime(lastGeneratedAt)}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductSentimentCard;
