import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, Modal, ScrollView } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { getAllPlayers, addPlayer, updatePlayer, deletePlayer } from '../services/dbInterface';

const PlayersScreenWeb = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const playersData = await getAllPlayers();
      // Sort players by best performance: 1st place first, then 2nd place, then 3rd place, then total games
      const sortedPlayers = (playersData || []).sort((a, b) => {
        // Compare by first place count (descending)
        if (a.firstPlace !== b.firstPlace) {
          return b.firstPlace - a.firstPlace;
        }
        // If same first places, compare by second place count (descending)
        if (a.secondPlace !== b.secondPlace) {
          return b.secondPlace - a.secondPlace;
        }
        // If same second places, compare by third place count (descending)
        if (a.thirdPlace !== b.thirdPlace) {
          return b.thirdPlace - a.thirdPlace;
        }
        // If all places are equal, compare by total games (descending)
        return b.totalGames - a.totalGames;
      });
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;

    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, playerName.trim());
      } else {
        await addPlayer(playerName.trim());
      }
      await loadPlayers();
      setModalVisible(false);
      setPlayerName('');
      setEditingPlayer(null);
    } catch (error) {
      console.error('Error saving player:', error);
      if (Platform.OS === 'web') {
        alert('Błąd: ' + error.message);
      }
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setModalVisible(true);
  };

  const handleDeletePlayer = async (playerId) => {
    if (Platform.OS === 'web') {
      if (!confirm('Czy na pewno chcesz usunąć tego gracza?')) return;
    }

    try {
      await deletePlayer(playerId);
      await loadPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const renderPlayer = (player) => (
    <View key={player.id} style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerStats}>
          🏆 {player.firstPlace} 🥈 {player.secondPlace} 🥉 {player.thirdPlace} | Gry: {player.totalGames}
        </Text>
      </View>
      
      <View style={styles.playerActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => handleEditPlayer(player)}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
          onPress={() => handleDeletePlayer(player.id)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        
        <Text style={styles.title}>👥 Gracze</Text>
        
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Dodaj</Text>
        </TouchableOpacity>
      </View>

      {/* Players List */}
      <ScrollView style={styles.playersList} contentContainerStyle={{ padding: 20 }}>
        {players.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Brak graczy. Dodaj pierwszego gracza!
            </Text>
          </View>
        ) : (
          players.map(renderPlayer)
        )}
      </ScrollView>

      {/* Add/Edit Player Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingPlayer ? 'Edytuj gracza' : 'Dodaj gracza'}
            </Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Imię gracza"
              value={playerName}
              onChangeText={setPlayerName}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.textLight }]}
                onPress={() => {
                  setModalVisible(false);
                  setPlayerName('');
                  setEditingPlayer(null);
                }}
              >
                <Text style={styles.modalButtonText}>Anuluj</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddPlayer}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  {editingPlayer ? 'Zapisz' : 'Dodaj'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  playersList: {
    flex: 1,
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
  playerStats: {
    fontSize: 14,
    color: colors.textLight,
  },
  playerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
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
    marginBottom: 20,
    color: colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
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

export default PlayersScreenWeb;
