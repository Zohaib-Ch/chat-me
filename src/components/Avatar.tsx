import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../theme';

interface AvatarProps {
  source: ImageSourcePropType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  hasGradientBorder?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: 40,
  md: 54,
  lg: 72,
  xl: 96,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  isOnline = false,
  hasGradientBorder = false,
  style,
}) => {
  const imageSize = SIZE_MAP[size];
  const borderPadding = hasGradientBorder ? 3 : 0;
  const containerSize = imageSize + borderPadding * 2;

  const renderImage = () => (
    <Image
      source={source}
      style={[
        styles.image,
        {
          width: imageSize,
          height: imageSize,
          borderRadius: imageSize / 2,
        },
      ]}
    />
  );

  const renderContent = () => {
    if (hasGradientBorder) {
      return (
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={[
            styles.gradientBorder,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              padding: borderPadding,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderImage()}
        </LinearGradient>
      );
    }

    return renderImage();
  };

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }, style]}>
      {renderContent()}
      
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(10, imageSize * 0.2),
              height: Math.max(10, imageSize * 0.2),
              borderRadius: Math.max(5, imageSize * 0.1),
              borderWidth: Math.max(1.5, imageSize * 0.03),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradientBorder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  onlineDot: {
    backgroundColor: COLORS.online,
    borderColor: COLORS.white,
    position: 'absolute',
    bottom: 2,
    right: 2,
    zIndex: 10,
  },
});
