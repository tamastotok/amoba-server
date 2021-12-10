module.exports = async function join_lobby(socket, io) {
  // Send how many users are online to client
  const socketsCount = io.engine.clientsCount;

  io.emit('user-count', socketsCount);
  socket.join('lobby');
};
