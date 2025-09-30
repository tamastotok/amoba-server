module.exports = async function disconnect(socket, io) {
  // Count online users
  const socketsCount = io.engine.clientsCount;
  io.emit('user-count', socketsCount);

  // Leave lobby
  socket.leave('lobby');

  // Check for active rooms
  const rooms = Array.from(socket.rooms);
  rooms.forEach((roomId) => {
    if (roomId !== socket.id && roomId !== 'lobby') {
      // Notify the player in the room
      socket.to(roomId).emit('opponent-left', {
        message: 'Your opponent has disconnected.',
        roomId,
      });

      console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
    }
  });
};
