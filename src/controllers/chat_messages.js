const Boards = require('../models/Boards');

module.exports = async function chatMessages(io, data) {
  const query = { roomId: data.roomId };
  const update = {
    $push: {
      chat: {
        playerName: data.playerName,
        message: data.message,
      },
    },
  };
  const options = { new: true };

  try {
    const data = await Boards.findOneAndUpdate(query, update, options);

    io.emit(`update-messages-${data.roomId}`, data.chat);
  } catch (error) {
    console.log(error);
  }
};
