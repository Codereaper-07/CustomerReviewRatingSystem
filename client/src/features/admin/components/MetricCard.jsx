import React from 'react';

export function MetricCard({ title, value, subtitle, icon: Icon, color = 'bg-amber-300' }) {
  return (
    <div className="neo-card p-6 bg-white flex items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        {subtitle && <div className="text-xs font-bold text-slate-600">{subtitle}</div>}
      </div>
      {Icon && (
        <div
          className={`w-12 h-12 ${color} border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_0_#000]`}
        >
          <Icon className="w-6 h-6 text-black stroke-[2.5]" />
        </div>
      )}
    </div>
  );
}

export default MetricCard;
