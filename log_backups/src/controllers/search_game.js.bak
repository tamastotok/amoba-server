const { addToWaiting } = require('../utils/matchmaking');

module.exports = function searchGame(socket, io, data) {
  try {
    // Save data for sockets
    socket.data = {
      playerName: data.playerName || 'Player',
      playerMark: data.playerMark, // 'X' or 'O'
      gridSize: data.gridSize, // 8 / 10 / 12
      starterMark: data.starterMark, // 'X' or 'O'
    };

    // Notify the client
    socket.emit('searching', socket.data);

    // Start matchmaking
    addToWaiting(socket);

    console.log(
      `${socket.data.playerName} searching for ${socket.data.gridSize}x${socket.data.gridSize} (${socket.data.playerMark}, starts: ${socket.data.starterMark})`
    );
  } catch (err) {
    console.error('Error in search_game controller:', err);
    socket.emit('search-error', { message: 'Internal server error' });
  }
};
