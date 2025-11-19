const Boards = require('../../models/Boards');
const { PENDING_ROOMS } = require('../../utils/roomState');

module.exports = async function leaveGameAI(socket, io, data) {
  try {
    let { roomId } = data || {};

    console.log(
      `🤖 [AI] Player left game manually — room ${roomId || 'unknown'}`
    );

    // If no roomId was provided, try to infer it from socket.rooms
    if (!roomId) {
      const joined = Array.from(socket.rooms).filter((r) => r !== socket.id);
      if (joined.length > 0) {
        roomId = joined[0];
      }
    }

    if (!roomId) {
      console.warn('[AI] leave-game-ai: No roomId found.');
      return;
    }

    // Remove the player from the room
    socket.leave(roomId);

    // Remove reconnect timeout
    if (PENDING_ROOMS.has(roomId)) {
      clearTimeout(PENDING_ROOMS.get(roomId));
      PENDING_ROOMS.delete(roomId);
    }

    // Delete board
    await Boards.deleteOne({ roomId });
    console.log(`🗑️ [AI] Board deleted for room ${roomId}`);
  } catch (err) {
    console.error('Error in leaveGameAI:', err);
  }
};
