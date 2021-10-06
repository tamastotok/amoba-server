const mongoose = require('mongoose');

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
  boardSize: Number,
  positions: [Object],
  whoIsNext: String,
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3600,
  },
});

module.exports = mongoose.model('Board', BoardSchema);
