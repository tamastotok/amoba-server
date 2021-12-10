const Boards = require('../models/Boards');

module.exports = async function refresh_game(socket, io, id) {
  try {
    const findDB = await Boards.findOne({ roomId: id });
    socket.leave('lobby');
    socket.join(id);
    io.emit(`continue-${id}`, findDB);
  } catch (error) {
    console.log(error);
  }
};
