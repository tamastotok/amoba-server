const { endedRooms } = require('../utils/roomState');

module.exports = async function disconnect(socket, io) {
  try {
    // Update online user count
    const socketsCount = io.engine.clientsCount;
    io.emit('user-count', socketsCount);

    // Always leave lobby
    socket.leave('lobby');

    // Check which rooms the socket was in
    const rooms = Array.from(socket.rooms);

    for (const roomId of rooms) {
      if (roomId !== socket.id && roomId !== 'lobby') {
        // 👉 csak akkor küldjük, ha a játék még nem ért véget normálisan
        if (!endedRooms.has(roomId)) {
          socket.to(roomId).emit('opponent-left', {
            message: 'Your opponent has disconnected.',
            roomId,
          });
          console.log(
            `🔴 Socket ${socket.id} disconnected from active room ${roomId}`
          );
        } else {
          console.log(
            `✅ Room ${roomId} already ended, no disconnect message sent.`
          );
        }

        socket.leave(roomId);
      }
    }
  } catch (err) {
    console.error('❌ Error in disconnect handler:', err);
  }
};
