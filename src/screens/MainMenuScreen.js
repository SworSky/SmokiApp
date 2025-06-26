import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { initDatabase, getActiveGame } from '../services/database';
import { loadGameState } from '../services/gameService';

const RainbowText = ({ text }) => {
  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
  
  return (
    <View style={{ flexDirection: 'row' }}>
      {text.split('').map((letter, index) => (
        <Text
          key={index}
          style={[
            styles.subtitle,
            { color: rainbowColors[index % rainbowColors.length] }
          ]}
        >
          {letter}
        </Text>
      ))}
    </View>
  );
};

const MainMenuScreen = ({ navigation }) => {
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [activeGameData, setActiveGameData] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Check for active game every time screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      checkForActiveGame();
    });

    return unsubscribe;
  }, [navigation]);

  const checkForActiveGame = async () => {
    try {
      const activeGame = await getActiveGame();
      const gameState = await loadGameState();
      
      console.log('Checking for active game:', { 
        hasActiveGame: !!activeGame, 
        hasGameState: !!gameState, 
        gameStateValue: gameState?.gameState,
        isCompleted: activeGame?.isCompleted 
      });
      
      // Only show continue button if:
      // 1. There's an active game in database (not completed)
      // 2. There's a game state in AsyncStorage 
      // 3. The game state is 'playing' (not 'ended')
      if (activeGame && !activeGame.isCompleted && gameState && gameState.gameState === 'playing') {
        setHasActiveGame(true);
        setActiveGameData({ activeGame, gameState });
        console.log('Active game found - showing continue button');
      } else {
        setHasActiveGame(false);
        setActiveGameData(null);
        console.log('No active game - hiding continue button');
      }
    } catch (error) {
      console.error('Error checking for active game:', error);
      setHasActiveGame(false);
      setActiveGameData(null);
    }
  };

  const initializeApp = async () => {
    try {
      await initDatabase();
      await checkForActiveGame();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const handleContinueGame = () => {
    if (activeGameData) {
      navigation.navigate('Game', { 
        resumeGame: true, 
        gameData: activeGameData 
      });
    }
  };

  const handleNewGame = () => {
    navigation.navigate('PlayerSelection');
  };

  const handleManagePlayers = () => {
    navigation.navigate('Players');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <LinearGradient
        colors={dragonGradients.fire}
        style={globalStyles.container}
      >
      <View style={globalStyles.centered}>
        <View style={styles.titleContainer}>
          <Text style={styles.gameTitle}>🐉 SMOKI 🐉</Text>
          <RainbowText text="by Maślak" />
        </View>

        <View style={styles.menuContainer}>
          {hasActiveGame && (
            <TouchableOpacity 
              style={[globalStyles.button, styles.menuButton, styles.continueButton]}
              onPress={handleContinueGame}
            >
              <LinearGradient
                colors={dragonGradients.fire}
                style={styles.buttonGradient}
              >
                <Text style={[globalStyles.buttonText, styles.buttonText]}>
                  ▶️ Kontynuuj Grę
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[globalStyles.button, styles.menuButton]}
            onPress={handleNewGame}
          >
            <LinearGradient
              colors={dragonGradients.gold}
              style={styles.buttonGradient}
            >
              <Text style={[globalStyles.buttonText, styles.buttonText]}>
                🎮 Nowa Gra
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, styles.menuButton]}
            onPress={handleManagePlayers}
          >
            <LinearGradient
              colors={dragonGradients.green}
              style={styles.buttonGradient}
            >
              <Text style={[globalStyles.buttonText, styles.buttonText]}>
                👥 Gracze
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.dragonContainer}>
          <Text style={styles.dragonEmoji}>🐲</Text>
        </View>
      </View>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    ...globalStyles.shadow,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 20,
    color: colors.text,
    marginTop: 10,
    fontWeight: '600',
  },
  menuContainer: {
    width: '80%',
    alignItems: 'center',
  },
  menuButton: {
    width: '100%',
    marginVertical: 15,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  continueButton: {
    marginBottom: 25,
    transform: [{ scale: 1.05 }],
    ...globalStyles.shadow,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  dragonContainer: {
    marginTop: 40,
  },
  dragonEmoji: {
    fontSize: 60,
    textAlign: 'center',
  },
};

export default MainMenuScreen;
