const Boards = require('../../models/Boards');
const { PENDING_ROOMS } = require('../../utils/roomState');

module.exports = async function reconnectAI(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) {
    socket.emit('reconnect-failed', { message: 'Missing roomId.' });
    return;
  }

  try {
    console.log(`[AI RECONNECT] Attempt for room ${roomId}`);

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
    console.log(`[AI RECONNECT] Success for ${roomId}`);
  } catch (err) {
    console.error('Error in reconnectAI:', err);
    socket.emit('reconnect-failed', { message: 'Internal server error.' });
  }
};
