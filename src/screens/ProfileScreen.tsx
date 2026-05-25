import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  ChevronRight,
  User,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Sparkles,
  Plus,
} from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassCard } from '../components/GlassCard';
import { Avatar } from '../components/Avatar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import { useCoins } from '../context/CoinContext';

const { width } = Dimensions.get('window');

const PROFILE_IMAGE = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120';
const COVER_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';
const COVER_HEIGHT = 200;

interface ProfileStatProps {
  label: string;
  targetValue: number;
  delay: number;
  formatFn?: (val: number) => string;
}

const ProfileStat: React.FC<ProfileStatProps> = ({ label, targetValue, delay, formatFn }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1.0, { damping: 12, stiffness: 150 }));

    const startTimer = setTimeout(() => {
      let current = 0;
      const step = Math.ceil(targetValue / 25) || 1;
      const interval = setInterval(() => {
        current += step;
        if (current >= targetValue) {
          setDisplayValue(targetValue);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, 25);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [targetValue, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const valueStr = formatFn ? formatFn(displayValue) : displayValue.toLocaleString();

  return (
    <Animated.View style={[styles.statBox, animatedStyle]}>
      <Text style={styles.statValue}>{valueStr}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  index: number;
}

const MenuRow: React.FC<MenuRowProps> = ({ icon, label, onPress, index }) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(500 + index * 80, withSpring(0, { damping: 15, stiffness: 120 }));
    opacity.value = withDelay(500 + index * 80, withTiming(1, { duration: 400 }));
  }, []);

  const handlePressIn = () => {
    pressScale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const animatedRowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: pressScale.value }],
  }));

  return (
    <Animated.View style={animatedRowStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <GlassCard style={styles.menuItemCard}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIconWrapper}>{icon}</View>
            <Text style={styles.menuItemText}>{label}</Text>
          </View>
          <ChevronRight size={18} color={COLORS.textSecondary} />
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

export const ProfileScreen: React.FC = () => {
  const { balance, setIsStoreVisible } = useCoins();
  const [displayCoins, setDisplayCoins] = useState(0);

  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(40);
  const balanceOpacity = useSharedValue(0);
  const balanceTranslateY = useSharedValue(30);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 600 });
    heroTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.quad) });
    
    balanceOpacity.value = withDelay(300, withTiming(1, { duration: 550 }));
    balanceTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 130 }));
  }, []);

  useEffect(() => {
    let current = displayCoins;
    const target = balance;
    if (current === target) return;
    
    const diff = target - current;
    const step = Math.ceil(Math.abs(diff) / 10) * (diff > 0 ? 1 : -1);
    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
        setDisplayCoins(target);
        clearInterval(interval);
      } else {
        setDisplayCoins(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [balance]);

  const openStore = () => {
    setIsStoreVisible(true);
  };

  const animatedHeroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const animatedBalanceStyle = useAnimatedStyle(() => ({
    opacity: balanceOpacity.value,
    transform: [{ translateY: balanceTranslateY.value }],
  }));

  const animatedCoverStyle = useAnimatedStyle(() => {
    const scale = scrollY.value < 0 
      ? 1 - scrollY.value / (COVER_HEIGHT * 0.8) 
      : 1;

    const translateY = scrollY.value < 0
      ? 0
      : -scrollY.value * 0.45;

    return {
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <ScreenWrapper disableTopInset disableBottomInset>
        <Animated.View style={[styles.coverContainer, animatedCoverStyle]}>
          <Animated.Image
            source={{ uri: COVER_IMAGE }}
            style={styles.coverImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(250, 246, 251, 0.40)', COLORS.bgStart]}
            style={styles.coverOverlay}
          />
        </Animated.View>

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.coverSpacer} />

          <Animated.View style={[styles.heroWrapper, animatedHeroStyle]}>
            <GlassCard style={styles.heroCard}>
              <View style={styles.avatarWrapper}>
                <Avatar source={{ uri: PROFILE_IMAGE }} size="xl" />
                <View style={verifiedBadgeStyle(styles)}>
                  <Sparkles size={14} color={COLORS.white} />
                </View>
              </View>
              
              <Text style={styles.profileName}>Armaan</Text>
              <Text style={styles.profileUsername}>@armaan.offical</Text>
              
              <View style={styles.locationContainer}>
                <MapPin size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.locationText}>Mumbai, India</Text>
              </View>

              <Text style={styles.bioText}>
                Living life on my own terms. 🌟{'\n'}Entrepreneur | Fitness | Traveller
              </Text>

              <View style={styles.statsDivider} />
              <View style={styles.statsRow}>
                <ProfileStat label="Posts" targetValue={32} delay={350} />
                <ProfileStat
                  label="Followers"
                  targetValue={1200}
                  delay={420}
                  formatFn={(val) => val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toString()}
                />
                <ProfileStat label="Following" targetValue={180} delay={490} />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View style={[styles.balanceWrapper, animatedBalanceStyle]}>
            <Pressable onPress={openStore}>
              <GlassCard style={styles.balanceCard}>
                <View style={styles.balanceLeft}>
                  <LinearGradient
                    colors={['#FFE259', '#FFA751']}
                    style={styles.coinGraphic}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.balanceTextContainer}>
                    <Text style={styles.balanceLabel}>Coin Balance</Text>
                    <Text style={styles.balanceValue}>{displayCoins.toLocaleString()}</Text>
                  </View>
                </View>
                
                <View style={styles.addCoinsButton}>
                  <Plus size={16} color={COLORS.white} strokeWidth={3} />
                </View>
              </GlassCard>
            </Pressable>
          </Animated.View>

          <View style={styles.menuList}>
            <MenuRow
              icon={<User size={16} color={COLORS.primaryStart} />}
              label="Edit Profile"
              onPress={() => {}}
              index={0}
            />
            <MenuRow
              icon={<ImageIcon size={16} color={COLORS.primaryStart} />}
              label="My Photos"
              onPress={() => {}}
              index={1}
            />
            <MenuRow
              icon={<SettingsIcon size={16} color={COLORS.primaryStart} />}
              label="Account Settings"
              onPress={() => {}}
              index={2}
            />
          </View>
        </Animated.ScrollView>
      </ScreenWrapper>
    </View>
  );
};

// Helper to avoid TS check issues with combined arrays
const verifiedBadgeStyle = (s: any) => [s.verifiedBadge];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverContainer: {
    height: COVER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 100,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  coverSpacer: {
    height: COVER_HEIGHT - 65,
  },
  heroWrapper: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    zIndex: 2,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryStart,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.glass,
  },
  profileName: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  profileUsername: {
    ...TYPOGRAPHY.subtextBold,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: SPACING.md,
  },
  locationText: {
    ...TYPOGRAPHY.subtext,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bioText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
  statsDivider: {
    height: 1,
    width: '90%',
    backgroundColor: COLORS.glassBorder,
    marginVertical: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  statLabel: {
    ...TYPOGRAPHY.subtext,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  balanceWrapper: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    zIndex: 2,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinGraphic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    ...SHADOWS.glass,
  },
  balanceTextContainer: {
    marginLeft: SPACING.md,
  },
  balanceLabel: {
    ...TYPOGRAPHY.subtextBold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  addCoinsButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryStart,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.floating,
  },
  menuList: {
    paddingHorizontal: SPACING.xl,
    zIndex: 2,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(111, 26, 182, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
