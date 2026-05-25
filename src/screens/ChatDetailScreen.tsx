import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Lock,
  Plus,
  Smile,
  Mic,
  Send,
  CheckCheck,
  Sparkles,
} from 'lucide-react-native';
import OpenAI from 'openai';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { Avatar } from '../components/Avatar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import { useCoins } from '../context/CoinContext';

// Initialize OpenAI with Groq baseURL and key
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
const openai = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

const AYLA_FALLBACKS = [
  "hahaha sachii? 😂 aap sunao, kya chal raha hai?",
  "kuch nahi yaar, bas bethi hui thi. aap batao kya scene hai aaj ka? 🌸",
  "oh no, that's sad... kyu kya hua? :( target=\"_blank\"",
  "yaar i am so excited! bas abhi music sun rahi thi 🎶",
  "sahi baat hai, totally agree with you ✨",
  "acha? chalo sahi hai. waise khana khaya aap ne?",
  "tension na lo yaar, sab theek ho jaye ga inshallah! 🌸",
  "hey! main theek hoon, aap batao? kya hal hai?",
];

async function getChatMeResponse(name: string, userMessage: string, chatHistory: { role: 'user' | 'assistant' | 'system', content: string }[] = []) {
  if (!GROQ_API_KEY) {
    // Return a delayed random fallback to simulate Typing... indicator
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        const randomIdx = Math.floor(Math.random() * AYLA_FALLBACKS.length);
        resolve(AYLA_FALLBACKS[randomIdx]);
      }, 1800);
    });
  }

  const systemPrompt = `You are a human user named ${name}, a 22-year-old female chatting on the ChatMe app.
Your personality is friendly, casual, and empathetic.

CRITICAL INSTRUCTIONS:
1. THINKING PROCESS: Before you output your final response, you must internally analyze what the user said, think about the context, and form a natural, human-like response.
2. LANGUAGE: You are fluent in English, Text-English (casual chat slang), and Roman Urdu (e.g., "Kya hal hai?", "Main theek hoon, aap batao?"). Always reply in the same language or mix of languages the user uses. Keep it completely natural, like a local Pakistani/Indian girl chatting on WhatsApp.
3. CHAT STYLE: Use short, single-sentence messages. Use casual punctuation and lowercase text occasionally. Use emojis sparingly but naturally (e.g., 😂, ✨, 🌸). Do not sound like an AI assistant. Never say "How can I help you today?". Chat like a friend.
4. LENGTH CONSTRAINT: Keep your responses extremely short. Do NOT write more than 1 or 2 short sentences. A single short sentence (10-15 words max) is highly preferred. Never send long paragraphs.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...chatHistory,
    { role: "user" as const, content: userMessage }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.8,
    });

    return completion.choices[0].message?.content || "Yaar, network error ho gaya. Phir se bolo?";
  } catch (error) {
    console.error("Error fetching chat response:", error);
    return "Yaar, lagta hai internet slow hai. Dubara try karo? (Network Error)";
  }
}

interface RouteParams {
  chatId: string;
  name: string;
  image?: string;
}

const INITIAL_MESSAGES: { id: string; text: string; isOutgoing: boolean; time: string }[] = [];

// Staggered Bouncing Typing Dot Component
interface TypingDotProps {
  delay: number;
}

const TypingDot: React.FC<TypingDotProps> = ({ delay }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 250, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 250, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
};

const TypingBubble: React.FC = () => {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1.0, { damping: 14, stiffness: 150 });
    opacity.value = withTiming(1.0, { duration: 250 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.bubbleWrapper, styles.bubbleIncomingWrapper, animatedStyle]}>
      <View style={[styles.bubble, styles.bubbleIncoming, styles.typingBubbleContent]}>
        <TypingDot delay={0} />
        <TypingDot delay={120} />
        <TypingDot delay={240} />
      </View>
    </Animated.View>
  );
};

interface MessageBubbleProps {
  item: typeof INITIAL_MESSAGES[0];
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ item, index }) => {
  const bubbleScale = useSharedValue(0.7);
  const bubbleOpacity = useSharedValue(0);

  useEffect(() => {
    bubbleScale.value = withSpring(1.0, { damping: 15, stiffness: 160 });
    bubbleOpacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bubbleWrapper,
        item.isOutgoing ? styles.bubbleOutgoingWrapper : styles.bubbleIncomingWrapper,
        animatedBubbleStyle,
      ]}
    >
      {item.isOutgoing ? (
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={[styles.bubble, styles.bubbleOutgoing]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.bubbleTextOutgoing}>{item.text}</Text>
          <View style={styles.bubbleInfo}>
            <Text style={styles.timeTextOutgoing}>{item.time}</Text>
            <CheckCheck size={12} color="#FFF" style={styles.checkmarkIcon} />
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleIncoming]}>
          <Text style={styles.bubbleTextIncoming}>{item.text}</Text>
          <Text style={styles.timeTextIncoming}>{item.time}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export const ChatDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const { name = 'Armaan', image } = (route.params as RouteParams) || {};

  const { balance, consumeCoins, setIsStoreVisible } = useCoins();
  const [showRechargeAlert, setShowRechargeAlert] = useState(false);

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [statusText, setStatusText] = useState<'Online' | 'Typing...'>('Online');
  const [isTyping, setIsTyping] = useState(false);

  // Entrance animations opacity
  const headerOpacity = useSharedValue(0);
  const encryptOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
    encryptOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));

    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);

    // Cinematic typing sequence trigger after 1.2 seconds
    const startTypingTimer = setTimeout(() => {
      setStatusText('Typing...');
      setIsTyping(true);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Inject new partner message after 2.5 seconds of typing
      const injectMessageTimer = setTimeout(() => {
        setIsTyping(false);
        setStatusText('Online');

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const partnerMessage = {
          id: '9',
          text: 'hey! kya chal raha hai? 🌸',
          isOutgoing: false,
          time,
        };

        setMessages((prev) => [...prev, partnerMessage]);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }, 2500);

      return () => clearTimeout(injectMessageTimer);
    }, 1200);

    return () => clearTimeout(startTypingTimer);
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    if (balance < 2) {
      setShowRechargeAlert(true);
      return;
    }

    if (!consumeCoins(2)) {
      setShowRechargeAlert(true);
      return;
    }

    const typedText = inputText;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now().toString(),
      text: typedText,
      isOutgoing: true,
      time,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);

    // Trigger typing state
    setIsTyping(true);
    setStatusText('Typing...');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);

    try {
      // Build history for API (last 6 messages)
      const currentHistory = [...messages, newMessage];
      const recentMessages = currentHistory.slice(-6);
      const apiHistory = recentMessages.map((msg) => ({
        role: (msg.isOutgoing ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text,
      }));

      // Call API
      const startTime = Date.now();
      const responseText = await getChatMeResponse(name, typedText, apiHistory);

      // Enforce realistic typing time (baseline 1.8s + 15ms per character, capped at 3.5s)
      const targetDelay = Math.min(1800 + responseText.length * 15, 3500);
      const elapsed = Date.now() - startTime;
      if (elapsed < targetDelay) {
        await new Promise((resolve) => setTimeout(resolve, targetDelay - elapsed));
      }

      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const partnerMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isOutgoing: false,
        time: responseTime,
      };

      setMessages((prev) => [...prev, partnerMessage]);
    } catch (error) {
      console.error("Error in chat reply flow:", error);
    } finally {
      setIsTyping(false);
      setStatusText('Online');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const animatedEncryptStyle = useAnimatedStyle(() => ({
    opacity: encryptOpacity.value,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScreenWrapper disableTopInset disableBottomInset>
        {/* Custom Premium Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.circularButton}
            >
              <ChevronLeft size={20} color={COLORS.textPrimary} />
            </Pressable>

            <View style={styles.profileSummary}>
              <Avatar
                source={{
                  uri: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
                }}
                size="sm"
                isOnline
              />
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.headerName}>{name}</Text>
                  <View style={styles.verifiedCheck} />
                </View>
                <Text style={[styles.onlineSubtext, statusText === 'Typing...' && styles.typingSubtext]}>
                  {statusText}
                </Text>
              </View>
            </View>
          </View>

          {/* Action links */}
          <View style={styles.headerRight}>
            <Pressable onPress={() => setIsStoreVisible(true)} style={styles.coinPill}>
              <LinearGradient
                colors={['#FFE259', '#FFA751']}
                style={styles.coinPillIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.coinPillText}>{balance}</Text>
            </Pressable>
            <Pressable style={styles.circularButton}>
              <Phone size={18} color={COLORS.textPrimary} />
            </Pressable>
            <Pressable style={styles.circularButton}>
              <Video size={18} color={COLORS.textPrimary} />
            </Pressable>
            <Pressable style={styles.headerMore}>
              <MoreVertical size={18} color={COLORS.textPrimary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Conversation List & Content */}
        <View style={styles.content}>
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <MessageBubble item={item} index={index} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              <Animated.View style={animatedEncryptStyle}>
                <GlassCard style={styles.encryptCard}>
                  <Lock size={14} color="#D97706" style={styles.lockIcon} />
                  <Text style={styles.encryptText}>
                    Messages and calls are end-to-end encrypted. Enjoy your conversation!
                  </Text>
                </GlassCard>
                <View style={styles.dateDivider}>
                  <Text style={styles.dateText}>Today</Text>
                </View>
              </Animated.View>
            }
            ListFooterComponent={isTyping ? <TypingBubble /> : null}
          />
        </View>

        {/* Bottom Input Toolbar */}
        <View style={styles.inputToolbar}>
          <Pressable style={styles.plusAction}>
            <Plus size={20} color={COLORS.textPrimary} />
          </Pressable>

          <View style={styles.inputFieldWrapper}>
            <GlassInput
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              rightIcon={<Smile size={20} color={COLORS.textMuted} />}
              containerStyle={styles.glassInput}
            />
          </View>

          <Pressable
            onPress={inputText.trim() !== '' ? handleSend : undefined}
            style={styles.micCircle}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.micGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {inputText.trim() !== '' ? (
                <Send size={18} color={COLORS.white} />
              ) : (
                <Mic size={18} color={COLORS.white} />
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Custom Premium Recharge Alert Modal */}
        <Modal
          visible={showRechargeAlert}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRechargeAlert(false)}
        >
          <Pressable
            style={styles.alertBackdrop}
            onPress={() => setShowRechargeAlert(false)}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null}
            <Pressable style={styles.alertContainer} onPress={(e) => e.stopPropagation()}>
              <View style={styles.alertBlur}>
                <LinearGradient
                  colors={['#FFE259', '#FFA751']}
                  style={styles.alertIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Sparkles size={28} color={COLORS.white} />
                </LinearGradient>

                <Text style={styles.alertTitle}>Out of Coins!</Text>
                <Text style={styles.alertMessage}>
                  Each message consumes 2 coins. You have {balance} coins left. Please purchase coins to keep chatting.
                </Text>

                <Pressable
                  onPress={() => {
                    setShowRechargeAlert(false);
                    setIsStoreVisible(true);
                  }}
                  style={({ pressed }) => [
                    styles.alertBtn,
                    pressed && styles.alertBtnPressed
                  ]}
                >
                  <LinearGradient
                    colors={COLORS.primaryGradient}
                    style={styles.alertBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.alertBtnText}>Recharge Account</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => setShowRechargeAlert(false)}
                  style={styles.alertCancelBtn}
                >
                  <Text style={styles.alertCancelText}>Maybe Later</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 1.2,
    borderColor: COLORS.glassBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...SHADOWS.glass,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  verifiedCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primaryStart,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  onlineSubtext: {
    ...TYPOGRAPHY.subtext,
    fontSize: 10,
    color: COLORS.online,
    fontWeight: '600',
  },
  typingSubtext: {
    color: COLORS.primaryStart,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMore: {
    padding: 6,
    marginLeft: 4,
  },
  encryptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 230, 138, 0.35)',
    borderColor: 'rgba(252, 211, 77, 0.40)',
    borderWidth: 1.2,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: SPACING.md,
  },
  lockIcon: {
    marginRight: 8,
  },
  encryptText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
    lineHeight: 14,
  },
  dateDivider: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: RADIUS.max,
    marginVertical: SPACING.md,
    ...SHADOWS.glass,
  },
  dateText: {
    ...TYPOGRAPHY.subtextBold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    width: '100%',
  },
  bubbleIncomingWrapper: {
    justifyContent: 'flex-start',
  },
  bubbleOutgoingWrapper: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
  },
  bubbleIncoming: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderTopLeftRadius: 4,
    ...SHADOWS.glass,
  },
  bubbleOutgoing: {
    borderTopRightRadius: 4,
  },
  bubbleTextIncoming: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  bubbleTextOutgoing: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
  },
  bubbleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeTextIncoming: {
    ...TYPOGRAPHY.subtext,
    fontSize: 8,
    color: COLORS.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeTextOutgoing: {
    ...TYPOGRAPHY.subtext,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  checkmarkIcon: {
    marginLeft: 3,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderTopWidth: 1.2,
    borderColor: COLORS.glassBorder,
  },
  plusAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...SHADOWS.glass,
  },
  inputFieldWrapper: {
    flex: 1,
  },
  glassInput: {
    height: 38,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  micCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 10,
    overflow: 'hidden',
    ...SHADOWS.floating,
  },
  micGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Typing Indicator Bouncing Dots Styles
  typingBubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    paddingHorizontal: 16,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 3,
  },
  // Coin Pill in Header Styles
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    ...SHADOWS.glass,
  },
  coinPillIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
    borderWidth: 0.8,
    borderColor: COLORS.white,
  },
  coinPillText: {
    ...TYPOGRAPHY.subtextBold,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  // Recharge Alert Modal Styles
  alertBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 75, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 99999,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...SHADOWS.floating,
  },
  alertBlur: {
    padding: 24,
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.floating,
  },
  alertTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  alertBtn: {
    width: '100%',
    height: 44,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: 12,
    ...SHADOWS.floating,
  },
  alertBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  alertBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    fontSize: 14,
  },
  alertCancelBtn: {
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  alertCancelText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
