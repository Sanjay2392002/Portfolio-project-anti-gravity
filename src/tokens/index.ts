/**
 * SANJAY PORTFOLIO DESIGN TOKENS
 * Single Source of Truth for Design System, Rhythm, Typography, Spacing & Motion.
 * Inspired by Apple's minimalist web design principles.
 */

export const designTokens = {
  // 1. COLOR SYSTEM (Strictly monochrome shell; project media retains original color)
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    primaryText: '#111111',
    secondaryText: '#6B6B6B',
    mutedText: '#8A8A8A',
    border: '#E5E5E5',
    borderDark: '#222222',
    lightSurface: '#F5F5F5',
    darkSurface: '#000000',
    darkText: '#FFFFFF',
    darkMuted: '#888888',
  },

  // 2. TYPOGRAPHY SYSTEM
  typography: {
    fontFamily: {
      primary: 'Inter, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'Inter, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    scale: {
      micro: {
        size: '12px',
        lineHeight: '1.4',
        letterSpacing: '0.02em',
      },
      small: {
        size: '14px',
        lineHeight: '1.45',
        letterSpacing: '0em',
      },
      body: {
        size: '17px',
        lineHeight: '1.55',
        letterSpacing: '-0.01em',
        maxWidth: '680px',
      },
      bodyLarge: {
        size: '20px',
        lineHeight: '1.5',
        letterSpacing: '-0.015em',
      },
      h4: {
        size: '24px',
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
      },
      h3: {
        size: '36px',
        lineHeight: '1.15',
        letterSpacing: '-0.025em',
      },
      h2: {
        size: '56px',
        lineHeight: '1.05',
        letterSpacing: '-0.03em',
      },
      h1: {
        size: '72px',
        lineHeight: '1.0',
        letterSpacing: '-0.035em',
      },
      display: {
        size: '96px',
        lineHeight: '0.98',
        letterSpacing: '-0.04em',
      },
      displayXL: {
        size: '120px',
        lineHeight: '0.95',
        letterSpacing: '-0.045em',
      },
    },
  },

  // 3. GRID & LAYOUT
  layout: {
    maxContentWidth: '1440px',
    desktop: {
      columns: 12,
      columnGap: '24px',
      paddingHorizontal: '48px',
      sectionSpacingY: '160px', // Range 120-200px
    },
    tablet: {
      columns: 8,
      columnGap: '20px',
      paddingHorizontal: '32px',
      sectionSpacingY: '120px',
    },
    mobile: {
      columns: 4,
      columnGap: '16px',
      paddingHorizontal: '20px',
      sectionSpacingY: '80px', // Range 72-120px
    },
  },

  // 4. SPACING SYSTEM (8px rhythm)
  spacing: {
    '4': '4px',
    '8': '8px',
    '16': '16px',
    '24': '24px',
    '32': '32px',
    '48': '48px',
    '64': '64px',
    '80': '80px',
    '96': '96px',
    '120': '120px',
    '160': '160px',
    '192': '192px',
    '240': '240px',
  },

  // 5. BORDER RADIUS (Restrained values)
  radius: {
    none: '0px',
    subtle: '8px',
    medium: '12px',
    large: '16px',
    media: '20px',
  },

  // 6. SHADOWS (Ultra-subtle, non-skeuomorphic)
  shadows: {
    subtle: '0 2px 8px rgba(0, 0, 0, 0.04)',
    dropdown: '0 8px 30px rgba(0, 0, 0, 0.08)',
    modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },

  // 7. MOTION & TRANSITIONS
  motion: {
    easing: {
      apple: [0.22, 1, 0.36, 1], // cubic-bezier(0.22, 1, 0.36, 1)
      appleCSS: 'cubic-bezier(0.22, 1, 0.36, 1)',
      easeOut: [0, 0, 0.2, 1],
      easeInOut: [0.4, 0, 0.2, 1],
    },
    duration: {
      micro: 0.2, // 150-250ms
      ui: 0.35, // 300-500ms
      reveal: 0.7, // 600-900ms
      hero: 0.8, // 800-1500ms
      pageTransition: 0.5,
    },
    transforms: {
      sectionRevealY: 24,
      imageHoverScale: 1.03,
      arrowTranslateX: 6,
    },
    heroStagger: {
      name: 0,
      headline: 0.1,
      description: 0.2,
      scroll: 0.4,
    },
  },

  // 8. NAVIGATION SPECIFICATIONS
  navigation: {
    height: '68px', // 64-72px
    background: 'rgba(255, 255, 255, 0.85)',
    backdropBlur: '20px',
    borderBottom: '1px solid #E5E5E5',
    fontSize: '14px',
    fontWeight: 500,
  },

  // 9. BREAKPOINTS
  breakpoints: {
    tablet: '768px',
    desktop: '1200px',
  },
} as const;

export type DesignTokens = typeof designTokens;
