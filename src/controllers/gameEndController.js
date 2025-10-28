const Boards = require('../models/Boards');
const {
  loadLatestPopulation,
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
} = require('../utils/ai/evolution');
const { endedRooms } = require('../utils/roomState');

let population = [];
let currentGeneration = 1;
let gamesPlayed = 0;

module.exports = async function game_end(socket, io, data) {
  try {
    const { roomId, winner } = data;

    if (!roomId) {
      console.warn('⚠️ No roomId found in game_end');
      return;
    }

    // AI learning update
    if (socket.lastStrategyUsed) {
      if (!population.length) {
        const latest = await loadLatestPopulation();
        population = latest.population;
        currentGeneration = latest.generation;
      }

      updateFitness(population, winner, socket.lastStrategyUsed);
      gamesPlayed++;

      if (gamesPlayed % 20 === 0) {
        population = evolvePopulation(population);
        currentGeneration++;
        await savePopulationToDB(population, currentGeneration);

        io.emit('ai-generation-update', {
          generation: currentGeneration,
          population,
          timestamp: new Date().toISOString(),
        });

        gamesPlayed = 0;
      }
    }

    // Notify the client
    socket.emit('game-ended', { winner });

    // Delete room
    endedRooms.add(roomId);

    // DB cleanup
    await Boards.deleteOne({ roomId });
    console.log(`🏁 Game ended in room ${roomId}, winner: ${winner}`);

    // Player leave the room
    socket.leave(roomId);

    // Delete flag
    setTimeout(() => endedRooms.delete(roomId), 5000);
  } catch (err) {
    console.error('Error in game_end:', err);
  }
};
