import React from 'react';
import { brand } from './brand';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
      <div className="max-w-md w-full text-center p-8">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: brand.colors.primary }}>
          Under Maintenance
        </h1>
        <p className="text-lg mb-6" style={{ color: brand.colors.textLight }}>
          We're currently performing scheduled maintenance to improve your experience.
        </p>
        <p className="text-sm" style={{ color: brand.colors.textMuted }}>
          We'll be back shortly. Thank you for your patience! 🌸
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: brand.colors.primary, animationDelay: '0s' }}></div>
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: brand.colors.primary, animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: brand.colors.primary, animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-xs mt-8" style={{ color: brand.colors.textMuted }}>
          Bloom Haven • Where Your Wealth Blossoms
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;