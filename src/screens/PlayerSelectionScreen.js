import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { getAllPlayers } from '../services/database';

const PlayerSelectionScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const playersData = await getAllPlayers();
      // Sort players alphabetically by name
      const sortedPlayers = playersData.sort((a, b) => a.name.localeCompare(b.name));
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      Alert.alert('Błąd', 'Nie udało się załadować graczy');
    }
  };

  const togglePlayerSelection = (player) => {
    const isSelected = selectedPlayers.find(p => p.id === player.id);
    
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length >= 6) {
        Alert.alert('Limit graczy', 'Możesz wybrać maksymalnie 6 graczy');
        return;
      }
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleContinue = () => {
    if (selectedPlayers.length < 2) {
      Alert.alert('Za mało graczy', 'Wybierz co najmniej 2 graczy');
      return;
    }
    
    navigation.navigate('PlayerOrder', { selectedPlayers });
  };

  const renderPlayer = ({ item }) => {
    const isSelected = selectedPlayers.find(p => p.id === item.id);
    
    return (
      <TouchableOpacity 
        onPress={() => togglePlayerSelection(item)}
        style={styles.playerCardContainer}
      >
        <LinearGradient
          colors={isSelected ? dragonGradients.gold : dragonGradients.ocean}
          style={[styles.playerCard, isSelected && styles.selectedCard]}
        >
          <View style={styles.playerHeader}>
            <Text style={styles.playerEmoji}>
              {isSelected ? '✅' : '🐉'}
            </Text>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.gameCount}>
                🎮 {item.totalGames || 0} gier
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <LinearGradient
        colors={dragonGradients.green}
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
          <Text style={globalStyles.title}>Wybierz Graczy</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Wybrano: {selectedPlayers.length} / 6
          </Text>
          <Text style={styles.infoSubtext}>
            (minimum 2 graczy)
          </Text>
        </View>

        {players.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🐲</Text>
            <Text style={styles.emptyText}>Brak graczy</Text>
            <Text style={styles.emptySubtext}>
              Dodaj graczy w sekcji "Gracze"
            </Text>
            <TouchableOpacity 
              style={[globalStyles.button, styles.addPlayersButton]}
              onPress={() => navigation.navigate('Players')}
            >
              <Text style={globalStyles.buttonText}>Dodaj Graczy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={players}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.playersList}
              showsVerticalScrollIndicator={false}
              style={styles.playersContainer}
            />

            {selectedPlayers.length >= 2 && (
              <TouchableOpacity 
                style={[globalStyles.button, styles.continueButton]}
                onPress={handleContinue}
              >
                <LinearGradient
                  colors={dragonGradients.fire}
                  style={styles.buttonGradient}
                >
                  <Text style={globalStyles.buttonText}>
                    Dalej → ({selectedPlayers.length} graczy)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
  },
  playersContainer: {
    flex: 1,
    marginBottom: 100,
  },
  playersList: {
    paddingBottom: 20,
  },
  playerCardContainer: {
    marginVertical: 6,
  },
  playerCard: {
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 10,
    minHeight: 80,
    ...globalStyles.shadow,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: colors.dragon.gold,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerEmoji: {
    fontSize: 24,
    marginRight: 15,
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
  gameCount: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.9,
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    margin: 20,
  },
  emptyText: {
    fontSize: 24,
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  addPlayersButton: {
    marginTop: 20,
  },
};

export default PlayerSelectionScreen;
