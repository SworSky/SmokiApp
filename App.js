import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import MainMenuScreen from './src/screens/MainMenuScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import PlayerSelectionScreen from './src/screens/PlayerSelectionScreen';
import PlayerOrderScreen from './src/screens/PlayerOrderScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#FF6B35" />
      <Stack.Navigator 
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen 
          name="MainMenu" 
          component={MainMenuScreen} 
        />
        <Stack.Screen 
          name="Players" 
          component={PlayersScreen} 
        />
        <Stack.Screen 
          name="PlayerSelection" 
          component={PlayerSelectionScreen} 
        />
        <Stack.Screen 
          name="PlayerOrder" 
          component={PlayerOrderScreen} 
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
