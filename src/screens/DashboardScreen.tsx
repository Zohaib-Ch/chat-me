import React, { useEffect, useState } from 'react';
import { useCoins } from '../context/CoinContext';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  withSpring,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus, Heart, Sparkles, X, Check, CreditCard, ShieldCheck } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { Avatar } from '../components/Avatar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

// Data Constants
const USER_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120';

const TOP_PROFILES = [
  { id: '1', name: 'Ayesha', location: 'Lahore', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', isOnline: true },
  { id: '2', name: 'Zainab', location: 'Karachi', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', isOnline: true },
  { id: '3', name: 'Fatima', location: 'Islamabad', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120', isOnline: true },
  { id: '4', name: 'Mahnoor', location: 'Peshawar', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', isOnline: true },
  { id: '5', name: 'Laiba', location: 'Faisalabad', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=120', isOnline: true },
];

const POPULAR_NOW = [
  { id: '1', name: 'Hania Amir', message: 'Kaise ho yaar? 🌸', time: '2m ago', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=120', liked: true },
  { id: '2', name: 'Zainab Malik', message: 'Suno, kya chal raha hai?', time: '5m ago', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', liked: false, badge: 3 },
  { id: '3', name: 'Fatima Bukhari', message: 'Bas abhi free hui thi ✨', time: '12m ago', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=120', liked: false },
  { id: '4', name: 'Ayesha Khan', message: 'Khana khaya aap ne?', time: '20m ago', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120', liked: false, badge: 1 },
];

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

// SVG styled coin graphics
const CoinGraphic: React.FC = () => (
  <LinearGradient
    colors={['#FFE259', '#FFA751']}
    style={styles.coinCircle}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.coinInnerBorder}>
      <Text style={styles.coinText}>$</Text>
    </View>
  </LinearGradient>
);

const CoinStack: React.FC = () => {
  const floatOffset = useSharedValue(0);

  useEffect(() => {
    floatOffset.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatOffset.value }],
  }));

  return (
    <Animated.View style={[styles.coinStackContainer, animatedStyle]}>
      <View style={styles.coinGlow} />
      <View style={[styles.coinLayer, { top: 20, left: 10, transform: [{ scale: 0.95 }, { rotate: '-10deg' }] }]}>
        <CoinGraphic />
      </View>
      <View style={[styles.coinLayer, { top: 10, left: 25, transform: [{ scale: 0.90 }, { rotate: '15deg' }] }]}>
        <CoinGraphic />
      </View>
      <View style={[styles.coinLayer, { top: 25, left: 35, transform: [{ scale: 1.05 }, { rotate: '5deg' }] }]}>
        <CoinGraphic />
      </View>
    </Animated.View>
  );
};

export const DashboardScreen: React.FC = () => {
  const { balance, setIsStoreVisible } = useCoins();

  // Staggered reveals
  const headerOpacity = useSharedValue(0);
  const bannerTranslateY = useSharedValue(30);
  const bannerOpacity = useSharedValue(0);
  const topProfilesTranslateX = useSharedValue(50);
  const topProfilesOpacity = useSharedValue(0);
  const popularOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered load sequences
    headerOpacity.value = withTiming(1, { duration: 550 });
    bannerTranslateY.value = withTiming(0, { duration: 750, easing: Easing.out(Easing.quad) });
    bannerOpacity.value = withTiming(1, { duration: 650 });

    topProfilesTranslateX.value = withDelay(180, withTiming(0, { duration: 650, easing: Easing.out(Easing.quad) }));
    topProfilesOpacity.value = withDelay(180, withTiming(1, { duration: 550 }));

    popularOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

  const openStore = () => {
    setIsStoreVisible(true);
  };

  // Reanimated style definitions
  const animatedHeader = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const animatedBanner = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: bannerTranslateY.value }],
  }));
  const animatedTopProfiles = useAnimatedStyle(() => ({
    opacity: topProfilesOpacity.value,
    transform: [{ translateX: topProfilesTranslateX.value }],
  }));
  const animatedPopular = useAnimatedStyle(() => ({ opacity: popularOpacity.value }));

  return (
    <View style={styles.container}>
      <ScreenWrapper scrollable contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 1. Greeting header */}
        <Animated.View style={[styles.header, animatedHeader]}>
          <View style={styles.headerLeft}>
            <Avatar source={{ uri: USER_AVATAR }} size="sm" />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hi, Armaan! 👋</Text>
              <Text style={styles.titleText}>Dashboard</Text>
            </View>
          </View>

          {/* Frosted interactive coin badge */}
          <Pressable onPress={openStore}>
            <GlassCard style={styles.coinBadgeContainer}>
              <LinearGradient
                colors={['#FFE259', '#FFA751']}
                style={styles.headerCoin}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.coinTextCount}>{balance.toLocaleString()}</Text>
              <View style={styles.plusButton}>
                <Plus size={12} color={COLORS.white} strokeWidth={3} />
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* 2. Premium promotional banner */}
        <Animated.View style={[styles.bannerWrapper, animatedBanner]}>
          <GlassCard style={styles.bannerCard}>
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerTextContainer}>
                  <View style={styles.premiumTag}>
                    <Sparkles size={12} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.premiumTagText}>PREMIUM ACCESS</Text>
                  </View>
                  <Text style={styles.bannerTitle}>Get More Coins</Text>
                  <Text style={styles.bannerSubtitle}>&amp; Unlock Premium Features</Text>
                  
                  <GradientButton
                    title="Buy Coins"
                    variant="glass"
                    style={styles.buyButton}
                    textStyle={styles.buyButtonText}
                    onPress={openStore}
                  />
                </View>
                <CoinStack />
              </View>
            </LinearGradient>
          </GlassCard>
        </Animated.View>

        {/* 3. Top Profiles horizontal list */}
        <Animated.View style={[styles.sectionContainer, animatedTopProfiles]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Profiles</Text>
            <Pressable>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {TOP_PROFILES.map((profile) => (
              <View key={profile.id} style={styles.profileItem}>
                <Avatar
                  source={{ uri: profile.image }}
                  size="md"
                  isOnline={profile.isOnline}
                  hasGradientBorder
                />
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile.name}
                </Text>
                <Text style={styles.profileLocation}>{profile.location}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* 4. Popular Now Vertical feed */}
        <Animated.View style={[styles.sectionContainer, animatedPopular]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Now</Text>
          </View>

          <View style={styles.verticalList}>
            {POPULAR_NOW.map((item) => (
              <GlassCard key={item.id} style={styles.popularCard}>
                <View style={styles.cardContent}>
                  <Avatar source={{ uri: item.image }} size="md" isOnline />
                  <View style={styles.cardCenter}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardMessage} numberOfLines={1}>
                      {item.message}
                    </Text>
                  </View>
                  
                  <View style={styles.cardRight}>
                    <Text style={styles.cardTime}>{item.time}</Text>
                    {item.badge ? (
                      <View style={styles.badgeIndicator}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    ) : (
                      <Pressable style={styles.heartButton}>
                        <Heart
                          size={16}
                          color={item.liked ? COLORS.accentStart : COLORS.textMuted}
                          fill={item.liked ? COLORS.accentStart : 'transparent'}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        </Animated.View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: SPACING.md,
  },
  greetingText: {
    ...TYPOGRAPHY.subtextBold,
    color: COLORS.textSecondary,
  },
  titleText: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  coinBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.max,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  headerCoin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  coinTextCount: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  plusButton: {
    backgroundColor: COLORS.primaryStart,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    ...SHADOWS.glass,
  },
  bannerWrapper: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  bannerCard: {
    padding: 0,
    borderRadius: RADIUS.xl,
    borderWidth: 0,
  },
  bannerGradient: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 140,
  },
  bannerTextContainer: {
    flex: 1.2,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  premiumTagText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontSize: 22,
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.subtext,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginBottom: SPACING.lg,
  },
  buyButton: {
    height: 38,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  buyButtonText: {
    fontSize: 13,
    color: COLORS.white,
  },
  coinStackContainer: {
    flex: 0.8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coinGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFE259',
    opacity: 0.25,
    filter: 'blur(15px)',
    zIndex: 1,
  },
  coinLayer: {
    position: 'absolute',
    zIndex: 2,
  },
  coinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    ...SHADOWS.glass,
  },
  coinInnerBorder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionContainer: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    ...TYPOGRAPHY.subtextBold,
    color: COLORS.primaryStart,
  },
  horizontalScrollContent: {
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.sm,
  },
  profileItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 72,
  },
  profileName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  profileLocation: {
    ...TYPOGRAPHY.subtext,
    fontSize: 10,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  verticalList: {
    paddingHorizontal: SPACING.xl,
  },
  popularCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCenter: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  cardMessage: {
    ...TYPOGRAPHY.subtext,
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardTime: {
    ...TYPOGRAPHY.subtext,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  heartButton: {
    padding: 4,
  },
  badgeIndicator: {
    backgroundColor: COLORS.primaryStart,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },

  // Coin Store Bottom Sheet Modal Styles
  storeModalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 27, 75, 0.40)',
    zIndex: 999,
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
    zIndex: 9999,
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
  payButton: {
    width: '100%',
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
