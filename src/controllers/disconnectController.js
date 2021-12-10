module.exports = async function disconnect(socket, io) {
  // Send how many users are online to client
  const socketsCount = io.engine.clientsCount;

  io.emit('user-count', socketsCount);
  socket.leave('lobby');
};
