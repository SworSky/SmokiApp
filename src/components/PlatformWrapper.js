import React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function PlatformWrapper({ children }) {
  if (Platform.OS === 'web') {
    // For web, use simple View wrapper
    return (
      <View style={{ flex: 1 }}>
        {children}
      </View>
    );
  } else {
    // For native, use the full setup
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {children}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
}
