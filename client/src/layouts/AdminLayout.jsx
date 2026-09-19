import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeft, ShieldAlert } from 'lucide-react';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      {/* Admin Quick Switcher Banner */}
      <div className="bg-amber-300 border-b-2.5 border-black px-4 py-2 text-xs font-black flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            <span>ADMINISTRATOR PORTAL</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className={`hover:underline ${
                location.pathname === '/admin/dashboard' ? 'underline' : ''
              }`}
            >
              Dashboard
            </Link>
            <span>•</span>
            <Link
              to="/admin/products"
              className={`hover:underline ${
                location.pathname === '/admin/products' ? 'underline' : ''
              }`}
            >
              Catalog Management
            </Link>
            <span>•</span>
            <Link
              to="/admin/reports"
              className={`hover:underline ${
                location.pathname === '/admin/reports' ? 'underline' : ''
              }`}
            >
              Moderation Reports
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AdminLayout;
