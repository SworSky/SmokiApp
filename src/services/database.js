import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('smoki.db');

export const initDatabase = () => {
  try {
    // Players table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        totalGames INTEGER DEFAULT 0,
        firstPlace INTEGER DEFAULT 0,
        secondPlace INTEGER DEFAULT 0,
        thirdPlace INTEGER DEFAULT 0
      );
    `);

    // Games table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        players TEXT NOT NULL,
        currentState TEXT,
        isCompleted INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // GameRounds table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS gameRounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gameId INTEGER,
        roundNumber INTEGER,
        playerScores TEXT,
        FOREIGN KEY (gameId) REFERENCES games (id)
      );
    `);

    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing database:', error);
    return Promise.reject(error);
  }
};

// Player operations
export const addPlayer = (name) => {
  try {
    const result = db.runSync('INSERT INTO players (name) VALUES (?);', [name]);
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAllPlayers = () => {
  try {
    const result = db.getAllSync('SELECT * FROM players ORDER BY name ASC;');
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updatePlayer = (id, name) => {
  try {
    const result = db.runSync('UPDATE players SET name = ? WHERE id = ?;', [name, id]);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deletePlayer = (id) => {
  try {
    const result = db.runSync('DELETE FROM players WHERE id = ?;', [id]);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updatePlayerStats = (playerId, place) => {
  try {
    const placeColumn = place === 1 ? 'firstPlace' : place === 2 ? 'secondPlace' : 'thirdPlace';
    const result = db.runSync(
      `UPDATE players SET totalGames = totalGames + 1, ${placeColumn} = ${placeColumn} + 1 WHERE id = ?;`,
      [playerId]
    );
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Game operations
export const saveGame = (players, currentState, isCompleted = false) => {
  try {
    const result = db.runSync(
      'INSERT INTO games (players, currentState, isCompleted) VALUES (?, ?, ?);',
      [JSON.stringify(players), JSON.stringify(currentState), isCompleted ? 1 : 0]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateGame = (gameId, currentState, isCompleted = false) => {
  try {
    const result = db.runSync(
      'UPDATE games SET currentState = ?, isCompleted = ? WHERE id = ?;',
      [JSON.stringify(currentState), isCompleted ? 1 : 0, gameId]
    );
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getActiveGame = () => {
  try {
    const result = db.getFirstSync('SELECT * FROM games WHERE isCompleted = 0 ORDER BY createdAt DESC LIMIT 1;');
    if (result) {
      return Promise.resolve({
        ...result,
        players: JSON.parse(result.players),
        currentState: JSON.parse(result.currentState)
      });
    } else {
      return Promise.resolve(null);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export const addGameRound = (gameId, roundNumber, playerScores) => {
  try {
    const result = db.runSync(
      'INSERT INTO gameRounds (gameId, roundNumber, playerScores) VALUES (?, ?, ?);',
      [gameId, roundNumber, JSON.stringify(playerScores)]
    );
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};
