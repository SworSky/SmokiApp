import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList,
  TouchableOpacity, 
  Alert,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { shuffleArray } from '../services/gameService';

const PlayerOrderScreen = ({ navigation, route }) => {
  const { selectedPlayers } = route.params;
  const [orderedPlayers, setOrderedPlayers] = useState([...selectedPlayers]);

  const shufflePlayers = () => {
    const shuffled = shuffleArray(orderedPlayers);
    setOrderedPlayers(shuffled);
  };

  const showReorderOptions = (playerIndex) => {
    const player = orderedPlayers[playerIndex];
    const options = ['Anuluj'];
    const actions = [];

    if (playerIndex > 0) {
      options.unshift('Przesuń w górę');
      actions.unshift(() => movePlayerUp(playerIndex));
    }
    if (playerIndex < orderedPlayers.length - 1) {
      options.unshift('Przesuń w dół');
      actions.unshift(() => movePlayerDown(playerIndex));
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options,
          cancelButtonIndex: options.length - 1,
          title: `Zmień pozycję: ${player.name}`,
        },
        (buttonIndex) => {
          if (buttonIndex < actions.length) {
            actions[buttonIndex]();
          }
        }
      );
    } else {
      // For Android, show alert with options
      Alert.alert(
        `Zmień pozycję: ${player.name}`,
        'Wybierz akcję:',
        [
          ...actions.map((action, index) => ({
            text: options[index],
            onPress: action
          })),
          { text: 'Anuluj', style: 'cancel' }
        ]
      );
    }
  };

  const movePlayerUp = (index) => {
    if (index > 0) {
      const newOrder = [...orderedPlayers];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setOrderedPlayers(newOrder);
    }
  };

  const movePlayerDown = (index) => {
    if (index < orderedPlayers.length - 1) {
      const newOrder = [...orderedPlayers];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setOrderedPlayers(newOrder);
    }
  };

  const handleStartGame = () => {
    const gameData = {
      players: orderedPlayers.map((player, index) => ({
        ...player,
        position: index + 1,
        totalPoints: 0,
        currentRoundPoints: 0,
        place: 0
      })),
      currentPlayerIndex: 0,
      currentRound: 1,
      gameState: 'playing', // playing, ended
      gameStartTime: new Date().toISOString()
    };

    navigation.navigate('Game', { gameData });
  };

  const renderPlayer = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() => showReorderOptions(index)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={dragonGradients.purple}
        style={styles.playerCard}
      >
        <View style={styles.playerOrder}>
          <Text style={styles.orderNumber}>{index + 1}</Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>🐉 {item.name}</Text>
          <Text style={styles.playerStats}>
            🎮 {item.totalGames} gier | 🥇 {item.firstPlace}
          </Text>
        </View>
        
        <View style={styles.dragHandle}>
          <Text style={styles.dragHandleText}>⋮⋮</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <LinearGradient
        colors={dragonGradients.ocean}
        style={globalStyles.container}
      >
      <View style={[globalStyles.padding, globalStyles.flex1]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Powrót</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Przytrzymaj gracza aby zmienić kolejność
          </Text>
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, styles.shuffleButton]}
          onPress={shufflePlayers}
        >
          <LinearGradient
            colors={dragonGradients.gold}
            style={styles.buttonGradient}
          >
            <Text style={globalStyles.buttonText}>🎲 Wylosuj Kolejność</Text>
          </LinearGradient>
        </TouchableOpacity>

        <FlatList
          data={orderedPlayers}
          renderItem={renderPlayer}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.playersList}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          style={[globalStyles.button, styles.startButton]}
          onPress={handleStartGame}
        >
          <LinearGradient
            colors={dragonGradients.fire}
            style={styles.buttonGradient}
          >
            <Text style={globalStyles.buttonText}>
              🎮 Start Gry!
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  shuffleButton: {
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 25,
  },
  playersList: {
    paddingBottom: 100,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 15,
    padding: 15,
    ...globalStyles.shadow,
  },
  playerOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 5,
  },
  playerStats: {
    fontSize: 12,
    color: colors.surface,
    opacity: 0.8,
  },
  dragHandle: {
    padding: 10,
  },
  dragHandleText: {
    fontSize: 18,
    color: colors.surface,
    fontWeight: 'bold',
  },
  playersList: {
    marginBottom: 20,
  },
  startButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
};

export default PlayerOrderScreen;
