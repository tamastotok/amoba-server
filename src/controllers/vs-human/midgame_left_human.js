const Boards = require('../../models/Boards');
const { PENDING_ROOMS } = require('../../utils/room_state');
const log = require('../../utils/logger');

module.exports = async function midgameLeftHuman(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) return;

  try {
    log.info(`[Human] Player left midgame — room ${roomId}`);

    // Delete pending
    if (PENDING_ROOMS.has(roomId)) {
      clearTimeout(PENDING_ROOMS.get(roomId));
    }

    socket.leave(roomId);

    // Send event to the player who left
    socket.emit('you-left', {
      message: 'You have left the game. Do you want to reconnect?',
      roomId,
      reconnectWindow: 30,
    });

    // Notify the opponent
    socket.to(roomId).emit('opponent-left', {
      message: 'Your opponent disconnected. Waiting for reconnection...',
      roomId,
      reconnectWindow: 30,
    });

    // Reconnect window
    const timeout = setTimeout(async () => {
      log.info(`[Human] Room ${roomId} expired — deleting board.`);
      await Boards.deleteOne({ roomId });

      io.to(roomId).emit('match-expired', {
        message: 'Opponent did not reconnect in time. Match ended.',
      });

      PENDING_ROOMS.delete(roomId);
    }, 30_000);

    PENDING_ROOMS.set(roomId, timeout);
  } catch (error) {
    log.error('Error in midgameLeftHuman:', error);
  }
};
