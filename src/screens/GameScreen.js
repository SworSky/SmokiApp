import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { 
  saveGameState, 
  clearGameState, 
  calculatePlayerRankings,
  updatePlayerRankings, 
  checkGameEnd, 
  getGameWinners 
} from '../services/gameService';
import { 
  saveGame, 
  updateGame, 
  addGameRound, 
  updatePlayerStats 
} from '../services/database';

const GameScreen = ({ navigation, route }) => {
  const { gameData, resumeGame } = route.params;
  
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundPoints, setRoundPoints] = useState('');
  const [displayValue, setDisplayValue] = useState('0');
  const [gameId, setGameId] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameState, setGameState] = useState('playing'); // playing, ended
  const [isKeypadMinimized, setIsKeypadMinimized] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // New: Track every score entry for easy undo
  const [scoreHistory, setScoreHistory] = useState([]);

  // Pan responder for swipe down gesture
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100 && gestureState.vy > 0.5) {
        // Animate slide down and hide
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setIsKeypadMinimized(true);
        });
      } else {
        // Snap back to original position
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Function to show keypad with slide up animation from bottom
  const showKeypad = () => {
    setIsKeypadMinimized(false);
    slideAnim.setValue(400); // Start from bottom
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    // Auto-save game state
    if (gameState === 'playing' && players.length > 0) {
      saveCurrentGameState();
    }
  }, [players, currentPlayerIndex, currentRound, roundHistory]);

  const initializeGame = async () => {
    try {
      if (resumeGame && gameData.activeGame && gameData.gameState) {
        // Resume existing game
        const { activeGame, gameState: savedState } = gameData;
        setPlayers(savedState.players);
        setCurrentPlayerIndex(savedState.currentPlayerIndex);
        setCurrentRound(savedState.currentRound);
        setRoundHistory(savedState.roundHistory || []);
        setGameId(activeGame.id);
        setGameState(savedState.gameState);
      } else {
        // Start new game
        const newGameId = await saveGame(gameData.players, gameData);
        // Initialize players with proper ranking (all start with place 1 since they have 0 points)
        const initialPlayers = gameData.players.map(player => ({
          ...player,
          place: 1
        }));
        setPlayers(initialPlayers);
        setCurrentPlayerIndex(0);
        setCurrentRound(1);
        setRoundHistory([]);
        setGameId(newGameId);
        setGameState('playing');
        setDisplayValue('0');
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Błąd', 'Nie udało się zainicjować gry');
    }
  };

  const saveCurrentGameState = async () => {
    const currentState = {
      players,
      currentPlayerIndex,
      currentRound,
      roundHistory,
      gameState
    };
    
    await saveGameState(currentState);
    
    if (gameId) {
      await updateGame(gameId, currentState);
    }
  };

  const handleKeypadPress = (value) => {
    if (value === 'clear') {
      setDisplayValue('0');
      setRoundPoints('');
    } else if (value === 'backspace') {
      if (displayValue.length <= 1) {
        setDisplayValue('0');
        setRoundPoints('');
      } else {
        const newValue = displayValue.slice(0, -1);
        setDisplayValue(newValue);
        setRoundPoints(newValue === '0' ? '' : newValue);
      }
    } else if (value === '-') {
      if (displayValue === '0') {
        setDisplayValue('-');
        setRoundPoints('-');
      } else if (!displayValue.includes('-')) {
        const newValue = '-' + displayValue;
        setDisplayValue(newValue);
        setRoundPoints(newValue);
      }
    } else if (value === 'enter') {
      handleAddPoints();
    } else {
      // Number pressed
      if (displayValue === '0') {
        setDisplayValue(value);
        setRoundPoints(value);
      } else if (displayValue === '-') {
        const newValue = '-' + value;
        setDisplayValue(newValue);
        setRoundPoints(newValue);
      } else {
        const newValue = displayValue + value;
        setDisplayValue(newValue);
        setRoundPoints(newValue);
      }
    }
  };

  const renderCustomKeypad = () => {
    const keypadButtons = [
      [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }],
      [{ label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }],
      [{ label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }],
      [{ label: '±', value: '-' }, { label: '0', value: '0' }, { label: '⌫', value: 'backspace' }],
      [{ label: 'Cofnij', value: 'undo' }, { label: '✓ Dodaj', value: 'enter' }]
    ];

    return (
      <View style={styles.keypadContent}>
        {keypadButtons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((button, buttonIndex) => (
              <TouchableOpacity
                key={buttonIndex}
                style={[
                  styles.keypadButton,
                  (button.value === 'enter' || button.value === 'undo') && styles.keypadButtonWide,
                ]}
                onPress={() => {
                  if (button.value === 'undo') {
                    handleUndo();
                  } else {
                    handleKeypadPress(button.value);
                  }
                }}
              >
                <LinearGradient
                  colors={
                    button.value === 'enter' ? dragonGradients.fire :
                    button.value === 'undo' ? dragonGradients.purple :
                    button.value === '-' ? dragonGradients.gold :
                    dragonGradients.ocean
                  }
                  style={styles.keypadButtonGradient}
                >
                  <Text style={[
                    styles.keypadButtonText,
                    (button.value === 'undo' || button.value === 'enter') && styles.keypadButtonTextSmall
                  ]}>
                    {button.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const handleAddPoints = async () => {
    const points = parseInt(roundPoints);
    
    if (isNaN(points)) {
      Alert.alert('Błąd', 'Wprowadź prawidłową liczbę punktów');
      return;
    }

    if (points < 0) {
      Alert.alert('Błąd', 'Punkty nie mogą być ujemne');
      return;
    }

    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentPlayerIndex];
    
    // Update player's points
    updatedPlayers[currentPlayerIndex] = {
      ...currentPlayer,
      currentRoundPoints: points,
      totalPoints: currentPlayer.totalPoints + points
    };

    // Add to score history for undo functionality
    const newScoreEntry = {
      playerIndex: currentPlayerIndex,
      playerName: currentPlayer.name,
      points: points,
      round: currentRound,
      timestamp: Date.now(),
      type: 'score' // score entry
    };
    
    setScoreHistory(prev => [...prev, newScoreEntry]);
    setPlayers(updatePlayerRankings(updatedPlayers));
    setRoundPoints('');
    setDisplayValue('0');
    
    // Move to next player or complete round
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      await completeRound(updatedPlayers);
    }
  };

  const completeRound = async (updatedPlayers) => {
    try {
      // Add round completion to score history
      const roundCompleteEntry = {
        type: 'round_complete',
        round: currentRound,
        timestamp: Date.now()
      };
      setScoreHistory(prev => [...prev, roundCompleteEntry]);

      // Save round to database
      const roundData = updatedPlayers.map(player => ({
        playerId: player.id,
        points: player.currentRoundPoints
      }));
      
      await addGameRound(gameId, currentRound, roundData);
      
      // Add to round history
      const newRoundHistory = [...roundHistory, {
        round: currentRound,
        players: updatedPlayers.map(p => ({
          name: p.name,
          points: p.currentRoundPoints,
          totalPoints: p.totalPoints
        }))
      }];
      setRoundHistory(newRoundHistory);

      // Reset for next round
      const playersForNextRound = updatedPlayers.map(player => ({
        ...player,
        currentRoundPoints: 0
      }));

      setPlayers(updatePlayerRankings(playersForNextRound));
      setCurrentPlayerIndex(0);
      setCurrentRound(currentRound + 1);
      setDisplayValue('0');

      // Check if game should end
      if (checkGameEnd(playersForNextRound)) {
        await endGame(playersForNextRound);
      }
    } catch (error) {
      console.error('Error completing round:', error);
      Alert.alert('Błąd', 'Nie udało się zakończyć rundy');
    }
  };

  const endGame = async (finalPlayers) => {
    try {
      const winners = getGameWinners(finalPlayers);
      
      // Update player statistics based on actual place (supporting ex aequo)
      for (const player of winners) {
        if (player.place <= 3) {
          await updatePlayerStats(player.id, player.place);
        }
      }
      
      // Mark game as completed
      await updateGame(gameId, { players: finalPlayers, gameState: 'ended' }, true);
      await clearGameState();
      
      setGameState('ended');
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('Błąd', 'Nie udało się zakończyć gry');
    }
  };

  // New simple undo system - tracks every action for easy reversal
  const handleUndo = () => {
    if (scoreHistory.length === 0) {
      return; // Nothing to undo
    }

    const lastEntry = scoreHistory[scoreHistory.length - 1];
    console.log('🔍 UNDO - Last entry:', lastEntry);

    if (lastEntry.type === 'score') {
      // Undo a score entry
      const updatedPlayers = [...players];
      const playerIndex = lastEntry.playerIndex;
      
      // Subtract the points that were added
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        totalPoints: updatedPlayers[playerIndex].totalPoints - lastEntry.points,
        currentRoundPoints: Math.max(0, (updatedPlayers[playerIndex].currentRoundPoints || 0) - lastEntry.points)
      };

      // Set current player to the one whose score we just undid
      setCurrentPlayerIndex(playerIndex);
      setCurrentRound(lastEntry.round);
      setPlayers(updatePlayerRankings(updatedPlayers));
      
      // Remove this entry from score history
      setScoreHistory(prev => prev.slice(0, -1));
      
      console.log(`🔍 UNDO - Undid ${lastEntry.points} points for ${lastEntry.playerName}`);
      
    } else if (lastEntry.type === 'round_complete') {
      // Undo round completion - go back to the last player of the previous round
      setCurrentRound(lastEntry.round);
      setCurrentPlayerIndex(players.length - 1);
      
      // Reset all players' currentRoundPoints based on the last round's data
      const lastRoundData = roundHistory[roundHistory.length - 1];
      if (lastRoundData) {
        const updatedPlayers = players.map(player => {
          const roundPlayerData = lastRoundData.players.find(p => p.name === player.name);
          return {
            ...player,
            currentRoundPoints: roundPlayerData ? roundPlayerData.points : 0
          };
        });
        setPlayers(updatePlayerRankings(updatedPlayers));
      }
      
      // Remove this entry from score history
      setScoreHistory(prev => prev.slice(0, -1));
      
      console.log(`🔍 UNDO - Undid round ${lastEntry.round} completion`);
    }

    // Clear input
    setRoundPoints('');
    setDisplayValue('0');
  };

  const handlePreviousPlayer = () => {
    console.log('🔍 UNDO - currentPlayerIndex:', currentPlayerIndex);
    console.log('🔍 UNDO - players currentRoundPoints:', players.map(p => ({ name: p.name, currentRoundPoints: p.currentRoundPoints })));
    console.log('🔍 UNDO - roundHistory length:', roundHistory.length);
    console.log('🔍 UNDO - currentRound:', currentRound);
    
    // Check if we can undo a player's score from the current round
    if (currentPlayerIndex > 0) {
      console.log('🔍 UNDO - Case 1: Middle of round');
      // We're in the middle of a round - undo previous player's score
      const updatedPlayers = [...players];
      const prevPlayerIndex = currentPlayerIndex - 1;
      
      console.log('🔍 UNDO - Undoing player', prevPlayerIndex, 'name:', updatedPlayers[prevPlayerIndex].name, 'currentRoundPoints:', updatedPlayers[prevPlayerIndex].currentRoundPoints);
      
      updatedPlayers[prevPlayerIndex] = {
        ...updatedPlayers[prevPlayerIndex],
        totalPoints: updatedPlayers[prevPlayerIndex].totalPoints - updatedPlayers[prevPlayerIndex].currentRoundPoints,
        currentRoundPoints: 0
      };
      
      setPlayers(updatePlayerRankings(updatedPlayers));
      setCurrentPlayerIndex(prevPlayerIndex);
      setRoundPoints('');
      setDisplayValue('0');
      
      console.log('🔍 UNDO - Case 1 completed, new currentPlayerIndex:', prevPlayerIndex);
      setCurrentPlayerIndex(prevPlayerIndex);
      setRoundPoints('');
      setDisplayValue('0');
    } else {
      // currentPlayerIndex === 0
      // First priority: Check if current (first) player has points to undo from current round activity
      // Only process first player if they specifically have non-zero currentRoundPoints from an undo operation
      if (players[0].currentRoundPoints && players[0].currentRoundPoints !== 0) {
        console.log('🔍 UNDO - Case 2A: First player has non-zero currentRoundPoints:', players[0].currentRoundPoints);
        // Undo the current (first) player's score
        const updatedPlayers = [...players];
        updatedPlayers[0] = {
          ...updatedPlayers[0],
          totalPoints: updatedPlayers[0].totalPoints - updatedPlayers[0].currentRoundPoints,
          currentRoundPoints: 0
        };
        
        setPlayers(updatePlayerRankings(updatedPlayers));
        setRoundPoints('');
        setDisplayValue('0');
        // Keep currentPlayerIndex at 0
      } else if (roundHistory.length > 0) {
        console.log('🔍 UNDO - Case 2B: Using round history');
        // No current round points for first player - undo from round history
        const lastRound = roundHistory[roundHistory.length - 1];
        console.log('🔍 UNDO - lastRound:', lastRound);
        
        if (lastRound.players.length === 0) {
          console.log('🔍 UNDO - Empty round, removing it');
          // This round is empty, remove it entirely
          const updatedRoundHistory = [...roundHistory];
          updatedRoundHistory.pop();
          setRoundHistory(updatedRoundHistory);
          setCurrentRound(currentRound - 1);
          setCurrentPlayerIndex(0);
          return;
        }
        
        const lastPlayerEntry = lastRound.players[lastRound.players.length - 1];
        console.log('🔍 UNDO - lastPlayerEntry:', lastPlayerEntry);
        
        const updatedPlayers = players.map(player => {
          if (player.name === lastPlayerEntry.name) {
            return {
              ...player,
              totalPoints: player.totalPoints - lastPlayerEntry.points,
              currentRoundPoints: lastPlayerEntry.points
            };
          }
          return player;
        });
        
        // Update round history to remove the last player's entry
        const updatedRoundHistory = [...roundHistory];
        const currentRoundData = { ...updatedRoundHistory[updatedRoundHistory.length - 1] };
        currentRoundData.players = currentRoundData.players.slice(0, -1);
        
        // Find the player index who just got their score undone
        const undonePlayerIndex = players.findIndex(p => p.name === lastPlayerEntry.name);
        console.log('🔍 UNDO - undonePlayerIndex:', undonePlayerIndex);
        
        if (currentRoundData.players.length === 0) {
          // This round is now empty, remove it entirely
          updatedRoundHistory.pop();
          setRoundHistory(updatedRoundHistory);
          setCurrentRound(currentRound - 1);
          console.log('🔍 UNDO - Removed empty round, new round:', currentRound - 1);
        } else {
          // Round still has players, update it
          updatedRoundHistory[updatedRoundHistory.length - 1] = currentRoundData;
          setRoundHistory(updatedRoundHistory);
          // Always decrement round when undoing from round history, because we're going back into the previous round
          setCurrentRound(lastRound.round);
          console.log('🔍 UNDO - Set round to lastRound.round:', lastRound.round);
        }
        
        setPlayers(updatePlayerRankings(updatedPlayers));
        setCurrentPlayerIndex(undonePlayerIndex);
        setRoundPoints('');
        setDisplayValue('0');
      } else if (currentRound > 1) {
        console.log('🔍 UNDO - Case 3: Show round undo alert');
        // No round history but not round 1 - shouldn't happen, but show round undo option
        Alert.alert(
          'Cofnij rundę',
          'Czy chcesz cofnąć całą poprzednią rundę?',
          [
            { text: 'Anuluj', style: 'cancel' },
            { text: 'Cofnij', onPress: undoLastRound }
          ]
        );
      }
    }
  };

  const undoLastRound = () => {
    if (roundHistory.length === 0) return;
    
    const lastRound = roundHistory[roundHistory.length - 1];
    const updatedPlayers = players.map(player => {
      const lastRoundData = lastRound.players.find(p => p.name === player.name);
      return {
        ...player,
        totalPoints: player.totalPoints - (lastRoundData?.points || 0),
        currentRoundPoints: 0
      };
    });
    
    setPlayers(updatePlayerRankings(updatedPlayers));
    setCurrentPlayerIndex(players.length - 1);
    setCurrentRound(currentRound - 1);
    setRoundHistory(roundHistory.slice(0, -1));
    setRoundPoints('');
    setDisplayValue('0');
  };

  const getPlaceDisplay = (place) => {
    if (place === 1) return '🥇';
    if (place === 2) return '🥈';
    if (place === 3) return '🥉';
    return `${place}.`;
  };

  const renderPlayer = ({ item, index }) => {
    const isCurrentPlayer = index === currentPlayerIndex && gameState === 'playing';
    
    return (
      <LinearGradient
        colors={isCurrentPlayer ? dragonGradients.fire : dragonGradients.ocean}
        style={[styles.playerCard, isCurrentPlayer && styles.currentPlayerCard]}
      >
        <View style={styles.playerRank}>
          <Text style={styles.rankText}>
            {getPlaceDisplay(item.place || 1)}
          </Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {`${isCurrentPlayer ? '▶️' : '🐉'} ${item.name || 'Nieznany gracz'}`}
          </Text>
          <Text style={styles.playerPoints}>
            {`Punkty: ${item.totalPoints || 0}`}
          </Text>
          {typeof item.currentRoundPoints === 'number' && item.currentRoundPoints > 0 && (
            <Text style={styles.roundPoints}>
              {`Runda: +${item.currentRoundPoints}`}
            </Text>
          )}
        </View>
        
        {isCurrentPlayer && (
          <View style={styles.currentPlayerIndicator}>
            <Text style={styles.currentPlayerText}>KOLEJKA</Text>
          </View>
        )}
      </LinearGradient>
    );
  };

  if (gameState === 'ended') {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
        <LinearGradient
          colors={dragonGradients.gold}
          style={globalStyles.container}
        >
          <View style={[globalStyles.padding, globalStyles.centered]}>
            <Text style={styles.endGameTitle}>🎉 Koniec Gry! 🎉</Text>
            <View style={styles.finalResults}>
              {getGameWinners(players).map((player) => (
                <Text key={player.id} style={styles.finalResultText}>
                  {`${getPlaceDisplay(player.place)} ${player.name} - ${player.totalPoints} pkt`}
                </Text>
              ))}
            </View>
            <View style={styles.endGameButtons}>
              <TouchableOpacity 
                style={[globalStyles.button, styles.endGameButton]}
                onPress={() => navigation.reset({
                  index: 0,
                  routes: [{ name: 'PlayerSelection' }],
                })}
              >
                <Text style={globalStyles.buttonText}>🎮 Nowa Gra</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[globalStyles.outlineButton, styles.endGameButton]}
                onPress={() => navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainMenu' }],
                })}
              >
                <Text style={globalStyles.outlineButtonText}>🏠 Menu Główne</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Safety check - don't render if we don't have valid players data
  if (!players || players.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
        <LinearGradient
          colors={dragonGradients.green}
          style={globalStyles.container}
        >
          <View style={[globalStyles.padding, globalStyles.centered]}>
            <Text style={globalStyles.title}>Ładowanie...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <LinearGradient
        colors={dragonGradients.green}
        style={globalStyles.container}
      >
        <View style={[globalStyles.padding, { flex: 1 }]}>
          <View style={styles.header}>
            <Text style={globalStyles.title}>{`Runda ${currentRound}`}</Text>
          </View>

          <View style={styles.playersContainer}>
            <FlatList
              data={players}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={[
                styles.playersList,
                isKeypadMinimized && styles.playersListExpanded
              ]}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
          
          {gameState === 'playing' && !isKeypadMinimized && (
            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  transform: [{ translateY: slideAnim }]
                }
              ]}
              {...panResponder.panHandlers}
            >
              {/* Swipe indicator at the very top */}
              <View style={styles.swipeIndicator}>
                <View style={styles.swipeHandle} />
              </View>
              
              <Text style={styles.inputLabel}>
                {`Punkty dla: ${players[currentPlayerIndex]?.name || 'Nieznany gracz'} • Swipe down to minimize`}
              </Text>
              
              <View style={styles.displayContainer}>
                <Text style={styles.displayText}>{displayValue}</Text>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderCustomKeypad()}
              </ScrollView>
            </Animated.View>
          )}

          {gameState === 'playing' && isKeypadMinimized && (
            <TouchableOpacity 
              style={styles.floatingAddButton}
              onPress={showKeypad}
            >
              <LinearGradient
                colors={dragonGradients.fire}
                style={styles.floatingButtonGradient}
              >
                <Text style={styles.floatingButtonText}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.topBackButton}
            onPress={() => {
              Alert.alert(
                'Opuścić grę?',
                'Gra zostanie zapisana automatycznie',
                [
                  { text: 'Anuluj', style: 'cancel' },
                  { text: 'Opuść', onPress: () => navigation.goBack() }
                ]
              );
            }}
          >
            <Text style={styles.topBackButtonText}>← Powrót</Text>
          </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  topBackButton: {
    position: 'absolute',
    left: 10,
    top: 50,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    zIndex: 1000,
  },
  topBackButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  playersContainer: {
    flex: 1,
    marginBottom: 120, // Leave space for the input container
  },
  playersList: {
    paddingBottom: 10,
  },
  playersListExpanded: {
    paddingBottom: 120, // More space when keypad is minimized to account for floating button
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    borderRadius: 15,
    padding: 15,
    ...globalStyles.shadow,
  },
  currentPlayerCard: {
    borderWidth: 3,
    borderColor: colors.dragon.gold,
  },
  playerRank: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
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
  playerPoints: {
    fontSize: 16,
    color: colors.surface,
    opacity: 0.9,
  },
  roundPoints: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  currentPlayerIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 8,
  },
  currentPlayerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.surface,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 15,
    ...globalStyles.shadow,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    maxHeight: '60%',
  },
  displayContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  displayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingTop: 12,
    width: '100%',
  },
  swipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
  },
  keypadContent: {
    // Container for just the keypad buttons
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  keypadButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 10,
    overflow: 'hidden',
    ...globalStyles.shadow,
  },
  keypadButtonWide: {
    flex: 1,
  },
  keypadButtonWide: {
    flex: 2,
  },
  keypadButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    minHeight: 40,
  },
  keypadButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  keypadButtonTextSmall: {
    fontSize: 12,
  },
  backButton: {
    alignSelf: 'center',
    minWidth: 120,
    marginTop: 10,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...globalStyles.shadow,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  endGameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 30,
  },
  finalResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
  },
  finalResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginVertical: 5,
  },
  endGameButtons: {
    width: '100%',
  },
  endGameButton: {
    marginVertical: 10,
  },
};

export default GameScreen;
