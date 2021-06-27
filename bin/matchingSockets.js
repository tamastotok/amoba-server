const players = {
  blueName: '',
  redName: '',
};

const switchRoom = (sockets, callback) => {
  const roomId = Math.random().toString(36).substr(2, 9);
  sockets.map((item) => {
    const { playerMark, playerName, gridSize, starterMark } = item.data;
    //  Store names based on player marks
    if (playerMark === 'X') players.blueName = playerName;
    if (playerMark === 'O') players.redName = playerName;

    //  Leave every room
    item.leave('lobby');
    item.leave(`${gridSize}-${starterMark}`);

    //  Join to private room
    item.join(roomId);
    callback(players, roomId);
  });
};

module.exports = function (array, callback) {
  //  Matchmaking
  for (let i = 0; i < array.length; ) {
    if (!array[i + 1]) return;

    if (
      array[i].data.playerMark === 'X' &&
      array[i + 1].data.playerMark === 'O'
    ) {
      switchRoom([array[i], array[i + 1]], callback);
      array.splice(i, 2);
    } else if (
      array[i].data.playerMark === 'O' &&
      array[i + 1].data.playerMark === 'X'
    ) {
      switchRoom([array[i], array[i + 1]], callback);
      array.splice(i, 2);
    } else i++;
  }
};
