import React, { useState } from 'react';
import { StyleSheet, TextInput, View, ViewStyle, TextInputProps, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from '../theme';

interface GlassInputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0.5);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderOpacity.value = withTiming(0.85, { duration: 200 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.5, { duration: 200 });
    if (onBlur) onBlur(e);
  };

  const animatedBorder = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(255, 255, 255, ${borderOpacity.value})`,
      backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.65)',
    };
  });

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        SHADOWS.glass,
        animatedBorder,
        containerStyle,
      ]}
    >
      {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
      
      <TextInput
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, style]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      
      {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  leftIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
