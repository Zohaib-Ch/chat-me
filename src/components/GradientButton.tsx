import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from '../theme';

type ButtonVariant = 'solid' | 'accent' | 'glass';

interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getGradientColors = () => {
    if (disabled) return ['#CBD5E1', '#94A3B8'] as const;
    if (variant === 'accent') return COLORS.accentGradient;
    return COLORS.primaryGradient;
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          variant === 'glass' ? styles.glassText : styles.solidText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );

  if (variant === 'glass') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
        style={[
          styles.buttonBase,
          styles.glassButton,
          disabled && styles.disabledGlass,
          animatedStyle,
          style,
        ]}
      >
        {renderContent()}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !onPress}
      style={[
        styles.buttonBase,
        SHADOWS.floating,
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {renderContent()}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    height: 52,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    ...TYPOGRAPHY.bodyBold,
    textAlign: 'center',
  },
  solidText: {
    color: COLORS.white,
  },
  glassText: {
    color: COLORS.textPrimary,
  },
});
