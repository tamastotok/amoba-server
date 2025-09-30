const Boards = require('../models/Boards');

module.exports = async function restart_game(socket, io, payload) {
  try {
    const { id, lastWinner } =
      typeof payload === 'object'
        ? payload
        : { id: payload, lastWinner: undefined };

    const boardDoc = await Boards.findOne({ roomId: id });
    if (!boardDoc) {
      console.log(`No board found for room ${id}, cannot restart.`);
      return;
    }

    const boardSize = boardDoc.boardSize || 8;

    // Empty positions
    const newPositions = [];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        newPositions.push({ row, col, value: '' });
      }
    }

    // --- Loser starts the next round ---
    let nextStarter;
    if (lastWinner === 'X') {
      nextStarter = 'O';
    } else if (lastWinner === 'O') {
      nextStarter = 'X';
    } else {
      // Draw → switch based on previous player who started the game
      nextStarter = boardDoc.lastStarter === 'X' ? 'O' : 'X';
    }

    boardDoc.positions = newPositions;
    boardDoc.whoIsNext = nextStarter;
    boardDoc.lastStarter = nextStarter;
    await boardDoc.save();

    io.to(id).emit('game-restarted', {
      roomId: id,
      boardSize,
      positions: newPositions,
      whoIsNext: nextStarter,
      bluePlayer: boardDoc.bluePlayer, // blue = X
      redPlayer: boardDoc.redPlayer, // red = O
    });

    console.log(`Board ${id} restarted. Next to move: ${nextStarter}`);
  } catch (err) {
    console.log('Error in restart_game:', err);
  }
};
