// Bloom Haven brand config with dark mode support

export const lightColors = {
  // Primary greens from logo
  primary: '#8A9A7F',
  primaryDark: '#6F7F65',
  primaryLight: '#A7B69F',
  primarySoft: '#C5D0BE',

  // Cream / ivory
  cream: '#FCF4E7',
  creamDark: '#F0E5D1',
  creamSoft: '#F8F1E6',

  // Neutrals
  background: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F5F0',

  // Text
  text: '#3D4A3A',
  textLight: '#6B7568',
  textMuted: '#8A9385',

  // Accent
  accent: '#A7B69F',
  success: '#7A9A6A',
  warning: '#C4A35A',
  error: '#B87A6E',
};

export const darkColors = {
  // Primary → Gold in dark mode
  primary: '#FFC107',
  primaryDark: '#FFA000',
  primaryLight: '#FFD54F',
  primarySoft: 'rgba(255, 193, 7, 0.15)',

  // Cream → Dark surfaces
  cream: '#1C1C1C',
  creamDark: '#252533',
  creamSoft: '#252533',

  // Neutrals
  background: '#0A0A0A',
  surface: '#141414',
  surfaceAlt: '#1C1C1C',

  // Text
  text: '#F5F5F5',
  textLight: '#A3A3A3',
  textMuted: '#6B6B6B',

  // Accent
  accent: '#FFD54F',
  success: '#81C784',
  warning: '#FFD54F',
  error: '#EF5350',
};

export const lightGradients = {
  primary: 'linear-gradient(135deg, #A7B69F 0%, #8A9A7F 100%)',
  brand: 'linear-gradient(135deg, #C5D0BE 0%, #8A9A7F 100%)',
  hero: 'linear-gradient(135deg, #FCF4E7 0%, #E8F0E3 50%, #C5D0BE 100%)',
  soft: 'linear-gradient(180deg, #FAF9F6 0%, #F0EBE3 100%)',
  cream: 'linear-gradient(135deg, #FCF4E7 0%, #F0E5D1 100%)',
  dark: 'linear-gradient(135deg, #3D4A3A 0%, #2A3328 100%)',
};

export const darkGradients = {
  primary: 'linear-gradient(135deg, #FFD54F 0%, #FFA000 100%)',
  brand: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
  hero: 'linear-gradient(135deg, #141414 0%, #0A0A0A 100%)',
  soft: 'linear-gradient(180deg, #141414 0%, #0A0A0A 100%)',
  cream: 'linear-gradient(135deg, #1C1C1C 0%, #141414 100%)',
  dark: 'linear-gradient(135deg, #1C1C1C 0%, #0A0A0A 100%)',
};

// Detect if we're in dark mode (checks document body)
const isDarkMode = () => {
  if (typeof document === 'undefined') return false;
  return document.body.classList.contains('dark-mode');
};

// Create a proxy object that dynamically returns colors based on theme
export const brand = new Proxy(
  {
    name: 'Bloom Haven',
    shortName: 'Bloom',
    tagline: 'Where Your Wealth Blossoms',
    description: 'Modern banking and cryptocurrency management in one secure sanctuary.',
    fonts: {
      heading: "'Poppins', 'Segoe UI', system-ui, sans-serif",
      body: "'Inter', 'Segoe UI', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
  },
  {
    get(target, prop) {
      const dark = isDarkMode();

      if (prop === 'colors') {
        return dark ? darkColors : lightColors;
      }

      if (prop === 'gradients') {
        return dark ? darkGradients : lightGradients;
      }

      return target[prop];
    },
  }
);