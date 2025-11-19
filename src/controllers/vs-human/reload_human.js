const Boards = require('../../models/Boards');

module.exports = async function reloadHuman(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) {
    socket.emit('reconnect-failed', { message: 'Missing roomId.' });
    return;
  }

  try {
    console.log(`[HUMAN RELOAD] F5 reload for ${roomId}`);

    // Check if room and opponent exist
    const room = io.sockets.adapter.rooms.get(roomId);
    const activeCount = room ? room.size : 0;
    if (activeCount === 0) {
      await Boards.deleteOne({ roomId });
      socket.emit('reconnect-failed', {
        message: 'Opponent left. Game ended.',
      });
      return;
    }

    // Find board in db
    const boardData = await Boards.findOne({ roomId });
    if (!boardData) {
      socket.emit('reconnect-failed', { message: 'Board not found.' });
      return;
    }

    // Rejoin and restore
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
    console.log(`[HUMAN RELOAD] Restored session for ${roomId}`);
  } catch (err) {
    console.error('Error in reloadHuman:', err);
    socket.emit('reconnect-failed', { message: 'Internal server error.' });
  }
};
