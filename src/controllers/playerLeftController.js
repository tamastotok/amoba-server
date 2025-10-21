const Boards = require('../models/Boards');
const playerData = require('../utils/playerData');
const { endedRooms } = require('../utils/roomState');

module.exports = async function player_left(socket, io, data) {
  try {
    const { roomId } = data;
    if (!roomId) return;

    if (endedRooms.has(roomId)) {
      // If game ended normally
      return;
    }

    await Boards.deleteOne({ roomId });
    console.log(`🚪 Player left room ${roomId}`);
    playerData.roomId = '';
    playerData.positions = [];

    socket.leave(roomId);

    // Send notification to the other player
    socket.to(roomId).emit('opponent-left', {
      message: 'Your opponent has left the game.',
      roomId,
    });
  } catch (error) {
    console.error('Error in player_left:', error);
  }
};
