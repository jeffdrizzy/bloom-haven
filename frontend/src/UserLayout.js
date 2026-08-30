import React from 'react';
import HamburgerMenu from './HamburgerMenu';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <HamburgerMenu />
      {children}
    </div>
  );
};

export default UserLayout;