const Boards = require('../models/Boards');

module.exports = async function update_positions(io, data) {
  const query = { roomId: data.roomId };
  const position = {
    row: data.row,
    col: data.col,
    value: data.value,
  };

  try {
    const updatePositions = await Boards.findOneAndUpdate(
      query,
      {
        $push: { positions: position },
        $set: { whoIsNext: data.value === 'X' ? 'O' : 'X' },
      },
      { new: true }
    );

    io.emit(`square-btn-click-${data.roomId}`, updatePositions);
  } catch (error) {
    console.log(error);
  }
};
