/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          surface: '#F8FAFC',
          subSurface: '#F1F5F9',
          navy: '#0F172A',
          slate: '#1E293B',
          action: '#2563EB',
          actionHover: '#1D4ED8',
          border: '#E2E8F0',
          borderAccent: '#CBD5E1',
        },
        status: {
          approved: {
            fill: '#ECFDF5',
            border: '#A7F3D0',
            solid: '#10B981',
            text: '#065F46'
          },
          pending: {
            fill: '#FFFBEB',
            border: '#FDE68A',
            solid: '#F59E0B',
            text: '#92400E'
          },
          rejected: {
            fill: '#FEF2F2',
            border: '#FECACA',
            solid: '#EF4444',
            text: '#991B1B'
          },
          draft: {
            fill: '#F1F5F9',
            border: '#CBD5E1',
            solid: '#64748B',
            text: '#334155'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'level-1': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'level-2': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'level-3': '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
