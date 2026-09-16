import React from 'react';
import HamburgerMenu from './HamburgerMenu';
import MaintenanceWrapper from './MaintenanceWrapper';

const UserLayout = ({ children }) => {
  return (
    <MaintenanceWrapper>
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <HamburgerMenu />
        {children}
      </div>
    </MaintenanceWrapper>
  );
};

export default UserLayout;