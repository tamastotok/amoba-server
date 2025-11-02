const Boards = require('../models/Boards');
const { PENDING_ROOMS } = require('../utils/roomState');

module.exports = async function reconnectRoom(socket, io, roomId) {
  try {
    const board = await Boards.findOne({ roomId });
    if (!board) {
      socket.emit('reconnect-failed', { message: 'Room no longer available.' });
      return;
    }

    console.log(`Player reconnected to room ${roomId}`);
    socket.join(roomId);

    // If timeout, delete
    if (PENDING_ROOMS.has(roomId)) {
      clearTimeout(PENDING_ROOMS.get(roomId));
      PENDING_ROOMS.delete(roomId);
    }

    // Send data back
    socket.emit('reconnect-success', {
      roomId,
      boardSize: board.boardSize,
      positions: board.positions,
      whoIsNext: board.whoIsNext,
      bluePlayer: board.bluePlayer,
      redPlayer: board.redPlayer,
    });
  } catch (error) {
    console.error('Error during reconnect:', error);
  }
};
