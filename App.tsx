import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SplashScreen } from './src/screens/SplashScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CoinProvider } from './src/context/CoinContext';
import { CoinStoreModal } from './src/components/CoinStoreModal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <CoinProvider>
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        )}
        <CoinStoreModal />
      </CoinProvider>
    </SafeAreaProvider>
  );
}
