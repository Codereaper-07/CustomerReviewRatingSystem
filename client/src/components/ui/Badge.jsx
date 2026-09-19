import React from 'react';

const VARIANTS = {
  default: 'bg-white text-black',
  primary: 'bg-amber-300 text-black',
  secondary: 'bg-purple-300 text-black',
  accent: 'bg-sky-300 text-black',
  success: 'bg-emerald-300 text-black',
  danger: 'bg-rose-300 text-black',
  dark: 'bg-black text-white',
};

export function Badge({ children, variant = 'default', className = '' }) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <span className={`neo-badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
