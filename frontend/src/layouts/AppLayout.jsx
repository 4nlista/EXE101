import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AppLayout() {

  return (
    <div className="layout-shell">
      {/* ── Fixed Navbar ── */}
      <Navbar />

      {/* ── Main Content Area ── */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* ── Fixed Footer ── */}
      <Footer />

    </div>
  );
}
