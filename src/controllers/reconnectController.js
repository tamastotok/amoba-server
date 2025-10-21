const Boards = require('../models/Boards');

module.exports = async function reconnect_game(socket, io, id) {
  try {
    const board = await Boards.findOne({ roomId: id });
    if (!board) return;

    socket.leave('lobby');
    socket.join(id);

    // csak az újracsatlakozó socketnek küldjük vissza
    socket.emit(`continue-${id}`, {
      roomId: id,
      boardSize: board.boardSize,
      positions: board.positions,
      whoIsNext: board.whoIsNext,
      bluePlayer: board.bluePlayer,
      redPlayer: board.redPlayer,
    });
  } catch (error) {
    console.log(error);
  }
};
