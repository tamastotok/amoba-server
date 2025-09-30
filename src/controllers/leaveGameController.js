const Boards = require('../models/Boards');
const playerData = require('../utils/playerData');

module.exports = async function leave_game(socket, io, id) {
  //  Delete game from database
  try {
    await Boards.deleteOne({ roomId: id });
    console.log(`Board ${id} removed!`);
    playerData.roomId = '';
    playerData.positions = [];
  } catch (error) {
    console.log(error);
  }

  //  Leave sockets from room
  io.to(id).emit('leave-game');
  socket.leave(id);

  socket.to(id).emit('opponent-left', {
    message: 'Your opponent has left the game.',
    roomId: id,
  });

  console.log('User left the game.');
};
