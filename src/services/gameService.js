import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_STATE_KEY = 'smoki_game_state';

export const saveGameState = async (gameState) => {
  try {
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = async () => {
  try {
    const gameState = await AsyncStorage.getItem(GAME_STATE_KEY);
    return gameState ? JSON.parse(gameState) : null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const clearGameState = async () => {
  try {
    await AsyncStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculatePlayerRankings = (players) => {
  // Sort players by total points (ascending - lower is better) for ranking only
  const sortedByPoints = [...players].sort((a, b) => a.totalPoints - b.totalPoints);
  
  // Create a ranking map
  const rankingMap = {};
  sortedByPoints.forEach((player, index) => {
    rankingMap[player.id] = index + 1;
  });
  
  // Return players in original order but with updated rankings
  return players.map(player => ({
    ...player,
    place: rankingMap[player.id]
  }));
};

export const updatePlayerRankings = (players) => {
  // Just update rankings without changing order
  const sortedByPoints = [...players].sort((a, b) => a.totalPoints - b.totalPoints);
  
  const rankingMap = {};
  sortedByPoints.forEach((player, index) => {
    rankingMap[player.id] = index + 1;
  });
  
  return players.map(player => ({
    ...player,
    place: rankingMap[player.id]
  }));
};

export const checkGameEnd = (players) => {
  return players.some(player => player.totalPoints >= 101);
};

export const getGameWinners = (players) => {
  const sortedPlayers = [...players].sort((a, b) => a.totalPoints - b.totalPoints);
  return sortedPlayers;
};
