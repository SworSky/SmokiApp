import React, { useState } from 'react';
import { Platform } from 'react-native';
import MainMenuScreenWeb from './src/screens/MainMenuScreenWeb';
import PlayersScreenWeb from './src/screens/PlayersScreenWeb';
import PlayerSelectionScreenWeb from './src/screens/PlayerSelectionScreenWeb';
import PlayerOrderScreenWeb from './src/screens/PlayerOrderScreenWeb';
import GameScreenWeb from './src/screens/GameScreenWeb';

// Simple state-based navigation for web
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('MainMenu');
  const [screenParams, setScreenParams] = useState({});
  
  console.log('App component rendering on:', Platform.OS, 'Current screen:', currentScreen);
  
  // Simple navigation object
  const navigation = {
    navigate: (screenName, params = {}) => {
      console.log('Navigate to:', screenName, 'with params:', params);
      setCurrentScreen(screenName);
      setScreenParams(params);
    },
    goBack: () => {
      console.log('Go back');
      setCurrentScreen('MainMenu');
      setScreenParams({});
    }
  };
  
  // Screen routing
  switch (currentScreen) {
    case 'Players':
      return <PlayersScreenWeb navigation={navigation} />;
    case 'PlayerSelection':
      return <PlayerSelectionScreenWeb navigation={navigation} route={{ params: screenParams }} />;
    case 'PlayerOrder':
      return <PlayerOrderScreenWeb navigation={navigation} route={{ params: screenParams }} />;
    case 'Game':
      return <GameScreenWeb navigation={navigation} route={{ params: screenParams }} />;
    case 'MainMenu':
    default:
      return <MainMenuScreenWeb navigation={navigation} />;
  }
}
