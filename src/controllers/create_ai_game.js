const Boards = require('../models/Boards');
const { v4: uuidv4 } = require('uuid');
const requestAIMove = require('./request_ai_move');
const log = require('../utils/logger');

module.exports = async function createAIGame(socket, io, data) {
  try {
    const roomId = uuidv4();

    const playerName = data.playerName || 'Player';
    const playerMark = data.playerMark; // 'X' or 'O'
    const aiMark = playerMark === 'X' ? 'O' : 'X'; // opposite mark
    const starterMark = data.starterMark || 'X'; // who starts
    const difficulty = data.difficulty || 'easy';
    const size = data.gridSize;

    // X = blue, O = red
    const blueName = playerMark === 'X' ? playerName : 'AI';
    const redName = playerMark === 'O' ? playerName : 'AI';

    // Create board in db
    const board = new Boards({
      roomId,
      boardSize: size,
      playerData: {
        bluePlayer: { name: blueName, mark: 'X' },
        redPlayer: { name: redName, mark: 'O' },
      },
      difficulty,
      positions: [],
      nextMark: starterMark,
    });

    try {
      await board.save();
    } catch (error) {
      log.error('Failed to create new board:', error);
    }

    // Join room
    socket.join(roomId);

    const payload = {
      roomId,
      boardSize: size,
      starterMark,
      playerMark,
      playerData: {
        bluePlayer: { name: blueName },
        redPlayer: { name: redName },
      },
      positions: [],
      isReconnect: false,
    };

    // Send data to client
    io.to(socket.id).emit('ai-game-created', payload);

    log.ai(
      `Game [${difficulty}] created (roomId: ${roomId}) | Player=${playerMark}(${playerName}), AI=${aiMark}, Starter=${starterMark}`
    );

    // If AI starts, AI move sends to client immediately
    if (starterMark === aiMark) {
      await requestAIMove(socket, io, { roomId, playerMark });
      // playerMark = controller calculate AI's mark from this
    }
  } catch (error) {
    log.error('Error creating AI game:', error);
  }
};
