import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

export function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default CustomerLayout;
