import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AdminRoute from '../components/common/AdminRoute.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import ProductListPage from '../features/products/pages/ProductListPage.jsx';
import ProductDetailPage from '../features/products/pages/ProductDetailPage.jsx';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage.jsx';
import AdminProductsPage from '../features/admin/pages/AdminProductsPage.jsx';

export const router = createBrowserRouter([
  // Public Customer Experience
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/products" replace />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
    ],
  },

  // Auth Pages
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Protected Admin Portal
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/products" replace />,
  },
]);

export default router;
