export const colors = {
  background: {
    default: '#FDFAF4',
    soft: '#F4E9D8',
    subtle: '#EADBC4',
    surface: '#FFFFFF',
    surfaceSoft: '#FBF3E7',
  },
  primary: {
    default: '#8A3324',
    light: '#B5654A',
    dark: '#5E2116',
    subtle: '#F2E0D4',
    soft: '#EAD7C7',
  },
  secondary: {
    default: '#B4832E',
    light: '#D4A24C',
    dark: '#8C6220',
    subtle: '#F7ECD6',
  },
  text: {
    default: '#3D2314',
    muted: '#7A5C48',
    subtle: '#A88C74',
    inverted: '#FFFFFF',
  },
  border: {
    default: '#E3D3BD',
    light: '#EFE4D3',
    strong: '#D4BFA3',
  },
  success: '#4B8B3B',
  warning: '#C0902F',
  error: '#C0392B',
  info: '#B4832E',
  bookmark: '#B4832E',
  gradient: {
    primary: ['#A0522D', '#7A2E22'] as [string, string],
    secondary: ['#D4A24C', '#B4832E'] as [string, string],
    card: ['#FFFFFF', '#FBF3E7'] as [string, string],
    header: ['#FFFDF9', '#F4E9D8'] as [string, string],
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  cardPadding: 20,
  screenPadding: 24,
  sectionSpacing: 28,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#3D2314',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  floating: {
    shadowColor: '#8A3324',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 48,
    elevation: 12,
  },
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    reading: 1.9,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
  },
};

export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
};
