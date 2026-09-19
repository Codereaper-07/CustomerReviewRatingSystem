import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters.js';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';

export function ProductCard({ product }) {
  const ratingAverage = product.ratingStats?.average ?? 0;
  const ratingCount = product.ratingStats?.count ?? 0;

  return (
    <div className="neo-card neo-card-hover p-5 flex flex-col justify-between bg-white group">
      <div className="space-y-3">
        {/* Card Header: Category & Price */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{product.category}</Badge>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Product Visual / Placeholder */}
        <div className="w-full h-44 bg-amber-50 border-2 border-black rounded-lg flex items-center justify-center relative overflow-hidden group-hover:bg-amber-100 transition-colors">
          <ShoppingBag className="w-14 h-14 text-slate-400 stroke-[1.5]" />
          <div className="absolute top-2 right-2">
            <span className="neo-badge bg-white text-[11px] py-0.5 px-1.5 shadow-[1.5px_1.5px_0_0_#000]">
              {product.slug}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <Link to={`/products/${product.id}`}>
            <h3 className="text-lg font-black text-slate-900 tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs font-semibold text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer: Rating Stats & View Action */}
      <div className="pt-4 mt-4 border-t-2 border-black flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-sm font-black text-slate-900 bg-amber-300 px-2 py-0.5 border-1.5 border-black rounded-md shadow-[1px_1px_0_0_#000]">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
            <span>{ratingCount > 0 ? ratingAverage.toFixed(1) : '0.0'}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            ({ratingCount})
          </span>
        </div>

        <Link to={`/products/${product.id}`}>
          <Button variant="primary" className="py-1 px-3 text-xs font-black">
            View <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 stroke-[3]" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
