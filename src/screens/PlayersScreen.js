import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors, dragonGradients } from '../styles/globalStyles';
import { 
  getAllPlayers, 
  addPlayer, 
  updatePlayer, 
  deletePlayer 
} from '../services/database';

const PlayersScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const playersData = await getAllPlayers();
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading players:', error);
      Alert.alert('Błąd', 'Nie udało się załadować graczy');
    }
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setModalVisible(true);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setModalVisible(true);
  };

  const handleSavePlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Błąd', 'Wprowadź imię gracza');
      return;
    }

    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, playerName.trim());
      } else {
        await addPlayer(playerName.trim());
      }
      
      setModalVisible(false);
      setPlayerName('');
      setEditingPlayer(null);
      loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać gracza. Sprawdź czy imię nie jest już używane.');
    }
  };

  const handleDeletePlayer = (player) => {
    Alert.alert(
      'Usuń gracza',
      `Czy na pewno chcesz usunąć gracza ${player.name}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlayer(player.id);
              loadPlayers();
            } catch (error) {
              console.error('Error deleting player:', error);
              Alert.alert('Błąd', 'Nie udało się usunąć gracza');
            }
          },
        },
      ]
    );
  };

  const renderPlayer = ({ item }) => (
    <LinearGradient
      colors={dragonGradients.ocean}
      style={[globalStyles.card, styles.playerCard]}
    >
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>🐉 {item.name}</Text>
        <View style={styles.playerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditPlayer(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePlayer(item)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Gry:</Text>
          <Text style={styles.statValue}>{item.totalGames}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🥇:</Text>
          <Text style={styles.statValue}>{item.firstPlace}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🥈:</Text>
          <Text style={styles.statValue}>{item.secondPlace}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🥉:</Text>
          <Text style={styles.statValue}>{item.thirdPlace}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <LinearGradient
        colors={dragonGradients.purple}
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
          <Text style={globalStyles.title}>👥 Gracze</Text>
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, styles.addButton]}
          onPress={handleAddPlayer}
        >
          <LinearGradient
            colors={dragonGradients.gold}
            style={styles.buttonGradient}
          >
            <Text style={globalStyles.buttonText}>➕ Dodaj Gracza</Text>
          </LinearGradient>
        </TouchableOpacity>

        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>🐲</Text>
              <Text style={styles.emptyText}>Brak graczy</Text>
              <Text style={styles.emptySubtext}>Dodaj pierwszego gracza!</Text>
            </View>
          }
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={dragonGradients.fire}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>
                {editingPlayer ? 'Edytuj Gracza' : 'Nowy Gracz'}
              </Text>
              
              <TextInput
                style={globalStyles.textInput}
                placeholder="Imię gracza"
                value={playerName}
                onChangeText={setPlayerName}
                maxLength={20}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, styles.modalButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Anuluj</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[globalStyles.button, styles.modalButton, styles.saveButton]}
                  onPress={handleSavePlayer}
                >
                  <Text style={[globalStyles.buttonText, styles.saveButtonText]}>Zapisz</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
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
  addButton: {
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
  listContainer: {
    paddingBottom: 20,
  },
  playerCard: {
    marginVertical: 8,
    borderRadius: 15,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.surface,
    flex: 1,
  },
  playerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.7)',
  },
  actionButtonText: {
    fontSize: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.surface,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.surface,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
  },
  emptyText: {
    fontSize: 24,
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  saveButtonText: {
    fontSize: 14,
  },
};

export default PlayersScreen;
