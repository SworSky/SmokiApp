import React from 'react';
import { View, Text } from 'react-native';

export default function SimpleTest() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightblue' }}>
      <Text style={{ fontSize: 24, color: 'black' }}>
        SmokiApp Web Test - If you see this, React Native Web is working!
      </Text>
    </View>
  );
}
