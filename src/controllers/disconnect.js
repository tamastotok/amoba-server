const midgameLeft = require('./midgame_left');

module.exports = async function disconnect(socket, io) {
  try {
    const socketsCount = io.engine.clientsCount;
    io.emit('user-count', socketsCount);

    // Always left the lobyy
    socket.leave('lobby');

    // Check every active rooms
    const rooms = Array.from(socket.rooms);

    for (const roomId of rooms) {
      if (roomId !== socket.id && roomId !== 'lobby') {
        console.log(`${socket.id} disconnected from ${roomId}`);

        // Same logic as if the player left manually
        await midgameLeft(socket, io, roomId);
      }
    }
  } catch (err) {
    console.error('Error in disconnect handler:', err);
  }
};
