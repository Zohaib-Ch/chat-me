import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SHADOWS } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 15,
}) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="light"
        style={[styles.glassCard, SHADOWS.glass, style]}
      >
        {children}
      </BlurView>
    );
  }

  // Fallback for Android with optimized semi-transparent surface and shadows
  return (
    <View style={[styles.glassCard, styles.androidShadow, SHADOWS.glass, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: COLORS.glassBg,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.5,
    borderRadius: RADIUS.xl,
    padding: 16,
    overflow: 'hidden',
  },
  androidShadow: {
    // Extra elevation control if needed for Android
    elevation: 3,
  },
});
