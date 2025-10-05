const Boards = require('../models/Boards');
const { v4: uuidv4 } = require('uuid');
const playerData = require('../utils/playerData');

module.exports = async function create_ai_game(socket, io, data) {
  try {
    // Generate roomId
    const roomId = uuidv4();

    // Create new game in db
    await Boards.create({
      roomId,
      bluePlayer: {
        name: data.playerName || 'Player',
        mark: data.playerMark,
      },
      redPlayer: {
        name: 'AI',
        mark: data.playerMark === 'X' ? 'O' : 'X',
      },
      boardSize: data.gridSize,
      difficulty: data.difficulty || 'easy',
      positions: [],
      whoIsNext: data.starterMark,
    });

    // Join to room
    socket.join(roomId);

    // Send roomid to clients
    io.to(socket.id).emit('ai-game-created', { roomId, playerData });

    console.log(
      `AI game created (roomId: ${roomId}) by ${data.playerName || 'Player'}`
    );
  } catch (error) {
    console.error('Error creating AI game:', error);
    socket.emit('error', { message: 'Failed to create AI game' });
  }
};
