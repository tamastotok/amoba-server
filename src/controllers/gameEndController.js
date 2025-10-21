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

    // Normal close
    endedRooms.add(roomId);
    // Send back to both players
    io.to(roomId).emit('game-ended', { winner: winner });

    // Delete Board
    await Boards.deleteOne({ roomId });
    console.log(`🏁 Game ended in room ${roomId}, winner: ${winner}`);

    // Both players leave the room
    io.in(roomId).socketsLeave(roomId);

    // Delete flag
    setTimeout(() => endedRooms.delete(roomId), 5000);
  } catch (err) {
    console.error('Error in game_end:', err);
  }
};
