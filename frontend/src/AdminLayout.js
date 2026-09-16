import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from './services/api';
import { brand } from './brand';
import NotificationBell from './NotificationBell';
import {
  Crown,
  Receipt,
  Banknote,
  KeyRound,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutGrid,
} from './icons';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/admin', Icon: LayoutGrid, label: 'Dashboard' },
    { path: '/admin/deposits', Icon: Receipt, label: 'Manage Deposits' },
    { path: '/admin/withdrawals', Icon: Banknote, label: 'Withdrawals' },
    { path: '/admin/pins', Icon: KeyRound, label: 'PIN Management' },
    { path: '/admin/kyc', Icon: ShieldCheck, label: 'KYC Verification' },
    { path: '/admin/settings', Icon: Settings, label: 'Settings' },
  ];

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    authService.logout();
    navigate('/admin-login');
  };

  return (
    <>
      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center"
        style={{
          background: 'rgba(250, 249, 246, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${brand.colors.primarySoft}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: brand.colors.creamSoft }}
          >
            <Crown size={20} strokeWidth={2} style={{ color: brand.colors.primary }} />
          </div>
          <div>
            <span
              className="text-xl font-bold"
              style={{ color: brand.colors.primary }}
            >
              Bloom Haven
            </span>
            <span
              className="text-xs block -mt-0.5"
              style={{ color: brand.colors.textMuted }}
            >
              Admin Panel
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          <NotificationBell />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg transition"
            style={{
              background: isOpen ? brand.colors.creamSoft : 'transparent',
              color: brand.colors.primary,
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div style={{ height: '64px' }} />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: brand.colors.surface }}
      >
        {/* Sidebar Header */}
        <div
          className="p-6"
          style={{ borderBottom: `1px solid ${brand.colors.primarySoft}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: brand.colors.creamSoft }}
              >
                <Crown size={24} strokeWidth={2} style={{ color: brand.colors.primary }} />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: brand.colors.primary }}
                >
                  Admin Panel
                </h2>
                <p
                  className="text-xs"
                  style={{ color: brand.colors.textMuted }}
                >
                  Bloom Haven
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg transition"
              style={{ color: brand.colors.textLight }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.Icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                  isActive ? 'font-semibold' : ''
                }`}
                style={{
                  background: isActive ? brand.colors.creamSoft : 'transparent',
                  color: isActive ? brand.colors.primary : brand.colors.text,
                }}
              >
                <IconComponent size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-lg">{item.label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-8 rounded-full"
                    style={{ background: brand.colors.primary }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          className="border-t mx-4"
          style={{ borderColor: brand.colors.primarySoft }}
        />

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition"
            style={{ color: brand.colors.error, background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FDF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={22} strokeWidth={1.8} />
            <span className="text-lg font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ borderTop: `1px solid ${brand.colors.primarySoft}` }}
        >
          <p
            className="text-xs text-center"
            style={{ color: brand.colors.textMuted }}
          >
            Bloom Haven Admin v1.0
          </p>
        </div>
      </div>

      {/* ⭐ MAIN CONTENT — This is what was missing! */}
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
    </>
  );
};

export default AdminLayout;