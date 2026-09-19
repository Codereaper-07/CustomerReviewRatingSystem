import React from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../../../utils/constants.js';

export function ProductFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="neo-card p-5 bg-white space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search catalog by name or keyword..."
            className="neo-input pl-10 pr-4 py-2 text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 h-10 overflow-x-auto w-full  md:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`neo-badge px-3 py-1.5 cursor-pointer whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-300 text-black translate-x-0.5 translate-y-0.5 shadow-none'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;
