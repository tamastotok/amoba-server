const Boards = require('../../models/Boards');
const { PENDING_ROOMS } = require('../../utils/roomState');

module.exports = async function leaveGameHuman(socket, io, data) {
  const { roomId } = data || {};

  try {
    console.log(
      `🚪 Player left game manually (leave-game) — room ${roomId || 'unknown'}`
    );

    if (!roomId) {
      // If the client did not send it, try to determine the room from socket.rooms
      const joinedRooms = Array.from(socket.rooms).filter(
        (r) => r !== socket.id
      );
      if (joinedRooms.length > 0) {
        roomId = joinedRooms[0];
      }
    }

    if (!roomId) {
      console.warn('No roomId found for leave-game event.');
      return;
    }

    // Remove the player from the room
    socket.leave(roomId);

    // Remove any reconnect timeout
    if (PENDING_ROOMS.has(roomId)) {
      clearTimeout(PENDING_ROOMS.get(roomId));
      PENDING_ROOMS.delete(roomId);
    }

    // Delete the match state in db
    await Boards.deleteOne({ roomId });
    console.log(`🗑️ Board for room ${roomId} deleted.`);

    // Notify the other player
    socket.to(roomId).emit('left-game-perma', {
      message: 'Opponent left the game. Match ended.',
      roomId,
    });
  } catch (error) {
    console.error('Error in leave-game:', error);
  }
};
