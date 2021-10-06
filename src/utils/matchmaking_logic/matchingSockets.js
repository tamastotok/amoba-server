const Boards = require('../../models/Boards');
//const { gridSize, starterMark } = require('../playerData');

const players = {
  blueName: '',
  redName: '',
};

let roomSize = null;
let whoIsNext = '';

const switchRoom = (sockets, callback) => {
  const roomId = Math.random().toString(36).substr(2, 9);

  sockets.map((item) => {
    const { playerMark, playerName, gridSize, starterMark } = item.data;
    //  Store names based on player marks
    if (playerMark === 'X') players.blueName = playerName;
    if (playerMark === 'O') players.redName = playerName;
    roomSize = gridSize;
    whoIsNext = starterMark;
    //  Leave sockets from every room
    item.leave('lobby');
    item.leave(`${gridSize}-${starterMark}`);

    //  Join the paired sockets to private room
    item.join(roomId);

    //  Function for send data with socket.io to client
    callback(players, roomId);
  });

  //  Create new database
  const newBoard = new Boards({
    roomId: roomId,
    bluePlayer: {
      name: players.blueName,
    },
    redPlayer: {
      name: players.redName,
    },
    boardSize: roomSize,
    whoIsNext: whoIsNext,
  });

  newBoard.save().catch((error) => {
    throw new Error(error);
  });
};

//  Matchmaking
module.exports = function (array, callback) {
  for (let i = 0; i < array.length; ) {
    // return if array has 1 item only
    if (!array[i + 1]) return;

    // array[0,1]===[X,O] => join private room
    if (
      array[i].data.playerMark === 'X' &&
      array[i + 1].data.playerMark === 'O'
    ) {
      switchRoom([array[i], array[i + 1]], callback);
      array.splice(i, 2);
    } else if (
      // array[0,1]===[O,X] => join private room
      array[i].data.playerMark === 'O' &&
      array[i + 1].data.playerMark === 'X'
    ) {
      switchRoom([array[i], array[i + 1]], callback);
      array.splice(i, 2);
    } else {
      // array[0,1]===[O,O] or [X,X] => check the array again at +1 position (array[1,2])
      i++;
    }
  }
};
