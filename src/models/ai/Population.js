const mongoose = require('mongoose');
const { StrategySchema } = require('../ai/Strategy');

const PopulationSchema = new mongoose.Schema({
  generation: Number,
  population: [StrategySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AI_Population', PopulationSchema);
