const Boards = require('../models/Boards');
const { simpleAIMove } = require('../utils/ai/simple_ai_move');
const { heuristicAIMove } = require('../utils/ai/heuristic_ai_move');
const { geneticAIMove } = require('../utils/ai/genetic_ai_move');
const {
  loadLatestPopulation,
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
} = require('../utils/ai/evolution');

let population = [];
let currentGeneration = 1;
let gamesPlayed = 0;

module.exports = async function requestAIMove(socket, io, data) {
  try {
    const { roomId, playerMark } = data;
    if (!roomId) {
      console.warn('requestAIMove called without roomId');
      return;
    }

    // Get current game state from database
    const boardDoc = await Boards.findOne({ roomId }).lean();
    if (!boardDoc) {
      console.log(`No board found for room ${roomId}`);
      return;
    }

    const size = boardDoc.boardSize;
    const board = Array.from({ length: size }, () => Array(size).fill(''));

    // Convert DB positions into a 2D array
    for (const p of boardDoc.positions || []) {
      board[p.row][p.col] = p.value; // 'X' or 'O'
    }

    // Determine player/AI marks
    const humanMark = playerMark;
    const aiMark = humanMark === 'X' ? 'O' : 'X';

    // Get difficulty (from DB or client)
    const difficulty = boardDoc.difficulty || data.difficulty || 'easy';

    let move;

    // Choose AI algorithm based on difficulty
    if (difficulty === 'easy') {
      // Easy: random-based
      move = simpleAIMove(board, size, aiMark, humanMark);
    } else if (difficulty === 'medium') {
      // Medium: heuristic (block + attack patterns)
      move = heuristicAIMove(board, size, aiMark, humanMark);
    } else if (difficulty === 'hard') {
      // Hard: Genetic learning AI

      // Load or initialize population (only once)
      if (!population.length) {
        const latest = await loadLatestPopulation();
        currentGeneration = latest.generation;
        population = latest.population;
      }

      // Pick a random strategy from the current generation
      const strategy =
        population[Math.floor(Math.random() * population.length)];

      // Execute move using the chosen strategy
      move = geneticAIMove(board, size, aiMark, humanMark, strategy);

      // Store info to identify which strategy made the move
      move.strategyId = strategy.id;
    }

    // Validate move
    if (!move) {
      console.log(`AI (${aiMark}) could not find a move for room ${roomId}`);
      return;
    }

    move.value = aiMark;

    // Update the game board in MongoDB
    await Boards.updateOne(
      { roomId },
      {
        $push: { positions: { row: move.row, col: move.col, value: aiMark } },
        $set: { nextMark: humanMark },
      }
    );

    // Add a small random delay (looks more human)
    const delay = Math.floor(800 + Math.random() * 500);
    setTimeout(() => {
      io.to(roomId).emit('ai-move', move);
      console.log(
        `[${difficulty}] AI (${aiMark}) moved in room ${roomId}: [${move.row}, ${move.col}]`
      );
    }, delay);

    // If HARD difficulty: prepare learning process
    if (difficulty === 'hard' && move.strategyId) {
      // Record which strategy played this move for later fitness update
      socket.lastStrategyUsed = move.strategyId;
      socket.currentRoomId = roomId;
    }
  } catch (err) {
    console.error('AI move error:', err);
  }
};
