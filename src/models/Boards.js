const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
  playerName: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  message: String,
});

const PositionsSchema = mongoose.Schema({
  row: Number,
  col: Number,
  value: String,
});

const BoardSchema = mongoose.Schema({
  roomId: String,
  bluePlayer: {
    name: String,
    mark: {
      type: String,
      default: 'X',
    },
  },
  redPlayer: {
    name: String,
    mark: {
      type: String,
      default: 'O',
    },
  },
  chatMessages: [ChatSchema],
  boardSize: Number,
  positions: [PositionsSchema],
  whoIsNext: String,
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3600,
  },
});

module.exports = mongoose.model('Board', BoardSchema);
