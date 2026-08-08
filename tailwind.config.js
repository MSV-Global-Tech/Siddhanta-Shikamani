/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FDFAF4',
          default: '#FDFAF4',
          soft: '#F4E9D8',
          subtle: '#EADBC4',
          surface: '#FFFFFF',
          'surface-soft': '#FBF3E7',
        },
        primary: {
          DEFAULT: '#8A3324',
          default: '#8A3324',
          light: '#B5654A',
          dark: '#5E2116',
          subtle: '#F2E0D4',
          soft: '#EAD7C7',
        },
        secondary: {
          DEFAULT: '#B4832E',
          default: '#B4832E',
          light: '#D4A24C',
          dark: '#8C6220',
          subtle: '#F7ECD6',
        },
        text: {
          DEFAULT: '#3D2314',
          default: '#3D2314',
          muted: '#7A5C48',
          subtle: '#A88C74',
          inverted: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E3D3BD',
          default: '#E3D3BD',
          light: '#EFE4D3',
          strong: '#D4BFA3',
        },
        success: '#4B8B3B',
        warning: '#C0902F',
        error: '#C0392B',
        info: '#B4832E',
        bookmark: '#B4832E',
      },
      fontFamily: {
        kannada: [
          'NotoSansKannada-Regular',
          'sans-serif',
        ],
        'kannada-bold': [
          'NotoSansKannada-Bold',
          'sans-serif',
        ],
        'kannada-medium': [
          'NotoSansKannada-Medium',
          'sans-serif',
        ],
        'kannada-semi': [
          'NotoSansKannada-SemiBold',
          'sans-serif',
        ],
        'serif-kan': [
          'NotoSerifKannada-Regular',
          'serif',
        ],
        'serif-kan-bold': [
          'NotoSerifKannada-Bold',
          'serif',
        ],
      },
      fontSize: {
        'xs-kan': '12px',
        'sm-kan': '14px',
        'base-kan': '16px',
        'lg-kan': '18px',
        'xl-kan': '20px',
        '2xl-kan': '24px',
        '3xl-kan': '30px',
        '4xl-kan': '36px',
      },
      spacing: {
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '4.5': '18px',
        '13': '52px',
        '14': '56px',
        '15': '60px',
        '16': '64px',
        '17': '68px',
        '18': '72px',
        '19': '76px',
        '26': '104px',
        '30': '120px',
        '34': '136px',
        '88': '352px',
        '112': '448px',
        '128': '512px',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(61, 35, 20, 0.06)',
        'card': '0 4px 24px rgba(61, 35, 20, 0.08)',
        'elevated': '0 8px 32px rgba(61, 35, 20, 0.1)',
        'floating': '0 12px 48px rgba(138, 51, 36, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
