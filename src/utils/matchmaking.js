const Boards = require('../models/Boards');
const { v4: uuidv4 } = require('uuid');

// Waiting players
const waitingPlayers = []; // every searching socket goes here (array, not Map)

// --- Helper: Board creation ---
async function makeNewBoard({
  roomId,
  boardSize,
  nextMark,
  blueName,
  redName,
}) {
  const board = new Boards({
    roomId,
    boardSize,
    playerData: {
      bluePlayer: { name: blueName, mark: 'X' },
      redPlayer: { name: redName, mark: 'O' },
    },
    positions: [],
    nextMark,
  });

  try {
    await board.save();
  } catch (error) {
    console.error('Failed to create new board:', error);
  }
}

// Player add/remove
function addToWaiting(socket) {
  // Prevent socket for duplicate searching
  if (waitingPlayers.find((s) => s.id === socket.id)) return;

  waitingPlayers.push(socket);

  setTimeout(() => {
    tryMatch();
  }, 100);
}

function removeFromWaiting(socket) {
  const idx = waitingPlayers.findIndex((p) => p.id === socket.id);
  if (idx !== -1) waitingPlayers.splice(idx, 1);

  socket.emit('search-canceled');
  console.log(`${socket.data?.playerName || 'Player'} canceled search`);
}

// Matchmaking
function tryMatch() {
  if (waitingPlayers.length < 2) return;

  for (let i = 0; i < waitingPlayers.length; i++) {
    for (let j = i + 1; j < waitingPlayers.length; j++) {
      const p1 = waitingPlayers[i];
      const p2 = waitingPlayers[j];

      // Waiting for both socket to get data from client
      if (!p1?.data || !p2?.data) continue;

      const sameBoard = p1.data.gridSize === p2.data.gridSize;
      const oppositeMarks = p1.data.playerMark !== p2.data.playerMark;
      const sameStarter = p1.data.starterMark === p2.data.starterMark;

      console.log(
        'Checking:',
        `${p1.data.playerName} (${p1.data.playerMark}, starts ${p1.data.starterMark}) vs ${p2.data.playerName} (${p2.data.playerMark}, starts ${p2.data.starterMark})`
      );

      if (sameBoard && oppositeMarks && sameStarter) {
        console.log(
          'Match created between',
          p1.data.playerName,
          'and',
          p2.data.playerName
        );
        createRoom(p1, p2);
        waitingPlayers.splice(j, 1);
        waitingPlayers.splice(i, 1);
        return;
      }
    }
  }
}

// Room creation and notify clients
function createRoom(playerA, playerB) {
  const roomId = uuidv4();
  const { gridSize } = playerA.data;

  let blueName, redName, nextMark;

  // Player mark mapping (X -> blue, O -> red)
  if (playerA.data.playerMark === 'X') {
    blueName = playerA.data.playerName;
    redName = playerB.data.playerName;
  } else {
    blueName = playerB.data.playerName;
    redName = playerA.data.playerName;
  }

  // Determine who starts based on agreed starterMark
  nextMark = playerA.data.starterMark; // can be 'X' or 'O'

  // Join both players to the room
  playerA.join(roomId);
  playerB.join(roomId);

  // Save to DB
  makeNewBoard({ roomId, blueName, redName, boardSize: gridSize, nextMark });

  // Build payload to send back to clients
  const payload = {
    roomId,
    boardSize: gridSize,
    starterMark: nextMark,
    playerData: {
      bluePlayer: { name: blueName },
      redPlayer: { name: redName },
    },
    positions: [],
    isReconnect: false,
  };

  // Notify both players
  playerA.emit('game-found', payload);
  playerB.emit('game-found', payload);

  console.log(
    `Match created: ${blueName} (X) vs ${redName} (O) | ${gridSize}x${gridSize} | starts: ${nextMark}`
  );
}
module.exports = {
  addToWaiting,
  removeFromWaiting,
  waitingPlayers,
};
