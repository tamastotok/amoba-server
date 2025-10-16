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

module.exports = mongoose.model('AI_Strategy', StrategySchema);

const PopulationSchema = new mongoose.Schema({
  generation: Number,
  population: [StrategySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Population', PopulationSchema);
