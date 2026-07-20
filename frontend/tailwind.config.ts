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
        background: 'var(--background)',
        cream: 'var(--background)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        forest: {
          DEFAULT: 'var(--forest)',
          light: 'var(--forest-light)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
        },
        accent: 'var(--accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        border: 'var(--border)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        script: ['var(--font-caveat)', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '24px',
        btn: '999px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(11, 29, 19, 0.08)',
        soft: '0 4px 14px rgba(11, 29, 19, 0.06)',
      },
      screens: {
        tablet: '768px',
        desktop: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
