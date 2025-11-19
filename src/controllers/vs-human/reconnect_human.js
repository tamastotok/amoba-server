const Boards = require('../../models/Boards');
const { PENDING_ROOMS } = require('../../utils/roomState');

module.exports = async function reconnectHuman(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) {
    socket.emit('reconnect-failed', { message: 'Missing roomId.' });
    return;
  }

  try {
    console.log(`[HUMAN RECONNECT] Attempt for room ${roomId}`);

    // Check if opponent is still waiting (one active socket)
    const room = io.sockets.adapter.rooms.get(roomId);
    const activeCount = room ? room.size : 0;
    if (activeCount === 0) {
      await Boards.deleteOne({ roomId });
      socket.emit('reconnect-failed', {
        message: 'Opponent left. Game ended.',
      });
      return;
    }
    if (activeCount !== 1) {
      socket.emit('reconnect-failed', { message: 'Opponent not waiting.' });
      return;
    }

    // Find board in db
    const boardData = await Boards.findOne({ roomId });
    if (!boardData) {
      socket.emit('reconnect-failed', { message: 'Board not found.' });
      return;
    }

    // Timer validation (active reconnect window)
    const timer = PENDING_ROOMS.get(roomId);
    if (!timer) {
      socket.emit('reconnect-failed', { message: 'Reconnect window expired.' });
      return;
    }

    // Rejoin and clear timer
    socket.join(roomId);
    clearTimeout(timer);
    PENDING_ROOMS.delete(roomId);

    const payload = {
      roomId,
      boardSize: boardData.boardSize,
      playerData: boardData.playerData,
      positions: boardData.positions,
      nextMark: boardData.nextMark,
      isReconnect: true,
    };

    socket.emit('reconnect-success', payload);
    socket.to(roomId).emit('opponent-reconnected', {
      message: 'Your opponent reconnected.',
    });

    console.log(`[HUMAN RECONNECT] Success for ${roomId}`);
  } catch (err) {
    console.error('Error in reconnectHuman:', err);
    socket.emit('reconnect-failed', { message: 'Internal server error.' });
  }
};
