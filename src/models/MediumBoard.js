const mongoose = require('mongoose');

const MediumBoardSchema = mongoose.Schema({
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
  boardSize: {
    type: Number,
    default: 10,
  },
  X_Positions: [String],
  O_Positions: [String],
  whosNext: String,
  winner: String,
});

module.exports = mongoose.model('MediumBoards', MediumBoardSchema);
