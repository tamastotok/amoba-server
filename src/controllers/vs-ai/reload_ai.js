const Boards = require('../../models/Boards');
const log = require('../../utils/logger');

module.exports = async function reloadAI(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) {
    socket.emit('reconnect-failed', { message: 'Missing roomId.' });
    return;
  }

  try {
    log.info(`[AI RELOAD] F5 reload for ${roomId}`);

    // Find board in db
    const boardData = await Boards.findOne({ roomId });
    if (!boardData) {
      socket.emit('reconnect-failed', { message: 'Board not found.' });
      return;
    }

    socket.join(roomId);

    const payload = {
      roomId,
      boardSize: boardData.boardSize,
      playerData: boardData.playerData,
      positions: boardData.positions,
      nextMark: boardData.nextMark,
      isReconnect: true,
    };

    socket.emit('reconnect-success', payload);
    log.info(`[AI RELOAD] Restored session for ${roomId}`);
  } catch (err) {
    log.error('Error in reloadAI:', err);
    socket.emit('reconnect-failed', { message: 'Internal server error.' });
  }
};
