import { Platform } from 'react-native';

export const COLORS = {
  // Pastel gradients for background
  bgStart: '#FAF6FB', // soft pinkish-lavender
  bgEnd: '#F6F8FD',   // soft powder-blue
  
  // Frosted glass panel properties
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.50)',
  
  // Brand primary gradients (Deep indigo/violet)
  primaryStart: '#8F43EE',
  primaryEnd: '#6F1AB6',
  primaryGradient: ['#8F43EE', '#6F1AB6'] as const,
  
  // Accent gradient (Vibrant Rose/Pink) for likes, activity markers, and special items
  accentStart: '#FF6080',
  accentEnd: '#FF85A1',
  accentGradient: ['#FF6080', '#FF85A1'] as const,
  
  // Subtle text styling
  textPrimary: '#1E1B4B',   // Deep dark blue-black
  textSecondary: '#64748B', // Medium slate
  textMuted: '#94A3B8',     // Light slate / placeholder
  white: '#FFFFFF',
  
  // Active/functional colors
  online: '#10B981',       // Emerald online indicator
  unreadBadge: '#FF3B30',  // Crimson red indicator
  bannerText: '#7C3AED',   // Purple highlight text
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  max: 9999,
};

export const SHADOWS = {
  // Soft ambient violet shadow for glass cards
  glass: {
    shadowColor: '#9A80B9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 3,
  },
  // Deep premium shadow for floating elements
  floating: {
    shadowColor: '#6F1AB6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  subtext: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: COLORS.textMuted,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  subtextBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
};
