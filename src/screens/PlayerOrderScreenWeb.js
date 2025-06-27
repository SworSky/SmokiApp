import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';

const PlayerOrderScreenWeb = ({ navigation, route }) => {
  const { selectedPlayers } = route.params;
  const [orderedPlayers, setOrderedPlayers] = useState([...selectedPlayers]);

  const movePlayerUp = (index) => {
    if (index === 0) return;
    
    const newOrder = [...orderedPlayers];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrderedPlayers(newOrder);
  };

  const movePlayerDown = (index) => {
    if (index === orderedPlayers.length - 1) return;
    
    const newOrder = [...orderedPlayers];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderedPlayers(newOrder);
  };

  const shufflePlayers = () => {
    const shuffled = [...orderedPlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrderedPlayers(shuffled);
  };

  const startGame = () => {
    // Create game data with ordered players
    const gameData = {
      players: orderedPlayers.map((player, index) => ({
        ...player,
        order: index + 1,
        totalScore: 0,
        rounds: []
      }))
    };

    navigation.navigate('Game', { gameData });
  };

  const renderPlayer = (player, index) => (
    <View key={player.id} style={styles.playerCard}>
      <View style={styles.orderNumber}>
        <Text style={styles.orderNumberText}>{index + 1}</Text>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerStats}>
          🏆 {player.firstPlace} 🥈 {player.secondPlace} 🥉 {player.thirdPlace} | Gry: {player.totalGames}
        </Text>
      </View>
      
      <View style={styles.moveButtons}>
        <TouchableOpacity 
          style={[
            styles.moveButton,
            index === 0 && styles.disabledButton
          ]}
          onPress={() => movePlayerUp(index)}
          disabled={index === 0}
        >
          <Text style={[
            styles.moveButtonText,
            index === 0 && styles.disabledButtonText
          ]}>
            ↑
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.moveButton,
            index === orderedPlayers.length - 1 && styles.disabledButton
          ]}
          onPress={() => movePlayerDown(index)}
          disabled={index === orderedPlayers.length - 1}
        >
          <Text style={[
            styles.moveButtonText,
            index === orderedPlayers.length - 1 && styles.disabledButtonText
          ]}>
            ↓
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Powrót</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>🎯 Kolejność Graczy</Text>
        
        <TouchableOpacity onPress={shufflePlayers} style={styles.shuffleButton}>
          <Text style={styles.shuffleButtonText}>🎲 Losuj</Text>
        </TouchableOpacity>
      </View>

      {/* Playing Order Preview */}
      <View style={styles.orderPreview}>
        <Text style={styles.orderPreviewTitle}>Kolejność gry:</Text>
        <Text style={styles.orderPreviewText}>
          {orderedPlayers.map((player, index) => 
            `${index + 1}. ${player.name}`
          ).join(' → ')}
        </Text>
      </View>

      {/* Players List */}
      <ScrollView style={styles.playersList} contentContainerStyle={{ padding: 20 }}>
        {orderedPlayers.map(renderPlayer)}
      </ScrollView>

      {/* Start Game Button */}
      <View style={styles.startButtonContainer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={startGame}
        >
          <Text style={styles.startButtonText}>
            🚀 Rozpocznij Grę!
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 20,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  shuffleButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shuffleButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  orderPreview: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  orderPreviewText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  playersList: {
    flex: 1,
    marginTop: 10,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  orderNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  playerStats: {
    fontSize: 12,
    color: colors.textLight,
  },
  moveButtons: {
    gap: 5,
  },
  moveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  moveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButtonText: {
    color: colors.textLight,
  },
  tipsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 18,
  },
  startButtonContainer: {
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    backgroundColor: colors.success,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
};

export default PlayerOrderScreenWeb;
