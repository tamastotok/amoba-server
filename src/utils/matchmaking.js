const Boards = require('../models/Boards');
const { v4: uuidv4 } = require('uuid');

// Store actively searching sockets
const waitingPlayers = new Map(); // socket.id -> socket

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
    bluePlayer: { name: blueName },
    redPlayer: { name: redName },
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

  sockets.forEach((item) => {
    const { playerMark, playerName, gridSize, starterMark } = item.data;

    if (playerMark === 'X') data.blueName = playerName;
    if (playerMark === 'O') data.redName = playerName;

    data.boardSize = gridSize;
    data.whoIsNext = starterMark;

    item.leave('lobby');
    item.leave(`${data.boardSize}-${data.whoIsNext}`);
    item.join(data.roomId);

    callback(data.blueName, data.redName, data.roomId);
  });

  makeNewBoard(data);
};

// Matchmaking
function matchmaking(room, callback) {
  for (let i = 0; i < room.length; i++) {
    for (let j = room.length - 1; j > 0; ) {
      if (!room[i + 1]) return;

      if (room[i].data.playerMark !== room[j].data.playerMark) {
        const indexOfI = room.indexOf(room[i]);
        const indexOfJ = room.indexOf(room[j]);

        joinPrivateRoom([room[i], room[j]], callback);

        // If match, delete from the waiting list
        waitingPlayers.delete(room[i].id);
        waitingPlayers.delete(room[j].id);

        room.splice(indexOfI, 1);
        room.splice(indexOfJ - 1, 1);
      } else {
        j--;
      }
    }
  }
}

// Player add/remove
function addToWaiting(socket) {
  waitingPlayers.set(socket.id, socket);
}

function removeFromWaiting(socket) {
  if (waitingPlayers.has(socket.id)) {
    waitingPlayers.delete(socket.id);
  }

  // leave all matchmaking rooms
  const roomsToLeave = ['8-X', '8-O', '10-X', '10-O', '12-X', '12-O', 'lobby'];

  roomsToLeave.forEach((room) => socket.leave(room));

  console.log(`🟡 ${socket.data?.playerName || 'Player'} canceled search`);
  socket.emit('search-canceled');
}

module.exports = {
  matchmaking,
  addToWaiting,
  removeFromWaiting,
  waitingPlayers,
};
