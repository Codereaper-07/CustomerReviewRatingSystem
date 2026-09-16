import React from 'react';

export function Input({
  label,
  error,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-black text-slate-900 tracking-tight">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`neo-input ${error ? '!border-red-600 !bg-red-50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  id,
  rows = 4,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-black text-slate-900 tracking-tight">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`neo-input resize-y ${error ? '!border-red-600 !bg-red-50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default Input;
