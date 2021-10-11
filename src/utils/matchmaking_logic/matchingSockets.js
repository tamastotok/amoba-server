const Boards = require('../../models/Boards');

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

module.exports = function (array, callback) {
  for (let i = 0; i < array.length; i++) {
    for (let j = array.length - 1; j > 0; ) {
      // return if the array has only 1 item
      if (!array[i + 1]) return;

      if (array[i].data.playerMark !== array[j].data.playerMark) {
        //  store index of the elements that match
        const indexOfI = array.indexOf(array[i]);
        const indexOfJ = array.indexOf(array[j]);

        //  if match (X and O) or (O and X) => join private room
        switchRoom([array[i], array[j]], callback);

        //  remove matched elements from the array
        array.splice(indexOfI, 1);
        array.splice(indexOfJ - 1, 1);
      } else {
        j--;
      }
    }

    return;
  }
};
