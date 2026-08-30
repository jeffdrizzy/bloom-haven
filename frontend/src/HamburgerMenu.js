import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from './services/api';
import { brand } from './brand';

const HamburgerMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/deposit', icon: '💳', label: 'Deposit' },
    { path: '/withdraw', icon: '🏦', label: 'Withdraw' },
    { path: '/transactions', icon: '📊', label: 'Transactions' },
    { path: '/profile', icon: '⚙️', label: 'Profile' },
  ];

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    authService.logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Fixed Header with Logo and Hamburger */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center"
        style={{ 
          background: 'rgba(250, 249, 246, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${brand.colors.primarySoft}`
        }}
      >
        {/* Logo and Name - Top Left */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: brand.colors.creamSoft }}>
            <span className="text-2xl">🌸</span>
          </div>
          <div>
            <span className="text-xl font-bold" style={{ color: brand.colors.primary }}>
              Bloom Haven
            </span>
            <span className="text-xs block -mt-0.5" style={{ color: brand.colors.textMuted }}>
              Where Your Wealth Blossoms
            </span>
          </div>
        </div>

        {/* Hamburger Button - Top Right */}
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg transition hover:bg-opacity-20"
          style={{ 
            background: isOpen ? brand.colors.creamSoft : 'transparent',
          }}
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span 
              className={`block h-0.5 w-full transition-all duration-300 ${
                isOpen ? 'rotate-45 translate-y-2' : ''
              }`}
              style={{ 
                background: brand.colors.primary,
                opacity: isOpen ? 1 : 1
              }}
            />
            <span 
              className={`block h-0.5 w-full transition-opacity duration-300 ${
                isOpen ? 'opacity-0' : ''
              }`}
              style={{ background: brand.colors.primary }}
            />
            <span 
              className={`block h-0.5 w-full transition-all duration-300 ${
                isOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
              style={{ 
                background: brand.colors.primary,
                opacity: isOpen ? 1 : 1
              }}
            />
          </div>
        </button>
      </div>

      {/* Spacer */}
      <div className="h-16" />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Slides from Right */}
      <div
        className={`fixed top-0 right-0 h-full w-80 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: brand.colors.surface }}
      >
        {/* Sidebar Header with Logo */}
        <div className="p-6" style={{ borderBottom: `1px solid ${brand.colors.primarySoft}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brand.colors.creamSoft }}>
                <span className="text-3xl">🌸</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: brand.colors.primary }}>Bloom Haven</h2>
                <p className="text-xs" style={{ color: brand.colors.textMuted }}>Where Your Wealth Blossoms</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg transition hover:bg-opacity-20"
              style={{ color: brand.colors.textLight }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                location.pathname === item.path
                  ? 'font-semibold'
                  : ''
              }`}
              style={{
                background: location.pathname === item.path ? brand.colors.creamSoft : 'transparent',
                color: location.pathname === item.path ? brand.colors.primary : brand.colors.text,
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-lg">{item.label}</span>
              {location.pathname === item.path && (
                <span className="ml-auto w-1.5 h-8 rounded-full" style={{ background: brand.colors.primary }} />
              )}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t mx-4" style={{ borderColor: brand.colors.primarySoft }} />

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition"
            style={{ 
              color: brand.colors.error,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FDF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span className="text-2xl">🚪</span>
            <span className="text-lg font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: `1px solid ${brand.colors.primarySoft}` }}>
          <p className="text-xs text-center" style={{ color: brand.colors.textMuted }}>Bloom Haven v1.0</p>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;