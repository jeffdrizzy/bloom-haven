import React from 'react';
import { useTheme } from './ThemeContext';
import { brand } from './brand';
import { Sun, Moon } from './icons';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition w-full"
      style={{
        background: 'transparent',
        color: brand.colors.text,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? '#2a2a35' : '#F8F9FA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Sun size={22} strokeWidth={1.8} />
          <span className="text-lg font-medium">Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={22} strokeWidth={1.8} />
          <span className="text-lg font-medium">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;