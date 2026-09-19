import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export function AdminRoute({ children }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center neo-grid-bg">
        <div className="neo-card p-6 bg-white flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
          <span className="font-black text-sm">Verifying Admin Privileges...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  return children;
}

export default AdminRoute;
