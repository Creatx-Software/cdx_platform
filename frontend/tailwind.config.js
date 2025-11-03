/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Digital Gold Premium Theme
        primary: {
          50: '#fefce8',   // Very light gold tint
          100: '#fef3c7',  // Soft gold
          200: '#fde68a',  // Light gold
          300: '#fcd34d',  // Medium gold
          400: '#fbbf24',  // Rich gold
          500: '#f59e0b',  // Premium gold (main)
          600: '#d97706',  // Deep gold
          700: '#b45309',  // Darker gold
          800: '#92400e',  // Dark gold
          900: '#78350f',  // Very dark gold
        },
        // Secondary colors for depth
        secondary: {
          50: '#f8fafc',   // Very light gray
          100: '#f1f5f9',  // Light gray
          200: '#e2e8f0',  // Soft gray
          300: '#cbd5e1',  // Medium gray
          400: '#94a3b8',  // Gray
          500: '#64748b',  // Medium dark gray
          600: '#475569',  // Dark gray
          700: '#334155',  // Very dark gray
          800: '#1e293b',  // Deep gray
          900: '#0f172a',  // Darkest gray
        },
        // Accent colors for status and highlights
        accent: {
          success: '#059669',   // Emerald-600 (completed transactions)
          warning: '#dc6803',   // Orange-600 (pending)
          error: '#dc2626',     // Red-600 (failed)
          info: '#2563eb',      // Blue-600 (processing)
          purple: '#7c3aed',    // Violet-600 (premium features)
        },
        // Background variations
        background: {
          primary: '#ffffff',   // Pure white
          secondary: '#fafaf9', // Stone-50 (slight warm tint)
          tertiary: '#f5f5f4',  // Stone-100
          card: '#ffffff',      // White cards
          muted: '#f8fafc',     // Slate-50
        },
        // Border colors
        border: {
          light: '#e5e7eb',     // Gray-200
          medium: '#d1d5db',    // Gray-300
          dark: '#9ca3af',      // Gray-400
          primary: '#f59e0b',   // Gold border
        },
        // Text colors
        text: {
          primary: '#111827',   // Gray-900 (main text)
          secondary: '#374151', // Gray-700 (secondary text)
          muted: '#6b7280',     // Gray-500 (muted text)
          light: '#9ca3af',     // Gray-400 (light text)
          white: '#ffffff',     // White text
        }
      },
      // Premium gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        'gradient-hero': 'linear-gradient(135deg, #fefce8 0%, #f8fafc 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
      },
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      // Spacing for consistency
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },
      // Box shadows for depth
      boxShadow: {
        'premium': '0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)',
        'premium-lg': '0 20px 25px -5px rgba(245, 158, 11, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      // Border radius for modern look
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      // Animation timing
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}

