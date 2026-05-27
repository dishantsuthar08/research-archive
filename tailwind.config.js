/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', '"Georgia"', 'serif'],
        sans: ['"IBM Plex Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        archive: {
          50:  '#f8f8f6',
          100: '#f0efeb',
          200: '#e2e0d8',
          300: '#ccc9bc',
          400: '#b0ab99',
          500: '#928c78',
          600: '#756f5d',
          700: '#5e594a',
          800: '#4a463a',
          900: '#3a3730',
        },
        ink: {
          DEFAULT: '#1a1a18',
          light: '#2d2d28',
          muted: '#5a5a52',
          faint: '#8a8a80',
        },
        accent: {
          DEFAULT: '#1a3a6b',
          hover: '#142d54',
          light: '#e8eef7',
        },
        rule: '#d8d6cf',
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subheading': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['0.9375rem', { lineHeight: '1.65' }],
        'caption': ['0.8125rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '500' }],
      },
      maxWidth: {
        'archive': '72rem',
        'content': '48rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderColor: {
        DEFAULT: '#d8d6cf',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
