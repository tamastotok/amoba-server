const Boards = require('../models/Boards');
const { StrategyModel } = require('../models/ai/Strategy');

const {
  loadLatestPopulation,
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
  getNextGenerationId,
} = require('../utils/ai/evolution');
const { endedRooms } = require('../utils/room_state');
const aiState = require('../utils/ai_state');
const log = require('../utils/logger');

module.exports = async function gameEnd(socket, io, data) {
  try {
    const { roomId, result } = data;

    if (!roomId) return;

    // AI Logic (HARD)
    const strategyId = aiState.strategyPerRoom.get(roomId);

    if (strategyId) {
      // Load population
      if (!aiState.population.length) {
        const latest = await loadLatestPopulation();
        aiState.population.length = 0;
        aiState.population.push(...latest.population);
        aiState.currentGeneration = latest.generation;
      }

      // 3. Fitnes update (in memory)
      switch (result) {
        case 'player':
          updateFitness(aiState.population, 'loss', strategyId);
          aiState.stats.losses++;
          break;
        case 'ai':
          updateFitness(aiState.population, 'win', strategyId);
          aiState.stats.wins++;
          break;
        default:
          updateFitness(aiState.population, 'draw', strategyId);
          aiState.stats.draws++;
      }

      aiState.stats.games++;
      aiState.gamesPlayed++;

      // Save data in memory (Every game)
      try {
        await StrategyModel.updateOne(
          { generation: aiState.currentGeneration },
          {
            $set: {
              population: aiState.population,
              stats: aiState.stats,
            },
          }
        );
      } catch (err) {
        log.error('Database saving error:', err);
      }

      // Switch generation when reach limit
      if (aiState.gamesPlayed >= aiState.population.length) {
        // Evolution
        aiState.population = evolvePopulation(aiState.population);

        // Get correct next ID from DB
        aiState.currentGeneration = await getNextGenerationId();

        // Reset Stats
        aiState.stats = { wins: 0, losses: 0, draws: 0, games: 0 };
        aiState.gamesPlayed = 0;

        // Create new generation in DB-ben
        await savePopulationToDB(
          aiState.population,
          aiState.currentGeneration,
          aiState.stats
        );

        io.emit('ai-generation-update', {
          generation: aiState.currentGeneration,
          population: aiState.population,
          stats: aiState.stats,
          timestamp: new Date().toISOString(),
        });
      }

      aiState.strategyPerRoom.delete(roomId);
    }

    // Cleanup...
    socket.emit('game-ended');
    endedRooms.add(roomId);
    await Boards.deleteOne({ roomId });
    log.info(`Game ended in room ${roomId}, winner: ${result}`);
    socket.leave(roomId);
    setTimeout(() => endedRooms.delete(roomId), 5000);
  } catch (err) {
    log.error('Error in game_end:', err);
  }
};
