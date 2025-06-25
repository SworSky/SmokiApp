import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { shuffleArray } from '../services/gameService';

const PlayerOrderScreen = ({ navigation, route }) => {
  const { selectedPlayers } = route.params;
  const [orderedPlayers, setOrderedPlayers] = useState([...selectedPlayers]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragY] = useState(new Animated.Value(0));

  const ITEM_HEIGHT = 88;

  const shufflePlayers = () => {
    const shuffled = shuffleArray(orderedPlayers);
    setOrderedPlayers(shuffled);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event, index) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setDraggedIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      if (draggedIndex !== null) {
        const { translationY } = event.nativeEvent;
        const newIndex = Math.round(index + translationY / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(orderedPlayers.length - 1, newIndex));
        
        if (clampedIndex !== index) {
          const newOrder = [...orderedPlayers];
          const draggedItem = newOrder.splice(index, 1)[0];
          newOrder.splice(clampedIndex, 0, draggedItem);
          setOrderedPlayers(newOrder);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
      
      setDraggedIndex(null);
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: false,
        tension: 150,
        friction: 8
      }).start();
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

  const renderPlayer = (item, index) => {
    const isDragging = draggedIndex === index;
    
    return (
      <PanGestureHandler
        key={`${item.id}-${index}`}
        onGestureEvent={isDragging ? onGestureEvent : undefined}
        onHandlerStateChange={(event) => onHandlerStateChange(event, index)}
        activeOffsetY={[-5, 5]}
        failOffsetX={[-50, 50]}
      >
        <Animated.View
          style={[
            styles.playerCardContainer,
            isDragging && {
              transform: [{ translateY: dragY }],
              zIndex: 1000,
              elevation: 5,
            }
          ]}
        >
          <LinearGradient
            colors={isDragging ? dragonGradients.fire : dragonGradients.purple}
            style={[styles.playerCard, isDragging && styles.draggedCard]}
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
        </Animated.View>
      </PanGestureHandler>
    );
  };

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
            Przytrzymaj i przeciągnij gracza aby zmienić kolejność
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

        <View style={styles.playersContainer}>
          {orderedPlayers.map((item, index) => renderPlayer(item, index))}
        </View>

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
  playerCardContainer: {
    marginVertical: 4,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    ...globalStyles.shadow,
    minHeight: 80,
  },
  draggedCard: {
    transform: [{ scale: 1.08 }],
    opacity: 0.95,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  playersContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
