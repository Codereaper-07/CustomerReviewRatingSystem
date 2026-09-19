import React from 'react';
import { Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t-2.5 border-black mt-auto py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-300 border-1.5 border-black rounded flex items-center justify-center">
            <Star className="w-4 h-4 fill-black text-black" />
          </div>
          <span className="font-black text-sm text-slate-900">
            ReviewHub • Customer Review &amp; Rating System
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Built with React 19, Express, MongoDB &amp; Redis Cache
        </p>
      </div>
    </footer>
  );
}

export default Footer;
