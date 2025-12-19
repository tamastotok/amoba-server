const mongoose = require('mongoose');
const { StrategyModel } = require('../models/ai/Strategy');
require('dotenv').config();

const POPULATION_SIZE = 64;

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function randn() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function createGenerationData(genConfig) {
  const { generation, fitnessBase, fitnessVar, weightBias } = genConfig;
  const population = [];

  for (let id = 1; id <= POPULATION_SIZE; id++) {
    const genWeight = (target) => clamp(target + randn() * 0.05, 0, 1);

    const weights = {
      center: genWeight(weightBias.center),
      randomness: genWeight(weightBias.randomness),

      myLine2: genWeight(weightBias.myLine2),
      myLine3: genWeight(weightBias.myLine3),
      myLine4: genWeight(weightBias.myLine4),

      blockLine2: genWeight(weightBias.blockLine2),
      blockLine3: genWeight(weightBias.blockLine3),
      blockLine4: genWeight(weightBias.blockLine4),
    };

    const fitness = Math.round(fitnessBase + randn() * fitnessVar);

    population.push({
      id,
      weights,
      fitness,
      wins: Math.max(0, Math.round(fitness / 3)),
      losses: Math.max(0, Math.round(10 - fitness / 3)),
      draws: Math.floor(Math.random() * 2),
    });
  }

  const totalWins = population.reduce((acc, p) => acc + p.wins, 0);
  const totalLosses = population.reduce((acc, p) => acc + p.losses, 0);

  return {
    generation,
    population,
    stats: {
      wins: totalWins,
      losses: totalLosses,
      draws: population.reduce((acc, p) => acc + p.draws, 0),
      games: totalWins + totalLosses,
    },
    createdAt: new Date(),
  };
}

// Set evolutions
const generationsToSeed = [
  {
    generation: 1,
    fitnessBase: -15,
    fitnessVar: 10,
    weightBias: {
      center: 0.8,
      randomness: 0.4,
      myLine2: 0.1,
      myLine3: 0.1,
      myLine4: 0.1,
      blockLine2: 0.1,
      blockLine3: 0.1,
      blockLine4: 0.1,
    },
  },
  {
    generation: 2,
    fitnessBase: 5,
    fitnessVar: 15,
    weightBias: {
      center: 0.6,
      randomness: 0.15,
      myLine2: 0.3,
      myLine3: 0.5,
      myLine4: 0.6,
      blockLine2: 0.3,
      blockLine3: 0.5,
      blockLine4: 0.6,
    },
  },
  {
    generation: 3,
    fitnessBase: 40,
    fitnessVar: 10,
    weightBias: {
      center: 0.3,
      randomness: 0.01,
      myLine2: 0.3,
      myLine3: 0.8,
      myLine4: 1.5,
      blockLine2: 0.3,
      blockLine3: 0.8,
      blockLine4: 1.5,
    },
  },
];

async function main() {
  const mongoUri = process.env.URI;
  if (!mongoUri) throw new Error('Missing MONGO_URI env var');

  await mongoose.connect(mongoUri);
  console.log('Connected to DB.');

  await StrategyModel.deleteMany({});
  console.log('Cleared old strategies.');

  for (const config of generationsToSeed) {
    const doc = createGenerationData(config);
    await StrategyModel.create(doc);
    console.log(
      `Seeded Generation ${config.generation} (Avg Fitness: ${config.fitnessBase})`
    );
  }

  console.log('Done! Database seeded with 3 evolutionary steps.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
