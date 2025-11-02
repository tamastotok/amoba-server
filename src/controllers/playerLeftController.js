const Boards = require('../models/Boards');
const playerData = require('../utils/playerData');
const {
  loadLatestPopulation,
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
} = require('../utils/ai/evolution');

let population = [];
let currentGeneration = 1;
let gamesPlayed = 0;

module.exports = async function player_left(socket, io, id, result = null) {
  try {
    // --- Remove the game from DB ---
    await Boards.deleteOne({ roomId: id });
    console.log(`🗑️ Board ${id} removed!`);
    playerData.roomId = '';
    playerData.positions = [];

    // --- Differentiate between leave reasons ---
    if (result) {
      // 🏁 Game ended normally
      console.log(`🏆 Game finished in room ${id} with result: ${result}`);

      // Don't send "opponent-left", because it's a normal finish
      io.to(id).emit('leave-game', { type: 'finished', result });

      // AI learning update if needed
      if (socket.lastStrategyUsed) {
        if (!population.length) {
          const latest = await loadLatestPopulation();
          population = latest.population;
          currentGeneration = latest.generation;
        }

        updateFitness(population, result, socket.lastStrategyUsed);
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
    } else {
      // 🚪 Player manually left mid-game
      console.log(`🚪 Player left room ${id}`);
      io.to(id).emit('leave-game', { type: 'manual' });

      socket.leave(id);
      socket.to(id).emit('opponent-left', {
        message: 'Your opponent has left the game.',
        roomId: id,
      });
    }
  } catch (error) {
    console.error('❌ Error in leave_game:', error);
  }
};
