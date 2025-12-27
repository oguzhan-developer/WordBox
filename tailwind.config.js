/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Colors - Blue (Soğuk ton)
        primary: {
          DEFAULT: '#3B82F6', // Blue 500
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Secondary / Success - Teal (Soğuk yeşil)
        secondary: {
          DEFAULT: '#14B8A6', // Teal 500
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Accent - Violet (Soğuk mor)
        accent: {
          DEFAULT: '#8B5CF6', // Violet 500
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Danger / Error - Pink (Soğuk kırmızı)
        danger: {
          DEFAULT: '#EC4899', // Pink 500
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },
        // Warning / Orange (Koruması için)
        warning: {
          DEFAULT: '#F97316', // Orange 500
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Info / Sky
        info: {
          DEFAULT: '#0EA5E9', // Sky 500
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Purple / C1 Level - Indigo (Derin mor-mavi)
        purple: {
          DEFAULT: '#6366F1', // Indigo 500
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Brand colors (ProfilePage vs. için)
        brand: {
          blue: '#3B82F6',
          green: '#14B8A6',
          orange: '#F97316',
          purple: '#8B5CF6',
        },
        // Level Colors - Soğuk tonlar
        level: {
          a1: '#3B82F6', // Blue - A1
          a2: '#0EA5E9', // Sky - A2
          b1: '#14B8A6', // Teal - B1
          b2: '#8B5CF6', // Violet - B2
          c1: '#6366F1', // Indigo - C1
        },
        // Learning Status - Soğuk tonlar
        status: {
          new: '#3B82F6', // Blue - New
          learning: '#8B5CF6', // Violet - Learning
          learned: '#14B8A6', // Teal - Learned
        },
        // Dark mode specific
        dark: {
          bg: '#0F172A', // Slate 900
          card: '#1E293B', // Slate 800
          border: '#334155', // Slate 700
          text: '#F1F5F9', // Slate 100
          muted: '#94A3B8', // Slate 400
        },
        // Light mode specific
        light: {
          bg: '#F8FAFC', // Slate 50
          card: '#FFFFFF',
          border: '#E2E8F0', // Slate 200
          text: '#1E293B', // Slate 800
          muted: '#64748B', // Slate 500
        },
      },
      fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
