require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const join_lobby = require('./controllers/joinLobbyController');
const search_game = require('./controllers/searchGameController');
const update_positions = require('./controllers/updatePositionsController');
const update_messages = require('./controllers/updateMessagesController');
const game_end = require('./controllers/gameEndController');
const player_left = require('./controllers/playerLeftController');
const reconnect_game = require('./controllers/reconnectController');
const disconnect = require('./controllers/disconnectController');
const create_ai_game = require('./controllers/create_ai_game');
const request_ai_move = require('./controllers/request_ai_move');
const cancel_search = require('./controllers/cancelSearchController');

const PORT = process.env.PORT || 5000;
const URI = process.env.URI;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

//  Connect database
mongoose
  .connect(URI)
  .then(() => console.log('Connected to database!'))
  .catch((error) => console.log(error));

// API endpoints
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

//  Socket functions
io.on('connection', (socket) => {
  // Send how many sockets connecting back to the clients
  join_lobby(socket, io);

  //  Matchmaking
  socket.on('search-game', (data) => {
    search_game(socket, io, data);
  });

  // Cancel matchmaking
  socket.on('cancel-search', () => {
    cancel_search(socket);
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
  socket.on('game-end', (data) => {
    game_end(socket, io, data);
  });

  //  When client refreshed
  socket.on('reconnect', (id) => {
    reconnect_game(socket, io, id);
  });

  //  Disconnect from server
  socket.on('disconnect', () => {
    disconnect(socket, io);
  });

  // Create AI vs Player game
  socket.on('create-ai-game', (data) => {
    create_ai_game(socket, io, data);
  });

  // AI move event
  socket.on('request-ai-move', (data) => {
    request_ai_move(socket, io, data);
  });

  // When player left the game
  socket.on('player-left', (data) => {
    player_left(socket, io, data);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };
