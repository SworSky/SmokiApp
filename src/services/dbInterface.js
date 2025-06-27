import { Platform } from 'react-native';

// Import based on platform
let nativeDb;
if (Platform.OS !== 'web') {
  nativeDb = require('./database');
}

// Web database implementation
import storage from './storageService';

const PLAYERS_KEY = 'smoki_players';
const GAMES_KEY = 'smoki_games';
const GAME_ROUNDS_KEY = 'smoki_game_rounds';

// Web implementation functions
const webGetPlayers = async () => {
  try {
    const players = await storage.getItem(PLAYERS_KEY);
    return players ? JSON.parse(players) : [];
  } catch (error) {
    console.error('Error getting players:', error);
    return [];
  }
};

const webGetGames = async () => {
  try {
    const games = await storage.getItem(GAMES_KEY);
    return games ? JSON.parse(games) : [];
  } catch (error) {
    console.error('Error getting games:', error);
    return [];
  }
};

const webGetGameRounds = async () => {
  try {
    const rounds = await storage.getItem(GAME_ROUNDS_KEY);
    return rounds ? JSON.parse(rounds) : [];
  } catch (error) {
    console.error('Error getting game rounds:', error);
    return [];
  }
};

// Universal database interface
export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    try {
      // Initialize empty arrays if they don't exist
      const players = await webGetPlayers();
      const games = await webGetGames();
      const gameRounds = await webGetGameRounds();
      
      if (!players || players.length === undefined) await storage.setItem(PLAYERS_KEY, JSON.stringify([]));
      if (!games || games.length === undefined) await storage.setItem(GAMES_KEY, JSON.stringify([]));
      if (!gameRounds || gameRounds.length === undefined) await storage.setItem(GAME_ROUNDS_KEY, JSON.stringify([]));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing web database:', error);
      return Promise.resolve(); // Don't fail, just continue
    }
  } else {
    return nativeDb.initDatabase();
  }
};

export const addPlayer = async (name) => {
  if (Platform.OS === 'web') {
    try {
      const players = await webGetPlayers();
      const newPlayer = {
        id: Date.now(), // Simple ID generation
        name,
        totalGames: 0,
        firstPlace: 0,
        secondPlace: 0,
        thirdPlace: 0
      };
      
      // Check if player already exists
      if (players.find(p => p.name === name)) {
        throw new Error('Player already exists');
      }
      
      players.push(newPlayer);
      await storage.setItem(PLAYERS_KEY, JSON.stringify(players));
      return newPlayer.id;
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  } else {
    return nativeDb.addPlayer(name);
  }
};

export const getAllPlayers = async () => {
  if (Platform.OS === 'web') {
    return await webGetPlayers();
  } else {
    return nativeDb.getAllPlayers();
  }
};

export const updatePlayer = async (id, name) => {
  if (Platform.OS === 'web') {
    try {
      const players = await webGetPlayers();
      const playerIndex = players.findIndex(p => p.id === id);
      if (playerIndex !== -1) {
        players[playerIndex].name = name;
        await storage.setItem(PLAYERS_KEY, JSON.stringify(players));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  } else {
    return nativeDb.updatePlayer(id, name);
  }
};

export const deletePlayer = async (id) => {
  if (Platform.OS === 'web') {
    try {
      const players = await webGetPlayers();
      const filteredPlayers = players.filter(p => p.id !== id);
      await storage.setItem(PLAYERS_KEY, JSON.stringify(filteredPlayers));
      return { success: true };
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  } else {
    return nativeDb.deletePlayer(id);
  }
};

export const updatePlayerStats = async (playerId, place) => {
  if (Platform.OS === 'web') {
    try {
      const players = await webGetPlayers();
      const playerIndex = players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        players[playerIndex].totalGames += 1;
        if (place === 1) players[playerIndex].firstPlace += 1;
        else if (place === 2) players[playerIndex].secondPlace += 1;
        else if (place === 3) players[playerIndex].thirdPlace += 1;
        
        await storage.setItem(PLAYERS_KEY, JSON.stringify(players));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw error;
    }
  } else {
    return nativeDb.updatePlayerStats(playerId, place);
  }
};

export const saveGame = async (players, currentState, isCompleted = false) => {
  if (Platform.OS === 'web') {
    try {
      const games = await webGetGames();
      
      // Remove any existing incomplete games first
      const completedGames = games.filter(game => game.isCompleted === 1);
      
      const newGame = {
        id: Date.now(),
        players: JSON.stringify(players),
        currentState: JSON.stringify(currentState),
        isCompleted: isCompleted ? 1 : 0,
        createdAt: new Date().toISOString()
      };
      
      completedGames.push(newGame);
      await storage.setItem(GAMES_KEY, JSON.stringify(completedGames));
      return newGame.id;
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  } else {
    return nativeDb.saveGame(players, currentState, isCompleted);
  }
};

export const updateGame = async (gameId, currentState, isCompleted = false) => {
  if (Platform.OS === 'web') {
    try {
      const games = await webGetGames();
      const gameIndex = games.findIndex(g => g.id === gameId);
      
      if (gameIndex !== -1) {
        // Update both the players and currentState to keep them in sync
        games[gameIndex].players = JSON.stringify(currentState.players);
        games[gameIndex].currentState = JSON.stringify(currentState);
        games[gameIndex].isCompleted = isCompleted ? 1 : 0;
        await storage.setItem(GAMES_KEY, JSON.stringify(games));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  } else {
    return nativeDb.updateGame(gameId, currentState, isCompleted);
  }
};

export const getActiveGame = async () => {
  if (Platform.OS === 'web') {
    try {
      const games = await webGetGames();
      const activeGame = games.find(game => game.isCompleted === 0);
      if (activeGame) {
        return {
          ...activeGame,
          players: JSON.parse(activeGame.players),
          currentState: JSON.parse(activeGame.currentState)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting active game:', error);
      return null;
    }
  } else {
    return nativeDb.getActiveGame();
  }
};

export const addGameRound = async (gameId, roundNumber, playerScores) => {
  if (Platform.OS === 'web') {
    try {
      const rounds = await webGetGameRounds();
      const newRound = {
        id: Date.now(),
        gameId,
        roundNumber,
        playerScores: JSON.stringify(playerScores)
      };
      
      rounds.push(newRound);
      await storage.setItem(GAME_ROUNDS_KEY, JSON.stringify(rounds));
      return { success: true };
    } catch (error) {
      console.error('Error adding game round:', error);
      throw error;
    }
  } else {
    return nativeDb.addGameRound(gameId, roundNumber, playerScores);
  }
};
