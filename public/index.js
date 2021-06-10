const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
};
const io = require('socket.io')(httpServer, options);
const PORT = process.env.PORT || 5000;

const validRoomIds = [];

io.on('connection', (socket) => {
  io.emit('server-online', true);
  console.log('user connected');
  const count = io.engine.clientsCount;

  socket.on('connect-to-server', () => {
    console.log(count);
    io.emit('user-connected', count);
  });

  //  Get squares position and value from client
  socket.on('square-btn-click', (data) => {
    io.emit(`square-btn-click-${data.squares.link}`, data);
  });

  //  Create room
  socket.on('create-game', (data) => {
    const roomId = Math.random().toString(36).substr(2, 9);
    const hostGameData = {
      roomId: roomId,
      hostName: data.hostName,
      hostMark: data.hostMark,
      joinName: '',
      joinMark: data.hostMark === 'X' ? 'O' : 'X',
      starterMark: data.starterMark,
      gridSize: data.gridSize,
    };

    validRoomIds.push(hostGameData);

    socket.emit('create-game-response', hostGameData);
    socket.join(roomId);
    console.log(`game created at ${roomId}`);
  });

  // Join room
  socket.on('join-game', (data) => {
    const roomIdPool = validRoomIds.map((item) => item.roomId);

    if (roomIdPool.includes(data.gameId)) {
      const index = roomIdPool.indexOf(data.gameId);
      validRoomIds[index].joinName = data.name;
      socket.join(data.gameId);

      socket.emit(
        'join-game-settings',
        (res = {
          joinMark: validRoomIds[index].joinMark,
          starterMark: validRoomIds[index].starterMark,
        })
      );

      io.to(data.gameId).emit('game-found', validRoomIds[index]);
      console.log('game found');
      validRoomIds.splice(validRoomIds.indexOf(index), 1);
    } else {
      socket.emit('invalid-id', 'Invalid game id');
      console.log('invalid code');
    }
  });

  socket.on('leave-session', (id) => {
    io.to(id).emit('leave-session');
    socket.leave(id);

    validRoomIds.map((item) => {
      if (item.roomId === id) {
        validRoomIds.splice(validRoomIds.indexOf(item), 1);
      }
    });

    console.log('game disbanded');
  });
});

httpServer.listen(PORT);
