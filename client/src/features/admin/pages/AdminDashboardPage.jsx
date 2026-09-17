import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MessageSquare,
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  TrendingUp,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard.js';
import { useProductInsights } from '../hooks/useProductInsights.js';
import MetricCard from '../components/MetricCard.jsx';
import ProductSentimentCard from '../components/ProductSentimentCard.jsx';
import StarRating from '../../../components/ui/StarRating.jsx';
import { formatCurrency, formatRelativeTime } from '../../../utils/formatters.js';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import Button from '../../../components/ui/Button.jsx';

export function AdminDashboardPage() {
  const { data: dashboard, isLoading, isError, error, refetch } = useAdminDashboard();
  const {
    data: productInsights = [],
    isLoading: isInsightsLoading,
    refetch: refetchInsights,
  } = useProductInsights();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="neo-card p-12 bg-rose-100 text-center space-y-4">
        <h2 className="text-xl font-black text-rose-900">Failed to load admin analytics</h2>
        <p className="text-xs font-bold text-rose-700">
          {error?.response?.data?.error?.message || 'Server error.'}
        </p>
        <Button variant="danger" onClick={() => refetch()} className="mx-auto">
          Retry
        </Button>
      </div>
    );
  }

  const {
    totals,
    averageProductRating,
    votes,
    ratingDistribution,
    recentProducts = [],
    recentReviews = [],
  } = dashboard || {};

  const totalReviews = totals?.reviews ?? 0;

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            System Analytics &amp; Performance
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Real-time catalog metrics, customer rating distribution, and engagement statistics
          </p>
        </div>

        <Link to="/admin/products">
          <Button variant="primary" className="text-xs py-2 px-4 shadow-[3px_3px_0_0_#000]">
            <Package className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Manage Products
          </Button>
        </Link>
      </div>

      {/* Top 4 Metrics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={totals?.products ?? 0}
          subtitle="Active in catalog"
          icon={Package}
          color="bg-amber-300"
        />
        <MetricCard
          title="Total Reviews"
          value={totals?.reviews ?? 0}
          subtitle="Submitted by buyers"
          icon={MessageSquare}
          color="bg-sky-300"
        />
        <MetricCard
          title="Avg System Rating"
          value={averageProductRating ? `★ ${averageProductRating.toFixed(2)}` : '★ 0.00'}
          subtitle="Across all catalog items"
          icon={Star}
          color="bg-emerald-300"
        />
        <MetricCard
          title="Registered Customers"
          value={totals?.customers ?? 0}
          subtitle="Verified user accounts"
          icon={Users}
          color="bg-purple-300"
        />
      </div>

      {/* 2-Column Analytics: System Distribution & Voting Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Global Star Rating Distribution */}
        <div className="lg:col-span-2 neo-card p-6 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                System-Wide Rating Breakdown
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Aggregate star rating distribution across {totals?.products} products
              </p>
            </div>
            <span className="neo-badge bg-amber-300 text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Live Stats
            </span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'five', stars: 5, color: 'bg-amber-400' },
              { key: 'four', stars: 4, color: 'bg-amber-300' },
              { key: 'three', stars: 3, color: 'bg-amber-200' },
              { key: 'two', stars: 2, color: 'bg-amber-100' },
              { key: 'one', stars: 1, color: 'bg-rose-200' },
            ].map(({ key, stars }) => {
              const count = ratingDistribution?.[key] ?? 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-sm font-bold text-slate-800">
                  <span className="w-12">{stars} Stars</span>
                  <div className="flex-1 neo-progress-container h-4">
                    <div className="neo-progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-black">{pct}%</span>
                  <span className="w-12 text-right text-xs text-slate-400">({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Customer Engagement & Votes */}
        <div className="neo-card p-6 bg-white space-y-6">
          <div className="pb-4 border-b-2 border-black">
            <h3 className="text-lg font-black text-slate-900">Review Helpfulness</h3>
            <p className="text-xs font-bold text-slate-500">
              Total community votes recorded
            </p>
          </div>

          <div className="space-y-4">
            <div className="neo-card-sm p-4 bg-emerald-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-400 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_0_#000]">
                  <ThumbsUp className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-900 uppercase">Upvotes</div>
                  <div className="text-2xl font-black text-slate-900">{votes?.upvotes ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="neo-card-sm p-4 bg-rose-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-400 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_0_#000]">
                  <ThumbsDown className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-rose-900 uppercase">Downvotes</div>
                  <div className="text-2xl font-black text-slate-900">{votes?.downvotes ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Feeds: Recent Products & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="neo-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h3 className="text-lg font-black text-slate-900">Recently Added Products</h3>
            <Link to="/admin/products" className="text-xs font-black text-amber-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y-2 divide-slate-100">
            {recentProducts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <Link
                    to={`/products/${p.id}`}
                    className="font-black text-sm text-slate-900 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">
                    {formatCurrency(p.price)} • {p.ratingStats?.count ?? 0} reviews
                  </div>
                </div>
                <span className="neo-badge bg-amber-300 text-[10px]">
                  ★ {(p.ratingStats?.average ?? 0).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="neo-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h3 className="text-lg font-black text-slate-900">Latest Customer Reviews</h3>
            <span className="neo-badge bg-black text-white text-[10px]">Recent</span>
          </div>

          <div className="divide-y-2 divide-slate-100">
            {recentReviews.map((r) => (
              <div key={r.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-xs text-slate-900 truncate">
                      {r.user?.name || 'Customer'}
                    </span>
                    {r.productName && (
                      <span className="text-[11px] font-bold text-slate-400 truncate">
                        on{' '}
                        <Link
                          to={`/products/${r.productId}`}
                          className="text-slate-600 hover:text-black hover:underline"
                        >
                          {r.productName}
                        </Link>
                      </span>
                    )}
                  </div>
                  <div className="text-amber-500 font-black text-xs shrink-0">
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                <div className="font-bold text-xs text-slate-800 line-clamp-1">{r.title}</div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {formatRelativeTime(r.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Product Insights — Admin Only */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              AI Product Insights
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Gemini-powered review summaries &amp; sentiment — refreshed daily at midnight
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => refetchInsights()}
            className="text-xs py-1.5 px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {isInsightsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : productInsights.length === 0 ? (
          <div className="neo-card p-10 bg-white text-center space-y-2">
            <Brain className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-black text-slate-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productInsights.map((product) => (
              <ProductSentimentCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
