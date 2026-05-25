import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  disableTopInset?: boolean;
  disableBottomInset?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  disableTopInset = false,
  disableBottomInset = false,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    paddingTop: disableTopInset ? 0 : insets.top,
    paddingBottom: disableBottomInset ? 0 : insets.bottom,
  };

  return (
    <LinearGradient
      colors={[COLORS.bgStart, COLORS.bgEnd]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {scrollable ? (
        <ScrollView
          style={[styles.scrollView, style]}
          contentContainerStyle={[
            { paddingBottom: insets.bottom + 20 },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingTop: disableTopInset ? 0 : insets.top }}>
            {children}
          </View>
        </ScrollView>
      ) : (
        <View style={[containerStyle, styles.container, style]}>
          {children}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
