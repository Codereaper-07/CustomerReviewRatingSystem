import { createBrowserRouter } from 'react-router-dom';

/**
 * Router configuration.
 *
 * This currently only defines a temporary root route so the application
 * has something to render. Role-based routes are added here as each
 * feature is built, following the planned structure:
 *
 *   /products                -> pages/customer (CustomerLayout)
 *   /products/:productId     -> pages/customer (CustomerLayout)
 *   /admin/dashboard         -> pages/admin (AdminLayout)
 *   /admin/products          -> pages/admin (AdminLayout)
 *   /admin/reviews           -> pages/admin (AdminLayout)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            Customer Review &amp; Rating Management System
          </h1>
          <p className="mt-2 text-slate-500">Project foundation ready. Features coming soon.</p>
        </div>
      </main>
    ),
  },
]);

export default router;
