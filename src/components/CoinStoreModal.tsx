import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Check, CreditCard, ShieldCheck } from 'lucide-react-native';
import { useCoins } from '../context/CoinContext';
import { GlassCard } from './GlassCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

const COIN_PACKAGES = [
  { id: '1', coins: 100, price: '₹89', tag: '' },
  { id: '2', coins: 550, price: '₹399', tag: 'Popular', badgeColor: COLORS.accentGradient },
  { id: '3', coins: 1250, price: '₹799', tag: 'Best Value', badgeColor: COLORS.primaryGradient },
];

// Confetti Particle Component for Checkout Success Screen
interface ConfettiProps {
  index: number;
}

const ConfettiParticle: React.FC<ConfettiProps> = ({ index }) => {
  const startX = Math.random() * width;
  const size = Math.random() * 8 + 6;
  const colors = ['#8F43EE', '#FF6080', '#FFE259', '#3B82F6', '#10B981'];
  const particleColor = colors[index % colors.length];

  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(Math.random() * 360);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(height - 100, {
      duration: Math.random() * 2000 + 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    translateX.value = withTiming(startX + (Math.random() * 80 - 40), {
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
    });
    rotate.value = withTiming(rotate.value + 720, { duration: 3000 });
    opacity.value = withDelay(1800, withTiming(0, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          width: size,
          height: size,
          backgroundColor: particleColor,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const CoinStoreModal: React.FC = () => {
  const { isStoreVisible, setIsStoreVisible, addCoins } = useCoins();
  const [checkoutPackage, setCheckoutPackage] = useState<typeof COIN_PACKAGES[0] | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'checking_out' | 'success'>('idle');

  // Animated positions for bottom sheets
  const storeTranslateY = useSharedValue(height);
  const checkoutTranslateY = useSharedValue(height);

  // Spinning progress ring offset
  const spinValue = useSharedValue(0);

  useEffect(() => {
    if (isStoreVisible) {
      storeTranslateY.value = withSpring(0, { damping: 16, stiffness: 100 });
    } else {
      storeTranslateY.value = withTiming(height, { duration: 350 });
      checkoutTranslateY.value = withTiming(height, { duration: 300 });
    }
  }, [isStoreVisible]);

  const closeStore = () => {
    storeTranslateY.value = withTiming(height, { duration: 350 }, () => {
      runOnJS(setIsStoreVisible)(false);
      runOnJS(setCheckoutPackage)(null);
      runOnJS(setCheckoutStatus)('idle');
    });
    checkoutTranslateY.value = withTiming(height, { duration: 300 });
  };

  const selectPackage = (pkg: typeof COIN_PACKAGES[0]) => {
    setCheckoutPackage(pkg);
    checkoutTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
  };

  const startPayment = () => {
    if (!checkoutPackage) return;
    setCheckoutStatus('checking_out');
    
    // Spin animation for loader
    spinValue.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );

    // Simulate completion after 1.8 seconds
    setTimeout(() => {
      cancelAnimation(spinValue);
      setCheckoutStatus('success');

      // Add coins to context balance
      addCoins(checkoutPackage.coins);

      // Auto dismiss store after 3 seconds
      setTimeout(() => {
        closeStore();
      }, 3000);
    }, 1800);
  };

  // Reanimated style definitions
  const animatedStoreSheet = useAnimatedStyle(() => ({
    transform: [{ translateY: storeTranslateY.value }],
  }));

  const animatedCheckoutSheet = useAnimatedStyle(() => ({
    transform: [{ translateY: checkoutTranslateY.value }],
  }));

  const animatedSpin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  function renderStoreContent() {
    return (
      <View style={styles.sheetContent}>
        {/* Handle Bar */}
        <View style={styles.sheetHandle} />
        
        {/* Close Button */}
        <Pressable onPress={closeStore} style={styles.closeSheetButton}>
          <X size={18} color={COLORS.textPrimary} />
        </Pressable>

        <Text style={styles.sheetTitle}>Coin Store</Text>
        <Text style={styles.sheetSubtitle}>Purchase premium coins to unlock messages and features.</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
          {COIN_PACKAGES.map((pkg) => (
            <Pressable key={pkg.id} onPress={() => selectPackage(pkg)}>
              <GlassCard style={styles.packageCard}>
                <View style={styles.packageCardInner}>
                  <View style={styles.packageLeft}>
                    <LinearGradient
                      colors={['#FFE259', '#FFA751']}
                      style={styles.packageCoinGraphic}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.packageTextWrapper}>
                      <Text style={styles.packageCoinsText}>{pkg.coins} Coins</Text>
                      <Text style={styles.packagePriceText}>{pkg.price}</Text>
                    </View>
                  </View>

                  {pkg.tag !== '' && (
                    <LinearGradient
                      colors={pkg.badgeColor || COLORS.primaryGradient}
                      style={styles.packageTagBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.packageTagText}>{pkg.tag}</Text>
                    </LinearGradient>
                  )}
                </View>
              </GlassCard>
            </Pressable>
          ))}
          
          <View style={styles.secureBadgeWrapper}>
            <ShieldCheck size={14} color={COLORS.online} style={{ marginRight: 6 }} />
            <Text style={styles.secureText}>All transactions are encrypted and secure.</Text>
          </View>
        </ScrollView>

        {/* Checkout Sub-sheet */}
        {checkoutPackage && (
          <Animated.View style={[styles.checkoutSheetContainer, animatedCheckoutSheet]}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={45} tint="light" style={styles.blurCheckoutWrapper}>
                {renderCheckoutContent()}
              </BlurView>
            ) : (
              <View style={[styles.blurCheckoutWrapper, styles.androidCheckoutBg]}>
                {renderCheckoutContent()}
              </View>
            )}
          </Animated.View>
        )}
      </View>
    );
  }

  function renderCheckoutContent() {
    if (!checkoutPackage) return null;

    if (checkoutStatus === 'checking_out') {
      return (
        <View style={styles.statusView}>
          <Animated.View style={[styles.spinner, animatedSpin]} />
          <Text style={styles.statusText}>Processing transaction...</Text>
          <Text style={styles.statusSubtext}>Securing connection with provider...</Text>
        </View>
      );
    }

    if (checkoutStatus === 'success') {
      return (
        <View style={styles.statusView}>
          {/* Confetti Explosion particles */}
          {Array.from({ length: 45 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}

          {/* Success Checkmark Circle */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.successCheckCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Check size={36} color={COLORS.white} strokeWidth={3.5} />
          </LinearGradient>
          
          <Text style={styles.successTextTitle}>Purchase Successful!</Text>
          <Text style={styles.successTextDesc}>
            Added <Text style={{ fontWeight: '800' }}>{checkoutPackage.coins}</Text> coins to your balance.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.checkoutWrapper}>
        <View style={styles.checkoutHeader}>
          <Text style={styles.checkoutTitle}>Checkout Confirmation</Text>
          <Pressable onPress={() => checkoutTranslateY.value = withTiming(height)} style={styles.closeCheckout}>
            <X size={16} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        <GlassCard style={styles.checkoutDetailsCard}>
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutRowLabel}>Selected Package</Text>
            <Text style={styles.checkoutRowVal}>{checkoutPackage.coins} Coins</Text>
          </View>
          <View style={styles.checkoutDivider} />
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutRowLabel}>Payment Method</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CreditCard size={14} color={COLORS.primaryStart} style={{ marginRight: 6 }} />
              <Text style={styles.checkoutRowVal}>G-Pay / UPI</Text>
            </View>
          </View>
          <View style={styles.checkoutDivider} />
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutRowLabelTotal}>Total Price</Text>
            <Text style={styles.checkoutRowValTotal}>{checkoutPackage.price}</Text>
          </View>
        </GlassCard>

        {/* Custom Confirmation button */}
        <Pressable
          onPress={startPayment}
          style={({ pressed }) => [
            styles.confirmBtn,
            pressed && styles.confirmBtnPressed
          ]}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.confirmBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.confirmBtnText}>Confirm &amp; Pay</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  if (!isStoreVisible) return null;

  return (
    <Animated.View style={[styles.storeModalBackdrop]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={closeStore} />
      
      <Animated.View style={[styles.storeSheetContainer, animatedStoreSheet]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={35} tint="light" style={styles.blurSheetWrapper}>
            {renderStoreContent()}
          </BlurView>
        ) : (
          <View style={[styles.blurSheetWrapper, styles.androidSheetBg]}>
            {renderStoreContent()}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Coin Store Bottom Sheet Modal Styles
  storeModalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 27, 75, 0.40)',
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  storeSheetContainer: {
    width: '100%',
    height: height * 0.72,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    overflow: 'hidden',
    borderColor: COLORS.glassBorder,
    borderTopWidth: 1.5,
  },
  blurSheetWrapper: {
    flex: 1,
  },
  androidSheetBg: {
    backgroundColor: '#FAF6FB',
  },
  sheetContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: SPACING.xl,
    position: 'relative',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(30, 27, 75, 0.20)',
    marginBottom: 18,
  },
  closeSheetButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    zIndex: 10,
  },
  sheetTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sheetSubtitle: {
    ...TYPOGRAPHY.subtext,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  packageCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  packageCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageCoinGraphic: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.white,
    marginRight: SPACING.md,
    ...SHADOWS.glass,
  },
  packageTextWrapper: {
    justifyContent: 'center',
  },
  packageCoinsText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  packagePriceText: {
    ...TYPOGRAPHY.subtextBold,
    fontSize: 12,
    color: COLORS.primaryStart,
    marginTop: 2,
  },
  packageTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  packageTagText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  secureBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  secureText: {
    ...TYPOGRAPHY.subtext,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // Checkout Sub-sheet Styles
  checkoutSheetContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  blurCheckoutWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidCheckoutBg: {
    backgroundColor: 'rgba(250, 246, 251, 0.98)',
  },
  checkoutWrapper: {
    width: '100%',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 24,
  },
  checkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkoutTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  closeCheckout: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutDetailsCard: {
    padding: 16,
    borderRadius: RADIUS.lg,
    marginBottom: 24,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkoutDivider: {
    height: 1,
    backgroundColor: COLORS.glassBorder,
  },
  checkoutRowLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  checkoutRowVal: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  checkoutRowLabelTotal: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  checkoutRowValTotal: {
    ...TYPOGRAPHY.h1,
    fontSize: 22,
    color: COLORS.primaryEnd,
  },

  // Confirm Button Styles
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.floating,
  },
  confirmBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  confirmBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    fontSize: 15,
  },

  // Checkout Status / Success layouts
  statusView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
    flex: 1,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(143, 67, 238, 0.15)',
    borderTopColor: COLORS.primaryStart,
    marginBottom: 20,
  },
  statusText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  statusSubtext: {
    ...TYPOGRAPHY.subtext,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  successCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.floating,
  },
  successTextTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successTextDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  confetti: {
    position: 'absolute',
    top: -20,
    zIndex: 999,
  },
});
