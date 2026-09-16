import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, Shield, LogOut, LogIn, UserPlus, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2.5 border-black px-4 py-3 shadow-[0_4px_0_0_#000]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/products" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-amber-300 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_0_#000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
            <Star className="w-6 h-6 fill-black text-black" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
              ReviewHub
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Rating &amp; Reviews
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/products"
            className={`neo-btn py-1.5 px-3 text-sm ${
              location.pathname.startsWith('/products') ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <Package className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Products
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                className={`neo-btn py-1.5 px-3 text-sm ${
                  location.pathname === '/admin/dashboard' ? 'neo-btn-accent' : 'neo-btn-secondary'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                className={`neo-btn py-1.5 px-3 text-sm ${
                  location.pathname === '/admin/products' ? 'neo-btn-accent' : 'neo-btn-secondary'
                }`}
              >
                <Shield className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Manage Catalog
              </Link>
            </>
          )}
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 leading-tight">
                  {user?.name}
                </span>
                <Badge
                  variant={isAdmin ? 'secondary' : 'accent'}
                  className="text-[10px] py-0 px-1.5 mt-0.5"
                >
                  {user?.role}
                </Badge>
              </div>

              <Button
                variant="secondary"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="py-1.5 px-3 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary" className="py-1.5 px-3 text-xs">
                  <LogIn className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="py-1.5 px-3 text-xs">
                  <UserPlus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden items-center justify-center gap-2 pt-2.5 mt-2.5 border-t-2 border-black/10 text-xs font-black">
        <Link
          to="/products"
          className={`neo-badge py-1 px-2.5 ${
            location.pathname.startsWith('/products') ? 'bg-amber-300' : 'bg-white'
          }`}
        >
          <Package className="w-3 h-3 mr-1 inline" />
          Catalog
        </Link>
        {isAdmin && (
          <>
            <Link
              to="/admin/dashboard"
              className={`neo-badge py-1 px-2.5 ${
                location.pathname === '/admin/dashboard' ? 'bg-sky-300' : 'bg-white'
              }`}
            >
              <LayoutDashboard className="w-3 h-3 mr-1 inline" />
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className={`neo-badge py-1 px-2.5 ${
                location.pathname === '/admin/products' ? 'bg-purple-300' : 'bg-white'
              }`}
            >
              <Shield className="w-3 h-3 mr-1 inline" />
              Manage
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
