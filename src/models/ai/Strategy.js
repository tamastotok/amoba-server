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
  createdAt: { type: Date, default: Date.now },
});

const StrategyModel = mongoose.model('AI_Strategy', StrategySchema);

module.exports = {
  StrategySchema,
  StrategyModel,
};
