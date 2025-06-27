import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { getAllPlayers } from '../services/dbInterface';

const PlayerSelectionScreenWeb = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const playersData = await getAllPlayers();
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayerSelection = (player) => {
    const isSelected = selectedPlayers.find(p => p.id === player.id);
    
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 6) { // Max 6 players
        setSelectedPlayers([...selectedPlayers, player]);
      } else {
        if (Platform.OS === 'web') {
          alert('Maksymalnie 6 graczy może brać udział w grze!');
        }
      }
    }
  };

  const startGame = () => {
    if (selectedPlayers.length < 2) {
      if (Platform.OS === 'web') {
        alert('Wybierz co najmniej 2 graczy!');
      }
      return;
    }

    // Go directly to game with selected players
    navigation.navigate('Game', { selectedPlayers });
  };

  const renderPlayer = (player) => {
    const isSelected = selectedPlayers.find(p => p.id === player.id);
    
    return (
      <TouchableOpacity
        key={player.id}
        style={[
          styles.playerCard,
          isSelected && styles.selectedPlayerCard
        ]}
        onPress={() => togglePlayerSelection(player)}
      >
        <View style={styles.playerInfo}>
          <Text style={[
            styles.playerName,
            isSelected && styles.selectedPlayerName
          ]}>
            {player.name}
          </Text>
          <Text style={[
            styles.playerStats,
            isSelected && styles.selectedPlayerStats
          ]}>
            🏆 {player.firstPlace} 🥈 {player.secondPlace} 🥉 {player.thirdPlace} | Gry: {player.totalGames}
          </Text>
        </View>
        
        <View style={[
          styles.selectionIndicator,
          isSelected && styles.selectedIndicator
        ]}>
          <Text style={styles.selectionText}>
            {isSelected ? '✓' : '○'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 24, color: colors.text }}>
          Ładowanie graczy...
        </Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Powrót</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>🎮 Wybierz Graczy</Text>
        
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>{selectedPlayers.length}/6</Text>
        </View>
      </View>

      {/* Players List */}
      <ScrollView style={styles.playersList} contentContainerStyle={{ padding: 20 }}>
        {players.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Brak graczy. Dodaj graczy w sekcji "Gracze" przed rozpoczęciem gry!
            </Text>
            <TouchableOpacity 
              style={styles.addPlayersButton}
              onPress={() => navigation.navigate('Players')}
            >
              <Text style={styles.addPlayersButtonText}>👥 Dodaj Graczy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          players.map(renderPlayer)
        )}
      </ScrollView>

      {/* Start Game Button */}
      {selectedPlayers.length >= 2 && (
        <View style={styles.startButtonContainer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>
              🎮 Rozpocznij grę ({selectedPlayers.length} graczy)
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  counterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  counterText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedSection: {
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
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  selectedPlayersContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  selectedPlayerChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  selectedPlayerChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playersList: {
    flex: 1,
    marginTop: 10,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayerCard: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7F3',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  selectedPlayerName: {
    color: colors.primary,
  },
  playerStats: {
    fontSize: 14,
    color: colors.textLight,
  },
  selectedPlayerStats: {
    color: colors.primary,
  },
  selectionIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  addPlayersButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addPlayersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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

export default PlayerSelectionScreenWeb;
