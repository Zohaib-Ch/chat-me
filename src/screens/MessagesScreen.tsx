import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassInput } from '../components/GlassInput';
import { Avatar } from '../components/Avatar';
import { RootStackParamList } from '../navigation/RootNavigator';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

const CHATS = [
  { id: '1', name: 'Ayesha Khan', message: 'Suno, kya chal raha hai?', time: '9:41 PM', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', unread: 1, isOnline: true, isFavorite: true },
  { id: '2', name: 'Zainab Malik', message: 'Kaise ho yaar?', time: '9:30 PM', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', unread: 2, isOnline: true, isFavorite: false },
  { id: '3', name: 'Fatima Bukhari', message: 'Bas abhi music sun rahi thi 🎶', time: '8:15 PM', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=120', unread: 0, isOnline: false, isFavorite: true },
  { id: '4', name: 'Hania Amir', message: 'Khana khaya aap ne? 🌸', time: '7:45 PM', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=120', unread: 0, isOnline: true, isFavorite: false },
  { id: '5', name: 'Laiba Tariq', message: 'Hahaha sachii? 😂', time: '6:20 PM', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=120', unread: 0, isOnline: false, isFavorite: false },
  { id: '6', name: 'Meerub Abbasi', message: 'Sab theek ho jaye ga inshallah!', time: '5:10 PM', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120', unread: 0, isOnline: false, isFavorite: false },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChatRowProps {
  item: typeof CHATS[0];
  index: number;
  onPress: () => void;
}

const ChatRow: React.FC<ChatRowProps> = ({ item, index, onPress }) => {
  const scale = useSharedValue(1);

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, { damping: 12, stiffness: 200 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1.0, { damping: 12, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.chatCard, animatedRowStyle]}
    >
      <Avatar source={{ uri: item.image }} size="md" isOnline={item.isOnline} />
      
      <View style={styles.cardCenter}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.messageText} numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.timeText}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
};

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Favorites'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(CHATS);

  // Entrance animations opacity
  const listOpacity = useSharedValue(0);

  useEffect(() => {
    listOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    let result = CHATS;

    // Filter by tab
    if (activeTab === 'Unread') {
      result = result.filter(c => c.unread > 0);
    } else if (activeTab === 'Favorites') {
      result = result.filter(c => c.isFavorite);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChats(result);
  }, [activeTab, searchQuery]);

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  const renderChatItem = ({ item, index }: { item: typeof CHATS[0], index: number }) => {
    return (
      <ChatRow
        item={item}
        index={index}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, name: item.name, image: item.image })}
      />
    );
  };

  return (
    <ScreenWrapper disableBottomInset>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <GlassInput
          placeholder="Search messages"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={18} color={COLORS.textMuted} />}
          rightIcon={<SlidersHorizontal size={18} color={COLORS.primaryStart} />}
        />
      </View>

      {/* Segmented Filter Pills */}
      <View style={styles.tabsWrapper}>
        {(['All', 'Unread', 'Favorites'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          
          // Badge indicator count for unread
          const displayLabel = tab === 'Unread' ? `Unread (${CHATS.filter(c => c.unread > 0).length})` : tab;

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
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
                {displayLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Scrollable chat listings */}
      <Animated.View style={[styles.listContainer, animatedListStyle]}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={TYPOGRAPHY.body}>No conversations found.</Text>
            </View>
          }
        />
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    color: COLORS.textPrimary,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  tabsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    justifyContent: 'flex-start',
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.max,
    marginRight: SPACING.sm,
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
    fontSize: 13,
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
    paddingBottom: 110, // accounts for CustomTabBar space
  },
  chatCard: {
    flexDirection: 'row',
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
  cardCenter: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  messageText: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: {
    ...TYPOGRAPHY.subtext,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primaryStart,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
});
