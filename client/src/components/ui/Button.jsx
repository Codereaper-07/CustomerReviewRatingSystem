import React from 'react';

const VARIANTS = {
  primary: 'neo-btn-primary',
  secondary: 'neo-btn-secondary',
  accent: 'neo-btn-accent',
  dark: 'neo-btn-dark',
  danger: 'neo-btn-danger',
  success: 'neo-btn-success',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`neo-btn ${variantClass} ${className} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
