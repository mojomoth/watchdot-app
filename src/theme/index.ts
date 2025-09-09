import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Background colors for dark theme
    background: {
      primary: '#000000',
      secondary: '#0a0a0a',
      tertiary: '#141414',
    },
    // Glass effect colors - adjusted for dark background
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.08)',
      heavy: 'rgba(255, 255, 255, 0.12)',
      dark: 'rgba(0, 0, 0, 0.4)',
      darkMedium: 'rgba(0, 0, 0, 0.6)',
      darkHeavy: 'rgba(0, 0, 0, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    // Primary colors
    primary: '#007AFF',
    primaryLight: '#4DA2FF',
    primaryDark: '#0055CC',
    // Accent colors - brighter for dark background
    accent: '#00D4FF',
    accentLight: '#66E5FF',
    accentDark: '#00A3CC',
    // Status colors
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#FF5252',
    info: '#2196F3',
    // Text colors for dark background
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.8)',
      disabled: 'rgba(255, 255, 255, 0.4)',
      inverse: '#000000',
    },
    // Border color
    border: 'rgba(255, 255, 255, 0.12)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  typography: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 24,
      '2xl': 32,
      '3xl': 40,
    },
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 0,
    },
  },
  blur: {
    light: 10,
    medium: 20,
    heavy: 30,
    max: 50,
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      linear: [0, 0, 1, 1],
      easeIn: [0.42, 0, 1, 1],
      easeOut: [0, 0, 0.58, 1],
      easeInOut: [0.42, 0, 0.58, 1],
      spring: [0.25, 0.1, 0.25, 1],
    },
  },
  platform: {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    headerHeight: Platform.select({
      ios: 44,
      android: 56,
      default: 50,
    }),
    statusBarHeight: Platform.select({
      ios: 20,
      android: 0,
      default: 0,
    }),
    tabBarHeight: Platform.select({
      ios: 83,
      android: 56,
      default: 60,
    }),
  },
};

export type Theme = typeof theme;