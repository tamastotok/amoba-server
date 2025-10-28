const Boards = require('../models/Boards');
const { v4: uuidv4 } = require('uuid');
const playerData = require('../utils/playerData');
const request_ai_move = require('./request_ai_move');

module.exports = async function create_ai_game(socket, io, data) {
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
    await Boards.create({
      roomId,
      bluePlayer: { name: blueName, mark: 'X' },
      redPlayer: { name: redName, mark: 'O' },
      boardSize: size,
      difficulty,
      positions: [],
      whoIsNext: starterMark,
    });

    // Join room
    socket.join(roomId);

    // Server side session data
    playerData.roomId = roomId;
    playerData.positions = [];
    playerData.boardSize = size;
    playerData.playerName = playerName;
    playerData.playerMark = playerMark;
    playerData.aiMark = aiMark;
    playerData.starterMark = starterMark;
    playerData.difficulty = difficulty;
    playerData.blueName = blueName;
    playerData.redName = redName;

    // Send data to client
    io.to(socket.id).emit('ai-game-created', {
      roomId,
      boardSize: size,
      starterMark,
      playerData: {
        blueName,
        redName,
      },
    });

    console.log(
      `AI game [${difficulty}] created (roomId: ${roomId}) | Player=${playerMark}(${playerName}), AI=${aiMark}, Starter=${starterMark}`
    );

    // If AI starts, AI move sends to client immediately
    if (starterMark === aiMark) {
      await request_ai_move(socket, io, { roomId, playerMark });
      // playerMark = controller calculate AI's mark from this
    }
  } catch (error) {
    console.error('Error creating AI game:', error);
    socket.emit('error', { message: 'Failed to create AI game' });
  }
};
