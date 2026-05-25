import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Dimensions, Platform, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Home, MessageSquare, Bell, User } from 'lucide-react-native';
import { COLORS, SHADOWS, RADIUS } from '../theme';

const { width } = Dimensions.get('window');
const TAB_BAR_MARGIN = 20;
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN * 2;
const TAB_COUNT = 4;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

const ICONS = {
  Home: Home,
  Messages: MessageSquare,
  Notifications: Bell,
  Profile: User,
};

const BADGES: Record<string, number> = {
  Messages: 2,
  Notifications: 3,
};

interface TabItemProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ name, isFocused, onPress, onLongPress }) => {
  const IconComponent = ICONS[name as keyof typeof ICONS] || Home;

  // Cinematic scale spring transition
  const scale = useSharedValue(isFocused ? 1.2 : 0.95);
  const iconOpacity = useSharedValue(isFocused ? 1.0 : 0.7);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.2 : 0.95, {
      damping: 14,
      stiffness: 140,
    });
    iconOpacity.value = withSpring(isFocused ? 1.0 : 0.7, {
      damping: 15,
      stiffness: 120,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: iconOpacity.value,
  }));

  const badgeCount = BADGES[name];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
        <IconComponent
          size={22}
          color={isFocused ? COLORS.primaryStart : COLORS.textSecondary}
          strokeWidth={isFocused ? 2.3 : 1.8}
        />
        
        {badgeCount && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  // Sliding capsule indicator position
  const indicatorTranslateX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    indicatorTranslateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 18,
      stiffness: 110, // Smooth luxury sliding physics
    });
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorTranslateX.value }],
  }));

  const renderTabBar = () => (
    <View style={styles.content}>
      {/* Sliding background capsule pill */}
      <Animated.View style={[styles.slidingIndicator, animatedIndicatorStyle]} />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let displayName = route.name;
        if (route.name === 'Dashboard') displayName = 'Home';

        return (
          <TabItem
            key={route.key}
            name={displayName}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={30} tint="light" style={[styles.container, SHADOWS.glass]}>
        {renderTabBar()}
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, styles.androidBg, SHADOWS.glass]}>
      {renderTabBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: TAB_BAR_MARGIN,
    right: TAB_BAR_MARGIN,
    height: 70,
    borderRadius: RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  androidBg: {
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    width: TAB_BAR_WIDTH,
    height: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  tabItem: {
    width: TAB_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 48,
    width: 48,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 13,
    left: 6,
    width: TAB_WIDTH - 12,
    height: 44,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(143, 67, 238, 0.10)',
    borderColor: 'rgba(143, 67, 238, 0.16)',
    borderWidth: 1,
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.unreadBadge,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 11,
  },
});
