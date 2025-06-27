import { Platform } from 'react-native';
import storage from './storageService';

// Keys for localStorage
const PLAYERS_KEY = 'smoki_players';
const GAMES_KEY = 'smoki_games';
const GAME_ROUNDS_KEY = 'smoki_game_rounds';

class WebDatabase {
  async initDatabase() {
    try {
      // Initialize empty arrays if they don't exist
      const players = await this.getPlayers();
      const games = await this.getGames();
      const gameRounds = await this.getGameRounds();
      
      if (!players || players.length === undefined) await storage.setItem(PLAYERS_KEY, JSON.stringify([]));
      if (!games || games.length === undefined) await storage.setItem(GAMES_KEY, JSON.stringify([]));
      if (!gameRounds || gameRounds.length === undefined) await storage.setItem(GAME_ROUNDS_KEY, JSON.stringify([]));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing web database:', error);
      return Promise.resolve(); // Don't fail, just continue
    }
  }

  async getPlayers() {
    const players = await storage.getItem(PLAYERS_KEY);
    return players ? JSON.parse(players) : [];
  }

  async getGames() {
    const games = await storage.getItem(GAMES_KEY);
    return games ? JSON.parse(games) : [];
  }

  async getGameRounds() {
    const rounds = await storage.getItem(GAME_ROUNDS_KEY);
    return rounds ? JSON.parse(rounds) : [];
  }

  async addPlayer(name) {
    const players = await this.getPlayers();
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
    return newPlayer;
  }

  async updatePlayerStats(playerId, stats) {
    const players = await this.getPlayers();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex !== -1) {
      players[playerIndex] = { ...players[playerIndex], ...stats };
      await storage.setItem(PLAYERS_KEY, JSON.stringify(players));
      return players[playerIndex];
    }
    return null;
  }

  async deletePlayer(playerId) {
    const players = await this.getPlayers();
    const filteredPlayers = players.filter(p => p.id !== playerId);
    await storage.setItem(PLAYERS_KEY, JSON.stringify(filteredPlayers));
    return true;
  }

  async saveGame(gameData) {
    const games = await this.getGames();
    const newGame = {
      id: Date.now(),
      ...gameData,
      createdAt: new Date().toISOString()
    };
    
    games.push(newGame);
    await storage.setItem(GAMES_KEY, JSON.stringify(games));
    return newGame;
  }

  async updateGame(gameId, gameData) {
    const games = await this.getGames();
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex !== -1) {
      games[gameIndex] = { ...games[gameIndex], ...gameData };
      await storage.setItem(GAMES_KEY, JSON.stringify(games));
      return games[gameIndex];
    }
    return null;
  }

  async saveGameRound(roundData) {
    const rounds = await this.getGameRounds();
    const newRound = {
      id: Date.now(),
      ...roundData
    };
    
    rounds.push(newRound);
    await storage.setItem(GAME_ROUNDS_KEY, JSON.stringify(rounds));
    return newRound;
  }

  async getGameRoundsByGameId(gameId) {
    const rounds = await this.getGameRounds();
    return rounds.filter(r => r.gameId === gameId);
  }
}

// Export the appropriate database based on platform
let database;

if (Platform.OS === 'web') {
  database = new WebDatabase();
} else {
  // Use the original SQLite database for native platforms
  database = require('./database').default || require('./database');
}

export default database;
