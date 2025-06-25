import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { initDatabase, getActiveGame } from '../services/database';
import { loadGameState } from '../services/gameService';

const MainMenuScreen = ({ navigation }) => {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initDatabase();
      
      // Check for active game
      const activeGame = await getActiveGame();
      const gameState = await loadGameState();
      
      if (activeGame && gameState) {
        Alert.alert(
          'Kontynuować grę?',
          'Znaleziono zapisaną grę. Czy chcesz ją kontynuować?',
          [
            {
              text: 'Nie',
              style: 'cancel',
            },
            {
              text: 'Tak',
              onPress: () => navigation.navigate('Game', { 
                resumeGame: true, 
                gameData: { activeGame, gameState } 
              }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const handleNewGame = () => {
    navigation.navigate('PlayerSelection');
  };

  const handleManagePlayers = () => {
    navigation.navigate('Players');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={dragonGradients.fire}
        style={globalStyles.container}
      >
      <View style={globalStyles.centered}>
        <View style={styles.titleContainer}>
          <Text style={styles.gameTitle}>🐉 SMOKI 🐉</Text>
          <Text style={styles.subtitle}>Gra Karciana</Text>
        </View>

        <View style={styles.menuContainer}>
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
