const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const mongoose = require('mongoose');
require('dotenv').config();
const separateSockets = require('./utils/matchmaking_logic/separateSockets');
const matchingSockets = require('./utils/matchmaking_logic/matchingSockets');
const playerData = require('./utils/playerData');
const Boards = require('./models/Boards');

const PORT = process.env.PORT || 5000;
const URI = process.env.URI;
const options = {
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'DELETE'],
  },
};

const io = require('socket.io')(httpServer, options);

//  Connect database
mongoose.connect(URI, () => console.log('Connected to database!'));

//  Socket functions
io.on('connection', (socket) => {
  // Send how many users are online to client
  const socketsCount = io.engine.clientsCount;
  socket.on('join-lobby', () => {
    io.emit('user-count', socketsCount);
    socket.join('lobby');
    //console.log('User has connected to lobby.');
  });
  //

  //  Matchmaking   //
  socket.on('search-game', async (data) => {
    playerData.gridSize = data.gridSize;
    playerData.starterMark = data.starterMark;
    //  Give data object to the socket
    socket.data = data;
    socket.emit('searching', socket.data);

    //  Put sockets into different rooms based on their settings
    separateSockets(socket, data);

    try {
      const room_8_X = [...(await io.in('8-X').fetchSockets())];
      const room_8_O = [...(await io.in('8-O').fetchSockets())];
      const room_10_X = [...(await io.in('10-X').fetchSockets())];
      const room_10_O = [...(await io.in('10-O').fetchSockets())];
      const room_12_X = [...(await io.in('12-X').fetchSockets())];
      const room_12_O = [...(await io.in('12-O').fetchSockets())];

      //  Send data to clients that matched
      const sendDataToAllSockets = (players, roomId) => {
        playerData.roomId = roomId;
        playerData.blueName = players.blueName;
        playerData.redName = players.redName;
        playerData.positions = [];

        io.to(roomId).emit('game-found', {
          roomId,
          playerData,
        });
        console.log('game found');
      };

      matchingSockets(room_8_X, sendDataToAllSockets);
      matchingSockets(room_8_O, sendDataToAllSockets);
      matchingSockets(room_10_X, sendDataToAllSockets);
      matchingSockets(room_10_O, sendDataToAllSockets);
      matchingSockets(room_12_X, sendDataToAllSockets);
      matchingSockets(room_12_O, sendDataToAllSockets);
    } catch (error) {
      console.log(error);
    }
  });

  //  Get squares position and then update database
  socket.on('square-btn-click', async (data) => {
    console.log(data);

    const query = { roomId: data.squares.roomId };
    const position = {
      row: data.squares.row,
      col: data.squares.col,
      value: data.squares.value,
    };

    try {
      const updatePositions = await Boards.findOneAndUpdate(
        query,
        {
          $push: { positions: position },
          $set: { whoIsNext: data.squares.value === 'X' ? 'O' : 'X' },
        },
        { new: true }
      );
      await updatePositions.save();
    } catch (error) {
      console.log(error);
    }

    io.emit(
      `square-btn-click-${data.squares.roomId}`,
      await Boards.findOne(query)
    );
  });

  //  When game ends
  socket.on('leave-game', async (id) => {
    //  Delete game from database
    try {
      await Boards.deleteOne({ roomId: id });
      console.log(`Board ${id} removed!`);
      playerData.roomId = ''; //??? Maybe not need
      playerData.positions = [];
    } catch (error) {
      console.log(error);
    }

    //  Leave sockets from room
    io.to(id).emit('leave-game');
    socket.leave(id);
    console.log('User left the game.');
  });

  //  When client refreshed
  socket.on('reconnect', async (id) => {
    try {
      const findDB = await Boards.findOne({ roomId: id });
      socket.leave('lobby'); //??? Maybe it's not necessary
      socket.join(id);
      io.emit(`continue-${id}`, await Boards.findOne({ roomId: id }));
    } catch (error) {
      console.log(error);
    }
  });
});

httpServer.listen(PORT);
