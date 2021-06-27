//  Put every sockets into rooms depends on grid size and what mark starts the game

module.exports = function (socket, data) {
  if (data.gridSize === 8 && data.starterMark === 'X') {
    socket.join('8-X');
  }

  if (data.gridSize === 8 && data.starterMark === 'O') {
    socket.join('8-O');
  }

  if (data.gridSize === 10 && data.starterMark === 'X') {
    socket.join('10-X');
  }

  if (data.gridSize === 10 && data.starterMark === 'O') {
    socket.join('10-O');
  }

  if (data.gridSize === 12 && data.starterMark === 'X') {
    socket.join('12-X');
  }

  if (data.gridSize === 12 && data.starterMark === 'O') {
    socket.join('12-O');
  }
};
