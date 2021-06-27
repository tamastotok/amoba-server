const app = require('express')();
const httpServer = require('http').createServer(app);
const separateSockets = require('../bin/separateSockets');
const matchingSockets = require('../bin/matchingSockets');

/*
  For develop, change the cors origin to your local client url,
  example: 'http://localhost:3000'
*/

const options = {
  cors: {
    //origin: 'http://localhost:3000',
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST'],
  },
};
const io = require('socket.io')(httpServer, options);
const PORT = process.env.PORT || 5000;

//  Rooms for game modes
let room8X,
  room8O,
  room10X,
  room10O,
  room12X,
  room12O = [];

io.on('connection', async (socket) => {
  io.emit('server-status', true);

  const socketsCount = io.engine.clientsCount;
  socket.on('join-lobby', () => {
    io.emit('user-count', socketsCount);
    socket.join('lobby');
    //console.log('User has connected to lobby.');
  });

  //  Get squares position and value from client
  socket.on('square-btn-click', (data) => {
    io.emit(`square-btn-click-${data.squares.roomId}`, data);
  });

  //  Matchmaking
  socket.on('search-game', async (data) => {
    //  Give data object to the socket
    socket.data = data;
    socket.emit('searching', socket.data);

    //  Put sockets into different rooms based on their settings
    separateSockets(socket, data);

    try {
      const fetch8X = await io.in('8-X').fetchSockets();
      const fetch8O = await io.in('8-O').fetchSockets();
      const fetch10X = await io.in('10-X').fetchSockets();
      const fetch10O = await io.in('10-O').fetchSockets();
      const fetch12X = await io.in('12-X').fetchSockets();
      const fetch12O = await io.in('12-O').fetchSockets();
      //  Put sockets into array
      room8X = fetch8X.map((item) => item);
      room8O = fetch8O.map((item) => item);
      room10X = fetch10X.map((item) => item);
      room10O = fetch10O.map((item) => item);
      room12X = fetch12X.map((item) => item);
      room12O = fetch12O.map((item) => item);
    } catch (error) {
      console.log(error);
    }

    const sendDataToAllSockets = (players, roomId) => {
      io.to(roomId).emit('game-found', { players, roomId });
    };

    matchingSockets(room8X, sendDataToAllSockets);
    matchingSockets(room8O, sendDataToAllSockets);
    matchingSockets(room10X, sendDataToAllSockets);
    matchingSockets(room10O, sendDataToAllSockets);
    matchingSockets(room12X, sendDataToAllSockets);
    matchingSockets(room12O, sendDataToAllSockets);
  });

  socket.on('leave-game', (id) => {
    io.to(id).emit('leave-game');
    socket.leave(id);
    //console.log('User left the game.');
  });
});

httpServer.listen(PORT);
