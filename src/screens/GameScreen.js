import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView 
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
  const [gameId, setGameId] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameState, setGameState] = useState('playing'); // playing, ended

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

  const handleAddPoints = async () => {
    const points = parseInt(roundPoints);
    
    if (isNaN(points)) {
      Alert.alert('Błąd', 'Wprowadź prawidłową liczbę punktów');
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      currentRoundPoints: points,
      totalPoints: updatedPlayers[currentPlayerIndex].totalPoints + points
    };

    setPlayers(updatePlayerRankings(updatedPlayers));
    setRoundPoints('');
    
    // Move to next player or complete round
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      await completeRound(updatedPlayers);
    }
  };

  const completeRound = async (updatedPlayers) => {
    try {
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

  const handlePreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
      // Remove points from current player and go back
      const updatedPlayers = [...players];
      const prevPlayerIndex = currentPlayerIndex - 1;
      
      updatedPlayers[prevPlayerIndex] = {
        ...updatedPlayers[prevPlayerIndex],
        totalPoints: updatedPlayers[prevPlayerIndex].totalPoints - updatedPlayers[prevPlayerIndex].currentRoundPoints,
        currentRoundPoints: 0
      };
      
      setPlayers(updatePlayerRankings(updatedPlayers));
      setCurrentPlayerIndex(prevPlayerIndex);
      setRoundPoints('');
    } else if (currentRound > 1 && roundHistory.length > 0) {
      Alert.alert(
        'Cofnij rundę',
        'Czy chcesz cofnąć całą poprzednią rundę?',
        [
          { text: 'Anuluj', style: 'cancel' },
          { text: 'Cofnij', onPress: undoLastRound }
        ]
      );
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
  };

  const renderPlayer = ({ item, index }) => {
    const isCurrentPlayer = index === currentPlayerIndex && gameState === 'playing';
    const getPlaceDisplay = (place) => {
      if (place === 1) return '🥇';
      if (place === 2) return '🥈';
      if (place === 3) return '🥉';
      return `${place}.`;
    };
    
    return (
      <LinearGradient
        colors={isCurrentPlayer ? dragonGradients.fire : dragonGradients.ocean}
        style={[styles.playerCard, isCurrentPlayer && styles.currentPlayerCard]}
      >
        <View style={styles.playerRank}>
          <Text style={styles.rankText}>
            {getPlaceDisplay(item.place)}
          </Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {isCurrentPlayer ? '▶️ ' : '🐉 '}{item.name}
          </Text>
          <Text style={styles.playerPoints}>
            Punkty: {item.totalPoints}
          </Text>
          {item.currentRoundPoints > 0 && (
            <Text style={styles.roundPoints}>
              Runda: +{item.currentRoundPoints}
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
    const getPlaceDisplay = (place) => {
      if (place === 1) return '🥇';
      if (place === 2) return '🥈';
      if (place === 3) return '🥉';
      return `${place}.`;
    };

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
                  {getPlaceDisplay(player.place)} {player.name} - {player.totalPoints} pkt
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <LinearGradient
        colors={dragonGradients.green}
        style={globalStyles.container}
      >
        <View style={[globalStyles.padding, { flex: 1 }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
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
              <Text style={styles.backButtonText}>← Menu</Text>
            </TouchableOpacity>
            <Text style={globalStyles.title}>Runda {currentRound}</Text>
          </View>

          <View style={styles.playersContainer}>
            <FlatList
              data={players}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.playersList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        {gameState === 'playing' && (
          <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Punkty dla: {players[currentPlayerIndex]?.name}
              </Text>
              
              <TextInput
                style={[globalStyles.textInput, styles.pointsInput]}
                placeholder="Wprowadź punkty (może być ujemne)"
                value={roundPoints}
                onChangeText={setRoundPoints}
                keyboardType="numbers-and-punctuation"
                maxLength={4}
              />
              
              <View style={styles.gameControls}>
                <TouchableOpacity 
                  style={[globalStyles.outlineButton, styles.controlButton]}
                  onPress={handlePreviousPlayer}
                  disabled={currentPlayerIndex === 0 && currentRound === 1}
                >
                  <Text style={globalStyles.outlineButtonText}>
                    ← Cofnij
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[globalStyles.button, styles.controlButton]}
                  onPress={handleAddPoints}
                >
                  <Text style={globalStyles.buttonText}>
                    {currentPlayerIndex < players.length - 1 ? 'Kolejny gracz' : 'Zakończ rundę'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        )}
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
  playersContainer: {
    flex: 1,
    marginBottom: 160, // Leave space for the input container
  },
  playersList: {
    paddingBottom: 10,
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
    padding: 20,
    ...globalStyles.shadow,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  pointsInput: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 5,
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
