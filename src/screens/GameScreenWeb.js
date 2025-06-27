import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { updatePlayerStats, saveGame, updateGame } from '../services/dbInterface';
import NumpadModal from '../components/NumpadModal';

const GameScreenWeb = ({ navigation, route }) => {
  const { gameData, resumeGame, selectedPlayers } = route.params;
  
  // Initialize players with proper state restoration
  const initializePlayers = () => {
    if (resumeGame && gameData && gameData.players) {
      // When resuming, use the saved player data with scores and rounds
      return gameData.players;
    } else if (selectedPlayers) {
      // New game from player selection, initialize fresh players with game structure
      return selectedPlayers.map(player => ({
        ...player,
        totalScore: 0,
        rounds: []
      }));
    } else if (gameData && gameData.players) {
      // New game with gameData format
      return gameData.players;
    } else {
      // Fallback - shouldn't happen
      return [];
    }
  };
  
  const [players, setPlayers] = useState(initializePlayers());
  const [currentRound, setCurrentRound] = useState(resumeGame && gameData.currentRound ? gameData.currentRound : 1);
  const [roundScores, setRoundScores] = useState({});
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [numpadVisible, setNumpadVisible] = useState(false);
  const [currentEditingPlayer, setCurrentEditingPlayer] = useState(null);
  const [gameId, setGameId] = useState(resumeGame ? gameData.id : null);

  useEffect(() => {
    checkGameEnd();
  }, [players]);

  const checkGameEnd = async () => {
    const playersOver101 = players.filter(player => player.totalScore >= 101);
    if (playersOver101.length > 0) {
      // Sort all players by score (ascending - lowest score wins)
      const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
      
      // Find the lowest score among all players
      const lowestScore = sortedPlayers[0].totalScore;
      const winners = sortedPlayers.filter(player => player.totalScore === lowestScore);
      
      // If there's only one winner, set them. If multiple winners (tie), set the first one but handle tie in statistics
      setWinner(winners[0]);
      setGameEnded(true);
      
      // Mark game as completed in database
      if (gameId) {
        try {
          const finalGameState = {
            players: sortedPlayers,
            currentRound: currentRound,
            lastUpdated: new Date().toISOString(),
            finished: true
          };
          await updateGame(gameId, finalGameState, true); // Mark as completed
          console.log('Game marked as completed');
        } catch (error) {
          console.error('Error marking game as completed:', error);
        }
      }
      
      // Update player statistics with proper tie handling
      // Only save statistics if at least one player has score higher than 50
      const hasPlayerWithHighScore = sortedPlayers.some(player => player.totalScore > 50);
      
      if (hasPlayerWithHighScore) {
        try {
          let currentPlace = 1;
          let previousScore = null;
          let playersAtSamePlace = 0;
          
          for (let i = 0; i < sortedPlayers.length; i++) {
            const player = sortedPlayers[i];
            
            // If this player has the same score as previous, they get the same place
            if (previousScore !== null && player.totalScore !== previousScore) {
              currentPlace += playersAtSamePlace;
              playersAtSamePlace = 1;
            } else {
              playersAtSamePlace++;
            }
            
            await updatePlayerStats(player.id, currentPlace);
            previousScore = player.totalScore;
          }
          console.log('Player statistics updated successfully with tie handling');
        } catch (error) {
          console.error('Error updating player statistics:', error);
        }
      } else {
        console.log('No player has score higher than 50, skipping statistics update');
      }
    }
  };

  const updateRoundScore = (playerId, score) => {
    // Handle negative values and empty strings
    let numScore = 0;
    if (score === '' || score === '-') {
      numScore = 0;
    } else {
      numScore = parseInt(score) || 0;
    }
    
    setRoundScores(prev => ({
      ...prev,
      [playerId]: numScore
    }));
  };

  const openNumpad = (player) => {
    setCurrentEditingPlayer(player);
    setNumpadVisible(true);
  };

  const handleNumpadSubmit = (value) => {
    if (currentEditingPlayer) {
      updateRoundScore(currentEditingPlayer.id, value);
      setCurrentEditingPlayer(null);
    }
  };

  const submitRound = async () => {
    // Validate all players have scores (including negative values)
    const allScoresEntered = players.every(player => 
      roundScores[player.id] !== undefined
    );

    if (!allScoresEntered) {
      if (Platform.OS === 'web') {
        alert('Wprowadź wyniki dla wszystkich graczy!');
      }
      return;
    }

    // Update player scores (allow negative values)
    const updatedPlayers = players.map(player => ({
      ...player,
      totalScore: player.totalScore + (roundScores[player.id] || 0),
      rounds: [...player.rounds, roundScores[player.id] || 0]
    }));

    setPlayers(updatedPlayers);
    setCurrentRound(currentRound + 1);
    setRoundScores({});

    // Save game state
    try {
      const gameState = {
        players: updatedPlayers, // Save the complete updated player data
        currentRound: currentRound + 1,
        lastUpdated: new Date().toISOString()
      };

      if (gameId) {
        await updateGame(gameId, gameState, false);
      } else {
        // For new games, save with the updated players as both the players and state
        const newGameId = await saveGame(updatedPlayers, gameState, false);
        setGameId(newGameId);
      }
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const endGame = () => {
    setModalVisible(true);
  };

  const confirmEndGame = async () => {
    // Sort players by score for final ranking
    const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
    
    // Mark game as completed in database
    if (gameId) {
      try {
        const finalGameState = {
          players: sortedPlayers,
          currentRound: currentRound,
          lastUpdated: new Date().toISOString(),
          finished: true
        };
        await updateGame(gameId, finalGameState, true); // Mark as completed
        console.log('Game manually ended and marked as completed');
      } catch (error) {
        console.error('Error marking game as completed:', error);
      }
    }
    
    // Update player statistics if game wasn't already ended
    if (!gameEnded) {
      try {
        let currentPlace = 1;
        let previousScore = null;
        let playersAtSamePlace = 0;
        
        for (let i = 0; i < sortedPlayers.length; i++) {
          const player = sortedPlayers[i];
          
          // If this player has the same score as previous, they get the same place
          if (previousScore !== null && player.totalScore !== previousScore) {
            currentPlace += playersAtSamePlace;
            playersAtSamePlace = 1;
          } else {
            playersAtSamePlace++;
          }
          
          await updatePlayerStats(player.id, currentPlace);
          previousScore = player.totalScore;
        }
        console.log('Player statistics updated successfully with tie handling');
      } catch (error) {
        console.error('Error updating player statistics:', error);
      }
    }
    
    if (Platform.OS === 'web') {
      const resultText = sortedPlayers.map((player, index) => 
        `${index + 1}. ${player.name}: ${player.totalScore} pkt`
      ).join('\n');
      
      alert(`Gra zakończona!\n\nWyniki:\n${resultText}`);
    }
    
    navigation.goBack();
  };

  const renderPlayerCard = (player) => {
    const isEliminated = player.totalScore >= 101;
    
    return (
      <View key={player.id} style={[
        styles.playerCard,
        isEliminated && styles.eliminatedPlayerCard
      ]}>
        <View style={styles.playerHeader}>
          <Text style={[
            styles.playerName,
            isEliminated && styles.eliminatedPlayerName
          ]}>
            {player.name}
          </Text>
          <Text style={[
            styles.playerScore,
            isEliminated && styles.eliminatedPlayerScore
          ]}>
            {player.totalScore} pkt
          </Text>
        </View>
        
        {!gameEnded && (
          <View style={styles.scoreInputContainer}>
            <Text style={styles.roundLabel}>Runda {currentRound}:</Text>
            <TouchableOpacity
              style={[
                styles.scoreButton,
                isEliminated && styles.eliminatedScoreButton
              ]}
              onPress={() => !isEliminated && openNumpad(player)}
              disabled={isEliminated}
            >
              <Text style={[
                styles.scoreButtonText,
                isEliminated && styles.eliminatedScoreButtonText
              ]}>
                {roundScores[player.id] !== undefined ? roundScores[player.id].toString() : '0'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {player.rounds.length > 0 && (
          <View style={styles.roundHistory}>
            <Text style={styles.roundHistoryTitle}>Historia rund:</Text>
            <Text style={styles.roundHistoryText}>
              {player.rounds.join(', ')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (gameEnded && winner) {
    return (
      <View style={[globalStyles.container, globalStyles.centered, { backgroundColor: colors.success }]}>
        <Text style={styles.gameEndTitle}>🎉 Gra zakończona! 🎉</Text>
        <Text style={styles.winnerText}>Zwycięzca: {winner.name}</Text>
        <Text style={styles.winnerScore}>Wynik: {winner.totalScore} punktów</Text>
        
        <View style={styles.finalRanking}>
          <Text style={styles.rankingTitle}>Końcowy ranking:</Text>
          {(() => {
            const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
            let currentPlace = 1;
            let previousScore = null;
            let playersAtSamePlace = 0;
            
            return sortedPlayers.map((player, index) => {
              // Calculate proper place considering ties
              if (previousScore !== null && player.totalScore !== previousScore) {
                currentPlace += playersAtSamePlace;
                playersAtSamePlace = 1;
              } else {
                playersAtSamePlace++;
              }
              
              const displayPlace = currentPlace;
              previousScore = player.totalScore;
              
              return (
                <Text key={player.id} style={styles.rankingItem}>
                  {displayPlace}. {player.name}: {player.totalScore} pkt
                  {displayPlace === 1 && ' 🏆'}
                  {displayPlace === 2 && ' 🥈'}
                  {displayPlace === 3 && ' 🥉'}
                </Text>
              );
            });
          })()}
        </View>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>🏠 Powrót do menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>← Powrót</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🎮 Smoki</Text>
          <Text style={styles.roundText}>Runda {currentRound}</Text>
        </View>
        
        <TouchableOpacity onPress={endGame} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Zakończ</Text>
        </TouchableOpacity>
      </View>

      {/* Players */}
      <ScrollView style={styles.playersList} contentContainerStyle={{ padding: 20 }}>
        {players.map(renderPlayerCard)}
      </ScrollView>

      {/* Submit Round Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={submitRound}
        >
          <Text style={styles.submitButtonText}>
            ✅ Zatwierdź rundę {currentRound}
          </Text>
        </TouchableOpacity>
      </View>

      {/* End Game Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Zakończyć grę?</Text>
            <Text style={styles.modalText}>
              Czy na pewno chcesz zakończyć grę w rundzie {currentRound}?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.textLight }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Anuluj</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.danger }]}
                onPress={confirmEndGame}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  Zakończ grę
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Numpad Modal */}
      <NumpadModal
        visible={numpadVisible}
        onClose={() => {
          setNumpadVisible(false);
          setCurrentEditingPlayer(null);
        }}
        onSubmit={handleNumpadSubmit}
        title={currentEditingPlayer ? `${currentEditingPlayer.name} - Runda ${currentRound}` : ''}
        currentValue={currentEditingPlayer ? roundScores[currentEditingPlayer.id]?.toString() || '' : ''}
      />
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: colors.primary,
  },
  headerButton: {
    padding: 10,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  roundText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  rulesContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  rulesText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  playersList: {
    flex: 1,
    marginTop: 10,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eliminatedPlayerCard: {
    backgroundColor: '#FFEBEE',
    opacity: 0.7,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  eliminatedPlayerName: {
    color: colors.danger,
    textDecorationLine: 'line-through',
  },
  playerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  eliminatedPlayerScore: {
    color: colors.danger,
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roundLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 10,
    flex: 1,
  },
  scoreButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.primary,
    width: 80,
    alignItems: 'center',
  },
  scoreButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  eliminatedScoreButton: {
    backgroundColor: '#F5F5F5',
    borderColor: colors.textLight,
  },
  eliminatedScoreButtonText: {
    color: colors.textLight,
  },
  roundHistory: {
    marginTop: 5,
  },
  roundHistoryTitle: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  roundHistoryText: {
    fontSize: 12,
    color: colors.textLight,
  },
  submitButtonContainer: {
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameEndTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  winnerScore: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  finalRanking: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  rankingItem: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginVertical: 3,
  },
  backButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 40,
  },
  backButtonText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: colors.text,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: colors.textLight,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
};

export default GameScreenWeb;
