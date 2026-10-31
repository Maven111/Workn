import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Color Roles ONLY (Tier 2 - No raw primitives exposed)
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-on-primary)',
          container: 'var(--color-primary-container)',
          'on-container': 'var(--color-on-primary-container)',
          fixed: 'var(--color-primary-fixed)',
          'on-fixed': 'var(--color-on-primary-fixed)',
          'fixed-dim': 'var(--color-primary-fixed-dim)',
          'on-fixed-dim': 'var(--color-on-primary-fixed-dim)',
          inverse: 'var(--color-inverse-primary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-on-secondary)',
          container: 'var(--color-secondary-container)',
          'on-container': 'var(--color-on-secondary-container)',
          fixed: 'var(--color-secondary-fixed)',
          'on-fixed': 'var(--color-on-secondary-fixed)',
          'fixed-dim': 'var(--color-secondary-fixed-dim)',
          'on-fixed-variant': 'var(--color-on-secondary-fixed-variant)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          foreground: 'var(--color-on-tertiary)',
          container: 'var(--color-tertiary-container)',
          'on-container': 'var(--color-on-tertiary-container)',
          fixed: 'var(--color-tertiary-fixed)',
          'on-fixed': 'var(--color-on-tertiary-fixed)',
          'fixed-dim': 'var(--color-tertiary-fixed-dim)',
          'on-fixed-variant': 'var(--color-on-tertiary-fixed-variant)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-on-surface)',
          variant: 'var(--color-surface-variant)',
          'on-variant': 'var(--color-on-surface-variant)',
          bright: 'var(--color-surface-bright)',
          dim: 'var(--color-surface-dim)',
          tint: 'var(--color-surface-tint)',
          container: {
            lowest: 'var(--color-surface-container-lowest)',
            low: 'var(--color-surface-container-low)',
            DEFAULT: 'var(--color-surface-container)',
            high: 'var(--color-surface-container-high)',
            highest: 'var(--color-surface-container-highest)',
          },
          inverse: 'var(--color-inverse-surface)',
          'on-inverse': 'var(--color-inverse-on-surface)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
          foreground: 'var(--color-on-background)',
        },
        outline: {
          DEFAULT: 'var(--color-outline-colour)',
          variant: 'var(--color-outline-variant)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-on-error)',
          container: 'var(--color-error-container)',
          'on-container': 'var(--color-on-error-container)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-on-success)',
          container: 'var(--color-success-container)',
          'on-container': 'var(--color-on-success-container)',
        },
        scrim: 'var(--color-scrim)',
        shadow: 'var(--color-shadow)',
      },
      fontFamily: {
        display: ['var(--type-display-large-font-family)', 'sans-serif'],
        headline: ['var(--type-headline-large-font-family)', 'sans-serif'],
        title: ['var(--type-title-large-font-family)', 'sans-serif'],
        body: ['var(--type-body-large-font-family)', 'sans-serif'],
        label: ['var(--type-label-large-font-family)', 'sans-serif'],
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        soft: 'var(--effect-soft-shadow)',
        medium: 'var(--effect-medium-shadow)',
        hard: 'var(--effect-hard-shadow)',
      },
    },
  },
  plugins: [],
};

export default config;
