module.exports = {
  population: [],
  currentGeneration: 1,
  gamesPlayed: 0,
  strategyPerRoom: new Map(),
  POPULATION_SIZE: 64,
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
    games: 0,
  },
  fitness: 0,
};
