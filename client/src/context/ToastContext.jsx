import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Info') => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto neo-card p-4 flex items-start gap-3 animate-in slide-in-from-right-5 duration-200 ${
              item.type === 'success'
                ? 'bg-emerald-100'
                : item.type === 'error'
                ? 'bg-rose-100'
                : 'bg-amber-100'
            }`}
          >
            <div className="mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-700 stroke-[2.5]" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-700 stroke-[2.5]" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-amber-700 stroke-[2.5]" />}
            </div>
            <div className="flex-1">
              {item.title && <div className="font-black text-sm text-slate-900">{item.title}</div>}
              <div className="text-xs font-bold text-slate-700 mt-0.5">{item.message}</div>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="p-1 hover:bg-black/10 rounded cursor-pointer transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
