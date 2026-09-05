import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetupModal from '../pages/onboarding/ProfileSetupModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AppLayout() {
  const { currentUser, showSetup, completeProfile, closeSetup } = useAuth();

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

      {/* ── Onboarding Modal (Render đè lên nền Feed) ── */}
      {showSetup && (
        <ProfileSetupModal 
          onClose={closeSetup}
          onComplete={(data) => {
            completeProfile(data);
          }}
          initialName={currentUser?.name}
        />
      )}
    </div>
  );
}
