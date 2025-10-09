const AI_Strategy = require('../../models/AI_Strategy');
const { Strategy, createInitialPopulation } = require('./genetic_ai_move');

// Fitness rating
function updateFitness(population, result, strategyId) {
  const s = population.find((p) => p.id === strategyId);
  if (!s) return;

  if (result === 'win') s.fitness += 2;
  else if (result === 'draw') s.fitness += 1;
  else if (result === 'loss') s.fitness -= 2;
}

// Selection – best 50% will survive
function selectFittest(population) {
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const survivors = sorted.slice(0, Math.ceil(sorted.length / 2));
  return survivors;
}

// Crossing
function crossover(parentA, parentB, newId) {
  const weights = {};
  for (let key in parentA.weights) {
    weights[key] =
      Math.random() < 0.5 ? parentA.weights[key] : parentB.weights[key];
  }
  const child = new Strategy(newId, weights);
  return child;
}

// Mutation
function mutate(strategy, rate = 0.2, magnitude = 0.1) {
  for (let key in strategy.weights) {
    if (Math.random() < rate) {
      const delta = (Math.random() * 2 - 1) * magnitude;
      strategy.weights[key] = Math.max(
        0,
        Math.min(1, strategy.weights[key] + delta)
      );
    }
  }
  strategy.normalize();
}

// Create new generation
function evolvePopulation(population, generationSize = 10) {
  const fittest = selectFittest(population);
  const newPopulation = [...fittest];
  let nextId = fittest.length + 1;

  while (newPopulation.length < generationSize) {
    const parentA = fittest[Math.floor(Math.random() * fittest.length)];
    const parentB = fittest[Math.floor(Math.random() * fittest.length)];
    const child = crossover(parentA, parentB, nextId++);
    mutate(child);
    newPopulation.push(child);
  }

  return newPopulation;
}

// Save in db
async function savePopulationToDB(population, generation) {
  await AI_Strategy.create({ generation, population });
  console.log(
    `Generation ${generation} saved to DB (${population.length} strategies)`
  );
}

// Load from db
async function loadLatestPopulation() {
  const latest = await AI_Strategy.findOne().sort({ generation: -1 }).lean();
  if (!latest) {
    console.log('No existing population found. Creating initial...');
    const population = createInitialPopulation(10);
    await savePopulationToDB(population, 1);
    return { generation: 1, population };
  }
  console.log(`Loaded generation ${latest.generation}`);
  return latest;
}

module.exports = {
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
  loadLatestPopulation,
};
