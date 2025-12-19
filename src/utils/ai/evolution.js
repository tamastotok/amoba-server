const { StrategyModel } = require('../../models/ai/Strategy');
const { Strategy, createInitialPopulation } = require('../ai/genetic_ai_move');
const { POPULATION_SIZE, stats } = require('../ai_state');
const log = require('../logger');

// Fitness rating
function updateFitness(population, result, strategyId) {
  const sid = Number(strategyId);
  const s = population.find((p) => p.id === sid);

  if (!s) return;

  s.wins ??= 0;
  s.losses ??= 0;
  s.draws ??= 0;

  if (result === 'win') {
    s.fitness += 2;
    s.wins++;
  } else if (result === 'draw') {
    s.fitness += 1;
    s.draws++;
  } else {
    s.fitness -= 2;
    s.losses++;
  }
}

// Selection – best 50% will survive
function selectFittest(population) {
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const survivors = sorted.slice(0, Math.ceil(sorted.length / 2));
  return survivors;
}

// Crossing - uniform crossing
// Independent genes (attack, defense, etc.)
// Small size - limited variation with single-point crossover
function crossover(parentA, parentB, newId) {
  const weights = {};
  // Check every attribute - attack, defense, center
  for (let key in parentA.weights) {
    // 50% chance parentA - 50% chance parentB
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
function evolvePopulation(population, generationSize = POPULATION_SIZE) {
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

// Save in db + notify dashboard
async function savePopulationToDB(population, generation) {
  await StrategyModel.create({ population, generation, stats });
  log.info(
    `Generation ${generation} saved to DB (${population.length} strategies)`
  );
}

function normalizePopulation(pop) {
  return (pop ?? []).map((s, i) => ({
    id: Number(s.id ?? s.strategyId ?? i + 1),
    weights: { ...(s.weights ?? {}) },
    fitness: Number(s.fitness ?? 0),
  }));
}

// Load from db
async function loadLatestPopulation() {
  const latest = await StrategyModel.findOne().sort({ generation: -1 }).lean();
  if (!latest) {
    log.warn('No existing population found. Creating initial...');
    const raw = createInitialPopulation(POPULATION_SIZE);
    const population = normalizePopulation(raw);

    await savePopulationToDB(population, 1);
    return { generation: 1, population };
  }
  latest.population = normalizePopulation(latest.population);
  return latest;
}

// Check gen ids
async function getNextGenerationId() {
  const latest = await StrategyModel.findOne().sort({ generation: -1 }).lean();
  return latest ? latest.generation + 1 : 1;
}

module.exports = {
  updateFitness,
  evolvePopulation,
  savePopulationToDB,
  loadLatestPopulation,
  getNextGenerationId,
};
