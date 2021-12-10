//  Put every sockets into rooms depends on grid size and what mark starts the game

module.exports = function select_sockets(size, mark, socket) {
  if (size === 8 && mark === 'X') return socket.join('8-X');
  if (size === 8 && mark === 'O') return socket.join('8-O');
  if (size === 10 && mark === 'X') return socket.join('10-X');
  if (size === 10 && mark === 'O') return socket.join('10-O');
  if (size === 12 && mark === 'X') return socket.join('12-X');
  if (size === 12 && mark === 'O') return socket.join('12-O');
};
