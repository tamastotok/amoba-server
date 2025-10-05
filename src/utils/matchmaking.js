const Boards = require('../models/Boards');
const { v4: uuidv4 } = require('uuid');

const data = {
  roomId: '',
  blueName: '',
  redName: '',
  boardSize: null,
  whoIsNext: '',
};

const makeNewBoard = async (data) => {
  const { roomId, blueName, redName, boardSize, whoIsNext } = data;

  const board = new Boards({
    roomId,
    bluePlayer: {
      name: blueName,
    },
    redPlayer: {
      name: redName,
    },
    boardSize,
    whoIsNext,
  });

  try {
    await board.save();
  } catch (error) {
    throw new Error(error);
  }
};

const joinPrivateRoom = (sockets, callback) => {
  data.roomId = uuidv4();

  sockets.map((item) => {
    const { playerMark, playerName, gridSize, starterMark } = item.data;
    //  Store names based on player marks
    if (playerMark === 'X') data.blueName = playerName;
    if (playerMark === 'O') data.redName = playerName;
    data.boardSize = gridSize;
    data.whoIsNext = starterMark;

    //  Leave sockets from every room then join matched sockets to private room
    item.leave('lobby');
    item.leave(`${data.boardSize}-${data.whoIsNext}`);
    item.join(data.roomId);

    //  Function for send data with socket.io to client
    callback(data.blueName, data.redName, data.roomId);
  });

  //  Create new board in database
  makeNewBoard(data);
};

module.exports = function matchmaking(room, callback) {
  for (let i = 0; i < room.length; i++) {
    for (let j = room.length - 1; j > 0; ) {
      // return if the room has only 1 item
      if (!room[i + 1]) return;

      if (room[i].data.playerMark !== room[j].data.playerMark) {
        //  store index of the sockets that match
        const indexOfI = room.indexOf(room[i]);
        const indexOfJ = room.indexOf(room[j]);

        //  if match (X and O) or (O and X) => join private room
        joinPrivateRoom([room[i], room[j]], callback);

        //  remove matched sockets from the room
        room.splice(indexOfI, 1);
        room.splice(indexOfJ - 1, 1);
      } else {
        j--;
      }
    }
  }
};
