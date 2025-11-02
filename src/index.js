require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const searchGame = require('./controllers/search_game');
const boardPositions = require('./controllers/board_positions');
const chatMessages = require('./controllers/chat_messages');
const gameEnd = require('./controllers/game_end');
const midgameLeft = require('./controllers/midgame_left');
const reconnectRoom = require('./controllers/reconnect_room');
const createAIGame = require('./controllers/create_ai_game');
const requestAIMove = require('./controllers/request_ai_move');
const cancelSearch = require('./controllers/cancel_search');
const disconnect = require('./controllers/disconnect');

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
  //  Matchmaking
  socket.on('search-game', (data) => {
    searchGame(socket, io, data);
  });

  // Cancel matchmaking
  socket.on('cancel-search', () => {
    cancelSearch(socket);
  });

  //  Chat messages
  socket.on('send-message', (data) => {
    chatMessages(io, data);
  });

  //  Update square positions in database
  socket.on('square-btn-click', (data) => {
    boardPositions(io, data.squares);
  });

  //  When game ends
  socket.on('game-end', (data) => {
    gameEnd(socket, io, data);
  });

  // Create AI vs Player game
  socket.on('create-ai-game', (data) => {
    createAIGame(socket, io, data);
  });

  // AI move event
  socket.on('request-ai-move', (data) => {
    requestAIMove(socket, io, data);
  });

  // When player left the game/disconnected mid game
  socket.on('midgame-left', (data) => {
    midgameLeft(socket, io, data);
  });

  //  When client reconnects
  socket.on('reconnect-room', (roomId) => {
    reconnectRoom(socket, io, roomId);
  });

  // When a socket disconnects
  socket.on('disconnect', () => {
    disconnect(socket, io);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };
