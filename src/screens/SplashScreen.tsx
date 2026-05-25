import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Full-screen transition exit animations
  const exitScale = useSharedValue(1);
  const exitOpacity = useSharedValue(1);

  // Background liquid spheres continuous drifting
  const sphere1X = useSharedValue(0);
  const sphere1Y = useSharedValue(0);
  const sphere1Scale = useSharedValue(1);

  const sphere2X = useSharedValue(0);
  const sphere2Y = useSharedValue(0);
  const sphere2Scale = useSharedValue(1);

  const sphere3X = useSharedValue(0);
  const sphere3Y = useSharedValue(0);

  // Central logo entry animations
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-15);
  const logoTranslateY = useSharedValue(20);

  // Text cinematic sequence offsets
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(25);
  const titleLetterSpacing = useSharedValue(0);

  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  // Logo surface glow light sweep offset
  const glowX = useSharedValue(-120);

  useEffect(() => {
    // 1. Drifting Sphere 1 (Top Left Liquid Sphere)
    sphere1X.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sphere1Y.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 5500, easing: Easing.inOut(Easing.ease) }),
        withTiming(30, { duration: 6500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sphere1Scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 2. Drifting Sphere 2 (Bottom Right Liquid Sphere)
    sphere2X.value = withRepeat(
      withSequence(
        withTiming(-50, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        withTiming(30, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sphere2Y.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 6500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-25, { duration: 5500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sphere2Scale.value = withRepeat(
      withSequence(
        withTiming(0.92, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.06, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 3. Drifting Sphere 3 (Center Right Small Liquid Sphere)
    sphere3X.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(20, { duration: 5500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sphere3Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-40, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 4. Logo Entry Reveal
    logoScale.value = withDelay(
      300,
      withSpring(1.0, { damping: 14, stiffness: 90 }) // Luxury deceleration curve
    );
    logoOpacity.value = withDelay(300, withTiming(1.0, { duration: 700 }));
    logoRotate.value = withDelay(
      300,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    logoTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 14, stiffness: 90 })
    );

    // Glow Light Sweep
    glowX.value = withDelay(
      1100,
      withTiming(150, { duration: 1000, easing: Easing.out(Easing.quad) })
    );

    // 5. Cinematic Text Sequence
    titleOpacity.value = withDelay(600, withTiming(1.0, { duration: 800 }));
    titleTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 12, stiffness: 110 })
    );
    titleLetterSpacing.value = withDelay(
      600,
      withTiming(4, { duration: 1200, easing: Easing.out(Easing.quad) })
    );

    taglineOpacity.value = withDelay(900, withTiming(1.0, { duration: 800 }));
    taglineTranslateY.value = withDelay(
      900,
      withSpring(0, { damping: 12, stiffness: 110 })
    );

    // 6. Theatrical Full-Screen Exit Transition
    const exitTimer = setTimeout(() => {
      exitScale.value = withTiming(1.06, { duration: 650, easing: Easing.inOut(Easing.quad) });
      exitOpacity.value = withTiming(0, { duration: 550, easing: Easing.out(Easing.quad) });
      
      // Navigate on completion
      setTimeout(() => {
        onFinish();
      }, 600);
    }, 3200);

    return () => clearTimeout(exitTimer);
  }, []);

  // Animated styles
  const bubble1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: sphere1X.value },
      { translateY: sphere1Y.value },
      { scale: sphere1Scale.value },
    ],
  }));

  const bubble2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: sphere2X.value },
      { translateY: sphere2Y.value },
      { scale: sphere2Scale.value },
    ],
  }));

  const bubble3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: sphere3X.value },
      { translateY: sphere3Y.value },
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
      { translateY: logoTranslateY.value },
    ],
    opacity: logoOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glowX.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
    letterSpacing: titleLetterSpacing.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const containerExitStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
    transform: [{ scale: exitScale.value }],
  }));

  return (
    <Animated.View style={[styles.mainWrapper, containerExitStyle]}>
      <LinearGradient
        colors={[COLORS.bgStart, COLORS.bgEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background liquid gradient blobs */}
        <Animated.View style={[styles.bubble, styles.bubble1, bubble1Style]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.65)', 'rgba(143, 67, 238, 0.16)']}
            style={styles.bubbleInner}
          />
        </Animated.View>

        <Animated.View style={[styles.bubble, styles.bubble2, bubble2Style]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.55)', 'rgba(255, 96, 128, 0.12)']}
            style={styles.bubbleInner}
          />
        </Animated.View>

        <Animated.View style={[styles.bubble, styles.bubble3, bubble3Style]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.45)', 'rgba(250, 204, 21, 0.08)']}
            style={styles.bubbleInner}
          />
        </Animated.View>

        {/* Ambient background blur (simulated via high scale overlay) */}
        <View style={styles.blurOverlay} />

        {/* Main Logo Reveal Section */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.logoIconContainer, logoStyle]}>
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.logoBubble}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Inner glowing heart shape */}
              <LinearGradient
                colors={COLORS.accentGradient}
                style={styles.heartShape}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Surface Light Flare Streak */}
              <Animated.View style={[styles.glowStreak, glowStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                  style={styles.glowInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </LinearGradient>
            
            {/* Soft lighting base under-glow */}
            <View style={styles.underGlow} />
          </Animated.View>

          {/* Animated Text Headers */}
          <View style={styles.textWrapper}>
            <Animated.Text style={[styles.title, titleStyle]}>
              ChatMe
            </Animated.Text>
            
            <Animated.View style={[styles.taglineWrapper, taglineStyle]}>
              <Sparkles size={14} color={COLORS.primaryStart} style={{ marginRight: 6 }} />
              <Text style={styles.tagline}>Connect with the world, one chat at a time.</Text>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgStart,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 246, 251, 0.15)',
    zIndex: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  logoBubble: {
    width: 110,
    height: 110,
    borderRadius: 38,
    borderBottomLeftRadius: 10, // speech bubble tail anchor
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: COLORS.primaryStart,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  heartShape: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderBottomRightRadius: 4, // tilted heart shape
    transform: [{ rotate: '-45deg' }],
  },
  glowStreak: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    zIndex: 3,
    transform: [{ rotate: '25deg' }],
  },
  glowInner: {
    flex: 1,
  },
  underGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primaryStart,
    opacity: 0.12,
    zIndex: -1,
    ...Platform.select({
      ios: {
        filter: 'blur(35px)',
      },
    }),
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(154, 128, 185, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  taglineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    ...TYPOGRAPHY.subtextBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Background liquid particles
  bubble: {
    position: 'absolute',
    borderRadius: RADIUS.max,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
    zIndex: 2,
  },
  bubbleInner: {
    flex: 1,
  },
  bubble1: {
    width: 250,
    height: 250,
    top: height * 0.08,
    left: -60,
  },
  bubble2: {
    width: 320,
    height: 320,
    bottom: height * 0.14,
    right: -80,
  },
  bubble3: {
    width: 140,
    height: 140,
    top: height * 0.44,
    right: 20,
  },
});
