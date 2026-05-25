import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {
  Heart,
  MessageSquare,
  UserPlus,
  Smile,
  Coins,
  SlidersHorizontal,
} from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Avatar } from '../components/Avatar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

const NOTIFICATIONS = [
  { id: '1', name: 'Riya Sharma', detail: 'Liked your profile', type: 'like', time: '2m ago', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' },
  { id: '2', name: 'Neha Singh', detail: 'Sent you a message', type: 'message', time: '5m ago', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=120' },
  { id: '3', name: 'Pooja Mehta', detail: 'Liked your photo', type: 'like', time: '12m ago', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=120' },
  { id: '4', name: 'Armaan', detail: 'Started following you', type: 'follow', time: '20m ago', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' },
  { id: '5', name: 'Sneha Iyer', detail: 'Reacted to your story', type: 'story', time: '30m ago', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=120' },
  { id: '6', name: 'Kriti Verma', detail: 'Sent you a message', type: 'message', time: '2h ago', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120' },
  { id: '7', name: 'System', detail: 'Received 100 free daily check-in coins!', type: 'coins', time: '1d ago', image: '' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getTypeColor = (type: string) => {
  switch (type) {
    case 'like': return COLORS.accentStart;
    case 'message': return COLORS.primaryStart;
    case 'follow': return '#3B82F6'; // Blue follow
    case 'coins': return '#EAB308'; // Amber coins
    default: return '#F59E0B';
  }
};

const NotificationIcon = ({ type, size = 14 }: { type: string, size?: number }) => {
  const color = getTypeColor(type);
  switch (type) {
    case 'like': return <Heart size={size} color={color} fill={color} />;
    case 'message': return <MessageSquare size={size} color={color} fill={color} />;
    case 'follow': return <UserPlus size={size} color={color} />;
    case 'coins': return <Coins size={size} color={color} fill={color} />;
    default: return <Smile size={size} color={color} />;
  }
};

interface NotificationRowProps {
  item: typeof NOTIFICATIONS[0];
  index: number;
}

const NotificationRow: React.FC<NotificationRowProps> = ({ item, index }) => {
  // Staggered slide in animation values
  const rowTranslateX = useSharedValue(40);
  const rowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rowTranslateX.value = withDelay(index * 50, withSpring(0, { damping: 16, stiffness: 130 }));
    rowOpacity.value = withDelay(index * 50, withTiming(1, { duration: 350 }));
  }, []);

  const animatedRowStyle = useAnimatedStyle(() => ({
    opacity: rowOpacity.value,
    transform: [
      { translateX: rowTranslateX.value },
      { scale: scale.value }
    ],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1.0, { damping: 12, stiffness: 150 });
  };

  const isSystem = item.type === 'coins' || !item.image;

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.notificationCard, animatedRowStyle]}
    >
      <View style={styles.cardLeft}>
        {isSystem ? (
          <View style={[styles.systemIconContainer, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
            <NotificationIcon type={item.type} size={20} />
          </View>
        ) : (
          <Avatar source={{ uri: item.image }} size="sm" isOnline={false} />
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.messageText}>
            {!isSystem && <Text style={styles.nameText}>{item.name} </Text>}
            {item.detail}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>

      <View style={[styles.iconBadge, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
        <NotificationIcon type={item.type} size={14} />
      </View>
    </AnimatedPressable>
  );
};

export const NotificationsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Messages' | 'Likes' | 'Coins'>('All');
  const [filteredNotifications, setFilteredNotifications] = useState(NOTIFICATIONS);

  const listOpacity = useSharedValue(0);

  useEffect(() => {
    listOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  useEffect(() => {
    let result = NOTIFICATIONS;

    if (activeFilter === 'Messages') {
      result = result.filter(n => n.type === 'message');
    } else if (activeFilter === 'Likes') {
      result = result.filter(n => n.type === 'like');
    } else if (activeFilter === 'Coins') {
      result = result.filter(n => n.type === 'coins');
    }

    setFilteredNotifications(result);
  }, [activeFilter]);

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  return (
    <ScreenWrapper disableBottomInset>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.headerFilter}>
          <SlidersHorizontal size={18} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* Segmented Category Filter Pills */}
      <View style={styles.tabsWrapper}>
        {(['All', 'Messages', 'Likes', 'Coins'] as const).map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.tabPill,
                isSelected ? styles.tabPillActive : styles.tabPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Scrollable feed list */}
      <Animated.View style={[styles.listContainer, animatedListStyle]}>
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <NotificationRow item={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={TYPOGRAPHY.body}>No notifications found.</Text>
            </View>
          }
        />
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    color: COLORS.textPrimary,
  },
  headerFilter: {
    padding: 6,
  },
  tabsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    justifyContent: 'flex-start',
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.max,
    marginRight: SPACING.xs,
    borderWidth: 1.5,
  },
  tabPillActive: {
    backgroundColor: COLORS.primaryStart,
    borderColor: COLORS.primaryStart,
  },
  tabPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: COLORS.glassBorder,
  },
  tabText: {
    ...TYPOGRAPHY.subtextBold,
    fontSize: 12,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabTextInactive: {
    color: COLORS.textSecondary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 110, // offsets CustomTabBar
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#9A80B9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: SPACING.sm,
  },
  systemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  timeText: {
    ...TYPOGRAPHY.subtext,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
});
