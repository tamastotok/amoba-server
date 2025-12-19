const Boards = require('../models/Boards');
const { simpleAIMove } = require('../utils/ai/simple_ai_move');
const { heuristicAIMove } = require('../utils/ai/heuristic_ai_move');
const { geneticAIMove } = require('../utils/ai/genetic_ai_move');
const { loadLatestPopulation } = require('../utils/ai/evolution');
const aiState = require('../utils/ai_state');
const log = require('../utils/logger');

module.exports = async function requestAIMove(socket, io, data) {
  try {
    const { roomId, playerMark } = data;
    if (!roomId) {
      log.warn('requestAIMove called without roomId');
      return;
    }

    // Load game state from db
    const boardDoc = await Boards.findOne({ roomId }).lean();
    if (!boardDoc) {
      log.warn(`No board found for room ${roomId}`);
      return;
    }

    const size = boardDoc.boardSize;
    const board = Array.from({ length: size }, () => Array(size).fill(''));

    // Load positions
    for (const p of boardDoc.positions || []) {
      board[p.row][p.col] = p.value; // 'X' or 'O'
    }

    // Marks
    const humanMark = playerMark;
    const aiMark = humanMark === 'X' ? 'O' : 'X';
    const difficulty = boardDoc.difficulty;

    let move;

    // ---------------------------
    // Select ai
    // ---------------------------
    if (difficulty === 'easy') {
      // EASY: Random moves
      move = simpleAIMove(board, size, aiMark, humanMark);
    } else if (difficulty === 'medium') {
      // MEDIUM: Heuristic
      move = heuristicAIMove(board, size, aiMark, humanMark);
    } else if (difficulty === 'hard') {
      // HARD: Genetic

      // Load population
      if (!aiState.population.length) {
        const latest = await loadLatestPopulation();
        aiState.population = latest.population;
        aiState.currentGeneration = latest.generation;
      }

      // 2. Set strategy
      let strategyId = aiState.strategyPerRoom.get(roomId);

      if (!strategyId) {
        const activeGamesCount = aiState.strategyPerRoom.size;
        const totalIndex = aiState.gamesPlayed + activeGamesCount;
        const idx = totalIndex % aiState.population.length;
        const picked = aiState.population[idx];

        if (!picked) {
          log.error('Population index error - picking random fallback');
          strategyId =
            aiState.population[
              Math.floor(Math.random() * aiState.population.length)
            ].id;
        } else {
          strategyId = picked.id;
        }

        aiState.strategyPerRoom.set(roomId, strategyId);
        log.info(
          `[Hard] Room ${roomId} assigned Strategy ID: ${strategyId} (Gen: ${aiState.currentGeneration})`
        );
      } else {
        log.debug(`[Hard] Reuse Strategy ID: ${strategyId} for Room ${roomId}`);
      }

      // Search strategy
      const strategy = aiState.population.find(
        (s) => String(s.id) === String(strategyId)
      );

      if (!strategy) {
        log.warn(
          `Strategy not found for id=${strategyId}, removing from room map.`
        );
        aiState.strategyPerRoom.delete(roomId);
        return;
      }

      move = geneticAIMove(board, size, aiMark, humanMark, strategy);

      if (move) move.strategyId = strategy.id;
    }

    if (!move) {
      log.info(
        `AI (${aiMark}) could not find a move for room ${roomId} (Board full?)`
      );
      return;
    }

    move.value = aiMark;

    // Update db
    await Boards.updateOne(
      { roomId },
      {
        $push: { positions: { row: move.row, col: move.col, value: aiMark } },
        $set: { nextMark: humanMark },
      }
    );

    // Add delay (800ms - 1300ms)
    const delay = Math.floor(800 + Math.random() * 500);

    setTimeout(() => {
      io.to(roomId).emit('ai-move', move);
      log.info(
        `[${difficulty.toUpperCase()}] AI (${aiMark}) moved: [${move.row}, ${
          move.col
        }] in Room ${roomId}`
      );
    }, delay);
  } catch (err) {
    log.error('AI move error:', err);
  }
};
