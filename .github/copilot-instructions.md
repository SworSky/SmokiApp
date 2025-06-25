# Copilot Instructions for SmokiApp

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React Native Expo mobile application for the "Smoki" card game. 

## Project Guidelines:
- Use Polish language for all UI text
- Maintain child-friendly colorful UI with dragon themes
- Use SQLite for data persistence
- Implement proper game state management
- Follow React Native and Expo best practices
- Use functional components with hooks
- Maintain proper TypeScript types where applicable

## Key Features:
- Player management with statistics tracking
- Game scoring system with round-based point calculation
- Automatic game ending when players reach 101+ points
- Game state persistence for crash recovery
- Ranking system (1st, 2nd, 3rd place tracking)

## Database Schema:
- Players table: id, name, totalGames, firstPlace, secondPlace, thirdPlace
- Games table: id, players, currentState, isCompleted, createdAt
- GameRounds table: gameId, roundNumber, playerScores
