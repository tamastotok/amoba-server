const Boards = require('../models/Boards');
const { PENDING_ROOMS } = require('../utils/roomState');

const {
  loadLatestPopulation,
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
} = require('../utils/ai/evolution');

// --- AI state ---
let population = [];
let currentGeneration = 1;
let gamesPlayed = 0;

module.exports = async function midgameLeft(socket, io, data) {
  const { roomId } = data || {};
  if (!roomId) return;

  try {
    console.log(`Player left midgame — room ${roomId}`);

    // If timeout, delete (restart)
    if (PENDING_ROOMS.has(roomId)) {
      clearTimeout(PENDING_ROOMS.get(roomId));
    }

    // Notify the opponent
    socket.to(roomId).emit('opponent-left', {
      message: 'Your opponent disconnected. Waiting for reconnection (60s)...',
      roomId,
    });

    // 60 sec reconnect window
    const timeout = setTimeout(async () => {
      console.log(`Room ${roomId} expired — deleting board.`);
      await Boards.deleteOne({ roomId });

      io.to(roomId).emit('match-expired', {
        message: 'Opponent did not reconnect in time. Match ended.',
      });

      PENDING_ROOMS.delete(roomId);
    }, 60_000);

    PENDING_ROOMS.set(roomId, timeout);

    // Socket disconnect from room
    socket.leave(roomId);
  } catch (error) {
    console.error('Error in midgame_left:', error);
  }
};
