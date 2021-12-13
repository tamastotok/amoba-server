const select_sockets = require('../utils/selectSockets');
const matchmaking = require('../utils/matchmaking');
const playerData = require('../utils/playerData');

module.exports = async function search_game(socket, io, data) {
  playerData.gridSize = data.gridSize;
  playerData.starterMark = data.starterMark;
  //  Give data object to the socket
  socket.data = data;
  socket.emit('searching', socket.data);

  //  Put sockets into different rooms based on their settings
  select_sockets(data.gridSize, data.starterMark, socket);

  try {
    const room_8_X = [...(await io.in('8-X').fetchSockets())];
    const room_8_O = [...(await io.in('8-O').fetchSockets())];
    const room_10_X = [...(await io.in('10-X').fetchSockets())];
    const room_10_O = [...(await io.in('10-O').fetchSockets())];
    const room_12_X = [...(await io.in('12-X').fetchSockets())];
    const room_12_O = [...(await io.in('12-O').fetchSockets())];

    //  Send data to clients that matched
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
