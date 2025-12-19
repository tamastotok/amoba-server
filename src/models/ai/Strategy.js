const mongoose = require('mongoose');

const StrategySchema = new mongoose.Schema({
  generation: { type: Number, required: true },

  population: [
    {
      id: Number,

      weights: {
        center: Number,
        randomness: Number,

        myLine2: Number,
        myLine3: Number,
        myLine4: Number,

        blockLine2: Number,
        blockLine3: Number,
        blockLine4: Number,
      },

      fitness: { type: Number, default: 0 },

      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
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
