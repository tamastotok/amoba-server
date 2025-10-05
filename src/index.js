const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const mongoose = require('mongoose');
require('dotenv').config();

const join_lobby = require('./controllers/joinLobbyController');
const search_game = require('./controllers/searchGameController');
const update_positions = require('./controllers/updatePositionsController');
const update_messages = require('./controllers/updateMessagesController');
const leave_game = require('./controllers/leaveGameController');
const restart_game = require('./controllers/restartGameController');
const refresh_game = require('./controllers/refreshController');
const disconnect = require('./controllers/disconnectController');
const create_ai_game = require('./controllers/create_ai_game');
const request_ai_move = require('./controllers/request_ai_move');

const PORT = process.env.PORT || 5000;
const URI = process.env.URI;
const options = {
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST'],
  },
};

const io = require('socket.io')(httpServer, options);

//  Connect database
mongoose
  .connect(URI)
  .then(() => console.log('Connected to database!'))
  .catch((error) => console.log(error));

//  Socket functions
io.on('connection', (socket) => {
  // Send how many sockets connecting back to the clients
  join_lobby(socket, io);

  //  Matchmaking
  socket.on('search-game', (data) => {
    search_game(socket, io, data);
  });

  //  Chat messages
  socket.on('send-message', (data) => {
    update_messages(io, data);
  });

  //  Update square positions in database
  socket.on('square-btn-click', (data) => {
    update_positions(io, data.squares);
  });

  //  When game ends
  socket.on('leave-game', (id) => {
    leave_game(socket, io, id);
  });

  //  When game restarted
  socket.on('restart-game', (payload) => {
    restart_game(socket, io, payload);
  });

  //  When client refreshed
  socket.on('reconnect', (id) => {
    refresh_game(socket, io, id);
  });

  //  Disconnect from server
  socket.on('disconnect', () => {
    disconnect(socket, io);
  });

  socket.on('create-ai-game', (data) => {
    create_ai_game(socket, io, data);
  });

  socket.on('request-ai-move', (data) => {
    request_ai_move(socket, io, data);
  });
});

httpServer.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
