const mongoose = require('mongoose');

const StrategySchema = new mongoose.Schema({
  generation: Number,
  population: [
    {
      id: Number,
      weights: {
        attack: Number,
        defense: Number,
        center: Number,
        randomness: Number,
      },
      fitness: Number,
    },
  ],
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    games: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const StrategyModel = mongoose.model('AI_Strategy', StrategySchema);

module.exports = {
  StrategySchema,
  StrategyModel,
};
