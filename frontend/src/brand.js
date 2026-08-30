export const brand = {
  name: 'Bloom Haven',
  shortName: 'Bloom',
  tagline: 'Where Your Wealth Blossoms',
  description: 'Modern banking and cryptocurrency management in one secure sanctuary.',
  
  colors: {
    // Primary greens extracted from the logo
    primary: '#8A9A7F',          // Main sage green (outer petals + text)
    primaryDark: '#6F7F65',       // Deeper sage for hover / emphasis
    primaryLight: '#A7B69F',      // Softer mid-tone sage
    primarySoft: '#C5D0BE',       // Very light sage for backgrounds / chips

    // Cream / ivory from the flower center
    cream: '#FCF4E7',
    creamDark: '#F0E5D1',
    creamSoft: '#F8F1E6',

    // Supporting neutrals
    background: '#FAF9F6',        // Warm off-white
    surface: '#FFFFFF',
    surfaceAlt: '#F7F5F0',        // Slightly warmer surface

    // Text
    text: '#3D4A3A',              // Soft dark green-gray (not pure black)
    textLight: '#6B7568',         // Muted sage-gray
    textMuted: '#8A9385',

    // Accent (subtle, keeps the calm feel)
    accent: '#A7B69F',
    success: '#7A9A6A',
    warning: '#C4A35A',
    error: '#B87A6E'
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #A7B69F 0%, #8A9A7F 100%)',
    brand: 'linear-gradient(135deg, #C5D0BE 0%, #8A9A7F 100%)',
    hero: 'linear-gradient(135deg, #FCF4E7 0%, #E8F0E3 50%, #C5D0BE 100%)',
    soft: 'linear-gradient(180deg, #FAF9F6 0%, #F0EBE3 100%)',
    cream: 'linear-gradient(135deg, #FCF4E7 0%, #F0E5D1 100%)',
    dark: 'linear-gradient(135deg, #3D4A3A 0%, #2A3328 100%)'
  },
  
  fonts: {
    heading: "'Poppins', 'Segoe UI', system-ui, sans-serif",
    body: "'Inter', 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  }
};