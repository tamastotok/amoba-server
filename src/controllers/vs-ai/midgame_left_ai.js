const Boards = require('../../models/Boards');
const { PENDING_ROOMS } = require('../../utils/roomState');

module.exports = async function midgameLeftAI(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) return;

  try {
    console.log(`🟡 [AI] Player left midgame — room ${roomId}`);

    // Delete pending
    if (PENDING_ROOMS.has(roomId)) {
      clearTimeout(PENDING_ROOMS.get(roomId));
    }

    socket.leave(roomId);

    // Send event to the player who left
    socket.emit('you-left', {
      message: 'You have left the AI match. Do you want to reconnect?',
      roomId,
      reconnectWindow: 30,
    });

    // Reconnect window
    const timeout = setTimeout(async () => {
      console.log(`⚫ [AI] Room ${roomId} expired — deleting board.`);
      await Boards.deleteOne({ roomId });

      io.to(roomId).emit('match-expired', {
        message: 'You did not reconnect in time. Match ended.',
      });

      PENDING_ROOMS.delete(roomId);
    }, 30_000);

    PENDING_ROOMS.set(roomId, timeout);
  } catch (error) {
    console.error('Error in midgameLeftAI:', error);
  }
};
