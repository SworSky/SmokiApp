import storage from './storageService';

const GAME_STATE_KEY = 'smoki_game_state';

export const saveGameState = async (gameState) => {
  try {
    await storage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = async () => {
  try {
    const gameState = await storage.getItem(GAME_STATE_KEY);
    return gameState ? JSON.parse(gameState) : null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const clearGameState = async () => {
  try {
    await storage.removeItem(GAME_STATE_KEY);
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
  
  // Create a ranking map with ex aequo support
  const rankingMap = {};
  let currentRank = 1;
  
  for (let i = 0; i < sortedByPoints.length; i++) {
    const player = sortedByPoints[i];
    
    if (i > 0 && sortedByPoints[i - 1].totalPoints === player.totalPoints) {
      // Same points as previous player - same rank
      rankingMap[player.id] = rankingMap[sortedByPoints[i - 1].id];
    } else {
      // Different points - assign current rank
      rankingMap[player.id] = currentRank;
    }
    
    // Update current rank for next iteration
    currentRank = i + 2; // Next possible rank after current position
  }
  
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
  let currentRank = 1;
  
  for (let i = 0; i < sortedByPoints.length; i++) {
    const player = sortedByPoints[i];
    
    if (i > 0 && sortedByPoints[i - 1].totalPoints === player.totalPoints) {
      // Same points as previous player - same rank
      rankingMap[player.id] = rankingMap[sortedByPoints[i - 1].id];
    } else {
      // Different points - assign current rank
      rankingMap[player.id] = currentRank;
    }
    
    // Update current rank for next iteration
    currentRank = i + 2; // Next possible rank after current position
  }
  
  return players.map(player => ({
    ...player,
    place: rankingMap[player.id]
  }));
};

export const checkGameEnd = (players) => {
  return players.some(player => player.totalPoints >= 101);
};

export const getGameWinners = (players) => {
  // Return players sorted by place, then by points for same place
  return [...players].sort((a, b) => {
    if (a.place !== b.place) {
      return a.place - b.place;
    }
    return a.totalPoints - b.totalPoints;
  });
};
