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

module.exports = async function leave_game(socket, io, id, result = null) {
  try {
    // Remove the game from the database
    await Boards.deleteOne({ roomId: id });
    console.log(`Board ${id} removed!`);
    playerData.roomId = '';
    playerData.positions = [];

    // Inform both players
    io.to(id).emit('leave-game');
    socket.leave(id);

    socket.to(id).emit('opponent-left', {
      message: 'Your opponent has left the game.',
      roomId: id,
    });

    console.log(`User left the game. Room: ${id}`);

    // If the AI was used in this game and the result is known → update learning
    // The client sends "game-result" before or along with leave_game
    if (result && socket.lastStrategyUsed) {
      // Load latest population if needed
      if (!population.length) {
        const latest = await loadLatestPopulation();
        population = latest.population;
        currentGeneration = latest.generation;
      }

      // Update fitness of the strategy that was used
      updateFitness(population, result, socket.lastStrategyUsed);
      gamesPlayed++;

      console.log(
        `[Learning] Strategy ${socket.lastStrategyUsed} result: ${result} (generation ${currentGeneration})`
      );

      // Every 20 games → evolve the population
      if (gamesPlayed % 20 === 0) {
        population = evolvePopulation(population);
        currentGeneration++;
        await savePopulationToDB(population, currentGeneration);

        console.log(`Population evolved → Generation ${currentGeneration}`);

        // Realtime broadcast to AI dashboard
        io.emit('ai-generation-update', {
          generation: currentGeneration,
          population,
          timestamp: new Date().toISOString(),
        });

        gamesPlayed = 0; // reset local counter
      }
    }
  } catch (error) {
    console.error('Error in leave_game:', error);
  }
};
