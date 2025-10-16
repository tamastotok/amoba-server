const playerData = require('../utils/playerData');
const select_sockets = require('../utils/selectSockets');
const { matchmaking, addToWaiting } = require('../utils/matchmaking');

module.exports = async function search_game(socket, io, data) {
  playerData.gridSize = data.gridSize;
  playerData.starterMark = data.starterMark;

  socket.data = data;
  socket.emit('searching', socket.data);

  // Register to waiting list
  addToWaiting(socket);

  // Sorting sockets
  select_sockets(data.gridSize, data.starterMark, socket);

  try {
    const room_8_X = [...(await io.in('8-X').fetchSockets())];
    const room_8_O = [...(await io.in('8-O').fetchSockets())];
    const room_10_X = [...(await io.in('10-X').fetchSockets())];
    const room_10_O = [...(await io.in('10-O').fetchSockets())];
    const room_12_X = [...(await io.in('12-X').fetchSockets())];
    const room_12_O = [...(await io.in('12-O').fetchSockets())];

    const sendDataToAllSockets = (blueName, redName, roomId) => {
      playerData.roomId = roomId;
      playerData.blueName = blueName;
      playerData.redName = redName;
      playerData.positions = [];

      io.to(roomId).emit('game-found', {
        roomId,
        playerData,
      });
    };

    matchmaking(room_8_X, sendDataToAllSockets);
    matchmaking(room_8_O, sendDataToAllSockets);
    matchmaking(room_10_X, sendDataToAllSockets);
    matchmaking(room_10_O, sendDataToAllSockets);
    matchmaking(room_12_X, sendDataToAllSockets);
    matchmaking(room_12_O, sendDataToAllSockets);
  } catch (error) {
    console.log(error);
  }
};
