const Boards = require('../models/Boards');
const midgameLeftHuman = require('./vs-human/midgame_left_human');
const midgameLeftAI = require('../controllers/vs-ai/midgame_left_ai');

module.exports = async function disconnect(socket, io) {
  try {
    const socketsCount = io.engine.clientsCount;
    io.emit('user-count', socketsCount);

    socket.leave('lobby');

    const rooms = Array.from(socket.rooms);

    for (const roomId of rooms) {
      if (roomId === socket.id || roomId === 'lobby') continue;

      console.log(`🔻 ${socket.id} disconnecting from room ${roomId}`);

      try {
        const board = await Boards.findOne({ roomId });

        if (!board) {
          console.warn(
            `⚠️ No board found for room ${roomId} during disconnect.`
          );
          continue;
        }

        // Determining the game mode
        const isAI =
          board.mode === 'ai' ||
          board.isAI === true ||
          !!board.aiConfig ||
          board.redPlayer?.type === 'AI' ||
          board.bluePlayer?.type === 'AI';

        // During disconnect, the client's socket is already closing —
        // Controller will notify the opponent and handle the reconnect window.
        const payload = { roomId };

        if (isAI) {
          await midgameLeftAI(socket, io, payload);
        } else {
          await midgameLeftHuman(socket, io, payload);
        }
      } catch (innerErr) {
        console.error(
          `❌ Error handling room ${roomId} on disconnect:`,
          innerErr
        );
      }
    }
  } catch (err) {
    console.error('❌ Error in disconnect handler:', err);
  }
};
