/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#111111',
        secondary: '#6B6B6B',
        muted: '#8A8A8A',
        border: '#E5E5E5',
        surface: {
          light: '#F5F5F5',
          dark: '#000000',
        },
        dark: {
          DEFAULT: '#000000',
          text: '#FFFFFF',
          muted: '#8A8A8A',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Geist',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        micro: ['12px', { lineHeight: '1.4' }],
        small: ['14px', { lineHeight: '1.45' }],
        body: ['17px', { lineHeight: '1.55' }],
        'body-lg': ['20px', { lineHeight: '1.5' }],
        h4: ['24px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        h3: ['36px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h2: ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        h1: ['72px', { lineHeight: '1.0', letterSpacing: '-0.035em' }],
        display: ['96px', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'display-xl': ['120px', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
      },
      spacing: {
        '4px': '4px',
        '8px': '8px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '48px': '48px',
        '64px': '64px',
        '80px': '80px',
        '96px': '96px',
        '120px': '120px',
        '160px': '160px',
        '192px': '192px',
        '240px': '240px',
      },
      maxWidth: {
        container: '1440px',
        content: '680px',
      },
      borderRadius: {
        subtle: '8px',
        medium: '12px',
        large: '16px',
        media: '20px',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
