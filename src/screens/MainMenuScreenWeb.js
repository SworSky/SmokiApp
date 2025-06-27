import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { initDatabase, getActiveGame } from '../services/dbInterface';

const MainMenuScreenWeb = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [activeGameData, setActiveGameData] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Check for active game every time screen comes into focus
    const focusHandler = () => {
      checkForActiveGame();
    };

    // For web, we can use visibility change or just call it when component updates
    focusHandler();
    
    // Set up interval to check periodically (optional)
    const interval = setInterval(checkForActiveGame, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      await initDatabase();
      console.log('Database initialized successfully');
      await checkForActiveGame();
      console.log('Active game check completed');
    } catch (error) {
      console.error('Error initializing app:', error);
      // Don't block the UI, just log the error
    } finally {
      setIsLoading(false);
    }
  };

  const checkForActiveGame = async () => {
    try {
      const activeGame = await getActiveGame();
      if (activeGame) {
        setHasActiveGame(true);
        setActiveGameData(activeGame);
      } else {
        setHasActiveGame(false);
        setActiveGameData(null);
      }
    } catch (error) {
      console.error('Error checking for active game:', error);
      setHasActiveGame(false);
      setActiveGameData(null);
    }
  };

  const resumeGame = () => {
    if (activeGameData) {
      const gameData = {
        id: activeGameData.id,
        players: activeGameData.players, // This should already have the scores and rounds
        currentRound: activeGameData.currentState.currentRound || 1
      };
      navigation.navigate('Game', { gameData, resumeGame: true });
    }
  };

  if (isLoading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.primary }]}>
        <Text style={{ fontSize: 24, color: 'white' }}>
          🐉 Ładowanie Smoki...
        </Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, globalStyles.centered, { backgroundColor: colors.primary }]}>
      <Text style={{ 
        fontSize: 48, 
        fontWeight: 'bold', 
        color: 'white', 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        🐉 SMOKI
      </Text>
      
      <Text style={{ 
        fontSize: 18, 
        color: 'white', 
        marginBottom: 40,
        textAlign: 'center'
      }}>
        by Maślak
      </Text>

      {hasActiveGame && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.success,
            padding: 15,
            borderRadius: 10,
            marginVertical: 10,
            minWidth: 200,
            alignItems: 'center'
          }}
          onPress={resumeGame}
        >
          <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>
            ▶️ Kontynuuj grę
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 10,
          marginVertical: 10,
          minWidth: 200,
          alignItems: 'center'
        }}
        onPress={() => {
          navigation.navigate('Players');
        }}
      >
        <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold' }}>
          👥 Gracze
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 10,
          marginVertical: 10,
          minWidth: 200,
          alignItems: 'center'
        }}
        onPress={() => {
          navigation.navigate('PlayerSelection');
        }}
      >
        <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold' }}>
          🎮 Nowa Gra
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MainMenuScreenWeb;
